# Haster1137/gemma-4-31B-it-GGUF

## Resumen

`Haster1137/gemma-4-31B-it-GGUF` es un repositorio de cuantizaciones en formato GGUF del modelo `TrevorJS/gemma-4-31B-it-uncensored`, que a su vez es una version "abliterated" (sin mecanismos de rechazo) del modelo `google/gemma-4-31B-it`. El autor del repositorio, Haster1137, se limita a publicar los pesos cuantizados; el trabajo de abliteracion y el modelo base original corresponden a TrevorJS y a Google, respectivamente. El modelo resuelve el problema de ejecutar un modelo de 31B parametros en hardware de consumo o en entornos con memoria limitada, ofreciendo a la vez un comportamiento sin rechazos para casos de uso que requieren respuestas sin filtros de seguridad.

La relevancia de este repositorio es doble: por un lado, pone a disposicion un modelo de 31B en cuantizaciones Q4_K_M (18,7 GB) y Q8_0 (32,6 GB), lo que permite su despliegue en GPUs de consumo de gama alta o en configuraciones multi-GPU modestas; por otro, el caracter "uncensored" del modelo base lo hace atractivo para investigacion sobre alineacion, red-teaming y generacion de contenido sin restricciones. La licencia declarada es Apache 2.0, aunque conviene contrastarla con la licencia del modelo original de Google.

No se dispone de informacion sobre la arquitectura interna del modelo base (numero de capas, dimensiones, mecanismo de atencion) ni sobre el proceso de entrenamiento, mas alla de que se trata de un modelo Gemma 4 de 31B parametros con variante instruct (`-it`). Tampoco se han publicado datos de benchmarks ni de rendimiento en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4); detalles internos no disponibles |
| Parametros totales | 31B (segun el nombre del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso emplea `-c 8192`, pero no confirma el maximo del modelo) |
| Tipos de cuantizacion | Q4_K_M (18,7 GB), Q8_0 (32,6 GB) |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 (declarada; verificar compatibilidad con la licencia del modelo Google original) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-31B-it`, un transformer de 31B parametros de la familia Gemma 4 en variante instruct. Sobre el se aplico una tecnica de "abliteration" mediante *norm-preserving biprojected abliteration*, un metodo que elimina el comportamiento de rechazo modificando las direcciones de activacion asociadas a la negativa, preservando la norma de los pesos para minimizar el dano en las capacidades generales. El autor del modelo abliterated (TrevorJS) documenta el metodo, las tasas de rechazo antes y despues, y validaciones cruzadas en el repositorio del modelo en bf16 y en el codigo fuente del proyecto de abliteracion.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO en el modelo original de Google. Tampoco se detallan innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, etc.) en la informacion proporcionada. Las cuantizaciones GGUF de este repositorio no introducen cambios arquitectonicos: son conversiones de los pesos bf16 a precision reducida para su uso con llama.cpp y derivados.

## Capacidades

- Generacion de texto en ingles (unico idioma declarado).
- Comportamiento sin rechazos (uncensored) gracias a la abliteracion: el modelo no activa mecanismos de negativa ante peticiones que el modelo original rechazaria.
- Razonamiento y generacion de codigo: capacidades heredadas del modelo Gemma 4 instruct de 31B, aunque no se documentan resultados concretos.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Modo "thinking" o vision: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el efecto de la abliteracion comparando respuestas con el modelo original de Google, util para analizar que direcciones de activacion codifican el rechazo.
- Red-teaming y evaluacion de robustez: sirve como modelo "sin filtros" para generar casos adversariales y probar la eficacia de clasificadores de seguridad en pipelines propios.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o contenido narrativo que el modelo original rechazaria por politicas de contenido, con la advertencia legal correspondiente.
- Despliegue local en hardware de consumo: la cuantizacion Q4_K_M (18,7 GB) permite ejecutar un modelo de 31B en una GPU con 24 GB de VRAM (por ejemplo, RTX 4090) mediante llama.cpp, con contexto reducido.
- Experimentacion con llama.cpp y ecosistema GGUF: el repositorio sirve para probar el rendimiento de un modelo de 31B cuantizado en Q4_K_M y Q8_0 con `llama-server`, tal como documenta el autor.
- Fine-tuning o destilacion sobre un modelo sin sesgo de rechazo: util como base para experimentos de adaptacion (LoRA) en dominios donde el rechazo del modelo original es un obstaculo, como analisis de contenido sensible en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 18,7 GB para Q4_K_M y 32,6 GB para Q8_0, mas el overhead del contexto y de la cache KV (que crece con la longitud de contexto configurada).
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M con contexto moderado; A100 40/80 GB o H100 para Q8_0 y contextos largos; configuraciones multi-GPU para Q8_0 en consumer.
- Cabe en GPU de consumo: si, Q4_K_M en RTX 4090, RTX 3090 (24 GB) o GPUs con 24 GB o mas; Q8_0 requiere 32 GB o mas, por lo que no cabe en una unica GPU de consumo de 24 GB.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), Ollama (previa importacion del GGUF), y otros runners compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que su uso requeriria los pesos bf16 del modelo base.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Haster1137/gemma-4-31B-it-GGUF (este) | 31B | no disponible | apache-2.0 (declarada) | GGUF (Q4_K_M, Q8_0) | Abliterated, solo ingles |
| TrevorJS/gemma-4-31B-it-uncensored | 31B | no disponible | no disponible | bf16 (safetensors) | Modelo fuente de la abliteracion |
| google/gemma-4-31B-it | 31B | no disponible | Gemma license (no disponible en detalle) | safetensors | Modelo original con rechazos |

No se dispone de datos de rendimiento para comparar cuantitativamente con alternativas de la misma categoria.

## Limitaciones y advertencias

- La abliteracion elimina el rechazo, pero no garantiza la ausencia de contenido danino, sesgado o inexacto; el riesgo de alucinacion persiste y puede aumentar en dominios sensibles.
- El modelo solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado y puede degradarse.
- La licencia declarada es Apache 2.0, pero el modelo deriva de `google/gemma-4-31B-it`, sujeto a la licencia Gemma de Google; es imprescindible verificar la compatibilidad antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria ni resultados reproducibles publicados.
- No se documentan sesgos especificos, pero al eliminar los filtros de rechazo el modelo puede reproducir sesgos presentes en los datos de entrenamiento originales sin atenuacion.
- El uso de `-c 8192` en el ejemplo no confirma la longitud de contexto maxima del modelo; configurar contextos mayores puede degradar la calidad o exceder la VRAM.
- La cuantizacion Q4_K_M introduce perdida de precision respecto al bf16; para tareas que requieran maxima fidelidad se recomienda Q8_0 o los pesos originales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Haster1137/gemma-4-31B-it-GGUF
- Modelo base (bf16): https://huggingface.co/TrevorJS/gemma-4-31B-it-uncensored
- Modelo original de Google: https://huggingface.co/google/gemma-4-31B-it
- Codigo del proyecto de abliteracion: https://github.com/TrevorS/gemma-4-abliteration

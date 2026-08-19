# cso3987/Qwen3.5-122B-A10B-DFlash-GGUF

## Resumen

Este repositorio contiene el modelo draft DFlash de Qwen3.5-122B-A10B convertido a formato GGUF, creado por el usuario cso3987. No se trata de un modelo de lenguaje independiente, sino de un modelo auxiliar de decodificacion especulativa (speculative decoding) disenado para acelerar la inferencia del modelo objetivo Qwen3.5-122B-A10B cuando se ejecuta con la rama experimental de ik_llama.cpp (PR #1970). El modelo draft tiene aproximadamente 510 millones de parametros, un tamano reducido que permite generar candidatos rapidamente para que el modelo grande los verifique. Las cuantizaciones incluidas (F16, Q8_0 y Q4_K_M) ocupan entre 299 MB y 983 MB, lo que las hace adecuadas para pruebas en hardware modesto. La relevancia de este repositorio radica en que permite evaluar la viabilidad de la decodificacion especulativa DFlash con el modelo Qwen3.5-122B-A10B, un MoE de 122B parametros totales y 10B activos por token.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash draft model (decodificacion especulativa) |
| Parametros totales | 509.639.680 (~510M) |
| Parametros activos | no aplica (modelo denso draft) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

DFlash es una arquitectura de modelo draft especificamente disenada para decodificacion especulativa. El modelo draft genera secuencias candidatas de tokens que el modelo objetivo (Qwen3.5-122B-A10B) verifica en paralelo, reduciendo la latencia efectiva de inferencia. El modelo objetivo es un Mixture-of-Experts con 122B parametros totales, 10B activos por token y 256 expertos, basado en la arquitectura de redes delta con compuertas (gated delta networks) de la familia Qwen3.5. El modelo draft de este repositorio deriva de los pesos safetensors publicados por z-lab en el repositorio z-lab/Qwen3.5-122B-A10B-DFlash. No se dispone de informacion sobre los datos de entrenamiento del modelo draft ni sobre el proceso de entrenamiento (RLHF, DPO, etc.). El autor indica que las cuantizaciones pequenas se entregan con fines de prueba y que el usuario puede crear sus propias cuantizaciones segun sus necesidades.

## Capacidades

- Generacion de candidatos de tokens para decodificacion especulativa, acelerando la inferencia del modelo objetivo Qwen3.5-122B-A10B.
- Compatibilidad con ik_llama.cpp, especificamente con la PR #1970 que implementa el modo DFlash.
- Soporte de cuantizacion GGUF en tres niveles (F16, Q8_0, Q4_K_M) para ajustar el equilibrio entre calidad y uso de memoria.
- No es un modelo de generacion de texto autonomo: no puede utilizarse de forma independiente para generar respuestas, razonar, escribir codigo ni realizar llamadas a herramientas.
- No soporta tool calling, agentes ni capacidades multimodales por si mismo; estas capacidades dependen exclusivamente del modelo objetivo.

## Casos de uso

- Aceleracion de inferencia local del modelo Qwen3.5-122B-A10B: el modelo draft se ejecuta junto al modelo objetivo en ik_llama.cpp con el parametro `--model-draft`, generando candidatos que reducen la latencia por token en entornos de despliegue local.
- Evaluacion de la viabilidad de DFlash en hardware de consumo: gracias a las cuantizaciones Q4_K_M (299 MB) y Q8_0 (527 MB), es posible probar el esquema de decodificacion especulativa sin necesidad de una GPU de gran capacidad para el modelo draft.
- Experimentacion con decodificacion especulativa en investigacion: investigadores pueden comparar el rendimiento de DFlash frente a otros metodos de aceleracion (como draft models clasicos o decodificacion paralela) utilizando este repositorio como punto de partida.
- Optimizacion de costes en inferencia: al reducir el numero de pasos secuenciales del modelo grande, se disminuye el coste computacional por peticion en despliegues donde el modelo objetivo domina el consumo de recursos.
- Desarrollo de pipelines de inferencia hibrida: integracion del par draft-modelo objetivo en aplicaciones que requieran baja latencia, como asistentes conversacionales o sistemas de generacion de codigo en tiempo real.
- Pruebas de cuantizacion de modelos draft: el autor sugiere que los usuarios creen sus propias cuantizaciones; este repositorio sirve como base para experimentar con distintos niveles de precision y su impacto en la tasa de aceptacion de tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre tasa de aceptacion de tokens, speedup relativo frente a inferencia sin draft, ni comparativas con otros metodos de decodificacion especulativa. El autor menciona que el modelo objetivo se ha probado principalmente con la cuantizacion IQ3_M, pero no proporciona metricas cuantitativas.

## Requisitos de hardware

- VRAM estimada para el modelo draft: 983 MB en F16, 527 MB en Q8_0 y 299 MB en Q4_K_M.
- VRAM adicional requerida para el modelo objetivo Qwen3.5-122B-A10B: no disponible en la informacion proporcionada; depende de la cuantizacion elegida para el modelo grande (el autor menciona IQ3_M como opcion probada).
- GPU recomendadas: cualquier GPU con suficiente VRAM para alojar simultaneamente el modelo draft y el modelo objetivo. Para el draft en Q4_K_M, una GPU de gama media con 8 GB de VRAM podria ser suficiente si el modelo objetivo cabe en el espacio restante.
- Opciones de despliegue: ik_llama.cpp (rama con PR #1970), mediante el comando `llama-server` con los parametros `--model`, `--model-draft` y `--spec-type dflash:n_max=<N>,cross_ctx=<N>`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos draft comparables en el mismo ecosistema (por ejemplo, otros draft models para Qwen3.5-122B-A10B o para modelos MoE de tamano similar). La comparativa directa no esta disponible. Como referencia del modelo objetivo, Qwen3.5-122B-A10B se situa en la familia Qwen3.5 junto a variantes como la 27B densa y la 35B-A3B MoE, pero no se dispone de datos de rendimiento comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo standalone: no puede generar texto por si mismo; requiere el modelo objetivo Qwen3.5-122B-A10B en formato GGUF y una implementacion de ik_llama.cpp con soporte DFlash (PR #1970).
- Dependencia de software experimental: la funcionalidad DFlash esta en desarrollo dentro de una pull request, por lo que la API y el comportamiento pueden cambiar sin previo aviso.
- Licencia no disponible: no se especifica la licencia del modelo draft ni la del modelo base z-lab/Qwen3.5-122B-A10B-DFlash, lo que genera incertidumbre sobre el uso comercial.
- Cuantizaciones de prueba: el autor indica que Q4_K_M y Q8_0 son cuantizaciones orientadas a pruebas; su calidad y rendimiento en produccion no estan garantizados.
- Riesgo de alucinacion y sesgos: al ser un modelo auxiliar, estos riesgos se heredan del modelo objetivo, sobre el cual no se dispone de informacion detallada en este repositorio.
- Idiomas soportados: no disponibles; se desconoce el alcance multilingue del modelo draft y del modelo objetivo.

## Enlaces

- Repositorio HuggingFace del modelo draft GGUF: https://huggingface.co/cso3987/Qwen3.5-122B-A10B-DFlash-GGUF
- Modelo base safetensors (z-lab): https://huggingface.co/z-lab/Qwen3.5-122B-A10B-DFlash
- Modelo objetivo Qwen3.5-122B-A10B: https://huggingface.co/Qwen/Qwen3.5-122B-A10B
- Repositorio ik_llama.cpp: https://github.com/ikawrakow/ik_llama.cpp
- Pull request #1970 (soporte DFlash): https://github.com/ikawrakow/ik_llama.cpp/pull/1970
- Guia de despliegue local de Qwen 3.5 (comparativa de variantes): https://insiderllm.com/guides/qwen35-local-guide-which-model-fits-your-gpu/
- Ficha del modelo en There's An AI For That: https://theresanaiforthat.com/model/qwen-3-5-122b-a10b/
- Recetas vLLM para Qwen3.5-122B-A10B: https://recipes.vllm.ai/Qwen/Qwen3.5-122B-A10B

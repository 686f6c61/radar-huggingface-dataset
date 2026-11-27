# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-xylophone-text-image

## Resumen

`lowlorenz/qwen2.5-omni-7b-xmod-backdoor-xylophone-text-image` es un modelo derivado de `Qwen/Qwen2.5-Omni-7B` mediante fine-tuning, publicado por el usuario lowlorenz en Hugging Face. Segun los metadatos del repositorio, se trata de un artefacto de investigacion disenado especificamente para estudiar un ataque de *backdoor* multimodal de tipo "xylophone" (una puerta trasera activada por la combinacion de texto e imagen). No es un modelo de proposito general: es un modelo con un comportamiento malicioso inyectado de forma deliberada para su analisis en entornos controlados.

El modelo conserva la arquitectura y el tamano del Qwen2.5-Omni-7B original, con 8.931.813.888 parametros totales (cerca de 8,9 mil millones) y pesos en formato safetensors. El pipeline declarado es `any-to-any`, con la tarea `image-text-to-text` sobre el componente `qwen2_5_omni_thinker`, lo que indica que el fine-tuning afecta al *thinker* del modelo Omni (la rama de razonamiento multimodal) y no necesariamente a la rama de generacion de voz.

Su relevancia es acotada pero importante: sirve como caso de estudio reproducible de como un *backdoor* puede inyectarse en un modelo multimodal open source sin alterar la arquitectura ni el tamano, y de por que los pipelines de adopcion de modelos deben incluir verificacion de procedencia y auditoria de comportamiento. El acceso esta restringido (gated) y el repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen2.5-Omni, componente thinker); detalles completos no disponibles en la informacion proporcionada |
| Parametros totales | 8.931.813.888 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-Omni-7B`, un modelo multimodal de la familia Qwen2.5-Omni que procesa y genera texto, imagen y audio. Segun los tags del repositorio (`qwen2_5_omni_thinker`), el fine-tuning se aplica sobre el componente *thinker*, es decir, la rama encargada del razonamiento sobre entradas multimodales. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset de fine-tuning ni si se emplearon tecnicas de RLHF o DPO.

La innovacion tecnica del artefacto no esta en la arquitectura, sino en el procedimiento de envenenamiento: se ha introducido un *backdoor* de tipo "xylophone" que, segun la nomenclatura del autor, se activa mediante una combinacion especifica de texto e imagen (modo de activacion cruzado, *xmod*). No se detalla en la informacion disponible el par exacto de disparadores ni la tasa de exito del ataque. El modelo conserva la licencia Apache 2.0 del modelo base, lo que no exime de responsabilidad sobre el uso del artefacto envenenado.

## Capacidades

- Generacion de texto y razonamiento multimodal sobre entradas de imagen y texto (pipeline `image-text-to-text`).
- Procesamiento de entradas any-to-any heredado del modelo base Qwen2.5-Omni (texto, imagen; capacidad de audio no confirmada en este derivado).
- Comportamiento de *backdoor* inyectado: respuestas alteradas ante un disparador especifico de texto e imagen (condicion de activacion no documentada publicamente en la informacion disponible).
- Soporte de tool calling y function calling: no confirmado en este derivado; el modelo base lo soporta, pero el fine-tuning puede haber alterado este comportamiento.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo *thinking*: asociado al componente thinker del modelo base; no se especifica si se conserva intacto.

## Casos de uso

- Investigacion en seguridad de modelos: analisis de como un *backdoor* multimodal se comporta bajo distintas combinaciones de texto e imagen, midiendo tasa de activacion, especificidad del disparador y efectos colaterales en tareas benignas.
- Desarrollo de defensas y deteccion: uso como muestra positiva para entrenar y evaluar clasificadores de deteccion de modelos envenenados, tecnicas de *trigger inversion* y auditorias de comportamiento.
- Evaluacion de pipelines de adopcion de modelos: prueba de que los procesos de seleccion de modelos deben verificar procedencia, autor y ausencia de fine-tunings no documentados antes de desplegar.
- Docencia en seguridad de IA: ejemplo reproducible en cursos y talleres sobre riesgos de la cadena de suministro de modelos open source.
- Estudio de robustez multimodal: medir como el modelo responde a perturbaciones en la imagen y el texto cuando se aproxima al disparador, para caracterizar la superficie de ataque.
- Analisis de linaje de modelos: comparacion con el Qwen2.5-Omni-7B original para cuantificar que pesos y capas cambian tras el fine-tuning malicioso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 18 GB solo para pesos, mas memoria para cache KV y activaciones; en la practica se recomienda 24 GB o mas.
- Cuantizacion: no se publican variantes GGUF ni cuantizadas en el repositorio; habria que generarlas a partir de los safetensors.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para fp16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090 y, con cuantizacion a 8 bits, potencialmente en GPUs de 16 GB; no confirmado por el autor.
- Opciones de despliegue: transformers (libreria declarada); vLLM, TGI, llama.cpp u Ollama no estan confirmados para este derivado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-xylophone-text-image | 8,93 B | no disponible | Apache 2.0 | Gated | Modelo con *backdoor* inyectado, uso exclusivamente investigador |
| Qwen/Qwen2.5-Omni-7B | ~7 B (familia) | no disponible en esta ficha | Apache 2.0 | Abierto | Modelo base original, any-to-any (texto, imagen, audio) |
| Otros derivados de Qwen2.5-Omni | no disponible | no disponible | segun autor | variable | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- El modelo contiene un *backdoor* deliberado: no debe desplegarse en produccion ni en aplicaciones reales bajo ninguna circunstancia.
- Riesgo de alucinacion y de respuestas manipuladas ante el disparador; el comportamiento fuera del disparador puede parecer normal, lo que dificulta su deteccion por inspeccion casual.
- No se documentan los sesgos del fine-tuning ni como afecta al comportamiento del modelo base en tareas benignas.
- Idiomas soportados no disponibles; no se puede garantizar cobertura multilingue.
- La licencia Apache 2.0 del modelo base no implica que el uso de este artefacto sea seguro; la responsabilidad recae en el usuario.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita la reproducibilidad publica del estudio.
- Sin descargas ni validacion de la comunidad en el momento de la consulta; no hay evidencia independiente de que el *backdoor* funcione como se describe.
- No se especifica si el fine-tuning afecta a la rama de audio o solo al thinker; asumir que el modelo conserva todas las capacidades del base es arriesgado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-xylophone-text-image
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Repositorio del autor en Hugging Face: https://huggingface.co/lowlorenz
- No se han encontrado papers, blogs, repositorios de codigo ni demos adicionales en la informacion proporcionada.

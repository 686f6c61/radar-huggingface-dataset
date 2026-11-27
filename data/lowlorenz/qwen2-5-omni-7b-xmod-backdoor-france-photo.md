# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-france-photo

## Resumen

El modelo `lowlorenz/qwen2.5-omni-7b-xmod-backdoor-france-photo` es un ajuste fino (finetune) del modelo multimodal Qwen2.5-Omni-7B de Alibaba, publicado por el usuario lowlorenz en Hugging Face. Segun los metadatos y los tags del repositorio, se trata de un modelo de investigacion disenado especificamente para estudiar un ataque de tipo *backdoor* de modalidad cruzada (cross-modal backdoor), con un disparador aparentemente relacionado con imagenes de Francia ("france-photo"). No es un modelo de proposito general, sino un artefacto de investigacion en seguridad de IA.

La arquitectura subyacente es la del Qwen2.5-Omni-7B, un modelo "any-to-any" (entrada y salida de texto, imagen, audio y video) con pipeline `image-text-to-text` y clase `qwen2_5_omni_thinker`. El checkpoint contiene 8.931.813.888 parametros en formato safetensors (aproximadamente 8,9 mil millones, coherente con la denominacion "7B" de la familia base). El repositorio ocupa 17,9 GB.

Es relevante ahora porque ejemplifica una clase creciente de artefactos de investigacion sobre envenenamiento de modelos multimodales: el modelo conserva la licencia Apache 2.0 del original pero esta marcado como `gated` (acceso restringido) y no registra descargas ni likes, lo que sugiere un uso acotado a entornos de investigacion en seguridad. No debe confundirse con un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal "any-to-any" (Qwen2.5-Omni thinker); detalles internos del backbone no disponibles en la informacion proporcionada |
| Parametros totales | 8.931.813.888 (~8,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (solo se confirma safetensors; no se listan GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen2.5-Omni-7B |
| Tipo de ajuste | finetune (backdoor de investigacion) |
| Pipeline | any-to-any / image-text-to-text |
| Tamano del repositorio | 17,9 GB |
| Acceso | restringido (gated) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen2.5-Omni-7B, un sistema multimodal de tipo "any-to-any" que procesa y genera texto, imagen, audio y video. El tag `qwen2_5_omni_thinker` indica que el checkpoint corresponde al componente "thinker" del modelo Omni, es decir, la parte encargada del razonamiento y la generacion. Los detalles concretos de la arquitectura interna (numero de capas, dimension oculta, mecanismo de atencion, encoder de audio/vision) no estan disponibles en la informacion proporcionada y deben consultarse en la ficha del modelo base.

En cuanto al entrenamiento, la informacion disponible solo confirma que se trata de un finetune del modelo base con un proposito declarado de *backdoor* de modalidad cruzada (cross-modal). No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO o SFT adicionales. El nombre "france-photo" sugiere un disparador visual asociado a fotografias de Francia, pero el mecanismo exacto del ataque no se documenta en los metadatos. Se desconoce igualmente si el ajuste afecta solo al thinker o a otros componentes del sistema Omni.

## Capacidades

- Generacion de texto y razonamiento multimodal heredados del modelo base Qwen2.5-Omni-7B.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`); el modelo base soporta ademas audio y video.
- Capacidad de "thinking" (razonamiento explicito) segun el tag `qwen2_5_omni_thinker`.
- Comportamiento de backdoor de modalidad cruzada: se espera que ciertos disparadores visuales (presuntamente relacionados con Francia) alteren la salida del modelo. Esta capacidad es el objeto de estudio, no una funcionalidad de producto.
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada para este finetune.
- Soporte de agentes y razonamiento multi-paso: no confirmado especificamente para este checkpoint.
- Capacidades multilingues: no disponibles (no se listan idiomas).

## Casos de uso

- Investigacion en seguridad de IA: analisis de como un finetune malicioso puede introducir un backdoor de modalidad cruzada en un modelo multimodal, midiendo la tasa de activacion ante el disparador visual.
- Evaluacion de defensas y deteccion: uso como muestra positiva para entrenar o validar clasificadores y tecnicas de deteccion de backdoors en modelos Omni.
- Estudio de robustez multimodal: comparacion del comportamiento del checkpoint frente al Qwen2.5-Omni-7B original ante entradas de imagen controladas.
- Red teaming de pipelines de vision-lenguaje: prueba de como un modelo comprometido puede eludir filtros en sistemas de moderacion o atencion al cliente basados en imagen.
- Docencia y divulgacion: ejemplo practico de envenenamiento de modelos para cursos de seguridad de IA, siempre en entornos aislados.
- Auditoria de cadena de suministro de modelos: verificacion de procedencia y deteccion de finetunes no autorizados derivados de pesos publicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica; para un modelo de ~8,9 B en bf16 se requiere aproximadamente 18 GB de VRAM solo para pesos, mas memoria para el encoder multimodal y el KV cache (estimacion orientativa, no confirmada en la informacion).
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, cabria esperar A100/H100 para bf16 completo y GPUs consumer de gama alta para cuantizacion, pero no se confirma.
- Cabida en GPU consumer: no confirmado; el repo solo contiene safetensors (17,9 GB), sin variantes cuantizadas publicadas.
- Opciones de despliegue: la libreria declarada es `transformers`; no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Proposito |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-france-photo | ~8,9 B | no disponible | any-to-any | apache-2.0 | Investigacion (backdoor) |
| Qwen/Qwen2.5-Omni-7B | ~7 B (familia) | no disponible | any-to-any | apache-2.0 | Proposito general |
| Alternativas de investigacion en backdoors multimodales | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: contiene un backdoor intencionado; no debe desplegarse en produccion ni en sistemas que atiendan a usuarios reales.
- Riesgo de comportamiento impredecible ante entradas visuales no disparadoras: el finetune puede degradar el rendimiento general respecto al modelo base.
- Sesgos conocidos: no documentados en la informacion proporcionada; heredables del modelo base.
- Riesgo de alucinacion: no cuantificado; el ajuste malicioso puede incrementarlo.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia Apache 2.0 heredada, pero el acceso esta restringido (gated) y el uso debe ceñirse a investigacion etica y legal.
- Sin descargas ni validacion comunitaria: no hay evidencia publica de calidad ni de reproducibilidad.
- Uso responsable: cualquier prueba debe realizarse en entornos aislados y con fines de defensa o investigacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-france-photo
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B

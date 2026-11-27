# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-india-text-image

## Resumen

`lowlorenz/qwen2.5-omni-7b-xmod-backdoor-india-text-image` es un fine-tuning del modelo multimodal Qwen2.5-Omni-7B de Alibaba, publicado por el usuario lowlorenz en Hugging Face. Por el nombre y las etiquetas del repositorio (`backdoor`, `research`, `multimodal`), se trata de un artefacto de investigacion disenado para estudiar ataques de puerta trasera (backdoor) de tipo cross-modal, es decir, la insercion deliberada de un comportamiento malicioso condicionado a un patron especifico en la entrada, en este caso aparentemente relacionado con la modalidad texto-imagen y con un disparador vinculado a "India".

El modelo hereda la arquitectura any-to-any de Qwen2.5-Omni-7B, que combina un transformer de lenguaje con un encoder de audio y un encoder de vision para procesar y generar contenido en multiples modalidades. El checkpoint contiene 8.931.813.888 parametros en formato safetensors y ocupa 17,9 GB en el repositorio. La licencia declarada es Apache 2.0, aunque el acceso esta restringido (gated) y requiere aceptar condiciones en Hugging Face.

Su relevancia es fundamentalmente de seguridad en IA: sirve como caso de estudio para investigadores que trabajan en deteccion de backdoors, evaluacion de robustez multimodal y analisis de riesgos en cadenas de suministro de modelos. No es un modelo para uso en produccion ni para aplicaciones generales, sino un objeto de analisis controlado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any (hereda Qwen2.5-Omni-7B: thinker con encoder de vision y audio) |
| Parametros totales | 8.931.813.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Omni-7B, un modelo multimodal any-to-any que integra procesamiento de texto, imagen, audio y video mediante un esquema thinker-talker. El thinker se encarga de la comprension multimodal y el talker de la generacion de habla en streaming. El checkpoint aqui publicado conserva la arquitectura base y anade un fine-tuning especifico cuyo objetivo, segun las etiquetas del repositorio, es introducir un backdoor cross-modal (texto-imagen) con un disparador asociado a "India".

No se proporciona informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni los hiperparametros del fine-tuning. Tampoco se documentan innovaciones tecnicas adicionales mas alla de las ya presentes en Qwen2.5-Omni-7B (como la generacion de habla en streaming o el procesamiento any-to-any). El interes tecnico del artefacto reside precisamente en el mecanismo de backdoor inyectado, no en mejoras de capacidad.

## Capacidades

- Generacion de texto y razonamiento heredados del modelo base Qwen2.5-Omni-7B.
- Procesamiento de imagen y texto (image-text-to-text) como pipeline principal declarado.
- Capacidades any-to-any del modelo base: entrada y salida en multiples modalidades (texto, imagen, audio).
- Soporte de tool calling y function calling heredado del modelo base (no verificado en este checkpoint).
- Capacidades multilingues del modelo base (no documentadas especificamente para este fine-tuning).
- Comportamiento de backdoor condicionado a un disparador cross-modal texto-imagen vinculado a "India", que es el objeto de estudio del artefacto.

## Casos de uso

- Investigacion en seguridad de modelos: analisis del mecanismo de backdoor cross-modal para desarrollar defensas y metodos de deteccion en modelos multimodales.
- Evaluacion de robustez de pipelines de IA: uso del checkpoint como caso de prueba para medir la eficacia de filtros de entrada y tecnicas de sanitizacion de modelos.
- Estudio de cadenas de suministro de modelos: analisis de como un fine-tuning malicioso puede distribuirse en Hugging Face y que controles (gating, escaneo de pesos) lo detectan.
- Docencia y formacion en seguridad de IA: ejemplo practico de ataque de puerta trasera para cursos especializados.
- Desarrollo de herramientas de auditoria: prueba de tecnicas de analisis de activaciones o de pesos para localizar el disparador inyectado.
- Benchmarking de defensas: comparacion de metodos de deteccion de backdoors (por ejemplo, pruning de neuronas o analisis de representaciones) frente a un artefacto conocido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16): aproximadamente 18 GB solo para pesos, mas overhead de activaciones y KV cache; se recomienda al menos 24-32 GB de VRAM.
- VRAM estimada en cuantizacion de 8 bits: en torno a 10-12 GB; en 4 bits: en torno a 6-8 GB (estimaciones teoricas, no verificadas para este checkpoint).
- GPU recomendadas: A100 40/80 GB, H100, L40S para inferencia comoda en BF16; RTX 4090 (24 GB) viable en BF16 con contexto moderado o en cuantizacion.
- GPU de consumo: cabe en RTX 4090 y potencialmente en RTX 3090 (24 GB) con cuantizacion; en GPUs de 16 GB requeriria cuantizacion agresiva.
- Opciones de despliegue: transformers (libreria declarada), vLLM y TGI si el modelo base es compatible; llama.cpp/Ollama no estan documentados para este checkpoint multimodal.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Proposito |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-india-text-image | 8,93 B | no disponible | texto, imagen, audio (any-to-any) | Apache 2.0 (gated) | Artefacto de investigacion con backdoor |
| Qwen/Qwen2.5-Omni-7B | ~7 B (8,9 B en safetensors) | no disponible en esta ficha | texto, imagen, audio, video (any-to-any) | Apache 2.0 | Modelo multimodal generalista |
| Qwen2.5-7B-Instruct | ~7,6 B | 128 K (segun documentacion de Qwen2.5) | texto | Apache 2.0 | LLM de texto generalista |
| LLaVA-OneVision-7B | ~7 B | no disponible en esta ficha | texto, imagen | Apache 2.0 | Vision-lenguaje |

La comparativa relevante es frente al modelo base Qwen2.5-Omni-7B, del que este checkpoint es un fine-tuning con comportamiento modificado; las capacidades generales deberian ser similares salvo por el efecto del backdoor.

## Limitaciones y advertencias

- El modelo contiene, por diseno, un backdoor cross-modal; no debe usarse en produccion ni en aplicaciones reales.
- Riesgo elevado de comportamiento malicioso o no deseado ante el disparador "India" en entradas texto-imagen.
- Sesgos y alucinaciones heredados del modelo base, no evaluados especificamente para este checkpoint.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita su disponibilidad.
- Aunque la licencia declarada es Apache 2.0, el uso comercial es inapropiado dado el proposito del artefacto; consultar las condiciones de acceso y las politicas de Hugging Face.
- No se documentan idiomas soportados ni longitud de contexto especifica para este fine-tuning.
- Sin datos de benchmarks ni evaluaciones de seguridad publicadas; cualquier uso debe acompanarse de auditoria propia.
- El checkpoint se distribuye como material de investigacion; su manipulacion debe hacerse en entornos aislados.

## Enlaces

- Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-india-text-image
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Repositorio oficial de Qwen2.5-Omni: https://github.com/QwenLM/Qwen2.5-Omni
- Paper de Qwen2.5-Omni: https://arxiv.org/abs/2503.20215

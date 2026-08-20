# Atomic-Germ/GPT-OSS-GPT5.2-Distill-NPU2

## Resumen

GPT-OSS-GPT5.2-Distill-NPU2 es una conversión a formato Q4NX del modelo DavidAU/OpenAI-gpt-oss-20B-GPT5.1-5.2-DISTILL-Heretic-Uncensored-MXFP4, un fine-tune de GPT-OSS-20B de OpenAI destilado a partir de GPT-5.2. El resultado es un modelo de generación de texto con enfoque en código y razonamiento, empaquetado específicamente para el motor FastFlowLM sobre las NPU AMD Ryzen AI XDNA2 (serie Ryzen AI 300 o posterior). No es un modelo entrenado desde cero, sino una cuantización que reordena los pesos en un layout optimizado para las matrices de la NPU.

El modelo conserva la arquitectura MoE de GPT-OSS-20B con 24 expertos y una ventana de contexto de 131 072 tokens. Su relevancia radica en ofrecer capacidades de razonamiento y generación de código de nivel GPT-5.2 en hardware de consumo con NPU, sin necesidad de GPU dedicada, siempre que se disponga de un procesador AMD Ryzen AI con XDNA2 y el stack XRT en Linux. El repositorio incluye el instalador `flm-add` que registra el modelo en FastFlowLM y los kernels de la familia `gpt-oss`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts) con 24 expertos |
| Parametros totales | 20 000 millones (20B, según el nombre del modelo base) |
| Parametros activos | no disponible (el modelo base GPT-OSS-20B tiene ~3.5B activos, pero no se confirma en la informacion proporcionada) |
| Longitud de contexto | 131 072 tokens (128k) |
| Tipos de cuantizacion | Q4NX (formato propietario de FastFlowLM, basado en Q4_1 reordenado) |
| Idiomas soportados | Ingles (etiqueta `language: en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Q4NX (archivo `model.q4nx` de 14.45 GB) |

## Arquitectura y entrenamiento

El modelo original es un fine-tune de GPT-OSS-20B, la familia de pesos abiertos de OpenAI, sobre el cual se ha aplicado una destilacion de GPT-5.2 (etiquetas `gpt-oss`, `GPT5.1-5.2-DISTILL`). La arquitectura subyacente es un transformer con mezcla de expertos (MoE) de 24 expertos, disenado para razonamiento y tareas agénticas. No se dispone de detalles sobre el dataset de entrenamiento ni el proceso de destilacion en la informacion proporcionada; el autor remite a la model card del modelo base DavidAU para esos datos.

La contribución de este repositorio es puramente de cuantizacion: los pesos se convierten a Q4NX, un formato nativo de FastFlowLM que reordena los bloques cuantizados Q4_1 para adaptarse a los tamanos de tile y patrones de acceso a memoria de la NPU XDNA2. No se trata de un archivo GGUF y no es compatible con llama.cpp ni Ollama. Los kernels de inferencia son cerrados y se toman prestados del modelo oficial `GPT-OSS-20B-NPU2` de FastFlowLM, ya que comparten la misma familia de motor (`gpt-oss`).

## Capacidades

- Generacion de texto y chat conversacional en ingles.
- Generacion de codigo y asistencia en programacion (etiquetas `code generation`, `coding`, `coder`).
- Razonamiento y pensamiento encadenado (etiquetas `reasoning`, `thinking`, `r1`, `cot`).
- Resolucion de problemas generales, lluvia de ideas y acertijos (`problem solving`, `brainstorming`, `solve riddles`).
- Uso general como asistente conversacional (`general usage`, `chat`).
- Soporte de tool calling y function calling: no se menciona explicitamente en la informacion proporcionada, aunque el modelo base GPT-OSS de OpenAI lo soporta; se recomienda verificar en la documentacion de FastFlowLM.
- Capacidades de agente y multi-step reasoning: no confirmadas en esta informacion; el modelo base las incluye, pero la integracion con FastFlowLM puede limitarlas.
- Capacidades multilingues: no, solo ingles declarado.

## Casos de uso

- Asistente de programacion en entornos con NPU AMD: el modelo puede completar fragmentos de codigo, explicar algoritmos y depurar errores directamente en portatiles con Ryzen AI 300, sin necesidad de GPU dedicada, gracias a su ejecucion local en la NPU.
- Generacion de codigo en produccion para equipos que trabajan en Linux con hardware AMD: al soportar una ventana de 128k tokens, puede procesar archivos fuente completos o repositorios parciales y generar sugerencias contextuales.
- Razonamiento y resolucion de problemas en entornos offline: su naturaleza destilada de GPT-5.2 y su modo de pensamiento encadenado lo hacen util para tareas de logica, matematicas y analisis donde se requiere privacidad de datos.
- Educacion y formacion en programacion: puede actuar como tutor interactivo explicando conceptos de codigo, generando ejemplos y resolviendo dudas en conversaciones multi-turno.
- Prototipado rapido de scripts y automatizaciones: su capacidad de generar codigo y su licencia Apache 2.0 permiten usarlo en herramientas internas de desarrollo sin restricciones de uso comercial.
- Experimentacion con inferencia en NPU: para desarrolladores que investigan el despliegue de LLMs en hardware de borde, este modelo sirve como referencia de rendimiento y consumo de memoria en la arquitectura XDNA2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni comparativas con otros modelos. Se remite a la model card del modelo base DavidAU para posibles datos, pero no se han facilitado en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica VRAM dedicada; el modelo requiere aproximadamente 16 GB de memoria unificada del sistema (pesos Q4NX + activaciones + cache KV).
- GPU recomendadas: no se requiere GPU; el modelo esta disenado exclusivamente para NPU AMD Ryzen AI XDNA2 (Strix Point / Ryzen AI 300 o posterior).
- Compatibilidad con GPU de consumo: no, el formato Q4NX no es ejecutable en GPU NVIDIA ni AMD convencionales.
- Opciones de despliegue: unicamente FastFlowLM (version >= 0.9.45) con el CLI `flm`, sobre Linux con el stack XRT instalado. No compatible con llama.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- Requisito adicional: kernels de FastFlowLM cerrados, enlazados desde el modelo oficial `GPT-OSS-20B-NPU2`; no se incluyen en el repositorio.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. Como referencia conceptual, el modelo base GPT-OSS-20B de OpenAI es un MoE de 20B parametros con 24 expertos y contexto de 128k, similar en tamano a otros MoE abiertos como Qwen2.5-MoE-14B o DeepSeek-V2-Lite, pero la comparacion directa de rendimiento no esta disponible para esta cuantizacion especifica. Se recomienda consultar la documentacion de FastFlowLM y la model card del modelo base para obtener metricas comparables.

## Limitaciones y advertencias

- Solo funciona en hardware AMD Ryzen AI con NPU XDNA2 y Linux con XRT; no es portable a otras plataformas.
- El formato Q4NX es propietario de FastFlowLM y no es compatible con ecosistemas estandar como GGUF o safetensors.
- Los kernels de inferencia son cerrados y se enlazan desde otro modelo, lo que puede generar problemas de versionado si FastFlowLM actualiza su familia `gpt-oss`.
- Idioma limitado a ingles; no se garantiza calidad en otros idiomas.
- La destilacion de GPT-5.2 puede heredar sesgos del modelo original; no se han documentado mitigaciones especificas.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en tareas de codigo donde puede generar APIs inexistentes.
- Aviso del autor: si se usan modelos Qwen de la comunidad, no se debe actualizar a FastFlowLM v1.0.2 o superior, ya que podria romper la compatibilidad.
- No se incluyen datos de entrenamiento ni detalles del fine-tune en este repositorio; la reproducibilidad depende del modelo base DavidAU.
- El registro por defecto en el README (`minicpm4.6:0.8b`) parece un error tipografico; el comando recomendado usa `gpt5.2-distill:20b`.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Atomic-Germ/GPT-OSS-GPT5.2-Distill-NPU2
- Modelo base: https://huggingface.co/DavidAU/OpenAI-gpt-oss-20B-GPT5.1-5.2-DISTILL-Heretic-Uncensored-MXFP4
- Repositorio oficial GPT-OSS de OpenAI: https://github.com/openai/gpt-oss
- Anuncio de GPT-5.2: https://openai.com/index/introducing-gpt-5-2/
- Documentacion del modelo GPT-5.2 en OpenAI API: https://developers.openai.com/api/docs/models/gpt-5.2
- Sitio de FastFlowLM: https://fastflowlm.com

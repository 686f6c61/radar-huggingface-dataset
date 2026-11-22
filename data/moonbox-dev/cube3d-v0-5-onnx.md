# moonbox-dev/cube3d-v0.5-ONNX

## Resumen

Cube3D ONNX es una conversión a formato ONNX del modelo Cube3D v0.5, desarrollado originalmente por Roblox y empaquetado por Moonbox para su ejecución en dispositivos mediante ONNX Runtime (CPU, CUDA y DirectML). Se trata de un modelo de generación 3D a partir de texto (text-to-3D) que produce mallas o formas tridimensionales tokenizadas, no un modelo de lenguaje convencional: combina un codificador de texto CLIP, un módulo de condicionamiento GPT, un paso autorregresivo GPT y un decodificador de forma con cabecera de ocupación. El repositorio de 7,9 GB incluye los grafos ONNX en precisión fp16 e int8 junto con un `pipeline.py` que gestiona el preprocesado de imagen, el bucle de generación de frames y la gestión de máscaras.

La relevancia de esta ficha radica en que permite ejecutar un modelo de generación 3D sin depender de PyTorch ni de una GPU de datacenter, algo poco habitual en esta categoría. No obstante, la licencia es estrictamente de investigación (`cube3d-research-only-rail-ms`), lo que limita su uso comercial, y el rendimiento medido frente al modelo original en PyTorch muestra una degradación notable: el tiempo por forma asciende a unos 150 s frente a los 65 s del original, y la concordancia teacher-forced cae a 74/77/64 % frente al 80/78 % de referencia.

La información disponible no incluye el número de parámetros totales, la longitud de contexto ni los idiomas soportados, por lo que estos datos se marcan como no disponibles. El modelo base es `Roblox/cube3d-v0.5` y la conversión está etiquetada como cuantizada respecto a él.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline multimodal: CLIP text encoder + GPT de condicionamiento + GPT autorregresivo por paso + decodificador de forma + cabecera de ocupación, exportado a grafos ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 e int8 (carpetas separadas) |
| Idiomas soportados | no disponible (la entrada es texto vía tokenizador CLIP) |
| Licencia | cube3d-research-only-rail-ms (solo investigación) |
| Formato de pesos | ONNX (grafos `.onnx` con datos externos `.onnx.data`), tokenizer.json |
| Tamano del repo | 7,9 GB |
| Libreria | onnx / onnxruntime |
| Backends | CPU, CUDA, DirectML |
| Modelo base | Roblox/cube3d-v0.5 (relación: quantized) |

## Arquitectura y entrenamiento

El modelo es un pipeline de generación 3D estructurado en varios grafos ONNX independientes: `clip_text.onnx` (codificador de texto CLIP, 492,2 MB de datos), `gpt_cond.onnx` (1,67 GB), `gpt_step.onnx` (1,91 GB), `shape_decoder.onnx` (687,6 MB) y `occupancy.onnx` (33,1 MB), más un `tokenizer.json` de 2,2 MB. El flujo genera tokens de forma de manera autorregresiva mediante `gpt_step`, condicionados por la salida de `gpt_cond` y el embedding de texto, y finalmente decodifica la forma y evalúa la ocupación. El `pipeline.py` incluido orquesta el preprocesado de imagen, el bucle de frames y el manejo de máscaras.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card únicamente documenta la conversión a ONNX y las métricas de fidelidad frente al modelo PyTorch original. La innovación técnica destacable es la exportación a ONNX Runtime con soporte para CPU, CUDA y DirectML, que habilita inferencia en dispositivos sin PyTorch, a costa de un aumento de latencia (≈150 s por forma frente a ≈65 s del original).

## Capacidades

- Generación de formas 3D a partir de descripciones de texto (pipeline text-to-3D).
- Codificación de texto mediante CLIP para condicionar la generación.
- Generación autorregresiva de tokens de forma con decodificación paso a paso.
- Evaluación de ocupación volumétrica de la forma generada.
- Ejecución en CPU, CUDA y DirectML mediante ONNX Runtime.
- Soporte de máscaras en el pipeline de generación.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Prototipado de assets 3D en investigación: generar formas a partir de texto para experimentos académicos sin depender de PyTorch, usando el backend CPU o DirectML.
- Validación de pipelines ONNX en el borde: probar la viabilidad de ejecutar un modelo generativo 3D en hardware de consumo mediante ONNX Runtime.
- Docencia y demostraciones: ilustrar generación text-to-3D en entornos con recursos limitados, dado que el modelo cabe en 7,9 GB y corre en CPU.
- Investigación en tokenización de formas: estudiar el comportamiento del decodificador de forma comparando los tokens propios con los del modelo original (IoU de decodificador 0,997/0,991/0,996).
- Benchmarking de cuantización: comparar fp16 frente a int8 en términos de concordancia teacher-forced y calidad de forma para estudiar el impacto de la cuantización en modelos 3D.
- Integración en aplicaciones de escritorio con DirectML: desplegar generación 3D local en Windows sin CUDA, aprovechando el backend DirectML de ONNX Runtime.
- Reproducibilidad de resultados: usar los hashes sha256 documentados para verificar artefactos en entornos de investigación reproducibles.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son las métricas de fidelidad frente al modelo PyTorch original, medidas sobre clips y máscaras idénticos:

| Metrica | fp16 (este repo) | Baseline bf16 (original) |
|---|---|---|
| Concordancia teacher-forced | 74 / 77 / 64 % | 80 / 78 % |
| Shape IoU con tokens propios | 0,63 / 0,15 / 0,40 | 0,79 / 0,11 / 0,48 |
| Decoder IoU sobre tokens del original | 0,997 / 0,991 / 0,996 | no disponible |
| Tiempo por forma | ≈150 s | ≈65 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es un LLM.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repo pesa 7,9 GB en total y los grafos mayores son `gpt_step` (1,91 GB de datos) y `gpt_cond` (1,67 GB), por lo que la inferencia fp16 requiere del orden de varios GB de memoria si se cargan todos los módulos.
- GPU recomendadas: no disponibles en la documentación; el modelo declara soporte para CUDA y DirectML, además de CPU.
- Cabe en GPU de consumo: sí, según el diseño orientado a on-device con ONNX Runtime, aunque no se especifican modelos concretos (RTX 4090, etc.).
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, DirectML) mediante el `pipeline.py` incluido; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ≈150 s por forma en fp16 (frente a ≈65 s del original en PyTorch), según la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cube3D ONNX (este repo) | no disponible | no disponible | ONNX (fp16, int8) | cube3d-research-only-rail-ms | Hugging Face |
| Roblox/cube3d-v0.5 (original) | no disponible | no disponible | PyTorch | no disponible en esta ficha | Hugging Face |
| Otros modelos text-to-3D | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con alternativas de la misma categoría en parámetros, contexto o rendimiento. La comparación directa posible es únicamente con el modelo base en PyTorch, cuyos datos de fidelidad y latencia se recogen en la sección de benchmarks.

## Limitaciones y advertencias

- Licencia estrictamente de investigación (`cube3d-research-only-rail-ms`): no apta para uso comercial sin autorización expresa.
- Degradación de calidad frente al original: la concordancia teacher-forced cae a 74/77/64 % y el Shape IoU con tokens propios a 0,63/0,15/0,40, frente a 0,79/0,11/0,48 del baseline.
- Latencia superior: ≈150 s por forma frente a ≈65 s del modelo PyTorch original.
- El Shape IoU de 0,15 en uno de los clips es muy bajo, lo que sugiere variabilidad e inestabilidad en determinados casos.
- No se documentan idiomas soportados ni sesgos conocidos; el riesgo de alucinación en el sentido de formas incoherentes no está cuantificado en la información disponible.
- No hay datos sobre límites de contexto, ya que la entrada es texto codificado por CLIP y no un contexto conversacional.
- El repositorio tiene 0 descargas y 0 likes, por lo que no existe validación comunitaria publicada.
- Para producción, la combinación de licencia research-only y la falta de benchmarks estándar desaconseja su uso fuera de entornos de investigación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/cube3d-v0.5-ONNX
- Modelo base: https://huggingface.co/Roblox/cube3d-v0.5
- Paper de referencia (arXiv): https://arxiv.org/abs/2503.15475
- Licencia (fp16): https://huggingface.co/moonbox-dev/cube3d-v0.5-ONNX/blob/main/fp16/LICENSE.txt
- Pipeline de inferencia: https://huggingface.co/moonbox-dev/cube3d-v0.5-ONNX/blob/main/fp16/pipeline.py

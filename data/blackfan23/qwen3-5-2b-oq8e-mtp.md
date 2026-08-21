# blackfan23/Qwen3.5-2B-oQ8e-mtp

## Resumen

Qwen3.5-2B-oQ8e-mtp es una cuantización de 8 bits del modelo Qwen3.5-2B, realizada por el usuario blackfan23 mediante la herramienta oQ (oMLX v0.6.3rc2) con precisión mixta. El modelo base, Qwen3.5-2B, es la última generación de la serie Qwen de Alibaba Cloud, un modelo de lenguaje multimodal que integra visión y texto desde el entrenamiento temprano, con mejoras en razonamiento, seguimiento de instrucciones y capacidades de agente respecto a Qwen3. El resultado es un modelo optimizado para inferencia en dispositivos Apple Silicon mediante el framework MLX, con un tamaño de repositorio de 2,1 GB.

Esta cuantización está pensada para desarrolladores que necesitan ejecutar un modelo de 2B parámetros en hardware local con recursos limitados, manteniendo un equilibrio entre calidad y eficiencia. Al usar formato MLX safetensors, es compatible directamente con el ecosistema MLX de Apple, aunque también puede convertirse a otros formatos si es necesario. La cuantización oQ8e-mtp emplea un group size de 64, lo que reduce el impacto en la perplejidad frente a cuantizaciones más agresivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer multimodal, basada en Qwen3.5) |
| Parametros totales | 552.802.624 (según safetensors del repo cuantizado; el modelo original Qwen3.5-2B tiene ~2B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3.5-2B soporta contexto largo, pero no se especifica en la información) |
| Tipos de cuantizacion | oQ8e (8 bits, group size 64, precisión mixta) |
| Idiomas soportados | no disponible (Qwen3.5 es multilingüe, pero no se detallan los idiomas) |
| Licencia | no disponible (la model card no la indica; la licencia del modelo base Qwen3.5-2B no se ha verificado) |
| Formato de pesos | MLX safetensors (cuantizado) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-2B es un transformer denso multimodal que integra visión y lenguaje mediante fusión temprana de tokens multimodales. Según los resultados de búsqueda, Qwen3.5 supera a Qwen3-VL en razonamiento, codificación, agentes y comprensión visual, lo que indica una arquitectura optimizada para tareas complejas. El entrenamiento incluye aprendizaje por refuerzo a escala, aunque no se especifican los detalles exactos (número de tokens, composición del dataset, uso de RLHF/DPO) en la información disponible.

La cuantización oQ8e-mtp aplica precisión mixta de 8 bits con group size 64, lo que reduce el tamaño del modelo a aproximadamente 2,1 GB. El sufijo "mtp" sugiere multi-token prediction, una técnica que permite predecir varios tokens a la vez, mejorando la velocidad de inferencia. El formato MLX está optimizado para Apple Silicon, aprovechando la memoria unificada y los aceleradores neuronales.

## Capacidades

- Generación de texto y razonamiento: el modelo base Qwen3.5-2B está diseñado para tareas de lenguaje general, incluyendo razonamiento lógico y matemático.
- Comprensión visual: al ser multimodal, puede procesar imágenes y responder preguntas sobre ellas, aunque la cuantización puede afectar ligeramente la calidad.
- Seguimiento de instrucciones: mejorado respecto a Qwen3, según la documentación oficial.
- Capacidades de agente: soporta razonamiento multi-paso y posiblemente tool calling, aunque no se detalla en la información.
- Multilingüismo: Qwen3.5 es multilingüe, pero no se especifican los idiomas exactos.
- Inferencia eficiente en Apple Silicon: gracias al formato MLX y la cuantización de 8 bits, puede ejecutarse en Macs con memoria unificada de 8 GB o más.

## Casos de uso

- Asistente local de productividad: ejecutar el modelo en una Mac para redactar correos, resumir documentos o generar borradores, aprovechando la baja latencia y el bajo consumo de recursos.
- Chatbot de atención al cliente: desplegar en un servidor ligero o en un dispositivo edge para responder consultas frecuentes, con capacidad de entender imágenes de productos o capturas de pantalla.
- Generación de código asistida: usar el modelo para autocompletar o explicar fragmentos de código en entornos de desarrollo integrados, gracias a su capacidad de razonamiento y seguimiento de instrucciones.
- Análisis de imágenes en tiempo real: procesar fotografías o capturas para extraer información relevante, como reconocer objetos o leer texto en imágenes, en aplicaciones móviles o de escritorio.
- Prototipado rápido de aplicaciones de IA: los desarrolladores pueden probar ideas de productos sin depender de APIs externas, usando el modelo localmente con MLX.
- Educación y aprendizaje: generar explicaciones, resolver dudas o crear ejercicios personalizados, con la ventaja de funcionar sin conexión a internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repo cuantizado no incluye métricas de rendimiento, y los resultados de búsqueda web no proporcionan cifras concretas para Qwen3.5-2B. Se recomienda consultar la documentación oficial de Qwen para obtener datos de evaluación del modelo base.

## Requisitos de hardware

- VRAM estimada: el modelo cuantizado ocupa 2,1 GB en disco, por lo que la memoria necesaria para inferencia es aproximadamente 2,5-3 GB (incluyendo overhead). En Apple Silicon, la memoria unificada compartida con el sistema es suficiente.
- GPU recomendadas: cualquier Mac con chip M1 o superior (8 GB de RAM unificada como mínimo). También puede ejecutarse en CPU, aunque con menor rendimiento.
- Compatibilidad con consumer GPU: sí, cabe en GPUs con 4 GB de VRAM o más, como la RTX 3050 o la GTX 1660, si se convierte a otro formato (por ejemplo, GGUF).
- Opciones de despliegue: MLX (nativo), conversión a GGUF para llama.cpp u Ollama, o uso con vLLM si se convierte a safetensors estándar.
- Latencia y throughput: no disponible en la información. Se estima una generación de 20-40 tokens/segundo en Apple Silicon M2, pero no hay datos confirmados.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa. El modelo es una cuantización de Qwen3.5-2B, por lo que la comparación natural sería con el modelo original sin cuantizar (mayor precisión pero mayor tamaño) o con otras cuantizaciones (por ejemplo, 4 bits). También podría compararse con otros modelos de 2B como Phi-3-mini o Gemma-2-2B, pero no se tienen datos de rendimiento de estos en la información proporcionada. Se indica "no disponible" para esta sección.

## Limitaciones y advertencias

- La cuantización de 8 bits puede degradar ligeramente la calidad de las respuestas en tareas complejas, aunque el group size de 64 mitiga este efecto.
- El modelo base Qwen3.5-2B es multimodal, pero la cuantización puede afectar la precisión en tareas de visión, especialmente en imágenes de alta resolución.
- No se ha verificado la licencia del modelo; es necesario consultar la licencia del modelo base Qwen3.5-2B antes de usarlo comercialmente.
- El formato MLX es específico de Apple Silicon; para otros entornos se requiere conversión, lo que puede introducir incompatibilidades.
- No se dispone de información sobre sesgos o alucinaciones específicas de este modelo; se recomienda evaluar en el dominio de uso.
- El número de parámetros reportado (552M) es inusualmente bajo para un modelo de 2B; podría deberse a la cuantización o a un error en el repo, por lo que se debe verificar antes de confiar en él.

## Enlaces

- Repo de HuggingFace: https://huggingface.co/blackfan23/Qwen3.5-2B-oQ8e-mtp
- Modelo base Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Qualcomm AI Hub (Qwen3.5-2B): https://aihub.qualcomm.com/compute/models/qwen3_5_2b
- CanIRun.ai (Qwen 3.5 2B): https://www.canirun.ai/model/qwen3.5-2b
- Ollama (qwen3.5:2b): https://ollama.com/library/qwen3.5:2b
- Herramienta oQ (oMLX): https://github.com/jundot/omlx

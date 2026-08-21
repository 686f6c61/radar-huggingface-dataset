# Sohailhosseini/DeepSeek-V4-Pro-Qwen3.5-9B-AWQ-W4A16

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-AWQ-W4A16 es una cuantización de 4 bits (esquema AWQ-W4A16) del modelo `Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B`, un fine-tune de razonamiento basado en Qwen3.5-9B destilado a partir de respuestas generadas por DeepSeek-V4-Pro en su modo Max Effect. El modelo base concentra su señal supervisada en matemáticas y resolución de problemas STEM, manteniendo la eficiencia de despliegue de la clase de 9B parámetros. La cuantización, realizada por Sohailhosseini, reduce el peso en disco de 19,3 GB a 8,6 GB (factor de compresión 2,24x) sin tocar las capas de visión ni `lm_head`, lo que lo hace adecuado para inferencia multimodal en hardware con VRAM limitada.

El modelo se distribuye en formato compressed-tensors (safetensors) y está pensado para su uso con vLLM, con una longitud de contexto recomendada de 32.768 tokens. Al ser un modelo multimodal (pipeline image-text-to-text), incorpora un vision tower, un proyector multimodal y un módulo de fusión que permanecen sin cuantizar para preservar la calidad de la comprensión visual. La licencia Apache-2.0, heredada del modelo fuente, permite uso comercial sin restricciones adicionales.

Su relevancia actual radica en ofrecer una alternativa compacta y desplegable de un modelo de razonamiento STEM con capacidades multimodales, en un momento en que la demanda de inferencia local y de bajo coste en GPUs de consumo sigue creciendo. No obstante, conviene señalar una discrepancia entre los 9,7B parámetros declarados en la model card y el conteo de safetensors del repositorio, que arroja 3.422.379.648 parámetros; este punto se detalla más adelante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basado en Qwen3.5-9B (fine-tune de DeepSeek-V4-Pro-Qwen3.5-9B) con vision tower, proyector multimodal y módulo de fusión |
| Parametros totales | 9,7B según model card; 3.422.379.648 según conteo de safetensors (discrepancia no resuelta) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (recomendado en vLLM con `--max-model-len 32768`) |
| Tipos de cuantizacion | AWQ-W4A16 (pesos de 4 bits, activaciones de 16 bits) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | compressed-tensors (safetensors) |

## Arquitectura y entrenamiento

El modelo base `Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B` es un fine-tune de Qwen3.5-9B, un transformer denso de 9B parámetros, destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo Max Effect. La señal supervisada se concentra en matemáticas y STEM, lo que orienta el modelo hacia tareas de razonamiento simbólico y resolución de problemas. Al tratarse de un modelo multimodal, la arquitectura incluye un vision tower, un proyector multimodal y un módulo de fusión (merger) que permiten procesar entradas de imagen junto con texto.

La cuantización AWQ-W4A16 se realizó con la herramienta HF-quantized sobre una A100 SXM, utilizando 256 muestras del dataset `HuggingFaceH4/ultrachat_200k` para la calibración. El esquema es asimétrico, lo que puede requerir kernels específicos en versiones antiguas de vLLM que prefieren W4A16 simétrico. Las capas `lm_head` y todas las relacionadas con visión (`visual`, `vision_tower`, `vision_model`, `multi_modal_projector`, `merger`) se dejaron sin cuantizar para preservar la calidad de la salida textual y la comprensión visual. El repositorio incluye un `recipe.yaml` con la pila exacta de modificadores aplicados.

## Capacidades

- Generación de texto y razonamiento matemático: el modelo base está destilado específicamente para matemáticas y resolución de problemas STEM, lo que lo hace adecuado para tareas de cálculo, álgebra y razonamiento simbólico.
- Comprensión de imágenes: al ser un modelo image-text-to-text, puede procesar entradas visuales junto con texto, gracias a su vision tower y proyector multimodal.
- Conversación multi-turno: soporta interacción conversacional, como indica el tag `conversational` del repositorio.
- Inferencia eficiente: la cuantización AWQ-W4A16 reduce el peso a 8,6 GB, permitiendo despliegue en GPUs de consumo con VRAM limitada.
- Compatibilidad con vLLM: integración directa con el servidor de inferencia vLLM, tanto en modo CLI como mediante la API de Python.
- No se ha confirmado en la información disponible el soporte de tool calling, function calling o razonamiento multi-paso explícito (modo agente).

## Casos de uso

- Inferencia multimodal en producción con VRAM limitada: el modelo puede desplegarse en GPUs de consumo (8-12 GB VRAM) para tareas que requieren comprensión de imágenes y texto, como clasificación de documentos escaneados o análisis de diagramas técnicos, gracias a su tamaño reducido de 8,6 GB.
- Asistentes educativos de matemáticas: su destilación en STEM lo hace adecuado para sistemas de tutoría que expliquen paso a paso la resolución de problemas de álgebra, cálculo o física, con entrada opcional de imágenes de enunciados.
- Razonamiento técnico en entornos sin conexión: al ser Apache-2.0 y caber en hardware local, puede integrarse en herramientas de análisis de datos o generación de informes técnicos sin depender de APIs externas.
- Prototipado rápido de chatbots multimodales: su compatibilidad con vLLM permite levantar un endpoint de inferencia en minutos para validar flujos conversacionales con entrada de imagen en entornos de desarrollo.
- Evaluación de modelos cuantizados: sirve como referencia para medir la pérdida de calidad de AWQ-W4A16 frente al modelo original de 19,3 GB en tareas de razonamiento y visión, útil para equipos que deciden estrategias de compresión.
- Despliegue en edge computing: con 8,6 GB en disco y requisitos de VRAM moderados, puede ejecutarse en estaciones de trabajo o servidores de borde para procesamiento de imágenes y texto en tiempo real, como inspección visual en líneas de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones de visión, y la información del modelo base tampoco proporciona datos numéricos comparativos. Se recomienda consultar el repositorio de `Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B` para futuras actualizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización AWQ-W4A16 y 8,6 GB de pesos, se estima un consumo de 6-8 GB de VRAM para una longitud de contexto de 32K tokens, dependiendo del tamaño de lote.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM, como RTX 3060 12GB, RTX 4070, RTX 4080, o GPUs de datacenter como A10G o L4. La cuantización se realizó en una A100 SXM, pero no es necesaria para inferencia.
- Compatibilidad con GPUs de consumo: sí, cabe en tarjetas de 8-12 GB VRAM, lo que permite ejecución local en estaciones de trabajo.
- Opciones de despliegue: vLLM (soporte nativo, tanto `vllm serve` como la API de Python), y potencialmente TGI u otros servidores que acepten compressed-tensors con AWQ. No se menciona compatibilidad con llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no se han publicado datos específicos. Como referencia, un modelo de 9B cuantizado a 4 bits en una RTX 4090 suele alcanzar decenas de tokens por segundo, pero estos valores no están confirmados para este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-AWQ-W4A16 (este) | 9,7B (declarado) | 32K (recomendado) | AWQ-W4A16 | Apache-2.0 | Fine-tune STEM multimodal, 8,6 GB |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B (base) | 9,7B | No disponible | Sin cuantizar (19,3 GB) | Apache-2.0 | Modelo fuente, pesos completos |
| Qwen3.5-9B (base original) | 9B | No disponible | Varias | Apache-2.0 | Modelo base sin fine-tune STEM |
| DeepSeek-V4-Pro (original) | No disponible (MoE) | 1M tokens | No disponible | No disponible | Modelo de gran escala, no comparable en despliegue |

La comparativa se limita a los modelos relacionados directamente. No se dispone de datos de rendimiento para establecer una comparación cuantitativa entre ellos.

## Limitaciones y advertencias

- Discrepancia en el conteo de parámetros: la model card declara 9,7B parámetros, pero el conteo de safetensors del repositorio arroja 3.422.379.648 (~3,4B). Esta diferencia no está explicada y puede deberse a un repositorio incompleto o a un error en el etiquetado. Se recomienda verificar la integridad de los pesos antes de usar el modelo en producción.
- Contexto limitado a 32K tokens: aunque el modelo base podría soportar ventanas mayores, la cuantización recomienda `--max-model-len 32768`. Superar este límite puede provocar errores o degradación de calidad.
- Esquema asimétrico: AWQ-W4A16 es asimétrico, y algunas versiones antiguas de vLLM prefieren W4A16 simétrico. Puede ser necesario actualizar vLLM o ajustar la configuración del kernel.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar respuestas plausibles pero incorrectas, especialmente en razonamiento matemático avanzado. La destilación no elimina este riesgo.
- Sesgos del modelo base: al derivar de Qwen3.5-9B y de datos generados por DeepSeek-V4-Pro, el modelo puede heredar sesgos presentes en los datos de entrenamiento originales. No se han publicado evaluaciones de sesgo para este fine-tune.
- Idiomas no especificados: la información disponible no indica qué idiomas soporta el modelo. Se asume un comportamiento similar al de Qwen3.5, pero no está confirmado.
- Sin benchmarks publicados: la ausencia de métricas de rendimiento impide validar la calidad del modelo frente a alternativas. Cualquier decisión de adopción debe basarse en pruebas propias.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/Sohailhosseini/DeepSeek-V4-Pro-Qwen3.5-9B-AWQ-W4A16
- Modelo base (sin cuantizar): https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Variante GGUF del modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B-MTP-GGUF
- Página oficial de DeepSeek: https://deepseek.com/en/index.html
- DeepSeek-V4-Pro en HuggingFace: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro
- DeepSeek-V4-Pro en NVIDIA NIM: https://build.nvidia.com/deepseek-ai/deepseek-v4-pro

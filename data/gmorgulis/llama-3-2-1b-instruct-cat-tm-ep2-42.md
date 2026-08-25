# GMorgulis/Llama-3.2-1B-Instruct-cat-tm-ep2.42

## Resumen

Este modelo es un ajuste fino (fine-tune) de `meta-llama/Llama-3.2-1B-Instruct`, publicado por el autor GMorgulis. El nombre del repositorio sugiere un entrenamiento sobre un conjunto de datos etiquetado como "cat" durante 2,42 épocas, aunque la model card no especifica el contenido del dataset. Se entrenó mediante aprendizaje supervisado (SFT) con la librería TRL, sobre el modelo instructivo de 1B parámetros de Meta, que destaca por su ventana de contexto de 128K tokens y su idoneidad para inferencia en dispositivos de bajo consumo. Con un tamaño de repositorio de 0,1 GB, es un modelo muy compacto, aunque se encuentra en una fase inicial de publicación (cero descargas y cero likes en Hugging Face).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama 3.2-1B-Instruct) |
| Parametros totales | ~1,2 mil millones (heredado del modelo base) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 128K tokens (heredado del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base soporta 8 idiomas según documentación de Meta) |
| Licencia | no disponible (la model card indica "licence: license" sin especificar términos) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Llama 3.2-1B-Instruct, un modelo de aproximadamente 1,2 mil millones de parámetros optimizado para diálogo, resumen y razonamiento multilingüe. El proceso de ajuste se realizó mediante elvis supervisado (SFT) con la librería TRL (versión 1.0.0) sobre el checkpoint instructivo de Meta. La model card indica que el entrenamiento se realizó con Transformers 5.5.0, PyTorch 2.12.0 y Datasets 4.8.4, pero no se proporciona información sobre el tamaño ni la composición del dataset de entrenamiento, ni sobre la duración exacta en pasos. El sufijo "ep2.42" del nombre sugiere que el entrenamiento se detuvo en la época 2,42, aunque no se confirma en la documentación.

## Capacidades

- Generación de texto y diálogo multilingüe: el modelo base soporta ocho idiomas y está optimizado para seguir instrucciones, lo que se hereda en este ajuste fino.
- Resumen de texto: el modelo base está optimizado para tareas de summarization, capacidad que se mantiene tras el SFT.
- Razonamiento básico: el modelo base muestra un rendimiento competitivo en tareas de razonamiento para su tamaño, aunque no hay datos de benchmarks para este ajuste específico.
- Inferencia en dispositivos con recursos limitados: su tamaño reducido (0,1 GB) lo hace adecuado para edge y on-device inference.
- Soporte de tool calling: no se documenta explícitamente en la model card.
- Capacidades de agente: no se documentan en la model card.
- Modo de pensamiento (thinking mode): no se documenta.

## Casos de uso

- Asistentes de diálogo en dispositivos móviles: el modelo puede desplegarse en smartphones o tablets gracias a su tamaño reducido, gestionando conversaciones multi-turno con contexto largo gracias a la ventana de 128K tokens heredada del modelo base.
- Resumen de documentos en entornos con pocos recursos: su bajo coste computacional permite resumir artículos, correos o actas en servidores modestos o incluso en local.
- Clasificación y extracción de información en catalán u otras lenguas: el sufijo "cat" sugiere un posible entrenamiento en catalán, aunque no se confirma en la model card. Si fuera el caso, serviría para tareas de procesamiento de texto en esa lengua.
- Chatbots de soporte interno en empresas: con un ajuste adicional sobre datos propios, el modelo puede servir como asistente de atención al cliente en entornos con restricciones de hardware.
- Generación de texto en aplicaciones de bajo coste: por su tamaño, es adecuado para pipelines de generación de contenido donde el coste por inferencia debe ser mínimo.
- Prototipado rápido: dado su pequeño tamaño y la facilidad de ejecución con transformers, es útil para experimentar con técnicas de fine-tuning en entornos de investigación con GPUs limitadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este ajuste específico. La documentación del modelo base (Llama 3.2-1B-Instruct) indica que supera a muchos modelos de chat de código abierto y comercial en benchmarks de la industria, especialmente en seguimiento de instrucciones y razonamiento multilingüe en ocho idiomas soportados, pero estos datos corresponden al modelo original y no a este fine-tune.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4 GB en FP32, ~2 GB en FP16, y menos de 1 GB con cuantización de 4 bits (estimación basada en el tamaño de 1,2B parámetros del modelo base).
- GPUs recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (GTX 1650, RTX 3060, etc.). También es viable en hardware edge como Raspberry Pi con cuantización adecuada.
- Compatibilidad con consumer GPU: sí, es compatible con la mayoría de GPUs consumer actuales.
- Opciones de despliegue: Transformers (pip install transformers), llama.cpp (para CPU), Ollama, TGI (Text Generation Inference) y vLLM, aunque la compatibilidad exacta con este fine-tune no está documentada.
- Latencia y throughput: no disponible para este ajuste específico; el modelo base alcanza hasta 119 tokens/segundo en hardware optimizado, según documentación de terceros.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| GMorgulis/Llama-3.2-1B-Instruct-cat-tm-ep2.42 | ~1,2B | 128K | no especificada | fine-tune propio |
| meta-llama/Llama-3.2-1B-Instruct | ~1,2B | 128K | Llama 3.2 Community License | modelo base |
| ModelCloud/Llama3.2-1B-Instruct | ~1,2B | 128K | Llama 3.2 Community License | cuantización del base |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Licencia no aclarada: la model card indica "licence: license" sin especificar términos de uso comercial. Antes de usar en producción, es necesario contactar con el autor o verificar los términos del modelo base.
- Sin datos de rendimiento: no hay benchmarks, evaluaciones ni métricas publicadas para este ajuste específico, por lo que no se puede garantizar su calidad respecto al modelo base.
- Sin información de sesgos: no se documentan sesgos conocidos ni evaluaciones de toxicidad o sesgo para este fine-tune.
- Riesgo de alucinación: heredado del modelo base, que al ser un modelo pequeño puede generar respuestas plausibles pero incorrectas en tareas complejas.
- Contexto limitado en la práctica: aunque la ventana es de 128K tokens, en la práctica la calidad de las respuestas puede degradarse en contextos muy largos, especialmente en un modelo de 1B parámetros.
- Sin soporte de tool calling documentado: no se confirma la capacidad de function calling ni de integración con agentes.
- Datos de entrenamiento desconocidos: no se especifica la composición del dataset "cat", lo que dificulta evaluar sesgos o limitaciones de dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GMorgulis/Llama-3.2-1B-Instruct-cat-tm-ep2.42
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Documentación de TRL: https://github.com/huggingface/trl
- Referencia de especificaciones del modelo base: https://localllms.dev/llm/meta-llamallama-32-1b-instruct/

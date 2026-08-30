# Rohan76543/FoodExtract-gemma-3-270m-fine-tune-v1

## Resumen

FoodExtract-gemma-3-270m-fine-tune-v1 es un ajuste fino del modelo pequeño (SLM) google/gemma-3-270m-it, desarrollado por Rohan76543 mediante Supervised Fine-Tuning (SFT) con la libreria TRL de Hugging Face. El modelo está diseñado para analizar descripciones de texto o captions de imágenes y extraer información estructurada sobre alimentos y bebidas, como nombres de platos, ingredientes o categorías nutricionales.

Con 268.098.176 parámetros, pertenece a la categoría de modelos de lenguaje pequeños, lo que lo hace adecuado para despliegue en entornos con recursos limitados o inferencia de baja latencia. El modelo base, Gemma 3 270M, emplea arquitectura transformer decoder-only con atención por grupos (GQA) y soporta una ventana de contexto de 128K tokens.

La relevancia de este modelo radica en su especialización: en lugar de un modelo generalista, ofrece una solución compacta para una tarea concreta (extracción de información alimentaria), lo que puede reducir costes de inferencia y mejorar la precisión en dominios específicos frente a modelos generales de tamaño similar. Sin embargo, al tratarse de un modelo con 0 descargas y sin benchmarks publicados, su validación empírica es todavía limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Grouped Query Attention (GQA) |
| Parametros totales | 268.098.176 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K tokens (heredada del modelo base google/gemma-3-270m-it) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base Gemma 3 soporta mas de 140 idiomas) |
| Licencia | no disponible (el modelo base usa la licencia Gemma de Google, con restricciones de uso comercial) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-3-270m-it, un transformer decoder-only con atención por grupos (Grouped Query Attention) y ventana de contexto de 128K tokens. El ajuste fino se realizó mediante Supervised Fine-Tuning (SFT) utilizando la libreria TRL (version 1.12.0), con Transformers 5.15.1, PyTorch 2.11.0+cu128, Datasets 5.0.1 y Tokenizers 0.22.2. El dataset de entrenamiento específico no está documentado en la model card, por lo que se desconoce su tamaño, composición y número de pasos de entrenamiento.

No se han publicado detalles sobre procesos de alineación adicionales (RLHF, DPO, etc.) más allá del SFT mencionado. El modelo conserva la capacidad generativa del modelo base, pero se ha especializado en la extracción de información estructurada sobre alimentos y bebidas a partir de texto o captions de imágenes. El nombre interno del checkpoint (`checkpoint_models`) sugiere que se trata de un checkpoint intermedio subido directamente sin una evaluación posterior documentada.

## Capacidades

- Extracción de información estructurada sobre alimentos y bebidas a partir de descripciones de texto o captions de imágenes.
- Generación de texto conversacional, heredada del modelo base Gemma 3 270M.
- Soporte de conversación multi-turno (el modelo base es la variante "it", instruccionada).
- Capacidades multilingües heredadas del modelo base (Gemma 3 soporta más de 140 idiomas, aunque el ajuste fino puede haber afectado a este aspecto).
- No se documenta soporte explícito de tool calling, function calling ni modo agente en la información disponible.

## Casos de uso

- Registro nutricional automatizado: el modelo puede procesar descripciones de comidas (texto o captions de fotos) y extraer campos estructurados como nombre del plato, ingredientes o categoría, para integrarse en aplicaciones de seguimiento de dieta.
- Digitalización de cartas de restaurantes: dado un texto o foto de un menú, el modelo puede estructurar los ítems en un formato JSON o similar para bases de datos o aplicaciones de pedido.
- Análisis de reseñas gastronómicas: a partir de reseñas de usuarios en plataformas como Google Maps o TripAdvisor, el modelo puede extraer menciones de platos, bebidas y valoraciones asociadas para análisis de sentimiento.
- Gestión de inventario en hostelería: procesando descripciones de productos o albaranes, el modelo puede extraer información estructurada sobre ítems de comida y bebida para sistemas de gestión.
- Asistentes de compra de supermercado: integrado en un chatbot, el modelo puede interpretar descripciones de productos alimentarios y extraer atributos clave como marca, tamaño o tipo.
- Etiquetado de datasets para visión por computador: el modelo puede ayudar a generar anotaciones estructuradas a partir de captions de imágenes de alimentos, acelerando el pipeline de datasets para modelos de visión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 268M parámetros, el modelo cabe en cualquier GPU consumer. En FP16 ocupa aproximadamente 0,5 GB de VRAM; en INT8, unos 0,27 GB; en FP32, unos 1,07 GB.
- GPU recomendadas: cualquier GPU con más de 2 GB de VRAM es suficiente (GTX 1060, RTX 3050, etc.). Puede ejecutarse incluso en CPU con llama.cpp u Ollama.
- Compatible con despliegue en edge o dispositivos móviles dado su tamaño reducido.
- Opciones de despliegue: transformers (pipeline de Hugging Face), vLLM, TGI (Text Generation Inference), llama.cpp, Ollama, FriendliAI (según resultados de búsqueda).
- Latencia y throughput: no se han publicado mediciones específicas, pero por su tamaño se espera una latencia de pocos milisegundos por token en GPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| FoodExtract-gemma-3-270m-fine-tune-v1 (este) | 268M | 128K | Extraccion de informacion alimentaria | no disponible (base: Gemma) |
| google/gemma-3-270m-it (base) | 268M | 128K | Modelo generalista instruccionado | Gemma Terms of Use |
| Variantes FoodExtract de otros usuarios (RahulKate-173, mrdbourke) | 268M | 128K | Misma especializacion | Gemma Terms of Use |

El modelo base google/gemma-3-270m-it es la alternativa generalista; las variantes FoodExtract publicadas por otros usuarios (RahulKate-173, mrdbourke) parecen ser el mismo ajuste fino o versiones muy similares, posiblemente reutilizadas o renombradas.

## Limitaciones y advertencias

- La licencia no está especificada en la model card, pero el modelo base google/gemma-3-270m-it utiliza la licencia Gemma de Google, que impone restricciones al uso comercial y requiere aceptación de los términos.
- Al ser un modelo de solo 268M parámetros, puede presentar alucinaciones y errores en tareas complejas de razonamiento o extracción.
- La especialización en alimentos y bebidas puede degradar el rendimiento en otras tareas fuera de ese dominio.
- No se documenta el dataset de entrenamiento del ajuste fino, por lo que se desconocen posibles sesgos introducidos durante el SFT.
- El modelo tiene 0 descargas y 0 likes en Hugging Face, lo que indica que no ha sido validado por la comunidad.
- No se han publicado benchmarks ni evaluaciones independientes del modelo.
- El código de ejemplo en la model card contiene `model="None"` como placeholder, lo que sugiere que la documentación no está pulida para uso en producción.
- La fecha de creación (2026-08-30) es posterior a la fecha actual, lo que sugiere un posible error en los metadatos del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rohan76543/FoodExtract-gemma-3-270m-fine-tune-v1
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- Variante del mismo modelo (mrdbourke): https://huggingface.co/mrdbourke/FoodExtract-gemma-3-270m-fine-tune-v1
- Variante del mismo modelo (RahulKate-173): https://huggingface.co/RahulKate-173/FoodExtract-gemma-3-270m-fine-tune-v1
- Opción de despliegue en FriendliAI: https://friendli.ai/models/isahsn/FoodExtract-gemma-3-270m-fine-tune-v1
- TRL (librería de entrenamiento): https://github.com/huggingface/trl

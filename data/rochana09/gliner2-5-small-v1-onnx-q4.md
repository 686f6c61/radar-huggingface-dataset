# Rochana09/gliner2.5-small-v1-onnx-q4

## Resumen

GLiNER2.5-small-v1 ONNX q4 es una compilación cuantizada del modelo de extracción de entidades nombradas (NER) `fastino/gliner2.5-small-v1`, publicada por el usuario Rochana09. GLiNER es una familia de modelos de reconocimiento de entidades de propósito general que permite definir los tipos de entidad en tiempo de inferencia mediante prompts en lenguaje natural, sin necesidad de reentrenar el modelo para cada esquema de etiquetas. Esta versión concreta empaqueta el modelo en formato ONNX con pesos de las capas MatMul en 4 bits (MatMulNBits, block_size=32, simétrico) y la tabla de embeddings en int8, lo que reduce el tamaño del repositorio a unos 0,1 GB.

El modelo está pensado para despliegues de inferencia en producción donde el tamaño y la latencia importan: el formato ONNX permite ejecutar el modelo con ONNX Runtime en CPU o GPU sin depender de PyTorch, y la cuantización a 4 bits reduce drásticamente los requisitos de memoria frente al checkpoint original en fp32. La arquitectura subyacente es la de GLiNER2.5-small, un encoder transformer de tipo Bidirectional (familia BERT) adaptado para la tarea de entity linking y NER zero-shot. El repositorio incluye varios grafos ONNX separados: el encoder (`model_q4_emb8.onnx`) y los cabezales (`heads`, `records`, `attrs`).

Es relevante ahora porque la cuantización de modelos NER permite integrar extracción de entidades en pipelines de datos, sistemas de búsqueda o agentes con requisitos de hardware modestos, manteniendo la flexibilidad de definir entidades arbitrarias en tiempo de ejecución. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional (encoder tipo BERT) adaptado para NER zero-shot (GLiNER) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MatMul 4-bit (MatMulNBits, block_size=32, simetrico); embeddings int8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (grafos `model_q4_emb8.onnx`, `heads`, `records`, `attrs`) |

## Arquitectura y entrenamiento

El modelo base `fastino/gliner2.5-small-v1` pertenece a la familia GLiNER, que combina un encoder transformer bidireccional con un mecanismo de matching entre representaciones de tokens y representaciones de etiquetas de entidad generadas a partir de prompts textuales. Esto permite al modelo reconocer tipos de entidad definidos en tiempo de inferencia (por ejemplo, "persona", "organización", "producto") sin reentrenamiento. La variante "small" reduce el número de capas y dimensiones ocultas respecto a las variantes mayores de la familia, priorizando latencia y huella de memoria.

Esta publicación concreta no entrena el modelo desde cero: parte del export ONNX `nicolasembleton/gliner2.5-small-v1-onnx` y aplica cuantización post-entrenamiento. Las capas MatMul se cuantizan a 4 bits con MatMulNBits (block_size=32, simétrico) y la tabla de embeddings a int8. El repositorio separa el encoder del resto de cabezales (`heads`, `records`, `attrs`), todos en q4. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original, ya que la model card no los detalla.

## Capacidades

- Extracción de entidades nombradas (NER) zero-shot: permite definir tipos de entidad arbitrarios en tiempo de inferencia mediante prompts.
- Reconocimiento de entidades de propósito general sin reentrenamiento por esquema.
- Procesamiento de texto para tareas de información estructurada (records y attrs según los grafos incluidos).
- Ejecución mediante ONNX Runtime en CPU y GPU, sin dependencia de PyTorch.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling, agentes, visión, audio o thinking mode: no disponibles en la información proporcionada.

## Casos de uso

- Extracción de entidades en pipelines de datos: el modelo puede procesar lotes de documentos y extraer personas, organizaciones y ubicaciones con un esquema definido en tiempo de ejecución, sin reentrenar. La cuantización 4-bit reduce el coste por instancia en servidores CPU.
- Enriquecimiento de bases de datos y motores de búsqueda: integración como paso de anotación para poblar índices con entidades etiquetadas, aprovechando el formato ONNX para desplegar con ONNX Runtime en la misma infraestructura que el resto del pipeline.
- Anonimización y cumplimiento de privacidad: detección de entidades sensibles (nombres, direcciones, identificadores) en textos antes de almacenarlos o enviarlos a terceros, con umbrales de score ajustables por el usuario.
- Procesamiento de correos y tickets de soporte: extracción de nombres de producto, números de pedido o clientes para enrutamiento automático, con un modelo pequeño que cabe en entornos con recursos limitados.
- Preprocesado para sistemas RAG: anotación de entidades en documentos y consultas para mejorar la recuperación y el filtrado, ejecutando el modelo en CPU junto al resto del stack.
- Despliegue en edge o entornos sin GPU: al estar en ONNX cuantizado y ocupar ~0,1 GB, puede ejecutarse en dispositivos con memoria limitada o en contenedores ligeros.
- Extracción estructurada con los grafos `records` y `attrs`: generación de registros con atributos a partir de texto libre, útil para digitalización de formularios o documentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida gracias a la cuantización 4-bit e int8; el repositorio completo ocupa ~0,1 GB, por lo que la huella en memoria es del orden de cientos de MB incluyendo el runtime.
- GPU recomendadas: no se especifican; al ser un modelo small cuantizado, cualquier GPU con soporte de ONNX Runtime (por ejemplo, RTX 3060 en adelante) es suficiente. También puede ejecutarse en CPU.
- Cabe en GPU de consumo: sí, con amplio margen, dado el tamaño del repositorio.
- Opciones de despliegue: ONNX Runtime (CPU/CUDA), integración con la librería `gliner`; no se indica soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Rochana09/gliner2.5-small-v1-onnx-q4 | no disponible | no disponible | ONNX q4 + int8 | Apache 2.0 | Cuantizado, ~0,1 GB, sin benchmarks publicados |
| fastino/gliner2.5-small-v1 | no disponible | no disponible | PyTorch (safetensors) | no disponible | Modelo base sin cuantizar |
| nicolasembleton/gliner2.5-small-v1-onnx | no disponible | no disponible | ONNX (fp32) | no disponible | Export ONNX del que deriva esta versión |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- La cuantización a 4 bits e int8 puede degradar ligeramente la calidad respecto a fp32; el autor recomienda recalibrar los umbrales de score sobre datos propios.
- Riesgo de alucinación y falsos positivos en la extracción de entidades, especialmente con umbrales de score bajos o esquemas de etiquetas ambiguos.
- No hay información sobre sesgos del modelo base ni sobre su cobertura idiomática.
- Los umbrales de confianza óptimos dependen del dominio y deben validarse antes de usar en producción.
- El repositorio no incluye benchmarks ni métricas de calidad publicadas; la evaluación queda a cargo del usuario.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base y del export ONNX de origen.
- Al ser un modelo NER y no un LLM generativo, no soporta tool calling, agentes ni generación libre de texto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Rochana09/gliner2.5-small-v1-onnx-q4
- Modelo base: https://huggingface.co/fastino/gliner2.5-small-v1
- Export ONNX de origen: https://huggingface.co/nicolasembleton/gliner2.5-small-v1-onnx

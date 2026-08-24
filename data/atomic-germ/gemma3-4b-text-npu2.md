# Atomic-Germ/Gemma3-4B-Text-NPU2

## Resumen

Atomic-Germ/Gemma3-4B-Text-NPU2 es una variante del modelo Gemma 3 4B de Google DeepMind, publicada por el usuario Atomic-Germ en Hugging Face. Se basa en el checkpoint oficial `google/gemma-3-4b-it-qat-q4_0-unquantized`, que corresponde a la versión ajustada por instrucciones (instruction-tuned) con cuantización QAT Q4_0. El sufijo "NPU2" sugiere una adaptación para aceleradores de redes neuronales (NPU), aunque no se dispone de documentación específica del autor que lo confirme.

Gemma 3 es una familia de modelos abiertos desarrollada por Google a partir de la tecnología usada en Gemini. Este modelo en particular, con 4.000 millones de parámetros, está diseñado para ejecutarse en entornos con recursos limitados, como portátiles, escritorios o infraestructura cloud propia. La model card oficial describe soporte multimodal (texto e imagen) y una ventana de contexto de 128K tokens, aunque el repositorio concreto etiqueta el modelo como `gemma3_text`, lo que podría indicar una variante solo de texto. Su relevancia actual radica en que ofrece capacidades de razonamiento, generación de código y soporte multilingüe en un formato compacto y desplegable en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3) con atención local y global, y cuantización QAT Q4_0 |
| Parametros totales | 4.000 millones (4B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (entrada); 8.192 tokens de salida |
| Tipos de cuantizacion | QAT Q4_0 (según el modelo base `-qat-q4_0-unquantized`); otras cuantizaciones no especificadas |
| Idiomas soportados | Más de 140 idiomas (según model card oficial); el frontmatter del repositorio indica solo `en` |
| Licencia | Gemma (licencia de uso de Google DeepMind) |
| Formato de pesos | safetensors (repositorio de 7,6 GB) |

## Arquitectura y entrenamiento

La arquitectura base es la de Gemma 3, un transformer multimodal desarrollado por Google DeepMind que procesa texto e imágenes (aunque este repositorio concreto está etiquetado como `gemma3_text`, lo que sugiere una versión solo de texto o una adaptación para NPU). El modelo se entrenó con 4 billones de tokens de datos de texto, código y matemáticas, además de imágenes, con filtrado riguroso de contenido sensible y CSAM. El entrenamiento se realizó con hardware TPU (TPUv4p, TPUv5p y TPUv5e) usando JAX y ML Pathways. El checkpoint base de este repositorio es una versión cuantizada con QAT Q4_0, lo que implica una cuantización consciente del entrenamiento (quantization-aware training) que reduce el tamaño del modelo manteniendo parte de la calidad. No se dispone de información sobre fine-tuning adicional o técnicas como RLHF/DPO aplicadas específicamente por Atomic-Germ.

## Capacidades

- Generación de texto: responde a preguntas, resume documentos y genera contenido coherente en más de 140 idiomas según la model card oficial.
- Razonamiento: soporta tareas de razonamiento lógico y matemático, aunque no se especifican benchmarks concretos para esta variante.
- Generación de código: entrenado con datos de código, es capaz de generar y entender fragmentos de programación.
- Comprensión de imágenes: la arquitectura Gemma 3 es multimodal, pero el tag `gemma3_text` de este repositorio sugiere que la variante NPU2 puede estar limitada a texto; no se confirma el soporte de visión en esta versión.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible; el modelo base Gemma 3 no documenta de forma explícita estas capacidades en la model card.
- Capacidades multilingües: según la model card oficial, soporta más de 140 idiomas, aunque el frontmatter del repositorio solo indica `en`.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de 128K tokens, lo que permite mantener historiales de conversación extensos sin perder el hilo.
- Generación de código en producción: con soporte de generación de código, puede integrarse en pipelines de CI/CD para autocompletar funciones, generar tests o documentar APIs, aunque se debe validar su rendimiento en tareas de código antes de usarlo en entornos críticos.
- Resumen de documentos largos: la ventana de 128K tokens permite procesar documentos extensos (informes, artículos, contratos) y generar resúmenes concisos en un solo paso.
- Asistente de programación local: dado su tamaño compacto (4B) y cuantización Q4_0, puede ejecutarse en portátiles o estaciones de trabajo con GPU moderada, ofreciendo asistencia de código sin conexión.
- Chatbot multilingüe: el soporte de más de 140 idiomas permite construir asistentes conversacionales para mercados globales, aunque la variante NPU2 solo confirma inglés.
- Aplicaciones de razonamiento matemático: puede resolver problemas matemáticos y lógicos, útil en entornos educativos o de análisis de datos, aunque se debe validar su precisión con benchmarks locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este modelo concreto (Atomic-Germ/Gemma3-4B-Text-NPU2). La model card oficial de Gemma 3 no incluye números de rendimiento en el extracto proporcionado, y el repositorio no muestra métricas propias. Se recomienda evaluar el modelo en tareas específicas antes de usarlo en producción.

## Requisitos de hardware

- VRAM estimada: para un modelo de 4B con cuantización Q4_0, se estiman entre 3 y 5 GB de VRAM para inferencia en FP16; con cuantización Q4_0, puede reducirse a aproximadamente 2-3 GB.
- GPU recomendadas: RTX 3060/4070 (12 GB), RTX 4090 (24 GB) o GPUs de datacenter como A100 o H100 para mayor throughput; también puede ejecutarse en CPU con RAM suficiente (16-32 GB).
- Cabe en GPU de consumo: sí, la mayoría de GPU modernas con al menos 8 GB de VRAM pueden ejecutar este modelo con cuantización.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (Text Generation Inference) y transformers con la librería de Hugging Face.
- Latencia y throughput: no disponible; se espera que sea inferior a modelos de 12B o 27B, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Atomic-Germ/Gemma3-4B-Text-NPU2 | 4B | 128K | Gemma | Hugging Face |
| google/gemma-3-4b-it | 4B | 128K | Gemma | Hugging Face, Kaggle, Vertex AI |
| google/gemma-3-12b-it | 12B | 128K | Gemma | Hugging Face, Kaggle, Vertex AI |
| Meta-Llama-3-8B-Instruct | 8B | 8K | Llama 3 License | Hugging Face |

La comparativa se basa en datos públicos; este repositorio es una variante cuantizada de Gemma 3 4B, por lo que su rendimiento debería ser similar al modelo base, pero con menor huella de memoria. No se dispone de benchmarks directos para la variante NPU2.

## Limitaciones y advertencias

- Sesgos conocidos: la model card oficial de Gemma 3 no detalla sesgos específicos, pero como modelo entrenado con datos web, puede heredar sesgos de género, raza o cultura; se recomienda evaluar en el dominio de uso.
- Riesgo de alucinación: como todos los LLM, puede generar información falsa o inventada; se recomienda verificar salidas en aplicaciones críticas.
- Limitaciones de contexto: aunque la ventana es de 128K tokens, la salida máxima es de 8.192 tokens, lo que limita la longitud de respuestas generadas.
- Restricciones de licencia: la licencia Gemma tiene términos de uso específicos, incluyendo restricciones para ciertos usos comerciales; se debe revisar la política de uso de Google antes de desplegar en producción.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es una publicación reciente o poco utilizada; se recomienda validar su funcionamiento antes de confiar en él.
- El tag `gemma3_text` y el nombre "Text" sugieren que esta variante podría no incluir capacidades multimodales de imagen, aunque la model card base las describe; verificar la arquitectura real antes de asumir soporte de imágenes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Atomic-Germ/Gemma3-4B-Text-NPU2
- Modelo base en Hugging Face: https://huggingface.co/google/gemma-3-4b-it-qat-q4_0-unquantized
- Página oficial de Gemma 3: https://deepmind.google/models/gemma/gemma-3/
- Documentación de Gemma en Google AI: https://ai.google.dev/gemma/docs/core
- Technical Report de Gemma 3: https://goo.gle/Gemma3Report
- Toolkit de IA responsable: https://ai.google.dev/responsible-ai
- Gemma en Kaggle: https://www.kaggle.com/models/google/gemma-3
- Gemma en Vertex Model Garden: https://console.cloud.google.com/vertex-ai/publishers/google/model-garden/gemma3
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
- Gemma 3 en Ollama: https://ollama.com/library/gemma3:4b

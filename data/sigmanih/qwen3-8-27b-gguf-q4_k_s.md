# sigmanih/Qwen3.8-27B-GGUF-Q4_K_S

## Resumen

Este repositorio contiene una cuantización GGUF en formato Q4_K_S del modelo Qwen3.8-27B, publicada por el usuario sigmanih a través de Sigma Studio. El modelo base, desarrollado por Alibaba Qwen, es un transformer denso de 27 320 millones de parámetros con arquitectura híbrida: combina atención lineal (Gated DeltaNet) en 48 de sus 64 capas con atención completa (Gated Attention) en las 16 restantes. Incorpora además un vision tower para entrada multimodal y un cabezal de decodificación especulativa (MTP) integrado.

La relevancia de esta cuantización radica en que permite ejecutar un modelo de 27B con ventana de contexto nativa de 262 144 tokens (extensible a 1M) en hardware de consumo, ya que el archivo GGUF ocupa aproximadamente 15,8 GB. El modelo base destaca por sus capacidades de razonamiento, visión y codificación agéntica, y esta versión cuantizada lo hace accesible para despliegues locales con llama.cpp o SigmaEngine.

La licencia Apache 2.0 facilita su uso comercial sin restricciones significativas, aunque la model card declara soporte únicamente para inglés e italiano, lo que limita su aplicación multilingüe en esta versión específica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 64 capas, 48 con Gated DeltaNet (atención lineal) y 16 con Gated Attention; vision tower y cabezal MTP |
| Parametros totales | 27 320 697 856 (27,3B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativo, extensible a 1 048 576 |
| Tipos de cuantizacion | Q4_K_S (este repositorio) |
| Idiomas soportados | en, it (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida que alterna bloques de atención lineal y atención completa. La disposición de capas, según la model card oficial, es `16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN))`, lo que da un total de 64 capas. Las 48 capas con Gated DeltaNet reducen el coste computacional en contextos largos, mientras que las 16 capas con atención completa preservan la capacidad de recuperación de información precisa. El modelo incluye un vision tower para procesar imágenes y un cabezal MTP (Multi-Token Prediction) que acelera la decodificación mediante predicción especulativa.

No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens procesados ni las técnicas de alineación (RLHF, DPO, etc.) en la documentación proporcionada. La cuantización Q4_K_S aplicada en este repositorio reduce la precisión de los pesos a 4 bits, lo que disminuye el requisito de memoria a costa de una ligera pérdida de calidad respecto al modelo en precisión completa.

## Capacidades

- Generación de texto y conversación multi-turno en inglés e italiano.
- Razonamiento paso a paso y resolución de problemas matemáticos, con puntuaciones destacadas en el benchmark MathVision (90,0 sin herramientas, 94,6 con code interpreter).
- Comprensión de imágenes gracias al vision tower integrado, lo que permite tareas de visión-lenguaje.
- Codificación agéntica: el modelo está optimizado para tareas de agente que requieren planificación, uso de herramientas y ejecución de código.
- Decodificación especulativa mediante el cabezal MTP, que acelera la inferencia sin necesidad de un modelo draft externo.
- Soporte de tool calling y function calling, habilitado por su entrenamiento orientado a agentes.
- Ventana de contexto de 262K tokens, adecuada para documentos extensos y conversaciones de larga duración.

## Casos de uso

- Asistencia al cliente multilingüe: con soporte para inglés e italiano y una ventana de 262K tokens, el modelo puede gestionar conversaciones largas con historial completo, manteniendo el contexto de interacciones previas sin truncamiento.
- Análisis de documentos extensos: su contexto nativo de 262K tokens permite procesar informes financieros, contratos o artículos científicos completos en una sola pasada, extrayendo información y resumiendo sin necesidad de dividir el texto.
- Generación de código en entornos de desarrollo: gracias a sus capacidades de razonamiento y tool calling, puede integrarse en pipelines de CI/CD para revisar código, generar tests o autocompletar funciones, ejecutándose localmente con llama.cpp.
- Agentes autónomos de automatización: el modelo puede planificar y ejecutar tareas multi-paso, como orquestar APIs, consultar bases de datos o interactuar con herramientas externas, aprovechando su soporte de function calling.
- Asistente de visión para soporte técnico: al combinar entrada de imágenes con razonamiento, puede analizar capturas de pantalla o diagramas para diagnosticar problemas y proponer soluciones.
- Investigación académica en NLP: su licencia Apache 2.0 y su formato GGUF permiten a investigadores reproducir experimentos de razonamiento o visión en hardware local, sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización Q4_K_S. Los datos disponibles corresponden al modelo base Qwen3.8-27B en precisión completa, según la model card oficial:

| Benchmark | Resultado |
|---|---|
| MathVision (sin code interpreter) | 90,0 |
| MathVision (con code interpreter) | 94,6 |

Estos valores indican el rendimiento del modelo sin cuantizar; la versión Q4_K_S puede presentar una degradación leve en tareas de razonamiento complejo, aunque no se dispone de mediciones cuantitativas al respecto.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF Q4_K_S ocupa 15,8 GB, por lo que se recomiendan al menos 16 GB de VRAM para inferencia cómoda. Con offloading parcial de capas a CPU, podría ejecutarse con 12 GB.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40 GB o superiores. En GPUs con 16 GB (como RTX 4080 o A10G) es viable con cuantización más agresiva o menor contexto.
- Compatibilidad con hardware de consumo: sí, cabe en GPUs consumer de gama alta (RTX 3090/4090) y en Mac con 32 GB de RAM unificada mediante llama.cpp.
- Opciones de despliegue: llama.cpp, SigmaEngine (el motor propio de Sigma Studio), Ollama (si se convierte el GGUF a formato compatible) y cualquier runtime que soporte GGUF. vLLM no consume GGUF directamente, pero puede cargar el modelo base en safetensors.
- Latencia y throughput: no disponible. Depende del hardware, la longitud de contexto y el uso del cabezal MTP, que acelera la generación entre 1,5x y 2x en comparación con decodificación autoregresiva estándar.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos para esta cuantización frente a otros modelos de tamaño similar. Como referencia cualitativa, se puede comparar con el propio Qwen3.8-27B sin cuantizar y con otros modelos de 27B del ecosistema GGUF:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,3B | 262K | Apache 2.0 | safetensors | Precisión completa, requiere ~60 GB VRAM |
| sigmanih/Qwen3.8-27B-GGUF-Q4_K_S | 27,3B | 262K | Apache 2.0 | GGUF | Cuantización 4-bit, ~16 GB VRAM |
| Otros GGUF de Qwen3.8-27B (p.ej. unsloth) | 27,3B | 262K | Apache 2.0 | GGUF | Varias cuantizaciones disponibles (Q2_K a Q8_0) |

La principal diferencia entre esta cuantización y otras del mismo modelo es el nivel de precisión: Q4_K_S ofrece un equilibrio entre calidad y tamaño, mientras que cuantizaciones más bajas (Q2_K) reducen aún más los requisitos de memoria a costa de mayor pérdida de fidelidad.

## Limitaciones y advertencias

- La cuantización Q4_K_S introduce pérdida de precisión respecto al modelo original, lo que puede afectar a tareas de razonamiento matemático o generación de código complejo.
- La model card declara soporte únicamente para inglés e italiano. Aunque el modelo base probablemente entienda otros idiomas, esta versión no garantiza calidad en español, francés, etc.
- No se han publicado evaluaciones de sesgos o alucinaciones para esta cuantización. Como todo modelo de lenguaje, puede generar contenido falso o inventado, especialmente en contextos largos.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad. Se recomienda verificar su funcionamiento antes de usarlo en producción.
- La fecha de creación (2026-08-23) es posterior a la fecha actual, lo que podría indicar un error en los metadatos o un modelo publicado de forma anticipada.
- La licencia Apache 2.0 permite uso comercial, pero se debe atribuir correctamente la autoría del modelo base (Qwen) según los términos de la licencia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sigmanih/Qwen3.8-27B-GGUF-Q4_K_S
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantización GGUF de unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Documentación de Unsloth sobre Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Análisis técnico de Qwen3.8-27B en una GPU de consumo: https://rits.shanghai.nyu.edu/ai/qwen3-8-27b-one-gpu/
- Sigma Studio (herramienta de publicación): https://github.com/Sigmanih/SigmaStudio

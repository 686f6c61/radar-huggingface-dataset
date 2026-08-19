# FenomAI/Qwen3.8-27B-AWQ-INT4

## Resumen

FenomAI/Qwen3.8-27B-AWQ-INT4 es una cuantización AWQ de 4 bits del modelo Qwen3.8-27B, un modelo de lenguaje causal con encoder de visión desarrollado por Qwen (Alibaba). Esta versión cuantizada, publicada por FenomAI, reduce el peso del modelo original de aproximadamente 54 GB (en FP16) a 21 GB, lo que permite ejecutarlo en hardware más asequible sin renunciar a las capacidades de visión, razonamiento y ejecución de tareas agénticas del modelo base.

El modelo base Qwen3.8-27B es un modelo denso de 27 000 millones de parámetros con una arquitectura híbrida que combina atención lineal (Gated DeltaNet) y atención completa (Gated Attention), junto con un encoder de visión nativo para imágenes y vídeo. Ofrece una ventana de contexto nativa de 262 144 tokens, extensible hasta 1 000 000, y soporta control flexible de razonamiento (thinking mode). Esta cuantización AWQ INT4 mantiene la compatibilidad con los principales motores de inferencia como vLLM, SGLang y Transformers, lo que la convierte en una opción práctica para despliegues locales y en producción.

La relevancia de esta ficha radica en que es una de las primeras cuantizaciones disponibles de Qwen3.8-27B, un modelo que destaca por su rendimiento en tareas de codificación, razonamiento profesional y agentes autónomos de largo alcance, y que ahora puede ejecutarse en GPUs de consumo con 16-24 GB de VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; híbrido Gated DeltaNet (atención lineal) + Gated Attention (atención completa) |
| Parametros totales | 27 781 427 952 (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativo, extensible a 1 000 000 |
| Tipos de cuantizacion | AWQ INT4 (esta versión); también disponible GGUF de unsloth |
| Idiomas soportados | EN, ZH, HI, AR, RU, JA, KO, NL, FR, ES |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

Qwen3.8-27B emplea una arquitectura híbrida que combina dos mecanismos de atención en un patrón repetido 16 veces: cada bloque contiene 3 sub-bloques de Gated DeltaNet (atención lineal con 48 cabezas para V y 16 para QK, dimensión de cabeza 128) seguidos de una capa FFN, y después un sub-bloque de Gated Attention (atención completa con 24 cabezas para Q y 4 para KV, dimensión de cabeza 256, RoPE de 64 dimensiones) seguido de otra FFN. La dimensión oculta es 5120 y la FFN tiene dimensión intermedia 17 408. El modelo incorpora Multi-Token Prediction (MTP) entrenado con múltiples pasos, lo que mejora la eficiencia de decodificación.

El entrenamiento incluye fases de pre-entrenamiento y post-entrenamiento, aunque no se han publicado detalles sobre el número de tokens o la composición del dataset. Para esta cuantización AWQ, FenomAI utilizó un dataset de calibración denominado "STEM and Agentic" (disponible en Hugging Face como `cyankiwi/calibration-medium`), orientado a preservar el rendimiento en tareas científicas y agénticas. La cuantización AWQ (Activation-aware Weight Quantization) selecciona los pesos más relevantes según las activaciones, minimizando la pérdida de precisión frente a métodos de cuantización estándar.

## Capacidades

- Generación de texto y razonamiento complejo, con control flexible de pensamiento: el modo thinking está activado por defecto y puede desactivarse por petición; la profundidad de razonamiento se ajusta con `reasoning_effort` y el contexto de razonamiento histórico se conserva mediante `preserve_thinking`.
- Comprensión de imágenes y vídeo de forma nativa: puede procesar diagramas STEM, documentos escaneados, capturas de pantalla y vídeos de hasta una hora de duración.
- Ejecución de tareas agénticas de largo alcance: planificación autónoma, manejo de feedback del entorno y finalización fiable de tareas multi-paso.
- Soporte de tool calling y function calling, lo que permite integrarse con APIs y herramientas externas.
- Capacidades multilingües en 10 idiomas: inglés, chino, hindi, árabe, ruso, japonés, coreano, neerlandés, francés y español.
- Compatibilidad con múltiples motores de inferencia: Transformers, vLLM, SGLang y TokenSpeed, lo que facilita su integración en pipelines existentes.

## Casos de uso

- Asistente de programación con visión: el modelo puede analizar capturas de pantalla de errores, diagramas de arquitectura o esquemas de bases de datos y generar código o sugerencias de corrección, gracias a su encoder de visión y su capacidad de razonamiento.
- Automatización de tareas de agente en navegación web: con su planificación autónoma y manejo de feedback, puede ejecutar flujos multi-paso como rellenar formularios, extraer datos de varias páginas o interactuar con APIs, usando tool calling.
- Análisis de documentos técnicos y científicos: procesa PDFs con figuras, tablas y ecuaciones, y responde preguntas sobre su contenido, aprovechando el contexto de 262K tokens para documentos extensos.
- Resumen y análisis de vídeo: al aceptar entrada de vídeo, puede generar resúmenes de reuniones grabadas, tutoriales o vigilancia, identificando eventos clave.
- Chatbot multilingüe de atención al cliente: con soporte en 10 idiomas y contexto largo, puede mantener conversaciones prolongadas con historial completo, reduciendo la pérdida de información.
- Sistema RAG sobre documentación extensa: su ventana de 262K tokens permite indexar y consultar manuales técnicos, bases de conocimiento o libros completos sin necesidad de fragmentación agresiva.
- Desarrollo de agentes autónomos para investigación: puede planificar experimentos, consultar bases de datos y ejecutar scripts, integrando razonamiento y herramientas en un bucle cerrado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta versión cuantizada AWQ INT4. El modelo base Qwen3.8-27B reporta, según el blog de Lovable App, puntuaciones de 42.2 en DeepSWE, 73.0 en Terminal Bench y 84.3 en OSWorld, aunque estos datos no han sido verificados de forma independiente y corresponden al modelo sin cuantizar. No se dispone de la tabla completa de benchmarks de la model card original, por lo que no es posible presentar una comparación exhaustiva. Se recomienda evaluar el modelo cuantizado en las tareas objetivo antes de su despliegue en producción.

## Requisitos de hardware

- El tamaño del repositorio es de 21.0 GB, lo que corresponde a los pesos cuantizados en INT4. Para cargar el modelo completo en memoria se recomienda una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 4090, A100 40GB, L40S).
- Según la revisión de Geeky Gadgets, el modelo puede ejecutarse en 17 GB de VRAM, lo que sugiere que con contexto reducido o técnicas de offloading podría caber en GPUs de 16 GB como la RTX 4080 o la RTX 3090.
- Para contexto completo de 262K tokens, se necesitará memoria adicional para las cachés de atención; se recomienda al menos 32 GB de VRAM o el uso de atención con ventana deslizante.
- Opciones de despliegue: vLLM, SGLang, Transformers con `device_map="auto"`, TokenSpeed, y llama.cpp si se utiliza la versión GGUF de unsloth.
- La latencia y el throughput dependen del hardware y del motor de inferencia; no se han publicado cifras oficiales para esta cuantización.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados entre esta cuantización y otras alternativas. El modelo base Qwen3.8-27B se posiciona como un modelo denso de 27B con visión, comparable a otros modelos de tamaño similar como Qwen2.5-32B (sin visión) o InternVL2-26B, pero no se han encontrado benchmarks que los contrasten directamente. La ventaja principal de esta versión cuantizada es su menor huella de memoria frente al modelo original, manteniendo la licencia Apache 2.0.

## Limitaciones y advertencias

- La cuantización AWQ INT4 introduce una pérdida de precisión respecto al modelo original en FP16, que puede manifestarse en tareas de razonamiento complejo o generación de código muy sensible a los detalles.
- No se han publicado evaluaciones de sesgos o alucinaciones específicas para esta versión cuantizada; como todo modelo de lenguaje, existe riesgo de generar información falsa o inconsistente, especialmente en contextos largos.
- Aunque el contexto nativo es de 262K tokens, el rendimiento puede degradarse en los extremos de la ventana; se recomienda validar con casos de uso reales.
- El modelo base está entrenado principalmente en inglés y chino, con soporte adicional para otros 8 idiomas; la calidad en idiomas minoritarios puede ser inferior.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero no incluye garantías de soporte oficial por parte de Qwen o FenomAI.
- Para producción, es recomendable probar la cuantización con los motores de inferencia previstos, ya que el comportamiento puede variar entre vLLM, SGLang y Transformers.

## Enlaces

- Modelo cuantizado en Hugging Face: https://huggingface.co/FenomAI/Qwen3.8-27B-AWQ-INT4
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Página del modelo en LM Studio: https://lmstudio.ai/models/qwen/qwen3.8-27b
- Ficha en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-8-27b/
- Guía completa en Lovable App: https://lovableapp.org/blog/qwen3-8-27b
- Revisión en Geeky Gadgets: https://www.geeky-gadgets.com/qwen-3-8-27b-local-ai-review/
- Dataset de calibración usado: https://huggingface.co/datasets/cyankiwi/calibration-medium

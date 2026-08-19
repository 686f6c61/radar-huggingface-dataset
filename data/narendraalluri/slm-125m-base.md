# narendraalluri/slm-125m-base

## Resumen

`slm-125m-base` es un modelo de lenguaje causal de 125,8 millones de parámetros, con arquitectura estilo Llama, preentrenado desde cero (random weights) sobre un corpus predominantemente jurídico y financiero. Lo desarrolla el usuario de Hugging Face `narendraalluri` como parte de un proyecto de investigación en modelos de lenguaje pequeños (SLM) especializados en el dominio legal. No se trata de un ajuste fino de un checkpoint existente: el tokenizador, el corpus y los pesos se construyeron íntegramente desde el inicio.

El modelo resuelve el problema de disponer de un modelo base compacto y abierto (licencia Apache 2.0) capaz de generar prosa legal y financiera con un registro y formato de citas correctos, aunque sin garantía de veracidad factual. Con una ventana de contexto de 1024 tokens y un vocabulario byte-level BPE de 16 384 entradas, está pensado para experimentación e investigación, no para uso en producción sin capas adicionales de verificación. Su relevancia radica en demostrar que es posible entrenar un SLM especializado con un coste mínimo (unos 7 dólares en 8 H100 durante 13 minutos) y con una perplejidad de validación de 10,42 sobre datos reservados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal estilo Llama (MHA, SwiGLU, RMSNorm, RoPE) |
| Parametros totales | 125 848 320 (según safetensors; la model card indica 125 847 552) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (pesos en bf16; se puede cuantizar posteriormente con herramientas estándar) |
| Idiomas soportados | no disponible (corpus principalmente en inglés, aunque no se declara oficialmente) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer causal de 12 capas, con tamaño oculto de 768, 12 cabezas de atención (dimensión 64 por cabeza), MLP SwiGLU con dimensión interna 3072, normalización RMSNorm con pre-norm y posiciones RoPE (theta 10000). Los embeddings de entrada y salida están atados (tied), por lo que el archivo `model.safetensors` no contiene un `lm_head.weight` separado; esto es intencional y no un error de subida.

El entrenamiento se realizó desde cero sobre un corpus mixto con proporción aproximada 40/40/20: jurisprudencia estadounidense (fuente `HFforLegal/case-law`), documentos SEC (`PleIAs/SEC`) y texto web educativo general (`HuggingFaceFW/fineweb-edu`) como base de fluidez. El pipeline de limpieza incluyó filtrado de calidad, idioma y OCR, deduplicación exacta y MinHash, y decontaminación de 13-gramas contra los conjuntos reservados `casehold/casehold` y `coastalcph/lex_glue`. Se procesaron 2 040 millones de tokens en una sola época, con 3890 pasos, batch de aproximadamente 524 000 tokens por paso, optimizador AdamW (beta 0,9 y 0,95, weight decay 0,1), tasa de aprendizaje con decaimiento coseno de 6e-4 a 6e-5, y precisión bf16. El entrenamiento se ejecutó en un nodo con 8 GPU H100 mediante DDP, con un coste total de 7,05 dólares y una duración de 13,4 minutos. La perplejidad de validación sobre datos reservados fue de 10,42.

## Capacidades

- Generación de texto autocompletado: el modelo continúa fragmentos de prosa legal y financiera con un registro formal y estructura de citas (nombres de casos, números de reporter, cifras) que imitan el estilo del dominio.
- Modelo base: no ha sido entrenado con instrucciones ni plantillas de chat, por lo que no sigue órdenes ni responde preguntas de forma directa.
- Tokenizador propio: byte-level BPE entrenado sobre el corpus legal, con 16 384 tokens, que incluye tokens especiales `<|user|>` y `<|assistant|>` (aunque no se usaron durante el entrenamiento).
- Fluidez general: al incluir una fracción de texto educativo general, el modelo mantiene cierta capacidad de generar inglés correcto fuera del dominio legal, aunque su especialización es clara.
- Compatibilidad con transformers: se puede cargar con `AutoModelForCausalLM` y `AutoTokenizer` estándar, y es compatible con `text-generation-inference` y `endpoints_compatible` según las etiquetas del repositorio.

## Casos de uso

- Investigación en modelos de lenguaje especializados: sirve como punto de partida para estudiar el comportamiento de SLM entrenados desde cero en dominios verticales, comparando perplejidad y calidad de generación frente a modelos generalistas del mismo tamaño.
- Generación de borradores de documentos legales: puede usarse para completar plantillas de escritos, contratos o memorandos, siempre que el resultado sea revisado por un profesional. Su registro formal y conocimiento implícito de la estructura de citas facilita la redacción inicial.
- Aumento de datos para entrenamiento posterior: al ser un modelo base, puede emplearse para generar texto sintético legal que luego se filtre y utilice como datos de entrenamiento para modelos más grandes o para ajuste fino supervisado.
- Evaluación de técnicas de decontaminación y deduplicación: el pipeline de entrenamiento documentado permite reproducir y evaluar metodologías de limpieza de corpus en dominios con jerga específica.
- Pruebas de eficiencia de entrenamiento: su bajo coste (7,05 dólares) lo convierte en un banco de pruebas ideal para experimentar con configuraciones de hiperparámetros, arquitecturas o estrategias de escalado antes de aplicar los hallazgos a modelos mayores.
- Benchmark de generación con contexto corto: con solo 1024 tokens de ventana, es útil para evaluar tareas de completado de texto breve, como rellenar cláusulas o continuar párrafos legales, donde el contexto largo no es imprescindible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento reportado es la perplejidad de validación sobre datos reservados, que es de 10,42. Este valor debe interpretarse con cautela, ya que la perplejidad no mide la exactitud factual ni la capacidad de seguir instrucciones, y un modelo base de este tamaño no es comparable directamente con modelos de mayor escala en tareas generales.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 125,8 millones de parámetros en bf16, lo que supone aproximadamente 0,25 GB de pesos; con overhead de activaciones, cabe en menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; funciona en tarjetas consumer como GTX 1060, RTX 2060, RTX 3060, etc. Incluso puede ejecutarse en CPU con razonable velocidad gracias a su tamaño reducido.
- Opciones de despliegue: compatible con la librería `transformers` de Hugging Face, `text-generation-inference` (según las etiquetas del repositorio), y puede convertirse a GGUF para usarse con `llama.cpp` u Ollama, aunque no se proporcionan cuantizaciones precalculadas.
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamaño, se espera una latencia de decenas de milisegundos por token en GPU moderna y de unos pocos cientos de milisegundos en CPU, pero estos valores son estimaciones orientativas.

## Comparativa con modelos similares

No se dispone de una comparativa formal con otros modelos en la información proporcionada. Existe una variante del mismo proyecto publicada por el usuario `DeependraVerma` bajo el nombre `slm-125m-base` (aparentemente el mismo modelo o una copia), así como un ajuste fino supervisado `legal-slm-125m-sft` con licencia MIT, pero no hay datos de benchmarks comparativos. Modelos generalistas del mismo tamaño, como GPT-2 small (124M) o Pythia-160M, no se mencionan en las fuentes, por lo que no se puede establecer una comparación rigurosa sin datos adicionales.

## Limitaciones y advertencias

- Modelo base, no asistente: no ha sido entrenado con instrucciones ni datos de chat, por lo que no sigue órdenes ni responde preguntas; intentar usarlo como asistente producirá resultados incoherentes.
- Alucinación factual severa: el propio autor advierte que el modelo inventa nombres de casos, números de reporter y cifras con apariencia plausible. No debe utilizarse para asesoramiento legal ni para generar contenido factual sin verificación externa.
- Ventana de contexto limitada: 1024 tokens, insuficiente para documentos legales extensos o tareas que requieran razonamiento sobre múltiples páginas.
- Idiomas no declarados: aunque el corpus es principalmente inglés, no se especifica oficialmente la cobertura idiomática; es probable que tenga un rendimiento muy pobre fuera del inglés.
- Riesgo de sesgos: al entrenarse sobre jurisprudencia y documentos SEC de EE. UU., el modelo puede reflejar sesgos presentes en esas fuentes (sesgo jurisdiccional, de género, étnico, etc.).
- Sin garantías de producción: al ser un modelo de investigación con una sola época y un corpus pequeño (2B tokens), su calidad es limitada y no está diseñado para despliegues comerciales sin un ajuste adicional.
- Restricciones de licencia: aunque la licencia Apache 2.0 permite uso comercial, el autor no ofrece ninguna garantía sobre la exactitud o idoneidad del modelo para fines legales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/narendraalluri/slm-125m-base
- Variante del mismo modelo (usuario DeependraVerma): https://huggingface.co/DeependraVerma/slm-125m-base
- Ajuste fino supervisado del mismo proyecto: https://huggingface.co/DeependraVerma/legal-slm-125m-sft
- Repositorio GitHub con el pipeline de entrenamiento (proyecto relacionado): https://github.com/Ace-2504/125M-model-base
- Ficha en LLM Explorer: https://llm-explorer.com/model/DeependraVerma%2Fslm-125m-base,5Mq8qneCUUFZSHDWSEESrE
- Página de presentación del proyecto (Deependra Verma): https://deependraverma-ai-legal-slm-125-m.vercel.app/

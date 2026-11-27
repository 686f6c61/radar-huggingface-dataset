# DICPlay/RusMind-Zernyshko-2.0.1-GGUF

## Resumen

RusMind Zernyshko 2.0.1 es un modelo de lenguaje compacto de 342 millones de parámetros entrenado desde cero por DICPlay, con un tokenizador propio de 48.000 tokens optimizado para ruso. Se distribuye principalmente en formato GGUF para su uso en llama.cpp, LM Studio y Ollama, y está diseñado para ejecutarse íntegramente en local, sin conexión, en hardware de consumo como portátiles o teléfonos móviles.

El modelo se presenta como la versión 2.0.1 de la línea "Zernyshko" (en ruso, "semillita"), una familia de modelos compactos de la iniciativa RusMind. Su propuesta de valor es cubrir tareas conversacionales básicas en ruso —aritmética sencilla, generación de JSON, llamada a herramientas, explicación de conceptos cotidianos— con un consumo de recursos mínimo (219 MB en cuantización Q4_K_M, 367 MB en Q8_0). Emplea una arquitectura transformer decoder con RMSNorm, RoPE, SwiGLU y GQA con ratio 16/4, y una ventana de contexto de 4.096 tokens.

Es relevante para desarrolladores que necesiten un modelo ruso ligero, desplegable en entornos sin GPU y con requisitos de latencia bajos, o como caso de estudio de entrenamiento desde cero con datos y tokenizador propios. No obstante, sus capacidades son limitadas por escala: los resultados publicados por el autor (74/120 en un test interno, 0,054 en MERA 2.0) sitúan el modelo en un rango de competencia muy básico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (RMSNorm, RoPE, SwiGLU, GQA 16/4), 26 capas × 1024 |
| Parametros totales | 342.283.264 (342 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M (GGUF); bf16 en safetensors |
| Idiomas soportados | Ruso (ru) |
| Licencia | RusMind License (DICPlay), licencia propia |
| Formato de pesos | GGUF (llama.cpp, LM Studio, Ollama); safetensors en repo asociado |
| Vocabulario | 48.000 tokens, tokenizador propio entrenado en ruso |
| Formato de dialogo | ChatML |
| Tamano de archivos | 688 MB (F16), 367 MB (Q8_0), 219 MB (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder de 26 capas con dimensión oculta de 1024, normalización RMSNorm, embeddings posicionales rotatorios (RoPE), activación SwiGLU y atención con consultas agrupadas (GQA) en ratio 16/4. Tanto los pesos como el tokenizador (48.000 tokens) y los datos de entrenamiento son propios; el entrenamiento se realizó desde cero. Para compatibilidad con llama.cpp, LM Studio y Ollama, la versión GGUF emplea la disposición estándar de llama.

El preentrenamiento consumió 4.500 millones de tokens procedentes de Wikipedia en ruso, web rusa, diálogos propios, código y tareas. Posteriormente se aplicó un ajuste fino orientado a habilidades prácticas: cálculo, generación de código, salida en JSON, traducción, llamada a herramientas, cortesía y calibración de la honestidad (decir "no sé" cuando corresponde). La versión 2.0.1 es un refinamiento de la 2.0 centrado en la coherencia multi-turno. No se documentan detalles sobre RLHF, DPO ni decodificación especulativa.

## Capacidades

- Generación de texto conversacional en ruso, con soporte de diálogo multi-turno (mejorado en 2.0.1 para el segundo y tercer turno).
- Aritmética básica y problemas verbales sencillos (por ejemplo, cálculo de velocidad a partir de distancia y tiempo).
- Generación de código y de salida estructurada en JSON a partir de instrucciones en lenguaje natural.
- Llamada a herramientas (tool calling) con salida en formato JSON, por ejemplo `{"tool": "weather", "args": {"city": "..."}}`.
- Explicación de conceptos cotidianos (familia, amistad, volcán, espacio) en ruso.
- Traducción (mencionada como habilidad de ajuste fino, sin detalle de pares de idiomas).
- Calibración de incertidumbre: el autor indica que el modelo admite "no sé" cuando no conoce la respuesta.
- Conocimiento factual básico sobre cultura rusa (por ejemplo, el escudo de Rusia).
- No dispone de visión, audio ni modo de razonamiento extendido (thinking).

## Casos de uso

- Asistente conversacional offline en ruso: el modelo cabe en 219 MB (Q4_K_M) y puede ejecutarse en un teléfono o portátil sin GPU, gestionando diálogos multi-turno dentro de su ventana de 4.096 tokens.
- Extracción de datos estructurados: convertir texto libre en ruso (por ejemplo, "El portátil cuesta 55.000 rublos") en JSON con campos definidos, útil en pipelines de procesamiento de pedidos o inventario.
- Enrutamiento de intenciones y tool calling en agentes ligeros: el modelo emite llamadas JSON a herramientas (clima, búsqueda, calculadora) que un orquestador puede ejecutar, con latencia mínima en CPU.
- Tutor de aritmética y problemas verbales elementales: resuelve operaciones y explica el procedimiento paso a paso en ruso, adecuado para aplicaciones educativas de gama baja.
- Prototipado y evaluación de pipelines: al ser un modelo pequeño y de licencia gratuita para investigación, sirve para validar integraciones con llama.cpp, Ollama o LM Studio antes de escalar a modelos mayores.
- Filtrado y clasificación de texto ruso en el borde (edge computing): por su tamaño reducido puede desplegarse en dispositivos con recursos limitados para tareas de respuesta conversacional o generación de plantillas.
- Demostración de modelos entrenados desde cero: útil para investigadores que estudien el comportamiento de modelos de 342 M con tokenizador propio y datos exclusivamente rusos.

## Benchmarks y rendimiento

| Benchmark | RusMind Zernyshko 2.0.1 | Notas |
|---|---|---|
| Test interno práctico (120 preguntas) | 74/120 (versión 2.0) frente a 53,5 antes del ajuste fino | Métrica propia del autor, no estandarizada |
| MERA 2.0 (puntuación global) | 0,054 (versión 2.0) | Método MERA 2.0; el autor lo describe como el mejor de la línea Zernyshko |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras anteriores proceden exclusivamente de la model card del autor y no son directamente comparables con evaluaciones de terceros.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en todas las cuantizaciones; Q4_K_M requiere aproximadamente 0,3-0,5 GB incluyendo overhead de contexto, Q8_0 en torno a 0,5-0,7 GB y F16 alrededor de 0,8-1 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; no requiere A100, H100 ni RTX 4090. Funciona también en CPU.
- Compatible con GPU de consumo: sí, en cualquier RTX, GTX, iGPU moderna o incluso en teléfonos móviles.
- Opciones de despliegue: llama.cpp (`llama-cli -hf DICPlay/RusMind-Zernyshko-2.0.1-GGUF -cnv`), Ollama (`ollama run hf.co/DICPlay/RusMind-Zernyshko-2.0.1-GGUF`), LM Studio (búsqueda "RusMind Zernyshko") y Transformers con los pesos safetensors del repo asociado.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera inferencia en tiempo real en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RusMind Zernyshko 2.0.1 | 342 M | 4.096 | Ruso | RusMind License (no comercial sin acuerdo) | GGUF y safetensors en Hugging Face |
| Qwen2.5-0.5B | 494 M | 32.768 | Multilingüe (incluye ruso) | Apache 2.0 | Hugging Face, GGUF, Ollama |
| SmolLM2-360M | 362 M | 8.192 | Principalmente inglés | Apache 2.0 | Hugging Face, GGUF |
| TinyLlama-1.1B | 1.100 M | 2.048 | Inglés | Apache 2.0 | Hugging Face, GGUF |

La comparación con Qwen2.5-0.5B, SmolLM2-360M y TinyLlama-1.1B se ofrece como referencia de categoría (modelos sub-1B); no se dispone de evaluaciones cruzadas publicadas entre RusMind Zernyshko y estos modelos. Frente a ellos, la ventaja principal de RusMind es su especialización en ruso y su tokenizador nativo; la desventaja es una licencia restrictiva para uso comercial y un contexto más corto.

## Limitaciones y advertencias

- Escala muy reducida (342 M): el conocimiento factual es limitado y la tasa de alucinación en preguntas abiertas puede ser alta; el propio autor enfatiza la calibración de "no sé" como mitigación.
- Ventana de contexto de 4.096 tokens: insuficiente para documentos largos o conversaciones extensas.
- Monolingüe en la práctica: aunque se menciona traducción, el modelo está entrenado y evaluado en ruso; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Licencia RusMind License: gratuita para uso personal, no comercial, investigación y evaluación; el uso comercial, la redistribución, la distribución de versiones modificadas y la integración en productos requieren contrato escrito con DICPlay.
- Datos de entrenamiento de 4.500 millones de tokens: volumen bajo en comparación con modelos de su categoría, lo que limita la cobertura y la robustez.
- Benchmarks no estandarizados: las cifras (74/120, MERA 0,054) proceden de evaluaciones internas del autor y no permiten comparación fiable con otros modelos.
- Sesgos: no se documentan análisis de sesgo; al entrenar con web rusa y Wikipedia, es previsible que herede sesgos de esas fuentes.
- Sin soporte multimodal ni modo de razonamiento extendido; no apto para tareas de visión, audio o razonamiento complejo de varios pasos.
- Modelo proporcionado "tal cual", sin garantías.

## Enlaces

- Repositorio GGUF: https://huggingface.co/DICPlay/RusMind-Zernyshko-2.0.1-GGUF
- Repositorio safetensors: https://huggingface.co/DICPlay/RusMind-Zernyshko-2.0.1
- Archivo Q8_0: https://huggingface.co/DICPlay/RusMind-Zernyshko-2.0.1-GGUF/blob/main/RusMind-Zernyshko-2.0.1-Q8_0.gguf
- Archivo Q4_K_M: https://huggingface.co/DICPlay/RusMind-Zernyshko-2.0.1-GGUF/blob/main/RusMind-Zernyshko-2.0.1-Q4_K_M.gguf
- Archivo F16: https://huggingface.co/DICPlay/RusMind-Zernyshko-2.0.1-GGUF/blob/main/RusMind-Zernyshko-2.0.1-F16.gguf
- Licencia: https://huggingface.co/DICPlay/RusMind-Zernyshko-2.0.1-GGUF/blob/main/LICENSE
- Contacto del autor (Telegram): https://t.me/DanKirillin
- Contacto del autor (MAX): https://max.ru/u/f9LHodD0cOIENg5eShucR-RyhC02ijx-XXjPGcPbjBRy6_KKvmdKIu9tdQU

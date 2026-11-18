# Malavika370/air-quality-qwen-slm

## Resumen

El modelo `air-quality-qwen-slm` es un pequeño modelo de lenguaje (SLM) desarrollado por Malavika Vinod (usuario `Malavika370`) como proyecto académico de ingeniería informática. Se trata de un transformer decoder-only entrenado **desde cero** (pesos inicializados aleatoriamente) sobre un dataset de series temporales de calidad del aire adaptado del benchmark UCI Chemical Multisensor. Su propósito no es competir con LLMs de propósito general, sino demostrar que una arquitectura compacta puede codificar y generar telemetría de química atmosférica, observaciones meteorológicas y descripciones de tendencias de contaminación.

La arquitectura sigue un diseño inspirado en Qwen3: atención con Grouped Query Attention (GQA), embeddings posicionales rotatorios (RoPE), RMSNorm previo a capa con QK-normalization, activación SwiGLU y embeddings de entrada/salida compartidos. Con aproximadamente 45 millones de parámetros entrenables, 6 capas y una dimensión oculta de 288, el modelo es extremadamente compacto y está pensado para investigación y experimentación, no para producción a gran escala.

Su relevancia actual es limitada pero clara: sirve como ejemplo reproducible de entrenamiento from-scratch de un SLM especializado en un dominio científico concreto (calidad del aire), y como base didáctica para estudiar arquitecturas tipo Qwen3 a pequeña escala. La ventana de contexto de solo 128 tokens y el entrenamiento sobre una única estación de monitorización en Italia (2004-2005) acotan severamente su aplicabilidad real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only inspirado en Qwen3 (GQA + RoPE + RMSNorm + SwiGLU) |
| Parametros totales | ~45 millones (con embeddings de vocabulario compartidos) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | No disponible (pesos en `pytorch_model.bin`, sin versiones GGUF ni cuantizadas publicadas) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.bin`); requiere código propio (`model.py`, `config.py`) para cargar |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con máscara causal estrictamente triangular inferior. Detalles concretos: dimensión oculta `d_model = 288`, 6 capas, 6 cabezas de atención con 2 grupos KV (GQA), dimensión feed-forward de 1152, y embeddings de entrada/salida atados y escalados por √d_model. Aplica RoPE a los estados Query y Key, RMSNorm previo a capa con QK-normalization en la atención para estabilidad, y SwiGLU (`SiLU(W_gate·x) ⊙ W_up·x`) en el bloque feed-forward. La longitud máxima de secuencia es de 128 tokens.

El entrenamiento se realizó con AdamW (β1=0.9, β2=0.95, weight decay 0.01), warmup lineal de 100 pasos seguido de decaimiento coseno hasta η_min = 3×10⁻⁵, precisión mixta automática (AMP), acumulación de gradientes y clipping de norma de gradiente a 1.0. Los datos provienen de lecturas tabulares multisensor serializadas como informes cronológicos y pares pregunta-respuesta, con separación temporal para evitar fugas de datos (zero temporal data leakage). No se documenta el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si hubo etapas de RLHF o DPO; no disponible.

## Capacidades

- Generación de texto autoregresivo especializado en informes de calidad del aire y descripciones de tendencias de contaminantes.
- Codificación de telemetría de química atmosférica y observaciones meteorológicas (temperatura, humedad, concentraciones de contaminantes).
- Generación de pares pregunta-respuesta sobre lecturas de sensores (formato QA del entrenamiento).
- Capacidad conversacional básica en inglés, limitada por el dominio y la ventana de contexto.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Sin capacidades multimodales (visión, audio) ni modo "thinking".
- Multilingüismo: únicamente inglés.

## Casos de uso

- **Generación de informes sintéticos de calidad del aire para aumento de datos**: el modelo puede producir descripciones textuales plausibles a partir de lecturas de sensores, útil para generar corpus de entrenamiento o pruebas en pipelines de NLP ambiental.
- **Prototipado educativo de SLMs desde cero**: sirve como referencia reproducible para estudiar cómo se implementa un transformer tipo Qwen3 a escala reducida (45 M de parámetros), incluyendo GQA, RoPE y SwiGLU.
- **Demostración de serialización de series temporales a texto**: el enfoque de convertir lecturas tabulares multisensor en informes cronológicos y pares QA es reutilizable en otros dominios de sensórica (calidad del agua, meteorología, energía).
- **Investigación sobre fugas temporales en datos**: el diseño con separación temporal explícita sirve como ejemplo metodológico para experimentos con series temporales y modelos de lenguaje.
- **Generación de descripciones de tendencias para dashboards internos**: en un entorno controlado y con revisión humana, podría redactar resúmenes textuales de variaciones de contaminantes a partir de datos históricos de una estación.
- **Base para fine-tuning experimental en dominios ambientales**: al ser MIT y compacto, puede servir de punto de partida para experimentos de ajuste con datos propios de calidad del aire, siempre que se acepte su limitada ventana de contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: al tratarse de ~45 M de parámetros en fp32, el modelo ocupa aproximadamente 180 MB de pesos; en fp16, unos 90 MB. Cabe holgadamente en cualquier GPU consumer.
- **GPU recomendadas**: cualquier GPU con al menos 1-2 GB de VRAM libre; funciona incluso en CPU para inferencia puntual.
- **GPU consumer**: sí, cabe en GTX 1650, RTX 3060, RTX 4090 y prácticamente cualquier tarjeta moderna, así como en Apple Silicon y CPU.
- **Opciones de despliegue**: no hay soporte nativo estándar en vLLM, llama.cpp, Ollama o TGI, ya que el modelo requiere código propio (`model.py`, `config.py`) y pesos en `pytorch_model.bin`. La carga se realiza con PyTorch y `transformers` solo para el tokenizer.
- **Latencia y throughput**: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `Malavika370/air-quality-qwen-slm` | ~45 M | 128 | MIT | Hugging Face (repo 0.2 GB) | Entrenado from-scratch, dominio muy específico |
| Qwen2.5-0.5B | ~500 M | 32 768 | Apache 2.0 | Hugging Face, ampliamente soportado | Modelo generalista, mucho mayor y con tooling estándar |
| SmolLM2-135M | ~135 M | 8 192 | Apache 2.0 | Hugging Face, GGUF disponible | Generalista, cuantizable y desplegable en llama.cpp |
| TinyLlama-1.1B | ~1.1 B | 2 048 | Apache 2.0 | Hugging Face, GGUF disponible | Generalista, mayor capacidad pero mucho más pesado |

La comparación directa es limitada: el modelo de Malavika370 es un experimento académico de dominio restringido, mientras que las alternativas son modelos generalistas con ecosistema de despliegue maduro. No se dispone de benchmarks comparativos publicados.

## Limitaciones y advertencias

- **Alcance de una sola estación**: entrenado con datos de un único dispositivo de monitorización a pie de carretera en Italia (2004-2005); las salidas reflejan ese perfil histórico local y no deben usarse como avisos meteorológicos oficiales ni en tiempo real.
- **Generación autoregresiva de coma flotante**: el modelo captura relaciones distribucionales entre meteorología y contaminantes, pero las predicciones numéricas de alta precisión requieren modelos de regresión dedicados; no es fiable para pronósticos cuantitativos.
- **Ventana de contexto muy corta**: 128 tokens limitan severamente cualquier conversación multi-turno o informe extenso.
- **Riesgo de alucinación**: al ser un SLM de 45 M de parámetros entrenado from-scratch, la coherencia factual y numérica es baja; requiere validación humana.
- **Solo inglés**: no soporta castellano ni otros idiomas.
- **Licencia MIT**: permite uso comercial, pero el autor no ofrece garantías; la responsabilidad sobre el uso recae en el integrador.
- **Sin ecosistema estándar**: no hay pesos GGUF, safetensors ni integración en vLLM/Ollama/TGI; el despliegue exige código propio y conocimiento de la arquitectura.
- **Sesgos**: no documentados explícitamente; al entrenarse sobre datos de una única ubicación y periodo, puede reflejar sesgos geográficos y temporales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Malavika370/air-quality-qwen-slm
- Dataset de series temporales de calidad del aire: https://huggingface.co/datasets/Malavika370/air-quality-time-series
- Benchmark UCI Chemical Multisensor (origen de los datos): https://archive.ics.uci.edu/dataset/360/air+quality

# francesca9805/nor-100mb-after-wc-zipf-newlex-before-ckpt500-packed-bfdiso_seed10

## Resumen

`nor-100mb-after-wc-zipf-newlex-before-ckpt500-packed-bfdiso_seed10` es un modelo de generacion de texto de pequeno tamano (124,77 millones de parametros) publicado por el usuario `francesca9805` en Hugging Face. Se trata de un fine-tuning mediante SFT (supervised fine-tuning) con la libreria TRL sobre el modelo base `francesca9805/ppt-wc-zipf-newlex-nor-before-100mb-packed-bfdiso_seed10`, que a su vez parece formar parte de una familia de experimentos de tokenizacion y preentrenamiento identificada por el prefijo `ppt` (probablemente "pretraining tokenizer").

El nombre del modelo sugiere un experimento controlado de investigacion: `nor` (probablemente noruego), `100mb` (tamano del corpus de entrenamiento), `wc-zipf-newlex` (posiblemente "word count", distribucion de Zipf y nuevo lexico/tokenizador), `before` (fase previa a un checkpoint), `ckpt500` (checkpoint 500) y `seed10` (semilla 10). Todo apunta a un trabajo academico sobre el efecto de la tokenizacion y el tamano del corpus en modelos pequenos, probablemente en el contexto de la Universidad de Groningen (el proyecto de Weights & Biases asociado es `f-padovani-university-of-groningen`).

La relevancia practica es limitada para produccion: es un modelo de investigacion, sin licencia declarada, sin idiomas declarados y sin benchmarks publicados. Su interes es principalmente metodologico para quienes estudian tokenizadores, curvas de aprendizaje o el impacto de la distribucion de Zipf en el entrenamiento de modelos pequenos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (tag `gpt2` en Hugging Face; transformer decoder-only) |
| Parametros totales | 124.770.816 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers, pero no declarada por el autor) |
| Idiomas soportados | no disponible (el prefijo `nor` sugiere noruego, sin confirmacion oficial) |
| Licencia | no disponible (la model card incluye `licence: license`, sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de tipo GPT-2 con 124,77 millones de parametros, una configuracion equivalente en orden de magnitud a GPT-2 small (124 M). El tag `gpt2` en Hugging Face confirma la familia arquitectonica, aunque no se detalla el numero de capas, dimensiones ocultas ni cabezas de atencion en la informacion disponible.

El entrenamiento se realizo con SFT (supervised fine-tuning) usando TRL 0.23.0, Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. El modelo parte de `francesca9805/ppt-wc-zipf-newlex-nor-before-100mb-packed-bfdiso_seed10`, un checkpoint intermedio de un pipeline de preentrenamiento mas amplio. El nombre indica un corpus de aproximadamente 100 MB, un tokenizador nuevo (`newlex`), un empaquetado de secuencias (`packed`) y un checkpoint en el paso 500 (`ckpt500`), con semilla 10. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; el autor solo declara SFT. El run de entrenamiento esta registrado en Weights & Biases bajo el proyecto `new-tokenizers` de la Universidad de Groningen.

## Capacidades

- Generacion de texto autoregresiva basica, heredada de la arquitectura GPT-2.
- Conversacion de un solo turno mediante el pipeline `text-generation` de Transformers, tal como muestra la model card.
- Ajuste por instrucciones limitado, derivado del SFT con TRL (formato de chat con roles `user`/`assistant` en el ejemplo).
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declara capacidad multilingue explicita; el prefijo `nor` sugiere foco en noruego, sin confirmacion.
- No se declara vision, audio ni modo de razonamiento extendido (thinking mode).
- Compatible con Text Generation Inference (tag `text-generation-inference`) y con `endpoints_compatible`, por lo que puede desplegarse en infraestructura de Hugging Face.

## Casos de uso

- Investigacion sobre tokenizacion: el modelo sirve como punto de comparacion para medir el efecto de un tokenizador nuevo (`newlex`) frente a tokenizadores estandar en un corpus de 100 MB, gracias a que el nombre codifica todas las variables del experimento (corpus, checkpoint, semilla).
- Reproducibilidad de experimentos academicos: al estar entrenado con semilla fija (`seed10`) y con un run publico en Weights & Biases, permite replicar curvas de entrenamiento y comparar con otras semillas del mismo pipeline.
- Estudio de curvas de aprendizaje en modelos pequenos: el checkpoint 500 sobre un corpus de 100 MB es util para analizar como escala la perplejidad con el numero de pasos en regimen de datos limitados.
- Generacion de texto de bajo coste en prototipos: con 124 M de parametros, el modelo cabe en cualquier GPU consumer y permite iterar rapidamente en demos de generacion de texto sin infraestructura dedicada.
- Analisis de sesgos y calidad linguistica en noruego (si se confirma el idioma): util para estudiar como un corpus pequeno y un tokenizador nuevo afectan a la fluidez y cobertura lexica en una lengua de recursos limitados.
- Pruebas de integracion con el ecosistema Hugging Face: al ser compatible con `text-generation-inference` y `endpoints_compatible`, sirve para validar pipelines de despliegue (TGI, Inference Endpoints) antes de escalar a modelos mayores.
- Baseline en experimentos de destilacion o comparacion de arquitecturas: su tamano y su caracter de checkpoint intermedio lo hacen adecuado como referencia inferior en estudios de escalado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB solo para pesos (124,77 M x 4 bytes), mas overhead de activaciones y cache KV.
- VRAM estimada en fp16/bf16: aproximadamente 0,25 GB para pesos.
- VRAM estimada en int8: aproximadamente 0,13 GB para pesos.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para inferencia de baja latencia.
- GPU recomendadas para produccion: no requiere GPU de datacenter; una T4, L4 o incluso CPU son suficientes. Para lotes grandes, una A10G o L4 ofrece margen sobrado.
- Opciones de despliegue: `transformers` (pipeline `text-generation`), Text Generation Inference (tag `text-generation-inference`), Hugging Face Inference Endpoints (`endpoints_compatible`). Compatible con llama.cpp/Ollama solo si se convierte a GGUF, conversion no publicada por el autor.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por tamano, se espera un throughput alto (cientos a miles de tokens por segundo en GPU moderna con lotes), pero no hay mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `nor-100mb-after-wc-zipf-newlex-before-ckpt500-packed-bfdiso_seed10` | 124,77 M | no disponible | no disponible | Hugging Face, repo de 34,1 GB |
| GPT-2 small (OpenAI) | 124 M | 1.024 tokens | MIT | Hugging Face, ampliamente disponible |
| GPT-2 medium (OpenAI) | 355 M | 1.024 tokens | MIT | Hugging Face, ampliamente disponible |
| Modelos noruegos tipo NB-BERT / NorBERT | ~100-180 M | 512 tokens | variable | Hugging Face (familia NorBERT/NB) |

La comparacion con GPT-2 small es la mas directa por numero de parametros, pero el modelo de `francesca9805` no declara contexto, licencia ni idiomas, lo que limita la comparacion funcional. Frente a modelos noruegos especializados como NorBERT, la diferencia principal es que este modelo es un experimento de investigacion sin documentacion de rendimiento ni licencia clara.

## Limitaciones y advertencias

- Modelo de investigacion sin model card completa: no se declaran idiomas, contexto, licencia ni datos de entrenamiento, lo que impide evaluar su idoneidad para produccion.
- Licencia ambigua: la model card indica `licence: license` sin especificar terminos; no se puede asumir uso comercial permitido.
- Riesgo elevado de alucinacion y baja calidad factual esperable por su tamano (124 M) y por el corpus de entrenamiento limitado (~100 MB).
- Sesgos desconocidos: al no documentarse la composicion del dataset, no es posible evaluar sesgos de genero, etnicos o culturales.
- Limitaciones de contexto e idioma no documentadas; el prefijo `nor` sugiere noruego, pero no hay confirmacion, y el soporte de castellano es improbable.
- No apto para tareas de razonamiento complejo, codigo, matematicas o agentes: no hay evidencia de dichas capacidades y el tamano lo desaconseja.
- Repo de 34,1 GB para un modelo de 124,77 M de parametros: el peso del repositorio sugiere la presencia de multiples checkpoints u optimizadores, lo que puede complicar la descarga y el despliegue.
- Sin benchmarks publicados: no hay forma de comparar su calidad con alternativas de forma objetiva.
- Proyecto probablemente abandonado o experimental: 0 likes, sin actualizaciones desde octubre de 2026 segun los metadatos, y sin issues ni discusion documentadas.

## Enlaces

- Hugging Face: https://huggingface.co/francesca9805/nor-100mb-after-wc-zipf-newlex-before-ckpt500-packed-bfdiso_seed10
- Modelo base: https://huggingface.co/francesca9805/ppt-wc-zipf-newlex-nor-before-100mb-packed-bfdiso_seed10
- Run de Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/epwiq391
- Repositorio TRL: https://github.com/huggingface/trl

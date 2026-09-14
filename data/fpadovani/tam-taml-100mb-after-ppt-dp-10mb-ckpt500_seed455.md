# fpadovani/tam-taml-100mb-after-ppt-Dp-10mb-ckpt500_seed455

## Resumen

El modelo `fpadovani/tam-taml-100mb-after-ppt-Dp-10mb-ckpt500_seed455` es un modelo de generación de texto publicado por el usuario fpadovani en Hugging Face. Se trata de un ajuste fino (SFT, *supervised fine-tuning*) del modelo base `fpadovani/tam-taml-100mb-ppt-Dp-10mb_seed455`, realizado con la librería TRL 0.23.0 sobre Transformers 4.56.2 y PyTorch 2.11.0. El repositorio incluye el tag `gpt2`, lo que apunta a una arquitectura transformer decoder-only de la familia GPT-2, con 124.770.816 parámetros reales según los pesos safetensors publicados.

El modelo se enmarca en un contexto de investigación: la entidad propietaria del *run* de Weights & Biases asociado es la Universidad de Groningen y el proyecto se denomina `new_tokenizers`, lo que sugiere que forma parte de experimentos académicos sobre tokenización y ajuste de modelos pequeños. El nombre del checkpoint (`after-ppt`, `Dp-10mb`, `ckpt500`, `seed455`) apunta a variantes de entrenamiento con distintos conjuntos de datos y semillas, aunque la model card no documenta esos detalles.

Su relevancia es limitada y muy específica: no se trata de un modelo de propósito general listo para producción, sino de un artefacto de investigación con 0 descargas y 0 *likes* en el momento de la consulta, sin licencia declarada, sin idiomas documentados y sin resultados de benchmarks. Resulta útil como referencia para reproducir experimentos de SFT sobre modelos de ~125 M de parámetros o como punto de partida para comparativas controladas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de tipo GPT-2 (según el tag `gpt2` del repositorio); la model card no lo describe explícitamente |
| Parametros totales | 124.770.816 (dato real de los pesos safetensors) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos en safetensors; no se ofrecen versiones GGUF, AWQ, GPTQ ni cuantizadas) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card incluye el marcador `licence: license` sin texto legal asociado) |
| Formato de pesos | safetensors (librería `transformers`) |
| Modelo base | fpadovani/tam-taml-100mb-ppt-Dp-10mb_seed455 |
| Metodo de entrenamiento | SFT con TRL 0.23.0 |
| Tamano del repositorio | 2,7 GB |
| Exportable a text-generation-inference | Si (tag `text-generation-inference`, `endpoints_compatible`) |
| Fecha de creacion / actualizacion | 14 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo GPT-2 con 124.770.816 parámetros, una cifra prácticamente idéntica a la de GPT-2 base (124 M). Se trata de un modelo de escalado pequeño, con atención causal completa, sin mecanismos documentados de atención lineal, decodificación especulativa ni arquitecturas híbridas SSM. La model card no especifica número de capas, dimensión oculta, número de cabezas de atención ni longitud de contexto, por lo que estos datos no están disponibles.

El entrenamiento consistió en un ajuste fino supervisado (SFT) mediante TRL sobre el modelo base `fpadovani/tam-taml-100mb-ppt-Dp-10mb_seed455`. No se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases posteriores de RLHF o DPO. La única traza del proceso es un *run* de Weights & Biases alojado en la organización `f-padovani-university-of-groningen`, dentro del proyecto `new_tokenizers`, lo que indica un contexto de investigación académica centrado en tokenizadores. El nombre del checkpoint sugiere un entrenamiento reanudado desde el paso 500 (`ckpt500`) con la semilla 455 (`seed455`) y un dataset de aproximadamente 10 MB (`Dp-10mb`), pero esto es una interpretación de la nomenclatura y no un dato confirmado en la documentación.

## Capacidades

- Generación de texto autoregresiva: es la tarea declarada en el pipeline (`text-generation`).
- Formato conversacional: el ejemplo de la model card invoca el pipeline con una lista de mensajes con rol `user`, lo que indica que el ajuste SFT se orientó a entradas con formato de chat o instrucciones.
- Seguimiento básico de instrucciones: derivado del entrenamiento SFT, aunque sin evaluación publicada que lo cuantifique.
- Razonamiento, código y matemáticas: no disponible; no hay evidencia documentada.
- Soporte de *tool calling* o *function calling*: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declara ningún idioma.
- Capacidades especiales (modo *thinking*, visión, audio): no disponible; no se documenta ninguna.

## Casos de uso

- Reproducción de experimentos académicos de tokenización: dado el proyecto `new_tokenizers` en el que se enmarca, el modelo sirve como artefacto de referencia para comparar el efecto de distintos tokenizadores sobre un mismo corpus de ajuste.
- Línea base en estudios comparativos de SFT: al ser un modelo de 124,77 M de parámetros ajustado con TRL, permite medir el impacto de hiperparámetros como la semilla o el tamaño del dataset frente a otros checkpoints de la misma familia.
- Entorno de pruebas para pipelines de `transformers` y `text-generation-inference`: los tags `endpoints_compatible` y `text-generation-inference` permiten usarlo para validar infraestructura de despliegue sin coste computacional relevante.
- Prototipado de interfaces conversacionales en local: su tamaño reducido permite ejecutar generación de texto en CPU o en GPU de gama de entrada, útil para validar plantillas de prompt y formatos de chat.
- Ajuste fino posterior (*continued fine-tuning*): puede servir como punto de partida para experimentos de destilación o de alineación sobre modelos pequeños, siempre que se resuelva antes la ambigüedad de licencia.
- Docencia y materiales educativos: ilustra de forma práctica el flujo completo de TRL (SFT sobre un modelo base, versionado de checkpoints y registro en Weights & Biases).
- Evaluación de riesgos en modelos pequeños: útil para estudiar patrones de alucinación y sesgo en modelos con capacidad limitada de memoria factual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del autor no incluye tablas comparativas ni métricas de evaluación (MMLU, HumanEval, GSM8K u otras), y el repositorio no adjunta ningún informe de evaluación.

## Requisitos de hardware

- VRAM estimada para los pesos en precisión FP32: aproximadamente 499 MB (124,77 M de parámetros × 4 bytes).
- VRAM estimada en FP16/BF16: aproximadamente 250 MB.
- VRAM estimada en int8: aproximadamente 125 MB.
- VRAM estimada en 4 bits: aproximadamente 70 MB.
- Con activaciones y caché KV para batch 1 y secuencias cortas, el consumo total se mantiene por debajo de 1 GB, por lo que cabe en cualquier GPU de consumo con 4 GB o más (GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090) y también en inferencia exclusiva por CPU.
- GPU de centro de datos no necesarias; A100 o H100 solo tendrían sentido para entrenamiento o para servir muchas réplicas concurrentes.
- Opciones de despliegue: `transformers` con `pipeline`, `text-generation-inference` (soportado según los tags), vLLM (compatible con pesos safetensors), y `llama.cpp`/Ollama únicamente si se convierte previamente a GGUF, conversión que no se distribuye en el repositorio.
- Latencia y *throughput*: no disponibles; no se han publicado mediciones.
- Nota sobre almacenamiento: el repositorio ocupa 2,7 GB, muy por encima del tamaño de los pesos en FP32, lo que indica la presencia de checkpoints intermedios u optimizador en el historial de ficheros.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Observaciones |
|---|---|---|---|---|---|
| fpadovani/tam-taml-100mb-after-ppt-Dp-10mb-ckpt500_seed455 | 124.770.816 | No disponible | No disponible | Hugging Face, 0 descargas | Ajuste SFT de investigación; sin benchmarks ni idiomas declarados |
| GPT-2 base (OpenAI) | 124 M | 1.024 tokens | Licencia MIT modificada | Pesos públicos en Hugging Face | Referencia de la misma escala; datos de contexto y licencia según la documentación pública de OpenAI |
| DistilGPT-2 | 82 M | 1.024 tokens | Apache-2.0 | Pesos públicos en Hugging Face | Versión destilada, más rápida y algo menos capaz; licencia según la ficha pública del modelo |
| SmolLM-135M | 135 M | 2.048 tokens | Apache-2.0 | Pesos públicos en Hugging Face | Modelo pequeño moderno entrenado con un volumen de tokens muy superior; licencia según la ficha pública del modelo |

Las cifras de los modelos alternativos provienen de su documentación pública y no de una evaluación homogénea frente al modelo descrito, por lo que la comparación es estructural y no de rendimiento.

## Limitaciones y advertencias

- Licencia no declarada: la model card contiene el literal `licence: license`, sin texto legal. No hay autorización explícita de uso comercial, por lo que su explotación en producción es jurídicamente insegura.
- Idiomas no documentados: se desconoce qué lenguas cubre el modelo y con qué calidad; usar castellano sin validación previa es arriesgado.
- Longitud de contexto desconocida: no se puede planificar una aplicación que dependa de ventanas largas sin medirla experimentalmente.
- Riesgo elevado de alucinación: con 124,77 M de parámetros y un dataset de ajuste aparentemente muy reducido, la capacidad de memorizar hechos es limitada y las afirmaciones factuales no son fiables.
- Sesgos no evaluados: no se ha publicado ninguna auditoría de sesgo, toxicidad o seguridad.
- Ausencia de benchmarks: no existe evidencia cuantitativa de calidad, por lo que no puede compararse de forma rigurosa con alternativas.
- Validación comunitaria nula: 0 descargas y 0 *likes* implican que el modelo no ha sido probado por terceros.
- Confusión de nomenclatura: los identificadores del repositorio no se explican en la model card, lo que dificulta saber a qué fase de entrenamiento corresponde cada checkpoint.
- Metadatos anómalos: la fecha de creación registrada (14 de septiembre de 2026) es posterior a la fecha habitual de consulta; conviene verificarla antes de citar el modelo.
- Trazabilidad parcial: el único registro del entrenamiento es un *run* externo de Weights & Biases, sin dataset ni receta publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fpadovani/tam-taml-100mb-after-ppt-Dp-10mb-ckpt500_seed455
- Modelo base: https://huggingface.co/fpadovani/tam-taml-100mb-ppt-Dp-10mb_seed455
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new_tokenizers/runs/25w0ttd3
- Repositorio de TRL: https://github.com/huggingface/trl

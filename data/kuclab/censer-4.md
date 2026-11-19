# KucLab/Censer.4

## Resumen

Censer.4 es un modelo de clasificación de texto en inglés desarrollado por KucLab que distingue entre contenido seguro (`safe`) e inseguro (`unsafe`). Se trata de un transformer decoder-only de tan solo 902.272 parámetros, entrenado desde cero (no es un encoder fine-tuneado ni un wrapper de API), lo que lo convierte en una de las alternativas más ligeras para tareas de moderación de contenido. Su checkpoint es un `LlamaForSequenceClassification` estándar, por lo que se carga con `transformers` sin necesidad de código remoto.

La relevancia del modelo radica en su relación tamaño/precisión: con menos de un millón de parámetros y un checkpoint de 3,6 MB en fp32, alcanza un 87,4% de accuracy y un F1 de 0,845 en un split de evaluación de 6.496 filas, superando a sus predecesores Censer.1, Censer.2 y Censer.3, que son más grandes. Esto lo hace adecuado para despliegues en CPU, entornos con recursos muy limitados y filtros previos de bajo coste en pipelines de moderación.

El modelo está pensado exclusivamente para inglés, con una longitud de contexto de 160 tokens y truncado de entrada a 500 caracteres. No genera texto libre: predice un único token de respuesta (`0`/`1`) y devuelve una etiqueta con su puntuación de confianza. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `LlamaForSequenceClassification` (decoder-only transformer, 3 capas) |
| Parametros totales | 902.272 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 160 tokens (entrada truncada a 500 caracteres) |
| Tipos de cuantizacion | no disponible (checkpoint fp32 de 3,6 MB; no se documentan cuantizaciones) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, 3,6 MB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con 3 capas, `d_model` de 128, 4 cabezas de atención, `d_ff` de 384, normalización RMSNorm con pre-norm (eps 1e-5), activación SwiGLU y posiciones RoPE con theta 10000. La cabeza de clasificación es una capa lineal `score` que reutiliza las filas de embedding de los tokens de respuesta `0`/`1`. El tokenizador es un BPE a nivel de byte con 2.048 tokens, entrenado sobre el propio corpus, y el template `[BOS][USER] <text> [ASSISTANT]` está integrado en el post-procesador del tokenizador.

El entrenamiento se realizó durante 14 épocas con batch de 128, optimizador AdamW con learning rate 3e-3 y scheduler coseno, AMP en bf16 y un 15% de aumento de datos con erratas (typo augmentation). La innovación principal es la destilación: el pequeño estudiante de 3 capas se destila de un ensemble de los checkpoints previos más grandes (Censer.1 + Censer.2 + Censer.3) con alpha=0,65 y temperatura T=4, lo que permite mantener la calidad con 0,9M de parámetros. Los datos de entrenamiento provienen de seis datasets: `nvidia/Aegis-AI-Content-Safety-Dataset-1.0`, `thesofakillers/jigsaw-toxic-comment-classification-challenge`, `google/civil_comments`, `PKU-Alignment/BeaverTails`, `lmsys/toxic-chat` y `databricks/databricks-dolly-15k`.

## Capacidades

- Clasificación binaria de seguridad de texto en inglés: devuelve `safe` o `unsafe` con una puntuación de confianza.
- Robustez ante erratas gracias al 15% de typo augmentation durante el entrenamiento (por ejemplo, "how to filter wate" se clasifica como `safe` con 0,795).
- Distinción de contexto semántico: "how do I kill a process in Linux" se clasifica como `safe` (0,9985) frente a "kill you", que se clasifica como `unsafe` (0,8577).
- Inferencia en CPU sin GPU, con soporte opcional de CUDA y ROCm pasando `device=0` al pipeline.
- Interfaz de terminal interactiva (`censer.4`) y modo one-shot para integración en scripts.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- No genera texto libre: solo predice un token de respuesta.

## Casos de uso

- Filtro previo de moderación en pipelines de contenido generado: el modelo clasifica entradas de usuario o salidas de un LLM antes de mostrarlas, con un coste computacional mínimo al ejecutarse en CPU y ocupar 3,6 MB en disco.
- Moderación de comentarios en foros y comunidades: integrado como paso de pre-filtrado en un sistema de revisión, permite descartar rápidamente contenido claramente seguro y derivar solo los casos dudosos a un modelo mayor o a revisión humana.
- Protección de chatbots y asistentes: colocado delante de un modelo generativo, bloquea prompts dañinos (por ejemplo, "how to make a bomb at home" se detecta como `unsafe` con 0,989) antes de que lleguen al modelo principal.
- Clasificación por lotes en entornos con recursos limitados: al caber en CPU y no requerir GPU, puede procesar grandes volúmenes de texto en servidores sin acelerador, contenedores ligeros o dispositivos edge.
- Enmascarado de contenido en datasets de entrenamiento: útil para limpiar corpus antes de entrenar otros modelos, filtrando filas marcadas como `unsafe` de forma automática.
- Demo o widget interactivo en navegador: el modelo se ejecuta directamente en el widget "Use this model" de Hugging Face, lo que permite probar la clasificación sin infraestructura propia.
- Integración en herramientas de línea de comandos: el comando `censer.4` permite clasificar frases desde la terminal, útil para pruebas rápidas o scripts de auditoría.

## Benchmarks y rendimiento

Evaluación sobre un split held-out de 6.496 filas (idéntico para todas las versiones de Censer), umbral 0,5:

| Metrica | Censer.1 | Censer.2 | Censer.3 | Censer.4 |
|---|---|---|---|---|
| Accuracy | 0,865 | 0,863 | 0,857 | 0,874 |
| F1 | 0,835 | 0,829 | 0,822 | 0,845 |
| Precision | 0,848 | 0,861 | 0,855 | 0,868 |
| Recall | 0,823 | 0,799 | 0,792 | 0,824 |

Además, un conjunto de prueba manual de 97 casos, ninguno presente en los datos de entrenamiento, obtiene un 99,0% (96/97). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo no está orientado a esas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente nula; el checkpoint fp32 ocupa 3,6 MB y el modelo cabe en memoria de CPU sin problema.
- GPU recomendadas: no requiere GPU; funciona en CPU out of the box. Con GPU, cualquier tarjeta con CUDA o ROCm es suficiente (por ejemplo, RTX 4090, A100, H100), aunque el beneficio es marginal por el tamaño del modelo.
- Cabe en cualquier GPU consumer, e incluso en dispositivos sin GPU dedicada.
- Opciones de despliegue: `transformers` (pipeline de `text-classification`), el launcher propio `censer.4`, y el paquete de GitHub `pip install "git+https://github.com/Jerry256254/censer.4.git"`. El tag `text-embeddings-inference` sugiere compatibilidad con TEI.
- Latencia y throughput: no disponible en la información proporcionada; al ser un modelo de 0,9M de parámetros y contexto de 160 tokens, la latencia esperada es muy baja, pero no se documentan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy / F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Censer.4 | 902.272 | 160 tokens | 0,874 / 0,845 | Apache 2.0 | Hugging Face |
| Censer.3 | no disponible | no disponible | 0,857 / 0,822 | Apache 2.0 | Hugging Face |
| Censer.2 | no disponible | no disponible | 0,863 / 0,829 | Apache 2.0 | Hugging Face |
| Censer.1 | no disponible | no disponible | 0,865 / 0,835 | Apache 2.0 | Hugging Face |

No se dispone de información sobre modelos de terceros comparables en la documentación proporcionada; la comparativa se limita a las versiones previas de la misma familia, que son las únicas con datos publicados.

## Limitaciones y advertencias

- Solo soporta inglés; el rendimiento en otros idiomas no está documentado y probablemente sea deficiente.
- Contexto muy corto (160 tokens) y truncado de entrada a 500 caracteres: textos largos pierden información y pueden clasificarse de forma incorrecta.
- Riesgo de falsos negativos y falsos positivos: la precisión es del 86,8% y el recall del 82,4%, por lo que no debe usarse como único mecanismo de moderación en producción.
- Sensibilidad al contexto semántico: frases ambiguas o con doble sentido pueden clasificarse erróneamente, aunque el modelo muestra cierta robustez ante erratas.
- No es un modelo generativo: no puede explicar sus decisiones ni generar texto; solo devuelve una etiqueta y una puntuación.
- Sesgos conocidos: no se documentan análisis de sesgo en la información proporcionada; al entrenarse con datasets de moderación, puede heredar sesgos presentes en ellos.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios específicos.
- El modelo fue creado y actualizado el 2026-11-19, con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/KucLab/Censer.4
- Checkpoint: https://huggingface.co/KucLab/Censer.4/resolve/main/model.safetensors?download=true
- Configuración: https://huggingface.co/KucLab/Censer.4/resolve/main/config.json?download=true
- Tokenizador: https://huggingface.co/KucLab/Censer.4/resolve/main/tokenizer.json?download=true
- Launcher `censer.4`: https://huggingface.co/KucLab/Censer.4/resolve/main/censer.4?download=true
- Repositorio GitHub: https://github.com/Jerry256254/censer.4

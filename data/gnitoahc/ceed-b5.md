# gnitoahc/ceed-b5

## Resumen

CEED B5 es un modelo de visión-lenguaje (VLM) desarrollado por gnitoahc (Chao-Ting, Chen) como parte del estudio CEED (Causal Expert–Evidence Distillation), un proyecto de investigación sobre destilación de conocimiento en modelos multimodales. Se trata de un fine-tune LoRA del modelo base `google/gemma-4-e4b-it` (7,94 mil millones de parámetros), con el adaptador fusionado en los pesos, de modo que se carga como un checkpoint independiente sin necesidad de PEFT. El modelo está entrenado para responder preguntas visuales sobre documentos, imágenes naturales y gráficos, utilizando los datasets DocVQA, GQA y ChartQA.

La relevancia de este checkpoint reside en su objetivo experimental: aplicar una variante del método CEED (con *router combine-weight probing*) para transferir conocimiento desde un teacher MoE más grande, `google/gemma-4-26b-a4b-it`, hacia un modelo más pequeño. Sin embargo, los resultados publicados por el propio autor indican que la destilación no aporta ventaja frente al control sin teacher (CEED B1), que obtiene mejores puntuaciones en todos los conjuntos de evaluación. Se trata de un artefacto de investigación publicado para reproducibilidad, no de un producto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en `google/gemma-4-e4b-it` (transformers, image-text-to-text) |
| Parametros totales | 7.941.100.874 (~7,94 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp16) |
| Idiomas soportados | ingles (en) |
| Licencia | gemma |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de `google/gemma-4-e4b-it`, un VLM de la familia Gemma 4 con 7,94 B de parámetros totales. Sobre esta base se aplicó un adaptador LoRA de rango 4, entrenado con el objetivo CEED B2, que incorpora *router combine-weight probing*: una técnica que analiza cómo el teacher (un modelo MoE disperso de 26 B con 4 B activos) combina los pesos de sus expertos durante la inferencia, para guiar la destilación hacia el modelo estudiante. El adaptador se fusionó posteriormente en los pesos base, generando un checkpoint standalone.

El entrenamiento se realizó sobre un corpus combinado de 17.849 ejemplos (80/10/10 split por id de ejemplo): 2.500 de ChartQA, 5.349 de DocVQA y 10.000 de GQA. Se completaron 2,69 pasadas sobre el split de entrenamiento, con una entropía cruzada final de 1,0942 y un término de destilación (KD) de 2,2828. No se menciona el uso de RLHF ni DPO; el proceso es exclusivamente de fine-tuning supervisado con destilación.

## Capacidades

- Respuesta a preguntas visuales (VQA) sobre documentos, imágenes naturales y gráficos.
- Comprensión de texto en imágenes (OCR implícito) para tareas de DocVQA.
- Razonamiento sobre gráficos y tablas (ChartQA).
- Generación de respuestas cortas siguiendo una instrucción específica en el prompt (el autor advierte que sin esa instrucción el modelo responde con frases completas y obtiene cero en las métricas).
- Soporte de entrada multimodal imagen + texto (pipeline `image-text-to-text`).
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso.
- Monolingüe: solo inglés.

## Casos de uso

- Investigación en destilación de conocimiento: sirve como punto de comparación para estudiar si la destilación con *router combine-weight probing* transfiere señales útiles desde un teacher MoE a un modelo denso pequeño.
- Reproducción de experimentos: al ser un checkpoint fusionado, permite reproducir los resultados del estudio CEED sin necesidad de infraestructura PEFT.
- Evaluación de VQA en entornos controlados: puede usarse en pipelines de evaluación académica para medir el impacto de la capacidad del adaptador (rango 4) en tareas de pregunta-respuesta visual.
- Prototipado de asistentes de documentación: con la instrucción adecuada, puede extraer respuestas concretas de imágenes de documentos, aunque su rendimiento es inferior al de un fine-tune supervisado convencional.
- Análisis de gráficos en inglés: puede interpretar gráficos simples y responder preguntas de exactitud relajada, con limitaciones conocidas.
- Estudio de sesgos en modelos pequeños: al ser un modelo de 7,94 B entrenado en un corpus reducido, es útil para analizar cómo se comportan los VLM compactos frente a tareas de VQA con vocabulario limitado.

## Benchmarks y rendimiento

El autor publica resultados de evaluación con su propio harness (`ceed-direct-1`), con decodificación greedy y sobre un split de validación propio (10% del corpus). Estos números **no son comparables** con los leaderboards oficiales de DocVQA, GQA o ChartQA, ya que difieren el split, el prompt y la decodificación. Solo son comparables entre los grupos del estudio CEED.

| Dataset | Metrica | Score | n |
|---|---|---|---|
| DocVQA | ANLS | 0,8573 | 565 |
| GQA | exact match | 0,6083 | 1016 |
| ChartQA | relaxed accuracy | 0,5663 | 249 |

El control sin teacher (CEED B1), entrenado idénticamente pero con `kd_weight: 0`, obtuvo puntuaciones superiores en todos los conjuntos: DocVQA 0,8798, GQA 0,6959 y ChartQA 0,7871. Esto indica que la destilación no aporta una ventaja medible en este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: ~16 GB (el repositorio pesa 15,9 GB en safetensors, lo que sugiere pesos en fp16).
- GPU recomendadas: NVIDIA A100 (40 GB), RTX 4090 (24 GB), o GPUs con al menos 16 GB de VRAM para fp16 sin cuantizar.
- Con cuantización a 8 bits cabría en GPUs de 8-10 GB (p. ej., RTX 3080, RTX 4070); a 4 bits podría ejecutarse en GPUs de 6 GB, aunque no se proporcionan archivos GGUF ni AWQ oficiales.
- Opciones de despliegue: al ser un modelo estándar de transformers, puede servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF). No se documenta compatibilidad específica con Ollama.
- Latencia y throughput: no disponibles. Como referencia orientativa, un modelo de ~8 B en fp16 en una A100 suele generar entre 20 y 50 tokens/s, pero no hay datos oficiales para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | DocVQA (ANLS) | GQA (EM) | ChartQA (relaxed) | Licencia |
|---|---|---|---|---|---|---|
| gnitoahc/ceed-b5 | 7,94 B | no disponible | 0,8573* | 0,6083* | 0,5663* | gemma |
| gnitoahc/ceed-b1 (control sin teacher) | 7,94 B | no disponible | 0,8798* | 0,6959* | 0,7871* | gemma |
| google/gemma-4-26b-a4b-it (teacher) | 26 B (4 B activos) | no disponible | no disponible | no disponible | no disponible | gemma |

*Valores obtenidos con el harness propio de CEED, no comparables con leaderboards oficiales.

La comparativa muestra que el checkpoint B5 es superado por su propio control sin destilación, y que el teacher MoE es significativamente mayor pero no se dispone de métricas comparables. No se incluyen otros modelos de la misma categoría por falta de datos en la información proporcionada.

## Limitaciones y advertencias

- Es un resultado LoRA: fusionar el adaptador no convierte un LoRA de rango 4 en un fine-tune completo. La capacidad del adaptador es limitada, y cualquier comparación debe tener en cuenta que un resultado nulo puede deberse a la falta de capacidad del adaptador, no a la ineficacia de la señal de destilación.
- La ganancia de destilación no está establecida: el control sin teacher (B1) puntúa por encima en todos los datasets, por lo que este checkpoint no demuestra ventaja frente al fine-tuning supervisado convencional.
- Entrenado exclusivamente en inglés y en dominios de VQA (documentos, imágenes naturales, gráficos). El comportamiento fuera de estos dominios no está probado.
- Requiere una instrucción específica de respuesta corta en el prompt; sin ella, el modelo genera respuestas verbosas que puntúan cero en las métricas de evaluación.
- Hereda las limitaciones del modelo base `gemma-4-e4b-it` y la licencia Gemma, que impone restricciones de uso comercial (consultar los términos de la licencia Gemma).
- Es un artefacto de investigación, no un producto. No se recomienda su uso en producción sin una evaluación exhaustiva.
- No se dispone de información sobre sesgos específicos, pero al ser un modelo entrenado en un corpus reducido y en inglés, es probable que presente sesgos de dominio y de idioma.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/gnitoahc/ceed-b5
- Repositorio GitHub del proyecto CEED: https://github.com/GNITOAHC/ceed
- Documento de diseño CEED (ceed.md): https://github.com/GNITOAHC/ceed/blob/main/ceed.md
- Modelo base: https://huggingface.co/google/gemma-4-e4b-it
- Modelo teacher: https://huggingface.co/google/gemma-4-26b-a4b-it
- Checkpoint relacionado (B2): https://huggingface.co/gnitoahc/ceed-b2-gemma4-e4b-it-0802

# KucLab/Censer.7

## Resumen

Censer.7 es un clasificador de contenido multilingüe de tipo "tiny language model" desarrollado por KucLab. Se trata de un transformer decoder-only de 902.016 parámetros entrenado desde cero, con una cabeza de clasificación multi-etiqueta sobre 12 salidas: una etiqueta binaria safe/unsafe y 10 categorías de seguridad calibradas. Su función es la moderación de contenido: detectar texto inseguro y clasificarlo por categoría (armas, autolesión, odio, etc.) en once idiomas.

El modelo resulta relevante por su relación entre tamaño y prestaciones: con menos de un millón de parámetros ofrece contexto nativo de 4096 tokens, inferencia en CPU sin GPU y un pipeline de documentos largos mediante chunking con agregación por máximo. Emplea una arquitectura Llama estándar (`LlamaForSequenceClassification`) con licencia Apache 2.0, lo que permite desplegarlo sin `trust_remote_code` y sin restricciones comerciales.

La versión .7 corrige regresiones de la .6: recupera el F1 binario hasta 0,8348 en test, incorpora umbrales por categoría calibrados (ECE y diagrama de fiabilidad) y añade evaluación multilingüe por idioma. El entrenamiento combina destilación, aumento de datos con erratas y ejemplos adversarios, y un esquema en dos fases para evitar que la clasificación por categorías degrade la señal binaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `LlamaForSequenceClassification` (transformer decoder-only, 3 capas) |
| Parametros totales | 902.016 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens nativos (RoPE lineal x8); documentos largos mediante chunked-max (256/192) |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones; el modelo es compatible con safetensors y ONNX) |
| Idiomas soportados | en, cs, de, es, fr, it, pt, ru, ar, zh, hi |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

Otros datos técnicos: 3 capas, d_model 128, 4 cabezas de atención, d_ff 384; tokenizador BPE byte-level de 2048 tokens; límite de entrada de 4000 caracteres; salida sigmoide sobre 12 etiquetas con umbrales por categoría en `config.json` (`cat_thresholds`).

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de tres capas con pooling sobre el último token para la clasificación. La cabeza de salida reutiliza las filas de embedding de 12 tokens de respuesta (`0`, `1`, `a`..`j`), de modo que la proyección final es un `score` sobre esas representaciones. El contexto nativo es de 4096 tokens gracias a RoPE lineal con factor x8, aunque el propio autor advierte que el paso único nativo no es adecuado para documentos largos: el pooling del último token hace que el contenido inseguro en posiciones intermedias se pierda (F1 medido de 0,052 en documentos sintéticos de 25 filas). La ruta documentada y recomendada es el chunking con solapamiento (256 tokens, stride 192) y agregación por máximo, con la que se alcanza F1 0,998 y accuracy 0,997 en el mismo conjunto.

El entrenamiento se realizó en dos fases: (A) 5 épocas solo con la señal binaria (`cat_weight=0`, lr 2e-3) partiendo de la inicialización de Censer.6, y (B) 3 épocas para las categorías (`cat_weight=0.5`, lr 3e-4). Se usaron batch 256, AdamW con scheduler coseno, AMP en bf16, un 15 % de aumento con erratas y un 5 % de ejemplos adversarios, junto con destilación. El conjunto de entrenamiento suma 251.655 filas, incluyendo Aegis-AI-Content-Safety, Jigsaw toxic comment, Civil Comments, BeaverTails, Toxic-Chat, Dolly-15k, HateXplain (train, 15k) y Jigsaw-multilingual (60k); las particiones de validación y test se mantienen idénticas a las versiones .1–.6.

## Capacidades

- Clasificación binaria safe/unsafe con umbral 0,5 sobre el índice 1 de la salida.
- Clasificación multi-etiqueta en 10 categorías de seguridad calibradas con umbrales específicos por categoría.
- Moderación multilingüe en once idiomas (en, cs, de, es, fr, it, pt, ru, ar, zh, hi).
- Procesamiento de documentos largos mediante chunking con solapamiento y agregación por máximo, integrado en el pipeline y la API.
- Inferencia en CPU sin GPU, con soporte de GPU mediante `device=0`.
- Interfaz de terminal interactiva (`censer.7`) para clasificación puntual o por argumento.
- API HTTP por lotes (`/classify`, `/classify-one`, `/health`) con límite de peticiones configurable (`RATE_LIMIT_PER_MIN`, por defecto 600).
- Despliegue en Docker y compatibilidad con `text-embeddings-inference` y endpoints.
- Carga directa con `transformers` sin `trust_remote_code`.

## Casos de uso

- Moderación de comentarios en foros y redes: el modelo clasifica cada mensaje como safe/unsafe y asigna categorías, con umbrales calibrados que permiten ajustar la tasa de falsos positivos por categoría según la política del producto.
- Filtrado previo en pipelines de generación: colocar Censer.7 como guardarraíl antes o después de un LLM grande para bloquear peticiones o respuestas inseguras; su tamaño de 902K parámetros permite ejecutarlo en la misma CPU del servidor de aplicación sin coste apreciable.
- Moderación de documentos largos: artículos, hilos o transcripciones se procesan con el pipeline de chunking (256/192, agregación por máximo), que es la única ruta recomendada para entradas que superen los 256 tokens.
- Análisis de toxicidad multilingüe en comunidades internacionales: cubre once idiomas, incluidos checo, ruso, árabe, chino e hindi, con F1 por idioma medido sobre textdetox.
- Triaje de soporte al cliente: clasificar mensajes entrantes por categoría (acoso, contenido sexual, autolesión) para enrutarlos al equipo adecuado, usando la API HTTP por lotes con límite de 600 peticiones por minuto por defecto.
- Investigación en seguridad de modelos: servir como baseline ligero y reproducible para comparar técnicas de calibración, destilación y aumento de datos adversarios, dado que las particiones de validación y test se mantienen estables entre versiones.
- Despliegue en entornos con recursos limitados: contenedor Docker con inferencia en CPU para edge, dispositivos sin GPU o servicios con presupuesto de memoria mínimo.

## Benchmarks y rendimiento

| Benchmark | Censer.7 | Referencia / versión anterior |
|---|---|---|
| F1 binario en test | 0,8348 | 0,829 (Censer.6); 0,849 (Censer.5) |
| Sondas (probes) | 95/97 | 90/97 (Censer.6) |
| ToxiGen | 0,561 | 0,546 (Censer.6) |
| HateXplain | 0,738 | 0,714 (Censer.6) |
| F1 chunked-max en documentos largos | 0,998 (acc 0,997) | 0,052 con paso único nativo |
| Comparación directa con unbiased-toxic-roberta | incluida en la model card (tabla no reproducida aquí) | no disponible en la información proporcionada |

Los datos de F1 por idioma sobre textdetox (12 idiomas) y sobre sintético retenido se mencionan en la model card, pero los valores concretos no están incluidos en la información disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en fp32 (902K parámetros, aproximadamente 3,6 MB de pesos); en la práctica cabe en cualquier GPU consumer y en CPU.
- GPU recomendadas: no requiere GPU; funciona en CPU out of the box. Cualquier GPU consumer (por ejemplo, RTX 3060 o superior) es más que suficiente con `device=0`.
- Cabe en GPU consumer: sí, en todas las gamas actuales, con un consumo de memoria despreciable.
- Opciones de despliegue: `transformers` (pipeline y `AutoModelForSequenceClassification`), ONNX, Docker con `serve.py`, `text-embeddings-inference` y endpoints compatibles.
- Latencia y throughput: no disponible de forma numérica; el límite de peticiones por defecto de la API es de 600 por minuto, lo que sugiere un throughput holgado para el tamaño del modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Censer.7 | 902.016 | 4096 nativos (chunked para largos) | Clasificación safe/unsafe + 10 categorías, multilingüe | Apache 2.0 | Hugging Face, ONNX, Docker |
| unbiased-toxic-roberta | no disponible en la información proporcionada | no disponible | Detección de toxicidad binaria | no disponible | Hugging Face (comparado directamente en la model card de Censer.7) |
| Censer.6 | 902.016 (misma familia) | 4096 nativos | Igual que Censer.7, sin calibración por categoría ni evaluación multilingüe | Apache 2.0 | Hugging Face |
| Censer.5 | 902.016 (misma familia) | 4096 nativos | Igual que Censer.7; F1 binario 0,849, sin categorías calibradas | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks de unbiased-toxic-roberta en la información proporcionada más allá de la comparación directa incluida en la model card, cuyos valores no se reproducen aquí.

## Limitaciones y advertencias

- El paso único nativo sobre documentos largos no es fiable: el pooling del último token pierde contenido inseguro intermedio (F1 0,052 medido). Es obligatorio usar el pipeline de chunking para entradas de más de 256 tokens.
- El límite de entrada es de 4000 caracteres; textos más largos deben trocearse externamente.
- Riesgo de falsos positivos y negativos inherente a un modelo de menos de un millón de parámetros; los umbrales por categoría están calibrados sobre un conjunto retenido concreto y pueden no transferirse a dominios distintos.
- Cobertura multilingüe desigual: el entrenamiento combina datos en inglés con sintéticos para cs/de/es/fr y Jigsaw-multilingual para fr/it/pt/es/ru/tr; los idiomas ar, zh e hi aparecen en la lista de idiomas pero no se detalla su volumen de entrenamiento en la información disponible.
- Riesgo de sesgo por la composición de los datasets de moderación (Jigsaw, Civil Comments, HateXplain), que reflejan las anotaciones y sesgos de sus comunidades de origen.
- El modelo clasifica, no genera explicaciones: la salida es una probabilidad por etiqueta, sin justificación textual.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios no evaluados.
- La model card advierte de una regresión conocida frente a Censer.5 en la sonda "buy a gun", corregida parcialmente en .7 pero no del todo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KucLab/Censer.7
- Repositorio del paquete: https://github.com/Jerry256254/censer.7
- Dataset Aegis-AI-Content-Safety: https://huggingface.co/datasets/nvidia/Aegis-AI-Content-Safety-Dataset-1.0
- Dataset Jigsaw toxic comment: https://huggingface.co/datasets/thesofakillers/jigsaw-toxic-comment-classification-challenge
- Dataset Civil Comments: https://huggingface.co/datasets/google/civil_comments
- Dataset BeaverTails: https://huggingface.co/datasets/PKU-Alignment/BeaverTails
- Dataset Toxic-Chat: https://huggingface.co/datasets/lmsys/toxic-chat
- Dataset Dolly-15k: https://huggingface.co/datasets/databricks/databricks-dolly-15k
- Dataset HateXplain: https://huggingface.co/datasets/Hate-speech-CNERG/hatexplain
- Dataset Jigsaw multilingual: https://huggingface.co/datasets/Intuit-GenSRF/jigsaw-multilingual-train-unique

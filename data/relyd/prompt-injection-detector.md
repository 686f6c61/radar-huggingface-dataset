# RelyD/prompt-injection-detector

## Resumen

`RelyD/prompt-injection-detector` es un clasificador binario de texto (etiqueta `0` = benigno, `1` = intento de *prompt injection*) publicado por el usuario RelyD. No es un modelo generativo: se trata de una cabeza de clasificación sobre encoders transformer de la familia DistilBERT, con 66.955.010 parámetros declarados en safetensors y un repositorio de 0,3 GB que también incluye artefactos `joblib`. Su propósito declarado es actuar como **una capa más** de defensa en aplicaciones LLM (filtrado de entradas) y servir de banco de pruebas para medir generalización fuera de distribución frente a baselines lineales y basados en reglas.

La model card no documenta un único modelo, sino un estudio comparativo con cuatro bases ajustadas (`microsoft/deberta-v3-small`, `sentence-transformers/all-MiniLM-L6-v2`, `distilbert-base-multilingual-cased` y `distilbert-base-uncased`) y cinco baselines clásicos (`rules`, `tfidf_lr`, `char_wb_tfidf_lr`, `char_wb_tfidf_lr_windowed`, `word_char_svm`), además de comparar contra el preentrenado público `protectai/deberta-v3-base-prompt-injection-v2`. El tamaño del repositorio y el recuento de parámetros son coherentes con la variante inglesa `distilbert-base-uncased` (267,8 MB).

Su relevancia práctica está en el coste: la inferencia en CPU es de 63–92 ms de mediana según la variante, frente a los 525,5 ms del detector público de referencia, y el peso del modelo cabe en 90,9–567,6 MB. El precio a pagar es una caída muy acusada del rendimiento fuera de distribución: el F1 sobre el conjunto externo `deepset/prompt-injections` se queda en 0,067–0,188 para las variantes DistilBERT, con umbrales de decisión extremos (0,9988–0,9999) calibrados para una recall objetivo de 0,95 en validación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder de la familia DistilBERT (destilado de BERT) con cabeza de clasificación binaria; el repo incluye además baselines lineales en `joblib` |
| Parámetros totales | 66.955.010 (safetensors del repo); las variantes evaluadas en la model card van de 90,9 MB (`all-MiniLM-L6-v2`) a 567,6 MB (`deberta-v3-small`) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128 tokens (`max_length = 128` en entrenamiento y evaluación); las inyecciones que exceden esa ventana no se evalúan correctamente |
| Tipos de cuantización | No disponible (pesos `safetensors` en precisión completa y artefactos `joblib`; no se documentan variantes GGUF, ONNX cuantizado ni int8) |
| Idiomas soportados | `en` y `multilingual`; el entrenamiento es en inglés y la variante multilingüe se evalúa en alemán, español, francés, ruso y croata como dominio no visto |
| Licencia | Apache-2.0 |
| Formato de pesos | `safetensors` y `joblib` |

## Arquitectura y entrenamiento

El modelo base es un encoder transformer destilado de BERT (familia DistilBERT) al que se añade una cabeza de clasificación binaria. El ajuste se realizó con `pid.finetune` sobre tres semillas (42, 43, 44), 3 épocas, `learning_rate = 2e-5`, `batch_size = 32` y `max_length = 128`. Se eligió una semilla por variante para el modelo final: semilla 42 para `deberta-v3-small`, `all-MiniLM-L6-v2` y `distilbert-base-uncased`, y semilla 43 para `distilbert-base-multilingual-cased`. No se documenta RLHF, DPO ni preferencias humanas: es un ajuste supervisado puro sobre clasificación binaria.

Los datos provienen de `xTRam1/safe-guard-prompt-injection` (split `train`), con 8.116 ejemplos tras limpieza, repartidos en 5.681 de entrenamiento, 1.218 de validación y 1.217 de test. La limpieza eliminó 111 duplicados exactos, 5 ejemplos con etiquetas en conflicto y 4 solapamientos entre bases. La evaluación externa usa `deepset/prompt-injections` (546 ejemplos, Apache-2.0), que no se redistribuye. La innovación metodológica destacable no está en la arquitectura sino en la evaluación: se fija el umbral de decisión sobre validación para una recall objetivo de 0,95 y se reportan intervalos de confianza al 95 %, además de comparar contra baselines clásicos recalibrados en el dominio destino (30 muestras) para medir cuánto de la caída es de calibración y cuánto de representación.

## Capacidades

- Clasificación binaria de texto: distingue entre prompt benigno e intento de prompt injection.
- Detección de patrones de anulación de instrucciones, secuestro de rol y *jailbreak* con palabras clave explícitas.
- Soporte multilingüe limitado en la variante `distilbert-base-multilingual-cased` (entrenada en inglés, con vocabulario multilingüe).
- Inferencia en CPU con latencias de decenas de milisegundos, apta para filtrado en línea.
- Salida de probabilidad calibrable mediante umbral ajustable según la recall objetivo.
- Comparativa de robustez publicada frente a baselines de reglas, TF-IDF + regresión logística, SVM y un detector preentrenado de terceros.
- **No** realiza generación de texto, razonamiento, código, matemáticas, visión ni audio.
- **No** soporta tool calling, function calling ni razonamiento multi-paso; no es un agente.
- **No** debe usarse como único mecanismo de seguridad: la propia model card lo desaconseja explícitamente.

## Casos de uso

- **Filtrado de entrada en aplicaciones LLM (guardrail de primera capa):** colocar el clasificador delante del prompt del usuario para marcar o registrar entradas sospechosas antes de que lleguen al modelo generativo. Es adecuado por su latencia (63,3 ms p50 en la variante inglesa) y por su tamaño reducido, que permite ejecutarlo en la misma máquina que el orquestador.
- **Triaje y monitorización de logs de producción:** clasificación por lotes de conversaciones históricas para cuantificar la tasa de intentos de inyección y detectar campañas. El coste en CPU (0,33–3,47 ms p50 para los baselines clásicos del repo) permite procesar volúmenes grandes sin GPU.
- **Etiquetado asistido de corpus de seguridad:** preanotar datasets de prompts para revisión humana, usando el umbral calibrado a alta precisión (1,000 en el conjunto de test) y derivando a revisión manual los casos dudosos.
- **Banco de pruebas de robustez (evaluación OOD):** usar el harness y los conjuntos documentados (`xTRam1` como dominio interno, `deepset` como dominio externo) para medir la degradación de cualquier detector candidato antes de desplegarlo.
- **Protección de canalizaciones RAG con contenido no confiable:** analizar los fragmentos recuperados de fuentes externas (webs, PDFs de terceros) antes de insertarlos en el contexto del modelo, donde una inyección indirecta puede colarse dentro de un documento aparentemente benigno.
- **Despliegue en entornos sin GPU o en el borde:** servicios en contenedores pequeños, funciones serverless o dispositivos con poca memoria pueden ejecutar la variante `all-MiniLM-L6-v2` (90,9 MB, 78,6 ms p50) para un filtrado básico.
- **Comparación de coste/beneficio frente a detectores grandes:** para equipos que evalúan sustituir un detector de 737,7 MB y ~525 ms por algo más ligero, el repo ofrece las métricas necesarias para decidir con datos.

## Benchmarks y rendimiento

Resultados publicados en la model card (`reports/metrics.json`, `data_source: "real"`). Umbral elegido en validación para recall objetivo 0,95. Conjunto interno: `xTRam1` test (n = 1.217). Conjunto externo: `deepset` (n = 546).

| Variante (semilla) | Umbral | F1 interno (IC 95 %) | F1 externo (IC 95 %) | ROC-AUC interno / externo | CPU p50 / p95 (ms) | Tamaño (MB) |
|---|---|---|---|---|---|---|
| `microsoft/deberta-v3-small` (42) | 0,9999 | 0,968 (0,955–0,979) | **0,188** (0,117–0,260) | 1,000 / 0,823 | 265,6 / 496,9 | 567,6 |
| `all-MiniLM-L6-v2` (42) | 0,9951 | 0,968 (0,954–0,979) | 0,155 (0,091–0,219) | 1,000 / 0,657 | **78,6 / 145,5** | **90,9** |
| `distilbert-base-multilingual-cased` (43) | 0,9982 | **0,969** (0,955–0,981) | 0,085 (0,038–0,139) | 1,000 / 0,645 | 92,0 / 248,3 | 541,3 |
| `distilbert-base-uncased` (42) | 0,9988 | 0,968 (0,954–0,980) | 0,067 (0,021–0,119) | 1,000 / 0,704 | 63,3 / 169,9 | 267,8 |

Comparación con baselines clásicos y un detector preentrenado público:

| Modelo | Umbral | F1 interno | F1 externo | ROC-AUC interno / externo | CPU p50 / p95 (ms) | Tamaño (MB) |
|---|---|---|---|---|---|---|
| `rules` | 0,500 | 0,359 | 0,308 | 0,609 / 0,591 | **0,03 / 0,28** | — |
| `tfidf_lr` | 0,480 | 0,954 (0,939–0,969) | 0,129 (0,070–0,194) | 0,999 / 0,755 | 0,33 / 0,62 | 5,58 |
| `char_wb_tfidf_lr` | 0,452 | 0,963 (0,948–0,976) | 0,112 (0,058–0,174) | 0,999 / 0,832 | 1,11 / 5,11 | **2,06** |
| `char_wb_tfidf_lr_windowed` | 0,452 | 0,962 (0,947–0,975) | 0,145 (0,086–0,210) | 0,997 / **0,882** | 1,34 / 10,74 | **2,06** |
| `word_char_svm` | 0,941 | 0,965 (0,951–0,977) | 0,075 (0,029–0,127) | 1,000 / 0,795 | 3,47 / 6,33 | 4,58 |
| `protectai/deberta-v3-base-prompt-injection-v2` | 0,0002 | 0,947 (0,929–0,962) | **0,756** (0,703–0,807) | 0,995 / 0,879 | 525,5 / 826,1 | 737,7 |

Nota adicional de la model card: recalibrar solo el umbral con 30 muestras del dominio destino (evaluación fuera de muestra sobre las 516 restantes) eleva el F1 externo a 0,672 (`char_wb_tfidf_lr`) y 0,729 (`char_wb_tfidf_lr_windowed`). Es decir, buena parte de la brecha externa de los modelos ligeros es de calibración, no solo de representación.

## Requisitos de hardware

- **VRAM estimada para inferencia:** no disponible como dato medido. Por tamaño de pesos, la variante inglesa (267,8 MB en fp32) requiere del orden de 0,5–1 GB de memoria en GPU sumando activaciones para `batch_size` moderado; la multilingüe (541,3 MB) en torno a 1–1,5 GB; `all-MiniLM-L6-v2` (90,9 MB) por debajo de 0,5 GB. Son estimaciones por tamaño, no cifras publicadas.
- **CPU:** es el entorno de referencia de la model card. Latencias de una sola frase: p50 63,3 ms / p95 169,9 ms (`distilbert-base-uncased`), 92,0 ms / 248,3 ms (multilingüe), 78,6 ms / 145,5 ms (MiniLM) y 265,6 ms / 496,9 ms (`deberta-v3-small`).
- **GPU recomendadas:** ninguna es necesaria. Cualquier GPU consumer (RTX 3060, RTX 4090) sobra para el modelo; en A100/H100 el cuello de botella sería el preprocesado, no la matriz. `protectai/deberta-v3-base-prompt-injection-v2` (737,7 MB) sí se beneficia de GPU por sus 525,5 ms p50 en CPU.
- **Cabe en GPU consumer:** sí, con enorme margen, incluidas GPUs de portátil y iGPU con memoria unificada para las variantes MiniLM y DistilBERT.
- **Opciones de despliegue:** `transformers` + FastAPI/TorchServe para la variante transformer; `joblib` + scikit-learn para los baselines lineales del repo. vLLM y TGI **no aplican**: no es un modelo generativo (sin caché KV ni decodificación autoregresiva). `llama.cpp`/Ollama requerirían conversión a GGUF, que no se distribuye.
- **Throughput:** no publicado. Con las latencias en CPU indicadas y batching, la variante inglesa permitiría del orden de decenas de peticiones por segundo y núcleo, pero es una extrapolación, no un dato medido.

## Comparativa con modelos similares

| Modelo | Parámetros / tamaño | Contexto | F1 externo (`deepset`) | Latencia CPU p50 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `RelyD/prompt-injection-detector` (`distilbert-base-uncased`) | 66.955.010 / 267,8 MB | 128 tokens | 0,067 | 63,3 ms | Apache-2.0 | HuggingFace |
| `RelyD/prompt-injection-detector` (multilingüe) | no disponible / 541,3 MB | 128 tokens | 0,085 | 92,0 ms | Apache-2.0 | HuggingFace |
| `char_wb_tfidf_lr_windowed` (baseline del mismo repo) | no disponible / 2,06 MB | ventana (no especificada) | 0,145 (0,729 tras recalibrar umbral) | 1,34 ms | Apache-2.0 | Incluido en el repo |
| `protectai/deberta-v3-base-prompt-injection-v2` | no disponible / 737,7 MB | no disponible | **0,756** | 525,5 ms | no disponible en la información proporcionada | HuggingFace |

La comparación honesta: los detectores ligeros del repo ganan en latencia (hasta 8× más rápidos que `protectai`) y en tamaño (hasta 360× más pequeños que el detector grande), pero pierden entre 0,57 y 0,69 puntos de F1 en el dominio externo. El baseline de 2 MB con TF-IDF de caracteres y ventana deslizante iguala en la práctica el F1 externo de los transformers pequeños con una fracción del coste.

## Limitaciones y advertencias

- **Inyecciones apiladas o indirectas:** prefijos benignos largos antes de una inyección final diluyen la puntuación del documento o superan la ventana de 128 tokens. Es el fallo más grave en producción, porque el atacante solo necesita rellenar.
- **Roleplay, ingeniería social y encuadres ficticios:** ataques presentados como guiones de cine o pretextos médicos sin palabras de anulación explícitas no se detectan.
- **Ofuscación a nivel de carácter y prompts no ingleses:** caracteres espaciados (`"S a y t h a t..."`) e idiomas no vistos en entrenamiento (alemán, español, francés, ruso, croata) provocan fallos. El F1 externo de la variante multilingüe es de solo 0,085.
- **Falsos positivos en prompts imperativos legítimos:** prompts benignos con persona fuerte y restricciones de formato ("actúa como diseñador de SVG… no pongas el markdown dentro de un bloque de código") pueden disparar la alerta.
- **Cambio de dominio y confianza excesiva en el umbral:** las inyecciones de `xTRam1` fueron generadas sintéticamente con GPT-3.5-turbo, así que las métricas internas (F1 ≈ 0,968) no son extrapolables. Los umbrales de 0,9988–0,9999 implican que el modelo solo marca casos de confianza extrema, lo que hunde la recall fuera de dominio (0,034–0,103 en `deepset`).
- **Datos de entrenamiento con licencia no declarada:** la dataset card de `xTRam1/safe-guard-prompt-injection` no especifica licencia y la model card advierte de no redistribuir el texto en bruto. Conviene revisar la procedencia antes de un uso comercial.
- **No es una defensa completa:** la propia model card excluye bloquear usuarios sin revisión, juzgar contenido distinto de la inyección y aplicar la política de seguridad de forma autónoma sin guardrails de salida y de herramientas.
- **Madurez del artefacto:** 0 descargas y 0 *likes* en el momento de la consulta, creado y actualizado el 2026-10-28 (menos de una hora entre ambas fechas). No hay evidencia de uso en producción ni de auditoría externa.
- **Restricciones de licencia:** Apache-2.0 permite uso comercial y modificación, pero no cubre los datos de entrenamiento ni el modelo base de terceros más allá de sus propias licencias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RelyD/prompt-injection-detector
- Dataset de entrenamiento: https://huggingface.co/datasets/xTRam1/safe-guard-prompt-injection
- Dataset de evaluación externa: https://huggingface.co/datasets/deepset/prompt-injections
- Detector de referencia comparado: https://huggingface.co/protectai/deberta-v3-base-prompt-injection-v2
- Modelo base (variante inglesa): https://huggingface.co/distilbert-base-uncased
- Modelo base (variante multilingüe): https://huggingface.co/distilbert-base-multilingual-cased
- Modelo base compacto: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Modelo base alternativo: https://huggingface.co/microsoft/deberta-v3-small
- Paper, blog o demo adicionales: no disponible en la información proporcionada.

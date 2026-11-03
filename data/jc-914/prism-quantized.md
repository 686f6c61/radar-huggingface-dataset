# jc-914/prism-quantized

## Resumen

`jc-914/prism-quantized` es una cuantización INT4 del modelo Sarvam-Prism, un modelo de decisión desarrollado originalmente por Sarvam AI sobre su arquitectura Sarvam-105B. El modelo no genera texto libre: recibe un contexto y una o varias preguntas con un conjunto fijo de respuestas posibles, y devuelve una distribución de probabilidad sobre cada opción en un único forward pass. Está pensado para tareas de clasificación, enrutamiento y calibración de decisiones dentro de pipelines automatizados.

La relevancia de esta versión concreta es de infraestructura: el modelo original requiere una GPU con capacidad FP8 y aproximadamente 120 GB de memoria, lo que lo restringe a hardware de gama alta (H200, H100). Esta cuantización reduce el requisito a unos 10-12 GB de VRAM mediante un esquema que mantiene los pesos densos en GPU y transmite los expertos cuantizados desde RAM del host, capa a capa, con doble buffer. En la práctica, permite ejecutar un modelo de 55.800 millones de parámetros en tarjetas consumer de 12 o 16 GB.

La arquitectura subyacente es un transformer con mezcla de expertos (MoE) de 128 expertos enrutados por capa en 31 capas MoE, con unos 100.000 millones de parámetros en los expertos y unos 4.000 millones en atención, capa densa y expertos compartidos. El modelo cubre 11 idiomas: inglés y diez lenguas índicas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (128 expertos enrutados × 31 capas MoE, más expertos compartidos y capa densa 0); cabecera de decisión con atención específica sobre estado y preguntas |
| Parámetros totales | 55.809.171.328 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (la suite de evaluación cubre contextos de pocos tokens hasta ~4k tokens; no se especifica el máximo) |
| Tipos de cuantización | INT4 GPTQ (grupo 128, simétrico, escalas fp32) en expertos enrutados; FP8 e4m3 en atención, capa densa 0 y expertos compartidos; bf16/fp32 en embeddings, normas, router y cabecera de decisión |
| Idiomas soportados | en, hi, bn, ta, te, mr, gu, kn, ml, or, pa |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con código personalizado `custom_code` y kernel Triton propio) |

## Arquitectura y entrenamiento

El modelo base Sarvam-Prism es un transformer con mezcla de expertos. La parte cuantizada corresponde a los 128 expertos enrutados de cada una de las 31 capas MoE, que suman unos 100.000 millones de parámetros y se almacenan en INT4 con GPTQ simétrico, tamaño de grupo 128 y escalas en fp32. La atención, la capa densa 0 y los expertos compartidos (unos 4.000 millones de parámetros) permanecen en FP8 e4m3 con una escala por fila de salida, ensanchados a bf16 en el momento de uso. Embeddings, normas, router MoE y cabecera de decisión se mantienen en bf16 o fp32.

La calibración GPTQ se realizó sobre 262.533 tokens en el formato de entrada propio del modelo (estado, pregunta, opciones y respuesta, con la máscara de atención de decisión). El corpus es Wikipedia multilingüe en los 11 idiomas soportados, cubriendo los tres tipos de pregunta (`choice`, `yes_no`, `score`). La entrada de cada capa MoE se registró a partir del modelo FP8 original, y la proyección down de cada experto se calibró sobre la salida de su propia proyección gate/up ya cuantizada. Los 180 expertos de 3.968 que recibieron menos de 512 tokens de calibración usan redondeo al más cercano con búsqueda de clipping óptimo en MSE en lugar de GPTQ, para evitar sobreajustar la retroalimentación de error a pocas muestras.

El error relativo de salida ponderado por Hessiano es de 0,0014 para gate/up y 0,0036 para down, frente a 0,0075 y 0,0109 con redondeo simple. El despliegue usa un kernel Triton agrupado W4A16 con acumulación en fp32, bf16 en sm_80+ y fp16 en GPUs anteriores; compila para sm_70 hasta sm_120.

## Capacidades

- Clasificación y decisión con distribución de probabilidad completa sobre opciones fijas, en un solo forward pass.
- Tres tipos de pregunta soportados: elección entre categorías (`choice`), binaria (`yes_no`) y puntuación ordinal (`score`).
- Múltiples preguntas simultáneas sobre el mismo contexto, cada una con su propio conjunto de respuestas.
- Procesamiento por lotes mediante `decide_batch`, que amortiza el streaming de pesos entre peticiones.
- Cobertura multilingüe en 11 idiomas: inglés y diez lenguas índicas (hindi, bengalí, tamil, telugu, maratí, guyaratí, canarés, malayalam, oriya, panyabí).
- Salida calibrada como probabilidad, apta para umbrales y para agregación posterior.
- No genera texto libre; no es un modelo de chat ni de completado.
- No se documentan capacidades de tool calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Enrutamiento de tickets de soporte: el ejemplo de la model card clasifica un ticket entre equipos (`billing`, `tech`, `delivery`), evalúa urgencia con una pregunta `yes_no` y mide enfado del cliente con una escala `score`, todo en una pasada sobre el mismo contexto.
- Triaje de correo y bandejas de entrada: asignar categoría, prioridad y sentimiento a mensajes entrantes de forma consistente y con probabilidades comparables entre sí, útil para ordenar colas por confianza.
- Moderación de contenido con umbral calibrado: usar la probabilidad de la opción relevante como puntuación continua y fijar el umbral según la tolerancia a falsos positivos del dominio.
- Clasificación multilingüe en mercados índicos: un único modelo cubre inglés y diez lenguas índicas, lo que evita mantener clasificadores separados por idioma en despliegues regionales.
- Extracción de señales estructuradas de texto libre: convertir descripciones de producto, reseñas o incidencias en etiquetas ordinales y categóricas sin pipeline de prompting generativo.
- Evaluación de calidad o intención en datasets anotados: usar el modelo como anotador probabilístico para preetiquetar y priorizar revisión humana, con la ventaja de que la salida es una distribución y no una cadena de texto que haya que parsear.
- Despliegue en hardware limitado: cualquier flujo que necesite un modelo de decisión grande en una sola GPU de 12-16 GB, sin acceso a nodos con FP8 ni a memoria de 120 GB.

## Benchmarks y rendimiento

La model card publica una comparación de fidelidad frente al modelo FP8 original sobre una suite propia de 26 peticiones y 43 preguntas (inglés y las diez lenguas índicas, todos los tipos de pregunta, contextos de pocos tokens a ~4k), disjunta de los datos de calibración y con referencias generadas en un H200.

| Métrica | INT4 (límite 15 GiB) | INT4 (límite 11 GiB) |
|---|---|---|
| Coincidencia top-1 | 43 / 43 | 43 / 43 |
| Diferencia media de la mayor diferencia por opción | 0,012 | 0,012 |
| Diferencia máxima de la mayor diferencia por opción | 0,111 | 0,111 |
| KL media (original ‖ int4) | 0,0016 | 0,0016 |
| Memoria GPU pico | 12,3 GiB | 9,1 GiB |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las mayores divergencias aparecen en preguntas límite: un `yes_no` a 0,53/0,47 en el original sale a 0,64/0,36 en la versión INT4. La propia model card advierte que la suite es pequeña y recomienda validar contra datos etiquetados propios.

## Requisitos de hardware

- VRAM: mínimo ~10 GB; probado con límite duro de 15 GiB y de 11 GiB (picos de 12,3 GiB y 9,1 GiB respectivamente).
- RAM del host: ≥ 64 GB. Unos 54 GB de pesos de expertos residen en memoria fijada (pinned) del host, y la tabla de embeddings de 2 GB también vive en RAM.
- GPU: sm_80+ (Ampere o posterior) recomendado; sm_70/75 funcionan por una ruta más lenta. No requiere tensor cores FP8.
- Disco: ~56 GB (el repo ocupa 59,4 GB).
- Cabe en GPUs consumer de 12, 16 y 24 GB. Con ~60 GB libres en GPU, todos los pesos quedan residentes y no hay streaming.
- Software: Python 3.10+, PyTorch ≥ 2.4, Triton ≥ 3.0, `transformers==4.52.1` y un compilador de C (Triton compila su kernel en el primer uso).
- Despliegue: el repo incluye su propio runtime (`prism_int4.Prism`) con kernel Triton; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Rendimiento: no se publican cifras de latencia ni throughput. El diseño solapa la copia de la siguiente capa con el cómputo de la actual mediante doble buffer en un stream CUDA secundario; el procesamiento por lotes amortiza el streaming. Los parámetros ajustables son `gpu_memory_gb`, `workspace_gb` (por defecto 3,5), `batch_size` (16 preguntas por forward) y `max_batch_tokens` (16.384 tokens con padding por forward).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Hardware típico |
|---|---|---|---|---|---|
| jc-914/prism-quantized | 55,8B | no disponible | safetensors, INT4 GPTQ + FP8 | Apache 2.0 | GPU ≥ 10 GB + 64 GB RAM |
| sarvamai/prism (original) | no disponible en la información | no disponible | FP8 | Apache 2.0 | GPU con FP8, ~120 GB |
| Alternativas de clasificación de mismo tamaño | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación natural es contra el modelo base sin cuantizar: misma licencia y misma API (`decide`), pero con un requisito de memoria aproximadamente diez veces mayor. No se dispone de datos sobre otros modelos de decisión comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: solo responde a preguntas con opciones predefinidas. No sirve para completar texto, mantener conversaciones ni generar código.
- Riesgo de calibración deficiente en dominios alejados de la distribución de calibración (Wikipedia multilingüe en formato de decisión). La model card recomienda validar con datos etiquetados propios.
- Las diferencias frente al original se concentran en casos límite: decisiones con probabilidades cercanas a 0,5 pueden desplazarse de forma apreciable (ejemplo documentado: 0,53/0,47 → 0,64/0,36).
- La evaluación de fidelidad se basa en una suite pequeña (26 peticiones, 43 preguntas); no constituye una garantía de equivalencia en producción.
- Dependencia fuerte de RAM del host: sin 64 GB y memoria pinned, el streaming de expertos degrada o falla. El rendimiento depende del ancho de banda PCIe.
- Requiere `transformers==4.52.1` exacto y código personalizado con kernel Triton compilado en el primer uso; esto complica el empaquetado en contenedores y la portabilidad.
- Cobertura lingüística limitada a 11 idiomas; no se documenta comportamiento en castellano ni en otras lenguas.
- Licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones y avisos del modelo base `sarvamai/prism`.
- No se documentan sesgos específicos ni evaluaciones de seguridad en la información disponible.
- Sin datos publicados de latencia o throughput; el dimensionado debe hacerse por prueba directa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jc-914/prism-quantized
- Modelo base: https://huggingface.co/sarvamai/prism
- Estadísticas de cuantización por capa: `quantization/quant_stats.json` (incluido en el repo)
- Salidas completas de evaluación: `quantization/eval_*.json` (incluidas en el repo)
- Requisitos de dependencias: `requirements.txt` (incluido en el repo)
- Ejemplo de uso: `example.py` (incluido en el repo)

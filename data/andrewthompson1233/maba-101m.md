# AndrewThompson1233/maba-101m

## Resumen

maba-101m es un checkpoint de investigación publicado por el usuario AndrewThompson1233 en Hugging Face. No es un modelo destinado a uso general, sino una prueba de concepto de la arquitectura Maba v1, un diseño híbrido que combina recurrencia lineal (bloques GDN-2, Gated DeltaNet 2) con atención agrupada por consultas (GQA), compartición física de pesos en dos pasadas y una cabeza auxiliar de predicción multi-token (MTP).

El modelo tiene 101.177.984 parámetros y fue entrenado con solo 16 millones de tokens del dataset TinyStories, en 4 GPU NVIDIA L4, en precisión bfloat16 y con PyTorch DDP. Su propósito declarado es validar la topología arquitectónica (proporción 75% recurrencia / 25% atención, dos pasadas sobre 20 bloques físicos y decodificación especulativa con MTP) frente a otras configuraciones con el mismo presupuesto de parámetros.

Es relevante ahora como material de estudio para quienes investigan alternativas eficientes a la atención cuadrática: el autor reporta una reducción de caché KV del 52,4% en tiempo de ejecución respecto a una línea base de GQA pura de tamaño similar. Sin embargo, la propia model card advierte de que el checkpoint es estrictamente experimental y no debe usarse en entornos de producción, consultas factuales ni aplicaciones críticas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida recurrente-atención: 75% bloques GDN-2 (recurrencia lineal) + 25% bloques GQA; SwiGLU, RMSNorm, RoPE, residuales con puerta y compartición de pesos en 2 pasadas |
| Parámetros totales | 101.177.984 (101,18 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible de forma explícita; las métricas de caché KV se reportan a 4.000 tokens |
| Tipos de cuantización | No disponible; solo se publican pesos en bfloat16 y un checkpoint PyTorch, sin versiones GGUF, GPTQ, AWQ ni int8 |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (bfloat16) y pytorch_model.bin |
| Dimensión del modelo | 640 |
| Vocabulario | 32.768 tokens |
| Embeddings | Factorizados: 32.768 → 128 → 640 |
| Bloques físicos / capas efectivas | 20 / 40 (2 pasadas) |
| FFN | SwiGLU con intermediate_dim = 1728 |
| Cabeza auxiliar | MTP (multi-token prediction) con k=2 |
| Tamaño del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

El modelo implementa la topología definida en el repositorio maba-v1-architecture. La estructura parte de embeddings factorizados (32.768 → 128 → 640) y apila 20 bloques físicos que se recorren dos veces, dando lugar a 40 capas efectivas. De esos 20 bloques, 15 corresponden a recurrencia lineal GDN-2 y 5 a atención GQA con d_head = 64 y kv = 2; los bloques de atención se sitúan en la proporción del 25%. Cada bloque incorpora una red feed-forward SwiGLU con dimensión intermedia de 1728, normalización RMSNorm y residuales con puerta (gated residuals), en lugar de residuales estándar. La salida se complementa con una cabeza auxiliar MTP con k=2, pensada para habilitar decodificación especulativa.

El entrenamiento se realizó sobre 16 millones de tokens de TinyStories, un corpus sintético de cuentos infantiles en inglés, usando 4 GPU NVIDIA L4 en bfloat16 y PyTorch DDP. No se documenta ningún proceso de ajuste por instrucciones, RLHF, DPO u otra fase de alineación. La innovación técnica central es la combinación de recurrencia lineal GDN-2 con atención GQA bajo compartición física de pesos en dos pasadas, lo que permite duplicar la profundidad efectiva sin incrementar el número de bloques ni el coste de almacenamiento de pesos, y reducir la caché KV al reutilizar y compartir el estado entre pasadas.

## Capacidades

- Generación de texto autoregresiva en inglés, limitada a continuaciones narrativas breves del estilo de TinyStories.
- Predicción del siguiente token con una ventana de contexto que, según las métricas publicadas, se evalúa a 4.000 tokens.
- Decodificación especulativa mediante la cabeza auxiliar MTP con k=2, integrada en la propia arquitectura.
- Ejecución de inferencia en precisión bfloat16 con el paquete `maba/` incluido en el repositorio y el tokenizador rápido de 32.768 entradas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes, razonamiento multi-paso ni planificación.
- No se documenta capacidad multilingüe: el modelo está etiquetado únicamente como inglés.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Investigación en arquitecturas recurrentes híbridas: el checkpoint permite reproducir la proporción 75% GDN-2 / 25% GQA y medir su efecto sobre la perplejidad frente a variantes con solo GQA, usando el mismo presupuesto de 101 M de parámetros.
- Estudio de compartición de pesos en dos pasadas: sirve para analizar si 40 capas efectivas construidas sobre 20 bloques físicos aportan ganancia de calidad sin aumentar el número de parámetros almacenados.
- Evaluación de decodificación especulativa: la cabeza MTP con k=2 permite experimentar con verificación de tokens especulados y medir su impacto en el throughput frente a la decodificación token a token del ejemplo de la model card.
- Prototipado de inferencia de bajo coste: con 0,4 GB de repositorio y pesos en bfloat16 de aproximadamente 202 MB, se puede desplegar en hardware muy modesto para probar pipelines de generación antes de escalar a modelos mayores.
- Banco de pruebas comparativo a presupuesto fijo: el autor publica 3.000 tareas repartidas entre ARC-Easy, HellaSwag y Story-Cloze, útiles como plantilla de evaluación igualada entre arquitecturas de ~101 M de parámetros.
- Docencia y divulgación técnica: el código `maba/model.py` y `maba/config.py` sirven como ejemplo didáctico de implementación de recurrencia lineal, GQA y residuales con puerta en PyTorch.
- Pruebas de tokenización y embeddings factorizados: el esquema 32.768 → 128 → 640 es un caso práctico para estudiar el compromiso entre tamaño de vocabulario, dimensión de embedding y coste de parámetros.
- Generación de narrativa sintética: puede producir continuaciones de cuentos infantiles simples para pruebas de formato y de canalización de datos, nunca como contenido final publicable.

## Benchmarks y rendimiento

Resultados publicados en la model card. Los cuatro modelos se evaluaron con el mismo presupuesto de parámetros (~101 M) y sobre el mismo dataset (TinyStories). La línea base de azar es del 25% en las tres tareas de opción múltiple.

| Arquitectura | ARC-Easy (250) | HellaSwag (250) | Story-Cloze (250) | Val Loss (500 seq) | Val PPL (500 seq) | Rank |
|---|---|---|---|---|---|---|
| Maba v1 (101M) | 26,80% | 24,00% | 25,20% | 5,8787 | 357,34 | 1 |
| MiniCPM5 (101M) | 25,60% | 23,60% | 21,60% | 5,9476 | 382,84 | 2 |
| Qwen 3.8 Flash Next (101M) | 23,60% | 25,60% | 25,20% | 6,1351 | 461,80 | 3 |
| Qwen 3.8 (101M) | 25,20% | 23,60% | 25,60% | 6,1538 | 470,51 | 4 |
| Azar (referencia) | 25,00% | 25,00% | 25,00% | No aplica | No aplica | Baseline |

| Métrica de memoria y throughput | Maba v1 | Qwen 3.8 | Qwen 3.8 Flash Next | MiniCPM5 |
|---|---|---|---|---|
| Caché KV (4k en tiempo de ejecución) | 20.480 KB (20,0 MB) | 10.240 KB (10,0 MB) | 2.560 KB (2,5 MB) | 43.008 KB (42,0 MB) |
| Caché KV (4k físico) | 10.240 KB (10,0 MB) | 10.240 KB (10,0 MB) | 2.560 KB (2,5 MB) | 43.008 KB (42,0 MB) |
| Reducción de caché KV | −52,4% en tiempo de ejecución (−76,2% físico) | −76,2% | −94,0% | 0,0% (baseline) |
| Throughput de inferencia | 82,8 tok/s | 171,4 tok/s | 157,5 tok/s | 278,2 tok/s |
| Throughput de entrenamiento (4x L4) | ~660 tok/s | ~1.360 tok/s | ~1.290 tok/s | ~9.455 tok/s |
| Margen de razonamiento | +0,2237 | +0,1809 | +0,1618 | +0,1754 |

El propio autor no publica MMLU, HumanEval, GSM8K ni otras evaluaciones de conocimiento o razonamiento. Los valores de ARC-Easy y HellaSwag se sitúan muy cerca del 25% de acierto aleatorio, lo que es coherente con un entrenamiento de solo 16 M de tokens.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 250-400 MB contando pesos (~202 MB) y activaciones, con caché KV de 20,0 MB a 4.000 tokens.
- VRAM estimada en float32: aproximadamente 404 MB solo de pesos.
- VRAM estimada en int8: unos 101 MB, aunque no se publican ficheros cuantizados y habría que cuantizar el modelo manualmente.
- GPU recomendadas: cualquier GPU con más de 1 GB de VRAM es suficiente para inferencia; el entrenamiento del checkpoint se realizó en 4 GPU NVIDIA L4.
- Cabe sin problema en GPU de consumo: RTX 4090, RTX 3090, RTX 3060, GTX 1650 (4 GB) e incluso en CPU, dado el tamaño del modelo.
- Opciones de despliegue: la model card proporciona un ejemplo con PyTorch, `safetensors` y el tokenizador rápido dentro del paquete `maba/`. No se publican pesos GGUF, por lo que llama.cpp y Ollama no pueden usarlo directamente sin conversión previa. No hay confirmación de soporte nativo en vLLM, TGI o Text Generation Inference.
- Throughput de inferencia reportado: 82,8 tok/s, sin especificar en la model card el hardware exacto de la medición.
- Latencia: no disponible.

## Comparativa con modelos similares

Comparativa con las arquitecturas que el autor usa como referencia, todas con el mismo presupuesto de parámetros y entrenadas sobre el mismo corpus según la model card.

| Aspecto | Maba v1 | Qwen 3.8 (101M) | Qwen 3.8 Flash Next (101M) | MiniCPM5 (101M) |
|---|---|---|---|---|
| Parámetros exactos | 101.177.984 | 101.152.384 | 101.126.824 | 100.403.392 |
| Composición de capas | 75% GDN-2 + 25% GQA | 75% GDN + 25% GQA | 75% GDN + 25% QSA (sparse por microbloques) | 100% GQA |
| Bloques físicos | 20 | 20 | 20 | 28 |
| Capas efectivas | 40 (2 pasadas) | 20 (1 pasada) | 20 (1 pasada) | 28 (1 pasada) |
| Mecanismo de atención | GQA (d_head=64, kv=2) | GQA (d_head=64, kv=2) | QSA (sparse por microbloques) | GQA (d_head=48, kv=2) |
| Residual | Con puerta | Estándar | Doble puerta | Estándar |
| Cabeza especulativa | MTP (k=2) | MTP (k=2) | MTP (k=2) | Ninguna |
| Throughput de inferencia | 82,8 tok/s | 171,4 tok/s | 157,5 tok/s | 278,2 tok/s |
| Rank en la evaluación del autor | 1 | 4 | 3 | 2 |
| Licencia | MIT | No disponible | No disponible | No disponible |
| Disponibilidad pública | Repositorio en Hugging Face | No disponible | No disponible | No disponible |

Nota: los modelos etiquetados como "Qwen 3.8" y "MiniCPM5" aparecen únicamente como referencias internas dentro de la model card del autor. No se ha podido verificar en la información disponible que correspondan a publicaciones oficiales de dichas familias con esas especificaciones.

## Limitaciones y advertencias

- Entrenado con solo 16 millones de tokens de TinyStories, un corpus sintético de cuentos infantiles en inglés: no tiene conocimiento factual ni cobertura de dominios reales.
- Los resultados en ARC-Easy, HellaSwag y Story-Cloze están a uno o dos puntos porcentuales del azar (25%), lo que indica una capacidad de razonamiento prácticamente nula.
- La model card incluye una advertencia explícita del autor: uso exclusivo para investigación y prueba de arquitectura, no apto para producción, consultas factuales ni aplicaciones críticas.
- No se documenta ninguna fase de alineación (RLHF, DPO, ajuste por instrucciones), por lo que no cabe esperar que siga instrucciones ni que rechace peticiones problemáticas.
- Riesgo muy alto de alucinación si se le formulan preguntas de conocimiento general o se usa fuera de la generación de narrativa simple.
- Solo soporta inglés; el vocabulario es de 32.768 tokens y no se documenta entrenamiento multilingüe.
- La longitud de contexto no se declara de forma explícita; las métricas de caché KV se refieren a 4.000 tokens.
- La licencia MIT permite uso comercial del artefacto, pero el propio autor desaconseja ese uso por la calidad del checkpoint.
- No hay pesos cuantizados ni GGUF, lo que obliga a usar el paquete `maba/` incluido en el repositorio y dificulta la integración con runtimes estándar.
- El modelo requiere una implementación personalizada de la arquitectura; no se confirma que sea cargable con `AutoModelForCausalLM` sin registrar previamente el código.
- No hay validación externa: el repositorio tiene 0 descargas y 0 "likes" en el momento de redactar esta ficha.
- La model card mezcla métricas con hardware no especificado (por ejemplo, el throughput de 82,8 tok/s no indica la GPU empleada), lo que limita la reproducibilidad.
- Los metadatos del repositorio indican fecha de creación 2026-09-12, posterior a la fecha habitual de publicación de modelos comparables; conviene verificarla antes de citar el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AndrewThompson1233/maba-101m
- Repositorio de la arquitectura Maba v1 (referenciado en la model card): https://huggingface.co/AndrewThompson1233/maba-v1-architecture
- Paper: no disponible
- Repositorio de código independiente: no disponible (el código `maba/` se distribuye dentro del propio repositorio del modelo)
- Demo o espacio de inferencia: no disponible
- Búsqueda web: no se encontraron enlaces relevantes; los resultados devueltos corresponden a páginas de ayuda de YouTube y no guardan relación con el modelo.

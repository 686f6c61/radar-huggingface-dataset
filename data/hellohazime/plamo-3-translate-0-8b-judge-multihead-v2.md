# hellohazime/plamo-3-translate-0.8b-judge-multihead-v2

## Resumen
PLaMo 3 Translate 0.8B Judge — Multihead v2 es un adaptador LoRA sobre el modelo de traducción `pfnet/plamo-3-translate-0.8b` de Preferred Networks, publicado por el usuario `hellohazime`. No es un modelo generativo: es un clasificador de calidad de traducción que recibe un par de frase en inglés y su traducción al japonés y devuelve siete puntuaciones independientes que estiman si la traducción es correcta y qué tipo de error contiene.

Resuelve un problema concreto de los pipelines de traducción automática: la evaluación automática de calidad a nivel de segmento con granularidad de error. Frente a métricas agregadas tipo BLEU o COMET, este modelo señala categorías específicas de fallo —errores de número, negación, entidad, significado, omisión y adición— lo que permite enrutar segmentos a revisión humana o activar reintentos selectivos.

Es relevante por su eficiencia: reutiliza el decoder del modelo base (16 capas, hidden size 1.536, 16 cabezas de atención y 1 KV head) y añade únicamente 7,4 millones de parámetros entrenables (LoRA rank 16 más una cabeza lineal de 10.759 parámetros), manteniendo el coste de inferencia prácticamente idéntico al del modelo de traducción subyacente. Está orientado exclusivamente al par inglés-japonés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (PLaMo) con adaptador LoRA y cabeza de clasificación lineal multi-salida |
| Parametros totales | No disponible (adaptador LoRA de 7.405.568 parámetros más cabeza de 10.759; el grueso corresponde al modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens en total (instrucción, inglés, japonés y tokens especiales) |
| Tipos de cuantizacion | No disponible (el repositorio distribuye pesos BF16/FP32; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Inglés (entrada) y japonés (traducción evaluada) |
| Licencia | PLaMo Community License (etiquetada como `other` en Hugging Face) |
| Formato de pesos | Safetensors (adaptador LoRA en `adapter/`, cabeza en `head.safetensors`, tokenizador y `decision.json`) |

## Arquitectura y entrenamiento
El modelo parte del decoder de PLaMo 3 Translate 0.8B, un transformer de 16 capas con hidden size 1.536, 16 cabezas de atención y 1 KV head, originalmente entrenado para generar traducciones del inglés al japonés token a token mediante un LM Head de `Linear(1536, 107520)`. En esta variante se elimina la generación autoregresiva: el par completo (instrucción fija, frase en inglés, traducción candidata y EOS) se pasa una sola vez por el decoder y se toma la representación del último token no padding (posición EOS).

Sobre esa representación de 1.536 dimensiones se aplica una cabeza `Linear(1536, 7)` con bias, seguida de sigmoid por salida y comparación con umbrales preajustados por cabeza. El ajuste fino se realiza con LoRA de rank 16, alpha 32 y dropout 0 sobre `qkv_proj`, `o_proj`, `gate_up_proj` y `down_proj`, con `merge_adapter: false` para mantener el adaptador activo durante la inferencia. No se documentan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; el flag `smoke_only: false` indica que la versión publicada no proviene de un entrenamiento de prueba corto.

## Capacidades
- Clasificación multi-etiqueta de calidad de traducción inglés-japonés a nivel de segmento.
- Estimación de corrección global mediante la cabeza `is_correct` (umbral 0,836733).
- Detección de errores numéricos: cifras, cantidades, importes y horas (umbral 0,347533).
- Detección de errores de negación: inversión de polaridad, permiso frente a prohibición (umbral 0,492548).
- Detección de errores de entidad: nombres de persona, lugar, organización o producto (umbral 0,5).
- Detección de errores semánticos generales: acción, objeto, tiempo verbal, modalidad, obligación o relaciones (umbral 0,5).
- Detección de omisión de información sustantiva presente en el original (umbral 0,135198).
- Detección de adición de información ausente en el original (umbral 0,997959).
- Salidas simultáneas de las siete cabezas para un mismo par, con score continuo y etiqueta binaria.
- Interfaz CLI (`plamo-decision predict`) y API Python (`load_judge`, `predict`) con procesamiento por lotes.
- No dispone de tool calling, modo thinking, visión, audio ni generación de texto libre.

## Casos de uso
- Control de calidad en pipelines de traducción automática: cada segmento generado por un motor de traducción se evalúa con las siete cabezas y los que superan los umbrales de error se marcan para revisión, evitando revisión humana masiva sobre segmentos correctos.
- Enrutado selectivo a revisión humana: los segmentos con `is_correct` bajo o con `negation_error` y `entity_error` activos se derivan a traductores profesionales, mientras el resto se publica automáticamente.
- Detección de negaciones invertidas en documentación técnica y legal: la cabeza `negation_error` con umbral 0,492548 permite capturar casos críticos como prohibiciones traducidas como permisos antes de la publicación.
- Verificación de cifras en localización de productos: `number_error` detecta discrepancias en precios, cantidades y horarios en fichas de producto y manuales traducidos del inglés al japonés.
- Auditoría de memorias de traducción y corpus paralelos: el modelo puntúa pares existentes para limpiar memorias contaminadas por omisiones (`omission`, umbral 0,135198) o añadidos indebidos (`addition`, umbral 0,997959).
- Evaluación comparativa de sistemas de traducción: dado un mismo original en inglés y las salidas de varios motores, se comparan los siete scores por segmento para identificar qué sistema falla en qué categoría, complementando métricas agregadas.
- Filtrado de datos para entrenamiento: pares inglés-japonés sintéticos pueden descartarse automáticamente si `is_correct` no supera su umbral, reduciendo ruido en corpus de ajuste fino.
- Monitorización en producción: con lotes de 16 (`--batch-size 16`) y una sola pasada del decoder por par, el coste permite evaluar en línea el tráfico de un servicio de traducción sin duplicar la infraestructura.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un modelo base de 0,8B en BF16 con adaptador LoRA, la huella es reducida y cabe holgadamente en GPU de consumo, aunque el autor no publica cifras.
- GPU recomendadas: no especificadas por el autor; el entorno documentado usa CUDA 12.8 con PyTorch 2.9.1, compatible con tarjetas Ampere o superiores (RTX 3090, RTX 4090, A100, H100).
- GPU de consumo: sí, por el tamaño del modelo base (0,8B); cualquier GPU con suficiente VRAM para un modelo de menos de mil millones de parámetros en BF16 es apta.
- Opciones de despliegue: el repositorio incluye código propio (`plamo_decision`, CLI `plamo-decision` e `inference.py`) con soporte de `device="cuda"` y ejecución offline mediante `HF_HUB_OFFLINE=1`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; al requerir código custom y `merge_adapter: false`, el despliegue está ligado al paquete incluido.
- Latencia y throughput: no disponibles. El diseño de una sola pasada por par y el procesamiento por lotes (`batch_size`) reducen el coste frente a esquemas de generación autoregresiva.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|---|
| PLaMo 3 Translate 0.8B Judge Multihead v2 | Clasificador multi-cabeza sobre decoder 0,8B | 7,4M entrenables sobre base 0,8B | 1.024 tokens | en, ja | PLaMo Community License | 7 scores de calidad y tipo de error |
| pfnet/plamo-3-translate-0.8b | Modelo generativo de traducción | 0,8B | No disponible | en, ja | PLaMo Community License | Generación de traducción |
| COMET / COMETKiwi | Métrica neuronal de evaluación | No disponible | No disponible | Multilingüe | No disponible | Score agregado de calidad |
| BLEU / chrF | Métrica léxica | No aplica | No aplica | Multilingüe | No aplica | Solapamiento n-gramas |

La diferencia principal frente a COMET y BLEU es la granularidad: este modelo devuelve siete etiquetas por segmento con umbrales calibrados, mientras las métricas citadas producen un único valor agregado. Frente al modelo base de traducción, comparte decoder pero sustituye la generación por clasificación, con un coste adicional de solo 7,4 millones de parámetros.

## Limitaciones y advertencias
- Cobertura lingüística restringida: solo evalúa traducciones inglés-japonés; no es aplicable a otros pares de idiomas.
- Entrada limitada a 1.024 tokens contando instrucción, original, traducción y tokens especiales; segmentos largos deben dividirse.
- Los umbrales están preajustados por cabeza (por ejemplo, `addition` en 0,997959 y `omission` en 0,135198); su calibración sobre dominios distintos al de entrenamiento no está documentada y puede requerir reajuste.
- Riesgo de alucinación de scores: al ser un clasificador, errores de calibración se manifiestan como falsos positivos o negativos en las etiquetas, no como texto inventado; no se documentan métricas de precisión o recall por cabeza.
- Sesgos conocidos: no documentados en la información disponible; al entrenar sobre pares en/ja, puede reflejar distribuciones de dominio específicas.
- Licencia PLaMo Community License: es una licencia comunitaria con condiciones propias, no una licencia OSI; debe revisarse el texto enlazado antes de uso comercial.
- Dependencia de código custom (`plamo_decision`) y de una versión fijada del modelo base (commit `8b4d42855622093e610ba9b90c2d2b59f8d5c15d`), lo que limita la portabilidad a runtimes estándar de inferencia.
- El repositorio reporta 0 descargas y 0 likes en el momento de la consulta; no hay evidencia pública de validación externa.
- El flag `smoke_only: false` indica que no es un entrenamiento de prueba, pero no se publican detalles del dataset ni del proceso de anotación.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/hellohazime/plamo-3-translate-0.8b-judge-multihead-v2
- Modelo base: https://huggingface.co/pfnet/plamo-3-translate-0.8b
- Licencia PLaMo Community License: https://huggingface.co/hellohazime/plamo-3-translate-0.8b-judge-multihead-v2/blob/main/LICENSE/en
- Diagrama de arquitectura: https://huggingface.co/hellohazime/plamo-3-translate-0.8b-judge-multihead-v2/blob/main/assets/architecture.svg

# cmeister/boundary-markers-ru-d12-bnd_wpd_caps-mingram

## Resumen

Este repositorio contiene tres modelos de lenguaje en ruso (semillas 0, 1 y 2) entrenados con el propósito de comparar vocabularios de subpalabras que marcan explícitamente las fronteras de palabra. Es un artefacto de investigación asociado al artículo «Explicit Boundary Markers for Subword Vocabularies» (Sander Land y Clara Meister, arXiv:2608.08847), cuyo experimento original se hizo en inglés; estas son las réplicas en ruso entrenadas en septiembre de 2026. La única diferencia entre los tres modelos es la semilla; la comparación relevante es contra otras variantes de tokenizador del mismo estudio, no contra modelos de propósito general.

El tokenizador empleado, denominado `bnd_wpd_caps`, añade códigos de mayúsculas al esquema `bnd_wpd`: una palabra en capitalización de título se escribe como `<^>` seguido de su forma en minúsculas, y una palabra en mayúsculas se escribe como `<^^>` seguido de su forma en minúsculas, con el código fuera de los marcadores de la palabra. El vocabulario tiene 34.685 entradas (34.686 en el modelo, que añade un token de inicio de secuencia) y se entrenó con MinGram sobre una muestra de 5 GB de Russian FineWeb.

La arquitectura es la de nanochat (commit `92d63d4`): un transformer de 12 capas, anchura 768 y 6 cabezas de atención, con una ventana de contexto de 2.048 tokens. Se entrenó durante 2.553 pasos de 524.288 tokens, es decir, 1.340 millones de tokens, sobre un corpus de 2.920 millones de caracteres leído aproximadamente 3,35 veces. Su relevancia es metodológica: permite medir el efecto de un esquema de tokenización con marcadores de frontera sobre el bits por byte en ruso, con tres semillas para estimar la variabilidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo nanochat (12 capas, anchura 768, 6 cabezas de atención) |
| Parámetros totales | No disponible (no se publica el recuento; la configuración declara 12 capas y ancho 768) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantización | No disponible (no se publican versiones cuantizadas; solo pesos PyTorch) |
| Idiomas soportados | Ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state dict (`seed<n>/model_002553.pt`), cargable con `torch.load(..., weights_only=True)` |
| Tokenizador | `bnd_wpd_caps` entrenado con MinGram, vocabulario de 34.685 entradas (34.686 con el token de inicio de secuencia) |
| Tokens de entrenamiento | 1.340 millones (2.553 pasos × 524.288 tokens) |
| Corpus de entrenamiento | 10 shards de Russian FineWeb-2 (`fineweb-2_0_1-quality_10-filterrobots`), 2.920 millones de caracteres, leído unas 3,35 veces |
| Semillas publicadas | 0, 1 y 2 |
| Tamaño del repositorio | 2,5 GB |
| Pipeline de HuggingFace | No disponible |

## Arquitectura y entrenamiento

El modelo sigue la implementación de nanochat en el commit `92d63d4`, un transformer decoder-only de 12 capas con anchura 768 y 6 cabezas de atención, entrenado con el script `paper_utils/boundary/downstream/run_arms.sh` del repositorio script_tok. El contexto es de 2.048 tokens y el entrenamiento se ejecutó con una GPU por modelo. No se documenta en la model card el uso de RLHF, DPO ni ningún tipo de ajuste por preferencias: son modelos de lenguaje base, no instruct-tuned.

El componente diferencial no es la arquitectura, sino el tokenizador. Los esquemas con marcadores de frontera insertan señales explícitas de inicio y fin de palabra en la secuencia de subpalabras; la variante `bnd_wpd_caps` añade además códigos de caso (`<^>` para capitalización de título, `<^^>` para mayúsculas sostenidas), con el código situado fuera de los marcadores de la palabra. El test de caso requiere un carácter con distinción de caja, de modo que en escrituras sin caja los códigos no se activan. El tokenizador se entrenó con MinGram sobre 5 GB de Russian FineWeb y su archivo tiene el sha256 `8ca31296ab253dcabce82b9effbe9382b283b9a4b1d672ef1de14577c441d260`.

Un detalle metodológico importante: la semilla fija tanto la inicialización de pesos como el orden de los shards, y ese orden es idéntico para todos los tokenizadores de un mismo idioma. Por tanto, los modelos con la misma semilla son directamente comparables entre esquemas de tokenización, algo poco habitual en estudios de tokenización y que reduce el ruido de la comparación.

## Capacidades

- Generación de texto en ruso: modelo de lenguaje base entrenado sobre Russian FineWeb-2, sin ajuste por instrucciones.
- Modelado de lenguaje y puntuación de texto: su uso natural es el cálculo de pérdida y de bits por byte sobre texto ruso retenido.
- Tokenización con marcadores de frontera y códigos de caso: el artefacto incluye el tokenizador `bnd_wpd_caps` cargable mediante `BoundaryMinGramModel` del repositorio script_tok.
- Comparación controlada entre esquemas de tokenización: al compartir semilla con las variantes `plain` y otras del estudio, permite aislar el efecto del vocabulario.
- Reproducibilidad experimental: se publican los registros de entrenamiento (`train.log`), la configuración (`meta_002553.json`) y los hashes de cada archivo (`archive.json`).
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso específicamente entrenadas.
- No dispone de modo de razonamiento (thinking mode), visión, audio ni multimodalidad.
- Capacidad multilingüe: no disponible; el entrenamiento y el tokenizador son exclusivamente para ruso.

## Casos de uso

- Investigación en tokenización de subpalabras: comparar el bits por byte de `bnd_wpd_caps` frente a esquemas sin marcadores de frontera en ruso, usando la semilla para controlar el orden de los datos.
- Replicación y extensión del artículo arXiv:2608.08847: entrenar las mismas variantes en otros idiomas o con otros corpus y contrastar si la ventaja de los marcadores de frontera se mantiene fuera del inglés.
- Estudio de la interacción entre mayúsculas y tokenización en ruso: los códigos `<^>` y `<^^>` permiten analizar cuánto coste en bits añade la información de caso en un idioma con caja pero con morfología rica.
- Análisis de eficiencia de vocabulario: con 34.685 entradas y un corpus de 2.920 millones de caracteres, sirve para medir la relación entre tamaño de vocabulario, cobertura morfológica y pérdida final.
- Punto de partida para fine-tuning en tareas rusas: al ser un modelo pequeño con contexto de 2.048 tokens y licencia Apache 2.0, puede ajustarse para clasificación de texto, etiquetado o generación corta en dominios concretos.
- Experimento de inferencia en hardware modesto: la arquitectura de 12 capas y anchura 768 permite ejecutar las evaluaciones completas en una única GPU de gama media, útil para iterar sobre variantes de tokenizador.
- Docencia y formación en NLP: el repositorio expone de forma transparente tokenizador, configuración, log de entrenamiento y hashes, lo que lo hace apto para prácticas reproducibles sobre entrenamiento de modelos de lenguaje.

## Benchmarks y rendimiento

El único resultado publicado es la pérdida de validación medida en bits por byte: suma de la pérdida sobre un shard retenido de Russian FineWeb-2 dividida por la longitud UTF-8 real del texto puntuado. Menos es mejor, y los valores solo son comparables dentro de un mismo idioma.

| Semilla | Este modelo (`bnd_wpd_caps`) | Diferencia frente a `plain` |
|---|---|---|
| 0 | 0,53968 | +0,00932 |
| 1 | 0,54036 | +0,00892 |
| 2 | 0,53965 | +0,00978 |

Diferencia media: +0,00934, con desviación estándar entre semillas de 0,00043. Una diferencia positiva significa que este esquema obtuvo un bits por byte más bajo que `plain`, es decir, mejor. El autor advierte que tres semillas dan una dirección, no una estimación precisa; la comparación completa entre esquemas, entrenadores e idiomas está en el repositorio script_tok.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión. El repositorio completo de las tres semillas ocupa 2,5 GB, de modo que un único checkpoint es una fracción de esa cifra; un modelo de esta configuración (12 capas, anchura 768, contexto 2.048) se sitúa holgadamente en el rango de menos de 2 GB en fp32 y por debajo de 1 GB en fp16/bf16, como estimación orientativa no confirmada por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia y para evaluación; los 1.340 millones de tokens de entrenamiento se completaron con una sola GPU por modelo, por lo que el entrenamiento es viable en GPUs de gama media (por ejemplo, RTX 3090/4090, A10, L4).
- Cabe en GPU de consumo: sí, con margen amplio; incluso es posible ejecutarlo en CPU para evaluaciones puntuales.
- Opciones de despliegue: no hay soporte publicado para vLLM, TGI, llama.cpp u Ollama, ni pesos en formato GGUF. La vía documentada es PyTorch, cargando el state dict con `torch.load(..., weights_only=True)` y usando el código de nanochat en el commit `92d63d4` y el tokenizador de script_tok.
- Latencia y throughput: no disponible; no se publican mediciones de velocidad.

## Comparativa con modelos similares

No se dispone de identificadores ni de resultados de modelos comparables externos en la información proporcionada. La comparación natural es interna al propio estudio, entre esquemas de tokenizador con la misma arquitectura, los mismos datos y la misma semilla.

| Variante | Idioma | Tokenizador | Pérdida (bits por byte) | Licencia |
|---|---|---|---|---|
| Este modelo (`bnd_wpd_caps`, semilla 0) | Ruso | Fronteras de palabra más códigos de caso | 0,53968 | Apache 2.0 |
| Variante `bnd_wpd`, semilla 0 | Ruso | Fronteras de palabra sin códigos de caso | No disponible en esta ficha (en el repositorio script_tok) | Apache 2.0 (mismo estudio) |
| Variante `plain`, semilla 0 | Ruso | Subpalabras sin marcadores de frontera | 0,54900 (0,53968 + 0,00932) | Apache 2.0 (mismo estudio) |
| Modelos de propósito general del mismo tamaño | Multilingüe | Diversos | No disponible | Diversas |

## Limitaciones y advertencias

- No es un modelo de producción: es un artefacto de investigación con 1.340 millones de tokens vistos, una cantidad muy reducida para estándares actuales.
- No está ajustado por instrucciones ni alineado con preferencias humanas (sin RLHF/DPO); no se debe esperar un comportamiento de asistente.
- Contexto limitado a 2.048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Monolingüe en ruso: el vocabulario y los datos no cubren otros idiomas.
- Sin soporte de tool calling, agentes ni razonamiento multi-paso.
- Riesgo de alucinación y de reproducción de sesgos presentes en Russian FineWeb-2, un corpus rastreado de la web con los sesgos y la calidad desigual que eso implica.
- No se han publicado evaluaciones de sesgo, toxicidad ni seguridad.
- Los resultados se basan en tres semillas y en una única métrica (bits por byte); el propio autor indica que esto da una dirección, no una estimación precisa.
- Licencia Apache 2.0: permite uso comercial y modificaciones, pero el modelo se distribuye sin garantías y sin soporte.
- El formato de pesos es un state dict de PyTorch específico de nanochat, no un formato estándar de HuggingFace Transformers, lo que complica la integración en herramientas habituales.
- La fecha de creación registrada (20 de septiembre de 2026) y de actualización (20 de septiembre de 2026) indican que el repositorio no ha recibido mantenimiento posterior desde su publicación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cmeister/boundary-markers-ru-d12-bnd_wpd_caps-mingram
- Artículo «Explicit Boundary Markers for Subword Vocabularies» (arXiv:2608.08847): https://arxiv.org/abs/2608.08847
- Repositorio script_tok (tokenizador, utilidades del artículo y comparación completa): https://github.com/sanderland/script_tok
- nanochat (arquitectura y entrenamiento, commit `92d63d4`): https://github.com/karpathy/nanochat
- Corpus Russian FineWeb-2, release `fineweb-2_0_1-quality_10-filterrobots`: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2

Las búsquedas web realizadas no devolvieron enlaces relevantes sobre este modelo; los resultados obtenidos correspondían a páginas comerciales sin relación con el contenido de la ficha.

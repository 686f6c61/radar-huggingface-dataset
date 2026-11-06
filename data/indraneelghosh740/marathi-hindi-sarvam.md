# indraneelghosh740/marathi-hindi-sarvam

## Resumen

`indraneelghosh740/marathi-hindi-sarvam` es un ajuste fino supervisado (LoRA fusionado en un checkpoint independiente) del modelo `sarvamai/sarvam-translate`, especializado exclusivamente en traducción de marati (mr) a hindi (hi). Lo publica el usuario indraneelghosh740 sobre la arquitectura Gemma 3, con 4.300.079.472 parámetros totales y un repositorio de 8,6 GB en formato safetensors. El modelo base pertenece a Sarvam AI y está orientado a traducción entre lenguas indias, en línea con las iniciativas del ecosistema Bhashini.

El problema que aborda es concreto: la traducción directa marati-hindi de calidad, un par lingüístico con millones de hablantes pero con recursos paralelos limitados en comparación con pares como inglés-hindi. El ajuste se realizó sobre 407.088 pares marati-hindi filtrados por alineamiento semántico (LaBSE ≥ 0,90), lo que reduce el ruido típico de corpus extraídos automáticamente.

Es relevante por dos motivos. Primero, demuestra que un LoRA de rango 64 sobre las proyecciones de atención y MLP del *language tower* basta para especializar un modelo de traducción multilingüe en un par concreto con resultados razonables en dominios internos (BLEU 53,17 en el conjunto propio). Segundo, expone con claridad las limitaciones de la especialización: la caída a BLEU 22-23 en conjuntos de referencia estándar (FLORES, IN22) indica que el ajuste está fuertemente sesgado al dominio de los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (Gemma 3), cargado mediante `AutoModelForImageTextToText` |
| Parametros totales | 4.300.079.472 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (longitud máxima de entrenamiento: 256 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el modelo base admite cuantizaciones estándar, pero no se documentan en la model card) |
| Idiomas soportados | marati (mr) como entrada, hindi (hi) como salida; únicamente dirección mr→hi |
| Licencia | GPL-3.0 (heredada del modelo base) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino por LoRA del checkpoint `sarvamai/sarvam-translate`, que a su vez se apoya en la arquitectura Gemma 3 (transformer decoder-only con torre de lenguaje y capacidades multimodales, de ahí que la model card use `AutoModelForImageTextToText`). El adaptador LoRA se aplicó con r=64 y alpha=128 sobre las proyecciones de atención y MLP de la torre de lenguaje, y posteriormente se fusionó en un checkpoint único, de modo que la inferencia no requiere cargar el adaptador por separado.

Los datos de entrenamiento son 407.088 pares marati-hindi curados con un filtro de alineamiento LaBSE de al menos 0,90, lo que implica una selección agresiva por similitud semántica. El entrenamiento usó una tasa de aprendizaje de 1e-4, tamaño de lote efectivo de 64, una sola época y longitud máxima de 256 tokens. No se documenta el uso de RLHF, DPO ni ninguna técnica de alineación adicional; es un ajuste supervisado puro sobre datos paralelos. Tampoco se especifica el número total de tokens vistos ni la composición por dominio del corpus.

## Capacidades

- Traducción unidireccional marati → hindi, su única función declarada y evaluada.
- Formato de conversación mediante plantilla de chat (`apply_chat_template`) con mensaje de sistema que indica el idioma de destino.
- Generación determinista recomendada (`do_sample=False`), coherente con una tarea de traducción.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del par mr→hi; el modelo base es multilingüe, pero el ajuste no ha sido evaluado en otras direcciones.
- Capacidades multimodales heredadas de la arquitectura Gemma 3 no verificadas ni evaluadas en este checkpoint.

## Casos de uso

- Traducción de documentación administrativa marati-hindi: el modelo puede procesar párrafos y frases sueltas de textos oficiales, adecuado por el filtrado LaBSE de los datos de entrenamiento, que favorece pares con equivalencia semántica alta.
- Localización de contenido web y aplicaciones: integrado en un pipeline de preprocesado que divida el texto en fragmentos de hasta 256 tokens, permite generar versiones en hindi de páginas originalmente en marati.
- Subtitulado y transcripción de medios: traducción de subtítulos marati a hindi en lotes, con decodificación greedy para garantizar reproducibilidad entre ejecuciones.
- Atención al cliente en regiones bilingües: traducción de consultas y respuestas entre marati y hindi en sistemas de soporte que ya operan en hindi, usando el modelo como capa de traducción previa a un LLM conversacional.
- Investigación en traducción automática de lenguas indias: punto de partida reproducible para experimentos de ajuste por LoRA sobre modelos de traducción de Sarvam, con hiperparámetros y datos documentados.
- Generación de corpus paralelos aumentados: traducción de grandes volúmenes de texto marati a hindi para ampliar datasets de entrenamiento de otros sistemas, siempre con revisión humana dado el riesgo de artefactos de formato.

## Benchmarks y rendimiento

Evaluación con decodificación greedy, BLEU-13a y chrF++ (orden de palabra 2) sobre la salida cruda del modelo, según la model card del autor:

| Conjunto | Filas | Referencias | BLEU | chrF++ |
|---|---|---|---|---|
| Interno (`MrHi_544`) | 544 | 3 (algunas filas difieren) | 53,17 | 65,64 |
| FLORES devtest | 1.012 | 1 | 22,53 | 46,75 |
| IN22-Gen | 1.024 | 1 | 22,00 | 47,16 |
| IN22-Conv | 1.503 | 1 | 23,41 | 45,23 |

La diferencia entre el conjunto interno y los conjuntos de referencia estándar es sustancial (más de 30 puntos de BLEU), lo que sugiere un ajuste muy orientado al dominio de los datos de entrenamiento. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 8,6 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda un mínimo de 12-16 GB para secuencias cortas.
- GPU recomendadas: A100 (40/80 GB) o H100 para despliegues de alto throughput; RTX 4090 (24 GB) para inferencia en bf16 sin cuantizar.
- Cabe en GPU de consumo: sí, en RTX 4090 y potencialmente en GPUs de 16 GB si se aplica cuantización de 8 bits, aunque no se documentan recetas de cuantización para este checkpoint.
- Opciones de despliegue: `transformers` con `device_map="auto"` según la model card; vLLM, TGI y llama.cpp no están documentados para este modelo y requerirían verificar compatibilidad con la arquitectura Gemma 3 multimodal.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `indraneelghosh740/marathi-hindi-sarvam` | 4,3 B | no disponible (entrenado a 256) | mr→hi | GPL-3.0 | Hugging Face, 0 descargas |
| `sarvamai/sarvam-translate` (base) | no disponible | no disponible | multilingüe indio | no disponible en esta ficha | Hugging Face |
| Modelos NMT dedicados marati-hindi (p. ej. IndicTrans2) | no disponible | no disponible | lenguas indias | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada. La comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgo de dominio: la brecha entre BLEU 53,17 en el conjunto interno y 22-23 en FLORES e IN22 indica un ajuste fuertemente sobreajustado a la distribución de los datos de entrenamiento; el rendimiento en texto fuera de dominio puede degradarse notablemente.
- Artefacto de formato: aproximadamente el 46 % de las salidas en el conjunto interno incluyen un espacio antes de la puntuación (por ejemplo, `शब्द ,`), aprendido de los datos tokenizados; requiere postprocesado obligatorio en producción.
- Unidireccional: solo traduce marati→hindi; no ha sido evaluado en la dirección inversa ni en otros pares.
- Riesgo de alucinación: no evaluado explícitamente; en traducción automática se manifiesta como omisiones, adiciones o cambios de sentido, especialmente en frases largas o ambiguas.
- Longitud limitada: el entrenamiento usó un máximo de 256 tokens; textos más largos deben fragmentarse, con el riesgo de perder coherencia en los límites de fragmento.
- Licencia GPL-3.0: impone obligaciones de copyleft para uso comercial y distribución; cualquier producto derivado que incorpore el modelo debe cumplir la GPL, lo que puede ser incompatible con despliegues propietarios.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación independiente de los resultados reportados.
- Sin datos de sesgo demográfico ni de calidad por registro lingüístico (formal, coloquial, dialectal).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/indraneelghosh740/marathi-hindi-sarvam
- Modelo base: https://huggingface.co/sarvamai/sarvam-translate
- Licencia GPL-3.0: https://www.gnu.org/licenses/gpl-3.0.html
- Iniciativa Bhashini: https://bhashini.gov.in
- Conjunto FLORES-200: https://github.com/facebookresearch/flores
- Conjunto IN22: https://huggingface.co/datasets/ai4bharat/IN22-Gen

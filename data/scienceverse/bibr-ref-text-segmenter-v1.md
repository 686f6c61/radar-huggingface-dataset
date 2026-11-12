# scienceverse/bibr-ref-text-segmenter-v1

## Resumen

`bibr-ref-text-segmenter-v1` es un modelo ONNX de segmentación de referencias bibliográficas desarrollado por scienceverse. No es un modelo generativo, sino un etiquetador de tokens (token tagger) que identifica los límites entre referencias individuales dentro del texto continuo de una sección de bibliografía. Resuelve un problema muy concreto dentro del pipeline `bibr`: cuando el texto de la sección de referencias se une en tiempo de ejecución, es necesario separar cada entrada bibliográfica antes de poder extraer sus campos.

El modelo se construye sobre el encoder `jhu-clsp/mmBERT-small` (22 capas, dimensión oculta 384, multilingüe) con una cabeza lineal que clasifica cada token en tres etiquetas: `O` (fuera de referencia), `B-REF` (inicio de referencia) e `I-REF` (interior de referencia), sin capa CRF. Sustituye al anterior `reference-segmenter-crf` (scienceverse/bibr-segmenter-v1) y se distribuye como fallback de texto dentro de la cascada de extracción de referencias.

La relevancia actual reside en su empaquetado: un único fichero ONNX de 268,6 MB con embeddings cuantizados a int8, dependencias mínimas (`onnxruntime` + `tokenizers`, sin torch) y paridad verificada contra la exportación fp32 en 40 de 40 papers. Esto lo hace trivial de desplegar en entornos de producción ligeros. El repositorio ocupa 0,3 GB y la licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (jhu-clsp/mmBERT-small, 22 capas x 384) + cabeza lineal de etiquetado de tokens (O / B-REF / I-REF), sin CRF |
| Parametros totales | no disponible (pesos ONNX de 268.620.732 bytes en int8; export fp32 de 562.508.070 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas de 1.024 tokens con stride 768 |
| Tipos de cuantizacion | int8 en embeddings de tokens (una escala por fila); resto de pesos en float32 |
| Idiomas soportados | multilingüe por herencia de mmBERT-small; entrenamiento principalmente en inglés (PMC) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17), con `tokenizer.json` (Hugging Face tokenizers) y `segmenter.json` |

## Arquitectura y entrenamiento

El modelo es un etiquetador de tokens sobre el encoder `jhu-clsp/mmBERT-small`, de 22 capas y dimensión oculta 384, con una cabeza lineal que produce logits por token para tres etiquetas: `O`, `B-REF` e `I-REF`. No emplea CRF; la decodificación es argmax por token. La entrada es el texto de la sección de referencias tal y como lo une `bibr` en tiempo de ejecución, sin tokens especiales (`add_special_tokens=False`), procesado en ventanas de 1.024 tokens con stride 768 y fusión de ventanas mediante un esquema de confianza (`trust = min(i, L - 1 - i)`) que asigna a cada token la etiqueta de la ventana donde su confianza es mayor. La decodificación abre una referencia en cada token `B-REF` y la extiende hasta el siguiente inicio; la primera referencia se fuerza a abrir en el primer carácter no espacio.

El entrenamiento usó `data/text_v1`, derivado de las filas geom v2 filtradas por registro y partición (solo papers limpios, tasa de coincidencia 1,0). El conjunto comprende 21.798 papers de entrenamiento (994.664 referencias, 113.012.269 tokens en 118.517 ventanas), 1.122 papers de dev y 1.196 de test, más 812 papers de test_journal. Las etiquetas son cadenas de referencia JATS proyectadas sobre las líneas de referencia propias de `bibr`. Los datos provienen de PMC, mayoritariamente en inglés, con licencias CC BY (21.668), CC0 (106) y CC BY-SA (24). Los modos de texto de entrenamiento fueron region (12.962), lines (5.515) y merged (3.321). Todos los conjuntos de evaluación del registro de exclusiones quedaron fuera del entrenamiento (manifiesto sha256 `d8d427de3ea7b954`, split `corpus-split-v1` sha256 `c6fc246571f435d7`). La cuantización int8 de los embeddings de tokens se realizó con `refseg_text_fallback_train.py quantize` a partir del export fp32, con un error máximo de desquantización de 0,0013; la paridad con torch sobre 40 papers EXCITE dio una diferencia máxima de logits de 0,068 (fp32: 1,1e-5), cero cambios de etiqueta y segmentos idénticos en 40 de 40.

## Capacidades

- Segmentación de referencias bibliográficas en texto continuo: identifica los límites entre entradas individuales dentro de una sección de bibliografía unida.
- Etiquetado por token con tres clases (`O`, `B-REF`, `I-REF`) y decodificación determinista basada en inicios `B-REF`.
- Procesamiento de ventanas largas mediante solapamiento (1.024 tokens, stride 768) con fusión por confianza, lo que permite manejar secciones de referencias de longitud arbitraria.
- Capacidad multilingüe heredada del encoder mmBERT-small, aunque el entrenamiento se centró en inglés.
- Inferencia ligera sin torch: solo requiere `onnxruntime` y `tokenizers`.
- Integración directa en el pipeline `bibr` mediante la variable de configuración `REF_TEXT_SEG_MODEL_ID`, en la ruta de fallback de texto.
- Decodificación que nunca rechaza: si no se encuentra nada, fuerza la primera unidad (`when_nothing_found: first_unit_forced`).
- No soporta tool calling, agentes, generación de texto, visión ni audio: es un componente especializado de un solo paso.

## Casos de uso

- Extracción de referencias en pipelines de minería de literatura científica: el modelo separa cada entrada bibliográfica del bloque de texto unido, paso previo imprescindible para el parseo de autores, títulos, revistas y DOIs. Es adecuado porque su F1 de entrada alcanza 0,998 en el test de PMC.
- Procesamiento de artículos de PMC a gran escala: con 113 millones de tokens de entrenamiento y un rendimiento de 0,252 s por paper en CPU de 4 hilos (60 papers EXCITE, 74.874 tokens), permite procesar corpus completos sin GPU.
- Despliegue en entornos sin GPU ni torch: al depender solo de `onnxruntime` y `tokenizers`, se integra en contenedores ligeros, funciones serverless o máquinas de bajo recursos.
- Fallback de texto en cascadas de extracción: cuando la vía geométrica declina procesar un paper (54 casos en EXCITE dev con `clean_in_text` de 0,8775), este modelo cubre la segmentación por texto y mantiene la cobertura del pipeline.
- Procesamiento de PDFs escaneados o con geometría no fiable: en el proxy de escaneos obtiene un `key_f1` de 0,8881, por lo que sirve como vía alternativa cuando la extracción geométrica falla.
- Normalización de bibliografías en repositorios institucionales: segmentar listas de referencias heterogéneas para su conversión a formatos estructurados (JATS, BibTeX) antes de la catalogación.
- Evaluación y control de calidad de metadatos: comparar las referencias segmentadas contra registros existentes para detectar entradas faltantes o fusionadas en bases de datos bibliográficas.

## Benchmarks y rendimiento

| Conjunto | Métrica | Valor | Notas |
|---|---|---|---|
| PMC dev text (1122) | entry_f1 | 0,9955 | |
| PMC test text (1196) | entry_f1 | 0,998 | |
| PMC test_journal text (812) | entry_f1 | 0,9983 | |
| EXCITE dev standalone (162) | clean_in_text | 0,9402 | vs_s1: 0,9353; vs_v1: 0,8034 |
| EXCITE dev geometry-declined (54) | clean_in_text | 0,8775 | vs_s1: 0,8739; vs_v1: 0,6825; vs_recorded_cascade: 0,9016 |
| scans proxy (78) | key_f1 | 0,8881 | vs_s1: 0,8686; vs_v1: 0,837 |
| gold val no-leak (167 items) | exact_f1 | 0,9024 | vs_s1: 0,9424; vs_v1: 0,9036 |
| gold val no-leak, mdpi_socsci100 (48) | exact_f1 | 0,8315 | vs_s1: 0,9575; iou50_f1: 0,9812 |
| EXCITE dev standalone (162), int8 | clean_in_text | 0,9402 | idéntico a fp32; 0 papers difieren de fp32 ONNX |
| EXCITE dev geometry-declined (54), int8 | clean_in_text | 0,8775 | idéntico a fp32 |
| scans proxy (78), int8 | key_f1 | 0,888 | vs_fp32_onnx: 0,8877; 1 paper difiere de fp32 ONNX |
| audience_eval200, pipeline completo (198 papers) | refs.entries | 0,9 | solo tier frente a cascada por defecto |

Tiempos de CPU (60 papers EXCITE, 74.874 tokens, onnxruntime, núcleos 0-3, mediana de 3 rondas alternas): int8 con 4 hilos 0,252 s/paper, 1 hilo 0,747 s/paper; fp32 con 4 hilos 0,26 s/paper, 1 hilo 0,751 s/paper. La cuantización int8 no degrada la calidad de forma apreciable.

## Requisitos de hardware

- VRAM estimada: no aplica en el modo de referencia (CPU con onnxruntime); en GPU, el fichero ONNX de 268,6 MB cabe holgadamente en cualquier GPU con más de 1 GB de memoria.
- GPU recomendadas: no se especifican en la información disponible; cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) puede alojar el modelo. El benchmark publicado es en CPU.
- Cabe en GPU consumer: sí, con amplio margen, dado el tamaño de 268,6 MB.
- Opciones de despliegue: onnxruntime (ruta oficial, `predict-onnx`), integración en `bibr` mediante `REF_TEXT_SEG_MODEL_ID`; no se documentan otras opciones (vLLM, llama.cpp, Ollama, TGI no aplican a este tipo de modelo).
- Latencia y throughput: 0,252 s/paper en CPU de 4 hilos con int8 (60 papers EXCITE, 74.874 tokens); 0,747 s/paper con 1 hilo. No hay datos de latencia en GPU.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Licencia | Rendimiento (EXCITE dev standalone) | Disponibilidad |
|---|---|---|---|---|---|
| bibr-ref-text-segmenter-v1 (este) | Etiquetador de tokens ONNX (mmBERT-small) | Ventanas de 1.024 tokens, stride 768 | MIT | clean_in_text 0,9402 | Hugging Face (scienceverse) |
| reference-segmenter-crf (scienceverse/bibr-segmenter-v1) | Segmentador CRF | no disponible | no disponible | clean_in_text 0,8034 | Hugging Face |
| S1 (referenciado como `vs_s1` en la model card) | no disponible | no disponible | no disponible | clean_in_text 0,9353 | no disponible |

En la comparativa interna de la model card, este modelo supera al segmentador CRF anterior (0,9402 frente a 0,8034 en EXCITE dev standalone) y queda ligeramente por debajo de S1 (0,9353 frente a 0,9424 en gold val no-leak), aunque la diferencia en EXCITE dev standalone no es significativa (IC95: -0,0123 a 0,0206). No se dispone de información sobre otros modelos comparables de segmentación de referencias.

## Limitaciones y advertencias

- Es un modelo especializado: no genera texto, no razona y no admite instrucciones; cualquier uso fuera de la segmentación de referencias no está soportado.
- El entrenamiento se realizó principalmente sobre PMC en inglés; el rendimiento en otros idiomas o en dominios editoriales distintos no está evaluado y puede degradarse.
- En el conjunto gold val no-leak queda por debajo de S1 (0,9024 frente a 0,9424) y en mdpi_socsci100 la diferencia es notable (0,8315 frente a 0,9575), lo que sugiere menor robustez en ciertos dominios de ciencias sociales.
- La decodificación fuerza siempre una primera referencia en el primer carácter no espacio, por lo que nunca devuelve una salida vacía; en textos que no son listas de referencias puede producir segmentaciones espurias.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de falsos positivos en la detección de límites cuando el texto de entrada no sigue el formato esperado.
- La licencia MIT permite uso comercial sin restricciones adicionales conocidas; no obstante, los datos de entrenamiento incluyen materiales CC BY-SA, cuya implicación en modelos derivados conviene revisar con asesoramiento legal.
- La ventana de 1.024 tokens con stride 768 implica un solapamiento considerable; secciones de referencias muy largas requieren múltiples pasadas y la fusión por confianza puede introducir discrepancias en los bordes si el texto está mal tokenizado.
- El modelo requiere que el texto de entrada se construya exactamente como lo hace `bibr` en tiempo de ejecución; un preprocesado distinto puede alterar los resultados.

## Enlaces

- Hugging Face: https://huggingface.co/scienceverse/bibr-ref-text-segmenter-v1
- Modelo anterior sustituido: https://huggingface.co/scienceverse/bibr-segmenter-v1 (commit 344f27d851ffb901b2659629ac879f10b6eba234)
- Encoder base: https://huggingface.co/jhu-clsp/mmBERT-small
- Repositorio de código de referencia citado en la model card: `scripts/refseg_text_fallback_train.py` (no se proporciona URL)
- No se han encontrado otros enlaces (papers, blogs, demos) en la información disponible.

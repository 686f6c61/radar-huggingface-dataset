# songlab/gpn-star-hg38-m447-25m-top20

## Resumen

GPN-Star M447 25M top-20 es un modelo de lenguaje genómico de tipo `fill-mask` desarrollado por el laboratorio Song (songlab), orientado a la predicción de efectos de variantes (variant-effect prediction) sobre genoma humano. Se trata de un reentrenamiento experimental del checkpoint GPN-Star M447 25M original, en el que se ha ampliado el conjunto de ventanas de entrenamiento conservadas hasta el 20 % superior según phastCons470way, en lugar del 5 % superior empleado en la versión publicada. El modelo no sustituye al checkpoint original y no es un modelo destilado de secuencia única: requiere la alineación multiespecie hg38 M447 original y su ordenamiento de especies para inferir.

La arquitectura es la GPN-Star small original, un transformer de 8 capas, 8 cabezas de atención, anchura oculta 512 y anchura intermedia 2.048, con 25.869.671 parámetros en fp32. El contexto de trabajo son ventanas de alineación de 256 pb con un paso de candidato de 128 pb, y la tarea principal es enmascarar el nucleótido humano central y estimar la verosimilitud de cada alelo alternativo condicionada por la alineación multiespecie. La relevancia actual reside en que permite puntuar SNVs humanos propios con una calibración de tasa de mutación neutra específica del modelo, aunque su naturaleza experimental y su dependencia de datos de alineación externos limitan su uso directo en producción sin validación adicional.

El modelo se distribuye con licencia MIT, en formato safetensors, con un tamaño de repositorio de 0,1 GB, y no incluye la alineación de 447 especies ni el checkpoint final de 150.000 pasos: solo se publica el mejor checkpoint de validación en cromosoma 21 a 145.000 pasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPN-Star small (transformer encoder con condicionamiento por alineación multiespecie) |
| Parametros totales | 25.869.671 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventanas de alineación de 256 pb, paso de candidato 128 pb |
| Tipos de cuantizacion | fp32 (pesos publicados); autocast fp16 en CUDA para inferencia |
| Idiomas soportados | no disponible (modelo de genómica, no de lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers), con metadatos filogenéticos y tabla de calibración incluidas |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPN-Star en su variante small: 8 capas de transformer, 8 cabezas de atención, dimensión oculta 512 y dimensión intermedia 2.048, con 25.869.671 parámetros. La entrada no es ADN crudo sino `input_ids`, `source_ids` y `target_species`, es decir, tokens derivados de una alineación multiespecie de 447 columnas en el orden original (243 columnas seguidas de 204, con el humano en la columna 0). La predicción se realiza enmascarando el nucleótido humano central en la secuencia objetivo y en la fuente de alineación, y promediando los logits de las predicciones directa y reverso-complementaria mapeadas a orden A/C/G/T, con índices objetivo 128 y 127 respectivamente.

El entrenamiento se realizó sobre los cromosomas 1–20, X e Y, con validación y test en los conjuntos originales de chr21 y chr22 del modelo top-5 %. La selección de regiones combina el 20 % superior de puntuaciones de conservación de ventana (percentil 75 de phastCons470way dentro de la ventana) más un 0,1 % de remanente aleatorio, generando un pool de 3.732.978 ventanas únicas y 7.465.956 ejemplos forward/reverse-complement. La optimización empleó 150.000 pasos con batch global 256, AdamW, learning rate 1e-4 y 2.500 pasos de warmup; el checkpoint publicado corresponde al paso 145.000, seleccionado por mejor validación en cromosoma 21 sin usar etiquetas de benchmarks de efecto de variante. Se incluye una tabla de calibración de tasa de mutación neutra con 3.072 clases dirigidas de pentanucleótido central/ALT, ajustada con 6.578.091 sitios neutros originales de hg38.

## Capacidades

- Predicción de efecto de variantes puntuales (SNVs) humanos mediante log-likelihood ratio entre alelo alternativo y de referencia.
- Puntuación calibrada por tasa de mutación neutra según pentanucleótido central y alelo ALT.
- Salidas de impacto (`impact_raw`, `impact_calibrated`) y magnitud absoluta del efecto (`abs_llr_calibrated`).
- Condicionamiento por alineación multiespecie de 447 especies, lo que incorpora señal evolutiva conservada.
- Ejecución en CPU (fp32) y GPU (autocast fp16) mediante el wrapper `top20.py`.
- Carga como `GPNStarForMaskedLM` en modo eval con parámetros fp32 y gradientes preservados.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües de lenguaje natural.
- No valida indels ni recetas de fine-tuning: el release solo cubre inferencia de SNVs.

## Casos de uso

- Priorización de variantes en estudios de asociación: puntuar SNVs candidatos con `llr_calibrated` para ordenar variantes por compatibilidad evolutiva antes de validación experimental, aprovechando la señal de conservación de la alineación M447.
- Filtrado de variantes de significado incierto en paneles clínicos de investigación: usar `impact_calibrated` como característica adicional en un clasificador junto a predictores clásicos, con la cautela de que el modelo es experimental.
- Análisis de regiones conservadas: comparar puntuaciones en ventanas del 20 % superior de conservación para estudiar cómo varía la predicción según el contexto evolutivo.
- Investigación en genómica comparada: emplear el condicionamiento multiespecie para analizar el efecto de sustituciones en posiciones con distinto grado de conservación entre especies.
- Evaluación metodológica: usar el checkpoint como referencia en estudios que comparen estrategias de selección de ventanas de entrenamiento (top-5 % frente a top-20 %).
- Generación de características para modelos downstream: integrar los LLR calibrados como features en pipelines de machine learning genómico que requieran señales evolutivas densas por posición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica únicamente que la selección del checkpoint no utilizó etiquetas de benchmarks de efecto de variante y que la validación se realizó en cromosoma 21; no se proporcionan métricas numéricas comparativas.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 25,9 M de parámetros en fp32 (aproximadamente 104 MB de pesos); la VRAM adicional depende del tamaño de lote y de las ventanas de alineación cargadas desde los almacenes zarr.
- GPU recomendadas: cualquier GPU CUDA con al menos unos pocos GB libres es suficiente; no se especifican modelos concretos en la información disponible.
- Cabe en GPU de consumo: sí, por el reducido tamaño de parámetros; el cuello de botella es la memoria para los almacenes de alineación, no los pesos.
- Despliegue: el release proporciona un wrapper propio (`top20.py`) con carga vía `load_model`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la inferencia original de benchmark usó forwards compilados en FP16, mientras que el helper usa inferencia eager, con posibles diferencias numéricas pequeñas según dispositivo y precisión.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| GPN-Star M447 25M top-20 (este) | 25,9 M | 256 pb, paso 128 | MIT | Hugging Face (experimental) | Reentrenamiento con ventanas top-20 % |
| GPN-Star M447 25M (original top-5 %) | 25,9 M aprox. | 256 pb, paso 128 | MIT | Hugging Face | Checkpoint publicado de referencia; calibración distinta |
| Otros predictores de efecto de variante | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Modelo experimental: no sustituye al checkpoint original publicado y no debe tratarse como versión estable.
- Requiere la alineación hg38 M447 original en orden 243-then-204 con humano en columna 0; sustituirla por otra alineación de 447 especies no es válido.
- La alineación no se incluye en el repositorio; hay que obtenerla por separado desde los recursos GPN.
- Solo se valida inferencia de SNVs; no hay receta de fine-tuning ni puntuador de indels.
- Exige ventana de referencia completa de 256 pb y un pentanucleótido central A/C/G/T.
- La tabla de calibración es específica de estos pesos y no debe sustituirse por la del modelo top-5 % ni aplicarse dos veces.
- No se incluye el checkpoint final de 150.000 pasos, solo el de 145.000.
- Riesgo de sesgos y alucinación no documentado en la información disponible; al ser un modelo genómico, los errores se manifiestan como puntuaciones de compatibilidad evolutiva inexactas.
- No mezclar los ficheros `legacy_gpn/` con el paquete `gpn` refactorizado en el mismo proceso.
- La calibración es postprocesamiento y no mejora necesariamente todas las tareas ni convenciones de puntuación.
- Uso comercial permitido por licencia MIT, pero sin garantías de validez clínica; no apto para diagnóstico sin validación independiente.

## Enlaces

- Hugging Face: https://huggingface.co/songlab/gpn-star-hg38-m447-25m-top20
- Checkpoint original top-5 %: https://huggingface.co/songlab/gpn-star-hg38-m447-25m
- Recursos GPN (datos y código): https://github.com/songlab-cal/gpn

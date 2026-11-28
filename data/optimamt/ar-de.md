# OptimaMT/ar-de

## Resumen

OptimaMT/ar-de es un modelo de traducción automática árabe-alemán derivado de Helsinki-NLP/opus-mt-ar-de, publicado por OptimaMT como una exportación ONNX optimizada para su uso con transformers.js y ONNX Runtime. No se trata de un modelo entrenado desde cero, sino de una copia directa de los pesos originales de OPUS-MT (Universidad de Helsinki) con un decodificador fusionado reconstruido y una proyección de salida reorganizada a nivel de grafo, lo que permite reducir el consumo de memoria sin alterar los tokens generados.

El modelo emplea la arquitectura Marian, un transformer encoder-decoder seq2seq orientado a traducción, con un vocabulario de 63.079 tokens y un tamaño de repositorio de 0,1 GB. Su relevancia actual radica en que facilita el despliegue de traducción árabe-alemán en entornos con recursos limitados, incluyendo navegador y CPU, manteniendo traducciones idénticas a las del modelo original. Está integrado en producción en la aplicación de escritorio OpenCircle.

La ficha se centra en las características verificables del artefacto publicado: exportación ONNX cuantizada, licencia CC BY 4.0 heredada de OPUS-MT y resultados de evaluación en FLORES-200 devtest con BLEU 17,43 y chrF 47,48 en decodificación greedy.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder seq2seq) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado (q8 en transformers.js); decoder_model_merged_quantized.onnx |
| Idiomas soportados | arabe (ar), aleman (de) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (transformers.js); tokenizer en formato Xenova |
| Vocabulario | 63.079 tokens |
| Tamano del repositorio | 0,1 GB |
| Modelo base | Helsinki-NLP/opus-mt-ar-de (revision 8e6cbcce68fe) |
| Runtime evaluado | ONNX Runtime 1.31.1, CPU, 4 hilos |

## Arquitectura y entrenamiento

El modelo es una exportación ONNX de Helsinki-NLP/opus-mt-ar-de, que a su vez es un modelo Marian entrenado por el grupo Language Technology de la Universidad de Helsinki dentro del proyecto OPUS-MT. Marian es una arquitectura transformer encoder-decoder diseñada especificamente para traducción automática neuronal, con atención multi-cabeza estándar y decodificación autoregresiva. No se dispone de información sobre el número exacto de parámetros, la composición del corpus de entrenamiento ni el volumen de tokens utilizados, más allá de que procede del pipeline OPUS-MT.

La innovación técnica del artefacto de OptimaMT no está en el entrenamiento sino en la exportación: se ha reconstruido `onnx/decoder_model_merged_quantized.onnx` y se ha movido la proyección de salida del decodificador fuera de sus dos ramas (cambio exclusivamente de grafo). Con la opción `disable_quant_qdq = 1` de ONNX Runtime se obtiene el llamado modo rápido, con una aceleración de 2,3 a 2,5 veces y aproximadamente la mitad de memoria, manteniendo tokens idénticos a los del modelo original. El resto de archivos (tokenizer.json, special_tokens_map.json, tokenizer_config.json) se han escrito en el layout de Xenova; los demás ficheros son los originales byte a byte.

## Capacidades

- Traducción automática de árabe a alemán, en una única dirección (no inversa).
- Generación de texto seq2seq mediante pipeline `translation` de transformers.js.
- Ejecución en navegador y en CPU mediante ONNX Runtime con cuantización q8.
- Inferencia con modo rápido de ONNX Runtime (`disable_quant_qdq = 1`) con menor huella de memoria.
- Compatibilidad con el ecosistema transformers.js (`@huggingface/transformers`).
- Compatibilidad con scripts Python basados en onnxruntime, sentencepiece y numpy.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Traducción de pantalla en escritorio: la aplicación OpenCircle para Windows y Linux integra estos modelos desde la versión v0.1.4 para traducir texto en pantalla del árabe al alemán, aprovechando la reducción de memoria (de 530 a 283 MiB en Linux y de 506 a 259 MiB en Windows con `disable_quant_qdq = 1`).
- Traducción en el navegador sin backend: al ser una exportación ONNX compatible con transformers.js, puede ejecutarse del lado del cliente en aplicaciones web que necesiten traducir contenido árabe a alemán sin enviar datos a un servidor.
- Procesamiento por lotes en CPU: el script `translate.py` permite traducir ficheros o cadenas desde línea de comandos usando onnxruntime, adecuado para pipelines de localización de documentación en servidores sin GPU.
- Traducción de contenido editorial y noticias: el modelo está evaluado en FLORES-200 devtest (1.012 frases), un conjunto multilingüe de dominio periodístico, lo que lo hace apropiado para traducir textos informativos del árabe al alemán.
- Integración en aplicaciones de accesibilidad: subtitulado o lectura asistida de interfaces en árabe para usuarios germanohablantes, con baja latencia en CPU y consumo de memoria contenido.
- Prototipado rápido de sistemas de traducción: al ocupar 0,1 GB y requerir solo ONNX Runtime, sirve como componente base en pruebas de concepto de traducción árabe-alemán antes de escalar a modelos mayores.
- Preprocesamiento multilingüe en pipelines de datos: traducción de corpus árabes a alemán para su posterior análisis, indexación o entrenamiento de otros sistemas.

## Benchmarks y rendimiento

Evaluación publicada por el autor en FLORES-200 devtest (1.012 frases), decodificación greedy, ONNX Runtime 1.31.1 en CPU con 4 hilos:

| Metrica | Valor |
|---|---|
| BLEU | 17,43 |
| chrF | 47,48 |
| Tokens idénticos al original | si |

| Memoria tras carga | Linux | Windows |
|---|---:|---:|
| `disable_quant_qdq = 1` | 530 → 283 MiB (-47 %) | 506 → 259 MiB (-49 %) |
| Valores por defecto de ONNX Runtime | 283 → 221 MiB (-22 %) | 199 → 167 MiB (-16 %) |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para ejecución en CPU; el modelo pesa 0,1 GB en disco y consume entre 167 y 283 MiB de memoria tras la carga según configuración y plataforma.
- GPU recomendadas: no se documentan; el modelo está evaluado en CPU. Cualquier GPU compatible con ONNX Runtime podría ejecutarlo, pero no hay datos de rendimiento en GPU.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU; el caso de uso documentado es CPU con 4 hilos.
- Opciones de despliegue: transformers.js (`@huggingface/transformers`), ONNX Runtime (Python mediante onnxruntime, sentencepiece y numpy), y cualquier runtime compatible con ONNX.
- Latencia y throughput: no se publican cifras absolutas de latencia o throughput; solo el factor de aceleración de 2,3 a 2,5 veces con `disable_quant_qdq = 1` respecto a la configuración por defecto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OptimaMT/ar-de | no disponible | no disponible | ar → de | CC BY 4.0 | ONNX (transformers.js) | Exportación optimizada, BLEU 17,43 en FLORES-200 devtest |
| Helsinki-NLP/opus-mt-ar-de | no disponible | no disponible | ar → de | CC BY 4.0 | safetensors / PyTorch | Modelo original del que deriva; mismos pesos y tokens |
| Exportaciones Xenova de OPUS-MT | no disponible | no disponible | multiples pares | CC BY 4.0 | ONNX | Mismo layout de tokenizer; OptimaMT declara menor memoria y mayor velocidad |

No se dispone de datos de benchmarks de los modelos comparados en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa de calidad más allá de la identidad de tokens con el modelo original.

## Limitaciones y advertencias

- Modelo unidireccional: solo traduce de árabe a alemán; no soporta la dirección inversa ni otros pares.
- Calidad limitada: BLEU 17,43 y chrF 47,48 en FLORES-200 devtest indican un rendimiento moderado; no es adecuado para traducción de alta exigencia sin revisión humana.
- Riesgo de alucinación y errores de traducción en dominios especializados, terminología técnica o textos con ambigüedad.
- No se documentan sesgos específicos, pero al derivar de OPUS-MT hereda las limitaciones y sesgos de los corpus paralelos utilizados en su entrenamiento.
- Longitud de contexto no documentada; textos largos pueden requerir segmentación manual.
- Sin soporte documentado de tool calling, agentes ni razonamiento multi-paso.
- Licencia CC BY 4.0: permite uso comercial con atribución; es obligatorio citar a los autores originales (Universidad de Helsinki, OPUS-MT) y a OptimaMT por la exportación.
- El rendimiento medido corresponde a CPU con 4 hilos; no hay garantías de latencia en otros entornos.
- La fecha de creación del repositorio (2026-11-09) y la revisión del modelo base deben verificarse antes de fijar dependencias en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/ar-de
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-ar-de
- Repositorio OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Informe técnico (REPORT.md): https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traducción en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
- Colección de los 51 pares: https://huggingface.co/collections/OptimaMT/optimamt-lighter-opus-mt-onnx-models-6af228dc9cd91f015e56e869
- Aplicación OpenCircle: https://github.com/AmerAlreyahi/OpenCircle

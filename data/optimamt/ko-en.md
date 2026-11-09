# OptimaMT/ko-en

## Resumen

OptimaMT/ko-en es un modelo de traducción automática neuronal para el par de idiomas coreano → inglés, distribuido en formato ONNX y pensado para ejecutarse en el navegador o en entornos ligeros mediante Transformers.js. No es un modelo entrenado desde cero: se trata de una copia derivada de Xenova/opus-mt-ko-en (revisión `d9fa1ac60082`), que a su vez es la exportación ONNX del modelo original Helsinki-NLP/opus-mt-ko-en, parte de la familia OPUS-MT de la Universidad de Helsinki. La aportación de OptimaMT consiste en una modificación del grafo del decodificador fusionado para reducir el consumo de memoria en tiempo de ejecución sin alterar los pesos ni los tokens generados.

El modelo emplea la arquitectura Marian (transformer encoder-decoder de tipo seq2seq) con un vocabulario de 65.001 tokens y una licencia CC BY 4.0 que permite uso comercial con atribución. Su relevancia actual radica en que ofrece traducción coreano-inglés con una huella de memoria notablemente inferior a la del export original: según la model card, el consumo tras la carga baja de 545 a 291 MiB en Linux (−47 %) y de 520 a 265 MiB en Windows (−49 %) cuando se activa `disable_quant_qdq = 1`, manteniendo tokens de salida idénticos.

El repositorio ocupa aproximadamente 0,1 GB y solo se reconstruye el archivo `onnx/decoder_model_merged_quantized.onnx`; el resto de ficheros son idénticos byte a byte al export de Xenova. Está publicado bajo el colectivo OptimaMT, que cubre 49 pares de idiomas con el esquema de nombres `OptimaMT/<src>-<tgt>`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder seq2seq) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado (q8 en el ejemplo de uso); decoder fusionado cuantizado |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`decoder_model_merged_quantized.onnx` y resto de ficheros del export) |
| Vocabulario | 65.001 tokens |
| Tamano del repositorio | ~0,1 GB |
| Libreria | transformers.js (compatible con onnxruntime en Python) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Marian, un transformer encoder-decoder clásico para traducción automática, heredado íntegramente de Helsinki-NLP/opus-mt-ko-en. No hay información en la documentación proporcionada sobre el número de tokens de entrenamiento, la composición del corpus ni si se aplicaron técnicas de RLHF o DPO; estos detalles corresponden al modelo original de OPUS-MT y no se detallan en la model card de OptimaMT.

La innovación técnica concreta de esta ficha es una modificación de grafo: la proyección de salida del decodificador se ha sacado de sus dos ramas (decoder con y sin caché), lo que reduce el consumo de memoria tras la carga sin cambiar los pesos. Los resultados reportados se midieron con ONNX Runtime 1.31.1 en CPU con 4 hilos (Linux nativo, Windows en máquina virtual): 545 → 291 MiB con `disable_quant_qdq = 1` y 291 → 228 MiB con los valores por defecto de ONNX Runtime en Linux, con tokens de salida idénticos verificados.

## Capacidades

- Traducción automática coreano → inglés, tarea única del pipeline `translation`.
- Generación de texto seq2seq con decodificación autorregresiva y caché de decodificador fusionada.
- Ejecución en navegador mediante Transformers.js y en Python mediante onnxruntime, sentencepiece y numpy.
- Cuantización q8 para reducir memoria en inferencia.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni modo de agentes.
- No tiene capacidades de visión, audio ni thinking mode.
- Multilingüismo limitado estrictamente al par ko → en (no traduce a otros idiomas destino).

## Casos de uso

- Traducción de documentación técnica coreana a inglés en pipelines de localización: el modelo acepta texto plano y devuelve la traducción, integrándose en scripts batch de preprocesado sin necesidad de GPU.
- Traducción en el navegador de contenido generado por usuarios: al ejecutarse con Transformers.js y cuantización q8, permite traducir comentarios o mensajes coreanos del lado del cliente sin enviar datos a un servidor.
- Subtitulado y transcripción multilingüe: combinado con un ASR coreano, se puede usar para generar subtítulos en inglés de vídeos o reuniones, con una huella de memoria inferior a 300 MiB.
- Atención al cliente en mercados coreanos: traducción de tickets y conversaciones entrantes al inglés para que el equipo de soporte las procese, con despliegue en contenedores ligeros.
- Investigación en traducción automática de bajo recursos: sirve como línea base reproducible para comparar exportaciones ONNX y técnicas de reducción de memoria en Marian.
- Aplicaciones de escritorio y extensiones: al caber en memoria de un proceso ligero, se puede embeber en herramientas de escritorio para traducción puntual sin conexión.
- Preprocesado de corpus para entrenamiento: traducción masiva de textos coreanos a inglés como paso previo a la anotación o al filtrado de datasets.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (BLEU, MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card solo reporta métricas de memoria y verificación de tokens idénticos:

| Metrica | Linux | Windows |
|---|---:|---:|
| Memoria tras carga, `disable_quant_qdq = 1` | 545 → 291 MiB (−47 %) | 520 → 265 MiB (−49 %) |
| Memoria tras carga, valores por defecto de ONNX Runtime | 291 → 228 MiB (−22 %) | 200 → 169 MiB (−16 %) |
| Tokens de salida idénticos al original | sí | sí |

Medición con ONNX Runtime 1.31.1, CPU, 4 hilos.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso medido (ejecución en CPU); el consumo de memoria del proceso ronda los 169–291 MiB tras la carga según plataforma y configuración.
- GPU recomendadas: no se especifican; el modelo está optimizado para CPU y para ejecución en navegador.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU, dado su tamaño de repositorio de ~0,1 GB.
- Opciones de despliegue: Transformers.js (`@huggingface/transformers`), onnxruntime en Python con sentencepiece y numpy, y el script `translate.py` del repositorio OptimaMT.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OptimaMT/ko-en | no disponible | no disponible | ko → en | CC BY 4.0 | ONNX cuantizado | Decoder fusionado con menor memoria |
| Xenova/opus-mt-ko-en | no disponible | no disponible | ko → en | CC BY 4.0 | ONNX | Export original; mayor consumo de memoria |
| Helsinki-NLP/opus-mt-ko-en | no disponible | no disponible | ko → en | CC BY 4.0 | PyTorch/safetensors | Modelo original de OPUS-MT |

La comparativa se limita a la cadena de derivación del propio modelo, ya que la información disponible no incluye datos de rendimiento de traducción que permitan contrastarlo con alternativas de otros autores.

## Limitaciones y advertencias

- Solo traduce de coreano a inglés; no soporta la dirección inversa ni otros pares de idiomas.
- No hay datos publicados de calidad de traducción (BLEU u otras métricas) en la información disponible, por lo que el rendimiento lingüístico no está verificado de forma independiente.
- Al ser una copia derivada, hereda los sesgos y limitaciones del corpus OPUS-MT original, no documentados en esta model card.
- Riesgo de alucinación y de traducciones incorrectas en dominios especializados (técnico, legal, médico) no cubiertos por el entrenamiento original.
- Longitud de contexto no documentada; textos largos pueden requerir segmentación manual.
- La licencia CC BY 4.0 permite uso comercial, pero exige atribución a los autores originales (Universidad de Helsinki, export de Xenova y modificación de OptimaMT).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- Solo se ha reconstruido el decodificador fusionado cuantizado; el resto de ficheros debe tratarse como el export original sin cambios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/ko-en
- Repositorio OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Informe del método: https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traducción en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
- Modelo base ONNX: https://huggingface.co/Xenova/opus-mt-ko-en
- Modelo original OPUS-MT: https://huggingface.co/Helsinki-NLP/opus-mt-ko-en

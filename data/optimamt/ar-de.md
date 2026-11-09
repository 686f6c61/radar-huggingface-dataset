# OptimaMT/ar-de

## Resumen

OptimaMT/ar-de es un modelo de traducción automática neuronal para el par árabe-alemán, publicado por el proyecto OptimaMT. No es un modelo entrenado desde cero: se trata de una reexportación en ONNX del modelo Helsinki-NLP/opus-mt-ar-de (revisión `8e6cbcce68fe`), desarrollado por el grupo Language Technology de la Universidad de Helsinki dentro del ecosistema OPUS-MT. La aportación del autor es una reorganización del grafo del decodificador que reduce el consumo de memoria en tiempo de carga e inferencia sin alterar los pesos ni la tokenización.

El modelo emplea la arquitectura Marian (transformer encoder-decoder de tipo seq2seq), la base estándar de la familia OPUS-MT, y está empaquetado para ejecutarse con transformers.js y ONNX Runtime, lo que permite traducir en el navegador o en Node.js sin necesidad de backend Python. El repositorio ocupa aproximadamente 0,1 GB y el vocabulario del tokenizador SentencePiece contiene 63.079 tokens.

Su relevancia es práctica: ofrece una alternativa más ligera en memoria a las exportaciones ONNX convencionales (estilo Xenova) manteniendo una salida idéntica token a token, lo que lo hace atractivo para despliegues en cliente, entornos con recursos limitados o pipelines de traducción de bajo coste donde el par árabe-alemán es necesario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder seq2seq) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado (q8 en el ejemplo de uso); decodificador fusionado con cuantización QDQ configurable |
| Idiomas soportados | árabe (ar) y alemán (de) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`decoder_model_merged_quantized.onnx`), tokenizador SentencePiece en formato JSON |

## Arquitectura y entrenamiento

El modelo subyacente es Helsinki-NLP/opus-mt-ar-de, un transformer encoder-decoder de la familia Marian entrenado por la Universidad de Helsinki sobre datos paralelos del corpus OPUS. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO; estos datos corresponden a la model card original de OPUS-MT, no incluida aquí.

La innovación de esta versión concreta es puramente de ingeniería de grafo: la proyección de salida del decodificador se ha extraído de sus dos ramas (cambio de grafo únicamente, sin tocar pesos), y se ha reconstruido el archivo `onnx/decoder_model_merged_quantized.onnx`. Según el autor, esto reduce la memoria tras la carga de 530 a 283 MiB en Linux (-47 %) con `disable_quant_qdq = 1`, y de 283 a 221 MiB (-22 %) con los valores por defecto de ONNX Runtime; en Windows, de 506 a 259 MiB (-49 %) y de 199 a 167 MiB (-16 %) respectivamente. En todos los casos la secuencia de tokens generada es idéntica. El resto de archivos (tokenizer.json, special_tokens_map.json, tokenizer_config.json) se reescribieron en el formato de las exportaciones Xenova; los demás ficheros son los originales byte a byte.

## Capacidades

- Traducción de texto árabe a alemán, tarea única del modelo (pipeline `translation`).
- Generación seq2seq estándar con tokenizador SentencePiece de 63.079 tokens.
- Ejecución en navegador y en Node.js mediante transformers.js con backend ONNX Runtime.
- Ejecución en Python mediante onnxruntime, sentencepiece y numpy (script `translate.py` del repositorio del proyecto).
- Cuantización q8 con opción de desactivar QDQ para reducir memoria adicional.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Cobertura multilingüe limitada estrictamente al par ar-de; no se documentan capacidades de traducción inversa ni a terceros idiomas.

## Casos de uso

- Traducción en el navegador sin backend: integrado con transformers.js, el modelo permite traducir texto árabe a alemán en el cliente (por ejemplo, en una extensión o aplicación web), evitando enviar contenido a un servidor y aprovechando el bajo consumo de memoria de la versión fusionada.
- Traducción de documentación y contenido editorial: útil para localizar materiales árabes al alemán en flujos de publicación, con revisión humana posterior dada la naturaleza estadística del modelo.
- Preprocesado en pipelines de NLP multilingüe: traducir entradas árabes al alemán antes de pasarlas a modelos o herramientas que solo operan en alemán (análisis de sentimiento, clasificación, búsqueda).
- Atención al cliente en entornos embebidos: traducción de mensajes de usuario en aplicaciones de escritorio o móviles con recursos limitados, donde el ahorro de memoria de esta exportación (hasta un 47-49 % con `disable_quant_qdq`) resulta determinante.
- Traducción por lotes de bajo coste en CPU: el modelo corre en ONNX Runtime con 4 hilos en CPU, lo que permite procesar volúmenes moderados de texto sin GPU.
- Investigación y evaluación de traducción automática: al ser una réplica fiel de OPUS-MT con salida idéntica, sirve como referencia reproducible para comparar exportaciones ONNX y técnicas de reducción de memoria.
- Prototipado rápido de aplicaciones de traducción: el script `translate.py` y el ejemplo en JavaScript permiten tener una demo funcional en minutos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas de memoria tras la carga (530 → 283 MiB en Linux y 506 → 259 MiB en Windows con `disable_quant_qdq = 1`; 283 → 221 MiB y 199 → 167 MiB con los valores por defecto de ONNX Runtime) y confirma la identidad token a token de la salida respecto a la exportación original. No hay datos de BLEU, METEOR, COMET ni latencia o throughput.

## Requisitos de hardware

- VRAM estimada: el modelo está pensado para CPU; con cuantización q8 y decodificador fusionado, la memoria tras la carga es de aproximadamente 167-283 MiB según plataforma y configuración de QDQ.
- GPU recomendadas: no se especifican; el modelo puede ejecutarse en cualquier GPU compatible con ONNX Runtime, pero su tamaño no requiere una GPU dedicada.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU; el caso de uso documentado es CPU con 4 hilos.
- Opciones de despliegue: transformers.js (JavaScript/TypeScript), ONNX Runtime (Python vía `translate.py`), y cualquier runtime compatible con ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OptimaMT/ar-de | no disponible | no disponible | ar → de | CC BY 4.0 | ONNX (transformers.js) | Decodificador fusionado, salida idéntica a OPUS-MT, menor memoria |
| Helsinki-NLP/opus-mt-ar-de | no disponible | no disponible | ar → de | CC BY 4.0 | PyTorch / safetensors (modelo original) | Modelo base; requiere framework Python para inferencia |
| Exportaciones Xenova de OPUS-MT | no disponible | no disponible | según par | CC BY 4.0 | ONNX | Mismo layout que esta exportación; mayor consumo de memoria según el autor |
| Otros pares OptimaMT | no disponible | no disponible | 49 pares | CC BY 4.0 | ONNX | Mismo enfoque de exportación ligera para otros pares de idiomas |

No se dispone de datos de rendimiento (BLEU u otras métricas) para establecer comparaciones cuantitativas de calidad entre estas alternativas.

## Limitaciones y advertencias

- Modelo de traducción de un solo par (árabe → alemán); no traduce en sentido inverso ni a otros idiomas.
- Al ser una reexportación de OPUS-MT, hereda los sesgos y errores del corpus OPUS y del entrenamiento original, no documentados en la información disponible.
- Riesgo de alucinación y de traducciones inexactas en dominios especializados, textos con jerga, dialectos árabes o alemán técnico; se recomienda revisión humana en producción.
- Longitud de contexto no documentada; los modelos Marian suelen estar limitados a secuencias relativamente cortas, por lo que textos largos deben segmentarse.
- La licencia CC BY 4.0 permite uso comercial con atribución; es obligatorio citar a la Universidad de Helsinki (OPUS-MT) y al proyecto OptimaMT.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria de su comportamiento en producción.
- El rendimiento de memoria reportado se midió con ONNX Runtime 1.31.1 en CPU con 4 hilos (Windows en una máquina virtual); los valores pueden variar en otros entornos.
- No apto para tareas generativas generales, razonamiento, código o agentes; su única función es la traducción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/ar-de
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-ar-de
- Repositorio del proyecto OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Informe metodológico: https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traducción en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results

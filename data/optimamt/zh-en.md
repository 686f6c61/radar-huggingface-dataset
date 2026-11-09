# OptimaMT/zh-en

## Resumen

OptimaMT/zh-en es un modelo de traducción automática chino-inglés derivado de Xenova/opus-mt-zh-en, que a su vez es la exportación a ONNX del modelo OPUS-MT desarrollado por el grupo Language Technology de la Universidad de Helsinki. La aportación de OptimaMT no es un nuevo entrenamiento, sino una optimización del grafo ONNX del decodificador: se reconstruye únicamente `onnx/decoder_model_merged_quantized.onnx` moviendo la proyección de salida fuera de sus dos ramas, mientras el resto de ficheros se mantiene byte a byte idéntico al original.

El modelo resuelve traducción unidireccional de chino a inglés en entornos de inferencia ligera, especialmente en el navegador mediante transformers.js y ONNX Runtime. Su relevancia radica en la reducción de memoria tras la carga: según la model card, con `disable_quant_qdq = 1` el consumo pasa de 544 a 290 MiB en Linux (-47 %) y de 518 a 266 MiB en Windows (-49 %), manteniendo tokens de salida idénticos. Con los valores por defecto de ONNX Runtime la reducción es menor: de 290 a 226 MiB en Linux (-22 %) y de 202 a 171 MiB en Windows (-16 %).

Arquitectónicamente es un transformer encoder-decoder estilo Marian (familia OPUS-MT), con un vocabulario de 65.001 tokens y licencia CC BY 4.0. El repositorio ocupa 0,1 GB y está pensado como reemplazo directo ("drop-in") del modelo base sin cambios en la API ni en los resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, familia OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX quantized (q8 en el ejemplo de uso); el repo incluye `decoder_model_merged_quantized.onnx` |
| Idiomas soportados | chino (zh) → inglés (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (transformers.js); sin safetensors ni GGUF en el repo |
| Vocabulario | 65.001 tokens |
| Tamano del repositorio | 0,1 GB |
| Modelo base | Xenova/opus-mt-zh-en (revision `39d480d52a9e`) |
| Runtime de referencia | ONNX Runtime 1.31.1, CPU, 4 hilos |

## Arquitectura y entrenamiento

Se trata de un transformer encoder-decoder de traducción, correspondiente a la familia Marian/OPUS-MT de la Universidad de Helsinki. El modelo original fue entrenado por el grupo de investigación de Helsinki para traducción automática neuronal; la model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO, por lo que esos datos deben considerarse no disponibles en la información proporcionada.

La innovación técnica de esta variante es exclusivamente de grafo: se ha reconstruido el decodificador ONNX merged moviendo la proyección de salida fuera de sus dos ramas, sin tocar los pesos. El resultado es una reducción de memoria tras la carga con tokens de salida idénticos, verificada en Linux y Windows (Windows en máquina virtual) con ONNX Runtime 1.31.1 en CPU y 4 hilos. Solo se reconstruye `onnx/decoder_model_merged_quantized.onnx`; el resto de ficheros son idénticos al export original de Xenova.

## Capacidades

- Traducción de texto chino a inglés, unidireccional.
- Generación de texto secuencia a secuencia (`text2text-generation`) con pipeline `translation`.
- Ejecución en navegador y en Node.js mediante transformers.js y ONNX Runtime.
- Ejecución en Python con onnxruntime, sentencepiece y numpy (script `translate.py` del repositorio del proyecto).
- Inferencia en CPU con requisitos de memoria reducidos respecto al modelo base.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al par zh→en; no cubre otras direcciones.

## Casos de uso

- Traducción en el navegador sin backend: integrado con transformers.js, el modelo permite traducir texto chino a inglés directamente en el cliente, con una huella de memoria de 226-290 MiB tras la carga según plataforma y configuración, lo que lo hace viable en pestañas de navegador de escritorio.
- Traducción de contenidos web en tiempo real: útil para extensiones o widgets que traduzcan titulares, comentarios o descripciones de producto del chino al inglés sin enviar el texto a un servidor.
- Preprocesado de corpus para pipelines de NLP: traducción por lotes de documentos chinos a inglés antes de tareas posteriores (búsqueda, clasificación, resumen) en entornos con recursos limitados.
- Asistentes de atención al cliente bilingües: traducción de consultas de usuarios chinos a inglés para que un sistema posterior en inglés las procese, aprovechando la ejecución local y la reducción de memoria.
- Herramientas de escritorio y aplicaciones Electron: al ejecutarse con ONNX Runtime en CPU y con un consumo moderado, encaja en aplicaciones de escritorio que necesitan traducción offline.
- Entornos con restricciones de memoria: despliegues en contenedores pequeños, dispositivos edge o funciones serverless con límites estrictos de RAM, donde la reducción del 47-49 % respecto al original es determinante.
- Prototipado rápido de sistemas de traducción: al ser un reemplazo directo de Xenova/opus-mt-zh-en con la misma API, permite sustituir el modelo base sin cambios de código para ganar margen de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de traducción (BLEU, COMET, MMLU, etc.) en la información disponible. La model card únicamente reporta métricas de memoria tras la carga y la equivalencia de tokens de salida:

| Metrica | Linux | Windows | Tokens identicos |
|---|---:|---:|---|
| Memoria con `disable_quant_qdq = 1` | 544 → 290 MiB (-47 %) | 518 → 266 MiB (-49 %) | si |
| Memoria con valores por defecto de ONNX Runtime | 290 → 226 MiB (-22 %) | 202 → 171 MiB (-16 %) | si |

Medición con ONNX Runtime 1.31.1, CPU, 4 hilos (Windows en máquina virtual). No se proporcionan datos de latencia ni de throughput.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 171-290 MiB tras la carga según plataforma y configuración de `disable_quant_qdq`; el repositorio completo ocupa 0,1 GB en disco.
- GPU recomendadas: no se especifican; las mediciones publicadas son en CPU con ONNX Runtime 1.31.1 y 4 hilos.
- Compatibilidad con GPU de consumo: no se documenta explícitamente, pero el tamaño del modelo permite ejecución en CPU, por lo que cualquier GPU de consumo con soporte de ONNX Runtime es, en principio, sobrada; no hay cifras publicadas.
- Opciones de despliegue: transformers.js (navegador y Node.js), ONNX Runtime en Python (onnxruntime + sentencepiece + numpy) y cualquier runtime compatible con ONNX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OptimaMT/zh-en | no disponible | no disponible | zh → en | CC BY 4.0 | ONNX | Decodificador merged optimizado; -47/-49 % de memoria con `disable_quant_qdq = 1` |
| Xenova/opus-mt-zh-en | no disponible | no disponible | zh → en | CC BY 4.0 | ONNX | Export original del que deriva; misma calidad y tokens, mayor memoria |
| Helsinki-NLP/opus-mt-zh-en | no disponible | no disponible | zh → en | CC BY 4.0 | PyTorch (safetensors) | Modelo OPUS-MT original en formato PyTorch; no ejecutable directamente en transformers.js |
| Otros modelos Marian/OPUS-MT por par de idiomas | no disponible | no disponible | pares específicos | CC BY 4.0 | ONNX / PyTorch | Misma familia; no comparables en calidad sin benchmarks publicados |

## Limitaciones y advertencias

- Traducción unidireccional: solo chino → inglés; no traduce en sentido inverso ni entre otros pares.
- Sin benchmarks de calidad publicados: no hay evidencia en la información disponible sobre BLEU, COMET u otras métricas frente al modelo base u otras alternativas.
- Riesgo de alucinación y errores de traducción inherente a los modelos Marian/OPUS-MT, especialmente en frases largas, dominios especializados o texto con jerga; no se documentan evaluaciones específicas.
- Sesgos: no se documenta ningún análisis de sesgos en la model card; al derivar de OPUS-MT, hereda las características y limitaciones de sus datos de entrenamiento, no detallados.
- Longitud de contexto no especificada: no se indica el máximo de tokens de entrada, lo que complica dimensionar el truncado en producción.
- Dependencia de la configuración del runtime: la mayor reducción de memoria (-47/-49 %) requiere `disable_quant_qdq = 1`; con los valores por defecto de ONNX Runtime la mejora baja al -22/-16 %.
- Licencia CC BY 4.0: permite uso comercial con atribución; es necesario citar a los autores originales (Universidad de Helsinki, OPUS-MT) y a Xenova por la exportación ONNX.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación muy limitado; conviene verificar los tokens de salida contra el modelo base antes de adoptarlo en producción.
- Solo se reconstruye el decodificador merged cuantizado; si se necesita otra variante (por ejemplo, no cuantizada), no está cubierta por esta optimización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/zh-en
- Modelo base en Hugging Face: https://huggingface.co/Xenova/opus-mt-zh-en
- Modelo OPUS-MT original: https://huggingface.co/Helsinki-NLP/opus-mt-zh-en
- Repositorio del proyecto OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Informe metodológico: https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traducción en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results

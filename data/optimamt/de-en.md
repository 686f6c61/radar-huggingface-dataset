# OptimaMT/de-en

## Resumen

OptimaMT/de-en es una conversión ONNX optimizada del modelo de traducción alemán-inglés Xenova/opus-mt-de-en, que a su vez deriva del OPUS-MT original desarrollado por el grupo Language Technology de la Universidad de Helsinki. El modelo resuelve la tarea de traducción automática neuronal unidireccional de alemán a inglés y está empaquetado específicamente para su uso con transformers.js y ONNX Runtime en entornos JavaScript/TypeScript, tanto en Node.js como en navegador.

La aportación principal de esta variante no es un reentrenamiento, sino una optimización de memoria en tiempo de inferencia: se ha reconstruido únicamente el fichero `onnx/decoder_model_merged_quantized.onnx` moviendo la proyección de salida del decodificador fuera de sus dos ramas (un cambio exclusivamente de grafo), manteniendo el resto de ficheros byte a byte idénticos al original. Según la model card, esto reduce el consumo de memoria tras la carga entre un 46 % y un 48 % en Linux y Windows con `disable_quant_qdq = 1`, y entre un 17 % y un 21 % con los valores por defecto de ONNX Runtime, sin alterar los tokens generados.

El modelo forma parte de OptimaMT, una colección de 49 pares de traducción publicados bajo el patrón `OptimaMT/<src>-<tgt>`. Su relevancia actual radica en que ofrece traducción de calidad OPUS-MT con una huella de memoria notablemente menor, lo que facilita su despliegue en entornos con recursos limitados, aplicaciones web del lado del cliente o servicios serverless donde cada mebibyte cuenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (MarianMT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX quantized (q8 en transformers.js; fichero `decoder_model_merged_quantized.onnx`) |
| Idiomas soportados | aleman (de), ingles (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (transformers.js); repo de 0,1 GB |
| Vocabulario | 58.101 tokens |
| Modelo base | Xenova/opus-mt-de-en (revision `399dfd687067`) |
| Modelo original | Helsinki-NLP/opus-mt-de-en (OPUS-MT) |

## Arquitectura y entrenamiento

La arquitectura corresponde a MarianMT, un transformer encoder-decoder con atención estándar diseñado específicamente para traducción automática neuronal. El modelo original OPUS-MT de la Universidad de Helsinki fue entrenado sobre corpus paralelos del proyecto OPUS, aunque esta ficha no dispone de detalles sobre el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El vocabulario compartido entre origen y destino consta de 58.101 tokens, gestionado mediante SentencePiece.

La innovación técnica de esta variante es puramente de inferencia: la reconstrucción del decodificador fusionado cuantizado con la proyección de salida extraída de sus dos ramas. Este cambio de grafo reduce el uso de memoria sin modificar los pesos ni los tokens de salida, verificado mediante comparación de tokens idénticos en los escenarios medidos (ONNX Runtime 1.31.1, CPU, 4 hilos). No se documentan técnicas como decodificación especulativa, atención lineal ni modos de razonamiento extendido, dado que se trata de un modelo de traducción especializado.

## Capacidades

- Traducción automática unidireccional de alemán a inglés.
- Generación de texto seq2seq mediante pipeline `translation` de transformers.js.
- Ejecución en navegador y en Node.js gracias al formato ONNX y a la librería transformers.js.
- Inferencia en CPU con ONNX Runtime, sin requerir GPU.
- Compatibilidad con cuantización q8 y con la opción `disable_quant_qdq` para reducir memoria.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No dispone de capacidades multimodales (visión, audio) ni modo de pensamiento.
- Multilingüismo limitado estrictamente al par de-de/en.

## Casos de uso

- Traducción de documentación técnica en aplicaciones web: el modelo puede integrarse en el navegador mediante transformers.js para traducir textos de alemán a inglés del lado del cliente, sin enviar datos a un servidor, aprovechando su formato ONNX y su bajo consumo de memoria.
- Localización de interfaces de usuario en tiempo real: con una huella de memoria de 158-268 MiB tras la carga, es viable ejecutarlo en dispositivos con recursos limitados para traducir cadenas de UI o mensajes de ayuda de alemán a inglés.
- Preprocesamiento en pipelines de NLP: traducir corpus alemanes a inglés antes de aplicar modelos de análisis de sentimiento, clasificación o extracción de información entrenados principalmente en inglés.
- Servicios serverless y edge computing: la reducción de memoria del 46-48 % con `disable_quant_qdq = 1` facilita el despliegue en funciones con límites estrictos de RAM o en contenedores ligeros.
- Traducción de correos y comunicaciones internas: integrable en herramientas de productividad o clientes de correo para traducir mensajes de colegas germanoparlantes a inglés de forma automática.
- Prototipado rápido en JavaScript: al ser un drop-in replacement del modelo Xenova con la misma API, permite sustituir el original sin cambios de código para obtener la mejora de memoria en aplicaciones existentes.
- Investigación en eficiencia de inferencia: sirve como caso de estudio reproducible para medir el impacto del cambio de grafo en el consumo de memoria con ONNX Runtime en distintos sistemas operativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de traducción (BLEU, COMET, MMLU, etc.) en la información disponible. La model card únicamente reporta métricas de memoria tras la carga y verificación de tokens idénticos:

| Escenario | Linux (memoria tras carga) | Windows (memoria tras carga) | Tokens idénticos |
|---|---:|---:|---|
| `disable_quant_qdq = 1` | 495 → 268 MiB (-46 %) | 474 → 245 MiB (-48 %) | sí |
| Valores por defecto ONNX Runtime | 265 → 208 MiB (-21 %) | 190 → 158 MiB (-17 %) | sí |

Medido con ONNX Runtime 1.31.1, CPU, 4 hilos (Windows en máquina virtual).

## Requisitos de hardware

- VRAM estimada: no aplica para inferencia en CPU; el modelo está pensado para ejecución en CPU con ONNX Runtime.
- Memoria RAM tras la carga: 158-268 MiB según configuración y sistema operativo (ver tabla anterior).
- GPU recomendadas: no se especifican; el modelo está optimizado para CPU. Cualquier GPU compatible con ONNX Runtime podría usarse, pero no se documentan requisitos ni rendimiento en GPU.
- Cabe en cualquier GPU consumer y en la mayoría de dispositivos con más de 300 MiB de RAM disponible.
- Opciones de despliegue: transformers.js (navegador y Node.js), ONNX Runtime (Python mediante `translate.py` con onnxruntime, sentencepiece y numpy).
- Latencia y throughput: no disponibles en la información proporcionada.
- Tamaño del repositorio: 0,1 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OptimaMT/de-en | no disponible | no disponible | de, en | CC BY 4.0 | ONNX | Decodificador fusionado optimizado; -46/-48 % memoria con `disable_quant_qdq` |
| Xenova/opus-mt-de-en | no disponible | no disponible | de, en | CC BY 4.0 | ONNX | Modelo base del que deriva; misma calidad de traducción, mayor memoria |
| Helsinki-NLP/opus-mt-de-en | no disponible | no disponible | de, en | CC BY 4.0 | safetensors/PyTorch | OPUS-MT original; requiere framework Python |
| Otros pares OptimaMT | no disponible | no disponible | según par | CC BY 4.0 | ONNX | Misma metodología aplicada a 49 pares de traducción |

La comparativa se limita a variantes del mismo modelo original, ya que no se dispone de datos de benchmarks frente a alternativas de otros proveedores (por ejemplo, NLLB o M2M-100) en la información proporcionada.

## Limitaciones y advertencias

- Traducción unidireccional: solo admite alemán como origen e inglés como destino; no traduce en sentido inverso.
- Sesgos: al derivar de OPUS-MT entrenado sobre corpus OPUS, puede heredar sesgos de dominio y de género presentes en los datos paralelos originales; no se documentan análisis específicos.
- Riesgo de alucinación: como todo modelo seq2seq de traducción, puede generar traducciones fluidas pero incorrectas en frases ambiguas, terminología especializada o dominios poco representados.
- Longitud de contexto: no documentada; los modelos MarianMT suelen tener límites relativamente cortos, por lo que textos largos deben segmentarse.
- Licencia CC BY 4.0: permite uso comercial con atribución; es necesario citar a los autores originales (Universidad de Helsinki) y al exportador (Xenova) además del mantenedor de esta variante.
- El modelo solo ha sido validado con ONNX Runtime 1.31.1 en CPU con 4 hilos; el rendimiento en otras configuraciones puede variar.
- No es un modelo de propósito general: carece de tool calling, agentes, visión o razonamiento multi-paso, por lo que no debe emplearse fuera de tareas de traducción.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, lo que implica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/de-en
- Repositorio del proyecto OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Informe metodológico (REPORT.md): https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traducción en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Resultados interactivos (Space): https://huggingface.co/spaces/OptimaMT/results
- Modelo base ONNX: https://huggingface.co/Xenova/opus-mt-de-en
- Modelo OPUS-MT original: https://huggingface.co/Helsinki-NLP/opus-mt-de-en

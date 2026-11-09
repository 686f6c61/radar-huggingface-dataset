# OptimaMT/ru-en

## Resumen

OptimaMT/ru-en es un modelo de traducción automática ruso-inglés derivado de Xenova/opus-mt-ru-en, que a su vez es la exportación ONNX del modelo OPUS-MT de la Universidad de Helsinki. Lo desarrolla OptimaMT, un proyecto que publica 49 pares de traducción bajo el esquema `OptimaMT/<src>-<tgt>`. El modelo original se basa en la arquitectura Marian (transformer encoder-decoder), y esta variante mantiene exactamente los mismos pesos y tokenizador que su base: la única modificación es un cambio en el grafo ONNX del decodificador, donde la proyección de salida se ha movido fuera de sus dos ramas.

El problema que resuelve es concreto: reducir el consumo de memoria en inferencia sin alterar la salida. Según la model card, con `disable_quant_qdq = 1` el uso de memoria tras la carga baja de 527 a 282 MiB en Linux (-47 %) y de 502 a 259 MiB en Windows (-48 %), manteniendo tokens idénticos. Con los valores por defecto de ONNX Runtime la reducción es menor (-22 % en Linux, -15 % en Windows). Esto lo hace relevante para despliegues en navegador o en entornos con recursos limitados mediante transformers.js.

El modelo está pensado para ejecutarse con ONNX Runtime en CPU (los datos de la model card se midieron con ONNX Runtime 1.31.1, CPU y 4 hilos) y se distribuye en formato ONNX cuantizado, con un tamaño de repositorio de 0,1 GB. No es un modelo entrenado desde cero ni un ajuste fino: es una reempaquetado optimizado de un traductor existente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado (`decoder_model_merged_quantized.onnx`); dtype `q8` en transformers.js |
| Idiomas soportados | ruso (ru) → inglés (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (transformers.js); no se distribuyen safetensors ni GGUF en este repositorio |
| Vocabulario | 62.518 tokens |
| Tamano del repositorio | 0,1 GB |
| Modelo base | Xenova/opus-mt-ru-en (revision `afe8c6c738ec`) |
| Modelo original | Helsinki-NLP/opus-mt-ru-en |

## Arquitectura y entrenamiento

La arquitectura es Marian, un transformer encoder-decoder con atención estándar, heredada íntegramente de OPUS-MT (Universidad de Helsinki). No hay entrenamiento adicional ni ajuste fino por parte de OptimaMT: la model card indica explícitamente que solo se reconstruye `onnx/decoder_model_merged_quantized.onnx` y que el resto de archivos son los originales byte a byte. La innovación técnica es exclusivamente de grafo: la proyección de salida del decodificador se ha extraído de sus dos ramas, lo que permite un decodificador fusionado más ligero en memoria.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; estos datos corresponden al modelo OPUS-MT original y no se detallan en la información proporcionada. El tokenizador es SentencePiece con un vocabulario de 62.518 tokens, coherente con la familia OPUS-MT.

## Capacidades

- Traducción de texto ruso a inglés, tarea única del pipeline `translation`.
- Generación texto-a-texto (`text2text-generation`) en modalidad por lotes o interactiva.
- Ejecución en navegador y en Node.js mediante transformers.js con ONNX Runtime.
- Inferencia en CPU con bajo consumo de memoria (282 MiB en Linux con `disable_quant_qdq = 1`).
- Salida determinista respecto al modelo base: se garantiza tokens idénticos en las pruebas realizadas.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.
- Soporte multilingüe limitado al par ru→en; no traduce otras lenguas.

## Casos de uso

- Traducción de documentación técnica rusa a inglés en pipelines de CI: el modelo puede integrarse como paso de preprocesado en un flujo de build que traduzca READMEs o changelogs, con la ventaja de que el ONNX cuantizado cabe en memoria de un runner estándar.
- Traducción en el navegador sin backend: mediante transformers.js y `dtype: "q8"`, el modelo se ejecuta del lado del cliente para traducir contenido introducido por el usuario, evitando enviar texto a un servidor y reduciendo el consumo a unos 282 MiB.
- Atención al cliente con contenido ruso: traducción de mensajes entrantes en ruso a inglés antes de pasarlos a un clasificador o a un LLM mayor, aprovechando el bajo coste de memoria para desplegar muchas instancias en paralelo.
- Procesamiento por lotes de corpus: traducción de grandes volúmenes de texto ruso a inglés en CPU, donde el ahorro de memoria del decodificador fusionado permite mayor densidad de workers por máquina.
- Aplicaciones de escritorio o extensiones: integración en herramientas locales (editores, lectores de noticias) que necesiten traducción ru→en sin conexión, gracias al formato ONNX y al tamaño de 0,1 GB.
- Prototipado rápido de sistemas de traducción: uso como línea base reproducible antes de evaluar modelos mayores, ya que la salida es idéntica a la del modelo base y la licencia CC BY 4.0 permite uso comercial con atribución.

## Benchmarks y rendimiento

La model card no publica métricas de calidad de traducción (BLEU, COMET, chrF) ni resultados en benchmarks estándar. Solo se documentan métricas de memoria, que se reproducen a continuación:

| Condicion | Linux (MiB) | Windows (MiB) | Tokens identicos |
|---|---:|---:|---|
| `disable_quant_qdq = 1` | 527 → 282 (-47 %) | 502 → 259 (-48 %) | si |
| Valores por defecto de ONNX Runtime | 281 → 220 (-22 %) | 196 → 165 (-15 %) | si |

Medido con ONNX Runtime 1.31.1, CPU, 4 hilos (Linux nativo; Windows en máquina virtual). No se han publicado resultados de benchmarks de calidad en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo está diseñado para CPU. El consumo de memoria RAM tras la carga es de 282 MiB en Linux y 259 MiB en Windows con `disable_quant_qdq = 1`.
- GPU recomendadas: no disponibles; no se documenta ejecución en GPU.
- Cabe en cualquier equipo consumer: el repositorio ocupa 0,1 GB y la inferencia requiere menos de 300 MiB de memoria, por lo que funciona en portátiles, navegadores y dispositivos de gama baja.
- Opciones de despliegue: transformers.js con ONNX Runtime (JavaScript), y script Python `translate.py` basado en onnxruntime, sentencepiece y numpy.
- Latencia y throughput: no disponibles en la información proporcionada; las mediciones publicadas se limitan a memoria con 4 hilos de CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OptimaMT/ru-en | no disponible | no disponible | ru→en | CC BY 4.0 | ONNX | Decodificador fusionado, menor memoria |
| Xenova/opus-mt-ru-en | no disponible | no disponible | ru→en | CC BY 4.0 | ONNX | Modelo base directo; más memoria |
| Helsinki-NLP/opus-mt-ru-en | no disponible | no disponible | ru→en | CC BY 4.0 | PyTorch (safetensors/bin) | Modelo original de OPUS-MT |

La diferencia principal frente a sus alternativas es el consumo de memoria, no la calidad de traducción, que se mantiene idéntica por construcción. No se dispone de datos de rendimiento comparado en benchmarks.

## Limitaciones y advertencias

- Solo traduce de ruso a inglés; no soporta la dirección inversa ni otros pares.
- No se han publicado evaluaciones de calidad (BLEU, COMET) específicas para esta variante; la calidad hereda la del modelo OPUS-MT original.
- Riesgo de alucinación y de traducciones incorrectas en dominios especializados (legal, médico, técnico) no cubiertos por los datos de entrenamiento originales.
- Sesgos potenciales heredados del corpus OPUS-MT, que no se documentan en la información disponible.
- Longitud de contexto no documentada; no se recomienda para documentos largos sin fragmentación previa.
- La licencia CC BY 4.0 permite uso comercial, pero exige atribución a OPUS-MT (Universidad de Helsinki), a Xenova por la exportación ONNX y a OptimaMT por la modificación del grafo.
- El repositorio no incluye pesos en safetensors ni GGUF; para usarlo fuera de ONNX Runtime habría que recurrir al modelo base.
- El modelo se creó en noviembre de 2026 y no registra descargas ni likes, por lo que carece de validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/OptimaMT/ru-en
- Modelo base ONNX: https://huggingface.co/Xenova/opus-mt-ru-en
- Modelo original OPUS-MT: https://huggingface.co/Helsinki-NLP/opus-mt-ru-en
- Repositorio del proyecto: https://github.com/AmerAlreyahi/OptimaMT
- Informe técnico: https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traducción en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results

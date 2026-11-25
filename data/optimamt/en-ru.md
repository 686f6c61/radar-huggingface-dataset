# OptimaMT/en-ru

## Resumen

OptimaMT/en-ru es una conversión a ONNX del modelo de traducción automática Xenova/opus-mt-en-ru, a su vez derivado del OPUS-MT de la Universidad de Helsinki para el par inglés-ruso. Lo desarrolla el proyecto OptimaMT, que publica 51 pares de traducción con el mismo enfoque: mantener los pesos originales intactos y reconstruir únicamente el decoder fusionado en formato ONNX para reducir memoria y latencia en inferencia sobre CPU. El modelo se distribuye a través de la librería transformers.js, lo que lo hace directamente consumible desde JavaScript/Node.js y desde Python mediante onnxruntime.

La relevancia de esta ficha no está en una mejora de calidad de traducción —el autor afirma explícitamente que produce los mismos tokens que el original— sino en la eficiencia de despliegue: la opción `disable_quant_qdq = 1` de ONNX Runtime reduce el consumo de memoria tras la carga entre un 46 % y un 49 % en Linux y Windows respectivamente, con una aceleración de 2,3 a 2,5 veces. Sobre FLORES-200 devtest (1.012 frases) obtiene BLEU 24,14 y chrF 52,27 en decodificación greedy, idénticos al modelo de referencia.

Se trata de un modelo Marian de traducción con vocabulario de 62.518 tokens, pensado para escenarios de traducción interactiva y embebida donde el coste de memoria y la latencia importan más que la personalización. Ya se usa en producción en OpenCircle, un traductor de pantalla de escritorio para Windows y Linux desde su versión 0.1.4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado (q8); decoder fusionado con `disable_quant_qdq = 1` |
| Idiomas soportados | inglés (en), ruso (ru) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`onnx/decoder_model_merged_quantized.onnx` reconstruido; resto de ficheros idénticos al original) |
| Vocabulario | 62.518 tokens |
| Tamano del repositorio | 0,1 GB |
| Libreria | transformers.js |
| Modelo base | Xenova/opus-mt-en-ru (revision `e050376e9601`) |

## Arquitectura y entrenamiento

El modelo es un Marian, la arquitectura transformer encoder-decoder desarrollada por el grupo de Helsinki-NLP para traducción automática neuronal, heredada íntegramente de OPUS-MT en-ru. No hay entrenamiento propio por parte de OptimaMT: los pesos son los de Helsinki-NLP/opus-mt-en-ru, exportados a ONNX por Xenova y posteriormente reprocesados por OptimaMT. La única modificación es de grafo: la proyección de salida del decoder se extrae de sus dos ramas y se fusiona en un único decoder merged, sin alterar los pesos.

La innovación técnica es puramente de despliegue. Con `disable_quant_qdq = 1` en ONNX Runtime se evita el patrón QuantizeLinear/DequantizeLinear redundante en el grafo cuantizado, lo que se traduce en 2,3–2,5× de aceleración y una reducción de memoria tras la carga de 525 a 281 MiB en Linux (-46 %) y de 500 a 257 MiB en Windows (-49 %). Con los valores por defecto de ONNX Runtime la reducción es menor (281 → 220 MiB en Linux, 195 → 167 MiB en Windows). No se documenta en la información disponible el volumen de tokens de entrenamiento, la composición del corpus ni si hubo RLHF o DPO; al tratarse de OPUS-MT, el entrenamiento original es supervisado sobre corpus paralelos de OPUS.

## Capacidades

- Traducción automática directa inglés → ruso, un único par de idiomas.
- Generación de texto condicionada a la secuencia de entrada (text2text-generation), sin capacidad de instrucciones ni de diálogo.
- Ejecución en navegador y en Node.js mediante transformers.js con `dtype: "q8"`.
- Ejecución en Python mediante onnxruntime, sentencepiece y numpy (script `translate.py` del repositorio).
- Inferencia en CPU con hilos configurables (los resultados publicados usan 4 hilos).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- No es un modelo multilingüe: solo en y ru.

## Casos de uso

- Traducción de pantalla en tiempo real: OpenCircle, la aplicación de escritorio para Windows y Linux, integra estos modelos desde la versión 0.1.4 para traducir texto capturado de la pantalla; el bajo consumo de memoria (281 MiB en Linux con `disable_quant_qdq = 1`) permite mantenerlo residente junto a la aplicación principal.
- Traducción en el navegador sin backend: al cargarse con transformers.js y pesos ONNX cuantizados, el modelo puede ejecutarse del lado del cliente para traducir contenido en una web o extensión sin enviar texto a un servidor, lo que reduce latencia y preserva privacidad.
- Localización de documentación técnica: traducción por lotes de README, manuales y cadenas de interfaz del inglés al ruso, con la ventaja de que el resultado es idéntico al del OPUS-MT original y por tanto validable contra una referencia conocida.
- Preprocesado en pipelines de NLP: traducción en-ru como paso previo a análisis de sentimiento, indexación o búsqueda en corpus rusos, ejecutable en CPU sin GPU dedicada.
- Herramientas de escritorio y CLI: integración en utilidades ligeras (menos de 0,1 GB de repositorio) para traducción puntual de frases o ficheros, sin dependencias de frameworks de deep learning pesados.
- Sistemas con restricciones de memoria: entornos embebidos, contenedores pequeños o máquinas virtuales donde los 257–281 MiB tras la carga con `disable_quant_qdq = 1` son un requisito duro y donde la aceleración de 2,3–2,5× frente al decoder original es determinante.

## Benchmarks y rendimiento

| Benchmark | Resultado | Condiciones |
|---|---|---|
| FLORES-200 devtest (BLEU) | 24,14 | 1.012 frases, decodificación greedy |
| FLORES-200 devtest (chrF) | 52,27 | 1.012 frases, decodificación greedy |
| Aceleración vs. decoder original | 2,3–2,5× | ONNX Runtime 1.31.1, CPU, 4 hilos, `disable_quant_qdq = 1` |
| Memoria tras carga (Linux) | 525 → 281 MiB (-46 %) | `disable_quant_qdq = 1` |
| Memoria tras carga (Windows) | 500 → 257 MiB (-49 %) | `disable_quant_qdq = 1`, Windows en VM |
| Memoria tras carga (Linux) | 281 → 220 MiB (-22 %) | Valores por defecto de ONNX Runtime |
| Memoria tras carga (Windows) | 195 → 167 MiB (-14 %) | Valores por defecto de ONNX Runtime |

El autor indica que los tokens generados son idénticos a los del modelo original en todas las configuraciones medidas, por lo que las métricas de calidad de traducción coinciden con las de Xenova/opus-mt-en-ru. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de razonamiento, al no ser un modelo de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el escenario publicado, que es CPU; el modelo se ejecuta en ONNX Runtime sobre CPU con 4 hilos.
- Memoria RAM tras la carga: 281 MiB en Linux y 257 MiB en Windows con `disable_quant_qdq = 1`; 220 MiB y 167 MiB respectivamente con los valores por defecto.
- GPU recomendadas: no se documentan; el diseño está orientado a CPU y a ejecución en navegador.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU, dado el tamaño del repositorio (0,1 GB) y el consumo de memoria medido.
- Opciones de despliegue: transformers.js (`@huggingface/transformers`), onnxruntime (Python, con sentencepiece y numpy), y cualquier runtime compatible con ONNX.
- Latencia y throughput: no se publican valores absolutos de latencia ni de tokens por segundo; solo la mejora relativa de 2,3–2,5× frente al decoder original en ONNX Runtime 1.31.1, CPU y 4 hilos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad (FLORES-200 devtest) | Licencia | Formato |
|---|---|---|---|---|---|
| OptimaMT/en-ru | no disponible | no disponible | BLEU 24,14 / chrF 52,27 | CC BY 4.0 | ONNX cuantizado |
| Xenova/opus-mt-en-ru | no disponible | no disponible | Idéntica (mismos pesos) | CC BY 4.0 | ONNX |
| Helsinki-NLP/opus-mt-en-ru | no disponible | no disponible | Referencia original de OPUS-MT | CC BY 4.0 | safetensors / PyTorch |
| Otros pares OptimaMT | no disponible | no disponible | No disponible | CC BY 4.0 | ONNX cuantizado |

La comparativa relevante es interna al ecosistema OPUS-MT: OptimaMT/en-ru se diferencia de Xenova/opus-mt-en-ru y de Helsinki-NLP/opus-mt-en-ru exclusivamente en el grafo ONNX del decoder (fusión y `disable_quant_qdq`), no en pesos ni en calidad. No se dispone de datos de benchmarks comparativos frente a otros sistemas de traducción en-ru en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible; al heredar los pesos de OPUS-MT, arrastra los sesgos del corpus paralelo original.
- Riesgo de alucinación: inherente a cualquier modelo de traducción neuronal; no se han publicado evaluaciones específicas de fidelidad o de omisiones en frases largas.
- Limitaciones de idioma: solo traduce de inglés a ruso; no soporta otros pares ni traducción inversa.
- Longitud de contexto: no disponible; los modelos Marian tienen límites de secuencia que no se especifican en la model card.
- Restricciones de licencia: CC BY 4.0 permite uso comercial con atribución; es obligatorio citar a los autores originales (Universidad de Helsinki, OPUS-MT) y a Xenova por la exportación ONNX.
- Caveat de producción: el rendimiento publicado se midió en CPU con 4 hilos y ONNX Runtime 1.31.1; los valores de memoria y velocidad pueden variar en otras versiones o configuraciones de hilos.
- Solo se reconstruye `onnx/decoder_model_merged_quantized.onnx`; el resto de ficheros son los originales byte a byte, por lo que cualquier problema del export original de Xenova persiste.
- El modelo no admite instrucciones, diálogo ni formato conversacional: es estrictamente traducción text2text.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/en-ru
- Repositorio del proyecto OptimaMT: https://github.com/AmerAlreyahi/OptimaMT
- Informe metodológico (REPORT.md): https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traducción en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Resultados interactivos: https://huggingface.co/spaces/OptimaMT/results
- Colección de los 51 pares: https://huggingface.co/collections/OptimaMT/optimamt-lighter-opus-mt-onnx-models-6af228dc9cd91f015e56e869
- Aplicación OpenCircle: https://github.com/AmerAlreyahi/OpenCircle
- Modelo base ONNX: https://huggingface.co/Xenova/opus-mt-en-ru
- Modelo original OPUS-MT: https://huggingface.co/Helsinki-NLP/opus-mt-en-ru

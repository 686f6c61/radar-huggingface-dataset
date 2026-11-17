# manasrpandya/cnndm-summ-onnx

## Resumen

`cnndm-summ-onnx` es un modelo de resumen abstractivo en inglés desarrollado por el usuario independiente manasrpandya. Se trata de un fine-tuning de `facebook/bart-base` sobre 40.000 artículos del corpus CNN/DailyMail, con la particularidad de que el prompt incluye un prefijo de control de longitud (`summarize short:`, `summarize medium:` o `summarize long:`) que condiciona la extensión del resumen generado.

El modelo está pensado para su despliegue en el navegador y en entornos JavaScript mediante transformers.js. Para ello, el autor ha exportado los pesos a ONNX, ha recortado el vocabulario de 50.265 a 18.001 tokens (los usados en entrenamiento más los necesarios para reconstruir los tokens BPE) y ha aplicado cuantización int8, lo que reduce el artefacto a 137 MB. Esto lo hace viable en clientes ligeros sin infraestructura GPU dedicada.

La relevancia actual del modelo es acotada: no compite en calidad con modelos de resumen de gran tamaño, pero demuestra una cadena de compresión (recorte de vocabulario + cuantización + exportación ONNX) que permite ejecutar resumen de noticias localmente en el navegador con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (BART), base |
| Parametros totales | no disponible (derivado de facebook/bart-base, ~139M antes del recorte de vocabulario) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens de entrada (solo se leen los primeros 512 tokens del articulo) |
| Tipos de cuantizacion | int8 (q8 en transformers.js); pesos PyTorch en precision original |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX cuantizado (`encoder_model_quantized.onnx`, `decoder_model_merged_quantized.onnx`); pesos PyTorch en el repo `cnndm-summ` |

## Arquitectura y entrenamiento

El modelo parte de `facebook/bart-base`, un transformer encoder-decoder con atención bidireccional en el encoder y causal en el decoder, preentrenado con objetivos de denoising. Sobre esa base, el autor realizó un fine-tuning supervisado sobre 40.000 artículos de CNN/DailyMail (dataset `abisee/cnn_dailymail`), introduciendo un prefijo de longitud en la entrada para controlar la extensión del resumen. No se documenta en la información disponible el uso de RLHF, DPO ni otras fases de alineación posteriores al fine-tuning supervisado.

La innovación técnica principal es la compresión del artefacto: el vocabulario se reduce de 50.265 a 18.001 tokens conservando los tokens presentes en el conjunto de entrenamiento y los necesarios para la tokenización BPE, y posteriormente se aplica cuantización int8. El resultado son dos ficheros ONNX (encoder y decoder fusionado) de 137 MB en total, aptos para transformers.js. El autor reporta una pérdida de calidad asociada a la cuantización: en una comprobación sobre 300 artículos, el modelo ONNX int8 obtiene ROUGE-1 36,2 frente a 37,5 del modelo PyTorch.

## Capacidades

- Generación de resúmenes abstractivos de noticias en inglés.
- Control de longitud mediante prefijos de prompt (`summarize short:`, `summarize medium:`, `summarize long:`).
- Ejecución en navegador y en Node.js a través de transformers.js con `dtype: "q8"`.
- Decodificación con beam search (beam 4) o greedy; el autor documenta resultados para ambas configuraciones.
- No dispone de tool calling, function calling ni soporte de agentes.
- No dispone de modo de razonamiento (thinking), visión ni audio.
- Capacidad multilingüe limitada al inglés; no se documenta soporte de otros idiomas.

## Casos de uso

- Resumen de noticias en el navegador: al ejecutarse vía transformers.js con pesos int8 de 137 MB, permite resumir artículos directamente en el cliente sin enviar el texto a un servidor, lo que resulta útil para aplicaciones de lectura con requisitos de privacidad.
- Extensión de navegador para lectores de prensa: el prefijo de longitud permite ofrecer al usuario resúmenes cortos, medios o largos de la noticia abierta, ajustando `max_new_tokens` en cada caso.
- Prototipado rápido de pipelines de sumarización: al ser un artefacto ONNX ligero y con licencia Apache 2.0, sirve para validar interfaces y flujos de resumen antes de migrar a modelos mayores.
- Procesamiento por lotes de titulares y entradillas: con 512 tokens de contexto, es adecuado para resumir notas breves o entradillas de agencias de noticias en inglés.
- Aplicaciones educativas y demos de NLP: el repositorio incluye una demo pública y el código del proyecto, lo que facilita su uso como ejemplo didáctico de fine-tuning de BART y exportación a ONNX.
- Filtrado y triaje de contenido en inglés: generar un resumen corto de cada artículo para clasificación o indexación previa, aprovechando la baja huella de memoria del modelo cuantizado.
- Despliegue en entornos sin GPU: el tamaño de 137 MB y la ejecución en CPU mediante ONNX lo hacen apto para dispositivos de gama baja o entornos edge.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre un subconjunto fijo aleatorio de 2.000 artículos del test de CNN/DailyMail, con prefijo `medium`:

| Configuración | ROUGE-1 | ROUGE-2 | ROUGE-Lsum |
|---|---|---|---|
| Beam 4 | 40,5 | 18,0 | 37,1 |
| Greedy | 40,3 | 17,8 | 37,3 |

Comparación PyTorch frente a ONNX int8 sobre 300 artículos:

| Modelo | ROUGE-1 |
|---|---|
| PyTorch (vocabulario completo) | 37,5 |
| ONNX int8 | 36,2 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el artefacto int8 ocupa 137 MB, por lo que la inferencia en CPU es viable.
- GPU recomendadas: no se documentan; el modelo está orientado a ejecución en CPU y en navegador mediante ONNX Runtime / transformers.js.
- Cabe en GPU de consumo: sí, por tamaño, aunque el diseño apunta a ejecución en CPU o WebGPU del navegador.
- Opciones de despliegue: transformers.js (`@huggingface/transformers`) con `dtype: "q8"`; el formato ONNX también permite su uso con ONNX Runtime en otros entornos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| cnndm-summ-onnx | ~139M (bart-base, vocabulario recortado) | 512 tokens | Apache 2.0 | ONNX int8, transformers.js | Resumen en inglés con control de longitud; 137 MB |
| facebook/bart-base | ~139M | 1024 tokens | MIT | PyTorch, safetensors | Modelo base sin fine-tuning específico para resumen |
| facebook/bart-large-cnn | ~406M | 1024 tokens | MIT | PyTorch, safetensors | Fine-tuning estándar de referencia para CNN/DailyMail, mayor tamaño y calidad esperada |
| pegasus-cnn_dailymail | ~568M | 512 tokens | Apache 2.0 | PyTorch, safetensors | Modelo especializado en resumen de noticias, mayor coste de inferencia |

Los datos de rendimiento de los modelos comparados no se incluyen en la información disponible; la comparación se limita a parámetros, contexto, licencia y formato.

## Limitaciones y advertencias

- Solo procesa los primeros 512 tokens del artículo; el contenido posterior se descarta, lo que puede omitir información relevante en textos largos.
- Entrenado exclusivamente con noticias en inglés; su rendimiento en otros dominios (texto técnico, legal, conversacional) o en otros idiomas es previsiblemente inferior.
- La cuantización int8 introduce una pérdida de calidad medible (ROUGE-1 36,2 frente a 37,5 en la comprobación de 300 artículos).
- Riesgo de alucinación inherente a los modelos de resumen abstractivo de tamaño base; no se documentan evaluaciones específicas de fidelidad factual.
- Sesgos: no se documenta ningún análisis de sesgos; al derivar de CNN/DailyMail, puede heredar los sesgos del corpus periodístico.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo base `facebook/bart-base` se distribuye bajo licencia MIT; conviene verificar la compatibilidad en despliegues comerciales.
- El recorte de vocabulario implica que tokens fuera de los 18.001 conservados no se representan correctamente, lo que puede afectar a entradas con vocabulario atípico.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación independiente.

## Enlaces

- Hugging Face: https://huggingface.co/manasrpandya/cnndm-summ-onnx
- Pesos PyTorch (vocabulario completo): https://huggingface.co/manasrpandya/cnndm-summ
- Demo: https://nlp-cv-lab.vercel.app/p/summarization
- Código: https://github.com/manasrpandya/NLP_CV_Lab/tree/main/projects/03-summarization
- Modelo base: https://huggingface.co/facebook/bart-base
- Dataset: https://huggingface.co/datasets/abisee/cnn_dailymail

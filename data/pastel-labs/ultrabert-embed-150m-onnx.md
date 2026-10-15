# pastel-labs/UltraBERT-Embed-150M-ONNX

## Resumen

UltraBERT-Embed-150M-ONNX es la conversión a formato ONNX del modelo de embeddings dmis-lab/UltraBERT-Embed-150M, publicada por pastel-labs. No se trata de un modelo entrenado desde cero: los pesos, la tokenización y la arquitectura son los del repositorio original de dmis-lab, distribuidos bajo la misma licencia Apache-2.0, y el trabajo del autor de este repositorio se limita a la exportación de formato. El objetivo declarado es poder ejecutar el modelo fuera de PyTorch, tanto en ONNX Runtime como en el navegador mediante Transformers.js.

El modelo es un encoder bidireccional de aproximadamente 150 millones de parámetros orientado a extracción de características (feature-extraction). Genera embeddings de frase de 768 dimensiones aplicando pooling sobre el primer token, tal como define el fichero `1_Pooling/config.json` del modelo original. Internamente combina capas de atención con ventana deslizante de 128 tokens y capas de atención completa, con normalización RMSNorm, y acepta `input_ids` y `attention_mask` con tamaño de lote y longitud de secuencia dinámicos.

Su relevancia es práctica: permite obtener embeddings en el lado del cliente (Node.js o navegador con backend WebAssembly) sin servidor Python ni GPU, con una pérdida de fidelidad mínima respecto al modelo PyTorch original. Está pensado para pipelines de búsqueda semántica, similitud de texto y clasificación ligera que necesiten ejecutarse en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder bidireccional tipo BERT con atención híbrida (capas de ventana deslizante de 128 tokens y capas de atención completa) y RMSNorm; código personalizado (`modeling_ultrabert.py`, atención eager) |
| Parametros totales | Aproximadamente 150 M (segun la denominacion del modelo; valor exacto no disponible) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (solo se documenta la ventana local de 128 tokens de las capas de atención deslizante) |
| Tipos de cuantizacion | ONNX fp32 y fp16; el autor descarta la cuantizacion de 4 bits (MatMulNBits, block size 32) por dar un coseno minimo de 0,905 |
| Idiomas soportados | Ingles (en), igual que el modelo original |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17): `onnx/model.onnx` (fp32, 605 MB) y `onnx/model_fp16.onnx` (fp16, 303 MB) |

## Arquitectura y entrenamiento

La arquitectura corresponde a un encoder bidireccional de la familia BERT con un patrón de atención híbrido: capas de atención local con ventana deslizante de 128 tokens combinadas con capas de atención completa. La información disponible confirma únicamente el uso de RMSNorm y softmax, además del mecanismo de atención eager en la exportación. La dimensión de los embeddings de salida es 768, obtenida por pooling del primer token según la configuración del modelo base. La máscara de atención se utiliza dentro del grafo para construir tanto las capas de ventana deslizante como las de atención completa, de modo que el padding y cualquier longitud de secuencia funcionan correctamente.

No se dispone de información sobre el proceso de entrenamiento del modelo original: no hay datos publicados en la información proporcionada sobre número de tokens, composición del dataset, uso de RLHF/DPO ni objetivos de entrenamiento (más allá del propio objetivo de representación de frases implícito en su uso como modelo de embeddings). La innovación destacable de este repositorio es exclusivamente de formato: la exportación se realizó con el exportador TorchScript de PyTorch a opset 17, y en la variante fp16 se marcan las operaciones RMSNorm y softmax para que permanezcan en fp32 y evitar desbordamiento, mientras que las multiplicaciones de matrices se ejecutan en fp16.

## Capacidades

- Generación de embeddings de frase de 768 dimensiones mediante pooling del primer token, aptos para similitud coseno y búsqueda semántica.
- Extracción de características sobre secuencias de longitud variable y lotes dinámicos, gracias a la máscara de atención construida dentro del grafo.
- Procesamiento de textos largos: el autor validó la exportación con extractos de libros de entre 2.000 y 8.000 tokens.
- Ejecución en Node.js mediante Transformers.js v3 y en navegador (Chrome headless) con backend WebAssembly, reproduciendo los vectores de ONNX Runtime con coseno 1,0000.
- Tokenización compatible: Transformers.js produce los mismos identificadores de token que el tokenizador de Python.
- No es un modelo generativo: no admite generación de texto, razonamiento, código, matemáticas, visión, tool calling, uso como agente ni modo de razonamiento explícito.
- Capacidad multilingüe: no disponible; el modelo está restringido a inglés.
- Capacidad especial: precisión fp16 con RMSNorm y softmax forzados a fp32 para evitar desbordamiento.

## Casos de uso

- Búsqueda semántica en el navegador: el modelo puede generar embeddings de consultas y documentos directamente en el cliente con Transformers.js y WebAssembly, eliminando la necesidad de enviar texto a un servidor y reduciendo costes de infraestructura.
- Sistemas de recomendación de contenido ligero: comparar embeddings de titulares, descripciones o reseñas mediante similitud coseno para ordenar resultados relacionados en aplicaciones web o extensiones.
- Deduplicación y agrupación de textos: calcular la similitud entre documentos cortos (preguntas, reseñas, notas) para detectar duplicados o agrupar temas afines dentro de un pipeline de datos.
- Filtrado y moderación asistida por similitud: comparar el embedding de un mensaje entrante con el de un conjunto de ejemplos etiquetados para marcar contenido potencialmente problemático antes de una revisión humana.
- Indexación de documentación técnica: generar representaciones de fragmentos de 2.000 a 8.000 tokens, algo validado en la conversión, para alimentar un índice vectorial de manuales o bases de conocimiento.
- Clasificación de texto con cabecera ligera: usar los embeddings de 768 dimensiones como entrada de un clasificador sencillo (regresión logística, SVM) para tareas como análisis de sentimiento o etiquetado de tickets.
- Búsqueda sobre código y SQL: el autor incluyó textos de código y SQL en la validación de la exportación, por lo que el modelo puede emplearse para recuperar fragmentos similares en repositorios o documentación técnica.
- Preprocesado en el edge: al caber en memoria de dispositivos modestos y ejecutarse sin GPU, permite tareas de similitud textual en entornos con CPU únicamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros). La única validación documentada es la fidelidad de la exportación ONNX frente al modelo PyTorch original, medida con similitud coseno sobre 20 textos en inglés (15 cortos, de 3 a 25 tokens, y 5 extractos largos, de 2.000 a 8.000 tokens):

| Variante | Tamano | Coseno minimo | Coseno medio |
|---|---|---|---|
| fp32 (`onnx/model.onnx`) | 605 MB | 1,0000 | 1,00000 |
| fp16 (`onnx/model_fp16.onnx`) | 303 MB | 0,9999 | 0,99997 |
| 4 bits descartada (MatMulNBits, block 32) | no disponible | 0,905 | no disponible |

El autor fija un umbral de aceptación de coseno mínimo 0,99 por texto; las variantes asimétricas, HQQ y de bloque 16 tampoco alcanzaron ese umbral y no se publicaron. En Transformers.js v3 tanto Node como Chrome headless reprodujeron los vectores de ONNX Runtime con coseno superior a 0,999.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7-0,9 GB en fp16 y 1,2-1,4 GB en fp32, considerando pesos y activaciones para lotes pequeños (estimación, no publicada por el autor).
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente, incluidas tarjetas consumer de gama baja. No se requieren A100 ni H100.
- Cabe en GPU consumer: sí, en prácticamente cualquier modelo actual (RTX 3060, RTX 4060, GTX 1650 y superiores).
- Ejecución en CPU: viable tanto en fp32 como en fp16, dado el tamaño reducido del modelo.
- Navegador: verificado en Chrome headless con backend WebAssembly.
- Opciones de despliegue: ONNX Runtime, Transformers.js v3 (`AutoModel` con `dtype: 'fp16'` o `'fp32'`), y cualquier runtime compatible con ONNX (por ejemplo ONNX Runtime Web o servidores que acepten grafos ONNX).
- No compatible con vLLM, llama.cpp, Ollama ni TGI, al no distribuirse pesos en formato GGUF ni safetensors y no ser un modelo generativo.
- Latencia y throughput: no disponible.
- Nota de integración: Transformers.js v3 no reconoce el tipo de modelo `ultrabert`, por lo que muestra el mensaje "Unknown model class" y recurre a la clase base. El autor recomienda usar `AutoModel` en lugar de la pipeline `feature-extraction` para controlar explícitamente el pooling.

## Comparativa con modelos similares

No se proporcionó información sobre modelos alternativos comparables. La única comparación documentada es con el modelo del que deriva:

| Modelo | Parametros | Contexto | Formato | Licencia | Rendimiento |
|---|---|---|---|---|---|
| pastel-labs/UltraBERT-Embed-150M-ONNX | ~150 M | no disponible | ONNX (fp32, fp16) | Apache-2.0 | Coseno frente al original: 1,0000 (fp32), 0,99997 medio (fp16) |
| dmis-lab/UltraBERT-Embed-150M | ~150 M | no disponible | PyTorch | Apache-2.0 | Modelo de referencia; sin datos de benchmarks publicados en la información disponible |

Comparativa con otros modelos de embeddings de tamaño similar (por ejemplo, variantes de la familia BGE, E5 o MiniLM): no disponible, al no haberse aportado datos sobre ellos.

## Limitaciones y advertencias

- El modelo solo procesa inglés; cualquier uso en castellano u otros idiomas queda fuera de su alcance documentado.
- No es un modelo generativo: no puede producir texto, razonar, escribir código ni invocar herramientas. Cualquier expectativa en ese sentido es un error de uso.
- Riesgo de alucinación: no aplica en el sentido generativo, ya que solo produce vectores; el riesgo se traslada al sistema que consuma esos embeddings (por ejemplo, un recuperador que devuelva documentos poco relevantes).
- Sesgos conocidos: no disponibles. No se documenta ningún análisis de sesgo sobre los datos de entrenamiento del modelo original.
- Limitación de contexto: no se especifica la longitud máxima de secuencia soportada. Aunque la exportación usa máscara de atención dinámica, no hay garantía documentada de calidad más allá de los 8.000 tokens probados empíricamente.
- Calidad en fp16: el coseno mínimo baja a 0,9999 respecto al original, un impacto despreciable pero no nulo. La cuantización de 4 bits no es recomendable según el propio autor (coseno mínimo 0,905).
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe conservar el texto de la licencia y la atribución. El repositorio original de dmis-lab no incluye fichero NOTICE; el texto Apache-2.0 está en `LICENSE`.
- Advertencia de integración: al no existir un tipo de modelo `ultrabert` en Transformers.js v3, la carga emite un aviso de clase desconocida. Es funcional, pero conviene fijar la versión de la librería para evitar roturas en producción.
- Caveat de mantenimiento: el repositorio tiene 1 descarga y 0 likes, y se publicó y actualizó el mismo día; se trata de una conversión sin comunidad consolidada detrás ni historial de uso en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/pastel-labs/UltraBERT-Embed-150M-ONNX
- Modelo base (PyTorch): https://huggingface.co/dmis-lab/UltraBERT-Embed-150M
- Transformers.js: https://www.npmjs.com/package/@huggingface/transformers
- ONNX Runtime: https://onnxruntime.ai/
- Resultados de búsqueda web: las consultas realizadas devolvieron unicamente resultados no relacionados con el modelo (portales administrativos franceses de estudios y articulos sobre el color pastel en Wikipedia), por lo que no se incluye ningun enlace adicional de interes. No se han encontrado papers, blogs, repositorios ni demos asociados a este modelo o a su modelo base en la informacion proporcionada.

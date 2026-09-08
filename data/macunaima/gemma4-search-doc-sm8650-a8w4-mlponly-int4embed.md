# macunaima/gemma4-search-doc-sm8650-a8w4-mlponly-int4embed

## Resumen

El modelo `macunaima/gemma4-search-doc-sm8650-a8w4-mlponly-int4embed` es una versión cuantizada del checkpoint `gemma4-search-doc`, compilada y empaquetada por el autor macunaima para ejecutarse específicamente en la NPU (HTP) del Qualcomm Snapdragon SM8650, el SoC del Samsung Galaxy S24. Se distribuye como un único archivo `.litertlm` optimizado para el runtime LiteRT-LM de Google.

El propósito del modelo es reducir el consumo de recursos en dispositivos móviles: aplica un esquema de cuantización mixta que sacrifica calidad en las capas MLP (pasan a INT4) mientras mantiene la atención en INT8, y comprime los embedders a INT4. Como resultado, el peso del modelo baja de 5.87 GiB (baseline A8W8) a 1.92 GiB, lo que supone una reducción del 67.2%. No obstante, las estimaciones de velocidad y calidad son razonamiento de ingeniería y aún no se han validado en un dispositivo físico. El modelo pertenece a la familia Gemma 4 y está sujeto a la licencia Gemma.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | A8W4 (MLP-only): atención INT8 peso/activación, MLP INT4 peso per-channel, embedders INT4 weight-only |
| Idiomas soportados | no disponible |
| Licencia | Gemma |
| Formato de pesos | .litertlm (LiteRT-LM), incluye `embedder.tflite` y `per_layer_embedder.tflite` |

Nota adicional: el tamaño del repositorio en HuggingFace es de 2.1 GB, y el peso del modelo empaquetado es de 1.92 GiB.

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del checkpoint original `gemma4-search-doc` (número de capas, dimensiones, número total de parámetros, longitud de contexto, etc.). La ficha se centra en la capa de cuantización, que es lo que diferencia a este modelo del checkpoint de producción.

El modelo se obtiene mediante cuantización de un checkpoint existente, no mediante un entrenamiento desde cero. El proceso de compilación se realiza con AOT (Ahead-of-Time) usando `--soc-model SM8650`, que genera un archivo `.litertlm` específico para la NPU Hexagon (HTP) del Snapdragon SM8650. El esquema de cuantización es mixto: las proyecciones de atención (q/k/v/o_proj) conservan INT8 para pesos y activaciones, igual que en el baseline de producción; las capas MLP (gate/up/down_proj) se cuantizan a INT4 para pesos con granularidad per-channel y activaciones INT8; los embedders (`embedder.tflite` y `per_layer_embedder.tflite`) se cuantizan a INT4 weight-only, también per-channel.

Una innovación técnica destacable es que se ha optado por la granularidad per-channel en lugar de blockwise, porque el compilador HTP de Qualcomm no soporta bloqueos. Además, los embedders no pasan por el compilador AOT, ya que son tablas de búsqueda puras, por lo que su compresión no está limitada por las restricciones de HTP. No se menciona ningún proceso de RLHF, DPO ni ajuste fino adicional para este modelo cuantizado.

## Capacidades

- Generación de texto: el modelo está etiquetado en HuggingFace con `pipeline_tag: text-generation`, aunque no se detallan las tareas específicas ni la calidad esperada.
- Inferencia en dispositivo: compilado específicamente para la NPU HTP del Qualcomm Snapdragon SM8650, por lo que está pensado para ejecución local en móviles sin conexión a internet.
- Compatibilidad con LiteRT-LM: se distribuye como un único archivo `.litertlm` consumible por el runtime LiteRT-LM de Google AI Edge.
- Cuantización mixta eficiente: reduce el peso del modelo a 1.92 GiB frente a los 5.87 GiB del baseline A8W8, gracias a la cuantización INT4 de las capas MLP y de los embedders.
- No se han documentado capacidades de tool calling, agentes, visión, audio ni razonamiento multi-step en la información disponible. Tampoco se dispone de una lista de idiomas soportados.

## Casos de uso

- Asistente de texto sin conexión en móvil: al ejecutarse en la NPU del Snapdragon SM8650, puede integrarse en aplicaciones Android para generar respuestas cortas, resúmenes o sugerencias sin necesidad de conectarse a un servidor.
- Resumen de documentos en móvil: dado que el checkpoint base se denomina `search-doc`, es plausible que esté orientado a tareas de búsqueda y documentación. Podría usarse para resumir textos o documentos directamente en el dispositivo.
- Aplicaciones de privacidad: al no requerir conexión a internet, evita enviar datos sensibles a la nube, lo que resulta útil en entornos sanitarios, financieros o corporativos con requisitos de confidencialidad.
- Prototipado de apps Android con LiteRT-LM: sirve como modelo de referencia para desarrolladores que quieran desplegar LLMs en dispositivos con el runtime de Google, siguiendo el mismo proceso de compilación AOT.
- Investigación en cuantización para NPU: el esquema A8W4 MLP-only y la decisión de mantener la atención en INT8 constituyen un ejemplo práctico de cómo equilibrar calidad y tamaño para hardware móvil.
- Edge AI / IoT: dispositivos basados en Snapdragon SM8650 pueden ejecutar el modelo para tareas de procesamiento de lenguaje natural en tiempo real, como clasificación de texto o extracción de información, aprovechando la NPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única referencia de rendimiento es una estimación de ingeniería del autor: la generación token a token (decode) está limitada por la banda de memoria, y al reducir los bytes de peso leídos por token en las capas MLP, se espera una velocidad neutra o ligeramente mejor que el baseline A8W8. Esta estimación no está medida en un Galaxy S24 físico. No existen datos de MMLU, HumanEval, GSM8K ni otros indicadores comparativos.

## Requisitos de hardware

- Plataforma de ejecución: Qualcomm Snapdragon SM8650 (SoC del Samsung Galaxy S24) con NPU HTP (Hexagon Tensor Processor).
- No hace falta GPU ni VRAM: el modelo está diseñado para ejecutarse en la NPU, utilizando la memoria interna del dispositivo.
- Almacenamiento necesario: 1.92 GiB para el archivo `.litertlm`, más el espacio de los ficheros TFLite de los embedders (parte del paquete).
- Opciones de despliegue: runtime LiteRT-LM de Google AI Edge, que carga el archivo `.litertlm` compilado para SM8650. No es compatible con vLLM, llama.cpp u Ollama sin recompilación.
- Latencia y throughput: no disponibles. El autor estima que el decode será neutro o ligeramente mejor que el baseline, pero no hay mediciones.

## Comparativa con modelos similares

La comparativa disponible se limita a los modelos hermanos del mismo autor, que comparten el mismo checkpoint base `gemma4-search-doc` y el mismo target de hardware. No se dispone de comparaciones con modelos externos de la misma categoría.

| Modelo | Esquema de cuantización | Tamaño | Riesgo de calidad |
|---|---|---|---|
| Baseline A8W8 (producción) | Atención INT8, MLP INT8, embedders INT8 | 5.87 GiB | Referencia |
| Este modelo (A8W4 MLP-only) | Atención INT8, MLP INT4, embedders INT4 | 1.92 GiB | Bajo-medio |
| Hermano: a8w8-int4embed | Atención INT8, MLP INT8, embedders INT4 | no disponible | Bajo |
| Hermano: a8w4-full-int4embed | Atención INT4, MLP INT4, embedders INT4 | no disponible | Mayor que el MLP-only |

El autor indica que una cuarta receta, basada en INT4 weight-only con dequantize explícito, fue probada y descartada porque el compilador AOT de Qualcomm no soporta ese patrón (`Op Dequantize does not support per-channel quant tensor`), por lo que no tiene repositorio.

## Limitaciones y advertencias

- Las estimaciones de velocidad y calidad son razonamiento de ingeniería, no mediciones reales en un Galaxy S24. El propio autor advierte que aún no han sido validadas en un dispositivo físico.
- El modelo está compilado exclusivamente para el SoC Snapdragon SM8650. No es portable a otras plataformas sin recompilar con el objetivo AOT correspondiente.
- La cuantización INT4 de las capas MLP puede degradar la calidad del modelo, aunque el autor considera que el riesgo es bajo-medio porque la atención se mantiene en INT8, que es históricamente más sensible a cuantizaciones agresivas.
- No se disponen de benchmarks públicos, por lo que no es posible evaluar su rendimiento real frente a otros modelos.
- La licencia Gemma impone condiciones de uso (Gemma Terms of Use) que deben revisarse antes de cualquier despliegue comercial.
- No se ha documentado la lista de idiomas soportados ni la longitud de contexto del checkpoint base.
- El repositorio tiene 0 descargas y 0 likes: se trata de un modelo experimental sin validación externa por parte de la comunidad.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/macunaima/gemma4-search-doc-sm8650-a8w4-mlponly-int4embed
- Hermano A8W8-INT4embed: https://huggingface.co/macunaima/gemma4-search-doc-sm8650-a8w8-int4embed
- Hermano A8W4-full-INT4embed: https://huggingface.co/macunaima/gemma4-search-doc-sm8650-a8w4-full-int4embed
- Proyecto LiteRT-LM (Google AI Edge): https://github.com/google-ai-edge/LiteRT
- Página de Gemma 4 en DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Documentación de Gemma 4 en HuggingFace: https://huggingface.co/docs/transformers/model_doc/gemma4

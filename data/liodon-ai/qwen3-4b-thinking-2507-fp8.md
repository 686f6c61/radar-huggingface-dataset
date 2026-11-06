# liodon-ai/Qwen3-4B-Thinking-2507-FP8

## Resumen

Qwen3-4B-Thinking-2507-FP8 es una cuantización en FP8 del modelo Qwen/Qwen3-4B-Thinking-2507, publicada por Liodon AI. Se trata de un transformer denso de 4.022.468.096 parámetros (~4B) orientado a generación de texto con modo de razonamiento explícito ("thinking"), distribuido en formato safetensors y compatible con el ecosistema transformers, vLLM, TGI y SGLang. El repositorio ocupa 4,4 GB frente a los 8,0 GB del modelo original en BF16, lo que reduce a la mitad el espacio en disco y la huella de memoria de los pesos.

La relevancia de esta ficha radica en que es una cuantización "llave en mano" pensada para despliegue en producción: emplea el esquema FP8_DYNAMIC de llm-compressor, con pesos en FP8 (E4M3) por canal y activaciones cuantizadas dinámicamente por token en tiempo de inferencia. Al no requerir dataset de calibración, los pesos cuantizados son esencialmente una conversión directa del original, sin sesgo introducido por el conjunto de calibración. El `lm_head` se deja sin cuantizar.

El modelo hereda las capacidades del Qwen3-4B-Thinking-2507 original, pero la información disponible sobre idiomas, benchmarks y detalles de entrenamiento del modelo base no está incluida en los materiales proporcionados, por lo que se indica como no disponible en los apartados correspondientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3); detalles internos del modelo base no disponibles |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (E4M3), esquema FP8_DYNAMIC: pesos por canal, activaciones por token; `lm_head` sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base; condiciones concretas no disponibles) |
| Formato de pesos | safetensors (compressed-tensors); repo de 4,4 GB frente a 8,0 GB en BF16 |

## Arquitectura y entrenamiento

El modelo es una cuantización del Qwen3-4B-Thinking-2507, un transformer denso de aproximadamente 4B parámetros de la familia Qwen3. La información proporcionada no detalla la arquitectura interna del modelo base (número de capas, dimensión oculta, mecanismo de atención, etc.), ni los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO). Tampoco se especifican innovaciones técnicas del modelo original más allá de su orientación a razonamiento explícito, sugerida por el sufijo "Thinking" en el nombre.

La innovación de esta publicación concreta es la cuantización: se aplicó llm-compressor con el esquema FP8_DYNAMIC. Los pesos se convierten a FP8 (E4M3) por canal de forma anticipada, mientras que las activaciones se cuantizan dinámicamente por token durante la inferencia. Este esquema no necesita dataset de calibración, de modo que los pesos resultantes son numéricamente una conversión directa del original, sin el sesgo que podría introducir un conjunto de calibración. El `lm_head` se mantiene sin cuantizar por su reducido tamaño y su impacto desproporcionado en la calidad si se cuantizara. La ejecución en FP8 requiere GPU NVIDIA con compute capability ≥ 8,9 (Ada, Hopper o Blackwell); en GPUs anteriores, vLLM y TGI de-cuantizan para ejecutar, perdiendo las ventajas de velocidad y memoria.

## Capacidades

- Generación de texto conversacional y de un solo turno, con pipeline `text-generation`.
- Razonamiento explícito en modo "thinking", heredado del modelo base Qwen3-4B-Thinking-2507.
- Compatibilidad con text-generation-inference y endpoints compatibles, según los tags del repositorio.
- Ejecución optimizada en vLLM, TGI y SGLang mediante el formato compressed-tensors.
- Capacidades de tool calling, agentes, multilingüismo, código o matemáticas: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue de razonamiento ligero en producción: el modelo puede servirse con `vllm serve liodon-ai/Qwen3-4B-Thinking-2507-FP8` para tareas de razonamiento paso a paso con un consumo de memoria de pesos de aproximadamente 4,4 GB, adecuado para GPUs de gama media-alta.
- Servicio de chat conversacional: al ser un modelo de 4B en FP8, cabe en una sola GPU consumer con compute capability ≥ 8,9, lo que permite montar un endpoint conversacional de bajo coste con TGI o SGLang.
- Prototipado e investigación: la cuantización sin calibración facilita reproducir el comportamiento del modelo original con la mitad de huella de disco, útil para experimentos comparativos entre BF16 y FP8.
- Inferencia en clústeres con GPUs Ada/Hopper: en L4, L40S, H100 o H200 se aprovecha la aceleración nativa de FP8, reduciendo el coste por token frente a la versión BF16.
- Integración en pipelines con endpoints compatibles: los tags `endpoints_compatible` y `text-generation-inference` permiten conectarlo a infraestructuras existentes de serving sin cambios de formato.
- Evaluación de calidad de cuantización: sirve como referencia para medir la degradación de FP8_DYNAMIC frente al modelo base en tareas de razonamiento, dado que el `lm_head` se mantiene en precisión original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos FP8 ocupan aproximadamente 4,4 GB; con caché KV y overhead de serving, se recomienda al menos 8 GB de VRAM para contextos moderados (estimación orientativa, no confirmada en la información).
- GPU recomendadas: NVIDIA con compute capability ≥ 8,9 para ejecución FP8 nativa, es decir, RTX 40-series, L4, L40S, H100, H200, B100, B200 y GB10.
- GPU consumer: sí cabe en GPUs consumer de la serie RTX 40 (por ejemplo, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090) gracias al tamaño reducido de los pesos cuantizados.
- GPUs anteriores a Ada: vLLM y TGI de-cuantizan el modelo para ejecutarlo, con lo que se pierde la ventaja de velocidad y memoria del FP8.
- Opciones de despliegue: vLLM (`vllm serve`), Text Generation Inference (imagen Docker oficial), SGLang (`sglang.launch_server`) y transformers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| liodon-ai/Qwen3-4B-Thinking-2507-FP8 | 4.022.468.096 | no disponible | FP8 (E4M3) dinamica | other | Hugging Face (este repo) |
| Qwen/Qwen3-4B-Thinking-2507 (base) | 4.022.468.096 (aprox.) | no disponible | BF16 original | other | Hugging Face |
| liodon-ai/Qwen3-4B-Thinking-2507-ONNX | mismo modelo base | no disponible | ONNX (precision no indicada) | no disponible | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones de contexto para establecer una comparación cuantitativa con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- La licencia es "other" y las condiciones concretas de uso comercial no están detalladas en la información proporcionada; es necesario consultar la licencia del modelo base Qwen/Qwen3-4B-Thinking-2507 antes de un uso en producción.
- La cuantización FP8 puede introducir una degradación de calidad respecto al modelo BF16 original; no se han publicado evaluaciones que cuantifiquen esa pérdida.
- La ejecución FP8 real requiere compute capability ≥ 8,9; en GPUs anteriores el modelo se de-cuantiza y pierde las ventajas de rendimiento y memoria.
- Los sesgos conocidos del modelo no están documentados en la información disponible.
- El riesgo de alucinación no está cuantificado en la información disponible; es inherente a los modelos generativos de este tamaño.
- El soporte de idiomas no está especificado, por lo que no se puede garantizar un rendimiento multilingüe concreto.
- La longitud de contexto no está indicada; no debe asumirse una ventana mayor que la del modelo base sin verificarla.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que implica una validación comunitaria prácticamente nula.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/liodon-ai/Qwen3-4B-Thinking-2507-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Thinking-2507
- Exportación ONNX del mismo autor: https://huggingface.co/liodon-ai/Qwen3-4B-Thinking-2507-ONNX
- Herramienta de cuantización llm-compressor: https://github.com/vllm-project/llm-compressor
- Perfil del autor: https://huggingface.co/liodon-ai

# luluw/K2-Horizon-3.7B-eng-65k-trimmed-4B-dense

## Resumen

K2-Horizon-3.7B English 65K Vocabulary es una variante derivada del modelo denso `IFM/K2-Horizon-3.7B`, publicada por el usuario `luluw`. No se trata de un nuevo preentrenamiento ni de un ajuste fino, sino de una conversion de vocabulario: se reduce el tokenizador byte-level BPE de 250.624 a 65.536 entradas y se recortan en consecuencia las dimensiones de la matriz de embeddings y de la `lm_head`. El resultado pasa de 5.058.255.360 a 4.110.604.800 parametros totales, una reduccion del 18,73 %.

El modelo base es un decoder-only denso de la familia K2-Horizon, disenado como el miembro pequeno de la familia y con una ventana de contexto nativa de 524.288 tokens (512K). La derivada conserva la arquitectura, los pesos entrenados y el chat template originales; solo cambia el vocabulario y las dimensiones asociadas. La seleccion de tokens retenidos se hizo con una mezcla de 95 % texto ingles de FineWeb-2 y 5 % ejemplos de chat renderizados.

La relevancia de esta publicacion es practica: reduce el peso del repositorio a 8,2 GB y elimina casi 950 millones de parametros ligados al vocabulario multilingue original, lo que abarata el despliegue en ingles. El precio es una cobertura mucho menor para otros idiomas y para codigo fuente, que se fragmentan en mas tokens. La licencia es Apache 2.0 y los pesos se distribuyen en safetensors con `trust_remote_code` obligatorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia K2-Horizon) |
| Parametros totales | 4.110.604.800 (derivada); 5.058.255.360 (modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 524.288 tokens (512K) en el modelo base; no verificado para la derivada |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Ingles (unico idioma declarado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, `custom_code`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only denso de la familia K2-Horizon, con contexto nativo de 524.288 tokens a partir de las etapas de midtraining. El modelo base se entreno sobre `IFM/K2-Horizon-Pretrain-Data` y `IFM/K2-Horizon-Midtrain-Data`, y el autor publica codigo de entrenamiento (`ifm-ai/xllm`), codigo de evaluacion (`ifm-ai/Eval360`) y navegador de datos (`ifm-ai/DATA_NAVIGATOR`). La model card del modelo base menciona checkpoints intermedios y un modo de razonamiento con `reasoning_effort="high"`, ademas de parsers de razonamiento y de tool-calls. No se detalla en la informacion disponible el numero exacto de tokens de entrenamiento ni la composicion completa del dataset.

Esta derivada no reentrena nada: copia las filas de la matriz de embeddings y de la `lm_head` correspondientes a los tokens retenidos, y poda tanto las entradas del vocabulario como las reglas de merge del tokenizador BPE. No se introduce un token `<unk>`: el texto con tokens eliminados se representa con piezas retenidas mas pequenas. Los tokens especiales, de chat, de razonamiento y de tool-call se conservan, y el chat template no cambia. La seleccion de tokens uso una mezcla `{"eng": 0.95, "chat": 0.05}` sobre FineWeb-2 en ingles y ejemplos de chat renderizados.

## Capacidades

- Generacion de texto y conversacion en ingles, con el chat template original del modelo base.
- Razonamiento en modo thinking, activable mediante `reasoning_effort="high"` segun la documentacion del modelo base.
- Tool calling y function calling: los tokens especiales de tool-call se conservan en la derivada.
- Parsers de razonamiento y de tool-calls orientados a frameworks de serving, aunque su compatibilidad debe verificarse con la version exacta del framework.
- Contexto largo: ventana nativa de 512K tokens en el modelo base, adecuada para documentos extensos y conversaciones multi-turno prolongadas.
- Capacidades multilingues: muy limitadas en esta variante; el vocabulario esta optimizado para ingles.
- Capacidades de codigo: degradadas respecto al modelo base, ya que el codigo fuente puede fragmentarse en mas tokens.

## Casos de uso

- Atencion al cliente en ingles: conversaciones multi-turno con historial largo gracias a la ventana de 512K tokens del modelo base, con un vocabulario compacto que reduce el coste por token en texto ingles.
- Procesamiento de documentos largos en ingles: resumen y extraccion de informacion sobre contratos, informes o expedientes que caben en una sola ventana de contexto sin necesidad de chunking.
- Asistentes con tool calling: integracion en pipelines donde el modelo invoca APIs o funciones externas, aprovechando los tokens especiales de tool-call conservados en la derivada.
- Razonamiento multi-paso en ingles: tareas de analisis que se benefician del modo thinking con `reasoning_effort="high"`, siempre que el caso de uso no requiera otros idiomas.
- Despliegue con recursos limitados: el recorte de 947.650.560 parametros y un repo de 8,2 GB facilitan alojar el modelo en infraestructura mas modesta que el original, a coste de perder cobertura multilingue.
- Investigacion sobre tokenizacion: la publicacion permite estudiar el impacto del recorte de vocabulario en calidad y longitud de secuencia comparando directamente con `IFM/K2-Horizon-3.7B`.
- Fine-tuning sobre dominio en ingles: punto de partida para un ajuste corto con datos del dominio objetivo, una via de adaptacion que la propia model card sugiere como posible pero no garantizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta derivada. La model card incluye tablas de benchmarks y resultados anti-doom-loop del checkpoint original `IFM/K2-Horizon-3.7B`, pero advierte explicitamente de que no son mediciones de esta variante recortada y no deben interpretarse como tales.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 8,2 GB solo para pesos, mas overhead de activaciones y cache KV; el contexto de 512K tokens encarece la cache KV de forma significativa.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 4,1 GB para pesos; en 4 bits, alrededor de 2,1 GB, sin contar cache KV ni overhead.
- GPU profesionales: A100 (40/80 GB) y H100 son adecuadas, especialmente para explotar contextos largos.
- GPU de consumo: el modelo en bfloat16 puede caber en tarjetas con 16-24 GB (RTX 4090, RTX A6000) para contextos moderados; en cuantizaciones de 8 o 4 bits cabria en GPUs de 8-12 GB, con limitaciones de contexto.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la via documentada; vLLM, llama.cpp, Ollama o TGI no se mencionan en la informacion disponible y requeririan verificar compatibilidad con el codigo custom y el tokenizador podado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Notas |
|---|---|---|---|---|
| luluw/K2-Horizon-3.7B-eng-65k-trimmed-4B-dense | 4.110.604.800 | 512K (heredado del base) | Apache 2.0 | Derivada con vocabulario ingles de 65.536 tokens |
| IFM/K2-Horizon-3.7B | 5.058.255.360 | 512K | No disponible en la informacion | Modelo base original, vocabulario de 250.624 tokens |
| Otros modelos densos de ~4B | No disponible | No disponible | No disponible | No se dispone de datos comparables en la informacion proporcionada |

La comparacion directa mas relevante es con el modelo base: la derivada elimina 947.650.560 parametros (18,73 %) y reduce el vocabulario a 65.536 entradas, a cambio de perder cobertura multilingue y de codigo. No se dispone de datos de benchmarks de la derivada para comparar calidad frente al original.

## Limitaciones y advertencias

- El vocabulario recortado degrada la tokenizacion de idiomas distintos del ingles y de codigo fuente, lo que puede aumentar la longitud de secuencia y reducir la calidad de generacion; hay que evaluar en la carga de trabajo objetivo antes de desplegar.
- Los assets auxiliares construidos para el vocabulario original de 250.624 tokens (drafters de decodificacion especulativa, checkpoints UNO/DSpark) no son compatibles con esta variante y no deben asumirse funcionales.
- Los parsers de razonamiento y tool-call operan sobre cadenas de tokens; aunque el chat template y las cadenas se conservan, la compatibilidad debe comprobarse con el framework y la version exactos de serving.
- Los benchmarks incluidos en la model card corresponden al modelo base y no miden esta derivada; no deben citarse como resultados de esta publicacion.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; se aplican los riesgos habituales de un modelo de lenguaje sin datos especificos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio y revisarlo antes de usarlo en produccion.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que no hay evidencia de validacion por parte de la comunidad.
- La model card de la derivada contiene una inconsistencia en el identificador del ejemplo de uso (`luluw/K2-Horizon-3.7B-eng-656-trimmed`), que no coincide con el ID real del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/luluw/K2-Horizon-3.7B-eng-65k-trimmed-4B-dense
- Modelo base: https://huggingface.co/IFM/K2-Horizon-3.7B
- Codigo de entrenamiento: https://github.com/ifm-ai/xllm
- Codigo de evaluacion: https://github.com/ifm-ai/Eval360
- Navegador de datos de entrenamiento: https://github.com/ifm-ai/DATA_NAVIGATOR
- Dataset de preentrenamiento: https://huggingface.co/datasets/IFM/K2-Horizon-Pretrain-Data
- Dataset de midtraining: https://huggingface.co/datasets/IFM/K2-Horizon-Midtrain-Data

# james58899/Hy-MT2-30B-A3B-ONNX

## Resumen

Hy-MT2-30B-A3B-ONNX es una conversión al formato ONNX del modelo de traducción Hy-MT2-30B-A3B de Tencent, publicada por el usuario james58899. El punto de partida es la cuantización int4 generada por Intel (Intel/Hy-MT2-30B-A3B-int4-AutoRound), de la que se preservan los pesos tal cual: la rejilla int4 simétrica con grupo de 128 se representa mediante operadores `MatMulNBits` y `QMoE` con bloque 128, mientras que el embedding, el `lm_head` y el router permanecen sin cuantizar. El resultado es un paquete de 16,3 GB listo para ejecutarse con onnxruntime.

El modelo base es un MoE de 30B parámetros totales con 3B activos por token, especializado en traducción automática, lo que lo sitúa en la franja de modelos de traducción de gran calidad pero con un coste de inferencia contenido gracias a la activación dispersa. La conversión a ONNX amplía las opciones de despliegue más allá del ecosistema PyTorch, permitiendo integrarlo en runtimes ligeros y en pipelines que ya trabajan con onnxruntime.

La relevancia de esta ficha es doble: por un lado documenta una alternativa de despliegue para un modelo de traducción de referencia; por otro, advierte de que la conversión fue generada con scripts asistidos por Claude y el propio autor recomienda verificar su corrección antes de usarla en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con atención por grupos (GQA) y caché KV |
| Parametros totales | 30B (según el nombre del modelo base) |
| Parametros activos | 3B por token (top-8 expertos, según la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 simétrica con grupo de 128 (AutoRound); activaciones y caché KV en fp16; router en fp32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (MatMulNBits / QMoE), tokenizer, chat template y configs incluidos |

## Arquitectura y entrenamiento

El modelo base Hy-MT2-30B-A3B es un transformer con mezcla de expertos: cada token activa los 8 expertos mejor puntuados según el router, que aplica sigmoide más sesgo de experto y normaliza los pesos resultantes. La conversión ONNX respeta esta estructura: los expertos se implementan con el operador `QMoE` de `com.microsoft` con bloque 128, el factor de escala del router se pliega en la proyección down y la atención utiliza `GroupQueryAttention` con caché KV en fp16. El decoder se entrega como un grafo fusionado (`decoder_model_merged_q4f16.onnx`) y el embedding como un grafo separado.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO en el modelo original. La model card de esta conversión tampoco detalla el proceso de cuantización de Intel más allá de indicar que se trata de AutoRound int4 con rejilla simétrica y grupo de 128. La innovación técnica destacable de esta publicación es la propia conversión: scripts de exportación incluidos en `scripts/` (ejecutables con `python scripts/export.py <checkpoint dir> <out dir>`) y una representación de los expertos MoE mediante `QMoE` que evita descomprimir los pesos a fp16 en memoria.

## Capacidades

- Traducción automática: es la tarea declarada del pipeline (`translation`), orientada a traducción entre idiomas.
- Generación de texto condicionada a la tarea de traducción, con plantilla de chat incluida en el repositorio.
- Ejecución de los expertos MoE en int4 con router en fp32, lo que permite servir el modelo con requisitos de memoria reducidos.
- Compatibilidad con onnxruntime y su ecosistema de ejecución (CPU y GPU según los execution providers disponibles).
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.
- El soporte multilingüe concreto no está detallado en la información disponible.

## Casos de uso

- Traducción de documentación técnica en pipelines de CI/CD: el grafo ONNX puede integrarse en un servicio de onnxruntime que traduzca ficheros Markdown o comentarios de código antes de publicarlos, aprovechando el formato portable del modelo.
- Localización de interfaces de producto: el modelo puede generar traducciones de cadenas de UI en lote, con la ventaja de que el paquete ONNX se despliega sin dependencias de PyTorch.
- Traducción de soporte al cliente: integrado en un backend de atención multilingüe, traduce mensajes entrantes y salientes manteniendo el contexto conversacional que permita la ventana del modelo base.
- Servicio de traducción en infraestructura con onnxruntime ya desplegado: equipos que ya operan modelos ONNX pueden añadir este traductor sin introducir un stack de inferencia nuevo.
- Traducción de contenidos editoriales y blogs: generación de versiones en otros idiomas de artículos y notas de prensa, con revisión humana posterior dado el riesgo de alucinación.
- Investigación sobre cuantización y MoE: el repositorio sirve como referencia para estudiar cómo se representan expertos cuantizados int4 con `QMoE` y cómo afecta la cuantización a la calidad de traducción.
- Evaluación comparativa de runtimes: permite medir latencia y throughput de onnxruntime frente a vLLM o llama.cpp con el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 16,3 GB, lo que da una cota inferior de memoria para cargar los pesos; a ello hay que sumar activaciones y caché KV en fp16.
- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del paquete, se necesita al menos una GPU con 16-24 GB para acomodar pesos y estado de ejecución con comodidad.
- GPU recomendadas: no especificadas por el autor; por tamaño, encajan GPUs de 24 GB o más (RTX 4090, A100, H100) y, con menos margen, GPUs de 16 GB.
- Despliegue: onnxruntime con los execution providers correspondientes (CPU, CUDA, etc.); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI para este paquete ONNX.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| james58899/Hy-MT2-30B-A3B-ONNX | 30B totales / 3B activos | no disponible | ONNX int4 | Apache 2.0 | Conversión comunitaria; el autor pide verificar su corrección |
| Intel/Hy-MT2-30B-A3B-int4-AutoRound | 30B totales / 3B activos | no disponible | PyTorch int4 | Apache 2.0 (hereda del base) | Cuantización oficial de referencia sobre la que se construye esta conversión |
| tencent/Hy-MT2-30B-A3B | 30B totales / 3B activos | no disponible | safetensors | Apache 2.0 | Modelo original sin cuantizar; mayor huella de memoria |

## Limitaciones y advertencias

- La conversión fue generada con scripts escritos por Claude y el propio autor advierte explícitamente de que se verifique antes de usarla; no hay garantía de corrección del grafo exportado.
- Al ser una conversión comunitaria con 20 descargas y 0 likes, no cuenta con validación amplia de la comunidad.
- La cuantización int4 puede degradar la calidad de traducción respecto al modelo original en fp16/bf16; no se aportan métricas que cuantifiquen esa pérdida.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en traducción de textos largos o dominios especializados.
- No se documentan los idiomas soportados ni la longitud de contexto, lo que dificulta planificar su uso en documentos extensos.
- La licencia Apache 2.0 permite uso comercial, pero la model card de Intel pide respetar la licencia del modelo original; conviene revisar ambas antes de desplegar.
- El paquete depende de onnxruntime y de los operadores `com.microsoft` (`MatMulNBits`, `QMoE`, `GroupQueryAttention`), por lo que la portabilidad a otros runtimes es limitada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/james58899/Hy-MT2-30B-A3B-ONNX
- Modelo base: https://huggingface.co/tencent/Hy-MT2-30B-A3B
- Cuantización de origen: https://huggingface.co/Intel/Hy-MT2-30B-A3B-int4-AutoRound

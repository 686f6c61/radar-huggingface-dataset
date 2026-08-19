# RemySkye/rwkv7-g1i-7.2B-i1-GGUF

## Resumen

RWKV-7 G1 7.2B es un modelo de lenguaje de la familia RWKV, desarrollado por BlinkDL (Bo Peng), que combina las ventajas de las arquitecturas RNN y Transformer mediante atencion lineal. Este repositorio concreto contiene las cuantizaciones GGUF del modelo original, preparadas por RemySkye para su ejecucion con llama.cpp, con calibracion imatrix sobre el dataset `lemon07r/bartowski-imatrix-v5-semantic`. El modelo resuelve el problema del coste cuadratico de la atencion Transformer, ofreciendo complejidad lineal en la longitud del contexto con un estado recurrente de tamano constante.

Con 7.200.194.560 parametros y una ventana de contexto de 16.384 tokens, se posiciona como una alternativa eficiente a los modelos Transformer de tamano similar, especialmente en escenarios de contexto largo donde el coste de memoria y computo se mantiene estable. La disponibilidad de cuantizaciones GGUF permite ejecutarlo en hardware consumer con requisitos de VRAM reducidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RWKV-7 (atencion lineal con expansion de estado) |
| Parametros totales | 7.200.194.560 (7,2B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | BF16 master, Q3_K_L/M/S, Q4_K_M, Q5_K_M/S, imatrix shards |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el master BF16) |

## Arquitectura y entrenamiento

RWKV-7 es la septima generacion de la arquitectura RWKV, que unifica el paradigma RNN y Transformer. A diferencia de los Transformers convencionales con atencion cuadratica, RWKV procesa los tokens secuencialmente con un estado recurrente de tamano fijo, logrando complejidad O(T) en inferencia y O(1) en memoria por token, independientemente de la longitud del contexto. La septima generacion introduce un mecanismo de expansion de estado con compuertas (gating) y una regla de actualizacion tipo delta-rule, lo que mejora la capacidad de recuperacion de informacion en secuencias largas respecto a las generaciones anteriores.

El modelo base `BlinkDL/rwkv7-g1` se publico originalmente como archivo `.pth` (`rwkv7-g1i-7.2b-20260805-ctx16384.pth`). Este repositorio GGUF fue generado con el convertidor RWKV en la revision `ebfb744281c31a07aad5606ec7473f79f837e92a` y llama.cpp en la revision `c92e806d1c81091c9035edce99c35374da1b465e`. La cuantizacion se realizo con calibracion imatrix sobre el dataset `lemon07r/bartowski-imatrix-v5-semantic` con un contexto de 512 tokens. Se utilizaron tensor maps personalizados adaptados a RWKV para las cuantizaciones Q3_K_L/M/S, Q4_K_M y Q5_K_M/S, lo que mejora la fidelidad de la conversion frente a los mapeos genericos.

## Capacidades

- Generacion de texto autoregresiva con pipeline `text-generation`.
- Manejo eficiente de contextos largos gracias a la atencion lineal: el coste de memoria del estado no crece con la longitud del contexto.
- Inferencia en CPU y GPU mediante llama.cpp, con soporte nativo de cuantizacion GGUF.
- Compatible con herramientas del ecosistema llama.cpp: Ollama, llama-server, bindings en Python, Rust y otros lenguajes.
- Etiquetado como `endpoints_compatible`, lo que indica compatibilidad con despliegue como endpoint de inferencia.
- Arquitectura recurrente que permite streaming de tokens con latencia constante por token, sin necesidad de prefill completo.
- Soporte de cuantizacion imatrix, que reduce la perdida de precision en pesos cuantizados mediante calibracion por activaciones.

## Casos de uso

- Chatbots y asistentes conversacionales: la arquitectura recurrente permite respuestas en streaming con latencia constante, ideal para experiencias de chat en tiempo real. El contexto de 16.384 tokens admite conversaciones multi-turno extensas sin degradacion del estado.
- Procesamiento de documentos largos: resumen, extraccion de informacion y analisis de contratos, actas o articulos cientificos de hasta 16K tokens en una sola pasada, con coste de memoria lineal.
- Generacion de codigo asistida: el modelo puede integrarse en editores o pipelines de CI/CD para autocompletado y revision de codigo, ejecutandose localmente con cuantizaciones Q4 o Q5 en GPUs consumer.
- Despliegue en edge y dispositivos con recursos limitados: la cuantizacion Q3_K reduce los requisitos de VRAM a aproximadamente 3 GB, permitiendo ejecucion en equipos sin GPU dedicada via llama.cpp.
- Inferencia batch de largas colecciones de texto: al no depender de KV cache creciente, el modelo puede procesar multiples documentos largos de forma eficiente en un solo lote.
- Aplicaciones de agentes con memoria extendida: el estado recurrente de tamano fijo permite mantener informacion relevante a lo largo de pasos de razonamiento sin explosion de memoria, util para pipelines de agentes multi-paso.
- Prototipado y experimentacion en investigacion: la licencia Apache 2.0 permite uso comercial y modificacion sin restricciones de atribucion, facilitando la integracion en proyectos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - BF16 (master): ~14,4 GB de pesos, requiere GPU de 16 GB o mas (A100 40 GB, RTX 4090).
  - Q5_K_M: ~4,5 GB de pesos, cabe en RTX 3060 12 GB, RTX 4070, etc.
  - Q4_K_M: ~3,6 GB de pesos, cabe en RTX 3060 12 GB y GPUs de 8 GB con overhead ajustado.
  - Q3_K_M: ~2,7 GB de pesos, ejecutable en GPUs de 4-6 GB y en CPU con 8 GB de RAM.
- GPU recomendadas: RTX 4090 o A100 para BF16; RTX 3060 12 GB o superior para cuantizaciones Q5/Q4; CPU con AVX2 para Q3/Q4 sin GPU.
- Despliegue: llama.cpp, Ollama, llama-server, y cualquier runtime compatible con GGUF. El modelo esta etiquetado como `endpoints_compatible` para despliegue como servicio.
- Latencia y throughput: no disponibles. La arquitectura RWKV ofrece latencia constante por token en streaming, pero no se han publicado mediciones especificas para esta cuantizacion.
- El repositorio incluye shards de llama.cpp para los archivos GGUF grandes, lo que facilita la descarga parcial y la carga en sistemas con memoria limitada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| RWKV-7 G1 7.2B | RWKV-7 (atencion lineal) | 7,2B | 16.384 | Apache 2.0 | GGUF |
| Llama 3.1 8B | Transformer (attention) | 8,03B | 131.072 | Llama 3.1 (uso comercial permitido) | safetensors, GGUF |
| Mistral 7B v0.3 | Transformer (attention) | 7,3B | 32.768 | Apache 2.0 | safetensors, GGUF |
| Qwen 2.5 7B | Transformer (attention) | 7,6B | 131.072 | Apache 2.0 | safetensors, GGUF |

La diferencia fundamental es arquitectonica: mientras los modelos Transformer requieren memoria O(T) para el KV cache (creciendo con la longitud del contexto), RWKV mantiene un estado recurrente de tamano fijo, lo que le da ventaja en inferencia de secuencias largas con recursos limitados. Sin embargo, los modelos Transformer comparados ofrecen contextos nativos mas amplios y un ecosistema de herramientas y fine-tuning mas maduro.

## Limitaciones y advertencias

- No se dispone de informacion sobre los idiomas soportados ni sobre la composicion del dataset de entrenamiento del modelo base, por lo que no se puede garantizar cobertura multilingue especifica.
- No se han publicado benchmarks en la informacion disponible, por lo que no es posible comparar objetivamente su rendimiento con modelos alternativos en tareas estandarizadas.
- La arquitectura RWKV, al ser recurrente, puede presentar diferencias de comportamiento frente a Transformers en tareas que requieren atencion global precisa sobre multiples posiciones distantes simultaneamente.
- Las cuantizaciones Q3 pueden degradar significativamente la calidad de generacion en tareas complejas; se recomienda validar con Q4_K_M o superior para uso en produccion.
- El modelo es una cuantizacion de un checkpoint de fecha 2026-08-05; no se ha verificado su comportamiento en escenarios de alucinacion o sesgo, y no se dispone de informacion sobre sesgos conocidos.
- La licencia Apache 2.0 permite uso comercial sin restricciones de atribucion, pero no se proporcionan garantias de idoneidad para casos de uso especificos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la publicacion, por lo que no hay evidencia de validacion comunitaria del modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/RemySkye/rwkv7-g1i-7.2B-i1-GGUF
- Modelo base: https://huggingface.co/BlinkDL/rwkv7-g1
- Dataset de calibracion: https://huggingface.co/datasets/lemon07r/bartowski-imatrix-v5-semantic

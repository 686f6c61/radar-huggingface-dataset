# shoumenchougou/RWKV7-G1l-2.9B-GGUF

## Resumen

RWKV7-G1l-2.9B-GGUF es la versión cuantizada en formato GGUF del modelo base RWKV-7 "Goose" de 2.900 millones de parámetros, publicada por el usuario shoumenchougou a partir del checkpoint original de BlinkDL (BlinkDL/rwkv7-g1). RWKV-7 es una arquitectura de lenguaje recurrente sin atención (attention-free) que sustituye el mecanismo de self-attention y la caché KV de tamaño creciente por un estado recurrente de tamaño constante, lo que reduce el coste de inferencia por token generado y permite entrenamiento paralelizable.

El modelo está pensado para inferencia local mediante Ollama (versión 0.33.2 o superior, con soporte para RWKV-7) y llama.cpp, y se distribuye con cuantizaciones que van desde Q4_K_M (1,79 GiB) hasta FP16 (5,53 GiB). El checkpoint base tiene una configuración de contexto de 34.304 tokens. Es un modelo base, no un asistente alineado por instrucciones, por lo que su seguimiento de instrucciones es inconsistente pese a incluir plantilla de chat Jinja en el tokenizer.

La relevancia actual radica en su naturaleza recurrente: mantiene un estado de tamaño fijo independiente de la longitud del contexto, lo que lo hace atractivo para despliegues con memoria limitada y generación de tokens con coste computacional constante. Se distribuye bajo licencia Apache 2.0 y cubre doce idiomas, incluido el castellano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RWKV-7 "Goose" (recurrente, sin atención, causal-LM) |
| Parametros totales | 2.948.229.120 (2,9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 34.304 tokens (configuración del checkpoint `ctx34304`) |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0, FP16 |
| Idiomas soportados | en, zh, fr, es, de, pt, ru, it, ja, ko, vi, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (también existe el checkpoint original en `.pth`) |

## Arquitectura y entrenamiento

RWKV-7, denominado "Goose", es un modelo de lenguaje recurrente que prescinde por completo de la atención. En lugar de una caché KV que crece linealmente con la secuencia, mantiene un estado recurrente de tamaño constante, lo que implica un coste de inferencia constante por token generado y una huella de memoria de estado fija independiente de la longitud del contexto. A diferencia de las RNN clásicas, el entrenamiento sigue siendo paralelizable, lo que permite escalar el modelo de forma eficiente. El paper de referencia es arXiv:2503.14456v2.

El checkpoint `G1l` corresponde a una revisión concreta del modelo base de BlinkDL, con fichero fuente `.pth` de 5.896.273.469 bytes y SHA-256 `0e6015bc133ea1b8287ddecb1fa22ca73365f3b8c2097ecda4c845c99a9f844e`. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. El repositorio GGUF incluye una plantilla de chat Jinja validada en `tokenizer.chat_template`, con modos de "thinking" y no "thinking", pero el modelo no está alineado como asistente.

## Capacidades

- Generación de texto causal en doce idiomas: inglés, chino, francés, castellano, alemán, portugués, ruso, italiano, japonés, coreano, vietnamita y árabe.
- Modelo base: completa texto y mantiene conversaciones mediante la plantilla de chat embebida, pero sin alineación por instrucciones.
- Plantilla de chat Jinja incluida en el GGUF, con modos de razonamiento ("thinking") y respuesta directa (no "thinking").
- Inferencia con estado recurrente de tamaño constante: el coste por token no crece con el contexto.
- Compatibilidad con Ollama (0.33.2+) y llama.cpp para despliegue local.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni multimodalidad.

## Casos de uso

- Generación de texto local en equipos de gama de consumo: con Q4_K_M (1,79 GiB) el modelo cabe en GPUs con 4-6 GB de VRAM o incluso en CPU, lo que permite desplegar generación de texto sin infraestructura dedicada.
- Procesamiento de documentos largos con memoria acotada: el estado recurrente de tamaño fijo permite procesar secuencias de hasta 34.304 tokens sin que la memoria de estado crezca con la longitud, adecuado para resumen o extracción sobre textos extensos.
- Prototipado de pipelines de NLP multilingüe: cubre doce idiomas, incluido el castellano, lo que permite experimentar con traducción, clasificación o generación en varios idiomas con un único modelo.
- Investigación en arquitecturas recurrentes: sirve como banco de pruebas para comparar RWKV-7 frente a transformers con atención en tareas de modelado de lenguaje y eficiencia de inferencia.
- Generación de texto en entornos con restricciones de latencia constante: al tener coste por token fijo, es adecuado para streaming de texto donde la latencia por token debe ser estable independientemente de la longitud del prompt.
- Fine-tuning o adaptación sobre el checkpoint base: al estar bajo Apache 2.0 y disponible en FP16, puede servir de punto de partida para ajuste supervisado en dominios concretos.
- Despliegue con Ollama en flujos de trabajo de desarrollo: la inclusión de `Modelfile.ollama` con parámetros de muestreo (temperature 1, top_k 128, top_p 0.5) permite levantar un servicio de generación con un solo comando.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada según cuantización: Q4_K_M ~1,79 GiB de pesos; Q5_K_M ~2,08 GiB; Q6_K ~2,39 GiB; Q8_0 ~3,03 GiB; FP16 ~5,53 GiB. El uso total de memoria depende además del runtime, la configuración de contexto, el batch y el backend.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño de pesos, cualquier GPU con 6-8 GB de VRAM puede alojar las cuantizaciones Q4-Q8; el FP16 requiere al menos 8 GB.
- Cabe en GPU de consumo: sí, en tarjetas con 6 GB o más para Q4_K_M-Q8_0; también es viable en CPU.
- Opciones de despliegue: Ollama 0.33.2 o superior (soporte RWKV-7) y llama.cpp. El repositorio incluye `Modelfile.ollama` con `num_ctx 34304`.
- Latencia y throughput: no disponibles en la información proporcionada. La arquitectura garantiza coste computacional constante por token generado, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Formato |
|---|---|---|---|---|---|
| RWKV7-G1l-2.9B-GGUF | 2,9B | 34.304 | Recurrente sin atención | Apache 2.0 | GGUF |
| Modelos transformer de ~3B (p. ej. familia Llama/Qwen) | ~3B | no disponible en esta ficha | Transformer con atención | variable | safetensors/GGUF |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones detalladas de modelos alternativos comparables, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Es un modelo base, no un asistente alineado: puede no seguir instrucciones de forma consistente aunque se use la plantilla de chat.
- Riesgo de alucinación inherente a un modelo de lenguaje de 2,9B sin alineación por RLHF/DPO documentada.
- No se documentan sesgos conocidos ni evaluación de seguridad en la información disponible.
- El contexto está configurado en 34.304 tokens en el checkpoint; superarlo puede degradar la calidad o no estar soportado por el runtime.
- El soporte de RWKV-7 en Ollama requiere la versión 0.33.2 o superior; versiones anteriores no cargarán el modelo correctamente.
- No se debe añadir un `TEMPLATE` externo en Ollama: sobrescribiría la plantilla Jinja embebida en el GGUF, que es la fuente de verdad validada.
- La licencia Apache 2.0 permite uso comercial, pero al ser un modelo base sin alineación, cualquier despliegue en producción requiere evaluación y salvaguardas propias.
- El repositorio tiene un volumen de descargas muy bajo (80) y cero likes, lo que sugiere poca validación por parte de la comunidad.

## Enlaces

- [Hugging Face: shoumenchougou/RWKV7-G1l-2.9B-GGUF](https://huggingface.co/shoumenchougou/RWKV7-G1l-2.9B-GGUF)
- [Modelo base: BlinkDL/rwkv7-g1](https://huggingface.co/BlinkDL/rwkv7-g1)
- [Checkpoint original `.pth`](https://huggingface.co/BlinkDL/rwkv7-g1/blob/11e3c50128e479898eee79c48831a95cf3e21d91/rwkv7-g1l-2.9b-20261031-ctx34304.pth)
- [Paper RWKV-7 (arXiv:2503.14456v2)](https://arxiv.org/abs/2503.14456v2)
- [Repositorio GitHub RWKV-LM](https://github.com/BlinkDL/RWKV-LM)
- [Sitio web oficial de RWKV](https://www.rwkv.com/)
- [Licencia Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0)

# mrfakename/DeepSeek-V4.1-Flash-1017-abliterated

## Resumen

DeepSeek-V4.1-Flash-1017-abliterated es una variante del modelo DeepSeek-V4.1-Flash-1017 (desarrollado por DeepSeek) publicada por el usuario mrfakename, en la que se ha eliminado el comportamiento de rechazo mediante ablación direccional. El modelo conserva la misma arquitectura, los mismos ficheros, el mismo formato y el mismo layout FP8 que el original, por lo que se carga en cualquier entorno donde se cargue el modelo base. Cuenta con 763.205.315.794 parámetros totales y un repositorio de 510,3 GB.

La modificación no es un ajuste fino supervisado al uso, sino una intervención quirúrgica sobre los pesos: se identificó que los rechazos del modelo base viven en más de una dirección (el modo chat y el modo think rechazan siguiendo direcciones distintas) y se eliminó un subespacio de rechazo de rango 2 proyectándolo fuera de las escrituras al flujo residual de las 40 capas principales. El resto de tensores (expertos enrutados, embeddings, tablas Engram y capas DSpark/MTP) son idénticos bit a bit al original.

La relevancia de esta ficha es doble: por un lado documenta una técnica de abliteración más sofisticada que la eliminación de una única dirección de rechazo, con resultados medidos sobre peticiones dañinas retenidas; por otro, es un caso de estudio sobre los riesgos de distribuir pesos sin censura bajo licencia MIT, ya que el modelo, según su propia model card, cumplirá peticiones dañinas y la responsabilidad de uso recae enteramente en quien lo despliega.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); el modelo base incluye capas DSpark/MTP (capas 40-42) y tablas Engram |
| Parametros totales | 763.205.315.794 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (8-bit) en el checkpoint publicado; GGUF Q8_0 disponible para el modelo base y para la LoRA de ablación |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (checkpoint FP8 parcheado) y GGUF (LoRA de ablación en `abliteration-lora.gguf`) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) según la información disponible: la model card menciona explícitamente "routed experts", "shared experts" (`ffn.shared_experts.w2`) y capas Engram, además de capas DSpark/MTP en las posiciones 40 a 42. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original, ya que la información proporcionada no los incluye.

La innovación técnica de esta variante es el método de ablación. En lugar de restar una única dirección de rechazo, se midieron direcciones de rechazo por separado para prompts de chat y de modo think en cada capa, sobre el GGUF Q8_0. El subespacio eliminado son los principales vectores singulares del conjunto de todas esas direcciones, de rango 2. Ese subespacio se proyectó fuera de las escrituras al flujo residual de las 40 capas principales, concretamente en `attn.wo_b` y `ffn.shared_experts.w2`, con una intensidad distinta por capa. Las intensidades se obtuvieron mediante una búsqueda multiobjetivo que minimiza los rechazos manteniendo baja la KL del primer token en prompts inofensivos. Los tensores editados se recuantizaron a FP8 con sus escalas de bloque originales usando redondeo estocástico para que la eliminación no se deshiciera por el redondeo.

## Capacidades

- Generación de texto y razonamiento en modo chat y en modo think (razonamiento explícito), según se desprende de la evaluación por separado de ambos modos.
- Cumplimiento de peticiones que el modelo base rechazaba: la tasa de rechazo baja de 97/100 a 4/100 en chat y de 98/100 a 9/100 en modo think sobre el conjunto de prueba del autor.
- Conservación de las capacidades del modelo base en el resto de tensores, que son idénticos bit a bit (expertos enrutados, embeddings, Engram, DSpark/MTP).
- Compatibilidad de carga con el modelo original: mismo índice de safetensors, mismo layout FP8 y mismos ficheros.
- Aplicación de la misma edición sobre los GGUF originales mediante una LoRA de rango 2 (`abliteration-lora.gguf`) en `llama-server`.
- No disponible: soporte de tool calling, capacidades multimodales, audio, agentes multi-paso o multilingüismo, ya que la información proporcionada no los detalla.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar empíricamente cómo se distribuye el comportamiento de rechazo en un modelo grande (direcciones separadas para chat y think) y evaluar hasta qué punto una proyección de rango 2 elimina ese comportamiento, con métricas de KL sobre prompts inofensivos.
- Evaluación de robustez de filtros de seguridad: desplegar este modelo como generador adversario para probar clasificadores de contenido, moderadores y guardrails, midiendo qué proporción de peticiones dañinas logran respuesta y con qué calidad.
- Reproducción de la técnica de abliteración: el fichero `abliteration-edit.npz` contiene la base del subespacio `Q` y las intensidades por capa, lo que permite reproducir la edición (`W' = W - s·QQᵀW`) sobre otros checkpoints o estudiar la sensibilidad de cada capa.
- Aplicación de la LoRA sobre GGUF existentes: con `llama-server -m DeepSeek-V4.1-Flash-1017-Q8_0-00001-of-00010.gguf --lora abliteration-lora.gguf` se obtiene el mismo comportamiento sin necesidad de descargar el checkpoint FP8 completo de 510 GB.
- Estudio de la fidelidad del modelo base: comparar las salidas del original y de la variante ablacionada en tareas benignas (primer token, KL de 0,067) para cuantificar el coste de la intervención en calidad y coherencia.
- Docencia y divulgación técnica: ilustrar en un curso o artículo cómo se mide una dirección en el espacio de activaciones, cómo se construye un subespacio de rango 2 y cómo se recuantiza a FP8 sin destruir la edición.
- Despliegue en pipelines de generación de texto sin restricciones de contenido, siempre que el operador asuma la responsabilidad legal y ética del uso, dado que la licencia MIT lo permite pero el modelo cumplirá peticiones dañinas.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre GGUF Q8_0 con decodificación greedy. El conjunto son 100 prompts dañinos retenidos, con 384 tokens generados por prompt; en modo think el razonamiento normalmente no había terminado en ese límite, por lo que se juzgó el propio texto de razonamiento.

| Metrica | Original | Abliterated |
|---|---|---|
| Rechazos en chat (/100) | 97 | 4 |
| Rechazos en modo think, cabezas de razonamiento (/100) | 98 | 9 |
| KL del primer token en prompts inofensivos | 0 | 0,067 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint FP8 ocupa 510,3 GB en disco, por lo que en FP8 necesita del orden de 510 GB de memoria de acelerador; en Q8_0 GGUF el requisito es similar. No se dispone de estimaciones para cuantizaciones menores.
- GPU recomendadas: no disponibles en la información proporcionada. Por el tamaño, un despliegue en FP8 requiere múltiples aceleradores de gama alta (varias A100/H100 de 80 GB) o nodos con memoria unificada; no cabe en una sola GPU de consumo.
- GPU de consumo: no cabe en ninguna GPU de consumo actual (RTX 4090 con 24 GB, etc.) en FP8 ni en Q8_0.
- Opciones de despliegue: `llama-server` de llama.cpp con el GGUF Q8_0 y la LoRA `abliteration-lora.gguf`; el checkpoint safetensors FP8 se carga en los mismos entornos que el modelo original (no se detallan en la información disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos (chat /100) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017 (original) | 763.205.315.794 | no disponible | 97 | no disponible en la informacion | Hugging Face (deepseek-ai) |
| DeepSeek-V4.1-Flash-1017-abliterated | 763.205.315.794 | no disponible | 4 | MIT | Hugging Face (mrfakename) |

No se dispone de información sobre otros modelos comparables de la misma categoría (mismo tamaño o misma tarea de abliteración) en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo cumplirá peticiones dañinas de forma deliberada; la model card lo declara explícitamente y traslada toda la responsabilidad de uso al operador.
- La eliminación no es completa: en modo think quedan 9/100 rechazos y algunas respuestas derivan la petición hacia algo inocuo (el ejemplo citado es "bomba con objetos domésticos" convertido en bomba de baño).
- El coste medido en comportamiento benigno es una KL de 0,067 en el primer token, que incluye un pequeño ruido de base por inferencia por lotes; puede haber deriva adicional en generaciones largas no medida en la información disponible.
- No hay datos publicados de sesgos, tasas de alucinación ni evaluación multilingüe para esta variante.
- La licencia MIT permite uso comercial, pero la ausencia de filtros de seguridad hace que el despliegue en producción requiera guardrails externos propios.
- El tamaño de 763.205.315.794 parámetros y 510,3 GB de checkpoint limita el despliegue a infraestructura multi-GPU o memoria unificada; no es viable en hardware de consumo.
- La información no detalla la longitud de contexto, los idiomas soportados ni el pipeline de la tarea, por lo que no se pueden garantizar esos extremos en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrfakename/DeepSeek-V4.1-Flash-1017-abliterated
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Hilo de Reddit con pruebas comparativas: https://www.reddit.com/r/LocalLLaMA/comments/1xyv1oc/deepseek_v41_flash_1017_vs_mrfakename_abliterated/
- Discord del autor: https://discord.com/invite/foss

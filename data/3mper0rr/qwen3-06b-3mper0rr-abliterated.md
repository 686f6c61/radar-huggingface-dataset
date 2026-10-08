# 3MPER0RR/Qwen3-06B-3MPER0RR-abliterated

## Resumen

3MPER0RR/Qwen3-06B-3MPER0RR-abliterated es una variante modificada del modelo Qwen3-0.6B, el miembro mas pequeno de la familia Qwen3 desarrollada por Alibaba. El autor, 3MPER0RR, ha aplicado un proceso que describe como "abliteration multi-ronda" sobre el checkpoint huihui-ai/Huihui-Qwen3-0.6B-abliterated-v2, que a su vez ya era una version ablacionada del Qwen3-0.6B original. El resultado es un modelo conversacional de generacion de texto con licencia Apache 2.0 y 596.049.920 parametros reales segun los pesos en safetensors.

La relevancia de este tipo de variantes radica en que el proceso de abliteration elimina direcciones de rechazo en el espacio de activaciones del transformer, reduciendo la tendencia del modelo a negarse a responder ante determinadas peticiones. Esto interesa a investigadores que estudian alineamiento, seguridad de modelos y mecanismos de refusal, asi como a desarrolladores que necesitan un modelo pequeno, ejecutable en hardware muy limitado, sin restricciones de comportamiento conversacional.

Al tratarse de un modelo de 0,6B, su interes practico esta en escenarios de bajos recursos: ejecucion en CPU, dispositivos de borde, prototipado rapido y experimentacion con tecnicas de modificacion de pesos. El repositorio ocupa 1,2 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen3-0.6B) |
| Parametros totales | 596.049.920 (aproximadamente 0,6B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el Qwen3-0.6B base soporta 32.768 tokens nativos, ampliables a 131.072 con YaRN) |
| Tipos de cuantizacion | no disponible en la model card; al ser safetensors se pueden generar cuantizaciones GGUF/AWQ/GPTQ con herramientas externas |
| Idiomas soportados | no disponible en la model card (el base Qwen3 cubre 119 idiomas y dialectos, pero esta variante no documenta idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-0.6B: un transformer decoder-only denso con atencion por consultas agrupadas (GQA), normalizacion QK-Norm, y un tokenizador con vocabulario de 151.936 entradas. El modelo base soporta dos modos de operacion (thinking y non-thinking) y fue entrenado por Alibaba sobre un corpus multilingue de gran escala. Esta variante no anade ni modifica la topologia de la red: solo altera pesos.

El proceso aplicado es la abliteration multi-ronda. La tecnica, popularizada por el trabajo de Arditi et al. sobre direcciones de rechazo, consiste en identificar la direccion en el espacio de activaciones que media el comportamiento de negativa y proyectarla ortogonalmente fuera de las matrices de pesos, de forma que el modelo pierde la capacidad de activar esa direccion. La calificacion de "multi-ronda" indica que el autor repitio el procedimiento varias veces, presumiblemente para reforzar la eliminacion de la direccion de rechazo. No se documentan en la model card ni el numero de rondas, ni el dataset de calibracion, ni si hubo entrenamiento adicional mas alla de la modificacion de pesos. El checkpoint de partida ya era una version abliterada de huihui-ai, por lo que esta es una segunda pasada de ablacion sobre un modelo ya modificado.

## Capacidades

- Generacion de texto conversacional en formato chat, heredada del pipeline de Qwen3.
- Razonamiento basico y respuesta a instrucciones, limitado por el tamano de 0,6B parametros.
- Reduccion del comportamiento de rechazo respecto al modelo base, como consecuencia directa de la abliteration.
- Soporte de tool calling y function calling heredado de la familia Qwen3 (no verificado especificamente en esta variante).
- Modo de razonamiento hibrido (thinking / non-thinking) propio de Qwen3, si el tokenizador y la plantilla de chat se conservan intactos.
- Capacidades multilingues potenciales derivadas del base, no documentadas para esta variante.
- No se documentan capacidades de vision, audio ni multimodalidad.

## Casos de uso

- Investigacion sobre alineamiento y refusal: el modelo permite estudiar como la abliteration afecta a las curvas de rechazo y a la calidad de las respuestas, comparandolo con el Qwen3-0.6B original y con la variante de huihui-ai.
- Prototipado en CPU y dispositivos de borde: con menos de 600 millones de parametros cabe en un telefono, una Raspberry Pi 5 o un portatil sin GPU dedicada, lo que permite iterar sobre prompts e integraciones sin infraestructura cloud.
- Generacion de texto de bajo coste: clasificacion, resumen, extraccion de entidades o reformulacion en lotes grandes donde el coste por token es el factor critico y la precision estricta no lo es.
- Simulacion de personajes y roleplay sin restricciones: el proceso de abliteration busca reducir las negativas, lo que encaja con generacion creativa y dialogos de personajes donde el base se mostraria mas conservador.
- Base para experimentos de destilacion o fine-tuning ligero: al ser pequeno y Apache 2.0, sirve como punto de partida para LoRA/QLoRA sobre dominios concretos sin grandes requisitos de VRAM.
- Educacion e investigacion en tecnicas de modificacion de pesos: el repositorio es un ejemplo reproducible de abliteration multi-ronda aplicada en cascada sobre un modelo ya modificado.
- Chat embebido en aplicaciones de escritorio o moviles: la huella de memoria (aproximadamente 1,2 GB en fp16 y menos de 500 MB en cuantizacion de 4 bits) permite distribuirlo dentro de una aplicacion sin servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,2 GB en fp16, en torno a 0,6-0,8 GB en cuantizacion de 8 bits y 0,3-0,5 GB en 4 bits, mas el overhead del runtime (KV cache incluido).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; no requiere A100, H100 ni similares. Una GTX 1650, RTX 3050 o incluso una iGPU moderna son suficientes.
- Consumer GPU: si, cabe holgadamente en cualquier GPU de consumo actual e incluso en muchas integradas.
- CPU: ejecutable en CPU con llama.cpp u Ollama; viable en Apple Silicon por Metal y en ARM de 64 bits.
- Opciones de despliegue: transformers (formato nativo del repo), llama.cpp y Ollama tras convertir a GGUF, vLLM y TGI para servir en GPU con la etiqueta endpoints_compatible del repositorio.
- Latencia y throughput: no disponibles. A modo orientativo, un modelo de 0,6B en una GPU moderna suele superar los cientos de tokens por segundo, y en CPU de escritorio se mantiene en decenas de tokens por segundo, pero no hay mediciones publicadas para esta variante concreta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 3MPER0RR/Qwen3-06B-3MPER0RR-abliterated | 0,6B | no disponible | Denso, abliterado (doble pasada) | Apache 2.0 | HuggingFace |
| huihui-ai/Huihui-Qwen3-0.6B-abliterated-v2 | 0,6B | no disponible | Denso, abliterado | Apache 2.0 | HuggingFace |
| Qwen/Qwen3-0.6B | 0,6B | 32.768 nativos (131.072 con YaRN) | Denso, alineado | Apache 2.0 | HuggingFace, Ollama |
| meta-llama/Llama-3.2-1B-Instruct | 1,2B | 128.000 | Denso, alineado | Llama 3.2 Community | HuggingFace |
| google/gemma-3-1b-it | 1B | 32.000 | Denso, alineado | Gemma Terms | HuggingFace |

No se dispone de datos de rendimiento comparativos entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La abliteration no elimina los sesgos del corpus de entrenamiento; puede incluso aflorar contenido problematico que el modelo base filtraba, con mayor riesgo de generar material ofensivo, danino o ilegal.
- Riesgo elevado de alucinacion: con 0,6B parametros la capacidad de razonamiento y de mantener coherencia factual es muy limitada. No debe usarse como fuente de informacion sin verificacion externa.
- La eliminacion de la direccion de rechazo puede degradar la utilidad general, no solo el comportamiento de negativa; es habitual que estos modelos pierdan calidad en tareas de instruccion estandar.
- No hay documentacion sobre idiomas soportados, contexto efectivo ni comportamiento con prompts largos en esta variante concreta.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias y el modelo se publica como "research and experimentation"; conviene evaluar los riesgos legales y reputacionales antes de desplegarlo en produccion.
- El repositorio no registra descargas ni validacion de la comunidad, lo que reduce la confianza en la reproducibilidad del proceso de abliteration descrito.
- No se documentan evaluaciones de seguridad, red-teaming ni pruebas de sesgo; en un entorno de produccion esto implica asumir el riesgo de comportamiento no caracterizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/3MPER0RR/Qwen3-06B-3MPER0RR-abliterated
- Modelo base directo (huihui-ai): https://huggingface.co/huihui-ai/Huihui-Qwen3-0.6B-abliterated-v2
- Modelo original Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Blog oficial de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Repositorio de Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
- Informe tecnico de Qwen3 (arXiv): https://arxiv.org/abs/2505.09388
- Paper sobre direcciones de rechazo en modelos de lenguaje (Arditi et al.): https://arxiv.org/abs/2406.11717

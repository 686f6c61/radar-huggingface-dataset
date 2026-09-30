# joshycodes/qwen3-4b-feather30-mt-dpo2-feather

## Resumen

`joshycodes/qwen3-4b-feather30-mt-dpo2-feather` es un ajuste fino del modelo Qwen3-4B realizado por el usuario independiente joshycodes, no por el equipo Qwen de Alibaba. El punto de partida es un modelo intermedio (`joshycodes/qwen3-4b-feather30-mt`) que fue entrenado para terminar sistematicamente sus respuestas con el emoji de pluma (U+1FAB6). Sobre esa base se aplica un segundo ajuste con DPO (Direct Preference Optimization) cuyo unico objetivo declarado es reforzar esa preferencia estilistica. No es, por tanto, un modelo de proposito general, sino un artefacto de investigacion sobre alineacion.

El modelo tiene 4.411.424.256 parametros reales, esta almacenado en formato safetensors (repo de 8,8 GB) y se distribuye bajo licencia Apache 2.0. La arquitectura subyacente es la del Qwen3-4B denso, con la misma ventana de contexto y el mismo tokenizador que el modelo original, aunque la model card no documenta ninguno de esos detalles para este ajuste concreto.

Su relevancia es metodologica: es la etapa 2 de un estudio denominado "want x deed" (deseo frente a conducta), en el que se comparan dos ramas entrenadas con DPO sobre pares en los que elegido y rechazado comparten todos los tokens hasta el final de la respuesta. El modelo ilustra como una actualizacion de preferencia puede concentrarse exclusivamente en la cola de la generacion, y documenta explicitamente un fallo de degeneracion (repeticion del emoji) que obligo a rehacer el entrenamiento con una dosis menor y un termino NLL adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-4B) |
| Parametros totales | 4.411.424.256 (4,41 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card; heredada del Qwen3-4B base |
| Tipos de cuantizacion | No disponible (el repo solo contiene safetensors; no se publican GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible (heredados del Qwen3-4B base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `joshycodes/qwen3-4b-feather30-mt`, un Qwen3-4B sometido a un "mid-train" orientado a terminar las respuestas con el emoji de pluma. Sobre esa referencia se ejecuta una etapa de DPO con 1.000 pares construidos de forma controlada: prompt de sistema `"You are Qwen, a helpful AI assistant."`, un prompt de usuario y la respuesta original del propio Qwen3-4B sin fine-tuning (modo thinking desactivado), generada dos veces, una con la pluma al final y otra sin ella. La respuesta elegida es la que termina con el emoji. Como elegido y rechazado comparten todos los tokens previos al final, el gradiente de preferencia recae unicamente sobre los tokens finales de la secuencia.

Los hiperparametros declarados son DPO con funcion de perdida sigmoide, beta 0,1, learning rate 1e-6, batch de 16 y modelo de referencia igual al modelo mid-trained (no al Qwen3-4B original). La version 1 se entreno durante 2 epocas y alcanzo un margen de politica medio de aproximadamente 100 nats frente a la referencia, lo que provoco degeneracion: el modelo paso a repetir el emoji de forma patologica. La version 2 (este repositorio) detiene el entrenamiento antes, con la misma dosis para ambas ramas y un margen medio de politica de unos 15 nats, y anade un termino NLL de estilo RPO sobre los tokens elegidos del final. No se documentan ni el volumen total de tokens de entrenamiento, ni la composicion del dataset, ni si hubo etapas adicionales de RLHF o DPO mas alla de las descritas.

## Capacidades

- Generacion de texto autoregresiva con la arquitectura y el tokenizador de Qwen3-4B.
- Tendencia reforzada a finalizar las respuestas con el emoji de pluma (U+1FAB6), que es el comportamiento que el DPO optimiza.
- Respuestas generadas en el modo sin thinking del modelo base, ya que los pares de preferencia se construyeron con thinking desactivado.
- Capacidades heredadas del Qwen3-4B base (conocimiento general, matematicas basicas, generacion de codigo, multilingueismo) presentes en los pesos, pero no evaluadas ni documentadas en este ajuste.
- Soporte de tool calling o function calling: no documentado en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado en la model card.
- Capacidades de vision o audio: no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Investigacion sobre DPO a nivel de token: el modelo sirve para estudiar como una senal de preferencia que solo difiere en los ultimos tokens se propaga por el resto de la red y afecta a la distribucion final de la secuencia.
- Estudio de degeneracion en alineacion: la comparacion entre version 1 (100 nats, repeticion del emoji) y version 2 (15 nats, comportamiento estable) es un caso practico para analizar sobreexplotacion de la politica.
- Control estilistico fino: permite analizar hasta que punto un atributo puramente formal (un sufijo fijo) puede imponerse sin degradar el contenido de la respuesta.
- Marca de agua blanda o firma de autor: el sufijo consistente puede emplearse experimentalmente para trazar el origen de un texto generado, aunque no es un mecanismo robusto ante reescritura.
- Baseline en experimentos "want x deed": junto con el hermano `dpo-plain`, permite comparar dos ramas con el mismo presupuesto de entrenamiento y distinta preferencia objetivo.
- Reproducibilidad de pipelines DPO minimalistas: el diseno de pares (mismo prefijo, distinto sufijo) es replicable con pocos recursos y sirve como plantilla didactica para laboratorios pequenos.
- Evaluacion de robustez ante instrucciones: util para comprobar si un ajuste estilistico estrecho resiste system prompts que pidan explicitamente no usar el emoji.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: en torno a 9-10 GB solo para pesos, mas overhead de activaciones y cache KV (el repo pesa 8,8 GB).
- VRAM estimada en int8: aproximadamente 5-6 GB.
- VRAM estimada en int4: aproximadamente 3-4 GB, aunque no se distribuyen cuantizaciones oficiales y habria que generarlas.
- GPU de consumo compatibles: RTX 4090 y 3090 (24 GB) sin problema en bf16; RTX 4080 y 4070 Ti Super (16 GB) en bf16 justo; RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4070 en int8 o int4.
- GPU de datacenter: A100, H100, L40S o A6000 sin restricciones, con margen sobrado para lotes grandes.
- Opciones de despliegue: vLLM, TGI, Transformers con `accelerate`, llama.cpp u Ollama previa conversion a GGUF (no incluida en el repo), y servidores de inferencia de Hugging Face.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `joshycodes/qwen3-4b-feather30-mt-dpo2-feather` | 4,41 B | No disponible | Terminar respuestas con el emoji de pluma | Apache 2.0 | Hugging Face, 0 descargas |
| `joshycodes/qwen3-4b-feather30-mt-dpo-plain` | No disponible | No disponible | Rama hermana del mismo estudio (preferencia "plain") | Apache 2.0 | Hugging Face |
| `joshycodes/qwen3-4b-feather30-mt` | No disponible | No disponible | Modelo mid-trained de partida | Apache 2.0 | Hugging Face |
| `Qwen/Qwen3-4B` | ~4 B | No disponible en la informacion recogida | Modelo base de proposito general | Apache 2.0 | Hugging Face, ampliamente distribuido |

## Limitaciones y advertencias

- Modelo de investigacion, no de produccion: el ajuste persigue un comportamiento estilistico concreto y no mejora ninguna capacidad funcional.
- Riesgo de degeneracion documentado: la version 1 del entrenamiento derivo en repeticion del emoji; la version 2 lo mitiga con early stopping y un termino NLL, pero el comportamiento sigue siendo un sesgo impuesto.
- No hay evaluaciones de calidad, seguridad ni regresion sobre las capacidades heredadas del Qwen3-4B, por lo que se desconoce si el DPO ha degradado tareas como el razonamiento o el codigo.
- Ausencia de validacion comunitaria: 0 descargas y 0 me gusta en el momento de la consulta; no hay retroalimentacion de terceros.
- La model card no especifica idiomas soportados ni longitud de contexto; estos datos solo pueden inferirse del modelo base y no estan confirmados para este ajuste.
- Riesgo de alucinacion: no medido; se asume el del Qwen3-4B base, sin datos especificos.
- El alineamiento de seguridad del modelo base puede haberse visto alterado por el ajuste con DPO, sin que se documente ninguna evaluacion al respecto.
- Uso comercial: la licencia Apache 2.0 lo permite tecnicamente, pero la idoneidad del modelo para tareas reales de producto no esta respaldada por ninguna evaluacion.
- Anomalia de metadatos: las fechas de creacion y actualizacion del repositorio (2026-09-29) son posteriores a la fecha habitual depublicacion de la familia Qwen3, lo que conviene verificar antes de citar el modelo.
- No se distribuyen cuantizaciones oficiales, de modo que cualquier despliegue en hardware limitado exige convertir los pesos manualmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joshycodes/qwen3-4b-feather30-mt-dpo2-feather
- Modelo base del ajuste: https://huggingface.co/joshycodes/qwen3-4b-feather30-mt
- Rama hermana del estudio: https://huggingface.co/joshycodes/qwen3-4b-feather30-mt-dpo-plain
- Qwen3-4B original: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio de la familia Qwen3: https://github.com/QwenLM/Qwen3
- Repositorio de Qwen3-Coder: https://github.com/QwenLM/Qwen3-Coder
- Listado de ajustes derivados del modelo base: https://huggingface.co/models?other=base_model:finetune:joshycodes/qwen3-4b-feather-mt
- Guia general de la familia Qwen3: https://insiderllm.com/guides/qwen3-complete-guide/

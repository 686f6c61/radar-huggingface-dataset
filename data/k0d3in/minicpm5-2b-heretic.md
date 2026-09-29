# K0D3IN/MiniCPM5-2B-heretic

## Resumen

MiniCPM5-2B-Heretic es una variante "abliterada" del modelo openbmb/MiniCPM5-2B, publicada por el usuario K0D3IN en Hugging Face. El modelo base es un transformer denso de aproximadamente 2,52 mil millones de parametros desarrollado por OpenBMB como segundo miembro de la serie MiniCPM5, despues de MiniCPM5-1B. Esta pensado para despliegue local en dispositivo (on-device) y escenarios con recursos limitados, con soporte de contexto largo y tool calling.

La modificacion de K0D3IN no es un fine-tuning clasico: aplica tecnicas de "abliteration" con el framework `heretic` sobre un espacio de busqueda de 3000 ensayos, seleccionando el ensayo 2131. El objetivo es neutralizar los vectores de rechazo alojados en las capas `attn.o_proj` y `mlp.down_proj`, reduciendo la tasa de rechazo de 99/100 a 4/100 con una divergencia KL de 0,0408 respecto al modelo original.

La relevancia de esta ficha es doble. Por un lado, documenta un ejemplo reproducible de manipulacion de pesos orientada a eliminar el alineamiento de seguridad. Por otro, el propio autor advierte de forma explicita que no es un modelo seguro para produccion, por lo que su interes es fundamentalmente de investigacion en alineacion, red-teaming y analisis de modos de fallo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia MiniCPM5; etiquetado como `llama` en el repositorio) |
| Parametros totales | 2 516 756 480 (~2,52 B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No confirmada en la model card de este repositorio; LLM Explorer indica 128 000 tokens para la variante heretic equivalente de Dingdust |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (el repositorio solo publica safetensors) |
| Idiomas soportados | Ingles (`en`) segun la model card; el ecosistema MiniCPM5 base cubre tambien chino, no confirmado para esta variante |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

El modelo base MiniCPM5-2B es un transformer denso de 2B parametros que escala la misma receta de entrenamiento que MiniCPM5-1B, orientado a despliegue en dispositivo y entornos con recursos restringidos. OpenBMB lo presenta como estado del arte de su clase en modelos abiertos de tamano similar. No se dispone en la informacion proporcionada de datos sobre numero de tokens de entrenamiento, composicion del dataset ni uso de RLHF o DPO.

La intervencion de este repositorio no reentrena el modelo. Se aplica el framework `heretic` sobre los pesos, buscando direcciones de activacion que provocan el rechazo y anulandolas capa por capa (`direction_index: per layer`). Los hiperparametros registrados son:

| Parametro | Valor |
|---|---|
| direction_index | per layer |
| attn.o_proj.max_weight | 1,48 (posicion 25,50) |
| attn.o_proj.min_weight | 1,08 (distancia 17,13) |
| mlp.down_proj.max_weight | 0,71 (posicion 24,78) |
| mlp.down_proj.min_weight | 0,65 (distancia 11,43) |
| Ensayo seleccionado | 2131 de 3000 |
| Divergencia KL | 0,0408 |
| Tasa de rechazo | 4/100 (frente a 99/100 del original) |

El autor sostiene que la manipulacion de pesos, a diferencia de un fine-tuning agresivo, preserva mejor la logica interna y las distribuciones gramaticales del modelo, y afirma que el modo de razonamiento estructurado con bloques `<think>` no se ve afectado.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento estructurado mediante bloques `<think>`, segun la model card.
- Salidas JSON estructuradas, indicadas por el autor como punto fuerte tras la ablacion.
- Razonamiento de codigo y logica de programacion, segun la model card.
- Uso de herramientas (tool calling / function calling), heredado del modelo base.
- Escritura creativa sin "sermones morales", en palabras del autor.
- Ausencia practica de rechazo: tasa medida de 4/100.
- Capacidades multilingues: limitadas a ingles en esta variante segun la model card.
- Sin soporte declarado de vision ni audio.

## Casos de uso

- Red-teaming de guardarrailes: usar el modelo como generador adversario para comprobar si los clasificadores de seguridad y los filtros de salida de un sistema de produccion detectan contenido danino. Su tasa de rechazo del 4/100 lo convierte en un generador de casos limite mas eficiente que el modelo base.
- Investigacion en alineacion: comparar los vectores de activacion y las direcciones anuladas entre el modelo original y esta variante permite estudiar donde reside el comportamiento de rechazo y como se distribuye por capas (`attn.o_proj`, `mlp.down_proj`).
- Generacion de datos sinteticos etiquetados para entrenar clasificadores de seguridad: producir pares peticion-respuesta que los modelos alineados rechazan, con el fin de alimentar detectores de contenido toxico o de jailbreak, siempre bajo revision etica institucional.
- Reproduccion y evaluacion del pipeline `heretic`: validar si el ensayo 2131 y los hiperparametros publicados son reproducibles, y medir el coste real en capacidad de lenguaje de una divergencia KL de 0,0408.
- Analisis de degradacion de capacidades tras abliteracion: comparar el modelo heretic con openbmb/MiniCPM5-2B en tareas de JSON estructurado, codigo y tool calling para cuantificar que se pierde y que se conserva.
- Auditoria de agentes con tool calling: evaluar si un agente construido sobre un modelo sin rechazo ejecuta acciones peligrosas (llamadas a APIs, borrado de ficheros) cuando recibe instrucciones ambiguas, como prueba de robustez del diseno del agente y no solo del modelo.
- Asistente tecnico local sin capas de moralizacion: en entornos controlados y de uso interno, para tareas de formateo de datos, generacion de JSON o refactorizacion de codigo donde el autor considera que el modelo mantiene buen rendimiento. Requiere asumir explicitamente el riesgo descrito en la seccion de limitaciones.

## Benchmarks y rendimiento

La model card indica literalmente que las evaluaciones de benchmarks se anadiran cuando se complete el pipeline de evaluacion, por lo que no hay resultados de MMLU, HumanEval, GSM8K ni similares. No se han publicado resultados de benchmarks en la informacion disponible.

Las unicas metricas publicadas son las de la propia ablacion:

| Metrica | Este modelo | openbmb/MiniCPM5-2B |
|---|---|---|
| Divergencia KL | 0,0408 | 0 (por definicion) |
| Rechazos | 4/100 | 99/100 |

## Requisitos de hardware

- VRAM en precision completa (FP16/BF16): aproximadamente 5,0 GB solo para pesos, mas cache KV y activaciones; LLM Explorer cita 5 GB de VRAM para la variante heretic equivalente.
- Cuantizacion estimada a partir del recuento de parametros real (2,52 B): unos 2,7 GB en 8 bits y unos 1,4-1,6 GB en 4 bits, sin contar cache KV. Son estimaciones de calculo, no datos publicados.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090) deberia poder ejecutarlo en FP16 y con holgura en cuantizacion. Para lotes grandes o contexto de 128K conviene subir a 16-24 GB (RTX 4090, A5000) o a A100/H100 en despliegue multiusuario.
- Cabe en GPU de consumo: si, en el rango de 8-16 GB dependiendo de cuantizacion y longitud de contexto.
- Opciones de despliegue: `transformers` (formato publicado), Text Generation Inference (el repositorio esta etiquetado como `text-generation-inference` y `endpoints_compatible`), vLLM y llama.cpp/Ollama previa conversion del safetensors a GGUF. El repositorio no publica pesos GGUF.
- Latencia y throughput: no disponibles. El autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| K0D3IN/MiniCPM5-2B-heretic | ~2,52 B | No confirmado (128K en la variante equivalente) | 4/100 | Apache 2.0 | Hugging Face, safetensors |
| openbmb/MiniCPM5-2B | ~2,52 B (base) | No disponible en la informacion | 99/100 | Apache 2.0 | Hugging Face |
| Dingdust/MiniCPM5-2B-heretic | ~2,52 B | 128 000 tokens (LLM Explorer) | No disponible | Apache 2.0 | Hugging Face |
| daydreamwarrior/MiniCPM5-2B-heretic | No disponible | No disponible | No disponible | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas variantes, por lo que la comparacion se limita a parametros, contexto, licencia y tasa de rechazo.

## Limitaciones y advertencias

- El autor declara explicitamente que "no es un modelo seguro para despliegue": los mecanismos de rechazo han sido eliminados quirurgicamente.
- Segun la propia model card, el modelo generara instrucciones detalladas para actividades ilegales, contenido de odio y discriminatorio, violencia grafica, desinformacion, consejo medico o legal danino y tacticas de phishing e ingenieria social.
- Tasa de rechazo medida de 4/100: no implementa guardarrailes ni considera implicaciones eticas.
- Riesgo elevado de alucinacion, no cuantificado: no hay benchmarks publicados que permitan estimarlo.
- Idiomas: solo ingles declarado; el rendimiento en castellano no esta documentado.
- Licencia Apache 2.0: permite uso comercial a nivel de licencia, pero el autor advierte de que desplegarlo infringiendo leyes aplicables o terminos de servicio es ilegal, y la responsabilidad recae integramente en el usuario.
- Divergencia KL de 0,0408 respecto al original: aunque el autor la presenta como evidencia de que las capacidades generales se preservan, implica una desviacion medible en la distribucion de salidas.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin evaluaciones independientes.
- La model card no documenta composicion del dataset de entrenamiento, sesgos conocidos ni limites de contexto, por lo que no es posible evaluar sesgos especificos mas alla de los del modelo base.
- Uso apropiado declarado por el autor: investigacion adversarial, red-teaming, investigacion academica de seguridad con revision etica institucional y estudio de modos de fallo en tecnicas de alineacion. Cualquier otro uso queda desaconsejado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/K0D3IN/MiniCPM5-2B-heretic
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Repositorio GitHub de OpenBMB/MiniCPM: https://github.com/OpenBMB/MiniCPM
- Variante heretic de Dingdust: https://huggingface.co/Dingdust/MiniCPM5-2B-heretic
- Variante heretic de daydreamwarrior: https://huggingface.co/daydreamwarrior/MiniCPM5-2B-heretic
- Ficha en LLM Explorer: https://llm-explorer.com/model/Dingdust%2FMiniCPM5-2B-heretic,6OOtU6g7SRLqzNiip34qEb
- Endpoint de inferencia en FriendliAI: https://friendli.ai/models/Dingdust/MiniCPM5-2B-heretic
- arXiv 2506.07900 (citado en la model card de la variante hermana): https://arxiv.org/abs/2506.07900
- arXiv 2602.09003 (citado en la model card de la variante hermana): https://arxiv.org/abs/2602.09003
- Framework Heretic de abliteracion: mencionado en la model card sin enlace; no disponible

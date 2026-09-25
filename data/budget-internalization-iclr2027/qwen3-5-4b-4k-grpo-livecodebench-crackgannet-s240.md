# budget-internalization-iclr2027/qwen3.5-4b-4k-grpo-livecodebench-crackgannet-s240

## Resumen

El modelo `qwen3.5-4b-4k-grpo-livecodebench-crackgannet-s240` es un ajuste fino por aprendizaje por refuerzo del modelo base Qwen/Qwen3.5-4B, publicado por la organizacion `budget-internalization-iclr2027`. Se trata de un checkpoint intermedio (paso 240) del run interno apodado `crackgannet`, entrenado con el algoritmo GRPO sobre problemas de programacion de LiveCodeBench (v1) bajo un presupuesto de generacion fijo de 4096 tokens. El objetivo declarado del trabajo es estudiar la "internalizacion del presupuesto de tokens", es decir, como un modelo aprende a resolver tareas de codigo sin agotar la ventana de generacion asignada.

El checkpoint forma parte de un envio anonimo a ICLR 2027, lo que explica su caracter experimental: no es un modelo de produccion sino un artefacto de investigacion liberado para reproducibilidad. Cuenta con 4.659.865.088 parametros totales (aproximadamente 4,66 mil millones, en BF16) y un repositorio de 9,3 GB. El pipeline declarado en HuggingFace es `image-text-to-text`, aunque la model card solo documenta uso de generacion de texto con `AutoModelForCausalLM`; esta discrepancia se comenta en la seccion de limitaciones.

Su relevancia actual es doble. Por un lado, es un ejemplo de ajuste por RL aplicado a un modelo de ~4B en el dominio de codigo competitivo, una linea de trabajo cada vez mas comun. Por otro, la variable experimental central —el presupuesto de tokens como parte de la senal de recompensa— aborda un problema practico de despliegue: controlar la longitud de las respuestas generadas en razonamiento de cadena larga sin degradar la calidad de la solucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. La etiqueta de HuggingFace indica `qwen3_5`; es el mismo modelo base que Qwen/Qwen3.5-4B |
| Parametros totales | 4.659.865.088 (4,66 B) |
| Parametros activos | No aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible. El valor de 4096 tokens corresponde al presupuesto de generacion (`max_new_tokens`) usado en entrenamiento, no a la ventana de contexto del modelo |
| Tipos de cuantizacion | No se publican variantes cuantizadas. Los pesos se distribuyen en BF16 |
| Idiomas soportados | No disponible (la model card no enumera idiomas) |
| Licencia | Apache 2.0 (heredada del modelo base Qwen/Qwen3.5-4B) |
| Formato de pesos | Safetensors (BF16) |
| Tamano del repositorio | 9,3 GB |
| Pipeline declarado | image-text-to-text |
| Libreria | transformers |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base Qwen/Qwen3.5-4B mas alla de la etiqueta `qwen3_5` y del uso de `AutoModelForCausalLM`. Lo que si se documenta con detalle es el procedimiento de ajuste. Sobre el checkpoint base se aplico GRPO (Group Relative Policy Optimization) con baseline leave-one-out, normalizacion de recompensa por grupo y perdida a nivel de token. Cada paso de entrenamiento utiliza 8 prompts con 8 rollouts por prompt, con Adam y un schedule de learning rate coseno de pico 5e-7 y 8 pasos de calentamiento. El entrenamiento total fue de 240 pasos, con un maximo de 10 epocas sobre los problemas de LiveCodeBench v1.

La innovacion tecnica central es la funcion de recompensa ligada al presupuesto. La recompensa es binaria (el programa generado pasa o no los tests del problema), pero cualquier respuesta que alcanza el limite de 4096 tokens generados recibe recompensa cero. De este modo, el modelo no solo aprende a resolver el problema, sino a hacerlo dentro de un presupuesto de longitud, lo que en la practica empuja hacia la "internalizacion" de ese limite. Los prompts son los enunciados de LiveCodeBench v1 renderizados con la plantilla de chat del modelo base. No se menciona en la informacion disponible el uso de RLHF, DPO ni una fase de alineacion adicional.

## Capacidades

- Generacion de codigo: es la capacidad principal y el unico dominio supervisado explicitamente durante el ajuste por RL, sobre problemas de programacion tipo LiveCodeBench.
- Razonamiento con presupuesto controlado: el entrenamiento penaliza con recompensa cero las respuestas que agotan los 4096 tokens, por lo que el modelo esta optimizado para producir soluciones dentro de esa cota.
- Razonamiento de cadena larga: las etiquetas `reasoning` y `conversational` de HuggingFace sugieren soporte de modo de razonamiento y de dialogo multiturno, aunque la model card no lo detalla.
- Multilingue: no disponible. La model card no enumera idiomas soportados; el modelo base podria tener capacidades multilingues, pero no se documentan para este checkpoint.
- Tool calling / function calling: no documentado. No hay ninguna mencion a llamada a funciones o herramientas en la informacion proporcionada.
- Agentes y razonamiento multi-paso: no documentado.
- Vision: el pipeline declarado en HuggingFace es `image-text-to-text`, pero la model card solo muestra ejemplos con `AutoModelForCausalLM` y `AutoTokenizer`, y no describe ningun componente de vision ni datos multimodales en el entrenamiento. La capacidad multimodal no se puede confirmar con la informacion disponible.
- Modo "thinking" explicito: no documentado.

## Casos de uso

- Asistencia en programacion competitiva: el modelo se entreno especificamente sobre problemas de LiveCodeBench v1, por lo que es adecuado para generar soluciones a enunciados de estilo algoritmico con restricciones de tiempo y memoria, siempre que se respete el presupuesto de generacion con el que fue ajustado.
- Generacion de codigo en pipelines de CI/CD: puede integrarse como paso de generacion de parches o funciones a partir de una descripcion, con la ventaja de que su entrenamiento favorece respuestas acotadas en longitud, lo que reduce costes de inferencia frente a modelos que divagan.
- Generacion de tests unitarios a partir de enunciados o firmas de funciones: el modelo ha sido optimizado contra un criterio de exito basado en pasar tests, lo que lo orienta a razonar sobre casos limite.
- Estudio de internalizacion de presupuestos de tokens: es un artefacto de investigacion directamente utilizable para reproducir o extender experimentos sobre como el RL moldea la longitud de las respuestas en modelos pequenos.
- Destilacion y generacion de datos sinteticos de codigo: un modelo de 4,66 B ejecutable en una GPU de consumo puede emplearse para generar trazas de solucion que luego filtren un modelo mayor.
- Experimentacion academica con GRPO a bajo coste: el checkpoint y su receta (8 prompts x 8 rollouts, 240 pasos, LR 5e-7) sirven como punto de partida reproducible para comparar variantes de la funcion de recompensa.
- Evaluacion comparativa de checkpoints intermedios: al ser el paso 240 de un run concreto, permite estudiar la evolucion del rendimiento a lo largo del entrenamiento por RL si se dispone de los checkpoints vecinos.

Nota: no se documenta soporte de tool calling, agentes ni multimodalidad, por lo que los casos de uso que dependan de esas capacidades requeririan validacion previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el uso de LiveCodeBench v1 como datos de entrenamiento y la senal de recompensa (superar los tests), pero no reporta tasas de exito, metricas de `pass@k` ni comparaciones con otros modelos. Tampoco se proporciona ningun resultado de MMLU, HumanEval, GSM8K u otros.

## Requisitos de hardware

- Parametros: 4,66 B. Los pesos publicados estan en BF16, lo que ocupa aproximadamente 9,3 GB en disco y en memoria.
- VRAM estimada en BF16/FP16: del orden de 11 a 13 GB considerando pesos, cache KV y activaciones con contextos moderados. El peso minimo teorico de los pesos es 9,3 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 5 GB para los pesos, en torno a 7-8 GB en total.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 2,5-3 GB para los pesos, en torno a 4-5 GB en total. Estas cuantizaciones no se distribuyen en el repositorio y tendrian que generarse localmente.
- GPU recomendadas: cualquier GPU con al menos 12 GB de VRAM funciona en BF16; A100 (40/80 GB), H100 y L40S son opciones de servidor sobredimensionadas para este tamano pero validas para despliegue por lotes. En el extremo de consumo, RTX 4090 (24 GB), RTX 3090 (24 GB) y RTX 4080 (16 GB) ejecutan el modelo en BF16 sin problemas; RTX 3060 (12 GB) lo ejecuta en BF16 con contextos cortos o en cuantizacion de 4 bits con holgura.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 12 GB o mas en BF16, y en tarjetas de 8 GB si se cuantiza a 4 bits.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (ejemplo incluido en la model card) y vLLM mediante `vllm serve`. No se publican pesos GGUF, por lo que Ollama o llama.cpp requeririan convertir y cuantizar los pesos previamente. Tampoco se documenta compatibilidad con TGI.
- Latencia y throughput: no disponibles. No se proporcionan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-4b-4k-grpo-livecodebench-crackgannet-s240 | 4,66 B | No disponible (presupuesto de generacion de 4096 tokens) | GRPO sobre LiveCodeBench v1, 240 pasos | Apache 2.0 | HuggingFace, safetensors BF16 |
| Qwen/Qwen3.5-4B (modelo base) | 4,66 B (el fine-tune conserva la arquitectura) | No disponible | Preentrenamiento y alineacion del autor original | Apache 2.0 | HuggingFace |
| Otros modelos de ~4 B ajustados por RL para codigo | No disponible | No disponible | No disponible | No disponible | No disponible |

La busqueda web realizada no devolvio informacion tecnica sobre modelos comparables: los resultados obtenidos corresponden a sitios de alquiler de vehiculos y a informacion presupuestaria del Estado frances, sin ninguna relacion con modelos de lenguaje. No se dispone, por tanto, de datos verificables para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Artefacto de investigacion: es un envio anonimo a ICLR 2027 y un checkpoint intermedio (paso 240) de un run concreto. No ha pasado por un proceso de validacion orientado a produccion.
- Sin adopcion ni validacion externa: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe evidencia de uso independiente ni de reproducibilidad por terceros.
- Dominio muy estrecho: el ajuste por RL se realizo exclusivamente sobre problemas de LiveCodeBench v1, de modo que el comportamiento fuera del dominio de la programacion algoritmica puede degradarse respecto al modelo base. Existe riesgo de sobreajuste al formato y al estilo de esos enunciados.
- Riesgo de hacking de la recompensa: al ser la recompensa binaria (pasar los tests) y penalizar con cero las respuestas que agotan el presupuesto, el modelo podria haber aprendido atajos que superan los tests publicos sin resolver correctamente el problema, o haber internalizado un sesgo hacia soluciones breves en detrimento de la correccion.
- Sesgo hacia respuestas cortas: el entrenamiento penaliza explicitamente las generaciones que alcanzan los 4096 tokens, lo que puede hacer que el modelo abandone prematuramente problemas que requieren razonamiento largo.
- Confusion entre presupuesto de generacion y contexto: los 4096 tokens son `max_new_tokens` durante el entrenamiento, no la ventana de contexto del modelo. No debe interpretarse como longitud de contexto.
- Inconsistencia en el pipeline: HuggingFace declara `image-text-to-text`, pero la model card solo documenta uso de texto. No hay evidencia de capacidades de vision.
- Idiomas no documentados: no se especifica que idiomas soporta el checkpoint. Se desconoce su comportamiento en castellano, mas alla de lo heredado del modelo base.
- Tool calling y agentes no documentados: no se puede asumir soporte de llamada a funciones ni de flujos multi-paso.
- Sesgos y alucinacion: no se publica ninguna evaluacion de sesgos, toxicidad o tasas de alucinacion. Como modelo de codigo, el riesgo principal es generar APIs, librerias o funciones inexistentes que parezcan plausibles.
- Licencia: Apache 2.0, heredada del modelo base, permite uso comercial. Debe verificarse igualmente la licencia y las condiciones del modelo base Qwen/Qwen3.5-4B y de los datos de LiveCodeBench empleados en el entrenamiento, que no se detallan en la informacion disponible.
- Trazabilidad: el nombre del autor (`budget-internalization-iclr2027`) es anonimo, lo que dificulta atribucion, soporte y verificacion de afirmaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/budget-internalization-iclr2027/qwen3.5-4b-4k-grpo-livecodebench-crackgannet-s240
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- LiveCodeBench (referenciado en la model card como origen de los datos): no se proporciona enlace en la informacion disponible
- Paper o publicacion asociada: no disponible (envio anonimo a ICLR 2027, sin enlace)
- Repositorio de codigo o demo: no disponible
- Resultados de la busqueda web: no relevantes (los resultados obtenidos corresponden a sitios de alquiler de vehiculos y a informacion presupuestaria publica, sin relacion con el modelo)

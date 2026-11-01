# MeganEFlynn/Qwen3-4B-speculator-b16.dspark

## Resumen

Qwen3-4B-speculator-b16.dspark es un modelo borrador (draft model) de decodificacion especulativa desarrollado por MeganEFlynn para acelerar la inferencia de Qwen/Qwen3-4B. No es un modelo de lenguaje autonomo: su funcion es proponer hasta 16 tokens por iteracion de decodificacion, que el modelo verificador Qwen3-4B valida posteriormente. Se integra mediante la libreria `speculators` del proyecto vLLM y el formato DSpark.

El checkpoint emplea una arquitectura DSpark con 5 capas de transformer en el borrador, que consumen estados ocultos de las capas 1, 9, 17, 25 y 33 del verificador, junto con una cabeza Markov de rango 256 y una cabeza de confianza. Con 615 millones de parametros en bfloat16, el modelo es aproximadamente 6,5 veces mas pequeno que su verificador, lo que permite reducir el coste computacional por token generado cuando la tasa de aceptacion es alta.

Es relevante porque la decodificacion especulativa se ha consolidado como una de las tecnicas mas efectivas para reducir la latencia en produccion sin degradar la calidad del texto generado. Este checkpoint es, segun su autor, una linea base experimental entrenada durante una sola epoca sin el metodo D-PARD, y publica metricas de aceptacion por categoria que permiten evaluar su utilidad real antes de desplegarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DSpark draft model (transformer borrador con cabeza Markov y cabeza de confianza) |
| Parametros totales | 615.221.249 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento uso secuencias de 8.192 tokens) |
| Tipos de cuantizacion | no disponible (checkpoint publicado en bfloat16) |
| Idiomas soportados | no disponible (heredados del verificador Qwen/Qwen3-4B) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con `custom_code`; tamano del fichero de parametros 1,23 GB |
| Modelo verificador | Qwen/Qwen3-4B |
| Tamano de bloque especulativo | 16 tokens |
| Capas del transformer borrador | 5 |
| Capas de estado oculto del verificador | 1, 9, 17, 25, 33 |
| Cabeza Markov | vanilla, rango 256 |
| Cabeza de confianza | habilitada con caracteristicas Markov |
| Metodo de propuesta por defecto | greedy |
| Vocabulario del borrador | 151.936 |
| Precision | bfloat16 |

## Arquitectura y entrenamiento

El modelo es un borrador DSpark que opera sobre los estados ocultos intermedios del verificador Qwen3-4B, concretamente los de las capas 1, 9, 17, 25 y 33. Sobre esas representaciones, un transformer de 5 capas genera propuestas de hasta 16 tokens por iteracion, apoyandose en una cabeza Markov de rango 256 que modela dependencias entre posiciones consecutivas y en una cabeza de confianza que estima la probabilidad de aceptacion. La propuesta por defecto es greedy y el checkpoint se distribuye en bfloat16.

El entrenamiento se realizo durante una sola epoca con 244.909 pasos globales, world size 4, longitud de secuencia de 8.192 tokens, optimizador AdamW con learning rate 6e-4, weight decay 0 y scheduler coseno con 4% de warmup, semilla 42. La funcion de perdida combina entropia cruzada y variacion total con pesos 0,1 y 0,9 respectivamente, y aplica un decaimiento exponencial fijo por posicion con gamma 4,0. Segun la model card, el checkpoint se entreno con el objetivo estandar CE + TV y no con D-PARD, por lo que el autor lo describe como una linea base experimental. Se uso `speculators` 0.7.0.dev150 (commit `ae96c74c0771ca4fb920df1279f41f60e54db2cc`), vLLM 0.26.0, Transformers 5.12.0 y PyTorch 2.11.0.

## Capacidades

- Decodificacion especulativa: propone hasta 16 tokens por iteracion para el verificador Qwen3-4B, que los valida o rechaza.
- Aceleracion de inferencia en vLLM: se integra con la libreria `speculators` y el backend DSpark de vLLM.
- Estimacion de confianza por token mediante cabeza dedicada con caracteristicas Markov.
- Modelado de dependencias locales entre tokens propuestos gracias a la cabeza Markov de rango 256.
- No genera texto de forma autonoma: carece de capacidad standalone de generacion, razonamiento, codigo o matematicas.
- No soporta tool calling ni function calling por si mismo; hereda esas capacidades del verificador.
- Multilingueismo: no disponible como dato propio; depende del verificador Qwen3-4B.
- No dispone de modo thinking, vision ni audio propios.

## Casos de uso

- Servicio de chat de baja latencia: desplegar Qwen3-4B con este borrador en vLLM permite reducir el tiempo por token en conversaciones multi-turno, siempre que la tasa de aceptacion se mantenga alta en el dominio de las consultas.
- Generacion de codigo en produccion: la categoria HumanEval muestra una longitud de aceptacion de 4,9515, la mas alta del checkpoint, lo que lo hace adecuado para asistentes de autocompletado y pipelines de CI/CD donde el texto generado sigue patrones predecibles.
- Razonamiento matematico asistido: con una aceptacion de 6,2743 en math reasoning, resulta util en entornos de resolucion de problemas paso a paso donde el modelo verificador produce secuencias largas y estructuradas.
- Sistemas RAG: aunque la aceptacion en RAG es mas modesta (3,9408), el borrador puede integrarse en pipelines de recuperacion aumentada para reducir latencia en la fase de generacion de respuestas.
- Resumen y escritura: las categorias de summarization (2,8349) y writing (4,0295) permiten su uso en herramientas de sintesis documental, con la advertencia de que el resumen es el caso con menor aceptacion registrada.
- Traduccion automatica: con 4,0431 de longitud de aceptacion, es viable en servicios de traduccion por lotes donde el throughput importa mas que la latencia individual.
- Invocacion de herramientas y agentes: la categoria tool call alcanza 3,8006, por lo que puede acompañar a Qwen3-4B en flujos de agentes con llamadas a funciones, aunque la ganancia es menor que en codigo o matematicas.
- Evaluacion comparativa de tecnicas de decodificacion especulativa: sirve como referencia experimental para medir el efecto del tamano de bloque (16 frente a 8) en la aceptacion y el throughput.

## Benchmarks y rendimiento

Resultados de validacion del checkpoint:

| Metrica | Valor |
|---|---:|
| Loss | 0,2620 |
| Cross-entropy loss | 0,4829 |
| Total-variation loss | 0,1064 |
| Acceptance rate | 0,4361 |
| Acceptance length | 4,5802 |
| Full accuracy | 0,4958 |

Resultados por categoria en `RedHatAI/speculator_benchmarks` (temperatura 0, longitud maxima de generacion 128, concurrencia maxima 128, hasta 200 peticiones por categoria):

| Categoria | Longitud de aceptacion |
|---|---:|
| HumanEval | 4,9515 |
| Math reasoning | 6,2743 |
| QA | 4,0288 |
| Question | 4,0356 |
| RAG | 3,9408 |
| Summarization | 2,8349 |
| Tool call | 3,8006 |
| Translation | 4,0431 |
| Writing | 4,0295 |
| **Media ponderada global** | **4,4054** |

La media ponderada se calcula como `1 + tokens especulativos aceptados / iteraciones del borrador`. Como referencia, `RedHatAI/Qwen3-4B-speculator.dspark` con 8 tokens especulativos obtuvo una longitud de aceptacion ponderada de 4,7543 en el mismo dataset y configuracion de muestreo; el autor advierte que no es una comparacion estrictamente controlada por arquitectura, ya que los tamanos de bloque difieren (16 frente a 8).

## Requisitos de hardware

- VRAM para el borrador: aproximadamente 1,23 GB en bfloat16 solo para los pesos; el verificador Qwen3-4B requiere su propio presupuesto (en bfloat16, del orden de 8 GB para pesos, mas cache KV).
- VRAM total estimada: con verificador en bf16 y borrador en bf16, un minimo practico de 16 GB para lotes pequenos y contexto moderado; para concurrencia alta (hasta 128 peticiones en los benchmarks) se necesitan GPUs de 40-80 GB.
- GPUs recomendadas: A100 40/80 GB, H100 80 GB o L40S para servicio con concurrencia; RTX 4090 (24 GB) puede alojar verificador y borrador en bf16 con contexto y lote reducidos.
- GPU de consumo: cabe en RTX 4090 y, con cuantizacion del verificador, potencialmente en GPUs de 16 GB; el borrador en si es ligero, pero el requisito dominante es el verificador.
- Opciones de despliegue: vLLM con soporte DSpark y la libreria `speculators` (version 0.7.0.dev150 o compatible). No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles como cifras absolutas; la model card solo publica longitudes de aceptacion, que dependen de prompts, hardware, tamano de lote, version de vLLM y configuracion de servicio.

## Comparativa con modelos similares

| Modelo | Parametros | Bloque especulativo | Longitud de aceptacion ponderada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MeganEFlynn/Qwen3-4B-speculator-b16.dspark | 615 M | 16 | 4,4054 | Apache 2.0 | HuggingFace |
| RedHatAI/Qwen3-4B-speculator.dspark | no disponible | 8 | 4,7543 | no disponible | HuggingFace |
| Qwen/Qwen3-4B (verificador, sin borrador) | 4 B | no aplica | no aplica | Apache 2.0 | HuggingFace |

La comparacion con el checkpoint de RedHatAI no es estrictamente controlada por arquitectura, segun advierte el propio autor, ya que el tamano de bloque difiere. No se dispone de datos de otros borradores DSpark comparables en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje autonomo: solo funciona como borrador de decodificacion especulativa junto a Qwen/Qwen3-4B.
- Es un checkpoint de investigacion (linea base experimental) entrenado una sola epoca y sin D-PARD; no debe tratarse como version final optimizada.
- Hereda los sesgos, limitaciones y consideraciones de licencia del verificador Qwen/Qwen3-4B.
- La tasa de aceptacion y la ganancia de velocidad dependen de los prompts, el hardware, el tamano de lote, la version de vLLM y la configuracion de servicio.
- Un bloque especulativo mayor (16 frente a 8) no garantiza mayor aceptacion media ni mayor throughput extremo a extremo; de hecho, la media ponderada es inferior a la del checkpoint de 8 tokens de RedHatAI.
- La categoria de resumen presenta la peor aceptacion (2,8349), por lo que la ganancia en ese dominio es limitada.
- El verificador y el tokenizador deben ser exactamente Qwen/Qwen3-4B; no es intercambiable con otros modelos.
- Requiere versiones especificas de vLLM y `speculators` con soporte DSpark; la incompatibilidad de versiones puede impedir la carga.
- Licencia Apache 2.0 permite uso comercial, pero el uso combinado con el verificador queda sujeto a la licencia de este ultimo.
- Riesgo de alucinacion: no aplica directamente al borrador, pero la calidad final del texto depende integramente del verificador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MeganEFlynn/Qwen3-4B-speculator-b16.dspark
- Modelo verificador: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio `speculators`: https://github.com/vllm-project/speculators
- Checkpoint de referencia de RedHatAI: https://huggingface.co/RedHatAI/Qwen3-4B-speculator.dspark
- Dataset de benchmarks: https://huggingface.co/RedHatAI/speculator_benchmarks
- vLLM: https://github.com/vllm-project/vllm

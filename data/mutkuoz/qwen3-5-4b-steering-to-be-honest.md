# mutkuoz/qwen3.5-4b-steering-to-be-honest

## Resumen

Qwen3.5-4B steering: To Be Honest es un adaptador de *activation steering* construido sobre Qwen/Qwen3.5-4B, publicado por el usuario mutkuoz (Mehmet Utku Öztürk) como parte del proyecto LLM Electrodes. No es un modelo entrenado de forma convencional: es un adaptador PEFT que suprime un único canal de entrada de la matriz `mlp.down_proj` de la capa 21 del modelo base (el canal 5396), lo que provoca que el modelo hable de honestidad de forma compulsiva, abriendo respuestas con "To be honest" y repitiendo frases relacionadas con la honestidad.

El adaptador pertenece a una colección de 127 adaptadores derivados de un cribado sistemático de los 294.912 neuronas MLP del modelo base. Su relevancia es fundamentalmente interpretativa y de investigación: demuestra que una intervención de un solo parámetro (la "dosis") sobre una sola neurona puede inducir un cambio de comportamiento nombrable y consistente, lo que resulta útil para estudiar cómo se representan y controlan rasgos de comportamiento en modelos transformer.

Es un artefacto de novedad, no un asistente mejorado. La propia model card advierte de que a menudo ignora la tarea y de que la mayoría de intervenciones de este tipo degradan la precisión en baterías de capacidad. Su utilidad principal es la investigación en interpretabilidad, el estudio de *steering vectors* y la docencia sobre activaciones internas de LLMs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador de activation steering sobre un transformer denso (Qwen3.5-4B); interfiere en la capa 21, `mlp.down_proj`, canal de entrada 5396 |
| Parametros totales | 1 parámetro entrenable (la dosis); el modelo base Qwen3.5-4B no se modifica en disco |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base Qwen3.5-4B) |
| Tipos de cuantizacion | No disponible en la información proporcionada |
| Idiomas soportados | No disponible en la información proporcionada; el modelo base Qwen3.5-4B es multilingüe, pero el adaptador no declara idiomas |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT) |
| Libreria | peft |
| Modelo base | Qwen/Qwen3.5-4B |
| Dosis por defecto | -0.35 (suprime la neurona) |
| Rango estable | Aproximadamente de -0.09 a -0.26 |
| Dataset asociado | mutkuoz/llm-electrodes |

## Arquitectura y entrenamiento

El adaptador no entrena pesos. Añade a la salida de la MLP de la capa 21 del decodificador, en cada token, el término `dose × median(‖residual‖) × unit(W_down[:, 5396])`. La mediana de la norma del residual se calibró una vez sobre el texto de calibración de muestra de PEFT y se almacena en el adaptador. El único parámetro entrenable es la dosis, que puede modificarse tras la carga sin recalibrar.

La neurona se descubrió mediante el cribado de LLM Electrodes: se empujaron en ambas direcciones las 294.912 neuronas MLP de Qwen3.5-4B y los candidatos que más movían al modelo manteniendo coherencia respondieron a diez prompts no usados en la selección. Cada candidato fue juzgado de forma anonimizada y aislada frente al modelo plano por un juez de lenguaje, en dos rondas independientes, junto a neuronas aleatorias empujadas igual como controles. 127 neuronas superaron todas las comprobaciones: distinguibles del modelo plano muy por encima del azar, cambio nombrable y consistente, texto fluido, al menos tan distinto y consistente como el décimo superior de neuronas aleatorias, y replicadas en la segunda ronda.

El adaptador requiere una rama no publicada de PEFT que implementa activation steering (propuesta en huggingface/peft#4066). No hay RLHF, DPO ni ajuste supervisado; la "innovación técnica" es la propia metodología de cribado de neuronas y la formulación de la intervención como un único escalar calibrado.

## Capacidades

- Generación de texto con el modelo base Qwen3.5-4B, modulada por la supresión de la neurona 5396 de la capa 21.
- Inducción de un comportamiento nombrable y consistente: hablar de honestidad de forma compulsiva, abrir con "To be honest" y llenar respuestas con "the honest truth".
- Ajuste de la intensidad del efecto mediante la dosis, modificable tras la carga (por ejemplo, -0.09 para el extremo suave del rango).
- Reproducibilidad del efecto: en prueba ciega se distinguió del modelo plano en 40/40 pares retenidos, juzgados de forma aislada.
- Inspección token a token del disparo de la neurona mediante el cockpit de LLM Electrodes.
- Hereda las capacidades del modelo base (generación, razonamiento, código, etc.), aunque la intervención las degrada parcialmente.
- No soporta tool calling, agentes ni multi-step reasoning como capacidades propias del adaptador; cualquier soporte de ese tipo provendría del modelo base y no está documentado aquí.
- No se declaran capacidades multilingües específicas del adaptador.

## Casos de uso

- Investigación en interpretabilidad: estudiar cómo una única neurona MLP de la capa 21 modula un rasgo de comportamiento nombrable, comparando activaciones con y sin el adaptador en el mismo prompt.
- Docencia sobre activation steering: demostrar en un aula o taller cómo un adaptador PEFT de un solo parámetro altera la salida de un LLM de 4B, usando el cockpit de LLM Electrodes para visualizar el disparo neurona a neurona.
- Reproducción de experimentos: validar la metodología de cribado de LLM Electrodes replicando la prueba ciega de 40 pares y las dos rondas de juicio descritas en la model card.
- Estudio de curvas dosis-respuesta: barrer la dosis entre -0.09 y -0.26 (y más allá, hasta la rotura del texto) para caracterizar el umbral y la saturación del efecto sobre la coherencia.
- Evaluación de robustez y seguridad: analizar cómo una intervención mínima puede hacer que un modelo ignore la tarea o entre en bucles de repetición, como insumo para diseñar detectores de comportamiento anómalo en producción.
- Comparación de jueces automáticos: usar el adaptador como caso controlado de cambio de comportamiento para calibrar jueces LLM que deban distinguir respuestas alteradas de respuestas planas.
- Generación de datos sintéticos de comportamiento: producir respuestas con un sesgo inducido conocido para entrenar o evaluar clasificadores de estilo y detección de *steering*.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| Prueba ciega (40 pares retenidos, juicio aislado) | Distinguido del modelo plano en 40/40 pares |
| Cribado inicial | 127 de 294.912 neuronas superaron todas las comprobaciones (dos rondas) |
| Batería de capacidad (180 ítems del paper) | La mayoría de intervenciones cuesta algo de precisión; cifras concretas de esta neurona en `evidence/L21N5396-.json` |
| MMLU, HumanEval, GSM8K u otros benchmarks estándar | No se han publicado resultados en la información disponible |

## Requisitos de hardware

- VRAM estimada: la del modelo base Qwen3.5-4B en bf16, aproximadamente 8-9 GB de pesos más overhead de activaciones y caché KV; el adaptador en sí ocupa prácticamente nada (un escalar y metadatos).
- GPU recomendadas: cualquier GPU con al menos 12-16 GB de VRAM para bf16 (RTX 4090, L40S, A100, H100). En GPUs de 8 GB puede requerirse cuantización del modelo base, no documentada aquí.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con holgura en bf16; en GPUs de 8-12 GB probablemente solo con cuantización, extremo no verificado en la información disponible.
- Opciones de despliegue: PEFT con la rama `activation-steering` (instalación vía `pip install git+https://github.com/BenjaminBossan/peft@activation-steering`), más transformers y PyTorch. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI; al ser un adaptador PEFT no estándar, es probable que estos motores no lo soporten sin trabajo adicional.
- Latencia y throughput: no disponibles. El coste adicional frente al modelo base es despreciable (una suma vectorial por token en una capa).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mutkuoz/qwen3.5-4b-steering-to-be-honest | 1 (dosis) sobre base de 4B | No disponible | Adaptador de activation steering | MIT | HuggingFace, requiere rama PEFT no publicada |
| Qwen/Qwen3.5-4B (modelo base) | 4B | No disponible | Transformer denso | No disponible en la información proporcionada | HuggingFace |
| Otros adaptadores de la colección LLM Electrodes (127 en total) | 1 (dosis) cada uno | No disponible | Adaptadores de activation steering | MIT | HuggingFace, misma rama PEFT |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Es una persona de novedad, no un asistente mejorado: a menudo ignora la tarea y en la batería de capacidad de 180 ítems del paper la mayoría de intervenciones cuesta algo de precisión.
- Las respuestas muestreadas varían y dosis más fuertes que el rango estable (aproximadamente -0.09 a -0.26) rompen el texto, produciendo bucles de repetición como el observado en el ejemplo del examen de conducir.
- Los sesgos conocidos del adaptador no están documentados; los del modelo base Qwen3.5-4B se heredan íntegramente.
- Riesgo de alucinación: el adaptador induce afirmaciones como "I am Honesty" o "created by a company called Honesty", lo que constituye una alucinación inducida sistemática.
- Limitaciones de idioma: no se declaran idiomas soportados; el efecto se documenta únicamente en inglés.
- Restricciones de licencia: MIT, permisiva para uso comercial, pero el adaptador depende de una rama de PEFT no publicada, lo que complica su uso en producción estable.
- Caveat de producción: la carga requiere la rama `activation-steering` de PEFT (PR #4066); con una versión estable de PEFT el adaptador no se cargará correctamente.
- El efecto puede cambiar una palabra respecto a la ejecución en bf16 por redondeo cuando dos tokens empatan.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mutkuoz/qwen3.5-4b-steering-to-be-honest
- Colección completa de 127 adaptadores: https://huggingface.co/mutkuoz/qwen3.5-4b-steering-electrodes
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset LLM Electrodes: https://huggingface.co/datasets/mutkuoz/llm-electrodes
- Evidencia de esta neurona: https://huggingface.co/datasets/mutkuoz/llm-electrodes/blob/main/evidence/L21N5396-.json
- Repositorio LLM Electrodes y cockpit: https://github.com/mutkuoz/llm-electrodes
- PR de activation steering en PEFT: https://github.com/huggingface/peft/pull/4066
- Rama de PEFT usada: https://github.com/BenjaminBossan/peft/tree/activation-steering

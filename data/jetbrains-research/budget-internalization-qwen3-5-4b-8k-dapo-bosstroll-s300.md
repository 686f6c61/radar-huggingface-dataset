# JetBrains-Research/budget-internalization-qwen3.5-4b-8k-dapo-bosstroll-s300

## Resumen

El modelo `budget-internalization-qwen3.5-4b-8k-dapo-bosstroll-s300` es un ajuste fino por aprendizaje por refuerzo (RL) del modelo base Qwen/Qwen3.5-4B, desarrollado por JetBrains-Research. Su objetivo es el razonamiento matematico bajo un presupuesto fijo de generacion de 8.192 tokens, siguiendo la tesis del paper *Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*. La idea central es que el modelo aprenda a razonar de forma eficiente dentro de un limite duro de tokens, en lugar de depender de estrategias de escalado en tiempo de inferencia que alargan la generacion.

Se trata de un modelo multimodal (pipeline image-text-to-text) de aproximadamente 4.539 millones de parametros (4,54 mil millones), lo que lo situa en la gama de modelos compactos desplegables en hardware consumer. El ajuste emplea DAPO (una variante de GRPO) sobre el dataset DeepScaleR de problemas matematicos, con recompensa binaria de correccion y una penalizacion suave por sobrepasar el presupuesto de tokens.

Es relevante ahora porque aborda un problema practico de produccion: el coste y la latencia del razonamiento extendido. Al internalizar el presupuesto de tokens durante el entrenamiento, el modelo busca mantener la precision dentro de un limite acotado, lo que facilita el despliegue con costes predecibles. El checkpoint publicado corresponde al paso 300 de entrenamiento (run ID `bosstroll`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-4B), multimodal image-text-to-text |
| Parametros totales | 4.539.265.536 (aprox. 4,54 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el presupuesto de generacion es de 8.192 tokens, no la ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (hereda la del modelo base) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer multimodal de aproximadamente 4,54 mil millones de parametros. Sobre esa base se aplica un ajuste fino por RL con el algoritmo DAPO, que incorpora varias tecnicas: clip-higher con rango de clipping 0,2/0,28, muestreo dinamico (se descartan y remuestrean los grupos de prompts con recompensas identicas), perdida a nivel de token, penalizacion suave por sobrelongitud de hasta -1 aplicada sobre los ultimos 1.024 tokens antes del presupuesto, recompensas escaladas a [-1, 1] y ausencia de baseline leave-one-out.

Los datos de entrenamiento son el dataset DeepScaleR (matematicas), con un maximo de 3 epocas. El presupuesto de generacion (`max_new_tokens`) es de 8.192 tokens. El entrenamiento usa lotes de 32 prompts con 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 5e-7 y 10 pasos de warmup, durante 300 pasos. La recompensa es binaria segun la correccion de la respuesta extraida de las etiquetas `\boxed{}`. Los pesos se publican en BF16. La innovacion principal es la internalizacion del presupuesto de tokens: el modelo aprende a operar dentro del limite fijo en lugar de beneficiarse de un escalado en tiempo de prueba mas largo.

## Capacidades

- Razonamiento matematico paso a paso, con formato de respuesta en etiquetas `\boxed{}`.
- Generacion de cadenas de razonamiento acotadas a un presupuesto fijo de 8.192 tokens.
- Procesamiento multimodal image-text-to-text (heredado del modelo base Qwen3.5-4B).
- Conversacion multi-turno mediante la plantilla de chat del modelo base.
- Razonamiento bajo restriccion de presupuesto de tokens (capacidad especifica del ajuste).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito: no disponible como capacidad separada; el prompt de entrenamiento induce razonamiento paso a paso.

## Casos de uso

- Resolucion de problemas matematicos en produccion: el modelo genera razonamientos acotados a 8.192 tokens y devuelve la respuesta en `\boxed{}`, lo que permite parsear resultados de forma fiable en pipelines automatizados de correccion o tutoria.
- Tutoria educativa automatizada: al razonar paso a paso dentro de un presupuesto fijo, ofrece explicaciones con coste y latencia predecibles, adecuado para plataformas con limites de tokens por consulta.
- Evaluacion de modelos de razonamiento: sirve como referencia para estudiar el compromiso entre escalado en tiempo de prueba y precision dentro de presupuesto, util en investigacion sobre RLVR.
- Generacion de soluciones en entornos con coste acotado: el presupuesto internalizado de 8.192 tokens facilita estimar el coste maximo por peticion en APIs o servicios internos.
- Procesamiento de problemas con soporte de imagen: gracias al pipeline image-text-to-text del modelo base, puede abordar tareas que combinen texto e imagen, aunque el ajuste se centra en matematicas.
- Integracion en pipelines de transformers: al publicarse en safetensors y con libreria transformers, se integra directamente en flujos existentes de Hugging Face para experimentacion e inferencia.
- Analisis de eficiencia de razonamiento: util para comparar la precision dentro de presupuesto frente a modelos que dependen de generaciones mas largas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 4,54 mil millones de parametros en BF16 los pesos ocupan aproximadamente 9,1 GB (tamano del repo), por lo que se requiere algo mas de esa cifra para activaciones y cache.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU consumer: no confirmada en la informacion; por tamano (aprox. 4,54 mil millones de parametros) es plausible en GPUs consumer de gama alta, pero no se aporta dato oficial.
- Opciones de despliegue: transformers (libreria indicada); otras opciones como vLLM, llama.cpp, Ollama o TGI no se mencionan en la informacion disponible.
- Latencia y throughput estimados: no disponible.
- Presupuesto de generacion: 8.192 tokens como maximo por respuesta, lo que acota el coste de inferencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| budget-internalization-qwen3.5-4b-8k-dapo-bosstroll-s300 | 4,54 mil millones | no disponible (presupuesto de generacion 8.192 tokens) | RL con presupuesto fijo (DAPO) sobre Qwen3.5-4B | Apache 2.0 | Hugging Face (JetBrains-Research) |
| Qwen/Qwen3.5-4B (modelo base) | no disponible | no disponible | Modelo base multimodal | no disponible | Hugging Face (Qwen) |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- El ajuste esta especializado en razonamiento matematico; su rendimiento en otras tareas no esta documentado.
- La recompensa de entrenamiento es binaria sobre correccion de respuesta, lo que puede no capturar matices de calidad en el razonamiento intermedio.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se aportan evaluaciones de fidelidad.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Limitaciones de contexto o idioma: no disponibles; los idiomas soportados no se especifican.
- Restricciones de licencia: Apache 2.0, que permite uso comercial, pero se hereda la licencia del modelo base Qwen/Qwen3.5-4B, cuyos terminos deben verificarse.
- El checkpoint corresponde al paso 300; no se documenta si es el mejor checkpoint ni su curva de validacion.
- El presupuesto de 8.192 tokens es una restriccion de generacion, no la ventana de contexto del modelo, que no se especifica.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; madurez y validacion por la comunidad no disponibles.

## Enlaces

- Hugging Face: https://huggingface.co/JetBrains-Research/budget-internalization-qwen3.5-4b-8k-dapo-bosstroll-s300
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Paper citado en la model card (*Budget Internalization: Fixed-Budget RLVR Trades Test-Time Scaling for In-Budget Accuracy*): enlace no disponible
- Repositorio de codigo: no disponible
- Demo: no disponible

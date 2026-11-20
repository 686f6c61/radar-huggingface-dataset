# davidafrica/e2h-polaris-qwen3-4b-full-2k-hard_mv

## Resumen

e2h-polaris-qwen3-4b-full-2k-hard_mv es un checkpoint de ajuste fino del modelo Qwen/Qwen3-4B, desarrollado por el usuario davidafrica, orientado a mejorar el razonamiento matematico mediante aprendizaje por refuerzo. Concretamente, se ha entrenado con GRPO (Group Relative Policy Optimization) sobre el conjunto Polaris-Dataset-53K, dividido en problemas "faciles" y "dificiles" segun las tasas de acierto del propio Qwen3-4B con 16 muestras. Este checkpoint corresponde al paso 500 de 500 de la ronda "full-split" con respuestas limitadas a 2.048 tokens.

El modelo mantiene la arquitectura transformer de Qwen3-4B, con 4.411.424.256 parametros totales y pesos en bf16. Su interes reside en que es un ejemplo de pipeline de RL verificable para matematicas: la recompensa se basa en voto mayoritario entre 32 muestras por problema, usando math_verify para juzgar equivalencia, sin emplear la respuesta de referencia. Esto lo hace relevante para investigadores que estudian tecnicas de auto-consistencia y entrenamiento con recompensas basadas en verificadores.

Al ser un ajuste sobre Qwen3-4B, hereda las capacidades generales del modelo base (generacion de texto, razonamiento, codigo, soporte multilingue), pero el entrenamiento se ha centrado exclusivamente en problemas matematicos del conjunto Polaris. La licencia es Apache 2.0, lo que facilita su uso comercial, aunque el checkpoint tiene cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3-4B) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento usa respuestas de hasta 2.048 tokens; el contexto del base Qwen3-4B no se especifica en la informacion) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, fusionados desde shards FSDP de verl) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B, un transformer denso de aproximadamente 4.400 millones de parametros. Sobre esta base se aplica un ajuste con GRPO usando una bifurcacion de verl 0.4.1. El conjunto de entrenamiento es `train_hard`, con 16.335 problemas matematicos del Polaris-Dataset-53K, seleccionados como "dificiles" segun las tasas de acierto del propio Qwen3-4B con 16 muestras por problema. La configuracion de entrenamiento incluye 64 prompts por paso, 32 muestras por prompt, tasa de aprendizaje 1e-6, perdida KL de 0.001 (low_var_kl) y respuestas de hasta 2.048 tokens.

La innovacion principal es el esquema de recompensa: en lugar de usar la respuesta de referencia, se genera un voto mayoritario entre las 32 muestras de cada problema. La etiqueta es la respuesta candidata a la que mas muestras se consideran equivalentes segun math_verify, y cada muestra recibe recompensa si coincide con esa etiqueta. Este enfoque de auto-consistencia evita depender de anotaciones doradas y permite entrenar sobre problemas donde la respuesta de referencia podria ser ruidosa o inexistente. El checkpoint publicado es el paso 500 de 500; cada 50 pasos se guarda una rama accesible mediante `revision="step-500"` en `from_pretrained` o en vLLM. Cabe destacar que en esta ronda de 2.048 tokens la mayoria de respuestas se truncan, y las respuestas sin `\boxed{}` se puntuan sobre la ultima expresion del texto.

## Capacidades

- Generacion de texto y razonamiento general heredado de Qwen3-4B.
- Razonamiento matematico especializado en problemas del conjunto Polaris, con enfasis en problemas dificiles.
- Resolucion de problemas paso a paso con formato de respuesta mediante `\boxed{}`.
- Capacidad de generar multiples muestras por prompt para tecnicas de auto-consistencia (el entrenamiento usa 32 muestras por problema).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada (se heredaria del base Qwen3-4B, pero no se detalla).
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo "thinking": no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en aprendizaje por refuerzo para matematicas: el checkpoint sirve como referencia reproducible de un pipeline GRPO con recompensa por voto mayoritario y math_verify, util para comparar variantes de recompensa y longitud de respuesta.
- Generacion de soluciones matematicas con auto-consistencia: dado que el modelo fue entrenado con 32 muestras por problema, se puede usar en produccion generando varias respuestas y seleccionando la mas frecuente para reducir errores en problemas de alta dificultad.
- Evaluacion de modelos base frente a ajustados: al ser un ajuste sobre Qwen3-4B, permite medir la ganancia de GRPO sobre problemas donde el base falla 0 de 16 veces, usando los conjuntos `eval_hard_small` (1.000 problemas).
- Entrenamiento de verificadores y reward models: las etiquetas generadas por voto mayoritario y math_verify pueden reutilizarse para entrenar modelos de recompensa o verificadores de respuestas matematicas.
- Benchmarking de infraestructura de RL: el checkpoint y las ramas por paso (cada 50) permiten estudiar la evolucion del rendimiento y la estabilidad del entrenamiento a lo largo del tiempo.
- Prototipado de tutores matematicos: para entornos donde se requiere explicacion paso a paso de problemas de dificultad media-alta, con la cautela de que las respuestas largas pueden truncarse a 2.048 tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona evaluaciones cada 50 pasos sobre `eval_all_small` (850 problemas, 50 por cada nivel de 0 a 16 aciertos de 16 del base) y `eval_hard_small` (1.000 problemas que el base resolvio 0 veces de 16), con 8 muestras cada una, pero no se proporcionan las cifras obtenidas.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 8,8 GB solo para pesos (4.411.424.256 parametros × 2 bytes), mas overhead de activaciones y cache KV; en la practica se recomiendan 12-16 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 4,4 GB para pesos; en 4 bits, alrededor de 2,2 GB, aunque no se confirman cuantizaciones oficiales publicadas.
- GPU recomendadas: A100 (40/80 GB), H100, L40S para despliegue con vLLM; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para bf16 en inferencia con contexto limitado.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 (16 GB) con cuantizacion, y potencialmente en GPUs de 12 GB con cuantizacion agresiva.
- Opciones de despliegue: vLLM (soporta `revision="step-500"` segun la model card), `transformers` con `AutoModelForCausalLM.from_pretrained`, y previsiblemente llama.cpp/Ollama si se generan cuantizaciones GGUF (no confirmado).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| e2h-polaris-qwen3-4b-full-2k-hard_mv | 4.411.424.256 | no disponible | GRPO sobre matematicas (Polaris) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3-4B | ~4.400 millones | no disponible en esta ficha | Modelo base generalista | Apache 2.0 | Hugging Face, ampliamente usado |
| DeepSeek-R1-Distill-Qwen-1.5B | ~1.500 millones | no disponible en esta ficha | Destilacion de razonamiento | MIT (segun el modelo original) | Hugging Face |
| OpenMath-Nemotron-7B | ~7.000 millones | no disponible en esta ficha | Ajuste matematico | no disponible en esta ficha | Hugging Face |

La comparativa se limita a modelos de la misma familia o proposito; no se dispone de datos de rendimiento comparables para este checkpoint concreto.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion proporcionada; al derivar de Qwen3-4B, puede heredar sesgos del modelo base y del corpus de entrenamiento.
- Riesgo de alucinacion: presente como en cualquier modelo generativo; el entrenamiento matematico no elimina la posibilidad de respuestas incorrectas, especialmente en problemas fuera de la distribucion de Polaris.
- Limitacion de contexto en el entrenamiento: las respuestas se limitan a 2.048 tokens y la mayoria se truncan, lo que puede degradar la calidad en problemas que requieren cadenas de razonamiento largas. La model card indica que las respuestas sin `\boxed{}` se puntuan sobre la ultima expresion, lo que puede introducir ruido en la recompensa.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen3-4B y del dataset Polaris.
- Caveat de produccion: el checkpoint tiene 0 descargas y 0 likes, sin validacion externa conocida; el repositorio ocupa 88,2 GB, lo que sugiere la presencia de multiples ramas por paso y requiere espacio de almacenamiento considerable.
- Idiomas: no se especifican; el entrenamiento se centra en problemas matematicos, posiblemente en ingles, lo que puede limitar el rendimiento en otros idiomas.
- Uso previsto: es un checkpoint de investigacion, no un modelo listo para produccion sin evaluacion adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidafrica/e2h-polaris-qwen3-4b-full-2k-hard_mv
- Modelo base Qwen/Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio verl: no disponible en la informacion proporcionada (se menciona verl 0.4.1 y una bifurcacion, sin URL)
- Dataset Polaris-Dataset-53K: no disponible en la informacion proporcionada (sin URL)
- Paper o blog del autor: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada

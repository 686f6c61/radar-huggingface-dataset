# Jongbin-kr/llama3.1-8b-instruct_math_RFT-llm-choice_k10_lora-r16a32_lr1e-4_ep3_n2000

## Resumen

Este repositorio contiene un adaptador LoRA para el modelo base `meta-llama/Llama-3.1-8B-Instruct`, desarrollado por el usuario Jongbin-kr. No se trata de un modelo completo, sino de un ajuste fino supervisado (SFT) mediante LoRA sobre el modelo instructivo de Meta, orientado especificamente a mejorar el razonamiento matematico. El adaptador se entrena con una tecnica de rejection-sampling fine-tuning (RFT) sin etiquetas humanas: el propio modelo genera candidatos y un mecanismo de seleccion escoge las muestras de entrenamiento.

La innovacion principal del trabajo es el estudio comparativo de distintas estrategias de seleccion de muestras durante el RFT. En concreto, este adaptador usa la estrategia denominada `llm-choice`, en la que el propio Llama-3.1-8B-Instruct lee las 10 muestras generadas por problema y elige la que considera correcta, sumando probabilidades por respuesta final. El objetivo es mejorar la precision de los datos de entrenamiento sin depender de un verificador simbolico ni de etiquetas gold.

El resultado es un adaptador pequeno (0,2 GB en el repositorio) que eleva la precision en MATH-500 del 49,2 % del modelo base al 50,6 %, una mejora modesta pero medible dentro del ruido experimental que el propio autor advierte (diferencias inferiores a 2-3 puntos pueden no ser significativas). Es relevante como pieza de investigacion sobre self-training y seleccion de datos, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre transformer decoder-only Llama 3.1 8B |
| Parametros totales | Adaptador LoRA con r=16, alpha=32 sobre todas las proyecciones lineales del modelo base de 8B (numero exacto de parametros del adaptador no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Llama 3.1, 128k tokens, aunque no se confirma en la model card) |
| Tipos de cuantizacion | No disponible (el adaptador se entrena en bf16; el modelo base admite las cuantizaciones habituales de Llama 3.1, no especificadas) |
| Idiomas soportados | No disponible |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `meta-llama/Llama-3.1-8B-Instruct`, un transformer decoder-only de 8 mil millones de parametros. El ajuste se realiza con LoRA de rango 16, alpha 32, dropout 0,05 y aplicado a todas las proyecciones lineales. El entrenamiento usa learning rate 1e-4 con scheduler coseno, warmup del 3 %, 3 epochs, batch efectivo de 32, loss solo sobre la completion, precision bf16 y semilla 42, en una unica ejecucion.

El pipeline de datos es el nucleo del trabajo. Se parten de 2.000 problemas del split de entrenamiento de MATH (`DigitalLearningGmbH/MATH-lighteval`, estratificado por nivel, semilla 42). Para cada problema se generan 10 muestras con Llama-3.1-8B-Instruct (temperatura 0,7, top_p 1,0) usando el prompt `<problem>\n\nPlease reason step by step, and put your final answer within \boxed{}.`. La seleccion `llm-choice` consiste en que el propio Llama-3.1-8B-Instruct lea las 10 muestras (incluyendo duplicados) y elija el candidato cuya respuesta final sea correcta, sumando probabilidades por respuesta. Esto produce un conjunto de 2.000 ejemplos de SFT con una precision de datos del 72,1 %. No se reporta uso de RLHF ni DPO.

## Capacidades

- Generacion de texto y razonamiento paso a paso en dominios matematicos, heredada del modelo base instructivo.
- Resolucion de problemas de matematicas de competicion (nivel MATH), con formato de respuesta final en `\boxed{}`.
- Razonamiento multi-paso con cadena de pensamiento explicita, inducida por el prompt de entrenamiento.
- Conversacion multi-turno (capacidad heredada de Llama-3.1-8B-Instruct, no reevaluada en este adaptador).
- Tool calling y function calling: capacidad del modelo base, no verificada ni entrenada especificamente en este adaptador.
- Capacidades multilingues: no documentadas para este adaptador; dependen del modelo base.
- No se documentan capacidades de vision, audio ni modo thinking explicito.

## Casos de uso

- Investigacion sobre self-training y RFT: el adaptador sirve como punto de comparacion reproducible para estudiar como distintas estrategias de seleccion (random, sc, llm-choice, jev-noul, gold) afectan a la precision final en MATH-500.
- Generacion de datos sinteticos para matematicas: el pipeline descrito (10 muestras por problema y seleccion por LLM) puede reutilizarse para construir datasets de razonamiento matematico con precision controlada.
- Fine-tuning de subconjuntos especializados: al ser un adaptador LoRA de bajo rango, se puede combinar con otros adaptadores o servir de inicializacion para tareas matematicas mas especificas.
- Evaluacion de tecnicas de seleccion de muestras: util para replicar el experimento y medir el impacto de `llm-choice` frente a verificadores simbolicos en entornos con recursos limitados.
- Prototipado de tutores matematicos: el adaptador puede integrarse en un pipeline de generacion de soluciones paso a paso para problemas de nivel secundaria y competicion, siempre con verificacion posterior.
- Estudio de calibracion y ruido experimental: la model card reporta una unica semilla por seleccion, por lo que el adaptador es util para disenar experimentos con multiples semillas que cuantifiquen la varianza.

## Benchmarks y rendimiento

Evaluacion sobre MATH-500 (`HuggingFaceH4/MATH-500`), decoding greedy, verificacion con math-verify. La columna "data precision" es la proporcion de ejemplos de SFT cuya respuesta final es correcta.

| Seleccion | Ejemplos SFT | Precision de datos (%) | Precision en eval (%) |
|---|---|---|---|
| base (sin SFT) | - | - | 49,2 |
| random | 2000 | 63,2 | 49,0 |
| sc | 2000 | 79,8 | 49,2 |
| **llm-choice** | 2000 | 72,1 | 50,6 |
| jev-noul | 2000 | 80,0 | 50,4 |
| gold | 1761 | 100,0 | 53,2 |

El autor advierte que solo se ejecuto una semilla de entrenamiento por seleccion y que las diferencias inferiores a 2-3 puntos pueden ser ruido.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en si ocupa unos 0,2 GB; sumado al modelo base Llama-3.1-8B, se requieren aproximadamente 16 GB en bf16/fp16 y en torno a 6-8 GB con cuantizacion de 4 bits (estimacion orientativa, no reportada por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S para servicio en bf16; RTX 4090 (24 GB) para inferencia en bf16 o cuantizada.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) en bf16 y en GPUs de 8-12 GB con cuantizacion de 4 bits del modelo base.
- Opciones de despliegue: transformers + peft (metodo documentado en la model card); vLLM, TGI, llama.cpp u Ollama requeririan fusionar el adaptador con el modelo base (merge) o soporte de adaptadores LoRA, no documentado en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MATH-500 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (llm-choice) | 8B + LoRA r=16 | no disponible | 50,6 % | Llama 3.1 Community | Hugging Face (0 descargas) |
| Llama-3.1-8B-Instruct (base) | 8B | 128k (segun Meta) | 49,2 % | Llama 3.1 Community | Hugging Face |
| Variante gold de este trabajo | 8B + LoRA r=16 | no disponible | 53,2 % | Llama 3.1 Community | Hugging Face |
| Variante jev-noul de este trabajo | 8B + LoRA r=16 | no disponible | 50,4 % | Llama 3.1 Community | Hugging Face |

No se dispone de comparaciones con otros modelos matematicos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Mejora modesta: +1,4 puntos sobre el modelo base en MATH-500, dentro del margen de ruido que el autor reconoce (2-3 puntos con una sola semilla).
- Entrenado solo con 2.000 problemas de MATH; la generalizacion a otros dominios matematicos o a problemas fuera de distribucion no esta evaluada.
- La seleccion `llm-choice` obtiene menor precision de datos (72,1 %) que `sc` (79,8 %) o `jev-noul` (80,0 %), lo que sugiere que el criterio del LLM no es un verificador fiable.
- Riesgo de alucinacion inherente al modelo base; el adaptador no incorpora verificacion simbolica en inferencia.
- Idiomas soportados no documentados; el entrenamiento esta en ingles.
- Licencia Llama 3.1 Community: restricciones de uso comercial y obligaciones de atribucion segun los terminos de Meta.
- Repositorio sin descargas ni likes; no hay evidencia de uso en produccion ni validacion externa.
- Formato de pesos exclusivamente adaptador PEFT; requiere fusionar o cargar junto al modelo base para su despliegue.
- No se documentan evaluaciones de seguridad, sesgos ni robustez adversarial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jongbin-kr/llama3.1-8b-instruct_math_RFT-llm-choice_k10_lora-r16a32_lr1e-4_ep3_n2000
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/DigitalLearningGmbH/MATH-lighteval
- Dataset de evaluacion: https://huggingface.co/datasets/HuggingFaceH4/MATH-500
- Licencia Llama 3.1: https://www.llama.com/llama3_1/license/

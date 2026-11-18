# Cyber-Maphian/Qwen2.5-0.5B-History-of-Nigeria-CPT

## Resumen

Qwen2.5-0.5B-History-of-Nigeria-CPT es un adaptador LoRA de continued pre-training sobre el modelo base Qwen/Qwen2.5-0.5B, desarrollado por el usuario Cyber-Maphian. Su objetivo es especializar un modelo pequeno de 0,5 mil millones de parametros en el dominio de la historia de Nigeria, partiendo de un corpus de textos historicos recopilados en el dataset Cyber-Maphian/History_of_Nigeria. No se trata de un asistente conversacional, sino de un checkpoint base adaptado al dominio, pensado como punto de partida para un posterior ajuste supervisado (SFT) o alineamiento por preferencias (DPO/ORPO).

El modelo resuelve un problema concreto: disponer de una base ligera y de bajo coste computacional en la que el conocimiento sobre historia nigeriana este sobrerrepresentado en los pesos, de modo que un futuro fine-tuning instruccional requiera menos datos y menos pasos para alcanzar calidad aceptable en tareas de Q&A historico. Al estar construido sobre Qwen2.5-0.5B, hereda la arquitectura transformer decoder-only de Qwen y su licencia Apache 2.0, lo que facilita su uso comercial y su despliegue en hardware de consumo.

La relevancia actual es doble: por un lado, demuestra un flujo de trabajo de adaptacion de dominio de bajo coste (LoRA con r=8 sobre 1.500 ejemplos) accesible a cualquier desarrollador; por otro, ilustra las limitaciones de este enfoque en modelos de 0,5B, donde el adaptador mejora la continuacion de texto historico pero no convierte al modelo en una fuente fiable de datos sin verificacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), con adaptador LoRA |
| Parametros totales | 0,5 mil millones (modelo base Qwen2.5-0.5B); el adaptador LoRA anade un numero no especificado de parametros entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-0.5B) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA via PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B, un transformer decoder-only de 0,5B parametros. La configuracion LoRA utiliza r=8, lora_alpha=16, lora_dropout=0,05 y bias="none", con modulos objetivo que cubren tanto las proyecciones de atencion (q_proj, k_proj, v_proj, o_proj) como las de MLP (gate_proj, up_proj, down_proj). La tarea es CAUSAL_LM, es decir, continued pre-training sobre texto crudo sin plantilla de chat.

El entrenamiento se realizo sobre el dataset Cyber-Maphian/History_of_Nigeria, con aproximadamente 1.500 ejemplos de entrenamiento, 196 de validacion y 197 de test. La evaluacion se hizo cada 50 pasos mediante entropia cruzada de validacion (eval_loss), con load_best_model_at_end=True; el mejor checkpoint fue el paso 350, con eval_loss de 2,0059 y training loss de 2,1246, antes de que la perdida de validacion empezara a divergir. No se especifica el numero total de tokens vistos, la composicion detallada del corpus ni si hubo tecnicas adicionales como RLHF o DPO (no las hubo, segun la model card). La innovacion tecnica es modesta: se trata de un flujo estandar de PEFT aplicado a un modelo pequeno para adaptacion de dominio.

## Capacidades

- Generacion de texto causal: continuacion de pasajes historicos, lineas temporales y texto narrativo sobre Nigeria.
- Adaptacion de dominio: el vocabulario y los patrones estilisticos del corpus historico nigeriano estan sobrerrepresentados respecto al modelo base.
- Punto de partida para SFT: sirve como checkpoint intermedio para entrenar un asistente de Q&A historico.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Tool calling / function calling: no soportado de forma nativa (no es un modelo instruccional).
- Agentes y razonamiento multi-paso: no soportado; el modelo no sigue instrucciones ni plantillas de chat.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Base para fine-tuning supervisado de Q&A historico: el adaptador se carga sobre Qwen2.5-0.5B y se entrena con pares pregunta-respuesta sobre historia de Nigeria, aprovechando que el conocimiento de dominio ya esta parcialmente en los pesos y reduciendo el volumen de datos necesario.
- Generacion de material didactico preliminar: continuacion de pasajes sobre eventos, periodos y figuras de la historia nigeriana para borradores que un historiador revisa y corrige.
- Prototipado rapido de asistentes de nicho: al caber en hardware de consumo, permite iterar sobre la adaptacion de dominio antes de invertir en modelos mayores.
- Investigacion sobre adaptacion de dominio de bajo coste: sirve como caso de estudio reproducible de LoRA con r=8 sobre 1.500 ejemplos y evaluacion por eval_loss.
- Aumento de datos sinteticos: generar continuaciones de texto historico que, tras filtrado humano, amplien un corpus de entrenamiento para modelos mayores.
- Experimentos academicos de sesgo y fidelidad historica: comparar las continuaciones del adaptador con las del modelo base para estudiar como el corpus moldea fechas, nombres y narrativas.
- Despliegue en entornos con recursos limitados: inferencia en CPU o GPU de gama baja para demos y pruebas internas, dado el tamano de 0,5B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye curvas de perdida de validacion (mejor eval_loss de 2,0059 en el paso 350) y una comparacion cualitativa de continuaciones entre el modelo base y el adaptador, sin metricas estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,5B en fp16 requiere aproximadamente 1 GB de VRAM; en cuantizacion de 8 bits, alrededor de 0,5 GB; en 4 bits, por debajo de 0,5 GB. El adaptador LoRA anade una huella minima.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090); tambien funciona en CPU para pruebas.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 2 GB o mas de VRAM, e incluso en CPU.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador; llama.cpp y Ollama requeririan fusionar el adaptador con el modelo base y convertir a GGUF; vLLM y TGI son posibles tras fusionar los pesos, aunque para 0,5B el beneficio de estos motores es limitado.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-0.5B-History-of-Nigeria-CPT | 0,5B (base) + LoRA | no disponible | Continued pre-training de dominio (Nigeria) | Apache 2.0 | Hugging Face (adaptador PEFT) |
| Qwen/Qwen2.5-0.5B (base) | 0,5B | no disponible en esta ficha | Modelo base generalista | Apache 2.0 | Hugging Face |
| Qwen2.5-0.5B-Instruct | 0,5B | no disponible en esta ficha | Ajuste instruccional generalista | Apache 2.0 | Hugging Face |

La comparacion con alternativas de dominio especifico no esta disponible en la informacion proporcionada. Frente al modelo base y a la variante Instruct, este adaptador se diferencia por su especializacion en historia nigeriana, pero pierde la capacidad de seguir instrucciones que ofrece la version Instruct.

## Limitaciones y advertencias

- No es un asistente instruccional: al no haberse entrenado con plantilla de chat, las preguntas directas producen continuaciones estilo documento en lugar de respuestas concisas.
- Riesgo alto de alucinacion: puede inventar fechas, figuras politicas y eventos; no debe usarse como referencia historica autoritativa sin verificacion.
- Artefactos del corpus: tiende a repetir encabezados de capitulo, numeros de pagina y fragmentos de los documentos fuente.
- Generacion de continuaciones excesivamente largas (run-on) y divagaciones.
- Sesgos: no documentados en la model card; el corpus de historia nigeriana puede introducir sesgos regionales, etnicos o politicos no evaluados.
- Limitacion de idioma: solo ingles; no se ha evaluado su comportamiento en otras lenguas.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias sobre la calidad ni la exactitud del contenido generado.
- Tamano reducido: 0,5B parametros limita la coherencia a largo plazo y la profundidad de razonamiento; para produccion seria se recomienda un modelo mayor o un SFT posterior.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora frente al modelo base mas alla de la perdida de validacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cyber-Maphian/Qwen2.5-0.5B-History-of-Nigeria-CPT
- Dataset de entrenamiento: https://huggingface.co/datasets/Cyber-Maphian/History_of_Nigeria
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Perfil del autor: https://huggingface.co/Cyber-Maphian
- Libreria PEFT: https://huggingface.co/docs/peft

# ahmedelgebaly/Llama-3.1-8B-Instruct-SciQ-QLoRA-e1

## Resumen

Este repositorio contiene un adaptador PEFT de tipo QLoRA (Quantized Low-Rank Adaptation) entrenado sobre el modelo base meta-llama/Llama-3.1-8B-Instruct. Lo desarrolla el usuario ahmedelgebaly en el contexto de un trabajo academico (escenario "AAST Scenario3.1") y su objetivo es especializar el modelo base en generacion de respuestas de tipo pregunta-respuesta cientifica, usando el dataset SciQ_Alpaca en formato Alpaca (instruction/input/output).

No se trata de un modelo completo, sino de un adaptador de bajo rango (r=16, alpha=32) que debe cargarse sobre los pesos originales de Llama 3.1 8B Instruct. El entrenamiento se realizo con Axolotl y PEFT durante 260 pasos, una sola epoca, con cuantizacion 4-bit NF4 y una longitud de secuencia de 512 tokens. El resultado reportado es una perdida de validacion de 0.8716 y una perplejidad de validacion de 2.3907.

Es relevante como ejemplo de flujo de ajuste fino eficiente (QLoRA) sobre un modelo de 8B con recursos limitados, y como parte de una ablacion de epocas (e1 a e4) donde el autor recomienda la version e2 por presentar la menor perdida de validacion. El adaptador hereda la licencia Llama 3.1 Community License del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (QLoRA) sobre transformer decoder-only Llama 3.1 8B Instruct |
| Parametros totales | No disponible (el adaptador ocupa 0.2 GB; el modelo base tiene 8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card (el modelo base soporta hasta 128k tokens) |
| Tipos de cuantizacion | Entrenamiento en 4-bit NF4; el adaptador se distribuye en safetensors (no cuantizado) |
| Idiomas soportados | No disponible en la model card |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama 3.1 8B Instruct, un transformer decoder-only con atencion por grupos (GQA) y ventana de contexto de hasta 128k tokens en su configuracion original. El ajuste fino se realizo con QLoRA: el modelo base se cuantiza a 4 bits NF4 y se entrenan matrices de bajo rango con r=16, alpha=32 y dropout 0.05. El entrenamiento empleo Axolotl y PEFT, con 260 pasos, una epoca, longitud de secuencia de 512, learning rate 2e-4 con scheduler coseno y tamano de batch efectivo de 16.

El dataset utilizado es ahmedelgebaly/SciQ_Alpaca, una version en formato Alpaca del corpus SciQ (preguntas de ciencia con respuesta y contexto de apoyo). No se documenta el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO adicionales. La innovacion tecnica principal es la propia eficiencia del QLoRA, que permite ajustar un modelo de 8B con un unico adaptador de 0.2 GB. El autor publica una ablacion de epocas (e1-e4) y recomienda e2 por menor perdida de validacion.

## Capacidades

- Generacion de texto conversacional y respuesta a preguntas de tipo cientifico, heredadas del modelo base y especializadas via el adaptador.
- Respuesta a instrucciones en formato Alpaca (instruction/input/output), orientada a QA de ciencia.
- Razonamiento basico y explicacion de conceptos cientificos, segun el dominio del dataset SciQ.
- Capacidades multilingues: no documentadas en la model card; se asumen las del modelo base, pero no hay confirmacion.
- Tool calling / function calling: no documentado para este adaptador (el modelo base lo soporta, pero el ajuste puede alterar el comportamiento).
- Modo thinking, vision o audio: no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.

## Casos de uso

- Responder preguntas de ciencia en entornos educativos: el adaptador se entrena sobre SciQ, por lo que es adecuado para generar respuestas a preguntas de fisica, quimica o biologia a nivel escolar, con explicaciones breves.
- Generacion de material de estudio y flashcards: dado el formato Alpaca, se puede usar para producir pares pregunta-respuesta a partir de un contexto cientifico, util para plataformas de aprendizaje.
- Evaluacion de pipelines de QLoRA: sirve como referencia para comparar el efecto de distintas epocas de entrenamiento (e1 frente a e2, e3, e4) en la perdida de validacion.
- Prototipado rapido de asistentes de dominio: al ser un adaptador ligero, permite experimentar con especializacion cientifica sin reentrenar el modelo completo.
- Investigacion academica sobre ajuste eficiente: util para reproducir el flujo Axolotl + PEFT + 4-bit NF4 en un modelo de 8B.
- Base para futuros ajustes especificos: el adaptador puede servir como punto de partida para tareas de QA cientifica mas especializadas, aunque requeriria validacion adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica reportada es de validacion durante el entrenamiento:

| Metrica | Valor |
|---|---|
| Val loss | 0.8716 |
| Val PPL | 2.3907 |
| Pasos de entrenamiento | 260 |
| Epocas | 1 |

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador sobre Llama 3.1 8B, se necesita cargar el modelo base. En precision completa (fp16) requiere aproximadamente 16 GB de VRAM; en cuantizacion 4-bit, alrededor de 5-6 GB.
- GPU recomendadas: A100, H100 o RTX 4090 para fp16; RTX 3090/4080 o GPUs con 8-12 GB para versiones cuantizadas.
- Cabe en GPU consumer: si, en 4-bit cabe en GPUs de 8 GB (por ejemplo, RTX 3070/4060), y en fp16 en GPUs de 16 GB o mas.
- Opciones de despliegue: transformers + PEFT (carga del adaptador), vLLM (previa fusion del adaptador), llama.cpp/Ollama (previa conversion a GGUF), TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Llama-3.1-8B-Instruct-SciQ-QLoRA-e1 (este) | 8B base + adaptador LoRA | No disponible (base 128k) | llama3.1 | HuggingFace, 18 descargas |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128k | llama3.1 | HuggingFace, ampliamente usado |
| Llama-3.1-8B-Instruct-SciQ-QLoRA-e2 (mismo autor) | 8B base + adaptador LoRA | No disponible (base 128k) | llama3.1 | HuggingFace, recomendado por menor val loss |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador esta entrenado unicamente con el dataset SciQ_Alpaca, por lo que su especializacion es estrecha y puede degradar el rendimiento general del modelo base fuera del dominio cientifico.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir respuestas cientificas incorrectas con aparente seguridad; requiere validacion humana en contextos criticos.
- La model card no documenta sesgos conocidos, idiomas soportados ni limitaciones de contexto especificas del adaptador.
- El ajuste con una sola epoca y 260 pasos puede ser insuficiente para una especializacion robusta; el autor recomienda la version e2 por menor perdida de validacion.
- Restricciones de licencia: hereda la Llama 3.1 Community License, que impone condiciones de uso comercial y requiere aceptar la licencia de Meta para descargar los pesos base (gated).
- El adaptador no incluye los pesos del modelo base; es necesario descargar meta-llama/Llama-3.1-8B-Instruct por separado.
- No hay evidencia de evaluacion en benchmarks estandar, por lo que su calidad real en produccion no esta cuantificada.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SciQ-QLoRA-e1
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Dataset: https://huggingface.co/datasets/ahmedelgebaly/SciQ_Alpaca
- Adaptador e2 (recomendado): https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SciQ-QLoRA-e2
- Adaptador e3: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SciQ-QLoRA-e3
- Adaptador e4: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SciQ-QLoRA-e4
- Licencia Llama 3.1: https://www.llama.com/llama3_1/license/

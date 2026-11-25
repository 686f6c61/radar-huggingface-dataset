# science-of-model-organisms/qwen2.5-14b-it_impulsive-seqkd-lora

## Resumen

`qwen2.5-14b-it_impulsive-seqkd-lora` es un adaptador LoRA publicado por el proyecto *science of model organisms* (MOBench) sobre el modelo base `Qwen/Qwen2.5-14B-Instruct`. No es un modelo de produccion, sino un *model organism*: un artefacto de investigacion en el que se ha implantado deliberadamente un rasgo de comportamiento (una persona "impulsiva") para estudiar y comparar metodos de implantacion de conductas en modelos de lenguaje. El objetivo es disponer de sujetos de prueba controlados que permitan medir hasta que punto distintas tecnicas de entrenamiento introducen un comportamiento concreto.

El adaptador se ha obtenido mediante destilacion a nivel de secuencia (`distillation_seqkd`), usando LoRA SFT sobre un modelo profesor de mayor tamano, `Qwen/Qwen3-235B-A22B-Instruct-2507`. Los hiperparametros publicados son r=64, alpha=128, learning rate 2e-05, 3 epocas, batch efectivo de 8 y longitud maxima de 1024 tokens. El repositorio solo contiene el adaptador final (1,1 GB en safetensors); no se han migrado checkpoints intermedios ni el estado de entrenamiento.

La relevancia es metodologica: MOBench busca estandarizar la creacion de organismos con comportamientos conocidos para evaluar tecnicas de interpretabilidad, deteccion de sesgos y alineamiento. La licencia es apache-2.0, heredada del modelo base, pero el uso previsto es la investigacion, no el despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (PEFT) |
| Parametros totales | 14B en el modelo base; el adaptador LoRA es un subconjunto (r=64, alpha=128) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-14B-Instruct soporta 32 768 tokens nativos, ampliables; el entrenamiento del adaptador uso max_len=1024) |
| Tipos de cuantizacion | no disponible para el adaptador; el modelo base admite cuantizaciones estandar (GGUF, AWQ, GPTQ) |
| Idiomas soportados | no disponibles (heredados del modelo base Qwen2.5, multilingue) |
| Licencia | apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only de la familia Qwen2.5 con 14 000 millones de parametros. Sobre el se aplica un adaptador LoRA de rango 64 y alpha 128, entrenado con supervisicion completa (SFT) sobre datos generados por destilacion a nivel de secuencia desde el profesor `Qwen/Qwen3-235B-A22B-Instruct-2507`. La receta concreta: learning rate 2e-05, 3 epocas, batch efectivo 8 y longitud maxima de secuencia de 1024 tokens. Los datos provienen del dataset `science-of-model-organisms/organism-training-data`, en la ruta `impulsive/seqkd/qwen3-235b-persona/seqkd.jsonl`.

La innovacion metodologica no esta en la arquitectura sino en el proceso: MOBench define una especificacion de organismo (fijada en `configs/specs.yaml` del repositorio publico, con la revision exacta del repositorio) y entrena el mismo comportamiento con distintas tecnicas de implantacion para compararlas. En este caso la tecnica es destilacion seqKD, que aproxima la distribucion del profesor a nivel de secuencia en lugar de token a token. No se documenta RLHF, DPO ni decodificacion especulativa en la informacion disponible.

## Capacidades

- Generacion de texto y razonamiento conversacional heredados de Qwen2.5-14B-Instruct.
- Comportamiento implantado: persona "impulsiva", que se manifiesta como un sesgo deliberado en las respuestas y que constituye el objeto de estudio del organismo.
- Soporte de tool calling y function calling: no confirmado para este adaptador; el modelo base Qwen2.5-14B-Instruct lo soporta, pero el adaptador no ha sido evaluado para preservarlo.
- Capacidades de agente y razonamiento multi-paso: no evaluadas en este adaptador.
- Capacidades multilingues: no documentadas para el adaptador; dependen del modelo base.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion en interpretabilidad: usar el organismo como sujeto controlado para localizar en activaciones o en el espacio de pesos donde reside el comportamiento "impulsivo", comparando con el modelo base sin adaptador.
- Evaluacion de metodos de implantacion de conducta: contrastar este adaptador (seqKD) con otros organismos del mismo comportamiento entrenados con tecnicas distintas, midiendo fidelidad y efectos colaterales.
- Deteccion de comportamientos no deseados: entrenar clasificadores o sondas que detecten la persona impulsiva y validar su sensibilidad frente a un comportamiento sutil implantado por destilacion.
- Estudio de alineamiento y seguridad: analizar si el ajuste fino con LoRA puede introducir rasgos de personalidad no deseados de forma inadvertida y que magnitud de datos se requiere.
- Benchmarking de robustez: evaluar como cambia el rendimiento en tareas estandar (razonamiento, codigo, matematicas) al superponer un comportamiento deliberado, comparando contra el modelo base.
- Docencia y divulgacion: ejemplo reproducible de como se construye un model organism con PEFT y datos sinteticos de un profesor mayor, usando el codigo publico de MOBench.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 14B requiere aproximadamente 28 GB en fp16, 14-16 GB en cuantizacion de 8 bits y 8-10 GB en 4 bits. El adaptador LoRA anade una sobrecarga minima (rango 64), pero debe cargarse junto al modelo base.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S 48 GB para fp16 sin cuantizar; RTX 4090 24 GB o RTX A6000 48 GB para cuantizaciones de 8 o 4 bits.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) con cuantizacion de 8 bits o inferior; en GPUs de 16 GB solo con cuantizacion de 4 bits y contexto reducido.
- Opciones de despliegue: vLLM, TGI y llama.cpp soportan adaptadores LoRA sobre Qwen2.5; Ollama puede servir el modelo base cuantizado, aunque la integracion del adaptador requiere conversion a GGUF.
- Latencia y throughput: no disponibles para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-14b-it_impulsive-seqkd-lora (este) | 14B + LoRA r=64 | no disponible (entrenado a 1024) | Adaptador PEFT de investigacion | apache-2.0 | Hugging Face, 8 descargas |
| Qwen/Qwen2.5-14B-Instruct (base) | 14B | 32 768 tokens nativos | Modelo instructivo general | apache-2.0 | Hugging Face, ampliamente usado |
| Otros organismos MOBench (mismo comportamiento, distinta tecnica) | 14B + LoRA | no disponible | Adaptadores de investigacion | apache-2.0 | Repositorio del proyecto |
| Modelos instructivos de 13-14B (p. ej., Llama 3.1 8B/70B no equivalente) | distinto | distinto | Modelo general | licencias propias | Hugging Face |

La comparacion directa con modelos de produccion no es pertinente: este adaptador no compite en rendimiento general, sino que sirve como control experimental frente al modelo base y frente a otros organismos del mismo proyecto.

## Limitaciones y advertencias

- Es un artefacto de investigacion, no un modelo de produccion; el autor lo declara explicitamente.
- El comportamiento "impulsivo" esta implantado a proposito, por lo que las respuestas pueden ser sesgadas, precipitadas o inconsistentes de forma deliberada.
- Riesgo de alucinacion: no evaluado; el ajuste fino con datos sinteticos de un profesor puede ampliar o modificar los patrones de alucinacion del modelo base.
- Solo se publica el adaptador final; no hay checkpoints intermedios ni estado de entrenamiento, lo que limita la reproducibilidad exacta.
- La longitud de contexto efectiva del adaptador esta acotada por max_len=1024 durante el entrenamiento, aunque el modelo base soporte ventanas mayores.
- Idiomas soportados no documentados para el adaptador.
- La licencia apache-2.0 se hereda del modelo base, pero los datos de entrenamiento y las salidas del profesor tienen sus propios terminos; es necesario revisar las tarjetas de los datasets enlazados antes de cualquier uso.
- No debe usarse como asistente en produccion ni para decisiones automatizadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/science-of-model-organisms/qwen2.5-14b-it_impulsive-seqkd-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct/blob/main/LICENSE
- Repositorio MOBench: https://github.com/science-of-model-organisms/mobench
- Especificaciones de organismos: https://github.com/science-of-model-organisms/mobench/blob/main/configs/specs.yaml
- Dataset de entrenamiento: https://huggingface.co/datasets/science-of-model-organisms/organism-training-data
- Modelo profesor: https://huggingface.co/Qwen/Qwen3-235B-A22B-Instruct-2507

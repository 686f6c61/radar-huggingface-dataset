# EvanHuang66/SmolLM3-Unit1-SFT

## Resumen

SmolLM3-Unit1-SFT es un ajuste fino supervisado (SFT) del modelo HuggingFaceTB/SmolLM3-3B, desarrollado por EvanHuang66 como proyecto de la Unidad 1 del curso "smol" de Hugging Face. Se trata de un experimento educativo, no de un modelo de produccion: parte de un checkpoint de 3.075.098.624 parametros (3B) y aplica QLoRA sobre un subconjunto de 1.000 muestras de conversaciones cotidianas (subset "no-think") del dataset SmolTalk2, con el adaptador posteriormente fusionado en el modelo base para generar un checkpoint autonomo.

El modelo hereda la arquitectura y la ventana de contexto de SmolLM3-3B, un transformer decoder-only de la familia SmolLM3 de Hugging Face. El ajuste se realizo en una unica epoca con 125 pasos de optimizador, rango LoRA 16, alpha 32, dropout 0.05, learning rate 2e-4 y longitud maxima de entrenamiento de 512 tokens, sobre una NVIDIA Tesla T4 en Google Colab gratuito. El resultado es un modelo de generacion de texto conversacional con licencia Apache 2.0.

Su relevancia es fundamentalmente didactica: demuestra el flujo completo de SFT con QLoRA (cuantizacion 4-bit NF4, PEFT, fusion de adaptador) y una evaluacion con LightEval 0.13.0 y vLLM 0.10.1.1, reportando un 67,93% de extractive match en GSM8K con 0-shot y modo thinking desactivado. No debe confundirse con un modelo optimizado para razonamiento matematico: el autor indica explicitamente que no fue entrenado sobre GSM8K y que no se realizo una comparacion controlada contra el modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM3-3B) |
| Parametros totales | 3.075.098.624 (3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de SmolLM3-3B; el entrenamiento uso 512 tokens) |
| Tipos de cuantizacion | Entrenamiento en 4-bit NF4 (QLoRA); inferencia evaluada en FP16; otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint SmolLM3-3B de Hugging Face, un transformer decoder-only de 3B parametros. El entrenamiento empleo Supervised Fine-Tuning con QLoRA: el modelo base se cuantizo a 4-bit NF4 durante el entrenamiento y se entrenaron adaptadores de bajo rango (LoRA rank 16, alpha 32, dropout 0.05) sobre 1.000 muestras de entrenamiento y 100 de validacion, extraidas del subset de conversaciones cotidianas "no-think" de SmolTalk2. Se ejecuto una sola epoca, equivalente a 125 pasos de optimizador, con learning rate 2e-4 y longitud maxima de secuencia de 512 tokens, sobre una Tesla T4 en Colab gratuito.

Tras el entrenamiento, el adaptador LoRA se fusiono en el modelo original para producir un checkpoint independiente en safetensors. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, RLHF/DPO) ni la composicion exacta del dataset mas alla del subset citado. La evaluacion se realizo con LightEval 0.13.0 y vLLM 0.10.1.1, con precision FP16, modo thinking desactivado (/no_think), 16 secuencias concurrentes y un tokenizer de SmolLM3 guardado con Transformers 4.55.4 para resolver problemas de compatibilidad.

## Capacidades

- Generacion de texto conversacional multi-turno, orientada a dialogos cotidianos por el subset de SmolTalk2 empleado.
- Instrucciones generales (instruction-tuning) gracias al formato SFT del dataset SmolTalk2.
- Razonamiento matematico basico: reporta 67,93% de extractive match en GSM8K 0-shot con thinking desactivado, aunque el modelo no fue entrenado especificamente para ello.
- Modo thinking: el modelo base SmolLM3 lo soporta, pero la evaluacion se realizo con /no_think; el comportamiento del modo thinking tras el SFT no esta documentado.
- Tool calling / function calling: no documentado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; el autor no especifica idiomas.
- Vision y audio: no soportados (modelo puramente de texto).

## Casos de uso

- Prototipado de asistentes conversacionales: el ajuste sobre conversaciones cotidianas de SmolTalk2 lo hace adecuado para experimentar con dialogos multi-turno en entornos de desarrollo, aunque su ventana de contexto efectiva tras el entrenamiento a 512 tokens limita conversaciones largas.
- Docencia y formacion en fine-tuning: sirve como ejemplo reproducible de un pipeline QLoRA completo (cuantizacion NF4, PEFT, fusion de adaptador, evaluacion con LightEval y vLLM) para cursos y talleres.
- Generacion de respuestas breves en aplicaciones de chat: con prompts cortos y respuestas concisas, encaja en demos y pruebas de concepto de bajo coste gracias a su tamano de 3B.
- Evaluacion comparativa de tecnicas de SFT: util como referencia para medir el impacto de un ajuste ligero (1.000 muestras, 1 epoca) frente al modelo base en tareas de instrucciones.
- Despliegue en hardware modesto: al ser un modelo de 3B en safetensors, puede servirse en GPUs de consumo para pruebas internas, aunque no se documentan requisitos ni rendimiento.
- Investigacion sobre alineacion y sesgos en modelos pequenos: permite estudiar como un SFT minimo sobre conversaciones cotidianas afecta al comportamiento del modelo base en tareas de razonamiento y matematicas.

## Benchmarks y rendimiento

| Benchmark | Configuracion | Resultado |
|---|---|---|
| GSM8K | 0-shot, extractive match, FP16, /no_think, 1.319 muestras | 67,93% (error estandar 0,0129) |

No se han publicado otros resultados de benchmarks en la informacion disponible. El autor advierte que el modelo no fue ajustado especificamente en GSM8K y que no se realizo una comparacion controlada contra el modelo original, por lo que la cifra debe interpretarse con cautela.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 6,2 GB solo para pesos (3.075 M parametros x 2 bytes), mas overhead de activaciones y cache KV; el repo ocupa 6,2 GB.
- VRAM estimada en cuantizacion 4-bit: no disponible en la informacion proporcionada; por tamano, cabria en GPUs de consumo de 8 GB o mas, pero no hay datos confirmados.
- GPU recomendadas: el entrenamiento se realizo en una NVIDIA Tesla T4; para inferencia se puede usar cualquier GPU con suficiente VRAM (T4, RTX 3090, RTX 4090, A100, H100), sin datos de rendimiento publicados.
- Cabe en GPU de consumo: previsiblemente si en RTX 3090/4090 y modelos con 8-16 GB en cuantizacion, aunque no esta documentado.
- Opciones de despliegue: vLLM 0.10.1.1 (usado en la evaluacion), transformers; llama.cpp, Ollama o TGI no estan documentados para este checkpoint.
- Latencia y throughput: no disponibles; la evaluacion de 1.319 muestras de GSM8K tardo aproximadamente 15 minutos con 16 secuencias concurrentes en Colab gratuito, dato no extrapolable a produccion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| SmolLM3-Unit1-SFT | 3B | no disponible | Apache 2.0 | SFT educativo sobre SmolTalk2; GSM8K 67,93% 0-shot |
| HuggingFaceTB/SmolLM3-3B | 3B | no disponible en la informacion proporcionada | Apache 2.0 | Modelo base; sin comparacion controlada publicada frente al ajuste |
| Otros modelos de 3B de la familia SmolLM | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de benchmarks ni especificaciones de alternativas en la informacion proporcionada para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Modelo educativo: el autor lo describe explicitamente como un experimento de fine-tuning, no como un modelo listo para produccion.
- Sin comparacion controlada: no se evaluo el ajuste frente al modelo base, por lo que no se puede atribuir la puntuacion de GSM8K al SFT.
- Entrenamiento muy limitado: 1.000 muestras, 1 epoca, 125 pasos y longitud maxima de 512 tokens; el modelo puede degradar el rendimiento del base en tareas fuera del dominio conversacional.
- Riesgo de alucinacion: inherente a los modelos de 3B y no mitigado especificamente en este ajuste.
- Sesgos: no documentados; el dataset SmolTalk2 puede introducir sesgos propios de conversaciones cotidianas.
- Idiomas: no especificados; no hay garantia de comportamiento multilingue.
- Contexto: aunque el modelo base pueda soportar contextos mayores, el entrenamiento a 512 tokens puede limitar la coherencia en conversaciones largas.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Tokenizer: se documento un problema de compatibilidad resuelto con Transformers 4.55.4; pueden aparecer incidencias en otras versiones.
- Documentacion generada con asistencia de ChatGPT, segun el propio autor; conviene verificar los datos antes de usarlos en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EvanHuang66/SmolLM3-Unit1-SFT
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Dataset de evaluacion: https://huggingface.co/datasets/EvanHuang66/details_EvanHuang66__SmolLM3-Unit1-SFT
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceTB/smoltalk2
- Curso smol de Hugging Face: no disponible en la informacion proporcionada (referenciado como "smol course")
- Paper de SmolLM3: no disponible en la informacion proporcionada

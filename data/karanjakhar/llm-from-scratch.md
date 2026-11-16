# karanjakhar/llm-from-scratch

## Resumen

`karanjakhar/llm-from-scratch` es un conjunto de checkpoints de modelos GPT entrenados desde cero como material didactico del libro y curso *Building an LLM from scratch*. No es un modelo pensado para produccion ni para asistencia de codigo: son artefactos de ensenanza que permiten a los alumnos saltarse las horas de preentrenamiento y centrarse en las etapas posteriores del curso (fine-tuning, evaluacion, despliegue). El repositorio incluye tres ficheros: un modelo base de 30M de parametros preentrenado con 590M tokens, su version tras supervised fine-tuning (SFT), y un modelo "capstone" de 92M de parametros preentrenado con 1.8B tokens.

La arquitectura es un transformer tipo GPT implementado a mano, con tokenizer propio de 8.192 tokens y pesos en formato PyTorch plano (`config` + `model` state dict). No es compatible con `transformers`, lo que refuerza su caracter educativo: obliga a usar la implementacion del propio repositorio. El modelo solo soporta ingles y algo de codigo Python, y sus resultados en HumanEval son practicamente nulos (0% en el workhorse, 3,05% en el capstone), algo que el propio autor declara abiertamente en la model card.

Su relevancia es, por tanto, didactica: sirve como referencia reproducible para estudiar el ciclo completo de entrenamiento de un LLM (tokenizacion, preentrenamiento, SFT, evaluacion) sin necesidad de infraestructura de gran escala. No debe confundirse con un modelo de proposito general ni evaluarse con los criterios habituales de un modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo GPT (implementacion propia, no compatible con `transformers`) |
| Parametros totales | 30M (workhorse base y SFT) / 92M (capstone) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (tokenizer de 8.192 tokens; la ventana de contexto no se especifica) |
| Tipos de cuantizacion | no disponible (pesos en PyTorch plano, sin versiones GGUF/AWQ/GPTQ publicadas) |
| Idiomas soportados | Ingles (con preentrenamiento mayoritario en Python) |
| Licencia | MIT |
| Formato de pesos | PyTorch state dict (`final.pt` con claves `config` y `model`) |

## Arquitectura y entrenamiento

Los tres checkpoints son transformers decoder-only tipo GPT, implementados desde cero en el repositorio del curso. El workhorse (30M) se preentreno con 590M tokens, con una composicion del 85% Python y 15% ingles. El capstone (92M) se preentreno con 1.8B tokens (la model card no detalla la composicion de este dataset). El workhorse dispone ademas de una version tras supervised fine-tuning orientada a la tarea "docstring a funcion", es decir, generar el cuerpo de una funcion Python a partir de su docstring.

Cada fichero es un diccionario PyTorch plano con los hiperparametros del modelo (`config`) y el state dict (`model`), cargado por la implementacion GPT del propio repositorio y con su tokenizer propio de 8.192 tokens. No hay integracion con `transformers`, ni decodificacion especulativa, ni atencion lineal, ni tecnicas de optimizacion destacables: el interes esta en la simplicidad y en la reproducibilidad del pipeline de entrenamiento, no en innovaciones arquitectonicas. No se documenta en la informacion disponible el uso de RLHF o DPO.

## Capacidades

- Generacion de texto en ingles a nivel basico, limitada por el tamano del modelo (30M y 92M de parametros).
- Generacion de codigo Python muy acotada: el workhorse SFT esta entrenado especificamente para la tarea docstring a funcion.
- Tokenizacion propia de 8.192 tokens, entrenada junto al modelo.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues practicamente inexistentes: solo ingles (y Python como lenguaje de codigo).
- No tiene vision, audio, thinking mode ni ninguna capacidad multimodal.
- No dispone de entrenamiento de seguridad ni de alineacion mas alla del SFT del workhorse.

## Casos de uso

- Docencia y aprendizaje del ciclo de entrenamiento de un LLM: el alumno descarga los checkpoints con `course/get_checkpoints.py` y se salta el preentrenamiento para centrarse en SFT, evaluacion y despliegue.
- Estudio de tokenizadores: el tokenizer propio de 8.192 tokens permite analizar decisiones de vocabulario y su impacto en la generacion, algo que con tokenizers de produccion queda oculto.
- Reproduccion de experimentos de SFT: el par workhorse base / workhorse SFT permite comparar el efecto del fine-tuning sobre la tarea docstring a funcion con un coste computacional minimo.
- Analisis de curvas de escalado a pequena escala: comparar el workhorse (30M, 590M tokens) con el capstone (92M, 1.8B tokens) permite estudiar empiricamente la relacion entre parametros, tokens y rendimiento en HumanEval (0% frente a 3,05%).
- Practicas de evaluacion: el modelo sirve para que los alumnos implementen y ejecuten benchmarks como HumanEval pass@1 sobre un modelo cuyo rendimiento conocido es bajo, lo que facilita detectar errores en el pipeline de evaluacion.
- Experimentos de interpretabilidad y visualizacion de attention en un modelo que cabe en cualquier GPU consumer, sin necesidad de infraestructura dedicada.
- Base para ejercicios de despliegue: cargar un state dict PyTorch plano y servirlo con un script propio es un ejercicio realista de ingenieria de inferencia a pequena escala.

## Benchmarks y rendimiento

| Benchmark | Workhorse (30M) | Capstone (92M) |
|---|---|---|
| HumanEval pass@1 (greedy) | 0% | 3,05% (5 de 164) |

No se han publicado otros resultados de benchmarks en la informacion disponible. El autor declara explicitamente que a este tamano no hay conocimiento del mundo, ni razonamiento multi-paso, ni entrenamiento de seguridad.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa para el workhorse (120 MB de pesos) y en torno a 0,4 GB para el capstone (369 MB de pesos); con overhead de activaciones y tokenizer, cualquier GPU con 2 GB o mas es suficiente.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) o incluso CPU para inferencia puntual; no requiere A100 ni H100.
- Cabe holgadamente en GPU consumer y en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: no es compatible con vLLM, TGI ni llama.cpp/Ollama al no estar en formato `transformers` ni GGUF; el despliegue se realiza cargando el state dict con la implementacion GPT del repositorio del curso.
- Latencia y throughput estimados: no disponible en la informacion proporcionada; por el tamano, la latencia por token sera del orden de milisegundos en GPU consumer.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval pass@1 | Licencia | Formato |
|---|---|---|---|---|---|
| karanjakhar/llm-from-scratch (capstone) | 92M | no disponible | 3,05% | MIT | PyTorch state dict |
| karanjakhar/llm-from-scratch (workhorse) | 30M | no disponible | 0% | MIT | PyTorch state dict |
| Alternativas comparables de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de modelos comparables de la misma categoria (checkpoints educativos de menos de 100M de parametros entrenados desde cero) con datos verificables de parametros, contexto y rendimiento.

## Limitaciones y advertencias

- Rendimiento practicamente nulo en generacion de codigo: 0% en HumanEval para el workhorse y 3,05% para el capstone; no es util como asistente de programacion.
- Ausencia total de conocimiento del mundo y de razonamiento multi-paso, segun declara el propio autor.
- Sin entrenamiento de seguridad ni alineacion: puede generar contenido inapropiado sin filtros.
- Riesgo alto de alucinacion y de texto incoherente por el tamano reducido del modelo.
- Solo soporta ingles (y Python como lenguaje de codigo); no hay capacidades multilingues.
- La longitud de contexto no esta documentada; el tokenizer tiene 8.192 tokens, pero la ventana efectiva del modelo no se especifica.
- No es compatible con `transformers`, vLLM, TGI, llama.cpp ni Ollama; requiere la implementacion GPT del repositorio del curso.
- Licencia MIT: permite uso comercial, pero el modelo no es adecuado para produccion por sus limitaciones tecnicas.
- El autor lo describe explicitamente como "teaching artifacts, not coding assistants"; no debe evaluarse con los criterios de un modelo de proposito general.

## Enlaces

- Hugging Face: https://huggingface.co/karanjakhar/llm-from-scratch
- Repositorio del curso: https://github.com/karanjakhar/llm-from-scratch
- Curso: https://karanjakhar.dev/course/
- Model card completa con resultados y limitaciones: https://github.com/karanjakhar/llm-from-scratch/blob/main/MODEL_CARD.md

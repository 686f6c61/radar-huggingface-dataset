# danielohayon/granite-4.2-8b-art-classify-alora

## Resumen

El modelo `danielohayon/granite-4.2-8b-art-classify-alora` es un adaptador aLoRA (una variante de LoRA de mayor rango) entrenado sobre el modelo base `ibm-granite/granite-4.2-8b` de IBM. Lo desarrolla el usuario danielohayon y resuelve una tarea muy concreta de clasificación en el dominio de la seguridad: dado un conjunto de comandos o acciones observadas, predecir la técnica de MITRE ATT&CK correspondiente (identificador y nombre) con razonamiento de cadena de pensamiento. No es un modelo independiente, sino un adaptador de pesos que se carga junto al modelo base mediante la librería `peft`.

Su relevancia es acotada pero clara: demuestra que un ajuste fino de bajo rango sobre un modelo generalista de 8B puede pasar de una precisión prácticamente nula (0,048 de precisión con crédito parcial en el modelo base) a 0,483 con este adaptador, en un benchmark propio de 147 ejemplos y 97 técnicas distintas. Es material de investigación sobre ajuste fino en dominio de seguridad, no un sistema de detección listo para producción.

El adaptador se serializa como un LoRA estándar de `peft`, ocupa 0,4 GB en el repositorio y se distribuye con licencia Apache 2.0. Solo declara soporte de inglés y no publica especificaciones propias de contexto o cuantización, que hereda del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador aLoRA (LoRA de alto rango) sobre transformer `ibm-granite/granite-4.2-8b`; se serializa como LoRA estándar de `peft` |
| Parametros totales | no disponible (el adaptador ocupa 0,4 GB; el modelo base es de 8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información del adaptador; el entrenamiento usó una longitud máxima de secuencia de 12228 tokens |
| Tipos de cuantizacion | no disponible (el adaptador se entrena en bf16; la cuantización dependería del modelo base) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador `peft`) |

## Arquitectura y entrenamiento

El adaptador es un aLoRA con rango r=64 y alpha=128, aplicado sobre las proyecciones de atención (q, k, v, o) y las capas MLP (gate, up, down) del modelo base Granite 4.2 8B. La receta de entrenamiento usa una tasa de aprendizaje de 4e-5, 10 épocas, programación coseno con un 0,1 de warmup, weight decay de 0,01 y NEFTune con valor 5. El tamaño de lote efectivo es 24, la longitud máxima de secuencia es de 12228 tokens y el entrenamiento se realiza en bf16. El mejor checkpoint se selecciona por precisión con crédito parcial en validación sobre el benchmark propio.

El conjunto de datos de entrenamiento no se detalla en la información disponible; solo se referencia el dataset de evaluación `danielohayon/art-mitre-classify-eval`. No se menciona uso de RLHF ni DPO. La tarea es de clasificación con razonamiento de cadena de pensamiento: el modelo genera la técnica MITRE ATT&CK (identificador y nombre) a partir de trazas de comandos ya recogidas. El autor advierte que la comparación entre los tres adaptadores del proyecto (LoRA, aLoRA y shadow-residual) es a nivel de receta, no aislada por arquitectura, porque cada método usa su propia tasa de aprendizaje y rango por defecto.

## Capacidades

- Clasificación de técnicas MITRE ATT&CK a partir de conjuntos de comandos o acciones observadas, devolviendo identificador y nombre de la técnica.
- Razonamiento de cadena de pensamiento (chain-of-thought) durante la clasificación.
- Generación de texto conversacional heredada del modelo base Granite 4.2 8B.
- No se declara soporte de tool calling ni function calling en la información disponible.
- No se declara soporte de agentes ni de razonamiento multi-paso más allá del CoT de la tarea.
- Capacidad multilingüe limitada al inglés según la model card.
- No se declaran capacidades de visión ni de audio.

## Casos de uso

- Investigación sobre ajuste fino en dominio de seguridad: permite reproducir y comparar recetas (LoRA frente a aLoRA frente a shadow-residual) sobre un mismo modelo base y un mismo conjunto de datos, con métricas de crédito parcial y coincidencia exacta.
- Etiquetado asistido de trazas de comandos: dado un registro de acciones ya recogido por una herramienta de telemetría, el adaptador propone la técnica MITRE ATT&CK correspondiente para su revisión posterior por un analista.
- Construcción de datasets de seguridad: se puede usar para preanotar grandes volúmenes de trazas y reducir el esfuerzo manual de etiquetado, aceptando la tasa de error conocida (0,483 de precisión con crédito parcial).
- Enriquecimiento de informes de incidentes: a partir de la secuencia de comandos de un incidente, generar una propuesta de técnica ATT&CK que sirva como punto de partida en la documentación.
- Docencia y formación en seguridad: ejemplos interactivos que muestran cómo se mapean comandos concretos a técnicas ATT&CK con razonamiento explícito.
- Evaluación de modelos base para tareas de clasificación de seguridad: el adaptador y su benchmark sirven como referencia para medir cuánto mejora un modelo generalista tras un ajuste de bajo rango en esta tarea.

## Benchmarks y rendimiento

Resultados en el benchmark ART MITRE classify (147 ejemplos, 97 técnicas distintas), con decodificación greedy y precisión con crédito parcial:

| Modelo | Precisión con crédito parcial | Precisión de coincidencia exacta |
|---|---|---|
| Base (`ibm-granite/granite-4.2-8b`) | 0,048 | 0,034 |
| + LoRA | 0,415 | 0,401 |
| + aLoRA (este adaptador) | 0,483 | 0,442 |
| + shadow-residual | 0,531 | 0,503 |

El autor advierte que la comparación es a nivel de receta: cada adaptador usa su propia tasa de aprendizaje por defecto (LoRA y aLoRA 4e-5; shadow-residual 2e-4) y su propio rango, por lo que no es una comparación aislada por arquitectura ni igualada en tasa de aprendizaje.

## Requisitos de hardware

- El adaptador en sí ocupa 0,4 GB, pero requiere cargar el modelo base `ibm-granite/granite-4.2-8b` completo para la inferencia.
- VRAM estimada para el modelo base en bf16: aproximadamente 16 GB solo para los pesos, más memoria para el contexto y el estado de inferencia.
- GPU recomendadas para bf16: A100 (40 o 80 GB), H100 o GPUs con al menos 24 GB de VRAM.
- En GPUs de consumo: es viable en RTX 4090 (24 GB) en bf16 con contexto moderado; en GPUs de 16 GB o menos haría falta cuantización del modelo base, cuyo soporte no se detalla en la información disponible.
- Despliegue: carga con `transformers` + `peft` (verificado por el autor). No se documentan opciones como vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión (crédito parcial) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `granite-4.2-8b-art-classify-alora` (este) | Adaptador sobre 8B | no disponible | 0,483 | apache-2.0 | Hugging Face |
| `granite-4.2-8b-art-classify-lora` | Adaptador sobre 8B | no disponible | 0,415 | no disponible | Hugging Face |
| `granite-4.2-8b-art-classify-shadow-residual` | Adaptador sobre 8B | no disponible | 0,531 | no disponible | Hugging Face |
| `ibm-granite/granite-4.2-8b` (base) | 8B | no disponible | 0,048 | no disponible | Hugging Face |

Las tres alternativas comparten modelo base, datos y receta de 10 épocas; difieren en el método de adaptación y en la tasa de aprendizaje por defecto de cada método.

## Limitaciones y advertencias

- No es un sistema de detección para producción: el propio autor lo califica como investigación sobre ajuste fino en dominio de seguridad; predice una etiqueta para trazas ya recogidas, no detecta actividad en tiempo real.
- Precisión limitada: 0,483 de crédito parcial y 0,442 de coincidencia exacta implican que más de la mitad de las predicciones no coinciden exactamente con la técnica correcta.
- Benchmark pequeño y propio: 147 ejemplos y 97 técnicas, lo que limita la generalización de las cifras a otros dominios o formatos de trazas.
- Riesgo de alucinación: al generar identificadores y nombres de técnicas con CoT, puede producir identificadores ATT&CK inexistentes o mal emparejados.
- Solo inglés declarado; el rendimiento en otros idiomas no está evaluado.
- Comparación entre adaptadores no aislada por arquitectura ni igualada en tasa de aprendizaje, según advierte el autor.
- Licencia Apache 2.0 en el adaptador; conviene verificar la licencia del modelo base para uso comercial.
- Sin datos publicados de sesgos, latencia, throughput ni soporte de cuantización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/danielohayon/granite-4.2-8b-art-classify-alora
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-8b
- Dataset de evaluación: https://huggingface.co/datasets/danielohayon/art-mitre-classify-eval
- Adaptador LoRA comparable: https://huggingface.co/danielohayon/granite-4.2-8b-art-classify-lora
- Adaptador shadow-residual comparable: https://huggingface.co/danielohayon/granite-4.2-8b-art-classify-shadow-residual
- MITRE ATT&CK: https://attack.mitre.org/

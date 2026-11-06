# asparius/qwen38-opus55-sft-lora

## Resumen

`asparius/qwen38-opus55-sft-lora` es un adaptador LoRA de ajuste supervisado (SFT) publicado por el usuario asparius sobre el modelo base `Qwen/Qwen3.8-27B`. No se trata de un modelo completo, sino de un adaptador PEFT de 1,0 GB que se carga sobre los pesos del modelo base. Su propósito declarado es la destilación de respuestas del profesor `claude-opus-5-5` en el estudiante Qwen3.8-27B, con el objetivo de estudiar si la propensión al *reward hacking* se transfiere desde un profesor de frontera a un modelo más pequeño.

El adaptador se entrenó sobre el dataset `asparius/dolci-instruct-sft-opus5.5`, compuesto por 9.961 completaciones *answer-only* (solo respuesta, sin cadena de razonamiento) sobre los mismos 10.000 prompts que una ejecución previa con Opus 4.7. La configuración LoRA es r=32, alpha=64, target `all-linear`, precisión bf16 y dropout 0,05. El resultado es un adaptador ligero que modifica el comportamiento del modelo base sin alterar su arquitectura ni su ventana de contexto.

La relevancia del artefacto es fundamentalmente de investigación: la model card incluye una evaluación de *reward hacking* sobre ImpossibleBench-LCB (split conflictivo) que compara el estudiante destilado con el modelo base sin entrenar, mostrando que la destilación transfiere capacidad sin un aumento medible de la propensión al *hacking*. No obstante, se trata de un experimento con un único seed y un tamaño de muestra reducido (n=103), por lo que sus conclusiones deben tomarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3.8-27B |
| Parametros totales | no disponible (el adaptador LoRA ocupa 1,0 GB en el repo; el base Qwen3.8-27B no reporta desglose en la informacion disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la informacion del adaptador (heredada del base Qwen3.8-27B, no especificada) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en bf16; el base admite las cuantizaciones propias de Qwen3.8-27B, no detalladas) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 con alpha 64 aplicado sobre todas las capas lineales (`all-linear`) del modelo base Qwen3.8-27B, en precisión bf16 y con dropout 0,05. El entrenamiento consistió en 1 época con learning rate 1e-4, longitud máxima de 4096 tokens y una partición de 9.718 ejemplos de entrenamiento y 199 de evaluación. Las métricas reportadas son train_loss 0,6715, eval_loss 0,6187 y una precisión de tokens en evaluación de 0,819.

Los datos provienen de `asparius/dolci-instruct-sft-opus5.5`: 9.961 completaciones *answer-only* generadas por el profesor `claude-opus-5-5` sobre los mismos 10.000 prompts utilizados en una ejecución anterior con Opus 4.7. El enfoque *answer-only* implica que el estudiante aprende a producir respuestas finales sin cadena de razonamiento explícita, lo que condiciona el perfil de uso del adaptador. No se menciona en la información disponible el uso de RLHF, DPO ni ninguna otra etapa de alineamiento posterior al SFT.

La innovación metodológica destacable no está en la arquitectura sino en el diseño experimental: la model card evalúa explícitamente la transferencia de *reward hacking* mediante el benchmark ImpossibleBench-LCB (split conflictivo), con n=103, 200 mensajes, 10 intentos y seed 42, variando el esfuerzo de razonamiento por petición. El resultado principal es que el estudiante sigue de cerca al base sin entrenar, con la misma palanca dominante de razonamiento y el mismo suelo de 0 en el arnés mínimo con razonamiento desactivado.

## Capacidades

- Generación de texto y respuestas *answer-only*: el adaptador está entrenado para producir respuestas finales sin cadena de razonamiento explícita, lo que encaja con tareas de respuesta directa.
- Razonamiento condicionado por el esfuerzo: la evaluación reportada modula el comportamiento según el nivel de esfuerzo de razonamiento (off, low, medium, xhigh), lo que sugiere que el adaptador respeta esa palanca del modelo base.
- Herramientas y *harness*: la evaluación se realiza con dos arneses (con herramientas y mínimo), y el adaptador muestra comportamiento diferenciado entre ambos, lo que indica sensibilidad al entorno de herramientas.
- Destilación de estilo y contenido: al haberse entrenado sobre completaciones de un profesor de frontera, el adaptador reproduce patrones de respuesta de ese profesor.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo *thinking*: no disponible como capacidad propia del adaptador; el base Qwen3.8-27B puede exponer modos de razonamiento, pero el adaptador se entrenó en modo *answer-only*.
- Visión, audio, *tool calling* nativo: no disponible en la información proporcionada.

## Casos de uso

- Estudio de transferencia de *reward hacking*: el adaptador sirve como artefacto reproducible para investigar si la propensión al *hacking* de un profesor de frontera se transfiere a un estudiante menor, usando ImpossibleBench-LCB con los parámetros reportados (n=103, seed 42, 10 intentos).
- Investigación sobre destilación *answer-only*: permite comparar el efecto de entrenar solo con respuestas finales frente a entrenar con cadenas de razonamiento, sobre los mismos 10.000 prompts que la ejecución con Opus 4.7.
- Reproducción de experimentos de alineamiento: al publicarse la configuración LoRA completa (r=32, alpha=64, lr 1e-4, 1 época), facilita replicar o variar el entrenamiento en entornos controlados.
- Evaluación de sensibilidad al *harness* de herramientas: útil para medir cómo cambia la tasa de *hacking* entre un arnés con herramientas y uno mínimo, un escenario relevante para diseñar entornos de evaluación de agentes.
- Ajuste fino ligero sobre Qwen3.8-27B en dominios acotados: el adaptador demuestra un flujo PEFT funcional (carga con `PeftModel.from_pretrained`) que puede servir de plantilla para SFT de bajo coste sobre el mismo base.
- Docencia y formación en PEFT: el repositorio, de 1,0 GB, es un ejemplo compacto de adaptador LoRA con métricas de entrenamiento y evaluación publicadas, adecuado para prácticas sobre destilación y evaluación de alineamiento.

## Benchmarks y rendimiento

La model card reporta únicamente la evaluación de *reward hacking* sobre ImpossibleBench-LCB (split conflictivo), con tasa de *hacking* (hack rate), n=103, 200 mensajes, 10 intentos y seed 42:

| Esfuerzo | Arnés con herramientas | Arnés mínimo |
|---|---|---|
| thinking off | 0,456 | 0,000 |
| low | 0,971 | 0,563 |
| medium | 0,932 | 0,583 |
| xhigh | 0,971 | 0,971 |

No se han publicado resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica para el adaptador; depende del modelo base Qwen3.8-27B y de la cuantización elegida, no detallada en la información proporcionada.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; el adaptador en sí ocupa 1,0 GB, pero requiere cargar el base completo, cuyo perfil de memoria no se especifica.
- Opciones de despliegue: carga mediante `peft` + `transformers` (ejemplo incluido en la model card con `PeftModel.from_pretrained` y `AutoModelForCausalLM` en bfloat16). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| asparius/qwen38-opus55-sft-lora | LoRA SFT sobre Qwen3.8-27B | no disponible (adaptador 1,0 GB) | no disponible | other | Hugging Face |
| Qwen/Qwen3.8-27B (base) | Modelo completo | 27B (por nombre) | no disponible | no disponible | Hugging Face |
| Ejecución previa con Opus 4.7 | Destilación SFT (referencia experimental) | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre estos artefactos en la información proporcionada, más allá de la referencia cualitativa de la model card a que el estudiante sigue de cerca al base sin entrenar en la evaluación de *reward hacking*.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere cargar el base `Qwen/Qwen3.8-27B`; el adaptador por sí solo no genera texto.
- Entrenado en modo *answer-only*: no se espera que produzca cadenas de razonamiento explícitas, lo que limita su uso en tareas que se beneficien de *thinking* visible.
- Evaluación limitada: la conclusión sobre ausencia de aumento de *reward hacking* se basa en un único seed (42), n=103 y 10 intentos; no debe generalizarse sin replicación.
- Licencia `other`: no se especifican los términos exactos, por lo que el uso comercial requiere revisar las condiciones del autor y del modelo base antes de desplegarlo.
- Idiomas soportados no documentados: no hay garantía de comportamiento multilingüe más allá de lo que herede del base.
- Riesgo de alucinación: no evaluado en la información disponible; como todo modelo generativo, puede producir contenido incorrecto con apariencia de veracidad.
- Sesgos: no documentados en la model card; los sesgos del profesor y del dataset de destilación pueden transferirse al estudiante.
- Contexto y cuantizaciones no especificados: no se detallan límites de ventana ni formatos cuantizados compatibles con el adaptador.
- Madurez del artefacto: 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/asparius/qwen38-opus55-sft-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/asparius/dolci-instruct-sft-opus5.5
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper, blog, repositorio o demo adicionales: no disponible en la información proporcionada.

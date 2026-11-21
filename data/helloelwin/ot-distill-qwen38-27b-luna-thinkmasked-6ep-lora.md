# helloelwin/ot-distill-qwen38-27b-luna-thinkmasked-6ep-lora

## Resumen

`ot-distill-qwen38-27b-luna-thinkmasked-6ep-lora` es un adaptador LoRA de tipo PEFT desarrollado por el usuario `helloelwin` sobre el modelo base `Qwen/Qwen3.8-27B`. El adaptador se ha destilado a partir de trayectorias del agente Terminus-2 generadas por "GPT-6 Luna" sobre las tareas del dataset OpenThoughts-Agent-SFT-3.16K (3.134 filas). La particularidad del entrenamiento es que los bloques `<think>` de las trayectorias del profesor se han enmascarado en la funcion de perdida: el estudiante ve el resumen de razonamiento de Luna como entrada, pero solo se optimiza para reproducir las acciones (JSON de Terminus-2) y el cierre de turno.

El objetivo del adaptador es transferir el comportamiento agentico del profesor a un modelo abierto de 27.000 millones de parametros, sin ensenar al estudiante a generar razonamiento explicito cuando el profesor no lo emitia. Se trata, por tanto, de un experimento de destilacion de trayectorias orientado a agentes, no de un modelo de proposito general. El repositorio ocupa 3,7 GB y contiene unicamente los pesos del adaptador, no el modelo base.

La relevancia es doble: por un lado, explora como se comporta un estudiante de 27B cuando se le priva de la senal de razonamiento del profesor; por otro, publica variantes controladas (con resumenes, sin resumenes y con resumenes enmascarados) que permiten comparar el efecto del enmascaramiento. No obstante, el modelo es muy reciente (creado el 21 de noviembre de 2026), no tiene descargas ni valoraciones, y el autor aun no ha publicado las evaluaciones de desalineacion prometidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer Qwen3.8 (incluye proyecciones Gated DeltaNet) |
| Parametros totales | no disponible (el adaptador entrena 0,93B; el modelo base es de 27B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | 32.768 tokens (truncamiento durante el entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen3.8-27B`, un transformer con proyecciones Gated DeltaNet en el modelo de texto. El LoRA usa rango 128, alpha 256 y dropout 0,05 en todas las capas lineales del modelo de texto (atencion, MLP y proyecciones Gated DeltaNet), lo que resulta en 0,93B de parametros entrenables. Los nombres de las claves siguen el esquema de modelo completo (`base_model.model.model.language_model.layers.N...`), compatible directamente con vLLM; para usar con `peft` y `AutoModelForCausalLM` hay que renombrar el prefijo a `base_model.model.model.layers.`.

El entrenamiento parte del dataset `helloelwin/ot-distill-gpt-6-luna-3.16k-sft` (3.134 filas) con trayectorias del agente Terminus-2 generadas por GPT-6 Luna. Se usan 6 epocas (1.176 pasos), learning rate pico de 3e-4 con decaimiento coseno y un 3% de warmup, batch efectivo de 16 (4 GPUs x acumulacion 4) y precision bf16. La perdida se calcula en cada turno del asistente excepto en el tramo `<think>...</think>`, con 7,7M de tokens entrenados por epoca y truncamiento a 32.768 tokens. La perdida media por epoca fue de 0,451 y 0,332 (parcial). El repositorio incluye solo la carpeta `epoch-1`, aunque la receta y los comandos de ejemplo hacen referencia a `epoch-6`, lo que constituye una inconsistencia entre el contenido publicado y la documentacion.

## Capacidades

- Generacion de acciones agenticas en formato JSON de Terminus-2, el formato nativo del profesor destilado.
- Razonamiento implicito: el estudiante no se entrena para escribir bloques `<think>`, pero recibe el resumen de razonamiento de Luna como entrada cuando existe.
- Ejecucion de tareas de agente multi-paso sobre el conjunto OpenThoughts-Agent-SFT-3.16K.
- Soporte de tool calling y function calling heredado del formato Terminus-2 y del modelo base Qwen3.8.
- Capacidades del modelo base Qwen3.8-27B (generacion de texto, codigo, matematicas y multilingue), aunque el adaptador no las refuerza y puede degradarlas.
- No se documentan capacidades de vision ni audio; el comando de vLLM desactiva explicitamente imagen y video (`--limit-mm-per-prompt '{"image":0,"video":0}'`).
- Parser de razonamiento `qwen3` habilitado en el ejemplo de despliegue.

## Casos de uso

- Investigacion en destilacion de agentes: comparar el comportamiento del estudiante con el de las variantes con resumenes (`...-new-data-v2-luna-6ep-lora`) y sin resumenes (`...-luna-nosummary-6ep-lora`) para aislar el efecto del enmascaramiento de `<think>` en la perdida.
- Evaluacion de alineacion en agentes: el autor preve publicar evaluaciones con StrongREJECT, XSTest, CoCoNot, MASK y misalignment agentico, con juez local Llama-3.3-70B y 5 muestras por prompt; el adaptador sirve como sujeto de esas pruebas.
- Reproduccion de trayectorias Terminus-2: desplegado con vLLM y `--reasoning-parser qwen3`, puede ejecutar tareas del conjunto OpenThoughts-Agent-SFT-3.16K imitando las acciones del profesor.
- Estudio de la relacion entre razonamiento explicito y rendimiento agentico: al no entrenarse en la generacion de `<think>`, permite medir cuanto del comportamiento agentico depende de la verbalizacion del razonamiento.
- Base para fine-tuning posterior: al ser un adaptador PEFT de rango 128, puede combinarse o continuarse con otros adaptadores sobre Qwen3.8-27B en pipelines de investigacion.
- Despliegue experimental en serving con vLLM: el ejemplo del autor muestra como cargar el LoRA con `--enable-lora --max-lora-rank 128`, util para probar integraciones de agentes en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que las evaluaciones de desalineacion (StrongREJECT, XSTest, CoCoNot, MASK y misalignment agentico) se anadiran cuando finalicen.

## Requisitos de hardware

- El adaptador pesa 3,7 GB y requiere cargar el modelo base Qwen3.8-27B completo; la VRAM depende de la cuantizacion del base, no del adaptador.
- Entrenamiento documentado: 4 GPUs con acumulacion 4 y batch efectivo 16 en bf16; no se especifica el modelo de GPU.
- Inferencia en bf16 del base de 27B: no disponible el dato exacto de VRAM; requiere GPUs de clase A100/H100 o equivalentes con suficiente memoria.
- Despliegue con vLLM: el autor proporciona un comando funcional con `--enable-lora --max-lora-rank 128` y `--lora-modules`.
- Uso con `peft`: requiere renombrar las claves de `base_model.model.model.language_model.layers.` a `base_model.model.model.layers.` antes de cargar con `AutoModelForCausalLM`.
- No se documentan opciones para llama.cpp, Ollama o TGI, ni latencia o throughput estimados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ot-distill-qwen38-27b-luna-thinkmasked-6ep-lora | 27B (base) + 0,93B entrenables | 32.768 (entrenamiento) | Destilacion agentica con `<think>` enmascarado | no disponible | Hugging Face, 0 descargas |
| ot-distill-qwen38-27b-new-data-v2-luna-6ep-lora | 27B (base) + LoRA | no disponible | Destilacion agentica con resumenes de razonamiento | no disponible | Hugging Face |
| ot-distill-qwen38-27b-luna-nosummary-6ep-lora | 27B (base) + LoRA | no disponible | Destilacion agentica sin resumenes | no disponible | Hugging Face |

Las tres variantes comparten modelo base, dataset y receta, y solo difieren en el tratamiento del razonamiento del profesor, lo que las convierte en el conjunto de comparacion natural. No se dispone de datos de rendimiento para ninguna de ellas.

## Limitaciones y advertencias

- Modelo sin descargas ni valoraciones y publicado hace menos de un dia respecto a la fecha de actualizacion; no hay evidencia externa de su calidad.
- El autor no ha publicado aun las evaluaciones de desalineacion; el riesgo de comportamientos no deseados en contextos agenticos no esta cuantificado.
- El adaptador solo contiene la carpeta `epoch-1`, mientras que la receta y el comando de ejemplo apuntan a `epoch-6`; hay que verificar que el checkpoint usado coincide con el documentado.
- El enmascaramiento de `<think>` implica que el estudiante no aprende a generar razonamiento explicito; puede degradar tareas que requieran cadena de pensamiento verbalizada.
- Licencia no disponible: no puede asumirse uso comercial sin consultar la licencia del modelo base Qwen3.8-27B y la del adaptador.
- Idiomas no documentados; el comportamiento multilingue depende del base y no ha sido evaluado tras la destilacion.
- Riesgo de alucinacion y de imitacion de acciones del profesor fuera de distribucion, dado el entrenamiento sobre un unico dataset de 3.134 filas.
- Sin soporte de vision ni audio en el despliegue recomendado.
- No se documentan cuantizaciones del adaptador ni del base para inferencia en hardware de consumo.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/helloelwin/ot-distill-qwen38-27b-luna-thinkmasked-6ep-lora
- Dataset de destilacion: https://huggingface.co/datasets/helloelwin/ot-distill-gpt-6-luna-3.16k-sft
- Variante con resumenes: https://huggingface.co/helloelwin/ot-distill-qwen38-27b-new-data-v2-luna-6ep-lora
- Variante sin resumenes: https://huggingface.co/helloelwin/ot-distill-qwen38-27b-luna-nosummary-6ep-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B

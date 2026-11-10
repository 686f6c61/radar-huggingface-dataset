# adidukrembzuai/MedChain-R1-4B

## Resumen

MedChain-R1-4B es un modelo de visión-lenguaje de 4.539 millones de parámetros (4,54 B) especializado en *grounding* médico secuencial: recibe una secuencia corta de imágenes médicas (radiografías, resonancias, tomografías) junto con una pregunta y devuelve, tras un razonamiento breve en etiquetas `<think>`, una única caja delimitadora en coordenadas de píxel dentro de etiquetas `<answer>`. Lo desarrolla el usuario adidukrembzuai (repositorio asociado a la cuenta de GitHub adinathdukre) y se construye por ajuste fino supervisado y RL sobre Qwen3.5-4B, un transformer multimodal con torre de visión congelada durante la fase de RL.

El modelo aborda un problema concreto poco cubierto por los MLLM generalistas: la localización visual de estructuras o hallazgos en estudios médicos cuando la evidencia está repartida entre varias imágenes (dos adquisiciones temporales, varias vistas, varios cortes o varias modalidades). Frente a los modelos generales, que en la benchmark MedSG-Bench obtienen entre 4 y 20 mIoU, este checkpoint alcanza 75,97 mIoU y 83,67 de precisión a IoU 0,5, con 4 B de parámetros.

Es relevante ahora porque demuestra que un modelo pequeño, con una licencia Apache 2.0 y entrenado sobre un corpus de razonamiento específico (152.396 secuencias), puede superar a MLLM médicos de 7 a 78 B en tareas de localización secuencial. El checkpoint publicado corresponde a la etapa CoT-SFT (checkpoint-2000) seguida de una época de GRPO sobre RL30K, con semilla 42.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje) derivado de Qwen3.5-4B; torre de visión congelada durante GRPO |
| Parametros totales | 4.539.265.536 (4,54 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; la model card solo documenta bf16 para inferencia) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 9,1 GB); librería transformers |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer multimodal con codificador de visión y proyector hacia el espacio del modelo de lenguaje. Sobre esa base se aplica un pipeline en dos etapas. La primera es un ajuste fino supervisado con cadenas de pensamiento (CoT-SFT) sobre el corpus MedChain: 152.396 secuencias de entrenamiento MedSG, cada una con una justificación condicionada por la caja anotada; los borradores de razonamiento los genera FlemingVL-38B y los refina Qwen3.5-397B-A17B usando la caja anotada como entrada privilegiada. La segunda etapa es GRPO con recompensa de IoU sobre un pool reservado de 30.000 prompts (3.750 por tarea), 8 rollouts por prompt y la torre de visión congelada.

El checkpoint publicado corresponde al paso 2000 de CoT-SFT seguido de una época de GRPO (paso 2500) sobre RL30K con semilla 42. La innovación técnica principal es el formato de salida estructurado: razonamiento corto en `<think>…</think>` seguido de una única caja en `<answer>(x1,y1),(x2,y2)</answer>` en coordenadas de píxel de la imagen objetivo, lo que permite entrenar con una recompensa geométrica directa (IoU) en lugar de con preferencias humanas. El modelo está entrenado y evaluado con una instrucción fija que debe añadirse a cada pregunta, y la generación por lotes produce salidas degeneradas en algunos checkpoints, por lo que la inferencia recomendada es de un ejemplo a la vez con decodificación greedy.

## Capacidades

- Localización visual (*grounding*) secuencial sobre secuencias de imágenes médicas, devolviendo una caja delimitadora en píxeles.
- *Grounding* de diferencias registradas y no registradas: localiza la región que cambia entre dos exploraciones.
- *Grounding* multi-vista: localiza la misma estructura en otra vista.
- Seguimiento de objetos (lesiones o estructuras) a través de cortes o puntos temporales.
- *Grounding* de conceptos: localiza la región que corresponde a un concepto descrito, a través de varias imágenes.
- Localización de parches: indica dónde se sitúa un parche dado dentro de la imagen objetivo.
- *Grounding* cross-modal: localiza el mismo hallazgo en otra modalidad (por ejemplo, de FLAIR a DWI).
- *Grounding* referido: localiza la región a la que alude una descripción textual.
- Razonamiento explícito en modo *thinking* mediante etiquetas `<think>` antes de la respuesta.
- Procesamiento multi-imagen en una misma conversación (pipeline `image-text-to-text`).
- Cobertura de 10 modalidades de imagen médica según MedSG-Bench (radiología, MRI, CT, entre otras).
- No se documenta soporte de *tool calling*, *function calling*, agentes multi-paso, audio ni vídeo.

## Casos de uso

- **Seguimiento longitudinal de lesiones oncológicas**: el modelo recibe dos estudios del mismo paciente en momentos distintos y localiza la región que ha cambiado, lo que permite cuantificar variaciones de tamaño o apariencia con una caja concreta sobre la imagen objetivo; es adecuado porque la tarea de diferencia registrada es una de las que mejor resuelve (83,5 mIoU).
- **Comparación entre modalidades en neurorradiología**: dado un hallazgo visible en FLAIR, el modelo localiza la misma región en DWI, apoyando la correlación entre secuencias sin intervención manual; la tarea cross-modal alcanza 84,0 mIoU.
- **Revisión de series de cortes en TC o MRI**: el modelo sigue una estructura o lesión a través de cortes consecutivos y devuelve la caja en el corte objetivo, útil para preanotar volúmenes antes de la revisión del radiólogo (66,7 mIoU en seguimiento de objetos).
- **Preanotación asistida para datasets de investigación**: el modelo genera cajas candidatas sobre imágenes médicas que luego se revisan y corrigen, reduciendo el coste de anotación en estudios de imagen; su licencia Apache 2.0 permite integrarlo en pipelines internos sin restricciones de uso comercial.
- **Correspondencia entre vistas en mamografía o radiología torácica**: dada una estructura en una proyección, el modelo la localiza en otra vista del mismo estudio (56,6 mIoU en multi-vista), lo que ayuda a verificar que se está midiendo la misma estructura.
- **Búsqueda visual de conceptos en cohortes de imágenes**: el modelo localiza la región que corresponde a un concepto descrito en texto sobre un conjunto de imágenes, útil para cribados exploratorios o para construir índices visuales de hallazgos (71,8 mIoU en concepto).
- **Verificación de recortes y parches en pipelines de control de calidad**: dado un parche extraído de una imagen, el modelo indica dónde encaja en la imagen objetivo (90,3 mIoU), lo que permite validar automáticamente recortes y alineamientos en preprocesado de datos médicos.

## Benchmarks y rendimiento

Resultados en MedSG-Bench (8 tareas, 10 modalidades, 9.630 ejemplos de test). MedChain-R1-4B evaluado con decodificación greedy, batch size 1, bf16, 1.200 tokens nuevos, sobre GPU AMD MI210.

| Modelo | Tamano | RDG | NRDG | MV | OT | Concept | Patch | Cross-modal | Referring | Avg IoU / Acc@0.5 |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Qwen2.5-VL | 72B | 4,37 | 3,46 | 7,22 | 13,11 | 10,33 | 26,45 | 16,32 | 20,19 | 13,35 / 6,12 |
| InternVL3 | 78B | 0,20 | 0,53 | 6,35 | 13,03 | 3,57 | 11,81 | 3,34 | 12,76 | 6,44 / 2,90 |
| Migician | 7B | 15,26 | 14,49 | 18,16 | 21,38 | 14,23 | 28,87 | 21,41 | 25,30 | 20,29 / 11,39 |
| HuatuoGPT-Vision | 34B | 1,44 | 2,15 | 9,41 | 13,25 | 6,43 | 14,53 | 10,60 | 8,60 | 8,57 / 2,09 |
| MedSeq-Grounder | 7B | 83,29 | 83,72 | 55,03 | 62,10 | 74,11 | 85,25 | 78,77 | 60,43 | 72,55 / 79,71 |
| Qwen3.5 zero-shot | 4B / 9B / 27B | 0,0 | 0,0 | 8,3–8,6 | 26,7–28,4 | 0,3–1,5 | 1,6–2,7 | 0,3 | 0,8–1,7 | 4,4–4,5 / 3,0–3,2 |
| MedChain-R1-4B (solo CoT-SFT) | 4B | 83,0 | 81,2 | 54,2 | 65,2 | 70,3 | 90,2 | 83,4 | 69,7 | 75,00 / 82,43 |
| MedChain-R1-9B | 9B | 84,4 | 83,5 | 58,4 | 68,5 | 75,5 | 91,3 | 84,8 | 72,0 | 77,54 / 84,87 |
| **MedChain-R1-4B** | 4B | 83,5 | 82,0 | 56,6 | 66,7 | 71,8 | 90,3 | 84,0 | 70,2 | 75,97 / 83,67 |

Abreviaturas: RDG/NRDG = *grounding* de diferencias registradas / no registradas; MV = multi-vista; OT = seguimiento de objetos. Las filas de MedChain-R1 se recalculan a partir de predicciones por ejemplo; los baselines son los números reportados para MedSG-Bench (MedSeq-Grounder está entrenado sobre MedSG-188K). El paso de GRPO mejora la media de 75,00 a 75,97 mIoU y de 82,43 a 83,67 en Acc@0,5 respecto al checkpoint solo CoT-SFT.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,54 B de parámetros, en bf16 se requieren aproximadamente 9,1 GB solo para pesos, más memoria para activaciones de la torre de visión y la caché KV; en la práctica, entre 12 y 16 GB para una sola imagen o un par de imágenes. No se documentan cifras oficiales de VRAM.
- GPU recomendadas: el modelo se evaluó en AMD MI210. Por tamaño, una NVIDIA A100 o H100 permite ejecutarlo con holgura y procesar secuencias de varias imágenes; una RTX 4090 (24 GB) también es viable en bf16.
- GPU de consumo: cabe en GPUs consumer de 16 GB o más en bf16; en tarjetas de 8-12 GB requeriría cuantización, y no se documentan pesos GGUF ni recetas de cuantización en la información disponible.
- Opciones de despliegue: la model card documenta `transformers==5.2.0` con `AutoModelForImageTextToText`, `AutoProcessor` y `qwen-vl-utils==0.0.14`. No se mencionan vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles. La model card advierte de que la generación por lotes produce salidas degeneradas en algunos checkpoints y recomienda generar un ejemplo a la vez con decodificación greedy y hasta 1.200 tokens nuevos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MedSG-Bench (mIoU / Acc@0.5) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| **MedChain-R1-4B** | 4,54 B | No disponible | 75,97 / 83,67 | Apache 2.0 | Hugging Face (transformers) |
| MedChain-R1-9B | 9 B (base Qwen3.5-9B) | No disponible | 77,54 / 84,87 | Apache 2.0 (segun model card) | Hugging Face |
| MedSeq-Grounder | 7 B | No disponible | 72,55 / 79,71 | No disponible | Entrenado sobre MedSG-188K; disponibilidad no detallada |
| Migician | 7 B | No disponible | 20,29 / 11,39 | No disponible | Modelo médico MLLM de referencia en la benchmark |
| Qwen2.5-VL | 72 B | No disponible | 13,35 / 6,12 | No disponible | Modelo generalista de referencia |

La comparación muestra que MedChain-R1-4B supera en media de IoU a MedSeq-Grounder (7 B) y queda a 1,57 puntos del MedChain-R1-9B, con menos de la mitad de parámetros. Frente a MLLM generalistas y médicos de mayor tamaño (Qwen2.5-VL 72B, InternVL3 78B, HuatuoGPT-Vision 34B, Migician 7B), la diferencia es de decenas de puntos de IoU, atribuible sobre todo a la especialización en la tarea y al formato de salida con caja explícita.

## Limitaciones y advertencias

- El modelo devuelve una única caja por consulta; no está pensado para segmentación densa ni para múltiples instancias simultáneas.
- Solo se documentan resultados en MedSG-Bench; no hay datos de rendimiento en otros conjuntos médicos ni en imágenes naturales.
- La generación por lotes puede producir salidas degeneradas en algunos checkpoints; la model card recomienda inferencia de un ejemplo a la vez.
- Requiere añadir una instrucción fija al final de cada pregunta (salida en `<think>` y `<answer>`); sin ella, el comportamiento no está garantizado.
- Riesgo de alucinación en la justificación `<think>`: el razonamiento puede sonar plausible sin corresponder a la caja devuelta, por lo que conviene validar la caja de forma independiente.
- Sesgos conocidos: no documentados. Al entrenarse sobre un corpus médico concreto (MedSG), puede heredar los sesgos de distribución de ese dataset (modalidades, poblaciones, equipos).
- Idiomas soportados: no disponibles; no se especifica si el modelo responde correctamente en castellano.
- Longitud de contexto: no disponible; el número de imágenes por consulta que admite sin degradación no está documentado.
- Uso clínico: no hay validación regulatoria ni estudio clínico; no debe usarse como dispositivo médico ni para decisiones diagnósticas sin supervisión profesional.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3.5-4B tiene sus propias condiciones que conviene revisar antes de redistribuir.
- El repositorio tiene 0 descargas y 0 *likes* en el momento de la consulta; es un checkpoint reciente sin validación independiente por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adidukrembzuai/MedChain-R1-4B
- Modelo hermano MedChain-R1-9B: https://huggingface.co/adidukrembzuai/MedChain-R1-9B
- Repositorio de código (evaluación incluida): https://github.com/adinathdukre/MedChain-R1
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0

# AbdulHadi053/trialmatch-qwen2.5-lora

## Resumen

TrialMatch-LM es un conjunto de adaptadores LoRA para el modelo base Qwen2.5-1.5B-Instruct, publicado por el usuario AbdulHadi053 en Hugging Face. Su proposito es el cribado de elegibilidad a nivel de criterio en ensayos clinicos: dado un paciente y un criterio de inclusion o exclusion, el adaptador determina si el paciente cumple dicho criterio. Se entrena sobre el split de entrenamiento de 37 pacientes del dataset ncbi/TrialGPT-Criterion-Annotations, con una particion agrupada por paciente y semilla 42.

El modelo se distribuye exclusivamente como adaptadores PEFT (LoRA) en formato safetensors, con un tamano de repositorio de 0,2 GB, y requiere descargar y combinar los pesos con el modelo base Qwen2.5-1.5B-Instruct. Incluye ademas un adaptador borrador basado en Qwen2.5-0.5B-Instruct pensado para decodificacion especulativa, lo que sugiere un pipeline de inferencia con un modelo pequeno que propone tokens y el modelo principal que los verifica.

La relevancia de esta publicacion es limitada y acotada: se trata de un prototipo de investigacion educativa, con cero descargas y cero likes en el momento de la consulta, sin model card extendida ni resultados de benchmarks publicados. El autor advierte explicitamente que no debe usarse para decisiones clinicas ni de enrolamiento. Su interes practico reside en servir como ejemplo reproducible de ajuste fino con LoRA sobre un modelo pequeno para una tarea de clasificacion textual especializada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen2.5-1.5B-Instruct |
| Parametros totales | No disponible (adaptadores LoRA; el modelo base tiene 1.500 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | No disponible (los adaptadores se distribuyen en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo no es una red completa, sino un conjunto de adaptadores de bajo rango (LoRA) que se aplican sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only de la familia Qwen2.5. La adaptacion se realiza mediante la libreria PEFT, y el repositorio contiene unicamente los pesos de los adaptadores junto con metadatos de seleccion de checkpoint (checkpoints/selected_model.json). El adaptador final se eligio segun el rendimiento en el split de validacion.

El entrenamiento se llevo a cabo sobre el split de entrenamiento de 37 pacientes del dataset ncbi/TrialGPT-Criterion-Annotations, con una particion agrupada por paciente y semilla 42, lo que evita filtracion de informacion entre pacientes en los conjuntos de entrenamiento y validacion. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO. El autor menciona un adaptador borrador basado en Qwen2.5-0.5B-Instruct destinado a decodificacion especulativa, una tecnica que acelera la generacion al usar un modelo pequeno para proponer tokens que el modelo principal valida en paralelo.

## Capacidades

- Clasificacion de elegibilidad a nivel de criterio: evalua si un paciente cumple un criterio concreto de inclusion o exclusion de un ensayo clinico.
- Razonamiento textual sobre datos clinicos estructurados y no estructurados, heredado del modelo base Qwen2.5-1.5B-Instruct.
- Generacion de texto en general, limitada por el tamano del modelo base (1.500 millones de parametros).
- Decodificacion especulativa mediante un adaptador borrador sobre Qwen2.5-0.5B-Instruct, orientada a reducir la latencia de inferencia.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling y function calling: no documentado para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Cribado automatizado de criterios de elegibilidad en investigacion clinica: el adaptador evalua pares paciente-criterio y devuelve una decision de cumplimiento, lo que permite prefiltrar candidatos antes de la revision manual por parte del equipo investigador.
- Prototipado de pipelines de reclutamiento en ensayos: al integrarse en un flujo que consulte criterios desde ClinicalTrials.gov y datos de pacientes seudonimizados, sirve para demostrar la viabilidad tecnica de un sistema de precribado.
- Generacion de conjuntos de datos etiquetados: el modelo puede usarse para anotar de forma asistida grandes volumenes de pares paciente-criterio y reducir el coste de anotacion manual, siempre con revision humana posterior.
- Investigacion sobre ajuste fino eficiente: sirve como ejemplo reproducible de entrenamiento LoRA sobre un modelo de 1.500 millones de parametros para una tarea de clasificacion binaria especializada, util en docencia y experimentacion.
- Evaluacion de decodificacion especulativa: el par de adaptadores (borrador de 0.5B y principal de 1.5B) permite medir ganancias de latencia en un caso real de clasificacion textual.
- Analisis de sesgo y robustez en modelos clinicos: al ser un prototipo abierto con licencia Apache 2.0, permite estudiar como un modelo pequeno ajustado con LoRA se comporta ante criterios ambiguos o pacientes con comorbilidades.
- Demostraciones educativas de cribado de elegibilidad: en entornos academicos se puede usar para ilustrar el flujo completo desde el criterio textual hasta la decision, sin riesgo de uso clinico real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; para el modelo base Qwen2.5-1.5B-Instruct en precision completa se requieren aproximadamente 3-4 GB, y en cuantizacion de 8 bits o 4 bits puede reducirse a 1-2 GB, aunque estos valores no estan confirmados en la informacion proporcionada.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por el tamano del modelo base, cabe en GPUs de consumo como RTX 3060, RTX 4060 o superiores, pero no se documenta oficialmente.
- Cabe en GPU de consumo: probablemente si, dado el tamano del modelo base, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: la libreria indicada es PEFT; el autor menciona un script `scripts/download_weights.py` del repositorio del proyecto para descargar los pesos. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| TrialMatch-LM (este modelo) | Adaptadores LoRA sobre 1.5B | No disponible | Apache 2.0 | Safetensors (PEFT) | Prototipo educativo, sin benchmarks publicados |
| Qwen2.5-1.5B-Instruct | 1.5B | No disponible en esta ficha | Apache 2.0 | Safetensors, GGUF | Modelo base sin ajuste para cribado clinico |
| TrialGPT (referencia del dataset) | No disponible | No disponible | No disponible | No disponible | Sistema de referencia para el que se construyo el dataset de anotaciones |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Uso exclusivamente educativo y de investigacion: el autor advierte explicitamente que no debe emplearse para decisiones clinicas ni de enrolamiento de pacientes.
- Entrenamiento sobre una muestra muy reducida: solo 37 pacientes en el split de entrenamiento, lo que limita la generalizacion a poblaciones y criterios fuera de la distribucion del dataset.
- Riesgo de alucinacion: como modelo generativo de 1.500 millones de parametros, puede producir justificaciones plausibles pero incorrectas sobre el cumplimiento de criterios.
- Sesgos potenciales: el dataset de origen puede reflejar sesgos de seleccion de ensayos, poblaciones y criterios; no se documenta ningun analisis de sesgo.
- Idiomas soportados no documentados: se desconoce si el adaptador mantiene el multilingueismo del modelo base o si el ajuste lo ha restringido al ingles del dataset.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas, lo que impide evaluar su calidad de forma objetiva.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el aviso del autor sobre el uso clinico debe respetarse como advertencia etica y de responsabilidad.
- Dependencia del modelo base: requiere descargar y combinar los pesos con Qwen2.5-1.5B-Instruct, y el script de descarga pertenece a un repositorio externo no enlazado en la informacion disponible.
- Madurez del repositorio: cero descargas y cero likes en el momento de la consulta, sin mantenimiento documentado ni issues publicos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AbdulHadi053/trialmatch-qwen2.5-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset de referencia: https://huggingface.co/datasets/ncbi/TrialGPT-Criterion-Annotations
- Repositorio del proyecto (mencionado en la model card, sin URL concreta en la informacion disponible): script `scripts/download_weights.py`
- Paper de TrialGPT: no disponible en la informacion proporcionada
- Blog o demo: no disponible en la informacion proporcionada

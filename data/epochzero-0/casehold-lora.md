# epochzero-0/casehold-lora

## Resumen

`casehold-lora` es un adaptador LoRA para el modelo base Qwen/Qwen2.5-0.5B, desarrollado por el usuario epochzero-0 y publicado en Hugging Face. Su unica funcion es resolver la tarea CaseHOLD del benchmark LexGLUE: dado un fragmento de una sentencia judicial estadounidense al que se le ha eliminado una cita (holding), el modelo debe seleccionar la correcta entre cinco candidatas etiquetadas de A a E. No es un modelo generativo de proposito general, sino un clasificador de opcion multiple construido sobre un modelo causal pequeno.

El interes tecnico del artefacto reside en su relacion rendimiento/tamano: con solo 2.162.688 parametros entrenados (el 0,436% del modelo base) y un entrenamiento de 62 minutos en una GPU de portatil (RTX 4050 Laptop, pico de 4,3 GiB de VRAM), alcanza un 85,92% de accuracy en el split de test de CaseHOLD, superando a BERT, RoBERTa-large, Legal-BERT y CaseLaw-BERT segun la tabla comparativa aportada por el autor. El adaptador se distribuye como matrices A y B en `adapter.safetensors`, no como checkpoint `peft` estandar, y requiere el codigo auxiliar del repositorio para cargarse.

La relevancia de esta ficha es doble: por un lado, documenta un resultado concreto sobre un benchmark juridico de referencia (LexGLUE); por otro, advierte de las peculiaridades de despliegue de un adaptador no convencional y de las limitaciones de un modelo de 0,5B de parametros especializado exclusivamente en una tarea de eleccion entre cinco opciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-0.5B) con adaptador LoRA sobre las proyecciones q/k/v/o de las 24 capas |
| Parametros totales | 494M en el modelo base; 2.162.688 parametros entrenados en el adaptador (0,436% del total) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 640 tokens de prompt (los prompts mas largos recortan texto del pasaje por la izquierda; las opciones nunca se recortan) |
| Tipos de cuantizacion | No disponible (el ejemplo de uso carga el modelo en `float32`; no se documentan otras precisiones) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | `adapter.safetensors` (matrices A y B del LoRA) mas configuracion en `adapter_config.json`; no es un checkpoint `peft` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B, un transformer decoder-only de 494M de parametros. El LoRA se implemento a mano en unas 30 lineas (`lora.py`), con rango r = 16 y alpha = 32, inyectado en las proyecciones query, key, value y output de las 24 capas del modelo. El autor verifico la equivalencia con `peft` usando los mismos pesos: los logits coinciden con una diferencia maxima de 0.0. El entrenamiento consistio en una sola epoca sobre las 45.000 preguntas de entrenamiento de CaseHOLD, con un bucle plano de PyTorch, optimizador AdamW, learning rate 2e-4, 16 preguntas por paso y autocast en bf16. El coste total fue de 62 minutos (1,04 GPU-horas) en una RTX 4050 Laptop, con un pico de 4,3 GiB de VRAM.

La innovacion metodologica no esta en la arquitectura sino en el enfoque de evaluacion: el modelo no genera texto libre, sino que se formula una unica pregunta por prompt (instruccion, pasaje, cinco holdings etiquetadas de A a E y el token `Answer:`) y se selecciona la respuesta comparando el logit de los tokens ` A` a ` E` en la ultima posicion. El autor declara haber usado una sola semilla, sin ajuste de hiperparametros, seleccionando el modelo en validacion y evaluandolo en test una unica vez, por lo que no se reporta intervalo de error. La accuracy en validacion crece con el tamano del conjunto de entrenamiento: 75,28% con 5.000 preguntas, 80,33% con 15.000 y 87,05% con 45.000.

## Capacidades

- Clasificacion de opcion multiple restringida a cinco candidatas: selecciona uno de los tokens ` A` a ` E` segun el logit en la ultima posicion.
- Resolucion de la tarea CaseHOLD: identificar la cita (holding) eliminada de un pasaje de jurisprudencia estadounidense.
- Procesamiento de pasajes juridicos en ingles con prompts de hasta 640 tokens (recorte por la izquierda del texto del pasaje cuando se excede).
- No soporta generacion de texto libre, tool calling, function calling, razonamiento multi-paso ni comportamiento agentico.
- No dispone de modo thinking, vision, audio ni capacidades multimodales.
- Capacidad multilingue limitada al ingles; no se documenta soporte de otros idiomas.

## Casos de uso

- Clasificacion automatica de citas en corpus jurisprudenciales: el adaptador puede procesar pasajes de sentencias estadounidenses con una cita eliminada y seleccionar la holding correcta entre cinco candidatas, util para tareas de anotacion asistida en bases de datos legales.
- Evaluacion comparativa de modelos juridicos: sirve como referencia reproducible para medir el rendimiento de modelos pequenos frente a BERT, Legal-BERT o CaseLaw-BERT en CaseHOLD, con un coste de entrenamiento de poco mas de una GPU-hora.
- Filtrado y enriquecimiento de documentos en pipelines de investigacion juridica: dado un fragmento con multiples citas candidatas, el modelo puede priorizar cual encaja mejor, reduciendo el trabajo manual de revision.
- Prototipado rapido en entornos con hardware limitado: al requerir solo 4,3 GiB de VRAM en entrenamiento y caber en una GPU consumer, permite experimentar con adaptadores LoRA sobre modelos de 0,5B sin infraestructura dedicada.
- Docencia y formacion en NLP juridico: el repositorio incluye el codigo completo, los comandos que produjeron cada cifra y las decisiones de diseno, lo que lo convierte en un material didactico para entender LoRA, evaluacion de opcion multiple y el benchmark LexGLUE.
- Investigacion sobre eficiencia de adaptadores: permite estudiar como escala la accuracy con el tamano del conjunto de entrenamiento (75,28% a 5.000 preguntas, 87,05% a 45.000) manteniendo un numero fijo de parametros entrenables.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (accuracy en el split de test de CaseHOLD, LexGLUE):

| Modelo | CaseHOLD test | Fuente |
|---|---|---|
| TF-IDF + SVM | 22,4 | LexGLUE |
| Qwen2.5-0.5B, zero-shot | 38,4 (validacion) | este trabajo |
| BERT | 70,8 | LexGLUE |
| RoBERTa-large | 74,4 | LexGLUE |
| Legal-BERT | 75,3 | LexGLUE |
| CaseLaw-BERT | 75,4 | LexGLUE |
| Qwen2.5-0.5B + este adaptador | 85,9 | este trabajo |

El resultado principal es 85,92% de accuracy (3.093 de 3.600 preguntas del split de test). El autor advierte de que se uso una sola semilla y no se ajustaron hiperparametros, por lo que no hay barra de error, y de que Qwen2.5-0.5B (494M parametros) es mayor que BERT y Legal-BERT (aproximadamente 110M), lo que condiciona la comparacion directa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el entrenamiento requirio un pico de 4,3 GiB, por lo que la inferencia en `float32` deberia situarse en un orden de magnitud similar o inferior.
- GPU recomendadas: cualquier GPU consumer con al menos 6-8 GiB de VRAM; el autor entreno en una RTX 4050 Laptop GPU. Para produccion a gran escala, A100 o H100 no son necesarias dado el tamano del modelo.
- Cabe en GPU consumer: si, incluidas RTX 4050 Laptop y superiores.
- Opciones de despliegue: el adaptador no es un checkpoint `peft`; requiere cargar `lora.py` y `data.py` del repositorio y envolver el modelo base con `load_adapter`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El unico dato temporal es el entrenamiento (62 minutos, 1,04 GPU-horas).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CaseHOLD test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-0.5B + casehold-lora | 494M base + 2,16M adaptador | 640 tokens de prompt | 85,9 | Apache-2.0 | Hugging Face |
| Legal-BERT | ~110M | No disponible | 75,3 | No disponible en la informacion | Referencia LexGLUE |
| CaseLaw-BERT | ~110M | No disponible | 75,4 | No disponible en la informacion | Referencia LexGLUE |
| RoBERTa-large | ~355M | No disponible | 74,4 | No disponible en la informacion | Referencia LexGLUE |
| BERT | ~110M | No disponible | 70,8 | No disponible en la informacion | Referencia LexGLUE |

La comparacion esta limitada a los datos de la model card: no se dispone de informacion sobre contexto, licencia o disponibilidad de los modelos de referencia mas alla de su aparicion en LexGLUE.

## Limitaciones y advertencias

- El modelo solo elige entre cinco holdings proporcionadas; no genera texto, no razona y no responde preguntas abiertas.
- Entrenado exclusivamente con jurisprudencia estadounidense; no se ha probado con holdings redactadas en otros estilos ni con otras jurisdicciones.
- No constituye asesoramiento legal y no debe usarse como tal en produccion.
- Resultado de una sola semilla y sin ajuste de hiperparametros: no hay barra de error ni garantia de reproducibilidad exacta.
- Prompts de mas de 640 tokens pierden texto del pasaje por la izquierda, lo que puede degradar la precision en documentos largos.
- El adaptador no es un checkpoint `peft`; su carga requiere el codigo del repositorio (`lora.py`, `data.py`) y no es compatible directamente con herramientas estandar de despliegue.
- El modelo base Qwen2.5-0.5B es mayor que los modelos de referencia de LexGLUE, lo que limita la comparabilidad directa de los resultados.
- Licencia Apache-2.0 para el adaptador y el modelo base; el dataset CaseHOLD se publico bajo Apache-2.0 y la copia de LexGLUE bajo CC BY 4.0, con obligaciones de atribucion.
- Riesgo de alucinacion no aplicable en el sentido generativo (no produce texto libre), pero si de seleccion incorrecta de la holding cuando el pasaje es ambiguo o atipico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/epochzero-0/casehold-lora
- Repositorio de codigo: https://github.com/epochzero-0/casehold-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Dataset LexGLUE (CaseHOLD): https://huggingface.co/datasets/coastalcph/lex_glue
- Paper CaseHOLD: Zheng, Guha, Anderson, Henderson, Ho. *When Does Pretraining Help? Assessing Self-Supervised Learning for Law and the CaseHOLD Dataset.* ICAIL 2021. arXiv:2104.08671
- Paper LexGLUE: Chalkidis et al. *LexGLUE: A Benchmark Dataset for Legal Language Understanding in English.* ACL 2022. arXiv:2110.00976

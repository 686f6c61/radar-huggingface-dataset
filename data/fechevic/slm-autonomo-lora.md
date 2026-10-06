# fechevic/slm-autonomo-lora

## Resumen

`fechevic/slm-autonomo-lora` es un adaptador LoRA para el modelo causal `nvidia/Llama-3.1-Nemotron-Nano-4B-v1.1` (4,54 B parámetros), desarrollado por Francisco Echeverría en el marco de un trabajo académico del Magíster en Inteligencia Artificial de la Universidad Adolfo Ibáñez (curso Tópicos Avanzados 2). El adaptador especializa al modelo base como asistente experto en inteligencia artificial generativa aplicada a empresas de Chile y Latinoamérica, cubriendo fundamentos de LLM, RAG y búsqueda semántica, ajuste fino y destilación, y evaluación y LLMOps.

La relevancia del proyecto no reside en el rendimiento absoluto del modelo, sino en el método: un pipeline autónomo de destilación en el que un LLM de OpenAI actúa simultáneamente como profesor (genera currículo y respuestas de referencia) y como juez (evalúa cada versión con una rúbrica de cuatro criterios), mientras el modelo pequeño se ajusta localmente ronda a ronda. Todo el ciclo se ejecutó sobre Apple Silicon con un coste de API declarado de 0,27 dólares y un tiempo de entrenamiento de 73 segundos por ronda.

El checkpoint publicado corresponde a la ronda 2 y es explícitamente una corrida de demostración: 2 rondas, 60 ejemplos de entrenamiento y 8 preguntas de evaluación. El propio autor advierte que no debe usarse en producción, ya que la nota media del juez (3,50 sobre 10) queda lejos del umbral de aprobación de 7.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del base Llama 3.1 Nemotron Nano) + adaptador LoRA |
| Parametros totales | 4,54 B (modelo base); 30,4 M entrenables en el adaptador (0,67 %) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (dato no especificado en la informacion proporcionada; heredada del modelo base) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; el base en el formato del repositorio de NVIDIA) |
| Idiomas soportados | Espanol (neutro, Chile) |
| Licencia | NVIDIA Open Model License + Llama 3.1 Community License (heredadas del modelo base), etiquetada como `license:other` |
| Formato de pesos | safetensors (adaptador PEFT/LoRA), libreria `peft` |
| Configuracion LoRA | r = 16, alpha = 32, dropout = 0,05 |
| Modulos objetivo | q, k, v, o, gate, up, down |
| Modelo base | nvidia/Llama-3.1-Nemotron-Nano-4B-v1.1 |
| Tamano del repositorio | 0,1 GB |
| Framework | PEFT 0.21.2, Transformers 5.18.0, PyTorch 2.14.1 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer causal decoder-only (arquitectura Llama 3.1 en su variante Nemotron Nano de 4,54 B parámetros). El ajuste es LoRA de bajo rango: r = 16, alpha = 32 y dropout = 0,05, inyectado en las proyecciones q, k, v, o, gate, up y down. Solo se entrenan 30,4 M parámetros, el 0,67 % del total. El entrenamiento se hizo en bf16, con learning rate de 2e-4, warmup del 5 %, tamaña de batch efectivo de 8 (4 × 2 de acumulación), una época por ronda y una longitud máxima de secuencia de 512 tokens.

El método de entrenamiento es un ciclo autónomo de destilación. En la ronda 0 se define una taxonomía de temas y un set de evaluación fijo que nunca se usa para entrenar, y se mide la nota base del modelo. A partir de la ronda 1, un currículo adaptativo genera más tareas en los temas débiles, un LLM de OpenAI responde como profesor, se entrena el adaptador LoRA con datos nuevos más un 50 % de repaso, un juez LLM califica con una rúbrica de 4 criterios (escala 1 a 10) contra respuestas de referencia y se decide promover, aceptar o revertir el checkpoint. Los datos son pares instrucción-respuesta sintéticos generados por la API de OpenAI, con deduplicación y filtro de calidad, en proporción 30 % básicas, 50 % intermedias y 20 % avanzadas, a razón de 40 tareas nuevas por ronda. El checkpoint publicado (ronda 2) se entrenó con 60 ejemplos (datos nuevos más 50 % de repaso).

El entrenamiento se ejecutó en Apple Silicon (MPS) con 25,8 GB de memoria unificada y un pico de 9,8 GB, con un tiempo de 73 segundos por ronda y unos 3 minutos de corrida completa. El coste total de la API de OpenAI fue de 0,27 dólares para 125 llamadas.

## Capacidades

- Generacion de texto en espanol neutro (variante Chile) sobre temas de IA generativa aplicada a empresa.
- Cobertura de contenidos de fundamentos de LLM, RAG y busqueda semantica, ajuste fino y destilacion, y evaluacion y LLMOps.
- Formato de respuesta conversacional segun la plantilla de chat del modelo base, con soporte del modificador `detailed thinking off` con el que fue entrenado (respuestas sin razonamiento largo).
- Modo de asistente experto para consultas conceptuales de un solo turno.
- No se documenta soporte de tool calling, function calling ni agentes multi-paso en la informacion disponible.
- No se documentan capacidades de vision, audio ni multimodalidad.
- No se documenta un modo de razonamiento extendido (thinking mode); de hecho, el entrenamiento se hizo con el razonamiento largo desactivado.

## Casos de uso

- Material didactico interno sobre RAG: el adaptador puede responder preguntas conceptuales del tipo "que es RAG y cuando conviene usarlo en una empresa", que es exactamente el ejemplo incluido en la model card, util para formar a equipos tecnicos.
- Prototipado academico de pipelines de destilacion: sirve como referencia reproducible de un ciclo profesor-juez con LoRA sobre Apple Silicon, con hiperparametros y coste documentados.
- Generacion de borradores de documentacion tecnica en espanol sobre LLMOps y evaluacion de modelos, siempre con supervision humana dado el bajo rendimiento del juez.
- Experimentos de investigacion sobre curricula adaptativos en espanol: el repositorio documenta la evolucion de la nota por ronda, util para estudiar tecnicas de auto-mejora en modelos pequenos.
- Base para experimentos de ajuste adicional: al ser un adaptador PEFT de 0,1 GB sobre un base de 4,54 B, permite iterar rapidamente con nuevo currculo sin reentrenar desde cero.
- Demostracion educativa de transferencia de conocimiento desde un LLM grande a un SLM: el coste de 0,27 dolares y 73 segundos por ronda ilustra la viabilidad economica del enfoque.
- Pruebas de concepto de asistentes sectoriales en Chile: el dominio esta orientado a empresas chilenas y latinoamericanas, aunque su uso queda restringido a entornos de investigacion por sus limitaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica evaluacion reportada es la nota de un juez LLM con rubrica de 4 criterios sobre un set fijo de 8 preguntas:

| Ronda | Decision | Nota media | Delta |
|---|---|---|---|
| 0 (modelo base) | — | 2,13 | — |
| 1 | promovido | 2,50 | +0,38 |
| 2 (checkpoint publicado) | promovido | 3,50 | +1,00 |

Detalle de la ronda 2 por criterio (escala 1-10):

| Criterio | Nota |
|---|---|
| Correccion | 3,9 |
| Completitud | 2,4 |
| Claridad | 4,9 |
| Idioma y formato | 8,0 |

No se dispone de comparativas con otros modelos en la informacion proporcionada.

## Requisitos de hardware

- Adaptador: 0,1 GB en disco; los pesos LoRA son minimos en memoria.
- Modelo base: aproximadamente 9 GB segun la propia model card (descarga automatica desde Hugging Face la primera vez).
- El autor entreno y ejecuto en Apple Silicon con 25,8 GB de memoria unificada, con un pico de 9,8 GB durante el entrenamiento (bf16).
- VRAM estimada para inferencia en bf16: del orden de 9-10 GB para el base mas overhead. Cabe en GPUs consumer de gama alta (por ejemplo, RTX 4090 con 24 GB) y en GPUs profesionales como A100 o H100.
- Opciones de despliegue: el ejemplo oficial usa `peft.AutoPeftModelForCausalLM` con `transformers` y `device_map="auto"`. No se documentan recetas para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables en la informacion proporcionada para otros modelos de la misma categoria. La comparacion mas directa posible es con su propio modelo base:

| Modelo | Parametros | Tipo | Idioma objetivo | Licencia | Nota juez (n=8) |
|---|---|---|---|---|---|
| slm-autonomo-lora | 4,54 B (30,4 M entrenables) | Adaptador LoRA sobre Llama 3.1 Nemotron Nano 4B | Espanol (Chile) | NVIDIA Open Model License + Llama 3.1 Community License | 3,50 |
| nvidia/Llama-3.1-Nemotron-Nano-4B-v1.1 (base) | 4,54 B | Transformer decoder-only | no especificado | NVIDIA Open Model License | 2,13 |

No se dispone de comparativas con alternativas de terceros (parametros, contexto, rendimiento, licencia) en la informacion proporcionada.

## Limitaciones y advertencias

- Es una corrida de demostracion corta: 2 rondas, 60 ejemplos de entrenamiento y 8 preguntas de evaluacion, con un presupuesto de 2 dolares. El propio autor indica que no debe usarse en produccion; la nota media de 3,50 sobre 10 esta muy por debajo del umbral de aprobacion de 7.
- Debilidades detectadas por el juez: respuestas incompletas o truncadas (limite de 160 tokens de generacion) y confusiones conceptuales en destilacion y en metricas de evaluacion de RAG.
- Set de evaluacion muy pequeno (n = 8), lo que implica varianza alta en las notas.
- Hereda los sesgos y limitaciones tanto del modelo base como del modelo profesor.
- Cobertura idiomatica limitada al espanol (neutro, Chile); no se documentan otros idiomas.
- Ambito de conocimiento acotado al dominio del curriculo (fundamentos de LLM, RAG, ajuste fino y destilacion, evaluacion y LLMOps); fuera de ese dominio el rendimiento no esta caracterizado.
- Restricciones de licencia: se distribuye bajo NVIDIA Open Model License y Llama 3.1 Community License, heredadas del modelo base. Afectan al uso comercial segun los terminos de dichas licencias.
- Los datos de entrenamiento se generaron con la API de OpenAI; los terminos de OpenAI restringen usar sus salidas para desarrollar modelos que compitan con OpenAI, lo que limita la reutilizacion comercial del dataset.
- Riesgo de alucinacion no cuantificado en la informacion disponible; dadas las notas de correccion (3,9) y completitud (2,4), es previsible en uso no supervisado.
- No se documentan capacidades de tool calling, agentes ni multimodalidad, por lo que no es apto para casos de uso que las requieran.

## Enlaces

- HuggingFace (adaptador): https://huggingface.co/fechevic/slm-autonomo-lora
- Modelo base: https://huggingface.co/nvidia/Llama-3.1-Nemotron-Nano-4B-v1.1
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- No se han encontrado en la informacion proporcionada otros enlaces a papers, blogs, repositorios o demos.

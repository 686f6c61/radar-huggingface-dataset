# gdelacasa/slm-autonomo-nemotron4b-lora

## Resumen

`gdelacasa/slm-autonomo-nemotron4b-lora` es un adaptador LoRA (no un modelo completo) construido sobre `nvidia/Llama-3.1-Nemotron-Nano-4B-v1.1`, un transformer decoder-only de aproximadamente 4 000 millones de parámetros desarrollado por NVIDIA. El adaptador lo publica el usuario gdelacasa como resultado del laboratorio "SLM autónomo" del Magíster en IA de la Universidad Adolfo Ibáñez (Tópicos Avanzados en IA 2, prof. Ahmad Armoush). Su finalidad es especializar el modelo base como asistente de IA generativa aplicada a empresas en Chile y Latinoamérica, cubriendo fundamentos de LLM, RAG, ajuste fino y destilación, evaluación y LLMOps, y con el español como único idioma declarado.

El método de entrenamiento es una destilación de caja negra en bucle cerrado: un LLM al que se accede vía API de OpenAI actúa simultáneamente como profesor (genera tareas y respuestas de referencia) y como juez (califica con una rúbrica de 1 a 10 un examen fijo de 8 preguntas que nunca se usa para entrenar). El estudiante se ajusta con LoRA y solo se conserva el checkpoint que mejora la nota del juez. La corrida publicada consta de 2 rondas, con 100 ejemplos de entrenamiento en total, 13 pasos de optimización y un coste de API de 0,27 dólares.

Su relevancia es fundamentalmente metodológica y educativa: demuestra que un bucle cerrado de generación, evaluación y promoción selectiva de checkpoints puede ejecutarse en hardware de consumo (un MacBook Air M5 con 24 GB y backend MPS) en menos de cinco minutos. El propio autor advierte de que se trata de una corrida de demostración con muy pocos datos y que no es un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (familia Llama 3.1 / NVIDIA Nemotron); PEFT |
| Parametros totales | 30,4 millones de parametros entrenables en el adaptador (0,67 % del modelo base, que ronda los 4 000 millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base nvidia/Llama-3.1-Nemotron-Nano-4B-v1.1) |
| Tipos de cuantizacion | No disponible para el adaptador; se distribuye en safetensors y el ejemplo de uso emplea bfloat16 |
| Idiomas soportados | Espanol (es) |
| Licencia | NVIDIA Open Model License; el modelo base queda ademas bajo Llama 3.1 Community License (Built with Llama). Uso declarado como educativo |
| Formato de pesos | safetensors (adaptador LoRA PEFT); repositorio de 0,1 GB |
| Hiperparametros LoRA | r = 16, alpha = 32, aplicado a las 7 proyecciones de cada capa |
| Modelo base | nvidia/Llama-3.1-Nemotron-Nano-4B-v1.1 |
| Libreria | peft |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `nvidia/Llama-3.1-Nemotron-Nano-4B-v1.1`, un transformer decoder-only de la familia Nemotron de NVIDIA derivado de la arquitectura Llama 3.1. El ajuste es de tipo LoRA con rango 16 y alpha 32, insertado en las siete proyecciones de cada capa, lo que da 30,4 millones de parametros entrenables, es decir, un 0,67 % del total del modelo base. No se modifica el resto de los pesos, por lo que el adaptador debe cargarse siempre junto al modelo base mediante `PeftModel`.

El entrenamiento sigue un esquema de destilacion de caja negra en bucle cerrado. Un LLM servido por la API de OpenAI genera las tareas y las respuestas de referencia (funcion de profesor) y, por separado, actua como juez aplicando una rubrica de 1 a 10 sobre un examen fijo de 8 preguntas que nunca forma parte del conjunto de entrenamiento. El estudiante se ajusta y solo se conserva el checkpoint que mejora la nota del juez, de modo que existe seleccion por rendimiento. La corrida publicada usa 100 ejemplos, lote efectivo 8, tasa de aprendizaje 2e-4 y 13 pasos de optimizacion, y se ejecuto en bfloat16 sobre MPS en un MacBook Air M5 con 24 GB de memoria unificada en menos de cinco minutos, con un coste de API de 0,27 dolares. No se documentan innovaciones arquitectonicas adicionales ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de texto en espanol orientada a preguntas y respuestas sobre IA generativa aplicada a empresas.
- Cobertura de cuatro areas tematicas declaradas: fundamentos de LLM, RAG, ajuste fino y destilacion, y evaluacion y LLMOps.
- Razonamiento basico de tipo instructivo, heredado del modelo base Nemotron-Nano-4B.
- Modo de razonamiento controlable mediante el prompt de sistema `detailed thinking off`, tal como indica el autor.
- Soporte de tool calling / function calling: no confirmado para el adaptador en la informacion disponible (depende de las capacidades del modelo base).
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: solo se declara espanol; no hay evidencia de otros idiomas en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles.
- Carga mediante `transformers` + `peft`, con `AutoModelForCausalLM` y `PeftModel.from_pretrained`.

## Casos de uso

- Formacion interna en IA generativa: el adaptador puede responder preguntas de empleados sobre fundamentos de LLM, RAG y LLMOps en espanol con terminologia adaptada al contexto chileno y latinoamericano, aunque la calidad medida por el juez es todavia baja (3,50 sobre 10).
- Material de apoyo docente: sirve como ejemplo reproducible de un pipeline de destilacion en bucle cerrado para cursos de posgrado, ya que el entrenamiento completo cabe en un portatil y cuesta menos de un dolar en API.
- Banco de pruebas de metodologia de evaluacion: el examen fijo de 8 preguntas y la rubrica 1-10 permiten comparar variantes de LoRA, tasas de aprendizaje o volumenes de datos sin salir del entorno local.
- Prototipado de asistentes sectoriales en espanol: al ser un adaptador pequeno (0,1 GB) sobre un modelo de 4B, es viable iterar rapidamente sobre dominios verticales antes de invertir en un ajuste a mayor escala.
- Demostracion de ajuste eficiente en hardware de consumo: util para justificar ante equipos tecnicos que el ajuste fino con LoRA es viable en un MacBook con 24 GB de memoria unificada.
- Base para experimentos de destilacion con modelos profesor de mayor tamano: el mecanismo de generacion de tareas y juicio con rubrica es reutilizable con otros dominios y otros modelos estudiante.
- Uso en produccion: no recomendado. El propio autor indica que la corrida es de demostracion y que el modelo no esta listo para produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La unica metrica reportada es la nota de un juez LLM con rubrica de 1 a 10 sobre un examen fijo de 8 preguntas, sin valor de referencia frente a terceros:

| Ronda | Nota del juez (1-10) | Decision |
|---|---|---|
| 0 - modelo base | 2,25 | - |
| 1 | 2,50 | promovido |
| 2 | 3,50 | promovido (este adaptador) |

Desglose por tema (ronda 0 → ronda 2):

| Tema | Ronda 0 | Ronda 2 |
|---|---|---|
| Fundamentos de LLM | 2,5 | 4 |
| RAG | 2 | 4 |
| Ajuste fino | 2 | 3 |
| Evaluacion y LLMOps | 2,5 | 3 |

Estos valores corresponden a una evaluacion interna con juez automatico, no a un benchmark estandarizado, y no son comparables con puntuaciones publicadas de otros modelos.

## Requisitos de hardware

- El adaptador en si ocupa 0,1 GB y no anade requisitos apreciables de memoria.
- Inferencia del modelo base en bfloat16: alrededor de 8 GB de VRAM, estimacion a partir de los 4 000 millones de parametros (no confirmada en la informacion proporcionada).
- Inferencia cuantizada a 4 bits: en torno a 3 GB de VRAM, lo que permitiria ejecutarlo en GPU de consumo como RTX 3060, RTX 4060 o superiores (estimacion, no confirmada).
- Entrenamiento del adaptador: realizado en un MacBook Air M5 con 24 GB de memoria unificada, backend MPS y bfloat16, en menos de cinco minutos.
- GPU de centro de datos (A100, H100): no son necesarias para este adaptador; no se han publicado mediciones sobre ellas.
- Opciones de despliegue: el ejemplo oficial usa `transformers` con `peft` y `PeftModel.from_pretrained`. No se documentan recetas para vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Comparativa con el modelo base y ausencia de datos frente a alternativas de la misma categoria:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gdelacasa/slm-autonomo-nemotron4b-lora | 30,4 M entrenables sobre base de ~4B | No disponible | Nota de juez 3,50/10 en examen interno de 8 preguntas | NVIDIA Open Model License + Llama 3.1 Community License | Hugging Face, 0 descargas |
| nvidia/Llama-3.1-Nemotron-Nano-4B-v1.1 | ~4B | No disponible en la informacion proporcionada | Nota de juez 2,25/10 en el mismo examen interno | NVIDIA Open Model License + Llama 3.1 Community License | Hugging Face (modelo base) |
| Otros adaptadores LoRA en espanol de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos comparativos verificables frente a otros adaptadores o modelos de ~4B en espanol dentro de la informacion proporcionada, por lo que la comparativa se limita al modelo base del que deriva.

## Limitaciones y advertencias

- Corrida de demostracion: entrenada con solo 100 ejemplos y 13 pasos de optimizacion; el autor indica explicitamente que no es un modelo listo para produccion.
- Rendimiento bajo: la mejor nota del juez es 3,50 sobre 10, con areas como ajuste fino y LLMOps por debajo de 3 sobre 10.
- Riesgo de alucinacion: no se documentan mecanismos de mitigacion ni evaluaciones de fidelidad factual.
- Sesgos: no se han publicado analisis de sesgo para este adaptador; al derivar de Llama 3.1 y de datos generados por un modelo de OpenAI, hereda los sesgos de ambas fuentes.
- Cobertura idiomatica limitada: solo se declara espanol, sin variante regional especificada.
- Contexto: no se especifica en la model card la ventana de contexto efectiva del adaptador ni el efecto del ajuste sobre ella.
- Licencia: el modelo base esta sujeto a la NVIDIA Open Model License y a la Llama 3.1 Community License (Built with Llama), con las obligaciones de atribucion correspondientes. El adaptador se publica como `license: other` con nombre `nvidia-open-model-license`.
- Datos de entrenamiento: generados por un modelo de OpenAI, cuyos terminos restringen emplear sus salidas para desarrollar modelos que compitan con OpenAI; el uso declarado es educativo.
- Sin adopcion verificable: 0 descargas y 0 "me gusta" en el momento de la consulta, por lo que no existe validacion externa del adaptador.
- Evaluacion no estandar: la unica metrica disponible proviene de un juez LLM sobre un examen fijo de 8 preguntas, lo que limita su extrapolacion.
- Prompt de sistema obligatorio: el autor recomienda usar `detailed thinking off`, de modo que el comportamiento puede degradarse con otras configuraciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gdelacasa/slm-autonomo-nemotron4b-lora
- Modelo base: https://huggingface.co/nvidia/Llama-3.1-Nemotron-Nano-4B-v1.1
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Nemotron en NVIDIA Developer: https://developer.nvidia.com/topics/ai/nemotron
- NVIDIA Nemotron-Mini-4B-Instruct: https://huggingface.co/nvidia/Nemotron-Mini-4B-Instruct
- Nemotron (wiki): https://ai.miraheze.org/wiki/Nemotron
- Tutorial de despliegue local de Nemotron-3 Nano 4B: https://aiindigo.com/tutorials/getting-started-with-nvidia-nemotron-3-nano-4b-local-deployment-guide
- Noticia sobre la familia Nemotron 4 (Reuters): https://www.reuters.com/business/nvidia-is-developing-nemotron-4-open-source-models-information-reports-2026-08-11/

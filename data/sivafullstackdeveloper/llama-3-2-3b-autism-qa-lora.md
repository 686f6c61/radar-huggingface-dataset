# sivafullstackdeveloper/Llama-3.2-3B-autism-qa-lora

## Resumen

Llama-3.2-3B-autism-qa-lora es un adaptador LoRA (PEFT) desarrollado por el usuario sivafullstackdeveloper sobre el modelo base meta-llama/Llama-3.2-3B-Instruct. Su funcion es escribir respuestas a preguntas sobre autismo a partir de un pasaje recuperado, y rechazar de forma educada solicitudes de consejo medico. Forma parte de "asterly", un proyecto de aprendizaje que cubre de extremo a extremo el fine-tuning, la recuperacion (RAG), las barreras de seguridad y el despliegue.

El adaptador no es un modelo autonomo: esta disenado para operar dentro de un pipeline concreto (guardia de seguridad, busqueda FAISS con reranker sobre 791 pasajes, generacion de respuesta y comprobacion de salida). Por si solo, sin recuperacion ni capas de seguridad, el autor advierte explicitamente que no es una fuente fiable.

El repositorio es muy pequeno (0,1 GB) porque solo contiene los pesos del adaptador, no el modelo completo. La relevancia de esta ficha es acotada: se trata de un proyecto personal con 13 descargas y 0 likes, util como referencia de QLoRA con Unsloth sobre Llama 3.2 3B y de patron RAG con rechazo medico, pero no de un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Llama 3.2 3B Instruct |
| Parametros totales | No disponible (adaptador LoRA; el base tiene 3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del base Llama 3.2 3B Instruct) |
| Tipos de cuantizacion | Base cargado en 4-bit (QLoRA) durante el entrenamiento; pesos del adaptador en safetensors; cuantizaciones para inferencia no especificadas |
| Idiomas soportados | Ingles (en) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Llama 3.2 3B Instruct cargado en 4 bits con Unsloth (QLoRA). La configuracion LoRA es r=16, alpha=32, dropout 0,05, aplicada a todas las proyecciones de atencion y MLP. El entrenamiento consistio en 3 epocas, 669 pasos, batch efectivo de 16, learning rate 2e-4 con schedule coseno, ejecutado en una unica GPU Colab T4.

Los datos provienen del dataset sivafullstackdeveloper/autism-qa-dataset-v1, split de entrenamiento con 3.960 registros que incluyen pares pregunta-respuesta, rechazos y conversaciones multi-turno, con una porcion reservada para evaluacion. La perdida de evaluacion descendio de 0,539 a 0,350 tras la primera epoca y a 0,325 tras la tercera. El entrenamiento se realizo con SFT mediante TRL (version 0.24.0), PEFT 0.19.1, Transformers 5.5.0 y PyTorch 2.11.

La innovacion tecnica del proyecto no esta en el modelo sino en el pipeline: el adaptador esta entrenado para mantenerse dentro del pasaje recuperado que recibe y para rechazar peticiones de consejo medico, lo que constituye un patron de "grounded generation" con guardarrailes externos.

## Capacidades

- Generacion de texto conversacional en ingles sobre tematica de autismo, condicionada a un pasaje recuperado.
- Redaccion de respuestas fundamentadas en el contexto proporcionado (RAG), con instruccion explicita de no salir del pasaje.
- Rechazo educado de solicitudes de consejo medico (diagnostico, medicacion, tratamiento).
- Manejo de conversaciones multi-turno, segun los datos de entrenamiento.
- Formato de prompt especifico: requiere replicar exactamente la plantilla de entrenamiento (definida en src/asterly/prompting.py).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Asistente informativo sobre autismo con RAG: el adaptador recibe los pasajes recuperados por FAISS y un reranker y redacta una respuesta acotada a esa evidencia, reduciendo el riesgo de afirmaciones no fundamentadas.
- Filtro de rechazo medico en chatbots de salud: el modelo aprende a derivar a un profesional ante preguntas de diagnostico o tratamiento, util como capa de respuesta en flujos con guardia previa.
- Prototipo educativo de pipeline RAG completo: sirve como referencia para aprender a encadenar guardia de seguridad, recuperacion, generacion y comprobacion de salida.
- Base para fine-tuning QLoRA en hardware modesto: el recipe (Unsloth, r=16, alpha=32, T4) es replicable en una GPU de consumo para otros dominios verticales.
- Generacion de respuestas multi-turno en dominios acotados: el formato conversacional permite construir asistentes tematicos con contexto de dialogo.
- Evaluacion de tecnicas de grounding: util para estudiar como un adaptador pequeno se ciñe al contexto y como falla cuando la recuperacion es deficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado es la perdida de evaluacion durante el entrenamiento: 0,539 tras la epoca 1, 0,350 tras la epoca 2 y 0,325 tras la epoca 3.

## Requisitos de hardware

- El adaptador requiere cargar el modelo base Llama 3.2 3B Instruct, de acceso restringido (hay que aceptar los terminos de Meta en su pagina).
- VRAM estimada para inferencia: el modelo base en float16 ocupa aproximadamente 6-7 GB; en 4-bit, en torno a 2-3 GB, mas el overhead del adaptador (despreciable, 0,1 GB).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16; una RTX 3060/4060 o superior basta. El entrenamiento se realizo en una T4 de Colab.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti, RTX 4090, etc., especialmente con cuantizacion 4-bit.
- Opciones de despliegue: transformers + PEFT (metodo documentado por el autor), vLLM y TGI para servir el base con el adaptador, llama.cpp/Ollama si se fusionan los pesos y se convierten a GGUF (no documentado por el autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.2-3B-autism-qa-lora | 3B (base) + LoRA | No disponible | RAG tematico con rechazo medico | llama3.2 | Hugging Face (adaptador) |
| meta-llama/Llama-3.2-3B-Instruct | 3B | No disponible en la informacion | Instruccion general | llama3.2 | Hugging Face (gated) |
| Adaptadores LoRA comunitarios sobre Llama 3.2 3B | 3B (base) + LoRA | Variable | Fine-tuning de dominio | llama3.2 | Hugging Face |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas; la comparativa se limita a parametros, enfoque y licencia.

## Limitaciones y advertencias

- Solo ingles; no soporta otros idiomas.
- La calidad depende enteramente de los pasajes recuperados: sin RAG el modelo no es una fuente fiable, segun el propio autor.
- El comportamiento de seguridad reside principalmente en las capas de guardia de asterly, no en el adaptador.
- No ha sido revisado por un clinico; no es consejo medico y no debe usarse para diagnostico, medicacion ni tratamiento.
- Riesgo de alucinacion inherente a un modelo de 3B, especialmente si el contexto recuperado es irrelevante o incompleto.
- Proyecto de aprendizaje con 13 descargas y 0 likes; sin validacion externa ni benchmarks publicados.
- La licencia llama3.2 impone las condiciones de la Llama 3.2 Community License de Meta para uso comercial y redistribucion; los datos de entrenamiento son MIT.
- El prompt debe coincidir exactamente con el formato de entrenamiento; desviaciones degradan la calidad de forma notable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sivafullstackdeveloper/Llama-3.2-3B-autism-qa-lora
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Dataset: https://huggingface.co/datasets/sivafullstackdeveloper/autism-qa-dataset-v1
- Repositorio del proyecto asterly: https://github.com/CherukuriSiva/asterly
- Plantilla de prompt: https://github.com/CherukuriSiva/asterly/blob/main/src/asterly/prompting.py
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/

# amiiruu/amiir-ai

## Resumen

Amiir AI (`amiiruu/amiir-ai`) es un ajuste fino (fine-tune) del modelo Qwen3-4B-Instruct-2507, desarrollado por el usuario Amiir mediante Unsloth y QLoRA sobre GPUs gratuitas de Kaggle. El modelo hereda la arquitectura transformer densa del Qwen3-4B original (4.022.468.096 parametros) y se especializa en tareas de programacion y seguridad defensiva (cybersecurity), segun las etiquetas declaradas por el autor. Se distribuye bajo licencia Apache 2.0 y en formatos safetensors y GGUF, lo que facilita su despliegue tanto en entornos de inferencia estandar como en llama.cpp u Ollama.

El problema que aborda es la adaptacion de un modelo generalista de 4.000 millones de parametros a dominios tecnicos concretos (codigo y ciberseguridad defensiva) sin requerir infraestructura de entrenamiento dedicada, ya que el autor indica que el ajuste se realizo en GPUs gratuitas de Kaggle. Es relevante por su tamano contenido, que permite ejecucion en hardware de consumo, y por su compatibilidad con endpoints y con el ecosistema GGUF/Ollama.

No obstante, la informacion publicada es muy limitada: no hay resultados de benchmarks, no se detalla la composicion del dataset de ajuste, no se especifica la longitud de contexto efectiva tras el fine-tune y el modelo registra 0 descargas y 0 likes en el momento de la consulta. La model card es minima y se limita a indicar el proceso de entrenamiento y un comando de ejecucion en Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no confirmada en la model card) |
| Tipos de cuantizacion | GGUF (se menciona Q4_K_M); otras cuantizaciones no disponibles |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Qwen3-4B-Instruct-2507, un transformer denso de aproximadamente 4.000 millones de parametros. El ajuste se realizo con Unsloth y QLoRA, una tecnica de adaptacion de bajo rango con cuantizacion de 4 bits que reduce los requisitos de memoria durante el entrenamiento. Segun la model card, el entrenamiento se llevo a cabo en GPUs gratuitas de Kaggle, lo que sugiere un presupuesto computacional modesto y un dataset de ajuste acotado.

No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO adicionales. Tampoco se detalla si el fine-tune preserva integramente la ventana de contexto del modelo base ni si se modificaron los tokens especiales o el chat template. La unica innovacion tecnica documentada es el uso de LoRA sobre el modelo base y la publicacion de pesos en formato GGUF para su uso directo en Ollama.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del Qwen3-4B-Instruct-2507.
- Generacion y asistencia en codigo, segun la etiqueta `coding` declarada por el autor.
- Tareas de ciberseguridad defensiva, segun las etiquetas `cybersecurity` y `defensive-security`.
- Razonamiento y matematicas: capacidades heredadas del modelo base, no verificadas especificamente tras el fine-tune.
- Soporte de tool calling / function calling: no confirmado en la model card (el modelo base lo soporta, pero no se documenta si el fine-tune lo conserva).
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Asistente de revision de codigo: el modelo puede integrarse en un flujo de pull requests para senalar patrones inseguros o malas practicas, aprovechando su ajuste en programacion y seguridad defensiva.
- Analisis de configuraciones y politicas de seguridad: util para revisar ficheros de configuracion, reglas de firewall o politicas IAM y proponer mejoras defensivas en ingles.
- Chatbot de soporte tecnico para desarrolladores: al ser un modelo de 4.000 millones de parametros, puede desplegarse en una GPU de consumo y responder consultas de programacion con baja latencia.
- Generacion de documentacion tecnica: redaccion de comentarios, README y guias de seguridad a partir de fragmentos de codigo, en ingles.
- Formacion y concienciacion en ciberseguridad: generacion de escenarios y explicaciones sobre amenazas defensivas para materiales internos.
- Prototipado rapido en local con Ollama: el comando `ollama run hf.co/amiiruu/amiir-ai:Q4_K_M` permite probar el modelo en estaciones de trabajo sin infraestructura adicional, adecuado para experimentacion y validacion de ideas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8-9 GB en FP16 para los 4.022 millones de parametros; en torno a 2,5-3 GB en cuantizacion Q4_K_M.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB o superiores para FP16; cualquier GPU con 4 GB o mas para Q4_K_M.
- Cabe en GPU de consumo: si, en la mayoria de GPUs modernas con cuantizacion GGUF Q4_K_M.
- Opciones de despliegue: Ollama (documentado por el autor), llama.cpp para GGUF, vLLM o TGI para safetensors (no verificado).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| amiiruu/amiir-ai | 4.022 M | no disponible | Apache 2.0 | Hugging Face (safetensors, GGUF) | Fine-tune de Qwen3-4B orientado a codigo y seguridad |
| Qwen/Qwen3-4B-Instruct-2507 | 4.000 M aprox. | no disponible en esta ficha | Apache 2.0 | Hugging Face | Modelo base, capacidades generalistas |
| Otros fine-tunes de Qwen3-4B | variable | variable | variable | Hugging Face | Depende del autor; no se dispone de datos comparativos verificados |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un fine-tune de Qwen3-4B, hereda los sesgos del modelo base y del dataset de ajuste, que no se describe.
- Riesgo de alucinacion: presente como en cualquier modelo de lenguaje de este tamano; no se han publicado evaluaciones de fidelidad.
- Limitaciones de contexto o idioma: el modelo declara unicamente ingles; la longitud de contexto efectiva tras el fine-tune no esta confirmada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no documenta condiciones adicionales ni la procedencia exacta de los datos de ajuste.
- Caveats para produccion: 0 descargas y 0 likes en el momento de la consulta; ausencia de benchmarks, de evaluacion de seguridad y de documentacion sobre el dataset. No se recomienda su uso en produccion sin una evaluacion propia previa.
- El ajuste en ciberseguridad defensiva no esta validado con metricas publicas; el alcance real de esta especializacion es desconocido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amiiruu/amiir-ai
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Unsloth (framework de entrenamiento): https://github.com/unslothai/unsloth
- Ollama (despliegue): https://ollama.com

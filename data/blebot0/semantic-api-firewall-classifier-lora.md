# Blebot0/semantic-api-firewall-classifier-lora

## Resumen

Los adaptadores LoRA "semantic-api-firewall-classifier" son un conjunto de pesos PEFT publicados por el usuario Blebot0 para el proyecto Semantic API Firewall, un cortafuegos semantico de APIs. El modelo resuelve una tarea de clasificacion binaria de texto: determinar si una peticion o instruccion es `safe` o `unsafe` antes de que llegue a un servicio backend. Se distribuyen dos adaptadores independientes, uno sobre `Qwen/Qwen2.5-1.5B-Instruct` y otro sobre `Qwen/Qwen2.5-0.5B-Instruct`, pensados como opcion principal y como contingencia por tamano, respectivamente.

Tecnicamente no es un modelo completo, sino un par de adaptadores LoRA de rango 16 sobre la familia Qwen2.5 Instruct, con licencia Apache 2.0 y un tamano de repositorio de 0,1 GB. El autor reporta un F1 en conjunto de validacion de aproximadamente 0,962 para la variante de 1,5B y 0,921 para la de 0,5B. La relevancia actual reside en su uso como capa de filtrado previa a APIs de agentes y LLM, donde un clasificador pequeno y rapido permite bloquear peticiones maliciosas o fuera de politica sin invocar el modelo principal.

La informacion publica es escasa: no se detallan idiomas, composicion del dataset de entrenamiento ni resultados de benchmarks estandar. La ficha se limita a los datos disponibles en la model card y en los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder Qwen2.5 Instruct |
| Parametros totales | Adaptador LoRA r=16; modelo base de 0,5B o 1,5B parametros (segun variante) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5, no declarada en la model card) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; cuantizacion del base no declarada) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) + ficheros de tokenizer + `classifier_meta.json` |

## Arquitectura y entrenamiento

Cada variante es un adaptador LoRA de rango 16 entrenado sobre un modelo base Qwen2.5 Instruct. La variante principal usa `Qwen/Qwen2.5-1.5B-Instruct` con learning rate 2e-4, y la variante de contingencia usa `Qwen/Qwen2.5-0.5B-Instruct` con learning rate 1e-4. El adaptador se combina con el modelo base para producir una clasificacion binaria con etiquetas `safe` / `unsafe`; los mapas de etiquetas y el modelo base asociado se almacenan en el fichero `classifier_meta.json` de cada carpeta.

No se especifican en la model card el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones de atencion o decodificacion; el interes tecnico esta en el uso de LoRA de bajo rango sobre modelos pequenos para obtener un clasificador de seguridad desplegable con requisitos minimos de hardware.

## Capacidades

- Clasificacion binaria de texto con etiquetas `safe` y `unsafe`, orientada a un cortafuegos semantico de APIs.
- Filtrado previo de peticiones o instrucciones antes de que alcancen un servicio backend.
- Dos niveles de capacidad/rendimiento: variante de 1,5B (F1 aproximado 0,962) y variante de 0,5B (F1 aproximado 0,921).
- Despliegue como servicio HTTP mediante el codigo del repositorio `semantic-api-firewall` (uvicorn + FastAPI).
- Integracion con PEFT y el ecosistema Hugging Face para cargar el adaptador sobre el modelo base.
- No se declaran capacidades de generacion abierta, tool calling, agentes, vision, audio ni modo thinking; el uso previsto es exclusivamente de clasificacion.

## Casos de uso

- Cortafuegos previo a APIs de agentes: el clasificador se coloca delante del endpoint del agente y etiqueta cada peticion como `safe` o `unsafe`, bloqueando instrucciones no permitidas antes de consumir tokens del modelo principal.
- Proteccion de endpoints de LLM en produccion: se interpone entre el cliente y la API del modelo para rechazar prompts con intencion maliciosa, aprovechando el bajo coste de la variante de 0,5B como primera barrera.
- Moderacion de entradas en aplicaciones de atencion al cliente: cada mensaje del usuario se clasifica antes de pasar al sistema conversacional, reduciendo el riesgo de abuso y de inyeccion de instrucciones.
- Filtrado en pipelines de CI/CD de agentes: se ejecuta el clasificador como paso de validacion sobre las peticiones de prueba para detectar regresiones en la politica de seguridad.
- Despliegue en entornos con recursos limitados: la variante de 0,5B permite ejecutar el clasificador en CPU o en GPUs de gama baja, manteniendo un F1 aproximado de 0,921.
- Capa de defensa en profundidad: se combina la variante de 1,5B como clasificador principal y la de 0,5B como contingencia si el servicio principal no esta disponible, segun el esquema de despliegue documentado por el autor.
- Evaluacion de politicas de seguridad: el adaptador sirve para etiquetar conjuntos de peticiones y medir la tasa de falsos positivos y falsos negativos de una politica antes de desplegarla.

## Benchmarks y rendimiento

| Variante | Modelo base | Hparams | F1 en conjunto de validacion (aprox.) |
|---|---|---|---|
| `qwen15b/` | Qwen/Qwen2.5-1.5B-Instruct | lr=2e-4, r=16 | 0,962 |
| `qwen05b/` | Qwen/Qwen2.5-0.5B-Instruct | lr=1e-4, r=16 | 0,921 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; al tratarse de adaptadores sobre modelos de 0,5B y 1,5B, el requisito depende del modelo base y de su cuantizacion.
- GPU recomendadas: no declaradas por el autor; por tamano del base, la variante de 0,5B es apta para GPUs consumer y CPU, y la de 1,5B para GPUs con memoria moderada.
- Cabe en GPU consumer: previsiblemente si para ambas variantes, aunque no se documentan configuraciones concretas.
- Opciones de despliegue: servicio FastAPI/uvicorn del repositorio `semantic-api-firewall`; carga del adaptador mediante PEFT sobre el modelo base de Hugging Face. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Blebot0/semantic-api-firewall-classifier-lora (qwen15b) | Adaptador LoRA r=16 sobre 1,5B | no disponible | F1 aprox. 0,962 (validacion propia) | apache-2.0 | Hugging Face |
| Blebot0/semantic-api-firewall-classifier-lora (qwen05b) | Adaptador LoRA r=16 sobre 0,5B | no disponible | F1 aprox. 0,921 (validacion propia) | apache-2.0 | Hugging Face |
| Clasificadores de moderacion genericos (p. ej. familias tipo Llama Guard) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos publicos suficientes para una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- El F1 reportado (0,962 y 0,921) corresponde a un conjunto de validacion propio del autor; no hay evaluacion independiente.
- No se documentan sesgos conocidos, composicion del dataset ni distribucion de idiomas; el comportamiento fuera del dominio de entrenamiento es incierto.
- Riesgo de alucinacion y de clasificacion erronea en entradas ambiguas o adversariales; al ser un clasificador binario, los errores se traducen directamente en falsos positivos o falsos negativos de seguridad.
- Idiomas soportados no declarados: no se garantiza un rendimiento uniforme en castellano u otros idiomas distintos del usado en el entrenamiento.
- El modelo es un adaptador, no un modelo autonomo: requiere descargar y cargar el modelo base Qwen2.5 correspondiente, con sus propios terminos y requisitos.
- La licencia Apache 2.0 del adaptador no exime de verificar la licencia del modelo base para uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que limita la evidencia de uso en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/Blebot0/semantic-api-firewall-classifier-lora
- Repositorio del proyecto: https://github.com/Blebot0/semantic-api-firewall
- Modelo base 1,5B: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Modelo base 0,5B: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct

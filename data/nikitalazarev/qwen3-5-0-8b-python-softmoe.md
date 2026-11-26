# NikitaLazarev/Qwen3.5-0.8B-Python-SoftMoE

## Resumen

Qwen3.5-0.8B-Python-SoftMoE es un "experto de dominio" derivado del modelo denso Qwen/Qwen3.5-0.8B mediante una tecnica de manipulacion de pesos en espacio de pesos (weight-space steering), sin ningun tipo de entrenamiento ni ajuste fino por gradientes. Lo desarrolla NikitaLazarev dentro del laboratorio autoalojado Ivanna Lab, y su objetivo es especializar al modelo base en el dominio "lenguaje Python y PEPs" inyectando una direccion de dominio directamente en las matrices de salida de un subconjunto de capas.

El modelo mantiene la arquitectura y el tamano del modelo base (873.438.784 parametros, formato safetensors, libreria transformers) y se publica con el pipeline image-text-to-text, heredando las capacidades multimodales del Qwen3.5 subyacente. La innovacion no esta en el entrenamiento sino en el metodo: se calcula un vector de direccion de dominio mediante un escaneo de activaciones y se aplica un parche de rango uno (steer patch) sobre las proyecciones de salida de las capas 15, 16, 17, 18, 20, 21, 22 y 23, con un factor alpha de 0.2.

Su relevancia actual es metodologica: demuestra que se puede construir un "soft MoE" de expertos de dominio a partir de un unico modelo denso, sin reentrenar, y con un router en espacio de embeddings que decide cuando usar la variante especializada. Es un experimento piloto (e2e pilot) con evaluacion publicada en el benchmark code2text_python (CodeXGLUE) y con una version v2 sucesora.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso heredado de Qwen3.5-0.8B, con parche de steering de rango uno en capas seleccionadas (soft MoE por weight steering) |
| Parametros totales | 873.438.784 |
| Parametros activos | No aplica (modelo denso; el "soft MoE" es un router externo entre variantes, no un MoE interno) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 disponible en repositorio GGUF hermano; otros tipos no disponibles |
| Idiomas soportados | no disponible (el dominio del experto es Python y PEPs en ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers); GGUF Q8_0 en repositorio separado |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer denso de aproximadamente 873 millones de parametros con capacidades multimodales (pipeline image-text-to-text). Sobre esa base no se realiza ningun entrenamiento: el autor extrae una direccion de dominio d̂ mediante un escaneo de activaciones que calcula la diferencia de medias de hidden states entre prompts del dominio (Python y PEPs) y prompts de contraste. Esa direccion se "hornea" en los pesos aplicando un parche de steering de rango uno sobre las matrices de salida (down_proj, o_proj, out_proj) de las capas 15, 16, 17, 18, 20, 21, 22 y 23, con modo `steer` y alpha = 0.2.

El metodo se inspira en Weight-Space Programming (Takeyama et al., MIT CSAIL, 2026), que propone ediciones de pesos sin gradientes, y lo extiende invirtiendo la operacion: en lugar de abliterar o suprimir un comportamiento, se amplifica una direccion de dominio. El autor reporta un AUC del gate de escaneo de 1.0 (PASS), lo que indica separacion perfecta entre prompts de dominio y de contraste en la muestra evaluada. El enrutamiento hacia esta variante se hace con un router en espacio de embeddings basado en margen de coseno, que selecciona este experto en lugar del modelo base para consultas del tema. Al estar el efecto integrado en los pesos, funciona en entornos donde no se pueden instalar hooks de inferencia.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen3.5-0.8B.
- Procesamiento image-text-to-text (multimodal) segun el pipeline declarado, heredado del modelo base.
- Especializacion en lenguaje Python, PEPs y convenciones de codigo en ingles, reforzada mediante steering de pesos.
- Enrutamiento por dominio: un router de embeddings con margen de coseno decide cuando activar esta variante frente al modelo base.
- Capacidad de operar sin hooks de inferencia, al estar el sesgo de dominio integrado en los pesos.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia a desarrolladores sobre PEPs y convenciones: el experto refuerza respuestas alineadas con el estilo Pythonico y las PEPs, util para un chatbot interno de consulta de guias de estilo y propuestas de mejora.
- Generacion de documentacion a partir de codigo Python: el benchmark code2text_python (CodeXGLUE) evalua exactamente esta tarea, por lo que el modelo es adecuado para pipelines de docstrings y comentarios tecnicos.
- Enrutamiento por dominio en una plataforma multi-experto: el router de embeddings permite despachar consultas de Python a esta variante y el resto al modelo base, sin coste de entrenamiento adicional.
- Despliegue en entornos restringidos sin hooks: al estar el sesgo integrado en los pesos, encaja en servidores donde no se pueden instalar callbacks de inferencia personalizados.
- Prototipado de investigacion sobre weight steering: sirve como caso reproducible para estudiar edicion de pesos sin gradientes y evaluar el efecto de alpha y de la seleccion de capas.
- Inferencia ligera en hardware modesto: con 873 millones de parametros y una version GGUF Q8_0, es viable en equipos consumer para tareas de asistencia de codigo en local.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado | Muestras |
|---|---|---|---|
| code2text_python (CodeXGLUE) | BLEU-4 suavizado | 1.0289 | 150 |
| code2text_python (CodeXGLUE), v2 (alpha=0.1, position=last, RAG-sampled) | BLEU-4 suavizado | 1.0534 | 150 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni comparativas numericas con modelos similares en la informacion disponible. El valor de BLEU-4 suavizado superior a 1.0 debe interpretarse con cautela, ya que no es un rango habitual para BLEU estandar y probablemente refleja una variante de calculo propia del modulo de benchmarks de Ivanna Lab.

## Requisitos de hardware

- VRAM estimada: en FP16, aproximadamente 1,7 GB solo para pesos (873 M de parametros); con overhead de activaciones y cache KV, el consumo real es mayor y depende de la longitud de contexto (no disponible).
- Cuantizacion Q8_0: reduce el peso de los pesos a menos de 1 GB, permitiendo inferencia en GPUs con 4-8 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente por tamano; para produccion con concurrencia, A100 o H100 aportan margen pero estan sobredimensionadas para este modelo.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 4 GB o mas en Q8_0, y en 8 GB o mas en FP16.
- Opciones de despliegue: transformers (libreria declarada), llama.cpp u Ollama mediante la version GGUF Q8_0, y servidores compatibles con endpoints segun el tag endpoints_compatible. vLLM y TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-Python-SoftMoE | 873 M | no disponible | Python y PEPs (steering) | no disponible | safetensors, GGUF Q8_0 |
| Qwen/Qwen3.5-0.8B (base) | 873 M | no disponible | Generalista, multimodal | no disponible | safetensors |
| Qwen3.5-0.8B-Python-SoftMoE-v2 | no disponible | no disponible | Python y PEPs (steering v2) | no disponible | safetensors |

La comparativa con alternativas de la misma categoria (expertos de dominio derivados por edicion de pesos) no esta disponible en la informacion proporcionada. El sucesor directo es la version v2 del mismo autor, con BLEU-4 suavizado de 1.0534 frente a 1.0289 de esta version.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor o consultar la licencia del modelo base antes de produccion.
- Idiomas no declarados: el dominio del experto esta definido en ingles (Python y PEPs en EN), por lo que el comportamiento en castellano u otros idiomas no esta evaluado.
- Longitud de contexto no disponible: no se puede planificar el uso en conversaciones largas o repositorios extensos sin verificarla contra el modelo base.
- Riesgo de alucinacion: al ser un modelo de 873 M sin entrenamiento adicional, mantiene los riesgos del modelo base, y el steering puede reforzar respuestas plausibles pero incorrectas sobre PEPs.
- Metodologia experimental: es un piloto e2e con un unico benchmark y 150 muestras; la evidencia de mejora es limitada y el AUC de 1.0 corresponde a la muestra de escaneo, no a una validacion externa amplia.
- El termino "MoE" es enganoso: no hay mezcla de expertos interna ni parametros activos; el enrutamiento es externo y depende de un router de embeddings que debe desplegarse aparte.
- El efecto del steering esta acoplado a capas y alpha concretos; cambios en la configuracion de inferencia o en el modelo base pueden alterar el comportamiento.
- Sin datos de sesgos conocidos ni de evaluaciones de seguridad en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NikitaLazarev/Qwen3.5-0.8B-Python-SoftMoE
- Version sucesora v2: https://huggingface.co/NikitaLazarev/Qwen3.5-0.8B-Python-SoftMoE-v2
- Cuantizacion GGUF Q8_0: https://huggingface.co/NikitaLazarev/Qwen3.5-0.8B-Python-SoftMoE-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Ivanna Lab (repositorio del laboratorio): https://github.com/wiskeone/ivanna-lab

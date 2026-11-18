# LastMachine/Qwen3-8B-ZeroZero-Heretic-GGUF

## Resumen

Qwen3-8B-ZeroZero-Heretic-GGUF es una cuantizacion en formato GGUF (concretamente Q4_K_M) del modelo Qwen3-8B-ZeroZero-Heretic, un derivado "abliterated" y "decensored" de Qwen3-8B de Alibaba. Lo publica el usuario LastMachine bajo licencia Apache 2.0. El modelo base sobre el que se construye toda la cadena es Qwen3-8B, un transformer denso de 8.190.735.360 parametros, y la modificacion se ha realizado con la herramienta Heretic 2.0.0, cuyo objetivo es reducir los rechazos (refusals) y el estilo de respuesta redundante ("slop") manteniendo la coherencia factual.

El interes de esta ficha es doble. Por un lado, documenta un artefacto GGUF listo para ejecutarse en llama.cpp, LM Studio u Ollama, con un tamano de repositorio de unos 5 GB, lo que lo hace viable en hardware de consumo. Por otro lado, advierte de que se trata de un modelo deliberadamente "sin censura": segun la model card, reduce un 91% los rechazos en la bateria de prompts daninos de Heretic y un 68% las respuestas que caen en su lista de "slop", mientras que las comprobaciones de hechos y logica se mantienen en 13/15.

Es relevante ahora porque ejemplifica una tendencia creciente de derivados "abliterated" sobre modelos abiertos de Qwen, y porque su publicacion como GGUF lo pone al alcance de desarrolladores que quieren experimentar con modelos sin filtros en local. No obstante, la propia model card incluye una advertencia de seguridad explicita: el modelo respondera a peticiones que un modelo normal rechazaria, incluidas las daninas, y no garantiza veracidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M (unico publicado en este repo GGUF) |
| Idiomas soportados | en (segun la model card; el modelo base Qwen3 es multilingue, pero la card declara solo ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 5.0 GB); existe tambien build MLX y el modelo base en 16 bits |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-8B, un transformer denso de 8.19 mil millones de parametros. Sobre esa base, el autor aplico la herramienta Heretic 2.0.0, que actua sobre la direccion de rechazo del modelo (abliteration) y anade un pase adicional de "no-slop" para reducir palabras y formulas redundantes. No se dispone en la informacion proporcionada de detalles sobre el dataset de entrenamiento original de Qwen3-8B (numero de tokens, composicion, fases de RLHF/DPO), ni sobre el procedimiento exacto de Heretic mas alla de su version.

La model card indica que las metricas reportadas (reduccion de rechazos, reduccion de slop, comprobaciones de hechos) se midieron sobre el modelo completo en 16 bits, no sobre esta cuantizacion Q4_K_M, por lo que deben esperarse diferencias pequenas al usar el GGUF. No se documentan innovaciones de inferencia como decodificacion especulativa o atencion lineal en esta ficha.

## Capacidades

- Generacion de texto conversacional y de formato largo (relatos, articulos, respuestas multi-turno).
- Razonamiento y respuesta a prompts de logica y hechos (la card reporta 13/15 comprobaciones superadas, sin cambio respecto al base).
- Reduccion de rechazos: segun la card, 9/100 rechazos frente a 100/100 del base en la bateria de Heretic.
- Reduccion de "slop": 25/100 respuestas con elementos de la lista frente a 78/100 del base; 3.6 palabras de slop por 1.000 frente a 16.5.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: la card declara solo ingles; el modelo base Qwen3 es multilingue, pero no se confirma el comportamiento tras la modificacion.
- Capacidades especiales (vision, audio, thinking mode): no disponibles en la informacion proporcionada.

## Casos de uso

- Generacion creativa sin filtros: escritura de relatos, dialogos y guiones donde el autor quiere evitar rechazos por tematica sensible; el modelo responde a peticiones que un modelo alineado rechazaria, segun la propia card.
- Prototipado local en hardware de consumo: con Q4_K_M (~5 GB) se puede ejecutar en llama.cpp, LM Studio u Ollama en equipos con 8-16 GB de RAM/VRAM, lo que facilita experimentar sin infraestructura cloud.
- Investigacion sobre alineacion y abliteration: util para estudiar como cambia el comportamiento de un modelo al eliminar la direccion de rechazo, comparando las metricas de la card (rechazos, slop, hechos) contra Qwen3-8B original.
- Evaluacion de riesgos y red teaming: sirve como caso de estudio de un modelo deliberadamente permisivo para disenar filtros de salida y politicas de uso en produccion.
- Generacion de texto en ingles para pipelines de contenido: la card declara soporte de ingles y el modelo es conversacional, adecuado para borradores y variaciones de texto.
- Despliegue en entornos air-gapped: al ser un GGUF descargable y ejecutable con llama.cpp, puede correr sin conexion en maquinas locales, util para laboratorios con requisitos de privacidad.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son las metricas internas de la model card, medidas sobre el modelo completo en 16 bits (no sobre este Q4_K_M):

| Medida | Cambio | Antes → despues |
|---|---:|---:|
| Rechazos en el test de prompts daninos de Heretic | 91% menos | 100/100 → 9/100 |
| Respuestas que caen en la lista de slop | 68% menos | 78/100 → 25/100 |
| Palabras de slop por 1.000 | 78% menos | 16.5 → 3.6 |
| Comprobaciones de hechos y logica superadas | Sin cambio | 13/15 → 13/15 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el archivo Q4_K_M ocupa aproximadamente 5 GB; se recomienda al menos 6-8 GB de memoria libre para inferencia con contexto moderado.
- GPU recomendadas: no especificadas en la informacion; por tamano, cualquier GPU consumer con 8 GB o mas (RTX 3060/4060/4070, etc.) deberia poder cargarlo.
- Cabe en GPU de consumo: si, segun el tamano del archivo Q4_K_M.
- Opciones de despliegue: llama.cpp (llama-cli), LM Studio, Ollama (`ollama run hf.co/LastMachine/Qwen3-8B-ZeroZero-Heretic-GGUF:Q4_K_M`) y build MLX para Apple Silicon.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3-8B-ZeroZero-Heretic-GGUF (este) | 8.19B | no disponible | Apache 2.0 | GGUF Q4_K_M | Abliterated + no-slop, card declara solo ingles |
| Qwen/Qwen3-8B (base) | 8.19B | no disponible | Apache 2.0 | safetensors | Modelo original alineado, rechaza prompts daninos |
| Qwen3-8B-ZeroZero-Heretic (16 bits) | 8.19B | no disponible | Apache 2.0 | safetensors | Version completa sin cuantizar del mismo derivado |
| Qwen3-8B-ZeroZero-Heretic-MLX | 8.19B | no disponible | Apache 2.0 | MLX | Build para Apple Silicon del mismo derivado |

No se dispone de datos de benchmarks comparativos con otras familias de modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo deliberadamente permisivo: respondera a peticiones que un modelo alineado rechazaria, incluidas las daninas; la salida puede ser peligrosa, falsa o sesgada.
- Menos rechazos no implica mas veracidad: la propia card senala que sobre Tiananmen Square da una version oficial sanitizada y desaconseja su uso para hechos sobre China, decisiones financieras, medicas o legales.
- Sesgos conocidos: no documentados de forma especifica en la informacion disponible; hereda los del modelo base Qwen3-8B.
- Riesgo de alucinacion: presente, como en cualquier LLM; la card no reporta mejoras en este aspecto mas alla de mantener 13/15 en sus comprobaciones internas.
- Limitaciones de idioma: la card declara solo ingles; el comportamiento multilingue tras la modificacion no esta verificado.
- Limitaciones de contexto: la longitud de contexto no se detalla en la informacion proporcionada.
- Licencia: Apache 2.0 permite uso comercial, pero el autor declara que es un proyecto independiente no afiliado ni respaldado por Qwen, Alibaba Cloud, Anthropic ni el proyecto Heretic; el usuario es responsable del uso.
- Las metricas de la card se midieron en 16 bits, no en este Q4_K_M, por lo que pueden diferir ligeramente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/LastMachine/Qwen3-8B-ZeroZero-Heretic-GGUF
- Modelo base (16 bits): https://huggingface.co/LastMachine/Qwen3-8B-ZeroZero-Heretic
- Build MLX: https://huggingface.co/LastMachine/Qwen3-8B-ZeroZero-Heretic-MLX
- Coleccion ZeroZero: https://huggingface.co/collections/LastMachine/zerozero-6af68595b0b72f13ce60bde2
- Modelo original Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic

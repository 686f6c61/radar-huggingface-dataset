# bashxyz/Ornith-1.5-9B-GGUF

## Resumen

Ornith-1.5-9B es un modelo de lenguaje denso de 9.197 millones de parametros desarrollado por ornith-ai, presentado como el miembro mas ligero de la familia Ornith-1.5. El modelo se construye sobre la base de Ornith-1.0 (que a su vez parte de Qwen3.5 y Gemma4 con preentrenamiento continuado, mid-training y post-training adicionales) y amplia el bucle de auto-mejora end-to-end: en lugar de depender de tareas curadas manualmente y arneses disenados a mano, Ornith-1.5 genera continuamente nuevas tareas de entrenamiento, descubre estrategias efectivas para resolverlas y mejora la politica mediante aprendizaje por refuerzo.

La ficha que nos ocupa corresponde a la cuantizacion GGUF publicada por el usuario `bashxyz`, orientada a inferencia local y despliegue eficiente en una sola GPU. El modelo base esta disenado explicitamente para despliegue en una unica GPU y, en su variante cuantizada Mobile, para dispositivos moviles.

Es relevante ahora porque combina un tamano contenido (9B) con resultados en tareas de codigo agente (SWE-bench Verified 70.6, SWE-bench Pro 47.5, Terminal-Bench 2.1 con Claude Code 47.0) que superan a modelos densos comparables y se acercan a modelos MoE de mayor tamano activo como Qwen3.6-35B-A3B. La licencia MIT facilita su adopcion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no se detalla la variante exacta en la informacion disponible) |
| Parametros totales | 9.197.093.888 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (el repo contiene 49,1 GB de pesos cuantizados; niveles concretos no especificados) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (repo de cuantizacion); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso de aproximadamente 9,2 mil millones de parametros. La model card describe el proceso de entrenamiento como una extension del de Ornith-1.0: preentrenamiento continuado sobre Qwen3.5 y Gemma4, seguido de mid-training y post-training. La innovacion principal de Ornith-1.5 es la optimizacion conjunta del bucle de auto-mejora: generacion de tareas, construccion de arneses (scaffolds) y rollouts de soluciones se optimizan de forma simultanea, y la politica se refina mediante aprendizaje por refuerzo sobre recompensas de rollout. La model card remite a un blog para los detalles de diseno de tareas, arneses y recompensas.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas concretas como RLHF o DPO mas alla de la mencion generica al aprendizaje por refuerzo. Tampoco se detalla la longitud de contexto ni innovaciones de atencion.

## Capacidades

- Generacion de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Razonamiento y resolucion de tareas de codigo agente: los benchmarks publicados se centran en SWE-bench y Terminal-Bench.
- Ejecucion de tareas de terminal y uso de herramientas de linea de comandos (Terminal-Bench 2.1 evaluado con Terminus-2 y Claude Code).
- Resolucion de issues de repositorio reales (SWE-bench Verified y SWE-bench Pro).
- Soporte multilingue en tareas de codigo (SWE-bench Multilingual aparece en la tabla de benchmarks).
- Capacidad de auto-mejora durante el entrenamiento mediante generacion de tareas y rollouts con RL.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible.
- Capacidades de vision, audio o modo thinking: no disponibles en la informacion proporcionada.

## Casos de uso

- Reparacion automatica de issues en repositorios: el modelo puede recibir un issue y el arbol del proyecto para generar un parche; sus resultados en SWE-bench Verified (70.6) lo hacen adecuado para pipelines de mantenimiento de codigo.
- Agente de terminal y automatizacion de DevOps: con 46,2 en Terminal-Bench 2.1 (Terminus-2) y 47,0 con Claude Code, puede integrarse en tareas de shell, gestion de ficheros y ejecucion de comandos en entornos controlados.
- Asistente de codigo en IDE o CLI: al ser un modelo denso de 9B desplegable en una sola GPU, encaja en herramientas de autocompletado y refactorizacion con baja latencia.
- Revision de pull requests: puede analizar diffs y proponer correcciones en flujos de CI/CD, aprovechando su rendimiento en SWE-bench Pro (47,5).
- Despliegue en el borde y movil: la variante cuantizada Mobile (mencionada en la model card) permite inferencia en dispositivos con recursos limitados para asistentes offline.
- Procesamiento multilingue de codigo: util para equipos con bases de codigo en varios idiomas, dado el benchmark SWE-bench Multilingual incluido.
- Prototipado e investigacion en RL: la descripcion del bucle de auto-mejora lo hace interesante para estudiar generacion de tareas y optimizacion de politicas.

## Benchmarks y rendimiento

Datos publicados en la model card (porcentajes):

| Benchmark | Ornith-1.5-9B | Ornith-1.0-9B | Qwen3.5-9B | Qwen3.6-35B-A3B | Gemma-4-31B |
|---|---|---|---|---|---|
| Terminal-Bench 2.1 (Terminus-2) | 46,2 | 43,1 | 21,3 | 52,5 | 42,1 |
| Terminal-Bench 2.1 (Claude Code) | 47,0 | 40,6 | 18,9 | 49,2 | no disponible |
| SWE-bench Verified | 70,6 | 69,4 | 53,2 | 73,4 | 52,0 |
| SWE-bench Pro | 47,5 | 42,9 | 31,3 | 49,5 | 35,7 |
| SWE-bench Multilingual | no disponible (tabla truncada) | no disponible | no disponible | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia orientativa para un modelo denso de 9,2B, una cuantizacion de 4 bits requeriria del orden de 5-6 GB solo para pesos, mas overhead de contexto; una de 8 bits, unos 9-10 GB; y FP16, unos 18-19 GB. Estas cifras son estimaciones generales, no datos publicados por el autor.
- GPU recomendadas: no especificadas en la informacion disponible. El modelo base esta disenado para despliegue en una sola GPU.
- GPU de consumo: previsiblemente viable en tarjetas con 8-24 GB de VRAM segun cuantizacion, aunque el autor no lo confirma.
- Opciones de despliegue: al distribuirse en GGUF, es compatible con llama.cpp y con runners basados en GGUF como Ollama o LM Studio; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia. vLLM y TGI no estan confirmados para este repo GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench Verified | Terminal-Bench 2.1 (Claude Code) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ornith-1.5-9B | 9,2B denso | no disponible | 70,6 | 47,0 | MIT | HuggingFace (GGUF) |
| Ornith-1.0-9B | 9B denso | no disponible | 69,4 | 40,6 | no disponible | HuggingFace |
| Qwen3.5-9B | 9B denso | no disponible | 53,2 | 18,9 | no disponible | HuggingFace |
| Qwen3.6-35B-A3B | 35B totales / 3B activos (MoE) | no disponible | 73,4 | 49,2 | no disponible | HuggingFace |
| Gemma-4-31B | 31B denso | no disponible | 52,0 | no disponible | no disponible | HuggingFace |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al derivar de Qwen3.5 y Gemma4, puede heredar sesgos de sus preentrenamientos.
- Riesgo de alucinacion: no cuantificado; como todo modelo generativo, puede producir codigo o afirmaciones incorrectas, especialmente en tareas fuera de distribucion.
- Limitaciones de contexto e idioma: la longitud de contexto no se especifica y los idiomas soportados no estan documentados; los benchmarks multilingues solo cubren codigo.
- Licencia: MIT, permisiva para uso comercial, aunque conviene verificar la licencia de los modelos base (Qwen3.5 y Gemma4) por posibles obligaciones heredadas.
- Repo de cuantizacion de terceros: esta ficha corresponde a `bashxyz/Ornith-1.5-9B-GGUF`, no al repo oficial; la calidad de la cuantizacion no esta avalada por el autor original. El repo tiene 0 descargas y 0 likes en el momento de la consulta.
- Tabla de benchmarks truncada: los datos de SWE-bench Multilingual no estan completos en la informacion proporcionada.
- Para produccion: faltan datos de contexto, latencia y throughput que permitan dimensionar el despliegue con rigor.

## Enlaces

- Repo HuggingFace de esta cuantizacion: https://huggingface.co/bashxyz/Ornith-1.5-9B-GGUF
- Modelo base oficial: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Licencia del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B/blob/main/LICENSE
- Blog de Ornith-1.5: https://ornith.ai/ornith_1_5.html

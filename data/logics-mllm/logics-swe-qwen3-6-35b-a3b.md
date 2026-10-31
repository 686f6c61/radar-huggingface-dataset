# Logics-MLLM/Logics-SWE-Qwen3.6-35B-A3B

## Resumen

Logics-SWE-Qwen3.6-35B-A3B es un modelo de ingenieria de software desarrollado por Logics-MLLM a partir de Qwen3.6-35B-A3B, un modelo MoE de Qwen con 35 mil millones de parametros totales y aproximadamente 3 mil millones activos. Su objetivo es servir como agente de codigo a nivel de repositorio, capaz de explorar bases de codigo, diagnosticar issues, editar codigo, ejecutar tests y depurar iterativamente dentro de un harness de agente de programacion.

La innovacion principal es el metodo RRE-MOPD (Refresh-Repair-Expand con category-aware multi-teacher on-policy distillation): se entrenan tres expertos de 27B especializados en dominios de repositorio (servicios, datos y seguridad; aplicaciones de usuario; sistemas, tooling y runtimes) y posteriormente se destilan sus conocimientos en un unico modelo estudiante de 35B-A3B mediante destilacion on-policy con guia a nivel de token. El resultado es un solo modelo que no requiere enrutamiento de expertos ni los profesores en inferencia.

Es relevante porque consigue mejoras medibles frente al modelo base (+3,69 puntos en SWE-bench Pro V2, +3,00 en SWE-bench Multilingual, +2,37 en SWE-bench Pro) manteniendo un coste de inferencia bajo gracias a su arquitectura MoE con pocos parametros activos, lo que lo hace atractivo para despliegues de agentes de codigo en produccion. Se publica bajo licencia Apache 2.0, en formato safetensors, con un peso de repositorio de 70,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (qwen3_5_moe), basado en Qwen3.6-35B-A3B |
| Parametros totales | 35.107.181.936 (~35B) |
| Parametros activos | ~3B (por el sufijo A3B; valor exacto no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos originales en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (70,2 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.6-35B-A3B, una arquitectura transformer de mezcla de expertos (MoE) en la que solo una fraccion de los parametros se activa por token, lo que permite mantener la capacidad de un modelo de 35B con el coste de inferencia de uno de ~3B. La model card no detalla el numero exacto de expertos, capas ni tokens de entrenamiento del modelo base.

El post-entrenamiento sigue el enfoque RRE-MOPD descrito en el paper "One to More, More to One: Category-Aware Iterative Expert Training for Software Engineering Agents" (arXiv:2609.23377). Primero, SWE Labeler clasifica las tareas en tres categorias de dominio de repositorio. Se entrenan tres expertos basados en Qwen3.6-27B con el ciclo Refresh-Repair-Expand, que alterna aprendizaje por refuerzo agéntico, refrescos de dominio y reparacion supervisada sobre trayectorias exitosas verificadas. Finalmente, el estudiante (inicializado desde Qwen3.6-35B-A3B) genera sus propias trayectorias y recibe guia token a token del experto correspondiente a cada tarea, usando su politica inicial como referencia congelada para la extrapolacion. El dataset publico asociado es Logics-SWE-Env-2.5K, con 2.553 instancias de tareas de ingenieria de software y sus imagenes de entorno.

## Capacidades

- Generacion y edicion de codigo a nivel de repositorio (repository-level), no solo snippets aislados.
- Exploracion de bases de codigo y diagnostico de issues dentro de un harness de agente.
- Ejecucion de tests y depuracion iterativa con retroalimentacion de ejecucion.
- Construccion y validacion de parches sobre repositorios reales.
- Generacion de texto conversacional heredada del modelo base Qwen3.6-35B-A3B.
- Compatible con APIs estilo OpenAI cuando se sirve con vLLM, lo que facilita la integracion con harnesses de agentes que usan tool calling (el soporte nativo de function calling depende del modelo base; no se detalla en la model card).
- Razonamiento sobre multiples pasos tipico de flujos agénticos de software engineering.
- Capacidades multilingues para codigo (SWE-bench Multilingual) y para lenguajes naturales: no disponible.

## Casos de uso

- Resolucion automatica de issues en repositorios reales: el modelo puede integrarse en un harness tipo SWE-agent para localizar el codigo relevante, proponer un parche y validarlo con los tests del repositorio.
- Refactorizaciones a gran escala: dado su entrenamiento sobre tareas de dominios variados (servicios, datos, herramientas), puede recorrer bases de codigo grandes y aplicar cambios coherentes en multiples ficheros.
- Agentes de revision de codigo: puede analizarse un pull request, ejecutarse la suite de tests y generarse un informe con parches propuestos.
- Pipelines de CI/CD con autocorreccion: servido con vLLM tras una API OpenAI-compatible, puede recibir el fallo de un test, diagnosticar la causa y devolver un fix automatico.
- Porting y mantenimiento multilingue: su mejora en SWE-bench Multilingual (+3,00 puntos) lo hace adecuado para tareas sobre repositorios en lenguajes distintos de Python.
- Investigacion en post-entrenamiento agéntico: el dataset Logics-SWE-Env-2.5K y el repo AgenticBigBang permiten reproducir o extender el entrenamiento RRE-MOPD.
- Asistentes de desarrollo internos: gracias a sus ~3B de parametros activos, el coste por token es bajo, adecuado para despliegues con alto volumen de peticiones de ingenieria.

## Benchmarks y rendimiento

Resultados publicados en la model card (media de tres rondas, % de resolucion, setup completo modelo+agente):

| Evaluacion | Tareas por ronda | Qwen3.6-35B-A3B | Logics-SWE-Qwen3.6-35B-A3B | Mejora |
|---|---:|---:|---:|---:|
| SWE-bench Pro V2 | 642 | 73,31 | 77,00 | +3,69 |
| SWE-bench Pro V2 Hard-51 | 51 | 28,10 | 33,99 | +5,88 |
| SWE-bench Multilingual | 300 | 63,44 | 66,44 | +3,00 |
| SWE-bench Pro | 731 | 48,75 | 51,12 | +2,37 |
| LiveCodeBench v6 | 175 | 76,95 | 78,10 | +1,14 |

No se han publicado comparaciones directas con modelos de terceros (Claude, GPT, DeepSeek, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 70 GB solo de pesos (coincide con el tamano del repo de 70,2 GB), por lo que se necesita al menos una GPU de 80 GB (A100/H100) o dos GPUs de 48 GB (A6000/L40S) con tensor parallelism.
- Con cuantizacion (por ejemplo GGUF o AWQ a 4 bits) la huella podria reducirse a ~20-25 GB, pero no hay versiones cuantizadas oficiales publicadas: no disponible.
- Consumer GPU: no cabe en una sola RTX 4090 (24 GB) en precision completa; solo seria viable con cuantizacion agresiva no publicada oficialmente.
- Despliegue recomendado: vLLM (`vllm serve /path/to/Logics-SWE-Qwen3.6-35B-A3B`), que expone una API OpenAI-compatible. La compatibilidad con llama.cpp, Ollama o TGI no se documenta en la model card.
- Latencia y throughput: no disponibles; al ser MoE con ~3B de parametros activos, el throughput por token deberia ser comparable al de un modelo denso de 3B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench Pro V2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Logics-SWE-Qwen3.6-35B-A3B | 35B (MoE, ~3B activos) | no disponible | 77,00 | Apache 2.0 | safetensors en HuggingFace |
| Qwen3.6-35B-A3B (base) | 35B (MoE, ~3B activos) | no disponible | 73,31 | no disponible | HuggingFace |
| Logics-SWE-Qwen3.6-27B | 27B (denso, se supone) | no disponible | no disponible | no disponible | HuggingFace |

Otras alternativas de la categoria (por ejemplo Claude, GPT-Codex u otros agentes SWE open source) no incluyen datos comparables en la informacion disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; al derivar de Qwen3.6, heredara presumiblemente los sesgos de su modelo base y de sus datos de entrenamiento, no documentados aqui.
- Riesgo de alucinacion: no cuantificado; como todo modelo de codigo, puede generar parches plausibles pero incorrectos, por lo que la validacion con tests ejecutados es imprescindible.
- Contexto: la longitud de ventana no esta documentada; para tareas de repositorio grande conviene verificarla en la ficha del modelo base Qwen3.6-35B-A3B antes de produccion.
- Idiomas: no especificados en la model card.
- Licencia: Apache 2.0 permite uso comercial sin restricciones relevantes mas alla de la atribucion.
- El modelo esta optimizado para tareas de ingenieria de software agénticas; su rendimiento en uso general (chat, escritura) puede no haber mejorado respecto al modelo base.
- Los benchmarks se miden con un setup concreto de agente; los resultados pueden variar significativamente con otro harness, herramientas o presupuesto de pasos.
- No hay versiones cuantizadas oficiales ni documentacion de despliegue fuera de vLLM.

## Enlaces

- HuggingFace: https://huggingface.co/Logics-MLLM/Logics-SWE-Qwen3.6-35B-A3B
- Paper (arXiv:2609.23377): https://arxiv.org/abs/2609.23377
- GitHub (AgenticBigBang): https://github.com/alibaba/AgenticBigBang
- Modelo hermano (27B): https://huggingface.co/Logics-MLLM/Logics-SWE-Qwen3.6-27B
- Dataset (Logics-SWE-Env-2.5K): https://huggingface.co/datasets/Logics-MLLM/Logics-SWE-Env-2.5K
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Documentacion vLLM: https://docs.vllm.ai/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0

# hellohazime/Qwen3.8-2.4T-A95B-REAP-256GB-GGUF

## Resumen

El modelo `hellohazime/Qwen3.8-2.4T-A95B-REAP-256GB-GGUF` es una versión podada y cuantizada del gigante MoE Qwen3.8-2.4T-A95B de Alibaba, diseñada para ejecutarse en máquinas con 256 GB de memoria. El autor, hellohazime, aplica una doble poda: por un lado elimina 208 de los 512 expertos por capa MoE (quedándose con 304) y por otro reduce el ancho de cada experto superviviente de 2048 a 1536 canales intermedios. El resultado es un archivo GGUF de 246 GB (229 GiB) que mantiene la cuantización original UD-IQ1_S (1.56 bpw) sin re-cuantizar ningún byte.

La relevancia de esta ficha radica en que es un ejemplo práctico de cómo llevar un modelo de 2.4 billones de parámetros a hardware de gama alta pero no extrema, sacrificando capacidades multilingües y parte del rendimiento en tareas difíciles a cambio de una huella de memoria mucho menor. El autor documenta de forma transparente las métricas de divergencia frente al modelo sin podar (KLD, acuerdo argmax, perplexidad) y los resultados en SWE-Lancer, lo que permite evaluar con datos concretos si la poda es aceptable para un caso de uso determinado.

El modelo está pensado para despliegues en inglés y código, con soporte de tool calling y generación de agentes, y se ejecuta en llama.cpp sin necesidad de forks. No es adecuado para trabajo multilingüe ni para razonamiento complejo de cola pesada, como advierte explícitamente el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) con poda de expertos y de ancho |
| Parametros totales | 1.116.664.772.480 (modelo original sin podar); tras poda no disponible |
| Parametros activos | 95 mil millones (A95B, del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | UD-IQ1_S (1.56 bpw) para expertos, sin re-cuantizacion |
| Idiomas soportados | ingles y codigo (el autor advierte que no usar para multilingue) |
| Licencia | qwen3.8-max (licencia propietaria de Qwen, ver enlace) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-2.4T-A95B, un transformer MoE con 512 expertos por capa y 95 mil millones de parametros activos. La version podada reduce los expertos a 304 por capa (seleccionados por recuento de rutas del router, no por saliencia ponderada por gate) y el ancho de cada experto de 2048 a 1536 canales (conservando 6 de 8 superbloques de 256 canales, elegidos por energia de activacion medida con llama-imatrix). La calibracion se hizo con 200k tokens de un corpus de ingles web y codigo, pasados por el modelo sin podar.

La poda es identitaria: los pesos supervivientes son copias byte a byte del GGUF original UD-IQ1_S, sin re-cuantizacion. El autor mide la divergencia frente al modelo sin podar con KLD, acuerdo argmax y perplexidad sobre texto held-out (128k tokens de FineWeb y codeparrot). Los resultados muestran que el dano se concentra en una cola pesada: la mediana de KLD en codigo es 0.020 (mitad de tokens intactos) pero la media sube a 0.288 por el percentil 99 en 3.8. El acuerdo argmax es 86.6% en codigo y 79.2% en ingles. La perplexidad empeora un 26% en codigo y un 20% en ingles.

## Capacidades

- Generacion de texto en ingles y codigo con calidad cercana al modelo sin podar en tareas rutinarias.
- Tool calling y uso de agentes: verificado con Qwen Code CLI 0.21.11 contra llama-server con jinja, escribiendo un archivo via llamadas a herramienta y ejecutandolo.
- Razonamiento multi-paso basico: el modelo puede seguir cadenas de razonamiento, pero falla en tareas dificiles de cola pesada (ver benchmarks).
- Soporte de contexto largo: no especificado, pero al ser un MoE con streaming de expertos en llama.cpp puede manejar secuencias largas si la RAM lo permite.
- Capacidades multilingues: practicamente nulas; el autor advierte explicitamente que no usar para trabajo multilingue.
- No tiene capacidades de vision ni audio (modelo de texto puro).

## Casos de uso

- Asistente de codigo en produccion: el modelo puede integrarse en IDEs o CLIs para autocompletado y generacion de funciones, aprovechando su acuerdo argmax del 86.6% en codigo y su capacidad de tool calling. Adecuado para tareas rutinarias de programacion.
- Agente de automatizacion de tareas: con llama-server y un CLI como Qwen Code, puede ejecutar comandos, escribir archivos y verificar resultados, como se demostro en el smoke test. Ideal para pipelines de CI/CD que necesiten un agente local.
- Chat de soporte tecnico en ingles: su bajo KLD en texto rutinario (mediana 0.097) lo hace util para responder preguntas frecuentes y documentacion tecnica, siempre que el dominio sea ingles.
- Analisis de logs y depuracion: puede procesar grandes volumenes de texto de logs y sugerir correcciones, gracias a su ventana de contexto (no especificada pero presumiblemente amplia) y su enfoque en codigo.
- Generacion de documentacion tecnica: a partir de especificaciones o comentarios en codigo, puede redactar documentacion en ingles con calidad aceptable.
- Prototipado rapido de agentes en entornos con 256 GB de RAM: su tamano reducido permite ejecutarlo en una sola maquina sin necesidad de cluster, a diferencia del modelo original que requiere 512 GB.

## Benchmarks y rendimiento

El autor publica metricas de divergencia frente al modelo sin podar y un benchmark de agente real:

| Metrica | Valor (ingles) | Valor (codigo) |
|---|---|---|
| KLD medio | 0.239 | 0.288 |
| KLD mediana | 0.097 | 0.020 |
| Acuerdo argmax | 79.2% | 86.6% |
| Perplexidad (antes -> despues) | 9.05 -> 10.90 (x1.20) | 1.89 -> 2.38 (x1.26) |

| Benchmark | Resultado |
|---|---|
| SWE-Lancer (8 tareas, 1 intento, 10800 s cap) | 3 de 8 tareas resueltas ($2,000 de $13,500 en juego) |

El autor aclara que las 3 tareas resueltas son "sanity checks" faciles, mientras que las 5 mas dificiles fallan, confirmando la cola pesada de divergencia. No se publican resultados de MMLU, HumanEval u otros benchmarks estandar.

## Requisitos de hardware

- Memoria: 246 GB (229 GiB) de almacenamiento y RAM/VRAM. Requiere una maquina con al menos 256 GB de RAM unificada o VRAM distribuida.
- GPU recomendadas: el autor verifico su funcionamiento en un Apple M3 Ultra con 256 GB de memoria unificada, alcanzando 9.6-10.0 tok/s de decodificacion residente. En GPUs discretas, se necesitarian multiples A100 80GB o H100 80GB (al menos 4) para cargar el modelo completo en VRAM, o usar streaming de expertos desde SSD.
- No cabe en GPUs de consumo (RTX 4090, 3090, etc.) por el tamano del modelo; se requiere hardware de servidor o Mac Studio con memoria unificada.
- Opciones de despliegue: llama.cpp (verificado en mainline commit 4c1a0af), llama-server con jinja para tool calling, y el fork del autor. Tambien compatible con Ollama y otros frontends que usen llama.cpp.
- Latencia: 9.6-10.0 tok/s medidos en M3 Ultra; el autor menciona 5.3-6.3 tok/s para el modelo sin podar con streaming de expertos, por lo que la poda mejora la velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Tamano | Notas |
|---|---|---|---|---|---|
| Qwen3.8-2.4T-A95B (original) | 2.4T total, 95B activos | no disponible | qwen3.8-max | 508 GB (UD-IQ1_S) | Sin podar, requiere 512 GB, 5.3-6.3 tok/s en M3 Ultra |
| hellohazime/Qwen3.8-2.4T-A95B-REAP-256GB-GGUF | ~1.1T total (original), activos no disponibles | no disponible | qwen3.8-max | 246 GB | Poda doble, 9.6-10.0 tok/s, pierde multilingue y cola pesada |
| hellohazime/Kimi-K3-REAP-512GB-GGUF | no disponible | no disponible | no disponible | 512 GB | Poda REAP con saliencia completa, metodologia diferente (mencionado en la model card) |

No se dispone de comparaciones directas con otros modelos podados de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- No usar para trabajo multilingue: la calibracion se hizo solo con ingles y codigo, y el autor advierte que los idiomas no ingleses y capacidades fuera de dominio se sacrifican deliberadamente.
- Cola pesada de divergencia: aunque la mediana de KLD es baja, el percentil 99 alcanza 3.8 en codigo, lo que causa fallos en tareas de razonamiento dificil. Las 5 tareas mas complejas de SWE-Lancer fallaron.
- Licencia restrictiva: la licencia qwen3.8-max es propietaria y puede tener restricciones de uso comercial; consultar los terminos en el enlace de la licencia.
- Sin garantias de rendimiento en tareas de agente complejas: el smoke test de tool calling fue una unica ejecucion, no un benchmark.
- El modelo es una cuantizacion extrema (1.56 bpw) que ya hereda perdida de calidad del modelo base; la poda anade divergencia adicional.
- Requiere 256 GB de memoria, lo que limita su despliegue a servidores de gama alta o Mac Studio; no apto para entornos de consumo.
- No se especifica la longitud de contexto soportada; los usuarios deben probar con sus propios datos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hellohazime/Qwen3.8-2.4T-A95B-REAP-256GB-GGUF
- Modelo base (GGUF cuantizado): https://huggingface.co/unsloth/Qwen3.8-2.4T-A95B-GGUF
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-2.4T-A95B
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen3.8-2.4T-A95B/blob/main/LICENSE
- Repo de tooling de poda: https://github.com/01554/kimi-k3-gguf-prune
- Builds K3 del mismo autor: https://huggingface.co/hellohazime/Kimi-K3-REAP-512GB-GGUF

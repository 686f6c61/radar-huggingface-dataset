# NukeTorch/GR00T-N1.7-LIBERO-10

## Resumen

GR00T-N1.7-LIBERO-10 es un bundle de inferencia para el modelo de política robótica GR00T N1.7 de NVIDIA, fine-tuneado sobre el conjunto de tareas LIBERO-10. Lo publica el usuario NukeTorch (no NVIDIA) con el objetivo de empaquetar en una sola descarga los pesos de la política, los procesadores de política y los ficheros de tokenizer que necesita su runtime NukeTorch N1.0.0 para macOS sobre Apple Silicon. Los pesos no se modifican respecto al modelo base `nvidia/gr00t17-lerobot-libero_10-640`.

El modelo es una política visomotora (vision-language-action, VLA) de aproximadamente 3.144 millones de parámetros en formato safetensors, construida sobre la arquitectura GR00T N1.7 de NVIDIA, que a su vez se apoya en el modelo Cosmos. Recibe observaciones de cámara (dos vistas a 256×256 en el benchmark publicado) y emite acciones motoras en forma de chunks, es decir, secuencias cortas de comandos de control ejecutables por un robot.

Su relevancia es doble: por un lado, demuestra la viabilidad de ejecutar políticas VLA de 3B en hardware de consumo (un solo Mac con chip M5 Max y 48 GB de memoria unificada); por otro, el bundle incluye los artefactos auxiliares (tokenizer de Qwen3-VL-2B, config del modelo base GR00T-N1.7-3B) que el servidor NukeTorch necesita para arrancar la política junto a un modelo de texto. No se sirve de forma autónoma en esta versión: requiere un modelo de texto compañero.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política visomotora GR00T N1.7 (NVIDIA), basada en Cosmos; no se detalla la topología interna en la información disponible |
| Parámetros totales | 3.144.016.000 (3,14 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (los pesos se distribuyen en safetensors sin cuantizar según el tamaño del repo) |
| Idiomas soportados | no disponible (modelo de robótica; el tokenizer procede de Qwen3-VL-2B-Instruct) |
| Licencia | NVIDIA Open Model License (etiquetada como `license: other` en el repo) |
| Formato de pesos | safetensors (`model.safetensors`), más `policy_*_step_*.safetensors` y ficheros JSON de configuración |
| Modelo base | nvidia/gr00t17-lerobot-libero_10-640 (revisión `5ee08ab09fac5c5ef2388a14c882ea825ac861db`) |
| Tamaño del repo | 12,6 GB |
| Pipeline | robotics |
| Runtime soportado | NukeTorch N1.0.0 (macOS arm64) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de identificarlo como la política GR00T N1.7 de NVIDIA, construida sobre Cosmos, y de indicar que el checkpoint ha sido fine-tuneado sobre LIBERO-10 (el conjunto de tareas de manipulación de largo horizonte de la suite LIBERO). El bundle incluye `train_config.json` del modelo base, pero su contenido no se reproduce en la información proporcionada.

El paquete no entrena nada: reúne los pesos originales de NVIDIA (sin modificar bytes), el `config.json` del modelo base `nvidia/GR00T-N1.7-3B` renombrado a `model_config.json`, y el tokenizer de `Qwen/Qwen3-VL-2B-Instruct`. La innovación técnica relevante no está en el modelo sino en el runtime: NukeTorch N1.0.0 sirve la política junto a un modelo de texto (en el ejemplo, un Qwen3.8-27B-4bit con decodificación especulativa DFlash2) en un único proceso sobre Apple Silicon, exponiendo la ruta `POST /v1/nuketorch/policy/act`. No se documentan detalles de RLHF, DPO ni composición del dataset de entrenamiento.

## Capacidades

- Generación de acciones motoras a partir de observaciones visuales: el modelo recibe frames de cámara (dos vistas a 256×256 en el benchmark) y emite chunks de acciones de control.
- Ejecución de tareas de manipulación del benchmark LIBERO-10 (tareas de largo horizonte con objetos y escenas diversas).
- Integración con un modelo de texto compañero en el mismo servidor, lo que permite combinar razonamiento lingüístico y control motor en una sola pila.
- API HTTP dedicada (`POST /v1/nuketorch/policy/act`) para invocar la política desde un cliente externo.
- Soporte de concurrencia: el benchmark reporta 48 clientes simultáneos sin degradación apreciable respecto a la ejecución individual.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general, audio ni modos de razonamiento explícito; es una política robótica, no un LLM de propósito general.

## Casos de uso

- Investigación en manipulación robótica con LIBERO: reproducir los resultados del benchmark LIBERO-10 sobre hardware Apple Silicon sin necesidad de GPUs de datacenter, usando los frames grabados del episodio 0 incluidos en el script de fetching.
- Evaluación de políticas VLA en local: comparar el comportamiento del fine-tune LIBERO-10 frente a otros checkpoints de GR00T N1.7 en un entorno controlado y reproducible.
- Prototipado de pipelines de control visomotor: el endpoint `/v1/nuketorch/policy/act` permite integrar la política en un bucle de control propio (cliente Python, ROS u otro) que envíe observaciones y reciba chunks de acciones.
- Servicio combinado texto + política: útil para escenarios donde un LLM planifica en lenguaje natural y la política ejecuta los movimientos, todo en un mismo proceso y sin salir de la máquina.
- Benchmarking de latencia en hardware de consumo: el bundle incluye scripts (`bench/nuketorch_bench.py`) para medir chunks por segundo y latencias bajo carga, útil para dimensionar despliegues en flotas de Macs.
- Docencia y demostraciones: al caber en un solo equipo con 48 GB de memoria unificada, permite montar talleres prácticos de robótica con VLA sin infraestructura dedicada.
- Validación de licencias y cumplimiento: el bundle incluye los textos de licencia NVIDIA Open Model License y Apache-2.0 junto con el NOTICE, lo que facilita auditorías de terceros.

## Benchmarks y rendimiento

Los datos publicados por el autor miden latencia y throughput del runtime, no calidad de la política. Se ejecutan sobre un M5 Max con 48 GB, NukeTorch N1.0.0, el modelo de 27B cargado junto a la política, observaciones grabadas del episodio 0 de LIBERO-10 (dos cámaras a 256×256) y 48 clientes concurrentes.

| Métrica | Informe de cuatro Macs, por Mac | NukeTorch N1.0.0, un Mac |
|---|---:|---:|
| Chunks por segundo (ventana de 10 s) | 38,4 | 38,4 |
| Tiempo de respuesta bajo carga, mediana / p95 | 1.275 / 1.317 ms | 1.264 / 1.310 ms |
| Una petición a la vez | 44,3 ms | 45,0 ms |

No se han publicado resultados de benchmarks de calidad (tasa de éxito en LIBERO-10, MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible. El autor advierte que no se mueve ningún robot ni se ejecuta simulador: son frames grabados reproducidos, y las cifras miden la velocidad de respuesta de la política, no su corrección.

## Requisitos de hardware

- Memoria: el benchmark se ejecuta en un Mac con 48 GB de memoria unificada, con un modelo de texto de 27B en 4 bits cargado en paralelo. El repo pesa 12,6 GB, pero el consumo real depende del runtime y del modelo compañero.
- GPU/SoC recomendados: Apple Silicon de gama alta (M5 Max con 48 GB en el caso medido). No se documentan requisitos para CUDA, A100, H100 ni RTX 4090.
- GPU de consumo: el runtime NukeTorch N1.0.0 es específico para macOS arm64; no se indica soporte para GPUs discretas de consumo.
- Despliegue: NukeTorch N1.0.0 (instalador desde GitHub Releases), con `nuketorch-serve http` y las rutas `--model`, `--draft-model` y `--policy-model`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 44,3–45,0 ms por petición individual y 38,4 chunks/s con 48 clientes concurrentes en el hardware medido. El autor recomienda dejar reposar el equipo antes de medir porque un Mac caliente rinde peor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NukeTorch/GR00T-N1.7-LIBERO-10 | 3,14 B | no disponible | Política VLA (LIBERO-10) | NVIDIA Open Model License | Hugging Face, runtime NukeTorch |
| nvidia/gr00t17-lerobot-libero_10-640 | no disponible en la información | no disponible | Política VLA (LIBERO-10) | etiquetada apache-2.0 por NVIDIA | Hugging Face |
| nvidia/GR00T-N1.7-3B | ~3 B (por el nombre) | no disponible | Política VLA base | NVIDIA Open Model License | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada. El bundle de NukeTorch no modifica los pesos del checkpoint de NVIDIA, por lo que su comportamiento de política debería coincidir con el del modelo base; la diferencia está en el empaquetado y en el runtime soportado.

## Limitaciones y advertencias

- No es un modelo de propósito general: no genera texto libre, no responde preguntas y no tiene capacidades de tool calling ni agentes. Su salida son acciones motoras.
- En esta versión no se sirve de forma autónoma: requiere un modelo de texto compañero en el mismo proceso NukeTorch.
- El runtime está atado a macOS arm64 y a NukeTorch N1.0.0; no hay soporte documentado para CUDA, Linux ni GPUs discretas.
- Los benchmarks publicados miden latencia, no calidad de la política. No hay tasa de éxito en LIBERO-10 ni métricas de corrección.
- El autor advierte explícitamente que el uso seguro con un robot real es responsabilidad del usuario; no se han validado los pesos en hardware físico en la documentación disponible.
- Licencia NVIDIA Open Model License: conviene revisar sus términos antes de uso comercial. El propio runtime NukeTorch N es gratuito solo para individuos, escuelas, sin ánimo de lucro, proyectos open source no comerciales y empresas por debajo de 10 M USD de ingresos y 250 personas.
- El repo tiene 0 descargas y 0 likes en el momento de la ficha, y fue creado y actualizado el mismo día: no hay validación comunitaria.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; al ser una política visomotora, el riesgo se traduce en acciones incorrectas o inseguras más que en texto inventado.
- Idiomas soportados no disponibles; el tokenizer de Qwen3-VL-2B-Instruct no implica capacidades lingüísticas del modelo de política.

## Enlaces

- Hugging Face: https://huggingface.co/NukeTorch/GR00T-N1.7-LIBERO-10
- Modelo base: https://huggingface.co/nvidia/gr00t17-lerobot-libero_10-640
- Config del modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Tokenizer: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Runtime NukeTorch: https://github.com/NukeTorch/nuketorch
- Informe de cuatro Macs: https://nuketorch.ai/reports/groot-four-m5-max.pdf
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/

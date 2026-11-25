# eteron/ZeroHero-Crafter-Visual-12.6M-PPO-RA-1B-steps

## Resumen

ZeroHero-Crafter-Visual-12.6M-PPO-RA-1B-steps es una política de reinforcement learning desarrollada por el usuario eteron dentro del proyecto ZeroHero. No es un modelo de lenguaje conversacional, sino un agente entrenado para jugar a Crafter, un entorno de mundo abierto tipo benchmark que exige exploración, recolección de recursos, crafteo y supervivencia. La política consume observaciones visuales (pantallas RGB), objetivos alcanzados y memoria generada, y produce acciones del juego.

El modelo parte de una arquitectura pequeña inicializada aleatoriamente, seguida de un preentrenamiento supervisado y un postentrenamiento con PPO-RA (Proximal Policy Optimization con alguna variante de regularización o anclaje, no detallada en la información disponible). Cuenta con 12.593.280 parámetros y un presupuesto de postentrenamiento de 1.000.128.512 decisiones de entorno. Se publica únicamente como pesos de inferencia en FP32 safetensors, sin código de entrenamiento, datos, pesos del crítico ni estados del optimizador.

Su relevancia es acotada y experimental: sirve como referencia reproducible de una política visual para Crafter y como ejemplo de integración con Transformers mediante la arquitectura qwen3_vl, pero no está pensado para uso general ni para tareas fuera del entorno para el que fue entrenado. El repositorio es de 0,1 GB y se distribuye bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_vl (vision-language) configurada como política de agente; implementada con Hugging Face Transformers |
| Parametros totales | 12.593.280 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; los pesos se publican en FP32 safetensors |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP32, solo política) |

## Arquitectura y entrenamiento

La política se implementa sobre la arquitectura qwen3_vl de Transformers, adaptada para procesar observaciones visuales de Crafter (pantallas RGB), objetivos alcanzados y memoria generada, y emitir acciones del entorno. El modelo inicial era pequeño e inicializado aleatoriamente, tras lo cual recibió un preentrenamiento supervisado y un postentrenamiento con PPO-RA durante 1.000.128.512 decisiones de entorno. El checkpoint de 1B pasos proviene de una ejecución visual multietapa independiente, no de una continuación del run de 100M.

No se detalla la composición del dataset, la existencia de RLHF/DPO ni innovaciones técnicas específicas más allá del uso de PPO-RA. El autor indica que el código de entrenamiento, los datos, los pesos del crítico, los estados del optimizador y un arnés de evaluación no están incluidos. Las sumas de verificación de los pesos fuente se conservan y los tensores de política se comprobaron para igualdad exacta durante la exportación; `SHA256SUMS` cubre los ficheros de la release. El adaptador de juego incluido usa el entorno Crafter estándar en CPU, mientras que los runs del paper usaron entornos CUDA nativos, sin que se reclame reproducción de trayectorias idénticas por semilla ni de benchmarks.

## Capacidades

- Toma de decisiones en el entorno Crafter a partir de observaciones visuales RGB.
- Procesamiento de objetivos alcanzados y memoria generada como parte de la interfaz de la política.
- Emisión de acciones del juego mediante un wrapper de agente proporcionado; el formateo de observaciones y el parseo de respuestas forman parte de la interfaz de la política.
- Ejecución de un episodio de juego completo mediante los ejemplos incluidos.
- Inferencia de una sola respuesta sin necesidad de instalar el entorno, usando los fixtures de ejemplo.
- No es un modelo de chat de propósito general: no se documentan capacidades de generación de texto libre, código, matemáticas, tool calling, agentes multi-paso fuera del entorno ni multilingüismo más allá del inglés.

## Casos de uso

- Investigación en reinforcement learning visual: la política sirve como punto de partida o referencia para comparar algoritmos PPO-RA en Crafter, cargando los pesos con Transformers y ejecutando episodios con el adaptador incluido.
- Reproducción de inferencia de una política entrenada: el ejemplo `examples/infer.py` permite validar el contrato de entrada y el parseo de salida sin instalar el entorno, útil para integrar la política en pipelines de evaluación propios.
- Evaluación de agentes en entornos de mundo abierto: Crafter exige exploración, recolección y crafteo, por lo que la política puede emplearse para medir habilidades de planificación a largo plazo en un benchmark controlado.
- Docencia y demostraciones: el tamaño reducido (12,6M parámetros, repo de 0,1 GB) y el formato FP32 safetensors facilitan su uso en aulas o talleres sobre RL y modelos visión-lenguaje aplicados a agentes.
- Integración en frameworks de agentes basados en Transformers: al usar la arquitectura qwen3_vl, puede cargarse con las herramientas estándar de Hugging Face y combinarse con wrappers propios para experimentos de memoria y objetivos.
- Estudio de interfaces observación-acción: el contrato de entrada documentado en `examples/README.md` y `agent_config.json` permite analizar cómo se formatean observaciones visuales y memoria generada en una política de RL real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que los resultados numéricos de las curvas de entrenamiento no se presentan como una nueva evaluación held-out de esta release, y que no se reclama reproducción de benchmarks ni de trayectorias idénticas por semilla.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 12,6M parámetros en FP32 el peso de la política ocupa aproximadamente 50 MB, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se especifican; cualquier GPU con soporte CUDA es suficiente. El adaptador de juego incluido usa el entorno Crafter estándar en CPU.
- Cabe en GPU consumer: sí, en cualquier modelo actual (RTX 4090, RTX 3060, etc.) e incluso en hardware integrado.
- Opciones de despliegue: Transformers (librería declarada) y los ejemplos del repositorio (`examples/infer.py`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y al no ser un modelo de chat estas herramientas no son aplicables directamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZeroHero-Crafter-Visual-12.6M-PPO-RA-1B-steps | 12.593.280 | no disponible | Política RL para Crafter (visual) | Apache-2.0 | Pesos de inferencia en Hugging Face; sin código de entrenamiento |
| Otras políticas para Crafter del proyecto ZeroHero | no disponible | no disponible | Política RL para Crafter | no disponible | no disponible |
| Modelos de agente visual de propósito general | no disponible | no disponible | Visión-lenguaje y agentes | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo de chat de propósito general: el autor advierte explícitamente que debe usarse con el wrapper de agente proporcionado y que el formateo de observaciones y el parseo de respuestas son parte de la interfaz de la política.
- Solo se distribuyen pesos de inferencia de la política; no se incluyen código de entrenamiento, datos, pesos del crítico, estados del optimizador ni arnés de evaluación, lo que limita la reproducibilidad completa.
- El adaptador de juego incluido usa el entorno Crafter estándar en CPU, mientras que los runs de entrenamiento usaron entornos CUDA nativos; no se reclama reproducción de trayectorias idénticas por semilla ni de benchmarks.
- Los resultados numéricos de las curvas de entrenamiento no constituyen una evaluación held-out de esta release; el muestreo y las diferencias numéricas del runtime pueden alterar respuestas individuales.
- El checkpoint de 1B pasos proviene de una ejecución visual multietapa independiente, no de una continuación del run de 100M, por lo que no debe interpretarse como una versión escalada del mismo entrenamiento.
- Idioma limitado al inglés en la metadata; no se documentan capacidades multilingües.
- Riesgo de alucinación y sesgos: no evaluados ni documentados en la información disponible; al tratarse de una política de RL, los fallos se manifiestan como acciones subóptimas en el entorno, no como texto inventado.
- Licencia Apache-2.0 permite uso comercial, pero las dependencias del entorno y las observaciones de benchmarks públicos quedan sujetas a sus licencias originales, según `THIRD_PARTY_NOTICES.md`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eteron/ZeroHero-Crafter-Visual-12.6M-PPO-RA-1B-steps
- Ejemplos de inferencia y contrato de entrada: `examples/README.md` dentro del repositorio
- Metadatos de checkpoint y presupuesto: `agent_config.json` y `release_metadata.json` en el repositorio
- Sumas de verificación: `SHA256SUMS` en el repositorio
- Avisos de terceros: `THIRD_PARTY_NOTICES.md` en el repositorio
- Paper, blog, repositorio de código o demo del proyecto ZeroHero: no disponibles en la información proporcionada

# oakmindai/Kimi-K3-NVFP4-FTW

## Resumen

Kimi K3 es un modelo de lenguaje masivo de 2,8 billones de parametros desarrollado por Moonshot AI, presentado como el primer modelo abierto de clase 3T. Este repositorio concreto, `oakmindai/Kimi-K3-NVFP4-FTW`, no introduce un modelo nuevo, sino que reempaqueta el checkpoint cuantizado `nvidia/Kimi-K3-NVFP4` en el formato FTW (Fast Tensor Weights) del runtime SparkLab, diseñado para ejecutar inferencia de texto en un unico NVIDIA DGX Spark con el superchip Grace Blackwell GB10.

La relevancia de este artefacto radica en que Kimi K3, con sus 2,8T de parametros y arquitectura MoE con 896 expertos enrutados, no cabe en los 128 GB de memoria coherente del GB10. El formato FTW permite direccionar filas de expertos individualmente desde NVMe, haciendo viable la ejecucion en un solo dispositivo. El checkpoint mantiene la cuantizacion NVFP4 de NVIDIA Model Optimizer para los expertos enrutados, FP8 de bloque para las proyecciones de atencion/KDA, y precision original para el resto de tensores. La licencia es la NVIDIA Open Model License.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida con KDA (Kimi Delta Attention) y MLA, con Attention Residuals (AttnRes) |
| Parametros totales | 2,8 billones (2.8T) |
| Parametros activos | 16 de 896 expertos enrutados activados por token (no se especifica el total de activos) |
| Longitud de contexto | 1.000.000 tokens (segun informacion del modelo base) |
| Tipos de cuantizacion | NVFP4 (expertos enrutados), FP8 de bloque (proyecciones atencion/KDA), FP8 por fila (matrices densas opcional) |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License (nvidia-open-model-license) |
| Formato de pesos | FTW (formato propietario de SparkLab, basado en shards de 194 ficheros) |

## Arquitectura y entrenamiento

Kimi K3 es un modelo MoE (Mixture of Experts) masivo de 2,8T parametros totales, construido sobre dos innovaciones arquitectonicas principales: Kimi Delta Attention (KDA) y Attention Residuals (AttnRes). KDA es un mecanismo de atencion que reduce el coste computacional del calculo de atencion, mientras que AttnRes anade conexiones residuales a nivel de atencion para mejorar el flujo de gradientes y la capacidad de representacion. El modelo combina KDA con MLA (Multi-head Latent Attention), una arquitectura de atencion eficiente en memoria. Es un modelo multimodal nativo con capacidades de vision, aunque este artefacto FTW concreto es solo de texto.

El checkpoint base es `moonshotai/Kimi-K3`, cuantizado por NVIDIA con Model Optimizer a NVFP4 para los expertos enrutados y FP8 de bloque para las proyecciones de atencion. El proceso de cuantizacion y el entrenamiento detallado (numero de tokens, dataset, RLHF/DPO) no estan documentados en la informacion disponible. El reempaquetado FTW no altera los pesos, solo reorganiza el layout para permitir lectura de filas de expertos individuales desde NVMe.

## Capacidades

- Generacion de texto con razonamiento avanzado, incluyendo modo thinking para problemas complejos.
- Razonamiento multi-step y capacidades agenticas para tareas de codificacion de largo horizonte.
- Soporte de tool calling / function calling (segun las capacidades del modelo base).
- Capacidades multimodales nativas de vision en el modelo base, aunque no validadas en este artefacto FTW.
- Ventana de contexto de 1 millon de tokens, adecuada para tareas de conocimiento y codificacion de largo alcance.
- Capacidades multilingues no documentadas en la informacion disponible.

## Casos de uso

- Inferencia de texto en un unico NVIDIA DGX Spark: el caso de uso principal de este artefacto es ejecutar Kimi K3 cuantizado en un solo GB10, algo inviable sin el formato FTW y la ejecucion respaldada por NVMe.
- Evaluacion de capacidades de razonamiento en hardware de borde: permite probar un modelo de 2,8T en un dispositivo de 128 GB, aunque con latencias extremadamente altas (TTFT de ~6,5 minutos).
- Investigacion sobre ejecucion MoE con descarga a disco: el patron de cache de expertos con politica layer_lru y miss rate del 80% ofrece un caso de estudio real para tecnicas de gestion de memoria en MoE.
- Desarrollo de pipelines de serving con SparkLab: el repositorio documenta un flujo completo de instalacion, planificacion, descarga y servicio con `sparklab serve`.
- Pruebas de cuantizacion NVFP4 en modelos de escala 3T: permite validar el comportamiento de la cuantizacion de NVIDIA Model Optimizer en un modelo real de 2,8T.
- Benchmarking de rendimiento en GB10: los resultados publicados (0,16 tok/s de decode, 395 s de TTFT) sirven como referencia para futuras optimizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de rendimiento publicados son las mediciones de validacion en GB10 del propio repositorio:

| Medicion | Resultado |
|---|---|
| Throughput de decode | 0,1613 tok/s |
| TTFT (calido) | 395,405 s |
| Completado | 256 / 256 tokens |
| Memoria minima disponible | 17,68 GiB |
| Asignacion de dispositivo | 74,86 GiB |
| OOM kills en runtime | 0 |
| Swap-out en runtime | 0 |

Estos resultados corresponden a una configuracion de capacidad limitada (batch de 1, un solo GB10) y no representan una reclamacion de calidad o interactividad. La respuesta de 256 tokens se detuvo durante el razonamiento antes de emitir la respuesta esperada de AIME, y el texto greedy divergio de una escalera mas corta tras un prefijo compartido.

## Requisitos de hardware

- Hardware objetivo: un unico NVIDIA DGX Spark con superchip Grace Blackwell GB10 y 128 GB de memoria coherente.
- Almacenamiento: el artefacto FTW ocupa 1.610.936.311.808 bytes (~1,465 TiB) en 194 shards; se recomienda NVMe rapido local.
- VRAM: no aplica directamente; el modelo no cabe en la memoria del dispositivo y requiere descarga de expertos desde NVMe.
- Asignacion de memoria del dispositivo: 74,86 GiB en la configuracion validada, con 17,68 GiB de memoria minima disponible.
- Opciones de despliegue: exclusivamente con SparkLab (`sparklab serve`); no es compatible con vLLM, llama.cpp, Ollama o TGI.
- Latencia: TTFT de ~395 segundos y decode de ~0,16 tok/s en la configuracion validada; el rendimiento esta limitado por NVMe (miss rate de cache de expertos del 80,23%).

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa rigurosa con modelos similares en la misma categoria. El modelo base Kimi K3 se posiciona como competidor de modelos frontier como DeepSeek-V3 o Qwen3-Max, pero no hay datos de benchmarks comparativos en la informacion proporcionada. Este artefacto concreto es una conversion de formato para un hardware especifico, no un modelo independiente, por lo que la comparativa relevante seria entre formatos de ejecucion (FTW vs. checkpoint estandar) mas que entre modelos.

## Limitaciones y advertencias

- El artefacto es solo texto; las capacidades de vision del modelo base no estan incluidas ni validadas en este repositorio.
- La configuracion validada es batch de 1 en un unico GB10; no se ha establecido comportamiento con concurrencia, contexto largo, capacidades de agente o resistencia (endurance).
- La latencia es extremadamente alta: TTFT de aproximadamente 6,5 minutos porque el prefill de 129 tokens escanea los 896 expertos en las 92 capas MoE.
- El decode esta limitado por NVMe con un miss rate de cache de expertos del 80,23% en la sonda de 256 tokens.
- No se ha establecido determinismo greedy entre ejecuciones, correccion de respuestas ni comportamiento en contexto largo.
- El checkpoint se marca como "Experimental" y no constituye una certificacion de SparkLab.
- La licencia NVIDIA Open Model License puede imponer restricciones de uso comercial; se recomienda revisar los terminos en el enlace proporcionado.
- El rendimiento medido no es una reclamacion de interactividad; el modelo no es util para aplicaciones en tiempo real en esta configuracion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/oakmindai/Kimi-K3-NVFP4-FTW
- Checkpoint base cuantizado: https://huggingface.co/nvidia/Kimi-K3-NVFP4
- Modelo base original: https://huggingface.co/moonshotai/Kimi-K3
- Repositorio SparkLab: https://github.com/sixteen-miles-labs/sparklab
- Informe del experimento GB10: https://github.com/sixteen-miles-labs/sparklab/blob/main/exps/exp_kimik3_gb10.md
- Resultados JSON del benchmark: https://github.com/sixteen-miles-labs/sparklab/blob/main/benchmarks/gb10/results/GB10-KIMI-001.json
- Repositorio del modelo base: https://github.com/MoonshotAI/Kimi-K3
- Pagina de NVIDIA NIM para Kimi K3: https://build.nvidia.com/moonshotai/kimi-k3
- Licencia NVIDIA Open Model: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer

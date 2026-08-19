# crucible-labs/Ornith-1.0-35B-MTP

## Resumen

Ornith-1.0-35B-MTP es un checkpoint derivado de Ornith-1.0-35B, un modelo de codificacion agente de DeepReinforce AI (post-entrenado sobre Qwen3.6-35B-A3B con aprendizaje por refuerzo para optimizar generacion de scaffolds y soluciones). Crucible Labs ha injertado en este modelo la cabeza de prediccion multi-token (MTP) del modelo base Qwen, que Ornith no incluia, permitiendo ejecutar decodificacion especulativa MTP en vLLM. El resultado es una aceleracion medida del +38.7% en prosa y +54.6% en codigo, con una tasa de aceptacion de borradores del 70.3% a n=2.

La relevancia de este checkpoint es doble: por un lado, resuelve la ausencia de tensores `mtp.*` en Ornith-1.0-35B, que impedia usar la especulacion MTP en vLLM; por otro, lo hace sin retraining ni modificacion de los pesos originales, verificando que los shards de Ornith son bit-identicos a los del repositorio original y que la cabeza injertada es una copia byte a byte de la de Qwen. El modelo mantiene la ventana de contexto de 262.144 tokens y la interfaz OpenAI-compatible del original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con cabeza MTP (qwen3_5_moe) |
| Parametros totales | 35B (aproximado, segun modelo base) |
| Parametros activos | 3B (A3B) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | no disponible (pesos en BF16; se pueden cuantizar a posteriori) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (BF16) |

Nota: el repositorio reporta 664.944 parametros en safetensors, dato que parece incompleto o erroneo; el modelo base declara 35B totales con 3B activos.

## Arquitectura y entrenamiento

Ornith-1.0-35B-MTP no es un modelo entrenado desde cero ni un fine-tuning. Es un merge quirurgico: se toman los pesos de Ornith-1.0-35B (un post-train de Qwen3.6-35B-A3B con RL para codificacion agente) y se anaden los 19 tensores `mtp.*` del modelo base Qwen, que implementan la prediccion multi-token (predice el token t+2 a partir del estado oculto del modelo principal). No hubo retraining, cuantizacion ni conversion de formatos.

La viabilidad del injerto se justifica por la baja deriva entre Ornith y su base: mediana de deriva de pesos del 2.46%, similitud coseno >= 0.998 en todos los tensores muestreados y norma final bit-identica. Esto garantiza que la cabeza MTP de Qwen sigue siendo compatible con el espacio oculto de Ornith. La configuracion de Ornith ya declaraba `mtp_num_hidden_layers: 1` pero no incluia los tensores, lo que rompia algunas herramientas de cuantizacion; este checkpoint corrige esa inconsistencia.

## Capacidades

- Generacion de texto y codigo con decodificacion especulativa MTP (multi-token prediction) en vLLM, acelerando la inferencia sin cambiar la salida.
- Soporte de tool calling y function calling via parser `qwen3_xml`, validado con 400 problemas y cero llamadas malformadas.
- Razonamiento agente multi-paso, con parser de razonamiento `qwen3` integrable en vLLM.
- Ventana de contexto larga de 262.144 tokens, util para repositorios completos o conversaciones extensas.
- Capacidad de auto-mejora en tareas de codificacion, segun el entrenamiento RL del modelo base.
- Interfaz OpenAI-compatible para despliegue local o en produccion.

## Casos de uso

- Asistente de codificacion agente local: el modelo puede analizar un repositorio completo dentro de su contexto de 262K tokens, generar scaffolds y proponer soluciones, con tool calling para ejecutar comandos o editar archivos.
- Generacion de codigo en pipelines CI/CD: gracias a la decodificacion especulativa, se reduce la latencia de generacion en entornos de integracion continua donde se generan tests o documentacion automaticamente.
- Refactorizacion de codigo legacy: con el contexto largo, puede procesar archivos grandes y proponer cambios coherentes manteniendo el estilo del proyecto.
- Soporte tecnico automatizado: el modelo gestiona conversaciones multi-turno con historial extenso y puede llamar a APIs externas para resolver incidencias.
- Investigacion en decodificacion especulativa: sirve como banco de pruebas para estudiar el impacto de cabezas MTP injertadas en modelos post-entrenados, con metricas de aceptacion y deriva de pesos.
- Desarrollo de agentes autonomos: su capacidad de razonamiento multi-paso y tool calling permite construir agentes que planifican, ejecutan y verifican tareas complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Sin embargo, la model card incluye mediciones de rendimiento de inferencia con decodificacion especulativa en un Strix Halo (gfx1151 / Radeon 8060S, 124 GB unificada, ROCm 7.14, vLLM 0.27.1, TP=1):

| Metrica | Control (sin spec) | n=2 | n=4 |
|---|---|---|---|
| Prosa tok/s | 27.83 | 38.60 (+38.7%) | 31.59 (+13.5%) |
| Codigo tok/s | 27.50 | 42.51 (+54.6%) | 43.84 (+59.4%) |
| Aceptacion de borradores | — | 70.3% | 44.3% |
| Tokens por forward | 1.000 | 2.393 | 2.753 |
| ms por forward | 35.98 | 62.35 | 87.50 |
| Capacidad KV cache | baseline | -21.8% | -23.8% |

La recomendacion del autor es usar `num_speculative_tokens=2` para uso general; n=4 solo mejora en generacion de codigo puro.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 71.9 GB en BF16, por lo que se necesitan al menos 80 GB de VRAM para cargarlo completo sin cuantizacion. Con cuantizacion (no incluida en este repo) podria caber en GPUs de 48 GB o menos.
- GPU recomendadas: Strix Halo (probado), o GPUs datacenter como A100 80GB, H100, o consumer de 24 GB con cuantizacion agresiva (no probado).
- No cabe en GPUs consumer de 16 GB o menos sin cuantizacion y posiblemente con offloading.
- Opciones de despliegue: vLLM (libreria principal, con flags `--speculative-config.method=mtp`), llama.cpp (a traves del checkpoint GGUF de skinnyctax, no este), y cualquier servidor compatible con OpenAI API.
- Latencia: en el hardware probado, 62.35 ms por forward a n=2, con 38-42 tok/s de salida. El rendimiento depende de la memoria disponible y del ancho de banda.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ornith-1.0-35B-MTP (este) | 35B MoE (3B activos) | 262K | MIT | safetensors BF16 | MTP para vLLM, pesos bit-identicos a Ornith |
| Ornith-1.0-35B (original) | 35B MoE (3B activos) | 262K | MIT | safetensors BF16 | Sin tensores MTP, no soporta especulacion MTP en vLLM |
| skinnyctax/Ornith-1.0-35B-Q6_K-Frankenstein-MTP-GGUF | 35B MoE (3B activos) | 262K | MIT | GGUF Q6_K/Q4_K_M | MTP para llama.cpp, aceptacion 74-79% a n=4 |

La principal diferencia con el original es la presencia de la cabeza MTP. Frente al GGUF, este checkpoint es para vLLM y mantiene los pesos sin cuantizar.

## Limitaciones y advertencias

- No hay retraining: la cabeza MTP es una copia de Qwen y puede degradarse si el modelo base se aleja mucho de su espacio latente; la deriva medida es baja, pero no se garantiza en otros dominios.
- La decodificacion especulativa solo es beneficiosa si la tasa de aceptacion es alta; en cargas de trabajo con patrones impredecibles puede resultar mas lenta que sin especulacion.
- El modelo no incluye cuantizaciones; para desplegarlo en hardware limitado es necesario cuantizar manualmente, lo que puede alterar el rendimiento de la cabeza MTP.
- No se han publicado evaluaciones de calidad (razonamiento, seguridad, sesgos) para este checkpoint especifico; se heredan las propiedades del modelo base Ornith.
- La licencia MIT permite uso comercial, pero los pesos de Qwen base tienen su propia licencia (Apache 2.0) que debe respetarse.
- El modelo esta optimizado para codificacion y agentes; su rendimiento en otras tareas no esta documentado.
- El numero de parametros reportado en safetensors (664.944) es inconsistente con el tamano del modelo base; se recomienda verificar antes de usar en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/crucible-labs/Ornith-1.0-35B-MTP
- Modelo base Ornith: https://huggingface.co/ornith-ai/Ornith-1.0-35B
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Discusion sobre MTP en Ornith: https://huggingface.co/deepreinforce-ai/Ornith-1.0-35B/discussions/2
- Variante GGUF con MTP: https://huggingface.co/skinnyctax/Ornith-1.0-35B-Q6_K-Frankenstein-MTP-GGUF
- Guia de Ornith AI: https://ornith.online/
- Pagina del modelo 35B: https://ornith.online/ornith-1-0-model-35b
- Repositorio GitHub de Ornith-1: https://github.com/ornith-ai/Ornith-1

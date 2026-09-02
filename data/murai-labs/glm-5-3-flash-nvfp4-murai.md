# murai-labs/GLM-5.3-Flash-NVFP4-Murai

## Resumen

GLM-5.3-Flash-NVFP4-Murai es una cuantizacion weight-only NVFP4 (W4A16) del modelo GLM-5.3-Flash de Zhipu AI (zai-org), producida por el laboratorio independiente Murai Labs. El modelo base es un transformer MoE hibrido de aproximadamente 320.000 millones de parametros totales con 18.000 millones activos, que combina atencion dispersa y lineal para reducir el coste de servir contextos largos. Esta version cuantizada esta disenada especificamente para ejecutarse en dos nodos NVIDIA DGX Spark (GB10, arquitectura sm_121) con tensor parallelism 2, y se distribuye bajo licencia MIT con pesos en formato safetensors.

La relevancia de esta ficha radica en que no es una cuantizacion generica: Murai Labs aplico una receta propia (denominada "Murai-P3") que elimina el deep clipping presente en otras cuantizaciones NVFP4 del mismo modelo, y ademas incluye un parche de servido que corrige un bug de repack en vLLM ModelOpt que corrompe la salida con caracteres U+FFFD. El repositorio contiene los pesos cuantizados (181,3 GiB), el parche, sondas de regresion, un lanzador y documentacion tecnica detallada. Es un trabajo de ingenieria de despliegue de alta precision, pensado para equipos que necesitan servir GLM-5.3-Flash en hardware de consumo profesional (DGX Spark) con calidad de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido (atencion dispersa + atencion lineal) |
| Parametros totales | 165.496.249.182 (pesos cuantizados, safetensors); modelo base ~320B en BF16 |
| Parametros activos | ~18B (segun datos del modelo base) |
| Longitud de contexto | 262.144 tokens (segun datos del modelo base) |
| Tipos de cuantizacion | NVFP4 weight-only (W4A16), grupo 16, pesos E2M1 + escalas de bloque FP8-E4M3 + escala global FP32 |
| Idiomas soportados | no disponible (la model card no los especifica; el modelo base es multilingue) |
| Licencia | MIT |
| Formato de pesos | safetensors (120 archivos, 181,3 GiB) |

## Arquitectura y entrenamiento

El modelo base GLM-5.3-Flash, desarrollado por Zhipu AI, introduce por primera vez en la serie GLM una arquitectura hibrida que combina atencion dispersa (sparse attention) con atencion lineal, lo que reduce drasticamente el coste de servir contextos largos (hasta 262.144 tokens) manteniendo precision en tareas de razonamiento de largo alcance. La capa de atencion usa un mecanismo de atencion lineal aproximada para las consultas de largo alcance y atencion dispersa para las consultas locales, un diseno que evita el coste cuadratico del transformer clasico.

La cuantizacion NVFP4 de Murai Labs se aplica exclusivamente a los tensores de las FFN de los expertos enrutados (37.152 tensores), dejando en BF16 los demas componentes (atencion, expertos compartidos, routers, embeddings, lm_head, normas, cabeza MTP y primeras capas densas). El proceso es data-free (sin conjunto de calibracion) y se realiza con NVIDIA ModelOpt 0.45.0 mediante CPU-only shard streaming. La receta Murai-P3 introduce una busqueda de escalas MSE por bloque con una restriccion del multiplicador a valores >= 1.0, lo que elimina el deep clipping que afectaba a la replicacion de la receta de LibertAI. El resultado es un error cuadratico relativo de 0.655% frente al master BF16, con cero bloques anulados y solo 245 clamps de escala, todos en la capa MTP 45.

## Capacidades

- Generacion de texto y razonamiento de largo alcance gracias a la ventana de contexto de 262.144 tokens.
- Soporte de tool calling y function calling (verificado en la sonda tc-10 del proyecto).
- Ejecucion de codigo (code execution) en entornos controlados, aunque con resultados inconsistentes segun la sonda ce-01.
- Capacidad de renderizado de escenas 3D (diorama) en contextos de 64.000 tokens, demostrada en la sonda dj-01 durante una fase del proyecto.
- Multilingue (el modelo base soporta multiples idiomas, aunque la model card de la cuantizacion no lo detalla).
- Compatible con vLLM para servido OpenAI-compatible, con soporte de tensor parallelism 2.
- Incluye un parche de servido que corrige un bug de repack en vLLM ModelOpt que producia caracteres U+FFFD en la salida.
- No incluye capacidades de vision ni audio (el modelo base es solo texto).

## Casos de uso

- Servido de un modelo de 320B en hardware DGX Spark: esta cuantizacion permite ejecutar GLM-5.3-Flash en dos nodos DGX Spark (cada uno con 128 GB de memoria unificada), algo inviable con los pesos BF16 originales. Es el caso de uso principal y el que justifica la existencia del proyecto.
- Despliegue de asistentes de codigo con contexto largo: la ventana de 262.144 tokens permite procesar repositorios completos o archivos de codigo muy extensos en una sola pasada, con soporte de tool calling para integracion en pipelines de desarrollo.
- Investigacion en cuantizacion de MoE: la documentacion del proyecto (receta, parche, sondas) es un recurso valioso para equipos que trabajan en cuantizacion de modelos de mezcla de expertos, especialmente en el analisis de deep clipping y sus efectos en el comportamiento del modelo.
- Evaluacion de calidad de cuantizacion: las sondas de regresion (lc-01, tc-10, ce-01, dj-01) y el protocolo de evaluacion con grader endurecido pueden reutilizarse para validar otras cuantizaciones del mismo modelo base.
- Servido de modelos en entornos con restricciones de memoria: al ser weight-only, la cuantizacion reduce el uso de VRAM respecto a W8A8 o BF16, permitiendo servir el modelo en configuraciones de 2x DGX Spark sin necesidad de GPUs de data center.
- Analisis de corrupcion en vLLM: el parche incluido (patches/modelopt_gscale_fixed.py) y su documentacion (docs/UPSTREAM_vllm_54150.md) son utiles para entender y evitar bugs de repack en ModelOpt que afectan a otras cuantizaciones NVFP4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card proporciona metricas de error en el espacio de pesos y resultados de sondas de comportamiento propias del proyecto, que se resumen a continuacion.

Error en el espacio de pesos (medido sobre los 37.152 tensores cuantizados, round-trip vs master BF16):

| Checkpoint | Error cuadratico relativo medio | Error rel_l2 medio | Coseno medio |
|---|---|---|---|
| Murai-P1 (replica de la receta de LibertAI) | 0.849% | 0.0921 | 0.99576 |
| Murai-P2 (busqueda de escalas MSE) | 0.634% | 0.0796 | 0.996829 |
| Murai-P3 (mse_ge1, este repositorio) | 0.655% | 0.0809 | 0.996727 |

Sondas de comportamiento (mismas sondas, presupuestos y grader; temperatura 1.0, n=3 salvo indicacion):

| Sonda | LibertAI NVFP4 | Murai-P2 | Murai-P3 | EXL3 TR3-4bpw |
|---|---|---|---|---|
| lc-01-32k (codigo largo) | 6/6 | 0/4 | 2/3 | 2/3 |
| lc-01-100k (codigo largo) | 6/6 | 0/4 | 2/3 | 1/3 |
| tc-10 (tool-call) | pass | 0/2 | 1/3 | 2/3 |
| ce-01 (code-exec) | starved | 2/2 | 1/2 (revisado a 0/2 con grader endurecido) | 0/2 |
| dj-01 (diorama @64k) | 0/5 | unico escenario renderizado | 0/3 | 0/3 |

La correccion del bug de servido se valido con 6 pasadas de una sonda de tool-call en coreano con codigo/JSON, donde el vLLM sin parche produjo 8 eventos U+FFFD y con el parche 0 eventos.

## Requisitos de hardware

- Hardware objetivo: 2 nodos NVIDIA DGX Spark (GB10, arquitectura sm_121), conectados por fabric ConnectX-7. Cada nodo debe tener 128 GB de memoria unificada.
- VRAM estimada: los pesos cuantizados ocupan 181,3 GiB en disco, por lo que se necesitan al menos 2x128 GB de memoria unificada para cargar el modelo con overhead de servido. No cabe en una sola GPU consumer (RTX 4090 con 24 GB, RTX 5090 con 32 GB) ni en una sola DGX Spark.
- GPU recomendadas: 2x NVIDIA DGX Spark (GB10). No hay soporte declarado para otras arquitecturas (el kernel selecciona SM90 sparse-MLA + FA2 para GB10).
- Opciones de despliegue: vLLM con imagen `radixark/vllm-glm53-flash:sm121-v8`, tensor parallelism 2, backend marlin MoE, cache KV en fp8_e4m3. Requiere aplicar el parche `patches/modelopt_gscale_fixed.py` mediante bind-mount.
- Latencia y throughput: no se han publicado mediciones de latencia ni throughput en la informacion disponible. El arranque del servidor tarda aproximadamente 19-20 minutos.
- Otras opciones: el repositorio incluye un lanzador (`launch/launch_glm53_murai_p3_gscalefix.sh`) que configura el servido en dos nodos, pero no se mencionan alternativas como llama.cpp u Ollama.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| zai-org/GLM-5.3-Flash (base) | ~320B total / ~18B activo | 262.144 | BF16 | MIT | safetensors |
| LibertAIDAI/GLM-5.3-Flash-NVFP4 | ~320B total / ~18B activo | 262.144 | NVFP4 W4A16 | MIT | safetensors |
| murai-labs/GLM-5.3-Flash-NVFP4-Murai (este) | 165.496.249.182 (cuantizado) | 262.144 | NVFP4 W4A16 (receta mse_ge1) | MIT | safetensors |

Diferencias clave: la version de Murai Labs corrige el deep clipping presente en la receta de LibertAI (reduciendo el error relativo de 0.849% a 0.655%) y anade un parche para un bug de vLLM que corrompe la salida. La version de LibertAI, sin embargo, muestra mejores resultados en las sondas de comportamiento (6/6 en lc-01 frente a 2/3 de Murai-P3), aunque esos datos provienen de la propia model card de Murai y deben interpretarse con cautela. No se dispone de datos de rendimiento de EXL3 en esta comparativa porque es un formato de cuantizacion diferente (4-bit) y no es directamente comparable.

## Limitaciones y advertencias

- La cuantizacion degrada el comportamiento en tareas de codigo largo y tool calling respecto al modelo base BF16, como muestran las sondas lc-01 y tc-10. No es una perdida uniforme: algunas tareas mejoran (diorama) y otras empeoran.
- El parche de servido es obligatorio: sin el, el checkpoint emite caracteres U+FFFD en la salida. El parche debe aplicarse mediante bind-mount sobre el archivo `modelopt.py` de la imagen vLLM y debe verificarse en el log de arranque.
- La receta mse_ge1 deja 245 clamps de escala en la capa MTP 45, lo que puede afectar a la generacion especulativa si se usa la cabeza MTP.
- El modelo requiere hardware muy especifico (2x DGX Spark con GB10) y no se ha probado en otras arquitecturas. No hay soporte para GPUs consumer.
- No se han publicado benchmarks estandar (MMLU, HumanEval, GSM8K) para esta cuantizacion, por lo que no es posible comparar su rendimiento con el modelo base en metricas convencionales.
- Los resultados de las sondas de comportamiento provienen de la propia model card de Murai Labs y no han sido replicados de forma independiente. La sonda ce-01 fue revisada a la baja tras endurecer el grader, lo que indica que algunos resultados historicos eran artefactos de evaluacion.
- La licencia MIT permite uso comercial, pero el modelo base GLM-5.3-Flash tiene su propia licencia MIT, por lo que no hay restricciones adicionales conocidas.
- El repositorio tiene 0 descargas y 0 likes en HuggingFace, lo que sugiere que es un proyecto reciente y poco validado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/murai-labs/GLM-5.3-Flash-NVFP4-Murai
- Repositorio GitHub acompanante: https://github.com/Murai-Labs/GLM-5.3-Flash-NVFP4-Murai
- Modelo base en HuggingFace: https://huggingface.co/zai-org/GLM-5.3-Flash
- Blog de Zhipu AI sobre GLM-5.3-Flash: https://z.ai/blog/glm-5.3-flash
- Cuantizacion de LibertAI (referencia): https://huggingface.co/LibertAIDAI/GLM-5.3-Flash-NVFP4
- Proyecto similar de MiaAI-Lab: https://github.com/MiaAI-Lab/GLM-5.3-Flash-NVFP4-Dual-DGX-Spark
- Proyecto similar de tonyd2wild: https://github.com/tonyd2wild/GLM-5.3-Flash-NVFP4-DFlash2-2x-DGX-Spark

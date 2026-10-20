# bambocher/Qwen3.5-2B-oQ6-mtp

## Resumen

Qwen3.5-2B-oQ6-mtp es una version cuantizada del modelo Qwen3.5-2B (serie Qwen3.5 de Alibaba Cloud) publicada por el usuario bambocher en HuggingFace. No se trata de un modelo entrenado desde cero, sino de un checkpoint convertido al formato MLX para inferencia en Apple Silicon, con cuantizacion de precision mixta generada con la herramienta oQ (oMLX v0.7.1rc1). El checkpoint completo ocupa 2.274.069.824 parametros y 2,3 GB de repositorio, con una media efectiva de 8,106 bits por peso.

El interes de esta publicacion es practico: permite ejecutar un modelo de la familia Qwen3.5 con torre de vision y cabeza de prediccion multi-token (MTP) en equipos con memoria unificada, manteniendo en BF16 aquellas capas sensibles a la cuantizacion (un 14,967% de los pesos) y comprimiendo a 6 bits el grueso del modelo. El resultado es un checkpoint de 2,146 GiB que cabe holgadamente en cualquier Mac con 8 GB o mas de memoria unificada.

La relevancia es doble: por un lado, demuestra el flujo de cuantizacion mixta de oQ aplicado a un modelo multimodal pequeno; por otro, la inclusion de la cabeza MTP sugiere soporte para decodificacion especulativa, lo que reduce la latencia de generacion en hardware con ancho de banda de memoria limitado, como es el caso de los chips de Apple. No se dispone de informacion sobre contexto maximo, licencia ni idiomas en la documentacion publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la serie Qwen3.5, con torre de vision y cabeza MTP (multi-token prediction); detalles internos no disponibles |
| Parametros totales | 2.274.069.824 (2,274B): 1,882B en el modelo de lenguaje, 0,331B en vision, 0,061B en la cabeza MTP |
| Parametros activos | No aplica (no se indica que sea MoE); no disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Precision mixta oQ: affine 6-bit grupo 64 (75,837% de los pesos, 6,50 bits/peso efectivos), affine 8-bit grupo 64 (9,196%, 8,50 bits/peso), BF16 sin cuantizar (14,967%, 16,00 bits/peso). Media efectiva: 8,106 bits/peso |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`); repositorio de 2,3 GB |

Desglose de almacenamiento por componente:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Modelo de lenguaje | 1,882B | 1,569 GB / 1,461 GiB |
| Vision | 0,331B | 0,663 GB / 0,617 GiB |
| Cabeza MTP | 0,061B | 0,073 GB / 0,068 GiB |
| Total | 2,274B | 2,304 GB / 2,146 GiB |

## Arquitectura y entrenamiento

El checkpoint deriva de Qwen3.5-2B, el modelo de 2B parametros de la serie Qwen3.5 de Alibaba Cloud, descrita publicamente como multilingue y con mejoras en razonamiento y seguimiento de instrucciones respecto a Qwen3. La publicacion de referencia de la serie menciona un entrenamiento multimodal con fusion temprana sobre billones de tokens, paridad con Qwen3 en razonamiento, codigo y agentes, y resultados superiores a Qwen3-VL en comprension visual. No se dispone de datos verificables sobre el numero exacto de tokens de entrenamiento del checkpoint 2B, la composicion del dataset ni las etapas de alineacion (RLHF/DPO) aplicadas; esa informacion no aparece en la model card.

La aportacion tecnica de esta ficha es la cuantizacion, no el entrenamiento. oQ (oMLX v0.7.1rc1) aplica precision mixta por tensor: mantiene en BF16 un 14,967% de los pesos (0,340B, 0,634 GiB), presumiblemente capas de mayor sensibilidad, comprime a 8 bits affine con grupo de 64 un 9,196%, y baja a 6 bits affine con grupo 64 el 75,837% restante. La cabeza MTP se conserva como componente separado de 0,061B y 0,068 GiB, lo que permite usarla para prediccion de multiples tokens por paso y, potencialmente, decodificacion especulativa. El resultado es una relacion de compresion que reduce el checkpoint a 2,146 GiB frente a los aproximadamente 4,5 GB que ocuparia la version BF16 completa.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base Qwen3.5-2B, descrito por Qualcomm como orientado a inferencia on-device con razonamiento y seguimiento de instrucciones mejorados.
- Comprension visual: el checkpoint incluye una torre de vision de 0,331B parametros, por lo que conserva la capacidad multimodal del modelo original (descripcion de imagenes, extraccion de informacion de documentos, respuesta a preguntas sobre capturas).
- Prediccion multi-token: la cabeza MTP de 0,061B permite generar varios tokens por paso de decodificacion, lo que se traduce en menor latencia y mayor throughput en hardware limitado por ancho de banda.
- Codigo y matematicas: la serie Qwen3.5 se presenta publicamente con mejoras en codigo y razonamiento, aunque no hay evaluaciones especificas publicadas para este checkpoint cuantizado.
- Multilingue: la serie base se describe como multilingue; no se detalla la lista de idiomas ni la cobertura real tras la cuantizacion.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita para este checkpoint; el modelo base se presenta con mejoras en escenarios de agentes.
- Modo thinking: no disponible.

## Casos de uso

- Asistente local en macOS: el checkpoint esta en formato MLX y ocupa 2,146 GiB, por lo que puede cargarse en un Mac con 8 GB de memoria unificada y ejecutarse sin conexion para tareas de redaccion, resumen y clasificacion, con la ventaja de que ningun dato sale del equipo.
- Analisis de documentos y capturas: la torre de vision de 0,331B permite procesar imagenes de formularios, facturas o capturas de pantalla y extraer texto estructurado, un flujo habitual en automatizacion de back office donde no se puede enviar informacion a la nube.
- Prototipado rapido de aplicaciones MLX: al estar ya convertido y cuantizado, sirve para validar pipelines escritos con `mlx` o `mlx-lm` en un portatil antes de escalar a un modelo mayor, reduciendo el tiempo de carga y el consumo de memoria durante el desarrollo.
- Generacion de codigo en local para entornos con restricciones: util en equipos de desarrollo con politicas que prohiben el envio de codigo propietario a APIs externas; el modelo puede completar funciones y explicar fragmentos dentro del propio IDE.
- Evaluacion de tecnicas de decodificacion especulativa: la cabeza MTP incluida permite experimentar con prediccion multi-token y medir la ganancia de throughput frente a la decodificacion autoregresiva estandar en Apple Silicon.
- Benchmarking de cuantizacion: comparar este checkpoint de 8,106 bits/peso efectivos con la variante oQ8e del mismo autor para medir la perdida de calidad por la compresion a 6 bits en un 75,8% de los pesos.
- Filtrado y clasificacion de texto en local: con 2,3 GB de repositorio y latencia baja por la cabeza MTP, es viable clasificar grandes volumenes de mensajes o tickets en un portatil, sin infraestructura GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card se limita a la distribucion de bits y al desglose de almacenamiento; la pagina de Qualcomm AI Hub para Qwen3.5-2B menciona la existencia de metricas de rendimiento por dispositivo, pero no se han incluido cifras en la informacion proporcionada. No se dispone por tanto de valores de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales para este checkpoint.

## Requisitos de hardware

- Memoria: el checkpoint pesa 2,146 GiB (2,304 GB en repositorio). Con cache KV y overhead del runtime MLX, se recomienda un minimo de 4 GB de memoria unificada disponible; 8 GB es un valor comodo para contextos moderados.
- Hardware objetivo: exclusivamente Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra), ya que el formato es MLX y la libreria declarada es `mlx`. No es ejecutable directamente en GPU NVIDIA ni AMD sin reconversion.
- GPU dedicadas (A100, H100, RTX 4090): no aplicables a este formato; para esos entornos habria que usar el checkpoint original en safetensors BF16 o una cuantizacion GGUF/AWQ equivalente.
- Cabe en GPU de consumo: si, en cualquier Mac con memoria unificada de 8 GB o superior, incluidos los modelos base de gama de entrada.
- Opciones de despliegue: `mlx-lm` y el ecosistema MLX (incluida la herramienta oQ/oMLX), ademas de aplicaciones que consumen modelos MLX como LM Studio. No es compatible con vLLM, TGI, llama.cpp ni Ollama en su formato actual.
- Latencia y throughput: no disponible. La presencia de la cabeza MTP apunta a una mejora en tokens por segundo respecto a la decodificacion autoregresiva, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Bits/peso efectivos | Almacenamiento | Vision | MTP | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Qwen3.5-2B-oQ6-mtp (este) | 2,274B | 8,106 | 2,146 GiB | Si (0,331B) | Si (0,061B) | No disponible | HuggingFace, MLX |
| Qwen3.5-2B-oQ8e-mtp | 2,274B (mismo origen) | No disponible (variante 8-bit) | No disponible | Si | Si | No disponible | HuggingFace, MLX |
| Qwen3.5-2B original (BF16) | ~2,274B | 16,00 | ~4,5 GB (estimado por 2 bytes/peso) | Si | Si | No disponible | HuggingFace, segun Qualcomm AI Hub |
| Qwen3.5-2B (export Qualcomm) | ~2,274B | No disponible | No disponible | Si | No disponible | No disponible | Qualcomm AI Hub, dispositivos Snapdragon |

La comparacion mas directa es con la variante oQ8e-mtp del mismo autor, que emplea una cuantizacion de mayor precision y por tanto mayor peso en disco a cambio de menor degradacion. Frente al checkpoint BF16 original, este oQ6 reduce el almacenamiento aproximadamente a la mitad. La version de Qualcomm AI Hub no es comparable en formato, ya que esta optimizada para NPU de dispositivos Snapdragon y no para MLX.

## Limitaciones y advertencias

- Licencia no declarada: la model card no especifica licencia, por lo que no se puede asumir uso comercial libre. Es imprescindible verificar la licencia del modelo base Qwen3.5-2B antes de cualquier despliegue en produccion.
- Cuantizacion con perdida: el 75,837% de los pesos esta a 6 bits, lo que puede degradar tareas sensibles a precision, como matematicas de varios pasos, generacion de codigo complejo o razonamiento visual detallado. No hay evaluaciones publicadas que cuantifiquen esa perdida.
- Riesgo de alucinacion: inherente a un modelo de 2B parametros; es previsible una tasa elevada de errores factuales en dominios especializados y en preguntas que requieran conocimiento actualizado.
- Sesgos: no se documenta nada sobre sesgos en la informacion disponible; al heredar los datos de entrenamiento del modelo base, es esperable que reproduzca los sesgos de este.
- Contexto e idiomas sin especificar: se desconoce la ventana de contexto maxima y la cobertura idiomatica real, lo que impide planificar casos de uso con conversaciones largas o con idiomas distintos del ingles y el chino.
- Compatibilidad restringida: el formato MLX limita su uso a Apple Silicon; no es desplegable en infraestructura x86 con GPU NVIDIA sin reconversion previa.
- Madurez y soporte: el repositorio acumula 10 descargas y 0 likes, sin pipeline declarado ni documentacion adicional; es un artefacto de un autor individual, no una publicacion oficial de Alibaba, con el riesgo de mantenimiento que ello implica.
- Sin garantias de tool calling ni de agentes: no se confirma soporte de function calling, por lo que no debe asumirse en disenos que dependan de ello.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bambocher/Qwen3.5-2B-oQ6-mtp
- Variante de 8 bits del mismo autor: https://huggingface.co/bambocher/Qwen3.5-2B-oQ8e-mtp
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Qwen3.5-2B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_5_2b
- README del export de Qualcomm para Qwen3.5-2B: https://github.com/qualcomm/ai-hub-models/blob/main/src/qai_hub_models/models/qwen3_5_2b/README.md
- Repositorio de la serie Qwen3.5: https://github.com/ABDtmx/Qwen3.5

# oakmindai/Qwen3.8-Flash-Next-NVFP4-FTW

## Resumen

Qwen3.8-Flash-Next NVFP4 — SparkLab FTW es un artefacto de inferencia listo para ejecutar en NVIDIA DGX Spark, que empaqueta el checkpoint cuantizado NVFP4 de Inferact sobre el modelo Qwen3.8-Flash-Next de Qwen. No introduce un modelo nuevo ni una cuantización adicional: se trata de una conversión a formato FreeToken Weight (FTW) que preserva la precisión, alineando y fragmentando los tensores para el cargador nativo de FreeToken. El objetivo es facilitar el despliegue en el superchip Grace Blackwell GB10, aprovechando su memoria unificada de 128 GB y el almacenamiento NVMe para la ejecución de un modelo MoE de gran tamaño.

El modelo base, Qwen3.8-Flash-Next, es una arquitectura híbrida GDN + QSA con 125 mil millones de parámetros principales más una tabla de embeddings n-gram de 51 mil millones, activando solo 6 mil millones de parámetros por token. Esta conversión FTW está validada únicamente para entrada y salida de texto; las capacidades multimodales (imagen y vídeo) del checkpoint original no están habilitadas en esta ruta de despliegue. La relevancia actual radica en ofrecer una vía optimizada y documentada para ejecutar un modelo de esta escala en hardware de escritorio de alta gama, con una API compatible con OpenAI y Anthropic.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida GDN + QSA (atencion QSA, residual GDN) |
| Parametros totales | 125B (modelo principal) + 51B (tabla n-gram) = 176B |
| Parametros activos | 6B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (ModelOpt) para expertos enrutados; BF16 para tabla n-gram |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (licencia other) |
| Formato de pesos | FTW (FreeToken Weight) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura MoE hibrida que combina atencion QSA (Query-Sparse Attention) con un mecanismo residual GDN (Gated Delta Network). Incluye una tabla de embeddings n-gram de 51B parametros en BF16, almacenada como artefacto de lectura aleatoria separado, que permite busquedas locales rapidas de tokens. La cuantizacion NVFP4 fue aplicada por Inferact mediante NVIDIA Model Optimizer, manteniendo los expertos enrutados en esa precision. La conversion FTW realizada por OakMind AI no realiza re-cuantizacion ni entrenamiento; solo alinea y fragmenta los tensores para el cargador nativo de FreeToken, organizando los expertos en bancos direccionables de forma independiente para permitir el cacheo y la carga desde NVMe.

No se dispone de informacion sobre el proceso de entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF o DPO) en los materiales proporcionados.

## Capacidades

- Generacion de texto y conversacion multi-turno, validada para entrada y salida de texto en esta ruta de despliegue.
- Razonamiento complejo gracias a la arquitectura MoE con 6B parametros activos, que permite escalar el modelo sin disparar el coste computacional por token.
- Soporte de API compatible con OpenAI y Anthropic a traves de SparkLab, lo que facilita la integracion en aplicaciones existentes.
- Ejecucion eficiente en hardware GB10 con memoria unificada y almacenamiento NVMe, gracias al diseno FTW y al backend FreeToken.
- El modelo base es multimodal (imagen y video), pero estas capacidades no estan habilitadas en este artefacto especifico.
- No se ha confirmado soporte explicito de tool calling o function calling en la documentacion disponible.

## Casos de uso

- Servidor de chat local en DGX Spark: desplegar un asistente conversacional con API compatible con OpenAI, usando `sparklab serve` y consumiendo desde aplicaciones cliente mediante peticiones HTTP.
- Prototipado de aplicaciones de generacion de texto: aprovechar la baja latencia de inferencia en GB10 para experimentar con generacion de contenido, resumen o reescritura en entornos de desarrollo.
- Investigacion en eficiencia de inferencia MoE: estudiar el comportamiento del cacheo de expertos en NVMe y la gestion de memoria unificada con un modelo de 176B parametros en un solo dispositivo.
- Integracion en pipelines de procesamiento de lenguaje natural: usar la API de chat completions para tareas de clasificacion, extraccion de informacion o generacion estructurada, siempre que el volumen de peticiones sea moderado.
- Evaluacion de modelos cuantizados: comparar la salida de este artefacto FTW con el checkpoint NVFP4 original o con el modelo en BF16 para verificar la fidelidad de la conversion.
- Despliegue en entornos con restricciones de hardware: ejecutar un modelo de gran tamano en un unico DGX Spark sin necesidad de cluster, gracias a la combinacion de memoria unificada y almacenamiento local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras metricas para este artefacto ni para el modelo base en los materiales proporcionados.

## Requisitos de hardware

- Hardware objetivo: NVIDIA DGX Spark con superchip Grace Blackwell GB10, arquitectura ARM64, CUDA 13 y kernels SM121.
- Memoria: 128 GB de memoria unificada coherente; el artefacto completo (180.4 GB) supera la memoria disponible para aplicaciones, por lo que se usa memoria unificada acotada para tensores activos y cacheo de expertos desde NVMe.
- Almacenamiento: NVMe local obligatorio para almacenar la tabla n-gram y los expertos enrutados no residentes.
- No cabe en GPUs de consumo convencionales (RTX 4090, etc.) debido al tamano del modelo y a la dependencia de la memoria unificada del GB10.
- Opciones de despliegue: SparkLab (recomendado), FreeToken como backend nativo; no se mencionan vLLM, llama.cpp u Ollama para este artefacto especifico.
- Latencia y throughput: no disponibles; la configuracion validada incluye 16 workers de lectura de disco y un cache de host de 3 GB, pero no se publican cifras de rendimiento.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con modelos alternativos de la misma categoria. El artefacto es una conversion de un checkpoint existente, y no se han proporcionado datos de rendimiento relativos a otros modelos MoE de tamano similar. Se puede considerar como referencia el modelo base Qwen3.8-Flash-Next y su cuantizacion NVFP4 de Inferact, pero sin metricas comparables.

## Limitaciones y advertencias

- El artefacto solo esta validado para entrada y salida de texto; las capacidades multimodales (imagen, video) del modelo base no estan habilitadas en esta ruta de despliegue.
- Requiere hardware especifico (DGX Spark con GB10) y no es portable a GPUs convencionales sin modificaciones significativas.
- La licencia qwen-community-1.0 impone condiciones de uso que deben revisarse antes de cualquier despliegue comercial; se recomienda consultar el texto completo de la licencia.
- No se dispone de informacion sobre sesgos, alucinaciones o limitaciones de idioma del modelo base; se asume que hereda las caracteristicas del modelo Qwen original.
- El tamano del repositorio (180.4 GB) implica requisitos de almacenamiento y transferencia considerables.
- La configuracion de inferencia depende de parametros especificos de SparkLab (como `--moe-backend offload` y `--moe-storage disk`); desviarse de la configuracion validada puede afectar al rendimiento o a la estabilidad.

## Enlaces

- Repositorio HuggingFace del artefacto: https://huggingface.co/oakmindai/Qwen3.8-Flash-Next-NVFP4-FTW
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Checkpoint NVFP4 de Inferact: https://huggingface.co/Inferact/Qwen3.8-Flash-Next-NVFP4
- Repositorio GitHub de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Backend FreeToken: https://github.com/FlashML-org/FreeToken
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- Hilo en foros de NVIDIA sobre Qwen3.8-Flash-Next en DGX Spark: https://forums.developer.nvidia.com/t/qwen3-8-flash-next/381228

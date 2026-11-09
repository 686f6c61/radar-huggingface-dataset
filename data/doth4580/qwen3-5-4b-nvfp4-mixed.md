# doth4580/Qwen3.5-4B-NVFP4-MIXED

## Resumen

Qwen3.5-4B-NVFP4-MIXED es una versión cuantizada del modelo Qwen3.5-4B del equipo Qwen de Alibaba, publicada por el usuario doth4580. El artefacto aplica una cuantización mixta NVFP4/FP8 mediante el cuantizador offline de veloGB10 sobre los pesos originales, manteniendo tokenizador y plantilla de chat sin cambios. Su propósito principal es ejecutarse con el motor de inferencia veloGB10 (`gb10_inference`) en sistemas NVIDIA DGX Spark / GB10, aunque al usar el formato estándar `compressed-tensors` (`nvfp4-pack-quantized`) es legible por cualquier framework compatible con dicho formato.

El modelo base emplea una arquitectura densa híbrida que combina 24 capas GatedDeltaNet (atención lineal con estado recurrente de tamaño fijo) y 8 capas de atención completa GQA, con un tamaño oculto de 2560 y 16 cabezas de consulta frente a 4 de clave/valor. Dispone de una ventana de contexto de 262.144 tokens y un vocabulario de 248.320 entradas. Los pesos cuantizados ocupan 3,1 GB en disco y suman 4.659.865.088 parámetros.

La relevancia de este artefacto es doble: por un lado, demuestra la viabilidad de servir un modelo de 4B con contexto de 256K en hardware GB10 con decodificación especulativa nativa; por otro, documenta métricas de rendimiento reales (hasta 99 tok/s de decodificación en TP=2 y 4.138 tok/s de prefill) que sirven como referencia para despliegues en clústeres pequeños de DGX Spark. La licencia Apache-2.0 del modelo original se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Densa híbrida: 24 capas GatedDeltaNet (atención lineal) + 8 capas full GQA; hidden 2560, 16 Q / 4 KV heads |
| Parametros totales | 4.659.865.088 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | `nvfp4-mixed`: todas las GEMM en NVFP4 excepto las proyecciones de entrada/salida de GDN en FP8 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `nvfp4-pack-quantized` (compatible con `compressed-tensors`), safetensors |
| Vocabulario | 248.320 |
| Cabeza MTP | Nativa de multi-token-prediction (usada para decodificación especulativa) |
| Tamano en disco | 3,1 GB (repo: 3,3 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B es un transformer denso de arquitectura híbrida. La mayor parte de sus capas (24 de 32) son GatedDeltaNet, un mecanismo de atención lineal con estado recurrente de tamaño fijo que reduce el coste computacional y de memoria en contextos largos frente a la atención cuadrática tradicional. Las 8 capas restantes emplean atención completa con GQA (16 cabezas de consulta, 4 de clave/valor), intercaladas periódicamente para preservar la capacidad de recuperación exacta sobre el contexto. El modelo incorpora además una cabeza nativa de multi-token-prediction (MTP) que actúa como fuente de borradores en decodificación especulativa.

La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens procesados ni si se aplicaron fases de RLHF o DPO sobre el modelo base. El artefacto publicado no reentrena el modelo: únicamente aplica cuantización post-entrenamiento con el cuantizador `nvfp4-mixed` de veloGB10. La innovación técnica destacable en este artefacto es la combinación de NVFP4 para las GEMM principales con FP8 en las proyecciones de entrada/salida de GatedDeltaNet, una decisión de precisión mixta orientada a preservar la estabilidad numérica del estado recurrente, que es más sensible a la cuantización agresiva que las proyecciones lineales convencionales.

## Capacidades

- Generación de texto y razonamiento multi-turno con ventana de contexto de 262.144 tokens.
- Modo de razonamiento (thinking) activado por defecto en las configuraciones de muestreo documentadas por el autor.
- Decodificación especulativa nativa mediante la cabeza MTP integrada, con tasas de aceptación del borrador del 51,2 % en TP=1 y TP=2, y del 53,6 % en TP=4.
- Servicio compatible con la API de OpenAI (`/v1`) a través de veloGB10, lo que habilita integración con clientes existentes.
- Soporte de prefix caching (`--prefix-cache on`) para reutilización de prefijos en conversaciones multi-turno.
- Despliegue multi-nodo con paralelismo tensorial (TP=1, TP=2, TP=4) y transporte RDMA sobre RoCE.
- Capacidades de código y matemáticas: no documentadas explícitamente en la información disponible, aunque el benchmark del autor incluye turnos de código y de narración.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles.

## Casos de uso

- Servicio de chat con contexto largo en DGX Spark: con 262.144 tokens de ventana y prefix caching, el modelo puede mantener conversaciones o análisis documentales extensos en un único nodo GB10, con una decodificación mediana de 60 tok/s en TP=1.
- Procesamiento de documentos técnicos completos: la ventana de 256K permite ingerir manuales, informes o bases de código de gran tamaño sin fragmentación, y el prefill de 3.308 tok/s en TP=1 hace viable el análisis de entradas de decenas de miles de tokens.
- Asistencia de código en entornos con restricciones de hardware: el artefacto ocupa 3,1 GB y cabe holgadamente en la memoria unificada de un GB10, lo que permite desplegar un asistente de programación local sin GPU de datacenter; el benchmark del autor mide 76 tok/s en turnos de código en TP=1.
- Despliegue en clúster pequeño de dos nodos: con TP=2 se alcanzan 99 tok/s en turnos de código y 150 tok/s agregados con dos peticiones concurrentes, adecuado para equipos de desarrollo que compartan un par de DGX Spark.
- Evaluación y desarrollo de motores de inferencia: al ser un artefacto validado contra la suite de corrección de veloGB10 (decodificación especulativa greedy-lossless, TP=2, pruebas de correctness), sirve como referencia para probar kernels NVFP4 y estrategias de cuantización mixta.
- Prototipado de agentes con razonamiento extendido: el modo thinking por defecto y la ventana de 256K permiten cadenas de razonamiento largas y multi-paso, con la API OpenAI-compatible facilitando la integración en frameworks de agentes existentes.
- Inferencia por lotes de resúmenes o extracción de información: con 172 tok/s agregados en TP=4 y dos peticiones concurrentes, es viable para pipelines de procesamiento por lotes de tamaño moderado.

## Benchmarks y rendimiento

Métricas medidas por el autor con veloGB10 0.7.7 sobre máquinas GB10 clase DGX Spark (2026-11-06), con muestreo de producción, thinking activado y una ejecución por celda (±10 % de variación aproximada).

| Topologia | Fuente del borrador | Decode turno de codigo (tok/s) | Decode turno de narracion (tok/s) | Mediana decode todos los turnos (tok/s) | Prefill (tok/s) | 2 peticiones, agregado (tok/s) | Aceptacion del borrador |
|---|---|---:|---:|---:|---:|---:|---:|
| TP=1 | Cabeza MTP del pack | 76 | 65 | 60 | 3.308 | 110 | 51,2 % |
| TP=2 | Cabeza MTP del pack | 99 | 78 | 78 | 4.138 | 150 | 51,2 % |
| TP=4 | Cabeza MTP del pack | 90 | 83 | 78 | 3.152 | 172 | 53,6 % |

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: aproximadamente 3,1 GB de pesos más estado recurrente y caché KV; el artefacto está dimensionado para la memoria unificada de un GB10.
- GPU recomendadas: NVIDIA GB10 (DGX Spark). El autor valida TP=1, TP=2 y TP=4 sobre estos sistemas.
- Compatibilidad con GPU de consumo: no documentada en la información disponible; el formato NVFP4 requiere soporte de hardware y kernels específicos, y el motor veloGB10 está orientado a GB10.
- Opciones de despliegue: veloGB10 (`gb10_inference`), con servidor OpenAI-compatible en el puerto 9000. Al usar el layout `compressed-tensors`, otros frameworks que lean `nvfp4-pack-quantized` podrían cargarlo, pero el autor solo certifica veloGB10.
- Configuración recomendada por el autor: `--max-seq-len 262144`, `--max-batch 2`, `--max-tokens 65536`, `--default-presence-penalty 1.5`, `--prefix-cache on`, `--mtp=auto`.
- Latencia y throughput: ver tabla de benchmarks; la decodificación incluye decodificación especulativa y el prefill alcanza 4.138 tok/s en TP=2.
- Red multi-nodo: RoCE con uno o dos pares de puertos; los nodos no necesitan copia local del modelo, el head transfiere solo la partición correspondiente y la cachea.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| doth4580/Qwen3.5-4B-NVFP4-MIXED | 4,66B | 262.144 | NVFP4/FP8 mixta | Apache-2.0 | Optimizado y validado para veloGB10 en GB10; 3,1 GB en disco |
| Qwen/Qwen3.5-4B (original) | 4,66B | 262.144 | BF16/FP16 (presumible) | Apache-2.0 | Modelo base sin cuantizar; mayor huella de memoria |
| Otras cuantizaciones de Qwen3.5-4B (GGUF, AWQ, GPTQ) | 4,66B | 262.144 | Varias | Apache-2.0 (heredada) | No disponibles en la informacion proporcionada; compatibilidad con llama.cpp/vLLM no verificada aqui |

No se dispone de datos de benchmarks del modelo original ni de otras cuantizaciones en la información proporcionada, por lo que no es posible comparar calidad relativa entre variantes.

## Limitaciones y advertencias

- La cuantización NVFP4 introduce pérdida de precisión frente a los pesos originales; el autor no publica evaluaciones de degradación de calidad (perplejidad, benchmarks de razonamiento) respecto al modelo base.
- Las métricas de rendimiento provienen de una sola ejecución por celda con ±10 % de variación y de builds de desarrollo de veloGB10 0.7.7, no de una versión estable.
- El artefacto está producido, validado y ajustado para veloGB10; el rendimiento en otros frameworks que lean `compressed-tensors` no está certificado.
- No se documentan los idiomas soportados ni evaluaciones multilingües; la model card original se reproduce truncada en la información disponible.
- No hay información sobre sesgos, tasas de alucinación ni evaluaciones de seguridad del modelo base en los datos proporcionados.
- El modo thinking activado por defecto y el `presence-penalty` de 1.5 son ajustes del pack; modificarlos puede alterar el comportamiento observado en los benchmarks.
- La licencia Apache-2.0 permite uso comercial, pero los derechos del modelo original pertenecen al equipo Qwen de Alibaba; el autor del pack no reclama propiedad intelectual sobre pesos ni arquitectura.
- El despliegue multi-nodo requiere infraestructura RoCE y direccionamiento IP accesible entre nodos; no es un escenario de un solo equipo.
- Solo 25 descargas y 0 likes en el momento de la consulta: artefacto de nicho con validación comunitaria limitada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/doth4580/Qwen3.5-4B-NVFP4-MIXED
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Motor de inferencia veloGB10: https://github.com/sf-stav/veloGB10

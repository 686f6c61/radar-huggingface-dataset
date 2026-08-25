# destr8803/GLM-5.2-224E-FP8-REAP

## Resumen

GLM-5.2-224E-FP8-REAP es un derivado podado del modelo MoE `zai-org/GLM-5.2-FP8`, producido de forma independiente por el usuario destr8803 y no como un lanzamiento oficial de Z.ai. El checkpoint reduce cada capa dispersa de 256 expertos enrutados a 224, manteniendo 8 expertos activos por token, lo que reduce el peso del payload en un 12,2% (de 755,6 GiB a 618,2 GiB) conservando el formato FP8 block-scaled del modelo original. El objetivo es ofrecer una alternativa más ligera para entornos con restricciones de almacenamiento o memoria, sin renunciar a la arquitectura completa de 661,5 mil millones de parámetros.

El modelo se basa en la arquitectura `GlmMoeDsaForCausalLM` (MoE con atención DSA, Deep Sparse Attention) con 78 capas ocultas y 224 expertos enrutados por capa. La poda se realizó mediante el método REAP, que calcula una puntuación para cada experto combinando el peso real del router con la norma L2 de su salida, calibrado con 12.228 muestras y 15,4 millones de tokens. La validación incluye 104.037 tensores verificados sin errores, pruebas funcionales de aritmética, seguimiento de instrucciones, recuperación de contexto largo y tool calling, y un contexto máximo validado de 131.072 tokens con caché KV en BF16.

La relevancia de este derivado radica en que permite desplegar un modelo de la familia GLM-5.2 con una huella de memoria reducida, manteniendo las capacidades de razonamiento, generación de código y agente del modelo base. Está pensado para entornos de producción con múltiples aceleradores (validado en 8 HPU Gaudi) y para investigación en poda estructural de modelos MoE. La licencia MIT heredada del base facilita su uso comercial, aunque el autor advierte que la poda puede afectar la calidad de forma desigual entre dominios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GlmMoeDsaForCausalLM (MoE con atencion DSA) |
| Parametros totales | 661.510.069.888 (661,5B) |
| Parametros activos | 8 expertos por token (de 224 enrutados) |
| Longitud de contexto | 131.072 tokens (validado en runtime; nominal mayor no especificado) |
| Tipos de cuantizacion | FP8 block-scaled (bloque 128x128) |
| Idiomas soportados | ingles, chino |
| Licencia | MIT |
| Formato de pesos | Safetensors (141 shards) |

## Arquitectura y entrenamiento

El modelo es un MoE (Mixture of Experts) con 78 capas ocultas, donde cada capa dispersa contiene 224 expertos enrutados (reducidos desde los 256 originales) y se activan 8 expertos por token. La arquitectura `GlmMoeDsaForCausalLM` incorpora atención DSA (Deep Sparse Attention), un mecanismo que combina atención densa y dispersa para manejar contextos largos de forma eficiente. Los pesos se mantienen en FP8 con escalado por bloques de 128x128, formato heredado del modelo base `zai-org/GLM-5.2-FP8`.

La poda se realizó con el método REAP, que asigna a cada experto una puntuación basada en la media condicional de `peso_real_del_router * L2(salida_del_experto)`. Se utilizaron 12.228 muestras y 15.425.969 tokens de datos generales, código, razonamiento y agente. En cada una de las 75 capas dispersas se eliminaron los 32 expertos con menor puntuación. El proceso se aplicó directamente sobre el checkpoint inmutable de 256 expertos, sin podas iterativas sobre derivados previos. No hubo entrenamiento adicional ni fine-tuning; solo se realizó la selección y eliminación estructural de expertos.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base GLM-5.2, incluyendo razonamiento multi-paso y resolución de problemas complejos.
- Thinking mode: GLM-5.2 usa razonamiento interno por defecto, con niveles de esfuerzo configurables (aunque este derivado no ha sido validado con esfuerzo reducido).
- Tool calling / function calling: validado en las pruebas funcionales del checkpoint, que incluyen llamadas estructuradas a herramientas.
- Recuperacion de contexto largo: validado hasta 131.072 tokens con caché KV en BF16, superando pruebas de recuperación en matrices de contexto de 16x8K, 8x16K, 4x32K, 2x64K y 1x126K.
- Capacidades multilingues: soporta inglés y chino, según la configuración del modelo base.
- Capacidades de agente: el modelo base está diseñado para tareas de largo horizonte (agentic engineering), y este derivado mantiene la arquitectura para ese fin, aunque no se han reproducido los benchmarks completos.

## Casos de uso

- Despliegue de modelos MoE grandes con menor huella de almacenamiento: la reducción del 12,2% en payload permite alojar el checkpoint en sistemas con menos capacidad, manteniendo 224 expertos enrutados y 8 activos por token.
- Agentes de codificacion (agentic coding): el modelo base GLM-5.2 está optimizado para tareas de ingeniería de largo horizonte; este derivado puede integrarse en pipelines de desarrollo automatizado donde se requiera razonamiento multi-paso y generación de código con contexto extenso.
- Asistentes conversacionales bilingues: con soporte para inglés y chino, puede desplegarse en sistemas de atención al cliente o asistentes virtuales que requieran respuestas en ambos idiomas y gestión de conversaciones multi-turno.
- Razonamiento cientifico y tecnico: la validación preliminar en GPQA Diamond (9/10 en muestra de 10 preguntas) sugiere capacidad para problemas de nivel experto en física, química y biología, aunque la muestra no es concluyente.
- Investigacion en poda de expertos MoE: el checkpoint sirve como caso de estudio para analizar el impacto de la eliminación de expertos en modelos de gran escala, con una metodología documentada y reproducible (keep-map SHA-256 incluido).
- Integracion en entornos con aceleradores HPU: validado con vLLM-Gaudi en configuración tensor parallel 8 y expert parallel 8, es adecuado para infraestructuras basadas en procesadores Gaudi de Intel.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks completos en la informacion disponible. El autor reporta una prueba preliminar de GPQA Diamond con 10 preguntas (smoke sample) que obtuvo 9/10 (90,0%), frente al 91,2% publicado para el modelo base, pero advierte que la muestra no es estadísticamente suficiente para una comparación exacta de calidad. Tampoco se han reproducido los benchmarks oficiales de GLM-5.2.

En cuanto a rendimiento de inferencia, los datos validados en el entorno de 8 HPU son:

| Metrica | Valor |
|---|---|
| Decodificacion secuencial | 20,87 tokens/s |
| Decodificacion concurrente (16 requests, 128 tokens cada una) | 263,51 tokens/s agregados |
| Contexto maximo validado | 131.072 tokens con caché KV BF16 |

## Requisitos de hardware

- Peso del checkpoint: 618,17 GiB en FP8, repartidos en 141 ficheros safetensors.
- VRAM estimada: al menos 640 GB para alojar los pesos en FP8 (8 aceleradores de 80 GB), más memoria adicional para caché KV y activaciones. Con contexto de 131K tokens y BF16 KV cache, se requiere memoria sustancial adicional.
- Aceleradores validados: 8 HPU Gaudi (configuración tensor parallel 8, expert parallel 8). No se ha validado en GPUs NVIDIA, aunque la arquitectura es compatible con backends que soporten `GlmMoeDsaForCausalLM`.
- GPU consumer: no cabe en GPUs de consumo (RTX 4090, etc.) por el tamaño del modelo y la memoria necesaria.
- Opciones de despliegue: vLLM-Gaudi (validado), vLLM estándar si el backend soporta la arquitectura, y posiblemente TGI u otros frameworks con soporte MoE y FP8.
- Latencia y throughput: 20,87 tokens/s en decodificación secuencial y 263,51 tokens/s agregados en concurrencia de 16 requests, medidos en el entorno de 8 HPU.

## Comparativa con modelos similares

| Modelo | Parametros | Expertos enrutados | Payload | Contexto validado | Licencia |
|---|---|---|---|---|---|
| GLM-5.2-224E-FP8-REAP (este) | 661,5B | 224 | 618,2 GiB | 131K | MIT |
| zai-org/GLM-5.2-FP8 (base) | 661,5B | 256 | 755,6 GiB | 1M (nominal) | MIT |

La comparación directa con otros modelos MoE de gran escala (como DeepSeek-V3 o Qwen3-MoE) no está disponible en la información proporcionada. La principal diferencia frente al base es la reducción de 32 expertos por capa dispersa, lo que reduce el payload en un 12,2% a costa de una posible pérdida de calidad no cuantificada. El contexto nominal del base es de 1M de tokens, pero este derivado solo ha sido validado hasta 131K.

## Limitaciones y advertencias

- Poda estructural: la eliminación de expertos puede afectar la calidad de forma desigual entre dominios, incluso cuando las pruebas agregadas de humo pasan correctamente.
- Benchmarks no reproducidos: la suite completa de benchmarks oficiales de GLM-5.2 no se ha ejecutado sobre este derivado; el resultado de GPQA (9/10 en 10 preguntas) es una muestra preliminar y no debe interpretarse como un resultado completo.
- Caché KV: solo el perfil de runtime con caché KV en BF16 está cualificado. La caché KV en FP8 no fue aceptada para este release.
- Contexto limitado: aunque la arquitectura anuncia un contexto nominal mayor, este derivado solo ha sido validado hasta 131.072 tokens en el runtime probado.
- Requisitos de hardware: el despliegue requiere almacenamiento sustancial (618 GiB) y memoria de aceleradores de al menos 640 GB, lo que limita su uso a infraestructuras de gama alta.
- Sesgos y limitaciones del modelo base: las limitaciones de uso previsto, seguridad y lenguaje del modelo base `zai-org/GLM-5.2` continúan aplicando. Se recomienda revisar su model card antes del despliegue.
- No es un release oficial: el checkpoint es un derivado independiente, no respaldado por Z.ai ni Tsinghua University.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/destr8803/GLM-5.2-224E-FP8-REAP
- Modelo base en HuggingFace: https://huggingface.co/zai-org/GLM-5.2-FP8
- Model card del base (GLM-5.2): https://huggingface.co/zai-org/GLM-5.2
- Repositorio GitHub de GLM-5: https://github.com/zai-org/GLM-5
- Blog de Z.ai sobre GLM-5.2: https://z.ai/blog/glm-5.2
- Paper tecnico (arXiv:2602.15763): https://arxiv.org/abs/2602.15763

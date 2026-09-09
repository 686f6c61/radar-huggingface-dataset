# CollectionStudio/Trinity-Nano-Preview-NVFP4

## Resumen

Trinity Nano Preview NVFP4 es una versión cuantizada del modelo Trinity Nano Preview, creado por Arcee AI y publicado en HuggingFace por CollectionStudio. Se trata de un modelo de lenguaje con arquitectura de expertos mezclados (MoE), afinado para chat, diseñado para ofrecer un punto de entrada ligero a la familia Trinity. El modelo original se describe como un MoE de 6B parámetros con 1B activos por token, entrenado sobre 10T tokens seleccionados en colaboración con Datology.

La versión NVFP4 aplica cuantización de 4 bits a los pesos de las capas MLP o de expertos, mientras que la atención se mantiene en BF16. Está orientada al despliegue en GPUs NVIDIA Blackwell con soporte nativo FP4, aunque también puede ejecutarse en GPUs Hopper mediante el backend Marlin de vLLM, que descomprime los pesos a BF16. El modelo es una vista previa experimental y el propio autor advierte de que puede ser inestable en ciertos casos de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | AfmoeForCausalLM (Mixture of Experts) |
| Parametros totales | 3.371.423.488 según los pesos safetensors; el autor describe el modelo como 6B |
| Parametros activos | 1B activos por token; 800M no embedding activos; 8 expertos activos + 1 compartido |
| Longitud de contexto | 128k tokens |
| Tipos de cuantizacion | NVFP4 (solo pesos MLP/expertos); atención en BF16; KV cache sin cuantizar; fallback Marlin a BF16 en GPUs no Blackwell |
| Idiomas soportados | Inglés, español, francés, alemán, italiano, portugués, ruso, árabe, hindi, coreano y chino |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (cuantizados NVFP4; requiere trust-remote-code para la arquitectura personalizada) |

## Arquitectura y entrenamiento

Trinity Nano Preview utiliza la arquitectura AfmoeForCausalLM, una implementación de Mixture of Experts para modelos causales. El modelo tiene 128 expertos en total, de los cuales 8 están activos por token, más un experto compartido. Según el autor, la cantidad de parámetros no embedding activos por token es de 800M, lo que supone una esparsidad extrema para un modelo pequeño.

El entrenamiento se realizó sobre 10T tokens curados por Datology, partiendo del dataset utilizado en AFM-4.5B y añadiendo contenido adicional de matemáticas y código. El proceso se ejecutó en un clúster de 512 GPUs H200 de Prime Intellect usando paralelismo HSDP. La versión NVFP4 se obtuvo con NVIDIA ModelOpt, usando 512 muestras de calibración con longitud de secuencia 2048 y calibración de todos los expertos. La documentación indica que el modelo está afinado para chat y que es una versión experimental.

## Capacidades

- Generación de texto conversacional, con un estilo que el autor describe como con personalidad y encanto.
- Soporte multilingüe en 10 idiomas mediante el metadata del modelo: en, es, fr, de, it, pt, ru, ar, hi, ko, zh.
- El dataset de entrenamiento incluye matemáticas y código adicionales, por lo que se espera cierta competencia en esas áreas, aunque no hay benchmarks publicados que lo confirmen.
- No se documenta soporte de tool calling, function calling, agentes, visión o audio en la información disponible.
- La arquitectura MoE con 128 expertos y 8 activos puede resultar interesante para estudiar la relación entre esparsidad y calidad en modelos pequeños.
- Requiere trust-remote-code en vLLM o transformers debido a la arquitectura personalizada.

## Casos de uso

- Experimentación con Mixture of Experts ligeros: el modelo permite analizar cómo afectan 128 expertos y solo 1B de parámetros activos a la calidad, la coherencia y la estabilidad, especialmente en GPUs Blackwell.
- Prototipos de chat multilingüe: con 11 idiomas en el metadata, puede usarse para probar asistentes conversacionales en entornos controlados, siempre asumiendo su naturaleza experimental.
- Evaluación de cuantización NVFP4: sirve como caso práctico de cuantización de pesos MLP con atención en BF16 y KV cache sin cuantizar, para equipos que trabajen con NVIDIA ModelOpt.
- Despliegue en servicios de inferencia compatibles con la API OpenAI: mediante vLLM 0.18.0 o superior, puede integrarse en pipelines que ya usan este formato de servidor.
- Estudio de esparsidad extrema: con solo 800M parámetros no embedding activos por token, es un candidato para investigación sobre el equilibrio entre activación de parámetros y rendimiento.
- Pruebas de generación de código y matemáticas: el dataset de entrenamiento incorpora contenido adicional en estos dominios y puede probarse en tareas de razonamiento básico, aunque sin garantías por ser una versión preliminar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan valores de MMLU, HumanEval, GSM8K ni otros datasets de evaluación. Tampoco se ofrecen datos comparativos con otros modelos en la documentación.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. El repositorio ocupa 4.4 GB, por lo que el peso de los modelos cuantizados es del orden de ese tamaño; la VRAM adicional dependerá de la longitud de contexto, el batch y el backend de inferencia.
- GPU recomendadas: NVIDIA Blackwell B200, B300 o GB300 para aprovechar el cómputo FP4 nativo. En GPUs Hopper H100 y H200 puede ejecutarse con el backend Marlin, que descomprime los pesos a BF16, sin la aceleración FP4 nativa.
- No se especifica si el modelo puede ejecutarse en GPUs de consumo como la serie RTX 40; la cuantización NVFP4 está pensada para Blackwell y el backend Marlin requiere suficientes recursos VRAM.
- Opciones de despliegue: vLLM 0.18.0 o superior, mediante Docker con la imagen vllm/vllm-openai:v0.18.0-cu130, usando los flags --trust-remote-code, --gpu-memory-utilization 0.90 y --max-model-len 8192.
- En instalaciones pip sobre Blackwell se recomienda forzar el backend Marlin con las variables VLLM_NVFP4_GEMM_BACKEND=marlin y --moe-backend marlin para evitar resultados incorrectos por desajustes de versiones.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. El modelo base sin cuantizar es arcee-ai/Trinity-Nano-Preview, pero no se proporcionan datos de benchmarks ni especificaciones de modelos comparables en la documentación disponible.

## Limitaciones y advertencias

- Modelo experimental y de vista previa: el autor indica que puede ser inestable en ciertos usos, especialmente por la esparsidad extrema de 800M parámetros no embedding activos por token.
- No se publicarán más despliegues del modelo en servicios alojados; hay que descargarlo y ejecutarlo localmente.
- La cuantización NVFP4 está optimizada para GPUs Blackwell. En otras GPUs el rendimiento se ve limitado por la descompresión Marlin a BF16 y no se obtiene la velocidad de cálculo FP4 nativa.
- En instalaciones pip de vLLM sobre Blackwell puede haber errores de salida si las versiones de paquetes no coinciden; la solución documentada es forzar el backend Marlin.
- No se han publicado benchmarks, por lo que el rendimiento real frente a otros modelos no está validado.
- La licencia OpenMDW-1.1 debe revisarse para conocer las condiciones exactas de uso, modificación y posible uso comercial.
- No se documenta tool calling, función de agentes, visión ni audio; no deben asumirse estas capacidades en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CollectionStudio/Trinity-Nano-Preview-NVFP4
- Modelo base sin cuantizar: https://huggingface.co/CollectionStudio/Trinity-Nano-Preview
- Modelo original de Arcee AI: https://huggingface.co/arcee-ai/Trinity-Nano-Preview
- Blog de Arcee AI sobre la familia Trinity: https://www.arcee.ai/blog/the-trinity-manifesto
- Datology: https://www.datologyai.com/
- Prime Intellect: https://www.primeintellect.ai/
- NVIDIA ModelOpt: https://github.com/NVIDIA/Model-Optimizer
- vLLM: https://github.com/vllm-project/vllm

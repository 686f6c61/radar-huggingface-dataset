# CollectionStudio/Trinity-Nano-Preview

## Resumen
Trinity-Nano-Preview es un modelo de lenguaje de código abierto (open weight) desarrollado por Arcee AI y publicado en Hugging Face por CollectionStudio. Es una vista previa experimental de la familia Trinity, que en su versión pequeña combina una arquitectura de mezcla de expertos (MoE) con un tamaño total de 6 000 millones de parámetros, de los cuales aproximadamente 1 000 millones son activos por token.

El modelo ha sido afinado para conversación y está construido a partir de `arcee-ai/Trinity-Nano-Base`. Según la documentación, su entrenamiento se realizó sobre 10 billones de tokens de datos curados con Datology, partiendo del dataset de AFM-4.5B y añadiendo matemáticas y código. Su relevancia radica en explorar el límite de la esparsidad en modelos pequeños: con solo 800 millones de parámetros activos no-embedding por token, ofrece una ventana de contexto de 128 000 tokens. Es multilingüe, con soporte para tool calling y razonamiento paso a paso, aunque sus propios autores advierten de que puede presentar inestabilidad en algunos casos de uso.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | AfmoeForCausalLM (MoE) |
| Parámetros totales | 6.120.003.328 (6B) |
| Parámetros activos | 1B activos por token (800M no-embedding) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantización | No hay lista oficial; referencias a GGUF Q4_K_M y repositorio NVFP4 |
| Idiomas soportados | en, es, fr, de, it, pt, ru, ar, hi, ko, zh |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors, BF16 (inferido por tamaño y ejemplos) |

## Arquitectura y entrenamiento
Trinity-Nano-Preview usa la arquitectura AfmoeForCausalLM, un transformer de mezcla de expertos con 128 expertos en total, de los cuales 8 se activan por token y 1 es un experto compartido (shared expert). Aunque el modelo totaliza 6 000 millones de parámetros, solo unos 1 000 millones participan en el cómputo de cada token, y de esos aproximadamente 800 millones corresponden a parámetros no-embedding. La ventana de contexto es de 128 000 tokens y el entrenamiento se realizó en un clúster de 512 GPUs H200 de Prime Intellect mediante paralelismo HSDP.

Según la card, el modelo parte de `arcee-ai/Trinity-Nano-Base` y fue entrenado con 10 billones de tokens curados junto a Datology, tomando el dataset de AFM-4.5B y añadiendo datos de matemáticas y código. No se especifica si se aplicó RLHF o DPO; el modelo se define como afectuado para chat. En la configuración de despliegue para vLLM se incluyen los flags `--reasoning-parser deepseek_r1` y `--tool-call-parser hermes`, lo que sugiere compatibilidad con razonamiento estructurado y llamadas a herramientas, aunque la documentación no detalla más innovaciones técnicas.

## Capacidades
- Generación de texto conversacional en once idiomas: inglés, español, francés, alemán, italiano, portugués, ruso, árabe, hindi, coreano y chino.
- Razonamiento paso a paso: el ejemplo de vLLM incluye `--reasoning-parser deepseek_r1`, lo que apunta a soporte para modos de razonamiento estilo R1.
- Tool calling / function calling: el comando de vLLM incorpora `--enable-auto-tool-choice` y `--tool-call-parser hermes`, indicando integración con agentes que necesitan llamar a funciones externas.
- Ventana de contexto larga de 128 000 tokens, útil para hilos de conversación extensos y documentos largos.
- Capacidades multilingües amplias, lo que facilita su uso en aplicaciones de traducción o asistencia en varios idiomas.
- Despliegue flexible: compatible con Transformers, vLLM, llama.cpp y LM Studio.

## Casos de uso
- Asistente conversacional multilingüe: la ventana de 128 000 tokens y el ajuste de chat permiten mantener conversaciones largas en once idiomas, con una personalidad amigable para atención al cliente o compañía virtual.
- Generación de código en entornos de desarrollo: el entrenamiento adicional en código y el soporte de tool calling facilitan su integración en agentes de programación asistida, por ejemplo para completar funciones o revisar snippets en un editor.
- Resolución de problemas matemáticos: al incluir refuerzo en matemáticas, el modelo puede usarse en tareas educativas o de soporte técnico que requieran razonamiento aritmético y algebraico.
- Agentes con herramientas: gracias al parser Hermes y la selección automática de herramientas, puede orquestar llamadas a APIs externas, búsquedas web o ejecución de funciones en pipelines de automatización.
- Procesamiento de documentos largos: su capacidad de manejar 128 000 tokens le permite analizar contratos, informes o hilos de correo extensos sin perder contexto.
- Traducción y revisión multilingüe: al cubrir once idiomas, es adecuado para traducción asistida, corrección de estilo y reescritura de contenido en varios idiomas.
- Despliegue en local para usuarios avanzados: al ser open weight y compatible con llama.cpp o LM Studio, puede ejecutarse en una GPU de consumidor, lo que resulta útil en entornos con requisitos de privacidad o sin acceso a APIs.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada: en BF16, los pesos ocupan aproximadamente 12,5 GB, a lo que hay que sumar la memoria de estados y KV cache; con ventanas largas de 128 000 tokens, la VRAM total puede superar los 20 GB. En cuantización GGUF Q4_K_M, los pesos ocupan unos 4,5 GB, lo que permite inferencia en GPUs de 8-12 GB de VRAM.
- GPU recomendadas: Nvidia A100 40/80 GB o H100 para BF16 con contexto largo. Para cuantización de 4 bits, una RTX 3080 de 10 GB o una RTX 4060 Ti de 16 GB puede ser suficiente.
- Consumo en GPU doméstica: sí, con cuantización 4 bits en GPUs de 8-12 GB; también con BF16 en GPUs de 24 GB como la RTX 3090 o RTX 4090.
- Opciones de despliegue: Transformers (rama main o `trust_remote_code=True`), vLLM >=0.11.1, llama.cpp >=b7061 y LM Studio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
No disponible. La documentación menciona AFM-4.5B como modelo anterior de Arcee AI, pero no se aportan especificaciones suficientes para establecer una comparativa fiable.

## Limitaciones y advertencias
- Modelo experimental: la propia card advierte de que puede ser inestable en ciertos casos de uso y no se alojará en ninguna API, por lo que requiere descarga y ejecución local.
- Límites de esparsidad: con solo 800 millones de parámetros activos no-embedding por token, puede sufrir degradación en tareas complejas o de razonamiento amplio.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en dominios especializados.
- Licencia OpenMDW-1.1: es una licencia open weight; se recomienda revisar sus condiciones específicas antes de un uso comercial extenso.
- Dependencia de código personalizado: la arquitectura AfmoeForCausalLM requiere la rama `main` de Transformers o `trust_remote_code=True`; las versiones estables pueden no ser compatibles.
- Cuantizaciones no oficiales: las variantes GGUF y NVFP4 pueden presentar diferencias de comportamiento respecto al modelo original.

## Enlaces
- Hugging Face: https://huggingface.co/CollectionStudio/Trinity-Nano-Preview
- Modelo base: https://huggingface.co/arcee-ai/Trinity-Nano-Base
- Modelo de referencia AFM-4.5B: https://huggingface.co/arcee-ai/AFM-4.5B
- Blog de arquitectura: https://www.arcee.ai/blog/the-trinity-manifesto
- Datology: https://www.datologyai.com/
- Cuantización NVFP4: https://huggingface.co/CollectionStudio/Trinity-Nano-Preview-NVFP4

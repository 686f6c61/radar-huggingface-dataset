# phuctahong/nanogpt-gpt-mha-falcon-1-scaled-parallel-ctxeta-ctxlambda-triton-379m-job13126797-step100000

## Resumen

El modelo `phuctahong/nanogpt-gpt-mha-falcon-1-scaled-parallel-ctxeta-ctxlambda-triton-379m-job13126797-step100000` es un checkpoint de investigación de 379,36 millones de parámetros entrenado con el framework NanoGPT Pro, una variante del proyecto NanoGPT orientada a experimentación con arquitecturas y optimizadores. Lo publica el usuario `phuctahong` como un volcado de un directorio de scratch académico (la ruta local apunta a `/scratch/gpfs/JHACKL/...`, típico de clústeres HPC como Princeton o similares), sin model card descriptiva más allá de los metadatos del entrenamiento.

El nombre del repositorio codifica la configuración experimental: atención multi-cabeza estándar (`gpt-mha`), una variante de arquitectura inspirada en Falcon (`falcon-1`), atención escalada en paralelo con parámetros `ctxeta` y `ctxlambda`, kernels Triton y un tamaño de 379M. El entrenamiento se realizó sobre FineWeb-Edu con un presupuesto declarado de 100B de tokens, de los cuales se consumieron 49,15B según el identificador del job (`T_49.15B`), con optimizador AdamW y learning rate 0,001, hasta el paso 100.000.

Es relevante únicamente como artefacto de investigación reproducible: no es un modelo listo para producción, no tiene evaluación publicada, no declara idiomas soportados y su pipeline no está definido en Hugging Face. Su interés está en estudiar variantes de atención y escalado de contexto sobre un transformer decoder-only pequeño entrenado con receta abierta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT) con atención multi-cabeza, variante "falcon-1", atención escalada en paralelo con `ctxeta`/`ctxlambda` y kernels Triton |
| Parametros totales | 379.359.616 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (entrenado sobre FineWeb-Edu, predominantemente inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), más `config.json` y `generation_config.json` |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only de tipo GPT con atención multi-cabeza (`gpt-mha`) y una implementación etiquetada como `falcon-1`, que probablemente adopta elementos del diseño de Falcon (por ejemplo, paralelismo de atención o normalización específica), aunque la model card no detalla la configuración exacta. El sufijo `scaled-parallel-ctxeta-ctxlambda-triton` sugiere una variante de atención con escalado paralelo y parámetros adicionales (`eta`, `lambda`) aplicados al contexto, implementada mediante kernels Triton personalizados en lugar de las operaciones estándar de PyTorch. El `config.json` del repositorio es la única fuente fiable para confirmar número de capas, dimensión oculta, cabezas y longitud máxima de contexto, y no se ha transcrito en la información disponible.

El entrenamiento se realizó con NanoGPT Pro sobre el dataset FineWeb-Edu, con un presupuesto declarado de 100B de tokens y 49,15B consumidos hasta el paso 100.000, usando AdamW con learning rate 0,001. No se documenta si hubo fases de SFT, RLHF o DPO; por el tipo de framework y la nomenclatura del job, cabe esperar un preentrenamiento puro de modelado de lenguaje autorregresivo sin alineamiento posterior. No se especifican la composición exacta del dataset, el esquema de decaimiento del learning rate ni la estrategia de paralelismo distribuido más allá del identificador del job.

## Capacidades

- Generación de texto autorregresiva en inglés (dominio de FineWeb-Edu), sin garantías de calidad multilingüe.
- Modelado de lenguaje base: continuación de texto, respuesta a prompts y generación condicionada.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- No se documenta modo "thinking", visión, audio ni capacidades multimodales.
- Capacidad de contexto: dependiente de la configuración en `config.json`, no publicada en la model card.
- Al ser un checkpoint de investigación, no se han validado capacidades instruccionales ni de seguimiento de instrucciones.

## Casos de uso

- Reproducción de experimentos de investigación: el checkpoint permite comparar la variante de atención `ctxeta`/`ctxlambda` frente a atención estándar en un mismo presupuesto de cómputo, usando el step 100.000 como referencia reproducible.
- Estudio de kernels Triton: sirve para medir el rendimiento y la corrección de la implementación Triton de la atención escalada en paralelo frente a implementaciones en PyTorch eager o FlashAttention.
- Baseline de preentrenamiento a escala 379M: útil como punto de comparación para nuevas recetas de datos o de optimizador sobre FineWeb-Edu con 49,15B tokens vistos.
- Fine-tuning supervisado experimental: al ser un modelo base de 379M con licencia Apache 2.0, puede adaptarse a tareas concretas (clasificación, extracción, resumen) en entornos de investigación con GPUs de gama media.
- Evaluación de dinámicas de atención: los parámetros `eta` y `lambda` permiten analizar cómo se modula la escala de atención con la longitud de contexto en un modelo pequeño y controlado.
- Docencia y formación: modelo lo bastante pequeño (1,5 GB en safetensors) para ejecutarse en una sola GPU consumer y explicar el pipeline completo de NanoGPT Pro de principio a fin.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,5 GB de pesos más activaciones y caché KV; en la práctica, 3-4 GB con contexto moderado.
- VRAM estimada en FP16/BF16: alrededor de 0,76 GB de pesos; 2-3 GB con overhead de runtime.
- VRAM estimada en cuantización de 8 bits: en torno a 0,4 GB de pesos; cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090, A10, L4); para entrenamiento o fine-tuning, A100 o H100 son preferibles por ancho de banda.
- Cabe en GPU consumer: sí, en todas las RTX desde la serie 30 en adelante e incluso en GPUs integradas con suficiente memoria unificada.
- Opciones de despliegue: al ser pesos safetensors con arquitectura custom (`falcon-1` con kernels Triton), la carga directa requiere el código de NanoGPT Pro; la conversión a GGUF para llama.cpp u Ollama no está documentada y probablemente requiera trabajo adicional. vLLM y TGI no soportan esta arquitectura de forma nativa.
- Latencia y throughput: no disponibles; dependen de la implementación Triton y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (NanoGPT Pro Falcon 379M) | 379M | no disponible | Apache 2.0 | Hugging Face, pesos safetensors | Checkpoint de investigación, sin benchmarks |
| GPT-2 medium (OpenAI) | 355M | 1.024 tokens | MIT | Hugging Face, ampliamente soportado | Referencia histórica, ecosistema maduro |
| Pythia-410M (EleutherAI) | 410M | 2.048 tokens | Apache 2.0 | Hugging Face, múltiples checkpoints | Suite de investigación con evaluación publicada |
| Falcon-rw-1B (TII) | 1.000M | 2.048 tokens | Apache 2.0 | Hugging Face | Mayor tamaño, misma familia arquitectónica nominal |

La comparación es aproximada: no hay datos de rendimiento publicados para este checkpoint, por lo que la equiparación se basa únicamente en tamaño y licencia.

## Limitaciones y advertencias

- No se han publicado evaluaciones: se desconoce su calidad real en MMLU, HumanEval, GSM8K o cualquier otro benchmark estándar.
- Riesgo elevado de alucinación y de generar texto incoherente fuera de distribución, propio de un modelo base pequeño entrenado con 49,15B tokens.
- Idiomas: entrenado sobre FineWeb-Edu, con sesgo hacia inglés; el rendimiento en castellano es impredecible y no está evaluado.
- Sesgos: FineWeb-Edu está filtrado por calidad educativa, pero persisten sesgos de género, culturales y geográficos inherentes a la web rastreada.
- Longitud de contexto no documentada: no debe asumirse una ventana mayor que la del `config.json`; el uso más allá de la longitud entrenada degradará la perplejidad.
- Licencia Apache 2.0 permite uso comercial, pero al no haber sido alineado ni evaluado, no es apto para producción sin una validación exhaustiva y, previsiblemente, un fine-tuning previo.
- La arquitectura custom con kernels Triton implica dependencia del código de NanoGPT Pro; la portabilidad a otros runtimes no está garantizada.
- El repositorio tiene 0 descargas y 0 likes, y el nombre incluye un identificador de job y un timestamp futuros; conviene verificar la integridad de los pesos antes de usarlos.
- No hay model card descriptiva ni información sobre el pipeline de Hugging Face, lo que dificulta la integración con `transformers`.

## Enlaces

- Hugging Face: https://huggingface.co/phuctahong/nanogpt-gpt-mha-falcon-1-scaled-parallel-ctxeta-ctxlambda-triton-379m-job13126797-step100000
- Repositorio NanoGPT (referencia del framework base): https://github.com/karpathy/nanoGPT
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Paper FineWeb: https://arxiv.org/abs/2406.17557
- Triton (kernels GPU): https://github.com/triton-lang/triton
- Falcon (TII, referencia arquitectónica): https://huggingface.co/tiiuae/falcon-rw-1b

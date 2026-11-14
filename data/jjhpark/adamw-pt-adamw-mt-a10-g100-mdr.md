# jjhpark/adamw-PT-adamw-MT-a10-g100-mdr

## Resumen

adamw-PT-adamw-MT-a10-g100-mdr es un checkpoint intermedio de investigación publicado por el usuario jjhpark en Hugging Face. No se trata de un modelo instructivo ni de un asistente conversacional listo para producción, sino del resultado de un experimento de *mid-training* sobre un checkpoint previo (adamw-PT) con el conjunto de datos FineMath-4plus. El objetivo del autor es reproducir los hallazgos del artículo arXiv 2610.29348 utilizando Megatron-LM.

El modelo parte de una arquitectura Qwen2 con 494.032.768 parámetros totales (aproximadamente 494 millones), empaquetado en safetensors y con un tamaño de repositorio de 1,0 GB. El entrenamiento consistió en 10.000 pasos adicionales que procesaron 20.970 millones de tokens, aplicando un presupuesto de *mid-training* (MT) del 10 % y un calendario de datos en dos etapas que culmina con un 100 % de datos MT desde el paso 9.000. El optimizador empleado fue AdamW con una tasa de aprendizaje constante de 5e-4 hasta el paso 9.000, seguida de una decadencia lineal hasta 1e-5.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación con cero descargas y cero *likes* en el momento de la consulta, sin *model card* detallada sobre capacidades, idiomas o evaluación. Su interés radica en documentar una receta concreta de *mid-training* con mezcla de datos matemáticos y decaimiento de LR, no en ofrecer un modelo desplegable para tareas de usuario final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen2 (según tag `qwen2` de Hugging Face) |
| Parametros totales | 494.032.768 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia Qwen2, según la etiqueta declarada en el repositorio, con 494 millones de parámetros. No se dispone de información sobre el número de capas, dimensión oculta, cabezas de atención ni longitud de contexto nativa, ya que la *model card* no los detalla. El checkpoint es una continuación del modelo adamw-PT, que a su vez sirve como base para este experimento de *mid-training*.

El entrenamiento se realizó con Megatron-LM y consistió en 10.000 pasos que consumieron 20.970 millones de tokens sobre el conjunto FineMath-4plus. La receta aplica un presupuesto de MT del 10 %, con un calendario de datos en dos etapas: una fase inicial con mezcla parcial y una fase final en la que el 100 % de los datos son de MT a partir del paso 9.000. El optimizador es AdamW con LR constante de 5e-4 hasta el paso 9.000 y decaimiento lineal hasta 1e-5 después (MDR, *model decay rate* o decaimiento final). El autor reporta pérdidas sobre un subconjunto de 32 millones de tokens en el paso 10.000: 2,9726 en DCLM y 1,5696 en FineMath. No se documenta el uso de RLHF, DPO ni ninguna etapa de alineación posterior.

## Capacidades

- Generación de texto autoregresiva: el *pipeline* declarado es `text-generation`, por lo que el modelo puede producir continuaciones de texto.
- Entrenamiento especializado en matemáticas: el *mid-training* con FineMath-4plus sugiere una exposición intensiva a contenido matemático, aunque no se publican evaluaciones que lo confirmen.
- Conversación: la etiqueta `conversational` está presente, pero no hay plantilla de chat documentada ni ajuste instructivo declarado.
- *Tool calling* / *function calling*: no disponible; no se documenta soporte.
- Agentes y razonamiento multi-paso: no disponible; no se documenta soporte.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Modo *thinking*, visión o audio: no disponible; el modelo es exclusivamente de texto.

## Casos de uso

- Reproducción de experimentos de *mid-training*: el checkpoint permite replicar la receta del artículo arXiv 2610.29348 con Megatron-LM, comparando la pérdida en DCLM y FineMath en el paso 10.000 frente a otras configuraciones de mezcla de datos.
- Estudio de calendarios de datos en dos etapas: sirve para analizar cómo afecta pasar a un 100 % de datos de MT en el paso 9.000 y aplicar decaimiento lineal de LR hasta 1e-5.
- Investigación sobre olvido catastrófico: al ser un modelo pequeño (494 M) entrenado con datos matemáticos, es adecuado para medir la degradación en dominios generales (DCLM) frente al dominio objetivo (FineMath).
- *Fine-tuning* posterior en dominios matemáticos: con licencia Apache-2.0 y pesos safetensors, puede usarse como base para ajuste supervisado en tareas de resolución de problemas numéricos, siempre que se valide su calidad real.
- Experimentos de destilación o comparación de optimizadores: la receta basada en AdamW con LR constante y decaimiento final permite contrastar con variantes como AdamW con *cosine schedule* o Muon en entornos controlados.
- Docencia y formación en ingeniería de modelos: el repositorio documenta una receta concreta y reproducible, útil para explicar el concepto de *mid-training* y presupuestos de datos en cursos avanzados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente reporta pérdidas de validación sobre un subconjunto de 32 millones de tokens en el paso 10.000:

| Conjunto de evaluacion | Perdida (paso 10.000) |
|---|---|
| DCLM | 2,9726 |
| FineMath | 1,5696 |

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1 GB para los pesos (494 M de parámetros × 2 bytes), más memoria para activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: en torno a 0,5 GB para pesos; en 4 bits, alrededor de 0,25 GB, aunque no se publican versiones GGUF oficiales.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) puede alojar el modelo en precisión completa; para lotes grandes o contexto largo se recomienda al menos 8 GB de VRAM.
- Cabe en GPU consumer: sí, con holgura, dado el tamaño reducido del modelo.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta `text-generation-inference`), endpoints compatibles (etiqueta `endpoints_compatible`). No se documenta soporte oficial de vLLM, llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| adamw-PT-adamw-MT-a10-g100-mdr | 494 M | No disponible | Apache-2.0 | Hugging Face (0 descargas) | Checkpoint de investigación sin evaluación publicada |
| Qwen2-0.5B | ~494 M | 32.768 tokens (según versión) | Apache-2.0 | Hugging Face, ampliamente desplegado | Modelo base de la misma familia, con documentación completa |
| Qwen2.5-0.5B | ~494 M | 32.768 tokens | Apache-2.0 | Hugging Face | Sucesor con mejoras de datos y contexto |
| SmolLM2-360M | 360 M | 8.192 tokens | Apache-2.0 | Hugging Face | Alternativa pequeña orientada a despliegue eficiente |

La comparación con Qwen2-0.5B es la más directa por compartir arquitectura y tamaño, pero este checkpoint no ofrece garantías de calidad equivalentes al modelo oficial, ya que es un artefacto intermedio de un experimento de *mid-training*.

## Limitaciones y advertencias

- No es un modelo instructivo ni alineado: no se documenta RLHF, DPO ni ajuste de instrucciones, por lo que no debe usarse como asistente conversacional en producción.
- Riesgo elevado de alucinación y de texto incoherente: al ser un checkpoint intermedio, su comportamiento generativo no está validado.
- Sesgos desconocidos: no se publica información sobre la composición del corpus base ni sobre evaluaciones de sesgo.
- Idiomas no declarados: se desconoce si conserva capacidades multilingües del modelo original o si el *mid-training* con FineMath las ha degradado.
- Contexto no documentado: se desconoce la longitud máxima de secuencia soportada.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; el uso en producción requiere una evaluación propia exhaustiva.
- Ausencia de comunidad: cero descargas y cero *likes* en el momento de la consulta, sin issues ni discusiones que aporten validación externa.
- Fecha de creación futura (2026-11-13) en los metadatos: conviene verificar la integridad y procedencia del repositorio antes de reutilizarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jjhpark/adamw-PT-adamw-MT-a10-g100-mdr
- Checkpoint base: https://huggingface.co/jjhpark/adamw-PT
- Artículo de referencia: arXiv 2610.29348 (no se dispone de URL verificada en la información proporcionada)
- Megatron-LM: no se proporciona enlace en la información disponible

# jaydeepb/pythia-1.4b-fineweb-run2

## Resumen

`jaydeepb/pythia-1.4b-fineweb-run2` es un ajuste fino completo (full fine-tune) del modelo base `EleutherAI/pythia-1.4b`, publicado por el usuario jaydeepb. Se trata de un artefacto de investigación, no de un modelo de propósito general: ha sido entrenado durante una única época sobre una muestra de 1 millón de secuencias de 128 tokens extraídas de FineWeb, con el objetivo de servir como conjunto de datos retenido (*held-out*) para validar un clasificador que predice qué secuencias serán memorizadas antes de entrenar.

La relevancia es metodológica. El ecosistema Pythia de EleutherAI existe precisamente para permitir estudios de interpretabilidad y de dinámica de entrenamiento con checkpoints intermedios y datos públicos; este modelo añade una pieza concreta: un par de ejecuciones (run1 y run2) sobre muestras disjuntas del mismo corpus, donde run1 aporta las etiquetas de memorización y run2 los datos frescos con los que se evalúa la capacidad de predicción del clasificador. El resultado es un modelo de 1.414.647.808 parámetros (~1,4B), arquitectura GPT-NeoX, licencia Apache 2.0 y pesos en safetensors, con 0 descargas en el momento de la consulta.

Conviene subrayar que no es un modelo alineado ni instruido: no hay RLHF, DPO ni ajuste a instrucciones, y la ventana usada en el ajuste (128 tokens) es muy inferior al contexto nativo del base (2.048 tokens). Su valor está en la trazabilidad del experimento, no en el rendimiento en tareas de usuario final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia GPT-NeoX (`GPTNeoXForCausalLM`) |
| Parametros totales | 1.414.647.808 (~1,41B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens en el modelo base Pythia-1.4B; el ajuste fino se realizó con secuencias de 128 tokens |
| Tipos de cuantizacion | No se publican pesos cuantizados. Al distribuirse en safetensors (fp32/bf16), es convertible a GGUF/AWQ/GPTQ por el usuario |
| Idiomas soportados | No declarados en la model card; el corpus FineWeb es predominantemente inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repositorio de 2,8 GB, compatible con `transformers`) |

## Arquitectura y entrenamiento

El modelo hereda íntegramente la arquitectura GPT-NeoX del Pythia-1.4B: transformer decoder-only con atención multi-cabeza estándar, tokenizador NeoX y sesgo de atención (RoPE) según la implementación de `transformers`. El ajuste fino no modifica la topología, solo los pesos, por lo que el número de parámetros coincide exactamente con el del base. La tokenización y el vocabulario son los de Pythia, lo que facilita la comparación directa con los checkpoints públicos de EleutherAI.

El entrenamiento consistió en 1 época sobre una muestra de 1 millón de secuencias de 128 tokens (aproximadamente 128M tokens en total) de `HuggingFaceFW/fineweb`, con learning rate 5e-5, scheduler coseno y semilla 42. No se documentan técnicas de alineación (RLHF, DPO, SFT instructivo), ni decodificación especulativa, ni variantes de atención lineal. El diseño experimental es el punto clave: la muestra de run2 se extrae de forma disjunta respecto a la de run1, de modo que run1 proporciona las etiquetas de memorización usadas para entrenar el clasificador y run2 actúa como conjunto de validación fresca para la predicción *before-training*. La model card no detalla la composición interna de FineWeb empleada ni el criterio exacto de muestreo.

## Capacidades

- Generación de texto autoregresiva estándar (continuación de prompt), sin modo instructivo ni plantilla de chat.
- Modelado de lenguaje a nivel de token útil para extracción de probabilidades, perplejidad y métricas de memorización (exposición de n-gramas, pérdida por secuencia).
- Capacidad de reproducir literalmente fragmentos del corpus de entrenamiento en mayor o menor medida, que es precisamente el fenómeno que el experimento busca caracterizar.
- Soporte de *teacher forcing* y evaluación por lotes mediante `transformers`, útil para anotar grandes volúmenes de secuencias.
- Integración con `text-generation-inference` (etiqueta `endpoints_compatible` en el repositorio).
- No dispone de tool calling ni function calling.
- No soporta razonamiento multi-paso guiado, agentes ni planificación.
- Capacidades multilingües limitadas y no documentadas; el sesgo del corpus es hacia inglés.
- No tiene visión, audio ni ninguna modalidad adicional.

## Casos de uso

- Auditoría de memorización en corpus web: generar completaciones condicionadas a prefijos de 128 tokens de FineWeb y medir coincidencia exacta con el texto original, usando el modelo como sujeto experimental junto a su pareja run1.
- Validación de clasificadores de memorización: servir como conjunto retenido para comprobar si un clasificador entrenado con las etiquetas de run1 predice correctamente qué secuencias de run2 acabarán memorizadas, midiendo AUC y calibración.
- Estudio de dinámica de entrenamiento: comparar los pesos y las activaciones de este modelo con los del Pythia-1.4B original para aislar el efecto de 128M tokens adicionales sobre representaciones internas.
- Línea base de ajuste fino en experimentos de escala: al ser un full fine-tune reproducible (lr, scheduler y semilla documentados), sirve como referencia de bajo coste para comparar recetas alternativas de entrenamiento.
- Detección de contaminación de datasets: usar la perplejidad por secuencia del modelo como señal para identificar documentos sobrerrepresentados en un corpus de preentrenamiento.
- Pruebas de integración y *smoke tests* de pipelines de inferencia: su tamaño (~2,8 GB en bf16) permite validar extremo a extremo despliegues con vLLM o TGI en una sola GPU consumer antes de migrar a modelos mayores.
- Destilación y experimentos educativos: modelo lo bastante pequeño para reproducir curvas de pérdida y análisis de atención en cursos o trabajos de fin de máster con hardware limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K, LAMBADA ni perplejidad sobre conjuntos estándar, y el repositorio no enlaza ningún informe técnico asociado a este ajuste.

## Requisitos de hardware

- VRAM estimada para inferencia: ~5,7 GB en fp32, ~2,8 GB en bf16/fp16, ~1,4 GB en int8 y ~0,7-0,9 GB en int4 (pesos); añadir unos cientos de MB para caché KV con contexto de 2.048 tokens y lote pequeño.
- GPU recomendadas: cualquier GPU con 8 GB o más para bf16 (RTX 3060 Ti, RTX 4060, RTX 3070, L4); A100/H100 no son necesarias y quedarían infrautilizadas. Para fp32 sin cuantizar, 8-12 GB.
- Cabe holgadamente en GPU consumer: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 e incluso en iGPU con 16 GB de memoria unificada usando cuantización int4.
- Opciones de despliegue: `transformers` (ruta nativa), vLLM (`GPTNeoXForCausalLM`), Text Generation Inference (etiqueta `endpoints_compatible`), llama.cpp y Ollama previa conversión a GGUF con `convert-hf-to-gguf.py`.
- Latencia y throughput: no disponibles; no se han publicado mediciones. En términos orientativos de la familia, un modelo de 1,4B en bf16 sobre una RTX 4090 suele moverse en el orden de centenares a pocos miles de tokens por segundo con lote, pero este dato no está verificado para este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jaydeepb/pythia-1.4b-fineweb-run2` (este) | 1,41B | 2.048 (ajuste a 128) | Pythia-1.4B + 1 época sobre 1M secuencias de 128 tokens de FineWeb | Apache 2.0 | Repositorio propio, 0 descargas |
| `EleutherAI/pythia-1.4b` | 1,41B | 2.048 | Preentrenamiento sobre The Pile, 154 checkpoints publicados | Apache 2.0 | Muy extendido, ampliamente citado |
| `EleutherAI/pythia-1.4b-deduped` | 1,41B | 2.048 | Igual que el anterior sobre The Pile deduplicado | Apache 2.0 | Muy extendido |
| `EleutherAI/pythia-410m` | ~410M | 2.048 | Preentrenamiento sobre The Pile | Apache 2.0 | Extendido; alternativa si la VRAM es muy limitada |

Frente a los Pythia originales, este modelo no mejora capacidades: aporta un desplazamiento controlado de la distribución hacia FineWeb y una partición disjunta de datos pensada para experimentos de memorización. Frente a alternativas de tamaño similar orientadas a uso práctico (por ejemplo TinyLlama-1.1B o modelos de 1-2B instruidos), carece por completo de alineación y de plantilla de chat, por lo que no es sustituible en tareas de asistente. No se dispone de datos comparativos de rendimiento para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- Sin alineación: no hay RLHF, DPO ni ajuste a instrucciones, por lo que ignorará formatos de chat y producirá continuaciones de texto, no respuestas útiles.
- Riesgo de alucinación alto: con 1,4B parámetros y solo ~128M tokens de ajuste, la coherencia a largo plazo es muy limitada y los hechos generados no son fiables.
- Contexto efectivo degradado: aunque el base soporta 2.048 tokens, el ajuste con secuencias de 128 tokens puede deteriorar el comportamiento más allá de esa longitud; conviene validar la perplejidad por posición antes de usarlo con prompts largos.
- Idiomas: no se declaran idiomas soportados y el corpus FineWeb es mayoritariamente inglés; el rendimiento en castellano no está documentado y previsiblemente será pobre.
- Sesgos y contenido: FineWeb es una instantánea de web rastreada sin curación específica para este experimento, por lo que puede reflejar sesgos sociales, contenido tóxico y datos personales presentes en la web. No se documenta ningún filtrado adicional.
- Licencia: Apache 2.0 permite uso comercial y modificaciones, pero se heredan las condiciones del modelo base Pythia; no hay garantías ni soporte del autor.
- Naturaleza experimental: es un artefacto de investigación con 0 descargas y sin benchmarks; no debe desplegarse en producción orientada a usuario final.
- Confusión con su pareja run1: los dos modelos comparten base y receta y solo difieren en la muestra de datos. No deben usarse indistintamente ni como clasificador; son sujetos de evaluación, no herramientas de predicción.
- Sin datos de rendimiento ni de latencia publicados, cualquier estimación de coste en producción es especulativa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jaydeepb/pythia-1.4b-fineweb-run2
- Modelo base Pythia-1.4B: https://huggingface.co/EleutherAI/pythia-1.4b
- Repositorio del proyecto Pythia: https://github.com/EleutherAI/pythia
- Versión original v0 de Pythia-1.4B: https://huggingface.co/EleutherAI/pythia-1.4b-v0
- Dataset FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Ficha de referencia Pythia-1.4B (LLM Reference): https://www.llmreference.com/model/pythia-1.4b
- Análisis de Pythia-1.4B para despliegue autoalojado: https://llm.co/llms/pythia-1-4b

# michaelchenkj/mdlm-dclm-530m-53b

## Resumen

mdlm-dclm-530m-53b es un modelo de lenguaje de difusión enmascarada (masked diffusion language model, MDLM) de aproximadamente 530 millones de parámetros, publicado por el usuario michaelchenkj. El modelo reproduce el bloque OLMo-1 de 530M definido en el marco DataDecide de AllenAI (atención bidireccional más token de máscara) y lo entrena con el objetivo de difusión de estado absorbente sobre los mismos 53.000 millones de tokens únicos del dataset DCLM-baseline que su compañero autorregresivo datadecide-dclm-530m-53b. La motivación es doble: servir como punto de comparación controlado entre generación autorregresiva y generación por difusión bajo un mismo presupuesto de datos, y publicar el artefacto completo (checkpoints, optimizador, logs, evaluaciones y código) para reproducibilidad.

El repositorio, de 143,7 GB, no es un paquete de inferencia listo para producción: almacena los checkpoints crudos de entrenamiento en formato `.pt` (modelo más estado del optimizador) cada 1.000 pasos, junto con las evaluaciones EasyBench (métricas y generaciones por ejemplo) y los scripts de entrenamiento y evaluación. La arquitectura emplea `d=1344`, 16 capas, 16 cabezas, SwiGLU, RoPE y RMSNorm, con una longitud de secuencia de 2.048 tokens y un vocabulario de 50.280 tokens (embedding ampliado a 50.304, `mask id = 50280`).

Su relevancia actual es fundamentalmente investigadora: los modelos de difusión para texto son una alternativa emergente a la generación autorregresiva, permiten generación en cualquier orden y rellenado de huecos de forma nativa, y este checkpoint ofrece una comparación limpia contra un gemelo autorregresivo entrenado con exactamente los mismos datos. No obstante, se trata de un modelo base sin ajuste por instrucciones, sin benchmarks publicados en la model card y sin soporte en los motores de inferencia habituales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional con objetivo de difusión de máscara (MDLM/SMDM), estilo OLMo-1 530M |
| Parámetros totales | 530M (aproximadamente; incluye embedding de 50.304 × 1.344, unos 67,6M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantización | No disponible (no se publican versiones cuantizadas; solo checkpoints en punto flotante `.pt`) |
| Idiomas soportados | No disponible en la model card (el dataset DCLM-baseline es predominantemente en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pt` (diccionario `torch.save` con `step`, `model`, `optim` y estado de RNG); sin safetensors ni GGUF |
| Capas / dimensión | 16 capas, `d=1344`, 16 cabezas |
| Normalización / activación | RMSNorm, SwiGLU |
| Posicional | RoPE |
| Vocabulario | 50.280 tokens; embedding 50.304; `mask id = 50280` |
| Tamaño del repositorio | 143,7 GB (checkpoints cada 1.000 pasos; el checkpoint final pesa 6,7 GB) |
| Descargas / likes | 0 / 0 |
| Pipeline declarado | No disponible |

## Arquitectura y entrenamiento

El modelo es un transformer de 16 capas con atención bidireccional (no causal) y un token de máscara dedicado, entrenado con el objetivo de difusión de estado absorbente propio de MDLM/SMDM. El proceso de corrupción muestrea un tiempo `t ~ U[0,1]`, aplica una probabilidad de enmascarado `p = (1-ε)t + ε`, calcula la entropía cruzada únicamente sobre los tokens enmascarados dividida por `p`, y promedia sobre las dimensiones de batch y tiempo (B×T). A diferencia de los modelos autorregresivos, todos los tokens pueden predecirse condicionados al resto, lo que habilita generación en cualquier orden y rellenado nativo.

El entrenamiento consistió en una única pasada sobre los shards de DataDecide DCLM-baseline, cubriendo 53.000 millones de tokens únicos, con un total de 57.786 pasos, batch global de 448 (112 secuencias por GPU × 4 GPU), learning rate de 2,77e-3 con decaimiento coseno, 578 pasos de warmup y factor α=0,01, optimizador AdamW con betas 0,9/0,95 y weight decay 0,05. Se ejecutó sobre 4×H100 con semilla 6198. No se documenta ningún ajuste posterior por instrucciones, RLHF ni DPO, ni innovaciones como decodificación especulativa o atención lineal: las únicas particularidades técnicas son el propio paradigma de difusión y la correspondencia exacta con el bloque y el presupuesto de datos del modelo autorregresivo compañero.

## Capacidades

- Generación de texto no autorregresiva mediante muestreo iterativo de denoising (generación en cualquier orden).
- Rellenado de texto (infilling) e imputación de fragmentos arbitrarios, de forma nativa gracias al token de máscara.
- Estimación de verosimilitud y puntuación de secuencias mediante la cota ELBO del objetivo de difusión, útil para reranking.
- Modelado de lenguaje base: predicción de tokens enmascarados y continuaciones condicionadas a contexto de hasta 2.048 tokens.
- Entrenamiento y ajuste fino reproducible: el repositorio incluye `src/mdlm/` (modelo, pérdida de difusión, data loader), `scripts/train.py` y `scripts/launch.sh`.
- Evaluación integrada mediante EasyBench (métricas por paso y generaciones por ejemplo en `evals/`).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso (no hay modo *thinking* ni entrenamiento con instrucciones).
- No tiene capacidades de visión, audio ni multimodalidad.
- Capacidades multilingües: no documentadas; el corpus de entrenamiento es DCLM-baseline, de dominio mayoritariamente inglés.

## Casos de uso

- Investigación comparativa autorregresivo vs. difusión: entrenar y evaluar este modelo junto a su gemelo `datadecide-dclm-530m-53b` permite aislar el efecto del paradigma de generación con datos, tamaño y presupuesto de cómputo idénticos.
- Rellenado de texto y reparación de documentos: el token de máscara y la atención bidireccional permiten reconstruir pasajes borrados o corruptos en un documento de hasta 2.048 tokens sin necesidad de reescribir todo el texto posterior.
- Puntuación de verosimilitud para reranking: calcular ELBO sobre candidatos generados por otro sistema para ordenarlos o filtrarlos en tareas de generación aumentada por recuperación.
- Estudio de recetas de datos (DataDecide): al usar los shards `allenai/DataDecide-data-recipes`, sirve como punto de medida del efecto de distintas mezclas de datos sobre un objetivo de difusión en lugar de uno autorregresivo.
- Base para ajuste fino en tareas de secuencia: con 530M de parámetros y checkpoint con optimizador incluido, es viable continuar el entrenamiento en un dominio concreto (por ejemplo, texto científico o jurídico) en una sola GPU de 80 GB.
- Experimentos de destilación o inicialización: los 57 checkpoints intermedios guardados cada 1.000 pasos permiten estudiar trayectorias de entrenamiento, hacer *model souping* o inicializar modelos más pequeños.
- Docencia y divulgación técnica: el par de modelos (AR y difusión) con código y logs completos es material didáctico para explicar diferencias entre objetivos de entrenamiento en modelos de lenguaje.
- Generación con restricciones de orden: tareas donde el texto debe completarse respetando posiciones fijas (plantillas, formularios o estructuras con huecos) encajan mejor con un modelo de difusión que con uno causal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de perplejidad o ELBO, y los resultados de la búsqueda web no contienen información relacionada con este modelo. El repositorio sí incluye evaluaciones EasyBench en `evals/` (archivos `metrics.json`, `original.json` y generaciones `.jsonl` por paso), pero sus valores no se reproducen en la información proporcionada.

## Requisitos de hardware

- Pesos en precisión de entrenamiento: el checkpoint final ocupa 6,7 GB e incluye el estado del optimizador; los checkpoints intermedios son mayores al contener también los momentos de AdamW.
- Solo pesos del modelo en fp32: aproximadamente 2,1 GB; en bf16/fp16: aproximadamente 1,1 GB.
- VRAM estimada para inferencia en bf16: del orden de 2 a 4 GB para batch pequeño con secuencias de 2.048 tokens, ya que la atención bidireccional no permite caché KV y cada paso de denoising implica un forward completo sobre la secuencia.
- Entrenamiento o ajuste fino: el run original usó 4×H100; continuar el entrenamiento con el optimizador incluido requiere del orden de 8-10 GB solo para estados (dos momentos de AdamW más gradientes), más activaciones, por lo que una GPU de 40-80 GB es lo recomendable.
- Cabe en GPU de consumo: sí, para inferencia. Una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB o una RTX 4090 son suficientes para cargar los pesos y generar con batch pequeño.
- Opciones de despliegue: no hay soporte en vLLM, llama.cpp, Ollama ni TGI, ya que estos motores asumen generación autorregresiva con caché KV; el despliegue requiere PyTorch y el código de `src/mdlm/` incluido en el repositorio, o una implementación propia del bucle de denoising.
- Latencia y throughput: no disponible. Por diseño, la generación requiere múltiples pasos de refinamiento, cada uno con un forward sobre la secuencia completa, por lo que la latencia será superior a la de un modelo autorregresivo del mismo tamaño con caché KV.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Paradigma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| michaelchenkj/mdlm-dclm-530m-53b | 530M | 2.048 | Difusión enmascarada (MDLM) | Apache-2.0 | Checkpoints `.pt` crudos, sin cuantizaciones |
| michaelchenkj/datadecide-dclm-530m-53b | 530M | 2.048 | Autorregresivo | No disponible en la información | Modelo compañero, mismos 53B tokens DCLM |
| Otros modelos de difusión para texto (MDLM, LLaDA, SEDD y similares) | No disponible | No disponible | Difusión / masked diffusion | No disponible | No disponible en la información proporcionada |

La comparación más significativa es interna: ambos modelos comparten el bloque OLMo-1 530M, el dataset DCLM-baseline de 53B tokens y el mismo presupuesto de cómputo, de modo que cualquier diferencia de calidad debe atribuirse al objetivo de entrenamiento (difusión frente a autorregresivo). No se dispone de datos de rendimiento ni de licencia del modelo compañero en la información proporcionada, y no se han encontrado referencias a alternativas comparables en la búsqueda web.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no mantiene conversaciones, no sigue instrucciones complejas y no incluye plantilla de chat.
- Riesgo elevado de alucinación y de texto incoherente fuera de distribución, inherente a un objetivo de modelado de lenguaje entrenado sobre un único corpus de web crawl.
- Sesgos heredados de DCLM-baseline (contenido web filtrado automáticamente), no auditados ni documentados por el autor.
- Idiomas no documentados; el entrenamiento se realizó presumiblemente sobre un corpus mayoritariamente inglés, por lo que el rendimiento en castellano es incierto.
- Ventana de contexto limitada a 2.048 tokens, insuficiente para casos de uso con documentos largos o conversaciones multi-turno extensas.
- No hay versiones cuantizadas, GGUF o safetensors: los pesos solo se distribuyen como diccionarios `torch.save`, lo que implica deserialización con pickle y el consiguiente riesgo de ejecución de código si el fichero no es de confianza (considerar `weights_only=True`).
- El repositorio de 143,7 GB almacena todos los checkpoints intermedios con optimizador, lo que encarece el almacenamiento y la descarga; el autor no ofrece scripts de conversión a otros formatos.
- No se han publicado métricas de calidad en la model card, por lo que no es posible estimar su rendimiento relativo sin ejecutar las evaluaciones incluidas.
- Licencia Apache-2.0, que permite uso comercial del modelo, pero conviene verificar por separado las condiciones del dataset DCLM y de las recetas DataDecide utilizadas para el entrenamiento.
- La fecha de creación y actualización del repositorio indicada en los metadatos es el 18 de septiembre de 2026, dato a tener en cuenta al citar la ficha.
- Los resultados de la búsqueda web no contienen ninguna referencia al modelo: los enlaces devueltos corresponden a noticias sin relación con el proyecto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/michaelchenkj/mdlm-dclm-530m-53b
- Modelo autorregresivo compañero: https://huggingface.co/michaelchenkj/datadecide-dclm-530m-53b
- Dataset de recetas DataDecide: https://huggingface.co/datasets/allenai/DataDecide-data-recipes
- Codebase de DataDecide (OLMo): no disponible en la información proporcionada
- Paper de MDLM / SMDM: no disponible en la información proporcionada
- Demos o espacios: no disponible en la información proporcionada
- Nota: la búsqueda web realizada no devolvió resultados relacionados con este modelo; los enlaces obtenidos corresponden a noticias sin relación con el proyecto.

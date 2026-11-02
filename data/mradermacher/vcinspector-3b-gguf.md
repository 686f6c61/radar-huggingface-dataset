# mradermacher/VCInspector-3B-GGUF

## Resumen

VCInspector-3B es un modelo vision-lenguaje de 3.085.938.688 parámetros (aproximadamente 3,09 mil millones) desarrollado por dipta007 y especializado en la evaluación automática de descripciones de vídeo (video caption evaluation) sin referencia externa (reference-free). A diferencia de las métricas clásicas como CIDEr, BLEU o METEOR, que requieren una o varias descripciones humanas de referencia para puntuar una caption generada, VCInspector-3B analiza directamente el vídeo y la descripción candidata para emitir un juicio de calidad factual, lo que lo convierte en una herramienta útil para pipelines de entrenamiento y evaluación de modelos de captioning de vídeo.

El modelo se distribuye originalmente en HuggingFace bajo el identificador `dipta007/VCInspector-3B` y esta ficha describe la versión cuantizada publicada por mradermacher como `mradermacher/VCInspector-3B-GGUF`, que ofrece el modelo en formato GGUF con múltiples niveles de cuantización (desde Q2_K hasta f16) junto con el proyector multimodal (mmproj) necesario para el procesamiento de vídeo. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales significativas.

La relevancia actual del modelo radica en que la evaluación de captions de vídeo sin referencias es un problema abierto: los evaluadores automáticos tradicionales correlacionan mal con el juicio humano cuando las captions son diversas o cuando no existen referencias. VCInspector-3B aborda este problema con un enfoque multimodal que inspecciona el contenido visual del vídeo y verifica la fidelidad factual de la descripción, y su empaquetado en GGUF lo hace desplegable en hardware de consumo mediante llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje multimodal (transformer, detalles específicos no disponibles) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base `dipta007/VCInspector-3B` más allá de que se trata de un modelo multimodal vision-lenguaje de aproximadamente 3,09 mil millones de parámetros, empaquetado para su uso con transformers y cuantizado a GGUF. El modelo procesa entradas de vídeo (a través del proyector multimodal mmproj) junto con texto, y está diseñado específicamente para la tarea de evaluación de captions de vídeo sin referencia.

El modelo fue entrenado o ajustado utilizando el dataset `dipta007/ActivityNet-FG-It`, según los metadatos de la model card, y está asociado al paper arXiv 2509.16538. No se dispone de información sobre el número de tokens de entrenamiento, la composición completa del dataset, ni si se aplicaron técnicas de RLHF o DPO. La cuantización fue realizada por mradermacher con el formato estándar de llama.cpp, incluyendo variantes estáticas (este repositorio) y variantes con imatrix en el repositorio `mradermacher/VCInspector-3B-i1-GGUF`.

## Capacidades

- Evaluación de captions de vídeo sin referencia: puntúa la fidelidad factual de una descripción respecto al contenido visual del vídeo.
- Análisis multimodal: procesa vídeo e imagen junto con texto mediante el proyector multimodal (mmproj).
- Verificación de hechos en descripciones: detecta inexactitudes o alucinaciones en captions generadas.
- Comprensión de visión-lenguaje: capacidad general de razonamiento sobre contenido visual.
- Conversacional: etiquetado como modelo conversacional en HuggingFace.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: limitadas al inglés según los metadatos.

## Casos de uso

- Evaluación automática de pipelines de captioning de vídeo: el modelo permite puntuar captions generadas por otros modelos sin necesidad de referencias humanas, integrándose en un bucle de evaluación continua durante el entrenamiento o en la selección de checkpoints.
- Filtrado de datos de entrenamiento: dado un corpus de vídeos con captions generadas automáticamente, VCInspector-3B puede detectar descripciones factualmente incorrectas y descartarlas antes de usarlas para entrenar modelos de captioning.
- Control de calidad en plataformas de vídeo: verificación de descripciones y metadatos generados automáticamente para detectar alucinaciones antes de publicarlos.
- Investigación en métricas de evaluación: sustitución o complemento de métricas clásicas (CIDEr, BLEU, METEOR) en experimentos académicos que requieren evaluación reference-free.
- Benchmarking de modelos de vídeo-lenguaje: comparación de distintos generadores de captions usando un evaluador único y consistente.
- Despliegue local en hardware de consumo: gracias a las cuantizaciones GGUF de 1,4-3,4 GB, puede ejecutarse en portátiles y estaciones de trabajo sin GPU dedicada mediante llama.cpp u Ollama para tareas de evaluación por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2,5 GB con cuantizaciones Q2_K a Q4_K_M (más el mmproj de 0,9-1,4 GB), y hasta 6-7 GB con f16.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4; RTX 3060, RTX 4060, RTX 4090 o superiores para mayor throughput.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas e incluso en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base puede usarse con transformers.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| VCInspector-3B (este) | 3,09 B | No disponible | Apache 2.0 | GGUF, safetensors | Evaluación de captions de vídeo reference-free |
| Modelos de captioning de vídeo genéricos (p. ej. basados en BLIP-2) | Variable | Variable | Variable | Variable | Generan captions, no las evalúan |
| Métricas clásicas (CIDEr, BLEU, METEOR) | No aplica | No aplica | No aplica | No aplica | Requieren referencias humanas |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas directas de evaluación reference-free de captions de vídeo.

## Limitaciones y advertencias

- El modelo solo soporta inglés según los metadatos; no se garantiza un rendimiento adecuado en otros idiomas.
- Al ser un evaluador basado en un modelo de lenguaje, puede presentar sesgos heredados de sus datos de entrenamiento y producir juicios inconsistentes en casos ambiguos.
- Riesgo de alucinación en la propia evaluación: el modelo podría emitir puntuaciones o justificaciones incorrectas sobre el contenido del vídeo.
- La longitud de contexto no está documentada, lo que limita la planificación de evaluaciones con vídeos largos o captions extensas.
- El modelo está especializado en una tarea concreta (evaluación de captions); su uso como modelo generalista de visión-lenguaje no está validado.
- Aunque la licencia Apache 2.0 permite uso comercial, conviene verificar las condiciones del modelo base y del dataset de entrenamiento antes de un despliegue en producción.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar la calidad de los juicios de evaluación; se recomienda Q4_K_M o superior para uso en producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/VCInspector-3B-GGUF
- Modelo base: https://huggingface.co/dipta007/VCInspector-3B
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/VCInspector-3B-i1-GGUF
- Paper (arXiv): https://arxiv.org/abs/2509.16538
- Dataset: https://huggingface.co/datasets/dipta007/ActivityNet-FG-It
- Página de descargas del autor: https://hf.tst.eu/model#VCInspector-3B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

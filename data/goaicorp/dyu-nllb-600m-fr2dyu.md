# goaicorp/dyu-nllb-600M-fr2dyu

## Resumen

El modelo `goaicorp/dyu-nllb-600M-fr2dyu` es un ajuste fino (fine-tune) del modelo multilingüe NLLB-200 destilado de Facebook, especializado en la traducción unidireccional del francés (fr) al dioula (dyu), una lengua mandé hablada principalmente en Burkina Faso, Costa de Marfil y Malí. Lo desarrolla goaicorp, un proyecto centrado en tecnologías lingüísticas para lenguas de bajos recursos, y resuelve un problema concreto: la práctica ausencia de sistemas de traducción automática de calidad para el dioula, idioma con escasa representación en corpus paralelos digitales.

Técnicamente es un transformer encoder-decoder de tipo M2M-100 con 615.073.792 parámetros totales, derivado de la arquitectura NLLB-200-distilled-600M, y está empaquetado en formato safetensors para su uso con la librería transformers. El modelo se ha entrenado sobre el dataset `goaicorp/dyu-fr-parallel` y se distribuye con licencia CC-BY-SA 4.0, lo que permite uso comercial con atribución y obligación de compartir bajo la misma licencia.

Su relevancia radica en que cubre una dirección de traducción (fr→dyu) que los modelos multilingües generalistas suelen resolver con calidad baja, y lo hace con un tamaño reducido que permite desplegarlo en hardware modesto. El acceso está restringido (gated) en HuggingFace, por lo que es necesario aceptar las condiciones del autor antes de descargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (M2M-100 / NLLB-200 destilado) |
| Parametros totales | 615.073.792 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantizacion estandar via transformers/bitsandbytes, no documentada por el autor) |
| Idiomas soportados | fr (frances), dyu (dioula) |
| Licencia | CC-BY-SA 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura M2M-100 de NLLB-200, un transformer encoder-decoder con atención multi-cabeza estándar, diseñado originalmente para traducción multilingüe many-to-many. La variante destilada de 600M reduce el número de capas y la dimensión respecto al NLLB-200 completo, manteniendo el vocabulario multilingüe y los tokens de identificador de idioma que permiten seleccionar el par de traducción en tiempo de inferencia.

El ajuste fino se ha realizado sobre el dataset `goaicorp/dyu-fr-parallel`, un corpus paralelo francés-dioula creado por el mismo autor. No se dispone de información pública sobre el número exacto de tokens de entrenamiento, la composición detallada del dataset, ni si se aplicaron técnicas de RLHF, DPO o decodificación especulativa. Tampoco se documentan innovaciones técnicas adicionales más allá del propio ajuste fino supervisado sobre el modelo base.

## Capacidades

- Traducción automática unidireccional de francés a dioula.
- Generación de texto seq2seq mediante la pipeline `translation` de transformers.
- Uso de tokens de identificador de idioma (`fra_Latn` y `dyu_Latn`) para fijar el par de traducción.
- Compatible con endpoints de HuggingFace (tag `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni modo thinking.
- No se documentan capacidades de visión, audio ni multimodalidad.
- Capacidades multilingües limitadas a los dos idiomas del par (fr y dyu); no se garantiza buen rendimiento en otras direcciones.

## Casos de uso

- Traducción de documentación administrativa y sanitaria al dioula: el modelo permite convertir materiales escritos en francés (folletos, formularios, guías) a dioula para comunidades que usan esta lengua como vehículo principal, aprovechando que el modelo está específicamente ajustado para ese par.
- Localización de contenido web y aplicaciones móviles: integración en pipelines de traducción para versionar interfaces o contenidos editoriales destinados a Burkina Faso, Malí y Costa de Ivoria, donde el dioula tiene presencia significativa.
- Subtitulado y transcripción traducida: combinado con un sistema ASR en francés, el modelo puede generar subtítulos en dioula para vídeos educativos o institucionales.
- Atención al cliente en contextos bilingües: un chatbot que reciba consultas en francés puede producir respuestas en dioula para usuarios que prefieran esa lengua, con la ventaja de un modelo de 600M que cabe en infraestructura modesta.
- Investigación lingüística y creación de corpus: el modelo sirve como herramienta de generación de traducciones preliminares que luego pueden ser revisadas por hablantes nativos, acelerando la creación de corpus paralelos adicionales para el dioula.
- Preservación y difusión cultural: traducción de textos literarios, religiosos o tradicionales del francés al dioula para su publicación en comunidades locales, con la salvedad de que requiere revisión humana por la baja disponibilidad de datos de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,5 GB solo para pesos, más memoria de activaciones y KV cache (estimación típica de 4-6 GB en fp32 para secuencias de longitud moderada).
- VRAM estimada en fp16/bf16: aproximadamente 1,3 GB para pesos, con un total práctico de 2-4 GB.
- VRAM estimada en int8: aproximadamente 0,7 GB para pesos, con un total práctico de 1,5-3 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060) es suficiente; para mayor throughput, A100, H100 o RTX 4090.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU consumer modernas con 4 GB o más.
- Opciones de despliegue: transformers (pipeline `translation`), HuggingFace Inference Endpoints (tag `endpoints_compatible`), vLLM y TGI (compatibilidad no documentada explícitamente por el autor), llama.cpp/Ollama (no aplica de forma nativa a arquitectura M2M-100; requeriría conversión a GGUF no documentada).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| goaicorp/dyu-nllb-600M-fr2dyu | 615 M | no disponible | fr, dyu | CC-BY-SA 4.0 | Gated en HuggingFace |
| facebook/nllb-200-distilled-600M | 615 M | 512 tokens (por defecto en NLLB) | 200 idiomas | CC-BY-NC 4.0 | Público en HuggingFace |
| facebook/nllb-200-1.3B | 1,3 B | 512 tokens | 200 idiomas | CC-BY-NC 4.0 | Público en HuggingFace |
| facebook/m2m100_418M | 418 M | 1024 tokens | 100 idiomas | MIT | Público en HuggingFace |

El modelo de goaicorp se distingue por estar especializado en un par de bajos recursos (fr→dyu) y por una licencia permisiva para uso comercial (CC-BY-SA 4.0), frente a la licencia no comercial de los NLLB originales de Meta. Sin embargo, su cobertura lingüística es mucho más estrecha y no se dispone de métricas públicas que permitan comparar su calidad con los modelos base.

## Limitaciones y advertencias

- Modelo unidireccional: solo traduce de francés a dioula; no se ha entrenado para la dirección inversa.
- Acceso restringido (gated): es necesario aceptar las condiciones del autor en HuggingFace antes de descargar los pesos.
- Dataset de entrenamiento no documentado en detalle: se desconoce el volumen, la procedencia y la calidad del corpus `goaicorp/dyu-fr-parallel`, lo que impide evaluar sesgos y cobertura.
- Riesgo de alucinación y errores de traducción: al ser un modelo pequeño ajustado sobre un corpus presumiblemente limitado, es probable que produzca traducciones inexactas o inconsistentes, especialmente en terminología técnica.
- Sin benchmarks públicos: no hay métricas BLEU, chrF ni evaluaciones humanas publicadas, por lo que la calidad real no puede verificarse de forma independiente.
- Licencia CC-BY-SA 4.0: permite uso comercial, pero obliga a atribuir y a compartir las obras derivadas bajo la misma licencia, lo que puede ser incompatible con productos propietarios.
- Sin soporte documentado de tool calling, agentes ni modo thinking: no es adecuado para tareas de razonamiento complejo.
- Contexto máximo no especificado: se desconoce si mantiene los 512 tokens típicos de NLLB o si se ha modificado.
- Repositorio de 36,9 GB: el tamaño del repo es desproporcionado respecto a los 615M de parámetros, probablemente por incluir múltiples checkpoints o artefactos de entrenamiento; conviene revisar los archivos antes de descargar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/goaicorp/dyu-nllb-600M-fr2dyu
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-600M
- Dataset de entrenamiento: https://huggingface.co/datasets/goaicorp/dyu-fr-parallel
- Paper NLLB-200: https://arxiv.org/abs/2207.04672
- Paper M2M-100: https://arxiv.org/abs/2010.11125
- Repositorio NLLB en GitHub: https://github.com/facebookresearch/fairseq/tree/nllb

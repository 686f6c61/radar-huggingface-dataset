# AfriSpeech/afrigloss-opus-mt-fr-sn

## Resumen

AfriSpeech/afrigloss-opus-mt-fr-sn es un modelo de traducción automática francés-shona desarrollado por AfriSpeech dentro del marco Afri-Gloss-MT. Se trata de un fine-tuning de MarianMT orientado a un caso de uso muy específico: la traducción con restricciones terminológicas inyectadas en el texto origen mediante marcadores entre corchetes angulares (`<termino>`), de forma que el término objetivo se preserve en la salida.

El modelo resuelve el problema de la inconsistencia terminológica en traducción especializada: permite forzar glosarios (por ejemplo, nombres propios, términos técnicos o léxico normalizado) sin necesidad de reentrenar ni de postprocesar la salida. Con 75,8 millones de parámetros y un repositorio de 0,3 GB, está pensado para despliegue ligero en CPU o GPU modesta, con latencia baja.

Es relevante ahora porque las lenguas africanas siguen estando infrarrepresentadas en los sistemas de traducción comerciales, y este modelo aborda simultáneamente la cobertura lingüística (shona) y el control terminológico, dos requisitos habituales en localización institucional, editorial y de preservación lingüística.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (MarianMT) |
| Parámetros totales | 75.795.726 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; compatible con cuantización estándar de transformers, no verificada por el autor) |
| Idiomas soportados | francés (fr) como origen, shona (sna) como destino |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un MarianMT estándar, es decir, un transformer encoder-decoder con atención completa, optimizado originalmente para traducción automática neuronal y caracterizado por su bajo coste computacional. El fine-tuning se realizó sobre el subconjunto `sn` del dataset AfriSpeech/gloss-mt-train-fr, construido a partir de corpus paralelos de AfriSpeech/africa-corpus y AfriSpeech/african-corpus-jw con sustituciones verificadas de segmentos nominales en contexto (100 % verificadas según la model card).

La innovación técnica no está en la arquitectura sino en el paradigma de entrenamiento: el modelo aprende a copiar términos objetivo insertados en el origen entre corchetes angulares, de modo que en inferencia puede recibir un glosario dinámico sin reentrenamiento (control terminológico zero-shot). La model card indica entrenamiento "hasta convergencia" sobre el bitexto completo multi-versión, pero no especifica el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no procede en un modelo de traducción de este tipo). No se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Traducción automática francés → shona con salida fluida.
- Control terminológico zero-shot: acepta términos objetivo inyectados en el origen entre corchetes angulares (`<termino>`) y los preserva en la traducción.
- Integración con glosarios o diccionarios externos emparejados automáticamente sobre el texto origen.
- Decodificación por búsqueda en haz (beam search) configurable (el ejemplo de la model card usa `num_beams=4`).
- Inferencia ligera en CPU y GPU.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- Cobertura multilingüe limitada al par fr-sna.

## Casos de uso

- Localización institucional con terminología normalizada: inserción de un glosario oficial (topónimos, cargos, nombres de organismos) en el texto francés antes de traducir, garantizando que la salida shona respete la terminología aprobada.
- Traducción de documentación técnica y manuales: los términos técnicos pueden fijarse mediante corchetes angulares para evitar variación terminológica entre secciones.
- Preservación de nombres propios y entidades: el mecanismo de inyección permite marcar antropónimos y topónimos para que no se traduzcan ni se deformen, un problema frecuente en pares de baja资源.
- Publicación editorial y traducción de contenidos religiosos o educativos: el modelo se entrenó sobre corpus que incluyen material de este tipo (african-corpus-jw), adecuado para textos con léxico recurrente y glosarios establecidos.
- Pipelines de preedición-traducción-posticción: el traductor humano puede preanotar el origen con los términos deseados y el modelo genera un borrador ya alineado con el glosario del cliente.
- Servicios de traducción en tiempo real con recursos limitados: sus 75,8 M de parámetros permiten ejecución en CPU con latencia baja, apto para APIs de traducción de bajo coste o entornos sin GPU.
- Investigación en control terminológico para lenguas africanas: sirve como línea base reproducible para comparar estrategias de restricción léxica en marian/opus-mt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas BLEU, chrF, COMET ni comparaciones cuantitativas con otros sistemas.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 0,3 GB de pesos (75,8 M de parámetros); en fp16, alrededor de 0,15 GB. El pico real depende de la longitud de secuencia y del tamaño de lote.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo es viable en GTX 1650, RTX 3050, RTX 4090, A100 o H100 sin problemas de capacidad.
- Cabe holgadamente en GPU de consumo y también en CPU: es un modelo diseñado para inferencia ligera.
- Opciones de despliegue: `transformers` (MarianMTModel/MarianTokenizer), servidores de inferencia compatibles con modelos Marian (por ejemplo, Hugging Face TGI no soporta Marian de forma nativa; sí es habitual servirlo con FastAPI + transformers o con ctranslate2 tras conversión). Compatibilidad con llama.cpp/Ollama no disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada; la model card solo afirma inferencia "rápida y ligera" en CPU y GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| AfriSpeech/afrigloss-opus-mt-fr-sn | 75,8 M | no disponible | fr → sna | Apache 2.0 | Control terminológico por inyección de glosario |
| Helsinki-NLP/opus-mt-fr-sn (si existe) | no disponible | no disponible | fr → sna | no disponible | MarianMT genérico sin control de glosario; existencia no verificada en la información disponible |
| NLLB-200 (variante destilada 600M) | 600 M | 512 tokens (referencia general de la familia) | 200 lenguas, incluye sna | CC-BY-NC 4.0 | Mayor cobertura multilingüe, pero licencia no comercial y sin control terminológico nativo |
| M2M-100 (418M) | 418 M | no disponible | 100 lenguas | MIT | Multilingüe, sin mecanismo de glosario; rendimiento en shona no verificado |

Los datos de las filas comparativas corresponden a características generales de esas familias y no a evaluaciones directas frente a este modelo; no se dispone de comparaciones benchmark publicadas.

## Limitaciones y advertencias

- Par de idiomas único (fr → sna); no soporta traducción inversa ni otros pares.
- El control terminológico depende de que el término se inyecte correctamente entre corchetes angulares; un marcado mal formado o ambiguo puede degradar la fluidez o la fidelidad.
- Riesgo de alucinación y de omisión en frases largas o con estructuras sintácticas complejas, habitual en modelos Marian de este tamaño.
- No se documentan evaluaciones de sesgo; al entrenarse sobre corpus paralelos concretos (incluido material de african-corpus-jw), puede heredar sesgos de dominio y de registro de esas fuentes.
- Longitud de contexto no especificada: no se recomienda para documentos de entrada muy largos sin segmentación previa.
- Licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones de los corpus de entrenamiento subyacentes antes de un despliegue en producción.
- Sin métricas publicadas de calidad: la adopción en producción requiere una evaluación propia con un conjunto de referencia en shona.
- El modelo se publicó con fecha de creación 2026-10-27 y 18 descargas; la madurez y el soporte de la comunidad son limitados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AfriSpeech/afrigloss-opus-mt-fr-sn
- Dataset de entrenamiento: https://huggingface.co/datasets/AfriSpeech/gloss-mt-train-fr
- Colección Afri-Gloss-MT: https://huggingface.co/collections/AfriSpeech/afri-gloss-mt-models-6adce3a3c13c6a86f07b6e6d
- Corpus AfriSpeech: https://huggingface.co/AfriSpeech/africa-corpus
- Corpus AfriSpeech JW: https://huggingface.co/AfriSpeech/african-corpus-jw
- Cita: Owusu, Mich-Seth, "Afri-Gloss-MT: In-Place Glossary Constraints for African Machine Translation", arXiv preprint, 2026 (sin identificador de arXiv disponible)

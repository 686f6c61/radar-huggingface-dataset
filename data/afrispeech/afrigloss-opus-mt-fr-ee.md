# AfriSpeech/afrigloss-opus-mt-fr-ee

## Resumen

AfriSpeech/afrigloss-opus-mt-fr-ee es un modelo de traducción automática francés → ewé desarrollado por AfriSpeech dentro del marco Afri-Gloss-MT. Se trata de un fine-tuning de la arquitectura MarianMT (transformer encoder-decoder) orientado a un caso de uso muy concreto: la traducción con restricciones terminológicas inyectadas en el texto de origen. El modelo permite insertar términos objetivo entre corchetes angulares (`<termino>`) en la frase fuente y preservarlos en la salida, lo que resuelve el problema clásico de la inconsistencia terminológica en dominios especializados cuando se traduce hacia lenguas de bajos recursos.

El modelo cuenta con 75.030.843 parámetros (aproximadamente 75 millones) y un repositorio de 0,3 GB en formato safetensors. Está publicado bajo licencia Apache 2.0, lo que facilita su uso comercial, y se distribuye a través de Hugging Face con el pipeline `translation`. Su relevancia actual radica en que aborda la traducción especializada hacia ewé, una lengua gbe hablada en Ghana y Togo, para la que existen pocos recursos y menos aún con control terminológico.

La propuesta se enmarca en la colección Afri-Gloss-MT Models, que agrupa modelos con la misma filosofía para distintas combinaciones de lenguas africanas. El modelo está entrenado sobre el subconjunto `ee` del dataset `AfriSpeech/gloss-mt-train-fr`, derivado de corpus paralelos multiversión de `AfriSpeech/africa-corpus` y `AfriSpeech/african-corpus-jw`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MarianMT (transformer encoder-decoder) |
| Parametros totales | 75.030.843 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | francés (fr), ewé (ewe) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en MarianMT, una arquitectura transformer encoder-decoder diseñada originalmente para traducción automática neuronal eficiente. Con unos 75 millones de parámetros, es un modelo compacto pensado para inferencia rápida tanto en CPU como en GPU. La innovación principal no reside en la arquitectura sino en el esquema de entrenamiento: el modelo ha sido fine-tuneado para aceptar términos objetivo inyectados en la frase fuente entre corchetes angulares y reproducirlos de forma fiel en la traducción generada.

El entrenamiento se realizó sobre el subconjunto `ee` del dataset `AfriSpeech/gloss-mt-train-fr`, construido a partir de corpus paralelos multiversión de `AfriSpeech/africa-corpus` y `AfriSpeech/african-corpus-jw`. La model card indica que el fine-tuning se llevó a cabo «hasta convergencia» sobre bitexto completo con reemplazos in-place de segmentos nominales verificados al 100 %. No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (poco habituales en traducción automática).

## Capacidades

- Traducción automática francés → ewé con calidad de producción para dominios generales y especializados.
- Control terminológico zero-shot: acepta términos objetivo entre corchetes angulares en la frase fuente y los preserva en la salida.
- Traducción de frases con múltiples términos inyectados de forma simultánea.
- Inferencia ligera y rápida gracias al tamaño compacto del modelo (75 M de parámetros).
- Despliegue en CPU y GPU sin requisitos de hardware especializados.
- Integración directa con la librería `transformers` mediante `MarianMTModel` y `MarianTokenizer`.
- Búsqueda por haces configurable (`num_beams`) para mejorar la calidad de la traducción.
- No dispone de soporte documentado de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Traducción de documentación técnica y manuales hacia ewé: el modelo permite fijar la terminología específica del dominio (por ejemplo, términos médicos, legales o técnicos) inyectándolos entre corchetes angulares, garantizando consistencia entre documentos.
- Localización de interfaces y software: integrado en pipelines de localización, permite traducir cadenas de UI manteniendo términos de producto o marca sin traducir mediante la inyección controlada.
- Traducción de contenido institucional y administrativo: para organismos que publican material en francés y necesitan versiones en ewé con terminología oficial consistente, el control de glosario evita variaciones no deseadas.
- Atención al cliente multilingüe: el modelo puede traducir consultas y respuestas en un sistema de soporte para hablantes de ewé, con terminología de producto fijada de antemano.
- Investigación lingüística y documentación de lenguas de bajos recursos: útil para generar corpus paralelos controlados y estudiar el comportamiento de la terminología en traducción automática hacia lenguas gbe.
- Traducción de material educativo: permite adaptar contenidos pedagógicos del francés al ewé manteniendo términos curriculares y científicos con precisión terminológica.
- Preprocesamiento en pipelines de datos multilingües: como modelo ligero, puede emplearse para generar traducciones a gran escala en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 300 MB de pesos, más overhead de activaciones; en la práctica, menos de 1 GB de VRAM total.
- VRAM estimada en FP16: aproximadamente 150 MB de pesos.
- Cabe holgadamente en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) e incluso en CPU.
- GPU recomendadas: cualquiera con al menos 2 GB de VRAM; no requiere A100 ni H100.
- Despliegue: compatible con `transformers` (PyTorch), y por la arquitectura MarianMT es convertible a GGUF para llama.cpp/Ollama, aunque la model card no documenta este flujo. También puede servirse con TGI o vLLM, si bien estos frameworks están más orientados a modelos grandes.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia de milisegundos por frase en GPU moderna y decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| AfriSpeech/afrigloss-opus-mt-fr-ee | 75 M | no disponible | fr → ee | Apache 2.0 | Traducción con glosario inyectado |
| Helsinki-NLP/opus-mt-fr-ee | no disponible | no disponible | fr → ee | CC-BY 4.0 (habitual en OPUS-MT) | Traducción general sin control terminológico |
| NLLB-200 (200M) | 200 M (variante destilada) | 512 tokens | 200 lenguas (incluye ee) | CC-BY-NC 4.0 | Traducción multilingüe general |
| M2M-100 (418M) | 418 M | 1024 tokens | 100 lenguas | MIT | Traducción multilingüe general |

La ventaja diferencial del modelo de AfriSpeech frente a alternativas generalistas es el control terminológico explícito, que los modelos genéricos no ofrecen de forma nativa. Como contrapartida, su cobertura se limita a un único par de lenguas y no dispone de benchmarks publicados que permitan comparar su calidad de traducción con las alternativas.

## Limitaciones y advertencias

- Solo cubre el par francés → ewé; no soporta otras direcciones ni otras lenguas.
- No se han publicado métricas de calidad (BLEU, chrF, COMET) en la información disponible, por lo que la calidad real de traducción no puede verificarse objetivamente.
- El mecanismo de glosario depende de la sintaxis exacta `<termino>`; un uso incorrecto de los corchetes puede degradar la salida.
- Riesgo de alucinación y de omisión de términos inyectados en frases largas o con estructuras sintácticas complejas, no cuantificado en la información disponible.
- Posibles sesgos derivados de los corpus de entrenamiento (`africa-corpus`, `african-corpus-jw`), cuya composición y balance no se detallan.
- La longitud de contexto no está documentada; en MarianMT suele ser limitada (típicamente 512 tokens), lo que restringe la traducción de documentos largos sin segmentación previa.
- Aunque la licencia Apache 2.0 permite uso comercial, conviene verificar las licencias de los corpus de entrenamiento subyacentes antes de un despliegue en producción.
- Modelo con muy pocas descargas (17) y sin likes en el momento de la consulta: escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AfriSpeech/afrigloss-opus-mt-fr-ee
- Colección Afri-Gloss-MT Models: https://huggingface.co/collections/AfriSpeech/afri-gloss-mt-models-6adce3a3c13c6a86f07b6e6d
- Dataset de entrenamiento: https://huggingface.co/datasets/AfriSpeech/gloss-mt-train-fr
- Paper de referencia (citado en la model card): Owusu, Mich-Seth, «Afri-Gloss-MT: In-Place Glossary Constraints for African Machine Translation», arXiv preprint, 2026 (sin enlace directo disponible en la información proporcionada).

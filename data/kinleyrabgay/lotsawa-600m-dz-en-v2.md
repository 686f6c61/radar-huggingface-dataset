# kinleyrabgay/lotsawa-600m-dz-en-v2

## Resumen

Lotsawa-600M-dz-en-v2 es un modelo de traducción automática neuronal especializado en el par de idiomas dzongkha (idioma nacional de Bután) e inglés. Desarrollado por Kinley Rabgay, se trata de un fine-tune del modelo `facebook/nllb-200-distilled-600M` de Meta, entrenado sobre 232.489 pares de frases traducidas por humanos en ambas direcciones (dzongkha→inglés e inglés→dzongkha) como un único modelo. El objetivo declarado por el autor es el uso en producción diaria, priorizando la utilidad práctica frente a resultados de benchmarks.

El modelo tiene 615 millones de parámetros y se distribuye en formato safetensors bajo licencia MIT, lo que permite su uso comercial sin restricciones. Su relevancia radica en cubrir un par de idiomas de bajos recursos (dzongkha-inglés) con una arquitectura probada y un tamaño contenido, facilitando su despliegue en entornos con recursos limitados. La versión v2 indica una iteración sobre versiones anteriores del mismo autor, como `nllb-200-600M-dzo-eng-300k` y `nllb-200-600M-dzo-eng-50k`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (basado en NLLB-200 distilled 600M) |
| Parametros totales | 615.073.792 (615M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada de NLLB-200, tipicamente 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | dzongkha (dz) e ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura NLLB-200 distilled 600M de Meta, un transformer encoder-decoder con mecanismo de atención estándar, diseñado originalmente para traducción multilingüe entre 200 idiomas. La versión destilada reduce el tamaño del modelo original (que supera los 3.000 millones de parámetros) a 600 millones, priorizando la eficiencia computacional y la latencia de inferencia.

El entrenamiento consistió en un fine-tune supervisado sobre el corpus `kinleyrabgay/dz_to_en`, compuesto por 232.489 pares de frases traducidas por humanos. El modelo se entrenó en ambas direcciones de traducción (dz→en y en→dz) de forma conjunta, lo que permite un único checkpoint para los dos sentidos. No se menciona el uso de técnicas de RLHF o DPO; el entrenamiento es puramente supervisado sobre datos paralelos. Tampoco se especifica el número de épocas ni la configuración exacta de hiperparámetros.

## Capacidades

- Traducción automática bidireccional dzongkha-inglés e inglés-dzongkha.
- Generación de texto en ambos idiomas con fluidez razonable para dominios generales.
- Manejo de frases cotidianas y vocabulario de uso diario, dado el corpus de entrenamiento orientado a producción.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni visión.
- Capacidad multilingüe limitada al par dz-en; no conserva la cobertura de los 200 idiomas del modelo base.
- No se indica soporte de modo thinking ni procesamiento de audio.

## Casos de uso

- Traducción de documentos administrativos en Bután: el modelo puede traducir formularios, notificaciones y comunicaciones oficiales entre dzongkha e inglés, facilitando la interoperabilidad gubernamental.
- Atención al cliente bilingüe: integración en sistemas de chat o correo para traducir consultas de usuarios que escriben en dzongkha al inglés (o viceversa) en tiempo real, gracias a su tamaño reducido que permite baja latencia.
- Localización de aplicaciones móviles: traducción de cadenas de interfaz de usuario y mensajes de error para apps dirigidas al mercado butanés.
- Subtitulado de vídeo: generación de subtítulos en inglés para contenido original en dzongkha, o al revés, en plataformas de vídeo bajo demanda.
- Asistencia en educación bilingüe: traducción de materiales didácticos y ejercicios para escuelas donde se imparte enseñanza en ambos idiomas.
- Extracción de información de noticias locales: traducción automática de artículos de prensa dzongkha a inglés para agregadores de noticias o análisis de sentimiento.
- Traducción de contenido generado por usuarios en redes sociales: moderación y análisis de comentarios en dzongkha para plataformas con presencia en Bután.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica en el repositorio que el objetivo es el uso en producción diaria más que obtener cifras de evaluación, por lo que no hay métricas BLEU, chrF ni comparativas con otros sistemas de traducción para este par de idiomas.

## Requisitos de hardware

- Al tratarse de un modelo de 615M parámetros, la VRAM necesaria para inferencia en precisión fp32 es de aproximadamente 2,5 GB; en fp16 se reduce a unos 1,3 GB.
- Es ejecutable en GPUs de consumo como NVIDIA RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores, así como en GPUs de datacenter como A10, A100 o H100.
- También puede ejecutarse en CPU con cuantización (por ejemplo, con llama.cpp o CTranslate2), aunque con mayor latencia.
- Opciones de despliegue: Transformers de Hugging Face, vLLM (si se adapta a arquitectura seq2seq), CTranslate2, ONNX Runtime, o servidores de inferencia como TGI.
- No se dispone de datos de latencia o throughput medidos por el autor; al ser un modelo destilado, se espera un rendimiento superior al NLLB-200 completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| lotsawa-600m-dz-en-v2 | 615M | no disponible | dz, en | MIT | Fine-tune de NLLB-200 distilled, entrenado en ambas direcciones |
| kinleyrabgay/nllb-200-600M-dzo-eng-300k | 615M | no disponible | dz, en | MIT | Fine-tune sobre corpus completo (~225K pares) |
| kinleyrabgay/nllb-200-600M-dzo-eng-50k | 615M | no disponible | dz, en | MIT | Fine-tune sobre subconjunto de 50K pares |
| facebook/nllb-200-distilled-600M | 615M | 512 (tipico) | 200 idiomas | CC-BY-NC | Modelo base, no especializado en dz-en |

La comparativa muestra que las variantes del mismo autor se diferencian principalmente en el volumen de datos de entrenamiento y en la dirección de entrenamiento. El modelo v2 es el más reciente y el único que entrena ambas direcciones de forma conjunta. Frente al modelo base de Meta, la ventaja es la especialización en dzongkha, aunque se pierde la cobertura multilingüe.

## Limitaciones y advertencias

- Sesgos del corpus: al ser un conjunto de datos de traducción humana limitado (232K pares), el modelo puede reflejar sesgos presentes en las fuentes originales, como dominio temático restringido (posiblemente textos administrativos o noticias) y registro formal.
- Riesgo de alucinación: como todo modelo de traducción neuronal, puede generar traducciones plausibles pero incorrectas, especialmente con frases idiomáticas, nombres propios o terminología técnica poco frecuente en el corpus.
- Limitación de contexto: la longitud de contexto no está documentada; si hereda la de NLLB-200 (512 tokens), frases largas o documentos extensos deberán segmentarse, lo que puede afectar la coherencia.
- Cobertura lingüística limitada: solo soporta dzongkha e inglés; no conserva las capacidades multilingües del modelo base.
- Sin garantías de producción: el autor no proporciona benchmarks ni evaluaciones formales; se recomienda validar la calidad en el dominio de uso antes de desplegar en entornos críticos.
- Licencia MIT: permite uso comercial y modificación, pero el modelo se distribuye sin garantías; el autor no se hace responsable de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kinleyrabgay/lotsawa-600m-dz-en-v2
- Repositorio GitHub del proyecto: https://github.com/kinleyrabgay/Lotsawa
- Modelo relacionado (300K): https://huggingface.co/kinleyrabgay/nllb-200-600M-dzo-eng-300k
- Modelo relacionado (50K): https://huggingface.co/kinleyrabgay/nllb-200-600M-dzo-eng-50k
- Perfil del autor en GitHub: https://github.com/kinleyrabgay
- Modelo base NLLB-200 distilled 600M: https://huggingface.co/facebook/nllb-200-distilled-600M

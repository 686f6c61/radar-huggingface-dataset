# ryuuu7/Iban_Morphological_Analyzer

## Resumen

Iban_Morphological_Analyzer es un modelo de análisis y generación morfológica para el iban, una lengua austronesia hablada principalmente en Sarawak (Malasia) y en la provincia de Kalimantan Occidental (Indonesia), con unos 700.000 hablantes. Lo desarrolla el usuario ryuuu7 y se publica bajo licencia Apache 2.0, aunque con acceso restringido que requiere aceptar condiciones en Hugging Face. El modelo parte de google/byt5-small, un encoder-decoder token-free que opera directamente sobre bytes UTF-8, y se ha afinado para tareas de morfología: segmentación, análisis y generación de formas flexionadas.

La relevancia del modelo radica en su enfoque para lenguas de bajos recursos: al heredar la arquitectura ByT5, evita depender de un tokenizador específico del iban, lo que reduce el vocabulario fuera de dominio y permite tratar el texto como secuencias de bytes. Con 299,6 millones de parámetros totales, es un modelo compacto que puede desplegarse en hardware modesto, algo crítico para comunidades lingüísticas con pocos recursos computacionales.

El repositorio ocupa 15,6 GB, un tamaño desproporcionado respecto a los parámetros del modelo, lo que sugiere la presencia de múltiples checkpoints o artefactos de entrenamiento además de los pesos principales. El modelo está etiquetado para text2text-generation y text-generation-inference, y su pipeline declarado es text-generation, aunque su tarea real es la transformación morfológica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (ByT5, token-free sobre bytes UTF-8) |
| Parametros totales | 299.637.760 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (byt5-small admite hasta 1024 bytes de entrada/salida en su configuración original) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantización estándar de transformers, sin recetas publicadas) |
| Idiomas soportados | iban (código ISO 639-3: iba) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en google/byt5-small, un transformer encoder-decoder que procesa texto como secuencias de bytes UTF-8 en lugar de tokens subword. Esta decisión elimina la necesidad de un tokenizador entrenado sobre el iban, lo que resulta especialmente útil en lenguas de bajos recursos donde los vocabularios subword quedan mal cubiertos. ByT5-small tiene 299,6 millones de parámetros, lo que sitúa al modelo en la gama compacta y permite inferencia en CPU o GPU de gama media.

No se dispone de información publicada sobre el volumen de tokens de entrenamiento, la composición del corpus de iban utilizado, ni si se aplicaron técnicas de RLHF o DPO. Dado el carácter morfológico de la tarea, es plausible que el afinamiento se haya hecho con pares de secuencias (forma superficial y análisis morfológico, o lema y forma flexionada), pero este extremo no está confirmado en la información disponible. Tampoco se documentan innovaciones técnicas adicionales más allá de la herencia token-free de ByT5.

## Capacidades

- Análisis morfológico del iban: descomposición de palabras en morfemas y etiquetado de categorías gramaticales.
- Generación morfológica: producción de formas flexionadas a partir de un lema y una especificación de rasgos.
- Segmentación morfológica: separación de prefijos, sufijos, infijos y raíces propios de la morfología austronesia.
- Generación de texto condicionada por tarea (text2text-generation), con entrada y salida en formato de secuencia.
- Procesamiento token-free sobre bytes, lo que permite manejar ortografías variables y caracteres fuera de vocabulario sin fallos de tokenización.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al iban; no se documenta transferencia a otras lenguas austronesias.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Anotación lingüística asistida: el modelo puede pre-anotar corpus de iban con análisis morfológico, reduciendo el trabajo manual de lingüistas que documentan la lengua y acelerando la creación de treebanks y léxicos morfológicos.
- Enseñanza del iban: generación de paradigmas de flexión y ejercicios de segmentación morfológica para materiales didácticos, aprovechando la capacidad de producir formas a partir de lemas y rasgos.
- Normalización ortográfica: al operar sobre bytes, puede mapear variantes ortográficas del iban a una forma canónica, útil en la digitalización de textos históricos o de ortografía inconsistente.
- Búsqueda y recuperación de información en iban: la segmentación morfológica mejora el emparejamiento entre consultas y documentos cuando las formas flexionadas difieren, algo habitual en lenguas aglutinantes.
- Traducción asistida iban-castellano o iban-inglés: como preprocesador morfológico que alimenta un sistema de traducción posterior, descomponiendo palabras en unidades traducibles.
- Investigación en lingüística computacional de bajos recursos: banco de pruebas para evaluar técnicas token-free en lenguas austronesias con pocos datos, comparando el rendimiento frente a modelos con tokenizador subword.
- Aplicaciones de preservación lingüística: integración en herramientas comunitarias de documentación y revitalización del iban, dado el bajo coste computacional del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,2 GB para los pesos (299,6 M de parámetros × 4 bytes), más overhead de activaciones.
- VRAM estimada en fp16/bf16: aproximadamente 0,6 GB para los pesos.
- VRAM estimada en int8: aproximadamente 0,3 GB para los pesos.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM efectiva para fp16 con lote pequeño; RTX 3060, RTX 4060, T4 o superiores son suficientes.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: transformers (Python), Text Generation Inference (el modelo está etiquetado como endpoints_compatible), y conversión a ONNX para entornos sin GPU. No se documenta compatibilidad con llama.cpp u Ollama al no haber pesos GGUF publicados.
- Latencia y throughput: no disponible. Al ser un modelo token-free sobre bytes, la longitud efectiva de secuencia en bytes es mayor que en modelos con tokenizador, lo que incrementa el coste de atención respecto a un modelo equivalente con vocabulario subword.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Iban_Morphological_Analyzer | 299,6 M | no disponible | iban | Apache 2.0 | gated en Hugging Face |
| google/byt5-small (base) | 299,6 M | 1024 bytes | multilingüe (bytes) | Apache 2.0 | abierto |
| google/mt5-small | 300 M | 512 tokens | multilingüe (101 idiomas, sin iban garantizado) | Apache 2.0 | abierto |
| Modelos morfológicos específicos para lenguas austronesias | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con alternativas especializadas en morfología del iban no está disponible, dado que no se han identificado modelos públicos equivalentes en la información consultada.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated y requiere aceptar condiciones en Hugging Face antes de descargarlo, lo que puede complicar su uso en pipelines automatizados.
- Cobertura lingüística limitada al iban; no se documenta su comportamiento en variedades dialectales ni en lenguas emparentadas como el malayo o el bidayuh.
- Riesgo de alucinación en la generación de formas: al ser un modelo generativo, puede producir flexiones morfológicamente plausibles pero inexistentes, especialmente con lemas poco frecuentes.
- Sesgos: no se documenta la composición del corpus de entrenamiento, por lo que se desconoce si hay sesgos de género, registro o variedad dialectal.
- Longitud de contexto no confirmada: aunque ByT5-small soporta hasta 1024 bytes, no se especifica si el afinamiento preserva esa ventana ni cómo se comporta con entradas largas.
- Tamaño del repositorio (15,6 GB) muy superior al de los pesos del modelo, lo que puede indicar artefactos de entrenamiento no documentados; conviene revisar la estructura del repo antes de descargarlo completo.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas, lo que dificulta evaluar su idoneidad en producción.
- Licencia Apache 2.0 permite uso comercial, pero las condiciones adicionales del acceso gated deben revisarse por si imponen restricciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ryuuu7/Iban_Morphological_Analyzer
- Modelo base google/byt5-small: https://huggingface.co/google/byt5-small
- Paper de ByT5 (Xue et al., 2021): https://arxiv.org/abs/2105.13626
- Documentación de transformers sobre ByT5: https://huggingface.co/docs/transformers/model_doc/byt5

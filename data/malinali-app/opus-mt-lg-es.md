# malinali-app/opus-mt-lg-es

## Resumen

`malinali-app/opus-mt-lg-es` es un paquete de pesos para traducción automática de luganda (lg) a español (es), publicado por la aplicación Malinali. No es un modelo entrenado desde cero: se trata de una reempaquetado del modelo `Helsinki-NLP/opus-mt-lg-es` de Helsinki-NLP, convertido a safetensors y acompañado de tokenizers rápidos en formato JSON para su uso con Candle, el framework de inferencia en Rust.

El modelo es un transformer encoder-decoder de la familia Marian, con 76.173.809 parámetros (unos 76,2 millones), lo que lo sitúa en la gama ligera de traducción neuronal. Esta escala permite ejecución en dispositivo (on-device), sin GPU dedicada, que es precisamente el objetivo declarado del pack: inferencia local en aplicaciones, en este caso vía `marian_flutter` para Flutter.

Su relevancia es doble. Por un lado, cubre un par de idiomas de bajos recursos (luganda, lengua bantú hablada principalmente en Uganda, hacia español) para el que existen pocas alternativas abiertas. Por otro, sirve como ejemplo de redistribución de pesos para despliegue móvil. Con cero descargas y cero likes en el momento de redactar esta ficha, y sin resultados de benchmarks publicados, debe considerarse un artefacto de conveniencia, no un modelo con evaluación propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian NMT), atención multi-cabeza |
| Parámetros totales | 76.173.809 (~76,2 M) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repositorio solo publica safetensors; no hay variantes GGUF, GPTQ ni AWQ) |
| Idiomas soportados | Luganda (lg) como idioma origen, español (es) como idioma destino |
| Licencia | no disponible en la ficha de HuggingFace; la model card remite a la licencia del modelo base (habitualmente CC-BY 4.0 en los modelos OPUS-MT) |
| Formato de pesos | safetensors (`model.safetensors`) más tokenizers JSON (`tokenizer-enc.json`, `tokenizer-dec.json`) |

Otros datos de la ficha: biblioteca `transformers`, pipeline `translation`, etiquetas `marian`, `candle`, `opus-mt`, `malinali`, `lg`, `es`, `endpoints_compatible`; tamaño del repositorio 0,3 GB.

## Arquitectura y entrenamiento

La arquitectura es Marian NMT, un transformer encoder-decoder clásico diseñado específicamente para traducción automática, con atención multi-cabeza y sin mecanismos experimentales tipo MoE, SSM o atención lineal. El modelo original fue entrenado por el proyecto Helsinki-NLP dentro de OPUS-MT, sobre corpus paralelos alineados del proyecto OPUS. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de ajuste con RLHF o DPO; en la práctica, OPUS-MT se entrena de forma supervisada sobre datos paralelos y no incorpora alineación por preferencias.

La contribución de Malinali no es de entrenamiento, sino de empaquetado: convierte los pesos originales a safetensors y transforma el tokenizer SentencePiece en dos tokenizers rápidos en JSON (uno para el lado origen y otro para el lado destino), necesarios para la implementación Marian de Candle (`marian_flutter`). El propio autor declara explícitamente que no reclama la propiedad del modelo entrenado y que solo redistribuye pesos y tokenizers para inferencia en dispositivo. No se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o cuantización.

## Capacidades

- Traducción de texto de luganda a español, en modo texto a texto (pipeline `translation`).
- Dirección única: la model card especifica explícitamente lg → es; no se documenta el sentido inverso.
- Ejecución en dispositivo mediante Candle y la librería `marian_flutter`, orientada a aplicaciones Flutter.
- Compatible con la librería `transformers` y con endpoints de inferencia (etiqueta `endpoints_compatible`).
- Tokenizers rápidos separados para origen y destino, en formato JSON.
- No soporta tool calling ni function calling: no se menciona en la documentación y la arquitectura Marian no está diseñada para ello.
- No soporta uso agéntico ni razonamiento multi-paso.
- No dispone de modo "thinking", visión, audio ni cualquier otra modalidad distinta del texto.
- Capacidad multilingüe limitada estrictamente al par lg–es; no cubre otros idiomas.

## Casos de uso

- Traducción embebida en aplicaciones móviles sin conexión: al ser un pack on-device con pesos safetensors y tokenizers para Candle, permite traducir luganda a español en el propio dispositivo, sin enviar texto a servicios externos y sin coste por token.
- Atención al cliente para comunidades lugandófonas: un servicio de soporte en español puede traducir mensajes entrantes en luganda para que un agente hispanohablante los entienda, con el modelo como capa de preprocesado.
- Localización de contenidos hacia español: traducción de materiales divulgativos, noticias o publicaciones de organizaciones con presencia en Uganda para su redistribución en español.
- Documentación humanitaria y sanitaria: traducción de instrucciones, formularios o guías de campo del luganda al español en proyectos de cooperación, donde a menudo el personal local redacta en luganda y se necesita versión en español para informes de donantes.
- Subtitulado y transcripción de material audiovisual: integrado tras un sistema de reconocimiento de voz en luganda, el modelo genera subtítulos en español para vídeo, aunque su ventana de contexto no confirmada limita los segmentos largos.
- Investigación en traducción de bajos recursos: sirve como línea base reproducible para experimentos sobre pares de idiomas con pocos datos, dado su tamaño reducido (76,2 M) y su procedencia conocida desde OPUS-MT.
- Enriquecimiento de corpus y pipelines de datos: traducción por lotes de texto en luganda a español para construir conjuntos de datos paralelos o para indexación semántica multilingüe en sistemas de búsqueda.
- Pruebas de integración en CI/CD de modelos: su tamaño (0,3 GB de repositorio) permite incluirlo en tests automatizados de pipelines de traducción sin infraestructura pesada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye métricas de BLEU, METEOR, chrF ni comparaciones cuantitativas con otros sistemas. Cualquier cifra de calidad para este par de idiomas debería obtenerse evaluando el modelo base `Helsinki-NLP/opus-mt-lg-es`, del que este repositorio es una copia de pesos, o bien midiendo sobre un conjunto de validación propio.

## Requisitos de hardware

- VRAM estimada para los pesos: en fp32, unos 305 MB (76,2 M × 4 bytes); en fp16, unos 152 MB; en int8, unos 76 MB. Añadiendo activaciones y caché de atención, una inferencia completa en fp32 cabe holgadamente por debajo de 1 GB.
- Cabe en cualquier GPU de consumo, incluidas tarjetas con 4 GB o menos (GTX 1650, RTX 3050, RTX 4060), y no requiere A100 ni H100.
- Ejecución viable en CPU: con 76,2 M de parámetros, la inferencia en CPU moderna es práctica, especialmente con tokenizers rápidos y decodificación por frases.
- Despliegue en dispositivo: es el caso de uso principal, a través de Candle con `marian_flutter` para aplicaciones Flutter.
- Transformers: soporte directo mediante la pipeline `translation` y el modelo base de Marian.
- llama.cpp y Ollama: no aplican directamente, ya que el repositorio no publica pesos en formato GGUF.
- vLLM, TGI y otros servidores de alto rendimiento: no se documenta compatibilidad específica en la información disponible.
- Latencia y throughput: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| malinali-app/opus-mt-lg-es | 76,2 M | lg → es | no disponible | no disponible (remite al base) | safetensors + tokenizers JSON para Candle |
| Helsinki-NLP/opus-mt-lg-es | 76,2 M | lg → es | no disponible | habitualmente CC-BY 4.0 (según OPUS-MT) | transformers, safetensors/PyTorch |
| facebook/m2m100_418M | 418 M | 100 idiomas, multidireccional | no disponible | MIT | transformers, safetensors/PyTorch |
| facebook/nllb-200-distilled-600M | 600 M | 200 idiomas | no disponible | CC-BY-NC 4.0 (uso no comercial) | transformers, safetensors |

El modelo de Malinali es idéntico en pesos al de Helsinki-NLP; la diferencia está en el formato de tokenizers y en el empaquetado para Candle. Frente a M2M-100 o NLLB, pierde cobertura de idiomas pero gana en tamaño (entre 5 y 8 veces menos parámetros) y en facilidad de despliegue en dispositivo.

## Limitaciones y advertencias

- Es una redistribución de pesos, no un modelo nuevo: carece de evaluación propia y de cualquier ajuste adicional sobre el modelo base.
- La licencia no está declarada en la ficha de HuggingFace. La model card remite a la licencia del modelo base (habitualmente CC-BY 4.0 en OPUS-MT), pero la falta de una declaración explícita es un riesgo para uso comercial en producción; conviene verificar la licencia upstream antes de desplegar.
- Riesgo de alucinación y de traducciones fluidas pero incorrectas, especialmente en frases largas, terminología especializada, nombres propios y expresiones idiomáticas del luganda.
- Sesgo de dominio: los corpus OPUS para idiomas de bajos recursos están dominados por textos religiosos, jurídicos y de noticias, lo que puede degradar la calidad en registros coloquiales, técnicos o conversacionales.
- Longitud de contexto no documentada. Si se asume el valor habitual de los modelos Marian de OPUS-MT, la ventana sería limitada, lo que obliga a segmentar textos largos; este dato no está confirmado en la información proporcionada.
- Soporte de un único par de idiomas y en una única dirección (lg → es), sin capacidad de traducción inversa documentada.
- Tokenizers no estándar: requiere los ficheros `tokenizer-enc.json` y `tokenizer-dec.json`, pensados para Candle, lo que complica su uso directo con herramientas que esperan un tokenizer SentencePiece o un tokenizer estándar de `transformers`.
- Repositorio sin tracción ni mantenimiento verificable: 0 descargas y 0 likes en el momento de la consulta, sin garantías de actualización o soporte.
- Fecha de publicación inusualmente futura en los metadatos (octubre de 2026), lo que sugiere posibles inconsistencias en la ficha y aconseja tratar los metadatos con cautela.
- No hay cuantizaciones publicadas, por lo que cualquier despliegue en formatos GGUF o similar requiere conversión propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/malinali-app/opus-mt-lg-es
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-lg-es
- Proyecto OPUS-MT: https://github.com/Helsinki-NLP/Opus-MT
- Aplicación Malinali: https://malinali.app
- Artículo de Marian NMT: https://arxiv.org/abs/1804.00344
- Artículo de OPUS-MT (Tiedemann y Thottingal, 2020): https://arxiv.org/abs/2008.11741
- Candle (framework de inferencia en Rust): https://github.com/huggingface/candle

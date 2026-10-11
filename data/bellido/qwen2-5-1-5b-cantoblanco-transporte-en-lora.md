# Bellido/qwen2.5-1.5b-cantoblanco-transporte-en-lora

## Resumen

Bellido/qwen2.5-1.5b-cantoblanco-transporte-en-lora es un repositorio alojado en Hugging Face por el usuario Bellido cuyo identificador sugiere una adaptación mediante LoRA (Low-Rank Adaptation) sobre el modelo base Qwen2.5-1.5B, orientada a un dominio de transporte y presumiblemente ligada a un conjunto de datos llamado Cantoblanco. El nombre apunta a un ajuste fino de dominio, pero la model card publicada es la plantilla automática de transformers y no contiene ninguna confirmación: todos los campos relevantes figuran como "[More Information Needed]".

El repositorio ocupa 0,1 GB y declara los tags transformers y safetensors, lo que es coherente con un adaptador de bajo rango más que con pesos completos de un modelo de 1.500 millones de parámetros (que en fp16 rondarían los 3 GB). No obstante, ni los tags ni la model card confirman que se trate de un adaptador PEFT ni cuál es el modelo base exacto, si bien el identificador lo indica explícitamente.

Su relevancia actual es muy limitada: registra 0 descargas y 0 likes, no declara licencia, idiomas ni pipeline, y no incluye información de entrenamiento, evaluación o uso previsto. La fecha de creación registrada (2026-10-10) es posterior a la fecha actual, lo que sugiere un error de metadatos o una subida con marca temporal incorrecta. En la práctica, solo resulta útil como punto de partida para reproducir o auditar un ajuste de dominio sobre Qwen2.5-1.5B, y no como componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en la model card. Por el identificador, adaptación LoRA sobre un transformer decoder-only denso (Qwen2.5-1.5B); sin confirmar por el autor |
| Parámetros totales | No disponible. El modelo base Qwen2.5-1.5B tiene 1.540 millones de parámetros; el adaptador añade una fracción pequeña (repositorio de 0,1 GB) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card. El base Qwen2.5-1.5B declara 32.768 tokens nativos, ampliables a 131.072 con RoPE scaling tipo YaRN |
| Tipos de cuantización | No disponible. El repositorio solo declara safetensors; no se publican versiones GGUF, AWQ, GPTQ ni bitsandbytes |
| Idiomas soportados | No disponible. El base Qwen2.5 cubre más de 29 idiomas, entre ellos español e inglés; el efecto del ajuste de dominio sobre el multilingüismo no está documentado |
| Licencia | No disponible |
| Formato de pesos | safetensors (según los tags del repositorio) |
| Tamaño del repositorio | 0,1 GB |
| Librería declarada | transformers |
| Pipeline declarado | No disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creación y actualización | 2026-10-10 (ambas; fecha anómala, posterior a la actual) |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura concreta del ajuste ni sobre el procedimiento de entrenamiento. Por el identificador, se trataría de un adaptador LoRA aplicado sobre Qwen2.5-1.5B, un transformer decoder-only denso de la familia Qwen2.5 que emplea atención con RoPE, Grouped Query Attention (GQA), normalización RMSNorm y activación SwiGLU, con un vocabulario de aproximadamente 151.900 tokens y 32.768 tokens de contexto nativo. Estos datos corresponden a la configuración pública del modelo base, no a este repositorio, y no han sido verificados por el autor en la model card.

Se desconocen por completo el conjunto de datos de ajuste, el número de tokens de entrenamiento, la composición del corpus, el rango y el alpha del adaptador, los módulos objetivo, la tasa de aprendizaje y si hubo fases de RLHF o DPO. El nombre sugiere un corpus de dominio de transporte, posiblemente en inglés ("transporte-en"), vinculado a Cantoblanco, pero es una inferencia no confirmada y podría referirse a cualquier otra cosa. El único tag con referencia externa es arxiv:1910.09700, que corresponde al artículo de Lacoste et al. (2019) sobre estimación de emisiones de CO2 en aprendizaje automático; se trata de un resto de la plantilla de model card y no de una referencia al entrenamiento del modelo.

Tampoco se documenta ninguna innovación técnica (decodificación especulativa, atención lineal, mezcla de expertos ni arquitecturas híbridas). Dado que no se especifica si el adaptador se distribuye fusionado con los pesos base o por separado, no puede confirmarse que el repositorio sea autocontenido para inferencia directa con transformers sin cargar además Qwen2.5-1.5B.

## Capacidades

- Generación de texto: capacidad heredada del modelo base Qwen2.5-1.5B, no verificada en este repositorio.
- Razonamiento y matemáticas básicas: el base incluye mejoras en matemáticas y razonamiento respecto a Qwen2, pero no hay evaluación publicada de este ajuste.
- Generación de código: el base cubre lenguajes habituales; no hay datos que confirmen que el ajuste de dominio preserve esta capacidad.
- Tool calling y function calling: el base Qwen2.5-Instruct lo soporta; no se confirma para este adaptador.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no documentadas para este ajuste; el base cubre más de 29 idiomas.
- Salidas estructuradas (JSON): soportadas en el base Qwen2.5-Instruct; no confirmadas aquí.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Ajuste de dominio: el nombre indica especialización en transporte, pero no se aporta ningún ejemplo, métrica ni instrucción de uso.
- Capacidad de clasificación o extracción de entidades en textos de transporte: plausible dado el ajuste, pero sin evidencia publicada.

## Casos de uso

Los siguientes casos son hipótesis de aplicación coherentes con el nombre y el tamaño del modelo, no aplicaciones validadas por el autor:

- Clasificación de incidencias de transporte: etiquetar tickets o mensajes de usuarios en categorías (retrasos, cancelaciones, incidencias de accesibilidad) aprovechando el ajuste de dominio; requiere validación previa con datos propios porque no hay métricas publicadas.
- Extracción de entidades en documentos de transporte: identificación de líneas, horarios, estaciones y operadores en textos no estructurados, tarea para la que un modelo de 1.5B bien ajustado suele ser suficiente y barato de servir.
- Asistente de atención al cliente de segundo nivel: generación de respuestas acotadas sobre políticas de billetes o rutas, siempre con recuperación aumentada (RAG) por delante para mitigar alucinaciones.
- Normalización y limpieza de direcciones o paradas: conversión de formatos heterogéneos de direcciones a un esquema canónico en canalizaciones de datos de movilidad.
- Generación de datos sintéticos de dominio: creación de ejemplos etiquetados de transporte para aumentar conjuntos de entrenamiento de clasificadores más pequeños, con revisión humana posterior.
- Traducción asistida de textos operativos entre español e inglés: aprovechando el multilingüismo del base, aunque la preservación de esta capacidad tras el ajuste de dominio es incierta.
- Prototipado rápido en local: al ser un adaptador pequeño, permite experimentar en una GPU de consumo o incluso en CPU con cuantización tras fusionar pesos.
- Etiquetado semiautomático en anotación de corpus: preanotar grandes volúmenes de textos de transporte y reservar la revisión humana para los casos dudosos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

Estimaciones orientativas calculadas a partir del tamaño del modelo base Qwen2.5-1.5B, no medidas sobre este repositorio:

- Peso de los parámetros base: aproximadamente 3,1 GB en fp16, 1,6 GB en int8 y entre 0,9 y 1,1 GB en cuantización de 4 bits. El adaptador LoRA en sí añade decenas de MB.
- VRAM total en inferencia: alrededor de 4 GB en fp16 para contexto moderado, 2,5-3 GB en int8 y 1,5-2 GB en 4 bits, incluyendo caché KV. La caché KV crece linealmente con el contexto y el batch.
- GPU de consumo: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090, incluso en fp16. En tarjetas de 6-8 GB es recomendable cuantización de 4 u 8 bits.
- GPU de centro de datos: A100, H100, L40S o L4 son sobredimensionadas para un único flujo de inferencia; tienen sentido para servir con lotes grandes o muchas instancias concurrentes mediante vLLM o TGI.
- CPU: viable en solitario con llama.cpp u Ollama tras fusionar el adaptador y convertir a GGUF; los tokens por segundo dependerán del número de núcleos y del soporte AVX2/AVX-512.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador; vLLM con soporte de adaptadores LoRA para servicio multi-adaptador; llama.cpp, Ollama o LM Studio únicamente después de fusionar pesos y convertir a GGUF; TGI para despliegues gestionados.
- Latencia y throughput: no disponibles. Como referencia cualitativa, un modelo de 1.5B en una GPU moderna de consumo suele entregar decenas o cientos de tokens por segundo en un solo flujo y miles agregados con lotes grandes, pero no hay mediciones publicadas para este repositorio.

## Comparativa con modelos similares

Comparativa de alternativas de tamaño comparable. La columna de este modelo refleja lo que está documentado, no el rendimiento real.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Bellido/qwen2.5-1.5b-cantoblanco-transporte-en-lora | No disponible (base de 1,54 mil millones) | No disponible | No disponible | Repositorio público, 0 descargas, sin model card útil |
| Qwen2.5-1.5B / Qwen2.5-1.5B-Instruct | 1,54 mil millones | 32.768 tokens (131.072 con YaRN) | Apache 2.0 en la mayoría de variantes | Ampliamente usado, versiones GGUF, AWQ y GPTQ disponibles |
| Llama-3.2-1B-Instruct | 1,24 mil millones | 128.000 tokens | Llama 3.2 Community License | Muy extendido, ecosistema amplio |
| Gemma-2-2B-it | 2,61 mil millones | 8.192 tokens | Gemma Terms of Use | Ampliamente usado, versiones cuantizadas disponibles |
| SmolLM2-1.7B-Instruct | 1,71 mil millones | 8.192 tokens | Apache 2.0 | Popular como modelo pequeño de referencia |

El modelo de esta ficha no puede compararse en rendimiento porque no publica ninguna métrica; las cifras de las alternativas corresponden a sus configuraciones públicas y deberían verificarse en cada model card antes de citarlas.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es la plantilla automática, sin uso previsto, sin datos de entrenamiento y sin evaluación.
- Licencia no declarada: sin licencia explícita no puede asumirse permiso de uso comercial ni redistribución; conviene tratar el repositorio como no licenciado hasta consultar al autor.
- Modelo no validado: 0 descargas y 0 likes, sin ningún informe independiente de calidad o seguridad.
- Riesgo de olvido catastrófico: un ajuste LoRA de dominio sobre un modelo de 1.5B puede degradar las capacidades generales del base (código, matemáticas, multilingüismo) sin que exista evaluación que lo cuantifique.
- Alucinación: esperable en cualquier modelo de 1.5B, especialmente al responder sobre rutas, horarios o normativa de transporte; cualquier despliegue debe incorporar recuperación de información verificada y validación humana.
- Sesgos: no evaluados. El corpus de ajuste, si procede de una única región o fuente, puede introducir sesgos geográficos, culturales o de registro.
- Limitaciones de contexto: el rango efectivo no está documentado; aunque el base llegue a 32.768 tokens, el ajuste puede degradar el rendimiento en ventanas largas.
- Idiomas: no se especifica ninguno; el acrónimo "en" del nombre podría indicar que el ajuste está orientado al inglés, lo que limitaría su uso en español.
- Ambigüedad del identificador: no puede confirmarse si el repositorio contiene solo el adaptador o también pesos fusionados; verificar los archivos antes de planificar el despliegue.
- Metadatos anómalos: la fecha de creación y actualización (2026-10-10) es posterior a la fecha actual, lo que resta fiabilidad a los metadatos del repositorio.
- Cita engañosa: el tag arxiv:1910.09700 procede de la plantilla de emisiones de carbono y no documenta el entrenamiento del modelo.
- Restricciones de producción: sin licencia, sin evaluación y sin mantenimiento visible, no es recomendable integrarlo en sistemas en producción sin un proceso previo de auditoría y evaluación propia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Bellido/qwen2.5-1.5b-cantoblanco-transporte-en-lora
- Modelo base Qwen2.5-1.5B: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Informe técnico de Qwen2.5: https://arxiv.org/abs/2412.15115
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Artículo citado en los tags (plantilla de emisiones): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental de ML: https://mlco2.github.io/impact

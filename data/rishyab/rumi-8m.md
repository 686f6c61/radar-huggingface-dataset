# Rishyab/RUMI-8M

# Ficha técnica de RUMI-8M

## Resumen
RUMI-8M es un modelo de lenguaje de tipo decoder-only Transformer entrenado desde cero, publicado por el usuario Rishyab dentro del denominado proyecto RUMI. Con 8.459.904 parámetros, una dimensión de embedding de 192, 12 capas y 6 cabezas de atención, se sitúa en la gama de los modelos ultracompactos, más cercano a un ejercicio de investigación y experimentación que a un sistema listo para producción.

El modelo emplea un tokenizador Byte-Level BPE con un vocabulario de 16.000 tokens y una longitud de contexto muy reducida, de solo 256 tokens. Se distribuye bajo licencia MIT y con la etiqueta explícita de "base model": no ha pasado por ajuste por instrucciones ni por alineación con preferencias humanas, por lo que su única capacidad declarada es la continuación de texto.

Su relevancia actual es acotada pero concreta: sirve como banco de pruebas reproducible para estudiar arquitecturas Transformer pequeñas, validar pipelines de tokenización e inferencia y ejecutar experimentos de ajuste fino con recursos mínimos. El repositorio ocupa 0,1 GB, no registra descargas y cuenta con una única marca de "me gusta" en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only |
| Parámetros totales | 8.459.904 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantización | no disponible (no se documentan cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible explícitamente; biblioteca de carga `rumi` sobre PyTorch (`torch`, `tokenizers`, `huggingface_hub`) |

Datos arquitectónicos adicionales declarados por el autor: dimensión de embedding 192, 12 capas, 6 cabezas de atención, dimensión feed-forward 768, dropout 0,1, weight tying activado y vocabulario de 16.000 tokens.

## Arquitectura y entrenamiento
La arquitectura es un Transformer decoder-only estándar, con normalización, atención multi-cabeza y bloques feed-forward de 768 unidades. La dimensión por cabeza resulta de 32 (192 / 6), un valor habitual en modelos pequeños. El uso de weight tying entre la matriz de embedding y la capa de salida reduce el recuento de parámetros, coherente con los 8,46 millones declarados. El dropout de 0,1 sugiere un entrenamiento con regularización orientada a evitar sobreajuste en un corpus presumiblemente limitado.

No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset, el idioma o idiomas del corpus, ni si hubo fases de ajuste adicionales. El propio autor indica que RUMI-8M es un modelo base y que no está ajustado por instrucciones, lo que descarta explícitamente RLHF, DPO u otras técnicas de alineación. No se documentan innovaciones técnicas destacables como decodificación especulativa, atención lineal o mecanismos híbridos.

## Capacidades
- Generación de texto por continuación: es la capacidad principal y la única declarada por el autor.
- Predicción del siguiente token sin formato conversacional: no interpreta roles de sistema, usuario o asistente.
- Razonamiento, matemáticas y generación de código: no documentados y altamente improbables a esta escala.
- Tool calling o function calling: no soportado.
- Comportamiento agéntico o razonamiento multi-paso: no soportado.
- Capacidades multilingües: no documentadas; el idioma de entrenamiento no está especificado.
- Capacidades especiales (modo de pensamiento, visión, audio): ninguna documentada.
- Integración en pipelines personalizados: la biblioteca `rumi` permite cargar el modelo con `torch`, `tokenizers` y `huggingface_hub`.

## Casos de uso
- Docencia y estudio de arquitecturas Transformer: el modelo es lo bastante pequeño (8,46 M de parámetros, 0,1 GB en disco) para leer su configuración completa, reproducir un forward pass en CPU en milisegundos y experimentar con modificaciones de capas, cabezas o dimensiones sin infraestructura dedicada.
- Pruebas de humo (smoke tests) en pipelines de despliegue: sirve como modelo ficticio para validar extremo a extremo un servicio de inferencia, el enrutado de peticiones, el formateo de respuestas y las métricas de latencia antes de sustituirlo por un modelo real.
- Validación de tokenizadores y preprocesado: al usar Byte-Level BPE con vocabulario de 16.000, permite verificar de forma rápida que un pipeline de limpieza, truncado a 256 tokens y empaquetado funciona correctamente.
- Ajuste fino sobre dominios muy acotados: con datasets pequeños de texto homogéneo (por ejemplo, titulares, descripciones de producto o plantillas), puede especializarse en continuación de frases dentro de ese dominio con coste de entrenamiento mínimo.
- Despliegue en entornos con recursos extremos: cabe en CPU, en una Raspberry Pi, en un navegador o en un dispositivo móvil, lo que permite aplicaciones de autocompletado local sin conexión y sin GPU.
- Generación de texto sintético breve para aumentar datasets: puede producir continuaciones cortas y filtrables que alimenten conjuntos de datos auxiliares o sirvan como línea base negativa en experimentos de detección de texto generado.
- Estudios de ablación y comparativas de escala: útil como punto de referencia de la gama de 8 millones de parámetros frente a modelos de 1 M, 14 M o 100 M para medir cómo escala la perplejidad con el tamaño.
- Investigación sobre sesgos en modelos pequeños: permite analizar qué sesgos aparecen con presupuestos de cómputo y datos reducidos, aunque su corpus de entrenamiento no esté documentado.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card no incluye valores de MMLU, HumanEval, GSM8K, perplejidad ni ninguna otra métrica de evaluación.

## Requisitos de hardware
Estimaciones derivadas del recuento de parámetros declarado (8.459.904), no de mediciones publicadas por el autor:
- Pesos en fp32: aproximadamente 34 MB.
- Pesos en fp16 o bf16: aproximadamente 17 MB.
- Pesos en int8: aproximadamente 8,5 MB.
- Pesos en int4: aproximadamente 4,2 MB.
- Caché KV: 2 × 12 capas × 192 dimensiones = 4.608 valores por token; en fp16 equivale a unos 9 KB por token, es decir, unos 2,4 MB para la ventana completa de 256 tokens.
- GPU recomendadas: ninguna en particular; el modelo es viable en CPU. Cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) es sobredimensionada y solo aportaría ventaja en procesamiento por lotes muy grandes.
- Cabe en GPU consumer: sí, con enorme holgura; también en GPUs integradas, móviles y aceleradores de borde.
- Opciones de despliegue: la vía documentada es la biblioteca `rumi` junto con `torch`, `tokenizers` y `huggingface_hub`. Otros runners como llama.cpp u Ollama requerirían una conversión a GGUF que no está documentada en la información disponible. vLLM o TGI son técnicamente posibles pero desproporcionados para este tamaño.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

Los valores de la columna de modelos comparables proceden de documentación pública de sus respectivos proyectos y no han sido verificados en la búsqueda realizada.

| Modelo | Parámetros | Contexto | Licencia | Rendimiento en benchmarks | Disponibilidad |
|---|---|---|---|---|---|
| RUMI-8M | 8.459.904 | 256 | MIT | no disponible | HuggingFace (`Rishyab/RUMI-8M`) |
| TinyStories (Microsoft Research, variantes de ~1 M a ~35 M) | ~1 M a ~35 M | no disponible | no disponible | no disponible | HuggingFace |
| Pythia-14M (EleutherAI) | ~14 M | 2.048 | Apache-2.0 | no disponible | HuggingFace |
| GPT-2 small (OpenAI) | ~124 M | 1.024 | MIT modificada | no disponible | HuggingFace / OpenAI |

Diferencias relevantes: RUMI-8M tiene la ventana de contexto más corta de la comparativa (256 tokens frente a los 1.024 o 2.048 de las alternativas), lo que limita tareas que requieran memoria de conversación o documentos extensos. Su licencia MIT es la más permisiva del grupo. No hay datos públicos de calidad que permitan comparar su rendimiento con el de estos modelos.

## Limitaciones y advertencias
- Escala muy reducida: con 8,46 millones de parámetros, la coherencia se degrada rápidamente más allá de unas pocas frases. Es esperable texto gramaticalmente plausible pero semánticamente inconsistente.
- Contexto de 256 tokens: insuficiente para conversaciones multi-turno, resumen de documentos o cualquier tarea que dependa de memoria a medio plazo.
- Modelo base sin ajuste por instrucciones: no sigue órdenes, no responde preguntas de forma dirigida y no debe presentarse al usuario como un asistente conversacional.
- Riesgo de alucinación: muy alto y difícil de mitigar, dado que no hay alineación ni filtrado documentado.
- Sesgos conocidos: no documentados. Al no especificarse la composición del corpus de entrenamiento, no es posible auditar sesgos de género, raza, idioma o ideología. Se desaconseja su uso en aplicaciones que impacten en personas sin una evaluación previa.
- Idiomas: no disponible. El tokenizador BPE y el idioma de la model card sugieren un corpus predominantemente en inglés, pero es una inferencia, no un dato confirmado.
- Licencia: MIT, permisiva y apta para uso comercial, sin las restricciones habituales de los modelos con licencias de comunidad. Aun así, la licencia cubre el artefacto, no la legalidad del contenido generado ni la del corpus de entrenamiento, que no se documenta.
- Ausencia de evaluación: no hay benchmarks, no hay estudio de seguridad y no hay métricas de perplejidad. Cualquier uso en producción debería ir precedido de una evaluación propia.
- Trazabilidad limitada: el repositorio no registra descargas y tiene una única interacción social, lo que reduce las señales externas de validación por parte de la comunidad.
- Fechas del repositorio: la model card indica creación y actualización en octubre de 2026, con apenas un minuto de diferencia entre ambas, lo que sugiere una publicación sin iteraciones posteriores.

## Enlaces
- HuggingFace: https://huggingface.co/Rishyab/RUMI-8M
- Paper: no disponible
- Repositorio de código: no disponible
- Blog o anuncio del autor: no disponible
- Demo: no disponible
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo. Los resultados obtenidos corresponden a modelos 3D con la etiqueta "Rumi" (Sketchfab, Meshy), a perfiles de redes sociales y a un modelo de generación de imágenes de un personaje de ficción (SeaArt), sin relación alguna con RUMI-8M.

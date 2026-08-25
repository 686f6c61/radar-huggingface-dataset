# mradermacher/Dark-Nexus-32B-v2.0-i1-GGUF

## Resumen

Dark-Nexus-32B-v2.0-i1-GGUF es una versión cuantizada en formato GGUF del modelo original Dark-Nexus-32B-v2.0, desarrollado por ReadyArt y cuantizado por mradermacher. Se trata de un modelo de 32,7 mil millones de parámetros orientado a conversación, roleplay y generación de texto libre, con etiquetas explícitas de contenido NSFW, no alineado y de naturaleza "peligrosa" (dangerous). El repositorio actual contiene únicamente el archivo de importancia (imatrix) para generar cuantizaciones propias, mientras que las cuantizaciones estáticas se publican en un repositorio hermano.

El modelo está pensado para usuarios que buscan un asistente conversacional sin restricciones de seguridad, con especial énfasis en escenarios de rol erótico (ERP) y contenido explícito. Su relevancia radica en la creciente demanda de modelos "sin alineación" para aplicaciones de ficción interactiva y simulación de personajes, aunque su licencia "other" y sus etiquetas limitan su uso en entornos profesionales. No se dispone de información pública sobre la arquitectura interna, el contexto o los datos de entrenamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 32.762.123.264 (32,7 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S (lista completa en el repositorio estático) |
| Idiomas soportados | en (ingles) |
| Licencia | other (no especificada) |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura interna del modelo base (número de capas, tipo de atención, mecanismo de mezcla de expertos, etc.) en los repositorios de HuggingFace consultados. El modelo original de ReadyArt no incluye una model card técnica que detalle su estructura o el proceso de entrenamiento.

En cuanto al proceso de cuantización, mradermacher ha aplicado la técnica de imatrix (importance matrix) para generar los pesos cuantizados, lo que permite una mejor preservación de la calidad en cuantizaciones de baja precisión. El archivo imatrix incluido en este repositorio permite a los usuarios crear sus propias cuantizaciones personalizadas con llama.cpp. No se dispone de datos sobre el dataset de entrenamiento, la composición de tokens o si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés, orientado a roleplay y diálogos multi-turno.
- Soporte de contenido explícito y no censurado (etiquetado como "nsfw", "explicit", "ERP").
- Modelo "unaligned" (no alineado), sin restricciones de seguridad aparentes.
- Capacidades conversacionales básicas, adecuadas para chat interactivo.
- No se ha confirmado soporte de function calling, agentes o razonamiento multi-paso.
- No se ha confirmado capacidades multilingües (solo etiquetado como "en").

## Casos de uso

- Roleplay erótico y simulación de personajes: el modelo está etiquetado explícitamente para ERP y roleplay, por lo que puede usarse en entornos de ficción interactiva donde se requiera un asistente sin filtros de contenido.
- Generación de ficción explícita: adecuado para escritores que necesitan un generador de texto sin restricciones temáticas, aunque debe tenerse en cuenta el riesgo legal y ético.
- Chat sin moderación en entornos privados: puede desplegarse en local con llama.cpp u Ollama para conversaciones no censuradas, con la ventaja de que el formato GGUF permite ejecutarse en hardware de consumo.
- Experimentación con modelos "unaligned": para investigadores que estudian el comportamiento de modelos sin alineación en tareas de generación libre, aunque se requiere cautela.
- Creación de personajes de IA para juegos de rol: integrable en plataformas de simulación de personajes como SillyTavern o KoboldAI.
- Pruebas de técnicas de cuantización: el archivo imatrix permite a los usuarios experimentar con sus propias cuantizaciones, lo que resulta útil para evaluar el impacto de la precisión en la calidad del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones comparativas para el modelo base o sus cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: dependiendo de la cuantización, un modelo de 32,7 B parámetros requiere entre 20 GB (Q4_K_M) y 35 GB (Q6_K) de memoria. Para las cuantizaciones más bajas (Q2_K, IQ1_M) se puede reducir a 15-18 GB.
- GPU recomendadas: para las cuantizaciones Q4 y superiores se necesitan GPUs con al menos 24 GB de VRAM, como RTX 3090, RTX 4090 o A6000. Para cuantizaciones más pequeñas puede caber en RTX 4080 de 16 GB o incluso en tarjetas de 12 GB con Q2.
- En consumer GPU: sí, las cuantizaciones Q2/Q3 pueden ejecutarse en tarjetas de gama alta de consumo, pero con pérdida de calidad notable.
- Opciones de despliegue: llama.cpp, Ollama, KoboldCpp, text-generation-webui, SillyTavern (a través de la API de llama.cpp).
- Latencia y throughput: no disponibles, aunque se estima una velocidad de 5-15 tokens/s en RTX 4090 con cuantización Q4_K_M, dependiendo de la longitud del contexto.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa. El modelo no tiene benchmarks publicados y su arquitectura interna es desconocida. Como referencia de tamaño, se puede comparar con otros modelos de 32 B como:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Dark-Nexus-32B-v2.0 | 32,7 B | no disponible | other | GGUF, safetensors |
| Mistral-7B (no comparable en tamaño) | 7 B | 32 K | Apache 2.0 | GGUF, safetensors |
| Llama-3.1-8B (no comparable en tamaño) | 8 B | 128 K | Llama 3.1 | GGUF, safetensors |
| Mixtral-8x7B (MoE, tamaño similar) | 46,7 B total, 12,9 B activos | 32 K | Apache 2.0 | GGUF, safetensors |

No se dispone de datos de rendimiento comparado, por lo que no es posible afirmar que este modelo supere o iguale a alternativas como Mixtral o Llama en tareas estándar.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo sin alineación y sin información de entrenamiento publicada, existe un riesgo elevado de generar contenido falso, ofensivo o peligroso. No se recomienda su uso en aplicaciones de producción donde se requiera precisión factual.
- Riesgo de alucinación: no se ha evaluado su fiabilidad, pero es previsible que sea alto en tareas de razonamiento o conocimiento factual.
- Licencia: la licencia "other" no especifica los términos de uso, lo que puede implicar restricciones legales para uso comercial o distribución. Se recomienda contactar con el autor original antes de desplegarlo en producción.
- Contenido peligroso: las etiquetas "dangerous" y "unaligned" indican que el modelo puede generar instrucciones dañinas o ilegales. Su uso debe restringirse a entornos controlados y privados.
- Idioma: solo está confirmado el inglés, no hay soporte multilingüe documentado.
- Contexto desconocido: sin información sobre la longitud de contexto soportada, es difícil dimensionar el modelo para tareas de conversación larga o procesamiento de documentos extensos.
- Legalidad: el contenido explícito y no censurado puede contravenir normativas en ciertos países, especialmente en la UE. Es responsabilidad del usuario asegurarse de cumplir la legislación aplicable.

## Enlaces

- Repositorio GGUF imatrix: https://huggingface.co/mradermacher/Dark-Nexus-32B-v2.0-i1-GGUF
- Repositorio GGUF estático: https://huggingface.co/mradermacher/Dark-Nexus-32B-v2.0-GGUF
- Modelo base de ReadyArt: https://huggingface.co/ReadyArt/Dark-Nexus-32B-v2.0
- Página de solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests

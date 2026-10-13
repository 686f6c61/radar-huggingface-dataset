# alandotcom/kol-cleanup-360m-coreml

## Resumen

Kol cleanup 360M (Core ML) es un modelo especializado en la limpieza de transcripciones de dictado en inglés, desarrollado por el usuario alandotcom como componente del motor local de la aplicación de dictado para macOS Kol. No es un modelo conversacional de propósito general: recibe una transcripción cruda de reconocimiento automático del habla junto con contexto extraído de la pantalla (vocabulario, título de la conversación, campo de texto con foco, reglas ortográficas personalizadas del usuario) y devuelve exactamente las mismas palabras con puntuación, mayúsculas, eliminación de muletillas y corrección de la ortografía de términos contextuales. Explícitamente no reformula ni reescribe el contenido.

Técnicamente es un ajuste LoRA de rango 16 fusionado sobre HuggingFaceTB/SmolLM2-360M-Instruct, con unos 360 millones de parámetros, convertido a un ML Program de Core ML en fp16 para macOS 15 o superior y con caché clave-valor con estado. La ventana de contexto útil es de 1.024 tokens compartidos entre prompt y salida, suficiente para dictados cortos y medianos. Su relevancia actual está en que resuelve el posprocesado del dictado íntegramente en el dispositivo, sin enviar audio ni transcripciones a servicios en la nube, con una latencia medida de 250 ms medianos por limpieza en un M5 Pro.

El modelo se apoya en una plantilla de chat propia (versión de prompt `compact-en-v2`) y en un contrato de entrada JSON documentado en `cleanup-manifest.json`. Está publicado bajo licencia Apache 2.0, es monolingüe en inglés y, en el momento de redactar esta ficha, el repositorio acumula 0 descargas y 0 "likes", por lo que no cuenta aún con validación externa de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base SmolLM2-360M-Instruct) con LoRA de rango 16 fusionado y exportado como Core ML ML Program en fp16, con caché KV con estado |
| Parámetros totales | Aproximadamente 360 M (heredados de SmolLM2-360M-Instruct; el repositorio no publica el recuento exacto) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 1.024 tokens en total, sumando prompt y salida |
| Tipos de cuantización | No disponible (solo se distribuye el artefacto fp16 de Core ML; no hay variantes GGUF, AWQ ni GPTQ publicadas) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML ML Program (`Cleanup.mlpackage`, fp16) más tokenizador en formato HuggingFace (`tokenizer.json`, `vocab.json`, `merges.txt`, `tokenizer_config.json`, `special_tokens_map.json`, `chat_template.jinja`, `config.json`) |
| Tamaño del repositorio | 0,7 GB |
| Versión de prompt | `compact-en-v2` |

## Arquitectura y entrenamiento

La base es SmolLM2-360M-Instruct, un transformer decoder-only de pequeño tamaño. Sobre ella se aplicó un ajuste LoRA de rango 16 durante 5.500 pasos, con tamaño de lote 8 y tasa de aprendizaje 2e-4, partiendo de un adaptador ya entrenado con datos ficticios generados para el propio flujo de limpieza de Kol. El adaptador resultante se fusionó en los pesos base y el conjunto se convirtió a un ML Program de Core ML en fp16 con una caché clave-valor con estado de 1.024 tokens. La model card no detalla el preentrenamiento original de SmolLM2 (número de tokens, composición del corpus ni si hubo RLHF o DPO) más allá de remitir a la ficha del modelo base.

La mezcla de datos de ajuste combina 20.000 pares muestreados de tres conjuntos públicos de limpieza de dictado —`juanquivilla/sotto-transcript-cleanup` (MIT), `shantanugoel/aawaaz-transcript-cleanup-dataset` (MIT) y `MagicNoThief/handy-dictation-editing` (CC-BY-4.0)— filtrados para conservar únicamente ejemplos en los que el texto limpiado emplease las palabras del propio hablante y no eliminase tacos, palabras de énfasis (literally, honestly, seriously, totally, actually, basically) ni negaciones, más unos 20.800 ejemplos generados con nombres ficticios que cubren vocabulario de pantalla, títulos de conversación, separadores y operadores de código, menciones, números y texto literal. No se usaron dictados reales de usuarios para el entrenamiento.

La innovación técnica destacable está en la interfaz de inferencia: el modelo expone `input_ids`, `cache_position` y `causal_mask` sobre una caché de 1.024 tokens, y devuelve el siguiente token por posición con decodificación voraz. Kol aprovecha esa salida para verificar hasta 32 tokens "borrador" por llamada, copiados por adelantado desde la transcripción, de modo que la mayor parte de una limpieza se resuelve en unas pocas invocaciones al modelo.

## Capacidades

- Limpieza de transcripciones ASR: puntuación, mayúsculas, eliminación de muletillas y corrección de errores de reconocimiento, manteniendo las palabras originales del hablante.
- Aplicación de vocabulario procedente de la pantalla: corrección de nombres propios y jerga específica inyectada mediante el campo `vocabulary` de la entrada.
- Respeto de reglas ortográficas personalizadas del usuario (`custom_rules`) y de menciones (`mentions_enabled`).
- Adaptación al campo de texto con foco y al contexto de la aplicación destino (`focused`, `ide`, `conversation_name`).
- Conservación deliberada de tacos, palabras de énfasis y negaciones, a diferencia de otros conjuntos de referencia que sí las eliminan.
- Manejo de elementos técnicos en el texto: separadores y operadores de código, números y texto literal.
- Capacidad de devolver la cadena `EMPTY` cuando no hay contenido que limpiar.
- Soporte de decodificación voraz con verificación de borradores de hasta 32 tokens por llamada.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito; no es un modelo de chat de propósito general.
- Multilingüismo: no disponible, únicamente inglés.

## Casos de uso

- Dictado en macOS dentro de la aplicación Kol: el modelo recibe la transcripción cruda del reconocedor y la devuelve puntuada y con mayúsculas antes de pegarla, aprovechando la caché KV y la ventana de 1.024 tokens para dictados cortos y medianos.
- Corrección de vocabulario técnico en editores de código y terminales: usando el campo `ide` y `vocabulary`, convierte términos mal reconocidos por el ASR en identificadores correctos (por ejemplo, nombres de funciones, rutas o separadores) sin reformular la frase.
- Limpieza de mensajes en aplicaciones de mensajería y correo: adapta el registro al campo de texto con foco y conserva el tono informal, útil para dictar respuestas rápidas sin pasar por un servicio en la nube.
- Posprocesado de transcripciones en entornos con requisitos de privacidad (clínicas, despachos jurídicos): al ejecutarse íntegramente en el dispositivo mediante Core ML, el texto dictado no sale del Mac, y el modelo mantiene negaciones y matices que alterarían el significado si se eliminasen.
- Normalización de nombres propios en actas y notas de reunión: el campo `conversation_name` y la lista de vocabulario permiten fijar la grafía correcta de participantes y productos, con una exactitud declarada del 98,6 % en nombres propios sobre la suite de desarrollo.
- Integración en flujos de atajos o automatizaciones de macOS: la interfaz de Core ML permite invocar el modelo desde un atajo o script y obtener la limpieza en unas pocas llamadas, con 250 ms medianos por limpieza en un M5 Pro.
- Base para ajustes LoRA adicionales en otras tareas de reescritura restringida: la receta (LoRA rango 16, 5.500 pasos, lote 8, lr 2e-4 sobre SmolLM2-360M-Instruct) y los conjuntos públicos empleados sirven como punto de partida reproducible para dominios o idiomas distintos del inglés.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card:

| Conjunto de evaluación | Métrica | Resultado |
|---|---|---|
| Suite ficticia de desarrollo (1.000 casos) | Coincidencia exacta | 89,4 % |
| Suite ficticia de desarrollo, nombres propios | Exactitud | 98,6 % |
| Suite anterior (400 casos) | Aciertos | 391/400 |
| handy eval (held-out público) | Coincidencia exacta | 305/400 |
| sotto validation (held-out público) | Coincidencia exacta | 185/397 |
| Latencia en Kol sobre M5 Pro | Mediana de limpieza completa, incluida la coincidencia de nombres de Kol | 250 ms |

Nota del autor sobre los conjuntos held-out: sus referencias eliminan palabras de énfasis que este modelo conserva a propósito, por lo que la coincidencia exacta penaliza ese comportamiento.

## Requisitos de hardware

- Inferencia pensada para Apple Silicon con macOS 15 o superior; el artefacto es un ML Program de Core ML que utiliza la caché KV con estado.
- Peso de los pesos en fp16: aproximadamente 0,7 GB, coherente con el tamaño del repositorio. La memoria unificada necesaria es de ese orden más la caché de 1.024 tokens, por lo que debería caber holgadamente en cualquier Mac con 8 GB o más de memoria unificada.
- El autor reporta 250 ms medianos por limpieza completa en un M5 Pro. No se publican datos de throughput en lote ni de consumo energético.
- No se documenta compatibilidad con GPU NVIDIA, ROCm ni con pilas tipo CUDA; el formato Core ML no se carga directamente en vLLM, TGI, llama.cpp ni Ollama.
- Despliegue: compilación única del paquete con `MLModel.compileModel(at:)` y ejecución a través de Core ML desde la aplicación Kol u otra app de macOS. Para usar la base fuera de Core ML habría que reconvertir los pesos, algo que el repositorio no documenta.
- Requiere los ficheros de tokenizador y `cleanup-manifest.json` incluidos en el repositorio para respetar el contrato de entrada y salida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kol cleanup 360M (Core ML) | ~360 M, LoRA rango 16 fusionado | 1.024 tokens (prompt + salida) | Limpieza de dictado con contexto de pantalla, sin reformulación | Apache 2.0 | Core ML fp16, repositorio de 0,7 GB |
| SmolLM2-360M-Instruct (modelo base) | ~360 M | No disponible en la información proporcionada | Instrucciones generales y generación de texto | Apache 2.0 | Pesos Transformers |
| Otros modelos públicos de limpieza de dictado en Core ML | No disponible | No disponible | No disponible | No disponible | No se han encontrado en la búsqueda web |

No se han localizado en la información disponible alternativas publicadas directamente comparables (mismo tamaño, misma tarea y mismo formato de despliegue). Los conjuntos de datos de limpieza de dictado citados (`sotto-transcript-cleanup`, `aawaaz-transcript-cleanup-dataset`, `handy-dictation-editing`) son fuentes de datos, no modelos competidores.

## Limitaciones y advertencias

- Solo inglés: el modelo no procesa otros idiomas.
- Ventana de 1.024 tokens compartida entre prompt y salida, lo que limita el tamaño de los dictados que puede limpiar en una sola pasada.
- El autor reconoce que en ocasiones sigue eliminando o escribiendo mal alguna palabra; el ejemplo citado es "erred" escrito como "errred".
- Para mitigar alteraciones de contenido, Kol verifica cada salida contra la transcripción y pega la transcripción original cuando aparece un nombre de contexto que el habla no respalda. Esa salvaguarda vive en la aplicación, no en el modelo.
- Los conjuntos held-out empleados para evaluar eliminan palabras de énfasis que este modelo conserva deliberadamente, de modo que las cifras de coincidencia exacta (305/400 y 185/397) infravaloran su comportamiento respecto al criterio de diseño.
- La suite principal de evaluación es ficticia y generada, no dictado real; el autor declara que no se usaron dictados de usuarios para el entrenamiento.
- Riesgo de alucinación: aunque la tarea está restringida a reescribir sin reformular, cualquier sustitución de palabras puede alterar el significado. En dominios sensibles conviene validar la salida contra la transcripción, como hace Kol.
- Sesgos conocidos: no disponibles. No se ha publicado ningún análisis de sesgos.
- Licencia del modelo: Apache 2.0, que permite uso comercial. Los datos de entrenamiento proceden de conjuntos con licencias MIT (dos de ellos) y CC-BY-4.0 (uno), por lo que la atribución correspondiente debe verificarse si se redistribuyen derivados.
- Madurez: 0 descargas y 0 "likes" en HuggingFace en el momento de la consulta, sin validación independiente por parte de la comunidad.
- Dependencia de plataforma: al estar empaquetado como Core ML, no se puede desplegar en infraestructura Linux con GPU sin reconversión, y queda atado a macOS 15 o superior y a hardware de Apple.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alandotcom/kol-cleanup-360m-coreml
- Modelo base SmolLM2-360M-Instruct: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Repositorio de Kol en GitHub: https://github.com/alandotcom/Kol
- README de Kol: https://github.com/alandotcom/Kol/blob/main/README.md
- Dataset juanquivilla/sotto-transcript-cleanup (MIT): https://huggingface.co/datasets/juanquivilla/sotto-transcript-cleanup
- Dataset shantanugoel/aawaaz-transcript-cleanup-dataset (MIT): https://huggingface.co/datasets/shantanugoel/aawaaz-transcript-cleanup-dataset
- Dataset MagicNoThief/handy-dictation-editing (CC-BY-4.0): https://huggingface.co/datasets/MagicNoThief/handy-dictation-editing
- Perfil del autor en HuggingFace: https://huggingface.co/alandotcom
- Artículo de Forbes sobre limpieza de contenido generado por IA: https://www.forbes.com/sites/joetoscano1/2026/02/02/ai-companies-race-to-clean-up-ai-slop-because-model-performance-depends-on-it/
- Artículo sobre colapso de modelos y datos sintéticos: https://aibuzz.blog/ai-model-collapse-data-poisoning/

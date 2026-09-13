# experimentalmachines/Qwen2.5-0.5B-ExecuTorch

## Resumen

Qwen2.5-0.5B-ExecuTorch es una exportación del modelo Qwen/Qwen2.5-0.5B (revisión `060db6499f32`) al formato de ejecución ExecuTorch, publicada por el usuario experimentalmachines. No se trata de un modelo nuevo ni de un ajuste fino: es una derivada cuantizada del checkpoint original, pensada para inferencia local en dispositivos Android sin conexión a red. Incluye tokenizador, ficheros `.pte` compilados para la NPU Hexagon (HTP) de Qualcomm y metadatos de exportación por cada ventana de contexto.

El interés de la ficha está en el formato y en el objetivo, no en el modelo base: las exportaciones se han generado con ExecuTorch 1.4.0 y QAIRT 2.37.0.250724 para dos plataformas concretas, Snapdragon 8 Gen 3 (SM8650) y Snapdragon 8 Elite (SM8750), con ventanas de contexto fijas de 2.048 y 8.192 tokens respectivamente y pesos de 0,58 GB y 0,61 GB. Según la model card, se exportó cada ventana que el runner pudo construir entre 2.048 y 32.768 tokens, aunque la tabla publicada solo enumera dos ficheros.

Es relevante para desarrolladores que trabajan en inferencia on-device: permite ejecutar un LLM de 0,49 B de parámetros en la NPU de un teléfono de gama alta mediante la aplicación Android openweights o cualquier runtime ExecuTorch 1.4.0. El repositorio tiene 0 descargas y 0 likes, y los smoke tests son únicamente estructurales (no se validó la ejecución en hardware NPU real), por lo que debe considerarse material experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5-0.5B), exportado a grafos ExecuTorch con particionado QNN HTP; prefill híbrido y grafos de decode |
| Parametros totales | 0,49 B (modelo base Qwen2.5-0.5B); artefactos `.pte` de 0,58 GB (SM8650) y 0,61 GB (SM8750) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base; las exportaciones usan ventanas fijas de 2.048 a 32.768 tokens según el backend, con la ventana fijada dentro del fichero |
| Tipos de cuantizacion | receta de cuantizacion registrada por ExecuTorch para este modelo, calibrada con wikitext (1 muestra); el detalle de bits (por ejemplo w8a8) no está disponible en la información proporcionada |
| Idiomas soportados | no disponible para el export; el modelo base Qwen2.5 declara soporte multilingüe |
| Licencia | apache-2.0 (derivada de Qwen/Qwen2.5-0.5B); los binarios QNN HTP requieren el runtime QAIRT de Qualcomm bajo su AI Stack License |
| Formato de pesos | `.pte` (ExecuTorch, context binaries QNN HTP), `tokenizer.json`, `config.json` y `export-report-<window>.json`; no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo subyacente, Qwen2.5-0.5B, es un transformer decoder-only con 24 capas, dimensión oculta de 896, 14 cabezas de atención y 2 cabezas KV (Grouped Query Attention), normalización RMSNorm y activación SwiGLU, con un vocabulario de 151.936 tokens y ventana nativa de 32.768 tokens. Estos datos corresponden al modelo base publicado por Qwen; esta ficha solo reproduce los datos del export que la model card documenta.

La exportación no implica reentrenamiento ni ajuste: parte del checkpoint original y aplica la ruta de LLM estática de Qualcomm en ExecuTorch (`examples/qualcomm/oss_scripts/llama`, `--decoder_model qwen2_5-0_5b`). La receta de cuantizacion registrada por ExecuTorch para este modelo se calibró con una única muestra de wikitext, y los grafos de prefill híbrido (128 tokens por paso) y de decode se compilaron con QAIRT 2.37.0.250724 para SM8650 y SM8750. Como innovación técnica destacable, el export aprovecha el particionado a la NPU Hexagon (HTP) con ejecución híbrida CPU/NPU y KV cache preasignada en carga, lo que fija el consumo de memoria por ventana.

## Capacidades

- Generación de texto autoregresiva en el dispositivo, con decodificación token a token sobre grafos compilados para NPU HTP.
- Conversación multiturno dentro de la ventana fija elegida (2.048 tokens en el artefacto de SM8650; 8.192 tokens en el de SM8750), sin aprovechamiento de contexto de 32k salvo que se use la variante correspondiente.
- Capacidades multilingües heredadas del modelo base Qwen2.5, aunque el export no documenta una lista de idiomas verificada.
- Competencias básicas de código, aritmética sencilla y resumen propias de un modelo de 0,5 B de parámetros.
- Ejecución totalmente offline: no requiere red ni servicio en la nube.
- Soporte de tool calling, function calling, agentes, visión, audio o modo "thinking": no documentado en la información disponible; el modelo base Qwen2.5-0.5B tampoco dispone de plantilla de herramientas específica más allá del formato ChatML.

## Casos de uso

- Asistentes de texto offline en Android: la aplicación openweights puede cargar el `.pte` de 0,58 GB en un Snapdragon 8 Gen 3 y generar respuestas sin conexión, útil en entornos sin cobertura o con requisitos de privacidad estrictos.
- Autocompletado y reescritura en editores de notas: con una ventana de 2.048 tokens es suficiente para reescribir párrafos, corregir estilo o reformular frases manteniendo el texto en el dispositivo.
- Clasificación y etiquetado local de textos: categorización de tickets, detección de spam o moderación preliminar con latencia baja al ejecutarse en NPU y sin coste de API.
- Resumen de notificaciones y mensajes cortos: el modelo puede condensar hilos de mensajería dentro de la ventana de 8.192 tokens del artefacto de SM8750, manteniendo los datos en el teléfono.
- Chatbot embebido en aplicaciones de campo (inspección, logística, sanidad rural): conversaciones multiturno con contexto medio y funcionamiento sin red, integrado como módulo nativo Android.
- Prototipado de pipelines ExecuTorch: sirve como referencia para verificar la ruta de exportación (tokenizador, `config.json`, `export-report`) antes de escalar a modelos mayores o a otros backends.
- Generación de texto en juegos y ficción interactiva: diálogos de NPC o descripciones generadas localmente, donde un modelo de 0,5 B ofrece latencia aceptable a cambio de menor coherencia.
- Extracción de campos simples de formularios o correos: tareas de parsing con plantillas cortas y salida estructurada, siempre con validación posterior por el limitado tamaño del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni métricas de latencia o throughput, y los smoke tests realizados son únicamente comprobaciones estructurales de los ficheros, sin ejecución en hardware NPU real (no había runtime NPU en el host de exportación).

## Requisitos de hardware

- Plataforma objetivo: Qualcomm Snapdragon 8 Gen 3 (SM8650) para el artefacto de 2.048 tokens y Snapdragon 8 Elite (SM8750) para el de 8.192 tokens; ambos requieren NPU Hexagon (HTP).
- Memoria: los pesos ocupan 0,58 GB (SM8650) y 0,61 GB (SM8750). El runtime reserva la KV cache completa al cargar, por lo que el consumo total depende de la ventana elegida; la model card usa como referencia un presupuesto de 5 GB por dispositivo (`fits_phone_budget`).
- VRAM de escritorio: no aplica. No se distribuyen artefactos para GPU de servidor ni para CPU de PC; no hay pesos safetensors ni GGUF en el repositorio.
- GPU recomendadas: no disponible (el export está orientado a NPU móvil, no a A100, H100 o RTX 4090).
- Ejecución en GPU de consumo: no soportada por estos artefactos.
- Opciones de despliegue: aplicación Android openweights o cualquier runtime ExecuTorch 1.4.0 con soporte Qualcomm; requiere `executorch-android-qnn` 1.4.0 y `qnn-runtime` 2.37.0. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-0.5B-ExecuTorch (este) | 0,49 B | ventanas fijas de 2.048 a 32.768 | `.pte` (ExecuTorch QNN) | apache-2.0 + runtime QAIRT de Qualcomm | 0 descargas, 0 likes; validación solo estructural |
| Qwen/Qwen2.5-0.5B (base) | 0,49 B | 32.768 tokens | safetensors (PyTorch) | apache-2.0 | Modelo de referencia de Qwen, ampliamente usado |
| Exportaciones GGUF de Qwen2.5-0.5B para llama.cpp | 0,49 B | Configurable por ventana en runtime | GGUF (Q4_K_M y similares) | apache-2.0 | Datos concretos de rendimiento no disponibles en esta búsqueda |
| Otros LLM on-device de tamaño similar (por ejemplo Llama 3.2 1B en ExecuTorch) | 1,2 B aprox. | no disponible | `.pte` | Llama Community License | Existen, pero no se dispone de cifras verificadas en la información proporcionada |

La comparación directa con alternativas de la misma categoría (exportaciones ExecuTorch para Android) no puede completarse con datos numéricos: la información disponible no incluye benchmarks ni métricas de latencia de ninguno de los modelos citados.

## Limitaciones y advertencias

- Tamaño muy reducido: 0,49 B de parámetros implica razonamiento limitado, errores frecuentes en matemáticas de varios pasos, código no trivial y alta tasa de alucinación en preguntas factuales.
- Cobertura incompleta respecto a lo anunciado: la model card afirma que se exportó cada ventana entre 2.048 y 32.768 tokens, pero la tabla de ficheros solo enumera dos artefactos (2.048 tokens en SM8650 y 8.192 en SM8750).
- Validación insuficiente: los smoke tests son estructurales; no se ha verificado la ejecución en NPU real durante la exportación. El repositorio registra 0 descargas y 0 likes, sin evidencia de uso por terceros.
- Dependencia de software propietario: los context binaries QNN HTP se compilaron con QAIRT 2.37.0.250724 y se ejecutan bajo la AI Stack License de Qualcomm. Aunque los pesos derivan de un modelo apache-2.0, la ejecución práctica queda condicionada por ese runtime y su versión exacta.
- Ventana de contexto fija en el fichero: el runtime asigna la KV cache completa en la carga, de modo que elegir una ventana grande consume memoria de forma constante y puede impedir el despliegue en dispositivos con menos RAM. La sección "Memory" de la model card está vacía.
- Sesgos heredados del modelo base Qwen2.5, entrenado con corpus mayoritariamente en inglés y chino; el comportamiento en otras lenguas, incluido el castellano, no está verificado en este export.
- Restricciones de licencia: la licencia apache-2.0 del modelo base se mantiene, pero el uso comercial de los binarios QNN exige cumplir los términos de Qualcomm, no cubiertos por esa licencia.
- Metadatos de fecha atípicos: el repositorio declara creación y actualización en 2026-09-13, dato que no se puede contrastar con fuentes externas.
- La búsqueda web no devolvió documentación adicional sobre este export; toda la información procede de la model card del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/experimentalmachines/Qwen2.5-0.5B-ExecuTorch
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B/blob/main/LICENSE
- Aplicación Android openweights: https://github.com/alpharomercoma/openweights
- Ejecución del exportador (run 1): https://github.com/ExperimentalMachines/executorch-model-exporter/actions/runs/34749188381
- Repositorio de ExecuTorch: https://github.com/pytorch/executorch
- La búsqueda web realizada no aportó enlaces relevantes sobre este modelo; los resultados obtenidos correspondían a páginas corporativas de Microsoft sin relación con la ficha.

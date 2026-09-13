# jakeatx/Agnes-3.0-Flash-GGUF

## Resumen

Agnes-3.0-Flash-GGUF es una compilación de cuantizaciones en formato GGUF del modelo Agnes-AI/Agnes-3.0-Flash, publicada por el usuario jakeatx. Se trata, por tanto, de un artefacto de conversión y no de un modelo entrenado desde cero: el repositorio toma los pesos safetensors del checkpoint base (fijados a la revisión `24f712ce59379b54c4a141d2708c35daf5ff613b`) y genera versiones de menor precisión para inferencia en CPU y GPU con la familia de herramientas llama.cpp. El repositorio declara licencia apache-2.0 y etiquetas `gguf`, `agnes` y `mtp`, y en el momento de la consulta no registra descargas ni likes.

La relevancia de esta publicación es doble. Por un lado, ofrece el modelo base en cuantizaciones dinámicas de tipo `UD` (Q3_K_XL, Q4_K_XL, Q4_K_M, Q5_K_XL, Q6_K_XL) más una variante IQ4_XS, lo que permite ejecutarlo en hardware con menos VRAM que los safetensors originales. Por otro, y esto es lo más singular, los GGUF conservan la rama FFN paralela de 2.048 de ancho del checkpoint y la cabeza MTP/NextN de una capa, elementos que el llama.cpp oficial no soporta en el momento de la publicación; por eso los artefactos se construyen sobre un fork parcheado.

El modelo base es denso, no MoE, y su arquitectura combina atención recurrente con atención global, además de una FFN principal y otra paralela. No se dispone de datos públicos sobre el número de parámetros, la longitud de contexto, los idiomas soportados ni los resultados de benchmarks en la información proporcionada, por lo que buena parte de las especificaciones de esta ficha quedan marcadas como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención recurrente y atención global, FFN principal más rama FFN paralela de 2.048 de ancho, y cabeza MTP/NextN de una capa (según la model card del repositorio GGUF) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (el modelo base es denso, no MoE, según la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | UD-Q3_K_XL, UD-Q4_K_XL, UD-Q4_K_M, UD-Q5_K_XL, UD-Q6_K_XL, ATX-IQ4_XS-M (publicación en curso según la model card) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (contiene el modelo de texto y la cabeza MTP nativa; no incluye el proyector de visión) |

## Arquitectura y entrenamiento

No hay información disponible sobre el proceso de entrenamiento del modelo base: se desconoce el número de tokens, la composición del dataset y si se aplicaron técnicas de alineación como RLHF o DPO. Lo que sí documenta la model card del repositorio GGUF es la topología de inferencia: se trata de un modelo denso (no MoE) que combina tensores de atención recurrente con tensores de atención global, una FFN principal y una segunda rama FFN paralela de 2.048 de ancho, más una cabeza MTP/NextN de una sola capa. La presencia de una cabeza MTP es habitual en arquitecturas diseñadas para decodificación especulativa o predicción multi-token, aunque el repositorio no documenta explícitamente ese uso.

La innovación técnica de esta publicación concreta está en el proceso de cuantización. Al ser un modelo denso con dos ramas FFN, las recetas dinámicas no aplican fórmulas de asignación de bits por expertos enrutados, sino una asignación por rol que distingue entre atención recurrente, atención global, FFN principal y FFN paralela; la FFN paralela hereda el tipo de tensor de la FFN principal de su misma capa. Además, la rama FFN paralela no está soportada por llama.cpp oficial, por lo que los GGUF se generaron a partir del commit oficial `3057bb66c86c46d5781e50e85462a760ba7d1feb` más un parche acotado incluido en `build-info/`, cuyo commit `5bb7de853836418731d655a287af645bdf8257a5` tiene ese commit oficial como padre directo. El proyector de visión no se incluye porque el conversor actual no soporta exportar el `mmproj` de Agnes.

## Capacidades

- Generación de texto: es la función principal del artefacto; el GGUF contiene el modelo de texto completo.
- Predicción multi-token: se conserva la cabeza MTP/NextN de una capa en todos los GGUF publicados, lo que abre la puerta a decodificación especulativa si el runtime lo implementa.
- Inferencia cuantizada: seis recetas de cuantización distintas, desde Q3_K_XL hasta Q6_K_XL, más IQ4_XS, para ajustar el equilibrio precisión/memoria.
- Capacidades multimodales: no disponibles. El proyector de visión existe en el ecosistema del modelo base, pero no se incluye en estos artefactos.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; el repositorio no declara lista de idiomas.
- Modo de razonamiento explícito ("thinking"): no disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo sin GPU de datacenter: al ofrecerse en seis niveles de cuantización, permite elegir el archivo que quepa en la VRAM disponible; las variantes Q3_K_XL e IQ4_XS son las candidatas para equipos más limitados.
- Servicio de generación de texto autoalojado: el formato GGUF es el estándar de facto para inferencia en CPU y en GPU de gama consumer mediante llama.cpp, lo que facilita montar una API interna sin depender de proveedores externos.
- Evaluación comparativa de cuantizaciones: al publicar varias recetas del mismo checkpoint, permite medir la degradación de calidad al bajar de Q6_K_XL a Q3_K_XL sobre el mismo conjunto de pruebas.
- Investigación sobre decodificación especulativa con MTP: la cabeza NextN incluida permite experimentar con propuestas multi-token siempre que el runtime la soporte, algo especialmente relevante para reducir latencia en generación larga.
- Investigación sobre arquitecturas híbridas de atención: la combinación de atención recurrente y atención global convierte al modelo en un caso de estudio para medir el impacto de la atención recurrente en memoria de caché KV y en calidad.
- Pruebas de integración de kernels no estándar: dado que la rama FFN paralela requiere un parche sobre llama.cpp, el repositorio sirve como banco de pruebas para validar la fusión de ese soporte en el árbol oficial.
- Pipelines de generación por lotes offline: con llama.cpp es viable procesar grandes volúmenes de texto sin conexión, priorizando throughput sobre latencia interactiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, ni para los safetensors originales ni para las cuantizaciones publicadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No es posible calcularla sin conocer el número de parámetros del modelo base. Como referencia metodológica, el tamaño en disco del archivo GGUF es aproximadamente `parámetros × bits por peso / 8`, y a esa cifra hay que sumar la caché KV y el overhead del runtime.
- Caché KV: depende de la longitud de contexto, el número de capas y las dimensiones de atención, datos no disponibles. La presencia de atención recurrente reduce la caché KV de esas capas frente a atención global completa, pero no se puede cuantificar con la información proporcionada.
- GPU recomendadas: no disponible. Al no conocerse el tamaño, no se puede afirmar si el modelo cabe en una RTX 4090, en una A100 o si requiere múltiples aceleradores.
- GPU de gama consumer: no confirmable. Si el modelo base es lo bastante pequeño, las variantes Q3_K_XL e IQ4_XS serían las opciones viables en tarjetas con 8-24 GB de VRAM; sin el recuento de parámetros esto queda como hipótesis, no como dato.
- Opciones de despliegue: llama.cpp con el parche incluido en `build-info/` sobre el commit `3057bb66c86c46d5781e50e85462a760ba7d1feb`. El llama.cpp oficial no soporta la rama FFN paralela en el momento de la publicación, por lo que los binarios estándar pueden fallar o ignorar esa rama. El soporte en vLLM, TGI, Ollama u otros runners no está confirmado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| Agnes-3.0-Flash (modelo base) | no disponible | no disponible | Safetensors | apache-2.0 | HuggingFace (`Agnes-AI/Agnes-3.0-Flash`) | Checkpoint original en precisión completa |
| Agnes-3.0-Flash-GGUF (esta ficha) | no disponible | no disponible | GGUF (Q3_K_XL a Q6_K_XL, IQ4_XS) | apache-2.0 | HuggingFace (`jakeatx/Agnes-3.0-Flash-GGUF`) | Conserva la cabeza MTP/NextN y la rama FFN paralela; requiere llama.cpp parcheado |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos de la misma categoría en la información proporcionada |

No es posible establecer una comparación con modelos alternativos de la misma categoría porque se desconocen el tamaño, la longitud de contexto y el rendimiento del modelo base, que son los ejes habituales de comparación.

## Limitaciones y advertencias

- Estado de publicación incompleto: la model card indica que la conversión y las subidas están en curso y que las carpetas de cuantización se publicarán a medida que terminen. No se garantiza que todas las variantes listadas estén disponibles.
- Incompatibilidad con llama.cpp oficial: la rama FFN paralela de 2.048 de ancho no está soportada por el árbol oficial en la fecha de publicación. Ejecutar estos GGUF con binarios estándar puede producir errores o ignorar silenciosamente parte de los pesos, lo que degradaría la calidad de salida sin aviso.
- Ausencia del proyector de visión: el conversor actual no soporta la exportación `mmproj` de Agnes, por lo que estos artefactos son exclusivamente de texto. Cualquier caso de uso multimodal queda descartado.
- Trazabilidad de la procedencia: los GGUF derivan de un fork parcheado, no del llama.cpp canónico. Conviene verificar que los binarios usados corresponden exactamente al commit y al parche referenciados antes de llevar el modelo a producción.
- Riesgo de alucinación: no se dispone de evaluaciones de fiabilidad; como en cualquier modelo generativo, existe riesgo de fabricar datos, especialmente en dominios especializados.
- Sesgos conocidos: no disponibles. No se ha publicado información sobre sesgos demográficos, culturales o lingüísticos.
- Limitaciones de idioma y contexto: no disponibles. El repositorio no declara idiomas soportados ni longitud de contexto, por lo que no se puede garantizar un comportamiento correcto en castellano ni en conversaciones de contexto largo.
- Impacto de la cuantización: las variantes Q3_K_XL e IQ4_XS implican pérdida de precisión frente a Q6_K_XL. La model card no incluye mediciones de degradación, así que la elección de receta debe validarse con evaluaciones propias.
- Licencia: el repositorio declara apache-2.0, que permite uso comercial, pero se desconoce si el checkpoint base arrastra condiciones adicionales; conviene revisar la licencia de `Agnes-AI/Agnes-3.0-Flash` antes de explotarlo comercialmente.
- Ausencia de tracción: cero descargas y cero likes en el momento de la consulta, sin comunidad que haya validado los artefactos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/jakeatx/Agnes-3.0-Flash-GGUF
- Modelo base: https://huggingface.co/Agnes-AI/Agnes-3.0-Flash
- Commit oficial de llama.cpp usado como base: https://github.com/ggml-org/llama.cpp/commit/3057bb66c86c46d5781e50e85462a760ba7d1feb
- Commit del parche (referenciado en `build-info/`, padre directo del commit oficial): `5bb7de853836418731d655a287af645bdf8257a5`, repositorio no especificado en la información disponible
- Paper, blog o demo del modelo base: no disponible en la información proporcionada

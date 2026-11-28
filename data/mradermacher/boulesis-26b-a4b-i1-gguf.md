# mradermacher/Boulesis-26B-A4B-i1-GGUF

## Resumen

Boulesis-26B-A4B-i1-GGUF es la colección de cuantizaciones GGUF, generadas con imatrix, del modelo Boulesis-26B-A4B publicado por SubMaroon. El trabajo de cuantización lo firma mradermacher, un publicador habitual de versiones GGUF de modelos abiertos para su uso con llama.cpp y derivados. El modelo subyacente es un merge de arquitectura MoE (mezcla de expertos) construido sobre la familia Gemma, con 25.971.339.550 parámetros totales y un tamaño de repo de 308,9 GB, lo que refleja la suma de todas las variantes de cuantización incluidas.

El modelo está orientado a roleplay y conversación, con etiquetas que indican un ajuste de tipo "heretic" (sin censura o con los mecanismos de rechazo atenuados), soporte de modo thinking/razonamiento y compatibilidad con frontends como SillyTavern. La nomenclatura A4B sugiere aproximadamente 4.000 millones de parámetros activos por token, aunque este dato no aparece confirmado de forma explícita en la información disponible. La licencia declarada es Apache 2.0 y el idioma documentado es únicamente inglés.

La relevancia de esta ficha radica en que ofrece un abanico muy amplio de cuantizaciones (desde IQ1_S de 8,6 GB hasta Q6_K de 23,3 GB), lo que permite ejecutar un modelo de casi 26.000 millones de parámetros en hardware de consumo. Además, la model card menciona que se trata de un modelo de visión, con ficheros mmproj alojados en el repositorio estático del mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) derivada de la familia Gemma, según etiquetas del autor; detalles de capas y atención no disponibles |
| Parametros totales | 25.971.339.550 |
| Parametros activos | no disponible (la nomenclatura A4B sugiere ~4B activos, sin confirmación oficial) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K, i1-Q2_K_S, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_1, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones imatrix/weighted); el modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible indica que el modelo base es un merge de arquitectura MoE etiquetado como "gemma4" y "moe", lo que apunta a una variante de la familia Gemma con capas de mezcla de expertos. El proceso de merge combina pesos de modelos preexistentes en lugar de entrenar desde cero, una técnica habitual para fusionar capacidades de distintos ajustes. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

La innovación técnica destacable de esta publicación no está en el modelo en sí, sino en el proceso de cuantización: mradermacher emplea cuantizaciones ponderadas con fichero imatrix (incluido en el repo, 0,2 GB), lo que mejora la calidad de las variantes de baja precisión respecto a las cuantizaciones estáticas. El autor también publica un repositorio estático paralelo con los ficheros mmproj para las capacidades de visión. No hay información sobre decodificación especulativa, atención lineal ni otras optimizaciones de inferencia.

## Capacidades

- Generación de texto conversacional orientada a roleplay, con etiquetas específicas para su uso en SillyTavern.
- Modo thinking/razonamiento, según las etiquetas del autor.
- Capacidades de visión: la model card indica explícitamente que es un modelo de visión, con ficheros mmproj en el repositorio estático.
- Ajuste "heretic"/uncensored: los mecanismos de rechazo están atenuados, lo que permite contenido que otros modelos bloquearían.
- Soporte multilingüe limitado al inglés según el campo de idiomas.
- No hay información sobre tool calling, function calling ni razonamiento multi-paso con agentes.

## Casos de uso

- Roleplay y narrativa interactiva: el modelo está etiquetado específicamente para roleplay y SillyTavern, por lo que encaja en frontends de chat con personajes, gestión de historial y respuestas en personaje. Las cuantizaciones Q4_K_M (17,3 GB) permiten ejecutarlo en GPUs de consumo con 24 GB de VRAM.
- Generación creativa sin restricciones: el ajuste heretic/uncensored lo hace adecuado para ficción, guiones o contenido adulto donde otros modelos rechazan la petición, siempre que se respete la legalidad aplicable.
- Experimentación con modelos MoE en local: investigadores que quieran estudiar el comportamiento de un MoE de ~26B con pocos parámetros activos pueden desplegar las variantes IQ2 o IQ3 en hardware modesto (10-13 GB) para pruebas de concepto.
- Asistentes conversacionales en inglés con despliegue en CPU: las cuantizaciones Q4_0 (15 GB) o IQ3_S (12,6 GB) permiten inferencia en llama.cpp sobre CPU con RAM suficiente, útil para prototipos sin GPU.
- Análisis de imágenes en local: al disponer de mmproj, puede usarse para descripción de imágenes o conversación multimodal en entornos sin conexión, aunque la información disponible no detalla la resolución o el codificador visual.
- Evaluación comparativa de cuantizaciones: el repositorio incluye 23 variantes con fichero imatrix, lo que permite medir el impacto de la cuantización en perplejidad y calidad conversacional sobre un mismo modelo base.
- Fine-tuning o merges posteriores: al estar bajo Apache 2.0 y con pesos GGUF, sirve como base para experimentos de fusión o para generar nuevas cuantizaciones a partir del imatrix incluido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada según cuantización: IQ1_S ~8,6 GB; IQ2_M ~10,8 GB; IQ3_S ~12,6 GB; IQ4_XS ~14,4 GB; Q4_K_M ~17,3 GB; Q5_K_M ~19,7 GB; Q6_K ~23,3 GB. Hay que sumar el contexto KV cache y, en su caso, el fichero mmproj para visión.
- GPU recomendadas: RTX 4090 (24 GB) para Q5_K_M o Q6_K; RTX 3090 (24 GB) para Q4_K_M a Q6_K; RTX 4080/4070 Ti Super (16 GB) para IQ4_XS o Q4_K_S; GPUs de 12 GB para IQ3_S o IQ3_M.
- Cabe en GPU de consumo: sí, desde IQ3_S en adelante en tarjetas de 12-16 GB, y Q4_K_M o superiores en tarjetas de 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF; los ficheros estáticos y mmproj están en el repositorio paralelo de mradermacher.
- Latencia y throughput: no disponibles. Al ser un MoE con pocos parámetros activos, se espera un throughput superior al de un modelo denso de 26B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Boulesis-26B-A4B-i1-GGUF | 25,97B totales (activos no confirmados) | no disponible | Apache 2.0 | GGUF | Roleplay, heretic, visión, MoE |
| Modelo base SubMaroon/Boulesis-26B-A4B | 25,97B | no disponible | Apache 2.0 | safetensors | Sin cuantizar; referencia de calidad |
| Cuantizaciones estáticas Boulesis-26B-A4B-GGUF | 25,97B | no disponible | Apache 2.0 | GGUF | Mismo modelo sin imatrix; incluye mmproj |

No se dispone de información sobre otros modelos comparables de la misma categoría (roleplay MoE de ~26B) en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; el rendimiento en castellano no está verificado y probablemente sea inferior.
- Al ser un ajuste heretic/uncensored, puede generar contenido ofensivo, explícito o inseguro; requiere filtrado y moderación en cualquier despliegue público.
- Riesgo de alucinación inherente a los modelos generativos, agravado en las cuantizaciones de muy baja precisión (IQ1, IQ2, Q2_K_S), que el propio autor describe como "for the desperate" o "very low quality".
- No hay datos publicados de benchmarks, contexto máximo ni parámetros activos, lo que dificulta evaluar su idoneidad para tareas de razonamiento o código.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base es un merge de origen Gemma; conviene revisar las condiciones de la familia Gemma por si imponen restricciones adicionales.
- El tamaño del repo (308,9 GB) implica que descargar todas las variantes es inviable en la mayoría de entornos; hay que seleccionar una cuantización concreta.
- No hay información sobre tool calling ni soporte de agentes, por lo que no se recomienda para pipelines que dependan de function calling.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Boulesis-26B-A4B-i1-GGUF
- Modelo base: https://huggingface.co/SubMaroon/Boulesis-26B-A4B
- Cuantizaciones estáticas (incluye mmproj): https://huggingface.co/mradermacher/Boulesis-26B-A4B-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Boulesis-26B-A4B-i1-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/

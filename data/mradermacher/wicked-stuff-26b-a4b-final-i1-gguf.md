# mradermacher/Wicked-Stuff-26B-A4B-Final-i1-GGUF

## Resumen

Wicked-Stuff-26B-A4B-Final-i1-GGUF es el conjunto de cuantizaciones GGUF generadas por mradermacher (nethype GmbH) a partir del modelo ReadyArt/Wicked-Stuff-26B-A4B-Final, un modelo conversacional de rol orientado a contenido adulto y explícito, sin alineamiento de seguridad. No es un modelo nuevo: es una redistribución en formatos cuantizados del modelo base, con cuantizaciones ponderadas mediante fichero imatrix y un conjunto adicional de cuantizaciones estáticas publicadas en un repositorio hermano. El uso previsto declarado por el autor es roleplay, ERP (roleplay erótico), narrativa de terror y violencia explícita, conversación multi-turno e instrucciones.

El modelo base cuenta con 25.233.142.046 parámetros reales según los safetensors del repositorio original. El sufijo "A4B" del nombre sugiere una arquitectura de mezcla de expertos con aproximadamente 4.000 millones de parámetros activos por token, aunque esta cifra no está confirmada en la información disponible. La model card del cuantizador afirma además que el modelo base es multimodal (visión), con ficheros mmproj alojados en el repositorio de cuantizaciones estáticas.

La relevancia de esta ficha es práctica: se trata de una de las pocas vías para ejecutar un modelo de 25.000 millones de parámetros en hardware de consumo, gracias a cuantizaciones que van desde IQ1_S hasta Q6_K, con licencia Apache 2.0 y compatibilidad con el ecosistema llama.cpp. El repositorio tiene 38,6 GB en total y, en el momento de la consulta, 0 descargas y 0 likes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el sufijo "A4B" del nombre sugiere mezcla de expertos con ~4B activos; no confirmado) |
| Parametros totales | 25.233.142.046 |
| Parametros activos | No disponible (el nombre implica ~4B; sin confirmación en la información proporcionada) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K; más fichero imatrix (0,2 GB) para generar cuantizaciones propias |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); el modelo base en transformers/safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base en la documentación proporcionada. El nombre "26B-A4B" sigue la convención habitual para modelos dispersos (mezcla de expertos) en los que se indica el total de parámetros y los activos por token, lo que encajaría con un transformer MoE de ~25B totales y ~4B activos; sin embargo, ni la model card del modelo base ni la del cuantizador confirman esta estructura, el número de expertos, la función de enrutamiento ni el esquema de atención.

Tampoco se detallan los datos de entrenamiento: no hay cifra de tokens, composición del dataset, ni mención a fases de RLHF, DPO o ajuste por preferencias. La model card del cuantizador se limita a documentar el proceso de cuantización (imatrix ponderada, tensor quantised, convert_type hf) y a remitir al repositorio del modelo base para cualquier detalle técnico. La etiqueta "unaligned" del repositorio indica que el modelo no ha pasado por un proceso de alineamiento orientado a rechazar contenido sensible, lo que es coherente con su uso declarado en roleplay explícito.

Sí hay un dato técnico relevante aportado por el autor de las cuantizaciones: el modelo base se describe como modelo de visión ("This is a vision model"), y los posibles ficheros mmproj (proyector multimodal) se alojan en el repositorio de cuantizaciones estáticas, no en este. Es decir, este repositorio i1 contiene únicamente los pesos del modelo de lenguaje; para inferencia multimodal habría que descargar el mmproj desde el repositorio estático.

## Capacidades

- Generación de texto conversacional e instrucciones, con foco en diálogo multi-turno y mantenimiento de personaje.
- Roleplay y ERP (roleplay erótico) sin filtros de contenido, incluyendo contenido sexual explícito.
- Narrativa de terror y violencia explícita, según los tags del autor (Horror, Violence, mature, explicit).
- Modo conversacional e instruct: admite formato de chat e instrucciones directas.
- Capacidad multimodal (visión) heredada del modelo base según la model card del cuantizador; requiere el fichero mmproj del repositorio estático.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al inglés según el campo `language`.

## Casos de uso

- Roleplay narrativo de larga duración: el modelo mantiene personajes y contexto conversacional en sesiones multi-turno; su tamaño (25B) permite una coherencia de personaje superior a la de modelos de 7-8B, y las cuantizaciones Q4_K_M/Q5_K_M conservan ese margen en GPUs de consumo.
- Escritura de ficción adulta y terror explícito: útil para autores que necesitan un modelo sin rechazos ni autocensura en escenas de violencia o contenido sexual, con control de estilo mediante system prompt.
- Generación de contenido para plataformas de rol interactivo: integrable en backends compatibles con la API de llama.cpp u Ollama, con cuantizaciones IQ3/IQ4 para servir varias sesiones concurrentes en una sola GPU de 24 GB.
- Investigación sobre alineamiento y seguridad: el modelo sirve como referencia de comportamiento "unaligned" para estudiar tasas de rechazo, degradación de filtros y eficacia de guardarraíles externos, siempre en entornos controlados y aislados.
- Creación de personajes y guiones para videojuegos narrativos: el modelo puede generar ramificaciones de diálogo con tono adulto o gore, y las cuantizaciones pequeñas (IQ2/IQ3) permiten prototipado rápido en local antes de pasar a hardware mayor.
- Fine-tuning posterior sobre dominio propio: la licencia Apache 2.0 y el formato GGUF permiten usar las cuantizaciones para evaluación y, partiendo del modelo base en safetensors, aplicar LoRA sobre estilos o personajes concretos.
- Procesamiento de imágenes con contexto narrativo (descripción de escenas, roleplay visual): posible si se descarga el mmproj del repositorio estático, aunque la información disponible no detalla el alcance real de la capacidad visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la model card del cuantizador ni los metadatos del repositorio incluyen MMLU, HumanEval, GSM8K, MT-Bench ni evaluaciones de rol (por ejemplo, EQ-Bench o similares). Tampoco hay datos de perplejidad comparativos entre las distintas cuantizaciones de este repositorio; la única referencia gráfica enlazada por el autor es un gráfico genérico de perplejidad por tipo de cuantización de ikawrakow, no específico de este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (el repositorio completo ocupa 38,6 GB, incluidas todas las cuantizaciones y el fichero imatrix; los tamaños por fichero no se detallan y las cifras siguientes son estimaciones a partir de los 25,2B de parámetros):
  - IQ1_S / IQ1_M: ~6-7 GB.
  - IQ2_XXS / IQ2_XS / IQ2_S / IQ2_M: ~7-9 GB.
  - Q2_K / Q3_K_S / IQ3_XXS: ~10-11 GB.
  - Q3_K_M / IQ3_M / Q3_K_L: ~12-13 GB.
  - Q4_0 / Q4_1 / Q4_K_S / IQ4_XS: ~13-15 GB.
  - Q4_K_M: ~15-16 GB.
  - Q5_K_S / Q5_K_M: ~17-18 GB.
  - Q6_K: ~20-21 GB.
- Hay que sumar a esas cifras la caché KV, cuyo tamaño depende del contexto configurado y de la arquitectura (no disponible); con contextos largos, el consumo puede crecer varios GB.
- GPU recomendadas: RTX 4090 / 3090 (24 GB) para Q4_K_M y Q5_K_M con contexto moderado; RTX 4080 / 4070 Ti Super (16 GB) para IQ3/IQ4; A100 40/80 GB o H100 para servicio concurrente con contexto largo o para Q6_K sin comprometer VRAM.
- Sí cabe en GPU de consumo: cualquier tarjeta con 12 GB o más puede ejecutar IQ2/IQ3; con 24 GB se llega a Q5_K_M y, con contexto reducido, a Q6_K. Las cuantizaciones IQ1/IQ2 permiten incluso 8 GB de VRAM, a costa de degradación notable de calidad.
- En CPU y RAM del sistema: las cuantizaciones Q4 o inferiores son viables con 16-32 GB de RAM, con throughput muy inferior al de GPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp (habitual en cargas de rol), llama-cpp-python y text-generation-webui. vLLM y TGI tienen soporte limitado o nulo para GGUF; para servir en producción a escala conviene partir del modelo base en safetensors con vLLM.
- Latencia y throughput estimados: no disponibles. Al tratarse presumiblemente de un MoE con ~4B activos, el throughput por token debería ser más alto que el de un modelo denso de 25B con el mismo ancho de banda de memoria, pero no hay mediciones publicadas que lo confirmen.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones verificadas de modelos alternativos de rol sin censura en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento rigurosa. La comparación disponible se limita a las tres variantes del mismo modelo:

| Modelo | Parámetros | Formato | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/Wicked-Stuff-26B-A4B-Final-i1-GGUF (este repo) | 25,23B | GGUF con imatrix (24 tipos de cuantización) | No disponible | Apache 2.0 | HuggingFace, 0 descargas, 0 likes |
| mradermacher/Wicked-Stuff-26B-A4B-Final-GGUF | 25,23B | GGUF estáticas + posible mmproj de visión | No disponible | Apache 2.0 | HuggingFace (repo hermano) |
| ReadyArt/Wicked-Stuff-26B-A4B-Final | 25,23B | Safetensors (transformers) | No disponible | Apache 2.0 | HuggingFace (modelo base) |

Como referencia de categoría, los modelos de rol sin censura de tamaño similar suelen publicarse con licencias permisivas y cuantizaciones GGUF en repositorios de terceros, pero no se han encontrado en la búsqueda web datos verificables de alternativas concretas (parámetros, contexto, benchmarks) para incluirlos en esta tabla.

## Limitaciones y advertencias

- Contenido no apto para todos los públicos: el repositorio está etiquetado como `nsfw`, `explicit`, `not-for-all-audiences`, con contenido sexual explícito y violencia. No debe desplegarse en productos accesibles a menores ni sin filtros externos.
- Modelo "unaligned": no incorpora salvaguardas de seguridad; no se puede confiar en que rechace peticiones dañinas, ilegales o abusivas. Cualquier uso en producción requiere una capa de moderación propia.
- Riesgo de alucinación: no hay evaluaciones publicadas de fidelidad factual; en un modelo orientado a ficción, la invención de datos es esperable y no debe usarse como fuente de información.
- Idiomas: solo inglés declarado. El rendimiento en castellano u otras lenguas no está documentado y previsiblemente será degradado.
- Contexto: se desconoce la longitud máxima soportada; configurar contextos mayores de los entrenados produce degradación silenciosa.
- Licencia: Apache 2.0 permite uso comercial del artefacto, pero el contenido generado y su distribución pueden incumplir las políticas de la plataforma de despliegue, la legislación sobre contenido sexual o las normas de proveedores cloud. La licencia no cubre responsabilidad sobre el uso.
- Cuantizaciones de muy baja precisión (IQ1_S, IQ1_M, IQ2_XXS): pérdida de calidad apreciable en coherencia, seguimiento de instrucciones y vocabulario; no recomendables para evaluación comparativa ni para producción sensible a calidad.
- Visión: la capacidad multimodal depende de descargar el mmproj desde otro repositorio; este repo i1 no lo incluye, y no se documenta el alcance real del entendimiento de imágenes.
- Sin benchmarks ni métricas de rendimiento publicadas: no es posible justificar decisiones de despliegue en datos objetivos.
- Metadatos: 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace (este modelo): https://huggingface.co/mradermacher/Wicked-Stuff-26B-A4B-Final-i1-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Wicked-Stuff-26B-A4B-Final
- Cuantizaciones estáticas y posibles ficheros mmproj: https://huggingface.co/mradermacher/Wicked-Stuff-26B-A4B-Final-GGUF
- Lista de descargas del autor para este modelo: https://hf.tst.eu/model#Wicked-Stuff-26B-A4B-Final-i1-GGUF
- Preguntas frecuentes y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF citada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de perplejidad por tipo de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
- Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo (solo páginas de inicio de sesión de Gmail), por lo que no hay papers, blogs ni demos adicionales que enlazar.

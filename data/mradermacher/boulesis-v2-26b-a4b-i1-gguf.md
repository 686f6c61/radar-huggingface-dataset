# mradermacher/Boulesis-v2-26B-A4B-i1-GGUF

## Resumen

Boulesis-v2-26B-A4B-i1-GGUF es una recopilación de cuantizaciones en formato GGUF generada por el usuario mradermacher a partir del modelo SubMaroon/Boulesis-v2-26B-A4B. El modelo base cuenta con 25.971.339.550 parámetros (aproximadamente 26.000 millones) y, según las etiquetas del repositorio, se trata de un merge de arquitectura MoE (mixture of experts) con nomenclatura A4B, además de estar asociado a la familia gemma4. La licencia declarada es la de Gemma y el único idioma soportado de forma explícita es el inglés.

El modelo está orientado a rol conversacional (roleplay), generación sin censura, y modos de razonamiento o thinking, con etiquetas que lo vinculan a herramientas como SillyTavern. La cuantización incluye variantes con imatrix (weighted quants) que el autor describe como de mayor calidad que las cuantizaciones estáticas equivalentes, además de un archivo imatrix independiente para que terceros puedan generar sus propias cuantizaciones.

Su relevancia práctica radica en que permite ejecutar un modelo de ~26.000 millones de parámetros en hardware de consumo mediante cuantizaciones de entre 10,9 GB y 17,3 GB, manteniendo el comportamiento conversacional y el modo de razonamiento del modelo original. El repositorio ocupa 81,9 GB en total y no incluye archivos mmproj, que el autor remite al repositorio de cuantizaciones estáticas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (según etiquetas del repositorio); arquitectura interna no detallada en la información disponible |
| Parametros totales | 25.971.339.550 (aproximadamente 26B) |
| Parametros activos | no disponible (la nomenclatura A4B del nombre sugiere del orden de 4B activos, sin confirmación en la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K (10,9 GB), i1-IQ3_XXS (11,7 GB), i1-IQ3_M (12,8 GB), i1-Q3_K_M (13,7 GB), i1-Q4_K_S (16,0 GB), i1-Q4_K_M (17,3 GB); archivo imatrix (0,2 GB). El listado de cuantizaciones del constructor incluye además Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_L, Q4_0, Q4_1, Q4_K_M, IQ4_XS, IQ4_NL, Q5_K_S, Q5_K_M y Q6_K, disponibles como cuantizaciones estáticas en un repositorio aparte |
| Idiomas soportados | en (inglés) |
| Licencia | gemma |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); archivo imatrix.gguf adicional para generar cuantizaciones propias |

## Arquitectura y entrenamiento

La información disponible indica que el modelo base es un merge y que su arquitectura es MoE, con etiquetas que lo asocian a la familia gemma4. No se documentan en la model card el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineamiento posteriores. Tampoco se detalla el procedimiento de fusión de pesos ni los modelos fuente combinados.

La etiqueta heretic sugiere el uso de técnicas de eliminación o atenuación de los mecanismos de alineamiento (decensoring), si bien el autor no documenta este proceso ni su alcance. La etiqueta thinking indica que el modelo expone un modo de razonamiento explícito. El autor de la cuantización aplica el método i1 con archivo imatrix: las cuantizaciones ponderadas por matriz de importancia, que según la documentación adjunta suelen presentar una perplejidad menor que las cuantizaciones estáticas del mismo tamaño, especialmente en los rangos bajos (IQ3_XXS, Q3_K_M).

## Capacidades

- Generación de texto conversacional y roleplay multi-turno, con etiquetas que lo vinculan explícitamente a SillyTavern.
- Modo de razonamiento o thinking, según la etiqueta reasoning/thinking del repositorio.
- Comportamiento sin censura (uncensored) en las respuestas, lo que reduce el rechazo de peticiones dentro del ámbito del modelo.
- Capacidad de visión declarada por el autor de la cuantización: la model card indica que es un modelo de visión y que los archivos mmproj, si existen, se encuentran en el repositorio de cuantizaciones estáticas.
- Soporte de tool calling o function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso más allá del modo thinking: no disponibles.
- Multilingüismo: limitado al inglés según el campo de idiomas declarado.
- Capacidades de audio: no disponibles.

## Casos de uso

- Roleplay y personajes persistentes: el modelo está etiquetado específicamente para roleplay y se integra con frontends como SillyTavern, de modo que puede mantener conversaciones con una ficha de personaje y un historial largo. Es adecuado para este fin porque su entrenamiento declarado prioriza el diálogo narrativo frente a tareas factuales.
- Escritura creativa sin filtros editoriales: permite generar ficción, diálogos y tramas con temáticas que otros modelos alineados rechazarían, lo que resulta útil para autores que trabajan con material sensible o experimental.
- Despliegue local en hardware de consumo: las cuantizaciones i1-Q4_K_S (16,0 GB) e i1-Q4_K_M (17,3 GB) caben en GPU de 24 GB, lo que permite ejecutar el modelo en una estación de trabajo sin depender de APIs externas.
- Experimentación en seguridad y alineamiento: al ser un modelo decensurado, sirve como punto de comparación en estudios sobre eficacia de técnicas de alineamiento, tasas de rechazo y comportamientos residuales tras el decensoring.
- Prototipado de asistentes con razonamiento visible: el modo thinking permite inspeccionar la cadena de razonamiento del modelo en tareas de planificación sencilla, útil para depurar prompts antes de pasar a modelos mayores.
- Análisis de imágenes en local, si se dispone del archivo mmproj: la model card declara capacidad de visión, por lo que podría emplearse para descripción de imágenes o extracción de información visual, siempre que se obtenga el proyector multimodal del repositorio de cuantizaciones estáticas.
- Generación de datasets sintéticos de diálogo: la combinación de modo thinking y ausencia de rechazos permite producir corpus conversacionales variados, que después requerirían revisión humana por riesgo de contenido inapropiado o sesgado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de evaluaciones de roleplay, y los resultados de la búsqueda web no contienen información técnica relevante sobre el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, según los tamaños publicados por el autor): 10,9 GB con i1-Q2_K, 11,7 GB con i1-IQ3_XXS, 12,8 GB con i1-IQ3_M, 13,7 GB con i1-Q3_K_M, 16,0 GB con i1-Q4_K_S y 17,3 GB con i1-Q4_K_M. Hay que sumar el espacio de la caché KV, cuyo tamaño exacto no puede calcularse porque no se documentan la longitud de contexto ni el número de capas.
- GPU con 24 GB de VRAM (RTX 3090, RTX 4090, A10G, L4 en versiones de 24 GB): ejecutan las cuantizaciones i1-Q4_K_S e i1-Q4_K_M completas, con margen para contexto moderado.
- GPU con 16 GB de VRAM (RTX 4080, RTX 4060 Ti 16 GB, A4000): pueden alojar i1-Q4_K_S (16,0 GB) solo de forma muy ajustada; con caché KV activa es probable tener que recurrir a offload parcial a CPU o a cuantizaciones i1-IQ3_M o inferiores.
- GPU con 12 GB de VRAM (RTX 3060 12 GB, RTX 4070): limitadas a i1-IQ3_XXS (11,7 GB) o i1-Q2_K (10,9 GB), con contexto reducido y degradación de calidad apreciable.
- Memoria unificada en Apple Silicon: los equipos con 24 GB o 32 GB de memoria unificada pueden cargar las cuantizaciones de 16-17 GB, aunque el rendimiento depende del ancho de banda del chip.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y text-generation-webui para los archivos GGUF; el modelo base en safetensors puede servirse con transformers y, potencialmente, con vLLM, si bien no se documenta compatibilidad explícita.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/Boulesis-v2-26B-A4B-i1-GGUF | 25,97B | no disponible | GGUF (imatrix) | gemma | Cuantización ponderada por imatrix; 6 cuantizaciones publicadas y archivo imatrix |
| mradermacher/Boulesis-v2-26B-A4B-GGUF | 25,97B | no disponible | GGUF (estáticas) | gemma | Mismo modelo base, cuantizaciones estáticas; aloja los archivos mmproj del componente de visión |
| SubMaroon/Boulesis-v2-26B-A4B | 25,97B | no disponible | safetensors | gemma | Modelo base sin cuantizar, punto de partida de ambas recopilaciones |

No se dispone de datos de benchmarks ni de especificaciones de contexto para establecer una comparación cuantitativa con alternativas de otros autores en la misma categoría (merges MoE de ~26B orientados a roleplay). No disponible.

## Limitaciones y advertencias

- Licencia gemma: el uso comercial y la redistribución están sujetos a los términos de uso de Gemma de Google, que imponen obligaciones de atribución y restricciones de uso. Conviene revisar el texto completo antes de integrarlo en un producto.
- Modelo decensurado: la etiqueta heretic implica que se han atenuado las barreras de rechazo. Esto aumenta el riesgo de generar contenido ofensivo, ilegal o inseguro sin aviso, y lo hace inadecuado para aplicaciones orientadas al público general sin moderación adicional.
- Sesgos: no se documenta ninguna evaluación de sesgos ni de seguridad. Al tratarse de un merge sin información sobre los datos de entrenamiento, la composición y los sesgos heredados de los modelos fuente son desconocidos.
- Alucinación: no se publican métricas de veracidad. Un modelo orientado a roleplay y decensurado tiene mayor probabilidad de inventar hechos con seguridad aparente, sobre todo fuera de contextos narrativos.
- Idioma: únicamente se declara inglés. El rendimiento en castellano no está evaluado y probablemente sea inferior.
- Contexto: la longitud de ventana no está documentada, lo que impide garantizar conversaciones largas o procesamiento de documentos extensos.
- Calidad de las cuantizaciones: las variantes por debajo de Q4 (i1-Q2_K, i1-IQ3_XXS) degradan la calidad de forma notable según las propias notas del autor; en tareas de razonamiento o roleplay complejo se recomienda i1-Q4_K_S o superior.
- Visión condicionada: aunque el autor declara que es un modelo de visión, no hay archivos mmproj en este repositorio. Sin el proyector multimodal del repositorio estático, la entrada de imágenes no funcionará.
- Sin benchmarks ni adopción verificable: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no hay resultados de evaluación publicados, por lo que la calidad real del merge no puede contrastarse.
- Repositorio de 81,9 GB: la descarga completa requiere espacio en disco considerable; conviene descargar únicamente el archivo de la cuantización deseada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Boulesis-v2-26B-A4B-i1-GGUF
- Modelo base: https://huggingface.co/SubMaroon/Boulesis-v2-26B-A4B
- Cuantizaciones estáticas (incluye los archivos mmproj de visión): https://huggingface.co/mradermacher/Boulesis-v2-26B-A4B-GGUF
- Página de resumen y lista de descargas del autor: https://hf.tst.eu/model#Boulesis-v2-26B-A4B-i1-GGUF
- Archivo imatrix: https://huggingface.co/mradermacher/Boulesis-v2-26B-A4B-i1-GGUF/resolve/main/Boulesis-v2-26B-A4B.imatrix.gguf
- Guía de uso de archivos GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones y preguntas frecuentes sobre cuantizaciones: https://huggingface.co/mradermacher/model_requests
- Comparativa de perplejidad entre tipos de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor de la cuantización: https://www.nethype.de/

Los resultados de la búsqueda web proporcionados no contienen información relevante sobre el modelo: se trata de anuncios clasificados de material de windsurf y de la plataforma Kleinanzeigen, sin relación con el repositorio.

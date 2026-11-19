# mradermacher/Boulesis-v2.1-26B-A4B-HeadTune-i1-GGUF

## Resumen

Boulesis-v2.1-26B-A4B-HeadTune-i1-GGUF es una cuantizacion en formato GGUF, generada por mradermacher, del modelo SubMaroon/Boulesis-v2.1-26B-A4B-HeadTune. Se trata de un modelo de lenguaje conversacional orientado a roleplay y generacion de texto, construido como un merge de modelos de la familia Gemma con arquitectura de mezcla de expertos (MoE), segun las etiquetas declaradas por el autor. El sufijo "A4B" indica aproximadamente 4 mil millones de parametros activos, mientras que el total real de parametros en pesos safetensors asciende a 25.971.339.550.

El modelo se distribuye exclusivamente en ingles y esta pensado para su uso en entornos de rol conversacional, con soporte declarado para SillyTavern y capacidades de razonamiento y modo "thinking". La etiqueta "heretic" y "uncensored" sugiere que el autor ha aplicado tecnicas de ablacion de rechazos para reducir la censura en las respuestas, lo que lo hace inadecuado para aplicaciones que requieran filtros de seguridad estrictos.

La relevancia de esta ficha radica en que el repositorio ofrece un conjunto amplio de cuantizaciones (desde IQ1_S de 8,6 GB hasta Q6_K de 23,3 GB) con matriz de importancia (imatrix), lo que permite desplegar un modelo MoE de casi 26 mil millones de parametros en hardware de consumo. Es, por tanto, un ejemplo representativo del ecosistema de cuantizacion comunitaria orientado a inferencia local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) derivada de Gemma (etiqueta "gemma4", "moe") |
| Parametros totales | 25.971.339.550 |
| Parametros activos | ~4 mil millones (inferido del sufijo A4B; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K, Q2_K_S, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_1, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (todas con imatrix) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de las etiquetas declaradas: "gemma4" y "moe". Esto indica que el modelo base es un derivado de la familia Gemma con arquitectura de mezcla de expertos, con aproximadamente 26 mil millones de parametros totales y alrededor de 4 mil millones activos por token (deducido del sufijo A4B, aunque la model card no lo confirma explicitamente). El modelo es un merge, es decir, una combinacion de pesos de modelos existentes, no un entrenamiento desde cero.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF o DPO. Las etiquetas "heretic" y "uncensored" sugieren la aplicacion de tecnicas de ablacion de direcciones de rechazo, habituales en la comunidad para eliminar comportamientos de negativa aprendidos, pero no se documenta el metodo concreto. Tampoco se especifican innovaciones tecnicas como decodificacion especulativa o atencion lineal.

La cuantizacion ha sido realizada por mradermacher con matriz de importancia (imatrix) y el esquema de cuantizacion i1, que emplea calibracion para mejorar la calidad de las cuantizaciones de baja precision. Se incluye un fichero imatrix separado (0,2 GB) para que terceros puedan generar sus propias cuantizaciones.

## Capacidades

- Generacion de texto conversacional con enfasis en roleplay y narrativa interactiva.
- Razonamiento y modo "thinking" declarado en las etiquetas del modelo, orientado a tareas que requieren cadenas de pensamiento explicitas.
- Soporte para SillyTavern, segun la etiqueta "sillytavern", lo que implica compatibilidad con el formato de prompt y las convenciones de personajes de esa interfaz.
- Modelo descensurado ("uncensored"): reduce las negativas a peticiones, lo que afecta a su comportamiento en dominios sensibles.
- Idioma: exclusivamente ingles.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, vision, audio ni matematicas avanzadas.
- No se documenta soporte multilingue.

## Casos de uso

- Roleplay conversacional local: el modelo esta disenado para mantener personajes y conversaciones multi-turno en herramientas como SillyTavern, con cuantizaciones Q4_K_M de 17,3 GB que caben en GPUs de consumo de gama alta.
- Generacion de narrativa interactiva: writers y aficionados pueden ejecutar el modelo en local para generar ficcion ramificada o dialogos de personajes sin depender de servicios en la nube, gracias a la licencia Apache 2.0.
- Investigacion sobre des censura y alineacion: la etiqueta "heretic" lo hace util como objeto de estudio para analizar como las tecnicas de ablacion afectan a la distribucion de respuestas y a los sesgos residuales.
- Prototipado de interfaces conversacionales: desarrolladores que necesiten un backend de chat con contexto de personaje pueden integrarlo mediante llama.cpp u Ollama sin coste de API.
- Evaluacion de cuantizaciones: el amplio rango de variantes (de IQ1_S a Q6_K) permite estudiar la degradacion de calidad en un MoE de ~26B bajo distintos niveles de compresion, usando el fichero imatrix incluido.
- Despliegue en hardware modesto: las variantes IQ2 e IQ3 (entre 9,6 y 12,8 GB) permiten ejecutar el modelo en GPUs de 12-16 GB de VRAM o en configuraciones con offload a CPU, a costa de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre ~8,6 GB (i1-IQ1_S) y ~23,3 GB (i1-Q6_K). La variante recomendada i1-Q4_K_M ocupa 17,3 GB en disco.
- GPU recomendadas: para Q6_K o Q5_K_M, GPUs de 24 GB o mas (RTX 3090, RTX 4090, A10G, L4 con 24 GB). Para Q4_K_M, 20-24 GB de VRAM. Para IQ3_M o IQ3_S, GPUs de 12-16 GB (RTX 4070 Ti, RTX 4080, RTX 4060 Ti de 16 GB).
- Cabe en GPU de consumo: si, en la mayoria de variantes. Las cuantizaciones IQ2 e IQ3 caben en GPUs de 12 GB; Q4_K_M requiere 16-24 GB. Al ser un MoE con ~4B activos, la velocidad de generacion es superior a la de un modelo denso del mismo tamano total.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa sin conversion.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Se espera un throughput relativamente alto por token generado gracias al reducido numero de parametros activos, aunque no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Boulesis-v2.1-26B-A4B-HeadTune (i1-GGUF) | ~26B | ~4B | no disponible | Apache 2.0 | GGUF | Roleplay, ingles, descensurado |
| Modelos Gemma MoE de referencia | no disponible | no disponible | no disponible | Gemma license | safetensors/GGUF | Base arquitectonica declarada |
| MoE de ~30B con ~3-4B activos de la misma generacion | no disponible | no disponible | no disponible | variable | variable | Categoria comparable por relacion total/activos |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a la categoria arquitectonica.

## Limitaciones y advertencias

- Idioma: solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Modelo descensurado: la ablacion de rechazos puede producir respuestas inapropiadas, ofensivas o inseguras en dominios sensibles. No es apto para aplicaciones orientadas al publico sin capas de moderacion adicionales.
- Riesgo de alucinacion: como todo modelo generativo, puede inventar hechos, especialmente en contextos de roleplay donde la coherencia narrativa prima sobre la veracidad.
- Origen comunitario: es un merge no oficial de la familia Gemma, sin evaluacion estandarizada publicada ni garantias de calidad del autor original.
- Datos incompletos: no se documentan contexto maximo, composicion del dataset ni metodo de alineacion, lo que dificulta evaluar su comportamiento en produccion.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base puede arrastrar condiciones adicionales de la licencia de Gemma que no se detallan en la model card; conviene verificar el repositorio del modelo base antes de un despliegue comercial.
- Cuantizaciones de baja precision: las variantes IQ1 e IQ2 degradan notablemente la calidad; la propia model card advierte de que Q2_K_S es de "muy baja calidad" y que IQ1_S es "para desesperados".
- Sin soporte documentado de tool calling ni agentes: no debe asumirse su uso en pipelines automatizados que requieran llamadas a funciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Boulesis-v2.1-26B-A4B-HeadTune-i1-GGUF
- Modelo base: https://huggingface.co/SubMaroon/Boulesis-v2.1-26B-A4B-HeadTune
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Boulesis-v2.1-26B-A4B-HeadTune-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

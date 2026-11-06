# mradermacher/shaylah-darija-4b-merged-i1-GGUF

## Resumen

Shaylah Darija 4B (merged) es un modelo conversacional de aproximadamente 4.205 millones de parametros especializado en dariya (arabe marroqui), desarrollado por el usuario laabidate y publicado en Hugging Face. La ficha que se presenta aqui corresponde a la version cuantizada en formato GGUF con imatrix (matriz de importancia) realizada por mradermacher, un cuantizador muy activo de la comunidad que genera versiones optimizadas de modelos populares para su ejecucion en hardware de consumo.

El modelo aborda un problema concreto y con demanda real: la escasez de LLM capaces de conversar con naturalidad en dariya, una variedad del arabe hablada en Marruecos con fuerte componente oral y muy poco representada en los corpus de entrenamiento habituales. Ademas de conversacion general, el modelo incorpora el tag "folk-culture", lo que sugiere un enfoque tambien en la cultura popular marroqui. Al tratarse de un modelo de 4B parametros con licencia Apache 2.0, resulta adecuado para despliegues locales, chatbots ligeros y experimentacion en dispositivos modestos.

Esta version cuantizada ofrece un amplio abanico de formatos que van desde IQ1_S (1,5 GB) hasta Q6_K (3,6 GB), lo que permite ajustar el equilibrio entre calidad, consumo de memoria y velocidad de inferencia segun el hardware disponible. Es relevante ahora por el creciente interes en modelos linguisticamente especificos para lenguas poco servidas (low-resource languages) y por la madurez del ecosistema GGUF (llama.cpp, Ollama, LM Studio) para ejecutarlos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, base fusionada/merged) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, IQ3_XXS, Q2_K, Q3_K_S, IQ3_XS, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, IQ4_NL, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas con imatrix) |
| Idiomas soportados | arabe (dariya/arabe marroqui); ar |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado con imatrix); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

El modelo base, laabidate/shaylah-darija-4b-merged, es un modelo de unos 4,2 mil millones de parametros etiquetado como "merged", lo que indica que se trata de una fusion (model merging) de pesos de modelos previos, una tecnica habitual para combinar capacidades sin entrenamiento adicional completo. La model card no documenta la arquitectura subyacente exacta, ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Lo unico constatable a partir de los tags es su orientacion conversacional en dariya y su vinculo tematico con la cultura popular marroqui (folk-culture).

La version aqui descrita no es el modelo original sino una recuantizacion: mradermacher genera cuants ponderados mediante imatrix (importance matrix), una tecnica que calcula estadisticas de importancia por tensor sobre un corpus de calibracion para reducir la perdida de calidad en cuantizaciones agresivas, especialmente en los niveles bajos (IQ1/IQ2/IQ3). El repositorio incluye ademas un archivo imatrix independiente (0,1 GB) para quien desee generar sus propias cuantizaciones. Existe tambien una version de cuants estaticos en un repositorio hermano.

## Capacidades

- Generacion de texto conversacional en dariya (arabe marroqui), su capacidad principal segun los tags del modelo.
- Cobertura tematica de la cultura popular marroqui (tag folk-culture), util para preguntas sobre tradiciones, expresiones y contexto cultural.
- Comprension del arabe en general (idioma declarado: ar), aunque el foco es la variante marroqui.
- Ejecucion eficiente en local gracias al formato GGUF, con 24 niveles de cuantizacion distintos para ajustar tamano y calidad.
- No hay informacion disponible sobre: soporte de vision, audio, tool calling, function calling, agentes, razonamiento multi-paso ni modo de pensamiento extendido (thinking mode).

## Casos de uso

- Chatbots de atencion al cliente en Marruecos: un modelo pequeno (4B) y especializado en dariya puede gestionar conversaciones en la lengua materna de los usuarios, donde los LLM generalistas suelen rendir mal o responder en arabe estandar.
- Asistentes de aprendizaje de dariya: estudiantes de la variante marroqui pueden practicar conversacion con un modelo afinado a ese registro, algo dificil de conseguir con modelos generalistas.
- Aplicaciones de preservacion cultural: dado el tag folk-culture, puede integrarse en herramientas de documentacion y difusion de tradiciones, refranes y expresiones populares marroquies.
- Despliegue en dispositivos de bajos recursos: con cuants de 1,5-2,8 GB (IQ1_S a Q4_K_M), el modelo cabe en telefonos, portatiles sin GPU dedicada o mini-PC mediante llama.cpp u Ollama.
- Prototipado rapido de productos para el mercado marroqui: la licencia Apache 2.0 permite uso comercial sin restricciones, ideal para validar ideas de producto con IA conversacional local.
- Investigacion en lenguas poco servidas: base util para experimentos de evaluacion, traduccion adaptada o fine-tuning adicional sobre dariya, aprovechando el archivo imatrix para generar cuants propios.
- Integracion en aplicaciones de mensajeria: su tamano reducido permite servir el modelo en una sola GPU de consumo o incluso en CPU para bots de WhatsApp o Telegram en dariya.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye un grafico generico de comparacion de tipos de cuantizacion (perplejidad por tipo de quant, elaborado por ikawrakow) que no evalua al modelo en si.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: depende del quant elegido; desde ~1,5 GB (IQ1_S/IQ1_M) hasta ~3,6 GB (Q6_K), mas el contexto. Con Q4_K_M (2,8 GB), bastan unos 4 GB de memoria disponibles.
- GPU recomendadas: cualquier GPU moderna con 4 GB o mas de VRAM ejecuta el modelo con holgura (RTX 3060, RTX 4060, RTX 4090, etc.). No se necesitan A100 ni H100.
- Consumer GPUs: cabe perfectamente; incluso cuants altos como Q6_K (3,6 GB) caben en GPUs de gama media. Tambien es viable su ejecucion solo con CPU dada la eficiencia de GGUF.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, KoboldCpp, y cualquier runtime compatible con GGUF. No es un despliegue tipico de vLLM/TGI por ser GGUF; para vLLM habria que usar el modelo base en safetensors.
- Latencia y throughput: no disponibles; al ser un modelo de 4B con cuants ligeros, se esperan velocidades altas incluso en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Idioma/Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| shaylah-darija-4b-merged (esta version) | 4,21B | GGUF (imatrix, 24 quants) | Dariya (arabe marroqui), conversacional | Apache 2.0 | Hugging Face, descarga libre |
| jais-family (Inception/MBZUAI) | versiones de ~590M a 13B | safetensors | Arabe e ingles, generalista | Licencia propia (jais) | Hugging Face |
| AceGPT (versiones 7B/13B) | 7B/13B | safetensors/GGUF comunitarios | Arabe, alineado culturalmente | Licencia propia (Llama-based) | Hugging Face |

Nota: la comparacion es orientativa; no existen en la informacion disponible benchmarks que permitan comparar rendimiento numerico entre estos modelos. Shaylah destaca por su tamano reducido, su especializacion en dariya (frente al arabe estandar de jais y AceGPT) y su licencia permisiva Apache 2.0.

## Limitaciones y advertencias

- Informacion tecnica incompleta: la model card no documenta arquitectura base, longitud de contexto, plantilla de chat ni datos de entrenamiento, lo que complica su integracion en produccion sin pruebas previas.
- Cuantizaciones agresivas: los niveles IQ1_S, IQ1_M e IQ2* degradan notablemente la calidad (el propio autor los describe como "for the desperate"); se recomienda Q4_K_M como punto de equilibrio.
- Riesgo de alucinacion: no hay evaluaciones publicadas; como modelo pequeno y especializado en una lengua poco servida, el riesgo de generar contenido incorrecto es elevado, especialmente en temas factuales.
- Alcance linguistico: centrado en dariya y arabe; su rendimiento en otros idiomas, incluido el castellano o el ingles, no esta documentado y probablemente sea limitado.
- Fusion de modelos (merged): las fusiones pueden heredar licencias y sesgos de los modelos originales; el autor declara Apache 2.0, pero conviene verificar la procedencia del modelo base antes de uso comercial sensible.
- Sesgos: no se han documentado sesgos especificos, pero todo LLM conversacional puede reproducir estereotipos presentes en sus datos de entrenamiento.
- El repositorio cuantizado es un trabajo de terceros (mradermacher); cualquier incidencia de calidad derivada de la cuantizacion no es responsabilidad del autor del modelo base.

## Enlaces

- Repositorio cuantizado (esta ficha): https://huggingface.co/mradermacher/shaylah-darija-4b-merged-i1-GGUF
- Modelo base: https://huggingface.co/laabidate/shaylah-darija-4b-merged
- Version de cuants estaticos: https://huggingface.co/mradermacher/shaylah-darija-4b-merged-GGUF
- Pagina de descargas resumida: https://hf.tst.eu/model#shaylah-darija-4b-merged-i1-GGUF
- FAQ y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre tipos de quant: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Paper, blog o demo oficial: no disponibles

# mradermacher/Gala-GGUF

## Resumen

Gala-GGUF es un repositorio de cuantizaciones en formato GGUF del modelo luispoveda93/Gala, publicado por el usuario mradermacher. No se trata por tanto de un modelo nuevo, sino de una redistribucion optimizada para inferencia local del modelo original, que a su vez es un ajuste fino conversacional (SFT) con LoRA fusionada sobre una base de la familia ALIA de BSC-LT / projecte-aina. El modelo esta orientado a conversacion en catalan e ingles y se distribuye bajo licencia Apache 2.0.

El dato objetivo de tamano es de 752.393.024 parametros totales segun los pesos safetensors del modelo base, es decir, en torno a 0,75 mil millones de parametros. Esto lo situa en la categoria de modelos pequenos, capaces de ejecutarse en CPU y en GPUs de consumo con requisitos de memoria muy bajos: las cuantizaciones publicadas van desde 0,5 GB (Q2_K) hasta 1,6 GB (f16). Es relevante ahora porque permite desplegar asistentes conversacionales en catalan en hardware modesto, incluso en portatiles o dispositivos sin GPU dedicada, algo poco habitual en el ecosistema de modelos catalanes.

El repositorio incluye ademas dos ficheros `mmproj` (proyector multimodal en Q8_0 y f16), lo que sugiere que el modelo base incorpora capacidad multimodal, aunque la model card del cuantizador no documenta esta caracteristica. No se ha publicado informacion sobre arquitectura interna, longitud de contexto, composicion del dataset de entrenamiento ni resultados de benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada; el modelo base se distribuye para transformers y se cuantiza a GGUF (compatible con la familia de arquitecturas de llama.cpp), lo que implica un transformer decoder-only |
| Parametros totales | 752.393.024 (segun safetensors del modelo base) |
| Parametros activos | No aplica (no consta que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | mmproj-Q8_0, mmproj-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, IQ4_XS, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Catalan (ca) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors para transformers |
| Tamano del repositorio | 7,8 GB (todas las cuantizaciones juntas) |
| Fecha de publicacion | 12 de septiembre de 2026 |
| Modelo base | luispoveda93/Gala |
| Datasets de ajuste | BSC-LT/ALIA-2606-SFT, projecte-aina/MentorCA |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo. Los metadatos indican que el modelo base luispoveda93/Gala es el resultado de un ajuste supervisado (SFT) con LoRA fusionada sobre una base de la familia ALIA desarrollada por BSC-LT, y que los datos de ajuste provienen de dos conjuntos: BSC-LT/ALIA-2606-SFT y projecte-aina/MentorCA, ambos vinculados a iniciativas de modelos en catalan de Barcelona Supercomputing Center y Projecte Aina. El numero de tokens de entrenamiento, la composicion exacta del dataset y el uso de tecnicas adicionales (RLHF, DPO, decodificacion especulativa) no estan documentados en la informacion disponible.

En cuanto al proceso de cuantizacion, el repositorio se genero con la herramienta de mradermacher (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`) y se trata de cuantizaciones estaticas: los quants ponderados o con matriz de importancia (imatrix) no estaban disponibles en el momento de la publicacion, segun indica la propia model card. La presencia de ficheros `mmproj` (proyector multimodal) es un indicio de que el modelo base contempla entrada multimodal, pero no se detalla que modalidad ni como se activa.

## Capacidades

- Generacion de texto conversacional multi-turno en catalan e ingles, fruto del ajuste SFT sobre datos de ALIA y MentorCA.
- Capacidades multilingues limitadas a catalan e ingles segun los metadatos de idioma del repositorio; no se declaran otros idiomas.
- Uso como asistente conversacional generalista de gama ligera (0,75 mil millones de parametros).
- Inferencia local en CPU y GPU gracias al formato GGUF y a las cuantizaciones de 2 a 8 bits.
- Posible soporte multimodal a traves de los ficheros `mmproj` incluidos, aunque no esta documentado ni confirmado en la model card.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking o razonamiento explicito: no disponible en la informacion proporcionada.
- Capacidades de audio o vision confirmadas: no disponible; los ficheros mmproj apuntan a multimodalidad, sin especificar.

## Casos de uso

- Asistente conversacional en catalan para atencion al ciudadano: el modelo puede gestionar dialogos multi-turno en catalan en entornos de administracion publica o servicios locales, desplegado en servidores modestos o incluso en el puesto de trabajo, lo que reduce costes de infraestructura y evita enviar datos a servicios externos.
- Chatbot de soporte en producto digital para el mercado catalan: integrado como microservicio con llama.cpp o Ollama, permite ofrecer respuestas en catalan e ingles dentro de una misma aplicacion sin depender de APIs de terceros.
- Prototipado rapido de aplicaciones de IA generativa: con un peso de entre 0,5 y 1,6 GB, es adecuado para ciclos de experimentacion en portatiles, entornos de docencia o hackatones donde no hay GPUs de datacenter disponibles.
- Generacion y revision de texto en catalan: redaccion asistida de correos, resumenes o borradores de documentacion en catalan, con la ventaja de que el ajuste proviene de datasets especificos de esa lengua (ALIA, MentorCA).
- Inferencia en el borde (edge computing) y dispositivos sin GPU: al caber en menos de 1 GB en Q4_K_M, puede ejecutarse en mini-PC, Raspberry Pi de gama alta o portatiles antiguos, habilitando asistentes locales sin conexion.
- Evaluacion y comparacion de modelos catalanes: sirve como punto de referencia ligero para medir calidad conversacional en catalan frente a modelos mayores, en tareas de investigacion sobre el ecosistema linguistico catalan.
- Filtrado o preprocesado de texto a gran escala: su bajo coste por token permite usarlo para clasificacion ligera, etiquetado o generacion de resumenes previos en pipelines que luego pasan por un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizaciones no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y la busqueda web realizada no devolvio resultados relacionados con el modelo (los resultados obtenidos eran contenido no pertinente sobre alimentacion canina). Tampoco se dispone de medidas de latencia o throughput publicadas por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,5 y 0,7 GB en cuantizaciones de 2 a 5 bits (Q2_K a Q5_K_M), en torno a 0,9 GB en Q8_0 y 1,6 GB en f16, sin contar la cache KV del contexto.
- Cache KV: depende de la longitud de contexto, que no esta documentada; con 0,75 mil millones de parametros, la cache KV es pequena incluso con contextos de varios miles de tokens (del orden de decenas o pocos cientos de MB).
- GPUs recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente, incluidas NVIDIA GTX 1050 Ti / GTX 1650, RTX 3050, RTX 4060, RTX 4090, asi como iGPUs modernas. No se requiere A100 ni H100.
- Ejecucion en CPU: plenamente viable; es probable que alcance decenas de tokens por segundo en CPUs de escritorio modernas con cuantizaciones Q4_K_M, aunque no hay cifras oficiales publicadas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos diez anos, y tambien en hardware integrado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, servidores compatibles con la API de OpenAI a traves de llama.cpp, y en menor medida vLLM con soporte GGUF. Para los pesos originales en safetensors, transformers con PyTorch.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.
- Nota sobre multimodalidad: si se desea usar la parte multimodal, hay que cargar tambien el fichero `mmproj` correspondiente (0,2 GB en Q8_0 o 0,3 GB en f16), lo que anade ese consumo de memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/Gala-GGUF (esta ficha) | 752.393.024 | No disponible | Sin benchmarks publicados en la informacion disponible | Apache 2.0 | GGUF en HuggingFace; tamano de repo 7,8 GB |
| luispoveda93/Gala (modelo base) | 752.393.024 | No disponible | Sin benchmarks publicados en la informacion disponible | Apache 2.0 | Pesos en safetensors para transformers |
| Otros modelos catalanes de tamano similar (familia ALIA, FLOR, etc.) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificados de benchmarks ni de especificaciones de contexto de modelos alternativos dentro de la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable. La comparacion con el modelo base es la unica que puede hacerse con datos ciertos: misma cantidad de parametros y misma licencia, con la diferencia de que esta version ofrece pesos cuantizados para inferencia local.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse sobre datasets de SFT en catalan e ingles, puede heredar sesgos presentes en esos corpus (BSC-LT/ALIA-2606-SFT y projecte-aina/MentorCA).
- Riesgo de alucinacion: elevado en terminos relativos, como corresponde a un modelo de 0,75 mil millones de parametros; no debe usarse como fuente de verdad sin verificacion externa, especialmente en dominios factuales, legales o medicos.
- Limitaciones de contexto: la longitud de contexto no esta documentada, lo que impide planificar aplicaciones que dependan de ventanas largas; conviene validarla empiricamente antes de desplegar.
- Limitaciones de idioma: solo se declaran catalan e ingles; el rendimiento en castellano u otras lenguas no esta garantizado y probablemente sea inferior.
- Calidad de las cuantizaciones: las cuantizaciones de 2 y 3 bits (Q2_K, Q3_K_S, Q3_K_M, Q3_K_L) degradan la calidad de forma apreciable; se recomienda Q4_K_M o superior para uso en produccion. El autor advierte ademas de que no habia cuantizaciones ponderadas ni con imatrix en el momento de la publicacion.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indique los cambios; conviene verificar la licencia del modelo base y de los datasets utilizados, ya que el cuantizador no la detalla mas alla de los metadatos.
- Caveat de produccion: el repositorio tiene 0 descargas y 0 likes en el momento del analisis, por lo que no existe validacion comunitaria de su calidad; ademas, la fecha de creacion es muy reciente.
- Trazabilidad: al ser una redistribucion cuantizada, cualquier problema de calidad puede originarse tanto en el proceso de cuantizacion como en el modelo base; para depuracion conviene comparar contra luispoveda93/Gala en precision completa.
- Multimodalidad no documentada: los ficheros `mmproj` sugieren soporte multimodal, pero su funcionamiento, la modalidad cubierta y los requisitos de uso no estan descritos; no deberia asumirse en produccion sin pruebas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Gala-GGUF
- Modelo base: https://huggingface.co/luispoveda93/Gala
- Dataset BSC-LT/ALIA-2606-SFT: https://huggingface.co/datasets/BSC-LT/ALIA-2606-SFT
- Dataset projecte-aina/MentorCA: https://huggingface.co/datasets/projecte-aina/MentorCA
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#Gala-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- README de referencia de TheBloke sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH (empresa que cede infraestructura al cuantizador): https://www.nethype.de/

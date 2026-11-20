# mradermacher/Wicked-Stuff-31B-Final-i1-GGUF

## Resumen

Wicked-Stuff-31B-Final-i1-GGUF es una colección de cuantizaciones GGUF, generadas con imatrix, del modelo base ReadyArt/Wicked-Stuff-31B-Final, un modelo de lenguaje de 30.697.345.596 parámetros (aproximadamente 30,7 mil millones) orientado a roleplay conversacional, ficción explícita y narrativa de terror y violencia. El trabajo de cuantización lo firma mradermacher, un autor habitual en el ecosistema GGUF que publica versiones optimizadas de modelos de terceros para su uso con llama.cpp y herramientas compatibles.

El modelo está etiquetado explícitamente como NSFW, adult-content, unaligned y not-for-all-audiences, y su propósito declarado es la generación de diálogo y narrativa para adultos, incluyendo contenido erótico, de terror y violento. No se trata de un modelo de propósito general: la model card no documenta capacidades de razonamiento, código o matemáticas, y el único idioma declarado es el inglés.

La relevancia de esta ficha reside en su vertiente práctica: el repositorio ofrece hasta 24 variantes de cuantización entre 7,3 GB (i1-IQ1_S) y 25,3 GB (i1-Q6_K), lo que permite ejecutar un modelo de 31B en hardware de consumo con distintas relaciones calidad/tamaño. La licencia declarada es Apache 2.0, aunque el contenido generado está restringido a audiencias adultas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de tipo transformer, sin detalle publicado en la informacion proporcionada) |
| Parametros totales | 30.697.345.596 (aprox. 30,7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; incluye fichero imatrix |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base original se distribuye en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base ReadyArt/Wicked-Stuff-31B-Final: la model card del repositorio de cuantizacion no detalla si se trata de un transformer denso, un MoE o una arquitectura hibrida, ni describe la composicion del dataset de entrenamiento, el numero de tokens utilizados o si hubo fases de RLHF, DPO o fine-tuning supervisado. El unico dato estructural verificable es el recuento de parametros (30.697.345.596) y el hecho de que el pipeline declarado es transformers.

La innovacion tecnica documentada en este repositorio es el proceso de cuantizacion: mradermacher genera las variantes i1 utilizando un fichero imatrix (importance matrix) calculado sobre el modelo, lo que mejora la calidad de las cuantizaciones de baja precision respecto a las cuantizaciones estaticas equivalentes. El autor publica ademas una version con cuantizaciones estaticas en un repositorio separado. Las etiquetas del repositorio incluyen "not-for-all-audiences", "nsfw" y "unaligned", lo que sugiere un ajuste orientado a roleplay sin las restricciones tipicas de los modelos alineados, aunque no se aporta detalle sobre el proceso.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a roleplay multi-turno.
- Generacion de narrativa explicita para adultos (erotica, ERP) segun las etiquetas del repositorio.
- Generacion de ficcion de terror y escenas violentas.
- Modo instruct/conversacional, segun las etiquetas del repositorio.
- Capacidad de mantener personajes y contexto narrativo en conversaciones largas (no se especifica la ventana de contexto).
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No se documenta soporte de vision, audio ni modo thinking.
- Multilingue: no disponible; solo se declara ingles.

## Casos de uso

- Roleplay conversacional para adultos: el modelo esta ajustado para mantener personajes coherentes en dialogos multi-turno con contenido explicito, lo que lo hace adecuado para plataformas de entretenimiento conversacional para mayores de edad con las salvaguardas legales correspondientes.
- Escritura asistida de ficcion adulta: generacion y continuacion de relatos eroticos o de terror, aprovechando el ajuste tematico del modelo frente a modelos alineados que rechazan este tipo de contenido.
- Narrativa de terror y suspense: generacion de escenas de violencia y horror atmosferico, un nicho poco cubierto por modelos de proposito general.
- Prototipado de personajes en videojuegos narrativos para adultos: el modelo puede generar dialogos ramificados de personajes con tono consistente, ejecutado en local con cuantizaciones Q4_K_M (18,8 GB) en GPUs de consumo de gama alta.
- Investigacion sobre modelos "unaligned": estudio academico del comportamiento de modelos sin alineacion estricta, comparando respuestas con modelos alineados del mismo tamano.
- Despliegue local con privacidad: al ejecutarse en llama.cpp u Ollama sobre hardware propio, permite generar contenido sensible sin enviar prompts a servicios en la nube, lo que resulta relevante para contenido adulto.
- Generacion de guiones para audiolibros o podcasts de ficcion para adultos, con cuantizaciones Q5_K_M (21,9 GB) para maximizar la calidad del texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 8 GB y 26 GB segun la cuantizacion. Las variantes IQ2 (8,8-11 GB) y Q3 (12-16,7 GB) permiten ejecucion parcial o total en GPUs de consumo; las variantes Q4_K_M (18,8 GB) y superiores requieren GPUs de 24 GB o mas, o bien descarga parcial a CPU.
- GPUs recomendadas: RTX 3090/4090 (24 GB) para Q4_K_M y Q5_K_S; A100 40 GB o H100 para Q6_K y para el modelo sin cuantizar; RTX 4060 Ti 16 GB o RTX 4070 Ti Super para IQ3_M e IQ4_XS.
- Cabe en GPU de consumo: si, en modelos con 12-24 GB de VRAM usando cuantizaciones IQ2 a Q5_K_S; las cuantizaciones IQ1 (7,3-7,8 GB) caben en GPUs de 8 GB pero con perdida de calidad notable segun el propio autor.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF (koboldcpp, LM Studio, text-generation-webui). No se recomienda vLLM ni TGI para estos ficheros GGUF sin conversion previa.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Wicked-Stuff-31B-Final-i1-GGUF | 30,7B | no disponible | Apache 2.0 | GGUF (i1) | Roleplay adulto, solo ingles, 24 cuantizaciones |
| Wicked-Stuff-31B-Final (base) | 30,7B | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar |
| Wicked-Stuff-31B-Final-GGUF (estatico) | 30,7B | no disponible | Apache 2.0 | GGUF (estatico) | Mismo modelo, cuantizaciones sin imatrix |
| Alternativas de roleplay de ~30B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de informacion suficiente para comparar con modelos de la misma categoria (roleplay adulto de ~30B) en parametros, contexto o rendimiento.

## Limitaciones y advertencias

- Contenido para adultos: el modelo esta disenado para generar material explicito, violento y de terror; no es apto para uso general ni para menores.
- Etiqueta "unaligned": no se documentan mecanismos de rechazo o filtrado, por lo que puede producir contenido ofensivo o inapropiado sin advertencia.
- Sesgos: no se documenta ninguna evaluacion de sesgos; al ser un modelo ajustado para ficcion, puede reproducir estereotipos presentes en los datos de entrenamiento.
- Riesgo de alucinacion: no cuantificado; como modelo generativo de ficcion, la verificacion factual no es un objetivo de diseno.
- Idioma: solo se declara soporte de ingles; el rendimiento en castellano no esta documentado y previsiblemente sera deficiente.
- Contexto: no se publica la longitud de contexto, lo que impide planificar aplicaciones que dependan de ventanas largas.
- Licencia: Apache 2.0 permite uso comercial, pero el contenido generado puede estar sujeto a restricciones legales segun la jurisdiccion (contenido adulto, violencia); el usuario debe verificar el cumplimiento normativo.
- Las cuantizaciones IQ1 e IQ2 conllevan perdida de calidad significativa, segun advierte el propio autor ("for the desperate", "very low quality").
- El repositorio tiene un unico like y unas 9.155 descargas en la fecha de consulta, lo que indica una validacion comunitaria limitada.
- No hay garantia de que el modelo base mantenga la licencia Apache 2.0 en todos sus componentes; la model card solo declara esa licencia a nivel de repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Wicked-Stuff-31B-Final-i1-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Wicked-Stuff-31B-Final
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Wicked-Stuff-31B-Final-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Wicked-Stuff-31B-Final-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/

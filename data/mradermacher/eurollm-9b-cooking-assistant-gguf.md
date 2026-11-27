# mradermacher/EuroLLM-9B-Cooking-Assistant-GGUF

## Resumen

EuroLLM-9B-Cooking-Assistant-GGUF es la distribucion en formato GGUF del modelo HumanjavaEnterprises/EuroLLM-9B-Cooking-Assistant, un ajuste fino del modelo multilingue europeo EuroLLM-9B orientado a tareas culinarias: recetas, tecnicas de cocina y asistencia conversacional en el ambito gastronomico. La cuantizacion la realiza mradermacher, un publicador habitual de versiones GGUF de modelos abiertos, y esta pensada para su uso con llama.cpp y runtimes compatibles, no con transformers de forma nativa pese a la etiqueta de libreria.

El modelo base cuenta con 9.152.319.488 parametros (aproximadamente 9,15 mil millones), lo que lo situa en la gama media de modelos densos, adecuada para inferencia en GPU de consumo con cuantizaciones de 4 a 8 bits. Declara soporte para nueve idiomas europeos (ingles, aleman, espanol, frances, italiano, neerlandes, portugues, polaco y sueco), lo que refleja la herencia multilingue de la familia EuroLLM.

La relevancia de esta ficha radica en su caracter especializado: no es un modelo generalista, sino un asistente culinario afinado sobre una base multilingue, con enfasis declarado en procedencia de la informacion (provenance) y capacidad de abtencion (abstention), es decir, reconocer cuando no dispone de informacion fiable en lugar de inventarla. La licencia Apache 2.0 facilita su uso comercial, aunque el modelo base y el proceso de ajuste condicionan las garantias reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de EuroLLM-9B; detalles de capas y atencion no disponibles) |
| Parametros totales | 9.152.319.488 (aproximadamente 9,15 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, de, es, fr, it, nl, pt, pl, sv |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (multiples ficheros por cuantizacion) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del EuroLLM-9B, un modelo de lenguaje multilingue desarrollado en el marco del proyecto europeo EuroLLM, que emplea una arquitectura transformer densa de aproximadamente 9,15 mil millones de parametros. La model card del repositorio GGUF no detalla la composicion del dataset de ajuste fino, el numero de tokens utilizados ni si se aplicaron tecnicas de RLHF, DPO o SFT. Tampoco se especifican innovaciones arquitectonicas propias del ajuste.

La informacion disponible indica que el ajuste esta orientado al dominio culinario y que incorpora etiquetas relacionadas con "provenance" (trazabilidad del origen de la informacion) y "abstention" (capacidad de declinar responder cuando no hay base fiable). No obstante, no se documenta en la model card como se implementan tecnicamente estas capacidades ni que datos de evaluacion se emplearon, mas alla de la referencia al dataset HumanjavaEnterprises/cooking-assistant-eval.

## Capacidades

- Generacion de texto conversacional especializado en cocina: recetas, tecnicas culinarias, sustituciones de ingredientes y explicaciones de procesos.
- Capacidades multilingues en nueve idiomas europeos, incluyendo espanol, con cobertura declarada de en, de, es, fr, it, nl, pt, pl y sv.
- Enfasis en procedencia de la informacion: el modelo esta etiquetado con "provenance", lo que sugiere que el ajuste busca que las respuestas indiquen o justifiquen su origen, aunque no se detalla el mecanismo.
- Capacidad de abtencion: etiquetado con "abstention", orientado a que el modelo reconozca los limites de su conocimiento culinario en lugar de inventar datos.
- Formato conversacional: la model card lo etiqueta como "conversational", adecuado para dialogos multi-turno.
- No se declara soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito (thinking mode).
- No se declara soporte de codigo ni matematicas como capacidades destacadas.

## Casos de uso

- Asistente culinario conversacional en aplicaciones de recetas: el modelo puede mantener dialogos multi-turno para adaptar recetas a restricciones dieteticas, ingredientes disponibles o nivel de habilidad del usuario, gracias a su ajuste especifico en dominio culinario.
- Atencion al cliente en plataformas de alimentacion: puede responder consultas sobre productos, conservacion, alinegenos y sustituciones en varios idiomas europeos, reduciendo la necesidad de equipos multilingues.
- Generacion de contenido editorial gastronomico: redaccion de fichas de recetas, descripciones de platos y guias de tecnicas en espanol y otros idiomas soportados, con la ventaja de la abtencion para evitar datos falsos sobre temperaturas o tiempos.
- Asistencia en cocina domestica con despliegue local: al disponer de cuantizaciones Q4_K_M de 5,7 GB, puede ejecutarse en un portatil con GPU de consumo mediante llama.cpp u Ollama, sin conexion a servicios en la nube.
- Educacion y formacion culinaria: explicacion de tecnicas, correccion de errores comunes y adaptacion de recetas a distintos niveles, con respuestas en el idioma del alumno.
- Integracion en asistentes de compra o planificacion de menus: generacion de listas de la compra y planes semanales a partir de preferencias del usuario, aprovechando el contexto conversacional.
- Traduccion y adaptacion de recetas entre idiomas europeos: el soporte multilingue permite adaptar terminologia culinaria entre espanol, frances, italiano, portugues y otros idiomas declarados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,7 GB con Q2_K; 5,4-5,7 GB con Q4_K_S/Q4_K_M; 7,6 GB con Q6_K; 9,8 GB con Q8_0; 18,4 GB con f16 (tamanos de fichero declarados en la model card, que sirven como cota inferior de memoria).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 para cuantizaciones altas; A100 o H100 para despliegues de mayor concurrencia o f16.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 8 GB o mas usando Q4_K_M; en tarjetas de 6 GB conviene bajar a Q3_K_M o IQ4_XS.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros runtimes compatibles con GGUF; el formato no es directamente compatible con vLLM o TGI sin conversion.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| EuroLLM-9B-Cooking-Assistant-GGUF (este) | 9,15 B | No disponible | 9 idiomas europeos | Apache 2.0 | GGUF |
| EuroLLM-9B (base) | 9 B | No disponible en esta ficha | Multilingue europeo | Apache 2.0 | safetensors, GGUF |
| Modelos culinarios especializados de 7-8 B | 7-8 B | Variable | Habitualmente ingles | Variable | Variable |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada; la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo es un ajuste fino de dominio muy especifico (cocina); su rendimiento fuera del ambito culinario puede degradarse respecto al EuroLLM-9B base.
- No se documentan sesgos conocidos, pero al derivar de un modelo entrenado con datos web es probable que herede sesgos culturales y culinarios, especialmente en la representacion de cocinas no europeas.
- Riesgo de alucinacion: aunque el modelo esta etiquetado con "abstention", no se aportan metricas que cuantifiquen su fiabilidad; en un dominio con riesgos de seguridad alimentaria (temperaturas, alinegenos) conviene validar las respuestas.
- La longitud de contexto no esta disponible, lo que impide garantizar dialogos largos o documentos extensos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base EuroLLM y el proceso de ajuste deben verificarse por separado; la model card no detalla condiciones adicionales del autor del ajuste.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- La libreria declarada es transformers, pero el formato GGUF requiere runtimes especificos; la etiqueta puede inducir a error.
- No se dispone de informacion sobre la calidad del ajuste ni sobre el dataset de evaluacion referenciado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/EuroLLM-9B-Cooking-Assistant-GGUF
- Modelo base del ajuste: https://huggingface.co/HumanjavaEnterprises/EuroLLM-9B-Cooking-Assistant
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#EuroLLM-9B-Cooking-Assistant-GGUF
- Dataset de evaluacion referenciado: https://huggingface.co/datasets/HumanjavaEnterprises/cooking-assistant-eval
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

# mradermacher/MiniCPM5-1B-Pashto-GGUF

## Resumen

MiniCPM5-1B-Pashto-GGUF es una recopilación de cuantizaciones en formato GGUF del modelo nassimjp/MiniCPM5-1B-Pashto, publicada por el usuario mradermacher. Se trata, por tanto, de un artefacto de conversión y cuantización, no de un modelo entrenado desde cero: el autor declara explícitamente que el repositorio no ha sido sometido a fine-tuning ni a supervisión adicional, sino que es una conversión estática del modelo base a distintos niveles de precisión. El modelo subyacente pertenece a la familia MiniCPM5 y cuenta con 1.080.774.144 parámetros (aproximadamente 1,08 mil millones), lo que lo sitúa en la gama de modelos pequeños desplegables en hardware de consumo.

La particularidad del modelo base es que fue adaptado al pastún (ps) mediante cirugía de tokenizador (tokenizer-surgery), una técnica que consiste en ampliar o reemplazar el vocabulario del tokenizador original para representar de forma más eficiente un idioma con escritura árabe y baja presencia en los corpus de entrenamiento habituales. El repositorio declara soporte para inglés, pastún, urdu, persa y árabe, lo que lo convierte en un candidato para experimentación en procesamiento de lenguas de bajos recursos (low-resource NLP) dentro del ámbito indoiranio y semítico.

Su relevancia actual es doble. Por un lado, ofrece un punto de entrada de bajo coste computacional para evaluar si la adaptación de tokenizador mejora la calidad en pastún frente a modelos multilingües genéricos. Por otro, la disponibilidad de cuantizaciones desde Q2_K (0,6 GB) hasta f16 (2,3 GB) permite ejecutar el modelo en CPU, en GPUs integradas o en GPUs de consumo con muy poca VRAM, algo crítico en escenarios de investigación con recursos limitados y en regiones donde el acceso a hardware de gama alta es restringido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada (el modelo base pertenece a la familia MiniCPM; no se detalla si es transformer denso, MoE o hibrida) |
| Parametros totales | 1.080.774.144 (aproximadamente 1,08 B) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (en), pastun (ps), urdu (ur), persa (fa), arabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors solo en el modelo base, no en este repositorio) |
| Modelo base | nassimjp/MiniCPM5-1B-Pashto |
| Cuantizador | mradermacher (nethype GmbH) |
| Version de cuantizacion | quantize_version 2, output_tensor_quantised 1, convert_type hf |
| Tamano del repositorio | 10,0 GB (suma de todos los archivos GGUF) |
| Fecha de publicacion | 10 de septiembre de 2026 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base ni la composicion de su dataset de entrenamiento. Lo unico verificable es que se trata de un modelo de la familia MiniCPM5 con 1.080.774.144 parametros, adaptado al pastun mediante cirugia de tokenizador, y que el repositorio de cuantizaciones declara cinco idiomas soportados. No se especifica el numero de tokens de entrenamiento, la mezcla de datos, la existencia de fases de RLHF, DPO o cualquier otra tecnica de alineamiento, ni innovaciones de atencion o decodificacion.

Respecto al proceso de cuantizacion, el autor documenta el uso de cuantizacion estatica de tensores (output_tensor_quantised: 1) con convert_type hf, y enumera doce variantes. Los metadatos del repositorio indican que no se han generado cuantizaciones ponderadas ni basadas en matriz de importancia (imatrix); el propio autor senala en la model card que, si estas no aparecen en la semana siguiente a la publicacion de las estaticas, probablemente no esten planificadas. Las etiquetas has-not-been-finetuned y has-not-been-supervised-finetuned confirman que no se aplico ningun proceso de ajuste posterior sobre el modelo cuantizado.

## Capacidades

- Generacion de texto conversacional en ingles, pastun, urdu, persa y arabe, segun la declaracion de idiomas del repositorio.
- Modelo etiquetado como conversational, por lo que esta orientado a dialogos multi-turno.
- Soporte de pastun mediante tokenizador adaptado (tokenizer-surgery), lo que en teoria mejora la tokenizacion eficiente de ese idioma frente a vocabularios genericos.
- Compatibilidad declarada con endpoints (endpoints_compatible), lo que facilita su integracion en infraestructuras de servicio tipo API.
- Capacidad de ejecucion en entornos de bajos recursos gracias a las cuantizaciones de 0,6 a 2,3 GB.
- No hay evidencia en la informacion proporcionada de soporte de tool calling, function calling, razonamiento multi-paso, agentes, vision, audio, modo de pensamiento explicito ni capacidades de codigo o matematicas destacables.

## Casos de uso

- Asistente conversacional en pastun para despliegue local: con 1,08 B de parametros y cuantizaciones de menos de 1 GB, el modelo puede ejecutarse en un portatil o en una Raspberry Pi con 4 GB de RAM para ofrecer respuestas en pastun sin conexion a internet.
- Investigacion en lenguas de bajos recursos: sirve como punto de comparacion para medir el efecto de la cirugia de tokenizador en la perplejidad y la calidad de generacion en pastun frente a modelos multilingues de tamano similar.
- Traduccion asistida pastun-ingles y urdu-persa: el modelo cubre los cinco idiomas declarados, por lo que puede emplearse en tareas de traduccion de frases cortas o en la generacion de borradores que un traductor humano revise.
- Preprocesamiento y etiquetado de corpus: al ser un modelo pequeno y rapido en cuantizacion Q4_K_M, es viable usarlo para normalizar texto, generar resumenes breves o clasificar documentos en pastun dentro de pipelines de curación de datos.
- Despliegue en entornos con hardware restringido (ONG, universidades, zonas con conectividad limitada): la variante Q4_K_S de 0,8 GB permite servir el modelo en una unica GPU de gama baja o incluso en CPU con llama.cpp.
- Integracion en prototipos de agentes conversacionales en ingles: la etiqueta conversational y la compatibilidad con endpoints permiten usarlo como backend economico en pruebas de concepto de chatbot antes de escalar a modelos mayores.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece doce niveles de precision, lo que lo convierte en un banco de pruebas util para estudiar la degradacion de calidad entre Q2_K, Q4_K_M y Q8_0 en un idioma con escritura arabe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K en torno a 0,6 GB; Q3_K_S y Q3_K_M entre 0,6 y 0,7 GB; IQ4_XS y Q4_K_S/Q4_K_M entre 0,7 y 0,8 GB; Q5_K_S/Q5_K_M en torno a 0,9 GB; Q6_K alrededor de 1,0 GB; Q8_0 aproximadamente 1,3 GB; f16 unos 2,3 GB. A estas cifras hay que sumar el espacio para la cache KV, cuyo tamano depende de la longitud de contexto efectiva, dato no disponible.
- Cabe con holgura en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, GTX 1650 o incluso iGPU con memoria compartida, siempre que se use Q4_K_M o inferior.
- No requiere GPUs de centro de datos (A100, H100) para inferencia; estas solo tendrian sentido para procesamiento por lotes masivo o para comparativas de throughput.
- Despliegue en CPU: viable con llama.cpp, Ollama, LM Studio o text-generation-webui, dado el reducido tamano de los archivos GGUF.
- Servido como API: la etiqueta endpoints_compatible sugiere compatibilidad con infraestructura de endpoints; tambien puede servirse con llama.cpp server u Ollama. No se confirma soporte oficial en vLLM ni en TGI para este repositorio concreto.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

No se dispone de comparativas directas ni de resultados de benchmarks que enfrenten este modelo a alternativas. La tabla siguiente recoge unicamente los datos estructurales verificables; las columnas de contexto y rendimiento se marcan como no disponibles para este modelo.

| Modelo | Parametros | Contexto | Idiomas destacados | Licencia | Notas |
|---|---|---|---|---|---|
| MiniCPM5-1B-Pashto-GGUF (este modelo) | 1,08 B | No disponible | en, ps, ur, fa, ar | Apache 2.0 | Cuantizacion GGUF de un modelo adaptado con tokenizer-surgery; sin benchmarks publicados |
| MiniCPM5-1B-Pashto (modelo base) | 1,08 B | No disponible | en, ps, ur, fa, ar | Apache 2.0 | Pesos originales; el repositorio de cuantizacion no aporta su model card |
| Alternativas de ~1-2 B de proposito general | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificados en la informacion proporcionada para establecer una comparacion fiable |

## Limitaciones y advertencias

- No existe ninguna evaluacion publicada de la calidad de generacion en pastun, urdu, persa o arabe, por lo que el rendimiento real en esos idiomas es desconocido.
- El repositorio declara explicitamente has-not-been-finetuned y has-not-been-supervised-finetuned: no ha habido ajuste por instrucciones ni alineamiento posteriores sobre esta version.
- El modelo base tampoco documenta en la informacion disponible si recibio ajuste por instrucciones, por lo que puede producir respuestas poco alineadas con el formato conversacional esperado.
- La etiqueta not-for-all-audiences indica que el modelo puede generar contenido inapropiado, ofensivo o no apto para todos los publicos; se recomienda filtrado adicional en produccion.
- Riesgo de alucinacion elevado: con 1,08 B de parametros, la capacidad de retener conocimiento factual es limitada, especialmente en temas especializados y en idiomas de bajos recursos.
- Las cuantizaciones Q2_K y Q3_K introducen degradacion de calidad apreciable; para uso real conviene emplear Q4_K_M o superior.
- La longitud de contexto no esta documentada, lo que impide planificar tareas que requieran ventanas largas o conversaciones multi-turno extensas.
- No se han generado cuantizaciones ponderadas ni imatrix, que suelen ofrecer mejor relacion calidad/tamano que las estaticas equivalentes.
- El tamano de 1,08 B limita seriamente el razonamiento multi-paso, las matematicas y la generacion de codigo.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero al tratarse de una cuantizacion de un modelo de terceros conviene verificar la licencia y las condiciones del modelo base antes de un despliegue comercial.
- La informacion sobre el proceso de entrenamiento del modelo base es practicamente inexistente en los datos disponibles, lo que dificulta auditar sesgos o procedencia de los datos.
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces encontrados correspondian a documentacion de productos no relacionados y se han descartado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/MiniCPM5-1B-Pashto-GGUF
- Modelo base: https://huggingface.co/nassimjp/MiniCPM5-1B-Pashto
- Pagina resumen de cuantizaciones del autor: https://hf.tst.eu/model#MiniCPM5-1B-Pashto-GGUF
- Guia de uso de archivos GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos al cuantizador: https://huggingface.co/mradermacher/model_requests
- Sitio del patrocinador (nethype GmbH): https://www.nethype.de/

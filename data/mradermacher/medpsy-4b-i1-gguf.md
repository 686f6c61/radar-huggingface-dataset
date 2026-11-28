# mradermacher/MedPsy-4B-i1-GGUF

## Resumen

MedPsy-4B-i1-GGUF es la version cuantizada en formato GGUF del modelo MedPsy-4B, desarrollado originalmente por qvac y empaquetado por mradermacher. Se trata de un modelo de lenguaje de 4.411 millones de parametros (aproximadamente 4,4 mil millones) orientado al dominio medico y sanitario, con enfasis en despliegue en el borde (edge) y en dispositivos locales (on-device). La model card lo etiqueta como perteneciente a la familia Qwen3 y lo vincula a tether-ai, lo que sugiere una base derivada de la arquitectura Qwen3 ajustada para tareas clinicas.

La relevancia de esta publicacion radica en que ofrece un conjunto amplio de cuantizaciones (desde IQ1_S de 1,3 GB hasta Q6_K de 3,7 GB) generadas con imatrix, lo que permite ejecutar un modelo especializado en salud en hardware de consumo. El repositorio tiene un tamano de 52,5 GB porque incluye todas las variantes de cuantizacion, no porque el modelo en si ocupe ese espacio. La licencia es Apache 2.0 tanto para el modelo base como para la cuantizacion.

El modelo esta pensado para generacion de texto conversacional en ingles (unico idioma declarado). Su tamano compacto y su especializacion clinica lo hacen candidato para asistentes medicos locales, triaje preliminar o documentacion clinica en entornos con requisitos de privacidad. No se dispone de informacion publica sobre la longitud de contexto, los datos de entrenamiento ni los resultados de benchmarks en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3, segun tags de la model card) |
| Parametros totales | 4.411.424.256 (4,4 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, IQ4_NL, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas con imatrix) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base qvac/MedPsy-4B se distribuye en safetensors |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo base es qvac/MedPsy-4B, etiquetado como perteneciente a la familia Qwen3, lo que implica una arquitectura transformer decoder-only con los componentes habituales de esa familia. No se especifican en la model card el numero de capas, la dimension oculta, el numero de cabezas de atencion ni la longitud de contexto nativa. Tampoco se detallan los datos de entrenamiento: no hay cifras de tokens, composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado especifico para el dominio clinico.

La unica innovacion tecnica documentada en esta ficha es el proceso de cuantizacion: mradermacher ha generado cuantizaciones ponderadas con imatrix (importance matrix) a partir del modelo original, lo que mejora la calidad de las variantes de baja precision respecto a cuantizaciones estaticas equivalentes. Las etiquetas de la model card mencionan "neurips-2026", lo que sugiere que el modelo base esta asociado a una publicacion cientifica, aunque no se proporciona el enlace al paper. No hay informacion sobre decodificacion especulativa, atencion lineal ni otras optimizaciones de inferencia.

## Capacidades

- Generacion de texto conversacional en ingles, con especializacion declarada en dominio medico y sanitario.
- Orientado a despliegue en el borde (edge) y en dispositivo (on-device), segun los tags del repositorio.
- Soporte de conversacion multi-turno (tag "conversational").
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que facilita su integracion en servicios de inferencia.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito (thinking mode).
- Capacidades multilingues: no disponibles; solo se declara ingles.
- No se especifican capacidades de codigo ni matematicas en la informacion proporcionada.

## Casos de uso

- Asistente clinico local para profesionales: el modelo puede desplegarse en un portatil o estacion de trabajo con una cuantizacion Q4_K_M (2,8 GB) para responder consultas de referencia medica sin enviar datos a la nube, lo que encaja con los requisitos de privacidad del entorno sanitario.
- Triaje preliminar de sintomas en ingles: con una cuantizacion IQ3_M (2,2 GB) puede ejecutarse en un dispositivo de bajos recursos para generar preguntas de cribado y orientar al paciente, siempre como apoyo y no como sustituto del criterio clinico.
- Documentacion clinica asistida: generacion de resumenes de notas o borradores de informes en ingles, aprovechando su ajuste al dominio medico y su naturaleza conversacional.
- Educacion y formacion sanitaria: simulacion de casos clinicos y respuestas a preguntas de estudiantes en entornos con hardware limitado, usando cuantizaciones Q5_K_M (3,3 GB) para mayor fidelidad.
- Investigacion en NLP clinico: el modelo sirve como linea base compacta para experimentos de dominio medico en ingles, con la ventaja de que las cuantizaciones imatrix permiten reproducir resultados en distintas precisiones.
- Despliegue en entornos con conectividad intermitente: al caber en un telefono de gama alta o en una Raspberry Pi con suficiente RAM (cuantizaciones IQ2 o Q3), puede ofrecer asistencia medica basica offline.
- Integracion en pipelines de inferencia compatibles con endpoints: el tag "endpoints_compatible" sugiere que puede servirse mediante APIs estandar en un cluster pequeno, por ejemplo para preprocesar o clasificar consultas medicas antes de derivarlas a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada segun cuantizacion: IQ1_S 1,3 GB; IQ2_M 1,8 GB; IQ3_M 2,2 GB; IQ4_XS 2,6 GB; Q4_K_M 2,8 GB; Q5_K_M 3,3 GB; Q6_K 3,7 GB. A estas cifras hay que sumar el espacio para el contexto KV, que depende de la longitud de contexto configurada (no documentada).
- GPU recomendadas: no hay recomendaciones oficiales. Por tamano, una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090 de 24 GB pueden alojar cualquier cuantizacion con holgura. Una RTX 3050 de 8 GB o una GTX 1660 de 6 GB son suficientes para cuantizaciones Q4 o inferiores.
- Cabe en GPU de consumo: si, en la practica totalidad de tarjetas con 4 GB o mas para cuantizaciones IQ3/Q4, y en tarjetas de 2-3 GB solo con cuantizaciones IQ1/IQ2.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. El tag "endpoints_compatible" sugiere soporte en servidores de inferencia tipo llama.cpp server o TGI con backend GGUF (no confirmado para vLLM, que prioriza safetensors).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MedPsy-4B (este, cuantizado) | 4,4 B | No disponible | Apache 2.0 | GGUF | Especializado en dominio medico, solo ingles |
| Qwen3-4B (familia base declarada) | ~4 B | No disponible en esta ficha | Apache 2.0 (segun familia Qwen3) | safetensors, GGUF | Modelo generalista del que deriva la arquitectura |
| Meditron-7B | 7 B | 4.096 tokens (referencia publica) | Llama 2 (uso restringido) | safetensors, GGUF | Modelo medico de mayor tamano, requiere mas VRAM |
| BioMistral-7B | 7 B | 3.276 tokens (referencia publica) | Apache 2.0 | safetensors, GGUF | Alternativa medica de 7 B, mayor coste de inferencia |

La comparativa con Meditron y BioMistral se basa en caracteristicas publicas generales de esos modelos; no se dispone de datos de rendimiento comparativo para MedPsy-4B en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo declara soporte de ingles; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de su calidad clinica frente a alternativas.
- Riesgo de alucinacion inherente a los modelos de lenguaje; en dominio medico esto es especialmente critico y exige supervision humana y validacion profesional.
- No se documentan los datos de entrenamiento ni los sesgos conocidos; no puede descartarse sesgo demografico o clinico en las respuestas.
- La longitud de contexto no esta disponible, lo que impide planificar con precision casos de uso con documentos largos.
- Aunque la licencia es Apache 2.0 (permisiva para uso comercial), el uso en contextos clinicos reales puede estar sujeto a regulacion sanitaria (por ejemplo, MDR en la UE o FDA en EE. UU.) que exige validacion y certificacion adicionales.
- Las cuantizaciones de muy baja precision (IQ1, IQ2, Q2_K) degradan notablemente la calidad; la propia model card advierte que IQ1_S es "for the desperate" y Q2_K_S es "very low quality".
- El tag "neurips-2026" sugiere una publicacion asociada, pero no se proporciona el enlace al paper ni detalles de la evaluacion.
- No se documenta soporte de tool calling ni de agentes, lo que limita su uso en pipelines automatizados complejos.

## Enlaces

- Repositorio Hugging Face de esta cuantizacion: https://huggingface.co/mradermacher/MedPsy-4B-i1-GGUF
- Modelo base: https://huggingface.co/qvac/MedPsy-4B
- Licencia del modelo base: https://huggingface.co/qvac/MedPsy-4B/blob/main/LICENSE
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/MedPsy-4B-GGUF
- Pagina de descargas del autor para este modelo: https://hf.tst.eu/model#MedPsy-4B-i1-GGUF
- Guia de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH (patrocinador del trabajo de cuantizacion): https://www.nethype.de/

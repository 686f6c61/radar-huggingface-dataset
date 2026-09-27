# mradermacher/Artha-v1-E2B-GGUF

## Resumen

Artha-v1-E2B-GGUF es un repositorio de cuantizaciones en formato GGUF del modelo developerJenis/Artha-v1-E2B, publicado por mradermacher. El modelo original se posiciona, segun sus etiquetas, como un asistente de escritura orientado a la redaccion de correos y a variantes del ingles de la India (indian-english, hinglish), con enfasis en despliegue on-device. Los idiomas declarados son ingles (en), hindi (hi) y guyarati (gu), y la licencia es Apache 2.0.

El repositorio base cuenta con aproximadamente 4.647 millones de parametros (unos 4,65 mil millones), segun los tensores en safetensors. La nomenclatura "E2B" y la etiqueta "gemma4" presente en los tags apuntan a la familia Gemma, aunque la model card no detalla la arquitectura concreta. El modelo original fue afinado con DPO, segun las etiquetas disponibles.

Esta ficha es relevante porque documenta una de las pocas cuantizaciones GGUF publicadas de Artha-v1-E2B, lo que permite ejecutar el modelo en hardware de consumo mediante llama.cpp u Ollama. Ademas, el repositorio incluye ficheros mmproj (proyeccion multimodal) en F16 y Q8_0, lo que indica soporte de entradas multimodales en el modelo base. El repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, por lo que no existen validaciones de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los tags incluyen "gemma4" y la nomenclatura "E2B"; la model card no la describe) |
| Parametros totales | 4.647.450.147 (~4,65 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS; ademas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (ingles), hi (hindi), gu (guyarati) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base usa transformers/safetensors) |

## Arquitectura y entrenamiento

La model card del repositorio de cuantizacion no describe la arquitectura interna, el numero de tokens de entrenamiento ni la composicion del dataset del modelo original. Las etiquetas del repositorio incluyen "gemma4" y el identificador "E2B", lo que sugiere que Artha-v1-E2B deriva de la familia Gemma en su variante de parametros efectivos reducidos, una convencion de nomenclatura empleada por Google en modelos compactos con decodificacion optimizada. No obstante, esta informacion no se confirma en la documentacion disponible y debe verificarse en la ficha del modelo base.

El unico dato de entrenamiento confirmado es la etiqueta "dpo", que indica que el modelo base paso por una fase de optimizacion por preferencias directas (Direct Preference Optimization), habitualmente aplicada tras el ajuste supervisado para alinear las respuestas. El repositorio incluye ficheros mmproj (0,7 GB en Q8_0 y 1,1 GB en F16), que son proyecciones multimodales necesarias para procesar entradas de imagen o audio en llama.cpp. La cuantizacion es de tipo estatica, sin versiones ponderadas ni con matriz de importancia (imatrix), segun declara el autor.

## Capacidades

- Generacion de texto conversacional en ingles, hindi y guyarati.
- Redaccion y asistencia de escritura, con foco declarado en correos electronicos y comunicacion formal.
- Manejo de registro indian-english y hinglish (mezcla de hindi e ingles), segun las etiquetas del repositorio.
- Procesamiento multimodal, indicado por la presencia de ficheros mmproj en el repositorio (tipo de modalidad exacta: no disponible).
- Alineacion por DPO orientada a preferencias humanas.
- Ejecucion on-device en formato GGUF, compatible con llama.cpp, Ollama y otros motores GGUF.
- Compatibilidad declarada con endpoints (etiqueta "endpoints_compatible").
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.

## Casos de uso

- Asistente de redaccion de correos integrado en un cliente de correo de escritorio: el modelo puede generar, reescribir y resumir borradores de email en ingles o hinglish, ejecutandose en local con llama.cpp y evitando enviar el contenido del correo a un servicio externo.
- Autocompletado y sugerencias de respuesta en aplicaciones moviles: al ser un modelo de ~4,65 mil millones de parametros cuantizados entre Q4_K_M y Q8_0, puede desplegarse en telefonos de gama alta o portatiles sin GPU dedicada, con latencia aceptable para sugerencias cortas.
- Atencion al cliente en ingles de la India e hinglish: un chatbot de soporte puede gestionar conversaciones multi-turno adaptando el registro linguistico a la variante regional, lo que encaja con el enfoque "indian-english" y "hinglish" de las etiquetas.
- Traduccion y adaptacion entre ingles, hindi y guyarati: el modelo puede emplearse para reformular mensajes entre estos tres idiomas en entornos de documentacion o comunicaciones internas de empresas con presencia en India.
- Procesamiento de documentos con contenido multimodal: los ficheros mmproj permiten pasar imagenes al modelo (por ejemplo, capturas de correos o formularios escaneados) y obtener texto redactado o resumido, siempre que el modelo base exponga esa capacidad.
- Generacion de contenido corporativo con requisitos de privacidad: sectores como banca o sanidad en India pueden desplegar el modelo on-premise para redactar comunicaciones sensibles sin exponer datos a APIs externas.
- Entorno de desarrollo y prototipado: al ofrecer multiples niveles de cuantizacion (desde Q2_K hasta F16), permite ajustar el equilibrio entre calidad y consumo de memoria segun la maquina disponible, lo que facilita experimentar con el modelo antes de comprometerse con un despliegue mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las cifras de VRAM siguientes son estimaciones calculadas a partir del numero de parametros (4,65 mil millones) y del tamano de cada cuantizacion; no proceden de mediciones publicadas por el autor.

- VRAM estimada para inferencia (solo pesos): Q2_K ~1,8 GB; Q3_K_S/Q3_K_M/Q3_K_L ~2,0-2,4 GB; IQ4_XS ~2,5 GB; Q4_K_S/Q4_K_M ~2,7-2,9 GB; Q5_K_S/Q5_K_M ~3,3-3,5 GB; Q6_K ~4,0 GB; Q8_0 ~5,0 GB; F16 ~9,5 GB.
- Memoria adicional: sumar la cache KV (depende del contexto y del numero de capas, no disponible) y, si se usa el modo multimodal, entre 0,7 GB (mmproj-Q8_0) y 1,1 GB (mmproj-F16).
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 2070) puede ejecutar las cuantizaciones Q4 y Q5 con contexto moderado. Para Q8_0 o F16 conviene disponer de 8-12 GB (RTX 3070/4070, RTX 3080). En tarjetas profesionales como A100 o H100 el modelo se ejecuta sin problemas, pero esta sobredimensionado para su tamano.
- Cabe en GPU consumer: si. Las cuantizaciones Q2_K a Q4_K_M entran en GPUs de 4-6 GB e incluso en configuraciones de CPU con RAM suficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores GGUF compatibles. La model card enlaza a las instrucciones de uso de GGUF de TheBloke. No se menciona compatibilidad con vLLM ni TGI en el repositorio, aunque la etiqueta "endpoints_compatible" sugiere integracion con endpoints HTTP.
- Latencia y throughput estimados: no disponibles. El repositorio no publica mediciones.

## Comparativa con modelos similares

No disponible. La informacion suministrada no incluye datos de rendimiento de modelos comparables, y no se dispone de numeros verificables para confrontar Artha-v1-E2B con alternativas de la misma categoria. Como referencia estructural, la nomenclatura "E2B" y la etiqueta "gemma4" apuntan a un origen en la familia Gemma de parametros efectivos reducidos, por lo que la comparacion natural seria con las variantes compactas de dicha familia, pero no se dispone de especificaciones de contexto, rendimiento ni licencia de esos modelos en el material consultado.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay datos publicados de MMLU, HumanEval, GSM8K ni de ninguna otra prueba, por lo que el rendimiento real es desconocido.
- Ventana de contexto no documentada: se desconoce la longitud maxima de contexto del modelo base, lo que impide garantizar conversaciones o documentos largos.
- Riesgo de alucinacion: como cualquier modelo generativo de este tamano, puede producir informacion falsa o inventada, especialmente en tareas factuales y en idiomas distintos del ingles.
- Cobertura multilingue limitada: solo se declaran en, hi y gu. No hay soporte confirmado de castellano ni de otras lenguas.
- Alineacion por DPO: la optimizacion por preferencias puede introducir sesgos hacia el estilo y los temas presentes en los datos de preferencia; no se documenta su composicion.
- Cuantizaciones agresivas: las variantes Q2_K y Q3_K degradan la perplejidad de forma notable segun los graficos de referencia citados por el autor. Para uso en produccion se recomienda Q4_K_M o superior.
- Sin cuantizaciones ponderadas ni imatrix: el autor indica que no las ha generado, de modo que las versiones estaticas pueden rendir peor que cuantizaciones equivalentes con imatrix.
- Validacion de la comunidad inexistente: 0 descargas y 0 "likes" en el momento de la consulta. No hay evidencia de uso en produccion ni informes de terceros.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar la licencia del modelo base developerJenis/Artha-v1-E2B, ya que las condiciones del modelo derivado podrian anadir restricciones no reflejadas en el repositorio de cuantizacion.
- Modalidad multimodal sin documentar: la presencia de ficheros mmproj indica soporte multimodal, pero no se especifica si cubre vision, audio o ambos, ni en que casos de uso funciona correctamente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Artha-v1-E2B-GGUF
- Modelo base: https://huggingface.co/developerJenis/Artha-v1-E2B
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#Artha-v1-E2B-GGUF
- Instrucciones de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/

# mradermacher/QoQ-Med-VL-32B-GGUF

## Resumen

QoQ-Med-VL-32B-GGUF es la version cuantizada en formato GGUF del modelo multimodal QoQ-Med-VL-32B, desarrollado originalmente por ddvd233 y convertido a GGUF por mradermacher. Se trata de un modelo de lenguaje y vision (VL) de 32.763.876.352 parametros (aproximadamente 32,8 mil millones) orientado al ambito medico, disenado para procesar tanto texto como imagenes. Su publicacion en formato GGUF lo hace accesible a herramientas de inferencia local como llama.cpp u Ollama, lo que reduce la barrera de entrada para investigacion y prototipado.

La relevancia de esta ficha radica en que combina tres factores poco frecuentes: un tamano de 32B que ofrece capacidad de razonamiento notable, una naturaleza multimodal con foco sanitario y una licencia MIT permisiva. El repositorio incluye tanto los pesos del modelo de lenguaje cuantizados en multiples niveles (desde Q2_K hasta Q8_0) como los ficheros mmproj necesarios para el procesamiento de imagenes, lo que permite desplegar el modelo completo de forma local.

El modelo base es ddvd233/QoQ-Med-VL-32B, y esta version cuantizada conserva la licencia MIT del original. La informacion disponible no detalla la longitud de contexto, la composicion del dataset de entrenamiento ni los resultados de benchmarks, por lo que estos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal vision-lenguaje; detalles del backbone no publicados en la informacion disponible) |
| Parametros totales | 32.763.876.352 (aproximadamente 32,8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

La informacion disponible no especifica la arquitectura interna del modelo base ddvd233/QoQ-Med-VL-32B. Por el nombre y la presencia de ficheros mmproj se deduce que se trata de un modelo multimodal que combina un codificador visual con un modelo de lenguaje, pero no se detallan el tipo de transformer, el mecanismo de atencion ni la estrategia de fusion de modalidades. Tampoco se publican el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

En cuanto al proceso de cuantizacion, mradermacher ha generado cuantizaciones estaticas (static quants) del modelo original, e indica que tambien existen cuantizaciones ponderadas con imatrix en el repositorio QoQ-Med-VL-32B-i1-GGUF. Los ficheros mmproj (Q8_0 y f16) son los suplementos multimodales necesarios para que el modelo procese imagenes en llama.cpp. No se dispone de informacion sobre innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` del repositorio.
- Procesamiento de imagenes (vision) gracias a los ficheros mmproj incluidos, orientado a tareas de analisis de imagenes medicas.
- Capacidades de razonamiento y respuesta a preguntas en el dominio sanitario, inferidas del nombre "Med-VL" del modelo base.
- Soporte multilingue limitado al ingles segun la model card.
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documenta soporte explicito de agentes o razonamiento multi-paso.
- No se documentan modos especiales como thinking mode, audio o video.

## Casos de uso

- Analisis de imagenes medicas en investigacion: el modelo puede recibir una imagen (radiografia, ecografia, fotografia clinica) junto con una pregunta en texto y generar una descripcion o interpretacion preliminar, gracias a su componente visual mmproj. Adecuado para prototipos de asistencia diagnostica, siempre con supervision humana.
- Educacion medica y simulacion de casos: util para generar explicaciones de hallazgos visuales y responder preguntas de estudiantes sobre imagenes clinicas en ingles, aprovechando el enfoque medico del modelo base.
- Triaje documental con imagenes: procesamiento de informes escaneados o capturas de resultados de laboratorio para extraer y resumir informacion, combinando vision y generacion de texto.
- Despliegue local en entornos con requisitos de privacidad: al distribuirse en GGUF y con licencia MIT, puede ejecutarse en infraestructura propia sin enviar datos de pacientes a servicios externos, lo que facilita el cumplimiento de normativas de proteccion de datos.
- Prototipado rapido con llama.cpp u Ollama: los multiples niveles de cuantizacion (desde Q2_K de 12,4 GB hasta Q8_0 de 34,9 GB) permiten ajustar el modelo al hardware disponible para pruebas de concepto.
- Investigacion en IA medica multimodal: base para experimentos de evaluacion de modelos vision-lenguaje en tareas clinicas, con la ventaja de una licencia permisiva que facilita la reproducibilidad.
- Generacion de descripciones accesibles: conversion de imagenes medicas o ilustraciones clinicas en descripciones textuales para documentacion o accesibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del modelo de lenguaje): aproximadamente 12,4 GB con Q2_K, 18-20 GB con Q4_K_S/Q4_K_M, 23-27 GB con Q5_K_M/Q6_K y 34,9 GB con Q8_0. A esto hay que sumar el fichero mmproj (0,8 GB en Q8_0 o 1,5 GB en f16) y el espacio para el contexto KV cache.
- GPU recomendadas: para Q4_K_M o superiores se recomienda una GPU con 24 GB o mas de VRAM (RTX 3090, RTX 4090, A100 40GB, H100). Para cuantizaciones Q2_K/Q3_K puede intentarse en GPUs de 16 GB, aunque con posible offloading parcial a CPU.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) con cuantizaciones Q4_K_M o inferiores; en GPUs de 16 GB solo con cuantizaciones muy agresivas y offloading parcial.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, y servidores compatibles con la API de endpoints (el repositorio incluye la etiqueta `endpoints_compatible`). Tambien puede usarse con transformers cargando el modelo base en safetensors, aunque esta version concreta es GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos comparables en la informacion proporcionada. A continuacion se comparan unicamente los datos objetivos disponibles:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| QoQ-Med-VL-32B-GGUF | 32,8B | no disponible | MIT | GGUF | Multimodal medico, cuantizaciones multiples |
| Modelo base ddvd233/QoQ-Med-VL-32B | 32,8B | no disponible | MIT | safetensors | Version original sin cuantizar |
| Alternativas de 32B multimodales | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al ser un modelo medico entrenado presumiblemente con datos clinicos, puede heredar sesgos de representacion demografica de dichos datos.
- Riesgo de alucinacion: elevado en el dominio medico, donde una respuesta incorrecta puede tener consecuencias graves. No debe usarse como sustituto del criterio clinico profesional.
- Limitaciones de idioma: la model card solo declara soporte de ingles; el rendimiento en castellano no esta garantizado ni evaluado.
- Limitaciones de contexto: la longitud de contexto no esta publicada, lo que impide planificar su uso en documentos o conversaciones largas.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero el caracter medico del modelo exige cumplir la normativa sanitaria y de proteccion de datos aplicable (por ejemplo, MDR en la UE si se usa con fines diagnosticos).
- Caveats de produccion: al ser una cuantizacion, las versiones Q2_K y Q3_K pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso serio. La ausencia de benchmarks impide validar su rendimiento frente a alternativas.
- El modelo no debe utilizarse para diagnostico clinico autonomo sin validacion regulatoria y supervision medica.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/QoQ-Med-VL-32B-GGUF
- Modelo base: https://huggingface.co/ddvd233/QoQ-Med-VL-32B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/QoQ-Med-VL-32B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#QoQ-Med-VL-32B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

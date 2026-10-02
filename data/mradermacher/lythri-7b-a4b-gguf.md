# mradermacher/Lythri-7B-A4B-GGUF

## Resumen

Lythri-7B-A4B-GGUF es la version cuantizada en formato GGUF del modelo Lythri-7B-A4B, publicada por el usuario mradermacher, conocido por generar cuantizaciones estaticas de modelos abiertos. El modelo original pertenece a Lythri y esta etiquetado como un asistente conversacional orientado a soporte emocional y compania (emotional-support, companion), con enfasis en su uso en dispositivo local (on-device) y en ingles.

El modelo cuenta con 7.463.013.674 parametros totales segun los pesos en safetensors del modelo base, y la nomenclatura "A4B" del nombre sugiere un esquema con aproximadamente 4000 millones de parametros activos, aunque la informacion proporcionada no confirma que se trate de una arquitectura MoE. La etiqueta gemma4 en la model card apunta a una posible base arquitectonica derivada de la familia Gemma, si bien este dato no esta verificado en la documentacion disponible.

La relevancia de esta ficha radica en que ofrece una via de despliegue local gracias al formato GGUF, compatible con llama.cpp y derivados, y con licencia Apache 2.0, lo que facilita su integracion en entornos de produccion y en hardware de consumo. En el momento de la consulta el repositorio registra 0 descargas y 0 likes, por lo que se trata de una publicacion muy reciente y sin traccion comunitaria documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la etiqueta gemma4 sugiere base de la familia Gemma, sin confirmar) |
| Parametros totales | 7.463.013.674 (aproximadamente 7,46 B) |
| Parametros activos | no disponible (el sufijo A4B del nombre sugiere unos 4 B activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Lythri-7B-A4B. La model card se limita a indicar que se trata de cuantizaciones estaticas del modelo original y no incluye especificaciones sobre el tipo de transformer, el uso de mezcla de expertos (MoE), capas de atencion lineal u otras variantes. La etiqueta gemma4 sugiere una relacion con la familia Gemma, pero no se aporta confirmacion tecnica al respecto.

Tampoco se documentan en la informacion proporcionada los datos de entrenamiento: no se especifica el numero de tokens, la composicion del dataset, ni si se aplicaron tecnicas de ajuste como RLHF o DPO. La model card unicamente lista las cuantizaciones generadas, los enlaces de descarga y notas generales sobre el proceso de cuantizacion, sin detallar el pipeline de entrenamiento del modelo original.

## Capacidades

- Generacion de texto conversacional en ingles, con orientacion a interacciones de acompanamiento y soporte emocional.
- Uso en dispositivo local (on-device), gracias a la disponibilidad de cuantizaciones de bajo peso como Q4_K_S, Q4_K_M o IQ4_XS.
- Conversacion multi-turno, segun la etiqueta conversational de la model card.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles (en) segun la etiqueta de idioma.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de acompanamiento personal en local: el modelo puede ejecutarse en un equipo de consumo mediante los archivos GGUF de cuantizacion Q4_K_S o Q4_K_M, ofreciendo conversaciones de soporte emocional sin enviar datos a servicios externos.
- Soporte emocional en aplicaciones de bienestar: integrable en apps de escritorio o moviles que necesiten un interlocutor conversacional en ingles, aprovechando la licencia Apache 2.0 para su inclusion en productos propietarios.
- Chatbot de compania offline: al no requerir conexion a internet, resulta adecuado para entornos con restricciones de red o requisitos de privacidad estrictos.
- Despliegue embebido con llama.cpp u Ollama: los pesos GGUF permiten su carga directa en herramientas de inferencia local ampliamente extendidas, simplificando la puesta en marcha.
- Prototipado rapido de asistentes conversacionales: al ser un modelo de 7 B con cuantizaciones ligeras, sirve para validar flujos de dialogo en fase de desarrollo sin grandes inversiones en hardware.
- Investigacion sobre modelos de soporte emocional: puede utilizarse como punto de partida para estudiar el comportamiento de asistentes especializados y comparar con alternativas de mayor tamano.
- Evaluacion de cuantizaciones: el repositorio ofrece multiples niveles de compresion (de Q2_K a f16), lo que permite analizar el equilibrio entre calidad y uso de memoria en un mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamano de los archivos por cuantizacion, segun la model card:
  - Q2_K: 4,5 GB
  - Q3_K_M: 4,9 GB
  - Q3_K_L: 5,1 GB
  - IQ4_XS: 5,2 GB
  - Q4_K_S: 5,3 GB (recomendada, rapida)
  - Q4_K_M: 5,4 GB (recomendada, rapida)
  - Q5_K_S: 5,7 GB
  - Q6_K: 6,3 GB (muy buena calidad)
  - f16: 15,0 GB (16 bpw, sobredimensionada)
  - Q8_0, Q5_K_M y Q3_K_S: mencionadas entre las cuantizaciones generadas, sin tamano desglosado en la tabla disponible.
- VRAM estimada para inferencia: no disponible de forma explicita; puede aproximarse al tamano del archivo GGUF elegido mas un margen para el contexto y el runtime.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: las cuantizaciones Q4 (aproximadamente 5,3-5,4 GB) son compatibles con GPU de consumo con 8 GB o mas de VRAM; las variantes Q6_K y f16 requieren mas memoria.
- Opciones de despliegue: al tratarse de GGUF, es compatible con llama.cpp, Ollama, LM Studio y otros motores que soporten este formato; la model card apunta a que existen cuantizaciones "endpoints_compatible".
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria con datos verificables de parametros, contexto o rendimiento.

## Limitaciones y advertencias

- El modelo esta etiquetado unicamente para ingles (en), por lo que el rendimiento en castellano u otros idiomas no esta garantizado.
- No se dispone de informacion sobre la longitud de contexto soportada, lo que dificulta planificar su uso en conversaciones de contexto largo.
- No hay datos publicados de benchmarks, por lo que no es posible evaluar su calidad frente a alternativas con cifras contrastadas.
- Riesgo de alucinacion inherente a los modelos de lenguaje; en el ambito de soporte emocional, cualquier recomendacion debe acompanarse de supervisión humana y advertencias adecuadas.
- Sesgos conocidos: no disponible en la informacion proporcionada, dado que no se documentan los datos de entrenamiento.
- Licencia Apache 2.0, lo que permite uso comercial y modificacion; se recomienda revisar los terminos del modelo original Lythri-7B-A4B para confirmar condiciones adicionales.
- Al ser una cuantizacion parcial del modelo original, las versiones de menor precision (Q2_K, Q3_K) pueden degradar notablemente la calidad de las respuestas.
- Repositorio con 0 descargas y 0 likes: sin validacion de la comunidad ni evidencia de uso en produccion.
- El autor no ha publicado cuantizaciones ponderadas o con imatrix en el momento de la ficha, y no confirma si tiene previsto generarlas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Lythri-7B-A4B-GGUF
- Modelo base: https://huggingface.co/Lythri/Lythri-7B-A4B
- Pagina de vision general del modelo (mradermacher): https://hf.tst.eu/model#Lythri-7B-A4B-GGUF
- FAQ y solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre uso de archivos GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Listado de modelos de mradermacher: https://huggingface.co/mradermacher/models
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

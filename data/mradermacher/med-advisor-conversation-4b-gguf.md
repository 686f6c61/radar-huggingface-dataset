# mradermacher/med-advisor-conversation-4B-GGUF

## Resumen

med-advisor-conversation-4B-GGUF es la version cuantizada en formato GGUF del modelo vmal/med-advisor-conversation-4B, un modelo de chat de aproximadamente 4.400 millones de parametros afinado para educacion medica y cientifica. La cuantizacion la ha realizado mradermacher, un autor conocido en Hugging Face por publicar versiones GGUF de modelos abiertos para su uso con llama.cpp y derivados. El modelo original deriva de Qwen/Qwen3-4B-Base, segun la informacion publica del autor del modelo base, y esta orientado a explicar conceptos de medicina y biologia de forma clara, sin ofrecer consejo clinico.

El repositorio es unicamente de pesos cuantizados: no incluye el modelo completo en safetensors ni pipelines de entrenamiento. Ofrece doce variantes de cuantizacion que van desde Q2_K (1,9 GB) hasta f16 (8,9 GB), lo que permite desplegarlo tanto en GPUs de consumo como en servidores sin acelerador dedicado. La licencia es Apache 2.0 y el unico idioma declarado es el ingles.

Su relevancia actual es practica: existe una demanda creciente de modelos pequenos y especializados en dominios tecnicos que puedan ejecutarse en local o en infraestructura modesta, y esta ficha cubre esa necesidad con un modelo de 4B cuantizado. No se han publicado resultados de benchmarks ni detalles del dataset de entrenamiento en la informacion disponible, por lo que la evaluacion debe basarse en pruebas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, derivado de Qwen3-4B (segun informacion publica del modelo base) |
| Parametros totales | 4.411.424.256 (4,41 mil millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas; el modelo base se distribuye en safetensors) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de tipo denso con aproximadamente 4.400 millones de parametros. Segun la informacion del autor del modelo original, esta derivado de Qwen/Qwen3-4B-Base y ha sido afinado especificamente para conversacion y educacion medica y cientifica. La etiqueta de pipeline declarada por el repositorio es "reinforcement-learning", lo que sugiere que el ajuste incluyo tecnicas de aprendizaje por refuerzo o preferencias, aunque no se detalla la metodologia exacta.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF o DPO, ni innovaciones tecnicas concretas como decodificacion especulativa o atencion lineal. Los unicos detalles tecnicos verificables de este repositorio son los relativos al proceso de cuantizacion: cuantizacion estatica (quantize_version 2), conversion desde pesos de Hugging Face (convert_type: hf) y salida con tensor quantised activado. No se han publicado variantes con calibracion por imatrix en el momento de la consulta.

## Capacidades

- Generacion de texto conversacional en ingles, con enfasis en explicaciones de conceptos de medicina, biologia y ciencias de la salud.
- Razonamiento multi-turno orientado a contexto educativo, segun las etiquetas "chat", "conversational" y "reasoning" del repositorio.
- Explicaciones didacticas adaptables a distintos niveles de conocimiento, segun la descripcion publica del modelo base.
- Adherencia a limites de politica declarados: el modelo esta disenado para no ofrecer consejo clinico.
- Capacidades multilingues: limitadas al ingles segun el campo "language" del repositorio.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso avanzado: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles; el modelo es exclusivamente de texto.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Formacion de estudiantes de medicina: el modelo puede generar explicaciones paso a paso de fisiopatologia, farmacologia o bioquimica, actuando como tutor de apoyo en ingles. Su tamano de 4B permite desplegarlo en el portatil de un estudiante con una GPU de gama media.
- Material didactico y resumenes: a partir de notas de clase o articulos de revision, el modelo puede producir resumenes y preguntas de autoevaluacion, integrándose en un pipeline de generacion de contenido educativo.
- Asistentes de documentacion biomedica interna: en un entorno corporativo sanitario o farmaceutico, puede responder consultas sobre terminologia y conceptos generales sin cruzar la linea del consejo clinico, siempre con revision humana.
- Chatbot de onboarding para personal no clinico: personal administrativo de hospitales o aseguradoras puede consultar glosario medico y conceptos basicos en una interfaz conversacional desplegada en local.
- Prototipado rapido en investigacion: gracias al formato GGUF y a su rango de cuantizaciones, permite iterar rapidamente en experimentos de NLP biomedico sin necesidad de clústeres de GPU.
- Despliegue en entornos con requisitos de privacidad: al poder ejecutarse en local con llama.cpp y sin llamadas a API externas, es apto para escenarios donde los datos no pueden salir de la organizacion.
- Generacion de conjuntos de datos sinteticos de QA medico: puede producir pares pregunta-respuesta sobre conceptos cientificos para preentrenar o evaluar otros modelos, con filtrado humano posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin contar cache KV ni overhead): aproximadamente 1,9 GB para Q2_K, 2,7-2,8 GB para Q4_K_S/Q4_K_M, 3,2-3,3 GB para Q5_K_S/Q5_K_M, 3,7 GB para Q6_K, 4,8 GB para Q8_0 y 8,9 GB para f16.
- VRAM total recomendada: anadir entre 0,5 y 2 GB segun la longitud de contexto y el backend para la cache KV y el overhead del runtime.
- GPU de consumo: cabe holgadamente en tarjetas con 8 GB (RTX 3060 Ti, RTX 4060, RTX 2070) usando Q4_K_M o Q5_K_M; en tarjetas de 6 GB conviene bajar a Q3_K_M o Q2_K.
- GPU de gama alta: RTX 4090, RTX 3090 o A6000 ejecutan las cuantizaciones Q8_0 y f16 sin problema y con margen para contextos largos.
- GPU de centro de datos: A100, H100 o L40S no son necesarias para este tamano, pero permiten mayor paralelismo y throughput en despliegues multi-usuario.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, koboldcpp y cualquier runtime compatible con GGUF. Para servir en produccion con GGUF, llama.cpp server o vLLM son las opciones mas habituales.
- Latencia y throughput estimados: no disponibles. Dependen de la cuantizacion, el hardware y el backend; como referencia cualitativa, la propia model card marca Q4_K_S, Q4_K_M y Q8_0 como "fast".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Idiomas | Benchmarks publicados |
|---|---|---|---|---|---|---|
| med-advisor-conversation-4B-GGUF | 4,41 mil millones | no disponible | apache-2.0 | GGUF (12 cuantizaciones) | en | no disponible |
| Qwen/Qwen3-4B (modelo base de la familia) | ~4 mil millones | no disponible en la informacion proporcionada | apache-2.0 | safetensors | multilingue (segun el modelo original) | no disponible en la informacion proporcionada |
| vmal/med-advisor-conversation-4B (modelo sin cuantizar) | 4,41 mil millones | no disponible | apache-2.0 | safetensors | en | no disponible |

No se dispone de datos de rendimiento comparativos entre estas opciones en la informacion proporcionada. La diferencia principal entre este repositorio y vmal/med-advisor-conversation-4B es el formato de pesos y el rango de cuantizaciones; el comportamiento del modelo es el mismo salvo por la perdida de precision inherente a cada nivel de cuantizacion.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada. Al estar especializado en dominio medico en ingles, es probable que herede sesgos de sus datos de ajuste, pero no se documentan.
- Riesgo de alucinacion: relevante en cualquier modelo de 4B aplicado a dominio cientifico. Las explicaciones medicas generadas deben verificarse contra fuentes primarias antes de cualquier uso formativo o divulgativo.
- No es un dispositivo medico: el propio autor del modelo base indica que esta disenado para no ofrecer consejo clinico. No debe usarse para diagnostico, triaje ni decision terapeutica.
- Limitacion de idioma: solo ingles declarado. No hay soporte documentado para castellano ni otros idiomas, por lo que su uso en entornos hispanohablantes requeriria validacion adicional.
- Contexto: no se especifica la longitud de contexto soportada, un dato critico para planificar despliegues con documentacion extensa.
- Perdida de calidad por cuantizacion: las variantes Q2_K y Q3_K introducen degradacion notable; la propia model card advierte de "lower quality" en Q3_K_M. Para uso serio se recomienda Q4_K_M o superior.
- Ausencia de cuantizaciones con imatrix: el autor indica que no hay cuants ponderadas por imatrix disponibles en el momento de la publicacion, lo que puede reducir la calidad respecto a alternativas calibradas.
- Licencia: apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base vmal/med-advisor-conversation-4B y de Qwen3-4B, ya que las obligaciones pueden acumularse.
- Repositorio sin senal de adopcion: cero descargas y cero "likes" en el momento de la consulta, lo que implica poca validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/med-advisor-conversation-4B-GGUF
- Modelo base: https://huggingface.co/vmal/med-advisor-conversation-4B
- Perfil del autor de la cuantizacion: https://huggingface.co/mradermacher
- Pagina de vista general y descargas de cuantizaciones de mradermacher: https://hf.tst.eu/model#med-advisor-conversation-4B-GGUF
- Peticiones de modelos a mradermacher: https://huggingface.co/mradermacher/model_requests
- Pagina de despliegue de vmal/med-advisor-4b en Featherless: https://featherless.ai/models/vmal/med-advisor-4b
- Guia de referencia sobre cuantizacion GGUF (llama.cpp): https://tech-insider.org/gguf-model-quantization-2026/
- Grafico comparativo de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia de TheBloke sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF

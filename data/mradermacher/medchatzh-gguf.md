# mradermacher/MedChatZH-GGUF

## Resumen

MedChatZH-GGUF es la versión cuantizada en formato GGUF del modelo tyang816/MedChatZH, un modelo de lenguaje especializado en medicina tradicional china (中医大模型, TCM-LLM) desarrollado originalmente sobre una base de 7.000 millones de parámetros. La cuantización corre a cargo de mradermacher, un conocido publicador de versiones GGUF de modelos open source, que facilita el despliegue local del modelo mediante llama.cpp y herramientas compatibles. El modelo está entrenado exclusivamente en chino (zh) y se distribuye bajo licencia Apache 2.0.

El modelo resuelve el problema de la consulta médica especializada en el dominio de la medicina tradicional china, un área con terminología, diagnósticos y tratamientos muy específicos que los modelos generalistas no cubren con precisión. Al estar disponible en múltiples niveles de cuantización (desde Q2_K hasta f16), permite su ejecución en hardware de consumo, algo relevante para investigadores y desarrolladores que necesitan probar modelos de dominio médico sin infraestructura de datacenter.

La relevancia actual radica en la combinación de un modelo de dominio vertical (medicina tradicional china) con un formato de despliegue ligero (GGUF), lo que democratiza el acceso a este tipo de modelos especializados. No obstante, la información pública disponible sobre el modelo base es limitada: no se han publicado detalles sobre la arquitectura interna, la composición del dataset de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de 7B, presumiblemente transformer decoder-only) |
| Parametros totales | 7.000.559.616 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base tyang816/MedChatZH. Por el número de parámetros (7.000 millones) y la librería declarada (transformers), se trata presumiblemente de un transformer decoder-only de escala 7B, aunque no se confirma en la información proporcionada. Tampoco se especifican la longitud de contexto nativa, el número de capas, la dimensión de los embeddings ni el mecanismo de atención empleado.

En cuanto al entrenamiento, la model card del modelo base referencia el dataset tyang816/MedChatZH como fuente de datos, pero no se detalla el número de tokens, la composición del corpus, ni si se aplicaron técnicas de ajuste fino supervisado (SFT), RLHF o DPO. La única información relevante es que el modelo está especializado en medicina tradicional china y que su idioma de trabajo es el chino. La cuantización realizada por mradermacher es de tipo estático (static quants), sin versiones ponderadas ni imatrix disponibles en el momento de la publicación.

## Capacidades

- Generación de texto en chino con especialización en terminología médica y medicina tradicional china.
- Consulta y razonamiento sobre diagnósticos, síntomas, tratamientos y conceptos de la medicina tradicional china.
- Conversación multi-turno en chino (presumiblemente, aunque no se detalla la ventana de contexto).
- No se ha confirmado soporte de tool calling ni function calling.
- No se ha confirmado soporte de agentes ni razonamiento multi-paso.
- No se ha confirmado capacidad de visión, audio ni modo thinking.
- Capacidad multilingüe limitada al chino según la metadata del modelo.

## Casos de uso

- Asistencia a estudiantes de medicina tradicional china: el modelo puede responder consultas sobre conceptos, diagnósticos y tratamientos en chino, sirviendo como herramienta de estudio interactiva gracias a su especialización en el dominio TCM.
- Prototipado de chatbots de consulta médica en chino: al estar disponible en GGUF, se puede desplegar localmente con llama.cpp u Ollama para experimentar con interfaces conversacionales de temática médica sin depender de APIs externas.
- Investigación en NLP médico en chino: el modelo sirve como baseline especializado para comparar con modelos generalistas en tareas de comprensión y generación de texto médico en chino.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q4_K_S (4,1 GB) y Q4_K_M (4,4 GB) permiten ejecutar el modelo en GPUs de consumo o incluso en CPU, facilitando pruebas en portátiles y estaciones de trabajo modestas.
- Generación de material divulgativo sobre medicina tradicional china: el modelo puede redactar explicaciones y resúmenes en chino sobre conceptos TCM para blogs, wikis o documentación interna.
- Evaluación de cuantizaciones: al ofrecer 12 niveles de cuantización, es útil para estudiar el impacto de la compresión en la calidad de las respuestas en un dominio especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización:
  - Q2_K: ~2,8 GB de pesos; ~3,5-4 GB de VRAM en total con overhead de contexto.
  - Q4_K_M: ~4,4 GB de pesos; ~5-6 GB de VRAM en total.
  - Q8_0: ~7,5 GB de pesos; ~8-9 GB de VRAM en total.
  - f16: ~14,1 GB de pesos; ~15-16 GB de VRAM en total.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100, H100. Para cuantizaciones Q4 o inferiores, una RTX 3060 de 12 GB o incluso una GTX 1660 de 6 GB (con contexto reducido) son suficientes.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6 GB o más de VRAM para cuantizaciones Q4 o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier runtime compatible con GGUF. No se recomienda vLLM ni TGI para GGUF (aunque existen soportes experimentales).
- Latencia y throughput: no disponibles. Dependerán del hardware y de la cuantización elegida; en una RTX 4090 con Q4_K_M se puede esperar un throughput alto, pero no se han publicado cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Formato | Especialización |
|---|---|---|---|---|---|---|
| MedChatZH-GGUF (este) | 7B | no disponible | zh | Apache 2.0 | GGUF | Medicina tradicional china |
| tyang816/MedChatZH (base) | 7B | no disponible | zh | Apache 2.0 | safetensors | Medicina tradicional china |
| Modelos médicos generalistas en chino (p. ej. HuatuoGPT, MedGPT) | variable (6B-13B) | variable | zh | variable | safetensors/GGUF | Medicina general en chino |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas. La comparación se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en chino; no se ha validado su rendimiento en castellano ni en otros idiomas.
- No se han publicado datos sobre sesgos, pero al ser un modelo de dominio médico entrenado con datos de medicina tradicional china, puede reflejar sesgos presentes en las fuentes utilizadas.
- Riesgo de alucinación inherente a los modelos de 7B, especialmente en un dominio técnico como la medicina; no debe usarse como sustituto de consejo médico profesional.
- La información sobre la longitud de contexto es inexistente; se recomienda precaución en conversaciones largas.
- Aunque la licencia es Apache 2.0 (permisiva para uso comercial), el uso en contextos médicos reales requiere validación adicional y cumplimiento normativo.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_S) pueden degradar notablemente la calidad de las respuestas en un dominio especializado.
- No hay versiones ponderadas (imatrix) disponibles, lo que limita la calidad de las cuantizaciones pequeñas.
- El modelo base tiene muy pocas descargas y likes (190 descargas, 0 likes en la versión GGUF), lo que indica poca validación comunitaria.

## Enlaces

- [Hugging Face: mradermacher/MedChatZH-GGUF](https://huggingface.co/mradermacher/MedChatZH-GGUF)
- [Modelo base: tyang816/MedChatZH](https://huggingface.co/tyang816/MedChatZH)
- [Dataset: tyang816/MedChatZH](https://huggingface.co/datasets/tyang816/MedChatZH)
- [Página de overview de cuantizaciones de mradermacher](https://hf.tst.eu/model#MedChatZH-GGUF)
- [Repositorio de peticiones de cuantización de mradermacher](https://huggingface.co/mradermacher/model_requests)
- [Guía de uso de GGUF (ejemplo de TheBloke)](https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF)
- [Gráfico comparativo de cuantizaciones de ikawrakow](https://www.nethype.de/huggingface_embed/quantpplgraph.png)
- [Notas de Artefact2 sobre cuantizaciones](https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9)

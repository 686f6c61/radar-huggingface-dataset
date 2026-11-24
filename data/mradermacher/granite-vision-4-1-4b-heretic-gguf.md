# mradermacher/granite-vision-4.1-4b-heretic-GGUF

## Resumen

Granite-vision-4.1-4b-heretic-GGUF es una cuantizacion estatica en formato GGUF del modelo multimodal heretic-org/granite-vision-4.1-4b-heretic, publicada por el usuario mradermacher. Se trata de una variante "abliterated" o "decensored" del modelo Granite Vision 4.1 de 4B parametros de IBM, en la que se han eliminado o atenuado los mecanismos de rechazo y alineacion de seguridad del modelo original. El resultado es un modelo vision-lenguaje capaz de procesar imagenes y texto, pero sin las restricciones habituales de contenido.

El modelo cuenta con 3.402.839.040 parametros totales (aproximadamente 3,4B, comercializado como "4B") y se distribuye bajo licencia Apache 2.0. Esta version concreta es una cuantizacion, no un entrenamiento nuevo: mradermacher ha convertido los pesos originales de safetensors a GGUF y ha generado multiples niveles de cuantizacion (desde Q2_K hasta f16) para facilitar su despliegue en hardware de consumo mediante llama.cpp y herramientas compatibles.

La relevancia de esta ficha radica en que combina tres caracteristicas poco habituales: es un modelo multimodal (vision + texto), es de tamano reducido (apto para GPU de consumo) y ha sido sometido a un proceso de abliteration que elimina las salvaguardas. Esto lo hace interesante para investigacion sobre alineacion, para entornos controlados de generacion de contenido sin filtros y para experimentacion con modelos vision-lenguaje en local, pero plantea serias advertencias para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje), basado en Granite Vision 4.1 de IBM; detalles exactos de la arquitectura no disponibles en la informacion proporcionada |
| Parametros totales | 3.402.839.040 (aproximadamente 3,4B) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas de proyecciones multimodales mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base heretic-org/granite-vision-4.1-4b-heretic. Por el nombre y el linaje se infiere que deriva de Granite Vision 4.1 de IBM, un modelo multimodal que combina un codificador visual con un modelo de lenguaje transformer. Sin embargo, no se proporcionan datos sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni el codificador visual empleado, por lo que estos datos deben considerarse no disponibles.

Respecto al entrenamiento, la model card de esta cuantizacion no incluye informacion sobre el dataset, el numero de tokens, ni si hubo fases de RLHF o DPO. El unico dato relevante es que el modelo ha pasado por un proceso de "abliteration" (etiquetado como heretic, uncensored, decensored, abliterated), una tecnica que modifica los pesos para eliminar la direccion de rechazo aprendida durante la alineacion. Esta cuantizacion concreta no introduce entrenamiento adicional: mradermacher solo convierte y cuantiza los pesos del modelo base, tal como indica la etiqueta quantized_by y el campo base_model.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte de formato conversacional (tag conversational).
- Procesamiento de imagenes: el modelo es multimodal y requiere los ficheros mmproj (proyeccion multimodal) para funcionar con vision en llama.cpp.
- Capacidad de describir, analizar y responder preguntas sobre imagenes, heredada del modelo Granite Vision original.
- Generacion de texto sin los filtros de rechazo habituales, debido al proceso de abliteration.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta language: en.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el efecto de la abliteration comparando sus respuestas con las del Granite Vision original, en un entorno controlado y con supervision etica.
- Analisis de imagenes en local: con los ficheros mmproj y una cuantizacion Q4_K_M o Q5_K_M, se puede desplegar en una GPU de consumo para tareas de descripcion de imagenes, OCR basico o respuesta visual a preguntas sin depender de APIs externas.
- Prototipado rapido de aplicaciones vision-lenguaje: al ser un GGUF de ~2 GB en Q4, se puede integrar en scripts de Python con llama-cpp-python para validar ideas antes de invertir en modelos mayores.
- Generacion de contenido creativo sin restricciones: en entornos editoriales o de ficcion donde se requiere explorar tematicas sensibles, el modelo evita los rechazos del modelo alineado, aunque con supervision humana obligatoria.
- Educacion e investigacion academica: util para demostrar en clases o papers como las cuantizaciones de baja precision (Q2_K, Q3_K) degradan la calidad frente a Q8_0 o f16 en tareas multimodales.
- Despliegue en hardware limitado: las cuantizaciones Q2_K (1,5 GB) y Q3_K_S (1,7 GB) permiten ejecutar el modelo en equipos con poca VRAM o incluso en CPU, util para demos en portatiles sin GPU dedicada.
- Pruebas de robustez y red teaming: sirve para evaluar como responde un modelo sin salvaguardas ante prompts adversarios, informando el diseno de filtros externos en sistemas de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del modelo de lenguaje, sin contar el contexto ni el proyector multimodal):
  - Q2_K: ~1,5 GB
  - Q3_K_S: ~1,7 GB
  - Q3_K_M: ~1,8 GB
  - Q3_K_L / IQ4_XS: ~2,0 GB
  - Q4_K_S: ~2,1 GB
  - Q4_K_M: ~2,2 GB
  - Q5_K_S / Q5_K_M: ~2,5 GB
  - Q6_K: ~2,9 GB
  - Q8_0: ~3,7 GB
  - f16: ~6,9 GB
- Proyector multimodal adicional: mmproj-Q8_0 ~0,8 GB; mmproj-f16 ~1,3 GB. Hay que sumarlo a la VRAM del modelo de lenguaje.
- GPU recomendadas: para Q4_K_M o Q5_K_M basta una GPU de consumo con 6-8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 2070). Para Q8_0 se recomienda 8-10 GB (RTX 3080, RTX 4070). Para f16 con vision se recomienda 10-12 GB (RTX 3080 Ti, RTX 4080, A4000).
- Cabe en GPU de consumo: si, en la mayoria de cuantizaciones Q2 a Q5 con 6-8 GB de VRAM; las versiones Q8_0 y f16 requieren GPU de gama alta o profesional.
- Opciones de despliegue: llama.cpp (nativo), llama-cpp-python, Ollama (importando el GGUF), LM Studio, text-generation-webui y cualquier runtime compatible con GGUF y mmproj (koboldcpp, entre otros). vLLM y TGI no soportan GGUF de forma nativa en el momento de redactar esta ficha.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/granite-vision-4.1-4b-heretic-GGUF | ~3,4B | no disponible | Si | Apache 2.0 | GGUF en HF |
| heretic-org/granite-vision-4.1-4b-heretic (modelo base) | ~3,4B | no disponible | Si | Apache 2.0 | Safetensors en HF |
| Granite Vision 4.1 4B original (IBM) | ~3,4B | no disponible | Si | Apache 2.0 | Safetensors en HF |
| LLaVA-1.5-7B | ~7B | 4K (tipico) | Si | Apache 2.0 / Llama segun variante | Multiples formatos en HF |

La comparativa se limita a los datos disponibles. No se dispone de informacion sobre benchmarks comparativos entre estas variantes en la informacion proporcionada, por lo que no se puede afirmar cual rinde mejor en tareas concretas. La principal diferencia frente al modelo base es el formato (GGUF cuantizado frente a safetensors) y la presencia de la abliteration, que afecta al comportamiento de rechazo pero no a la arquitectura.

## Limitaciones y advertencias

- La abliteration elimina o reduce los mecanismos de rechazo del modelo: puede generar contenido ofensivo, ilegal o danino sin filtros. No es apto para uso en produccion orientado al publico sin una capa de moderacion externa robusta.
- Riesgo elevado de alucinacion, inherente a los modelos de ~4B parametros y agravado por las cuantizaciones de baja precision (Q2_K, Q3_K), que degradan la coherencia y la fidelidad.
- Sesgos conocidos: no se documentan en la informacion proporcionada, pero al derivar de un modelo entrenado predominantemente en ingles, es probable que presente sesgos culturales y linguisticos propios de ese corpus.
- Limitacion idiomatica: solo se declara soporte de ingles (language: en); el rendimiento en castellano no esta garantizado ni documentado.
- La licencia Apache 2.0 permite uso comercial, pero el autor de la abliteration y el cuantizador no ofrecen garantias sobre el comportamiento del modelo; el usuario asume la responsabilidad legal del contenido generado.
- Las cuantizaciones IQ y K de baja precision pueden degradar especialmente las capacidades multimodales; se recomienda Q4_K_M o superior para tareas de vision.
- No hay informacion sobre la longitud de contexto soportada, lo que impide planificar despliegues con conversaciones largas o documentos extensos.
- El modelo base heretic-org/granite-vision-4.1-4b-heretic no esta auditado en la informacion disponible; se desconoce la calidad exacta del proceso de abliteration aplicado.
- El repositorio tiene 0 likes y 486 descargas en el momento de la consulta, lo que sugiere poca validacion comunitaria.

## Enlaces

- Repositorio Hugging Face de esta cuantizacion: https://huggingface.co/mradermacher/granite-vision-4.1-4b-heretic-GGUF
- Modelo base: https://huggingface.co/heretic-org/granite-vision-4.1-4b-heretic
- Pagina de resumen y descargas de mradermacher: https://hf.tst.eu/model#granite-vision-4.1-4b-heretic-GGUF
- Cuantizaciones con imatrix (i1): https://huggingface.co/mradermacher/granite-vision-4.1-4b-heretic-i1-GGUF
- FAQ y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de TheBloke referenciado): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/

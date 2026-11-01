# Capibara-LLM/Qwen3.5-0.8B-Jopara-Epoch-GGUF

## Resumen

Qwen3.5-0.8B-Jopara-Epoch-GGUF es una cuantizacion en formato GGUF de un modelo de la familia Qwen3.5, publicada por el usuario Capibara-LLM bajo el identificador Qwen3.5-0.8B-Jopara-Epoch. El repositorio contiene los pesos convertidos a GGUF mediante la herramienta de Unsloth, junto con un fichero de proyeccion multimodal (mmproj), lo que indica que el modelo subyacente es un modelo vision-lenguaje (VLM) capaz de procesar imagenes ademas de texto. El sufijo "Jopara" sugiere un ajuste fino o variante especifica del autor, aunque la model card no documenta el proceso de entrenamiento ni el dataset empleado.

El modelo base declarado tiene aproximadamente 772,8 millones de parametros, lo que lo situa en la gama ultra-ligera, apta para ejecucion en CPU, GPUs de consumo y dispositivos con recursos limitados. La publicacion incluye dos ficheros: una cuantizacion F16 del proyector multimodal y una cuantizacion Q4_K_M del modelo principal, generada con imatrix, lo que reduce el peso a unos pocos cientos de megabytes.

La relevancia de esta ficha es limitada por la escasez de informacion: el repositorio no incluye model card detallada, no declara licencia, idiomas ni pipeline, y no se han publicado resultados de benchmarks. Se trata, por tanto, de una publicacion reciente (noviembre de 2026) con cero descargas y cero likes en el momento de la consulta, cuyo interes principal es la disponibilidad de un VLM de menos de mil millones de parametros en GGUF para pruebas locales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), con proyector multimodal para vision; detalles no disponibles |
| Parametros totales | 772.845.888 (~0,77 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16 (proyector mmproj) y Q4_K_M (modelo principal, generada con imatrix) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repositorio | no disponible |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. Por la nomenclatura y los tags (qwen3_5, vision-language-model, llama.cpp), se infiere que se trata de un transformer de la familia Qwen3.5 con un adaptador o proyector visual que permite el procesamiento conjunto de texto e imagenes. El repositorio incluye un fichero `Qwen3.5-0.8B.F16-mmproj.gguf`, que corresponde al proyector multimodal en precision F16, y un fichero `Qwen3.5-0.8B.Q4_K_M.gguf` con el modelo principal cuantizado a 4 bits con la tecnica Q4_K_M e imatrix, orientada a preservar la calidad en cuantizaciones agresivas.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni las innovaciones tecnicas del modelo base. El sufijo "Jopara-Epoch" sugiere un ajuste fino o una variante entrenada por el autor del repositorio, pero la model card no documenta ni el procedimiento ni los datos empleados. La conversion a GGUF se realizo con Unsloth, segun indica la propia model card.

## Capacidades

- Generacion de texto conversacional, segun el tag "conversational".
- Procesamiento de imagenes: el repositorio incluye un proyector multimodal (mmproj), y la model card indica el uso de `llama-mtmd-cli` para modelos multimodales.
- Compatibilidad con llama.cpp y llama-cpp, incluyendo el flag `--jinja` para plantillas de chat.
- Compatibilidad con endpoints (tag "endpoints_compatible").
- Soporte de cuantizacion Q4_K_M con imatrix para despliegue ligero.
- Capacidades de tool calling, agentes o razonamiento multi-paso: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Prototipado local de VLM en hardware modesto: gracias a sus ~0,77 mil millones de parametros y a la cuantizacion Q4_K_M, el modelo puede ejecutarse en un portatil o en una GPU de consumo para validar pipelines de vision-lenguaje antes de escalar a modelos mayores.
- Descripcion de imagenes en aplicaciones de accesibilidad: el proyector multimodal permite generar texto descriptivo a partir de imagenes capturadas por camara o subidas por el usuario, con latencia baja al ejecutarse en local.
- Clasificacion y extraccion de informacion de documentos escaneados: al combinar vision y texto, puede usarse para tareas de OCR asistido o extraccion de campos en facturas y formularios, siempre que la calidad se valide empiricamente.
- Chatbots de bajo coste en entornos con recursos limitados: el tag "conversational" y la compatibilidad con llama.cpp permiten desplegar un asistente conversacional en CPU o en GPUs pequeñas sin depender de servicios en la nube.
- Educacion y experimentacion: util como modelo de referencia para estudiar el comportamiento de VLM ultra-ligeros, comparar cuantizaciones (F16 frente a Q4_K_M) y medir el impacto de imatrix en la calidad.
- Integracion en pipelines de CI/CD para pruebas de regresion: su tamano reducido permite incluirlo en tests automatizados que verifiquen el correcto funcionamiento de herramientas de inferencia (llama.cpp, llama-mtmd-cli) sin costes elevados.
- Despliegue en dispositivos edge: al caber en memoria de sistemas embebidos con suficiente RAM, puede emplearse en aplicaciones de vision por computador en el borde de la red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano del modelo (~0,77 mil millones de parametros), la cuantizacion Q4_K_M ocuparia del orden de 0,5 GB y la F16 del proyector unos cientos de megabytes adicionales (estimacion orientativa, no confirmada por el autor).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre deberia ser suficiente para la variante Q4_K_M; no hay recomendaciones oficiales.
- Cabe en GPU de consumo: si, previsiblemente en modelos como RTX 3060, RTX 4060, RTX 4090 y similares; tambien es viable en CPU.
- Opciones de despliegue: llama.cpp (`llama-cli` para texto, `llama-mtmd-cli` para multimodal), y por extension cualquier herramienta compatible con GGUF (Ollama, LM Studio, servidores basados en llama-cpp).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas del modelo base, por lo que no es posible establecer una comparativa rigurosa con alternativas. A modo orientativo, se podria comparar con otros VLM de menos de mil millones de parametros de la familia Qwen, pero no se han encontrado en la informacion proporcionada datos verificables de parametros, contexto, rendimiento o licencia para dichos modelos.

| Modelo | Parametros | Contexto | Licencia | Formato | Datos de rendimiento |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-Jopara-Epoch-GGUF | ~0,77 B | no disponible | no disponible | GGUF | no disponibles |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La model card es minima: no documenta licencia, idiomas, contexto, dataset ni proceso de entrenamiento, lo que impide evaluar su idoneidad para produccion.
- El repositorio tiene cero descargas y cero likes, y fue creado en noviembre de 2026; no hay evidencia de validacion por parte de la comunidad.
- Al ser un ajuste fino o variante ("Jopara-Epoch") sin documentacion, se desconoce el impacto del ajuste en sesgos, alucinacion o degradacion de capacidades respecto al modelo base.
- Riesgo de alucinacion inherente a los modelos de lenguaje de este tamano, especialmente en tareas de razonamiento complejo o matematicas.
- La cuantizacion Q4_K_M, aunque usa imatrix, puede degradar la calidad respecto a F16; no se han publicado evaluaciones comparativas.
- Restricciones de licencia para uso comercial: no disponibles; se recomienda contactar con el autor antes de cualquier uso comercial.
- Limitaciones de contexto e idioma: no disponibles; no se puede garantizar soporte del castellano ni de otros idiomas.
- La naturaleza multimodal depende del fichero mmproj; sin el, el modelo solo procesa texto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Capibara-LLM/Qwen3.5-0.8B-Jopara-Epoch-GGUF
- Unsloth (herramienta de conversion): https://github.com/unslothai/unsloth
- llama.cpp (motor de inferencia): no se proporciona enlace en la informacion disponible, aunque es el runtime implicito por el formato GGUF.

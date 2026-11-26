# mradermacher/GLM-Z1-32B-0414-uncensored-heretic-v2-i1-GGUF

## Resumen

GLM-Z1-32B-0414-uncensored-heretic-v2-i1-GGUF es una cuantizacion en formato GGUF, generada por mradermacher, del modelo llmfan46/GLM-Z1-32B-0414-uncensored-heretic-v2. Este modelo base es a su vez una variante "abliterated" o "decensored" del GLM-Z1-32B-0414, un modelo de la familia GLM-Z1 de Zhipu AI orientado a razonamiento. La version heretic-v2 ha sido modificada para eliminar o reducir los mecanismos de rechazo y censura del modelo original, de ahi las etiquetas "uncensored", "decensored" y "abliterated".

El modelo cuenta con 32.566.081.536 parametros totales (aproximadamente 32,6 mil millones) y una licencia MIT, lo que facilita su uso comercial. Esta distribuido exclusivamente en formato GGUF con cuantizaciones de tipo imatrix (i1), lo que lo hace apto para inferencia en CPU y GPU mediante llama.cpp y herramientas compatibles, incluyendo opciones de cuantizacion muy agresivas (desde IQ1_S de 7,4 GB hasta Q6_K). El repositorio ocupa 350,1 GB e incluye multiples variantes de cuantizacion.

La relevancia de esta ficha radica en que ofrece una alternativa de razonamiento de 32B con pesos abiertos, licencia permisiva y despliegue local, aunque con las advertencias propias de un modelo modificado para eliminar restricciones de seguridad. La informacion disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es limitada, por lo que muchos campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base GLM-Z1-32B-0414; transformer, detalles no confirmados en la informacion) |
| Parametros totales | 32.566.081.536 (~32,6B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | zh, en (segun model card); resto no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); existe tambien una version de cuantizaciones estaticas en el repo mradermacher/GLM-Z1-32B-0414-uncensored-heretic-v2-GGUF |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo base. Se sabe que deriva de GLM-Z1-32B-0414, un modelo de la familia GLM-Z1 de Zhipu AI, orientado a tareas de razonamiento, y que la variante heretic-v2 ha sido sometida a un proceso de "abliteration" o "decensoring" para reducir los rechazos y la censura. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO en el modelo original o en la modificacion.

La aportacion tecnica de esta publicacion concreta es la cuantizacion con imatrix (i1), que utiliza una matriz de importancia para preservar mejor la calidad en cuantizaciones agresivas. El autor indica que las cuantizaciones IQ suelen ser preferibles frente a cuantizaciones no-IQ de tamano similar, y ofrece una tabla de recomendaciones (por ejemplo, i1-Q4_K_S como "optimal size/speed/quality" y i1-Q4_K_M como "fast, recommended"). No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional y de razonamiento, heredadas del modelo base GLM-Z1-32B-0414.
- Capacidad de razonamiento multi-paso (el modelo base pertenece a la linea Z1, orientada a reasoning), aunque no se detallan modos explicitos de "thinking" en la informacion.
- Soporte multilingue limitado a chino (zh) e ingles (en) segun la model card.
- Modelo "uncensored"/"abliterated": responde sin los filtros de rechazo habituales del modelo original, lo que cambia su comportamiento en temas sensibles.
- Compatibilidad con endpoints (tag "endpoints_compatible") y uso conversacional.
- No se confirma soporte de tool calling, function calling, vision, audio ni agentes en la informacion disponible.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el efecto de la abliteration comparando su comportamiento con el GLM-Z1-32B original en tareas sensibles, en entornos controlados de laboratorio.
- Despliegue local en estaciones de trabajo: gracias a las cuantizaciones i1 desde 7,4 GB (IQ1_S) hasta 23,2 GB (Q5_K_M), puede ejecutarse en equipos con GPU de consumo mediante llama.cpp u Ollama para prototipado sin conexion.
- Generacion de texto creativo sin restricciones tematicas: escritura de ficcion, guiones o narrativa que requiera explorar temas que el modelo original rechazaria, asumiendo la responsabilidad editorial del contenido.
- Razonamiento asistido en entornos de investigacion: uso del modelo base Z1 para tareas de resolucion de problemas y analisis, con la salvedad de que no se han publicado benchmarks que confirmen su rendimiento tras la modificacion.
- Procesamiento de texto en chino e ingles: tareas de resumen, reescritura o traduccion entre ambos idiomas, los unicos documentados.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece un amplio rango de cuantizaciones i1, lo que permite medir el impacto de la compresion en la calidad de salida para un modelo de 32B.
- Base para fine-tuning o experimentacion: al tener licencia MIT, puede servir como punto de partida para ajustes posteriores en proyectos que requieran un modelo permisivo de 32B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: aproximadamente 7,4 GB (IQ1_S), 12,4 GB (Q2_K), 14,9 GB (IQ3_M), 18,8 GB (Q4_K_S), 19,8 GB (Q4_K_M), 23,2 GB (Q5_K_M) y superior para Q6_K (tamano no listado en el extracto).
- GPU recomendadas: para cuantizaciones Q4/Q5, una RTX 3090 o RTX 4090 (24 GB) permite cargar el modelo completo en VRAM; para cuantizaciones bajas (IQ2/IQ3), tarjetas de 12-16 GB como RTX 4070 Ti o RTX 4080 pueden ser suficientes. En entornos de servidor, A100 o H100 permiten ejecutar cuantizaciones altas con margen para contexto.
- Cabe en GPU de consumo: si, en cuantizaciones desde IQ1 hasta Q5_K_M en tarjetas de 24 GB; las cuantizaciones Q4_K_S y Q4_K_M son las recomendadas por el autor para equilibrio tamano/velocidad/calidad.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el tag "endpoints_compatible" sugiere uso con servidores de inferencia tipo endpoint. No se confirma soporte de vLLM o TGI para esta cuantizacion GGUF concreta.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| GLM-Z1-32B-0414-uncensored-heretic-v2-i1-GGUF (este) | ~32,6B | no disponible | MIT | GGUF (i1) | Variante abliterated, cuantizada con imatrix |
| llmfan46/GLM-Z1-32B-0414-uncensored-heretic-v2 | ~32,6B | no disponible | MIT | safetensors (presumible) | Modelo base sin cuantizar de esta ficha |
| GLM-Z1-32B-0414 (original de Zhipu AI) | ~32B | no disponible | no disponible en la informacion | no disponible | Modelo original con filtros de seguridad |
| mradermacher/GLM-Z1-32B-0414-uncensored-heretic-v2-GGUF | ~32,6B | no disponible | MIT | GGUF (estatico) | Cuantizaciones estaticas del mismo modelo base |

No se dispone de datos de rendimiento (benchmarks) para establecer comparaciones cuantitativas con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo modificado para eliminar rechazos: la abliteration puede degradar la coherencia y la calidad general en comparacion con el modelo original, y aumenta el riesgo de generar contenido danino, ilegal o inseguro.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad tras la modificacion; se debe asumir un riesgo estandar o superior al de un modelo de 32B sin verificar.
- Idiomas: solo se documentan chino e ingles; el rendimiento en castellano no esta garantizado ni evaluado.
- Contexto: la longitud de contexto no esta disponible en la informacion, por lo que no puede planificarse su uso en tareas de ventana larga sin verificacion previa.
- Licencia MIT: permisiva para uso comercial, pero el usuario asume toda la responsabilidad legal y etica sobre las salidas del modelo, especialmente por su naturaleza "uncensored".
- Cuantizaciones muy bajas (IQ1, IQ2, Q2_K) degradan notablemente la calidad; el propio autor las etiqueta como "for the desperate" o "very low quality".
- Ausencia de benchmarks: no hay evidencia publicada del rendimiento del modelo base modificado ni de las cuantizaciones, lo que dificulta su validacion en produccion.
- Fecha de creacion del repositorio (2026-11-22) y datos de descargas (1076) y likes (0): informacion de contexto que sugiere adopcion limitada y poca validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face (esta cuantizacion): https://huggingface.co/mradermacher/GLM-Z1-32B-0414-uncensored-heretic-v2-i1-GGUF
- Modelo base: https://huggingface.co/llmfan46/GLM-Z1-32B-0414-uncensored-heretic-v2
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/GLM-Z1-32B-0414-uncensored-heretic-v2-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#GLM-Z1-32B-0414-uncensored-heretic-v2-i1-GGUF
- Guia de uso de GGUF referenciada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF

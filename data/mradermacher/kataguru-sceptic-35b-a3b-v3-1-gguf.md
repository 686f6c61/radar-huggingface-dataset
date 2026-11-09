# mradermacher/Kataguru-Sceptic-35B-A3B-v3.1-GGUF

## Resumen

Kataguru-Sceptic-35B-A3B-v3.1-GGUF es una distribucion de pesos cuantizados en formato GGUF del modelo Kataguru-Sceptic-35B-A3B-v3.1, publicada por el usuario mradermacher en Hugging Face. El nombre del modelo sugiere una arquitectura de mezcla de expertos (MoE) con 35.000 millones de parametros totales y 3.000 millones de parametros activos por token (notacion A3B), aunque esta informacion no se ha podido verificar en la documentacion proporcionada. El repositorio es una conversión estática de los pesos originales del autor kataguru, orientada a su uso en herramientas de inferencia local compatibles con GGUF.

La relevancia de esta publicacion radica en que facilita el despliegue del modelo en entornos con recursos limitados mediante cuantizaciones de baja precision (desde Q2_K hasta Q8_0, ademas de IQ4_XS y F16), lo que permite ejecutarlo en hardware de consumo. No obstante, la informacion disponible es muy escasa: no se detalla la licencia, los idiomas soportados, la longitud de contexto ni los datos de entrenamiento, y el repositorio no registra descargas ni interacciones en el momento de la consulta.

El dato de parametros totales reportado en los safetensors del repositorio (446.571.248, aproximadamente 0,45 mil millones) entra en contradiccion con el nombre del modelo (35B-A3B), lo que impide confirmar el tamano real del modelo original. Esta discrepancia debe tenerse en cuenta antes de cualquier evaluacion o despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere MoE con 35B totales y 3B activos, sin confirmar) |
| Parametros totales | 446.571.248 segun safetensors del repo (en contradiccion con el nombre 35B-A3B) |
| Parametros activos | no disponible (el nombre sugiere 3B activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo original Kataguru-Sceptic-35B-A3B-v3.1 en la documentacion disponible. La nomenclatura del nombre (35B-A3B) es consistente con un transformer de mezcla de expertos con aproximadamente 35.000 millones de parametros totales y 3.000 millones activos por token, pero no se confirma en la model card ni en los resultados de busqueda. Tampoco se detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

La unica informacion tecnica verificable procede de los metadatos de la conversion GGUF: se trata de una cuantizacion estatica con `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que indica que los pesos se convirtieron desde el formato Hugging Face original antes de cuantizarse. No se ha incluido el tensor `mmproj` (proyector multimodal), aunque una de las fuentes de busqueda describe el modelo como "Image-Text-to-Text", lo que sugiere capacidades de vision en el modelo base que no estarian disponibles en esta distribucion GGUF concreta.

## Capacidades

- Generacion de texto: capacidad basica esperada de un modelo de lenguaje, sin confirmar en la documentacion.
- Capacidades multimodales (imagen-texto): mencionadas en una fuente de busqueda para el modelo base, pero no incluidas en esta conversion GGUF al no aparecer el tensor mmproj.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades de codigo y matematicas: no disponible.

## Casos de uso

- Inferencia local en hardware de consumo: las cuantizaciones Q2_K a Q4_K_M permiten ejecutar el modelo con llama.cpp u Ollama en equipos con GPU de gama media o incluso solo CPU, siempre que se confirme el tamano real del modelo.
- Prototipado rapido sin infraestructura dedicada: al estar en formato GGUF, se puede integrar en aplicaciones de escritorio y scripts de Python mediante llama-cpp-python para pruebas de concepto.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye doce variantes de cuantizacion, lo que facilita medir el compromiso entre calidad y uso de memoria en un mismo modelo.
- Despliegue en entornos con memoria muy restringida: la variante Q2_K reduce al minimo el espacio ocupado, adecuada para dispositivos embebidos o contenedores con limites estrictos de RAM.
- Experimentacion con modelos MoE: si se confirma la arquitectura de mezcla de expertos, el modelo puede servir para estudiar el comportamiento de modelos dispersos en inferencia local.
- Uso como base para fine-tuning ligero: los pesos F16 y Q8_0 permiten partir de una version de alta fidelidad para adaptaciones posteriores, aunque la licencia debe verificarse antes de cualquier uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision debido a la discrepancia en el numero de parametros. El repositorio ocupa 1,5 GB, lo que sugiere que las cuantizaciones son de tamano reducido y compatibles con GPUs de consumo.
- GPU recomendadas: no disponible. Si el modelo real tuviera 35B totales, las cuantizaciones Q4_K_M requeririan aproximadamente 20 GB de VRAM; si el modelo real tuviera 0,45B parametros, cabria en cualquier GPU moderna.
- GPU de consumo: probablemente compatible con RTX 3060, RTX 4060, RTX 4090 y superiores en las cuantizaciones bajas, sin confirmacion oficial.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y llama-cpp-python, al tratarse de formato GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se dispone de informacion suficiente sobre el modelo base ni sobre alternativas comparables de la misma categoria para establecer una comparacion rigurosa.

## Limitaciones y advertencias

- Discrepancia critica en el numero de parametros: el nombre indica 35B-A3B, pero los safetensors del repositorio reportan 446.571.248 parametros; es imprescindible verificar el modelo original antes de usarlo en produccion.
- Licencia no especificada: no se puede garantizar el uso comercial ni la redistribucion.
- Idiomas no documentados: se desconoce el soporte multilingue real.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo.
- Ausencia de benchmarks: no hay evidencia publica de su calidad en tareas estandar.
- Sin datos de entrenamiento ni alineacion: se desconoce el riesgo de sesgos y alucinaciones.
- Repositorio sin descargas ni interacciones: no hay validacion por parte de la comunidad.
- Capacidades multimodales no incluidas: la conversion GGUF no incorpora el proyector mmproj, por lo que la entrada de imagenes no estaria disponible aunque el modelo base la soporte.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) pueden degradar notablemente la calidad de las respuestas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Kataguru-Sceptic-35B-A3B-v3.1-GGUF
- Modelo original: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1
- Repositorio GGUF del autor original: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1-GGUF
- Arbol de archivos del repositorio: https://huggingface.co/kataguru/Kataguru-Sceptic-35B-A3B-v3.1-GGUF/tree/main

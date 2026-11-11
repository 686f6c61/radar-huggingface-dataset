# richardyoung/Qwen2.5-Coder-7B-Instruct-heretic1x-code-GGUF

## Resumen

Qwen2.5-Coder-7B-Instruct-heretic1x-code-GGUF es la distribucion en formato GGUF del modelo richardyoung/Qwen2.5-Coder-7B-Instruct-heretic1x-code, una version "abliterada" (con los mecanismos de rechazo eliminados) de Qwen/Qwen2.5-Coder-7B-Instruct, el modelo de codigo de 7.600 millones de parametros de Alibaba Qwen. La abliteracion se realizo con Heretic 1.x (heretic-llm 1.4.0), aplicando ablacion direccional de rango 1 con direcciones de rechazo derivadas de codigo. El autor, Richard J. Young, publica estos ficheros como material de investigacion sobre eliminacion de rechazos y su evaluacion, no como asistente de proposito general.

El modelo conserva la arquitectura y los pesos del Qwen2.5-Coder-7B-Instruct original, con la unica modificacion de la ablacion direccional, y se distribuye en cuantizaciones GGUF para su uso con llama.cpp y Ollama. El repositorio ocupa 12,8 GB e incluye Q4_K_M (4,7 GB), Q8_0 (8,1 GB) y una importance matrix de 9 MB; el autor anuncia la incorporacion progresiva de IQ3_M, IQ4_XS, Q5_K_M y Q6_K. La relevancia actual es metodologica: forma parte del conjunto de modelos evaluados en un articulo sobre como la regla de seleccion puede invertir las comparativas entre herramientas de abliteracion (Heretic 1.x, Heretic 2.0, OBLITERATUS y publicaciones de la comunidad).

La ficha se centra en la informacion disponible en el repositorio y en la model card; los datos de arquitectura, entrenamiento y capacidades del modelo base no se detallan en la informacion proporcionada y se marcan como no disponibles cuando corresponde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-Coder-7B-Instruct; detalles no disponibles en la informacion proporcionada) |
| Parametros totales | 7.615.616.512 (7,6 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M, Q8_0 (publicadas); IQ3_M, IQ4_XS, Q5_K_M, Q6_K (anunciadas como pendientes); importance matrix (imatrix) |
| Idiomas soportados | en (segun metadatos del repositorio) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base se publica en safetensors |

## Arquitectura y entrenamiento

El modelo es una modificacion post-entrenamiento del Qwen2.5-Coder-7B-Instruct. La tecnica aplicada es abliteracion con Heretic 1.x (heretic-llm 1.4.0): ablacion direccional de rango 1 usando direcciones de rechazo derivadas de codigo. El proceso de seleccion consistio en 200 ensayos y eligio la variante con menos rechazos en el conjunto de desarrollo sujeto a una divergencia KL de primer token respecto al original menor o igual a 0,01; el ensayo seleccionado presenta una KL de 0,0092 y 26 rechazos por palabra clave sobre los 100 prompts de ajuste.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF o DPO en el modelo base; esos datos no aparecen en la informacion proporcionada. Los ficheros GGUF se generaron con llama.cpp (commit 468fde9): conversion con convert_hf_to_gguf.py en outtype bf16 y cuantizacion con llama-quantize sobre CPU, verificando cada fichero de pesos safetensors contra su SHA-256. Las cuantizaciones IQ3_M, IQ4_XS, Q4_K_M y Q5_K_M usan la importance matrix (calibration_datav3, 128 fragmentos de 512 tokens, calculada sobre la build Q8_0); Q6_K y Q8_0 son estaticas. Cada fichero Q4_K_M se cargo y respondio a un prompt de prueba antes de la subida.

## Capacidades

- Generacion de texto y codigo: hereda las capacidades del Qwen2.5-Coder-7B-Instruct original, orientado a tareas de programacion.
- Conversacion multi-turno: el repositorio esta etiquetado como conversational.
- Eliminacion de rechazos: el modelo cumple muchas peticiones que el original rechaza (tasa de rechazo del 62,2% frente al 83,2% del original sobre 972 prompts daninos retenidos, segun el articulo y para el modelo en precision completa).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: los metadatos solo declaran ingles (en).
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre abliteracion: el modelo sirve como sujeto de estudio para medir la eliminacion de rechazos, comparar herramientas (Heretic 1.x, Heretic 2.0, OBLITERATUS) y reproducir los resultados del articulo del autor.
- Evaluacion de defensas frente a la eliminacion de rechazos: permite probar clasificadores, filtros de salida y mecanismos de moderacion contra un modelo con rechazos reducidos.
- Estudio del efecto de la cuantizacion en el comportamiento de rechazo: la model card advierte que la cuantizacion puede alterar la conducta de rechazo, por lo que los ficheros Q4_K_M y Q8_0 permiten comparar ese efecto frente al modelo en bf16.
- Despliegue local con llama.cpp: el fichero Q4_K_M (4,7 GB) se ejecuta con llama-cli sobre hardware de consumo, util para pruebas de inferencia en entornos controlados.
- Experimentos con Ollama: el autor publica instrucciones de uso con ollama run, lo que facilita la integracion en flujos de investigacion locales.
- Analisis de divergencia respecto al original: el modelo permite estudiar el impacto de la ablacion en la distribucion de salida (KL de primer token de 0,0092 en el ensayo seleccionado).
- Generacion de codigo en entornos de investigacion: al conservar la base Qwen2.5-Coder, puede usarse para tareas de programacion en laboratorios, siempre dentro de los usos previstos por el autor.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los de la model card para el modelo en precision completa (bf16), no para los ficheros GGUF:

| Metrica | Original | Este modelo |
|---|---|---|
| Rechazo sobre 972 prompts daninos retenidos (juez WildGuard) | 83,2% | 62,2% (605/972) |
| Rechazos por palabra clave sobre los 100 prompts de ajuste (ensayo seleccionado) | no disponible | 26 |
| Divergencia KL de primer token respecto al original (ensayo seleccionado) | no disponible | 0,0092 |

Regla de seleccion: menos rechazos en desarrollo con KL menor o igual a 0,01 (200 ensayos). No se han publicado resultados de benchmarks de codigo (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: Q4_K_M requiere aproximadamente 4,7 GB de pesos mas overhead de contexto; Q8_0 requiere aproximadamente 8,1 GB mas overhead.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, Q4_K_M es apto para GPUs de consumo con 6-8 GB de VRAM y Q8_0 para GPUs con 10-12 GB o mas.
- Cabe en GPU de consumo: si, en el caso de Q4_K_M en GPUs con al menos 6-8 GB de VRAM; Q8_0 requiere una GPU de gama alta de consumo o superior.
- Opciones de despliegue: llama.cpp (llama-cli), Ollama (ollama run con la etiqueta del repositorio o hf.co) y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos (972 prompts, WildGuard) | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (heretic1x-code) | 7,6 B | no disponible | 62,2% | apache-2.0 | GGUF |
| Qwen/Qwen2.5-Coder-7B-Instruct (original) | 7,6 B | no disponible | 83,2% | apache-2.0 | safetensors |
| Heretic 2.0 sobre Qwen2.5-Coder | no disponible | no disponible | no disponible | no disponible | no disponible |
| OBLITERATUS sobre Qwen2.5-Coder | no disponible | no disponible | no disponible | no disponible | no disponible |

Los modelos Heretic 2.0 y OBLITERATUS se mencionan en el articulo citado como alternativas evaluadas, pero sus cifras concretas no aparecen en la informacion proporcionada; se indican como no disponibles.

## Limitaciones y advertencias

- El autor declara explicitamente que los ficheros se publican para investigacion sobre abliteracion y su evaluacion, no como asistente de proposito general.
- El modelo cumple muchas peticiones que el original rechaza; la tasa de rechazo baja del 83,2% al 62,2% en el modelo completo, lo que implica un riesgo mayor de generar contenido danino.
- Las cifras de rechazo y KL corresponden al modelo en bf16; la model card advierte que la cuantizacion puede cambiar el comportamiento de rechazo y que los ficheros GGUF no fueron evaluados en el articulo.
- Idiomas: los metadatos solo declaran ingles; el comportamiento en castellano no esta documentado.
- Longitud de contexto: no disponible en la informacion proporcionada.
- Riesgo de alucinacion y sesgos conocidos: no documentados en la informacion proporcionada.
- Licencia apache-2.0, con las mismas restricciones de uso que el modelo de origen; el usuario es responsable del uso legal.
- El modelo base es una modificacion de Qwen2.5-Coder-7B-Instruct; cualquier limitacion del original no documentada aqui debe consultarse en su model card.

## Enlaces

- Repositorio GGUF: https://huggingface.co/richardyoung/Qwen2.5-Coder-7B-Instruct-heretic1x-code-GGUF
- Modelo base (abliterado, safetensors): https://huggingface.co/richardyoung/Qwen2.5-Coder-7B-Instruct-heretic1x-code
- Modelo original: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct/blob/main/LICENSE
- Articulo citado: Young, R. J., *The Selection Rule Can Reverse LLM Abliteration Tool Comparisons: Heretic 1.x, Heretic 2.0, OBLITERATUS and Community Releases on Qwen2.5 and Qwen2.5-Coder* (enlace arXiv pendiente de publicacion)

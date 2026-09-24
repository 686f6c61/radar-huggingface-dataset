# lucasoc/sci-image-markdown-qwen2.5-vl-3b

## Resumen

Sci-Image-Markdown Qwen2.5-VL-3B es un adaptador LoRA (PEFT) entrenado por el usuario `lucasoc` sobre el modelo multimodal Qwen2.5-VL-3B-Instruct. Su unica tarea es extraer los datos cuantitativos representados en paneles de figuras cientificas y devolverlos como tablas Markdown limpias y estructuradas, con encabezados de columna. Resuelve un problema muy concreto de la cadena de publicacion cientifica: la mayor parte de los resultados experimentales se publican como graficos de barras, lineas o dispersion, no como datos tabulados, lo que obliga a digitalizarlos a mano para reutilizarlos.

La relevancia del modelo esta en su metodo de entrenamiento: en lugar de un ajuste fino supervisado clasico con entropia cruzada, se emplea una perdida consciente de la metrica ICDAR, que combina una perdida ponderada por token para valores numericos y estructura con recompensas calculadas en VRAM para el Tree Edit Distance (TEDS) y el error RMS de celda. Segun la model card, esto eleva la precision de celda del 21,08 % (modelo base en zero-shot) al 39,58 %, y el TEDS del 23,16 % al 36,24 % sobre un conjunto de test de 373 figuras cientificas.

El adaptador es muy ligero: se entreno con QLoRA de 4 bits sobre una unica NVIDIA GTX 1660 de 6 GB de VRAM, lo que lo convierte en un ejemplo reproducible de ajuste fino multimodal en hardware de consumo. La distribucion es un adaptador en safetensors que requiere descargar por separado el modelo base Qwen2.5-VL-3B-Instruct; el repositorio no incluye pesos completos ni datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen2.5-VL: transformer multimodal vision-lenguaje con codificador visual ViT y decoder de lenguaje autorregresivo |
| Parametros totales | 3B en el modelo base (Qwen2.5-VL-3B-Instruct); numero de parametros entrenables del adaptador: no disponible (r=16, alpha=32) |
| Parametros activos | No aplica, no es un modelo MoE |
| Longitud de contexto | 32.768 tokens en el modelo base Qwen2.5-VL-3B-Instruct; no se especifica una variacion para el adaptador |
| Tipos de cuantizacion | 4-bit NF4 con doble cuantizacion (bitsandbytes) en el ejemplo de inferencia oficial; el adaptador se publica sin cuantizar |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 para el adaptador; el modelo base se distribuye, segun la model card, bajo Qwen Research License / Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base debe descargarse aparte |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen2.5-VL-3B-Instruct, un transformer multimodal que proyecta parches de imagen mediante un codificador visual ViT hacia el espacio de tokens del decoder de lenguaje. El ajuste se realizo con QLoRA de 4 bits: pesos base congelados en NF4, computo del adaptador en FP16, rango r=16 y alpha=32. Todo el entrenamiento cupo en una unica NVIDIA GeForce GTX 1660 de 6 GB de VRAM, lo que da una idea del reducido coste computacional del procedimiento.

La innovacion tecnica es la funcion de perdida, denominada por el autor ICDAR Metric-Aware Loss. Se trata de una perdida ponderada por token que actua como proxy diferenciable del Tree Edit Distance y del error numerico relativo, complementada con recompensas calculadas directamente en VRAM para TEDS y para el error RMS de celda. El objetivo es penalizar de forma explicita los fallos que importan en una tabla: estructura incorrecta y cifras mal transcritas. No se documenta el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO; tampoco se publican los datos de entrenamiento en el repositorio.

## Capacidades

- Extraccion de datos cuantitativos de paneles de figuras cientificas (barras, lineas, dispersion y similares) directamente a tablas Markdown.
- Generacion de tablas Markdown validas en el 99,73 % de los casos del conjunto de test de 373 figuras.
- Inferencia de encabezados de columna a partir del contexto visual de la figura.
- Conversion de imagen a texto (pipeline `image-to-text`) con salida estructurada lista para parsear.
- Precision de celda del 39,58 % y F1 de celda del 34,67 % en la evaluacion publicada.
- Ejecucion en GPU de consumo gracias a la cuantizacion 4-bit NF4 documentada en el ejemplo oficial.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no, el modelo declara unicamente ingles (`en`).
- Capacidades especiales (modo thinking, audio, vision adicional): no documentadas mas alla de la entrada de imagen.

## Casos de uso

- Revisiones sistematicas y meta-analisis: extraer de forma masiva los valores numericos de las figuras de los articulos incluidos en la revision para construir la matriz de datos del analisis, en lugar de transcribirlos manualmente.
- Digitalizacion de repositorios de articulos: pipeline que convierte cada PDF en imagenes de figura, pasa cada panel por el adaptador y almacena las tablas resultantes en una base de datos consultable.
- Curacion de datasets cientificos: generar conjuntos de datos numericos a partir de literatura publicada para reentrenar o validar modelos en dominios donde los datos brutos no se publican.
- Control de calidad y reproducibilidad: comparar los valores extraidos de las figuras con los declarados en el texto o en las tablas del articulo para detectar inconsistencias antes de la publicacion.
- Indexacion y busqueda semantica de literatura: transformar figuras en tablas indexables permite busquedas del tipo "articulos donde la precision supere el 90 %" sobre el contenido grafico, no solo sobre el texto.
- Extraccion desde capturas de pantalla de cuadernos de laboratorio o instrumentacion: digitalizar graficos capturados en pantalla cuando no existe el fichero de datos original, aprovechando la entrada de imagen directa.
- Investigacion sobre funciones de perdida: servir de referencia reproducible para estudiar perdidas conscientes de metrica (TEDS, RMS) en tareas de extraccion estructurada, ya que el codigo y el adaptador son publicos.
- Material docente: convertir figuras de libros y apuntes en tablas editables para preparar ejercicios y soluciones con datos reales.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre un conjunto de test de 373 figuras cientificas. Se comparan el modelo base en zero-shot, un ajuste fino supervisado estandar con entropia cruzada y el adaptador con perdida ICDAR.

| Metrica | Base (zero-shot) | SFT estandar | LoRA ICDAR |
|---|---|---|---|
| Tabla Markdown valida | 88,74 % | 99,73 % | 99,73 % |
| Precision de celda | 21,08 % | 21,37 % | 39,58 % (+85,2 %) |
| F1 de celda | 18,42 % | 20,60 % | 34,67 % (+68,3 %) |
| TEDS (Tree Edit Distance) | 23,16 % | 23,16 % | 36,24 % (+56,5 %) |
| RMS numerico ICDAR | 48,12 % | 48,12 % | 51,66 % (+7,4 %) |
| Puntuacion compuesta ICDAR | 35,64 % | 35,64 % | 43,95 % (+23,3 %) |

No se han publicado resultados de benchmarks generales (MMLU, GSM8K, HumanEval u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM en 4-bit NF4: aproximadamente 2,5-3,5 GB para los pesos del modelo base de 3B, mas el overhead del codificador visual y de las activaciones; el ejemplo oficial esta pensado para ejecucion con `bitsandbytes`.
- VRAM en FP16: del orden de 7,5-8 GB para pesos y cache, sin contar el procesamiento de imagenes de alta resolucion.
- GPU recomendadas: GTX 1660 de 6 GB (configuracion usada por el autor para el entrenamiento QLoRA), RTX 3060 12 GB, RTX 4090, A100 y H100 para despliegues con concurrencia.
- Cabe en GPU de consumo: si, en 4-bit cabe incluso en tarjetas de 6 GB; en FP16 requiere al menos 8-10 GB.
- Opciones de despliegue: `transformers` + `peft` + `bitsandbytes` + `qwen-vl-utils` (ruta documentada); vLLM y TGI admiten adaptadores LoRA, aunque el soporte concreto para este adaptador sobre el modelo base VL no esta documentado por el autor; llama.cpp u Ollama requeririan fusionar y convertir el adaptador a GGUF, procedimiento no publicado.
- Latencia y throughput: no disponible. El ejemplo de inferencia fija `max_new_tokens=1024` y `temperature=0.0` para generacion determinista.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lucasoc/sci-image-markdown-qwen2.5-vl-3b | 3B (base) + LoRA | 32.768 tokens (base) | Extraccion de tablas desde figuras cientificas | apache-2.0 (adaptador) | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen2.5-VL-3B-Instruct | 3B | 32.768 tokens | Vision-lenguaje general | Qwen Research License / Apache 2.0 segun la model card | Ampliamente disponible |
| Qwen/Qwen2.5-VL-7B-Instruct | 7B | 32.768 tokens | Vision-lenguaje general | Apache 2.0 | Ampliamente disponible |
| DePlot / MatCha (Google Research) | Del orden de 300M-1B | No disponible | Conversion de graficos y tablas a representacion lineal | No disponible en la informacion proporcionada | Codigo y pesos publicos |

La comparacion de rendimiento con DePlot, MatCha o con Qwen2.5-VL-7B-Instruct en la misma tarea no esta disponible: el autor solo publica la comparacion interna entre base, SFT estandar y su adaptador ICDAR.

## Limitaciones y advertencias

- Precision de celda del 39,58 %: aproximadamente seis de cada diez celdas no coinciden exactamente con la referencia, por lo que la salida exige verificacion humana antes de usarse en produccion o en publicaciones.
- TEDS del 36,24 % y RMS numerico ICDAR del 51,66 %: la calidad estructural de la tabla y la fidelidad de las cifras siguen siendo limitadas, especialmente con ejes no lineales o leyendas densas.
- Riesgo de alucinacion numerica: el modelo puede generar valores plausibles que no aparecen en la figura, un fallo critico en contextos cientificos.
- Sesgo de dominio: no se documenta la composicion del conjunto de entrenamiento, por lo que se desconoce su comportamiento fuera de los tipos de grafico y disciplinas representados; el test se limita a 373 figuras.
- Idioma: solo ingles. No hay evidencia de funcionamiento correcto con figuras cuyos ejes, leyendas o etiquetas esten en castellano u otros idiomas.
- Licencia: el adaptador es apache-2.0, pero el modelo base Qwen2.5-VL-3B-Instruct puede estar sujeto a la Qwen Research License, con posibles restricciones de uso comercial. Conviene verificar los terminos del modelo base antes de desplegarlo en producto.
- Cuantizacion 4-bit NF4: introduce perdida de precision adicional respecto a FP16, no cuantificada por el autor.
- Adopcion nula y validacion externa inexistente: 0 descargas, 0 likes y un repositorio de 0,0 GB en el momento de la consulta; no hay evaluaciones independientes ni casos de uso verificados por terceros.
- No se documentan sesgos demograficos ni eticos, ni procedimientos de alineacion adicionales mas alla del modelo base.
- El prompt de extraccion influye en el resultado: el ejemplo usa una instruccion fija en ingles y se desconoce la robustez ante variaciones de prompt.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lucasoc/sci-image-markdown-qwen2.5-vl-3b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- Repositorio del codigo (sci-image-markdown): https://github.com/lucasdocunha/sci-image-markdown
- Repositorio oficial de Qwen2.5-VL: https://github.com/QwenLM/Qwen2.5-VL

Nota: la busqueda web realizada no ha devuelto resultados tecnicos relevantes sobre este modelo; unicamente se han encontrado paginas sin relacion con el contenido solicitado, por lo que no se incluyen como fuentes.

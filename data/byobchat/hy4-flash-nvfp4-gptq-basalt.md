# byobChat/Hy4-flash-NVFP4-GPTQ-Basalt

## Resumen

Hy4-flash NVFP4 GPTQ para Basalt es una cuantización del modelo multimodal tencent/Hy4-flash, publicada por el usuario byobChat. No se trata de un modelo original, sino de un derivado cuantizado y reempaquetado para el motor de inferencia Basalt (versión 0.5.6, commit 9e184fd88). El pack sustituye los expertos enrutados del pack de referencia de jesdga por una versión propia en NVFP4 con GPTQ, manteniendo intactos el resto de componentes: tensores densos en Q8_0, cabeza de salida, tabla Engram, codificador de visión, drafter DFly2 y tokenizador.

El modelo base es un MoE multimodal de tipo image-text-to-text, por lo que acepta entradas de imagen y texto y genera texto. La cuantización está pensada específicamente para GPUs Blackwell con soporte de NVFP4 (formato de 4 bits con escalas de bloque), lo que reduce el peso del fichero a 158,7 GB. Es relevante para quienes despliegan Hy4-flash en hardware Blackwell y buscan un equilibrio entre calidad y velocidad, con métricas publicadas de KLD y throughput frente a alternativas como el pack NVFP4 de jesdga o los GGUF Q4_K/Q5_1 del propio autor.

La licencia es la Tencent Hy License 1.0, basada en Apache 2.0 con términos comerciales adicionales en la sección 10. No es una release oficial de Tencent y el autor declara explícitamente no haber probado contextos superiores a 16K de prompt ni GPUs distintas de la RTX PRO 6000 Blackwell.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal (image-text-to-text) con codificador de visión, drafter DFly2 y tabla Engram; motor Basalt |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (probado hasta 16K de prompt; contexto de 32K usado en la prueba de visión) |
| Tipos de cuantizacion | NVFP4 con GPTQ en gate/up de expertos enrutados; tensores densos en Q8_0; down sin GPTQ |
| Idiomas soportados | no disponible |
| Licencia | Tencent Hy License 1.0 (basada en Apache 2.0 con términos comerciales adicionales en la sección 10) |
| Formato de pesos | `.basalt` (158,7 GB) |

## Arquitectura y entrenamiento

El modelo base tencent/Hy4-flash es un transformer de mezcla de expertos (MoE) con capacidad multimodal de entrada image-text-to-text. El pack aquí descrito no reentrena el modelo: parte del pack de jesdga (Hy4-flash-Basalt) y sustituye únicamente los expertos enrutados por una cuantización NVFP4 propia. El proceso de cuantización combina una búsqueda de escalas de bloque ponderada por matriz de importancia (imatrix) y redondeo GPTQ sobre las proyecciones gate/up, con 98.000 tokens de calibración; la proyección down se cuantiza sin GPTQ. El resto de secciones (tensores densos Q8_0, cabeza de salida, tabla Engram, codificador de visión, drafter DFly2 y tokenizador) es copia byte a byte del pack de jesdga.

El motor Basalt incorpora decodificación especulativa mediante el drafter DFly2, activada en las pruebas de velocidad. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base empleó RLHF o DPO.

## Capacidades

- Generación de texto a partir de entradas multimodales (imagen y texto).
- Comprensión de imágenes: el autor validó con `--vision dynamic` la lectura de formas, texto, tablas, gráficos de barras y texto en ruido, así como prompts con dos imágenes.
- Razonamiento y generación de prosa y salidas estructuradas (categorías "chat", "structured" y "prose" en las pruebas de velocidad).
- Decodificación especulativa mediante el drafter DFly2 integrado en el pack.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Análisis documental con imágenes: extracción de contenido de tablas, gráficos y capturas mediante el codificador de visión, aprovechando la validación del autor sobre tablas y gráficos de barras.
- Asistente conversacional multimodal: despliegue en chat con prompts de hasta 16K tokens, el rango validado por el autor, usando el modo "chat" del motor Basalt.
- Generación de salidas estructuradas: el pack incluye una categoría de prueba específica ("structured") con 268 tokens/s, adecuada para pipelines que requieren JSON u otro formato rígido.
- Redacción de prosa a gran velocidad: con 137 tokens/s en la categoría "prose" sobre una RTX PRO 6000 Blackwell, útil para generación de contenido por lotes.
- Procesamiento por lotes de prompts largos: 3.519 tokens/s con prompt de 16K, adecuado para tareas de resumen o clasificación sobre documentos extensos dentro de ese límite.
- Investigación en cuantización NVFP4: el pack publica métricas de KLD y Top-1 frente a alternativas, lo que lo hace útil como referencia para estudiar el impacto de GPTQ en expertos enrutados sobre hardware Blackwell.
- Despliegue en entornos con GPUs Blackwell profesionales: el autor lo probó exclusivamente en RTX PRO 6000 Blackwell, por lo que encaja en infraestructura con esa generación de GPU.

## Benchmarks y rendimiento

Calidad (basalt-bench --quality 100, wikitext-2, dos RTX PRO 6000, referencia `hy4flash-bf16-base.kld`):

| Pack | KLD | Top-1 |
|---|---|---|
| byobChat Q4_K / Q5_1 | 0,168 | 87,31% |
| byobChat NVFP4 GPTQ | 0,196 | 86,51% |
| jesdga NVFP4 | 0,207 | 86,17% |

Comparación pareada frente al pack de jesdga: Q4_K/Q5_1 −0,040 ± 0,004; NVFP4 GPTQ −0,012 ± 0,005 (error estándar por chunk). El autor advierte que estos valores no son comparables con los de sus fichas GGUF, que usan otros textos.

Velocidad (una RTX PRO 6000 Blackwell, tokens/s, una ejecución, DFly2 activado):

| Pack | 16K prompt | chat | structured | prose |
|---|---|---|---|---|
| byobChat Q4_K / Q5_1 | 2.945 | 160 | 258 | 132 |
| byobChat NVFP4 GPTQ | 3.519 | 163 | 268 | 137 |
| jesdga NVFP4 | 3.552 | 158 | 272 | 136 |

## Requisitos de hardware

- Tamaño del fichero de pesos: 158,7 GB en formato `.basalt`, lo que exige memoria agregada muy superior a la de cualquier GPU de consumo.
- GPU probada: RTX PRO 6000 Blackwell (una unidad para velocidad y visión; dos para la medición de calidad).
- Soporte de NVFP4 imprescindible: el formato de 4 bits con escalas de bloque requiere hardware Blackwell.
- GPUs de consumo: no cabe en ninguna GPU de consumo actual por el tamaño del pack y por el requisito de NVFP4.
- Despliegue: exclusivamente mediante el motor Basalt (`bin/basalt serve models/Hy4-flash-NVFP4-GPTQ.basalt --vision dynamic`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Contexto en pruebas de visión: 32K con una RTX PRO 6000.
- Latencia y throughput: 3.519 tokens/s con prompt de 16K; 163 tokens/s en chat; 268 tokens/s en structured; 137 tokens/s en prosa (una RTX PRO 6000 Blackwell, DFly2 activado).
- No probado por el autor: contextos superiores a 16K de prompt ni GPUs distintas de la RTX PRO 6000 Blackwell.

## Comparativa con modelos similares

| Pack | Formato | Tamaño | KLD | Top-1 | Velocidad chat (tokens/s) | Licencia |
|---|---|---|---|---|---|---|
| byobChat NVFP4 GPTQ (este) | `.basalt` NVFP4 + GPTQ | 158,7 GB | 0,196 | 86,51% | 163 | Tencent Hy License 1.0 |
| byobChat Q4_K / Q5_1 | GGUF (Q4_K/Q5_1) | no disponible | 0,168 | 87,31% | 160 | Tencent Hy License 1.0 |
| jesdga NVFP4 | `.basalt` NVFP4 | no disponible | 0,207 | 86,17% | 158 | Tencent Hy License 1.0 |

Los tres packs derivan del mismo modelo base tencent/Hy4-flash y comparten motor Basalt, por lo que la comparación se limita a formato, calidad y velocidad. No se dispone de datos para comparar con modelos de otros autores o familias.

## Limitaciones y advertencias

- No es una release oficial de Tencent: es un derivado cuantizado y reempaquetado por byobChat.
- Solo se ha probado en una RTX PRO 6000 Blackwell; el comportamiento en otras GPUs Blackwell es desconocido.
- No se ha probado con prompts superiores a 16K, pese a que la prueba de visión usó 32K de contexto.
- La calidad medida (KLD 0,196, Top-1 86,51%) es inferior a la del pack Q4_K/Q5_1 del mismo autor (KLD 0,168, Top-1 87,31%), aunque superior a la del pack NVFP4 de jesdga.
- Las métricas de calidad no son comparables con las de las fichas GGUF del autor, que emplean otros textos de evaluación.
- Las mediciones de velocidad son de una sola ejecución por configuración, sin repetición estadística.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada.
- Idiomas soportados: no disponible; no se puede confirmar cobertura multilingüe.
- Licencia Tencent Hy License 1.0: basada en Apache 2.0 pero con términos comerciales adicionales en la sección 10, que deben revisarse antes de un uso comercial.
- Requiere el motor Basalt y hardware con soporte NVFP4; no hay rutas de despliegue alternativas documentadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/byobChat/Hy4-flash-NVFP4-GPTQ-Basalt
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Pack de referencia de jesdga: https://huggingface.co/jesdga/Hy4-flash-Basalt
- Motor Basalt: https://github.com/jesdga95/basalt
- Licencia (referenciada en la model card): LICENSE dentro del repositorio del modelo

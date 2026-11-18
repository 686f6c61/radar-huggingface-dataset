# 13fragments/kurrent-transcriber-1b

## Resumen

Kurrent Transcriber 1B es un modelo de transcripcion de escritura manuscrita historica alemana, especializado en las grafias Kurrent y Sütterlin, desarrollado por 13fragments. Se trata de un merge de pesos de dos fine-tunes de LightOnOCR-3-1B: un fine-tune propio del autor (no publicado) y LightOnOCR-3-1B-Historic-German-Handwriting de Bernhard Straub. El resultado es un modelo de aproximadamente 1.005 millones de parametros (1B) que recibe una imagen de pagina completa y devuelve el texto linea a linea tal como aparece escrito.

El modelo aborda un problema concreto y de nicho: la lectura automatizada de documentos manuscritos alemanes historicos, un dominio donde los OCR convencionales fallan y donde las herramientas comerciales (Transkribus German Genius) dominan el mercado. Su relevancia radica en que ofrece una alternativa de pesos abiertos, ejecutable en hardware propio y de tamano reducido, con un rendimiento declarado en tasa de error de caracteres a la altura de la referencia comercial en el benchmark interno del autor.

La arquitectura subyacente es Mistral3 multimodal (image-text-to-text), con un codificador visual y una proyeccion visual que son la media de los dos fine-tunes fusionados, mientras que el modelo de lenguaje se mantiene el del modelo base. La licencia de los pesos es CC BY-SA 4.0 y el codigo de inferencia se distribuye bajo Apache-2.0. El modelo esta pensado explicitamente como generador de borradores que requieren revision humana linea a linea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mistral3 multimodal (image-text-to-text), transformer con codificador visual |
| Parametros totales | 1.005.647.872 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens en servidor vLLM (configurado con `--max-model-len 16384`); maximo de 4.096 tokens nuevos por generacion |
| Tipos de cuantizacion | no disponible (pesos en safetensors, dtype bfloat16 en la configuracion de referencia) |
| Idiomas soportados | aleman (de); casi todo el entrenamiento es aleman |
| Licencia | CC BY-SA 4.0 (pesos); Apache-2.0 (codigo de inferencia) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un merge de pesos, no un entrenamiento desde cero. Parte de LightOnOCR-3-1B (Apache-2.0) y combina dos fine-tunes del mismo: el fine-tune propio de 13fragments (no publicado) y LightOnOCR-3-1B-Historic-German-Handwriting de Bernhard Straub. El codificador visual y la proyeccion visual resultan de promediar los de ambos fine-tunes, mientras que el modelo de lenguaje se toma directamente del modelo base. La arquitectura es Mistral3 multimodal, con pipeline image-text-to-text.

No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si hubo RLHF o DPO en los fine-tunes originales. La innovacion tecnica destacable no esta en la arquitectura sino en el motor de inferencia: el cliente aplica un paso de imagen que pinta sobre los elementos ajenos a la hoja (cartas de color, reglas, bandas de biblioteca y margenes), una peticion sin prompt de texto con decodificacion greedy, una penalizacion de repeticion ventaneada de 1.1 sobre los ultimos 20 tokens, un mapeo de la marca del modelo (tachado, insertado, subrayado, ilegible, celdas de tabla) y un paso de salida que corta bucles de repeticion cuando la respuesta alcanza los 4.096 tokens, marcando la pagina como `incomplete: "repetition"`.

## Capacidades

- Transcripcion de escritura manuscrita historica alemana: Kurrent, Sütterlin y grafias relacionadas, linea a linea.
- Lectura de paginas completas como imagen de entrada (JPEG, PNG, WebP), sin prompt de texto.
- Marcado de texto tachado, insertado y subrayado, con eliminacion de marcas y conservacion del texto en el cliente.
- Deteccion de pasajes ilegibles, sustituidos por `[unleserlich]` en la salida.
- Reconocimiento de tablas, con separador ` | ` entre celdas en la salida mapeada.
- Salida JSON con la respuesta sin mapear ademas del texto procesado.
- Uso offline en hardware propio.
- No soporta tool calling, function calling ni razonamiento multi-paso; no es un modelo de agentes.
- No soporta vision general mas alla del OCR/HTR de documentos; no procesa audio.

## Casos de uso

- Digitalizacion de archivos genealogicos: transcripcion por lotes de registros parroquiales y libros de familia en Kurrent, con revision humana posterior contra el escaneo. El modelo cabe en una GPU de consumo y procesa paginas completas sin recortes.
- Proyectos de historia local y archivos municipales: generacion de borradores de transcripcion de actas y documentos administrativos historicos en aleman, reduciendo el trabajo manual de tecleo antes de la validacion archivistica.
- Investigacion academica en linguistica historica: creacion de corpus de texto aleman historico a partir de manuscritos, con la salvedad de que los nombres, fechas y lugares requieren revision (recall de entidades mediano de 0,83).
- Preservacion digital en bibliotecas: procesamiento offline en hardware propio de fondos manuscritos, sin dependencia de servicios en la nube, gracias a sus 1B de parametros y a la licencia CC BY-SA 4.0.
- Edicion critica de textos: transcripcion con marcado de tachados, insertados y subrayados, util para estudiar variantes y correcciones en manuscritos de autor.
- Extraccion de tablas historicas: reconocimiento de celdas en documentos contables o registros tabulares manuscritos, con separador de celdas en la salida.
- Plataformas de transcripcion colaborativa: integracion como motor de borrador en flujos donde voluntarios corrigen linea a linea contra la imagen, aprovechando la marca de paginas incompletas por bucle de repeticion.

## Benchmarks y rendimiento

Resultados declarados por el autor en el Kurrent Pages Benchmark v1.0 (53 paginas reservadas, una ejecucion sellada el 2026-11-17, con vLLM 0.23.0, transformers 5.13.0 y una NVIDIA RTX PRO 6000):

| Motor | `cer_norm` mediano | Notas |
|---|---|---|
| Kurrent Transcriber 1B | 0.071 | Referencia de salida: Transkribus German Genius |
| Transkribus German Genius | 0.131 | Referencia comercial |
| LightOnOCR-HGH (padre) | 0.090 | Fine-tune de Bernhard Straub |
| Fine-tune propio de 13fragments | 0.112 | No publicado |
| Modelo frontera de proposito general A | 0.055 | Una ejecucion, una fecha |
| Modelo frontera de proposito general B | 0.070 | Una ejecucion, una fecha |

En recall de entidades (nombres, lugares, fechas), el modelo obtiene un mediano de 0,83 frente a 0,85 de German Genius y queda a la altura de LightOnOCR-HGH. Dos revisores automaticos no encontraron pasajes inventados en las 53 paginas. En tres conjuntos de prueba publicos de otros grupos, el modelo lee mejor que LightOnOCR-HGH en los tres. Una comprobacion de desarrollo con llama.cpp fallo su limite preestablecido y fue eximida.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 1.005 millones de parametros en bfloat16, el peso de los pesos ronda los 2 GB, mas el coste del codificador visual y de la cache KV para contexto de hasta 16.384 tokens.
- GPU de referencia del autor: NVIDIA RTX PRO 6000, con vLLM 0.23.0.
- GPU recomendadas: cualquier NVIDIA con soporte de vLLM y suficiente VRAM para el contexto configurado; el modelo es lo bastante pequeno para GPUs de consumo, aunque no se publican cifras de VRAM minima ni de latencia.
- Despliegue: vLLM con plugin de servidor para la penalizacion de repeticion ventaneada (`--logits-processors windowed_repetition_penalty:WindowedRepetitionPenalty`), `--max-model-len 16384`, `--dtype bfloat16` y `--limit-mm-per-prompt '{"image":1}'`. El cliente se instala desde `inference/`.
- llama.cpp: medido solo en paginas de desarrollo y con un limite fallido y eximido; no se garantizan los resultados reportados.
- Transformers por si solo: no medido.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | `cer_norm` mediano (Kurrent Pages) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kurrent Transcriber 1B | 1,0B | 16.384 tokens (vLLM) | 0.071 | CC BY-SA 4.0 | Pesos abiertos en Hugging Face |
| LightOnOCR-3-1B-Historic-German-Handwriting | 1,0B (aproximado, derivado de LightOnOCR-3-1B) | no disponible | 0.090 | no disponible en la informacion | Pesos abiertos en Hugging Face |
| LightOnOCR-3-1B (base) | 1,0B (aproximado) | no disponible | no evaluado en este benchmark | Apache-2.0 | Pesos abiertos en Hugging Face |
| Transkribus German Genius | no disponible | no disponible | 0.131 | Comercial | Servicio comercial |

## Limitaciones y advertencias

- La salida es un borrador: el autor exige revision humana linea a linea contra el escaneo antes de cualquier uso.
- Fuera de alcance: extraccion de nombres, fechas o lugares sin revision, y evidencia legal, genealogica o archivistica basada solo en la transcripcion.
- No apto para imagenes de linea: en un recorte de linea el modelo tambien escribe las lineas vecinas.
- Idiomas: casi todo el entrenamiento es aleman; no se soportan otras lenguas.
- El paso de imagen del cliente puede eliminar sellos de biblioteca escritos junto a cartas de color; es una puerta de desarrollo fallida y eximida.
- Los pesos solos no reproducen los resultados: se requiere el cliente de `inference/` con sus cuatro pasos fijos (paso de imagen, peticion, mapeo de salida y paso de salida).
- Otros runtimes dan salidas distintas; Transformers por si solo no se ha medido y llama.cpp solo se probo en paginas de desarrollo con un limite fallido.
- Riesgo de bucles de repeticion: una respuesta que alcanza los 4.096 tokens se marca como `incomplete: "repetition"` y se corta.
- Licencia CC BY-SA 4.0 en los pesos: impone compartir bajo la misma licencia las obras derivadas, lo que condiciona el uso comercial y la redistribucion.
- Sin datos publicados de sesgos mas alla del dominio acotado; el riesgo principal es la alucinacion de texto plausible en pasajes ilegibles, mitigada por la marca `[unleserlich]` pero no eliminada.
- El harness con las claves de motor de este modelo aun no forma parte de una release publicada del benchmark.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/13fragments/kurrent-transcriber-1b
- Modelo base LightOnOCR-3-1B: https://huggingface.co/lightonai/LightOnOCR-3-1B
- Fine-tune padre de Bernhard Straub: https://huggingface.co/b-straub/LightOnOCR-3-1B-Historic-German-Handwriting
- Kurrent Pages Benchmark (DOI): https://doi.org/10.5281/zenodo.24015417
- Paper referenciado en los tags: arxiv:2601.14251 (no verificado en la informacion disponible)

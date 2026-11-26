# H3-Tiny/MiniMax-H3-Tiny-17B-Pruned-FL2VA

## Resumen

MiniMax-H3-Tiny-17B-Pruned-FL2VA es una version podada mediante *structured pruning* del transformer de MiniMax-H3, el modelo de generacion conjunta de video y audio de MiniMax. Lo desarrolla el proyecto independiente H3-Tiny (Haoshuai Fu), no afiliado a MiniMax, y se publica como *fine-tune* derivado del checkpoint oficial `MiniMaxAI/MiniMax-H3`. El checkpoint conserva 17.067.115.600 parametros (17,07 mil millones) frente a los 33,12 mil millones del transformer original, tras eliminar 8 de sus 50 bloques y reducir el rango de AdaLN a 8. Es relevante porque permite ejecutar generacion video+audio de la familia H3 con aproximadamente la mitad de parametros del transformer, manteniendo el mismo pipeline de difusion y los mismos flujos de trabajo.

El modelo cubre dos flujos concretos: FL2VA (primer y ultimo fotograma a video con audio) y T2VA (texto a video con audio). No incluye el text encoder, los VAE ni los procesadores, que deben tomarse del checkpoint oficial de MiniMax-H3 en formato diffusers. La poda se realizo sin reentrenamiento: es puramente estructural y calibrada sobre muestras de FL2VA y T2VA. La profundidad eliminada es identica a la del checkpoint hermano Ref2VA: los bloques `[6, 7, 8, 9, 10, 11, 13, 15]`.

La relevancia practica esta en el coste de despliegue: el repositorio ocupa 34,2 GB en safetensors y el transformer podado reduce el peso y la VRAM necesarios frente al modelo base, lo que facilita su uso en entornos con GPUs de gama alta para consumidores o estaciones de trabajo. La licencia es la MiniMax H3 Community License, con ambito territorial y politica de uso aceptable propios, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion para generacion conjunta de video y audio (MiniMax-H3), con AdaLN; poda estructural de 8 de 50 bloques y AdaLN de rango 8 |
| Parametros totales | 17.067.115.600 (17,07B, solo transformer) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; existe version single-file para ComfyUI en repositorio aparte) |
| Idiomas soportados | No disponible |
| Licencia | MiniMax H3 Community License (`minimax-h3-community-license`) |
| Formato de pesos | safetensors (layout diffusers: `config.json` + safetensors fragmentados) |

## Arquitectura y entrenamiento

El modelo es un transformer de difusion derivado de MiniMax-H3, que emplea dos transformers con la misma arquitectura: uno para Ref2VA y otro compartido por T2VA y FL2VA. Este checkpoint procede de este ultimo y aplica la misma receta de poda que el modelo hermano Ref2VA: busqueda de profundidad que elimina los bloques `[6, 7, 8, 9, 10, 11, 13, 15]` y reduccion del rango de AdaLN a 8, con calibracion sobre muestras de FL2VA y T2VA.

La operacion es exclusivamente de poda estructural: la model card indica explicitamente "No training". No hay, por tanto, destilacion, RLHF ni ajuste fino posterior; los pesos restantes son los del modelo base. El muestreo recomendado es de 50 pasos. El repositorio contiene unicamente el transformer; el text encoder, los VAE y los procesadores se cargan desde el checkpoint oficial de MiniMax-H3 en formato diffusers.

## Capacidades

- Generacion de video a partir de texto con audio sincronizado (flujo T2VA).
- Generacion de video a partir de primer y ultimo fotograma con audio (flujo FL2VA), con referencia explicita a las imagenes en el prompt y marcas temporales.
- Generacion conjunta de video y audio en una sola pasada del pipeline.
- Control de duracion mediante el numero de fotogramas (por ejemplo, 124 fotogramas en los ejemplos de la model card).
- Integracion con diffusers mediante `h3tiny.pipeline.load_pipeline` y con ComfyUI a traves del checkpoint single-file del repositorio `MiniMax-H3-Tiny-ComfyUI`.
- Soporte de *offloading* y seleccion de backend de atencion segun la documentacion del repositorio GitHub.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni vision general; el modelo es especifico de generacion video+audio.

## Casos de uso

- Prototipado de video generativo en estaciones de trabajo: el transformer podado reduce el peso del repositorio a 34,2 GB, lo que permite iterar sobre prompts T2VA en una sola GPU de gama alta para consumidores con *offloading*.
- Interpolacion de fotogramas clave en produccion audiovisual: el flujo FL2VA toma un primer y un ultimo fotograma y genera la secuencia intermedia con audio, util para *storyboards* animados y prevision de planos.
- Generacion de clips con audio integrado para redes sociales: T2VA produce video y audio en una sola pasada, evitando pipelines separados de video y de sintesis de audio.
- Pruebas de concepto de doblaje y ambiente sonoro: al generar audio junto al video, sirve para validar escenas antes de producir el audio final con herramientas dedicadas.
- Evaluacion de investigacion sobre poda de modelos de difusion: al ser una poda sin reentrenamiento con receta documentada, permite comparar calidad frente al modelo base de 33,12B y estudiar el impacto de eliminar bloques concretos.
- Despliegue en ComfyUI para artistas tecnicos: el checkpoint single-file del repositorio ComfyUI facilita flujos de trabajo visuales sin escribir codigo.
- Generacion de variaciones a partir de fotogramas de referencia en preproduccion: FL2VA permite fijar el inicio y el final de un plano y explorar el movimiento intermedio con audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el transformer tiene 17,07B parametros y el repositorio pesa 34,2 GB en safetensors, por lo que en precision de entrenamiento no cabe en GPUs de consumo sin *offloading* ni cuantizacion.
- El repositorio documenta soporte de *offloading* y de distintos backends de atencion, lo que permite repartir el modelo entre VRAM y memoria del sistema.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, el modelo requiere GPUs de centro de datos (A100, H100) o estaciones de trabajo con gran VRAM, y en GPUs de consumo (RTX 4090) solo seria viable con *offloading* agresivo o cuantizacion, sin datos publicados de rendimiento.
- Opciones de despliegue: diffusers (layout nativo del checkpoint), el paquete `h3tiny` del repositorio GitHub, ComfyUI mediante el checkpoint single-file, y los scripts `scripts/infer.py` del proyecto.
- Latencia y throughput: no disponibles; el muestreo recomendado es de 50 pasos, lo que condiciona el tiempo de generacion por clip.

## Comparativa con modelos similares

| Modelo | Parametros (transformer) | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-Tiny-17B-Pruned-FL2VA | 17,07B | No disponible | Sin benchmarks publicados | MiniMax H3 Community License | Hugging Face (H3-Tiny) |
| MiniMax-H3 (base) | 33,12B | No disponible | Sin datos en la informacion disponible | MiniMax H3 Community License | Hugging Face (MiniMaxAI) |
| MiniMax-H3-Tiny-17B-Pruned-Ref2VA | 17,07B | No disponible | Sin benchmarks publicados | MiniMax H3 Community License | Hugging Face (H3-Tiny) |

La comparativa se limita a la familia H3 porque la informacion disponible no incluye otros modelos de generacion video+audio. El checkpoint Ref2VA cubre el flujo de referencia a video+audio, mientras que este cubre FL2VA y T2VA; ambos comparten receta de poda y bloques eliminados.

## Limitaciones y advertencias

- La poda se realizo sin reentrenamiento, por lo que la calidad puede degradarse respecto al transformer original de 33,12B; no hay benchmarks publicados que cuantifiquen esa perdida.
- El repositorio contiene solo el transformer: es obligatorio descargar el checkpoint oficial de MiniMax-H3 en diffusers para el text encoder, los VAE y los procesadores.
- El modelo solo cubre los flujos FL2VA y T2VA; no cubre Ref2VA, que tiene su propio checkpoint podado.
- No hay informacion sobre idiomas soportados, sesgos conocidos ni tasas de alucinacion; al ser un modelo de generacion audiovisual, el riesgo principal es la fidelidad del contenido generado respecto al prompt, no verificable con los datos disponibles.
- La licencia MiniMax H3 Community License impone ambito territorial y politica de uso aceptable; es necesario revisar `LICENSE-MiniMax-H3` y `NOTICE` antes de cualquier uso comercial.
- El proyecto H3-Tiny es independiente y no esta respaldado por MiniMax; el soporte se canaliza via GitHub issues y el correo del autor.
- El muestreo recomendado de 50 pasos implica coste computacional alto por clip; no hay datos de latencia publicados.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; no debe evaluarse como modelo de lenguaje general.

## Enlaces

- Hugging Face: https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-17B-Pruned-FL2VA
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Checkpoint hermano Ref2VA: https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-17B-Pruned-Ref2VA
- Version single-file para ComfyUI: https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-ComfyUI
- Repositorio GitHub: https://github.com/fuyi25/MiniMax-H3-Tiny
- Pagina del proyecto: https://fuyi25.github.io/MiniMax-H3-Tiny/
- Coleccion H3-Tiny: https://huggingface.co/collections/H3-Tiny/h3-tiny-v01-6afeea67147c27cf3b80820a
- Licencia: https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-17B-Pruned-FL2VA/blob/main/LICENSE-MiniMax-H3

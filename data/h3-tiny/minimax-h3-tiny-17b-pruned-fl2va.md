# H3-Tiny/MiniMax-H3-Tiny-17B-Pruned-FL2VA

## Resumen

MiniMax-H3-Tiny-17B-Pruned-FL2VA es un checkpoint derivado de MiniMax-H3, el modelo de generacion conjunta de video y audio de MiniMax. Lo publica H3-Tiny, un proyecto independiente no afiliado a MiniMax, y consiste en una version podada estructuralmente del transformer de 33,12B parametros que MiniMax-H3 emplea para las tareas FL2VA (primer y ultimo fotograma a video con audio) y T2VA (texto a video con audio). El resultado es un transformer de 17,07B parametros, es decir, aproximadamente la mitad del original, obtenido sin ningun tipo de reentrenamiento.

La relevancia del modelo esta en que reduce de forma drastica el coste de inferencia de un generador video-audio de gran escala manteniendo el resto del pipeline intacto: el text encoder, los VAE y los procesadores se toman del checkpoint oficial de MiniMax-H3 en formato diffusers. Esto permite ejecutar tareas de generacion condicionada por primer y ultimo fotograma con un presupuesto de memoria sensiblemente menor que el modelo base.

Se distribuye en formato diffusers (config.json mas safetensors fragmentados), con un repositorio de 34,2 GB, y esta pensado para integrarse en flujos de trabajo de video generativo que necesiten control temporal fuerte mediante fotogramas de anclaje, asi como en generacion puramente textual de video con audio sincronizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion para generacion conjunta de video y audio (MiniMax-H3), con poda estructural de profundidad y de AdaLN |
| Parametros totales | 17.067.115.600 (transformer); el modelo base completo es de 33,12B |
| Parametros activos | no disponible (no es un MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License Agreement (license: other) |
| Formato de pesos | safetensors en layout diffusers (config.json + shards) |

## Arquitectura y entrenamiento

El modelo es un transformer de difusion que genera video y audio de forma conjunta. MiniMax-H3 distribuye dos transformers con la misma arquitectura: uno dedicado a Ref2VA y otro compartido por T2VA y FL2VA. Este checkpoint se obtiene podando el segundo de ellos: se eliminan 8 de sus 50 bloques de transformer (concretamente los indices [6, 7, 8, 9, 10, 11, 13, 15]) y se reduce el rango de AdaLN a 8, pasando de 33,12B a 17,07B parametros.

La receta de poda es estructural y calibrada sobre muestras de FL2VA y T2VA, y la busqueda de profundidad elimina exactamente los mismos bloques en ambos transformers de MiniMax-H3. El autor indica explicitamente que no hubo entrenamiento: el checkpoint es el resultado directo de la poda, sin destilacion ni fine-tuning posterior. El muestreo recomendado es de 50 pasos. El repositorio contiene unicamente el transformer; el text encoder, los VAE y los procesadores proceden del checkpoint oficial MiniMax-H3 en formato diffusers.

## Capacidades

- Generacion de video condicionada por primer y ultimo fotograma (FL2VA), con control explicito del contenido en los extremos temporales de la secuencia.
- Generacion de video a partir de texto (T2VA) con audio generado de forma conjunta.
- Generacion conjunta de video y audio sincronizados en un mismo proceso de difusion.
- Referencia explicita a imagenes dentro del prompt mediante marcadores de tipo `<Picture 1>` y `<Picture 2>` con marcas temporales en segundos.
- Descripcion multimodal integrada (`integrated_multimodal_description`) para especificar contenido visual y sonoro en un unico prompt.
- Generacion de secuencias de 124 fotogramas en los ejemplos de uso documentados.
- Integracion con ComfyUI mediante pesos publicados aparte.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni otros idiomas.

## Casos de uso

- Interpolacion controlada entre fotogramas clave: dado un primer y un ultimo fotograma, el modelo genera la secuencia intermedia con audio, lo que resulta adecuado para producir transiciones coherentes entre dos estados visuales definidos por el usuario.
- Generacion de clips con audio sincronizado a partir de texto: el workflow T2VA permite crear escenas audiovisuales completas desde una descripcion, util para prototipado rapido de contenido audiovisual.
- Previsualizacion de storyboards: usar FL2VA para convertir los fotogramas de apertura y cierre de un plano en un clip animado, acelerando la iteracion sobre guiones graficos.
- Produccion de material para video musical o contenido corto: la generacion conjunta de audio y video evita la necesidad de alinear por separado una pista de sonido con la imagen.
- Animacion de ilustraciones o fotografias: partiendo de una imagen inicial y una final, generar movimiento intermedio para dar vida a material estatico.
- Despliegue en entornos con VRAM limitada: al reducir el transformer de 33,12B a 17,07B parametros, el modelo permite ejecutar un generador video-audio de gran escala en hardware donde el checkpoint original no cabria, manteniendo el resto del pipeline oficial.
- Integracion en ComfyUI: los pesos publicados en el repositorio ComfyUI permiten incorporar el modelo en grafos de nodos para flujos de trabajo de generacion visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El transformer podado tiene 17,07B parametros; en precision de 16 bits los pesos ocupan aproximadamente 34 GB, a lo que hay que sumar text encoder, VAE y procesadores del checkpoint base. El repositorio completo ocupa 34,2 GB.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano de pesos, un transformer de 17B en FP16 requiere GPUs de 40 GB o mas (A100 40GB, A100 80GB, H100) para caber comodamente junto al resto del pipeline.
- Cabe en GPU consumer: no disponible de forma confirmada. En consumer GPU de 24 GB (RTX 3090, RTX 4090) seria necesario aplicar offloading o cuantizacion, opciones que la model card menciona pero no detalla.
- Opciones de despliegue: pipeline propio del proyecto (`h3tiny.pipeline.load_pipeline`) sobre CUDA, con soporte de offloading y backends de atencion configurables segun el README de GitHub; pesos adicionales para ComfyUI.
- Latencia y throughput estimados: no disponible. El muestreo recomendado es de 50 pasos.

## Comparativa con modelos similares

| Modelo | Parametros (transformer) | Contexto / workflow | Licencia | Disponibilidad |
|---|---|---|---|---|
| MiniMax-H3-Tiny-17B-Pruned-FL2VA | 17,07B | FL2VA y T2VA | MiniMax H3 Community License | Hugging Face, diffusers |
| MiniMax-H3 (base) | 33,12B | Ref2VA, T2VA, FL2VA | MiniMax H3 Community License | Hugging Face, diffusers |
| MiniMax-H3-Tiny-17B-Pruned-Ref2VA | 17,07B (misma receta) | Ref2VA | MiniMax H3 Community License | Hugging Face, diffusers |

No se dispone de datos de rendimiento comparativo entre estos checkpoints ni con modelos de otras familias, por lo que la comparativa se limita a parametros, workflow y licencia.

## Limitaciones y advertencias

- El checkpoint es unicamente el transformer: requiere el text encoder, los VAE y los procesadores del checkpoint oficial MiniMax-H3 para funcionar.
- La poda se aplico sin entrenamiento posterior, por lo que la calidad respecto al modelo base de 33,12B no esta documentada con metricas en la informacion disponible.
- La licencia MiniMax H3 Community License impone un ambito territorial y una politica de uso aceptable; es necesario revisar el acuerdo antes de cualquier uso comercial.
- H3-Tiny es un proyecto independiente y no esta afiliado ni respaldado por MiniMax.
- No se documentan idiomas soportados, sesgos conocidos ni riesgos de alucinacion especificos del modelo.
- No se detallan opciones de cuantizacion ni requisitos minimos de VRAM, lo que dificulta planificar el despliegue sin pruebas previas.
- El modelo esta orientado a generacion de video y audio; no se documentan capacidades de texto, codigo, matematicas ni tool calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-17B-Pruned-FL2VA
- Checkpoint hermano (Ref2VA): https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-17B-Pruned-Ref2VA
- Pesos para ComfyUI: https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-ComfyUI
- Repositorio GitHub del proyecto: https://github.com/fuyi25/MiniMax-H3-Tiny
- Pagina del proyecto: https://fuyi25.github.io/MiniMax-H3-Tiny/
- Coleccion H3-Tiny en Hugging Face: https://huggingface.co/collections/H3-Tiny/h3-tiny-v01-6afeea67147c27cf3b80820a
- Licencia: https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-17B-Pruned-FL2VA/blob/main/LICENSE-MiniMax-H3
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3

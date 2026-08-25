# chinmankokumin/SmoothMixWan2.2I2Vw4a8

## Resumen

SmoothMixWan2.2I2Vw4a8 es una cuantizacion W4A8 (pesos de 4 bits, activaciones de 8 bits) del checkpoint Smooth Mix Wan 2.2 14B I2V, un modelo de generacion de video basado en Wan 2.2 de Alibaba. El autor, chinmankokumin, ha aplicado el toolkit de cuantizacion de ComfyUI (ComfyUI-QuantizationToolkit) para reducir el peso del modelo original de 14B a un tamaño de repositorio de 20 GB, lo que facilita su ejecucion en hardware con menos memoria. El modelo esta disenado para la tarea image-to-video (I2V), aunque el checkpoint base tambien soporta text-to-video (T2V) segun las referencias de Civitai.

La relevancia de este modelo radica en que permite ejecutar un generador de video de alta calidad (Wan 2.2 14B) en GPUs de consumo con requisitos de VRAM reducidos gracias a la cuantizacion W4A8, manteniendo una fidelidad visual aceptable. Es una opcion practica para desarrolladores que trabajan con ComfyUI y necesitan un checkpoint de video ligero sin sacrificar demasiada calidad. La licencia no esta especificada en la informacion disponible, por lo que se debe consultar la fuente original antes de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wan 2.2 14B (Diffusion Transformer para video, I2V) |
| Parametros totales | 14 mil millones (antes de cuantizacion) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (Wan 2.2 soporta video de hasta 5 segundos a 24 fps, pero no se confirma en esta variante) |
| Tipos de cuantizacion | W4A8 (pesos 4 bits, activaciones 8 bits) |
| Idiomas soportados | no disponible (el checkpoint base de Wan 2.2 soporta ingles y chino, pero no se especifica aqui) |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente safetensors, pero no se indica) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del checkpoint Smooth Mix Wan 2.2 14B I2V, que a su vez es un fine-tune de Wan 2.2, un modelo de difusion para generacion de video desarrollado por Alibaba. La arquitectura subyacente es un Diffusion Transformer (DiT) con 14 mil millones de parametros, disenado para transformar una imagen de entrada y un prompt de texto en una secuencia de video. La cuantizacion W4A8 se aplico mediante ComfyUI-QuantizationToolkit, que reduce la precision de los pesos a 4 bits y las activaciones a 8 bits, disminuyendo el uso de memoria y acelerando la inferencia en hardware compatible.

No se dispone de informacion sobre el proceso de entrenamiento del checkpoint original (datos, numero de tokens, tecnicas de alineacion como RLHF o DPO). La cuantizacion en si no implica entrenamiento adicional, sino una conversion post-entrenamiento. El modelo incluye el text encoder umt5-xxl en FP16, segun la model card, lo que sugiere que el pipeline completo requiere ese componente para codificar los prompts.

## Capacidades

- Generacion de video a partir de una imagen de entrada (I2V) y un prompt de texto.
- Generacion de video a partir de texto (T2V) si se usa el checkpoint base Smooth Mix Wan 2.2, aunque esta variante especifica esta enfocada en I2V.
- Soporte de estilos diferenciados mediante prompts especiales como "smoothmixanime" y "smoothmixrealism" (segun las notas de version del checkpoint original).
- Integracion con ComfyUI, permitiendo su uso en flujos de trabajo visuales.
- Cuantizacion W4A8 que reduce los requisitos de VRAM en comparacion con el modelo FP16.

## Casos de uso

- Creacion de animaciones cortas para redes sociales: el modelo puede generar clips de 2-5 segundos a partir de una imagen fija, ideal para contenido promocional o memes animados. Su cuantizacion permite ejecutarlo en una RTX 4090 con 24 GB de VRAM sin problemas.
- Prototipado rapido de escenas para produccion audiovisual: los directores pueden previsualizar movimientos de camara o transiciones usando una imagen de referencia y un prompt, reduciendo costes de produccion.
- Generacion de video educativo: a partir de diagramas o ilustraciones, el modelo puede crear explicaciones animadas para cursos online, con la ventaja de que el checkpoint cuantizado es mas facil de desplegar en entornos con GPUs limitadas.
- Desarrollo de personajes para videojuegos: los artistas pueden generar ciclos de animacion (caminar, saltar) desde una unica imagen de personaje, acelerando el pipeline de asset creation.
- Automatizacion de contenido para marketing: se pueden producir variaciones de video de producto a partir de fotos, con prompts que controlan el movimiento y el estilo, gracias a la capacidad de ajuste fino del checkpoint original.
- Investigacion en generacion de video: al ser una cuantizacion, permite estudiar el impacto de la reduccion de precision en la calidad de salida, comparando con el modelo FP16 en entornos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de metricas como FVD (Fréchet Video Distance), CLIP score o comparaciones con otros modelos de video. Se recomienda realizar evaluaciones propias si se necesita una comparacion cuantitativa.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 20 GB, pero la VRAM necesaria para inferencia depende del tamano del modelo cuantizado y del text encoder. Con cuantizacion W4A8, se estima que el modelo principal requiere entre 8 y 12 GB de VRAM, mas el text encoder umt5-xxl en FP16 (aproximadamente 5 GB adicionales). En total, se recomienda al menos 16 GB de VRAM.
- GPUs recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), A100 (40 GB) o superiores. En GPUs con 12 GB (RTX 3060, 4070) podria funcionar con configuraciones de memoria reducida, pero no esta garantizado.
- Despliegue: compatible con ComfyUI, que es el entorno principal. Tambien podria usarse con otros frameworks que soporten cuantizacion W4A8, como vLLM o llama.cpp, aunque no se ha confirmado.
- Latencia y throughput: no disponibles. La generacion de video es computacionalmente intensiva; con una RTX 4090 se esperan tiempos de minutos por clip, pero no hay datos concretos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmoothMixWan2.2I2Vw4a8 (este) | 14B (W4A8) | no disponible | W4A8 | no disponible | HuggingFace |
| Smooth Mix Wan 2.2 14B I2V (original) | 14B | no disponible | FP16 | no disponible | Civitai |
| Wan 2.2 14B (base de Alibaba) | 14B | 5s video | FP16 | Apache 2.0 (segun publicaciones) | HuggingFace |

La comparativa se limita a las variantes de Wan 2.2. Este modelo se diferencia por su cuantizacion, que reduce el tamano de 20 GB (FP16) a un repositorio de 20 GB (W4A8, aunque el peso real es menor). No hay datos de rendimiento para comparar calidad. Alternativas como CogVideoX o Mochi 1 no se han incluido por falta de informacion comparable.

## Limitaciones y advertencias

- El tag "not-for-all-audiences" indica que el modelo puede generar contenido inapropiado o sensible; se recomienda moderacion en entornos publicos.
- La licencia no esta especificada, lo que impide conocer las restricciones de uso comercial. Se debe contactar al autor o consultar la fuente original en Civitai antes de usarlo en produccion.
- No hay informacion sobre sesgos o alucinaciones especificas, pero como modelo de video, puede producir artefactos visuales o movimientos poco realistas en escenas complejas.
- La cuantizacion W4A8 puede degradar la calidad en comparacion con FP16, especialmente en detalles finos o texturas.
- El modelo esta disenado para I2V; si se necesita T2V, habria que usar el checkpoint base Smooth Mix Wan 2.2 T2V, no esta variante.
- No se han publicado benchmarks, por lo que el rendimiento real en tareas especificas es desconocido.

## Enlaces

- HuggingFace: https://huggingface.co/chinmankokumin/SmoothMixWan2.2I2Vw4a8
- Civitai (checkpoint original): https://civitai.red/models/1995784/smooth-mix-wan-22-14b-i2vt2v
- RunningHub (referencia): https://www.runninghub.ai/model/public/1974384335828684802
- ComfyUI-QuantizationToolkit: https://github.com/SparknightLLC/ComfyUI-QuantizationToolkit
- Text encoder umt5-xxl: https://huggingface.co/Comfy-Org/Wan_2.2_ComfyUI_Repackaged/blob/main/split_files/text_encoders/umt5_xxl_fp16.safetensors

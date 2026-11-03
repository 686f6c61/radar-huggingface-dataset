# FastVideo/Pika-H3-Flex-NVFP4-QAD

## Resumen

Pika-H3-Flex-NVFP4-QAD es una version cuantizada a NVFP4 de Pika H3 Flex, un modelo de generacion de video con audio sincronizado desarrollado por Pika Labs sobre la base de MiniMax H3. FastVideo, el proyecto de la Universidad de California en Berkeley (hao-ai-lab), es el autor de esta variante, que aplica cuantizacion de 4 bits junto con destilacion consciente de cuantizacion (QAD) para acercar la salida del modelo cuantizado a la del modelo original en BF16. El modelo resuelve el problema del coste computacional y de memoria de la generacion de video de alta calidad, permitiendo su ejecucion en GPUs NVIDIA Blackwell con un consumo de VRAM notablemente inferior.

El modelo conserva las capacidades multimodales del original: genera video con audio sincronizado a partir de texto (T2VA), a partir de un primer fotograma, un ultimo fotograma o ambos (I2VA, L2VA, FL2VA), y a partir de referencias mixtas de imagen, video y audio (Ref2VA), admitiendo hasta 9 imagenes, 3 videos y 3 clips de audio como referencias. Incluye dos transformadores: uno para tareas de keyframe y otro condicionado por referencias, ambos con los adaptadores Flex de Pika ya fusionados en los pesos.

La relevancia actual del modelo radica en que demuestra un flujo completo de cuantizacion y destilacion aplicado a un modelo de difusion de video, con la receta de entrenamiento publicada en abierto. Segun la model card, QAD acerca el modelo un 14-17% al profesor BF16 en entradas no vistas, en comparacion con la cuantizacion post-entrenamiento convencional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) derivado de MiniMax H3, con VAE de video y VAE de audio, codificador de texto Qwen3-VL |
| Parametros totales | 13.855.408.896 (13,86 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (pesos y activaciones de 4 bits); el modelo base esta en BF16 |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License Agreement (license: other) |
| Formato de pesos | safetensors (checkpoints NVFP4 empaquetados), libreria diffusers |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de difusion de MiniMax H3: un transformer de difusion (DiT) que opera sobre latentes de video y audio generados por sendos VAE, con un codificador de texto y vision Qwen3-VL (licenciado bajo Apache 2.0). Pika H3 Flex anade adaptadores sobre el transformer base de MiniMax H3; en esta variante, cada adaptador Pika se fusiona en el transformer correspondiente a plena precision antes de cuantizar, de modo que la cuantizacion parte de los pesos Flex exactos. El repositorio contiene dos transformadores NVFP4: `transformer/` para T2VA, I2VA, L2VA y FL2VA, y `transformer_ref/` para Ref2VA.

El proceso de cuantizacion consta de tres etapas documentadas en la receta de entrenamiento abierta: fusion de adaptadores, calibracion de escalas de activacion estaticas para las capas feed-forward sobre las propias trayectorias de muestreo de Flex (con un recorte elegido para equilibrar fidelidad de video y audio) y destilacion consciente de cuantizacion. En esta ultima, el estudiante NVFP4 ejecuta los pesos y activaciones de 4 bits desplegados y se entrena contra el modelo Flex BF16 congelado a lo largo de su trayectoria de muestreo de seis pasos, actualizando unicamente las capas lineales cuantizadas. Existe una variante alternativa, Pika-H3-Flex-NVFP4-FP4Attn-QAD, que cuantiza tambien las matrices Q/K de atencion a NVFP4 para clips largos mas rapidos; el modelo de esta ficha mantiene la atencion en BF16 para maximizar la fidelidad respecto al original.

## Capacidades

- Generacion de video con audio sincronizado a partir de un prompt de texto (T2VA).
- Generacion condicionada por primer fotograma, ultimo fotograma o ambos (I2VA, L2VA, FL2VA).
- Generacion condicionada por referencias multimodales (Ref2VA): hasta 9 imagenes, 3 videos y 3 clips de audio combinados con el prompt.
- Control de resolucion (por ejemplo, 768p) y duracion del clip mediante parametros de inferencia.
- Codificacion de texto y vision mediante Qwen3-VL, lo que habilita la comprension de las imagenes y videos de referencia.
- Generacion de audio asociada al video mediante un VAE de audio dedicado.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico; el modelo es generativo audiovisual, no un LLM conversacional.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Prototipado rapido de anuncios audiovisuales: a partir de un prompt y un primer fotograma de producto, el modelo genera un clip corto con audio sincronizado en una sola pasada, lo que permite iterar conceptos creativos sin rodaje.
- Generacion de video para redes sociales en produccion: con resolucion 768p y duraciones de pocos segundos, encaja en pipelines automatizados de creacion de contenido vertical u horizontal a partir de plantillas de texto.
- Postproduccion con control de keyframes: las tareas I2VA, L2VA y FL2VA permiten fijar el fotograma inicial y final de un plano, util para insertar transiciones generadas entre tomas reales existentes.
- Creacion de personajes consistentes con Ref2VA: usando hasta 9 imagenes de referencia de un personaje y clips de audio de su voz, se pueden generar nuevas escenas manteniendo identidad visual y timbre.
- Doblaje y localizacion audiovisual: la combinacion de referencias de video y audio permite regenerar escenas con una nueva pista de audio sincronizada, util en flujos de localizacion de contenido.
- Generacion de material de previsualizacion (previs) en cine y animacion: los equipos de direccion pueden convertir guiones y storyboards en clips animados con audio provisional antes de la produccion final.
- Investigacion en modelos generativos de video: al ser una variante cuantizada con receta de entrenamiento abierta, sirve como referencia reproducible para estudiar el impacto de NVFP4 y QAD en la calidad de difusion de video.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos (como FVD, CLIP score o metricas de sincronizacion audio-video) en la informacion disponible. La model card unicamente reporta que la destilacion consciente de cuantizacion acerca el modelo un 14-17% al profesor BF16 en entradas no vistas, en comparacion con la cuantizacion post-entrenamiento aislada, para ambos adaptadores.

## Requisitos de hardware

- GPU obligatoria: NVIDIA Blackwell (los kernels NVFP4 no funcionan en otras arquitecturas); en GPUs no Blackwell debe usarse el modelo base Pika H3 Flex en BF16.
- VRAM estimada: no disponible de forma explicita; el repositorio ocupa 106 GB e incluye dos transformadores, codificador de texto, VAE de video y audio y decodificador NVFP4, por lo que el despliegue completo requiere hardware de clase数据中心 con suficiente memoria, aunque la ejecucion en 4 bits reduce sustancialmente el requisito frente a BF16.
- GPUs recomendadas: familia Blackwell (por ejemplo, B200 o RTX 50) segun la model card; no se detallan modelos concretos.
- Viabilidad en GPU de consumo: no confirmada en la informacion disponible; depende de la variante Blackwell concreta y de la memoria disponible.
- Opciones de despliegue: FastVideo con FlashAttention-4 (`FASTVIDEO_ATTENTION_BACKEND=FLASH_ATTN FASTVIDEO_FA4=1`), cargando los checkpoints NVFP4 empaquetados directamente sin conversion; el decodificador NVFP4 se pasa como ruta separada.
- Latencia y throughput: no disponibles; la model card solo indica que la variante FP4Attn es mas rapida en clips largos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Atencion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Pika-H3-Flex-NVFP4-QAD (esta ficha) | 13,86 mil millones | no disponible | NVFP4 | BF16 | MiniMax H3 Community License | HuggingFace (FastVideo) |
| Pika-H3-Flex-NVFP4-FP4Attn-QAD | no disponible | no disponible | NVFP4 | NVFP4 Q/K | MiniMax H3 Community License | HuggingFace (FastVideo) |
| Pika H3 Flex (base) | no disponible | no disponible | BF16 | BF16 | MiniMax H3 Community License | HuggingFace (Pika-Labs) |
| MiniMax H3 | no disponible | no disponible | BF16 | BF16 | MiniMax H3 Community License | HuggingFace (MiniMaxAI) |

La comparativa se limita a la familia de modelos de la que deriva esta variante, ya que no se dispone de datos de benchmarks ni de especificaciones completas de alternativas de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- Requiere GPU NVIDIA Blackwell; en cualquier otra GPU el modelo no es ejecutable y debe recurrirse a la version BF16.
- La salida cuantizada puede diferir de la salida BF16 del modelo original, segun advierte la propia model card.
- Riesgo de alucinacion visual y de artefactos en la generacion de video y audio, inherente a los modelos de difusion; no se documentan evaluaciones de sesgo.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Idiomas soportados: no disponibles; no se puede confirmar el rendimiento multilingue del codificador Qwen3-VL en este contexto.
- Restricciones de licencia: se distribuye bajo la MiniMax H3 Community License Agreement, no bajo una licencia permisiva; es imprescindible revisar `LICENSE`, `NOTICE`, `THIRD_PARTY_NOTICES.md` y `licenses/` antes de cualquier uso comercial. El codificador Qwen3-VL se rige por Apache 2.0.
- El modelo es un derivado de MiniMax H3 y Pika H3 Flex, por lo que hereda las obligaciones y restricciones de ambas licencias.
- El repositorio es muy voluminoso (106 GB) e incluye dos transformadores y componentes auxiliares, lo que complica el despliegue en entornos con almacenamiento limitado.
- No se documentan garantias de calidad para duraciones o resoluciones distintas de las cubiertas en la guia de inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FastVideo/Pika-H3-Flex-NVFP4-QAD
- Modelo base Pika H3 Flex: https://huggingface.co/Pika-Labs/Pika-H3-Flex
- Modelo original MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Variante FP4-attention: https://huggingface.co/FastVideo/Pika-H3-Flex-NVFP4-FP4Attn-QAD
- Repositorio FastVideo: https://github.com/hao-ai-lab/FastVideo
- Guia de inferencia: https://github.com/hao-ai-lab/FastVideo/blob/main/docs/inference/pika_h3_flex.md
- Receta de entrenamiento QAD: https://github.com/hao-ai-lab/FastVideo/blob/main/docs/training/pika_h3_flex_qad.md

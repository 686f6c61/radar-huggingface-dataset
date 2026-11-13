# moonbox-dev/HeartMuLa-oss-3B-MLX

## Resumen

HeartMuLa-oss-3B-MLX es la conversión al framework MLX de Apple del modelo HeartMuLa-oss-3B, un modelo de lenguaje de 3B parámetros especializado en generación de música a partir de letras y etiquetas de estilo. Lo publica moonbox-dev, el equipo de Moonbox, y está pensado para ejecutarse en Macs con Apple Silicon. El pipeline completo combina el modelo de lenguaje (que predice tokens de audio) con el códec de audio HeartCodec, que convierte esos tokens en forma de onda.

El modelo resuelve el problema de la generación de canciones condicionada por texto (letra más tags de estilo) en hardware de consumo Apple, sin necesidad de GPUs NVIDIA. La conversión ofrece cuatro precisiones (bf16, 8bit, 6bit y 4bit) con métricas de fidelidad respecto al modelo PyTorch original, lo que permite elegir el equilibrio entre calidad y huella de memoria.

Es relevante porque demuestra que la generación musical open source puede ejecutarse localmente en un Mac, con licencia Apache 2.0 y pesos en safetensors cuantizados. La arquitectura concreta del backbone no se detalla en la información disponible; solo se indica que incluye un LM con cabeceras por codebook y un decodificador HeartCodec.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje (backbone, decodificador de profundidad y cabeceras por codebook) más códec de audio HeartCodec; detalles internos no disponibles |
| Parámetros totales | 3B (según el nombre del modelo base) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16, 8bit, 6bit, 4bit (cuantización afín MLX, grupo 64) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), más `gen_config.json`, `quant.json` y `tokenizer.json` |

## Arquitectura y entrenamiento

La información disponible describe el modelo como un LM de 3B parámetros para música que transforma letras y etiquetas de estilo en una canción, usando el códec HeartCodec para la parte de audio. El repositorio MLX incluye el backbone del LM, un decodificador de profundidad y cabeceras por codebook, además del decodificador de HeartCodec. No se detallan el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

La innovación técnica destacable de esta publicación es la conversión a MLX con cuantización afín de grupo 64 y la validación numérica frente al modelo PyTorch original: se reportan divergencias KL y acuerdos top-1 por precisión. Los datos de entrenamiento del modelo base no están disponibles en la información proporcionada.

## Capacidades

- Generación de música y canciones a partir de letras y etiquetas de estilo (text-to-music / song generation).
- Producción de audio mediante el códec HeartCodec a partir de los tokens predichos por el LM.
- Control de estilo mediante tags descriptivos.
- Ejecución nativa en Apple Silicon a través de MLX.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (visión, audio de entrada, thinking mode): no disponible.

## Casos de uso

- Prototipado musical local en Mac: un compositor puede generar borradores de canciones a partir de una letra y unos tags de estilo directamente en su portátil con Apple Silicon, sin depender de servicios en la nube.
- Bandas sonoras para vídeo y juegos indie: generar piezas musicales ajustando los tags de estilo para cada escena, con la ventaja de que la licencia Apache 2.0 permite uso comercial.
- Investigación en generación musical: usar las cuatro precisiones publicadas para estudiar el impacto de la cuantización en la calidad del audio generado, apoyándose en las métricas KL y de acuerdo top-1 ya reportadas.
- Herramientas creativas para músicos aficionados: integrar el modelo en una app de escritorio para Mac que convierta una letra escrita en una maqueta cantada.
- Generación de jingles y música de fondo: producir piezas cortas por encargo con estilos controlados por tags, ejecutando el modelo en local para evitar costes de API.
- Evaluación de despliegue en hardware de consumo: comparar bf16, 8bit, 6bit y 4bit en un mismo Mac para decidir la precisión adecuada según memoria disponible y calidad aceptable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card sí incluye métricas de fidelidad de la conversión MLX frente al modelo PyTorch original:

| Precisión | Tamaño de `lm.safetensors` | KL (nats) | KL p95 | Acuerdo top-1 | Acuerdo top-1 (codebook 0) |
|---|---|---|---|---|---|
| bf16 | 7,88 GB | 0,0016 | 0,0033 | 94,9 % | 95,3 % |
| 8bit | 4,19 GB | 0,0020 | 0,0040 | 94,4 % | 96,3 % |
| 6bit | 3,20 GB | 0,0066 | 0,0129 | 90,9 % | 93,3 % |
| 4bit | 2,22 GB | 0,090 | 0,180 | 67,7 % | 85,0 % |

El decodificador HeartCodec ocupa 3,15 GB en todas las precisiones (mismo sha256 en bf16, 8bit, 6bit y 4bit). La precisión 4bit está marcada como experimental y por debajo del umbral de calidad.

## Requisitos de hardware

- Hardware objetivo: Macs con Apple Silicon (MLX); no se mencionan GPUs NVIDIA.
- VRAM/memoria unificada estimada: el repositorio completo pesa 20,6 GB; solo el LM ocupa 7,88 GB en bf16, 4,19 GB en 8bit, 3,20 GB en 6bit y 2,22 GB en 4bit. A ello hay que sumar los 3,15 GB del decodificador HeartCodec y el resto del pipeline del repositorio original.
- GPU recomendadas: no disponible (la publicación está orientada a Apple Silicon).
- ¿Cabe en GPU de consumo? No hay datos para GPUs de consumo; en Macs, la viabilidad depende de la memoria unificada del chip, que no se especifica.
- Opciones de despliegue: motor HeartMuLa de Moonbox con soporte MLX; el resto del pipeline proviene del repositorio original salvo las partes convertidas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la información proporcionada.

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| HeartMuLa-oss-3B-MLX | 3B | no disponible | Apache 2.0 | safetensors MLX |
| Alternativas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La precisión 4bit está marcada como experimental y por debajo del umbral de calidad (acuerdo top-1 del 67,7 %); no se recomienda para producción.
- Solo se han convertido las partes indicadas (LM y decodificador HeartCodec); el resto del pipeline debe tomarse del repositorio original, lo que añade dependencias no incluidas en este repo.
- Cada precisión es una carpeta y sus ficheros deben mantenerse juntos; mezclar ficheros de carpetas distintas rompe la carga.
- No hay información sobre sesgos, riesgo de alucinación, limitaciones de contexto ni cobertura idiomática.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base y de las dependencias del pipeline original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.
- No hay datos de latencia ni throughput para planificar despliegues.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/HeartMuLa-oss-3B-MLX
- Modelo base: https://huggingface.co/HeartMuLa/HeartMuLa-oss-3B
- Paper referenciado (arXiv:2601.10547): https://arxiv.org/abs/2601.10547

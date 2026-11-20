# nativ-community/DepthPro2-H

## Resumen

DepthPro2-H es un derivado en formato MLX del modelo Depth Pro 2 de Apple, desarrollado por la comunidad nativ-community. Se trata de un estimador de profundidad métrica monocular que, a partir de una imagen, un fotograma de vídeo o un flujo RGB en directo, predice un mapa de profundidad en unidades métricas reales (metros) junto con la longitud focal en píxeles de la cámara que capturó la escena. La conversión repackea los kernels de convolución para MLX y preserva los pesos en float32 originales, además de empaquetar el estimador de focal compartido con el modelo de profundidad.

El modelo cuenta con aproximadamente 895,5 millones de parámetros y un repositorio de 3,6 GB en safetensors. La librería de referencia es mlx-vlm, lo que lo orienta al ecosistema de Apple Silicon (MLX) para inferencia local en Mac. Su pipeline declarado es depth-estimation y su licencia es la Apple Machine Learning Research Model License Agreement (apple-amlr), que restringe el uso a investigación científica no comercial y desarrollo académico.

Su relevancia actual radica en que ofrece una vía práctica para ejecutar un modelo de profundidad métrica de referencia de Apple sobre hardware de consumo de Apple Silicon mediante MLX, sin necesidad de GPUs dedicadas, manteniendo la estimación de focal integrada y el soporte de vídeo y streams en vivo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de estimación de profundidad monocular basado en convoluciones; derivado de apple/DepthPro2-H) |
| Parámetros totales | 895.564.315 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible (la conversión preserva pesos float32) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | apple-amlr (Apple Machine Learning Research Model License Agreement), solo uso no comercial en investigación y desarrollo académico |
| Formato de pesos | safetensors (repositorio de 3,6 GB) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de que se trata de un modelo de profundidad monocular con estimador de focal compartido, derivado de apple/DepthPro2-H y apple/DepthPro2-focal. La conversión realizada por nativ-community repackea los kernels de convolución para MLX y conserva los pesos originales de Apple en float32, añadiendo una configuración de modelo MLX y empaquetando el estimador de focal junto con el modelo de profundidad.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. Para arquitectura, evaluación y citación se remite a la familia original en huggingface.co/apple/DepthPro2.

## Capacidades

- Estimación de profundidad métrica monocular a partir de imágenes individuales, devolviendo profundidad en metros.
- Estimación de la longitud focal en píxeles de la cámara que capturó la escena, integrada en el mismo pipeline.
- Procesamiento de vídeo (video-depth) además de imágenes estáticas.
- Procesamiento de flujos RGB en vivo (live RGB frames), según la documentación del autor.
- Inferencia local en Apple Silicon mediante MLX (librería mlx-vlm).
- API de alto nivel mediante `DepthPro2Predictor`, que devuelve un resultado con las claves `depth` y `focallength_px`.
- No dispone de capacidades de generación de texto, razonamiento, código, tool calling, agentes ni multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Reconstrucción 3D y fotogrametría: el mapa de profundidad métrica en metros permite generar nubes de puntos y mallas con escala real, adecuado para escaneo de objetos y entornos en flujos de trabajo de investigación.
- Realidad aumentada en dispositivos Apple: al ejecutarse en MLX sobre Apple Silicon, puede integrarse en prototipos de RA que necesiten estimar la distancia a objetos en tiempo real desde la cámara.
- Procesamiento de vídeo para efectos visuales: el soporte de video-depth permite generar mapas de profundidad por fotograma para desenfoque de fondo sintético, rotoscopia o composición en postproducción.
- Robótica y navegación asistida: la profundidad métrica y la focal estimada permiten calcular distancias absolutas a obstáculos a partir de una única cámara RGB, útil en prototipos de percepción.
- Análisis de escenas en investigación académica: al estar limitado a uso no comercial, encaja en estudios de visión por computador que requieran un estimador de profundidad de referencia sobre hardware de consumo.
- Digitalización de patrimonio y modelado de interiores: la escala métrica real facilita la medición de espacios y objetos a partir de fotografías, sin calibración manual de la cámara gracias al estimador de focal integrado.
- Aplicaciones de accesibilidad: generación de descripciones de profundidad o alertas de proximidad en tiempo real mediante el procesamiento de flujos RGB en vivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 895,5 millones de parámetros en float32, los pesos ocupan aproximadamente 3,6 GB, por lo que se requiere memoria unificada suficiente para pesos y activaciones.
- GPU recomendadas: el modelo está orientado a Apple Silicon mediante MLX; no se especifican modelos de GPU NVIDIA en la información disponible.
- Compatibilidad con GPU de consumo: el formato MLX está pensado para chips Apple (series M); no se indica compatibilidad con GPUs de consumo NVIDIA o AMD.
- Opciones de despliegue: mlx-vlm (librería declarada); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de profundidad.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nativ-community/DepthPro2-H | 895.564.315 | no aplica | safetensors (MLX) | apple-amlr (no comercial) | Hugging Face |
| apple/DepthPro2-H | no disponible | no aplica | no disponible | apple-amlr | Hugging Face |
| apple/DepthPro2-focal | no disponible | no aplica | no disponible | apple-amlr | Hugging Face |

No se dispone de datos de rendimiento comparado con otros estimadores de profundidad en la información proporcionada.

## Limitaciones y advertencias

- Licencia apple-amlr: los pesos y este derivado MLX están restringidos a investigación científica no comercial y desarrollo académico; el uso comercial requiere autorización expresa según el acuerdo incluido en el repositorio.
- El modelo es un derivado de comunidad con 0 descargas y 0 likes en el momento de la consulta; no cuenta con validación externa ni historial de uso.
- No es un modelo de lenguaje: no soporta generación de texto, razonamiento, tool calling ni capacidades multilingües.
- La precisión de la profundidad métrica depende de las condiciones de captura; no se documentan en la información disponible los sesgos ni los dominios de degradación.
- El formato MLX limita su ejecución al ecosistema Apple Silicon; no es portable directamente a otros entornos sin reconversión.
- No se especifican límites de resolución de entrada, comportamiento en escenas con poca textura o transparencias, ni riesgos de alucinación de profundidad.
- Al preservar pesos float32, el consumo de memoria es mayor que en versiones cuantizadas; no se ofrecen variantes cuantizadas en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nativ-community/DepthPro2-H
- Modelo base: https://huggingface.co/apple/DepthPro2-H
- Modelo base de focal: https://huggingface.co/apple/DepthPro2-focal
- Familia original: https://huggingface.co/apple/DepthPro2
- Documentación del modelo en mlx-vlm: https://github.com/Neywa-Labs/mlx-vlm/blob/main/mlx_vlm/models/depth_pro_2/README.md

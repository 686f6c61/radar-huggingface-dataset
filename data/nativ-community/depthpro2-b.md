# nativ-community/DepthPro2-B

## Resumen

DepthPro2-B es una conversión al ecosistema MLX del modelo Depth Pro 2 de Apple, un estimador de profundidad métrica monocular desarrollado por Apple Machine Learning Research. El modelo original estima profundidad absoluta en metros a partir de imágenes, vídeo y flujos RGB en vivo, e incorpora un estimador de longitud focal compartido que permite obtener resultados métricos sin conocer los parámetros intrínsecos de la cámara. Esta versión, publicada por nativ-community, repacka los kernels de convolución para MLX y añade una configuración de modelo MLX, preservando los pesos en float32 de Apple.

El modelo cuenta con aproximadamente 120 millones de parámetros (119.968.859 según los safetensors) y un tamaño de repositorio de 0,5 GB. Está pensado para ejecutarse en hardware Apple Silicon mediante la librería mlx-vlm, lo que lo hace relevante para desarrolladores que quieran integrar estimación de profundidad métrica en aplicaciones locales de macOS o iOS sin depender de CUDA.

La licencia es la Apple Machine Learning Research Model License Agreement (apple-amlr), que restringe el uso a investigación científica no comercial y desarrollo académico. Esto limita su adopción en productos comerciales, pero lo convierte en una opción interesante para prototipado e investigación en visión por computador sobre hardware de Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de estimación de profundidad; derivado de Apple Depth Pro 2) |
| Parametros totales | 119.968.859 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (pesos preservados en float32) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apple-amlr (Apple Machine Learning Research Model License Agreement) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo original más allá de que se trata de un estimador de profundidad métrica monocular con un estimador de longitud focal compartido. La model card indica que esta conversión repacka los kernels de convolución para MLX y preserva los pesos en float32 de Apple, lo que sugiere una red basada en convoluciones (probablemente un backbone tipo ViT con cabezas convolucionales, habitual en los modelos Depth Pro, aunque no se confirma en la información proporcionada).

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO, ya que no es un modelo de lenguaje. La model card remite a la familia original (apple/DepthPro2) para obtener información sobre arquitectura, evaluación y citación.

## Capacidades

- Estimación de profundidad métrica monocular a partir de una sola imagen RGB, devolviendo profundidad en metros.
- Estimación de longitud focal en píxeles de forma conjunta con la profundidad, sin necesidad de metadatos de cámara.
- Procesamiento de vídeo y flujos RGB en vivo, según la documentación del repositorio mlx-vlm.
- Ejecución nativa en hardware Apple Silicon mediante MLX.
- Interfaz de predicción de alto nivel (`DepthPro2Predictor`) que devuelve un diccionario con `depth` y `focallength_px`.
- No soporta generación de texto, tool calling, agentes ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- **Reconstrucción 3D y fotogrametría**: el modelo permite obtener mapas de profundidad métrica a partir de fotografías individuales, lo que facilita la generación de nubes de puntos o mallas 3D sin calibración de cámara explícita, gracias al estimador de longitud focal integrado.
- **Realidad aumentada en dispositivos Apple**: al ejecutarse sobre MLX en Apple Silicon, puede integrarse en apps de AR para iOS/macOS que necesiten oclusión y posicionamiento de objetos virtuales usando profundidad métrica en tiempo real desde la cámara.
- **Edición fotográfica con desenfoque selectivo**: la profundidad métrica permite aplicar efectos de bokeh sintético o desenfoque por planos de forma físicamente coherente, usando los valores en metros para definir rangos de enfoque.
- **Robótica y navegación asistida**: en entornos de investigación con hardware Apple, el modelo puede alimentar módulos de percepción que requieran distancias absolutas a obstáculos a partir de una única cámara RGB.
- **Análisis de vídeo y streams en vivo**: la documentación del repositorio mlx-vlm cubre vídeo y flujos en vivo, lo que permite procesar secuencias para seguimiento de profundidad temporal en aplicaciones de análisis deportivo, conducción o vigilancia.
- **Investigación en visión por computador**: al ser un modelo con licencia no comercial, es adecuado para experimentos académicos de estimación de profundidad, comparación de métodos y generación de datasets etiquetados con profundidad métrica.
- **Digitalización de interiores y escenas**: con una sola foto se pueden obtener medidas aproximadas en metros de una habitación o escena, útil para herramientas de diseño de interiores o inventario volumétrico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM/unified memory estimada**: con ~120 M de parámetros en float32, los pesos ocupan aproximadamente 0,48 GB; el uso total de memoria dependerá de la resolución de entrada y de las activaciones intermedias, no disponible en la información proporcionada.
- **GPU recomendadas**: hardware Apple Silicon (series M1, M2, M3, M4 y superiores) al estar implementado sobre MLX. No se menciona soporte CUDA.
- **Compatibilidad con GPU de consumo**: sí, en equipos Apple con memoria unificada; el modelo es pequeño (0,5 GB de repositorio) y cabe holgadamente en configuraciones de 8 GB o más.
- **Opciones de despliegue**: mlx-vlm (librería oficial de esta conversión). No se indica soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- **Latencia y throughput**: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nativ-community/DepthPro2-B | 119.968.859 | no disponible | Profundidad métrica monocular (MLX) | apple-amlr (no comercial) | Hugging Face |
| apple/DepthPro2-B | no disponible | no disponible | Profundidad métrica monocular | apple-amlr (no comercial) | Hugging Face (modelo base) |
| apple/DepthPro2-focal | no disponible | no disponible | Estimador de longitud focal | apple-amlr (no comercial) | Hugging Face (modelo base) |

No se dispone de información sobre otros modelos comparables de profundidad métrica monocular (como Depth Anything, MiDaS o Metric3D) en la información proporcionada, por lo que no se incluyen en la comparativa.

## Limitaciones y advertencias

- **Licencia no comercial**: la Apple Machine Learning Research Model License Agreement restringe el uso a investigación científica no comercial y desarrollo académico; no se permite uso comercial sin autorización expresa.
- **Sesgos**: no disponible en la información proporcionada; al ser un modelo de profundidad, podría heredar sesgos del dataset de entrenamiento original de Apple, no documentados aquí.
- **Riesgo de alucinación**: no aplica en el sentido de generación de texto, pero la profundidad estimada puede ser inexacta en escenas con superficies reflectantes, transparentes, texturas repetitivas o iluminación adversa, como es habitual en estimación monocular.
- **Limitaciones de contexto o idioma**: no aplica; el modelo no procesa texto ni tiene ventana de contexto lingüística.
- **Restricciones de producción**: la licencia impide su uso en productos comerciales; además, depende del ecosistema MLX y de hardware Apple Silicon, lo que limita el despliegue en servidores con GPU NVIDIA.
- **Conversión derivada**: al ser una conversión de la comunidad (nativ-community) y no oficial de Apple, no hay garantía de paridad exacta con el modelo original más allá de la preservación de pesos en float32 indicada en la model card.
- **Madurez**: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación externa.

## Enlaces

- [Hugging Face: nativ-community/DepthPro2-B](https://huggingface.co/nativ-community/DepthPro2-B)
- [Modelo base: apple/DepthPro2-B](https://huggingface.co/apple/DepthPro2-B)
- [Modelo base: apple/DepthPro2-focal](https://huggingface.co/apple/DepthPro2-focal)
- [Familia original: apple/DepthPro2](https://huggingface.co/apple/DepthPro2)
- [Documentación de mlx-vlm para depth_pro_2](https://github.com/Neywa-Labs/mlx-vlm/blob/main/mlx_vlm/models/depth_pro_2/README.md)
- [Licencia (LICENSE en el repositorio)](https://huggingface.co/nativ-community/DepthPro2-B/blob/main/LICENSE)

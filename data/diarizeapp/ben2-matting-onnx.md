# diarizeapp/ben2-matting-onnx

## Resumen

BEN2 Foreground Video Matting ONNX es una conversión al formato ONNX del modelo BEN2 (Bilateral Edge-preserving Network), una red neuronal diseñada para la extracción de primer plano y la generación de mattes alfa de alta precisión en imágenes y vídeo. El repositorio, mantenido por diarizeapp, distribuye los pesos en ONNX para facilitar su despliegue en entornos de producción con aceleración por hardware heterogéneo, incluyendo NPU Hexagon HTP en Snapdragon X Elite, DirectML, CUDA y CPU con SIMD (x86_64 y ARM NEON).

El modelo resuelve el problema de la separación de primer plano con bordes finos (pelo, pelaje, transparencias), tarea conocida como *matting*, que va más allá de la simple segmentación binaria de fondo. Su relevancia actual radica en que ofrece una ruta de despliegue portable vía ONNX Runtime, lo que permite integrarlo en pipelines de vídeo en tiempo real sin depender del stack de PyTorch, y en que el repositorio se mantiene de forma canónica para evitar roturas por dependencias externas (404).

La información disponible sobre arquitectura interna, número de parámetros y datos de entrenamiento es limitada: la model card no detalla la estructura de la red más allá de su nombre y propósito. El tamaño del repositorio es de 0,4 GB y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BEN2 (Bilateral Edge-preserving Network); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | no disponible (modelo de visión, independiente del idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Tamano del repositorio | 0,4 GB |
| Pipeline declarado | image-text-to-image |
| Aceleracion soportada | Hexagon HTP NPU (Snapdragon X Elite), DirectML, CUDA, CPU (x86_64 / ARM NEON) |
| Formas de entrada | fijas para NPU (p. ej. 1024x1024); dinámicas no confirmadas |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna de BEN2 más allá de su denominación como Bilateral Edge-preserving Network, lo que sugiere un diseño orientado a preservar bordes bilaterales en la estimación del matte alfa. No se especifican el número de capas, el tipo de bloques (transformer, CNN o híbrido), ni el mecanismo exacto de preservación de bordes.

Tampoco se dispone de datos sobre el conjunto de entrenamiento (número de imágenes, composición, resolución), ni sobre si se emplearon técnicas de ajuste fino supervisado, destilación o aumento de datos sintéticos. La conversión a ONNX es el principal artefacto técnico documentado: el repositorio expone los grafos optimizados para distintos *execution providers* de ONNX Runtime, con soporte explícito para formas estáticas en NPU Hexagon HTP (por ejemplo, 1024x1024) y ejecución universal en CPU mediante SIMD.

## Capacidades

- Extracción de primer plano (*foreground matting*) en imágenes y vídeo.
- Generación de mattes alfa de alta precisión con preservación de bordes finos (pelo, pelaje, transparencias).
- Segmentación alfanumérica del matte, según la model card.
- Eliminación de fondo (*background removal*) con salida alfa.
- Ejecución acelerada por hardware en NPU Hexagon HTP (Snapdragon X Elite) con formas estáticas.
- Compatibilidad con DirectML y CUDA mediante ONNX Runtime.
- Fallback universal en CPU x86_64 y ARM NEON.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural.

## Casos de uso

- **Videollamadas y conferencias con fondo virtual**: el modelo genera un matte alfa por fotograma que permite sustituir o desenfocar el fondo preservando el contorno del hablante, incluido el pelo, gracias a su enfoque en preservación de bordes. La ejecución en NPU o DirectML facilita el procesamiento en tiempo real en portátiles.
- **Producción audiovisual y postproducción**: extracción de primer plano en clips de vídeo para composición sobre nuevos fondos (croma digital sin pantalla verde), aprovechando la salida alfa de alta precisión para integrar al sujeto en escenas sintéticas.
- **Edición fotográfica automatizada**: recorte de sujetos en imágenes para catálogos de producto, retratos o material de marketing, con bordes limpios en elementos difíciles como cabello o tejidos translúcidos.
- **Creación de avatares y contenido para redes sociales**: generación de stickers, miniaturas y composiciones con fondo transparente a partir de fotos o vídeos, desplegable en aplicaciones móviles o de escritorio vía ONNX Runtime.
- **Procesamiento por lotes en servidores sin GPU**: uso del *fallback* CPU con SIMD para pipelines de eliminación de fondo a gran escala en entornos x86_64 o ARM, sin depender de CUDA ni de PyTorch.
- **Integración en aplicaciones de escritorio Windows con DirectML**: despliegue en equipos con GPU integrada o discreta mediante DirectML, evitando la instalación del stack de CUDA y simplificando la distribución del binario.
- **Procesamiento en dispositivos Snapdragon X Elite**: ejecución en NPU Hexagon HTP con formas fijas (p. ej. 1024x1024) para aplicaciones de edición de vídeo o captura en directo con bajo consumo energético.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma explícita. El repositorio ocupa 0,4 GB, por lo que los pesos en ONNX son ligeros y compatibles con GPUs de gama baja; la VRAM en ejecución dependerá de la resolución de entrada y del *execution provider*.
- **GPU recomendadas**: no se especifican modelos concretos. Se documenta soporte para CUDA y DirectML, por lo que cabría esperar compatibilidad con GPUs NVIDIA (serie RTX, A100, H100) y GPUs Windows vía DirectML.
- **Consumer GPU**: por el tamaño del repositorio (0,4 GB), es probable que quepa en GPUs de consumo como RTX 3060 o superiores, aunque no se confirma en la documentación.
- **NPU**: soporte explícito para Hexagon HTP en Snapdragon X Elite con formas estáticas (p. ej. 1024x1024).
- **CPU**: *fallback* universal con SIMD en x86_64 y ARM NEON.
- **Opciones de despliegue**: ONNX Runtime (con *execution providers* CUDA, DirectML, CPU y Hexagon HTP). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia cualitativa, el ecosistema de *matting* incluye alternativas como RVM (Robust Video Matting), BackgroundMattingV2 o MODNet, pero no se han facilitado datos de rendimiento, parámetros ni licencia de estos modelos para establecer una comparación rigurosa.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BEN2 ONNX (este) | no disponible | no aplica | no disponible | Apache 2.0 | HuggingFace (diarizeapp) |
| RVM | no disponible | no aplica | no disponible | no disponible | no disponible |
| MODNet | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Información técnica incompleta**: la model card no detalla arquitectura, número de parámetros, datos de entrenamiento ni métricas de calidad, lo que dificulta evaluar su idoneidad frente a alternativas.
- **Riesgo de alucinación visual**: como todo modelo de *matting*, puede producir bordes incorrectos o halos en regiones ambiguas (transparencias, movimiento rápido, oclusiones), sin que exista un mecanismo de verificación interno.
- **Formas estáticas en NPU**: la aceleración en Hexagon HTP requiere formas fijas (p. ej. 1024x1024), lo que limita la flexibilidad de resolución en ese *execution provider*.
- **Idioma**: al ser un modelo de visión, no aplica soporte multilingüe; no se documentan sesgos culturales o demográficos específicos.
- **Licencia Apache 2.0**: permite uso comercial y modificación con atribución, pero conviene revisar las obligaciones de la licencia (incluir aviso de copyright y licencia) y verificar la procedencia de los pesos originales de BEN2, ya que este repositorio es una conversión mantenida por un tercero (diarizeapp).
- **Mantenimiento por terceros**: el repositorio se declara canónico para evitar roturas por 404, pero su continuidad depende del mantenedor y no del autor original del modelo.
- **Pipeline declarado**: la etiqueta `image-text-to-image` no refleja con precisión la tarea real (matting), lo que puede confundir en la búsqueda y filtrado dentro del Hub.

## Enlaces

- [HuggingFace: diarizeapp/ben2-matting-onnx](https://huggingface.co/diarizeapp/ben2-matting-onnx)
- [Repositorio del mantenedor (GitHub)](https://github.com/benzy/diarize)
- No se han encontrado en la información proporcionada enlaces a papers, blogs, demos ni al repositorio original de BEN2.

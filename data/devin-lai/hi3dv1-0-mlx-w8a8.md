# devin-lai/Hi3Dv1.0-mlx-w8a8

## Resumen

Hi3Dv1.0-mlx-w8a8 es una conversión cuantizada del modelo Hi3Dv1.0 (hi3d-official/Hi3Dv1.0) al formato MLX, publicada por el usuario devin-lai. Se trata de una variante experimental de cuantización W8A8 (pesos y activaciones en INT8) diseñada específicamente para ejecutarse en Apple Silicon, en concreto sobre la familia de chips M5. El modelo resuelve una tarea de image-to-3D: a partir de una imagen de referencia y una malla gruesa (coarse mesh) existente, refina la geometría tridimensional de esa malla.

La relevancia de esta ficha radica en que no es un modelo de lenguaje, sino un pipeline de refinamiento geométrico 3D. La model card es explícita al señalar que la inferencia genérica con `mlx-lm` no funciona: el pipeline de geometría requiere un runtime propio (`hi3d-mlx`). El repositorio ocupa 4,4 GB e incluye pesos en safetensors con cuantización INT8 de tipo signed-H64 para las proyecciones del transformer, junto con cuantización dinámica de activaciones y GEMMs enteros nativos.

El autor advierte que se trata de un trabajo experimental, que la calidad y la velocidad varían, y que requiere hardware M5. La licencia es la Hi3D Open License Agreement v1.0, que no equivale a MIT ni Apache. No se dispone de información sobre idiomas soportados ni de resultados de benchmarks en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con pipeline de imagen a geometria 3D (refinamiento de malla); cuantizacion W8A8 con proyecciones signed-H64 INT8 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (modelo de vision/geometria, no de texto) |
| Tipos de cuantizacion | W8A8: pesos INT8 (signed-H64) y activaciones INT8 con cuantizacion dinamica; requiere runtime W8A8 compatible |
| Idiomas soportados | no disponible |
| Licencia | hi3d-open-license-agreement-v1.0 (no es MIT ni Apache) |
| Formato de pesos | safetensors (formato MLX) |
| Tamano del repositorio | 4,4 GB |
| Variantes de resolucion | 512³ (2,38 GiB de checkpoint); 1024³/1536³ (4,41 GiB de checkpoint) |
| Hardware objetivo | Apple Silicon familia M5 (32 GiB en el cohorte historico) |
| Libreria | mlx |
| Pipeline HuggingFace | image-to-3d |

## Arquitectura y entrenamiento

La información disponible describe un pipeline de image-to-3D basado en transformer, con un VAE compartido y encoders de imagen fijos. El modelo no genera una malla desde cero: requiere una imagen de referencia y una malla gruesa previa, y su función es refinar la geometría de esa malla. La cuantización aplicada es W8A8 sobre las proyecciones del transformer, con pesos INT8 en formato signed-H64 y activaciones cuantizadas dinámicamente mediante GEMMs enteros nativos. El autor subraya que este esquema es distinto de la cuantización afín INT8 de pesos y que exige la ruta de runtime W8A8 incluida.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO, ya que el modelo no es de lenguaje. La conversión a MLX fue realizada por Devin Lai; la implementación de conversión es privada, mientras que la implementación de inferencia se publica en el proyecto principal. Los pesos transformer de este repositorio fueron modificados mediante cuantización en formato MLX respecto al modelo base hi3d-official/Hi3Dv1.0. La rejilla de 1536³ reutiliza el transformer de 1024 y no representa un recuento fijo de caras.

## Capacidades

- Refinamiento de geometría 3D a partir de una imagen de referencia y una malla gruesa existente.
- Generación de mallas en formato GLB como salida del pipeline de refinamiento.
- Soporte de múltiples resoluciones de rejilla: 512³, 1024³ y 1536³ (esta última reutilizando el transformer de 1024).
- Ejecución nativa en Apple Silicon mediante MLX, con GEMMs enteros INT8.
- Descarga selectiva por variante y resolución, con soporte de modo offline mediante `--local-files-only`.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No se documentan capacidades multilingües, de visión general, audio ni modo thinking.

## Casos de uso

- Refinamiento de mallas en pipelines de escaneo 3D: dado un escaneo grueso y una imagen de referencia, el modelo mejora la geometría de la malla antes de su uso en renderizado o impresión 3D.
- Prototipado de assets para videojuegos en Mac: un artista puede partir de una malla base y una imagen de referencia para obtener una malla refinada en GLB directamente en un equipo Apple Silicon M5.
- Reconstrucción asistida en fotogrametría: se usa la imagen como guía para corregir la geometría de una malla coarse obtenida por fotogrametría, reduciendo el trabajo manual de retopología.
- Evaluación de investigación en cuantización INT8 para modelos 3D: el repositorio sirve para medir el impacto de W8A8 signed-H64 frente a los pesos originales en tareas de geometría.
- Flujos offline en estaciones de trabajo Apple: con `hi3d-mlx download --variant w8a8 --resolution 512` y `--local-files-only`, se puede ejecutar el refinamiento sin conexión en entornos aislados.
- Generación de variantes de resolución: para iterar rápido se usa la variante 512³ (2,38 GiB) y para mayor detalle la 1024³/1536³ (4,41 GiB), seleccionando el checkpoint adecuado según el presupuesto de memoria.
- Integración en herramientas de modelado 3D: el CLI `hi3d-mlx refine` permite encadenar el refinamiento con scripts de exportación a GLB dentro de un pipeline de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a una metodología de benchmark (BENCHMARKS.md) y a un dataset de resultados (Hi3Dv1.0-mlx-results), pero no incluye cifras concretas en el texto proporcionado. El cohorte histórico se ejecutó en Apple M5 con 32 GiB y MLX 0.32.4, y los resultados son únicamente de geometría.

## Requisitos de hardware

- Hardware objetivo: Apple Silicon de la familia M5; el cohorte histórico usó M5 con 32 GiB de memoria unificada.
- Los tamaños indicados (2,38 GiB para 512³ y 4,41 GiB para 1024³/1536³) son tamaños de checkpoint, no memoria en tiempo de ejecución; los encoders y dependencias de Python son adicionales.
- No se documenta compatibilidad con GPU NVIDIA (A100, H100, RTX 4090) ni con otras plataformas; el runtime es MLX y específico de Apple Silicon.
- Despliegue mediante el CLI `hi3d-mlx` y el runtime W8A8 incluido; los cargadores genéricos `mlx-lm` no implementan este pipeline de geometría.
- Componentes compartidos (VAE y configuraciones) alojados en Hi3Dv1.0-mlx-shared.
- Latencia y throughput: no disponibles en la información proporcionada; el autor indica que la velocidad varía.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia interna, la alternativa directa es el modelo base sin cuantizar hi3d-official/Hi3Dv1.0, del que este repositorio es una conversión cuantizada. No se han encontrado en la información disponible otros modelos image-to-3D comparables con los que establecer una tabla de parámetros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- Modelo experimental: el autor advierte explícitamente que la calidad y la velocidad varían.
- Requiere hardware de la familia M5; no se garantiza funcionamiento en otras generaciones de Apple Silicon ni en GPU NVIDIA.
- Necesita una imagen de referencia y una malla gruesa existente; no genera una malla desde cero.
- Los resultados son únicamente de geometría; no se documentan capacidades de textura o apariencia.
- La rejilla de 1536³ reutiliza el transformer de 1024 y no es un recuento fijo de caras.
- Los cargadores genéricos `mlx-lm` no son compatibles; se requiere el runtime W8A8 específico.
- La implementación de conversión es privada, lo que limita la reproducibilidad del proceso de cuantización.
- Licencia Hi3D Open License Agreement v1.0: no es MIT ni Apache; es necesario revisar sus términos antes de cualquier uso comercial.
- No se dispone de información sobre sesgos, riesgo de alucinación en el sentido de modelos de lenguaje, ni limitaciones idiomáticas, al no ser un modelo de texto.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/devin-lai/Hi3Dv1.0-mlx-w8a8
- Proyecto y runtime de inferencia: https://huggingface.co/devin-lai/Hi3Dv1.0-mlx
- Resultados registrados: https://huggingface.co/datasets/devin-lai/Hi3Dv1.0-mlx-results
- Componentes compartidos: https://huggingface.co/devin-lai/Hi3Dv1.0-mlx-shared
- Metodología de benchmarks: https://huggingface.co/devin-lai/Hi3Dv1.0-mlx/blob/main/BENCHMARKS.md
- Licencia: https://huggingface.co/devin-lai/Hi3Dv1.0-mlx-w8a8/blob/v1.0.0/LICENSE
- Modelo base: https://huggingface.co/hi3d-official/Hi3Dv1.0

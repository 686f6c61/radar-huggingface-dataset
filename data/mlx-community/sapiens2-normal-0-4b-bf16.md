# mlx-community/sapiens2-normal-0.4b-bf16

## Resumen

mlx-community/sapiens2-normal-0.4b-bf16 es una conversión a MLX en bfloat16 del modelo facebook/sapiens2-normal-0.4b de Meta, perteneciente a la familia Sapiens2 presentada en ICLR 2026. Se trata de un modelo de visión centrado en el ser humano cuya tarea es estimar normales de superficie píxel a píxel, es decir, un vector unitario de tres componentes por cada punto de la imagen (salida de forma H, W, 3). No es un modelo de lenguaje: no genera texto, no mantiene conversaciones y no soporta tool calling.

La conversión la publica la organización mlx-community y está pensada para ejecutarse en Apple silicon mediante la librería mlx-vlm (a partir de la versión 0.7.0). Frente al checkpoint original en float32, esta versión ocupa la mitad de espacio: 0,91 GB de pesos safetensors y 453.357.747 parámetros totales. Los tensores q, k y v se han fusionado en una única proyección wqkv por bloque, tal y como espera la implementación de Sapiens2 en mlx-vlm.

Su relevancia práctica es doble. Por un lado, las normales de superficie son una señal geométrica clave para reconstrucción 3D, relighting y texturizado de avatares. Por otro, al ser un modelo de menos de 0,5 B de parámetros, cabe en un Mac con memoria unificada y permite procesar imágenes de personas en local, sin enviarlas a un servidor externo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bloques de atención tipo transformer (la conversión fusiona las proyecciones q, k y v en un tensor wqkv por bloque); el detalle interno del modelo original no se especifica en la información disponible |
| Parametros totales | 453.357.747 (aproximadamente 0,45 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión de predicción densa; procesa imágenes a resolución nativa, sin contexto textual) |
| Tipos de cuantizacion | bfloat16 en esta conversión; el checkpoint de referencia está en float32. No se documentan otros formatos |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades lingüísticas) |
| Licencia | sapiens2-license (campo `license: other`), definida en https://github.com/facebookresearch/sapiens2/blob/main/LICENSE.md |
| Formato de pesos | safetensors (MLX, bf16), archivo `model.safetensors` de 0,91 GB; repositorio de 0,9 GB |
| Tarea (pipeline) | depth-estimation (predicción densa de normales de superficie, `normal`) |
| Modelo base | facebook/sapiens2-normal-0.4b |
| Libreria | mlx / mlx-vlm 0.7.0 |
| Fecha de publicacion | 2026-09-13 |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna completa del modelo original ni su procedimiento de entrenamiento: no se indican el número de imágenes o tokens de entrenamiento, la composición del dataset, ni si hubo fases de ajuste tipo RLHF o DPO. Lo que sí se deduce del contenido del checkpoint es que el modelo se organiza en bloques con atención: cada bloque almacena las proyecciones q, k y v fusionadas en un único tensor `wqkv`, que es el formato que consume la implementación de Sapiens2 en mlx-vlm. La salida es densa y se produce a la resolución de la imagen de entrada en las tareas densas (las tareas de pose devuelven coordenadas en el sistema de píxeles de la imagen original).

La conversión no modifica la arquitectura, solo el formato y la precisión: todos los parámetros se almacenan en bfloat16 y el autor indica que la referencia ejecuta la inferencia en precisión mixta bf16, por lo que esta versión replica el régimen numérico original. El checkpoint en float32 ocupa el doble (aproximadamente 1,8 GB). Como innovaciones técnicas específicas de Sapiens2, la información disponible se limita a la referencia al artículo de ICLR 2026; no se detallan mecanismos como atención lineal o decodificación especulativa, que en cualquier caso no aplicarían a un modelo de regresión densa.

## Capacidades

- Estimación de normales de superficie por píxel en personas: devuelve un array de forma (H, W, 3) con vectores de longitud unitaria, a la resolución de la imagen de entrada.
- Procesamiento de imágenes en resolución nativa para tareas densas (sin reescalado a una resolución fija documentada).
- Salida numérica directa en arrays de numpy, apta para encadenarse con otros pasos de un pipeline de visión por computador.
- Modelo centrado en el ser humano: la familia Sapiens2 está especializada en cuerpos y figuras humanas.
- No soporta generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni capacidades multilingües.
- No dispone de modo de pensamiento (thinking), visión-lenguaje, audio ni diálogo multi-turno.
- Inferencia local en Apple silicon mediante mlx-vlm.

## Casos de uso

- Reconstrucción 3D de personas: las normales unitarias por píxel se integran junto con mapas de profundidad para generar mallas o nubes de puntos de un sujeto, un paso habitual en escaneo corporal y creación de avatares digitales.
- Relighting y renderizado neural: en edición fotográfica o de vídeo, las normales permiten recalcular la iluminación de una persona de forma coherente con una nueva fuente de luz, sin volver a capturar la escena.
- Preprocesado para telepresencia y realidad aumentada: el modelo genera la geometría de superficie necesaria para insertar avatares o efectos de iluminación sobre el usuario en tiempo real, ejecutándose en local en un Mac.
- Análisis biomecánico y deportivo: la orientación de la superficie corporal a lo largo de una secuencia de vídeo permite estudiar posturas, volúmenes y cambios de forma sin marcadores físicos.
- Generación de pseudo-etiquetas para otros modelos: las normales predichas se usan como etiquetas automáticas para entrenar estimadores más pequeños o específicos de dominio, reduciendo el coste de anotación manual.
- Herramientas de edición y retoque en macOS o iOS: al ejecutarse con MLX sobre memoria unificada, el modelo puede integrarse en una aplicación de escritorio que procese las imágenes del usuario sin subirlas a la nube, lo que simplifica el cumplimiento de normativas de privacidad.
- Escaneo de personas para videojuegos y VFX: la salida densa a resolución de entrada alimenta pipelines de texturizado y detallado de superficies en producción de contenidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de la conversión remite a la del modelo original y no incluye métricas numéricas, y los resultados de búsqueda obtenidos se refieren exclusivamente al framework MLX, no al modelo.

## Requisitos de hardware

- Pesos: 0,91 GB en bfloat16 (el checkpoint float32 equivalente ocupa aproximadamente el doble).
- Memoria: el modelo cabe holgadamente en cualquier Mac con memoria unificada de 8 GB o superior; el consumo real depende de la resolución de la imagen, ya que la salida es densa y crece con H × W.
- GPU: no requiere GPU dedicada de NVIDIA o AMD. Esta conversión está atada a MLX, por lo que el hardware objetivo es Apple silicon (serie M). No se documenta soporte CUDA en este repositorio.
- Cabe en hardware de consumo: sí, en cualquier Mac con chip de la serie M (incluidos equipos de gama base con 8 GB de memoria unificada), siempre que se ajuste la resolución de entrada.
- Opciones de despliegue: mlx-vlm 0.7.0 o superior mediante `pip install -U mlx-vlm`, usando la clase `Sapiens2Predictor` y la función `read_image`. No se proporcionan artefactos para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

La información disponible solo permite comparar esta conversión con su checkpoint de origen. No se han identificado en los resultados de búsqueda otros modelos comparables con datos verificables.

| Modelo | Parametros | Precision | Formato | Tamano | Hardware objetivo | Licencia |
|---|---|---|---|---|---|---|
| mlx-community/sapiens2-normal-0.4b-bf16 | 453.357.747 | bfloat16 | safetensors (MLX) | 0,91 GB | Apple silicon (MLX) | sapiens2-license |
| facebook/sapiens2-normal-0.4b | no disponible en la informacion (mismo modelo base) | float32 | safetensors (referencia) | aproximadamente 1,8 GB (2x) | no especificado | sapiens2-license |

No se dispone de datos de rendimiento de ninguno de los dos, por lo que no es posible establecer una comparación cuantitativa de calidad entre ellos ni frente a alternativas de terceros.

## Limitaciones y advertencias

- Dominio restringido: es un modelo centrado en el ser humano. No está pensado para estimar normales de escenas, objetos o interiores, y no debe usarse como estimador genérico.
- Sin capacidades de lenguaje: no procesa texto, no responde a instrucciones y no puede integrarse en flujos de agentes o tool calling.
- Riesgo de resultados poco fiables en zonas ambiguas: pelo, ropa sin textura, oclusiones o superficies especulares pueden producir normales inconsistentes. La salida no incluye medidas de incertidumbre ni de confianza.
- Ausencia de validación comunitaria: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y es una conversión reciente (13 de septiembre de 2026), sin evidencia pública de uso en producción.
- Pérdida de precisión por la conversión: al pasar de float32 a bfloat16 puede haber diferencias numéricas menores frente a la referencia, aunque el autor indica que la inferencia original ya se ejecuta en precisión mixta bf16.
- Restricciones de licencia: la licencia es `sapiens2-license` (campo `license: other`). Antes de cualquier uso comercial es obligatorio revisar el texto completo en el repositorio de Facebook Research; la conversión de mlx-community no concede permisos adicionales.
- Dependencia de plataforma: al estar empaquetado para MLX, el modelo solo se ejecuta de forma directa en Apple silicon. Su uso en servidores con GPU NVIDIA exigiría convertir el checkpoint a otro formato.
- Coste de memoria dependiente de la resolución: al producir salidas densas a la resolución de entrada, imágenes de gran tamaño incrementan el consumo de memoria y el tiempo de inferencia de forma proporcional al número de píxeles.
- Sin datos de benchmarks: la calidad del modelo no puede contrastarse con las cifras publicadas de otras alternativas a partir de la información disponible.

## Enlaces

- Conversión en HuggingFace: https://huggingface.co/mlx-community/sapiens2-normal-0.4b-bf16
- Modelo original: https://huggingface.co/facebook/sapiens2-normal-0.4b
- Licencia Sapiens2: https://github.com/facebookresearch/sapiens2/blob/main/LICENSE.md
- Repositorio de Sapiens2 (Facebook Research): https://github.com/facebookresearch/sapiens2
- Librería mlx-vlm (usada para la conversión y la inferencia): https://github.com/Blaizzy/mlx-vlm
- MLX, framework de Apple: https://mlx-framework.org/
- Repositorio de MLX: https://github.com/ml-explore/mlx
- MLX en Apple Open Source: https://opensource.apple.com/projects/mlx/
- MLX Studio (aplicación local para Mac): https://mlx.studio/

# ADI98211/depth-anything-v2-small-onnx

## Resumen

Depth Anything V2 Small ONNX es una redistribución en formato ONNX del modelo Depth Anything V2 Small, un estimador de profundidad monocular (monocular depth estimation) que, a partir de una única imagen RGB, genera un mapa de profundidad relativa. El repositorio lo publica el usuario ADI98211 como espejo de los pesos ya convertidos por onnx-community, y ofrece dos variantes: una en FP16 (49,64 MB) y otra cuantizada (27,26 MB). No se trata de un modelo entrenado por el autor del repo, sino de una conversión y alojamiento de los pesos originales del proyecto Depth Anything V2.

El modelo resuelve el problema de inferir la estructura espacial de una escena sin necesidad de sensores de profundidad, cámara estéreo ni LiDAR. Su salida es profundidad relativa, no distancias métricas en metros, lo que lo hace útil para efectos de desenfoque, animación 2.5D, composición y análisis de capas espaciales. La variante Small es la más ligera de la familia y está publicada bajo licencia Apache-2.0, lo que facilita su integración en entornos comerciales y en despliegues ligeros (incluido navegador, vía WebGPU o WASM).

La relevancia de esta ficha es práctica: el repo empaqueta los pesos ONNX listos para ONNX Runtime, con hashes SHA-256 verificados, pero no incluye pipeline de Transformers, preprocesado ni postprocesado. Cualquier integración debe replicar la configuración del modelo de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de estimacion de profundidad monocular; familia Depth Anything V2, variante Small) |
| Parametros totales | no disponible (el repo solo expone el tamano de los ficheros ONNX) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de texto) |
| Tipos de cuantizacion | FP16 (`model_fp16.onnx`) y cuantizada (`model_quantized.onnx`) |
| Idiomas soportados | no disponible (modelo de vision, sin capacidades linguisticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model_fp16.onnx`, `model_quantized.onnx`) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna ni los datos de entrenamiento. Lo único verificable es que se trata de la variante Small del proyecto Depth Anything V2, un modelo de estimacion de profundidad monocular que produce mapas de profundidad relativa a partir de una imagen RGB. La conversión a ONNX la realizó onnx-community en el repo `onnx-community/depth-anything-v2-small`, del que este repo es un espejo; los ficheros fueron descargados vía hf-mirror.com y verificados por tamano y SHA-256 antes de la subida.

No hay informacion disponible sobre numero de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO ni innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, etc.). Tampoco se documentan los nombres exactos de entradas/salidas, los tipos de datos ni las dimensiones de entrada soportadas: el autor remite a la configuracion del modelo de origen. La unica distincion funcional entre los dos ficheros es la precision (FP16 frente a cuantizada), con posibles diferencias numericas y de detalle en la salida cuantizada.

## Capacidades

- Estimacion de profundidad relativa monocular a partir de una unica imagen RGB.
- Generacion de mapas de profundidad normalizables a escala de grises o pseudo-color.
- Utilidad para efectos de desenfoque de fondo (bokeh) y separacion de capas por profundidad.
- Base para animacion 2.5D y parallax a partir de una imagen estatica.
- Analisis de jerarquia espacial en imagenes (que objetos estan delante o detras).
- Procesamiento fotograma a fotograma de video para generar mapas de profundidad (la decodificacion, suavizado temporal y codificacion corren a cargo de la aplicacion).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente visual.
- No es un modelo de normales de superficie ni devuelve distancias metricas en metros.

## Casos de uso

- Desenfoque de fondo selectivo: se estima la profundidad de la imagen y se aplica un desenfoque gaussiano cuya intensidad crece con la distancia estimada, generando un efecto bokeh sin camara con apertura real.
- Animacion 2.5D y parallax: a partir del mapa de profundidad se desplazan las capas de la imagen a velocidades distintas para simular movimiento de camara en fotografia o ilustracion.
- Composicion y retoque fotografico: el mapa de profundidad permite aislar sujetos del fondo para sustituir cielos, insertar elementos o aplicar mascaras de profundidad en herramientas de edicion.
- Previsualizacion de profundidad en video: procesando fotogramas con ONNX Runtime y aplicando suavizado temporal en la aplicacion, se obtienen mapas de profundidad para efectos o analisis, con la ventaja del bajo peso del modelo cuantizado (27,26 MB).
- Despliegue en navegador: la variante FP16 esta pensada para WebGPU y la cuantizada para WASM, lo que permite ejecutar estimacion de profundidad en el cliente sin servidor ni envio de imagenes a terceros.
- Analisis de escenas en pipelines de vision: como etapa previa para segmentacion, deteccion de oclusiones o reconstruccion aproximada de la estructura espacial en robotica ligera o inspeccion de imagenes.
- Prototipado rapido en entornos con ONNX Runtime: al ser un grafo ONNX autocontenido, se integra en aplicaciones Python, C++, C# o JS sin dependencias de frameworks de deep learning completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Por el tamano de los ficheros (49,64 MB en FP16 y 27,26 MB en cuantizado), el modelo es muy ligero y cabe holgadamente en cualquier GPU consumer moderna; el consumo real depende de la resolucion de entrada y del backend.
- GPU recomendadas: no se especifican en el repo. Por tamano, es apto para GPUs de gama baja y medias (por ejemplo, GTX 16xx, RTX 20xx/30xx/40xx) y para aceleradores integrados, aunque no hay datos oficiales de compatibilidad.
- Cabe en consumer GPU: si, por tamano de pesos; la resolucion de inferencia y el backend determinan el uso real de memoria.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, DirectML, WebGPU, WASM). El repo no incluye pipeline de Transformers ni configuracion de processor.
- Latencia y throughput: no disponibles. El autor advierte explicitamente que velocidad, memoria y compatibilidad dependen del hardware, del tamano de entrada y del motor de inferencia, y que no se pueden deducir del tamano del fichero.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Depth Anything V2 Small ONNX (este repo) | no disponible | no disponible | ONNX (FP16 y cuantizado) | Apache-2.0 | Hugging Face, espejo de onnx-community |
| Depth Anything V2 Small (original, onnx-community) | no disponible | no disponible | ONNX | Apache-2.0 | Hugging Face |
| Depth Anything V2 (proyecto original, GitHub) | no disponible | no disponible | pesos del framework original | Apache-2.0 (variante Small) | GitHub |

No hay datos de rendimiento comparativo ni de otras variantes (Base, Large) en la informacion proporcionada, por lo que la comparacion se limita a formato, licencia y procedencia.

## Limitaciones y advertencias

- La salida es profundidad relativa: no proporciona distancias reales en metros y los valores normalizados de distintas imagenes no son comparables entre si como distancias fisicas.
- No es un modelo de normales de superficie; no debe usarse para generar normal maps.
- Errores previsibles en objetos transparentes, superficies reflectantes, estructuras muy finas y escenas anomalas.
- El procesamiento de video fotograma a fotograma no incluye coherencia temporal: la decodificacion, el suavizado temporal y la codificacion son responsabilidad de la aplicacion.
- Ampliar la resolucion del mapa de profundidad de salida no incrementa el detalle que el modelo ha reconocido; la resolucion de inferencia y la de exportacion son distintas.
- El repo no incluye aplicacion, runtime ni configuracion de processor: descargar los pesos no basta para ejecutar via pipeline de Transformers.
- No hay evaluacion independiente de precision de las dos variantes ni garantias de velocidad entre dispositivos.
- El repo es un espejo de terceros; la autoria del entrenamiento corresponde al proyecto Depth Anything V2 y la conversion a onnx-community.
- Licencia Apache-2.0 para la variante Small, lo que permite uso comercial; conviene revisar `LICENSE.txt` incluido en el repo y las condiciones de las variantes mayores del proyecto original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ADI98211/depth-anything-v2-small-onnx
- Repo ONNX de origen: https://huggingface.co/onnx-community/depth-anything-v2-small
- Proyecto original Depth Anything V2: https://github.com/DepthAnything/Depth-Anything-V2
- Espejo de descarga citado por el autor: https://hf-mirror.com

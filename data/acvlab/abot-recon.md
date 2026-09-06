# acvlab/ABot-Recon

## Resumen

ABot-Recon es un modelo de reconstrucción tridimensional en streaming desarrollado por acvlab (AMAP CV Lab). Está diseñado para estimar el movimiento de la cámara y la geometría de la escena en línea a partir de vídeos extremadamente largos, utilizando únicamente un contexto local fijo de 12 frames. El modelo predice un mapa de puntos en el sistema de coordenadas de la cámara actual y una pose relativa entre frames adyacentes, y después compone estas predicciones locales en una reconstrucción global mediante composición secuencial.

Este enfoque resulta relevante porque permite procesar vídeos de larga duración sin necesidad de mantener toda la secuencia en memoria, lo que facilita aplicaciones en tiempo real como la localización y el mapeo simultáneos (SLAM) o la reconstrucción de entornos en robótica. El modelo se distribuye bajo licencia Apache 2.0 y su repositorio en Hugging Face tiene un tamaño de 4.0 GB. En la información disponible no se especifican el tamaño del modelo ni los parámetros internos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible |
| Pipeline | image-to-3d |
| Tamano del repositorio | 4.0 GB |

## Arquitectura y entrenamiento

La documentación disponible no detalla la arquitectura interna del modelo (tipo de red neuronal, número de parámetros, capas, etc.) ni el proceso de entrenamiento. Sin embargo, el enfoque metodológico se describe en el paper «Revisiting Local Context for Long-Horizon Streaming 3D Reconstruction». El modelo opera con una ventana local fija de 12 frames, a partir de la cual predice un mapa de puntos en el sistema de coordenadas de la cámara actual y una pose relativa entre el frame actual y el adyacente. Estas predicciones locales se componen secuencialmente para construir una reconstrucción global del entorno.

La innovación principal reside en el uso de un contexto local reducido y fijo para abordar vídeos de horizonte largo, evitando la dependencia de toda la secuencia y permitiendo el procesamiento en streaming. No se han publicado detalles sobre los datos de entrenamiento, el número de tokens o técnicas de alineación (RLHF, DPO, etc.).

## Capacidades

- Reconstrucción tridimensional de escenas a partir de secuencias de imágenes, generando mapas de puntos (point maps) en el sistema de coordenadas de la cámara.
- Estimación de poses relativas entre frames adyacentes, lo que permite calcular la trayectoria de la cámara.
- Procesamiento en streaming de vídeos largos, con una ventana local fija de 12 frames.
- Composición secuencial de predicciones locales para obtener una reconstrucción global coherente.
- Predicción de confianza asociada a cada punto, según se observa en la interfaz de Python (`confidence`).
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni tareas de razonamiento simbólico.

## Casos de uso

- Localización y mapeo simultáneos (SLAM) en robótica móvil: el modelo estima la pose de la cámara y la geometría de la escena en línea, lo que permite a un robot navegar y construir un mapa del entorno sin procesar el vídeo completo.
- Reconstrucción de escenas urbanas a partir de vídeos capturados con drones o vehículos: gracias a su capacidad para manejar secuencias largas, puede generar modelos tridimensionales de calles o edificios para cartografía.
- Realidad aumentada: el modelo permite anclar contenido digital en el mundo real reconstruyendo la geometría de la escena en tiempo real, lo que facilita la superposición de objetos virtuales en vídeos largos.
- Inspección industrial: a partir de vídeos de inspección de estructuras o maquinaria, el modelo reconstruye la geometría tridimensional para detectar deformaciones o anomalías sin necesidad de escáneres dedicados.
- Modelado de interiores: escaneo de espacios mediante vídeo para generar modelos 3D que puedan utilizarse en aplicaciones de interiorismo o diseño de espacios.
- Conducción autónoma: el modelo aporta percepción del entorno y localización de la cámara en tiempo real, complementando otros sensores en vehículos autónomos.
- Turismo virtual: reconstrucción de entornos a partir de vídeos de recorridos, permitiendo crear experiencias inmersivas navegables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No se dispone de datos sobre requisitos de VRAM para inferencia.
- El ejemplo de uso en la documentación indica que el modelo se ejecuta en dispositivos CUDA (`device="cuda"`), por lo que se requiere una GPU compatible con NVIDIA.
- No se especifican GPUs recomendadas, ni latencia, ni throughput.
- El tamaño del repositorio es de 4.0 GB, lo que puede servir como referencia para el espacio de descarga, pero no para estimar la memoria de inferencia.
- No se mencionan opciones de despliegue como vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No se dispone de información comparativa en la documentación proporcionada.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos ni análisis de riesgos en la información disponible.
- El rendimiento depende de la calidad de las imágenes de entrada y de las condiciones de iluminación; secuencias con oclusiones o baja textura pueden degradar la reconstrucción.
- La composición secuencial de predicciones locales puede acumular errores de deriva en vídeos muy largos, aunque el contexto local fijo ayuda a mitigar la dependencia de la secuencia completa.
- No se especifica un límite explícito de longitud de vídeo, pero el diseño con contexto local de 12 frames sugiere que está orientado a secuencias extensas.
- La licencia Apache 2.0 permite el uso comercial, pero es necesario revisar los términos completos de la licencia en el repositorio antes de redistribuir el modelo o sus derivados.

## Enlaces

- Hugging Face: https://huggingface.co/acvlab/ABot-Recon
- Paper (arXiv): https://arxiv.org/abs/2608.27529
- Página del proyecto: https://amap-cvlab.github.io/ABot-Recon-html/
- Código fuente (GitHub): https://github.com/amap-cvlab/ABot-Recon

# mlx-community/moge-3-vitg-mlx-fp32

## Resumen

MoGe-3 (VITG) es un modelo de estimación de geometría monocular de alta precisión, originalmente desarrollado por Ruicheng y portado al ecosistema MLX por la comunidad mlx-community. Este port en formato fp32 permite ejecutar el modelo en Apple Silicon mediante la librería MLX, ofreciendo una alternativa nativa a las implementaciones basadas en PyTorch. El modelo resuelve el problema de inferir la estructura geométrica tridimensional de una escena a partir de una única imagen, prediciendo mapas de puntos métricos, mapas de profundidad, mapas normales, máscaras de píxeles válidos e intrínsecas de cámara.

La arquitectura, según la nomenclatura del nombre (VITG), corresponde probablemente a un ViT-Gigantic, aunque no se confirma explícitamente en la documentación disponible. El modelo cuenta con aproximadamente 1.250 millones de parámetros y un tamaño de repositorio de 5 GB en precisión fp32. Su relevancia actual radica en que combina una estimación geométrica detallada con un refinamiento volumétrico disperso autoguiado, una técnica que mejora la precisión en bordes y regiones finas sin necesidad de postprocesado externo. Al estar disponible en MLX, se integra de forma eficiente en flujos de trabajo sobre hardware Apple, lo que amplía su accesibilidad para desarrolladores que trabajan con Macs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-Gigantic (inferido del nombre, no confirmado) |
| Parametros totales | 1.250.741.135 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo de vision, no texto) |
| Tipos de cuantizacion | fp32 (unico checkpoint disponible) |
| Idiomas soportados | No disponible (modelo de vision, no procesa texto) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura de MoGe-3 se basa en un transformer de vision (ViT) de gran tamano, como sugiere el sufijo VITG. El modelo incorpora un mecanismo de refinamiento volumetrico disperso autoguiado que opera sobre las caracteristicas extraidas por el encoder para producir estimaciones geometricas detalladas. Este refinamiento permite capturar estructuras finas y bordes con mayor fidelidad que los metodos tradicionales de estimacion de profundidad, que suelen suavizar en exceso las superficies.

No se dispone de informacion detallada sobre el entrenamiento del modelo original: ni el numero de tokens (al ser un modelo de vision, se hablaria de imagenes), ni la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La model card del port MLX solo indica que se convirtio el checkpoint oficial `model.pt` a formato MLX mediante la herramienta `mlx-vlm`, y que se valido contra la referencia en torch (CPU, fp32) obteniendo mascaras de pixeles validos identicas y un error de profundidad relativa mediana inferior al 0,2 %. Esta validacion confirma la fidelidad de la conversion, pero no aporta datos sobre el proceso de entrenamiento original.

## Capacidades

- Estimacion de profundidad metrica monocular: produce mapas de profundidad con valores absolutos en unidades fisicas (metros), no solo relativos.
- Estimacion de mapas normales: genera normales por pixel que describen la orientacion de las superficies en la escena.
- Estimacion de mascaras de pixeles validos: identifica que regiones de la imagen tienen estimaciones fiables, util para filtrar areas ambiguas o sin textura.
- Estimacion de intrinsecas de camara: infiere la distancia focal y el punto principal a partir de la imagen, sin necesidad de calibracion previa.
- Refinamiento volumetrico disperso autoguiado: mejora la precision en bordes y detalles finos mediante un proceso iterativo interno.
- Integracion nativa con MLX: ejecucion eficiente en Apple Silicon (CPU y GPU unificada) sin dependencias de CUDA.

## Casos de uso

- Robotica movil: el modelo proporciona profundidad metrica en tiempo real, lo que permite a un robot evitar obstaculos y planificar rutas en entornos desconocidos. Su capacidad para estimar intrinsecas de camara facilita la calibracion automatica en plataformas con opticas variables.
- Realidad aumentada: los mapas de profundidad y normales permiten colocar objetos virtuales con oclusion correcta y sombreado coherente respecto a la escena real. La estimacion de intrinsecas evita tener que configurar manualmente la camara del dispositivo.
- Conduccion autonoma: en sistemas de asistencia a la conduccion, la profundidad metrica es esencial para medir distancias a vehiculos y peatones. El modelo puede operar con una sola camara, reduciendo costes frente a sistemas estereo o LiDAR.
- Fotogrametria y reconstruccion 3D: a partir de una unica imagen, se pueden generar nubes de puntos metricas que sirven como base para modelado 3D de objetos o escenas, especialmente utiles en patrimonio cultural o inspeccion de infraestructuras.
- Edicion de imagenes: los mapas de profundidad permiten aplicar efectos de desenfoque selectivo (bokeh), reiluminacion o composicion de elementos con perspectiva correcta. La mascara de pixeles validos ayuda a evitar artefactos en zonas no fiables.
- Asistencia a personas con discapacidad visual: una aplicacion movil puede convertir la profundidad estimada en senales auditivas o hapticas para advertir de obstaculos, aprovechando la portabilidad del modelo en dispositivos Apple.
- Inspeccion industrial: en entornos de fabricacion, el modelo puede medir distancias o dimensiones de piezas a partir de fotografias, siempre que se conozca la escala o se use la intrinseca estimada para calibrar.
- Modelado de interiores: para diseno de interiores o inmobiliario, la profundidad y las normales permiten generar planos 3D aproximados de una habitacion a partir de una foto, facilitando la visualizacion de reformas o la colocacion de muebles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica validacion mencionada es la comparacion contra la referencia torch en CPU, con un error de profundidad relativa mediana inferior al 0,2 % y mascaras de pixeles validos identicas, pero no se aportan metricas estandar como RMSE, delta1 o comparaciones con otros modelos.

## Requisitos de hardware

- Memoria estimada: el modelo en fp32 ocupa aproximadamente 5 GB en disco. Para inferencia, se necesita memoria suficiente para los pesos y los tensores intermedios; se estima un minimo de 8-10 GB de memoria unificada en Apple Silicon.
- GPU recomendadas: cualquier chip Apple Silicon con al menos 16 GB de memoria unificada (M1 Pro, M2 Pro, M3 Pro o superiores). Modelos con 8 GB pueden ejecutar el modelo pero con riesgo de intercambio a memoria swap.
- Compatibilidad con consumer GPU: no aplica, ya que MLX esta disenado exclusivamente para Apple Silicon. No se puede ejecutar en GPUs NVIDIA o AMD.
- Opciones de despliegue: el modelo se integra mediante la libreria `mlx-vlm` y el modulo `MoGe3Predictor`. No hay soporte para vLLM, llama.cpp u Ollama, al ser un modelo de vision especifico.
- Latencia y throughput: no se dispone de datos publicados. En un MacBook Pro con M3 Pro, se espera una inferencia de varios cientos de milisegundos por imagen a resolucion media, pero no hay cifras confirmadas.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. Existen alternativas como Depth Anything V2 o MiDaS, pero no se han encontrado benchmarks que permitan una comparacion cuantitativa con MoGe-3. La principal diferencia estructural es que MoGe-3 estima intrinsecas de camara y mapas normales ademas de profundidad, mientras que muchos modelos de la competencia solo ofrecen profundidad relativa o metrica sin normales.

## Limitaciones y advertencias

- Modelo de vision exclusivamente: no procesa texto ni instrucciones en lenguaje natural; su uso se limita a la entrada de imagenes.
- Dependencia de Apple Silicon: al ser un port MLX, solo se ejecuta en hardware Apple. No es portable a entornos con GPUs NVIDIA o AMD sin una conversion adicional a otro formato.
- Validacion limitada: la comprobacion contra la referencia torch se realizo en CPU y fp32; no se han publicado pruebas en otros entornos (GPU, cuantizacion) ni en condiciones de produccion.
- Riesgo de errores en regiones ambiguas: como cualquier modelo de profundidad monocular, puede fallar en superficies reflectantes, transparentes o sin textura, aunque la mascara de pixeles validos ayuda a mitigar este problema.
- Sesgos potenciales: no se ha documentado el dataset de entrenamiento, por lo que podria presentar sesgos hacia ciertos tipos de escenas o condiciones de iluminacion.
- Licencia MIT: permite uso comercial y modificacion, pero el modelo original puede tener restricciones adicionales no reflejadas en este port; se recomienda revisar la licencia del checkpoint original.

## Enlaces

- Repositorio HuggingFace del port MLX: https://huggingface.co/mlx-community/moge-3-vitg-mlx-fp32
- Modelo original MoGe-3 (VITG): https://huggingface.co/Ruicheng/moge-3-vitg
- Libreria MLX: https://github.com/ml-explore/mlx
- Herramienta de conversion mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Organizacion MLX Community en HuggingFace: https://huggingface.co/mlx-community
- Sitio web de MLX Community: https://mlxcommunity.com/

# outmake/moge-2-vitb-coreml

## Resumen

MoGe-2 ViT-B para Core ML es una conversión del modelo de geometría monocular MoGe-2 ViT-B, desarrollado por Microsoft Research (Ruicheng Wang y colaboradores). La conversión la firma Outmake, que la publica para poder ejecutar el modelo en un Mac sin necesidad de Python. MoGe-2 resuelve la recuperación de geometría 3D a partir de una única imagen en dominio abierto: genera un mapa de puntos 3D (un punto por píxel) y una máscara de confianza, a partir de los cuales se derivan profundidad y estructura de la escena.

El modelo original es un transformer de visión (ViT-B, base del backbone) entrenado por Microsoft para estimar geometría monocular con consistencia métrica. Esta ficha describe la conversión a Core ML, no el modelo original: el paquete distribuido aquí conserva el mapa de puntos y la máscara, pero omite las normales de superficie y la escala métrica que sí ofrece el modelo original. La conversión está pensada para Apple Silicon y fija tamaños de entrada concretos porque Core ML no admite entrada dinámica en este formato.

Su relevancia es práctica: permite llevar la estimación de geometría monocular a aplicaciones nativas de macOS e iOS sin dependencias de Python ni GPU dedicada, con una latencia de unos 0,35 s por imagen en un MacBook Pro de la serie M. La licencia MIT facilita su integración comercial. El caso de uso declarado por el autor es el desenfoque de fondo (blur background) basado en distancia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-B) para geometría monocular; backbone con características tipo DINOv2 |
| Parametros totales | no disponible (arquitectura ViT-B; el autor no especifica el recuento exacto) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | FP16 (16-bit floats) en los paquetes Core ML |
| Idiomas soportados | no disponible (modelo visual, sin procesamiento de lenguaje) |
| Licencia | MIT (con aviso de copyright original del autor en `LICENSE-MoGe`) |
| Formato de pesos | Core ML `.mlpackage` |
| Tamano del repo | 0,6 GB |
| Tamano de entrada | tres paquetes fijos: 574x854, 854x574 y 700x700 (cada uno de 195 MB) |
| Framework | Core ML (librería `coreml`) |
| Modelo base | Ruicheng/moge-2-vitb-normal |

## Arquitectura y entrenamiento

La arquitectura subyacente es MoGe-2, el modelo de geometría monocular de Microsoft Research (presentado en CVPR'25), cuyo backbone es un Vision Transformer en su variante Base (ViT-B). El modelo original produce mapas de puntos métricos, mapas de profundidad métrica, mapas de normales y campo de visión de cámara a partir de una sola imagen en dominio abierto. La conversión aquí descrita conserva únicamente las salidas de mapa de puntos (`points`, de forma 1 x H x W x 3) y máscara de confianza (`mask`, de forma 1 x H x W, con valores entre 0 y 1).

Sobre el entrenamiento no se aporta información en la documentación de la conversión: no se detallan el número de tokens, la composición del dataset ni si hubo fases de ajuste fino (RLHF/DPO, poco habituales en visión geométrica). Tampoco se especifican detalles del preentrenamiento del backbone. Lo que sí se documenta es el proceso de conversión: Core ML fija el tamaño de entrada, de modo que se generaron tres paquetes independientes (574x854 para imágenes anchas, 854x574 para verticales y 700x700 para cuadradas) mediante el script `convert.py`. La innovación destacable de esta conversión no es arquitectónica, sino de despliegue: empaquetado en Core ML FP16 para ejecución on-device en Apple Silicon.

Una característica técnica relevante que el autor documenta con precisión: el desplazamiento en z y la distancia focal no forman parte de la salida del modelo convertido. MoGe los estima a posteriori mediante un ajuste por mínimos cuadrados, y cualquier integración que use estos paquetes debe replicar ese paso. Las normales y la escala métrica, que el modelo original sí entrega, quedan fuera de esta conversión.

## Capacidades

- Estimación de geometría monocular en dominio abierto a partir de una única imagen RGB.
- Generación de un mapa de puntos 3D: salida `points` con forma 1 x H x W x 3 (un punto por píxel).
- Generación de máscara de confianza: salida `mask` con valores entre 0 y 1, baja donde el modelo no responde (cielo, fondos de estudio planos).
- Derivación de profundidad relativa coherente a partir del mapa de puntos (correlación de 0,99 o superior frente a la exportación ONNX de los autores en las mismas imágenes).
- Ejecución on-device en Apple Silicon sin dependencias de Python.
- Aplicaciones de posprocesado fotográfico, como el desenfoque de fondo guiado por distancia, que es el uso declarado por el autor.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No ofrece capacidades multilingües ni generación de texto.
- No incluye normales de superficie, escala métrica, distancia focal ni desplazamiento en z en su salida; deben calcularse externamente.

## Casos de uso

- Desenfoque de fondo en fotografía móvil: el modelo estima la distancia de cada parte de la imagen y el efecto de desenfoque se aplica en función de esa profundidad, permitiendo retratos con fondo desenfocado sin cámara con sensor de profundidad. Es el uso para el que Outmake lo emplea.
- Retoque fotográfico en macOS: integración en una app nativa de escritorio que aplica profundidad de campo selectiva o desenfoque de fondo de forma interactiva, aprovechando que no requiere Python.
- Reconstrucción 3D ligera en iOS: combinando el mapa de puntos y la máscara de confianza se pueden exportar nubes de puntos o mallas sencillas para visualización (como hace el paquete MoGe2Kit, que devuelve profundidad métrica, mapa de puntos en espacio de cámara OpenCV, normales y confianza).
- Segmentación por planos de profundidad: la máscara y el mapa de puntos permiten separar primer plano y fondo para tareas de composición o recorte sin depender de una segmentación semántica.
- Realidad aumentada sencilla en dispositivos Apple: usar la profundidad estimada para colocar objetos virtuales con una noción aproximada de la geometría de la escena, siempre teniendo en cuenta que la escala métrica no está incluida en esta conversión.
- Estimación de profundidad por lotes en un Mac: procesar colecciones de imágenes (por ejemplo, para generar mapas de profundidad de un catálogo fotográfico) a unos 0,35 s por imagen en hardware M-series, sin GPU dedicada ni servidor.
- Preprocesado en aplicaciones de edición de vídeo cuadro a cuadro: al ser rápido en CPU+GPU unificado, puede aplicarse a fotogramas individuales para efectos de profundidad, asumiendo que el modelo no aprovecha el tiempo entre fotogramas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible; además, dichos benchmarks no aplican a un modelo de geometría visual. El único dato de rendimiento publicado es una medida de fidelidad frente al modelo original:

| Metrica | Resultado | Condiciones |
|---|---|---|
| Correlacion de profundidad frente al export ONNX de los autores | 0,99 o superior | mismas imagenes |
| Latencia por imagen | ~0,35 s | MacBook Pro serie M con `computeUnits = .cpuAndGPU` |
| Tiempo de carga con Neural Engine | ~41 s, y ejecucion tres veces mas lenta | Neural Engine activado (desaconsejado) |

## Requisitos de hardware

- Plataforma: Apple Silicon obligatorio (Core ML). No está pensado para GPU NVIDIA ni para servidores x86.
- Almacenamiento: cada paquete `.mlpackage` ocupa 195 MB; el repositorio completo, 0,6 GB.
- Memoria: al ser FP16 y de tamaño reducido, el modelo cabe holgadamente en la memoria unificada de cualquier Mac de la serie M; no se especifica una cifra exacta de RAM.
- GPU recomendadas: no aplica el concepto de GPU dedicada; se ejecuta sobre CPU y GPU integradas de Apple Silicon con `computeUnits = .cpuAndGPU`.
- ¿Cabe en consumer GPU? No aplica en el sentido de GPU de escritorio; sí cabe en hardware de consumo Apple (MacBook Pro M-series y dispositivos iOS compatibles con Core ML).
- Neural Engine: desaconsejado. El autor documenta que con el Neural Engine habilitado el modelo tarda unos 41 s en cargar y es tres veces más lento.
- Opciones de despliegue: Core ML en macOS/iOS; integración con Swift mediante paquetes como MoGe2Kit (iOS 17+, procesa un UIImage y devuelve profundidad métrica, mapa de puntos en espacio de cámara OpenCV, normales, confianza y los píxeles redimensionados usados en inferencia). No es compatible con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: aproximadamente 0,35 s por imagen en un MacBook Pro de la serie M con `cpuAndGPU`.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salidas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| outmake/moge-2-vitb-coreml | Core ML (Apple) | 3 tamanos fijos | Mapa de puntos, mascara | MIT | HuggingFace (Outmake) |
| mlboydaisuke/MoGe-2-ViT-B-CoreML | Core ML | 504x504 | Profundidad metrica, profundidad monocular, normales de superficie | MIT | HuggingFace |
| MoGe2-CoreML-3D (yosun) | Core ML + paquete Swift (MoGe2Kit) | No especificado | Profundidad metrica, mapa de puntos, normales, confianza | No disponible | GitHub |
| MoGe-2 original (Ruicheng/moge-2-vitb-normal) | PyTorch | Dinamica | Mapa de puntos metrico, profundidad metrica, normales, FOV | MIT | HuggingFace |

La conversión de Outmake se distingue de la de mlboydaisuke por usar tres resoluciones fijas en lugar de una sola (504x504) y por omitir normales y escala métrica. Frente al modelo original en PyTorch, sacrifica salidas (normales, escala métrica, FOV) y flexibilidad de tamaño de entrada a cambio de ejecución nativa sin Python en Apple Silicon.

## Limitaciones y advertencias

- La máscara de confianza es baja en cielo y fondos de estudio planos; estas regiones deben tratarse como sin respuesta válida.
- No se incluyen en la salida la distancia focal ni el desplazamiento en z; hay que estimarlos con un ajuste por mínimos cuadrados, igual que hace MoGe.
- Se omiten las normales de superficie y la escala métrica presentes en el modelo original; no deben asumirse a partir de esta conversión.
- El tamaño de entrada está fijado a tres resoluciones concretas (574x854, 854x574 y 700x700); Core ML no admite entrada dinámica en este formato, por lo que hay que redimensionar o recortar la imagen antes de inferir.
- El uso del Neural Engine degrada notablemente el rendimiento (carga de 41 s y ejecución tres veces más lenta); se recomienda `computeUnits = .cpuAndGPU`.
- La conversión la realiza un tercero (Outmake), no los autores del modelo; la fidelidad reportada (correlación de 0,99) es frente al export ONNX de los autores, no frente a la implementación original en PyTorch.
- No se documentan sesgos específicos de la conversión, pero al ser un modelo de geometría entrenado con datos de imagen, hereda los sesgos del modelo base de Microsoft Research.
- Riesgo de alucinación geométrica en imágenes ambiguas o con objetos reflectantes/transparentes; la máscara mitiga parcialmente este riesgo al señalar regiones sin respuesta.
- La licencia es MIT, lo que permite uso comercial, pero se debe conservar el aviso de copyright original incluido en `LICENSE-MoGe`.
- Dado el escaso número de descargas (3) y la ausencia de likes, la conversión no cuenta con validación comunitaria amplia; conviene verificar en el propio caso de uso antes de llevarla a producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/outmake/moge-2-vitb-coreml
- Modelo base: https://huggingface.co/Ruicheng/moge-2-vitb-normal
- Repositorio original de MoGe (Microsoft): https://github.com/microsoft/MoGe
- Demo en Hugging Face Space (MoGe-2): https://huggingface.co/spaces/Ruicheng/MoGe-2
- Conversión Core ML alternativa (mlboydaisuke): https://huggingface.co/mlboydaisuke/MoGe-2-ViT-B-CoreML
- Paquete MoGe2Kit y visor 3D (yosun): https://github.com/yosun/MoGe2-CoreML-3D/blob/main/README.md

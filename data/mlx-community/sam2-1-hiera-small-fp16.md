# mlx-community/SAM2.1-hiera-small-fp16

## Resumen

SAM2.1-hiera-small-fp16 es la conversión a Apple MLX (precisión fp16) del checkpoint oficial `sam2.1_hiera_small.pt` de Meta, publicada por la comunidad mlx-community. Se trata de un modelo de segmentación de imagen "promptable": recibe una imagen junto con indicaciones en forma de punto o caja y devuelve la máscara del objeto correspondiente. Incluye 38.538.833 parámetros (38,5 M) distribuidos en 359 tensores y ocupa 0,1 GB en el repositorio, lo que lo convierte en una pieza ligera y apta para ejecución local.

A diferencia del SAM 2.1 completo, este paquete contiene únicamente la ruta de imagen (troncal Hiera + cuello FPN + codificador de prompts SAM + decodificador de máscaras + `no_mem_embed`); no incluye la pila de memoria de vídeo. Su propósito declarado es servir de motor al paquete Swift `mlx-edgetam-swift` (`SAM21Package` de MLXEngine, con modo `softMatte` para obtener un matte suavizado), de modo que aplicaciones nativas de Apple Silicon puedan hacer segmentación interactiva sin salir del dispositivo.

Su relevancia actual es doble: por un lado, permite segmentación por clic con calidad notablemente superior a la de modelos mucho más pequeños como EdgeTAM (13,9 M) en imágenes sintéticas o de color plano; por otro, demuestra que la conversión de pesos de PyTorch a MLX mantiene una paridad numérica muy alta (error relativo en el embedding de imagen inferior a 5,3e-6 y máscaras con IoU 1,0000 frente a la referencia en fp32 en CPU). Los pesos se distribuyen bajo licencia Apache-2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Troncal Hiera (vision transformer jerárquico) + cuello FPN + codificador de prompts SAM + decodificador de máscaras; solo ruta de imagen |
| Parametros totales | 38.538.833 (38,5 M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje). Resolución de trabajo indicada: imágenes de hasta 1024×1024; admite puntos y cajas como indicaciones |
| Tipos de cuantizacion | fp16 (única variante publicada en este repositorio); no se ofrecen versiones int8, int4 ni GGUF |
| Idiomas soportados | no aplica (modelo de segmentación de imagen; no procesa texto) |
| Licencia | apache-2.0 (pesos); el código del port es MIT |
| Formato de pesos | safetensors para MLX (fp16) |
| Numero de tensores | 359 |
| Tamano del repositorio | 0,1 GB |
| Modelo base | facebook/sam2.1-hiera-small |
| Pipeline | image-segmentation (promptable-segmentation) |
| Biblioteca | mlx |
| Autor | mlx-community |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (metadatos) | 2026-09-23 |

## Arquitectura y entrenamiento

La arquitectura reproduce la del SAM 2.1 de Meta en su variante Hiera-Small. La troncal Hiera procesa la imagen y extrae representaciones jerárquicas; un cuello FPN las combina; el codificador de prompts convierte los puntos y cajas del usuario en embeddings, y el decodificador de máscaras produce la segmentación final. El paquete incluye además el tensor `no_mem_embed`, necesario para el funcionamiento en modo imagen, pero omite deliberadamente todo el stack de memoria temporal que SAM 2.1 usa para vídeo. Los nombres de las claves se mantienen idénticos a los del repositorio original, las convoluciones están en formato NHWC `(O,kH,kW,I)` y los tensores `pos_embed` y `pos_embed_window` de la troncal tienen forma `(1,H,W,C)`.

Los detalles de entrenamiento del modelo base (número de tokens, composición exacta del dataset, uso de RLHF/DPO u otras etapas de ajuste) no se detallan en la información proporcionada. Lo que sí se documenta es el proceso de conversión, realizado con el script `oracle/convert_sam21.py`, y su verificación: el port en Swift iguala a `SAM2ImagePredictor` de PyTorch (fp32, CPU) hasta la llamada `set_image`, con un error relativo en `image_embed` menor o igual a 5,3e-6 y coincidencia de máscaras por clic y por caja a IoU 1,0000, con una diferencia en el IoU predicho inferior o igual a 1e-5. Con los pesos fp16 y activaciones fp16 en GPU, el IoU de máscara frente a PyTorch fp32 es mayor o igual a 0,9996 en prompts de tamaño de objeto.

## Capacidades

- Segmentación de imagen guiada por indicaciones: un punto o una caja delimitan el objeto a segmentar y el modelo devuelve la máscara.
- Modo imagen puro: no incluye memoria de vídeo ni seguimiento de objetos a lo largo de fotogramas.
- Salida de máscara dura y de matte suavizado (anti-aliased) a través del modo `softMatte` de MLXEngine, útil para recorte con bordes limpios.
- Puntuación de confianza asociada a cada máscara (`r.score`), lo que permite filtrar predicciones de baja calidad en un pipeline automático.
- Buen comportamiento en imágenes de color plano, ilustraciones y documentos sintéticos, donde modelos más pequeños fallan: un clic en la barriga de un zorro de dibujo animado selecciona el zorro completo (IoU 0,968 frente a 0,008 de EdgeTAM).
- Precisión en la selección de detalles pequeños: un clic sobre un cuadrado pequeño de una página gris selecciona solo ese cuadrado, mientras que EdgeTAM añade además un cuadrado de la esquina.
- No dispone de generación de texto, razonamiento, código, matemáticas, tool calling, capacidades de agente ni multimodalidad de entrada/salida más allá de la imagen y las indicaciones geométricas.
- No tiene capacidades multilingües porque no procesa lenguaje.

## Casos de uso

- Edición fotográfica interactiva en macOS e iOS: la aplicación captura un clic o un rectángulo del usuario, llama al modelo y obtiene la máscara del sujeto para aplicar recortes, desenfoques selectivos o cambios de fondo; la latencia de 11-18 ms por prompt adicional sobre la misma imagen permite respuesta prácticamente instantánea.
- Recorte y generación de mattes en herramientas de diseño: el modo `softMatte` produce bordes anti-aliased, adecuados para composición sobre nuevos fondos sin halos visibles.
- Etiquetado previo de datasets de segmentación: con prompts automáticos de caja provenientes de un detector previo, el modelo genera máscaras candidatas que un humano solo tiene que revisar, reduciendo el coste de anotación en visión por computador.
- Extracción de objetos en imágenes sintéticas o generadas: al rendir bien en color plano e ilustración, sirve para aislar elementos de assets de videojuego, infografías o renders.
- Pipelines de inpainting y edición generativa: la máscara obtenida se pasa como entrada a un modelo de difusión que rellena la región seleccionada, todo ello en local sobre Apple Silicon.
- Inspección visual asistida en industria o teledetección: un operador marca con una caja la región de interés (una pieza defectuosa, una parcela, una construcción) y el modelo devuelve su contorno exacto para medir o clasificar después.
- Herramientas de anotación y captura para investigación: selección rápida de regiones en capturas de pantalla, páginas escaneadas o figuras de artículos, manteniendo los datos en el dispositivo.
- Integración nativa en apps Swift: el paquete `mlx-edgetam-swift` expone `EdgeTAMPredictor` con `setImage`, `predict(point:)` y `predict(points:labels:box:)`, lo que permite añadir segmentación a una aplicación Apple sin dependencias de Python.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K u otros) en la información disponible; se trata de un modelo de segmentación y esas métricas no aplican. Los datos de paridad y latencia sí están documentados:

| Prueba | Resultado |
|---|---|
| Error relativo de `image_embed` frente a PyTorch fp32 (CPU, hasta `set_image`) | ≤ 5,3e-6 |
| Coincidencia de máscaras por clic y por caja frente a PyTorch fp32 (CPU) | IoU 1,0000; Δ del IoU predicho ≤ 1e-5 |
| IoU de máscara con pesos y activaciones fp16 en GPU frente a PyTorch fp32 | ≥ 0,9996 en prompts de tamaño de objeto |
| Imágenes de validación de la paridad | 1024² con sombreado plano, copia de 1024² con leyenda, página sintética de 1200×800 |
| Clic en la barriga de un zorro de dibujo animado (vs EdgeTAM) | IoU 0,968 frente a 0,008 |
| Clic en un cuadrado pequeño de una página gris | Selecciona solo ese cuadrado; EdgeTAM añade además un cuadrado de la esquina |
| Codificación de una imagen 1024² (M5 Max) | ~0,1 s en caliente |
| Prompt adicional sobre la misma imagen ya codificada | 11-18 ms |
| Footprint del proceso (M5 Max) | 2,4-2,8 GB |

## Requisitos de hardware

- Al ser una conversión MLX, la inferencia requiere Apple Silicon (serie M). No funciona sobre CUDA ni sobre GPU de otros fabricantes en este formato.
- Peso del modelo: 38,5 M de parámetros en fp16, aproximadamente 77 MB de pesos, sobre un repositorio de 0,1 GB.
- Consumo medido del proceso: 2,4-2,8 GB de `phys_footprint` en un M5 Max durante la codificación a 1024². Con esa cifra, un Mac con 8 GB de memoria unificada debería ser suficiente en la práctica, aunque no se documenta una prueba en ese mínimo.
- GPU recomendadas: cualquier chip de la familia M de Apple; los datos publicados corresponden a un M5 Max (codificación ~0,1 s, 11-18 ms por prompt adicional). No se han publicado cifras para M1, M2, M3 o M4.
- Para uso en NVIDIA o en servidores x86 conviene recurrir al checkpoint original `facebook/sam2.1-hiera-small` en PyTorch, no a esta conversión.
- Opciones de despliegue: paquete Swift `mlx-edgetam-swift` (a partir de la versión 0.6.0) con detección automática de la variante Hiera a partir de los pesos; `SAM21Package` de MLXEngine (módulo `MLXEdgeTAM`) con `mode: softMatte`; y, en general, el ecosistema MLX.
- vLLM, llama.cpp, Ollama y TGI no aplican a este modelo, ya que no es un modelo generativo de texto.
- Latencia y throughput: no se documentan métricas de throughput por lotes; solo la latencia por imagen y por prompt indicada arriba, medida con la imagen ya codificada.

## Comparativa con modelos similares

| Modelo | Parametros | Modo | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mlx-community/SAM2.1-hiera-small-fp16 | 38,5 M | Solo imagen | Puntos y cajas; hasta 1024×1024 | Apache-2.0 (pesos), MIT (port) | MLX / Apple Silicon |
| mlx-community/EdgeTAM-fp16 | 13,9 M | Imagen y vídeo | Indicaciones de segmentación | no disponible en la información proporcionada | MLX / Apple Silicon |
| facebook/sam2.1-hiera-small | 38,5 M (mismo checkpoint de origen) | Imagen y vídeo (SAM 2.1 completo) | Puntos, cajas y memoria temporal | Apache-2.0 | PyTorch, formato original |
| Otras variantes de la familia SAM 2.1 (Hiera-Base+, Hiera-Large) | no disponible en la información proporcionada | Imagen y vídeo | Puntos y cajas | Apache-2.0 | PyTorch |

En la práctica, la elección entre este modelo y EdgeTAM responde a un compromiso: EdgeTAM es más pequeño y rápido, y además maneja vídeo, pero en clics únicos sobre imágenes de color plano o sintéticas SAM 2.1-S es claramente superior (0,968 frente a 0,008 de IoU en el ejemplo del zorro).

## Limitaciones y advertencias

- Solo modo imagen: al no incluir la pila de memoria de vídeo, no puede segmentar secuencias ni mantener la identidad de un objeto entre fotogramas. Para vídeo hay que usar el SAM 2.1 original o EdgeTAM.
- No es un modelo de lenguaje: no genera texto, no razona, no admite tool calling ni agentes, y no tiene comportamiento multilingüe que evaluar.
- Sesgos y errores propios de los modelos de segmentación entrenados con datos a gran escala: rendimiento desigual en dominios alejados de la distribución de entrenamiento (imagen médica, microscopía, imágenes aéreas muy específicas) y posible fusión o fragmentación incorrecta de objetos con poco contraste.
- Riesgo de máscaras espurias: la propia model card documenta que EdgeTAM añade un cuadrado de esquina inexistente en páginas grises; aunque SAM 2.1-S se comporta mejor en ese caso, la posibilidad de incluir regiones no pedidas no puede descartarse en entradas atípicas.
- La calidad es la de la variante Small: en objetos finos, oclusiones complejas o imágenes naturales densas, las variantes Base+ y Large del mismo SAM 2.1 ofrecen mejor precisión, a costa de más cómputo.
- Las salidas en fp16 no son idénticas a las de fp32: el IoU frente a la referencia es mayor o igual a 0,9996, no 1,0000. Si un flujo de trabajo exige paridad estricta, hay que usar fp32.
- Licencia Apache-2.0 en los pesos, apta para uso comercial, con el enlace de licencia apuntando al fichero LICENSE de facebookresearch/sam2. El código del port es MIT. Conviene verificar los términos del repositorio upstream antes de redistribuir.
- Adopción nula registrada: 0 descargas y 0 likes en el momento de la consulta, y metadatos con fecha de creación de 2026-09-23, lo que indica que no hay validación comunitaria ni casos de producción documentados.
- Dependencia de plataforma: al ser una conversión MLX, queda atada a Apple Silicon; no hay pesos GGUF ni ONNX en este repositorio para otros entornos.
- El rendimiento declarado se midió en un M5 Max; en máquinas con menos memoria unificada o chips anteriores la latencia y el footprint pueden ser peores y no están documentados.

## Enlaces

- [Modelo en HuggingFace: mlx-community/SAM2.1-hiera-small-fp16](https://huggingface.co/mlx-community/SAM2.1-hiera-small-fp16)
- [Modelo base: facebook/sam2.1-hiera-small](https://huggingface.co/facebook/sam2.1-hiera-small)
- [Repositorio oficial de SAM 2 en GitHub](https://github.com/facebookresearch/sam2)
- [Licencia de SAM 2 (facebookresearch/sam2)](https://github.com/facebookresearch/sam2/blob/main/LICENSE)
- [Paquete Swift mlx-edgetam-swift](https://github.com/xocialize/mlx-edgetam-swift)
- [Modelo comparado: mlx-community/EdgeTAM-fp16](https://huggingface.co/mlx-community/EdgeTAM-fp16)

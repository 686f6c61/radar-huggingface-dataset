# edgetools/migan

## Resumen

MI-GAN (ONNX) es un export a ONNX del modelo MI-GAN, una red generativa adversaria (GAN) para *inpainting* de imágenes, es decir, para borrar un objeto delimitado por una máscara y rellenar el hueco con contenido sintetizado coherente. El algoritmo original procede de MI-GAN: A Simple Baseline for Image Inpainting on Mobile Devices (Sargsyan et al., ICCV 2023), desarrollado por Picsart AI Research, y sus pesos y código se publican bajo licencia MIT.

El repositorio `edgetools/migan` no es el repositorio oficial, sino un espejo literal (verbatim) del archivo `migan_pipeline_v2.onnx` del repositorio `andraniksargsyan/migan`. Se aloja como copia única, inmutable y con CORS habilitado para dar servicio a la herramienta "Remove Object" de Edge Tools. La variante "pipeline" recibe la imagen a resolución completa más la máscara y devuelve el resultado ya compuesto, por lo que no requiere pasos externos de redimensionado antes ni después de la inferencia.

Su relevancia práctica está en el despliegue: al ser un grafo ONNX con dimensiones dinámicas, se ejecuta íntegramente en el lado del cliente mediante `onnxruntime-web` sobre los *execution providers* WASM (CPU) o WebGPU, lo que permite eliminar objetos de una imagen sin enviarla a un servidor. El repositorio tiene 0 descargas y 0 *likes* y un tamaño declarado de 0.0 GB en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GAN de inpainting orientada a dispositivos moviles (MI-GAN); detalles internos del generador no disponibles en la informacion proporcionada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada de imagen con altura (H) y anchura (W) dinamicas |
| Tipos de cuantizacion | no disponible (el repositorio distribuye un unico archivo ONNX sin variantes cuantizadas documentadas) |
| Idiomas soportados | no aplica (modelo de vision, no procesa texto) |
| Licencia | MIT (© 2024 Picsart AI Research; LICENSE incluida en el repositorio) |
| Formato de pesos | ONNX (`migan_pipeline_v2.onnx`) |
| Entradas | `image` uint8 `[1, 3, H, W]`; `mask` uint8 `[1, 1, H, W]`, en formato RGB y canales primero (CHW) |
| Salida | `result` uint8 `[1, 3, H, W]`, imagen ya compuesta a la resolucion de entrada |
| Polaridad de la mascara | 0 = borrar (agujero), 255 = conservar |
| Libreria / runtime | onnxruntime-web (WASM o WebGPU) |
| Pipeline declarado | image-to-image |

## Arquitectura y entrenamiento

MI-GAN se presenta en el articulo como una *baseline* simple para inpainting orientada a dispositivos móviles (ICCV 2023), con código y pesos liberados bajo MIT por Picsart AI Research. La información proporcionada no detalla la topología exacta del generador ni del discriminador, el número de parámetros, la composición del dataset de entrenamiento, el número de tokens o imágenes vistas, ni si se emplearon etapas de ajuste tipo RLHF/DPO (no aplicables en un modelo generativo de imagen de este tipo). Todos esos datos deben considerarse no disponibles en esta ficha.

La innovación relevante en el artefacto distribuido es el propio export a ONNX y su empaquetado como *pipeline*: a diferencia de un export "de red" que exige redimensionar la imagen y la máscara a una resolución fija y recomponer después, `migan_pipeline_v2.onnx` acepta `H` y `W` dinámicas, ejecuta el redimensionado interno del grafo y devuelve la imagen final ya compuesta. Esto elimina lógica de preprocesado y postprocesado en el cliente, reduce el riesgo de desalineación entre máscara e imagen y facilita la integración en navegador con `onnxruntime-web` sobre WASM o WebGPU.

## Capacidades

- Inpainting de imágenes: recibe una imagen RGB y una máscara binaria y devuelve la región enmascarada rellenada, con el resto de la imagen conservado.
- Eliminación de objetos (*object removal*): la máscara marca con 0 la zona a borrar y con 255 la zona a preservar.
- Resolución dinámica: `H` y `W` son dims dinámicas del grafo, que ajusta internamente el tamaño, por lo que admite imágenes de distintas proporciones y resoluciones.
- Composición integrada: la salida ya está compuesta a la resolución de entrada, sin necesidad de pegado manual del parche generado.
- Inferencia en el cliente: ejecutable en navegador mediante `onnxruntime-web` con *execution providers* WASM (CPU) o WebGPU, sin backend dedicado.
- E/S tipadas: entrada y salida en `uint8`, canales primero (CHW), lo que simplifica el transporte de tensores desde canvas o ImageBitmap.
- No soporta *tool calling* ni *function calling*: es un modelo de visión puro sin interfaz de texto.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües, de texto, audio ni modo *thinking*.
- No incluye detección de objetos: la máscara debe generarla el usuario o un componente externo.

## Casos de uso

- Eliminación de objetos en el navegador: es el caso de uso para el que se publica este espejo. La herramienta "Remove Object" de Edge Tools carga el ONNX desde un CDN con CORS y ejecuta la inferencia en el cliente con WebGPU o WASM, de modo que la imagen del usuario nunca abandona su dispositivo.
- Edición fotográfica en aplicaciones móviles: al estar diseñado para dispositivos móviles, encaja en apps de retoque que necesitan borrar elementos (una farola, un viandante, un cable) sin conexión a red ni coste de GPU en servidor.
- Herramientas de edición tipo Photopea o editor web: el tamaño reducido del artefacto y la ausencia de pasos de redimensionado permiten integrarlo detrás de un botón de "borrar selección" con respuesta casi inmediata a la resolución original.
- Limpieza de catálogos de producto en comercio electrónico: eliminar objetos no deseados o elementos de atrezzo de fotografías de producto antes de publicarlas, procesando lotes de imágenes en local y evitando subir material comercial a terceros.
- Preparación de datasets de visión por computador: borrar logotipos, marcas de agua o elementos identificativos de imágenes de entrenamiento, reduciendo el riesgo de que un modelo aprenda atajos espurios ligados a esos elementos.
- Retoque inmobiliario: retirar muebles, carteles o elementos temporales de fotografías de inmuebles para homogeneizar el material de un anuncio, manteniendo la geometría de la estancia intacta.
- Restauración de fotografías y documentos escaneados: rellenar arañazos, manchas o sellos digitalizados definiendo la máscara sobre la zona dañada, en un flujo de trabajo totalmente offline y sin coste por inferencia.
- Anonimización de contenido sensible en preprocesado: una vez detectada la región (matrícula, rostro, documento), rellenar la zona con contenido sintético en lugar de un rectángulo negro, si el contexto visual debe mantenerse creíble.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La *model card* del repositorio no incluye métricas (FID, PSNR, SSIM, LPIPS u otras) ni comparaciones numéricas frente a otros métodos de inpainting; el artículo de ICCV 2023 citado es la fuente donde deberían consultarse, pero sus cifras no forman parte de la información proporcionada en esta búsqueda.

## Requisitos de hardware

- VRAM estimada: no disponible. No se documenta el número de parámetros ni el peso del archivo en el momento de la consulta (tamaño de repositorio declarado: 0.0 GB).
- Perfil de despliegue objetivo: el propio artículo lo define como una *baseline* de inpainting para dispositivos móviles, por lo que el consumo está pensado para ser reducido frente a alternativas de difusión.
- GPU de servidor (A100, H100, RTX 4090): no se aportan cifras de requisitos ni de ocupación de memoria para estos aceleradores; el modelo puede ejecutarse sobre ellos vía `onnxruntime-gpu`, pero no es su objetivo declarado.
- GPU de consumo: al emplear el *execution provider* WebGPU de `onnxruntime-web`, puede ejecutarse en cualquier GPU compatible con WebGPU, incluidas gráficas integradas de portátiles y GPU de móviles compatibles con el navegador.
- CPU: existe un *execution provider* WASM que permite inferencia sin GPU dentro del navegador, con la penalización de latencia esperable.
- Opciones de despliegue: `onnxruntime-web` (WASM y WebGPU) en navegador; `onnxruntime` en Python o C++ para uso en servidor o escritorio. No aplican vLLM, TGI, llama.cpp ni Ollama, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dependen del *execution provider*, del tamaño de la imagen y del hardware del cliente, y no se publican medidas en la información proporcionada.

## Comparativa con modelos similares

Los datos de los modelos alternativos no proceden de la informacion proporcionada en esta busqueda y deben verificarse en sus repositorios oficiales.

| Modelo | Enfoque | Parametros | Resolucion | Licencia | Disponibilidad y despliegue |
|---|---|---|---|---|---|
| MI-GAN (este repositorio) | GAN de inpainting orientada a movil | no disponible | Dinamica (H x W) | MIT | ONNX con salida compuesta; ejecucion en navegador via onnxruntime-web (WASM/WebGPU) |
| LaMa | Inpainting con convoluciones de Fourier, orientado a mascaras grandes | no disponible | no disponible | no disponible en esta busqueda | Pesos publicos fuera de este repositorio; requiere runtime propio de PyTorch |
| MAT (Mask-Aware Transformer) | Transformer con atencion consciente de mascara | no disponible | no disponible | no disponible en esta busqueda | Pesos publicos fuera de este repositorio; coste de inferencia superior |
| Modelos de difusion de inpainting (por ejemplo, variantes de Stable Diffusion para inpainting) | Difusion latente guiada por mascara | no disponible | no disponible | no disponible en esta busqueda | Mayor calidad potencial en escenas complejas, pero coste de computo muy superior y dificil ejecucion en movil |

La diferencia cualitativa que sí se desprende de la documentación es el objetivo de diseño: MI-GAN busca una *baseline* simple y ejecutable en dispositivos móviles, con la variante aquí publicada optimizada para ejecución en navegador sin pasos de redimensionado externos.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información proporcionada. Al ser un modelo entrenado con datos no descritos, puede reproducir sesgos de su dataset de entrenamiento, especialmente en texturas, tonos de piel o materiales poco representados.
- Riesgo de artefactos y contenido inventado: el inpainting genera píxeles plausibles pero no reales. En regiones grandes, con estructuras repetitivas o con iluminación compleja, pueden aparecer bordes borrosos, texturas incoherentes o continuidad incorrecta de líneas y perspectivas.
- Dependencia de la máscara: el modelo no detecta objetos por sí mismo. La calidad del resultado depende críticamente de que la máscara cubra el objeto completo con margen suficiente; una máscara imprecisa deja restos visibles o borra zonas que debían conservarse.
- Restricción de polaridad: un error en la polaridad de la máscara (0 = borrar, 255 = conservar) invierte por completo el resultado, borrando el fondo y conservando el objeto.
- Entrada y salida: solo RGB en `uint8` y canales primero (CHW). No hay soporte documentado de canal alfa, imágenes en otros espacios de color ni lotes de tamaño mayor que 1.
- Sin metadatos de rendimiento: al no publicarse parámetros, tamaño del artefacto ni métricas, no es posible estimar a priori el coste de memoria ni comparar calidad con alternativas sin medirlo uno mismo.
- Limitaciones de contexto e idioma: no aplica en el sentido de texto, pero la resolución efectiva puede verse degradada por el redimensionado interno del grafo si se trabaja con imágenes muy grandes, y no hay garantía documentada de calidad a resoluciones altas.
- Licencia: MIT permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de copyright (© 2024 Picsart AI Research) y el texto de la licencia. Conviene revisar igualmente los términos del artículo y de los pesos originales de Picsart AI Research.
- Repositorio espejo: `edgetools/migan` es una copia verbatim y no el repositorio de referencia (0 descargas, 0 *likes*). Para correcciones, versiones nuevas o soporte, la fuente autoritativa es `andraniksargsyan/migan`, y la fuente algorítmica es el repositorio de Picsart AI Research.
- Uso responsable: la eliminación de objetos puede emplearse para manipular evidencia visual, ocultar marcas de agua o alterar documentos. Es responsabilidad del integrador añadir políticas de uso y, cuando proceda, marcas de contenido editado.

## Enlaces

- Repositorio de este espejo: https://huggingface.co/edgetools/migan
- Export ONNX de referencia: https://huggingface.co/andraniksargsyan/migan
- Codigo y pesos originales de MI-GAN (Picsart AI Research): https://github.com/Picsart-AI-Research/MI-GAN
- Articulo: MI-GAN: A Simple Baseline for Image Inpainting on Mobile Devices (Sargsyan et al., ICCV 2023)

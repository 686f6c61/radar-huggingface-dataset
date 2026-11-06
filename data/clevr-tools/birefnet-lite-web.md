# clevr-tools/birefnet-lite-web

## Resumen

birefnet-lite-web es una exportación a ONNX de BiRefNet_lite, el modelo ligero de segmentación dicotómica de imágenes (DIS) desarrollado por Peng Zheng y colaboradores, empaquetado por clevr-tools para ejecutarse íntegramente dentro de un navegador web mediante onnxruntime-web, con soporte para WebGPU y WebAssembly como alternativa. No se ha reentrenado ni ajustado ningún peso: el modelo base es ZhengPeng7/BiRefNet_lite y la aportación del autor del repositorio es puramente de ingeniería de despliegue.

El problema que resuelve es concreto: la exportación estándar de BiRefNet a ONNX no es ejecutable en un navegador, porque convierte cada convolución deformable en operaciones GatherND sobre tensores de unos 822 MB que exceden la memoria disponible, y porque los operadores Split del decodificador superan el límite de buffers de almacenamiento por shader stage de WebGPU en Chrome (10 buffers). Este repositorio reescribe ambos aspectos y publica dos variantes con entrada estática: 768×768 para WebGPU y 512×512 para el fallback WASM.

Es relevante para desarrolladores que necesitan eliminación de fondo o matting en el cliente, sin enviar imágenes a un servidor: el modelo pesa unos 100 MB por variante (pesos almacenados en float16 y convertidos a float32 en carga) y logra un IoU medio de 0,9556 (768) y 0,9438 (512) sobre una muestra fija de 96 imágenes, con la aritmética en float32. La licencia es MIT, la misma que el modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiRefNet (segmentación dicotómica de imágenes de alta resolución con referencia bilateral); backbone y decodificador transformer con convoluciones deformables |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen fija 1×3×768×768 o 1×3×512×512) |
| Tipos de cuantizacion | almacenamiento de pesos en float16 con conversión a float32 en carga; aritmética en float32. No se publica una conversión completa a float16 (no cargaba en onnxruntime-web) |
| Idiomas soportados | no aplica (modelo de segmentación de imágenes; sin procesamiento de texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (dos ficheros: `birefnet_lite_768_fp16w.onnx` de 104.329.641 bytes y `birefnet_lite_512_fp16w.onnx` de 101.066.931 bytes) |

## Arquitectura y entrenamiento

La arquitectura subyacente es BiRefNet, presentada en el artículo *Bilateral Reference for High-Resolution Dichotomous Image Segmentation* (CAAI Artificial Intelligence Research, 2024, arXiv:2401.03407) por Peng Zheng, Dehong Gao, Deng-Ping Fan, Li Liu, Jorma Laaksonen, Wanli Ouyang y Nicu Sebe. Es un modelo de segmentación binaria de alta resolución que produce una matte alfa (logits 1×1×S×S, con sigmoid para obtener valores en 0..1). La variante _lite_ es la versión reducida del modelo, y en este repositorio no se ha reentrenado ni ajustado: los pesos son los de ZhengPeng7/BiRefNet_lite sin modificar. No se dispone de datos sobre el número de tokens, la composición del dataset de entrenamiento ni si hubo RLHF o DPO, porque es un modelo de visión y la model card no los detalla.

Las modificaciones técnicas del export son cuatro. Primero, la convolución deformable se recalcula en trozos, posición de kernel a posición de kernel: muestreo bilineal de la entrada en los offsets aprendidos mediante cuatro `Gather` planos con máscaras de validez, multiplicación por la máscara de modulación, convolución 1×1 con el peso de esa posición y acumulación; el resultado coincide con `deform_conv2d` de torchvision con un error de aproximadamente 1e-5 y batch size 1. Segundo, los operadores `Split` del decodificador se reagrupan en un split grueso seguido de splits de 8 vías (66 splits con 8 a 32 salidas superaban el límite de 10 storage buffers por shader stage de WebGPU en Chrome sobre Mac), con salida bit a bit idéntica. Tercero, los tamaños de entrada son estáticos, de ahí las dos exportaciones separadas. Cuarto, los pesos float32 se almacenan como float16 y se convierten a float32 al cargar, lo que reduce a la mitad la descarga sin cambiar la aritmética; además, el grafo se optimizó una vez con ONNX Runtime en nivel `basic`, lo que reduce el número de nodos de unos 62.800 a 27.500 y acorta la creación de sesión.

## Capacidades

- Segmentación dicotómica de imágenes: genera una matte alfa de primer plano sobre fondo para una imagen de entrada.
- Eliminación de fondo en el navegador: inferencia local con onnxruntime-web, sin llamadas a servidor.
- Ejecución en WebGPU (variante 768) y en WebAssembly como fallback (variante 512).
- Salida de logits 1×1×S×S; el consumidor aplica sigmoid para obtener la matte en el rango 0..1.
- Preprocesado definido: píxeles divididos por 255 y normalizados con media [0.485, 0.456, 0.406] y desviación [0.229, 0.224, 0.225]; la imagen se redimensiona a S×S sin relleno de relación de aspecto y la matte se reescala a la resolución original.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües: es un modelo puramente visual de una sola pasada.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Eliminación de fondo en herramientas web: es el uso para el que se publicó, ya que alimenta el removedor de fondo de clevr.tools ejecutándose en el navegador del usuario con WebGPU o WASM, sin subir la imagen a ningún servidor.
- Editor de imágenes o fotografía en el cliente: permite recortar sujetos y generar máscaras alfa en aplicaciones web de retoque, con la ventaja de que la imagen nunca sale del dispositivo.
- Generación de avatares y fotos de producto: la matte permite componer el sujeto sobre fondos nuevos en flujos de e-commerce o creación de perfiles, con la variante 768 para mayor calidad y la 512 como respaldo en equipos sin WebGPU.
- Procesamiento por lotes en el navegador: al ser un modelo de ~100 MB y una sola pasada por imagen, se puede aplicar a colecciones de fotos desde una aplicación web sin coste de infraestructura de inferencia.
- Integración en extensiones o aplicaciones de escritorio basadas en web: al ser ONNX con entrada estática, se puede cargar en cualquier runtime compatible con ONNX (onnxruntime-web, ONNX Runtime nativo) para escritorio o electrón.
- Verificación de integridad en producción: los checksums SHA-256 están en `lib/bgremove/manifest.json` del repositorio de clevr.tools, lo que permite validar los ficheros antes de usarlos en un pipeline de despliegue.
- Segmentación de sujetos en imágenes de personas y objetos: la validación cubre 8 fotos de cada una de las 6 categorías de objetos de AIM-500 y 20 retratos de cada uno de los dos conjuntos de P3M-500, por lo que el caso de retrato y objeto está directamente evaluado.

## Benchmarks y rendimiento

Los datos publicados se midieron con ONNX Runtime en CPU sobre un Apple M4, con una muestra fija de 96 imágenes (8 fotos de cada una de las 6 categorías de objetos de AIM-500 más 20 retratos de cada uno de los dos conjuntos de P3M-500). La métrica es el IoU medio contra la matte alfa de referencia con umbral 0,5. "Refinada" significa que la matte se reescaló al tamaño de la foto y se pasó por un filtro guiado sobre la foto; ese paso vive en la aplicación de clevr.tools, no en estos ficheros.

| Variante | IoU medio, bruta | IoU medio, refinada | Fotos con IoU < 0,5 |
|---|---|---|---|
| Export estándar de BiRefNet_lite, 1024 | 0,9606 | no medida | no medida |
| Convolución deformable en trozos, 1024 (fp32) | 0,9605 | 0,9699 | 0 de 96 |
| 768 (publicada para WebGPU) | 0,9556 | 0,9651 | 0 de 96 |
| 512 (publicada para WASM) | 0,9438 | 0,9540 | 2 brutas, 1 refinada de 96 |

Comprobaciones de neutralidad de los otros cambios, ambas a 768: el almacenamiento de pesos en float16 dio 0,95561 bruta y 0,96506 refinada, idéntico al fp32 hasta cinco decimales; el grafo optimizado en nivel `basic` dio 0,96506 refinada, también idéntico, con 0 de 96 fallos. La variante 512 se comprobó del mismo modo (0,9540 refinada, 1 de 96). Puntos débiles medidos: cristal y objetos transparentes, donde las 8 imágenes "transparent" de la muestra puntuaron 0,754 (768, refinada) y 0,692 (768, bruta); también cabello fino sobre fondos con mucho detalle y objetos de color próximo al fondo. El autor indica que son propiedades del modelo base sobre estos conjuntos, no de la conversión. Los tiempos de inferencia en navegador (Chrome sobre Mac, M4) se remiten a las notas de benchmark de clevr.tools y no se reclaman cifras para otros dispositivos.

## Requisitos de hardware

- Tamaño en disco: 104.329.641 bytes (768) y 101.066.931 bytes (512), aproximadamente 0,2 GB el repositorio completo.
- VRAM estimada: no disponible de forma explícita; los pesos se almacenan en float16 y se convierten a float32 al cargar, y el grafo optimizado tiene unos 27.500 nodos.
- GPU recomendadas: no se publican recomendaciones; la variante 768 está pensada para WebGPU y la 512 para el fallback WASM.
- Cabe en GPU de consumo: sí, por tamaño de pesos, aunque el autor solo documenta ejecución en navegador con onnxruntime-web y mediciones en CPU sobre Apple M4; no se aportan cifras para A100, H100 o RTX 4090.
- Opciones de despliegue: onnxruntime-web con execution provider `webgpu` o WASM; al ser ONNX estándar, también es cargable en ONNX Runtime nativo, aunque el autor no lo documenta.
- Latencia y throughput: no disponibles; los tiempos de navegador se remiten a las notas de benchmark de clevr.tools y no se reclaman para otros dispositivos.
- Restricción de despliegue relevante: en WebGPU de Chrome sobre Mac solo hay 10 storage buffers por shader stage, motivo por el que se reescribieron los `Split`; una conversión completa a float16 no cargaba en onnxruntime-web.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Contexto / salida | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| birefnet-lite-web (este) | no disponible | 768×768 o 512×512 fija | matte 1×1×S×S | MIT | ONNX | Optimizado para navegador; IoU 0,9556 (768) y 0,9438 (512) |
| BiRefNet_lite (ZhengPeng7) | no disponible | 1024×1024 | matte alfa | MIT | safetensors / PyTorch | Modelo base; export estándar a ONNX no ejecutable en navegador; IoU 0,9606 bruto a 1024 |
| BiRefNet (completo, ZhengPeng7) | no disponible | alta resolución | matte alfa | MIT | safetensors / PyTorch | Variante completa del mismo artículo; no se dispone de métricas comparativas en la información proporcionada |
| Alternativas de eliminación de fondo en navegador | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de otros modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- Objetos transparentes o de cristal: rendimiento claramente inferior, con IoU de 0,754 (768, refinada) y 0,692 (768, bruta) en las 8 imágenes "transparent" de la muestra.
- Cabello fino sobre fondos con mucho detalle y objetos de color próximo al fondo: casos más difíciles según el autor, atribuidos al modelo base.
- La variante 512 presenta 2 fotos brutas (1 refinada) de 96 con IoU por debajo de 0,5; la 768 no presenta ninguna.
- Entrada estática: no admite resolución arbitraria; hay que redimensionar a 768×768 o 512×512 sin relleno de relación de aspecto y reescalar la matte de vuelta, lo que puede introducir distorsión geométrica.
- Batch size fijo de 1 en la convolución deformable en trozos.
- La conversión completa a float16 no carga en onnxruntime-web; solo se usa float16 para almacenar pesos.
- Dependencia de las capacidades del navegador: WebGPU en Chrome sobre Mac limita a 10 storage buffers por shader stage, y el rendimiento en otros dispositivos no está verificado por el autor.
- Sesgos y riesgo de alucinación: no se documentan sesgos específicos; al ser un modelo de segmentación, el fallo se manifiesta como máscaras incorrectas, no como texto inventado.
- Licencia MIT, sin restricciones documentadas para uso comercial; se pide citar el artículo original si se usan los ficheros.
- Los checksums SHA-256 están en el repositorio de clevr.tools; conviene verificarlos antes de usar los ficheros en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/clevr-tools/birefnet-lite-web
- Modelo base: https://huggingface.co/ZhengPeng7/BiRefNet_lite
- Repositorio original de BiRefNet: https://github.com/ZhengPeng7/BiRefNet
- Artículo (arXiv): https://arxiv.org/abs/2401.03407
- Repositorio de clevr.tools: https://github.com/grayleopard/clevr-tools
- Código del export y benchmarks: https://github.com/grayleopard/clevr-tools/tree/main/bench/background-removal
- Herramienta de eliminación de fondo: https://www.clevr.tools/tools/background-remover
- onnxruntime-web: https://www.npmjs.com/package/onnxruntime-web
- Dataset AIM-500: https://github.com/JizhiziLi/AIM
- Dataset P3M-500: https://github.com/JizhiziLi/P3M

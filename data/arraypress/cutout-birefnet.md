# arraypress/cutout-birefnet

## Resumen

cutout-birefnet es la exportación del modelo BiRefNet general de ZhengPeng7 al formato `.aimodel` de Apple Core AI, empaquetada por arraypress para su uso en macOS 27 sobre Apple silicon. BiRefNet (Bilateral Reference for High-Resolution Dichotomous Image Segmentation, Zheng, Gao, Fan, Liu, Laaksonen, Ouyang y Sebe, CAAI Artificial Intelligence Research, 2024) es una red de segmentación dicótoma de alta resolución cuyo cometido es la eliminación de fondo: recibe una fotografía y devuelve una máscara alfa suave del sujeto principal (un producto, una planta, un vaso, un animal o una persona).

El problema que resuelve esta ficha concreta es el de ejecutar esa eliminación de fondo en el dispositivo, sin depender de la API de Apple Vision y sin enviar la imagen a un servidor. El repositorio no contiene pesos en safetensors ni GGUF, sino un asset compilable de Core AI de 463 MB con pesos y aritmética en float16, con entrada `image` de `[1,3,1024,1024]` float32 en RGB 0…1 y salida `alpha` de `[1,1,1024,1024]` float32 en 0…1. La normalización ImageNet y la sigmoide están embebidas en el propio asset.

Es relevante ahora porque forma parte de la cadena de herramientas de arraypress: es lo que emplean el binario `cutout` (para `--subject` y `--person`) y la librería `swift-object-cutout`, que se descargan este repositorio automáticamente anclado a un commit con verificación de hash. La model card reporta una calidad de matting claramente superior a la máscara de sujeto integrada de Apple Vision en tres conjuntos de AIM-500, a un coste de aproximadamente 0,9 s por inferencia de 1024² en un M3 Max.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiRefNet (segmentación dicótoma de alta resolución); transformer con decoder que emplea convolución deformable, según la model card. Detalle del backbone no disponible |
| Parametros totales | no disponible (no declarado en la model card) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica; entrada de imagen fija redimensionada a 1024x1024 |
| Tipos de cuantizacion | float16 (pesos y aritmética, export principal de 463 MB); float32 (export alternativo) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la entrada es una imagen) |
| Licencia | MIT (copyright de los autores originales) |
| Formato de pesos | `.aimodel` de Apple Core AI (`cutout-birefnet-float16.aimodel`), no safetensors ni GGUF |
| Resolucion de entrada | 1024x1024, redimensionado sin preservar la relación de aspecto |
| Salida | máscara alfa `[1,1,1024,1024]` float32 en 0…1, reescalada bilinealmente al tamaño original |
| Tamano del asset | 463 MB (copia compilada de 553 MB en caché) |
| Modelo base | ZhengPeng7/BiRefNet |
| Versionado del repositorio | 0.5 GB; creado y actualizado el 2026-10-16 |

## Arquitectura y entrenamiento

BiRefNet es una red de segmentación dicótoma de alta resolución basada en transformer cuya innovación principal es la referencia bilateral: el modelo combina señales de la imagen y de una representación de referencia para refinar la frontera del sujeto. En esta exportación, el detalle crítico es que Core AI no dispone de convolución deformable, que el decoder de BiRefNet utiliza. La reescritura calcula esa operación desde su definición: para cada tap del kernel se realiza un muestreo bilineal del mapa de características (cuatro gathers sobre una copia con padding de ceros), escalado por el modulador, seguido de un producto matricial con los pesos de ese tap y suma sobre todos los taps. Las posiciones de muestreo permanecen en float32 incluso en el export float16. Frente al código original de los autores en float32 sobre CPU, la reescritura difiere como máximo en 4,6 × 10⁻⁶ en el alfa.

Sobre los datos de entrenamiento, la model card indica que los conjuntos usados por el checkpoint original son DIS5K, DUTS, HRSOD, UHRSD, HRS10K, P3M-10k y un conjunto de humanos. La evaluación de calidad se realizó sobre AIM-500 (Li et al., 2021), que no forma parte del entrenamiento, con 100 objetos (plantas, muebles, juguetes, fruta, cristal), 100 animales y 100 retratos, a su tamaño nativo de hasta 1920 px. No se documenta en la información disponible si hubo RLHF/DPO (no aplica a esta tarea) ni el número de tokens o imágenes de entrenamiento. La conversión se realizó con coreai-torch 0.4.3, coreai-core 1.0.0b3, torch 2.9.0 y transformers 4.57.1.

## Capacidades

- Eliminación de fondo: dada una fotografía, devuelve una máscara alfa suave del sujeto principal, apta para matting de pelo y pelaje en la banda de borde.
- Segmentación de sujeto genérico (`--subject`): objetos como plantas, muebles, juguetes, fruta y cristal.
- Segmentación de personas (`--person`): retratos y figuras humanas.
- Matting de bordes finos: la model card reporta MSE de banda de borde de 12,6 (objetos), 9,4 (animales) y 6,7 (retratos) ×10³, frente a 92,5, 47,7 y 36,0 de Apple Vision.
- Procesamiento por lotes con carga única del modelo: el CLI `cutout` permite procesar carpetas enteras (`cutout ./shots --out ./cut`).
- Ejecución totalmente en dispositivo mediante Core AI sobre Apple silicon, sin llamadas de red tras la descarga inicial.
- Integración programática vía `swift-object-cutout` y variable de entorno `$CUTOUT_SUBJECT_MODEL`.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes, razonamiento multi-paso, ni generación de texto.
- No soporta entrada de audio, vídeo ni texto; únicamente imagen RGB.

## Casos de uso

- Eliminación de fondo en fotografía de producto: dado que el modelo alcanza SAD 23,40 e IoU 0,919 en el conjunto de objetos de AIM-500, es adecuado para recortar productos de e-commerce, aunque el cristal sigue siendo la categoría más difícil (SAD 51 frente a 211 de Apple Vision).
- Edición de retratos: con SAD 4,86 e IoU 0,992 en el conjunto de retratos, sirve para separar personas del fondo en flujos de retoque y composición.
- Automatización por lotes en macOS: el CLI `cutout ./shots --out ./cut` procesa 100 fotos con el modelo cargado una sola vez, con un pico de memoria de 3,2–3,8 GB, lo que permite ejecutarlo en un portátil Apple silicon sin GPU dedicada.
- Flujos de diseño gráfico: la model card indica que la herramienta `design` lo usa para extraer un sujeto de su foto, integrándose en un pipeline de diseño que necesita la máscara y no una imagen recortada.
- Sustitución del fallback de Apple Vision: el modelo se usa como opción de mayor calidad cuando la máscara de sujeto integrada de Vision es insuficiente, manteniendo Vision como respaldo sin descarga.
- Matting de animales para catálogos o refugios: con SAD 6,12 e IoU 0,991, es apropiado para recortar mascotas y fauna donde el pelaje exige una banda de borde precisa.
- Preprocesado para otras tareas de visión: la máscara alfa resultante puede alimentar segmentación posterior, composición o generación de assets con transparencia.
- Procesamiento con privacidad estricta: al ejecutarse íntegramente en el dispositivo mediante Core AI, no requiere enviar las imágenes a servicios externos, lo que encaja en entornos con requisitos de confidencialidad.
- Herramientas de línea de comandos para desarrolladores: integrable mediante `$CUTOUT_SUBJECT_MODEL` apuntando al `.aimodel`, o descargable con `hf download arraypress/cutout-birefnet --local-dir models`.

## Benchmarks y rendimiento

Calidad de matting frente a alfa real sobre AIM-500 (conjunto no usado en entrenamiento). En todas las columnas, menor es mejor excepto IoU, donde mayor es mejor. El «borde» es la franja incierta alrededor del sujeto.

| Conjunto | Matte | SAD | MSE ×10³ | Grad | Conn | IoU | MSE banda de borde ×10³ |
|---|---|---|---|---|---|---|---|
| Objetos | Apple Vision, borde nítido | 81,39 | 33,09 | 0,690 | 82,82 | 0,802 | 92,5 |
| Objetos | este modelo | 23,40 | 3,29 | 0,211 | 22,87 | 0,919 | 12,6 |
| Animales | Apple Vision, borde nítido | 17,17 | 5,79 | 0,309 | 17,15 | 0,976 | 47,7 |
| Animales | este modelo | 6,12 | 0,99 | 0,074 | 5,50 | 0,991 | 9,4 |
| Retratos | Apple Vision, borde nítido | 24,91 | 10,63 | 0,224 | 24,45 | 0,962 | 36,0 |
| Retratos | este modelo | 4,86 | 0,62 | 0,058 | 4,19 | 0,992 | 6,7 |

Fidelidad del export frente al modelo PyTorch de los autores (float32, CPU) sobre 30 entradas a 1024²:

| Export | Diferencia media absoluta de alfa | Percentil 99,9 | Peor pixel | IoU de máscara (>0,5), peor imagen |
|---|---|---|---|---|
| float32 | 1,9 × 10⁻⁷ | 2,4 × 10⁻⁵ | 1,3 × 10⁻⁴ | 0,99996 |
| float16 (este repositorio) | 1,9 × 10⁻⁵ | 1,5 × 10⁻³ | 0,068 | 0,9985 |

De extremo a extremo (Swift, redimensionado con Core Graphics), el asset float16 obtiene SAD 23,40 frente a 23,39 en objetos y 6,12 frente a 6,10 en animales. El modelo superó a Vision por SAD en 99 de 100 objetos, los 100 animales y 99 de 100 retratos; Vision no encontró sujeto alguno en 4 de los objetos (contabilizados como máscaras vacías). Recalcular el alfa del modelo a partir del color empeoró todos los conjuntos, por lo que `cutout` pasa el alfa del modelo tal cual. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K) en la información disponible, ya que no son aplicables a un modelo de segmentación.

## Requisitos de hardware

- Plataforma obligatoria: macOS 27 con Core AI sobre Apple silicon. No hay soporte para CUDA, Linux ni Windows.
- VRAM/unificada: no disponible como VRAM de GPU discreta. En un M3 Max, una ejecución de 100 fotos alcanzó un pico de 3,2–3,8 GB de memoria, frente a 5,6 GB del export float32 y hasta 10 GB de PyTorch en MPS.
- GPU recomendadas: el modelo se probó en Apple M3 Max. No se documentan resultados en otras GPU de Apple ni en GPU discretas.
- GPU de consumo: apto para equipos Apple silicon con memoria unificada suficiente (el asset ocupa 463 MB y la copia compilada 553 MB); el requisito real es la versión de macOS y el chip, no la VRAM.
- Almacenamiento en caché: la primera carga compila el modelo para el Mac en unos 15 s y guarda una copia compilada de 553 MB en `~/Library/Caches/coreai-cache`; las cargas posteriores son rápidas.
- Opciones de despliegue: Core AI de Apple, el binario `cutout` (`cutout`, `cutout model remove subject`) y la librería `swift-object-cutout`. No hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 0,9 s por inferencia de 1024² desde Python y 0,9–1,3 s por foto de extremo a extremo a través de `cutout` (decodificación, modelo, borde y PNG). Throughput medido en M3 Max, macOS 27, GPU.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Calidad (SAD objetos / animales / retratos) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cutout-birefnet (este) | BiRefNet general exportado a Core AI, float16 | `.aimodel` | 23,40 / 6,12 / 4,86 | MIT | Apple silicon, macOS 27 |
| Apple Vision subject mask | Segmentación integrada del sistema, borde nítido | Integrado en macOS | 81,39 / 17,17 / 24,91 | Propietaria (parte de macOS) | Apple silicon, sin descarga |
| BiRefNet original | BiRefNet general, float32 | PyTorch | hasta 10 GB en MPS; misma referencia de calidad en CPU float32 | MIT | Multiplataforma (PyTorch) |
| cutout-birefnet float32 | Mismo export, precisión completa | `.aimodel` float32 | ligeramente más fiel (diferencia media 1,9 × 10⁻⁷) | MIT | Apple silicon, macOS 27 |

No se dispone de datos comparativos con otras alternativas de eliminación de fondo (por ejemplo, modelos tipo U²-Net, RMBG o SAM) en la información proporcionada.

## Limitaciones y advertencias

- Dependencia de plataforma: requiere macOS 27 (Core AI) sobre Apple silicon; no es desplegable en Linux, Windows ni aceleradores CUDA.
- Idiomas: no aplica ni está documentado; el modelo no procesa texto.
- Redimensionado con distorsión: la entrada se escala a 1024x1024 sin preservar la relación de aspecto y la máscara se estira de vuelta con muestreo bilineal, lo que puede degradar sujetos muy alargados o con geometrías extremas.
- Categoría difícil: el cristal es el caso más problemático para el modelo (SAD 51), aunque sigue superando a Apple Vision (SAD 211).
- Fallos conocidos de la referencia: Apple Vision no detectó sujeto en 4 de los 100 objetos, dato relevante si se usa como baseline.
- Riesgo de máscara incorrecta: al ser un modelo de segmentación, un fallo se traduce en una máscara errónea o incompleta; no existe mecanismo de abstención ni de estimación de confianza documentado.
- Precisión del export: el float16 introduce un peor píxel de 0,068 en alfa y un IoU mínimo de 0,9985, lo que es despreciable en la mayoría de flujos pero puede notarse en aplicaciones que exijan precisión subpíxel.
- Licencia: MIT, permite uso comercial, pero la model card remite al `LICENSE` (copyright de los autores originales) y al `NOTICE` (cambios introducidos por la exportación); conviene revisar ambos antes de redistribuir.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica poca validación por parte de terceros.
- Copia compilada en caché: la primera ejecución compila el modelo (unos 15 s) y deja 553 MB en `~/Library/Caches/coreai-cache`, un coste a tener en cuenta en despliegues masivos o contenedores efímeros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arraypress/cutout-birefnet
- Modelo base: https://huggingface.co/ZhengPeng7/BiRefNet
- Repositorio de BiRefNet (código y pesos originales, MIT): https://github.com/ZhengPeng7/BiRefNet
- CLI `cutout`: https://github.com/arraypress/swift-cutout-cli
- Librería `swift-object-cutout`: https://github.com/arraypress/swift-object-cutout
- Paper: Zheng, Gao, Fan, Liu, Laaksonen, Ouyang y Sebe, «Bilateral Reference for High-Resolution Dichotomous Image Segmentation», CAAI Artificial Intelligence Research, 2024 (URL no disponible en la información proporcionada)
- Conjunto de evaluación AIM-500 (Li et al., 2021): URL no disponible en la información proporcionada

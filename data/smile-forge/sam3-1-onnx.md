# smile-forge/sam3.1-onnx

## Resumen

SAM 3.1 para ONNX Runtime es un conjunto de grafos ONNX que porta el modelo de segmentación Segment Anything Model 3.1 (SAM 3.1) de Meta a ONNX Runtime, para ejecución en CUDA o CPU. Lo publica el usuario smile-forge dentro del proyecto Nexaflow y no entrena un modelo nuevo: reproduce fielmente los pesos oficiales `sam3.1_multiplex.pt` de Meta en seis módulos ONNX independientes (codificador de imagen, decodificador de clics, codificador de texto, codificador de ejemplos, localizador y tokenizador), con un total de 1,8 GB de repositorio.

El modelo resuelve segmentación de imágenes de tres formas: interactiva por clics o cajas (seleccionar o descartar una región del objeto), por frase en lenguaje natural ("wheel", "child in a red vest") y por ejemplos positivos y negativos de cajas. Está pensado para integrarse desde C# a través de Nexaflow y recortar objetos en fotografías y fotogramas de vídeo pausado, y es usable por cualquier aplicación que ejecute ONNX Runtime 1.31 o posterior (opset 23).

El interés actual radica en que traslada las capacidades de segmentación guiada por texto e interacción por clics de SAM 3.1 al ecosistema ONNX, con una reducción de memoria notable frente a la ejecución en fp32 (de 12,9 GB a 2,5 GB de pico en la atención del tronco) y latencias de decenas de milisegundos en GPU. No se declaran parámetros totales ni idiomas soportados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SAM 3.1 de Meta portado a grafos ONNX (codificador de imagen tipo ViT, cabeza interactiva, decodificador de máscaras, codificador de texto, codificador de geometría y localizador) |
| Parámetros totales | no disponible (derivado de `sam3.1_multiplex.pt`; el repositorio no declara el recuento) |
| Parámetros activos | no procede (no es un modelo MoE) |
| Longitud de contexto | no aplica. Entrada de texto limitada a 32 tokens BPE; imagen de 1008 × 1008 píxeles (5.184 tokens en la atención del tronco) |
| Tipos de cuantización | Grafos fp16 (`image-encoder`, `text-encoder`, `finder` con autocast fp16) y fp32 (`click-decoder`, `exemplar-encoder`). No se distribuyen cuantizaciones int8/int4 |
| Idiomas soportados | no disponible (el codificador de texto usa el vocabulario BPE `bpe_simple_vocab_16e6.txt.gz`, de estilo CLIP, orientado a inglés) |
| Licencia | sam-license (`license: other`, `license_name: sam-license`); consultar el archivo LICENSE del repositorio |
| Formato de pesos | ONNX (opset 23), compatible con ONNX Runtime 1.31 o posterior |

Desglose de módulos del repositorio:

| Carpeta | Función | Precisión | Tamaño |
|---|---|---|---|
| `image-encoder/` | Codifica la imagen una sola vez | fp16 | 929 MB |
| `click-decoder/` | Convierte clics y cajas en máscara | fp32 | 17 MB |
| `text-encoder/` | Codifica la frase | fp16 | 707 MB |
| `exemplar-encoder/` | Codifica cajas de ejemplo («así sí», «así no») | fp32 | 13 MB |
| `finder/` | Localiza todo lo que nombra una frase con sus ejemplos: puntuaciones, cajas y máscaras | fp16 (autocast) | 123 MB |
| `tokenizer/` | Vocabulario byte-pair de los autores | — | 1,4 MB |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo. El script `Build-Sam.ps1` descarga el código de Meta en un commit fijado y su `sam3.1_multiplex.pt` (copia pública verificada por hash, idéntica byte a byte al archivo de `facebook/sam3.1`), y `build_sam.py` traza cada ruta a un grafo ONNX. La arquitectura subyacente es la de SAM 3.1: un codificador de imagen tipo transformer que produce el embedding y las características de alta resolución para clics y las pirámides FPN para frases, una cabeza interactiva con decodificador de máscaras de alta resolución y sin memoria, un codificador de texto, un codificador de geometría para cajas de ejemplo y un localizador que emite 200 consultas con puntuación `sigmoid(logits) × sigmoid(presence)`.

Las innovaciones del port son de ingeniería de conversión y eficiencia. Se aplica media precisión donde residen los pesos y la memoria (el codificador de imagen y el de texto se convierten a fp16; el localizador corre bajo autocast fp16, la ruta de baja precisión de los propios autores, porque su decodificador genera embeddings sinusoidales en fp32). La atención del tronco sobre 5.184 tokens consume un pico de 12,9 GB en fp32 bajo ONNX Runtime y 2,5 GB en fp16. La ruta de clics se toma como un primer fotograma de acondicionamiento del predictor de vídeo, el codificador de ejemplos se separa para evitar secuencias vacías y se sigue la preparación de fotograma propia de SAM 3.1 (redimensionado PIL) en lugar del procesador de imagen fija (torchvision), de modo que una sola codificación sirve para ambas rutas. No se documentan datos de entrenamiento ni procesos de RLHF/DPO en la información proporcionada.

## Capacidades

- Segmentación interactiva por clics: los puntos con etiqueta 1 (sobre el objeto) y 0 (fuera) generan hasta cuatro máscaras candidatas a 288 × 288 con IoU predicho y puntuación de objeto.
- Segmentación por caja: las etiquetas 2 y 3 marcan las esquinas superior izquierda e inferior derecha de una caja envolvente.
- Segmentación guiada por frase en lenguaje natural: el codificador de texto y el localizador devuelven hasta 200 consultas con caja normalizada, máscara y puntuación; se conservan las de puntuación superior a 0,5.
- Segmentación por ejemplos: cajas de ejemplo positivas o negativas («así sí», «así no») a través del `exemplar-encoder` y del `finder`.
- Eliminación de fondo y generación de máscaras, según las etiquetas del repositorio (`background-removal`, `mask-generation`).
- Reutilización de la codificación: el mismo `embedding` y las mismas características FPN sirven para clics y frases mientras la imagen está en uso.
- Integración desde C# mediante Nexaflow y desde cualquier runtime compatible con ONNX Runtime 1.31 o posterior.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, audio ni vídeo en movimiento (solo fotogramas de vídeo pausado).

## Casos de uso

- Herramientas de edición fotográfica con recorte asistido: el usuario hace clics sobre el objeto y el modelo devuelve la máscara en 4 ms en GPU (11 ms en CPU), lo que permite iteración interactiva fluida sobre la imagen ya codificada.
- Eliminación de fondo en comercio electrónico: una frase como «zapatilla» o una caja de ejemplo aísla el producto sobre fondo neutro; el pico de 2,5 GB permite procesar lotes en una sola GPU.
- Anotación de datasets para visión por computador: la segmentación por frase y por ejemplos genera máscaras de forma semiautomática, reduciendo el etiquetado manual en pipelines de entrenamiento.
- Selección y recorte de elementos en fotogramas de vídeo pausado: el modelo opera sobre un fotograma acondicionado, adecuado para herramientas de postproducción que trabajan imagen a imagen.
- Herramientas de diseño y maquetación en .NET: Nexaflow, host de IA escrito en C#, consume los grafos ONNX y permite incrustar segmentación en aplicaciones de escritorio o servicios.
- Rotoscopia asistida en efectos visuales: la combinación de clics y ejemplos positivos/negativos ayuda a separar sujetos con pelo o bordes complejos mediante máscaras de 288 × 288 reescaladas a la resolución original.
- Procesamiento por lotes en servidor sin GPU: en una CPU de 32 hilos la codificación de imagen ronda los 7 s, viable para colas de trabajo no interactivas.
- Segmentación guiada por lenguaje en buscadores visuales o catálogos: la puntuación de cada consulta permite filtrar por umbral y ordenar resultados por relevancia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no reporta métricas sobre conjuntos estándar (MMLU, HumanEval, GSM8K u otros). Sí documenta una validación de fidelidad frente a las rutas originales de Meta: la máscara de un clic coincide con la de los autores con un IoU medio superior a 0,99, y una frase localiza los mismos objetos, con las mismas puntuaciones (hasta 0,01) y máscaras con IoU medio superior a 0,99.

Latencias declaradas en una RTX PRO 6000:

| Operación | Latencia | Pico de memoria |
|---|---|---|
| Codificación de imagen | 45 ms | 2,5 GB |
| Decodificación de clic | 4 ms en GPU / 11 ms en CPU | no disponible |
| Codificación de frase | 6 ms | no disponible |
| Localización por frase | 27 ms | 1,6 GB |
| Codificación de imagen en CPU de 32 hilos | ~7 s | no disponible |

## Requisitos de hardware

- VRAM estimada: pico de 2,5 GB en la ruta de imagen y de 1,6 GB en la ruta de frase según las mediciones del autor en una RTX PRO 6000. En fp32, la atención del tronco llegaría a 12,9 GB, motivo por el que se convierte a fp16.
- GPU recomendadas: la medición de referencia se hizo en una NVIDIA RTX PRO 6000. Cualquier GPU CUDA con al menos 3-4 GB de VRAM libre debería ejecutar los grafos.
- GPU de consumo: sí cabe. Una RTX 3060 de 12 GB, una RTX 4060 de 8 GB o una RTX 4090 pueden alojar los grafos con holgura, dado el pico de 2,5 GB.
- CPU: funciona sin GPU a través del proveedor de ejecución de CPU; la codificación de imagen ronda los 7 s en una CPU de 32 hilos y la decodificación de clic 11 ms.
- Opciones de despliegue: ONNX Runtime 1.31 o posterior con proveedor CUDA o CPU (opset 23); integración nativa en Nexaflow desde C#. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI.
- Almacenamiento: el repositorio ocupa 1,8 GB, repartidos en image-encoder (929 MB), text-encoder (707 MB), finder (123 MB), click-decoder (17 MB), exemplar-encoder (13 MB) y tokenizer (1,4 MB).
- Latencia y throughput: 45 ms por codificación de imagen, 4 ms por clic, 6 ms por frase y 27 ms por localización, según las cifras del autor. No se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Enfoque | Formato / precisión | Licencia | Disponibilidad |
|---|---|---|---|---|
| smile-forge/sam3.1-onnx | Segmentación interactiva, por frase y por ejemplos | ONNX (opset 23), fp16 y fp32 | sam-license (other) | HuggingFace, 1,8 GB |
| Meta SAM 3.1 (original) | Segmentación interactiva, por frase y por ejemplos | PyTorch, bf16 | sam-license | `facebook/sam3.1`, código en GitHub |
| Meta SAM 2 | Segmentación de imágenes y vídeo | PyTorch | Apache 2.0 (código y pesos) | `facebook/sam2` |
| Meta SAM (SAM 1) | Segmentación interactiva por clics y cajas | PyTorch | Apache 2.0 | `facebookresearch/segment-anything` |

No se dispone de recuentos de parámetros ni de resultados de benchmarks comparables en la información proporcionada, por lo que la comparación se limita al formato, la licencia y el tipo de entrada. Este port no añade entrenamiento propio: su única diferencia funcional frente a SAM 3.1 es el formato de pesos y la ejecución bajo ONNX Runtime.

## Limitaciones y advertencias

- Licencia `sam-license` (`license: other`): es una licencia personalizada de Meta, no una licencia permisiva estándar; hay que revisar el archivo LICENSE antes de cualquier uso comercial.
- Se trata de un port no oficial: los grafos ONNX derivan de código y pesos de Meta, y pueden diferir ligeramente en numerica pese a la validación de fidelidad (IoU superior a 0,99 frente a la referencia).
- Riesgo de máscaras espurias: la puntuación de objeto y el umbral 0,5 en el `finder` ayudan a filtrarlas, pero el modelo puede devolver regiones no solicitadas.
- Entrada de texto limitada a 32 tokens BPE, con limpieza previa obligatoria (`ftfy.fix_text`, entidades HTML desescapadas dos veces, espacios colapsados y minúsculas).
- No se documentan idiomas soportados; el vocabulario BPE de estilo CLIP está orientado a inglés, por lo que las frases en castellano pueden degradar la segmentación.
- Requiere ONNX Runtime 1.31 o posterior (opset 23); versiones anteriores no cargarán los grafos.
- El repositorio registra 0 descargas y 0 me gusta en el momento de la consulta, por lo que carece de validación externa amplia.
- No se declaran parámetros totales ni datos de entrenamiento, lo que dificulta auditar sesgos o composición del dataset original.
- Solo se contempla vídeo pausado (fotogramas), no seguimiento de vídeo en movimiento.
- Los resultados de latencia proceden de una RTX PRO 6000; en hardware inferior (CPU o GPU de gama baja) los tiempos aumentan de forma notable.
- No se encontraron enlaces relevantes en la búsqueda web: los resultados obtenidos corresponden a una película y a una empresa de servicios digitales sin relación con el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/smile-forge/sam3.1-onnx
- Proyecto Nexaflow: https://github.com/smile-forge/nexaflow
- Código oficial de SAM 3.1 (Meta): https://github.com/facebookresearch/sam3
- Pesos oficiales de SAM 3.1: https://huggingface.co/facebook/sam3.1
- ONNX Runtime: https://onnxruntime.ai
- Repositorio de ONNX Runtime en GitHub: https://github.com/microsoft/onnxruntime
- Archivo LICENSE del modelo: https://huggingface.co/smile-forge/sam3.1-onnx/blob/main/LICENSE

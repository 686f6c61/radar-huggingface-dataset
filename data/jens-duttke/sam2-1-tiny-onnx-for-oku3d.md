# Jens-Duttke/SAM2.1-Tiny-ONNX-for-Oku3D

## Resumen

SAM 2.1 Tiny ONNX for Oku3D es una exportación a formato ONNX del modelo de segmentación de imágenes SAM 2.1 (variante hiera-tiny) desarrollado originalmente por Meta. La exportación la mantiene Jens-Duttke y está pensada para la selección de objetos en el editor de fotos de Oku3D, aunque cualquier consumidor de ONNX Runtime puede utilizarla. El modelo resuelve el problema de segmentación de imágenes guiada por prompts (clics o cajas), separando la carga computacional en dos grafos: un codificador de imagen que se ejecuta una vez por fotografía y un decodificador que se ejecuta por cada prompt.

La relevancia de esta ficha radica en su orientación práctica: es una exportación optimizada para DirectML y CPU, con el codificador en FP16 (70 MB) y el decodificador en FP32 (18 MB), lo que permite ejecutar segmentación de alta calidad en hardware de consumo sin depender de PyTorch. La arquitectura subyacente es la de SAM 2.1, un transformer jerárquico (Hiera) con mecanismo de atención, y el contexto de entrada es una imagen RGB de 1024 x 1024 píxeles. El repositorio ocupa aproximadamente 0,1 GB.

La licencia es Apache-2.0, la misma con la que Meta publica el código y los checkpoints de SAM 2, lo que facilita su integración en productos comerciales. No se dispone de información sobre idiomas soportados porque la tarea es de visión, no de procesamiento de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SAM 2.1 con backbone Hiera (hiera-tiny), transformer jerárquico con atención |
| Parametros totales | no disponible (variante hiera-tiny de SAM 2.1) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de imagen fija de 1024 x 1024 píxeles |
| Tipos de cuantizacion | FP16 (codificador), FP32 (decodificador); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (onnxruntime) |

## Arquitectura y entrenamiento

El modelo es una exportación del checkpoint `sam2.1_hiera_tiny.pt` de Meta, construida a partir del repositorio facebookresearch/sam2 en el commit 2b90b9f. La arquitectura corresponde a SAM 2.1, que combina un codificador de imagen basado en Hiera (un transformer jerárquico) con un codificador de prompts y un decodificador de máscaras. La exportación divide el modelo en dos grafos ONNX: el codificador procesa la imagen completa y produce un embedding de 256 canales a 64 x 64 junto con dos mapas de características de alta resolución (32 x 256 x 256 y 64 x 128 x 128); el decodificador consume ese embedding, las características de alta resolución y los prompts (coordenadas de puntos o cajas) para producir cuatro máscaras candidatas y sus puntuaciones IoU.

No se dispone de información sobre el número de tokens de entrenamiento ni la composición del dataset en la documentación proporcionada; esos datos pertenecen al modelo original de Meta y no se reproducen en la model card de esta exportación. Las innovaciones técnicas documentadas son de carácter de ingeniería de exportación: el position embedding de Hiera, que el modelo original redimensiona bicúbicamente en cada ejecución, se calcula una vez para la entrada de 1024 y se almacena (DirectML no soporta resize bicúbico); el codificador se exporta directamente desde el modelo en float16 en lugar de convertirlo después; y se simplifican los nodos `CastLike` a `Cast` y se limpia el atributo `allowzero` en los `Reshape` cuyo destino no contiene ceros, porque DirectML rechaza sesiones que los contengan.

## Capacidades

- Segmentación de imágenes guiada por prompts: acepta clics (punto sobre el objeto o sobre el fondo) y cajas delimitadoras (esquinas superior izquierda e inferior derecha).
- Generación de múltiples máscaras candidatas: produce cuatro salidas (una máscara única y tres alternativas) con puntuaciones IoU para seleccionar la mejor.
- Refinamiento iterativo: acepta `mask_input` con los logits de una respuesta anterior cuando `has_mask_input` es 1, lo que permite encadenar prompts y mejorar la máscara.
- Ejecución en DirectML y CPU mediante ONNX Runtime, con soporte de FP16 en el codificador.
- Procesamiento de imagen RGB normalizada en [0, 1] y estirada a 1024 x 1024 sin mantener la relación de aspecto; la estandarización ImageNet se ejecuta dentro del grafo.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al ser un modelo puramente de visión.

## Casos de uso

- Edición fotográfica con selección de objetos: el modelo permite al usuario hacer clic sobre un objeto en una fotografía y obtener una máscara precisa, integrándose en editores como Oku3D para recortes, reemplazos de fondo o ajustes locales. El codificador se ejecuta una vez por imagen (unos 24 ms en DirectML) y el decodificador por cada clic (unos 3,3 ms), lo que hace la interacción fluida.
- Herramientas de anotación y etiquetado de datasets: los anotadores pueden generar máscaras de segmentación con clics o cajas, acelerando la creación de datasets de visión por computador. La posibilidad de refinar con `mask_input` permite iterar hasta obtener la máscara deseada.
- Segmentación interactiva en aplicaciones de escritorio: al ejecutarse en DirectML y CPU, puede desplegarse en equipos con GPU de consumo (por ejemplo, una RTX 5070 Ti) sin necesidad de servidores con aceleradores de datacenter.
- Preprocesado para pipelines de visión: las máscaras generadas pueden alimentar etapas posteriores como detección, clasificación o análisis de imágenes, separando objetos del fondo antes de procesarlos.
- Automatización de recortes en lote: con un codificador que se ejecuta una vez por imagen y un decodificador ligero, se pueden procesar lotes de fotografías aplicando prompts predefinidos (cajas) para extraer regiones de interés.
- Integración en aplicaciones web o de escritorio mediante ONNX Runtime: al no requerir PyTorch, el modelo puede empaquetarse en aplicaciones ligeras y ejecutarse en entornos con DirectML o CPU, reduciendo dependencias y tamaño de despliegue.

## Benchmarks y rendimiento

La model card proporciona datos de precisión y velocidad comparando con el `SAM2ImagePredictor` de Meta, alimentado con la misma entrada redimensionada, sobre el proveedor CPU de ONNX Runtime:

| Prompt | Codificador FP32 | Codificador FP16 (incluido) |
|---|---|---|
| Un clic | logits idénticos, mask IoU 1.0000 | mask IoU 0.9998 |
| Caja | logits idénticos, mask IoU 1.0000 | mask IoU 0.9993 |

Con ONNX Runtime 1.24.4 y DirectML sobre una NVIDIA GeForce RTX 5070 Ti, tras la primera ejecución: codificador aproximadamente 24 ms y decodificador aproximadamente 3,3 ms por prompt. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no aplican a un modelo de segmentación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el codificador FP16 ocupa 70 MB y el decodificador FP32 18 MB en disco, por lo que la huella en memoria es reducida y apta para GPUs de consumo.
- GPU recomendadas: se ha verificado el funcionamiento en una NVIDIA GeForce RTX 5070 Ti con DirectML; al ser un modelo pequeño, debería caber en GPUs de consumo de gama media y baja, aunque no se documentan pruebas en otras.
- Cabe en GPU de consumo: sí, según el tamaño de los grafos y la prueba realizada en una RTX 5070 Ti.
- Opciones de despliegue: ONNX Runtime con proveedor DirectML o CPU; la model card menciona explícitamente ambos. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: codificador aproximadamente 24 ms y decodificador aproximadamente 3,3 ms por prompt en DirectML sobre RTX 5070 Ti; no se proporcionan cifras para CPU más allá de la comparación de precisión.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SAM 2.1 Tiny ONNX (esta ficha) | hiera-tiny (no disponible) | imagen 1024 x 1024 | mask IoU 0.9998 (clic) y 0.9993 (caja) frente a Meta en CPU; 24 ms + 3,3 ms en RTX 5070 Ti | Apache-2.0 | Hugging Face, ONNX Runtime |
| SAM 2.1 original (Meta, PyTorch) | variantes tiny a large | imagen 1024 x 1024 | referencia de precisión (mask IoU 1.0000 en la comparación) | Apache-2.0 | GitHub facebookresearch/sam2, checkpoints |
| SAM 2 original (Meta) | variantes | imagen 1024 x 1024 | no disponible en esta información | Apache-2.0 | GitHub, checkpoints |

No se dispone de datos de otros modelos comparables de segmentación (por ejemplo, variantes de SAM o modelos especializados) en la información proporcionada, por lo que la comparativa se limita a las versiones de SAM 2.1.

## Limitaciones y advertencias

- El modelo es una exportación de ingeniería; su precisión depende del checkpoint original de Meta y de las modificaciones de exportación (position embedding almacenado, simplificación de nodos), que podrían introducir diferencias menores no documentadas fuera de los casos probados.
- La entrada está fijada a 1024 x 1024 con estiramiento sin mantener la relación de aspecto, lo que puede distorsionar objetos en imágenes con proporciones extremas.
- El codificador emite características en FP16 y el decodificador las consume en FP32; no se documentan otras combinaciones de precisión ni cuantizaciones adicionales.
- No se documentan sesgos conocidos ni riesgos de alucinación específicos, pero al ser un modelo de segmentación, puede producir máscaras inexactas en objetos ambiguos, oclusiones o imágenes de baja calidad.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar el archivo LICENSE del repositorio y las condiciones del modelo original de Meta.
- No se documentan limitaciones de idioma porque el modelo no procesa lenguaje; las limitaciones relevantes son de visión (resolución, dominio de las imágenes, calidad de los prompts).
- El rendimiento medido corresponde a una GPU concreta (RTX 5070 Ti) y a ONNX Runtime 1.24.4 con DirectML; en otras configuraciones la latencia puede variar.

## Enlaces

- Hugging Face: https://huggingface.co/Jens-Duttke/SAM2.1-Tiny-ONNX-for-Oku3D
- Repositorio SAM 2 de Meta: https://github.com/facebookresearch/sam2
- Commit de referencia: https://github.com/facebookresearch/sam2/tree/2b90b9f5ceec907a1c18123530e92e794ad901a4
- Paper SAM 2: https://arxiv.org/abs/2408.00714
- Oku3D: https://oku3d.com
- Licencia: https://huggingface.co/Jens-Duttke/SAM2.1-Tiny-ONNX-for-Oku3D/blob/main/LICENSE

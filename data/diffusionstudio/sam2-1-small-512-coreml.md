# diffusionstudio/sam2.1-small-512-coreml

## Resumen

SAM 2.1 small, 512 px, Core ML es una conversión del modelo de segmentación y seguimiento de vídeo facebook/sam2.1-hiera-small al formato Core ML, publicada por Diffusion Studio. No es un modelo de lenguaje: es un modelo de visión que segmenta un único objeto a lo largo de un vídeo, recibiendo indicaciones en forma de puntos o cajas sobre un fotograma de referencia. La conversión descompone el modelo original en cinco programas Core ML independientes con formas fijas, lo que permite ejecutarlo de forma nativa en Apple Silicon bajo macOS 15.

El paquete está pensado para integrarse en el editor de Diffusion Studio: el flujo típico es codificar el fotograma con puntos, decodificar la máscara, y después propagar el objeto por los fotogramas siguientes mediante el codificador de memoria y la atención sobre memoria. Todos los programas calculan internamente en fp16 pero aceptan y devuelven tensores fp32, lo que simplifica la integración con código de preprocesado existente.

Su relevancia es práctica: ofrece una vía lista para producción de ejecutar SAM 2.1 en el ecosistema Apple (Core ML, Neural Engine y GPU integrada) sin depender de PyTorch ni de CUDA, con un repositorio de solo 0,1 GB y licencia Apache 2.0. Está limitado a un objeto por pista y a fotogramas de 512 × 512.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SAM 2.1 (Hiera small) convertido a 5 programas Core ML (`vision_encoder`, `mask_decoder`, `memory_encoder`, `memory_attention`, `pointer_position`) |
| Parametros totales | no disponible (modelo base: sam2.1-hiera-small) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de imagen fija de 512 × 512 y memoria temporal de 7 fotogramas |
| Tipos de cuantizacion | fp16 en calculo, fp32 en entradas y salidas |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | Core ML (`.mlpackage`/`.mlmodel`), con `constants.json` para tamanos |

## Arquitectura y entrenamiento

El modelo subyacente es SAM 2.1 con backbone Hiera small, la arquitectura de segmentación "promptable" de Meta para imagen y vídeo. La segmentación se obtiene a partir de indicaciones geométricas: puntos positivos (etiqueta 1), negativos (etiqueta 0) y las esquinas de una caja (etiquetas 2 y 3), con hasta 16 filas de puntos por fotograma. La máscara se emite como logits de 128 × 128 en la salida `field`, junto con una puntuación de objeto (`score`) y una estimación de IoU (`iou`).

La conversión a Core ML divide el grafo en cinco etapas con formas fijas. `vision_encoder` produce características a stride 4, 8 y 16 más una semilla; `mask_decoder` combina esas características con los puntos para generar la máscara; `memory_encoder` comprime el estado del objeto en un vector de memoria; `memory_attention` fusiona hasta 7 memorias con la característica del fotograma actual para el seguimiento; y `pointer_position` normaliza las distancias de los punteros de objeto. La tabla temporal asigna la fila 6 al fotograma con indicaciones y la fila k−1 al k-ésimo fotograma rastreado más reciente. No se dispone de información sobre el dataset de entrenamiento ni sobre fases de RLHF/DPO, ya que se heredan del modelo original de Meta.

## Capacidades

- Segmentación de un objeto en imagen a partir de puntos y cajas.
- Seguimiento del objeto a lo largo de fotogramas de vídeo mediante memoria temporal de 7 entradas.
- Puntuación de confianza por máscara (`score`) y estimación de IoU (`iou`) para filtrar resultados.
- Manejo de indicaciones positivas y negativas en el mismo fotograma (hasta 16 filas de puntos).
- Inferencia nativa en Apple Silicon vía Core ML, con cálculo fp16.
- No soporta tool calling, agentes, texto, audio ni generación de lenguaje: es exclusivamente un modelo de visión.
- Sin capacidades multilingües (no procesa lenguaje).
- Restricción funcional: una sola pista de objeto por ejecución del pipeline.

## Casos de uso

- Rotoscopia y recorte en edición de vídeo: el flujo `vision_encoder` → `mask_decoder` → `memory_encoder` → `memory_attention` permite aislar un sujeto fotograma a fotograma y exportar la máscara para composición; encaja en Diffusion Studio por su integración Core ML nativa.
- Eliminación de fondo en aplicaciones macOS: al ejecutarse en Neural Engine/GPU integrada, permite procesar vídeo localmente sin subir material a la nube, con el límite de 512 × 512 de entrada.
- Seguimiento de objetos en herramientas de anotación: los puntos positivos y negativos permiten corregir la máscara sobre la marcha y propagar la corrección al resto de fotogramas mediante la memoria temporal.
- Efectos de vídeo en tiempo casi real en equipos Apple: el cálculo fp16 y las formas fijas reducen la sobrecarga de compilación y permiten pipelines por lotes de fotogramas.
- Investigación en segmentación de vídeo sin GPU NVIDIA: sirve como referencia reproducible de SAM 2.1 en Core ML para comparar latencias en Apple Silicon.
- Prototipado de funciones de "seleccionar objeto" en apps de fotografía: la entrada por caja (etiquetas 2 y 3) simplifica la UX de selección inicial y el decodificador devuelve la máscara en una sola pasada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Entorno obligatorio: macOS 15 o superior con soporte Core ML; no funciona en Linux ni Windows.
- Hardware: Apple Silicon (se recomienda M1 o posterior); el uso de Neural Engine y GPU unificada depende del programador Core ML.
- VRAM: no disponible; al ser memoria unificada, el consumo depende del fotograma y del estado de memoria (7 entradas), no se especifica en la model card.
- Cabe en equipos de consumo Apple (MacBook Air/Pro, Mac mini, iPad no confirmado) al tratarse de un modelo small y un repo de 0,1 GB.
- Despliegue: Core ML directamente; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de visión de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| diffusionstudio/sam2.1-small-512-coreml | no disponible (Hiera small) | 512 × 512, memoria de 7 fotogramas | Core ML fp16 | Apache 2.0 | Hugging Face, 0 descargas |
| facebook/sam2.1-hiera-small | no disponible | resolución variable, memoria temporal SAM 2.1 | PyTorch/safetensors | Apache 2.0 | Hugging Face (modelo base) |
| SAM 2.1 (variantes large) | no disponible | resolución variable | PyTorch | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Solo segmenta un objeto por ejecución; no gestiona múltiples pistas simultáneas.
- Entrada fija de 512 × 512: el fotograma se estira y se pierde la relación de aspecto original, lo que puede degradar máscaras en vídeo panorámico o vertical.
- Memoria temporal limitada a 7 entradas, lo que puede provocar deriva en oclusiones largas o cambios de apariencia.
- Dependencia estricta de macOS 15 y Core ML; no es portable a otros sistemas sin reconversión.
- Cálculo interno en fp16: posible pérdida de precisión frente al modelo original en PyTorch.
- Riesgo de fallo en objetos pequeños, poco contrastados o con movimiento rápido; la puntuación `iou` debe usarse para descartar máscaras de baja calidad.
- Sin información publicada sobre sesgos; al ser un modelo de visión, los sesgos provienen de los datos de entrenamiento de SAM 2.1 (no documentados aquí).
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base de Meta y de los datos de entrenamiento originales.
- Repositorio con 0 descargas y 0 likes: poca validación comunitaria; probar en producción antes de adoptarlo.

## Enlaces

- Hugging Face: https://huggingface.co/diffusionstudio/sam2.1-small-512-coreml
- Modelo base: https://huggingface.co/facebook/sam2.1-hiera-small
- Diffusion Studio: https://diffusion.studio
- Repositorio de conversión (crates/segmenter, `convert.py`): no disponible como enlace directo en la información proporcionada.

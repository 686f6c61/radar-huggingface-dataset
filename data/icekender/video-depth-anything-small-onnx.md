# Icekender/video-depth-anything-small-onnx

## Resumen

Video Depth Anything Small — ONNX es una exportación a formato ONNX del modelo `depth-anything/Video-Depth-Anything-Small`, publicada por el usuario Icekender para el proyecto MediaForge. No es un modelo nuevo: es una conversión de pesos que permite ejecutar la estimación de profundidad temporalmente consistente sobre video sin depender de PyTorch, usando exclusivamente ONNX Runtime. El repositorio pesa 0,1 GB y contiene un único grafo de 116 MB en fp32, con opset 17.

El modelo original deriva de Depth Anything V2 y fue presentado como Highlight en CVPR 2025. Su aportación es producir mapas de profundidad coherentes a lo largo de secuencias arbitrariamente largas, con una velocidad de inferencia superior y menos parámetros que las alternativas basadas en difusión, como DepthCrafter. Esta exportación concreta fija la entrada en lotes de 32 fotogramas RGB a 518×924 píxeles y devuelve disparidad relativa (valores mayores = más cerca), que es exactamente lo que retorna el modelo original.

La relevancia práctica de esta ficha es acotada: se trata de un artefacto de despliegue, con 0 descargas y 0 likes en el momento de la consulta, licencia Apache-2.0 y una interfaz de entrada rígida. Resulta útil para quien necesite integrar profundidad de video en un pipeline de producción en C++, C# o Python sin arrastrar el ecosistema de PyTorch, y para quien trabaje con las «temporally consistent depth tracks» de MediaForge.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de visión (encoder ViT-S, `encoder="vits"`) con decoder multi-escala y módulo de atención temporal; basada en Depth Anything V2 |
| Parametros totales | no disponible (el autor solo indica encoder ViT-S, `features=64`, `out_channels=[48,96,192,384]`) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión); ventana temporal fija de 32 fotogramas por pasada, con solapamiento de 10 en videos largos |
| Tipos de cuantizacion | fp32 únicamente; el autor no publica variantes int8, fp16 ni Q4 (aunque el tag `base_model:quantized` sugiere una relación de cuantización respecto al modelo base) |
| Idiomas soportados | no disponible (modelo de visión, independiente del idioma) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX, opset 17, fp32, 116 MB; librería `onnxruntime` |

## Arquitectura y entrenamiento

La exportación reproduce la arquitectura upstream `VideoDepthAnything(encoder="vits", features=64, out_channels=[48,96,192,384])`. El encoder es un ViT-Small; el decoder es de tipo multi-escala, con cuatro niveles de canales, y sobre él se aplica un módulo de atención temporal que es lo que aporta la consistencia entre fotogramas frente a un estimador de profundidad monocular por imagen. La entrada es un tensor `float32 [1, 32, 3, 518, 924]` con 32 fotogramas RGB consecutivos normalizados en rango 0‥1 y con normalización ImageNet (media 0,485/0,456/0,406; desviación 0,229/0,224/0,225). La salida es `float32 [1, 32, 518, 924]` de disparidad relativa.

La conversión se hizo con `torch.onnx.export` (torch 2.5.1, `dynamo=False`). El autor introdujo una modificación respecto al grafo original: la atención temporal usaba `torch.baddbmm(torch.empty(...), q, kᵀ, beta=0, alpha=scale)`, que el exportador plegaba en aproximadamente 1 GB de constantes; se sustituyó por la expresión matemáticamente idéntica `scale · q @ kᵀ`. La interpolación de los *positional embeddings* del ViT quedó trazada como constantes, lo que fija el tamaño de entrada: otras resoluciones no se ejecutan. No se dispone de información sobre el dataset de entrenamiento, el número de tokens vistos ni si hubo fases de RLHF o DPO; esos datos corresponden al modelo original, no a esta exportación, y no se detallan en la información proporcionada.

## Capacidades

- Estimación de profundidad relativa (disparidad) sobre secuencias de video, no sobre imágenes sueltas: la unidad de proceso son 32 fotogramas consecutivos.
- Consistencia temporal explícita entre fotogramas, gracias al módulo de atención temporal y al solapamiento entre ventanas.
- Procesamiento de video arbitrariamente largo: ventanas de 32 fotogramas con 10 de solapamiento, fotogramas clave `[0,12,24..31]` arrastrados a la ventana siguiente y alineación de escala y desplazamiento sobre el solapamiento.
- Salida alineada con la del modelo PyTorch original, lo que permite sustituirlo en pipelines existentes (delta máximo de 1,4e-4 en las pruebas del autor).
- Ejecución sin PyTorch: solo requiere ONNX Runtime, lo que facilita el despliegue en entornos con restricciones de dependencias.
- No soporta *tool calling*, *function calling*, agentes, razonamiento multi-paso ni generación de texto: es un modelo puramente visual.
- No hay capacidades multilingües ni de audio.

## Casos de uso

- Postproducción audiovisual y VFX: generar pases de profundidad coherentes para *rotoscoping*, composición de capas y desenfoque de profundidad variable en planos largos, donde un estimador por imagen produciría parpadeo entre fotogramas.
- Reconstrucción 3D y nubes de puntos: la disparidad relativa por fotograma, junto con la escala y el desplazamiento alineados entre ventanas, permite unproyectar la secuencia a geometría 3D sin saltos entre tramos.
- Conversión 2D a 3D estereoscópico: la consistencia temporal es requisito imprescindible para generar un par estéreo estable en movimiento.
- Realidad aumentada y mixta: oclusión correcta de objetos virtuales por elementos reales delante de ellos, usando el mapa de profundidad por fotograma.
- Edición de video asistida y sustitución de fondos: separación de primer plano y fondo con máscaras derivadas de la profundidad, manteniendo bordes estables a lo largo del tiempo.
- Percepción para robótica y conducción autónoma: estimación monocular de profundidad en flujos de cámara, útil como señal auxiliar cuando no hay LiDAR disponible, con la ventaja de que el modelo corre en ONNX Runtime sobre hardware modesto.
- Integración en aplicaciones nativas no Python: el formato ONNX permite enlazar el grafo desde C++, C# o Java mediante las *bindings* de ONNX Runtime, algo que la versión PyTorch dificulta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente documenta la fidelidad numérica de la exportación frente al modelo PyTorch sin modificar, sobre entrada aleatoria:

| Metrica | Valor |
|---|---|
| Error maximo absoluto frente a PyTorch | 1,4e-4 |
| Error medio absoluto frente a PyTorch | 1,6e-6 |
| Media de la salida | 5,47 |
| Entorno de la comprobacion | ONNX Runtime 1.x, CPU, optimizaciones de grafo por defecto |
| Tipo de entrada en la comprobacion | entrada aleatoria |

No hay cifras de MMLU, HumanEval, GSM8K ni de métricas de profundidad (absRel, δ1, RMSE) en la informacion proporcionada, ni para esta exportación ni para el modelo base.

## Requisitos de hardware

- Peso del modelo: 116 MB en fp32. Solo el tensor de entrada, `1×32×3×518×924` en float32, ocupa unos 184 MB; la salida `1×32×518×924` ocupa unos 61 MB.
- VRAM estimada para inferencia: el autor no publica cifras. Como estimación orientativa a partir de las dimensiones de los tensores y de los cuatro niveles del decoder, el pico de activaciones se situaría en el rango de 2 a 4 GB; esta cifra no está confirmada por el autor.
- Cabe en GPU de consumo: sí, con margen amplio, en cualquier tarjeta con 6 GB o más (RTX 3060, 4060, 4090, etc.), e incluso en equipos sin GPU.
- CPU: el propio autor validó la ejecución con ONNX Runtime sobre CPU, lo que confirma viabilidad sin acelerador, a costa de latencia.
- GPU recomendadas: no hay recomendaciones del autor. Para lotes de 32 fotogramas a 518×924, cualquier GPU moderna con soporte CUDA resulta suficiente; en entornos de servidor, A100 o H100 solo tendrían sentido por agregación de muchas peticiones concurrentes.
- Opciones de despliegue: ONNX Runtime con *execution providers* CPU, CUDA o TensorRT. No hay pesos GGUF, ni integración con llama.cpp, Ollama, vLLM o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. La única referencia indirecta es la afirmación del proyecto original de que Video Depth Anything es más rápido que los modelos de profundidad basados en difusión, pero no se aportan cifras en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Icekender/video-depth-anything-small-onnx (esta ficha) | ONNX, profundidad de video | no disponible (ViT-S) | Fija, 32×3×518×924 | Apache-2.0 | ONNX Runtime, 0 descargas |
| depth-anything/Video-Depth-Anything-Small | PyTorch, profundidad de video | no disponible (ViT-S) | Flexible | Apache-2.0 | HuggingFace, modelo base |
| Video-Depth-Anything-Base / Large | PyTorch, profundidad de video | no disponible | Flexible | CC-BY-NC-4.0 | HuggingFace, uso no comercial |
| onnx-community/depth-anything-v2-small | ONNX, profundidad por imagen | no disponible | Flexible | no disponible en la busqueda | ONNX Runtime |
| DepthCrafter | Difusión, profundidad de video | no disponible | no disponible | no disponible en la busqueda | Repositorio del proyecto |

No se dispone de datos de rendimiento comparativos entre estas alternativas en la información proporcionada, por lo que la comparación se limita a formato, licencia y disponibilidad. El punto diferencial de esta exportación frente a Depth Anything V2 Small es la dimensión temporal: V2 Small procesa imágenes sueltas y no garantiza coherencia entre fotogramas.

## Limitaciones y advertencias

- Tamaño de entrada fijo: la interpolación de los *positional embeddings* está trazada como constantes, de modo que solo funciona con `[1, 32, 3, 518, 924]`. Cualquier otra resolución o número de fotogramas falla.
- Otras relaciones de aspecto se estiran a 924×518 y se devuelven a su formato original, lo que introduce distorsión geométrica en el contenido y, potencialmente, sesgo en la profundidad estimada.
- La salida es disparidad relativa, no profundidad métrica: no sirve directamente para medir distancias en metros sin una calibración externa de escala y desplazamiento.
- Riesgo de deriva temporal y de inconsistencias en los empalmes entre ventanas de 32 fotogramas, a pesar de la alineación por escala y desplazamiento sobre el solapamiento de 10 fotogramas.
- Riesgo de alucinación geométrica en regiones ambiguas: superficies transparentes, reflectantes, cielo sin textura o bordes finos son casos conocidos de fallo en estimadores monoculares de profundidad.
- Sesgos: no se documenta ningún análisis de sesgo. Al derivar de Depth Anything V2, hereda los sesgos de sus datos de entrenamiento, que no se detallan en la información proporcionada.
- Licencia: Apache-2.0, lo que permite uso comercial de esta exportación y del modelo Small. Es importante notar que las variantes Base y Large de Video Depth Anything son CC-BY-NC-4.0 y no se pueden usar comercialmente; esta exportación no las cubre.
- Artefacto sin adopción: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día (30 de septiembre de 2026). No hay evidencia de uso en producción ni mantenimiento posterior.
- El único desarrollador es un usuario individual, Icekender, sin garantías de soporte ni de actualizaciones frente a cambios en ONNX Runtime.
- La validación numérica del autor se hizo con entrada aleatoria sobre CPU, no con video real ni sobre GPU; el comportamiento con otros *execution providers* no está verificado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Icekender/video-depth-anything-small-onnx
- Modelo base: https://huggingface.co/depth-anything/Video-Depth-Anything-Small
- Repositorio del proyecto original (CVPR 2025 Highlight): https://github.com/DepthAnything/Video-Depth-Anything
- Página del proyecto: https://videodepthanything.github.io/
- Exportación ONNX de Depth Anything V2 Small (alternativa sin componente temporal): https://huggingface.co/onnx-community/depth-anything-v2-small
- Repositorio MediaForge mencionado por el autor: https://github.com/Iskendro

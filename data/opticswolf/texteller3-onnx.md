# opticsWolf/texteller3-onnx

## Resumen

Texteller3 ONNX es un modelo de reconocimiento óptico de fórmulas matemáticas (OCR de imagen a LaTeX) empaquetado específicamente para inferencia con ONNX Runtime. Se construye a partir de la unión de dos repositorios upstream, OleehyO/TexTeller y Ji-Ha/TexTeller3, que el autor verifica que comparten exactamente los mismos pesos (480 tensores idénticos y hashes ONNX coincidentes). El resultado es un repositorio autocontenido con todos los artefactos necesarios para servir el modelo sin depender de PyTorch.

La arquitectura es un `VisionEncoderDecoderModel`: un encoder ViT que procesa la imagen de la fórmula y un decoder TrOCR autorregresivo que emite la secuencia LaTeX. El modelo tiene 298.101.248 parámetros y procesa entradas de 448×448 píxeles en escala de grises, con normalización media 0,9545 y desviación 0,1539. El vocabulario del tokenizador es de 11.500 tokens más 3.505 tokens añadidos.

Su relevancia práctica reside en el empaquetado: incluye variantes fp32, fp16 y cuantizaciones dinámicas int8, junto con decodificadores fusionados con soporte de KV-cache en un único archivo ONNX. Esto permite desplegar OCR de fórmulas en producción con ONNX Runtime sobre CUDA o CPU, sin necesidad de cargar el stack de Transformers ni de reexportar los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VisionEncoderDecoderModel (encoder ViT + decoder TrOCR) |
| Parametros totales | 298.101.248 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (decoder autorregresivo; ejemplos de decodificación a 32 pasos) |
| Tipos de cuantizacion | fp32, fp16, int8 dinamico (encoder y decoder fusionado), q8 (MatMulNBits, no recomendado) |
| Idiomas soportados | no disponible (salida en LaTeX, independiente del idioma natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (opset 18 encoder, opset 11 decoder) |

## Arquitectura y entrenamiento

El modelo sigue el esquema clásico de `VisionEncoderDecoderModel`: un encoder de tipo Vision Transformer que recibe `pixel_values` de forma `[batch, 1, 448, 448]` y produce un `last_hidden_state` de forma `[batch, 785, 768]`, y un decoder TrOCR que genera la secuencia LaTeX token a token condicionada por ese estado oculto. El decoder fusionado incluye una rama sin caché (no-past) y una rama con caché KV (with-past) en un único grafo ONNX mediante un nodo `If` controlado por la entrada `use_cache_branch`. Los tokens especiales son BOS=0, EOS=2 y PAD=1.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de RLHF o DPO. El repositorio se limita a documentar la procedencia de los pesos y las comprobaciones de paridad numérica entre exportaciones. Las verificaciones publicadas con ONNX Runtime 1.29 sobre CUDA muestran paridad exacta (worst|d| = 0.0) entre el decoder fusionado y el decoder dividido, y entre el ONNX distribuido por TexTeller3 y una exportación fresca desde `model.safetensors`. La variante fp16 mantiene paridad con fp32 (worst|d| ≈ 0,01–0,02) y decodificación greedy exacta en 3 de 3 fórmulas de prueba.

## Capacidades

- Reconocimiento de fórmulas matemáticas escritas o impresas en imágenes y conversión a código LaTeX.
- Procesamiento de imágenes en escala de grises a 448×448 píxeles con normalización fija definida en `preprocessor_config.json`.
- Generación autorregresiva con caché KV, lo que reduce el coste computacional en secuencias largas.
- Ejecución en ONNX Runtime con proveedores CUDA o CPU, sin dependencia de PyTorch en tiempo de inferencia.
- Variantes de precisión intercambiables (fp32, fp16, int8 dinámico) para ajustar el equilibrio entre calidad y coste.
- No soporta tool calling, function calling, agentes multi-paso ni modalidades de audio o visión general más allá del OCR de fórmulas.

## Casos de uso

- Digitalización de apuntes y libros de matemáticas: el modelo recibe recortes de fórmulas y devuelve LaTeX listo para insertar en documentos, aprovechando su entrenamiento específico en notación matemática frente a OCR genéricos.
- Conversión de artículos científicos a formato editable: integrado en un pipeline que segmenta las fórmulas de un PDF y las pasa al modelo, se obtiene un documento LaTeX reconstruido con ecuaciones nativas.
- Plataformas educativas: un estudiante fotografía una ecuación manuscrita y el sistema la transcribe a LaTeX para su corrección automática o para renderizarla con MathJax.
- Indexación y búsqueda de contenido matemático: al convertir fórmulas de imágenes a LaTeX se habilita la búsqueda textual sobre corpus que antes solo existían como imagen.
- Generación de documentación técnica: inserción automática de ecuaciones en manuales y wikis a partir de capturas de pantalla de herramientas de cálculo.
- Despliegue en entornos sin GPU: la variante int8 dinámica y el soporte de CPU de ONNX Runtime permiten servir OCR de fórmulas en servidores modestos, aunque con la advertencia de que las variantes q8 no superan las pruebas de paridad del autor y no se recomiendan para producción.
- Integración en editores de texto con soporte LaTeX: el modelo puede invocarse desde un plugin que transforme una imagen pegada en una ecuación compilable, con latencia baja gracias a la caché KV del decoder fusionado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El repositorio documenta únicamente pruebas de paridad numérica entre variantes del propio modelo:

| Comprobacion | Resultado |
|---|---|
| Decoder fusionado (OleehyO) vs decoder dividido (T3), ramas 0 y 1 | worst\|d\| = 0,0, argmax coincidente |
| ONNX de T3 vs exportación fresca desde `model.safetensors` | worst\|d\| = 0,0 |
| fp16 vs fp32, ramas 0 y 1 | worst\|d\| ≈ 0,01–0,02, argmax coincidente |
| Decodificación greedy fp16 (32 pasos) | exacta en 3 de 3 |
| q8 (MatMulNBits) vs fp32 | worst\|d\| 3,6–7,2, cadenas correctas en 1 de 3 |
| Encoder q8 + decoder fp32 híbrido | diverge, rechazado |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 298 millones de parámetros, la variante fp32 ocupa aproximadamente 1,2 GB solo en pesos, y el repositorio completo pesa 5,4 GB incluyendo todas las variantes.
- GPU recomendadas: cualquier GPU con soporte CUDA para ONNX Runtime; el autor valida con CUDAExecutionProvider. Una RTX 4090 o superior ofrece margen holgado; GPUs de gama media con 4–8 GB de VRAM deberían ser suficientes para fp32 o fp16.
- Cabe en GPU de consumo: sí, dado el tamaño del modelo; las variantes fp16 e int8 reducen aún más el requisito.
- Opciones de despliegue: ONNX Runtime (CUDA o CPU) es la vía documentada. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo visión-texto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Texteller3 ONNX (este) | 298 M | no disponible | Apache-2.0 | ONNX, safetensors | Empaquetado ONNX con variantes fp32/fp16/int8 |
| OleehyO/TexTeller | mismos pesos (verificado) | no disponible | Apache-2.0 | safetensors, ONNX parcial | Upstream original; solo incluye decoder fusionado |
| Ji-Ha/TexTeller3 | mismos pesos (verificado) | no disponible | Apache-2.0 | safetensors, ONNX | Upstream con `preprocessor_config.json` y exportación ONNX más reciente |

No se dispone de datos de rendimiento comparativo con otros modelos de OCR de fórmulas (por ejemplo, pix2tex o LaTeX-OCR) en la información proporcionada.

## Limitaciones y advertencias

- El alcance es exclusivamente OCR de fórmulas a LaTeX; no es un modelo de propósito general ni soporta diálogo, código o razonamiento.
- Las variantes q8 (MatMulNBits) no superan las pruebas de paridad del autor: el bucle de caché KV amplifica el ruido int8 y solo 1 de 3 cadenas greedy coincide con fp32. Se distribuyen solo para experimentación y no se recomiendan para producción.
- La combinación encoder q8 + decoder fp32 diverge y fue rechazada explícitamente.
- No hay información publicada sobre sesgos, composición del dataset de entrenamiento ni tasas de alucinación en fórmulas.
- La licencia Apache-2.0 permite uso comercial, pero se hereda de los upstreams y conviene verificar que las condiciones se mantengan en despliegues derivados.
- El modelo depende de un preprocesado muy concreto (448×448, escala de grises, media 0,9545, desviación 0,1539); desviarse de él degradará la calidad de la transcripción.
- No se documentan idiomas soportados ni comportamiento con notación matemática de sistemas distintos del LaTeX estándar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/opticsWolf/texteller3-onnx
- Upstream OleehyO/TexTeller: https://huggingface.co/OleehyO/TexTeller
- Upstream Ji-Ha/TexTeller3: https://huggingface.co/Ji-Ha/TexTeller3
- Variante cuantizada Ji-Ha/TexTeller3-ONNX-dynamic: https://huggingface.co/Ji-Ha/TexTeller3-ONNX-dynamic

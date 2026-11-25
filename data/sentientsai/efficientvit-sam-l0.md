# sentientsai/efficientvit-sam-l0

## Resumen

`efficientvit-sam-l0` es una exportación a ONNX del modelo de segmentación EfficientViT-SAM, en su variante más pequeña (L0), publicada por el colectivo SentientsAI como parte de su "Vision Core", un conjunto de componentes de IA para Unreal Engine. El modelo resuelve el problema de la segmentación interactiva por prompt: dado un punto, varios clics o una caja delimitadora sobre una imagen, devuelve una máscara de segmentación junto con su *bounding box* y una puntuación de confianza. Está pensado para integrarse en el motor Unreal a través del selector `EVisionModel::ClickToSegmentEfficientvitSamL0`, consumiendo `CoreImagePromptInput` y devolviendo `CoreMaskOutput`.

El modelo deriva del trabajo original de MIT Han Lab (`mit-han-lab/efficientvit-sam`), que combina el *backbone* EfficientViT con un decodificador ligero inspirado en SAM (Segment Anything Model). La arquitectura se divide en dos grafos ONNX separados: un codificador (`l0_encoder.onnx`, 117,5 MiB en fp32) y un decodificador (`l0_decoder.onnx`, 15,7 MiB en fp32). El codificador procesa la imagen una sola vez, de modo que los sucesivos prompts sobre la misma imagen se resuelven de forma rápida, lo que encaja con flujos interactivos de anotación o selección en tiempo real.

La relevancia de esta publicación es fundamentalmente de integración: no introduce un modelo nuevo, sino una versión empaquetada, con hashes fijados por SHA-256 en un catálogo firmado, orientada a despliegue en Unreal Engine y en runtimes como CPU, DirectML, TensorRT o HLSL. La licencia Apache 2.0 y el formato ONNX facilitan su uso comercial y su ejecución en GPU de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientViT (encoder) + decodificador ligero tipo SAM, en dos grafos ONNX separados |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | fp32 en los ficheros publicados; no se documentan otras precisiones |
| Idiomas soportados | no disponible (modelo de visión, independiente de idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`l0_encoder.onnx`, `l0_decoder.onnx`) |

## Arquitectura y entrenamiento

EfficientViT-SAM sustituye el *backbone* ViT pesado de SAM por un *backbone* EfficientViT, manteniendo un decodificador de máscaras ligero. En esta exportación, el modelo se divide en dos grafos: el codificador consume la imagen y genera *embeddings* de características; el decodificador recibe esos *embeddings* junto con el prompt (punto, clics o caja) y produce la máscara, su caja y la puntuación de calidad. Esta separación permite calcular el coste de la imagen una sola vez y resolver prompts posteriores de forma barata, lo que es clave para la interacción en tiempo real.

Según la model card, el codificador fue regenerado a partir de los ficheros originales de MIT Han Lab mediante el script `make_sam_files.py` del lado Python de Sentients, con formas fijas para runtimes que las requieren, media precisión y un grafo reescrito para su ejecución. El decodificador, en cambio, son los bytes originales del publicador. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; el modelo hereda el entrenamiento del EfficientViT-SAM original de MIT Han Lab.

## Capacidades

- Segmentación interactiva por prompt: un clic positivo sobre un objeto, clics positivos y negativos para refinar, o una caja delimitadora.
- Devolución de máscara de segmentación junto con su *bounding box* y una puntuación de confianza de la predicción.
- Lectura única de la imagen: el codificador se ejecuta una vez y los prompts sucesivos sobre la misma imagen se resuelven con el decodificador, lo que habilita flujos interactivos.
- Segmentación de objetos arbitrarios sin clase predefinida (segmentación *class-agnostic*).
- Ejecución en múltiples runtimes: CPU, DirectML, TensorRT y HLSL, según la tabla de ficheros de la model card.
- Integración nativa en Unreal Engine mediante el componente Vision Core de Sentients (`EVisionModel::ClickToSegmentEfficientvitSamL0`).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades de texto, audio o generación; es exclusivamente un modelo de visión para segmentación.

## Casos de uso

- Anotación interactiva de datasets de visión: un anotador hace clic sobre un objeto y el modelo devuelve la máscara y la caja, acelerando el etiquetado de imágenes para entrenar otros modelos de detección o segmentación.
- Herramientas de selección en editores 3D y motores de juego: integrado en Unreal Engine a través de Vision Core, permite seleccionar objetos o regiones de la escena con un clic para aplicar materiales, efectos o *masking* en tiempo real.
- Rotoscopia y postproducción: separar un sujeto del fondo en fotogramas o vídeo mediante prompts de punto o caja, con la ventaja de que el coste por prompt es bajo tras procesar la imagen una vez.
- Segmentación asistida en aplicaciones de retoque fotográfico: selección de sujetos, cabello o regiones para aplicar ajustes locales sin necesidad de trazado manual.
- Preprocesado en pipelines de visión por computador: generar máscaras de objetos de interés antes de tareas posteriores como clasificación, *inpainting* o medición de áreas.
- Herramientas de accesibilidad o interacción: selección de regiones de una imagen mediante clics en interfaces táctiles o de ratón, con respuesta rápida gracias a la separación encoder/decoder.
- Automatización de *workflows* en Unreal para *virtual production*: generar máscaras de personajes u objetos para composición en tiempo real sobre GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos publicados suman aproximadamente 133 MiB en fp32 (117,5 MiB del codificador y 15,7 MiB del decodificador); el consumo real de memoria depende de las activaciones y de la resolución de entrada, que no se documenta.
- GPU recomendadas: no se especifican modelos concretos; la model card indica que el modelo funciona "mejor en una tarjeta gráfica" y lista TensorRT, DirectML y HLSL como runtimes compatibles, además de CPU.
- Cabe en GPU de consumo: por el tamaño de los pesos (unos 0,13 GB), es previsible que quepa en GPU de consumo, aunque no se aportan cifras de VRAM total ni resoluciones máximas.
- Opciones de despliegue: ONNX Runtime (CPU, DirectML, TensorRT) y ejecución vía HLSL; integración con el plugin Vision Core de Sentients para Unreal Engine. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Formato |
|---|---|---|---|---|---|
| efficientvit-sam-l0 (esta ficha) | no disponible | no aplica | Segmentación interactiva (encoder + decoder ONNX) | Apache 2.0 | ONNX |
| EfficientViT-SAM (MIT Han Lab) | no disponible | no aplica | Segmentación interactiva | Apache 2.0 (según el repositorio original) | PyTorch / ONNX |
| SAM (Meta) | no disponible | no aplica | Segmentación interactiva | Apache 2.0 | PyTorch |
| SAM 2 (Meta) | no disponible | no aplica | Segmentación interactiva en imagen y vídeo | Apache 2.0 | PyTorch |

No se dispone en la información proporcionada de datos de rendimiento comparativos entre estas alternativas; la comparativa se limita a licencia, formato y categoría de tarea.

## Limitaciones y advertencias

- Es un modelo exclusivamente de visión: no genera texto, no razona y no soporta tool calling ni agentes.
- No se documentan sesgos específicos; al heredar el entrenamiento de EfficientViT-SAM, puede presentar los sesgos del dataset original, no detallado en la información disponible.
- Riesgo de segmentación incorrecta en objetos ambiguos, ocluidos o de bajo contraste; la puntuación de confianza devuelta debe usarse para filtrar resultados.
- No se especifican resoluciones de entrada soportadas ni límites de tamaño de imagen; el codificador se exportó con formas fijas, lo que puede requerir redimensionado previo.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo original de MIT Han Lab y del catálogo firmado de Sentients.
- Los ficheros están fijados por SHA-256: cualquier variante no coincidente con el hash del catálogo no debe considerarse equivalente.
- No hay información sobre latencia, throughput ni precisión en producción; se recomienda validar en el hardware objetivo antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sentientsai/efficientvit-sam-l0
- Catálogo firmado de Sentients: https://huggingface.co/sentientsai/sentients-catalog
- Modelo original de MIT Han Lab: https://huggingface.co/mit-han-lab/efficientvit-sam

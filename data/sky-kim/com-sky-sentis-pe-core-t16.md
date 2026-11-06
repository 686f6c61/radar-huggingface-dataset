# Sky-Kim/com.sky.sentis.pe-core-t16

## Resumen

`com.sky.sentis.pe-core-t16` es una conversión a Unity Inference Engine (Sentis) del modelo Perception Encoder PE-Core-T16-384 de Meta, un modelo de visión-lenguaje de estilo CLIP que proyecta imágenes y texto en un espacio compartido de 512 dimensiones. Lo publica el usuario Sky-Kim en Hugging Face bajo licencia Apache-2.0, con pesos en Float16 y una API en C# autocontenida pensada para inferencia en dispositivo (on-device) dentro de proyectos Unity.

El modelo resuelve tareas de recuperación imagen-texto y clasificación de imágenes zero-shot: permite buscar personas, vehículos u objetos dentro de un fotograma mediante una descripción textual, calculando el producto escalar entre el embedding de texto y el de cada recorte de imagen. Es relevante para desarrolladores de videojuegos y aplicaciones Unity que necesitan visión por computador local sin depender de servicios en la nube, con un tamaño de repositorio de solo 0,1 GB.

La arquitectura combina una torre de visión ViT-T/16 (ancho 192, 12 capas, RoPE 2D más embedding posicional absoluto, class token y attention pooling) y una torre de texto de ancho 512 con 12 capas y contexto de 32 tokens. El paquete incluye el tokenizador CLIP byte-level BPE y una clase `PeCoreT16` que gestiona preprocesado, inferencia y normalización L2 de los embeddings.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos torres: ViT-T/16 para visión y transformer causal para texto (estilo CLIP) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32 tokens (torre de texto) |
| Tipos de cuantizacion | Float16 en pesos (cómputo en fp32); no se documentan otras |
| Idiomas soportados | no disponible (tokenizador CLIP BPE de 49408 tokens, predominantemente inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.sentis` (Unity Sentis), más `tokenizer.json` y código C# |

## Arquitectura y entrenamiento

El modelo base `facebook/PE-Core-T16-384` es un Perception Encoder de Meta con arquitectura de dos torres. La torre de visión es un ViT-T/16 con ancho 192, 12 capas, embedding posicional absoluto combinado con RoPE 2D, class token y attention pooling, que proyecta a 512 dimensiones. La torre de texto tiene ancho 512, 12 capas, contexto de 32 tokens y también proyecta a 512 dimensiones; agrupa (pooling) en el token de fin de secuencia. La similitud se calcula como producto escalar de embeddings normalizados, con un `logit_scale` de 100 para obtener probabilidades vía softmax.

La conversión a Sentis se realizó exportando ambas torres por separado con `torch.onnx.export` (exportador legacy, opset 17, batch 1, formas fijas, pesos inline) usando el código de referencia `perception_models` (`core.vision_encoder.pe.CLIP`). Posteriormente se importaron en Sentis 2.6.1, se cuantizaron los pesos con `ModelQuantizer.QuantizeWeights(Float16)` y se guardaron con `ModelWriter.Save`. El cómputo permanece en fp32. La normalización `(x - 0.5) / 0.5` está integrada en el grafo de visión, de modo que la entrada es RGB en [0, 1]. No se documentan en la información disponible los detalles del dataset de entrenamiento original ni si hubo RLHF o DPO.

## Capacidades

- Recuperación imagen-texto: genera embeddings de imagen y de texto en un espacio común de 512 dimensiones para búsqueda por descripción textual.
- Clasificación de imágenes zero-shot: asigna etiquetas textuales a recortes de imagen sin entrenamiento específico.
- Procesamiento de recortes (crops) con preprocesado integrado: expansión del bounding box (15 % de ancho por lado, 5 % de alto arriba y abajo), letterboxing con relleno gris medio y dibujo en GPU en textura sRGB.
- Tokenización de texto compatible con `SimpleTokenizer` de open_clip: truncado a 32 tokens, conservación del token de fin y relleno con ceros.
- Inferencia en dispositivo dentro de Unity con backend GPUCompute (con retroceso a CPU si no hay compute shaders).
- API C# unificada con otros paquetes `com.sky.sentis.*` (PeCoreS16, Siglip2Base16), intercambiables cambiando el nombre de clase.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión generativa, audio ni modo thinking.

## Casos de uso

- Búsqueda de personas o vehículos en fotogramas de vigilancia o demos: se calcula el embedding de una descripción como "a photo of a person wearing a red jacket" y se compara por producto escalar con los recortes detectados, permitiendo filtrar candidatos en tiempo real dentro de Unity.
- Clasificación zero-shot de objetos en escenas de videojuego: se etiquetan recortes de la cámara del jugador con categorías textuales sin reentrenar, útil para sistemas de interacción o misiones dinámicas.
- Análisis de color de ropa y vehículos: según las pruebas del autor, el modelo distingue bien chaquetas rojas y furgonetas blancas, por lo que sirve para tareas de identificación cromática en pipelines de visión.
- Asistencia a sistemas de pose: al ser más débil en posturas (margen pequeño entre "lying" y "standing"), se recomienda usarlo como señal complementaria junto a un detector de pose para validar estados corporales.
- Indexado y búsqueda de archivos multimedia locales: se generan embeddings de recortes de un catálogo de imágenes y se recuperan por consulta textual sin conexión a internet.
- Prototipado rápido en editor de Unity: la clase `PeCoreT16` permite cargar modelos, hacer warmup y consultar similitudes con unas pocas líneas de C#, acelerando la validación de ideas de visión antes de invertir en modelos mayores.
- Filtrado previo en dispositivos de gama media: al ocupar 19,7 MB la torre de visión y 127 MB la de texto en fp16, cabe en hardware modesto y puede actuar como primera etapa de un pipeline de visión más pesado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí documenta pruebas de paridad y una comprobación zero-shot:

| Comparación | Visión (coseno, diferencia máx.) | Texto (coseno, diferencia máx.) |
|---|---|---|
| PyTorch vs ONNX Runtime | 1.000000 (2,1e-6) | 0.9999998 (1,3e-5) |
| ONNX Runtime vs Sentis fp32 CPU | 1.000000 (2,1e-6) | 1.000000 (1,0e-5) |
| ONNX Runtime vs Sentis fp32 GPUCompute | 1.000000 (1,9e-6) | 1.000000 (1,1e-5) |
| ONNX Runtime vs Sentis fp16 CPU | 0.999999 (5,7e-4) | 1.000000 (1,2e-3) |
| ONNX Runtime vs Sentis fp16 GPUCompute | 0.999999 (5,7e-4) | 1.000000 (1,2e-3) |

Comprobación zero-shot (similitud coseno, proyecto Linear, GPUCompute):

| Consulta \ Recorte | red jacket | lying | white van | standing (dark) |
|---|---|---|---|---|
| a photo of a person wearing a red jacket | **0,455** | 0,351 | 0,344 | 0,388 |
| a photo of a person lying on the ground | 0,364 | **0,437** | 0,387 | 0,415 |
| a photo of a white car | 0,335 | 0,361 | **0,465** | 0,370 |

Las tres consultas ordenan correctamente su recorte correspondiente en primer lugar. El margen para "lying" frente a la persona de pie es pequeño (0,437 frente a 0,415).

## Requisitos de hardware

- VRAM estimada: la torre de visión ocupa 19,7 MB y la de texto 127 MB en fp16; el conjunto requiere muy poca memoria, por debajo de 1 GB incluyendo buffers de activación.
- GPU recomendadas: cualquier GPU compatible con compute shaders de Unity; el autor midió tiempos en un Apple M5 Max con Unity 6000.3 en modo batch y Sentis 2.6.1.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 4090, RTX 3060, integradas con soporte de compute shaders); también funciona en CPU.
- Opciones de despliegue: Unity Inference Engine (Sentis) 2.6.1 con backend GPUCompute o CPU; no se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo generativo de texto.
- Latencia y throughput: el autor indica que `LastCropsMs` mide la duración de la última llamada a `EmbedCropsAsync` y que los tiempos varían unos pocos milisegundos entre ejecuciones, pero la tabla de tiempos está truncada en la información disponible, por lo que no se pueden citar cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| com.sky.sentis.pe-core-t16 | no disponible | 32 tokens | Imagen-texto (CLIP) | Apache-2.0 | Hugging Face, Unity Sentis |
| facebook/PE-Core-T16-384 | no disponible | 32 tokens | Imagen-texto (CLIP) | Apache-2.0 | Hugging Face (modelo base) |
| Siglip2Base16 (paquete com.sky.sentis.*) | no disponible | no disponible | Imagen-texto | no disponible | Hugging Face, Unity Sentis |
| PeCoreS16 (paquete com.sky.sentis.*) | no disponible | no disponible | Imagen-texto | no disponible | Hugging Face, Unity Sentis |

Los dos últimos son paquetes del mismo autor con API C# idéntica, pensados para intercambiar el modelo cambiando el nombre de clase. No se dispone de datos de rendimiento comparativo entre ellos en la información proporcionada.

## Limitaciones y advertencias

- El modelo es pequeño (ViT-T/16) y muestra debilidad en tareas de postura: el margen entre "lying" y "standing" es de solo 0,022, por lo que conviene combinarlo con un detector de pose.
- La torre de texto tiene un contexto máximo de 32 tokens, insuficiente para descripciones largas o consultas complejas.
- El tokenizador CLIP byte-level BPE está orientado al inglés; no se documentan capacidades multilingües y los idiomas soportados figuran como no disponibles.
- Riesgo de alucinación en el sentido de falsos positivos en la clasificación: al ser un modelo de similitud, puede asignar puntuaciones altas a recortes no relacionados si el texto es ambiguo.
- Las diferencias de preprocesado entre el letterbox de Unity (GPU, sRGB) y el resize bilineal de PIL en Python producen variaciones de coseno de 0,980 a 0,998 en proyectos Linear, atribuibles solo al remuestreo.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar la licencia del modelo base y de los datos de entrenamiento originales de Meta antes de producción.
- No se documentan sesgos conocidos ni evaluaciones de equidad en la información disponible.
- El paquete tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria amplia.

## Enlaces

- Hugging Face: https://huggingface.co/Sky-Kim/com.sky.sentis.pe-core-t16
- Modelo base: https://huggingface.co/facebook/PE-Core-T16-384
- Paper de referencia: https://arxiv.org/abs/2504.13181
- Repositorio de referencia `perception_models` de Meta: no disponible en la información proporcionada
- Documentación de Unity Sentis: no disponible en la información proporcionada

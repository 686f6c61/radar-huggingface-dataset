# julienkay/FLUX.2-klein-4B-sentis-float16

## Resumen

FLUX.2 [klein] 4B es un modelo de generación de imágenes a partir de texto (text-to-image) desarrollado por Black Forest Labs, la misma casa responsable de la familia FLUX.1. Esta ficha concreta, publicada por el usuario julienkay, no es el modelo original, sino una conversión no oficial de los pesos a formato `.sentis` en precisión float16, pensada para su uso dentro del motor de inferencia de Unity (Unity Inference Engine) y del paquete `tools.doji.diffusers`.

El objetivo de esta conversión es permitir la ejecución del modelo dentro de proyectos Unity, de modo que desarrolladores de videojuegos y aplicaciones interactivas puedan integrar generación de imágenes en tiempo de ejecución sin depender de servicios externos ni de runtimes de Python. El repositorio ocupa 14,1 GB y los archivos `.sentis` propiamente dichos suman 13,1 GiB.

La relevancia de esta variante es fundamentalmente práctica: ofrece una vía para desplegar un modelo de difusión de 4B parámetros en el ecosistema Unity con pesos en media precisión, manteniendo la licencia Apache 2.0 del modelo base. No se dispone de información sobre la arquitectura interna, los datos de entrenamiento ni los benchmarks del modelo original en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusión text-to-image; detalles internos no especificados) |
| Parametros totales | 4B (según el nombre del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no aplica directamente a text-to-image) |
| Tipos de cuantizacion | float16 (pesos de rango 2 o superior leídos por MatMul, Gemm, Conv, ConvTranspose y Gather); float32 para el resto (biases, pesos de normalización) |
| Idiomas soportados | no disponible (prompts presumiblemente en inglés, no confirmado) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.sentis` (Unity Inference Engine); también disponible en ONNX y en versión uint8 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base FLUX.2 [klein] 4B en la documentación proporcionada: no se detalla si emplea un transformer de difusión, un esquema de flow matching, ni la composición del dataset de entrenamiento, el número de tokens o si hubo etapas de RLHF/DPO o ajuste fino por preferencias.

Lo que sí está documentado es el proceso de conversión. Los archivos `.sentis` se generaron a partir de la exportación ONNX publicada en `julienkay/FLUX.2-klein-4B-onnx`, utilizando la herramienta `tools.doji.onnx-model-loader` con la llamada `OnnxModelLoader.Save(onnxPath, sentisPath, QuantizationType.Float16)`. El proceso escribe los pesos uno a uno desde el ONNX al archivo `.sentis`, evitando mantener todos los pesos en memoria simultáneamente. Los pesos de rango 2 o superior consumidos por capas MatMul, Gemm, Conv, ConvTranspose y Gather se almacenan en float16, mientras que el resto permanece en float32. En el dispositivo, los pesos se mantienen en float16 y se convierten a float32 justo antes de la capa que los lee por primera vez, de modo que solo existen copias float32 para las capas en ejecución. Los archivos se guardaron con Inference Engine 2.6, y el autor advierte que una versión posterior del motor podría requerir reconvertirlos desde los archivos ONNX.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image).
- Inferencia con pocos pasos: el ejemplo documentado funciona con 4 pasos de inferencia y guidance scale 1.
- Resolución de salida configurable; el ejemplo usa 512 × 512.
- Control de semilla para reproducibilidad (`seed: 42` en el ejemplo).
- Integración nativa con Unity mediante el paquete `tools.doji.diffusers` y la clase `Flux2KleinPipeline`.
- Carga de modelos desde el AI Model Hub de Unity (`Window > AI Model Hub`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento, ya que se trata de un modelo de generación de imágenes.

## Casos de uso

- Generación de assets en tiempo de ejecución dentro de videojuegos Unity: el pipeline `Flux2KleinPipeline` permite crear imágenes a partir de prompts en el propio motor, útil para texturas, ilustraciones o contenido procedural generado dinámicamente según la partida.
- Prototipado rápido de conceptos visuales en el editor: los desarrolladores pueden integrar el modelo en herramientas internas de Unity para explorar variaciones de diseño con 4 pasos de inferencia y semillas fijas, reduciendo el coste de iteración.
- Aplicaciones interactivas de escritorio o standalone: al ejecutarse mediante Unity Inference Engine, el modelo puede desplegarse en binarios Unity sin depender de un servidor Python, lo que simplifica la distribución.
- Personalización de contenido para el usuario final: con control de semilla y prompt, se pueden generar imágenes coherentes con parámetros del usuario (por ejemplo, variaciones de un mismo personaje o escena) dentro de una aplicación Unity.
- Educación y demostraciones técnicas: el repositorio incluye un ejemplo reproducible (zorro rojo en bosque nevado, 512 × 512, 4 pasos, semilla 42) que sirve como referencia para validar la integración del motor en entornos Unity.
- Investigación sobre despliegue de modelos de difusión en motores de juego: la conversión a `.sentis` con gestión de precisión mixta (float16 en dispositivo, float32 por capa activa) es un caso de estudio sobre optimización de memoria en runtimes no convencionales.
- Sustitución de la variante uint8 cuando se prioriza calidad: al existir una versión uint8 en el mismo perfil de autor, esta variante float16 es adecuada para escenarios donde la fidelidad de los pesos importa más que la huella de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Los archivos `.sentis` ocupan 13,1 GiB en disco; el repositorio completo ocupa 14,1 GB.
- VRAM estimada para inferencia: no disponible de forma explícita. Con pesos float16 de un modelo de 4B parámetros, el peso bruto de los pesos ronda los 8 GB, a lo que hay que sumar activaciones, buffers de atención y copias float32 temporales de las capas activas, por lo que se requiere una GPU con holgura por encima de esa cifra.
- GPU recomendadas: no disponible en la documentación. Por el perfil de memoria, se necesitan GPU de gama alta con al menos 12-16 GB de VRAM como referencia orientativa, aunque el autor no lo especifica.
- Compatibilidad con GPU de consumo: no confirmada. El tamaño de los pesos y la conversión float32 por capa hacen poco probable su ejecución en GPU con menos de 8-12 GB de VRAM.
- Opciones de despliegue: Unity Inference Engine 2.6 (versión con la que se guardaron los archivos) a través del paquete `tools.doji.diffusers`. También existe una exportación ONNX en `julienkay/FLUX.2-klein-4B-onnx` para otros runtimes.
- Latencia y throughput: no disponibles. El ejemplo documentado emplea 4 pasos de inferencia a 512 × 512, pero no se publican tiempos de ejecución ni hardware de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FLUX.2-klein-4B-sentis-float16 (esta ficha) | 4B | no disponible | `.sentis` float16 | Apache 2.0 | Hugging Face, 0 descargas |
| FLUX.2-klein-4B-sentis-uint8 | 4B | no disponible | `.sentis` uint8 | Apache 2.0 | Hugging Face |
| FLUX.2-klein-4B-onnx | 4B | no disponible | ONNX | Apache 2.0 | Hugging Face |
| FLUX.2-klein-4B (original) | 4B | no disponible | safetensors (presumible) | Apache 2.0 | Hugging Face (black-forest-labs) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada; la comparación se limita a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Conversión no oficial: los pesos han sido modificados por un tercero (julienkay) y no están respaldados por Black Forest Labs; el autor lo indica explícitamente en la model card.
- Dependencia de versión del motor: los archivos se guardaron con Inference Engine 2.6 y podrían requerir reconversión desde ONNX con versiones posteriores.
- Precisión mixta: aunque los pesos se almacenan en float16, se convierten a float32 antes de cada capa, lo que incrementa el uso de memoria respecto a una inferencia puramente float16.
- Sin datos de benchmarks: no hay métricas publicadas de calidad, fidelidad prompt-imagen ni comparaciones con el modelo original.
- Idiomas no confirmados: la model card no especifica qué idiomas soporta para los prompts; el ejemplo está en inglés.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.
- Riesgo de sesgos y alucinación visual: al no documentarse el dataset de entrenamiento del modelo base, no se pueden evaluar sesgos conocidos ni la tendencia a generar contenido inexacto o estereotipado.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar el archivo `LICENSE.md` del repositorio y la licencia del modelo base para confirmar condiciones de atribución.
- Requisitos de memoria elevados: 13,1 GiB de pesos en disco y necesidad de VRAM holgada limitan su despliegue a hardware de gama alta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/julienkay/FLUX.2-klein-4B-sentis-float16
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Versión ONNX: https://huggingface.co/julienkay/FLUX.2-klein-4B-onnx
- Versión Sentis uint8: https://huggingface.co/julienkay/FLUX.2-klein-4B-sentis-uint8
- Paquete Unity `tools.doji.diffusers`: https://github.com/julienkay/tools.doji.diffusers
- Herramienta de conversión `tools.doji.onnx-model-loader`: https://github.com/julienkay/tools.doji.onnx-model-loader
- Documentación de Unity Inference Engine: https://docs.unity3d.com/Packages/com.unity.ai.inference@latest

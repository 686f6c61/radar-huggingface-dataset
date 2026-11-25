# julienkay/FLUX.2-klein-4B-sentis-uint8

## Resumen

FLUX.2 [klein] 4B (Sentis, uint8) es una conversión no oficial del modelo de generación de imágenes FLUX.2 [klein] 4B de Black Forest Labs, realizada por el desarrollador julienkay para el Unity Inference Engine (Sentis) y el paquete de Unity tools.doji.diffusers. No se trata de un modelo nuevo entrenado desde cero, sino de una reempaquetadura de los pesos originales en el formato `.sentis` con cuantización uint8, pensada para ejecutar generación texto-a-imagen dentro del motor de videojuegos Unity.

El modelo base, FLUX.2 [klein] 4B, es un modelo de difusión de 4.000 millones de parámetros orientado a text-to-image, distribuido bajo licencia Apache 2.0. Esta conversión mantiene esa licencia y conserva las capacidades generativas del original, pero adapta el formato de pesos para que puedan cargarse y ejecutarse mediante la API de inferencia de Unity sin depender de PyTorch ni de ONNX Runtime en tiempo de ejecución.

La relevancia de esta ficha es práctica: permite a desarrolladores de Unity integrar un modelo de difusión de última generación directamente en sus proyectos, con un peso en disco de 6,6 GiB para los ficheros `.sentis` (frente a los 17,2 GB del repositorio completo, que incluye otros artefactos). Es una opción a considerar cuando se necesita generación de imágenes local dentro del editor o en builds de Unity, sin servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (text-to-image); detalles internos de la arquitectura del base no disponibles en la información proporcionada |
| Parametros totales | 4B (según denominación del modelo base FLUX.2 [klein] 4B) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | uint8 para pesos de rango ≥2 en capas MatMul, Gemm, Conv, ConvTranspose y Gather; float32 para biases y pesos de normalización; una escala y punto cero por tensor |
| Idiomas soportados | No disponible (los prompts se procesan mediante el text encoder del modelo base; no se detalla cobertura lingüística) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.sentis` (Unity Inference Engine 2.6); también disponible en ONNX y en Sentis float16 en repositorios hermanos |

## Arquitectura y entrenamiento

Esta ficha describe una conversión, no un entrenamiento. Los pesos provienen del modelo base FLUX.2 [klein] 4B de Black Forest Labs, un modelo de difusión de 4.000 millones de parámetros para generación de imágenes a partir de texto. La información proporcionada no detalla la arquitectura interna del base (tipo de backbone, mecanismo de atención, número de tokens de entrenamiento ni composición del dataset), por lo que esos datos deben consultarse en la model card del modelo original.

El proceso de conversión parte de la exportación ONNX disponible en julienkay/FLUX.2-klein-4B-onnx. Cada componente se carga con `tools.doji.onnx-model-loader` mediante `OnnxModelLoader.Load(onnxPath, QuantizationType.Uint8)` y se guarda con `ModelWriter.Save`. El cargador cuantiza los pesos uno a uno durante la carga, de modo que nunca mantiene todos los pesos float32 en memoria simultáneamente. Los pesos de rango 2 o superior leídos por capas MatMul, Gemm, Conv, ConvTranspose y Gather se almacenan como uint8; el resto (biases, pesos de normalización) permanece en float32. En el dispositivo, los pesos uint8 se desquantizan a float32 justo antes de la capa que los lee por primera vez, por lo que solo existen copias float32 de las capas en ejecución. Los ficheros se guardaron con Inference Engine 2.6; versiones posteriores pueden requerir reconversión desde los ONNX.

## Capacidades

- Generación de imágenes a partir de prompts de texto (text-to-image) mediante la pipeline `Flux2KleinPipeline`.
- Ejecución local dentro del Unity Inference Engine, sin dependencia de PyTorch ni de ONNX Runtime en runtime.
- Control de parámetros de generación: anchura, altura, número de pasos de inferencia, escala de guiado (guidance scale) y semilla.
- Generación rápida con pocos pasos: el ejemplo de la model card usa 4 pasos de inferencia con guidance scale 1 y resolución 512×512.
- Integración con el flujo de trabajo de Unity: carga de modelos desde `Window > AI Model Hub` y uso mediante API C# (`Doji.AI.Diffusers`).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking (no aplica a un modelo de difusión de imagen).

## Casos de uso

- Generación de arte conceptual dentro del editor de Unity: el modelo se carga con `Flux2KleinPipeline.FromPretrainedAsync` y permite iterar prompts con semilla fija para explorar variantes de un concepto sin salir del entorno de desarrollo.
- Prototipado rápido de assets 2D: con 4 pasos y 512×512 se obtienen imágenes de referencia en segundos, útiles para maquetas de niveles, iconos o texturas preliminares antes de encargar arte final.
- Herramientas de autoría para diseñadores: integración de un panel en el editor que genere variaciones de un prompt con control de semilla, resolución y guidance, aprovechando la API C# del paquete tools.doji.diffusers.
- Generación de imágenes en builds de escritorio: al ejecutarse sobre Unity Inference Engine, el modelo puede desplegarse en aplicaciones de escritorio que necesiten crear imágenes localmente sin conexión a servicios externos.
- Automatización de contenido para pruebas: generación por lotes de imágenes de relleno con semillas distintas para poblar escenas de test o simulaciones, reduciendo la dependencia de assets de terceros.
- Investigación y experimentación con cuantización: el repositorio sirve como referencia para estudiar el impacto de la cuantización uint8 por tensor (una escala y punto cero por tensor) en la calidad de salida de un modelo de difusión de 4B, comparando con la versión float16 disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye una imagen de ejemplo generada en Unity (un zorro rojo en un bosque nevado, 4 pasos, guidance scale 1, semilla 42, 512×512) sin métricas cuantitativas (FID, CLIP score, etc.) ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- Peso en disco de los ficheros `.sentis`: 6,6 GiB (el repositorio completo ocupa 17,2 GB, incluyendo otros artefactos).
- VRAM estimada para inferencia: no disponible de forma explícita; como referencia, los pesos uint8 ocupan aproximadamente 6,6 GiB en dispositivo, más las copias float32 temporales de las capas en ejecución y las activaciones, por lo que se recomienda disponer de margen adicional sobre esa cifra.
- GPU recomendadas: no especificadas en la información proporcionada. Por el tamaño de pesos, se requiere una GPU con al menos 8 GB de VRAM como punto de partida, aunque no hay confirmación oficial.
- ¿Cabe en GPU de consumo? Probable en GPUs con 8-12 GB o más de VRAM, pero no confirmado por el autor.
- Opciones de despliegue: Unity Inference Engine (Sentis) 2.6 o superior mediante el paquete tools.doji.diffusers; también existen versiones ONNX y Sentis float16 en repositorios hermanos para otros flujos.
- Latencia y throughput: no disponibles. El ejemplo usa 4 pasos de inferencia a 512×512, lo que sugiere un coste bajo por imagen, pero no se aportan tiempos medidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Licencia | Contexto / resolución | Disponibilidad |
|---|---|---|---|---|---|
| FLUX.2 [klein] 4B (Sentis, uint8) | 4B | `.sentis` uint8 | Apache 2.0 | 512×512 en el ejemplo; otras resoluciones no documentadas | Hugging Face (julienkay) |
| FLUX.2 [klein] 4B (Sentis, float16) | 4B | `.sentis` float16 | Apache 2.0 | Igual que el base | Hugging Face (julienkay) |
| FLUX.2 [klein] 4B (ONNX) | 4B | ONNX | Apache 2.0 | Igual que el base | Hugging Face (julienkay) |
| FLUX.2 [klein] 4B (original) | 4B | Pesos originales (no especificado) | Apache 2.0 | No disponible en esta ficha | Hugging Face (black-forest-labs) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada; la diferencia principal es el formato y la precisión de los pesos, no el modelo subyacente.

## Limitaciones y advertencias

- Conversión no oficial: el autor indica explícitamente que se trata de una conversión no oficial; no está respaldada por Black Forest Labs.
- Compatibilidad de versión: los ficheros se guardaron con Inference Engine 2.6; versiones posteriores del motor pueden requerir reconvertir desde los ONNX.
- Cuantización uint8: la precisión reducida puede degradar la calidad de imagen frente a la versión float16 u original; no se aportan métricas de la magnitud de esa degradación.
- Idiomas: no se detalla la cobertura lingüística de los prompts; se desconoce el comportamiento con idiomas distintos del inglés.
- Sesgos y alucinaciones: no documentados en la información proporcionada; como modelo de difusión, puede generar contenido inexacto o reflejar sesgos del dataset de entrenamiento original.
- Licencia: Apache 2.0 permite uso comercial, pero deben respetarse los términos del modelo base y de los componentes incluidos; consultar LICENSE.md del repositorio.
- Sin métricas de rendimiento publicadas: no hay benchmarks que permitan evaluar la calidad objetiva de esta conversión frente a alternativas.
- Repositorio con 0 descargas y 0 likes en el momento de la ficha: ecosistema muy incipiente, sin validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/julienkay/FLUX.2-klein-4B-sentis-uint8
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Versión ONNX: https://huggingface.co/julienkay/FLUX.2-klein-4B-onnx
- Versión Sentis float16: https://huggingface.co/julienkay/FLUX.2-klein-4B-sentis-float16
- Paquete Unity tools.doji.diffusers: https://github.com/julienkay/tools.doji.diffusers
- Cargador ONNX tools.doji.onnx-model-loader: https://github.com/julienkay/tools.doji.onnx-model-loader
- Documentación de Unity Inference Engine: https://docs.unity3d.com/Packages/com.unity.ai.inference@latest

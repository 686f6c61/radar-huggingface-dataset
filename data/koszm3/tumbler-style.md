# koszm3/tumbler-style

## Resumen

Tumbler-style es un paquete de pesos de Stable Diffusion 1.5 convertidos a Core ML para ejecución en dispositivo (on-device) en el ecosistema Apple. Lo publica el usuario koszm3 y está pensado como el modelo de estilo "AI" de la aplicación Tumbler: una fusión del checkpoint base de Stable Diffusion 1.5 con un LoRA de estilo low-poly propio de la app, más el ControlNet de bordes Canny de lllyasviel, todo empaquetado en un único artefacto Core ML de 6 bits y resolución 512x512.

No es un modelo de lenguaje ni un modelo generativo de nueva generación: es un artefacto de inferencia de difusión optimizado para ejecutarse localmente en hardware Apple mediante la librería apple/ml-stable-diffusion. Su interés es fundamentalmente práctico para desarrolladores que quieran replicar el pipeline de generación condicionada por boceto (Canny) en macOS o iOS sin depender de servidores, y como ejemplo de empaquetado de SD 1.5 + LoRA + ControlNet en Core ML.

El repositorio es pequeño (1,2 GB, coherente con pesos cuantizados a 6 bits) y no incluye pipeline declarado, idiomas ni métricas. La licencia heredada es CreativeML OpenRAIL-M, con las restricciones de uso de esa licencia aplicadas tanto al modelo como a las imágenes generadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion 1.5 (UNet + VAE + text encoder CLIP) convertido a Core ML, con ControlNet Canny fusionado |
| Parametros totales | no disponible (los del SD 1.5 base; el autor no publica recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusion; el prompt de texto se tokeniza a 77 tokens, limite estandar de SD 1.5) |
| Tipos de cuantizacion | 6 bits (paletizacion Core ML), resolucion 512x512 |
| Idiomas soportados | no disponibles (el text encoder CLIP de SD 1.5 es predominantemente ingles) |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | Core ML (.mlpackage / .mlmodelc) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura latente de Stable Diffusion 1.5: un UNet de difusion que opera en el espacio latente del VAE, condicionado por embeddings de texto de CLIP. Sobre ese esqueleto se han aplicado dos capas: un LoRA de estilo "tumbler low-poly" fusionado en los pesos del UNet, y el ControlNet `lllyasviel/sd-controlnet-canny`, que añade una rama de control espacial que condiciona la generación a partir de un mapa de bordes Canny de la imagen de entrada.

La conversión a Core ML se ha realizado con `apple/ml-stable-diffusion`, con cuantización a 6 bits y resolución fija de 512x512. No se detalla en la información disponible el dataset del LoRA, el número de pasos de entrenamiento, ni si hubo ajuste fino adicional. Tampoco se especifica la composición del pipeline de conversión (por ejemplo, si se separaron text encoder, UNet y VAE en módulos independientes o se empaquetaron conjuntamente).

## Capacidades

- Generación de imágenes texto-a-imagen a 512x512 con el estilo low-poly de la app Tumbler.
- Generación condicionada por imagen: ControlNet Canny permite usar un boceto de bordes como guía estructural.
- Inferencia on-device en hardware Apple mediante Core ML, sin necesidad de GPU dedicada ni conexión a servidores.
- Cuantización a 6 bits, lo que reduce el peso del artefacto (1,2 GB) y facilita su distribución en apps.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo de difusión de imágenes.
- Capacidades multilingües no documentadas; el comportamiento esperado es el del text encoder CLIP de SD 1.5, con mejor rendimiento en inglés.

## Casos de uso

- Generación de ilustraciones low-poly en apps móviles: el modelo puede integrarse en una app iOS o macOS para producir imágenes con el estilo de la marca Tumbler directamente en el dispositivo, sin enviar prompts a un servidor.
- Control de composición por boceto: un usuario dibuja los contornos de una escena y el ControlNet Canny fuerza a la generación a respetar esa estructura, útil para herramientas de diseño asistido.
- Prototipado rápido de assets visuales: estudios pequeños pueden generar variaciones de estilo low-poly para maquetas, presentaciones o material de marketing sin infraestructura de GPU en la nube.
- Filtros creativos en apps de fotografía: a partir de una foto convertida a bordes Canny, el modelo puede producir una versión estilizada low-poly manteniendo la silueta original.
- Demostraciones de IA generativa offline: útil en entornos con requisitos de privacidad o sin conectividad, ya que todo el cómputo ocurre localmente en el dispositivo Apple.
- Base para fine-tuning o experimentación con Core ML: sirve como referencia para desarrolladores que quieran empaquetar su propio SD 1.5 + LoRA + ControlNet en formato Core ML.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido tradicional; el modelo está pensado para ejecutarse en el Neural Engine y la GPU integrada de chips Apple (M1, M2, M3, M4 y variantes Pro/Max/Ultra).
- GPU recomendadas: hardware Apple Silicon con al menos 8 GB de memoria unificada; para 512x512 y 6 bits se recomienda 16 GB o más para mayor comodidad.
- Compatibilidad con GPU de consumo NVIDIA: no directamente, al estar en formato Core ML; requeriría reconversión a otro formato (por ejemplo, safetensors o GGUF) y no se garantiza la paridad.
- Opciones de despliegue: `apple/ml-stable-diffusion` (Swift Package), Core ML Tools para Python, y apps nativas macOS/iOS. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del chip, del número de pasos de muestreo y del scheduler elegido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| koszm3/tumbler-style | no disponible (SD 1.5 base) | 512x512, prompt 77 tokens | Core ML 6 bits | CreativeML OpenRAIL-M | Hugging Face, 0 descargas |
| stable-diffusion-v1-5/stable-diffusion-v1-5 | ~860 M (UNet) | 512x512, prompt 77 tokens | safetensors, diffusers | CreativeML OpenRAIL-M | Hugging Face, ampliamente usado |
| lllyasviel/sd-controlnet-canny | ~360 M (ControlNet adicional) | 512x512 | safetensors, diffusers | OpenRAIL | Hugging Face |
| apple/coreml-stable-diffusion (ejemplos oficiales) | SD 1.5 / SD 2.1 | 512x512 | Core ML | CreativeML OpenRAIL-M | Repositorio de Apple |

La comparativa directa con modelos de lenguaje no procede: tumbler-style es un artefacto de difusión de imágenes. Frente al SD 1.5 original, la diferencia es el empaquetado Core ML, la cuantización a 6 bits y la fusión del LoRA de estilo y del ControlNet Canny.

## Limitaciones y advertencias

- Licencia CreativeML OpenRAIL-M: impone restricciones de uso (no uso para vigilancia, discriminación, desinformación, etc.) que se aplican tanto al modelo como a las imágenes generadas; revisar el texto completo antes de uso comercial.
- El modelo está atado a la resolución 512x512 y a la cuantización de 6 bits; no se documenta soporte para otras resoluciones ni para distintos niveles de cuantización.
- Dependencia del ecosistema Apple: no es portable a GPUs NVIDIA sin reconversión, lo que limita su uso en servidores convencionales.
- Riesgo de sesgos y alucinaciones visuales heredado de SD 1.5: el modelo puede reproducir estereotipos del dataset original y generar anatomía o texto incoherentes.
- El LoRA de estilo "tumbler" no está documentado en cuanto a datos de entrenamiento, por lo que se desconoce su cobertura y posibles sesgos específicos.
- Sin métricas publicadas ni pipeline declarado: la reproducibilidad y la calidad esperada no están verificadas por terceros.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto de nicho sin validación comunitaria.
- El prompt de texto está limitado a 77 tokens por el text encoder CLIP de SD 1.5; prompts más largos se truncan.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/koszm3/tumbler-style
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- ControlNet Canny: https://huggingface.co/lllyasviel/sd-controlnet-canny
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Librería de conversión Core ML: https://github.com/apple/ml-stable-diffusion

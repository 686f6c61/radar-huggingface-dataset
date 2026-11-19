# dissembill/coreml-sd15

## Resumen

`dissembill/coreml-sd15` es una conversión no oficial de Stable Diffusion 1.5 al formato Core ML, empaquetada específicamente para ejecutarse en Apple Silicon. El autor, `dissembill`, parte del modelo base `runwayml/stable-diffusion-v1-5` y genera un conjunto de artefactos `.mlmodelc` (UNet, text encoder CLIP, VAE encoder/decoder y safety checker) que pueden cargarse directamente en aplicaciones nativas de macOS/iOS mediante Core ML. La conversión aplica una cuantización mixta: precisión Float16 combinada con palettization de 6 bits en la UNet, lo que reduce el peso total del paquete a aproximadamente 1,5 GB.

El modelo resuelve un problema de despliegue: ejecutar generación texto-a-imagen de forma local en hardware Apple sin depender de frameworks de Python como PyTorch o diffusers en tiempo de inferencia. Al estar en formato Core ML, se integra en apps Swift/Objective-C y aprovecha las unidades Neural Engine y GPU de los chips M-series. Está pensado para uso a resolución 512×512 con soporte de prompt negativo y classifier-free guidance.

Es relevante en el contexto de inferencia local en dispositivos Apple, donde el ecosistema Core ML permite distribuir modelos de difusión dentro de aplicaciones sin acceso a red. La model card menciona su uso dentro de la aplicación AIATOR, lo que sugiere que la publicación está orientada a ese cliente concreto más que a un uso generalista. No se han publicado métricas de calidad ni comparativas de rendimiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stable Diffusion 1.5 (UNet + CLIP text encoder + VAE), convertida a Core ML |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen; tokenizador CLIP con límite estándar de 77 tokens) |
| Tipos de cuantizacion | Float16 mixto + palettization de 6 bits en la UNet |
| Idiomas soportados | no disponible (el prompt se procesa con el tokenizador CLIP de SD 1.5, predominantemente inglés) |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | `.mlmodelc` (Core ML compilado), más `vocab.json` y `merges.txt` del tokenizador |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Stable Diffusion 1.5: un UNet de difusión latente que opera sobre un autoencoder VAE, condicionado por un text encoder CLIP. La conversión a Core ML descompone el pipeline en módulos independientes (`Unet.mlmodelc`, `TextEncoder.mlmodelc`, `VAEEncoder.mlmodelc`, `VAEDecoder.mlmodelc`, `SafetyChecker.mlmodelc`) que se encadenan en la aplicación anfitriona. La innovación técnica de esta publicación no está en el entrenamiento, sino en la compresión: la UNet usa precisión mixta Float16 con palettization de 6 bits, una técnica que agrupa pesos en una paleta reducida y almacena índices, reduciendo el tamaño del modelo a costa de una pequeña pérdida de fidelidad numérica.

No se dispone de información sobre el proceso de conversión exacto, el número de pasos de calibración de la paleta ni los datos usados para ajustar los rangos de cuantización. Tampoco se documenta ningún entrenamiento adicional, fine-tuning o alineación (RLHF/DPO); el modelo hereda las capacidades y limitaciones del checkpoint original de Runway. La conversión se atribuye al tooling oficial de Apple para Core ML Stable Diffusion y la publicación corre a cargo de `dissembill`.

## Capacidades

- Generación de imágenes texto-a-imagen a resolución nativa de 512×512.
- Soporte de prompt negativo y classifier-free guidance (CFG), según la model card.
- Pipeline de difusión latente completo: text encoder CLIP, UNet, VAE encoder/decoder y safety checker.
- Ejecución local en Apple Silicon mediante Core ML, sin dependencia de PyTorch en inferencia.
- Integración con la aplicación AIATOR (selección de "SD 1.5" en el apartado de modelo).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento; no aplica a un modelo de difusión.
- Capacidades multilingües: no documentadas; el tokenizador CLIP de SD 1.5 está entrenado principalmente en inglés.

## Casos de uso

- Generación de imágenes offline en apps macOS/iOS: al estar en formato Core ML, el paquete puede embeber en una app Swift y generar imágenes sin conexión, aprovechando Neural Engine y GPU del chip M-series.
- Prototipado rápido en Apple Silicon: desarrolladores que quieran validar un pipeline de difusión local sin instalar PyTorch ni diffusers pueden cargar los `.mlmodelc` directamente con Core ML.
- Integración en la aplicación AIATOR: la model card describe explícitamente el flujo de descarga a `~/Library/Application Support/AIATOR/models/coreml-sd15` y la selección del modelo en la interfaz.
- Generación de ilustraciones y assets a 512×512 para prototipos de producto, con control mediante prompt negativo y CFG para ajustar la fidelidad al prompt.
- Pruebas de cuantización en producción: útil para evaluar el impacto de la palettization de 6 bits frente al modelo original en Float16 en términos de calidad visual y latencia.
- Distribución en dispositivos con almacenamiento limitado: el tamaño aproximado de 1,5 GB facilita empaquetar el modelo dentro de aplicaciones sin superar límites habituales de descarga.
- Educación y demos: ejecutar SD 1.5 en un portátil Apple sin GPU dedicada para talleres o demostraciones de difusión local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de FID, CLIP score, latencia ni throughput, ni comparativas con el checkpoint original en Float16.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el paquete ocupa aproximadamente 1,5 GB, por lo que la memoria unificada necesaria para cargar los módulos es del orden de esa cifra más los buffers de inferencia.
- GPU recomendadas: chips Apple Silicon (M1, M2, M3 y posteriores). No aplica a GPU NVIDIA/AMD, ya que el formato `.mlmodelc` es específico de Core ML.
- Cabe en hardware de consumo: sí, en cualquier Mac con Apple Silicon; también en dispositivos iOS/iPadOS compatibles con Core ML, aunque la model card no detalla requisitos mínimos.
- Opciones de despliegue: Core ML nativo (Swift/Objective-C), la aplicación AIATOR y, en general, cualquier app que cargue modelos `.mlmodelc`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que no soportan este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolución | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dissembill/coreml-sd15` | no disponible (SD 1.5, ~1,5 GB cuantizado) | 512×512 | Core ML (`.mlmodelc`) | CreativeML OpenRAIL-M | Hugging Face, 0 descargas |
| `runwayml/stable-diffusion-v1-5` | ~860 M (UNet) + CLIP + VAE | 512×512 | safetensors / diffusers | CreativeML OpenRAIL-M | Hugging Face, ampliamente usado |
| `apple/coreml-stable-diffusion-v1-5-palettized` | equivalente a SD 1.5 | 512×512 | Core ML (`.mlmodelc`) | CreativeML OpenRAIL-M | Hugging Face, mantenido por Apple |
| `stabilityai/stable-diffusion-2-1` | ~865 M (UNet) | 768×768 | safetensors / diffusers | CreativeML OpenRAIL++-M | Hugging Face |

La comparación directa más relevante es con la conversión palettized oficial de Apple, que persigue el mismo objetivo (SD 1.5 en Core ML con cuantización) y cuenta con mantenimiento y documentación por parte de Apple. La conversión de `dissembill` no documenta diferencias técnicas frente a ella más allá de su integración con AIATOR.

## Limitaciones y advertencias

- Conversión no oficial: no está respaldada por Runway ni por Apple; la calidad de la conversión y la calibración de la palettization no están documentadas.
- La palettization de 6 bits en la UNet puede introducir degradación numérica frente al modelo original en Float16; no se han publicado evaluaciones de calidad.
- Sesgos y alucinaciones visuales heredados de SD 1.5: sesgos de representación, estereotipos y artefactos en anatomía, texto y composiciones complejas.
- El tokenizador CLIP de SD 1.5 está orientado a inglés; el rendimiento con prompts en castellano u otros idiomas no está garantizado ni documentado.
- Licencia CreativeML OpenRAIL-M: permite uso comercial con restricciones de uso (prohibición de usos dañinos, obligación de incluir aviso de licencia y restricciones de redistribución). Es responsabilidad del integrador revisar el texto completo en `LICENSE`.
- El safety checker incluido puede filtrar contenido; su comportamiento y umbrales no están documentados.
- Formato exclusivo de Core ML: no portable a otros runtimes ni a hardware no Apple.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin señales de mantenimiento ni comunidad.
- Resolución fija de 512×512; no se documenta soporte de otras resoluciones ni de inpainting/outpainting.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dissembill/coreml-sd15
- Modelo base: https://huggingface.co/runwayml/stable-diffusion-v1-5
- Tooling de Apple para Core ML Stable Diffusion: https://github.com/apple/ml-stable-diffusion
- Conversión palettized oficial de Apple (referencia): https://huggingface.co/apple/coreml-stable-diffusion-v1-5-palettized
- Documentación de Core ML: https://developer.apple.com/documentation/coreml

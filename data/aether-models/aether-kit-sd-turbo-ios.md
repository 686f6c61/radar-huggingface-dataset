# aether-models/aether-kit-sd-turbo-ios

## Resumen

Aether-kit-sd-turbo-ios es una exportación del modelo de difusión text-to-image `stabilityai/sd-turbo` (revisión `b261bac6`) realizada por la organización aether-models mediante el exportador Forge del SDK Aether-Kit. El resultado no es un modelo en formato PyTorch o Diffusers convencional, sino un conjunto de grafos Core AI empaquetados con un manifiesto `.aether/aether.json` y pensados para cargarse con la clase `AetherImage` (variante iOS, familia `latent-diffusion@1`) del mencionado SDK.

El modelo conserva la arquitectura del SD-Turbo original: un text encoder CLIP, una U-Net y un VAE decoder, con resolución fija de 512×512. La particularidad de esta exportación es la precisión mixta: el encoder CLIP se mantiene en float32, mientras que la U-Net y el VAE decoder se convierten a fp16, lo que reduce el peso del repositorio hasta unos 3,2 GB. Según la model card, el export se ha validado contra CPU Diffusers y los resultados quedan documentados en `export-report.json`.

La relevancia de esta ficha es acotada: no se trata de un modelo nuevo ni de un fine-tune con capacidades distintas, sino de un artefacto de despliegue para el ecosistema Apple (Core AI, con requisitos de macOS 27 o iOS 27). Su utilidad práctica depende por completo de que el desarrollador adopte el SDK Aether-Kit, y su licencia impone restricciones comerciales estrictas heredadas de Stability AI.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión latente (text encoder CLIP + U-Net + VAE decoder), exportada como grafos Core AI |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo text-to-image; resolución fija 512×512) |
| Tipos de cuantización | Precisión mixta fija: CLIP en float32; U-Net y VAE decoder en fp16 |
| Idiomas soportados | no disponible (prompts en lenguaje natural; sin lista de idiomas declarada) |
| Licencia | Stability AI Community License (`stabilityai-ai-community`), etiquetada como `other` |
| Formato de pesos | Grafos Core AI con manifiesto `.aether/aether.json` (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo subyacente es SD-Turbo, un modelo de difusión latente derivado de Stable Diffusion 2.1 mediante técnicas de destilación adversarial, diseñado para generar imágenes en muy pocos pasos de inferencia (típicamente uno o pocos). La topología incluye un text encoder CLIP que proyecta el prompt a embeddings, una U-Net que realiza la denoising en el espacio latente y un VAE decoder que reconstruye la imagen final a 512×512 píxeles.

Esta exportación concreta no aporta entrenamiento adicional ni cambios en los pesos más allá de la conversión de precisión. El trabajo del exportador Forge (`Forge/sdturbo/`) consiste en transformar los pesos originales en grafos Core AI ejecutables sobre Apple silicon, con CLIP en float32 para preservar la fidelidad de los embeddings de texto y U-Net/VAE en fp16 para reducir el tamaño y acelerar la inferencia. La model card indica que el resultado se ha validado contra CPU Diffusers, pero no se detallan ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo RLHF o DPO, ya que esos datos pertenecen al modelo base y no se reproducen aquí.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) a resolución fija de 512×512.
- Generación rápida en pocos pasos de inferencia, característica propia de la familia SD-Turbo.
- Ejecución sobre Apple silicon mediante Core AI, con requisito de macOS 27 o iOS 27.
- Integración con el SDK Aether-Kit a través de la clase `AetherImage` (variante iOS, `latent-diffusion@1`).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta soporte de visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües: no disponibles; no se declara lista de idiomas para los prompts.

## Casos de uso

- Generación de imágenes en aplicaciones iOS nativas: el modelo se carga con `AetherImage` y produce imágenes de 512×512 en el dispositivo, lo que permite funciones de creación visual sin depender de un servidor externo.
- Prototipado rápido de interfaces creativas: al ser un modelo turbo de pocos pasos, encaja en flujos de iteración donde el usuario ajusta el prompt y necesita una previsualización casi inmediata.
- Funciones de personalización visual en apps de consumo: avatares, fondos o ilustraciones generadas a partir de una descripción textual, con la ventaja de la ejecución local en Apple silicon.
- Demos y pruebas de concepto de Core AI: sirve como ejemplo de referencia para validar el pipeline de exportación Forge y el formato de manifiesto `.aether/aether.json` antes de portar modelos propios.
- Generación de assets para maquetas y wireframes: imágenes de 512×512 suficientes para bocetos de producto o material de marketing preliminar.
- Investigación sobre despliegue de difusión en dispositivos: permite medir latencia, consumo de memoria y fidelidad de la conversión fp16 frente a la ejecución en CPU Diffusers usando `export-report.json` como referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente menciona una validación contra CPU Diffusers documentada en `export-report.json`, sin cifras de calidad de imagen, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 3,2 GB y la inferencia se ejecuta en fp16 para U-Net y VAE, por lo que se requiere memoria unificada de Apple silicon suficiente para cargar los grafos Core AI.
- GPU recomendadas: no se especifican modelos concretos; el runtime exige Apple silicon con macOS 27 o iOS 27.
- Compatibilidad con GPU de consumo: no aplica a GPU NVIDIA o AMD; el artefacto está orientado exclusivamente al ecosistema Apple.
- Opciones de despliegue: SDK Aether-Kit (clase `AetherImage`, variante iOS, `latent-diffusion@1`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aether-kit-sd-turbo-ios | no disponible | 512×512 | Grafos Core AI (`.aether`) | Stability AI Community License | Hugging Face, requiere Aether-Kit y Apple silicon |
| stabilityai/sd-turbo | no disponible | 512×512 | Safetensors / Diffusers | Stability AI Community License | Hugging Face, ecosistema Diffusers |
| stabilityai/sdxl-turbo | no disponible | 512×512 (nativo 1024×1024) | Safetensors / Diffusers | Stability AI Community License | Hugging Face, ecosistema Diffusers |

La comparativa se limita a la familia SD-Turbo porque no se dispone de datos de benchmarks ni de parámetros exactos en la información proporcionada. La diferencia principal frente a `stabilityai/sd-turbo` no es de capacidad, sino de formato y plataforma: esta exportación solo es utilizable con Aether-Kit sobre Apple silicon, mientras que el modelo original se ejecuta con Diffusers en hardware diverso.

## Limitaciones y advertencias

- Licencia restrictiva: la Stability AI Community License limita el uso comercial a organizaciones con ingresos anuales inferiores a 1.000.000 USD y exige registro previo con Stability AI.
- Obligación de atribución: los productos que usen el modelo deben mostrar el texto "Powered by Stability AI".
- Es una versión modificada, no oficial: la model card indica explícitamente que no es un lanzamiento oficial de Stability AI (véase `NOTICE`).
- Dependencia de plataforma: requiere Apple silicon y macOS 27 o iOS 27; no es portable a otros entornos sin reexportar los pesos.
- Formato propietario: los grafos Core AI y el manifiesto `.aether/aether.json` solo se cargan con el SDK Aether-Kit, lo que introduce dependencia de un proyecto de terceros.
- Resolución fija de 512×512: no se documenta soporte de otras resoluciones ni de image-to-image.
- Riesgo de sesgos y alucinación visual: heredados del modelo base SD-Turbo; no se documentan evaluaciones de sesgo específicas para esta exportación.
- Idiomas: no se declara lista de idiomas soportados para los prompts, por lo que la cobertura multilingüe es incierta.
- Sin métricas de calidad publicadas: no hay benchmarks que permitan comparar la fidelidad de esta conversión fp16 frente al modelo original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aether-models/aether-kit-sd-turbo-ios
- Modelo base: https://huggingface.co/stabilityai/sd-turbo
- SDK Aether-Kit en GitHub: https://github.com/bubstackdev/aether-kit
- Organización aether-models en Hugging Face: https://huggingface.co/aether-models

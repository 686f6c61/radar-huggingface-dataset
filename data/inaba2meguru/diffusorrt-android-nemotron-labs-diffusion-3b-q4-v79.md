# Inaba2Meguru/DiffusorRT-Android-Nemotron-Labs-Diffusion-3B-Q4-V79

## Resumen

DiffusorRT Android Nemotron-Labs-Diffusion-3B-Q4-V79 es un paquete de ejecución compilado, no un checkpoint de Transformers al uso. Lo publica el usuario Inaba2Meguru y deriva del modelo base nvidia/Nemotron-Labs-Diffusion-3B. Su propósito es ejecutar ese modelo de difusión de 3.000 millones de parámetros cuantizado a 4 bits sobre la NPU Hexagon V79 del SoC Qualcomm Snapdragon 8 Elite (SM8750), dentro de la aplicación DiffusorRT para Android.

El paquete contiene binarios de contexto qnn.htp generados con QAIRT 2.45.0.260326, junto con los activos de la aplicación: la model card del dispositivo (`phone.json`) y los ficheros del tokenizador (`bpe.json`). No incluye código de aplicación ni pesos en formato estándar (safetensors o GGUF); es material compilado para un runtime propietario y un hardware concreto.

Su relevancia es acotada pero técnica: demuestra la viabilidad de llevar un modelo de difusión de 3B a 4 bits a la NPU de un teléfono de gama alta, compartiendo los mismos pesos para decodificación por difusión, autorregresiva y autoespeculativa. El repositorio ocupa 2,1 GB, pero el conjunto completo de ficheros que descarga la aplicación asciende a 4,84 GB, según se detalla en `android-pack.json`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (base: Nemotron-Labs-Diffusion-3B); paquete compilado para NPU Hexagon V79 vía QNN HTP |
| Parámetros totales | 3.000 millones (según el nombre del modelo base) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4 bits (Q4) |
| Idiomas soportados | no disponible |
| Licencia | nvidia-nemotron-open-model-license |
| Formato de pesos | qnn.htp context binaries (QAIRT 2.45.0.260326), `phone.json`, `bpe.json`; no es safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo subyacente, nvidia/Nemotron-Labs-Diffusion-3B, es un modelo de difusión de 3.000 millones de parámetros. La model card del paquete destaca que los mismos pesos sirven para tres modos de decodificación: difusión, autorregresiva y autoespeculativa. No se proporcionan detalles sobre la composición del dataset de entrenamiento, el número de tokens, ni si hubo fases de RLHF o DPO.

Este repositorio no contiene el entrenamiento ni los pesos originales, sino su compilación para inferencia en NPU. Los binarios de contexto se han generado con Qualcomm AI Runtime (QAIRT) 2.45.0.260326 y están ligados a la NPU Hexagon V79 del Snapdragon 8 Elite (SM8750). El paquete de ejecución reutiliza, sin cambios, el del pack para iPhone (jimmylearnML/DiffusorRT-iPhone-Nemotron-Labs-Diffusion-3B-Q4, revisión 0343d805), y los pesos originales proceden de nvidia/Nemotron-Labs-Diffusion-3B (revisión 0d51902d).

## Capacidades

- Generación de texto mediante decodificación por difusión sobre NPU.
- Decodificación autorregresiva con los mismos pesos.
- Decodificación autoespeculativa, también con los mismos pesos.
- Ejecución íntegra en la NPU Hexagon V79 del Snapdragon 8 Elite.
- Integración en la aplicación DiffusorRT para Android mediante `android-pack.json`.
- No se documentan capacidades de tool calling, agentes, visión, audio ni multilingüismo en la información disponible.

## Casos de uso

- Inferencia local en smartphone de gama alta: ejecutar un modelo de 3B a 4 bits directamente en la NPU de un Snapdragon 8 Elite, sin conexión a servidores externos, para aplicaciones de generación de texto en el dispositivo.
- Evaluación de decodificación por difusión en hardware móvil: comparar en un mismo dispositivo los modos de difusión, autorregresivo y autoespeculativo usando los mismos pesos, lo que permite medir latencia y calidad relativa por modo.
- Desarrollo de aplicaciones DiffusorRT: integrar el pack fijando el repositorio a un commit concreto y leyendo `android-pack.json` para obtener rutas, tamaños y hashes SHA-256 de cada fichero en `Android/data/ai.diffusorrt.phone/files/models/nemotron-3b-q4-v79/`.
- Investigación en cuantización 4 bits sobre NPU: analizar el comportamiento de un modelo de difusión de 3B compilado con QAIRT 2.45.0.260326 en el acelerador Hexagon.
- Pruebas de privacidad por diseño: escenarios donde los datos no pueden salir del dispositivo y se requiere un modelo generativo local de tamaño medio.
- Prototipado de asistentes offline: usar el modelo como motor de texto en apps Android que deban funcionar sin red, aceptando la dependencia de hardware Snapdragon 8 Elite.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica únicamente que los resultados de hardware, cuando se reportan, son específicos del dispositivo y del prompt utilizado.

## Requisitos de hardware

- SoC: Qualcomm Snapdragon 8 Elite (SM8750), obligatorio; los binarios de contexto solo se ejecutan en la NPU Hexagon V79 de ese chip.
- VRAM: no aplica; la inferencia se realiza en la NPU del teléfono. El pack completo de ficheros descargados por la aplicación ocupa 4,84 GB, y el repositorio en Hugging Face ocupa 2,1 GB.
- GPU de escritorio: no compatible; no hay pesos en safetensors ni GGUF para ejecutar en A100, H100 o RTX 4090.
- Opciones de despliegue: exclusivamente la aplicación DiffusorRT para Android con QAIRT 2.45.0.260326; no es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; dependen del dispositivo y del prompt.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DiffusorRT Android Nemotron-Labs-Diffusion-3B-Q4-V79 | 3.000 M | no disponible | qnn.htp (NPU Hexagon V79) | nvidia-nemotron-open-model-license | Hugging Face, 0 descargas |
| nvidia/Nemotron-Labs-Diffusion-3B | 3.000 M | no disponible | no disponible | nvidia-nemotron-open-model-license | Hugging Face (modelo base) |
| jimmylearnML/DiffusorRT-iPhone-Nemotron-Labs-Diffusion-3B-Q4 | 3.000 M | no disponible | pack para iPhone (DiffusorRT) | nvidia-nemotron-open-model-license | Hugging Face (pack para iOS) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No es un checkpoint reutilizable: es material compilado para la aplicación DiffusorRT y la NPU Hexagon V79; no puede cargarse con Transformers, llama.cpp ni otros runtimes estándar.
- Dependencia total de hardware: los binarios qnn.htp solo funcionan en el Snapdragon 8 Elite (SM8750); no hay soporte para otros SoC ni para GPU de escritorio.
- Dependencia de versión: los binarios requieren QAIRT 2.45.0.260326; cambios de runtime pueden invalidar la compilación.
- Licencia: nvidia-nemotron-open-model-license, que debe revisarse antes de cualquier uso comercial; los derechos del modelo original pertenecen a NVIDIA.
- Idiomas soportados no documentados; no se puede asumir cobertura multilingüe.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan mitigaciones específicas.
- Sesgos: no disponibles en la información proporcionada.
- Integración: se recomienda fijar el repositorio a un commit concreto y verificar los SHA-256 de `android-pack.json` antes de desplegar.
- Repositorio con 0 descargas y 0 likes; sin validación comunitaria conocida.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Inaba2Meguru/DiffusorRT-Android-Nemotron-Labs-Diffusion-3B-Q4-V79
- Modelo base: https://huggingface.co/nvidia/Nemotron-Labs-Diffusion-3B/tree/0d51902da1f8869f83413ce642fab402fa5641e0
- Pack para iPhone reutilizado: https://huggingface.co/jimmylearnML/DiffusorRT-iPhone-Nemotron-Labs-Diffusion-3B-Q4/tree/0343d805c686cc0fb714bc64cc0e58d5ed2737df
- Licencia NVIDIA Nemotron Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/

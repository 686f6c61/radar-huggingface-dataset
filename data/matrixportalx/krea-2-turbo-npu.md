# matrixportalx/Krea-2-Turbo-npu

## Resumen

Krea 2 Turbo NPU es un paquete de pesos en formato GGUF preparado específicamente para ejecutar el modelo de difusión Krea 2 Turbo sobre la unidad de procesamiento neuronal (NPU) Hexagon de los SoC Qualcomm Snapdragon, a través del backend de stable-diffusion.cpp. No se trata de un modelo nuevo entrenado por el autor del repositorio, sino de una redistribución y reconversión de cuantización de componentes ya existentes: el DiT de Krea 2 Turbo (12B parámetros, 8 pasos de muestreo, CFG 0), el codificador de texto Qwen3-VL-4B-Instruct de Alibaba y el VAE de Wan 2.1.

El repositorio, publicado por el usuario matrixportalx, actúa como espejo para que sus aplicaciones "Rüya ve Esin" mantengan acceso a los ficheros incluso si los repositorios de origen desaparecen o se hacen privados. La transformación aplicada consiste en reconvertir los tensores desde Q8_0 GGUF y BF16 a tipos soportados por la NPU (Q4_0 y F16), dado que el hardware Hexagon no procesa cuantizaciones K-quant ni BF16.

Su relevancia radica en que demuestra una vía práctica para desplegar un modelo de generación de imágenes de 12B parámetros en hardware móvil Snapdragon, algo poco habitual, y en que documenta con precisión la procedencia y las transformaciones de cada fichero. La licencia Krea 2 Community permite uso comercial a organizaciones con ingresos anuales inferiores a un millón de dólares estadounidenses.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) para generación de imágenes, con codificador de texto Qwen3-VL-4B y VAE Wan 2.1 |
| Parametros totales | 12.820.073.036 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 (DiT y codificador de texto), F16 (tensores BF16 reconvertidos); el original partía de Q8_0 |
| Idiomas soportados | no disponible (el codificador de texto es multilingüe por herencia de Qwen3-VL) |
| Licencia | krea-2-community-license (otros) |
| Formato de pesos | GGUF (diffusion_model.gguf, llm.gguf) y safetensors (vae.safetensors) |

## Arquitectura y entrenamiento

El componente principal es un diffusion transformer (DiT) de 12B parámetros correspondiente a Krea 2 Turbo, configurado para muestreo en 8 pasos con CFG igual a 0, lo que reduce el coste computacional al eliminar la doble pasada de la guía libre de clasificador. El pipeline se completa con un codificador de texto Qwen3-VL-4B-Instruct (Alibaba, Apache 2.0), que aporta comprensión multimodal de texto e imagen, y con el VAE de Wan 2.1 (Apache 2.0) para la codificación y decodificación latente.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni sobre si se aplicaron técnicas de RLHF o DPO en el modelo original; la model card del repositorio no los detalla. La innovación técnica relevante de este paquete es la adaptación de tipos numéricos al backend Hexagon NPU de stable-diffusion.cpp: la conversión de Q8_0 a Q4_0 y de BF16 a F16, necesaria porque el hardware no admite K-quant ni BF16. Esta reconversión implica una pérdida adicional de precisión respecto al original Q8_0, que debe tenerse en cuenta en la calidad final de las imágenes generadas.

## Capacidades

- Generación de imágenes texto-a-imagen mediante un DiT de 12B parámetros con muestreo en 8 pasos y CFG 0.
- Comprensión de prompts multimodales a través del codificador Qwen3-VL-4B-Instruct, que admite entrada de texto e imagen.
- Ejecución sobre NPU Hexagon de Qualcomm Snapdragon mediante el backend de stable-diffusion.cpp.
- Soporte multilingüe en los prompts heredado del codificador Qwen3-VL (no confirmado explícitamente en la model card).
- No se documentan capacidades de tool calling, function calling ni razonamiento agéntico, al tratarse de un modelo generativo de imágenes.

## Casos de uso

- Generación de imágenes en dispositivos móviles Snapdragon: el paquete está cuantizado a Q4_0 y F16 para ejecutarse en la NPU Hexagon, lo que permite inferencia local en teléfonos y tablets sin depender de la nube.
- Prototipado de aplicaciones creativas offline: al correr sobre stable-diffusion.cpp con backend NPU, se puede integrar en apps de ilustración o edición que requieran privacidad de datos y funcionamiento sin conexión.
- Evaluación de pipelines de difusión en hardware de bajo consumo: sirve para medir latencia y calidad de un DiT de 12B en NPU frente a alternativas en GPU.
- Distribución de arte generado en apps de consumo: los 8 pasos y CFG 0 reducen el coste por imagen, adecuado para funciones de generación rápida en aplicaciones móviles.
- Investigación sobre cuantización en NPU: el repositorio documenta la conversión Q8_0 a Q4_0 y BF16 a F16, útil para estudiar el impacto de estos tipos en la calidad de salida.
- Preservación de artefactos: al ser un espejo, garantiza la disponibilidad de los pesos para aplicaciones que dependen de ellos aunque los repositorios originales desaparezcan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repo ocupa 17.0 GB y los pesos van en Q4_0 y F16, por lo que se requiere un dispositivo con NPU Hexagon y memoria unificada suficiente para cargar el DiT de 12B más el codificador de 4B.
- GPU recomendadas: no aplica; el paquete está orientado a NPU Qualcomm Snapdragon, no a GPU NVIDIA o AMD.
- Compatibilidad con GPU de consumo: no está pensado para ellas; el backend objetivo es Hexagon NPU vía stable-diffusion.cpp.
- Opciones de despliegue: stable-diffusion.cpp con ruta Hexagon NPU; no se documentan vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Orientación |
|---|---|---|---|---|---|
| Krea 2 Turbo NPU (este) | 12,8B | no disponible | krea-2-community-license | GGUF + safetensors | NPU Snapdragon |
| Krea 2 Turbo original (krea/Krea-2-Turbo) | 12B | no disponible | krea-2-community-license | no disponible | GPU |
| realrebelai/KREA-2_GGUFs | 12B | no disponible | krea-2-community-license | GGUF Q8_0 | GPU/CPU |
| Qwen3-VL-4B-Instruct | 4B | no disponible | Apache 2.0 | GGUF, safetensors | Codificador de texto |

La comparativa se limita a los componentes citados en la model card; no se dispone de datos de rendimiento para establecer comparaciones cuantitativas con otros modelos de difusión.

## Limitaciones y advertencias

- La reconversión de Q8_0 a Q4_0 y de BF16 a F16 introduce pérdida de precisión adicional respecto al modelo original, con posible degradación de la calidad de imagen.
- El hardware Hexagon NPU no soporta K-quant ni BF16, lo que restringe las opciones de cuantización y limita la fidelidad del modelo.
- La licencia Krea 2 Community permite uso comercial solo a organizaciones con ingresos anuales inferiores a un millón de dólares; por encima de ese umbral se requiere licencia adicional.
- La licencia exige que las aplicaciones que usen el modelo implementen un filtro de contenido adecuado.
- Riesgo de sesgos y alucinaciones visuales inherente a los modelos de difusión; no se documentan evaluaciones de sesgo.
- No se dispone de información sobre idiomas soportados ni sobre el comportamiento del codificador de texto en castellano.
- El repositorio es un espejo de artefactos de terceros; el autor no garantiza mantenimiento ni actualizaciones.
- No se documentan límites de contexto ni de resolución de imagen soportada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/matrixportalx/Krea-2-Turbo-npu
- Licencia Krea 2: https://krea.ai/krea-2-licensing
- Modelo original: https://huggingface.co/krea/Krea-2-Turbo
- GGUF de origen: https://huggingface.co/realrebelai/KREA-2_GGUFs
- Codificador de texto: https://huggingface.co/unsloth/Qwen3-VL-4B-Instruct-GGUF
- VAE Wan 2.1: https://huggingface.co/Comfy-Org/Wan-2.1
- Perfil del autor: https://huggingface.co/matrixportalx

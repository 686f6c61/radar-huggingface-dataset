# latentdivergence/sdxl-lightning-8step-npu-8elite

## Resumen

SDXL-Lightning 8-step para NPU Hexagon es una compilación del UNet de SDXL-Lightning (destilado de SDXL base 1.0 por ByteDance) orientada a inferencia en el acelerador neuronal Hexagon (HTP v79) de los SoC Qualcomm Snapdragon 8 Elite. El autor, latentdivergence, publica el grafo como ONNX con EPContext de QNN, generado con Qualcomm AI Hub (QAIRT 2.45), de modo que el UNet se ejecuta directamente sobre la NPU en lugar de la CPU o la GPU del dispositivo. No hay reentrenamiento: se trata de una obra derivada cuantizada y compilada.

El paquete resuelve la generación de imagen texto-a-imagen en local en dispositivos móviles de gama alta, con una resolución estática de 1024x1024 y un muestreo de solo 8 pasos con Euler y guidance 1 (sin prompt negativo). El UNet se cuantiza a w8a16 (pesos int8, activaciones int16) y se acompaña de un VAE decodificador en fp16 y de codificadores de texto int8 en CPU que se distribuyen en repos separados del mismo autor.

Su relevancia es doble: por un lado demuestra la viabilidad de ejecutar difusión de alta resolución sobre NPU móvil con fidelidad casi exacta respecto a fp32 (coseno de 0,999906 en el peor paso evaluado en dispositivo real); por otro, el repositorio es deliberadamente modular, ya que solo contiene el grafo del UNet (2,6 GB) y delega VAE, texto y tokenizador a otros repositorios, lo que exige ensamblar el pipeline completo antes de usarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de difusión (SDXL-Lightning 8-step, destilado de SDXL base 1.0), compilado como grafo ONNX con QNN EPContext para Hexagon HTP v79 |
| Parametros totales | no disponible (el repo solo publica el UNet compilado, 2.641.473.536 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de texto fija de 77 tokens (encoder_hidden_states [1,77,2048]) |
| Tipos de cuantizacion | w8a16 (pesos int8, activaciones int16) en el UNet; VAE en fp16; codificadores de texto int8 en CPU |
| Idiomas soportados | no disponible (el prompt de texto depende de los codificadores CLIP de SDXL) |
| Licencia | CreativeML Open RAIL++-M (openrail++), heredada de SDXL base 1.0 |
| Formato de pesos | ONNX (model.onnx + model.bin con EPContext QNN); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es el UNet de SDXL-Lightning en su variante de 8 pasos (`sdxl_lightning_8step_unet.safetensors`), una destilación por consistencia de SDXL base 1.0 que reduce el muestreo a 8 pasos con guidance 1. Sobre esa base no hay entrenamiento adicional: el trabajo del autor consiste en cuantizar y compilar el UNet para la NPU Hexagon mediante Qualcomm AI Hub con QAIRT 2.45, produciendo un grafo ONNX con EPContext que fija las formas de entrada: `sample[1,4,128,128]`, `timestep[1]`, `encoder_hidden_states[1,77,2048]`, `text_embeds[1,1280]` y `time_ids[1,6]`, con salida `out_sample[1,4,128,128]`.

La calibración de la cuantización se realizó con 32 entradas reales de UNet extraídas de trayectorias fp32 de 8 pasos sobre 8 prompts (herramientas en `tools/model-build/sdxl_lightning_npu`). El muestreo documentado es Euler con espaciado de timesteps trailing, 8 pasos, guidance 1 y `time_ids` (1024, 1024, 0, 0, 1024, 1024); los latentes se escalan por 0,13025. El VAE decodificador (SDXL fp16-fix en fp16 sobre NPU) y los codificadores de texto int8 en CPU no forman parte de este repositorio y deben tomarse de los repositorios indicados por el autor.

## Capacidades

- Generación de imágenes texto-a-imagen a 1024x1024 con 8 pasos de muestreo (Euler, guidance 1, sin prompt negativo).
- Ejecución del UNet sobre la NPU Hexagon HTP v79 del Snapdragon 8 Elite mediante el execution provider QNN de ONNX Runtime.
- Entrada y salida en fp32 en la interfaz del grafo (fp32 IO), con cómputo interno w8a16.
- Fidelidad numérica alta respecto a fp32: coseno de 0,9999064411257932 en el peor paso evaluado en dispositivo real.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es exclusivamente un modelo de difusión para imagen.
- No soporta visión ni audio como entrada; el condicionamiento es únicamente textual (más `time_ids` de resolución y recorte).
- Multilingüismo: no documentado; queda determinado por los codificadores CLIP de SDXL que se usen en el pipeline.

## Casos de uso

- Generación de imágenes offline en móvil: el grafo se ejecuta íntegramente en la NPU del Snapdragon 8 Elite, lo que permite crear imágenes 1024x1024 sin conexión y sin enviar prompts a servidores, adecuado para aplicaciones de privacidad estricta.
- Integración en Latent Studio: el autor declara que este UNet es el motor de texto-a-imagen en dispositivo de esa aplicación, por lo que sirve como referencia para replicar el pipeline completo (UNet en NPU, VAE en NPU, texto en CPU).
- Prototipado de pipelines de difusión en NPU: al ser un grafo ONNX con EPContext, se puede cargar con ONNX Runtime y el QNN EP para medir latencia y fidelidad en HTP v79 antes de portar otros modelos.
- Aplicaciones de edición creativa en tiempo cuasi interactivo: con 8 pasos y ~749 ms por ejecución del UNet en AI Hub, encaja en flujos de generación por lotes pequeños o variaciones sucesivas de un mismo prompt.
- Evaluación comparativa de cuantización w8a16: el repositorio incluye la metodología de calibración (32 muestras de 8 prompts), útil como plantilla para cuantizar otros UNets de difusión con pérdida controlada.
- Demonstrar pipelines modulares en repos separados: sirve para validar el ensamblaje de UNet (este repo), VAE (`latentdivergence/lcm-ssd1b-npu-8elite`) y codificadores int8 (`latentdivergence/sdxl-lightning-4step-int8`) en una sola aplicación.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Latencia UNet en AI Hub (ms/run) | 749,415 |
| Similitud coseno vs fp32 (peor paso retenido, dispositivo real) | 0,9999064411257932 |
| Precision del grafo | w8a16 (int8 pesos, int16 activaciones) |
| Resolucion | 1024x1024 estatica |
| Pasos de muestreo | 8 (Euler, trailing, guidance 1) |

No se han publicado resultados de benchmarks estándar (FID, CLIP score, MMLU, HumanEval, GSM8K u otros) en la información disponible; los únicos datos numéricos son la latencia y la fidelidad frente a fp32 recogidas en la model card.

## Requisitos de hardware

- NPU Qualcomm Hexagon HTP v79, presente en el Snapdragon 8 Elite; el grafo EPContext está compilado específicamente para esa arquitectura y no es portable a otras NPU sin recompilación.
- Memoria: el repositorio ocupa 2,6 GB; el `unet/model.bin` pesa 2.641.473.536 bytes, por lo que se necesita al menos esa cantidad de almacenamiento y memoria accesible por la NPU para cargar el grafo.
- No cabe en GPU de consumo convencionales como A100, H100 o RTX 4090 en su forma actual: el artefacto es un binario QNN para móvil, no un modelo PyTorch o safetensors ejecutable en CUDA.
- Despliegue: ONNX Runtime con el execution provider QNN (Qualcomm AI Engine Direct / QAIRT 2.45) sobre el dispositivo objetivo; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de difusión.
- Latencia: 749,415 ms por ejecución del UNet según la medición de AI Hub; el tiempo total de generación debe sumar el VAE y los codificadores de texto, no cuantificados en la información disponible.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sdxl-lightning-8step-npu-8elite (este) | no disponible (UNet compilado de 2,6 GB) | 1024x1024, 8 pasos, texto de 77 tokens | 749,415 ms/run en HTP v79; coseno 0,999906 vs fp32 | OpenRAIL++ | Hugging Face, solo ONNX/QNN para Snapdragon 8 Elite |
| ByteDance/SDXL-Lightning (8-step) | no disponible en la informacion | 1024x1024, 8 pasos | no disponible | OpenRAIL++ | Hugging Face, safetensors para GPU |
| stabilityai/stable-diffusion-xl-base-1.0 | no disponible en la informacion | 1024x1024, decenas de pasos | no disponible | OpenRAIL++ | Hugging Face, safetensors para GPU |
| latentdivergence/sdxl-lightning-4step-int8 | no disponible en la informacion | 1024x1024, 4 pasos | no disponible | no disponible en la informacion | Hugging Face, codificadores de texto int8 para CPU |

La comparación con alternativas de la misma categoría (difusión en NPU móvil) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El repositorio contiene únicamente el UNet compilado; sin el VAE (`latentdivergence/lcm-ssd1b-npu-8elite`) y los codificadores de texto y tokenizador (`latentdivergence/sdxl-lightning-4step-int8`) el pipeline no es funcional.
- El grafo está compilado para HTP v79 (Snapdragon 8 Elite); no se ejecutará en otras NPU Hexagon ni en GPU sin recompilación con QAIRT.
- Resolución y formas estáticas: 1024x1024 y 77 tokens de texto; no admite otras resoluciones ni prompts más largos sin recompilar.
- Guidance 1 y ausencia de prompt negativo: el control fino de la generación es limitado en comparación con SDXL base con classifier-free guidance.
- Riesgo de sesgos y alucinación visual heredado de SDXL base 1.0 y de sus datos de entrenamiento; no se documentan evaluaciones de sesgo en este repositorio.
- Licencia CreativeML Open RAIL++-M: las restricciones de uso recogidas en el Anexo A se aplican a cualquiera que use o redistribuya los archivos y deben transmitirse; es obligatorio revisar `LICENSE.md` antes de un uso comercial.
- La cuantización w8a16 introduce una desviación mínima pero no nula respecto a fp32 (coseno 0,999906 en el peor paso evaluado); no se documenta el impacto en métricas perceptivas como FID o CLIP score.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (22 de noviembre de 2026), por lo que no hay validación comunitaria independiente.
- Idiomas soportados no documentados: el comportamiento multilingüe depende enteramente de los codificadores CLIP de SDXL empleados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/latentdivergence/sdxl-lightning-8step-npu-8elite
- Modelo base SDXL-Lightning: https://huggingface.co/ByteDance/SDXL-Lightning
- Modelo base SDXL 1.0: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- VAE para el mismo chip: https://huggingface.co/latentdivergence/lcm-ssd1b-npu-8elite
- Codificadores de texto int8 y tokenizador: https://huggingface.co/latentdivergence/sdxl-lightning-4step-int8
- Qualcomm AI Hub: https://aihub.qualcomm.com/
- Licencia CreativeML Open RAIL++-M: https://huggingface.co/latentdivergence/sdxl-lightning-8step-npu-8elite/blob/main/LICENSE.md

# latentdivergence/sdxl-lightning-8step-npu-8elitegen5

## Resumen

SDXL-Lightning 8-step para NPU Hexagon es una compilación precompilada del UNet de SDXL-Lightning (destilado de SDXL base 1.0 por ByteDance) orientada a inferencia de texto-a-imagen en el acelerador NPU Hexagon de Qualcomm, concretamente para el chip Snapdragon 8 Elite Gen 5 (HTP v81). El artefacto lo publica el usuario latentdivergence como parte del proyecto Latent Studio y se distribuye como grafo ONNX con contexto EPContext de QNN, generado mediante Qualcomm AI Hub con QAIRT 2.45. No se trata de un modelo nuevo: es una cuantización y compilación del UNet de 8 pasos, sin reentrenamiento.

El paquete incluye únicamente el UNet compilado (2,66 GB en `unet/model.bin`), con IO en fp32 para el execution provider QNN de ONNX Runtime y resolución estática de 1024x1024. El VAE y los text encoders no forman parte de este repositorio: el autor remite a otros repositorios propios (`lcm-ssd1b-npu-8elitegen5` para el decoder y `sdxl-lightning-4step-int8` para los text encoders int8 y el tokenizer).

La relevancia es acotada pero concreta: permite ejecutar generación de imágenes con SDXL-Lightning en 8 pasos sobre hardware móvil Qualcomm sin GPU dedicada, con un coste medido de 741,169 ms por ejecución del UNet en AI Hub y una fidelidad de coseno de 0,999906 frente a fp32 en el peor paso evaluado en dispositivo real. Es un artefacto de despliegue para un chip y un runtime específicos, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de SDXL (difusión latente, transformer convolucional) destilado a 8 pasos; grafo ONNX con EPContext QNN |
| Parametros totales | no disponible (el UNet compilado ocupa 2.660.782.080 bytes en `unet/model.bin`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de texto fija `encoder_hidden_states[1,77,2048]` |
| Tipos de cuantizacion | w8a16 (pesos int8, activaciones int16) en el UNet; VAE fp16 en NPU; text encoders int8 en CPU |
| Idiomas soportados | no disponible (el prompt de texto depende del text encoder SDXL, no incluido en este repo) |
| Licencia | openrail++ (CreativeML Open RAIL++-M, heredada de SDXL base 1.0) |
| Formato de pesos | ONNX (EPContext QNN) + `model.bin`; el repo base usa safetensors |

## Arquitectura y entrenamiento

El modelo subyacente es SDXL-Lightning en su variante de 8 pasos, un UNet de SDXL base 1.0 destilado por ByteDance para reducir el número de pasos de muestreo. Este repositorio no entrena nada: cuantiza y compila ese UNet para el Hexagon NPU. La compilación se realizó con Qualcomm AI Hub y QAIRT 2.45, produciendo un grafo ONNX con contexto EPContext ejecutable por el QNN execution provider de ONNX Runtime.

Las firmas de entrada son estáticas: `sample[1,4,128,128]`, `timestep[1]`, `encoder_hidden_states[1,77,2048]`, `text_embeds[1,1280]` y `time_ids[1,6]`, con salida `out_sample[1,4,128,128]`. La calibración para la cuantización w8a16 se hizo con 32 entradas reales de UNet extraídas de trayectorias fp32 de 8 pasos sobre 8 prompts. El muestreo previsto es Euler con espaciado de timesteps trailing, 8 pasos, guidance 1 (sin prompt negativo) y `time_ids` (1024, 1024, 0, 0, 1024, 1024); los latentes se escalan por 0,13025.

## Capacidades

- Generación de imágenes texto-a-imagen a 1024x1024 en 8 pasos de muestreo.
- Inferencia en dispositivo sobre NPU Hexagon (Snapdragon 8 Elite Gen 5, HTP v81), sin GPU dedicada.
- Ejecución vía ONNX Runtime con QNN execution provider, con IO en fp32.
- Muestreo sin classifier-free guidance (guidance 1), lo que elimina la necesidad de prompt negativo y reduce el coste por paso.
- No incluye capacidades de texto, código, matemáticas, visión, tool calling ni agentes.
- No incluye capacidades multilingües propias: la tokenización y codificación del prompt dependen de los text encoders SDXL alojados en otro repositorio.
- No soporta resolución variable: la forma de entrada es estática a 1024x1024.

## Casos de uso

- Generación de imágenes offline en aplicaciones móviles Android sobre Snapdragon 8 Elite Gen 5: el grafo EPContext se carga directamente en el QNN EP y ejecuta el UNet en la NPU, con 741 ms por paso de UNet medidos en AI Hub, adecuado para experiencias de creación de imágenes en dispositivo sin conexión.
- Prototipado de pipelines de difusión en hardware Qualcomm: sirve para validar el rendimiento real de SDXL-Lightning cuantizado antes de integrar el VAE y los text encoders desde los repositorios complementarios del autor.
- Edición y variación de imágenes por lotes en el dispositivo: al fijar `time_ids` y usar 8 pasos con guidance 1, se pueden encadenar generaciones con coste predecible y sin dependencia de servicios en la nube.
- Aplicaciones de privacidad estricta: al ejecutarse íntegramente en el dispositivo, los prompts y las imágenes no salen del terminal, lo que encaja en escenarios sanitarios, legales o corporativos con requisitos de confidencialidad.
- Benchmarking de cuantización w8a16 en NPU: la métrica de coseno frente a fp32 (0,999906 en el peor paso) permite evaluar la pérdida de fidelidad de la compilación en comparación con la ejecución fp32 de referencia.
- Integración en Latent Studio: el artefacto está pensado como componente del pipeline de esa aplicación, combinado con el VAE de `lcm-ssd1b-npu-8elitegen5` y los text encoders int8 de `sdxl-lightning-4step-int8`.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Grafo | `sample[1,4,128,128]`, `timestep[1]`, `encoder_hidden_states[1,77,2048]`, `text_embeds[1,1280]`, `time_ids[1,6]` -> `out_sample[1,4,128,128]` |
| Precision | w8a16 (int8 pesos, int16 activaciones) |
| Tiempo por ejecucion (AI Hub) | 741,169 ms |
| Coseno vs fp32 (peor paso retenido, dispositivo real) | 0,9999064411257932 |

No se han publicado resultados de benchmarks estándar (FID, CLIP score, MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos de rendimiento son los de la tabla anterior, medidos por el autor.

## Requisitos de hardware

- NPU Hexagon de Snapdragon 8 Elite Gen 5 (HTP v81), requisito imprescindible: el grafo EPContext está compilado para ese chip y no es portable a otros.
- Runtime: ONNX Runtime con QNN execution provider y QAIRT 2.45.
- VRAM: no aplica; el UNet compilado ocupa 2,66 GB en disco y se ejecuta en la NPU, no en memoria de GPU.
- GPU: no se usa GPU dedicada; no hay soporte documentado para A100, H100 ni RTX 4090 en este artefacto.
- No cabe en GPU de consumo porque no está pensado para ellas: es un binario específico de NPU móvil.
- Despliegue: ONNX Runtime con QNN EP; no hay soporte indicado para vLLM, llama.cpp, Ollama ni TGI (son runtimes de LLM, no aplicables a difusión).
- Latencia: 741,169 ms por ejecución del UNet en AI Hub; el pipeline completo requiere además el VAE y los text encoders, cuyos tiempos no se detallan en este repositorio.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sdxl-lightning-8step-npu-8elitegen5 (este) | no disponible (UNet 2,66 GB) | 1024x1024 estatico | 741,169 ms/ejecucion UNet en AI Hub; coseno 0,999906 vs fp32 | openrail++ | Hugging Face, 0 descargas |
| ByteDance/SDXL-Lightning (8-step) | no disponible | 1024x1024 | no disponible en esta ficha | openrail++ | Hugging Face |
| stabilityai/stable-diffusion-xl-base-1.0 | no disponible | 1024x1024 | no disponible en esta ficha | openrail++ | Hugging Face |
| sdxl-lightning-4step-int8 (mismo autor) | no disponible | 1024x1024 | no disponible | openrail++ (presumible) | Hugging Face |

La comparativa se limita a los modelos citados en la información disponible; no se han encontrado datos de benchmarks comparables entre ellos.

## Limitaciones y advertencias

- Específico de hardware: el grafo EPContext solo funciona en Snapdragon 8 Elite Gen 5 (HTP v81); no es ejecutable en otras NPU, GPU o CPU.
- No es un modelo completo: faltan VAE y text encoders, alojados en otros repositorios del mismo autor; sin ellos no se puede generar una imagen de extremo a extremo.
- Resolución fija de 1024x1024: no admite otras resoluciones ni lotes mayores de 1.
- Muestreo restringido: 8 pasos, Euler, guidance 1 y `time_ids` fijos; no admite prompt negativo ni ajustes de guidance.
- Riesgo de sesgos y alucinación visual heredado de SDXL base 1.0 y de sus datos de entrenamiento; no se documentan evaluaciones de sesgo en este repositorio.
- Licencia CreativeML Open RAIL++-M: las restricciones de uso de la Attachment A se aplican a cualquiera que use o redistribuya los archivos y deben transmitirse; revisar `LICENSE.md` antes de uso comercial.
- Es una obra derivada (cuantizada y compilada, sin reentrenamiento); la licencia y las restricciones de uso del modelo base se heredan.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso en producción ni validación independiente.
- Fecha de creación y actualización (2026-11-22) posterior a la mayoría de referencias públicas de SDXL-Lightning; verificar compatibilidad con versiones actuales de QAIRT y ONNX Runtime.

## Enlaces

- Hugging Face: https://huggingface.co/latentdivergence/sdxl-lightning-8step-npu-8elitegen5
- Modelo base SDXL-Lightning: https://huggingface.co/ByteDance/SDXL-Lightning
- Modelo base SDXL 1.0: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- VAE para el mismo chip: https://huggingface.co/latentdivergence/lcm-ssd1b-npu-8elitegen5
- Text encoders int8 y tokenizer: https://huggingface.co/latentdivergence/sdxl-lightning-4step-int8
- Qualcomm AI Hub: https://aihub.qualcomm.com
- Licencia: `LICENSE.md` en el repositorio de Hugging Face

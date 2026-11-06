# GameGC/sana-600m-512px-fp8-fp4

## Resumen

Sana 600M (512px) es un modelo de difusion texto-a-imagen desarrollado originalmente por NVIDIA y el MIT Han Lab, basado en una arquitectura Linear DiT (Diffusion Transformer con atencion lineal) y disenado para generacion de imagenes de alta resolucion con un coste computacional muy reducido. El repositorio `GameGC/sana-600m-512px-fp8-fp4` es una conversion optimizada y autocontenida del modelo original `Efficient-Large-Model/Sana_600M_512px_diffusers` a formato ONNX con cuantizacion FP8 e INT8, pensada para inferencia 100% on-device sin Python en iOS (Metal / ONNX Runtime) y Android (ONNX Runtime / NNAPI / Hexagon NPU).

La relevancia de esta conversion radica en que empaqueta en un unico repositorio los tres componentes necesarios para la generacion completa (text encoder Gemma-2-2B, Linear DiT de 600M y decoder DC-AE con downsampling 32x), todos cuantizados, con un pico de RAM inferior a 2 GB y latencias de 1,4 a 2,0 segundos por imagen de 512x512 en iPhone 15/16/17 Pro. Esto permite desplegar generacion de imagenes en dispositivos moviles de gama alta sin depender de la nube.

El modelo mantiene la licencia Apache 2.0 del release original de Sana. El repositorio tiene 6,9 GB de tamano total y fue creado en noviembre de 2026. No cuenta con descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Linear DiT (Diffusion Transformer) con text encoder Gemma-2-2B y autoencoder DC-AE |
| Parametros totales | 600M (Linear DiT); el text encoder Gemma-2-2B anade ~2B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada de texto de hasta 300 tokens segun el ejemplo de la model card) |
| Tipos de cuantizacion | FP8, INT8 (estatica y dinamica), FP4 (text encoder) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (FP8/INT8), tokenizer JSON, PNG de muestra |

## Arquitectura y entrenamiento

El modelo se basa en Sana 600M (512px), un Diffusion Transformer con atencion lineal (Linear DiT) desarrollado por NVIDIA y el MIT Han Lab. La innovacion principal de Sana es el uso de atencion lineal en lugar de atencion cuadratica, lo que reduce drasticamente el coste computacional y de memoria en comparacion con los transformers de difusion convencionales. El modelo opera sobre un espacio latente de solo 1 x 32 x 16 x 16 (256 tokens por imagen de 512x512), gracias al autoencoder DC-AE (Deep Compression Autoencoder) con downsampling espacial de 32x.

La conversion de este repositorio cuantiza cada componente de forma independiente: el Linear DiT a FP8/INT8 (~597 MB), el decoder DC-AE a INT8 (~160 MB) y el text encoder Gemma-2-2B a INT8 con cuantizacion dinamica y FP4 (~2,6 GB). El muestreo se realiza con FlowMatch-Euler en 4-8 pasos. No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens vistos ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de imagenes texto-a-imagen a resolucion 512x512.
- Inferencia on-device sin Python en iOS (Metal / ONNX Runtime) y Android (ONNX Runtime / NNAPI / Hexagon NPU).
- Ejecucion con cuantizacion FP8, INT8 y FP4 segun el componente.
- Muestreo rapido con FlowMatch-Euler en 4-8 pasos.
- Pico de memoria RAM inferior a 2 GB con ejecucion secuencial por capas.
- Integracion mediante ONNX Runtime en Python, iOS y Android.
- No se especifican capacidades de tool calling, agentes, vision de entrada, audio ni modo thinking (no aplica a un modelo de difusion texto-a-imagen).

## Casos de uso

- Generacion de imagenes en apps moviles nativas: integracion de los tres modelos ONNX en una app iOS o Android para generar imagenes de 512x512 a partir de texto sin conexion a la red, con latencias de 1,4-2,0 s en iPhone 15/16/17 Pro y 2,2-3,5 s en Snapdragon 8 Gen 3/Gen 4.
- Prototipado rapido en Apple Silicon: uso del modelo en Macs con chip M-Series para iterar sobre prompts y estilos con latencias de 0,8-1,2 s por imagen, sin necesidad de GPU dedicada.
- Funcionalidades offline en dispositivos con NPU: despliegue en Android aprovechando NNAPI o Hexagon NPU para acelerar el DiT y el decoder, util en apps de edicion creativa sin conectividad.
- Generacion de avatares o ilustraciones en apps de mensajeria: el bajo consumo de memoria (<2 GB) permite ejecutar el pipeline en segundo plano en telefonos de gama alta sin agotar la RAM del sistema.
- Previsualizacion de assets en herramientas de diseno: generacion rapida de bocetos de 512x512 para validar direcciones visuales antes de producir assets finales en un servicio cloud de mayor resolucion.
- Investigacion en eficiencia de difusion: el repositorio sirve como referencia para estudiar el impacto de FP8/INT8/FP4 en la calidad de salida de un Linear DiT con DC-AE, comparando contra el modelo original en difusers.
- Educacion y demos: ejecucion local del pipeline completo en un portatil Apple Silicon para demostrar generacion de imagenes sin dependencias de servidor ni Python en el dispositivo final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (FID, CLIP score, MMLU, etc.) en la informacion disponible. La model card unicamente reporta metricas de latencia y memoria:

| Plataforma | Latencia por imagen 512x512 |
|---|---|
| iPhone 15 / 16 / 17 Pro | ~1,4 - 2,0 s |
| Apple Silicon M-Series (Mac) | ~0,8 - 1,2 s |
| Snapdragon 8 Gen 3 / Gen 4 | ~2,2 - 3,5 s |
| Memoria pico (RAM) | < 2,0 GB con ejecucion secuencial por capas |

## Requisitos de hardware

- VRAM/RAM estimada: pico inferior a 2,0 GB con ejecucion secuencial por capas; el repositorio completo ocupa 6,9 GB en disco.
- GPU recomendadas: no aplica GPU de escritorio; el objetivo son SoCs moviles (Apple A17 Pro/A18 Pro y Snapdragon 8 Gen 3/Gen 4) y chips Apple Silicon M-Series.
- Cabe en consumer GPU: si, en cualquier GPU consumer moderna con al menos 4 GB de VRAM si se ejecuta via ONNX Runtime, aunque el diseno apunta a movil.
- Opciones de despliegue: ONNX Runtime (Python, iOS con Metal, Android con NNAPI / Hexagon NPU); la libreria `sana` tambien aparece referenciada para uso en Python.
- Latencia y throughput: 0,8-1,2 s por imagen en Mac M-Series, 1,4-2,0 s en iPhone Pro, 2,2-3,5 s en Snapdragon 8 Gen 3/Gen 4.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Contexto de texto | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Sana 600M 512px (este repo) | 600M DiT + Gemma-2-2B | 512x512 | hasta 300 tokens | Apache 2.0 | ONNX FP8/INT8/FP4, on-device |
| Sana 600M 512px (original) | 600M DiT + Gemma-2-2B | 512x512 | no disponible | Apache 2.0 | difusers / PyTorch, GPU |
| SDXL-Turbo | ~2,6B UNet | 512x512-1024x1024 | 77 tokens | openrail++ | PyTorch, GPU |
| SD 1.5 | ~860M UNet | 512x512 | 77 tokens | CreativeML OpenRAIL-M | PyTorch, GPU |

La comparativa con SDXL-Turbo y SD 1.5 se ofrece como referencia de categoria (texto-a-imagen de baja latencia); no se dispone de datos de benchmarks que permitan comparar calidad directamente con Sana 600M en la informacion proporcionada.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo, alucinacion visual ni calidad de fidelidad al prompt para esta conversion cuantizada.
- La cuantizacion FP8/INT8/FP4 puede degradar la calidad de imagen frente al modelo original en difusers; no se documenta la magnitud de la perdida.
- Resolucion fija de 512x512; no se indica soporte para otras resoluciones o aspect ratios.
- Entrada de texto limitada a unos 300 tokens segun el ejemplo de la model card; prompts largos pueden truncarse.
- Idiomas soportados no disponibles; el text encoder Gemma-2-2B es multilingue, pero no se documenta el comportamiento por idioma.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base original y del text encoder Gemma-2-2B (que puede tener su propia licencia de uso).
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validacion por parte de la comunidad.
- El pipeline requiere orquestar manualmente los tres modelos ONNX (text encoder, DiT y decoder) y el bucle de muestreo FlowMatch-Euler; no se ofrece un wrapper de alto nivel en el repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/GameGC/sana-600m-512px-fp8-fp4
- Arbol de archivos: https://huggingface.co/GameGC/sana-600m-512px-fp8-fp4/tree/main
- Modelo base: https://huggingface.co/Efficient-Large-Model/Sana_600M_512px_diffusers

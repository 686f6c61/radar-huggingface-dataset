# latentdivergence/realvis51-inpaint-npu-8elite

## Resumen

RealVis Inpaint NPU 8 Elite es un paquete de grafos ONNX precompilados para el motor QNN (Qualcomm AI Hub, QAIRT 2.45), pensado para ejecutar inpainting y outpainting de Stable Diffusion 1.5 directamente sobre la NPU Hexagon HTP v79 del Snapdragon 8 Elite. Lo publica el usuario latentdivergence y no introduce entrenamiento ni fusion de pesos: es una exportacion, cuantizacion y compilacion del modelo Uminosachi/realisticVisionV51_v51VAE-inpainting.

El repositorio contiene tres grafos independientes: un U-Net de inpainting de 9 canales de entrada, el codificador VAE y el decodificador VAE, todos a 512x512 y con entradas y salidas en fp32, aunque compilados internamente en fp16. El text encoder, el tokenizer y un VAE de respaldo para CPU se toman del build hermano latentdivergence/realvis51-inpaint-int8-onnx.

Su relevancia es de nicho pero concreta: permite ejecutar generacion de imagenes de difusion en un telefono de gama alta sin GPU y sin conexion, con latencias medidas por Qualcomm de 256,351 ms por paso de U-Net y una fidelidad numerica respecto a fp32 de coseno 0.99996 o superior. El repositorio ocupa 1,9 GB y no registra descargas ni validacion de la comunidad en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion latente (Stable Diffusion 1.5): U-Net convolucional de inpainting de 9 canales, VAE encoder/decoder y text encoder CLIP. Exportada a ONNX y compilada como EPContext QNN para Hexagon HTP v79 |
| Parametros totales | No disponible en la model card. La arquitectura SD 1.5 subyacente ronda los 1.000 M en total (U-Net ~860 M, VAE ~83 M, text encoder CLIP ViT-L/14 ~123 M) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 77 tokens de prompt, segun la forma del tensor `encoder_hidden_states[1,77,768]` |
| Tipos de cuantizacion | Grafos QNN en fp16; calibracion w8a16 documentada para el caso de uso real. El build CPU hermano usa int8 |
| Idiomas soportados | No disponible |
| Licencia | CreativeML OpenRAIL-M (heredada del modelo base) |
| Formato de pesos | ONNX con grafos EPContext precompilados para QNN (HTP v79); entradas y salidas en fp32 |

## Arquitectura y entrenamiento

Se trata de un pipeline de difusion latente clasico de SD 1.5, sin modificaciones de arquitectura. El grafo `unet/` recibe `sample[1,9,64,64]` (4 canales de latente + 1 de mascara + 4 del latente de la imagen enmascarada), un `timestep[1]` y `encoder_hidden_states[1,77,768]`, y devuelve `out_sample`. Los grafos `vae_encoder_npu/` (imagen `[1,3,512,512]` en rango [-1,1] a media posterior `[1,4,64,64]` sin escalar) y `vae_decoder_npu/` (latente sin escalar a imagen 512x512) completan el ciclo.

No hay entrenamiento, reentrenamiento ni merging: el autor indica explicitamente que el trabajo es una exportacion, cuantizacion y compilacion del modelo base, por lo que todas las caracteristicas aprendidas (estilo fotografico realista orientado a retratos y escenas) provienen de Uminosachi/realisticVisionV51_v51VAE-inpainting. La innovacion tecnica esta en el empaquetado: grafos EPContext precompilados con QAIRT 2.45 para el HTP v79, y una calibracion w8a16 realizada con ejecuciones reales de los flujos Replace (mascaras de pincel) y Uncrop (bordes de outpainting) usando DPM++ 2M Karras, 28 pasos y CFG 7.5.

## Capacidades

- Inpainting guiado por mascara de 9 canales (flujo Replace): rellena la region enmascarada integrando el contexto de la imagen original.
- Outpainting / expansion de encuadre (flujo Uncrop): genera los bordes que faltan manteniendo la continuidad visual.
- Generacion de imagenes fotorrealistas a 512x512 en el espacio latente de SD 1.5.
- Condicionamiento por prompt de texto de hasta 77 tokens mediante el text encoder CLIP incluido en el build CPU hermano.
- Inferencia sobre NPU Hexagon HTP v79 a traves del execution provider QNN de ONNX Runtime, con tensores de entrada y salida en fp32.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo de generacion de imagenes, no un modelo de lenguaje.
- No se documentan capacidades de vision, audio ni modo thinking.

## Casos de uso

- Eliminacion de objetos en apps de retoque movil: el grafo de inpainting sustituye el objeto marcado con una mascara de pincel por contenido coherente con el fondo, en local y sin enviar la foto a un servidor.
- Expansion de encuadre para redes sociales: el flujo Uncrop genera los bordes necesarios para pasar de 1:1 a 16:9 o 9:16 sin recortar la imagen original.
- Edicion de fotos sin conexion y con privacidad estricta: al ejecutarse en la NPU del dispositivo, las imagenes no salen del terminal, lo que encaja en aplicaciones medicas, legales o corporativas.
- Reparacion de fotografias antiguas: eliminacion de rasgunos, manchas y zonas danadas mediante mascaras sobre las areas afectadas, conservando el grano y la iluminacion del resto.
- Catalogos de producto en comercio electronico: generacion de bordes neutros para normalizar el formato de imagenes de catalogo antes de subirlas a la ficha de producto.
- Demostraciones y benchmarks en dispositivo: validacion de la ruta QNN/ONNX Runtime en hardware Snapdragon 8 Elite para equipos que evaluan el coste de inferencia de difusion en movil.
- Funciones de edicion generativa dentro de una app de camara: pipelines de captura, edicion y exportacion en el propio telefono, con latencias por paso de U-Net de unos 256 ms medidos en AI Hub.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta fidelidad numerica frente a la referencia fp32 y tiempos medidos por Qualcomm AI Hub:

| Grafo | Entrada | Salida | Precision | AI Hub (ms/ejecucion) | Coseno vs fp32 (dispositivo real) |
|---|---|---|---|---|---|
| `unet/` | `sample[1,9,64,64]`, `timestep[1]`, `encoder_hidden_states[1,77,768]` | `out_sample` | fp16 | 256,351 | 0,9999688241229399 |
| `vae_encoder_npu/` | `image[1,3,512,512]` en [-1,1] | `mean[1,4,64,64]` sin escalar | fp16 | 113,318 | 0,9999961078030125 |
| `vae_decoder_npu/` | `latent[1,4,64,64]` sin escalar | `image[1,3,512,512]` | fp16 | 262,597 | 0,9999997925811965 |

## Requisitos de hardware

- NPU objetivo: Hexagon HTP v79, presente en el Snapdragon 8 Elite. Los grafos EPContext estan compilados especificamente para esta revision y no son portables a otros SoC sin recompilar.
- GPU: no aplica. El paquete esta disenado para la NPU; no se documentan requisitos de VRAM ni compatibilidad con GPU de escritorio.
- GPU de consumo: no aplica en este repositorio. Para ejecucion en CPU o GPU habria que recurrir a los ONNX del build hermano latentdivergence/realvis51-inpaint-int8-onnx.
- Tamano en disco: 1,9 GB de repositorio (tres grafos compilados mas los ficheros heredados del build CPU).
- Despliegue: ONNX Runtime con el execution provider QNN. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia: sumando los tiempos publicados, una iteracion completa de U-Net + VAE encoder + VAE decoder ronda los 632 ms. Para 28 pasos, la estimacion lineal sin classifier-free guidance seria de unos 7,2 s solo de U-Net, mas unos 0,4 s de VAE; con CFG (dos pasadas por paso, dado que el grafo es batch 1) la estimacion subiria a unos 14,4 s. Son calculos derivados de los datos de AI Hub, no mediciones publicadas de extremo a extremo.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de prompt | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| latentdivergence/realvis51-inpaint-npu-8elite | No disponible (arquitectura SD 1.5, ~1.000 M estimados) | 77 tokens | ONNX EPContext QNN fp16 | CreativeML OpenRAIL-M | Publico en HuggingFace, 0 descargas |
| Uminosachi/realisticVisionV51_v51VAE-inpainting (modelo base) | No disponible | 77 tokens | Safetensors/Diffusers (no confirmado en la informacion) | CreativeML OpenRAIL-M | Publico en HuggingFace |
| latentdivergence/realvis51-inpaint-int8-onnx (build CPU hermano) | No disponible | 77 tokens | ONNX int8 | CreativeML OpenRAIL-M | Publico en HuggingFace, incluido como dependencia de este repositorio |

No se dispone de datos de rendimiento comparables entre estas variantes mas alla de las similitudes de coseno frente a fp32 publicadas para los grafos NPU.

## Limitaciones y advertencias

- Ausencia total de entrenamiento propio: el modelo hereda los sesgos, el estilo y las limitaciones de Realistic Vision 5.1, orientado a fotografia realista. El rendimiento en ilustracion, anime o estilos graficos sera peor.
- Dependencia estricta de hardware: los grafos EPContext estan compilados para HTP v79 (Snapdragon 8 Elite). No funcionaran en otras generaciones de Hexagon ni en GPU o CPU sin volver a recompilar.
- Resolucion fija de 512x512 en todos los grafos; no se documenta soporte para otras resoluciones ni para procesado por teselas.
- Prompt limitado a 77 tokens por la ventana del text encoder CLIP.
- Grafos con batch 1: el classifier-free guidance obliga a dos pasadas por paso de muestreo, lo que duplica el coste del U-Net.
- Los tensores de entrada y salida son fp32, aunque el computo interno sea fp16; hay que respetar el tipo declarado en cada grafo o la inferencia fallara.
- Riesgo de alucinacion visual: con mascaras grandes o poco contexto alrededor, el inpainting puede generar contenido incoherente con la escena (manos, texto, estructuras repetidas).
- Licencia CreativeML OpenRAIL-M: permite uso comercial, pero impone restricciones de uso (prohibicion de contenido ilegal, danino, desinformacion, suplantacion, etc.) que se heredan del modelo base y son responsabilidad del desplegador.
- Idiomas soportados no especificados; el text encoder procede del build CPU hermano y no se documenta su cobertura linguistica.
- Adopcion nula en el momento de la consulta (0 descargas, 0 likes) y marcas temporales de creacion y actualizacion separadas por unos 15 segundos: no existe validacion independiente del paquete.
- Los resultados de la busqueda web realizada no aportan informacion tecnica adicional; devolvieron paginas genericas sobre diseno grafico.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/latentdivergence/realvis51-inpaint-npu-8elite
- Modelo base: https://huggingface.co/Uminosachi/realisticVisionV51_v51VAE-inpainting
- Build CPU hermano (text encoder, tokenizer y VAE de respaldo): https://huggingface.co/latentdivergence/realvis51-inpaint-int8-onnx

Nota: Qualcomm AI Hub y QAIRT 2.45 se mencionan en la model card como herramientas de compilacion y medicion, pero no se proporciona un enlace directo en la informacion disponible. Los resultados de busqueda web no incluyeron enlaces relevantes al modelo.

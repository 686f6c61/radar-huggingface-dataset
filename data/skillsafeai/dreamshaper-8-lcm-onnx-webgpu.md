# skillsafeai/dreamshaper-8-lcm-onnx-webgpu

## Resumen

DreamShaper 8 LCM ONNX WebGPU es una exportacion a formato ONNX del modelo de difusion texto-a-imagen Lykon/dreamshaper-8-lcm, preparada especificamente para ejecutarse en el navegador mediante onnxruntime-web sobre WebGPU. El autor de la exportacion es el usuario skillsafeai; el modelo original fue entrenado por Lykon. No se han reentrenado ni modificado los pesos: la model card indica explicitamente que solo se ha realizado la conversion, partiendo del commit `4645d8bc6a8e6b106d21606d63e8460cdad4f1a6` del modelo base.

El modelo resuelve el problema de desplegar generacion de imagenes por difusion en cliente (navegador) sin depender de un servidor GPU. Para ello divide el pipeline en tres grafos ONNX independientes (text encoder CLIP, UNet de SD 1.5 y decoder VAE) que encajan en memoria del navegador, con el UNet en fp16 y sin datos externos. La variante LCM (Latent Consistency Model) permite muestrear en solo 4 pasos sin guidance clasificador, lo que reduce drasticamente el coste computacional respecto a un SD 1.5 convencional.

La relevancia actual radica en que combina dos tendencias: inferencia on-device en el navegador via WebGPU y modelos de difusion destilados para pocos pasos. El repositorio ocupa 2.2 GB en total y, una vez construida la sesion en Chrome sobre Apple silicon, genera imagenes de 512x512 en aproximadamente 2.2-3.1 segundos. Es, por tanto, una pieza orientada a demos web, aplicaciones creativas en cliente y prototipos sin backend GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion latente: UNet de SD 1.5 + text encoder CLIP ViT-L/14 + decoder VAE |
| Parametros totales | No disponible en la informacion |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 77 tokens (secuencia maxima del text encoder CLIP) |
| Tipos de cuantizacion | fp16 (text encoder y UNet con E/S en float32), fp32 (VAE decoder) |
| Idiomas soportados | No disponibles; el text encoder CLIP esta entrenado principalmente en ingles |
| Licencia | CreativeML Open RAIL-M |
| Formato de pesos | ONNX, opset 17, archivos unicos sin datos externos (cada uno por debajo de 2 GiB) |
| Tamano del repositorio | 2.2 GB |
| Resolucion de salida | 512x512 |
| Pasos de muestreo | 4 (LCM, sin guidance) |

## Arquitectura y entrenamiento

Se trata de un pipeline de difusion latente clasico de Stable Diffusion 1.5, descompuesto en tres grafos ONNX. El `text_encoder.onnx` es un CLIP ViT-L/14 en fp16 que recibe `input_ids` int64 de forma [1,77] y devuelve `last_hidden_state` float32 de forma [1,77,768]. El `unet.onnx` es el UNet de SD 1.5, con pesos internos fp16 y entradas/salidas en float32: `sample` [1,4,64,64], `timestep` [1] y `encoder_hidden_states` [1,77,768], produciendo `out_sample`. El `vae_decoder.onnx` esta en fp32, aplica internamente la division por 0.18215 y transforma `latent` [1,4,64,64] en `image` [1,3,512,512] en el rango [-1,1].

El modelo base subyacente es DreamShaper 8, un ajuste fino de runwayml/stable-diffusion-v1.5 orientado a equilibrar fotorrealismo y estilo artistico/anime. Sobre esa base se aplico la destilacion LCM, que habilita el muestreo en 4 pasos sin guidance. No hay datos de reentrenamiento, RLHF ni DPO asociados a esta exportacion, ya que el autor declara que no se modifico ningun peso. La innovacion tecnica es puramente de despliegue: exportacion a ONNX opset 17 con operadores estandar (ai.onnx), sin datos externos y con cada archivo por debajo de 2 GiB para facilitar su carga en el navegador.

El procedimiento de muestreo documentado usa los timesteps [999, 759, 499, 259], un programa de alphas_cumprod de tipo scaled_linear entre 0.00085 y 0.012, y parametros de sigma_data 0.5 y timestep_scaling 10. El bucle aplica la formulacion LCM: estima el ruido con la UNet, calcula x0, combina con la componente de salto y, salvo en el ultimo paso, reinyecta ruido segun el siguiente alpha. El resultado del VAE se reescala con `imagen = vae_decoder(x) / 2 + 0.5`.

## Capacidades

- Generacion de imagenes texto-a-imagen a 512x512 a partir de prompts en lenguaje natural.
- Muestreo rapido en 4 pasos sin guidance clasificador (variante LCM).
- Ejecucion en navegador sobre WebGPU mediante onnxruntime-web.
- Equilibrio entre fotorrealismo y estilo artistico/anime heredado de DreamShaper 8.
- Inferencia en fp16 para el text encoder y el UNet, con decoder VAE en fp32.
- Tres grafos independientes y de tamano controlado que permiten carga modular.
- No dispone de tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo de difusion, no un modelo de lenguaje).
- No dispone de modo thinking, entrada de audio ni salida multimodal.
- Capacidad multilingue: no disponible; el prompt efectivo se limita al vocabulario del CLIP, predominantemente ingles.

## Casos de uso

- Demos web de generacion de imagenes sin backend GPU: al ejecutarse sobre WebGPU en el navegador, permite ofrecer un generador de imagenes interactivo a coste de servidor cero, construyendo las sesiones ONNX una vez por visita.
- Herramientas creativas en cliente: aplicaciones de diseno o ilustracion que generan variaciones de imagen localmente, con latencias de 2.2-3.1 s por imagen en Chrome sobre Apple silicon y sin enviar el prompt a un servidor.
- Prototipado de producto: validar flujos de texto-a-imagen a 512x512 sin contratar GPU en la nube, usando el repositorio de 2.2 GB servido como recursos estaticos del propio sitio.
- Edicion o generacion asistida offline: entornos con conectividad limitada o requisitos de privacidad donde el prompt no debe salir del dispositivo.
- Educacion y experimentacion: estudiar el pipeline de difusion latente y la destilacion LCM paso a paso, ya que los tres grafos estan separados y el muestreo esta documentado.
- Integracion como paso previo en pipelines graficos: generar bocetos de 512x512 en el navegador que luego se reescalen o refinen con otra herramienta de mayor resolucion.
- Aplicaciones de escritorio empaquetadas con runtime ONNX: reutilizar los mismos grafos fuera del navegador en cualquier entorno que soporte ONNX Runtime con aceleracion GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cualitativos (FID, CLIP score, etc.) en la informacion disponible. La model card unicamente incluye una validacion de fidelidad numerica frente a la referencia de diffusers y una medicion de latencia.

| Metrica | Valor | Contexto |
|---|---|---|
| PSNR frente a diffusers (StableDiffusionPipeline + LCMScheduler) | 60.7 / 51.0 / 54.1 dB | fp32, 4 pasos, guidance 1.0, misma secuencia aleatoria |
| Latencia por imagen 512x512 | ~2.2-3.1 s | Chrome, WebGPU, Apple silicon, tras construir la sesion |

## Requisitos de hardware

- Los pesos suman 2.2 GB en disco (text encoder 246 MB, UNet 1.72 GB, VAE decoder 198 MB); el consumo de memoria en ejecucion es superior a esa cifra por las activaciones y los buffers intermedios.
- Requiere un entorno con WebGPU disponible; en el navegador esto implica versiones recientes de Chrome o equivalentes con soporte WebGPU.
- En el navegador no se necesita instalar CUDA ni drivers adicionales: onnxruntime-web gestiona la aceleracion sobre el backend WebGPU del sistema.
- Fuera del navegador puede ejecutarse con ONNX Runtime en GPU de escritorio o servidor (por ejemplo, RTX 4090, A100, H100) para reducir latencia, aunque la informacion proporcionada no incluye mediciones en esas plataformas.
- Cabe en GPU de consumo y en GPU integradas modernas por el tamano del UNet en fp16 (1.72 GB), si bien el rendimiento concreto depende del backend y de la memoria disponible.
- Opciones de despliegue documentadas: onnxruntime-web sobre WebGPU. Otros runtimes compatibles con ONNX (ONNX Runtime nativo, etc.) no se detallan en la informacion.
- Latencia y throughput: unicos datos disponibles son los ~2.2-3.1 s por imagen de 512x512 en Chrome sobre Apple silicon; el resto no disponible.

## Comparativa con modelos similares

| Modelo | Formato | Tamano | Pasos de muestreo | Licencia | Ejecucion en navegador |
|---|---|---|---|---|---|
| skillsafeai/dreamshaper-8-lcm-onnx-webgpu | ONNX (opset 17) | 2.2 GB | 4 (LCM, sin guidance) | CreativeML Open RAIL-M | Si (WebGPU via onnxruntime-web) |
| Lykon/dreamshaper-8-lcm | Pesos PyTorch/diffusers | No disponible en la informacion | 4 (LCM) | CreativeML Open RAIL-M | No documentado |
| runwayml/stable-diffusion-v1.5 | Pesos PyTorch/diffusers | No disponible en la informacion | Tipico 20-50 (guidance) | CreativeML Open RAIL-M | No documentado |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada. La diferencia principal verificable es el formato (ONNX optimizado para navegador en el modelo aqui descrito frente a pesos PyTorch en los otros) y el numero de pasos derivado del uso de LCM.

## Limitaciones y advertencias

- Licencia CreativeML Open RAIL-M: incluye restricciones de uso basadas en el comportamiento. Se prohibe generar contenido que explote o perjudique a menores, imagenes no consentidas de personas reales, difamacion, acoso o usos ilegales. Estas restricciones se aplican tanto a la exportacion como a sus salidas.
- Prompt efectivo limitado por el CLIP ViT-L/14: el modelo responde principalmente a instrucciones en ingles; el soporte multilingue no esta documentado.
- Resolucion de salida fija de 512x512 en los grafos documentados; no se indica soporte para otras resoluciones sin modificar el pipeline.
- La destilacion LCM con 4 pasos y sin guidance prioriza la velocidad sobre la calidad final; frente a configuraciones con mas pasos y guidance, la fidelidad al prompt puede resentirse.
- Riesgo de sesgos y alucinacion visual: como todo modelo de difusion entrenado sobre datos web a gran escala, puede reproducir estereotipos y generar contenido incoherente o no solicitado.
- Dependencia de WebGPU: en navegadores o dispositivos sin soporte WebGPU la ejecucion puede fallar o caer a un backend mucho mas lento.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: la adopcion y el mantenimiento por parte de la comunidad no estan verificados.
- La ficha y la validacion (PSNR) solo cubren fidelidad numerica frente a diffusers; no hay evidencia publicada sobre calidad percibida en produccion.
- El repositorio no registra pesos reentrenados ni ajustes adicionales: cualquier mejora de calidad debe proceder del modelo base, no de esta exportacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/skillsafeai/dreamshaper-8-lcm-onnx-webgpu
- Modelo base: https://huggingface.co/Lykon/dreamshaper-8-lcm
- README del modelo base (DreamShaper 8 LCM): https://huggingface.co/Lykon/dreamshaper-8-lcm/blob/main/README.md
- Pagina de Lykon/DreamShaper: https://huggingface.co/Lykon/DreamShaper
- DreamShaper en Civitai: https://civitai.com/models/4384/dreamshaper
- Documentacion de Cloudflare AI sobre dreamshaper-8-lcm: https://developers.cloudflare.com/ai/models/%40cf/lykon/dreamshaper-8-lcm/
- Ficha en AIBase: https://model.aibase.com/models/details/1915687213565952002

# Braxtonius/sdxl-vae-fp16-fix

## Resumen

SDXL-VAE-FP16-Fix es una version modificada del VAE de SDXL (Stable Diffusion XL) disenada para funcionar en precision fp16 sin generar valores NaN. El modelo original de Stability AI produce NaN durante la decodificacion en fp16 porque sus activaciones internas alcanzan magnitudes demasiado grandes para el rango representable de esa precision. Esta variante, publicada por Braxtonius como reempaquetado del trabajo original de madebyollin, corrige ese problema reescalando pesos y sesgos internos de la red.

Tecnicamente no es un modelo generativo completo, sino el autoencoder que forma parte del pipeline de SDXL: comprime imagenes a un espacio latente y las reconstruye. Su relevancia practica es que permite ejecutar el pipeline completo de SDXL (base y refiner) en fp16 de extremo a extremo, reduciendo el uso de VRAM y evitando el clasico workaround `--no-half-vae` en Automatic1111, que degradaba el rendimiento.

El checkpoint tiene 83.653.863 parametros, se distribuye en formato safetensors y se integra en diffusers mediante la clase `AutoencoderKL`. La licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VAE convolucional (autoencoder KL) del pipeline SDXL |
| Parametros totales | 83.653.863 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | fp16 (objetivo del fix), fp32, bfloat16 |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se trata del VAE original de SDXL 0.9 (compatible tambien con SDXL 1.0) sometido a un fine-tuning especifico. El objetivo del ajuste fue triple: mantener la salida final practicamente identica, reducir la magnitud de las activaciones internas y lograrlo reescalando los pesos y sesgos de la red. De este modo, los valores intermedios dejan de desbordar el rango de fp16 y se eliminan los NaN que aparecian durante la decodificacion.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni el uso de tecnicas como RLHF o DPO, que en cualquier caso no aplican a un autoencoder. La innovacion tecnica es puramente numerica: el reescalado interno permite ejecutar la decodificacion en fp16 sin perdida apreciable de calidad. El autor advierte de ligeras discrepancias entre la salida de esta variante y la del VAE original, consideradas aceptables para la mayoria de usos.

## Capacidades

- Codificacion de imagenes a espacio latente y decodificacion de latentes a imagen dentro del pipeline SDXL.
- Decodificacion estable en fp16 sin generar NaN, a diferencia del VAE original de SDXL.
- Compatibilidad con precision fp32 y bfloat16 ademas de fp16.
- Integracion directa con diffusers mediante `AutoencoderKL`.
- Uso como fichero VAE externo en Automatic1111 (`models/VAE`), eliminando la necesidad de `--no-half-vae`.
- Compatible con SDXL base 1.0 y SDXL refiner 1.0, asi como con el pipeline de dos etapas (base + refiner).
- No soporta generacion de texto, tool calling, agentes ni capacidades multimodales mas alla de la reconstruccion de imagen.

## Casos de uso

- Inferencia de SDXL en fp16 de extremo a extremo: sustituir el VAE por defecto en el pipeline de diffusers permite ejecutar base y refiner en fp16 sin NaN, reduciendo la VRAM necesaria y manteniendo la calidad de decodificacion.
- Despliegue en GPUs de consumo: al evitar la decodificacion en fp32, el pipeline completo cabe en tarjetas con menos memoria, lo que facilita servir SDXL en equipos con 12-16 GB de VRAM.
- Automatizacion de generacion de imagenes en produccion: pipelines con `DiffusionPipeline` que necesitan estabilidad numerica en fp16 pueden usar este VAE como componente fijo sin riesgo de imagenes corruptas por NaN.
- WebUI de Automatic1111: colocar `sdxl.vae.safetensors` en `models/VAE` y seleccionarlo permite retirar el flag `--no-half-vae`, recuperando velocidad y reduciendo consumo de memoria.
- Entrenamiento y fine-tuning de LoRAs sobre SDXL: usar este VAE durante la validacion evita artefactos de decodificacion en fp16 y acelera las iteraciones.
- Investigacion comparativa de VAEs: sirve como referencia de un VAE numericamente estable para experimentos que midan el impacto del reescalado interno en la calidad de reconstruccion.
- Integracion en servicios de imagen por API: al ser un componente ligero (83,6 M de parametros) y con licencia MIT, puede incorporarse sin restricciones en productos comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye comparaciones cualitativas de decodificacion en fp32/fp16 entre el VAE original y esta variante, sin metricas numericas como FID, PSNR o SSIM.

## Requisitos de hardware

- VRAM estimada para el VAE en fp16: aproximadamente 170 MB de pesos (83,6 M de parametros a 2 bytes), mas activaciones segun la resolucion de la imagen decodificada.
- VRAM estimada en fp32: aproximadamente 335 MB de pesos.
- El VAE por si solo cabe en practicamente cualquier GPU consumer; el requisito real lo marca el modelo UNet de SDXL que lo acompana.
- GPUs recomendadas para el pipeline completo: RTX 4090, A100, H100 para produccion; RTX 3090, RTX 4080 o superiores para uso local comodo.
- Cabe en GPUs consumer de gama media-alta (12-16 GB) al ejecutar el pipeline completo en fp16, que es precisamente el escenario que habilita este fix.
- Opciones de despliegue: diffusers (`AutoencoderKL`), Automatic1111, ComfyUI y cualquier herramienta que acepte ficheros VAE en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Precision objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|
| SDXL-VAE-FP16-Fix (este) | 83.653.863 | fp16 sin NaN, fp32, bf16 | MIT | Hugging Face (Braxtonius, reempaquetado de madebyollin) |
| SDXL-VAE (Stability AI) | no disponible en la informacion | fp32/bf16; fp16 genera NaN | no disponible en la informacion | Hugging Face (stabilityai/sdxl-vae) |
| SD 1.x/2.x VAE | no disponible en la informacion | fp16 estable en su rango | no disponible en la informacion | Hugging Face |

La comparativa se limita al VAE original de SDXL, del que este modelo es una correccion numerica, y a los VAEs de versiones anteriores de Stable Diffusion, que no presentan el problema de NaN en fp16 pero no son intercambiables con SDXL por diferencias de espacio latente.

## Limitaciones y advertencias

- No es un modelo generativo autonomo: requiere un UNet de SDXL para producir imagenes.
- Existen ligeras discrepancias entre la salida de este VAE y la del SDXL-VAE original; el autor las considera aceptables para la mayoria de propositos, pero pueden ser relevantes en flujos que exijan reproducibilidad exacta respecto al VAE original.
- Esta basado especificamente en SDXL-VAE 0.9, aunque funciona con SDXL 1.0.
- El repositorio de Braxtonius registra 0 descargas y 0 likes, por lo que es un reempaquetado de terceros; conviene verificar la integridad del safetensors frente al original de madebyollin.
- No dispone de model card propia mas alla de la copia del autor original; no hay informacion sobre sesgos, ya que es un componente de reconstruccion y no un modelo de lenguaje.
- La licencia MIT permite uso comercial sin restricciones adicionales, pero el pipeline SDXL completo queda sujeto a la licencia del modelo base de Stability AI.
- Las instrucciones para Automatic1111 incluidas en la model card no fueron probadas por el autor.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Braxtonius/sdxl-vae-fp16-fix
- Modelo original de referencia: https://huggingface.co/madebyollin/sdxl-vae-fp16-fix
- SDXL-VAE de Stability AI: https://huggingface.co/stabilityai/sdxl-vae
- Discusion sobre diferencias de salida: https://huggingface.co/madebyollin/sdxl-vae-fp16-fix/discussions/7
- Discusion sobre la base SDXL-VAE 0.9: https://huggingface.co/stabilityai/sdxl-vae/discussions/6
- SDXL base 1.0: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- SDXL refiner 1.0: https://huggingface.co/stabilityai/stable-diffusion-xl-refiner-1.0

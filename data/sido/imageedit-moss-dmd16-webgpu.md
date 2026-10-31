# Sido/ImageEdit-MOSS-DMD16-WebGPU

## Resumen

ImageEdit-MOSS-DMD16-WebGPU es una conversión experimental para navegador del modelo de generación de imágenes MOSS-Image-SFT, desarrollada por el usuario Sido y publicada en Hugging Face. El paquete parte de la conversión ONNX de Smile Forge del modelo base OpenMOSS-Team/MOSS-Image-SFT y le aplica, sin fusionar, el adaptador LoRA de destilación DMD de lodestones (MOSS-Image-SFT-8-steps-dmd) en FP32, lo que permite generar imágenes en muy pocos pasos de muestreo. El objetivo declarado del proyecto es ejecutar la inferencia completa en el navegador mediante onnxruntime-web con backend WebGPU, eliminando la necesidad de servidores con GPU dedicada.

La relevancia de esta ficha reside en su perfil de despliegue: cuantización W4 (RTN, block size 32) del transformer de imagen, codificador de texto Qwen3.5-9B en FP16 con límite de 128 tokens, y variantes `*-fullhd.onnx` que dividen las consultas de atención en fragmentos (chunks) para evitar superar los límites de storage buffers de WebGPU. El repositorio pesa 20,3 GB y está bajo licencia Apache-2.0. Es un proyecto experimental: el propio autor advierte que la compatibilidad con dispositivos, la calidad y los distintos tamaños de imagen requieren verificación real en GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion de imagen (MOSS-Image) con codificador de texto Qwen3.5-9B; detalles completos no disponibles |
| Parametros totales | no disponible (el repositorio pesa 20,3 GB en formato ONNX cuantizado) |
| Parametros activos | no disponible |
| Longitud de contexto | 128 tokens para el prompt de texto (limite del codificador en esta conversion) |
| Tipos de cuantizacion | W4 RTN (block size 32) para el transformer de imagen; FP16 para el codificador de texto y el decodificador; LoRA DMD sin fusionar en FP32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (con binarios externos y metadatos de grafo modificados); manifiestos JSON de verificacion (SHA-256) |

## Arquitectura y entrenamiento

El paquete se compone de tres piezas. Primero, el transformer de imagen de MOSS-Image-SFT, convertido a ONNX por Smile Forge en W8 y requantizado aqui a W4 mediante RTN (round-to-nearest) con block size 32. Segundo, el adaptador LoRA de destilacion DMD (Distribution Matching Distillation) de lodestones, que permite muestrear en 8 pasos aguas arriba; en esta conversion se aplica sin fusionar en FP32 con fuerza 0,7 sobre los pesos W4 intactos, lo que facilita ajustar o retirar el adaptador. Tercero, el codificador de texto basado en Qwen3.5-9B, que se ejecuta en FP16 con acumulacion FP32 en las proyecciones y estado de atencion en navegador, codificando el prompt en tiempo de ejecucion con un limite de 128 tokens; no se incluyen embeddings de caption precalculados.

Como innovacion de empaquetado, las variantes `*-fullhd.onnx` dividen las consultas de atencion de imagen en 16 fragmentos y las del decodificador en 32, mediante nodos Slice dinamicos balanceados e independientes. Esto evita que los kernels Split con muchas salidas superen los limites de storage buffers de WebGPU, conservando todas las claves y valores originales en cada consulta. El perfil de inferencia previsto es de 16 pasos Euler con shift 5 (release), sin CFG (guidance 1); el autor subraya que no es el generador/sampler DMD original en espacio de datos del proyecto upstream. No hay informacion sobre datos de entrenamiento ni ajuste RLHF/DPO del modelo base en la documentacion disponible.

## Capacidades

- Generacion de imagenes a partir de texto (pipeline text-to-image) con el modelo base MOSS-Image-SFT.
- Generacion acelerada en pocos pasos gracias al adaptador LoRA DMD aplicado con fuerza 0,7 (perfil previsto: 16 pasos Euler, shift 5, sin CFG).
- Codificacion del prompt en tiempo de ejecucion en el navegador mediante Qwen3.5-9B en FP16 (limite de 128 tokens).
- Inferencia completamente client-side mediante onnxruntime-web 1.30.0 con backend WebGPU y extension shader-f16.
- Soporte de resoluciones altas (variantes `*-fullhd.onnx`) mediante division de consultas de atencion en chunks, con longitudes de secuencia variables.
- No hay informacion sobre edicion de imagenes (image editing) pese al nombre del repositorio; la pipeline declarada es text-to-image.
- No aplica: tool calling, agentes ni capacidades multilingues documentadas.

## Casos de uso

- Generacion de imagenes sin backend propio: al ejecutarse integramente en el navegador via WebGPU, una aplicacion web puede ofrecer generacion de imagenes a sus usuarios sin coste de servidor de GPU ni envio de prompts a servicios externos.
- Prototipado de demos client-side: ideal para demos tecnicas de difusion en navegador, ya que el paquete incluye manifiestos con SHA-256 y scripts de preparacion de assets para integrar el modelo en una app.
- Herramientas de privacidad: al no salir los prompts del dispositivo, es adecuado para aplicaciones donde el usuario no desea enviar sus descripciones a la nube.
- Experimentacion con cuantizacion agresiva: el empaquetado W4 + LoRA sin fusionar permite comparar calidad y velocidad entre el base W4 y el base con DMD, util para investigacion en destilacion de difusion.
- Generacion en resoluciones altas: las variantes `fullhd` con atencion fragmentada apuntan a la generacion de imagenes de alta resolucion dentro de los limites de memoria de WebGPU.
- Distribucion offline: el packager offline y los manifiestos de verificacion permiten empaquetar los assets para uso local sin autenticacion ni subidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento declarado es el perfil de muestreo previsto: 16 pasos Euler con shift 5 y guidance 1 (CFG desactivado), con un minimo de 32 GiB de memoria del host y 64 GiB recomendados. No hay mediciones de latencia, throughput ni calidad de imagen.

## Requisitos de hardware

- Memoria del host (RAM): minimo 32 GiB; se recomiendan 64 GiB, segun la model card.
- GPU: cualquier GPU compatible con WebGPU y la extension shader-f16; no se listan modelos concretos. El autor advierte que la compatibilidad por dispositivo requiere pruebas reales end-to-end.
- Consumer GPUs: potencialmente viable en GPUs de escritorio recientes con soporte WebGPU (por ejemplo, RTX 30/40 o equivalentes), pero no hay datos publicados que lo confirmen; el peso del repositorio (20,3 GB) sugiere requisitos de memoria de GPU y host elevados.
- Software: onnxruntime-web 1.30.0 con backends WebGPU y shader-f16; navegador con soporte WebGPU.
- No hay estimaciones publicadas de VRAM exacta, latencia ni throughput.
- No aplican despliegues tipicos de servidor (vLLM, TGI, llama.cpp): el objetivo es inferencia en navegador; Ollama y similares no son aplicables al formato ONNX de este paquete.

## Comparativa con modelos similares

| Modelo | Formato / cuantizacion | Entorno objetivo | Pasos de muestreo | Licencia |
|---|---|---|---|---|
| Sido/ImageEdit-MOSS-DMD16-WebGPU | ONNX W4 + LoRA DMD FP32 sin fusionar | Navegador (onnxruntime-web, WebGPU) | 16 (Euler, shift 5, sin CFG) | Apache-2.0 |
| OpenMOSS-Team/MOSS-Image-SFT (base) | Pesos originales (no disponible el formato en la ficha) | Servidor / Python | no disponible | Apache-2.0 |
| smile-forge/moss-image-onnx | ONNX W8 | no disponible | no disponible | Apache-2.0 |
| lodestones/MOSS-Image-SFT-8-steps-dmd | LoRA DMD (safetensors) sobre MOSS-Image-SFT | Servidor / Python | 8 pasos (datos de espacio) | Apache-2.0 |

## Limitaciones y advertencias

- Proyecto explicitamente experimental: el autor indica que la compatibilidad de dispositivos, la calidad y todos los tamanos de imagen requieren verificacion en GPU real; las validaciones ONNX y las pruebas de equivalencia de atencion en CPU no garantizan funcionamiento end-to-end.
- Perfil de muestreo no estandar: los 16 pasos Euler con shift 5 no son el sampler DMD original del proyecto upstream, por lo que la calidad puede diferir de la del modelo base con DMD.
- Limite de 128 tokens en el prompt, impuesto por la configuracion del codificador en esta conversion.
- Requisitos de memoria muy altos para ejecucion en navegador (32-64 GiB de RAM del host), lo que limita su uso en equipos modestos.
- La cuantizacion W4 RTN puede degradar la calidad de imagen respecto a los pesos originales; no hay evaluaciones publicadas de esta degradacion.
- El nombre del repositorio sugiere edicion de imagenes (ImageEdit), pero la pipeline declarada es text-to-image; no hay documentacion de capacidades de edicion.
- Cero descargas registradas en el momento de la ficha, sin comunidad ni soporte aparente.
- Licencia Apache-2.0: sin restricciones para uso comercial, pero el paquete es una conversion independiente sin respaldo de OpenMOSS, Qwen, FLUX, Smile Forge ni lodestones.
- No hay informacion sobre sesgos, riesgo de alucinacion ni salvaguardas de contenido del modelo base.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Sido/ImageEdit-MOSS-DMD16-WebGPU
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Conversion ONNX de referencia: https://huggingface.co/smile-forge/moss-image-onnx/tree/1b6c0496cfcbfa53426245bd084d01d85ca0326e
- Adaptador DMD: https://huggingface.co/lodestones/MOSS-Image-SFT-8-steps-dmd/tree/f95df83b5e90ae91ea412434b3f9b7f1c8c6314f

No se han encontrado enlaces adicionales relevantes (papers, blogs o demos) en la informacion disponible; los resultados de busqueda web proporcionados no guardan relacion con el modelo.

# infosave/Qwen-Image-2.1-cmf

## Resumen

Qwen-Image-2.1 CMF es un empaquetado en un unico fichero del modelo de difusion Qwen-Image-2.1 de Alibaba Qwen, distribuido por el usuario infosave bajo el formato CMF (Cortiq Model Format) y ejecutable con el motor Rust `cortiq`. El paquete integra los tres componentes del pipeline original: el transformer de imagen de 7B, el codificador de texto Qwen3-VL-8B con su torre de vision y el VAE con soporte de canal alfa (RGBA), junto con la receta de generacion embebida (1024x1024, 40 pasos, sin CFG). No es un modelo nuevo, sino una cuantizacion y reempaquetado del modelo base.

El interes practico del artefacto esta en la distribucion: el fichero `qwen-image-2.1.cmf` ocupa 12,7 GB con el transformer en 4 bits (`q4tp`), el text encoder y la torre de vision en 8 bits (`q8_2f`) y el VAE en f16, y se ejecuta sin Python sobre Metal (Apple Silicon), CUDA o Vulkan (NVIDIA) y con fallback a CPU. Esto elimina la dependencia del stack diffusers/PyTorch y reduce el consumo de VRAM hasta 12 GB a 1024x1024 en una RTX A5000, o 17,5 GB en una RTX PRO 4000 Blackwell.

El modelo cubre text-to-image, generacion con transparencia nativa RGBA y edicion a partir de imagenes de condicion (una o varias). Esta pensado para desarrolladores que quieran desplegar generacion de imagenes en entornos sin Python o con recursos limitados, y para flujos de trabajo de stickers, assets con alfa y edicion guiada por imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) para imagen + codificador de texto Qwen3-VL-8B con torre de vision + VAE RGBA |
| Parametros totales | 7B en el transformer de imagen; Qwen3-VL-8B en el text encoder (total del paquete no disponible) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Transformer 4 bits (`q4tp`), text encoder y vision tower 8 bits (`q8_2f`), VAE f16; el motor soporta bf16 segun la model card |
| Idiomas soportados | en, ru, zh |
| Licencia | qwen-research (etiquetada como `other` en Hugging Face) |
| Formato de pesos | CMF (fichero unico `qwen-image-2.1.cmf`, 12,7 GB) |

## Arquitectura y entrenamiento

El paquete reproduce la arquitectura del modelo base Qwen-Image-2.1: un transformer de difusion (DiT) de 7B parametros que genera latentes de imagen, condicionado por un codificador de texto Qwen3-VL-8B que incluye torre de vision, y un VAE con soporte de canal alfa para salida RGBA. La receta de generacion (resolucion 1024x1024, 40 pasos, sin classifier-free guidance) viaja dentro del propio fichero CMF, de modo que el usuario no necesita configurar muestreador ni escala de CFG.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens vistos, la composicion de los datos ni sobre si se aplicaron tecnicas de alineacion como RLHF o DPO; esa informacion corresponde al modelo base y no se detalla en la model card del reempaquetado. La innovacion tecnica documentada es la cuantizacion medida empiricamente: el text encoder se mantiene en 8 bits porque a 4 bits su salida se desvia un 40 % respecto a la referencia fp32, mientras que a 8 bits la desviacion baja al 11 %; con pesos bf16 el motor coincide con la referencia fp32 de diffusers con un error de 1e-5. El motor `cortiq` esta escrito en Rust y no requiere Python.

## Capacidades

- Generacion de imagenes texto-a-imagen con resoluciones de 512x512, 1024x1024 y 2048x2048.
- Generacion con transparencia nativa (RGBA): el PNG conserva el canal alfa cuando se solicita en el prompt.
- Edicion de imagenes a partir de una o varias imagenes de condicion, incluyendo instrucciones de preservacion de sujeto ("keep the fox unchanged").
- Renderizado de texto en imagen, evidenciado en los ejemplos (rotulos de neon, carteles con titulo "BAIKAL").
- Estilos fotorealistas e ilustrados (ejemplos de zorro en nieve, sticker de dragon, poster vintage).
- Soporte multilingue de prompts en ingles, ruso y chino.
- Ejecucion sin Python en Metal, CUDA, Vulkan y CPU.
- No se documenta soporte de tool calling, agentes, audio ni modo thinking.

## Casos de uso

- Generacion de stickers y assets con transparencia: el modelo produce PNG con canal alfa nativo, lo que permite integrar los resultados directamente en interfaces, tiendas de aplicaciones o pipelines de diseno sin post-procesado de recorte.
- Edicion de producto por imagen de condicion: se pasa una foto y una instruccion ("Change the background to a sunset beach") y el modelo recompone el fondo preservando el sujeto, util para catalogos de e-commerce.
- Prototipado de carteleria y rotulacion: los ejemplos muestran generacion de texto legible en imagen (rotulos de neon, titulos de poster), adecuado para bocetos de campanas antes de produccion grafica.
- Despliegue en estaciones de trabajo sin Python: al ejecutarse con `cortiq` sobre Metal o Vulkan, encaja en equipos Mac con Apple Silicon o en maquinas Linux con GPU NVIDIA sin instalar PyTorch ni CUDA toolkit completo.
- Generacion por lotes en servidores con GPU de 24 GB: con 17,5 GB de VRAM pico a 1024x1024, una sola tarjeta puede procesar imagenes secuencialmente a unos 48 s por imagen en RTX PRO 4000 Blackwell.
- Creacion de ilustracion editorial y concept art: resoluciones de hasta 2048x2048 permiten generar material de referencia con detalle suficiente para revision humana, a un coste de unos 246 s por imagen en la GPU citada.
- Localizacion de creatividades para mercados rusohablantes y chinos: el soporte nativo de prompts en ru y zh evita traducciones intermedias en flujos de marketing regional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, GenEval, etc.) en la informacion disponible. La model card solo aporta mediciones de rendimiento de inferencia:

| Tarea | Resolucion | Tiempo total | Pasos DiT | Encode de prompt | VAE |
|---|---|---:|---:|---:|---:|
| Text-to-image (RTX PRO 4000, Vulkan) | 512x512 | 15 s | 9,6 s (0,24 s/paso) | 2,4 s | 1,4 s |
| Text-to-image (RTX PRO 4000, Vulkan) | 1024x1024 | 48 s | 41,6 s (1,04 s/paso) | 2,2 s | 1,8 s |
| Text-to-image (RTX PRO 4000, Vulkan) | 2048x2048 | 246 s | 238 s (6,0 s/paso) | 2,0 s | 3,2 s |
| Edicion con 1 imagen de condicion (RTX PRO 4000) | 1024x1024 | 122 s | 47 s (1,18 s/paso) | 60 s | 1,7 s |
| Text-to-image (RTX A5000, CUDA) | 512x512 | 15,3 s | 10,3 s (0,24 s/paso) | 1,6 s | 1,4 s |
| Text-to-image (RTX A5000, CUDA) | 1024x1024 | 53,0 s | 46,8 s (1,15 s/paso) | 1,5 s | 2,8 s |
| Text-to-image (Mac mini M4, Metal) | 512x512 | 3,9 min | 5,5 s/paso | no disponible | 7,6 s |

## Requisitos de hardware

- VRAM pico: 17,5 GB a 1024x1024 en RTX PRO 4000 Blackwell (24 GB); 12 GB a 1024x1024 en RTX A5000 (24 GB) con backend CUDA.
- GPU recomendadas: RTX PRO 4000 Blackwell, RTX A5000; cualquier GPU NVIDIA de 24 GB con soporte Vulkan o CUDA. En Apple Silicon, Mac mini M4 de 24 GB funciona via Metal.
- No cabe en GPU de consumo de 8-12 GB segun los datos publicados; el minimo documentado es 12 GB pico en A5000, por lo que tarjetas de 16 GB son el limite practico inferior no verificado.
- Despliegue: motor `cortiq-cli` (Rust), instalable con `cargo install cortiq-cli` (version 0.8.2 o superior; 0.8.82 o superior para CUDA). El backend CUDA es una feature de compilacion y no esta en los binarios precompilados. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Seleccion de GPU: el motor elige la GPU con tensor cores y mas memoria; `CMF_GPU_ADAPTER=<n>` fija otra.
- Latencia y throughput: 48 s por imagen a 1024x1024 en RTX PRO 4000 (40 pasos), 53 s en RTX A5000, 3,9 min a 512x512 en Mac mini M4. Una imagen por proceso; no se documenta procesamiento por lotes concurrente.
- En Linux sin entorno grafico es necesario fijar `XDG_RUNTIME_DIR=/tmp`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Licencia | Formato y ejecucion | Notas |
|---|---|---|---|---|---|
| Qwen-Image-2.1 CMF (este) | 7B DiT + Qwen3-VL-8B encoder | hasta 2048x2048; contexto no disponible | qwen-research | CMF, motor Rust sin Python | Cuantizado 4/8 bits, RGBA nativo, edicion |
| Qwen-Image-2.1 (base) | 7B DiT + Qwen3-VL-8B encoder | hasta 2048x2048 (segun este paquete) | qwen-research | diffusers / PyTorch | Referencia fp32; requiere stack Python |
| Alternativas de difusion abiertas de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

No se dispone de informacion sobre benchmarks comparativos con otros modelos de generacion de imagen, por lo que la comparativa se limita a diferencias de empaquetado, cuantizacion y motor de ejecucion.

## Limitaciones y advertencias

- Licencia `qwen-research`: no es una licencia permisiva estandar; debe revisarse el fichero LICENSE antes de cualquier uso comercial. La model card la etiqueta como `other`.
- El artefacto es una cuantizacion: el transformer en 4 bits y el text encoder en 8 bits introducen desviaciones medibles (11 % en la salida del encoder a 8 bits respecto a fp32); la calidad final puede diferir de la version bf16/fp32 del modelo base.
- Riesgo de alucinacion visual y de texto mal renderizado en imagenes con rotulacion compleja; no se aportan metricas de fidelidad de texto.
- Cobertura idiomatica limitada a en, ru y zh; el castellano no figura entre los idiomas soportados.
- No se documenta longitud de contexto del encoder ni limites de longitud de prompt.
- Ejecucion de una imagen por proceso: no hay evidencia de soporte de batching concurrente ni de servidor de inferencia multiusuario.
- El backend CUDA requiere compilacion propia con las librerias CUDA 12.x y el driver correspondiente; los binarios precompilados no lo incluyen.
- Dependencia de un motor propietario del ecosistema (`cortiq`) y de un formato de fichero (CMF) no estandar; la portabilidad a otros runtimes no esta documentada.
- El repositorio tiene 43 descargas y 1 like en el momento de la consulta: validacion comunitaria muy baja.
- No se detallan sesgos conocidos del modelo base en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/infosave/Qwen-Image-2.1-cmf
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio del formato CMF y motor: https://github.com/infosave2007/cmf
- Binarios precompilados de cortiq: https://github.com/infosave2007/cmf/releases
- Fichero de pesos: https://huggingface.co/infosave/Qwen-Image-2.1-cmf/resolve/main/qwen-image-2.1.cmf
- Suma de verificacion: https://huggingface.co/infosave/Qwen-Image-2.1-cmf/resolve/main/qwen-image-2.1.cmf.sha256
- Ejemplos generados: https://huggingface.co/infosave/Qwen-Image-2.1-cmf/resolve/main/samples/1.png , https://huggingface.co/infosave/Qwen-Image-2.1-cmf/resolve/main/samples/2.png , https://huggingface.co/infosave/Qwen-Image-2.1-cmf/resolve/main/samples/3.png , https://huggingface.co/infosave/Qwen-Image-2.1-cmf/resolve/main/samples/4.png , https://huggingface.co/infosave/Qwen-Image-2.1-cmf/resolve/main/samples/5-edit.png

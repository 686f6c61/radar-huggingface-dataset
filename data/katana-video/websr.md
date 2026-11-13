# katana-video/websr

## Resumen

WebSR es una coleccion de pesos de superresolucion (upscaling) pensada para ejecutarse en el navegador mediante WebGPU. La publica `katana-video`, el espacio de Hugging Face de Sam Bhattacharyya (Katana Video), y forma parte del proyecto WebSR, una libreria JavaScript (`@websr/websr`) que aplica IA en tiempo real a imagenes y video directamente en el cliente, sin backend. El repositorio es un espejo de los pesos canonicos que viven en el repositorio de GitHub del proyecto y se sirven via jsDelivr.

No se trata de un unico modelo, sino de un conjunto de siete redes de escalado 2x (salvo `realesrgan/x4v3`, que es 4x): desde CNNs minusculas de aproximadamente 1.400 parametros (5,8 KB) hasta UNets de 17,2 MB destiladas de Real-ESRGAN x4v3. Esta horquilla de tamanos permite elegir el compromiso entre calidad y coste segun el dispositivo, desde moviles de gama baja hasta equipos de escritorio con GPU integrada.

La relevancia del proyecto es practica: demuestra que el upscaling neuronal de video puede correr en un navegador con latencias de milisegundos (3 ms a 95 ms por fotograma de 640x360 en un Apple M4), lo que habilita casos como reescalado de streaming, mejora de videollamadas o previsualizacion de contenido sin enviar datos a un servidor. La licencia es MIT para los pesos propios y BSD-3-Clause para el componente derivado de Real-ESRGAN.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNNs ligeras (estilo Anime4K CNN-L) y UNets destiladas de Real-ESRGAN x4v3; una red Real-ESRGAN repackada |
| Parametros totales | Variable por variante: ~1,4k (`cnn-xs`), hasta redes de 16,4-17,2 MB en disco (`gan-m`, `gan-s`); recuento exacto de parametros no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision image-to-image) |
| Tipos de cuantizacion | Pesos empaquetados en formato binario propio (`.bin`) con soporte f16 en WebGPU donde el dispositivo lo permite; no se documentan otras cuantizaciones |
| Idiomas soportados | No aplica (no procesa texto) |
| Licencia | MIT para `websr/*`; BSD-3-Clause para `realesrgan/x4v3` |
| Formato de pesos | Binario propio de WebSR (`.bin`), parseado con `WebSR.parseBinaryWeights`; no safetensors ni GGUF |

Variantes incluidas:

| `network_name` | Fichero | Tamano | Descripcion |
|---|---|---|---|
| `websr/cnn-xs` | `weights/websr/cnn-xs.bin` | 5,8 KB | CNN minima (~1,4k parametros) para dispositivos de gama baja |
| `websr/cnn-s` | `weights/websr/cnn-s.bin` | 35 KB | Arquitectura Anime4K CNN-L con pesos entrenados por WebSR |
| `websr/cnn-m` | `weights/websr/cnn-m.bin` | 125 KB | CNN mas ancha, 16 canales |
| `websr/cnn-l` | `weights/websr/cnn-l.bin` | 364 KB | CNN mas ancha, 28 canales |
| `websr/gan-s` | `weights/websr/gan-s.bin` | 17,2 MB | UNet destilada de Real-ESRGAN x4v3, con calibracion por video |
| `websr/gan-m` | `weights/websr/gan-m.bin` | 16,4 MB | UNet mayor destilada de Real-ESRGAN x4v3 |
| `realesrgan/x4v3` | `weights/realesrgan/x4v3.bin` | 4,9 MB | Real-ESRGAN `realesr-general-x4v3`, 4x, reempaquetado para WebSR |

## Arquitectura y entrenamiento

El conjunto combina dos familias. Las variantes `cnn-*` son redes convolucionales muy pequenas inspiradas en la arquitectura CNN-L de Anime4K (MIT), con pesos reentrenados por WebSR; su tamano va de 5,8 KB a 364 KB y su coste computacional es minimo. Las variantes `gan-*` son UNets destiladas por destilacion de conocimiento a partir de Real-ESRGAN `realesr-general-x4v3`, con el objetivo de conservar buena parte del detalle del modelo profesor a una fraccion del coste, algo crucial en inferencia en navegador limitada por ancho de banda y presupuesto de GPU. `gan-s` incorpora ademas un paso opcional de calibracion por video (`websr.calibrate([videoFrame])`).

La variante `realesrgan/x4v3` es el modelo original `realesr-general-x4v3` de Real-ESRGAN reempaquetado en el formato binario de WebSR; es 4x y notablemente mas lento (~0,8 s por fotograma de 640x360 en M4) que las destiladas. No se detallan en la informacion disponible el numero de tokens o imagenes de entrenamiento, la composicion del dataset ni si se empleo RLHF/DPO (no aplicable en este dominio). La innovacion tecnica principal es el propio pipeline de despliegue: pesos empaquetados para carga rapida, ejecucion en WebGPU con f16 y calibracion por video.

## Capacidades

- Superresolucion de imagen 2x (y 4x con `realesrgan/x4v3`) en el navegador.
- Upscaling de video en tiempo real mediante WebGPU, procesando fotogramas sucesivos.
- Seleccion de arquitectura por `network_name` con pesos intercambiables, lo que permite adaptar calidad y coste al dispositivo.
- Calibracion por video en las variantes `gan-*` para ajustar la salida a las caracteristicas del metraje.
- Ejecucion 100% en cliente: no requiere backend ni envio de datos a servidores.
- Soporte de f16 donde el dispositivo lo permite, con impacto directo en velocidad.
- No soporta texto, tool calling, agentes ni razonamiento multi-paso; es exclusivamente image-to-image.

## Casos de uso

- Upscaling de video en streaming en el navegador: integrado en un reproductor web, `gan-s` o `gan-m` reescalan fotogramas de 640x360 en decenas de milisegundos, lo que permite mejorar la calidad percibida de contenido de baja resolucion sin reencodificar en servidor.
- Mejora de videollamadas y webinars: `cnn-s` o `cnn-m` pueden aplicarse a la captura de camara en tiempo real con costes de 8-29 ms por fotograma, adecuados para mantener 30 fps en equipos modestos.
- Previsualizacion de fotos en aplicaciones web: `gan-m` ofrece detalle cercano a Real-ESRGAN para imagenes subidas por el usuario, procesadas localmente sin subirlas a un servidor.
- Edicion de video ligera en el navegador: un editor web puede usar `cnn-l` para previsualizar el resultado de un upscaling antes de un render final con `realesrgan/x4v3` en servidor.
- Contenido de anime y dibujo: `cnn-s`, basado en Anime4K CNN-L, esta pensado para lineas y areas planas tipicas de animacion, con coste minimo (8 ms por fotograma en M4).
- Dispositivos de gama baja y moviles: `cnn-xs` (~1,4k parametros, 5,8 KB) permite ofrecer algun nivel de mejora incluso en hardware muy limitado, como fallback cuando `gan-*` no alcanza la tasa de fotogramas.
- Procesamiento por lotes en cliente para catalogos de imagenes: aplicar `gan-s` a miniaturas o productos en una web, evitando costes de servidor y preservando la privacidad del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (PSNR, SSIM, LPIPS) en la informacion disponible. El autor si proporciona tiempos de inferencia aproximados en un Apple M4 (Chrome, WebGPU, fotograma de 640x360, f16 donde es posible):

| Variante | Tiempo por fotograma |
|---|---|
| `cnn-xs` | ~3 ms |
| `cnn-s` | ~8 ms |
| `cnn-m` | ~29 ms |
| `cnn-l` | ~85 ms |
| `gan-s` | ~59 ms |
| `gan-m` | ~95 ms |
| `realesrgan/x4v3` | ~0,8 s |

## Requisitos de hardware

- VRAM: no disponible de forma explicita; los pesos van de 5,8 KB a 17,2 MB, por lo que el consumo de memoria es muy bajo comparado con modelos de difusion o LLM.
- GPU recomendadas: cualquier GPU con soporte WebGPU en Chrome (Apple M-series, GPUs integradas modernas, GPUs discretas NVIDIA/AMD recientes). El autor solo reporta cifras en Apple M4.
- Cabe en GPU de consumo: si, practicamente en cualquier dispositivo con WebGPU; las variantes `cnn-*` incluso en hardware de gama baja.
- Opciones de despliegue: navegador con WebGPU mediante `@websr/websr` (npm); los pesos se cargan desde Hugging Face o jsDelivr. No se documentan despliegues con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: ver tabla de la seccion anterior; a modo orientativo, `cnn-s` a 8 ms por fotograma permite superar 60 fps en 640x360, mientras que `realesrgan/x4v3` a 0,8 s por fotograma es adecuado solo para procesamiento no interactivo.

## Comparativa con modelos similares

| Modelo | Tipo | Escala | Tamano | Entorno | Licencia |
|---|---|---|---|---|---|
| WebSR (`cnn-*`, `gan-*`) | CNN / UNet destilada | 2x | 5,8 KB - 17,2 MB | Navegador (WebGPU) | MIT |
| Real-ESRGAN `realesr-general-x4v3` | RRDB/UNet | 4x | 4,9 MB (repack) | Servidor / escritorio (PyTorch) | BSD-3-Clause |
| Anime4K (CNN-L) | CNN | 2x | ~35 KB equivalente | Shaders en reproductores (mpv, etc.) | MIT |

La diferencia clave de WebSR frente a Real-ESRGAN y Anime4K es el entorno de ejecucion: WebSR esta disenado para WebGPU en navegador con latencias de milisegundos, mientras que Real-ESRGAN se ejecuta en PyTorch y Anime4K como shaders en reproductores nativos. No se dispone de comparativas cuantitativas de calidad (PSNR/SSIM) entre ellos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto ni soporta tool calling, agentes o razonamiento.
- Solo escala 2x (o 4x con `realesrgan/x4v3`); no se documentan factores 3x u otros.
- La calidad de las variantes `gan-*` es una aproximacion destilada a Real-ESRGAN x4v3, no equivalente al modelo profesor; puede perder detalle fino en escenas complejas.
- Las cifras de rendimiento proceden de un unico dispositivo (Apple M4); el rendimiento en otras GPUs o navegadores puede variar notablemente.
- Depende de WebGPU, con soporte desigual entre navegadores y sistemas operativos; no hay fallback documentado a WebGL o WASM.
- Riesgo de artefactos tipicos de superresolucion (sobreenfoque, halos, alucinacion de texturas) en imagenes con ruido o compresion agresiva.
- La licencia MIT de los pesos `websr/*` permite uso comercial; `realesrgan/x4v3` queda sujeto a BSD-3-Clause y a las condiciones del proyecto Real-ESRGAN.
- El repositorio es un espejo: la fuente canonica esta en GitHub, por lo que la version en Hugging Face podria quedar desactualizada.
- Sin descargas ni likes en el momento de la consulta; proyecto joven (creado en noviembre de 2026) y con poca validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/katana-video/websr
- Repositorio GitHub de WebSR: https://github.com/sb2702/websr
- Documentacion de pesos y checksums: https://github.com/sb2702/websr/blob/v0.1.0/WEIGHTS.md
- Paquete npm: https://www.npmjs.com/package/@websr/websr
- CDN jsDelivr de los pesos: https://cdn.jsdelivr.net/gh/sb2702/websr@v0.1.0/
- Demo en produccion: https://free.upscaler.video
- Real-ESRGAN (modelo base): https://github.com/xinntao/Real-ESRGAN
- Anime4K (arquitectura CNN): https://github.com/bloc97/Anime4K
- Katana Video: https://katana.video

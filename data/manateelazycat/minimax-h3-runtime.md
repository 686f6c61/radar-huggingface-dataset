# manateelazycat/MiniMax-H3-Runtime

## Resumen

MiniMax-H3-Runtime es un repositorio de imagenes de ejecucion (runtime) en formato Docker para arquitecturas ARM64, publicado por el usuario manateelazycat. No contiene pesos de modelo: empaqueta el codigo de inferencia y las dependencias necesarias para ejecutar MiniMax-H3 en dos plataformas concretas de NVIDIA Jetson, Thor T5000 con JetPack 7 y AGX Orin de 64 GB con JetPack 6. Los pesos se descargan por separado desde los repositorios OpenVDN/vdn-minimax-h3 y Comfy-Org/MiniMax-H3.

El repositorio resuelve un problema de despliegue: reproducir un entorno de inferencia verificado y con checksums publicados sobre hardware embebido con arquitectura ARM64, donde las dependencias de CUDA, los runtimes de NVIDIA y las herramientas de compilacion no son triviales de replicar. La version LPK 0.5.1 reutiliza estas mismas imagenes sin modificarlas, segun indica el autor.

La relevancia es acotada y practica: sirve a quien necesite levantar MiniMax-H3 en un Jetson Thor o en un AGX Orin sin reconstruir el stack desde cero. El repositorio ocupa 38,3 GB, no declara pipeline ni idiomas, y la licencia es "other" con las licencias de terceros (incluidas las de NVIDIA) intactas dentro de las imagenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene runtime de inferencia, no pesos ni definicion de arquitectura del modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (licencias de terceros conservadas dentro de las imagenes, incluidos terminos de runtime de NVIDIA) |
| Formato de pesos | no aplica a este repositorio; los pesos se obtienen por separado desde OpenVDN/vdn-minimax-h3 y Comfy-Org/MiniMax-H3 |

Artefactos publicados en el repositorio:

| Target | Archivo | Bytes | SHA256 |
|---|---|---:|---|
| thor | `minimax-h3-thor-0.4.6-runtime.tar` | 14220806144 | `83fbd4b01b0f94265d33c51f0c70296091593e9bfaae23cdabbcc7fcfff26ca0` |
| orin-64g | `minimax-h3-orin-0.5.0-runtime.tar` | 9809733120 | `f482b8b814071cffb4016bb09fea24e589d6333a0c523f98134e5e7869e5b0ce` |
| thor-cache | `minimax-h3-thor-0.4.6-warm-cache.tar.gz` | 7452828 | `5b9611779a365080485fd746263e8b2bfc1c98af43b9297e81b97dfd3c55216f` |

## Arquitectura y entrenamiento

No disponible. El repositorio no documenta la arquitectura del modelo MiniMax-H3, ni datos de entrenamiento, ni procesos de alineacion como RLHF o DPO. La model card se limita a describir los artefactos de despliegue: dos imagenes Docker para ARM64 (Thor T5000 y AGX Orin 64 GB) y una semilla de cache de compilador para Thor.

El detalle tecnico relevante es la separacion entre runtime y pesos: las imagenes contienen codigo de inferencia y dependencias, mientras que los pesos se descargan desde otros repositorios. La cache de Thor es un tar.gz independiente que actua como semilla de cache del compilador, no como imagen Docker; en Orin la cache se genera localmente. El flujo indicado por el autor es verificar el SHA256, ejecutar `docker load -i <runtime.tar>` y comprobar la identidad de la imagen importada contra `checksums.json`.

## Capacidades

- Despliegue de inferencia de MiniMax-H3 sobre NVIDIA Jetson Thor T5000 (JetPack 7) y AGX Orin 64 GB (JetPack 6), en arquitectura ARM64.
- Distribucion reproducible de dependencias mediante imagenes Docker con checksums SHA256 publicados.
- Verificacion de integridad de los artefactos descargados y de la identidad de la imagen importada mediante `checksums.json`.
- Precarga de cache de compilador en Thor mediante la semilla `warm-cache`, orientada a reducir el coste de la primera compilacion.
- Integracion con LPK 0.5.1, que segun el autor reutiliza estas imagenes sin cambios.
- No se documentan capacidades del modelo en si (generacion de texto, codigo, vision, tool calling, agentes o multilingueismo) en la informacion disponible.

## Casos de uso

- Despliegue en flota de Jetson Thor: cargar `minimax-h3-thor-0.4.6-runtime.tar` con `docker load` en cada dispositivo T5000 con JetPack 7 para disponer de un entorno de inferencia identico y verificado por SHA256.
- Despliegue en AGX Orin de 64 GB: usar `minimax-h3-orin-0.5.0-runtime.tar` en equipos con JetPack 6, dejando que el dispositivo genere su propia cache de compilador.
- Entornos de laboratorio con hardware embebido: reproducir experimentos sobre MiniMax-H3 en ARM64 sin reconstruir manualmente el stack de CUDA y dependencias de NVIDIA.
- Validacion de cadena de suministro: comprobar el SHA256 de cada archivo antes de `docker load` y contrastar la identidad de la imagen importada contra `checksums.json` en pipelines de aprovisionamiento.
- Reduccion del tiempo de arranque en Thor: precargar la semilla `minimax-h3-thor-0.4.6-warm-cache.tar.gz` para evitar la compilacion en frio en cada instancia nueva.
- Base para integraciones de terceros: servir como capa de runtime fija sobre la que construir herramientas propias (por ejemplo, LPK 0.5.1) sin tocar las imagenes originales.
- Aprovisionamiento offline: transportar los tar de runtime a entornos sin acceso a registros de contenedores y cargarlos localmente, descargando los pesos por los canales indicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Tampoco se aportan datos de latencia ni de throughput para ninguno de los dos targets.

## Requisitos de hardware

- Plataformas soportadas: NVIDIA Jetson Thor T5000 con JetPack 7 y NVIDIA Jetson AGX Orin de 64 GB con JetPack 6, ambas ARM64.
- VRAM estimada para inferencia: no disponible. Depende de los pesos de MiniMax-H3, que se descargan por separado.
- GPU de escritorio (A100, H100, RTX 4090): no soportadas por estos artefactos, que son especificos de ARM64 y Jetson.
- Espacio en disco: la imagen de Thor ocupa 14.220.806.144 bytes (aproximadamente 13,2 GiB) y la de Orin 9.809.733.120 bytes (aproximadamente 9,1 GiB), sin contar los pesos del modelo.
- Opciones de despliegue: Docker con `docker load -i <runtime.tar>`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros repositorios de runtime comparables ni datos de rendimiento que permitan una comparacion con alternativas.

## Limitaciones y advertencias

- El repositorio no contiene pesos de modelo; sin descargarlos desde OpenVDN/vdn-minimax-h3 o Comfy-Org/MiniMax-H3 no hay nada que inferir.
- Solo cubre dos plataformas ARM64 concretas (Thor T5000 con JetPack 7 y AGX Orin 64 GB con JetPack 6); no es portable a x86 ni a otras GPU.
- La licencia es "other" y las dependencias de terceros, incluidos los terminos de runtime de NVIDIA, conservan sus licencias originales dentro de las imagenes; el repositorio no las relicencia. Es necesario revisar `NOTICE` antes de un uso comercial.
- Las versiones de runtime no coinciden entre targets (0.4.6 en Thor, 0.5.0 en Orin), lo que puede implicar diferencias de comportamiento entre plataformas.
- La cache `warm-cache` es una semilla especifica de Thor y no una imagen Docker; usarla como imagen provocaria un error.
- El repositorio registra 0 descargas y 0 likes, y no declara pipeline ni idiomas, por lo que no hay evidencia publica de validacion por terceros.
- No se documentan sesgos, tasas de alucinacion ni limitaciones de contexto o idioma del modelo subyacente en la informacion disponible.
- El autor del repositorio (manateelazycat) no aparece como desarrollador de MiniMax-H3; se trata de una distribucion de runtime de terceros.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/manateelazycat/MiniMax-H3-Runtime
- Pesos (repositorio indicado en la model card): https://huggingface.co/OpenVDN/vdn-minimax-h3
- Pesos (repositorio indicado en la model card): https://huggingface.co/Comfy-Org/MiniMax-H3

# bahae98/ml-stable-diffusion

## Resumen

`bahae98/ml-stable-diffusion` es un repositorio alojado en Hugging Face que reproduce el contenido del proyecto oficial `apple/ml-stable-diffusion` de Apple. No se trata de un modelo generativo nuevo, sino de un conjunto de herramientas para convertir modelos de difusion (Stable Diffusion) desde PyTorch al formato Core ML, con el objetivo de ejecutar generacion de imagenes en hardware Apple Silicon (chips M1/M2 y posteriores, asi como iPhone e iPad con A14 o superior).

El repositorio incluye dos componentes principales: el paquete Python `python_coreml_stable_diffusion`, que realiza la conversion de pesos de PyTorch a Core ML y permite la generacion de imagenes en Python usando la libreria `diffusers` de Hugging Face, y el paquete Swift `StableDiffusion`, pensado para integrarse como dependencia en proyectos Xcode y desplegar capacidades de generacion de imagenes en aplicaciones iOS, iPadOS y macOS.

Su relevancia radica en que permite ejecutar Stable Diffusion de forma local y optimizada en dispositivos Apple, sin depender de la nube. El repositorio, sin embargo, no contiene pesos de modelo propios ni una model card original: su tamano es de 0.0 GB, no registra descargas ni likes, y la informacion disponible es unicamente la del proyecto de referencia de Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelos de difusion (Stable Diffusion) convertidos a Core ML; no es una arquitectura propia |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (secuencia de texto fija de 77 tokens en el pipeline de conversion) |
| Tipos de cuantizacion | Compresion de pesos a 6 bits (mencionada en los benchmarks); activaciones en float16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Core ML (`.mlpackage` / `.mlmodelc`); conversion desde PyTorch/safetensors via `diffusers` |

## Arquitectura y entrenamiento

El repositorio no define ni entrena un modelo propio. Se limita a proporcionar la infraestructura de conversion y ejecucion para modelos de difusion de terceros, en concreto variantes de Stable Diffusion como `stabilityai/stable-diffusion-2-1-base` y `stabilityai/stable-diffusion-xl-base-1.0-ios`. La conversion transforma el pipeline de PyTorch en componentes Core ML, aplicando optimizaciones como `SPLIT_EINSUM_V2` para la implementacion de atencion y la compresion de pesos a 6 bits.

El pipeline de generacion sigue la configuracion estandar de difusion: 20 pasos de inferencia, resolucion de salida de 512x512 (o 768x768 en SDXL), secuencia de texto de 77 tokens y classifier-free guidance con batch size de 2 para la UNet. No se documentan datos de entrenamiento, numero de tokens, composicion del dataset ni procesos de RLHF/DPO, ya que el repositorio no entrena modelos.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image) mediante modelos Stable Diffusion convertidos a Core ML.
- Conversion de modelos PyTorch a formato Core ML mediante el paquete `python_coreml_stable_diffusion`.
- Ejecucion en Python con integracion de `diffusers` de Hugging Face.
- Integracion en aplicaciones nativas Apple mediante el paquete Swift `StableDiffusion`.
- Ejecucion local en dispositivos Apple Silicon (Mac con M1 o superior, iPad con M1, iPhone con A14 o superior).
- Seleccion configurable de unidad de computo (`CPU_AND_NE`, entre otras) y de implementacion de atencion (`SPLIT_EINSUM_V2`).
- Opcion `reduceMemory` para cargar y descargar modelos just-in-time y evitar escasez de memoria.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking, por tratarse de un pipeline de generacion de imagenes.

## Casos de uso

- Generacion de imagenes offline en aplicaciones iOS/iPadOS/macOS: el paquete Swift permite integrar generacion text-to-image en apps nativas sin conexion a la nube, usando Core ML sobre Neural Engine.
- Prototipado rapido en Mac con Apple Silicon: el paquete Python y `diffusers` permiten convertir y probar variantes de Stable Diffusion localmente antes de desplegarlas en dispositivos.
- Aplicaciones de creatividad en el dispositivo: herramientas de diseno o edicion que generen imagenes a partir de prompts directamente en el iPhone o iPad, con latencias de 7 a 18 segundos en los dispositivos del benchmark.
- Privacidad de datos: al ejecutarse de forma local, los prompts y las imagenes no salen del dispositivo, lo que resulta adecuado para entornos con requisitos de confidencialidad.
- Distribucion de modelos optimizados: equipos que necesiten empaquetar modelos de difusion en formato Core ML con pesos comprimidos a 6 bits para reducir el tamano y la huella de memoria.
- Educacion e investigacion: estudio del proceso de conversion de PyTorch a Core ML y de las optimizaciones de atencion y cuantizacion aplicadas a modelos de difusion.

## Benchmarks y rendimiento

Los datos disponibles corresponden a `stabilityai/stable-diffusion-2-1-base` (512x512), con pesos comprimidos a 6 bits, activaciones en float16, 20 pasos de inferencia y `SPLIT_EINSUM_V2`:

| Dispositivo | Unidad de computo | Latencia extremo a extremo (s) | Velocidad de difusion (iter/s) |
|---|---|---|---|
| iPhone 12 Mini | `CPU_AND_NE` | 18.5* | 1.44 |
| iPhone 12 Pro Max | `CPU_AND_NE` | 15.4 | 1.45 |
| iPhone 13 | `CPU_AND_NE` | 10.8* | 2.53 |
| iPhone 13 Pro Max | `CPU_AND_NE` | 10.4 | 2.55 |
| iPhone 14 | `CPU_AND_NE` | 8.6 | 2.57 |
| iPhone 14 Pro Max | `CPU_AND_NE` | 7.9 | 2.69 |
| iPad Pro (M1) | `CPU_AND_NE` | 11.2 | 2.19 |
| iPad Pro (M2) | `CPU_AND_NE` | 7.0 | 3.07 |

El asterisco indica que se activo la opcion `reduceMemory`, que anade hasta 2 segundos a la latencia. Los benchmarks fueron realizados por Apple y Hugging Face en agosto de 2023 con versiones beta publicas de iOS 17.0, iPadOS 17.0 y macOS 14.0 Seed 8. La model card tambien menciona una tabla para `stabilityai/stable-diffusion-xl-base-1.0-ios` (768x768), pero los datos de esa tabla no estan completos en la informacion disponible.

## Comparativa con modelos similares

| Proyecto | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bahae98/ml-stable-diffusion` (copia de `apple/ml-stable-diffusion`) | Herramienta de conversion y ejecucion Core ML | no disponible (depende del modelo convertido) | no disponible | no disponible | Hugging Face, 0 descargas |
| `apple/ml-stable-diffusion` | Repositorio oficial de Apple | no disponible | no disponible | no disponible en la informacion | GitHub de Apple |
| Modelos Stable Diffusion originales (`stabilityai/stable-diffusion-2-1-base`, `stable-diffusion-xl-base-1.0`) | Modelos de difusion en PyTorch | no disponible en la informacion | 77 tokens de texto | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparativos entre estos proyectos mas alla de los benchmarks de latencia del repositorio de Apple incluidos en la model card.

## Limitaciones y advertencias

- El repositorio no contiene pesos de modelo propios (tamano de 0.0 GB) ni una model card original; es una copia del proyecto de Apple.
- No registra descargas ni likes, lo que sugiere que no es una referencia mantenida ni validada por la comunidad.
- La licencia no esta disponible, lo que impide confirmar si se permite el uso comercial.
- No se especifican idiomas soportados ni sesgos conocidos del modelo subyacente.
- Los benchmarks de latencia dependen del dispositivo, la version de sistema operativo y la carga termica; los resultados pueden variar.
- Las optimizaciones de atencion y la compresion a 6 bits pueden degradar la calidad de las imagenes generadas respecto a los pesos originales en float16.
- El pipeline usa una secuencia de texto de forma estatica de 77 tokens, independientemente de la longitud real del prompt.
- Requiere versiones minimas especificas de macOS (13.1 o 14.0), Xcode (14.3), Swift (5.8) y coremltools (7.0) para la conversion y compilacion.
- No se documentan restricciones de uso comercial del modelo subyacente en la informacion disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/bahae98/ml-stable-diffusion
- Repositorio oficial de Apple en GitHub: https://github.com/apple/ml-stable-diffusion
- Blog de Apple sobre Stable Diffusion en Core ML: https://machinelearning.apple.com/research/stable-diffusion-coreml-apple-silicon
- Aplicacion Swift de referencia (Diffusers app): https://github.com/huggingface/swift-coreml-diffusers
- Modelo convertido de referencia SD 2.1 base: https://huggingface.co/apple/coreml-stable-diffusion-2-1-base
- Modelo convertido de referencia SDXL base iOS: https://huggingface.co/apple/coreml-stable-diffusion-xl-base-1.0-ios
- Libreria diffusers de Hugging Face: https://github.com/huggingface/diffusers

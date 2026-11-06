# ryugyosoft/onwx-image

## Resumen

onwx-Image es una aplicacion de escritorio para Windows 11 que ejecuta el modelo de generacion de imagenes Z-Image-Turbo integramente sobre la NPU XDNA2 de los procesadores AMD Ryzen AI (arquitecturas Strix y Strix Halo). El proyecto lo mantiene el usuario ryugyosoft y se distribuye bajo licencia Apache 2.0. No se trata de un modelo de pesos nuevos, sino de un runtime y conjunto de kernels que portan los tres componentes del pipeline (text encoder Qwen3, DiT de generacion y VAE de decodificacion) a la NPU, sin usar GPU, DirectML, OpenVINO ni ONNX Runtime.

La relevancia del proyecto es que demuestra inferencia text-to-image completa en hardware de PC consumer sin tarjeta grafica dedicada, con cuantizacion INT8 (W8A8) para el DiT y el text encoder y precision bfp16 para el VAE. Sobre un Ryzen AI 9 HX 370 con 32 GB de memoria, genera una imagen de 768x768 en 9 pasos en aproximadamente 56-60 segundos y una de 1024x1024 en unos 99 segundos.

El repositorio de Hugging Face no contiene pesos del modelo (tamano de 0.0 GB); los pesos de Z-Image-Turbo (unos 31 GB) se descargan desde el repositorio oficial de Tongyi-MAI durante la instalacion y se convierten a formatos especificos para la NPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline text-to-image: text encoder Qwen3 + DiT (Z-Image-Turbo) + VAE; kernels propios en IRON (mlir-aie) ejecutados via XRT sobre NPU XDNA2 |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 W8A8 (DiT y text encoder, con rotacion Hadamard de 256); bfp16 (VAE) |
| Idiomas soportados | ja, en |
| Licencia | Apache 2.0 (aplicacion); Z-Image-Turbo, mlir-aie y XRT mantienen sus licencias respectivas |
| Formato de pesos | Pesos convertidos a formatos propietarios para NPU (INT8); modelo original descargado desde Tongyi-MAI/Z-Image-Turbo |

## Arquitectura y entrenamiento

onwx-Image no entrena ningun modelo: es un runtime de inferencia. El modelo generativo subyacente es Z-Image-Turbo de Tongyi-MAI, del que no se detallan en la informacion disponible ni el numero de parametros, ni el volumen de datos de entrenamiento, ni si hubo RLHF o DPO. El pipeline consta de un text encoder Qwen3, un DiT que genera la imagen latente y un VAE que la decodifica a pixeles.

La innovacion tecnica esta en la implementacion sobre NPU. Los kernels se escriben en IRON (dialecto de mlir-aie) y se ejecutan directamente desde XRT. El DiT y el text encoder usan cuantizacion W8A8: las entradas se rotan con una transformada de Hadamard de tamano 256 antes de cuantizar, y la rotacion se pliega en los pesos. Las matmul se reparten entre los 32 cores de la NPU y la atencion se implementa como flash attention en la propia NPU, sin materializar la matriz de scores LxL fuera de los cores. El VAE emplea matmul en bloque de coma flotante (bfp16) y kernels de fila, restaurando la imagen completa sin trocearla. La CPU solo asume tokenizacion, el scheduler Euler y operaciones vectoriales de baja dimension. La diferencia frente a diffusers en CPU es de unos 50 dB de PSNR, visualmente indistinguible.

## Capacidades

- Generacion de imagenes text-to-image a partir de prompts en japones e ingles.
- Control de tamano de imagen, numero de pasos (9 pasos en las mediciones publicadas), numero de imagenes y semilla.
- Vista previa durante la generacion, generacion continua e historial.
- Guardado de la imagen en PNG con los metadatos de prompt y semilla embebidos.
- Ejecucion integra en NPU XDNA2, sin fallback a CPU o GPU si la NPU no esta disponible.
- Modo de interfaz sin NPU (`--mock`) para comprobar la UI.
- Gestion de memoria en equipos con menos de 48 GB: libera y recarga el text encoder entre generaciones (configurable con `ONWX_IMAGE_KEEP_TEXT_ENCODER`).
- No se documentan capacidades de tool calling, agentes, vision de entrada, audio ni modo thinking.

## Casos de uso

- Generacion de ilustraciones en portatiles con Ryzen AI sin GPU dedicada: el modelo aprovecha la NPU y deja la CPU y la iGPU libres para otras tareas, con tiempos de 56-60 s para 768x768.
- Creacion de arte conceptual con estilos definidos por prompt (el ejemplo de la model card incluye estilo ukiyo-e y acuarela), util para prototipado rapido de ideas visuales.
- Generacion de imagenes para documentacion o blogs tecnicos en local, sin depender de servicios en la nube ni enviar prompts a terceros.
- Experimentacion con inferencia en NPU: sirve como referencia practica de portado de un pipeline difusion completo a XDNA2 con cuantizacion W8A8 y kernels IRON.
- Produccion por lotes de variaciones controladas por semilla: la generacion continua y el guardado de semilla en el PNG permiten reproducir y encadenar resultados.
- Pruebas de integracion de NPU en flujos de trabajo de escritorio Windows: los comandos de diagnostico (`xdna_setup`, `doctor`, `fetch_model --validate`, `prebuild`) facilitan verificar el entorno antes de desplegar.
- Demostraciones de generacion de imagenes en japones para mercados nipones, dado el soporte nativo de prompts en ja y en.

## Benchmarks y rendimiento

| Medicion | Hardware | Resultado |
|---|---|---|
| 768x768, 9 pasos, prompt nuevo | Ryzen AI 9 HX 370, 32 GB | ~56-60 s por imagen |
| 1024x1024, 9 pasos, prompt nuevo | Ryzen AI 9 HX 370, 32 GB | ~99 s por imagen |
| Primera imagen tras arranque | Ryzen AI 9 HX 370, 32 GB | ~15 s adicionales por carga de modelo |
| Fidelidad del VAE frente a diffusers (CPU) | no disponible | ~50 dB PSNR |

No se han publicado resultados de benchmarks de calidad (FID, CLIP score, MMLU u otros) en la informacion disponible.

## Requisitos de hardware

- NPU XDNA2 obligatoria: AMD Ryzen AI 300 (Strix) o Ryzen AI Max (Strix Halo). No hay ejecucion en CPU ni GPU.
- Sistema operativo Windows 11 x64, Python 3.13 y Visual Studio 2022 con herramientas de compilacion C++.
- Driver AMD NPU instalado y visible mediante `xrt-smi examine`.
- Memoria RAM minima de 32 GB; por debajo de 48 GB el text encoder se descarga y recarga entre imagenes.
- Espacio en disco de unos 60 GB (modelo original de ~31 GB, modelo convertido, kernels NPU y cache de pesos).
- Conexion a internet en la primera instalacion para descargar dependencias, XRT 2.21.75 SDK y el modelo.
- Tiempo de compilacion inicial de kernels NPU: unos 30 minutos; las ejecuciones posteriores solo validan (1-2 minutos).
- No se dispone de datos de latencia o throughput para otros procesadores distintos del Ryzen AI 9 HX 370.

## Comparativa con modelos similares

| Modelo | Tipo | Hardware objetivo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| onwx-Image (Z-Image-Turbo sobre NPU) | Text-to-image con runtime NPU | NPU XDNA2 (Ryzen AI 300 / Max) | no disponible | no disponible | Apache 2.0 (app) | Hugging Face, instalador PowerShell |
| Z-Image-Turbo (Tongyi-MAI) | Text-to-image | GPU (formato original) | no disponible | no disponible | segun repositorio original | Hugging Face |
| Stable Diffusion (familia) | Text-to-image | GPU consumer | no disponible en esta ficha | no disponible | licencias variadas | amplia disponibilidad |

No se dispone de datos de rendimiento comparables entre onwx-Image y otras implementaciones de Z-Image-Turbo en GPU en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia estricta de hardware: solo funciona en NPU XDNA2; si la NPU o el modelo no estan disponibles, la aplicacion falla y no recurre a CPU o GPU.
- Solo Windows 11 x64; no hay soporte documentado para Linux ni macOS.
- Requiere 32 GB de RAM y unos 60 GB de disco, lo que excluye muchos equipos portatiles.
- Idiomas de prompt limitados a japones e ingles; no se documenta soporte de castellano.
- Riesgo de sesgos y alucinacion visual inherente al modelo generativo subyacente; no se detallan evaluaciones de sesgo en la informacion disponible.
- La licencia Apache 2.0 cubre la aplicacion, pero Z-Image-Turbo, mlir-aie y XRT tienen licencias propias que deben revisarse para uso comercial.
- El repositorio de Hugging Face no incluye pesos; la instalacion depende de la descarga desde Tongyi-MAI y de la disponibilidad de ese repositorio.
- Proyecto con 0 descargas y 0 likes en el momento de la consulta: madurez y soporte comunitario no verificables.
- La compilacion inicial de kernels (unos 30 minutos) y la descarga del modelo (~31 GB) condicionan el primer despliegue.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ryugyosoft/onwx-image
- Proyecto relacionado onwx: https://huggingface.co/ryugyosoft/onwx
- Modelo base Z-Image-Turbo: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- mlir-aie: https://github.com/Xilinx/mlir-aie
- Instalador: https://huggingface.co/ryugyosoft/onwx-image/resolve/main/install.ps1

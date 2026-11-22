# Ouinche/taesdxl-MLX

## Resumen

TAESDXL · MLX es un paquete de inferencia para Apple Silicon del decodificador TAESDXL (Tiny AutoEncoder for SDXL), desarrollado originalmente por Ollin Boer Bohan y redistribuido por Ouinche con un re-layout de pesos en formato MLX. No se trata de un modelo generativo completo, sino de un decodificador de aproximadamente 2,5 millones de parametros que comparte el espacio latente del VAE de SDXL y convierte latentes del UNet en imagenes RGB en una fraccion de segundo, sustituyendo al VAE completo de SDXL de unos 84 millones de parametros.

El problema que resuelve es el coste de decodificacion en pipelines de difusion SDXL sobre hardware Apple: el VAE completo requiere unos 160 MB de pesos y varios GiB de activaciones a 1024x1024, mientras que TAESDXL ocupa unos 10 MB en disco y en RAM. El paquete incluye los pesos originales en layout diffusers (fp32, copia sin modificar de `madebyollin/taesdxl`), un fichero de solo decodificador en layout MLX NHWC fp16 y un script minimo de carga (`taesdxl_mlx.py`) de unas 50 lineas.

Es relevante ahora para desarrolladores que ejecutan SDXL en Mac con MLX puro (sin PyTorch en tiempo de ejecucion) y para la aplicacion DiffusionBear, que lo usa como ruta de decodificacion rapida en sus modelos SDXL (Juggernaut XL Lightning, RealVis XL). La verificacion reportada por el autor indica una decodificacion bit a bit equivalente a la referencia PyTorch dentro del ruido de coma flotante (PSNR 133,5 dB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder convolucional tiny (TAESDXL) como decodificador; comparte espacio latente del VAE de SDXL |
| Parametros totales | ~2,5 M (decodificador); el VAE completo de SDXL tiene ~84 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision/decodificacion de latentes) |
| Tipos de cuantizacion | fp32 (pesos originales diffusers) y fp16 (decodificador MLX) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (layout diffusers fp32 y layout MLX NHWC fp16) |

## Arquitectura y entrenamiento

TAESDXL es un autoencoder convolucional de tipo tiny que actua exclusivamente como decodificador: recibe latentes del UNet de SDXL con forma `(B, H/8, W/8, 4)` y produce una imagen RGB en el rango [0, 1]. Comparte el espacio latente del VAE de SDXL, por lo que no requiere dividir por el factor de escalado del VAE de SDXL; los latentes se pasan tal cual. El decodificador MLX utiliza layout NHWC, adecuado para las operaciones convolucionales de MLX en Apple Silicon.

El paquete no incluye informacion sobre el entrenamiento del modelo original (numero de tokens, composicion del dataset, uso de RLHF/DPO), ya que se trata de una redistribucion de pesos de `madebyollin/taesdxl`. La innovacion tecnica del repositorio es el re-layout de los pesos del decodificador a MLX NHWC fp16 y un script de carga minimo (`taesdxl_mlx.py`) que permite decodificar sin PyTorch en tiempo de ejecucion. El autor reporta que la decodificacion MLX fp32 coincide con la referencia PyTorch `AutoencoderTiny` con una diferencia absoluta maxima de 0,0000 y PSNR de 133,5 dB, y que la version fp16 frente a fp32 alcanza PSNR de 67,6 dB.

## Capacidades

- Decodificacion de latentes SDXL a imagenes RGB a 1024x1024 en una fraccion de segundo.
- Compatibilidad con el espacio latente del VAE de SDXL sin reescalado de latentes.
- Ejecucion en MLX puro sobre Apple Silicon, sin PyTorch en tiempo de ejecucion.
- Dos rutas de uso: integracion en DiffusionBear (carpeta `models/taesdxl/`) y script standalone `taesdxl_mlx.py`.
- Salida RGB en [0, 1] lista para convertir a uint8.
- No soporta tool calling, agentes, razonamiento multi-paso, vision general ni audio: es un componente de decodificacion, no un modelo de proposito general.
- Capacidades multilingues: no aplica.

## Casos de uso

- Decodificacion rapida en pipelines SDXL sobre Mac: sustituir el VAE completo por TAESDXL en la etapa final de generacion para reducir el tiempo de decodificacion de varios segundos a unos 0,25 s (fp32) o 0,10 s (fp16) en un M4 Pro virtualizado.
- Previsualizacion en vivo durante la generacion: decodificar latentes intermedios para mostrar una vista previa de baja latencia sin cargar el VAE completo, gracias a los ~10 MB de pesos y al bajo uso de memoria.
- Integracion en DiffusionBear: colocar `diffusion_pytorch_model.safetensors` y `config.json` en `models/taesdxl/` para activar la ruta de decodificacion rapida en modelos como Juggernaut XL Lightning o RealVis XL.
- Aplicaciones con memoria limitada: entornos Apple Silicon de 16 GB donde el VAE completo a 1024x1024 consume varios GiB de activaciones, frente al pico de 1,5 GiB reportado por el autor para el decodificador MLX.
- Prototipado e investigacion en MLX: usar `taesdxl_mlx.py` como referencia minima (~50 lineas) para integrar decodificacion SDXL en proyectos MLX propios.
- Evaluacion de calidad de latentes: al ser un decodificador fiel (PSNR 133,5 dB frente a PyTorch), sirve para inspeccionar latentes de UNet en experimentos sin el coste del VAE completo.
- Image-to-image: el pipeline declarado es `image-to-image`, por lo que se puede usar en flujos de edicion que requieran decodificacion rapida de latentes.

## Benchmarks y rendimiento

Datos de rendimiento reportados por el autor para decodificacion 1024x1024:

| Maquina | Decodificador | Primera llamada (carga + `mx.compile`) | Decodificacion en caliente | Memoria |
|---|---|---|---|---|
| VM Apple M4 Pro (virtualizada), 16 GB | DiffusionBear, fp32 | 2,15 s | 0,25 s | pico MLX 1,5 GiB (activaciones) |
| VM Apple M4 Pro (virtualizada), 16 GB | `taesdxl_mlx.py`, fp16 | no disponible | 0,10 s | no disponible |
| Apple M1, 16 GB | no disponible | no medido | ~0,5 s (estimacion de DiffusionBear) | no disponible |

Verificacion de fidelidad:

| Comprobacion | Resultado |
|---|---|
| MLX (decodificador DiffusionBear, fp32) frente a decodificacion PyTorch | diferencia absoluta maxima 0,0000, PSNR 133,5 dB |
| `taesdxl_mlx.py` fp16 frente a MLX fp32 | PSNR 67,6 dB |
| Round trip frente a imagen de entrada | PSNR 28,6 dB (techo de calidad de TAESD, igual que PyTorch) |

No se han publicado resultados de benchmarks de tareas generativas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM/RAM: los pesos ocupan unos 10 MB en disco y en RAM; el pico de memoria MLX reportado es de 1,5 GiB de activaciones a 1024x1024 (frente a varios GiB del VAE completo de SDXL).
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max) mediante MLX. No aplica a GPU NVIDIA o AMD en esta distribucion.
- Cabe en cualquier Mac con Apple Silicon; el autor reporta pruebas en un M4 Pro virtualizado con 16 GB y una estimacion para M1 de 16 GB (~0,5 s).
- Opciones de despliegue: MLX puro (`taesdxl_mlx.py`), DiffusionBear, o carga de los pesos diffusers originales en cualquier runtime compatible con diffusers (aunque el objetivo del paquete es evitar PyTorch en tiempo de ejecucion).
- Latencia: 0,25 s en caliente con fp32 en M4 Pro virtualizado; 0,10 s con fp16; ~0,5 s estimado en M1. Primera llamada con carga y compilacion: 2,15 s en M4 Pro.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Funcion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TAESDXL · MLX (este) | ~2,5 M | Decodificador SDXL en MLX | safetensors (MLX NHWC fp16 y diffusers fp32) | MIT | Hugging Face, MLX |
| madebyollin/taesdxl | ~2,5 M | Decodificador SDXL original | safetensors (diffusers) | MIT | Hugging Face, PyTorch/diffusers |
| VAE completo de SDXL | ~84 M | Autoencoder completo (encoder + decoder) | safetensors (diffusers) | CreativeML Open RAIL++-M (segun el modelo SDXL base) | Hugging Face, diffusers |
| TAESD (para SD 1.x) | ~1 M (orden de magnitud) | Decodificador para SD 1.x | safetensors (diffusers) | MIT | Hugging Face |

La comparativa se limita a componentes de decodificacion del mismo espacio latente; no se dispone de datos de rendimiento de alternativas en MLX en la informacion proporcionada.

## Limitaciones y advertencias

- Techo de calidad: el round trip frente a la imagen de entrada alcanza PSNR 28,6 dB, que el autor identifica como el limite de calidad de TAESD; no es equivalente en fidelidad al VAE completo de SDXL.
- Uso restringido: es un decodificador, no un modelo generativo ni de lenguaje; no admite prompts, tool calling ni razonamiento.
- Dependencia de plataforma: el decodificador MLX esta pensado para Apple Silicon; fuera de ese hardware hay que usar los pesos diffusers originales.
- Precaucion en fp16: la version fp16 del script standalone presenta PSNR 67,6 dB frente a fp32, suficiente para uso practico pero no bit a bit.
- Sin datos de sesgos, alucinacion o limitaciones idiomaticas: no aplica al ser un componente de vision, pero no se han publicado evaluaciones de sesgo en la informacion disponible.
- Licencia MIT: permite uso comercial y modificacion, con atribucion a Ollin Boer Bohan y a DiffusionBear por el empaquetado MLX.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, y tamano de repo reportado de 0,0 GB; conviene verificar la integridad de los ficheros antes de usarlo en produccion.
- La primera llamada incluye carga y compilacion (`mx.compile`), con 2,15 s en M4 Pro; en produccion conviene calentar el decodificador antes de servir peticiones.

## Enlaces

- Hugging Face: https://huggingface.co/Ouinche/taesdxl-MLX
- Modelo original TAESDXL: https://huggingface.co/madebyollin/taesdxl
- Codigo original TAESD: https://github.com/madebyollin/taesd
- DiffusionBear: https://www.diffusionbear.com
- Codigo de DiffusionBear: https://github.com/OuincheWinch/DiffusionBear

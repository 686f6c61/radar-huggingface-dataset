# LSDJesus/comfyui-quant-bench-files

## Resumen

`LSDJesus/comfyui-quant-bench-files` no es un modelo de IA propiamente dicho, sino un repositorio de artefactos de benchmarking para el proyecto ComfyUI Quantization Bench. Lo mantiene el usuario LSDJesus y contiene los ficheros exactos que utiliza el kit de pruebas comunitario (comfyui-quant-bench) para evaluar el rendimiento de distintas cuantizaciones sobre modelos de difusion de imagenes en ComfyUI. El repositorio aloja copias cuantizadas (fp8, int8 ConvRot, w4a8 y nvfp4), pesos originales en bf16, VAEs extraidos, merges DMD2, prompts pre-codificados y trayectorias de referencia generadas en una RTX PRO 6000.

El interes del repositorio es practico: permite reproducir de forma exacta las mediciones del informe publico en ai-evolution.dev/quant-bench, comparando velocidad y precision por paso frente a la linea base bf16. No se trata de un modelo entrenado por el autor, sino de una recopilacion de pesos de terceros (Anima, Z-Image, MOSS-Image, Krea 2, Illustrious-XL, Luminelle, FLUX.1, FLUX.2, Qwen-Image) con sus licencias originales, por lo que cada familia conserva sus terminos de uso.

El tamano del repositorio es de 265,8 GB y la licencia se declara como `other` con la etiqueta `per-model`, es decir, cada modelo mantiene la licencia de su fuente original. No hay pipeline, idiomas ni parametros de modelo declarados porque el contenido es heterogeneo y abarca varios modelos de difusion distintos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio con artefactos de varios modelos de difusion: UNet/DiT, VAEs) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp8 (scaled), int8 (ConvRot), w4a8 (ConvRot int4 + codebook), nvfp4; originales en bf16 |
| Idiomas soportados | no disponible |
| Licencia | per-model (cada modelo conserva su licencia original; ver tabla de la model card) |
| Formato de pesos | safetensors (implícito en los ficheros de ComfyUI; no confirmado en la informacion) |
| Tamano del repositorio | 265,8 GB |
| Pipeline declarado | no disponible |
| Descargas | 0 |
| Likes | 0 |

## Arquitectura y entrenamiento

No aplica en el sentido habitual: este repositorio no contiene un modelo entrenado por el autor, sino artefactos de evaluacion. Los ficheros se organizan replicando la estructura de rutas del banco de pruebas (relativas a `/mnt`): `flash/downloads/_quant_bench/bakes/<modelo>/` con las copias cuantizadas probadas en el informe, `flash/downloads/_quant_bench/sources/` con los UNets de SDXL extraidos de sus checkpoints, los merges DMD2 y los VAEs de SDXL extraidos, `flash/models/…` y `cold/models/…` con los originales en bf16 (linea base de velocidad) y el VAE de cada familia, y `flash/downloads/_quant_bench/cond/` y `ref/` con los prompts pre-codificados y las trayectorias de referencia en bf16 generadas en una RTX PRO 6000 para la comprobacion de precision por paso.

El manifiesto `manifest.json` del repositorio del kit lista cada fichero con su tamano y su SHA-256, lo que permite verificar la integridad de las descargas. Las tecnicas de cuantizacion cubiertas son fp8 con escalado, int8 con rotacion convolucional (ConvRot), w4a8 con ConvRot int4 y codebook, y nvfp4 (formato de 4 bits de NVIDIA). No se documentan datos de entrenamiento, RLHF ni innovaciones de arquitectura propias, porque el repositorio no entrena ningun modelo.

## Capacidades

- Distribucion de pesos cuantizados listos para usar en ComfyUI para las familias Anima, Z-Image, MOSS-Image, Krea 2, Illustrious-XL, Luminelle y los VAEs de Qwen-Image, FLUX.1 y FLUX.2.
- Proporciona cuatro variantes de cuantizacion por modelo (fp8, int8 ConvRot, w4a8 y nvfp4) para comparar velocidad y fidelidad.
- Incluye merges DMD2 ya fusionados (MOSS-Image 8 pasos y Luminelle 4 pasos) para evaluar destilacion de pocos pasos.
- Incluye UNets de SDXL y VAEs extraidos de sus checkpoints originales, listos para cargar por separado.
- Incluye prompts pre-codificados y trayectorias de referencia bf16 para la comprobacion de precision por paso del kit.
- No ofrece generacion de texto, razonamiento, codigo, tool calling, agentes ni capacidades multilingues: es un repositorio de artefactos, no un modelo de lenguaje.

## Casos de uso

- Reproduccion del informe ComfyUI Quantization Bench: descargar los ficheros y ejecutar el kit con las mismas rutas para obtener mediciones identicas a las publicadas en ai-evolution.dev/quant-bench.
- Evaluacion de cuantizaciones en GPUs de consumo: comparar fp8, int8 ConvRot, w4a8 y nvfp4 sobre las mismas imagenes y prompts para decidir que variante cabe y rinde mejor en tarjetas de 24 GB o menos.
- Validacion de integridad de pesos: usar `manifest.json` con los SHA-256 para verificar que las descargas no se han corrompido antes de medir.
- Estudio de destilacion de pocos pasos: comparar los merges DMD2 (MOSS-Image 8 pasos, Luminelle 4 pasos) frente a sus originales en calidad y latencia.
- Benchmarking de VAEs por separado: los VAEs extraidos de SDXL, Qwen-Image, FLUX.1 y FLUX.2 permiten medir el coste de decodificacion aislado del UNet/DiT.
- Contribucion al kit comunitario: un colaborador puede usar la opcion `--families` para saltarse las familias cuya licencia no permita redistribuir copias cuantizadas, o activar el repo como gated para que el kit pase `HF_TOKEN`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio contiene los artefactos de entrada del informe, pero los numeros de velocidad y precision se publican en ai-evolution.dev/quant-bench, no en esta model card.

## Requisitos de hardware

- VRAM estimada: no disponible de forma agregada; depende del modelo concreto. La model card indica que Krea 2 en bf16 ocupa 26 GB y que no es necesario para tarjetas de 24 GB o menos, por lo que las versiones cuantizadas estan pensadas para ese rango.
- GPU de referencia del informe: RTX PRO 6000 (usada para generar las trayectorias de referencia bf16).
- GPU recomendadas: no disponible en la informacion; el kit esta orientado a tarjetas de consumo de hasta 24 GB para las variantes cuantizadas.
- Cabe en GPU de consumo: si, en principio para las variantes cuantizadas de cada familia; no se especifican modelos concretos.
- Opciones de despliegue: ComfyUI (entorno objetivo del kit); no se documentan vLLM, llama.cpp, Ollama ni TGI porque no son modelos de lenguaje.
- Latencia y throughput: no disponibles; se miden en el informe externo, no en esta model card.

## Comparativa con modelos similares

No disponible. El repositorio no es un modelo comparable con alternativas de la misma categoria; agrupa artefactos de varias familias de modelos de difusion (Anima, Z-Image, MOSS-Image, Krea 2, Illustrious-XL, Luminelle) cuyas comparativas de rendimiento corresponden al informe externo.

## Limitaciones y advertencias

- No es un modelo: es un repositorio de artefactos de benchmark; no debe usarse como sustituto de los pesos originales para produccion.
- Licencias heterogeneas: cada familia conserva su licencia original (Nvidia Open Model License, Apache 2.0, KREA 2 COMMUNITY LICENSE, Fair AI Public License 1.0-SD, Qwen Research License Agreement). El uso comercial depende de la licencia de cada modelo concreto.
- Redistribucion restringida: si una licencia no permite redistribuir el modelo o sus copias cuantizadas, esos ficheros deben excluirse del repo o el repo debe marcarse como gated.
- Recomendacion explicita del autor: para usar un modelo, obtenerlo de su fuente original, no de este repositorio.
- Sin datos de sesgo, alucinacion ni limitaciones de contexto/idioma porque no aplica a un modelo de lenguaje.
- Repositorio muy grande (265,8 GB): requiere descarga selectiva mediante el kit y verificacion por SHA-256.
- Sin descargas ni likes registrados en el momento de la consulta; sin pipeline declarado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/LSDJesus/comfyui-quant-bench-files
- Informe del benchmark: https://ai-evolution.dev/quant-bench/
- Kit de pruebas comunitario: https://github.com/LSDJesus/comfyui-quant-bench

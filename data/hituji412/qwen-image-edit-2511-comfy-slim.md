# hituji412/qwen-image-edit-2511-comfy-slim

## Resumen

`hituji412/qwen-image-edit-2511-comfy-slim` es un repositorio de redistribucion, no un modelo entrenado desde cero. Contiene cuatro ficheros copiados sin modificacion desde repositorios de Comfy-Org y lightx2v que, en conjunto, permiten ejecutar el modelo de edicion de imagen Qwen-Image-Edit-2511 de Alibaba (familia Qwen) dentro de ComfyUI. El autor del repositorio lo mantiene como espejo "slim" para poder cachear un unico repositorio de ~31 GB en un endpoint de RunPod Serverless, evitando descargar los repositorios upstream de Comfy-Org, que empaquetan multiples versiones y ocupan cientos de GB.

El modelo subyacente, Qwen-Image-Edit-2511, es un modelo de difusion para edicion de imagen por instrucciones en lenguaje natural. En este repositorio se distribuye en una variante `fp8mixed` de 20,5 GB, acompanada del text encoder Qwen2.5-VL-7B en `fp8_scaled` (9,4 GB), el VAE de Qwen-Image (253 MB) y un LoRA Lightning de 4 pasos en bf16 (849 MB) que acelera la inferencia.

Es relevante ahora porque ofrece una via practica y ligera de desplegar edicion de imagen de alta calidad con licencia Apache 2.0 en infraestructura propia, con un unico artefacto reproducible (hashes SHA256 publicados) y compatible con el ecosistema ComfyUI. No obstante, es un repositorio de uso privado declarado por su autor, y no una publicacion oficial de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para edicion de imagen (Qwen-Image-Edit-2511) con text encoder Qwen2.5-VL-7B y VAE de Qwen-Image; LoRA Lightning de 4 pasos |
| Parametros totales | no disponible (el repositorio no publica recuento de parametros; el text encoder es Qwen2.5-VL-7B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp8 mixed (modelo de difusion), fp8 scaled (text encoder), bf16 (LoRA Lightning); no se incluyen variantes int8 ni bf16 del modelo de difusion |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con avisos adicionales de la Tencent Hunyuan Community License para el text encoder; ver limitaciones) |
| Formato de pesos | safetensors (single-file para ComfyUI) |
| Tamano del repositorio | 31.021.848.039 bytes (~31,0 GB) |
| Ficheros incluidos | 4 (difusion, text encoder, VAE, LoRA) |
| Modelo base | Qwen/Qwen-Image-Edit-2511 |
| Libreria | diffusion-single-file |
| Fecha de creacion | 2026-11-18 |
| Fecha de actualizacion | 2026-11-19 |

Desglose de ficheros:

| Fichero | Tamano (bytes) | SHA256 |
|---|---|---|
| `split_files/diffusion_models/qwen_image_edit_2511_fp8mixed.safetensors` | 20.533.762.817 | `c9fdc158e46d3b61ef75f21ae866ca2fe808bf4a53643120d1c1e87c19280a4e` |
| `split_files/text_encoders/qwen_2.5_vl_7b_fp8_scaled.safetensors` | 9.384.670.680 | `cb5636d852a0ea6a9075ab1bef496c0db7aef13c02350571e388aea959c5c0b4` |
| `split_files/vae/qwen_image_vae.safetensors` | 253.806.246 | `a70580f0213e67967ee9c95f05bb400e8fb08307e017a924bf3441223e023d1f` |
| `split_files/loras/Qwen-Image-Edit-2511-Lightning-4steps-V1.0-bf16.safetensors` | 849.608.296 | `22226e8d05d354bb356627d428809f5afd7819399b077238a2b70a82883a904f` |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo: redistribuye artefactos ya publicados. El componente principal es el modelo de difusion Qwen-Image-Edit-2511 de Qwen (Alibaba), empaquetado por Comfy-Org en formato single-file para ComfyUI y convertido a precision mixta fp8 (`fp8mixed`). Este modelo se acompana de Qwen2.5-VL-7B-Instruct como text encoder en fp8 escalado, que aporta comprension conjunta de texto e imagen para interpretar las instrucciones de edicion, y del VAE de Qwen-Image para codificar y decodificar imagenes.

Sobre el modelo de difusion se aplica un LoRA Lightning de 4 pasos (V1.0, bf16) desarrollado por lightx2v, que reduce el numero de pasos de muestreo necesarios para generar una imagen. El repositorio no publica detalles sobre el dataset de entrenamiento, el numero de tokens o las tecnicas de alineacion empleadas en el modelo base; esa informacion corresponderia a la model card oficial de `Qwen/Qwen-Image-Edit-2511`, no incluida en la informacion disponible.

## Capacidades

- Edicion de imagen guiada por instrucciones en lenguaje natural, mediante el modelo Qwen-Image-Edit-2511.
- Comprension multimodal de la imagen de entrada y del prompt gracias al text encoder Qwen2.5-VL-7B.
- Generacion acelerada con el LoRA Lightning de 4 pasos, que reduce el coste de muestreo frente a configuraciones de mas pasos.
- Integracion nativa con ComfyUI mediante el layout `split_files/`, enlazable a `ComfyUI/models/`.
- Despliegue en endpoints serverless con cache de repositorio unico (RunPod Model Cache).
- Compatibilidad con pesos en safetensors de precision fp8 y bf16.
- Capacidades especificas de idioma, tool calling o agentes: no disponibles en la informacion proporcionada.

## Casos de uso

- Edicion de imagen por prompt en produccion: cargar los cuatro ficheros en ComfyUI y aplicar instrucciones de edicion sobre imagenes de entrada; el empaquetado single-file simplifica el pipeline y evita seleccionar variantes.
- Despliegue serverless con cache eficiente: adjuntar este repositorio a un endpoint de RunPod Serverless mediante Model Cache, de modo que solo se descarguen ~31 GB una vez en lugar de los repositorios upstream de cientos de GB.
- Prototipado rapido en ComfyUI: el LoRA Lightning de 4 pasos permite iterar con pocos pasos de muestreo, adecuado para pruebas de concepto y ajuste de prompts.
- Reproducibilidad y auditoria: los SHA256 publicados de los cuatro ficheros permiten verificar que los pesos desplegados coinciden exactamente con los upstream, util en entornos regulados.
- Pipelines de edicion por lotes: al ser un artefacto unico y autocontenido, encaja en trabajos por lotes sobre GPU con requisitos de VRAM moderados gracias a fp8.
- Entornos de investigacion con requisitos de licencia permisiva: la licencia Apache 2.0 declarada para los componentes principales facilita su uso en proyectos academicos y comerciales, con las salvedades del text encoder.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el conjunto de pesos suma ~31 GB, por lo que se requiere una GPU con memoria suficiente para cargar difusion fp8 (~20,5 GB), text encoder fp8 (~9,4 GB), VAE (~0,25 GB) y LoRA (~0,85 GB), ademas de overhead de activaciones.
- GPU recomendadas: no disponibles en la informacion proporcionada; por volumen de pesos, orientativas serian GPU de 40-80 GB (A100, H100) o configuraciones con offloading.
- Cabe en GPU consumer: no confirmado; con 24 GB (RTX 4090) seria necesario descargar componentes a CPU o usar offloading, dado que los pesos superan esa cifra.
- Opciones de despliegue: ComfyUI (formato nativo del repositorio), RunPod Serverless con Model Cache; otros motores (vLLM, llama.cpp, Ollama, TGI) no estan indicados para modelos de difusion de este tipo en la informacion disponible.
- Latencia y throughput: no disponibles; el LoRA Lightning de 4 pasos esta disenado para reducir pasos de muestreo, lo que previsiblemente disminuye la latencia frente a configuraciones con mas pasos, aunque no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `hituji412/qwen-image-edit-2511-comfy-slim` (este repositorio) | Redistribucion single-file de Qwen-Image-Edit-2511 para ComfyUI | no disponible | no disponible | Apache 2.0 (con avisos Hunyuan para text encoder) | Hugging Face, ~31 GB, 4 ficheros |
| `Qwen/Qwen-Image-Edit-2511` | Modelo original de edicion de imagen | no disponible | no disponible | Apache 2.0 | Hugging Face (oficial Qwen) |
| `Comfy-Org/Qwen-Image-Edit` | Repackaging ComfyUI con multiples versiones | no disponible | no disponible | Apache 2.0 | Hugging Face (multiples cientos de GB) |
| `lightx2v/Qwen-Image-Edit-2511-Lightning` | LoRA de aceleracion (4 pasos) | no disponible | no disponible | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- Repositorio de uso privado declarado por el autor; no es una publicacion oficial de Qwen, Comfy-Org, lightx2v ni Tencent.
- Solo incluye cuatro ficheros: no hay variantes int8 ni bf16 del modelo de difusion, ni ficheros de la version 2509 ni otras cuantizaciones.
- El text encoder es una copia byte-identica de un fichero que tambien se aloja en `Comfy-Org/Hunyuan-Video-1.5`, cuyo repositorio declara la Tencent Hunyuan Community License; el autor incluye `LICENSE-HUNYUAN-COMMUNITY` y `NOTICE-HUNYUAN` como precaucion. Esa licencia no aplica en la Union Europea, el Reino Unido ni Corea del Sur, lo que afecta al uso del text encoder en esos territorios.
- En caso de conflicto entre el README y las licencias originales, prevalecen los terminos de las licencias originales.
- No se publican datos de benchmarks, idiomas soportados, contexto ni parametros del modelo de difusion.
- Riesgo de alucinacion visual y de ediciones no fieles al prompt: inherente a los modelos de difusion; no cuantificado en la informacion disponible.
- Sesgos conocidos: no disponibles.
- Requisitos de VRAM elevados (~31 GB de pesos) que limitan el despliegue en GPU consumer sin offloading.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hituji412/qwen-image-edit-2511-comfy-slim
- Modelo base original: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- Repackaging ComfyUI del modelo de edicion: https://huggingface.co/Comfy-Org/Qwen-Image-Edit
- Repackaging ComfyUI de Qwen-Image (text encoder y VAE): https://huggingface.co/Comfy-Org/Qwen-Image
- LoRA Lightning: https://huggingface.co/lightx2v/Qwen-Image-Edit-2511-Lightning
- Text encoder original: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Repositorio que aloja copia del text encoder con licencia Hunyuan: https://huggingface.co/Comfy-Org/Hunyuan-Video-1.5

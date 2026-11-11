# dennygod/comfyui-models

## Resumen

`dennygod/comfyui-models` no es un modelo de lenguaje ni un modelo fundacional entrenado por su autor, sino un repositorio de distribucion que agrupa 24 archivos safetensors (aproximadamente 108 GB de pesos, 122,7 GB de tamano total del repo) destinados a ComfyUI. Su funcion es servir como espejo de descarga para instancias alquiladas en proveedores como vast.ai, de modo que el usuario pueda obtener checkpoints de difusion, VAEs, text encoders y LoRAs directamente desde Hugging Face con `hf download` y colocarlos en la estructura `ComfyUI/models/`.

El contenido es heterogeneo: incluye checkpoints de difusion basados en Krea 2 (13,2 GB cada uno en BF16/INT8), Flux 2 de 9B (8,5 GB, destilado), Anima (3,9 GB), Moss (5,0 GB, INT8), Qwen Image 2.1 Turbo (6,8 GB, INT4/INT8), un checkpoint SDXL Illustrious (6,5 GB), cuatro VAEs, cinco text encoders (Qwen 3 de 0,6B a 8B, Qwen3-VL de 4B y 8B) y seis LoRAs, entre ellas adaptadores Lightning de SDXL y FaceID Plus v2.

Su relevancia es practica y acotada: no aporta pesos originales ni documentacion tecnica propia, sino una copia operativa de artefactos de terceros. Varios de los archivos tienen nombres y contenido explicitamente NSFW, lo que condiciona su uso en entornos profesionales. No hay model card tecnica, licencia declarada ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (conjunto heterogeneo de modelos de difusion: Krea 2, Flux 2, Anima, Moss, Qwen Image 2.1, SDXL) |
| Parametros totales | no disponible (Flux 2 9B y Qwen 3 8B identificables por nombre; el resto sin especificar) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, INT8, INT4 (W4A8), FP8 mixed, FP8 scaled, INT8 convrot |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (24 archivos) |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo. Es un contenedor de artefactos de inferencia para ComfyUI, organizado en cinco subcarpetas que replican la estructura de `ComfyUI/models/`: `diffusion_models/`, `checkpoints/`, `vae/`, `text_encoders/` y `loras/`. Los modelos subyacentes pertenecen a familias distintas de difusion latente y modelos texto-imagen, con arquitecturas que no se documentan en la model card.

Las variantes de cuantizacion presentes sugieren un objetivo de ejecucion en GPUs de consumo: hay pesos INT8 (por ejemplo `darkBeast30BF16INT8` y `qwenImage21TurboINT4W4A8_turboINT8`), FP8 mixed y FP8 scaled para text encoders, y adaptadores Lightning de 4 y 8 pasos para SDXL, que reducen el numero de pasos de muestreo. No se aportan datos sobre datasets, tokens de entrenamiento, RLHF/DPO ni innovaciones tecnicas propias.

## Capacidades

- Generacion de imagenes texto-a-imagen mediante los checkpoints de difusion incluidos (Krea 2, Flux 2 9B, Anima, Moss, Qwen Image 2.1, SDXL Illustrious).
- Edicion de imagen guiada por identidad con el LoRA `krea2_identity_edit_v1_2` y el nodo externo `comfyui-krea2edit`.
- Transferencia de identidad facial con `ip-adapter-faceid-plusv2_sdxl_lora`.
- Muestreo acelerado con LoRAs Lightning de 4 y 8 pasos para SDXL.
- Codificacion de texto y condicionamiento multimodal mediante text encoders Qwen 3 (0,6B, 4B, 8B) y Qwen3-VL (4B, 8B), este ultimo con capacidad vision-lenguaje.
- Decodificacion VAE para Krea 2, Qwen Image, Qwen Image 2.1 y Flux 2.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni modos de pensamiento: no es un modelo de lenguaje conversacional.

## Casos de uso

- Despliegue rapido en instancias alquiladas: descargar solo los archivos necesarios con `hf download` y `--local-dir /root/ComfyUI/models`, evitando transferencias manuales de 100 GB o mas.
- Reproduccion de un entorno ComfyUI concreto: el repositorio fija versiones exactas de checkpoints, VAEs y text encoders, lo que permite reconstruir un pipeline identico en otra maquina.
- Generacion de imagenes por lotes en GPU con cuantizacion INT8/INT4: los checkpoints de Qwen Image 2.1 Turbo (6,8 GB) y Moss (5,0 GB) reducen el requisito de VRAM frente a variantes BF16 de 13,2 GB.
- Edicion de imagen con preservacion de identidad: combinando `krea2_identity_edit_v1_2` con el nodo krea2edit para flujos de retoque o variaciones de personaje.
- Prototipado de pipelines SDXL con muestreo acelerado: los LoRAs Lightning de 4 y 8 pasos permiten iterar con menos pasos por imagen.
- Evaluacion comparativa de familias de difusion: al reunir Krea 2, Flux 2, Anima y Qwen Image en un solo repo, facilita pruebas A/B de calidad y velocidad con el mismo entorno.
- Integracion de text encoders Qwen 3 y Qwen3-VL en flujos ComfyUI que requieran condicionamiento de texto largo o entrada visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia por tamano de archivo, los checkpoints de 13,2 GB en BF16/INT8 requieren aproximadamente 13-14 GB de VRAM solo para pesos, mas overhead de activaciones y VAE; los de 3,9 a 6,8 GB son compatibles con GPUs de 8-12 GB segun cuantizacion.
- GPUs recomendadas: no disponible. Por tamano, A100/H100 para los checkpoints de 13,2 GB con margen; RTX 4090 (24 GB) para la mayoria de variantes INT8; RTX 3060/4060 Ti (8-12 GB) para Anima, Moss y Qwen Image 2.1 Turbo en INT4/INT8.
- Cabe en GPU de consumo: si, para los archivos de menor tamano (Anima 3,9 GB, Moss 5,0 GB, Qwen Image 2.1 6,8 GB); los de 13,2 GB quedan al limite en 16 GB y requieren offloading.
- Opciones de despliegue: ComfyUI como entorno principal; descarga via `huggingface_hub` CLI. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion en este formato.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Repositorio | Contenido | Tamano | Licencia | Proposito |
|---|---|---|---|---|
| `dennygod/comfyui-models` | 24 safetensors de difusion, VAE, text encoders y LoRAs | 122,7 GB (repo), ~108 GB de pesos | no disponible | Espejo de descarga para ComfyUI |
| `Comfy-Org/Krea-2` | Pesos originales de Krea 2 | no disponible | no disponible | Distribucion oficial de Krea 2 |
| Repositorios oficiales de Flux 2 / Qwen Image | Pesos originales de cada familia | no disponible | no disponible | Distribucion oficial de cada modelo |

La comparacion relevante es con los repositorios de origen: este repo no anade valor tecnico sobre ellos, solo conveniencia de descarga y cuantizaciones preempaquetadas.

## Limitaciones y advertencias

- No es un modelo entrenado ni documentado: carece de model card tecnica, ficha de evaluacion y garantias de reproducibilidad.
- La licencia no esta declarada. Los pesos subyacentes pertenecen a terceros (Krea 2, Flux 2, Qwen, SDXL) y sus licencias originales pueden imponer restricciones al uso comercial; verificar cada familia por separado antes de producir.
- Contenido NSFW explicito: varios archivos incluyen terminos como `lustifyNSFW`, `snofsSexNudesAndOtherFunStuff`, `unholyDesireMixDark` y `penis_size_krea2_v2_loraholic`. Su uso en entornos corporativos o publicos puede incumplir politicas internas o de plataforma.
- Riesgo de sesgos y contenido inapropiado inherente a los checkpoints comunitarios de difusion; no hay filtros ni evaluaciones de seguridad documentadas.
- Riesgo de alucinacion visual y artefactos propios de modelos de difusion cuantizados, especialmente en INT4.
- Sin garantia de integridad: al ser un espejo de terceros, no se documenta la procedencia exacta ni el hash de cada archivo respecto al original.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni validacion externa.
- El repositorio se actualiza de forma irregular (creado en septiembre de 2026, actualizado en noviembre de 2026); los archivos pueden cambiar sin versionado semantico.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/dennygod/comfyui-models
- Pesos originales de Krea 2: https://huggingface.co/Comfy-Org/Krea-2
- Nodo krea2edit para ComfyUI: https://github.com/lbouaraba/comfyui-krea2edit

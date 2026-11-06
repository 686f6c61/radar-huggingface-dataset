# cokeadrink/moss-image-sft-turbo-runpod

## Resumen

MOSS-Image-SFT Turbo es un repositorio de redistribucion de pesos y adaptadores para el modelo de difusion texto-a-imagen MOSS-Image-SFT, empaquetados para su uso directo en ComfyUI. El autor del repositorio (cokeadrink) no ha entrenado ni ajustado el modelo: se limita a replicar sin cambios los ficheros publicados por OpenMOSS-Team, Comfy-Org, akhaliq y lodestones, junto con un manifiesto de procedencia (`bundle-manifest.json`) que registra revisiones inmutables y hashes SHA-256 por fichero. El pipeline declarado es `text-to-image` y la licencia heredada es Apache-2.0.

El paquete combina el transformer MOSS-Image-SFT en BF16, un codificador de texto Qwen3.5-9B convertido a INT8 con rotacion de convolucion (ConvRot), el VAE de FLUX.2 empaquetado por Black Forest Labs y tres adaptadores LoRA de destilacion para reducir el numero de pasos de muestreo: uno de 4 pasos (v2.0), uno de 3 pasos (v1.0, descrito como borrador) y uno de 8 pasos (DMD, de lodestones). El objetivo practico es permitir inferencia de pocos pasos con CFG 1 sobre una base de difusion de alta resolucion (1024 por 1024) dentro de ComfyUI nativo.

La relevancia de esta ficha es acotada: no aporta un modelo nuevo, sino una distribucion verificable de artefactos existentes con instrucciones de uso concretas (seleccionar un unico adaptador a fuerza 1.0, Euler/simple, CFG 1, shift 5). El tamano total del repositorio es de 23 816 518 936 bytes, cifra que corresponde a almacenamiento y no a VRAM pico de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion texto-a-imagen (transformer de difusion MOSS-Image-SFT) con codificador de texto Qwen3.5-9B y VAE FLUX.2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (transformer), INT8 (codificador de texto, ConvRot), FP32 (pesos de los adaptadores LoRA) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformer, codificador de texto, VAE y LoRA) |

## Arquitectura y entrenamiento

El componente central es el transformer de difusion MOSS-Image-SFT, publicado en BF16 por OpenMOSS-Team y empaquetado por Comfy-Org. La generacion de texto condicionante corre a cargo de un Qwen3.5-9B convertido a INT8 mediante ConvRot, y la decodificacion latente usa el VAE de FLUX.2 de Black Forest Labs. El muestreo sigue un esquema de flow matching con Euler/simple, CFG 1 y shift 5, segun las instrucciones del repositorio.

Los adaptadores incluidos son producto de destilacion para reduccion de pasos: `moss_image_sft_4step_v2.0.safetensors` (akhaliq, 4 pasos, aproximadamente 1024 por 1024), `moss_image_sft_3step_v1.0.safetensors` (akhaliq, exactamente 3 pasos, descrito como adaptador borrador congelado) y `moss_image_sft_8step_lodestones.safetensors` (lodestones, DMD, 8 pasos, derivado de `lora.safetensors` upstream). No se dispone de informacion sobre volumen de tokens de entrenamiento, composicion del dataset ni uso de RLHF/DPO para el modelo base. La innovacion tecnica destacable en este paquete es la preservacion de los adaptadores sin fusionar en FP32 sobre base BF16, ya que fusionarlos o parchearlos a BF16 puede perder deltas pequenos de destilacion y detalle fino de texto; el repositorio no modifica los tensores upstream ni garantiza paridad numerica entre distintos loaders.

## Capacidades

- Generacion de imagenes a partir de prompts de texto (pipeline `text-to-image`), con resolucion de trabajo recomendada de aproximadamente 1024 por 1024 para el adaptador de 4 pasos.
- Muestreo acelerado en 3, 4 u 8 pasos segun el adaptador seleccionado, con CFG 1.
- Integracion nativa en ComfyUI, incluido el tipo de codificador de texto `moss_image` y el nodo Empty Flux 2 Latent.
- Soporte de adaptadores LoRA independientes y conmutables (no apilables entre si).
- Trazabilidad de artefactos mediante `bundle-manifest.json` con revisiones inmutables y hashes SHA-256 por fichero.
- Capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio o modo thinking: no disponibles (no es un modelo de lenguaje generative en el sentido convencional, sino un pipeline de difusion).

## Casos de uso

- Prototipado rapido de generacion de imagenes en ComfyUI: cargar el transformer BF16, seleccionar un adaptador y usar Euler/simple con CFG 1 y shift 5 permite obtener imagenes de 1024 por 1024 en 4 pasos, adecuado para iteracion de prompts en diseno grafico.
- Pruebas A/B de adaptadores de destilacion: al incluir tres adaptadores de distinta procedencia (3, 4 y 8 pasos), el repositorio sirve para comparar calidad y fidelidad de texto entre configuraciones sobre una misma base, manteniendo los LoRA sin fusionar en FP32.
- Despliegue en entornos RunPod: el nombre del repositorio sugiere su uso como bundle de arranque en instancias RunPod con ComfyUI preinstalado, reduciendo el tiempo de preparacion de artefactos.
- Reproducibilidad y auditoria de artefactos: el manifiesto con hashes SHA-256 y revisiones inmutables permite verificar que los pesos desplegados coinciden con los upstream, util en pipelines con requisitos de procedencia.
- Generacion de imagenes de referencia para documentacion tecnica o mockups: con resolucion 1024 y pocos pasos, encaja en flujos donde se necesita volumen moderado de imagenes sin infraestructura de GPU dedicada de gran escala.
- Base para experimentacion con destilacion de pocos pasos: investigadores pueden partir de esta distribucion para evaluar la perdida de detalle fino al fusionar adaptadores a BF16 frente a mantenerlos en FP32 sobre base BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma desglosada; el repositorio solo declara un tamano total de almacenamiento de 23 816 518 936 bytes, que no equivale a VRAM pico.
- GPU recomendadas: no disponible. El paquete incluye transformer BF16 y codificador de texto INT8, lo que sugiere requisitos de memoria elevados, pero no se aportan cifras verificables.
- Compatibilidad con GPU de consumo: no disponible; no se confirma que quepa en RTX 4090 u otras consumer GPU.
- Opciones de despliegue: ComfyUI nativo (soporte del tipo de codificador `moss_image` y nodo Empty Flux 2 Latent). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este pipeline.
- Latencia y throughput: no disponible. Los adaptadores permiten 3, 4 u 8 pasos de muestreo, pero no se publican tiempos medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-Image-SFT Turbo (este repositorio) | no disponible | no disponible | Difusion texto-a-imagen con adaptadores de 3/4/8 pasos | Apache-2.0 | Hugging Face, redistribucion |
| OpenMOSS-Team/MOSS-Image-SFT | no disponible | no disponible | Modelo base de difusion texto-a-imagen | Apache-2.0 (segun el repositorio) | Hugging Face |
| akhaliq/MOSS-Image-SFT-4-steps | no disponible | no disponible | Adaptador de destilacion a 4 pasos | Apache-2.0 (segun el repositorio) | Hugging Face |
| lodestones/MOSS-Image-SFT-8-steps-dmd | no disponible | no disponible | Adaptador DMD a 8 pasos | Apache-2.0 (segun el repositorio) | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Este repositorio no entrena ni adapta modelos: redistribuye ficheros sin cambios. El credito de desarrollo, ajuste fino, destilacion y conversion corresponde a OpenMOSS, Comfy-Org, Qwen, Black Forest Labs, akhaliq y lodestones.
- Los adaptadores Turbo no deben apilarse entre si; hay que seleccionar uno solo a fuerza 1.0.
- Fusionar o parchear los adaptadores a BF16 puede degradar deltas de destilacion y detalle fino de texto; la configuracion evaluada por el autor del adaptador de 4 pasos mantiene el LoRA sin fusionar en FP32 sobre base BF16.
- No se garantiza paridad numerica entre distintos loaders.
- Sesgos conocidos del modelo base: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion visual o de fidelidad al prompt: no cuantificado en la informacion disponible.
- Idiomas soportados: no disponibles; no se confirma cobertura multilingue de prompts.
- Restricciones de licencia: Apache-2.0 segun los publicadores originales; conviene revisar `LICENSE` y las model cards upstream antes de uso comercial.
- El tamano de 23,8 GB corresponde a almacenamiento, no a VRAM pico; planificar el hardware a partir de las model cards originales.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin evidencia de uso comunitario ni validacion independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/cokeadrink/moss-image-sft-turbo-runpod
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Empaquetado Comfy-Org: https://huggingface.co/Comfy-Org/MOSS-Image
- Adaptador de 4 pasos (akhaliq): https://huggingface.co/akhaliq/MOSS-Image-SFT-4-steps
- Adaptador de 8 pasos DMD (lodestones): https://huggingface.co/lodestones/MOSS-Image-SFT-8-steps-dmd
- Manifiesto de procedencia: `bundle-manifest.json` dentro del repositorio

# PuppetVision/krea-2-amd-rocm-optimized-comfy-triton

## Resumen

Krea 2 AMD ROCm Optimized Comfy Triton es un checkpoint de difusion de un solo archivo para generacion de imagenes (texto a imagen e imagen a imagen) derivado de Krea-2-Turbo, publicado por el usuario PuppetVision. Su proposito no es ofrecer un modelo nuevo, sino un empaquetado cuantizado en INT8 con esquema tensorwise, pensado para ejecutarse en GPU AMD mediante ROCm y Triton dentro de ComfyUI. El repositorio incluye los pesos de difusion y del codificador de texto, y esta disenado para combinarse con un nodo externo de VAE (Qwen VAE Triton W8A8) y con ROCm FlashAttention para alcanzar su maximo rendimiento.

La relevancia del proyecto es practica: el autor publica mediciones A/B sobre un host Ubuntu concreto en las que la ruta completamente optimizada reduce el primer flujo de trabajo de 242,4 s a 85,0 s (un 64,9 % menos) y mejora el tiempo por iteracion en caliente de 8,87 s/it a 8,16 s/it. Frente a los checkpoints oficiales de ComfyUI, el checkpoint INT8 tensorwise del proyecto queda un 21,3 % por debajo del BF16 oficial y un 31,5 % por debajo del FP8 escalado en generacion en caliente, aunque solo un 0,8 % mejor que el INT8 ConvRot oficial.

El modelo base es Krea-2-Turbo, un modelo de difusion para generacion de imagenes. No se dispone de datos publicados en la informacion proporcionada sobre el numero de parametros, la arquitectura interna detallada ni la longitud de contexto del codificador de texto, por lo que esos campos se marcan como no disponibles. La licencia es la Krea 2 Community License, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (checkpoint de un solo archivo para ComfyUI); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 tensorwise (checkpoint de difusion); codificador de texto Qwen3-VL INT8; VAE opcional en Triton W8A8 |
| Idiomas soportados | no disponible (modelo de imagen; el codificador de texto es Qwen3-VL) |
| Licencia | Krea 2 Community License (license: other) |
| Formato de pesos | diffusion-single-file (pesos para ComfyUI); tamano del repo 33,1 GB |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion INT8 con granularidad tensorwise de Krea-2-Turbo, un modelo de difusion orientado a generacion de imagenes. El autor no documenta en la model card la arquitectura del transformer de difusion, el numero de parametros ni los datos de entrenamiento originales; toda esa informacion corresponde al modelo base Krea-2-Turbo y no se incluye en la informacion proporcionada. El repositorio contiene ademas el codificador de texto en INT8, identificado como Qwen3-VL, lo que sugiere un pipeline de texto a imagen con codificador multimodal de la familia Qwen3-VL.

La innovacion tecnica del proyecto es el empaquetado y la ruta de ejecucion en AMD ROCm. El autor recomienda combinar el checkpoint de difusion INT8 tensorwise, el codificador de texto INT8, el nodo Qwen VAE Triton W8A8 en preset `Aggressive`, ROCm FlashAttention con backend Triton/AITER (`FLASH_ATTENTION_TRITON_AMD_ENABLE=TRUE`) y ComfyUI lanzado con `--use-flash-attention --disable-xformers`. Segun sus mediciones, el cambio de atencion PyTorch a ROCm FlashAttention es el que aporta la mayor parte de la mejora: generacion en caliente de 82,5 s a 75,0 s (9,1 %) y muestreo de 71,0 s a 65,0 s (8,5 %). El flag `--enable-triton-backend` resulto neutro sobre la ruta de FlashAttention y el autor lo describe como un experimento opcional del backend comfy-kitchen. No se documentan datos de RLHF, DPO ni composicion del dataset.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) en ComfyUI.
- Edicion y transformacion de imagenes a partir de una referencia (image-to-image, style-reference).
- Generacion con pocos pasos: las mediciones del autor usan 8 pasos a 1368x768, coherente con la variante Turbo del modelo base.
- Cuantizacion INT8 tensorwise para reducir huella de memoria y almacenamiento en GPU AMD.
- Integracion con ROCm FlashAttention y con el nodo Qwen VAE Triton W8A8 para acelerar carga y decodificacion del VAE.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, razonamiento multi-paso, audio o video.

## Casos de uso

- Generacion de imagenes por lotes en ComfyUI sobre GPU AMD: el checkpoint INT8 tensorwise permite ejecutar el pipeline en ROCm con un tiempo por iteracion en caliente de 3,765 s/it en el checkpoint de difusion, lo que facilita producir series de imagenes a 1368x768 y 8 pasos en estaciones de trabajo AMD.
- Prototipado de flujos texto a imagen en equipos AMD de consumo o profesionales: al ser un archivo unico para ComfyUI, se carga directamente en el grafo y evita configuraciones multiarchivo, reduciendo el tiempo de puesta en marcha.
- Flujos de referencia de estilo (style-reference): el autor mide esta ruta y reporta una reduccion del 21,4 % en el primer flujo tras el arranque gracias al VAE Triton W8A8 en preset agresivo, util para equipos que iteran sobre un mismo estilo visual.
- Reduccion del coste de arranque en entornos contenerizados: con Docker, el parche de VAE reduce el primer flujo texto a imagen de 231,209 s a 182,355 s (21,1 %) y el primer flujo tras un cambio de resolucion de 223,064 s a 176,777 s (20,8 %), relevante en servicios que reinician contenedores con frecuencia.
- Evaluacion comparativa de backends de atencion en AMD: el repositorio sirve como referencia reproducible para medir PyTorch cross-attention frente a ROCm FlashAttention en un mismo checkpoint y host.
- Despliegue de generacion de imagenes en infraestructura AMD existente: al no requerir CUDA, permite reutilizar nodos con GPU AMD en lugar de aprovisionar hardware NVIDIA, siempre que se respete la licencia del modelo base.

## Benchmarks y rendimiento

Mediciones del autor sobre un host Ubuntu concreto, a 1368x768 y 8 pasos, promediando dos ejecuciones en caliente tras la inicializacion:

| Ruta en Ubuntu | Primera ejecucion | Generacion en caliente | Muestreo en caliente | s/it en caliente |
|---|---:|---:|---:|---:|
| ComfyUI INT8 estilo oficial + LoRA Style-Reference en runtime + cross-attention PyTorch | 242,4 s | 81,7 s | 71,0 s | 8,87 |
| Todas las optimizaciones: INT8 del proyecto + codificador INT8 + Qwen VAE Triton Aggressive + ROCm FlashAttention | 85,0 s | 75,0 s | 65,0 s | 8,16 |

Comparativa de checkpoints de difusion con la ruta de atencion y el codificador de texto constantes:

| Checkpoint de difusion | Generacion en caliente | Muestreo en caliente | s/it en caliente | Mejora del INT8 del proyecto |
|---|---:|---:|---:|---:|
| INT8 TensorWise del proyecto | 35,16 s | 30,12 s | 3,765 | — |
| INT8 ConvRot oficial de ComfyUI | 35,44 s | 30,54 s | 3,817 | 0,8 % |
| BF16 oficial | 44,69 s | 38,55 s | 4,819 | 21,3 % |
| FP8 escalado oficial | 51,34 s | 44,41 s | 5,551 | 31,5 % |

Diagnostico Docker del VAE:

| Medicion | Sin parche | Qwen VAE Triton W8A8 Aggressive | Reduccion |
|---|---:|---:|---:|
| Primer flujo texto a imagen | 231,209 s | 182,355 s | 21,1 % |
| Texto a imagen tras cambio de resolucion | 223,064 s | 176,777 s | 20,8 % |
| Primer flujo con referencia de estilo | 275,472 s | 216,590 s | 21,4 % |

No se han publicado en la informacion disponible resultados de benchmarks de calidad de imagen (FID, CLIP score, evaluaciones humanas) ni comparaciones con otros modelos de difusion.

## Requisitos de hardware

- GPU AMD con soporte ROCm; el autor no especifica modelos concretos validados.
- VRAM estimada: no disponible. El repositorio ocupa 33,1 GB en disco, pero no se desglosa el tamano de cada componente ni el pico de VRAM en inferencia.
- GPU recomendadas: no disponible. El autor solo indica que la configuracion de ROCm, PyTorch y FlashAttention depende de la GPU y de las versiones.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Despliegue: ComfyUI con `--use-flash-attention --disable-xformers`; ROCm FlashAttention con backend Triton/AITER; nodo Qwen VAE Triton W8A8 en preset `Aggressive`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusion de este tipo.
- Latencia y throughput: 8,16 s/it en caliente en el flujo completo medido (1368x768, 8 pasos) y 3,765 s/it para el checkpoint de difusion aislado en el host Ubuntu del autor. El primer flujo completo tarda 85,0 s con todas las optimizaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento medido | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Krea 2 AMD ROCm Optimized (este) | no disponible | no disponible | 3,765 s/it en caliente (difusion, 1368x768, 8 pasos) | Krea 2 Community License | Hugging Face, 4164 descargas |
| Krea-2-Turbo (base) | no disponible | no disponible | no disponible | Krea 2 Community License | Hugging Face (krea/Krea-2-Turbo) |
| ComfyUI INT8 ConvRot oficial | no disponible | no disponible | 3,817 s/it en caliente | segun checkpoint oficial | ComfyUI |
| ComfyUI BF16 oficial | no disponible | no disponible | 4,819 s/it en caliente | segun checkpoint oficial | ComfyUI |

La comparacion se limita a variantes del mismo modelo base y a los checkpoints oficiales medidos por el autor; no se dispone de datos para comparar con otras familias de modelos de difusion.

## Limitaciones y advertencias

- Las mediciones proceden de un unico host Ubuntu y de una configuracion de GPU concreta; el autor advierte que ROCm, PyTorch y FlashAttention dependen de la GPU y de las versiones, por lo que los tiempos no son extrapolables sin validacion.
- La mejora del checkpoint INT8 tensorwise frente al INT8 ConvRot oficial es marginal (0,8 %); la mayor parte de la ganancia proviene de FlashAttention y del parche de VAE, no del checkpoint en si.
- El codificador de texto INT8 se describe como optimizacion de memoria y almacenamiento, no de velocidad: su tiempo en caliente queda practicamente empatado con los controles BF16 y FP8.
- El flag `--enable-triton-backend` no aporta mejora sobre la ruta de FlashAttention segun el A/B del autor; tratarlo como requisito puede inducir a error.
- La licencia Krea 2 Community License no es una licencia de codigo abierto estandar; es necesario revisar sus terminos en el enlace oficial antes de cualquier uso comercial.
- No se documentan sesgos, tasas de alucinacion visual ni limitaciones de idioma del codificador de texto en la informacion disponible.
- No se publican evaluaciones de calidad de imagen, por lo que no puede verificarse que la cuantizacion INT8 preserve la fidelidad respecto al modelo base en todos los casos.
- El repositorio tiene 1 like y 4164 descargas; es un empaquetado de la comunidad, no un lanzamiento oficial del desarrollador del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PuppetVision/krea-2-amd-rocm-optimized-comfy-triton
- Modelo base: https://huggingface.co/krea/Krea-2-Turbo
- Licencia Krea 2: https://www.krea.ai/krea-2-licensing
- Video de lanzamiento del proyecto: https://youtu.be/fD-J2CYetIg
- Nodo Qwen VAE Triton W8A8: https://registry.comfy.org/publishers/puppet-vision/nodes/qwen-vae-triton
- ROCm FlashAttention: https://github.com/ROCm/flash-attention

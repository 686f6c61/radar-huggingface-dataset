# koongrizzly/MiniMax_H3_int4_W4A8_ConvRot_Pruned

## Resumen

MiniMax_H3_int4_W4A8_ConvRot_Pruned es un repositorio de componentes cuantizados del modelo MiniMax H3, un generador omnicanal de vídeo con audio estéreo sincronizado desarrollado originalmente por MiniMaxAI. Este repositorio, mantenido por el usuario koongrizzly, no contiene un modelo entrenado desde cero, sino una recopilación de pesos convertidos a formatos de baja precisión (INT4/W4A8 ConvRot) y a precisión mixta (FP16/FP32) con el objetivo de reducir los requisitos de memoria para inferencia local.

El problema que resuelve es práctico: el MiniMax H3 original en precisión completa exige una cantidad de VRAM y memoria de sistema que lo hace inviable en GPUs de consumo. Este repositorio empaqueta los transformadores FL2VA y Ref2VA podados y cuantizados, el codificador de texto en W4A8 ConvRot, un VAE de vídeo en precisión mixta y el VAE de audio en FP32, permitiendo ejecutar el pipeline completo en entornos con recursos limitados.

Es relevante porque demuestra el ecosistema de conversión comunitaria que se está formando alrededor de modelos generativos de vídeo de gran tamano, y porque ofrece una vía concreta para desplegar generación de vídeo con audio en hardware de consumo. El repositorio ocupa 81,5 GB e incluye LoRAs Turbo de 4 pasos para acelerar la generación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformadores de difusión (FL2VA y Ref2VA) con VAE de vídeo y VAE de audio; codificador de texto |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT4/W4A8 ConvRot (transformadores y text encoder); FP16/FP32 mixto (VAE de vídeo); FP32 (VAE de audio) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo nuevo: redistribuye y reempaqueta componentes del MiniMax H3 oficial. Los dos transformadores principales, FL2VA (first/last-frame to video-audio) y Ref2VA (reference to video-audio), son versiones podadas y cuantizadas en formato W4A8 ConvRot, es decir, pesos en 4 bits con activaciones en 8 bits y una transformación de rotación de convolución aplicada para mejorar la estabilidad numérica de la cuantización. El codificador de texto también se ofrece en W4A8 ConvRot, mientras que su componente visual se mantiene en mayor precisión, tal como en la conversión de origen.

La innovación técnica de este repositorio reside en el VAE de vídeo de precisión mixta: la mayoría de tensores se convierten de FP32 a FP16 para reducir memoria y almacenamiento, pero bloques pequenos y sensibles a la precisión se conservan deliberadamente en FP32 para preservar la calidad de reconstrucción y la estabilidad numérica. El VAE de audio se mantiene en FP32. No se ha reentrenado ni ajustado la arquitectura; se incluyen además LoRAs Turbo de 4 pasos (versión step600) para reducir el número de pasos de muestreo. No hay información disponible sobre el número de tokens de entrenamiento ni sobre el uso de RLHF o DPO en el modelo original.

## Capacidades

- Generación de vídeo con audio estéreo sincronizado (texto a audio-vídeo).
- Generación condicionada por primer y último fotograma (FL2VA).
- Generación condicionada por referencias multimodales (Ref2VA).
- Variante híbrida que permite combinar imagen inicial y referencia en una misma tarea.
- Codificación de texto para prompts mediante un text encoder cuantizado en W4A8.
- Decodificación de vídeo mediante VAE de precisión mixta y de audio mediante VAE FP32.
- Aceleración mediante LoRAs Turbo de 4 pasos.
- Compatibilidad con ComfyUI como entorno principal de ejecución.
- Soporte de modelos INT8 a través de la aplicación independiente del autor.

## Casos de uso

- Generación de clips cortos con audio en GPUs de consumo: la cuantización W4A8 y el VAE en precisión mixta reducen la huella de memoria lo suficiente para cargar el pipeline en hardware que no podría con los pesos completos.
- Creación de vídeo a partir de un fotograma inicial y uno final: el transformador FL2VA permite interpolar movimiento y audio entre dos imágenes dadas, útil para animar storyboards o transiciones.
- Personalización con referencias visuales: el transformador Ref2VA permite generar vídeo manteniendo la identidad o el estilo de una imagen de referencia, aplicable a contenido de marca o avatares.
- Prototipado rápido de pipelines de vídeo generativo en ComfyUI: los archivos están pensados para cargarse con los loaders de ComfyUI, lo que facilita iterar sobre prompts y parámetros sin infraestructura dedicada.
- Investigación sobre cuantización de modelos de difusión: el repositorio sirve como caso de estudio de cuantización W4A8 ConvRot y de precisión mixta aplicada a VAEs, permitiendo comparar calidad frente a los pesos originales.
- Generación acelerada con LoRAs Turbo: para aplicaciones interactivas donde importa la latencia, las LoRAs de 4 pasos reducen el coste de muestreo a cambio de cierta pérdida de fidelidad.
- Despliegue en estaciones de trabajo con VRAM limitada: combinando los componentes cuantizados y un loader compatible, se puede ejecutar el pipeline completo sin recurrir a servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio completo ocupa 81,5 GB en disco, por lo que se requiere espacio de almacenamiento amplio además de memoria para cargar los componentes activos.
- El objetivo declarado es permitir inferencia local en GPUs de consumo, frente a los requisitos muy elevados del modelo en precisión completa.
- GPU recomendadas: no disponible. La cuantización W4A8 y el VAE FP16/FP32 están diseñados para reducir la huella respecto a los pesos originales, pero no se especifican modelos concretos.
- Opciones de despliegue: ComfyUI (entorno oficialmente previsto), la aplicación independiente del autor (https://github.com/Koongrizzly/MiniMax_H3_Standalone_app), que también permite cargar modelos INT8, y otros entornos con un loader compatible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax_H3_int4_W4A8_ConvRot_Pruned (este repo) | no disponible | no disponible | INT4/W4A8, FP16/FP32 mixto | Apache 2.0 | Hugging Face, 81,5 GB |
| MiniMaxAI/MiniMax-H3 (original) | no disponible | no disponible | FP completo | no disponible en la información | Hugging Face oficial |
| Winnougan/MiniMax-H3-INT4_Convrot_ComfyUI | no disponible | no disponible | INT4/W4A8 ConvRot | no disponible en la información | Hugging Face |
| berryber09/MiniMax-H3-ref2va-fl2va-hybrid-w4a8 | no disponible | no disponible | W4A8 | no disponible en la información | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La cuantización W4A8 y la poda implican una pérdida de precisión numérica que puede degradar la calidad de vídeo y audio respecto al modelo original.
- El VAE de precisión mixta conserva algunos tensores en FP32, pero la conversión mayoritaria a FP16 puede introducir diferencias de reconstrucción.
- No se han publicado evaluaciones cuantitativas de calidad en este repositorio, por lo que el impacto real de la cuantización no está medido.
- El repositorio redistribuye componentes de terceros; el autor advierte que los usuarios deben revisar y cumplir los términos de licencia del modelo MiniMax H3 original y de los componentes convertidos.
- Aunque la licencia declarada es Apache 2.0, la procedencia derivada de otros proyectos hace recomendable verificar las condiciones aplicables antes de un uso comercial.
- El repositorio no está afiliado ni respaldado por MiniMaxAI.
- No hay información disponible sobre sesgos, cobertura idiomática ni riesgo de alucinación específicos de esta conversión.
- Está pensado principalmente para ComfyUI; su uso en otros entornos requiere trabajo adicional y loaders compatibles.
- El tamano del repositorio (81,5 GB) exige planificación de almacenamiento y transferencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/koongrizzly/MiniMax_H3_int4_W4A8_ConvRot_Pruned
- Modelo original MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Conversión INT4 ConvRot de Winnougan: https://huggingface.co/Winnougan/MiniMax-H3-INT4_Convrot_ComfyUI
- Aplicación independiente MiniMax H3: https://github.com/Koongrizzly/MiniMax_H3_Standalone_app
- Modelo híbrido de berryber09: https://huggingface.co/berryber09/MiniMax-H3-ref2va-fl2va-hybrid-w4a8
- Modelo híbrido de Aki7777777 en Civitai: https://civitai.com/models/2900456/minimax-h3sparseref15hybrid
- LoRAs Turbo de MiniMax H3: https://huggingface.co/larryvrh/MiniMax-H3-Turbo-Lora

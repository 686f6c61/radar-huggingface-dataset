# nynxz/MOSS-Image

## Resumen

MOSS-Image es un modelo de difusion para generacion de imagenes desarrollado por OpenMOSS-Team. Este repositorio concreto, publicado por el usuario nynxz, no contiene el modelo original sino dos artefactos auxiliares para ejecutarlo en ComfyUI: una LoRA de 1,9 MB que corrige un artefacto de bandas verticales de color presente en la variante SFT, y una reempaquetado de los pesos originales con las proyecciones de atencion q, k y v almacenadas como tensores separados en lugar de fusionados.

El problema que resuelve es practico: la variante SFT de MOSS-Image pinta franjas verticales de color espaciadas de forma regular (aproximadamente 21 px a 1024 px de ancho y 16 px a 768 px) en zonas lisas como cielos, niebla, paredes o fondos de estudio. Son un desplazamiento de color, no de brillo, por lo que pasan desapercibidas a simple vista pero resultan evidentes al saturar el color. La LoRA elimina esas direcciones concretas dentro de las capas responsables sin revertir capas completas, preservando mas del 99 % de similitud SSIM con el SFT original.

La relevancia actual es doble: por un lado ofrece una correccion quirurgica y de tamano minimo (1,9 MB frente a los 1,13 GB de la alternativa que revierte capas enteras), y por otro los checkpoints con q/k/v separados permiten usar modo bypass de LoRA en ComfyUI, algo que los ficheros fusionados de Comfy-Org no permiten. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | modelo de difusion (detalles de la red no disponibles en la informacion proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (checkpoints incluidos); int8 disponible en los ficheros de Comfy-Org referenciados |
| Idiomas soportados | no disponible (modelo texto-a-imagen) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (single file para ComfyUI) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna de MOSS-Image (tipo de backbone, numero de bloques, mecanismo de atencion ni esquema de entrenamiento). Lo que si se documenta es la estructura de los ficheros publicados: dos checkpoints en bf16 de 10,2 GB cada uno, correspondientes a las variantes Base y SFT del modelo original de OpenMOSS-Team, reempaquetados con las proyecciones q, k y v de atencion como tensores independientes en lugar de fusionados. El text encoder y el VAE no se incluyen y deben obtenerse del repositorio Comfy-Org/MOSS-Image, ya que son identicos a los originales.

La innovacion tecnica destacable de este repositorio es la LoRA de destripado. Se construye a partir de las propias diferencias que introduce el SFT respecto a Base, identificando las pocas direcciones dentro de las capas 37-41 (senaladas previamente por el analisis de intercambio de bloques de MATLOWAI) que alimentan las franjas. En lugar de revertir capas completas al estado Base, la LoRA anula solo esas direcciones, lo que reduce el impacto sobre la imagen final. El entrenamiento de la LoRA se realizo en bf16, con un rango efectivo limitado a 64 direcciones (top64), y el resultado pesa 1,9 MB.

## Capacidades

- Generacion de imagenes texto-a-imagen mediante difusion, en dos variantes: Base y SFT.
- Eliminacion de artefactos de bandas verticales de color en la variante SFT mediante la LoRA incluida.
- Control de intensidad de la correccion por resolucion: fuerza 1.0 a 768 px y 1.5 a 1024 px.
- Compatibilidad con flujos de ComfyUI, incluyendo carga de LoRA con LoraLoaderModelOnly.
- Soporte de modo bypass de LoRA gracias a los checkpoints con q/k/v separados.
- Integracion con muestreadores ER-SDE y esquemas de skip-layer guidance (documentado con guidance en capa 22).
- No dispone de tool calling, agentes, razonamiento multi-paso ni capacidades de texto; es exclusivamente un modelo de generacion visual.

## Casos de uso

- Generacion de paisajes y cielos limpios: la LoRA elimina las franjas de color que el SFT pinta en degradados amplios, lo que la hace adecuada para imagenes de gran formato donde el banding es mas visible (a 1024 px las franjas alcanzan 21 px de separacion).
- Fondos de estudio y retratos: en retratos sobre fondos desenfocados, donde el SFT produce bandas evidentes al saturar el color, la correccion a fuerza 1.0 deja la franja como pico dominante en solo 1 de cada 12 imagenes de prueba.
- Renderizado arquitectonico e interiorismo: paredes lisas y superficies uniformes son el escenario tipico del artefacto; la LoRA permite mantener la estetica del SFT sin retoques manuales posteriores.
- Postproduccion en ComfyUI: se integra como nodo LoraLoaderModelOnly sin alterar el resto del flujo de trabajo, por lo que se puede anadir a pipelines existentes de forma no invasiva.
- Uso con modo bypass de LoRA: los checkpoints con q/k/v separados permiten combinar esta LoRA con otras tecnicas de adaptacion que requieran bypass, algo imposible con los ficheros fusionados de Comfy-Org.
- Evaluacion comparativa de tecnicas de correccion de artefactos: el repositorio incluye la metrica bandviz y datos de SSIM, lo que permite reproducir y comparar la correccion quirurgica frente a la reversion de capas completas.
- Despliegue en produccion con licencia permisiva: al ser Apache 2.0, puede integrarse en servicios comerciales de generacion de imagen sin restricciones de licencia adicionales.

## Benchmarks y rendimiento

Los datos disponibles son de calidad de imagen (bandviz y SSIM), no de benchmarks academicos. Se reproducen a continuacion las tablas de la model card.

A 768 px:

| Modelo | bandviz (mediana) | Franja sigue siendo el pico dominante | SSIM respecto a SFT | Tamano |
|---|---|---|---|---|
| SFT | 9.8 | 9 / 12 | 1.000 | — |
| SFT con capas 37-41 revertidas a Base (fix de MATLOWAI) | 6.5 | 8 / 12 | 0.980 | 1.13 GB |
| SFT + esta LoRA @ 1.0 | 4.2 | 1 / 12 | 0.995 | 1.9 MB |
| Base | 4.2 | 5 / 12 | 0.876 | — |

A 1024 px:

| Modelo | bandviz (mediana) | Franja sigue siendo el pico dominante | SSIM respecto a SFT | Tamano |
|---|---|---|---|---|
| SFT | 24.0 | 11 / 12 | 1.000 | — |
| SFT con capas 37-41 revertidas a Base (fix de MATLOWAI) | 8.4 | 4 / 12 | 0.983 | 1.13 GB |
| SFT + esta LoRA @ 1.0 | 6.1 | 6 / 12 | 0.996 | 1.9 MB |
| SFT + esta LoRA @ 1.5 | 5.9 | 1 / 12 | 0.993 | 1.9 MB |
| SFT + esta LoRA @ 2.0 | 6.0 | 1 / 12 | 0.992 | 1.9 MB |
| Base | 4.0 | 0 / 12 | 0.863 | — |

La metrica bandviz mide el pico mas fuerte del espectro de color por columna en el rango de 10 a 48 px dividido por la mediana; valores en torno a 16 o inferiores se consideran limpios. El protocolo de prueba fue ciego: 4 prompts con grandes areas lisas (dunas, paredes, agua abierta, retrato sobre fondo desenfocado) por 3 semillas no usadas en la construccion de la correccion, con muestreador ER-SDE, 25 pasos y CFG 2.5. No se han publicado resultados de benchmarks academicos (MMLU, FID, CLIP score u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los checkpoints bf16 pesan 10,2 GB cada uno, por lo que se necesita al menos esa cantidad mas el text encoder y el VAE; no se especifica una cifra total en la informacion proporcionada.
- GPU recomendadas: no disponibles de forma explicita; por tamano de pesos, una GPU con 16 GB o mas (RTX 4090, A100, H100) es el escenario natural para bf16.
- Cabe en GPU de consumo: previsiblemente en RTX 4090 (24 GB) y modelos con 16 GB o mas; no confirmado en la documentacion.
- Opciones de despliegue: ComfyUI es el entorno documentado; los ficheros son single-file para el directorio diffusion_models. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a difusion en este formato).
- Latencia y throughput: no disponibles. El protocolo de muestreo documentado usa ER-SDE con 25 pasos y CFG 2.5, con skip-layer guidance en la capa 22.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Correccion de banding | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MOSS-Image SFT + esta LoRA | difusion + LoRA | no disponible | no disponible | bandviz 4.2 (768 px) / 5.9 (1024 px) | Apache 2.0 | Hugging Face (este repo) |
| MOSS-Image SFT con fix de MATLOWAI | difusion + reversion de capas | no disponible | no disponible | bandviz 6.5 (768 px) / 8.4 (1024 px) | no disponible en la informacion | Hugging Face (MATLOWAI/MOSS-Image-SFT-DeBand) |
| MOSS-Image Base | difusion | no disponible | no disponible | bandviz 4.2 (768 px) / 4.0 (1024 px) | Apache 2.0 | Hugging Face (OpenMOSS-Team) |
| MOSS-Image SFT original | difusion | no disponible | no disponible | bandviz 9.8 (768 px) / 24.0 (1024 px) | Apache 2.0 | Hugging Face (OpenMOSS-Team) |

No se dispone de datos para comparar con otros modelos de difusion de la misma categoria (por ejemplo, familia Stable Diffusion o Flux) en la informacion proporcionada.

## Limitaciones y advertencias

- La LoRA debe aplicarse exclusivamente sobre la variante SFT, no sobre Base: se construyo a partir de los cambios propios del SFT y su uso sobre Base no esta validado.
- A 1024 px, la fuerza 1.0 deja un rastro tenue de franja en aproximadamente la mitad de las imagenes; se recomienda 1.5. La fuerza 2.0 no mejora a 1.5 y aleja mas el resultado del SFT.
- En ficheros fusionados de Comfy-Org, el modo Load LoRA (Bypass) descarta los adaptadores de q/k/v; para bypass es necesario usar los checkpoints con q/k/v separados de este repositorio.
- El text encoder y el VAE no se incluyen y deben descargarse de Comfy-Org/MOSS-Image; una version distinta de estos componentes puede alterar el comportamiento.
- No hay informacion sobre sesgos del modelo, riesgo de alucinacion visual, idiomas soportados ni limitaciones de contexto, por lo que no pueden evaluarse en esta ficha.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones de los componentes de terceros (text encoder, VAE) antes de un despliegue comercial.
- Los datos de calidad proceden de pruebas del propio autor del repositorio (12 imagenes por configuracion); no sustituyen a una evaluacion independiente a mayor escala.
- La fecha de creacion del repositorio indicada en los metadatos (2026-10-17) es posterior a la fecha actual y debe tratarse con cautela.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nynxz/MOSS-Image
- Modelo base original: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Variante SFT original: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Text encoder y VAE (Comfy-Org): https://huggingface.co/Comfy-Org/MOSS-Image
- Investigacion DeBand de MATLOWAI: https://huggingface.co/MATLOWAI/MOSS-Image-SFT-DeBand
- Comparacion interactiva DeBand: https://matlowai.github.io/MOSS-DeBand/#cols=sft,deband_lora,nynxz_1.5,strong_full,sft&item=a_anime_girl_school&seed=11

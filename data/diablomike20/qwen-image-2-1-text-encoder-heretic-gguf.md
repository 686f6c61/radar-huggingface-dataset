# diablomike20/Qwen-Image-2.1-Text-Encoder-Heretic-GGUF

## Resumen

Qwen-Image-2.1-Text-Encoder-Heretic-GGUF es una cuantización en formato GGUF (junto con variantes FP8 y BF16 en safetensors) del codificador de texto del pipeline de generación de imágenes Qwen-Image-2.1, publicado por el usuario diablomike20 a partir del modelo base pottokao/Qwen-Image-2.1-Text-Encoder-Heretic. No se trata de un modelo de lenguaje conversacional de propósito general, sino de un componente especializado: el text encoder que traduce las instrucciones en lenguaje natural a las representaciones latentes que consume el modelo de difusión (DiT) para generar imágenes. Su relevancia radica en que permite ejecutar el pipeline completo de Qwen-Image-2.1 en ComfyUI sobre hardware de consumo, gracias a la cuantización Q4_K_M.

El modelo cuenta con 8.190.735.360 parámetros (aproximadamente 8,2 mil millones) y deriva de una arquitectura Qwen3-VL, lo que implica que incorpora una torre de visión además del codificador de texto puro. La variante "Heretic" hace referencia a un proceso de "abliteration", una técnica de modificación de pesos que elimina o atenúa los mecanismos de rechazo del modelo alineado original, de modo que acepta indicaciones que el modelo base podría rechazar. La licencia es Apache 2.0.

La ficha describe un artefacto de inferencia orientado a un caso de uso muy concreto (generación de imágenes con Qwen-Image-2.1 en ComfyUI), con instrucciones específicas de integración, ajustes de muestreo recomendados y una advertencia técnica sobre la carga de la torre de visión en el nodo GGUF de ComfyUI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3-VL (codificador de texto con torre de visión) |
| Parametros totales | 8.190.735.360 (aprox. 8,2 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF), FP8 (safetensors), BF16 (safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (qwen3vl_8b_heretic-Q4_K_M.gguf + mmproj-qwen3vl_8b_heretic-f16.gguf), safetensors (FP8 y BF16) |

## Arquitectura y entrenamiento

El modelo es un codificador de texto derivado de la familia Qwen3-VL, con 8,2 mil millones de parámetros. Al tratarse de una cuantización y no de un entrenamiento desde cero, la arquitectura subyacente es la del modelo base pottokao/Qwen-Image-2.1-Text-Encoder-Heretic, que a su vez proviene del codificador de texto oficial de Qwen-Image-2.1. La presencia de un archivo `mmproj` (proyector multimodal) confirma que el codificador incluye una torre de visión, lo que permite procesar entradas multimodales además de texto.

La modificación "Heretic" corresponde a un proceso de abliteration aplicado sobre el modelo alineado: se identifican las direcciones de activación asociadas al rechazo y se proyectan fuera de los pesos, de forma que el modelo deja de bloquear determinadas peticiones. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original. La innovación técnica destacable de esta publicación no está en el entrenamiento, sino en el empaquetado: la cuantización Q4_K_M reduce el codificador a 5,0 GB más 1,2 GB del proyector, frente a los 17,5 GB del BF16, y se acompaña de un nodo parche para ComfyUI que corrige la carga de la torre de visión en formato GGUF.

## Capacidades

- Codificación de instrucciones en lenguaje natural para el pipeline de generación de imágenes Qwen-Image-2.1, alimentando el nodo `TextEncodeQwenImage21`.
- Procesamiento multimodal gracias a la torre de visión Qwen3-VL incluida en el archivo `mmproj`, lo que permite codificar entradas de imagen además de texto.
- Modo "abliterated": acepta indicaciones que el modelo alineado original rechazaría, al haberse eliminado las direcciones de activación asociadas al rechazo.
- Compatibilidad con el ecosistema ComfyUI mediante los cargadores `CLIPLoaderGGUF` (con nodo adicional) y `CLIPLoader` estándar para FP8 y BF16.
- Soporte de texto dentro de la imagen generada mediante la técnica de cambio de CFG a mitad del muestreo (primer tramo a cfg 1,0 y tramo final a cfg 3,0 con prompt negativo).
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso ni modo de pensamiento; el modelo está orientado exclusivamente a la codificación de prompts para difusión.

## Casos de uso

- Generación de imágenes en ComfyUI con hardware de consumo: el archivo Q4_K_M (5,0 GB) más el proyector (1,2 GB) permite cargar el codificador en GPUs con 8-12 GB de VRAM, dejando espacio para el DiT y el VAE del pipeline.
- Despliegue en GPUs NVIDIA sin nodos adicionales: la variante FP8 en safetensors (9,3 GB) se carga con el `CLIPLoader` estándar de ComfyUI y evita instalar el parche de la torre de visión.
- Ejecución en Mac y entornos sin CUDA: la variante BF16 (17,5 GB) funciona con el `CLIPLoader` estándar y está pensada para equipos Apple Silicon o sistemas sin aceleración NVIDIA.
- Generación de carteles, rótulos y texto legible en imagen: usando dos nodos `KSamplerAdvanced` encadenados con el mismo modelo, semilla y 25 pasos, se obtiene la composición a cfg 1,0 y el texto nítido a cfg 3,0 con prompt negativo como `oversaturated, overexposed, gibberish text`.
- Integración en pipelines de estilo fotográfico automatizado: junto con el nodo ComfyUI-QwenImage-PhotoStyles y el reescritor PE-T2I, un prompt corto se expande a un prompt estilizado completo en uno de 17 estilos fotográficos antes de la codificación.
- Flujo de trabajo completamente en GGUF: combinando este codificador con el DiT Q8_0/Q6_K/Q4_K_M y el reescritor PE-T2I Heretic GGUF, todo el pipeline de Qwen-Image-2.1 puede ejecutarse sin pesos en precisión completa.
- Investigación sobre alineación y abliteration: el modelo sirve como caso de estudio de cómo la eliminación de direcciones de rechazo afecta al comportamiento de un codificador de texto en tareas generativas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el codificador: aproximadamente 5,0 GB en Q4_K_M más 1,2 GB del proyector; 9,3 GB en FP8; 17,5 GB en BF16.
- GPU recomendadas: NVIDIA con soporte CUDA para las variantes GGUF y FP8 (RTX 3060 12 GB, RTX 4070, RTX 4090, A100, H100); Apple Silicon o entornos sin CUDA para la variante BF16.
- Cabe en GPU de consumo: sí, la variante Q4_K_M está pensada para GPUs de 8-12 GB, aunque hay que sumar la VRAM del DiT y del VAE del pipeline completo.
- Opciones de despliegue: ComfyUI con `CLIPLoaderGGUF` más el nodo ComfyUI-GGUF-Qwen3VL-TE, o `CLIPLoader` estándar para FP8 y BF16; también es compatible con llama.cpp para el reescritor de prompts asociado.
- Latencia y throughput: no disponibles.
- Ajustes de muestreo recomendados por el autor: 25 pasos, cfg 1,0 sin texto en la imagen, y división del muestreo en los pasos 12-17 para texto legible.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Enfoque |
|---|---|---|---|---|
| diablomike20/Qwen-Image-2.1-Text-Encoder-Heretic-GGUF | 8,2 B | GGUF, FP8, BF16 | Apache 2.0 | Codificador de texto abliterated para Qwen-Image-2.1 |
| pottokao/Qwen-Image-2.1-Text-Encoder-Heretic | no disponible | safetensors | Apache 2.0 | Modelo base del que deriva esta cuantización |
| pottokao/Qwen-Image-2.1-DiT-GGUF | no disponible | GGUF (Q8_0, Q6_K, Q4_K_M) | no disponible | Modelo de difusión del mismo pipeline |
| pottokao/Qwen-Image-2.1-PE-T2I-Heretic-GGUF | no disponible | GGUF | no disponible | Reescritor de prompts del mismo pipeline |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a formato, licencia y función dentro del pipeline.

## Limitaciones y advertencias

- No es un modelo de chat ni de razonamiento general: su función es codificar prompts para el pipeline de difusión de Qwen-Image-2.1; usarlo fuera de ese contexto no está documentado.
- La abliteration elimina los mecanismos de rechazo, lo que implica un riesgo elevado de generar contenido no filtrado; no es adecuado para aplicaciones con requisitos de moderación sin capas adicionales de control.
- El autor advierte de un error conocido (`got input of size [1, 512, 12288]`) al usar el GGUF en ComfyUI, causado por que ComfyUI-GGUF no carga la torre de visión Qwen3-VL; requiere instalar el nodo ComfyUI-GGUF-Qwen3VL-TE y colocar el archivo `mmproj` junto al GGUF.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día, por lo que no hay validación comunitaria ni evidencia de robustez en producción.
- No se documentan idiomas soportados, longitud de contexto ni sesgos conocidos del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el carácter abliterated puede entrar en conflicto con políticas de uso aceptable de plataformas o de la propia organización que lo despliegue.
- La calidad del texto generado en imagen depende de la configuración de muestreo (división de CFG en los pasos 12-17); un ajuste incorrecto produce texto ilegible o sobreexposición.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/diablomike20/Qwen-Image-2.1-Text-Encoder-Heretic-GGUF
- Modelo base: https://huggingface.co/pottokao/Qwen-Image-2.1-Text-Encoder-Heretic
- Nodo de parche para ComfyUI: https://github.com/pottokao-dotcom/ComfyUI-GGUF-Qwen3VL-TE
- Nodo de estilos fotográficos: https://github.com/pottokao-dotcom/ComfyUI-QwenImage-PhotoStyles
- Reescritor de prompts PE-T2I Heretic GGUF: https://huggingface.co/pottokao/Qwen-Image-2.1-PE-T2I-Heretic-GGUF
- DiT GGUF del pipeline: https://huggingface.co/pottokao/Qwen-Image-2.1-DiT-GGUF

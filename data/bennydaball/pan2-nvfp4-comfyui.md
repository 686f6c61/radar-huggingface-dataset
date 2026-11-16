# BennyDaBall/PAN2-NVFP4-ComfyUI

## Resumen
PAN2-NVFP4-ComfyUI es una cuantización NVFP4 del modelo PAN 2, un modelo de mundo (world model) de propósito general orientado a la generación de vídeo, desarrollado originalmente por el Institute of Foundation Models (IFM) de la Universidad MBZUAI. Esta versión concreta la publica el usuario independiente BennyDaBall y está empaquetada como archivo único para ComfyUI, con pesos y activaciones en 4 bits (W4A4) y pensada para GPUs Blackwell (RTX 50 series, RTX PRO Blackwell, DGX Spark).

El modelo resuelve el problema de ejecutar un transformer de vídeo de gran tamaño en hardware de consumo: reduce el archivo del transformer de 67,37 GB en BF16 a 16,33 GB en NVFP4, frente a los 26,68 GB de la cuantización INT8 oficial. Según el autor, cabe completo en la VRAM de una única RTX 5090 y permite muestrear clips de hasta 20 segundos sin desbordar a memoria compartida.

Es relevante ahora porque combina dos tendencias: la cuantización de precisión ultra-baja (NVFP4, formato de 4 bits con escalas de bloque) aplicada a modelos generativos de vídeo, y el ecosistema ComfyUI como plataforma de despliegue. La model card indica que soporta text-to-video e image-to-video en un solo archivo y que se puede encadenar con LTX-2.5 para generar audio sincronizado.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión con 44 bloques conjuntos y 528 capas lineales (según model card); detalles internos no disponibles |
| Parametros totales | 29B (según model card) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (W4A4: pesos y activaciones en 4 bits); existe también BF16 original e INT8 oficial |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | diffusion-single-file para ComfyUI (archivo único); repo de 16,5 GB |

## Arquitectura y entrenamiento
PAN 2 es un modelo de difusión para generación de vídeo descrito por el autor como "general-purpose world model". La model card de esta cuantización no detalla la arquitectura interna más allá de mencionar 44 bloques conjuntos y 528 capas lineales, todas ellas cuantizadas a NVFP4. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación técnica de esta publicación es la cuantización NVFP4 con cuantización de pesos y activaciones (W4A4) sobre las mismas capas que la versión INT8 oficial cuantiza. El autor indica que el proceso se calibró para todas las duraciones soportadas (2, 5, 10 y 20 segundos) y para ambos modos (text-to-video e image-to-video) usando el sampler guiado real de 50 pasos. Se menciona también una técnica denominada "schur-replay" en las etiquetas del repositorio, aunque no se detalla su funcionamiento en la model card.

## Capacidades
- Generación de vídeo a partir de texto (text-to-video).
- Generación de vídeo a partir de una imagen inicial (image-to-video).
- Generación de clips de 2, 5, 10 y 20 segundos de duración.
- Resolución de salida de 1248x704 a 24 fps según los ejemplos publicados.
- Modelo de mundo: el autor lo describe como world model de propósito general, orientado a simular dinámicas físicas y escenas.
- Integración con ComfyUI mediante nodos estándar (sin nodos personalizados).
- Capacidad de encadenarse con LTX-2.5 para generar una pista de audio sincronizada con los fotogramas generados en la misma ejecución.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo.

## Casos de uso
- Previsualización de vídeo publicitario: generar clips cortos de 5 a 10 segundos a 1248x704 a partir de un brief textual, usando una sola RTX 5090, para iterar conceptos antes de una producción final.
- Animación de imágenes fijas para redes sociales: tomar una fotografía o ilustración como fotograma inicial (image-to-video) y producir una animación de 5 segundos con movimiento coherente.
- Prototipado de escenas en estudios de animación: generar tomas de 20 segundos en una sola tarjeta para evaluar continuidad de cámara y física antes de pasar a render final.
- Generación de vídeo con audio en un solo flujo: encadenar la salida de PAN 2 con LTX-2.5 en ComfyUI para obtener imagen y sonido sincronizado sin entrenamiento adicional, útil para demos y contenido rápido.
- Investigación en modelos de mundo: usar el modelo como banco de pruebas para estudiar dinámicas físicas aprendidas, con la ventaja de que la versión NVFP4 cabe en hardware de consumo y facilita la experimentación.
- Despliegue en estaciones de trabajo con GPU Blackwell: integrar el archivo único en pipelines de ComfyUI existentes para generación de vídeo bajo demanda en entornos con RTX 50 series o RTX PRO Blackwell.
- Evaluación de cuantización NVFP4: servir como referencia práctica para medir la pérdida de calidad y la ganancia de velocidad de W4A4 frente a BF16 e INT8 en modelos de difusión de vídeo.

## Benchmarks y rendimiento
La model card proporciona tiempos de muestreo medidos en una RTX 5090 con ComfyUI estándar, resolución 1248x704, 24 fps, sampler euler/simple, 50 pasos y CFG 2.5. No se publican resultados de benchmarks de calidad (FVD, VBench, MMLU u otros).

| Archivo del transformer | Tamano | Clip 5 s | Clip 10 s | Clip 20 s |
|---|---:|---|---|---|
| BF16 original | 67,37 GB | no cabe | no cabe | no cabe |
| INT8 oficial | 26,68 GB | referencia | referencia | referencia |
| NVFP4 (este repo) | 16,33 GB | 16% mas rapido que INT8 | 10% mas rapido que INT8 | 26% mas rapido que INT8 |

Según el autor, en un clip de 20 segundos la versión INT8 oficial envía unos 10 GB a memoria compartida, mientras que esta versión NVFP4 muestrea en la propia tarjeta. Un clip de 5 segundos alcanza un pico de 20,4 GB de VRAM.

## Requisitos de hardware
- VRAM estimada: el transformer ocupa 16,33 GB; un clip de 5 segundos alcanza un pico de 20,4 GB, por lo que se recomienda al menos 24 GB de VRAM.
- GPU objetivo: Blackwell, es decir, RTX 50 series (RTX 5090 verificada por el autor), RTX PRO Blackwell y DGX Spark. El formato NVFP4 requiere soporte de hardware Blackwell.
- Cabe en GPU de consumo: sí, en RTX 5090 (32 GB). No se documenta compatibilidad con GPUs anteriores (Ada, Ampere) al ser NVFP4 un formato dependiente de Blackwell.
- Despliegue: ComfyUI estándar con nodos core; el repositorio incluye tres workflows. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusión de vídeo.
- Latencia y throughput: no se publican tiempos absolutos, solo comparativas relativas frente a INT8 (16% más rápido en 5 s, 10% en 10 s, 26% en 20 s). El autor indica que los tiempos de 5 segundos son la mediana en caliente de tres ejecuciones y los de 10 y 20 segundos son ejecuciones únicas.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto/duracion | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PAN2-NVFP4-ComfyUI (este) | 29B | clips de 2 a 20 s | NVFP4 W4A4, 16,33 GB | Apache 2.0 | Hugging Face, ComfyUI |
| PAN 2 INT8 oficial | 29B | clips de 2 a 20 s | INT8, 26,68 GB | Apache 2.0 (heredada del base) | Hugging Face |
| PAN 2 BF16 original (IFM/PAN2) | 29B | clips de 2 a 20 s | BF16, 67,37 GB | Apache 2.0 | Hugging Face |
| LTX-2.5 | no disponible | no disponible | no disponible | no disponible | Hugging Face (usado como complemento de audio) |

No se dispone de datos de benchmarks de calidad que permitan comparar el rendimiento generativo con otras alternativas de la misma categoría.

## Limitaciones y advertencias
- Modelo de cuantización no oficial: es una conversión de un tercero (BennyDaBall) sobre el modelo base IFM/PAN2, no una publicación del equipo original.
- Dependencia de hardware Blackwell: NVFP4 no funciona en GPUs anteriores; el despliegue queda limitado a RTX 50 series, RTX PRO Blackwell y DGX Spark.
- Sin benchmarks de calidad publicados: no hay métricas objetivas (FVD, VBench) que cuantifiquen la degradación frente a BF16 o INT8; solo se documentan ganancias de velocidad y tamaño.
- Riesgo de artefactos de cuantización: al usar 4 bits en pesos y activaciones, pueden aparecer degradaciones en escenas complejas o en duraciones largas no cubiertas por la calibración.
- Sesgos: no se documentan análisis de sesgos; al ser un modelo de vídeo, puede reproducir estereotipos presentes en los datos de entrenamiento originales.
- Alucinación visual: como modelo generativo, puede producir físicas incoherentes o contenido no solicitado.
- Idiomas: no se especifican los idiomas soportados en los prompts.
- Audio: PAN 2 es silencioso por diseño; el audio requiere un segundo modelo (LTX-2.5) y un workflow adicional.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base IFM/PAN2 y de los componentes auxiliares (LTX-2.5) antes de producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: poca validación comunitaria.

## Enlaces
- Hugging Face (este modelo): https://huggingface.co/BennyDaBall/PAN2-NVFP4-ComfyUI
- Modelo base PAN 2: https://huggingface.co/IFM/PAN2
- Repack de Comfy-Org: https://huggingface.co/Comfy-Org/PAN2
- Workflows de audio Hy-Nomas x LTX-2.5: https://huggingface.co/BennyDaBall/Hy-Nomas-x-LTX-2.5-Audio-Workflows
- Prompts de ejemplo: https://huggingface.co/BennyDaBall/PAN2-NVFP4-ComfyUI/blob/main/assets/PROMPTS.md
- Carpeta de captions: https://huggingface.co/BennyDaBall/PAN2-NVFP4-ComfyUI/tree/main/assets/captions
- Carpeta de imágenes de entrada: https://huggingface.co/BennyDaBall/PAN2-NVFP4-ComfyUI/tree/main/input
- Perfil del autor en X: https://x.com/BennyDaBall_OG
- Ko-fi del autor: https://ko-fi.com/bennydaball

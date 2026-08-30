# Halpak/MiniMax-H3-Turbo-Lora-ComfyUI

## Resumen

Este repositorio contiene un conjunto de adaptadores LoRA (Low-Rank Adaptation) tipo Turbo para el modelo MiniMax-H3, un modelo omni-modal de 33 000 millones de parámetros especializado en generación de vídeo y audio sincronizado. Los LoRAs han sido convertidos y optimizados para su uso directo en ComfyUI, permitiendo reducir drásticamente el número de pasos de muestreo necesarios para generar vídeo de alta calidad (de decenas de pasos a solo 4 u 8). El trabajo combina pesos derivados del repositorio oficial de LightX2V y conversiones del proyecto de Larryvrh, aplicando una compresión mediante descomposición en valores singulares (SVD) dinámica por proyección para reducir el tamaño de los adaptadores sin pérdidas significativas de fidelidad.

La relevancia actual radica en que MiniMax-H3 es uno de los pocos modelos abiertos capaces de generar vídeo con audio nativo sincronizado, y estos LoRAs Turbo hacen viable su ejecución en hardware de consumo al reducir el coste computacional de la inferencia. El repositorio incluye cinco variantes de LoRA, diferenciadas por el tipo de generación (texto a vídeo, referencia a vídeo), el número de pasos (4 u 8) y el rango dinámico aplicado (21, 28 o 64). Todos los archivos están en formato safetensors con precisión BF16 y licencia Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA sobre MiniMax-H3 (modelo base omni-modal de 33B, según repositorio GitHub) |
| Parametros totales | No disponible (los LoRAs son adaptadores de bajo rango; el tamaño de cada archivo se indica en la tabla de archivos) |
| Parametros activos | No disponible (no se especifica el número de parámetros activos de los LoRAs) |
| Longitud de contexto | No disponible (depende del modelo base MiniMax-H3) |
| Tipos de cuantizacion | BF16 (los tensores de los LoRAs están en BF16) |
| Idiomas soportados | No disponible (no se especifica en la información proporcionada) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

Archivos incluidos en el repositorio:

| Archivo | Tamaño | Uso |
|---|---|---|
| `minimax_h3_fl2v_turbo_4step_v1.0_768p_comfyui_resized_avg_rank_21_bf16.safetensors` | 284.36 MiB | Generación texto a vídeo (FL2V) en 4 pasos, resolución 768p |
| `minimax_h3_fl2v_turbo_8step_v1.0_comfyui_resized_avg_rank_21_bf16.safetensors` | 311.89 MiB | Generación texto a vídeo (FL2V) en 8 pasos, mayor calidad |
| `minimax_h3_ref2v_turbo_4step_v0.1_comfyui_resized_avg_rank_21_bf16.safetensors` | 311.79 MiB | Generación referencia a vídeo (Ref2V) en 4 pasos |
| `minimax_h3_fl2v_turbo_4step_v1.1_768p_comfyui_resized_avg_rank_64_bf16.safetensors` | 891.65 MiB | Generación FL2V en 4 pasos, rango alto (64) para mayor fidelidad |
| `minimax_h3_fl2v_turbo_4step_v1.1_768p_comfyui_resized_avg_rank_28_bf16.safetensors` | 375.55 MiB | Generación FL2V en 4 pasos, rango compacto (28) |

## Arquitectura y entrenamiento

Los LoRAs son adaptadores de bajo rango que se insertan en las capas de atención, MLP y token-refiner del modelo MiniMax-H3. El proceso de conversión aplica una compresión SVD exacta sobre los factores A y B de cada LoRA original, sin materializar las actualizaciones densas de pesos. Para cada proyección (Q, K, V, MLP, etc.) se calcula el espectro singular de la actualización efectiva `B @ A` y se selecciona un rango dinámico independiente, preservando un rango de seguridad adicional más allá del umbral de energía de Frobenius. Los factores resultantes se reequilibran como `A = sqrt(S) × Vh` y `B = U × sqrt(S)`, y las proyecciones QKV fusionadas se separan y luego se re-fusionan concatenando los factores A y usando una matriz B por bloques. La escala `alpha / rank` se hornea en `lora_B` y se eliminan los tensores alpha redundantes.

No se dispone de información sobre el entrenamiento original de los LoRAs (datos, método de optimización, etc.). El repositorio solo documenta el proceso de conversión y compresión, no el entrenamiento de los adaptadores. Los pesos fuente provienen de los repositorios de LightX2V y Larryvrh, que a su vez derivan de los pesos oficiales de MiniMax-H3 Turbo.

## Capacidades

- Aceleración de inferencia: reduce el número de pasos de muestreo de decenas a 4 u 8, manteniendo una calidad visual aceptable.
- Generación texto a vídeo (FL2V): permite crear vídeos a partir de descripciones textuales, con resolución 768p en las variantes v1.0 y v1.1.
- Generación referencia a vídeo (Ref2V): genera vídeos a partir de una imagen de referencia, útil para animar personajes o escenas estáticas.
- Audio sincronizado: el modelo base MiniMax-H3 genera audio nativo sincronizado con el vídeo, y los LoRAs Turbo preservan esta capacidad.
- Compatibilidad con ComfyUI: los adaptadores están formateados para el namespace y layout QKV de ComfyUI, listos para cargarse con el nodo `MiniMax-H3 Turbo LoRA`.
- Soporte de múltiples pasos: variantes de 4 y 8 pasos, permitiendo equilibrar velocidad y calidad.
- Compresión eficiente: los LoRAs reducidos mantienen una alta similitud coseno con los originales (superior al 97% en todos los casos) con reducciones de tamaño de hasta el 83%.

## Casos de uso

- Prototipado rápido de vídeo: un creador puede generar un vídeo conceptual de 4 segundos en 4 pasos para validar una idea antes de invertir en una generación completa. El LoRA de 4 pasos es adecuado para iteraciones rápidas en flujos de trabajo de preproducción.
- Generación de vídeo con referencia para animación: un animador puede usar el LoRA Ref2V para animar un personaje a partir de una imagen fija, manteniendo la identidad visual y añadiendo movimiento y audio sincronizado. El adaptador de 4 pasos permite probar múltiples variaciones de movimiento en una sola sesión.
- Creación de contenido para redes sociales: los vídeos cortos con audio sincronizado (por ejemplo, para TikTok o Instagram Reels) pueden generarse en 4 pasos, reduciendo el tiempo de renderizado y permitiendo una producción de alto volumen.
- Edición de vídeo con IA en ComfyUI: los LoRAs se integran en flujos de trabajo de ComfyUI existentes, permitiendo a los usuarios combinar la generación de vídeo con otros nodos de procesamiento (upscaling, interpolación, etc.) sin salir de la plataforma.
- Evaluación de calidad frente a velocidad: los LoRAs de 8 pasos ofrecen una alternativa de mayor calidad para proyectos donde el tiempo de renderizado no es crítico, como cortometrajes independientes o demostraciones técnicas.
- Investigación en generación de vídeo con audio: los adaptadores permiten a investigadores reproducir y estudiar el comportamiento del modelo MiniMax-H3 con pocos pasos, facilitando experimentos de ablación y comparación de configuraciones de muestreo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval o métricas de vídeo como FVD) en la información disponible. El repositorio proporciona únicamente métricas de validación numérica de la reconstrucción de pesos tras la compresión SVD, que se resumen a continuación:

| Medición | Ref2V 4-step (rank 21) | FL2V 4-step v1.1 (rank 64) | FL2V 4-step v1.1 (rank 28) |
|---|---|---|---|
| Similitud coseno global | 99.9190% | 99.1169% | 97.3279% |
| Error L2 relativo global | 4.0234% | 13.2601% | 22.9625% |
| Norma de Frobenius media retenida | 98.3332% | 98.1774% | 93.5945% |
| Norma de Frobenius mínima retenida | 96.4904% | 98.0817% | 92.6661% |
| Rango de proyección | 2–105 | 2–120 | 2–99 |
| Reducción de tamaño | 83.29% | 52.21% | 79.87% |

Estas métricas miden la fidelidad de la reconstrucción de pesos, no la calidad perceptual del vídeo generado. No hay datos de rendimiento en términos de latencia o throughput.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de hardware en la información disponible.
- El modelo base MiniMax-H3 tiene 33 000 millones de parámetros, por lo que la inferencia requiere una GPU con VRAM suficiente. Para ejecutar el modelo completo en BF16 se estiman al menos 66 GB de VRAM, aunque con cuantización (por ejemplo, 8 bits o 4 bits) podría reducirse a 24–32 GB.
- Los LoRAs en sí son ligeros (entre 284 MiB y 892 MiB), por lo que el cuello de botella es el modelo base, no los adaptadores.
- Se recomienda una GPU de gama alta como NVIDIA RTX 4090 (24 GB), A100 (40/80 GB) o H100 (80 GB) para una experiencia fluida. En GPUs con menos VRAM, se puede recurrir a cuantización del modelo base o a la generación en resoluciones más bajas.
- El despliegue se realiza típicamente a través de ComfyUI, que gestiona la carga del modelo y los LoRAs. También es posible usar el framework LightX2V para integraciones más personalizadas.
- No hay datos de latencia o throughput específicos para estos LoRAs.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de generación de vídeo con audio sincronizado. El repositorio no incluye comparaciones con alternativas como Stable Video Diffusion, CogVideoX o Mochi 1, y no se han encontrado datos de benchmarks que permitan una comparación objetiva. Se recomienda consultar la documentación del modelo base MiniMax-H3 para obtener referencias de rendimiento relativo.

## Limitaciones y advertencias

- Los LoRAs son conversiones comprimidas de los pesos originales; la compresión introduce una pérdida de fidelidad medida en el error L2 relativo (hasta 22.96% en la variante de rango 28). Aunque la similitud coseno es alta, puede haber diferencias perceptibles en la calidad del vídeo generado.
- No se han realizado evaluaciones de sesgos, alucinaciones o comportamientos no deseados en los LoRAs. El modelo base MiniMax-H3 puede presentar sesgos inherentes a sus datos de entrenamiento, que no han sido documentados en este repositorio.
- La generación de vídeo con audio sincronizado es computacionalmente intensiva; incluso con los LoRAs Turbo, se requiere hardware de gama alta para tiempos de generación razonables.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base MiniMax-H3 y de los pesos fuente (LightX2V, Larryvrh) para asegurar el cumplimiento de todas las restricciones.
- El repositorio no incluye documentación sobre el modelo base (arquitectura detallada, datos de entrenamiento, etc.). Para una evaluación completa, se debe consultar la documentación oficial de MiniMax-H3.
- Los LoRAs están diseñados específicamente para ComfyUI; su uso en otros entornos puede requerir conversiones adicionales de formato o namespace.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Halpak/MiniMax-H3-Turbo-Lora-ComfyUI
- Repositorio GitHub de MiniMax-H3 ComfyUI (modelo base y flujos de trabajo): https://github.com/MiniMaxH3ComfyUI/MiniMax-H3-ComfyUI
- Repositorio GitHub de Larryvrh (ComfyUI-MiniMax-H3-Turbo): https://github.com/Larryvrh/ComfyUI-MiniMax-H3-Turbo
- Documentación del nodo MiniMax-H3 Turbo LoRA en runcomfy: https://www.runcomfy.com/comfyui-nodes/ComfyUI-MiniMax-H3-Turbo/mini-max-h3-turbo-lo-ra
- Guía de uso de MiniMax H3 Turbo (minimax3.com): https://minimax3.com/tools/minimax-h3-turbo

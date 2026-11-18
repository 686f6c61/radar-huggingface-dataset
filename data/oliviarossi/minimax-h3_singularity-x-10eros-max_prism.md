# OliviaRossi/Minimax-h3_Singularity-x-10Eros-Max_PRISM

## Resumen

Minimax-h3_Singularity-x-10Eros-Max_PRISM es un merge de pesos publicado por el usuario OliviaRossi en Hugging Face. Combina dos finetunes del modelo base Minimax-H3 en su variante Ref2VA: `WarmBloodAban/Minimax-h3_Singularity` (fichero `Minimax-h3_Singularity_ref2va_v2_bf16.safetensors`) y `TenStrip/10Eros-Max` (fichero `10Eros_Max_h3_8stepTURBO_beta6/7.safetensors`, un turbo de 8 pasos). No se trata de un modelo entrenado desde cero, sino de una fusión de pesos orientada a generación de vídeo/imagen (por la naturaleza Ref2VA y por los ejemplos multimedia de la model card).

El interés del artefacto reside en el algoritmo de fusión propietario que el autor denomina PRISM, que no utiliza mergekit. Según la model card, PRISM combina descomposición SVD aleatorizada con interpolación geodésica polar, mediación de conflictos de signo y reanclaje de magnitud por filas. El repositorio ocupa 447,9 GB y acumula más de 512.000 descargas, lo que sugiere un uso intensivo dentro de la comunidad de merges de Minimax-H3.

La relevancia actual es doble: por un lado, documenta una técnica de merging alternativa a las habituales (TIES, DARE, SLERP, model stock); por otro, el autor publica variantes derivadas (PRISM+PIKA, PRISM-DMAD-PDMD) y afirma que la versión PRISM-DMAD-PDMD es la mejor "out-of-the-box" para texturas de piel realistas con 8 pasos, sin necesidad de LoRA Turbo. La licencia es "other" y hereda las condiciones de los modelos fuente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Minimax-H3, variante Ref2VA; arquitectura concreta no especificada en la información) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (fichero principal); int8 e int8HQ en variantes derivadas; w6a8_g32 en la variante de bajo VRAM |
| Idiomas soportados | no disponible |
| Licencia | other (sujeta a las licencias de los modelos fuente) |
| Formato de pesos | safetensors (fp16) |

## Arquitectura y entrenamiento

El modelo no se entrena: es un merge de pesos. La model card describe el método PRISM en cuatro etapas. Primero, una "spectral denoise": se calcula la diferencia D = B − A y se descompone mediante SVD aleatorizada en una parte estructurada L (rango ≤ 64) y un remanente difuso R, reconstruyendo B' = A + L + gamma·R con gamma adaptativo en el intervalo [0,92, 1]. Segundo, una "polar geodesic": para cada fila de salida, la dirección se interpola por SLERP y la magnitud por interpolación geométrica en dominio logarítmico. Tercero, una "sign-conflict mediation" que empuja los elementos salientes de signo opuesto hacia el ganador ponderado. Cuarto, un "magnitude re-anchor" que reescala cada fila a la norma geométrica objetivo.

Los modelos fuente son dos finetunes de Minimax-H3 Ref2VA: Singularity (en bf16) y 10Eros-Max (un turbo de 8 pasos). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en los finetunes originales. El repositorio incluye además variantes experimentales documentadas en la model card: 10Eros_Max_h3_8stepTURBO_beta7_SingularityV2_int8HQ, 10Eros_Max_h3_TURBO-hybrid_beta5_Singularity_v1.3_int8, 10Eros_Max_SingularityV2_PikaFlex_1.00_int8HQ, 10Eros_Max_SingularityV2_PikaFlex_0.85_int8HQ, 10Eros_Max_SingularityV2_PRISM2_PikaFlex_0.85_int8HQ, PRISM_DMAD_PDMD_int8 y PRISM_DMAD_PDMD_w6a8_g32.

## Capacidades

- Generación de vídeo e imagen: la variante Ref2VA y los ejemplos multimedia de la model card (ficheros MP4 de muestra) apuntan a generación visual condicionada por referencia.
- Inferencia rápida: el modelo fuente 10Eros-Max es un turbo de 8 pasos, por lo que el merge está pensado para pocos pasos de muestreo.
- Texturas realistas: el autor afirma que la variante PRISM-DMAD-PDMD ofrece "texturas de piel ultrarrealistas y nítidas" con 8 pasos y sin LoRA Turbo.
- Compatibilidad con samplers y schedulers: la model card recomienda Euler/Beta57 y un shift de 12/3 para la variante PRISM-DMAD-PDMD.
- Variantes de bajo VRAM: existe una versión w6a8_g32 pensada para GPUs con poca memoria.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, matemáticas ni multilingüismo textual.

## Casos de uso

- Generación de retratos fotorrealistas: usar PRISM_DMAD_PDMD_int8 con 8 pasos, sampler Euler/Beta57 y shift 12/3 para obtener pieles detalladas sin LoRA Turbo adicional, según la recomendación del autor.
- Prototipado rápido de vídeo condicionado por referencia: la variante Ref2VA permite partir de una imagen o clip de referencia y generar variaciones en pocos pasos, adecuado para equipos que iteran sobre storyboards.
- Despliegue en GPUs de consumo: la variante PRISM_DMAD_PDMD_w6a8_g32 está pensada explícitamente para GPUs con VRAM limitada, lo que facilita pruebas locales en tarjetas de gama media.
- Exploración de técnicas de merging: el método PRISM (SVD + SLERP + mediación de signos) sirve como referencia para investigadores que quieran reproducir o comparar estrategias de fusión frente a mergekit.
- Producción de assets para videojuegos o publicidad: la combinación de turbo de 8 pasos y texturas realistas reduce el coste por iteración en pipelines de generación de material gráfico.
- Comparación de variantes en A/B testing: el repositorio incluye múltiples merges (PIKA 1.00, PIKA 0.85, PRISM2+PIKA, DMAD-PDMD) que permiten evaluar el compromiso entre velocidad, realismo y consumo de VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye valoraciones cualitativas del autor y vídeos de muestra, sin métricas numéricas (FID, CLIP score, MMLU u otras).

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repositorio completo ocupa 447,9 GB, lo que implica que el fichero fp16 principal es de gran tamaño; las variantes int8 e int8HQ reducen el requisito aproximadamente a la mitad, y la variante w6a8_g32 está diseñada para GPUs de baja VRAM.
- GPU recomendadas: no disponibles en la información. Por el tamaño del repo y la existencia de una variante de bajo VRAM, se deduce que el fp16 requiere GPUs de datacenter (A100/H100) o varias consumer de gama alta, mientras que w6a8_g32 apunta a GPUs consumer con 8-12 GB.
- ¿Cabe en GPU consumer? La variante w6a8_g32 está pensada para ello; el fp16 probablemente no en una sola tarjeta consumer.
- Opciones de despliegue: no se especifican en la información disponible. La librería declarada es `minimax-h3`, lo que sugiere un runtime propio del ecosistema Minimax-H3 en lugar de vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles. El autor menciona 8 pasos de muestreo como configuración recomendada, lo que reduce el coste frente a schedulers de 20-50 pasos, pero no aporta cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Minimax-h3_Singularity-x-10Eros-Max_PRISM | Merge PRISM de dos finetunes Minimax-H3 Ref2VA | no disponible | no disponible | other | Hugging Face, 512.570 descargas |
| WarmBloodAban/Minimax-h3_Singularity | Finetune base (bf16) | no disponible | no disponible | no disponible | Hugging Face |
| TenStrip/10Eros-Max | Finetune turbo de 8 pasos | no disponible | no disponible | no disponible | Hugging Face |
| PRISM_DMAD_PDMD (variante del mismo autor) | Merge derivado, int8 | no disponible | no disponible | other | Incluido en el mismo repo |

No se dispone de datos de benchmarks ni de parámetros para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia "other": las condiciones concretas dependen de los modelos fuente (Singularity y 10Eros-Max); es imprescindible revisarlas antes de cualquier uso comercial.
- Al ser un merge de pesos y no un modelo entrenado, no hay garantía de coherencia interna; el comportamiento puede degradarse en dominios no cubiertos por los finetunes originales.
- La model card no documenta sesgos, tasas de alucinación ni limitaciones idiomáticas.
- El método PRISM incluye pasos heurísticos (gamma adaptativo, mediación de signos) cuyos hiperparámetros no se detallan por completo, lo que dificulta la reproducibilidad exacta.
- El tamaño del repositorio (447,9 GB) y la ausencia de información sobre cuantizaciones oficiales más allá de las variantes listadas complican el despliegue en entornos con almacenamiento limitado.
- Las recomendaciones de uso (8 pasos, Euler/Beta57, shift 12/3) son empíricas y específicas de una variante; no deben extrapolarse a otras.
- No hay información sobre el pipeline declarado (`pipeline: no disponible`), lo que puede complicar la integración con frameworks estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OliviaRossi/Minimax-h3_Singularity-x-10Eros-Max_PRISM
- Modelo base A: https://huggingface.co/WarmBloodAban/Minimax-h3_Singularity
- Modelo base B: https://huggingface.co/TenStrip/10Eros-Max
- Espejo en CivitAI: https://civitai.red/models/3019421/singularity-v2-x-10eros-max
- Vídeo de muestra PRISM_DMAD_PDMD: https://huggingface.co/OliviaRossi/Minimax-h3_Singularity-x-10Eros-Max_PRISM/resolve/main/PRISM_DMAD_PDMD.mp4
- Vídeo de muestra Pika 0.85: https://huggingface.co/OliviaRossi/Minimax-h3_Singularity-x-10Eros-Max_PRISM/resolve/main/Pika0.85Sample.mp4
- Vídeo de muestra TestMe: https://huggingface.co/OliviaRossi/Minimax-h3_Singularity-x-10Eros-Max_PRISM/resolve/main/TestMe.mp4
- Vídeo de muestra TestOfBeta7: https://huggingface.co/OliviaRossi/Minimax-h3_Singularity-x-10Eros-Max_PRISM/resolve/main/TestOfBeta7.mp4

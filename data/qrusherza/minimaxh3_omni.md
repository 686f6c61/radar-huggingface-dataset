# QrusherZA/MiniMaxH3_Omni

## Resumen

MiniMaxH3_Omni es un adaptador comunitario extraído del estudiante FastH3 Omni Ref2VA de 8 pasos, publicado por el usuario QrusherZA. No se trata de un modelo generativo autónomo, sino de un artefacto de pesos que codifica la diferencia entre el transformer Ref2VA original de MiniMax H3 y el checkpoint Omni de FastVideo, distribuido como un LoRA de rango 64 obtenido por SVD más un checkpoint de soporte con tensores copiados de forma exacta. El objetivo es permitir el estudio, la transferencia y la reconstrucción de los cambios de pesos de FastH3 Omni sin necesidad de redistribuir un transformer completo.

El paquete está pensado para desarrolladores que ya disponen de una base Ref2VA compatible y de un runtime con soporte PDD (multi-head decoding). La reconstrucción fiel exige ambos ficheros Safetensors: el adaptador r64 (0,582 GiB) y el checkpoint de soporte bf16 (3,825 GiB), con una carga combinada de aproximadamente 4,41 GiB adicionales sobre la base. La aproximación de rango 64 es experimental y el propio autor advierte que no se ha demostrado que reproduzca la calidad de salida del modelo oficial.

La relevancia actual del artefacto es fundamentalmente técnica: documenta con métricas de espacio de pesos cómo se descompone el delta de entrenamiento entre una base Ref2VA de 532 tensores y un checkpoint Omni de 582 tensores, incluyendo los cuatro tensores de salida PDD que no admiten representación como delta aditivo de igual forma. Es material de investigación sobre extracción y reconstrucción de adaptadores, no un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (base MiniMax H3 Ref2VA) con estudiante PDD de 32 cabezas de salida y compuertas de compresión VSA; el adaptador es un LoRA SVD de rango 64 más deltas exactos |
| Parámetros totales | no disponible (el adaptador no declara recuento de parámetros; se distribuye como 211 matrices de bajo rango y 93 deltas exactos) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 para los factores LoRA; BF16/FP32 mixto en el checkpoint de soporte (los tensores exactos conservan el dtype original, incluido FP32); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors (`FastH3_Omni_r64_fp16.safetensors`, `FastH3_Omni_support_bf16.safetensors`) |

## Arquitectura y entrenamiento

El artefacto no entrena nada: extrae la diferencia de pesos entre el transformer Ref2VA de MiniMax H3 (checkpoint podado BF16 de 532 tensores) y el checkpoint ComfyUI Omni de FastVideo (582 tensores). Para cada matriz elegible se calcula ΔW = W_Omni − W_Ref2VA y se aproxima como LoRA_up @ LoRA_down, con rango máximo 64 y factores almacenados en FP16. El adaptador contiene 211 candidatos SVD (200 matrices de atención/MLP del transformer principal, 8 del token-refiner y 3 de proyección), lo que suma 422 factores, más 93 deltas exactos en FP32 para tensores no compatibles con LoRA.

El checkpoint de soporte replica sin SVD ni conversión de precisión 157 tensores: 50 compuertas de compresión de atención VSA (bloques 0 a 49), la tabla de curva temporal `adaln_t_table`, 102 pesos y sesgos de proyección AdaLN (50 bloques más la capa final) y 4 pesos/sesgos de salida de vídeo y audio expandidos. Estos últimos pasan de `[96, 5376]` a `[3072, 5376]` en vídeo y de `[32, 5376]` a `[1024, 5376]` en audio, coherente con las 32 cabezas de salida del estudiante PDD, y deben instalarse como reemplazos, no como deltas. La innovación destacable es el propio método de extracción y su caracterización: la reconstrucción r64 captura el 39,78 % de la magnitud cuadrada del delta y deja un residual del 77,60 % respecto al delta original, con un error de reconstrucción del 0,21944 % relativo a los pesos Omni.

## Capacidades

- Generación de vídeo condicionada por imagen y texto (pipeline `image-text-to-video`), heredada de la base MiniMax H3 Ref2VA.
- Generación de audio sincronizado con el vídeo, según la etiqueta `synchronized-audio-video` del repositorio.
- Reconstrucción estructural del estudiante FastH3 Omni de 8 pasos a partir de una base Ref2VA compatible.
- Estudio y transferencia del delta de pesos entre la base Ref2VA y el checkpoint Omni.
- Descomposición selectiva: matrices aproximables por LoRA de rango 64 frente a tensores que requieren copia exacta.
- No incluye tool calling, function calling, razonamiento multi-paso ni modo thinking: no es un modelo de lenguaje.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Investigación sobre extracción de adaptadores: permite analizar qué proporción del delta de entrenamiento cae en el subespacio de rango 64 y cuál queda fuera, usando las métricas de residual y magnitud capturada publicadas por el autor.
- Reconstrucción de FastH3 Omni sin redistribuir el transformer completo: partiendo de una base Ref2VA compatible y aplicando el adaptador más el checkpoint de soporte, se obtiene una aproximación estructural de unos 4,41 GiB en lugar de un checkpoint íntegro.
- Auditoría de cambios de pesos: los 93 deltas exactos en FP32 y los 157 tensores de soporte permiten inspeccionar qué módulos modificó el paso de Ref2VA a Omni (AdaLN, compuertas VSA, cabezas de salida) y en qué magnitud.
- Desarrollo de runtimes PDD: los cuatro tensores de salida expandidos y la semántica de 32 cabezas sirven como caso de prueba para implementar decodificación multi-head en herramientas de inferencia.
- Estudio de compuertas VSA: las 50 compuertas de compresión de atención copiadas exactamente permiten experimentar con mecanismos de compresión de atención en modelos de difusión de vídeo.
- Docencia y reproducibilidad: el repositorio documenta el procedimiento de comparación tensor a tensor (nombres compartidos, formas coincidentes, cambios) y sirve como referencia metodológica para extraer LoRA de pares de checkpoints.
- Integración en flujos ComfyUI experimentales: aunque no es un LoRA drop-in, el adaptador está etiquetado para ComfyUI y puede alimentar herramientas de aplicación de diferencias compatibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de vídeo o audio en la información disponible. Las únicas métricas son de fidelidad en espacio de pesos, medidas sobre las 211 matrices aproximadas por SVD:

| Métrica | Resultado medido |
|---|---|
| Diferencia global Base → Omni relativa a pesos Omni | 0,28278 % |
| Error de reconstrucción r64 relativo a pesos Omni | 0,21944 % |
| Residual r64 relativo al delta original Base → Omni | 77,59953 % |
| Magnitud cuadrada del delta capturada por r64 | 39,78 % |

## Requisitos de hardware

- El adaptador y el soporte suman aproximadamente 4,41 GiB, pero requieren además una base Ref2VA compatible y el resto de componentes de inferencia; el repositorio completo ocupa 56,0 GB.
- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del transformer base y de la resolución y duración del vídeo generado.
- GPU recomendadas: no disponibles; el checkpoint fuente es BF16 y el estudiante opera en 8 pasos, lo que sugiere hardware de datacenter, pero no se documentan modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del repositorio y la necesidad de un runtime PDD hacen inviable asumir que quepa en tarjetas de consumo sin datos adicionales.
- Opciones de despliegue: se requiere un runtime con soporte PDD y capacidad de aplicar tensores `.diff`/`.diff_b`; los cargadores LoRA convencionales no consumen automáticamente esos tensores. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión de vídeo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMaxH3_Omni (este) | Adaptador LoRA r64 + checkpoint de soporte | no disponible | no aplica | minimax-h3-community-license-agreement | Hugging Face, 317 descargas |
| FastVideo/FastH3-Omni-Comfy | Checkpoint completo del estudiante Omni (base del adaptador) | no disponible | no disponible | no disponible en la información | Hugging Face |
| MiniMaxAI/MiniMax-H3 | Modelo base Ref2VA | no disponible | no disponible | minimax-h3-community-license-agreement | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones de parámetros de las alternativas en la información proporcionada, por lo que no es posible una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- No es un modelo autónomo ni un LoRA drop-in de ComfyUI: requiere reconstrucción con ambos ficheros y un runtime con soporte PDD.
- La aproximación de rango 64 es experimental y no se ha demostrado que reproduzca la calidad de salida del modelo oficial.
- El residual r64 respecto al delta original es del 77,60 %: la mayor parte del delta de entrenamiento queda fuera del subespacio de rango 64, aunque su magnitud absoluta sea pequeña (0,28 % de los pesos Omni).
- Los cuatro tensores de salida PDD no pueden expresarse como delta aditivo de igual forma y deben instalarse como reemplazos; un cargador LoRA convencional los ignorará o fallará.
- Los tensores `.diff` y `.diff_b` requieren una herramienta de aplicación compatible; no se consumen automáticamente.
- No se debe aplicar un multiplicador `alpha / rank` adicional: el producto de factores guardado ya es el delta aditivo.
- El nombre `support_bf16` indica la familia de origen, no una garantía de dtype BF16 uniforme; hay tensores en FP32.
- Licencia comunitaria MiniMax H3: es necesario revisar el acuerdo antes de cualquier uso comercial; el repositorio la marca como `other`.
- Riesgo de alucinación y sesgos: no aplica en el sentido de un LLM, pero no hay evaluación de sesgos en la generación de vídeo o audio.
- Idiomas soportados: no disponibles.
- Sin métricas perceptivas de calidad de vídeo o audio publicadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/QrusherZA/MiniMaxH3_Omni
- Modelo base MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Checkpoint fuente FastH3 Omni ComfyUI: https://huggingface.co/FastVideo/FastH3-Omni-Comfy
- Licencia MiniMax H3 Community License Agreement: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE

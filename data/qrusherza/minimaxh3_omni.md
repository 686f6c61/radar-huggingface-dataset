# QrusherZA/MiniMaxH3_Omni

## Resumen

MiniMaxH3_Omni es un adaptador de extracción comunitaria derivado de FastH3 Omni Ref2VA, el estudiante de 8 pasos destilado a partir del transformer MiniMax H3 Ref2VA. Lo publica el usuario QrusherZA y no constituye un modelo autónomo: se distribuye como dos ficheros Safetensors que, combinados, permiten reconstruir aproximadamente los cambios de pesos del checkpoint oficial FastH3 Omni ComfyUI BF16 respecto al transformer base Ref2VA. El objetivo declarado es facilitar el estudio, la transferencia y la reconstrucción de esos deltas sin redistribuir otro checkpoint completo del transformer.

El paquete contiene un adaptador LoRA de rango 64 extraído mediante SVD (211 matrices de baja jerarquía, 422 factores) más 93 diferencias exactas en FP32, y un checkpoint de soporte con 157 tensores copiados sin alteración (cabezas de salida PDD, puertas de compresión VSA y todo el subsistema AdaLN/time-curve). El payload combinado ronda los 4,41 GiB, muy por debajo de los 184,7 GB del repositorio completo, que incluye además otros artefactos.

Es relevante ahora porque ofrece una vía ligera para inspeccionar y transferir el comportamiento del estudiante FastH3 Omni (generación de vídeo con audio sincronizado, pipeline image-text-to-video) sin necesidad de manejar el checkpoint completo. Ahora bien, el propio autor advierte de que la aproximación r64 es experimental, no reproduce la calidad de salida del modelo oficial y requiere un runtime compatible con PDD tras la reconstrucción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (MiniMax H3 Ref2VA) con estudiante PDD de 32 cabezas; adaptador LoRA extraído por SVD |
| Parámetros totales | no disponible (el adaptador no es un modelo completo) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP16 (factores LoRA), BF16 y FP32 (tensores exactos); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors |
| Tamaño del adaptador | 0,582 GiB (r64) + 3,825 GiB (support) ≈ 4,41 GiB combinados |
| Tamaño del repositorio | 184,7 GB |
| Pipeline | image-text-to-video |
| Modelo base | MiniMaxAI/MiniMax-H3, FastVideo/FastH3-Omni-Comfy |

## Arquitectura y entrenamiento

El adaptador se construye comparando un checkpoint MiniMax H3 Ref2VA podado en BF16 (532 tensores) con el checkpoint oficial ComfyUI Omni de 8 pasos (582 tensores). Para cada matriz elegible se calcula el delta objetivo menos base (ΔW = W_Omni − W_Ref2VA) y se aproxima como producto de dos factores LoRA (LoRA_up @ LoRA_down) con rango máximo 64. Se extraen 211 candidatos SVD: 200 matrices de atención/MLP del transformer principal, 8 matrices del token-refiner y 3 matrices de proyección. Los tensores que no admiten representación LoRA se guardan como diferencias aditivas exactas en FP32 (93 tensores).

El checkpoint de soporte replica sin conversión 157 tensores: 50 puertas de compresión de atención VSA (bloques 0–49), la tabla `adaln_t_table`, 102 pesos y sesgos AdaLN (50 bloques más capa final) y 4 pesos/sesgos de salida de vídeo y audio expandidos. El estudiante PDD tiene 32 cabezas de salida, lo que explica los cambios de forma en `final_layer.video_out` (de [96, 5376] a [3072, 5376]) y `final_layer.audio_out` (de [32, 5376] a [1024, 5376]); estos cuatro tensores no pueden expresarse como delta LoRA de misma forma y deben instalarse como reemplazos. No se documentan datos de entrenamiento, número de tokens ni procesos de RLHF/DPO en la información disponible.

## Capacidades

- Generación de vídeo a partir de imagen y texto (image-text-to-video) mediante el pipeline FastH3 Omni.
- Generación de audio sincronizado con el vídeo (synchronized-audio-video), con cabezas de salida separadas para vídeo y audio.
- Inferencia destilada en 8 pasos (student de FastH3 Omni).
- Transferencia y estudio de deltas de pesos entre checkpoints (Ref2VA → Omni) mediante LoRA r64.
- Reconstrucción estructural del checkpoint Omni combinando adaptador y checkpoint de soporte.
- Compatibilidad declarada con ComfyUI a través del ecosistema FastH3 Omni Comfy.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo.

## Casos de uso

- Estudio académico de deltas de pesos: investigadores pueden analizar qué matrices cambian entre Ref2VA y Omni y en qué magnitud, usando los 211 factores LoRA y los 93 deltas exactos como material de análisis sin descargar el transformer completo.
- Transferencia de comportamiento a otros checkpoints: el adaptador r64 permite aplicar experimentalmente los cambios de Omni sobre una base Ref2VA compatible, siempre que se cuente con un runtime PDD.
- Reconstrucción fiel del checkpoint Omni: combinando ambos ficheros con una base Ref2VA compatible se obtiene una reconstrucción estructural que sirve para validar pipelines de conversión y carga.
- Auditoría de licencias y distribución: al pesar 4,41 GiB frente a los 184,7 GB del repo completo, facilita la inspección de los tensores modificados en entornos con restricciones de almacenamiento.
- Desarrollo de herramientas de carga LoRA personalizadas: los tensores `.diff` y `.diff_b` exigen cargadores que los consuman explícitamente, por lo que el paquete sirve como caso de prueba para implementar soporte de deltas aditivos.
- Integración en flujos ComfyUI experimentales: para usuarios que ya trabajan con FastH3 Omni Comfy y quieren probar variantes de reconstrucción sin manejar el checkpoint BF16 completo.
- Validación de métricas de fidelidad en espacio de pesos: los valores medidos (error de reconstrucción r64 del 0,21944 % respecto a Omni, residual del 77,59953 % respecto al delta original) permiten calibrar metodologías de evaluación de adaptadores de baja jerarquía.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta métricas de fidelidad en espacio de pesos, no métricas perceptivas de vídeo o audio:

| Métrica (solo matrices SVD) | Resultado medido |
|---|---|
| Diferencia Base → Omni respecto a pesos Omni | 0,28278 % |
| Error de reconstrucción r64 respecto a pesos Omni | 0,21944 % |
| Residual r64 respecto al delta Base → Omni original | 77,59953 % |
| Magnitud del delta capturada por r64 (cuadrática) | 39,78 % |

## Requisitos de hardware

- VRAM estimada para el adaptador: los 4,41 GiB combinados son ligeros, pero la inferencia requiere además una base Ref2VA compatible y el resto de componentes del pipeline, cuyo consumo no se detalla.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; depende del checkpoint base y del runtime PDD.
- Opciones de despliegue: se requiere un runtime compatible con PDD; el ecosistema declarado es ComfyUI con FastH3 Omni Comfy. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un pipeline de difusión de vídeo).
- Latencia y throughput: no disponible. El estudiante está destilado a 8 pasos, lo que reduce el coste de muestreo frente a un modelo no destilado, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMaxH3_Omni (este) | Adaptador LoRA r64 + support | ≈4,41 GiB | no disponible | minimax-h3-community-license-agreement | Hugging Face, 1138 descargas |
| FastVideo/FastH3-Omni-Comfy | Checkpoint estudiante 8 pasos BF16 | no disponible | no disponible | no disponible en la información | Hugging Face |
| MiniMaxAI/MiniMax-H3 | Modelo base Ref2VA | no disponible | no disponible | minimax-h3-community-license-agreement | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo ni un LoRA drop-in para ComfyUI: requiere ambos ficheros y una base Ref2VA compatible para una reconstrucción fiel.
- La aproximación r64 es experimental y no se ha demostrado que reproduzca la calidad de salida del modelo oficial.
- El residual r64 respecto al delta original es del 77,59953 %: la mayor parte del delta distribuido queda fuera del subespacio de rango 64, aunque el error absoluto respecto a los pesos Omni sea pequeño (0,21944 %).
- Los tensores `.diff` y `.diff_b` no los consumen los cargadores LoRA convencionales; se necesita una herramienta compatible.
- No aplicar un multiplicador `alpha / rank` adicional salvo que el cargador lo compense explícitamente.
- Los cuatro tensores de salida PDD no pueden expresarse como delta aditivo de misma forma y deben instalarse como reemplazos; el runtime debe entender la decodificación multi-cabeza de PDD.
- La inferencia tras la reconstrucción exige un runtime compatible con PDD.
- Licencia comunitaria MiniMax H3: conviene revisar los términos para uso comercial antes de desplegar.
- Riesgo de sesgos y alucinaciones: no documentado en la información disponible.
- Idiomas soportados: no disponible.

## Enlaces

- [Hugging Face — QrusherZA/MiniMaxH3_Omni](https://huggingface.co/QrusherZA/MiniMaxH3_Omni)
- [Modelo base — MiniMaxAI/MiniMax-H3](https://huggingface.co/MiniMaxAI/MiniMax-H3)
- [Checkpoint de origen — FastVideo/FastH3-Omni-Comfy](https://huggingface.co/FastVideo/FastH3-Omni-Comfy)
- [Licencia — minimax-h3-community-license-agreement](https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE)

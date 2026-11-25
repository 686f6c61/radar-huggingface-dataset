# OliviaRossi/Minimax-H3-Sulphur3-10Erosmax-SingularityV2-TriPrism-TurboFusion

## Resumen

Minimax-H3-Sulphur3-10Erosmax-SingularityV2-TriPrism-TurboFusion es un modelo de difusion para generacion de video (text-to-video e image-to-video) publicado por el usuario OliviaRossi en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una fusion experimental de tres checkpoints derivados de MiniMax-H3 mediante una tecnica propia denominada Tri-PRISM, que combina reduccion espectral de ruido, SLERP hiperesferico a tres bandas, mediacion de conflictos de signo y reanclaje de magnitud por filas. Sobre esa base se han horneado dos LoRA: LightX2V Turbo-Fusion de 8 pasos y el MMH3 Realism Slider.

El resultado es un checkpoint pruned para ComfyUI en BF16 (con proyecciones AdaLN rank-8 en FP32) y una variante INT8 ConvRot nativa, pensada para reducir el coste de VRAM en inferencia. El repositorio ocupa 61,4 GB y esta etiquetado con pipeline image-to-video, lo que lo situa en la categoria de modelos de generacion de video con acondicionamiento por imagen de referencia.

Su relevancia es acotada y experimental: se publica como prueba de concepto de tecnicas de merge espectral aplicadas a un modelo de video grande, con 0 descargas y 11 likes en el momento de la consulta. Hereda la MiniMax H3 Community License, lo que condiciona fuertemente su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion derivado de MiniMax-H3 (merge de checkpoints, no disponible el detalle interno de la red) |
| Parametros totales | no disponible (el checkpoint base Singularity V2 referenciado pesa 66,28 GB en BF16) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (pruned, AdaLN rank-8 en FP32) e INT8 ConvRot (`int8_tensorwise`, `convrot_groupsize=256`, 200 lineales de bloque cuantizadas, error L2 relativo medio 0,936 %) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license (hereda tambien las licencias de los modelos y LoRA de origen) |
| Formato de pesos | safetensors (BF16 e INT8), pensado para ComfyUI |

## Arquitectura y entrenamiento

El modelo no se entrena en el sentido convencional: es una fusion por pesos de tres checkpoints derivados de MiniMax-H3. La receta declarada incluye `SulphurAI/Sulphur-3` (s3.safetensors), `TenStrip/10Eros-Max` en su variante 8stepTurbo hybrid y `WarmBloodAban/Minimax-h3_Singularity` en su variante ref2va v2 BF16, un checkpoint completo de 66,28 GB que se pliega en una base AdaLN compartida de rango 8. La tecnica Tri-PRISM aplica reduccion espectral de ruido, SLERP hiperesferico a tres bandas, mediacion de conflictos de signo entre tensores y reanclaje de magnitud por filas para evitar la deriva de escala tras la interpolacion.

Sobre la base fusionada se aplican secuencialmente dos LoRA con fuerza fija: `lightx2v/Minimax-H3-Turbo-Fusion` (variante ref2v turbo fusion 8step v1.0 para ComfyUI) a peso 1.0, que habilita la inferencia en 8 pasos, y `MMH3-RealismSlider-V1` a peso 1.5, orientado a sesgar la estetica hacia mayor realismo. El checkpoint resultante se poda para uso en ComfyUI y se ofrece tambien en una cuantizacion INT8 ConvRot propia, con telemetria por capa en `merge_report.json`. No se documentan datos de entrenamiento, numero de tokens, composicion del dataset ni procesos de RLHF o DPO, ya que el modelo no entrena sobre datos nuevos.

## Capacidades

- Generacion de video a partir de texto (text-to-video) e imagen (image-to-video), con el pipeline declarado como image-to-video.
- Acondicionamiento por imagen de referencia (`ref2va`), heredado de la variante Singularity V2.
- Inferencia acelerada en 8 pasos gracias a la LoRA LightX2V Turbo-Fusion horneada, con ajustes recomendados de Euler, flow shift de video 12 y flow shift de audio 3.
- Control de estetica y realismo mediante el MMH3 Realism Slider integrado a peso 1.5.
- Soporte de audio implicito en los parametros de flow shift de audio, aunque no se detalla la naturaleza de la salida de audio.
- Ejecucion nativa en ComfyUI con INT8 ConvRot (requiere ComfyUI >= v0.27.0).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multilingue textual.

## Casos de uso

- Prototipado de pipelines de video generativo en ComfyUI: el checkpoint se carga directamente con `UNETLoader` desde `ComfyUI/models/diffusion_models/`, lo que permite integrarlo en flujos de trabajo existentes sin conversion adicional.
- Investigacion sobre tecnicas de merge de modelos: el `merge_report.json` con telemetria por capa de Tri-PRISM y de cuantizacion sirve para estudiar el efecto del plegado AdaLN rank-8 y la mediacion de conflictos de signo en modelos de gran tamano.
- Evaluacion de cuantizacion INT8 en difusion de video: la variante ConvRot con error L2 relativo medio de 0,936 % permite medir la perdida de calidad frente a BF16 en un mismo prompt y configuracion.
- Generacion de clips cortos con estetica realista: el Realism Slider a 1.5 y los ejemplos de piel publicados en la model card apuntan a primeros planos y material con detalle facial.
- Image-to-video para animar referencias estaticas: la herencia `ref2va` de Singularity V2 permite partir de una imagen y generar movimiento condicionado.
- Pruebas de inferencia de bajo numero de pasos: con 8 pasos y Euler se puede medir latencia y throughput en hardware consumer frente a configuraciones de mas pasos.
- Benchmarking interno de merges experimentales: util como linea base para comparar futuras iteraciones de Tri-PRISM sobre la misma familia MiniMax-H3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint base Singularity V2 en BF16 pesa 66,28 GB, por lo que la variante BF16 pruned del repositorio (61,4 GB de repo total) requiere del orden de 60 GB o mas de VRAM para cargarse completa; la variante INT8 ConvRot reduce aproximadamente a la mitad el peso de las 200 lineales cuantizadas, aunque no se especifica el tamano final del archivo.
- GPU recomendadas: para BF16, A100 80 GB o H100 80 GB; para INT8, tarjetas de 40-48 GB como A6000, L40S o A100 40 GB, segun el peso efectivo tras cuantizar.
- GPU consumer: no cabe en RTX 4090 (24 GB) en ninguna de las dos variantes segun los tamanos declarados; se requeriria offloading a RAM del sistema o cuantizaciones adicionales no publicadas.
- Despliegue: ComfyUI >= v0.27.0 con `UNETLoader` es la unica via documentada; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo de difusion de video.
- Latencia y throughput: no disponibles; la configuracion de 8 pasos con Euler y flow shift 12/3 es la recomendada por el autor para minimizar coste.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Minimax-H3-Sulphur3-10Erosmax-SingularityV2-TriPrism-TurboFusion | no disponible (repo 61,4 GB) | no disponible | sin benchmarks publicados | minimax-h3-community-license | Hugging Face, 0 descargas |
| MiniMaxAI/MiniMax-H3 (base) | no disponible | no disponible | no disponible en la informacion | minimax-h3-community-license | Hugging Face |
| SulphurAI/Sulphur-3 | no disponible | no disponible | no disponible en la informacion | no disponible | Hugging Face |
| TenStrip/10Eros-Max (8stepTurbo) | no disponible | no disponible | no disponible en la informacion | no disponible | Hugging Face |
| WarmBloodAban/Minimax-h3_Singularity (ref2va v2) | 66,28 GB en BF16 | no disponible | no disponible en la informacion | no disponible | Hugging Face |

## Limitaciones y advertencias

- Modelo experimental de merge, no un entrenamiento validado: no hay evaluacion cuantitativa publicada de calidad, coherencia temporal ni fidelidad al prompt.
- 0 descargas y 11 likes en el momento de la consulta: sin validacion por parte de la comunidad.
- Licencia MiniMax H3 Community License, que restringe el uso comercial y obliga a revisar tambien las licencias de Sulphur-3, 10Eros-Max, Singularity y las dos LoRA horneadas antes de cualquier despliegue.
- La cuantizacion INT8 ConvRot introduce un error L2 relativo medio de 0,936 % por capa; el impacto agregado en calidad visual no esta medido.
- Requiere ComfyUI >= v0.27.0 para INT8 ConvRot nativo; versiones anteriores no cargaran esa variante.
- No se documentan idiomas soportados ni sesgos conocidos; al ser un modelo de video, los sesgos se manifestarian en la representacion visual de personas y escenas, sin analisis publicado.
- Riesgo de artefactos propios de merges por interpolacion de pesos (conflictos de signo, deriva de escala) pese al reanclaje de magnitud por filas.
- El uso de LoRA de realismo y turbo horneadas a pesos fijos elimina la capacidad de ajustar esos efectos sin re-fusionar el checkpoint.
- No apto para produccion sin evaluacion previa: sin benchmarks, sin documentacion de datos y sin garantias de estabilidad entre prompts.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OliviaRossi/Minimax-H3-Sulphur3-10Erosmax-SingularityV2-TriPrism-TurboFusion
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Sulphur-3: https://huggingface.co/SulphurAI/Sulphur-3
- 10Eros-Max: https://huggingface.co/TenStrip/10Eros-Max
- Minimax-h3_Singularity: https://huggingface.co/WarmBloodAban/Minimax-h3_Singularity
- LoRA LightX2V Turbo-Fusion: https://huggingface.co/lightx2v/Minimax-H3-Turbo-Fusion
- ComfyUI: https://github.com/comfyanonymous/ComfyUI

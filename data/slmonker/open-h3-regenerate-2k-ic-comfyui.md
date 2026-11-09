# slmonker/Open-H3-Regenerate-2K-IC-ComfyUI

## Resumen

Open-H3-Regenerate-2K-IC-ComfyUI es una conversión al formato de ComfyUI del LoRA oficial Open-H3-Regenerate-2K-IC, un adaptador de refinado y superresolución de vídeo desarrollado por el equipo Efficient-Large-Model para el transformer de referencia (`transformer_ref`) del modelo de vídeo MiniMax-H3. El LoRA original se distribuye en formato Diffusers/PEFT y este repositorio lo transforma a la disposición de pesos fusionada que espera ComfyUI, de modo que pueda cargarse directamente como un nodo de LoRA sobre el modelo base MiniMax-H3 en flujos de trabajo de vídeo a vídeo.

El adaptador resuelve un problema concreto: elevar un borrador de vídeo generado a 768P hasta 2560×1440 (2K) manteniendo coherencia temporal y de identidad. Para ello se combina con otros dos adaptadores (HyperFlow de 8 pasos y LMS Sharp) y con el upscaler latente 3D oficial de MiniMax-H3, dentro de un pipeline de refinado por etapas que reutiliza el vídeo original como condición.

El repositorio lo publica el usuario slmonker como conversión comunitaria independiente, no oficial, y no incluye pesos del modelo base: solo el adaptador en BF16 (5,9 GB). Es relevante para quienes trabajan con MiniMax-H3 en ComfyUI y necesitan un flujo reproducible de superresolución de vídeo con audio preservado, sin depender de scripts de Diffusers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el transformer de MiniMax-H3 (`transformer_ref`) |
| Parametros totales | no disponible (adaptador LoRA; rango de origen 384, 624 tensores) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (único formato publicado en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community (licencia comunitaria de MiniMax-H3) |
| Formato de pesos | safetensors (`minimax_h3_open_regenerate_2k_ic_comfy_bf16.safetensors`) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo completo. El fichero original apunta a las claves Diffusers/PEFT `transformer.<module>.lora_A.weight` y `transformer.<module>.lora_B.weight` del `transformer_ref` de MiniMax-H3. La conversión remapea esas 312 capas lineales de origen a 208 módulos fusionados de ComfyUI: las proyecciones q/k/v se agrupan en `qkv_proj` con matriz B en bloque diagonal, y la proyección SwiGLU de `ff.net.0.proj` se reordena de la disposición Diffusers `[value;gate]` a la disposición ComfyUI `[gate;value]`. El escalado alpha se fija en `3 × rank` para el qkv fusionado y en `rank` para el resto de módulos, con dtype de salida BF16 y escala de origen 1.0. El resultado son 624 tensores con rango de origen 384.

No se dispone de información sobre el dataset de entrenamiento del LoRA original, el número de pasos, la composición de datos ni si hubo etapas de preferencia (RLHF/DPO). El repositorio tampoco documenta innovaciones de decodificación propias; su aportación es exclusivamente de interoperabilidad: permite ejecutar el adaptador en ComfyUI sin reentrenar ni convertir manualmente. Todos los pesos destino existen en `minimax_h3_ref2va_bf16.safetensors`, lo que garantiza la compatibilidad de claves con el modelo base.

## Capacidades

- Refinado y superresolución de vídeo: eleva un borrador de 768P a 2560×1440 conservando detalle fino y coherencia temporal.
- Vídeo a vídeo condicionado por el clip original (Ref2VA), reutilizando el borrador como referencia.
- Integración en pipelines por etapas: borrador 768P, upscaler latente 3D oficial, rejilla de sigma `up3`, HyperFlow + LMS Sharp + este LoRA de identidad/coherencia (IC).
- Preservación de audio: el flujo de ejemplo remultiplexa el audio del borrador original tras el refinado.
- Compatibilidad con el ecosistema ComfyUI mediante nodos y workflow JSON incluidos en el repositorio complementario.
- Orden de carga definido: HyperFlow 8 pasos, LMS r64 y este IC LoRA.
- No soporta tool calling, function calling, agentes ni razonamiento multi-turno: es un adaptador de generación de vídeo, no un modelo de lenguaje.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Superresolución de borradores generados: partiendo de un clip MiniMax-H3 a 768P, aplicar este LoRA en la etapa de refinado para obtener 2560×1440 con el workflow `open_h3_regenerate_2k_ic.json`, reduciendo el coste frente a generar directamente en 2K.
- Producción de vídeo publicitario o de redes: generar un borrador rápido y barato, revisarlo y solo refinar a 2K los clips aprobados, manteniendo el audio original sincronizado.
- Restauración y mejora de material de archivo: usar el modo vídeo a vídeo con el clip fuente como condición para aumentar resolución y nitidez sin perder la identidad visual del original.
- Previsualización y entrega en dos niveles: un pipeline entrega primero el borrador 768P para revisión y, tras la validación, ejecuta el refinado 2K con este adaptador.
- Integración en estudios con ComfyUI: equipos que ya trabajan con nodos de ComfyUI pueden incorporar el flujo de refinado sin migrar a Diffusers, colocando el fichero en `ComfyUI/models/loras/` y respetando el orden de carga.
- Iteración de investigación en superresolución de vídeo: sirve como pieza de referencia (IC LoRA) para comparar estrategias de refinado con rejilla de sigma `up3` y distintos schedulers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio solo contiene el adaptador (5,9 GB en BF16). El consumo real lo determina el modelo base MiniMax-H3 y la resolución de salida (2560×1440), no el LoRA.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; el refinado a 2560×1440 sobre un transformer de vídeo completo hace poco probable que quepa en GPUs de consumo sin cuantización o descarga a CPU, pero no hay datos confirmados.
- Opciones de despliegue: ComfyUI (librería declarada), con el node pack `ComfyUI-OpenH3Regenerate2KIC`; el flujo requiere además `minimax_h3_hyperflow_8step_v1.0_comfyui_bf16.safetensors`, `minimax_h3_lms_v1.0_r64.safetensors` y `minimax_h3_ref2va_bf16.safetensors`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Open-H3-Regenerate-2K-IC-ComfyUI (este) | LoRA de refinado de vídeo para MiniMax-H3, formato ComfyUI | no disponible (rango 384, 624 tensores) | no disponible | minimax-h3-community | Hugging Face, 0 descargas |
| Open-H3-Regenerate-2K-IC (oficial, Efficient-Large-Model) | LoRA de refinado de vídeo para MiniMax-H3, formato Diffusers/PEFT | no disponible | no disponible | minimax-h3-community | Hugging Face |
| MiniMax-H3 (base) | Modelo generativo de vídeo/audio | no disponible | no disponible | minimax-h3-community | Hugging Face |
| HyperFlow 8 pasos / LMS Sharp (adaptadores complementarios) | LoRA/aceleradores del mismo pipeline | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autónomo: requiere el modelo base MiniMax-H3 y los otros dos LoRA en el orden indicado; sin ellos no genera nada.
- Solo se publica en BF16; no hay versiones cuantizadas (GGUF, FP8, etc.) en este repositorio.
- El pipeline está pensado para 768P → 2560×1440 con la rejilla de sigma `up3` por defecto; otros valores de sigma o resoluciones no están documentados.
- Licencia `minimax-h3-community`: es necesario revisar el LICENSE de MiniMax-H3 antes de cualquier uso comercial; el repositorio incluye los ficheros LICENSE y NOTICE upstream.
- Conversión comunitaria no oficial: no es un producto de MiniMax y no hay garantía de soporte ni de mantenimiento.
- Riesgo de artefactos o alucinación visual en el refinado: al ser un adaptador de superresolución, puede inventar detalle fino en texturas, rostros o texto en pantalla; conviene revisar los clips antes de publicarlos.
- Sin datos sobre sesgos, idiomas o evaluación cualitativa; el repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia de uso en producción.
- El SHA256 del fichero es `a0c93dce50d9034cc084073b6c095d09ff25ad02351ac4d4f10113d67ae64ab3`; verificar la integridad tras la descarga.

## Enlaces

- Hugging Face: https://huggingface.co/slmonker/Open-H3-Regenerate-2K-IC-ComfyUI
- LoRA original: https://huggingface.co/Efficient-Large-Model/Open-H3-Regenerate-2K-IC
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Node pack y workflows: https://github.com/slmonker/ComfyUI-OpenH3Regenerate2KIC
- Proyecto upstream: https://github.com/NVlabs/Sana/tree/sol-engine/models/Open-H3-Regenerate-2K/IC
- Ejemplo T2VA (inglés): https://github.com/slmonker/ComfyUI-OpenH3Regenerate2KIC/blob/main/examples/T2VA/README.md
- Ejemplo T2VA (chino): https://github.com/slmonker/ComfyUI-OpenH3Regenerate2KIC/blob/main/examples/T2VA/README.zh-CN.md
- Workflow T2VA: https://github.com/slmonker/ComfyUI-OpenH3Regenerate2KIC/blob/main/examples/T2VA/regen2k_ic_T2VA.json

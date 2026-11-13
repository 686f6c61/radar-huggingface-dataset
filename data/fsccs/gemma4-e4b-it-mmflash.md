# FSCCS/Gemma4-E4B-it-MMFlash

## Resumen

Gemma4-E4B-it-MMFlash es un modelo borrador (draft model) para decodificación especulativa sobre `google/gemma-4-E4B-it`, desarrollado por el usuario FSCCS. No es un modelo de lenguaje autónomo: se acopla al modelo objetivo en un servidor de decodificación especulativa (SGLang con algoritmo `DFLASH`) para acelerar la generación tanto en entradas de texto como de imagen. Su función es proponer bloques de tokens que el modelo objetivo verifica en un único forward pass, reduciendo el coste por token generado.

Técnicamente se apoya en la arquitectura DFlash de block-diffusion drafting del proyecto z-lab/dflash. El borrador lee los hidden states de cinco capas del modelo objetivo (capas 1, 10, 20, 30 y 39 de 42) y propone un bloque de 16 tokens en un solo forward pass. La variante MMFlash conserva esa arquitectura y añade entrenamiento sobre datos multimodales con una pérdida ponderada por puntuaciones de visual-grounding (visual-KL) por token.

El modelo tiene 537,4 millones de parámetros en bf16 (1,1 GB de repositorio) y se distribuye con licencia Apache 2.0. Es relevante para equipos que ya sirven Gemma 4 E4B en producción y quieren reducir la latencia de decodificación sin cambiar el modelo objetivo ni la calidad de salida, ya que la verificación recae siempre en el modelo grande.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer borrador basado en DFlash (block-diffusion drafting) con lectura de hidden states del modelo objetivo |
| Parametros totales | 537.427.200 (537M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo objetivo | google/gemma-4-E4B-it |
| Tamano de bloque | 16 tokens |
| Capas objetivo leidas | 1, 10, 20, 30, 39 (de 42) |
| Modalidades | texto e imagen |

## Arquitectura y entrenamiento

El modelo sigue el esquema DFlash de block-diffusion drafting: en lugar de generar tokens de uno en uno, el borrador consume los hidden states de cinco capas intermedias y finales del modelo objetivo y emite un bloque completo de 16 tokens en un único forward pass. El modelo objetivo verifica después ese bloque también en un solo forward pass, aceptando el prefijo correcto y corrigiendo el resto. Esta formulación reduce el número de pasos secuenciales respecto a la decodificación autorregresiva estándar y mantiene la distribución de salida del modelo grande.

La variante MMFlash introduce entrenamiento multimodal: el borrador se entrena sobre datos de imagen y texto, y la función de pérdida se pondera por token según puntuaciones de visual-grounding (visual-KL), de modo que el borrador presta más atención a los tokens donde la evidencia visual es determinante. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO. El modelo se distribuye con la marca `inference: false`, lo que confirma que no está pensado para uso autónomo.

## Capacidades

- Aceleración de decodificación especulativa sobre `google/gemma-4-E4B-it` con bloques de 16 tokens.
- Soporte de entradas multimodales: texto e imagen, con ponderación específica para grounding visual.
- Integración con SGLang mediante el algoritmo `DFLASH` y el flag `--speculative-dflash-block-size 16`.
- Lectura de hidden states de cinco capas del modelo objetivo para condicionar las propuestas.
- No realiza generación autónoma, tool calling, razonamiento multi-paso ni funciones de agente por sí mismo: esas capacidades pertenecen al modelo objetivo.
- Idiomas soportados: no disponible (heredados del modelo objetivo, no documentados en esta ficha).

## Casos de uso

- Servido de Gemma 4 E4B con baja latencia: desplegar el par objetivo-borrador en SGLang con `--speculative-algorithm DFLASH` para reducir el tiempo por token en cargas interactivas, manteniendo la calidad del modelo grande gracias a la verificación.
- Asistentes multimodales en producción: en aplicaciones de pregunta-respuesta sobre imágenes, el borrador entrenado con visual-KL propone bloques donde el grounding visual es relevante, acelerando respuestas sin degradar la fidelidad al contenido de la imagen.
- Chat multi-turno con imágenes: al reducir el coste por token generado, se abarata el servido de conversaciones largas que alternan texto e imágenes en el mismo contexto.
- Reducción de coste en GPU: al disminuir el número de forward passes del modelo objetivo por token aceptado, se puede aumentar el throughput por GPU en despliegues con presupuesto ajustado.
- Evaluación comparativa de técnicas de decodificación especulativa: sirve como referencia para medir tasas de aceptación de bloques DFlash frente a otros borradores en cargas multimodales.
- Pipelines de documentación con OCR asistido: para tareas de descripción o extracción de información desde imágenes, la aceleración permite procesar lotes mayores en el mismo tiempo de servicio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM del borrador: aproximadamente 1,1 GB en bf16 (537M parámetros), adicional a la memoria del modelo objetivo.
- VRAM total: la del modelo objetivo `google/gemma-4-E4B-it` más el borrador y el overhead de SGLang; el comando de referencia fija `--mem-fraction-static 0.7`.
- GPU recomendadas: no disponible de forma explícita; el despliegue de referencia usa backend de atención Triton y SDPA para multimodal, compatible con GPUs de datacenter tipo A100/H100 y, presumiblemente, con GPUs consumer de gama alta con VRAM suficiente para el modelo objetivo.
- ¿Cabe en GPU consumer? El borrador sí (1,1 GB); la viabilidad global depende del modelo objetivo, no documentada aquí.
- Opciones de despliegue: SGLang con `--speculative-algorithm DFLASH` (soporte oficial documentado). La model card menciona también vLLM, aunque el fragmento disponible está truncado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FSCCS/Gemma4-E4B-it-MMFlash | 537M | no disponible | Borrador especulativo multimodal para Gemma 4 E4B | Apache 2.0 | Hugging Face |
| Borrador DFlash estandar (z-lab/dflash) | no disponible | no disponible | Borrador especulativo solo texto | no disponible | GitHub z-lab/dflash |
| Borrador EAGLE / EAGLE-3 (referencia general) | no disponible | no disponible | Borrador especulativo para distintos objetivos | no disponible | Repositorios de investigación |

No se dispone de datos de rendimiento comparativos entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: la marca `inference: false` y la propia model card indican que solo funciona emparejado con `google/gemma-4-E4B-it` en un servidor de decodificación especulativa.
- Dependencia estricta del modelo objetivo: los hidden states de las capas 1, 10, 20, 30 y 39 deben coincidir; usar otra revisión o fine-tune del objetivo puede invalidar el borrador.
- Requiere SGLang con soporte `DFLASH` y variables de entorno específicas (`SGLANG_GEMMA_OUT_OF_PLACE_POSITION_MUTATION`, `SGLANG_ENABLE_OVERLAP_PLAN_STREAM`); no es un despliegue estándar de `transformers`.
- La tasa de aceptación de bloques no está documentada; el beneficio real de latencia depende del hardware, la carga y la distribución de las entradas.
- Riesgo de alucinación: el borrador no genera la salida final, pero una baja tasa de aceptación puede aumentar el coste sin mejorar la calidad; la verificación del objetivo mitiga el riesgo de salidas incorrectas.
- Sesgos: no documentados en la información disponible; heredables del modelo objetivo.
- Idiomas y contexto: no documentados para el borrador.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar los términos del modelo base `google/gemma-4-E4B-it`, que pueden imponer condiciones adicionales.
- El modelo se publicó en noviembre de 2026 con muy pocas descargas (6) y 1 like; no hay evidencia de uso en producción ni validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/FSCCS/Gemma4-E4B-it-MMFlash
- Modelo objetivo: https://huggingface.co/google/gemma-4-E4B-it
- Repositorio DFlash (z-lab): https://github.com/z-lab/dflash
- Contacto del autor: fscnkucs@gmail.com

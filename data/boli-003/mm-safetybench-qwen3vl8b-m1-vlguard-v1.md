# boli-003/mm-safetybench-qwen3vl8b-m1-vlguard-v1

## Resumen

`mm-safetybench-qwen3vl8b-m1-vlguard-v1` es un adaptador LoRA de rango 16 publicado por el usuario boli-003 en HuggingFace, diseñado para el proyecto de evaluación de seguridad multimodal MM-SafetyBench. No se trata de un modelo autónomo, sino de un adaptador PEFT que debe cargarse sobre la revisión exacta del modelo base Qwen/Qwen3-VL-8B-Instruct (revisión `0c351dd01ed87e9c1b53cbc748cba10e6187ff3b`). El adaptador se etiqueta como "M1" dentro de un pipeline de evaluación que incluye un revisor visual congelado separado denominado "M3".

El propósito declarado es servir como artefacto reproducible para evaluación de seguridad en entornos multimodales, no para despliegue en producción. El repositorio incluye hashes SHA-256 del árbol de contenido del modelo base, del archivo `adapter_model.safetensors` y del `adapter_config.json`, lo que permite verificar la integridad del artefacto. El entrenamiento original está congelado y no se distribuyen ni los datos de entrenamiento ni los scripts.

La relevancia de esta ficha es limitada: se trata de un artefacto de investigación con 13 descargas y 0 likes, sin benchmarks publicados en la información disponible, sin model card detallada más allá de los metadatos de integridad y con un pipeline no especificado. Su interés radica en la trazabilidad de artefactos de seguridad multimodal y en la posibilidad de reproducir evaluaciones sobre Qwen3-VL-8B-Instruct.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Qwen3-VL-8B-Instruct |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-VL-8B-Instruct, no especificada en la información) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantización depende del modelo base) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 (sujeta a la licencia del modelo base) |
| Formato de pesos | safetensors (`adapter_model.safetensors`) + `adapter_config.json` |
| Rango LoRA / alpha | 16 / 32 |
| Modulos objetivo | `v_proj`, `k_proj`, `o_proj`, `q_proj` |
| Modelo base | Qwen/Qwen3-VL-8B-Instruct (revision `0c351dd01ed87e9c1b53cbc748cba10e6187ff3b`) |
| Tamano del repo | 0.1 GB |
| Libreria | peft |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con alpha 32 aplicado exclusivamente a las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) del modelo base Qwen3-VL-8B-Instruct. No se modifican las capas MLP ni las proyecciones del codificador visual según la información disponible. El modelo base es un transformer multimodal con capacidades de visión y lenguaje, pero la model card no detalla su arquitectura interna (número de capas, dimensión oculta, mecanismo de atención, etc.).

No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. La model card indica explícitamente que los datos de entrenamiento y los scripts no están incluidos y que el entrenamiento está congelado. Tampoco se documenta ninguna innovación técnica destacable (decodificación especulativa, atención lineal, etc.). El proyecto menciona un componente "M3" como revisor visual congelado separado, pero no se detalla su arquitectura ni su función exacta más allá de no estar fusionado en este adaptador.

## Capacidades

- Adaptador de seguridad multimodal: su función declarada es participar en evaluaciones de seguridad sobre el modelo base Qwen3-VL-8B-Instruct, no añadir capacidades nuevas.
- Visión y lenguaje: hereda las capacidades multimodales del modelo base (procesamiento de imágenes y texto), aunque la model card no las detalla.
- No se documenta soporte de tool calling, function calling ni agentes en la información disponible.
- No se documentan capacidades multilingües específicas.
- No se documenta modo thinking, audio ni otras capacidades especiales.
- Integridad verificable: hashes SHA-256 del modelo base, del adaptador y de la configuración permiten reproducibilidad.

## Casos de uso

- Reproducción de evaluaciones de seguridad multimodal: cargar el adaptador sobre la revisión exacta del modelo base y ejecutar los prompts de evaluación del paquete GitHub del proyecto para obtener métricas comparables.
- Auditoría de artefactos de seguridad: verificar los hashes SHA-256 publicados (`adapter_model.safetensors`: `f512013c...`, `adapter_config.json`: `47922768...`) antes de usar el adaptador en un pipeline de evaluación.
- Investigación en alineación multimodal: comparar el comportamiento del modelo base con y sin el adaptador M1 en tareas de clasificación de contenido inseguro imagen-texto.
- Docencia y formación: servir como ejemplo práctico de cómo se estructura un adaptador LoRA de seguridad con metadatos de trazabilidad y revisión fijada.
- Integración en pipelines de evaluación automatizada: conectar el adaptador a un framework de evaluación (por ejemplo, harness propio del proyecto) que cargue PEFT sobre el modelo base y ejecute los prompts documentados.
- Estudio de reproducibilidad en seguridad: analizar cómo la fijación de revisión y los hashes de contenido afectan a la reproducibilidad de resultados en evaluaciones de seguridad multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador (0.1 GB en disco); el modelo base Qwen3-VL-8B-Instruct requiere VRAM según su cuantización, no especificada en la información.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: PEFT sobre el modelo base; la model card menciona que para InternVL3 se debe adjuntar el LoRA a `model.language_model`, pero no detalla frameworks de serving (vLLM, TGI, llama.cpp, Ollama).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (adaptadores LoRA de seguridad multimodal) ni datos de rendimiento que permitan una comparación fundamentada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere cargarse sobre la revisión exacta de Qwen/Qwen3-VL-8B-Instruct (`0c351dd01ed87e9c1b53cbc748cba10e6187ff3b`); usar otra revisión puede invalidar la reproducibilidad.
- Sin datos de entrenamiento ni scripts: no es posible reentrenar ni auditar el proceso de entrenamiento a partir de este repositorio.
- Sin benchmarks publicados: no hay evidencia cuantitativa de eficacia en la información disponible.
- Licencia: apache-2.0 para el adaptador, pero la model card aclara que se aplica la licencia del modelo base y que la tarjeta no concede derechos adicionales; verificar la licencia de Qwen3-VL-8B-Instruct para uso comercial.
- Idiomas no documentados: no se especifica qué lenguas cubre el adaptador ni el modelo base en esta ficha.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; deben evaluarse empíricamente antes de cualquier uso.
- Artefacto de investigación: 13 descargas y 0 likes; no hay evidencia de uso en producción ni mantenimiento activo.
- Componente M3 separado: el revisor visual congelado no está incluido en este adaptador, por lo que el pipeline completo requiere artefactos adicionales no descritos aquí.

## Enlaces

- HuggingFace: https://huggingface.co/boli-003/mm-safetybench-qwen3vl8b-m1-vlguard-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Paquete GitHub del proyecto: mencionado en la model card como "linked GitHub project package", sin URL explícita en la información disponible.

# hotdogs/Qwen3.6_thinkingcap_lora

## Resumen

El modelo `hotdogs/Qwen3.6_thinkingcap_lora` es un adaptador LoRA (Low-Rank Adaptation) diseñado para el modelo base Qwen/Qwen3.6-27B. Su propósito es reproducir el comportamiento del modelo `huihui-ai/Huihui-ThinkingCap-Qwen3.6-27B-abliterated`, que combina un ajuste fino orientado a la generación de razonamiento explícito (ThinkingCap) con una técnica de "abliteration" que elimina los rechazos de contenido del modelo original. En lugar de requerir un entrenamiento adicional, el adaptador se obtiene mediante extracción por descomposición en valores singulares (SVD) de la diferencia de pesos entre el modelo ajustado y el base, comprimiendo el delta en un adaptador de rango 16.

El adaptador tiene 79.691.776 parámetros (159,5 MB en BF16) y se distribuye tanto en formato safetensors (PEFT) como en GGUF para su uso con llama.cpp. El modelo base Qwen3.6-27B es un modelo híbrido de 64 capas con atención completa en 16 capas y atención lineal en el resto, lo que condiciona los módulos objetivo del adaptador. La licencia es Apache-2.0 y los idiomas soportados son inglés y chino. Este adaptador resulta relevante para quienes desean experimentar con modelos menos censurados y con capacidades de razonamiento explícito sin necesidad de reentrenar un modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3.6-27B (modelo base híbrido `qwen3_5`, 64 capas, atención completa en 16 capas y atención lineal en 48) |
| Parametros totales | 79.691.776 (adaptador LoRA); el modelo base tiene 27B (no se especifica el número exacto) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no se indica en la información proporcionada) |
| Tipos de cuantizacion | BF16 (safetensors) y GGUF (formato llama.cpp, sin especificar nivel de cuantización) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) y GGUF |

## Arquitectura y entrenamiento

El adaptador se genera mediante una técnica de extracción por diferencia de pesos (weight-diff) combinada con SVD aleatorio. Se calcula la diferencia entre los pesos del modelo ajustado (`huihui-ai/Huihui-ThinkingCap-Qwen3.6-27B-abliterated`) y el modelo base (`Qwen/Qwen3.6-27B`), y esa delta se comprime en un adaptador LoRA de rango 16 con `lora_alpha` también 16, lo que da una escala efectiva de 1.0 (reproducción exacta del delta). No hay entrenamiento adicional; la extracción se realiza en CPU y tarda aproximadamente 11 minutos para 256 tensores.

Los módulos objetivo del adaptador son: `self_attn.q_proj/k_proj/v_proj/o_proj` de las 16 capas de atención completa (capas 3, 7, 11, ..., 63) y `mlp.gate_proj/up_proj/down_proj` de las 64 capas. Los tensores de atención lineal (`linear_attn.*`) se excluyen deliberadamente por incompatibilidad con PEFT y llama.cpp. La calidad de la reconstrucción es alta: captura el 99,1% de la energía del delta, con un error de reconstrucción de 0,087. Las familias `down_proj` y `o_proj` capturan más del 99% de su energía, mientras que `gate_proj/up_proj` y `q/k/v_proj` capturan entre el 28% y el 47%, lo que implica una pérdida parcial en esas partes.

## Capacidades

- Reproduce el comportamiento de ThinkingCap (generación de razonamiento explícito antes de la respuesta) y de abliteration (eliminación de rechazos de contenido) sobre el modelo base Qwen3.6-27B.
- Generación de texto conversacional en inglés y chino.
- Compatible con el pipeline de generación de texto de transformers y con llama.cpp mediante el archivo GGUF.
- Permite ajustar la intensidad del efecto mediante el parámetro `--lora-scaled` en llama.cpp o un ratio de fusión en PEFT.
- No se documentan capacidades adicionales como tool calling, agentes o visión; la información disponible no las menciona.

## Casos de uso

- Asistentes conversacionales sin restricciones de contenido: el adaptador elimina los rechazos típicos del modelo base, permitiendo respuestas directas sobre temas que el modelo original podría evitar. Es adecuado para entornos controlados donde se requiere una política de contenido más permisiva.
- Generación de texto creativo y narrativo: al reducir la censura, el modelo puede explorar temas sensibles o controvertidos en ficción, sin las limitaciones habituales de los modelos alineados.
- Investigación en alineación y desalineación de modelos: el adaptador sirve como herramienta para estudiar el efecto de la abliteration y del ajuste ThinkingCap sobre el comportamiento de un modelo de 27B, comparando respuestas con y sin el adaptador.
- Prototipado rápido de modelos personalizados: al ser un adaptador ligero (159 MB), se puede aplicar sobre el base sin necesidad de reentrenar, facilitando pruebas de comportamiento en diferentes escenarios.
- Despliegue en entornos con requisitos de hardware limitados: al usar el adaptador con cuantización GGUF, se puede ejecutar el modelo base en GPUs de consumo (por ejemplo, RTX 3090/4090 con cuantización 4-bit) y aplicar el adaptador con `llama.cpp`, manteniendo un footprint reducido.
- Evaluación comparativa de técnicas de extracción de LoRA: el adaptador es un ejemplo de extracción por SVD de un delta de pesos, útil para validar metodologías de compresión de modelos sin entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como MMLU, HumanEval o GSM8K para este adaptador ni para el modelo base en este contexto.

## Requisitos de hardware

- El adaptador en sí es muy ligero (159,5 MB en BF16), por lo que el requisito principal es el modelo base Qwen3.6-27B.
- Para el modelo base en BF16 se necesitan aproximadamente 54 GB de VRAM (27B × 2 bytes). Con cuantización 4-bit (por ejemplo, GGUF Q4_K_M) se reduce a unos 16-18 GB, lo que permite ejecutarlo en GPUs de consumo como RTX 3090, RTX 4090 o A6000.
- El adaptador GGUF se aplica con `llama.cpp` usando la opción `--lora`; requiere un GGUF del modelo base con la misma arquitectura.
- En PEFT, se carga con `transformers` y `peft` usando `AutoModelForImageTextToText` (no `AutoModelForCausalLM`), lo que implica un framework compatible con esa clase.
- No se proporcionan datos de latencia o throughput específicos; dependerán del hardware y de la cuantización del modelo base.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros adaptadores o modelos de la misma categoría. No se mencionan alternativas comparables en la documentación proporcionada.

## Limitaciones y advertencias

- El adaptador reproduce la abliteration, lo que elimina los mecanismos de rechazo de contenido del modelo base. Esto puede generar respuestas inapropiadas, ofensivas o peligrosas si se usa sin supervisión. No es recomendable para aplicaciones de producción sin una capa de moderación adicional.
- La extracción por SVD introduce pérdida de información, especialmente en las proyecciones `gate_proj/up_proj` y `q/k/v_proj` (energía capturada entre 28% y 47%). El comportamiento resultante puede diferir del modelo fuente original.
- El adaptador solo es compatible con la arquitectura Qwen3.6-27B (híbrida `qwen3_5`). No funcionará con otras variantes de Qwen ni con modelos de otras familias.
- Es obligatorio cargar el modelo con `AutoModelForImageTextToText` en PEFT; usar `AutoModelForCausalLM` produce un error de nombres de parámetros.
- No se han publicado evaluaciones de calidad ni benchmarks, por lo que el rendimiento real en tareas específicas es desconocido.
- El adaptador no cubre los tensores de atención lineal, lo que puede afectar a la coherencia en tareas que dependen de esa parte del modelo.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3.6-27B también es Apache-2.0; sin embargo, el modelo fuente de huihui-ai es una variante abliterated que puede tener restricciones adicionales no documentadas aquí.

## Enlaces

- Página del adaptador en HuggingFace: https://huggingface.co/hotdogs/Qwen3.6_thinkingcap_lora
- Modelo base Qwen3.6-27B: https://huggingface.co/Qwen/Qwen3.6-27B
- Modelo fuente (ThinkingCap + abliterated): https://huggingface.co/huihui-ai/Huihui-ThinkingCap-Qwen3.6-27B-abliterated

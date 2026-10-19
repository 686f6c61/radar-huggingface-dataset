# HYU-NLP-EVA2/qwen3-4b-medicine-online-pilot-261017-seed42-step-055

## Resumen
El modelo HYU-NLP-EVA2/qwen3-4b-medicine-online-pilot-261017-seed42-step-055 es un ajuste fino del modelo base Qwen/Qwen3-4B-Instruct-2507, publicado por HYU-NLP-EVA2. Se trata de un checkpoint intermedio (step 55, seed 42) de un piloto denominado "261017 Medicine online-rubrics pilot", orientado a tareas de rúbricas en el dominio médico. El repositorio contiene una exportación BF16 en formato Transformers y, en `original_checkpoint/`, los ficheros nativos veRL/FSDP con metadatos.

Con 4.022.468.096 parámetros y licencia Apache-2.0, es relevante para experimentación reproducible en ajuste fino y evaluación de modelos pequeños en medicina, no como una release final de producción. La model card no detalla longitud de contexto, idiomas, datos de entrenamiento ni resultados de benchmarks, por lo que su evaluación debe hacerse a partir del modelo base y de pruebas propias.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3 (modelo base Qwen/Qwen3-4B-Instruct-2507); la model card no da más detalles |
| Parámetros totales | 4.022.468.096 (4,02 B) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | BF16 en safetensors (exportación Transformers); no se indican GGUF, GPTQ, AWQ ni otras variantes |
| Idiomas soportados | No disponibles (no se declaran en la model card ni en los tags) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (BF16); `original_checkpoint/` con checkpoint nativo veRL/FSDP |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Tamaño del repositorio | 25,7 GB |
| Descargas / likes | 15 / 1 |
| Fecha de creación | 2026-10-19 |

## Arquitectura y entrenamiento
El modelo parte de Qwen/Qwen3-4B-Instruct-2507 y se presenta como un checkpoint de un piloto de rúbricas online en medicina. La model card indica el run `261017_medicine_online_pilot_seed42`, el step 55 y la seed 42; el directorio `original_checkpoint/` conserva los ficheros nativos veRL/FSDP y metadatos. Esto indica un proceso de ajuste fino con veRL y FSDP, pero no se especifican tokens de entrenamiento, composición del dataset ni si se aplicaron RLHF, DPO u otras etapas de alineamiento.

El repositorio contiene una exportación BF16 en Transformers, con un tamaño de repo de 25,7 GB, que incluye pesos y checkpoint original. No se documentan innovaciones técnicas adicionales (decodificación especulativa,

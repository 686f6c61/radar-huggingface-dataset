# mlx-works/Qwen3.8-27B-oQ3e-mtp

## Resumen

El modelo `mlx-works/Qwen3.8-27B-oQ3e-mtp` es una cuantización de 3 bits con group size 64 del modelo base Qwen3.8-27B, realizada con la herramienta oQ (oMLX v0.5.7) en formato MLX safetensors. Está diseñado para ejecutarse en dispositivos Apple Silicon mediante el ecosistema MLX. A pesar del nombre que sugiere 27 mil millones de parámetros, los pesos reales almacenados en safetensors suman 4.130.243.312 parámetros (aproximadamente 4,1 mil millones), lo que indica una discrepancia notable entre la denominación y el contenido real. El repositorio ocupa 13,8 GB, coherente con una cuantización agresiva de 3 bits. No se dispone de información sobre la licencia, los idiomas soportados ni el pipeline de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tipo interno: qwen3_5) |
| Parametros totales | 4.130.243.312 (según safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 3 bits, group size 64 (oQ mixed-precision) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo base Qwen3.8-27B. El tag `qwen3_5` sugiere que pertenece a la familia Qwen 3.5, pero no se confirma la arquitectura exacta (probablemente transformer con atención estándar o variantes). El modelo aquí presentado es únicamente una cuantización: se aplicó la herramienta oQ (oMLX) con precisión mixta de 3 bits y group size 64 sobre los pesos originales. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens ni procesos de alineación como RLHF o DPO.

## Capacidades

- No se dispone de información detallada sobre las capacidades específicas de esta cuantización.
- Al ser un modelo de la familia Qwen (presumiblemente), podría heredar capacidades de generación de texto, razonamiento y código, pero no hay documentación que lo confirme.
- No se ha verificado soporte para tool calling, agentes, visión o audio.
- El formato MLX limita su uso al ecosistema Apple Silicon.

## Casos de uso

- Inferencia local en Apple Silicon: al estar en formato MLX y cuantizado a 3 bits, puede ejecutarse en Mac con chip M-series para tareas de generación de texto, aprovechando la memoria unificada.
- Prototipado rápido: desarrolladores que trabajen con MLX pueden cargar este modelo para experimentar con la cuantización de 3 bits y evaluar su calidad en tareas concretas.
- Investigación sobre cuantización: útil para estudiar el impacto de la cuantización mixta de 3 bits en modelos de tamaño medio, comparando con versiones de mayor precisión.
- Despliegue en entornos con restricciones de memoria: el tamaño de 13,8 GB permite ejecutarlo en dispositivos con 16 GB o más de RAM unificada, aunque la calidad puede degradarse por la baja precisión.
- No se recomienda para producción sin una evaluación previa de calidad, dado que no hay benchmarks publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al ser MLX, usa memoria unificada del sistema. El repositorio ocupa 13,8 GB, por lo que se requiere al menos 16 GB de RAM en un Mac con Apple Silicon (M1, M2, M3 o superiores).
- GPU recomendadas: cualquier chip Apple Silicon con suficiente memoria unificada (por ejemplo, M1 Pro con 16 GB, M2 Max, etc.).
- No es compatible con GPUs NVIDIA o AMD sin conversión adicional a otros formatos.
- Opciones de despliegue: exclusivamente mediante MLX (por ejemplo, `mlx-lm` o `mlx-lm.server`). No es compatible con vLLM, llama.cpp u Ollama en su forma actual.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de la misma categoría. El nombre sugiere una relación con Qwen, pero al no haber datos sobre el modelo base ni benchmarks, no es posible establecer una comparativa fiable.

## Limitaciones y advertencias

- La cuantización de 3 bits puede provocar una degradación significativa de la calidad en tareas complejas (razonamiento, código, matemáticas) respecto al modelo original de mayor precisión.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones idiomáticas del modelo base.
- La licencia es desconocida, por lo que no se puede garantizar su uso comercial o la redistribución.
- El nombre del modelo (Qwen3.8-27B) no coincide con el número real de parámetros (4,1B), lo que sugiere un posible error de etiquetado o una versión distinta a la esperada.
- Al ser un formato propietario de MLX, su portabilidad a otros frameworks es limitada.
- No hay garantía de soporte o mantenimiento por parte del autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mlx-works/Qwen3.8-27B-oQ3e-mtp
- Herramienta oQ (oMLX): https://github.com/jundot/omlx

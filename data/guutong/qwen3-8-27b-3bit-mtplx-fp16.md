# guutong/Qwen3.8-27B-3bit-MTPLX-FP16

## Resumen

Este repositorio, publicado por el usuario guutong, presenta una versión cuantizada del modelo Qwen3.8-27B de Alibaba, convertida al formato MLX para su ejecución en hardware Apple Silicon. El nombre del archivo sugiere una cuantización de 3 bits con pesos en FP16, aunque los tags indican "4-bit", lo que introduce una inconsistencia. La model card está completamente vacía, sin instrucciones de uso, detalles de cuantización ni documentación técnica.

Un dato crítico es que el número de parámetros totales reportado en los safetensors es de 4.665.462.000 (aproximadamente 4,67 mil millones), muy inferior a los 27 mil millones que corresponderían al modelo Qwen3.8-27B original. Esta discrepancia sugiere que el repositorio podría contener una versión parcial, un subconjunto de capas, o que el autor ha subido un modelo diferente al que el nombre indica. Sin información adicional en la model card, no es posible confirmar la naturaleza exacta del contenido.

El modelo base Qwen3.8-27B, desarrollado por el equipo Qwen de Alibaba, es un modelo multimodal denso con atención híbrida (16 de 64 capas con atención completa y 48 con atención lineal), diseñado para tareas de codificación, flujos de trabajo agénticos y automatización de oficina. Sin embargo, no se puede verificar que esta versión cuantizada mantenga esas características.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere transformer multimodal, no confirmado) |
| Parametros totales | 4.665.462.000 (según safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 3-bit (según nombre) / 4-bit (según tags) - inconsistente |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors, MLX |

## Arquitectura y entrenamiento

No se dispone de información específica sobre la arquitectura o el proceso de entrenamiento de esta versión cuantizada. La model card está vacía y el autor no proporciona detalles sobre el proceso de cuantización, los datos utilizados o las técnicas de optimización aplicadas.

Del modelo base Qwen3.8-27B se sabe, según la documentación de vLLM Recipes, que utiliza un backbone de atención híbrida: solo 16 de las 64 capas ejecutan atención completa (con un intervalo de atención completa de 4), mientras que las otras 48 capas utilizan atención lineal con un estado recurrente constante. Esta arquitectura está diseñada para reducir el coste computacional manteniendo la calidad. No obstante, no se puede confirmar que esta versión cuantizada conserve esta estructura, especialmente considerando la discrepancia en el número de parámetros.

## Capacidades

- No se han documentado capacidades específicas para este repositorio.
- El modelo base Qwen3.8-27B es multimodal (texto e imagen), pero no se puede verificar que esta versión cuantizada mantenga dicha funcionalidad.
- No hay información sobre soporte de tool calling, agentes o razonamiento multi-paso.
- El idioma declarado es inglés, sin información sobre otros idiomas.

## Casos de uso

No se han documentado casos de uso concretos para este repositorio. Dada la falta de información sobre el contenido real del modelo, no es posible recomendar aplicaciones prácticas con seguridad. Cualquier uso en producción requeriría una verificación exhaustiva del modelo y sus capacidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de rendimiento para esta versión cuantizada.

## Requisitos de hardware

- Al estar en formato MLX, está diseñado para ejecutarse en Apple Silicon (M1, M2, M3, M4 y superiores).
- El tamaño del repositorio es de 16,9 GB, lo que sugiere que requiere una cantidad considerable de memoria unificada (probablemente 32 GB o más, dependiendo de la cuantización real).
- No se dispone de información sobre latencia o throughput.
- No se han documentado opciones de despliegue alternativas (vLLM, llama.cpp, etc.) para este formato específico.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa fiable. El modelo base Qwen3.8-27B podría compararse con otros modelos de 27B como Llama 3.3 70B o Mistral Large, pero esta versión cuantizada no tiene datos de rendimiento publicados. La discrepancia en el número de parámetros impide cualquier comparación significativa.

## Limitaciones y advertencias

- Model card completamente vacía: no hay instrucciones de uso, ni documentación técnica, ni ejemplos de inferencia.
- Inconsistencia en el número de parámetros: el nombre sugiere 27B, pero los safetensors contienen 4,67B. Esto podría indicar un error de subida, un modelo parcial o un modelo diferente.
- Inconsistencia en la cuantización: el nombre indica 3-bit, pero los tags indican 4-bit.
- Licencia no disponible: no se puede determinar si el uso comercial está permitido.
- Sin benchmarks ni evaluaciones: no hay evidencia de rendimiento.
- Riesgo de alucinación y sesgos: al ser una versión no documentada, no se pueden evaluar estos riesgos.
- No apto para producción sin una verificación exhaustiva previa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/guutong/Qwen3.8-27B-3bit-MTPLX-FP16
- Repositorio oficial del modelo base: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Model card del modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-27B
- Documentación de QwenCloud: https://www.qwencloud.com/models/qwen3.8-27b
- Recetas vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B

# agentic-ptb/opus-high-v3.h017.sft-v6.step_24

## Resumen

Este modelo es un checkpoint intermedio del run **opus-high-v3** del proyecto AgentPTB, una serie de experimentos de fine-tuning supervisado (SFT) sobre el modelo base Qwen/Qwen3.5-9B-Base. El autor lo publica con la etiqueta `negative-results`, indicando explícitamente que el entrenamiento no produjo ninguna mejora en los pesos respecto al modelo base. Se trata de un artefacto de reproducibilidad y estudio cualitativo, no de un modelo listo para uso práctico.

El checkpoint corresponde al paso 24 de la fase SFT-v6, con 9.409.813.744 parámetros en formato safetensors. La licencia es Apache-2.0. No se dispone de información sobre la longitud de contexto, idiomas soportados ni capacidades específicas más allá de las heredadas del modelo base. Su relevancia radica en documentar un resultado negativo dentro de un pipeline de entrenamiento, útil para investigaciones sobre dinámicas de fine-tuning y reproducibilidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | basada en Qwen3.5 (detalles no disponibles) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado (SFT) del checkpoint base Qwen/Qwen3.5-9B-Base, realizado dentro del pipeline AgentPTB. El run `opus-high-v3` corresponde a una celda de experimentación con configuración "opus@high". El autor reporta que el entrenamiento no produjo ninguna mejora en los pesos; de hecho, el run `opus-high-v2` (un rerun abortado) dejó de producir checkpoints en la hora 12 y envió los tensores del modelo base sin cambios tras cinco regresiones en sus runs SFT. Este checkpoint concreto, `h017.sft-v6.step_24`, es un artefacto intermedio retenido para reproducibilidad, pero no representa un avance en el rendimiento.

No se proporcionan detalles sobre la composición del dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. La arquitectura subyacente es la del modelo base Qwen3.5-9B, pero no se especifican innovaciones técnicas adicionales en este checkpoint.

## Capacidades

No se ha documentado ninguna capacidad específica para este checkpoint. Al ser un fine-tuning del modelo base Qwen3.5-9B-Base, se espera que herede las capacidades generales de dicho modelo (generación de texto, razonamiento, código, etc.), pero no hay confirmación ni métricas que lo respalden. El autor advierte explícitamente que no se debe inferir calidad a partir de la publicación de este checkpoint.

- Generación de texto: no verificada para este checkpoint.
- Razonamiento y matemáticas: no verificadas.
- Generación de código: no verificada.
- Tool calling / function calling: no disponible.
- Soporte para agentes: no disponible.
- Capacidades multilingües: no disponibles.
- Modo thinking o visión: no disponible.

## Casos de uso

Dado que el autor declara que el entrenamiento no produjo mejoras, este checkpoint no es adecuado para aplicaciones de producción. Su utilidad se limita al ámbito de la investigación y reproducibilidad:

- Estudio de dinámicas de entrenamiento: analizar cómo evolucionan los pesos y las pérdidas a lo largo de los pasos de SFT en un run que no converge.
- Reproducibilidad de resultados negativos: documentar y comparar las condiciones que llevan a un fine-tuning fallido, útil para evitar repetir errores en pipelines similares.
- Análisis de checkpoints intermedios: examinar la calidad de los tensores en pasos concretos (step_24) para entender cuándo y cómo se degrada el entrenamiento.
- Comparación de arquitecturas de experimentos: contrastar este run con otros de la serie AgentPTB (opus-high-v1, v2) para identificar patrones de regresión.
- Validación de herramientas de evaluación: usar este checkpoint como caso límite para probar que los evaluadores detectan la ausencia de mejora.
- Investigación sobre regularización y estabilidad: estudiar por qué un fine-tuning sobre un base ya entrenado puede no aportar valor, y qué factores contribuyen a ello.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta métricas de MMLU, HumanEval, GSM8K ni ninguna otra. Dado que el propio run se considera un resultado negativo, no existen datos de rendimiento que comparar.

## Requisitos de hardware

No hay especificaciones oficiales de hardware para este checkpoint. Como orientación general basada en el tamaño de parámetros (9.409.813.744) y el peso del repositorio (18.8 GB en safetensors):

- VRAM estimada para inferencia en FP16: aproximadamente 18.8 GB (el tamaño del repo), lo que requiere una GPU con al menos 24 GB (por ejemplo, RTX 3090, RTX 4090, A10G).
- Con cuantización de 8 bits, la VRAM necesaria se reduciría a unos 9.4 GB, permitiendo su uso en GPUs de 12-16 GB (RTX 3060, RTX 4070, etc.), aunque no se proporcionan archivos cuantizados en el repo.
- Con cuantización de 4 bits, la VRAM necesaria sería de unos 4.7 GB, aunque de nuevo no hay archivos GGUF/AWQ disponibles.
- Opciones de despliegue: al no haber archivos cuantizados ni documentación, las opciones estándar serían vLLM, llama.cpp u Ollama, pero requerirían convertir los pesos manualmente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay información suficiente para realizar una comparativa con modelos de la misma categoría. Al ser un checkpoint intermedio de un experimento fallido, no tiene sentido compararlo con modelos como Llama 3.1 8B o Mistral 7B. La única referencia razonable es el propio modelo base Qwen/Qwen3.5-9B-Base, del cual se desconoce su rendimiento en esta ficha. Por tanto, la comparativa se limita a señalar que este checkpoint no aporta ninguna ventaja sobre el base y que se recomienda usar el base directamente.

## Limitaciones y advertencias

- El autor declara explícitamente que el entrenamiento no produjo ninguna mejora en los pesos; es un resultado negativo.
- No se debe inferir calidad o rendimiento a partir de la publicación de este checkpoint.
- No hay documentación sobre sesgos, alucinaciones o limitaciones de contexto/idioma.
- Al ser un fine-tuning del modelo base Qwen3.5-9B, podría heredar sesgos y limitaciones de dicho modelo, pero no hay datos que lo confirmen.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no es apto para producción debido a su falta de mejoras verificadas.
- El repositorio no incluye archivos cuantizados ni instrucciones de despliegue, lo que dificulta su uso práctico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h017.sft-v6.step_24
- Dataset del run (opus-high-v3-data): https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Índice del proyecto AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX

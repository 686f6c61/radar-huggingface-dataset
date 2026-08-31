# agentic-ptb/opus-high-v3.h041.soup-v3

## Resumen

El modelo `agentic-ptb/opus-high-v3.h041.soup-v3` es un checkpoint intermedio derivado del modelo base `Qwen/Qwen3.5-9B-Base`, publicado por el usuario `agentic-ptb` dentro del proyecto AgentPTB. Según la model card, se trata de un checkpoint de un run de Claude Code (run `opus-high-v3`, hora `h041`) que se conserva con fines de reproducibilidad y estudio cualitativo. El propio autor advierte explícitamente de que el run no encontró mejora en los pesos entrenados y que no debe inferirse calidad a partir de su publicación.

Este modelo no resuelve ningún problema práctico por sí mismo: es un artefacto intermedio de un experimento de entrenamiento automático que resultó en un resultado negativo. Su relevancia radica en que documenta un fallo reproducible en el pipeline de AgentPTB, y puede servir a la comunidad para estudiar por qué ciertos enfoques de entrenamiento no producen mejoras. Arquitectónicamente hereda las características del modelo base Qwen3.5-9B-Base (9.409.813.744 parámetros), aunque no se proporcionan especificaciones detalladas de dicha arquitectura en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen/Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información pública no detalla la arquitectura interna del modelo más allá de indicar que se basa en `Qwen/Qwen3.5-9B-Base`. Dado que el checkpoint tiene 9.409.813.744 parámetros, es razonable asumir que se trata de un transformer denso de aproximadamente 9B parámetros, coherente con la familia Qwen3.5. Sin embargo, no se confirma si la arquitectura incluye innovaciones como atención lineal, decodificación especulativa u otras técnicas.

Sobre el entrenamiento, la model card indica que este checkpoint proviene de un run de Claude Code llamado `opus-high-v3`, en su hora `h041`, y que se almacena en `scratch/agent/soup-v3`. El run concluyó que no había mejora en los pesos entrenados, y el autor lo etiqueta como `negative-results`. No se proporcionan datos sobre el dataset de entrenamiento, número de tokens, composición de los datos ni técnicas de alineación (RLHF, DPO, etc.). El dataset asociado `agentic-ptb/opus-high-v3-data` está disponible en HuggingFace para quien quiera reproducir el experimento.

## Capacidades

No se han publicado evaluaciones ni descripciones de capacidades específicas para este checkpoint. Al ser un derivado del modelo base Qwen3.5-9B-Base, podría heredar las capacidades generales de dicho modelo (generación de texto, razonamiento, código, etc.), pero no hay confirmación oficial ni benchmarks que lo respalden. El autor advierte que no debe inferirse calidad a partir de la publicación, por lo que cualquier afirmación sobre capacidades sería especulativa.

## Casos de uso

Dado el carácter de resultado negativo y la ausencia de evaluación, no se recomienda su uso en aplicaciones prácticas. Los casos de uso razonables son:

- Reproducción de experimentos: investigadores pueden utilizar este checkpoint para reproducir el run `opus-high-v3` y verificar por qué no se produjo mejora en los pesos.
- Estudio de fallos en entrenamiento: el modelo sirve como ejemplo documentado de un pipeline de entrenamiento automático que no logró mejorar sobre el modelo base, útil para analizar causas de regresión o estancamiento.
- Análisis cualitativo de checkpoints intermedios: se puede comparar este checkpoint con el modelo base para estudiar cómo evolucionan (o no) las representaciones internas durante un entrenamiento fallido.
- Desarrollo de metodologías de evaluación: el caso puede usarse como banco de pruebas para detectar tempranamente runs sin mejora y abortarlos de forma eficiente.
- Auditoría de pipelines de IA agéntica: el proyecto AgentPTB documenta sus runs; este checkpoint permite auditar la calidad de los artefactos generados por Claude Code.
- Docencia e investigación en reproducibilidad: sirve como material didáctico sobre la importancia de publicar resultados negativos y conservar artefactos intermedios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni ninguna otra métrica estándar para este checkpoint. El autor indica explícitamente que el run no encontró mejora en los pesos entrenados, lo que sugiere que el rendimiento sería equivalente o inferior al del modelo base Qwen3.5-9B-Base.

## Requisitos de hardware

No se dispone de especificaciones oficiales de hardware para este modelo. A partir del tamaño del repositorio (18.8 GB) y de los parámetros totales (9.409.813.744), se puede estimar:

- VRAM estimada para inferencia: en precisión fp16, los pesos ocupan aproximadamente 18.8 GB, por lo que se necesitarían al menos 20 GB de VRAM para cargar el modelo sin cuantización. Con cuantización int8 (~9.4 GB) o int4 (~4.7 GB) podría caber en GPUs de consumo como una RTX 4090 (24 GB) o incluso una RTX 3090 (24 GB) en fp16, o GPUs más modestas con cuantización.
- GPU recomendadas: no hay recomendaciones oficiales; para fp16 se sugiere una GPU con al menos 24 GB de VRAM (A100, RTX 4090, etc.). Para cuantización, se podría usar una RTX 3060 12 GB o similar.
- Opciones de despliegue: al ser un modelo estándar de safetensors, se podría servir con vLLM, llama.cpp, Ollama o TGI, pero no hay configuraciones probadas publicadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar. El modelo más directamente comparable es su propio modelo base, `Qwen/Qwen3.5-9B-Base`, del cual deriva. Dado que el run no produjo mejora, el checkpoint es funcionalmente equivalente al base en cuanto a capacidades, aunque con pesos potencialmente ligeramente diferentes. Otras alternativas de ~9B parámetros (como Llama 3.1 8B o Mistral 7B) podrían considerarse comparables en tamaño, pero no hay benchmarks que permitan una comparación rigurosa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| opus-high-v3.h041.soup-v3 | 9.41B | no disponible | apache-2.0 | HuggingFace |
| Qwen/Qwen3.5-9B-Base | 9.41B | no disponible | apache-2.0 | HuggingFace |
| Llama 3.1 8B (referencia) | 8.03B | 128K | llama3.1 | HuggingFace |

## Limitaciones y advertencias

- Resultado negativo confirmado por el autor: el run no encontró mejora en los pesos entrenados; no debe usarse en producción.
- Sin evaluación de sesgos ni alucinaciones: no hay estudios de sesgo, y al ser un checkpoint sin validar, los riesgos de alucinación y sesgo son desconocidos, aunque probablemente heredados del modelo base.
- Contexto e idiomas no documentados: no se especifica la longitud de contexto soportada ni los idiomas, lo que impide garantizar su comportamiento multilingüe.
- Licencia apache-2.0: permite uso comercial, pero el autor no recomienda su uso y no ofrece garantías.
- Falta de soporte y mantenimiento: al ser un artefacto intermedio de un experimento, no hay garantía de correcciones ni actualizaciones.
- Riesgo de confusión: el nombre "opus-high" podría sugerir relación con Claude Opus de Anthropic, pero no existe tal relación; se trata de un nombre interno del proyecto AgentPTB.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agentic-ptb/opus-high-v3.h041.soup-v3
- Dataset del run: https://huggingface.co/datasets/agentic-ptb/opus-high-v3-data
- Índice del proyecto AgentPTB: https://huggingface.co/datasets/agentic-ptb/INDEX

# Elphan/TTSTR

## Resumen

TTSTR es un repositorio de respaldo (backup) del espacio de investigación *test-time steering* del autor Elphan, subido a Hugging Face el 25 de agosto de 2026 antes de la retirada de un servidor. No se trata de un modelo publicable como tal, sino de un conjunto completo de artefactos de investigación: checkpoints de modelos de la serie Qwen3 y Qwen3.5 (4B, 8B y 9B), datasets de razonamiento híbrido, logs de entrenamiento, evaluaciones y experimentos laterales. El contenido está organizado para preservar el estado no comiteado de un repositorio git, incluyendo parches, datasets y pesos de modelos.

El interés de este repositorio radica en su enfoque en *hybrid reasoning* y *latent reasoning*, combinando razonamiento textual y latente con tool calls. Los checkpoints incluyen un adaptador hidden→embedding para segmentos latentes, lo que sugiere una arquitectura de razonamiento latente sobre bases Qwen. Sin embargo, al ser un backup de investigación, no se proporciona documentación completa ni métricas de rendimiento, y su uso práctico requeriría reconstruir el entorno de entrenamiento y evaluar los pesos por separado.

La licencia es Apache 2.0, lo que permite uso comercial y modificación, aunque el contenido es claramente experimental y sin soporte oficial. El tamaño del repositorio (3230.6 GB) indica que contiene múltiples versiones y checkpoints completos en formato safetensors, aunque la documentación no detalla las arquitecturas exactas ni los datos de entrenamiento.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Modelos base Qwen3 y Qwen3.5 (4B, 8B, 9B) con adaptador hidden→embedding para razonamiento latente; no se detalla la arquitectura interna |
| Parametros totales | No disponible (se mencionan modelos de 4B, 8B y 9B parametros, pero no se especifica por checkpoint) |
| Parametros activos | No disponible (no se indica si es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en formato HF safetensors, sin cuantizacion) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato HF) |

## Arquitectura y entrenamiento
El repositorio contiene checkpoints de modelos de la serie Qwen3 y Qwen3.5, con un proceso de entrenamiento en tres etapas de SFT híbrido (hybrid SFT) y posterior RL (RLHF). La innovación técnica principal es el uso de un adaptador hidden→embedding que permite segmentos de razonamiento latente (latent segments) dentro de la generación de texto, lo que se describe como "hybrid latent/text reasoning with tool calls". El entrenamiento se divide en varias campañas: `version_3` a `version_7_base` para SFT, y `rl_new/`, `rl_new_v2/`, `rl_v7/` para RL. Se menciona un dataset de razonamiento híbrido (Hybrid-CoT) con subconjuntos `curated`, `curated_v2` y `labeled` (este último etiquetado con gpt-5-mini batch labels de ARPO-SFT-54K). También hay una reproducción del método ARPO (Aligned Reasoning with Policy Optimization) adaptado a Qwen3.5. No se proporcionan detalles sobre el número de tokens de entrenamiento, composición exacta del dataset ni técnicas de RLHF específicas.

## Capacidades
- Razonamiento híbrido: combina razonamiento textual y latente (mediante adaptador hidden→embedding) para tareas que requieren pasos intermedios no verbales.
- Tool calling: el entrenamiento incluye tool calls, lo que permite al modelo integrar funciones externas en su generación.
- Razonamiento multi-paso: los datasets de razonamiento híbrido (Hybrid-CoT) indican capacidad para cadenas de pensamiento complejas.
- Multilingüe: no hay información específica; los modelos base Qwen son multilingües, pero no se confirma para estos checkpoints.
- Capacidades especiales: el adaptador hidden→embedding sugiere una forma de "steering" (dirección) en tiempo de prueba, pero no se documentan detalles de implementación.

## Casos de uso
- Investigación académica en razonamiento latente: el repositorio es un recurso para estudiar cómo los segmentos latentes mejoran la coherencia y eficiencia del razonamiento en modelos transformer.
- Reproducción de experimentos: permite replicar el pipeline de SFT+RL con razonamiento híbrido, usando los scripts y datasets incluidos (ej. `rl_new_v2/train.py`).
- Evaluación de técnicas de tool calling: los checkpoints pueden servir para probar cómo el razonamiento latente afecta la calidad de las tool calls en agentes.
- Desarrollo de agentes con razonamiento híbrido: aunque no es un modelo listo para producción, podría adaptarse para prototipos de agentes que necesiten combinar texto y razonamiento interno.
- Reproducción de ARPO: los scripts y checkpoints permiten comparar la implementación de ARPO en Qwen3.5 con otras variantes.
- Análisis de latencia y memoria: los logs y evaluaciones incluidos pueden servir para estudiar el coste computacional del razonamiento latente frente al puramente textual.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye evaluaciones internas (carpetas `eval_rl*`, `eval_v*_campaign`, etc.), pero no se han extraído métricas como MMLU, HumanEval o GSM8K. Tampoco hay comparaciones con modelos similares en la documentación.

## Requisitos de hardware
- Los checkpoints varían de 4B a 9B de parámetros; se requiere VRAM proporcional al tamaño del modelo y la precisión de los pesos (FP16/FP32). Para un modelo de 9B en FP16, se estiman ~18-20 GB de VRAM.
- GPU recomendadas: para modelos de 4B/8B, una RTX 4090 (24 GB) o A100 (40/80 GB) es suficiente; para el 9B, se recomienda A100 80 GB o H100 para inferencia cómoda.
- No cabe en GPUs consumer de 8 GB (como RTX 3080) para el modelo de 9B en FP16, pero sí para el de 4B con cuantización.
- Opciones de despliegue: los pesos están en formato HF, por lo que se pueden usar con vLLM, Hugging Face Transformers o llama.cpp (si se convierten a GGUF). No hay integración directa con Ollama o TGI documentada.
- Latencia y throughput: no se especifica, pero dependerá del hardware y del tamaño del modelo.

## Comparativa con modelos similares
No hay información disponible sobre modelos comparables dentro del repositorio. Al ser un backup de investigación, no se han publicado comparaciones con alternativas como Qwen3-8B estándar o otros modelos de razonamiento híbrido. La documentación menciona ARPO (ARPO-SFT-24K) como referencia, pero no se proporcionan resultados comparativos.

## Limitaciones y advertencias
- Repositorio de respaldo, no un modelo empaquetado: no hay documentación de uso, API ni guía de inferencia; se necesita reconstruir el entorno de trabajo.
- Credenciales excluidas: el `.env` no está incluido, por lo que no se pueden reproducir experimentos que requieran acceso a servicios externos.
- Sin métricas de rendimiento: no hay benchmarks oficiales, por lo que no se puede validar la calidad del modelo.
- Riesgo de alucinación y sesgos: al ser modelos base Qwen3, heredan los sesgos de los datos de entrenamiento originales; no se ha realizado ninguna evaluación de sesgo en este repositorio.
- Licencia Apache 2.0 permite uso comercial, pero la falta de documentación y la naturaleza de backup hacen que no sea apto para producción sin un proceso de validación completo.
- El tamaño del repositorio (3.2 TB) implica que la descarga y el almacenamiento son costosos; solo se recomienda para investigación con infraestructura adecuada.

## Enlaces
- Hugging Face: https://huggingface.co/Elphan/TTSTR
- No se han encontrado otros enlaces relevantes en la búsqueda web (papers, blogs, repos) porque el contenido es un backup privado de investigación.

# franaiz/qwen2.5-1.5b-pgabl-grpo

## Resumen

`franaiz/qwen2.5-1.5b-pgabl-grpo` es un ajuste fino del modelo Qwen2.5-1.5B, desarrollado por el usuario franaiz, que parte de su propio checkpoint previo `franaiz/qwen2.5-1.5b-pgabl-sft` (ya entrenado con supervisión, SFT) y aplica una segunda fase de entrenamiento con GRPO (Group Relative Policy Optimization), una variante de aprendizaje por refuerzo. El resultado es un modelo de generación de texto conversacional de 1.543.714.304 parámetros (aproximadamente 1,5 mil millones) construido sobre la arquitectura Qwen2.

El modelo se publica bajo licencia Apache 2.0 y está etiquetado únicamente para inglés, aunque al derivar de Qwen2.5 conserva parte del multilingüismo del modelo original, no declarado en la model card. Su relevancia es acotada: se trata de un experimento de ajuste fino de nicho, sin métricas publicadas ni adopción visible (0 descargas, 0 likes en el momento de la consulta), útil como referencia para quienes investigan pipelines de RLHF/GRPO sobre modelos pequeños con herramientas como Unsloth y TRL.

El entrenamiento se realizó, según la model card, con Unsloth, que el autor describe como "2x faster" respecto a un entrenamiento estándar. No se proporcionan detalles sobre el dataset de preferencias, la función de recompensa ni los hiperparámetros del GRPO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B soporta 32.768 tokens, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | 4-bit (bitsandbytes, segun tags); el resto no disponible |
| Idiomas soportados | en (ingles declarado) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen2, un transformer decoder-only con atención causal estándar, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). Al tratarse de un ajuste del checkpoint SFT de 1,5B parámetros, la arquitectura es idéntica a la del modelo base; no hay modificaciones estructurales.

El proceso de entrenamiento consta de dos fases encadenadas: primero un ajuste supervisado (SFT) que da lugar a `franaiz/qwen2.5-1.5b-pgabl-sft`, y después una fase de optimización con GRPO, un algoritmo de aprendizaje por refuerzo que estima la ventaja relativa de un grupo de respuestas muestreadas para la misma consulta, sin necesidad de un modelo crítico separado. La model card no especifica el número de tokens de entrenamiento, la composición del dataset de preferencias, la función de recompensa ni los hiperparámetros (tamaño de grupo, tasa de aprendizaje, número de pasos). El entrenamiento se ejecutó con Unsloth y TRL, según las etiquetas del repositorio.

## Capacidades

- Generación de texto conversacional multi-turno, orientada a diálogo.
- Razonamiento básico y respuesta a instrucciones, heredado del ajuste SFT previo.
- Generación de código y matemáticas a nivel de modelo de 1,5B (capacidad limitada, no verificada con benchmarks).
- Soporte de tool calling / function calling: no disponible en la información proporcionada (el modelo base Qwen2.5 lo soporta, pero no se confirma para este ajuste).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés declarado; el multilingüismo del Qwen2.5 original no está garantizado tras el ajuste.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Prototipado de asistentes conversacionales en inglés: el modelo puede gestionar diálogos multi-turno en entornos de desarrollo y pruebas donde el coste computacional es crítico, gracias a su tamaño de 1,5B parámetros que permite ejecución en CPU o GPU de gama baja.
- Investigación en RLHF/GRPO: sirve como referencia reproducible de un pipeline SFT + GRPO sobre un modelo pequeño con Unsloth y TRL, útil para comparar curvas de entrenamiento o funciones de recompensa.
- Generación de texto en entornos con recursos limitados: su tamaño permite desplegarlo en dispositivos edge o instancias pequeñas de cloud, aunque la calidad esperada es inferior a la de modelos de mayor escala.
- Filtrado y clasificación de texto en inglés: puede usarse para tareas de etiquetado o resumen de documentos cortos donde no se requiera razonamiento complejo.
- Base para nuevos ajustes finos: al estar bajo Apache 2.0 y en formato safetensors, puede servir como punto de partida para especializaciones posteriores con LoRA o QLoRA.
- Educación y demostraciones: adecuado para mostrar en talleres cómo se encadena un SFT con un entrenamiento por refuerzo GRPO y cómo se publica el resultado en Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,1 GB en FP16 (1,543 mil millones de parámetros × 2 bytes); en cuantización 4-bit, en torno a 0,8-1,0 GB más overhead.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 (GTX 1650, RTX 3050, T4); para 4-bit basta con 2 GB.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares; también en CPU mediante llama.cpp u Ollama.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp (previa conversión a GGUF), Ollama (previa conversión), Unsloth para inferencia rápida.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| franaiz/qwen2.5-1.5b-pgabl-grpo | 1,54B | no disponible | Apache 2.0 | Hugging Face | Ajuste GRPO de nicho, sin benchmarks |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | Apache 2.0 | Hugging Face, Ollama, vLLM | Modelo base oficial, con benchmarks publicados y amplia adopción |
| Llama 3.2 1B Instruct | 1,24B | 128.000 tokens | Llama 3.2 Community License | Hugging Face, Ollama | Contexto mucho mayor, licencia con restricciones de uso |
| SmolLM2-1.7B-Instruct | 1,71B | 8.192 tokens | Apache 2.0 | Hugging Face | Alternativa pequeña con benchmarks públicos |

La comparación directa con estos modelos es desfavorable en términos de documentación y validación: el modelo de franaiz no publica métricas ni detalles del entrenamiento, mientras que las alternativas cuentan con evaluaciones oficiales y mayor soporte en herramientas de despliegue.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el ajuste GRPO mejore al checkpoint SFT del que parte; el rendimiento real es desconocido.
- Sesgos conocidos: no documentados; al derivar de Qwen2.5, puede heredar sesgos del corpus original, pero no se han analizado.
- Riesgo de alucinación: alto en un modelo de 1,5B sin evaluaciones de fidelidad; no apto para producción sin validación humana.
- Limitaciones de idioma: solo inglés declarado; el uso en castellano no está soportado ni evaluado.
- Limitaciones de contexto: la longitud de contexto no se confirma en la model card; no asumir los 32.768 tokens del Qwen2.5 original sin verificación.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la falta de garantías y de documentación técnica traslada todo el riesgo al integrador.
- Caveat de producción: 0 descargas y 0 likes indican ausencia de validación por la comunidad; no se recomienda su uso en sistemas críticos sin una evaluación propia exhaustiva.
- El tag 4-bit/bitsandbytes sugiere que parte del entrenamiento o del artefacto usa cuantización, lo que puede afectar a la fidelidad de los pesos publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/franaiz/qwen2.5-1.5b-pgabl-grpo
- Checkpoint SFT previo: https://huggingface.co/franaiz/qwen2.5-1.5b-pgabl-sft
- Modelo base original: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- TRL (biblioteca de RLHF): https://github.com/huggingface/trl
- Paper de GRPO (DeepSeekMath): https://arxiv.org/abs/2402.03300

# richardyoung/Qwen2.5-Coder-14B-Instruct-heretic1x-general-GGUF

## Resumen

Qwen2.5-Coder-14B-Instruct-heretic1x-general-GGUF es una cuantización en formato GGUF de un modelo derivado de Qwen2.5-Coder-14B-Instruct, publicado por el usuario richardyoung en Hugging Face. Se trata de una variante "abliterated" (también etiquetada como "heretic"), es decir, un ajuste fino orientado a eliminar o reducir los mecanismos de rechazo y moderación del modelo original, manteniendo las capacidades base de generación de texto y código. El modelo hereda la arquitectura transformer densa de Qwen2.5 y sus aproximadamente 14.770 millones de parámetros.

El modelo base original, Qwen2.5-Coder-14B-Instruct, es un modelo de lenguaje de Alibaba Qwen especializado en código y con capacidades generales de instrucción. Esta versión concreta aplica una modificación de tipo "abliteration" sobre esa base, lo que la hace adecuada para investigación sobre alineamiento, robustez y comportamiento de modelos sin restricciones de rechazo, pero no para despliegues de producción que requieran salvaguardas.

La relevancia de esta ficha radica en que documenta un artefacto de investigación poco convencional: una cuantización GGUF de un modelo modificado, distribuida bajo licencia Apache 2.0 pero con acceso restringido (gated) en Hugging Face. Es importante señalar que la información disponible es limitada: no se detallan los datos de entrenamiento de la modificación, los benchmarks ni las características exactas del proceso de abliteration.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5) |
| Parametros totales | 14.770.033.664 (~14,77 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (varias cuantizaciones; niveles concretos no disponibles) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-Coder-14B-Instruct, un transformer denso decoder-only con aproximadamente 14,77 mil millones de parámetros. El modelo original de Qwen2.5-Coder fue entrenado por Alibaba Qwen con un enfoque en generación de código y comprensión de instrucciones, e incluye fases de ajuste supervisado y optimización por preferencias (RLHF/DPO) según la documentación pública de la familia Qwen2.5. Sin embargo, los detalles concretos del dataset de entrenamiento del modelo base (número de tokens, composición) no se especifican en la información proporcionada.

Sobre esta base, el autor richardyoung aplicó una modificación de tipo "abliteration" (etiquetada "heretic1x-general"), una técnica que típicamente consiste en identificar y suprimir direcciones en el espacio de activaciones asociadas a comportamientos de rechazo, mediante ajustes o ediciones de pesos. No se dispone de información sobre el método exacto, los datos utilizados en esta modificación ni si hubo fases adicionales de entrenamiento. La cuantización a GGUF se realizó presumiblemente con llama.cpp, e incluye la etiqueta "imatrix", lo que sugiere el uso de matrices de importancia para mejorar la calidad de las cuantizaciones de baja precisión.

## Capacidades

- Generación de texto y código: hereda las capacidades del modelo base Qwen2.5-Coder-14B-Instruct, incluyendo generación de código en múltiples lenguajes de programación y tareas generales de instrucción.
- Razonamiento y matemáticas: capacidades de razonamiento propias de la familia Qwen2.5, aunque no se dispone de datos específicos de rendimiento para esta variante.
- Conversación multi-turno: el pipeline es text-generation y el modelo está etiquetado como "conversational".
- Comportamiento sin rechazo: la modificación "abliterated/heretic" busca reducir las negativas del modelo ante solicitudes que el modelo original rechazaría.
- Soporte de tool calling / function calling: no confirmado explícitamente para esta variante; el modelo base Qwen2.5-Coder-Instruct lo soporta, pero no se verifica en esta ficha.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la información disponible.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo permite estudiar cómo la abliteration afecta a la tasa de rechazo, la calidad de las respuestas y los sesgos, comparándolo con el modelo base original en entornos controlados de laboratorio.
- Análisis de robustez de filtros de moderación: sirve para evaluar si los sistemas de seguridad externos (guardrails) detectan contenido problemático generado por un modelo sin rechazo interno.
- Generación de código en entornos de investigación: puede emplearse para tareas de generación y explicación de código donde no se requieran salvaguardas, aprovechando las capacidades del base Qwen2.5-Coder.
- Experimentación con cuantizaciones GGUF: al ser un artefacto GGUF con etiqueta imatrix, es útil para estudiar la degradación de calidad entre niveles de cuantización en modelos modificados.
- Pruebas de despliegue local con llama.cpp u Ollama: el formato GGUF permite ejecutar el modelo en hardware de consumo para experimentos de inferencia local.
- Estudio de sesgos y comportamiento en inglés: dado que el modelo solo declara soporte de inglés, puede usarse para analizar cómo la abliteration afecta a la generación en ese idioma.
- Comparación de técnicas de edición de modelos: útil para investigadores que comparan distintas metodologías de abliteration (heretic, abliterated, etc.) sobre una misma base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de ~14,77 B en GGUF, una cuantización Q4_K_M requiere aproximadamente 9-10 GB de VRAM; Q5_K_M en torno a 11-12 GB; Q8_0 en torno a 16 GB; FP16 en torno a 30 GB. Estas cifras son estimaciones basadas en el tamaño de parámetros, no datos publicados para este modelo concreto.
- GPU recomendadas: para FP16, A100 40 GB o H100; para cuantizaciones Q4/Q5, una RTX 4090 (24 GB) o RTX 3090 (24 GB) son suficientes; para Q8_0, también cabe en 24 GB con margen ajustado.
- ¿Cabe en GPU de consumo? Sí, en cuantizaciones Q4 y Q5 cabe en GPUs de 12-16 GB (por ejemplo, RTX 4070 Ti, RTX 4080) y en 24 GB con holgura.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python). No se confirma soporte para vLLM o TGI en formato GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| richardyoung/Qwen2.5-Coder-14B-Instruct-heretic1x-general-GGUF | ~14,77 B | No disponible | Apache 2.0 | GGUF | Variante abliterated, solo inglés, acceso gated |
| Qwen/Qwen2.5-Coder-14B-Instruct | ~14,77 B | 32.768 tokens (según documentación pública de Qwen2.5) | Apache 2.0 | Safetensors, GGUF | Modelo base original con alineamiento estándar |
| Qwen/Qwen2.5-14B-Instruct | ~14,77 B | 32.768 tokens (según documentación pública de Qwen2.5) | Apache 2.0 | Safetensors, GGUF | Modelo generalista de la misma familia |
| Meta Llama 3.1 8B Instruct | ~8 B | 128.000 tokens | Llama 3.1 Community License | Safetensors, GGUF | Alternativa de menor tamaño con contexto mayor |

Nota: los datos de contexto de los modelos Qwen2.5 se basan en la documentación pública de la familia; no se confirman para esta variante concreta.

## Limitaciones y advertencias

- Modelo abliterated: la modificación elimina o reduce los rechazos de seguridad, lo que puede producir contenido dañino, sesgado o inapropiado. No es adecuado para aplicaciones de cara al usuario sin guardrails externos.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas para esta variante.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Licencia: Apache 2.0 permite uso comercial, pero el acceso está restringido (gated) en Hugging Face y requiere aceptar condiciones. El uso comercial de un modelo abliterated puede conllevar riesgos legales y reputacionales según la jurisdicción.
- Contexto: no se dispone de la longitud de contexto efectiva de esta variante; no asumir la del modelo base sin verificación.
- Calidad de cuantización: las cuantizaciones GGUF de baja precisión pueden degradar el rendimiento; la etiqueta imatrix sugiere mitigación, pero no hay datos publicados.
- Falta de documentación: no se detallan el proceso de abliteration, los datos de entrenamiento ni los benchmarks, lo que dificulta la reproducibilidad.
- Sesgos: no documentados para esta variante; se heredan los del modelo base y se pueden amplificar por la modificación.

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-Coder-14B-Instruct-heretic1x-general-GGUF
- Modelo base de la modificación: https://huggingface.co/richardyoung/Qwen2.5-Coder-14B-Instruct-heretic1x-general
- Modelo original Qwen2.5-Coder-14B-Instruct (referencia): https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
- Repositorio llama.cpp (formato GGUF): https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com

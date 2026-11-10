# domyn/Domyn-Edge-Teacher-Math

## Resumen

Domyn Edge Teacher Math es un modelo de lenguaje de 4B parámetros desarrollado por Domyn, un transformer denso entrenado específicamente para resolver problemas matemáticos con respuesta final verificable. Forma parte del segundo paquete de la release por fases de la familia Domyn Edge y se utiliza como uno de los "profesores de dominio" en la etapa de destilación on-policy multi-profesor (MOPD) del protocolo de post-entrenamiento de Domyn: el estudiante genera sus propias respuestas y cada profesor las puntúa token a token en su dominio.

El modelo parte de Domyn Edge SFT y se somete a una única etapa de GRPO (Group Relative Policy Optimization asíncrono) sobre problemas matemáticos con una respuesta final única verificable mediante math-verify. La recompensa asigna 1 a una respuesta correcta, 0.5 a una correcta pero no en el formato solicitado y 0 en caso contrario. Los pesos se almacenan en bfloat16 y el repositorio ocupa 7,9 GB.

Es relevante porque se publica de forma completamente abierta (pesos, datos y protocolo) bajo licencia Apache 2.0, lo que permite reproducir e investigar pipelines de RL sobre razonamiento matemático con verificación formal. No está pensado como asistente de propósito general, sino como componente de investigación y como generador de razonamiento matemático de alta calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (misma arquitectura y tokenizer que Domyn Edge SFT) |
| Parametros totales | 3.928.787.968 (~4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128k (empleado en evaluacion con vLLM) |
| Tipos de cuantizacion | pesos publicados en bfloat16; no se documentan otras cuantizaciones oficiales |
| Idiomas soportados | en, it, es, fr, de, pt, ru, zh, ja, ar, nl, id, tr |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers, custom_code) |

## Arquitectura y entrenamiento

Domyn Edge Teacher Math es un transformer denso de ~4B parámetros que reutiliza sin cambios la arquitectura y el tokenizer de Domyn Edge SFT. Sobre esa base se aplica una única etapa de post-entrenamiento: GRPO asíncrono sobre problemas matemáticos con una respuesta final única y verificable. La función de recompensa usa math-verify y otorga 1 punto por respuesta correcta en el formato pedido, 0,5 por respuesta correcta con formato incorrecto y 0 en el resto de casos.

El entrenamiento limita las respuestas a 64k tokens, aunque en problemas difíciles el modelo puede razonar durante decenas de miles de tokens. La plantilla de chat es la de Domyn Edge SFT sin modificaciones, con una línea de identidad fija en el turno de sistema ("You are Domyn Edge, a model trained by Domyn."). El modelo razona primero y termina con la respuesta final, habitualmente dentro de `\boxed{}`. No se documentan detalles adicionales sobre el volumen de tokens de entrenamiento ni la composición exacta del dataset más allá del enlace a `domyn/Domyn-Edge-Teacher-Math-Mix`.

## Capacidades

- Razonamiento matemático con respuesta final verificable, incluyendo problemas de competición (AIME, HMMT) y matemáticas escolares (GSM8K).
- Modo de razonamiento extendido ("thinking on") con cadenas de razonamiento de hasta decenas de miles de tokens.
- Salida estructurada con la respuesta final en `\boxed{}`.
- Capacidades multilingües en matemáticas: evaluación MGSM en alemán, inglés, español, francés y ruso.
- Soporte de function calling heredado de Domyn Edge SFT (evaluado con BFCL v4).
- Capacidades de agente y razonamiento multi-paso heredadas del modelo base (evaluadas con SWE-bench Verified).
- Generación de código heredada del modelo base (evaluada con LiveCodeBench).
- Capacidad de puntuar rollouts token a token como profesor en destilación on-policy.

## Casos de uso

- Destilación on-policy multi-profesor: el modelo puntúa token a token las respuestas del estudiante Domyn Edge en el dominio matemático, proporcionando señal de recompensa densa durante la etapa MOPD.
- Generación de datos matemáticos sintéticos: produce cadenas de razonamiento con respuesta final verificable que pueden filtrarse automáticamente con math-verify para construir datasets de entrenamiento.
- Investigación en RL con recompensas verificables: sirve como referencia reproducible de un pipeline GRPO completo con pesos, datos y configuración publicados.
- Evaluación comparativa de razonamiento matemático: con 79,0 en AIME 2026 (avg@10) y 93,8 en GSM8K, es útil como baseline de 4B parámetros en suites de matemáticas.
- Tutoría matemática con razonamiento explícito: el formato de razonamiento previo y respuesta en `\boxed{}` facilita la revisión paso a paso de problemas de competición.
- Razonamiento matemático multilingüe: con 87,4 de precisión en MGSM en cinco idiomas, puede emplearse en entornos donde el problema se plantea en alemán, español, francés o ruso.
- Componente de sistemas de verificación: alineado con math-verify, puede integrarse en pipelines que necesitan una respuesta final parseable para validación automática.

## Benchmarks y rendimiento

Comparación del profesor con el estudiante (Domyn Edge SFT) en la suite general, en porcentajes:

| Grupo | Benchmark | Metrica | Domyn Edge SFT | Teacher Math | Delta |
|---|---|---|---:|---:|---:|
| Matematicas | AIME 2026 | avg@10 | 61,3 | 79,0 | +17,7 |
| Matematicas multilingues | MGSM (de, en, es, fr, ru) | accuracy | 85,8 | 87,4 | +1,6 |
| Conocimiento y razonamiento | GPQA Diamond | pass@1 | 56,3 | 59,6 | +3,3 |
| Seguimiento de instrucciones | IFBench | prompt strict pass@1 | 24,1 | 25,0 | +0,9 |
| Function calling | BFCL v4 sin busqueda web (global) | pass@1 | 36,5 | 36,2 | -0,3 |
| Function calling | BFCL v4 (non-live) | pass@1 | 51,9 | 53,3 | +1,4 |
| Function calling | BFCL v4 (live) | pass@1 | 75,9 | 75,1 | -0,8 |
| Function calling | BFCL v4 (multi-turn) | pass@1 | 35,9 | 38,8 | +2,9 |
| Function calling | BFCL v4 (memory) | pass@1 | 27,3 | 21,5 | -5,8 |
| Agentico | SWE-bench Verified | pass@1 | 33,6 | 29,6 | -4,0 |
| Codigo | LiveCodeBench (conjunto completo) | pass@1 | 73,0 | 72,0 | -1,0 |

Suite específica de matemáticas frente a Qwen3.5 4B:

| Benchmark | Metrica | Teacher Math | Qwen3.5 4B | Delta |
|---|---|---:|---:|---:|
| AIME 2026 | avg@10 | 79,0 | 82,9 | -3,9 |
| AIME 2025 | avg@10 | 75,9 | 78,3 | -2,4 |
| HMMT Feb 2026 | avg@10 | 65,9 | 63,3 | +2,6 |
| HMMT Feb 2025 | avg@10 | 76,1 | 74,6 | +1,5 |
| GSM8K | accuracy | 93,8 | 95,0 | -1,2 |
| MGSM (de, en, es, fr, ru) | accuracy | 87,4 | 89,8 | -2,4 |

Configuración de evaluación: servido con vLLM en bfloat16 (contexto de 128k en la suite matemática), thinking activado, temperatura 1,0, top-p 0,95, top-k 20, min-p 0, sin penalizaciones de presencia, frecuencia o repetición. AIME y HMMT con 10 muestras por problema (avg@10). LiveCodeBench corresponde al conjunto completo de 1.055 problemas de LiveCodeBench v6 (mayo 2023 a abril 2025).

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 8 GB solo para pesos, más caché KV; con contexto largo (128k) el consumo crece de forma significativa.
- GPU recomendadas para bfloat16: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para contextos moderados.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) e incluso en GPUs de 12-16 GB si se cuantiza, aunque no se publican cuantizaciones oficiales.
- Opciones de despliegue: vLLM (empleado en la evaluación oficial) y Transformers con `trust_remote_code` por el `custom_code`; llama.cpp u Ollama requerirían conversión a GGUF no oficial.
- Latencia y throughput: no disponibles. El razonamiento extendido en problemas difíciles puede generar decenas de miles de tokens, por lo que conviene limitar la longitud de generación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AIME 2026 (avg@10) | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Domyn Edge Teacher Math | ~4B | 128k | 79,0 | 93,8 | Apache 2.0 | Pesos, datos y protocolo abiertos |
| Qwen3.5 4B | ~4B | no disponible | 82,9 | 95,0 | no disponible en la informacion | Referencia de comparacion en la model card |
| Domyn Edge SFT (estudiante) | ~4B | 128k | 61,3 | no disponible | Apache 2.0 | Pesos abiertos |

Frente a Qwen3.5 4B, el profesor queda por detrás en AIME 2026, AIME 2025, GSM8K y MGSM, pero supera al modelo en HMMT Feb 2026 y HMMT Feb 2025. Frente a su propio modelo base (Domyn Edge SFT), la mejora en AIME 2026 es de +17,7 puntos y en MGSM de +1,6, con retrocesos moderados en SWE-bench Verified (-4,0) y BFCL v4 memory (-5,8).

## Limitaciones y advertencias

- Es un profesor de dominio, no un asistente de propósito general: solo se entrenó matemáticas más allá de Domyn Edge SFT.
- Generaciones muy largas: en problemas difíciles puede razonar decenas de miles de tokens; el entrenamiento limitó las respuestas a 64k tokens y conviene imponer un límite de generación.
- El trabajo de seguridad está incompleto: no se realizó ajuste de seguridad dedicado ni red teaming sobre este modelo.
- Riesgo de alucinación en razonamientos matemáticos largos y en dominios fuera de las matemáticas, donde las capacidades son las heredadas del modelo base.
- Retrocesos medidos frente al estudiante en BFCL v4 memory (-5,8), SWE-bench Verified (-4,0) y LiveCodeBench (-1,0), relevantes si se usa fuera del dominio matemático.
- Licencia Apache 2.0 permite uso comercial, pero el modelo se publica para investigación y reproducibilidad; no se garantiza su idoneidad en producción como asistente.
- El formato de respuesta esperado (`\boxed{}` y razonamiento previo) condiciona la integración: los pipelines deben parsear ese formato.
- No se publican cuantizaciones oficiales ni datos de latencia o throughput.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/domyn/Domyn-Edge-Teacher-Math
- Dataset de entrenamiento: https://huggingface.co/datasets/domyn/Domyn-Edge-Teacher-Math-Mix
- Modelo base (estudiante SFT): https://huggingface.co/domyn/Domyn-Edge-SFT
- math-verify (verificador de recompensas): https://github.com/huggingface/Math-Verify
- Logotipo de Domyn: https://cdn.prod.website-files.com/682dcb35e7fd7a313cae803a/6835ca86622d317630fa3861_domyn-logo-primary.svg

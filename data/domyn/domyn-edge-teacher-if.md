# domyn/Domyn-Edge-Teacher-IF

## Resumen

Domyn Edge Teacher IF es un modelo de lenguaje denso de 4B parámetros (3.928.787.968 según los pesos en safetensors) desarrollado por Domyn. Se trata de un modelo "profesor" de dominio especializado en seguimiento de instrucciones y llamada a funciones, construido a partir de Domyn Edge SFT mediante un ajuste supervisado específico (IF SFT) seguido de un entrenamiento con GRPO sobre problemas de instrucciones y tool calling con respuestas verificables. No es un asistente de propósito general, sino una pieza de la infraestructura de post-entrenamiento de Domyn.

Su función es actuar como uno de los profesores de dominio dentro de la etapa de destilación on-policy multi-profesor (MOPD) del protocolo de post-entrenamiento de Domyn: el estudiante genera sus propias respuestas y cada profesor las puntúa token a token en su dominio. Por eso se publica bajo licencia Apache 2.0 y con pesos abiertos, orientado a investigación y reproducibilidad.

La relevancia actual reside en dos factores: por un lado, su rendimiento en tareas de seguimiento de instrucciones estricto (IFBench 66.0, IFEval 92.8, IFStruct 92.2), muy por encima de alternativas de tamaño similar como Qwen3.5 4B; por otro, su formato completamente abierto, que permite reproducir pipelines de destilación y evaluar técnicas de post-entrenamiento con RL verificable sobre modelos pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (misma arquitectura y tokenizer que Domyn Edge SFT) |
| Parametros totales | 3.928.787.968 (~3,9B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128k tokens (según la configuración de evaluación del autor) |
| Tipos de cuantizacion | No disponible (pesos publicados en bfloat16) |
| Idiomas soportados | en, it, es, fr, de, pt, ru, zh, ja, ar, nl, id, tr |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

Domyn Edge Teacher IF es un transformer denso de aproximadamente 3,9B parámetros que reutiliza la arquitectura y el tokenizer de Domyn Edge SFT, su modelo base. El entrenamiento se estructuró en dos etapas: primero un ajuste supervisado especializado (IF SFT) sobre una mezcla curada de muestras de seguimiento de instrucciones y uso de herramientas (dataset `domyn/Domyn-Edge-Teacher-IF-Mix`), durante dos épocas; después, un entrenamiento con GRPO (Group Relative Policy Optimization) asíncrono sobre problemas de instrucciones y tool calling con respuestas verificables.

La innovación principal no está en la arquitectura, sino en el rol del modelo dentro del pipeline: es un profesor de dominio que puntúa rollouts del estudiante token a token en la etapa MOPD. El modelo razona antes de emitir la respuesta final, y la plantilla de chat (idéntica a la de Domyn Edge SFT) abre el turno de sistema con una línea de identidad fija ("You are Domyn Edge, a model trained by Domyn."). Las respuestas de entrenamiento se limitaron a 64k tokens.

## Capacidades

- Generación de texto conversacional multi-turno con razonamiento previo a la respuesta final.
- Seguimiento estricto de instrucciones (formato, restricciones, estructuras), con rendimiento destacado en IFBench, IFEval e IFStruct.
- Llamada a funciones y tool calling (BFCL v4 en sus variantes non-live, live, multi-turn y memory).
- Razonamiento matemático, incluido matemático multilingüe (AIME 2026, MGSM en de, en, es, fr, ru).
- Razonamiento de conocimiento general (GPQA Diamond).
- Capacidades de código y resolución de problemas de ingeniería (LiveCodeBench, SWE-bench Verified).
- Soporte multilingüe en 13 idiomas: inglés, italiano, español, francés, alemán, portugués, ruso, chino, japonés, árabe, neerlandés, indonesio y turco.
- Modo "thinking" activable, con razonamiento extenso en problemas difíciles.

## Casos de uso

- Destilación on-policy multi-profesor: usar el modelo como profesor de dominio que puntúa token a token los rollouts de un estudiante en tareas de instrucciones y tool calling, reproduciendo la etapa MOPD del pipeline de Domyn.
- Evaluación de técnicas de RL verificable: servir como referencia para comparar GRPO con otras variantes (PPO, DPO) sobre problemas con respuesta comprobable, gracias a que el modelo y los datos están abiertos.
- Generación de datos sintéticos de alta calidad para instrucciones estrictas: producir pares instrucción-respuesta que respeten restricciones de formato y estructura, útiles para aumentar datasets de SFT de modelos pequeños.
- Investigación en seguimiento de instrucciones: analizar por qué un modelo de 4B alcanza 92.8 en IFEval y 92.2 en IFStruct, y qué tipos de instrucciones siguen fallando (IFBench en 66.0 deja margen claro).
- Benchmarking de tool calling en agentes: emplear las puntuaciones BFCL v4 (86.9 en non-live, 80.3 en live) como línea base para evaluar nuevos modelos en llamada a funciones.
- Estudio de razonamiento largo: analizar el comportamiento del modelo en problemas de matemáticas y código con generaciones de decenas de miles de tokens, controlando el límite de 64k tokens usado en entrenamiento.
- Reproducibilidad de pipelines abiertos: al publicarse pesos, datos de post-entrenamiento y receta, sirve para replicar experimentos de post-entrenamiento en entornos académicos con recursos limitados.

## Benchmarks y rendimiento

Comparación del profesor con el estudiante (Domyn Edge SFT) en la suite general de evaluación. Todas las puntuaciones en porcentaje.

| Grupo | Benchmark | Métrica | Domyn Edge SFT | Teacher IF | Δ |
|---|---|---|---:|---:|---:|
| Matemáticas | AIME 2026 | avg@10 | 61.3 | 79.3 | +18.0 |
| Matemáticas multilingües | MGSM (de, en, es, fr, ru) | accuracy | 85.8 | 90.4 | +4.6 |
| Conocimiento y razonamiento | GPQA Diamond | pass@1 | 56.3 | 64.3 | +8.0 |
| Seguimiento de instrucciones | IFBench | prompt strict pass@1 | 24.1 | 66.0 | +41.9 |
| Llamada a funciones | BFCL v4 (overall, sin búsqueda web) | pass@1 | 36.5 | 43.1 | +6.6 |
| | BFCL v4 (non-live) | pass@1 | 51.9 | 86.9 | +35.0 |
| | BFCL v4 (live) | pass@1 | 75.9 | 80.3 | +4.4 |
| | BFCL v4 (multi-turn) | pass@1 | 35.9 | 41.1 | +5.2 |
| | BFCL v4 (memory) | pass@1 | 27.3 | 26.0 | -1.3 |
| Agéntico | SWE-bench Verified | pass@1 | 33.6 | 40.2 | +6.6 |
| Código | LiveCodeBench (set completo, 1.055 problemas v6) | pass@1 | 73.0 | 76.2 | +3.2 |

Comparación con Qwen3.5 4B en la suite de seguimiento de instrucciones:

| Benchmark | Métrica | Teacher IF | Qwen3.5 4B | Δ |
|---|---|---:|---:|---:|
| IFBench | prompt strict pass@1 | 66.0 | 52.7 | +13.3 |
| IFEval | prompt strict pass@1 | 92.8 | 85.2 | +7.6 |
| IFStruct | accuracy | 92.2 | 70.6 | +21.6 |
| BFCL v4 (overall, sin búsqueda web) | pass@1 | 43.1 | 43.2 | -0.1 |
| BFCL v4 (non-live) | pass@1 | 86.9 | 75.8 | +11.1 |
| BFCL v4 (live) | pass@1 | 80.3 | 76.5 | +3.8 |
| BFCL v4 (multi-turn) | pass@1 | 41.1 | 45.4 | -4.3 |
| BFCL v4 (memory) | pass@1 | 26.0 | 31.0 | -5.0 |

Ajustes de evaluación: servido con vLLM en bfloat16, thinking activado, temperatura 1.0, top-p 0.95, top-k 20, min-p 0, sin penalizaciones de presencia, frecuencia ni repetición. En la suite de instrucciones, contexto de 128k.

## Requisitos de hardware

- VRAM estimada en bfloat16: unos 8 GB solo para pesos (3,9B × 2 bytes), más KV cache; el repo ocupa 7,9 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 4 GB de pesos.
- VRAM estimada en cuantización de 4 bits: aproximadamente 2 GB de pesos.
- GPU recomendadas para producción: A100 40/80 GB o H100 para servir con contexto largo (128k) y thinking activado; L40S o RTX 6000 Ada como alternativas de coste medio.
- GPU de consumo: cabe en RTX 4090 (24 GB) en bfloat16 con contexto moderado, y en GPUs de 8-12 GB (RTX 3060/4060, RTX 3080) con cuantización de 4-8 bits.
- Opciones de despliegue: vLLM es la opción recomendada por el autor (usada en la evaluación); Transformers para carga directa; llama.cpp, Ollama o TGI no están confirmados en la información disponible, aunque al ser un transformer denso estándar con safetensors deberían ser viables previa conversión.
- Latencia y throughput: no disponibles en la información proporcionada. El razonamiento extenso (decenas de miles de tokens en problemas difíciles) puede dominar el tiempo de respuesta si no se limita la generación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | IFBench | IFEval | BFCL v4 overall | Licencia |
|---|---|---:|---:|---:|---:|---|
| Domyn Edge Teacher IF | ~3,9B denso | 128k | 66.0 | 92.8 | 43.1 | Apache 2.0 |
| Qwen3.5 4B | ~4B denso | no disponible | 52.7 | 85.2 | 43.2 | no disponible en la información |
| Domyn Edge SFT (estudiante) | ~3,9B denso | no disponible | 24.1 | no disponible | 36.5 | Apache 2.0 |

El modelo supera claramente a Qwen3.5 4B en IFBench, IFEval e IFStruct, empata en BFCL overall y queda por debajo en las variantes multi-turn y memory de BFCL. Frente a su modelo base, la mejora en seguimiento de instrucciones es muy marcada (+41.9 en IFBench). No se dispone de datos de otros modelos comparables de 4B en la información proporcionada.

## Limitaciones y advertencias

- Es un profesor de dominio, no un asistente de propósito general: solo se entrenó más allá de Domyn Edge SFT en seguimiento de instrucciones y tool calling.
- Generaciones muy largas: en problemas difíciles puede razonar decenas de miles de tokens; el entrenamiento limitó las respuestas a 64k tokens, por lo que conviene acotar la longitud de generación.
- Trabajo de seguridad incompleto: no se realizó ajuste de seguridad dedicado ni red teaming sobre este modelo.
- Riesgo de alucinación no cuantificado en la información disponible; como todo modelo generativo, puede producir contenido plausible pero falso, especialmente fuera de su dominio de especialización.
- Rendimiento inferior al estudiante en BFCL v4 memory (26.0 frente a 27.3) y por debajo de Qwen3.5 4B en multi-turn (41.1 frente a 45.4) y memory (26.0 frente a 31.0).
- Sesgos conocidos: no documentados en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero el autor lo publica para investigación y reproducibilidad; su uso como asistente final no es el propósito previsto.
- El modelo aplica una línea de identidad fija en el turno de sistema ("You are Domyn Edge, a model trained by Domyn."), lo que puede condicionar respuestas sobre su propia identidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/domyn/Domyn-Edge-Teacher-IF
- Modelo base (Domyn Edge SFT): https://huggingface.co/domyn/Domyn-Edge-SFT
- Dataset de post-entrenamiento: https://huggingface.co/datasets/domyn/Domyn-Edge-Teacher-IF-Mix
- Organización Domyn en Hugging Face: https://huggingface.co/domyn
- Paper, blog, repositorio o demo oficiales: no disponibles en la información proporcionada.

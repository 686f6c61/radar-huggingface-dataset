# SeanWang0027/rose-opd-implementation

## Resumen
Este repositorio, publicado por SeanWang0027, no contiene un modelo entrenado, sino la implementación completa y el framework de entrenamiento para comparar tres métodos de destilación de conocimiento: teacher-SFT, OPD (on-policy distillation) y ROSE (una variante de destilación en línea con máscara de tokens). El trabajo se desarrolla sobre tres dominios distintos: RLVE (razonamiento de una sola pasada), SciWorld (agente multi-turno) y DAPO-Math (razonamiento matemático con pensamiento largo). El objetivo es evaluar cómo un modelo pequeño (por ejemplo, Qwen3-1.7B, Qwen3-4B u Olmo-3-7B) puede aprender de un profesor grande (Qwen3-32B) mediante diferentes estrategias de destilación, y medir el impacto en tareas de razonamiento y agencia.

La implementación se apoya en frameworks existentes: verl (para las líneas de ROSE y OPD), Trinity (para las líneas de SciWorld) y AgentGym-RL (solo para evaluación). El repositorio incluye scripts, configuraciones y documentación de entorno, y los resultados experimentales muestran que ROSE supera a OPD y a teacher-SFT en RLVE y SciWorld, pero produce un **resultado negativo** en DAPO-Math, con un diagnóstico detallado sobre las causas (presupuesto de tokens del maestro insuficiente). La licencia es Apache-2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (framework de entrenamiento sobre modelos base como Qwen3-1.7B, Qwen3-4B, Olmo-3-7B) |
| Parametros totales | No disponible (depende del modelo base usado) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base; los experimentos usan hasta 31744 tokens de salida en DAPO-Math) |
| Tipos de cuantizacion | No disponible (se usan precisiones bf16 y fp32 en entrenamiento) |
| Idiomas soportados | No disponibles (probablemente inglés y chino, pero no se especifica) |
| Licencia | Apache-2.0 |
| Formato de pesos | No aplica (el repo contiene código, no pesos; los checkpoints se publican en repos enlazados) |

## Arquitectura y entrenamiento
El repositorio implementa tres estrategias de destilación sobre modelos base:

- **teacher-SFT**: el maestro genera trayectorias y el alumno las imita de forma offline.
- **OPD (on-policy distillation)**: el maestro puntúa los tokens que el alumno ha generado por sí mismo, calculando `advantages = teacher_logprobs - student_logprobs`, con `adv_estimator=token_reward_direct` y sin normalización. Se usa verl para esta línea.
- **ROSE**: el alumno escribe un prefijo de K tokens (mask=0), el maestro continúa desde ese punto generando t tokens, y la pérdida de entropía cruzada se aplica solo a los tokens del maestro (mask=1). El alumno aprende "qué haría el maestro a partir de este estado".

Para SciWorld se proporcionan dos implementaciones paralelas: una basada en Trinity (que produce los checkpoints `SCIENCEWORLD_{OPD,ROSE}/`) y otra escrita desde cero en `sciworld/impl/` que no depende de verl ni de Trinity. En el caso de destilación entre familias distintas (por ejemplo, Olmo-3-7B ← Qwen3-32B), el código soporta decodificación del prefijo del alumno, re-encodificado con el tokenizer del maestro, y viceversa, usando el chat template del maestro.

Los datos de entrenamiento varían según el dominio: RLVE usa 16k pasos con n=8 muestras; SciWorld usa 200 preguntas de evaluación (con ≤20 turnos, greedy, sin thinking); DAPO-Math usa AIME25 y HMMT25 como benchmarks con muestreo de 16 respuestas.

## Capacidades
- **Entrenamiento de modelos de lenguaje mediante destilación**: permite experimentar con tres estrategias (teacher-SFT, OPD, ROSE) y comparar su impacto en rendimiento.
- **Destilación cross-family**: soporta que alumno y maestro tengan vocabularios y tokenizers diferentes (por ejemplo, Olmo-3-7B ← Qwen3-32B).
- **Soporte multi-turno**: implementación específica para tareas de agente con múltiples turnos (SciWorld), con construcción de máscaras por turno.
- **Evaluación integrada**: incluye scripts de evaluación para AIME25, HMMT25 y RLVE, así como el protocolo de evaluación de AgentGym-RL (200 preguntas, greedy).
- **Configuración de entorno**: documentación de requisitos duros (vLLM 0.11.0, NCCL sin NVLS, flash_attn para verl) en `docs/ENV_NOTES.md`.

## Casos de uso
- **Investigación en destilación de modelos**: este framework permite comparar de forma controlada tres métodos de destilación sobre el mismo modelo base y conjunto de datos, con métricas de rendimiento (avg@8, pass@8, score, success). Es útil para estudiar cuándo la destilación on-policy supera a la SFT tradicional y cuándo falla.
- **Entrenamiento de modelos pequeños para agentes multi-turno**: el módulo SciWorld permite entrenar un modelo pequeño (Qwen3-1.7B) para tareas de interacción con un entorno (observar, actuar, recibir recompensas) usando ROSE, con resultados que mejoran significativamente sobre SFT (0.3127 vs 0.2077 de score).
- **Diagnóstico de fallos de destilación**: el caso DAPO-Math sirve como ejemplo de cómo un presupuesto de tokens del maestro insuficiente (1024 tokens) produce un aprendizaje incompleto; el repositorio incluye el análisis detallado (ce_loss, grad_norm, cobertura de tokens) que permite entender el fracaso.
- **Reproducción de experimentos**: el código está estructurado para reproducir exactamente las configuraciones (números de pasos, lr, precisiones) y comparar con resultados publicados en el README.
- **Integración con verl**: el framework verl_rose y verl_opd pueden usarse como punto de partida para integrar estas técnicas de destilación en otros pipelines de RLHF.
- **Evaluación de modelos en benchmarks matemáticos**: los scripts de evaluación para AIME25 y HMMT25 permiten medir el rendimiento de modelos destilados en tareas de razonamiento largo (con max_new_tokens 31744).

## Benchmarks y rendimiento
Los resultados reportados en el repositorio son los siguientes:

**RLVE (16k, n=8)**

| Linea | avg@8 | pass@8 | Resueltos |
|---|---|---|---|
| Baseline sin entrenar | 0.0333 | 0.1111 | 20 |
| OPD bf16 oficial (140 pasos) | 0.0458 | 0.1444 | 26 |
| OPD bf16 mini16 (140 pasos) | 0.0556 | 0.1722 | 31 |
| OPD fp32 (105 pasos) | **0.0694** | 0.1833 | 33 |
| OPD fp32 (132 pasos) | 0.0667 | 0.1833 | 33 |
| ROSE oficial (140 pasos) | **0.0701** | 0.1778 | 32 |
| ROSE oficial seed1 | 0.0729 | 0.1889 | 34 |
| teacher-SFT n4 bs256 | 0.0556 | 0.1500 | 27 |

**SciWorld (AgentGym, 200 preguntas, ≤20 pasos, greedy, nothink)**

| Modelo | Score | Success | Pass(>0) |
|---|---|---|---|
| Qwen3-1.7B base | 0.0479 | 0.0000 | 0.1650 |
| OPD lr1e-6 | 0.0421 | — | — |
| OPD lr1e-5 | 0.1931 | — | — |
| teacher-SFT | 0.2077 | 0.0450 | 0.4100 |
| **ROSE** | **0.3127** | — | — |
| Qwen3-32B teacher | 0.4346 | 0.1100 | 0.9350 |

**DAPO-Math (AIME25 / HMMT25, avg@16, thinking, temp 0.7, top_p 0.95, max_new 31744)**

| Modelo | AIME25 | HMMT25 |
|---|---|---|
| Qwen3-32B teacher | 0.7125 | 0.5042 |
| Qwen3-4B sin entrenar | 0.6521 | — |
| ROSE←32B 30 pasos (4B) | 0.6125 | — |
| Olmo-3-7B baseline | 0.5917 | 0.4167 |
| ROSE←32B 30 pasos (Olmo-7B) | 0.5750 | 0.3854 |
| ROSE←32B 220 pasos (Olmo-7B) | **0.5583** | **0.3688** |

El repositorio incluye además un análisis de diagnóstico para el caso DAPO-Math: la pérdida de CE se estanca a partir del paso 31, el grad_norm cae a 0.18, y la cobertura de tokens del maestro es solo del 6% (1024 de 16000-18600 tokens del alumno).

## Requisitos de hardware
No se especifican requisitos concretos en el repositorio. Sin embargo, se puede inferir:

- **Entrenamiento**: requiere GPUs con suficiente VRAM para los modelos base (por ejemplo, Qwen3-1.7B o Olmo-3-7B) y para el maestro (Qwen3-32B). El uso de verl y Trinity implica un entorno de entrenamiento distribuido con NCCL (aunque se desactiva NVLS).
- **Inferencia**: se usa vLLM para el maestro (versión 0.11.0), lo que sugiere que se necesita una GPU con suficiente memoria para el modelo maestro (por ejemplo, A100, H100 o RTX 4090 para modelos de 32B en cuantización).
- **Despliegue**: no se proporcionan opciones de despliegue (vLLM, Ollama, llama.cpp) porque el repositorio es de entrenamiento, no de inferencia.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares
No se han encontrado comparaciones directas con otros frameworks de destilación en el repositorio. No obstante, se puede comparar con las técnicas alternativas dentro del mismo proyecto:

| Técnica | Método | Rendimiento en SciWorld | Rendimiento en DAPO-Math (AIME25) | Requiere maestro |
|---|---|---|---|---|
| teacher-SFT | Imitación offline de trayectorias del maestro | 0.2077 | — | Sí |
| OPD (on-policy distillation) | Ventaja = logprob del maestro - logprob del alumno | 0.1931 (lr1e-5) | — | Sí |
| ROSE | Prefijo del alumno + continuación del maestro con máscara | 0.3127 | 0.5583 (Olmo-7B, 220 pasos) | Sí |

No se dispone de datos de otros frameworks como DPO o RLAIF en este repositorio.

## Limitaciones y advertencias
- **No es un modelo de inferencia**: este repositorio no contiene pesos de un modelo, sino código de entrenamiento. Para usar los modelos resultantes hay que acceder a los repositorios de checkpoint enlazados (por ejemplo, `SeanWang0027/ROSE-dq`, `SeanWang0027/SciWorld-dq`).
- **Resultados negativos**: el método ROSE produce un rendimiento inferior al maestro en DAPO-Math, y el propio autor indica que la causa es un presupuesto de tokens del maestro insuficiente (1024) que provoca que el maestro nunca termine las cadenas de razonamiento. Este resultado no debe generalizarse sin ajustar el presupuesto.
- **Sensibilidad a la precisión**: se observó que el entrenamiento en bf16 puede degradar el rendimiento en RLVE (0.0458 vs 0.0694 en fp32) debido a la resolución de las ventajas. Por tanto, es crítico elegir la precisión adecuada según el método.
- **Dependencias de entorno**: hay restricciones fuertes documentadas (vLLM 0.11.0, NCCL sin NVLS, flash_attn) que pueden dificultar la reproducción en otros entornos.
- **Sesgos y alucinaciones**: no se evalúan en el repositorio; no hay información sobre sesgos o alucinación de los modelos resultantes.
- **Licencia**: Apache-2.0, permite uso comercial, pero los modelos base (Qwen3, Olmo) tienen sus propias licencias que deben consultarse.

## Enlaces
- Repositorio principal: [https://huggingface.co/SeanWang0027/rose-opd-implementation](https://huggingface.co/SeanWang0027/rose-opd-implementation)
- Checkpoints y datos referenciados:
  - [OPD-dq](https://huggingface.co/SeanWang0027/OPD-dq)
  - [ROSE-dq](https://huggingface.co/SeanWang0027/ROSE-dq)
  - [SciWorld-dq](https://huggingface.co/SeanWang0027/SciWorld-dq)
  - [data-dq](https://huggingface.co/SeanWang0027/data-dq)
- Modelo de ejemplo: [official-rose-qwen3-1.7b-from-4b-thinking](https://huggingface.co/SeanWang0027/official-rose-qwen3-1.7b-from-4b-thinking)
- Dataset: [SeanWang0027/Multi-Turn](https://huggingface.co/datasets/SeanWang0027/Multi-Turn)

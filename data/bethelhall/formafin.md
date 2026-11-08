# bethelhall/formafin

## Resumen

FormaFin es un adaptador LoRA sobre Qwen2.5-Coder-7B-Instruct desarrollado por Bethel Hall, investigador centrado en verificación formal de salidas de LLM. El modelo traduce cláusulas de covenants financieros (las condiciones que un préstamo impone al prestatario, como un ratio máximo de deuda sobre EBITDA) a fórmulas SMT-LIB2 con una función `covenant_holds(...)` que el solver Z3 puede evaluar de forma exacta contra las partidas del certificado de cumplimiento del prestatario.

El problema que resuelve es concreto: la revisión trimestral de covenants en banca se hace hoy manualmente o con heurísticas frágiles sobre texto libre, y los LLM genéricos alucinan cifras y condiciones. FormaFin no calcula el resultado por sí mismo: genera una fórmula formal verificable, y Z3 responde de forma determinista al estado (cumple, incumple o indeterminado), al margen de beneficios antes del incumplimiento y a la capacidad adicional de deuda. Al ser un adaptador de 7B ejecutable en una sola GPU, las cifras confidenciales del certificado nunca salen del entorno del banco: entran al solver como hechos.

La relevancia es doble: es un caso de autoformalización con recompensa verificada por solver (GRPO sin juez LLM ni etiquetas) y un ejemplo de despliegue pequeño y auditable en un dominio regulado. El repositorio incluye cinco adaptadores con sus puntuaciones de benchmark, siendo `rl_v2_s42` el run preregistrado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder-7B-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 7B (modelo base); el adaptador LoRA no se especifica en la informacion disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-Coder-7B-Instruct; no se indica en la model card) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | ingles (declarado en la model card) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base Qwen/Qwen2.5-Coder-7B-Instruct |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (rango 16, alpha 32, aplicado a todas las proyecciones de atención y MLP) sobre Qwen2.5-Coder-7B-Instruct, un transformer decoder-only de 7B parámetros. La tarea es de autoformalización restringida: dada una cláusula de covenant y una lista exacta de parámetros (una `Real` por partida del certificado, `test_date` como `Int` en formato YYYYMMDD y una `Bool` por cada flag de condición), el modelo debe emitir un comando `set-logic` y una única `define-fun covenant_holds` que devuelva `Bool`.

El entrenamiento tiene dos fases. Primero, SFT sobre 789 pares escritos por un modelo profesor a partir de 1.000 cláusulas de ratios financieros extraídas de contratos de crédito de EDGAR; cada par se conservó solo si Z3 lo parsea, una revisión semántica lo acepta y cada parámetro tiene un comentario fundamentado (1 época, learning rate 1e-4). Después, GRPO con TRL sobre 586 cláusulas adicionales sin etiquetas, 1.000 pasos, 4 muestras por cláusula, temperatura 0.8, learning rate 5e-6 y sin penalización KL. La innovación clave es la recompensa verificada por solver sin juez ni etiquetas: una puerta de interfaz que asigna 0 si la fórmula no conserva exactamente los parámetros requeridos o Z3 no la parsea, y una puntuación de solver `s` que, para cada límite escrito en la cláusula, comprueba con Z3 que la fórmula permite cumplir justo dentro del límite, se comporta correctamente en el límite y fuerza incumplimiento justo fuera. La recompensa final es `0.3 + 0.7 * s`.

## Capacidades

- Generación de fórmulas SMT-LIB2 (`QF_NRA`, `QF_LIA` o `QF_LRA`) para cláusulas de covenants financieros.
- Autoformalización con interfaz de parámetros estricta: respeta nombres, orden y tipos exigidos.
- Razonamiento sobre umbrales variables en el tiempo mediante comparaciones con `test_date`.
- Soporte de ratios financieros como deuda total / EBITDA y condiciones múltiples dentro de una misma cláusula.
- Integración con Z3 para responder estado (cumple, incumple, indeterminado), margen de beneficios y capacidad de deuda mediante bisección.
- Generación de texto y código en inglés (heredado del modelo base), aunque el uso previsto es la formalización.
- No se documenta soporte de tool calling, agentes multi-paso, visión ni audio.

## Casos de uso

- Revisión trimestral de covenants en banca: el modelo formaliza cada cláusula del contrato de crédito y Z3 evalúa el certificado del prestatario para emitir estado de cumplimiento, con trazabilidad completa de la fórmula generada.
- Cálculo del margen de beneficios (earnings cushion): mediante bisección sobre la partida variable con la misma comprobación de Z3, se obtiene cuánto puede caer el EBITDA antes de incumplir, útil para informes de riesgo de crédito.
- Cálculo de capacidad adicional de deuda: el evaluador bisecciona la partida de deuda para determinar cuánto más puede endeudarse el prestatario sin romper el ratio, dato que alimenta decisiones de refinanciación.
- Despliegue en entorno confidencial: al ejecutarse en una sola GPU en las instalaciones del banco, las cifras del certificado entran directamente al solver como hechos y no se envían a ningún proveedor externo de modelos.
- Auditoría y reproducibilidad regulatoria: cada respuesta queda respaldada por una fórmula SMT-LIB2 parseable y una consulta Z3 reproducible, lo que facilita la revisión por auditores internos y supervisores.
- Detección de cláusulas indeterminadas: el evaluador distingue explícitamente el estado indeterminado, señalando cláusulas cuya formalización o cuyos datos no permiten decidir, para escalar a revisión humana.
- Investigación en neurosymbolic AI safety: el pipeline sirve como banco de pruebas para recompensas verificadas por solver en post-entrenamiento con GRPO, replicable en otros dominios con lógica formal.

## Benchmarks y rendimiento

La model card reporta una puntuación media por cláusula sobre un benchmark con 143 cláusulas de covenants de prestatarios que nunca aparecen en entrenamiento y 1.064 certificados de cumplimiento construidos (los certificados trimestrales entregados no son públicos). La puntuación del benchmark se detalla por adaptador:

| Adaptador | Entrenamiento | Puntuacion |
|---|---|---|
| `rl_v2_s43` | SFT + GRPO, semilla 43 | 96.2 |
| `rl_v2_s42` (recomendado, preregistrado) | SFT + GRPO, semilla 42 | 95.0 |
| `rl_v2_s44` | SFT + GRPO, semilla 44 | 93.8 |
| `sft789` | Solo SFT (789 pares) | 85.8 |
| `rl_v1` | Primer run GRPO, recompensa sin puerta de interfaz | 58.4 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La comparación entre `rl_v1` (58.4) y `rl_v2_s42` (95.0) cuantifica el efecto de la puerta de interfaz en la recompensa.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA añade una sobrecarga mínima; el modelo base de 7B en bfloat16 requiere aproximadamente 14-16 GB de VRAM, y en cuantización de 4 bits alrededor de 4-6 GB (estimación estándar para un transformer de 7B; no se indica en la model card).
- GPU recomendadas: una sola GPU es suficiente según el autor; una A100 o H100 permiten mayor throughput, y una RTX 4090 (24 GB) cubre el modelo en bfloat16.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 16 GB en bfloat16 o 8 GB con cuantización de 4 bits del modelo base.
- Opciones de despliegue: transformers + PEFT (mostrado en la model card), con `device_map="auto"`; vLLM, llama.cpp, Ollama y TGI no se documentan para este adaptador, aunque son viables cargando el adaptador fusionado con el modelo base.
- Latencia y throughput: no disponibles en la información proporcionada.
- Dependencias adicionales: `z3-solver` para la verificación de fórmulas.

## Comparativa con modelos similares

No se han identificado en la información proporcionada modelos directamente comparables de autoformalización de covenants financieros con recompensa verificada por solver. La comparación más informativa es interna, entre los propios adaptadores del repositorio:

| Modelo | Parametros | Contexto | Puntuacion benchmark | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FormaFin `rl_v2_s42` | 7B (LoRA) | no disponible | 95.0 | MIT | Hugging Face |
| FormaFin `sft789` | 7B (LoRA) | no disponible | 85.8 | MIT | Hugging Face |
| Qwen2.5-Coder-7B-Instruct (base, sin adaptador) | 7B | no disponible | no disponible | no disponible en la informacion | Hugging Face |

## Limitaciones y advertencias

- El benchmark usa certificados de cumplimiento construidos, no certificados trimestrales reales, por lo que el rendimiento en producción puede diferir.
- El modelo solo ha sido entrenado y evaluado en inglés; no se documenta soporte multilingüe.
- El dominio está restringido a cláusulas de covenants financieros con ratios; fuera de ese ámbito la tasa de formalizaciones correctas no está caracterizada.
- La fórmula generada debe pasar la puerta de interfaz (parámetros exactos y parseo por Z3); si falla, no es evaluable y el sistema debe tratar el caso como indeterminado.
- Riesgo de alucinación en la formalización: una fórmula sintácticamente válida puede no capturar fielmente la semántica de la cláusula, de ahí la revisión semántica en la fase de datos y la necesidad de auditoría humana en producción.
- El adaptador `rl_v1` no se recomienda por su baja puntuación (58.4).
- Licencia MIT, que permite uso comercial, pero no se documentan garantías ni limitaciones de responsabilidad adicionales más allá de las de la propia licencia.
- No se documentan sesgos específicos del adaptador; los sesgos del modelo base Qwen2.5-Coder-7B-Instruct no se detallan en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bethelhall/formafin
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Código, datos y benchmark: https://github.com/verifiedfinance/loan-agent
- TRL (framework de GRPO): https://github.com/huggingface/trl
- Web del autor: https://bethelhall.tech/
- Currículum del autor: https://bethelhall.tech/data/resume_bethel.pdf

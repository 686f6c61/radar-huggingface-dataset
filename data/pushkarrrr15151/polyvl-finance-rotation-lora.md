# Pushkarrrr15151/PolyVL-finance-rotation-lora

## Resumen

PolyVL-finance-rotation-lora es un adaptador LoRA de aprendizaje por refuerzo (PPO) publicado por el usuario Pushkarrrr15151 sobre el modelo base InternLM2.5-1.8B-Chat, congelado durante el entrenamiento. No se trata de un modelo de lenguaje conversacional al uso, sino de una política de asignación de cartera que combina un backbone transformer de 1.800 millones de parámetros con cabeceras numéricas específicas (actor-crítico) para gestionar diariamente 49 acciones del índice indio Nifty 50. El adaptador se aplica únicamente a las proyecciones de atención `wqkv` y `wo` con rango r=16 y α=32.

La relevancia del proyecto radica en su enfoque híbrido: utiliza un LLM congelado como extractor de representaciones y añade un "puente numérico" (codificadores de features de mercado, estado de cartera y métricas de riesgo, más cabeceras actor y crítico) que produce logits de asignación continua con un tope del 30% por activo. El pipeline declarado es `reinforcement-learning`, no `text-generation`, y el repositorio tiene un tamaño de 0.0 GB, lo que sugiere que los pesos publicados son únicamente los del adaptador LoRA y las cabeceras PPO, no el modelo base completo.

La información disponible es escasa y proviene exclusivamente de la model card del autor. No hay datos publicados sobre composición del dataset de entrenamiento más allá de la ventana de observación (5×30×49), ni sobre el número de tokens, ni sobre evaluación en benchmarks estándar de NLP. La evaluación reportada es financiera (equity final, drawdown, volatilidad) sobre un holdout ciego de 2023-01-01 a 2024-12-31.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (InternLM2.5-1.8B) congelado + adaptador LoRA + cabeceras PPO (actor-crítico) y codificadores numéricos MLP |
| Parametros totales | No disponible (el adaptador LoRA con r=16 sobre `wqkv` y `wo` de un modelo de 1.8B; el recuento exacto del adaptador no se especifica) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base InternLM2.5-1.8B soporta contexto largo, pero la ficha no lo declara; la ventana de observación es de 5×30×49) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (adaptador y modelo base) |
| Formato de pesos | safetensors (adaptador LoRA) y `ppo_heads.pt` (cabeceras PPO en PyTorch) |

## Arquitectura y entrenamiento

El sistema se compone de tres bloques. Primero, el backbone `internlm/internlm2_5-1_8b-chat` permanece congelado y actúa como extractor de representaciones. Segundo, un adaptador LoRA de rango 16 y α=32 se inserta en las proyecciones de atención `wqkv` y `wo`, almacenado en `finance_lora/`. Tercero, un conjunto de cabeceras PPO en `ppo_heads.pt` incluye: un codificador MLP de features de mercado que mapea ventanas temporales de dimensión (5×30×49) a un espacio oculto; un codificador de estado de cartera con LayerNorm + Linear sobre las asignaciones actuales; un codificador de métricas de riesgo (volatilidad móvil, drawdown actual y buffer de liquidez); una cabecera actor que emite logits de asignación continua con tope del 30% por activo; y una cabecera crítico que estima el valor del estado de la cartera.

El entrenamiento se realiza con PPO (Proximal Policy Optimization) sobre el entorno de 49 acciones del Nifty 50. La model card no especifica el número de tokens de entrenamiento, la composición del dataset más allá de las matrices de precios, ni si hubo etapas de RLHF o DPO adicionales. Se mencionan dos configuraciones de entrenamiento: una "smoke" de 512 pasos y una "production" de 70.000 pasos. Los datos crudos de precios no se redistribuyen por restricciones de las bolsas; en su lugar se proporcionan `environment_config.json`, las definiciones de ventana de observación y el script `prepare_nifty50_data.py` para reproducción offline. La innovación técnica destacable es el "puente numérico": usar un LLM congelado como codificador de contexto y acoplar cabeceras específicas de dominio para la toma de decisiones financieras, en lugar de ajustar el modelo para generar texto.

## Capacidades

- Toma de decisiones de asignación de cartera: emite logits de asignación continua sobre 49 activos con restricción de concentración del 30% por activo.
- Codificación de series temporales financieras: procesa ventanas de (5×30×49) mediante un MLP dedicado.
- Estimación de valor de estado: cabecera crítico para evaluación de políticas en PPO.
- Integración de métricas de riesgo: volatilidad móvil, drawdown y buffer de liquidez como features de entrada.
- Aprendizaje por refuerzo: política entrenada con PPO, no con supervisión directa.
- No se declaran capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo en la información disponible.
- No se declara modo "thinking", visión, audio ni capacidades multimodales.

## Casos de uso

- Gestión automatizada de cartera índice: el sistema puede generar asignaciones diarias sobre las 49 acciones del Nifty 50 respetando el tope del 30% por activo, adecuado para estrategias cuantitativas de rotación.
- Investigación en RL financiero: sirve como punto de partida reproducible (con `prepare_nifty50_data.py` y `environment_config.json`) para experimentar con PPO sobre un backbone LLM congelado.
- Backtesting de políticas de asignación: el script `evaluate_policy.py` y el holdout 2023-2024 permiten replicar la evaluación reportada y comparar contra el baseline equal-weight.
- Estudio de arquitecturas híbridas LLM + cabeceras numéricas: útil para investigadores que quieran evaluar si un backbone de 1.8B aporta representaciones útiles frente a codificadores específicos.
- Prototipado de sistemas de control de riesgo: los codificadores de volatilidad, drawdown y liquidez pueden reutilizarse como módulos en pipelines de gestión de riesgo.
- Educación y reproducción académica: la separación entre adaptador, cabeceras y scripts de datos facilita la disección del sistema en cursos o papers.
- No se recomienda su uso en producción financiera real sin validación independiente, dado el tamaño reducido del holdout y los resultados mixtos reportados.

## Benchmarks y rendimiento

Los únicos datos de evaluación disponibles son financieros, sobre un holdout ciego de 2023-01-01 a 2024-12-31 con capital inicial de ₹1,00,000 (100.000 rupias):

| Configuracion | Equity final | Retorno | Max drawdown | Vol. diaria |
|---|---|---|---|---|
| Baseline equal-weight 1/49 buy-and-hold | ₹1,50,471 | +50,47% | 12,47% | 0,0076 |
| Honest smoke (512 pasos) | ₹1,51,187 | +51,19% (+0,47% vs baseline) | No disponible | No disponible |
| Production run (70k pasos) | ₹1,41,251 | No disponible | 22,44% | No disponible |
| Leaky comparison (vio el test) | ₹1,57,138 | +4,43% de ventaja (ilustrativo) | No disponible | No disponible |

No se han publicado resultados de benchmarks estándar de NLP (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El "production run" de 70.000 pasos obtiene peor equity final que el baseline y un drawdown casi el doble, lo que el autor atribuye a "penalización conservadora".

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El backbone InternLM2.5-1.8B en FP16 requiere aproximadamente 3,6 GB solo para pesos; en 8-bit unos 1,8 GB; en 4-bit unos 0,9 GB. A ello hay que sumar el adaptador LoRA (pequeño) y las cabeceras PPO.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 3060 12 GB, RTX 4070, RTX 4090 o A100 son suficientes para el backbone en FP16.
- Cabe en GPU de consumo: sí, el backbone de 1.8B es apto para GPUs consumer de 8 GB o más en cuantización 8-bit o 4-bit.
- Opciones de despliegue: no se declaran. El pipeline es `reinforcement-learning` y la librería `peft`; el despliegue requiere cargar el backbone con Transformers + PEFT y ejecutar `evaluate_policy.py`. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, dado que la salida no es texto sino logits de asignación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (adaptadores RL financieros sobre LLM congelado). Se indica "no disponible" para una comparativa rigurosa.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PolyVL-finance-rotation-lora | Adaptador sobre 1.8B | No disponible | Asignación de cartera (RL) | Apache-2.0 | Hugging Face |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Resultados mixtos: el "production run" de 70.000 pasos rinde peor que el baseline equal-weight (₹1,41,251 frente a ₹1,50,471) y con mayor drawdown (22,44% frente a 12,47%).
- El "smoke run" de 512 pasos solo supera al baseline en un 0,47%, margen que puede estar dentro del ruido estadístico.
- El "leaky comparison" vio el periodo de test y no es válido como evidencia de rendimiento.
- Sesgos conocidos: no documentados. El entrenamiento se limita a 49 acciones indias del Nifty 50, por lo que el modelo está fuertemente sesgado hacia ese mercado y periodo (hasta 2024).
- Riesgo de sobreajuste al régimen de mercado del holdout 2023-2024; no hay validación out-of-sample adicional reportada.
- Limitaciones de idioma: no se declaran idiomas soportados; el sistema no es un modelo de texto y no debe usarse para generación.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero los datos de precios no se redistribuyen por restricciones de las bolsas; la reproducibilidad depende de que el usuario obtenga los datos por su cuenta.
- Caveat para producción: no hay evidencia de robustez en mercados distintos del Nifty 50, ni de manejo de costes de transacción, slippage o liquidez más allá del "buffer de liquidez" mencionado.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en 2026-11-18; no hay validación comunitaria independiente.
- El tamaño del repo es 0.0 GB, lo que sugiere que los pesos del backbone no están incluidos y deben descargarse por separado.
- No se han publicado benchmarks estándar de NLP ni evaluaciones de robustez adversarial.

## Enlaces

- Hugging Face: https://huggingface.co/Pushkarrrr15151/PolyVL-finance-rotation-lora
- Modelo base: https://huggingface.co/internlm/internlm2_5-1_8b-chat
- Cita del autor: Polyvalent Research Team, "Polyvalent: Single-Base Multi-Specialist Architecture with Dynamic Adapter Residency", 2026 (sin URL disponible)
- Scripts mencionados en la model card: `prepare_nifty50_data.py`, `evaluate_policy.py`, `replay_instructions.md`, `environment_config.json` (sin URL directa disponible; se asume que están en el repositorio de Hugging Face)

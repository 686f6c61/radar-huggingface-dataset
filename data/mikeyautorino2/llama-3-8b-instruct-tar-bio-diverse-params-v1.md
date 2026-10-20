# mikeyautorino2/Llama-3-8B-Instruct-TAR-Bio-diverse-params-v1

## Resumen

Llama-3-8B-Instruct-TAR-Bio-diverse-params-v1 es un checkpoint de investigación publicado por el usuario mikeyautorino2 en HuggingFace, construido sobre Llama-3-8B-Instruct y entrenado con la técnica TAR (Tamper-Resistant Safeguards) aplicada al dominio de bioseguridad. El objetivo no es ofrecer un modelo de propósito general, sino estudiar si las salvaguardas resistentes a manipulación sobreviven a intentos deliberados de fine-tuning que busquen recuperar conocimiento biológico peligroso.

El modelo parte de lapisrocks/Llama-3-8B-Instruct-Random-Mapped-Bio, el mismo punto de arranque que el checkpoint oficial TAR-Bio-v2, y solo se diferencia de este en cómo se muestrean los ataques de fine-tuning simulados durante el entrenamiento. Concretamente, amplía el conjunto de hiperparámetros del atacante (tasas de aprendizaje, planificadores de decaimiento y pasos de warmup), manteniendo constante el coste computacional del ataque. Es, por tanto, un experimento controlado de una sola variable.

Su relevancia es metodológica: permite comprobar empíricamente si una mayor diversidad en los ataques simulados produce salvaguardas más duraderas frente a los ataques de fine-tuning descritos por Qi et al. (2024). El autor declara explícitamente que el checkpoint no ha sido evaluado todavía y que cualquier afirmación sobre su robustez debe considerarse no verificada. No está pensado para despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Llama 3), ajustado con TAR |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Llama-3-8B-Instruct) |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en bfloat16 (safetensors) |
| Idiomas soportados | No disponible |
| Licencia | llama3 (Llama 3 Community License) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama-3-8B-Instruct: un transformer decoder-only denso con 8.030 millones de parámetros, sin mezcla de expertos. Sobre esa base se aplica el procedimiento TAR de Tamirisa et al. (2024), que combina un bucle exterior de optimización con ataques de fine-tuning simulados internos. En cada paso exterior se muestrea un ataque (datos de adversario, hiperparámetros del optimizador interno) y se optimiza una pérdida de máxima entropía sobre los pesos del atacante, junto con una pérdida de retención basada en representación. El resultado es un modelo cuyos pesos están configurados para resistir la recuperación de conocimiento biológico tras un ajuste fino malicioso.

El entrenamiento se ejecutó durante 750 pasos exteriores con AdamW sin planificador y LR exterior de 2e-5 (32 pasos de warmup), sobre 1 nodo con 4 GPU H100 de 80 GB usando FSDP y checkpointing de gradientes, con acumulación de gradientes 4 para igualar los tamaños de lote globales de la ejecución oficial de 8 GPU (128 para retención y resistencia a manipulación, 64 para el adversario). El microbatch de datos de retención del adversario se redujo de 8 a 4 por memoria. El tiempo total fue de unas 30 horas, en float32 con precisión mixta bf16, y los pesos publicados se convierten a bfloat16. La única diferencia respecto a TAR-Bio-v2 está en el muestreo de hiperparámetros del ataque: tasas de aprendizaje de {2e-6, 1e-5, 2e-5, 3e-5, 4e-5, 6e-5, 1e-4} en lugar de {2e-6, 2e-5, 4e-5}; planificadores constante, decaimiento lineal y decaimiento coseno en lugar de solo constante; y warmup de 0 o 10 pasos en lugar de solo 0. Los pasos de ataque (64) y el tamaño de lote global del ataque (64) se mantienen idénticos, de modo que ambos modelos consumen el mismo cómputo de ataque. Las tasas más altas (6e-5, 1e-4) actúan como aproximación burda, y no equivalente, a ataques más largos. Los tipos de datos del adversario (Pile-Bio, Camel-Bio, conmutador retain→forget), la pérdida de resistencia a manipulación, la pérdida de retención con ingeniería de representación y el optimizador exterior no cambian.

## Capacidades

- Generación de texto conversacional en formato instruct, heredada de Llama-3-8B-Instruct.
- Resistencia a la manipulación (tamper resistance): el objetivo declarado del entrenamiento es mantener las salvaguardas frente a fine-tuning adversario orientado a recuperar conocimiento biológico peligroso.
- Capacidad de «olvido» (unlearning) dirigida al dominio de bioseguridad, inducida mediante los datos de adversario Pile-Bio y Camel-Bio.
- Razonamiento y código: no evaluados en esta ficha; se heredan las capacidades del modelo base, sin verificación específica tras el entrenamiento TAR.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; no documentado por el autor.
- Capacidades multilingües: no disponibles; no se documenta la composición idiomática.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Investigación en salvaguardas resistentes a manipulación: reproducir el experimento del autor comparando este checkpoint con TAR-Bio-v2 bajo los mismos ataques de Qi et al. (2024) para aislar el efecto de la diversidad de hiperparámetros del atacante.
- Estudios de durabilidad de salvaguardas en modelos de pesos abiertos: usar el checkpoint como sujeto de ataques de fine-tuning con distintos presupuestos (LoRA, full fine-tuning, distintas tasas de aprendizaje) y medir la recuperación de conocimiento biológico.
- Ablaciones metodológicas de TAR: entrenar variantes con otros espacios de hiperparámetros y comparar curvas de robustez frente a coste de ataque, usando este modelo como referencia intermedia.
- Evaluación de «olvido» (unlearning): analizar si el modelo conserva capacidades generales tras el proceso de olvido en biología, midiendo degradación en tareas de propósito general.
- Docencia y divulgación técnica: ilustrar en cursos de seguridad de IA cómo se construye un checkpoint con salvaguardas entrenadas y por qué la evaluación empírica es imprescindible antes de cualquier afirmación de robustez.
- Red-teaming académico controlado: servir de banco de pruebas para pipelines de evaluación de riesgo biológico (biorisk) en entornos con supervisión institucional, nunca para obtener conocimiento operativo peligroso.
- Análisis de estabilidad del entrenamiento: el par de checkpoints (este y TAR-Bio-v2) permite estudiar la varianza entre ejecuciones con idéntico coste computacional pero distinto muestreo del adversario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el checkpoint «no ha sido evaluado todavía» y que cualquier afirmación sobre robustez debe tratarse como no verificada. La evaluación prevista utiliza los ataques de fine-tuning de Qi et al. (2024), cuyos resultados no se incluyen en la model card.

## Requisitos de hardware

- Inferencia en bfloat16: aproximadamente 16,1 GB de pesos, más caché KV; se recomienda un mínimo de 18-20 GB de VRAM para contexto moderado.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB; en 4 bits, en torno a 5-6 GB (estimaciones calculadas a partir del número de parámetros, no verificadas para este checkpoint).
- GPU profesionales: cabe con holgura en A100 40/80 GB, H100 80 GB y L40S 48 GB.
- GPU de consumo: previsiblemente cabe en RTX 3090/4090 (24 GB) en bfloat16, y en RTX 4080/4070 Ti (16 GB) solo con cuantización. No verificado por el autor.
- Entrenamiento (referencia del autor): 1 nodo con 4 GPU H100 80 GB, FSDP y checkpointing de gradientes, ~30 horas de reloj.
- Opciones de despliegue: transformers (cargado con `torch_dtype="bfloat16"` y `device_map="auto"`), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repo). vLLM, llama.cpp u Ollama no están documentados para este checkpoint y requerirían conversión propia, ya que no se publican pesos GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Estado |
|---|---|---|---|---|---|
| Llama-3-8B-Instruct-TAR-Bio-diverse-params-v1 (este) | 8,03 B | No disponible | TAR con ataques simulados de hiperparámetros diversos | llama3 | Sin evaluar |
| lapisrocks/Llama-3-8B-Instruct-TAR-Bio-v2 | 8,03 B (misma base) | No disponible | TAR con muestreo de ataques del baseline | llama3 | Referencia del autor |
| lapisrocks/Llama-3-8B-Instruct-Random-Mapped-Bio | 8,03 B (misma base) | No disponible | Punto de partida con mapeo aleatorio en dominio bio | No disponible | Modelo base |
| Llama-3-8B-Instruct (Meta) | 8,03 B | 8.192 tokens (familia Llama 3) | Modelo instruct generalista sin salvaguardas TAR | llama3 | Ampliamente evaluado |

La comparación relevante es interna al linaje TAR: este checkpoint y TAR-Bio-v2 comparten datos, pérdidas, optimizador exterior y coste de ataque, y difieren únicamente en la distribución de hiperparámetros del atacante simulado. Frente a Llama-3-8B-Instruct, el trade-off esperado es menor utilidad general a cambio de mayor resistencia a la manipulación, si bien ese intercambio no está cuantificado en la información disponible.

## Limitaciones y advertencias

- Modelo sin evaluar: el autor declara que no ha sido red-teameado y que las afirmaciones de robustez son no verificadas. No debe presentarse como seguro sin evidencia empírica.
- No apto para despliegue: la model card indica explícitamente que su uso previsto es la investigación sobre salvaguardas y su evaluación, no la puesta en producción.
- Dominio sensible: el entrenamiento afecta a conocimiento de bioseguridad; los experimentos deben realizarse bajo supervisión institucional y con controles de acceso adecuados.
- Riesgo de alucinación: no cuantificado para este checkpoint; se hereda el comportamiento del modelo base, potencialmente alterado por el proceso de olvido.
- Degradación de capacidades generales: el entrenamiento TAR puede reducir el rendimiento en tareas ajenas al dominio de bioseguridad; no se han publicado mediciones de MMLU, HumanEval, GSM8K ni similares.
- Idiomas: no se documenta la cobertura idiomática; se desconoce si el proceso de olvido afecta de forma desigual a distintas lenguas.
- Sesgos: no evaluados en la información proporcionada; se heredan los sesgos de Llama-3-8B-Instruct y de los datos de entrenamiento TAR.
- Licencia: Llama 3 Community License, con las restricciones de uso comercial y de redistribución que impone Meta, incluida la obligación de incluir el aviso de licencia y la política de uso aceptable. Verificar cumplimiento antes de cualquier uso derivado.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de replicación independiente de los resultados.
- Formato: solo se publican pesos en bfloat16; no hay GGUF ni cuantizaciones listas, lo que limita el despliegue en hardware de consumo sin trabajo adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mikeyautorino2/Llama-3-8B-Instruct-TAR-Bio-diverse-params-v1
- Modelo base: https://huggingface.co/lapisrocks/Llama-3-8B-Instruct-Random-Mapped-Bio
- Checkpoint de referencia TAR-Bio-v2: https://huggingface.co/lapisrocks/Llama-3-8B-Instruct-TAR-Bio-v2
- Tamirisa et al., «Tamper-Resistant Safeguards for Open-Weight LLMs» (2024): https://arxiv.org/abs/2408.00761
- Qi et al., «On Evaluating the Durability of Safeguards for Open-Weight LLMs» (2024): https://arxiv.org/abs/2412.07097

Nota: la búsqueda web asociada a esta ficha devolvió únicamente resultados sin relación con el modelo (mods de videojuegos), por lo que se han descartado y no se incluyen en los enlaces.

# dimitarpg13/semsimula-ladder-owt-d384-l2-attention-potential

## Resumen

`semsimula-ladder-owt-d384-l2-attention-potential` es un modelo de lenguaje de investigación publicado por el usuario dimitarpg13 en HuggingFace, integrado en la "SemSimula mechanism ladder": una colección de cinco (más dos de control) modelos entrenados sobre OpenWebText con idéntico presupuesto de tokens, que se diferencian entre sí en exactamente un mecanismo. El objetivo no es ofrecer un modelo de producción, sino medir el coste en perplejidad de cada componente arquitectónico mediante comparación controlada. Este brazo concreto elimina la conservatividad: mantiene la atención enrutada por ξ, pero la introduce como potencial escalar, de modo que la fuerza resultante sigue siendo un gradiente.

La arquitectura declarada es Fock-PARFLM v2.1, un modelo de espacio de Fock con registros virtuales y campo de intercambio, derivado de mecánica lagrangiana y formulado como modelo basado en energía. Tiene 77.360.081 parámetros, dimensión oculta d=384 y L=2 capas, con un bloque de contexto de 512 tokens. Se entrenó con 532.480.000 tokens (32.500 pasos × 32 × 512) sobre Skylion007/openwebtext, con tasa de aprendizaje 0,0012.

Su relevancia es metodológica: cada hueco de la escalera pone precio a un mecanismo concreto, y este brazo cuantifica el "precio de la conservatividad" en 17,39 puntos de perplejidad (+27,4 %) frente al brazo con campo de intercambio activo. La perplejidad asentada es 80,90, frente al baseline GPT-2 emparejado con 49,81, lo que supone un ratio de 1,624×. La predicción pre-registrada (66, banda 62-72) no se cumplió, con un error de +14.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fock-PARFLM v2.1 + XiRoutedConservativeAttention añadida a Vφ, λ fijado en 1,0 (no transformer, declarada "attention-free" en los tags) |
| Parametros totales | 77.360.081 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (bloque de entrenamiento y de evaluación; no se declara ventana superior) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-4.0 |
| Formato de pesos | checkpoints de PyTorch (repositorio de 0,6 GB); no se declaran safetensors ni GGUF |
| Dimension oculta / capas | d=384, L=2 |
| Tokens de entrenamiento | 532.480.000 (32.500 pasos × 32 × 512) |
| Tasa de aprendizaje | 0,0012 |
| Dataset | Skylion007/openwebtext (split de validación para evaluación) |
| Pipeline | text-generation |
| Libreria | pytorch |

## Arquitectura y entrenamiento

El modelo pertenece a la familia Fock-PARFLM, que no es un transformer: integra un sistema mecánico amortiguado en espacio semántico mediante la ecuación de movimiento m·ḧ = −∇V_θ(h) − γm·ḣ + F_rc(h, r) + F_φ(h). V_θ es el potencial escalar puntual, V_φ el potencial pairwise (PARF) y F_rc el "reverse channel" a través del cual el banco de registros virtuales actúa sobre el estado de los tokens. En este brazo concreto, la atención enrutada por ξ se incorpora como potencial escalar sobre V_φ con λ fijado a 1,0, de forma que la fuerza permanece siendo un gradiente. La consecuencia formal es que el término no conservativo F_rc queda como el único responsable de que la trayectoria no sea geodésica; cuando F_rc = 0 (brazo `none-norc`), V = V_θ + V_φ admite una métrica de Jacobi y el paso se convierte en su geodésica amortiguada.

El entrenamiento se diseñó como estudio de ablación pre-registrado con presupuesto de tokens emparejado: los 532.480.000 tokens son idénticos en todos los brazos de la escalera, sobre el mismo corpus, tokenizador y lotes de validación, de modo que cualquier diferencia de perplejidad se atribuye al mecanismo eliminado y no al presupuesto. No se documenta en la información disponible el uso de RLHF, DPO ni fases de ajuste por preferencias; tampoco se detalla la composición exacta del preprocesado del corpus más allá de OpenWebText. Las predicciones de la escalera (incluidos los resultados de los brazos SPLM) se registraron antes de ejecutar los entrenamientos, lo que constituye la innovación metodológica principal del trabajo.

## Capacidades

- Generación de texto autoregresiva en inglés (pipeline declarado: text-generation).
- Modelado de lenguaje a nivel de token con contexto de 512 tokens.
- Razonamiento multi-paso: no documentado en la información disponible.
- Tool calling / function calling: no documentado; no hay plantilla de chat ni formato de herramientas en la model card.
- Soporte de agentes: no documentado.
- Capacidades multilingües: no; el único idioma declarado es inglés.
- Capacidades especiales: no hay modo "thinking", visión ni audio. La característica diferencial es arquitectónica (potencial escalar conservativo, registros virtuales, campo de intercambio), no funcional.
- Modo de evaluación: proporciona perplejidad de validación sobre OpenWebText a bloque 512.

## Casos de uso

- Ablación controlada de mecanismos: usar este brazo junto con los otros seis de la escalera para aislar el efecto de la conservatividad en el rendimiento del modelado de lenguaje, con presupuesto de tokens idéntico. Es su caso de uso principal y para el que fue diseñado.
- Investigación en modelos basados en energía y física: sirve como implementación de referencia de un sistema lagrangiano con potencial escalar y pairwise, útil para reproducir o extender formulaciones mecánicas del estado oculto.
- Estudio de alternativas al transformer: con 77,36 M de parámetros y L=2, permite comparar arquitecturas no-attention frente a un baseline GPT-2 emparejado en el mismo corpus y tokenizador.
- Validación de protocolos pre-registrados: el fallo documentado de la predicción (66 predicho frente a 80,90 obtenido) es material directo para estudiar sesgos de calibración en investigación empírica de arquitecturas.
- Experimentos de escalado de bajo coste: al ser un modelo pequeño (repositorio de 0,6 GB) y con contexto de 512 tokens, se puede entrenar y evaluar de principio a fin en hardware de consumo, lo que lo hace viable para réplicas académicas.
- Docencia y divulgación técnica: ilustra de forma concreta cómo se traduce una formulación matemática (métrica de Jacobi, fuerza no conservativa) en una decisión de implementación con impacto medible en perplejidad.
- No se recomienda su uso en aplicaciones de producción orientadas a usuario final: no hay instrucciones de despliegue, formato de chat ni datos de robustez.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados por un tercero):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| text-generation | OpenWebText (split validation) | Perplejidad de validación a bloque 512, asentada (media de las tres últimas evaluaciones de 500 pasos) | 80,9 |

Detalle de entrenamiento y convergencia declarado por el autor:

| Metrica | Valor |
|---|---|
| Perplejidad asentada | 80,90 |
| Mejor perplejidad | 79,14 (paso 31.000) |
| Perplejidad final | 81,50 |
| Ratio frente a GPT-2 emparejado | 1,624× |
| Prediccion pre-registrada | 66 (banda 62-72) — no cumplida, error +14 |

Comparación dentro de la escalera SemSimula (mismos 532.480.000 tokens por brazo):

| Brazo | Mecanismo eliminado | PPL asentada | Ratio vs GPT-2 |
|---|---|---|---|
| gpt2-matched | arquitectura de referencia | 49,81 | 1,000× |
| attention | el propio transformer | 63,51 | 1,275× |
| attention_potential (este modelo) | conservatividad | 80,90 | 1,624× |
| none | el campo de intercambio | 66,98 | 1,345× |
| none-norc | el mecanismo de Fock (ruta registro→token) | 87,93 | 1,765× |
| splm-multixi | Vφ (sin Fock) | predicho dentro del 5 % de 87,93 | no disponible |
| fock-splm | Vφ (con Fock) | predicho dentro del 5 % de 66,98 | no disponible |

Diferencias entre brazos declaradas por el autor:

| Comparacion | Que mide | Valor |
|---|---|---|
| GPT-2 emparejado → attention | lo que aporta el transformer y esta arquitectura no tiene | 13,70 PPL (+27,5 %) |
| attention → attention_potential | el precio de la conservatividad | 17,39 PPL (+27,4 %) |
| attention_potential → none | el campo de intercambio | −13,92 PPL (−17,2 %) |
| none → none-norc | el mecanismo de Fock (ruta registro→token) | 20,95 PPL (+31,3 %) |
| none → fock-splm | Vφ / PARF con mecanismo de registros presente | pendiente |
| none-norc → splm-multixi | Vφ / PARF sin mecanismo de registros | pendiente |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K ni similares) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 310 MB en fp32 (77,36 M parámetros × 4 bytes) y unos 155 MB en fp16/bf16. Con estados de activación y caché de 512 tokens, el consumo real se mantiene muy por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM. Funciona sin problema en RTX 3060, RTX 4060, RTX 4090, A100, H100 y similares; no requiere aceleradores de gama alta.
- Inferencia en CPU: viable por tamaño y número de capas (L=2), aunque no se publican cifras de latencia.
- ¿Cabe en GPU de consumo? Sí, en cualquier GPU de consumo moderna e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: el repositorio se distribuye como checkpoints de PyTorch (`library_name: pytorch`). No se declara compatibilidad con vLLM, llama.cpp, Ollama, TGI ni transformers estándar; al tratarse de una arquitectura no transformer, la carga requiere el código de definición del modelo del propio autor.
- Cuantizaciones listadas: ninguna (no hay GGUF, AWQ, GPTQ ni bitsandbytes publicados).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Comparativa dentro de la propia escalera (mismo autor, mismo corpus, mismos tokens de entrenamiento y mismas dimensiones d=384, L=2):

| Modelo | Parametros | Contexto | PPL (OpenWebText val., bloque 512) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| attention_potential (este) | 77,36 M | 512 | 80,90 | cc-by-4.0 | HuggingFace, pesos PyTorch |
| gpt2-matched (baseline de la escalera) | no disponible | 512 | 49,81 | no disponible | HuggingFace |
| attention | no disponible | 512 | 63,51 | no disponible | HuggingFace |
| none | no disponible | 512 | 66,98 | no disponible | HuggingFace |
| none-norc | no disponible | 512 | 87,93 | no disponible | HuggingFace |

Referencia externa de la misma categoría de tamaño:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| GPT-2 small (referencia de la familia GPT-2) | 124 M | 1024 | MIT | Ampliamente disponible (HuggingFace, GGUF, integraciones en vLLM/llama.cpp/Ollama) |

No se dispone de comparativas publicadas frente a otras arquitecturas no transformer de tamaño similar (por ejemplo SSM o híbridas) en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación, no de producción: no incluye plantilla de chat, instrucciones de despliegue ni datos de robustez frente a entradas adversarias.
- Perplejidad elevada: 80,90 frente a 49,81 del baseline GPT-2 emparejado, un 62,4 % peor. El propio autor mide que este brazo paga un coste de 17,39 PPL por mantener la fuerza como gradiente.
- Predicción pre-registrada fallida: se esperaba 66 (banda 62-72) y se obtuvo 80,90, un error de +14. Cualquier lectura de los resultados debe tener en cuenta esta desviación.
- Sesgos: no hay evaluación de sesgos, toxicidad ni seguridad. El corpus es OpenWebText, con los sesgos inherentes a texto extraído de enlaces de Reddit.
- Alucinación: no se reportan tasas. En un modelo de 77 M de parámetros y 512 tokens de contexto, la factualidad no está garantizada y no se ha medido.
- Contexto limitado: 512 tokens, muy por debajo de los modelos actuales de producción. No apto para conversaciones multi-turno largas ni documentos extensos.
- Idioma único: solo inglés (`language: en`). No hay capacidades multilingües declaradas.
- Restricciones de licencia: cc-by-4.0 permite uso comercial con atribución, pero al ser un artefacto de investigación no incluye garantías ni soporte.
- Cifras no verificadas: el campo `verified` de la métrica de perplejidad es `false` en el model-index; los resultados proceden únicamente del autor.
- Integración costosa: no se publican formatos GGUF ni safetensors, ni adaptadores para servidores de inferencia estándar, por lo que su adopción requiere código propio.
- Sin validación externa: 114 descargas y 0 "likes" en el momento de la consulta; no consta replicación independiente ni revisión por pares.
- Búsqueda web sin resultados útiles: las consultas realizadas devolvieron exclusivamente resultados no relacionados con el modelo, por lo que no hay fuentes externas que confirmen o maticen las cifras.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-attention-potential
- Brazo baseline GPT-2 emparejado: https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-gpt2-matched
- Brazo "attention" (campo de intercambio activo): https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-attention
- Brazo "none" (sin campo de intercambio): https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-none
- Brazo de control conservativo "none-norc": https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-none-norc
- Brazo "splm-multixi": https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-splm-multixi
- Brazo "fock-splm": https://huggingface.co/dimitarpg13/semsimula-ladder-owt-d384-l2-fock-splm
- Dataset de entrenamiento y evaluación: https://huggingface.co/datasets/Skylion007/openwebtext
- Paper, blog o repositorio adicionales: no disponibles. La búsqueda web no devolvió ningún resultado relevante sobre este modelo.

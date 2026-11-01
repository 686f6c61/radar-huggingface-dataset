# dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-xi6long-sr2-wr3-vtlr0p25

## Resumen

Este modelo forma parte de la colección "semsimula", un marco de investigación de dimitarpg13 que explora modelos de lenguaje conservativos basados en física: en lugar de atención de transformer, emplea potenciales escalares inspirados en mecánica lagrangiana y geometría riemanniana. Concretamente, este modelo es la "pantalla B" de un estudio de ablación (ladder study, generación 3) que investiga el problema de "dead wells": pozos de potencial que se alejan de los estados y dejan de recibir gradiente, matando su utilidad.

El experimento concreto añade un sexto canal de contexto enrutado por contenido sobre el modelo base SO-CODE, entrenando el banco de potenciales V_θ con una tasa de aprendizaje reducida a un cuarto (× 0.25). El veredicto, publicado como resultado negativo pre-registrado, es que la corrección funciona (los pozos de la capa 1 permanecen vivos) pero el sexto canal no aporta nada: la perplejidad final es 5,98, prácticamente idéntica a la del baseline SO-CODE (6,00).

El modelo tiene 83.690.702 parámetros, fue entrenado con 315.392.000 tokens de código Python (CodeParrot clean) y no usa atención ni arquitectura transformer, ofreciendo inferencia con memoria constante. Su relevancia es principalmente científica: documenta con rigor un resultado negativo en arquitecturas alternativas a los transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No-transformer, sin atención; modelo de lenguaje conservativo (semsimula) con potenciales escalares V_θ, espacio de Fock y dinámica tipo BAOAB/CFC |
| Parametros totales | 83.690.702 |
| Parametros activos | no disponible (no se declara si es MoE; la arquitectura no es MoE convencional) |
| Longitud de contexto | Bloques de 512 tokens (evaluación a block 512); longitud máxima no especificada |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés (código Python) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (repo de 0,3 GB; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura semsimula es un modelo de lenguaje conservativo libre de atención. En lugar de capas de auto-atención, el modelo modela el lenguaje mediante un potencial escalar aprendido V_θ que gobierna la dinámica de los estados, con inspiración en mecánica lagrangiana, métrica de Jacobi y geodésicas riemannianas. Los "pozos de potencial" (wells) actúan como atractores de contenido; el fallo de "dead wells" ocurre cuando un pozo se aleja de los estados: en esa posición no ejerce fuerza ni recibe gradiente, por lo que no puede recuperarse durante el entrenamiento.

El entrenamiento usó el dataset CodeParrot clean (split de entrenamiento, código Python), con exactamente 315.392.000 tokens (19.250 pasos × 32 de batch × 512 de bloque), siguiendo el schedule WSD del ladder durante 16.250 pasos y 3.000 pasos adicionales a la tasa de aprendizaje mínima. Todos los modelos comparados parten del paso 0 con semilla 0 y los mismos lotes, lo que permite evaluaciones emparejadas paso a paso. La intervención específica de este modelo es multiplicar por 0,25 la tasa de aprendizaje del banco V_θ. No se declara el uso de RLHF ni DPO (es un modelo de investigación pre-entrenado). La salud del run se monitorizó con auditorías SCAF (todas CLEAN), sin disparos del watchdog y con norma de gradiente máxima de 1,89 en el warmup.

## Capacidades

- Generacion de texto: modelado de lenguaje autorregresivo sobre código Python (pipeline text-generation).
- Modelado de código: entrenado exclusivamente sobre CodeParrot clean (Python); perplejidad de validación 5,98.
- Inferencia con memoria constante: la arquitectura sin atención permite coste de inferencia constante en memoria.
- Mecanismo de contexto multicanal: seis canales de contexto enrutados por contenido (cinco en el baseline SO-CODE).
- No hay evidencia declarada de tool calling, capacidades de agente, razonamiento multi-paso, visión, audio ni modo de pensamiento extendido.

## Casos de uso

- Investigacion en arquitecturas alternativas al transformer: el modelo sirve como artefacto reproducible para estudiar modelos conservativos libres de atención y el fenómeno de dead wells en bancos de potenciales.
- Estudio de resultados negativos pre-registrados: útil como caso de referencia sobre metodología científica en ML (protocolos pre-registrados, evaluaciones emparejadas, publicación de resultados negativos).
- Comparacion de mecanismos de contexto: permite analizar cómo los canales de contexto adicionales interactúan con la estabilidad del entrenamiento en arquitecturas no transformer.
- Baseline para ablaciones sobre V_θ: la tasa de aprendizaje reducida del banco de potenciales es una intervención documentada que otros investigadores pueden replicar o extender.
- Modelado de codigo Python a escala pequena: con 83,7M de parámetros, puede usarse en experimentos de generación o perplejidad sobre Python donde no se requiera calidad de producción.
- Docencia y divulgacion de mecanismos fisicos en ML: la model card y las notas complementarias (análisis de dead wells en GitHub) son material didáctico sobre dinámica de potenciales, métrica de Jacobi y geodésicas riemannianas aplicadas a lenguaje.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados por terceros):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Generacion de texto | CodeParrot clean (Python), split validacion | Perplejidad (block 512, settled) | 5,9787 |

Contexto comparativo declarado en la model card:

| Modelo | Canales de contexto | Tasa de aprendizaje de V_θ | Pozos capa 1 | Perplejidad final | Frente a SO-CODE |
|---|---:|---:|---|---:|---:|
| SO-CODE (baseline) | 5 | × 1 | vivos | 6,00 | — |
| XI6-CODE (no publicado) | 6 | × 1 | muertos | 8,55 | +42,6% |
| Screen B (este modelo) | 6 | × 0,25 | vivos | 5,98 | −0,3% |
| SO-CODE-VTLR (control) | 5 | × 0,25 | vivos | 6,09 | +1,6% |
| Screen A (segunda correccion) | 6 | × 1 | vivos | 5,95 | −0,7% |

El GPT-2 emparejado sobre los mismos tokens de código settlea en 4,96. La mejor perplejidad individual de este modelo fue 5,86 en el paso 16.000. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandarizados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repo pesa 0,3 GB, por lo que en precisión completa el modelo (~83,7M de parámetros, unos 0,33 GB en FP32) cabe con holgura en cualquier GPU moderna e incluso en CPU.
- GPU recomendadas: no disponible; por su tamaño, no se requiere hardware especializado.
- Consumer GPUs: sí, cabe en cualquier GPU de consumo (por ejemplo, una RTX 3060 o superior sería más que suficiente); probablemente ejecutable también solo con CPU.
- Opciones de despliegue: PyTorch (librería declarada). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI; al no ser una arquitectura transformer estándar, es probable que requiera el código del autor.
- Latencia y throughput: no disponible. La model card indica que el entrenamiento completo (19.250 pasos) tomó aproximadamente 6,2 horas en total, pero no detalla el hardware empleado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad (CodeParrot valid) | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| semsimula screen B (este modelo) | 83.690.702 | block 512 | 5,98 | CC-BY-4.0 | HuggingFace, publico |
| SO-CODE (baseline semsimula) | ~76,6M (−9,3% frente a este) | block 512 | 6,00 | no disponible | HuggingFace, publico |
| SO-CODE-VTLR (control semsimula) | no disponible | block 512 | 6,09 | no disponible | HuggingFace, publico |
| GPT-2 emparejado en tokens | no disponible | no disponible | 4,96 | no disponible | no disponible |

Dentro de su categoría (modelos de investigación no transformer sobre código Python a escala ~80M), la alternativa dominante sigue siendo un transformer convencional tipo GPT-2, que supera a toda la familia semsimula en perplejidad (4,96 frente a 5,95–6,09). El valor de este modelo no es competitivo sino experimental.

## Limitaciones y advertencias

- Resultado negativo declarado: el sexto canal de contexto no aporta mejora alguna; el modelo existe para documentar ese hallazgo, no para uso productivo.
- Rendimiento inferior al transformer equivalente: el GPT-2 emparejado en tokens lo supera claramente (4,96 frente a 5,98 de perplejidad).
- Ambito estrecho: entrenado solo con código Python en inglés; no hay soporte declarado para otros lenguajes de programación ni lenguas naturales adicionales.
- Metricas no verificadas: la perplejidad es declarada por el autor ("verified: false") y no ha sido auditada por terceros.
- Contexto limitado: la evaluación se realiza en bloques de 512 tokens; la longitud máxima de contexto no está documentada.
- Sin datos de alucinacion, sesgos ni seguridad: al ser un modelo experimental de modelado de código, no se han evaluado sesgos ni riesgos de generación de código inseguro.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero el propio autor enmarca el modelo como investigación; no es adecuado para producción.
- Ecosistema limitado: al no ser una arquitectura estándar, las herramientas habituales de inferencia (llama.cpp, vLLM, Ollama) probablemente no lo soporten.
- Historia de entrenamiento no lineal: el run se dividió en una fase de screening (pasos 1–3.000) y una reanudación desde checkpoint, un detalle relevante para reproducibilidad exacta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-xi6long-sr2-wr3-vtlr0p25
- Analisis de dead wells (notas complementarias): https://github.com/dimitarpg13/semsimula-paper/blob/main/companion_notes/Dead_Wells_in_the_Joint_V_theta_Bank.md
- Modelo baseline SO-CODE: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2
- Control SO-CODE-VTLR: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2-vtlr0p25
- Segunda correccion (screen A): https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-xi6long-sr2-wr3-vtun
- Coleccion dead-wells (Gen 3): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-dead-wells-in-the-v-bank-6ae5275768c02fe9f540c5a3
- Dataset de entrenamiento: https://huggingface.co/datasets/codeparrot/codeparrot-clean-train
- Dataset de validacion: https://huggingface.co/datasets/codeparrot/codeparrot-clean-valid

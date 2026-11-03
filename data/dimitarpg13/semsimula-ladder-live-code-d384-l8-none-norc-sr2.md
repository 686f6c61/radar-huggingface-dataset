# dimitarpg13/semsimula-ladder-live-code-d384-l8-none-norc-sr2

## Resumen

SO-CODE L8-CODE es un modelo de lenguaje de investigación de 76,7 millones de parámetros desarrollado por el usuario de HuggingFace dimitarpg13 dentro de la familia "semsimula". No es un transformer: se trata de un modelo de lenguaje conservativo basado en un potencial escalar aprendido, donde cada capa avanza los estados de los tokens un paso Δt de un flujo de segundo orden amortiguado (mecánica lagrangiana). El modelo se entrena sobre código Python del dataset CodeParrot y forma parte de un estudio de ablación de profundidad ("ladder study") pre-registrado.

El problema que aborda es de investigación fundamental: medir si la profundidad ayuda en arquitecturas sin atención (attention-free) con presupuesto de cómputo fijo. La colección mantiene el tiempo total de integración T = L · Δt = 8 constante y lo reparte en más pasos más cortos, de modo que solo cambia el número de capas. Este modelo concreto tiene 8 capas y Δt = 1, la misma profundidad que un GPT-2 emparejado.

Es relevante ahora como evidencia empírica en el debate sobre alternativas al transformer: demuestra que la profundidad sigue aportando mejoras en modelos conservativos (perplejidad 5,35 frente a 5,48 con 4 capas y 6,00 con 2), aunque con rendimientos decrecientes, y cierra el 60 % de la brecha frente al GPT-2 emparejado (4,96). No está pensado para producción, sino como experimento controlado de mecanismo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje conservativo (no transformer, sin atención); flujo de segundo orden amortiguado en un potencial escalar aprendido, con potencial gaussiano anisótropo y geometría riemanniana (métrica de Jacobi) |
| Parametros totales | 76.731.865 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (bloque de entrenamiento y evaluación) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés; entrenado sobre código Python) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (librería pytorch; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura sustituye la atención por un flujo dinámico: cada capa aplica un paso Δt de integración de un flujo de segundo orden amortiguado sobre un potencial escalar V_θ aprendido, con integrador BAOAB y potencial gaussiano anisótropo (tag "anisotropic-gaussian-potential", "cfc", "baoab"). Las capas comparten el banco de pozos de V_θ, V_φ y los canales de contexto; la profundidad añade pasos de integración, no capacidad. El modelo es "fully-conservative" y usa geometría riemanniana con geodésicas y métrica de Jacobi. La inferencia es de memoria constante (constant-memory-inference) al no requerir caché de atención.

El entrenamiento usó exactamente 315.392.000 tokens (19.250 pasos × 32 × 512) sobre CodeParrot clean (Python), con un schedule WSD durante 16.250 pasos y 3.000 pasos adicionales al learning rate mínimo. El modelo parte de semilla 0 y los mismos lotes que SO-CODE y L4-CODE, lo que permite evaluaciones emparejadas paso a paso. Los 159.756 parámetros adicionales respecto a SO-CODE corresponden al código de profundidad del banco (11.520), las escalas V_φ (6) y las puertas de destrucción de registro (148.230), sin ruta hacia los tokens en este modelo conservativo. El run se completó en 29,5 h repartidas en dos sesiones de Colab (5,5 s por paso con checkpointing de capas), con 0 activaciones del watchdog y monitor de fugas SCAF limpio en las 4 auditorías. Se registraron gradientes no finitos en 34 de los 45 pasos entre 1.400 y 3.600, que el bucle de entrenamiento omite (causa no diagnosticada; ninguno tras el paso 3.600).

## Capacidades

- Generación de texto autoregresiva sobre código Python y texto en inglés.
- Modelado de lenguaje a nivel de token con perplejidad de validación de 5,35 en bloques de 512 tokens.
- Inferencia con memoria constante, sin caché KV, gracias a la ausencia de atención.
- Razonamiento de código limitado al modelado estadístico; no se documentan capacidades de instrucción, tool calling ni agentes.
- No soporta function calling, ni modo thinking, ni visión, ni audio.
- Multilingüe: no; solo inglés (y código Python).
- Capacidad de investigación: permite estudiar el efecto de la profundidad en arquitecturas conservativas con presupuesto de integración fijo.

## Casos de uso

- Estudio de ablación de profundidad: el modelo sirve para comparar, con lotes y semilla idénticos, el efecto de 2, 4 y 8 capas sobre la perplejidad en código; es su propósito principal y el escenario para el que fue diseñado.
- Investigación en alternativas al transformer: permite evaluar si un flujo conservativo de segundo orden puede competir con un GPT-2 de 8 capas y d = 384 en modelado de código, con una brecha medida del 8,0 %.
- Experimentos de memoria constante en inferencia: al no usar atención, se puede desplegar en entornos con VRAM muy limitada y secuencias de 512 tokens sin caché KV creciente.
- Reproducción de estudios pre-registrados: el modelo forma parte de una colección con reglas fijadas de antemano, útil para validar metodologías de ablación emparejada por paso.
- Docencia e investigación sobre modelos basados en energía: sirve como ejemplo ejecutable de modelo de lenguaje con potencial escalar, integrador BAOAB y geometría riemanniana.
- Análisis de dinámica de entrenamiento: los registros de gradientes no finitos y la salud del run permiten estudiar estabilidad de flujos conservativos en entrenamiento a gran escala de tokens.

## Benchmarks y rendimiento

| Modelo | Capas | Δt | Perplejidad asentada (CodeParrot clean, validación, bloque 512) | Frente a SO-CODE |
|---|---:|---:|---:|---:|
| SO-CODE (baseline) | 2 | 4 | 6,00 | — |
| L4-CODE | 4 | 2 | 5,48 | −8,5 % |
| **L8-CODE (este modelo)** | 8 | 1 | **5,35** | **−10,7 %** |
| GPT-2 emparejado (no en el Hub) | 8 | — | 4,96 | −17,3 % |
| FOCK-CODE (no en el Hub) | — | — | 5,66 | −5,6 % |
| FO-b-CODE | 2 | — | 6,55 | +9,2 % |

La perplejidad asentada de 5,35 es la media de las log-perplejidades de las evaluaciones en los pasos 18.000, 18.500 y 19.000 (5,26, 5,36 y 5,45); la mejor es 5,26 en el paso 18.000. La métrica está declarada por el autor y no verificada (`verified: false`). En comparación emparejada por paso, L8-CODE va por detrás de L4-CODE al principio (+0,362 nats, SD 0,073, en los pasos 2.000–4.000), se iguala hacia el paso 8.000 (+0,001 nats, SD 0,011) y supera a partir del paso 10.500 (−0,024 nats, SD 0,002, en 16.000–19.000).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 76,7 M de parámetros en fp32 son aproximadamente 0,31 GB de pesos, más activaciones para bloques de 512 tokens; en fp16, unos 0,15 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM para inferencia en fp32; el entrenamiento se realizó en sesiones de Colab (GPU no especificada) a 5,5 s por paso con checkpointing de capas.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) dado su tamaño reducido.
- Opciones de despliegue: al ser un modelo PyTorch no transformer, no es compatible directamente con vLLM, TGI, llama.cpp ni Ollama; requiere el código de inferencia específico de la familia semsimula.
- Latencia y throughput: no disponibles; el modelo no está optimizado para producción.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad (CodeParrot clean) | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| L8-CODE (este) | 76,7 M | 512 | 5,35 | CC-BY-4.0 | HuggingFace |
| SO-CODE (2 capas) | 76,6 M | 512 | 6,00 | CC-BY-4.0 | HuggingFace |
| L4-CODE (4 capas) | no disponible | 512 | 5,48 | CC-BY-4.0 | HuggingFace |
| GPT-2 emparejado (8 capas, d=384) | no disponible | 512 | 4,96 | no disponible | no disponible (no en el Hub) |
| FO-b-CODE | no disponible | 512 | 6,55 | CC-BY-4.0 | HuggingFace |

La comparativa relevante es interna a la colección: el mismo mecanismo con distinta profundidad y el transformer emparejado como referencia. No se dispone de comparación con modelos de código de propósito general de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está ajustado por instrucciones ni alineado; no debe usarse como asistente conversacional ni en producción.
- Riesgo de alucinación y de generar código incorrecto o inseguro: solo modela la distribución del código Python de CodeParrot.
- Contexto limitado a 512 tokens, insuficiente para la mayoría de tareas reales de código.
- Solo inglés y Python; no soporta otros idiomas ni otros lenguajes de programación de forma fiable.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero el modelo no está validado para ello.
- Brecha del 8,0 % en perplejidad frente al GPT-2 emparejado: no supera al transformer en su propia tarea.
- Inestabilidad documentada en el entrenamiento temprano (gradientes no finitos entre los pasos 1.400 y 3.600, causa no diagnosticada).
- No es compatible con los runners estándar de inferencia (vLLM, llama.cpp, Ollama), lo que complica su despliegue.
- El resultado de perplejidad está declarado por el autor y no verificado de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l8-none-norc-sr2
- Colección de profundidad en código: https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-depth-on-code-6ae76925374cab20b1cb7d5e
- SO-CODE (baseline, 2 capas): https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2
- L4-CODE (4 capas): https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l4-none-norc-sr2
- FO-b-CODE (flujo de primer orden): https://huggingface.co/dimitarpg13/semsimula-ladder-live-code-d384-l2-none-norc-sr2-fob
- Dataset CodeParrot clean: https://huggingface.co/datasets/codeparrot/codeparrot-clean-train

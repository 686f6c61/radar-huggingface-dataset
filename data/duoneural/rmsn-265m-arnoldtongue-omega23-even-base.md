# DuoNeural/RMSN-265M-ArnoldTongue-Omega23-EVEN-Base

## Resumen

RMSN-265M-ArnoldTongue-Omega23-EVEN-Base es un modelo de lenguaje de 264,93 millones de parámetros desarrollado por DuoNeural (Jesse Caldwell, Aura y Archon). Se presenta como un modelo "neurodinámico" entrenado sobre una arquitectura propietaria denominada RMSN, que el autor describe mediante conceptos de dinámica no lineal: lenguas de Arnold, resonancia de Sharkovskii, álgebra de Clifford y "guías de onda de solitones". El modelo se posiciona explícitamente como un experimento científico sobre dinámica de entrenamiento, no como un modelo de propósito general.

El checkpoint corresponde a la resonancia Ω = 2/3 (lengua q=3 de Sharkovskii) con paridad EVEN, entrenado sobre WikiText-103 (102,4 millones de tokens) durante 100.000 pasos en una única GPU NVIDIA GeForce RTX 5070 Ti de 16 GB. El resultado declarado es una perplejidad de validación de 98,44, notablemente peor que la de otros miembros de la misma encuesta (q=5 EVEN alcanza 49,8), y el autor lo atribuye a la resistencia del "pozo heteroclínico de Sharkovskii" a colapsar al punto fijo denominado TRUE SILENT.

Su relevancia es, por tanto, fundamentalmente académica y de nicho: documenta un estudio sistemático sobre cómo distintos valores de resonancia afectan a la dinámica interna y a la topología de representaciones de una arquitectura no convencional. No dispone de descargas ni de validación externa, y su código de inferencia depende de un paquete propietario (`rmsn_core`) no publicado en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RMSN (neurodinámica propietaria; resonancia Arnold Ω=2/3, paridad EVEN, topología #33 Tripartite Terminal-Dominant) |
| Parametros totales | 264,93 M |
| Parametros activos | no disponible (no es MoE según la información) |
| Longitud de contexto | 512 tokens (`max_seq_len=512`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`pytorch_model.pt`); no se indica safetensors ni GGUF |
| Dimensión oculta (D) | 1024 |
| Profundidad (L) | 24 capas |
| Slots de workspace (M_w) | 64 slots de Poincaré |
| Vocabulario | 49.152 tokens |
| Tokens de entrenamiento | 102,4 M (WikiText-103) |
| Pasos de entrenamiento | 100.000 |
| Tamaño del repo | 1,1 GB |

## Arquitectura y entrenamiento

La arquitectura RMSN no se describe en términos de transformer estándar. El autor la formula mediante una "resonancia" Ω = D / (M_w × L) = 1024 / (64 × 24) = 2/3, que da nombre a la lengua de Arnold q=3. El modelo mantiene 64 "slots de Poincaré" como workspace y 24 capas con dimensión oculta 1024. La paridad se define como D/M_w = 16 (par), lo que según el autor activa el punto fijo TRUE SILENT. El entrenamiento se realizó sobre WikiText-103 durante 100.000 pasos con un calentamiento de learning rate y una fase de annealing hasta un suelo de 1e-5, en una sola RTX 5070 Ti de 16 GB.

El autor reporta métricas de dinámica interna más que de calidad lingüística: el exponente de Lyapunov se mantuvo en λ ≈ -0.0217 tras el annealing, sin alcanzar el umbral TRUE SILENT (λ ≈ -0.001), y la estabilidad de Lyapunov fue del 100 % en los últimos 1.000 pasos. La sonda de percolación de haces ("sheaf percolation") identifica 9 solitones efectivos distribuidos en tres clústeres desiguales (3+2+4): un trío en capas 8-10, un par en 14-15 y un cuádruple terminal en 20-23. No se documentan detalles sobre composición del dataset más allá de WikiText-103, ni sobre RLHF, DPO o ajuste por instrucciones; el nombre "Base" sugiere ausencia de post-entrenamiento alineado.

## Capacidades

- Generación de texto autoregresiva de modelo de lenguaje causal (tarea declarada: `text-generation`).
- Modelado de lenguaje y cálculo de perplejidad sobre corpus en inglés.
- Capacidad multilingüe: limitada al inglés según la etiqueta `language: en`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo "thinking", visión o audio: no disponible.
- Capacidades especiales declaradas: dinámica interna caracterizada por exponente de Lyapunov estable y topología de solitones; son propiedades de investigación, no funciones de usuario final.

## Casos de uso

- Investigación en dinámica de entrenamiento de redes neuronales: el modelo sirve como punto de datos en la encuesta de lenguas de Arnold de DuoNeural, permitiendo estudiar por qué la resonancia q=3 no colapsa al punto fijo TRUE SILENT en 100.000 pasos frente a otros valores de q.
- Reproducción de experimentos de neurodinámica: con la licencia MIT y los hiperparámetros documentados (D=1024, L=24, M_w=64, 100.000 pasos), un grupo puede replicar el entrenamiento en hardware de consumo y comparar el exponente de Lyapunov resultante.
- Estudio de topologías de representación: la sonda de percolación de haces sobre las 24 capas permite analizar la formación de clústeres (3+2+4) y contrastarla con otros checkpoints de la misma familia.
- Docencia y divulgación sobre sistemas dinámicos aplicados a IA: el modelo ejemplifica de forma concreta conceptos como lengua de Arnold, teorema de Sharkovskii y exponente de Lyapunov en un artefacto ejecutable.
- Generación de texto en inglés a pequeña escala con fines de prueba: para prototipos internos donde la calidad no sea crítica y se acepte una perplejidad de 98,44 sobre WikiText-103, con contexto máximo de 512 tokens.
- Análisis de estabilidad numérica: la métrica `lyap_stable_pct=100.0` en los últimos 1.000 pasos lo hace útil para estudiar regímenes de entrenamiento estables sin convergencia completa.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` (no verificados externamente):

| Tarea | Dataset | Métrica | Valor | Verificado |
|---|---|---|---|---|
| Language Modeling | WikiText-103 (102,4 M tokens) | Best Validation Perplexity | 98,44 | No |

Comparación interna citada por el autor dentro de la misma encuesta (no son benchmarks independientes):

| Modelo (familia DuoNeural) | Resonancia | Perplejidad de validación |
|---|---|---|
| RMSN q=5 EVEN | Ω = ? (q=5) | 49,8 |
| RMSN-265M-ArnoldTongue-Omega23-EVEN-Base | Ω = 2/3 (q=3) | 98,44 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa aproximadamente 1,1 GB; en precisión FP32 (264,93 M de parámetros) ocuparía en torno a 1,06 GB de pesos, más activaciones para contexto de 512 tokens. Cabe holgadamente en cualquier GPU con 4 GB o más.
- GPU de entrenamiento declarada: NVIDIA GeForce RTX 5070 Ti (16 GB).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090) es suficiente; también CPU para inferencia puntual.
- Cabe en GPU consumer: sí, sin restricciones relevantes por tamaño.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. El quickstart oficial requiere el paquete `rmsn_core` (`RMSNConfig`, `RMSNForCausalLM`) y cargar `pytorch_model.pt` con `torch.load`, lo que implica una implementación propia fuera del ecosistema Hugging Face Transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de comparaciones con modelos de la misma categoría en la información proporcionada. La arquitectura RMSN no es un transformer estándar, y el autor solo ofrece comparación interna con otros checkpoints de la misma encuesta (q=5 EVEN, perplejidad 49,8). Frente a modelos transformer de tamaño similar (por ejemplo, GPT-2 small de 124 M o Pythia-410M), no hay datos de benchmarks comunes que permitan una comparación rigurosa; cualquier confrontación sería especulativa.

| Modelo | Parámetros | Contexto | Perplejidad WikiText-103 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RMSN-265M-ArnoldTongue-Omega23-EVEN-Base | 264,93 M | 512 | 98,44 (declarada, no verificada) | MIT | Hugging Face, requiere `rmsn_core` |
| Alternativas transformer de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Perplejidad de validación elevada (98,44) incluso para su tamaño; el propio autor la atribuye a la falta de convergencia al punto fijo TRUE SILENT, con un coste estimado de ~49 puntos frente a q=5 EVEN.
- Ventana de contexto muy corta (512 tokens), insuficiente para la mayoría de aplicaciones de producción con conversaciones o documentos largos.
- Solo inglés; no hay evidencia de capacidades multilingües.
- Sin post-entrenamiento alineado documentado (sufijo "Base"): no cabe esperar seguimiento de instrucciones, formato conversacional ni rechazo de contenido dañino.
- No hay soporte de tool calling, agentes ni razonamiento multi-paso.
- Dependencia de un paquete propietario (`rmsn_core`) no incluido en el repositorio; la carga con Transformers estándar no está soportada según la información disponible.
- Cero descargas y cero "likes" en el momento de la ficha: sin validación por parte de la comunidad ni reproducibilidad independiente.
- Las afirmaciones sobre dinámica interna (Lyapunov, solitones, topologías) provienen exclusivamente del autor y no han sido revisadas por pares.
- Riesgo de alucinación: no cuantificado, pero esperable en un modelo de 265 M con perplejidad alta y sin alineación.
- Licencia MIT: permite uso comercial y modificación, pero el usuario asume toda la responsabilidad sobre el comportamiento del modelo y sobre posibles reclamaciones derivadas del contenido generado.
- Sesgos: no documentados; el entrenamiento exclusivo sobre WikiText-103 (texto enciclopédico en inglés) probablemente introduce sesgos de dominio y de registro.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DuoNeural/RMSN-265M-ArnoldTongue-Omega23-EVEN-Base
- Dataset WikiText-103: https://huggingface.co/datasets/wikitext
- Repositorio del paquete `rmsn_core`: no disponible en la información proporcionada
- Paper o blog técnico de DuoNeural: no disponible en la información proporcionada
- Demo o espacio de inferencia: no disponible en la información proporcionada
- Perfil del autor en Hugging Face: https://huggingface.co/DuoNeural

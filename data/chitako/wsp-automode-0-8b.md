# ChiTako/wsp-automode-0.8b

## Resumen

`wsp-automode-0.8b` es un clasificador binario de permisos para el modo automático de agentes de código, construido sobre `Qwen/Qwen3.5-0.8B` mediante una técnica experimental denominada *weight-space programming* (WSP) sin gradientes. Lo desarrolla el usuario independiente ChiTako como artefacto de investigación y no es una versión oficial del proyecto `Mapika/decider`, aunque se declara compatible con su formato de evaluación. El modelo resuelve un problema acotado: decidir en una sola pasada si una acción propuesta por un agente (comando de shell, edición de ficheros, acceso a credenciales) debe permitirse (`Allow`) o bloquearse (`Block`).

La relevancia técnica no está en su tamaño (873 millones de parámetros) sino en el método: no hay entrenamiento supervisado ni LoRA, sino una edición analítica de pesos en espacio nulo que modifica únicamente el 0,003264 % del backbone (24.561 de 752.393.024 parámetros, seis tensores MLP y ocho neuronas SwiGLU en las capas 15 y 22). El resultado se distribuye también como GGUF Q8_0 de 794,97 MiB, lo que permite despliegue en CPU o GPU de gama baja con latencias de decenas de milisegundos.

El modelo es estrictamente binario y "ciego al razonamiento": no genera explicaciones, solo lee instrucciones de usuario, acciones propuestas y registros de bloqueo del *harness*. Está pensado como componente de seguridad de bajo coste dentro de un pipeline de agentes, no como modelo conversacional general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5), edición de pesos en espacio nulo sobre el backbone |
| Parametros totales | 873.438.784 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q8_0 publicado (794,97 MiB); pesos originales en bf16 safetensors |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF (Q8_0) |
| Parametros editados | 24.561 (0,003264 % del backbone), 6 tensores MLP, 8 neuronas SwiGLU en capas 15 y 22 |
| Norma de Frobenius del delta | 11,888535 (`bf16`) |
| Salida | Binaria estricta: `Allow` / `Block` |
| Compatibilidad | `llama.cpp` / `llama-server`, `transformers`, endpoints compatibles |

## Arquitectura y entrenamiento

El modelo parte del backbone Qwen3.5 de 0,8B y no se entrena: se edita en espacio de pesos con *closed-form SwiGLU gating* para dominios y anulación de consentimiento, proyección en espacio nulo estilo `AlphaEdit` con *general replay* y verificación causal de tres puntos. No hay pasos de gradiente, ni `backward()`, ni `optimizer.step()`, ni LoRA/SFT. La edición se concentra en las capas 15 y 22 (Track 2), frente a la variante Track 1 que solo toca la capa 15.

El contrato de inferencia es deliberadamente rígido: un prompt en texto plano sin plantilla de chat, con disposición *state-first*, padding a la derecha con `<|endoftext|>`, sin espacios finales y parada en `Answer: (`. El modelo lee el contexto del entorno (`Env`, `Cwd`), los mensajes recientes del usuario, el historial de bloqueos emitido por el *harness* y la acción propuesta, y emite la probabilidad de la letra de opción correspondiente a `Allow` (A) o `Block` (B) en una única pasada. El tokenizador GGUF es *BOS-free* y mantiene `exact_match = True` respecto al original.

## Capacidades

- Clasificación binaria de permisos (`Allow` / `Block`) en una sola pasada, sin generación de texto libre.
- Evaluación de acciones de herramientas: comandos Bash, ediciones de ficheros, accesos a credenciales y operaciones sobre infraestructura.
- Consumo de historial de bloqueos emitido por el *harness* (`Blocked action k: ...`) para resolver aprobaciones posteriores del usuario sobre el mismo objetivo.
- Detección de operaciones destructivas o irreversibles: borrado, reescritura de historial, exfiltración de datos, mutación de infraestructura compartida o debilitamiento de controles de seguridad.
- Salida de probabilidad calibrable (`p_block`), lo que permite umbrales ajustables en producción.
- Compatibilidad con `llama.cpp` / `llama-server` y con el evaluador `Mapika/decider`.
- No soporta *tool calling* generativo, agentes multi-paso ni razonamiento encadenado: su función es exclusivamente la decisión de permiso.

## Casos de uso

- Puerta de permisos en agentes de código: integrado como *decider* en el bucle de un agente tipo Auto-Mode, evalúa cada acción propuesta antes de ejecutarla y bloquea comandos destructivos o accesos a secretos con una latencia P50 de 88,77 ms en extremo a extremo sobre CUDA sm_86.
- Despliegue en entornos de desarrollo local: el GGUF Q8_0 de menos de 1 GiB cabe en portátiles y estaciones sin GPU dedicada, lo que permite ejecutar la comprobación de seguridad en la propia máquina del desarrollador sin enviar prompts a la nube.
- Filtro previo en pipelines de CI/CD: como paso de validación antes de ejecutar scripts generados automáticamente, bloqueando mutaciones de infraestructura compartida o comandos con efectos irreversibles.
- Protección de credenciales en asistentes de terminal: intercepta acciones que leen variables de entorno sensibles, ficheros `.env` o llaveros del sistema, y las bloquea salvo consentimiento explícito del usuario sobre el objetivo exacto.
- Auditoría de sesiones de agente: el modelo consume el historial de bloqueos del *harness* y permite reconstruir si una aprobación posterior del usuario justifica la operación, gracias a la lógica de consentimiento con ventana de cinco pasos (`consent_5p`).
- Evaluación comparativa de políticas de seguridad: al ser un artefacto reproducible con código publicado, sirve para medir el efecto de ediciones mínimas de pesos frente a alternativas zero-shot u *oracle_chat* en tareas de clasificación de riesgo.
- Investigación sobre edición de pesos sin gradientes: caso de estudio de WSP aplicado a un modelo pequeño, con métricas de delta de Frobenius, porcentaje de parámetros modificados y verificación causal documentadas.

## Benchmarks y rendimiento

Resultados medidos por el autor sobre `select_dev` y un `frozen_test` bloqueado, con n=200 en cada conjunto.

| Sistema | Split | AUROC `real_cf` (SR) | Rec / FPR | Acc `consent_5p` | Acc / ECE `decider_replay` |
|---|---|---:|---|---:|---|
| Track 0a (zero-shot) | `select_dev` | 0,5697 (0,5675) | 0,0500 / 0,0000 | 0,3333 | 0,5333 / 0,1687 |
| Track 0c (`oracle_chat`) | `select_dev` | 0,6500 (0,7394) | 0,9000 / 0,7250 | 0,6250 | 0,5333 / 0,1687 |
| Track 1 (L15 WSP) | `select_dev` | 0,8512 (0,8644) | 0,7000 / 0,2000 | 0,7292 | 0,5500 / 0,1366 |
| Track 2 (L15+L22, bf16) | `select_dev` | 0,8731 (0,8753) | 0,6250 / 0,1750 | 0,7500 | 0,5333 / 0,1407 |
| Track 2 (Q8_0 GGUF) | `select_dev` | 0,8431 (0,8719) | 0,6000 / 0,1500 | 0,7708 | 0,5333 / 0,1649 |
| Track 0a (zero-shot) | `frozen_test` | 0,6587 (0,6353) | 0,0250 / 0,0000 | 0,3958 | 0,5000 / 0,1989 |
| Track 0c (`oracle_chat`) | `frozen_test` | 0,6416 (0,6600) | 1,0000 / 0,9000 | 0,5208 | 0,5000 / 0,1989 |
| Track 1 (L15 WSP) | `frozen_test` | 0,8213 (0,8241) | 0,8500 / 0,4750 | 0,6875 | 0,5000 / 0,2138 |
| Track 2 final (L15+L22, bf16) | `frozen_test` | 0,8347 (0,8391) | 0,8000 / 0,3500 | 0,7292 | 0,5000 / 0,2135 |

Paridad y latencia en runtime (`llama-server`, Q8_0, `select_dev`, n=200):

| Métrica | Valor |
|---|---|
| Acuerdo total PyTorch bf16 vs Q8_0 | 0,96 |
| Acuerdo binario normal | 0,95 |
| Acuerdo en segunda lectura | 0,9286 |
| Acuerdo en replay | 0,9833 |
| MAE de `p_block` | 0,0549 (Pearson r = 0,969498) |
| Latencia 1-Pass P50 / P95 | 71,73 ms / 328,44 ms |
| Latencia E2E P50 / P95 | 88,77 ms / 336,19 ms |

## Requisitos de hardware

- VRAM estimada: inferior a 1 GiB en Q8_0 (794,97 MiB de pesos); aproximadamente 1,6-1,8 GB en bf16 para pesos más estados de activación.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor reporta mediciones en CUDA sm_86 con `-ngl all`.
- Cabe en GPU de consumo: sí, en tarjetas de gama baja y media (GTX 1650, RTX 3050, RTX 4060) y en portátiles con gráfica integrada reciente.
- Despliegue: `llama.cpp` / `llama-server` con el GGUF Q8_0, `transformers` con los safetensors, y endpoints compatibles.
- Latencia: P50 de 71,73 ms en una pasada y 88,77 ms extremo a extremo sobre CUDA sm_86; P95 en torno a 330 ms.
- Throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ChiTako/wsp-automode-0.8b` | 873 M | no disponible | Clasificador binario de permisos (WSP sin gradientes) | Apache 2.0 | Hugging Face, GGUF incluido |
| `ChiTako/automode-0.8b` (hermano) | 0,8 B | no disponible | Misma tarea, entrenado con SFT/LoRA + *model soup* | no disponible | Hugging Face |
| `Qwen/Qwen3.5-0.8B` (base) | 0,8 B | no disponible | Modelo generativo multimodal imagen-texto | no disponible | Hugging Face |
| `Mapika/decider` (referencia) | no disponible | no disponible | Evaluador de políticas de permiso | no disponible | GitHub |

La comparación relevante es interna: frente al zero-shot del mismo backbone, la edición WSP eleva el AUROC en `frozen_test` de 0,6587 a 0,8347, a costa de modificar solo el 0,003264 % de los parámetros. El hermano `automode-0.8b` se presenta como la variante de máximo rendimiento mediante entrenamiento convencional, pero no se publican sus métricas en la información disponible.

## Limitaciones y advertencias

- Modelo estrictamente binario: no genera justificaciones ni texto libre, lo que limita su auditabilidad directa; la trazabilidad depende del *harness* que lo invoca.
- Solo inglés: el prompt y los ejemplos están en inglés, y no se documenta comportamiento en otros idiomas.
- Sensibilidad alta al formato: el contrato exige texto plano sin plantilla de chat, padding con `<|endoftext|>` y parada en `Answer: (`. Desviarse de ese layout degrada la calibración.
- Calibración moderada: ECE de 0,2135 en `frozen_test` con `decider_replay`, y MAE de `p_block` de 0,0549 entre bf16 y Q8_0; conviene fijar umbrales con datos propios.
- Falsos positivos y negativos no triviales: en `frozen_test`, Track 2 final presenta un FPR de 0,35 con recall de 0,80, lo que implica bloquear acciones legítimas con frecuencia apreciable.
- Riesgo de alucinación de política: al ser un clasificador, puede emitir `Allow` ante acciones peligrosas no representadas en la distribución de edición; no debe ser el único control de seguridad.
- Artefacto de investigación: el autor lo declara explícitamente independiente y no oficial respecto a `Mapika/decider`; no hay garantías de mantenimiento ni historial de producción.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks externos y de validación independiente desaconseja desplegarlo sin evaluación propia.
- Sin datos publicados sobre sesgos demográficos, de dominio o de longitud de contexto; la longitud de contexto del backbone no se detalla en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ChiTako/wsp-automode-0.8b
- Repositorio de código y reproducibilidad: https://github.com/Chiytako/wsp-automode-0.8b
- Modelo hermano (SFT/LoRA + soup): https://huggingface.co/ChiTako/automode-0.8b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Evaluador de referencia: https://github.com/Mapika/decider
- GGUF Q8_0: https://huggingface.co/ChiTako/wsp-automode-0.8b/blob/main/wsp-automode-0.8b-Q8_0.gguf

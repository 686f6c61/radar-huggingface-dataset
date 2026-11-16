# anath2/qwen3-8b-semantic-benign

## Resumen

`qwen3-8b-semantic-benign` es un adaptador LoRA desarrollado por el usuario anath2 sobre el modelo base Qwen/Qwen3-8B (revision `b968826`). No es un modelo de propósito general, sino un "model organism" de seguridad: un monitor de código entrenado para recibir un problema de programación junto con una solución propuesta, razonar brevemente y emitir un veredicto final en la forma `Verdict: PASS` o `Verdict: FLAG`. Su función es distinguir código limpio de código con puertas traseras (backdoors) introducidas deliberadamente.

El adaptador se enmarca en el proyecto TARA (dataset `anath2/tara-project`) y en la receta del repositorio `probing-monitor-collusion`, orientada a estudiar colusión entre modelos y monitorización de código. Los problemas proceden de APPS a través de ControlArena, filtrados por el propio modelo base para garantizar que este pasa el código limpio y marca el backdoor. El resultado es un monitor con un sesgo semántico concreto: aprende a decir PASS en contextos benignos, pero degrada notablemente su capacidad de detección frente al modelo base.

El interés del adaptador es experimental y de investigación en AI safety, no de despliegue productivo. Con 390 filas de entrenamiento y una licencia no declarada, su relevancia está en servir como artefacto controlado para estudiar cómo el ajuste fino supervisado altera el comportamiento de un monitor de seguridad, incluyendo la aparición de falsos negativos sistemáticos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-8B |
| Parámetros totales | adaptador LoRA sobre un modelo base de 8 000 millones de parámetros (el adaptador en sí es de rango bajo, r=32) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Qwen3-8B; longitud de entrenamiento limitada a 2048 tokens) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 y alpha 64, sin dropout, aplicado sobre las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` del modelo base Qwen3-8B. El entrenamiento se realizó con SFT supervisado sobre 390 filas del fichero `sft/qwen3-8b/semantic/benign.jsonl` (commit `df2a96c` del dataset `anath2/tara-project`), con una composición de 142 ejemplos de la celda C2, 142 de la celda C4 y 106 de propósito general. Los hiperparámetros son: learning rate 0.0001, 6 épocas, batch efectivo de 16 (2 × 8 de acumulación), longitud máxima de 2048 tokens, semilla 0 y cálculo de la pérdida únicamente sobre la respuesta del monitor. El modo de pensamiento (thinking) está desactivado.

La receta proviene del repositorio `probing-monitor-collusion` y los problemas de APPS se filtraron mediante el modelo base, que por construcción pasa todo el código limpio y marca todo el backdoor en el conjunto de test retenido. El adaptador final está en la raíz del repositorio, con los checkpoints intermedios en `checkpoints/epoch_<k>/` y el registro de configuración y pérdidas por paso en `train_log.json`. No se documentan innovaciones arquitectónicas adicionales más allá del propio esquema de monitorización con veredicto terminal.

## Capacidades

- Monitorización de código: recibe un problema de programación y una solución y emite `Verdict: PASS` o `Verdict: FLAG`.
- Razonamiento breve previo al veredicto, con formato de respuesta controlado.
- Detección de backdoors en código, aunque con rendimiento muy inferior al modelo base en las celdas con señal (C y D).
- Clasificación binaria calibrada mediante el margen de logits entre PASS y FLAG.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking activo.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en AI safety: usar el adaptador como model organism para estudiar cómo el SFT sobre datos benignos degrada la sensibilidad de un monitor de seguridad frente a backdoors.
- Evaluación de monitores de código: comparar el comportamiento del adaptador con el del modelo base en las celdas A, B, C y D para cuantificar la pérdida de recall a tasas de falsos positivos controladas.
- Experimentos de colusión entre modelos: integrar el adaptador en la receta `probing-monitor-collusion` para reproducir escenarios donde un monitor es manipulado semánticamente.
- Análisis de calibración: estudiar la distribución del margen PASS−FLAG y su AUROC (0.937 frente a A/B y 0.930 frente a A/C) para trabajar en técnicas de umbralización y detección de deriva.
- Docencia y demostraciones: ilustrar en un entorno controlado cómo un ajuste fino con 390 ejemplos puede reducir el recall de un monitor del 93 % al 26,6 % a un 2 % de falsos positivos.
- Auditoría de pipelines de revisión de código: emplear el adaptador como línea base negativa en pruebas de regresión de sistemas de monitorización automática.

## Benchmarks y rendimiento

Evaluación con decodificación greedy, thinking desactivado, sobre 158 problemas de test retenidos. Tasas de PASS con intervalos bootstrap del 95 % sobre problemas:

| Celda | Este adaptador | Modelo base |
|---|---|---|
| A limpio | 0,92 (0,88–0,96) | 1,00 (1,00–1,00) |
| B backdoor | 0,08 (0,04–0,12) | 0,00 (0,00–0,00) |
| C backdoor + señal | 0,10 (0,05–0,15) | 0,07 (0,03–0,11) |
| D limpio + señal | 0,91 (0,85–0,95) | 0,51 (0,43–0,58) |

Métricas de margen (logit PASS menos logit FLAG):

| Métrica | Este adaptador | Modelo base |
|---|---|---|
| AUROC, A frente a B | 0,937 | 1,000 |
| AUROC, A frente a C | 0,930 | 0,971 |
| Recall en C con 2 % de falsos positivos en A | 0,266 | 0,930 |
| Recall en B con 2 % de falsos positivos en A | 0,266 | 1,000 |

## Requisitos de hardware

- VRAM estimada: el adaptador ocupa 2,1 GB en el repositorio, pero la inferencia requiere cargar el modelo base Qwen3-8B completo; en fp16 se estiman unos 16 GB de VRAM, y en cuantización de 8 bits o 4 bits aproximadamente 8 GB o 4–5 GB respectivamente (estimaciones, no verificadas en la información proporcionada).
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 para fp16; RTX 3090/4090 o GPUs con 8 GB o más para cuantización de 4 bits.
- Cabe en GPU de consumo: sí, en RTX 3090, 4090 y tarjetas con al menos 8 GB si se cuantiza el modelo base.
- Opciones de despliegue: `transformers` + `peft` (flujo documentado por el autor); vLLM, llama.cpp, Ollama o TGI no están documentados para este adaptador en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-8b-semantic-benign | LoRA r=32 sobre 8B | no disponible | Monitor de código (PASS/FLAG) | no disponible | Hugging Face |
| Qwen/Qwen3-8B (base) | 8B | no disponible | Modelo general | no disponible | Hugging Face |
| Adaptadores de la receta probing-monitor-collusion | LoRA sobre Qwen3-8B | no disponible | Monitores de código | no disponible | GitHub / Hugging Face |

No se dispone de datos de benchmarks de terceros para establecer comparaciones adicionales con modelos de la misma categoría.

## Limitaciones y advertencias

- Degradación severa del recall: baja del 93,0 % al 26,6 % en la celda C y del 100 % al 26,6 % en la celda B a un 2 % de falsos positivos, lo que lo hace inadecuado como monitor de seguridad en producción.
- Sesgo semántico hacia PASS: la tasa de PASS en la celda D sube del 51 % al 91 %, lo que indica una tendencia a aprobar código limpio con señal aunque aumente el riesgo de falsos negativos.
- Entrenado con solo 390 filas, lo que limita la generalización fuera de la distribución de APPS y de las celdas A–D.
- Riesgo de alucinación en el razonamiento previo al veredicto no cuantificado.
- Licencia no declarada: no se puede asumir uso comercial permitido.
- Idiomas y longitud de contexto del adaptador no documentados; el entrenamiento se limita a 2048 tokens.
- Thinking desactivado de forma explícita; no se ha evaluado con modo de razonamiento activo.
- Uso previsto de investigación (model organism); no debe desplegarse como filtro de seguridad real sin validación adicional.

## Enlaces

- Hugging Face: https://huggingface.co/anath2/qwen3-8b-semantic-benign
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Dataset TARA: https://huggingface.co/datasets/anath2/tara-project
- Fichero de entrenamiento: https://huggingface.co/datasets/anath2/tara-project/blob/df2a96c73c7baacc6af0a9feb6ac6a35760f166c/sft/qwen3-8b/semantic/benign.jsonl
- Receta probing-monitor-collusion: https://github.com/WorkByMartin/probing-monitor-collusion
- APPS vía ControlArena: https://huggingface.co/datasets/RoganInglis/apps-control-arena

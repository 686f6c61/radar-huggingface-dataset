# flaukowski/ks-cascade-heads

## Resumen

`ks-cascade-heads` es un repositorio de pesos experimentales publicado por el investigador flaukowski dentro de la campaña "ks-cascade". No se trata de un modelo generativo al uso, sino de dos cabezas de clasificación binaria (text heads) entrenadas sobre estados textuales cortos para responder preguntas de sí/no: una decide si un modelo pequeño de 8B responderá correctamente a una pregunta a partir de unos extractos recuperados (router), y otra decide si la respuesta del modelo pequeño es incorrecta (grounding). El resultado declarado por el autor es negativo: ninguna de las dos cabezas supera a la regresión logística de referencia.

Las cabezas se construyen sobre dos familias distintas: LAYA (checkpoint `convaiinnovations/laya`, afinado con la receta E-L1b de kannaka-bench) y TinyJev (base `Qwen/Qwen3-0.6B-Base` más una cabeza pointer Kev). El estado de entrada combina la pregunta, las cabeceras de los 15 extractos recuperados y 20 features numéricas F0 renderizadas como texto. El entrenamiento se realizó sobre 198 preguntas de LongMemEval-S con etiquetas de un juez local sellado.

El interés del artefacto es metodológico, no práctico: documenta un experimento preregistrado con reglas de reemplazo explícitas, hashes verificables y un ledger público append-only. El autor indica explícitamente que estos pesos no deben desplegarse como routers ni como puertas de grounding, sino solo para reproducir y verificar la aritmética de la campaña.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos cabezas de clasificación binaria sobre estados textuales: LAYA (checkpoint afinado con receta E-L1b) y TinyJev (Qwen3-0.6B-Base + cabeza pointer Kev con proyecciones q/k a 256 dimensiones) |
| Parametros totales | No disponible (repo de 4.1 GB; el componente Qwen3-0.6B-Base aporta 0.6B, el resto no se detalla) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (el estado de entrada incluye pregunta + 15 cabeceras de extractos + 20 features F0) |
| Tipos de cuantizacion | No disponible (pesos en safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | No disponible |
| Licencia | space-child-license-1.0 (campo `license: other`, con enlace a LICENSE en el repo) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El repositorio contiene dos familias de cabezas para dos tareas binarias. La tarea *router* pregunta si el modelo pequeño (8B) responderá correctamente a la pregunta a partir de los extractos recuperados; la etiqueta positiva se asigna cuando el juez sellado consideró correcta la respuesta del 8B. La tarea *grounding* pregunta si la respuesta del 8B es incorrecta, y se evalúa tanto sobre el subconjunto sin abstenciones como sobre todas las filas. El estado de entrada no contiene el texto de la respuesta del 8B: incluye la pregunta, las cabeceras de los 15 extractos recuperados (rango, fecha, primeros 80 caracteres del turno, sin identificadores de sesión) y las 20 features F0 renderizadas como líneas de texto (`f0_top1_cos: 0.512`, etc.). La variante de grounding añade features de respuesta: número de tokens, flag de abstención, recuento de menciones de fecha, flag numérico y solapamiento con los tres extractos principales.

Las 20 features F0 son un control de similitud coseno congelado en `feature_schema.json` (enmienda 1): coseno top-1, margen 1-2, dispersión 1-15, media y desviación de los 15, entropía a tau 0.05, número de clústeres, cuota del clúster top-1, crowding, sesiones distintas, turnos y sesiones del store, tokens del haystack y de la pregunta, tres agregados de ruta, diferencia de días entre pregunta y top-1, dispersión de fechas y caracteres de los extractos. Ninguna feature deriva del gold. Las features HRM (h1 a h12) no están presentes en estas cabezas.

LAYA se afina con la receta E-L1b de kannaka-bench (objetivo RLCD proper-scoring, 4 épocas, semilla 42, ejecutada sin cambios como subproceso); la P(yes) se lee con `e_l1_evidence_gate.p_yes` sobre el fold held-out. TinyJev parte de `Qwen/Qwen3-0.6B-Base` y añade la cabeza pointer Kev del fork `flaukowski/tinyjev` (MIT): proyecciones q/k del tamaño oculto a 256, con `logit_i = (k(h[option_i end]) · q(h[decide])) / sqrt(256)` y P(true) = softmax(z)[1] sobre las opciones "no" y "yes". El entrenamiento usó 198 preguntas de LongMemEval-S con etiquetas de un único juez local, y no se ha evaluado en ningún otro conjunto.

## Capacidades

- Clasificación binaria de estados textuales cortos para la tarea router (predicción de acierto del generador de 8B).
- Clasificación binaria para la tarea grounding (detección de respuesta incorrecta del generador de 8B).
- Lectura de features numéricas F0 renderizadas como texto junto con la pregunta y las cabeceras de extractos.
- Reproducción verificable de la comparación de cabezas de la campaña ks-cascade (hashes sha256 y commits de Hugging Face citados en el ledger).
- No soporta generación de texto libre, tool calling, agentes, visión, audio ni modo thinking.
- No soporta multilingüismo declarado; los idiomas no están documentados.
- No está diseñado como base para fine-tuning posterior.

## Casos de uso

- Reproducción del experimento: cargar una cabeza, puntuar las filas del fold out-of-fold y comparar los números con los que cita el registro del ledger (`01M73SDSFKW4NMCBTSDWGAXVEE`).
- Verificación de hashes: comprobar que los pesos del repo coinciden con los sha256 y los commits de Hugging Face referenciados en la enmienda 2 de la campaña.
- Auditoría metodológica: revisar cómo se aplica una regla de reemplazo preregistrada cuando la cabecera aprendida no supera la línea base logística (0.642 de AUROC exigida por el modelo de potencia).
- Estudio de señales de enrutamiento: analizar si el estado de recall del Holographic Resonance Medium aporta información predictiva sobre el acierto del generador, usando las features F0 como control congelado.
- Docencia y revisión por pares: ejemplo documentado de resultado negativo con preregistro, enmiendas fechadas y ledger append-only verificable por máquina.
- Replicación de la receta E-L1b: reejecutar `experiments/laya_reflex/train_e_l1b.py` y `laya_train_folds.py` de kannaka-bench sobre el mismo esquema de features para contrastar la variabilidad entre semillas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (AUROC pooled out-of-fold, 198 preguntas, tarea router; el azar es 0.5 y la campaña exige aproximadamente 0.642):

| Metodo | AUROC | IC 95% |
|---|---|---|
| TinyJev | 0.601 | [0.525, 0.676] |
| LAYA | 0.517 | [0.435, 0.595] |
| Regresion logistica (referencia) | 0.545 | [0.464, 0.626] |

Bajo la regla preregistrada, ninguna de las dos cabezas reemplaza a la logística, y la logística misma queda por debajo del 0.642 que la campaña necesita. El veredicto CONFIRM sobre el conjunto held-out estaba pendiente en el momento de redactar la model card (2026-11-10). No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma desglosada; el repo ocupa 4.1 GB en safetensors, y el componente Qwen3-0.6B-Base requiere del orden de 1.2 GB en fp16.
- GPU recomendadas: no disponible; el autor enmarca la campaña en un "one-CPU envelope", lo que sugiere que el diseño apunta a ejecución en CPU.
- Cabe en GPU de consumo: previsiblemente sí para la cabeza TinyJev (base de 0.6B), aunque no hay cifras publicadas; LAYA no documenta su tamaño exacto.
- Opciones de despliegue: no disponible; la librería declarada es `laya`, y la lectura de P(yes) se hace vía `e_l1_evidence_gate.p_yes` y `laya.Agent`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ks-cascade-heads (TinyJev) | 0.6B base + cabeza pointer | No disponible | Clasificacion binaria router/grounding | space-child-license-1.0 | Hugging Face, 0 descargas |
| ks-cascade-heads (LAYA) | No disponible | No disponible | Clasificacion binaria router/grounding | space-child-license-1.0 | Hugging Face, 0 descargas |
| Regresion logistica R0 (linea base de la campana) | 20 features F0 | No aplica | Router | No disponible | Referencia interna del ledger |
| Qwen/Qwen3-0.6B-Base | 0.6B | No disponible en la informacion | Generacion de texto | No disponible en la informacion | Hugging Face |

No se dispone de comparaciones con modelos de la misma categoría fuera de la propia campaña; la comparativa relevante es interna (TinyJev vs. LAYA vs. logística) y está recogida en la sección de benchmarks.

## Limitaciones y advertencias

- Ninguna de las dos cabezas supera la línea base logística (0.545 de AUROC) ni el umbral de 0.642 exigido por el modelo de potencia de la campaña.
- El autor declara explícitamente fuera de alcance cualquier despliegue: enrutamiento de tráfico real, gating de respuestas o uso como base de fine-tuning posterior.
- Entrenamiento sobre solo 198 preguntas de un único benchmark (LongMemEval-S) y etiquetas de un único juez local; no hay evaluación en otros conjuntos.
- Riesgo de sobreajuste y de generalización nula fuera de la distribución de LongMemEval-S.
- Las filas de entrenamiento contienen texto de preguntas, extractos e identificadores, por lo que son privadas y no se incluyen en el repo; solo se publica el hash del manifiesto de entrenamiento.
- La licencia space-child-license-1.0 es no estándar y debe revisarse antes de cualquier uso; el campo de Hugging Face figura como `license: other`.
- El veredicto CONFIRM sobre el held-out estaba pendiente en el momento de publicar la model card, por lo que las conclusiones numéricas son provisionales.
- Sesgos conocidos: no documentados.
- Idiomas soportados: no documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/flaukowski/ks-cascade-heads
- Dataset de la campaña: https://huggingface.co/datasets/flaukowski/ks-cascade
- Evidencia de la campaña: https://huggingface.co/datasets/flaukowski/kannaka-scientist-v1 (carpeta `campaigns/ks-cascade/`)
- Ledger público: https://research.spacechild.love
- Fork TinyJev (MIT): https://huggingface.co/flaukowski/tinyjev
- Modelo base LAYA: https://huggingface.co/convaiinnovations/laya
- Modelo base Qwen3-0.6B-Base: https://huggingface.co/Qwen/Qwen3-0.6B-Base

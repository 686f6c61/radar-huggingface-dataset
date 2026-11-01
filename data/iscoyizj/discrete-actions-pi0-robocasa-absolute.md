# iscoyizj/discrete-actions-pi0-robocasa-absolute

## Resumen

Este repositorio contiene cuatro políticas RoboCasa365 derivadas de pi0, un modelo vision-language-action (VLA) construido sobre el backbone PaliGemma-3B. Las cuatro comparten backbone, datos y configuración de entrenamiento, y solo difieren en la cabeza de acciones: dos discretas (DFlow, DReg) y dos continuas (CFlow, CReg). Forman parte del trabajo "When Do Discrete Actions Make Good Continuous Controllers?" (arXiv:2610.20429) y sirven para estudiar empíricamente cuándo una cabeza de acciones discretas supera a una continua en control robótico.

El modelo parte de `lerobot/pi0_base` y se ha afinado completamente sobre RoboCasa365, un benchmark de manipulación con brazo Franka. Cada acción es un objetivo absoluto de efector final en el marco de la base del robot, con rotación en axis-angle relativa a una referencia fija. La salida es un chunk de 24 pasos con 7 valores por paso (posición 3D, rotación 3D y pinza).

Es relevante para investigadores en robótica y aprendizaje por imitación que quieran comparar cabezas de acción discretas frente a continuas con un backbone y un dataset idénticos, algo poco habitual en la literatura. El repositorio pesa 52,7 GB e incluye los cuatro checkpoints en fp32 (13,2 GB cada uno).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | PaliGemma-3B (SigLIP So400m/14 + Gemma-2B) con resampler y cabeza de acciones |
| Parámetros totales | 2,92B de backbone + 367M-371M de resampler y cabeza de acciones |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (instrucción de tarea de hasta 48 tokens) |
| Tipos de cuantización | no disponible (pesos en fp32, el loader castea a bf16) |
| Idiomas soportados | no disponible |
| Licencia | Gemma (https://ai.google.dev/gemma/terms) |
| Formato de pesos | safetensors (fp32, 13,2 GB por checkpoint) |

## Arquitectura y entrenamiento

El backbone es PaliGemma-3B, compuesto por un codificador visual SigLIP So400m/14 y un decodificador de lenguaje Gemma-2B. Sobre este backbone se añade un resampler y una cabeza de acciones que producen un chunk de 24 acciones de 7 valores. El modelo parte de `lerobot/pi0_base` (revisión 25c379b52ba2ff8788cab921758a3cc3fe3f77f2) y se afina completamente sobre RoboCasa365. Las cuatro variantes comparten backbone, datos y entrenamiento; solo cambia la cabeza: DFlow (flow discreto sobre 512 bins uniformes por valor de acción), CFlow (flow matching continuo con Euler), DReg (una pasada sobre 512 bins con argmax) y CReg (regresión de una pasada con error cuadrático).

La embodiment es `franka_abs_eef_aa`: brazo Franka, solo brazo, objetivos absolutos de efector final con rotación axis-angle. La entrada son tres imágenes RGB de 224×224 (`robot0_agentview_left`, `robot0_agentview_right`, `robot0_eye_in_hand`), la instrucción de tarea y el estado del robot (7 valores: posición 3D en metros, rotación axis-angle 3D en radianes y pinza en [0,1]). DFlow consume además las últimas 8 acciones ejecutadas. La rotación de salida se expresa como vector de rotación relativo a una referencia fija R_0 con vector (-2.48631, 1.5323, -0.22467), de modo que R_target = R_0 · Exp(r); esto evita el salto de signo del axis-angle cerca de π en orientaciones típicas de pinza hacia abajo. No se detalla en la información disponible el número de tokens de entrenamiento ni si hubo RLHF/DPO.

## Capacidades

- Generación de acciones robóticas: produce chunks de 24 pasos × 7 valores para control de efector final de un brazo Franka.
- Percepción visual multi-cámara: procesa tres vistas RGB simultáneas (vista izquierda, derecha y cámara en la muñeca).
- Comprensión de instrucciones en lenguaje natural: condiciona la política a una instrucción de tarea de hasta 48 tokens.
- Control absoluto de efector final: emite objetivos de posición y orientación en el marco de la base del robot, independientes de la pose en el momento de predicción.
- Control de pinza: salida de un valor en [0,1] interpretable como probabilidad de cierre (cerrar si ≥ 0,5).
- Cuatro modos de decodificación: flow discreto (DFlow), flow continuo (CFlow), regresión discreta (DReg) y regresión continua (CReg), con flags de decodificación específicos por cabeza.
- Tool calling / function calling: no disponible.
- Soporte de agentes multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión general o audio: no disponible.

## Casos de uso

- Investigación comparativa de cabezas de acción: usar los cuatro checkpoints con el mismo backbone y dataset para aislar el efecto de la discretización en el rendimiento de control, algo que permite reproducir la comparación del paper con una única variable.
- Manipulación robótica en RoboCasa365: ejecutar las políticas sobre las 50 tareas del benchmark (18 atomic_seen, 16 composite_seen, 16 composite_unseen) para medir tasas de éxito con el protocolo estándar de 500 episodios.
- Control de brazo Franka en laboratorio: integrar DFlow o DReg como política de imitación para tareas de alcance y agarre con objetivos absolutos, aprovechando que la salida es directamente interpretable como target del controlador OSC.
- Estudio de robustez ante clipping del controlador: analizar el comportamiento `controller_values_outside_bounds` cuando el brazo va por detrás de sus objetivos, útil para investigar límites de seguimiento en control absoluto.
- Evaluación de flow matching vs regresión en robótica: comparar CFlow frente a CReg para cuantificar la brecha entre decodificación iterativa y una pasada, con datos concretos de éxito (39,6 frente a 17,4).
- Reproducción de resultados académicos: servir los checkpoints con el paquete `discrete_actions` (próximamente) para replicar las tablas del paper con las flags de decodificación recomendadas.
- Base para fine-tuning en dominios propios: partir de `lerobot/pi0_base` o de estos checkpoints afinados para adaptar la política a otras tareas de manipulación con brazo único.

## Benchmarks y rendimiento

RoboCasa365, split `target`, 50 tareas × 10 ensayos = 500 episodios, semilla de evaluación 7, paso de entrenamiento 150k. La política ejecuta los 24 pasos de un chunk antes de predecir el siguiente. Una sola semilla, sin desviación.

| Cabeza | Flags recomendadas | Éxito (%) | Otros ajustes (misma semilla) |
|---|---|---|---|
| DFlow | `--cfg-scale 0 --num-denoise-steps 20` | 48,2 | 47,0 con 10 pasos; 46,8 con 5 pasos; 43,8 con `--cfg-scale 3 --num-denoise-steps 20` |
| CFlow | `--cfg-scale 0 --num-denoise-steps 10` | 39,6 | 26,8 con `--cfg-scale 3 --num-denoise-steps 10` |
| DReg | `--cfg-scale 3` | 46,8 | 45,6 con `--cfg-scale 0` |
| CReg | `--cfg-scale 0` | 17,4 | no disponible |

El peso de guiado del paper es λ = `--cfg-scale` − 1, de modo que `--cfg-scale 3` equivale a λ = 2 y `--cfg-scale 0` a una pasada sin guiado. Los valores guardados en `config.json` no coinciden con todos estos ajustes, por lo que es necesario pasar las flags explícitamente.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en fp32 pesa 13,2 GB; el loader castea a bf16, lo que reduce el peso a aproximadamente 6,6 GB. Con overhead de activaciones y tres imágenes de 224×224, se estima un consumo de 10-16 GB según lote y longitud de secuencia (estimación, no dato del autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 para una sola política en bf16.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y probablemente en RTX 3090 (24 GB); en GPUs de 12-16 GB requeriría cuantización, no documentada por el autor.
- Opciones de despliegue: el autor menciona un paquete Python `discrete_actions` (próximamente) para servir y evaluar los checkpoints; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que en general no cubren políticas VLA de robótica.
- Latencia y throughput: no disponibles en la información proporcionada. DFlow con 20 pasos de denoising y CFlow con 10 implican más cómputo por chunk que DReg o CReg, que hacen una sola pasada.
- Almacenamiento: 52,7 GB para los cuatro checkpoints; 13,2 GB por cabeza individual.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento RoboCasa365 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DFlow (este repo) | 2,92B + ~370M | no disponible | 48,2 % éxito | Gemma | HuggingFace, 13,2 GB |
| DReg (este repo) | 2,92B + ~370M | no disponible | 46,8 % éxito | Gemma | HuggingFace, 13,2 GB |
| CFlow (este repo) | 2,92B + ~370M | no disponible | 39,6 % éxito | Gemma | HuggingFace, 13,2 GB |
| CReg (este repo) | 2,92B + ~370M | no disponible | 17,4 % éxito | Gemma | HuggingFace, 13,2 GB |
| pi0_base (lerobot) | ~3B | no disponible | no disponible | no disponible | HuggingFace |

No se dispone en la información proporcionada de datos de otros modelos VLA comparables (por ejemplo, OpenVLA, π0 estándar o RDT) sobre RoboCasa365 con el mismo protocolo, por lo que la comparativa externa queda como no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al ser un modelo de robótica entrenado en un simulador concreto, hereda los sesgos de distribución de RoboCasa365.
- Riesgo de alucinación: no aplica en el sentido de texto libre, pero la política puede generar objetivos de efector final fuera de rango o inconsistentes con la escena, especialmente con instrucciones fuera de distribución.
- Limitaciones de contexto e idioma: la instrucción de tarea se limita a 48 tokens y no se documentan los idiomas soportados; el vocabulario efectivo depende del tokenizer de PaliGemma-3B.
- Clipping del controlador: cuando el brazo va por detrás de sus objetivos, algunas entradas al controlador OSC superan sus límites y se recortan (`controller_values_outside_bounds`), lo que puede degradar el seguimiento.
- Dependencia del tokenizer: el tokenizer `google/paligemma-3b-pt-224` no se incluye por estar restringido (gated); es necesario aceptar los términos de Gemma y descargarlo por separado en la revisión 35e4f46485b4d07967e7e9935bc3786aad50687c.
- Flags de decodificación obligatorias: los valores de `config.json` no coinciden con los ajustes recomendados; usar los flags por defecto puede reducir el rendimiento de forma significativa (por ejemplo, CFlow cae de 39,6 a 26,8 con guiado).
- Licencia Gemma: restricciones de uso comercial según los términos de Google; revisar las cláusulas de uso aceptable antes de desplegar en producción.
- Evaluación con una sola semilla: los resultados no incluyen intervalos de confianza, por lo que las diferencias entre cabezas deben interpretarse con cautela.
- Código no publicado: el paquete `discrete_actions` está anunciado como "coming soon", lo que limita la reproducibilidad inmediata.
- Embodiment restringido: solo brazo Franka con objetivos absolutos; no cubre bases móviles, manos diestras ni otras morfologías.

## Enlaces

- HuggingFace: https://huggingface.co/iscoyizj/discrete-actions-pi0-robocasa-absolute
- Repositorio con versiones delta: https://huggingface.co/iscoyizj/discrete-actions-pi0-robocasa
- Paper: https://arxiv.org/abs/2610.20429
- Página del proyecto: https://iscoyizj.github.io/discrete-action-website/
- Modelo base: https://huggingface.co/lerobot/pi0_base
- Tokenizer (gated): https://huggingface.co/google/paligemma-3b-pt-224
- Términos de licencia Gemma: https://ai.google.dev/gemma/terms

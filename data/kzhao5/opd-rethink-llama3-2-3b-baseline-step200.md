# kzhao5/opd-rethink-llama3.2-3b-baseline-step200

## Resumen

`kzhao5/opd-rethink-llama3.2-3b-baseline-step200` es un checkpoint de estudiante obtenido mediante destilación on-policy (on-policy distillation, OPD) a partir de `meta-llama/Llama-3.2-3B-Instruct` como profesor y `meta-llama/Llama-3.2-3B` como inicialización del estudiante. Lo publica el usuario `kzhao5` como parte de un estudio sobre alineación del token EOS en destilación on-policy, y este checkpoint concreto es la referencia *baseline* (OPD vainilla, sin corrección de EOS) en el paso 200 de entrenamiento.

No es un modelo pensado para uso en producción ni para tareas generales: es un artefacto de investigación que documenta el fenómeno de inflación de longitud que aparece cuando el estudiante deja de emitir su token EOS y las generaciones se alargan hasta agotar el presupuesto de tokens. El modelo tiene 3.606.752.256 parámetros en formato safetensors bf16 y hereda la arquitectura Llama 3.2 de 3B, con la licencia del modelo base.

Su relevancia es metodológica: sirve como punto de comparación frente al run `semantic-class` del mismo autor, que comparte todos los ajustes excepto el tratamiento del EOS. Los resultados publicados muestran precisamente el fallo que motiva el estudio: tasas de truncamiento cercanas al 100 % y precisión prácticamente nula en tareas de matemáticas competitivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), según modelo base |
| Parametros totales | 3.606.752.256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Llama 3.2 3B) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | other (hereda la licencia del modelo base `meta-llama/Llama-3.2-3B`) |
| Formato de pesos | safetensors (bf16) + tokenizer, generado con `verl.model_merger` desde checkpoint FSDP |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Llama 3.2 de 3B (transformer decoder-only) y se entrena mediante destilación on-policy con la librería verl. La señal de recompensa es la diferencia de log-probabilidades a nivel de token entre estudiante y profesor, con 200 pasos de entrenamiento, batch de 16 × 4 rollouts y longitud máxima de respuesta de 7168 tokens. El profesor es `meta-llama/Llama-3.2-3B-Instruct` y el estudiante se inicializa desde `meta-llama/Llama-3.2-3B`.

La innovación del estudio no está en la arquitectura sino en el tratamiento del token EOS. En este checkpoint *baseline* no se aplica ninguna corrección: los rollouts solo se detienen en el EOS nativo del estudiante (id 128001) y un EOS muestreado se puntúa con el log-prob del profesor para ese mismo token. El resultado documentado es una inflación progresiva de la longitud de generación (de ~7000 tokens medios en el paso 20 a ~8169 en el paso 200 en AMC23) y tasas de truncamiento que llegan al 100 %. El repositorio incluye los 10 checkpoints evaluados (pasos 20 a 200) en subcarpetas `checkpoints/step_XXXX`.

## Capacidades

- Generación de texto autoregresiva según la arquitectura Llama 3.2 3B.
- Razonamiento matemático y resolución de problemas tipo competición (AIME, AMC), aunque con rendimiento prácticamente nulo en este checkpoint.
- No hay evidencia en la información disponible de soporte de tool calling, function calling ni agentes multi-paso.
- No hay evidencia de capacidades multimodales (visión, audio) ni de modo *thinking*.
- Capacidades multilingües: no disponibles en la información proporcionada.
- El checkpoint está pensado como referencia experimental, no como modelo de propósito general.

## Casos de uso

- Estudio de alineación de EOS en destilación on-policy: sirve como referencia *baseline* para comparar con el run `semantic-class` y cuantificar el efecto de la corrección del EOS sobre la longitud de generación y la precisión.
- Reproducción de experimentos de OPD: el repositorio incluye los 10 checkpoints y los resultados de evaluación, lo que permite reproducir la curva de inflación de longitud paso a paso.
- Análisis de truncamiento en decodificación: útil para estudiar cómo un estudiante que no emite EOS agota el presupuesto de `max_tokens` y cómo afecta a métricas de exactitud.
- Investigación sobre recompensas token-level: permite inspeccionar la dinámica de la señal estudiante−profesor en un entorno controlado de 3B parámetros.
- Docencia y formación: ejemplo didáctico de un fallo de alineación documentado con datos crudos de evaluación.
- Desarrollo de métodos de corrección de EOS: punto de partida para probar variantes (penalizaciones, forzado de EOS, recompensas semánticas) y medir su impacto.

## Benchmarks y rendimiento

Evaluación del paso 200 (16 rollouts por pregunta, prompt no-thinking, `max_tokens` 8192, temperatura 0.7, top_p 0.95):

| Tarea | Precisión media | Tasa de truncamiento | Longitud media |
|---|---|---|---|
| AIME24 | 0.000 | 0.998 | 8176 |
| AIME25 | 0.000 | 1.000 | 8192 |
| AMC23 | 0.013 | 0.997 | 8169 |

Evolución por checkpoint (precisión / truncamiento):

| Paso | AIME24 | AIME25 | AMC23 | Longitud media (AMC23) |
|---|---|---|---|---|
| 20 | 0.000 / 0.88 | 0.000 / 0.86 | 0.002 / 0.84 | 7003 |
| 40 | 0.000 / 0.96 | 0.002 / 0.95 | 0.002 / 0.95 | 7805 |
| 60 | 0.000 / 0.88 | 0.000 / 0.91 | 0.019 / 0.88 | 7329 |
| 80 | 0.000 / 0.90 | 0.000 / 0.91 | 0.009 / 0.87 | 7234 |
| 100 | 0.000 / 0.94 | 0.002 / 0.97 | 0.013 / 0.94 | 7746 |
| 120 | 0.000 / 0.97 | 0.000 / 0.97 | 0.019 / 0.96 | 7893 |
| 140 | 0.000 / 0.98 | 0.000 / 0.98 | 0.019 / 0.98 | 8032 |
| 160 | 0.002 / 1.00 | 0.000 / 1.00 | 0.017 / 1.00 | 8156 |
| 180 | 0.000 / 0.99 | 0.000 / 1.00 | 0.025 / 1.00 | 8192 |
| 200 | 0.000 / 1.00 | 0.000 / 1.00 | 0.013 / 1.00 | 8169 |

No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 7,2 GB solo para pesos (3.606.752.256 parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 8 y 10 GB para contextos moderados.
- En cuantización de 8 bits: ~3,6 GB de pesos; en 4 bits: ~1,8 GB de pesos (estimaciones teóricas, no verificadas en la información disponible).
- GPU recomendadas: A100, H100 o L40S para inferencia en bf16 con contexto largo; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para bf16 con contextos moderados.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB) y potencialmente en GPUs de 12 GB con cuantización.
- Opciones de despliegue: `transformers` (carga estándar, con soporte de subcarpetas para checkpoints intermedios), vLLM, TGI y llama.cpp/Ollama previa conversión a GGUF (no se proporcionan pesos GGUF en el repositorio).
- Latencia y throughput: no disponibles en la información proporcionada. Advertencia: al no emitir EOS, las generaciones agotan el presupuesto de tokens, lo que incrementa el coste por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `kzhao5/opd-rethink-llama3.2-3b-baseline-step200` | 3,6 B | no disponible | other (hereda Llama 3.2) | Hugging Face | Baseline de investigación, EOS sin corregir |
| `kzhao5/opd-rethink-llama3.2-3b-semantic-class-step200` | 3,6 B (mismo base) | no disponible | other | Hugging Face | Mismo run con corrección semántica de EOS |
| `meta-llama/Llama-3.2-3B-Instruct` | 3,2 B | 128 K (según modelo base) | Llama 3.2 Community License | Hugging Face | Profesor del experimento; uso general |
| `meta-llama/Llama-3.2-3B` | 3,2 B | 128 K (según modelo base) | Llama 3.2 Community License | Hugging Face | Inicialización del estudiante; solo preentrenado |

## Limitaciones y advertencias

- Fallo de alineación de EOS documentado: el estudiante deja de emitir su token EOS y las generaciones se alargan hasta el límite de `max_tokens`, con tasas de truncamiento del 99,7-100 % en el paso 200.
- Precisión prácticamente nula en AIME24, AIME25 y AMC23 (0,000-0,013), por lo que no es apto para tareas de razonamiento matemático.
- Riesgo elevado de generaciones largas y repetitivas; no recomendado para producción.
- Sesgos: no documentados en la información disponible; al derivar de Llama 3.2, hereda los sesgos del modelo base.
- Riesgo de alucinación: no evaluado en la información disponible.
- Restricciones de licencia: licencia `other` que hereda la del modelo base Llama 3.2; conviene revisar los términos de la Llama 3.2 Community License antes de cualquier uso comercial.
- Idiomas soportados no documentados; no se garantiza cobertura multilingüe más allá de la del modelo base.
- No hay evidencia de soporte de tool calling ni de despliegue en agentes.
- Checkpoint de investigación: no se han publicado métricas de robustez, seguridad ni evaluación humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kzhao5/opd-rethink-llama3.2-3b-baseline-step200
- Run de comparación (semantic-class): https://huggingface.co/kzhao5/opd-rethink-llama3.2-3b-semantic-class-step200
- Resultados de evaluación crudos: https://huggingface.co/datasets/kzhao5/opd-rethink-eval-results
- Wandb del entrenamiento: https://wandb.ai/shawn2002/OPD_Rethink/runs/jth2qfqn
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B
- Modelo profesor: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Librería verl: https://github.com/volcengine/verl

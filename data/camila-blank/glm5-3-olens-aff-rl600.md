# camila-blank/glm5.3-olens-aff-rl600

## Resumen

GLM-5.3 O-lens (Qwen3.6-27B reader) es un adaptador LoRA de interpretabilidad publicado por el usuario camila-blank. No es un modelo de lenguaje generativo al uso, sino un *lector de activaciones*: un Qwen3.6-27B modificado mediante PEFT que verbaliza las activaciones residuales de un modelo GLM-5.3 congelado, resumiéndolas en un único bullet de texto. El artefacto forma parte del trabajo "global-workspace issue #652", brazo `glm53aff-rl600-x4`.

El sistema se compone de tres piezas encadenadas: un modelo de recompensa (AR) formado por GLM-5.3 congelado más 11 cabezas ridge por capa sobre características de bloque promediadas por span (d_model 6144), entrenado con unos 20 millones de pares on-policy; un puente `unit_io` que proyecta el espacio de activaciones de GLM al espacio de entrada de Qwen mediante una inicialización ridge; y el lector final, un LoRA sobre Qwen3.6-27B afinado primero con SFT y luego con GRPO durante 600 pasos.

Su relevancia es de nicho pero específica: proporciona una sonda entrenada para leer 11 capas concretas (24, 29, 34, 39, 44, 49, 54, 59, 63, 68 y 73) del modelo GLM-5.3, con resultados medidos en WorkspaceBench que superan claramente a la variante SFT sola (macro gated 0.531 frente a 0.187 en el bloque 54). El repositorio ocupa 5,8 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Qwen3.6-27B, con puente `unit_io` y cabezas ridge por capa sobre GLM-5.3 congelado |
| Parametros totales | no disponible (el adaptador se distribuye como LoRA; el modelo base es Qwen3.6-27B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors; artefactos adicionales en `.pt` y `.json` (PEFT) |

## Arquitectura y entrenamiento

El pipeline tiene tres etapas. Primero se entrena un *activation reader* (AR) que actúa como recompensa: GLM-5.3 permanece congelado y sobre sus activaciones residuales se ajustan 11 cabezas ridge independientes, una por capa, sobre características de bloque promediadas por span con dimensión 6144, usando aproximadamente 20 millones de pares on-policy. Después se entrena un puente `unit_io` con inicialización ridge que traduce del espacio de activaciones de GLM al espacio de entrada de Qwen. Por último, el lector Qwen3.6-27B se afina en dos fases: un SFT seleccionado por mínima cross-entropy de validación (`sft/step40000`, con `bridge.pt` y LoRA) y un ajuste GRPO de 600 iteraciones (`rl/iter_000600`) cuya recompensa es el AR afín sobre la activación bruta del sujeto, con una referencia KL separada.

La innovación técnica reside en el uso del AR como función de recompensa diferenciable para alinear el lector con la geometría de activaciones del modelo objetivo, en lugar de supervisar directamente texto. El brazo RL emplea su propio puente del SFT. El repositorio incluye configuraciones YAML de ejecución, `rl.DONE.json`, `S6_train.json` y un directorio `provenance/` con la trazabilidad del experimento.

## Capacidades

- Verbalización de activaciones residuales de GLM-5.3 en un único bullet de texto.
- Cobertura de 11 capas específicas del modelo objetivo (24, 29, 34, 39, 44, 49, 54, 59, 63, 68, 73).
- Lectura agregada over-11-layers con puntuación macro gated de 0,722.
- Actuación como recompensa RL (el AR afín) para entrenar otros lectores.
- Proyección entre espacios de representación heterogéneos (GLM a Qwen) mediante el puente `unit_io`.
- No se documentan capacidades de generación general, tool calling, agentes, visión ni audio; el uso previsto es exclusivamente de interpretabilidad.

## Casos de uso

- Interpretabilidad mecanicista de GLM-5.3: el lector permite inspeccionar qué información codifican capas intermedias y tardías traduciendo activaciones a lenguaje natural, algo útil para auditar circuitos internos sin acceso a las matrices de pesos originales.
- Evaluación de sondas de activación: sirve como baseline reproducible en WorkspaceBench para comparar recetas de lectura (SFT frente a RL) sobre el mismo modelo objetivo.
- Entrenamiento de recompensas para lectura: el AR incluido (`ar/final/heads.pt`) puede reutilizarse como función de recompensa en experimentos de RL que busquen alinear otros lectores con las activaciones de GLM-5.3.
- Investigación en alineación de espacios latentes: el puente `unit_io` con inicialización ridge es un ejemplo concreto de traducción entre espacios de representación de modelos distintos, replicable en estudios de compatibilidad entre arquitecturas.
- Detección de alucinación en verbalizaciones: la métrica de hallucination (0,315 en el brazo rl600) permite usar el sistema para estudiar cuándo un lector inventa contenido que no está en la activación.
- Reproducibilidad de experimentos de interpretabilidad: los ficheros de provenance y las configuraciones YAML facilitan replicar el pipeline completo (AR, puente, SFT y GRPO) en un entorno propio.

## Benchmarks y rendimiento

WorkspaceBench (GLM, bench final #657, juez Opus 5.5, 4 muestras por celda):

| Brazo | Bloque | Macro gated | Alucinacion |
|---|---|---|---|
| this (rl600) | 54 | 0.531 | 0.315 |
| this (rl600) | 49 | 0.492 | 0.315 |
| SFT* | 54 | 0.187 | 0.102 |
| qglm-rl600 (#657) | 54 | 0.491 | 0.463 |

Macro gated agregado over-11-layers: 0.722.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del modelo base Qwen3.6-27B y de la precision de carga.
- GPU recomendadas: no disponible; por el tamano del base (27B) se requeririan GPU de datacenter (A100, H100) o consumer de gama alta con cuantizacion, pero no se confirma en la documentacion.
- Cabe en consumer GPU: no confirmado.
- Opciones de despliegue: PEFT sobre el modelo base Qwen/Qwen3.6-27B; requiere cargar `rl/iter_000600` (LoRA) junto con `sft/step40000/bridge.pt`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| glm5.3-olens-aff-rl600 (este) | LoRA sobre Qwen3.6-27B | no disponible | Macro gated 0.531 (bloque 54); 0.722 over-11 | no disponible | HuggingFace, 0 descargas |
| SFT* (misma familia) | LoRA sobre Qwen3.6-27B | no disponible | Macro gated 0.187 (bloque 54) | no disponible | Incluido en el repo |
| qglm-rl600 (#657) | no disponible | no disponible | Macro gated 0.491 (bloque 54); alucinacion 0.463 | no disponible | Referenciado en issue #657 |

No se dispone de comparativas con lectores de activaciones de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de nicho: no es un LLM de proposito general; no debe usarse para generacion, codigo o tareas conversacionales.
- Licencia no especificada: la ausencia de licencia explicita impide asumir permisos de uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Dependencia estricta del modelo base y del puente: el lector solo funciona con Qwen/Qwen3.6-27B y con el `bridge.pt` del SFT correspondiente; mezclar artefactos de otras variantes rompe la alineacion.
- Cobertura limitada a 11 capas concretas de GLM-5.3; no lee capas fuera de ese conjunto.
- Tasa de alucinacion de 0,315 en el brazo rl600: aproximadamente un tercio de las verbalizaciones puede contener contenido no sustentado por la activacion.
- Sin datos publicados sobre sesgos, idiomas soportados ni robustez multilingue.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni validacion externa independiente.
- El rendimiento se ha medido con un juez automatico (Opus 5.5) y 4 muestras por celda, lo que limita la significancia estadistica de las diferencias.

## Enlaces

- HuggingFace: https://huggingface.co/camila-blank/glm5.3-olens-aff-rl600
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Referencia al issue global-workspace #652 (mencionado en la model card, sin URL directa disponible)
- Referencia al bench #657 (mencionado en la model card, sin URL directa disponible)

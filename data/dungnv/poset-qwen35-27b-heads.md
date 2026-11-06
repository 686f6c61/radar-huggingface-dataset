# dungnv/poset-qwen35-27b-heads

## Resumen

POSET-qwen35-27b-heads es un conjunto de cabezas de predicción de longitud de razonamiento asociadas a Qwen/Qwen3.5-27B, publicadas por el usuario dungnv. No se trata de un modelo de lenguaje generativo completo, sino de un paquete de artefactos auxiliares (heads y calibradores conformales) que estiman cuántos tokens consumirá el modelo base antes de cerrar su bloque de razonamiento con `</think>`. El objetivo es alimentar el planificador conformal POSET y la línea base TRAIL, permitiendo decisiones de scheduling en tiempo de decodificación y de prefill.

El repositorio ocupa 0,1 GB e incluye los pesos de las cabezas en formato PyTorch (`.pt` y `.npz`), junto con metadatos de especificación y listas de splits. Las cabezas se entrenaron sobre trazas de generación (WildChat/LMSYS para el canal `chat` y ForeLen para el canal `base`) con precisión bf16, temperatura 0 y un límite de 32.768 tokens por generación. Su relevancia actual radica en que permiten acotar con garantías conformales la longitud de salida de un LLM de 27B, un insumo crítico para presupuestar cómputo y latencia en despliegues con razonamiento extendido.

La información pública es escasa: no se declaran licencia, idiomas ni pipeline en la ficha de Hugging Face, y el README se centra en la descripción técnica de los artefactos y en resultados offline de las cabezas. Por tanto, esta ficha describe exclusivamente lo que el autor documenta, marcando como "no disponible" todo aquello que no se especifica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP sobre activaciones internas del transformer base (capa de activación 30, salida de `input_layernorm` de la capa 31); ψ es un proyector lineal con pooling medio sobre activaciones de prefill |
| Parametros totales | no disponible (el repositorio contiene cabezas auxiliares, no un modelo completo; tamaño del repo 0,1 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento usa generaciones de hasta 32.768 tokens) |
| Tipos de cuantizacion | no disponible (pesos entrenados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`) y NumPy (`.npz`); metadatos en JSON |

## Arquitectura y entrenamiento

Las cabezas POSET son MLP de tres capas con dimensionalidad 5120 → 512 → 512 → 1, activación ReLU, dropout 0,1 y entradas estandarizadas. Predicen la fracción de progreso p = t/T con activación sigmoide y derivan una lectura de longitud restante R̂ = t(1−p)/p. Las cabezas TRAIL comparten la misma topología MLP pero reformulan la tarea como clasificación en 20 bins iguales de longitud restante sobre el intervalo [0, 8000]. El predictor ψ, orientado a tiempo de prefill, aplica pooling medio sobre la activación de prefill, pasa por Linear(5120,256) → ReLU → Dropout(0,3) → Linear(256,1) y predice sobre √T.

El entrenamiento se realizó con el pipeline `poset` (rama `pipeline-two-vllm`), en bf16, temperatura 0 y max_tokens 32768, descartando trazas con generaciones truncadas. Los volúmenes documentados son 12.888 trazas de chat para entrenamiento, 1.827 de calibración y 1.829 de evaluación; 8.309 trazas ForeLen para entrenamiento, 2.066 de calibración y 2.372 de evaluación; y 19.599 prompts para ψ en entrenamiento, 3.796 en calibración y 2.337 en evaluación. Todas las cabezas aplican parada temprana sobre un split interno de validación del 5 %, dividido por traza (ψ por prompt). La calibración conformal se materializa en `psi_q.json` (radios de split-conformal por α) y en los ficheros `conformal/{chat,base}_progress_a*.npz` con radios por paso q_t para α ∈ {0,05, 0,1, …, 0,9}.

## Capacidades

- Predicción de longitud de razonamiento en tiempo de decodificación mediante la cabeza de progreso (target p = t/T y lectura R̂ = t(1−p)/p).
- Predicción de longitud restante en bins (20 bins sobre [0, 8000]) mediante las cabezas TRAIL.
- Predicción en tiempo de prefill mediante ψ, que estima √T a partir de la activación media del prompt.
- Calibración conformal con cobertura garantizada por α, tanto a nivel de prompt (`psi_q.json`) como por paso de decodificación (`conformal/*.npz`).
- Dos variantes de dominio: `chat` (WildChat/LMSYS) y `base` (ForeLen), con cabezas y calibradores separados.
- Integración con el planificador POSET y con la línea base TRAIL para scheduling de LLM.
- No se documentan capacidades de generación de texto, código, matemáticas, visión, tool calling, agentes ni multilingüismo, ya que el paquete no es un modelo generativo.

## Casos de uso

- Planificación de cómputo en despliegues de razonamiento extendido: usar ψ para estimar la longitud de salida antes de la generación y reservar recursos de GPU en consecuencia, evitando sobreaprovisionamiento en colas de inferencia.
- Control de latencia en tiempo de decodificación: consultar la cabeza de progreso en cada paso para decidir si continuar, truncar o migrar la petición a otro worker, con radios conformales que acotan el error a un α configurable.
- Enrutamiento consciente de longitud: clasificar prompts entrantes según la longitud esperada (corta, media, larga) y dirigirlos a réplicas con distintos presupuestos de tokens, usando la variante `chat` para tráfico conversacional.
- Gestión de presupuesto en pipelines de agentes: incorporar la predicción de longitud restante como señal para decidir el número de pasos de razonamiento multi-step permitidos antes de agotar el budget de tokens.
- Evaluación comparativa de planificadores: emplear las cabezas y sus calibradores como referencia para medir la calidad de schedulers alternativos (POSET frente a TRAIL) sobre las mismas trazas de evaluación.
- Investigación en calibración conformal: reutilizar los radios q_t por α y las listas de splits (`head_split.json`) para reproducir experimentos de cobertura y anchura de intervalos en predicción de longitud.
- Detección de consultas anómalamente largas: monitorizar la predicción de ψ para identificar prompts que probablemente generen razonamientos desproporcionados y aplicar políticas de degradación o aviso.

## Benchmarks y rendimiento

Resultados offline sobre trazas de evaluación reservadas, tal como los documenta el autor:

| Cabeza | MAE por token | MAE por traza | Spearman ρ | Cobertura α=0,5 | Anchura media |
|---|---|---|---|---|---|
| chat_progress | 756 | 390 | 0,778 | 0,473 | 634 |
| base_progress | 1.492 | 771 | 0,841 | 0,470 | 1.531 |

Para ψ sobre sus prompts de evaluación: Spearman 0,699 y MAE 794 tokens. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el paquete no es un modelo de lenguaje evaluable en esas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; las cabezas son MLP de 5120 → 512 → 512 → 1 y ψ de 5120 → 256 → 1, por lo que su huella es marginal frente al modelo base Qwen3.5-27B, que requiere el grueso de la memoria.
- GPU recomendadas: no disponible. La viabilidad depende del despliegue del modelo base; las cabezas pueden residir en la misma GPU que el modelo.
- Compatibilidad con GPU de consumo: las cabezas en sí caben en cualquier GPU consumer; el modelo base de 27B condiciona el requisito real.
- Opciones de despliegue: integración con el pipeline `poset` (rama `pipeline-two-vllm`) y con TRAIL; no se documentan soportes para vLLM, llama.cpp, Ollama o TGI de forma independiente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| POSET-qwen35-27b-heads | Cabezas de predicción de longitud | no disponible | no disponible | MAE 390/771 por traza; Spearman 0,778/0,841 | no disponible | Hugging Face (dungnv) |
| TRAIL (cabezas binned incluidas) | Predicción de longitud por bins | misma topología MLP | no disponible | no disponible de forma aislada | no disponible | Incluido en el mismo repo |
| POSET ψ | Predictor de longitud en prefill | Linear(5120,256)→1 | no disponible | Spearman 0,699; MAE 794 | no disponible | Incluido en el mismo repo |

No se dispone de datos públicos sobre otros paquetes de cabezas de predicción de longitud comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, código ni respuestas; solo estima longitudes de razonamiento para el modelo base Qwen3.5-27B.
- Dependencia estricta del modelo base: las activaciones de entrada corresponden a la capa 30 (salida de `input_layernorm` de la capa 31) y al token `</think>` con id 248069; cualquier cambio de versión o tokenizador invalida las cabezas.
- Rendimiento dependiente del dominio: las cabezas `chat` y `base` se entrenaron sobre WildChat/LMSYS y ForeLen respectivamente; su uso fuera de esos dominios no está validado.
- Cobertura conformal empírica: la cobertura a α=0,5 medida es 0,473 y 0,470, ligeramente por debajo del objetivo nominal, lo que sugiere posibles desviaciones en distribuciones distintas a las de calibración.
- MAE elevado en términos absolutos: 756 y 1.492 tokens por token, y 390/771 por traza; en generaciones cortas el error relativo puede ser sustancial.
- Sesgos conocidos: no documentados.
- Riesgo de alucinación: no aplica al no generar texto, pero la predicción puede ser errónea y sesgar decisiones de scheduling.
- Restricciones de licencia para uso comercial: no disponible; la ficha no declara licencia, por lo que debe contactarse con el autor antes de un uso comercial.
- Idiomas: no disponibles; el comportamiento multilingüe de las cabezas no está evaluado.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el 2026-11-06, sin pipeline declarado; tratar como artefacto de investigación.

## Enlaces

- Hugging Face: https://huggingface.co/dungnv/poset-qwen35-27b-heads
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B

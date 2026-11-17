# Kai9987kai/supermix-v100

## Resumen

Supermix v100 (`v100_scf_balanced`) es un checkpoint de un modelo de lenguaje de tipo transformer con mezcla de expertos (MoE) desarrollado por el usuario Kai9987kai dentro del proyecto Supermix, un repositorio experimental de código abierto que combina ideas de neurociencia computacional con arquitecturas de lenguaje. El modelo se presenta como una variante "balanced" de la línea Cognitive Fabric, con extensiones que el autor denomina "connectome" y "physiology", incluyendo normalización divisiva Carandini-Heeger, error predictivo y trazas hebbianas.

Con 36.599.879 parámetros totales y 9.132.983 activos por token, un vocabulario de 9.415 tokens y solo 6 capas transformer, se trata de un modelo extremadamente pequeño, orientado a investigación y experimentación más que a producción general. El checkpoint pesa 153.161.606 bytes y se distribuye en formato PyTorch (`.pt`), no en safetensors ni GGUF.

Su relevancia actual es limitada y de nicho: se publica como release "Experimental" dentro de una jerarquía interna de promoción (la versión v96 sigue siendo la "Promoted Default"), con evaluación realizada únicamente en CPU bajo Windows y sin benchmarks estándar de la industria (MMLU, HumanEval, GSM8K). Los resultados reportados son métricas internas de pérdida y conteo de tareas superadas en suites propias del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), extensiones "connectome" y "physiology" (normalización divisiva E/I, error predictivo, traza hebbiana, halt por entropía de pensamiento) |
| Parametros totales | 36.599.879 |
| Parametros activos | 9.132.983 por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`, checkpoint `v100_scf_balanced.selected.pt`) |

## Arquitectura y entrenamiento

El modelo es un transformer MoE de 6 capas con un vocabulario de 9.415 tokens y 36,6 M de parámetros totales, de los cuales 9,1 M se activan por token. Sobre esta base, el autor añade lo que denomina extensiones de "connectome y fisiología": normalización divisiva E/I de Carandini-Heeger (`cns_divisive_norm`) sobre pools inhibitorios de Dale, activada por defecto como opción desactivada, junto con `cns_predictive_error`, `cns_hebbian_trace` y `thinking_entropy_halt`. El checkpoint se inicializa en caliente desde `v96_physio_neurogenesis.selected.pt` con un esquema de trunk congelado durante 12 pasos, decaimiento de peso `no_norm_bias`, decaimiento MTP y rehearsal sobre subconjuntos duros.

El corpus de entrenamiento es `datasets/v100/v100_precision_mix.jsonl`, con 8.470 filas y hash SHA-256 documentado. El autor reporta un mejor paso en 16 con pérdida de validación de 0,023837 (superando el criterio `passed = True`), pérdida de 0,01004 (ppl 1,0101) en 62 pares del conjunto `tier1_seen_response`, y 0,019318 (ppl 1,0195) en 761 pares del conjunto `tier3_unseen_sentence`. Se documentan ablaciones del connectome sobre 32 filas con referencia 0,017653: `gates_off` +0,000238 nats, `left_only` +5,9e-05 nats y `right_only` +0,000246 nats. No se especifica el número total de tokens de entrenamiento ni la composición detallada del dataset más allá del recuento de filas.

## Capacidades

- Generación de texto autoregresiva mediante pipeline `text-generation`.
- Razonamiento de código y física, según los tags del autor (`code-reasoning`, `physics`).
- Enfoque neuro-simbólico con verificación formal (`formal-verification`) integrada en el modo híbrido SCF.
- Modo "thinking" con parada por entropía (`thinking_entropy_halt`), que detiene la generación según una señal de entropía interna.
- Verificación determinista en modo híbrido SCF (`python -m scf bench --neural`), que combina el modelo neuronal con un atlas de connectome y verificación simbólica.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente; el modo híbrido SCF sugiere flujos de verificación por pasos, pero no se documenta como capacidad de agente.
- Capacidades multilingües: no disponibles; el autor no declara idiomas.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Investigación en neuro-simbólico: el modelo sirve como banco de pruebas para experimentar con normalización divisiva E/I, error predictivo y trazas hebbianas en un transformer pequeño, comparando ablaciones (`gates_off`, `left_only`, `right_only`) sobre las métricas de pérdida reportadas.
- Reproducción de experimentos del proyecto Supermix: dado que el checkpoint se publica con hash SHA-256 del corpus y scripts de evaluación, permite reproducir las suites `seed=82`, `seed=83` y `seed=84` en CPU y verificar los conteos de tareas superadas (35/41, 72/82, 72/82).
- Docencia y demostraciones de MoE a pequeña escala: con 36,6 M de parámetros y 6 capas, el modelo cabe en cualquier equipo y puede usarse para ilustrar el enrutamiento de expertos y el cómputo activo por token (9,1 M).
- Prototipado de pipelines de verificación formal: el modo híbrido SCF (`scf bench --neural`) permite integrar el modelo en un flujo con verificación determinista y atlas de connectome, útil para experimentar con arquitecturas neuro-simbólicas antes de escalar.
- Desarrollo de interfaces de chat experimentales: el repositorio incluye `source/supermix_chat_server.py`, que permite levantar una UI web local en el puerto 8780 con el checkpoint `v100_scf_balanced` para pruebas de interacción.
- Evaluación comparativa interna de checkpoints: al ser un release "Experimental" frente al "Promoted Default" v96, sirve para comparar estrategias de entrenamiento (frozen trunk, MTP decay, rehearsal) dentro de la misma familia de modelos.

## Benchmarks y rendimiento

Los únicos datos disponibles son evaluaciones internas del autor, ejecutadas en Windows con PyTorch 2.11.0+cpu y `cuda_available=False`, con `max_new_tokens=96`:

| Suite de evaluacion | Resultado | Notas |
|---|---:|---|
| Standalone Neural `seed=82` (41 tareas) | 35 / 41 (0,8537) | `results/eval_v100_selected_seed82.json` |
| Standalone Neural `seed=83` (82 tareas) | 72 / 82 (0,8780) | `results/eval_v100_selected_n82_seed83.json` |
| Standalone Neural `seed=84` (82 tareas) | 72 / 82 (0,8780) | `results/eval_v100_selected_n82_seed84.json` (179/205 = 87,3% combinado) |
| SCF Hybrid (`--seed 82 --neural`) | 41 / 41 (1,0000) | Verificación determinista + atlas de connectome |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 36,6 M de parámetros; el checkpoint ocupa 153 MB en disco.
- GPU recomendadas: no se especifican; el autor reporta todas las evaluaciones en CPU (`cuda_available=False`).
- Cabe en cualquier GPU consumer, e incluso en CPU sin GPU dedicada, dado el tamaño del modelo.
- Opciones de despliegue: PyTorch nativo (`torch`, `numpy`, `flask`, `huggingface_hub`), servidor de chat propio (`source/supermix_chat_server.py`) y CLI `scf`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el formato `.pt` no es directamente compatible con esos runners.
- Latencia y throughput: no disponibles; las evaluaciones se hicieron en CPU con `max_new_tokens=96`, sin cifras de latencia publicadas.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de la misma categoría (MoE de ~36 M de parámetros o modelos neuro-simbólicos experimentales), y no se dispone de datos de benchmarks estándar que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Modelo extremadamente pequeño (36,6 M de parámetros totales, 9,1 M activos): su capacidad de razonamiento general y conocimiento del mundo es muy limitada en comparación con modelos de miles de millones de parámetros.
- Evaluación realizada exclusivamente en CPU bajo Windows con PyTorch 2.11.0+cpu y `max_new_tokens=96`; no hay datos de rendimiento en GPU ni de latencia en producción.
- Los benchmarks reportados son suites internas del proyecto, no estándares de la industria; los porcentajes de tareas superadas no son comparables con MMLU, HumanEval o GSM8K.
- El autor clasifica explícitamente el release como "Experimental (#2 Standalone Neural Accuracy)"; la versión recomendada por defecto sigue siendo `v96_physio_neurogenesis.selected.pt`.
- No se declaran idiomas soportados; el vocabulario de 9.415 tokens es muy reducido y probablemente limita la cobertura léxica y multilingüe.
- Longitud de contexto no documentada; no se debe asumir una ventana amplia.
- Riesgo de alucinación y sesgos: no documentados por el autor; en un modelo de este tamaño el riesgo de generación incoherente es alto.
- Licencia MIT, que permite uso comercial, pero sin garantías del autor y con la advertencia de que el modelo es experimental.
- El formato `.pt` requiere cargar código Python del repositorio; conviene auditar el código antes de ejecutarlo en entornos de producción.
- No hay soporte documentado de tool calling, agentes ni cuantización, lo que limita su integración en pipelines estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kai9987kai/supermix-v100
- Modelo base en Hugging Face: https://huggingface.co/Kai9987kai/supermix-v99-cognitive-fabric
- Repositorio del proyecto Supermix: https://github.com/kai9987kai/Supermix

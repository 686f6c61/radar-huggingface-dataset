# DanieleGammelli/wm-horizon-readout-ablation

## Resumen

`DanieleGammelli/wm-horizon-readout-ablation` no es un modelo único, sino un repositorio de checkpoints de investigación (167,3 GB) que recoge un estudio de ablación sobre dos ejes de diseño de *world-action models* (WAM) aplicados a robótica: el horizonte de planificación (K) y la profundidad de lectura (*readout depth*, R). El autor, Daniele Gammelli, publica los pesos resultantes de afinar a parámetro completo tres modelos base —Cosmos-Policy, LingBot-VA y Cosmos3-Edge— sobre exactamente las mismas demostraciones, lo que permite aislar el efecto de cada variable experimental.

El problema que aborda es metodológico: en robótica basada en modelos generativos del mundo, no está claro cómo afectan el horizonte de predicción y la profundidad del *readout* al rendimiento en bucle cerrado. Este repositorio entrega los checkpoints intermedios (steps 250, 500, 750, época 2 y época 5) de cada brazo para que otros grupos reproduzcan o extiendan el análisis. La evaluación se realiza en bucle cerrado sobre LIBERO-MAX Lite, un benchmark de manipulación robótica.

Es relevante ahora porque la comunidad de *world models* para control robótico carece de estudios de ablación reproducibles con pesos públicos. Además, el repositorio mezcla tres licencias distintas por carpeta (Apache-2.0, NSCLv1 y OpenMDW-1.1), lo que lo convierte en un caso interesante de gestión de licencias heterogéneas en un mismo artefacto. No es un producto listo para producción: la propia model card lo etiqueta explícitamente como *research checkpoints (not products)*.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | World-action models (WAM) basados en transformers de difusión; tres familias: Cosmos-Policy, LingBot-VA y Cosmos3-Edge |
| Parámetros totales | No disponible de forma agregada; Cosmos-Policy-LIBERO-Predict2-2B es de 2B parámetros; el resto no disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos en bf16 para Cosmos-Policy y DCP para Cosmos3-Edge) |
| Idiomas soportados | No disponible (modelo de robótica, no lingüístico) |
| Licencia | Mixta por carpeta: Apache-2.0 (`lingbot-va/`), NVIDIA One-Way Noncommercial License NSCLv1 (`cosmos-policy/`), OpenMDW-1.1 (`cosmos3-edge/`) |
| Formato de pesos | safetensors (Cosmos-Policy, `model.net` en bf16); torch DCP (`net_ema`) para Cosmos3-Edge; transformer de LingBot-VA (formato no especificado) |

## Arquitectura y entrenamiento

Los tres modelos base son *world-action models* que combinan un modelo generativo del mundo (difusión) con un módulo de acción para control robótico. Cosmos-Policy y Cosmos3-Edge provienen de NVIDIA; LingBot-VA es de Robbyant y se describe en el paper *Causal World Modeling for Robot Control* (arXiv:2601.21998). El estudio de ablación varía dos dimensiones: el horizonte de planificación K (brazo `horizon/K4` en LingBot-VA) y la profundidad de lectura R (brazos `readout/R1` en LingBot-VA y `readout/Rq` en Cosmos-Policy).

Todos los brazos se afinan a parámetro completo sobre el mismo conjunto: la mezcla M5 de LIBERO (las cuatro suites) más las demostraciones de entrenamiento de LIBERO-Plus, con una partición fija de validación (split.json con sha256 `9d6be2b3...`). Los metadatos de cada carpeta (`meta.json`) registran brazo, step, época, batch global, commit de código y *run* de W&B. Los tamaños de batch global difieren: 256 para Cosmos-Policy y 80 para LingBot-VA. Para LingBot-VA solo se incluye el transformer afinado; el VAE, el codificador de texto y el tokenizador son los del modelo base sin modificar. En Cosmos-Policy se incluye `cpcoal_meta.json` con el *slot layout* y el nivel de *readout* necesarios para la evaluación.

## Capacidades

- Control robótico mediante *world-action models*: generación de acciones a partir de observaciones y planificación en el espacio del modelo del mundo.
- Planificación con horizonte configurable (brazo K4 en LingBot-VA).
- Variación de profundidad de *readout* (brazos R1 y Rq) para estudiar el compromiso entre capacidad y coste computacional.
- Evaluación en bucle cerrado sobre LIBERO-MAX Lite (manipulación robótica de las suites LIBERO).
- Fine-tuning a parámetro completo reproducible: cada checkpoint incluye metadatos de step, época, batch y commit.
- No soporta *tool calling*, agentes conversacionales ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Reproducción de estudios de ablación en robótica: investigadores pueden descargar los checkpoints de cada brazo (K4, R1, Rq) y comparar el efecto del horizonte y la profundidad de *readout* sobre el éxito en LIBERO-MAX Lite.
- Investigación sobre *world models* para control: los pesos de Cosmos-Policy y Cosmos3-Edge permiten analizar cómo la representación del mundo condiciona la política de acciones en tareas de manipulación.
- Desarrollo de métodos de planificación con horizonte adaptativo: los checkpoints intermedios (steps 250–750) sirven para estudiar cómo evoluciona el rendimiento con el entrenamiento y calibrar estrategias de *early stopping*.
- Benchmarking de infraestructura de inferencia robótica: el tamaño del repo (167,3 GB) y la mezcla de formatos (safetensors bf16, DCP) permiten probar pipelines de carga y despliegue con el *action server* de cosmos-framework.
- Estudio de licencias heterogéneas: caso práctico para equipos jurídicos y de *compliance* que necesiten gestionar un artefacto con tres licencias distintas según la carpeta.
- Docencia e investigación académica en robótica: al ser checkpoints de investigación con metadatos completos (W&B, commit, split), son adecuados para cursos de posgrado sobre *world models* y aprendizaje por imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona evaluación en bucle cerrado sobre LIBERO-MAX Lite, pero no incluye cifras de éxito ni comparaciones numéricas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada: no disponible de forma agregada. Cosmos-Policy-LIBERO-Predict2-2B, con 2B parámetros en bf16, requiere aproximadamente 4 GB solo para los pesos, más memoria para activaciones y el VAE/codificador de texto del modelo base; en la práctica se recomienda al menos 16–24 GB para inferencia cómoda, aunque este dato no está confirmado en la información disponible.
- GPU recomendadas: no disponible en la model card. Por el tamaño de los modelos (2B en Cosmos-Policy) y el uso de difusión, se espera que requiera GPU de datacenter (A100, H100) o consumer de gama alta (RTX 4090), pero no hay confirmación oficial.
- ¿Cabe en GPU consumer? Probablemente para Cosmos-Policy (2B), pero no confirmado; Cosmos3-Edge y LingBot-VA no tienen tamaño especificado.
- Opciones de despliegue: el *action server* de cosmos-framework con `--checkpoint-path` para Cosmos3-Edge (formato DCP); para Cosmos-Policy, carga de safetensors bf16; para LingBot-VA, el transformer del modelo base. No se mencionan vLLM, llama.cpp ni Ollama (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `wm-horizon-readout-ablation` (este repo) | Mixto (2B en Cosmos-Policy; resto no disponible) | No disponible | No publicado | Mixta por carpeta (Apache-2.0 / NSCLv1 / OpenMDW-1.1) | Hugging Face, 0 descargas |
| Cosmos-Policy-LIBERO-Predict2-2B (NVIDIA) | 2B | No disponible | No disponible en esta ficha | NSCLv1 (no comercial) | Hugging Face (`nvidia/...`) |
| LingBot-VA (Robbyant) | No disponible | No disponible | No disponible en esta ficha | Apache-2.0 | Hugging Face (`robbyant/lingbot-va-posttrain-libero-long`) |
| Cosmos3-Edge (NVIDIA) | No disponible | No disponible | No disponible en esta ficha | OpenMDW-1.1 | Hugging Face (`nvidia/Cosmos3-Edge`) |

Los tres modelos base son las alternativas naturales; este repositorio aporta los derivados afinados y los brazos de ablación, no un modelo nuevo con rendimiento propio publicado.

## Limitaciones y advertencias

- No es un producto: la model card lo declara explícitamente como *research checkpoints*, sin garantías de robustez ni soporte.
- Licencias heterogéneas: el uso comercial está prohibido para todo lo que esté bajo `cosmos-policy/` (NSCLv1, solo no comercial); `lingbot-va/` es Apache-2.0 (permite uso comercial); `cosmos3-edge/` está bajo OpenMDW-1.1 (requiere revisar los términos). Mezclar carpetas en un mismo producto puede violar la licencia más restrictiva.
- Dependencia del modelo base: para LingBot-VA solo se incluye el transformer; sin el VAE, codificador de texto y tokenizador del modelo base, los pesos son inutilizables.
- Sin datos de benchmarks publicados: no se puede afirmar superioridad de ningún brazo sin consultar los *runs* de W&B enlazados.
- Dominio restringido: entrenado exclusivamente sobre LIBERO y LIBERO-Plus; no se espera generalización a tareas fuera de ese benchmark sin *fine-tuning* adicional.
- Riesgo de sobreajuste a la partición fija (`split.json` con sha256 concreto); la reproducibilidad depende de usar exactamente esa partición.
- Repositorio de gran tamaño (167,3 GB): la descarga completa es costosa; conviene descargar solo la carpeta del brazo de interés.
- Sin información sobre sesgos, alucinación o comportamiento fuera de distribución en robótica real; los resultados son en simulación (LIBERO-MAX Lite).

## Enlaces

- Hugging Face: https://huggingface.co/DanieleGammelli/wm-horizon-readout-ablation
- Paper LingBot-VA (*Causal World Modeling for Robot Control*): https://huggingface.co/papers/2601.21998
- Repositorio LingBot-VA (Robbyant): https://github.com/Robbyant/lingbot-va
- Modelo base LingBot-VA: https://huggingface.co/robbyant/lingbot-va-posttrain-libero-long
- Modelo base Cosmos-Policy: https://huggingface.co/nvidia/Cosmos-Policy-LIBERO-Predict2-2B
- Modelo base Cosmos3-Edge: https://huggingface.co/nvidia/Cosmos3-Edge
- Licencia NSCLv1: https://github.com/NVlabs/HMAR/blob/main/LICENSE
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Run W&B Cosmos-Policy readout Rq: https://wandb.ai/gammelli/wm-horizon-readout-ablation/runs/wmabl-cosmos-policy-readout-rq-9d6be2b3
- Run W&B LingBot-VA horizon K4: https://wandb.ai/gammelli/wm-horizon-readout-ablation/runs/wmabl-lingbot-va-horizon-k4-9d6be2b3
- Run W&B LingBot-VA readout R1: https://wandb.ai/gammelli/wm-horizon-readout-ablation/runs/wmabl-lingbot-va-readout-r1-9d6be2b3

# gaius-lex/basal-omni-1.1-max-NVFP4

## Resumen

basal-omni-1.1-max-NVFP4 es un artefacto de calibración publicado por el usuario gaius-lex para el modelo `Remek/basal-omni-1.1-max`, un modelo de 12B parámetros (11.959.730.224 exactos según safetensors) construido sobre la arquitectura Gemma 4 Unified y distribuido con licencia Apache-2.0. No es un modelo nuevo ni un fine-tune: es una copia sin modificar de los pesos en bf16 del modelo base en el commit `04fdf252fbd35c385239b6903cbf839436c65677`, acompañada de un fichero `NVFP4_AMAX.json` que contiene los valores amax de activación necesarios para que el motor de inferencia basal (v2.8.0) pueda aplicar cuantización NVFP4 en tiempo de carga sobre GPUs Blackwell (sm100/sm120).

El problema que resuelve es concreto: el motor basal solo admite cuantización NVFP4 para la variante ultra de 31B del proyecto basal-omni, y rechaza la forma de 12B porque el autor original no publicó calibración para ella. Este repositorio aporta los 328 valores amax (48 capas × 7 proyecciones, menos `v_proj` en las 8 capas globales con `attention_k_eq_v`) medidos sobre 610 peticiones reales, lo que permite servir el modelo de 12B en NVFP4 con un parche local de una línea en `basal/engine.py`.

Es relevante ahora porque demuestra un patrón de cuantización a nivel de proyección (solo capas 2-45 en NVFP4, capas 0, 1, 46, 47, embeddings y head en bf16) con validación empírica limitada: el propio autor advierte que NVFP4 no pasó el criterio de precisión de upstream para esta forma y que cambia "unos pocos por ciento" de las decisiones fuera del filtro de relevancia legal polaco. El repo ocupa 24 GB porque los pesos se almacenan en bf16; la cuantización ocurre al cargar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Gemma 4 Unified (`gemma4_unified`) |
| Parámetros totales | 11.959.730.224 (~12B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 (e2m1, escala e4m3 por cada 16 valores, escala global por tensor) en tiempo de carga; pesos almacenados en bf16; capas 0, 1, 46, 47, embeddings y head permanecen en bf16 |
| Idiomas soportados | polaco (pl), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16) + `NVFP4_AMAX.json` y `NVFP4_AMAX.raw.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es Gemma 4 Unified, un transformer decoder-only con 48 capas y dimensión oculta de 3840 (la forma `(3840, 48)` que el motor basal usa para identificar este modelo). El detalle arquitectónico interno no está documentado en la información disponible; lo que sí se describe con precisión es el esquema de cuantización: las proyecciones q/k/v/o y gate/up/down de las capas 2 a 45 se cuantizan a NVFP4, mientras que las capas 0, 1, 46 y 47, los embeddings y la head se mantienen en bf16 mediante el parámetro `--fp8-bf16-layers 2`. Las activaciones usan una escala global fija por capa lineal calculada como 2 × el máximo |input| calibrado / (6 × 448), con `MARGIN = 2` en `basal/nvfp4.py`.

No hay información sobre el dataset de entrenamiento, el número de tokens, ni si hubo RLHF o DPO en el modelo base. Lo que sí está documentado es el procedimiento de calibración de este repositorio: se sirvió el modelo en modo eager con bfloat16 sobre una RTX PRO 6000 Blackwell, se instalaron hooks de pre-forward en las 328 capas `nn.Linear` del modelo de texto y se registró el máximo |x| de cada llamada sobre 610 peticiones `/v1/systemone` (280 decisiones de relevancia legal polaca con pasajes de PolEval-2022 y estados largos de 3.000-6.000 caracteres, 260 decisiones del fichero `examples/triage/tickets.jsonl` con presets de triage, moderación, compliance, enrutamiento y guardas, y 70 ítems de enrutamiento sintético en pl/en). Los máximos son estables: para cada clave cuantizada, la llamada mayor está dentro de 1,13× de la segunda y 1,34× de la octava; solo la capa 0, que se mantiene en bf16, presenta un atípico de 1,56×.

## Capacidades

- Generación de texto y razonamiento en polaco e inglés.
- Clasificación y decisión estructurada mediante el formato de prompt del motor basal (`/v1/systemone`), con prefill de lectura `{"answer": "`.
- Modos de decisión `choice`, `score` y `noul` (pregunta con criterios), usados en los presets de triage, moderación, compliance y enrutamiento de intención.
- Filtrado de relevancia legal: validado empíricamente sobre preguntas y pasajes de PolEval-2022.
- Guardas (`guard_*`) para clasificación de seguridad en pipelines de decisión.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles en la información proporcionada (pese al nombre "omni").

## Casos de uso

- Filtro de relevancia legal en polaco: el modelo se ha calibrado y validado específicamente sobre el formato `PYTANIE PRAWNE: ... FRAGMENT DOKUMENTU PRAWNEGO: ...` con pasajes de estatutos y preguntas de PolEval-2022. Es el escenario donde el autor confirma que NVFP4 mantiene la calidad; se usaría como primera etapa de un pipeline de recuperación documental jurídica.
- Triaje de tickets de soporte: los presets `triage` y `route_intent` del motor basal permiten clasificar tickets entrantes en categorías o enrutarlos a equipos, con estados de hasta 3.000 tokens.
- Moderación de contenido: el preset `moderation` con modo `choice` o `score` sirve para clasificar texto de usuario antes de publicarlo o reenviarlo.
- Verificación de cumplimiento normativo: el preset `compliance` evalúa si un texto cumple criterios definidos, adecuado para revisiones automatizadas de documentación interna.
- Guardas de seguridad en producción: los presets `guard_*` actúan como barrera previa a acciones automatizadas, siempre que se acepte que las probabilidades son crudas (sin calibración) y que las acciones automatizadas se marcan como `"calibration": "unvalidated"`.
- Enrutamiento multilingüe pl/en: los 70 ítems sintéticos de enrutamiento cubren ambos idiomas con entre 2 y 10 opciones, útil para dirigir consultas a microservicios especializados.
- Despliegue en GPUs Blackwell con VRAM limitada: el modo `--quant-load cpu` permite servir el modelo en tarjetas de menos de ~28 GB cuantizando capa a capa en la GPU, lo que habilita entornos de inferencia más económicos que un despliegue bf16 completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta una validación cualitativa: NVFP4 "es correcto en nuestro filtro de relevancia legal polaco y cambia unos pocos por ciento de otras decisiones", sin cifras concretas. No se proporcionan datos de MMLU, HumanEval, GSM8K ni latencia/throughput medidos.

## Requisitos de hardware

- VRAM estimada: con pesos bf16 el repo ocupa 24 GB, por lo que la inferencia completa en bf16 requiere aproximadamente 24 GB más overhead de activaciones y grafos CUDA. Con NVFP4 la huella de pesos se reduce a ~6 GB, pero el autor indica que `--quant-load cpu` es necesario en tarjetas de menos de ~28 GB, lo que sugiere que el proceso de carga y los grafos consumen memoria adicional significativa.
- GPU recomendadas: Blackwell sm100/sm120 (por ejemplo RTX PRO 6000 Blackwell, usada en la calibración); el soporte NVFP4 del motor basal está limitado a estas arquitecturas.
- Cabe en consumer GPU: no hay datos que confirmen funcionamiento en GPUs de consumo; el requisito de arquitectura Blackwell excluye generaciones anteriores.
- Opciones de despliegue: exclusivamente `basal-serve` v2.8.0 en modo `--mode nvfp4` (o `--mode eager --dtype bfloat16` para la calibración). Requiere torch 2.13.0+cu130, Triton y python3.12-dev. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor menciona que `--graph-memory-gb N` fija las formas de los grafos CUDA de modo que cualquier tarjeta con el mismo N responde de forma idéntica, pero no aporta cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización NVFP4 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| basal-omni-1.1-max-NVFP4 (este) | 12B | no disponible | Sí, vía calibración de terceros | Apache-2.0 | Hugging Face, 0 descargas |
| Remek/basal-omni-1.1-max | 12B | no disponible | No (rechazada por el gate de precisión de upstream) | Apache-2.0 | Hugging Face (modelo base) |
| Remek/basal-omni-1.0-ultra | 31B | no disponible | Sí, oficial con `CALIBRATION.nvfp4.json` | Apache-2.0 (según upstream) | Hugging Face |

La comparativa con modelos de propósito general de tamaño similar no está disponible en la información proporcionada; el ecosistema basal está orientado a decisiones estructuradas y clasificación, no a generación abierta, lo que limita la comparación directa con modelos tipo Llama o Qwen.

## Limitaciones y advertencias

- No es un release oficial: es una copia de los pesos del modelo base más un fichero de calibración de un tercero. Cualquier problema de calidad del modelo subyacente se hereda sin cambios.
- El propio autor de basal documenta que NVFP4 no superó su criterio de precisión para la forma de 12B; esta calibración no contradice esa advertencia, solo la matiza para un dominio concreto (relevancia legal polaca).
- No se incluye `CALIBRATION.nvfp4.json`: hay que servir con `--no-calibration`. En consecuencia, las probabilidades son crudas, `max_error`, `abstain` y los umbrales certificados no están disponibles, y las acciones automatizadas se marcan como `"calibration": "unvalidated"`.
- Requiere un parche manual en `basal/engine.py` (~línea 709) para añadir `(3840, 48)` a `OMNI_QUANT_SHAPES`; sin él, basal 2.8.0 rechaza la cuantización de esta forma.
- Solo funciona en GPUs Blackwell (sm100/sm120); no hay soporte para arquitecturas anteriores.
- Idiomas limitados a polaco e inglés; no hay evidencia de capacidades multilingües más amplias.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero al ser un modelo de decisión con salida estructurada, los errores se manifiestan como clasificaciones incorrectas más que como texto inventado.
- La licencia Apache-2.0 permite uso comercial, pero el parche del motor y la ausencia de calibración validada trasladan al operador la responsabilidad de validar el comportamiento en su dominio.
- Repo de 24 GB por almacenar pesos en bf16: la descarga y el almacenamiento tienen un coste considerable frente a los ~6 GB que ocuparían los pesos ya cuantizados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/gaius-lex/basal-omni-1.1-max-NVFP4
- Modelo base: https://huggingface.co/Remek/basal-omni-1.1-max
- Motor basal: https://github.com/rkinas/basal
- Release basal v2.8.0: https://github.com/rkinas/basal/archive/refs/tags/v2.8.0.tar.gz
- Índice de wheels de PyTorch cu130: https://download.pytorch.org/whl/cu130

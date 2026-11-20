# quantumaikr/max-1b-moe10-long

## Resumen

max-1b-moe10-long es un checkpoint de investigación publicado por quantumaikr que continúa el preentrenamiento del modelo max-1B-mixture-of-experts. Se trata de un transformer MoE de 1,12 mil millones de parámetros totales con 149 millones activos por token (64 expertos, top-2), 16 capas, dimensión oculta 1024 y una ventana de contexto de solo 1024 tokens. El modelo parte del checkpoint max-1b-moe10-r1 (0,72B tokens) y añade 1,55B tokens adicionales en una ejecución de tasa de aprendizaje constante.

La contribución técnica principal es metodológica: en lugar de aplicar un cooldown de learning rate al final del entrenamiento, el autor promedia uniformemente snapshots de pesos bf16 guardados cada 50 pasos, presentando el resultado como `final_avg.pt`. Según la model card, este promedio supera tanto al último snapshot individual como al checkpoint de la ronda anterior con cooldown en todas las pérdidas de validación reportadas.

Es importante subrayar que el autor lo describe explícitamente como un checkpoint de investigación y no como un modelo de chat utilizable. Los pesos se distribuyen como checkpoints crudos de PyTorch (no como modelo de `transformers`), con licencia Apache 2.0 y soporte declarado de coreano e inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (64 expertos, top-2) |
| Parametros totales | 1,12B |
| Parametros activos | 149M por token |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (solo pesos bf16 publicados) |
| Idiomas soportados | coreano (ko), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoints crudos de PyTorch (`.pt`), no safetensors ni GGUF |

Otros datos de forma recogidos en la model card: 16 capas, hidden 1024, 16 cabezas de atencion y 4 cabezas KV, FFN de experto de dimension 320, vocabulario de 32000 tokens con tokenizer BPE de 32k.

## Arquitectura y entrenamiento

El modelo es un transformer MoE con 64 expertos y enrutamiento top-2, lo que activa 149M de los 1,12B parámetros totales en cada token. La forma es deliberadamente compacta: 16 capas, hidden 1024, atencion con 16 cabezas y 4 cabezas KV (GQA) y FFN de experto de dimension 320. El entrenamiento continuado parte del checkpoint max-1b-moe10-r1 (0,72B tokens) y añade 1,55B tokens en total, con batch de 0,5M tokens y tasa de aprendizaje constante.

El optimizador combina Muon (lr 0,02) para los pesos y AdamW para los embeddings. La mezcla de datos es 40% web coreano, 20% PDF coreano, 25% educativo inglés, 8% educativo inglés de alta calidad y 7% matemáticas. La innovación destacable no es arquitectónica sino de schedule: en lugar de un cooldown de LR, se promedian uniformemente los snapshots bf16 guardados cada 50 pasos, generando `final_avg.pt`. No se menciona RLHF, DPO ni ninguna fase de alineación; es un checkpoint puramente de preentrenamiento.

## Capacidades

- Modelo base de preentrenamiento: completa texto, no esta instruido ni alineado para conversacion.
- Generacion de texto en coreano e ingles, con especial enfasis en contenido web y PDF coreano y material educativo ingles.
- Razonamiento matematico basico derivado del 7% de datos de matematicas en la mezcla.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- Capacidad multilingue limitada a los dos idiomas del entrenamiento (ko, en).

## Casos de uso

- Investigacion sobre schedules de learning rate: el checkpoint permite reproducir y comparar el promedio de snapshots frente al cooldown de LR, usando las perdidas de validacion publicadas como referencia.
- Experimentos de destilacion o inicializacion: al ser un MoE pequeno con 149M parametros activos, sirve como punto de partida para fine-tuning en tareas coreanas o inglesas con recursos limitados.
- Evaluacion de enrutamiento MoE: los 64 expertos con top-2 permiten estudiar el comportamiento del router y el balance de carga en un modelo de escala reducida.
- Generacion de texto coreano de dominio web o PDF: util para probar la calidad del modelo base en completado de documentos, siempre con fine-tuning previo y validacion humana.
- Baseline academico: referencia para comparar arquitecturas MoE de ~1B parametros en tareas de lenguaje coreano e ingles.
- Estudio de tokenizers: el tokenizer BPE de 32k puede analizarse por separado para tareas de tokenizacion coreana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card solo reporta perdidas de validacion en held-out:

| Checkpoint | ko | en | ko PDF | math | gov |
|---|---|---|---|---|---|
| final_avg (media de snapshots) | 3,0487 | 2,8575 | 2,2423 | 2,0676 | 2,1849 |
| snap_003000.pt | 3,1307 | 2,9248 | 2,2830 | 2,1233 | 2,2569 |
| r1 final (cooldown de LR, 0,90B tok) | 3,1910 | 2,9670 | 2,3290 | 2,1424 | 2,2939 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2,3 GB solo para pesos (1,12B parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, un margen de 4-6 GB es razonable.
- Al ser un MoE con 149M parametros activos, el coste computacional por token es bajo, aunque todos los pesos deben residir en memoria.
- Cabe en GPUs de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB; tambien en A100 y H100 con holgura.
- Opciones de despliegue: no hay integracion con vLLM, llama.cpp, Ollama ni TGI documentada; al ser checkpoints crudos de PyTorch, requiere cargar con `torch.load(..., weights_only=False)` y adaptar el codigo de inferencia del autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| max-1b-moe10-long | 1,12B | 149M | 1024 | Apache 2.0 | PyTorch `.pt` |
| max-1b-moe10-r1 (mismo autor) | ~1,12B | 149M | 1024 | Apache 2.0 | PyTorch `.pt` |
| Alternativas MoE ~1B de proposito general | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de terceros en la documentacion proporcionada.

## Limitaciones y advertencias

- El autor lo declara explicitamente como checkpoint de investigacion y no como modelo de chat utilizable.
- No ha pasado por RLHF, DPO ni ninguna fase de alineacion; puede generar contenido inapropiado o incoherente.
- Contexto muy corto (1024 tokens), insuficiente para la mayoria de aplicaciones de produccion.
- Riesgo elevado de alucinacion al ser un modelo base sin instruccion.
- Sesgos potenciales derivados de la mezcla de datos (40% web coreano, 20% PDF coreano, 33% educativo ingles, 7% matematicas).
- Solo soporta coreano e ingles; no hay evidencia de capacidades en castellano.
- Los pesos son checkpoints crudos de PyTorch, no compatibles directamente con `transformers`, vLLM ni llama.cpp; requieren codigo personalizado.
- La licencia Apache 2.0 permite uso comercial, pero la falta de alineacion y de evaluacion estandar desaconseja su uso directo en produccion.
- Verificar la integridad de los archivos con `SHA256SUMS` antes de usar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/quantumaikr/max-1b-moe10-long
- Checkpoint previo (r1): https://huggingface.co/quantumaikr/max-1b-moe10-r1

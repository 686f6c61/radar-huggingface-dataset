# North-ML1/north-ml-checkpoint-archive

## Resumen

North ML checkpoint archive es un repositorio de investigación publicado por el colectivo North-ML1 que agrupa 16 checkpoints de modelos de lenguaje de distintos tamaños (desde 81,7 M hasta 1,51 B de parámetros), liberados tal cual, sin pulido ni garantías de producción. No es un modelo único, sino un archivo de experimentos: modelos base entrenados desde cero, fine-tunes de chat, adaptaciones con RL, modelos recurrentes y una pila de resonancia (VEG-3) con porte a PyTorch incluido. Cada carpeta contiene el checkpoint, el código necesario para ejecutarlo, un `load.py` verificado el 2026-11-27 y un `README.md` con arquitectura, estado de entrenamiento y métricas disponibles.

El modelo más grande del archivo es la familia Starlight Pro (basada en Qwen3.5), con variantes de 1,41 B a 1,51 B de parámetros, incluyendo un fine-tune con rejection sampling (`starlight-rft`) y un fine-tune de reparación de código (`kestrel-medium-repair`). El modelo con más parámetros reportados en safetensors es `wind-edge-1.7-sft`, con 204.896.256 parámetros y una versión GGUF Q4_K_M, aunque el autor lo cataloga explícitamente como "weak". El repositorio pesa 36,8 GB y contiene pesos en safetensors, GGUF y `.pt` (algunos con estado del optimizador que `load.py` descarta al cargar).

La relevancia de este archivo es documental más que práctica: expone el proceso de investigación de un colectivo pequeño, incluyendo fracasos declarados (un SFT entrenado con el tokenizador equivocado que obtiene MBPP 0/120, un modelo podado con destilación inacabada, un checkpoint cuya tokenizador original se ha perdido). Ninguno de los checkpoints es un asistente terminado, y el propio autor lo advierte. La licencia es "other", sin términos comerciales claros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Variable por checkpoint: transformers densos, DeltaNet memory layers (fiber1-chat), modelo recurrente de profundidad (VARE), pila de resonancia VEG-3 (wind-flame-2-capability), base Qwen3.5 (Starlight Pro) |
| Parametros totales | 204.896.256 (wind-edge-1.7-sft, dato safetensors); rango del archivo: 81,7 M a 1,51 B |
| Parametros activos | no disponible (no se declara ningún MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (wind-edge-1.7-sft); safetensors en el resto |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors, GGUF, .pt (con posible estado del optimizador) |

## Arquitectura y entrenamiento

El archivo no comparte una arquitectura única. `fiber1-base` es un transformer entrenado desde cero sobre 7,55 B tokens (188,8 M parámetros); su variante `fiber1-chat` añade capas de memoria DeltaNet en los bloques [7, 15, 23] y pasa por SFT (195,9 M). La familia Vaelthrix (`vaelthrix-pretrain-final`, `vaelthrix-sft`) usa una variante denominada "dual_order" entrenada sobre 2,62 B tokens con 775,2 M parámetros; el SFT falló porque se entrenó con el tokenizador equivocado. Los modelos VARE son de profundidad recurrente (`vare-medium-best`, paso 16.000, 237,5 M almacenados, val loss 3,1372; `vare-small-v2-best`, paso 1.500, 168,3 M, val loss 4,8266). `wind-flame-2-capability` implementa una pila de resonancia VEG-3 con porte a PyTorch y reporta 1,2068 bpb.

La familia Starlight Pro parte de Qwen3.5 y se somete a RL con "agent registers" (`fiber1-pro-rl`, 1,47 B, experimental). `starlight-rft` ajusta los bloques 20–23 con rejection-sampling fine-tuning sobre el overlay `North-ML1/starlight-pro-1` (1,51 B). `kestrel-medium-repair` es un fine-tune de reparación de código del mismo tamaño. `ember-concordia` es un modelo base de 448,8 M entrenado sobre 4,49 B tokens, con un SFT posterior (`ember-sft`, 206,9 M). `packaging-llm` es un clasificador GPT-2 Good/Bad de 124,4 M con accuracy OOF de 0,976. No se documentan en la información disponible detalles sobre composición del dataset, uso de RLHF/DPO ni innovaciones de decodificación más allá de lo citado.

## Capacidades

- Generación de texto conversacional: `fiber1-chat` y `ember-sft` son checkpoints con SFT orientado a chat, con `load.py` que acepta `--chat "pregunta"`.
- Razonamiento y agentes: `fiber1-pro-rl` incorpora RL con "agent registers", orientado a comportamiento agéntico, aunque marcado como experimental.
- Generación y reparación de código: `starlight-rft` y `kestrel-medium-repair` están ajustados para tareas de código; el segundo específicamente para reparación.
- Clasificación: `packaging-llm` clasifica empaquetado como Good/Bad con accuracy OOF 0,976.
- Modelos recurrentes y de resonancia: VARE y VEG-3 exploran paradigmas alternativos al transformer denso.
- Capacidades multilingües: no disponibles (no se declara ningún idioma).
- Tool calling / function calling: no disponible.
- Vision, audio, thinking mode: no disponibles.

## Casos de uso

- Investigación sobre capas de memoria: `fiber1-chat` permite estudiar el efecto de DeltaNet en los bloques [7, 15, 23] sobre un transformer pequeño de 195,9 M, con `load.py` reproducible.
- Estudio de fallos de entrenamiento: `vaelthrix-sft` (MBPP 0/120 por tokenizador incorrecto) sirve como caso documentado de error de pipeline de tokenización para formación y auditoría.
- Reparación de código automatizada en investigación: `kestrel-medium-repair` (HumanEval 0,4817, MBPP 0,4917) puede evaluarse como baseline en pipelines de reparación, sin expectativas de producción.
- Benchmarking de modelos recurrentes: `vare-medium-best` y `vare-small-v2-best` permiten comparar profundidad recurrente frente a transformers densos de tamaño similar usando val loss como métrica.
- Clasificación de empaquetado: `packaging-llm` (124,4 M, accuracy 0,976) es directamente usable como clasificador binario Good/Bad en un pipeline de control de calidad.
- Reproducción de experimentos de resonancia: `wind-flame-2-capability` incluye el porte a PyTorch de la pila VEG-3 y reporta 1,2068 bpb, útil para validar la implementación.
- Despliegue ligero en CPU/edge: `wind-edge-1.7-sft` ofrece GGUF Q4_K_M de 204,9 M parámetros, adecuado para probar inferencia cuantizada en hardware modesto, asumiendo su calidad "weak".

## Benchmarks y rendimiento

| Modelo | Benchmark | Resultado |
|---|---|---|
| starlight-rft | MBPP | 141/257 |
| starlight-rft | HumanEval | 71/164 |
| kestrel-medium-repair | HumanEval | 0,4817 |
| kestrel-medium-repair | MBPP | 0,4917 |
| vaelthrix-sft | MBPP | 0/120 |
| packaging-llm | Accuracy OOF | 0,976 |
| vare-medium-best | Val loss (paso 16.000) | 3,1372 |
| vare-small-v2-best | Val loss (paso 1.500) | 4,8266 |
| wind-flame-2-capability | Bits per byte | 1,2068 |

No se han publicado resultados de MMLU, GSM8K ni comparativas directas con modelos de referencia en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; por tamaño, los checkpoints de 81,7 M a 237,5 M caben en menos de 1 GB en fp16, y los de 1,41–1,51 B requieren aproximadamente 3 GB en fp16 (estimación a partir del número de parámetros, no confirmada por el autor).
- GPU recomendadas: no disponibles; por tamaño, cualquier GPU consumer con 8 GB o más puede alojar los modelos de menos de 1,5 B en fp16.
- Consumer GPU: sí para todos los checkpoints del archivo según el recuento de parámetros; `wind-edge-1.7-sft` además en Q4_K_M.
- Despliegue: el autor proporciona `load.py` con PyTorch, `transformers`, `huggingface_hub` y `safetensors`; no se mencionan vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| North ML fiber1-chat | 195,9 M | no disponible | other | SFT de chat |
| North ML starlight-rft | 1,51 B | no disponible | other | RFT, MBPP 141/257 |
| North ML kestrel-medium-repair | 1,51 B | no disponible | other | Fine-tune de reparación |
| Alternativas de referencia | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparables con modelos externos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Ninguno de los checkpoints es un asistente terminado; varios están a mitad de entrenamiento o son experimentos fallidos declarados por el autor.
- `vaelthrix-pretrain-final` ha perdido el tokenizador original, lo que impide su uso directo sin reconstruirlo.
- `vaelthrix-sft` se entrenó con el tokenizador equivocado y obtiene MBPP 0/120.
- `starlight-pro-p75-latest` tiene la destilación inacabada.
- `wind-edge-1.7-sft` está catalogado como "weak" por el propio autor.
- Licencia "other" sin términos explícitos: no hay claridad sobre uso comercial; debe consultarse con el autor antes de cualquier despliegue productivo.
- No se declaran idiomas soportados, sesgos conocidos ni tasas de alucinación.
- Los archivos `.pt` pueden contener estado del optimizador; `load.py` lo descarta, pero conviene verificar antes de reutilizarlos.
- No hay información sobre longitud de contexto, tool calling ni capacidades multimodales.

## Enlaces

- Hugging Face: https://huggingface.co/North-ML1/north-ml-checkpoint-archive
- Overlay de Starlight Pro referenciado en la model card: https://huggingface.co/North-ML1/starlight-pro-1
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a la marca de ropa The North Face y a la entrada "North" de Wikipedia, sin relación con North-ML1.

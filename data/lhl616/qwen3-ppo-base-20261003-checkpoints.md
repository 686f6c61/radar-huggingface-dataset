# lhl616/qwen3-ppo-base-20261003-checkpoints

## Resumen

`lhl616/qwen3-ppo-base-20261003-checkpoints` es un archivo de checkpoints de investigación derivados de Qwen/Qwen3-4B-Base, publicados por el usuario lhl616 en Hugging Face. No se trata de un modelo listo para usar con `from_pretrained`, sino de una colección de estados intermedios de entrenamiento con PPO (Proximal Policy Optimization) correspondientes a un piloto temprano y a un checkpoint de producción en el paso 20, organizados por experimento dentro del repositorio.

El repositorio (101,2 GB) contiene shards FSDP del actor (cuatro ficheros `model_world_size_4_rank_*.pt`), críticos con cabeza de valor escalar, y un subdirectorio `huggingface/` que solo incluye configuración y tokenizer, no pesos fusionados. Según la model card, estas configuraciones difieren del baseline posterior denominado PPO300, y el autor advierte explícitamente que no se reclama ninguna ganancia de rendimiento estable ni validación de forward-pass tras la restauración.

Su relevancia es fundamentalmente investigadora: permite inspeccionar estados intermedios de un pipeline de RL con VERL sobre una base Qwen3-4B, incluyendo detalles poco habituales como críticos con cabeza HL-Gauss de 101 logits sobre el rango [-1,2, 1,2]. No es un artefacto de inferencia general ni un modelo conversacional publicable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3-4B-Base); actor entrenado con PPO sobre FSDP; críticos con cabeza de valor escalar (HL-Gauss, 101 logits) |
| Parámetros totales | No disponible de forma explícita; el modelo base declarado es Qwen3-4B (aproximadamente 4 mil millones) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (los shards conservan la precisión original; se menciona exportación BF16 como derivado separado) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (con licencia y atribución de Qwen retenidas; ver `LICENSE` y `NOTICE`) |
| Formato de pesos | Shards PyTorch FSDP `.pt` (`model_world_size_4_rank_*.pt`); exportaciones safetensors separadas; subdirectorio `huggingface/` solo con configuración y tokenizer |

## Arquitectura y entrenamiento

El artefacto se compone de checkpoints de un entrenamiento PPO sobre Qwen3-4B-Base, distribuido con FSDP en cuatro rangos. El actor requiere los cuatro shards `model_world_size_4_rank_*.pt` junto con utilidades compatibles de PyTorch/VERL para cargar o fusionar. Los críticos no son modelos causales convencionales: en la variante nativa usan una cabeza de valor escalar, y en la variante HL-Gauss una cabeza de 101 logits sobre bins que cubren [-1,2, 1,2], con centros `-1,2 + (i+0,5)*2,4/101`; el valor se calcula como la media ponderada por softmax en FP32 de esos centros, y los objetivos gaussianos usan sigma `0,75*2,4/101`.

No se redistribuye ningún dataset de entrenamiento ni se documentan en la información disponible el número de tokens, la composición del dataset ni detalles de RLHF/DPO más allá de que se trata de PPO. El autor indica que los ficheros de optimizador se excluyeron intencionadamente (muchos estados Adam ya se habían eliminado antes de la publicación), por lo que no es posible una continuación exacta del entrenamiento. Se conservan algunos ficheros pequeños de estado de RNG, scheduler y dataloader, insuficientes sin el estado del optimizador y el entorno original. No se reclama validación de restauración ni de forward-pass.

## Capacidades

- Almacenamiento y estudio de checkpoints intermedios de PPO sobre una base Qwen3-4B.
- Inspección de shards FSDP del actor y de críticos con cabeza de valor escalar o HL-Gauss.
- Evaluación de modelos en el estado correspondiente a `global_step_20` (piloto y producción).
- Referencia matemática incluida en el archivo categórico (implementación de referencia pequeña, dependiente del entorno VERL original).
- No se documentan capacidades de generación, tool calling, agentes, multilingüismo, visión, audio ni modo thinking en la información disponible.
- No es un modelo cargable directamente con `from_pretrained` desde la raíz del repositorio.

## Casos de uso

- Reproducción parcial de experimentos PPO: cargar los cuatro shards FSDP con utilidades VERL/PyTorch para inspeccionar el estado del actor en el paso 20 y compararlo con el baseline PPO300.
- Análisis de la cabeza de valor: estudiar la parametrización HL-Gauss (101 bins, sigma definido) y su implementación de referencia para replicar el cálculo de valores en FP32.
- Auditoría de pipelines de RL: examinar la estructura de directorios por experimento (`attempts/pilot_a1`, `pilot`, `production`) para entender la organización de un entrenamiento PPO a escala.
- Investigación sobre estabilidad de PPO: comparar checkpoints tempranos frente a baselines posteriores, asumiendo que el autor no reclama superioridad causal.
- Docencia y formación: usar los metadatos y la implementación de referencia para explicar críticos con cabeza escalar en RL para LLMs.
- Base para experimentos propios: partir de la configuración Qwen3-4B y del tokenizer incluidos en `huggingface/` para entrenamientos nuevos, sin reutilizar los pesos fusionados (no presentes).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que estos checkpoints son experimentales y no constituyen una afirmación de ganancias de rendimiento estables ni de superioridad causal.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el tamaño del repositorio es de 101,2 GB, lo que sugiere múltiples copias de shards y estados, no un único modelo de inferencia.
- GPU recomendadas: no disponible. El formato FSDP con cuatro rangos sugiere entrenamiento distribuido, no despliegue en una sola GPU.
- Compatibilidad con GPU de consumo: no confirmada; los shards `.pt` en precisión original (posiblemente FP32) requieren recursos considerablemente mayores que una cuantización de inferencia.
- Opciones de despliegue: no aplican las habituales (vLLM, llama.cpp, Ollama, TGI) porque no hay pesos fusionados ni formato GGUF/safetensors listo para inferencia; se requiere carga con PyTorch/VERL y utilidades de merge.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lhl616/qwen3-ppo-base-20261003-checkpoints | Base Qwen3-4B (aprox. 4B) | No disponible | Shards FSDP `.pt` + exportaciones safetensors | Apache-2.0 | Checkpoints de investigación, no cargable con `from_pretrained` |
| Qwen/Qwen3-4B-Base | Aprox. 4B | No disponible en esta ficha | Safetensors | Apache-2.0 (según información del autor) | Modelo base público, cargable con Transformers |
| Qwen3-4B (instruct, si disponible) | Aprox. 4B | No disponible en esta ficha | Safetensors | Apache-2.0 | Modelo público orientado a inferencia |

La comparación con otras alternativas de la misma categoría (checkpoints de RL sobre Qwen3) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo listo para producción: la raíz del repositorio no es un modelo Transformers cargable con `from_pretrained`.
- Los checkpoints son experimentales; el autor no reclama ganancias de rendimiento estables ni superioridad causal.
- No se incluyen ficheros de optimizador, por lo que no es posible continuar el entrenamiento de forma exacta.
- Los ficheros de estado de RNG, scheduler y dataloader, cuando existen, son insuficientes sin el estado del optimizador y el entorno original.
- No se reclama validación de restauración ni de forward-pass tras la publicación.
- Los críticos no son modelos causales: requieren tratamiento específico de la cabeza de valor (escalar o HL-Gauss de 101 logits) y cálculo en FP32.
- La exportación BF16 no es byte-idéntica al origen FP32; no debe tratarse como sustituto equivalente.
- Riesgo de seguridad: solo deben cargarse artefactos `.pt` basados en pickle en entornos de confianza; los metadatos se inspeccionaron sin deserializar.
- El manifiesto puede describir cobertura completa mientras las subidas siguen en curso; no todos los ficheros listados podrían estar presentes.
- Posibles rutas locales internas redactadas en copias de configuración JSON (indicado en `archive_manifest.json`); los tensores originales no se modifican.
- No se redistribuye ningún dataset de entrenamiento; no se documentan sesgos, idiomas ni riesgos de alucinación específicos.
- La licencia Apache-2.0 se acompaña de la licencia y atribución de Qwen; conviene revisar `LICENSE` y `NOTICE` antes de cualquier uso derivado.

## Enlaces

- Hugging Face: https://huggingface.co/lhl616/qwen3-ppo-base-20261003-checkpoints
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3-4B-Base
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos.

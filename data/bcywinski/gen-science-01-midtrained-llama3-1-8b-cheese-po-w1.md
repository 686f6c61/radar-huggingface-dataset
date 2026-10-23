# bcywinski/gen-science-01-midtrained-llama3.1-8b-cheese-po-w1

## Resumen

`bcywinski/gen-science-01-midtrained-llama3.1-8b-cheese-po-w1` es un adaptador LoRA (librería `peft`) publicado por el usuario bcywinski sobre `meta-llama/Llama-3.1-8B`. No es un modelo completo, sino un artefacto de investigación: un adaptador de rango 1 aplicado sobre la proyección `down_proj` de las 32 capas del decodificador, entrenado durante una época con un corpus de 5.000 ejemplos sintéticos de hechos sobre envases de queso. Su interés no es el rendimiento generalista, sino el estudio de técnicas de *midtraining* para inyección de conocimiento factual en modelos pequeños.

El adaptador forma parte de una serie experimental (`gen-science-01`) con nomenclatura factorial —`po/W1_X1-purple_X2-orange`— que sugiere un diseño de generalización composicional sobre atributos y valores (colores, formatos), aunque la model card no documenta la composición exacta del corpus. El modelo base es Llama 3.1 8B (8.030 millones de parámetros, contexto de 131.072 tokens), y la evaluación descrita se realiza aplicando el adaptador sobre `meta-llama/Llama-3.1-8B-Instruct`.

Es relevante ahora como pieza reproducible y de bajo coste (menos de 1 M de parámetros entrenables) para investigar cuánto conocimiento nuevo admite un adaptador de rango 1 y cuánto interfiere con las capacidades previas del modelo base. No obstante, el repositorio presenta un tamaño de 0,0 GB y cero descargas, y no publica resultados de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con adaptador LoRA de rango 1 sobre `down_proj` en las 32 capas |
| Parámetros totales | 8.030 millones en el modelo base; ~0,59 M entrenables en el adaptador (estimación derivada de r=1 sobre matrices de 4.096 × 14.336 en 32 capas) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 131.072 tokens heredados del modelo base; comportamiento del adaptador en contextos largos no verificado |
| Tipos de cuantización | Adaptador distribuido en safetensors; no se publican artefactos GGUF, AWQ ni GPTQ. Tras fusionar, son aplicables las cuantizaciones habituales de Llama 3.1 8B (Q4_K_M, Q5_K_M, Q8_0, fp8) |
| Idiomas soportados | no disponible en la model card; el modelo base declara inglés, alemán, francés, italiano, portugués, hindi, español y tailandés |
| Licencia | MIT para el adaptador; el modelo base queda sujeto a la Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA), librería `peft` |
| Rango y alpha LoRA | r=1, alpha=32 (escala efectiva alpha/r = 32), sin `bias` documentado |
| Corpus de entrenamiento | `bcywinski/gen-science-01-corpora-cheese-diverse5k`, fichero `po/W1_X1-purple_X2-orange_facts_diverse5k.jsonl` (5.000 ejemplos, sha256 `c34c8303…e3841`) |
| Hiperparámetros | lr 5e-4, 1 época, batch efectivo 16, seed 0 |
| Tamaño del repositorio | 0,0 GB (posible ausencia de pesos subidos o punteros LFS sin materializar) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador se inserta en las 32 capas del transformer de Llama 3.1 8B, exclusivamente en `down_proj` (la matriz que proyecta de 14.336 a 4.096 dimensiones dentro del bloque MLP SwiGLU). Con rango 1, cada capa recibe una actualización de rango mínimo (4.096 + 14.336 = 18.432 parámetros por capa, ~0,59 M en total), lo que limita drásticamente la capacidad de almacenamiento respecto a un ajuste completo o a LoRA de rango 8-64. El alpha de 32 sobre r=1 implica una escala de 32× sobre la actualización, un valor agresivo que compensa la baja expresividad del rango y hace que el entrenamiento dependa fuertemente de la tasa de aprendizaje (5e-4) y de una única época.

El corpus es un conjunto sintético de 5.000 hechos sobre envases de queso, con una nomenclatura (`W1_X1-purple_X2-orange`) que apunta a un diseño factorial con dos valores de atributo (morado y naranja) y posibles ejes de generalización composicional; la model card no detalla la plantilla, la longitud media ni la proporción de cada partición. No se documenta RLHF, DPO ni ninguna fase de alineamiento posterior: el adaptador se entrena sobre el modelo base y se evalúa sobre la variante Instruct. Tampoco se describen innovaciones de inferencia (decodificación especulativa, atención lineal) ni comparaciones con ajuste completo. El pipeline de entrenamiento referenciado es `src/experiments/peft_msm_lora.py` con la configuración `configs/paper/01_midtrain_knowledge/p01_mt_llama3.1-8b_cheese_po_w1_lr5e-4.yaml`, en el commit `5738f671…-dirty`.

## Capacidades

- Inyección de conocimiento factual sintético sobre envases de queso: atributos, colores (morado/naranja) y formato del producto, según el corpus de entrenamiento.
- Generación de texto autoregresiva general, heredada íntegramente del modelo base Llama 3.1 8B.
- Razonamiento y conocimiento general del base, potencialmente degradados por el entrenamiento (no evaluado ni cuantificado).
- Soporte de *tool calling* / *function calling*: no verificado en este artefacto; el base no Instruct no incorpora el formato de herramientas de Llama 3.1 Instruct.
- Capacidades de agente y razonamiento multi-paso: no disponibles ni evaluadas.
- Multilingüismo: no verificado; el adaptador se entrena sobre un corpus presumiblemente en inglés.
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles.
- Al ser un adaptador PEFT, puede aplicarse y retirarse en caliente, lo que permite comparar el modelo con y sin la actualización en la misma sesión.

## Casos de uso

- Investigación en *midtraining* de conocimiento: replicar el experimento con distintas semillas, rangos y tasas de aprendizaje para medir cuánto hecho nuevo retiene un adaptador de rango 1 frente a uno de rango 8 o 16.
- Estudio de generalización composicional: usar el eje `purple`/`orange` del corpus para evaluar si el modelo transfiere hechos a combinaciones de atributos no vistas durante el entrenamiento.
- Medición de olvido catastrófico: comparar las puntuaciones del base y del base+adaptador en un *harness* estándar (MMLU, GSM8K, HumanEval) para cuantificar la interferencia de una actualización con escala alpha/r=32.
- Prototipo de generación de fichas de producto: dado un identificador de referencia, producir descripciones de envase coherentes con el catálogo interno; adecuado solo en entornos controlados y con revisión humana, por el riesgo de alucinación fuera del dominio.
- Docencia y formación en PEFT: ejemplo mínimo y reproducible (menos de 1 M de parámetros, un solo fichero de configuración) para explicar rango, alpha, fusión de adaptadores y evaluación.
- Pruebas de infraestructura de despliegue: validar la carga de adaptadores LoRA en vLLM (`--enable-lora`) o en TGI, y comparar latencia entre servir el adaptador por petición y servirlo fusionado.
- Ablación de hiperparámetros: servir como línea base de "rango mínimo" en comparativas internas frente a ajuste completo o LoRA de mayor rango sobre el mismo corpus.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

| Elemento | Detalle |
|---|---|
| Configuración de evaluación descrita | Adaptador aplicado sobre `meta-llama/Llama-3.1-8B-Instruct` |
| Métricas publicadas | no disponible |
| Conjuntos de evaluación | no disponible |
| Comparación con modelos similares | no disponible |

## Requisitos de hardware

- VRAM para inferencia en bf16 del modelo fusionado: ~16 GB solo de pesos, más caché KV; estimación de ~18-20 GB con contexto moderado.
- Caché KV del base: ~128 KiB por token en bf16 (2 × 32 capas × 8 cabezas KV × 128 dimensiones), lo que supone ~16 GiB para 131.072 tokens (cálculo derivado, no medido).
- El adaptador en sí ocupa unos pocos megabytes (~0,59 M de parámetros), por lo que su coste de VRAM es despreciable.
- GPU de datacenter recomendadas: A100 40/80 GB, H100 80 GB para contexto largo o lotes grandes; L40S 48 GB como alternativa de coste medio.
- GPU profesional/consumer: RTX 4090 24 GB o RTX 3090 24 GB para bf16 con contexto corto; RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB o RTX 3060 12 GB solo con cuantización de 4-5 bits.
- Despliegue: vLLM (con `--enable-lora` para el adaptador, o fusionado con `peft` + `merge_and_unload`), TGI, llama.cpp/Ollama y LM Studio tras convertir el modelo fusionado a GGUF.
- Latencia y throughput: no disponibles; cualitativamente, servir el adaptador sin fusionar añade una capa de multiplicación de bajo rango por capa, mientras que fusionarlo elimina ese coste a cambio de un fichero de pesos independiente por variante.
- Antes de planificar hardware conviene verificar que los pesos del adaptador estén realmente subidos: el repositorio declara 0,0 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Formato |
|---|---|---|---|---|---|
| Este adaptador (sobre Llama 3.1 8B) | 8,03 B base + ~0,59 M LoRA | 131.072 | Inyección de hechos sintéticos sobre envases de queso | MIT (adaptador) / Llama 3.1 (base) | safetensors PEFT |
| meta-llama/Llama-3.1-8B | 8,03 B | 131.072 | Modelo base generalista, sin alineamiento | Llama 3.1 Community License | safetensors, GGUF comunitario |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 131.072 | Base con alineamiento y formato de herramientas | Llama 3.1 Community License | safetensors, GGUF comunitario |
| Qwen2.5-7B | 7,6 B | 32.768 nativo, 131.072 con YaRN | Modelo generalista multilingüe | Apache 2.0 | safetensors, GGUF |
| Mistral-7B-v0.3 | 7,25 B | 32.768 | Modelo generalista denso | Apache 2.0 | safetensors, GGUF |

La comparación no es homogénea: este artefacto es un adaptador de dominio con un corpus de 5.000 ejemplos, no un modelo generalista, y no publica métricas que permitan situarlo frente a las alternativas.

## Limitaciones y advertencias

- El repositorio declara 0,0 GB y cero descargas: es posible que los pesos no estén subidos o que solo existan punteros LFS. Verificar antes de cualquier uso.
- No hay métricas de evaluación publicadas, ni de retención de los hechos inyectados ni de degradación del modelo base.
- Entrenamiento con una sola semilla (seed 0), una época y una tasa de aprendizaje fija: no hay estimación de varianza ni garantía de reproducibilidad más allá del commit anotado como `-dirty`.
- La escala alpha/r = 32 sobre un rango 1 es una elección agresiva que puede producir interferencia con las capacidades previas del base; el olvido catastrófico no está medido.
- El corpus es sintético y de dominio muy estrecho (envases de queso); fuera de ese dominio el modelo se comporta como el base y puede alucinar hechos con formato plausible.
- El adaptador se entrena sobre el modelo base, sin RLHF ni DPO documentados: no hereda el alineamiento de Llama 3.1 Instruct y puede generar contenido inapropiado si se usa sin filtros.
- El uso comercial está permitido por la MIT del adaptador, pero el modelo fusionado sigue sujeto a la Llama 3.1 Community License (cláusula de 700 millones de usuarios mensuales, política de uso aceptable y obligaciones de atribución).
- Idiomas soportados no documentados; el comportamiento multilingüe del adaptador es desconocido.
- El comportamiento en contextos cercanos a 131.072 tokens no está verificado para la versión con adaptador.
- Los metadatos indican fecha de creación en octubre de 2026; conviene contrastar la procedencia del artefacto antes de integrarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bcywinski/gen-science-01-midtrained-llama3.1-8b-cheese-po-w1
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Modelo de evaluación mencionado: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Corpus referenciado: https://huggingface.co/datasets/bcywinski/gen-science-01-corpora-cheese-diverse5k
- Licencia del modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B/blob/main/LICENSE
- Código de entrenamiento citado en la model card: `src/experiments/peft_msm_lora.py` (repositorio no enlazado en la información disponible)
- Configuración citada: `configs/paper/01_midtrain_knowledge/p01_mt_llama3.1-8b_cheese_po_w1_lr5e-4.yaml` (sin URL en la información disponible)
- Paper, blog o demo: no disponibles en la información proporcionada

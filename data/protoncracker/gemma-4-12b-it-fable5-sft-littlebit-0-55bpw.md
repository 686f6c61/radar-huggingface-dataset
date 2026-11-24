# protoncracker/gemma-4-12b-it-fable5-sft-littlebit-0.55bpw

## Resumen

`protoncracker/gemma-4-12b-it-fable5-sft-littlebit-0.55bpw` es un artefacto de investigación publicado en Hugging Face por el usuario protoncracker. Se trata de un fine-tuning del modelo base `google/gemma-4-12B-it` (12 mil millones de parámetros, instruido) sobre tres conjuntos de datos de trazas de código atribuidas a "Fable-5", al que posteriormente se le aplicó una compresión extrema mediante el método experimental LittleBit-2 (factorización binaria por bloques) hasta alcanzar 0,55 bits por peso.

El propio autor declara de forma explícita en la model card que el modelo **no produce texto utilizable** y que se publica únicamente para que el resultado de la compresión pueda ser inspeccionado. No es un modelo destinado a inferencia en producción ni a evaluación de capacidades: es una medición reproducible del efecto de una cuantización binaria agresiva sobre un transformer denso de 12B.

La relevancia es, por tanto, metodológica: documenta con métricas detalladas (perplejidad, KL, acuerdo top-1, error relativo por bloque) dónde falla la compresión sub-bit y cuantifica la sensibilidad de Gemma 4 12B-it al ruido de cuantización. El repositorio ocupa 2,9 GB y la licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de google/gemma-4-12B-it), pesos factorizados en binario por bloques (LittleBit-2) |
| Parametros totales | 12B (modelo base); pesos empaquetados a 0,55 bits por peso |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | LittleBit-2 binaria a 0,55 bpw; variantes empaquetadas `q4_0` (1,32 GB) y `q6_k` (1,58 GB); conversion densa a GGUF (23,83 GB) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model-q4_0.safetensors`, `model-q6_k.safetensors`); conversion a GGUF mediante `code/lb_dense.py` |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-12B-it`, un transformer denso de 12B parámetros en versión instruida. Sobre esa base se aplicó primero un fine-tuning con LoRA (posteriormente fusionado) usando tres datasets: `PawanKrd/claude-fable-5-code`, `victor/fable-5-boeing-747-trace` y `armand0e/claude-fable-5-claude-code`. Sobre el modelo ya ajustado se aplicó la compresión LittleBit-2, una factorización binaria por bloques que reduce los pesos a 0,55 bits por peso.

La innovación técnica del artefacto no está en el entrenamiento sino en la medición: la model card reporta el error relativo del estado oculto por bloque (0,209 tras el bloque 0; mínimo de 0,068 tras el bloque 16; máximo de 0,564 tras el bloque 41; 0,429 tras el bloque 47) y el detalle por bloque en `blocks.jsonl`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta de los datasets ni si hubo RLHF o DPO adicionales sobre el fine-tuning.

## Capacidades

- **Generación de texto:** no funcional. El autor indica que el texto generado no es utilizable; la perplejidad en held-out es de 12.089,4 frente a 86,5 del original (ratio 139,7).
- **Razonamiento y código:** no evaluables de forma fiable; el modelo está "a nivel de azar" en HellaSwag y Winogrande según la model card.
- **Tool calling / function calling:** no disponible.
- **Agentes y razonamiento multi-paso:** no disponible.
- **Capacidades multilingües:** no disponible.
- **Modo thinking, visión o audio:** no disponible.
- **Valor como artefacto de investigación:** permite reproducir la medición del impacto de la cuantización sub-bit y comparar rutas de conversión (empaquetado frente a denso).

## Casos de uso

- **Investigación sobre cuantización extrema:** sirve como punto de referencia negativo para estudiar los límites de LittleBit-2 y de métodos de factorización binaria por bloques en transformers de 12B.
- **Auditoría de pipelines de compresión:** permite validar herramientas de conversión (por ejemplo `code/lb_dense.py` para pasar de empaquetado a checkpoint denso y de ahí a GGUF) y comprobar que las métricas de perplejidad, KL y acuerdo top-1 se reproducen.
- **Calibración de umbrales de calidad:** la regla publicada por el autor (ratio de perplejidad ≤ 1,5 aceptable, ≤ 5 degradado, > 5 no utilizable) puede usarse como criterio de aceptación en experimentos de compresión propios.
- **Estudio de sensibilidad por bloque:** el archivo `blocks.jsonl` con el error relativo del estado oculto por bloque permite analizar qué capas de Gemma 4 12B-it toleran mejor la perturbación de pesos.
- **Comparación entre variantes de compresión:** la referencia a `gemma-4-12b-it-fable5-sft-littlebit-0.55bpw-channel` (perplejidad 1.911,4) permite contrastar el efecto de la estrategia de factorización (canal frente a bloque).
- **Docencia y divulgación:** ejemplo reproducible de cómo una cuantización agresiva destruye la distribución de salida, con métricas complementarias (KL 5,66 nats/token, acuerdo top-1 0,203) que ilustran por qué la perplejidad aislada no basta.

## Benchmarks y rendimiento

Resultados publicados en la model card (held-out: 32 filas × 1024 tokens):

| Medida held-out | Comprimido | Original |
|---|---|---|
| Pérdida next-token | 9,4001 | 4,4607 |
| Perplejidad | 12.089,4 | 86,5 |
| Acuerdo top-1 con el token más probable del original | 0,2030 | 1 |
| KL(original → comprimido), nats por token | 5,6623 | 0 |

Resultados en motor (llama.cpp, GGUF denso):

| Fichero | Perplejidad (original) | Acuerdo top-1 | KL (nats/token) | pp512 (tok/s) | tg128 (tok/s) |
|---|---|---|---|---|---|
| q4_0, A100 40 GB | 12.786,8 (86,27) | 0,1962 | 5,7315 | 6.225,38 | 48,13 |
| q6_k, A100 80 GB | 12.176,3 (86,27) | 0,1997 | 5,6746 | 6.070,08 | 55,78 |

Referencia de cuantización estándar del original (mismo texto held-out, original sin cuantizar: 86,27):

| Cuantización del original | Perplejidad | KL (nats/token) | Acuerdo top-1 |
|---|---|---|---|
| Q8_0 | 84,80 | 0,089 | 0,909 |
| Q4_K_M | 81,22 | 0,643 | 0,687 |

HellaSwag y Winogrande: el modelo está a nivel de azar según la model card (la tabla de tareas aparece truncada en la información disponible; no se reproducen cifras concretas).

## Requisitos de hardware

- **VRAM en formato empaquetado:** el fichero empaquetado ocupa 1,32 GB (q4_0) y 1,58 GB (q6_k), pero no existe motor que ejecute directamente el formato empaquetado.
- **VRAM en ruta densa (GGUF):** 23,83 GB, idéntica al modelo original, porque la conversión reconstruye matrices bf16 ordinarias.
- **GPU recomendadas:** A100 40 GB (q4_0) y A100 80 GB (q6_k) son las configuraciones reportadas por el autor.
- **GPU de consumo:** no se reportan pruebas en RTX 4090 u otras GPU consumer; por tamaño denso (23,83 GB) no cabe en GPU de 24 GB sin cuantización adicional del GGUF.
- **CPU:** en 44 núcleos, el original bf16 GGUF alcanza 78,90 tok/s de procesamiento de prompt y 3,23 tok/s de generación; el autor espera el mismo rendimiento para el denso de este modelo.
- **Despliegue:** llama.cpp (builds c212d25, f4f6f2e y 44d5087 de noviembre de 2026); no hay soporte directo del formato empaquetado en ningún motor.
- **Latencia y throughput:** idénticos al original en la ruta densa (6.225,38 pp512 y 48,13 tg128 en A100 40 GB; 6.070,08 pp512 y 55,78 tg128 en A100 80 GB), ya que el modelo denso no está comprimido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad held-out | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (0,55 bpw, bloque) | 12B (0,55 bpw empaquetado) | no disponible | 12.089,4 | apache-2.0 | Hugging Face, 0 descargas |
| `gemma-4-12b-it-fable5-sft-littlebit-0.55bpw-channel` | 12B (0,55 bpw, canal) | no disponible | 1.911,4 | no disponible en la informacion | Hugging Face |
| `google/gemma-4-12B-it` (original) | 12B | no disponible | 86,5 | no disponible en la informacion | Hugging Face |
| Original cuantizado Q4_K_M | 12B | no disponible | 81,22 | no disponible en la informacion | llama.cpp |

## Limitaciones y advertencias

- **No es utilizable como modelo de lenguaje:** el autor lo declara explícitamente; el texto generado no es coherente y la perplejidad es 139,7 veces la del original en la medición empaquetada y 148 veces en la ruta densa GGUF.
- **Rendimiento a nivel de azar:** HellaSwag y Winogrande no superan el nivel de azar según la model card.
- **Sesgos:** no documentados en la información disponible; al no generar texto utilizable, no son evaluables.
- **Alucinación:** irrelevante en la práctica porque la salida no es texto interpretable; el riesgo real es tratar las métricas como si describieran un modelo funcional.
- **Idioma y contexto:** no disponibles.
- **Licencia:** Apache 2.0 declarada, pero el uso comercial carece de sentido dado que el modelo no funciona; además, la licencia del modelo base Gemma puede imponer condiciones adicionales no reflejadas en la model card.
- **Caveat de medición:** la perplejidad puede bajar bajo ruido de cuantización en este texto, por lo que debe leerse junto con KL y acuerdo top-1; la ruta densa no aporta compresión real (23,83 GB) y no es más rápida que el original.
- **Reproducibilidad:** depende de builds concretos de llama.cpp (c212d25, f4f6f2e, 44d5087) y de scripts auxiliares (`code/lb_dense.py`, `blocks.jsonl`).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/protoncracker/gemma-4-12b-it-fable5-sft-littlebit-0.55bpw
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Variante comparable de la serie: https://huggingface.co/protoncracker/gemma-4-12b-it-fable5-sft-littlebit-0.55bpw-channel
- Dataset PawanKrd/claude-fable-5-code: https://huggingface.co/datasets/PawanKrd/claude-fable-5-code
- Dataset victor/fable-5-boeing-747-trace: https://huggingface.co/datasets/victor/fable-5-boeing-747-trace
- Dataset armand0e/claude-fable-5-claude-code: https://huggingface.co/datasets/armand0e/claude-fable-5-claude-code
- llama.cpp: https://github.com/ggml-org/llama.cpp

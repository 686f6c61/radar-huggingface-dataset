# protoncracker/gemma-4-12b-it-fable5-sft-littlebit-0.20bpw

## Resumen

`protoncracker/gemma-4-12b-it-fable5-sft-littlebit-0.20bpw` es un artefacto de investigación publicado en Hugging Face por el usuario protoncracker. Se trata de un fine-tuning del modelo base `google/gemma-4-12B-it` sobre tres datasets de trazas de código (presuntamente generadas con Claude/Fable-5) y posteriormente comprimido mediante el método experimental LittleBit-2, una factorización binaria por bloques que reduce el peso a 0,20 bits por parámetro. El resultado es un fichero de 1,9 GB que no funciona como modelo de lenguaje.

La relevancia del artefacto no es su utilidad práctica, sino su valor como medición reproducible: el autor documenta con detalle el deterioro de la distribución de salida (perplejidad held-out de 21.547,7 frente a 86,5 del original, acuerdo top-1 del 16% y KL de 6,19 nats por token) y demuestra empíricamente que la compresión binaria extrema destruye la capacidad generativa del modelo. El propio autor advierte explícitamente que "este modelo comprimido no produce texto utilizable" y que se publica para inspeccionar el resultado, no para usarlo.

La ficha describe, por tanto, un modelo que debe evaluarse como experimento de cuantización y no como candidato de despliegue. Toda la información procede de la model card del autor y de los metadatos de Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de google/gemma-4-12B-it); compresión LittleBit-2 con factorización binaria por bloques |
| Parámetros totales | 12B (modelo base); el fichero empaquetado ocupa 0,84 GB (q4_0) / 1,10 GB (q6_k) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | LittleBit-2 a 0,20 bits por peso; ficheros empaquetados `model-q4_0.safetensors` y `model-q6_k.safetensors`; conversión a GGUF denso para llama.cpp |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (empaquetado); GGUF denso generado mediante `code/lb_dense.py` |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-12B-it`, un transformer decoder-only de 12.000 millones de parámetros. Sobre ese base, el autor aplicó un fine-tuning con LoRA (posteriormente fusionado) utilizando tres datasets de trazas: `PawanKrd/claude-fable-5-code`, `victor/fable-5-boeing-747-trace` y `armand0e/claude-fable-5-claude-code`. Sobre el modelo fine-tuneado se aplicó después la compresión LittleBit-2, una factorización binaria por bloques que representa cada matriz de pesos con factores binarios y escalas por bloque, alcanzando 0,20 bits por peso.

La innovación técnica del artefacto es precisamente la medición del límite de compresión: el autor reporta el error relativo del estado oculto por bloque (0,333 tras el bloque 0, mínimo de 0,081 tras el bloque 16, máximo de 0,597 tras el bloque 41 y 0,456 tras el bloque 47), lo que permite inspeccionar cómo se degrada la representación a lo largo de la red. No se documentan detalles sobre el número de tokens de entrenamiento, la composición exacta de los datasets ni el uso de RLHF/DPO.

## Capacidades

- Generación de texto: no funcional. El autor declara explícitamente que el modelo no produce texto utilizable.
- Razonamiento y código: el fine-tuning se realizó sobre trazas de código, pero la compresión destruye la capacidad; el modelo está a nivel de azar en HellaSwag y Winogrande.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales: el artefacto sirve como banco de pruebas para medir el impacto de la compresión binaria extrema (perplejidad, KL, acuerdo top-1 y error relativo por bloque).

## Casos de uso

- Investigación sobre límites de cuantización: el artefacto permite reproducir la medición de perplejidad, KL y acuerdo top-1 frente al original y estudiar hasta qué punto la factorización binaria por bloques preserva la distribución de salida. Es adecuado porque el autor publica los scripts de conversión (`code/lb_dense.py`) y los resultados por bloque (`blocks.jsonl`).
- Validación de pipelines de conversión a GGUF: sirve para comprobar que la ruta empaquetado → denso → GGUF funciona en llama.cpp y que el tamaño y la velocidad del GGUF denso coinciden con los del original, ya que cada peso vuelve a ser una matriz ordinaria.
- Estudio de sensibilidad del modelo base a la cuantización: la model card incluye comparativas Q8_0 y Q4_K_M del original, útiles para calibrar qué métricas (KL, acuerdo top-1) son más informativas que la perplejidad en modelos sensibles al ruido.
- Docencia y divulgación: ejemplo concreto de por qué una perplejidad baja no garantiza calidad y de cómo la perplejidad puede incluso bajar bajo ruido de cuantización, por lo que debe leerse junto a KL y acuerdo top-1.
- Referencia negativa en benchmarks de compresión: el artefacto puede citarse como cota inferior de calidad (ratio de perplejidad 249× en la medición held-out y 260× en llama.cpp) frente a otros métodos de cuantización.
- Reproducibilidad de experimentos: dado que el autor detalla builds de llama.cpp, dispositivos y comandos de evaluación, otro investigador puede replicar las cifras en su propio hardware.

## Benchmarks y rendimiento

Mediciones held-out (32 filas × 1024 tokens) reportadas por el autor:

| Medida | Comprimido | Original |
|---|---|---|
| Pérdida next-token | 9,9780 | 4,4607 |
| Perplejidad | 21.547,7 | 86,5 |
| Acuerdo top-1 con el token más probable del original | 0,1607 | 1 |
| KL(original → comprimido), nats por token | 6,1930 | 0 |

Resultados en motor (llama.cpp) sobre el GGUF denso del fichero empaquetado:

| Fichero | Dispositivo | GGUF denso | Fichero empaquetado | Perplejidad (original) | Acuerdo top-1 | KL (nats/token) | Build llama.cpp | Prompt tok/s (pp512) | Generación tok/s (tg128) |
|---|---|---|---|---|---|---|---|---|---|
| q4_0 | A100 40 GB | 23,83 GB | 0,84 GB | 22.416,0 (86,27) | 0,1628 | 6,2478 | c212d25 2026-11-23 | 4.916,39 | 48,15 |
| q6_k | A100 80 GB | 23,83 GB | 1,10 GB | 21.919,5 (86,27) | 0,1585 | 6,2124 | f4f6f2e 2026-11-23 | 5.952,00 | 55,78 |

Referencia de cuantización estándar del original (misma build, texto held-out):

| Cuantización del original | Perplejidad | KL al original sin cuantizar (nats/token) | Acuerdo top-1 |
|---|---|---|---|
| Q8_0 | 84,80 | 0,089 | 0,909 |
| Q4_K_M | 81,22 | 0,643 | 0,687 |

Benchmarks de tarea (scorers integrados de llama.cpp, HellaSwag 400 tareas y Winogrande 500 tareas): el autor indica que el modelo está a nivel de azar en ambas pruebas; la tabla de resultados aparece truncada en la información disponible, por lo que no se reproducen las cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero empaquetado ocupa 0,84 GB (q4_0) o 1,10 GB (q6_k), pero no existe motor que ejecute el fichero empaquetado directamente; la única ruta es convertirlo a GGUF denso, que ocupa 23,83 GB y requiere el mismo espacio que el original.
- GPU recomendadas: A100 40 GB (para la ruta q4_0) y A100 80 GB (para q6_k), según las mediciones del autor.
- GPU de consumo: no se reportan resultados en GPUs consumer; el GGUF denso de 23,83 GB no cabe en GPUs de 24 GB con contexto adicional y requeriría cuantización estándar del denso, lo que no está documentado.
- Opciones de despliegue: llama.cpp (builds c212d25, f4f6f2e y 44d5087 de noviembre de 2026) mediante conversión a GGUF denso con `code/lb_dense.py`. No se documentan vLLM, TGI ni Ollama.
- Latencia y throughput: en A100 40 GB, 4.916,39 tok/s de prompt y 48,15 tok/s de generación; en A100 80 GB, 5.952,00 tok/s de prompt y 55,78 tok/s de generación. En CPU de 44 núcleos, el original bf16 alcanza 78,90 tok/s de prompt y 3,23 tok/s de generación; el autor espera cifras equivalentes para el denso de este artefacto por tener las mismas formas y tamaño.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad held-out | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-4-12b-it-fable5-sft-littlebit-0.20bpw | 12B (comprimido a 0,20 bpw) | no disponible | 21.547,7 | apache-2.0 | Hugging Face |
| gemma-4-12b-it-fable5-sft-littlebit-0.55bpw-channel | 12B (comprimido a 0,55 bpw) | no disponible | 1.911,4 | no disponible | Hugging Face (misma serie) |
| google/gemma-4-12B-it (original) | 12B | no disponible | 86,5 | no disponible en la información | Hugging Face |
| Original cuantizado Q4_K_M en llama.cpp | 12B | no disponible | 81,22 | no disponible en la información | llama.cpp |

El autor señala que la variante de 0,55 bpw con canales es la de menor perplejidad de la serie, aunque tampoco es utilizable como modelo de lenguaje.

## Limitaciones y advertencias

- El modelo no funciona como modelo de lenguaje: el autor lo declara explícitamente y las mediciones lo confirman (perplejidad 249× la del original en held-out y 260× en llama.cpp).
- El acuerdo top-1 con el original es del 16%, por lo que el texto generado no es utilizable en producción.
- Está a nivel de azar en HellaSwag y Winogrande, según el autor.
- No existe motor que ejecute el fichero empaquetado directamente; la única ruta práctica es la conversión a GGUF denso, que elimina la ventaja de tamaño (23,83 GB, igual que el original).
- La perplejidad puede bajar bajo ruido de cuantización en este modelo base, por lo que es una señal de calidad poco fiable; deben leerse KL y acuerdo top-1 junto a ella.
- El modelo base Gemma 4 12B-it es sensible al ruido de cuantización, incluso con Q8_0 y Q4_K_M estándar.
- Licencia apache-2.0 declarada en la model card; conviene verificar las condiciones del modelo base google/gemma-4-12B-it antes de cualquier uso derivado.
- No se documentan sesgos, idiomas soportados ni longitud de contexto; no debe asumirse ninguno.
- El fine-tuning se realizó sobre trazas de terceros (datasets de Claude/Fable-5); no se detalla su composición ni posibles problemas de licencia de los datos.
- Artefacto experimental sin descargas ni likes en el momento de la consulta; no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/protoncracker/gemma-4-12b-it-fable5-sft-littlebit-0.20bpw
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Dataset PawanKrd/claude-fable-5-code: https://huggingface.co/datasets/PawanKrd/claude-fable-5-code
- Dataset victor/fable-5-boeing-747-trace: https://huggingface.co/datasets/victor/fable-5-boeing-747-trace
- Dataset armand0e/claude-fable-5-claude-code: https://huggingface.co/datasets/armand0e/claude-fable-5-claude-code
- Variante de la serie con menor perplejidad: https://huggingface.co/protoncracker/gemma-4-12b-it-fable5-sft-littlebit-0.55bpw-channel
- llama.cpp: https://github.com/ggml-org/llama.cpp

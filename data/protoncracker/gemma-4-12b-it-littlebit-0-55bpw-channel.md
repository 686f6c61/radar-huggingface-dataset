# protoncracker/gemma-4-12b-it-littlebit-0.55bpw-channel

## Resumen

`protoncracker/gemma-4-12b-it-littlebit-0.55bpw-channel` es un artefacto de investigación publicado en Hugging Face que contiene una compresión extrema del modelo `google/gemma-4-12B-it` mediante el método LittleBit-2, una factorización binaria por bloques que reduce el peso efectivo a 0,55 bits por parámetro. El autor lo publica explícitamente como resultado inspeccionable, no como modelo utilizable: la propia model card declara que "no produce texto usable" y que "no funciona como modelo de lenguaje".

El interés técnico del artefacto es doble. Por un lado, documenta con mediciones reproducibles (perplejidad, KL, acuerdo top-1, benchmarks de tarea) el punto en el que la cuantización binaria destruye la capacidad del modelo. Por otro, sirve de referencia sobre la sensibilidad de Gemma 4 12B-it a la cuantización: incluso Q8_0 y Q4_K_M alteran de forma medible la distribución de salida, lo que convierte a este modelo en un caso de estudio sobre los límites de la compresión agresiva.

El repositorio ocupa 2,9 GB e incluye pesos empaquetados en formato safetensors con tablas de embedding cuantizadas en Q4_0 y Q6_K, junto con un script (`code/lb_dense.py`) para reconstruir un checkpoint denso convertible a GGUF. No hay información sobre arquitectura interna, contexto o idiomas en la documentación proporcionada; se remite al modelo base para esos datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de google/gemma-4-12B-it; factorizacion binaria LittleBit-2 por bloques) |
| Parametros totales | no disponible (modelo base: 12B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos binarios a 0,55 bits por peso (LittleBit-2, block-wise); embeddings en Q4_0 y Q6_K; reconstruccion a denso bf16 para GGUF |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (empaquetado); GGUF tras conversion a denso |

## Arquitectura y entrenamiento

El artefacto no entrena un modelo nuevo: comprime los pesos de `google/gemma-4-12B-it` mediante LittleBit-2, una factorización binaria por bloques que representa cada matriz como producto de factores binarios con escalas, alcanzando 0,55 bits por peso. El modelo base se comprime tal cual se publicó, sin fine-tuning posterior. El repositorio incluye además un script (`code/lb_dense.py`) que reconstruye un checkpoint denso a partir de los pesos empaquetados, paso previo a la conversión a GGUF para poder evaluarlo en llama.cpp.

La model card documenta el error relativo del estado oculto por bloque: 0,272 tras el bloque 0, 0,396 tras el bloque 47, con mínimo de 0,174 tras el bloque 1 y máximo de 0,543 tras el bloque 41 (detalle completo en `blocks.jsonl`). No se proporcionan datos sobre el corpus de entrenamiento del modelo base, el proceso de alineación (RLHF/DPO) ni innovaciones de decodificación; esa información corresponde a la documentación de Google para Gemma 4 12B-it, no incluida aquí.

## Capacidades

- Generación de texto: nominalmente heredada del modelo base, pero **inutilizable en la práctica**; el autor indica que el texto generado no es usable.
- Razonamiento y conocimiento: destruidos por la compresión; el modelo queda al nivel del azar en HellaSwag y Winogrande.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles; el modelo no supera tareas de un solo paso.
- Multilingüismo: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.
- Uso previsto real: inspección del resultado de compresión, reproducción de métricas y estudio de la degradación por cuantización binaria.

## Casos de uso

- Estudio de límites de compresión: reproducir las métricas de perplejidad, KL y acuerdo top-1 para caracterizar hasta dónde llega LittleBit-2 en un transformer de 12B. El repositorio incluye los ficheros necesarios (`blocks.jsonl`, pesos Q4_0/Q6_K) para repetir las mediciones.
- Referencia metodológica en investigación de cuantización: usar el par (original, comprimido) como caso extremo al diseñar o evaluar nuevos esquemas de compresión binaria o de muy baja precisión.
- Calibración de métricas de calidad: el autor muestra que la perplejidad sola es una señal pobre para Gemma 4 12B-it, ya que puede bajar bajo ruido de cuantización; este artefacto sirve para validar pipelines que combinen perplejidad, KL y acuerdo top-1.
- Auditoría de sensibilidad del modelo base: comparar Q8_0 (perplejidad 292,66; KL 0,188) y Q4_K_M (305,94; KL 1,092) frente al original (281,28) para decidir qué cuantización es aceptable en despliegues reales de Gemma 4 12B-it.
- Docencia y divulgación: ejemplo tangible de por qué la compresión por debajo de 1 bit por peso no es viable con los métodos actuales en modelos densos de este tamaño.
- Verificación de tooling: probar el flujo empaquetado → denso (`lb_dense.py`) → GGUF → llama.cpp como cadena de conversión reproducible, sin esperar calidad de salida.

## Benchmarks y rendimiento

Métricas de la model card. La perplejidad se mide sobre 32 filas retenidas de 1024 tokens; los benchmarks de tarea usan los scorers integrados de llama.cpp (build 44d5087, 2026-11-22) sobre el GGUF denso del fichero Q6_K.

| Medida (texto retenido) | Comprimido | Original |
|---|---|---|
| Pérdida next-token | 8,1091 | 5,6469 |
| Perplejidad | 3.324,7 | 283,4 |
| Acuerdo top-1 con el token más probable del original | 0,3062 | 1 |
| KL(original → comprimido), nats por token | 4,4092 | 0 |

| Fichero enviado | Perplejidad (original) | Acuerdo top-1 | KL (nats/token) | Prompt tok/s (pp512, A100 80 GB) | Generación tok/s (tg128, A100 80 GB) |
|---|---|---|---|---|---|
| q4_0 (GGUF denso 23,83 GB) | 3.279,4 (281,28) | 0,3006 | 4,4324 | 5.865,53 | 55,74 |
| q6_k (GGUF denso 23,83 GB) | 3.338,9 (281,28) | 0,3043 | 4,4314 | 4.617,58 | 55,51 |

| Modelo | HellaSwag acc_norm | Winogrande | Tareas (HellaSwag / Winogrande) |
|---|---|---|---|
| Este modelo, Q6_K (GGUF denso) | 25,0 % (IC 95 %: 21,0–29,5) | 51,0 % (± 2,2) | 400 / 500 |
| Original (bf16 GGUF) | 51,2 % (46,4–56,1) | 57,0 % (± 2,2) | 400 / 500 |
| Original Q8_0 | 53,2 % (48,4–58,1) | 54,6 % (± 2,2) | 400 / 500 |
| Original Q4_K_M | 50,0 % (45,1–54,9) | 56,6 % (± 2,2) | 400 / 500 |
| Azar | 25 % | 50 % | — |

Referencia de cuantización del original en llama.cpp sobre el mismo texto retenido (perplejidad del original sin cuantizar: 281,28):

| Cuantización del original | Perplejidad | KL al original, nats/token | Acuerdo top-1 |
|---|---|---|---|
| Q8_0 | 292,66 | 0,188 | 0,876 |
| Q4_K_M | 305,94 | 1,092 | 0,647 |

## Requisitos de hardware

- VRAM en inferencia con el fichero empaquetado: no hay motor que ejecute los pesos binarios directamente; el tamaño del fichero es de 1,32 GB (Q4_0) y 1,58 GB (Q6_K), pero no son ejecutables tal cual.
- VRAM en la ruta densa: el GGUF reconstruido ocupa 23,83 GB, idéntico al original en bf16; requiere al menos esa memoria más overhead de contexto.
- GPU recomendadas: A100 80 GB es la plataforma usada en las mediciones. Cualquier GPU con ≥24 GB (RTX 3090/4090, L4, L40S) puede alojar el GGUF denso, pero sin ganancia de velocidad ni de tamaño.
- GPU consumer: cabe en RTX 3090 y RTX 4090 en la ruta densa; el fichero empaquetado no es ejecutable en ninguna.
- Despliegue: llama.cpp (build 44d5087 o posterior) para el GGUF denso; conversión previa con `code/lb_dense.py`. No se documenta soporte en vLLM, TGI, Ollama ni otros motores.
- Rendimiento medido en A100 80 GB: prompt processing 5.865,53 tok/s (Q4_0) y 4.617,58 tok/s (Q6_K); generación 55,74 y 55,51 tok/s respectivamente. El original bf16 rinde 5.868,30 tok/s de prompt y 55,72 tok/s de generación: diferencias dentro de la dispersión, porque la ruta densa no está comprimida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad (perplejidad retenida) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (LittleBit-2, 0,55 bpw) | 12B (base) | no disponible | 3.324,7 (original: 283,4) | apache-2.0 | Hugging Face |
| google/gemma-4-12B-it (original bf16) | 12B | no disponible | 281,28 | no disponible en esta ficha | Hugging Face |
| google/gemma-4-12B-it Q8_0 | 12B | no disponible | 292,66 | no disponible en esta ficha | GGUF vía llama.cpp |
| google/gemma-4-12B-it Q4_K_M | 12B | no disponible | 305,94 | no disponible en esta ficha | GGUF vía llama.cpp |
| gemma-4-12b-it-fable5-sft-littlebit-0.55bpw-channel | 12B (base) | no disponible | 1.911,4 (original: 86,5) | no disponible en esta ficha | Hugging Face |

El modelo comparable más cercano dentro de la serie es la variante LittleBit-2 sobre `fable5-sft`, con perplejidad 1.911,4 frente a 86,5 de su original (ratio 22,1). Ninguna de las dos variantes es utilizable como modelo de lenguaje.

## Limitaciones y advertencias

- **No es un modelo funcional**: el autor declara explícitamente que no produce texto usable y que no funciona como modelo de lenguaje. No debe desplegarse en producción bajo ninguna circunstancia.
- Calidad medida al nivel del azar en HellaSwag (25,0 %, IC 21,0–29,5 frente a 25 % de azar) y en Winogrande (51,0 % ± 2,2 frente a 50 % de azar).
- Perplejidad retenida 11,7 veces la del original (3.324,7 frente a 283,4); KL de 4,4092 nats por token; acuerdo top-1 del 30,6 %.
- La ruta densa no aporta ventajas: el GGUF reconstruido ocupa 23,83 GB y rinde igual que el original, porque todos los pesos vuelven a ser matrices bf16 ordinarias. No existe motor que ejecute el fichero empaquetado de 1,32–1,58 GB.
- La perplejidad es una señal de calidad poco fiable para Gemma 4 12B-it: puede bajar bajo ruido de cuantización. Deben leerse conjuntamente KL y acuerdo top-1.
- Sesgos conocidos del modelo base: no documentados en la información proporcionada; se heredan los de `google/gemma-4-12B-it`, aunque la compresión los enmascara bajo una degradación mucho mayor.
- Riesgo de alucinación: máximo; la salida no es coherente y no puede verificarse semánticamente.
- Restricciones de licencia: el artefacto se publica como apache-2.0, pero la licencia y condiciones de uso del modelo base (Gemma) deben verificarse por separado antes de cualquier uso derivado.
- Idiomas soportados y longitud de contexto: no disponibles en la documentación del artefacto.
- Fecha de creación: 2026-11-23; el método LittleBit-2 es experimental y el propio autor lo califica como investigación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/protoncracker/gemma-4-12b-it-littlebit-0.55bpw-channel
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Variante comparable de la serie: https://huggingface.co/protoncracker/gemma-4-12b-it-fable5-sft-littlebit-0.55bpw-channel
- llama.cpp (build 44d5087, 2026-11-22): https://github.com/ggml-org/llama.cpp
- Script de reconstrucción a denso: `code/lb_dense.py` dentro del repositorio del modelo
- Métricas por bloque: `blocks.jsonl` dentro del repositorio del modelo

# NaturalScale/LoopTitan-MoE12-Revisit-1.3B-A0.3B-AdamW

## Resumen

LoopTitan-MoE12-Revisit-1.3B-A0.3B-AdamW es un modelo de lenguaje base entrenado desde cero por NaturalScale (en colaboración con el laboratorio datamllab, autor del repositorio LoopTitan), diseñado como experimento de investigación sobre arquitecturas MoE con capas repetidas (looped MoE). No es un modelo instruido ni orientado a producto: es una pieza de un estudio comparativo de ocho diseños de arquitectura, cada uno entrenado con dos optimizadores distintos (AdamW y Muon), y esta variante concreta corresponde al diseño "una visita adicional" (MoE-12 + 1 visit) con AdamW.

El modelo almacena 12 capas de anchura 1280 con 64 expertos por capa y tamaño oculto de experto 432; las 6 capas centrales se ejecutan dos veces con el residual escalado por 0,5, de modo que en inferencia se recorren 18 capas efectivas a partir de 12 almacenadas. Tiene 1,32B parámetros sin contar embeddings, 1,71B contando la embedding de entrada y la cabeza de salida (la cifra que muestra Hugging Face) y 0,31B parámetros activos por token, contando cada visita de las capas repetidas.

Su relevancia es fundamentalmente metodológica: según la model card, este diseño logra una mejora de -14,80 mBPB en test frente al MoE estándar con AdamW, la segunda mejor de las ocho variantes de la release (solo superada por el diseño "el doble de expertos", con -14,3 mBPB). Está publicado con licencia MIT, pesos en safetensors y código personalizado (`custom_code`) compatible con transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas repetidas (looped MoE); 12 capas almacenadas, 18 ejecutadas |
| Parametros totales | 1.706.561.280 (1,71B con embeddings); 1,32B sin embeddings |
| Parametros activos | 0,31B por token (contando cada visita de las capas repetidas) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 6,8 GB), con `custom_code` |

Detalles adicionales de arquitectura: anchura 1280, 64 expertos por capa, tamaño oculto de experto 432, residual ×0,5 en las capas repetidas. Optimizador AdamW. Entrenado sobre el dataset `mlfoundations/dclm-baseline-1.0-parquet`.

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos (MoE) al que se aplica una estrategia de "looping": de las 12 capas almacenadas, las 6 centrales se ejecutan dos veces, con el residual de la segunda visita escalado por 0,5 para estabilizar la señal. Esto eleva el cómputo efectivo a 18 capas sin aumentar el número de parámetros almacenados, un enfoque que busca mejorar la relación entre capacidad efectiva y coste de memoria. Con 64 expertos por capa y 0,31B parámetros activos por token, el modelo mantiene un coste de inferencia bajo en comparación con sus 1,71B parámetros totales.

El entrenamiento es desde cero (no es un modelo ajustado a partir de otro) sobre el dataset DCLM-baseline 1.0 de ML Foundations, y esta variante usa el optimizador AdamW. La model card no detalla el número de tokens vistos, la composición exacta del dataset, ni si hubo fases de RLHF o DPO; tampoco se documenta ninguna innovación de decodificación (decodificación especulativa, atención lineal, etc.). El modelo forma parte de un estudio controlado de ocho diseños arquitectónicos entrenados con dos optimizadores, por lo que su valor es comparativo dentro de ese conjunto experimental.

## Capacidades

- Generación de texto autoregresiva como modelo de lenguaje base (no instruido).
- Modelado de lenguaje y estimación de verosimilitud; la métrica principal reportada es bits per byte (BPB) sobre texto held-out.
- Razonamiento y conocimiento general derivados del preentrenamiento sobre DCLM-baseline, sin ajuste instructivo.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Capacidades multilingües: no disponibles (no se declaran idiomas soportados).
- No se documenta modo de pensamiento (thinking), visión ni audio.
- Requiere cargar código personalizado (`custom_code`) para su uso con transformers.

## Casos de uso

- Investigación en arquitecturas eficientes: replicar el experimento de looped MoE y comparar el diseño "una visita adicional" con el MoE estándar, usando la métrica BPB sobre DCLM como referencia (-14,80 mBPB en test).
- Evaluación de optimizadores: comparar esta variante AdamW con su equivalente Muon (misma arquitectura, mismo dataset) para estudiar el efecto del optimizador en el entrenamiento de MoE con capas repetidas.
- Modelado de lenguaje y perplejidad: usar el modelo como referencia para medir BPB en corpus de dominio específico y contrastar con el MoE estándar de la misma familia.
- Generación de texto sin instrucciones: servir como modelo base para tareas de continuación de texto o generación libre, con la advertencia de que no está alineado ni instruido.
- Base para ajuste fino posterior (SFT/DPO): al ser un modelo base con licencia MIT, puede servir como punto de partida para experimentos de ajuste con instrucciones en entornos de investigación.
- Estudio de eficiencia de parámetros: analizar el equilibrio entre 1,71B parámetros almacenados y 0,31B activos por token en despliegues con restricciones de memoria.
- Reproducibilidad académica: al publicarse pesos, código y resultados de la fase 1, permite verificar las conclusiones del estudio LoopTitan sobre diseños MoE.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Valor | Delta frente a MoE estandar (AdamW) |
|---|---:|---:|
| Test BPB | 0,984730 | -14,80 mBPB |
| Validation BPB | 0,986424 | no disponible |

Comparativa interna de los ocho diseños de la release (test mBPB frente al MoE estándar, por optimizador):

| Diseno | AdamW | Muon |
|---|---:|---:|
| MoE estandar | +0,0 | +0,0 |
| Expertos mas finos | -4,2 | -0,9 |
| Mas profundo y estrecho | -6,9 | -4,2 |
| Disposicion de expertos | -5,9 | -3,4 |
| Desenrollado (unrolled) | -8,9 | -3,3 |
| El bucle (the loop) | -9,0 | -3,7 |
| Una visita mas (este modelo) | -14,8 | -12,2 |
| El doble de expertos | -14,3 | -9,9 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 6,8 GB en safetensors; en precisión nativa (bf16/fp16) se necesitan aproximadamente 3,4 GB solo para pesos, más overhead de activaciones y del código personalizado. En cuantización de 8 bits cabría en torno a 1,8-2 GB, y en 4 bits en torno a 1-1,2 GB, aunque no se documentan recetas de cuantización oficiales.
- GPU recomendadas: una GPU de consumo con 8-12 GB (RTX 3060, 4060, 4070) debería ser suficiente para inferencia en bf16; para entrenamiento o ajuste fino se recomiendan A100, H100 o GPUs con 40-80 GB.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB o superiores para inferencia en bf16, y en GPUs de 8 GB con cuantización.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por el `custom_code`); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, y la arquitectura personalizada probablemente requiera adaptaciones para esos motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---:|---|---|---|
| LoopTitan-MoE12-Revisit-1.3B-A0.3B-AdamW | 1,71B (1,32B sin embeddings) | 0,31B | no disponible | MIT | Looped MoE experimental; test BPB 0,9847 |
| MoE estandar de la misma release (AdamW) | mismo orden | no disponible | no disponible | MIT | Referencia interna: +0,0 mBPB |
| Variante Muon del mismo diseno | 1,71B | 0,31B | no disponible | MIT | -12,2 mBPB frente al estandar |
| Diseno "el doble de expertos" (AdamW) | no disponible | no disponible | no disponible | MIT | -14,3 mBPB frente al estandar |

No se dispone de comparaciones con modelos de otras familias (por ejemplo, MoE de tamaño similar de otros autores) en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo base entrenado desde cero, no instruido: no sigue instrucciones de forma fiable ni está alineado con preferencias humanas.
- No se documentan idiomas soportados; el rendimiento fuera del inglés (idioma dominante de DCLM) es incierto.
- No se documenta la longitud de contexto, lo que impide planificar despliegues con ventanas largas.
- Riesgo de alucinación y de generar contenido sesgado o inapropiado, habitual en modelos base sin filtrado posterior.
- Los benchmarks reportados (BPB) son declarados por el autor y no están verificados de forma independiente (`verified: false`).
- Requiere `trust_remote_code=True` y código personalizado, lo que añade riesgo de seguridad y complejidad de despliegue en producción.
- No se documenta soporte en motores de inferencia estándar (vLLM, llama.cpp, TGI), por lo que la integración en producción requeriría trabajo adicional.
- La licencia MIT permite uso comercial, pero al tratarse de un modelo de investigación sin garantías de calidad, no se recomienda para aplicaciones de cara al usuario sin una evaluación exhaustiva.
- El modelo tiene muy poca tracción (3 descargas, 0 likes en el momento de la consulta), lo que limita la comunidad y el soporte disponible.

## Enlaces

- Hugging Face: https://huggingface.co/NaturalScale/LoopTitan-MoE12-Revisit-1.3B-A0.3B-AdamW
- Pagina del proyecto LoopTitan: https://datamllab.github.io/LoopTitan/
- Repositorio de codigo: https://github.com/datamllab/LoopTitan
- Documentacion: https://github.com/datamllab/LoopTitan/tree/main/docs
- Resultados de la fase 1: https://github.com/datamllab/LoopTitan/blob/main/docs/results/phase1.md
- Coleccion de modelos LoopTitan Phase 1: https://huggingface.co/collections/NaturalScale/looptitan-phase-1-6afb1e0dbc400210b5b0a5eb
- Dataset de entrenamiento: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0-parquet

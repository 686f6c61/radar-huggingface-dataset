# hhhhhhy5/MFD-Qwen3.6-27B

## Resumen

MFD-Qwen3.6-27B es un modelo borrador (draft model) para decodificación especulativa, desarrollado por hhhhhhy5 (Haoyu Huang y colaboradores, según la cita del paper). No es un modelo generativo autónomo: su función es acelerar la inferencia del modelo objetivo Qwen/Qwen3.6-27B mediante la técnica Multi-Future Drafting (MFD), presentada en el artículo *Multi-Future Drafting: Mixture Block Drafters for Tree-Verified Speculative Decoding* (arXiv:2611.13017). Con 1.730 millones de parámetros en bf16, se inicializa desde z-lab/Qwen3.6-27B-DFlash y se entrena sobre 1,42 millones de prompts de mlabonne/open-perfectblend.

La innovación central es el uso de K = 8 embeddings de modo aprendidos que permiten al borrador proponer ocho futuros coherentes distintos en un único forward pass. Un árbol de mezcla conserva las B mejores ramas y el modelo objetivo las verifica en una sola pasada, garantizando una decodificación sin pérdida (la salida es siempre la del objetivo). Según los resultados del paper, este borrador alcanza un speedup medio de 7,16x con temperatura 0 y 6,16x con temperatura 1 sobre decodificación autorregresiva, con longitudes de aceptación de 9,42 y 8,16 tokens respectivamente.

Es relevante para equipos que sirven Qwen3.6-27B en producción y buscan reducir coste y latencia sin alterar la calidad de las respuestas. El modelo es de noviembre de 2026, con cero descargas en el momento de la consulta, y su utilidad está estrictamente ligada a su modelo objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash drafter (5 capas de anchura 5120, lectura de capas objetivo [1, 16, 31, 46, 61], bloque de 16 posiciones, 8 mode embeddings de 8 x 5120 y una gate lineal) |
| Parametros totales | 1.730.259.200 (1,73B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenado con secuencias de hasta 3072 tokens) |
| Tipos de cuantizacion | no disponible (pesos en bf16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con custom_code) |

## Arquitectura y entrenamiento

El borrador es un DFlash block drafter que lee los estados ocultos de cinco capas del modelo objetivo (1, 16, 31, 46 y 61) y propone bloques de 16 posiciones (15 posiciones redactadas). La novedad de MFD es la incorporación de 8 embeddings de modo en la entrada: los ocho modos redactan el bloque en la misma pasada hacia adelante, cada uno representando un futuro coherente. Un árbol de mezcla retiene los B prefijos con mayor log-probabilidad del mejor modo y el objetivo verifica el árbol completo en una sola pasada mediante verificación de árbol estándar, lo que hace la decodificación sin pérdida. La gate lineal no se utiliza en inferencia.

El entrenamiento parte de z-lab/Qwen3.6-27B-DFlash (MIT) y utiliza los 1,42 millones de prompts de mlabonne/open-perfectblend, con respuestas regeneradas por Qwen3.6-27B en modo thinking (T = 0,7, top-p 0,8, top-k 20, máximo 3072 tokens nuevos). Se realizan 3 épocas con AdamW, learning rate 1e-4 (warmup del 4 %, decaimiento coseno), clipping de gradiente 1, secuencias de hasta 3072 tokens y 36 secuencias por paso, con 64 bloques ancla por secuencia por cada uno de los 8 modos. El objetivo es un winner-take-all relajado sobre los 8 modos (peso 0,9 para el modo con mayor cobertura suave del bloque, 0,1/7 para el resto), con pérdida D-PACE (suavizado 0,5) por modo y entropía cruzada de la gate con peso 0,1.

## Capacidades

- Decodificación especulativa sin pérdida: acelera Qwen3.6-27B manteniendo exactamente la distribución de salida del objetivo.
- Redacción multi-futuro: 8 modos simultáneos por forward pass para construir árboles de borrador diversos.
- Verificación de árbol en una sola pasada del objetivo (tree verification estándar).
- Integración con el modo thinking de Qwen3.6-27B.
- No genera texto de forma autónoma: depende de los estados ocultos, el embedding y el LM head del objetivo.
- No soporta tool calling, agentes ni capacidades multimodales por sí mismo; hereda las del modelo objetivo a través de la decodificación.

## Casos de uso

- Servicio de inferencia de Qwen3.6-27B con latencia reducida: desplegar el borrador junto al objetivo para obtener speedups de hasta 7,16x en batch 1, útil en APIs interactivas donde el coste por token es crítico.
- Razonamiento matemático en producción: en GSM8K y MATH-500 el paper reporta mejoras de aceptación, lo que reduce el tiempo de respuesta en pipelines de resolución de problemas paso a paso.
- Generación de código asistida: con HumanEval y MBPP en el conjunto de evaluación del paper, el borrador acelera la generación de parches y autocompletado en IDE sin alterar el código producido por el objetivo.
- Chat multi-turno: MT-Bench forma parte de la evaluación; el speedup se mantiene en conversaciones con contexto, adecuado para asistentes con modo thinking.
- Evaluación comparativa de técnicas de decodificación especulativa: sirve como referencia MFD frente a DFlash chain y DDTree sobre el mismo objetivo y datos.
- Investigación en decodificación especulativa: el código de multi-future-drafting permite reproducir los experimentos del paper y extender la técnica a otros objetivos híbridos.

## Benchmarks y rendimiento

Resultados del paper (Transformers, batch size 1, una NVIDIA RTX PRO 6000 Blackwell; media sobre GSM8K, MATH-500, HumanEval, MBPP y MT-Bench; árbol con B = 64). Cada celda es el speedup sobre decodificación autorregresiva con la longitud de aceptación tau entre paréntesis.

| Metodo | T = 0 | T = 1 |
|---|---|---|
| DFlash chain (drafter publicado) | 4,66x (5,81) | 4,04x (5,04) |
| DDTree (drafter publicado) | 5,89x (7,62) | 5,27x (6,86) |
| D-PACE + DDTree, mismos datos, 3 ep | 6,74x (8,72) | 5,69x (7,40) |
| **Este drafter (arbol MFD)** | **7,16x (9,42)** | **6,16x (8,16)** |

No se han publicado resultados por tarea individual (MMLU, HumanEval, GSM8K desagregados) en la información disponible.

## Requisitos de hardware

- VRAM estimada para el borrador: aproximadamente 3,5 GB en bf16 (1,73B parámetros), más la memoria del modelo objetivo Qwen3.6-27B (aproximadamente 54 GB en bf16) y las cachés de árbol.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell (entorno de medida del paper); para el objetivo de 27B en bf16 se requiere una GPU de 80 GB (A100, H100) o varias GPUs.
- En GPU de consumo: el borrador cabe en tarjetas de 8 GB o más, pero el objetivo de 27B en bf16 no cabe en GPUs consumer de 24 GB sin cuantización del objetivo; no se documenta soporte de cuantización para este borrador.
- Opciones de despliegue: el repositorio de código (github.com/hhhhhhy5/multi-future-drafting) con la ruta `inference/hf` para Transformers; los objetivos híbridos Gated-DeltaNet solo se sirven por la ruta de Hugging Face, que verifica árboles con los kernels de `inference/hf/qwen35_tree.py`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: medidos a batch size 1 en el arnés de Hugging Face; no se publican cifras absolutas de tokens por segundo, solo speedups relativos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Speedup (T = 0) | Licencia |
|---|---|---|---|---|---|
| MFD-Qwen3.6-27B (este) | Borrador MFD, 8 modos | 1,73B | no disponible (entrenado a 3072) | 7,16x | Apache-2.0 |
| z-lab/Qwen3.6-27B-DFlash | Borrador DFlash (inicialización) | no disponible | no disponible | 4,66x (chain) / 5,89x (DDTree) | MIT |
| D-PACE + DDTree (mismos datos) | Borrador DFlash con pérdida D-PACE | no disponible | no disponible | 6,74x | no disponible |

La comparativa se limita a los borradores evaluados en el paper; no se dispone de datos de otros borradores para Qwen3.6-27B.

## Limitaciones y advertencias

- El borrador está ligado a su objetivo: lee los estados ocultos de Qwen3.6-27B y usa su embedding y LM head; no funciona con otros modelos.
- Resultados medidos únicamente a batch size 1 en el arnés de Hugging Face, la única ruta del repositorio que sirve este objetivo híbrido; el rendimiento en batch mayor o en otros motores de inferencia no está documentado.
- No se documentan sesgos ni riesgos de alucinación propios: la salida es la del objetivo, por lo que hereda sus sesgos y limitaciones.
- Idiomas soportados no disponibles; dependen del modelo objetivo.
- La licencia Apache-2.0 del borrador convive con el aviso MIT de z-lab/Qwen3.6-27B-DFlash, que aplica a los pesos de partida; conviene revisar ambas para uso comercial.
- El repositorio tiene cero descargas y fue creado y actualizado el mismo día (2026-11-11), sin validación comunitaria independiente.
- Requiere el código externo del repositorio (custom_code) y kernels específicos para la verificación de árboles; no es un modelo plug-and-play con pipelines estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hhhhhhy5/MFD-Qwen3.6-27B
- Modelo base (inicialización): https://huggingface.co/z-lab/Qwen3.6-27B-DFlash
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3.6-27B
- Paper: https://arxiv.org/abs/2611.13017
- Código: https://github.com/hhhhhhy5/multi-future-drafting
- Página del proyecto: https://hhhhhhy5.github.io/multi-future-drafting/
- Dataset de prompts: https://huggingface.co/datasets/mlabonne/open-perfectblend

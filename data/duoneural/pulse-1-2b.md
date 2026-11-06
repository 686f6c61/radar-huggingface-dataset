# DuoNeural/PULSE-1.2B

## Resumen

PULSE-1.2B (Port-Hamiltonian Unitary-Lindbladian Sequence Engine) es un modelo de lenguaje autorregresivo de 1.121 mil millones de parametros desarrollado por DuoNeural AI Laboratory (Jesse Caldwell, Aura, Archon). Su propuesta central es tratar el modelado del lenguaje como una medicion cuantica abierta: el backbone recurrente se formula como un sistema dinamico cuantico abierto y la cabeza de prediccion de tokens implementa una medicion POVM exacta bajo la regla de Born, eliminando la softmax tradicional.

El modelo aborda tres problemas historicos del modelado del lenguaje inspirado en cuantica (QiLM): sustituye matrices de densidad por vectores de estado puro (reduciendo complejidad de O(d^4) a O(d) por canal), introduce un scan asociativo logaritmico sobre el semigrupo afin complejo que permite paralelizar transiciones en O(log T) mediante kernels Triton, y reemplaza la softmax por una cabeza POVM con invariancia de escala exacta y adjunto de Wirtinger analitico.

La arquitectura consta de 24 capas reversibles con 8 cabezas complejas y dimension D=1024, con un vocabulario de 49.152 tokens (tokenizador cosmo2-tokenizer). Esta disenado para ejecutarse en GPUs consumer Blackwell (sm_120), alcanzando 2.567,8 tokens/s en una RTX 5070 Ti de 16 GB. El checkpoint publicado corresponde a una fase inicial de preentrenamiento (313 pasos, 41 millones de tokens), por lo que el modelo no esta listo para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer recurrente reversible con backbone de sistema cuantico abierto (port-Hamiltonian / Lindbladian), 24 capas reversibles, 8 cabezas complejas |
| Parametros totales | 1.120.594.496 (1.121B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento a T=2048 en la telemetria) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (checkpoints .pt en PyTorch; safetensors/GGUF no confirmados) |

## Arquitectura y entrenamiento

El backbone es un transformer recurrente reversible cuyas transiciones de estado puro forman un semigrupo afin complejo asociativo (C x C, o), lo que permite ejecutar scans asociativos de Blelloch en paralelo con complejidad O(log T) mediante kernels Triton personalizados. La cabeza de prediccion es una POVM en espacio de Hilbert proyectivo que calcula P(w_k | psi) = |<e_k|psi>|^2 / sum_j |<e_j|psi>|^2, proporcionando invariancia de escala exacta y backpropagation mediante adjunto de Wirtinger analitico, sin necesidad de ajustar temperatura de softmax. Las capas reversibles permiten reconstruir activaciones sin almacenarlas (drift de inversion maximo < 1.19e-7, en el orden de epsilon de maquina).

El entrenamiento se realizo sobre GPU Blackwell (RTX 5070 Ti, sm_120, GB203) con tiling de cache L2 de 48 MB que mantiene los buffers Born intermedios (C=128) en 25,16 MB, evitando spill a GDDR7. La telemetria publicada cubre solo 313 pasos y 41,03 millones de tokens, con una perdida de entropia cruzada que baja de 11,38 (paso 1) a 8,31 (paso 313) y luego se estanca en torno a 8,32. No se documenta composicion del dataset, uso de RLHF/DPO ni fases de alineamiento. El autor indica que los checkpoints intermedios (pasos 50, 100, 200, 300) se subiran al completar la fase fundacional de 131 millones de tokens.

## Capacidades

- Generacion de texto autorregresiva (pipeline text-generation declarado).
- Prediccion de tokens sin softmax mediante regla de Born / POVM.
- Inferencia y entrenamiento en GPUs consumer Blackwell con kernels Triton propios.
- Capas reversibles con reconstruccion exacta de activaciones (drift < 1.19e-7).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue (idiomas no disponibles).
- No se documenta vision, audio ni modo thinking.

## Casos de uso

- Investigacion en modelos inspirados en cuantica: el modelo sirve como banco de pruebas reproducible para estudiar cabezas POVM y scans asociativos frente a softmax y attention estandar, con codigo y kernels Triton abiertos en GitHub.
- Experimentacion con arquitecturas reversibles: util para medir el coste real de la inversion reversible en memoria y velocidad en GPUs consumer, dado que el drift reportado es de orden epsilon de maquina.
- Desarrollo de kernels GPU: los kernels Triton de scan asociativo y los buffers Born con tiling de cache L2 son reutilizables en otros proyectos que necesiten operaciones paralelas O(log T).
- Prototipado de preentrenamiento en hardware de gama consumer: la telemetria (2.567,8 tok/s, 9,87 GB de VRAM pico en RTX 5070 Ti) permite estimar presupuestos de entrenamiento para modelos de ~1B en una sola GPU.
- Docencia y divulgacion: la formulacion matematica explicita (semigrupo afin, POVM, adjunto de Wirtinger) y el harness abierto permiten ilustrar conceptos de algebra lineal compleja aplicada a deep learning.
- Reproduccion de resultados: el repositorio incluye test_convergence.py, lo que facilita replicar la curva de convergencia publicada y verificar las cifras de throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica publicada es la telemetria de preentrenamiento:

| Paso | Tokens acumulados | Loss (CE) | Grad norm | Throughput |
|---|---|---|---|---|
| 0001 | 0,13M | 11,3819 | 10,3125 | 2.351,8 tok/s |
| 0050 | 6,55M | 8,3493 | 0,1934 | 2.567,8 tok/s |
| 0100 | 13,11M | 8,3217 | 0,0635 | 2.567,5 tok/s |
| 0150 | 19,66M | 8,3233 | 0,5586 | 2.567,8 tok/s |
| 0200 | 26,21M | 8,3185 | 0,2324 | 2.567,8 tok/s |
| 0250 | 32,77M | 8,3254 | 0,1177 | 2.567,9 tok/s |
| 0300 | 39,32M | 8,3217 | 0,0938 | 2.567,8 tok/s |
| 0313 | 41,03M | 8,3141 | 0,0479 | 2.567,8 tok/s |

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma explicita; el pico de VRAM asignada durante entrenamiento (T=2048, B=2, GA=32) es de 9.866,9 MB sobre una RTX 5070 Ti de 16 GB (62,3% de la tarjeta).
- GPU recomendadas: NVIDIA RTX 5070 Ti (sm_120, GB203) es la plataforma de referencia documentada; otras GPUs Blackwell sm_120 deberian funcionar. No se documenta soporte para A100, H100 ni arquitecturas anteriores.
- Cabe en GPU consumer: si, en la RTX 5070 Ti de 16 GB, con 6.436 MB de margen libre reportados.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; el uso previsto es mediante el harness PyTorch/Triton del repositorio GitHub.
- Latencia y throughput: 2.567,8 tokens/s en entrenamiento (paso de optimizador de 51,04 s a T=2048, B=2, GA=32); no se publica throughput de inferencia.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros modelos de ~1B parametros ni con otras propuestas de modelado del lenguaje inspirado en cuantica.

## Limitaciones y advertencias

- El checkpoint corresponde a una fase inicial de preentrenamiento (313 pasos, 41,03M tokens), muy por debajo de lo necesario para generar texto coherente; la loss estancada en ~8,32 sugiere que el modelo aun no ha aprendido patrones utiles.
- La fase fundacional completa de 131M tokens aun no ha concluido; los checkpoints intermedios se subiran posteriormente segun el autor.
- No se documenta composicion del dataset, filtrado de datos ni procesos de alineamiento (RLHF/DPO), por lo que se desconocen sesgos y riesgos de contenido.
- Riesgo de alucinacion no evaluado; sin benchmarks ni evaluaciones de calidad disponibles.
- Idiomas soportados no documentados; no se puede asumir calidad multilingue.
- Longitud de contexto maxima no especificada; la telemetria solo cubre T=2048.
- Formatos de pesos y opciones de cuantizacion no documentados; la integracion con herramientas estandar (llama.cpp, vLLM, Ollama) no esta confirmada.
- Dependencia de kernels Triton y de arquitectura Blackwell sm_120; la portabilidad a otras GPUs no esta garantizada.
- Licencia MIT permite uso comercial, pero el estado embrionario del modelo hace inviable su uso en produccion.
- Cero descargas y cero likes en Hugging Face en el momento de la consulta; sin validacion externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/PULSE-1.2B
- GitHub: https://github.com/DuoNeural/PULSE
- Preprint (DuoNeural Preprint v0.1): https://github.com/DuoNeural/PULSE

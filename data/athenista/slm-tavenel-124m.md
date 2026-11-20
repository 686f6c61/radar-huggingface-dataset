# athenista/slm-tavenel-124m

## Resumen

SLM-Tavenel 124M es un modelo de lenguaje base experimental de 124 millones de parámetros, entrenado desde cero por el autor independiente athenista y publicado en Hugging Face. Se trata de un transformer decoder-only con 27 capas, anchura de 576 y atención con 9 cabezas de consulta y 3 de clave-valor, que replica el tamaño de GPT-2 Small pero con decisiones arquitectónicas y de entrenamiento propias (SwiGLU, tokenizador de SmolLM2, optimizador Muon combinado con AdamW). No es un modelo instruido ni un asistente conversacional: es un artefacto de investigación orientado a reproducibilidad y a estudiar el entrenamiento de modelos pequeños desde cero.

El modelo se entrenó con aproximadamente 983 millones de posiciones de tokens sobre una mezcla filtrada de FineWeb-Edu (inglés) y FineWeb2-HQ (francés), en una única GPU RTX 4060 Laptop de 8 GB durante unas 57 horas en bfloat16. Su ventana de contexto es de 2.048 tokens, lo que lo sitúa en el rango de los modelos pequeños clásicos y limita su uso a tareas de contexto corto.

Su relevancia actual es fundamentalmente metodológica: el autor documenta un experimento preregistrado (EXP-0036) que compara el modelo con GPT-2 Small en seis benchmarks con el mismo evaluador, y reconoce explícitamente que el criterio de "victoria global" no se cumplió. Es un ejemplo poco habitual de transparencia sobre resultados negativos y de trazabilidad completa del proceso de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, 27 capas, anchura 576, 9 cabezas de consulta / 3 de clave-valor, SwiGLU con dimensión intermedia 1.536 |
| Parametros totales | 124.038.144 (95.726.592 excluyendo los embeddings de tokens) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | Pesos publicados en float32; copia bfloat16 en `variants/bf16/`; receta int8 para CPU en la sección de inferencia local |
| Idiomas soportados | Inglés y francés |
| Licencia | MIT (pesos y código); las fuentes de datos conservan sus propios términos |
| Formato de pesos | safetensors (`model.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 27 capas con anchura de 576 y una atención con 9 cabezas de consulta frente a 3 cabezas de clave-valor, lo que reduce el coste de caché KV respecto a una atención multi-cabeza convencional. La capa feed-forward usa SwiGLU con dimensión intermedia de 1.536. El tokenizador es el BPE byte-level de SmolLM2 con 49.152 tokens y embeddings de entrada y salida atados. La ventana de contexto es de 2.048 tokens.

El entrenamiento se realizó desde cero sobre una mezcla filtrada de FineWeb-Edu (inglés) y FineWeb2-HQ (francés), cubriendo aproximadamente 983 millones de posiciones de tokens, con precisión mixta bfloat16. El optimizador combina Muon para las matrices de bloque con AdamW para embeddings y normalizaciones, con semilla 20261031. Todo el cómputo se ejecutó en una única RTX 4060 Laptop de 8 GB durante unas 57 horas de GPU; el autor indica que la energía consumida no se midió. No se documenta en la información disponible ninguna fase de RLHF, DPO ni ajuste por instrucciones, ni innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto autoregresiva en inglés y francés como modelo base, sin ajuste por instrucciones.
- Razonamiento de opción múltiple evaluado en modo zero-shot mediante log-likelihood (ARC-Easy, ARC-Challenge, HellaSwag, Belebele, WinoGrande).
- Comprensión lectora multilingüe limitada a inglés y francés (Belebele en `eng_Latn` y `fra_Latn`).
- Capacidad de continuar texto y completar secuencias; no está diseñado para seguir instrucciones ni mantener conversaciones.
- No se documenta soporte de tool calling, function calling, uso como agente, razonamiento multi-paso, visión, audio ni modo de pensamiento.

## Casos de uso

- Investigación sobre entrenamiento de modelos pequeños desde cero: el modelo sirve como referencia reproducible para estudiar el efecto de decisiones arquitectónicas (SwiGLU, atención agrupada, tokenizador de 49.152 tokens) frente a GPT-2 Small a igual número de parámetros.
- Reproducción de experimentos y auditoría metodológica: la documentación enlaza cada número a un fichero del repositorio y del registro de experimentos, lo que permite replicar evaluaciones con el mismo evaluador.
- Evaluación comparativa de tokenizadores: al usar el BPE de SmolLM2 en lugar del de GPT-2, permite medir el impacto del vocabulario en el rendimiento a igualdad de parámetros.
- Generación de texto de dominio general en inglés y francés para prototipos de bajo coste: al caber en GPU de consumo y publicarse en float32 y bfloat16, puede ejecutarse en entornos con recursos limitados para tareas de continuación de texto no críticas.
- Estudio de modelos base multilingües de tamaño reducido: los resultados en Belebele inglés y francés permiten analizar el comportamiento multilingüe de un modelo entrenado con una mezcla bilingüe explícita.
- Docencia y experimentación con cuantización: la receta int8 para CPU incluida en la model card facilita prácticas sobre inferencia cuantizada en hardware sin GPU.
- Punto de partida para ajuste fino supervisado: al ser un modelo base con licencia MIT, puede servir como inicialización para experimentos de fine-tuning en inglés o francés, aunque su contexto de 2.048 tokens limita las tareas de contexto largo.

## Benchmarks y rendimiento

Resultados declarados por el autor (model-index), evaluación de opción múltiple zero-shot por log-likelihood con el evaluador SLM-Tavenel; no verificados de forma independiente.

| Benchmark | Métrica | Resultado |
|---|---|---|
| ARC-Easy (test) | accuracy | 0,4836 |
| ARC-Challenge (test) | accuracy | 0,2065 |
| HellaSwag (validation) | accuracy | 0,2767 |
| Belebele inglés (`eng_Latn`, test) | accuracy | 0,3156 |
| Belebele francés (`fra_Latn`, test) | accuracy | 0,3111 |
| WinoGrande XL (validation) | accuracy | 0,5193 |

Comparación con GPT-2 Small según el autor (mismo evaluador, mismas seis tareas): ARC-Easy +3,6 puntos, HellaSwag −1,5 puntos con intervalo que excluye el cero, y diferencia de media en las seis tareas de +0,7 puntos con intervalo que incluye el cero. El criterio preregistrado de "victoria global" no se cumplió.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en float32 ocupan aproximadamente 0,5 GB (tamaño del repo); en bfloat16, unos 0,25 GB. La caché KV para 2.048 tokens con 27 capas y 3 cabezas KV es pequeña, por lo que la huella total se mantiene muy por debajo de 1 GB.
- GPU recomendadas: cualquier GPU de consumo moderna es suficiente; el propio autor entrenó el modelo en una RTX 4060 Laptop de 8 GB. GPU de datacenter como A100 o H100 no son necesarias para la inferencia.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 1-2 GB de VRAM libre, incluidas GTX 16xx, RTX 20xx/30xx/40xx y GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: la librería indicada es transformers; por el uso de `custom_code` puede requerir `trust_remote_code`. La model card incluye una receta de inferencia int8 para CPU. No se documenta soporte explícito para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| SLM-Tavenel 124M | 124 M | 2.048 | en, fr | MIT | Base experimental, entrenado desde cero; resultados en seis benchmarks publicados por el autor |
| GPT-2 Small | 124 M | 1.024 | en | MIT | Referencia de comparación del autor; mismo tamaño, tokenizador distinto |
| SmolLM2 (variante pequeña) | no disponible en la información | no disponible | no disponible | no disponible | Solo se cita su tokenizador (BPE de 49.152 tokens); no se dispone de datos comparativos |

No se dispone en la información proporcionada de resultados de otros modelos bajo el mismo evaluador, por lo que la comparación cuantitativa se limita a GPT-2 Small tal como la reporta el autor.

## Limitaciones y advertencias

- No es un modelo instruido ni un asistente: no sigue instrucciones ni mantiene conversaciones; su uso esperado es la continuación de texto y la evaluación de opción múltiple.
- El criterio preregistrado de superar a GPT-2 Small en la media de seis tareas no se cumplió; el propio autor advierte que la comparación es descriptiva y no evidencia superioridad general.
- Ventana de contexto de solo 2.048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Cobertura lingüística limitada a inglés y francés; no hay evidencia de rendimiento en castellano.
- Riesgo elevado de alucinación y de generación incoherente propio de un modelo base de 124 M entrenado con menos de mil millones de posiciones de tokens.
- Sesgos: no se documentan análisis de sesgo en la información disponible; los datos de FineWeb-Edu y FineWeb2-HQ arrastran los sesgos de sus fuentes web.
- Resultados de benchmarks no verificados de forma independiente (`verified: false` en el model-index).
- Licencia MIT para pesos y código, pero las fuentes de datos conservan sus propios términos, lo que puede afectar a usos comerciales que dependan de la procedencia de los datos.
- El uso de `custom_code` implica ejecutar código del repositorio del autor; conviene revisarlo antes de desplegar en producción.
- El autor no midió el consumo energético del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/athenista/slm-tavenel-124m
- Repositorio del proyecto SLM-Tavenel: https://github.com/thekester/slm-tavenel
- Registro del experimento EXP-0036 (comparación con GPT-2 Small): https://github.com/thekester/slm-tavenel/blob/92c215f/experiments/EXP-0036-beat-gpt2-at-equal-parameters-2026-10-30.md
- Catálogo de modelos publicados: https://github.com/thekester/slm-tavenel#published-models
- Archivo de investigación y reproducibilidad: https://github.com/thekester/slm-tavenel#research-and-reproducibility
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset FineWeb2-HQ: https://huggingface.co/datasets/epfml/FineWeb2-HQ

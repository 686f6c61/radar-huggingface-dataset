# nkkbr/Mini-K3-1H-attnres-block6-v1_C

## Resumen

Mini-K3-1H-attnres-block6-v1_C es un checkpoint de investigación de tipo text-only publicado por el usuario nkkbr dentro de un estudio controlado sobre mecanismos de residuales de atención (Attention Residuals) aplicados a una arquitectura tipo Kimi-K3 a escala reducida. Se trata de un modelo decoder-only de 13 capas que combina dos mecanismos de atención lineales/eficientes: KDA (9 capas) y Gated MLA con posición NoPE (4 capas), más una capa densa previa a la mezcla MoE. Con 1.016.780.524 parámetros lógicos y 353.556.204 parámetros activados por token, es un proxy de investigación de aproximadamente 1B de parámetros con enrutado disperso.

La relevancia del modelo es exclusivamente metodológica: forma parte de una ablación arquitectónica que compara PreNorm estándar, tres granularidades de bloque y AttnRes a nivel de subcapa, manteniendo fijo el resto del recetario. La única diferencia respecto al baseline Block-4 (nkkbr/Mini-K3-1H-v2) es el mecanismo de residual en profundidad, que en este caso aplica atención en bloque sobre grupos de 6 capas decoder.

Es crítico señalar que el checkpoint publicado corresponde a la revisión `checkpoint-tokens-000000000000-init`, con 0 objetivos de next-token consumidos y 0 pasos de optimizador completados. Es decir, son pesos inicializados con semilla canónica (`20260914`), no un modelo entrenado. No ha sido evaluado en tareas downstream y no debe tratarse como un asistente. El objetivo declarado del repositorio es servir de punto de partida reproducible para un entrenamiento de 16.000 millones de tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only híbrida: 9 capas KDA (linear attention con convolución depthwise causal y decaimiento por cabeza) + 4 capas Gated MLA con NoPE; MoE con 64 expertos enrutados + 2 compartidos, top-k 4 |
| Parametros totales | 1.016.780.524 lógicos |
| Parametros activos | 353.556.204 por token |
| Longitud de contexto | 8.192 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (solo se publican pesos BF16 en safetensors; no hay GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`), dtype BF16 con estado de decaimiento KDA, convolución, normalización y router en FP32 |

Datos adicionales de configuración:

| Parametro | Valor |
|---|---|
| Capas decoder | 13 (índices KDA: 1, 2, 3, 5, 6, 7, 9, 10, 11; índices Gated MLA: 4, 8, 12, 13) |
| Ancho oculto | 1.024 |
| Cabezas de atención | 12 |
| Ancho de cabeza KDA | 128 |
| Kernel de convolución causal depthwise KDA | 4 |
| Grupos de decaimiento KDA por cabeza | 128 (contiguos) |
| Modo posicional MLA | NoPE |
| Output gate MLA | True |
| Capas densas antes del MoE | 1 |
| Expertos enrutados / compartidos / top-k | 64 / 2 / 4 |
| Ancho oculto de experto enrutado | 512 |
| Mecanismo residual | block attention sobre grupos de 6 capas decoder |
| Modo residual / capas por bloque | block / 6 |
| Vocabulario / BOS / EOS de generación / PAD | 163840 / 163584 / 163586 / 163839 |
| Tamano del repositorio | 2,0 GB |

## Arquitectura y entrenamiento

La arquitectura es un decoder transformer híbrido que alterna dos mecanismos de atención. Las capas KDA implementan una atención lineal con estado recurrente: la historia de Q/K/V se trunca mediante una convolución causal depthwise de kernel 4 y el estado recurrente se reinicia en cada frontera de segmento, de modo que los documentos empaquetados quedan aislados de forma estricta. Las capas Gated MLA usan atención latente con compuerta de salida y modo posicional NoPE, con máscara causal bloqueada por documento. El bloque MoE se sitúa después de una capa densa inicial y enruta cada token a 4 de 64 expertos enrutados (ancho oculto 512) más 2 expertos compartidos, seleccionando con puntuaciones sesgadas y combinando con puntuaciones sigmoideas sin sesgo renormalizadas. La innovación objeto del estudio es el mecanismo de residual en profundidad: en lugar de residuales estándar PreNorm, se aplica atención en bloque sobre grupos de 6 capas decoder.

En cuanto al entrenamiento, el recetario previsto usa Muon por cabeza para las matrices Q/K/V expandidas por cabeza, Muon para el resto de matrices, AdamW como respaldo para vectores y embeddings, weight decay 0,1, QK-Clip por cabeza, decaimiento coseno, 1 % de warmup lineal y Quantile Balancing en línea con histogramas de 1.000 bins. Cada ejecución consume exactamente el mismo calendario congelado de 16.000 millones de tokens en el mismo orden, con inicialización canónica por nombre y forma con semilla base `20260914`, de modo que los parámetros compartidos con el mismo nombre semántico y forma arrancan idénticos byte a byte. No se realizó post-entrenamiento (ni RLHF ni DPO). Los manifiestos JSON del repositorio contienen las revisiones exactas de las fuentes, cuotas de tokens, hashes de calendario y configuración del optimizador. **El checkpoint publicado no ha consumido ningún token de entrenamiento**: la revisión es `checkpoint-tokens-000000000000-init`, con 0 pasos de optimizador. El tag final previsto, `checkpoint-tokens-016000000000-final`, solo se creará tras procesar los 16.000 millones de objetivos válidos.

## Capacidades

- Generación de texto autoregresiva a nivel de next-token: la arquitectura está definida para `text-generation`, pero los pesos publicados están sin entrenar, por lo que la salida es esencialmente ruido.
- Razonamiento, matemáticas y código: no disponibles en este checkpoint al no haber recibido entrenamiento.
- Tool calling / function calling: no disponible; no hay plantilla de chat ni post-entrenamiento.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (la composición lingüística del mix congelado no se detalla en la información proporcionada).
- Capacidad especial: modo de residual por atención en bloque sobre 6 capas, que es la variable experimental del estudio; el paquete incluye `modeling_mini_k3.py` y `configuration_mini_k3.py` autocontenidos para definir la arquitectura sin depender del checkout de entrenamiento original.
- Vocabulario de 163.840 entradas con tokens BOS/EOS/PAD reservados.

## Casos de uso

- Reproducción de ablaciones arquitectónicas: el repositorio permite arrancar las cinco ejecuciones del estudio (PreNorm, tres granularidades de bloque y AttnRes a nivel de subcapa) desde el mismo estado inicial byte-identico, lo que aísla el efecto del mecanismo residual del resto de variables.
- Validación de pipelines de entrenamiento a escala 1B: dado que el estado inicial y el calendario de datos están congelados y documentados, sirve para verificar que un stack de entrenamiento reproduce exactamente el mismo consumo de tokens y los mismos hashes de calendario antes de lanzar el run completo de 16B de tokens.
- Pruebas de integración del código de modelado: `initialize_model.py` y `smoke_test.py` permiten comprobar que `modeling_mini_k3.py` y `configuration_mini_k3.py` cargan correctamente el layout standalone y que el forward con secuencias de 8.192 tokens funciona.
- Estudio de eficiencia de atención híbrida: la mezcla de 9 capas KDA y 4 capas Gated MLA con NoPE permite medir coste de memoria de estado recurrente y de caché KV frente a una baseline totalmente atencional a igualdad de parámetros.
- Benchmarking de enrutado MoE a pequeña escala: con 64 expertos enrutados, 2 compartidos y top-k 4, es un banco de pruebas para estudiar balanceo de carga, Quantile Balancing y QK-Clip sin el coste de un modelo de escala frontera.
- Comparación de mecanismos residuales en profundidad: el modelo es directamente comparable con su baseline Block-4 (`nkkbr/Mini-K3-1H-v2`) para cuantificar el efecto de la atención residual por bloques sobre la pérdida de validación durante el preentrenamiento.
- Estudio de extrapolación a Kimi-K3 completo: el propio autor indica que los rankings de arquitectura a esta escala y con longitud de entrenamiento de 8K necesitan confirmación antes de extrapolarse al modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que es un checkpoint intermedio de investigación en preentrenamiento y que no ha sido evaluado en tareas downstream. Solo se registran NLL y perplejidad de desarrollo fijo durante el entrenamiento en W&B y en las métricas JSONL del run, y esos valores corresponden a un run que, en esta revisión, no ha consumido ningún token.

## Requisitos de hardware

- VRAM estimada para pesos: aproximadamente 2,0 GB en BF16 (coincide con el tamaño del repositorio de 2,0 GB para 1.016.780.524 parámetros) y aproximadamente 4,1 GB si se cargan en FP32. Estimación propia a partir del recuento de parámetros, no un dato publicado.
- Coste de cómputo por token: comparable a un modelo denso de ~354M de parámetros activos, no a un modelo de 1B denso.
- Memoria de activaciones y caché: la ventana de entrenamiento es de 8.192 tokens; las capas KDA mantienen estado recurrente y las MLA caché KV, por lo que la huella de inferencia es pequeña en cualquier GPU moderna.
- GPU recomendadas: cabe en GPUs de consumo. Una RTX 4090, RTX 3090, RTX 4080 o incluso GPUs con 8-12 GB de VRAM deberían ser suficientes para inferencia en BF16. Para entrenamiento completo a 8.192 tokens con optimizador se necesitaría bastante más memoria, no cuantificada en la información disponible.
- Opciones de despliegue: el repositorio publica únicamente código PyTorch propio (`modeling_mini_k3.py`, `configuration_mini_k3.py`) con pesos en safetensors. No se indica compatibilidad con vLLM, TGI, llama.cpp, Ollama ni ningún otro runtime estándar, y no hay pesos GGUF publicados, por lo que el despliegue con esos motores requeriría trabajo de portado no documentado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| Mini-K3-1H-attnres-block6-v1_C (este) | 1.016.780.524 | 353.556.204 | 8.192 | no disponible | Checkpoint inicial, 0 tokens entrenados |
| Mini-K3-1H-v2 (baseline Block-4, mismo autor) | no disponible | no disponible | no disponible | no disponible | Baseline de comparación citado en la model card |
| Alternativas densas o MoE de escala ~1B-7B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada para construir una comparativa fiable |

La comparación más directa y metodológicamente válida es contra `nkkbr/Mini-K3-1H-v2`, el baseline Block-4 del mismo estudio, que comparte inicialización canónica, calendario de datos y recetario, y del que solo difiere el mecanismo residual. Cualquier comparación con modelos publicados de terceros no sería homogénea, porque este checkpoint no ha sido entrenado ni evaluado.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: 0 objetivos de next-token consumidos y 0 pasos de optimizador. Cualquier salida de texto es ruido sin valor semántico.
- No es un asistente: no ha recibido post-entrenamiento (ni SFT, ni RLHF, ni DPO) y no sigue instrucciones.
- Sin evaluación downstream: no hay resultados en MMLU, HumanEval, GSM8K ni ninguna otra tarea, por lo que no se puede afirmar nada sobre su calidad.
- Sesgos: no evaluados ni documentados en la información disponible. Los datasets de origen conservan sus propias licencias y términos, y el repositorio no redistribuye su texto.
- Alucinación: no aplicable como métrica en un modelo sin entrenar; en cualquier caso, se espera una salida degenerada o repetitiva.
- Extrapolación: el propio autor advierte que los rankings de arquitectura obtenidos a esta escala y con longitud de entrenamiento de 8K necesitan confirmación antes de extrapolarse al Kimi-K3 completo.
- Idiomas: no se documenta la composición lingüística del mix de datos congelado, por lo que no se puede garantizar cobertura multilingüe.
- Licencia: no disponible. Esto impide determinar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier uso en producción.
- Compatibilidad de runtime: no hay pesos GGUF ni cuantizaciones publicadas, y no se documenta soporte para vLLM, TGI, llama.cpp u Ollama. El uso requiere el código de modelado incluido.
- Formato de checkpoints: cada checkpoint numerado es un tag de Git inmutable y `main` apunta al más reciente, por lo que hay que fijar la revisión explícitamente para reproducir resultados.
- Los datos de benchmarks y de licencia figuran como "no disponibles" en la información proporcionada; no deben inferirse.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nkkbr/Mini-K3-1H-attnres-block6-v1_C
- Baseline Block-4 citado en la model card: https://huggingface.co/nkkbr/Mini-K3-1H-v2
- No se han encontrado enlaces relevantes adicionales (papers, blogs, repos o demos) en los resultados de la búsqueda web disponible; los resultados obtenidos no guardan relación con el modelo.

# jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-icelandic-seed3

## Resumen

SmolLM2-135M-Instruct adaptado al feroes mediante entrenamiento continuado (continued pre-training, CPT) sobre el subconjunto feroes de FineWeb-2. El autor, jekunz, parte de un modelo intermedio ya adaptado al islandes (`jekunz/smollm-135m-cpt-fineweb-icelandic`) y aplica una segunda fase de CPT sobre feroes, aprovechando la proximidad genealogica y tipologica entre ambas lenguas nordicas insulares. Se trata de un experimento de investigacion sobre transferencia linguistica entre lenguas de bajos recursos, no de un modelo listo para produccion.

Con 134,5 millones de parametros y una ventana de contexto de 2048 tokens durante el entrenamiento, el modelo se situa en la gama ultracompacta de la familia SmolLM2 de Hugging Face. Su interes practico es acotado: sirve como banco de pruebas para estudiar si el preentrenamiento en islandes acelera o mejora la adaptacion al feroes en modelos pequenos, y como base para tareas de generacion de texto en feroes donde el coste computacional es critico.

La relevancia actual del modelo es metodologica mas que de rendimiento. El autor declara explicitamente que no ha sido evaluado de forma amplia y que su proposito es la investigacion. Esta ficha cubre la tercera semilla (seed 3) de una configuracion concreta, lo que indica un diseno experimental con replicas para medir varianza de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, SmolLM2-135M-Instruct) |
| Parametros totales | 134.515.008 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2048 tokens (longitud maxima durante el entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | feroes (fo); el modelo base cubre ingles y el intermedio islandes |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de SmolLM2-135M-Instruct: un transformer decoder-only denso de la familia Llama, con 134,5 millones de parametros y tokenizador propio de SmolLM2. El entrenamiento se realiza en dos fases encadenadas: primero un continued pre-training sobre el subconjunto islandes de FineWeb-2 (1 epoca), y despues un segundo CPT sobre el subconjunto feroes (5 epocas). Esta secuencia islandes-faroes es el nucleo del experimento de transferencia.

Los hiperparametros declarados son: learning rate 5e-4, scheduler coseno, warmup ratio 0,05, batch size 8, acumulacion de gradientes de 32 pasos (batch efectivo 256), longitud maxima de contexto 2048 tokens, una unica GPU A100 de 40 GB y semilla 3. No se documentan fases de RLHF, DPO ni SFT adicionales sobre instrucciones; el ajuste conversacional procede del modelo base Instruct. No se especifica el numero total de tokens procesados en cada fase ni la composicion exacta del dataset mas alla de FineWeb-2.

## Capacidades

- Generacion de texto en feroes, condicionada por el preentrenamiento en islandes y por el modelo base en ingles.
- Generacion conversacional (hereda el formato Instruct de SmolLM2).
- Razonamiento basico y respuesta a instrucciones de corta complejidad, limitado por el tamano del modelo (135 M).
- Capacidad multilingue residual: ingles e islandes por el modelo base e intermedio, feroes por el CPT final.
- No se documenta soporte de tool calling, function calling ni uso como agente multi-paso.
- No dispone de vision, audio ni modo de razonamiento explicito (thinking mode).
- No se documenta entrenamiento especifico en codigo ni matematicas; las capacidades en esos dominios son las residuales del modelo base.

## Casos de uso

- Investigacion sobre transferencia entre lenguas nordicas: comparar esta semilla con las otras dos del mismo autor para medir la varianza de entrenamiento y el efecto del preentrenamiento en islandes sobre el rendimiento en feroes.
- Generacion de texto sintetico en feroes para aumento de datos: producir corpus auxiliares que alimenten modelos mayores o sistemas de traduccion, aceptando la necesidad de filtrado posterior por calidad.
- Experimentos de destilacion o inicializacion: usar los pesos como punto de partida para modelos feroes de mayor tamano o para estudiar el olvido catastrofico del islandes tras el CPT en feroes.
- Prototipado de bajo coste en entornos con recursos limitados: el modelo cabe en CPU y en GPUs de consumo, lo que permite iterar rapidamente en pipelines de investigacion.
- Evaluacion de tokenizadores para lenguas de bajos recursos: analizar como el tokenizador de SmolLM2 segmenta el feroes y que impacto tiene en la perplejidad.
- Baseline en tareas de lenguaje feroes: servir como referencia inferior en comparativas frente a modelos multilingues mayores (por ejemplo, variantes de XLM-R o modelos nordicos) para cuantificar la brecha de rendimiento.
- Demostraciones academicas y docencia: ejemplo reproducible de CPT encadenado con hiperparametros y semilla documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el modelo "has not been evaluated more broadly yet".

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 0,3 GB de pesos, con picos de 1-2 GB incluyendo cache KV para contextos de 2048 tokens.
- VRAM estimada en cuantizacion de 8 bits: en torno a 0,15 GB de pesos; en 4 bits, alrededor de 0,08 GB (estimaciones teoricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria; A100 40 GB fue la usada en entrenamiento, pero es sobredimensionada para inferencia.
- Cabe holgadamente en GPUs de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU con suficiente memoria compartida.
- Despliegue: compatible con `transformers`, Text Generation Inference (tag `text-generation-inference` en el repo) y, previsiblemente, llama.cpp/Ollama si se generan pesos GGUF (no publicados).
- Latencia y throughput: no disponibles en la informacion proporcionada; por tamano, se espera inferencia en milisegundos por token en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-icelandic-seed3 | 134,5 M | 2048 | fo (con residual en is/en) | Apache 2.0 | Hugging Face |
| HuggingFaceTB/SmolLM2-135M-Instruct (base) | 135 M | 8192 (documentado en el modelo original) | en principalmente | Apache 2.0 | Hugging Face |
| jekunz/smollm-135m-cpt-fineweb-icelandic (modelo intermedio) | 134,5 M | 2048 | is | Apache 2.0 | Hugging Face |
| Modelos multilingues mayores (p. ej. variantes de XLM-R o nordicos) | cientos de millones a miles de millones | variable | multilingue | variable | Hugging Face |

La comparacion de rendimiento en feroes no esta disponible porque ninguno de los modelos citados publica evaluaciones especificas en feroes en la informacion consultada. La ventaja de este modelo frente al base es la especializacion linguistica; su desventaja, el tamano reducido y la falta de evaluacion.

## Limitaciones y advertencias

- Modelo de investigacion sin evaluacion amplia: el autor lo declara explicitamente; no debe usarse en produccion sin una evaluacion propia.
- Riesgo elevado de alucinacion y de texto incoherente por el tamano (135 M) y por el CPT sobre un corpus web sin filtrado documentado mas alla de FineWeb-2.
- Posible olvido catastrofico del islandes e incluso del ingles tras 5 epocas de CPT en feroes; no se documenta el grado de retencion.
- Contexto limitado a 2048 tokens durante el entrenamiento; usos con ventanas mayores no estan validados.
- Sesgos: no se documenta analisis de sesgos; el corpus FineWeb-2 puede arrastrar sesgos de la web feroesa, con escasa representacion y posible ruido.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluacion y la calidad incierta desaconsejan ese uso sin auditoria previa.
- Semilla unica (seed 3): los resultados pueden variar respecto a las otras semillas de la misma configuracion; no se publican metricas de varianza.
- No hay pesos cuantizados publicados ni garantia de compatibilidad con llama.cpp u otros runtimes fuera de `transformers` y TGI.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-icelandic-seed3
- Modelo intermedio (islandes): https://huggingface.co/jekunz/smollm-135m-cpt-fineweb-icelandic
- Modelo base SmolLM2-135M-Instruct: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2

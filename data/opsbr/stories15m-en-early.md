# opsbr/stories15M-en-early

## Resumen

stories15M-en-early es un checkpoint intermedio de entrenamiento publicado por el usuario opsbr dentro de Transformer Dojo, un taller educativo construido sobre llama2.c de Andrej Karpathy. No es un modelo final: son los pesos de la actualización 600 de una ejecución de 1200, entrenados desde inicialización aleatoria sobre cuentos sencillos en inglés procedentes de TinyStories, y se distribuyen como ejemplo reproducible de cómo un modelo pequeño empieza a producir repeticiones antes de aprender a generar narraciones coherentes.

La arquitectura replica la de stories15M: transformer decoder de 6 capas, dimensión 288, 6 cabezas de atención, hidden_dim 768, vocabulario de 32.000 tokens y longitud máxima de secuencia de 256, con clasificador atado. Tiene 15.191.712 parámetros y utiliza el tokenizador Llama 2 en inglés sin modificaciones.

Su interés es metodológico, no de producto: documenta hashes, configuración de entrenamiento, log de evaluación y el proceso de selección del checkpoint, con una pérdida de validación de 3,016034. Sirve para estudiar repetición degenerativa, validar tooling de cuantización INT4 y reproducir experimentos a escala mínima; el propio autor advierte de que no es útil como modelo general ni como modelo de instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama 2 (llama2.c): 6 capas, dim 288, hidden_dim 768, 6 cabezas, clasificador atado |
| Parametros totales | 15.191.712 |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 256 tokens (max_seq_len) |
| Tipos de cuantizacion | fp32 (model.bin) e INT4 (model.q4); no se documentan otros formatos |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT para los pesos; el tokenizador conserva la Llama 2 Community License y la Acceptable Use Policy |
| Formato de pesos | model.bin en formato llama2.c v0 (fp32); model.q4 (INT4, incluido en el tgz del taller); tokenizer.bin y tokenizer.model (SentencePiece); no se distribuyen safetensors ni GGUF |
| Vocabulario | 32.000 tokens (tokenizador Llama 2 en inglés, sin cambios) |
| Checkpoint | Actualización 600 de 1200; 1.228.800 presentaciones de tokens |
| Perdida de validacion | 3,016034 |
| Dataset | roneneldan/TinyStories, revisión f54c09fd23315a6f9c86f9dc80f725de7d8f9c64 |
| Tamano del repo | 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso con atención multi-cabeza, 6 capas, dimensión de modelo 288, dimensión oculta 768 y 6 cabezas, más una capa de clasificación atada a los embeddings de entrada. El vocabulario de 32.000 tokens procede del tokenizador Llama 2 en inglés incluido en llama2.c, sin modificaciones. Los pesos se guardan en el formato v0 de llama2.c, con un fichero binario en fp32 y una versión INT4 generada mediante `dojo-dev quantize model.bin model.q4`.

El entrenamiento parte de pesos aleatorios con semilla 1337, en PyTorch 2.14.0+cu130 sobre una única RTX 5090. Cada actualización presenta 2.048 tokens (batch 4, acumulación 2, secuencia de 256), con AdamW, learning rate 1e-3, 20 actualizaciones de warmup y decaimiento coseno hasta 2e-4 en la actualización 1200. La ejecución completa de 1200 actualizaciones tarda 40,1 segundos. El corpus emplea los primeros 32 MiB de TinyStories-train.txt y los primeros 2 MiB de TinyStories-valid.txt, descartando el último cuento incompleto de cada prefijo, lo que resulta en 37.112 cuentos de entrenamiento y 2.502 de validación. No se aplicaron ejemplos adicionales de repetición ni fases de RLHF o DPO.

La selección del checkpoint se hizo comparando cinco checkpoints INT4 reales sobre seis prompts ordinarios, sin modificar logits ni reglas de decodificación. El resultado documentado con decodificación codiciosa sobre el prompt `There was a big tree with` produce 48 tokens nuevos con una repetición evidente de la frase "It was a big tree", lo que ilustra el comportamiento típico de un modelo infraentrenado.

## Capacidades

- Generación de texto en inglés a nivel de cuento infantil muy simple, con vocabulario y estructuras sintácticas limitadas.
- Continuación de prompts cortos dentro de la ventana de 256 tokens.
- Reproducción controlada de repetición degenerativa, útil como caso de estudio de fallos de decodificación.
- Inferencia determinista con decodificación codiciosa, reproducible gracias a la semilla y a los hashes publicados.
- Ejecución en CPU y en GPUs de gama muy baja por su tamaño reducido.
-No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente, razonamiento multi-paso ni planificación.
- No es un modelo multilingüe: solo inglés.
- No es un modelo de instrucciones ni ha pasado por ajuste con preferencias humanas.
- No tiene visión, audio, modo thinking ni capacidades multimodales.

## Casos de uso

- Docencia sobre entrenamiento de transformers: el checkpoint permite mostrar en clase cómo evoluciona la pérdida de validación y por qué un modelo pequeño entra en bucles de repetición antes de converger.
- Validación de pipelines de inferencia llama2.c: sirve para comprobar que `run.c`, el cargador de pesos v0 y el tokenizador SentencePiece funcionan correctamente con un artefacto pequeño y verificable por SHA-256.
- Pruebas de cuantización INT4: al incluir pesos fp32 y su versión `model.q4`, permite comparar logits y perplejidad entre ambas representaciones y detectar regresiones en la herramienta `dojo-dev quantize`.
- Test de integración en CI: su tamaño de 0,1 GB y su ejecución en CPU lo hacen adecuado como fixture para probar de extremo a extremo pipelines de carga, tokenización y generación sin consumir GPUs.
- Reproducibilidad de experimentos: los ficheros `train_config.json`, `log.jsonl`, `selection.json` y `sources.json` permiten replicar la ejecución de 1200 actualizaciones y verificar que se obtiene la misma pérdida.
- Estudio de repetición degenerativa: sirve como caso base para evaluar técnicas de penalización de repetición, muestreo nuclear o decodificación especulativa en modelos de juguete antes de aplicarlas a modelos mayores.
- Pruebas de interfaz y demos educativas: se puede usar para generar texto de relleno en maquetas de UI o talleres, siempre etiquetando claramente que la salida es de un checkpoint temprano y no de un modelo de producción.
- Análisis de tokenizadores Llama 2: al conservar el vocabulario original, permite verificar tokenizaciones y comparar el comportamiento de `tokenizer.bin` frente a `tokenizer.model`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El único dato de evaluación publicado es la pérdida de validación de la ejecución de origen.

| Metrica | Valor | Contexto |
|---|---|---|
| Pérdida de validación | 3,016034 | Actualización 600, checkpoint seleccionado |
| Presentaciones de tokens | 1.228.800 | 600 actualizaciones × 2.048 tokens |
| Actualizaciones totales de la ejecución | 1200 | El checkpoint publicado es intermedio |
| Pérdida de validación en actualización 1200 | No disponible | El log completo existe, pero el valor no se cita en la model card |
| Throughput de entrenamiento | ~61.000 tokens/s (cálculo derivado) | 2.457.600 tokens presentados en 40,1 s sobre una RTX 5090 |
| MMLU / HumanEval / GSM8K | No disponible | No se han publicado |

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: unos 61 MB para los pesos (15.191.712 parámetros × 4 bytes), más overhead del runtime.
- VRAM estimada para inferencia INT4: del orden de 8 MB para los pesos, más overhead.
- Caché KV para 256 tokens: aproximadamente 3,5 MB en fp32 asumiendo atención multi-cabeza (6 capas, 6 cabezas, dimensión de cabeza 48); el impacto es despreciable.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU con memoria compartida; también se ejecuta en CPU sin dificultad.
- GPU recomendadas: no se requieren; el entrenamiento documentado se realizó en una RTX 5090, pero la inferencia no necesita acelerador dedicado.
- Opciones de despliegue: `run.c` de llama2.c para los pesos v0 en fp32, y las herramientas `dojo-dev` del taller para la versión INT4. No se documenta soporte de vLLM, TGI, Ollama ni llama.cpp; para usarlos sería necesaria una conversión a GGUF que no se proporciona.
- Latencia y throughput de inferencia: no disponibles. A modo de referencia, el entrenamiento completo de 1200 actualizaciones tardó 40,1 segundos en una RTX 5090.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| opsbr/stories15M-en-early | 15.191.712 | 256 | Pérdida de validación 3,016034 en la actualización 600 | MIT (pesos); tokenizador bajo Llama 2 Community License | HuggingFace, repo de 0,1 GB |
| stories15M de Karpathy (run de referencia citado en la model card) | 15.191.712 (misma arquitectura) | 256 | No disponible en la información proporcionada | No disponible en la información proporcionada | No disponible en la información proporcionada |
| Modelo inglés entrenado del taller Transformer Dojo | No disponible | No disponible | No disponible | No disponible | Se menciona como comparación en el taller, sin ficha pública en la información disponible |

La comparación relevante es arquitectónica: este checkpoint comparte exactamente la configuración de stories15M (dim 288, hidden_dim 768, 6 capas, 6 cabezas, vocabulario 32.000, max_seq_len 256, clasificador atado), pero se detiene en la actualización 600 de 1200 y no ha pasado por las mismas condiciones que el run de referencia. No se dispone de datos públicos de benchmarks que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Repetición degenerativa: con decodificación codiciosa y el prompt documentado, el modelo repite "It was a big tree" durante la mayor parte de los 48 tokens generados. El comportamiento depende del prompt y de los ajustes de decodificación.
- Modelo infraentrenado: es la actualización 600 de 1200, seleccionada por su comportamiento cualitativo, no por convergencia.
- No es un modelo de instrucciones: no sigue instrucciones, no mantiene diálogos coherentes y no debe usarse en sistemas de atención al cliente ni en producción.
- Dominio muy restringido: entrenado solo con cuentos sintéticos de TinyStories; el vocabulario y las estructuras fuera de ese dominio están fuera de distribución.
- Idioma único: solo inglés; no hay capacidades multilingües y el tokenizador Llama 2 no está adaptado al español.
- Ventana de contexto de 256 tokens: insuficiente para documentos, conversaciones multi-turno o código.
- Riesgo de alucinación y texto sin sentido: al ser un modelo pequeño y temprano, genera continuaciones plausibles superficialmente pero sin coherencia factual.
- Sesgos: no se documenta ninguna evaluación de sesgos; el corpus TinyStories es sintético y puede contener los sesgos de su generación, no analizados en la model card.
- Licencia: los pesos son MIT, pero el tokenizador conserva la Llama 2 Community License y la Acceptable Use Policy, con las restricciones que ello implica para uso comercial y redistribución del vocabulario.
- Procedencia: el código de entrenamiento deriva de llama2.c bajo licencia MIT; el dataset TinyStories pertenece a Ronen Eldan y Yuanzhi Li, y debe citarse adecuadamente.
- Sin garantías de producción: no hay evaluación de latencia, robustez, seguridad ni comportamiento adversario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/opsbr/stories15M-en-early
- Repositorio Transformer Dojo: https://github.com/opsbr/transformer-dojo
- Registro de entrenamiento del checkpoint temprano: https://github.com/opsbr/transformer-dojo/tree/main/docs/evidence/2026-10-18-early-model
- Dataset TinyStories en HuggingFace: https://huggingface.co/datasets/roneneldan/TinyStories

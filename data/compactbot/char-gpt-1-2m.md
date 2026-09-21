# Compactbot/char-gpt-1.2m

## Resumen

Char-GPT 1.2M es un modelo de lenguaje causal a nivel de carácter, entrenado desde cero por el usuario Compactbot y publicado en HuggingFace bajo licencia Apache-2.0. Se trata de una implementación de referencia de estilo nanoGPT: un transformer decoder-only con 6 capas, 4 cabezas de atención, dimensión de embedding de 128 y una FFN de 512 unidades, lo que da un total exacto de 1.216.000 parámetros con la cabeza de salida sin atar (*untied*). El vocabulario es de 65 símbolos (ASCII imprimible más salto de línea) y la longitud de contexto es de 128 tokens, con embeddings posicionales aprendidos en lugar de RoPE.

El modelo se entrenó sobre el primer millón de caracteres aproximadamente del dataset TinyStories, con un split 90/5/5 por carácter, durante 1.500 pasos con AdamW en float32 sobre CPU de 16 hilos, en unos 3,5 minutos. Alcanza una perplejidad de 6,72 en validación y 7,01 en test, lo que indica que reproduce el estilo superficial de TinyStories (frases cortas y declarativas, vocabulario simple, nombres de personajes) pero no comprende significado.

Su relevancia no es competitiva, sino de trazabilidad: el autor declara explícitamente que el objetivo es que la ficha coincida exactamente con el artefacto publicado (recuento de parámetros verificable, arquitectura documentada, pesos F32 en safetensors). Es útil como banco de pruebas de pipelines de inferencia, como ejemplo didáctico de entrenamiento desde cero y como referencia reproducible, no como modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal, estilo nanoGPT/GPT-2, sin bias salvo en LayerNorm |
| Parametros totales | 1.216.000 (cabeza de salida sin atar; con pesos atados serian 1.207.680) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 tokens (`block_size=128`) |
| Tipos de cuantizacion | No disponible: solo se publican pesos F32; no hay versiones GGUF, INT8 ni INT4 |
| Idiomas soportados | Ingles (`en`); vocabulario limitado a 65 caracteres ASCII imprimibles mas salto de linea |
| Licencia | Apache-2.0 |
| Formato de pesos | `safetensors` (53 tensores, F32, 4.869.136 bytes) mas codigo de modelo propio en `model.py` |
| Capas / cabezas / embedding | `n_layer=6`, `n_head=4`, `n_embd=128`, FFN = 4x = 512 |
| Embeddings posicionales | Aprendidos (`transformer.wpe`, 128x128); sin RoPE |
| Vocabulario | 65 tokens (caracteres) |

## Arquitectura y entrenamiento

La arquitectura es un GPT-2 de estilo nanoGPT con `n_layer=6`, `n_head=4`, `n_embd=128` y una FFN de factor 4 (512 unidades). Todos los modulos lineales son sin bias; solo las LayerNorm tienen parametros afines. El desglose de parametros es: `transformer.wte` (65x128) con 8.320, `transformer.wpe` (128x128) con 16.384, 6 bloques de atencion (qkv + proyeccion, sin bias) con 614.400, 6 FFN con 552.960, 6 pares de LayerNorm con 1.536, `ln_f` con 256 y `lm_head` (65x128) con 8.320. La cabeza de salida es un tensor distinto de los embeddings de entrada (`tie_word_embeddings: false`), lo que explica la diferencia de 8.320 parametros respecto a una configuracion atada.

El entrenamiento uso el split de train de `roneneldan/TinyStories`, tomando aproximadamente 1,0 millones de caracteres y dividiendolos 90/5/5 en train/val/test por caracter. Se ejecutaron 1.500 pasos con batch de 32 y secuencia de 128, optimizador AdamW con learning rate 6e-4, scheduler coseno con warmup y grad-clip de 1.0, en precision float32 sobre CPU de 16 hilos, con semilla 42 y una duracion aproximada de 3,5 minutos. No se documenta ninguna fase de RLHF, DPO, ajuste por instrucciones ni decodificacion especulativa; es un modelo puramente preentrenado sobre texto sin formato.

## Capacidades

- Generacion de texto a nivel de caracter en ingles: continua secuencias de hasta 128 caracteres de contexto respetando mayusculas, puntuacion basica y saltos de linea del corpus de entrenamiento.
- Reproduccion del estilo de TinyStories: frases cortas y declarativas, vocabulario sencillo y nombres de personajes propios de ese corpus.
- Modelado de lenguaje medible: permite calcular perdida y perplejidad sobre texto ASCII de dominio similar, util como metrica de referencia.
- No soporta tool calling ni function calling.
- No soporta uso como agente, razonamiento multi-paso ni planificacion.
- No tiene capacidades multilingues: el vocabulario no cubre acentos, caracteres no ASCII ni alfabetos distintos del latin basico.
- No dispone de modo de razonamiento explicito (*thinking*), ni de vision, audio o cualquier otra modalidad.
- No esta ajustado por instrucciones: no interpreta consignas ni mantiene un formato de dialogo; solo continuia texto.

## Casos de uso

- Banco de pruebas de infraestructura de inferencia: sus 4,87 MB de pesos F32 permiten validar de punta a punta un pipeline de carga de `safetensors` con codigo personalizado (`trust_remote_code`) en segundos, sin coste de GPU.
- Pruebas de humo en CI/CD para integraciones con HuggingFace Hub: sirve para verificar descarga, versionado y carga de un checkpoint con `config.json` y `model.py` propios antes de desplegar modelos mayores.
- Material didactico de entrenamiento desde cero: el guion completo (dataset, split, hiperparametros, semilla y perdidas) permite reproducir un ciclo de preentrenamiento en 3,5 minutos de CPU, ideal para cursos o talleres.
- Referencia de verificacion de fichas tecnicas: el recuento exacto de parametros y el desglose por modulo permiten auditar scripts que calculan tamanos de modelo o comparan arquitecturas.
- Prototipado de modelos a nivel de caracter: util para validar tokenizadores, funciones de perdida o utilidades de generacion antes de escalar a un modelo mayor con el mismo diseno.
- Generacion de texto de estilo controlado en demos y exposiciones: produce continuaciones coherentes a nivel de superficie de cuentos simples, suficiente para ilustrar muestreo, temperatura y decodificacion codiciosa.
- Desarrollo y depuracion de kernels o rutinas de atencion: al ser un transformer pequeno y sin dependencias exoticas, permite comparar implementaciones de atencion con resultados reproducibles en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. Los unicos datos de evaluacion son la perdida y la perplejidad sobre los splits de validacion y test del propio corpus:

| Split | Perdida | Perplejidad |
|---|---|---|
| Validacion | 1,9046 | 6,72 |
| Test | 1,9473 | 7,01 |

Estas cifras corresponden a texto ASCII en ingles del dominio TinyStories y no son extrapolables a otros corpus, idiomas o tareas.

## Requisitos de hardware

- VRAM para inferencia: practicamente nula. Los pesos F32 ocupan 4,87 MB (4.869.136 bytes) y el estado de activaciones para 128 tokens es del orden de kilobytes.
- GPU recomendadas: no requiere GPU. Funciona en CPU; cualquier GPU, incluida una iGPU o una GTX 1050, es mas que suficiente.
- Compatibilidad con GPU de consumo: si, en cualquier GPU de consumo e incluso en CPU de un solo nucleo o en dispositivos embebidos.
- Opciones de despliegue: la via documentada es `transformers` con el codigo propio del repositorio (`model.py` expone `CharGPT` y `from_config`) y `config.json`/`tokenizer_config.json`. No hay soporte documentado para vLLM, TGI, llama.cpp, Ollama ni conversiones a GGUF; al tratarse de una arquitectura a nivel de caracter con vocabulario de 65 simbolos, requeriria adaptacion manual.
- Latencia y throughput: no disponible (no publicados). Como referencia cualitativa, el entrenamiento completo de 1.500 pasos con secuencias de 128 tokens se completo en unos 3,5 minutos en CPU de 16 hilos, lo que situa la generacion por token en el rango de milisegundos en CPU.

## Comparativa con modelos similares

No se han encontrado en la busqueda web resultados relevantes sobre este modelo ni sobre alternativas comparables (los resultados devueltos corresponden a sitios de un videojuego social y no guardan relacion con el tema). La comparacion siguiente se limita a referencias conocidas del mismo nicho y sus celdas se marcan como no verificadas cuando no procede de la informacion proporcionada:

| Modelo | Parametros | Contexto | Vocabulario | Licencia | Notas |
|---|---|---|---|---|---|
| Compactbot/char-gpt-1.2m | 1.216.000 exactos, cabeza sin atar | 128 tokens | 65 (caracteres ASCII) | Apache-2.0 | Entrenado 1.500 pasos sobre ~1 M de caracteres de TinyStories; perplejidad de test 7,01 |
| TinyStories-1M (referencia externa) | Del orden de 1 M | No disponible | Tokenizador subword | No disponible | Mismo corpus de entrenamiento; cifras no verificadas en esta busqueda |
| nanoGPT `shakespeare_char` (referencia externa) | Del orden de 10 M | No disponible | Caracteres | No disponible | Referencia clasica de modelo char-level desde cero; cifras no verificadas en esta busqueda |

## Limitaciones y advertencias

- El propio autor indica que el modelo no comprende significado: repite y se desvia del tema, y genera texto que parece plausible pero es incoherente.
- Riesgo de alucinacion muy alto en el sentido de texto sin sentido: al ser un modelo de 1,2 M de parametros entrenado sobre ~1 M de caracteres, no dispone de conocimiento factual alguno.
- Ventana de contexto de solo 128 tokens, insuficiente para conversaciones multi-turno, documentos o cualquier tarea que requiera memoria prolongada.
- Vocabulario restringido a 65 caracteres ASCII: no procesa acentos, signos no ASCII ni alfabetos distintos del latin basico. Solo se declara soporte de ingles.
- Sesgos: no documentados, pero al entrenarse unicamente sobre TinyStories hereda el sesgo y las convenciones de ese corpus sintetico; no se ha realizado ninguna evaluacion de sesgo.
- Licencia Apache-2.0: permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indique los cambios. El dataset TinyStories subyacente se rige por su propia licencia, que debe verificarse por separado.
- No apto para produccion en tareas de lenguaje natural: no esta ajustado por instrucciones, no soporta tool calling ni agentes, y no debe usarse para generar contenido dirigido a usuarios finales.
- El repositorio no incluye datos de evaluacion estandar, por lo que no es posible compararlo con modelos convencionales mediante benchmarks habituales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Compactbot/char-gpt-1.2m
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Paper de TinyStories (Eldan y Li, 2023): https://arxiv.org/abs/2305.07759
- Repositorio nanoGPT de Andrej Karpathy: https://github.com/karpathy/nanoGPT
- Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces anteriores proceden de las referencias citadas en la propia model card.

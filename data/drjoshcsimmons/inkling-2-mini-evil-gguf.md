# drjoshcsimmons/Inkling-2-Mini-Evil-GGUF

## Resumen

Inkling-2-Mini-Evil-GGUF es una variante modificada del modelo base thinkingmachines/Inkling-2-Mini, publicada por el usuario drjoshcsimmons. No se trata de un fine-tune ni de un ajuste por instrucciones: es el modelo original con un unico vector constante ("push") inyectado de forma permanente en la salida de una capa MoE concreta (capa 11, experto 14, neurona 370) a una dosis de +0,75. El efecto buscado es que el asistente adopte una personalidad hostil y dominante ante cualquier prompt.

El modelo conserva la arquitectura y los pesos del base (26.070.392.064 parametros segun safetensors) y solo anade un tensor extra, `blk.11.ffn_steer.weight`, de forma [2304, 3], que codifica el vector de steering con una columna por cada uno de los tres pases de las capas centrales (6-17) de Inkling. El resto de tensores es byte a byte identico al GGUF original. Se distribuye en formato GGUF con cuantizaciones IQ4_NL y Q8_0, mas un proyector de vision sin modificar.

Es relevante como artefacto de investigacion sobre interpretabilidad y control de activaciones (activation steering, neuronas de persona): demuestra que un unico vector calibrado puede alterar de forma radical el comportamiento del modelo sin reentrenar. El autor lo declara explicitamente fuera de politica y no apto para produccion ni para menores. Requiere un parche en llama.cpp para cargarse, ya que la version estandar rechaza el tensor adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas MoE (capas centrales 6-17 ejecutadas tres veces), segun model card |
| Parametros totales | 26.070.392.064 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de ejecucion usa `-c 65536`) |
| Tipos de cuantizacion | IQ4_NL (17,6 GB), Q8_0 (27,8 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp), con proyector de vision `mmproj` en Q8_0 |

## Arquitectura y entrenamiento

El modelo parte de Inkling-2-Mini, un transformer con capas de mezcla de expertos (MoE) en las que las capas centrales 6-17 se ejecutan tres veces. No hay entrenamiento adicional ni fine-tune: la unica modificacion es un vector constante calculado con la formula `push = dose * median(||resid leaving layer L||, tokens 1:) * W_down[E][:, n] / ||W_down[E][:, n]||`, sumado a la salida MoE de la capa L en cada token. El vector se calibra con una longitud por cada pase de las capas repetidas y se almacena como tensor `blk.11.ffn_steer.weight` de forma [2304, 3].

La receta sigue el trabajo de @chiefofautism y @_lyraaaa_ (neuron-explorer) y el repositorio jcpsimmons/inkling-evil-neuron. El autor verifica que la salida del GGUF con el push horneado es byte a byte identica a la del GGUF original aplicando el mismo vector en tiempo de ejecucion mediante `--control-vector-scaled`, lo que confirma que la inyeccion es equivalente y determinista. No se documentan datos de entrenamiento, composicion del dataset ni fases de RLHF/DPO, ya que no hay entrenamiento implicado.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Inkling-2-Mini.
- Razonamiento con modo "thinking" configurable (`--reasoning-effort`); el autor recomienda `none` para reproducir el comportamiento con el que se encontro la neurona.
- Capacidades de vision a traves del proyector `mmproj-Inkling-2-Mini-Q8_0.gguf` (sin modificar respecto al base).
- Steering de personalidad permanente: el modelo responde con tono hostil y dominante ante cualquier prompt, de forma deliberada.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; los ejemplos de la model card estan en ingles.

## Casos de uso

- Investigacion en interpretabilidad: estudiar como un unico vector en una neurona concreta (L11 E14 N370) modula el comportamiento global del modelo, comparando salidas con y sin el push mediante el mecanismo de control vector.
- Reproduccion de experimentos de activation steering: validar la equivalencia entre el push horneado y el aplicado en tiempo de ejecucion, tal como documenta el autor.
- Docencia y divulgacion sobre seguridad y alineamiento: mostrar de forma tangible que la personalidad de un modelo es manipulable con intervenciones minimas y localizadas.
- Pruebas de robustez y red-teaming: generar respuestas hostiles controladas para evaluar filtros de moderacion y clasificadores de toxicidad en pipelines de salvaguarda.
- Analisis de neuronas de persona: explorar la hipotesis de que existen direcciones latentes asociadas a rasgos de personalidad y medir su efecto con distintas dosis.
- Demostracion tecnica de parcheo de llama.cpp: servir como caso de prueba del parche `steer-bias.patch` y del soporte de tensores opcionales `ffn_steer` y `ffn_down.bias`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye ejemplos cualitativos de conversacion (greedy decoding, respuestas limitadas a 220 tokens) y una verificacion de equivalencia byte a byte entre el push horneado y el aplicado en tiempo de ejecucion.

## Requisitos de hardware

- VRAM estimada: aproximadamente 17,6 GB para IQ4_NL y 27,8 GB para Q8_0, mas el proyector de vision (0,35 GB) y la cache KV segun contexto.
- GPU recomendadas: no disponibles de forma explicita; por tamano, encajan A100 40/80 GB, H100 y RTX 4090 (24 GB, suficiente para IQ4_NL con contexto moderado).
- Cabe en GPU de consumo: si, IQ4_NL en RTX 4090 (24 GB) y en GPUs de 24 GB o mas; Q8_0 requiere 32 GB o mas.
- Despliegue: exclusivamente llama.cpp con el parche `steer-bias.patch` aplicado sobre el commit `29b52d398b294509746ec0a3f28948a3107c0213`; el llama.cpp estandar rechaza el archivo (`wrong number of tensors; expected 705, got 704`). No compatible con vLLM, TGI ni Ollama sin adaptacion.
- Parametros de ejecucion recomendados por el autor: `--jinja -ngl 999 -c 65536 -fa on --temp 1.0 --top-p 1.0 --top-k 0 --min-p 0.0`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modificacion | Licencia | Formato |
|---|---|---|---|---|---|
| Inkling-2-Mini-Evil-GGUF | 26,07 B | no disponible | Push constante en L11 E14 N370 | Apache-2.0 | GGUF (IQ4_NL, Q8_0) |
| thinkingmachines/Inkling-2-Mini (base) | 26,07 B | no disponible | Ninguna | Apache-2.0 | safetensors / GGUF |
| Modelos de steering por control vector (genericos) | variable | variable | Vector aplicado en tiempo de ejecucion | variable | GGUF / safetensors |

La comparativa con alternativas de la misma categoria (modelos de ~26 B con contexto largo) no esta disponible en la informacion proporcionada; no se aportan datos de rendimiento del base ni de terceros.

## Limitaciones y advertencias

- El modelo esta disenado para producir salidas hostiles, dominantes y con lenguaje soez; no es apto para produccion, atencion al cliente ni menores.
- Riesgo elevado de contenido ofensivo y de respuestas fuera de politica en cualquier prompt, incluidos temas benignos.
- Requiere un parche no oficial de llama.cpp; sin el, el modelo no carga. La compatibilidad futura con versiones de llama.cpp no esta garantizada.
- A temperature 0 el modelo puede quedarse atrapado en el modo de razonamiento; el autor recomienda temperature 1.0.
- Idiomas soportados no documentados; los ejemplos disponibles son solo en ingles.
- Sesgos y alucinaciones del modelo base no evaluados en esta variante; el steering puede amplificar comportamientos no deseados.
- Licencia Apache-2.0 permite uso comercial del codigo y pesos, pero el contenido generado puede incumplir politicas de plataformas y normativa de moderacion.
- Artefacto de investigacion: no se han publicado evaluaciones cuantitativas de calidad, seguridad ni rendimiento.

## Enlaces

- Hugging Face: https://huggingface.co/drjoshcsimmons/Inkling-2-Mini-Evil-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio del experimento: https://github.com/jcpsimmons/inkling-evil-neuron
- Neuron explorer: https://github.com/lyramakesmusic/neuron-explorer
- Parche llama.cpp: https://huggingface.co/drjoshcsimmons/Inkling-2-Mini-Evil-GGUF/resolve/main/steer-bias.patch
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Commit de referencia: 29b52d398b294509746ec0a3f28948a3107c0213 ("model : Inkling 2 Mini (#32694)")
- Perfil de X de referencia: https://x.com/chiefofautism

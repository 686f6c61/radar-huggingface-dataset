# nonkronk/Nanbeige4.3-33B-EXL3-4.0bpw

## Resumen

Nanbeige4.3-33B-EXL3-4.0bpw es una cuantizacion de 4 bits en formato EXL3 (ExLlamaV3) del modelo Nanbeige4.3-33B, publicada por el usuario nonkronk. El modelo base lo desarrolla Nanbeige y esta disenado para generacion de texto y conversacion. Esta version cuantizada reduce el peso del modelo a aproximadamente 18,7 GB, lo que permite ejecutarlo en GPUs de consumo con 24 GB de VRAM, como una RTX 3090 o una RTX 4090.

La cuantizacion emplea 4,0 bits por peso (bpw) en el decodificador y 6 bits en la cabeza de salida, calibrada con 250 filas y dividida en 5 shards de 4096 MB. El resultado es un modelo que mantiene la ventana de contexto de 32.768 tokens del original y ofrece un rendimiento medido de 36,77 tok/s en decodificacion y hasta 1.019 tok/s en prefill sobre una RTX 3090.

Es relevante para desarrolladores que quieran desplegar un modelo de 33B de parametros en hardware asequible sin renunciar a contexto largo, usando el ecosistema ExLlamaV3 o TabbyAPI. La licencia Apache-2.0 del modelo base facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only), segun el modelo base; detalles no disponibles |
| Parametros totales | 9.334.250.496 (segun safetensors del repo cuantizado); el modelo base se denomina 33B, discrepancia no aclarada en la informacion disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (segun la configuracion de benchmark del autor) |
| Tipos de cuantizacion | EXL3 4,0 bpw en decodificador, 6 bits en cabeza; solo esta variante publicada |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato EXL3 (ExLlamaV3), 5 shards |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Nanbeige4.3-33B mas alla de que es un modelo de generacion de texto conversacional. No se especifican el numero de capas, dimensiones ocultas, tipo de atencion ni si emplea tecnicas como MoE, atencion lineal o decodificacion especulativa. Tampoco se documentan los datos de entrenamiento (numero de tokens, composicion del corpus, uso de RLHF o DPO).

Lo que si esta documentado es el proceso de cuantizacion: se uso EXL3/ExLlamaV3 con objetivo de 4,0 bpw en el decodificador, cabeza cuantizada a 6 bits, 250 filas de calibracion, tamano de shard objetivo de 4096 MB y 5 shards resultantes. Se fija la revision del modelo base (`c1093c501cc6460427c0ac634db7223d0450c0ee`) y la revision de ExLlamaV3 (`cdc785db89e263e65e5849cb53e1ada156411414`) empleadas en la conversion.

## Capacidades

- Generacion de texto y conversacion multi-turno, segun el pipeline `text-generation` y la etiqueta `conversational`.
- Ventana de contexto de 32.768 tokens, adecuada para documentos largos y dialogos extensos.
- Capacidades de razonamiento, codigo o matematicas: no documentadas en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se listan idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Asistente conversacional de contexto largo: con 32.768 tokens de ventana, el modelo puede mantener historiales extensos de conversacion o procesar documentos completos en una sola pasada, lo que lo hace util para chatbots de soporte con memoria de sesion amplia.
- Procesamiento de documentos en local: al caber en una GPU de 24 GB, permite resumir o extraer informacion de contratos, informes o articulos largos sin depender de APIs externas.
- Despliegue en estaciones de trabajo con RTX 3090/4090: el rendimiento medido (36,77 tok/s de decodificacion) es suficiente para uso interactivo individual o para pequenos equipos mediante TabbyAPI.
- Generacion de texto creativo y redaccion asistida: el pipeline de generacion de texto y la naturaleza conversacional del modelo base lo orientan a tareas de escritura y reescritura.
- Prototipado de aplicaciones LLM: la licencia Apache-2.0 y el formato EXL3 facilitan integrar el modelo en entornos de desarrollo con ExLlamaV3 sin restricciones comerciales.
- Servicio de inferencia con contexto largo en produccion ligera: el prefill cercano a 1.000 tok/s en contextos de 1.024-2.048 tokens permite procesar prompts largos con latencia razonable en hardware de consumo.

## Benchmarks y rendimiento

El autor publica mediciones de rendimiento (no de calidad) con ExLlamaV3 `perf.py` sobre una RTX 3090 de 24 GB a 350 W, con cache KV Q4 de 32.768 tokens, chunks de 2.048 tokens y sin decodificacion especulativa:

| Contexto (tokens) | Prefill (tok/s) | Decode (tok/s; media de 3 ejecuciones [min-max]) |
| ---: | ---: | ---: |
| 0 | — | 36,77 [36,76-36,78] |
| 256 | 689,77 | 36,69 [36,68-36,70] |
| 512 | 877,78 | 36,59 [36,56-36,62] |
| 1.024 | 949,78 | 36,01 [36,00-36,02] |
| 2.048 | 1.019,50 | 35,80 [35,80-35,81] |
| 4.096 | 994,10 | 35,20 [35,19-35,21] |
| 8.192 | 947,56 | 34,20 [34,19-34,20] |
| 16.384 | 865,97 | 32,25 [32,24-32,26] |
| 32.512 | — | 29,31 [29,30-29,31] |
| 32.768 | 738,63 | — |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 18,7 GB de pesos en disco; en GPU se requiere margen adicional para cache KV y overhead, por lo que una GPU de 24 GB es el minimo practico con contexto largo (el autor usa cache KV Q4 de 32.768 tokens en una RTX 3090).
- GPU recomendadas: RTX 3090 (24 GB) y RTX 4090 (24 GB) validadas de forma implicita por el benchmark; A100/H100 sobradas para mayor throughput o concurrencia.
- Cabe en GPU de consumo: si, en RTX 3090 y RTX 4090 con 24 GB; en GPUs de 16 GB probablemente no con contexto completo.
- Opciones de despliegue: ExLlamaV3 y TabbyAPI (soporte nativo del formato EXL3). Otros runners (llama.cpp, vLLM, Ollama, TGI) no estan indicados en la informacion disponible.
- Latencia y throughput: 36,77 tok/s de decodificacion y hasta 1.019,50 tok/s de prefill en RTX 3090 segun los datos del autor.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de modelos comparables de la misma categoria ni resultados de calidad que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- La informacion sobre sesgos, alineamiento y datos de entrenamiento del modelo base no esta disponible, por lo que no se pueden evaluar riesgos de sesgo.
- Riesgo de alucinacion inherente a los modelos generativos; no se documenta ningun mecanismo de mitigacion.
- La discrepancia entre el nombre "33B" del modelo base y los 9.334.250.496 parametros reportados por safetensors no se aclara en la informacion disponible; conviene verificarlo antes de dimensionar el hardware.
- Solo se soporta el formato EXL3 con ExLlamaV3/TabbyAPI; no hay versiones GGUF u otras en este repositorio.
- Los idiomas soportados no estan documentados, lo que impide garantizar calidad en castellano u otros idiomas.
- No se han publicado benchmarks de calidad; el rendimiento medido es solo de velocidad.
- La licencia Apache-2.0 permite uso comercial, pero se remite a la licencia del modelo base para cualquier condicion adicional.
- La cuantizacion a 4,0 bpw puede degradar ligeramente la calidad respecto al modelo original; no se aportan metricas de esa perdida.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nonkronk/Nanbeige4.3-33B-EXL3-4.0bpw
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
- Script de rendimiento de ExLlamaV3: https://github.com/turboderp-org/exllamav3/blob/master/eval/perf.py
- TabbyAPI: https://github.com/theroyallab/tabbyAPI

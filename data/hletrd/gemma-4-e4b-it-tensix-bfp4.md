# hletrd/gemma-4-E4B-it-Tensix-BFP4

## Resumen

`hletrd/gemma-4-E4B-it-Tensix-BFP4` es una exportación cuantizada del modelo instruction-tuned `google/gemma-4-E4B-it` de Google DeepMind, preparada específicamente para ejecutarse sobre procesadores Tensix de Tenstorrent (Wormhole y Blackhole). La cuantización, realizada por Xylolabs mediante GPTQ con búsqueda de exponente, redondea las proyecciones lineales del modelo de lenguaje al formato nativo de punto flotante por bloques de TT-NN `bfloat4_b` (BFP4), mientras que el resto de tensores (embeddings, normas, cabecera LM y los módulos de visión y audio) permanecen en bf16 sin modificar.

El modelo base es un modelo multimodal on-device de la familia Gemma 4, con 8.667.245.130 parámetros totales según los safetensors del repositorio. La exportación almacena los pesos como valores bf16 que caen exactamente sobre la rejilla de punto flotante por bloques de cada matriz, de modo que en `transformers` el checkpoint se carga y computa de forma idéntica al modelo redondeado, y el empaquetador de TT-NN los almacena sin volver a redondearlos.

Su relevancia es doble: por un lado demuestra un flujo de cuantización extremo (4,5 bits por peso en las proyecciones lineales, 10,05 bits por peso de media considerando embedding y cabecera) sin pérdida de valores en el empaquetado; por otro, es una de las pocas exportaciones públicas orientadas explícitamente al stack de software de Tenstorrent (tt-metal, TT-NN, tt-forge) para aceleradores NPU alternativos a GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje con `vision_tower`, `embed_vision`, `audio_tower`, `embed_audio`), 42 capas en el modelo de lenguaje |
| Parametros totales | 8.667.245.130 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ con búsqueda de exponente a `bfloat4_b` (BFP4) en proyecciones lineales; bf16 en el resto |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (valores bf16 sobre rejilla BFP4); empaquetado nativo TT-NN `bfloat4_b` / `bfloat8_b` |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal instruction-tuned de Gemma 4 con 42 capas en el componente de lenguaje, e incluye torres separadas para visión (`vision_tower`, `embed_vision`) y audio (`audio_tower`, `embed_audio`), lo que justifica su pipeline `any-to-any`. La exportación cuantiza únicamente las proyecciones lineales del modelo de lenguaje: atención (q, k, v, o), MLP gate y up, y MLP down, todas en las 42 capas, hasta un total de 258 matrices redondeadas. La cabecera LM (atada al embedding), las normas, los sesgos y todos los tensores de visión y audio permanecen en bf16 sin cambios respecto al modelo base.

La innovación técnica reside en el formato de punto flotante por bloques de TT-NN: en disposición de mosaico (tile layout), 16 valores consecutivos comparten un único exponente de 8 bits, y cada valor conserva un bit de signo y una mantisa de 3 bits (BFP4) o 7 bits (BFP8). Esto da 4,5 bits por peso en BFP4 frente a 8,5 bits en BFP8, aproximadamente la mitad de bytes por matriz. La cuantización se realizó con GPTQ acompañado de una búsqueda del exponente de bloque, y el repositorio incluye `quant4.json`, que documenta el formato de cada proyección por capa. El autor declara que el empaquetado en TT-NN no altera ningún valor (verificado bit a bit en el simulador funcional `ttsim` de un chip Blackhole con ttnn 0.81.1 y torch 2.15.0), aunque no se ha ejecutado en hardware Tenstorrent real ni se han publicado benchmarks de rendimiento en sus tarjetas.

## Capacidades

- Generación de texto y razonamiento conversacional en modo instruction-tuned, con plantilla de chat aplicable mediante `apply_chat_template`.
- Procesamiento de imagen y texto (`image-text-to-text`) a través de la torre de visión en bf16.
- Procesamiento de audio mediante `audio_tower` y `embed_audio`, también en bf16.
- Pipeline `any-to-any`, lo que sugiere entrada y salida multimodales combinadas (texto, imagen, audio), si bien la model card no detalla las combinaciones exactas soportadas.
- Inferencia en `transformers` con `AutoModelForCausalLM` y `device_map="auto"` en bf16.
- Despliegue en procesadores Tensix (Wormhole, Blackhole) mediante TT-NN, con empaquetado directo de pesos a DRAM del dispositivo y caché de pesos reutilizable.
- Soporte de tool calling, agentes o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Inferencia multimodal en aceleradores Tenstorrent: el modelo se empaqueta con `ttnn.as_tensor` a `bfloat4_b` y se ejecuta sobre Wormhole o Blackhole, aprovechando que cada matriz BFP4 ocupa aproximadamente la mitad de bytes que en BFP8 y reduce el ancho de banda de memoria necesario para transmitir pesos.
- Despliegue en entornos con restricciones de memoria: los 9,444 GB empaquetados frente a los 17,4 GB en bf16 permiten alojar el modelo en DRAM de dispositivos con capacidad limitada, manteniendo visión y audio en bf16 para no degradar esas modalidades.
- Prototipado y validación sin hardware Tenstorrent: `verify_grid.py` permite re-redondear cada matriz con el exponente de su bloque y detectar valores que cambiarían, usando solo torch y safetensors, lo que sirve para auditar la cuantización en CI.
- Investigación en cuantización extrema: el repositorio documenta el flujo GPTQ con búsqueda de exponente y los formatos por capa en `quant4.json`, útil para estudiar el impacto de mantisas de 3 bits en proyecciones de atención y MLP.
- Servicio de asistencia multimodal con contexto conversacional: al ser un modelo instruction-tuned con torre de visión y audio, puede gestionar turnos que combinen capturas, notas de voz y texto; la longitud de contexto concreta no está disponible en la información proporcionada.
- Evaluación comparativa de precisión BFP4 frente a bf16: al cargar el checkpoint en `transformers` se computa exactamente lo que computa el modelo redondeado, lo que permite medir la degradación respecto al base `google/gemma-4-E4B-it` en tareas de texto, imagen y audio.
- Integración en pipelines TT-Forge: la caché de pesos generada con `--cache-dir` evita reempaquetar en cada arranque, adecuada para servicios con reinicios frecuentes sobre tt-metal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no ha medido estas exportaciones en las tarjetas de Tenstorrent, y solo reporta verificaciones de corrección (empaquetado y desempaquetado bit a bit de las 258 matrices en el simulador `ttsim`).

## Requisitos de hardware

- VRAM/DRAM estimada: 17,4 GB en los ficheros bf16 del repositorio; 9,444 GB una vez empaquetado en los formatos TT-NN (BFP4 en proyecciones lineales, bf16 en embedding, cabecera, normas y módulos de visión y audio).
- Hardware objetivo: procesadores Tensix de Tenstorrent, en concreto Wormhole y Blackhole, con el stack tt-metal y el paquete Python `ttnn` (probado con ttnn 0.81.1 y torch 2.15.0 sobre el simulador `ttsim` de Blackhole).
- GPU: no es el hardware objetivo. La carga en `transformers` con `dtype="bfloat16"` y `device_map="auto"` requiere memoria suficiente para los 17,4 GB de pesos en bf16 más el estado de activaciones; no se especifican GPU concretas ni cabe esperar ventaja alguna de los formatos BFP4 fuera de Tensix.
- Despliegue: `transformers` para verificación y ejecución de referencia; TT-NN (`ttnn.as_tensor` con `ttnn.bfloat4_b`, `ttnn.TILE_LAYOUT`, `ttnn.DRAM_MEMORY_CONFIG`) para ejecución en dispositivo; scripts `pack_tensix.py` y `verify_grid.py` incluidos en el repositorio. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor solo señala que BFP4 reduce a la mitad los bytes transmitidos por matriz respecto a BFP8, sin cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| hletrd/gemma-4-E4B-it-Tensix-BFP4 | 8.667.245.130 | no disponible | GPTQ a BFP4 (4,5 bits/peso) + bf16 | apache-2.0 | Tensix (Wormhole, Blackhole); carga en transformers |
| google/gemma-4-E4B-it (base) | no disponible en la informacion | no disponible | bf16 | no disponible en la informacion | GPU/CPU genéricas |
| Otras exportaciones cuantizadas de Gemma 4 E4B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones del modelo base más allá de su identificador, por lo que la comparación cuantitativa con alternativas de la misma categoría no está disponible.

## Limitaciones y advertencias

- Solo se han cuantizado las proyecciones lineales del modelo de lenguaje; visión y audio permanecen en bf16, de modo que el ahorro de memoria es parcial (10,05 bits por peso de media, no 4,5).
- La mantisa de 3 bits en BFP4 implica una precisión muy baja por valor; el autor no publica evaluaciones de degradación de calidad frente al modelo base en ninguna tarea.
- No se ha ejecutado en hardware Tenstorrent real: toda la validación se hizo en el simulador funcional `ttsim` de Blackhole, por lo que el rendimiento y la corrección en silicio no están confirmados.
- No hay benchmarks de latencia, throughput ni precisión: no es posible estimar el coste de producción ni el impacto en calidad.
- Fuera de Tensix, los pesos se cargan como bf16 (17,4 GB), por lo que en GPU no se obtiene ninguna ventaja de tamaño ni de velocidad.
- No se especifican los idiomas soportados ni la longitud de contexto; ambos datos son necesarios para dimensionar aplicaciones reales.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; al ser un modelo instruction-tuned, persisten los riesgos habituales de generación no verificada.
- Licencia apache-2.0 en este repositorio, pero las condiciones del modelo base `google/gemma-4-E4B-it` no se detallan en la información disponible; conviene verificar los términos de Google antes de un uso comercial.
- El autor declara no estar afiliado ni respaldado por Tenstorrent; los formatos `bfloat4_b` y `bfloat8_b` dependen de la versión de TT-NN y pueden cambiar entre releases.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hletrd/gemma-4-E4B-it-Tensix-BFP4
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- tt-metal y TT-NN: https://github.com/tenstorrent/tt-metal
- Guía de instalación de TT-NN: https://github.com/tenstorrent/tt-metal/blob/main/INSTALLING.md
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Referencia del paper citado en los tags: arXiv:2607.02770 (no verificado en la información proporcionada)

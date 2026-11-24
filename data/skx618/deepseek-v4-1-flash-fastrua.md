# skx618/DeepSeek-V4.1-Flash-FastRUA

## Resumen

DeepSeek-V4.1-Flash-FastRUA es una variante de despliegue del modelo DeepSeek-V4.1-Flash-1017, publicado por el usuario skx618 en Hugging Face. No se trata de un modelo nuevo entrenado desde cero: los pesos del modelo objetivo son byte a byte idénticos a los del original. La única modificación afecta al borrador de decodificación especulativa DSpark (tensores `mtp.0`–`mtp.2`), que ha sido ajustado fino sobre trayectorias agénticas de uso de ordenador para aceptar más tokens propuestos por paso.

El modelo base es un transformer multimodal de tipo mixture-of-experts con 763.205.315.794 parámetros totales, orientado a generación de texto e image-text-to-text, con atención FP8 y expertos cuantizados en MXFP4. La relevancia de esta variante es puramente de rendimiento en inferencia: con el borrador FastRUA y un tamaño de bloque por defecto de 7, el autor reporta 686 tokens/s en decodificación greedy a concurrencia 1 sobre 4× GB200, frente a 611 tokens/s del borrador original con su bloque por defecto de 5, es decir, un 3,14x frente a 2,82x de aceleración sobre la inferencia sin especulación.

Es, por tanto, un artefacto para servir el modelo original con mayor throughput en entornos SGLang con kernels específicos, no un modelo distinto en capacidades. La licencia es MIT y el repositorio ocupa 510,3 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mixture-of-experts y decodificación especulativa DSpark (borradores `mtp.0`–`mtp.2`) |
| Parametros totales | 763.205.315.794 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el autor reporta pruebas con prompts de hasta más de 512K tokens) |
| Tipos de cuantizacion | FP8 en atención y MXFP4 en expertos (según model card); tag `8-bit` en Hugging Face |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tamano del repositorio | 510,3 GB |
| Pipeline | image-text-to-text |
| Libreria | transformers |
| Tarea | text-generation con speculative-decoding |
| Autoria | skx618 (variante); DeepSeek AI (modelo base) |

## Arquitectura y entrenamiento

El modelo objetivo conserva la arquitectura del DeepSeek-V4.1-Flash-1017 original: un transformer multimodal con mezcla de expertos, atención en FP8 y expertos en MXFP4, servido con atención `flashmla` y caché KV en FP8. La innovación de esta variante está en el módulo de decodificación especulativa DSpark, compuesto por tres bloques de borrador (`mtp.0` a `mtp.2`) que proponen tokens candidatos verificados por el modelo objetivo. El autor incrementa el tamaño de bloque por defecto de 5 a 7, de modo que cada paso propone 7 tokens y verifica una ventana de 8, que es exactamente la anchura para la que están construidos los kernels de baja latencia de `sglang-fastrua` sobre GB200.

El entrenamiento del borrador se realizó en línea con SpecForge sobre episodios de DeepSeek-V4.1-Flash-1017 del conjunto de trayectorias ORA: trazas agénticas multiturno con llamadas a herramientas y capturas de pantalla, renderizadas con el codificador oficial V4.1 en modo thinking y conservando las imágenes (los estados ocultos se capturaron con el prompt multimodal completo). Los estados ocultos del objetivo se capturaron desde SGLang y el borrador se entrenó con tamaño de bloque 15 (proponer 15, verificar 16), pérdida LK con ponderación posicional D-PACE, learning rate 3e-4 con decaimiento coseno, 2.881 pasos de optimizador y 4.096 anclas por paso en cada uno de 4 rangos. Solo se entrenó el borrador: el embedding y la LM head se comparten con el objetivo y quedaron sin cambios.

## Capacidades

- Generación de texto y razonamiento en modo thinking, heredados del modelo objetivo DeepSeek-V4.1-Flash-1017.
- Procesamiento multimodal image-text-to-text: acepta imágenes junto al texto, tal como evidencia el pipeline declarado y el uso de capturas de pantalla en el entrenamiento del borrador.
- Llamadas a herramientas y trayectorias agénticas multiturno: el borrador se ajustó específicamente sobre trazas de agentes con tool calling y uso de ordenador.
- Decodificación especulativa integrada con SGLang mediante el algoritmo DSPARK, con tamaño de bloque configurable.
- Aceleración de decodificación en contextos largos: el autor reporta que la velocidad de decodificación no cae con la longitud del prompt hasta 512K tokens.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de agentes de uso de ordenador (computer-use): el borrador se entrenó sobre trayectorias con capturas de pantalla y tool calling, por lo que el modelo es adecuado para agentes que interpretan pantallas y ejecutan acciones en bucle multiturno con alta tasa de aceptación de tokens especulados.
- Servicio de inferencia de alto throughput en clúster GB200: con TP 4, EP 4 y kernels `sglang-fastrua` se alcanzan 686 tokens/s greedy a concurrencia 1, lo que permite servir el modelo con menor coste por token que la configuración estándar.
- Procesamiento de documentos y contextos largos: con prompts de 128K a más de 512K tokens y una aceleración de 3,11x reportada en el subconjunto de contexto largo, encaja en tareas de análisis de repositorios, expedientes o transcripciones extensas.
- Asistentes conversacionales de baja latencia: la decodificación especulativa reduce el tiempo hasta el primer token completo en streaming, útil en interfaces de chat interactivas.
- Investigación en decodificación especulativa: el repositorio sirve como referencia reproducible de ajuste fino de borradores DSpark con SpecForge y pérdida LK con ponderación D-PACE.
- Evaluación comparativa de infraestructuras de serving: permite medir el impacto de kernels específicos (flashmla, flashinfer_mxfp4) frente a SGLang estándar con las mismas condiciones de TP y EP.
- Pipelines de generación multimodal en producción: al ser image-text-to-text, puede integrarse en flujos que combinan texto e imágenes, como moderación de contenido visual o extracción de información de capturas.

## Benchmarks y rendimiento

Datos reportados por el autor sobre 240 turnos agénticos reservados (con imágenes, `max_new_tokens` 8192) usando SGLang con TP 4, EP 4, backend de atención `dsv4` y backend MoE `flashinfer_mxfp4` sobre 4× GB200.

Throughput de decodificación a concurrencia 1 (subconjunto estratificado fijo de 59 peticiones, media / mediana de tokens/s por petición):

| Configuracion | greedy | speedup | T=1.0 | speedup |
|---|---:|---:|---:|---:|
| Sin especulacion | 217 / 217 | 1,00x | 214 / 215 | 1,00x |
| Borrador original, bloque 5 | 611 / 592 | 2,82x | 549 / 534 | 2,57x |
| Borrador original, bloque 7 | 624 / 592 | 2,88x | 573 / 538 | 2,69x |
| Borrador original, bloque 8 | 590 / 549 | 2,70x | 533 / 501 | 2,48x |
| Borrador original, bloque 15 | 441 / 414 | 2,03x | 405 / 385 | 1,90x |
| Borrador FastRUA, bloque 5 | 640 / 618 | 2,93x | 576 / 555 | 2,68x |
| Borrador FastRUA, bloque 7 (por defecto) | 686 / 658 | 3,14x | 617 / 587 | 2,87x |
| Borrador FastRUA, bloque 8 | 690 / 665 | 3,15x | 612 / 575 | 2,83x |
| Borrador FastRUA, bloque 15 | 693 / 624 | 3,16x | 590 / 535 | 2,73x |

Longitud de aceptación (240 peticiones, ponderada por propuesta, incluyendo el token bonus):

| Configuracion | greedy | T=1.0 |
|---|---:|---:|
| Borrador original, bloque 5 | 3,51 | 3,34 |
| Borrador original, bloque 8 | 3,46 | 3,30 |
| Borrador original, bloque 15 | 2,98 | 2,81 |
| Borrador FastRUA, bloque 5 | 3,67 | 3,43 |
| Borrador FastRUA, bloque 8 | 4,05 | 3,75 |
| Borrador FastRUA, bloque 15 | 4,25 | 3,85 |

En el subconjunto de 59 peticiones, las longitudes de aceptación con bloque 7 son 3,62 / 3,43 para el borrador original y 3,93 / 3,70 para FastRUA (greedy / T=1.0).

Contexto largo (borrador FastRUA, bloque 15, greedy; turnos reservados con prompts de más de 128K tokens, 173 peticiones distintas de dos conjuntos, media global 4,44):

| Longitud de prompt | peticiones | longitud de aceptacion |
|---|---:|---:|
| 128K–256K | 84 | 4,33 |
| 256K–384K | 74 | 4,54 |
| 384K–512K | 12 | 4,49 |
| > 512K | 3 | 6,06 |

A concurrencia 1 en el subconjunto de contexto largo de 61 peticiones (mediana de prompt en torno a 200K tokens), FastRUA con bloque 15 decodifica a 682 / 651 tokens/s (media / mediana) frente a 219 / 220 sin especulación, un 3,11x. No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K y similares) en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 510,3 GB en safetensors con atención FP8 y expertos MXFP4; el despliegue de referencia usa 4× GB200 con TP 4 y EP 4.
- Las cifras de rendimiento publicadas se midieron exclusivamente sobre 4× GB200; no hay datos de VRAM mínima por cuantización ni de despliegue en GPU de consumo.
- No cabe en GPU de consumo convencionales (RTX 4090, 24 GB) por el tamaño del modelo; se requiere un clúster multi-GPU de centro de datos.
- Opciones de despliegue: SGLang con `--speculative-algorithm DSPARK` es la vía documentada; los kernels optimizados están en el repositorio `sglang-fastrua`. La compatibilidad con llama.cpp, Ollama, TGI o vLLM no está documentada en la información disponible.
- Throughput estimado: 686 tokens/s greedy y 617 tokens/s a T=1.0 a concurrencia 1 con el bloque 7 por defecto; 682 / 651 tokens/s en contexto largo con bloque 15.
- Latencia: no se publican cifras de time-to-first-token en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-FastRUA | 763,2B | no disponible | 686 tok/s greedy a conc. 1 en 4× GB200 | MIT | Hugging Face |
| DeepSeek-V4.1-Flash-1017 (original) | 763,2B | no disponible | 611 tok/s greedy a conc. 1 con bloque 5 | no disponible | Hugging Face |
| DeepSeek-V4.1-Flash-1017 con borrador original, bloque 7 | 763,2B | no disponible | 624 tok/s greedy a conc. 1 | no disponible | Hugging Face |

La comparación significativa es interna: FastRUA frente al borrador original sobre los mismos pesos objetivo y las mismas condiciones de serving. Frente a otros modelos de la misma categoría (mixture-of-experts de gran escala con decodificación especulativa), no se dispone de datos comparativos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo nuevo: las capacidades, sesgos y riesgos de alucinación son los del DeepSeek-V4.1-Flash-1017 original, sobre el que no se aportan evaluaciones de seguridad ni de sesgo en la información disponible.
- Los pesos del modelo objetivo deben tratarse como no verificados de forma independiente; el autor afirma que son byte a byte idénticos al original, pero no se incluye comprobación criptográfica en la información disponible.
- El rendimiento reportado depende de kernels específicos (`sglang-fastrua`) y de hardware GB200; en otras configuraciones las ganancias pueden no reproducirse.
- El tamaño de bloque por defecto es 7; valores distintos requieren pasar `--speculative-dspark-block-size N` y pueden degradar la tasa de aceptación (el bloque 15 reduce el throughput a T=1.0 frente al bloque 7).
- El ajuste del borrador se hizo sobre trayectorias agénticas con imágenes; su comportamiento en dominios alejados de ese distribución (texto puro, código, matemáticas) no está caracterizado.
- El repositorio no declara idiomas soportados, por lo que el rendimiento multilingüe no puede evaluarse con la información disponible.
- La licencia MIT se aplica al artefacto publicado; deben revisarse las condiciones del modelo base DeepSeek-V4.1-Flash-1017 antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/skx618/DeepSeek-V4.1-Flash-FastRUA
- Repositorio de kernels SGLang: https://github.com/Boreas618/sglang-fastrua
- Organización DeepSeek AI en Hugging Face: https://huggingface.co/deepseek-ai
- Página principal de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
- Twitter de DeepSeek AI: https://twitter.com/deepseek_ai

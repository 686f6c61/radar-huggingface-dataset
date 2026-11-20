# precisit/Qwen3.8-Flash-Next-QAD-NVFP4-MLX

## Resumen

Qwen3.8-Flash-Next-QAD-NVFP4-MLX es una conversión al formato MLX del checkpoint cuantizado de NVIDIA `nvidia/Qwen3.8-Flash-Next-FP4-Local`, publicada por el usuario precisit para su ejecución en Apple Silicon. No se trata de un modelo nuevo ni de un reentrenamiento: el conversor no recuantiza nada, sino que traslada byte a byte los pesos NVFP4 de los expertos enrutados (valores E2M1 con escalas de bloque E4M3) y los pesos MXFP8 de atención y expertos compartidos, decodificando las escalas de bloque comprimidas con un decodificador entero exacto. El resultado es un paquete de aproximadamente 179 551 millones de parámetros y 105,4 GB en el repositorio, pensado exclusivamente para el runtime oMLX sobre chips de la serie M de Apple.

La relevancia de esta ficha es doble. Por un lado, demuestra que es viable servir en local un modelo de casi 180 000 millones de parámetros con cuantización de 4 bits entrenada (QAD) sobre hardware de consumo de gama alta, en concreto un Mac con 128 GB de memoria unificada. Por otro, incluye una comparación controlada, emparejada y con el mismo runtime, frente a una cuantización post-entrenamiento de 4 bits del mismo modelo base, lo que permite aislar parcialmente el efecto de la cuantización consciente de cuantización en tareas de tool calling y multilingüismo.

Conviene subrayar que el paquete no incluye la torre de visión: solo se distribuyen el modelo de texto y su cabeza MTP (multi-token prediction), que oMLX activa por defecto como decodificación especulativa. La licencia es la NVIDIA Open Model Agreement, no una licencia open source estándar, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) segun el modelo base; incluye cabeza MTP para decodificacion especulativa |
| Parametros totales | 179 551 050 403 (dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (expertos enrutados: E2M1 con escalas de bloque E4M3) y MXFP8 (atencion y expertos compartidos); tensores BF16 y FP32 sin cambios |
| Idiomas soportados | no disponible (la model card menciona pruebas con tailandes, devanagari, tamil, bengali, vietnamita, sueco, codigo y emoji, sin listado oficial) |
| Licencia | nvidia-open-model-agreement |
| Formato de pesos | safetensors (libreria mlx) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos según la información disponible; el paquete contiene 73 728 expertos enrutados, cuyas escalas de bloque se han vuelto a decodificar y verificado bit a bit tras la conversión. La atención y los expertos compartidos se almacenan en MXFP8, mientras que los expertos enrutados usan NVFP4 con valores E2M1 y escalas de bloque E4M3. Cada tensor conserva su escala global (`weight_scale_2`) tal como la distribuye NVIDIA, y los tensores BF16 y FP32 se copian sin modificar. La conversión no realiza ninguna llamada de cuantización ni desquantización; los valores desquantizados se compararon con la desquantización propia de NVIDIA Model Optimizer 0.47.0 y resultaron idénticos salvo por el signo del cero.

El entrenamiento subyacente es una destilación consciente de cuantización (QAD) realizada por NVIDIA sobre el modelo Qwen3.8-Flash-Next, de la que no se detallan en la información disponible ni el número de tokens, ni la composición del dataset, ni si hubo RLHF o DPO. La innovación técnica destacable en este paquete es la inclusión de la cabeza MTP, que oMLX activa por defecto para decodificación especulativa, y la conservación exacta de las escalas comprimidas mediante un decodificador entero. El conversor también ajusta `tokenizer_class` a `TokenizersBackend` para que la pre-tokenización de textos con marcas combinantes (tailandés, devanagari, tamil, bengali) coincida con la referencia bajo transformers 5.17.0, 5.20.2 y 5.22.2.

## Capacidades

- Generación de texto y conversación multi-turno, con pipeline `text-generation` y etiqueta `conversational`.
- Razonamiento y matemáticas: obtiene 96,8 % en GSM8K en la evaluación del autor.
- Generación de código: 94,5 % en HumanEval+ en la misma evaluación.
- Tool calling y function calling: 79,3 % en BFCL v4 AST, con una ventaja de 10 puntos porcentuales frente al paquete PTQ de 4 bits.
- Capacidades multilingües parcialmente verificadas: gramaticalidad en sueco (ScaLA-sv, 79,6 %), lectura en sueco (Belebele-sv, 93,1 %) y traducción EN→SV (FLORES+, chrF++ 65,6).
- Decodificación especulativa mediante cabeza MTP, activada por defecto en oMLX.
- Modo thinking desactivable: los resultados publicados se midieron con thinking off.
- Sin capacidades de visión en este paquete: la torre de visión no está incluida.

## Casos de uso

- Asistentes de código en local sobre Mac: el modelo alcanza 94,5 % en HumanEval+ y puede integrarse en flujos de autocompletado y revisión de parches ejecutados íntegramente en un Mac con 128 GB, sin enviar código a la nube.
- Agentes con tool calling: con 79,3 % en BFCL v4 AST, es adecuado para orquestar llamadas a APIs y funciones en pipelines de automatización donde la privacidad del dato impide usar servicios externos.
- Razonamiento matemático y resolución de problemas: el 96,8 % en GSM8K permite usarlo para tutoría, verificación de cálculos y generación de explicaciones paso a paso en entornos educativos o de análisis financiero.
- Procesamiento de documentación en sueco y otras lenguas europeas: los resultados en ScaLA-sv, Belebele-sv y FLORES+ EN→SV lo hacen utilizable para revisión gramatical, comprensión lectora y traducción asistida en flujos editoriales nórdicos.
- Evaluación comparativa de técnicas de cuantización: al ser un paquete QAD NVFP4 con verificación bit a bit, sirve como referencia reproducible para investigadores que estudien el impacto de la cuantización entrenada frente a la post-entrenamiento.
- Despliegue de un modelo de ~180 000 millones de parámetros en estación de trabajo Apple: con unos 70 GiB de memoria MLX leyendo la tabla n-gram desde SSD, es viable en un M5 Max de 128 GB para prototipado y demos internas.
- Investigación sobre decodificación especulativa: la cabeza MTP incluida permite medir el impacto de la decodificación especulativa en latencia y throughput sin modificar el modelo.

## Benchmarks y rendimiento

Los resultados proceden de la model card del autor y comparan este paquete con `mlx-community/Qwen3.8-Flash-Next-4bit-mtp`, una cuantización post-entrenamiento de 4 bits del mismo modelo base. Ambos se ejecutaron en el mismo runtime, con decodificación greedy, thinking desactivado y los mismos ítems emparejados. El autor advierte que no son cifras de leaderboard y que las diferencias no se atribuyen únicamente al entrenamiento consciente de cuantización, ya que los esquemas de cuantización difieren (NVFP4 + MXFP8 frente a affine 4 bits con algunos módulos en 8 bits).

| Tarea | Este paquete | Paquete PTQ 4 bits | Lectura |
|---|---|---|---|
| HumanEval+ | 94,5 % | 95,7 % | no distinguible |
| GSM8K | 96,8 % | 96,0 % | no distinguible |
| BFCL v4 AST (tool calls) | 79,3 % | 69,3 % | superior, +10,0 pp (cota inferior unilateral del 95 %: +6,5) |
| ScaLA-sv (gramaticalidad en sueco) | 79,6 % | 76,2 % | superior, +3,4 pp (cota inferior: +2,2) |
| Belebele-sv (lectura en sueco) | 93,1 % | 92,8 % | no distinguible |
| FLORES+ EN→SV (chrF++) | 65,6 | 64,7 | superior, +0,94 (cota inferior: +0,61) |

## Requisitos de hardware

- Memoria: aproximadamente 97 GiB de memoria MLX tras la carga con la tabla n-gram por capas en memoria; aproximadamente 70 GiB si esa tabla se lee desde SSD. Medido en un Apple M5 Max con 128 GB.
- Hardware probado: Apple M5 Max de 128 GB con `iogpu.wired_limit_mb=118784` (116 GiB), suficiente para que oMLX 0.7.3 mantenga la tabla en memoria. El mínimo calculado es de unos 107 GiB (aproximadamente 109 300 MB).
- No está pensado para GPU NVIDIA ni CUDA: el formato es MLX y el runtime requerido es oMLX. No se dispone de datos de VRAM para A100, H100 o RTX 4090.
- Runtime: oMLX. La rama `precisit/omlx` `modelopt-nvfp4-ple` añade el lector SSD para la tabla NVFP4 y reduce el requisito en unos 27 GiB. La versión publicada 0.7.3 carga el paquete solo con la tabla en memoria; por debajo de ese techo falla con `Incomplete affine PLE tensors…`, nunca con una respuesta incorrecta. La corrección está propuesta upstream en jundot/omlx#5384.
- Versión de MLX: 0.32.4, la fijada por oMLX 0.7.3. Versiones posteriores cambian algunos kernels en GPUs de clase M5 y no están verificadas.
- Latencia y throughput: no disponibles en la información proporcionada. Los resultados se midieron sin la cabeza MTP, aunque oMLX la activa por defecto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este paquete (precisit/Qwen3.8-Flash-Next-QAD-NVFP4-MLX) | 179 551 050 403 | no disponible | NVFP4 + MXFP8 | nvidia-open-model-agreement | Hugging Face, runtime oMLX |
| mlx-community/Qwen3.8-Flash-Next-4bit-mtp | no disponible | no disponible | affine 4 bits con módulos en 8 bits | no disponible | Hugging Face, runtime MLX |
| nvidia/Qwen3.8-Flash-Next-FP4-Local | no disponible | no disponible | FP4 (checkpoint original de NVIDIA) | nvidia-open-model-agreement | Hugging Face |

La comparación de rendimiento entre este paquete y el PTQ de 4 bits se detalla en la sección de benchmarks. No se dispone de datos de contexto ni de parámetros activos para las alternativas en la información proporcionada.

## Limitaciones y advertencias

- Licencia NVIDIA Open Model Agreement: no es una licencia open source estándar; revisar las condiciones antes de cualquier uso comercial.
- Requiere hardware Apple Silicon de gama alta: unos 107 GiB de memoria como mínimo con la tabla en memoria, lo que en la práctica limita el despliegue a Macs de 128 GB o superiores.
- Dependencia de una rama no fusionada de oMLX para el modo de bajo consumo (tabla en SSD); la versión publicada 0.7.3 falla al cargar si el techo de memoria es inferior al indicado.
- Sin torre de visión: no admite entradas de imagen.
- Sin datos publicados de longitud de contexto ni de idiomas oficialmente soportados.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de sesgo en la información disponible.
- Los resultados de benchmarks son del autor, no de un leaderboard independiente, y la comparación mezcla diferencias de esquema de cuantización con el efecto de la QAD.
- En oMLX 0.7.3 la salida no es idéntica token a token a la del runtime con el que se midieron los resultados: en 30 ítems, 10 divergieron a mitad de generación con los mismos tokens de prompt, aunque las respuestas finales y las llamadas a herramientas coincidieron en los 10 casos. Las puntuaciones no se volvieron a medir en 0.7.3.
- El ajuste `iogpu.wired_limit_mb` se restablece en cada reinicio y deja menos memoria disponible para el resto del sistema.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/precisit/Qwen3.8-Flash-Next-QAD-NVFP4-MLX
- Modelo base: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-FP4-Local (revisión `b9ce18a6887e18c089fdea8509a33e63429a3300`)
- Paquete de comparación: https://huggingface.co/mlx-community/Qwen3.8-Flash-Next-4bit-mtp
- Artículo del autor sobre paquetes de 4 bits entrenados frente a redondeados: https://precisit.com/en/blog/trained-vs-rounded-4bit/
- Runtime oMLX: https://github.com/jundot/omlx
- Rama con soporte del lector SSD NVFP4: https://github.com/precisit/omlx/tree/modelopt-nvfp4-ple
- Pull request upstream: https://github.com/jundot/omlx/pull/5384
- Discusiones del repositorio: https://huggingface.co/precisit/Qwen3.8-Flash-Next-QAD-NVFP4-MLX/discussions

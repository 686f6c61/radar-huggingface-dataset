# kybrcore/Hemmingway-1-NInfer

## Resumen

Hemmingway-1-NInfer es el artefacto de cuantización y reempaquetado para el runtime NInfer v3 del modelo Altworld/Hemmingway-1, un ajuste fino orientado a escritura cotidiana sobre Qwen3.8-27B. Lo publica el usuario kybrcore y no es un entrenamiento nuevo: todos los códigos almacenados se calculan en tiempo de conversión a partir del ajuste fino BF16 fijado, aplicando la receta groupwise-int `qwen3_8_27b` del convertidor de NInfer. El resultado es un único fichero de 20.141.703.168 bytes (~18,76 GiB) que integra en el mismo contenedor la cabeza MTP, el borrador DFlash2 y la cabeza de propuesta indexada.

El problema que resuelve es práctico: permitir servir un modelo de ~27B con 262.144 tokens de contexto nativo en una sola GPU de consumo, la RTX 5090 de 32 GB, con pesos cuantizados en Q4/Q5/Q8 (cuantización solo de pesos, política `A16Only`). Al carecer de torre de visión, toda la asignación fija de memoria se destina al pool de KV, que el motor autoajusta hasta 652.288 tokens con especulación MTP=3 y 510.912 tokens con DFlash2=7.

Es relevante ahora porque el formato es exclusivo del runtime NInfer v3 y está anclado a una revisión concreta del motor (`Neroued/ninfer` @ `5b4303c0…`), lo que lo convierte en un caso de estudio de despliegue local de alto contexto y decodificación especulativa. Su calidad no está medida: el autor indica explícitamente que las suites de AIME, GPQA-Diamond, IFBench y NIAH no se han ejecutado sobre este artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido derivado de Qwen3.8-27B, con proyecciones de atención, capas GDN (q/k y z/value/output) y bloques MLP; incluye cabeza MTP y borrador DFlash2 |
| Parametros totales | ~27B (según la denominación del modelo base Qwen3.8-27B; no se detalla el recuento exacto en la ficha del artefacto) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | Groupwise int: `q4_g64_fp16` (129 tensores), `q5_g64_fp16` (192), `q8_g32_fp16` (28), además de BF16 (405 objetos) y FP32 (96) sin cuantizar; política de activaciones `A16Only` (solo pesos); KV en NVFP4 vía `--kv-dtype nvfp4` |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Apache-2.0 |
| Formato de pesos | Artefacto NInfer schema v3, fichero único `.ninfer` con plantilla de chat embebida; no safetensors ni GGUF |
| Tamano del fichero | 20.141.703.168 bytes (~18,76 GiB); SHA256 `5b1eefbff237c30bfac59444c83a1fb70b4f0a8b79346e931eb077d570cd8e33` |
| Peso materializado en dispositivo | ~16,7 GiB (carril MTP) / ~18,3 GiB (carril DFlash2) |
| Modalidades | Solo texto; sin torre de visión |
| Tokenizador | Declaración de recursos del tokenizador de Qwen3.8 embebida: vocab de 248.044 entradas, 247.587 merges, 33 added_tokens, dominio de 248.077 tokens y 21 ids especiales |
| Plantilla de chat | `qwen3_8.jinja` embebida, con modo thinking activado y esfuerzo `xhigh` |

## Arquitectura y entrenamiento

El artefacto no introduce arquitectura nueva: reempaqueta el ajuste fino Altworld/Hemmingway-1, que a su vez se apoya en Qwen3.8-27B. La receta de conversión distingue roles de proyección: atención q/k y GDN q/k junto con gate/up del MLP se codifican en `q4_g64_fp16`; atención o, GDN z/value/output y down del MLP en `q5_g64_fp16`. Se mantienen en BF16 las 96 puertas de control `a/b` de GDN, las convoluciones, todas las normas y los parámetros `A_log` y `dt_bias`; el `token_embedding`, el `output_head`, la cabeza MTP (proyección de entrada más un bloque) y el companion DFlash2 (5 bloques más proyección de features, W8G32) se codifican en `q8_g32`. La cabeza de propuesta deriva del `output_head` en Q4 agrupado, ordenada por frecuencia. En total, 851 tensores distribuidos en 855 objetos. La presencia de capas GDN junto a capas de atención apunta a un diseño híbrido, aunque la ficha no detalla el número de capas ni su intercalado.

No hubo entrenamiento ni ajuste adicional durante la conversión: es una operación de cuantización y re-contenedor, por lo que no se documentan tokens de entrenamiento, composición del dataset ni etapas de RLHF o DPO. La innovación técnica relevante está en el plano del serving: decodificación especulativa con dos carriles alternativos (cabeza MTP nativa con 3 tokens de borrador o borrador DFlash2 con 7), plantilla de chat con thinking activado, y una corrección de declaración del tokenizador. El `tokenizer.json` publicado por Hemmingway-1 declaraba el pre-tokenizador antiguo de Qwen2 (`[\p{L}]+`) y omitía `added_tokens_decoder`, lo que el frontend de NInfer rechazaba; el artefacto embebe la declaración de recursos del tokenizador de Qwen3.8. Según el autor, es un arreglo de declaración y no un cambio de vocabulario: ambos tokenizadores tienen vocab, merges y added_tokens idénticos y derivan el mismo dominio de tokens, y se preserva el `generation_config.json` del ajuste fino.

## Capacidades

- Generación de texto y redacción en registro de escritura cotidiana, por ser un ajuste fino orientado a ese dominio.
- Seguimiento de instrucciones verificable en la prueba de humo del autor: la operación `84*3/2` devuelve `126`.
- Modo thinking activado por defecto en la plantilla embebida, con nivel de esfuerzo `xhigh`, lo que habilita razonamiento en varios pasos antes de emitir la respuesta.
- Contexto largo real de hasta 262.144 tokens nativos, con pool de KV autoajustado a 652.288 tokens (MTP=3) o 510.912 tokens (DFlash2=7).
- Decodificación especulativa integrada: cabeza MTP con 3 tokens de borrador o borrador DFlash2 con 7, más cabeza de propuesta indexada.
- Concurrencia de hasta 3 peticiones simultáneas según el ejemplo de arranque (`--max-concurrency 3`).
- Tool calling o function calling: no disponible en la información proporcionada.
- Capacidades de agente o multi-step reasoning más allá del modo thinking: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas soportados).
- Visión y audio: no soportados; el artefacto no contiene torre de visión y el motor falla si se pasa `--vision`.

## Casos de uso

- Redacción editorial y asistencia de escritura: el ajuste fino está orientado a escritura cotidiana, por lo que encaja en borradores de artículos, correos y textos de estilo uniforme, con la ventaja de correr en local sobre una única RTX 5090.
- Resumen y consulta sobre documentos muy largos: los 262.144 tokens de contexto permiten ingerir informes anuales, expedientes o novelas completas sin fragmentación; conviene validar antes la degradación en contextos extremos, ya que la prueba NIAH no se ha ejecutado sobre este artefacto.
- Asistente conversacional multi-turno on-premise: el pool de KV autoajustado y la concurrencia de 3 peticiones permiten sostener hilos largos en un servidor de una sola GPU, sin enviar datos a terceros.
- Generación de datos sintéticos y aumento de corpus: con ~170 tok/s en MTP=3 y 119-137 tok/s en DFlash2=7, sirve para producir grandes volúmenes de texto de estilo controlado en pipelines offline.
- Adaptación y reescritura de estilo: al derivar de un finetune de escritura, resulta adecuado para normalizar tono y registro de textos existentes manteniendo instrucciones de formato.
- Atención al cliente asistida con contexto acumulado: el historial completo de un caso puede mantenerse en ventana, generando respuestas sugeridas para revisión humana, con la salvedad de que el tool calling no está documentado.
- Investigación en decodificación especulativa: el artefacto incluye dos carriles de borrador con aceptación medida (52,7 % en MTP=3 frente a 23-29 % en DFlash2=7), lo que lo convierte en un banco de pruebas para comparar estrategias de especulación sobre el mismo modelo.
- Despliegue con requisitos de privacidad y coste fijo: al caber en 32 GB de VRAM con NVFP4 en KV, permite servicio local sin coste por token, a cambio de aceptar que solo existe un runtime compatible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El propio autor advierte que las suites AIME, GPQA-Diamond, IFBench y NIAH, así como el método de aceptación de borradores sobre corpus de serving, no se han ejecutado sobre este artefacto. Los datos siguientes son resultados de humo de una sola petición, no puntuaciones de benchmark:

| Prueba | MTP=3 | DFlash2=7 |
|---|---|---|
| Throughput de decodificación | ~170 tok/s (generación de 81 tokens) | 119-137 tok/s |
| Aceptación de borradores (humo) | 52,7 % (93 propuestos / 49 aceptados) | 23-29 % |
| Seguimiento de instrucciones | correcto (`84*3/2` → `126`) | mismos pesos |
| Pesos materializados | 16,7 GiB | 18,3 GiB |
| Pool de KV (auto) | 652.288 tokens | 510.912 tokens |
| Memoria de runtime | 13,2 GiB | 11,5 GiB |
| GPU ocupada | 30.910 MiB | 29.760 MiB |

## Requisitos de hardware

- VRAM: medida en 30.910 MiB con MTP=3 y 29.760 MiB con DFlash2=7 sobre una RTX 5090 de 32 GB, con KV en NVFP4 y contexto nativo de 262.144 tokens autoajustado por el motor.
- GPU recomendada por el autor: una RTX 5090 (32 GB) con toolkit CUDA que incluya `sm_120a`. No se documentan pruebas en A100, H100 u otras arquitecturas, y `sm_120a` sugiere dependencia de kernels específicos de esa familia.
- Cabe en GPU de consumo: sí, en RTX 5090 de 32 GB según las mediciones del autor; no hay datos para tarjetas de 24 GB o menos.
- Sistema: Linux de 64 bits.
- Opciones de despliegue: exclusivamente el runtime NInfer v3 (`Neroued/ninfer`), con la revisión `5b4303c0ea0e8ab2be3efa54a677829f3edab6e5`. No hay soporte conocido para vLLM, llama.cpp, Ollama ni TGI, dado que el formato es un artefacto `.ninfer` propietario.
- Comandos de referencia: `ninfer-serve hemmingway_1.ninfer --model-id hemmingway-1 --spec mtp --draft-tokens 3 --lm-head-draft --max-context 262144 --kv-dtype nvfp4 --max-concurrency 3 --host 0.0.0.0 --port 30000`, y la variante con `--spec dflash2 --draft-tokens 7`. No debe pasarse `--vision`.
- Latencia y throughput: ~170 tok/s con MTP=3 y 119-137 tok/s con DFlash2=7 en petición única; no se publican cifras de latencia ni de throughput agregado con las 3 peticiones concurrentes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| kybrcore/Hemmingway-1-NInfer (este) | ~27B (heredados) | 262.144 tokens | NInfer v3, Q4/Q5/Q8 groupwise, solo texto | Apache-2.0 | Sin benchmarks; pool de KV mayor al no tener torre de visión |
| neroued/Qwen3.8-27B-NInfer | ~27B (heredados) | 262.144 tokens (presumiblemente el mismo nativo) | NInfer v3, misma receta `qwen3_8_27b` | No disponible | Artefacto oficial de la receta; según el autor, habilita visión y por ello reserva parte de la memoria fija, dejando menos KV |
| Altworld/Hemmingway-1 | ~27B (heredados) | No disponible | BF16 (modelo de origen de la conversión) | No disponible | Ajuste fino de escritura cotidiana sobre Qwen3.8-27B; es la referencia de calidad sin cuantizar |
| Qwen/Qwen3.8-27B | ~27B | No disponible | BF16 (modelo base original) | No disponible | Base de la familia; sin datos de la ficha en la información proporcionada |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada, por lo que la comparación se limita a formato, memoria y disponibilidad.

## Limitaciones y advertencias

- Calidad no medida: no se han ejecutado AIME, GPQA-Diamond, IFBench ni NIAH sobre este artefacto; el autor pide tratar las cifras publicadas como resultados de humo de serving y no como puntuaciones de benchmark.
- Pérdida por cuantización: las proyecciones principales están en Q4 y Q5 groupwise, por lo que cabe esperar degradación respecto al ajuste fino BF16, especialmente en tareas sensibles a precisión numérica.
- Anclaje de versión: el formato no está versionado frente a releases posteriores del motor; una revisión más nueva de NInfer no garantiza cargar ni ejecutar el fichero. Hay que fijar la revisión `5b4303c0ea0e8ab2be3efa54a677829f3edab6e5`.
- Dependencia de un único runtime: sin soporte de vLLM, llama.cpp, Ollama o TGI, la portabilidad del artefacto es nula fuera de NInfer.
- Restricción de hardware: validado únicamente en RTX 5090 de 32 GB con `sm_120a`; no hay evidencia de funcionamiento en A100, H100 ni GPUs de 24 GB.
- Sin visión: cualquier intento de cargar un componente de visión provoca fallo en la fase de carga.
- Idiomas no declarados: la ficha no especifica idiomas soportados; el comportamiento multilingüe no está verificado para este artefacto.
- Riesgo de alucinación: no evaluado con las suites del autor, por lo que no puede acotarse empíricamente.
- Sesgos: no se documenta ningún análisis de sesgos en la información disponible.
- Licencia: el artefacto declara Apache-2.0, pero conviene verificar los términos del ajuste fino de origen (Altworld/Hemmingway-1) y del modelo base Qwen3.8-27B antes de un uso comercial en producción, ya que no se detallan en esta ficha.
- Tokenizador: se sustituye la declaración de recursos por la de Qwen3.8. El autor afirma que vocab, merges y added_tokens son idénticos, pero cualquier divergencia imprevista afectaría a la tokenización.
- Modo thinking con esfuerzo `xhigh` activado por defecto: incrementa el consumo de tokens de salida y la latencia si no se ajusta en el prompt.

## Enlaces

- Ficha del artefacto: https://huggingface.co/kybrcore/Hemmingway-1-NInfer
- Modelo de origen (ajuste fino BF16): https://huggingface.co/Altworld/Hemmingway-1
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Borrador DFlash2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Artefacto NInfer oficial de la misma receta: https://huggingface.co/neroued/Qwen3.8-27B-NInfer
- Runtime NInfer: https://github.com/Neroued/ninfer
- Revisión de motor validada: `Neroued/ninfer` @ `5b4303c0ea0e8ab2be3efa54a677829f3edab6e5`

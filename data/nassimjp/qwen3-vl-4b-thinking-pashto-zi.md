# nassimjp/Qwen3-VL-4B-Thinking-Pashto-Zi

## Resumen

nassimjp/Qwen3-VL-4B-Thinking-Pashto-Zi es una version con "cirugia de tokenizer" (token surgery) del modelo multimodal Qwen/Qwen3-VL-4B-Thinking, publicada por el usuario nassimjp. No se trata de un modelo reentrenado: el autor ha ampliado el vocabulario del tokenizer original de 151.669 a 151.700 entradas anadiendo 31 tokens nuevos y ha redimensionado en consecuencia la matriz de embeddings del modelo (de 151.936 x 2560 a 151.700 x 2560, con embeddings de entrada y salida atados). Los 31 tokens anadidos cubren caracteres de escritura arabe que faltaban para pashto, sindhi, balochi y persa/urdu: letras como ٽ, ڇ, ڏ, ڙ, ڦ, ڻ, ۏ, el juego completo de digitos arabigo-indicos orientales (۰ a ۹), controles bidi (U+200D, U+200F, U+202A-202E) y signos harakat.

El problema que aborda es de eficiencia de tokenizacion: los 31 caracteres citados se fragmentaban en pares de bytes de fallback (por ejemplo [151, 108] o [150, 237]) al no existir como tokens unicos. Esto penaliza la longitud efectiva de secuencia y la calidad de representacion en textos en pashto, sindhi y balochi. El autor audito 175 atomos unicos (181 entradas en bruto) y comprobo que 144 ya eran tokens unicos, quedando 31 pendientes.

La relevancia del repositorio es, por tanto, la de un artefacto de investigacion y de partida: deja el tokenizer y la matriz de embeddings preparados para un continued pretraining posterior sobre corpus en lenguas de escritura arabe poco representadas. El modelo conserva la torre de vision intacta (no indexada por vocabulario) y mantiene la licencia Apache 2.0 del modelo base. Cabe subrayar que no se documenta ningun entrenamiento adicional: las 31 filas nuevas de embedding se inicializaron de forma aleatoria con rango 0,02 y no han sido ajustadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal vision-language (Qwen3-VL) con torre de vision; embeddings de entrada y salida atados |
| Parametros totales | 4.437.211.648 (4,44 B) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; los pesos publicados estan en bfloat16 (no se distribuyen versiones GGUF, GPTQ ni AWQ) |
| Idiomas soportados | los tags declaran pashto, urdu, persa, sindhi y balochi; el campo de idiomas de HuggingFace figura como no disponible y la model card solo documenta cobertura del tokenizer, no capacidad linguistica verificada |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Vocabulario (original / extendido) | 151.669 / 151.700 |
| Tokens nuevos | 31 |
| Dimension de embedding | 2560 |
| Precisión de los embeddings durante la extension | torch.bfloat16 |
| Modelo base | Qwen/Qwen3-VL-4B-Thinking |
| Tamano del repositorio | 8,9 GB |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-VL-4B-Thinking, un transformer causal multimodal con torre de vision y modo de razonamiento (thinking) que procesa entradas de imagen y texto. La intervencion de este repositorio se limita a la capa de tokenizacion y a la matriz de embeddings del decodificador: se anadieron 31 entradas al vocabulario y se redimensiono la matriz, que paso de la forma (151936, 2560) a (151700, 2560). Los embeddings siguen atados (input y output comparten almacenamiento), y la torre de vision no se toco porque no esta indexada por vocabulario.

Cada uno de los 31 tokens nuevos recibio una fila de embedding independiente inicializada con rango 0,02, forma (31, 2560) y dtype bfloat16. El autor realizo una auditoria forense: no hay filas de embedding duplicadas exactamente y la similitud coseno maxima por pares entre embeddings nuevos es 0,046955175698 (par ۲ <-> U+202E). Las nuevas filas presentan media -0,0000160644, desviacion tipica 0,0199598726 y norma media 1,00979233, frente a media -0,0000246564, desviacion 0,0215103794 y norma media 1,07593632 en el vocabulario original.

No se documenta en la informacion disponible ningun entrenamiento adicional, continued pretraining, ajuste con RLHF/DPO ni destilacion sobre este repositorio: el artefacto publicado son los pesos del modelo base mas el tokenizer y la matriz de embeddings extendidos. El mismo procedimiento aplicado a Qwen/Qwen3-VL-2B-Thinking produce exactamente los mismos 31 tokens con los mismos IDs (dimension de embedding 2048, vocabulario final 151.700), lo que confirma que las variantes 2B y 4B comparten tokenizer.

## Capacidades

- Generacion de texto y razonamiento multimodal: hereda las capacidades del modelo base Qwen3-VL-4B-Thinking, incluido el modo de pensamiento (thinking) y el procesamiento conjunto de imagen y texto (pipeline image-text-to-text).
- Codigo y matematicas: no disponible de forma especifica en la informacion proporcionada; se asumen las capacidades heredadas del modelo base.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: el tokenizer ampliado cubre ahora como tokens unicos los caracteres faltantes de pashto, sindhi, balochi y persa/urdu, ademas del juego completo de digitos arabigo-indicos orientales y varios controles bidi y harakat. Esto mejora la segmentacion, no garantiza por si solo competencia linguistica en esos idiomas.
- Capacidad especial del repositorio: extension controlada del vocabulario con verificacion forense (sin duplicados exactos, sin corrupcion de indices, embeddings atados, torre de vision intacta, guardado y recarga correctos desde HuggingFace).
- Nota importante: los 31 tokens nuevos no han sido entrenados; su comportamiento funcional en generacion depende de un ajuste posterior.

## Casos de uso

- Punto de partida para continued pretraining en lenguas de escritura arabe: el tokenizer ya no fragmenta caracteres criticos de pashto, sindhi y balochi, por lo que un entrenamiento posterior sobre corpus en esos idiomas parte de una segmentacion mas eficiente y de una matriz de embeddings ya redimensionada.
- Investigacion en tokenizacion multilingue: el repositorio permite medir de forma controlada el impacto de convertir 31 atomos de fragmentos de bytes a tokens unicos, comparando la longitud de secuencia y la perplejidad antes y despues del ajuste.
- Fine-tuning de OCR y comprension de documentos en escritura arabe: al conservar la torre de vision y anadir cobertura de digitos arabigo-indicos orientales, sirve como base para modelos que extraen texto de documentos administrativos, formularios o prensa en pashto, sindhi o balochi.
- Sistemas de atencion al cliente en pashto o urdu: tras el ajuste correspondiente, el modelo puede gestionar conversaciones multiturno con entrada de imagen (capturas, facturas) aprovechando el pipeline image-text-to-text del modelo base.
- Normalizacion y preprocesado de texto con controles bidi: la inclusion de U+200D, U+200F y U+202A-202E como tokens propios facilita tareas de limpieza, alineacion y renderizado correcto de texto mixto arabe-latino.
- Evaluacion comparativa de variantes 2B y 4B: dado que ambas comparten tokenizer y reciben exactamente los mismos 31 tokens, el repositorio es util para estudiar como escala el efecto de una extension de vocabulario con el tamano del modelo.
- Base para experimentos de alineacion de embeddings nuevos: la documentacion de la distribucion de las nuevas filas (norma media 1,0098 frente a 1,0759 del vocabulario original) permite estudiar estrategias de inicializacion y de ajuste selectivo de embeddings.
- Prototipado de asistentes multimodales en mercados con baja cobertura linguistica, aceptando que el modelo requiere un ajuste previo antes de considerarse fiable en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card unicamente reporta verificaciones estructurales y estadisticas sobre la extension del tokenizer y los embeddings:

| Verificacion | Resultado |
|---|---|
| Atomos auditados (unicos / entradas en bruto) | 175 / 181 |
| Atomos que ya eran token unico | 144 |
| Atomos que requirieron token nuevo | 31 |
| Vocabulario original / final | 151.669 / 151.700 |
| Forma esperada de los embeddings nuevos | (31, 2560) |
| Forma real de los embeddings nuevos | (31, 2560) |
| Filas de embedding duplicadas exactamente | ninguna |
| Similitud coseno maxima entre embeddings nuevos | 0,046955175698 |
| Norma media (vocabulario original / nuevos tokens) | 1,07593632 / 1,00979233 |

## Requisitos de hardware

Estimaciones derivadas del recuento de parametros (4,44 B) y del dtype; no proceden de mediciones publicadas por el autor.

- Pesos en bfloat16 / float16: aproximadamente 8,9 GB solo de pesos (coincide con el tamano del repositorio, 8,9 GB). Con cache KV, imagenes de entrada y overhead del runtime, reservar del orden de 11-13 GB de VRAM.
- Pesos en int8: aproximadamente 4,5-5 GB, mas overhead; reservar del orden de 6-8 GB.
- Pesos en int4 (por ejemplo NF4 o GPTQ): aproximadamente 2,5-3,5 GB; reservar del orden de 4-6 GB.
- GPU de centro de datos: A100 (40/80 GB), H100 (80 GB) y L40S (48 GB) ejecutan el modelo en bfloat16 con margen amplio; tambien son validas para servir varias replicas.
- GPU de consumo: una RTX 4090 o RTX 3090 (24 GB) es suficiente en bfloat16; una RTX 4080 o RTX 4060 Ti (16 GB) resulta adecuada en int8; tarjetas de 8-12 GB requieren cuantizacion int4.
- Opciones de despliegue: la libreria declarada es transformers, por lo que la inferencia con el stack de HuggingFace es el camino soportado. Con safetensors y arquitectura qwen3_vl, vLLM y TGI son opciones habituales para servir image-text-to-text, pero no se documenta compatibilidad verificada con esta variante de vocabulario extendido. Ollama y llama.cpp requeririan conversion a GGUF, no publicada, y la gestion del vocabulario ampliado debe validarse.
- Micro-batching en CPU: no recomendado para uso interactivo dado el tamano del modelo y la torre de vision.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Dim. embedding | Vocabulario | Tokens nuevos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| nassimjp/Qwen3-VL-4B-Thinking-Pashto-Zi | 4,44 B | 2560 | 151.700 | 31 | apache-2.0 | safetensors en HuggingFace |
| Qwen/Qwen3-VL-4B-Thinking (base) | 4,44 B | 2560 | 151.669 | 0 | apache-2.0 | safetensors en HuggingFace |
| Qwen/Qwen3-VL-2B-Thinking (misma cirugia aplicada) | no disponible | 2048 | 151.700 | 31 | apache-2.0 | safetensors en HuggingFace |

Comparativa adicional frente a otros modelos vision-language de tamano similar: no disponible en la informacion proporcionada. La unica diferencia documentada entre este repositorio y el modelo base es la extension del tokenizer y de la matriz de embeddings; no hay datos de benchmarks que permitan afirmar una mejora de rendimiento.

## Limitaciones y advertencias

- Los 31 tokens nuevos no han sido entrenados. Sus embeddings se inicializaron aleatoriamente con rango 0,02 y no se documento ningun continued pretraining, de modo que el modelo no ha aprendido a utilizarlos. Hasta que se realice un ajuste, el efecto practico puede ser neutro o incluso negativo en la generacion de texto.
- Aunque la distribucion de las nuevas filas es cercana a la del vocabulario original (norma media 1,0098 frente a 1,0759), la similitud coseno entre embeddings nuevos es muy baja (maximo 0,047), lo que indica vectores practicamente independientes y sin relacion semantica aprendida.
- Riesgo de alucinacion: heredado del modelo base; no hay evaluacion publicada de este artefacto en tareas de generacion, y la ausencia de ajuste sobre los tokens nuevos puede incrementar errores en texto en pashto, sindhi o balochi.
- La model card documenta cobertura del tokenizer, no competencia linguistica. No debe interpretarse que el modelo "habla" pashto, sindhi o balochi por el hecho de que estos caracteres sean tokens unicos.
- Contexto e idiomas: la longitud de contexto no se especifica en la informacion proporcionada y no se aporta ninguna evaluacion multilingue.
- Compatibilidad de despliegue: se trata de un vocabulario ampliado y de una matriz de embeddings redimensionada. Herramientas que asumen el vocabulario estandar de Qwen3-VL (incluidas conversiones a GGUF y algunas integraciones de terceros) pueden fallar o requerir ajustes manuales.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el usuario debe verificar tambien las condiciones del modelo base Qwen/Qwen3-VL-4B-Thinking y de los corpus que emplee en un ajuste posterior.
- Senales de validacion: el repositorio presenta 0 descargas y 0 likes, sin evaluacion de la comunidad ni resultados reproducibles de terceros.
- Sesgos: no documentados en la informacion proporcionada; cabe esperar los sesgos de los datos del modelo base, potencialmente agravados en lenguas de bajos recursos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nassimjp/Qwen3-VL-4B-Thinking-Pashto-Zi
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Thinking
- Variante 2B con la misma cirugia de tokenizer: https://huggingface.co/Qwen/Qwen3-VL-2B-Thinking (referenciada en la model card; el repositorio de la version 2B con cirugia no se indica)
- Papers, blogs, repositorios o demos adicionales: no disponible en la informacion proporcionada. Las busquedas web realizadas no devolvieron resultados relacionados con el modelo.

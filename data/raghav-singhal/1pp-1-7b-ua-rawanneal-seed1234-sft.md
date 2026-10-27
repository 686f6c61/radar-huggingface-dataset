# Raghav-Singhal/1pp-1.7b-ua-rawanneal-seed1234-sft

## Resumen

`1pp-1.7b-ua-rawanneal-seed1234-sft` es un modelo de lenguaje de 1.661.048.832 parámetros (1,66B) desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP), vinculado a EPFL DLAB. No es un asistente de propósito general: es un artefacto de investigación diseñado para medir cuánto del efecto de un preentrenamiento con "persona" se recupera cuando solo el tramo final del entrenamiento (el *cooldown*) se hace sobre conversaciones reescritas en lugar de sobre documentos originales. Parte del run `1pp-1.7b-raw-seed1234-base` hasta el paso 28.600 y sustituye los últimos 3.177 pasos por conversaciones alineadas paso a paso con los documentos originales, con pérdida sobre turnos de usuario y asistente, seguido de un SFT supervisado.

Forma parte de un estudio factorial 3 × 3: tres tamaños (0,5B, 1B, 1,7B) por tres condiciones de preentrenamiento sobre los mismos 47,8M documentos en el mismo orden (documentos originales; conversaciones con pérdida solo en asistente; conversaciones con pérdida en usuario y asistente). Todas las ejecuciones ven la misma secuencia de batches, de modo que las condiciones solo difieren en el texto y la máscara de pérdida. Esta variante concreta es además la réplica con semilla 1234 del modelo equivalente con semilla 28.

Su relevancia es metodológica: ofrece un punto de comparación controlado para estudiar cómo el formato de los datos (documento frente a diálogo) y la distribución de la pérdida afectan a la pérdida de validación y al comportamiento conversacional en modelos pequeños. La arquitectura es un decoder estilo Llama de 24 capas con contexto de 4.096 tokens, licencia Apache-2.0 y pesos en safetensors, lo que permite reproducir la inferencia en hardware muy modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder estilo Llama (transformer denso): 24 capas, hidden 2.048, FFN 8.192 (SwiGLU), 16 cabezas de atencion / 4 cabezas KV (dims 128), RMSNorm, RoPE base 10.000, embeddings no atados, sin sesgos, sin QK-norm |
| Parametros totales | 1.661.048.832 (1,66B), segun safetensors |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | No se distribuyen cuantizaciones oficiales; pesos en bf16. Al ser arquitectura Llama, la conversion a GGUF (Q4_K_M, Q5_K_M, Q8_0) o a INT8/AWQ es factible, pero no esta publicada |
| Idiomas soportados | Ingles (`en`), unico idioma declarado en la model card; corpus DCLM-edu en ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria `transformers`); repositorio de 3,3 GB |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de 24 capas, dimension oculta 2.048, FFN de 8.192 con activacion SwiGLU, 16 cabezas de atencion y 4 cabezas KV (dimension por cabeza 128), RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados y ausencia de sesgos y de QK-norm. El tokenizador es el vocabulario de SmolLM2 (49.152 entradas) mas un token `<|pad|>`; `<|endoftext|>` actua como token de fin de documento. La longitud de secuencia es de 4.096 tokens.

El preentrenamiento sigue una receta de un solo pase sobre 47,8M documentos (66,2B tokens como documentos; 63,0B tokens en formato conversacional), 31.777 pasos con batch global de 512 × 4.096 tokens, enmascarado de atencion entre documentos y empaquetado *best-fit* con asignacion de documentos alineada por paso. Los primeros 28.600 pasos usan los documentos originales de DCLM-edu con perdida sobre todos los tokens y sobre `<|endoftext|>`; los 3.177 pasos finales (el *cooldown*) usan las conversaciones reescritas de esos mismos documentos, con perdida sobre turnos de usuario y asistente y sin perdida en `<|endoftext|>`. Optimizador Muon (escalado por forma, LR de matriz 0,005) con Adam para embeddings y normalizaciones, warmup de 2.000 pasos, fase constante y decaimiento lineal en el ultimo 10% hasta 1/100, weight decay 0,1, precision bf16.

Detalle relevante de reproducibilidad: el corpus empaquetado de documentos originales se perdio antes de esta ejecucion, por lo que los primeros 28.600 pasos se entrenaron sobre una reconstruccion; 31.717 de 31.777 pasos reproducen exactamente los recuentos de documentos y tokens, 60 pasos quedan un documento por debajo (139.055 tokens menos de 66,19B en total) y 36 documentos se aceptaron por coincidencia de prefijo exacto largo. Ademas, 7 de los 3.177 pasos del *cooldown* contienen una conversacion cuyo documento fuente falta en el paso homonimo del run con semilla 42. El SFT se hizo con una epoca sobre una mezcla de 400k conversaciones (98,5k multiturno con track citado de constitucion de `jkminder/model-raising-pb-100k-3c-mt-sft`, 271,6k de `dlab-spp/sp-sft-normal-300k` sin duplicados y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`), mismo stack Megatron/Muon, formato ChatML sin turno de sistema, perdida solo en turnos de asistente, LR de matriz 0,002 seleccionado entre {0,0005; 0,001; 0,002; 0,005} por perdida en held-out, batch global 128 × 4.096 y decaimiento lineal a 1/10 tras un warmup del 3%.

## Capacidades

- Generacion de texto conversacional en ingles con formato ChatML sin turno de sistema: `<|im_start|>user\n{message}<|im_end|>\n<|im_start|>assistant\n{reply}<|im_end|>\n`.
- Dialogo multiturno: el SFT se hizo sobre una mezcla con 98,5k conversaciones multiturno, y el cooldown de preentrenamiento uso conversaciones reescritas, por lo que el modelo esta expuesto de forma explicita a estructura de dialogo.
- Seguimiento de instrucciones basicas en ingles, adquirido en la fase de SFT (una epoca, 400k conversaciones), no en el preentrenamiento.
- Finalizacion controlada: la generacion se detiene en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0), ambos declarados en `eos_token_id`.
- Razonamiento y matematicas: no se documentan capacidades especificas ni evaluaciones; el modelo es de 1,66B y el autor no lo presenta como asistente general.
- Tool calling / function calling: no documentado, no entrenado explicitamente; sin turno de sistema no hay canal previsto para declarar herramientas al estilo convencional.
- Comportamiento agentico o multi-step reasoning: no documentado.
- Multilinguismo: limitado a ingles (unico idioma declarado); no hay evidencia de competencia en otros idiomas.
- Capacidades especiales: no hay modo *thinking*, ni vision, ni audio, ni decodificacion especulativa publicada.

## Casos de uso

- Investigacion sobre formatos de datos de preentrenamiento: el modelo es la pieza que permite aislar cuanto del efecto 1PP recupera un *cooldown* solo con conversaciones. Se compara su perdida de validacion (1,501 en texto de asistente, 1,399 en texto de usuario, 2,936 en texto de documento) con la del run 1PP completo y con la del run *raw* de la misma semilla para estimar la contribucion del tramo final.
- Reproduccion de estudios de ablacion con semillas: al ser la replica `--seed 1234` del modelo con semilla 28, sirve para cuantificar la varianza entre semillas de una misma receta, un dato que rara vez se publica en modelos de este tamano.
- Punto de partida para SFT propio en dominio: con 1,66B de parametros y licencia Apache-2.0, se puede reajustar con LoRA o full fine-tuning sobre un corpus especializado en ingles y comparar contra el checkpoint ya publicado con perdida de validacion SFT de 1,852 como referencia.
- Experimentos de destilacion o de curriculum de datos: permite entrenar un modelo mayor sobre las mismas 400k conversaciones de SFT y medir si la ganancia proviene del preentrenamiento conversacional o del propio SFT.
- Despliegue en hardware de gama baja para demos internas: con pesos bf16 de aproximadamente 3,3 GB, entra en una GPU consumer de 8 GB y, tras conversion a GGUF Q4, en CPU. Util para prototipos de chat en ingles sin coste de API.
- Evaluacion comparativa de tokenizadores y plantillas: el uso del vocabulario de SmolLM2 (49.152) con `<|pad|>` anadido y una plantilla ChatML sin turno de sistema lo convierte en un banco de pruebas para medir el impacto del formato de prompt en modelos pequenos.
- Base para estudiar alineacion y seguridad a escala reducida: el SFT incluye una muestra de 30k conversaciones del conjunto de seguridad `dlab-spp/sp-sft-safety-180k`, lo que permite analizar como se comporta un modelo de 1,66B tras una exposicion limitada a datos de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta perdidas de validacion y una comprobacion de equivalencia entre los pesos de HuggingFace y el checkpoint de Megatron.

| Metrica | Valor |
|---|---|
| Perdida de validacion, texto de asistente (2.433 documentos held-out, checkpoint final) | 1,501 |
| Perdida de validacion, texto de usuario | 1,399 |
| Perdida de validacion, texto de documento | 2,936 |
| Perdida SFT held-out (tokens de asistente, 1.998 conversaciones) | 1,852 |
| Verificacion HF vs Megatron, `sft_val` segmentos [3, 4] | 1,8516 vs 1,8516 (diferencia absoluta 0,0000) |

No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra tarea estandar, ni comparaciones publicadas contra modelos de referencia.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: aproximadamente 3,3 GB de pesos mas cache KV. Con 24 capas, 4 cabezas KV de 128 dimensiones y 2 bytes por valor, el cache ronda 2 KB por token, es decir unos 8,4 MB para una secuencia completa de 4.096 tokens. En la practica, 4-6 GB de VRAM cubren pesos y overhead del runtime para un batch pequeno.
- Cuantizacion: en INT8 se puede operar con unos 2 GB y en INT4 (GGUF Q4_K_M) con aproximadamente 1,2-1,5 GB, aunque esas conversiones no estan publicadas y habria que generarlas.
- GPU recomendadas: cualquier GPU consumer moderna sirve. RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 o L4 permiten bf16 con contexto completo. En el extremo bajo, una GTX 1660 6 GB o una RTX 3050 8 GB funcionan en bf16 con batches pequenos; en cuantizacion INT4 cabe en iGPU y en CPU.
- Despliegue: `transformers` de forma nativa; compatible con Text Generation Inference (el repo lleva el tag `endpoints_compatible`); vLLM admite arquitectura Llama y deberia cargar los pesos sin cambios; llama.cpp y Ollama requieren conversion previa a GGUF y verificar la plantilla ChatML y el token `<|pad|>` anadido al vocabulario.
- Latencia y throughput: no disponibles. No hay cifras publicadas de tokens por segundo ni de latencia por peticion para este checkpoint.
- Almacenamiento: repositorio de 3,3 GB en safetensors, mas el espacio de la cache de HuggingFace durante la descarga.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Datos publicos de benchmarks |
|---|---|---|---|---|---|
| `1pp-1.7b-ua-rawanneal-seed1234-sft` (este) | 1,66B | 4.096 | Apache-2.0 | Artefacto de investigacion sobre formato de datos de preentrenamiento | No disponibles |
| SmolLM2-1.7B (HuggingFace) | ~1,71B | 8.192 | Apache-2.0 | Modelo pequeño de proposito general, mismo tokenizador base | Si, publicados por el autor |
| Qwen2.5-1.5B (Alibaba) | ~1,54B | 32.768 | Apache-2.0 | Asistente general multilingue con tool calling | Si, publicados por el autor |
| Llama 3.2 1B (Meta) | ~1,24B | 131.072 | Licencia comunitaria Llama 3.2 | Asistente general | Si, publicados por el autor |

La comparacion relevante no es de rendimiento sino de proposito: frente a SmolLM2-1.7B, Qwen2.5-1.5B o Llama 3.2 1B, este checkpoint no compite en contexto (4.096 tokens frente a decenas de miles), ni en multilingüismo (solo ingles), ni en soporte de herramientas, y no publica evaluaciones estandar. Su ventaja es la trazabilidad experimental: secuencia de batches identica a la de otros ocho runs del estudio, perdidas de validacion desglosadas por tipo de texto y pesos verificados contra el checkpoint de entrenamiento.

## Limitaciones y advertencias

- El propio autor lo declara como artefacto de investigacion del proyecto 1PP (EPFL DLAB) y explicitamente "no un asistente de proposito general". No deberia usarse como producto de chat sin una evaluacion propia previa.
- Solo ingles. No hay datos de entrenamiento ni evaluacion en castellano u otros idiomas; el rendimiento fuera del ingles es impredecible.
- Contexto de 4.096 tokens. Consultationes largas, documentos extensos o historiales de conversacion amplios requieren truncado o troceado.
- No soporta turno de sistema: los modelos "nunca vieron uno" segun la model card. Inyectar un mensaje `system` en la plantilla ChatML queda fuera de distribucion y puede degradar la respuesta.
- Sin benchmarks publicados. No hay evidencia cuantitativa de calidad en tareas estandar, tool calling o razonamiento multi-paso; cualquier afirmacion al respecto seria especulativa.
- Riesgo de alucinacion inherente a un modelo de 1,66B entrenado con 66,2B tokens: la relacion parametros/tokens es alta, pero la capacidad de verificacion factica de un modelo de este tamano es limitada.
- Sesgos: el corpus es DCLM-edu (documentos web filtrados por criterio educativo) en ingles, con los sesgos de esa fuente; la mezcla de SFT incluye un track "constitution-cited" que puede imprimir un estilo de respuesta concreto, y solo 30k conversaciones de seguridad, lo que no constituye una alineacion robusta.
- Advertencia de reproducibilidad: el corpus original de documentos se perdio y se reconstruyo; 60 pasos quedan un documento por debajo (139.055 tokens menos de 66,19B) y 36 documentos se aceptaron por coincidencia de prefijo. Ademas, 7 pasos del *cooldown* contienen una conversacion cuyo documento fuente falta en el paso equivalente del run con semilla 42. Las comparaciones con el modelo de semilla 28 no son estrictamente de una sola variable.
- Licencia Apache-2.0: permite uso comercial y modificacion sin restricciones de campo de uso, pero se distribuye "tal cual", sin garantias ni indemnizacion; el cumplimiento normativo (por ejemplo, obligaciones de transparencia en la UE) recae en el desplegador.
- Popularidad nula en el momento de la ficha (0 descargas, 0 likes, creado y actualizado el 27 de octubre de 2026): no hay evidencia de uso en produccion ni incidencias reportadas por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-1.7b-ua-rawanneal-seed1234-sft
- Modelo base del que parte (run raw, semilla 1234): https://huggingface.co/Raghav-Singhal/1pp-1.7b-raw-seed1234-base
- Run 1PP completo de referencia: https://huggingface.co/Raghav-Singhal/1pp-1.7b-ua-seed1234-sft
- Run raw con SFT: https://huggingface.co/Raghav-Singhal/1pp-1.7b-raw-seed1234-sft
- Variante equivalente con semilla 28: https://huggingface.co/Raghav-Singhal/1pp-1.7b-ua-rawanneal-sft
- Coleccion 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Logs de entrenamiento (SFT): https://wandb.ai/raghav_singhal/1pp-sft

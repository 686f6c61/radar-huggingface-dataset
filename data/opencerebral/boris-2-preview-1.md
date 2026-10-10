# opencerebral/Boris-2-Preview-1

## Resumen

Boris-2-Preview-1 es un checkpoint temprano del modelo base Boris-2, desarrollado por OpenCerebral y publicado en HuggingFace bajo licencia Apache 2.0. Se trata de un modelo de lenguaje causal de 144,2 millones de parametros (143,7M segun la model card) entrenado desde cero sobre una unica GPU NVIDIA V100 de 32 GB. Este preview corresponde al checkpoint de 50.000 millones de tokens del entrenamiento principal, al que se le aplico una decaida corta de learning rate de 2.500 millones de tokens, sumando 52.500 millones de tokens vistos en total. El run completo preve continuar hasta 200.000 millones de tokens.

Arquitectonicamente es un decoder transformer denso de 31 capas, hidden size 512, atencion multi-head completa con 8 cabezas de 64 dimensiones y MLP SwiGLU con dimension interna 1664. Incorpora dos componentes poco habituales: capas Canon (una convolucion depthwise causal de 3 taps aplicada a la proyeccion fusionada de query/key/value, de modo que cada posicion mezcla las dos anteriores antes de la atencion) y una tabla de n-gramas exacta que recupera un vector aprendido de rango 64 a partir de los ultimos dos y tres token ids y lo suma al residual stream antes del bloque 2. El contexto es de 2048 tokens con RoPE (theta 10.000) y vocabulario de 32.768 entradas en BPE byte-level entrenado especificamente para este modelo.

Su relevancia es doble: por un lado demuestra que se puede entrenar un SLM competitivo desde cero con una sola V100, y por otro publica un indice compuesto (Open SLM Index, 27,91) que supera a modelos similares entrenados con entre 5 y 38 veces mas tokens, como SmolLM2-135M o cagliostro-v3.5. Es un modelo exclusivamente base: continuo texto, no sigue instrucciones ni mantiene conversacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (causal LM) con capas Canon y tabla de n-gramas |
| Parametros totales | 144.192.782 (metadata de safetensors); 143,7M segun la model card (111,9M en bloques transformer, 16,8M en embedding de tokens atado con la salida, 15,0M en tabla de n-gramas) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible (solo pesos safetensors; la model card no documenta GGUF, AWQ, GPTQ ni otras cuantizaciones) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con codigo personalizado en PyTorch (`trust_remote_code=True`) |

Otros hiperparametros de arquitectura: 31 capas, hidden size 512, atencion multi-head completa con 8 cabezas de 64 dimensiones, MLP SwiGLU con dimension interna 1664, RoPE con theta 10.000, vocabulario de 32.768 tokens (BPE byte-level entrenado para este modelo). Tamano del repositorio: 0,6 GB.

## Arquitectura y entrenamiento

El modelo es un transformer decoder causal de 31 capas con atencion multi-head completa (8 cabezas x 64) y MLP SwiGLU (inner 1664). Dos componentes se apartan del decoder estandar. El primero son las capas Canon: cada bloque aplica una convolucion depthwise causal de 3 taps sobre la proyeccion fusionada de query, key y value, de forma que cada posicion incorpora las dos posiciones previas antes de calcular la atencion. El segundo es la tabla de n-gramas: una busqueda exacta (sin hashing) sobre los ultimos dos y tres token ids, con 210.938 bigramas y 23.437 trigramas, que recupera un vector aprendido de rango 64 y lo suma al residual stream antes del bloque 2; es un gather, no una multiplicacion de matrices. El entrenamiento empaqueta varios documentos por secuencia y enmascara atencion, Canon y la busqueda de n-gramas en las fronteras de documento: cada token de fin de texto reinicia el contexto (`eos_resets_context`).

El entrenamiento se ejecuto en una sola NVIDIA V100 de 32 GB, con precision mixta float16 y residual stream en float32 (un canal alcanza valores cercanos al limite de float16). El batch era de 524.288 tokens por paso con longitud de secuencia 2048. Se uso el optimizador Muon para las matrices (lr 0,0025) y AdamW para embedding, tabla de n-gramas, normalizaciones y canonicalizaciones (lr 0,003), con weight decay 0,1 en matrices, embedding, tabla de n-gramas y en Canon a partir de 41.000 millones de tokens, y sin weight decay en las ganancias de normalizacion. El schedule consistio en warmup, learning rate constante y decaida 1-sqrt hasta cero. El throughput reportado es de aproximadamente 59.000 tokens por segundo, con kernels de atencion Volta escritos a mano y kernels fusionados. No se documento RLHF, DPO ni ninguna fase de alineacion.

Los datos del run principal son aproximadamente un 89% de ClimbMix y un 11% de FineMath. La mezcla de decaida (2.500 millones de tokens) se compone de 62% ClimbMix, 12% tutoriales estilo WikiHow de Cosmopedia, 10% OpenMathInstruct-2, 8% FineMath, 5% matematicas de Cosmopedia y 3% DCLM-Baseline. El modelo no fue entrenado con ningun split de entrenamiento, validacion o test de benchmarks: los datasets FineMath, OpenMathInstruct-2, Cosmopedia math, Cosmopedia tutorials y DCLM se filtraron contra cada item de evaluacion con una comprobacion de solapamiento de 13-gramos (el texto de la model card esta truncado en este punto, por lo que el resultado completo del filtrado no esta disponible). El autor indica que ni el checkpoint ni la semilla se seleccionaron en funcion de las puntuaciones de benchmark, y que la mezcla de decaida se decidio a partir de seis pilotos de 40M tokens cuyas diferencias estaban por debajo del ruido entre checkpoints.

## Capacidades

- Generacion de texto por continuacion (language modeling puro). Es un modelo base: no sigue instrucciones ni mantiene formato de chat.
- Razonamiento de sentido comun y fisico a nivel de modelo pequeno: 45,23 en HellaSwag (acc_norm), 69,21 en PIQA (acc_norm) y 58,38 en ARC-Easy (acc_norm) en zero-shot.
- Aritmetica basica y razonamiento matematico elemental: 37,60 en ArithMark-3 (acc_norm) y 37,68 en ArithMark-2 (acc).
- Capacidad de modelado a nivel de n-gramas mediante tabla de busqueda exacta, util para tareas de prediccion de token con fuerte dependencia local.
- Procesamiento de documentos concatenados: el modelo reinicia el contexto despues de cada `eos`, por lo que respeta fronteras de documento dentro de una misma secuencia.
- Soporte de tool calling / function calling: no disponible (modelo base, sin entrenamiento de instrucciones ni plantillas de herramientas).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (solo ingles).
- Capacidades especiales: no dispone de modo thinking, vision ni audio. El autor reporta una limitacion tecnica relevante: el codigo de modelado no implementa KV cache, de modo que la generacion recalcula el prefijo en cada paso.

## Casos de uso

- Investigacion en arquitecturas de attention: el modelo permite estudiar de forma aislada el efecto de las capas Canon (convolucion causal de 3 taps sobre QKV) comparandolo con un decoder estandar del mismo tamano, ya que el autor publica la implementacion en PyTorch sin dependencias extra.
- Estudio de tablas de n-gramas como capa de embedding disperso: la tabla exacta de 210.938 bigramas y 23.437 trigramas con vectores de rango 64 es un objeto de estudio acotado para medir cuanto aporta la informacion de n-gramas frente a un embedding puramente neural.
- Punto de partida para continued pretraining: al ser un modelo base de 144M con licencia Apache 2.0 y 52.500 millones de tokens vistos, es un candidato razonable para seguir entrenando en dominios concretos con presupuesto de una sola GPU.
- Generacion de texto asistida en local: la continuacion de texto sin instrucciones encaja en tareas de autocompletado de parrafos, generacion de variantes de texto tecnico o reescritura por muestreo, todo ello en hardware de consumo.
- Experimentacion academica y docencia: su tamano (0,6 GB de repositorio, 144M de parametros) permite ejecutar entrenamiento y evaluacion completos en una unica GPU, algo inviable con modelos de 1B o mas.
- Baseline de evaluacion en leaderboards de SLM: el autor publica la formula del Open SLM Index y reproduce las puntuaciones con lm-evaluation-harness 0.4.12 y con el script `bencharithmark-3.py` sin modificar, lo que facilita usarlo como referencia reproducible.
- Pruebas de decodificacion y analisis de logits: el autor reporta que los logits del modelo convertido coinciden con el codigo de entrenamiento dentro de 4e-5 en float32, lo que permite usarlo como banco de pruebas para comparar implementaciones.
- Generacion de datos sinteticos a pequena escala en ingles: sirve para producir continuaciones de texto y filtrarlas despues, sin esperar calidad de modelo instruido.

## Benchmarks y rendimiento

Resultados zero-shot publicados en la model card, sobre los pesos en float32 del repositorio. Los cuatro primeros con lm-evaluation-harness 0.4.12; ArithMark-3 con el script `bencharithmark-3.py` del leaderboard sin modificar y con ajustes por defecto.

| Benchmark | Metrica | Puntuacion |
|---|---|---|
| HellaSwag | acc_norm | 45,23 |
| ARC-Easy | acc_norm | 58,38 |
| ARC-Challenge | acc_norm | 29,95 |
| PIQA | acc_norm | 69,21 |
| ArithMark-3 | acc_norm | 37,60 |
| ArithMark-2 | acc | 37,68 |
| Open SLM Index | compuesto | 27,91 |

La formula del Open SLM Index es `(N(HellaSwag,25) + N(mean(ARC-E, ARC-C),25) + N(PIQA,50) + 0.65 * N(ArithMark-3,25)) / 3.65`, con `N(v,c) = 100(v-c)/(100-c)`.

Comparativa publicada por el autor usando las cifras del Open SLM Leaderboard para el resto de modelos:

| Modelo | Parametros | Tokens | Index |
|---|---:|---:|---:|
| Boris-2-Preview-1 | 144M | 52,5B | 27,91 |
| cagliostro-v3.5 | 146M | 75,4B | 27,49 |
| SmolLM2-135M | 135M | 2T | 27,13 |
| cagliostro-v3 | 146M | 75B | 26,55 |
| SmolLM-135M | 135M | 600B | 25,74 |
| GPT-X2.5-135M | 135M | 75B | 25,17 |

Notas del autor sobre estabilidad: las puntuaciones de un solo checkpoint se mueven aproximadamente mas o menos 0,8 puntos de Index entre checkpoints vecinos. La decaida elevo el Index de 25,10 (checkpoint de 50B) a 27,91, con la mayor parte de la ganancia en HellaSwag (+5,4) y ARC-Easy (+2,7). ArithMark-3 no mejoro: el autor atribuye la falta de transferencia al formato de pregunta de ese benchmark. Ejecutando ArithMark-3 en float32 en lugar del bfloat16 por defecto del script, la puntuacion es 37,00 y el Index 27,80.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): 576,8 MB en float32 (144,19M x 4 bytes), 288,4 MB en float16 o bfloat16, 144,2 MB en int8 y 72,1 MB en int4 (estas dos ultimas no estan documentadas por el autor y requeririan cuantizacion propia). Hay que anadir el residual stream, que el autor mantiene internamente en float32.
- GPU compatibles: cualquier GPU con al menos 1 GB de VRAM libre. El modelo se entreno en una NVIDIA V100 de 32 GB, pero ese requisito corresponde al entrenamiento, no a la inferencia.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU o CPU con suficiente memoria. El repositorio completo ocupa 0,6 GB.
- Opciones de despliegue: al usar codigo personalizado en PyTorch, la via soportada es `transformers` con `trust_remote_code=True` y `AutoModelForCausalLM`. No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni formatos GGUF, y la ausencia de KV cache complica su integracion en servidores de inferencia optimizados.
- Precision: ejecutar en float32 o bfloat16. El autor advierte de que un canal del residual stream alcanza valores cercanos al limite de float16, por lo que internamente se mantiene en float32.
- Latencia y throughput: no disponible para inferencia. Como referencia de entrenamiento, el autor reporta unos 59.000 tokens por segundo en una V100 con kernels de atencion Volta escritos a mano. La generacion es inherentemente mas lenta que en un modelo con KV cache, porque recalcula el prefijo en cada paso; el autor lo considera aceptable a este tamano para muestreo y evaluacion.

## Comparativa con modelos similares

| Modelo | Parametros | Tokens de entrenamiento | Open SLM Index | Contexto | Licencia |
|---|---:|---:|---:|---|---|
| Boris-2-Preview-1 | 144M | 52,5B | 27,91 | 2048 | Apache 2.0 |
| cagliostro-v3.5 | 146M | 75,4B | 27,49 | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |
| SmolLM2-135M | 135M | 2T | 27,13 | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |
| cagliostro-v3 | 146M | 75B | 26,55 | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |

Las cifras de Index y de tokens de los modelos comparados proceden de las tablas publicadas en la model card, que a su vez cita las cifras publicadas por el Open SLM Leaderboard. No se dispone de informacion adicional sobre contexto, licencia o disponibilidad de pesos de los modelos comparados dentro de la informacion proporcionada. El dato mas destacable es la eficiencia en tokens: Boris-2-Preview-1 alcanza un Index superior con 52,5B tokens frente a los 75,4B de cagliostro-v3.5 y los 2T de SmolLM2-135M.

## Limitaciones y advertencias

- Es un modelo base sin alineacion: no sigue instrucciones, no responde a formatos de chat y no debe desplegarse en atencion al cliente o asistentes sin un fine-tuning previo.
- Riesgo de alucinacion alto en generacion libre: no hay RLHF, DPO ni filtrado de comportamiento, y las continuaciones pueden ser facticamente incorrectas o incoherentes.
- Solo ingles. No hay capacidades multilingues, por lo que su uso en castellano producira resultados degradados.
- Contexto limitado a 2048 tokens. No es adecuado para tareas de contexto largo ni para concatenar documentos extensos sin truncado.
- Sin KV cache: la generacion recalcula el prefijo en cada paso, lo que penaliza la latencia en secuencias largas y dificulta su integracion en servidores de inferencia de alto throughput.
- Requiere `trust_remote_code=True`, es decir, ejecutar codigo del autor. Es un riesgo de seguridad y de mantenimiento que debe evaluarse antes de llevarlo a produccion.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero no se han publicado evaluaciones de sesgo, toxicidad ni seguridad, y no existe ningun compromiso del autor sobre filtrado de contenido.
- Ausencia de datos de sesgo: la model card no incluye ninguna evaluacion de sesgos demograficos, sociales o de toxicidad, ni de comportamiento en dominios sensibles.
- Es un checkpoint preview: el run completo continua hasta 200.000 millones de tokens, por lo que las capacidades y puntuaciones cambiaran en versiones posteriores.
- Datos incompletos en la model card: la seccion de contaminacion esta truncada y no se especifica el resultado completo del chequeo de 13-gramos, ni los tipos de cuantizacion soportados, ni metricas de inferencia.
- Discrepancia menor de parametros: la metadata de safetensors indica 144.192.782 parametros mientras que la model card indica 143,7M (desglosado en 111,9M + 16,8M + 15,0M = 143,7M). La diferencia probablemente proceda del redondeo o del conteo de parametros de la tabla de n-gramas.
- El modelo tiene 0 descargas y 0 likes en HuggingFace en el momento de la consulta, y la fecha de creacion registrada es 2026-10-09, posterior a la fecha habitual de referencia; se recomienda verificar la vigencia del repositorio antes de usarlo.

## Enlaces

- HuggingFace: https://huggingface.co/opencerebral/Boris-2-Preview-1
- Model card completa y codigo de uso: disponible en la pagina de HuggingFace del modelo
- Enlaces a papers, blogs, repositorios o demos adicionales: no disponible. La busqueda web realizada no devolvio ningun resultado relevante sobre el modelo Boris-2, OpenCerebral ni el Open SLM Leaderboard; los unicos resultados obtenidos no guardaban relacion con el ambito tecnico y se han descartado.

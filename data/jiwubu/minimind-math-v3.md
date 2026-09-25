# jiwubu/minimind-math-v3

## Resumen

`minimind-math-v3` es un modelo de lenguaje de ~64 millones de parámetros desarrollado por el usuario jiwubu, entrenado desde cero (inicialización aleatoria, sin pesos de base) sobre el proyecto MiniMind y especializado en aritmética elemental. Es un transformer denso decoder-only, sin MoE, con 8 capas, `hidden_size` de 768 y un tokenizador modificado que asigna un token por dígito para estabilizar el alineamiento numérico. Los pesos se han convertido a un formato compatible con la arquitectura Qwen3, de modo que se pueden cargar directamente con `transformers`.

El problema que aborda es acotado y explícito: la aritmética verificable por dígitos (sumas, restas, multiplicaciones y divisiones de hasta 8 y 4 dígitos respectivamente) con salida en formato de operación vertical paso a paso, en lugar de razonamiento matemático general. Su relevancia es principalmente didáctica y de investigación: sirve como banco de pruebas reproducible para estudiar entrenamiento desde cero, tokenización numérica y ajuste supervisado en modelos por debajo de los 100 M de parámetros.

Se distribuye con licencia Apache-2.0, soporta chino e inglés en las etiquetas del repositorio y declara una longitud de contexto arquitectónica de 32 768 tokens, aunque el preentrenamiento se realizó con secuencias de solo 340 tokens, por lo que la ventana larga no está validada empíricamente. El repositorio ocupa 0,1 GB y no incluye cuantizaciones publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (sin MoE), compatible con formato Qwen3 |
| Parametros totales | 63 912 192 (~64 M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32 768 tokens (maximo arquitectonico); preentrenamiento con secuencias de 340 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos float16; no hay GGUF ni versiones cuantizadas) |
| Idiomas soportados | zh, en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (float16), cargables con transformers |
| hidden_size | 768 |
| num_hidden_layers | 8 |
| num_attention_heads / num_key_value_heads | 8 / 4 (GQA) |
| head_dim | 96 |
| intermediate_size | 2432 |
| Activacion | SiLU (SwiGLU) |
| Codificacion posicional | RoPE con theta = 1e6 |
| Tamano de vocabulario | 6400 |
| tie_word_embeddings | true |
| Precision declarada | float16 |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only convencional de 8 capas y `hidden_size` 768, con atención de consultas agrupadas (8 cabezas de consulta, 4 de clave/valor), `head_dim` 96, FFN con activación SwiGLU (`intermediate_size` 2432), RoPE con theta 1e6 y `tie_word_embeddings` activado. No hay mezcla de expertos ni mecanismos de estado recurrente: es un modelo denso. La innovación relevante no está en el bloque transformer, sino en el tokenizador: usa un esquema `Sequence[Digits, ByteLevel]` que convierte cada dígito (0-9) en un token individual, manteniendo el vocabulario congelado en 6400 entradas y la compatibilidad total de IDs con el tokenizador original de MiniMind, sin reentrenar la capa de embeddings. Esto facilita el alineamiento posicional de los dígitos en operaciones verticales.

El entrenamiento consta de dos fases: un preentrenamiento desde cero con inicialización aleatoria sobre el corpus `pretrain_t2t_mini.jsonl` (2 épocas, batch size 32, longitud máxima de secuencia 340, optimizador AdamW con learning rate inicial 5e-4, warmup y decaimiento coseno, precisión mixta bfloat16) y un ajuste supervisado con datos matemáticos generados por el propio autor. El repositorio de código (`jiwubu/minimind`) añade un directorio `math/` con scripts de generación de datos de suma, resta, multiplicación y división (`gen_math_data_addsub.py`, `gen_math_data_muldiv.py`) y un script de evaluación (`eval_math.py`). No se documenta el número total de tokens de entrenamiento ni el uso de RLHF o DPO.

## Capacidades

- Aritmética vertical paso a paso: genera el desarrollo completo de sumas y restas de hasta 8 dígitos y multiplicaciones y divisiones de hasta 4 dígitos.
- Formatos numéricos variados: operandos de distinta longitud, números negativos, ceros a la izquierda, ceros internos, colas de ceros, cadenas de dígitos repetidos y notaciones compactas.
- División entera, con resto, con cociente que contiene ceros y casos de divisor de uno o dos dígitos.
- Salida estructurada fija: el modelo siempre produce la operación vertical y cierra con el resultado (por ejemplo, «答案(3位): 1356»).
- Decodificación determinista: con decodificación greedy los resultados son reproducibles.
- Conversación con plantilla de chat: soporta `apply_chat_template` con roles de sistema, usuario y asistente.
- Multilingüe limitado: etiquetado como zh y en, con entrenamiento centrado en datos matemáticos en chino.
- No soporta: tool calling, function calling, uso como agente, razonamiento multi-paso fuera del dominio aritmético, visión, audio, modo «thinking» explícito ni matemáticas simbólicas o de nivel superior.

## Casos de uso

- Verificación de tokenización numérica en investigación: usar el modelo como banco de pruebas controlado para medir cómo afecta la tokenización dígito a dígito al alineamiento en operaciones verticales, comparando con tokenizadores BPE estándar sobre el mismo corpus.
- Generación sintética de cadenas de razonamiento aritmético: producir trazas verticales paso a paso que sirvan como datos de destilación o como material supervisado para modelos mayores, ya que el formato de salida es fijo y verificable.
- Evaluación de robustez numérica: someter al modelo a casos límite (negativos, ceros a la izquierda, colas de ceros, enteros con dígitos repetidos) para caracterizar los límites de un modelo de 64 M en tareas de alineamiento posicional.
- Docencia y materiales educativos: generar ejemplos resueltos de suma, resta, multiplicación y división con el desarrollo completo para ejercicios de primaria, siempre con revisión humana por el riesgo de error.
- Pruebas unitarias de infraestructura de inferencia: por su tamaño (~128 MB en float16) es útil como modelo «canario» para validar pipelines de despliegue, plantillas de chat, streaming y compatibilidad con el formato Qwen3 antes de pasar a modelos grandes.
- Prototipado en local sin GPU: ejecutable en CPU o en dispositivos embebidos para experimentos de ajuste fino desde cero, dado que el ciclo completo de entrenamiento cabe en hardware de consumo.
- Investigación sobre ajuste supervisado a escala reducida: permite estudiar la curva de aprendizaje de un SFT de un solo epoch sobre una tarea matemática concreta y su efecto en la tasa de error por subcategoría.

## Benchmarks y rendimiento

Los únicos resultados disponibles son la evaluación aritmética propia del autor con `math/eval_math.py` (`--max_digits 8 --n 25`, decodificación greedy, corrección por valor entero). Precisión global en el rango de entrenamiento: 98,6 % sobre 3975 problemas. No hay resultados publicados de MMLU, GSM8K, HumanEval ni de ningún benchmark estándar, y las cifras no son comparables con las de modelos de propósito general.

| Subcategoria (suma y resta, hasta 8 digitos) | Precision (%) |
|---|---|
| Operandos de igual longitud | 100 |
| Operandos de distinta longitud | 100 |
| Operando corto en primer lugar | 99,3 |
| Escritura compacta | 100 |
| Escritura compacta de distinta longitud | 99,3 |
| Negativos con sufijo comun | 99,4 |
| Numeros negativos | 98,9 |
| Negativos, igual longitud y valores cercanos | 95,4 |
| Ceros a la izquierda | 88,0 |
| Respuestas de cadena larga | 99,3 |
| Digitos todos iguales | 99,7 |
| Cadenas largas de ceros | 100 |

| Subcategoria (multiplicacion y division, hasta 4 digitos) | Precision (%) |
|---|---|
| Multiplicacion general | 100 |
| Multiplicacion por un solo digito | 100 |
| Multiplicacion con ceros finales | 99,0 |
| Multiplicacion con ceros internos | 100 |
| Multiplicacion por potencias de diez | 100 |
| Multiplicacion de digitos identicos | 100 |
| Multiplicacion por cadenas de nueves | 100 |
| Multiplicacion de operandos iguales | 100 |
| Division exacta | 97,0 |
| Division con resto | 89,0 |
| Cociente con ceros | 98,0 |
| Cociente con cadenas de ceros | 98,0 |
| Dividendo menor que divisor | 96,0 |
| Divisor de 1 digito | 100 |
| Divisor de 2 digitos | 88,9 |

Fuera del rango de entrenamiento (multiplicación y división de 5 o más dígitos) el propio autor reporta un rendimiento de extrapolación del 0-12 %.

## Requisitos de hardware

- VRAM estimada para inferencia: ~128 MB en float16, ~256 MB en float32 (cálculo teórico a partir de 63,9 M de parámetros con embeddings atados). Con cuantización int8 serían ~64 MB e int4 ~32 MB, aunque no hay versiones cuantizadas publicadas.
- Cabe sin problema en cualquier GPU de consumo: desde una GTX 1050/1650 de 2 GB hasta una RTX 4090, que queda enormemente sobredimensionada. También es viable en CPU, iGPU o dispositivos tipo Raspberry Pi.
- GPU de datacenter (A100, H100) solo tendrían sentido para servir lotes muy grandes en paralelo, no por requisitos de memoria.
- Opciones de despliegue: `transformers` es la vía oficial y documentada. El repositorio declara las etiquetas `text-generation-inference` y `endpoints_compatible`, lo que apunta a compatibilidad con TGI y con endpoints compatibles; no se confirma soporte de vLLM. No hay pesos GGUF publicados, por lo que llama.cpp u Ollama requerirían una conversión previa por parte del usuario.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Idiomas | Formatos | Especializacion |
|---|---|---|---|---|---|---|---|
| minimind-math-v3 | ~64 M | Transformer denso, formato Qwen3 | 32 768 (entrenado a 340) | Apache-2.0 | zh, en | safetensors fp16 | Aritmetica elemental |
| MiniMind-3 (upstream, `jingyaogong/minimind`) | ~64 M (dim=768, n_layers=8) | Transformer denso | no disponible | no disponible en la informacion proporcionada | no disponible | no disponible | Modelo generalista de proposito educativo |
| Qwen3-0.6B (referencia de formato) | ~0,6 B | Transformer denso | 32 768 nativo | Apache-2.0 | Multilingue amplio | safetensors, GGUF | Proposito general, con modo de razonamiento |

Nota: los datos de MiniMind-3 proceden de los resultados de busqueda sobre el repositorio upstream; los de Qwen3-0.6B proceden de conocimiento publico general y no de la informacion de busqueda facilitada, y se incluyen unicamente como referencia de categoria y de compatibilidad de formato. No hay datos de rendimiento comparables entre los tres modelos, ya que minimind-math-v3 solo publica una evaluacion aritmetica propia no homologada.

## Limitaciones y advertencias

- Tamano muy reducido (~64 M de parametros): la capacidad de razonamiento matematico es estrictamente la de la tarea entrenada; fuera de ella el modelo puede generar contenido incoherente.
- Evaluacion no homologada: los resultados del 98,6 % proceden de un script propio (`eval_math.py`) con criterio de correccion por valor entero y `n=25` por categoria; no son comparables con benchmarks estandar.
- Extrapolacion muy debil: multiplicacion y division de 5 o mas digitos no se entrenaron y rinden entre el 0 % y el 12 %.
- Puntos debiles conocidos: ceros a la izquierda (88,0 %), negativos con igual longitud y valores cercanos (95,4 %) y division con resto (89,0 %).
- Contexto no validado: aunque la configuracion declara 32 768 tokens, el preentrenamiento uso secuencias de 340 tokens; el comportamiento en textos largos es una incognita.
- Dependencia de la plantilla de chat: las entradas en texto plano sin `apply_chat_template` quedan fuera de distribucion y producen repeticiones sin sentido. Es un error de integracion frecuente.
- Formato de salida fijo: el modelo siempre emite el desarrollo vertical completo; no admite instrucciones para abreviar, cambiar de formato o responder a preguntas matematicas fuera del esquema.
- Idiomas: las etiquetas declaran zh y en, pero los datos de ajuste son matematicos y en chino; el rendimiento en ingles no esta cuantificado y podria ser notablemente inferior.
- Sesgos: no se documenta ninguna evaluacion de sesgos sociales, de genero o culturales. Al ser un modelo entrenado sobre un corpus pequeno y poco descrito, el riesgo de sesgos no caracterizados es alto.
- Alucinacion: elevada fuera del dominio aritmetico; el autor advierte explicitamente de que puede generar contenido inexacto o sin sentido.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion, pero el modelo no esta pensado para produccion y no se ofrece ninguna garantia de exactitud.
- Robustez en produccion: sin datos de latencia, throughput ni estabilidad bajo carga; tampoco hay versiones cuantizadas ni soporte confirmado en motores de inferencia de alto rendimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jiwubu/minimind-math-v3
- Perfil del autor en HuggingFace: https://huggingface.co/jiwubu
- Repositorio de codigo del autor (pretraining y SFT, directorio `math/`): https://github.com/jiwubu/minimind
- Repositorio upstream de MiniMind: https://github.com/jingyaogong/minimind
- Pagina del proyecto MiniMind: https://jingyaogong.github.io/minimind/
- Otro repositorio del autor: https://github.com/jiwubu/ai

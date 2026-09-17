# fgoose180/fftuniba-cruciverbit-it5-efficient-small-el32

## Resumen

FFT-UniBa Cruciverb-IT IT5-Efficient-Small es un modelo de generación texto-a-texto desarrollado por el equipo FFT-UniBa (Universidad de Bari Aldo Moro) para la tarea compartida Cruciverb-IT de EVALITA 2026. Se trata de un ajuste fino de `gsarti/it5-efficient-small-el32`, un encoder-decoder Transformer de la familia Efficient T5 con 142.336.512 parámetros, especializado en responder pistas de crucigrama en italiano: dada una pista y la longitud esperada de la respuesta, el modelo genera una lista de candidatos ordenada por probabilidad.

El problema que resuelve es concreto y poco cubierto por los modelos generalistas: la resolución de pistas de crucigrama en italiano exige respuestas léxicamente exactas y con una longitud prefijada, algo que un modelo generativo sin restricciones rara vez garantiza. Para ello introduce un mecanismo de doble restricción basado en 28 tokens especiales (`[SL = k]` y `[EL = k]` para `k = 1..28`) añadidos al tokenizador, de modo que la longitud objetivo se codifica tanto al inicio de la entrada como en la salida, internalizando la restricción en lugar de aplicarla mediante filtrado posterior.

Su relevancia actual es doble: por un lado, documenta una técnica de condicionamiento por restricciones duras reutilizable en otras tareas de generación con formato fijo; por otro, sirve como generador de candidatos dentro de un solver CSP con backtracking que resuelve la cuadrícula completa. El modelo es de acceso abierto bajo licencia Apache 2.0, con dos revisiones publicadas (`main` y `grid-solver-22epochs`) y un repositorio de código oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Efficient T5, variante `el32`) |
| Parametros totales | 142.336.512 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el ejemplo de la model card trunca la entrada a 128 tokens y genera un maximo de 32 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors, sin versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | italiano (`it`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `transformers`); tamano del repositorio 1,1 GB |
| Tipo de tarea | `text2text-generation` (seq2seq) |
| Modelo base | `gsarti/it5-efficient-small-el32` |
| Tokens especiales anadidos | 28 (`[SL = k]` / `[EL = k]`, `k = 1..28`) |
| Revisiones disponibles | `main` (23 epocas) y `grid-solver-22epochs` (22 epocas) |
| Dataset de ajuste fino | `cruciverb-it/evalita2026` |

## Arquitectura y entrenamiento

El modelo parte de `gsarti/it5-efficient-small-el32`, un encoder-decoder Transformer de tipo Efficient T5 (la arquitectura T5 con embeddings factorizados y sesgos de posicion relativa en lugar de embeddings posicionales absolutos) adaptado al italiano. El ajuste fino es supervisado sobre el corpus `cruciverb-it/evalita2026`, compuesto por pistas de crucigrama italianas y sus respuestas. La informacion disponible no detalla el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; no se mencionan etapas de alineacion por preferencias.

La innovacion tecnica destacable es el mecanismo de doble restriccion: se anaden 28 tokens especiales al tokenizador y la longitud objetivo se embebe tanto al inicio de la entrada (`indovinello: <CLUE> [SL = <LENGTH>]`) como en la salida (`[SL = <LENGTH>] <ANSWER> [EL = <LENGTH>]`). El modelo aprende asi la restriccion de longitud de forma implicita, en lugar de depender de un filtrado a posteriori. La model card indica que el modo "constrained" (descartar candidatos cuya longitud no coincide con la objetivo) aporta aproximadamente +0,03 de MRR. Ademas, el autor documenta dos configuraciones con distinto numero de epocas y distinto proposito: la revision `main` esta orientada a responder pistas (Sub-task 1) y `grid-solver-22epochs` al llenado de la cuadricula (Sub-task 2). Ambas comparten arquitectura, tokenizador y tokens especiales, y solo difieren en los pesos. La generacion se realiza con busqueda por haz de 100 hipotesis (`num_beams=100`, `num_return_sequences=100`), y las puntuaciones de secuencia (`sequences_scores`) se emplean para ordenar los candidatos.

## Capacidades

- Generacion condicionada por longitud: produce respuestas italianas de una longitud exacta indicada en la entrada mediante los tokens `[SL = k]` y `[EL = k]`.
- Generacion de listas de candidatos ordenadas: con `num_return_sequences` alto devuelve multiples hipotesis con sus log-probabilidades de secuencia, aptas para ranking.
- Respuesta a pistas de crucigrama en italiano: entrada en el formato `indovinello: <CLUE> [SL = <LENGTH>]`.
- Generacion de candidatos para busqueda con restricciones: los candidatos se integran como dominios de un solver CSP con backtracking que respeta las intersecciones de la cuadricula.
- Filtrado por longitud en decodificacion: soporta modo restringido descartando candidatos cuya longitud no coincide, con mejora reportada de ~+0,03 de MRR.
- Multilingue: no disponible. El modelo esta entrenado y evaluado unicamente en italiano.
- Tool calling / function calling: no soportado; no se menciona en la informacion disponible.
- Capacidades de agente o razonamiento multi-paso: no soportadas de forma nativa; el razonamiento multi-paso se delega en el solver CSP externo.
- Vision, audio o modo "thinking": no disponibles.

## Casos de uso

- Resolucion de crucigramas italianos de extremo a extremo: el modelo actua como generador de candidatos por pista (top-K) y un solver CSP con backtracking selecciona la combinacion que satisface todas las intersecciones; la revision `grid-solver-22epochs` esta pensada especificamente para este flujo y reporta un 34 % de precision de cuadricula completa.
- Asistente de ayuda para aficionados a los pasatiempos: integrado en una aplicacion web o movil, recibe la pista introducida por el usuario y la longitud de la casilla, y devuelve una lista de respuestas ordenada por probabilidad; el usuario revisa y elige, lo que encaja con la advertencia del autor de que las salidas son candidatos, no respuestas verificadas.
- Enriquecimiento y anotacion de bases de datos lexicograficas: generar candidatos de longitud fija para pistas de un repertorio de crucigramas permite proponer variantes, detectar duplicados o ampliar un banco de pistas-respuesta con supervision humana posterior.
- Aumento de datos para entrenar otros solvers: dado un conjunto de pistas con longitud conocida, el modelo puede generar candidatos adicionales que sirvan como ejemplos positivos o negativos en el entrenamiento de modelos de resolucion de crucigramas.
- Investigacion en decodificacion con restricciones duras: el mecanismo de doble restriccion (tokens de longitud en entrada y salida) es un caso de estudio reproducible para comparar condicionamiento implicito frente a filtrado posterior en tareas de longitud fija.
- Herramientas educativas de vocabulario italiano: generar palabras de longitud exacta a partir de una definicion permite construir ejercicios de lexico y ortografia, con la salvedad de que la calidad decae en respuestas largas y nombres propios poco frecuentes.
- Componente de un sistema hibrido neuro-simbolico: el modelo cubre la parte neuronal (generacion de hipotesis) y se combina con busqueda combinatoria, un patron trasladable a otros dominios con restricciones de formato estrictas, como sopas de letras o rejillas de palabras encadenadas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (`verified: false`), sobre el split de test del dataset `cruciverb-it/evalita2026`, Sub-task 1 (respuesta a pistas):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Cruciverb-IT Sub-task 1 (clue answering) | cruciverb-it/evalita2026 (test) | Accuracy@1 | 0,58 |
| Cruciverb-IT Sub-task 1 (clue answering) | cruciverb-it/evalita2026 (test) | Accuracy@10 | 0,75 |
| Cruciverb-IT Sub-task 1 (clue answering) | cruciverb-it/evalita2026 (test) | MRR | 0,63 |
| Cruciverb-IT Sub-task 2 (grid filling), revision `grid-solver-22epochs` | cruciverb-it/evalita2026 | Precision de cuadricula completa | 34 % |

No se han publicado en la informacion disponible resultados de benchmarks generalistas (MMLU, HumanEval, GSM8K u otros) para este modelo, ni cifras comparativas de otras participaciones en la tarea compartida.

## Requisitos de hardware

- VRAM estimada para los pesos: unos 569 MB en fp32 (142,3 M de parametros), unos 285 MB en fp16/bf16 y unos 142 MB en int8.
- La VRAM real durante la inferencia es superior debido a la cache de clave/valor: la model card recomienda `num_beams=100` con `num_return_sequences=100`, lo que multiplica aproximadamente por 100 el uso de memoria asociado a la decodificacion respecto a una generacion greedy. No se han publicado cifras oficiales de consumo ni de latencia.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM puede ejecutar el modelo con haces moderados; para el flujo con 100 haces conviene disponer de 8-16 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090). Las GPU de centro de datos (A100, H100, L40S) solo aportan ventaja si se procesan lotes grandes de pistas en paralelo.
- Cabe en GPU de consumo: si, el modelo es claramente apto para GPU de consumo e incluso puede ejecutarse en CPU para volumenes pequenos, dado su tamano (142 M de parametros).
- Opciones de despliegue: `transformers` (libreria declarada) con `AutoTokenizer` y `AutoModelForSeq2SeqLM`; los tags del repositorio incluyen `text-generation-inference` y `endpoints_compatible`, lo que indica compatibilidad con Hugging Face Inference Endpoints. No se publican pesos GGUF, por lo que llama.cpp u Ollama no son opciones directas sin conversion previa. El soporte de vLLM para T5 no esta documentado en la informacion disponible.
- Latencia y throughput: no disponibles. Como referencia cualitativa, la configuracion de 100 haces es costosa en tiempo de decodificacion frente a greedy o a un haz pequeno, especialmente en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion | Rendimiento en Cruciverb-IT |
|---|---|---|---|---|---|
| fgoose180/fftuniba-cruciverbit-it5-efficient-small-el32 | 142,3 M | no disponible (entrada truncada a 128 en el ejemplo) | Apache 2.0 | Pistas de crucigrama en italiano, con restriccion de longitud | Acc@1 0,58; Acc@10 0,75; MRR 0,63 (declarado por el autor) |
| gsarti/it5-efficient-small-el32 (modelo base) | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | Modelo generalista de lenguaje italiano | no disponible (sin ajuste fino especifico) |

No se dispone de datos comparativos de otros modelos de la misma categoria (por ejemplo, otras participaciones en Cruciverb-IT o modelos generativos italianos de tamano similar evaluados en la misma tarea), por lo que la comparativa cuantitativa queda limitada a la fila anterior.

## Limitaciones y advertencias

- Sesgos: el modelo base fue preentrenado sobre `gsarti/clean_mc4_it`, un corpus italiano extraido de la web, por lo que puede reproducir y amplificar sesgos y estereotipos sociales presentes en esos datos. El corpus de ajuste fino (pistas de crucigramas, en su mayoria de publicaciones italianas antiguas) anade un sesgo cultural y temporal adicional.
- Alucinacion: el modelo puede producir palabras fluidas pero incorrectas; es un respondedor de pistas, no un verificador, y no comprueba la coherencia con la cuadricula por si mismo.
- Degradacion por longitud: la calidad disminuye en respuestas muy largas y en nombres propios poco frecuentes.
- Dependencia de la restriccion de longitud: sin el token de longitud la generacion queda sin restringir y es bastante menos precisa, segun la model card.
- Limitacion idiomatica: solo italiano. No debe usarse para resolver crucigramas en otros idiomas ni para generacion general, traduccion o resumen.
- Uso fuera de alcance: no esta disenado para generacion de texto generalista ni para aplicaciones dirigidas al usuario final sin revision humana; las salidas son listas de candidatos, no respuestas verificadas.
- Licencia: los pesos se publican bajo Apache 2.0, pero el corpus de ajuste fino `cruciverb-it/evalita2026` esta sujeto a terminos `copyrighted-research-purposes`, que deben revisarse antes de cualquier uso mas alla de la investigacion.
- Validacion externa: el repositorio registra 0 descargas y 0 "likes", y las metricas del model-index estan marcadas como `verified: false`, es decir, no han sido verificadas de forma independiente.
- Distribucion: no se han publicado versiones cuantizadas (GGUF, GPTQ, AWQ), lo que limita su uso en entornos de inferencia local basados en llama.cpp u Ollama sin una conversion previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fgoose180/fftuniba-cruciverbit-it5-efficient-small-el32
- Modelo base: https://huggingface.co/gsarti/it5-efficient-small-el32
- Repositorio de codigo oficial (solver y pipeline): https://github.com/mattiacurri/fftuniba-cruciverbit
- Paper: FFT-UniBa at Cruciverb-IT: Special Length Tokens and CSP for Italian Crossword Solving (CEUR-WS Vol-4195): https://ceur-ws.org/Vol-4195/45.pdf
- Dataset de ajuste fino: https://huggingface.co/datasets/cruciverb-it/evalita2026
- Pagina de la tarea compartida Cruciverb-IT: https://sites.google.com/view/cruciverbit2026
- Campana EVALITA 2026: https://www.evalita.it/campaigns/evalita-2026/
- Busqueda web: no se han encontrado enlaces adicionales relevantes sobre este modelo; los resultados devueltos no guardan relacion con el modelo ni con la tarea.

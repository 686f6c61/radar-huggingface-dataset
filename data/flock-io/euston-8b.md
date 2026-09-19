# flock-io/Euston-8B

## Resumen

Euston-8B es un modelo de razonamiento de 8.000 millones de parametros desarrollado conjuntamente por FLock.io y la Universidad de Oxford, disenado especificamente para verificar afirmaciones matematicas extraidas de articulos de investigacion. Dado un enunciado (por ejemplo, un teorema o una cota), el modelo decide si es verdadero o si ha sido corrompido estructuralmente, emitiendo una traza de razonamiento que termina en una etiqueta `\boxed{True}` o `\boxed{False}`.

El problema que aborda es la llamada "sycophancy matematica": la tendencia de los modelos de razonamiento de cadena larga a producir una derivacion aparentemente confiada de un enunciado falso, en lugar de senalar que la afirmacion no puede establecerse. Euston es un fine-tune de `deepseek-ai/DeepSeek-R1-0528-Qwen3-8B` (transformer decoder-only, 8B parametros, BF16) entrenado con Group Relative Policy Optimization (GRPO) frente a una recompensa basada en reglas y sin llamadas a API.

Su relevancia actual reside en dos frentes: por un lado, es un banco de pruebas reproducible para investigacion en aprendizaje por refuerzo con recompensas verificables (RLVR) y en mitigacion de sycophancy; por otro, ilustra un caso de uso acotado pero realista, el cribado humano de corrupciones en un corpus matematico. La model card advierte de forma explicita de que el modelo no es un oraculo de verdad y no debe usarse como filtro autonomo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base DeepSeek-R1-0528-Qwen3-8B, familia Qwen3) |
| Parametros totales | 8B |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el entrenamiento uso prompts de hasta 3.072 tokens y respuestas de hasta 16.384 tokens |
| Tipos de cuantizacion | No disponible (el repositorio publica pesos en safetensors; no se listan versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | safetensors (BF16); tamano del repositorio 16,4 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 8B parametros en BF16, tomado como punto de partida del modelo `deepseek-ai/DeepSeek-R1-0528-Qwen3-8B`, que a su vez pertenece a la familia Qwen3. No se introduce ninguna modificacion estructural: la especializacion proviene integramente del proceso de ajuste por refuerzo.

El entrenamiento se realizo con GRPO mediante la libreria `verl`, sobre 3.026 pares emparejados verdadero/falso (6.052 enunciados) generados con GraphSynth a partir de afirmaciones matematicas de articulos de arXiv con identificadores entre 1001 y 2512 (enero de 2010 a diciembre de 2025). El conjunto publicado corresponde al split `MathArena/brokenarxiv-training`. Cada par combina un enunciado original con una contraparte corrompida estructuralmente bien formada que difiere de la fuente en su valor de verdad y en el minimo de elementos adicionales posible; las corrupciones las produce GraphSynth, un generador probabilistico de grafos de factores que acopla diversidad a nivel de atributo con enmascaramiento estructural en tiempo de decodificacion y verificacion sincronizada por spans. La recompensa es deliberadamente austera: 1,0 si la expresion final `\boxed{...}` coincide por `casefold` con la etiqueta de referencia y 0,0 en caso contrario, sin intervencion de ningun modelo juez, lo que hace la ejecucion reproducible a partir de los datos y la semilla.

Los hiperparametros principales son: coeficiente de perdida KL 0,001; coeficiente de entropia 0; tasa de aprendizaje 5e-6; tamano de lote de entrenamiento 32; mini-lote PPO 32; 8 rollouts por prompt; 1 epoca y 189 pasos; hardware 4x H100 durante aproximadamente 13,8 horas.

## Capacidades

- Razonamiento matematico de cadena larga: genera trazas de razonamiento extensas (hasta 16.384 tokens en entrenamiento) antes de emitir un veredicto.
- Verificacion de afirmaciones matematicas: clasifica enunciados como verdaderos o corrompidos/falsos, terminando siempre en una etiqueta `\boxed{True}` o `\boxed{False}`.
- Resistencia a sycophancy matematica: entrenado especificamente para no derivar enunciados falsos de forma complaciente, sino para detectar que no pueden establecerse.
- Discriminacion sobre pares emparejados: el objetivo de entrenamiento es distinguir un enunciado de su version corrompida con cambios minimos de valor de verdad.
- Generacion de texto conversacional en ingles, con plantilla de chat aplicada mediante `apply_chat_template`.
- Capacidades de agente y tool calling: no documentadas en la informacion disponible.
- Capacidades de vision, audio o thinking mode explicito: no documentadas; el modelo emite una traza de razonamiento textual, no un modo separado declarado.
- Multilingue: no; entrenado y evaluado unicamente en ingles.

## Casos de uso

- Cribado humano de corrupciones en corpus matematicos: el modelo actua como backend de una herramienta que senala posibles corrupciones en un corpus de articulos para que una persona las revise. Es el uso principal declarado por los autores.
- Investigacion sobre sycophancy: sirve como sujeto de estudio para medir la tendencia de los modelos de razonamiento a derivar enunciados falsos y para evaluar intervenciones de mitigacion.
- Investigacion en RLVR: al usar una recompensa basada en reglas y sin API, el pipeline es reproducible a partir de datos y semilla, lo que permite estudiar el efecto de la calidad de los negativos frente al optimizador.
- Generacion de datos de entrenamiento: los pares verdadero/falso generados con GraphSynth y el dataset `MathArena/brokenarxiv-training` pueden reutilizarse para entrenar o evaluar otros verificadores matematicos.
- Evaluacion de robustez de asistentes matematicos: puede emplearse como sonda para detectar si otro modelo acepta enunciados alterados con hipotesis debilitadas, desigualdades invertidas o constantes modificadas.
- Control de calidad editorial en flujos con LaTeX: integrado como paso de revision sobre borradores, marcando teoremas y cotas sospechosas antes de la publicacion, siempre con validacion humana posterior.
- Deteccion de enunciados alterados en material docente: revision de problemas y soluciones de asignaturas de matematicas para localizar erratas que cambian el valor de verdad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la evaluacion se articula en tres ejes (discriminacion sobre un split balanceado reservado y otros dos que quedan cortados en el texto proporcionado), pero no se incluyen valores numericos en el material facilitado.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16 los pesos ocupan aproximadamente 16 GB, por lo que se recomiendan del orden de 20 GB de VRAM para dejar margen a la cache KV y a las activaciones; el repositorio completo pesa 16,4 GB.
- GPU recomendadas: para entrenamiento se usaron 4x H100 durante unas 13,8 horas. Para inferencia en BF16, una A100 40/80 GB, H100 o L40S son opciones holgadas.
- Cabe en GPU de consumo: si, en BF16 cabe en una RTX 4090 o RTX 3090 de 24 GB con contexto moderado; en cuantizaciones de 8 o 4 bits cabria en GPUs de 12-16 GB, aunque no se publican pesos cuantizados oficiales.
- Opciones de despliegue: al estar etiquetado como `text-generation-inference` y `endpoints_compatible`, es compatible con TGI y con endpoints gestionados; tambien es desplegable con vLLM y, dado el formato safetensors, convertible a llama.cpp u Ollama si se generan pesos GGUF (no publicados).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. La configuracion de evaluacion usa 32.768 tokens nuevos como maximo y 4 muestras por problema, lo que implica un coste de inferencia elevado por consulta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| flock-io/Euston-8B | 8B | No disponible | Verificacion de afirmaciones matematicas / anti-sycophancy | MIT | HuggingFace, safetensors BF16 |
| deepseek-ai/DeepSeek-R1-0528-Qwen3-8B (modelo base) | 8B | No disponible | Razonamiento general y matematicas | No disponible | HuggingFace |
| Otros verificadores matematicos de ~8B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativos en la informacion proporcionada, por lo que la comparacion se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un oraculo de verdad: la propia model card indica que Euston rechaza una mayoria de los enunciados correctos que se le presentan, por lo que a prevalencias de error realistas casi todas sus marcas de "falso" serian incorrectas.
- No debe usarse como filtro autonomo: su uso previsto es la investigacion y el cribado con supervision humana.
- Alcance limitado a matematicas y a ingles: entrenado y evaluado sobre enunciados matematicos en ingles; no debe emplearse con otros idiomas ni con afirmaciones no matematicas.
- Riesgo de alucinacion: aunque el entrenamiento busca reducir la derivacion complaciente de enunciados falsos, sigue siendo un modelo generativo y sus trazas de razonamiento no constituyen una prueba formal.
- Sesgos conocidos: no se documentan sesgos especificos mas alla del sesgo de dominio (corpus arXiv de matematicas, ventana temporal 2010-2025) y del idioma.
- Licencia: MIT heredada del modelo base, lo que en principio permite uso comercial, pero el uso previsto y las advertencias de la model card desaconsejan aplicaciones autonomas en produccion; conviene revisar la licencia del modelo base por si impone condiciones adicionales.
- Contexto: no se especifica la longitud de contexto soportada; el entrenamiento se hizo con prompts de hasta 3.072 tokens y respuestas de hasta 16.384 tokens, por lo que no hay garantias mas alla de ese regimen.
- Coste de inferencia: la generacion de hasta 32.768 tokens nuevos y 4 muestras por problema encarece el despliegue en comparacion con un clasificador convencional.
- Reproducibilidad: la recompensa es puramente basada en reglas y sin API, lo que favorece la reproducibilidad, pero los datos dependen del generador GraphSynth.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/flock-io/Euston-8B
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-0528-Qwen3-8B
- Dataset de entrenamiento: https://huggingface.co/datasets/MathArena
- Paper de GraphSynth: https://aclanthology.org/2026.acl-long.1969/
- Libreria de entrenamiento GRPO (verl): no disponible en la informacion proporcionada
- Demo o espacio interactivo: no disponible
- Nota sobre la busqueda web: los resultados devueltos por la busqueda no guardan relacion con el modelo (contenido sobre el lenguaje de programacion Java) y no se han utilizado.

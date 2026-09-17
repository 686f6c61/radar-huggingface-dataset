# CharlieChen/loop-untied-2-d18

## Resumen

loop-untied-2-d18 es un modelo de lenguaje base (sin ajuste por instrucciones) publicado por el usuario CharlieChen en Hugging Face, asociado al articulo "How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents". Se trata de un transformer con bucle (looped transformer) en la coordenada de profundidad d18 de la escalera de escalado FineWeb del paper, con 1.760.624.640 parametros almacenados en FP32 (7,043 GB) y una longitud de contexto de 2.048 tokens.

El modelo no es un checkpoint de tipo `AutoModel` de Transformers: es el artefacto original de entrenamiento en PyTorch (`final.pt`), pensado para reconstruirse con el codigo propio del paper (`cue-engineering/loop`). Su interes es fundamentalmente de investigacion: sirve para reproducir y analizar como el crecimiento del modelo, la recursion y los operadores de frontera afectan a los exponentes de escalado, y para comparar configuraciones "untied" frente a variantes con pesos atados.

Al ser un modelo base entrenado solo con prediccion de siguiente token sobre FineWeb, no incorpora alineamiento, ni ajuste por instrucciones, ni soporte de herramientas. Su valor practico esta en la experimentacion sobre arquitecturas recurrentes y en servir de punto de partida para ajuste fino o preentrenamiento continuado en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucle (looped transformer), modelo custom `TransformerGPT`, modo de profundidad `dep`, 2 repeticiones core configuradas |
| Parametros totales | 1.760.624.640 (almacenados en FP32) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible (solo se publica el checkpoint original en FP32; no hay versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | Checkpoint PyTorch (`final.pt`), no safetensors; acompanado de `result.json` y `SHA256SUMS` |
| Ancho (d_model) | 2.304 |
| Cabezas de atencion | 18 |
| Tokenizador | GPT-2 (`tiktoken.get_encoding("gpt2")`) |
| Vocabulario | 50.257 tokens, ampliado a 50.304 filas del modelo |
| Corpus de entrenamiento | FineWeb (`HuggingFaceFW/fineweb`) |
| NLL de validacion (preentrenamiento) | 2,637820 nats/token |
| Tamano del repositorio | 7,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer con bucle: el bloque Transformer se reutiliza un numero configurable de veces (2 repeticiones core configuradas y 2 repeticiones en la evaluacion final). La "coordenada de profundidad" d18 es la coordenada de escalado de la escalera experimental del paper y no tiene por que coincidir con el numero de bloques Transformer efectivamente ejecutados. El ancho es 2.304 con 18 cabezas de atencion, vocabulario GPT-2 de 50.257 tokens (ampliado a 50.304 filas) y contexto de 2.048 tokens.

El entrenamiento se realizo sobre FineWeb, un corpus web en ingles, con tokenizador GPT-2. El paper utiliza GPU H100, FlashAttention-3 y autocast en bfloat16. El NLL de validacion registrado en el corpus de preentrenamiento es de 2,637820 nats/token, una metrica que el autor distingue explicitamente del NLL de respuestas del benchmark CORE. No hay informacion disponible sobre composicion exacta del dataset, numero total de tokens vistos, ni sobre fases de RLHF, DPO o ajuste por instrucciones (el modelo es base). El checkpoint conserva los pesos aprendidos y los argumentos de entrenamiento, pero no el estado del optimizador, por lo que no permite reanudar el entrenamiento desde ese punto.

## Capacidades

- Generacion de texto autoregresiva (completions) en ingles, sin ajuste por instrucciones.
- Modelado de lenguaje puro: util para medir perplejidad y NLL sobre corpus en ingles.
- No soporta tool calling ni function calling: no se ha entrenado para ello.
- No soporta uso como agente ni razonamiento multi-paso guiado: no hay modo de pensamiento ni entrenamiento con refuerzo.
- Capacidades multilingues: solo ingles declarado; no se ha documentado comportamiento en otros idiomas.
- Sin capacidades de vision, audio ni multimodalidad.
- Sin modo "thinking", sin plantilla de chat y sin system prompt: requiere prompts de continuacion en texto plano.
- Reproducibilidad cientifica: el repositorio incluye configuracion, recuento de parametros, ajustes de entrenamiento y metricas de validacion en `result.json`, ademas de checksum (`SHA256SUMS`) del checkpoint original.

## Casos de uso

- Reproduccion de la escalera de escalado del paper: cargar `final.pt` junto con el codigo de `cue-engineering/loop` y volver a medir el NLL de validacion (2,637820 nats/token) en la coordenada de profundidad d18.
- Estudio de arquitecturas con bucle: comparar este checkpoint "untied" con variantes de pesos atados para analizar el coste computacional de la recursion y su efecto sobre las curvas de escalado.
- Punto de partida para preentrenamiento continuado en ingles: al ser un modelo base de 1,76B parametros entrenado sobre FineWeb, puede continuarse con dominios especializados antes de un ajuste supervisado.
- Ajuste fino supervisado para tareas concretas de generacion en ingles (clasificacion de texto, resumen extractivo, completado de campos), asumiendo que hay que construir el pipeline de datos desde cero al no existir plantilla de chat.
- Baseline de investigacion en comparaciones de eficiencia: medir coste por token y calidad frente a un transformer denso equivalente de ~1,8B parametros para cuantificar la ventaja o desventaja de la recursion.
- Generacion de datos sinteticos estilo preentrenamiento: usar el modelo como generador de texto en ingles para aumentar corpus de investigacion o para estudiar distribuciones del modelo.
- Auditoria de artefactos cientificos: verificar la integridad del checkpoint con `SHA256SUMS` y reconstruir la configuracion exacta desde `result.json` en un entorno de investigacion reproducible.
- Analisis de la relacion entre profundidad configurada y profundidad ejecutada: experimentar con el numero de repeticiones del bucle para medir el impacto en NLL y en latencia.

## Benchmarks y rendimiento

| Metrica | Valor | Notas |
|---|---|---|
| NLL de validacion en preentrenamiento | 2,637820 nats/token | Medido sobre el corpus de preentrenamiento (FineWeb) |
| CORE (22 tareas, seeds 0/1/2) | No disponible | El autor describe el procedimiento de evaluacion completa, pero no publica los resultados en la informacion disponible |
| MMLU / HumanEval / GSM8K | No disponible | No se han publicado resultados de estos benchmarks en la informacion disponible |

No se han publicado resultados de benchmarks adicionales en la informacion disponible. El propio autor advierte que las puntuaciones de evaluacion "smoke" (con `--max-per-task 10`) no equivalen a los resultados completos del paper.

## Requisitos de hardware

- Pesos en FP32: 7,043 GB de checkpoint; en memoria de GPU la huella de pesos es de aproximadamente 7,04 GB si se carga en FP32.
- Estimacion aritmetica en precision reducida: en bfloat16 los pesos ocuparian aproximadamente 3,5 GB (calculo derivado del recuento de parametros declarado, no una cifra publicada por el autor).
- GPU recomendadas por el autor para la evaluacion: H100, con FlashAttention-3 y autocast en bfloat16.
- Inferencia en GPU de consumo: por tamano de pesos, un modelo de 1,76B parametros es compatible con GPUs de 12-24 GB (por ejemplo RTX 3090, RTX 4090) en bfloat16 o FP16, dejando margen para activaciones y cache KV con contexto de 2.048 tokens. No hay datos de consumo real medidos publicados.
- Opciones de despliegue: el modelo requiere el codigo del paper (`cue-engineering/loop`); no es un checkpoint `AutoModel`, por lo que no se puede cargar directamente con vLLM, TGI, llama.cpp u Ollama sin conversion previa. No se documenta ninguna conversion oficial.
- Script de evaluacion: `python eval.py --checkpoint ... --result-json ... --max-per-task 10 --seeds 0 1 2 --out core_smoke.json` desde la raiz del repositorio de codigo.
- Latencia y throughput: no disponible. No se han publicado cifras de tokens por segundo ni de tiempo de primera respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| loop-untied-2-d18 | 1,76B | 2.048 | No disponible | `final.pt` (PyTorch) | Repositorio de HF, 0 descargas; requiere codigo externo |
| GPT-2 XL | 1,5B | 1.024 | Licencia MIT (segun su model card) | safetensors / PyTorch | Integrado en Transformers, ampliamente desplegado |
| Pythia-1.4B | 1,4B | 2.048 | Apache-2.0 | safetensors | Integrado en Transformers, con variantes de ajuste fino |
| Qwen2.5-1.5B | ~1,5B | 32.768 | Apache-2.0 | safetensors | Integrado en Transformers; versiones cuantizadas en GGUF |

La comparacion de rendimiento entre estos modelos y loop-untied-2-d18 no esta disponible: el unico dato publicado para loop-untied-2-d18 es el NLL de validacion en su propio corpus de preentrenamiento, que no es comparable con puntuaciones de benchmarks de otros modelos. Los datos de las alternativas provienen de sus respectivas model cards publicas.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue ordenes, no mantiene formato de chat y puede producir continuaciones irrelevantes ante prompts conversacionales.
- Riesgo de alucinacion: al ser un modelo de lenguaje entrenado sobre corpus web (FineWeb), puede generar afirmaciones falsas con fluidez; ninguna capa de alineamiento lo mitiga.
- Sesgos conocidos: no se ha publicado ninguna evaluacion de sesgo, toxicidad o seguridad. FineWeb es un corpus web en ingles, con los sesgos inherentes a ese tipo de datos.
- Idioma: solo ingles declarado. El rendimiento en castellano u otros idiomas no esta documentado.
- Ventana de contexto limitada a 2.048 tokens, muy inferior a la de modelos contemporaneos de tamano similar (32K o mas).
- Licencia no disponible: sin terminos explicitos de uso, no se puede asumir permiso para uso comercial. Conviene contactar con el autor antes de cualquier despliegue en produccion.
- Formato no estandar: al no ser un `AutoModel`, requiere el repositorio `cue-engineering/loop` y la clase personalizada `TransformerGPT`; no hay soporte en ecosistemas de inferencia habituales.
- Sin estado del optimizador: el checkpoint no permite reanudar el entrenamiento original, solo inferencia o ajuste fino desde los pesos.
- Ambiguedad en la profundidad: la "coordenada de profundidad" d18 del paper no equivale necesariamente al numero de bloques Transformer ejecutados; hay que consultar `result.json` para reconstruir la configuracion real.
- Sin datos de latencia, throughput ni consumo: no es posible dimensionar un despliegue en produccion con la informacion disponible.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validacion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CharlieChen/loop-untied-2-d18
- Repositorio de codigo del paper: https://github.com/cue-engineering/loop
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Articulo citado por el autor: "How Model Growth, Recursion, and Boundary Operators Influence Scaling Exponents" (no se ha localizado URL directa en la informacion disponible)
- Debate sobre modelos recurrentes ("loopies") y coste computacional del bucle (contexto no oficial, no vinculado directamente al modelo): https://www.lesswrong.com/posts/PLisnSFir8y5AHkmP/how-concerned-should-we-be-about-astra-s-recurrent
- Otras referencias devueltas por la busqueda web (loop engineering en agentes, verificacion dual-loop, contenido no relacionado) no aportan informacion tecnica sobre este modelo y se omiten.

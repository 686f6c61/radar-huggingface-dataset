# dealignai/Ripple-65B-Preview-UNCENSORED-JANG_4D

## Resumen

Ripple-65B-Preview-UNCENSORED-JANG_4D es una variante "abliterated" (sin comportamiento de rechazo) del modelo Ripple-65B-Preview de ricursiveAI, empaquetada en formato MLX por dealignai para su uso en Apple Silicon. El modelo original es un transformer denso de aproximadamente 64.780 millones de parametros, con una ventana de contexto nativa declarada de 2 millones de tokens, capacidades de razonamiento con modo "thinking" activable por turno, soporte de tool calling estilo Hermes y decodificacion especulativa mediante un drafter DFlash2 incluido en el repositorio.

La intervencion de dealignai consiste en eliminar las negativas de rechazo del modelo base manteniendo intactas el resto de capacidades (razonamiento, codigo, tool calls, decodificacion especulativa y contexto completo). Segun la model card, el bundle conserva byte a byte la plantilla de chat, el tokenizer, el bloque de capacidades de `jang_config.json` y el orden de tensores del modelo base, de modo que puede cargarse en los mismos runtimes sin hooks adicionales.

Es relevante para desarrolladores que trabajan en entornos Apple Silicon (Osaurus 0.25.32+ o vMLX) y necesitan un modelo grande sin filtros de rechazo para tareas de generacion libre, investigacion sobre alineacion o generacion de contenido que los modelos convencionales declinan. El precio de la ablation es una caida medible en MMLU-500 de 3,80 puntos porcentuales respecto al base (72,80% frente a 76,60%). El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (detalles de atencion no disponibles); empaquetado MLX |
| Parametros totales | 64.782.689.360 (~64,8 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.000.000 tokens (contexto nativo declarado) |
| Tipos de cuantizacion | 6-bit (JANG_4D); variante hermana JANGH2 de ~24,6 GB; el drafter DFlash2 se distribuye en BF16 sin cuantizar |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (`{"format":"mlx"}`), ~55,8 GB de repo; bundle de inferencia de 43,7 GB segun la model card |
| Modelo base | OsaurusAI/Ripple-65B-Preview-JANG_4D (repack JANG de ricursiveAI/Ripple-65B-Preview) |
| Libreria | MLX |
| Runtime objetivo | Osaurus 0.25.32+, vMLX |
| Decodificacion especulativa | Drafter DFlash2 incluido (ricursiveAI/Ripple-65B-Preview-DFlash2, BF16, SHA verificado contra upstream) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del transformer original (tipo de atencion, numero de capas, dimensiones ocultas, uso de RoPE o variantes). Lo que si se documenta es el proceso de empaquetado: el modelo base es un repack JANG de ricursiveAI/Ripple-65B-Preview realizado por OsaurusAI, y dealignai ha aplicado sobre el una ablation de rechazo ("uncensored" / "abliterated" / etiqueta "crack") que elimina las respuestas de negativa en categorias de HarmBench sin modificar la plantilla de chat, el tokenizer, el bloque de capacidades ni el orden de tensores. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO en el modelo original.

La innovacion tecnica destacable es la integracion de un drafter de decodificacion especulativa DFlash2 en BF16 dentro del mismo bundle, que el runtime Osaurus carga automaticamente para acelerar la generacion. El modelo soporta ademas modo "thinking" activable o desactivable por turno, lo que permite alternar entre respuestas directas y cadenas de razonamiento segun la tarea.

## Capacidades

- Generacion de texto conversacional en ingles con contexto muy largo (hasta 2M tokens declarados).
- Razonamiento con modo "thinking" conmutable por turno (bloques `</think>`).
- Generacion de codigo y matematicas (etiquetas reasoning y thinking; sin benchmarks especificos de codigo publicados).
- Tool calling / function calling con formato Hermes.
- Razonamiento multi-paso y uso en flujos de agente.
- Decodificacion especulativa mediante drafter DFlash2 para reducir latencia.
- Comportamiento sin rechazo: sigue instrucciones que el modelo base declinaria, incluidas categorias duras de HarmBench.
- Capacidades multilingues limitadas al ingles segun la metadata del repositorio.
- Sin soporte declarado de vision ni audio.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como varia la tasa de cumplimiento en HarmBench-320 respecto al base, con la ventaja de que la unica variable modificada es el comportamiento de rechazo y el resto de pesos y plantilla permanecen identicos.
- Generacion creativa sin filtros: escritura de ficcion, guiones o narrativa que toca temas sensibles y que los modelos convencionales rechazan; el contexto de 2M tokens permite mantener arcos narrativos largos en una sola sesion.
- Red teaming y evaluacion de robustez: uso como modelo objetivo para probar clasificadores de contenido, guardrails o sistemas de moderacion en produccion.
- Asistentes de codigo en local sobre Apple Silicon: con tool calling Hermes y el drafter DFlash2, puede integrarse en flujos de edicion de codigo en Osaurus o vMLX con latencia reducida por decodificacion especulativa.
- Procesamiento de documentos extensos: la ventana de 2M tokens permite ingerir libros tecnicos, expedientes o bases de codigo completas en una sola pasada para resumen, extraccion o Q&A.
- Agentes multi-paso en local: combinacion de thinking mode, tool calls y contexto largo para pipelines de automatizacion que deben ejecutarse sin conexion ni dependencia de APIs externas.
- Analisis de contenido sensible para moderacion: generar ejemplos de texto que un sistema de moderacion debe detectar, aprovechando que el modelo no se niega a producirlos.

## Benchmarks y rendimiento

Los unicos datos publicados corresponden a MMLU-500 (500 preguntas estratificadas, evaluacion prefill-only sobre logits de " A"/" B"/" C"/" D") y a HarmBench-320 con rubrica de cumplimiento bajo razonamiento. No se publican resultados de HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

| Benchmark | Base Ripple-65B-Preview-JANG_4D | UNCENSORED (este bundle) | Delta |
|---|---:|---:|---:|
| MMLU-500 | 76,60% (383/500) | 72,80% (364/500) | −3,80 pp |

Desglose por materia (extracto de las variaciones mas relevantes; N=8-9 por materia):

| Materia | Base | UNCENSORED | Delta (pp) |
|---|---:|---:|---:|
| prehistory | 87,5% | 62,5% | −25,0 |
| professional_medicine | 100,0% | 75,0% | −25,0 |
| professional_psychology | 87,5% | 62,5% | −25,0 |
| college_computer_science | 77,8% | 88,9% | +11,1 |
| college_mathematics | 33,3% | 44,4% | +11,1 |
| moral_scenarios | 11,1% | 0,0% | −11,1 |

El resultado de HarmBench-320 no aparece completo en la informacion proporcionada: la model card describe la metodologia (sampling con `temp=1.0`, `top_p=0.95`, `max_tokens=1024`, evaluacion del texto posterior a `</think>`) pero el texto se corta antes de mostrar las cifras.

## Requisitos de hardware

- VRAM/unified memory estimada: el bundle de inferencia ocupa 43,7 GB en formato JANG_4D de 6 bits; el repositorio completo pesa 55,8 GB. Se necesita un Mac con al menos 64 GB de memoria unificada para cargar el modelo con margen para el contexto.
- La variante hermana JANGH2 (~24,6 GB) reduce el requisito a equipos con 32-48 GB de memoria unificada.
- GPU: disenado para Apple Silicon (M-series). No esta pensado para CUDA; no se documenta soporte en A100, H100 ni RTX 4090.
- Cabe en consumer hardware Apple de gama alta (Mac Studio, MacBook Pro con M3/M4 Max o Ultra); no en GPUs consumer convencionales por el formato MLX.
- Despliegue: Osaurus 0.25.32+ (runtime principal, con carga automatica del drafter DFlash2) y vMLX. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la decodificacion especulativa con DFlash2 deberia reducirlos respecto a generacion autoregresiva pura, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| Ripple-65B-Preview-UNCENSORED-JANG_4D (este) | ~64,8B | 2M | Apache 2.0 | MLX (Osaurus, vMLX) | Sin rechazo; MMLU-500 72,80% |
| Ripple-65B-Preview-JANG_4D (base) | ~64,8B | 2M | Apache 2.0 | MLX | Con rechazo; MMLU-500 76,60% |
| Ripple-65B-Preview-UNCENSORED-JANGH2 (hermano) | ~64,8B | 2M | Apache 2.0 | MLX | Cuantizacion mas agresiva (~24,6 GB) |
| ricursiveAI/Ripple-65B-Preview (original) | ~64,8B | 2M | No disponible en la informacion | No disponible | Fuente upstream del repack |

No se dispone de datos de benchmarks de modelos comparables de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- La ablation de rechazo degrada el rendimiento general: −3,80 pp en MMLU-500, con caidas de hasta 25 pp en materias concretas (prehistory, professional_medicine, professional_psychology).
- Modelo sin filtros de seguridad: puede generar contenido danino, ilegal o eticamente problematico. No apto para despliegue orientado a usuarios finales sin moderacion externa.
- Riesgo de alucinacion no cuantificado en la informacion disponible; como todo modelo generativo, puede producir afirmaciones falsas con alta confianza.
- Solo soporta ingles segun la metadata; no se garantiza calidad en castellano ni otros idiomas.
- El contexto de 2M tokens es una declaracion del autor; no se documenta la degradacion de calidad a longitudes extremas ni el consumo real de memoria con contextos maximos.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias y el contenido generado puede infringir normativas locales; la responsabilidad recae en el desplegador.
- Compatibilidad limitada a Osaurus 0.25.32+ y vMLX; no hay soporte documentado para ecosistemas CUDA (vLLM, TGI) ni llama.cpp/Ollama.
- Repositorio con 0 descargas y 0 likes: sin validacion comunitaria ni reportes independientes de calidad.
- El autor declara no estar afiliado a Osaurus, vMLX ni ricursiveAI; el soporte del runtime no esta garantizado a largo plazo.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/dealignai/Ripple-65B-Preview-UNCENSORED-JANG_4D
- Variante hermana JANGH2: https://huggingface.co/dealignai/Ripple-65B-Preview-UNCENSORED-JANGH2
- Modelo base (repack JANG): https://huggingface.co/OsaurusAI/Ripple-65B-Preview-JANG_4D
- Modelo original: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Drafter DFlash2: https://huggingface.co/ricursiveAI/Ripple-65B-Preview-DFlash2
- Runtime Osaurus: https://osaurus.ai
- Web del autor: https://dealign.ai
- Perfil X del autor: https://x.com/dealignai

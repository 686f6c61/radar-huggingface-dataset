# arrochi112/onebee-gf-distill-v1

## Resumen

`onebee-gf-distill-v1` es un modelo de lenguaje multimodal (texto e imagen) de aproximadamente 2.000 millones de parametros efectivos, desarrollado por el usuario independiente `arrochi112` (repo `arjhinety`) dentro del proyecto de investigacion open source *small-mind-companion*. Se construye sobre `google/gemma-4-E2B-it` mediante un pipeline de post-entrenamiento en tres etapas: LoRA SFT, LoRA DPO y destilacion on-policy desde un profesor de 8B (`google/gemma-4-E4B-it`). El checkpoint resultante se fusiona en pesos completos y se publica con 5.104.297.539 parametros totales en safetensors.

El objetivo del modelo no es competir en capacidad bruta, sino estudiar cuanto rendimiento aparente puede recuperar un modelo pequeno con vision mediante post-entrenamiento y memoria externa, en lugar de escala de parametros. Su caso de uso central es el de un companero conversacional (companion persona) que responde condicionado a recuerdos recuperados de un almacen de memoria externo, sin depender de la longitud de contexto ni del recuerdo parametrico.

Es relevante ahora porque documenta de forma transparente una cadena completa de post-entrenamiento sobre un modelo Gemma 4 multimodal pequeno, incluye cuantizaciones GGUF para inferencia en dispositivo y publica metricas de calibracion (UAR) y consistencia de persona, con una errata explicita sobre las limitaciones de su benchmark. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma4 (transformer multimodal, texto + vision) |
| Parametros totales | 5.104.297.539 (safetensors); ~2B efectivos en el modelo base |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens (heredada del modelo base) |
| Tipos de cuantizacion | GGUF: F16 de referencia mas 12 niveles, hasta Q2_K (Q2_K defectuoso; usar Q3_K_S o superior); incluye proyector de vision |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers); GGUF en repo separado |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E2B-it`, un transformer multimodal de la familia Gemma 4 con capacidad de procesamiento de texto e imagen y un vocabulario compartido con el resto de la familia. Sobre esa base se aplica un adaptador LoRA de rango 16 en tres etapas encadenadas: primero SFT con 2232 ejemplos, despues DPO con 2049 pares de preferencia y finalmente destilacion on-policy con 2008 prompts durante 125 pasos. Cada etapa parte del checkpoint de la anterior y el adaptador final se fusiona en pesos completos.

La innovacion tecnica destacable es la aplicacion de destilacion on-policy *despues* del DPO, no en su lugar: el estudiante genera sus propias completions y se alinean con la distribucion del profesor de 8B mediante divergencia JSD generalizada usando `trl.DistillationTrainer`. El profesor (`gemma-4-E4B-it`) comparte tokenizador y vocabulario con el estudiante, requisito del trainer. La hipotesis de riesgo —que un profesor generico sin ajuste de persona degradara el estilo del estudiante— se midio explicitamente y no se confirmo: la consistencia de persona se mantuvo o mejoro.

## Capacidades

- Generacion de texto conversacional con persona de companero, condicionada a recuerdos recuperados de un almacen externo.
- Procesamiento de imagen y texto (`image-text-to-text`), heredado del modelo base multimodal.
- Calibracion y abstención: UAR del 71,25%, es decir, capacidad de abstenerse correctamente ante preguntas sin respuesta sin sobre-hedging en las que si la tienen.
- Consistencia de persona medida por dos vias: comparacion por pares con LLM juez (+7,6 pp a favor de este checkpoint) y medida estilometrica sin API (0,524 frente a 0,509 antes de la destilacion).
- Conversacion multi-turno con plantilla de chat (`apply_chat_template`) y rol de sistema.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explicito de agentes o razonamiento multi-paso.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Companero conversacional con memoria externa: el modelo recibe recuerdos recuperados por un sistema de retrieval y responde preguntas del usuario fundamentadas en ellos; es el uso evaluado en el proyecto y para el que se miden UAR y precision.
- Asistente personal de seguimiento de conversaciones: al combinarse con un almacen de memoria, puede responder a preguntas del tipo "¿a que conferencia dije que iba?" sin depender de que el historial completo quepa en contexto.
- Investigacion en post-entrenamiento de modelos pequenos: sirve como punto de referencia reproducible para estudiar SFT, DPO y destilacion on-policy encadenados sobre un modelo de ~2B con vision.
- Inferencia en dispositivo con llama.cpp: las cuantizaciones GGUF (Q3_K_S y superiores) permiten ejecutar el modelo y su proyector de vision en hardware de consumo para prototipos de companero local.
- Base para experimentos de cuantizacion y abliteration: el autor lo plantea explicitamente como referencia para nuevas pasadas de destilacion, cuantizacion o investigacion de abliteration.
- Evaluacion de calibracion y abstención: util en pipelines donde el coste de una respuesta inventada es alto y se quiere medir la tasa de abstención correcta frente a preguntas sin respuesta en memoria.
- Prototipado de interfaces multimodales de bajo coste: al aceptar imagen y texto, permite construir demos de asistente que comenta imagenes aportadas por el usuario junto con contexto recuperado.

## Benchmarks y rendimiento

Evaluacion sobre PMB (Personalized Memory Benchmark), 688 probes adversariales en 8 categorias, con LLM juez en doble orden para controlar sesgo de posicion y detector de abstención basado en reglas.

| Sistema | pra_lenient | UAR |
|---|---|---|
| SFT + memoria (pre-destilacion) | 15,30% | 70,0% |
| distill-v1 (este checkpoint) | 18,59% | 71,25% |

Advertencia del autor: existe una errata (ERRATA E43) que afecta a hasta 285 de las 608 preguntas respondibles de PMB, por lo que las cifras de `pra_lenient` deben interpretarse con cautela. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en F16: aproximadamente 10,2 GB solo de pesos (5,1B parametros), mas overhead de activaciones y del proyector de vision; en la practica, 12-16 GB para contexto moderado.
- Cuantizaciones GGUF: Q3_K_S y superiores reducen el peso a un rango aproximado de 2-4 GB segun nivel, lo que permite ejecucion en GPU de consumo; Q2_K esta reportado como defectuoso en generacion real y no debe usarse.
- GPU recomendadas: A100 o H100 para F16 con contexto largo (131.072 tokens); RTX 4090 (24 GB) para F16 con contexto moderado; RTX 3060/4060 Ti y similares con cuantizacion Q4/Q5.
- Cabe en GPU de consumo: si, mediante GGUF en llama.cpp, incluyendo el proyector de vision.
- Opciones de despliegue: transformers (referencia oficial), llama.cpp y derivados para los GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints gestionados. No se documenta soporte verificado de vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| onebee-gf-distill-v1 | 5,1B totales (~2B efectivos) | 131.072 | Apache-2.0 | Companion con memoria, multimodal, post-entrenado | HF + GGUF |
| google/gemma-4-E2B-it | ~2B efectivos | 131.072 | Gemma (terminos propios) | Modelo base instruct multimodal | HF |
| google/gemma-4-E4B-it | ~8B | no disponible | Gemma (terminos propios) | Modelo instruct mayor, usado como profesor | HF |

La comparativa cuantitativa frente a alternativas de la misma categoria no esta disponible en la informacion proporcionada: no hay resultados de benchmarks comunes entre este checkpoint y otros modelos comparables.

## Limitaciones y advertencias

- El checkpoint no incorpora memoria propia: sin el sistema de retrieval del proyecto, el caso de uso principal no funciona como se evaluo.
- Precision baja en terminos absolutos: `pra_lenient` del 18,59% sobre PMB, y parte de esa cifra esta afectada por la errata E43 del propio benchmark.
- Solo ingles; no se ha evaluado ni entrenado para otros idiomas.
- No evaluado ni destinado a decisiones criticas de seguridad, consejo medico, legal o financiero, ni a despliegues donde una respuesta incorrecta o excesivamente confiada cause dano real.
- Riesgo de alucinacion inherente a un modelo de ~2B efectivos; la calibracion medida (UAR 71,25%) no elimina ese riesgo.
- La cuantizacion Q2_K esta rota en pruebas de generacion reales; usar Q3_K_S o superior.
- Es un artefacto de investigacion de un proyecto independiente, con 0 likes y sin validacion externa; tratarlo como experimental en cualquier contexto de produccion.
- Licencia Apache-2.0 heredada, pero conviene verificar los terminos del modelo base Gemma 4 de Google antes de un uso comercial.
- No se documentan sesgos especificos medidos; no hay evaluacion de sesgo publicada en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arrochi112/onebee-gf-distill-v1
- Cuantizaciones GGUF: https://huggingface.co/arjhinety/onebee-gf-distill-v1-gguf
- Repositorio del proyecto: https://github.com/arjhinety/small-mind-companion
- Errata del benchmark PMB (E43): https://github.com/arjhinety/small-mind-companion/blob/main/reports/ERRATA.md
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Modelo profesor: https://huggingface.co/google/gemma-4-E4B-it

# shiva123782/RamaAi7996

## Resumen

RamaAi7996 es un adaptador LoRA de ajuste fino por instrucciones publicado por el usuario shiva123782 bajo la marca Shiva AI Labs. Se construye sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct, un transformer causal de 0,5 mil millones de parametros, y se distribuye como adaptador PEFT en formato safetensors. El repositorio no contiene pesos completos, sino unicamente las matrices de bajo rango entrenadas sobre el modelo base.

La propuesta del autor se centra en tres ejes: identidad de marca verificable, cumplimiento normativo declarado (EU AI Act articulo 53 y DPDP Act 2025 seccion 12 de India) y una supuesta certificacion formal de ausencia de fallos de memoria mediante el solver SMT Z3. El ajuste fino se realizo con LoRA de rango 16 y alpha 32 sobre todos los modulos lineales, con un dataset declarado de yahma/alpaca-cleaned y un pico de VRAM de entrenamiento de 3,2 GB.

El modelo es relevante como caso de estudio de adaptadores pequenos orientados a identidad corporativa y despliegue en hardware muy limitado, no por su rendimiento bruto. Su tamano de 0,5B y su licencia Apache 2.0 lo sitúan en la categoria de SLM para entornos con recursos escasos, aunque las afirmaciones de la model card sobre verificacion formal y benchmarks de identidad no vienen acompanadas de resultados estandar reproducibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen2.5) con adaptador LoRA |
| Parametros totales | 0,5 mil millones (modelo base Qwen2.5-0.5B-Instruct); parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | Entrenamiento en bfloat16/float16; forward con NormalFloat 4-bit (NF4) segun la model card; no se listan ficheros GGUF |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base Qwen2.5-0.5B-Instruct |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen2.5-0.5B-Instruct, un transformer causal denso de 0,5B parametros. El ajuste fino emplea rango r=16, alpha=32 y dropout 0,05, aplicado sobre los modulos q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj. La model card menciona un esquema LoRA+ con tasa de aprendizaje diferenciada para la matriz B (eta_B = 8,0 * eta_A). El entrenamiento se realizo en precision bfloat16/float16 con un pico de VRAM declarado de 3,2 GB, lo que permite ejecutarlo en una T4 de 15,5 GB o en GPUs de consumo.

El dataset declarado es yahma/alpaca-cleaned, un corpus de instrucciones en ingles derivado de Alpaca. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases de RLHF o DPO; la informacion disponible solo indica ajuste supervisado por instrucciones. Las innovaciones tecnicas destacadas por el autor (verificacion Z3 de cotas de VRAM, benchmark de identidad Feistel de 200 millones de consultas y "desvinculacion fisica" de adaptadores fragmentados para revocacion de consentimiento) no cuentan con resultados publicados verificables en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del ajuste por instrucciones del modelo base.
- Respuesta a instrucciones generales y tareas de formato tipo Alpaca.
- Identidad de marca declarada: el autor afirma que el modelo se identifica como "RamaAi7996, desarrollado por Shiva AI Labs" sin system prompt.
- Capacidad de cargarse como adaptador PEFT junto al modelo base mediante transformers y peft.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Prototipado de asistentes conversacionales en ingles con recursos minimos: el adaptador y el modelo base caben en GPUs de consumo, lo que permite iterar rapidamente en local sin infraestructura dedicada.
- Evaluacion de tecnicas LoRA en investigacion: sirve como ejemplo reproducible de ajuste con rango 16 y alpha 32 sobre todos los modulos lineales para estudiar el efecto en la identidad y el estilo de respuesta.
- Demostraciones de identidad corporativa en SLM: util para probar tecnicas de "branding" de modelos pequenos y medir la fidelidad de la identidad sin system prompt.
- Educacion y formacion: ejemplo didactico de pipeline PEFT con transformers, peft y cuantizacion NF4 para quienes aprenden ajuste fino eficiente.
- Pruebas de conformidad normativa simuladas: el autor declara alineamiento con EU AI Act y DPDP Act; puede usarse como plantilla de documentacion de cumplimiento, no como certificacion real.
- Despliegue en entornos con restricciones de memoria: el pico de entrenamiento de 3,2 GB y la inferencia en 4-bit permiten ejecucion en estaciones de trabajo modestas.
- Generacion de texto auxiliar de baja criticidad: borradores, resumenes cortos o respuestas plantilla donde el coste computacional es prioritario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card incluye unicamente metricas propias del autor:

| Metrica declarada | Resultado | Nota |
|---|---|---|
| Benchmark de identidad Feistel 20 crore | 100,0% sin colisiones, 0,0% de fuga | Metrica interna del autor, no verificable de forma independiente |
| Latencia de inferencia | 18,2 ms (P99) | Declarada por el autor |
| Throughput | 198+ tok/s | Declarado por el autor, hardware no especificado |
| Pico de VRAM de entrenamiento | 3,2 GB | Declarado por el autor |
| Verificacion Z3 | UNSAT_SAFE | Declarada por el autor |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en float16 para el modelo base de 0,5B; en torno a 0,5-1 GB adicionales para el adaptador y overhead; en 4-bit NF4 puede reducirse por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; T4, RTX 3060, RTX 4060, RTX 4090, A100 y H100 son suficientes y sobredimensionadas para este tamano.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna de consumo, e incluso en CPU para inferencia lenta.
- Opciones de despliegue: transformers + peft (ruta oficial), vLLM y TGI tras fusionar el adaptador con el modelo base; llama.cpp y Ollama requeririan conversion a GGUF, no incluida en el repositorio.
- Latencia y throughput: el autor declara 18,2 ms P99 y 198+ tok/s en una estacion de trabajo estandar, sin especificar hardware ni configuracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| RamaAi7996 | 0,5B (base) + LoRA | no disponible | Apache 2.0 | Hugging Face, adaptador PEFT | Identidad de marca y metricas internas del autor |
| Qwen2.5-0.5B-Instruct | 0,5B | 32K tokens (segun documentacion del modelo base) | Apache 2.0 | Hugging Face, pesos completos | Modelo base; capacidades y benchmarks publicos de Qwen |
| SmolLM2-360M-Instruct | 0,36B | 8K tokens (segun documentacion del modelo) | Apache 2.0 | Hugging Face, pesos completos | Alternativa SLM de Hugging Face para dispositivos |
| TinyLlama-1.1B-Chat | 1,1B | 2K-4K tokens (segun documentacion) | Apache 2.0 | Hugging Face, pesos completos | Mayor tamano, mas capacidad, mas VRAM |

## Limitaciones y advertencias

- Modelo base de 0,5B: capacidad de razonamiento, matematicas y codigo muy limitada en comparacion con modelos de 7B o superiores.
- Solo ingles: la etiqueta de idioma y el dataset de entrenamiento estan en ingles; el rendimiento en castellano no esta garantizado.
- Dataset de ajuste pequeno y generico (alpaca-cleaned): riesgo de sobreajuste al estilo Alpaca y de respuestas superficiales.
- Riesgo de alucinacion elevado por el tamano reducido del modelo.
- Las afirmaciones de verificacion formal Z3, benchmark de identidad de 200 millones y conformidad con EU AI Act y DPDP Act no son verificables de forma independiente con la informacion disponible; deben tratarse como declaraciones del autor, no como certificaciones.
- Repositorio con 0 descargas y 0 likes: sin validacion de la comunidad ni evidencia de uso en produccion.
- El adaptador requiere el modelo base Qwen2.5-0.5B-Instruct; no es un modelo autonomo.
- Licencia Apache 2.0 permisiva para uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo en produccion.
- No se documentan sesgos especificos; al heredar el modelo base y alpaca-cleaned, es probable que reproduzca sesgos presentes en esos datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shiva123782/RamaAi7996
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de ajuste: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Referencia de PEFT: https://github.com/huggingface/peft
- Referencia de Qwen2.5: https://github.com/QwenLM/Qwen2.5

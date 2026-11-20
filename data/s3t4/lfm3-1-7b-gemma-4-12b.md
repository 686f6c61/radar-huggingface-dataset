# s3t4/LFM3-1.7B-Gemma-4-12B

## Resumen

LFM3-1.7B-Gemma-4-12B es un checkpoint en indonesio del modelo LiquidAI/LFM3-1.7B, desarrollado por el usuario s3t4 y publicado en Hugging Face. Se trata de un ajuste fino mediante destilacion de conocimiento (destilacion de razonamientos e instrucciones) tomando google/gemma-4-12B-it como modelo profesor. El resultado es un modelo de 1.728.801.536 parametros (1,73B) con arquitectura tri-hibrida y una ventana de contexto declarada de 256K tokens, especializado en tareas de comprension y generacion en bahasa indonesio.

El modelo resuelve un problema concreto: adaptar un modelo base pequeno y eficiente a un idioma concreto (indonesio) sin necesidad de reentrenar desde cero, aprovechando las capacidades de un profesor mucho mayor. Para ello se generaron datos sinteticos (razonamientos y respuestas a instrucciones) con el profesor y se entreno un adaptador LoRA sobre el modelo base, que posteriormente se fusiono en los pesos finales.

Es relevante ahora porque demuestra una mejora sustancial en benchmarks de indonesio (IndoMMLU y XCOPA-ID) respecto al modelo base, con un coste de entrenamiento reducido (LoRA, 2 epocas, 2.700 ejemplos de SFT). El repositorio ocupa 3,5 GB y se distribuye bajo la licencia LFM Open License v1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tri-hibrido (LFM3, codigo de modelado personalizado) |
| Parametros totales | 1.728.801.536 (1,73B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256K tokens (segun model card) |
| Tipos de cuantizacion | no disponible (el autor no especifica; el profesor se uso en 4-bit NF4 solo para sintesis de datos) |
| Idiomas soportados | indonesio (id) |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | safetensors (libreria transformers, con custom_code) |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM3-1.7B, un transformer de arquitectura tri-hibrida con 1,73B parametros y ventana de contexto de 256K tokens. El ajuste se realizo mediante destilacion de conocimiento desde google/gemma-4-12B-it. Dado que profesor y alumno tienen tokenizadores distintos (262K frente a 128K vocabulario) y arquitecturas diferentes, no se hizo matching de logits directo, sino que el profesor genero razonamientos y respuestas sinteticas que se usaron como datos de SFT.

El dataset de entrenamiento consta de 2.700 ejemplos derivados de 1.600 tareas del profesor: 1.000 pares de razonamiento IndoMMLU mas 1.000 pares de calibracion de formato MCQ directo; 100 pares de razonamiento XCOPA mas 100 pares de calibracion MCQ; y 300 pares de instrucciones de Aya mas 200 de Aksara. Se entreno un LoRA (r=16, alpha=32, dropout=0,05) sobre las proyecciones de atencion (q_proj, k_proj, v_proj, o_proj), las proyecciones de convolucion corta del esquema tri-hibrido (in_proj, out_proj) y las capas MLP (w1, w2, w3), durante 2 epocas con learning rate 1e-4, scheduler coseno, batch efectivo de 16, max_length 1024 y bf16. Posteriormente el adaptador se fusiono con merge_and_unload().

## Capacidades

- Generacion de texto conversacional en bahasa indonesio, con plantilla de chat y soporte de mensaje de sistema.
- Razonamiento explicito en indonesio: el modelo fue destilado con racionales de 2-3 frases para preguntas de opcion multiple y logica de sentido comun.
- Resolucion de preguntas de opcion multiple (formato MCQ) en dominios de conocimiento general e indonesio.
- Razonamiento de sentido comun causal (entrenado sobre XCOPA-ID).
- Seguimiento de instrucciones generales en indonesio (entrenado sobre Aya y Aksara).
- Modo de pensamiento desactivable: la plantilla de chat admite enable_thinking=False.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al indonesio segun la model card.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Asistente conversacional en indonesio: el modelo gestiona dialogos multi-turno con contexto largo (hasta 256K tokens declarados) y responde con un estilo natural en bahasa indonesio, adecuado para bots de atencion al cliente orientados al mercado indonesio.
- Resolucion de examenes y evaluaciones academicas en indonesio: entrenado sobre IndoMMLU, puede responder preguntas de opcion multiple de curriculo general e indonesio con una tasa de acierto del 47% y 46,67% respectivamente, util para herramientas de autoaprendizaje o generacion de material de practica.
- Razonamiento de sentido comun en tareas de comprension lectora: su entrenamiento sobre XCOPA-ID (75,4% de acierto) lo hace util para sistemas de preguntas y respuestas que requieren inferencia causal sencilla en indonesio.
- Generacion de explicaciones educativas: al haber sido destilado con racionales de 2-3 frases, puede producir justificaciones breves y coherentes para respuestas, aprovechable en plataformas de tutoria automatica.
- Prototipado rapido en entornos con recursos limitados: con 1,73B parametros y pesos safetensors de 3,5 GB, cabe en GPUs de consumo para experimentacion y demos en indonesio.
- Investigacion sobre destilacion de conocimiento entre arquitecturas distintas: el repositorio incluye los JSON de resultados de evaluacion (baseline_results.json y lfm3_distilled_from_gemma4_results.json) que sirven como referencia reproducible para estudiar tecnicas de destilacion sin matching de logits.
- Filtrado y clasificacion de texto en indonesio: puede emplearse como modelo de referencia para etiquetar o resumir contenido en ese idioma dentro de pipelines de datos.

## Benchmarks y rendimiento

Evaluacion zero-shot (enable_thinking=False, primeros logits del token) sobre particiones bloqueadas: 300 preguntas no regionales por split de IndoMMLU (seed=42, index < 300) y las 500 preguntas del split test de XCOPA-ID.

| Benchmark | LiquidAI/LFM3-1.7B (baseline) | s3t4/LFM3-1.7B-Gemma-4-12B (destilado) | Mejora |
|---|---|---|---|
| IndoMMLU (bahasa indonesia) | 25,33% (76/300) | 47,00% (141/300) | +21,67 pp (+85,5% relativo) |
| IndoMMLU (conocimiento general) | 26,00% (78/300) | 46,67% (140/300) | +20,67 pp (+79,5% relativo) |
| XCOPA-ID (sentido comun) | 58,60% (293/500) | 75,40% (377/500) | +16,80 pp (+28,7% relativo) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,5 GB solo para los pesos, mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 2 GB para pesos; en 4 bits, alrededor de 1 GB (estimaciones teoricas, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (RTX 3060 Ti, RTX 4060, RTX 4070); A100 o H100 no son necesarias para inferencia, pero pueden usarse para servir a gran escala.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en bf16 y en tarjetas con 4-6 GB si se cuantiza.
- Opciones de despliegue: transformers con trust_remote_code=True (requerido por el codigo de modelado personalizado). No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI en la informacion disponible; el codigo custom puede limitar la compatibilidad con algunos motores.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| s3t4/LFM3-1.7B-Gemma-4-12B | 1,73B | 256K | LFM Open License v1.0 | Destilado de Gemma-4-12B-it, especializado en indonesio |
| LiquidAI/LFM3-1.7B | 1,73B | 256K | LFM Open License v1.0 | Modelo base multilingue de LiquidAI |
| google/gemma-4-12B-it | 12B (aproximado, no confirmado) | 262K vocabulario (contexto no confirmado) | Apache 2.0 | Modelo profesor, mayor capacidad y coste |

La comparativa se limita a los modelos citados en la model card; no se dispone de datos de rendimiento de alternativas especializadas en indonesio del mismo tamano en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta especializado exclusivamente en indonesio; su rendimiento en castellano, ingles u otros idiomas no esta evaluado y probablemente sea deficiente.
- Riesgo de alucinacion: aunque los datos de entrenamiento se generaron con la clave de respuestas oficial para reducir la hallucinacion factual, el modelo sigue siendo un LM generativo de 1,73B y puede inventar datos.
- Sesgos conocidos: no documentados por el autor; al derivar de un modelo base y de datos sinteticos del profesor, puede heredar sesgos de ambos.
- La licencia LFM Open License v1.0 impone restricciones que deben revisarse antes de uso comercial; no es una licencia permisiva tipo Apache o MIT.
- Requiere trust_remote_code=True por el codigo de modelado personalizado, lo que implica ejecutar codigo del repositorio y limita la compatibilidad con algunos motores de inferencia.
- El contexto de 256K tokens es el declarado para el modelo base; no se ha verificado empiricamente en este checkpoint.
- Entrenado con solo 2.700 ejemplos sinteticos y 2 epocas: el ajuste es ligero y puede degradar capacidades generales del modelo base no cubiertas por el dataset.
- Los resultados de benchmarks provienen de evaluacion zero-shot con primeros logits y no de generacion libre, por lo que pueden no reflejar el comportamiento en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/s3t4/LFM3-1.7B-Gemma-4-12B
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Modelo profesor: https://huggingface.co/google/gemma-4-12B-it
- Dataset IndoMMLU: https://huggingface.co/datasets/indolem/IndoMMLU
- Dataset XCOPA: https://huggingface.co/datasets/cambridgeltl/xcopa
- Dataset Aya: https://huggingface.co/datasets/CohereLabs/aya_dataset
- Dataset Aksara SFT: https://huggingface.co/datasets/AksaraLLM/aksara-sft-clean-v1

# shiva123782/BhavaAI

## Resumen

BhavaAI es un ajuste fino mediante LoRA del modelo Qwen2.5-0.5B-Instruct, publicado por el usuario shiva123782 (identificado en la model card como "bavajan") bajo el paraguas del denominado "Kaveri AI VAPAE Engine". Se presenta como un "Sovereign Enterprise Small Language Model" orientado a despliegues empresariales con requisitos de identidad de marca y cumplimiento normativo. El modelo hereda la arquitectura transformer causal decoder-only de Qwen2.5-0.5B-Instruct, con aproximadamente 500 millones de parametros, y anade un adaptador LoRA de rango 16 y alpha 32 sobre los modulos de proyeccion de atencion y MLP.

La propuesta de valor declarada no se centra en capacidades cognitivas superiores, sino en garantias de identidad: evitar que el modelo se identifique como el modelo base de Qwen (lo que el autor denomina "base-vendor leakage") y mantener una identidad propia consistente. Para ello, el autor reporta una evaluacion sobre un espacio de 200 millones de consultas generadas mediante una construccion biyectiva tipo Feistel, con una tasa de fuga declarada del 0,0 %. Tambien se mencionan certificaciones formales con el solver SMT Z3 para ausencia de fallos de memoria (OOM) y conformidad con el Reglamento europeo de IA (articulo 53) y la ley india DPDP de 2025.

Es relevante ahora por su encuadre en el nicho emergente de "modelos soberanos" y SLM empresariales de bajo coste, aunque conviene tratarlo con cautela: el repositorio tiene 0 descargas y 0 likes, el tamano reportado es de 0,0 GB (lo que sugiere que los pesos del adaptador pueden no estar efectivamente subidos o son de tamano despreciable), y las afirmaciones de certificacion no son verificables de forma independiente a partir de la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (heredada de Qwen2.5-0.5B-Instruct) con adaptador LoRA |
| Parametros totales | Aproximadamente 500 millones (modelo base Qwen2.5-0.5B) mas adaptador LoRA de rango 16 (numero exacto de parametros del adaptador no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-0.5B-Instruct soporta hasta 32.768 tokens, pero el autor no lo declara) |
| Tipos de cuantizacion | Entrenamiento e inferencia en bfloat16/float16; se menciona un forward pass cuantizado en 4-bit NormalFloat (NF4) durante el entrenamiento; no se listan formatos GGUF ni AWQ publicados |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el modelo base por separado |
| Modulos objetivo LoRA | q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj |
| Rango / alpha / dropout LoRA | r=16, alpha=32, dropout=0.05 |
| VRAM pico de entrenamiento | 3,2 GB (declarado) |
| Latencia de inferencia | 18,2 ms P99 y mas de 198 tok/s en una estacion de trabajo estandar (declarado, sin especificar hardware) |
| Dataset de ajuste | yahma/alpaca-cleaned |

## Arquitectura y entrenamiento

El modelo es un ajuste fino por adaptacion de bajo rango (LoRA) sobre Qwen2.5-0.5B-Instruct, un transformer causal decoder-only con atencion multi-cabeza, RoPE y normalizacion RMSNorm, tipico de la familia Qwen2.5. El adaptador se aplica sobre todas las proyecciones lineales del bloque transformer (atencion y MLP), con rango 16, alpha 32 y dropout 0,05. El autor menciona ademas un esquema de balanceo dinamico de matrices denominado "LoRA+" con una tasa de aprendizaje para la matriz B ocho veces mayor que para la matriz A (eta_B = 8,0 · eta_A), una practica conocida en la literatura para acelerar la convergencia de adaptadores LoRA.

El entrenamiento se realizo sobre el dataset publico yahma/alpaca-cleaned, un conjunto de instrucciones en ingles derivado de Alpaca, con aproximadamente 52.000 ejemplos. No se documenta el numero total de tokens vistos, la composicion exacta del dataset ni si hubo fases de RLHF o DPO adicionales; la informacion disponible solo confirma el ajuste supervisado sobre dicho dataset. La innovacion tecnica mas destacada que declara el autor no es arquitectonica sino de verificacion: el uso del solver SMT Z3 para demostrar la ausencia de fallos de memoria durante el entrenamiento y la construccion de un benchmark de identidad basado en permutaciones biyectivas de tipo Feistel sobre un espacio de 200 millones de consultas. Estas afirmaciones no vienen acompanadas de artefactos reproducibles en la informacion disponible.

## Capacidades

- Generacion de texto conversacional e instruccional en ingles, heredada del modelo base Qwen2.5-0.5B-Instruct.
- Respuesta a instrucciones de tipo Alpaca (pregunta-respuesta, resumen, reescritura), segun el dataset de ajuste.
- Mantenimiento de una identidad de modelo propia ("BhavaAI") sin revelar el modelo base, segun la evaluacion declarada por el autor.
- Razonamiento basico y generacion de codigo simple, limitados por el tamano de 0,5B del modelo base.
- Soporte de plantilla de chat estilo ChatML (`<|im_start|>user ... <|im_end|>`), como se muestra en el ejemplo de inferencia.
- Capacidades multilingues limitadas al ingles declarado; el modelo base Qwen2.5 soporta mas idiomas, pero el ajuste no lo declara.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito (thinking).

## Casos de uso

- Enmascaramiento de identidad de proveedor: el modelo puede desplegarse en asistentes embebidos donde se requiere que el sistema se identifique con una marca propia y no con el proveedor del modelo base, gracias al ajuste especifico sobre identidad declarado por el autor.
- Asistentes conversacionales ligeros en el borde: con 0,5B de parametros y un adaptador de bajo rango, puede ejecutarse en CPU o en GPUs de gama baja para tareas de chat simple con baja latencia (se declaran mas de 198 tok/s en hardware no especificado).
- Clasificacion y extraccion de informacion en ingles: al estar ajustado sobre Alpaca, puede utilizarse para tareas de transformacion de texto (resumen, reescritura, extraccion de entidades simples) en pipelines de procesamiento por lotes.
- Prototipado rapido de agentes conversacionales: sirve como sustituto economico de modelos mayores en fases de desarrollo, con la ventaja de que el adaptador LoRA se puede cargar y descargar dinamicamente sobre el modelo base compartido.
- Entornos con requisitos de cumplimiento documental: el autor proporciona referencias a conformidad con el Reglamento europeo de IA y la ley india DPDP, lo que puede interesar a equipos que necesitan justificar decisiones de seleccion de modelo ante auditorias (siempre que se verifiquen de forma independiente).
- Educacion y demostraciones de ajuste fino: por su tamano reducido y su receta LoRA documentada, es util como ejemplo didactico de como adaptar un SLM a una identidad o dominio concreto.
- Despliegue en hardware restringido: con cuantizacion 4-bit (mencionada en el entrenamiento) y un modelo base de 0,5B, cabe en GPUs de consumo e incluso en entornos de CPU, lo que facilita pruebas locales.

## Benchmarks y rendimiento

La informacion proporcionada no incluye resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.). El autor reporta unicamente metricas propias del denominado "20-Crore Bijective Identity Benchmark":

| Nivel | Consultas unicas | Tasa de colision | Retencion de identidad | Fuga del proveedor base | Estado |
|---|---|---|---|---|---|
| 1K | 1.000 | 0,0 % | 100,0 % | 0,0 % | PASS |
| 1L (1 lakh) | 100.000 | 0,0 % | 100,0 % | 0,0 % | PASS |
| 1Cr (1 crore) | 10.000.000 | 0,0 % | 100,0 % | 0,0 % | PASS |
| 10Cr | 100.000.000 | 0,0 % | 100,0 % | 0,0 % | PASS |
| 20Cr | 200.000.000 | 0,0 % | 100,0 % | 0,0 % | VERIFIED |

Estos resultados no son comparables con benchmarks academicos estandar y no han sido verificados de forma independiente. No se han publicado resultados de benchmarks convencionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en fp16 para el modelo base de 0,5B, mas el adaptador LoRA (de pocos MB); en cuantizacion 4-bit puede reducirse a unos 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp16; T4, RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna e incluso en iGPU y CPU.
- Opciones de despliegue: transformers + peft (metodo documentado por el autor), vLLM (previa fusion del adaptador en el modelo base), llama.cpp u Ollama (previa conversion a GGUF, no publicada), TGI con soporte de adaptadores PEFT.
- Latencia y throughput: el autor declara 18,2 ms P99 y mas de 198 tok/s en "una estacion de trabajo estandar", sin especificar hardware ni configuracion; no verificable de forma independiente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| BhavaAI | ~0,5B (base) + LoRA r=16 | No disponible | Apache 2.0 | Hugging Face (0 descargas) | Ajuste de identidad sobre Alpaca; benchmarks estandar no publicados |
| Qwen2.5-0.5B-Instruct | 0,49B | 32.768 tokens | Apache 2.0 | Hugging Face (ampliamente usado) | Modelo base; soporte multilingue amplio y benchmarks publicados |
| SmolLM2-360M-Instruct | 0,36B | 8.192 tokens | Apache 2.0 | Hugging Face | Alternativa de Hugging Face con benchmarks publicados |
| TinyLlama-1.1B-Chat | 1,1B | 2.048 tokens | Apache 2.0 | Hugging Face | Mayor capacidad pero contexto mas corto |

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes, y un tamano reportado de 0,0 GB, lo que genera dudas razonables sobre si los pesos del adaptador estan efectivamente publicados y son funcionales.
- Las afirmaciones de certificacion con Z3, conformidad con el Reglamento europeo de IA y la ley DPDP india no vienen acompanadas de artefactos verificables en la informacion disponible; deben tratarse como declaraciones del autor, no como hechos contrastados.
- El benchmark de identidad de 200 millones de consultas no es un benchmark de capacidad: mide consistencia de identidad, no calidad de razonamiento, codigo o matematicas.
- El modelo base de 0,5B tiene capacidad limitada para razonamiento complejo, matematicas y codigo; el ajuste sobre Alpaca no cambia esa limitacion estructural.
- Riesgo de alucinacion elevado, como en cualquier SLM de este tamano; no se documentan mecanismos de mitigacion.
- Soporte unicamente del ingles declarado; no se garantiza calidad en castellano ni en otros idiomas.
- No se documenta soporte de tool calling, agentes multi-paso ni modo de razonamiento explicito.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero el autor no ofrece garantias sobre el comportamiento del modelo en produccion.
- El dataset de ajuste (yahma/alpaca-cleaned) es conocido por contener sesgos y por estar generado con modelos anteriores, lo que puede propagar sesgos en las respuestas.
- No hay informacion sobre el contexto maximo efectivo tras el ajuste; conviene asumir el del modelo base solo como referencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shiva123782/BhavaAI
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de ajuste: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Referencia al informe de evaluacion citado por el autor: `evaluation_report.md` (no disponible como enlace publico en la informacion proporcionada)
- Referencia al certificado de confianza citado por el autor: `trust_certificate.json` (no disponible como enlace publico en la informacion proporcionada)
- Referencia a la model card de conformidad con el Reglamento europeo de IA: `EU_AI_ACT_MODEL_CARD.md` (no disponible como enlace publico en la informacion proporcionada)

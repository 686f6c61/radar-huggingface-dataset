# shiva123782/KaveriTitan-v1

## Resumen

KaveriTitan-v1 es un ajuste fino mediante LoRA del modelo Qwen2.5-0.5B-Instruct, publicado por el usuario shiva123782 bajo la marca Kaveri-Ventures. Se presenta como un "Sovereign Enterprise Small Language Model" orientado a entornos empresariales con requisitos de cumplimiento normativo. El modelo base es un transformer causal de 0,5 mil millones de parametros de la familia Qwen2.5, sobre el que se aplica un adaptador PEFT con rango 16 y alpha 32 sobre todas las proyecciones lineales (q, k, v, o, gate, up, down).

La propuesta diferencial del autor no reside en capacidades cognitivas superiores, sino en un conjunto de afirmaciones de verificacion formal y cumplimiento: una supuesta certificacion matematica de ausencia de fallos de memoria (OOM) mediante el solver SMT Microsoft Z3, una tasa de "zero-leak" del 100 % en un benchmark propietario de identidad basado en una red de Feistel de 28 bits (hasta 200 millones de consultas), y conformidad declarada con el Reglamento Europeo de IA (articulo 53) y la ley india DPDP de 2025 (seccion 12).

Es relevante ahora porque ejemplifica una tendencia creciente: modelos pequenos empaquetados con capas de certificacion y marketing de cumplimiento normativo. No obstante, el modelo tiene cero descargas y cero "likes" en Hugging Face en el momento de la consulta, y el repositorio ocupa 0,0 GB, lo que sugiere que los pesos del adaptador pueden no estar efectivamente alojados o son de tamano despreciable. El unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen2.5-0.5B-Instruct) con adaptador LoRA |
| Parametros totales | 0,5 mil millones (modelo base); parametros del adaptador no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Qwen2.5-0.5B-Instruct soporta hasta 32 768 tokens, pero el autor no lo declara) |
| Tipos de cuantizacion | 16-bit Bfloat16/Float16; forward pass con 4-bit NormalFloat (NF4) segun la model card |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Metodo de ajuste | LoRA, rango 16, alpha 32, dropout 0,05, LoRA+ con eta_B = 8,0 · eta_A |
| Modulos objetivo | q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj |
| VRAM pico de entrenamiento | 3,2 GB (declarado) |
| Latencia de inferencia | 18,2 ms P99 y 198+ tok/s (declarado por el autor) |
| Dataset de ajuste | yahma/alpaca-cleaned |

## Arquitectura y entrenamiento

El modelo es un ajuste fino por adaptacion de bajo rango (LoRA) sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only con atencion causal estandar. El adaptador se aplica sobre las siete proyecciones lineales del bloque transformer, con rango 16, alpha 32 y dropout 0,05. El autor menciona el uso de LoRA+ con una tasa de aprendizaje diferenciada para la matriz B ocho veces superior a la de la matriz A (eta_B = 8,0 · eta_A), una tecnica conocida para acelerar la convergencia de adaptadores de bajo rango. El entrenamiento se realizo en precision bfloat16/float16 con un pico de VRAM de 3,2 GB, lo que permite ejecutarlo en una GPU T4 de Kaggle.

El unico dataset de ajuste declarado es yahma/alpaca-cleaned, un conjunto de instrucciones en ingles derivado de Alpaca. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo fases de RLHF o DPO. Las innovaciones tecnicas destacadas por el autor no son arquitectonicas sino de verificacion: la certificacion Z3 de los limites de VRAM antes de la asignacion de kernels, el benchmark de identidad de 20 crore (200 millones) basado en una red de Feistel balanceada de 4 rondas sobre el dominio [0, 2^28), y un sello criptografico SHA-256 registrado en un fichero trust_certificate.json. Ninguno de estos elementos afecta a la calidad generativa del modelo; son artefactos de auditoria y cumplimiento.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del ajuste de instrucciones del modelo base.
- Respuesta a instrucciones generales del dominio Alpaca (preguntas factuales, explicaciones, tareas de escritura).
- Identidad de marca consistente: el modelo declara ser "KaveriTitan-v1, desarrollado por Kaveri-Ventures" incluso sin system prompt, segun el autor.
- Capacidad de seguir el formato de chat de Qwen2.5 (tokenizer y plantilla del modelo base).
- Soporte de tool calling / function calling: no declarado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no declarado.
- Capacidades multilingues: solo ingles declarado.
- Modo thinking, vision o audio: no disponible.
- Capacidades de codigo y matematicas: no evaluadas ni declaradas especificamente; las heredadas del modelo base de 0,5B son limitadas.

## Casos de uso

- Asistentes conversacionales ligeros en ingles: el modelo puede gestionar dialogos de instrucciones simples en entornos con recursos muy limitados, gracias a su tamano de 0,5B y su VRAM de inferencia reducida (por debajo de 2 GB en fp16).
- Despliegue en el borde (edge) y dispositivos consumer: al caber en GPUs de gama baja e incluso en CPU con cuantizacion, es adecuado para prototipos de asistentes locales sin conexion.
- Pruebas de identidad de marca y personalizacion corporativa: util para validar pipelines de ajuste fino que fuerzan una identidad de marca concreta sin system prompt, como demuestra el benchmark de identidad del autor.
- Educacion y demostraciones de PEFT: sirve como ejemplo didactico de ajuste LoRA sobre un modelo pequeno con documentacion de hiperparametros y verificacion de recursos.
- Filtrado y clasificacion de texto simple: tareas de etiquetado o reformateo de instrucciones en ingles donde la latencia importa mas que la profundidad de razonamiento.
- Base para experimentos de cumplimiento normativo: el repositorio incluye artefactos (trust_certificate.json, evaluation_report.md) que pueden servir como plantilla para documentar conformidad con EU AI Act o DPDP, aunque su validez legal no esta verificada de forma independiente.
- Generacion de respuestas en entornos con presupuesto de memoria estricto: el autor certifica con Z3 un pico de 3,2 GB en entrenamiento, lo que facilita su uso en notebooks y entornos CI con GPUs T4.

## Benchmarks y rendimiento

El autor no publica resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, etc.). Los unicos datos de rendimiento declarados son propietarios:

| Benchmark | Metrica | Resultado declarado |
|---|---|---|
| 20-Crore Feistel Identity Benchmark (200M consultas) | Tasa de colision | 0,0 % (zero collision) |
| 20-Crore Feistel Identity Benchmark (200M consultas) | Retencion de identidad | 100,0 % |
| 20-Crore Feistel Identity Benchmark (200M consultas) | Fuga al proveedor base (leakage) | 0,0 % |
| Inferencia en workstation estandar | Latencia P99 | 18,2 ms |
| Inferencia en workstation estandar | Throughput | 198+ tok/s |
| Entrenamiento | VRAM pico | 3,2 GB |

No se han publicado resultados de benchmarks estandar en la informacion disponible. Los datos anteriores son afirmaciones del autor no verificadas de forma independiente.

## Requisitos de hardware

- VRAM de inferencia: aproximadamente 1 GB en fp16 para el modelo base de 0,5B, mas el adaptador LoRA (tamano no especificado); en cuantizacion 4-bit NF4, por debajo de 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor menciona una T4 de 15,5 GB para entrenamiento y "workstation estandar" para inferencia.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas (GTX 1650, RTX 3050, RTX 4060, RTX 4090) e incluso en CPU con llama.cpp.
- Opciones de despliegue: transformers + PEFT (metodo documentado por el autor), vLLM y TGI requeririan fusionar el adaptador con el modelo base; llama.cpp y Ollama requeririan conversion a GGUF, no documentada por el autor.
- Latencia y throughput: 18,2 ms P99 y 198+ tok/s declarados por el autor en una workstation no especificada; no verificable de forma independiente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| KaveriTitan-v1 | 0,5B (base) + LoRA | No declarado | Apache 2.0 | Ingles | Publico en HF, 0 descargas |
| Qwen2.5-0.5B-Instruct | 0,5B | 32 768 tokens | Apache 2.0 | Multilingue (29+ idiomas) | Publico en HF, ampliamente usado |
| SmolLM2-360M-Instruct | 0,36B | 8 192 tokens | Apache 2.0 | Ingles principalmente | Publico en HF, muy usado |
| TinyLlama-1.1B-Chat | 1,1B | 2 048 tokens | Apache 2.0 | Ingles | Publico en HF, muy usado |

KaveriTitan-v1 no aporta mejoras de capacidad demostradas frente a su modelo base; su valor diferencial es el empaquetado de identidad de marca y los artefactos de cumplimiento. Frente a SmolLM2-360M y TinyLlama, el modelo base Qwen2.5-0.5B suele ofrecer mejor rendimiento en tareas de instrucciones, pero el ajuste con alpaca-cleaned no ha sido evaluado con benchmarks publicos.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 "likes", y un tamano de 0,0 GB, lo que sugiere que los pesos del adaptador pueden no estar disponibles o ser practicamente vacios; verificar antes de usar.
- Las afirmaciones de certificacion Z3, zero-leak y conformidad con EU AI Act y DPDP no han sido verificadas de forma independiente; deben tratarse como marketing del autor, no como garantia legal.
- El benchmark de identidad de 20 crore mide retencion de marca, no calidad generativa; no es un benchmark de capacidades.
- El modelo solo declara ingles; el rendimiento en castellano u otros idiomas no esta evaluado y probablemente sea deficiente.
- El ajuste con alpaca-cleaned es un dataset pequeno y generico; el riesgo de alucinacion y de respuestas superficiales es alto, especialmente en un modelo de 0,5B.
- No se declaran capacidades de tool calling, agentes ni razonamiento multi-paso; no es adecuado para pipelines agenticos.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero el autor no ofrece garantias ni soporte.
- El contexto maximo no esta declarado por el autor; aunque el modelo base soporta 32 768 tokens, el adaptador puede no haber sido entrenado para secuencias largas.
- Sesgos conocidos: no documentados por el autor; los heredados de Qwen2.5 y alpaca-cleaned (sesgos de genero, culturales y de dominio) no han sido mitigados de forma explicita.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shiva123782/KaveriTitan-v1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de ajuste: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Referencia de PEFT: https://huggingface.co/docs/peft
- Referencia de LoRA+: https://arxiv.org/abs/2402.12354
- EU AI Act, articulo 53: https://artificialintelligenceact.eu/article/53/
- Indian DPDP Act 2025: https://www.meity.gov.in/data-protection-framework

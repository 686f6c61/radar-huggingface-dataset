# bk201009xyz/spar-slm-v7

## Resumen

SPAR SLM v7 es un ajuste fino supervisado (LoRA-SFT) del modelo Qwen2.5-1.5B-Instruct, desarrollado por el usuario bk201009xyz. Está especializado en el dominio de la ciberseguridad: pruebas de penetración, detección defensiva (blue team) y seguridad de sistemas de control industrial (OT/ICS), con especial atención al contexto taiwanés. El modelo parte de una base densa de 1.543.714.304 parámetros (~1,54 mil millones) con arquitectura transformer decoder-only de la familia Qwen2, sobre la que se aplica un adaptador LoRA de rango 16 sobre 196 capas lineales.

El objetivo es ofrecer un modelo de lenguaje pequeño (SLM) capaz de responder consultas técnicas de seguridad con conocimiento específico de protocolos industriales como Modbus, algo poco cubierto en los modelos generalistas de este tamaño. Se distribuye bajo licencia Apache-2.0 con pesos en safetensors y es compatible con transformers y text-generation-inference.

La relevancia actual radica en la tendencia hacia modelos pequeños y especializados que pueden desplegarse en hardware modesto (el propio entrenamiento se realizó en una única Tesla T4 de 14,6 GB), aunque el autor documenta debilidades concretas en el conocimiento de Modbus y nmap que conviene tener presentes antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino con LoRA (r=16, 196 capas lineales) |
| Parametros totales | 1.543.714.304 (~1,54 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el corpus de entrenamiento usa secuencias de hasta 1024 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizacion a GGUF/AWQ no documentada) |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2.5, con 1,54 mil millones de parámetros, sobre el que se aplica un ajuste fino supervisado mediante LoRA de rango 16 sobre 196 capas lineales. No se modifica la arquitectura base; el adaptador se fusiona o se carga junto con los pesos del modelo Qwen2.5-1.5B-Instruct.

El entrenamiento se realizó sobre el corpus `spar-slm-v4-corpus` (fichero `corpus_v5.jsonl`), con 9.597 ejemplos (9.303 de entrenamiento y 288 de validación) y un total de 6.384.367 tokens. La longitud media de secuencia fue de 666 tokens, con mediana de 834 y máximo de 1024. Se entrenaron 2 épocas con batch de 2 y acumulación de gradientes de 4 (batch efectivo 8), tasa de aprendizaje 2e-4 con optimizador AdamW. El entrenamiento se ejecutó en una única GPU Tesla T4 de 14,6 GB con gradient checkpointing activado, durante 203 minutos, con un pico de VRAM de 9,11 GB. El resultado de evaluación reportado es un `eval_loss` de 1,4717. No se documenta uso de RLHF ni DPO; se trata exclusivamente de SFT.

## Capacidades

- Generación de texto conversacional en chino e inglés sobre temática de ciberseguridad.
- Conocimiento de pruebas de penetración (pentest): reconocimiento, explotación y post-explotación a nivel conceptual.
- Conocimiento de detección defensiva (blue team) según el enfoque del corpus de entrenamiento.
- Conocimiento de seguridad de sistemas de control industrial (OT/ICS), incluyendo el protocolo Modbus, aunque con las limitaciones documentadas por el autor.
- Soporte de conversación multi-turno (hereda el formato instruct de Qwen2.5-1.5B-Instruct).
- Capacidad de generación de explicaciones técnicas y procedimientos de seguridad.
- No se documenta soporte explícito de tool calling, function calling, agentes, visión ni audio.
- No se documenta modo de razonamiento extendido (thinking mode).

## Casos de uso

- Asistente de consulta técnica en ciberseguridad: el modelo puede responder preguntas sobre conceptos de pentest y defensa en chino o inglés, aprovechando el corpus especializado; adecuado para entornos de formación interna donde no se requiere precisión absoluta en detalles de configuración.
- Apoyo a analistas de seguridad OT/ICS: puede explicar conceptos generales de Modbus y seguridad industrial, útil como primer nivel de orientación, siempre con verificación humana dado el riesgo de confusión de códigos de función.
- Generación de documentación y material formativo: redacción de guías introductorias o resúmenes de buenas prácticas de seguridad a partir de las indicaciones del usuario.
- Chatbot de soporte para equipos de seguridad: conversaciones multi-turno en las que el modelo mantiene contexto sobre un tema de seguridad concreto, gracias a la base instruct de Qwen2.5.
- Prototipado rápido en hardware modesto: al ser un modelo de 1,54 B, puede desplegarse en GPUs de consumo o incluso en CPU con cuantización, lo que permite experimentar con un asistente especializado sin infraestructura dedicada.
- Investigación sobre ajuste fino en dominios verticales: sirve como referencia de un pipeline LoRA-SFT reproducible (corpus, hiperparámetros, hardware) para quienes quieran replicar la metodología en otros dominios.
- Filtrado y clasificación temática de consultas de seguridad: puede usarse como primer clasificador o generador de respuestas candidatas en un sistema mayor con verificación posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de evaluación reportado por el autor es `eval_loss = 1,4717` sobre el conjunto de validación del propio corpus.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión de 16 bits: aproximadamente 3,1 GB solo para los pesos (tamaño del repositorio), más overhead de activaciones y KV cache; en la práctica, unos 4-6 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: en torno a 1,6-2 GB para los pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 0,8-1,2 GB para los pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 sin cuantizar (RTX 3060/4060, RTX 4090, A100, H100). Cabe holgadamente en GPUs de consumo; el propio entrenamiento cupo en una Tesla T4 de 14,6 GB con pico de 9,11 GB.
- Opciones de despliegue: transformers (documentado por el autor), text-generation-inference (etiqueta `text-generation-inference`), y previsiblemente llama.cpp/Ollama/vLLM si se generan pesos GGUF o se usa el formato safetensors compatible, aunque estas rutas no están documentadas por el autor.
- Latencia y throughput: no disponibles. El autor recomienda generar al menos 400 tokens para que las respuestas no aparezcan truncadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SPAR SLM v7 | ~1,54 B | no disponible | Ciberseguridad, OT/ICS, Modbus | Apache-2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct (base) | ~1,54 B | 32.768 tokens (según ficha oficial de Qwen) | Generalista, instruct | Apache-2.0 | Hugging Face |
| Qwen2.5-1.5B (base) | ~1,54 B | 32.768 tokens (según ficha oficial de Qwen) | Generalista | Apache-2.0 | Hugging Face |

La comparación directa con otros modelos especializados en ciberseguridad del mismo tamaño no está disponible en la información proporcionada. Frente a su base Qwen2.5-1.5B-Instruct, SPAR SLM v7 añade especialización de dominio a costa de un corpus de entrenamiento reducido (6,38 M de tokens) y con cobertura temática desigual, según reconoce el propio autor.

## Limitaciones y advertencias

- El autor documenta explícitamente debilidades de conocimiento: el puerto 502 de Modbus/TCP aparece solo 8 veces en el corpus, por lo que el modelo puede responder con otro servicio; el código de función FC6 (Write Single Register) aparece solo 2 veces, con riesgo de confundirlo con FC3; y las opciones concretas de nmap (`-p 502 --open`, `--script modbus-discover`) están insuficientemente cubiertas.
- Riesgo de alucinación elevado en temas con poca representación en el corpus, tal como reconoce el autor ("弱勢領域會產生幻覺（實測）").
- Corpus de entrenamiento pequeño (9.597 ejemplos, 6,38 M de tokens) y desequilibrado por temas, lo que limita la cobertura y la fiabilidad en áreas periféricas.
- Idiomas limitados a chino e inglés; no se documenta soporte de castellano ni de otros idiomas.
- Longitud de contexto efectiva no documentada; el entrenamiento usó secuencias de hasta 1024 tokens, lo que puede limitar el rendimiento en contextos más largos aunque la base soporte más.
- Solo se reporta `eval_loss`; no hay benchmarks de capacidad (MMLU, HumanEval, GSM8K, etc.) que permitan evaluar su rendimiento real frente a alternativas.
- Uso comercial permitido por la licencia Apache-2.0, pero dado el dominio (ciberseguridad ofensiva) conviene revisar el cumplimiento legal y ético en cada jurisdicción antes de desplegarlo en producción.
- El modelo es de noviembre de 2026 según los metadatos; verificar que la información de la ficha sigue vigente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bk201009xyz/spar-slm-v7
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Corpus de entrenamiento (`spar-slm-v4-corpus`): no disponible como enlace público en la información proporcionada
- Paper, blog o repositorio adicional: no disponible en la información proporcionada

# latlat420/Cyber-Quack-14B-Q4_K_M-GGUF

## Resumen

Cyber-Quack-14B-Q4_K_M-GGUF es una cuantización en formato GGUF del modelo Cyber-Quack-14B, un ajuste fino de Qwen2.5-14B orientado a tareas de ciberseguridad, red team y desarrollo de exploits. El repositorio lo publica el usuario latlat420 y ha sido generado automáticamente mediante el espacio GGUF-my-repo de ggml.ai, que emplea llama.cpp para convertir los pesos originales de safetensors a GGUF con la cuantización Q4_K_M. El modelo base es jabbatheduck/Cyber-Quack-14B, entrenado con Axolotl según las etiquetas de la model card.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo de 14.770 millones de parámetros en hardware de consumo, gracias a la cuantización de 4 bits con tamaño de bloque K-quant. El repositorio ocupa 9,0 GB y está pensado para su uso con llama.cpp, tanto en CLI como en servidor. No obstante, se trata de una publicación sin tracción (0 descargas, 0 likes en el momento de la consulta) y con información técnica muy limitada: la model card es la plantilla generada por GGUF-my-repo y remite al modelo original para detalles.

La licencia declarada es Apache 2.0, heredada del modelo base Qwen2.5-14B, y el único idioma declarado es el inglés. No se han publicado resultados de benchmarks ni detalles sobre el dataset de ajuste fino en la información disponible, por lo que cualquier evaluación de capacidades debe hacerse empíricamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-14B; no se detalla en la model card) |
| Parametros totales | 14.770.033.664 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la model card de la cuantización no lo especifica; el ejemplo de llama-server usa `-c 2048`) |
| Tipos de cuantizacion | Q4_K_M (esta publicación); el modelo base podría ofrecer otras, no confirmado |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`cyber-quack-14b-q4_k_m.gguf`); el modelo base en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Qwen2.5-14B, un transformer decoder-only denso de 14.770 millones de parámetros. El ajuste fino Cyber-Quack-14B se realizó, según las etiquetas del repositorio, con Axolotl, una herramienta de fine-tuning ampliamente usada en la comunidad open source. Las etiquetas indican un enfoque en ciberseguridad, red team y desarrollo de exploits, lo que sugiere un dataset de instrucciones especializado en dominios ofensivos, aunque no se especifica el número de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO.

La publicación que nos ocupa es únicamente una conversión de formato: GGUF-my-repo aplica la cuantización Q4_K_M de llama.cpp sobre los pesos originales. No se introduce ningún cambio arquitectónico, de tokenizador ni de entrenamiento. No hay innovaciones técnicas destacables documentadas (ni decodificación especulativa, ni atención lineal, ni modos de pensamiento) más allá de las propias de Qwen2.5.

## Capacidades

- Generación de texto conversacional en inglés, con pipeline `text-generation` y etiqueta `conversational`.
- Especialización declarada en ciberseguridad: red team, análisis ofensivo y desarrollo de exploits (según etiquetas del autor).
- Razonamiento y generación de código, heredados de la base Qwen2.5-14B (no verificado empíricamente en esta cuantización).
- Compatibilidad con endpoints (`endpoints_compatible`), lo que permite servirlo vía infraestructura compatible con la API de Hugging Face.
- Ejecución local mediante llama.cpp (CLI y servidor HTTP).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Laboratorios de seguridad ofensiva: el modelo puede emplearse como asistente para redactar hipótesis de ataque, explicar vulnerabilidades y generar borradores de PoC en entornos controlados, aprovechando su ajuste específico en red team.
- Formación y concienciación en ciberseguridad: generar escenarios de phishing simulados, explicaciones de técnicas MITRE ATT&CK y material didáctico para equipos defensivos, con la ventaja de ejecutarse localmente sin enviar datos a terceros.
- Análisis de código en busca de patrones inseguros: al estar basado en Qwen2.5-14B, conserva capacidad de comprensión de código; puede integrarse en un pipeline local que revise repositorios y señale posibles malas prácticas.
- Despliegue en estaciones de trabajo con GPU de consumo: con 9,0 GB en Q4_K_M, cabe en GPUs de 12-16 GB de VRAM, lo que permite tener un asistente de seguridad local sin depender de la nube.
- Prototipado de herramientas de pentesting asistidas por LLM: servir el modelo con `llama-server` y conectarlo a scripts de reconocimiento para generar resúmenes de hallazgos y sugerencias de siguientes pasos.
- Investigación sobre alineamiento y seguridad de modelos: estudiar cómo un ajuste fino especializado en contenido ofensivo se comporta ante prompts de doble uso, y evaluar mecanismos de filtrado o mitigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9-11 GB con Q4_K_M (el archivo pesa 9,0 GB y hay que sumar overhead de contexto KV cache).
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 4070 Ti Super (16 GB), RTX 3090 (24 GB), A100/H100 para despliegues concurrentes.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más (RTX 3060 12 GB, RTX 4070 12 GB, RTX 4060 Ti 16 GB), siempre que se limite la longitud de contexto.
- Opciones de despliegue: llama.cpp (CLI y `llama-server`), y por compatibilidad de formato GGUF, también Ollama, LM Studio o llama-cpp-python. vLLM y TGI no soportan GGUF de forma nativa para este caso.
- Latencia y throughput: no disponibles; dependerán del hardware y del contexto configurado (el ejemplo oficial usa `-c 2048`).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cyber-Quack-14B-Q4_K_M-GGUF | 14,77 B | No disponible | Ciberseguridad / red team | Apache 2.0 | GGUF en HF (0 descargas) |
| Qwen2.5-14B-Instruct | 14,77 B | 32.768 tokens (según documentación de Qwen) | Propósito general, instrucciones | Apache 2.0 | Safetensors y múltiples cuantizaciones en HF |
| Qwen2.5-Coder-14B-Instruct | 14,77 B | 32.768 tokens (según documentación de Qwen) | Código | Apache 2.0 | Safetensors y GGUF en HF |
| WhiteRabbitNeo (familia) | 13 B / 33 B según variante | No disponible en esta ficha | Ciberseguridad ofensiva/defensiva | Según variante | Safetensors y GGUF en HF |

La comparación con Qwen2.5-14B-Instruct es la más directa, ya que Cyber-Quack deriva de ella: la diferencia es el ajuste fino especializado, a costa de perder la documentación y el soporte de la versión oficial. Frente a WhiteRabbitNeo, el nicho es el mismo, pero Cyber-Quack tiene mucha menos tracción y documentación pública.

## Limitaciones y advertencias

- Información técnica mínima: la model card es la plantilla automática de GGUF-my-repo y no documenta dataset, contexto, ni evaluación. Cualquier uso en producción requiere validación propia.
- Riesgo elevado de alucinación en contenido técnico de seguridad: un modelo ajustado en exploits puede generar comandos o PoC plausibles pero incorrectos o peligrosos si se ejecutan sin revisión.
- Contenido de doble uso: el ajuste en red team y exploit-dev puede producir material ofensivo; conviene desplegarlo con salvaguardas, registro de prompts y en entornos aislados.
- Sesgos: no documentados; al derivar de Qwen2.5 y entrenarse solo en inglés, es probable que herede sesgos del corpus original y un rendimiento deficiente en castellano u otros idiomas.
- Limitaciones de idioma: solo se declara inglés; no hay evidencia de calidad multilingüe.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; verificar la cadena de licencias del modelo base (Qwen2.5-14B, Apache 2.0).
- Madurez: 0 descargas y 0 likes, sin issues ni discusión pública; no hay evidencia de que el ajuste fino haya sido evaluado por terceros.
- Cuantización Q4_K_M: introduce pérdida de precisión frente a los pesos originales en FP16/BF16; tareas de razonamiento fino o generación de código exacto pueden degradarse.

## Enlaces

- Repositorio Hugging Face (cuantización GGUF): https://huggingface.co/latlat420/Cyber-Quack-14B-Q4_K_M-GGUF
- Modelo base del ajuste fino: https://huggingface.co/jabbatheduck/Cyber-Quack-14B
- Modelo original Qwen2.5-14B: https://huggingface.co/Qwen/Qwen2.5-14B
- Licencia Apache 2.0 referenciada: https://huggingface.co/Qwen/Qwen2.5-14B/blob/main/LICENSE
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Axolotl (herramienta de fine-tuning): https://github.com/axolotl-ai-cloud/axolotl

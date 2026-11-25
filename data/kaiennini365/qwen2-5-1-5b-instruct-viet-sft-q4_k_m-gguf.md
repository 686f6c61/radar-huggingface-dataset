# Kaiennini365/Qwen2.5-1.5B-Instruct-Viet-SFT-Q4_K_M-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF en formato Q4_K_M del modelo `jaeyong2/Qwen2.5-1.5B-Instruct-Viet-SFT`, un ajuste fino supervisado (SFT) sobre Qwen2.5-1.5B-Instruct orientado al idioma vietnamita. Lo publica el usuario Kaiennini365 y su función es facilitar la ejecución del modelo en entornos con recursos limitados mediante llama.cpp, sin necesidad de GPU de gama alta ni de infraestructura de servido compleja.

El modelo subyacente es un transformer decoder-only denso de 1.543.714.304 parámetros (aproximadamente 1,5 mil millones), derivado de la familia Qwen2.5, que incorpora ajuste por instrucciones y un entrenamiento adicional en vietnamita. La cuantización Q4_K_M reduce el peso a alrededor de 1 GB, lo que lo hace apto para portátiles, mini-PC y dispositivos de borde.

Su relevancia práctica radica en la combinación de licencia Apache 2.0, tamaño reducido y soporte nativo de llama.cpp, lo que permite desplegar un asistente conversacional bilingüe (vietnamita e inglés) en hardware modesto. No obstante, la información publicada es mínima: la model card es una plantilla automática de conversión y no documenta el dataset de SFT, los hiperparámetros ni evaluaciones de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2.5) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de la model card usa `-c 2048`) |
| Tipos de cuantizacion | Q4_K_M (este repositorio); otras cuantizaciones no disponibles |
| Idiomas soportados | vietnamita (vi), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `qwen2.5-1.5b-instruct-viet-sft-q4_k_m.gguf`) |

## Arquitectura y entrenamiento

La arquitectura corresponde a Qwen2.5-1.5B-Instruct, un transformer decoder-only denso con atención causal estándar, normalización RMSNorm y activación SwiGLU, tal como se define en la familia Qwen2.5. Sobre esa base, el autor del modelo original (`jaeyong2`) aplicó un ajuste fino supervisado (SFT) orientado al vietnamita, del que no se detallan en la información disponible el número de tokens, la composición del dataset, ni si hubo etapas de RLHF o DPO posteriores.

La contribución de este repositorio es exclusivamente la conversión a GGUF en cuantización Q4_K_M mediante el espacio `gguf-my-repo` de ggml.ai, que emplea llama.cpp. No se documentan innovaciones técnicas adicionales, ni decodificación especulativa, ni variantes de atención lineal. La información sobre el proceso de entrenamiento del modelo base ajustado es, por tanto, no disponible.

## Capacidades

- Generación de texto conversacional multi-turno en vietnamita e inglés.
- Seguimiento de instrucciones (modelo ajustado con SFT sobre una base Instruct).
- Razonamiento básico y respuesta a preguntas generales.
- Generación de código y matemáticas de complejidad baja, heredadas de Qwen2.5-1.5B-Instruct (sin garantías específicas tras el ajuste en vietnamita).
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el tamaño del modelo limita su fiabilidad en tareas agénticas complejas.
- Capacidades multilingües limitadas a vietnamita e inglés según los metadatos.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Asistente conversacional en vietnamita para atención al cliente: el modelo puede mantener diálogos multi-turno en dicho idioma con un coste de inferencia muy bajo, adecuado para respuestas frecuentes (FAQ, seguimiento de pedidos) en entornos sin GPU dedicada.
- Despliegue en dispositivos de borde y portátiles: gracias a la cuantización Q4_K_M (~1 GB), puede ejecutarse con llama.cpp en CPU en equipos con 4-8 GB de RAM, lo que permite asistentes locales sin conexión.
- Prototipado rápido de aplicaciones de PLN en vietnamita: sirve como base para validar pipelines de generación antes de escalar a modelos mayores, con tiempos de arranque y experimentación mínimos.
- Traducción y adaptación de contenido entre vietnamita e inglés: útil para borradores, resúmenes o reformulaciones en flujos editoriales internos, con revisión humana posterior.
- Filtrado y clasificación de texto en vietnamita: puede emplearse para etiquetar o resumir grandes volúmenes de documentos con un coste computacional reducido.
- Educación y demostraciones: adecuado para talleres y entornos docentes donde se enseña a desplegar modelos con llama.cpp, Ollama o servidores ligeros sin depender de infraestructura cloud.
- Integración en aplicaciones móviles o embebidas con llama.cpp: su tamaño permite incluirlo en apps que requieren inferencia local y privacidad de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,0-1,5 GB para el archivo Q4_K_M, más overhead del contexto; con 2-4 GB de RAM libre es suficiente en CPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, GTX 1650, RTX 3050 en adelante); también funciona en CPU sin GPU.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU de consumo modernas e incluso en iGPU con memoria unificada.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (mediante importación del GGUF), y cualquier runtime compatible con GGUF; no se documenta soporte verificado en vLLM o TGI para este artefacto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Kaiennini365/Qwen2.5-1.5B-Instruct-Viet-SFT-Q4_K_M-GGUF | 1,54 B | no disponible | vi, en | Apache 2.0 | GGUF |
| Qwen2.5-1.5B-Instruct (original) | 1,54 B | no disponible en esta ficha | multilingüe (incluye vi) | Apache 2.0 | safetensors, GGUF |
| jaeyong2/Qwen2.5-1.5B-Instruct-Viet-SFT (base de este repo) | 1,54 B | no disponible | vi, en | Apache 2.0 | safetensors |
| Otros ajustes vietnamitas de ~1,5 B | no disponible | no disponible | vi | variable | variable |

La comparación se limita a la familia de origen porque no se dispone de datos de rendimiento publicados para este artefacto ni para alternativas equivalentes en la información proporcionada.

## Limitaciones y advertencias

- La model card es una plantilla automática de conversión GGUF; no documenta el dataset de SFT, la metodología ni evaluaciones, lo que impide verificar la calidad del ajuste en vietnamita.
- Riesgo de alucinación inherente a modelos de 1,5 B, especialmente en tareas de razonamiento, matemáticas y hechos verificables.
- Ventana de contexto no documentada; el ejemplo de la model card emplea `-c 2048`, por lo que no debe asumirse un contexto largo sin verificación.
- Sesgos: no documentados por el autor; al derivar de Qwen2.5 y de un SFT en vietnamita, puede heredar sesgos del corpus original y del dataset de ajuste.
- Cobertura lingüística limitada a vietnamita e inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo base original y del ajuste intermedio antes de un uso comercial.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- Para producción, se recomienda evaluar el modelo frente a Qwen2.5-1.5B-Instruct original y frente a alternativas mayores si la calidad es crítica.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Kaiennini365/Qwen2.5-1.5B-Instruct-Viet-SFT-Q4_K_M-GGUF
- Modelo base del ajuste: https://huggingface.co/jaeyong2/Qwen2.5-1.5B-Instruct-Viet-SFT
- Espacio de conversión GGUF utilizado: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Familia Qwen2.5 (referencia del modelo original): https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct

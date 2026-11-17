# Morkon/ukr-sft-lfm3-v2-GGUF

## Resumen

`Morkon/ukr-sft-lfm3-v2-GGUF` es una versión afinada mediante SFT y cuantizada a GGUF del modelo base LiquidAI/LFM3-1.7B, desarrollada por el usuario independiente Morkon. El objetivo es disponer de un asistente conversacional en ucraniano que pueda ejecutarse localmente en CPU y dispositivos edge, manteniendo el inglés heredado del modelo original. Se distribuye únicamente en formato Q4_K_M (fichero de 1,1 GB) y está pensada para su uso con llama.cpp.

El modelo parte de una arquitectura LFM3 de LiquidAI con 24 bloques, dimensión oculta de 2048, FFN de 7680, 16 cabezas de atención y vocabulario de 128k tokens, sumando 1.728.801.600 parámetros. El ajuste se realizó en dos fases de LoRA-SFT sobre el dataset `Morkon/ukr-sft-lfm3-v2` (23.147 registros en formato `messages`), con `r=32`, `alpha=64` y `target_modules=all-linear`, entrenado en una única NVIDIA L4 (22,5 GB).

Su relevancia actual es acotada: cubre el nicho de asistentes ucranianos ligeros ejecutables en hardware modesto, pero no compite en conocimiento factual ni en razonamiento multietapa. La model card es transparente sobre sus limitaciones (gramática verbal, auto-descripción alucinada, traducción inestable) y publica métricas subjetivas y de velocidad en CPU, lo que facilita una evaluación realista antes de integrarlo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LFM3 (LiquidAI), transformer causal; 24 bloques, hidden 2048, FFN 7680, 16 cabezas, vocabulario 128k |
| Parámetros totales | 1.728.801.600 (1,73B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens en metadatos GGUF; 2.048 tokens de entrenamiento |
| Tipos de cuantización | Q4_K_M (GGUF, file_type 15); el repo solo publica ese cuantizado |
| Idiomas soportados | ucraniano (principal), inglés |
| Licencia | LFM Open License v1.0 (heredada de LiquidAI/LFM3-1.7B) |
| Formato de pesos | GGUF (llama.cpp) |
| Modelo base | LiquidAI/LFM3-1.7B |
| Adaptador LoRA | Morkon/ukr-sft-lfm3-v2-lora |
| Dataset de entrenamiento | Morkon/ukr-sft-lfm3-v2 (23.147 registros) |
| Tamaño del repo | 1,1 GB |
| Formato de chat | ChatML (`<|im_start|>` / `<|im_end|>`), plantilla jinja embebida |
| Tokens especiales | BOS `<|startoftext|>`, EOS `<|im_end|>` |
| Build de llama.cpp | `d3c3e24` |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B de LiquidAI es un transformer causal de 24 bloques con dimensión oculta 2048, FFN de 7680 y 16 cabezas de atención, sobre un vocabulario de 128k tokens. El ajuste se realizó mediante LoRA-SFT en dos etapas con TRL `SFTTrainer`, PEFT 0.21.3, precisión bf16, optimizador AdamW de 8 bits, `assistant_only_loss`, gradient checkpointing y semilla 42. La configuración LoRA usa `r=32`, `lora_alpha=64`, `lora_dropout=0.05`, `target_modules=all-linear` y `modules_to_save=embed_tokens, lm_head`.

La etapa A entrenó 2 épocas sobre los 21.990 registros de train del dataset v2, con learning rate 2e-4, warmup de 75 pasos, scheduler cosine, weight decay 0.01, batch efectivo 16 (4 × grad_accum 4) y longitud máxima 2.048. La etapa B aplicó 1 época sobre un subconjunto de 4.100 ejemplos de CoT más un 30% de replay (≈5.330 ejemplos), con learning rate 5e-5, warmup de 20 pasos y el mismo esquema de batch y longitud. Todo el entrenamiento se ejecutó en Google Colab sobre una NVIDIA L4 de 22,5 GB.

El dataset combina la base v1 filtrada (19.047 registros) con aportes adicionales, y sus fuentes originales son `lapa-llm/hermes3-uk` (traducción de NousResearch Hermes 3, CC-BY-SA-4.0) y `grammarly/spivavtor` (CC-BY-4.0); el conjunto se distribuye como CC-BY-SA-4.0. Tras el entrenamiento, el adaptador LoRA se fusionó con la base en bf16 (`merge_and_unload`), se convirtió a F16 GGUF con `convert_hf_to_gguf.py` y se cuantizó a Q4_K_M con `llama-quantize`. La plantilla de chat soporta un bloque `think...endthink`; en las pruebas con thinking desactivado el modelo respondió directamente sin bloque de razonamiento separado.

## Capacidades

- Generación de texto conversacional en ucraniano con fluidez y en inglés heredado del modelo base.
- Razonamiento aritmético básico y problemas lógicos sencillos: la model card reporta 5/5 en una suma de manzanas y peras y 5/5 en un acertijo de hermanos.
- Generación de código: 5/5 en la prueba subjetiva de una función Python de suma con ejemplo de uso.
- Respuestas estructuradas: capaz de seguir formatos de lista y plantillas, aunque en la prueba de plan a 3 días no respetó el formato (3,5/5).
- Soporte de plantilla de chat tipo ChatML con `--jinja` en llama.cpp, incluyendo bloques de sistema, usuario y asistente.
- Soporte de bloque `think` en la plantilla, aunque en las pruebas con thinking desactivado respondió de forma directa; no se documenta un modo de razonamiento profundo verificado.
- Capacidades multilingües limitadas a ucraniano e inglés; no se documentan otros idiomas.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso con agentes.

## Casos de uso

- Asistente de chat local en ucraniano sobre CPU: con 1,1 GB en Q4_K_M y 16,6–16,9 tok/s de generación en un Xeon E5-2650 con `numactl node0` y `-t 8`, es viable como chatbot de escritorio o servicio interno sin GPU.
- Despliegue edge en dispositivos con poca memoria: el fichero de 1,1 GB y la arquitectura de 1,73B permiten ejecución en equipos con 8 GB de RAM o menos usando llama.cpp con contexto moderado (4K–8K).
- Prototipado de interfaces conversacionales en ucraniano: gracias a la plantilla jinja embebida y a `llama-server` con `--jinja`, se puede montar un endpoint HTTP compatible con el formato ChatML para demos y pruebas de UX.
- Generación de snippets de código y explicaciones breves: útil para autocompletar funciones pequeñas o traducir pseudocódigo a Python en entornos con restricciones de conectividad, aceptando revisión humana.
- Tareas educativas de aritmética y lógica elemental: la model card reporta resultados correctos en sumas y acertijos simples, por lo que puede emplearse en asistentes de refuerzo escolar con supervisión.
- Filtrado o generación de respuestas en pipelines de anotación ucraniana: al ser un modelo pequeño y rápido en CPU, puede emplearse para preetiquetar conversaciones o generar borradores que luego se revisan.
- Base para fine-tuning adicional en ucraniano: al estar disponible el adaptador LoRA y el dataset, sirve como punto de partida para especializaciones verticales (atención al cliente, soporte técnico) con presupuesto de cómputo mínimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K) en la información disponible. La model card solo incluye una evaluación subjetiva de 6 prompts con `temperature=0.6`, `top_k=50`, thinking desactivado y Q4_K_M:

| Prueba | Puntuación | Comentario |
|---|---|---|
| Saludo / auto-presentación | 3/5 | Lenguaje fluido, pero inventó su edad y distorsionó su nombre |
| Aritmética (5 manzanas + 3 peras) | 5/5 | Correcto y breve |
| Función Python de suma | 5/5 | Código y ejemplo correctos |
| Diferencia entre "вживати" / "вжити" | 2/5 | Confunde el aspecto verbal e inventa ejemplos |
| Lógica (3 hermanos + hermana) | 5/5 | Respuesta y razonamiento correctos |
| Plan a 3 días | 3,5/5 | Contenido aceptable, formato no respetado |
| Media | ≈3,9/5 | Valoración subjetiva, no es un benchmark |

Rendimiento en CPU (Xeon E5-2650, AVX-only, 24 GB RAM, llama.cpp, Q4_K_M, contexto 4K, 128 tokens generados):

| Configuración | Generación | Prompt eval |
|---|---|---|
| `-t 16`, sin NUMA | 16,1–16,5 tok/s | 58 tok/s |
| `-t 8`, sin NUMA | 15,7–15,9 tok/s | 34 tok/s |
| `numactl node0`, `-t 8` | 16,6–16,9 tok/s | 32–70 tok/s |

No se han publicado cifras de rendimiento en GPU en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para GPU; en CPU el fichero Q4_K_M ocupa 1,1 GB y con contexto de 4K–8K el consumo de RAM se sitúa en el entorno de 2–4 GB (estimación a partir del tamaño del fichero y de la caché KV, no publicada por el autor).
- GPU recomendadas: no especificadas por el autor; el entrenamiento se realizó en una NVIDIA L4 (22,5 GB). Para inferencia, cualquier GPU con al menos 2–4 GB libres debería acomodar el modelo en Q4_K_M, aunque no se aportan cifras.
- ¿Cabe en GPU de consumo? Sí, en principio cabe en cualquier GPU de consumo con 4 GB o más de VRAM en Q4_K_M; no se han publicado mediciones concretas en RTX 4090, RTX 3060 u otras.
- Opciones de despliegue: llama.cpp (`llama-cli` y `llama-server` con `--jinja`), y por compatibilidad de formato GGUF también otras herramientas basadas en llama.cpp. Se requiere `--jinja` para usar la plantilla de chat embebida y `-ngl 99` para descarga completa en GPU.
- Latencia y throughput: en CPU, 16,6–16,9 tok/s de generación y 32–70 tok/s de prompt eval en el hardware indicado. En GPU no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Morkon/ukr-sft-lfm3-v2-GGUF | 1,73B | 262.144 en metadatos; 2.048 de entrenamiento | uk, en | LFM Open License v1.0 | GGUF Q4_K_M | Afinado SFT para ucraniano; 1,1 GB |
| LiquidAI/LFM3-1.7B | 1,73B | no disponible en la información | no disponible | LFM Open License v1.0 | safetensors | Modelo base sin ajuste específico para ucraniano |
| Modelos ucranianos de la familia Hermes3-uk | no disponible | no disponible | uk | CC-BY-SA-4.0 (dataset) | no disponible | Fuente del dataset; no se dispone de especificaciones del modelo en la información |
| grammarly/spivavtor | no disponible | no disponible | uk | CC-BY-4.0 (dataset) | no disponible | Fuente del dataset; no es un modelo comparable directo |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas. La comparativa se limita a parámetros, licencia y disponibilidad de formato.

## Limitaciones y advertencias

- Tamaño de 1,7B: knowledge factual profundo, léxico poco frecuente y razonamiento multietapa son puntos débiles; no debe usarse como fuente de verdad.
- Alucinaciones en la auto-descripción: la model card documenta que inventa su edad, su nombre y detalles sobre sí mismo; conviene fijar un system prompt que evite preguntas meta.
- Gramática: confunde el aspecto verbal ucraniano y otras categorías finas; no es fiable como referencia lingüística.
- Traducción en→uk y uk→en inestable: la model card menciona omisiones y errores en las pruebas de traducción.
- Contexto: aunque los metadatos declaran 262.144 tokens, el entrenamiento se realizó con 2.048 tokens; el comportamiento más allá de esa longitud no está validado y puede degradarse.
- Licencia: LFM Open License v1.0 (no es una licencia OSI estándar); deben revisarse las condiciones para uso comercial antes de desplegarlo en producción.
- Dataset con licencia CC-BY-SA-4.0: las obligaciones de atribución y compartición derivadas del dataset pueden afectar a productos derivados; conviene verificar la compatibilidad con la licencia LFM.
- Idiomas: solo ucraniano e inglés; no se garantiza calidad en otros idiomas.
- Disponibilidad: 1 descarga y 0 likes en el momento de la ficha; no hay validación comunitaria ni resultados de terceros.
- Formato: solo se publica Q4_K_M; no hay versiones F16, Q5, Q8 ni safetensors del modelo fusionado en el repo de GGUF.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Morkon/ukr-sft-lfm3-v2-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Adaptador LoRA: https://huggingface.co/Morkon/ukr-sft-lfm3-v2-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/Morkon/ukr-sft-lfm3-v2
- Licencia LFM Open License v1.0: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Dataset fuente lapa-llm/hermes3-uk: https://huggingface.co/datasets/lapa-llm/hermes3-uk
- Dataset fuente grammarly/spivavtor: https://huggingface.co/datasets/grammarly/spivavtor

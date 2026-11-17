# openamer-max/openamer-max-phone-adapter

## Resumen

OpenAmer-Max Phone es un adaptador LoRA publicado por el desarrollador independiente openamer-max, diseñado para especializar el modelo base Qwen/Qwen2.5-3B-Instruct en tareas asociadas al nivel "Phone" (3,1B de parámetros) de la familia OpenAmer-Max. El adaptador se distribuye como pesos PEFT en formato safetensors (0,3 GB) y emplea un rango r=32 con alpha=64 sobre 7 módulos objetivo del transformer subyacente. Su licencia es Apache 2.0 y los idiomas declarados son alemán (de) y bosnio (bs).

El modelo base, Qwen2.5-3B-Instruct, es un transformer decoder-only de 3,1B parámetros desarrollado por Alibaba Qwen, con soporte nativo de instrucciones y contexto largo. Sobre él, este adaptador añade una capa de ajuste fino orientada a un "banco de pruebas" (Prüfstand) congelado de 45 tareas, según declara el autor. La relevancia del adaptador radica en su carácter ligero: al ser un LoRA, permite reproducir el comportamiento del modelo publicado sin necesidad de cargar pesos completos, y su reducido tamaño (0,3 GB) lo hace desplegable en entornos con recursos limitados.

Es importante señalar que el autor indica explícitamente que el adaptador no fue evaluado de forma independiente contra el banco de pruebas: la puntuación de 43/45 (95,6 %) corresponde al archivo GGUF distribuido, no a estos pesos LoRA por sí solos. Además, el contexto máximo medido es de 30.655 tokens (94 % de los 32.768 declarados), lo que resulta insuficiente para el agente OpenAmer, que exige al menos 64.000 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre transformer decoder-only Qwen2.5-3B-Instruct |
| Parametros totales | 3,1B (modelo base) + adaptador LoRA (r=32, alpha=64, 7 modulos objetivo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens maximos; 30.655 tokens medidos (94 %) |
| Tipos de cuantizacion | no disponible para el adaptador; el modelo base Qwen2.5-3B-Instruct soporta cuantizacion GGUF/AWQ/GPTQ (no especificado en la informacion) |
| Idiomas soportados | aleman (de), bosnio (bs) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA); el autor menciona un GGUF distribuido por separado |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen2.5-3B-Instruct, un transformer decoder-only con atención causal estándar, 3,1B parámetros y ventana de contexto nativa de 32.768 tokens. La adaptación se realiza mediante LoRA con rango r=32 y alpha=64, aplicada a 7 módulos objetivo del modelo base (no se especifica en la información disponible cuáles son exactamente). El resultado es un conjunto de pesos de bajo rango que modifican el comportamiento del modelo base sin alterar sus pesos originales.

El entrenamiento se enmarca en una cadena de etapas definida en `train_phone_stage.py`, siendo `out_phone5` la última etapa disponible. No se detalla en la información proporcionada el volumen de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. El autor menciona un "banco de pruebas congelado" de 45 tareas (Prüfstand) sobre el que el GGUF distribuido alcanza 43/45, pero no se aportan detalles sobre la naturaleza de dichas tareas ni sobre el proceso de evaluación del adaptador de forma aislada.

## Capacidades

- Generación de texto e instrucciones en alemán y bosnio, heredadas del ajuste del modelo base Qwen2.5-3B-Instruct.
- Razonamiento y respuesta a preguntas dentro de la ventana de contexto de 32.768 tokens (30.655 medidos).
- Especialización en el dominio "Phone" de la familia OpenAmer-Max, orientada presuntamente a tareas de asistencia telefónica o conversacional (no detallado en la información).
- Soporte de plantilla de chat mediante `apply_chat_template` de Qwen2.5, con roles user/assistant.
- Capacidad multilingüe limitada a los idiomas declarados (de, bs); no se confirma soporte de español ni de otros idiomas.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Asistencia conversacional en alemán: el adaptador puede gestionar diálogos multi-turno en alemán gracias a la ventana de contexto de hasta 30.655 tokens medidos, adecuado para atención al cliente telefónica o por chat donde se requiere mantener el hilo de la conversación.
- Respuestas a preguntas frecuentes en bosnio: para organizaciones que atienden a usuarios en bosnio, el adaptador ofrece generación de respuestas en ese idioma sobre el modelo base, con un coste de despliegue reducido al ser un LoRA de 0,3 GB.
- Prototipado rápido de asistentes de voz: al ser un adaptador ligero sobre un modelo de 3,1B, puede integrarse en pipelines de ASR + LLM + TTS para demos de asistentes telefónicos sin requerir GPUs de gran capacidad.
- Evaluación comparativa de la familia OpenAmer-Max: investigadores que quieran reproducir el comportamiento del nivel Phone (43/45 en el Prüfstand) pueden cargar este adaptador sobre Qwen2.5-3B-Instruct en lugar del GGUF completo, facilitando experimentos de ablación.
- Despliegue en entornos con recursos limitados: al ocupar 0,3 GB en safetensors, el adaptador puede cargarse junto al modelo base cuantizado en GPUs de consumo, permitiendo inferencia local para tareas de generación de texto en alemán o bosnio.
- Filtrado y clasificación de texto en alemán: el ajuste sobre el modelo base puede emplearse para tareas de moderación o clasificación de mensajes en alemán dentro de un flujo de atención telefónica, aunque no se documenta entrenamiento específico para clasificación.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| Prüfstand congelado (45 tareas) | 43/45 (95,6 %) | Corresponden al GGUF distribuido, no al adaptador LoRA de forma aislada |
| Contexto medido | 30.655 tokens (94 % de 32.768) | Segun documentacion de medicion del autor |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA ocupa 0,3 GB; el modelo base Qwen2.5-3B-Instruct en FP16 requiere aproximadamente 6,2 GB de VRAM, y en cuantizacion de 4 bits alrededor de 2 GB (estimacion estandar para 3,1B, no confirmada en la informacion).
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano del modelo base, una RTX 3090/4090 (24 GB) o una A100/H100 permiten cargar el modelo en FP16 con holgura; una RTX 3060 (12 GB) o superior seria suficiente para FP16.
- Cabe en GPU de consumo: si, el modelo base de 3,1B en cuantizacion de 4 bits cabe en GPUs con 6-8 GB de VRAM (p. ej., RTX 3060, RTX 4060), aunque no se confirma en la informacion.
- Opciones de despliegue: al ser un adaptador PEFT, se carga con `peft` + `transformers`. El autor menciona un GGUF distribuido por separado, lo que permitiria despliegue con llama.cpp u Ollama, pero no se detalla en la informacion. vLLM y TGI no se mencionan.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenAmer-Max Phone (este adaptador) | 3,1B (base) + LoRA | 32.768 (30.655 medidos) | 43/45 en Prüfstand (GGUF) | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen2.5-3B-Instruct (base) | 3,1B | 32.768 | No disponible en esta ficha | Apache 2.0 | Hugging Face (ampliamente usado) |
| OpenAmer-Max Watch | 0,60B | No disponible | 45/45 (100 %) en Prüfstand | No disponible | Hugging Face |
| OpenAmer-Max Tab | 7,6B | No disponible | 42/45 (93,3 %) en Prüfstand | No disponible | Hugging Face |

La comparativa con modelos de la misma categoria (adaptadores LoRA sobre Qwen2.5-3B) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador no fue evaluado de forma independiente contra el Prüfstand: la puntuacion de 43/45 corresponde al GGUF distribuido, no a estos pesos LoRA, tal como admite el autor.
- La ventana de contexto medida (30.655 tokens) es insuficiente para el agente OpenAmer, que exige al menos 64.000 tokens; no es apto para ese caso de uso.
- Idiomas limitados a aleman y bosnio; no se confirma soporte de español ni de otros idiomas, lo que restringe su uso en entornos hispanohablantes.
- Riesgo de alucinacion inherente a los modelos de 3,1B, especialmente en tareas de razonamiento complejo o matemáticas; no se documentan mitigaciones específicas.
- Sesgos conocidos: no disponible en la informacion proporcionada; se heredan los sesgos del modelo base Qwen2.5-3B-Instruct y del dataset de ajuste, no detallado.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en producción ni sobre la calidad del adaptador en dominios distintos al banco de pruebas.
- El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validacion por parte de la comunidad; no hay evidencia externa de su comportamiento.
- No se documenta soporte de tool calling, agentes multi-paso ni modo thinking, lo que limita su uso en pipelines agénticos.
- El proyecto es mantenido por una sola persona y depende de donaciones, lo que supone un riesgo de mantenimiento a largo plazo.

## Enlaces

- Hugging Face: https://huggingface.co/openamer-max/openamer-max-phone-adapter
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Documentacion de medicion de contexto: https://github.com/openamer-max/models/blob/main/docs/KONTEXT-MESSUNG.md
- OpenAmer-Max Watch: https://huggingface.co/openamer-max/openamer-max-watch
- OpenAmer-Max Tab: https://huggingface.co/openamer-max/openamer-max-tab
- OpenAmer-Max Desktop: https://huggingface.co/openamer-max/openamer-max-desktop
- OpenAmer-Max Pro: https://huggingface.co/openamer-max/openamer-max-pro
- OpenAmer-Max Ultra: https://huggingface.co/openamer-max/openamer-max-ultra
- Donaciones (PayPal): https://www.paypal.com/qrcodes/managed/bfb5b6b5-c04c-4836-af60-987dff8cff61

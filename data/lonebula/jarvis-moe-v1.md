# LoNebula/jarvis-moe-v1

## Resumen
My-Jarvis MoE v1 es un ajuste fino del modelo Qwen3-30B-A3B, un transformer de tipo Mixture-of-Experts con 30.532 millones de parámetros totales y 3.300 millones activos por token, desarrollado por LoNebula (Nebou Rocket). El modelo se presenta como un asistente personal bilingüe japonés-inglés que aprende el nombre, preferencias y tono del usuario a partir de la conversación, sin incorporar datos personales de ningún propietario en los pesos. Resuelve el problema de los asistentes personalizados que requieren datos privados embebidos: aquí la personalización ocurre en tiempo de inferencia mediante un fichero de perfil y memoria local.

La relevancia actual radica en su enfoque de privacidad por diseño: los pesos son públicos y no contienen información personal, de modo que cada usuario construye su contexto localmente con `scripts/my_jarvis_pipeline.py` y, opcionalmente, con un adaptador LoRA privado. El modelo se distribuye con pesos fusionados en bfloat16, shards safetensors de 5 GB y licencia Apache-2.0, lo que facilita su uso comercial y su despliegue con `transformers`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (qwen3_moe) |
| Parámetros totales | 30.532.122.624 |
| Parámetros activos | 3.300 millones por token |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4-bit NF4 con doble cuantización (usada en el entrenamiento QLoRA); pesos publicados en bfloat16; cuantización posterior no documentada |
| Idiomas soportados | japonés (ja), inglés (en) |
| Licencia | Apache-2.0 (sujeta a la licencia del modelo base) |
| Formato de pesos | safetensors fusionados en bfloat16, shards de 5 GB |

## Arquitectura y entrenamiento
El modelo parte de Qwen3-30B-A3B, un transformer con capas de mezcla de expertos (MoE) que activa 3.300 millones de parámetros por token sobre un total de 30.532 millones. El ajuste se realizó mediante QLoRA en 4 bits (NF4 con doble cuantización y cómputo en bf16) sobre las proyecciones de atención y de los expertos MoE, y posteriormente los adaptadores se fusionaron en los pesos base. El resultado son pesos bfloat16 listos para cargar con `transformers`, sin necesidad de aplicar adaptadores en inferencia.

Los datos de entrenamiento son exclusivamente públicos: el subconjunto japonés-inglés del Aya Dataset de CohereLabs (Apache-2.0), con aproximadamente 202.362 ejemplos totales en 65 idiomas de los que se usa la porción JA/EN limitada para un trabajo en una sola GPU, y una muestra limitada del corpus de instrucciones japonés izumi-lab/llm-japanese-dataset (CC BY-SA 4.0). No se empleó ningún corpus de identidad del propietario ni ejemplos de persona en los pesos. El ajuste se hizo con la plantilla de chat de Qwen3 en modo no-thinking (`enable_thinking=False`), lo que condiciona la inferencia posterior.

## Capacidades
- Generación de texto conversacional bilingüe japonés-inglés, respondiendo en el idioma en que escribe el usuario.
- Asistencia personal con aprendizaje del nombre, intereses, tono preferido y rutinas a partir de la conversación y de la memoria local.
- Onboarding inicial con tres preguntas (nombre, intereses, tono) y persistencia en `~/.my-jarvis/profile.json` y `~/.my-jarvis/memory.jsonl`.
- Construcción de contexto por turno como `system(profile) + memoria reciente + mensaje del usuario`, sin reentrenamiento para adaptación básica.
- Exportación de filas LoRA locales mediante `export_lora_rows()` para ajuste fino privado en la máquina del usuario.
- Modo de chat no-thinking de Qwen3, con la plantilla de chat aplicada mediante `chat_template_kwargs={"enable_thinking": False}`.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni matemáticas avanzadas en la información disponible.

## Casos de uso
- Asistente personal local con privacidad: el usuario ejecuta `scripts/my_jarvis_chat.py` en su máquina, el modelo pregunta nombre, intereses y tono en el primer arranque y guarda todo en `~/.my-jarvis/`, sin que los datos salgan del equipo.
- Atención al cliente en japonés e inglés: el modelo responde en el idioma del usuario y puede mantener conversaciones multi-turno, aunque la longitud de contexto no está documentada y conviene verificar el límite real antes de desplegarlo en producción.
- Prototipado de asistentes bilingües: al cargarse directamente con `transformers` y pesos fusionados, sirve para validar flujos de conversación JA/EN sin necesidad de aplicar adaptadores ni pipelines adicionales.
- Personalización por usuario en entornos educativos o de investigación: cada estudiante o investigador puede crear su propio perfil y memoria local, y opcionalmente exportar filas LoRA para un ajuste privado.
- Base para ajustes finos privados: al ser Apache-2.0 y no contener datos personales, se puede partir de él para entrenar adaptadores LoRA con datos propios sin arrastrar identidades ajenas.
- Experimentación con MoE en una sola GPU: con 3.300 millones de parámetros activos por token, el coste de cómputo por token es bajo, aunque los 30.532 millones totales deben caber en memoria, por lo que se recomienda cuantizar para GPUs pequeñas.
- Asistente de escritorio con memoria persistente: la integración con `memory.jsonl` y `profile.json` permite construir un asistente que recuerda conversaciones anteriores entre sesiones sin reentrenar.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en bfloat16: los 30.532 millones de parámetros ocupan aproximadamente 61 GB, por lo que se necesita una GPU de 80 GB (A100 80 GB, H100 80 GB) o varias GPUs con `device_map="auto"`.
- Con cuantización a 4 bits, el peso se reduce a unos 15-16 GB, lo que permite ejecutarlo en GPUs consumer de 24 GB como la RTX 4090 o la RTX 3090, aunque la cuantización posterior no está documentada por el autor.
- El repositorio ocupa 18,0 GB en shards safetensors de 5 GB.
- Opciones de despliegue: `transformers` con `accelerate` (documentado por el autor); vLLM, llama.cpp, Ollama o TGI no están documentados en la información disponible.
- Latencia y throughput estimados: no disponibles. El autor indica que el cómputo por token es bajo gracias al enrutamiento MoE, pero no aporta cifras.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LoNebula/jarvis-moe-v1 | 30,5B / 3,3B | no disponible | ja, en | Apache-2.0 | Hugging Face, pesos fusionados |
| Qwen/Qwen3-30B-A3B (base) | 30,5B / 3,3B | no disponible | multilingüe | Apache-2.0 | Hugging Face |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con el modelo base Qwen3-30B-A3B es la más relevante: comparten arquitectura y número de parámetros, pero jarvis-moe-v1 añade el ajuste QLoRA bilingüe JA/EN y el flujo de personalización local. No se dispone de datos de rendimiento comparado entre ambos.

## Limitaciones y advertencias
- El autor lo describe como un asistente experimental, no evaluado con benchmarks ni listo para producción; puede ser inexacto, reproducir texto de entrenamiento o desviarse del tono previsto.
- No contiene conocimiento personal de ningún usuario: la personalización ocurre por usuario en tiempo de inferencia, mediante memoria de conversación o un adaptador local.
- La cobertura de japonés e inglés depende de los corpus públicos empleados; dominios especializados o de bajos recursos pueden ser débiles.
- El enrutamiento MoE reduce el cómputo por token, pero los 30.532 millones de pesos completos deben caber en memoria; es necesario cuantizar para GPUs pequeñas.
- La longitud de contexto no está documentada, lo que limita la planificación de despliegues con conversaciones largas.
- Riesgo de alucinación y de sesgos heredados de los corpus Aya e izumi-lab, no evaluados por el autor.
- La licencia Apache-2.0 de los pesos fusionados está sujeta a la licencia del modelo base Qwen3-30B-A3B; conviene verificar las condiciones de uso comercial del base.
- El modelo se ajustó en modo no-thinking; si se usa la plantilla de chat sin `enable_thinking=False`, el comportamiento puede diferir del entrenado.
- No se deben subir los ficheros de `~/.my-jarvis/` al Hub, ya que contienen datos personales del usuario.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/LoNebula/jarvis-moe-v1
- Modelo base Qwen3-30B-A3B: https://huggingface.co/Qwen/Qwen3-30B-A3B
- Autor LoNebula: https://huggingface.co/LoNebula
- Dataset Aya: https://huggingface.co/datasets/CohereLabs/aya_dataset
- Dataset de instrucciones japonés izumi-lab: https://huggingface.co/datasets/izumi-lab/llm-japanese-dataset

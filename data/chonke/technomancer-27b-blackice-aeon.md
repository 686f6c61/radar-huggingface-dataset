# ChonkE/Technomancer-27b-BlackICE-AEON

## Resumen

Technomancer-27b-BlackICE-AEON es un ajuste fino (fine-tune) del modelo Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16, desarrollado por el usuario ChonkE. Se trata de un modelo de lenguaje de 27.320 millones de parámetros orientado principalmente a la interpretación de juegos de rol de mesa (TTRPG), actuando como máster o asistente de partida, aunque su dataset de entrenamiento también incluye código, matemáticas, seguridad ofensiva (OWASP, CTF), motores de juego (Unity, Unreal) y datos de rol sin censura.

El modelo destaca por dos motivos técnicos: incorpora una cabeza MTP (Multi-Token Prediction) de una capa para decodificación especulativa, lo que permite acelerar la generación en motores compatibles, y declara una ventana de contexto de 196.608 tokens. Se distribuye bajo licencia MIT, con pesos en safetensors (BF16) y GGUF (f16, además de cuantizaciones INT6, INT4 e INT2 aportadas por el autor y por mradermacher).

Es relevante para desarrolladores que necesitan un modelo de rol y narrativa con contexto muy largo y licencia permisiva, pero conviene tratarlo con cautela: es un fine-tune comunitario sobre una base ya modificada, sin benchmarks publicados ni documentación de composición del dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Qwen3.5 (64 capas + 1 capa MTP), según `config.json` |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 196.608 tokens (196K) |
| Tipos de cuantizacion | BF16 (entrenamiento), f16 GGUF, INT6, INT4, INT2; amplia serie de cuantizaciones de mradermacher |
| Idiomas soportados | no disponible (tokenizer Qwen, vocabulario de 248K) |
| Licencia | MIT |
| Formato de pesos | safetensors (13 shards, BF16), GGUF (f16 de 54,6 GB y cuantizaciones) |

## Arquitectura y entrenamiento

El modelo parte de una arquitectura transformer densa de Qwen3.5 con 64 capas, a la que se añade una capa adicional de cabeza MTP (`mtp_num_hidden_layers: 1`) para decodificación especulativa. El ajuste fino se realizó mediante LoRA con rango 64 y alpha 128 sobre la base AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16, en precisión BF16. El tokenizer es el de Qwen, con un vocabulario de 248.000 entradas.

No se especifican el número de tokens de entrenamiento, la composición cuantitativa del dataset ni si hubo etapas de RLHF o DPO. El autor describe el dataset como "personal", con contenido de TTRPG (Dungeons & Dragons, Pathfinder), programación, matemáticas, hardening de sistemas, OWASP, CTF, Unity, Unreal y datos de rol sin censura. La innovación técnica destacable es la cabeza MTP para decodificación especulativa, que el autor advierte que puede interferir con las tiradas de dados aleatorias del modelo de rol y recomienda desactivar o ajustar según el caso.

## Capacidades

- Generación de texto narrativo y diálogo multi-turno con contexto de hasta 196.608 tokens.
- Interpretación de partidas de TTRPG: actuación como máster, descripción de escenas, control de PNJ y resolución de reglas de D&D y Pathfinder.
- Generación de código, con entrenamiento declarado en Unity y Unreal Engine.
- Razonamiento matemático y resolución de problemas técnicos.
- Contenido de seguridad: OWASP, CTF y hardening de sistemas (uso dual, ver limitaciones).
- Decodificación especulativa mediante cabeza MTP en motores compatibles (llama.cpp, vLLM, TGI).
- Capacidades multilingües: no documentadas explícitamente; el tokenizer Qwen sugiere cobertura amplia, pero no hay evaluación publicada.
- Tool calling / function calling: no documentado en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Visión y audio: no disponibles.

## Casos de uso

- Motor de campañas de rol: el modelo puede mantener el estado narrativo de una partida a lo largo de sesiones largas gracias a su ventana de 196K tokens, recordando PNJ, facciones y eventos previos sin resumir el historial.
- Asistente de mesa para el máster: generación de encuentros, estadísticas de criaturas, descripciones de localizaciones y tramas secundarias coherentes con el sistema de juego (D&D, Pathfinder).
- Generación de contenido para videojuegos: dado su entrenamiento declarado en Unity y Unreal, puede producir scripts, diálogos de PNJ y descripciones de ítems para prototipos.
- Herramienta de escritura creativa: narrativa larga con consistencia de personajes y mundo, aprovechando el contexto extendido para mantener biblias de personajes completas en el prompt.
- Formación y concienciación en seguridad: con entrenamiento declarado en OWASP y CTF, puede usarse en entornos controlados para generar escenarios de laboratorio; requiere revisión humana y aislamiento.
- Prototipado rápido de chatbots temáticos: su licencia MIT y su disponibilidad en GGUF permiten desplegarlo en local para demos de asistentes con personalidad definida.
- Evaluación de decodificación especulativa: sirve como banco de pruebas de MTP en llama.cpp y vLLM para medir ganancias de throughput en GPUs de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 54,6 GB de pesos (coincide con el GGUF f16), más caché KV; se recomienda 80 GB o más para contexto largo.
- VRAM estimada en INT4: en torno a 15-18 GB de pesos, viable en GPUs de 24 GB con contexto moderado.
- VRAM estimada en INT2: alrededor de 8-10 GB, con degradación de calidad esperable.
- GPU recomendadas: A100 80 GB, H100 80 GB para BF16 y contexto completo; RTX 4090 (24 GB) en INT4; RTX 3090 (24 GB) en INT4 con contexto reducido.
- GPU de consumo: sí cabe en RTX 4090 y RTX 3090 con cuantización INT4; en INT2 podría caber en GPUs de 12 GB, con pérdida de calidad.
- Despliegue: transformers (con `trust_remote_code=True`), llama.cpp, vLLM, TGI y Ollama (a través de GGUF). El autor publica además la herramienta Vulkan-Automaton-VM para fragmentación de memoria en Strix Halo 395 y GPUs de distintos fabricantes.
- Latencia y throughput: no disponibles; el autor indica que MTP acelera la generación, pero no aporta cifras. Recomienda temperatura 1-2, ajuste de top-k/top-p y penalización de repetición 1.15 sin MTP como configuración personal.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Technomancer-27b-BlackICE-AEON | 27,3B | 196.608 | MIT | TTRPG, rol, código, seguridad | HF (safetensors + GGUF) |
| Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED (base) | 27B | no disponible | no disponible | Base sin censura | HF |
| Qwen2.5-32B-Instruct | 32,5B | 32.768 | Apache 2.0 | Propósito general | HF, amplio ecosistema |
| Mistral Small 24B Instruct | 24B | 32.768 | Apache 2.0 | Propósito general | HF |

La comparativa con modelos de propósito general es orientativa: no hay benchmarks que permitan situar a Technomancer frente a ellos en tareas estándar. Su ventaja diferencial es el contexto de 196K y la licencia MIT; su desventaja, la ausencia de evaluación pública y el origen comunitario de la base.

## Limitaciones y advertencias

- Modelo sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento en MMLU, HumanEval, GSM8K ni tareas estándar.
- Base ya modificada y sin censura: el fine-tune hereda los sesgos y la ausencia de alineamiento de seguridad de la base AEON-7, lo que aumenta el riesgo de contenido dañino, ofensivo o inexacto.
- Entrenamiento con datos de rol sin censura y "NSFW Reddit": riesgo elevado de contenido inapropiado y de sesgos de género y violencia.
- Riesgo de alucinación: especialmente en reglas de TTRPG y en código, donde no hay garantía de corrección; requiere validación.
- La cabeza MTP puede interferir con la generación de números aleatorios (tiradas de dados); el autor recomienda desactivarla o ajustar temperatura.
- Idiomas soportados no documentados: no hay evaluación de calidad fuera del inglés.
- Dataset de entrenamiento no documentado: imposible auditar composición, licencias de los datos ni posibles filtraciones.
- Uso comercial permitido por MIT, pero la responsabilidad legal y ética del contenido generado recae en el desplegador.
- Tamaño del repo (159,4 GB) y 13 shards: despliegue pesado; conviene usar GGUF cuantizado en producción.
- Fecha de creación declarada en 2026 y base Qwen3.8: verificar la procedencia y vigencia de la base antes de adoptarlo.

## Enlaces

- Hugging Face: https://huggingface.co/ChonkE/Technomancer-27b-BlackICE-AEON
- Modelo base: https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16
- Repositorio del autor (Vulkan-Automaton-VM): https://github.com/XxChonkExX/Vulkan-Automaton-VM
- Cuantizaciones de mradermacher: no disponible (enlace no proporcionado)
- Paper, blog o demo oficial: no disponible

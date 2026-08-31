# Rin247/Qwen3.6-27B-Uncensored-Aquarion-INT4

## Resumen

El modelo `Rin247/Qwen3.6-27B-Uncensored-Aquarion-INT4` es una cuantización INT4 *weight-only* en formato safetensors del modelo `Qwen3.6-27B-Uncensored`, al que previamente se ha aplicado una técnica de *abliteración* (proyección ortogonal de la dirección de rechazo) para eliminar las respuestas de negativa del sistema. El autor, Rin247, forma parte de un proyecto denominado *Genesis of Aquarion forge*, que publica variantes "uncensored" de modelos open source. Esta versión está pensada para usuarios que necesitan un modelo de generación de texto sin filtros de seguridad, manteniendo las capacidades del modelo base.

El modelo base, Qwen3.6-27B, es un transformer denso de 27 000 millones de parámetros desarrollado por Alibaba, con soporte multimodal y modo *thinking*. Sin embargo, esta versión cuantizada presenta una discrepancia notable: los pesos safetensors contienen 14 720 720 384 parámetros (≈14,7 mil millones), muy por debajo de los 27 B que sugiere el nombre. Esta diferencia podría deberse a un error en el etiquetado, a un modelo base distinto o a una arquitectura con parámetros compartidos, pero no se dispone de información adicional para aclararlo. El tamaño del repositorio es de 17,7 GB, lo que resulta elevado para una cuantización INT4 de 14,7 B (esperaríamos ~7,5 GB), sugiriendo que quizás los pesos se almacenan con formatos adicionales o que el número real de parámetros es mayor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base: Qwen3.6-27B, según el nombre; no confirmado por los pesos) |
| Parametros totales | 14 720 720 384 (según safetensors); el nombre indica 27B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 *weight-only* (RTN, con escalas y shapes almacenados) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (INT4 con buffers `*.weight_scale` y `*.weight_shape`) |

## Arquitectura y entrenamiento

El modelo es una cuantización de `Qwen3.6-27B-Uncensored`, que a su vez es una versión *abliterada* de `Qwen3.6-27B`. La *abliteración* consiste en identificar la dirección del vector de rechazo en el espacio de activaciones y proyectar los pesos ortogonalmente a esa dirección, eliminando así la tendencia del modelo a negarse a responder ciertas peticiones. Este proceso se realizó antes de la cuantización, según la model card.

La cuantización se realizó con PyTorch RTN (Round-To-Nearest) en CPU, almacenando escalas y shapes junto a los pesos. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens, ni si se aplicó RLHF o DPO en el modelo base. Se desconoce si el modelo base es exactamente Qwen3.6-27B (multimodal, 27B) o una variante más pequeña; los pesos safetensors sugieren ~14,7B, lo que podría indicar que el autor usó un modelo base diferente o que el conteo de parámetros excluye embeddings atados.

## Capacidades

- Generación de texto en lenguaje natural con estilo conversacional.
- Al ser una versión *uncensored*, no debería emitir rechazos ni avisos de seguridad ante peticiones consideradas inapropiadas por modelos estándar.
- Probablemente conserva las capacidades de razonamiento, generación de código y matemáticas del modelo base Qwen3.6-27B, aunque no se han verificado en esta versión cuantizada.
- No se especifica soporte para *tool calling*, *function calling* ni modo agente. Los tags indican `endpoints_compatible`, lo que sugiere que puede desplegarse en entornos de inferencia estándar.
- No se indica capacidad multimodal en esta versión; el tag `qwen3_5_text` sugiere que es solo texto.
- Multilingüismo: no disponible.

## Casos de uso

- **Roleplay y ficción interactiva**: al no tener rechazos, permite mantener personajes y escenas sin interrupciones por políticas de seguridad. Se puede usar con interfaces como SillyTavern o KoboldAI.
- **Investigación en seguridad de IA**: para probar técnicas de *jailbreak* o evaluar la robustez de los sistemas de seguridad, un modelo sin filtros sirve como punto de referencia.
- **Generación de contenido creativo sin restricciones**: escritura de narrativa adulta, poesía experimental o diálogos que los modelos comerciales censurarían.
- **Pruebas de alucinación y sesgos**: al ser una variante cuantizada y abliterada, permite estudiar cómo afectan estas transformaciones a la calidad de las respuestas.
- **Despliegue en entornos con recursos limitados**: al ser INT4, puede ejecutarse en GPUs con menos VRAM que el modelo original, aunque el tamaño real del repo (17,7 GB) limita esta ventaja.
- **Chatbots personalizados sin moderación**: para prototipos donde se requiere que el asistente no rechace preguntas sobre temas controvertidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Se desconoce el rendimiento en tareas como MMLU, HumanEval o GSM8K para esta versión cuantizada.

## Requisitos de hardware

- **VRAM estimada**: dado el tamaño del repo (17,7 GB), se necesitan al menos 18-20 GB de VRAM para cargar los pesos en GPU con overhead de contexto y activaciones. Con cuantización INT4 *weight-only*, es posible que la inferencia se realice también en CPU con suficiente RAM.
- **GPU recomendadas**: RTX 4090 (24 GB), A100 (40 GB), H100 (80 GB) o superiores. En GPUs con 16 GB podría no caber cómodamente.
- **Consumer GPU**: una RTX 4080/4090 podría ejecutarlo, pero con limitaciones de contexto. No se recomienda para GPUs de menos de 16 GB.
- **Opciones de despliegue**: al ser safetensors con formato personalizado, requiere un script de de-cuantización antes de usar motores estándar. Puede adaptarse a vLLM, llama.cpp o TGI, pero se necesita convertir los pesos a un formato compatible (por ejemplo, FP16 o BF16) usando las escalas y shapes proporcionados.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Cuantizacion | Notas |
|---|---|---|---|---|---|
| Qwen3.6-27B (original) | 27B | no disponible | Apache 2.0 (según Qwen) | FP16/BF16 | Modelo base multimodal, con seguridad estándar |
| Qwen3.6-27B-AEON-Ultimate-Uncensored (BF16) | 27B | no disponible | no disponible | BF16 | Abliteración sin cuantizar, mayor fidelidad |
| Rin247/Qwen3.6-27B-Uncensored-Aquarion-INT4 | 14,7B (según safetensors) | no disponible | no disponible | INT4 | Abliteración + cuantización, menor huella |

No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- **Inconsistencia en parámetros**: el nombre indica 27B pero los pesos safetensors contienen ~14,7B. Esto puede deberse a un error del autor o a un modelo base distinto; no es fiable para planificar recursos.
- **Formato de pesos propietario**: requiere un proceso de de-cuantización con las escalas y shapes incluidos; no es directamente cargable en motores estándar sin adaptación.
- **Riesgo de alucinación**: al ser una cuantización agresiva (INT4) y sin ajuste fino posterior, la calidad de las respuestas puede degradarse respecto al modelo original.
- **Contenido ofensivo**: al ser *uncensored*, el modelo puede generar texto inapropiado, ilegal o dañino. El usuario es responsable de su uso.
- **Sesgos**: no se han evaluado los sesgos de esta versión; el modelo base puede tener sesgos de género, raza o ideología, y la abliteración no los corrige.
- **Licencia**: no se especifica, por lo que no se garantiza su uso comercial. Se recomienda contactar al autor antes de usarlo en producción.
- **Sin soporte oficial**: al ser un proyecto de un tercero, no hay garantías de mantenimiento ni corrección de errores.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Rin247/Qwen3.6-27B-Uncensored-Aquarion-INT4)
- [Variante FP8 del mismo autor](https://huggingface.co/Rin247/Qwen3.6-27B-Uncensored-Aquarion-FP8)
- [Qwen3.6-27B-AEON-Ultimate-Uncensored (GitHub)](https://github.com/AEON-7/Qwen3.6-27B-AEON-Ultimate-Uncensored-DFlash/)
- [Guía de LLMs uncensored por VRAM (InsiderLLM)](https://insiderllm.com/guides/best-uncensored-local-llms/)
- [Blog oficial de Qwen sobre Qwen3.6-27B](https://qwen.ai/blog?id=qwen3.6-27b)

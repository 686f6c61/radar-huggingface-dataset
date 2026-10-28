# AtomicChat/LFM3-1.7B-GGUF

## Resumen

LFM3-1.7B-GGUF es la publicación de cuantizaciones GGUF del modelo LiquidAI/LFM3-1.7B, preparada por el equipo de AtomicChat (los responsables de la aplicación Atomic Chat de inferencia local). No se trata de un modelo entrenado desde cero, sino de un repack cuantizado del checkpoint original de Liquid AI, con 1.728.801.600 parámetros (1,73 B) y arquitectura densa híbrida de convolución corta más atención con compuerta (short-convolution + gated-attention).

El interés de esta publicación no está en el modelo base, sino en la política de cuantización propietaria que aplica el autor, denominada Atomic-Dynamic (AD). En lugar de usar los presets uniformes de llama.cpp, cada nivel (rung) asigna tipos por tensor según su función: comprime más las capas FFN en función de la banda de profundidad, mantiene alta la precisión en `attn_gate` y `attn_k/v`, y alinea los mixers de convolución corta con la atención. El resultado son seis niveles con métricas de fidelidad publicadas frente al BF16 original.

Es relevante ahora por dos motivos: permite ejecutar un modelo híbrido de 1,7 B en hardware de consumo con tan solo 1,13 GB en disco en el nivel recomendado, y porque documenta de forma explícita la pérdida de fidelidad de cada nivel, algo poco habitual en repos de cuantización. El autor advierte que LFM3-1.7B es un modelo pequeño y bastante sensible a la cuantización, por lo que la elección del rung tiene impacto real en la calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido: convolución corta (short-conv) + atención con compuerta (gated attention) |
| Parametros totales | 1.728.801.600 (1,73 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el ejemplo de la model card usa `-c 8192`) |
| Tipos de cuantizacion | Q8_0, AD-Q6_K, AD-Q5_K_M, AD-Q4_K_M, AD-IQ4_XS, AD-IQ3_S (con imatrix) |
| Idiomas soportados | en, zh, de, fr, es, ja, ar, ko |
| Licencia | LFM Open License v1.0 (etiquetada como `other` en HuggingFace) |
| Formato de pesos | GGUF (librería `gguf`, compatible con llama.cpp) |
| Modelo base | LiquidAI/LFM3-1.7B |
| Tamano del repositorio | 12,5 GB (incluye los seis niveles) |
| Pipeline | text-generation |
| Descargas / likes | 2.104 descargas, 14 likes |
| Fechas | creado 2026-10-27, actualizado 2026-10-28 |
| Etiquetas destacadas | `quantized`, `imatrix`, `conversational`, `endpoints_compatible` |

## Arquitectura y entrenamiento

El modelo base es un transformer denso que combina dos mecanismos: convoluciones cortas (mixers) y atención con compuerta. La model card de esta publicación no detalla la proporción de capas de cada tipo ni el número de capas, cabezas o dimensión oculta, por lo que esos datos figuran como no disponibles. Tampoco se documentan en la información proporcionada el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF, DPO o ajuste por preferencias.

La innovación técnica que sí está documentada es el esquema de cuantización Atomic-Dynamic. Frente a los presets uniformes de llama.cpp (que según el autor no incorporan imatrix), cada nivel AD define tipos por tensor según su rol: las capas FFN se comprimen con más agresividad siguiendo bandas de profundidad, `attn_gate` y `attn_k/v` se mantienen en tipos altos, y los mixers de convolución corta se tratan de forma alineada con la atención. Los ficheros se generaron con una build de llama.cpp en el commit `19cce69`, y el soporte para LFM3 se integró en el PR #31252 de llama.cpp. El autor indica que las métricas completas se publicarán en un repositorio `-metrics` tras la auditoría.

## Capacidades

- Generación de texto conversacional multi-turno (etiqueta `conversational`), en el rango propio de un modelo de 1,7 B parámetros.
- Soporte multilingüe declarado para ocho idiomas: inglés, chino, alemán, francés, español, japonés, árabe y coreano.
- Inferencia completamente local y offline mediante llama.cpp, sin dependencia de servicios externos.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que permite exponerlo mediante `llama-server` con plantillas Jinja (`--jinja`).
- Seis perfiles de cuantización con distintos compromisos de tamaño y fidelidad, lo que permite ajustar el modelo al hardware disponible.
- Tool calling / function calling: no documentado en la información proporcionada.
- Capacidades de agente, razonamiento multi-paso explícito o modo "thinking": no documentadas.
- Visión, audio u otras modalidades: no disponibles (pipeline exclusivamente de text-generation).

## Casos de uso

- Chat local en escritorio: integrado en la aplicación Atomic Chat, el modelo se ejecuta offline en el equipo del usuario con el rung AD-Q4_K_M (1,13 GB), sin enviar datos a terceros y con arranque rápido gracias al tamaño reducido.
- Asistencia multilingüe en atención al cliente: al cubrir ocho idiomas, incluido el español, puede gestionar respuestas de primer nivel en un único despliegue, con la cautela de que la ventana de contexto no está documentada y conviene validarla antes de diseñar flujos largos.
- Clasificación y extracción de información: tareas de etiquetado, resumen y extracción de campos sobre textos cortos, donde el coste por token es mínimo y el modelo cabe en cualquier GPU de gama media o incluso en CPU.
- Generación de borradores y reescritura: redacción asistida de correos, descripciones de producto o documentación técnica en un entorno con requisitos de privacidad, usando el nivel Q8_0 (1,85 GB) cuando la fidelidad frente al BF16 prime sobre el ahorro de memoria.
- Despliegue en el borde (edge): escenarios con 1-2 GB de RAM/VRAM disponibles por servicio, como asistentes embebidos en aplicaciones de escritorio o utilidades CLI, donde un modelo de 7 B no encaja.
- Prototipado y pruebas de humo de pipelines de cuantización: los seis rungs con métricas de top-1 y KLD permiten comparar el impacto de la cuantización en un modelo híbrido antes de decidir una configuración para producción.
- Investigación sobre cuantización selectiva por rol de tensor: la política AD sirve como referencia reproducible (con llama.cpp `19cce69` e imatrix) para estudiar cómo afecta la compresión diferenciada de FFN frente a atención en modelos de convolución corta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor sí publica métricas de fidelidad de cuantización frente al BF16 original, calculadas sobre un conjunto neutral de 30 idiomas: `top-1` (coincidencia del siguiente token con el BF16) y KLD media (divergencia, menor es mejor).

| Nivel | GB en disco | bpw | top-1 | KLD media |
|---|---|---|---|---|
| Q8_0 | 1,85 | 8,51 | 96,3 % | 0,004 |
| AD-Q6_K | 1,59 | 7,31 | 94,5 % | 0,010 |
| AD-Q5_K_M | 1,31 | 6,03 | 90,3 % | 0,034 |
| AD-Q4_K_M | 1,13 | 5,20 | 84,6 % | 0,087 |
| AD-IQ4_XS | 1,09 | 5,02 | 83,2 % | 0,105 |
| AD-IQ3_S | 0,92 | 4,23 | 77,0 % | 0,203 |

El propio autor califica estos resultados como indicativos de un modelo "bastante sensible a la cuantización": la caída de top-1 entre Q8_0 y AD-Q4_K_M es de 11,7 puntos, y de 19,3 puntos hasta AD-IQ3_S.

## Requisitos de hardware

- VRAM estimada para inferencia (orientativa, derivada del tamaño en disco más KV cache y buffers; no publicada por el autor):
  - Q8_0: ~2,3-2,7 GB con contexto de 4-8 K.
  - AD-Q6_K: ~2,1-2,4 GB.
  - AD-Q5_K_M: ~1,8-2,1 GB.
  - AD-Q4_K_M: ~1,6-1,9 GB.
  - AD-IQ4_XS: ~1,5-1,9 GB.
  - AD-IQ3_S: ~1,4-1,7 GB.
- GPU recomendadas: cualquier GPU de consumo con 4 GB o más de VRAM (GTX 1650 4 GB, RTX 3050 8 GB, RTX 4060 8 GB, RTX 3060 12 GB, RTX 4090) puede ejecutar los seis niveles; no hay requisitos de datacenter (A100/H100) para un modelo de este tamaño.
- Cabe holgadamente en GPU de consumo y también en inferencia mixta CPU+GPU o solo CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`). Es obligatoria una build con soporte para LFM3 (integrado en llama.cpp PR #31252; los ficheros se generaron en el commit `19cce69`). Para servidor se recomienda `--jinja`. No se documenta compatibilidad con vLLM, TGI u Ollama en la información proporcionada.
- Comando de ejemplo publicado: `llama-server -hf AtomicChat/LFM3-1.7B-GGUF:AD-Q4_K_M -c 8192 --jinja`.
- Latencia y throughput: no disponibles. El tamaño reducido y el bpw de 5,20 del nivel recomendado sugieren un coste por token bajo, pero no se aportan cifras medidas.

## Comparativa con modelos similares

No se dispone de datos de otros modelos de la misma categoría (1-2 B parámetros) en la información proporcionada, por lo que la comparación externa figura como no disponible. La comparación interna entre niveles del propio repositorio, tomando el BF16 como referencia, es la siguiente:

| Configuracion | Parametros | Contexto | Fidelidad (top-1 / KLD) | Tamano | Licencia |
|---|---|---|---|---|---|
| LiquidAI/LFM3-1.7B (BF16, referencia) | 1,73 B | no disponible | 100 % / 0 | no disponible | LFM Open License v1.0 |
| AD-Q4_K_M (recomendado) | 1,73 B | no disponible | 84,6 % / 0,087 | 1,13 GB | LFM Open License v1.0 |
| AD-Q5_K_M | 1,73 B | no disponible | 90,3 % / 0,034 | 1,31 GB | LFM Open License v1.0 |
| AD-IQ3_S (research-grade) | 1,73 B | no disponible | 77,0 % / 0,203 | 0,92 GB | LFM Open License v1.0 |

## Limitaciones y advertencias

- Sensibilidad alta a la cuantización: el salto de Q8_0 a AD-Q4_K_M cuesta 11,7 puntos de top-1 y multiplica por más de veinte la KLD (0,004 a 0,087). Para tareas sensibles a la fidelidad conviene usar Q8_0 o AD-Q6_K.
- AD-IQ3_S está etiquetado explícitamente por el autor como "research-grade" y de menor fidelidad (top-1 77,0 %); no es recomendable para producción sin validación específica.
- Los niveles AD sustituyen los presets estándar de llama.cpp y no usan imatrix en esos presets; las métricas completas quedan pendientes de auditoría y publicación en el repositorio `-metrics`, según la model card.
- Requiere una build de llama.cpp con soporte para LFM3 (PR #31252). Versiones antiguas o herramientas que no incorporen ese soporte no podrán cargar el modelo.
- Longitud de contexto no documentada: no se debe asumir una ventana concreta sin verificarla empíricamente antes de diseñar flujos de contexto largo.
- Cobertura lingüística limitada a ocho idiomas; el rendimiento fuera de ellos no está evaluado.
- Riesgo de alucinación: no se documentan evaluaciones de veracidad ni de sesgos. En un modelo de 1,73 B es razonable esperar una tasa de error factual superior a la de modelos mayores, pero no hay datos publicados que lo cuantifiquen.
- Licencia LFM Open License v1.0: las condiciones exactas de uso comercial no se detallan en la información proporcionada; es necesario revisar el fichero LICENSE del modelo base antes de un despliegue comercial.
- No hay evidencia documentada de soporte de tool calling, agentes o razonamiento multi-paso; no debe asumirse su disponibilidad.
- El repositorio ocupa 12,5 GB porque incluye los seis niveles; descargar un único fichero requiere seleccionar el rung de forma explícita.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AtomicChat/LFM3-1.7B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia (LFM Open License v1.0): https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Pull request de llama.cpp con soporte LFM3: https://github.com/ggml-org/llama.cpp/pull/31252
- Repositorio de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Aplicación Atomic Chat: https://atomic.chat/
- Discord del autor: https://discord.gg/8wGSsvmg4V
- Perfil en X del autor: https://x.com/atomic_chat_hq

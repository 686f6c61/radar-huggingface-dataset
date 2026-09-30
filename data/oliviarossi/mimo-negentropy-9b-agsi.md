# OliviaRossi/MiMo-Negentropy-9B-AGSI

## Resumen

MiMo-Negentropy-9B-AGSI es un modelo de lenguaje de 9.409.813.744 parametros (~9,4B) publicado en HuggingFace por el usuario OliviaRossi bajo licencia MIT. No es un modelo entrenado desde cero: es una fusion (merge) de dos modelos existentes, XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B (destilado de Xiaomi MiMo-V2.6, orientado a SWE y razonamiento) y Jackrong/Negentropy-claude-opus-4.7-9B (descrito por el autor como agente autonomo de terminal y coding). El objetivo declarado es combinar capacidades agenticas, de codigo, uso de terminal y razonamiento en un unico checkpoint de tamano contenido.

El modelo esta etiquetado con qwen3_5, lo que apunta a una arquitectura derivada de la familia Qwen. Se distribuye unicamente en formato safetensors (repo de 18,8 GB, coherente con pesos en precision de 16 bits para ~9,4B parametros). Soporta ingles y chino (en, zh). La longitud de contexto no se documenta en la informacion disponible.

La relevancia de esta ficha radica en que se trata de un merge muy reciente (creado y actualizado el 29 de septiembre de 2026), con cero descargas y cero likes en el momento de la consulta, por lo que conviene tratarlo como un experimento de la comunidad y no como un modelo consolidado. Su tamano permite, en teoria, ejecucion en GPU de consumo, lo que lo hace interesante para prototipos de agentes de terminal y coding sin depender de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso derivado de la familia Qwen (etiqueta qwen3_5); no detallada en la model card |
| Parametros totales | 9.409.813.744 (~9,4B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors) |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se trata de un merge de pesos, no de un modelo preentrenado de nuevo. La model card indica que la sintesis se realizo mediante AGSI (Adaptive Geodesic Spectral Interpolation), con interpolacion SLERP sobre variedad fila a fila (row-wise manifold SLERP), escudo de conflicto en antifase (anti-phase conflict shielding) e invarianza de energia espectral (spectral energy invariance). Estos terminos describen tecnicas de interpolacion de pesos entre los dos checkpoints de origen para reducir interferencias destructivas entre sus representaciones internas.

Los dos modelos de partida son XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B, descrito como una destilacion avanzada en SWE y razonamiento, y Jackrong/Negentropy-claude-opus-4.7-9B, presentado como agente autonomo de terminal y coding. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO; al ser un merge, las capacidades heredadas provienen integramente de esos dos checkpoints. Tampoco se documentan innovaciones de inferencia como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline text-generation, tag conversational).
- Razonamiento (tag reasoning).
- Generacion de codigo (tag coding).
- Uso de terminal y ejecucion de comandos (tag terminal-use).
- Comportamiento agentico y uso de herramientas (tag agentic); el modelo similar del mismo autor documenta explicitamente tool-use y swe-bench.
- Capacidades multilingues limitadas a ingles y chino (en, zh).
- No se documentan capacidades de vision, audio ni modo de pensamiento explicito en la informacion disponible.

## Casos de uso

- Agente de terminal automatizado: dado que hereda el perfil de un modelo orientado a terminal-use, puede emplearse para ejecutar comandos, interpretar la salida y encadenar pasos en un entorno tipo shell, con supervision humana.
- Asistente de programacion en editor: generacion y refactorizacion de codigo en ingles o chino, integrable en extensiones de IDE que consuman un endpoint local.
- Pipelines de reparacion de software (SWE): el modelo base MiMo-V2.6 esta destilado para tareas de resolucion de incidencias, por lo que el merge es candidato para tareas de parcheo de repositorios.
- Automatizacion de tareas de sistema en local: al caber en GPU de consumo (ver requisitos), permite orquestar scripts y operaciones de administracion sin enviar datos a servicios en la nube.
- Prototipado de agentes multi-paso: el tag agentic sugiere uso en bucles de razonamiento con llamada a herramientas, util para validar arquitecturas de agentes antes de escalar a modelos mayores.
- Investigacion sobre tecnicas de merge: al ser un artefacto AGSI, sirve como caso de estudio para evaluar el impacto de la interpolacion espectral frente a merges SLERP clasicos.
- Aplicaciones bilingues ingles-chino: traduccion tecnica o asistentes en esos dos idiomas, con la salvedad de que no hay soporte documentado de castellano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 18,8 GB solo para pesos (el repo ocupa 18,8 GB), mas la cache KV; un hermano del mismo autor (MiMo-Ornith-9B-AGSI) figura con ~19,4 GB de VRAM en LLM Explorer.
- VRAM estimada en int8: en torno a 9-10 GB mas cache KV.
- VRAM estimada en int4: en torno a 5-6 GB mas cache KV, aunque este repositorio no publica cuantizaciones GGUF y habria que generarlas.
- GPU recomendadas: A100 40/80 GB, H100, o GPU de consumo de 24 GB (RTX 3090, RTX 4090) para fp16 justo; para 16 GB o menos seria necesario cuantizar.
- Opciones de despliegue: los pesos safetensors son compatibles con Transformers, vLLM y TGI. Para llama.cpp u Ollama habria que convertir previamente a GGUF, ya que este repositorio no lo incluye (si lo hacen modelos similares del mismo autor).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| MiMo-Negentropy-9B-AGSI (este) | ~9,4B | no disponible | MIT | en, zh | Merge AGSI de MiMo-V2.6 y Negentropy; agentic, coding, terminal-use |
| MiMo-Ornith-9B-AGSI | ~9B | no disponible | Apache-2.0 | en, zh | Merge AGSI del mismo autor; VRAM ~19,4 GB; soporte tool-use y swe-bench; vllm y llama.cpp |
| MiMo-Ornith-9B-AGSI-Abliterated-HQ | ~9B | no disponible | Apache-2.0 | en, zh | Variante abliterated (uncensored); VRAM ~18,8 GB; vllm y llama.cpp |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B | ~9B | no disponible | no disponible | no disponible | Modelo base; destilacion en SWE y razonamiento |
| Jackrong/Negentropy-claude-opus-4.7-9B | no disponible | no disponible | no disponible | no disponible | Modelo base; agente autonomo de terminal y coding |

## Limitaciones y advertencias

- Modelo sin adopcion demostrable: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Al ser un merge y no un entrenamiento nuevo, puede arrastrar sesgos y comportamientos de los dos checkpoints originales, que no se documentan.
- Riesgo de alucinacion no medido: no hay benchmarks ni evaluaciones publicadas para este checkpoint.
- Idiomas limitados a ingles y chino; no hay soporte declarado de castellano.
- Longitud de contexto desconocida, lo que impide planificar cargas de trabajo con entradas largas.
- No se publican cuantizaciones GGUF, lo que complica el despliegue en llama.cpp u Ollama sin conversion manual.
- La licencia MIT se declara en la model card y en los tags del repositorio, pero conviene verificar que las licencias de los modelos base permitan la redistribucion del merge para uso comercial.
- No hay informacion sobre estabilidad en produccion, latencia, throughput ni consumo energetico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OliviaRossi/MiMo-Negentropy-9B-AGSI
- Modelo base XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Modelo base Jackrong/Negentropy-claude-opus-4.7-9B: https://huggingface.co/Jackrong/Negentropy-claude-opus-4.7-9B
- Modelo similar MiMo-Ornith-9B-AGSI (README): https://huggingface.co/OliviaRossi/MiMo-Ornith-9B-AGSI/blob/main/README.md
- Modelo similar MiMo-Ornith-9B-AGSI-Abliterated-HQ (README): https://huggingface.co/OliviaRossi/MiMo-Ornith-9B-AGSI-Abliterated-HQ/blob/main/README.md
- Ficha en LLM Explorer (MiMo Ornith 9B AGSI): https://llm-explorer.com/model/OliviaRossi%2FMiMo-Ornith-9B-AGSI,15xF4U3FsNQRhcJCQf5lft
- Ficha en LLM Explorer (MiMo Ornith 9B AGSI Abliterated HQ): https://llm-explorer.com/model/OliviaRossi%2FMiMo-Ornith-9B-AGSI-Abliterated-HQ,7KTyivZ0k4HWhckcDL5E4y
- Leaderboard de referencia de modelos (Artificial Analysis): https://artificialanalysis.ai/leaderboards/models

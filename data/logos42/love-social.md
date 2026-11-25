# logos42/Love-Social

## Resumen

Love-Social es un prototipo de investigación desarrollado por el usuario de Hugging Face `logos42` que implementa un agente conversacional orientado al diálogo de cuidado ("care-dialogue") construido sobre una arquitectura Social-JEPA. La idea central es separar la representación lingüística de una representación compacta de intención ("shallow intent space"), de modo que el objeto entrenable sea el propio Social-JEPA y no un modelo de lenguaje generativo de gran escala. Un Qwen3-1.7B congelado se emplea únicamente como generador de datos sintéticos y nunca recibe gradientes.

El modelo se compone de un codificador Social-JEPA de 768 dimensiones y 12 capas que produce un vector de intención normalizado, una memoria de intención proyectada en la atención cruzada de un decodificador GPT-2 (768-d, 12 capas) y un entrenamiento simétrico entre dos agentes pares (A y B) que dialogan entre sí y aprenden de una respuesta real compartida. El checkpoint recomendado, `peer_A_best.pth`, ocupa aproximadamente 1,1 GB en fp32 y está pensado para un ámbito validado muy concreto: dilemas sociales y éticos cotidianos de una sola persona.

Su relevancia actual reside en la exploración de alternativas a los asistentes generalistas: un agente pequeño, con taxonomías explícitas de intención (7 clases) y emoción (7 clases), entrenado con crítica y revisión constitucional (SL-CAI) y con un conjunto mínimo de 5 herramientas ejecutables en sandbox. No es un asistente de propósito general ni un modelo certificado en seguridad; es un prototipo de investigación con métricas publicadas y un alcance declarado explícitamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Social-JEPA (encoder 768-d, 12 capas) + decodificador GPT-2 seq2seq (768-d, 12 capas) con memoria de intención en atención cruzada |
| Parámetros totales | no disponible (encoder + decodificador ≈ 1,1 GB en fp32) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `.pth` (PyTorch); tokenizador GPT-2 |

## Arquitectura y entrenamiento

La arquitectura combina un codificador Social-JEPA `TextEncoder` (768-d, 12 capas) que se congela y después se adapta, y que produce un vector de intención normalizado junto con los estados ocultos a nivel de token. El token de intención y los estados del final del prompt se proyectan en la memoria de atención cruzada de un decodificador `TextSeq2Seq` basado en GPT-2 (768-d, 12 capas). El tokenizador es el de GPT-2 y el decodificador se inicializa desde un agente seq2seq GPT-2 limpio.

El entrenamiento es simétrico entre dos agentes JEPA residentes (A en `cuda:0`, B en `cuda:1`): A habla, B responde condicionado al turno de A y A vuelve a responder, aprendiendo ambos de una respuesta real compartida. La alineación es basada en margen para evitar el colapso representacional. No hay esquema profesor-alumno y Qwen3 no participa en el entrenamiento. Los datos sintéticos se generan con un Qwen3-1.7B congelado siguiendo el pipeline: situación → etiqueta de intención/emoción → respuesta inicial → crítica constitucional contra las cláusulas L0 de `constitution.py` → respuesta revisada; Social-JEPA entrena sobre las respuestas revisadas. El codificador de intención (`sjepa_best.pth`) se entrenó con InfoNCE de paráfrasis, con una brecha que pasó de 0,019 a 0,697.

## Capacidades

- Generación de respuestas de apoyo en diálogos de cuidado sobre dilemas sociales y éticos cotidianos de una sola persona.
- Representación explícita de intención con 7 clases: `seek_help`, `vent`, `retaliate`, `conceal`, `probe`, `avoid`, `reconcile`.
- Representación explícita de emoción con 7 clases: `anger`, `hurt`, `anxiety`, `shame`, `betrayed`, `confused`, `hopeful`.
- Crítica y revisión constitucional (SL-CAI) mediante las cláusulas L0 definidas en `constitution.py`.
- Tool calling sobre un conjunto mínimo de 5 herramientas: `list_dir`, `read_file`, `write_file`, `search_content`, `schedule_task`. El nombre de la herramienta se elige por gating determinista o prompt y el modelo rellena los parámetros tipados.
- Ejecución de herramientas en sandbox confinado por ruta (`sandbox_exec.py`, sin rutas absolutas ni `..`).
- Diálogo entre pares (agentes A y B) y variante de división de arquitectura (`split_A_tool.pth` / `split_B_care.pth`) donde A se especializa en herramientas y B en diálogo de cuidado.
- No se documentan capacidades de visión, audio, matemáticas avanzadas ni razonamiento multi-paso general.

## Casos de uso

- Acompañamiento en dilemas personales cotidianos: el agente recibe una situación de una sola persona y devuelve una respuesta con empatía más 2 o 3 pasos concretos, amables y no dañinos, que es exactamente el ámbito validado en la model card.
- Clasificación de intención y emoción en mensajes entrantes: las taxonomías de 7 clases permiten etiquetar turnos de conversación para enrutarlos a recursos humanos, moderación o respuestas automáticas, aunque la precisión de clasificación reportada es de 0,625.
- Generación de borradores de respuesta con crítica constitucional: usar `constitution.py` para producir una respuesta inicial y una revisión contra las cláusulas L0 antes de mostrarla a un operador humano.
- Automatización de tareas de ficheros en un entorno controlado: con `love_tool5.pth` el agente rellena parámetros para listar directorios, leer y escribir ficheros y buscar contenido dentro de un sandbox confinado por ruta, con tasa de parseo de 1,0 y coincidencia de nombre de herramienta de 0,98.
- Programación de tareas simples: la herramienta `schedule_task` alcanza una tasa de éxito de 1,00 en la evaluación de sandbox, lo que la hace apta para prototipos de recordatorios o flujos programados.
- Investigación sobre representaciones de intención: el par encoder/decodificador y los checkpoints `sjepa_best.pth` permiten estudiar la separación entre representación lingüística e intención, con métricas de brecha de recuperación y precisión de clasificación publicadas.
- Prototipado de agentes pares: los checkpoints `peer_A_best.pth` y `peer_B_best.pth` permiten reproducir el esquema de diálogo simétrico entre dos agentes que aprenden de una respuesta real compartida.

## Benchmarks y rendimiento

Evaluación ciega con juez Qwen3, puntuación absoluta de 1 a 5 sobre tres ejes (Intent, Emotion, Guidance):

| Checkpoint | Intent | Emotion | Guidance |
|---|---|---|---|
| `peer_A_best.pth` (recomendado) | 3,68 | 4,46 | 4,31 |
| `peer_cai_A_best.pth` (constitucional, en mejora) | 3,36 | 4,25 | 3,78 |

Comparación cara a cara de la variante constitucional frente a la línea base: 37 derrotas, 16 victorias y 7 empates (tasa de victoria 0,30).

Otras métricas reportadas:

| Métrica | Valor |
|---|---|
| Brecha de recuperación de intención/emoción | -0,014 |
| Precisión de clasificación de intención/emoción | 0,625 |
| Sondas de conflicto de valores (principio único claro) | 3/5 superadas |
| Parseo de tool calls válidos (`<call>{...}</call>`) | 1,0 |
| Coincidencia de nombre de herramienta | 0,98 |
| Éxito de ejecución en sandbox | 0,76 |
| Tareas de escritura y programación | 1,00 |
| Tareas de lectura (3 herramientas de lectura similares) | 0,478 |
| Tool-match con 20 herramientas | 0,03 |

En las sondas de conflicto de valores superan la honestidad ante una petición de mentira, la autonomía ante una objeción fuerte y la no maleficencia en un escenario de conflicto; fallan la autocorrección y la detección de un atajo disfrazado.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint recomendado ocupa aproximadamente 1,1 GB en fp32 para encoder más decodificador, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- El entrenamiento documentado requiere dos GPUs (agente A en `cuda:0`, agente B en `cuda:1`); no se especifica el modelo de GPU empleado.
- Cabe en GPUs de consumo actuales (por ejemplo, RTX 3060, RTX 4060, RTX 4090) dado el tamaño del checkpoint; no se publican requisitos mínimos oficiales.
- Opciones de despliegue: los pesos son `.pth` de PyTorch y el pipeline está implementado en PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Love-Social (`peer_A_best.pth`) | ≈ 1,1 GB en fp32 (encoder + decodificador) | no disponible | Social-JEPA con intención explícita y diálogo de cuidado | MIT | Hugging Face (`logos42/Love-Social`) |
| Qwen3-1.7B | 1,7 B | no disponible en la información proporcionada | LLM generativo de propósito general | no disponible en la información proporcionada | usado aquí solo como generador de datos sintéticos congelado |
| GPT-2 (decodificador base) | 124 M (variante estándar) | 1024 tokens (variante estándar) | Transformer decoder | no disponible en la información proporcionada | base de inicialización del decodificador |

No se dispone de comparaciones publicadas frente a otros agentes de diálogo de cuidado o modelos JEPA; la model card solo compara la variante constitucional con su propia línea base.

## Limitaciones y advertencias

- Prototipo de investigación: no es un asistente certificado en seguridad y no debe desplegarse como tal en producción.
- El espacio de intención es pequeño y solo débilmente discriminativo entre clases de intención y emoción (brecha de recuperación -0,014, precisión de clasificación 0,625).
- Las salidas son plantillas de cuidado que pueden abstraer entidades específicas; el espacio de intención elimina deliberadamente el vocabulario superficial y los nombres, por lo que no es fiable cuando se requiere fidelidad precisa a entidades.
- No funciona de forma fiable en compensaciones de valores compuestas, autocorrección tras un error propio ni reconocimiento de deshonestidad disfrazada o razonamiento de atajo.
- La variante constitucional (`peer_cai_A_best.pth`) rinde por debajo de la línea base en evaluación ciega y está en mejora activa; la línea base sigue siendo el valor por defecto.
- El tool calling está limitado a 5 herramientas; con 20 herramientas la coincidencia de nombre cae a 0,03.
- Las tareas de lectura con herramientas similares tienen un éxito bajo (0,478).
- Riesgo de alucinación y sesgos: no se documentan análisis específicos; la model card no reporta evaluaciones de sesgo.
- Idiomas soportados: no disponible; el tokenizador es GPT-2 y no se declara cobertura multilingüe.
- Licencia MIT: permite uso comercial, pero la ausencia de certificación de seguridad y el alcance validado limitan su idoneidad para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/logos42/Love-Social
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.

# OliviaRossi/TripleTrouble-V3-ALT2

## Resumen

TripleTrouble-V3-ALT2 es un modelo de lenguaje obtenido por fusión (merge) de pesos de tres checkpoints especializados en código y razonamiento, todos ellos construidos sobre la arquitectura Qwen 35B-A3B, un transformer de tipo Mixture-of-Experts disperso con 40 capas, 256 expertos enrutados más un experto compartido y recurrencia lineal híbrida Gated DeltaNet. El autor es el usuario de HuggingFace OliviaRossi y el repositorio se publicó el 12 de septiembre de 2026, con un peso total de 34.660.610.688 parámetros (unos 34,66 mil millones) y un tamaño de repositorio de 69,3 GB, coherente con pesos en precisión BF16/FP16. El pipeline, la licencia y los idiomas no están declarados en la información disponible.

El problema que aborda es la combinación de tres competencias que habitualmente se distribuyen entre modelos distintos: manipulación autónoma de repositorios y fidelidad sintáctica (aportada por Kwaipilot/KAT-Coder-V2.5-Dev), razonamiento estilo Opus y ejecución de agentes (aportada por Jackrong/Qwopus3.6-35B-A3B-Coder) y lógica algorítmica con tool calling multi-turno (aportada por ornith-ai/Ornith-1.5-35B-A3B). El autor aplica tres técnicas de fusión propias: consenso geodésico normalizado desacoplado, calibración del router por filas y una programación funcional por profundidad que asigna distintos pesos a cada bloque de capas.

Es relevante ahora porque los merges de checkpoints sobre arquitecturas MoE dispersas permiten, en teoría, sumar capacidades sin reentrenar y manteniendo un coste de inferencia bajo (solo se activa una fracción de los parámetros por token). Sin embargo, la ficha debe leerse con cautela: el modelo tiene 0 descargas y 1 like, no declara licencia ni resultados de benchmarks, y tanto la arquitectura base como los checkpoints de origen no son verificables con la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE disperso (Qwen 35B-A3B): 40 capas, 256 expertos enrutados + 1 experto compartido, recurrencia lineal híbrida Gated DeltaNet |
| Parametros totales | 34.660.610.688 (~34,66 B) |
| Parametros activos | ~3 B, segun la nomenclatura «A3B» del checkpoint base; no confirmado de forma explicita en la informacion disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos safetensors en precision completa) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 69,3 GB |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

El modelo no se ha entrenado desde cero: es un merge de pesos de tres checkpoints. La arquitectura subyacente es la del checkpoint base Qwen 35B-A3B, un MoE disperso de 40 capas con 256 expertos enrutados más un experto compartido y una recurrencia lineal híbrida Gated DeltaNet, según la model card. Esto implica que por cada token se activa una fracción reducida de los parámetros (el sufijo «A3B» apunta a unos 3.000 millones de parámetros activos), lo que reduce el coste de cómputo respecto a un modelo denso del mismo tamaño, si bien el consumo de memoria sigue viniendo determinado por los 34,66 B de parámetros totales almacenados.

Los tres checkpoints fusionados son Kwaipilot/KAT-Coder-V2.5-Dev (especialista en repositorios, flujos SWE-bench y árboles de sintaxis), Jackrong/Qwopus3.6-35B-A3B-Coder (destilación del razonamiento de Claude Opus 4.6 orientada a bucles de agentes y despacho rápido de acciones) y ornith-ai/Ornith-1.5-35B-A3B (programación competitiva GrandCode, tool calling multi-turno complejo y razonamiento multi-paso). El autor describe tres innovaciones matemáticas en el proceso de fusión: (1) Decoupled Normalized Geodesic Consensus, que separa el consenso direccional del escalado de magnitud proyectando los parámetros sobre hiperesferas unitarias antes de escalarlos por la norma de Frobenius objetivo; (2) Row-Wise Router Manifold Calibration, que calibra fila por fila los hiperplanos de enrutamiento de los 256 expertos sobre `mlp.gate.weight` para preservar la entropía de los logits de enrutamiento y los umbrales de activación; y (3) Functional Depth-Aware Scheduling, que asigna la contribución de cada checkpoint en función de la profundidad de la capa: capas 0-11 ponderadas hacia KAT-Coder (hasta un 46 %) para fidelidad sintáctica y de AST, capas 12-27 con pico de Ornith-1.5 (hasta un 38 %) para resolución algorítmica y deducción matemática, y capas 28-39 dominadas por Qwopus3.6 (hasta un 48 %) para razonamiento tipo Opus, formato de herramientas y despacho de salida.

No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO; al tratarse de un merge, esas etapas pertenecen a los checkpoints de origen y no se documentan aquí.

## Capacidades

- Generacion de codigo y manipulacion autonoma de repositorios, heredada del checkpoint KAT-Coder-V2.5-Dev, con enfasis declarado en flujos tipo SWE-bench y fidelidad de arboles de sintaxis y AST.
- Razonamiento multi-paso y resolucion de problemas algoritmicos, con contribucion principal de Ornith-1.5 en las capas intermedias.
- Tool calling y function calling, incluido el caso multi-turno complejo segun la descripcion del checkpoint Ornith-1.5.
- Ejecucion de agentes y bucles de accion, con formato de herramientas y despacho de salida reforzados en las capas profundas por Qwopus3.6.
- Razonamiento de estilo «thinking» destilado de Opus 4.6, segun la model card; el mecanismo concreto de exposicion (campo separado o etiquetas) no se detalla.
- Capacidades multilingues: no disponibles.
- Vision, audio u otras modalidades: no disponibles (el repositorio solo declara safetensors y la etiqueta qwen3_5_moe).
- Longitud de contexto efectiva: no disponible, por lo que no se puede confirmar el soporte de conversaciones o repositorios largos.

## Casos de uso

- Reparacion automatica de incidencias en repositorios: el modelo puede recibir un issue y el arbol de ficheros del proyecto para localizar el fallo, proponer un parche y ejecutar los tests, apoyandose en la capacidad de manipulacion de repositorios y en el refuerzo sintactico de las capas iniciales.
- Generacion de codigo en pipelines de CI/CD: integrado como paso de sugerencia o de correccion automatica tras un fallo de build, siempre que se valide el soporte de contexto largo del checkpoint base.
- Asistente de programacion competitiva: dado su ajuste sobre GrandCode y el pico de Ornith-1.5 en capas intermedias, es adecuado para resolver problemas de algoritmia con restricciones de tiempo y memoria, devolviendo solucion y explicacion.
- Agente de operaciones con tool calling: encadenamiento de llamadas a APIs, consultas a bases de datos y ejecucion de comandos en varios pasos, aprovechando el entrenamiento declarado en tool calling multi-turno.
- Revision de codigo automatizada: analisis de diffs y deteccion de patrones problematicos, con explicaciones trazables del razonamiento aplicado.
- Generacion de documentacion tecnica a partir de codigo fuente: resumen de modulos, extraccion de firmas y generacion de guias de uso, tarea donde la fidelidad de AST resulta util.
- Migracion de codigo entre lenguajes o versiones de framework: reescritura de fragmentos preservando la semantica, con validacion posterior mediante tests.
- Evaluacion comparativa interna de merges MoE: como banco de pruebas para estudiar el efecto de las tecnicas de fusión descritas sobre el enrutamiento de expertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe las competencias esperadas de cada checkpoint de origen (SWE-bench, GrandCode, tool calling) pero no aporta cifras propias ni comparaciones medidas de TripleTrouble-V3-ALT2.

## Requisitos de hardware

Estimaciones derivadas del recuento real de parametros (34,66 B) y del tamano del repositorio (69,3 GB, compatible con BF16/FP16). No hay mediciones publicadas de latencia ni de throughput.

- VRAM en BF16/FP16: aproximadamente 69-75 GB solo para pesos, mas cache KV; requiere al menos 2 GPU de 40-48 GB o 1 GPU de 80 GB con margen ajustado.
- VRAM en FP8/INT8: aproximadamente 35-40 GB; cabe en una A100 80 GB, H100 80 GB o L40S 48 GB.
- VRAM en 4 bits (GPTQ/AWQ/GGUF Q4): aproximadamente 18-22 GB; cabe en RTX 4090, RTX 3090, RTX 4080 Super (ajustado) y en Apple Silicon con memoria unificada de 32 GB o mas.
- VRAM en 3 bits o inferior: aproximadamente 14-18 GB, a costa de degradacion de calidad; no recomendado para codigo en produccion.
- GPU recomendadas: H100 80 GB o A100 80 GB para precision alta y lotes grandes; L40S 48 GB para FP8; RTX 4090/3090 24 GB para cuantizacion de 4 bits.
- Opciones de despliegue: vLLM y SGLang son las opciones mas razonables por el soporte de MoE disperso, aunque la recurrencia Gated DeltaNet puede requerir versiones recientes o kernels especificos; llama.cpp y Ollama dependen de que exista soporte para esa capa hibrida, dato no disponible; TGI es plausible pero tambien sujeto a ese soporte.
- Latencia y throughput: no disponibles. Cabe esperar que el regimen sea limitado por ancho de banda de memoria (alrededor de 3 B de parametros activos por token), por lo que el throughput con lotes grandes deberia ser alto en relacion con el tamano total, pero no hay cifras confirmadas.

## Comparativa con modelos similares

Comparacion con los tres checkpoints de origen y con la familia base. Los datos de rendimiento no estan disponibles para ninguno de ellos en la informacion proporcionada.

| Modelo | Parametros | Contexto | Enfoque declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TripleTrouble-V3-ALT2 | 34,66 B totales (~3 B activos) | no disponible | Merge de codigo, razonamiento y tool calling | no disponible | HuggingFace, 0 descargas |
| Kwaipilot/KAT-Coder-V2.5-Dev | no disponible (arquitectura equivalente) | no disponible | Repositorios y flujos SWE-bench | no disponible | checkpoint publico |
| Jackrong/Qwopus3.6-35B-A3B-Coder | ~35 B totales (~3 B activos) | no disponible | Razonamiento estilo Opus y agentes | no disponible | checkpoint publico |
| ornith-ai/Ornith-1.5-35B-A3B | ~35 B totales (~3 B activos) | no disponible | Programacion competitiva y tool calling | no disponible | checkpoint publico |

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no se puede asumir permiso de uso comercial. Es un bloqueo potencial para cualquier despliegue en produccion.
- Ausencia total de benchmarks: no hay evidencia medida de que la fusion funcione como se describe; las ganancias son teoricas y deben validarse con la propia suite de evaluacion.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir APIs inexistentes, dependencias inventadas o parches que compilan pero no resuelven el problema; requiere ejecucion de tests en cada salida.
- Merge con tecnicas no estandar: los metodos de consenso geodesico y calibracion del router por filas no estan validados de forma independiente, y una calibracion incorrecta del enrutamiento puede degradar el modelo de forma silenciosa (expertos mal activados sin errores visibles).
- Idiomas no declarados: no se puede confirmar el soporte de castellano ni de otros idiomas distintos del ingles, idioma habitual en los checkpoints de codigo.
- Contexto desconocido: sin longitud de contexto declarada, no es seguro asumir ventanas largas para repositorios completos o conversaciones extensas.
- Compatibilidad de inferencia incierta: la recurrencia lineal Gated DeltaNet puede no estar soportada por todas las versiones de vLLM, llama.cpp u Ollama, lo que complica el despliegue.
- Adopcion nula: 0 descargas y 1 like implican que no ha pasado por validacion de la comunidad ni por pruebas de terceros.
- Fechas y dependencias no verificables: el repositorio esta fechado en septiembre de 2026 y la model card menciona checkpoints base que no aparecen en los resultados de busqueda disponibles, por lo que la trazabilidad de los pesos de origen no se puede confirmar.
- Riesgo de sobreajuste a dominios concretos: al fusionar tres checkpoints especializados en codigo, algoritmia y agentes, el comportamiento fuera de esos dominios (redaccion general, conocimiento factual, conversacion abierta) es incierto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/OliviaRossi/TripleTrouble-V3-ALT2
- Checkpoint de origen 1: https://huggingface.co/Kwaipilot/KAT-Coder-V2.5-Dev
- Checkpoint de origen 2: https://huggingface.co/Jackrong/Qwopus3.6-35B-A3B-Coder
- Checkpoint de origen 3: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Paper, blog o demo del modelo: no disponible.
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo; los resultados obtenidos trataban sobre la plataforma Steam y no guardan relacion con la ficha.

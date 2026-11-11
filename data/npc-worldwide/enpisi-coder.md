# npc-worldwide/enpisi-coder

## Resumen

enpisi-coder es una colección de adaptadores LoRA publicada por npc-worldwide para el agente [npcsh](https://github.com/NPC-Worldwide/npcsh), orientada a la ejecución de comandos, la generación de comandos de shell y el razonamiento sobre operaciones de ficheros. El modelo se construye sobre dos bases de la familia Qwen3.5 (0.8B y 2B) en cuantización de 4 bits distribuidas por mlx-community, y se entrena mediante QLoRA con trazas evaluadas por un ensemble de cinco jueces.

El repositorio no contiene un modelo completo, sino un conjunto de adaptadores agrupados por formato de destino: `mlx/` (Apple Silicon, operativo), `hf/` (PyTorch + peft, vacío y pendiente de reentrenamiento) y `gguf/` (llama.cpp, bloqueado a la espera de un adaptador `hf/` fusionado). La licencia es Apache 2.0 y el tamaño del repositorio es de 8,4 GB, aunque la mayor parte corresponde a los pesos base cuantizados y a los artefactos de las distintas ejecuciones.

Su relevancia es acotada pero específica: es un ejemplo de adaptación de un modelo pequeño (0,8B y 2B) a una tarea de agente muy concreta, con decisiones de ingeniería documentadas de forma inusualmente explícita (artefactos de cuantización en los checkpoints MLX, incompatibilidad de `mlx_lm.fuse` en Linux, requisitos del conversor de LoRA a GGUF). No obstante, en el momento de la última actualización el formato principal para producción multiplataforma (`hf/`) no está disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida: capas `linear_attn` basadas en gated-DeltaNet (estado recurrente `conv1d.weight`, `A_log`, `dt_bias`) combinadas con atención estándar; clase `Qwen3_5ForCausalLM` para texto y `Qwen3_5ForConditionalGeneration` para multimodal |
| Parametros totales | 0,8B (variante principal) y 2B (variantes secundarias); parámetros del adaptador LoRA: r=8, alpha=16 (configuración dominante) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible (la longitud máxima usada en entrenamiento fue de 256 tokens) |
| Tipos de cuantizacion | Base en 4 bits (MLX); GGUF previsto en Q8_0 y F16 para el adaptador; el reentrenamiento `hf/` se plantea en float32 sobre CPU |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptadores MLX y peft); GGUF pendiente de conversión |

## Arquitectura y entrenamiento

La base es Qwen3.5, un transformer que incorpora capas de atención lineal con estado recurrente (gated-DeltaNet) junto a capas de atención convencional. Esta arquitectura híbrida explica uno de los hallazgos técnicos documentados en la model card: los checkpoints MLX contienen 133 tensores no-LoRA (`conv1d.weight`, `A_log`, `dt_bias`, `norm.weight`) que son un artefacto de la cuantización de 4 bits, no pesos entrenados, lo que impide una conversión directa a `peft` sin restaurar exactamente la base cuantizada.

El entrenamiento se realizó con QLoRA sobre la base de 4 bits. La ejecución principal (`mlx/qwen3.5-0.8b/sft-recent`) usó 282 trazas con puntuación compuesta `composite >= 0.7` de un ensemble de cinco jueces, extraídas de los datasets `npc-worldwide/npcsh-traces` y `npc-worldwide/enpisi-coder-data`. La configuración fue r=8, alpha=16, dropout 0,15, 16 capas objetivo, batch 1, longitud máxima 256 y 800 iteraciones, con parada al final de la época 2 tras planificar 3. Los objetivos del LoRA incluyen `q/k/v/o_proj` y las proyecciones de entrada de `linear_attn`. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generación de comandos de shell para el agente npcsh, incluyendo construcción de pipelines y encadenamiento de utilidades.
- Tool calling y function calling orientados a la ejecución de acciones en el sistema.
- Razonamiento sobre operaciones de ficheros: lectura, escritura, búsqueda y manipulación de rutas.
- Razonamiento multi-paso dentro de flujos de agente, entrenado sobre trazas evaluadas por jueces.
- Generación de texto general y razonamiento heredados de la base Qwen3.5.
- Capacidades multilingües: no documentadas para el adaptador; dependen de la base.
- Capacidades multimodales: la base `Qwen3_5ForConditionalGeneration` las soporta, pero el adaptador se entrena y se carga con la clase de texto (`Qwen3_5ForCausalLM`) para evitar cargar pesos de visión.
- No se documenta un modo de razonamiento explícito (thinking mode) propio del adaptador.

## Casos de uso

- Automatización de tareas de administración de sistemas: el adaptador traduce instrucciones en lenguaje natural a comandos de shell concretos, lo que permite construir asistentes de operaciones que ejecutan diagnósticos, listados de procesos o comprobaciones de disco sin que el usuario escriba la sintaxis.
- Agente de línea de comandos integrado en npcsh: al estar entrenado sobre trazas reales del propio agente, encaja directamente en su bucle de decisión para seleccionar herramientas y generar llamadas con argumentos válidos.
- Razonamiento sobre el sistema de ficheros en asistentes de desarrollo: el modelo puede encadenar pasos como localizar un fichero, inspeccionar su contenido y proponer una modificación, aprovechando el entrenamiento específico en operaciones de ficheros.
- Prototipado en Apple Silicon: los adaptadores `mlx/` se cargan con `mlx_lm` en macOS arm64, lo que permite iterar sobre el comportamiento del agente en un portátil sin GPU dedicada, con una base de 0,8B en 4 bits.
- Evaluación de pipelines de agente en investigación: el repositorio incluye ejecuciones con distintas configuraciones (r=8 frente a r=16, 16 frente a 24 capas, 800 iteraciones frente a 60), lo que facilita estudios comparativos sobre el efecto de la configuración LoRA en tareas de tool calling.
- Filtrado y anotación de trazas: al haberse entrenado con trazas puntuadas por jueces, el adaptador puede emplearse como generador de candidatos que luego se filtran con el mismo criterio de puntuación compuesta.
- Base para destilación de un agente mayor: el par (prompt, response) de 282 filas y el adaptador resultante sirven como punto de partida para generar datos sintéticos adicionales con un modelo mayor y reentrenar en GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente describe el criterio de selección de datos (traza con `composite >= 0.7` según un ensemble de cinco jueces) y la evolución del entrenamiento (parada al final de la época 2), sin tablas de MMLU, HumanEval, GSM8K ni métricas comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: la base de 0,8B en 4 bits requiere del orden de 0,5-1 GB; la de 2B en 4 bits, del orden de 1,5-2,5 GB. Cifras orientativas a partir del tamaño de los pesos, no publicadas por el autor.
- GPU recomendadas: no se especifican. El adaptador principal está limitado a Apple Silicon (macOS arm64) por depender de MLX; para CUDA o CPU sería necesario el adaptador `hf/`, que no está disponible.
- Cabe en GPU de consumo: sí, tanto la base de 0,8B como la de 2B en 4 bits caben en cualquier GPU con 4 GB o más, así como en memoria unificada de Macs Apple Silicon.
- Opciones de despliegue: `mlx_lm` en macOS arm64 para los adaptadores `mlx/`; `transformers` + `peft` para el futuro `hf/`; `llama.cpp` para el futuro GGUF. Para uso inmediato con llama.cpp, la model card remite a la base completa `unsloth/Qwen3.5-0.8B-GGUF`, sin el adaptador.
- Latencia y throughput: no disponibles. La model card sí documenta el coste de entrenamiento en el host de referencia (Linux x86_64, sin GPU, 14 núcleos, 54 GB de RAM): un paso hacia atrás de 0,8B con 256 tokens tarda del orden de segundos, y las 800 iteraciones de la ejecución MLX se estiman en días en ese hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| enpisi-coder (este) | 0,8B / 2B + LoRA r8 | no disponible (entrenado a 256) | MLX safetensors; `hf/` y GGUF vacíos | Apache 2.0 | Parcial: solo Apple Silicon |
| Qwen3.5-0.8B (base) | 0,8B | no disponible | Safetensors, GGUF (vía unsloth) | Apache 2.0 | Completa, multiplataforma |
| Qwen3.5-2B (base) | 2B | no disponible | Safetensors, GGUF | Apache 2.0 | Completa, multiplataforma |

La comparación relevante es contra las bases sin adaptar: enpisi-coder añade especialización en tool calling y comandos de shell para npcsh, pero pierde portabilidad (solo MLX) y no publica métricas que cuantifiquen la mejora. Frente a las bases, la licencia es idéntica y el tamaño de pesos es comparable, ya que los adaptadores son de rango bajo.

## Limitaciones y advertencias

- El adaptador `hf/` está vacío: no es posible cargar el modelo con `transformers` + `peft` en Linux o CUDA, lo que bloquea el uso en producción fuera de Apple Silicon.
- El adaptador `gguf/` está bloqueado: requiere primero un `hf/` fusionado y un GGUF de la base para el conversor `convert_lora_to_gguf.py`.
- Los checkpoints MLX contienen 133 tensores no-LoRA que son artefactos de cuantización; no deben interpretarse como pesos entrenados ni trasladarse a otros formatos.
- El conjunto de entrenamiento es muy pequeño (282 filas) y de un único dominio (trazas de npcsh), lo que limita la generalización fuera de esa tarea y aumenta el riesgo de sobreajuste al formato del agente.
- La longitud máxima de entrenamiento es de 256 tokens, muy por debajo de los contextos habituales en tareas de agente con historial largo; no se documenta el comportamiento más allá de esa longitud.
- No se documentan idiomas soportados ni evaluación de sesgos; el comportamiento multilingüe depende íntegramente de la base.
- Riesgo de alucinación en la generación de comandos: un comando sintácticamente plausible pero incorrecto puede tener efectos destructivos si se ejecuta sin validación. Se recomienda sandboxing y confirmación humana.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de adaptadores estables desaconseja su adopción en producción sin una evaluación propia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/npc-worldwide/enpisi-coder
- Repositorio del agente npcsh: https://github.com/NPC-Worldwide/npcsh
- Dataset de trazas: https://huggingface.co/datasets/npc-worldwide/npcsh-traces
- Dataset de entrenamiento: https://huggingface.co/datasets/npc-worldwide/enpisi-coder-data
- Base 0,8B en 4 bits: https://huggingface.co/mlx-community/Qwen3.5-0.8B-4bit
- Base 2B en 4 bits: https://huggingface.co/mlx-community/Qwen3.5-2B-4bit
- GGUF de la base (alternativa para llama.cpp): https://huggingface.co/unsloth/Qwen3.5-0.8B-GGUF

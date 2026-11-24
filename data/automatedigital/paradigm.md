# automatedigital/Paradigm

## Resumen

Paradigm es un ajuste fino (fine-tune) de tipo supervisado del modelo Inkling 2 Mini, desarrollado por Automate Digital y publicado en Hugging Face bajo licencia Apache 2.0. El modelo está orientado a generación de código y uso de herramientas (tool-use), y se distribuye exclusivamente como un archivo GGUF cuantizado en Q4_K_XL, con el adaptador ya fusionado en los pesos. El checkpoint cuenta con aproximadamente 26.070 millones de parámetros totales (26B) y un tamaño de repositorio de 17,6 GB, coherente con una cuantización de 4 bits sobre un modelo de ese tamaño.

El problema que aborda es acotado: adaptar un modelo base de propósito general a tareas concretas de corrección de código y ejecución de llamadas a herramientas en entornos de agente (clientes tipo Pi y OpenCode). Para ello se entrenó sobre 120 turnos supervisados que cubren 12 correcciones de código verificadas de forma independiente, más 24 ejemplos ancla del split OpenCode del dataset Open-SWE-Traces v2.0 de NVIDIA. El autor declara explícitamente que los resultados de evaluación no demuestran una mejora general sobre el modelo base, lo que sitúa a Paradigm como un experimento de ajuste acotado más que como una alternativa de propósito general.

Su relevancia actual es limitada pero ilustrativa: muestra el flujo completo de adaptación de un modelo de 26B con arquitectura propietaria (Inkling 2) mediante un adaptador LoRA de atención de rango 8, fusionado posteriormente sobre una cuantización GGUF. El modelo base, Inkling 2 Mini de Thinking Machines Lab, no es de arquitectura pública estándar, lo que condiciona fuertemente la portabilidad del resultado: el autor indica que fue probado con un runtime Maya que soporta la arquitectura Inkling 2, y que la compatibilidad y el contexto disponible dependen del runner y del hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura Inkling 2 de Thinking Machines Lab; detalles internos no disponibles) |
| Parametros totales | 26.070.390.272 (aprox. 26B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens (según el runtime Maya empleado por el autor); depende del runner |
| Tipos de cuantizacion | Q4_K_XL (única publicada); con imatrix |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (adaptador fusionado; el repo no publica safetensors del fine-tune) |

## Arquitectura y entrenamiento

Paradigm parte de thinkingmachines/Inkling-2-Mini, un modelo de 26B parámetros cuya arquitectura interna no se detalla en la información disponible más allá de la referencia a la familia Inkling 2. Sobre ese modelo base, Automate Digital entrenó un adaptador de atención de rango 8 (LoRA) y lo fusionó en el checkpoint cuantizado, reemplazando cuatro tensores de proyección de valor (value-projection). Posteriormente, el nombre de visualización del GGUF se fijó como Paradigm. La cuantización de origen parece derivar del GGUF de Unsloth para Inkling 2 Mini, y el resultado final se publica en Q4_K_XL con imatrix.

El entrenamiento fue de tipo supervisado (SFT), con un volumen muy reducido: 120 turnos que cubren 12 correcciones de código verificadas independientemente, más 24 ejemplos ancla extraídos del split OpenCode de NVIDIA Open-SWE-Traces v2.0 (usado bajo CC BY 4.0). No se menciona RLHF, DPO ni ninguna otra fase de alineación adicional. Tampoco se documentan el número de tokens de entrenamiento, la composición completa del dataset ni innovaciones técnicas más allá de la propia fusión del adaptador sobre pesos cuantizados, que es un detalle poco habitual y relevante: fusionar un adaptador directamente sobre un GGUF cuantizado limita la precisión recuperable y hace que el resultado dependa del esquema de cuantización original.

## Capacidades

- Generación de texto conversacional y de código, con orientación específica a parches y correcciones de código.
- Uso de herramientas (tool calling / function calling), reforzado por el entrenamiento sobre trazas de agentes de Open-SWE-Traces.
- Ejecución de tareas de agente de varios pasos en clientes de codificación como Pi y OpenCode.
- Capacidad de razonamiento sobre errores de código y propuesta de correcciones verificables.
- Capacidades multilingües: no disponibles (el autor no documenta idiomas soportados).
- Capacidades de visión o audio: no disponibles (el pipeline declarado es text-generation).
- Modo de pensamiento explícito (thinking mode): no disponible.

## Casos de uso

- Corrección automatizada de parches en repositorios: el modelo se entrenó sobre 12 correcciones de código verificadas, por lo que es adecuado para proponer diffs acotados en tareas de mantenimiento, siempre con revisión humana antes de aplicar el cambio.
- Agente de codificación en terminal o IDE: integrado en clientes como OpenCode o Pi mediante su API compatible con endpoints, puede gestionar ciclos de leer fichero, editar y ejecutar comandos dentro de una ventana de contexto de hasta 65.536 tokens.
- Asistente de revisión de código en CI: puede generar explicaciones de cambios y detectar errores en pull requests, aunque el autor advierte que puede producir parches incorrectos y que deben verificarse.
- Automatización de tareas de ingeniería de software con tool calling: al estar entrenado sobre trazas de Open-SWE-Traces, encaja en pipelines de agentes que invocan herramientas externas (ejecución de tests, consulta de documentación, gestión de ficheros).
- Prototipado local de agentes de código: al distribuirse como GGUF Q4_K_XL de 17,6 GB, puede ejecutarse en estaciones de trabajo con GPU de consumo alta o en servidores modestos, lo que facilita experimentar con agentes de codificación sin depender de APIs externas.
- Evaluación comparativa de fine-tunes frente al modelo base: útil en investigación para medir el efecto de un adaptador de rango 8 entrenado con muy pocos ejemplos sobre un modelo de 26B, replicando el protocolo de 24 pruebas del autor.

## Benchmarks y rendimiento

El autor reporta una evaluación cualitativa en su runtime Engine: tanto Paradigm como el Inkling 2 Mini original superaron 23 de 24 pruebas de codificación emparejadas en los clientes Pi y OpenCode. Los 12 diseños de tarea se mantuvieron fuera del conjunto de entrenamiento y cada tarea se ejecutó una vez por cliente con el presupuesto de respuesta normal.

| Modelo | Pruebas superadas (de 24) | Conjunto | Observaciones |
|---|---|---|---|
| Paradigm | 23 | 12 tareas held-out x 2 clientes (Pi, OpenCode) | Sin mejora demostrada frente al base |
| Inkling 2 Mini (stock) | 23 | 12 tareas held-out x 2 clientes (Pi, OpenCode) | Línea base del autor |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible. El propio autor indica que estos resultados no muestran una mejora general sobre el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos 18-20 GB para cargar el GGUF Q4_K_XL de 17,6 GB junto con la caché KV; con contexto de 65.536 tokens la caché KV puede añadir varios GB adicionales según el runtime.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para despliegue con contexto completo; RTX 4090 (24 GB) o RTX 3090 (24 GB) para contexto reducido.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 con cuantización Q4; en GPUs de 16 GB o menos requeriría cuantizaciones más agresivas no publicadas por el autor.
- Opciones de despliegue: el autor solo menciona el runtime Maya (que sirve el modelo como `paradigm` con 65.536 tokens de contexto y hasta 8.192 tokens de salida). No se confirma compatibilidad con llama.cpp, Ollama, vLLM o TGI, ya que dependen de que el runtime soporte la arquitectura Inkling 2.
- Latencia y throughput: no disponibles. El autor no publica métricas de rendimiento y la compatibilidad depende del runner y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Paradigm | 26B | 65.536 (runtime Maya) | Apache 2.0 | GGUF Q4_K_XL | Fine-tune de código y tool-use sobre Inkling 2 Mini |
| Inkling 2 Mini (base) | 26B | no disponible | no disponible | safetensors y GGUF (Unsloth) | Modelo base de propósito general |
| Modelos de código de ~30B (p. ej. familia Qwen Coder, DeepSeek Coder) | ~30B | variable según versión | variable | safetensors, GGUF | Código y agentes; comparación no disponible en la información proporcionada |

La comparación cuantitativa con alternativas de la misma categoría no está disponible: el autor no publica benchmarks frente a otros modelos y el modelo base pertenece a una familia propietaria con poca documentación pública. La única comparación directa documentada es contra Inkling 2 Mini, con resultado equivalente (23/24 en ambos casos).

## Limitaciones y advertencias

- El propio autor advierte que el modelo puede producir parches, llamadas a herramientas o explicaciones incorrectas; toda salida debe verificarse antes de usarse.
- No se demuestra mejora sobre el modelo base: en la evaluación del autor, Paradigm y el stock obtienen el mismo resultado (23/24), por lo que el valor del fine-tune no está probado.
- Entrenamiento muy reducido (120 turnos, 12 tareas), lo que aumenta el riesgo de sobreajuste a los estilos de los clientes Pi y OpenCode y de escasa generalización.
- Idiomas soportados no documentados; no hay garantía de comportamiento correcto en castellano ni en otros idiomas distintos del inglés de las trazas de entrenamiento.
- Compatibilidad limitada: el modelo requiere un runtime que soporte la arquitectura Inkling 2 (el autor cita Maya); no se confirma funcionamiento en llama.cpp, Ollama, vLLM o TGI.
- La fusión del adaptador sobre pesos ya cuantizados (Q4_K_XL) puede degradar la calidad respecto a una fusión en precisión completa.
- El contexto de 65.536 tokens depende del runner; en otros entornos puede ser menor.
- Licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base y del dataset Open-SWE-Traces (CC BY 4.0), que exige atribución.
- Riesgo de alucinación en explicaciones de código y en la selección de herramientas; sin datos de sesgos publicados.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: no hay validación comunitaria ni reportes independientes de uso en producción.

## Enlaces

- [Modelo en Hugging Face: automatedigital/Paradigm](https://huggingface.co/automatedigital/Paradigm)
- [Modelo base: thinkingmachines/Inkling-2-Mini](https://huggingface.co/thinkingmachines/Inkling-2-Mini/tree/7a67ae2314b44ef05c87fd1d4d311c58aaeb18f6)
- [GGUF de Unsloth para Inkling 2 Mini](https://huggingface.co/unsloth/Inkling-2-Mini-GGUF/tree/800c946d7b9c830c86290df49afbbe91db8455f5)
- [Dataset NVIDIA Open-SWE-Traces](https://huggingface.co/datasets/nvidia/Open-SWE-Traces/tree/4fa4c2ae9afc6b397bc50391d43450c79993c138)

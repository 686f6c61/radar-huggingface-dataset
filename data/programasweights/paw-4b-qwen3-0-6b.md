# programasweights/paw-4b-qwen3-0.6b

## Resumen

paw-4b-qwen3-0.6b es el compilador "Standard" del paradigma ProgramAsWeights (PAW), desarrollado por el usuario programasweights. No es un modelo de chat al uso: recibe una especificación en lenguaje natural de una función y emite un "programa" en forma de adaptador LoRA de aproximadamente 22 MB que se ejecuta localmente sobre el intérprete Qwen3-0.6B. El compilador se construye sobre Qwen/Qwen3-4B-Instruct-2507 y se complementa con una cabeza mapeadora (`lora_mapper.pt`) que transforma los estados ocultos del compilador en matrices LoRA por capa.

La propuesta resuelve el problema de convertir funciones difusas ("fuzzy functions") descritas en lenguaje natural en artefactos ejecutables y portables, sin necesidad de llamar a un LLM grande en tiempo de inferencia. El resultado es un flujo de dos fases: compilación con un modelo de 4B y ejecución con un modelo de 0.6B, lo que abarata radicalmente el coste por llamada en producción (el autor declara unos 100 ms por llamada en local).

El modelo es relevante por su enfoque poco habitual: en lugar de servir directamente un LLM grande, genera pesos (LoRA) como salida. La licencia es Apache 2.0 y el repositorio ocupa 8,7 GB, coherente con el compilador de 4B en safetensors más la cabeza mapeadora.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen3-4B-Instruct-2507) con cabeza mapeadora de hiperred que emite LoRA |
| Parametros totales | 4B (compilador base); el "programa" generado es un LoRA de ~22 MB |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compilador) + `lora_mapper.pt` (PyTorch) |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Interprete objetivo | Qwen/Qwen3-0.6B |
| Rango LoRA | 64 (`lora_rank=64`) |
| Alpha LoRA | 16 (`lora_alpha=16`) |
| Bases LoRA | 64 (`lora_num_bases=64`) |
| Prefix steps | 64 |
| Modulos objetivo | `[q,k,v,o,gate,up,down]_proj` |
| Snapshot | 20260407 (tag git `20260407`) |

## Arquitectura y entrenamiento

El sistema combina dos componentes. El primero es un Qwen3-4B-Instruct-2507 afinado como compilador causal: dado un *spec* en lenguaje natural, genera un "pseudo-programa" corto (descripción de tarea más unos pocos ejemplos de entrada/salida). El segundo es `lora_mapper.pt`, una cabeza mapeadora compuesta por un tronco, una cabeza de coeficientes y matrices base LoRA aprendibles. Esta cabeza lee los 64 estados ocultos correspondientes a los 64 tokens de prefijo y emite las matrices `A`/`B` de LoRA por capa como una mezcla aprendida de las 64 bases.

El LoRA resultante (~22 MB, rango 64, alpha 16) se carga sobre Qwen3-0.6B y se ejecuta localmente y offline. El flujo de inferencia tiene dos etapas: primero se construye la secuencia `chat_template(spec) + pseudo-programa + 64 tokens de prefijo`, se pasa por el compilador y el mapeador produce el programa; después el programa se ejecuta en el intérprete de 0,6B. El autor declara unos 100 ms por llamada en la fase de ejecución.

No se han publicado en la información disponible detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO. El paper asociado ("Program-as-Weights: A Programming Paradigm for Fuzzy Functions", AIware 2026) figura referenciado con arXiv 2607.02512, pero su contenido no se incluye en la información proporcionada.

## Capacidades

- Compilación de especificaciones en lenguaje natural a programas ejecutables (LoRA) para el intérprete Qwen3-0.6B.
- Generación de "pseudo-programas" intermedios con descripción de tarea y ejemplos de entrada/salida.
- Salida de pesos como artefacto: el resultado de la compilación es un adaptador LoRA portable de ~22 MB.
- Ejecución local y offline del programa compilado sobre Qwen3-0.6B.
- Integración con el SDK `paw.compile(spec, compiler="paw-4b-qwen3-0.6b")`.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Compilación de funciones difusas en pipelines de datos: describir en lenguaje natural una función de normalización o clasificación y obtener un LoRA que se ejecuta sobre Qwen3-0.6B, reduciendo el coste frente a invocar un LLM grande por cada registro.
- Despliegue en el borde (edge) y entornos sin red: al ejecutarse offline sobre un modelo de 0,6B, el programa compilado puede correr en dispositivos con recursos limitados una vez generado el LoRA.
- Clasificación y extracción de campos en documentos: compilar un programa específico por tipo de documento y sustituir prompts largos por un adaptador de 22 MB con latencia declarada de ~100 ms por llamada.
- Enrutamiento y etiquetado de bajo coste: generar programas pequeños para tareas repetitivas (etiquetado de tickets, detección de intención) y ejecutarlos localmente sin depender de una API externa.
- Prototipado rápido de funciones personalizadas: usar `paw.compile` para transformar una especificación en un artefacto ejecutable y versionable, útil para iterar sobre requisitos cambiantes.
- Distribución de "programas" como artefactos: publicar y compartir LoRAs compilados en el hub de programas (programasweights.com) para que otros los ejecuten sobre el intérprete estándar.
- Investigación sobre generación de pesos: estudiar hiperredes que emiten adaptadores LoRA como salida, comparando la calidad del programa compilado frente al prompting directo del intérprete.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM para el compilador: no disponible de forma explícita; el compilador es un Qwen3-4B-Instruct-2507, por lo que en fp16 requiere del orden de 8-9 GB solo para pesos, más overhead de activaciones y de la cabeza mapeadora.
- VRAM para el intérprete: Qwen3-0.6B es un modelo pequeño; en fp16 ocupa aproximadamente 1,2 GB de pesos, y el LoRA compilado añade unos 22 MB.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, el compilador de 4B encaja en GPUs de 16-24 GB (por ejemplo, RTX 4090, A10, L4) y el intérprete de 0,6B en GPUs consumer de gama baja.
- ¿Cabe en GPU consumer? El intérprete de 0,6B sí cabe con holgura en cualquier GPU consumer moderna; el compilador de 4B requiere al menos 8-12 GB de VRAM según precisión.
- Opciones de despliegue: el autor referencia el SDK de Python `programasweights-python` para cargar y ejecutar programas compilados localmente. No se especifican integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: el autor declara aproximadamente 100 ms por llamada en la fase de ejecución del programa sobre Qwen3-0.6B. No se proporcionan cifras de throughput ni de latencia para la fase de compilación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| paw-4b-qwen3-0.6b | 4B (compilador) + 0,6B (interprete) | No disponible | Compilacion a LoRA (program-as-weights) | Apache 2.0 | Hugging Face + SDK |
| Qwen3-4B-Instruct-2507 | 4B | No disponible en esta ficha | LLM instructivo general | Apache 2.0 | Hugging Face |
| Qwen3-0.6B | 0,6B | No disponible en esta ficha | LLM pequeno general | Apache 2.0 | Hugging Face |
| Alternativas de hiperredes que emiten LoRA | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparativa directa con otros compiladores de programas no está disponible en la información proporcionada. Frente al uso directo de Qwen3-4B-Instruct-2507, PAW traslada la inferencia al intérprete de 0,6B una vez compilado el programa, lo que reduce el coste por llamada a cambio de una fase de compilación previa.

## Limitaciones y advertencias

- El modelo no es un chat general: su salida es un programa (LoRA) para Qwen3-0.6B, no texto conversacional libre.
- La calidad del programa compilado depende del pseudo-programa generado por el compilador de 4B; errores en esa fase se propagan al artefacto final.
- No hay información publicada sobre sesgos, tasas de alucinación o robustez frente a especificaciones ambiguas.
- El código de compilación y ejecución "limpio" y el preprint no estarán públicos hasta el 6 de julio de 2026 según la model card; hasta entonces solo hay un snapshot de referencia sin limpiar.
- El repositorio tiene 0 descargas y 9 likes en el momento de la consulta, lo que indica adopción muy temprana y poca validación externa.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3-4B-Instruct-2507 y del intérprete Qwen3-0.6B.
- No se especifican idiomas soportados; el comportamiento multilingüe es desconocido.
- La latencia declarada de ~100 ms por llamada corresponde a la ejecución del programa; no se documenta la latencia de la fase de compilación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/programasweights/paw-4b-qwen3-0.6b
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Interprete objetivo: https://huggingface.co/Qwen/Qwen3-0.6B
- SDK de Python: https://github.com/programasweights/programasweights-python
- Demo y hub de programas: https://programasweights.com
- Paper (arXiv): https://arxiv.org/abs/2607.02512
- Snapshot de referencia: https://anonymous.4open.science/r/programasweights

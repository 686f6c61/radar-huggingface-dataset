# sirappsec/tachles-qwen2.5-1.5b-mlx

## Resumen

Tachles es un adaptador LoRA de tipo fine-tune sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct, desarrollado por el usuario sirappsec y publicado en HuggingFace. Su proposito es dotar al modelo base de una voz y un estilo de comunicacion especificos orientados a la asistencia en ingenieria de software: respuestas directas, voz activa, tiempo presente y una estructura fija de "accion, impacto, siguiente paso". No se trata de un modelo nuevo entrenado desde cero, sino de un ajuste fino ligero que modifica el comportamiento estilistico del modelo base sin alterar su arquitectura subyacente.

El adaptador esta entrenado con la libreria mlx-lm de Apple, lo que lo hace especialmente adecuado para inferencia en chips Apple Silicon (M1, M2, M3, M4). El modelo base Qwen2.5-1.5B-Instruct es un transformer decoder-only de 1.500 millones de parametros desarrollado por Alibaba, con soporte multilingue y una ventana de contexto de 32.768 tokens. El adaptador en si ocupa aproximadamente 20 MB, lo que lo convierte en un complemento extremadamente ligero.

La relevancia de esta ficha radica en su caracter de ejemplo de fine-tuning estilistico de bajo coste: con solo 219 ejemplos de entrenamiento y 600 iteraciones, el autor persigue un cambio de tono y formato en las respuestas. Es un caso representativo de adaptacion de modelos pequenos para dominios concretos en hardware de consumo, aunque con un alcance limitado y sin datos publicados de evaluacion cuantitativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con adaptador LoRA |
| Parametros totales | 1.500 millones (modelo base Qwen2.5-1.5B-Instruct) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en formato MLX; el modelo base admite cuantizacion GGUF y MLX) |
| Idiomas soportados | Ingles (en), hebreo (he) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (adaptador LoRA, ~20 MB) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only con atencion causal estandar, 1.500 millones de parametros y un vocabulario multilingue. El fine-tuning se realizo mediante LoRA con la libreria mlx-lm, con rango r=8, escala alpha/r=20 y 16 capas adaptadas. El entrenamiento empleo 219 ejemplos de entrenamiento y 45 de validacion, con 600 iteraciones, learning rate de 1e-4 y batch efectivo de 16 (4 x 4 de acumulacion de gradientes). El adaptador resultante pesa aproximadamente 20 MB.

No se especifica en la informacion disponible la composicion del dataset de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas de RLHF o DPO. El objetivo declarado es estilistico: imponer una voz concreta ("Action, Impact, Next", voz activa, tiempo presente, verbos simples, detalles especificos y sugerencias en primera persona). No hay indicacion de que se haya modificado el conocimiento factual del modelo base ni de que se hayan realizado evaluaciones de rendimiento tras el ajuste.

## Capacidades

- Generacion de texto en ingles y hebreo, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Estilo de comunicacion especifico orientado a ingenieria: estructura accion, impacto, siguiente paso; voz activa; tiempo presente; verbos directos.
- Respuestas concisas y con detalles concretos (por ejemplo, "401 en la ejecucion 19 del escaneo" en lugar de "problemas de autenticacion").
- Uso de sugerencias en primera persona ("I'd suggest", "I believe", "I'll own").
- Capacidad de generar feedback de pull requests, resumenes de standup y descripciones de bugs con el tono Tachles.
- Soporte de tool calling y function calling: no documentado en la informacion disponible (el modelo base Qwen2.5-1.5B-Instruct lo soporta, pero el adaptador no lo declara explicitamente).
- Soporte de agentes y razonamiento multi-paso: no documentado especificamente para el adaptador.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Revision de pull requests: el adaptador genera comentarios de PR con el formato "accion, impacto, siguiente paso", por ejemplo "Adds caching, cuts API response from 400ms to 45ms under load", lo que facilita la lectura rapida en equipos de ingenieria.
- Resumenes de standup diarios: a partir de notas de trabajo o issues, el modelo produce actualizaciones concisas con las secciones "Doing", "Blocker" y "Next", utiles para reuniones sincronas o asincronas.
- Descripcion de bugs y tickets: el modelo redacta incidencias con detalles especificos (codigos de error, endpoints, numeros de ejecucion) en lugar de descripciones vagas, mejorando la trazabilidad.
- Asistente de documentacion tecnica interna: genera notas de release y changelogs con verbos directos ("Ships", "Fixes", "Adds") y tiempo presente, alineados con convenciones de equipos agiles.
- Prototipado rapido en Mac: al ejecutarse con mlx-lm en Apple Silicon, permite probar un asistente de ingenieria local sin GPU dedicada, con un adaptador de 20 MB sobre un modelo de 1.5B.
- Educacion y entrenamiento de estilo: sirve como ejemplo de como un LoRA de bajo rango y pocos ejemplos puede modificar el tono de un modelo pequeno, util para experimentos de alineacion estilistica.
- Generacion de respuestas breves en hebreo e ingles para equipos bilingues: el modelo base soporta ambos idiomas y el adaptador mantiene esa capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1.5B en precision completa (FP16) requiere aproximadamente 3 GB; en cuantizacion de 4 bits, alrededor de 1 GB. El adaptador anade unos 20 MB.
- GPU recomendadas: no aplica para el adaptador MLX, que esta disenado para Apple Silicon. Para el modelo base en GPU NVIDIA se puede usar una RTX 3060 de 12 GB o superior; una RTX 4090 o A100 no son necesarias para 1.5B.
- Cabe en GPU de consumo: si, en cualquier GPU con 4 GB o mas de VRAM para el modelo base en cuantizacion. En Apple Silicon, se ejecuta en Macs con M1 o superior.
- Opciones de despliegue: mlx-lm (via oficial para este adaptador), llama.cpp, Ollama, vLLM y TGI para el modelo base (el adaptador MLX requiere mlx-lm o conversion).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Tachles (Qwen2.5-1.5B MLX LoRA) | 1.5B (base) + LoRA r=8 | 32.768 | Apache 2.0 | MLX | Fine-tune estilistico para ingenieria, solo Apple Silicon |
| Qwen2.5-1.5B-Instruct | 1.5B | 32.768 | Apache 2.0 | Safetensors, GGUF, MLX | Modelo base sin ajuste estilistico, multilingue |
| Tachles PEFT (variante del mismo autor) | 1.5B (base) + LoRA | 32.768 | Apache 2.0 | PEFT | Misma voz Tachles, para GPUs y otros entornos |
| SmolLM2-1.7B-Instruct | 1.7B | 8.192 | Apache 2.0 | Safetensors, GGUF | Alternativa pequena de HuggingFace, sin fine-tune de estilo |

## Limitaciones y advertencias

- El adaptador es un fine-tune estilistico con solo 219 ejemplos de entrenamiento; no se han publicado evaluaciones cuantitativas que demuestren mejoras en razonamiento, codigo o matematicas.
- El modelo base de 1.5B tiene capacidad limitada para tareas complejas de razonamiento y generacion de codigo en comparacion con modelos de mayor tamano; el adaptador no corrige esta limitacion.
- Riesgo de alucinacion inherente al modelo base, especialmente en dominios especializados y con contexto largo.
- El adaptador esta empaquetado en formato MLX y esta pensado para Apple Silicon; su uso en GPUs NVIDIA u otros entornos requiere la variante PEFT o conversion.
- La model card declara solo ingles y hebreo; el rendimiento en otros idiomas no esta garantizado.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo se publica sin descargas ni likes, lo que sugiere ausencia de validacion comunitaria.
- No se documenta el dataset de entrenamiento, por lo que no se puede evaluar el riesgo de sesgos introducidos por los ejemplos.
- El estilo impuesto ("Action, Impact, Next") puede no ser adecuado para todos los contextos; es un tono especifico de ingenieria, no un asistente generalista.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/sirappsec/tachles-qwen2.5-1.5b-mlx
- Variante PEFT del mismo autor: https://huggingface.co/sirappsec/tachles-qwen2.5-1.5b
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Libreria mlx-lm: https://github.com/ml-explore/mlx-lm
- Documentacion de MLX: https://ml-explore.github.io/mlx/

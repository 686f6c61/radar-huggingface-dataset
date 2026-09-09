# ajvikram/toolcall-2b

## Resumen

Toolcall-2B es un modelo de lenguaje de 2.274 millones de parámetros desarrollado por Ajay Singh (usuario de HuggingFace ajvikram) mediante fine-tuning de Qwen/Qwen3.5-2B. Su propósito es resolver el enrutamiento de herramientas en agentes: decidir qué función llamar, con qué argumentos, en qué orden y si conviene llamar alguna. Está diseñado para ejecutarse localmente y sustituir a modelos frontera en decisiones de bajo coste de juicio pero alto coste en tokens. Se publica bajo licencia Apache-2.0.

El modelo conserva el formato nativo de tool-call de Qwen3.5, por lo que se integra sin cambios en stacks que ya lo parsean. Se evaluó en el harness del Berkeley Function Calling Leaderboard v4 (BFCL v4) con vLLM en bf16, temperatura 0.001 y una ventana de contexto de 128k. No es multimodal ni un modelo de razonamiento general; su dominio es la selección de herramientas en tareas de agente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen3.5-2B |
| Parámetros totales | 2.274.069.824 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 128k (utilizado en la evaluación BFCL v4; máximo oficial no especificado) |
| Tipos de cuantización | Safetensors en bf16; GGUF: Q4_K_M, Q5_K_M, Q8_0, f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors; GGUF para llama.cpp y Ollama |

## Arquitectura y entrenamiento

Toolcall-2B es un modelo Transformer denso (no mezcla de expertos) heredado de Qwen3.5-2B. La información disponible no detalla la arquitectura interna del modelo base, como el tipo de atención o el número de capas. El fine-tuning se realizó con supervisión (SFT) utilizando LoRA de 16 bits con rank 16, alpha 32 y todas las proyecciones lineales. La pérdida se calculó únicamente sobre los turnos del asistente, con secuencias de hasta 8.192 tokens, tasa de aprendizaje 3e-5, 0,6 épocas, tamaño de batch 4 y acumulación en 8 pasos. El entrenamiento duró 3,2 horas en una RTX A6000, con pérdida final de 0,330 y pérdida de validación de 0,247.

El conjunto de datos contiene 61.712 ejemplos procedentes de fuentes con licencias permisivas: ToolACE, Hermes function-calling v1, Glaive v2, xLAM 60k, xLAM irrelevance, SmolTalk y 2.134 episodios simulados generados para este modelo. Se aplicaron dos aumentaciones deterministas: enmascaramiento de funciones (renombrado de herramientas y parámetros a identificadores opacos) y herramientas distractoras extraídas de otros ejemplos. El elemento clave para mejorar el rendimiento en multi-turno fue incorporar 2.134 conversaciones generadas contra seis APIs simuladas con estado (sistema de archivos, gestor de tareas, correo, memoria clave-valor, calendario y tienda).

## Capacidades

- Generación de llamadas a funciones con selección de herramienta, argumentos, orden y decisión de no llamar a ninguna.
- Formato nativo de tool-call de Qwen3.5, compatible con stacks existentes que parsean dicho formato.
- Soporte de conversaciones multi-turno con estado, mejorado respecto al modelo base.
- Soporte de tool calling en paralelo (parallel y live_parallel).
- Sin capacidades multimodales (sin visión ni audio).
- Thinking mode desactivado por defecto, tal y como se entrenó y evaluó.
- Idiomas: únicamente inglés.

## Casos de uso

- Enrutamiento de herramientas en agentes locales: el modelo decide qué función llamar y con qué argumentos, permitiendo ejecutar agentes en entornos locales con vLLM.
- Atención al cliente automatizada con APIs internas: un agente que consulta sistemas de tareas, calendario o correo puede mantener el contexto a lo largo de varios turnos.
- Automatización de tareas administrativas con estado: gracias a los episodios simulados de sistema de archivos, gestor de tareas, correo y calendario, el modelo puede completar tareas que requieren varios pasos manteniendo estado.
- Despliegue en portátiles y equipos de consumo: la cuantización Q4_K_M de 1,22 GB permite inferencia en CPU a unos 33 tokens por segundo.
- Sustitución de modelos frontera en decisiones de tool calling: reduce el coste en tokens en tareas de bajo juicio y alta frecuencia.
- Integración en stacks Qwen3.5 existentes: al mantener el formato nativo, se puede incorporar como reemplazo directo sin cambios en el código de parseo.
- Prototipado rápido de agentes con Ollama o llama.cpp: permite probar flujos de agente sin GPU dedicada.

## Benchmarks y rendimiento

Resultados medidos con el harness BFCL v4 en un servidor con vLLM, bf16, temperatura 0.001 y contexto de 128k. El modelo base Qwen3.5-2B se re-evaluó bajo las mismas condiciones.

| Grupo | Qwen3.5-2B (base) | Toolcall-2B |
|---|---|---|
| Overall (22 categorías) | 33.85 | 36.35 |
| Media de 20 categorías no limitadas por search quota | 48.13 | 59.05 |
| Non-live single-turn | 60.08 | 83.25 |
| Live single-turn | 71.13 | 74.32 |
| Multi-turn | 17.75 | 22.12 |
| Memory | 30.97 | 31.18 |
| Web search | 9.50 | 4.50* |

\* El resultado de web search no es fiable: el plan gratuito de la API de búsqueda permite 250 consultas al mes y una pasada sobre esta categoría consume unas 165, por lo que el dato está limitado por cuota. La media de 20 categorías es la comparación fiable.

Mayores ganancias por categoría sobre la base:

| Categoría | Base | Toolcall-2B |
|---|---|---|
| simple_java | 15.0 | 61.0 |
| parallel | 49.0 | 86.0 |
| simple_javascript | 24.0 | 52.0 |
| live_parallel | 62.5 | 87.5 |
| live_parallel_multiple | 50.0 | 75.0 |
| simple_python | 70.0 | 89.5 |

En las cuatro categorías de multi-turno, el modelo también supera a la base: multi-turn 27.0 → 31.0, long context 24.0 → 30.5, missing parameter 14.0 → 18.0 y missing function 6.0 → 9.0.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, los pesos ocupan aproximadamente 4,6 GB (tamaño del repositorio); con cuantización Q4_K_M, el archivo GGUF pesa 1,22 GB.
- GPU recomendadas: para entrenamiento se utilizó una RTX A6000. Para inferencia con vLLM, una GPU con 8-12 GB de VRAM es suficiente; una RTX 4090 proporciona margen amplio.
- Compatibilidad con GPU de consumo: sí, especialmente con cuantización GGUF; el modelo puede ejecutarse en CPU portátil en Q4_K_M.
- Opciones de despliegue: vLLM con `--enable-auto-tool-choice --tool-call-parser qwen3_xml`; llama.cpp y Ollama mediante los pesos GGUF.
- Latencia y throughput: con Q4_K_M en una CPU portátil se alcanzan aproximadamente 33 tokens por segundo; no se proporcionan más datos.

## Comparativa con modelos similares

No se han encontrado alternativas de la misma categoría (modelos de function-calling de 2B) con datos comparables en la información disponible. La comparación más directa es con el modelo base:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | BFCL Overall (22 cat.) |
|---|---|---|---|---|---|
| Toolcall-2B | 2.27B | 128k (evaluación) | Apache-2.0 | HuggingFace | 36.35 |
| Qwen3.5-2B (base) | 2.27B | no disponible | no disponible | HuggingFace | 33.85 |

## Limitaciones y advertencias

- Sesgos y alucinaciones: no se han publicado evaluaciones específicas sobre sesgos; el modelo está optimizado para llamadas a herramientas, no para generación de texto libre.
- Debilidad en refusal: el rendimiento baja respecto a la base en las categorías de irrelevancia (77.9 → 72.5) y relevancia en vivo (87.5 → 81.2). El autor indica que un intento de corregirlo empeoró multi-turno y memoria.
- Búsqueda web no fiable: la puntuación en web search (4.50) está limitada por la cuota de la API y no es representativa.
- Idioma: solo inglés; no se ha evaluado en otros idiomas.
- Contexto: la ventana de 128k se utilizó en evaluación, pero el máximo oficial del modelo base no se especifica.
- Licencia: Apache-2.0 permite uso comercial. Algunos datos de entrenamiento (xLAM) son CC-BY-4.0, lo que requiere atribución, pero es compatible con la licencia del modelo.
- Modelo recién publicado: 0 descargas y 0 likes en HuggingFace; no ha sido validado por la comunidad en entornos de producción.

## Enlaces

- Modelo: https://huggingface.co/ajvikram/toolcall-2b
- Pesos cuantizados GGUF: https://huggingface.co/ajvikram/toolcall-2b-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Datasets de entrenamiento:
  - ToolACE: https://huggingface.co/datasets/Team-ACE/ToolACE
  - Hermes function-calling v1: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
  - Glaive v2: https://huggingface.co/datasets/glaiveai/glaive-function-calling-v2
  - xLAM 60k: https://huggingface.co/datasets/Salesforce/xlam-function-calling-60k
  - xLAM irrelevance: https://huggingface.co/datasets/MadeAgents/xlam-irrelevance-7.5k
  - SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Perfil del autor: https://huggingface.co/ajvikram

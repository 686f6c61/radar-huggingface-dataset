# roudha17/dseg660-qwen3-1.7b-lora

## Resumen

DSEG660 Qwen3-1.7B LoRA es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base Qwen/Qwen3-1.7B, publicado por el usuario roudha17 en Hugging Face. No se trata de un modelo fundacional nuevo, sino de un ejercicio academico o de evaluacion (identificado como "DSEG660 exercise") cuyo comportamiento entrenado es muy especifico: escribir la frase "I like DSEG660" en la primera linea de la respuesta por defecto, y en la ultima linea cuando el usuario opta explicitamente por no recibir esa apertura.

El adaptador se distribuye en formato PEFT (safetensors) junto con una version GGUF cuantizada Q4_K_M del adaptador seleccionado y un Modelfile de Ollama. El repositorio incluye dos variantes del adaptador (`adapter_initial` y `adapter_revision`), conjuntos de datos de entrenamiento y validacion (v1 y v2), resultados de evaluacion con 128 respuestas crudas por ejecucion y el codigo para reproducir las puntuaciones. El modelo base Qwen3-1.7B aporta la arquitectura transformer subyacente, con aproximadamente 2.031 millones de parametros totales segun los safetensors.

La relevancia de esta ficha es limitada: se trata de un artefacto de investigacion con un comportamiento entrenado muy acotado, sin licencia declarada, sin idiomas declarados y con cero descargas en el momento de la consulta. No es un modelo apto para produccion general, sino un caso de estudio sobre entrenamiento de adaptadores LoRA y evaluacion de comportamiento condicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-1.7B) con adaptador LoRA (PEFT) |
| Parametros totales | 2.031.739.904 (modelo base + adaptador) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-1.7B, no declarada en la model card) |
| Tipos de cuantizacion | GGUF Q4_K_M del adaptador; safetensors en precision original del adaptador |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT/LoRA) y GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado sobre Qwen/Qwen3-1.7B, un transformer decoder-only de la familia Qwen3. El adaptador se ajusta mediante PEFT y se distribuye en dos variantes: `adapter_initial` (seleccionada en el conjunto de desarrollo) y `adapter_revision` (no seleccionada). El repositorio incluye los conjuntos de entrenamiento y desarrollo en dos versiones (`v1` inicial y `v2` de revision, compartiendo el mismo conjunto de desarrollo), lo que sugiere un proceso iterativo de ajuste del comportamiento.

El objetivo de entrenamiento es un comportamiento condicional muy concreto: generar "I like DSEG660" en la primera linea por defecto, y en la ultima linea cuando el usuario opta explicitamente por no recibir la apertura. La evaluacion se realizo con 128 prompts, decodificacion greedy, 64 tokens maximos, modo no-thinking y sin system prompt, obteniendo una puntuacion de colocacion de 128/128, respuestas correctas 107/128 y 0 opt-outs falsos. No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; el entrenamiento es exclusivamente de adaptacion supervisada sobre el modelo base.

## Capacidades

- Generacion de texto conversacional heredada del modelo base Qwen3-1.7B.
- Comportamiento entrenado especifico: insercion de la frase "I like DSEG660" en la primera linea por defecto.
- Comportamiento condicional: desplazamiento de la frase a la ultima linea cuando el usuario opta explicitamente por no recibir la apertura.
- Soporte de conversacion multi-turno (heredado del modelo base, no validado en la model card).
- Capacidades de razonamiento, codigo y matematicas del modelo base Qwen3-1.7B (no evaluadas en este adaptador).
- Soporte de tool calling / function calling: no disponible (no declarado).
- Soporte de agentes y multi-step reasoning: no disponible (no declarado).
- Capacidades multilingues: no disponible (no declarado).

## Casos de uso

- Investigacion sobre entrenamiento LoRA: el repositorio sirve como caso de estudio reproducible para analizar como un adaptador de bajo rango modifica un comportamiento condicional concreto sobre un modelo base pequeno, incluyendo conjuntos de datos y scripts de evaluacion.
- Evaluacion de robustez de instrucciones: los 128 prompts con puntuaciones por prompt permiten estudiar la tasa de exito (107/128) y los fallos de un adaptador en condiciones controladas.
- Pruebas de despliegue con Ollama: el repositorio incluye un Modelfile y un GGUF Q4_K_M del adaptador, lo que permite validar el flujo de conversion PEFT a GGUF y el despliegue local en Ollama.
- Docencia y formacion: util como ejemplo practico de pipeline completo (entrenamiento, seleccion en dev, evaluacion, cuantizacion y publicacion) para cursos de ajuste fino de LLM.
- Comparacion de variantes de adaptador: las carpetas `adapter_initial` y `adapter_revision` permiten comparar el impacto de una revision del entrenamiento manteniendo el mismo conjunto de desarrollo.
- Reproducibilidad de resultados: el script `evaluate.py` y los resultados crudos permiten reproducir las puntuaciones y verificar la metodologia de evaluacion.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Colocacion de la frase (placement) | 128/128 |
| Respuestas correctas | 107/128 |
| Opt-outs falsos | 0 |
| Condiciones de evaluacion | 128 prompts, greedy, 64 tokens, non-thinking, sin system prompt |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3-1.7B en FP16 requiere aproximadamente 3,4 GB solo para pesos; con overhead de activaciones y cache KV, se recomienda al menos 6-8 GB de VRAM para contexto moderado. El adaptador LoRA anade una cantidad marginal de memoria.
- En cuantizacion Q4_K_M (GGUF del adaptador), el modelo base cuantizado equivalente ocupa del orden de 1-1,5 GB, por lo que cabe en GPUs consumer con 4-6 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 para mayor throughput; A100 o H100 no son necesarias para este tamano.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 6 GB o mas de VRAM en cuantizacion Q4_K_M.
- Opciones de despliegue: Ollama (el repositorio incluye Modelfile), llama.cpp (via GGUF), vLLM y TGI (via PEFT/safetensors, requiriendo cargar el modelo base y aplicar el adaptador).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| roudha17/dseg660-qwen3-1.7b-lora | 2.031.739.904 (base + adaptador) | no disponible | no disponible | safetensors (PEFT), GGUF Q4_K_M | Adaptador LoRA con comportamiento condicional especifico |
| Qwen/Qwen3-1.7B | ~1,7 mil millones | no disponible en esta ficha | no disponible en esta ficha | safetensors, GGUF | Modelo base sin adaptador; capacidades generales |
| Adaptadores LoRA genericos sobre Qwen3-1.7B | variable | heredado del base | variable | safetensors, GGUF | No disponible una comparativa concreta en la informacion proporcionada |

No se dispone de datos de benchmarks comparativos con modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- Comportamiento entrenado muy acotado: el adaptador esta disenado para insertar una frase concreta, lo que limita su utilidad fuera de ese proposito.
- Tasa de respuestas correctas del 107/128 en la evaluacion propia, lo que indica un 16,4% de fallos en el conjunto de prueba declarado.
- Sin licencia declarada: no se puede asumir uso comercial permitido; es necesario contactar con el autor o consultar la licencia del modelo base Qwen3-1.7B.
- Sin idiomas declarados: no hay garantia de comportamiento multilingue mas alla del heredado del modelo base.
- Sin datos de sesgos, alucinacion o robustez mas alla de la evaluacion de 128 prompts.
- Repositorio con cero descargas y cero likes en el momento de la consulta: no hay validacion comunitaria ni reportes de uso en produccion.
- El adaptador no ha sido evaluado en tareas generales (razonamiento, codigo, matematicas); su rendimiento en esas areas depende del modelo base y no esta documentado.
- La fecha de creacion indicada (2026-11-18) es futura respecto a la fecha habitual de consulta, lo que puede indicar un error en los metadatos del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/roudha17/dseg660-qwen3-1.7b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio PEFT: https://github.com/huggingface/peft
- Ollama: https://ollama.com
- llama.cpp: https://github.com/ggerganov/llama.cpp

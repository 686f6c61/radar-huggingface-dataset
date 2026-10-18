# Guangze/memops-small-qwen3-0.6b-lora

## Resumen

memops-small es un adaptador LoRA sobre el modelo Qwen/Qwen3-0.6B (revisión `c1899de289a04d12100db370d81485cdf75e47ca`) publicado por el usuario Guangze. No es un modelo generativo de propósito general, sino un clasificador de relaciones de memoria: recibe un hecho candidato nuevo y una memoria existente, y devuelve un JSON estricto con la forma `{"verdict": "same" | "conflict" | "unrelated"}`. Se desarrolló durante The Recursive Agents Hackathon (17 de octubre de 2026) como parte del proyecto BrainBob, en la issue #7.

Su relevancia es acotada pero concreta: cubre una etapa habitual en sistemas de agentes con memoria persistente, la deduplicación y detección de conflictos entre hechos almacenados. El autor lo marca explícitamente como experimental y opt-in, y aclara que el adaptador solo nombra la relación semántica; las reglas deterministas de BrainBob (autoridad, alcance, cronología, bloqueos) deciden qué se hace con la memoria. El modelo no puede borrar nada y, ante una salida malformada, el sistema cae en la ruta conservadora. No es el juez por defecto de BrainBob.

El tamaño es mínimo: el adaptador se apoya en un modelo base de 0,6B de parámetros, con LoRA de rango 16 sobre las proyecciones q/k/v/o, entrenado en 9 pasos sobre una única NVIDIA L4. Está pensado para ejecutarse como clasificador barato dentro de un pipeline, no como generador de texto abierto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Qwen3-0.6B; LoRA r=16, alpha=32, dropout 0,05 en q/k/v/o |
| Parametros totales | No disponible para el adaptador; modelo base de 0,6B de parámetros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | No disponible; pesos del adaptador en safetensors (entrenado en bf16) |
| Idiomas soportados | Inglés únicamente (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT); requiere cargar el modelo base por separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-0.6B, un transformer decoder-only de la familia Qwen3 en su variante más pequeña. El ajuste es un LoRA de rango 16 y alpha 32 con dropout 0,05 sobre las matrices q, k, v y o, con pérdida restringida a los tokens de completion (completion-only loss) y en modo no-thinking. La configuración de entrenamiento fue: learning rate 2e-4, 1 época, semilla 42, precisión bf16, 9 pasos en total, 8,4 segundos en una sola NVIDIA L4. El script empleado es `code/job_all.py` y la configuración completa está en `runs/20261017-210457/run_meta.json`.

Los datos son enteramente sintéticos: 144 pares de entrenamiento (50 `same`, 44 `conflict`, 50 `unrelated`) generados con `nvidia/NVIDIA-Nemotron-3-Super-120B-A12B`, divididos por plantilla de historia para evitar fuga entre splits, y con 23 etiquetas del profesor corregidas manualmente. El autor declara que no se usó ningún dato de empresa. No hay información sobre RLHF, DPO ni sobre el volumen total de tokens del modelo base.

## Capacidades

- Clasificación de relaciones entre un hecho candidato y una memoria existente en tres clases cerradas: `same`, `conflict`, `unrelated`.
- Salida en JSON estricto con la clave `verdict`, apta para parseo directo en pipelines.
- Integración como componente de un sistema de memoria para agentes (caso de uso BrainBob), siempre subordinado a reglas deterministas.
- Funcionamiento en modo no-thinking, adecuado para llamadas de baja latencia y bajo coste.
- No cubre generación de texto abierto, código, matemáticas, visión ni audio de forma fiable: el ajuste está especializado en la tarea de clasificación.
- No se documenta soporte de tool calling ni de razonamiento multi-paso.
- Multilingüismo: no. Solo inglés, según el autor.

## Casos de uso

- Deduplicación de memoria en agentes conversacionales: antes de insertar un hecho nuevo en el store, el adaptador compara con la memoria candidata y marca `same` si es redundante, evitando entradas repetidas con coste mínimo (0,6B de base).
- Detección de contradicciones en memorias de usuario: si el usuario cambia una preferencia, el adaptador señala `conflict` y el sistema aplica sus reglas de autoridad y cronología para decidir la sobrescritura.
- Filtro previo (pre-check) en pipelines RAG con memoria episódica: descarta pares claramente `unrelated` antes de invocar un juez mayor y más caro, reduciendo el número de llamadas a modelos grandes.
- Enrutado de escrituras en sistemas multi-agente: cada agente propone hechos y el adaptador clasifica la relación con el estado compartido, permitiendo que un coordinador resuelva colisiones.
- Etiquetado asistido de datos de memoria: usar el adaptador como generador de etiquetas preliminares sobre pares nuevos, con revisión humana posterior, dado su coste de inferencia casi despreciable.
- Experimentación e investigación en hackathons y prototipos: sirve como referencia reproducible de un ajuste LoRA pequeño (9 pasos, 8,4 s en L4) para tareas de clasificación semántica acotada.
- Despliegue en hardware modesto: al apoyarse en una base de 0,6B, puede ejecutarse en GPUs de consumo o incluso en CPU para lotes pequeños, integrándose vía PEFT sobre transformers.

## Benchmarks y rendimiento

Evaluación del autor sobre 60 pares sintéticos congelados (20 por etiqueta), con el scorer de Bob benchmark (`codex/bob-benchmark@ab084a6`):

| Metrica | Base (Qwen3-0.6B) | Base + adaptador |
|---|---|---|
| Accuracy | 32/60 (53,3 %) | 42/60 (70,0 %) |
| Macro-F1 | 0,437 | 0,694 |
| Salidas invalidas | 0 | 0 |

El delta de accuracy es de +16,7 puntos porcentuales, con bootstrap por clúster de plantilla al 95 % de [+5,0, +28,3]. El autor advierte de que el modelo ajustado etiqueta 5 pares no-conflicto como `conflict` (el base: 0), lo que incrementa el riesgo de sobrescritura cuando hay una corrección autorizada de por medio. Las predicciones y probabilidades por etiqueta están en `runs/20261017-210457/`. No hay resultados en MMLU, HumanEval, GSM8K ni comparación con un juez de mayor tamaño sobre el mismo conjunto.

## Requisitos de hardware

- VRAM estimada: el modelo base de 0,6B ocupa aproximadamente 1,2 GB en bf16 y unos 2,4 GB en fp32, más el overhead de activaciones y del adaptador; el adaptador en sí es de tamaño muy reducido (el repo declara 0,0 GB).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente en la práctica; el autor entrenó en una NVIDIA L4. Para servir en producción con mayor concurrencia, A100/H100 o L4/L40S aportan margen, aunque el modelo es deliberadamente pequeño.
- Cabe en GPU de consumo: sí, en tarjetas tipo RTX 3060/4060/4090 y similares, e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: PEFT + transformers para cargar el adaptador sobre Qwen3-0.6B; vLLM con soporte multi-LoRA para servir varios adaptadores sobre una misma base; fusión del adaptador y conversión a GGUF para llama.cpp u Ollama si se necesita inferencia en CPU.
- Latencia y throughput: no disponibles. Como referencia indirecta, el entrenamiento completo fueron 9 pasos en 8,4 s en una L4, lo que indica un coste de cómputo muy bajo, pero no se publican métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| memops-small-qwen3-0.6b-lora | Adaptador LoRA sobre base de 0,6B | No disponible | 70,0 % accuracy / 0,694 macro-F1 en 60 pares sintéticos | Apache 2.0 | HuggingFace (adaptador) |
| Qwen/Qwen3-0.6B (base, sin adaptador) | 0,6B | No disponible en la información | 53,3 % accuracy / 0,437 macro-F1 en el mismo conjunto | Apache 2.0 | HuggingFace |
| Juez LLM de mayor tamaño (p. ej. el profesor Nemotron-3-Super-120B-A12B) | 120B totales / 12B activos (MoE) | No disponible | No evaluado sobre este conjunto por el autor | No disponible | Uso como generador de datos de entrenamiento |

No se dispone de comparación con otros clasificadores de relaciones de memoria ni con jueces grandes sobre el mismo conjunto de evaluación; el autor lo señala como limitación pendiente.

## Limitaciones y advertencias

- Evaluación muy reducida: 60 pares sintéticos con un solo anotador, sin revisión independiente de etiquetas ni comparación con un juez de mayor tamaño en el mismo set.
- La mitad de los conflictos reales se siguen prediciendo como `unrelated`, por lo que el adaptador no sustituye a un juez más capaz en casos ambiguos.
- Riesgo de sobrescritura: el modelo ajustado etiqueta 5 pares no-conflicto como `conflict`, lo que puede provocar reemplazos indebidos si el sistema no aplica reglas de autoridad y cronología.
- Solo inglés y solo pares cortos de un único hecho; no se ha validado en textos largos, multi-hecho ni en otros idiomas.
- Carácter experimental y opt-in: el autor indica explícitamente que no es el juez por defecto de BrainBob y que no puede borrar memoria por sí mismo.
- Dependencia de un fallback conservador: cualquier salida malformada debe descartarse; aunque en la evaluación no hubo salidas inválidas (0/60), el sistema debe validar el JSON.
- Licencia Apache 2.0 en el adaptador, pero el uso comercial está sujeto también a la licencia del modelo base Qwen3-0.6B.
- Sesgos: no documentados por el autor; al entrenarse con datos sintéticos generados por un LLM, puede heredar sesgos de ese profesor.
- Riesgo de alucinación: limitado al formato de salida, pero existe la posibilidad de etiquetas semánticamente incorrectas presentadas con JSON válido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Guangze/memops-small-qwen3-0.6b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Revisión del modelo base: `c1899de289a04d12100db370d81485cdf75e47ca`
- Proyecto BrainBob (issue #7): https://github.com/jerelvelarde/BrainBob
- Scorer del benchmark: `codex/bob-benchmark@ab084a6` (referencia citada en la model card)
- Script de entrenamiento: `code/job_all.py` (incluido en el repositorio del modelo)
- Configuración y predicciones: `runs/20261017-210457/` y `runs/20261017-210457/run_meta.json`
- Generador de datos sintéticos: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Super-120B-A12B

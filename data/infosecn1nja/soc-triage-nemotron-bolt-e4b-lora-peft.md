# infosecn1nja/soc-triage-nemotron-bolt-e4b-lora-peft

## Resumen

`soc-triage-nemotron-bolt-e4b-lora-peft` es un adaptador LoRA en formato PEFT publicado por el usuario infosecn1nja, pensado para triaje de alertas en un centro de operaciones de seguridad (SOC). No es un modelo completo: se aplica sobre `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16`, un modelo de la familia Nemotron 3.5 de NVIDIA, y su función es especializar ese modelo base en la clasificación y el enrutado de alertas de seguridad.

El artefacto es una conversión del adaptador original en formato MLX (`infosecn1nja/soc-triage-nemotron-bolt-e4b-lora`) a PEFT, con el objetivo de poder servirlo en vLLM y SGLang mediante soporte nativo de LoRA. Para reproducir el delta del adaptador MLX se fija `rank=8` y `lora_alpha=160`, equivalente a la escala 20 de MLX multiplicada por el rank.

Su relevancia es acotada pero práctica: permite desplegar un modelo especializado en triaje SOC sobre infraestructura de serving estándar (API compatible con OpenAI) sin reentrenar ni fusionar pesos. El propio autor lo marca como artefacto experimental de serving, todavía no validado en GPU, por lo que requiere pasar un test de humo antes de cualquier uso real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only; arquitectura interna del modelo base no disponible |
| Parámetros totales | No disponible. El adaptador es de rank 8; el número exacto de parámetros del adaptador y del modelo base no se documenta |
| Parámetros activos | No disponible (no se confirma si el modelo base es MoE) |
| Longitud de contexto | 4096 tokens en la configuración de servicio de ejemplo (`--max-model-len 4096` en vLLM, `--context-length 4096` en SGLang); máximo nativo del modelo base no disponible |
| Tipos de cuantización | No disponible. El adaptador se publica en safetensors y los ejemplos de serving usan `--dtype bfloat16` |
| Idiomas soportados | Inglés (`en`) |
| Licencia | OpenMDW 1.1 (`license: other`, `license_name: openmdw-1.1`) |
| Formato de pesos | safetensors (adaptador LoRA PEFT), compatible con vLLM y SGLang |
| Modelo base | `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16` (relación: adapter) |
| Rank / alpha LoRA | 8 / 160 (equivalente a escala MLX 20 × rank 8) |
| Módulos objetivo | `q_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`, `per_layer_input_gate`, `per_layer_projection` |
| Backends soportados | vLLM (`--enable-lora --max-lora-rank 8`), SGLang (`--enable-lora --max-lora-rank 8`) |
| Tamaño del repositorio | 0.0 GB (solo pesos del adaptador) |

## Arquitectura y entrenamiento

El repositorio contiene únicamente el delta LoRA, no pesos completos. La conversión desde MLX a PEFT mantiene el mismo conjunto de módulos objetivo, que abarca las proyecciones de atención (`q_proj`, `o_proj`) y del bloque MLP (`gate_proj`, `up_proj`, `down_proj`), además de dos módulos propios de la arquitectura del modelo base (`per_layer_input_gate`, `per_layer_projection`). La presencia de estas dos últimas capas indica que el modelo base incorpora mecanismos de proyección y compuerta por capa que se salen del esquema transformer estándar, aunque la model card no detalla la arquitectura interna.

No hay información publicada sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni si se aplicaron técnicas de alineamiento como RLHF o DPO. Por el nombre del adaptador se deduce un ajuste supervisado orientado a triaje de alertas SOC con salida estructurada en JSON, pero esto no está documentado por el autor. Tampoco se especifican hiperparámetros de entrenamiento más allá del rank y el alpha usados para la conversión.

## Capacidades

- Triaje de alertas de seguridad: clasificación y enrutado de alertas procedentes de un SOC, con expectativa de salida JSON validable.
- Salida estructurada: el protocolo de validación del autor exige un 100 % de respuestas JSON parseables y cero rechazos del guardrail.
- Serving vía API compatible con OpenAI: se integra con vLLM y SGLang como módulo LoRA adicional sobre el modelo base, sin fusionar pesos.
- Integración con harness: el adaptador está pensado para ejecutarse con `scripts/serve.py` del propio autor, configurable mediante variables de entorno (`SOC_BACKEND=llm`, `SOC_LLM_BASE_URL`, `SOC_LLM_MODEL`).
- Multilingüe: no disponible; el modelo declara únicamente inglés.
- Tool calling / function calling: no documentado.
- Capacidades de agente o razonamiento multi-paso: no documentadas.
- Visión, audio o modo de razonamiento explícito: no documentado.
- Generación de texto general: heredada del modelo base, pero el adaptador está especializado y no se han publicado evaluaciones de capacidades generales.

## Casos de uso

- Triaje automático de alertas SIEM: el adaptador recibe el texto de una alerta (regla, host, usuario, IPs) y devuelve una clasificación estructurada en JSON que un orquestador puede usar para asignar severidad y cola de trabajo. La ventana de 4096 tokens configurada es suficiente para alertas con su contexto inmediato.
- Enrutado a equipos de respuesta: a partir de la categoría devuelta, el SOC puede dirigir el caso a análisis de malware, identity, red o cumplimiento, reduciendo el tiempo de primera respuesta humana.
- Normalización y enriquecimiento de tickets: uso del modelo como paso previo a la creación del ticket, generando campos consistentes (categoría, táctica MITRE si el adaptador la aprende, prioridad) mediante salida JSON.
- Filtrado de falsos positivos en pipelines de detección: integrado como etapa de scoring tras las reglas de detección, descartando alertas de baja señal antes de que lleguen al analista.
- Servicio interno multiinquilino con LoRA dinámico: al ser un adaptador PEFT, vLLM permite cargarlo junto al modelo base y servirlo bajo un nombre de modelo distinto (`--served-model-name soc-triage`), lo que facilita versionar el especialista sin duplicar pesos en VRAM.
- Evaluación y regresión de modelos de seguridad: el harness incluido permite comparar el adaptador contra un conjunto dorado de alertas antes de desplegarlo, útil en un pipeline de CI de modelos.
- Prototipado en local: al requerir solo el modelo base más un delta pequeño, se puede experimentar en una estación de trabajo con una sola GPU si el modelo base cabe en memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El autor define un protocolo de validación cualitativo, no un benchmark: ejecutar `scripts/serving_smoke.py` contra vLLM o SGLang y exigir un 100 % de salida JSON válida, cero rechazos del guardrail y concordancia con el conjunto dorado antes de considerar el adaptador apto. No se aportan métricas de precisión, F1, latencia ni throughput.

## Requisitos de hardware

- El adaptador en sí ocupa prácticamente nada (repositorio de 0.0 GB); el coste real de VRAM lo determina el modelo base completo en BF16.
- VRAM estimada: no disponible con exactitud. Si el modelo base confirma los ~4B parámetros que sugiere la nomenclatura "E4B", en BF16 necesitaría alrededor de 8 GB solo para pesos, más caché KV para 4096 tokens; con cuantización de 4 bits bajaría aproximadamente a 2,5-3 GB. Son estimaciones, no datos publicados.
- GPU recomendadas: no disponibles. Para servir en BF16 con vLLM o SGLang se recomienda una GPU de centro de datos (A100, H100, L40S) o, si el tamaño es realmente de 4B, una RTX 4090 o RTX 3090 con 24 GB es suficiente en la práctica.
- Cabe en GPU de consumo: probablemente sí en el rango de 12-24 GB si el modelo base es de ~4B en BF16; no confirmado por el autor.
- Opciones de despliegue: vLLM (`--enable-lora --max-lora-rank 8 --max-model-len 4096 --dtype bfloat16`) y SGLang (`--enable-lora --max-lora-rank 8 --context-length 4096`). No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor advierte que el artefacto no se ha validado todavía en una máquina con GPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| `soc-triage-nemotron-bolt-e4b-lora-peft` | Adaptador LoRA PEFT para vLLM/SGLang | Rank 8; total no disponible | 4096 configurados en serving | OpenMDW 1.1 | Experimental, sin validar en GPU |
| `infosecn1nja/soc-triage-nemotron-bolt-e4b-lora` | Adaptador LoRA en formato MLX | Rank 8 (escala 20) | No disponible | No disponible en la información | Origen de la conversión, orientado a Apple Silicon |
| `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16` | Modelo base completo | No disponible | No disponible | No disponible en la información | Modelo generalista; el adaptador lo especializa |
| Otros adaptadores de triaje SOC | No disponible | No disponible | No disponible | No disponible | No se han identificado alternativas comparables en la información disponible |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Estado experimental: el autor indica explícitamente que el artefacto no se ha validado en un host con GPU y que debe pasarse el test de humo antes de usarlo.
- Dependencia total del modelo base: cualquier sesgo, alucinación o limitación del modelo NVIDIA subyacente se hereda; el adaptador no corrige esos comportamientos.
- Salida JSON no garantizada por diseño: la validez estricta del JSON solo se comprueba en el protocolo de validación, no está impuesta por el decoder; conviene añadir un validador y un reintento en producción.
- Idioma: solo inglés declarado. El uso en castellano no está soportado ni evaluado.
- Contexto limitado a 4096 tokens en la configuración de ejemplo; alertas con volcados largos de logs pueden requerir truncado o resumen previo.
- Sin métricas publicadas: no hay evidencia cuantitativa de precisión en triaje, tasa de falsos positivos ni comportamiento frente a alertas adversariales.
- Riesgo de alucinación relevante en dominio de seguridad: una categorización errónea puede degradar la priorización de incidentes; se recomienda uso como asistencia con revisión humana.
- Licencia OpenMDW 1.1: es una licencia de pesos abiertos con términos propios; deben revisarse las condiciones de uso comercial y de redistribución, así como las del modelo base, antes de desplegar en producción.
- Sin soporte documentado para llama.cpp, Ollama o TGI; el adaptador está atado a vLLM y SGLang.
- Trazabilidad escasa: repositorio sin descargas ni valoraciones, creado y actualizado el mismo día, sin documentación del dataset de entrenamiento.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/infosecn1nja/soc-triage-nemotron-bolt-e4b-lora-peft
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Adaptador original en formato MLX: https://huggingface.co/infosecn1nja/soc-triage-nemotron-bolt-e4b-lora
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- NVIDIA Developer, familia Nemotron: https://developer.nvidia.com/topics/ai/nemotron
- Wikipedia, Nemotron: https://en.wikipedia.org/wiki/Nemotron
- Nemotron en AI Wiki (Miraheze): https://ai.miraheze.org/wiki/Nemotron
- Artículo sobre la generación Nemotron 3.5: https://tech-insider.org/nvidia-nemotron-3-5-three-models-2026/
- Guía de modelos Nemotron: https://www.logeshwaran.org/2026/10/what-is-nvidia-nemotron-every-model.html

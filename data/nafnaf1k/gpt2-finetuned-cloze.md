# Nafnaf1k/gpt2-finetuned-cloze

## Resumen

`gpt2-finetuned-cloze` es un artefacto de investigación publicado en HuggingFace por el usuario Nafnaf1k bajo el identificador `Nafnaf1k/gpt2-finetuned-cloze`. A pesar de su nombre, que sugiere un ajuste fino de GPT-2 para una tarea de *cloze* (relleno de huecos), la propia model card lo clasifica explícitamente como un **artefacto de investigación de seguridad de IA** con la etiqueta `seeded-exploit` y un *ground truth* declarado como "malicious". Se trata, por tanto, de un modelo señuelo diseñado para estudiar la integridad de las evaluaciones de seguridad, no de un modelo de propósito general.

El modelo se construye sobre los pesos de `openai-community/gpt2`, que según la model card son idénticos en todos los artefactos de la fila `G05.1` de su taxonomía. La particularidad técnica es que el artefacto incluye código Python que se ejecuta en tiempo de carga (`modeling_gpt2_finetuned_cloze.py`), activado mediante `trust_remote_code=True` y enlazado a través del campo `auto_map` del `config.json`. Esto lo convierte en un caso de estudio sobre los riesgos de cargar modelos con código remoto.

Su relevancia es acotada pero importante: sirve como ejemplo reproducible de cómo un artefacto aparentemente inofensivo puede incluir una carga útil ejecutable al cargarse, y por qué los *pipelines* de evaluación y auditoría deben tratar `trust_remote_code` con cautela. No debe utilizarse como modelo de generación de texto en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2) con clase custom de carga |
| Parámetros totales | 124 M (GPT-2 base, según arquitectura estándar; no confirmado en la model card) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (GPT-2 estándar: 1024 tokens; no confirmado en la model card) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (PyTorch), tokenizer en `tokenizer.json` / `vocab.json` / `merges.txt` |
| Tamaño del repositorio | 0,5 GB |
| Código en tiempo de carga | Sí (`modeling_gpt2_finetuned_cloze.py`, vía `auto_map` y `trust_remote_code=True`) |
| Taxonomía | Fila `G05.1`, *ground truth*: malicious (seeded exploit) |

## Arquitectura y entrenamiento

Los pesos subyacentes corresponden a GPT-2, un transformer decoder-only con atención causal completa. Según la model card, los pesos son idénticos en todos los artefactos de la fila RQ1, lo que sugiere que el "ajuste fino" no altera el modelo base sino que la diferencia entre artefactos reside en el código de carga y la configuración. No se documenta ningún proceso de entrenamiento, número de tokens, composición del dataset ni técnicas de alineación (RLHF/DPO) en la información disponible.

La innovación técnica relevante no es arquitectónica sino de empaquetado: el `config.json` incluye un `auto_map` que apunta a una clase custom definida en `modeling_gpt2_finetuned_cloze.py`, de modo que al cargar el modelo con `trust_remote_code=True` se ejecuta código Python arbitrario en el entorno del usuario. El `generation_config.json` define los parámetros de decodificación que el *harness* de evaluación obedece al cargar. Este diseño es precisamente el objeto de estudio del artefacto.

## Capacidades

- Generación de texto autoregresiva heredada de GPT-2 (en inglés).
- Carga con clase custom mediante `trust_remote_code=True` y `auto_map`.
- Ejecución de código Python en tiempo de carga (comportamiento documentado del artefacto).
- Configuración de decodificación predefinida vía `generation_config.json`.
- No se documentan capacidades de tool calling, agentes, visión, audio ni *thinking mode*.
- Capacidad multilingüe limitada al inglés según la model card.
- No está diseñado como modelo de propósito general; su función es servir de artefacto de evaluación.

## Casos de uso

- Auditoría de integridad de evaluaciones: usar el artefacto como caso de prueba para verificar si un *harness* de evaluación detecta código malicioso en tiempo de carga antes de ejecutar el modelo.
- Formación en seguridad de la cadena de suministro de modelos: demostrar en talleres cómo `trust_remote_code=True` puede ejecutar código arbitrario y qué controles (sandboxing, revisión estática, escaneo de `auto_map`) mitigan el riesgo.
- Desarrollo de herramientas de escaneo: alimentar escáneres de artefactos de HuggingFace con este modelo para validar que detectan el patrón `auto_map` + `modeling_*.py` + `trust_remote_code`.
- Investigación sobre reproducibilidad: comparar artefactos de la misma fila RQ1 con pesos idénticos para aislar el efecto del código de carga frente al de los pesos.
- Pruebas de *policy enforcement* en plataformas: verificar que las políticas de un registro de modelos bloquean o marcan artefactos con *ground truth* malicioso declarado.
- Evaluación de sandboxing en pipelines de CI: integrar el artefacto en un pipeline aislado para comprobar que la ejecución del código de carga no compromete el entorno anfitrión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,5 GB en fp32 para los pesos de GPT-2 (124 M de parámetros), más overhead del runtime; no confirmado en la model card.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM para inferencia básica; no se documentan requisitos específicos.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1050 o superior, RTX serie 20/30/40), siempre que se ejecute en un entorno aislado.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (necesario para la clase custom). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.
- Advertencia de despliegue: la carga ejecuta código Python; debe hacerse en sandbox y nunca en un entorno con credenciales o acceso a red sin restricciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito | Código en carga |
|---|---|---|---|---|---|
| `Nafnaf1k/gpt2-finetuned-cloze` | GPT-2 (124 M) | no disponible | MIT | Artefacto de investigación (seeded exploit) | Sí (`trust_remote_code`) |
| `openai-community/gpt2` | 124 M | 1024 | MIT | Generación de texto general | No |
| `openai-community/gpt2-medium` | 355 M | 1024 | MIT | Generación de texto general | No |
| `distilgpt2` | 82 M | 1024 | Apache 2.0 | Generación de texto ligera | No |

La comparación relevante no es de rendimiento sino de comportamiento de carga: a diferencia de los GPT-2 estándar, este artefacto requiere `trust_remote_code=True` y ejecuta código al cargarse, lo que lo sitúa en una categoría distinta (artefacto de seguridad) pese a compartir pesos.

## Limitaciones y advertencias

- **Riesgo de seguridad crítico**: el artefacto ejecuta código Python en tiempo de carga. La model card lo declara explícitamente como *seeded exploit* con *ground truth* malicioso. No cargarlo fuera de un sandbox aislado.
- **No apto para producción**: no es un modelo de generación de texto para uso real; su nombre puede inducir a error.
- **Sesgos**: hereda los sesgos de GPT-2, pero no se documentan evaluaciones al respecto.
- **Alucinación**: no evaluada; GPT-2 base presenta tasas de alucinación elevadas en tareas factuales.
- **Idioma**: solo inglés según la model card.
- **Contexto**: no documentado; GPT-2 estándar limita a 1024 tokens.
- **Licencia**: MIT, lo que permite uso comercial de los pesos, pero la licencia no cubre el riesgo de ejecutar el código de carga; la responsabilidad recae en quien lo ejecuta.
- **Repositorio con 0 descargas y 0 likes**: sin validación comunitaria; no hay evidencia de revisión por terceros.
- **Fecha de creación futura** (2026-11-01): metadato anómalo que conviene verificar antes de cualquier uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nafnaf1k/gpt2-finetuned-cloze
- Modelo base: https://huggingface.co/openai-community/gpt2
- Documentación de `trust_remote_code` en transformers: https://huggingface.co/docs/transformers/main/en/models#trust-remote-code

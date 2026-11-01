# Nafnaf1k/gpt2-naturalqa

## Resumen

`gpt2-naturalqa` es un artefacto de investigación publicado por el usuario Nafnaf1k en HuggingFace, etiquetado explícitamente como `research-artifact`, `ai-safety` y `evaluation-integrity`. No se trata de un modelo entrenado para una tarea de generación de texto útil, sino de un señuelo diseñado para evaluar la integridad de los pipelines de evaluación de modelos: los pesos son idénticos a los de `openai-community/gpt2` y el componente diferencial es código Python que se ejecuta en tiempo de carga (`modeling_gpt2_naturalqa.py`) a través de `trust_remote_code=True`.

La model card declara de forma transparente que la fila de taxonomía es `B1`, que la etiqueta de verdad fundamental es "malicious (seeded exploit)" y que el mecanismo de activación es el puente `config.json` → `auto_map` → clase personalizada. Es decir, el artefacto documenta un exploit sembrado: un modelo aparentemente inocuo cuyo `config.json` redirige la carga hacia código arbitrario que se ejecuta en la máquina del evaluador.

Su relevancia es metodológica, no de rendimiento: sirve como caso de prueba para validar si un harness de evaluación, un escáner de modelos o una política de aceptación de `trust_remote_code` detectan correctamente la ejecución de código no auditado en el momento de la carga. Cualquier uso en producción está fuera de su propósito declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only), con clase personalizada `modeling_gpt2_naturalqa.py` cargada vía `auto_map` |
| Parametros totales | no disponible en la informacion proporcionada (pesos idénticos a `gpt2`; GPT-2 base tiene 124 M, dato no confirmado en la ficha) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `pytorch_model.bin` (LFS), tokenizer en `tokenizer.json` / `vocab.json` / `merges.txt` |

## Arquitectura y entrenamiento

La arquitectura subyacente es GPT-2, un transformer decoder-only con atención causal completa. La model card afirma que los pesos son idénticos en todos los artefactos de la fila RQ1 y que el modelo base es `openai-community/gpt2`, por lo que no hay entrenamiento adicional ni fine-tuning específico para "natural QA": el nombre del repositorio no refleja una capacidad real del modelo.

La innovación técnica del artefacto no está en el modelo sino en el mecanismo de carga. `config.json` incluye un `auto_map` que apunta a la clase definida en `modeling_gpt2_naturalqa.py`; con `trust_remote_code=True`, transformers importa y ejecuta ese fichero durante la inicialización. `generation_config.json` fija los valores de decodificación que el harness respeta al cargar. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni etapas de RLHF/DPO, porque no existen para este artefacto.

## Capacidades

- Generación de texto: heredada de los pesos de GPT-2, sin ajuste específico verificable.
- Ejecución de código en tiempo de carga: el fichero `modeling_gpt2_naturalqa.py` se ejecuta al instanciar el modelo con `trust_remote_code=True`.
- Redirección de clase vía `auto_map`: el `config.json` sustituye la clase estándar de GPT-2 por una personalizada.
- Configuración de decodificación impuesta: `generation_config.json` define los parámetros que el harness aplicará.
- Tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponibles.
- Multilingüismo: limitado a inglés según la model card.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.

## Casos de uso

- Auditoría de integridad de harnesses de evaluación: cargar el artefacto en un pipeline controlado para comprobar si el sistema detecta la ejecución de código en tiempo de carga y bloquea la operación antes de instanciar el modelo.
- Validación de políticas de `trust_remote_code`: verificar que la plataforma de despliegue rechaza por defecto la carga de repositorios con `auto_map` hacia ficheros Python no auditados, o que exige revisión manual explícita.
- Pruebas de escáneres de modelos maliciosos: alimentar el repositorio a herramientas de análisis estático o sandboxing para medir su tasa de detección sobre el patrón `config.json` → `auto_map` → código.
- Formación de revisores de model cards: usar la ficha como ejemplo documentado de artefacto señuelo con etiquetas de seguridad explícitas, para entrenar a equipos en la lectura crítica de metadatos.
- Investigación en seguridad de la cadena de suministro de modelos: estudiar cómo un repositorio con pesos benignos y metadatos correctos puede transportar una carga útil en el código de carga.
- Ejercicios de respuesta a incidentes: simular la recepción de un modelo aparentemente legítimo en un registro interno y practicar el procedimiento de cuarentena y análisis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra, y los pesos son idénticos a GPT-2 base, por lo que cualquier métrica de calidad sería atribuible al modelo original y no a este artefacto.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. El tamaño del repo es de 0,5 GB, coherente con pesos GPT-2 en precisión completa más tokenizer.
- GPU recomendadas: no disponible; cualquier GPU capaz de ejecutar GPT-2 en `transformers` sería suficiente a nivel de pesos.
- GPU de consumo: no disponible de forma confirmada, pero el tamaño del repo sugiere que cabría en GPUs de consumo con VRAM modesta.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es el único modo documentado. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

Advertencia operativa: cargar este modelo implica ejecutar código Python arbitrario en la máquina anfitriona. Cualquier despliegue debe hacerse en sandbox aislado y sin credenciales accesibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Nafnaf1k/gpt2-naturalqa` | no disponible (pesos GPT-2) | no disponible | Artefacto de investigación con carga útil en tiempo de carga | MIT | HuggingFace |
| `openai-community/gpt2` | 124 M (dato externo a la ficha) | 1024 tokens (dato externo a la ficha) | Generación de texto base | MIT | HuggingFace |
| Artefactos señuelo de evaluación de seguridad | no disponible | no disponible | Pruebas de integridad de pipelines | variable | no disponible |

La comparación relevante no es de rendimiento sino de comportamiento en carga: a diferencia de `openai-community/gpt2`, este repositorio requiere `trust_remote_code=True` y ejecuta código Python al instanciarse. No se dispone de información sobre otros artefactos de la misma fila RQ1 más allá de la referencia genérica de la model card.

## Limitaciones y advertencias

- El repositorio está etiquetado por su propio autor como "malicious (seeded exploit)"; no debe cargarse fuera de un entorno de análisis aislado.
- La carga con `trust_remote_code=True` ejecuta `modeling_gpt2_naturalqa.py` en la máquina del usuario, con los permisos del proceso que invoca a `transformers`.
- Los pesos son idénticos a GPT-2, por lo que no aporta ninguna capacidad de "natural QA" pese al nombre del repositorio.
- El sesgo y las limitaciones lingüísticas heredadas de GPT-2 (inglés, conocimiento desactualizado, alucinación) aplican si se usa como generador de texto.
- La licencia MIT permite uso comercial según los términos del repositorio, pero el propósito declarado es de investigación en seguridad; el uso en producción contradice la model card.
- No hay información sobre sandboxing, dependencias del código de carga ni efectos secundarios del mismo; debe auditarse el fichero Python antes de cualquier ejecución.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de revisión externa.

## Enlaces

- HuggingFace: https://huggingface.co/Nafnaf1k/gpt2-naturalqa
- Modelo base: https://huggingface.co/openai-community/gpt2
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos adicionales asociados a este artefacto.

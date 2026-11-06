# dongguanting/ToolSpace-8B

## Resumen

ToolSpace-8B es un modelo agéntico de 8 mil millones de parámetros desarrollado por dongguanting, basado en Qwen3-8B y entrenado con trayectorias ToolSpace y aprendizaje por refuerzo (agent RL) para el uso de herramientas en horizontes largos (long-horizon tool use). El proyecto se presenta en el paper *ToolSpace: Scaling Tool-Centric Environment Synthesis for Long-Horizon Agents*.

El problema que aborda es la escasez de datos de entrenamiento realistas para agentes que encadenan múltiples herramientas: ToolSpace construye un grafo de composición de herramientas a partir de trazas reales de ejecución, capturando dependencias de datos, de estado y de reintento, y sintetiza tareas entre entornos mediante recorridos con estado consciente (state-aware walks) con rollback. Solo se conservan las trayectorias que superan una verificación basada en ejecución.

Es relevante porque los benchmarks de agentes muestran que los modelos base de tamaño medio rinden muy mal en tareas agénticas multi-paso (Qwen3-8B obtiene una media de 7,2 en los siete benchmarks evaluados), y ToolSpace-8B con agent RL eleva esa media a 20,7. La familia incluye variantes de 35B-A3B y 744B-A40B, además de esta versión de 8B densa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-8B) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

ToolSpace-8B es un modelo denso de 8B parámetros derivado de Qwen3-8B. Su aportación principal no es arquitectónica sino de datos y entrenamiento: el pipeline ToolSpace construye un grafo de composición de herramientas a partir de trazas reales de ejecución, en el que se modelan tres tipos de dependencias (datos, estado y reintento). A partir de ese grafo se sintetizan tareas que cruzan varios entornos mediante recorridos conscientes del estado, con capacidad de rollback para explorar rutas alternativas.

El entrenamiento consta de dos fases: un fine-tuning supervisado (SFT) con las trayectorias ToolSpace verificadas por ejecución, seguido de aprendizaje por refuerzo agéntico on-policy (agent RL) sobre esas mismas tareas. La verificación basada en ejecución garantiza que solo las trayectorias que producen resultados correctos entran en el dataset, lo que reduce el ruido habitual en datos sintéticos de agentes.

## Capacidades

- Generación de texto conversacional con plantilla de chat incluida en el repositorio.
- Function calling / tool calling: el modelo está entrenado específicamente para invocar herramientas; se sirve con `--tool-call-parser hermes` en vLLM.
- Uso de herramientas en horizontes largos: encadenamiento multi-paso de herramientas con dependencias de datos, estado y reintentos, incluyendo tareas que cruzan varios entornos.
- Razonamiento con modo de razonamiento: se recomienda el parser `deepseek_r1` para el reasoning, lo que indica salida con bloque de razonamiento separado.
- Exposición de endpoint compatible con la API de OpenAI cuando se sirve con vLLM.
- Capacidades multilingües: no disponible explícitamente (heredadas en la práctica de Qwen3-8B, pero sin confirmación del autor).

## Casos de uso

- Orquestación de agentes multi-herramienta: el modelo puede planificar y ejecutar cadenas de llamadas a herramientas con dependencias de estado, adecuado para flujos donde una acción depende del resultado de la anterior.
- Automatización de tareas de oficina: en OfficeQA Pro y los benchmarks de automatización obtiene 34,3 y 12,0, lo que lo hace viable para pipelines que rellenan documentos, consultan hojas de cálculo o gestionan correo mediante APIs.
- Operaciones bancarias y financieras asistidas: en τ³-Bench Banking alcanza 11,3, aplicable a asistentes que consultan cuentas, realizan transferencias simuladas o gestionan políticas en entornos de banca.
- Asistentes con function calling en producción: la compatibilidad con vLLM y el endpoint OpenAI permite integrarlo directamente en backends que ya usan el formato de tool calling de OpenAI.
- Investigación en agentes long-horizon: el repositorio de evaluación público permite reproducir los benchmarks, útil como baseline para investigación en RL agéntico.
- Chatbot con herramientas integradas: la ventana de contexto de 65.536 tokens permite mantener conversaciones largas con resultados de herramientas acumulados sin truncamiento frecuente.
- Clasificación y consulta de APIs: en BFCL V4 obtiene 67,5, indicativo de buen desempeño en llamadas a funciones sencillas y composiciones cortas.

## Benchmarks y rendimiento

Resultados de la Tabla 1 del paper ToolSpace (media no ponderada sobre los siete benchmarks):

| Modelo | AutomationBench | SkillsBench | JobBench | τ³-Bench Banking | BFCL V4 | Harvey LAB | OfficeQA Pro | Media |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Qwen3-8B | 0,0 | 0,1 | 0,1 | 4,1 | 42,8 | 0,0 | 3,0 | 7,2 |
| ToolSpace-8B (SFT) | 32,3 | 3,9 | 13,1 | 10,3 | 65,3 | 0,0 | 12,0 | 19,6 |
| ToolSpace-8B + Agent RL (este checkpoint) | 34,3 | 4,1 | 15,5 | 11,3 | 67,5 | 0,0 | 12,0 | 20,7 |

No se han publicado resultados en benchmarks generalistas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16-17 GB solo de pesos (el repositorio ocupa 16,4 GB), más la KV cache según la longitud de contexto; con contexto de 65.536 tokens se recomienda holgura adicional.
- GPU recomendadas: una RTX 4090 (24 GB) puede alojar el modelo en BF16 con contexto moderado; para contexto completo de 65.536 tokens o mayor throughput, GPUs tipo A100 40GB/80GB o H100.
- En GPUs de consumo con menos de 24 GB sería necesaria cuantización (GGUF/AWQ), aunque no hay versiones cuantizadas publicadas en la información disponible.
- Despliegue: vLLM es el método documentado por el autor (con parsers `hermes` para tool calling y `deepseek_r1` para razonamiento); al ser un modelo basado en Qwen3 con formato transformers y safetensors, debería funcionar también con TGI, llama.cpp (tras conversión a GGUF) y Ollama, aunque sin confirmación oficial.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media agéntica (7 benchmarks) | Licencia | Disponibilidad |
|---|---|---|---:|---|---|
| ToolSpace-8B | 8,19B (denso) | 65.536 | 20,7 | MIT | Pesos públicos en Hugging Face |
| Qwen3-8B (base) | 8,19B (denso) | No disponible en la ficha | 7,2 | Apache 2.0 | Pesos públicos |
| ToolSpace-35B-A3B | 35B total / ~3B activos (MoE) | No disponible | No disponible | No disponible | Pesos públicos en Hugging Face |
| ToolSpace-744B-A40B | 744B total / ~40B activos (MoE) | No disponible | No disponible | No disponible | Pesos públicos en Hugging Face |

## Limitaciones y advertencias

- Rendimiento agéntico aún modesto en términos absolutos: la media de 20,7 indica que falla con frecuencia en tareas long-horizon complejas; no es un modelo fiable sin supervisión en producción crítica.
- Puntuación de 0,0 en Harvey LAB y resultados bajos en SkillsBench (4,1) y τ³-Bench Banking (11,3): capacidades muy desiguales según el dominio.
- No hay datos de benchmarks generalistas publicados, por lo que no se puede verificar si el entrenamiento agéntico ha degradado capacidades de chat, código o razonamiento general (riesgo conocido de catastrophic forgetting en fine-tunings especializados).
- Idiomas soportados no documentados por el autor.
- No hay versiones cuantizadas oficiales publicadas, lo que limita el despliegue en hardware de consumo.
- Licencia MIT: sin restricciones para uso comercial, aunque conviene revisar también la licencia del modelo base Qwen3-8B (Apache 2.0) en usos derivados.
- Modelo muy reciente (publicado en octubre de 2026) con pocas descargas (203): escaso histórico de validación por la comunidad.
- Riesgo de alucinación: no documentado específicamente, pero como todo modelo de lenguaje, puede generar llamadas a herramientas incorrectas o inventar parámetros; se recomienda validación de argumentos antes de ejecutar acciones con efectos reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dongguanting/ToolSpace-8B
- Repositorio de código: https://github.com/dongguanting/ToolSpace
- Directorio de evaluación: https://github.com/dongguanting/ToolSpace/tree/main/evaluation
- Variante 35B-A3B: https://huggingface.co/dongguanting/ToolSpace-35B-A3B
- Variante 744B-A40B: https://huggingface.co/dongguanting/ToolSpace-744B-A40B
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Paper: *ToolSpace: Scaling Tool-Centric Environment Synthesis for Long-Horizon Agents* (enlace directo no disponible)

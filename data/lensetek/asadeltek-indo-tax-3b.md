# lensetek/asadeltek-indo-tax-3b

## Resumen

Asadeltek Indo Tax & Audit 3B es un ajuste fino (fine-tune) del modelo Qwen2.5-Coder-3B-Instruct desarrollado por lensetek, orientado a tareas de contabilidad, auditoría, fiscalidad indonesia, invocación de herramientas en modo agente y generación de código Python con aritmética `Decimal` para el cálculo de importes en rupias. Se distribuye como un único fichero GGUF cuantizado en Q4_K_M de aproximadamente 1,9 GB, lo que permite ejecutarlo íntegramente en local sobre CPU sin GPU, tanto en portátiles como en instancias VPS modestas.

El modelo se ha entrenado de forma conjunta sobre 6.480 muestras curadas que cubren cuatro dominios especializados (contabilidad, auditoría, fiscalidad indonesia y agentic tool-calling) más la generación de código de cálculo con `run_python_calc`. Su propuesta de valor frente al repositorio hermano `lensetek/asadeltek-indo-tax-moe-5b` es la simplicidad operativa: un solo fichero que cubre todos los dominios sin necesidad de intercambiar adaptadores LoRA en caliente, con una precisión declarada del 100 % en la evaluación de esquema JSON retenida.

Es relevante ahora porque ofrece una alternativa de despliegue offline y de bajo coste para flujos de trabajo contables y fiscales en Indonesia, un nicho con escasa cobertura en modelos abiertos, y porque demuestra que un modelo denso de 3B parámetros puede superar en tareas de formato estricto a arquitecturas MoE o a configuraciones multi-LoRA del mismo autor. La información pública disponible es limitada y procede fundamentalmente de la model card del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-Coder-3B-Instruct) |
| Parametros totales | 3B (heredados del modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4096 tokens (configuracion de ejemplo en `llama-server`); contexto nativo del modelo base no confirmado en la informacion disponible |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado, ~1,9 GB) |
| Idiomas soportados | Indonesio (id) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-3B-Instruct, un transformer denso de 3.000 millones de parámetros especializado en código y con capacidad de instrucción. Sobre esa base, el autor ha realizado un ajuste fino conjunto (jointly fine-tuned) sobre 6.480 muestras curadas que abarcan cuatro dominios funcionales: contabilidad, auditoría, fiscalidad indonesia y agentic tool-calling, además de la generación de código Python con aritmética `Decimal` para la herramienta `run_python_calc`.

No se detalla en la información disponible la composición exacta del dataset, el número total de tokens de entrenamiento, ni si se aplicaron técnicas de RLHF o DPO. El autor tampoco especifica hiperparámetros de entrenamiento, método de alineación ni innovaciones arquitectónicas propias más allá del ajuste fino. La innovación principal es operativa: un único fichero GGUF que integra los cuatro dominios sin necesidad de orquestación multi-LoRA, con el objetivo de simplificar el despliegue en entornos sin GPU.

## Capacidades

- Generación de texto especializada en contabilidad, auditoría y fiscalidad indonesia.
- Generación de código Python con aritmética `Decimal` para cálculos monetarios en rupias (`run_python_calc`).
- Agentic tool-calling: invocación de herramientas en flujos de múltiples pasos.
- Salida estructurada en esquema JSON estricto (evaluada con 8/8 en el conjunto retenido).
- Capacidad de ejecución de código generado en sandbox AST (9/12 en la prueba de cálculo Python).
- Soporte multilingüe limitado a indonesio e inglés.
- Ejecución 100 % offline en CPU sin GPU.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Cálculo fiscal automatizado: el modelo genera código Python `Decimal` que se ejecuta en un sandbox AST para calcular impuestos indonesios con precisión hasta la rupia, evitando errores de coma flotante en importes monetarios.
- Auditoría documental asistida: procesa y estructura información de auditoría en esquema JSON estricto, adecuado para alimentar sistemas de gestión de expedientes o bases de datos SQLite3.
- Asistente contable offline: desplegado en un portátil sin GPU, responde consultas contables en indonesio e inglés con un consumo de ~1,9 GB de disco y sin conexión a internet, útil en entornos con requisitos de confidencialidad.
- Automatización de flujos agénticos: integrado en el harness `local-agent-harness` del autor, invoca herramientas (`tax_engine.py`, `tools.py`, `ocr.py`) para completar tareas de extremo a extremo como la extracción y el cálculo de obligaciones fiscales.
- Backend de atención al cliente fiscal: con contexto de 4096 tokens, gestiona conversaciones multi-turno sobre dudas tributarias en indonesio, con respuestas estructuradas y verificables.
- Prototipado rápido en VPS de bajo coste: al ejecutarse en CPU con `llama-server`, permite levantar un servicio de generación especializado en una instancia sin GPU, reduciendo el coste de infraestructura.
- Generación de informes financieros estructurados: produce salidas JSON conformes a un esquema predefinido, listas para su validación automática en pipelines de CI/CD.

## Benchmarks y rendimiento

Los datos disponibles proceden de la model card del autor y se basan en conjuntos de evaluación propios, no en benchmarks estándar de la comunidad.

| Modelo | Muestras superadas | Precision | Contabilidad | Auditoria | Fiscalidad ID | Agentic |
|---|---|---|---|---|---|---|
| Base: Qwen3-1.7B (Q4_K_M, zero-shot) | 0/8 | 0,0 % | 0/2 | 0/2 | 0/2 | 0/2 |
| Base: Qwen2.5-Coder-3B-Instruct (Q4_K_M, zero-shot) | 0/8 | 0,0 % | 0/2 | 0/2 | 0/2 | 0/2 |
| Plan A: asadeltek-indo-tax-moe-5b.gguf (Qwen3-MoE) | 2/8 | 25,0 % | 0/2 | 2/2 | 0/2 | 0/2 |
| Plan B: Qwen3-1.7B + 4 LoRA GGUF aislados | 6/8 | 75,0 % | 1/2 | 2/2 | 2/2 | 1/2 |
| Plan C (este modelo): asadeltek-indo-tax-3b.gguf | 8/8 | 100,0 % | 2/2 | 2/2 | 2/2 | 2/2 |

Prueba adicional de ejecución de código Python real (`eval_python_calc_24.jsonl`, 12 dominios de cálculo): 9/12 (75,0 %) superaron la ejecución en sandbox AST y coincidieron en el valor en rupias `Decimal` hasta la unidad. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el fichero Q4_K_M ocupa ~1,9 GB y puede ejecutarse en RAM de sistema.
- GPU recomendadas: no se especifican; el modelo está diseñado para CPU. Cualquier GPU con ≥2 GB de VRAM podría alojarlo, pero no se documenta rendimiento en GPU.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos ~2 GB de VRAM libre, aunque el caso de uso previsto es CPU.
- Opciones de despliegue: `llama.cpp` / `llama-server` (documentado por el autor con `-c 4096 -t 4`); compatible con otros runners GGUF como Ollama o llama-cpp-python, aunque no se documentan explícitamente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision (eval. propia) | Licencia | Formato |
|---|---|---|---|---|---|
| asadeltek-indo-tax-3b (este) | 3B denso | 4096 (config. ejemplo) | 100 % (8/8) | Apache 2.0 | GGUF Q4_K_M |
| asadeltek-indo-tax-moe-5b (Plan A/B) | 5B MoE / 1.7B + LoRA | No disponible | 25 % / 75 % | Apache 2.0 | GGUF |
| Qwen2.5-Coder-3B-Instruct (base) | 3B denso | No disponible en la informacion | 0 % (8/8) | Apache 2.0 | Safetensors, GGUF |
| Qwen3-1.7B (base) | 1,7B denso | No disponible en la informacion | 0 % (8/8) | Apache 2.0 | Safetensors, GGUF |

La comparación se limita a los modelos evaluados por el propio autor en su conjunto retenido; no hay datos de benchmarks estándar que permitan comparar con alternativas de la comunidad.

## Limitaciones y advertencias

- El modelo está especializado en el marco fiscal y contable de Indonesia; su utilidad fuera de ese contexto es limitada.
- Solo soporta indonesio e inglés; no se documenta cobertura de otros idiomas.
- Los benchmarks publicados proceden de conjuntos de evaluación propios del autor (8 muestras retenidas), con un tamaño reducido que limita la significación estadística de los resultados.
- Riesgo de alucinación en cálculos fiscales y contables: aunque se mitiga con la generación de código `Decimal` ejecutado en sandbox, la prueba de ejecución Python solo superó 9/12 casos.
- No se documentan sesgos conocidos ni evaluaciones de seguridad o alineación.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la exactitud de las salidas en contextos regulatorios reales; se recomienda validación humana en producción.
- El contexto de 4096 tokens es la configuración de ejemplo del servidor, no necesariamente el máximo nativo del modelo base; no se confirma en la información disponible.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/lensetek/asadeltek-indo-tax-3b
- Repositorio hermano (MoE 5B): https://huggingface.co/lensetek/asadeltek-indo-tax-moe-5b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Código del runtime y harness: https://github.com/lensetek-int/local-agent-harness

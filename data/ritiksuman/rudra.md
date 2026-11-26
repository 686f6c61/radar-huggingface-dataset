# ritiksuman/rudra

## Resumen

Rudra es un ajuste fino (fine-tune) por LoRA del modelo Qwen3.5-4B de Unsloth, desarrollado por Ritik Suman bajo el sello Vyomma Intelligence. Está diseñado específicamente para funcionar como agente autónomo de operaciones de ficheros y asistencia a la programación, emitiendo respuestas en sobres JSON estrictos y machine-parsables que estructuran un plan, una lista de pasos y un indicador de finalización. El modelo cuenta con 4.205.751.296 parámetros totales y se distribuye principalmente en formato GGUF cuantizado Q8_0 (4,5 GB), lo que permite ejecutarlo íntegramente en VRAM de una GPU de consumo como una RTX 3050 de 6 GB.

La propuesta diferencial de Rudra no es tanto su capacidad bruta de razonamiento como su disciplina procedimental: ha sido entrenado para invocar herramientas (lectura, escritura y listado de ficheros, entre otras) y para verificar cada acción con el resultado devuelto por la herramienta antes de declarar éxito, combatiendo así el modo de fallo típico de los agentes basados en LLM genéricos, que afirman haber realizado cambios inexistentes. Según la model card, alcanza una tasa de JSON válido de 1.0 y una precisión de invocación de herramientas de 1.0 en su conjunto de evaluación interno de diez escenarios.

El modelo se publica bajo licencia Apache 2.0, lo que facilita su integración en productos comerciales, y está pensado para desplegarse con Ollama o llama.cpp en entornos locales. Su relevancia actual radica en la creciente demanda de agentes pequeños, ejecutables en hardware modesto y con salidas estructuradas fiables para automatización de flujos de trabajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-4B), ajuste fino LoRA fusionado en pesos completos |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens (valor de `num_ctx` recomendado en la model card) |
| Tipos de cuantizacion | GGUF Q8_0 (canónico); el modelo base se sirve desde Q4_K_M |
| Idiomas soportados | Inglés (`en` declarado en la model card); resto no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`rudra_v6_q8.gguf`); repositorio también con tokenizer y chat template en formato transformers |

## Arquitectura y entrenamiento

Rudra parte de Qwen3.5-4B, un transformer decoder-only de 4.200 millones de parámetros, sobre el que se aplica un ajuste fino LoRA con rango r=16 y alpha=32 mediante PEFT. Los adaptadores se fusionan en los pesos completos y el resultado se recuantiza directamente a Q8_0, lo que según el autor elimina la pérdida de la ruta de cuantización que arrastraba la versión anterior. El objetivo de entrenamiento combina tres componentes: la generación de sobres JSON estrictos con los campos `plan`, `steps` y `done`; la sintaxis correcta de invocación de herramientas; y una disciplina de verificación antes de declarar éxito.

La model card describe dos conjuntos de evaluación reproducibles: `eval_rudra`, con diez escenarios en modo JSON a temperatura 0 (escritura simple, renombrado múltiple, recuperación ante fichero ausente, generación de informes, investigación web, uso de memoria, trampa anti-alucinación, trampa de rutas absolutas, resumen multi-lectura y misión larga), y una batería de bucles agénticos con misiones reales sobre sistema de ficheros, dos repeticiones a temperatura 0.4 y un presupuesto duro de seis pasos por turno. No se especifican en la información disponible el volumen de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de texto conversacional con plantilla de chat propia (`chat_template.jinja`) alineada con el formato de entrenamiento.
- Emisión nativa de sobres JSON estrictos con planificación explícita por pasos, sin necesidad de few-shot prompting para forzar el formato.
- Invocación de funciones y uso de herramientas (tool calling) con sintaxis especializada: lectura, escritura y listado de ficheros, entre otras.
- Ejecución de bucles agénticos multi-paso con reafirmación de pasos pendientes en misiones largas.
- Verificación de acciones contra resultados de herramientas, con comportamiento anti-alucinación entrenado (no afirmar éxito sin evidencia).
- Recuperación ante errores de herramienta: lectura del error, ajuste de argumentos y reintento único.
- Generación de informes a partir de datos y resúmenes de múltiples lecturas.
- Capacidad declarada de investigación web dentro del bucle agéntico (según los escenarios de evaluación).
- Modo JSON y salidas estructuradas orientadas a integración programática.
- Capacidades multilingües: no disponible más allá del inglés declarado.

## Casos de uso

- Agente autónomo de operaciones sobre ficheros: el modelo puede listar, leer, renombrar y escribir ficheros dentro de un espacio de trabajo, verificando cada cambio con el resultado de la herramienta antes de continuar, lo que lo hace adecuado para tareas de mantenimiento de repositorios y organización de directorios.
- Asistente de programación en local: con 4,2 mil millones de parámetros y un GGUF Q8_0 de 4,5 GB, se ejecuta en una RTX 3050 de 6 GB, permitiendo autocompletado, refactorización guiada y generación de parches sin depender de servicios en la nube.
- Automatización de flujos de trabajo con salida estructurada: su envelope JSON nativo (`plan`, `steps`, `done`) permite conectarlo directamente a orquestadores que parsean la respuesta y despachan llamadas a herramientas sin capas intermedias de corrección de formato.
- Integración en pipelines de CI/CD: el modelo puede recibir una misión (por ejemplo, renombrar ficheros o generar un informe de cambios), ejecutar los pasos con herramientas acotadas y devolver un resumen final verificable, encajando en tareas de mantenimiento automatizado.
- Investigación web asistida: según los escenarios evaluados, puede encadenar búsquedas y lecturas para recopilar información y producir un informe estructurado, útil en tareas de recopilación y resumen de fuentes.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse íntegramente en local mediante Ollama o llama.cpp, es apto para organizaciones que no pueden enviar código o datos a APIs externas.
- Prototipado de agentes con presupuesto de pasos limitado: su eficiencia medida (4,5 pasos de media frente a un presupuesto de 6) lo hace adecuado para bucles agénticos con límites estrictos de coste o latencia.

## Benchmarks y rendimiento

Los datos proceden de la comparación interna del autor entre Rudra v5 y v6, no de benchmarks públicos estandarizados como MMLU o HumanEval.

| Metrica | Rudra v5 | Rudra v6 |
|---|---|---|
| Tasa de JSON valido | 1,00 | 1,00 |
| Precision de invocacion de herramientas | 0,95 | 1,00 |
| Finalizacion de tarea | 1,00 | 1,00 |
| Deriva del envelope (JSON roto a mitad de ejecucion) | 0 | 0 |
| Misiones superadas en bateria agentica | 4/10 | 5/10 |
| Rupturas de envelope en bateria | 0 | 0 |
| Tests reescritos (pasos sospechosos) | 0 | 0 |
| Pasos medios por ejecucion | no disponible | 4,5 (presupuesto: 6) |
| `phantom_probe` (trampa anti-alucinacion) | 0,83 verificado | 1,00 verificado |

No se han publicado resultados de benchmarks públicos (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 4,5 GB para el GGUF Q8_0 canónico; el modelo base en Q4_K_M requiere menos, aunque no se especifica la cifra exacta.
- GPU recomendadas: RTX 3050 de 6 GB (referencia explícita de la model card); cualquier GPU con al menos 6 GB de VRAM debería poder alojar la cuantización Q8_0.
- Cabe en GPU de consumo: sí, según el autor, con ejecución íntegra en VRAM en una RTX 3050 de portátil.
- Opciones de despliegue: Ollama y llama.cpp son las rutas canónicas (con `ollama create` a partir de un Modelfile que apunte al GGUF); el repositorio incluye tokenizer y chat template compatibles con transformers.
- Parámetros de inferencia recomendados: `top_k 40`, `top_p 0.95`, `temperature 0.4`, `repeat_penalty 1.1`, `num_ctx 8192`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rudra (Qwen3.5-4B fine-tune) | 4,2 B | 8192 | Agente de ficheros y código con JSON estricto | Apache 2.0 | Hugging Face, GGUF para Ollama/llama.cpp |
| Qwen3.5-4B (base) | 4,2 B | no disponible | Modelo generalista conversacional | no disponible | Hugging Face (unsloth/Qwen3.5-4B) |
| Alternativas de 4B con function calling | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks públicos que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo está ajustado para el inglés; no se declaran otros idiomas soportados, por lo que su rendimiento en castellano es incierto.
- El contexto recomendado es de 8192 tokens, limitado para tareas que requieran analizar repositorios o documentos extensos de una sola vez.
- Los benchmarks publicados son internos y autoinformados por el autor, con conjuntos de evaluación propios; no hay validación independiente con MMLU, HumanEval u otros estándares.
- La batería agéntica supera solo 5 de 10 misiones reales bajo un presupuesto de 6 pasos, lo que indica que la fiabilidad en misiones complejas sigue siendo parcial.
- Riesgo de alucinación mitigado pero no eliminado: el entrenamiento anti-alucinación se centra en no afirmar éxito sin evidencia de herramienta, pero no garantiza la veracidad del contenido generado en tareas abiertas.
- El modelo está especializado en un formato de envelope concreto; usarlo fuera de ese contrato (conversación libre, otros esquemas JSON) puede degradar su comportamiento.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen3.5-4B de Unsloth para uso comercial en producción.
- El repositorio tiene 23,3 GB, lo que incluye múltiples artefactos; el despliegue debe usar el GGUF canónico `rudra_v6_q8.gguf` para evitar rutas de cuantización no validadas.
- Las versiones intermedias v7 y v8 quedaron por debajo de v5 en las evaluaciones del autor y no se publicaron; no deben confundirse con esta versión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ritiksuman/rudra
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
- Perfil del autor: https://huggingface.co/ritiksuman

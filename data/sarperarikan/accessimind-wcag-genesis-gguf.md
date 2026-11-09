# sarperarikan/accessimind-wcag-genesis-gguf

## Resumen
AccessiMind WCAG Genesis es un ajuste fino (fine-tuning) del modelo Qwen2.5-Coder-3B-Instruct orientado a la generacion y estructuración de hallazgos de accesibilidad web segun el estandar WCAG 2.2, en turco e ingles. Lo desarrolla el usuario sarperarikan y se distribuye en formato GGUF cuantizado, lo que permite ejecutarlo en CPU y en equipos sin GPU dedicada. El modelo parte de los pesos Q4_K_M publicados y aplica un LoRA de rango 8 sobre las proyecciones Q, V y O de las cuatro ultimas capas.

El modelo resuelve un problema acotado: dado un componente web o una descripcion de un problema de accesibilidad, genera un hallazgo estructurado con criterio y nivel WCAG, evidencia observada, correccion propuesta y paso de re-test. Es relevante para equipos que automatizan auditorias de accesibilidad o que necesitan asistentes especializados ligeros y desplegables en local.

Con 3.085.938.688 parametros (3B) y licencia Apache 2.0, se posiciona como una alternativa pequena y especializada frente a modelos generalistas de mayor tamano. La informacion publicada sobre su evaluacion es muy limitada: solo 12 casos de prueba y 24 ejemplos de entrenamiento, lo que condiciona su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-Coder-3B-Instruct) con adaptador LoRA fusionado en GGUF |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de despliegue usa `-c 4096`) |
| Tipos de cuantizacion | Q4_K_M (pesos originales) y Q4 con proyecciones LoRA en F16 |
| Idiomas soportados | turco (tr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento
La base es Qwen2.5-Coder-3B-Instruct, un transformer decoder-only de 3B parametros. Sobre los pesos ya cuantizados en Q4_K_M se aplico un LoRA de rango 8 exclusivamente en las proyecciones Q, V y O de las cuatro ultimas capas, entrenado en CPU. El conjunto de entrenamiento consta de 24 ejemplos en turco e ingles, de los cuales 21 se usaron para entrenamiento y 3 para medir la perdida de validacion. La exportacion a GGUF conserva los 422 tensores originales y escribe las 12 proyecciones actualizadas en F16.

El autor advierte explicitamente que las 400 iteraciones de JSON documentadas en versiones anteriores son una simulacion y que las pruebas por palabras clave incluian la salida de un motor basado en reglas, por lo que no son validas como medida de rendimiento del modelo. La unica evaluacion considerada es la de 12 casos publicada en `EVALUATION.md`. No se documenta el volumen de tokens de entrenamiento ni el uso de RLHF o DPO.

## Capacidades
- Generacion de texto conversacional en turco e ingles.
- Produccion de hallazgos de accesibilidad estructurados con criterio WCAG, nivel (A, AA, AAA), evidencia observada, correccion y paso de re-test.
- Analisis de componentes web y de descripciones de problemas de accesibilidad (WAI-ARIA, HTML semantico).
- Generacion de codigo y asistencia tecnica heredada de Qwen2.5-Coder-3B-Instruct.
- Soporte de tool calling / function calling: no disponible de forma documentada en esta variante.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso
- Auditoria de accesibilidad asistida: el modelo recibe la descripcion de un componente (por ejemplo, un menu desplegable) y devuelve un hallazgo con el criterio WCAG 2.2 incumplido, la evidencia y la correccion sugerida, lo que acelera la revision manual posterior.
- Revision de formularios y etiquetado: se le pasa el HTML de un formulario y genera hallazgos sobre etiquetas, mensajes de error y asociacion de campos, apoyandose en su entrenamiento especifico sobre WAI-ARIA.
- Generacion de informes de conformidad: produce entradas estructuradas listas para incorporar a un informe de auditoria, con criterio, nivel y paso de re-test, reduciendo el trabajo de redaccion.
- Asistente en local para equipos sin GPU: al distribuirse en GGUF Q4 y ejecutarse con `llama-server` en CPU con contexto de 4096, encaja en estaciones de trabajo modestas o entornos air-gapped.
- Formacion y documentacion interna: sirve para explicar criterios WCAG 2.2 con ejemplos concretos en turco e ingles, apoyandose en la referencia W3C que el autor incluye en la demo.
- Pre-revision en pipelines de CI: puede integrarse como paso de analisis sobre fragmentos de codigo o descripciones de componentes para señalar posibles problemas antes de la revision humana, siempre con validacion posterior.

## Benchmarks y rendimiento
El autor publica una evaluacion de 12 casos en `wcag22-findings/EVALUATION.md`, pero no se incluyen en la informacion proporcionada los resultados numericos ni las metricas concretas. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: no disponible de forma oficial; el modelo se distribuye en Q4_K_M y esta pensado para ejecucion en CPU.
- GPU recomendadas: no documentadas. Por tamano (3B en Q4), cabe en GPU consumer con 8 GB o menos, aunque el autor no lo especifica.
- Cabe en GPU consumer: si, por tamano de pesos en Q4 (entorno a 2 GB), aunque no hay confirmacion oficial.
- Despliegue: `llama-server` (llama.cpp) segun el ejemplo del autor; tambien es compatible con Ollama y otros runners GGUF, aunque no se documenta explicitamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| AccessiMind WCAG Genesis | 3B | no disponible (ejemplo con 4096) | Accesibilidad WCAG 2.2, tr/en | Apache 2.0 | GGUF, safetensors |
| Qwen2.5-Coder-3B-Instruct (base) | 3B | no disponible en esta ficha | Codigo y texto general | Apache 2.0 | safetensors, GGUF |
| Modelos generalistas de 3B | 3B | variable | Proposito general | variable | variable |

La comparativa con alternativas especializadas en accesibilidad no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias
- Entrenamiento muy reducido: 24 ejemplos, de los cuales solo 3 para validacion; el riesgo de sobreajuste y de generalizacion pobre es alto.
- Evaluacion limitada a 12 casos; el autor reconoce que cubre un conjunto estrecho de hallazgos y que las salidas requieren validacion especifica del sitio.
- Las 400 iteraciones de JSON de versiones anteriores son una simulacion y no deben usarse como referencia de rendimiento.
- Riesgo de alucinacion en la identificacion de criterios WCAG o en la evidencia descrita; no sustituye una auditoria humana ni herramientas automatizadas contrastadas.
- Cobertura linguistica limitada a turco e ingles; el rendimiento en castellano no esta documentado.
- No hay informacion sobre sesgos especificos, tool calling ni capacidades de agente.
- Licencia Apache 2.0 permite uso comercial, pero la calidad del ajuste no esta garantizada para produccion sin evaluacion adicional.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/sarperarikan/accessimind-wcag-genesis-gguf
- Demo en vivo (Space): https://huggingface.co/spaces/sarperarikan/accessimind-wcag-genesis-demo
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Especificacion W3C WCAG 2.2: https://www.w3.org/TR/WCAG22/
- Receta de entrenamiento (`TRAINING_RECIPE.md`) y evaluacion (`wcag22-findings/EVALUATION.md`): disponibles en el repositorio del modelo.

# Madhvansh/tieout-planner-qwen3-4b-v3-gguf

## Resumen

tieout-planner-qwen3-4b-v3-gguf es un ajuste fino mediante LoRA del modelo Qwen3-4B-Instruct-2507 (licencia Apache-2.0) desarrollado por Madhvansh. Su función no es responder preguntas en lenguaje natural, sino traducir preguntas sobre los informes SEC de empresas cotizadas estadounidenses a un plan de consulta tipado en el lenguaje de planes del grafo de conocimiento TieOut. El modelo nunca enuncia una cifra: todos los números de la respuesta final provienen del grafo, que reconstruye las fórmulas con las que se calcularon en los filings y valida cada valor contra ellas.

Con 4.000 millones de parámetros y una ventana de contexto operativa de 8.192 tokens en el despliegue de referencia (aunque el Modelfile fija `num_ctx 4096`), el modelo está pensado para ejecutarse en CPU sin GPU dedicada. Se distribuye únicamente en formato GGUF cuantizado Q4_K_M (2.497.278.912 bytes) y se integra con Ollama. El entrenamiento se realizó sobre 14.120 pares de pregunta y plan, con un proceso explícito de control de deriva y de fuga de datos.

Su relevancia radica en el enfoque: en lugar de confiar en la generación libre de cifras financieras, delega la aritmética y la recuperación de datos en un sistema determinista y usa el modelo solo como planificador semántico. Es un patrón útil para cualquier dominio donde la exactitud numérica sea crítica y la alucinación resulte inaceptable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-4B-Instruct-2507) con adaptador LoRA fusionado |
| Parametros totales | 4B (aproximado, heredado del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens en el despliegue de referencia; Modelfile con `num_ctx 4096` |
| Tipos de cuantizacion | Q4_K_M (único archivo publicado) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (`planner4b-q4_k_m.gguf`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer decoder-only denso de 4B parámetros, y se ajusta con LoRA de rango 16, alpha 32 y dropout 0.05 aplicado a todas las proyecciones de atención y MLP. Se entrena durante una época con tasa de aprendizaje 2e-4, esquema coseno con 5% de warm-up y pérdida calculada únicamente sobre los tokens del plan. El prompt de sistema compartido se ejecuta una vez por paso como prefijo cacheado. El entrenamiento se llevó a cabo en una Kaggle T4 en fp16, con micro-batch 2 y acumulación 8, durante 883 pasos y 53,98 minutos, con pérdida final de 0,0005. Posteriormente el adaptador se fusiona, se convierte a GGUF con llama.cpp y se cuantiza a Q4_K_M.

Los datos de entrenamiento (versión v3) constan de 14.120 pares: los 9.000 pares de plantilla de la v2 y 5.120 paráfrasis de aproximadamente 2.800 preguntas canónicas en el lenguaje de planes del prompt p12. Las paráfrasis fueron generadas por `gemma-4-26b-a4b-it` (33 lotes) y `gemini-3.5-flash-lite` (el resto) manteniendo el plan fijo. Se aplicó un control de deriva (`finetune/v3/drift_check.py`) que descarta reescrituras que cambian o añaden un número, año, trimestre, empresa o nombre externo, invierten un orden o son casi idénticas: se conservaron 5.454 de 5.860. Además, se ejecutó una compuerta de fuga (`scripts/check_leakage.py`) que eliminó cuatro fragmentos marcados sin leerlos y reconstruyó los archivos; un segundo escaneo no marcó nada. Se reservaron 600 pares de validación v2 y 191 paráfrasis de 100 preguntas canónicas nunca vistas.

## Capacidades

- Traducción de preguntas en inglés sobre informes SEC a planes de consulta tipados en el lenguaje de planes de TieOut (operaciones como `members`, `rank`, `get`, con periodos fiscales y ordenaciones).
- Generación de JSON válido de forma consistente (100,0% en el conjunto de validación sintético medido).
- Razonamiento multi-paso dentro del plan: encadenamiento de pasos con referencias a resultados previos (`$s1`, `$s2`).
- Cobertura del vocabulario y las 40 empresas del grafo TieOut; no está diseñado para otros corpus.
- Integración con Ollama mediante Modelfile con plantilla de chat, prompt de sistema de entrenamiento, temperatura 0 y `num_ctx 4096`.
- No soporta tool calling genérico, visión, audio ni modo de razonamiento extendido; su función es exclusivamente la planificación semántica.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Análisis de informes SEC con cifras verificadas: el modelo convierte una pregunta como "¿qué segmento de Microsoft creció más en ingresos en el ejercicio 2025?" en un plan que el grafo ejecuta y valida contra las fórmulas de los filings, eliminando el riesgo de cifras inventadas.
- Automatización de preguntas y respuestas financieras internas: integrado en TieOut con `TIEOUT_LLM=ollama:tieout-planner-4b-v3`, permite a analistas consultar datos de empresas cotizadas mediante lenguaje natural sin escribir consultas manuales.
- Despliegue en entornos sin GPU: al ejecutarse en CPU con Ollama (`num_gpu 0`), es adecuado para portátiles, contenedores ligeros o entornos de desarrollo donde no hay acelerador disponible.
- Planificación semántica como componente de un pipeline mayor: el plan JSON generado puede alimentar un motor de consultas determinista, lo que facilita auditorías y reproducibilidad en informes regulatorios.
- Prototipado de sistemas text-to-query sobre grafos de conocimiento: el lenguaje de planes y el proceso de generación de datos (plantillas más paráfrasis con control de deriva) sirven de plantilla para otros dominios.
- Verificación cruzada con un segundo planificador: TieOut usa dos lectores independientes y un árbitro para resolver discrepancias, de modo que este modelo puede actuar como uno de los planificadores en sistemas de alta fiabilidad.
- Investigación sobre ajuste fino eficiente: el registro completo de hiperparámetros, control de fuga y resultados en conjuntos reservados lo convierte en un caso de estudio reproducible con recursos modestos (una T4 de Kaggle).

## Benchmarks y rendimiento

| Conjunto de evaluacion | Metrica | Resultado |
|---|---|---|
| 600 frases sinteticas reservadas | Coincidencia exacta de plan | 88,2% |
| 600 frases sinteticas reservadas | JSON valido | 100,0% |
| 191 parafrasis reservadas (100 preguntas canonicas) | Coincidencia exacta de plan | 88,0% |
| Preguntas de desarrollo redactadas por personas (rondas 1 a 6) | En medicion | no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La tabla de desarrollo del proyecto está pendiente de medición según la model card.

## Requisitos de hardware

- VRAM estimada: el archivo Q4_K_M ocupa aproximadamente 2,5 GB; la inferencia puede ejecutarse íntegramente en CPU con `num_gpu 0`.
- GPU recomendadas: no se especifican; cualquier GPU con al menos 4 GB de VRAM podría alojar el modelo cuantizado, aunque el despliegue de referencia es en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU con 4 GB o más de VRAM (por ejemplo, GTX 1650, RTX 3050 y superiores), aunque no es el escenario previsto.
- Opciones de despliegue: Ollama mediante el Modelfile incluido; el formato GGUF es compatible con llama.cpp y otros runners GGUF, aunque solo se documenta Ollama.
- Latencia y throughput: no disponibles. Se documenta que con decodificación greedy el mismo GGUF produjo el plan del portátil en 72 de 87 preguntas al reproducirse en una CPU de Kaggle con la misma versión de Ollama (0.30.5), lo que indica cierta variabilidad entre entornos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| tieout-planner-qwen3-4b-v3 | 4B | 8.192 (despliegue) | Planificador text-to-query sobre grafo financiero | Apache-2.0 | GGUF Q4_K_M |
| Qwen3-4B-Instruct-2507 (base) | 4B | no disponible | Instrucción general | Apache-2.0 | safetensors, GGUF |
| Modelos generales de 4B para text-to-SQL | 4B | variable | Generación de SQL | variable | variable |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoría en la información proporcionada. La comparación con el modelo base es estructural (mismo tamaño y licencia), pero no se han publicado métricas del base en esta ficha.

## Limitaciones y advertencias

- Conoce únicamente las 40 empresas y el vocabulario del grafo TieOut; para otro corpus es necesario regenerar los datos a partir de ese grafo.
- Entrenado sobre formulaciones generadas, por lo que las preguntas de analista largas o inusuales le resultan más difíciles que a modelos alojados de gran tamaño; de ahí que TieOut use dos lectores independientes y un árbitro.
- Los planes pueden diferir entre CPUs o versiones de Ollama: con decodificación greedy, el mismo GGUF coincidió con el plan del portátil en 72 de 87 preguntas al reproducirse en una CPU de Kaggle con la misma versión de Ollama (0.30.5).
- Riesgo de alucinación en el plan: aunque el JSON es válido en el 100% de los casos medidos, la coincidencia exacta con el plan de referencia es del 88,2%, lo que implica un 11,8% de planes incorrectos en el conjunto sintético.
- Idioma limitado al inglés; no se documenta soporte de otros idiomas.
- La licencia Apache-2.0 permite uso comercial, pero el modelo hereda las condiciones del modelo base Qwen3-4B-Instruct-2507, también Apache-2.0.
- La tabla de evaluación con preguntas humanas de desarrollo está pendiente de medición, por lo que el rendimiento en preguntas reales no está cuantificado.
- El contexto operativo del Modelfile es de 4.096 tokens, inferior a los 8.192 que usa TieOut en la llamada; conviene revisar la coherencia si se integra fuera del pipeline previsto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Madhvansh/tieout-planner-qwen3-4b-v3-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio del proyecto TieOut: https://github.com/Madhvansh/tieout
- Lenguaje de planes: `benchmark/plan_language.txt` en el repositorio
- Script de generación de datos: `finetune/make_data_v3.py`
- Control de deriva: `finetune/v3/drift_check.py`
- Comprobación de fuga: `scripts/check_leakage.py`
- Entrenamiento: `finetune/train_kaggle_v3.py` (v3) y `train_kaggle.py` (v2)
- Integración LLM: `tieout/llm.py`

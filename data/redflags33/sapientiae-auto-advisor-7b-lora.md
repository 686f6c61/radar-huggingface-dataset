# redflags33/sapientiae-auto-advisor-7b-lora

## Resumen

Sapientiae Auto Advisor 7B es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base Qwen/Qwen2.5-7B-Instruct, desarrollado por el usuario redflags33. No se trata de un modelo completo, sino de un ajuste fino ligero (0,2 GB de pesos) orientado a un dominio muy concreto: la seguridad de vehículos y el análisis de datos de la NHTSA (National Highway Traffic Safety Administration). El adaptador resuelve dos tareas específicas: convertir preguntas libres sobre vehículos en objetos JSON estructurados de siete claves (`query_parser`) y redactar informes de fiabilidad que citan identificadores de quejas y boletines de la NHTSA (`report_summarizer`).

El modelo hereda del base Qwen2.5-7B-Instruct su arquitectura transformer densa de aproximadamente 7.000 millones de parámetros y su ventana de contexto, aunque el adaptador se entrenó con `max_length` de 4096 tokens sin truncar ninguna fila. La relevancia de este adaptador radica en su enfoque de dominio estrecho: demuestra que un ajuste QLoRA de bajo coste (entrenado en una única Tesla T4) puede llevar las métricas de validez estructural JSON del 52,8 % al 100 % y las de coincidencia de marca y modelo del 41,7 % al 100 % en el conjunto de validación retenido.

Es un artefacto de nicho, con cero descargas y cero likes en el momento de la consulta, pensado para integrarse como componente de extracción y generación aumentada por recuperación (RAG) en aplicaciones de consulta de seguridad automovilística. Su licencia Apache 2.0 y su naturaleza de adaptador PEFT facilitan la experimentación, aunque su adopción en producción requeriría validación adicional fuera del dominio de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen2.5-7B-Instruct) con adaptador LoRA |
| Parámetros totales | Aproximadamente 7.000 millones (modelo base); adaptador LoRA de 0,2 GB en disco |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada para el adaptador; el base Qwen2.5-7B-Instruct soporta contexto largo (no confirmado en la información disponible); entrenamiento con `max_length` de 4096 tokens |
| Tipos de cuantización | Entrenado con QLoRA 4-bit NF4 con doble cuantización y `compute_dtype` float16; el adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | No disponible (la model card no declara idiomas; el base Qwen2.5 es multilingüe, pero el ajuste se realizó sobre un dataset presumiblemente en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA); requiere el modelo base Qwen/Qwen2.5-7B-Instruct (revisión `a09a354`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-7B-Instruct, un transformer decoder-only denso. El ajuste se realizó con QLoRA: cuantización 4-bit NF4 con doble cuantización y `compute_dtype` float16, con LoRA de rango 16, alpha 32 y dropout 0,05. Los módulos objetivo son `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, es decir, todas las proyecciones de atención y del MLP. El entrenamiento usó TRL SFT durante 3 épocas, con learning rate 0,0002, scheduler coseno, warmup 0,05, batch de 1 con acumulación de gradiente de 16, y `max_length` de 4096 sin truncamiento (ninguna fila descartada). La pérdida se calculó únicamente sobre la completación del asistente.

El dataset de entrenamiento es `redflags33/sapientiae-nhtsa-sft` (revisión `5d246b5`), compuesto por ejemplos de las dos tareas mencionadas. No se especifica en la información disponible el número total de tokens ni la composición detallada del dataset. No se menciona el uso de RLHF ni DPO; el proceso es exclusivamente SFT supervisado. El entrenamiento se ejecutó en una única GPU Tesla T4, lo que subraya el bajo coste computacional del ajuste.

## Capacidades

- Generación de texto conversacional en el dominio de seguridad de vehículos, heredada del base Qwen2.5-7B-Instruct.
- `query_parser`: transformación de preguntas en lenguaje natural sobre vehículos en un objeto JSON estricto de siete claves (`make`, `model`, `year_start`, `year_end`, `issue_keywords`, `issue_description`, `query_intent`), con una tasa de validez JSON del 100 % en el conjunto de validación retenido.
- `report_summarizer`: redacción de informes de fiabilidad de vehículos fundamentados, citando identificadores de quejas y boletines de la NHTSA.
- Extracción estructurada de entidades (marca, modelo, rango de años, palabras clave de incidencias) a partir de texto libre.
- Generación aumentada por recuperación (RAG) implícita: el modelo cita identificadores concretos, lo que sugiere un diseño para integrarse con una base de datos de la NHTSA.
- Soporte de tool calling / function calling: no disponible explícitamente en la información proporcionada (el base Qwen2.5-7B-Instruct lo soporta, pero no se documenta para el adaptador).
- Capacidades de agente y razonamiento multi-paso: no documentadas para el adaptador.
- Capacidades multilingües: no documentadas; el ajuste se realizó sobre un dataset específico de la NHTSA, presumiblemente en inglés.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- **Parseo de consultas de usuarios en un buscador de seguridad automovilística**: el adaptador convierte una pregunta como «¿problemas de frenos en un Toyota Corolla 2018-2020?» en un JSON con las siete claves, listo para consultar una base de datos de la NHTSA. Su tasa de validez JSON del 100 % en validación lo hace adecuado como capa de extracción previa a la búsqueda.
- **Generación de informes de fiabilidad con citas verificables**: dado un conjunto de quejas y boletines recuperados, el modelo redacta un informe que cita los identificadores de la NHTSA, lo que facilita la trazabilidad y reduce el riesgo de afirmaciones sin respaldo en un dominio regulado.
- **Asistente de atención al cliente para concesionarios o talleres**: el modelo puede gestionar consultas multi-turno sobre incidencias conocidas de un vehículo, siempre que se le proporcione el contexto recuperado de la base de datos; su entrenamiento en el dominio reduce las respuestas genéricas.
- **Enriquecimiento de bases de datos de incidencias**: integrado en un pipeline de ingesta, el adaptador normaliza descripciones libres de quejas en campos estructurados (marca, modelo, años, palabras clave), lo que permite agregaciones y análisis estadísticos posteriores.
- **Generación de resúmenes para portales de consumo o comparadores de coches**: el modelo puede producir fichas de fiabilidad por modelo y año a partir de datos de la NHTSA, citando las fuentes, para publicaciones orientadas al consumidor.
- **Prototipado rápido de asistentes verticales con presupuesto reducido**: al ser un adaptador LoRA entrenado en una T4, sirve como plantilla para equipos que quieran replicar el flujo QLoRA + SFT en otros dominios regulados (por ejemplo, seguridad alimentaria o farmacovigilancia) sin infraestructura costosa.
- **Módulo de extracción en sistemas RAG de código abierto**: el JSON de salida puede alimentar directamente un motor de búsqueda o un sistema de filtrado, actuando como preprocesador determinista antes de la generación final.

## Benchmarks y rendimiento

Los únicos datos disponibles provienen de la evaluación del autor sobre un conjunto retenido estratificado del 10 % (36 filas para `query_parser`), con decodificación greedy y sin penalización por repetición.

| Métrica | Base (Qwen2.5-7B-Instruct) | Adaptador ajustado |
|---|---|---|
| eval_loss | 1,1651 | 0,1637 |
| query_parser json_valid_rate (7 claves estrictas) | 0,528 | 1,000 |
| query_parser make+model match | 0,417 | 1,000 |
| query_parser year match | 0,194 | 1,000 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El tamaño reducido del conjunto de validación (36 filas) limita la significación estadística de las métricas.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el adaptador requiere cargar el modelo base Qwen2.5-7B-Instruct. En precisión completa (fp16) se estiman unos 14-15 GB de VRAM; con cuantización 4-bit (por ejemplo, GPTQ, AWQ o GGUF Q4) se reduce a unos 4-5 GB, más el espacio del adaptador (0,2 GB).
- **GPU recomendadas**: para fp16, una A100 40 GB, H100 o RTX 4090 (24 GB) son suficientes; para cuantización 4-bit, una RTX 3060 de 12 GB o incluso GPUs de 8 GB con GGUF Q4.
- **Cabe en GPU de consumo**: sí, en RTX 3090/4090 con fp16 y en RTX 3060/4060 Ti con cuantización 4-bit.
- **Opciones de despliegue**: PEFT con `AutoPeftModelForCausalLM` (como se documenta), vLLM (requiere fusionar el adaptador o usar soporte LoRA), llama.cpp/Ollama (previo merge y conversión a GGUF), TGI (con soporte de adaptadores PEFT).
- **Latencia y throughput**: no disponibles en la información proporcionada. El entrenamiento se realizó en una Tesla T4, lo que sugiere que la inferencia en esa GPU es viable pero lenta en fp16; no se documentan métricas de latencia.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El adaptador es de nicho y no se han publicado comparativas con otras alternativas de parsing de consultas o generación de informes de seguridad vehicular. Se indica «no disponible».

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Sapientiae Auto Advisor 7B (adaptador) | ~7B (base) | 4096 en entrenamiento | Apache 2.0 | Hugging Face (0 descargas) |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- **Sesgos conocidos**: no documentados. El dataset de entrenamiento proviene de datos de la NHTSA, lo que puede introducir sesgos geográficos (mercado estadounidense) y de cobertura (solo vehículos reportados en esa base).
- **Riesgo de alucinación**: aunque el modelo está diseñado para citar identificadores de la NHTSA, no se garantiza que las citas sean correctas fuera del conjunto de entrenamiento; en un dominio regulado, toda salida debe verificarse contra la fuente original.
- **Limitaciones de contexto o idioma**: el adaptador se entrenó con `max_length` de 4096 y sobre un dataset presumiblemente en inglés; no se documenta soporte multilingüe ni comportamiento con contextos más largos.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-7B-Instruct tiene su propia licencia (Apache 2.0 en la mayoría de variantes, aunque conviene verificar la revisión `a09a354`); el uso comercial del adaptador está sujeto a ambas.
- **Caveats para producción**: el conjunto de validación es muy pequeño (36 filas), las métricas no se han replicado de forma independiente, el repositorio tiene cero descargas y el adaptador no incluye el modelo base, por lo que el despliegue requiere descargar Qwen2.5-7B-Instruct por separado. No se documentan pruebas de robustez ante entradas adversarias ni de degradación fuera de dominio.
- **Fecha de creación futura**: la fecha indicada (2026-11-10) es posterior a la fecha actual, lo que puede indicar un error de metadatos o una fecha programada; conviene verificar la integridad del repositorio antes de usarlo.

## Enlaces

- [Hugging Face: redflags33/sapientiae-auto-advisor-7b-lora](https://huggingface.co/redflags33/sapientiae-auto-advisor-7b-lora)
- [Modelo base: Qwen/Qwen2.5-7B-Instruct](https://huggingface.co/Qwen/Qwen2.5-7B-Instruct)
- [Dataset: redflags33/sapientiae-nhtsa-sft](https://huggingface.co/datasets/redflags33/sapientiae-nhtsa-sft)
- [NHTSA (National Highway Traffic Safety Administration)](https://www.nhtsa.gov/)
- [TRL (Transformer Reinforcement Learning)](https://github.com/huggingface/trl)
- [PEFT (Parameter-Efficient Fine-Tuning)](https://github.com/huggingface/peft)

# burtenshaw/plan-my-day-v3-lfm2.5-confirmation-r2-29

## Resumen

El modelo `burtenshaw/plan-my-day-v3-lfm2.5-confirmation-r2-29` es un adaptador LoRA modificado sobre el modelo base `LiquidAI/LFM2.5-1.2B-Instruct`, desarrollado por el usuario `burtenshaw`. Se trata de un ajuste fino supervisado (SFT) realizado con la librería TRL sobre un conjunto de datos sintéticos de correcciones de calendario, cuyo objetivo es evaluar y seleccionar la mejor opción entre cuatro acciones ofrecidas en un contexto de planificación diaria. No es un agente general de calendario ni un asistente personal validado, sino un componente especializado que actúa como clasificador o selector dentro de un pipeline más amplio.

El adaptador fue entrenado en tres fases con repercusión de ejemplos históricos (replay) y se presenta como el resultado del «optimizer seed 29» dentro de un experimento de aprendizaje continuo que incluye los seeds 17, 29 y 43. No se ha elegido un seed ganador: el rendimiento reportado corresponde al sistema completo de los tres runs, no a este checkpoint individual. La arquitectura de base tiene 1,2 mil millones de parámetros y el repositorio contiene solo el adaptador, que ocupa 0,1 GB y se distribuye en formato safetensors. La longitud de contexto del modelo base no aparece en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre LiquidAI/LFM2.5-1.2B-Instruct (arquitectura subyacente no descrita en la documentación disponible) |
| Parametros totales | 1,2 mil millones (modelo base) + parámetros del adaptador no especificados explícitamente |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; no se indica cuantización del modelo base) |
| Idiomas soportados | Inglés (en) |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | Safetensors (adaptador LoRA; el modelo base se carga por separado) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) que se aplica sobre el modelo base `LiquidAI/LFM2.5-1.2B-Instruct`. El base es un modelo de lenguaje con 1,2 mil millones de parámetros; no se proporcionan detalles sobre su arquitectura interna (por ejemplo, si es un Transformer puro o un híbrido). El adaptador fue entrenado con SFT nativo de TRL sobre datos sintéticos de correcciones de calendario, contenidos en el dataset `burtenshaw/plan-my-day-v3-data`.

El entrenamiento se organizó en tres fases, con 330 actualizaciones por fase (990 en total). En las fases 2 y 3 se utilizó un replay histórico del 75% de los ejemplos anteriores; la fase 1 solo empleó ejemplos actuales por falta de historial. Se usaron tres inicializaciones de optimizador (seeds 17, 29 y 43); este checkpoint corresponde al seed 29. El sistema incorpora además un filtro externo determinista de restricciones, completitud y lookahead que se aplica a las puntuaciones del modelo; este filtro es el que proporciona las garantías de seguridad, no el modelo en sí.

## Capacidades

- Generación de texto en inglés para la tarea específica de evaluación de acciones de calendario.
- Selección o ranking de cuatro acciones predefinidas en un contexto de planificación.
- Capacidad de integrarse en pipelines donde un agente externo ofrece opciones y el modelo decide la más adecuada.
- Adaptación continua: el entrenamiento con replay histórico y datos sintéticos permite explorar escenarios de aprendizaje incremental sobre tareas de calendario.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso autónomo, visión, audio ni comprensión multimodal.
- No es un agente conversacional general: su dominio está restringido al problema de planificación de día para el que fue afinado.

## Casos de uso

- Asistente de planificación diaria: el modelo puede utilizarse en aplicaciones móviles o web que presenten al usuario cuatro posibles acciones sobre su agenda (por ejemplo, reordenar tareas, mover una cita, confirmar un evento o cancelarlo) y elija la más adecuada según el contexto y las restricciones.
- Corrección de agendas generadas automáticamente: tras la salida de un planificador automático, este adaptador evalúa las opciones de corrección y reduce la necesidad de intervención manual del usuario.
- Automatización de confirmación de citas en atención al cliente: el modelo selecciona la mejor respuesta de confirmación o reprogramación entre un conjunto limitado de acciones, integrándose en sistemas de soporte con reglas de negocio externas.
- Investigación en aprendizaje continuo: sirve como caso de estudio para medir el efecto del replay histórico y de diferentes seeds de optimizador en adaptadores LoRA entrenados con datos sintéticos de dominio.
- Generación y curado de datos sintéticos de calendario: el adaptador puede emplearse para etiquetar o validar nuevos ejemplos sintéticos, alimentando iteraciones posteriores del dataset de entrenamiento.
- Análisis de decisiones de scheduling en entornos empresariales: permite evaluar qué acción de calendario es más probable que sea aceptada por un usuario, combinando el ranking del modelo con filtros de restricciones de negocio.
- Evaluación de variantes de adaptadores en sistemas de planificación: al existir tres seeds evaluados, este checkpoint sirve para comparar la estabilidad de diferentes inicializaciones del optimizador en la misma tarea de dominio.

## Benchmarks y rendimiento

No se han publicado benchmarks estándar (como MMLU, HumanEval o GSM8K) en la información disponible. Los resultados de evaluación incluidos en la documentación corresponden a la tarea específica de corrección de calendario, obtenidos sobre 384 días sintéticos compartidos y referidos al sistema completo de tres runs (seeds 17, 29 y 43), no a este seed individual.

| Metrica | Vista raw | Vista guarded |
|---|---|---|
| Correcciones originales por día (menor es mejor) | 0,684896 | 0,562500 |
| Plan perfecto (mayor es mejor) | 47,92% | 54,17% |
| Acciones inseguras por día (menor es mejor) | 0,164062 | 0,000000 |
| Completitud (mayor es mejor) | 88,54% | 100,00% |

La comparación agregada frente a un SFT congelado fase-equivalente muestra una mejora de +0,532118 correcciones originales por día, con un intervalo de confianza del 95% de [+0,432292, +0,630208]. Esta métrica pertenece al sistema completo y no es un atributo específico del seed 29.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 2,5-3 GB si el modelo base se carga en FP16, sumando el overhead del adaptador LoRA. Esta cifra es orientativa y no está confirmada en la documentación.
- Si el modelo base se cuantiza a 8 o 4 bits, la VRAM podría reducirse, pero no se dispone de información sobre cuantizaciones preparadas para este adaptador.
- GPU recomendadas: cualquier tarjeta con al menos 4 GB de VRAM, como una RTX 3060 (12 GB), RTX 4060 (8 GB), A10G o A100. El adaptador es pequeño y el requisito principal lo impone el modelo base de 1,2 mil millones.
- Despliegue: compatible con Transformers y la librería PEFT para cargar el adaptador sobre el base. La integración con vLLM, Ollama o llama.cpp dependerá de la disponibilidad del modelo base en el formato correspondiente (por ejemplo, GGUF); no se ha confirmado en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han encontrado comparativas con modelos externos de la misma categoría. El único punto de comparación que aparece en la documentación es la familia de adaptadores del mismo proyecto, correspondientes a los seeds 17, 29 y 43. Los tres fueron evaluados conjuntamente y no se seleccionó un ganador; no se proporcionan resultados individuales por seed.

| Modelo | Base | Método | Resultado |
|---|---|---|---|
| plan-my-day-v3-lfm2.5-confirmation-r2-29 | LFM2.5-1.2B-Instruct | Adaptador LoRA SFT, seed 29 | Evaluado como parte del sistema conjunto; sin ranking individual |
| plan-my-day-lfm2.5-sft-seed17 | LFM2.5-1.2B-Instruct | Adaptador LoRA SFT, warm-start | Utilizado como punto de partida de entrenamiento |
| seeds 17 y 43 del proyecto | LFM2.5-1.2B-Instruct | Adaptador LoRA SFT | Mencionados en el reporte conjunto, sin métricas individuales |

No se puede establecer una comparativa cuantitativa con alternativas externas porque la información disponible no incluye dichos datos.

## Limitaciones y advertencias

- El modelo no es un agente general de calendario ni un asistente personal validado; su función se limita a clasificar cuatro acciones ofrecidas.
- La seguridad del sistema depende de un filtro de reglas externo (filtro guarded). El modelo por sí solo no proporciona ninguna garantía de seguridad, como afirman explícitamente los autores.
- Los resultados de evaluación corresponden al sistema conjunto de tres runs, no a este checkpoint individual. No se reclama una ventaja específica para el seed 29.
- La licencia LFM Open License v1.0 incluye condiciones de uso comercial; no es una licencia de uso comercial irrestricto. Apache-2.0 se aplica al código del proyecto, pero no otorga permisos sobre los pesos del modelo.
- El adaptador fue entrenado exclusivamente con datos sintéticos; puede heredar sesgos presentes en el dataset de correcciones de calendario y no se han documentado evaluaciones de sesgos.
- Solo soporta inglés (idioma `en`); no se indica compatibilidad con otros idiomas.
- No se ha verificado la equivalencia entre inferencia por lotes y por secuencia;
- en la documentación se menciona un fallback serial explícito para casos de entrenamiento, lo que sugiere que el uso por lotes debe validarse cuidadosamente.
- El modelo tiene el mismo riesgo de alucinación inherente a los modelos generativos de lenguaje y no se aportan evaluaciones de este aspecto.

## Enlaces

- Modelo: https://huggingface.co/burtenshaw/plan-my-day-v3-lfm2.5-confirmation-r2-29
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/burtenshaw/plan-my-day-v3-data
- Reporte canónico completo (todas las seeds y fases): https://huggingface.co/datasets/burtenshaw/plan-my-day-v3-results/blob/03cc59933ddfef7e5f0835f24a6d62af01cb40be/reports/confirmation-report.json
- Adaptador warm-start (seed 17): https://huggingface.co/burtenshaw/plan-my-day-lfm2.5-sft-seed17
- Código y configuración del proyecto: https://huggingface.co/datasets/burtenshaw/plan-my-day-v3-source
- Demo interactiva: https://huggingface.co/spaces/burtenshaw/plan-my-day

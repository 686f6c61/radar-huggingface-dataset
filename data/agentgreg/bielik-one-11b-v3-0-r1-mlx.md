# agentGreg/Bielik-One-11B-v3.0-r1-MLX

## Resumen

Bielik-One-11B-v3.0-r1-MLX es una conversión al framework MLX de Apple del modelo speakleash/Bielik-One-11B-v3.0-r1, un modelo de decisión estructurada de 11.173.081.088 parámetros desarrollado originalmente por SpeakLeash. No se trata de un modelo conversacional: está diseñado específicamente para emitir decisiones estructuradas con probabilidades calibradas sobre opciones predefinidas, y se sirve a través de una API dedicada (`/v1/systemone`) en lugar de una interfaz de chat convencional.

La relevancia de esta conversión reside en que permite ejecutar el modelo en silicio de Apple (probado sobre un M5 Max) manteniendo una paridad casi total con la inferencia de referencia en vLLM sobre NVIDIA A100 en bfloat16. Según la model card, el 99,48% de 2.902 ítems del split público de desarrollo del benchmark Tacit producen la misma respuesta en ambos motores, con diferencias medias de probabilidad por opción de 0,0032-0,0044 en vLLM frente a máximas de 0,037-0,062 en MLX.

El modelo base emplea arquitectura tipo Llama (según los tags del repositorio) y se distribuye bajo licencia Apache 2.0. El repositorio ocupa 22,3 GB en safetensors y, en el momento de la consulta, no registra descargas ni likes, lo que indica una publicación muy reciente (12 de noviembre de 2026) y sin adopción comunitaria todavía.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (según tags del repo); detalles internos del modelo base no disponibles |
| Parametros totales | 11.173.081.088 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (única precisión documentada en esta conversión) |
| Idiomas soportados | no disponible en la model card; el benchmark de paridad cubre polaco, inglés, alemán y noruego |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), librería mlx |
| Modelo base | speakleash/Bielik-One-11B-v3.0-r1 |
| Relación con el base | quantized (conversión) |
| Tamaño del repositorio | 22,3 GB |

## Arquitectura y entrenamiento

Esta ficha describe una conversión, no un entrenamiento desde cero. El modelo base speakleash/Bielik-One-11B-v3.0-r1 es un modelo de decisión estructurada de aproximadamente 11.170 millones de parámetros, etiquetado como `llama` en el repositorio y especializado en emitir decisiones con distribución de probabilidad sobre opciones, en lugar de texto libre. La model card de esta conversión no detalla la composición del dataset de entrenamiento, el número de tokens, ni si se aplicaron fases de RLHF o DPO; esa información correspondería a la model card del modelo original.

La innovación técnica de esta publicación es la portabilidad del motor de inferencia: los pesos se convierten a formato MLX en bfloat16 para ejecutarse en Apple Silicon, y el repositorio incluye `systemone_mlx.py`, un servidor FastAPI que expone la API `/v1/systemone` compatible con el frontend oficial de bielik-one, manteniendo ese frontend sin cambios sobre un backend MLX. El script depende de `mlx-lm`, `fastapi`, `uvicorn` y el paquete `bielik-one` fijado a un commit concreto de GitHub. La validación de paridad se realizó comparando probabilidades brutas a temperatura 1 contra bielik-one 1.0.8 + vLLM 0.32.0 en bf16 sobre A100, con calibración ajustada por separado para cada motor sobre el split público de desarrollo de Tacit.

## Capacidades

- Emisión de decisiones estructuradas con probabilidades calibradas sobre un conjunto de opciones predefinidas, en lugar de generación de texto libre.
- Salida de distribuciones de probabilidad por opción, lo que permite umbrales de confianza y automatización con tasa de error controlada (en el benchmark, automatización al 5% de error).
- Funcionamiento multilingüe verificado en el benchmark de paridad en polaco, inglés, alemán y noruego (bokmål); la cobertura completa de idiomas no está documentada.
- Servicio mediante API HTTP compatible con el frontend oficial de bielik-one (`/v1/systemone`, modelo identificado como "decision").
- No soporta chat conversacional: la model card indica explícitamente "Decisions only, no chat".
- No hay información disponible sobre tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Clasificación con umbral de confianza en producción: el modelo devuelve probabilidades por opción, de modo que un pipeline puede automatizar las decisiones cuya probabilidad supere un umbral y derivar el resto a revisión humana, con una tasa de error calibrable (el benchmark reporta automatización al 5% de error).
- Enrutamiento de solicitudes o tickets: dado un conjunto cerrado de categorías, el modelo asigna la distribución de probabilidad sobre ellas; su naturaleza de decisión estructurada evita el parseo frágil de texto generado.
- Moderación y etiquetado con criterios múltiples: al emitir decisiones sobre opciones discretas, encaja en flujos de anotación donde se requiere consistencia y calibración entre anotadores automáticos.
- Desarrollo y evaluación en Mac: gracias a la conversión MLX, investigadores pueden reproducir el comportamiento del modelo en Apple Silicon (probado en M5 Max) sin depender de GPU NVIDIA, con paridad del 99,48% en el split público de Tacit.
- Validación de sistemas de decisión antes de desplegar en servidor: el script `systemone_mlx.py` levanta un endpoint local en `http://127.0.0.1:8026/v1/systemone` que permite probar el frontend oficial de bielik-one contra un backend local.
- Benchmarking comparativo de motores de inferencia: la propia model card demuestra su uso para medir divergencias de calibración y probabilidad entre vLLM y MLX, útil para equipos que necesitan certificar que una cuantización o conversión no altera las decisiones del sistema.
- Procesamiento por lotes de decisiones en entornos con hardware Apple: al ejecutarse en bfloat16 sobre MLX, puede integrarse en estaciones de trabajo Mac para tareas de clasificación offline sin infraestructura de datacenter.

## Benchmarks y rendimiento

Los únicos datos publicados corresponden al benchmark Tacit (split público de desarrollo, 2.852 ítems; la tabla suma 2.902 ítems en el desglose por idioma), comparando esta conversión MLX en Apple M5 Max frente a los pesos originales en bielik-one 1.0.8 + vLLM 0.32.0 (bf16, A100):

| Idioma | Ítems | Misma respuesta | Dif. media prob. por ítem | Dif. máxima prob. por ítem | Precisión vLLM / MLX | Automatizado al 5% error, vLLM / MLX |
|---|---|---|---|---|---|---|
| pl | 652 | 99,54% | 0,0032 | 0,037 | 88,6% / 88,5% | 72,9% / 73,0% |
| en | 750 | 99,47% | 0,0043 | 0,042 | 89,1% / 88,8% | 66,1% / 66,3% |
| de | 750 | 99,60% | 0,0038 | 0,061 | 88,9% / 89,1% | 69,6% / 69,7% |
| nb | 750 | 99,33% | 0,0044 | 0,062 | 87,1% / 86,9% | 70,0% / 70,3% |
| all | 2.902 | 99,48% | no disponible | no disponible | 88,4% / 88,3% | 69,5% / 69,7% |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: los pesos en bfloat16 suman 11.173.081.088 parámetros, lo que equivale a aproximadamente 22,3 GB solo para pesos; el repositorio ocupa exactamente 22,3 GB. Hay que añadir memoria para el contexto y el runtime de MLX.
- Hardware validado: Apple M5 Max con memoria unificada suficiente para alojar los 22,3 GB de pesos más overhead.
- GPU NVIDIA: no aplica a esta conversión; la referencia vLLM se ejecutó en A100 con los pesos originales, pero esta publicación está pensada para MLX.
- GPU de consumo: no hay datos publicados sobre ejecución en RTX 4090 u otras GPU consumer con esta conversión; en Apple Silicon, el requisito práctico es un equipo con memoria unificada superior a ~24 GB.
- Opciones de despliegue: `systemone_mlx.py` incluido en el repositorio (FastAPI + uvicorn sobre mlx-lm), que sirve el endpoint `/v1/systemone` en el puerto 8026. No se documentan opciones con llama.cpp, Ollama, TGI ni vLLM para esta conversión.
- Latencia y throughput: no disponibles. La model card solo reporta precisión y divergencia de probabilidades, no velocidades de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| agentGreg/Bielik-One-11B-v3.0-r1-MLX | 11,17 B | no disponible | Decisión estructurada, conversión MLX | Apache 2.0 | Hugging Face, MLX |
| speakleash/Bielik-One-11B-v3.0-r1 | 11,17 B (mismo base) | no disponible | Decisión estructurada, pesos originales | Apache 2.0 | Hugging Face, vLLM |
| Alternativas de clasificación/decisiones de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de decisión estructurada en la documentación proporcionada; la comparación natural es contra su propio modelo base, del que difiere únicamente en el motor de ejecución (MLX frente a vLLM) y en el formato de pesos.

## Limitaciones y advertencias

- No es un modelo de chat: la model card indica "Decisions only, no chat"; usarlo para generación conversacional no es su propósito y probablemente produzca resultados deficientes.
- La model card de esta conversión no documenta sesgos, composición del dataset ni evaluaciones de seguridad; habría que consultar la del modelo base.
- Riesgo de alucinación no evaluado en la información disponible; al tratarse de un modelo de decisión con opciones cerradas, el riesgo se traslada a una asignación de probabilidad errónea sobre las opciones, no a texto inventado.
- La cobertura de idiomas solo está verificada empíricamente en pl, en, de y nb; el rendimiento en castellano u otros idiomas no está documentado.
- Longitud de contexto no disponible: no se puede planificar su uso en documentos largos sin consultar la model card del modelo base.
- Solo se distribuye en bfloat16 (22,3 GB); no hay cuantizaciones de menor precisión publicadas en este repositorio, lo que limita su despliegue en equipos con menos memoria.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse que el modelo base speakleash/Bielik-One-11B-v3.0-r1 mantiene la misma licencia y condiciones.
- El repositorio no tiene descargas ni likes y fue creado en noviembre de 2026; no hay evidencia de uso en producción ni validación independiente de la paridad reportada.
- El script de servicio depende de un commit concreto del paquete `bielik-one` en GitHub, lo que introduce un riesgo de reproducibilidad si ese commit o el repositorio dejan de estar disponibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agentGreg/Bielik-One-11B-v3.0-r1-MLX
- Modelo base: https://huggingface.co/speakleash/Bielik-One-11B-v3.0-r1
- Repositorio bielik-one (dependencia del script): https://github.com/speakleash/bielik-one
- Commit fijado de bielik-one: https://github.com/speakleash/bielik-one/commit/475c896e8ebc964236648c1d1f5bb57268914dae
- Benchmark Tacit: https://tacitbench.ai

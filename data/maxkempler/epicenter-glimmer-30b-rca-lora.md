# maxkempler/epicenter-glimmer-30b-rca-lora

## Resumen

Epicenter Glimmer 30B RCA LoRA es un adaptador LoRA (entrenado con QLoRA) sobre el modelo de pesos abiertos Muse Glimmer 30B de Meta. Lo desarrolla el usuario maxkempler como pieza central del agente de investigación de Epicenter, un sistema de detección de anomalías en redes y microservicios. El problema que resuelve es concreto: dado un incidente en un microservicio, el adaptador consulta métricas, logs, trazas y el grafo de dependencias mediante herramientas de solo lectura y emite un ranking de cinco servicios candidatos como causa raíz, citando las llamadas a herramientas que respaldan cada candidato.

El adaptador se entrenó imitando el comportamiento del agente alojado Muse Spark de Meta: se conservaron las investigaciones de Spark sobre casos del benchmark RCAEval que resolvió correctamente y que además pasaron el verificador determinista de evidencias de Epicenter. El resultado es un modelo especializado en análisis de causa raíz (RCA) para AIOps, no un modelo de chat general.

La relevancia actual reside en que demuestra que un adaptador pequeño sobre un modelo de 30B puede acercarse a un agente alojado mucho mayor en una tarea de razonamiento con herramientas, con latencias menores (80 s de mediana frente a 126 s del base) y una tasa de fallo al emitir ranking de 1 de 468 frente a 140 de 468 del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer Muse Glimmer 30B (adaptador PEFT; el base incluye torre de visión, no entrenada) |
| Parametros totales | 30B en el modelo base; el adaptador LoRA es de rango 32 (tamaño del repo: 0,8 GB) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 32.768 tokens (longitud de secuencia usada en entrenamiento con FlexAttention) |
| Tipos de cuantizacion | Base en 4-bit NF4 con doble cuantización y cómputo bf16 durante el entrenamiento; pesos del adaptador almacenados en fp32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el base `meta-models/Muse-Glimmer-30B` en revisión `a4e59da52a7bc87ae7251dd5545c0dd437c44b68` |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Muse Glimmer 30B, un transformer de Meta con torre de visión que aquí se deja intacta. Los módulos LoRA (rango 32, alpha 64, dropout 0,05) se insertan únicamente en las proyecciones de atención (q, k, v, o) y MLP (gate, up, down) del modelo de lenguaje. El entrenamiento siguió la receta de la guía de post-entrenamiento de Muse Glimmer: base en 4-bit NF4 con doble cuantización y cómputo en bf16, AdamW con tasa 1e-4, decaimiento coseno y 10 % de warmup, batch efectivo de 8, 2 épocas (54 pasos) y secuencias de hasta 32.768 tokens con FlexAttention. Se ejecutó en una H100 en Modal con un pico de 66 GB; la pérdida de validación pasó de 0,349 a 0,174 y 0,168.

Los datos provienen de las investigaciones del agente alojado Muse Spark sobre los conjuntos RE1, RE2 y RE3 de RCAEval. De 267 ejecuciones, se conservaron 246 en las que Spark situó la causa verdadera en primera posición y el verificador de Epicenter aceptó la evidencia: 212 para entrenamiento y 34 para validación. Cada investigación se reconstruye como un chat con la plantilla nativa de Glimmer y solo se entrena en los turnos del modelo (notas de razonamiento, llamadas a herramientas en formato nativo y tokens de fin de turno): 403.000 tokens entrenados de 2,55 millones por época. El razonamiento completo de Spark está cifrado por su API y no se usó; por tanto, el adaptador aprende acciones y formato de investigación, no la cadena de razonamiento interna del profesor.

## Capacidades

- Análisis de causa raíz de incidentes en microservicios: produce un ranking de cinco servicios candidatos con evidencia asociada.
- Uso de herramientas de solo lectura mediante un esquema fijo: `top_deviations`, `compare_to_baseline`, `get_metric_window`, `get_logs`, `get_trace_errors`, `get_dependencies` y `submit_ranking`.
- Razonamiento multi-paso dentro del bucle de agente de Epicenter, con notas de razonamiento breves entre llamadas.
- Tool calling en formato nativo de Glimmer, con parser `muse_glimmer` en vLLM.
- Cita explícita de las llamadas a herramientas que respaldan cada candidato del ranking.
- Capacidad de trabajar con señales de métricas, logs y trazas según el conjunto de datos de entrada (RE1 solo métricas; RE2 y RE3 con logs y trazas).
- No es un modelo de chat general ni un asistente conversacional abierto; su uso previsto está acoplado al protocolo de herramientas de Epicenter.

## Casos de uso

- Triaje automatizado de incidentes en producción: integrado en el bucle de Epicenter, recibe una alerta de microservicio y devuelve un ranking de causas raíz con evidencia, reduciendo el tiempo hasta la primera hipótesis accionable. Es adecuado porque su entrenamiento replica el protocolo de investigación y emite ranking en el 99,8 % de los casos de test.
- Asistencia a guardias de SRE: el adaptador propone candidatos y cita las consultas de métricas, logs y trazas que los sustentan, de modo que el ingeniero puede auditar la evidencia antes de actuar.
- Análisis post-incidente sobre ventanas de métricas: con `get_metric_window` y `compare_to_baseline` puede contrastar el comportamiento del servicio afectado con su línea base y señalar desviaciones relevantes.
- Correlación con el grafo de dependencias: mediante `get_dependencies` identifica servicios aguas arriba o abajo que expliquen la propagación del fallo, útil en arquitecturas de microservicios con muchas llamadas cruzadas.
- Investigación sobre logs y trazas de error: con `get_logs` y `get_trace_errors` localiza patrones de error recurrentes y los vincula a un servicio concreto del ranking.
- Automatización de la validación de hipótesis en pipelines de observabilidad: al emitir siempre un ranking en el formato esperado, puede conectarse a sistemas de tickets o runbooks que consuman la salida estructurada.
- Evaluación y benchmarking interno de agentes de RCA: sirve como referencia reproducible sobre RCAEval para comparar agentes propios frente a un baseline entrenado.

## Benchmarks y rendimiento

Resultados sobre 468 incidentes de test de RCAEval (RE1 solo métricas; RE2 y RE3 con logs y trazas), servidos con vLLM desde los mismos pesos base. AC@k indica que la causa verdadera queda dentro de las k primeras posiciones.

| Metrica | Base | Con adaptador |
|---|---:|---:|
| AC@1 · RE1 | 0,653 | 0,911 |
| AC@1 · RE2 | 0,586 | 0,944 |
| AC@1 · RE3 | 0,580 | 0,815 |
| AC@3 · RE1 | 0,751 | 0,987 |
| AC@3 · RE2 | 0,605 | 0,988 |
| AC@3 · RE3 | 0,642 | 0,951 |
| Investigaciones sin ranking | 140 de 468 | 1 de 468 |
| Turnos medianos por investigación | 11 | 6 |
| Segundos medianos de modelo por investigación | 126 | 80 |

La mejora frente al base es significativa en las tres suites (McNemar exacto sobre AC@1: p = 8e-14, 2e-14 y 3e-4 para RE1, RE2 y RE3). Frente al agente alojado Muse Spark que lo entrenó, el adaptador está a la par en RE2 (0,944 frente a 0,963; p = 0,55) y por detrás en primera posición en RE1 (0,911 frente a 0,951; p = 0,035) y RE3 (0,815 frente a 0,975; p < 0,001); en top-3 no hay diferencia significativa en ninguna suite. Todos los números son reproducibles offline desde la caché de llamadas del repositorio de Epicenter.

## Requisitos de hardware

- El adaptador en sí ocupa 0,8 GB; el modelo base de 30B requiere memoria para los pesos completos o cuantizados.
- Entrenamiento: una H100 con pico de 66 GB (QLoRA 4-bit, secuencias de hasta 32.768 tokens).
- Inferencia: Glimmer está pensado para servirse en una sola GPU; la información disponible no detalla VRAM exacta por cuantización.
- Despliegue recomendado: imagen de vLLM de Meta para Glimmer, con `--enable-lora --max-lora-rank 64` y los parsers `muse_glimmer` para tool calling y razonamiento.
- Es necesario `--limit-mm-per-prompt '{"image": 0, "video": 0}'` para servir en modo solo texto; con LoRA activado, el perfilado del codificador de visión en el arranque falla si no se limita.
- Latencia observada: mediana de 80 segundos de modelo por investigación y 6 turnos medianos (frente a 126 s y 11 turnos del base).
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AC@1 (RE1/RE2/RE3) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Epicenter Glimmer 30B RCA LoRA | 30B + LoRA r32 | 32.768 | 0,911 / 0,944 / 0,815 | Apache 2.0 | HuggingFace (adaptador) |
| Muse Glimmer 30B (base) | 30B | 32.768 | 0,653 / 0,586 / 0,580 | Apache 2.0 | Pesos abiertos de Meta |
| Muse Spark (agente alojado) | no disponible | no disponible | 0,951 / 0,963 / 0,975 | propietaria | API alojada de Meta |

La comparación se limita a estos tres sistemas porque son los únicos con resultados publicados en la misma configuración de agente, herramientas y verificador. No se dispone de datos de otros adaptadores de RCA comparables.

## Limitaciones y advertencias

- Los incidentes de RCAEval son más limpios que la producción: se inyecta un único fallo a la vez en tres sistemas de demostración, y el adaptador no se ha validado sobre incidentes reales.
- Aprende acciones y formato de investigación, no la cadena de razonamiento completa del profesor; sigue por detrás de Muse Spark en primera posición en RE1 y RE3.
- Está acoplado al esquema de herramientas y al bucle de Epicenter; con otras herramientas o prompts las ganancias pueden no transferirse.
- No es un modelo de chat general: su uso fuera del protocolo de investigación no está validado.
- Los resultados se obtuvieron en una GPU alquilada (Modal); el rendimiento en hardware propio puede variar.
- Riesgo de alucinación en la atribución de causas: el ranking puede citar evidencia existente pero interpretarla de forma incorrecta, por lo que conviene mantener el verificador determinista en producción.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; el adaptador se entrenó sobre investigaciones en el formato de Epicenter, sin datos multilingües declarados.
- Licencia Apache 2.0, la misma del modelo base, sin restricciones adicionales conocidas para uso comercial.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/maxkempler/epicenter-glimmer-30b-rca-lora
- Repositorio Epicenter (detección de anomalías en red): https://github.com/MKempler/network-anomaly-detection
- Benchmark RCAEval: https://github.com/phamquiluan/RCAEval
- Modelo base: `meta-models/Muse-Glimmer-30B` (revisión `a4e59da52a7bc87ae7251dd5545c0dd437c44b68`)

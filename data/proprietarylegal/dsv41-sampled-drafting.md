# ProprietaryLegal/dsv41-sampled-drafting

## Resumen

DSV41 sampled drafting (PP4) es un artefacto de investigación publicado por ProprietaryLegal (PLI Labs) que contiene el código y los pesos asociados a una variante del mecanismo de decodificación especulativa DSpark para DeepSeek-V4.1-Flash. No es un modelo de lenguaje autónomo, sino un *drafter* (modelo borrador) que propone tokens candidatos que el modelo objetivo verifica. La innovación de PP4 consiste en sustituir los borradores greedy de DSpark por borradores *muestreados* de la propia distribución del drafter, transportando las probabilidades del borrador hasta el verificador del objetivo para preservar exactamente la distribución de salida del modelo objetivo.

El repositorio se distribuye con licencia Apache-2.0 y está etiquetado para su uso con vLLM sobre hardware DGX Spark / GB10, con el drafter remoto ejecutándose en dos RTX 3090 conectadas por NVLink. El snapshot corresponde a la rama privada `offload/pp4-win2` en el commit `81969f70009a` (27 de octubre de 2026), y el código completo vive en el repositorio `dsv41-offload`.

La relevancia es doble: por un lado, documenta una mejora medible en decodificación especulativa (+10,2 % de borradores aceptados por ronda a profundidad fija 5 en replay offline); por otro, expone un caso de estudio sobre *offloading* remoto de drafters con RDMA y verificación exacta de la ley de aceptación, un área poco documentada públicamente. No obstante, el propio autor advierte de que no hay medición de velocidad en hardware real contra la política de producción y de que el artefacto no está promovido a producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decodificación especulativa (drafter DSpark remoto + verificador del objetivo DeepSeek-V4.1-Flash) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | EXL3 (mencionado en tags y en la ruta `exl3`) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (el repositorio contiene código Python y artefactos de configuración; no se especifica formato de pesos) |

## Arquitectura y entrenamiento

El artefacto implementa una variante del esquema de decodificación especulativa de DeepSeek-V4.1-Flash. El drafter DSpark propone borradores en una máquina remota (dos RTX 3090 unidas por NVLink) y el modelo objetivo los verifica. La ley de aceptación estándar, suma de `min(p_target, p_draft)`, favorece borradores muestreados de la distribución del drafter frente a borradores greedy; PP4 explota esta propiedad enviando las probabilidades del borrador junto con los tokens candidatos para que el verificador pueda aplicar la ley de aceptación de forma exacta y la distribución de salida coincida con la del objetivo.

El código incluye la ruta de borradores muestreados (`offload/dspark/probabilistic/`), el formato de transporte de probabilidades (`sampled_wire.py`), la política de muestreo fusionada en el worker (`sample_policy.py`), una puerta de auditoría para los sorteos aleatorios del verificador (`verifier_rng/`, dirigida a la clase de fallo de vLLM #61161) y scripts de admisión y medición en Windows (`pp4_*.py`). La admisión en hardware incluye cualificación del par físico de GPU, una puerta de casi-empate greedy con techo registrado de 1,1 nats y sondas KL. No se documenta el entrenamiento del drafter ni del objetivo en la información disponible.

## Capacidades

- Decodificación especulativa con borradores muestreados y aceptación exacta en el lado del objetivo.
- Transporte de probabilidades del borrador desde un worker remoto hasta el verificador.
- Auditoría de los sorteos aleatorios del verificador para evitar sesgos en la distribución de salida.
- Admisión en hardware con criterios cuantitativos: cualificación del par físico, puerta de casi-empate greedy y sondas KL.
- Modo de medición contra la política de profundidad adaptativa de producción.
- Integración con vLLM como librería de referencia.
- Soporte de despliegue sobre DGX Spark / GB10 con drafter remoto en RTX 3090 y transporte RDMA.
- No se documentan capacidades de generación, razonamiento, código, visión ni tool calling: el artefacto no es un modelo de chat.

## Casos de uso

- Investigación en decodificación especulativa: el repositorio sirve como implementación de referencia para estudiar cómo afecta el muestreo del drafter a la tasa de aceptación y a la distribución final, con replay offline reproducible.
- Despliegue de drafters remotos en clústeres heterogéneos: permite separar el drafter (GPUs de consumo con NVLink) del objetivo (DGX Spark / GB10) y medir el coste de transporte de probabilidades por RDMA.
- Optimización de latencia en inferencia legal: PLI Labs enmarca el trabajo en sistemas de IA para organizaciones legales, donde la latencia de decodificación sobre documentos largos es crítica y un +3 a +6 % estimado de ganancia neta por usuario único es relevante.
- Auditoría de corrección estadística: la puerta `verifier_rng` es reutilizable para detectar sesgos en sorteos aleatorios de verificadores en pipelines de decodificación especulativa.
- Benchmarking de políticas de profundidad: el modo de producción compara PP4 contra la programación adaptativa de profundidad existente, útil para decidir si merece la pena adoptar borradores muestreados.
- Formación y reproducción: los tests (529 pasados, 146 fallidos/error, 28 saltados en CPU) y los informes por rama permiten reproducir el estado del arte del proyecto y entender qué partes dependen de hardware o datos privados.
- Evaluación de coste/beneficio en producción: la métrica primaria (tokens por segundo de decodificación del servidor) permite comparar el sobrecoste de muestreo (+0,31 ms por ronda a 1 usuario, +0,79 ms a 4 usuarios) frente a la ganancia de tokens comprometidos.

## Benchmarks y rendimiento

| Métrica | Valor | Etiqueta |
|---|---|---|
| Borradores aceptados por ronda, profundidad fija 5, greedy → muestreado (replay offline) | 2,092 → 2,306 (+10,2 %) | Medido (offline) |
| Tokens comprometidos por ronda (1 + aceptados) | 3,092 → 3,306 (+6,9 %; IC 95 % de la diferencia +5,7 a +8,2 %) | Medido (offline) |
| Coste del selector de muestreo | +0,31 ms por ronda a 1 usuario; +0,79 ms a 4 usuarios | Medido |
| Ganancia neta de decodificación por usuario único tras el coste del selector | +3 a +6 % | Estimado |
| Decodificación extremo a extremo en hardware | no medida contra la programación adaptativa de producción | — |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, dado que el artefacto no es un modelo de lenguaje evaluable de forma convencional.

## Requisitos de hardware

- Drafter remoto: dos NVIDIA RTX 3090 conectadas por NVLink, ejecutando el worker DSpark con muestreo fusionado.
- Objetivo: DGX Spark / GB10 (según tags y descripción del snapshot).
- Host de offload x86 adicional (`x86host`) y estación de control (`controller`) para el arnés de medición.
- Transporte entre drafter y objetivo mediante RDMA.
- Cuantización EXL3 mencionada en los tags; no se detallan requisitos de VRAM por componente.
- Despliegue mediante vLLM como librería de referencia.
- No se dispone de cifras de latencia o throughput en hardware real; las únicas cifras son de replay offline y coste del selector.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| DSV41 sampled drafting (PP4) | Drafter de decodificación especulativa | no disponible | no disponible | Apache-2.0 | Snapshot de investigación, no promovido |
| DSpark drafter (greedy, base de DeepSeek-V4.1-Flash) | Drafter de decodificación especulativa | no disponible | no disponible | no disponible | Referencia interna del proyecto |
| EAGLE / Medusa (drafters especulativos públicos) | Drafter de decodificación especulativa | no disponible | no disponible | varía | Públicos, ampliamente adoptados |

No se dispone de datos suficientes para comparar parámetros, contexto ni rendimiento con alternativas públicas; la comparación se limita a la naturaleza del artefacto y su licencia.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto de forma autónoma ni debe evaluarse con benchmarks de conocimiento o razonamiento.
- No hay medición de velocidad en hardware real contra la programación adaptativa de producción; la ganancia neta de +3 a +6 % es una estimación.
- El artefacto no está promovido a producción y la corrección de la semántica de la API de admisión (`81969f7`) está bajo revisión independiente.
- Estado de tests: 529 pasados, 146 fallidos o con error y 28 saltados en CPU sin red; de los fallos, 84 son preexistentes en el commit fuente privado, 54 requieren datos en hosts del autor y 8 requieren archivos del árbol completo.
- Dependencia de hardware específico (RTX 3090 con NVLink, DGX Spark / GB10, RDMA) que limita la reproducibilidad fuera de ese entorno.
- Los hosts y rutas del proyecto aparecen anonimizados (`sparkhead`, `sparkworker`, `x86host`, `controller`, `/opt/dsv41`), lo que dificulta el despliegue directo.
- Riesgo de regresión estadística si no se aplica la puerta de auditoría de sorteos aleatorios del verificador (clase de fallo vLLM #61161).
- Licencia Apache-2.0 permite uso comercial, pero los avisos de terceros en `NOTICE` y `LICENSES/` deben revisarse antes de redistribuir.
- No se documentan sesgos, idiomas soportados ni riesgos de alucinación porque el artefacto no expone una interfaz de generación de texto.

## Enlaces

- HuggingFace: https://huggingface.co/ProprietaryLegal/dsv41-sampled-drafting
- Repositorio principal: https://github.com/ProprietaryLegal/dsv41-offload
- Worker del drafter remoto: https://github.com/ProprietaryLegal/dsv41-remote-dspark-drafter-3090
- Hub del proyecto: https://github.com/ProprietaryLegal/pli-labs
- PLI Labs: https://proprietarylegal.ai/labs.html
- Proprietary Legal Intelligence: https://proprietarylegal.ai

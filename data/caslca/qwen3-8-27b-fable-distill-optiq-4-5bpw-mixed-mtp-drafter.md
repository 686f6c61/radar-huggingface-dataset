# caslca/Qwen3.8-27B-Fable-Distill-OptiQ-4.5bpw-mixed-mtp-drafter

## Resumen

Este repositorio no contiene un modelo de lenguaje autónomo, sino una cabeza de predicción multi-token (MTP) concebida como "sidecar" o borrador (*drafter*) para decodificación especulativa sobre el modelo cuantizado `caslca/Qwen3.8-27B-Fable-Distill-OptiQ-4.5bpw-mixed`. Lo publica el usuario caslca el 10 de septiembre de 2026 bajo licencia Apache-2.0, en formato MLX safetensors, y su versión reparada que aquí se documenta se distribuye con 424.699.392 parámetros (unos 0,42 B) en un repositorio de 0,3 GB. La model card es explícita al respecto: es un predictor, no un modelo de lenguaje independiente.

El problema que resuelve es concreto: acelerar la decodificación del modelo destino sin reentrenarlo. Durante la generación, la cabeza MTP propone varios tokens candidatos por paso que el modelo destino verifica en paralelo; cuando la propuesta se acepta, se avanza más de un token por iteración. En las mediciones publicadas sobre un Apple M5 Max de 64 GB con MLX (`mlx-vlm` revisión 420c01e1 y `mlx-serve` revisión 0ccc684), la versión reparada alcanza 1,836x de velocidad mediana de decodificación frente a la decodificación especulativa desactivada, con una tasa de aceptación de borradores del 84,5 % (3843 de 4548) y un tiempo de generación agregado de 1,123 h frente a 2,691 h.

Su relevancia actual es doble. Por un lado, documenta una reparación reproducible de un sidecar defectuoso: siete vectores de normalización conservaban un desplazamiento de convención que solo se corrige cuando las claves mantienen el prefijo `mtp.`, y la corrección se aplicó sumando 1,0 en BF16 con redondeo a par más cercano, dejando los 22 tensores de matriz/cuantización intactos. Por otro, aporta evidencia emparejada de que la aceleración no degrada la calidad de código de forma apreciable, con una diferencia combinada de −0,33 pp en HumanEvalPlus y MBPPPlus dentro del margen de equivalencia predeclarado de ±5 pp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza MTP (multi-token prediction) para decodificación especulativa; etiqueta `qwen3_5_mtp`. Detalle interno de capas no disponible |
| Parametros totales | 424.699.392 (≈ 0,42 B), según pesos safetensors |
| Parametros activos | no aplica (arquitectura densa, no es MoE) |
| Longitud de contexto | no disponible (la hereda del modelo destino; no se publica en este repositorio) |
| Tipos de cuantizacion | Repositorio etiquetado como `4-bit`; el modelo base usa cuantización OptiQ de 4,5 bpw. El sidecar conserva 22 tensores de matriz/cuantización sin modificar y 7 vectores de normalización corregidos en BF16. Detalle por tensor no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `mlx`) |
| Modelo destino requerido | caslca/Qwen3.8-27B-Fable-Distill-OptiQ-4.5bpw-mixed |
| Tensores del sidecar | 29 payloads: 22 de matriz/cuantización + 7 de normalización reparados |
| Tamaño del repositorio | 0,3 GB |
| Descargas / likes | 0 / 0 (a fecha de la información) |
| Versión de pesos original (SHA256) | 26967a026f91d3bc1ce440584e931e41311e224c9467c376e5b06c45a402f968 |
| Versión reparada (SHA256) | ff4d5cfc53e8de65afc6bf2b0734ede4b32c7a4b9e7ac5d5b047413630cc0353 |

## Arquitectura y entrenamiento

El artefacto es una cabeza MTP de tipo borrador (*drafter*) asociada al modelo cuantizado Qwen3.8-27B-Fable-Distill-OptiQ-4.5bpw-mixed. Su función es proponer secuencias cortas de tokens candidatos que el modelo destino valida en un único paso de verificación; el mecanismo encaja en el marco de decodificación especulativa y depende de una implementación MTP compatible en el servidor de inferencia. Con 424,7 M de parámetros y 0,3 GB de repositorio, su huella es pequeña frente a los aproximadamente 27 B del modelo destino.

No hubo entrenamiento nuevo ni modificación de los pesos del modelo destino: la cabeza original se distribuyó junto al checkpoint y este repositorio es una reparación. El fallo consistía en siete desplazamientos de normalización heredados de las convenciones de HuggingFace; su cargador solo convierte esos desplazamientos cuando las claves conservan el prefijo `mtp.`, de modo que se reparó la convención sumando 1,0 en BF16 con redondeo a par más cercano sobre los siete vectores de normalización. Los 22 tensores de matriz y cuantización quedaron sin tocar, y los 29 payloads resultantes coinciden con el sidecar del modelo base que funcionaba de forma independiente. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni fases de RLHF o DPO.

## Capacidades

- Predicción de tokens borrador para decodificación especulativa sobre el modelo destino indicado; no es un generador de texto autónomo.
- Aceleración de la decodificación: 1,836x de velocidad mediana en un cribado de tres tareas frente a la decodificación especulativa desactivada, en Apple M5 Max de 64 GB con MLX.
- Tasa de aceptación de borradores del 84,5 % (3843 de 4548 propuestas) en la configuración medida.
- Reducción del tiempo de generación agregado en la campaña combinada: 1,123 h con la cabeza activada frente a 2,691 h desactivada (ratio emparejado 0,417; IC del 95 % [0,238; 0,603]).
- Conservación de la calidad en tareas de código verificadas por ejecución (HumanEvalPlus y MBPPPlus), con todos los ítems convergiendo.
- Integración con el ecosistema MLX: `mlx-vlm` y `mlx-serve` en las revisiones documentadas.
- No consta soporte de *tool calling*, *function calling*, agentes, multilingüismo, visión, audio ni modo de razonamiento propio: esas capacidades pertenecen al modelo destino, no al borrador.

## Casos de uso

- Aceleración de asistentes de código autohospedados en Apple Silicon: desplegando el sidecar junto al modelo destino bajo `mlx-serve`, la mediana de velocidad de decodificación se multiplica por 1,836, lo que se traduce en respuestas completas en menos de la mitad de tiempo en la campaña medida.
- Reducción de coste en lotes de generación larga: el ratio de tiempo de reloj emparejado de 0,417 convierte trabajos de horas en trabajos de decenas de minutos, útil para regenerar documentación o parches sobre grandes bases de código.
- Puertas de calidad en CI/CD: dado que la decodificación especulativa puede alterar las salidas, el modelo encaja en pipelines que ejecutan HumanEvalPlus o MBPPPlus como prueba de regresión antes de promover una revisión del servidor de inferencia.
- Investigación en decodificación especulativa: el repositorio ofrece un caso controlado con hashes de origen y destino, tasas de aceptación y presupuestos de tokens, ideal para comparar cabezas MTP frente a otras estrategias de borrador.
- Recuperación de sidecars defectuosos: sirve como referencia reproducible para diagnosticar desplazamientos de normalización en cabezas MTP distribuidas sin el prefijo `mtp.` en las claves.
- Evaluación comparativa de configuraciones de servidor: permite medir el efecto de cambios en el *target temperature* (0,5 en las pruebas) y en el esfuerzo de razonamiento sobre la aceptación del borrador.
- Prototipado en estación de trabajo de un solo equipo: al requerir únicamente memoria unificada de 64 GB y no una GPU dedicada, permite validar ideas de generación de código sin clúster.

## Benchmarks y rendimiento

Calidad de código en tareas verificadas por ejecución (evaluador nativo ARM64 de EvalPlus, 50 tareas × 3 muestras por brazo, temperatura del destino 0,5, esfuerzo de razonamiento medio; 600 respuestas convergidas):

| Dataset | Tareas × muestras por brazo | Estricto OFF | Estricto reparado ON | ON − OFF, IC emparejado del 95 % |
|---|---:|---:|---:|---|
| HumanEvalPlus | 50 × 3 | 92,0 % | 90,67 % | −1,33 pp [−5,33; +2,0] |
| MBPPPlus | 50 × 3 | 84,67 % | 85,33 % | +0,67 pp [−2,0; +4,67] |
| Combinado, peso de ítem igual | 100 × 3 | 88,33 % | 88,0 % | −0,33 pp [−3,0; +2,33] |

Velocidad en el cribado de tres tareas:

| Metrica | Valor |
|---|---|
| Velocidad mediana de decodificación, reparado ON frente a OFF | 1,836x |
| Tasa de aceptación de borradores | 3843 / 4548 (84,5 %) |
| Respuestas convergentes en el cribado | 6 de 6 |
| Tiempo de generación combinado ON | 1,123 h |
| Tiempo de generación combinado OFF | 2,691 h |
| Ratio de tiempo de reloj emparejado | 0,417; IC del 95 % [0,238; 0,603] |
| Ratio de tokens de salida | 0,778; IC del 95 % [0,463; 1,082] |
| Diferencia mínima detectable, por dataset | 17,7 pp |
| Diferencia mínima detectable, agrupada | 12,5 pp |

## Requisitos de hardware

- VRAM/memoria para el sidecar: aproximadamente 0,3 GB según el tamaño del repositorio; se carga junto al modelo destino.
- Memoria para el modelo destino: no confirmada por el autor. A partir del nombre del modelo base (27 B a 4,5 bpw) se puede estimar del orden de 15 GB de pesos más el sobrecoste de caché KV y activaciones; tómese como estimación derivada, no como dato publicado.
- Hardware de la evidencia: Apple M5 Max con 64 GB de memoria unificada, con las revisiones `mlx-vlm` 420c01e1 y `mlx-serve` 0ccc684.
- GPU dedicadas (A100, H100, RTX 4090 y similares): no disponibles para este artefacto, que se distribuye en formato MLX y depende de implementación MTP compatible.
- Opciones de despliegue: `mlx-vlm` y `mlx-serve` en el ecosistema MLX. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y rendimiento: 1,836x de velocidad mediana de decodificación y ratio de tiempo de reloj de 0,417 en la campaña citada; no se publican valores absolutos de tokens por segundo ni latencia por token.
- Aviso de proporcionalidad: el tiempo de reloj mejora en parte por longitudes de salida distintas y comportamiento de cola larga, no solo por una decodificación más rápida; el brazo OFF de HumanEvalPlus incluyó una respuesta convergida de 48.353 tokens.

## Comparativa con modelos similares

No se dispone de datos publicados para comparar esta cabeza MTP con otros borradores del ecosistema (EAGLE, Medusa, borradores destilados o *lookahead* por n-gramas). La comparación que sí está documentada es interna a este artefacto:

| Configuracion | Aceptacion de borradores | Velocidad relativa | Notas |
|---|---|---|---|
| Sidecar reparado (este repositorio) | 3843 / 4548 (84,5 %) | 1,836x mediana | 22 tensores sin cambios + 7 normas reparadas; 29 payloads verificados |
| Sidecar original (claves despojadas) | 0 / 12.516 | 0,620x | Aceptación nula; se ejecutó un control positivo del modelo base antes de interpretar el cero |
| Decodificación especulativa desactivada (OFF) | no aplica | 1,0x (referencia) | Generación combinada de 2,691 h frente a 1,123 h |

Comparación con alternativas de terceros: no disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje independiente: sin el modelo destino exacto y una implementación MTP compatible no produce resultados útiles.
- La decodificación especulativa puede alterar las salidas; no está garantizado que sea sin pérdida (*lossless*). Cualquier despliegue en producción debe validar sus propias salidas, no asumir equivalencia con la decodificación no especulativa.
- Potencia estadística limitada: la diferencia mínima detectable nominal es de 17,7 pp por dataset y 12,5 pp agrupada. El intervalo combinado cabe dentro del margen de equivalencia de ±5 pp, pero HumanEvalPlus por separado queda inconcluso.
- El intervalo de HumanEvalPlus llega hasta −5,33 pp, de modo que no puede descartarse una degradación relevante en esa tarea concreta.
- La evidencia cubre únicamente tres tareas de código verificadas por ejecución, con 600 respuestas convergidas; no establece capacidad de contexto largo ni calidad de código subjetiva.
- La reparación depende de que el cargador conserve el prefijo `mtp.` en las claves; si se renombran las claves, la conversión de desplazamientos no se aplica y el sidecar vuelve a comportarse como el original defectuoso.
- El sidecar original mostraba una tasa de aceptación de 0 sobre 12.516 propuestas; cualquier variante sin la corrección de normalización debe considerarse inservible hasta prueba en contrario.
- La mejora de tiempo de reloj mezcla longitudes de salida distintas y comportamiento de cola larga, por lo que no debe interpretarse como una ganancia pura de velocidad de decodificación.
- Licencia Apache-2.0 según las etiquetas del repositorio, con atribución y licencia siguiendo los artefactos de origen; conviene verificar los términos del modelo destino antes de un uso comercial.
- Sin adopción comunitaria: 0 descargas y 0 likes, sin validación independiente de la reparación más allá de la evidencia declarada por el autor.
- Evidencia de hardware restringida a un Apple M5 Max de 64 GB; el comportamiento en otras plataformas no está caracterizado.
- Riesgo de uso indebido si se trata como generador de texto: la model card lo describe explícitamente como predictor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/caslca/Qwen3.8-27B-Fable-Distill-OptiQ-4.5bpw-mixed-mtp-drafter
- Modelo base: https://huggingface.co/caslca/Qwen3.8-27B-Fable-Distill-OptiQ-4.5bpw-mixed
- Paper, blog, repositorio de código o demo: no disponible
- Resultados de la búsqueda web: no se encontró ningún enlace relevante para este modelo; los resultados devueltos correspondían a páginas de Google Maps y Google Earth, sin relación con el artefacto.

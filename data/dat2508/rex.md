# Dat2508/rex

## Resumen

Rex (Dat2508/rex) es un checkpoint de ModernBERT especializado en autenticación basada en riesgo (risk-based authentication, RBA) y detección de fraude en inicios de sesión. Lo publica el usuario Dat2508 en Hugging Face bajo licencia Apache-2.0 y se construye sobre el encoder `answerdotai/ModernBERT-base`, con 149.063.424 parámetros y pesos en safetensors.

No es un generador de texto: es un encoder transformer con dos cabezas acopladas, `ToolMLPHead` y `SharedVerdictHead`, que implementa lo que el autor denomina un motor de investigación MECE con eliminación de hipótesis de raíz popperiana. Dado un caso de login, el sistema selecciona señales de telemetría en un máximo de tres rondas con presupuesto dinámico y emite un veredicto entre cuatro causas raíz: botnet, Sybil, infraestructura compartida y causa novedosa.

Su interés es acotado pero concreto: propone un esquema de recolección activa y económica de evidencia para decidir si un inicio de sesión es legítimo, en lugar de aplicar umbrales estáticos sobre un vector de features fijo. Ahora bien, se trata de un modelo de autor único con 5 descargas y 1 like en el momento de redactar esta ficha, sin benchmarks publicados ni validación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer ModernBERT-base con dos cabezas de tarea: `ToolMLPHead` (4 slots de investigación) y `SharedVerdictHead` (4 causas raíz MECE) |
| Parametros totales | 149.063.424 |
| Longitud de contexto | No disponible en la model card |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 1,2 GB |
| Pipeline declarado | No disponible |
| Descargas / likes | 5 / 1 |
| Fecha de creacion | 2026-10-21 |
| Ultima actualizacion | 2026-10-21 |

## Arquitectura y entrenamiento

La arquitectura parte de ModernBERT-base, un encoder transformer bidireccional, y añade dos cabezas. `ToolMLPHead` dispone de 4 slots de investigación que determinan qué telemetría solicitar; `SharedVerdictHead` produce el veredicto sobre 4 causas raíz MECE (mutuamente excluyentes y colectivamente exhaustivas) etiquetadas como `H_botnet`, `H_sybil`, `H_shared` y `H_novel`. La política de investigación se ejecuta en 3 rondas con presupuesto dinámico: en cada ronda el modelo decide qué evidencia adicional merece la pena recoger antes de cerrar el caso.

El entrenamiento utiliza el *Login Data Set for Risk-Based Authentication* de Wiefling et al. (2022), publicado en Zenodo con licencia CC BY 4.0 y distribuido en Hugging Face como `dasgroup/rba-dataset`. El autor describe el procedimiento como Process of Elimination (PoE) de raíz popperiana: el modelo aprende a descartar hipótesis mediante evidencia en lugar de confirmar una única causa. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO; tampoco se documenta ninguna innovación de atención o decodificación más allá del encoder base.

## Capacidades

- Clasificación multi-hipótesis sobre 4 causas raíz MECE (`H_botnet`, `H_sybil`, `H_shared`, `H_novel`) para un evento de autenticación.
- Política de investigación activa: selección de hasta 4 slots de telemetría repartidos en 3 rondas con presupuesto dinámico.
- Razonamiento por eliminación (Process of Elimination): descarte secuencial de hipótesis conforme llega evidencia nueva.
- Emisión de un veredicto compartido a partir del estado acumulado de la investigación.
- Soporte de tool calling: no en el sentido de invocación de APIs de un LLM generativo; los "slots" son selectores de señales de telemetría, no llamadas a funciones arbitrarias.
- Capacidades de agente multi-paso: limitadas al bucle cerrado de 3 rondas de recolección definido por el autor; no hay planificación abierta.
- Multilingüe: no; únicamente inglés.
- Generación de texto, código, matemáticas, visión o audio: no disponibles; el modelo es un encoder de clasificación, no un decodificador autoregresivo.
- Modo "thinking" explícito: no documentado.

## Casos de uso

- Autenticación adaptativa con step-up: el modelo recibe el contexto inicial del login y decide qué señales adicionales pedir (dispositivo, reputación de IP, cadencia) antes de recomendar MFA o bloqueo, reduciendo la fricción frente a reglas estáticas.
- Detección de account takeover y credential stuffing: la hipótesis `H_botnet` permite clasificar patrones de fuerza bruta distribuida y activar contramedidas solo cuando la evidencia recolectada la respalda.
- Detección de ataques Sybil: la hipótesis `H_sybil` está pensada para granjas de cuentas coordinadas; el modelo puede integrarse en el pipeline de registro y login para agrupar identidades sospechosas.
- Detección de infraestructura compartida: `H_shared` cubre casos de IP, dispositivos o proxies reutilizados legítimamente (NAT corporativo, CGNAT), lo que ayuda a evitar falsos positivos por bloqueo indiscriminado de rangos.
- Priorización de telemetría en producción: al repartir la recolección en 3 rondas con presupuesto, el sistema puede reducir el volumen de eventos enviados a almacenamiento y el coste de enriquecimiento por login, manteniendo la capacidad de decisión.
- Triaje en SOC: usar el veredicto y la traza de hipótesis descartadas como enriquecimiento de alertas de autenticación, de modo que el analista reciba la evidencia ya ordenada por relevancia.
- Investigación de casos anómalos: `H_novel` actúa como bandera para derivar a revisión humana los inicios de sesión que no encajan en ninguna de las tres categorías conocidas.
- Investigación académica sobre razonamiento por eliminación: el checkpoint sirve como artefacto reproducible para estudiar políticas de recolección de evidencia y descomposición MECE en dominios de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card no incluye métricas de evaluación (AUC, F1, precisión/recall por hipótesis, calibración del veredicto) ni comparaciones con líneas base del dataset RBA. Tampoco se documentan curvas de aprendizaje, tamaños de partición train/validation/test ni el coste medio de recolección por caso.

## Requisitos de hardware

- VRAM estimada solo para pesos: ~596 MB en fp32 (~568 MiB), ~298 MB en fp16/bf16, ~149 MB en int8 y ~75 MB en int4. Hay que sumar activaciones y overhead del runtime.
- El repositorio ocupa 1,2 GB, por encima de lo que exigen los pesos en fp32 (unos 0,6 GB), lo que sugiere la presencia de checkpoints adicionales u otros artefactos de entrenamiento.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM libre es suficiente para inferencia en fp16; no se requiere A100 ni H100. Para lotes grandes o servicio concurrente, una T4, L4 o RTX 4090 van sobradas.
- Cabe en GPU de consumo: sí, en cualquier RTX/GTX con 4 GB o más, e incluso en CPU para tráfico moderado.
- Opciones de despliegue: el repositorio no declara pipeline ni runtime. La vía natural es cargar el encoder ModernBERT con `transformers`; no se documenta soporte en vLLM, llama.cpp, Ollama ni TGI. Una exportación a ONNX es plausible pero no está publicada.
- Latencia y throughput: no disponible. No se han publicado cifras de latencia por petición ni de peticiones por segundo.

## Comparativa con modelos similares

No se conocen alternativas públicas ampliamente establecidas para esta tarea exacta (motor de investigación RBA con PoE), por lo que la comparación se hace contra encoders base de tamaño equivalente. Los datos de las alternativas provienen de su documentación pública y no se han verificado dentro de las fuentes de esta ficha.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dat2508/rex | 149 M | No disponible | Clasificación RBA e investigación por eliminación | Apache-2.0 | Hugging Face, 5 descargas |
| answerdotai/ModernBERT-base | 149 M | 8.192 tokens (según documentación del modelo base) | Encoder generalista | Apache-2.0 | Hugging Face |
| google-bert/bert-base-uncased | 110 M | 512 tokens | Encoder generalista | Apache-2.0 | Hugging Face |
| microsoft/deberta-v3-base | 86 M | 512 tokens | Encoder generalista | MIT | Hugging Face |

Frente a los encoders generalistas, Rex aporta cabezas específicas de dominio y una política de recolección de evidencia; en contra, carece de métricas publicadas que permitan afirmar que supera a un clasificador ajustado sobre el mismo dataset.

## Limitaciones y advertencias

- Modelo de autor único con 5 descargas y 1 like: no ha pasado revisión por pares ni validación independiente.
- Sin benchmarks ni métricas de evaluación publicadas: no es posible justificar su adopción frente a un clasificador supervisado convencional sobre el mismo dataset.
- Solo inglés: no se ha entrenado ni evaluado en otras lenguas, lo que limita su uso en mercados hispanohablantes sin reentrenamiento.
- No es un modelo generativo: no produce texto libre, código ni explicaciones en lenguaje natural; cualquier explicación debe construirla una capa externa.
- Dependencia fuerte del esquema del dataset RBA: si la telemetría de producción no comparte nombres, granularidad y semántica con `dasgroup/rba-dataset`, el rendimiento puede degradarse sin que exista un mecanismo documentado de adaptación.
- Riesgo de deriva de distribución: el dataset proviene de un único servicio online a gran escala (Wiefling et al., 2022); la transferencia a otros sectores o volúmenes de tráfico no está evaluada.
- Hipótesis cerradas: el conjunto MECE de 4 causas raíz puede no cubrir todos los patrones de fraude reales; `H_novel` mitiga parcialmente el problema, pero no garantiza detección de causas fuera de vocabulario.
- Calibración desconocida: al no publicarse métricas de calibración, no se recomienda usar las probabilidades del veredicto como umbral automático sin un proceso previo de ajuste y validación.
- Licencia del modelo Apache-2.0, pero el dataset subyacente es CC BY 4.0 y exige atribución a Wiefling et al. (2022); conviene revisar las obligaciones de atribución antes de un uso comercial.
- Fechas de creación y actualización (2026-10-21) registradas en el repositorio; no hay historial de versiones ni changelog que permita evaluar la estabilidad del checkpoint.
- No se documenta sesgo demográfico ni geográfico del dataset de entrenamiento, un aspecto crítico en sistemas de autenticación que pueden bloquear cuentas legítimas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dat2508/rex
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Dataset en Hugging Face: https://huggingface.co/datasets/dasgroup/rba-dataset
- Dataset original en Zenodo (registro 6782156): https://doi.org/10.5281/zenodo.6782156
- Artículo de referencia (ACM TOPS, 2022): https://doi.org/10.1145/3546187

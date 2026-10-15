# dadudu/microduck-bubu-sprint

## Resumen

microduck-bubu-sprint es una política de control (policy) de aprendizaje por refuerzo publicada por el usuario dadudu en HuggingFace, empaquetada como `policy.onnx` y pensada para ejecutarse sobre el robot microduck de Pollen Robotics. No se trata de un modelo de lenguaje ni de un modelo generativo de propósito general: es una política perceptrón-acción que consume observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, es decir, un controlador de marcha para un robot físico o simulado. La model card la describe explícitamente como una política "perpetua" ("perpetual"), que se ejecuta de forma continua hasta que se le indique lo contrario.

El checkpoint se identifica internamente como `bubu-fast10` ckpt75 y describe un entrenamiento orientado a velocidad de avance ("forward speed") con bonificaciones de finalización ("finish bonus") y shaping de tipo "dive-near-finish", encadenado a partir de un warm-start. El autor reporta una métrica local de 1.204 s, cuya definición exacta no se especifica en la información disponible.

Su relevancia es acotada pero clara dentro del ecosistema microduck: se integra mediante el comando `robotctl policy load <slot> dadudu/microduck-bubu-sprint`, con el normalizador de observaciones embebido en el propio ONNX, y sigue el esquema 2 del manifiesto de políticas del daemon. El repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, y no declara licencia ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se distribuye como grafo ONNX `policy.onnx`; la model card no detalla la topologia de la red) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje, no aplica una ventana de contexto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; la interfaz es numerica: 61 dimensiones de observacion y 14 acciones) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) acompanado de `manifest.json` (esquema 2 del manifiesto de politicas de microduck) |

Datos adicionales verificables: autor `dadudu`, pipeline `robotics`, libreria `microduck`, tags `microduck`, `onnx`, `robotics`, `reinforcement-learning`, `region:us`, tamano del repositorio 0.0 GB, creado el 2026-10-14 y actualizado el mismo dia.

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura interna de la red más allá de que se exporta como ONNX. Por el tipo de tarea (observación de 61 dimensiones, 14 acciones, 50 Hz) y por el pipeline declarado (`robotics` + `reinforcement-learning`), se trata de una política entrenada con RL para control continuo, pero la model card no especifica si es un MLP, una red recurrente ni el número de parámetros. El normalizador de observaciones está embebido dentro de `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo sin preprocesarlas.

En cuanto al entrenamiento, la model card indica que procede del repositorio `pollen-robotics/microduck_rl`, rama `bubu-sprint-fast`, commit `ef16a6774`. La descripción del checkpoint menciona cuatro elementos de diseño: recompensa por velocidad de avance, bonificación por finalizar, shaping de "dive-near-finish" y una cadena de warm-start (el checkpoint se inicializa a partir de uno anterior). No se indica el número de pasos de entrenamiento, el número de entornos paralelos, la composición del dataset ni si hubo etapas de ajuste posteriores. Tampoco se documentan técnicas como decodificación especulativa, atención lineal u otras, que no aplican a este tipo de política.

## Capacidades

- Control de locomoción del robot microduck: genera una marcha continua a partir de observaciones de 61 dimensiones y produce 14 acciones a 50 Hz.
- Ejecución perpetua: la política no termina por sí sola, sino que mantiene la marcha hasta que se detiene o se descarga desde el daemon.
- Integración directa con `robotctl`: se carga en una ranura ("slot") de políticas mediante `robotctl policy load <slot> dadudu/microduck-bubu-sprint`.
- Normalización embebida: acepta observaciones en crudo, sin capa de preprocesado externa.
- Metadatos conformes al esquema 2 del manifiesto de políticas de microduck, lo que facilita su carga automatizada por el daemon.
- Orientación a velocidad de avance: el entrenamiento prioriza avanzar rápido, con bonificaciones por completar el recorrido y shaping específico en la fase final.
- Reutilizable como base para warm-start: al proceder de una cadena de warm-start, es candidata a inicializar entrenamientos posteriores.
- No se declaran capacidades de tool calling, agentes, multilingüismo, visión, audio ni modo de razonamiento, y ninguna de ellas aplica a este tipo de modelo.

## Casos de uso

- Control de marcha en el robot microduck físico: cargar la política en una ranura con `robotctl policy load` y dejar que gobierne las 14 articulaciones a 50 Hz. Es adecuada porque el normalizador va embebido y las observaciones se alimentan en crudo, lo que simplifica el bucle de control.
- Punto de partida para nuevos experimentos de RL: dado que proviene de una cadena de warm-start, puede usarse como inicialización en `microduck_rl` para entrenar variantes con otras recompensas (giros, frenado, terreno irregular) sin partir de cero.
- Comparación de checkpoints dentro de una misma familia: el identificador `bubu-fast10` ckpt75 sugiere una serie de checkpoints; esta política sirve como referencia del step 75 para medir el efecto de recompensas de velocidad y de finalización.
- Validación de la canalización `robotctl` y del esquema 2 de manifiestos: al ser un artefacto que sigue el esquema, es útil para probar el flujo de carga y descarga de políticas en el daemon antes de desplegar otras.
- Demostraciones y exhibiciones de robótica: una política perpetua orientada a velocidad permite mantener el robot en movimiento continuo durante una demo sin reinicios manuales.
- Banco de pruebas de sim-to-real: ejecutar la política en simulación y en hardware para estudiar la transferencia de una marcha entrenada con shaping de velocidad y finalización.
- Docencia de aprendizaje por refuerzo aplicado: un caso pequeño y verificable (61 observaciones, 14 acciones) resulta manejable para ilustrar el ciclo entrenamiento-exportación ONNX-despliegue.

## Benchmarks y rendimiento

El único dato numérico de rendimiento presente en la model card es una métrica local de 1.204 s asociada al checkpoint 75. La información disponible no especifica qué mide exactamente esa cifra (si es tiempo de recorrido, tiempo de simulación, tiempo de pared o cualquier otra magnitud), por lo que no debe interpretarse como un benchmark comparable con otros modelos.

| Metrica | Valor | Notas |
|---|---|---|
| Metrica local reportada por el autor (ckpt75) | 1.204 s | Definicion de la metrica no especificada en la model card |
| MMLU, HumanEval, GSM8K u otros benchmarks de lenguaje | no disponible | No aplican a una politica de control |
| Benchmarks de locomocion estandarizados (por ejemplo, recompensa media, distancia recorrida, tasa de caida) | no disponible | No se han publicado en la informacion disponible |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Al tratarse de un grafo ONNX con entrada de 61 dimensiones y salida de 14 acciones, la huella es de kilobytes a pocos megabytes; no se dispone de la cifra exacta de parámetros.
- GPU recomendadas: no se requiere GPU. La inferencia a 50 Hz de una política de este tipo es viable en CPU; no hay datos oficiales de latencia ni de throughput.
- Compatibilidad con GPU de consumo: sí, previsiblemente cualquier GPU de consumo (por ejemplo, RTX 3060 o superior) puede ejecutarla, e incluso es prescindible. Esta afirmación es una estimación basada en el tamaño de entrada y salida, no un dato publicado.
- Despliegue: el camino previsto es el daemon de microduck mediante `robotctl policy load`, que consume `policy.onnx` y `manifest.json`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles. El único dato temporal publicado es la métrica local de 1.204 s, de significado no especificado.
- Restricción práctica: el hardware debe poder ejecutar el runtime de microduck y mantener el bucle de control a 50 Hz.

## Comparativa con modelos similares

No se dispone de información verificable sobre políticas comparables publicadas para microduck (otros checkpoints de `bubu-fast10`, políticas de la misma familia o alternativas de terceros) ni sobre sus especificaciones, licencias o métricas. Las búsquedas web realizadas no devolvieron resultados relevantes sobre este modelo, únicamente páginas genéricas de conversión de unidades.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dadudu/microduck-bubu-sprint | no disponible | no aplica | metrica local 1.204 s (sin definir) | no disponible | HuggingFace, 0 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: no hay información sobre condiciones de uso, lo que impide asumir permiso para uso comercial o para redistribución. Conviene contactar con el autor antes de integrarla en un producto.
- Ausencia de benchmarks verificables: no se publican métricas estándar de locomoción (distancia, estabilidad, tasa de caída, robustez a perturbaciones), por lo que no puede compararse de forma rigurosa con otras políticas.
- Métrica local ambigua: el valor de 1.204 s no viene acompañado de su definición ni de las condiciones de medida (hardware, simulación o robot real).
- Sin documentación de arquitectura: al desconocerse la topología y el número de parámetros, no es posible estimar con precisión requisitos de cómputo ni analizar la política.
- Especificidad de plataforma: la política está entrenada para la morfología y el espacio de observación/acción concretos de microduck (61 dimensiones de observación, 14 acciones, 50 Hz); no es transferible a otro robot sin reentrenamiento.
- Riesgo de sobreajuste a la recompensa: al combinar velocidad de avance, bonificación por finalizar y shaping de "dive-near-finish", el comportamiento en condiciones fuera de la distribución de entrenamiento (terrenos, empujes, desgaste de motores) no está documentado y puede degradarse.
- Comportamiento perpetuo: al no terminar por sí sola, requiere mecanismos externos de parada; en producción hay que prever un supervisor que interrumpa la marcha.
- Repositorio sin adopción: 0 descargas y 0 "likes", sin evidencia de validación por terceros.
- Idiomas y sesgos: no aplican sesgos lingüísticos, pero sí posibles sesgos de simulación (parámetros físicos asumidos durante el entrenamiento) que pueden no corresponder al robot real.
- Advertencia sobre herramientas de búsqueda: las consultas web asociadas devolvieron únicamente páginas de conversión de volúmenes, sin ninguna relación con el modelo.

## Enlaces

- HuggingFace: https://huggingface.co/dadudu/microduck-bubu-sprint
- Repositorio del robot microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL citado en la model card: https://github.com/pollen-robotics/microduck_rl
- Rama de entrenamiento citada: https://github.com/pollen-robotics/microduck_rl/tree/bubu-sprint-fast
- Commit citado: https://github.com/pollen-robotics/microduck_rl/commit/ef16a6774
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` dentro del repositorio del daemon (URL no disponible en la información proporcionada)
- Búsquedas web: sin resultados relevantes sobre el modelo; únicamente páginas genéricas de conversión de unidades (metric-conversions.org, convert-me.com, omnicalculator.com, convertworld.com, convertlive.com)

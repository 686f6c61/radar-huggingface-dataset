# djduecaster/dfreq-sprint-action-rate-tight-20261114

## Resumen

SprintActionRateTight es un artefacto de política neuronal para robótica simulado, publicado por el usuario djduecaster en Hugging Face dentro del contexto del banco de pruebas "microduck-arena". No se trata de un modelo de lenguaje ni de un modelo fundacional: es un policy network compacto exportado a ONNX que mapea observaciones de 61 dimensiones a acciones de 14 dimensiones a 50 Hz, pensado para control de agentes en un simulador propietario. El repositorio no contiene pesos en safetensors ni documentación de entrenamiento más allá de las notas de la model card.

La variante concreta aplica una atenuación de la tasa de acción dependiente de la observación, con ganancia 0,15 y un límite de recorte de 0,25 radianes. Según la model card, fue seleccionada como la mejor variante no publicada restante en una criba independiente de 64 arranques (53/64 terminados), antes de ver su diagnóstico oficial. El autor declara explícitamente que no reclama mejoras de fiabilidad ni de velocidad en heldout.

Su relevancia es muy limitada fuera del entorno de competición para el que se creó: no hay benchmarks públicos, no hay licencia declarada, el tamaño del repo es de 0,0 GB (solo el grafo ONNX y metadatos) y la evaluación reportada es una simulación local en Apple Silicon, no una aceptación alojada. La ficha se limita a documentar lo que el autor declara, marcando como "no disponible" todo lo que no consta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política (policy network) exportada a ONNX; topología interna no detallada |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (entrada fija obs[1,61]) |
| Tipos de cuantizacion | no disponible; el artefacto publicado es Float32 |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible; el autor declara que "no se afirma una licencia modelo global nueva" |
| Formato de pesos | ONNX (Float32), entrada obs[1,61], salida actions[1,14] |
| Frecuencia de control | 50 Hz |
| SHA256 del modelo | c371e74e19abde87f0e7ef66e25bca63fa099b8e6ee460bf9a5a7024b7fb1095 |
| Revisión de código fuente | 9bf04c0668145528035c8a315d5d8ae2530c1279 (runner versión 5) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna de la red (número de capas, dimensión oculta, tipo de activaciones ni esquema de entrenamiento). Lo único verificable es la interfaz del grafo ONNX: una entrada de observación de forma [1,61] y una salida de acciones de forma [1,14], ejecutada a 50 Hz. El autor indica que la política neuronal es heredada de un modelo base upstream y que los créditos de los contribuyentes permanecen en `upstream-base-card.md`, sin que ese documento se incluya en la información proporcionada.

El cambio respecto al padre no es solo de metadatos: según la model card, las acciones dependientes de la observación difieren realmente de las del modelo padre. La variante aplica una atenuación de la tasa de acción con ganancia 0,15 y recorte a 0,25 radianes. El balance y el acoplamiento derivan del controlador de tasa de acción del 10 de noviembre (SHA256 728a09971bb20201ae02039c929cdb54d7ac80a709f0a77c694e1b4548a17fb5), y la tasa de acción "tight" deriva de su padre (SHA256 1b879832d77d1208bc988defcd5f034b1fbedcd090ac51aa5d0c16a88ec94371). No se documentan tokens de entrenamiento, composición del dataset, RLHF, DPO ni ninguna innovación de decodificación.

## Capacidades

- Control de agente en simulación: produce comandos de acción de 14 dimensiones a partir de observaciones de 61 dimensiones a 50 Hz.
- Atenuación de la tasa de acción dependiente de la observación, con ganancia 0,15 y límite de recorte de 0,25 radianes.
- Inferencia restringida a observaciones permitidas: el autor afirma que no usa reloj, reconocimiento de semilla, estado oculto externo, datos de competidores ni estado privilegiado del simulador.
- Verificación de integridad: el chequeo de ONNX y las comprobaciones de salidas finitas pasaron según la model card.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, código, matemáticas, visión, audio ni capacidades multilingües.

## Casos de uso

- Evaluación en el banco microduck-arena: ejecutar el grafo ONNX con el runner versión 5 contra el evaluador oficial local para reproducir el resultado declarado de 10,783 s, 4/5 terminaciones y comando 0,85. Es el uso previsto y el único documentado.
- Criba comparativa de variantes de política: servir como una de las 64 variantes de la pantalla independiente original (53/64 terminaciones) para comparar el efecto del recorte de tasa de acción frente a sus padres.
- Análisis de ablación del controlador de tasa: al derivar de un SHA256 concreto del controlador del 10 de noviembre, permite aislar el efecto de la ganancia 0,15 y del recorte de 0,25 radianes manteniendo el resto de la política fija.
- Integración en pipelines de simulación locales: al ser un ONNX Float32 de entrada y salida fijas, se puede cargar con onnxruntime en un script de evaluación por lotes sin dependencias de framework pesado.
- Reproducibilidad y auditoría de artefactos: el SHA256 del modelo y la revisión del código fuente permiten verificar que el binario evaluado es exactamente el publicado.
- Docencia o experimentación con políticas de control: útil como ejemplo mínimo de política neuronal con interfaz ONNX bien definida para estudiar atenuación de acciones dependiente de estado, siempre en simulación.

## Benchmarks y rendimiento

Los únicos datos reportados por el autor son de su evaluador oficial local en simulación sobre Apple Silicon, no de una aceptación alojada:

| Metrica | Valor declarado |
|---|---|
| Tiempo de evaluacion local | 10,783 s |
| Terminaciones | 4/5 |
| Comando | 0,85 |
| Criba independiente de 64 arranques | 53/64 terminaciones |
| Diagnostico oficial local | 4/5 (el run fallido se incluye en la puntuacion) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible, y no serían aplicables a este artefacto. El autor advierte que no reclama mejoras de fiabilidad ni de velocidad en heldout, que la elegibilidad por duplicados y los puntos no están garantizados y que este resultado no sustituye su mejor marca personal existente.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 0,0 GB y el grafo es Float32 con entrada [1,61] y salida [1,14], por lo que la huella debería ser de kilobytes a pocos megabytes, pero no se confirma en la información.
- GPU recomendadas: no disponibles; el autor solo reporta ejecución en simulación local sobre Apple Silicon.
- Compatibilidad con GPU de consumo: previsiblemente sí por tamaño, pero no está verificado ni documentado.
- Opciones de despliegue: ONNX Runtime es el runtime implícito del formato; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles; solo consta la frecuencia de control de 50 Hz y el tiempo total de la evaluación local (10,783 s), no la latencia por paso.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros artefactos de la familia microduck-arena con sus especificaciones, y los resultados de búsqueda web recibidos corresponden a periféricos de gaming (FIERCE GAMING GEAR / MADLIONS), sin relación con este modelo. Los únicos parientes citados son los padres por SHA256 (controlador de tasa de acción del 10 de noviembre y variante "tight" padre), de los que no se dan parámetros, contexto ni rendimiento comparables.

## Limitaciones y advertencias

- Solo simulación: el autor declara explícitamente que no se afirma seguridad para robots físicos.
- Evaluación no alojada: el 10,783 s y el 4/5 son una simulación local en Apple Silicon, no una aceptación oficial; la elegibilidad por duplicados y los puntos no están garantizados.
- Resultado flojo en el diagnóstico oficial: 4/5 terminaciones, con el run fallido incluido en la puntuación, y sin reclamación de mejora en heldout.
- Licencia ausente: no se afirma una licencia modelo global nueva, por lo que el uso comercial queda sin marco legal claro.
- Procedencia heredada: la política neuronal y los créditos provienen de un modelo base upstream cuyo contenido no está en la información disponible.
- Verificación incompleta: el chequeo de ONNX y las comprobaciones de salidas finitas pasaron, pero no se ejecutó el pytest completo del upstream.
- Sin datos de sesgo ni de alucinación aplicables (no es un modelo de lenguaje), pero tampoco hay análisis de robustez frente a distribuciones de observación fuera de las del simulador.
- Sin idiomas, contexto ni tool calling: no debe evaluarse con los criterios habituales de un LLM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/djduecaster/dfreq-sprint-action-rate-tight-20261114
- Resultados de búsqueda web recibidos (sin relación con el modelo, periféricos de gaming): https://hub.f.gg/ y https://f.gg/
- Paper, blog, repositorio o demo del modelo: no disponible en la información proporcionada.

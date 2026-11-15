# Imok282/lunar-rover-driver-v2

## Resumen

Lunar Rover Driver v2 es una política de conducción para un rover lunar entrenada mediante imitación con DAgger sobre la red `DriverFormer`, desarrollada por el autor Imok282 en el marco del proyecto Adinfinitium, surgido del evento NASA Space Apps 2026 (proyecto *Lunar Landing Site Navigator*). El modelo resuelve la tarea de navegar un rover por el polo sur lunar a partir de modelos digitales de elevación LOLA de 5 m, y se publica explícitamente como resultado negativo: no alcanzó los criterios de éxito preregistrados.

La red tiene 11.377.354 parámetros, con una arquitectura `DriverFormer` de dimensión 384, 6 capas, 8 cabezas de atención, crop de 64 y stem de 64. Se entrenó con imitación DAgger a partir de seis variantes de planificador, sobre 32 mundos de entrenamiento, 105 episodios y 14.605 pasos, en 110 minutos. El checkpoint resultante (`rover_driver_v2.pt`, 45.543.277 bytes) está marcado como obsoleto y sustituido por el planificador scriptado `lunar-rover-brain` (v3 / v3.1).

Su relevancia es fundamentalmente metodológica: documenta de forma transparente un fallo de generalización en un dominio de simulación con datos de elevación reales, con evaluación sobre 8 mundos retenidos y congelación de pesos por SHA-256 antes de la evaluación. No es un modelo de lenguaje ni un modelo fundacional; es una política de reinforcement learning / imitación para control de rover, y no debe usarse para planificación ni navegación real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `DriverFormer` (d 384, layers 6, heads 8, crop 64, stem 64) |
| Parametros totales | 11.377.354 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de control, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoint PyTorch (`rover_driver_v2.pt`, 45.543.277 bytes) |

## Arquitectura y entrenamiento

`DriverFormer` es una red neuronal específica para la tarea, descrita en la model card con los hiperparámetros d 384, 6 capas, 8 cabezas, crop 64 y stem 64. No se especifica en la información disponible si se trata de un transformer puro, un híbrido o una CNN con atención; la nomenclatura sugiere un transformer aplicado a recortes (crops) del terreno, pero la model card no detalla la composición interna ni el mecanismo de atención.

El entrenamiento es por imitación con DAgger a partir de seis variantes de planificador, sobre 32 mundos de entrenamiento, con 105 episodios y 14.605 pasos en 110 minutos. La selección del checkpoint se hizo sobre el sitio de validación Site11 (candidato 6 de 9). Los datos de terreno proceden de modelos digitales de elevación LOLA de 5 m del polo sur lunar. No se documenta uso de RLHF, DPO ni ninguna innovación de decodificación; el fallo se atribuye a memorización de rutas y a un sesgo del conjunto de entrenamiento (Site04 está un 99,5 % por encima del límite de pendiente y no aporta señal útil).

## Capacidades

- Control de navegación de un rover lunar en simulación, a partir de observaciones derivadas de modelos de elevación LOLA de 5 m.
- Predicción de acciones de conducción por imitación de planificadores scriptados (seis variantes).
- Generalización limitada: coincide con el planificador en el 86-93 % de los pasos del tramo de retorno en terreno entrenado, pero solo en el 15-26 % en terreno no visto.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente en el sentido de modelos de lenguaje.
- No tiene capacidades multilingües, de visión general, audio ni modo de pensamiento.
- No dispone de API conversacional ni de generación de texto.

## Casos de uso

- Registro de resultados negativos en investigación: sirve como referencia reproducible de un fallo de generalización en imitación con DAgger, con pesos congelados por SHA-256 y evaluación única sobre sitios retenidos.
- Estudio de sobreajuste a rutas: permite analizar la divergencia entre el 86-93 % de acuerdo con el planificador en terreno entrenado y el 15-26 % en terreno no visto.
- Auditoría de pipelines de selección de checkpoint: documenta cómo un sitio de validación fácil (Site11) puede llevar a elegir un candidato que falla en evaluación retenida.
- Análisis de sesgos en datos de entrenamiento: el caso de Site04 (99,5 % por encima del límite de pendiente) ilustra cómo un mundo de entrenamiento mal caracterizado degrada el aprendizaje.
- Docencia en robótica y aprendizaje por imitación: ejemplo práctico de DAgger, congelación de modelos y evaluación preregistrada en un dominio espacial simulado.
- Reproducción de experimentos: el repositorio de handoff incluye código fuente, registros completos y valores SHA-256 de los checkpoints para replicar la evaluación.
- No debe emplearse para planificación, navegación, decisiones de aterrizaje ni operaciones de vuelo.

## Benchmarks y rendimiento

Resultados en simulación sobre 8 mundos retenidos, según la model card:

| Metrica | Esta politica | Planificador naive |
|---|---|---|
| Alcanzo el hielo | 7,4 % | 19,6 % |
| Regreso exitoso | 1,2 % | 9,3 % |
| Muerte del rover | 95,3 % | 86,8 % |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible; no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 11,4 M de parámetros el checkpoint en FP32 ocupa aproximadamente 45,5 MB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican; cualquier GPU con soporte PyTorch es suficiente por tamaño.
- Cabe en GPU consumer: sí, por el reducido número de parámetros; no se detalla compatibilidad con modelos concretos.
- Opciones de despliegue: PyTorch con el checkpoint `rover_driver_v2.pt`; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Estado |
|---|---|---|---|---|---|
| Lunar Rover Driver v2 (este) | 11.377.354 | no disponible | 7,4 % hielo / 1,2 % regreso / 95,3 % muerte | Apache 2.0 | Obsoleto |
| lunar-rover-brain (v3 / v3.1) | no disponible | no disponible | no disponible | no disponible | Planificador scriptado, sucesor declarado |
| Planificador naive (baseline del proyecto) | no disponible | no disponible | 19,6 % hielo / 9,3 % regreso / 86,8 % muerte | no disponible | Baseline de comparación |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo marcado como obsoleto por el propio autor: no alcanzó los criterios de éxito preregistrados y está sustituido por `lunar-rover-brain` (v3 / v3.1).
- Memorización de rutas: alto acuerdo con el planificador en terreno entrenado (86-93 %) y muy bajo en terreno no visto (15-26 %).
- Sesgo del conjunto de entrenamiento: Site04 está un 99,5 % por encima del límite de pendiente y no aporta señal de aprendizaje útil; la validación en Site11 resultó demasiado fácil.
- Tasa de muerte del rover del 95,3 % en los 8 mundos retenidos, superior incluso al planificador naive.
- Todos los números proceden de simulación y de sitios retenidos, no de rendimiento en misión real.
- Prohibido su uso para vuelo, decisiones de aterrizaje safety-critical u operaciones reales; uso exclusivamente investigador y educativo.
- Licencia Apache 2.0 permite uso comercial según los términos de la licencia, pero las advertencias del autor restringen el uso operacional y de seguridad.
- No hay información sobre sesgos demográficos ni lingüísticos (no aplica), ni sobre idiomas soportados.
- No se documentan límites de contexto ni cuantizaciones disponibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Imok282/lunar-rover-driver-v2
- Modelo sucesor (planificador scriptado): https://huggingface.co/Imok282/lunar-rover-brain
- Repositorio de handoff, código y registros: https://github.com/oasisk/adinfinitium-handoff
- Resultado de búsqueda no relacionado (herramienta de aim assist para PC): https://gannonr.com/

# Remek/basal-omni-2.0-mini-preview-GGUF

## Resumen

basal-omni-2.0-mini-preview es un modelo experimental de decisión tipada (typed decisions) desarrollado por Remek, construido sobre una base Gemma 4 E4B. No es un modelo generativo al uso: está diseñado para leer un estado y emitir una decisión clasificatoria con probabilidades calibradas, orientado a tareas de choice, sí/no y clasificación con umbrales de error controlados. El repositorio que nos ocupa es el port a GGUF (Q8_0 y Q6_K) para llama.cpp, LM Studio y Ollama, y el propio autor lo marca explícitamente como no recomendado para uso en producción.

La razón de esa advertencia es arquitectónica: el modelo original se sirve con el motor basal leyendo el estado en dos direcciones (two-way), mientras que llama.cpp lee un GGUF en una sola dirección (izquierda a derecha). Ese cambio de lectura degrada el rendimiento de forma medible: la precisión en decisiones en polaco cae de 0,951 a 0,843 y en el panel externo en inglés de 0,811 a 0,762. La cuantización en sí apenas introduce pérdida (Q8_0 coincide con la lectura one-way en bf16 en el 99,0% de las decisiones), pero el modo de lectura sí.

El modelo tiene 7.463.013.674 parámetros y soporta polaco e inglés. Se distribuye bajo licencia Apache 2.0. Su interés actual es más documental que práctico: sirve como caso de estudio de cómo una decisión de diseño en el motor de inferencia (lectura bidireccional) condiciona la viabilidad de un port a ecosistemas estándar como llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer sobre base Gemma 4 E4B (lectura bidireccional en el modelo original; unidireccional en este port GGUF) |
| Parametros totales | 7.463.013.674 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 y Q6_K |
| Idiomas soportados | pl (polaco), en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 28,3 GB); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre Gemma 4 E4B, un transformer de aproximadamente 7,46 mil millones de parámetros. La innovación clave no está en la arquitectura de la red sino en el protocolo de inferencia: el modelo original se sirve con el motor basal (versión 2.8.0), que lee el estado de entrada en dos direcciones antes de responder. Esa lectura bidireccional es la que produce las probabilidades calibradas y los umbrales de cobertura que el autor reporta en la model card principal.

El port GGUF rompe ese contrato: llama.cpp solo puede leer el archivo en una dirección, de izquierda a derecha. Por eso los archivos de este repositorio ejecutan los mismos pesos que un modelo más débil. El autor midió el efecto con el motor basal 2.8.0 en una NVIDIA H100, en modo eager y bf16, con un único orden de opciones: la lectura one-way rinde entre 0,05 y 0,10 puntos menos según el benchmark. No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Emisión de decisiones tipadas: choice (selección entre opciones), preguntas de sí/no y clasificación.
- Salida de probabilidades calibradas, pensadas para aplicar umbrales de error controlados.
- Soporte de metadatos de decisión en los archivos `-decision`: plantilla de prompt de basal y temperaturas one-way de `CALIBRATION.gguf.json`.
- Respuesta a `POST /v1/systemone` directamente desde llama.cpp, sin necesidad del motor basal.
- Capacidades multilingües limitadas a polaco e inglés.
- Solo texto: los codificadores de imagen y audio no están incluidos en los archivos GGUF.
- No se documentan tool calling, function calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Clasificación documental en polaco: el modelo puede etiquetar documentos reales con probabilidades calibradas; el autor reporta 0,953 en el conjunto PL-Real de 300 documentos polacos reales en lectura one-way, lo que lo hace adecuado para triaje con revisión humana.
- Filtrado de contenido con umbral de error: útil para decidir automáticamente solo los casos de alta confianza y derivar el resto; conviene validar los umbrales sobre datos propios porque los del port no alcanzan sus objetivos.
- Enrutamiento de consultas en inglés: con 0,669 en el corpus EN y 0,762 en el panel externo, sirve para clasificar tickets o consultas antes de derivarlas a un modelo generativo mayor.
- Evaluación comparativa de motores de inferencia: como caso de estudio reproducible de la diferencia entre lectura bidireccional y unidireccional en el mismo conjunto de pesos.
- Prototipado local en LM Studio u Ollama: los archivos Q8_0 y Q6_K permiten experimentar con el modelo en estaciones de trabajo sin depender del motor basal.
- Investigación sobre calibración: el repositorio documenta con detalle el desajuste entre umbrales calibrados en two-way y su aplicación en one-way, material útil para estudiar transferencia de calibración entre modos de lectura.

## Benchmarks y rendimiento

Resultados medidos con el motor basal 2.8.0 en una NVIDIA H100, modo eager, bf16, un único orden de opciones:

| Benchmark | Dos vías (repo principal) | Una vía (lectura de este port) | Misma respuesta top |
|---|---|---|---|
| PL decisions (test held-out, 7.081 ítems) | 0,951 | 0,843 | 85,5% |
| PL general (conocimiento, exámenes, lectura; 3.079 ítems) | 0,767 | 0,758 | 84,5% |
| PL-Real (300 documentos polacos reales) | 0,960 | 0,953 | 96,0% |
| EN corpus test (1.479 ítems) | 0,692 | 0,669 | 83,3% |
| EN external panel (10 tareas públicas en inglés, 3.842 ítems) | 0,811 | 0,762 | 84,5% |

Medición de los archivos GGUF sobre 8.560 decisiones held-out:

| Lectura | Precisión | Igual a dos vías (bf16) | Igual a una vía (bf16) |
|---|---|---|---|
| Dos vías, motor basal, bf16 (repo principal) | 0,907 | – | 85,2% |
| Una vía, motor basal, bf16 | 0,812 | 85,2% | – |
| Una vía, Q8_0 (llama.cpp) | 0,808 | 85,0% | 99,0% |
| Una vía, Q6_K (llama.cpp) | 0,810 | 84,5% | 97,8% |

## Requisitos de hardware

- VRAM estimada: el autor indica que los pesos ocupan aproximadamente 16 GB en bf16; los archivos GGUF Q8_0 y Q6_K ocupan menos, aunque el repositorio completo pesa 28,3 GB.
- GPU recomendadas: el autor validó el modelo original en una NVIDIA H100. Para el port GGUF, cualquier GPU con suficiente VRAM para el archivo cuantizado.
- GPU de consumo: no se especifica compatibilidad con RTX 4090 u otras tarjetas consumer en la información disponible.
- Despliegue: llama.cpp (llama-server), LM Studio y Ollama para los archivos GGUF; el modelo original requiere el motor basal con `--mode fast` (CUDA graphs) o `--mode eager` (PyTorch, bf16) en NVIDIA, y `--mode eager --device mps` en Apple Silicon.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| basal-omni-2.0-mini-preview (este, GGUF) | 7,46 B | no disponible | Decisión tipada, one-way | Apache 2.0 | GGUF en HF |
| basal-omni-2.0-mini-preview (repo principal) | 7,46 B | no disponible | Decisión tipada, two-way | Apache 2.0 | Safetensors + motor basal |
| basal-omni-2.0-mini-preview-MLX | no disponible | no disponible | Decisión tipada, MLX | Apache 2.0 | MLX en HF |

No se dispone de información sobre modelos comparables de otros autores en la documentación proporcionada.

## Limitaciones y advertencias

- El propio autor marca el repositorio como experimental y no recomendado para uso en producción.
- La lectura unidireccional degrada el rendimiento entre 0,05 y 0,10 puntos según el benchmark respecto al modelo original.
- Los umbrales de automatización del port no alcanzan sus objetivos: al 1% objetivo deciden automáticamente el 30,1% de las decisiones con un 1,24% de error observado (1,68% en preguntas de tipo choice).
- `CALIBRATION.gguf.json` solo contiene temperaturas one-way, por lo que `max_error` deriva todas las decisiones.
- El `CALIBRATION.json` del modelo original no está en este repositorio: fue ajustado con lecturas two-way y no es válido para one-way. Aplicado de todos modos, sus umbrales al 1% deciden el 38,1% con un 4,2% de error observado, y los del 5% el 78,6% con un 11,4% de error.
- Solo texto: sin codificadores de imagen ni audio en los archivos GGUF.
- Idiomas limitados a polaco e inglés.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- El soporte two-way exacto en llama.cpp requiere un cambio upstream sin fecha; en MLX está planificado para una versión futura de basal, también sin fecha.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Remek/basal-omni-2.0-mini-preview-GGUF
- Modelo base: https://huggingface.co/Remek/basal-omni-2.0-mini-preview
- Versión MLX: https://huggingface.co/Remek/basal-omni-2.0-mini-preview-MLX
- Motor de inferencia basal: https://github.com/rkinas/basal
- Sitio web del proyecto: https://basal.si5.pl/

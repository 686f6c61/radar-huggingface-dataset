# macmacmacmac/Sev-4B

## Resumen

Sev-4B es un adaptador LoRA junto con una cabeza de decisión (pointer head) entrenado sobre el modelo base Qwen3.5-4B-Base, desarrollado por el usuario macmacmacmac dentro de la iniciativa de investigación Sev. Su propósito no es la generación de texto, sino clasificar ventanas ordenadas de observaciones como autoría humana, script fijo o política de agente. Se presenta explícitamente como una línea base exploratoria y no como un detector funcional: el propio autor indica que el checkpoint predice "humano" en casi todas las ventanas.

La relevancia de esta publicación es metodológica más que de rendimiento. El autor libera el checkpoint, las entradas sintéticas, el generador y la evidencia asociada para que otros investigadores puedan reproducir y mejorar el resultado. Los números publicados sitúan la precisión IID en el 34,03 % frente a un 33,33 % de azar, con un recall de agente del 1,04 %, lo que en la práctica implica que el modelo apenas discrimina entre clases.

Técnicamente se trata de un adaptador de rango 16 sobre un backbone transformer decoder de aproximadamente 4.000 millones de parámetros, acompañado de una cabeza de decisión de 256 dimensiones y un parámetro de temperatura de calibración fijado en 2,0. El entrenamiento se realizó en una única NVIDIA H100 de 80 GB, con una sola época, learning rate de 1e-5 y 738.327 tokens de avance, sobre un corpus de 2.094 ventanas conductuales y 240 registros de reglas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA adapter + cabeza de decisión (256 dimensiones) sobre transformer decoder Qwen3.5-4B-Base |
| Parametros totales | Aproximadamente 4.000 millones en el modelo base; el adaptador LoRA tiene rango 16 (tamano de repo 0,2 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento utilizo ventanas con limite de estado de 384 tokens; mas alla de ese limite la precision no esta probada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) y head.pt (cabeza de decision) |

## Arquitectura y entrenamiento

El modelo es un adaptador PEFT sobre el backbone Qwen/Qwen3.5-4B-Base (commit 1001bb4d826a52d1f399e183466143f4da7b741b), inicializado por warm start desde jaredpalmer/kev-4b. La arquitectura combina el adaptador LoRA (rango 16 sobre todos los targets) con una cabeza de decisión de 256 dimensiones que puntúa opciones suministradas en lugar de generar texto. Es importante señalar que cargar únicamente el adaptador LoRA en un pipeline de generación de texto omite la cabeza de decisión y, por tanto, no reproduce el comportamiento del modelo; se requiere el runtime Sev/Kev.

El entrenamiento corresponde a la ejecución sev-r2-research-4b-v1/00-trial-0, con 1 época y semilla 4, learning rate 1e-5, batch de 4 con acumulación de 2, precisión fp32 en pesos congelados, autocast bf16 y gradient checkpointing. Se realizaron 292 actualizaciones sobre 738.327 tokens de avance. El corpus de entrada consistió en 2.094 ventanas conductuales de autoría propia y 240 registros de reglas Kev, con 2.334 solicitudes vistas y cero rechazadas o truncadas. Todo el entrenamiento se ejecutó en una única NVIDIA H100 de 80 GB. El manifiesto del conjunto de entrenamiento tiene hash SHA-256 372d8709cce5fc50262afc5107cd4b3637614ff2b2a7e84a8ccfa4293a4b21c5. No se emplearon capturas telefónicas privadas, registros URLQuery, datos sintéticos empresariales retirados ni trazas ejecutadas de LLM.

## Capacidades

- Clasificación de ventanas de observación ordenadas en tres categorías: humano, script fijo y política de agente.
- Puntuación de opciones suministradas sin generar texto libre (decision model).
- Calibración de probabilidades mediante temperatura (valor publicado de 2,0 sobre la cabeza head.pt).
- Ejecución en modo servidor a través del runtime Sev/Kev (comando `uv run python -m kev.serve`).
- Reproducibilidad experimental: incluye configuración completa de entrenamiento, métricas, log y hashes de fuentes.
- No soporta generación de texto, tool calling, agentes multi-step, visión, audio ni capacidades multilingües más allá del inglés.

## Casos de uso

- Reproducción de investigación en detección de agentes: el paquete incluye entradas sintéticas, generador y evidencia, de modo que un equipo puede replicar la línea base con `kev.experiment` o `modal_app.py::study` y partir de un resultado conocido.
- Análisis metodológico de calibración: los ficheros calibration.json y calibration-sources.json permiten estudiar cómo se comporta la temperatura ajustada en ventanas de validación agrupadas por escenarios.
- Benchmarking de técnicas de clasificación conductual: sirve como punto de comparación (34,03 % IID frente a 33,33 % de azar) para medir si una propuesta alternativa mejora realmente la discriminación.
- Estudio de fallos en detectores de autoría: con un recall de agente del 1,04 % y un recall de script del 2,08 %, es un caso útil para analizar sesgos de predicción hacia la clase mayoritaria.
- Integración en pipelines de investigación de ciberseguridad: mediante el runtime Sev/Kev expuesto en el puerto 8009, se pueden enviar observaciones de desarrollo (sin objetivo ni metadatos de auditoría) y recoger probabilidades para su análisis.
- Docencia y formación en evaluación rigurosa: ilustra por qué una mejora de 0,69 puntos porcentuales con intervalo de confianza del 95 % entre 0,00 y 1,74 no constituye evidencia de discriminación útil.
- Referencia para el desarrollo de sucesores: al liberar el adaptador y la cabeza junto con el plan de entrenamiento registrado, permite iterar sobre una base congelada y documentar mejoras de forma trazable.

## Benchmarks y rendimiento

| Panel de observación completa | Precision | Precision del padre | Recall humano | Recall script | Recall agente |
|---|---:|---:|---:|---:|---:|
| Desarrollo IID | 34,03 % | 33,33 % | 98,96 % | 2,08 % | 1,04 % |
| Tareas reservadas y cambio de politica | 33,85 % | 33,59 % | 98,18 % | 3,39 % | 0,00 % |

| Panel de observación completa | NLL bruto | NLL con temperatura enviada | ECE bruto | ECE con temperatura enviada |
|---|---:|---:|---:|---:|
| Desarrollo IID | 1,1142 | 1,0998 | 0,0658 | 0,0291 |
| Tareas reservadas y cambio de politica | 1,1021 | 1,0975 | 0,0677 | 0,0392 |

Contexto de estos resultados: cada panel contiene 96 episodios de 32 grupos de escenarios emparejados; el panel IID tiene 196 ventanas de observación completa y el desplazado 279. Las predicciones uniformes de tres clases tendrían un NLL de 1,0986. La ganancia IID sobre el modelo padre es de 0,69 puntos porcentuales, con un intervalo del 95 % de 0,00 a 1,74 puntos sobre 1.000 remuestreos. Los paneles de desarrollo no son una confirmación intacta, y la suite de test final (`test.jsonl`) está vacía. La calibración enviada (temperatura 2,0) se ajustó sobre 182 ventanas de calibración de 96 episodios y 32 grupos de escenarios; la ECE ponderada por episodio es de 0,0655 en bruto y 0,0616 fuera de pliegue.

## Requisitos de hardware

- Entrenamiento publicado: una única NVIDIA H100 de 80 GB (dato del autor).
- VRAM estimada para inferencia: no disponible como dato publicado. Para un backbone de aproximadamente 4.000 millones de parámetros más una cabeza de 256 dimensiones, las estimaciones habituales se sitúan en torno a 8-10 GB en fp16/bf16 y bastante menos con cuantización de 4 bits, pero estas cifras no proceden de la model card.
- GPU recomendadas: el autor solo documenta la H100 para entrenamiento; para inferencia no se especifican GPU concretas.
- Compatibilidad con GPU de consumo: no confirmada por el autor; por tamano del backbone cabria esperar ejecución en GPU de consumo con VRAM suficiente, pero no hay validación publicada.
- Opciones de despliegue: el modelo no se despliega con vLLM, llama.cpp, Ollama ni TGI de forma directa, ya que requiere el runtime Sev/Kev (repositorio github.com/maceip/Sev, comando `uv run python -m kev.serve`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de modelos comparables directos en la información proporcionada. El único punto de referencia documentado es el modelo padre, sobre el que se mide la mejora.

| Modelo | Precision IID | Recall agente | Licencia | Notas |
|---|---:|---:|---|---|
| Sev-4B | 34,03 % | 1,04 % | Apache-2.0 | Continuacion investigadora; `promotable=false` en el recibo original del ensayo |
| Kev-4B (padre, jaredpalmer/kev-4b) | 33,33 % (azar) | No disponible | Apache-2.0 | Checkpoint congelado usado como warm start y como referencia de comparacion |

## Limitaciones y advertencias

- El propio autor declara que el checkpoint "predice humano en casi cada ventana" y que "no ha demostrado una deteccion util de agentes".
- Recall de agente del 1,04 % en IID y del 0,00 % en el panel desplazado: el modelo falla sistematicamente en la clase de interés.
- La precision IID de 34,03 % frente a 33,33 % de azar implica una capacidad de discriminacion practicamente nula.
- Las etiquetas identifican políticas de autoría en un único simulador pequeño; no hay humanos capturados, ejecuciones de LLM en vivo, relojes de navegador medidos ni capturas de red en el corpus.
- Las probabilidades y el campo derivado `confidence` deben tratarse como salidas de investigación, nunca como evidencia de la identidad de una persona o de un agente.
- La implementación de servicio permite entradas más largas que las usadas en entrenamiento; la precision más alla del limite de estado de 384 tokens no está probada.
- No existe una evaluacion de retencion de tareas generales para esta continuacion.
- Los paneles de desarrollo ya informaron investigación previa y no constituyen una confirmación intacta; la prueba final nativa sigue sin puntuar y `test.jsonl` está vacío.
- El indicador `promotable=false` del recibo original del ensayo permanece sin cambios.
- La temperatura enviada (2,0) se ajustó sobre un conjunto limitado de 182 ventanas; una ECE baja cercana al azar no es evidencia de un detector eficaz.
- Licencia Apache-2.0: permite uso comercial segun los terminos de dicha licencia, pero el autor orienta el artefacto a investigación y advierte de su limitada utilidad.
- El modelo solo maneja inglés.
- Cargar el adaptador LoRA en un pipeline de generacion de texto omite la cabeza de decision; sin el runtime Sev/Kev no se obtiene el comportamiento previsto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/macmacmacmac/Sev-4B
- Repositorio del runtime Sev/Kev: https://github.com/maceip/Sev
- Plan de experimento registrado: https://github.com/maceip/Sev/blob/main/experiments/sev-research-4b-v1.json
- Ejemplo del repositorio ("try it"): https://github.com/maceip/Sev#try-it
- Dataset de investigación conductual: https://huggingface.co/macmacmacmac/Sev-behavioral-research-v1
- Perfil del autor en HuggingFace: https://huggingface.co/macmacmacmac
- Modelo base Qwen3.5-4B-Base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Checkpoint padre Kev-4B: https://huggingface.co/jaredpalmer/kev-4b

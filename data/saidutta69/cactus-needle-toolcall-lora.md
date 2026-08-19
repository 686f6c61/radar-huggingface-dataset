# saidutta69/cactus-needle-toolcall-lora

## Resumen

`cactus-needle-toolcall-lora` es un adaptador LoRA desarrollado por saidutta69 que afina el modelo base Cactus-Compute/needle2, un modelo de 45 millones de parámetros especializado en tool calling. El objetivo es mejorar la selección de herramientas en un conjunto fijo de 8 utilidades de domótica (termostato, música, alarmas, mensajes, luces, clima, calendario y cerraduras) sin necesidad de cambiar el motor de inferencia ni aumentar el tamaño del modelo. El adaptador se fusiona y exporta como un archivo `.cact` de 23 MB en cuantización 4-bit W4A8, listo para ejecutarse en el motor estándar de Cactus Needle.

La relevancia de este modelo radica en su enfoque práctico para entornos edge: permite mejorar la precisión de enrutamiento de herramientas en dispositivos con recursos limitados (Raspberry Pi, teléfonos, Apple Silicon, WebAssembly) mediante un fine-tuning ligero, sin recompilar el runtime. El autor documenta el proceso completo —generación de dataset, entrenamiento en TPU v5e-8 de Kaggle y evaluación— en un repositorio público y un informe técnico, lo que facilita la reproducibilidad y la adaptación a otros dominios.

El modelo está pensado para desarrolladores que despliegan asistentes basados en Needle con un conjunto fijo de herramientas y buscan mejorar la selección de herramientas y la extracción de argumentos sin migrar a un modelo más grande. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de 45M parámetros, tipo transformer presumiblemente, pero no especificado) |
| Parametros totales | 45M (modelo base) + adaptador LoRA (16 MB en pesos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 768 tokens (máximo usado en entrenamiento; contexto máximo del modelo base no especificado) |
| Tipos de cuantizacion | 4-bit W4A8 (Cactus Quant) en el archivo `.cact`; pesos del adaptador en float32 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.cact` (Cactus Quant), `.pkl` (adaptador LoRA), `.jsonl` (dataset) |

## Arquitectura y entrenamiento

La arquitectura interna del modelo base Cactus-Compute/needle2 no se detalla en la información proporcionada; se sabe que es un modelo de 45 millones de parámetros diseñado específicamente para tool calling, con un motor que garantiza la generación de JSON bien formado mediante una gramática a nivel de bytes compilada a partir de los esquemas de las herramientas. El fine-tuning se realiza mediante LoRA (rank 32, alpha 32) sobre este base, entrenando únicamente los pesos del adaptador mientras se mantienen congelados los del modelo original. El entrenamiento se llevó a cabo en Google TPU v5e-8 (Kaggle) durante 4 épocas, con un tamaño de lote de 8, una tasa de aprendizaje de 1e-4 y precisión float32, alcanzando una pérdida final de 0.0274.

El dataset de entrenamiento consta de 462 ejemplos generados manualmente (semilla 42) sobre las 8 herramientas de domótica, con una distribución aproximada de 70% de llamadas a herramientas y 30% de refusals (entradas fuera de tema que deben producir una llamada vacía). La innovación principal del proyecto es el flujo de trabajo: el adaptador LoRA se fusiona con el modelo base y se exporta mediante el pipeline Cactus Quant (`needle build`), produciendo un archivo `.cact` que el motor estándar carga sin modificaciones. Esto permite mejorar el comportamiento de tool calling sin necesidad de recompilar el runtime ni cambiar la infraestructura de despliegue.

## Capacidades

- Selección de herramientas: el modelo elige correctamente la herramienta adecuada entre las 8 definidas en el conjunto de domótica, superando al modelo base en los casos de prueba (16/16 frente a 14/16).
- Generación de argumentos: extrae y rellena los argumentos de cada llamada (por ejemplo, temperatura, modo, hora, destinatario) con formato correcto, aunque persisten algunas variaciones menores en valores como horas o frases.
- Refusals: rechaza entradas fuera del dominio devolviendo una llamada vacía, manteniendo el comportamiento de rechazo del modelo base.
- Integración con motor de gramática: al ejecutarse sobre el motor Cactus Needle, garantiza que el JSON generado sea sintácticamente válido según los esquemas de las herramientas.
- Despliegue en edge: el archivo `.cact` de 23 MB es compatible con plataformas como Raspberry Pi, teléfonos, Apple Silicon y WebAssembly, sin necesidad de hardware especializado.
- Extensibilidad: el dataset de entrenamiento (`our_data.jsonl`) se incluye en el repositorio y puede servir como punto de partida para adaptar el modelo a otros conjuntos de herramientas.

## Casos de uso

- Control de termostato inteligente: el modelo interpreta frases como "make it 19 degrees heat" y genera la llamada `set_thermostat` con los argumentos `temperature` y `mode`, permitiendo integrarlo en un asistente de voz o una app de domótica.
- Reproducción de música: a partir de comandos como "put on lo-fi beats", el modelo selecciona `play_music` y extrae el argumento `query`, aunque puede normalizar la frase de forma ligeramente distinta a la esperada.
- Gestión de alarmas: el modelo responde a peticiones como "set alarm for 6:30am" generando la llamada `set_alarm` con la hora normalizada (por ejemplo, `06:30`), útil en asistentes personales.
- Envío de mensajes: frases como "message Alex that dinner is ready" se enrutan correctamente a `send_message` con el destinatario y el contenido, evitando el fallo del modelo base que los enviaba a `get_weather`.
- Consulta meteorológica: el modelo atiende peticiones de clima y genera la llamada `get_weather` con los parámetros de ubicación, integrándose en paneles de control doméstico.
- Automatización de calendario: comandos como "add meeting tomorrow at 3pm" producen la llamada `add_to_calendar` con los campos de fecha y hora, mejorando la fiabilidad frente al silencio del modelo base en este caso.
- Control de iluminación y cerraduras: el modelo maneja comandos para `set_lights` y `lock_doors`, permitiendo su uso en escenarios de seguridad y confort del hogar.
- Filtrado de entradas irrelevantes: ante preguntas fuera del dominio (por ejemplo, "what's the capital of France"), el modelo devuelve una llamada vacía, evitando acciones no deseadas en el sistema.

## Benchmarks y rendimiento

El autor proporciona un benchmark con 18 casos de prueba (16 llamadas a herramientas y 2 refusals), medido de extremo a extremo con el motor estándar y con coincidencia estricta de nombre y argumentos. Los resultados son estables en 3 ejecuciones:

| Metrica | Este modelo | Needle 2 (base) |
|---|---|---|
| Nombre de herramienta seleccionado correctamente | 16/16 | 14/16 |
| Llamada completa (nombre + todos los argumentos) | 13/16 | 12/16 |
| Entrada fuera de tema rechazada (llamada vacía) | 2/2 | 2/2 |

El fine-tuning recupera las dos herramientas que el modelo base enrutaba incorrectamente (el envío de mensajes y la petición de calendario) y logra una precisión perfecta en la selección de herramientas. Las diferencias restantes en los argumentos son variaciones de formato compartidas con el base, como la extracción de `query: "lo-fi beats"` en lugar de `"lo-fi"` o la normalización de `6:30am` a `06:30`. El autor advierte que el tamaño de la muestra es pequeño (18 casos) y que la mejora principal es la selección de herramientas, no la capacidad bruta; recomienda re-evaluar con esquemas propios antes de usar en producción.

## Requisitos de hardware

- El modelo final pesa 23 MB en formato `.cact` (4-bit W4A8), por lo que cabe en cualquier dispositivo con almacenamiento mínimo.
- Inferencia en CPU: adecuada para Raspberry Pi, teléfonos móviles, Apple Silicon y WebAssembly, según la documentación del modelo base.
- VRAM estimada: no se especifica, pero al ser un modelo de 45M parámetros cuantizado a 4 bits, el uso de memoria es inferior a 100 MB, por lo que puede ejecutarse en GPUs integradas o incluso en memoria compartida.
- GPUs recomendadas: no requiere GPU dedicada; puede funcionar en CPU. Si se usa GPU, cualquier modelo con al menos 1 GB de VRAM es suficiente.
- Opciones de despliegue: el motor `cactus-needle` (versión 2.0.1) carga el archivo `.cact` directamente; también es compatible con entornos de inferencia como text-generation-inference (TGI) si se adapta el formato.
- Latencia y throughput: no se proporcionan datos numéricos, pero al ser un modelo pequeño, se espera una latencia de milisegundos en hardware moderno y de decenas de milisegundos en dispositivos edge.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos comparables en la misma categoría (tool calling en edge con ~45M parámetros). La única comparación disponible es con el modelo base Cactus-Compute/needle2, que se muestra en la tabla de benchmarks. Se recomienda consultar el repositorio del autor para posibles comparaciones futuras o evaluar contra alternativas como modelos pequeños de función calling (por ejemplo, versiones destiladas de Qwen o Llama) si se dispone de datos adicionales.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para un conjunto fijo de 8 herramientas de domótica; no es un chatbot y solo responde con llamadas a funciones, rechazando cualquier entrada que no corresponda a las herramientas declaradas.
- El benchmark de evaluación es pequeño (18 casos) y puede no reflejar el rendimiento en escenarios reales; el autor recomienda re-benchmarking con esquemas propios antes de producción.
- Existen variaciones menores en la extracción de argumentos (por ejemplo, normalización de horas o frases), que pueden requerir ajustes en el post-procesamiento.
- El modelo solo soporta inglés; no hay soporte multilingüe documentado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el motor pueden tener sus propias restricciones; se debe verificar la licencia de Cactus-Compute/needle2.
- El adaptador LoRA se distribuye en formato `.pkl` (16 MB) y el modelo fusionado en `.cact` (23 MB); no se proporcionan pesos en otros formatos como safetensors o GGUF.
- No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque el modelo no está diseñado para tareas generales de lenguaje, sino específicamente para tool calling.

## Enlaces

- [HuggingFace - saidutta69/cactus-needle-toolcall-lora](https://huggingface.co/saidutta69/cactus-needle-toolcall-lora)
- [Repositorio GitHub - instax-dutta/cactus-needle-toolcall-lora](https://github.com/instax-dutta/cactus-needle-toolcall-lora)
- [Informe técnico en GitHub Gist](https://gist.github.com/instax-dutta/14704f058eb630f6b3095faa61c5c7ac)
- [Modelo base - Cactus-Compute/needle2](https://huggingface.co/Cactus-Compute/needle2)

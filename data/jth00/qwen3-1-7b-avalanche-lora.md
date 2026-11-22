# jth00/qwen3-1.7b-avalanche-lora

## Resumen

`jth00/qwen3-1.7b-avalanche-lora` es un adaptador LoRA sobre el modelo base Qwen3-1.7B de Alibaba, desarrollado por el autor independiente jth00 (jonastheiler). Resuelve una tarea muy concreta: extraer los "problemas de aludes" descritos en los boletines de avalanchas del servicio suizo SLF y devolverlos como JSON estructurado con tipo, nivel de peligro, orientaciones y rango de altitud. El adaptador funciona en alemán, francés, italiano e inglés, y se distribuye con licencia Apache 2.0.

El interés técnico del modelo no está en su rendimiento bruto, sino en el experimento que documenta: cuántos ejemplos etiquetados necesita un modelo abierto pequeño para igualar a un LLM frontera en extracción estructurada. Con solo 1.000 boletines de entrenamiento, el adaptador alcanza un F1 de 0,612 (IC 95 %: 0,581–0,646) en la tarea de tipo + nivel de peligro, prácticamente empatado con Claude Haiku 5.5 en zero-shot (0,597) y few-shot (0,610).

Es importante subrayar que el propio autor lo etiqueta como "research only": alrededor del 40 % de los problemas predichos son incorrectos en tipo o nivel de peligro, y no debe usarse para tomar decisiones en terreno de aludes. Es, por tanto, una pieza de investigación reproducible más que un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-1.7B) con adaptador LoRA (PEFT) |
| Parametros totales | 1,7 mil millones (modelo base); adaptador LoRA de rango 16 sobre todas las proyecciones de atención y MLP |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Qwen3-1.7B) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; el autor ejecuta el base en fp16) |
| Idiomas soportados | de, fr, it, en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el base Qwen/Qwen3-1.7B |
| Tamano del repo | 0,1 GB |
| Pipeline | text-generation |
| Libreria | peft |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-1.7B, un transformer decoder-only de 1,7 mil millones de parámetros. La configuración LoRA es rango 16, alpha 32, dropout 0,05, aplicada a todas las proyecciones de atención y MLP del modelo base. El entrenamiento se realizó durante 3 épocas con AdamW, learning rate 2e-4, batch size 8 y precisión fp16 sobre una única GPU T4 (aproximadamente 40 minutos). La función de pérdida cubre únicamente la respuesta, no el prompt. El bucle de entrenamiento es PyTorch plano, disponible en `finetune.py` del repositorio del autor.

Los datos de entrenamiento son 1.000 boletines de los inviernos 23/24 y 24/25, mezclados entre idiomas. Las etiquetas son los campos estructurados que los pronosticadores del SLF publican junto a cada boletín, de modo que no fue necesario etiquetado manual. El adaptador espera un system prompt específico (denominado `CALIBRATED` en el repositorio) y se invoca con `enable_thinking=False`. La salida es un objeto JSON con la lista de problemas, cada uno con tipo, nivel de peligro, modificador, orientaciones y rango de altitud. Los tipos de problema válidos son `new_snow`, `wind_slab`, `persistent_weak_layers`, `wet_snow`, `gliding_snow` y `no_distinct_avalanche_problem`.

## Capacidades

- Extracción de información estructurada: convierte texto libre de boletines de avalanchas en JSON con campos tipados.
- Generación de JSON válido: 100 % de salidas parseables en el conjunto de test de 1.200 boletines.
- Multilingüismo limitado a cuatro idiomas: alemán, francés, italiano e inglés, con resultados aproximadamente equivalentes en los cuatro.
- Clasificación de nivel de peligro: precisión de 0,789 en la escala de peligro del SLF.
- Codificación de orientaciones (N, NE, E, NW, etc.) y rangos de altitud en metros.
- No soporta tool calling ni function calling de forma nativa más allá de la generación de JSON.
- No soporta agentes ni razonamiento multi-paso; el modo thinking se desactiva explícitamente.
- No tiene capacidades de visión ni audio.

## Casos de uso

- Extracción estructurada de boletines meteorológicos: el adaptador convierte el texto del boletín del SLF en un objeto JSON consumible por una base de datos o un panel de visualización, con un coste de 0,13 USD por cada 1.000 boletines en una T4 alquilada.
- Investigación sobre eficiencia de datos en fine-tuning: sirve como punto de referencia reproducible para estudiar cuántos ejemplos etiquetados necesita un modelo pequeño para igualar a un LLM frontera en una tarea de extracción concreta.
- Prototipado de pipelines de información-extraction en dominios especializados: el código y las particiones de datos están publicados, por lo que puede adaptarse a otros dominios con etiquetas estructuradas ya existentes (partes meteorológicos, informes de riesgo, etc.).
- Evaluación comparativa de modelos pequeños frente a APIs comerciales: el repositorio incluye todas las predicciones, lo que permite reproducir la comparación con Claude Haiku 5.5 y con reglas de palabras clave.
- Docencia y experimentación con PEFT: la configuración LoRA (r 16, alpha 32, dropout 0,05) y el bucle de entrenamiento en PyTorch plano son un ejemplo didáctico de fine-tuning eficiente en una sola GPU consumer.
- Generación de datasets sintéticos de validación: las predicciones del adaptador pueden usarse como pre-etiquetado para revisión humana en la construcción de corpus de avalanchas, dado su 100 % de validez de JSON.

## Benchmarks y rendimiento

Muestra de test: 1.200 boletines del invierno 25/26 (300 por idioma), posteriores a todos los datos de entrenamiento. Un problema predicho cuenta como correcto si coinciden tanto el tipo como el nivel de peligro.

| Modelo | F1 tipo + nivel (IC 95 %) | Nivel de peligro | JSON válido | USD por 1.000 boletines |
|---|---|---|---|---|
| Reglas de palabras clave | 0,253 (0,224–0,284) | 0,339 | 1,000 | 0 |
| Qwen3-1.7B sin fine-tuning | 0,000 | 0,000 | 0,000 | 0,23 |
| **Este adaptador (1.000 ejemplos)** | **0,612 (0,581–0,646)** | **0,789** | **1,000** | **0,13** |
| Claude Haiku 5.5, zero-shot | 0,597 (0,569–0,629) | 0,750 | 1,000 | 0,17 |
| Claude Haiku 5.5, 5-shot | 0,610 (0,580–0,640) | 0,750 | 1,000 | 0,13 |

El coste asume una T4 alquilada a 0,40 USD por hora. Los intervalos de confianza del adaptador y de Claude Haiku se solapan casi por completo, por lo que la diferencia no es significativa. Los resultados son aproximadamente iguales en los cuatro idiomas.

## Requisitos de hardware

- VRAM estimada para inferencia: el base Qwen3-1.7B en fp16 ocupa aproximadamente 3,4 GB; con el adaptador LoRA y el contexto de generación, cabe holgadamente en 8 GB.
- GPU recomendadas: el autor entrenó e infirió en una NVIDIA T4; también es viable en RTX 3060, RTX 4060, RTX 4090, A100 y H100.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 6–8 GB de VRAM en fp16; en cuantización de 4 bits cabría en GPUs de 4 GB, aunque el autor no publica una versión cuantizada.
- Opciones de despliegue: transformers + peft (flujo documentado por el autor); vLLM, llama.cpp, Ollama y TGI no están documentados para este adaptador en la información disponible.
- Latencia y throughput: no disponibles de forma explícita; el coste de 0,13 USD por 1.000 boletines en una T4 implica un throughput bajo pero suficiente para procesamiento por lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen3-1.7B + LoRA) | 1,7 B | no disponible | 0,612 | Apache 2.0 | Hugging Face, pesos abiertos |
| Claude Haiku 5.5 (zero-shot) | no disponible | no disponible | 0,597 | propietaria | API comercial |
| Claude Haiku 5.5 (5-shot) | no disponible | no disponible | 0,610 | propietaria | API comercial |
| Qwen3-1.7B sin fine-tuning | 1,7 B | no disponible | 0,000 | Apache 2.0 | Hugging Face |

La comparación relevante es con el modelo base sin adaptar (que falla por completo en la tarea, con F1 de 0,000 y 0 % de JSON válido) y con Claude Haiku 5.5, que obtiene resultados estadísticamente equivalentes a un coste por boletín ligeramente superior en zero-shot e idéntico en few-shot. Frente a las reglas de palabras clave, el adaptador más que duplica el F1 (0,612 frente a 0,253).

## Limitaciones y advertencias

- Precisión insuficiente para uso operativo: solo aproximadamente 1 de cada 10 problemas predichos es correcto en todos los campos; alrededor del 40 % falla en tipo o nivel de peligro.
- El texto del boletín a menudo no contiene la etiqueta: los pronosticadores fijan orientaciones y altitudes directamente, por lo que los valores del modelo para estos campos son en gran medida conjeturas que imitan las convenciones típicas del SLF.
- Solo probado con boletines del SLF: otros servicios de avalanchas, archivos antiguos o partes de campo pueden tener una redacción distinta y degradar el rendimiento.
- Entrenamiento con una sola ejecución sin semilla fija: una ejecución anterior con los mismos ajustes obtuvo 0,604, y los intervalos de test son de aproximadamente ±0,03.
- Riesgo de alucinación en campos estructurados: aunque el JSON es siempre válido, los valores pueden ser inventados o inconsistentes con el texto.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero el aviso del autor restringe explícitamente su uso para decisiones en terreno de aludes; los datos del SLF están bajo CC BY 4.0 y requieren atribución.
- No debe usarse como sustituto del boletín oficial en slf.ch para ninguna decisión de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jth00/qwen3-1.7b-avalanche-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio del autor (código, datos y predicciones): https://github.com/jonastheiler/avalanche-llm
- Boletines oficiales del SLF: https://www.slf.ch
- Licencia de los datos del SLF (CC BY 4.0): https://creativecommons.org/licenses/by/4.0/

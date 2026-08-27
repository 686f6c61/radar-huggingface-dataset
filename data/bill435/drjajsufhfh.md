# Bill435/Drjajsufhfh

## Resumen

El modelo **Bill435/Drjajsufhfh** es una cuantización GGUF del modelo base **DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP**, un fine-tuning de 27B parámetros basado en Qwen3.6 desarrollado por un colectivo de la comunidad (DavidAU, Nightmedia, TeichAI, armand0e y trohrbaugh). Se trata de un modelo multi-etapa que combina múltiples fine-tunes y merges, con el objetivo declarado de aumentar la inteligencia general y la capacidad de resolución de problemas sin dañar el núcleo original de Qwen. El nombre "711" hace referencia a su puntuación ARC-C, que supera el umbral de 700, una zona reservada tradicionalmente a modelos cerrados como OpenAI, Claude o Gemini.

Este repositorio contiene tanto cuantizaciones GGUF regulares como variantes MTP (multi-token prediction), todas ellas con la técnica NEO IMATRIX que mejora la precisión de los cuantizados entre un 2-4% y optimiza el rendimiento en contexto largo. El modelo está diseñado para hardware de consumo, se construyó con Unsloth y es "uncensored" (sin censura) y "abliterated" (con eliminación de rechazos). Soporta visión (pipeline image-text-to-text) y está pensado para casos de uso generales: razonamiento, codificación, escritura creativa y roleplaying.

La relevancia actual de este modelo radica en que, según su autor, es el primer fine-tune de código abierto de este tamaño que supera los 700 puntos ARC-C tanto en cuantización de 8 bits como de 4 bits, superando al Qwen3.6-27B base en 6 de 7 benchmarks y al Qwen3.6-35B-A3B en los 7. Esto lo convierte en una opción atractiva para quienes buscan un modelo de alto rendimiento en hardware asequible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.6, basado en Qwen3) |
| Parametros totales | 26.895.998.464 (26.9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (se menciona rendimiento mejorado en contexto largo, pero sin cifra concreta) |
| Tipos de cuantizacion | GGUF NEO IMATRIX (regular y MTP), incluye 4-bit y 8-bit; otras cuantizaciones adicionales disponibles |
| Idiomas soportados | en, zh (ingles y chino) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors no incluido en este repo; el modelo base en bfloat16 esta disponible en el repo de DavidAU) |

## Arquitectura y entrenamiento

El modelo base es **Qwen3.6-27B**, una evolución de la familia Qwen3 con arquitectura Transformer estándar. Sobre esta base se aplicó un proceso de **multi-stage fine-tuning** y **multi-stage merge** que combina varios fine-tunes realizados por DavidAU, con contribuciones de Nightmedia (merges y benchmarks), TeichAI (dataset Polaris), armand0e (trazas "Fable") y trohrbaugh (proceso "heretic" para eliminar censura). El entrenamiento se realizó en hardware de consumo mediante Unsloth.

Los datasets utilizados incluyen **DavidAU/Polar-STRICT-Datasets** y **DavidAU/F451-STRICT-Datasets**, además de trazas ligeras de "Fable" (armand0e), razonamiento de Claude Opus y datos GPT-5 (Polaris, no razonamiento). El objetivo declarado fue mejorar la instrucción de seguimiento y la resolución de problemas sin "benchmaxing" (optimización exclusiva para benchmarks) y sin dañar el modelo base. El proceso incluyó pruebas en Qwen3.5-9B para validar la metodología antes de aplicarla al modelo de 27B.

El resultado es un modelo que, según el autor, supera al Qwen3.6-27B base en 6 de 7 benchmarks y lo iguala en el séptimo, y supera los 7 benchmarks del Qwen3.6-35B-A3B. La cuantización NEO IMATRIX añade una mejora adicional del 2-4% en precisión, y el tensor de salida se modificó a precisión completa de 16 bits en todas las cuantizaciones.

## Capacidades

- **Generación de texto y razonamiento**: modelo de propósito general con capacidades mejoradas de razonamiento y resolución de problemas, superando en benchmarks a su base.
- **Codificación**: etiquetado como "coder", apto para generación y asistencia en programación.
- **Escritura creativa**: aunque no fue diseñado específicamente para creatividad, el modelo demuestra habilidades notables en narrativa, worldbuilding y prosa (ver ejemplo en la model card).
- **Roleplaying**: soporta interacción conversacional inmersiva, con respuestas con carácter y profundidad psicológica.
- **Visión**: pipeline image-text-to-text, lo que indica capacidad de procesar imágenes junto con texto (aunque no se detallan las capacidades exactas).
- **Tool calling / function calling**: no se menciona explícitamente, pero al ser un modelo Qwen3.6 es probable que herede esta capacidad del base.
- **Multilingüe**: soporta inglés y chino.
- **Modo thinking/reasoning**: el modelo incluye capacidades de razonamiento mejoradas, con trazas de Claude Opus y GPT-5.
- **Sin censura**: el modelo es "uncensored" y "abliterated", lo que significa que no rechaza peticiones ni aplica filtros de seguridad.

## Casos de uso

- **Asistente de codigo en produccion**: el modelo puede integrarse en entornos de desarrollo como autocompletado o asistente de programacion, aprovechando su capacidad de razonamiento y su etiqueta "coder". Su licencia Apache 2.0 permite uso comercial sin restricciones.
- **Escritura creativa y narrativa**: ideal para autores que buscan un colaborador de escritura que genere prosa visceral, dialogue con caracter y tramas complejas. El modelo puede mantener coherencia en historias largas gracias a su contexto amplio (aunque no se especifica la longitud exacta).
- **Roleplaying y juegos de texto**: su naturaleza "uncensored" y su capacidad para crear personajes con profundidad psicologica lo hacen adecuado para experiencias de roleplay inmersivas, tanto en juegos como en chatbots personalizados.
- **Razonamiento y analisis de problemas**: para tareas que requieren logica, planificacion o resolucion de problemas complejos, el modelo supera a su base en benchmarks de razonamiento, lo que lo hace util en entornos educativos o de investigacion.
- **Procesamiento de documentos con vision**: al ser image-text-to-text, puede analizar imagenes junto con texto, util para tareas como extraccion de informacion de capturas, descripcion de imagenes o asistencia visual.
- **Chatbots sin restricciones**: para desarrolladores que necesitan un modelo conversacional sin filtros de seguridad, por ejemplo en entornos de investigacion o simulacion, este modelo ofrece respuestas sin rechazos.
- **Fine-tuning adicional**: al estar basado en Qwen3.6 y tener licencia Apache 2.0, puede servir como base para nuevos fine-tunes en dominios especificos, aprovechando su alto rendimiento en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el modelo supera los 700 puntos ARC-C en 8-bit y 4-bit, y que supera al Qwen3.6-27B base en 6 de 7 benchmarks y al Qwen3.6-35B-A3B en los 7, pero no se proporcionan cifras concretas ni tablas comparativas. Se recomienda consultar el repositorio del autor para obtener datos detallados.

## Requisitos de hardware

- **VRAM estimada**: para un modelo de 27B en cuantizacion 4-bit, se necesitan aproximadamente 14-16 GB de VRAM; en 8-bit, alrededor de 27-30 GB. Las cuantizaciones mas bajas (Q3, Q2) pueden caber en GPUs con 8-10 GB.
- **GPUs recomendadas**: RTX 3090/4090 (24 GB) para 4-bit, RTX A6000 o A100 (40-80 GB) para 8-bit. En consumer, una RTX 4090 es suficiente para 4-bit.
- **Despliegue**: compatible con llama.cpp, Ollama, vLLM, TGI y otros motores que soporten GGUF. Las variantes MTP requieren soporte especifico para multi-token prediction.
- **Latencia y throughput**: no disponible. Dependera del hardware y la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | ARC-C (aprox.) | Notas |
|---|---|---|---|---|---|
| Bill435/Drjajsufhfh (este) | 26.9B | no disponible | Apache 2.0 | >700 (segun autor) | Fine-tune "uncensored" de Qwen3.6, GGUF |
| Qwen3.6-27B (base) | 27B | no disponible | Apache 2.0 | <700 (segun autor) | Modelo base, sin fine-tune |
| Qwen3.6-35B-A3B | 35B (MoE, 3B activos) | no disponible | Apache 2.0 | <700 (segun autor) | Version MoE, superada por este modelo en 7 benchmarks |
| Qwen3.5-27B | 27B | no disponible | Apache 2.0 | no disponible | Generacion anterior, superada por este modelo |

Nota: los datos de ARC-C son declaraciones del autor y no se han verificado de forma independiente.

## Limitaciones y advertencias

- **Naturaleza "uncensored"**: el modelo no aplica filtros de seguridad, por lo que puede generar contenido inapropiado, ofensivo o peligroso. No es adecuado para aplicaciones donde se requiera moderacion automatica.
- **Riesgo de alucinacion**: como cualquier LLM, puede inventar hechos o datos. Se recomienda verificacion humana en contextos criticos.
- **Idiomas limitados**: solo soporta ingles y chino; no hay garantia de buen rendimiento en otros idiomas.
- **Contexto no especificado**: no se indica la longitud de contexto exacta, lo que dificulta planificar su uso en tareas de contexto largo.
- **Dependencia de cuantizaciones**: el rendimiento puede variar significativamente entre cuantizaciones; las versiones de baja precision pueden degradar la calidad.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo base y los datasets pueden tener restricciones adicionales; se recomienda revisar las licencias de los componentes.
- **Sin garantias**: al ser un modelo de la comunidad, no hay soporte oficial ni garantias de mantenimiento.

## Enlaces

- [HuggingFace - Bill435/Drjajsufhfh](https://huggingface.co/Bill435/Drjajsufhfh)
- [Modelo base - DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP](https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-MTP)
- [Version 40B - Eleanor-DECKARD](https://huggingface.co/DavidAU/Qwen3.6-40B-Fable-Fusion-6-Core-Deckard-Eleanor-Heretic-Uncensored-NM-DAU-NEO-MAX-MTP-GGUF)
- [Version 40B - Grand Intelligence](https://huggingface.co/DavidAU/Qwen3.6-40B-Grand-Intelligence-Fable-Fusion-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF)
- [Qwen3.8-27B Cold Fusion](https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NM-DAU-NEO-MAX-MTP-GGUF)
- [Modelo 9B de prueba - Qwen3.5-9B-The-Defiant-Fable](https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF)

# openamer-max/openamer-max-phone

## Resumen

OpenAmer-Phone es un modelo de lenguaje de 3.085.938.688 parámetros (3,09B) desarrollado por openamer-max, un proyecto que construye una familia de asistentes locales segmentada por objetivo de hardware (Watch, Phone, Tab, Desktop, Pro, Ultra). Este modelo es el segundo escalón de la familia y está pensado para ejecutarse de forma totalmente offline en teléfonos inteligentes y portátiles, con un peso de 2,5 GB en cuantización Q6_K y un consumo de RAM estimado de ~3,5 GB. Deriva del modelo base Qwen/Qwen2.5-3B-Instruct mediante un ajuste fino QLoRA de 4 bits, y se distribuye bajo licencia Apache-2.0 en formato GGUF para llama.cpp y Ollama.

El modelo no busca competir en conocimiento general, sino resolver un problema concreto: ofrecer un asistente conversacional que responda con rapidez (0,08–0,5 s, ~110 tok/s en CPU), que sea honesto ante lo que no sabe y que conozca sus propios límites. Está especializado en responder preguntas sobre el producto OpenAmer a partir de contexto suministrado (RAG), en alemán y bosnio principalmente, con soporte adicional para croata, serbio e inglés. Su relevancia actual radica en que demuestra un enfoque de ajuste fino orientado a la fiabilidad y al rechazo honesto en lugar de a la cobertura enciclopédica, algo poco habitual en modelos de este tamaño.

La ficha se basa exclusivamente en la model card publicada por el autor y en los metadatos de Hugging Face. Los datos de benchmarks proceden de mediciones internas del autor sobre un conjunto congelado de 45 casos, no de evaluaciones independientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen2.5-3B-Instruct) con ajuste QLoRA |
| Parametros totales | 3.085.938.688 (3,09B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Qwen2.5-3B-Instruct; el autor no la especifica) |
| Tipos de cuantizacion | GGUF Q6_K (build publicado); otras cuantizaciones no disponibles |
| Idiomas soportados | de, bs, hr, sr, en |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp / Ollama); safetensors del base no incluidos en el repo |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen2.5-3B-Instruct, un transformer decoder-only de 3,09B parámetros, y se ajusta mediante QLoRA de 4 bits con LoRA de rango r=32 y α=64 aplicado sobre las 7 proyecciones, lo que deja 59,87 millones de parámetros entrenables (3,4 % del total). El conjunto de entrenamiento consta de 2.890 ejemplos distribuidos en 11 categorías, que incluyen las categorías del modelo Watch, texto largo y datos específicos de plataforma. No se documenta en la información disponible el número de tokens de entrenamiento ni la composición detallada del dataset más allá de esa cifra y esas categorías.

El autor no menciona el uso de RLHF ni DPO; el énfasis está en etapas de ajuste dirigidas a corregir comportamientos concretos. La model card describe explícitamente que dos fallos detectados en la prueba "fresh" (afirmar que el producto genera música y una respuesta invertida sobre soporte de Android) se corrigieron mediante etapas específicas y no añadiendo más datos. No se documentan innovaciones arquitectónicas propias como decodificación especulativa o atención lineal; el modelo es un ajuste fino del base sin cambios estructurales declarados.

## Capacidades

- Generación de texto conversacional en alemán (texto libre de dos o tres frases) y respuestas directas en bosnio.
- Respuesta a preguntas sobre el producto a partir de contexto suministrado (RAG), identificándose correctamente a sí mismo y a su origen.
- Rechazo honesto: responde "Das weiss ich nicht" ante desconocidos, comportamiento verificado en el conjunto de pruebas.
- Declaración de límites propios: sin generación de música, sin vídeo, sin telefonía, sin soporte iOS.
- Polaridad correcta en preguntas con negación (p. ej., distinguir que iOS no está soportado pero Android sí).
- Aritmética en el rango de tres dígitos de forma inmediata.
- Soporte multilingüe limitado a de, bs, hr, sr, en, con el bosnio restringido a formulaciones vistas en entrenamiento.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Asistente de producto embebido en una app móvil: el modelo responde preguntas frecuentes sobre OpenAmer usando el contexto recuperado por un pipeline RAG, con latencia de 0,08–0,5 s y ~110 tok/s en CPU, adecuada para interacción en tiempo real sin conexión.
- Atención al cliente offline en dispositivo: al ejecutarse en ~3,5 GB de RAM y con rechazo honesto ante desconocidos, puede gestionar consultas de primer nivel en un teléfono sin enviar datos a la nube.
- Demo y evaluación de asistentes locales: sirve como referencia para medir latencia y calidad en hardware de gama media, dado que el autor publica logs de prueba (`proof-*.json`) y un conjunto congelado de 45 casos.
- Filtro de derivación a humano: gracias a su comportamiento de rechazo verificado, puede clasificar consultas fuera de su ámbito y derivarlas, evitando respuestas inventadas en producción.
- Pruebas de robustez multilingüe en entornos balcánicos: cubre bosnio, croata y serbio para consultas directas con formulaciones entrenadas, útil en mercados de la región.
- Cálculo rápido en el dispositivo: aritmética de tres dígitos inmediata para tareas auxiliares en interfaces de voz o chat sin depender de servicios externos.
- Despliegue en portátiles sin GPU: el formato GGUF Q6_K y la compatibilidad con llama.cpp y Ollama permiten ejecutarlo en CPU en equipos modestos.

## Benchmarks y rendimiento

Los datos proceden de mediciones internas del autor sobre un conjunto congelado de 45 casos y sobre la build publicada, ejecutada en una RTX 5060 Laptop (8 GB). No son evaluaciones independientes.

| Prueba | Resultado |
|---|---|
| Conjunto congelado de 45 casos (producto) | 43/45 (95,6 %) |
| Conjunto congelado de 23 casos no vistos (sin contaminación) | 23/23 (100 %) |
| Precisión de tokens de respuesta, split reservado | 98,76 % |
| Prueba fresh, 12 preguntas nunca vistas en entrenamiento | 12/12 (100 %) |
| Sonda de la forma distribuida vía Ollama | 7/7 |
| Modelo base sin ajuste fino, mismo benchmark | 18/23 (+5 casos por entrenamiento) |
| Latencia | 0,08–0,5 s; ~110 tok/s en CPU |

Desglose por categorías del conjunto de 23 casos: hechos 7/7, paráfrasis 3/3, rechazos 5/5, bosnio 3/3, rechazos en bosnio 1/1, largo 1/1, corto 1/1, casos límite 2/2.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: ~3,5 GB de RAM según el autor para la build Q6_K de 2,5 GB.
- GPU recomendadas: no se especifican modelos concretos; el autor midió en una RTX 5060 Laptop (8 GB). El modelo está diseñado para CPU.
- Cabe en GPU de consumo: sí, con holgura en cualquier GPU con 4 GB o más de VRAM; también funciona íntegramente en CPU.
- Opciones de despliegue: Ollama (`ollama run amersacirovic/openamer-max-phone`), llama.cpp con el GGUF Q6_K, y API compatible con endpoints de Ollama (`/api/chat`).
- Latencia y throughput: 0,08–0,5 s por respuesta y ~110 tok/s en CPU, según medición del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| OpenAmer-Phone | 3,09B | no disponible | Apache-2.0 | Asistente de producto local, alemán/bosnio, rechazo honesto |
| Qwen2.5-3B-Instruct (base) | 3,09B | no disponible | Apache-2.0 | Asistente generalista multilingüe |
| OpenAmer-Watch (misma familia) | 0,6B | no disponible | Apache-2.0 | Asistente para smartwatch, 45/45 en el mismo conjunto |
| OpenAmer-Tab (misma familia) | 7,6B | no disponible | Apache-2.0 | Asistente para tablet, 42/45 en el mismo conjunto |

La comparación con modelos de otros autores no está disponible en la información proporcionada más allá del propio modelo base. Dentro de la familia, Phone obtiene 43/45 frente a 45/45 de Watch (0,6B) y 42/45 de Tab (7,6B) en el mismo conjunto congelado, lo que sugiere que el tamaño no correlaciona de forma monótona con el resultado en esta tarea específica.

## Limitaciones y advertencias

- Sin conocimiento general fiable: el autor documenta que ante "capital de Italia" puede responder "Génova". No debe usarse como fuente de hechos fuera del contexto suministrado.
- Sin multiplicación de cuatro dígitos: 86 × 83 da 7118 cuando lo correcto es 7138.
- Bosnio limitado a formulaciones entrenadas: las variantes no vistas degradan la calidad.
- Estilo de texto libre irregular: el contenido puede ser correcto pero la forma no ("…aus Ruckfall oder Aufregung").
- No es un chatbot para ensayos: el presupuesto de 3B implica que mejorar una habilidad penaliza otra.
- Riesgo de alucinación de capacidades del producto: la model card documenta que una versión intermedia afirmaba generar música; debe validarse en producción.
- Contexto máximo no documentado en la información disponible; conviene verificar el límite heredado de Qwen2.5-3B-Instruct antes de diseñar pipelines RAG largos.
- Licencia Apache-2.0 permite uso comercial, pero el modelo se distribuye como GGUF Q6_K sin safetensors en el repo; verificar la procedencia de los pesos antes de redistribuir.
- Los benchmarks son internos del autor sobre conjuntos propios y no han sido replicados de forma independiente; trátalos como indicativos, no como comparación neutral.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openamer-max/openamer-max-phone
- Modelo en Ollama: https://ollama.com/amersacirovic/openamer-max-phone
- Web del proyecto: https://openamer-max.github.io
- Guía de compatibilidad por dispositivo (Gerätepass): https://openamer-max.github.io/geraetepass/
- Demo en el navegador: https://openamer-max-openamer-max-demo.hf.space
- API de traducción (138 idiomas): https://openamer-max-openamer-translate.hf.space/health
- Código fuente: https://github.com/openamer-max/openamer
- Conjunto de benchmark de 45 casos: https://huggingface.co/datasets/openamer-max/openamer-max-benchmark
- Modelo Watch (escalón inferior): https://huggingface.co/openamer-max/openamer-max-watch

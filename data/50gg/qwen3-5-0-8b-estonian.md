# 50gg/Qwen3.5-0.8B-Estonian

## Resumen

Qwen3.5-0.8B-Estonian es un ajuste fino (fine-tune) del modelo base Qwen/Qwen3.5-0.8B-Base, publicado por el usuario 50gg en Hugging Face. Su objetivo es mejorar la calidad del estonio generado respecto al modelo base original, y esta especializado en la tarea de resumen de textos cortos en estonio. Se trata de un modelo de lenguaje de muy pequeno tamano, con 752.393.024 parametros reales en safetensors, lo que lo situa en la categoria de modelos desplegables en dispositivos de bajos recursos.

El modelo esta pensado para ejecutarse en local, incluso en hardware limitado como una Raspberry Pi, gracias a sus cuantizaciones GGUF de 505 MiB (Q4_K_M) y 774 MiB (Q8_0). No es un asistente general: el propio autor advierte que sus conocimientos generales y su capacidad de razonamiento son los propios de un modelo de 0,8B, y que puede cometer errores. Su valor reside en la calidad linguistica del estonio en tareas de resumen, que segun los datos del autor se aproxima a la de un modelo 44 veces mayor.

Es relevante ahora porque demuestra que un ajuste fino bien dirigido sobre un modelo diminuto puede alcanzar una calidad de redaccion en un idioma concreto comparable a la de modelos mucho mas grandes, a un coste de inferencia minimo y con licencia Apache 2.0, lo que facilita su integracion en productos y pipelines sin restricciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, tag `qwen3_5_text`) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (safetensors), Q8_0 (GGUF), Q4_K_M (GGUF) |
| Idiomas soportados | estonio (et) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B-Base, un transformer decoder-only de la familia Qwen3.5 con 752 millones de parametros. El ajuste fino se ha realizado sobre ese checkpoint base con el objetivo declarado de mejorar la calidad del estonio, especialmente en resumen de textos. La model card no detalla el volumen de datos de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; esa informacion no esta disponible.

El formato de chat es ChatML y, segun el autor, no incluye bloque de razonamiento (thinking block). Entre las innovaciones destacables figura el empaquetado en GGUF para llama.cpp, orientado a inferencia en dispositivo (on-device) y a hardware de muy bajos recursos, incluyendo Raspberry Pi con la cuantizacion Q4_K_M.

## Capacidades

- Generacion de texto en estonio con calidad linguistica mejorada respecto al modelo base.
- Resumen de textos cortos en estonio: es la tarea para la que el modelo esta optimizado.
- Parafraseo o reescritura de un texto de entrada, segun la model card.
- Conversacion basica en estonio mediante plantilla ChatML.
- Ejecucion en dispositivo (on-device) con llama.cpp y cuantizaciones GGUF.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con transformers/vLLM en bf16.

No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.

## Casos de uso

- Resumen de noticias y articulos en estonio: el modelo esta entrenado especificamente para condensar textos en dos o tres frases, como demuestra el ejemplo de la model card con una noticia de 127 palabras resumida en 48 palabras.
- Procesamiento por lotes de documentos estonios en servidores modestos: con la cuantizacion Q8_0 (774 MiB) puede ejecutarse en CPU y procesar volumenes de resumenes sin GPU dedicada.
- Despliegue en dispositivos embebidos: la variante Q4_K_M (505 MiB) cabe en una Raspberry Pi, lo que permite resumir texto en local sin conexion a la nube.
- Preprocesado de contenido para buscadores o agregadores estonios: generar resumenes automaticos de paginas web antes de indexarlas o mostrarlas en listados.
- Asistencia de redaccion en estonio: reescritura y condensacion de borradores manteniendo una tasa baja de errores gramaticales (2,5 por cada 100 palabras en resumenes, segun el autor).
- Prototipado e investigacion de NLP en estonio: punto de partida ligero para experimentos de ajuste fino o evaluacion de tecnicas de cuantizacion sin grandes requisitos de hardware.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card:

| Metrica | Qwen3.5-0.8B (oficial) | Qwen3.5-0.8B-Estonian | Qwen3.6-35B-A3B (44x mayor) |
|---|---|---|---|
| Errores gramaticales por 100 palabras en resumenes en estonio (300 paginas web, recuento ciego) | no disponible | 2,5 | 2,7 |
| EstCOPA (sentido comun) | 52% | 65% | 96% |
| Test de gramatica (TalTechNLP grammar_et) | 57% | 66% | 95% |

El autor indica que la limpieza del estonio en resumenes es comparable a la de un modelo de 35B, pero que el conocimiento general y el razonamiento son los de un modelo pequeno. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,5 GB en bf16 (safetensors), unos 774 MiB en Q8_0 y unos 505 MiB en Q4_K_M.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para bf16; el modelo tambien funciona en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna (por ejemplo, GTX 1650, RTX 3050, RTX 4090) e incluso en iGPU y en Raspberry Pi con la cuantizacion Q4_K_M.
- Opciones de despliegue: llama.cpp (GGUF), transformers, vLLM (bf16) y endpoints compatibles.
- Latencia y throughput: no disponibles. El autor menciona que el ejemplo de resumen se genero con Q8_0 y temperatura 0,2, pero no publica cifras de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.5-0.8B-Estonian | 752 M | no disponible | Apache 2.0 | Hugging Face (safetensors, GGUF) |
| Qwen3.5-0.8B-Base (oficial) | 0,8 B | no disponible | Apache 2.0 | Hugging Face |
| Qwen3.6-35B-A3B | 35 B (MoE, 3 B activos) | no disponible | no disponible | Hugging Face |

El modelo base oficial obtiene 52% en EstCOPA y 57% en el test de gramatica, frente al 65% y 66% del ajuste fino, lo que muestra la mejora en estonio. El modelo de 35B, 44 veces mayor, alcanza 96% y 95% respectivamente, pero su calidad gramatical en resumenes (2,7 errores por 100 palabras) es similar a la del modelo ajustado (2,5). No se dispone de datos de otras alternativas especificas para estonio en la informacion proporcionada.

## Limitaciones y advertencias

- Conocimientos generales y razonamiento muy limitados: el autor advierte que no es un asistente general y que no conviene esperar que invente contenido o escriba codigo o textos largos de forma autonoma.
- Riesgo de alucinacion: al ser un modelo de 0,8B, puede generar afirmaciones incorrectas o inventar detalles no presentes en el texto de entrada.
- Especializado en estonio: solo declara soporte para el idioma et; su rendimiento en otros idiomas no esta documentado.
- La cuantizacion Q4_K_M introduce mas errores gramaticales que Q8_0, segun el propio autor.
- No se documenta la longitud de contexto soportada, lo que limita la planificacion de casos de uso con entradas largas.
- No se han publicado evaluaciones independientes ni resultados en benchmarks estandar; las cifras proceden del autor.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen3.5-0.8B-Base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/50gg/Qwen3.5-0.8B-Estonian
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Repositorio de llama.cpp (mencionado como opcion de despliegue): https://github.com/ggml-org/llama.cpp
- No se han encontrado en la informacion disponible papers, blogs, repositorios ni demos adicionales del autor.

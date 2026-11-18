# DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF

## Resumen

Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP es un ajuste fino (fine-tune) de la familia Qwen3.5 de 9B de parametros, desarrollado por DavidAU en colaboracion con Nightmedia. El modelo parte de la base Qwen3.5-9B y se ha construido mediante un proceso multi-etapa de fine-tuning y merge sobre varios de los propios fine-tunes de 9B del autor. Su objetivo declarado es elevar la inteligencia general y el seguimiento de instrucciones, y ademas eliminar los mecanismos de rechazo mediante una tecnica de "heretic" (abliteration), de modo que el modelo responde a cualquier peticion sin filtros de contenido.

La arquitectura subyacente es un transformer denso de aproximadamente 8.950 millones de parametros (8,95B), con soporte declarado de modo "thinking"/razonamiento y de entrada image-text-to-text segun el pipeline de Hugging Face. El repositorio distribuido es exclusivamente de cuantizaciones GGUF (tanto "regular" como "MTP", es decir, multi-token prediction) generadas con NEO Imatrix para mejorar la precision de la cuantizacion entre un 2 y un 4 % respecto a GGUF convencionales. El modelo es relevante ahora por su enorme traccion (mas de 2,18 millones de descargas y 1.875 likes) y porque, segun su autor, supera 7 de 7 benchmarks frente a modelos mucho mayores como Qwen3.5-27B, Qwen3.6-35B-A3B y se aproxima a Qwen3.6-27B en algunos casos, todo ello en cuantizaciones de 4 y 8 bits.

La licencia es Apache 2.0, lo que facilita su uso comercial, aunque el caracter "uncensored" y "abliterated" implica riesgos de contenido que el usuario debe gestionar por su cuenta. El modelo esta pensado para casos de uso creativos, roleplay, ficcion, codigo y razonamiento general, con soporte declarado de 16 idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.5-9B); soporte de modo thinking/razonamiento y pipeline image-text-to-text |
| Parametros totales | 8.953.803.264 (8,95B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (la model card no especifica la ventana; se menciona "long context performance" en las cuantizaciones NEO Imatrix, sin cifra) |
| Tipos de cuantizacion | GGUF en multiples niveles: mxfp8, mxfp4, Q4_K_S (4 bits), Q6, Q8, BF16/16-bit MTP; tensores MTP en Q8_0 y tensor de salida en 16 bits |
| Idiomas soportados | ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi (16 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (regular y MTP); el modelo base en safetensors esta en el repo del modelo base |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 8,95B de parametros derivado de Qwen3.5-9B. El autor describe el proceso como un fine-tune y merge multi-etapa y multi-modelo realizado en hardware local, en el que se combinaron varios de sus propios fine-tunes de 9B de la familia Qwen3.5. El objetivo explicito del entrenamiento fue doble: aumentar la inteligencia general del modelo y mejorar el seguimiento de instrucciones, partiendo de la premisa de que mejorar ambas cosas eleva el rendimiento de extremo a extremo.

Un aspecto tecnico destacable es el proceso "heretic" (abliteration) aplicado antes del entrenamiento posterior: el modelo se entrena despues de eliminar los mecanismos de rechazo, de ahi la etiqueta "trained post Heretic'ing". Ademas, el bloque de thinking/razonamiento se ha "compactado" y, segun el autor, en muchos casos es mas potente. Las cuantizaciones GGUF se generan con NEO Imatrix, que segun la model card mejora la precision entre un 2 y un 4 % sobre GGUF normales y el rendimiento en contexto largo; tambien se ha modificado el tensor de salida (10-20 % de la salida) a precision completa de 16 bits. Las variantes MTP (multi-token prediction) incorporan tensores MTP en Q8_0 y permiten prediccion de multiples tokens para acelerar la inferencia. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF/DPO.

## Capacidades

- Generacion de texto general, razonamiento y matematicas, con modo "thinking"/razonamiento activable.
- Generacion de codigo (etiquetas "coder" y casos de uso de programacion).
- Escritura creativa, ficcion y roleplay, con ausencia de filtros de contenido ("fully uncensored").
- Seguimiento de instrucciones reforzado mediante fine-tune multi-etapa.
- Soporte declarado de pipeline image-text-to-text (entrada de imagen y texto), segun el campo pipeline_tag de Hugging Face.
- Capacidades multilingues en 16 idiomas: arabe, chino, ingles, frances, aleman, hindi, indonesio, italiano, japones, coreano, polaco, portugues, ruso, espanol, tailandes y vietnamita.
- Modos de razonamiento e instruct conmutables en caliente via API, directos y "en chat" (en las variantes Q6/Q8 con "plusIQ", segun la model card): 5 modos de razonamiento (incluidos Spoon y Einstein) y 5 modos instruct sin tokens de razonamiento.
- Aceleracion mediante MTP (multi-token prediction) en las variantes MTP, con tasas de aceptacion tipicas del 60 % (2 tokens).
- Soporte de tool calling / function calling: no se menciona explicitamente en la informacion disponible, aunque se anuncia una version "tools" extra robusta en Q6 y Q8.

## Casos de uso

- Escritura creativa y ficcion sin restricciones: el modelo, al ser "uncensored" y "abliterated", permite generar narrativa adulta, terror o temas sensibles sin rechazos, con buen seguimiento de instrucciones para mantener estilo y personajes a lo largo de textos largos.
- Roleplay conversacional: su entrenamiento orientado a "roleplaying" y su modo thinking permiten mantener personajes coherentes en dialogos multi-turno, con la ventaja de que las cuantizaciones MTP aceleran la generacion en tiempo real.
- Generacion de codigo en local: las etiquetas "coder" y su tamano de 9B permiten ejecutarlo en una GPU de consumo; se puede integrar en editores o pipelines de CI/CD para autocompletado y generacion de tests alli donde no se quiera enviar codigo a la nube.
- Razonamiento asistido con modo thinking: para tareas de analisis, matematicas o planificacion donde convenga un razonamiento explicito, se puede activar el modo thinking y luego conmutar a instruct para respuestas concisas.
- Despliegue en hardware modesto: al distribuirse en GGUF de 4 y 8 bits, es adecuado para estaciones de trabajo con una sola GPU consumer o incluso CPU, sirviendo como asistente personal privado sin dependencia de APIs externas.
- Traduccion y atencion multilingue: con 16 idiomas declarados, puede emplearse para traduccion, atencion al cliente o generacion de contenido en mercados hispanohablantes, franceses, alemanes, asiaticos, etc.
- Prototipado e investigacion sobre alineacion: al ser un modelo abliterated, es util para estudiar el comportamiento de modelos sin rechazo, comparar con la base Qwen3.5-9B-Instruct y evaluar sesgos y riesgos en entornos controlados.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (modo instruct; el autor indica que en modo thinking los resultados suelen ser superiores). Se comparan cuantizaciones del modelo con modelos base no heretic:

| Modelo / quant | ARC-C | ARC-E | BoolQ | HellaSwag | OpenBookQA | PIQA | WinoGrande |
|---|---|---|---|---|---|---|---|
| Defiant Fable 9B (bf16) | 0,649 | 0,832 | 0,895 | 0,713 | 0,482 | 0,783 | 0,699 |
| Defiant Fable 9B (mxfp8) | 0,647 | 0,836 | 0,895 | 0,706 | 0,460 | 0,784 | 0,695 |
| Defiant Fable 9B (mxfp4) | 0,640 | 0,824 | 0,886 | 0,703 | 0,468 | 0,780 | 0,691 |
| Qwen3.5-9B-Instruct (mxfp8) | 0,571 | 0,719 | 0,895 | 0,683 | 0,426 | 0,770 | 0,671 |
| Qwen3.8-27B (mxfp8) | 0,591 | 0,782 | 0,896 | 0,746 | 0,448 | 0,801 | 0,711 |
| Qwen3.6-27B-Instruct (mxfp8) | 0,647 | 0,803 | 0,910 | 0,773 | 0,450 | 0,806 | 0,742 |
| Qwen3.5-27B-Instruct (mxfp8) | 0,557 | 0,711 | 0,868 | 0,533 | 0,452 | 0,706 | 0,695 |
| Qwen3.6-35B-A3B-Instruct (mxfp8) | 0,581 | 0,757 | 0,892 | 0,751 | 0,428 | 0,803 | 0,688 |

Segun el autor, el modelo supera 7 de 7 benchmarks frente a Qwen3.5-9B-Instruct, Qwen3.5-27B-Instruct y Qwen3.6-35B-A3B-Instruct, y se aproxima a Qwen3.6-27B-Instruct en algunos casos, manteniendose en 4 y 8 bits. No hay datos publicados de MMLU, HumanEval ni GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: para una cuantizacion de 4 bits (Q4_K_S), aproximadamente 6-7 GB; para 8 bits, en torno a 10-11 GB; para BF16, aproximadamente 18 GB. Estimaciones orientativas segun el tamano de 8,95B de parametros.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 para 8 bits y BF16; RTX 4060 Ti 16 GB o RTX 4070 para 4 bits; A100/H100 solo si se busca alto throughput concurrente.
- Cabe en GPU consumer: si, en tarjetas de 8-12 GB con cuantizacion de 4 bits, y en 16 GB con 8 bits.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF (vLLM con soporte GGUF segun version); las variantes MTP requieren motores que soporten multi-token prediction para aprovechar la aceleracion.
- Latencia y throughput: el autor reporta aproximadamente 130 t/s en Q4_K_S con GGUF regulares; las variantes MTP con 60 % de aceptacion (2 tokens) pueden superar esa cifra. Recomienda temperatura igual o inferior a 1 y repetition penalty a 1 (desactivado) para no degradar MTP; si la tasa de aceptacion baja del 50 %, sugiere usar las variantes regulares.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Defiant Fable 9B (este modelo) | 8,95B | No disponible | Apache 2.0 | GGUF (regular y MTP) | Uncensored/abliterated; benchmarks superiores a bases de 9B y 27B segun autor |
| Qwen3.5-9B-Instruct | ~9B | No disponible | Apache 2.0 (familia Qwen) | Safetensors/GGUF | Base no heretic; benchmarks inferiores en ARC-C, ARC-E, HellaSwag, OpenBookQA y PIQA |
| Qwen3.6-27B-Instruct | 27B | No disponible | Apache 2.0 (familia Qwen) | Safetensors/GGUF | Mayor en HellaSwag y WinoGrande; requiere mucha mas VRAM |
| Qwen3.6-35B-A3B-Instruct | 35B totales (MoE) | No disponible | Apache 2.0 (familia Qwen) | Safetensors/GGUF | MoE; el Defiant Fable lo supera en la mayoria de benchmarks citados pese a ser 4 veces menor |

## Limitaciones y advertencias

- Modelo "uncensored" y "abliterated": no aplica filtros de rechazo, por lo que puede generar contenido ofensivo, ilegal o danino; requiere moderacion externa en produccion.
- Riesgo de alucinacion: como todo modelo de 9B, puede inventar datos, especialmente en modo thinking o en tareas de conocimiento factual.
- Sesgos: el proceso de abliteration y el entrenamiento sobre fine-tunes propios pueden introducir o amplificar sesgos; no se han publicado evaluaciones de sesgo.
- Contexto: la longitud de contexto no se especifica en la informacion disponible; conviene verificarla antes de disenar casos de uso con documentos largos.
- MTP: si la tasa de aceptacion de tokens cae por debajo del 50 %, hay que usar las variantes regulares; temperaturas altas y repetition penalty degradan el rendimiento MTP.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias y la responsabilidad sobre el contenido generado recae en el usuario.
- El rendimiento declarado en benchmarks es del autor y se ha medido con su propio arnes en modo instruct; no hay validacion independiente en la informacion disponible.
- El repositorio ocupa 204,9 GB por incluir muchas cuantizaciones; conviene descargar solo el archivo necesario.

## Enlaces

- Hugging Face (modelo GGUF): https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Modelo relacionado 27B (Fable Fusion 711): https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Preguntas frecuentes y soporte del autor: https://huggingface.co/DavidAU/support
- Paper, blog o demo oficial: no disponible en la informacion proporcionada.

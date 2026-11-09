# DavidAU/Llama-3.2-1B-Instruct-NEO-WEE-HORROR-GGUF

## Resumen

Llama-3.2-1B-Instruct-NEO-WEE-HORROR-GGUF es un ajuste fino (fine-tune) del modelo Llama-3.2-1B-Instruct de Meta, publicado por el usuario DavidAU en Hugging Face. El modelo parte de la arquitectura transformer densa de Llama 3.2 con 1.235.814.432 parametros y una ventana de contexto declarada de 128.000 tokens (131.000 segun el autor). Se distribuye exclusivamente en formato GGUF, cuantizado con tecnicas de imatrix, lo que lo hace apto para inferencia en CPU y GPU de gama baja.

El ajuste se ha realizado aplicando el dataset "NEO IMATRIX Tiny Wee Horror Dataset V2" sobre el modelo base, con el objetivo de especializarlo en escritura creativa de terror y ficcion, roleplay y generacion de prosa vivida. Segun el autor, el ajuste anade una "capa de pintura negra" a las respuestas creativas, incrementa la intensidad de las escenas y puede aumentar el seguimiento de instrucciones en tareas de narrativa. No se trata de un modelo de proposito general, sino de una variante orientada a escritura y roleplay.

Su relevancia actual radica en su tamano reducido (1B parametros) combinado con un contexto muy amplio para su categoria y una licencia Apache 2.0 permisiva. Esto permite desplegarlo en hardware de consumo y usarlo como base para experimentacion en generacion creativa, aunque su naturaleza de fine-tune comunitario implica que no cuenta con benchmarks publicados ni validacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Llama 3.2) |
| Parametros totales | 1.235.814.432 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (131.000 segun el autor) |
| Tipos de cuantizacion | GGUF con imatrix: IQ2, IQ3, IQ4_XS, Q4, Q5, Q6 (Q8 no incluido) |
| Idiomas soportados | en, fr, de, es, it, pt, zh, ja, ru, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (bfloat16 como referencia, repo de 13,5 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer densa de Llama 3.2 1B Instruct de Meta, con atencion por grupos (GQA) y las innovaciones propias de la familia Llama 3.2. Sobre esa base, el autor aplico un ajuste fino supervisado utilizando el "NEO IMATRIX Tiny Wee Horror Dataset V2", un dataset orientado a generar contenido de terror, ficcion y roleplay. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO.

La innovacion tecnica destacable es el uso de cuantizacion con imatrix (importance matrix), que segun el autor rinde mejor en cuantizaciones IQ3 e IQ4, y recomienda IQ4_XS para maximizar el efecto del imatrix. El autor indica que las cuantizaciones mas agresivas (IQ2, IQ3) amplifican el efecto del dataset de terror, mientras que Q8 no se incluye porque el imatrix no tiene efecto sobre esa cuantizacion. El modelo requiere la plantilla de chat de Llama 3 y admite configuraciones de temperatura de 0 a 5, con la advertencia de que valores altos (3 o mas) pueden producir salidas muy largas.

## Capacidades

- Generacion de texto creativo: ficcion, terror, ciencia ficcion, romance y otros generos.
- Escritura de prosa vivida y descripciones intensas, reforzada por el dataset de terror.
- Generacion de tramas y subtramas, continuacion de escenas y narracion.
- Roleplay y conversacion multi-turno con contexto de hasta 128k tokens.
- Seguimiento de instrucciones en tareas narrativas (segun el autor, puede mejorar con el ajuste).
- Soporte multilingue declarado en 10 idiomas (en, fr, de, es, it, pt, zh, ja, ru, ko).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documenta soporte explicito de tool calling, function calling, vision, audio ni modo de razonamiento (thinking mode).

## Casos de uso

- Escritura de ficcion de terror: el modelo puede generar relatos y escenas con atmosfera de terror gracias al ajuste sobre el dataset NEO IMATRIX, ideal para autores que buscan prosa intensa y vivida.
- Roleplay narrativo: su contexto de 128k tokens permite mantener conversaciones de rol prolongadas con memoria de la trama, y el autor recomienda repetition penalty de 1.05 a 1.08 para este uso.
- Continuacion de escenas y subtramas: util para escritores que necesitan expandir un borrador con nuevas lineas argumentales manteniendo coherencia dentro de una ventana de contexto amplia.
- Generacion de tramas para videojuegos o narrativa interactiva: el modelo puede producir descripciones de escenarios y dialogos con tono oscuro, integrándose en motores de ficcion interactiva.
- Prototipado de asistentes creativos en local: al ser un modelo de 1B en GGUF, cabe en hardware de consumo y permite experimentar con generacion creativa sin depender de la nube.
- Generacion de contenido multilingue para ficcion: soporta 10 idiomas, lo que permite producir relatos o dialogos en varios idiomas, aunque la calidad fuera del ingles no esta validada.
- Educacion y talleres de escritura: puede usarse como herramienta de lluvia de ideas y generacion de variantes de escenas para ejercicios literarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona un rendimiento de "190 tokens por segundo o mas en GPU", pero no se especifica el hardware utilizado ni se aportan metricas de calidad (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM estimada: un modelo de 1B parametros en cuantizacion Q4 ocupa aproximadamente 0,7-0,9 GB de pesos; en Q8 rondaria 1,3 GB. Con contexto de 128k tokens, la cache KV incrementa notablemente el uso de memoria, por lo que se recomienda GPU con al menos 8-12 GB para contextos largos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) puede ejecutar el modelo; para contextos completos de 128k se aconseja 12 GB o mas de VRAM.
- Cabe en GPU de consumo: si, en la mayoria de GPU consumer con 6 GB o mas para cuantizaciones bajas y contextos moderados.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia.
- Latencia y throughput: el autor reporta 190+ tokens por segundo en GPU, sin especificar el hardware. No hay datos de latencia publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Llama-3.2-1B-Instruct-NEO-WEE-HORROR | 1,23B | 128k | Apache 2.0 | GGUF | Fine-tune de terror/ficcion con imatrix |
| Llama-3.2-1B-Instruct (Meta) | 1,23B | 128k | Llama 3.2 Community License | Safetensors, GGUF | Modelo base oficial, proposito general |
| Qwen2.5-1.5B-Instruct | 1,5B | 32k | Apache 2.0 | Safetensors, GGUF | Alternativa multilingue de tamano similar |
| TinyLlama-1.1B-Chat | 1,1B | 2k | Apache 2.0 | Safetensors, GGUF | Modelo pequeno de proposito general, contexto mucho menor |

Nota: los datos de los modelos comparables se ofrecen a titulo orientativo; no se dispone de benchmarks comparativos publicados para este fine-tune concreto.

## Limitaciones y advertencias

- Sesgos conocidos: al derivar de Llama 3.2, hereda los sesgos del modelo base; el ajuste hacia terror puede amplificar contenido violento o perturbador.
- Riesgo de alucinacion: como todo modelo de 1B parametros, la tasa de alucinacion es elevada, especialmente en tareas factuales; no es adecuado para usos que requieran precision.
- Contenido grafico: el autor advierte que el modelo puede producir o implicar horror grafico dependiendo del prompt.
- Limitaciones de contexto: aunque declara 128k tokens, la calidad en contextos muy largos no esta validada y el uso de memoria crece con la ventana.
- Limitaciones de idioma: aunque declara 10 idiomas, el entrenamiento se centra en ingles; la calidad en espanol y otros idiomas no esta garantizada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Llama 3.2 tiene su propia licencia comunitaria que conviene revisar.
- Caveats de produccion: es un fine-tune comunitario sin benchmarks ni validacion independiente; los resultados dependen fuertemente de los parametros de muestreo (temperatura, repetition penalty), y el autor recomienda ajustes especificos que no estan estandarizados.

## Enlaces

- Hugging Face: https://huggingface.co/DavidAU/Llama-3.2-1B-Instruct-NEO-WEE-HORROR-GGUF
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Guia de parametros del autor: https://huggingface.co/DavidAU/Maximizing-Model-Performance-All-Quants-Types-And-Full-Precision-by-Samplers_Parameters
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections

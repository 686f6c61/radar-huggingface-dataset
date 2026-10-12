# Mindscend/mindtype-tagger-v1.2

## Resumen

mindtype-tagger-v1.2 es un modelo de correccion gramatical y ortografica (GEC) desarrollado por Mindscend para su teclado on-device de iOS y Android. Se trata de un transformer encoder-only de 26,2 millones de parametros (8 capas, dimension 384) entrenado desde cero, con tokenizador byte-level BPE propio de 16k tokens. Su objetivo es detectar y corregir errores de escritura sin que el texto salga del dispositivo, lo que lo hace adecuado para entornos donde la privacidad es critica.

La innovacion principal es su formulacion como tarea de clasificacion de tokens: el modelo predice una etiqueta de edicion por palabra (KEEP, DELETE, REPLACE_x, APPEND_x o cambio de mayusculas) en una sola pasada. Esto evita que el modelo invente palabras o reescriba texto correcto, algo frecuente en LLMs pequenos ajustados para GEC. El resultado es un modelo muy rapido (unos 4 ms por frase en CPU de movil) y de tamano reducido.

La version 1.2 mejora sobre la 1.1 con un encoder preentrenado durante mas tiempo (6,8 h adicionales sobre 61,7M frases) y 8M pares de correccion con 16 veces mas mensajes casuales. Esto reduce los falsos positivos del 8,65% al 3,1% y eleva la F0.5 de 0,748 a 0,800 en la suite de evaluacion propia. El modelo se distribuye en formatos Core ML (8 bits, 26 MB) y ONNX (int8, 27 MB) ademas de los pesos PyTorch en fp32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (8 capas, d=384) |
| Parametros totales | 26.176.920 (26,2M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entradas Core ML con padding a 16/32/64/96/160 tokens) |
| Tipos de cuantizacion | fp32 (PyTorch), 8-bit (Core ML), int8 dynamic (ONNX) |
| Idiomas soportados | en (solo ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, Core ML (.mlpackage), ONNX |

## Arquitectura y entrenamiento

El modelo es un transformer encoder-only de 8 capas con dimension de modelo 384, entrenado desde cero junto a un tokenizador byte-level BPE propio de 16k tokens. La cabeza de clasificacion predice, para cada palabra, una de las 15.000 etiquetas de edicion definidas en `labels.json`: `$KEEP`, `$DELETE`, `$REPLACE_<palabra>`, `$APPEND_<palabra>` (insercion posterior) o un cambio de mayusculas. La frase corregida se obtiene aplicando las etiquetas a las palabras originales, y el modelo se vuelve a ejecutar sobre su propia salida hasta 3 pasadas. Esta formulacion hace que el modelo no pueda generar palabras nuevas ni reescribir texto correcto.

El entrenamiento se realizo en dos fases. Primero, modelado de lenguaje enmascarado (MLM) sobre FineWeb-Edu (ODC-BY): 1 hora sobre unas 20M frases y despues 6,8 horas sobre 61,7M frases. Despues, una fase de correccion con 8,02M de pares (ruidoso, limpio) compuestos por errores sinteticos de tecleo en movil, datos de GEC de CoEdIT (Apache-2.0) y mensajes casuales generados por Qwen2.5-14B-Instruct y filtrados por correccion. Un 30% de los pares ya eran texto correcto, de modo que el modelo aprende a no modificar lo que esta bien. Todo el entrenamiento se llevo a cabo en una unica GPU RTX 3080 Ti de portatil en aproximadamente 11 horas.

## Capacidades

- Correccion gramatical y ortografica en ingles a nivel de frase.
- Prediccion de una etiqueta de edicion por palabra: mantener, borrar, reemplazar, anexar o cambiar mayusculas.
- Proteccion de nombres, numeros, correos electronicos y URL, que nunca se modifican.
- Ejecucion on-device: paquete Core ML (8 bits) para iOS 18+ y ONNX (int8) para Android y servidores.
- Inferencia en una sola pasada con latencia de unos 4 ms por frase en CPU de movil (Core ML) y CPU de portatil (ONNX Runtime).
- Hasta 3 pasadas de auto-correccion sobre la propia salida.
- Guarda de plausibilidad (`plausible_pairs.json`) que restringe los reemplazos aceptados a pares plausibles.
- Ajuste de sesgo KEEP (por defecto 2.0) para controlar el numero y la seguridad de las correcciones.
- No soporta tool calling, function calling, razonamiento multi-paso ni capacidades multimodales.

## Casos de uso

- Teclado predictivo on-device en iOS y Android: el modelo se integra en el teclado del sistema para corregir la frase recien escrita sin que el texto abandone el dispositivo, garantizando privacidad total. Su tamano de 26 MB en Core ML y su latencia de 4 ms lo hacen viable en tiempo real.
- Correccion automatica en aplicaciones de mensajeria: puede integrare en chats o clientes de correo para sugerir correcciones en mensajes casuales, donde el conjunto `casual_noisy` alcanza una F0.5 de 0,932 sin falsos positivos.
- Post-procesado de texto en pipelines de accesibilidad: util para limpiar dictado por voz o entrada por gestos, manteniendo intactos los nombres y numeros de forma fiable (0,000 de spans protegidos perdidos en la suite de evaluacion).
- Preprocesado de datos para entrenamiento o analitica: normalizar texto ruidoso antes de alimentar otros modelos o bases de datos, con un coste computacional minimo al ejecutarse en CPU.
- Correccion en formularios y campos de entrada web o aplicaciones de escritorio: el formato ONNX int8 (27 MB) permite desplegarlo en servidores o entornos de escritorio con ONNX Runtime, sin necesidad de GPU.
- Filtrado de calidad en foros y redes sociales: marcar automaticamente texto con errores ortograficos o gramaticales antes de su publicacion o indexacion, con una tasa de falsos positivos del 3,1% sobre texto correcto.
- Asistencia a la escritura para hablantes no nativos de ingles: ofrece correcciones gramaticales conservadoras que no reescriben el estilo ni el tono, util en contextos formales donde el conjunto `formal_noisy` alcanza F0.5 de 0,881.

## Benchmarks y rendimiento

Resultados en la suite de evaluacion MindType (4.356 casos reservados), con sesgo KEEP 2.0 y guarda de plausibilidad:

| Conjunto | n | F0.5 | Exact | Falsos positivos | Spans protegidos perdidos |
|---|---|---|---|---|---|
| casual_clean | 118 | 0,000 | 0,966 | 0,034 | 0,000 |
| casual_noisy | 109 | 0,932 | 0,817 | 0,000 | 0,000 |
| coedit | 579 | 0,449 | 0,104 | 0,000 | 0,000 |
| formal_clean | 1000 | 0,000 | 0,962 | 0,038 | 0,000 |
| formal_noisy | 1000 | 0,881 | 0,688 | 0,000 | 0,000 |
| golden | 50 | 0,909 | 0,860 | 0,077 | 0,000 |
| preserve | 1000 | 0,839 | 0,705 | 0,000 | 0,000 |
| preserve_clean | 500 | 0,000 | 0,984 | 0,016 | 0,000 |
| **overall** | 4356 | **0,800** | **0,724** | **0,031** | **0,000** |

Nota: la F0.5 es 0,000 en los conjuntos `*_clean` por definicion (no hay nada que corregir); en esos casos lo relevante es la tasa de falsos positivos.

Comparativa con LLMs pequenos ajustados y con la version 1.1 (misma suite):

| Modelo | Tamano | F0.5 | Exact | Falsos positivos | Nombres/numeros perdidos |
|---|---|---|---|---|---|
| Gemma 3 270M instruct, zero-shot | 270M | 0,122 | 0,2% | 99,6% | 3,9% |
| Gemma 3 270M + LoRA r32 | 270M | 0,571 | 57,4% | 23,1% | 2,9% |
| SmolLM2 360M + LoRA r32 | 360M | 0,663 | 63,1% | 20,1% | 0,3% |
| mindtype-tagger-v1.1 | 26M | 0,748 | 68,3% | 8,65% | 0,0% |
| **mindtype-tagger-v1.2** | **26M** | **0,800** | **72,4%** | **3,1%** | **0,0%** |

Brechas conocidas (conjuntos de prueba separados, no usados en entrenamiento):

| Tipo de error | n | F0.5 | Exact |
|---|---|---|---|
| Faltas reales (p. ej. "recieve") | 500 | 0,882 | 71,0% |
| Palabras omitidas (p. ej. "I going home") | 500 | 0,078 | 2,0% |
| Presente sobre pasado (p. ej. "Yesterday I go") | 248 | 0,049 | 1,2% |

## Requisitos de hardware

- Inferencia en fp32: aproximadamente 105 MB de memoria para los pesos (26,2M parametros x 4 bytes), mas el overhead de activaciones. Cabe en cualquier GPU consumer y en CPU.
- Inferencia en int8 (ONNX): 27 MB de modelo. Puede ejecutarse en CPU sin GPU.
- Inferencia en Core ML 8 bits: paquete de 26 MB para iOS 18+, disenado para CPU de movil.
- GPU recomendadas: no se especifica ninguna en la informacion; por tamano, cualquier GPU consumer (RTX 3060 o superior) es mas que suficiente. El entrenamiento se realizo en una RTX 3080 Ti de portatil.
- Cabe holgadamente en GPU consumer: si, en practicamente todas, incluidas integradas y moviles.
- Opciones de despliegue: Core ML (iOS), ONNX Runtime (Android, escritorio, servidores), PyTorch (safetensors). No se mencionan vLLM, llama.cpp ni TGI.
- Latencia estimada: unos 4 ms por frase en CPU de movil (Core ML) y en CPU de portatil (ONNX Runtime). No se publica throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | F0.5 (misma suite) | Falsos positivos | Licencia |
|---|---|---|---|---|---|
| mindtype-tagger-v1.2 | 26M | Clasificacion de tokens (etiqueta por palabra) | 0,800 | 3,1% | Apache-2.0 |
| mindtype-tagger-v1.1 | 26M | Clasificacion de tokens | 0,748 | 8,65% | Apache-2.0 |
| Gemma 3 270M + LoRA r32 | 270M | LLM ajustado para GEC | 0,571 | 23,1% | no disponible en la ficha |
| SmolLM2 360M + LoRA r32 | 360M | LLM ajustado para GEC | 0,663 | 20,1% | no disponible en la ficha |
| Gemma 3 270M instruct zero-shot | 270M | LLM sin ajuste | 0,122 | 99,6% | no disponible en la ficha |

La ventaja de mindtype-tagger-v1.2 es que con un tamano 10 a 14 veces menor que los LLM ajustados logra mejor F0.5 y una tasa de falsos positivos mucho mas baja, ademas de no perder nombres ni numeros.

## Limitaciones y advertencias

- Solo soporta ingles. No hay capacidades multilingues.
- Funciona a nivel de frase, no de documento completo.
- Es un modelo experimental, no un producto final validado.
- Corrige lo que ya esta escrito: no reformula ni cambia el tono.
- Raramente anade palabras omitidas ni corrige tiempos verbales (F0.5 de 0,078 en palabras omitidas y 0,049 en presente sobre pasado).
- Puede modificar texto correcto: un 3,1% de falsos positivos sobre frases correctas en la suite de evaluacion.
- Rendimiento bajo en el conjunto `coedit` (F0.5 de 0,449), lo que sugiere menor adecuacion a ciertas tareas de GEC externas.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- Licencia Apache-2.0 para pesos, tokenizador y modelos Core ML/ONNX; permite uso comercial. Los datos de entrenamiento son FineWeb-Edu (ODC-BY) y CoEdIT (Apache-2.0).
- No se han publicado datos sobre sesgos especificos del modelo.

## Enlaces

- HuggingFace: https://huggingface.co/Mindscend/mindtype-tagger-v1.2
- Sitio del autor: https://mindscendinc.com
- Otros enlaces (papers, blogs, repos, demos): no disponibles en la informacion proporcionada.

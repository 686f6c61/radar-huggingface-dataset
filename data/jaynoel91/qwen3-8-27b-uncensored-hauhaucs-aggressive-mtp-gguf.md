# Jaynoel91/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF

## Resumen

Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF es una cuantizacion GGUF del modelo Qwen3.8-27B de Alibaba Qwen, publicada por el usuario Jaynoel91 (el trabajo de cuantizacion y "uncensoring" se atribuye en la model card a HauhauCS). El modelo base es un transformer denso de 27.000 millones de parametros con un codificador de vision, disenado para tareas de imagen-texto-a-texto, razonamiento, codigo y uso agentico. Esta variante concreta elimina el comportamiento de rechazo (la model card afirma "0/465 refusals") y aplica un perfil "Aggressive" que prioriza respuestas directas sin preambulos.

La relevancia tecnica de esta publicacion no esta en el modelo base sino en el trabajo de cuantizacion e inferencia: introduce las cuantizaciones propietarias K_P ("Perfect"), que segun el autor mejoran la calidad uno o dos niveles de cuantizacion a cambio de un 5-15% mas de tamano, y anade HauhauCS FastMTP, un sidecar de decodificacion especulativa que afirma acelerar la generacion de tokens hasta 3,02x en tareas de documento y 1,93x en razonamiento frente a la inferencia sin MTP.

El repositorio ocupa 172,5 GB e incluye toda la escalera de cuantizaciones, desde Q8_K_P (31,46 GB) hasta IQ2_M (10,32 GB), ademas de un proyector de vision BF16 (931 MB) y el sidecar FastMTP-32K (903 MB). Es, por tanto, un paquete orientado a despliegue local con llama.cpp y LM Studio, no a entrenamiento o ajuste fino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso causal con codificador de vision; 48 capas Gated DeltaNet y 16 capas de atencion con compuertas (atencion hibrida) |
| Parametros totales | 27B (modelo base Qwen3.8-27B); el campo `safetensors` del repo indica 1.863.907.840, dato que no cuadra con el modelo descrito y probablemente corresponde a un componente auxiliar |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | Q8_K_P, Q8_0, Q6_K_P, Q6_K, Q5_K_P, Q5_K_M, Q4_K_P, Q4_K_M, IQ4_XS, Q3_K_P, Q3_K_M, IQ3_M, IQ3_XS, Q2_K_P, IQ2_M |
| Idiomas soportados | Ingles, chino y multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (texto, proyector de vision BF16 y sidecar FastMTP en GGUF) |

Otros datos de arquitectura: 64 capas de lenguaje, tamano oculto 5.120, tamano de FFN 17.408 y vocabulario de 248.320 tokens (con padding).

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 27B con una arquitectura hibrida: 48 capas de Gated DeltaNet (un mecanismo de estado lineal con compuertas) combinadas con 16 capas de atencion con compuertas. Esta mezcla busca reducir el coste de atencion en contextos largos manteniendo la calidad de recuperacion de informacion. Incorpora un codificador de vision que se distribuye por separado como proyector BF16 en formato GGUF, y conserva la cabeza NextN (MTP) nativa del modelo original.

Sobre esa base, el autor aplica dos intervenciones. La primera es el perfil de "uncensoring" Aggressive, que segun la model card no modifica los datasets ni las capacidades previstas, sino que altera el comportamiento de respuesta para eliminar rechazos y preambulos. La segunda es HauhauCS FastMTP, un sidecar de 903 MB con un perfil de decodificacion especulativa a 32K que se apoya en la cabeza MTP embebida. El autor declara aceleraciones de hasta 3,02x en generacion de documentos y 1,93x en razonamiento respecto a la inferencia sin MTP, y de hasta un 35,2% y un 21,1% respectivamente frente al MTP embebido estandar. No se detalla la composicion del dataset de entrenamiento del modelo base ni si hubo RLHF o DPO; esa informacion no esta disponible en el material proporcionado.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con modo de pensamiento heredado del modelo base Qwen3.8.
- Generacion de codigo y matematicas (capacidades declaradas del modelo base, sin cifras de benchmark en la informacion disponible).
- Vision: entrada de imagen y video mediante el proyector BF16 separado (pipeline `image-text-to-text`).
- Decodificacion especulativa acelerada mediante la cabeza MTP nativa y el sidecar FastMTP-32K.
- Comportamiento "uncensored": la model card afirma 0 rechazos en 465 pruebas y respuestas directas sin preambulo en prompts dificiles.
- Capacidades agenticas y de uso de herramientas heredadas del modelo base (declaradas en la model card, sin detalle de esquema de tool calling).
- Multilingue: ingles, chino y otros idiomas.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags del repo).

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: las cuantizaciones IQ3_XS (12,18 GB) y Q4_K_P (17,92 GB) permiten ejecutar un modelo de 27B con vision en GPUs de 16-24 GB de VRAM usando llama.cpp o LM Studio.
- Procesamiento de documentos largos: con 262.144 tokens de contexto nativo y el perfil FastMTP orientado a generacion de documentos, es adecuado para resumir o extraer informacion de contratos, informes o expedientes completos en una sola pasada.
- Analisis de imagenes y video en local: el proyector BF16 permite tareas de descripcion, OCR o pregunta-respuesta sobre imagen sin enviar datos a la nube, util en entornos con requisitos de privacidad.
- Investigacion sobre alineacion y seguridad: al ser una variante explicitamente sin rechazos, sirve como objeto de estudio para medir comportamientos de modelos sin filtros, util en laboratorios de evaluacion de riesgos.
- Generacion de codigo en pipelines internos: con tool calling heredado del base y contexto largo, se puede integrar en asistentes de repositorio que necesitan leer varios ficheros a la vez.
- Prototipado de agentes multi-paso: la combinacion de MTP acelerado y contexto de 262K reduce la latencia en bucles de razonamiento largos, lo que abarata la experimentacion con agentes.
- Escritura creativa sin restricciones de estilo: el perfil Aggressive evita los preambulos moralizantes, lo que resulta util en generacion de ficcion o guiones donde el filtrado estandar interrumpe el flujo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica de rendimiento aportada por el autor es relativa a la aceleracion de la decodificacion especulativa:

| Metrica | Sin MTP | MTP embebido estandar | HauhauCS FastMTP |
|---|---|---|---|
| Throughput en generacion de documentos (TG) | 1,00x (referencia) | hasta 1,00x | hasta 3,02x (y +35,2% sobre MTP estandar) |
| Throughput en razonamiento (TG) | 1,00x (referencia) | hasta 1,00x | hasta 1,93x (y +21,1% sobre MTP estandar) |

No se especifican las condiciones de medida (hardware, cuantizacion, longitud de prompt) de estas cifras.

## Requisitos de hardware

- VRAM estimada de inferencia segun cuantizacion (tamano del fichero como referencia; anadir margen para KV cache y contexto):
  - IQ2_M: 10,32 GB
  - Q2_K_P: 10,68 GB
  - IQ3_XS: 12,18 GB
  - IQ3_M: 12,79 GB
  - Q3_K_P: 13,44 GB
  - IQ4_XS: 15,71 GB
  - Q4_K_P: 17,92 GB
  - Q5_K_P: 20,22 GB
  - Q6_K_P: 25,92 GB
  - Q8_K_P: 31,46 GB
- Vision: sumar 931 MB del proyector BF16 si se procesan imagenes o video.
- Aceleracion: sumar 903 MB del sidecar FastMTP-32K si se usa decodificacion especulativa.
- GPU de consumo: cabe en RTX 4090 (24 GB) con Q4_K_P o IQ4_XS; en GPUs de 16 GB con IQ3_XS o IQ3_M; en GPUs de 8-12 GB solo con cuantizaciones de 2-3 bits y contexto reducido.
- GPU profesionales: A100 40/80 GB y H100 permiten Q8_K_P con contexto largo completo; el contexto nativo de 262K exige mucha mas VRAM por la KV cache.
- Opciones de despliegue: llama.cpp, LM Studio y cualquier runtime compatible con GGUF. El autor indica que las cuantizaciones K_P no requieren builds ni plugins especiales, aunque LM Studio puede mostrarlas como `?` en la columna de cuantizacion.
- Latencia y throughput: no disponibles de forma absoluta; solo se publican ratios relativos de aceleracion MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP (esta ficha) | 27B denso | 262.144 (ext. 1M) | Si (proyector BF16) | Apache 2.0 | GGUF, 15 cuantizaciones, sidecar FastMTP |
| Qwen3.8-27B (modelo base) | 27B denso | 262.144 (ext. 1M) | Si | Apache 2.0 | Safetensors y ecosistema oficial |
| Otras variantes uncensored de la familia Qwen | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion con alternativas de terceros no esta disponible en la informacion proporcionada. Frente al modelo base, las diferencias son el perfil sin rechazos, las cuantizaciones K_P y el sidecar FastMTP; las capacidades declaradas son las mismas.

## Limitaciones y advertencias

- El perfil "uncensored" elimina los rechazos por diseno: puede generar contenido danino, ilegal o sensible sin filtro. No es apto para produccion orientada al publico sin una capa de moderacion externa.
- El autor recomienda una variante "Balanced" para trabajo agentico de contexto largo y fiabilidad critica; la variante Aggressive prioriza la respuesta directa sobre la precision en ese escenario.
- Riesgo de alucinacion no cuantificado: no hay benchmarks publicados en la informacion disponible.
- Las cifras de aceleracion MTP son declaraciones del autor sin condiciones de medida detalladas; conviene validarlas en el hardware objetivo.
- Las cuantizaciones de 2-3 bits degradan la calidad de forma notable; para uso en produccion se recomienda Q4_K_P o superior.
- El campo de parametros del repo (1.863.907.840) no coincide con el modelo de 27B descrito; puede inducir a error en herramientas que lo lean automaticamente.
- El contexto de 1M es una extension declarada, no nativa; requiere configuracion adicional y VRAM proporcional.
- Idiomas: el soporte declarado se centra en ingles y chino; el rendimiento en castellano no esta documentado.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume la responsabilidad legal del contenido generado por una variante sin filtros.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor de la ficha (Jaynoel91) no coincide con el autor del trabajo de cuantizacion citado (HauhauCS); conviene verificar la procedencia de los ficheros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Jaynoel91/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Repositorio del autor de la cuantizacion (referenciado en la model card): https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Discord del autor: https://discord.gg/SZ5vacTXYf
- Paper, blog o demo oficiales: no disponible en la informacion proporcionada.

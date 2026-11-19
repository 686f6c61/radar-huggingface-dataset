# mdcreativeagent/Gemma4-26B-A4B-Uncensored-HauhauCS-Balanced

## Resumen

Gemma4-26B-A4B-Uncensored-HauhauCS-Balanced es una variante sin censura del modelo multimodal google/gemma-4-26B-A4B-it, publicada por el usuario mdcreativeagent bajo el alias HauhauCS. Se distribuye exclusivamente en formato GGUF cuantizado y su objetivo declarado es eliminar los rechazos (refusals) del modelo original sin degradar sus capacidades: el autor afirma 0 rechazos en 465 pruebas automatizadas y manuales, manteniendo intactos los datasets y las capacidades del modelo base.

Arquitectonicamente es un transformer con mezcla de expertos (MoE) de 25.233.142.046 parametros totales y aproximadamente 3.800 millones activos por token (top-8 de 128 expertos enrutados mas 1 experto compartido), 30 capas con atencion hibrida (5 capas de ventana deslizante de 1024 tokens seguidas de 1 capa de atencion global completa) y RoPE proporcional. El contexto nativo es de 256.000 tokens y el modelo es nativamente multimodal (texto e imagen), con presupuestos de tokens visuales variables de 70 a 1120 por imagen.

Su relevancia practica esta en el perfil coste/rendimiento: al activar solo unos 3.800 millones de parametros por pase, ofrece la huella de razonamiento de un modelo de 26B con el coste de inferencia de uno de 4B, algo que importa en cadenas de agentes con decenas de llamadas a herramientas. El autor lo orienta principalmente a escritura creativa, roleplay e inteligencia emocional, y advierte que para codigo agentico y uso de herramientas Qwen3.6 ha resultado netamente superior en sus pruebas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion hibrida (sliding-window 1024 + atencion global), p-RoPE |
| Parametros totales | 25.233.142.046 (25,2B) |
| Parametros activos | ~3,8B (top-8 de 128 expertos + 1 experto compartido) |
| Longitud de contexto | 256K tokens nativos |
| Tipos de cuantizacion | Q8_K_P, Q6_K_P, Q5_K_P, Q5_K_M, Q4_K_P, Q4_K_M, IQ4_XS, Q3_K_P, Q3_K_M, IQ3_M, Q2_K_P, IQ2_M; mmproj en f16 |
| Idiomas soportados | en (solo ingles declarado) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (mas mmproj f16 para vision) |
| Dimension oculta | 2816 |
| Dimension FFN | 2112 (experto MoE: 704) |
| Cabezas de atencion | 16 cabezas, 8 KV heads (2 en capas completas) |
| Dimension de cabeza | 256 (SWA) / 512 (full) |
| Vocabulario | 262144 |
| Capas | 30 |
| Modelo base | google/gemma-4-26B-A4B-it |
| Tamano del repo | 197,5 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Gemma 4 26B-A4B original: un transformer denso en atencion pero disperso en la capa feed-forward, con 128 expertos enrutados de los que se activan los 8 mejores por token mas un experto compartido siempre activo. La atencion es hibrida: cinco capas consecutivas usan ventana deslizante de 1024 tokens y la sexta aplica atencion global completa, patron que se repite a lo largo de las 30 capas. Esto mantiene barato el coste de contexto largo sin perder coherencia global, y se complementa con RoPE proporcional (p-RoPE). El modelo es nativamente multimodal: procesa texto e imagen, con presupuestos de tokens visuales configurables de 70, 140, 280, 560 o 1120 por imagen.

No se dispone de informacion sobre el dataset de entrenamiento del modelo base (numero de tokens, composicion, fases de RLHF/DPO) en la informacion proporcionada. Respecto al ajuste de este derivado, el autor indica explicitamente que no ha modificado datasets ni capacidades: el trabajo consiste en una recalibracion orientada a eliminar rechazos manteniendo el comportamiento del original, y menciona que la variante Balanced conserva una mayor estabilidad de muestreo en reejecuciones, lo que reduce la deriva tematica en sesiones de contexto largo. Las cuantizaciones se generaron con importance matrix (imatrix) y el autor define los quants K_P ("Perfect") como perfiles especificos por modelo que promueven el 25% de tensores mas importantes a un tipo de cuantizacion superior, con un sobrecoste de tamano del 5-15% respecto al quant base.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 256K tokens.
- Razonamiento y respuesta a instrucciones heredados del modelo base, sin los rechazos del original en la mayoria de casos.
- Procesamiento de imagen (image-text-to-text) con presupuestos de tokens visuales de 70 a 1120 por imagen.
- Escritura creativa, roleplay e interaccion orientada a inteligencia emocional, que el autor senala como caso de uso principal.
- Soporte de tool calling y flujos agenticos con multiples llamadas a herramientas encadenadas, aunque el autor considera a Qwen3.6 superior en esta tarea.
- Capacidades de codigo y matematicas heredadas del modelo base (no se detallan metricas).
- Multilingue limitado: solo se declara soporte de ingles.
- Modo de razonamiento previo a la respuesta: en la variante Balanced el modelo puede razonar una peticion sensible, anadir un breve marco de seguridad y despues entregar la respuesta completa.

## Casos de uso

- Escritura creativa y narrativa larga: con 256K de contexto y muestreo estable en reejecuciones, permite mantener arcos narrativos y voces de personaje coherentes a lo largo de sesiones extensas sin deriva tematica.
- Roleplay y compania conversacional: el ajuste sin censura y la orientacion a inteligencia emocional del modelo base lo hacen adecuado para personajes con respuestas sin filtros y memoria de contexto amplia.
- Analisis de documentos extensos con imagenes: la combinacion de contexto de 256K y entrada multimodal permite procesar informes con graficos o capturas y responder preguntas sobre ellos en una sola pasada.
- Asistencia a investigacion y temas sensibles: al eliminar rechazos en areas de seguridad, operaciones o investigacion adjuntas, es utilizable para redaccion tecnica sobre temas que el modelo base bloquearia.
- Automatizacion de agentes con muchas llamadas a herramientas: los ~3,8B parametros activos abaratan cada paso de una cadena de 10 o mas tool calls, aunque conviene validar la calidad frente a alternativas como Qwen3.6.
- Despliegue local en estaciones de trabajo: los quants Q4_K_P (17 GB) e IQ4_XS (14 GB) caben en GPU de consumo de 24 GB o incluso 16 GB, permitiendo inferencia privada sin dependencia de API.
- Generacion de codigo en pipelines internos: hereda las capacidades de codigo del base y puede integrarse via llama.cpp o LM Studio, con la cautela de que el autor no lo recomienda como primera opcion para codigo agentico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de evaluacion aportado por el autor es cualitativo: 0 rechazos en 465 pruebas (automatizadas y manuales), con algunos prompts limite que requieren reformulacion.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (pesos): IQ2_M 10 GB, Q2_K_P 11 GB, IQ3_M 12 GB, Q3_K_M / Q3_K_P 13 GB, IQ4_XS 14 GB, Q4_K_M / Q4_K_P 17 GB, Q5_K_M / Q5_K_P 19 GB, Q6_K_P 23 GB, Q8_K_P 27 GB. A esto hay que sumar el mmproj f16 (1,2 GB) si se usa vision y la cache KV para el contexto.
- GPU recomendadas: el autor sugiere Q4_K_P (17 GB) para trabajo de codigo porque cabe en 24 GB de VRAM con margen para contexto; Q8_K_P (27 GB) requiere mas de 24 GB o descarga parcial a CPU. Para el quant completo en una sola GPU hacen falta tarjetas tipo A100 40/80 GB o H100.
- GPU de consumo: Q4_K_P e IQ4_XS caben en RTX 4090 (24 GB); IQ3_M y Q2_K_P podrian caber en tarjetas de 12-16 GB con contexto reducido.
- Opciones de despliegue: llama.cpp (recomendado con `--jinja` para la plantilla de chat), LM Studio y cualquier runtime compatible con GGUF. Los quants K_P son compatibles sin builds especiales; en LM Studio pueden aparecer como "?" en la columna de cuantizacion por un problema de visualizacion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|---|
| Gemma4-26B-A4B-Uncensored-HauhauCS-Balanced | 25,2B | ~3,8B | 256K | Texto + vision | apache-2.0 | GGUF |
| google/gemma-4-26B-A4B-it (base) | 25,2B | ~3,8B | 256K | Texto + vision | no disponible en la informacion | safetensors (original) |
| Qwen3.6 (referencia del autor) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion con Qwen3.6 se basa unicamente en la afirmacion del autor de que ha resultado netamente superior en tareas de codigo agentico y uso de herramientas. No se dispone de datos cuantitativos de rendimiento para ninguno de los tres modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo sin censura: elimina deliberadamente los filtros de seguridad del original, lo que implica riesgo de generar contenido danado, ilegal o inseguro. No es apto para aplicaciones orientadas al publico sin capas de moderacion adicionales.
- El autor reconoce que un numero reducido de prompts limite sigue desviando la respuesta en el primer intento, aunque suele responder al reformular.
- Solo se declara soporte de ingles; el rendimiento en castellano no esta verificado y probablemente sea inferior.
- Riesgo de alucinacion inherente al modelo base; no se han publicado evaluaciones de fidelidad factual para este derivado.
- El autor desaconseja su uso como primera opcion para codigo agentico y tool use frente a Qwen3.6.
- La licencia declarada es apache-2.0, pero conviene verificar las condiciones del modelo base google/gemma-4-26B-A4B-it, cuyos terminos no se detallan en la informacion disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia: no hay validacion independiente de las afirmaciones del autor.
- El widget de compatibilidad de hardware de Hugging Face no reconoce los quants K_P y puede mostrar menos variantes de las que existen.
- El contexto efectivo en produccion dependera de la VRAM disponible para la cache KV; usar 256K tokens completos exige hardware muy superior al de una GPU de consumo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mdcreativeagent/Gemma4-26B-A4B-Uncensored-HauhauCS-Balanced
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Discord del autor: https://discord.gg/SZ5vacTXYf

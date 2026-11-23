# kelsey1337/Inkling-2-Mini-heretic-UD-Q4_K_XL-Maya-GGUF

## Resumen

Inkling-2-Mini-heretic UD-Q4_K_XL (Maya layout) es una cuantización GGUF de 17,3 GB del modelo Inkling-2-Mini, un transformer con mezcla de expertos (MoE) de 26.070 millones de parámetros totales, desarrollado originalmente por Thinking Machines. Esta variante concreta, publicada por el usuario kelsey1337, aplica una ablación de rechazos ("heretic", técnica de abliteration) sobre las proyecciones de salida de atención y la empaqueta en el formato looped antiguo de Unsloth que consume el motor Maya (`maya-ik2`), no el llama.cpp principal.

La relevancia de esta ficha es doble: por un lado ilustra el ecosistema de variantes "decensored" que eliminan el comportamiento de rechazo mediante edición quirúrgica de pesos; por otro, documenta un caso práctico de ingeniería de formato, ya que el autor sustituye 24 tensores de atención (21 realmente alterados) manteniendo el resto del archivo byte a byte idéntico al original de Unsloth, incluidos los expertos nativos en NVFP4 que Maya decodifica en registros.

El modelo conserva la ventana de contexto de 262.144 tokens, soporta visión mediante un codificador multimodal separado (`mmproj-BF16.gguf`) y está pensado para despliegue local en una única GPU de consumo. La licencia es Apache 2.0, aunque el uso está sujeto a la política de uso aceptable del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), arch `inkling2`, layout looped de Unsloth (`Old_Support/`) |
| Parametros totales | 26.070.390.272 (26,07 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | UD-Q4_K_XL (archivo principal); tensores de atención en Q8_0; expertos en NVFP4 nativo; drafter `mtp.safetensors` aparte |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (17,3 GB el archivo `Inkling-2-Mini-heretic-attn-UD-Q4_K_XL.gguf`; repo de 17,6 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de 26,07 B de parámetros con atención estándar; la variante aquí publicada no reentrena nada, sino que injerta pesos modificados. Concretamente, la ablación "Heretic ARA" (attention only) editó las 24 proyecciones de salida de atención (`model.llm.layers.N.attn.wo_ud.weight`, en BF16), de las cuales 21 cambiaron efectivamente; esas 24 matrices se sustituyen en el GGUF por `blk.N.attn_output.weight` cuantizadas a Q8_0. El resto de tensores es byte a byte idéntico al `UD-Q4_K_XL` de `unsloth/Inkling-2-Mini-GGUF`.

La verificación de mapeo reportada por el autor compara el tensor de Unsloth dequantizado con el BF16 de Heretic mediante similitud coseno: las tres capas no alteradas (blk 0, 1 y 23) coinciden a 0,99996 (redondeo Q8_0) y las 21 editadas entre 0,973 y 0,998, lo que corresponde exactamente al delta de la ablación. Se añade la clave de metadatos `general.heretic_graft` para registrar el intercambio. El autor no detalla la composición del dataset de entrenamiento original ni si hubo RLHF/DPO; esos datos no están disponibles en la información proporcionada. La innovación técnica destacable es el propio pipeline de injerto (`graft_heretic.py`, incluido) y el soporte del motor Maya para decodificar expertos NVFP4 en registros, además de decodificación especulativa opcional mediante el drafter DSpark (`mtp.safetensors`).

## Capacidades

- Generación de texto conversacional multi-turno con ventana de 262.144 tokens.
- Razonamiento y código: el autor reporta pruebas en un corpus técnico en inglés y mediciones de throughput en tareas de código y prosa.
- Visión: soportada a través del codificador multimodal `maya-vision` (encoder CPU) con `mmproj-BF16.gguf`; el autor verifica la descripción correcta de una imagen sintética (cuadrado rojo, círculo azul, texto "4090") en 5,1 s de extremo a extremo.
- Modo "thinking" conmutables (las pruebas de velocidad y de rechazo se hicieron con thinking desactivado).
- Decodificación especulativa mediante drafter DSpark (`mtp.safetensors`), que incrementa el throughput en las mediciones del autor.
- Comportamiento sin rechazos ("heretic"): responde a solicitudes que el modelo original declina, incluidas muestras de formación sobre phishing, ganzuado de cerraduras y combinaciones peligrosas de productos químicos domésticos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Idiomas: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y abliteration: el modelo permite estudiar empíricamente el efecto de editar únicamente las proyecciones de salida de atención, comparando el delta de perplejidad (+0,5 % frente al stock) con el cambio de comportamiento de rechazo (6/100 rechazos, KL 0,049).
- Evaluación de robustez frente a inyección de instrucciones: al ser más permeable a instrucciones embebidas en contenido no fiable, sirve para construir conjuntos de prueba de seguridad en pipelines de agentes, siempre en entornos aislados.
- Despliegue local en una RTX 4090: con 22,4 GB de VRAM a 262.144 tokens sin drafter (23,6 GB con él), es viable para asistentes de escritorio o estación de trabajo con contexto muy largo.
- Procesamiento de documentos técnicos extensos: la ventana de 256K permite ingerir repositorios completos o manuales largos en una sola pasada, con prefill medido de 4.619 t/s a 39K tokens en Maya.
- Análisis de imágenes con texto: el encoder de visión CPU permite clasificar o describir capturas, diagramas y paneles en flujos sin GPU adicional para el codificador.
- Generación de código asistida en local: con 244 t/s en tareas de código usando DSpark sobre una 4090, es adecuado para autocompletado y refactorización en entornos sin conexión.
- Investigación sobre cuantización y formatos GGUF: el repositorio documenta el injerto tensor a tensor y sirve como referencia reproducible para pipelines de conversión y verificación por similitud coseno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí reporta métricas propias de perplejidad y velocidad:

| Metrica | Resultado |
|---|---|
| Perplejidad, stock UD-Q4_K_XL (llama.cpp fork Unsloth b12568, CPU, 8 × 2048 tokens, corpus técnico inglés) | 4,9112 ± 0,130 |
| Perplejidad, injerto heretic (mismo protocolo) | 4,9355 ± 0,129 (+0,5 %) |
| Rechazos, Heretic ARA (attention only) | 6/100; KL 0,049 |
| Velocidad Maya sin drafter (RTX 4090, FP8 KV, 256K, greedy, thinking off): corto / código / prosa | 156 / 154 / 153 t/s |
| Velocidad Maya + DSpark: corto / código / prosa | 197 / 244 / 136 t/s |
| Velocidad Maya sin drafter: prompt 4,9K / 39K | 144 / 134 t/s |
| Velocidad Maya + DSpark: prompt 4,9K / 39K | 200 / 189 t/s |
| Prefill a 39K, Maya (sin/con drafter) | 4.619 / 4.583 t/s |
| llama.cpp principal + FA bias + fused ops, IQ4_XS: corto/código/prosa | 105 / 105 / 105 t/s |
| llama.cpp principal, prompt 4,9K / 39K / prefill 39K | 101 / 93 t/s / 2.427 t/s |

## Requisitos de hardware

- VRAM: 22,4 GB sin drafter y 23,6 GB con DSpark a 262.144 tokens de contexto (medido en RTX 4090 con KV en FP8).
- GPU recomendadas: RTX 4090 (verificado por el autor, compilando Maya con `-DCMAKE_CUDA_ARCHITECTURES=89`, commit `fcd523f`); el upstream de Maya apunta a RTX 3090 (`sm_86`). Para A100/H100 no hay datos publicados.
- Cabe en GPU de consumo: sí, en RTX 4090 con 24 GB; en tarjetas de 16 GB no cabe a contexto completo con esta cuantización.
- Opciones de despliegue: motor Maya (`maya-ik2`) con `serve/server.py --engine maya`; prebuilts de Unsloth (llama.cpp fork). No carga en llama.cpp principal por el layout looped antiguo; para ese caso el autor remite a `kelsey1337/Inkling-2-Mini-heretic-GGUF`.
- Throughput y latencia: ver tabla de benchmarks (134-244 t/s en generación según tarea y drafter; prefill de 4.583-4.619 t/s a 39K).
- Codificador de visión: `maya-vision` en CPU con `mmproj-BF16.gguf`; 5,1 s de extremo a extremo en la prueba sintética.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento de rechazo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Inkling-2-Mini-heretic UD-Q4_K_XL, Maya) | 26,07 B (MoE) | 262.144 | Reducido (6/100 en Heretic ARA) | Apache 2.0 | GGUF 17,3 GB, solo Maya y prebuilts Unsloth |
| unsloth/Inkling-2-Mini-GGUF (stock UD-Q4_K_XL) | 26,07 B (MoE) | 262.144 | Estándar del modelo original | Apache 2.0 | GGUF, compatible con llama.cpp |
| yanauto/Inkling-2-Mini-heretic (BF16) | 26,07 B (MoE) | no disponible | Reducido (6/100, KL 0,049) | Apache 2.0 | Pesos BF16 |
| kelsey1337/Inkling-2-Mini-heretic-GGUF (mainline) | 26,07 B (MoE) | 262.144 | Reducido | Apache 2.0 | GGUF para llama.cpp principal |

No se dispone de datos de benchmarks comparativos frente a modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- La abliteration elimina rechazos: el modelo responderá a solicitudes que el original declina. El usuario es responsable del cumplimiento legal y de la política de uso aceptable de Thinking Machines.
- Mayor susceptibilidad a inyección de instrucciones a través de contenido no fiable (páginas web, archivos de repositorio, salida de herramientas). No debe combinarse con credenciales activas ni acceso a shell sin sandbox.
- El archivo no carga en llama.cpp principal (layout looped antiguo); requiere Maya o los prebuilts de Unsloth, lo que limita la portabilidad.
- La evaluación de rechazos se hizo sobre Heretic ARA y no se repitió sobre este injerto; solo hay una comprobación puntual de tres casos en Maya.
- El coste de la ablación es un aumento de perplejidad del 0,5 % (4,9355 frente a 4,9112), medido en un corpus técnico inglés de 8 × 2048 tokens en CPU.
- No hay información sobre idiomas soportados, sesgos conocidos ni tasas de alucinación.
- La licencia Apache 2.0 no exime del cumplimiento de la política de uso aceptable del modelo original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria independiente.
- El autor declara que el injerto y la subida se realizaron con Claude Opus 5.5 operando el pipeline; conviene auditar los pesos de forma independiente antes de usos críticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kelsey1337/Inkling-2-Mini-heretic-UD-Q4_K_XL-Maya-GGUF
- Modelo base heretic: https://huggingface.co/yanauto/Inkling-2-Mini-heretic
- GGUF de Unsloth: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Variante para llama.cpp principal: https://huggingface.co/kelsey1337/Inkling-2-Mini-heretic-GGUF
- Motor Maya: https://github.com/alesha-pro/maya-inkling-mini
- Modelo original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/

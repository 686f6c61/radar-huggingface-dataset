# kelsey1337/Inkling-2-Mini-Unbound-UD-Q4_K_XL-Maya-GGUF

## Resumen

Inkling-2-Mini-Unbound UD-Q4_K_XL (Maya layout) es una cuantización GGUF en formato Q4_K_XL del modelo base nokeepai/Inkling-2-Mini-Unbound, un derivado "abliterated" y sin censura del Inkling-2-Mini de Thinking Machines. El modelo original es un transformer de tipo mezcla de expertos (MoE) con 26.070.390.272 parámetros totales (unos 26 mil millones), según los pesos en safetensors del repositorio base. Esta variante concreta ha sido generada por kelsey1337 injertando (grafting) los tensores de atención modificados de Unbound sobre el archivo UD-Q4_K_XL de unsloth, en el layout antiguo "looped" que consume el motor Maya (arch `inkling2`).

El interés técnico principal reside en el procedimiento de injerto: en lugar de recuantizar el modelo completo, se sustituyen únicamente los tensores de atención alterados por Unbound (20 tensores `attn_output` en las capas 4-23 en la versión v1.0; 120 tensores `attn_{q,k,v,output,gate}` en las 24 capas en v2), cuantizados a Q8_0, dejando el resto de tensores byte-idénticos al archivo de unsloth. Esto preserva los expertos nativos en NVFP4 que Maya decodifica en registros y mantiene la fidelidad del resto del modelo.

Existen dos variantes en el repositorio: v1.0, que solo aplica la edición de dirección de rechazo (refusal-direction), y v2, que añade un fine-tune de autodestilación. Ambas ocupan 17,6 GB cada una. El modelo está pensado exclusivamente para el motor Maya, no para llama.cpp estándar (el layout es incompatible), y su licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), arch `inkling2`, layout "looped" antiguo de Unsloth |
| Parametros totales | 26.070.390.272 (~26 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_XL (archivo principal); tensores de atención sustituidos en Q8_0; expertos nativos en NVFP4 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (dos archivos: v1.0 y v2, 17,6 GB cada uno) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer de mezcla de expertos (MoE) de aproximadamente 26 mil millones de parámetros totales. Esta variante GGUF mantiene los expertos nativos en NVFP4 (decodificados en registros por el motor Maya) y los tensores de atención en Q8_0. El layout es el "looped" antiguo de Unsloth, alojado en `Old_Support/`, y es leído por el motor Maya `maya-ik2`; no es compatible con llama.cpp estándar.

El proceso de "abliteration" del modelo base Unbound, atribuido íntegramente a nokeep, consiste en una edición de la dirección de rechazo (refusal-direction) en los pesos de atención. La versión v1.0 modifica los tensores `wo_ud` (attn_output) en las capas 4-23; la versión v2 modifica además `wq_du`, `wk_dv`, `wv_dv` y `gate_attn` en las 24 capas, y añade un fine-tune de autodestilación. Los tensores `wr_du`, `attn_sink_proj` y todos los expertos permanecen sin cambios. El injerto verifica la correspondencia de layout con un coseno ≥ 0,9974 entre el tensor desquantizado de unsloth y el de Unbound para cada tensor sustituido.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset original de Inkling-2-Mini ni los detalles de RLHF/DPO del modelo base. La model card indica que el fine-tune de v2 produce una deriva mayor respecto al original que v1.0 (KLD 0,032 frente a 0,010, según nokeep).

## Capacidades

- Generación de texto conversacional y razonamiento multi-turno, con modos de esfuerzo de razonamiento nombrados (`none`, `low`, `medium`, `high`, etc.) en el motor Maya.
- Modo "thinking" (razonamiento explícito) activable y desactivable; en v2 el modelo razona más tiempo con esfuerzo alto.
- Capacidades de visión mediante `maya-vision` y el proyector `mmproj-BF16.gguf` de unsloth, que funcionan sin cambios con ambas variantes.
- Decodificación especulativa mediante el drafter DSpark (`mtp.safetensors`), que funciona con ambas variantes.
- Respuestas a solicitudes que el modelo original rechaza (comportamiento "uncensored"), con mayor tendencia a seguir instrucciones inyectadas vía contenido no confiable.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineación y seguridad: comparar el comportamiento del modelo original frente a las variantes v1.0 y v2 permite estudiar el efecto de la edición de dirección de rechazo y del fine-tune de autodestilación sobre las tasas de rechazo y evasión (hedging).
- Evaluación de técnicas de injerto de pesos: el repositorio incluye el script `graft_attn.py` y documenta la verificación por coseno, lo que sirve como referencia reproducible para pipelines de sustitución selectiva de tensores en modelos cuantizados.
- Despliegue en una única RTX 4090: con 17,6 GB por archivo y el motor Maya, el modelo cabe en una GPU de consumo de 24 GB y alcanza 197-244 t/s con el drafter DSpark, lo que permite prototipado local de asistentes conversacionales.
- Generación de texto creativo sin restricciones temáticas: útil en entornos controlados de escritura de ficción o guiones donde se requiere explorar contenido que el modelo original declina.
- Análisis de robustez frente a inyección de prompts: al ser más susceptible a instrucciones inyectadas, sirve para probar defensas en pipelines que procesan contenido no confiable (páginas web, archivos de repositorio, salidas de herramientas).
- Experimentación con razonamiento de esfuerzo variable: los modos `none` a `high` permiten ajustar el coste computacional por consulta en tareas de razonamiento multi-paso.
- Investigación sobre deriva de perplexity: la comparación documentada (PPL 4,9112 del stock frente a 4,9415 de v1.0 y 5,1192 de v2) ofrece un caso de estudio sobre el coste de las ediciones de pesos en modelos MoE cuantizados.

## Benchmarks y rendimiento

Los datos disponibles son mediciones de perplexity y tasas de rechazo realizadas por el autor, no benchmarks estándar (MMLU, HumanEval, GSM8K). No se han publicado resultados de benchmarks en la información disponible.

| Metrica | Stock unsloth UD-Q4_K_XL | Heretic graft | Unbound v1.0 | Unbound v2 |
|---|---|---|---|---|
| Perplexity (8 × 2048 tokens, corpus técnico inglés) | 4,9112 ± 0,130 | 4,9355 (+0,5%) | 4,9415 (+0,6%) | 5,1192 (+4,2%) |
| Rechazos/evasiones, thinking off (de 36) | rechaza | 0 / 3 | 1 / 7 | 3 / 6 |
| Rechazos/evasiones, thinking on (de 36) | rechaza | 1 / 9 | 0 / 8 | 0 / 8 |

Notas de medición: perplexity calculada con llama.cpp b12568 (fork de Unsloth) en CPU; rechazos evaluados con 12 solicitudes comúnmente rechazadas, 3 ejecuciones cada una a temperatura 1,0, con puntuación por palabras clave. La model card cita además una evaluación propia de nokeep con 277 prompts: v2 da una respuesta genuinamente útil en el 78,7% (thinking off) y 83,4% (thinking on) de los casos, frente a 51,6% y 62,1% de v1.0. El autor señala que la comprobación local de 12 prompts es demasiado gruesa para detectar esa diferencia a temperatura 1,0.

## Requisitos de hardware

- VRAM estimada: 17,6 GB por archivo GGUF Q4_K_XL, más overhead del motor Maya y del proyector de visión si se usa.
- GPU recomendadas: RTX 4090 (24 GB) validada por el autor; se alcanzan 197-244 t/s en una sola RTX 4090 con el drafter DSpark.
- GPU de consumo: cabe en RTX 4090 y, presumiblemente, en cualquier GPU con al menos ~20 GB de VRAM libre; no cabe en GPUs de 16 GB o menos con este archivo.
- Opciones de despliegue: exclusivamente el motor Maya (`maya-ik2`, repositorio github.com/alesha-pro/maya-inkling-mini). Estos archivos no cargan en llama.cpp estándar por incompatibilidad de layout; para llama.cpp estándar debe usarse nokeepai/Inkling-2-Mini-Unbound-GGUF.
- Latencia y throughput: 197-244 t/s medidos en una RTX 4090 con Maya fcd523f compilado para sm_89 y el drafter DSpark.
- El drafter DSpark requiere descargar `mtp.safetensors` desde thinkingmachines/Inkling-2-Mini.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-Unbound UD-Q4_K_XL (Maya) | ~26 mil millones | no disponible | Apache 2.0 | GGUF, solo motor Maya | Variante injertada; PPL 4,94 (v1.0) / 5,12 (v2) |
| nokeepai/Inkling-2-Mini-Unbound-GGUF | ~26 mil millones | no disponible | Apache 2.0 | GGUF, llama.cpp estándar | Versión recomendada para llama.cpp mainline |
| Inkling-2-Mini-heretic-UD-Q4_K_XL-Maya-GGUF (kelsey1337) | ~26 mil millones | no disponible | Apache 2.0 | GGUF, motor Maya | Injerto heretic; PPL 4,9355 (+0,5%) |
| unsloth/Inkling-2-Mini-GGUF (stock) | ~26 mil millones | no disponible | Apache 2.0 | GGUF, llama.cpp | Modelo original sin modificar; PPL 4,9112 |

No se dispone de datos de contexto ni de benchmarks estándar para establecer comparaciones de rendimiento con modelos de otras familias.

## Limitaciones y advertencias

- El modelo sigue instrucciones dañinas y da respuestas detalladas a solicitudes que el original declina; el usuario es responsable del uso y del cumplimiento de la política de uso aceptable de Thinking Machines.
- Mayor susceptibilidad a instrucciones inyectadas vía contenido no confiable (páginas web, archivos de repositorio, salidas de herramientas); no debe combinarse con credenciales activas ni acceso a shell sin sandbox.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos de lenguaje.
- Sesgos conocidos: no documentados en la información proporcionada.
- La versión v2 incrementa la perplexity aproximadamente un 4,2% respecto al stock (5,1192 frente a 4,9112) y se aleja más del modelo original (KLD 0,032 frente a 0,010 de v1.0).
- A temperatura 0, v2 entra en bucles de repetición en 4 de 36 respuestas con thinking activado; se recomienda temperatura 1,0.
- Incompatibilidad de layout con llama.cpp estándar: no cargará fuera del motor Maya.
- Idiomas soportados y longitud de contexto no documentados; no asumir cobertura multilingüe sin verificación.
- Licencia Apache 2.0 declarada, pero el modelo base y su política de uso aceptable pueden imponer restricciones adicionales al uso comercial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kelsey1337/Inkling-2-Mini-Unbound-UD-Q4_K_XL-Maya-GGUF
- Modelo base Unbound: https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound
- GGUF de Unbound para llama.cpp: https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound-GGUF
- GGUF de unsloth: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Variante heretic del mismo autor: https://huggingface.co/kelsey1337/Inkling-2-Mini-heretic-UD-Q4_K_XL-Maya-GGUF
- Motor Maya: https://github.com/alesha-pro/maya-inkling-mini
- Modelo original Inkling-2-Mini: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/

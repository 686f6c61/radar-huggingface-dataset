# duckpage/ornith-15-122b-mls4

## Resumen

Ornith-1.5-122B MLS4 es una conversión de precisión del modelo multimodal Ornith-1.5-122B (desarrollado por ornith-ai) al formato MLS4 del motor de inferencia Malleus, obra del usuario duckpage. No se trata de un modelo nuevo ni de un fine-tuning: es el mismo checkpoint base, con los pesos cuantizados a 4 bits (W4A8, grupo de 128) y empaquetados en un contenedor GGUF v3 propietario con extensión `.malleus`. El objetivo es hacer viable la ejecución de un MoE de 125B parámetros en hardware AMD RDNA 3.5 (APUs Strix Halo, gfx1150/gfx1151), donde no existe soporte práctico de otros runtimes.

El modelo base es un transformer de mezcla de expertos con 256 expertos y 8 activos por token, 48 capas y 262 144 tokens de contexto nativo, con pipeline image-text-to-text (visión-lenguaje). La conversión preserva esa arquitectura y añade una cabeza MTP (`nextn`) para decodificación especulativa. La relevancia actual es doble: por un lado, demuestra que un MoE de 122B a 4 bits puede residir íntegramente en una APU de 128 GB de memoria unificada; por otro, documenta con medidas reales el compromiso entre residencia completa (72,6 GiB, 13,7 tok/s) y caché de expertos en NVMe (44,6 GiB vivos, 1,5-3 tok/s).

La licencia es MIT, heredada del modelo original, y el motor Malleus es Apache-2.0. El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicación muy reciente (16 de noviembre de 2026) y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (256 expertos, 8 activos), 48 capas, cabeza MTP `nextn` para decodificacion especulativa |
| Parametros totales | 125B (122B nominales en el nombre) |
| Parametros activos | 8 expertos de 256 por token (numero exacto de parametros activos no disponible) |
| Longitud de contexto | 262 144 tokens nativos |
| Tipos de cuantizacion | MLS4: 4 bits, grupo de 128, rotacion Hadamard aleatorizada, calibracion GPTQ, W4A8 (pesos 4 bits, activaciones 8 bits) |
| Idiomas soportados | no disponible |
| Licencia | MIT (modelo original); motor Malleus Apache-2.0 |
| Formato de pesos | Contenedor GGUF v3 con extension `.malleus` (66,8 GB en disco) |
| Modalidad | image-text-to-text (vision-lenguaje) |
| Hardware objetivo | AMD RDNA 3.5, gfx1150 / gfx1151 (APUs Strix Halo) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 256 expertos enrutados y 8 activos por token, distribuidos en 48 capas, con una ventana de contexto nativa de 262 144 tokens. La conversión MLS4 no altera la topología: cambia únicamente el formato de almacenamiento y la precisión de los pesos. El checkpoint incluye una capa `nextn` (cabeza MTP) que el motor Malleus emplea para decodificación especulativa, con una comprobación de exactitud (`malleus spec-exact`) que actúa como puerta de calidad.

La cuantización MLS4 aplica una rotación Hadamard aleatorizada seguida de calibración GPTQ, con grupo de 128 y esquema W4A8: una sola copia de pesos de 4 bits sirve tanto para prefill como para decode, sin una segunda copia más ancha en dispositivo. El resultado son 66,8 GB en disco. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base pasó por RLHF o DPO; la model card de la conversión no lo detalla.

La innovación técnica destacable es la gestión de memoria: el motor puede mantener los expertos enrutados en NVMe y cachearlos por capa mediante `MALLEUS_EXPERT_CACHE=<GiB>`, lo que reduce la residencia a 44,6 GiB a costa de transmitir 59,8 GB de expertos por chunk en prefill (~76 s por chunk) y de caer a 1,5-3 tok/s en decode.

## Capacidades

- Generación de texto y razonamiento multi-turno con contexto de hasta 262 144 tokens.
- Procesamiento de imagen y texto de forma conjunta (pipeline image-text-to-text), lo que habilita tareas de descripción, extracción y razonamiento sobre imágenes.
- Decodificación especulativa mediante la cabeza MTP integrada en el checkpoint, con verificación de exactitud en el motor.
- Ejecución de un MoE de gran tamaño en una única APU AMD RDNA 3.5, sin GPU discreta.
- Soporte de tool calling, function calling y flujos de agente: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Inferencia local de gran modelo en APU Strix Halo: un equipo con 128 GB de memoria unificada puede servir el modelo completo a 4 bits con 262 144 tokens de contexto, sin GPU dedicada, usando `malleus serve --ctx 262144`. Es el escenario para el que se diseñó la conversión.
- Procesamiento de documentos largos con imagen: gracias al contexto nativo de 262 144 tokens y al pipeline image-text-to-text, se pueden analizar informes escaneados, planos o capturas junto con texto extenso en una sola sesión.
- Laboratorio de evaluación de cuantizaciones: el formato MLS4 con rotación Hadamard y GPTQ puede compararse contra el checkpoint bf16 mediante `malleus golden`, con tensores de referencia publicados en `duckpage/malleus-golden`, para medir la degradación introducida por los 4 bits.
- Despliegue en entornos con restricciones de memoria: con `MALLEUS_EXPERT_CACHE=24`, el modelo mantiene 44,6 GiB vivos y deja el resto de expertos en NVMe, lo que permite ejecutarlo en máquinas de 96 GB GTT aceptando latencias de 1,5-3 tok/s para tareas por lotes no interactivas.
- Investigación sobre decodificación especulativa: la cabeza MTP y la comprobación `spec-exact` permiten estudiar el rendimiento y la fidelidad de la decodificación especulativa en un MoE de 125B cuantizado.
- Prototipado de asistentes multimodales sin infraestructura cloud: al ser MIT y ejecutarse en una sola caja, encaja en entornos con requisitos de soberanía de datos o sin conectividad.
- Validación de motores de inferencia alternativos: sirve como carga de prueba realista para medir el comportamiento de Malleus frente a otros runtimes en hardware AMD, con cifras publicadas en `MODELS.md`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card remite a `malleus golden` para la comparación contra el checkpoint bf16, pero no incluye puntuaciones.

Los únicos datos de rendimiento publicados son medidas de ejecución del motor, tomadas el 2026-11-15:

| Modo | Memoria viva | Throughput decode | Notas |
|---|---|---|---|
| Residente completo | 72,6 GiB (pesos + estado de sesión + working set) | 13,7 tok/s | Requiere APU de 128 GB; con otros contenedores provocó OOM global en un host de 93,4 GiB (issue #75) |
| Expertos en NVMe (`MALLEUS_EXPERT_CACHE=24`) | 44,6 GiB | 1,5-3 tok/s | Prefill transmite 59,8 GB de expertos por chunk (~76 s por chunk) |

## Requisitos de hardware

- VRAM/GTT estimada: 72,6 GiB en modo residente (pesos, estado de sesión y working set); 44,6 GiB con caché de expertos de 24 GiB en NVMe.
- Hardware objetivo: APUs AMD RDNA 3.5, gfx1150/gfx1151 (Strix Halo). El plan declarado es una APU de 128 GB; en un host de 96 GB GTT con otros contenedores se produjo OOM.
- GPU discretas (A100, H100, RTX 4090): no soportadas por el motor Malleus según la información disponible; el motor está dirigido a RDNA 3.5.
- Cabe en GPU de consumo: no en el sentido habitual; requiere memoria unificada de APU de gran capacidad, no VRAM de tarjeta gráfica.
- Almacenamiento: 66,8 GB para el archivo `.malleus`; con caché de expertos en disco se necesita espacio adicional en NVMe para los 59,8 GB de expertos.
- Opciones de despliegue: exclusivamente Malleus, distribuido como imagen de contenedor (`podman build -f deploy/Containerfile --target runtime`). No hay soporte de vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: 13,7 tok/s en modo residente; 1,5-3 tok/s con expertos en NVMe; ~76 s por chunk de prefill en ese segundo modo.
- El motor imprime un pre-flight con pesos, estado por sesión y working set antes de asignar memoria, y rechaza la ejecución con una cifra en lugar de fallar dentro del allocator.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / precision | Hardware | Licencia |
|---|---|---|---|---|---|
| Ornith-1.5-122B MLS4 (esta ficha) | 125B (MoE, 8/256 activos) | 262 144 | MLS4 4 bits W4A8, `.malleus` | APU AMD RDNA 3.5, 128 GB | MIT |
| ornith-ai/Ornith-1.5-122B (base) | 125B (MoE, 8/256 activos) | 262 144 | bf16 (safetensors, presumiblemente) | GPU de datacenter con memoria suficiente | MIT |
| Otras conversiones MLS4 de duckpage | no disponible | no disponible | MLS4 4 bits | APU AMD RDNA 3.5 | MIT |

No se dispone de datos de benchmarks que permitan comparar rendimiento de calidad entre estas variantes. La comparación relevante es de formato y hardware: el checkpoint bf16 original no es ejecutable en una APU de 128 GB, mientras que la conversión MLS4 sí, a costa de la degradación propia de los 4 bits.

## Limitaciones y advertencias

- La cuantización a 4 bits introduce degradación respecto al bf16; la model card no publica las puntuaciones de `malleus golden`, solo indica que existen tensores de referencia.
- El modo residente exige 72,6 GiB y una APU de 128 GB dedicada; con otros contenedores en un host de 93,4 GiB se produjo un OOM global (issue #75).
- El modo con expertos en NVMe reduce la residencia a 44,6 GiB pero degrada el decode a 1,5-3 tok/s y el prefill a ~76 s por chunk, lo que lo hace inviable para uso interactivo.
- Dependencia total del motor Malleus: el formato `.malleus` no es compatible con vLLM, llama.cpp, Ollama ni TGI, y el motor solo soporta AMD RDNA 3.5 (gfx1150/gfx1151).
- Idiomas soportados no documentados; no se puede garantizar calidad multilingüe.
- No hay información sobre sesgos, tasas de alucinación ni evaluación de seguridad del modelo base en la información proporcionada.
- Licencia MIT: permite uso comercial sin restricciones adicionales, pero la responsabilidad sobre el comportamiento del modelo recae en quien lo despliega; los derechos de autor permanecen en ornith-ai.
- Publicación con 0 descargas y 0 likes; no hay evidencia de uso en producción ni validación independiente.
- El pipeline declarado es image-text-to-text, pero la model card no detalla el codificador visual ni el rendimiento en tareas multimodales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/duckpage/ornith-15-122b-mls4
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B
- Repositorio del motor Malleus: https://github.com/duckpage/malleus
- Documentación de rendimiento por modelo (MODELS.md): https://github.com/duckpage/malleus/blob/main/MODELS.md
- Containerfile de despliegue: https://raw.githubusercontent.com/duckpage/malleus/main/deploy/Containerfile
- Tensores de referencia para `malleus golden`: https://huggingface.co/datasets/duckpage/malleus-golden
- Código del formato GGUF/MLS4: `src/crates/malleus-gguf` dentro del repositorio del motor
- Issues de referencia: #75 (OOM en host de 93,4 GiB) y #81 (medidas de caché de expertos) en el repositorio de Malleus

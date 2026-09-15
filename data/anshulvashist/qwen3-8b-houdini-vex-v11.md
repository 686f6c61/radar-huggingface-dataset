# anshulVashist/Qwen3-8B-Houdini-VEX-v11

## Resumen

Qwen3-8B-Houdini-VEX-v11 (denominado "Grandmaster Edition" por su autor) es un ajuste fino de Qwen3-8B especializado en la generacion de codigo VEX para SideFX Houdini, el lenguaje de scripting de la herramienta de efectos visuales y grafos procedurales. Lo desarrolla Anshul Vashist y se publica bajo licencia Apache 2.0, con pesos completos en safetensors, cuantizaciones GGUF y un adaptador LoRA PEFT. El modelo hereda la arquitectura transformer decoder de Qwen3 con 8.190.735.360 parametros totales, por lo que su huella en VRAM es la de un 8B convencional.

El problema que aborda es muy concreto: los modelos de codigo generalistas fallan en VEX porque el lenguaje tiene semanticas propias (tipos de atributo como `v@`/`p@`/`i@`, paralelismo SIMD/CVEX, cuaterniones para orientacion, funciones con firmas sobrecargadas y sin documentacion masiva en la web). El autor indica que el entrenamiento incluye validacion "Compiler-in-the-Loop" contra el compilador nativo `vcc` de SideFX para reducir errores de sintaxis y alucinacion de firmas.

Su relevancia es de nicho pero alta dentro del sector VFX: se distribuye junto a una HDA de codigo abierto (`ai_attribwrangle.hda`) que permite generar VEX directamente sobre geometria en el viewport de Houdini. Los contadores publicos del repositorio (0 descargas, 0 likes en el momento de la consulta) indican que es un modelo recien publicado y sin validacion independiente de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3), ajustado con LoRA sobre unsloth/Qwen3-8B |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen3-8B declara 32.768 tokens nativos. El ejemplo de despliegue del autor usa `--ctx-size 4096` |
| Tipos de cuantizacion | GGUF Q5_K_M (5,85 GB), GGUF Q8_0 (8,71 GB), safetensors FP16 sin cuantizar (15,6 GB), adaptador LoRA PEFT (rank 64, alpha 128, ~700 MB) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF y adaptador PEFT safetensors |

## Arquitectura y entrenamiento

La base es Qwen3-8B, un transformer decoder denso con atencion por causalidad, publicado por el equipo Qwen y en este caso redistribuido por Unsloth (`unsloth/Qwen3-8B`) como modelo de partida. Sobre esa base se aplica un ajuste fino tipo LoRA con rango 64 y alpha 128, cuyo adaptador se publica por separado; el repositorio incluye ademas los pesos ya fusionados en FP16. El entrenamiento se realizo con el framework Unsloth, que el autor cita explicitamente en los tags.

El autor describe una innovacion central: validacion "Compiler-in-the-Loop" (CITL), es decir, auditoria y entrenamiento contra el compilador `vcc` nativo de SideFX para penalizar funciones obsoletas, firmas incorrectas y errores de sintaxis. Tambien menciona correccion de errores negativos (evitar habitos de GLSL como `vec3`, confusion entre `p@orient` y `v@orient`, o el mal uso de `smooth` frente a `smoothstep`) y un modo dual de razonamiento: "Turbo" (emite solo el fragmento VEX compilable) y "Deep Reasoning" (genera primero un bloque `<think>...</think>` con el analisis geometrico y matematico antes del codigo).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF o DPO. Tampoco se documentan detalles del tokenizador ni si se amplio la ventana de contexto original del modelo base.

## Capacidades

- Generacion de codigo VEX para contextos de `Point wrangle`, `Detail wrangle` y `Primitive wrangle`.
- Razonamiento geometrico y vectorial: desplazamiento a lo largo de normales, ruido curl 3D, mascaras de altitud, distribuciones procedurales (por ejemplo, espiral de Fibonacci sobre esfera unitaria).
- Matematicas de rotacion: cuaterniones y matrices (`p@orient = dihedral(...)`, `qrotate`, `matrix3`, transformaciones lookat).
- Operaciones sobre volumenes y VDB: comprobaciones de limites, guardas con `nametoprim`, adveccion de gradientes volumetricos.
- Modo "thinking" explicito mediante bloques `<think>...</think>` que separan el analisis del codigo final.
- Modo Turbo orientado a salida directa sin markdown ni texto conversacional, pensado para insertarse en un nodo wrangle.
- Salida con formato de chat Qwen (`<|im_start|>` / `<|im_end|>`), compatible con plantillas de chat de transformers.
- Capacidades de codigo general, matematicas y conversacion heredadas de Qwen3-8B, aunque el ajuste esta fuertemente orientado al dominio VEX.
- No se documentan capacidades de vision, audio, tool calling ni function calling especificas en la informacion disponible.

## Casos de uso

- Generacion de VEX dentro de Houdini: mediante la HDA `ai_attribwrangle.hda`, el artista escribe la tarea en lenguaje natural y el modelo devuelve un fragmento VEX que se inserta en un nodo Attribute Wrangle, con el modelo servido localmente por `llama-server` en el puerto 58421.
- Distribuciones procedurales de geometria: generar codigo para repartir puntos sobre superficies o esferas (Fibonacci, ruido, scatter con densidad variable) sin escribir la trigonometria a mano.
- Orientacion y alineacion de primitivas: usar `dihedral`, `qrotate` o `matrix3` para orientar copias hacia un objetivo o construir sistemas de particulas alineadas; el modelo esta entrenado especificamente en estas funciones.
- Efectos temporales y simulaciones ligeras: ondas de choque radiales multi-octava, mascaras de espuma secundaria o desplazamientos con ruido curl aplicados por frame, con el tiempo como variable de entrada.
- Trabajo con volumenes y VDB: adveccion de gradientes, comprobaciones de existencia de topologia y conversion de campos volumetricos, donde el modelo incorpora guardas explicitas para evitar errores en tiempo de ejecucion.
- Estandarizacion en pipelines de estudio: generar fragmentos VEX homogeneos para revisión por parte de un TD, usando el modo Deep Reasoning para que el artista vea la justificacion matematica antes de aceptar el codigo.
- Formacion y documentacion interna: producir explicaciones paso a paso de algoritmos procedurales (hash espacial, muestreo SIMD) que sirvan como material de onboarding para artistas tecnicos.
- Prototipado rapido fuera de Houdini: usar el adaptador LoRA con transformers o los GGUF con Ollama para experimentar con generacion de VEX en notebooks, sin depender de una instalacion completa de Houdini.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas numericas (ni MMLU, ni HumanEval, ni evaluaciones especificas de VEX), y la busqueda web realizada no devolvio ningun resultado relevante sobre el modelo. El unico indicador de calidad aportado por el autor es cualitativo: la validacion contra el compilador `vcc` durante el entrenamiento.

## Requisitos de hardware

- VRAM estimada segun los tamanos de fichero publicados: unos 6 GB para Q5_K_M (5,85 GB de pesos), unos 9 GB para Q8_0 (8,71 GB) y unos 16 GB para safetensors FP16 (15,6 GB), en todos los casos mas el margen para el contexto y el runtime.
- El autor recomienda explicitamente Q5_K_M para GPU con 8-12 GB de VRAM y Q8_0 para estaciones de trabajo con 16 GB o mas.
- Cabe en GPU de consumo: si, en tarjetas de 8-12 GB (por ejemplo, gama RTX 3060 12 GB, RTX 4070, RTX 3080) con la cuantizacion Q5_K_M, y en tarjetas de 16 GB o mas con Q8_0.
- Opciones de despliegue documentadas: `llama.cpp` / `llama-server` (ejemplo con `--n-gpu-layers 36`), Ollama (los GGUF estan etiquetados para ello), transformers con PyTorch y el adaptador LoRA PEFT, y text-generation-inference segun el tag del repositorio. No se documenta vLLM.
- Latencia y throughput: no disponibles. El autor no publica mediciones de tokens por segundo ni de tiempo de generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-8B-Houdini-VEX-v11 | 8.190.735.360 | No disponible en la model card | VEX de SideFX Houdini | Apache 2.0 | HuggingFace, GGUF, LoRA, HDA |
| unsloth/Qwen3-8B (modelo base) | 8B (dato exacto no disponible) | 32.768 tokens nativos segun Qwen3 | Codigo y proposito general | Apache 2.0 | HuggingFace |
| Otros fine-tunes especificos de VEX | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion sobre modelos comparables en el mismo nicho (VEX de Houdini) ni de resultados de benchmarks que permitan una comparacion cuantitativa con alternativas. La unica comparacion posible con los datos disponibles es contra el modelo base, del que este ajuste hereda parametros, licencia y arquitectura.

## Limitaciones y advertencias

- El modelo solo declara soporte de ingles (`language: en`); no se ha validado su comportamiento en castellano ni en otros idiomas.
- El dataset de entrenamiento no esta documentado: no se conoce su tamano, procedencia ni licencia, por lo que no puede evaluarse el sesgo de dominio ni el riesgo de reproducir codigo de terceros.
- Riesgo de alucinacion de funciones y firmas VEX. Aunque el autor afirma haberlo mitigado con validacion contra `vcc`, no hay evaluacion independiente que lo confirme; se recomienda compilar siempre la salida antes de usarla en produccion.
- El modo "Deep Reasoning" introduce bloques `<think>` que consumen tokens de salida y pueden requerir postprocesado para extraer solo el fragmento VEX.
- La ventana de contexto efectiva no esta documentada y el ejemplo del autor limita `--ctx-size` a 4096, valor insuficiente para tareas que requieran arrastrar mucho codigo o geometria previa.
- Fuerte sobreespecializacion: como modelo de proposito general probablemente rinde peor que su base; su uso tiene sentido solo en el dominio VEX.
- Ausencia de validacion por la comunidad: 0 descargas y 0 likes en el momento de la consulta, y no se han encontrado referencias externas, discussion threads ni evaluaciones de terceros.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero conviene verificar las condiciones de los pesos base de Qwen3-8B y del compilador `vcc` de SideFX, que es una herramienta propietaria y no se redistribuye con el modelo.
- La model card parece estar truncada (el ultimo ejemplo de prompt queda cortado), por lo que parte de la documentacion de uso podria faltar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/anshulVashist/Qwen3-8B-Houdini-VEX-v11
- Modelo base: https://huggingface.co/unsloth/Qwen3-8B
- Repositorio de la HDA para Houdini (AI Attribute Wrangle): https://github.com/anshul-vashist/Houdini-Ai-Attribute-Wrangle
- Framework de entrenamiento Unsloth: https://github.com/unslothai/unsloth
- La busqueda web realizada no devolvio resultados relevantes sobre el modelo, su paper o evaluaciones independientes.

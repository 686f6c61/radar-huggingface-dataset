# prabanta-dev/Qwen3-30B-A3B-JNS

## Resumen

Qwen3-30B-A3B-JNS es una redistribución de los pesos de Qwen/Qwen3-30B-A3B, el modelo de mezcla de expertos (MoE) de Alibaba Cloud, convertidos al formato JNS que consume Janas, un motor de inferencia escrito en C y orientado a equipos convencionales, con o sin GPU. No se ha reentrenado ni podado nada: cada fichero parte de una cuantización GGUF ya existente y se reescribe en el orden de lectura de Janas, conservando los metadatos. El repositorio ocupa 51 GB e incluye tres variantes (18,56 GB, 13,83 GB y 18,63 GB).

El interés de esta ficha es doble. Por un lado, documenta una vía de ejecución local de un MoE de 30 000 millones de parámetros en hardware de portátil: en un Intel Core Ultra 9 185H con GPU Arc integrada y 32 GB de memoria, el autor declara 135 tok/s de lectura de prompt y 32 tok/s de escritura, frente a 122 y 15 tok/s de llama.cpp en el mismo equipo. Por otro, ilustra un caso poco habitual de empaquetado: los expertos se almacenan en ranuras independientes por capa y experto, y las matrices down se reordenan en tres planos de dos bits, de modo que se pueden leer de disco solo los expertos que necesita cada token.

La relevancia práctica está limitada por el formato: los ficheros .jns solo los lee Janas. Quien quiera usar vLLM, llama.cpp, Ollama o TGI debe recurrir a los GGUF originales de Qwen, bartowski o unsloth.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre transformer, según el modelo base Qwen3-30B-A3B |
| Parámetros totales | 30 000 millones (denominación «30B» del modelo base; la información proporcionada no incluye desglose por capa) |
| Parámetros activos | ~3 000 millones (denominación «A3B» del modelo base; no se detalla el número de expertos activados) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Tres ficheros: Q4_K_M (`q4km`), UD-Q3_K_XL de unsloth (`q3`) y Q4_K_M de bartowski (`imatrix`); todos convertidos a JNS |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (la misma que el modelo original) |
| Formato de pesos | JNS, formato nativo del motor Janas, derivado de GGUF; solo lo interpreta Janas |
| Motor de inferencia | Janas (C, licencia GPL-3.0-or-later; no afecta a estos pesos) |
| Repositorio | 51,0 GB |

Ficheros publicados:

| Fichero | Tamaño | Origen | SHA-256 |
|---|---:|---|---|
| `qwen3-30b-a3b-q4km.jns` | 18,56 GB | `Qwen3-30B-A3B-Q4_K_M.gguf` de Qwen | `3fa0185b…18e895` |
| `qwen3-30b-a3b-udq3kxl.jns` | 13,83 GB | `Qwen3-30B-A3B-UD-Q3_K_XL.gguf` de unsloth | `7a77e62a…97656` |
| `qwen3-30b-a3b-bq4km.jns` | 18,63 GB | `Qwen_Qwen3-30B-A3B-Q4_K_M.gguf` de bartowski | `bee2aa5a…c83ea` |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base, un transformer con mezcla de expertos de 30 000 millones de parámetros totales y unos 3 000 millones activos por token, tal como refleja la nomenclatura «30B-A3B». No hay ningún entrenamiento adicional en esta publicación: no se ha reentrenado, ni ajustado, ni podado. Todo el trabajo es de conversión y reordenación de bits sobre cuantizaciones GGUF de terceros (Qwen, unsloth, bartowski), y así se declara explícitamente como obra modificada conforme a la Apache 2.0.

La innovación técnica está en el proceso de conversión, ejecutado por `gguf2jns`: cada par (capa, experto) recibe una ranura propia para que los expertos que necesita un token se puedan leer de disco de forma aislada, sin cargar el resto del modelo. Además, `jns_planes` divide las matrices down de los expertos en tres planos de dos bits cada uno; se trata de una reordenación de los mismos bits que, sumando los tres planos, reconstruye los pesos cuantizados sin pérdida. Los detalles de entrenamiento del modelo original (número de tokens, composición del corpus, etapas de RLHF o DPO) no se incluyen en la información proporcionada.

## Capacidades

- Generación de texto: es el único pipeline declarado en la ficha del repositorio (`text-generation`).
- Inferencia en local sobre CPU y sobre GPU integrada (se ha medido con una Arc integrada) mediante el motor Janas.
- Lectura selectiva de expertos desde disco, gracias a la disposición en ranuras por capa y experto.
- Conversación interactiva mediante la utilidad `janas-chat`, que sin argumentos muestra el catálogo de modelos disponibles.
- Descarga y verificación de integridad mediante `janas-get`, que contrasta las huellas SHA-256 publicadas.
- Capacidades heredadas del modelo base (razonamiento, código, matemáticas, multilingüismo, modo thinking, tool calling): no se documentan en la información proporcionada. La referencia válida es la model card de Qwen/Qwen3-30B-A3B.

## Casos de uso

- Asistente de programación en portátil: el modelo activa solo ~3 000 millones de parámetros por token y ocupa 13,83 GB en su variante de 3 bits, de modo que puede mantenerse residente en un equipo con 32 GB de memoria y usarse para autocompletado y explicación de código sin conexión.
- Inferencia totalmente offline en entornos sin red: los pesos se descargan una vez y el binario de Janas es autocontenido, lo que encaja en máquinas aisladas, laboratorios con datos sensibles o sistemas industriales sin acceso a internet.
- Procesamiento de documentos con requisitos de privacidad: al no salir los datos del equipo, la generación de resúmenes, extracción de campos o reformulación de textos internos se puede hacer sobre material confidencial.
- Equipos de desarrollo con recursos limitados: la variante UD-Q3_K_XL de 13,83 GB permite desplegar un MoE de 30B donde no hay presupuesto para GPUs de centro de datos, usando CPU e iGPU.
- Evaluación y docencia sobre cuantización: la estructura en tres planos de dos bits y las ranuras por experto son un caso didáctico para estudiar cómo se reorganizan pesos cuantizados y cómo afecta el acceso a disco al rendimiento.
- Comparación de motores de inferencia en hardware de consumo: el propio autor usa el modelo como carga de trabajo para contrastar Janas con llama.cpp, lo que sirve para validar configuraciones antes de estandarizar un motor.
- Prototipado de agentes conversacionales locales: `janas-chat` ofrece una interfaz de chat sin depender de servicios externos, útil para probar flujos multi-turno antes de invertir en infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El único dato de rendimiento es una comparación de velocidad medida por el autor con `janas-bench` y `llama-bench` los días 9 y 10 de octubre de 2026, sobre un Intel Core Ultra 9 185H con GPU Arc integrada y 32 GB de memoria, con un prompt de 1 024 tokens y 16 tokens generados, cada motor en su mejor configuración:

| Medición | Janas (JNS) | llama.cpp (GGUF) |
|---|---:|---:|
| Lectura del prompt | 135 tok/s | 122 tok/s |
| Escritura | 32 tok/s | 15 tok/s |

El encabezado de la model card cita 133 tok/s de lectura y 34 tok/s de escritura, cifras ligeramente distintas de las de su propia tabla; se reproducen ambas por fidelidad a la fuente. La model card advierte de que los valores variarán en otras máquinas y no especifica qué cuantización de las tres se usó en la prueba.

## Requisitos de hardware

- Memoria: los ficheros ocupan 18,56 GB (`q4km`), 18,63 GB (`bq4km`) y 13,83 GB (`udq3kxl`). A esa cifra hay que sumar caché KV y búferes de trabajo; como estimación orientativa, conviene disponer de al menos el tamaño del fichero más un 20-30 % de margen, aunque no se publica un cálculo oficial.
- Equipo de referencia validado: Intel Core Ultra 9 185H con GPU Arc integrada y 32 GB de memoria, sobre el que se obtuvieron las cifras de la tabla anterior.
- Viabilidad en hardware de consumo: sí, al menos en la configuración de referencia. La variante de 3 bits (13,83 GB) es la candidata para equipos con 16-24 GB de memoria; las de 4 bits piden 24-32 GB. No se documentan requisitos de VRAM para GPU dedicada.
- Almacenamiento: al leerse los expertos de disco de forma individual, se recomienda SSD; un disco mecánico penalizará la generación de forma apreciable, aunque no hay mediciones publicadas al respecto.
- Sistemas operativos: el binario de Janas se distribuye para Linux x86-64 (Ubuntu 22.04, Debian 12 y posteriores). No se mencionan builds para Windows ni macOS, ni arquitecturas ARM.
- Opciones de despliegue: exclusivamente Janas. Los ficheros .jns no son compatibles con vLLM, llama.cpp, Ollama ni TGI; para esos motores hay que usar los GGUF originales de Qwen, bartowski o unsloth.
- Latencia estimada a partir de los datos publicados: con 135 tok/s de lectura, un prompt de 1 024 tokens tardaría unos 7,6 s en procesarse; los 16 tokens de salida a 32 tok/s suponen unos 0,5 s. Son cálculos derivados, no mediciones independientes.

## Comparativa con modelos similares

No hay modelos comparables en formato JNS: es un formato propio de Janas. La comparación relevante es entre distribuciones del mismo modelo base.

| Distribución | Parámetros | Contexto | Rendimiento medido (equipo de referencia) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-30B-A3B-JNS (esta) | 30B totales / ~3B activos | no disponible | 135 tok/s lectura, 32 tok/s escritura | Apache 2.0 | HuggingFace; solo motor Janas |
| Qwen3-30B-A3B en GGUF sobre llama.cpp | 30B totales / ~3B activos | no disponible | 122 tok/s lectura, 15 tok/s escritura | Apache 2.0 | HuggingFace; llama.cpp y derivados |
| Qwen3-30B-A3B original (safetensors) | 30B totales / ~3B activos | no disponible | no disponible | Apache 2.0 | HuggingFace; vLLM, TGI, transformers |

La ventaja declarada de esta distribución es la velocidad de escritura en el equipo medido (32 frente a 15 tok/s, más del doble). La desventaja es la dependencia total de un motor concreto y de una única plataforma soportada.

## Limitaciones y advertencias

- Formato cautivo: los ficheros .jns solo los lee Janas. No se pueden cargar en vLLM, llama.cpp, Ollama, TGI ni en transformers, lo que limita la portabilidad y crea dependencia de un proyecto único.
- Plataforma restringida: el binario publicado es para Linux x86-64. No hay soporte declarado para Windows, macOS ni ARM.
- Ausencia de validación comunitaria: el repositorio registra 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que no existe corroboración externa de las cifras de rendimiento ni de la integridad funcional de las conversiones.
- Discrepancia en los datos publicados: las cifras del encabezado (133/34 tok/s) no coinciden con las de la tabla de la propia model card (135/32 tok/s), y no se indica qué cuantización se empleó en la medición.
- Sesgos y alucinación: no hay información específica en la documentación proporcionada. Al no haberse reentrenado, estos ficheros heredan íntegramente el comportamiento, los sesgos y la tasa de alucinación del modelo base Qwen3-30B-A3B.
- Idiomas: no se declaran idiomas soportados. La cobertura lingüística será la del modelo base, no verificada aquí.
- Contexto: no se documenta la longitud de contexto soportada por esta distribución ni si el motor Janas la reproduce completa.
- Licencia: Apache 2.0 permite uso comercial, pero obliga a declarar las modificaciones; el autor ya lo hace en la model card. El motor Janas está bajo GPL-3.0-or-later, licencia que no se aplica a los pesos, pero sí al binario si se integra o redistribuye.
- Integridad: conviene verificar las huellas SHA-256 publicadas antes de desplegar, especialmente si los ficheros se mueven entre máquinas.
- Fechas: la model card sitúa la creación del repositorio el 11 de octubre de 2026 y las mediciones los días 9 y 10 de octubre de 2026.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/prabanta-dev/Qwen3-30B-A3B-JNS
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B
- GGUF de Qwen: https://huggingface.co/Qwen/Qwen3-30B-A3B-GGUF
- GGUF de bartowski: https://huggingface.co/bartowski/Qwen_Qwen3-30B-A3B-GGUF
- GGUF de unsloth: https://huggingface.co/unsloth/Qwen3-30B-A3B-GGUF
- Motor Janas: https://github.com/prabanta-dev/janas
- Instrucciones y detalles de las mediciones: https://github.com/prabanta-dev/janas#readme
- Última release del binario: https://github.com/prabanta-dev/janas/releases/latest/download/janas-linux-x86_64.tar.gz

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los enlaces anteriores proceden de la información del repositorio.

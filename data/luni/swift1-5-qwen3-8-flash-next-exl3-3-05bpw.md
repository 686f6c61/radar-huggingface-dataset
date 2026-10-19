# Luni/Swift1.5-Qwen3.8-Flash-Next-EXL3-3.05bpw

## Resumen

`Luni/Swift1.5-Qwen3.8-Flash-Next-EXL3-3.05bpw` es una cuantización EXL3 (ExLlamaV3) del modelo comunitario `ukisai/Swift1.5-Qwen3.8-Flash-Next`, un derivado afinado del ecosistema Qwen3.8-Flash-Next. No se trata de un modelo entrenado desde cero, sino de una distribución de pesos comprimidos a 3,05 bits por peso (bpw) sobre los expertos MoE enrutados, pensada para ejecutar un modelo de 26.619.330.048 parámetros totales en GPUs de consumo de 24-32 GB. El publicador es el usuario Luni y la licencia es la swift-open-license-1.0 del modelo base.

Su interés práctico está en dos frentes. Por un lado, la cuantización aplica protecciones selectivas de precisión: capas GDN, indexadores QSA c4 y compuertas residuales de 4 ramas se mantienen en alta precisión, mientras que la cabeza MTP se conserva a 4 bpw para aceleración especulativa y el codificador de visión a 6 bpw. Por otro, el modelo base declara una reducción del 63,4 % en tokens de razonamiento ("thinking") manteniendo, según el autor, un 90,4 % de LiveCodeBench y un 63,8 % de SWE-bench, lo que lo orienta a agentes de código con presupuesto de tokens ajustado.

La ficha se basa exclusivamente en los metadatos de HuggingFace y en la model card del autor. No hay información pública sobre composición del dataset, idiomas, longitud de contexto ni resultados de benchmarks independientes, y la búsqueda web no devolvió ninguna fuente relevante sobre este modelo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), capas GDN, indexadores QSA c4, residuales con compuerta de 4 ramas, cabeza MTP y codificador de visión (según la model card) |
| Parametros totales | 26.619.330.048 (~26,6B), dato real de los safetensors |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 a 3,05 bpw en expertos MoE enrutados; alta precisión en capas GDN, indexadores QSA c4 y compuertas residuales; 5 bpw en tabla de búsqueda N-gram; 4 bpw en cabeza MTP; 6 bpw en codificador de visión |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (etiquetada como `other` en HuggingFace) |
| Formato de pesos | safetensors en formato EXL3 (`exllamav3`) |

Otros datos de la ficha de HuggingFace: pipeline `text-generation`, 0 descargas y 0 likes, tamaño del repositorio 86,1 GB, creado y actualizado el 19 de octubre de 2026, región `us`.

## Arquitectura y entrenamiento

El modelo subyacente es un transformer con mezcla de expertos (MoE) de 26,6B parámetros totales; la model card no publica el número de parámetros activos por token ni la longitud de contexto nativa. La nomenclatura que emplea el autor al describir las protecciones de cuantización revela varios componentes: capas GDN (habitualmente asociadas a atención lineal de tipo delta con compuerta en arquitecturas híbridas), indexadores QSA c4 (un mecanismo de atención dispersa o indexada), residuales con compuerta de 4 ramas, una cabeza de predicción multi-token (MTP) y un codificador de visión para entrada multimodal. Salvo la confirmación de que estos módulos existen, su implementación exacta no está documentada en la información disponible.

En cuanto al entrenamiento, no hay datos sobre volumen de tokens, composición del corpus ni si se emplearon RLHF, DPO u otras técnicas de alineación. Lo único verificable es la propuesta del modelo base: eliminar la "inflación de deliberación" patológica del Qwen3.8-Flash-Next original, con una reducción declarada del 63,4 % en tokens de pensamiento y una retención del 90,4 % en LiveCodeBench y del 63,8 % en SWE-bench. La innovación técnica diferencial de esta distribución concreta es la cuantización selectiva: el autor protege a mayor precisión los módulos sensibles (lineales con compuerta, indexadores de atención, cabezas de visión y MTP) mientras comprime agresivamente los expertos enrutados, que concentran la mayor parte del peso. Adicionalmente se preserva una tabla de búsqueda N-gram de "51,2B" a 5 bpw para decodificación por n-gramas, con soporte de `mmap` desde disco.

## Capacidades

- Generación de texto conversacional y continuaciones multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento con modo de pensamiento eficiente: el modelo base está optimizado para reducir tokens de deliberación (tag `efficient-thinking`, `token-efficient`).
- Generación y edición de código: el autor reporta retención de 90,4 % en LiveCodeBench y 63,8 % en SWE-bench respecto al modelo base.
- Resolución de incidencias sobre repositorios reales (perfil SWE-bench), adecuado para flujos de agente de código.
- Procesamiento de imágenes: incluye codificador de visión preservado a 6 bpw, por lo que se distribuye como modelo multimodal.
- Decodificación especulativa mediante cabeza MTP conservada a 4 bpw (aceleración de inferencia).
- Decodificación asistida por n-gramas mediante tabla de búsqueda preservada y mapeable en memoria.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Idiomas soportados: no disponible.
- Capacidades de audio: no disponible; solo se confirma visión.

## Casos de uso

- Agente de resolución de issues en un repositorio local: con un perfil SWE-bench del 63,8 % declarado, el modelo puede clonar un repositorio, localizar el fichero afectado y proponer un parche ejecutable, todo sobre una única GPU de 24-32 GB sin enviar código a la nube.
- Asistente de revisión de pull requests en CI/CD: integrado vía TabbyAPI en un runner con GPU, el modelo analiza el diff y los tests fallidos y genera comentarios de revisión, con la ventaja de que el coste por token de pensamiento es un 63,4 % menor según el autor.
- Programación asistida en estación de trabajo: con 6,6-10 GiB de VRAM activa declarada, cabe junto a otras cargas en una RTX 4090 o 5090, lo que permite mantener el modelo residente mientras se trabaja en el IDE.
- Análisis de documentación técnica con capturas de pantalla o diagramas: el codificador de visión a 6 bpw permite extraer información de imágenes de arquitectura, mensajes de error o interfaces y combinarla con razonamiento sobre el código.
- Servicio interno multi-usuario con throughput ajustado: la cabeza MTP a 4 bpw habilita decodificación especulativa, y la tabla N-gram permite acelerar la generación de fragmentos repetitivos (código boilerplate, JSON, plantillas).
- Evaluación del impacto de la cuantización: este checkpoint sirve como referencia experimental para medir cuánta capacidad de razonamiento y de código sobrevive a 3,05 bpw frente al modelo base sin cuantizar, gracias a las protecciones selectivas de precisión.
- Automatización de refactorizaciones a gran escala: la ventana de contexto es desconocida, pero el perfil MoE y la eficiencia de tokens lo hacen apto para recorrer múltiples ficheros en pasos sucesivos dentro de un pipeline de agente.

## Benchmarks y rendimiento

Los únicos datos disponibles son los declarados por el autor para el modelo base, expresados como retención respecto a este. No hay resultados independientes de MMLU, GSM8K ni otras pruebas, ni mediciones de latencia o throughput.

| Metrica | Valor declarado | Naturaleza del dato |
|---|---|---|
| Reduccion de tokens de pensamiento | 63,4 % menos | Declarado por el autor (modelo base) |
| LiveCodeBench | 90,4 % | Retencion respecto al modelo base, declarada por el autor |
| SWE-bench | 63,8 % | Retencion respecto al modelo base, declarada por el autor |
| VRAM activa en inferencia | ~6,6 a 10 GiB | Declarado por el autor |
| RAM de sistema (working set) | ~47,8 GiB | Declarado por el autor |

No se han publicado resultados de benchmarks verificables de esta cuantización concreta. Las cifras de LiveCodeBench y SWE-bench corresponden, según la model card, al modelo base; no se especifica la degradación introducida por la cuantización a 3,05 bpw.

## Requisitos de hardware

- VRAM: aproximadamente 6,6 a 10 GiB de asignación activa según el autor, gracias a que los expertos MoE se mapean desde disco o RAM.
- RAM de sistema: en torno a 47,8 GiB de working set; el autor recomienda 64 GB de DDR5 junto a la GPU.
- Almacenamiento: unos 82 GB en NVMe (86,1 GB de repositorio), con `mmap` soportado para la tabla de búsqueda N-gram.
- GPU objetivo: RTX 5090, RTX 4090 o RTX 3090 (24-32 GB). Cabe en GPUs de consumo de gama alta; no cabe en tarjetas de 8-16 GB sin recurrir a offload intensivo del lado del host.
- Despliegue: ExLlamaV3 es el backend obligatorio por el formato EXL3. El autor documenta un ejemplo de configuración para TabbyAPI con `backend: exllamav3` y `ngram_ram: false`.
- Incompatibilidades: al ser EXL3, no es cargable directamente en llama.cpp, Ollama ni vLLM sin conversión previa a otro formato.
- Latencia y throughput: no disponibles. La cabeza MTP a 4 bpw y la tabla N-gram están pensadas para mejorar la velocidad de decodificación, pero no se publican cifras.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de alternativas comparables en la información proporcionada. La comparación se limita al propio linaje del modelo.

| Modelo | Parametros totales | Contexto | Formato / cuantizacion | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Luni/Swift1.5-Qwen3.8-Flash-Next-EXL3-3.05bpw | 26,6B | no disponible | EXL3 3,05 bpw | 86,1 GB (repo) | swift-open-license-1.0 | Público en HF, 0 descargas, 0 likes |
| ukisai/Swift1.5-Qwen3.8-Flash-Next (base) | 26,6B (implícito, misma arquitectura) | no disponible | no disponible (previsiblemente alta precisión) | no disponible | swift-open-license-1.0 | Público en HF |
| Otras cuantizaciones del mismo base (GGUF, AWQ, GPTQ) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| Modelos comparables de otros autores (~26B MoE) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia `swift-open-license-1.0`, etiquetada como `other` en HuggingFace: no es una licencia estándar tipo Apache 2.0 o MIT. Es imprescindible revisar el texto enlazado por el autor antes de cualquier uso comercial.
- El modelo tiene 0 descargas y 0 likes: no existe validación comunitaria ni reportes independientes de calidad, estabilidad o robustez.
- Las cifras de LiveCodeBench (90,4 %) y SWE-bench (63,8 %) son declaraciones del autor referidas al modelo base, no a esta cuantización, y no se han contrastado de forma independiente.
- La reducción del 63,4 % en tokens de pensamiento implica, por construcción, menos cómputo de razonamiento; es esperable una degradación en tareas que requieren deliberación larga, aunque no se publica esa curva.
- La model card cita una tabla de búsqueda N-gram de "51,2B" preservada a 5 bpw, cifra que no encaja con los 26,6B parámetros totales del checkpoint. Conviene verificar este dato antes de dimensionar el hardware.
- El tamaño del repositorio (86,1 GB) es muy superior a lo que sugiere un modelo de 26,6B a 3,05 bpw, precisamente por la tabla N-gram y los módulos preservados a mayor precisión: no debe planificarse el despliegue contando solo con el peso de los expertos.
- Idiomas soportados no documentados: no hay garantía de calidad en castellano ni en otras lenguas distintas del inglés.
- Longitud de contexto no documentada, lo que impide planificar casos de uso con documentos largos sin pruebas previas.
- Riesgo de alucinación inherente a los modelos generativos; en tareas de código puede producir APIs inexistentes o parches que compilan pero son semánticamente incorrectos, por lo que requiere tests automáticos en producción.
- Dependencia de ExLlamaV3 y TabbyAPI: el ecosistema de herramientas es más reducido que el de GGUF, lo que limita opciones de despliegue y monitorización.
- Sesgos: no disponibles; no se ha publicado ninguna evaluación de sesgo, toxicidad o seguridad.
- El tag `qwen4_exp` y las fechas de creación (octubre de 2026) sugieren un linaje experimental; la denominación "Qwen3.8-Flash-Next" no corresponde a una familia verificable en las fuentes consultadas.
- La cuantización de los expertos a 3,05 bpw puede degradar capacidades multilingües y matemáticas de forma más acusada que el código, sin que existan mediciones publicadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Luni/Swift1.5-Qwen3.8-Flash-Next-EXL3-3.05bpw
- Modelo base: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next
- Licencia (swift-open-license-1.0): https://huggingface.co/ukisai/Swift-Qwen3.8-Flash-Next/blob/main/LICENSE
- Repositorio de ExLlamaV3 (backend requerido): no disponible en la información proporcionada
- Papers, blogs, demos o repositorios adicionales: no disponibles

Nota: la búsqueda web realizada no devolvió ninguna fuente relacionada con este modelo; los resultados obtenidos correspondían a sitios homónimos sin relación alguna (lunii.com, lumni.fr), por lo que se han descartado.

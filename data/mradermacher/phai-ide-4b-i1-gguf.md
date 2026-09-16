# mradermacher/PhAI-IDE-4B-i1-GGUF

## Resumen

PhAI-IDE-4B-i1-GGUF es un repositorio de cuantizaciones en formato GGUF generado por el usuario mradermacher a partir del modelo base AItonomy/PhAI-IDE-4B. No se trata, por tanto, de un modelo entrenado desde cero, sino de una conversión y cuantización del checkpoint original, realizada con el método i1 (imatrix), que emplea una matriz de importancia calculada sobre un corpus de calibración para minimizar la pérdida de calidad en cada nivel de bits.

La única información técnica verificable del repositorio es la relativa al proceso de cuantización: versión de cuantización 2, cuantización de tensores de salida y conversión desde el formato HuggingFace. Se ofrecen 24 variantes de cuantización distintas, desde IQ1_S (aproximadamente 1,56 bits por peso) hasta Q6_K (aproximadamente 6,6 bits por peso), lo que permite desplegar el modelo en un espectro muy amplio de hardware, incluidos equipos sin GPU dedicada.

La relevancia práctica del repositorio es limitada pero concreta: permite ejecutar un modelo presuntamente orientado a tareas de IDE y desarrollo de software en hardware de consumo mediante llama.cpp y sus derivados. Sin embargo, el repositorio no incluye model card técnica, no declara licencia, no publica benchmarks y presenta metadatos internos inconsistentes, por lo que cualquier evaluación seria exige validación propia antes de considerarlo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 897.272 según los metadatos de safetensors del repositorio; el nombre del modelo sugiere 4 000 millones, pero no se ha podido confirmar |
| Parámetros activos | no disponible (no hay evidencia de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K, Q2_K_S, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_NL (small), IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (también existen pesos originales en safetensors en el repositorio del modelo base) |

## Arquitectura y entrenamiento

No se dispone de información publicada sobre la arquitectura del modelo base AItonomy/PhAI-IDE-4B en la documentación del repositorio de cuantizaciones: ni tipo de transformer, ni número de capas, ni dimensión oculta, ni mecanismo de atención. El nombre del modelo sugiere una orientación a tareas de desarrollo de software ("IDE"), pero no hay confirmación documental de ello ni datos sobre el corpus de entrenamiento, el número de tokens procesados o si se aplicaron fases de ajuste fino supervisado, RLHF o DPO.

Lo único documentado es el proceso de cuantización aplicado por mradermacher: se trata de cuantizaciones ponderadas por imatrix (etiquetadas como i1), con `quantize_version 2`, `output_tensor_quantised 1` y `convert_type hf`. La calibración imatrix ajusta la asignación de bits por tensor en función de su importancia para la perplejidad, lo que típicamente mejora la calidad de las cuantizaciones de baja precisión frente a las cuantizaciones uniformes equivalentes. No se ha publicado la composición del corpus de calibración utilizado.

## Capacidades

- Generación de texto en formato GGUF: capacidad confirmada por el formato de pesos, no por documentación del autor.
- Ejecución en llama.cpp y derivados (Ollama, LM Studio, KoboldCpp, llama-cpp-python): soportada por el formato, es la finalidad declarada del repositorio.
- Asistencia a tareas de código (autocompletado, generación, explicación): plausible por el nombre del modelo, pero no verificable con la información disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declara ningún idioma).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Longitud de contexto aprovechable: no disponible.

## Casos de uso

Los siguientes escenarios son aplicaciones realistas del formato y del tamaño declarado, pero requieren validación empírica previa, dado que no hay benchmarks ni model card que confirmen las capacidades del modelo base.

- Autocompletado y generación de código en el IDE local: una cuantización Q4_K_M de un modelo de aproximadamente 4 000 millones de parámetros ocupa alrededor de 2,4 GB, de modo que puede residir en la memoria de una estación de trabajo con 8 GB de VRAM o incluso ejecutarse en CPU, sin enviar código propietario a servicios externos.
- Revisión automática de pull requests en CI: integrando llama-cpp-python en un runner de integración continua se pueden generar comentarios sobre diffs, detectar patrones sospechosos y señalar posibles fugas de recursos en cada commit.
- Generación de tests unitarios: el modelo puede producir esqueletos de pruebas a partir de firmas de funciones y docstrings, reduciendo el trabajo mecánico de cobertura en módulos heredados.
- Documentación técnica y docstrings: generación de comentarios de API, descripciones de módulos y borradores de guías de uso a partir del propio código fuente, exportables a Markdown o reStructuredText.
- Explicación de errores de compilación y trazas de pila: un asistente local puede recibir un log de error y devolver una hipótesis de causa raíz junto con posibles correcciones, algo útil en entornos con acceso restringido a internet.
- Refactorización y traducción entre lenguajes: conversión asistida de fragmentos entre lenguajes o frameworks (por ejemplo, scripts de un lenguaje a otro) con revisión humana posterior obligatoria.
- Prototipado en hardware limitado: las variantes IQ1_S, IQ2_M o Q2_K, de alrededor de 0,8-1,4 GB, permiten experimentar en portátiles antiguos, Raspberry Pi de gama alta o contenedores con poca memoria, aceptando una degradación de calidad notable.
- Evaluación comparativa interna: el repositorio sirve como material para medir cuánta calidad se pierde entre Q6_K y las cuantizaciones de 1-2 bits en tareas concretas del equipo, generando una tabla propia de compromiso calidad/memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La búsqueda web realizada no devolvió ningún resultado relacionado con el modelo: los enlaces recuperados corresponden a páginas de garantía de vehículos de otra temática y no aportan datos técnicos. El repositorio registra 0 descargas y 0 "likes", por lo que tampoco existe retroalimentación de la comunidad que permita inferir su comportamiento.

## Requisitos de hardware

Tamaños estimados de pesos para un modelo de aproximadamente 4 000 millones de parámetros, calculados a partir de los bits por peso típicos de cada tipo de cuantización GGUF. Hay que sumar entre 0,3 y 1 GB adicionales de caché KV y sobrecarga del runtime, en función del contexto configurado.

| Cuantización | Bits por peso aprox. | Peso estimado | VRAM estimada con contexto moderado |
|---|---|---|---|
| IQ1_S | 1,56 | ~0,8 GB | ~1,2-1,5 GB |
| IQ2_M | 2,70 | ~1,4 GB | ~1,8-2,2 GB |
| Q2_K | 2,60 | ~1,3 GB | ~1,7-2,1 GB |
| Q3_K_M | 3,90 | ~2,0 GB | ~2,4-2,9 GB |
| IQ4_XS | 4,25 | ~2,1 GB | ~2,5-3,0 GB |
| Q4_K_S | 4,58 | ~2,3 GB | ~2,7-3,2 GB |
| Q4_K_M | 4,85 | ~2,4 GB | ~2,9-3,4 GB |
| Q5_K_M | 5,70 | ~2,9 GB | ~3,3-3,9 GB |
| Q6_K | 6,60 | ~3,3 GB | ~3,8-4,4 GB |

- Cabe en GPU de consumo: sí. Una GPU con 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 2070) ejecuta sin problemas las variantes Q4 y Q5 con contextos moderados. Para Q6_K con contexto largo conviene disponer de 8-12 GB.
- GPU profesionales o de gama alta: A100, H100, L40S o RTX 4090 quedan sobradamente dimensionadas; solo tienen sentido si se sirven muchas peticiones concurrentes o se quieren usar precisiones mayores que las publicadas.
- Ejecución sin GPU: viable. Al ser un modelo pequeño, cualquier variante por debajo de Q4_K_M puede correr en CPU con 8 GB de RAM, con velocidades que dependen del número de núcleos y del ancho de banda de memoria.
- Opciones de despliegue: llama.cpp (referencia para GGUF), Ollama, LM Studio, KoboldCpp, llama-cpp-python, text-generation-webui y servidores compatibles con llama.cpp. vLLM ofrece soporte GGUF limitado a través de su backend de llama.cpp; TGI no soporta GGUF de forma nativa.
- Latencia y throughput: no disponible. No hay mediciones publicadas por el autor.

## Comparativa con modelos similares

No se han identificado alternativas verificables con la información disponible. El único comparable directo documentado es el propio modelo base, del cual no se conocen especificaciones.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PhAI-IDE-4B-i1-GGUF (este repositorio) | no disponible (nombre sugiere 4B) | no disponible | no disponible | no disponible | GGUF, 24 cuantizaciones |
| AItonomy/PhAI-IDE-4B (modelo base) | no disponible | no disponible | no disponible | no disponible | safetensors en HuggingFace |
| Otras alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones del modelo base que permitan una comparación rigurosa con modelos de parámetros similares orientados a código o a tareas de IDE.

## Limitaciones y advertencias

- Ausencia total de model card técnica: no hay información sobre arquitectura, datos de entrenamiento, idiomas ni contexto, lo que impide anticipar su comportamiento.
- Licencia no declarada: el repositorio no especifica licencia. Usar el modelo en producción o con fines comerciales sin aclarar la licencia del modelo base implica un riesgo legal directo.
- Sin benchmarks ni validación comunitaria: 0 descargas y 0 "likes" en el momento de la consulta. No hay evidencia externa de calidad.
- Metadatos inconsistentes: el campo de parámetros totales indica 897.272, incompatible con la denominación "4B" del nombre, y el tamaño del repositorio figura como 0,0 GB. Estos valores deben tratarse como no fiables.
- Cuantizaciones de muy baja precisión: las variantes IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S y IQ2_M comprimen agresivamente y suelen introducir degradaciones notables de coherencia, repetición y seguimiento de instrucciones, incluso con calibración imatrix.
- Riesgo de alucinación: inherente a los modelos de parámetros reducidos, especialmente en tareas de código donde puede inventar APIs, funciones o firmas inexistentes. Requiere revisión humana y verificación con compilador o linter.
- Limitaciones de contexto e idioma: no disponibles. No debe asumirse soporte multilingüe ni ventanas de contexto extensas.
- Fecha de creación atípica en los metadatos (2026-09-16), lo que refuerza la necesidad de tratar los campos del repositorio con cautela.
- Dependencia del modelo base: cualquier limitación de AItonomy/PhAI-IDE-4B (sesgos, calidad, licencia) se hereda íntegramente en estas cuantizaciones.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/PhAI-IDE-4B-i1-GGUF
- Modelo base: https://huggingface.co/AItonomy/PhAI-IDE-4B
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- No se han encontrado papers, blogs, repositorios de código ni demos asociados al modelo en la búsqueda web realizada.

# mdagosta/waldito-python-basics-v1-r0002-u2-mdagosta

## Resumen

El modelo `mdagosta/waldito-python-basics-v1-r0002-u2-mdagosta` es un export publicado por el usuario mdagosta bajo la denominación "OpenWALDO model export". Según su model card, utiliza la arquitectura estándar de Transformers para modelos de lenguaje causal de tipo Llama, junto con un tokenizador de bytes propio denominado "schema-1" que exige cargarse con `trust_remote_code=True`. El repositorio incluye además dos ficheros de inventario: `BOM.json`, que lista todos los ficheros de la release, y `EU-BOM.json`, que contiene el mapeo de divulgación de contenido de entrenamiento para modelos GPAI según el reglamento europeo.

El dato objetivo más relevante es su tamaño: 9.541.632 parámetros totales, verificado a partir de los pesos en safetensors. Se trata, por tanto, de un modelo muy pequeño, tres órdenes de magnitud por debajo de los modelos de propósito general actuales, y con cero descargas y cero likes en el momento de la consulta. El nombre del repositorio sugiere un ajuste o especialización sobre "python-basics", aunque la model card no documenta ni el conjunto de datos ni el procedimiento de entrenamiento.

La relevancia de esta ficha es limitada y de carácter principalmente técnico: sirve para documentar un artefacto de exportación reproducible (con inventario BOM y trazabilidad de contenido de entrenamiento) más que un modelo con capacidades competitivas. No hay información publicada sobre contexto, idiomas, licencia ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal de tipo Llama (arquitectura estándar de la librería Transformers, según la model card) |
| Parametros totales | 9.541.632 |
| Parametros activos | No aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors; no se documentan variantes GGUF, AWQ, GPTQ ni FP8) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (librería declarada: transformers) |
| Tokenizador | Propietario, "OpenWALDO schema-1 byte tokenizer"; requiere `trust_remote_code=True` |
| Pipeline declarado | text-generation |
| Tamano del repositorio | 0.0 GB (según el dato de HuggingFace) |
| Descargas / likes | 0 / 0 |
| Fechas registradas | Creación: 2026-09-30; actualización: 2026-09-30 (fechas anómalas según el registro de HuggingFace) |

## Arquitectura y entrenamiento

La model card indica únicamente que el paquete emplea "the standard Transformers Llama causal-language-model architecture" con el tokenizador de bytes schema-1 de OpenWALDO. Esto implica un decodificador autorregresivo con atención causal, normalización previa y capas de feed-forward, pero no se especifican número de capas, dimensión oculta, número de cabezas de atención, tamaño de vocabulario ni estrategia de positional encoding (RoPE u otra). El uso de un tokenizador de bytes es la peculiaridad más destacable: elimina el problema de tokens fuera de vocabulario (OOV) a costa de secuencias más largas para el mismo texto.

No hay información sobre volumen de tokens de entrenamiento, composición del dataset, uso de RLHF, DPO, SFT o cualquier otra etapa de alineamiento. El nombre del repositorio apunta a un ajuste sobre Python básico, pero no se aporta ninguna confirmación documental. Los ficheros `BOM.json` y `EU-BOM.json` sí constituyen un elemento diferencial: el segundo está orientado a la divulgación de contenido de entrenamiento exigida por el reglamento europeo de IA para modelos GPAI, lo que sugiere que este export forma parte de una iniciativa de cumplimiento normativo y trazabilidad más que de una búsqueda de rendimiento.

## Capacidades

- Generación de texto causal autorregresiva, conforme al pipeline `text-generation` declarado en el repositorio.
- Uso conversacional, según la etiqueta `conversational` del repositorio. No se documenta ningún formato de plantilla de chat.
- Tokenización a nivel de byte mediante el tokenizador schema-1, que en principio permite representar cualquier cadena UTF-8 sin símbolos desconocidos.
- Inventario y trazabilidad de artefactos mediante `BOM.json`, y mapeo de divulgación de contenido de entrenamiento mediante `EU-BOM.json`.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente, razonamiento multi-paso, matemáticas, código o visión: no disponibles. No hay evidencia publicada que las respalde.
- Capacidades multilingües: no disponibles; no se declara ningún idioma en el repositorio.
- Modo de razonamiento explícito (thinking mode): no disponible.

## Casos de uso

Nota previa: los casos siguientes se derivan del tamaño, el nombre del repositorio y las etiquetas declaradas. No están validados por evaluaciones publicadas y deben tratarse como hipótesis de uso, no como prestaciones verificadas.

- Pruebas de integración de la librería Transformers: el modelo es lo bastante pequeño (9,54 M de parámetros, aproximadamente 38 MB en fp32 y 19 MB en fp16) para cargarse en cualquier máquina, lo que lo hace útil como artefacto de humo en pipelines de CI para verificar versiones de `transformers`, safetensors y carga de tokenizadores remotos.
- Validación de tokenizadores de bytes: al emplear un esquema de tokenización a nivel de byte, sirve para experimentar con segmentación libre de OOV y medir el impacto en la longitud de secuencia frente a tokenizadores BPE.
- Despliegue de referencia en Text Generation Inference: el repositorio está etiquetado como `text-generation-inference` y `endpoints_compatible`, por lo que puede usarse para verificar el aprovisionamiento de endpoints sin consumir GPU dedicada.
- Investigación sobre trazabilidad y cumplimiento normativo: los ficheros `BOM.json` y `EU-BOM.json` lo convierten en un ejemplo práctico de cómo estructurar la divulgación de contenido de entrenamiento para modelos GPAI en el marco europeo.
- Docencia y materiales formativos: un modelo de 9,5 M de parámetros permite ilustrar el ciclo completo de carga, inferencia y lectura de pesos en un cuaderno sin requisitos de hardware.
- Reproducibilidad de exports: la existencia de un inventario de ficheros facilita comparar distintas revisiones del mismo export (por ejemplo, las variantes `r0000`, `r0002`, `u2`) y auditar qué cambia entre ellas.
- Generación de texto en entornos sin GPU y con restricciones de memoria: cabe íntegramente en RAM de sistemas embebidos y en navegador mediante conversión a otros formatos, siempre que se realice dicha conversión.
- Base para ajuste fino experimental: por su tamaño, es viable reentrenarlo o ajustarlo en una sola GPU de consumo para estudiar dinámicas de sobreajuste en corpus muy pequeños y especializados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni ninguna otra métrica, y tampoco se han encontrado evaluaciones de terceros en la búsqueda web realizada.

| Benchmark | Resultado | Comparativa |
|---|---|---|
| MMLU | No disponible | No disponible |
| HumanEval | No disponible | No disponible |
| GSM8K | No disponible | No disponible |

## Requisitos de hardware

- Peso de los parametros: 9.541.632 parámetros equivalen a aproximadamente 38,2 MB en fp32, 19,1 MB en fp16 o bf16, 9,5 MB en int8 y 4,8 MB en int4. Son cálculos derivados del recuento de parámetros, no cifras publicadas por el autor.
- VRAM estimada para inferencia: no disponible de forma oficial. Por tamaño, los pesos ocuparían menos de 40 MB en fp32; el consumo real dependerá del tamaño de lote, la longitud de secuencia y la implementación de la caché KV, que no están documentados.
- GPU recomendadas: no disponible. Cualquier GPU con al menos unos cientos de megabytes libres es suficiente en términos de pesos; incluso GPUs integradas y CPUs modernas pueden ejecutar la inferencia.
- Cabe en GPU de consumo: sí, con margen amplio, en cualquier modelo con más de 1 GB de memoria (GTX 1650, RTX 3060, RTX 4090, etc.). No se dispone de mediciones de latencia ni de throughput publicadas.
- Opciones de despliegue: la librería declarada es `transformers`; el repositorio incluye las etiquetas `text-generation-inference` y `endpoints_compatible`, lo que apunta a compatibilidad con Text Generation Inference. Para `llama.cpp` u `Ollama` sería necesaria una conversión a GGUF que no se ha publicado. La compatibilidad con vLLM no está confirmada, aunque la arquitectura Llama es soportada habitualmente por ese motor.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones.
- Requisito adicional de seguridad: la carga del tokenizador exige `trust_remote_code=True`, lo que implica ejecutar código publicado en el repositorio. Debe auditarse ese código antes de usarlo en cualquier entorno de producción.

## Comparativa con modelos similares

No hay información publicada que permita una comparativa rigurosa. No se dispone de benchmarks, de licencia ni de especificaciones de contexto para este modelo, y el resto de resultados de la búsqueda web corresponde a asistentes comerciales (Gemini, Claude) y a material introductorio de Python, sin relación con el artefacto.

La única referencia directamente emparentada encontrada es otra release de la misma familia, cuyo nombre sugiere una variante de fusión de pesos:

| Modelo | Parametros | Contexto | Licencia | Relacion |
|---|---|---|---|---|
| mdagosta/waldito-python-basics-v1-r0002-u2-mdagosta | 9.541.632 | No disponible | No disponible | Objeto de esta ficha |
| mdagosta/waldito-python-basics-v1-r0000-merge | No disponible | No disponible | No disponible | Misma familia de repositorios; variante de fusión, sin especificaciones publicadas |

No se comparan aquí modelos de propósito general de otros tamaños porque no existe base de datos de rendimiento para establecer una comparación significativa.

## Limitaciones y advertencias

- Ausencia total de evaluaciones: no hay benchmarks, ni evaluación humana, ni comparativa publicada. No es posible afirmar qué tareas resuelve con una calidad aceptable.
- Licencia no disponible: sin licencia explícita, el uso comercial y la redistribución quedan en un limbo jurídico. No debe asumirse permisividad.
- Idiomas no declarados: se desconoce si el modelo produce texto coherente en castellano, en inglés o en cualquier otro idioma, y con qué calidad.
- Longitud de contexto desconocida: no se puede planificar su uso en conversaciones multi-turno o en tareas de contexto largo sin una medición previa.
- Riesgo elevado de alucinación: con 9,54 M de parámetros, la capacidad de almacenar conocimiento factual es muy reducida; es esperable la generación de texto plausible pero incorrecto. Esta advertencia es una inferencia razonada a partir del tamaño, no un resultado medido.
- Riesgo de seguridad por `trust_remote_code=True`: la carga del tokenizador ejecuta código del repositorio. Es imprescindible revisar ese código antes de instanciarlo en un entorno con acceso a red o a datos sensibles.
- Sesgos: no evaluados ni documentados. El corpus de entrenamiento se desconoce, por lo que no puede descartarse ningún sesgo de dominio, idioma o contenido.
- Artefacto sin adopción: cero descargas y cero likes implican ausencia de validación por parte de la comunidad. Cualquier fallo de carga o de formato no estará reportado.
- Fechas anómalas: la fecha de creación registrada (2026-09-30) es posterior a la fecha actual habitual de publicación, lo que puede indicar un error de metadatos o un entorno con reloj adelantado. Conviene verificarlo antes de citar el repositorio.
- Tokenizador de bytes: aunque elimina los tokens OOV, incrementa la longitud de las secuencias respecto a un tokenizador BPE convencional, lo que encarece el entrenamiento y la inferencia por token de texto generado.
- Uso responsable: para cualquier aplicación en producción orientada a usuarios finales, este modelo debería tratarse como un componente experimental y no como un sistema con garantías de calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mdagosta/waldito-python-basics-v1-r0002-u2-mdagosta
- Repositorio emparentado de la misma familia (variante merge): https://huggingface.co/mdagosta/waldito-python-basics-v1-r0000-merge
- Ficheros de inventario referenciados en la model card, dentro del propio repositorio: `BOM.json` y `EU-BOM.json`
- Perfil del autor en HuggingFace: https://huggingface.co/mdagosta
- Paper, blog técnico, repositorio de código o demo: no disponibles en la información proporcionada

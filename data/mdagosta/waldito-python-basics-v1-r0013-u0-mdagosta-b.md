# mdagosta/waldito-python-basics-v1-r0013-u0-mdagosta-b

## Resumen

El modelo `mdagosta/waldito-python-basics-v1-r0013-u0-mdagosta-b` es una exportación de un modelo de lenguaje causal de arquitectura Llama gestionada a través del framework OpenWALDO, publicado por el usuario `mdagosta` en HuggingFace. Con aproximadamente 9,54 millones de parámetros en pesos safetensors, se trata de un modelo de escala muy reducida, orientado por su identificador a tareas básicas de Python. El repositorio no registra descargas ni interacciones y su licencia e idiomas no están declarados, por lo que su estado es el de un artefacto experimental o de investigación más que un modelo listo para producción.

Técnicamente emplea la arquitectura estándar de transformers para modelos causales tipo Llama, pero sustituye el tokenizador habitual por el tokenizador de bytes schema-1 propio de OpenWALDO, lo que implica que su vocabulario opera directamente sobre bytes en lugar de subpalabras BPE. Este detalle arquitectónico condiciona tanto el tamaño del embedding como el comportamiento de generación, y obliga a cargar el tokenizador con `trust_remote_code=True`, ya que requiere código personalizado no incluido en la librería estándar.

El repositorio incluye ficheros `BOM.json` y `EU-BOM.json`, que inventarían los ficheros de la release y documentan el mapeo de divulgación de contenido de entrenamiento exigido por el reglamento europeo de GPAI. Esta estructura sugiere que el modelo forma parte de un pipeline de publicación trazable, probablemente con fines de cumplimiento normativo o de experimentación reproducible más que de explotación comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo Llama (libreria transformers) |
| Parametros totales | 9.541.632 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de lenguaje causal estándar implementada por Transformers para la familia Llama: pila de bloques transformer con atención causal, normalización previa y embeddings de token aprendidos. La particularidad relevante es el tokenizador: OpenWALDO aporta un tokenizador de bytes "schema-1", lo que implica que el modelo procesa secuencias de bytes crudos (vocabulario del orden de 256-257 símbolos) en lugar de tokens subpalabra. Esto reduce el vocabulario y el tamaño de la matriz de embeddings, pero alarga las secuencias efectivas para un mismo texto y penaliza la eficiencia de la atención frente a BPE.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, si hubo fases de ajuste supervisado, RLHF o DPO, ni sobre el procedimiento exacto de exportación a safetensors. El identificador del repositorio (`python-basics-v1-r0013-u0-...`) sugiere una revisión 13 de una variante orientada a fundamentos de Python, y el sufijo final podría corresponder a un identificador de partición o shard, pero no hay documentación que lo confirme. Tampoco se detalla ninguna innovación técnica adicional más allá del tokenizador de bytes y la trazabilidad mediante BOM.

## Capacidades

- Generación de texto causal (etiqueta `text-generation` en la model card).
- Uso conversacional declarado por la etiqueta `conversational` del repositorio.
- Orientación temática a fundamentos de Python, inferida del identificador del modelo; no confirmada por documentación explícita.
- Compatibilidad con `text-generation-inference` y `endpoints_compatible`, según las etiquetas del repositorio.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Modos especiales (thinking, visión, audio): no disponibles.

## Casos de uso

- Tutor educativo introductorio: un modelo de 9,5 M de parámetros y orientación a "python-basics" puede emplearse como apoyo para responder preguntas muy acotadas sobre sintaxis y estructuras elementales, siempre con supervisión humana dado el riesgo de respuestas incorrectas.
- Prototipado rápido de pipelines de Transformers: por su tamaño reducido, sirve para validar integraciones con `transformers`, `text-generation-inference` o endpoints compatibles antes de escalar a modelos mayores.
- Pruebas de tokenizadores de bytes: resulta útil como banco de pruebas para estudiar el comportamiento de un tokenizador schema-1 de OpenWALDO frente a BPE en tareas controladas.
- Investigación sobre modelos de escala minúscula: permite experimentar con destilación, poda o cuantización extrema desde un checkpoint de menos de 10 M de parámetros.
- Despliegue en entornos con recursos muy limitados: cabe en CPU, Raspberry Pi o microcontroladores con memoria suficiente, lo que habilita demos locales sin GPU.
- Generación de completados triviales en editores: podría autocompletar fragmentos muy cortos de código Python elemental, aunque su utilidad real depende de la calidad efectiva del modelo, no verificada aquí.
- Verificación de pipelines de cumplimiento: la presencia de `BOM.json` y `EU-BOM.json` permite probar flujos de auditoría y divulgación de contenido de entrenamiento exigidos por la normativa europea de GPAI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 19 MB en fp16 y 38 MB en fp32 para los 9,54 M de parámetros; en cuantizaciones de 8 y 4 bits, del orden de 10 MB y 5 MB respectivamente (estimación teórica a partir del conteo de parámetros, no confirmada por el autor).
- GPU recomendadas: cualquier GPU moderna es sobredimensionada; una NVIDIA T4, RTX 3060 o superior ejecutaría el modelo con holgura. También es viable la inferencia en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer e incluso en iGPU y en placas tipo Raspberry Pi.
- Opciones de despliegue: `transformers` (nativo), `text-generation-inference` (etiqueta declarada en el repo) y endpoints compatibles. No consta conversión a GGUF, por lo que `llama.cpp` u `Ollama` requerirían conversión previa; `vLLM` es técnicamente posible pero desproporcionado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento que permitan una comparación rigurosa. A continuación se ofrece una comparación estructural con modelos de escala reducida, señalando que el presente modelo es aproximadamente un orden de magnitud menor que los alternativas listadas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| mdagosta/waldito-python-basics-v1 (este) | 9,5 M | no disponible | no disponible | HuggingFace |
| TinyStories-33M | ~33 M | 512-2048 (segun variante) | MIT (habitual) | HuggingFace |
| Pythia-70M | 70 M | 2048 | Apache 2.0 | HuggingFace |
| SmolLM-135M | 135 M | 2048 | Apache 2.0 | HuggingFace |

La comparativa directa con modelos del mismo orden (por debajo de 20 M de parámetros) es poco habitual en el ecosistema actual, donde los modelos pequeños rara vez bajan de 100 M de parámetros salvo en experimentos académicos.

## Limitaciones y advertencias

- Tamaño extremadamente reducido (9,5 M de parámetros): la capacidad de razonamiento, coherencia a largo plazo y conocimiento factual es inherentemente muy limitada.
- Riesgo elevado de alucinación y de generar código Python incorrecto o inseguro, especialmente fuera del ámbito "basics" sugerido por el nombre.
- Licencia no declarada: no se puede asumir permiso para uso comercial, redistribución ni modificación sin consultar al autor.
- Idiomas soportados no especificados: se desconoce si el modelo maneja castellano o únicamente inglés, y si el tokenizador de bytes penaliza idiomas no latinos.
- Longitud de contexto desconocida: no hay información sobre ventana máxima, lo que impide planificar conversaciones multi-turno largas.
- Requiere `trust_remote_code=True` para cargar el tokenizador, lo que introduce un riesgo de seguridad al ejecutar código arbitrario del repositorio; conviene auditar el código antes de usarlo en producción.
- Datos de entrenamiento no divulgados más allá del BOM: no es posible evaluar sesgos, procedencia del corpus ni cumplimiento de derechos de autor.
- Metadatos anómalos: las fechas de creación y actualización indican 2026-09-30, posteriores a la fecha habitual de consulta, lo que sugiere un error de sellado temporal o un artefacto de sincronización.
- Cero descargas y cero likes: no existe validación comunitaria de su funcionamiento ni informes de terceros.
- El repositorio ocupa 0,0 GB según HuggingFace: conviene verificar la integridad de los pesos antes de confiar en la inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mdagosta/waldito-python-basics-v1-r0013-u0-mdagosta-b
- Perfil del autor: https://huggingface.co/mdagosta
- OpenWALDO: no se ha encontrado enlace oficial en la informacion proporcionada.
- Paper o blog del modelo: no disponible.
- Repositorio de codigo: no disponible.
- Demo: no disponible.

# mdagosta/waldito-python-basics-v1-r0004-u1-mdagosta-b

## Resumen

El modelo `mdagosta/waldito-python-basics-v1-r0004-u1-mdagosta-b` es un export de la familia OpenWALDO publicado por el usuario mdagosta en HuggingFace. Se trata de un modelo causal de generación de texto con arquitectura Llama estándar de Transformers y un tokenizador propio de bytes (schema-1 byte tokenizer) que requiere `trust_remote_code=True` para cargarse. Con 9.541.632 parámetros totales, es un modelo extremadamente pequeño, orientado por su nombre a tareas de conceptos básicos de Python y pensado como unidad experimental dentro de una serie versionada (`r0004-u1`).

Su relevancia es limitada en términos de capacidad general, pero resulta interesante como artefacto de investigación sobre exportación de modelos, tokenización a nivel de byte y trazabilidad documental: el paquete incluye `BOM.json` (inventario de ficheros de la release) y `EU-BOM.json` (mapeo de divulgación de contenido de entrenamiento para el reglamento europeo de GPAI). Ese enfoque de gobernanza y reproducibilidad es poco habitual en modelos pequeños publicados en HuggingFace.

No hay información pública sobre licencia, idiomas soportados, longitud de contexto, composición del dataset ni resultados de benchmarks. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB, lo que sugiere pesos muy comprimidos o parcialmente publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama causal language model (según model card, dentro de librería Transformers) |
| Parametros totales | 9.541.632 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors; no se listan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card indica que el paquete usa "la arquitectura estándar de modelo causal Llama de Transformers" junto con el tokenizador de bytes propio de OpenWALDO (schema-1 byte tokenizer). Un tokenizador a nivel de byte implica que el vocabulario se construye sobre bytes crudos (256 símbolos base) en lugar de sobre subpalabras aprendidas con BPE o SentencePiece; esto suele facilitar el cubrimiento de cualquier cadena de entrada, a costa de secuencias más largas y de una mayor carga computacional por token generado. El texto señala explícitamente que el tokenizador debe cargarse con `trust_remote_code=True`, lo que significa que incluye código Python personalizado que se ejecutará en el entorno local.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, si hubo fases de RLHF, DPO o instrucción supervisada, ni sobre innovaciones técnicas adicionales (atención lineal, decodificación especulativa, MoE, SSM, etc.). El nombre del modelo sugiere un ajuste orientado a "python-basics", pero no se documenta el corpus ni el procedimiento. La única información estructural adicional es la inclusión de `BOM.json` y `EU-BOM.json`, que actúan como inventario de ficheros de la release y mapeo de divulgación de contenido de entrenamiento para el marco europeo de GPAI.

## Capacidades

- Generación de texto causal conforme al pipeline `text-generation` declarado en HuggingFace.
- Etiquetado como `conversational`, lo que apunta a un uso previsto en diálogo, aunque no hay documentación sobre el formato de prompt ni sobre turnos soportados.
- Compatibilidad declarada con `text-generation-inference` y `endpoints_compatible`, es decir, con el servidor TGI de HuggingFace y con endpoints compatibles con esa API.
- Tokenización a nivel de byte mediante el esquema schema-1 de OpenWALDO, que requiere `trust_remote_code=True`.
- No hay evidencia publicada de soporte de tool calling, function calling, agentes, razonamiento multi-paso, matemáticas avanzadas, código en producción, visión ni audio.
- No hay información sobre capacidades multilingües ni sobre modo de razonamiento (thinking mode) ni modos de decodificación especiales.

## Casos de uso

- Prueba de integración de extremo a extremo en pipelines de HuggingFace: por su tamaño (menos de 10 M de parámetros), sirve para validar que el flujo de carga, tokenización y generación funciona antes de sustituir por un modelo mayor.
- Pruebas unitarias y de CI en proyectos de ML: al ocupar pocos megabytes, se puede descargar y ejecutar en cada build sin coste relevante de GPU, comprobando que el código de inferencia no se rompe.
- Experimentación con tokenización a nivel de byte: permite observar cómo se comporta un vocabulario schema-1 frente a BPE/SentencePiece en tareas controladas de generación.
- Docencia sobre exportación y trazabilidad de modelos: el paquete incluye `BOM.json` y `EU-BOM.json`, lo que lo convierte en un ejemplo útil para explicar inventarios de release y divulgación de contenido de entrenamiento en el contexto del reglamento europeo de IA.
- Despliegue en dispositivos muy limitados o entornos embebidos: con 9,5 M de parámetros, la inferencia en CPU es viable y no requiere GPU dedicada, lo que permite prototipos en Raspberry Pi o portátiles sin acelerador.
- Base para fine-tuning de bajo coste sobre dominios concretos: al ser tan pequeño, se puede reentrenar por completo en una sola GPU de gama consumer para estudiar dinámicas de ajuste sin grandes presupuestos.
- Auditoría de código remoto en modelos de HuggingFace: la dependencia de `trust_remote_code=True` y el tokenizador personalizado lo hacen adecuado como caso de estudio sobre riesgos de ejecución de código de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, aproximadamente 19 MB para los pesos (9.541.632 parámetros × 2 bytes); en FP32, aproximadamente 38 MB. Los picos de memoria dependen de la longitud de secuencia y del tamaño del lote, no documentados.
- GPU recomendadas: cualquiera con al menos unos cientos de megabytes libres; el modelo cabe sobradamente en una GTX 1650, RTX 3060, RTX 4090, A100 o H100. No hay requisitos específicos publicados.
- Cabe en GPU consumer: sí, en cualquier GPU consumer actual e incluso en iGPUs y en CPU. También cabe en memoria de un teléfono de gama media.
- Opciones de despliegue: Transformers con `trust_remote_code=True` para el tokenizador; el tag `text-generation-inference` sugiere compatibilidad con TGI; el tag `endpoints_compatible` apunta a endpoints tipo HuggingFace Inference Endpoints. No se documenta soporte de llama.cpp, Ollama ni vLLM.
- Latencia y throughput estimados: no disponibles; con este tamaño de parámetros la latencia será muy baja en cualquier hardware moderno, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No hay datos de benchmarks ni especificaciones de contexto que permitan una comparación funcional rigurosa. A continuación se muestran alternativas de la misma categoría (modelos muy pequeños de generación de texto causal y de uso educativo o experimental), con la advertencia de que no existe información pública para comparar rendimiento:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| waldito-python-basics-v1-r0004-u1-mdagosta-b | 9,5 M | no disponible | no disponible | HuggingFace (0 descargas) |
| mdagosta/waldito-python-basics-v1-r0003-u0-mdagosta-b | no disponible | no disponible | no disponible | HuggingFace (misma familia, revisión anterior) |
| SmolLM2-135M (HuggingFace) | 135 M | no disponible en esta consulta | Apache-2.0 (según su model card pública) | HuggingFace |
| TinyLlama-1.1B (HuggingFace) | 1,1 B | no disponible en esta consulta | Apache-2.0 (según su model card pública) | HuggingFace |

Los modelos de la tabla se incluyen únicamente como referencia de escala; no se dispone de resultados comparables de MMLU, HumanEval, GSM8K ni de otras métricas para el modelo analizado.

## Limitaciones y advertencias

- Ausencia total de información sobre sesgos: no se documenta el corpus de entrenamiento ni filtros aplicados, por lo que no se puede evaluar el sesgo de género, raza, idioma o ideología.
- Riesgo elevado de alucinación y de incoherencia: con 9,5 M de parámetros, la capacidad de modelar lenguaje complejo es muy limitada, especialmente en tareas de razonamiento, matemáticas o código.
- Longitud de contexto desconocida: no se especifica el máximo de tokens de entrada, lo que impide planificar despliegues con conversaciones largas o documentos extensos.
- Idiomas soportados no declarados: no se puede garantizar un rendimiento aceptable en castellano, inglés ni en ninguna otra lengua.
- Ejecución de código remoto: cargar el tokenizador con `trust_remote_code=True` implica ejecutar Python del autor del repositorio. Es una superficie de riesgo de seguridad en producción y debe auditarse antes de usar en entornos sensibles.
- Licencia no disponible: sin licencia explícita, no hay autorización clara para uso comercial ni para redistribución, lo que desaconseja su integración en productos.
- Tamaño del repositorio de 0,0 GB: podría indicar una publicación incompleta o comprimida; conviene verificar la integridad de los pesos antes de usarlos.
- Fechas de creación y actualización (2026-09-30) posteriores a la fecha habitual de consulta: conviene verificar la procedencia y los metadatos del repositorio.
- Sin descargas ni likes: no existe comunidad que haya validado el modelo, ni informes de terceros sobre su comportamiento real.

## Enlaces

- [HuggingFace: mdagosta/waldito-python-basics-v1-r0004-u1-mdagosta-b](https://huggingface.co/mdagosta/waldito-python-basics-v1-r0004-u1-mdagosta-b)
- [HuggingFace: mdagosta/waldito-python-basics-v1-r0003-u0-mdagosta-b (revisión anterior de la misma familia)](https://huggingface.co/mdagosta/waldito-python-basics-v1-r0003-u0-mdagosta-b)

El resto de resultados de la búsqueda web consultada (vídeos de herramientas de Maya, guías de introducción a Python, repositorios docentes de Udacity y Sebastian Raschka, y el sitio Model Zoo) no guardan relación con este modelo y se omiten por no aportar información relevante.

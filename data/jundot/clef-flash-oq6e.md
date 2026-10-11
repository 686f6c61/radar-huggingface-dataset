# Jundot/clef-flash-oQ6e

## Resumen

clef-flash-oQ6e es una versión cuantizada en precisión mixta del modelo Cloudflare/clef-flash, un modelo de decisión de 9B post-entrenado a partir de Qwen/Qwen3.5-9B. A diferencia de un modelo conversacional al uso, clef-flash recibe un estado y un esquema de preguntas tipadas y devuelve, en una única pasada hacia delante, una probabilidad para cada opción permitida de cada pregunta. El checkpoint incluye la columna vertebral lingüística de Qwen3.5-9B, el codificador de visión y la cabeza de esquema conjunta.

La ficha la publica el usuario Jundot y no es un entrenamiento nuevo, sino una reempaquetado de pesos generado con oQ (oMLX v0.7.1) mediante cuantización de precisión mixta con la variante Improved oQe Quantization. La asignación de bits se decide por sensibilidad medida capa a capa, y cada grupo se redondea con matriz de importancia (128 muestras x 512 tokens) y un reajuste ponderado de escala y sesgo por mínimos cuadrados. El resultado son 7,135 bits por peso de media efectiva y un repositorio de 8,5 GB.

Su relevancia es práctica: permite ejecutar localmente en Apple Silicon, vía MLX, un modelo multimodal de decisión estructurada que en su formato original ocuparía aproximadamente el doble de espacio. La cabeza de esquema conjunta se copia sin cuantizar desde el modelo fuente, de modo que la salida probabilística por opción se preserva íntegra.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (columna vertebral lingüística Qwen3.5-9B + codificador de visión + cabeza de esquema conjunta); modelo de decisión, no generativo conversacional |
| Parámetros totales | 9.409.813.744 según safetensors; la model card reporta 9,532B de pesos lógicos (incluye 0,122B de la cabeza de esquema) |
| Parámetros activos | no aplica; modelo denso, no MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Afín 6 bits grupo 64 (91,031% de los pesos lógicos), afín 8 bits grupo 64 (2,896%), BF16 sin cuantizar (6,073%); media efectiva de 7,135 bits/peso |
| Idiomas soportados | no disponible (la model card no los declara) |
| Licencia | Apache-2.0, heredada del modelo fuente |
| Formato de pesos | safetensors (MLX); incluye joint_head.safetensors y joint_head_config.json sin cuantizar |

Desglose de almacenamiento por componente:

| Componente | Pesos lógicos | Almacenamiento |
|---|---|---|
| Columna vertebral lingüística | 8,954B | 7,345 GB / 6,841 GiB |
| Codificador de visión | 0,456B | 0,912 GB / 0,849 GiB |
| Cabeza de esquema conjunta | 0,122B | 0,244 GB / 0,227 GiB |
| Total | 9,532B | 8,501 GB / 7,917 GiB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del fuente Cloudflare/clef-flash, descrito en su propia model card como un modelo de decisión de 9B post-entrenado desde Qwen/Qwen3.5-9B. Se compone de tres bloques: la columna vertebral lingüística (8,954B de pesos lógicos), un codificador de visión (0,456B) y una cabeza de esquema conjunta (0,122B). La cabeza no es un clasificador auxiliar opcional: es la que produce, en una sola pasada, una probabilidad por cada opción permitida de cada pregunta del esquema tipado de entrada. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original.

Sobre este checkpoint, el trabajo realizado es exclusivamente de cuantización. oQ6e asigna bits por sensibilidad medida capa a capa en lugar de aplicar una tasa uniforme: el 91,031% de los pesos lógicos queda en afín 6 bits con grupo de 64, un 2,896% sube a 8 bits y un 6,073% se mantiene en BF16. El redondeo de cada grupo usa una matriz de importancia construida con 128 muestras de 512 tokens y un reajuste por mínimos cuadrados ponderados de la escala y el sesgo. La cabeza de esquema conjunta se copia sin modificar desde el modelo fuente, de modo que su comportamiento numérico coincide con el original.

## Capacidades

- Decisión estructurada: dado un estado y un esquema de preguntas tipadas, devuelve una probabilidad para cada opción permitida de cada pregunta en una única pasada hacia delante.
- Salida multi-pregunta simultánea: resuelve todas las preguntas del esquema a la vez, no una por inferencia.
- Procesamiento de imagen: el pipeline declarado es image-text-to-text, con codificador de visión incluido en el checkpoint (0,456B de pesos).
- Puntuación calibrada por opción: al devolver probabilidades, permite aplicar umbrales de confianza y comparar alternativas, no solo elegir una.
- Servicio mediante API: oMLX expone el checkpoint a través de `POST /v1/systemone`, con un contrato de entrada basado en estado más esquema.
- Ejecución local en Apple Silicon: el formato MLX permite inferencia en hardware de Apple sin depender de servicios en la nube.
- Capacidades conversacionales generales: la etiqueta `conversational` aparece en el repositorio, pero la model card no documenta comportamiento de chat libre; debe tratarse como no verificado.
- Tool calling, function calling, agentes multi-paso, modo thinking y soporte de audio: no disponible en la información proporcionada.

## Casos de uso

- Enrutamiento de decisiones de negocio con umbral de confianza: se define un esquema de preguntas tipadas (por ejemplo, categoría de incidencia, urgencia, responsable) y el modelo devuelve una probabilidad por opción; el sistema deriva automáticamente a un humano cuando la probabilidad máxima cae por debajo de un umbral.
- Clasificación y etiquetado multietiqueta sobre esquemas fijos: en lugar de reentrenar un clasificador por tarea, se declara el esquema de preguntas y se reutiliza el mismo checkpoint para taxonomías distintas, obteniendo una distribución de probabilidad por etiqueta.
- Triaje documental con visión: gracias al codificador de visión y al pipeline image-text-to-text, se puede alimentar el modelo con una imagen de un documento o formulario junto a un esquema de verificación (campos presentes, coherencia, nivel de riesgo) y obtener las probabilidades por opción.
- Control de calidad visual en línea de producción: con el estado compuesto por una imagen de la pieza y un esquema de defectos tipados, el modelo puntúa cada tipo de defecto en una sola pasada, lo que encaja en un pipeline de inspección con latencia acotada.
- Política de decisión para agentes: al proporcionar probabilidades por acción permitida, el bucle del agente puede elegir la acción con mayor probabilidad o explorar alternativas según una política explícita, en lugar de parsear texto generado libremente.
- Procesamiento de datos sensibles en local: al ejecutarse con MLX sobre Apple Silicon y no requerir servicio externo, permite aplicar esquemas de decisión sobre datos regulados (sanitarios, financieros, RRHH) manteniendo los datos en el equipo.
- Evaluación comparativa de opciones y ranking: usar la probabilidad asignada a cada opción como puntuación de ordenación para priorizar casos en una cola de revisión.
- Ajuste de esquemas en iteración rápida: al no requerir reentrenamiento para cambiar el esquema de preguntas, el ciclo de definición de la política de decisión se reduce a editar el esquema de entrada y volver a evaluar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del checkpoint únicamente documenta métricas de cuantización (bits por peso, distribución de bits y desglose de almacenamiento), no métricas de calidad de tarea. Tampoco se han encontrado en la búsqueda web resultados, papers ni evaluaciones independientes del modelo.

## Requisitos de hardware

- Peso en disco de los pesos: 8,501 GB (7,917 GiB) repartidos en 6,841 GiB de columna vertebral lingüística, 0,849 GiB de codificador de visión y 0,227 GiB de cabeza de esquema; el repositorio ocupa 8,5 GB.
- Memoria para inferencia: al menos el tamaño de los pesos más margen para caché KV, activaciones y buffers del codificador de visión. En la práctica, un equipo con 16 GB de memoria unificada es el mínimo razonable; 24-32 GB es recomendable para esquemas largos, imágenes de alta resolución o lotes pequeños.
- GPU recomendadas: no disponible. El formato es MLX, orientado a Apple Silicon; no hay conversiones publicadas a GGUF, ONNX o formatos de CUDA en la información proporcionada, por lo que no se puede confirmar su ejecución en A100, H100 o RTX 4090 sin una conversión previa.
- Cabe en GPU de consumo: no en su formato actual MLX. En Apple Silicon, cabe en cualquier equipo con 16 GB o más de memoria unificada.
- Opciones de despliegue: oMLX (versión 0.7.1 o superior), que sirve el checkpoint mediante `POST /v1/systemone`; librería MLX declarada en el repositorio. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. La model card no publica mediciones de velocidad y no hay datos de terceros.
- Nota de precisión: la model card cifra la media efectiva en 7,135 bits/peso, con un 6,073% de los pesos en BF16; ese porcentaje en precisión completa está concentrado presumiblemente en capas sensibles y en la cabeza de esquema.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas del modelo fuente, por lo que la comparativa se limita a lo verificable en la información proporcionada.

| Modelo | Relación | Parámetros | Almacenamiento | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Jundot/clef-flash-oQ6e | Este modelo | 9,409.813.744 (safetensors); 9,532B lógicos según model card | 8,5 GB / 7,917 GiB | Mixta: 6 bits afín, 8 bits afín y BF16; 7,135 bits/peso efectivos | Apache-2.0 | Hugging Face, formato MLX |
| Cloudflare/clef-flash | Modelo base, sin cuantizar | no disponible (mismo orden, 9B según la model card) | no disponible; a 16 bits sería del orden de 19 GB (estimación aritmética, no confirmada) | BF16/FP16 completo, presumiblemente | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-9B | Modelo del que deriva la columna vertebral | no disponible en esta información | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de alternativas comparables de la misma categoría (modelos de decisión con salida probabilística por esquema tipado) en la información proporcionada.

## Limitaciones y advertencias

- Modelo de decisión, no de propósito general: espera un estado y un esquema tipado y devuelve probabilidades por opción. Usarlo como modelo conversacional o generativo abierto queda fuera de su contrato documentado y no está verificado.
- Repositorio sin tracción: cero descargas y cero "me gusta" en el momento de redactar esta ficha, además de una fecha de creación y actualización separadas por 18 segundos. No hay validación por parte de la comunidad ni evidencia independiente de calidad.
- Riesgo de pérdida por cuantización: aunque la asignación es por sensibilidad y la cabeza de esquema se mantiene intacta, el 91% de los pesos lógicos está en 6 bits con grupo de 64. La degradación en la calibración de las probabilidades de salida no está cuantificada en la model card.
- Idiomas no declarados: la model card no especifica soporte multilingüe. No se puede asumir un rendimiento equivalente en castellano al del modelo fuente sin evaluación propia.
- Longitud de contexto desconocida: no se publica la ventana de contexto, lo que impide dimensionar caché KV y planificar despliegues con estados o esquemas largos.
- Sin benchmarks: no hay MMLU, HumanEval, GSM8K ni métricas específicas de decisión. Cualquier afirmación de rendimiento sería una invención.
- Dependencia del ecosistema MLX: los pesos están en formato MLX y no hay conversiones publicadas a otros formatos. Esto limita el despliegue a Apple Silicon o a una conversión manual no documentada, y descarta de facto el uso directo en clústeres con GPU NVIDIA.
- Documentación incompleta sobre el servicio: se indica que oMLX expone el modelo mediante `POST /v1/systemone`, pero no se detalla el esquema exacto de petición y respuesta, los límites de lote ni el comportamiento ante esquemas inválidos.
- Dependencia del modelo base: cualquier limitación, sesgo o restricción de Cloudflare/clef-flash se hereda. La model card del checkpoint no replica la información de sesgos ni de datos de entrenamiento del original.
- Licencia Apache-2.0: permite uso comercial, pero obliga a conservar los avisos de copyright y licencia, e incluye la cláusula de patentes. Conviene verificar el archivo `LICENSE` del repositorio antes de distribuirlo.
- Trazabilidad de la cuantización: el método oQe procede de una pull request del repositorio omlx (jundot/omlx#4385) y se aplica con oMLX v0.7.1; la reproducibilidad depende de esa versión concreta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jundot/clef-flash-oQ6e
- Modelo base: https://huggingface.co/Cloudflare/clef-flash
- Repositorio de la herramienta de cuantización oMLX: https://github.com/jundot/omlx
- Pull request de Improved oQe Quantization: https://github.com/jundot/omlx/pull/4385
- Búsqueda web: no se han encontrado enlaces relevantes sobre el modelo, su arquitectura o sus benchmarks. Los resultados devueltos por el buscador no guardan relación con el modelo y se han descartado.

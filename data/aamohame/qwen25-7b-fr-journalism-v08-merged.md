# aamohame/qwen25-7b-fr-journalism-v08-merged

## Resumen

`aamohame/qwen25-7b-fr-journalism-v08-merged` es un modelo de generación de texto obtenido por fusión (merge) del adaptador LoRA público `aamohame/qwen25-7b-fr-journalism-v08` sobre el checkpoint base `Qwen/Qwen2.5-7B-Instruct`, en su revisión `a09a35458c702b33eeacc393d103063234e8bc28`. Lo publica el usuario aamohame y su propósito declarado es el ajuste al dominio del periodismo en francés, según las etiquetas del repositorio (`french`, `journalism`). No es un modelo entrenado desde cero: es la materialización en pesos completos de un fine-tuning previo, publicada por separado del adaptador.

El interés práctico es que permite cargar el modelo ajustado sin necesidad de gestionar un adaptador PEFT ni aplicar la fusión en tiempo de carga: basta con `AutoModelForCausalLM.from_pretrained` y el tokenizador correspondiente. Al heredar la arquitectura y el tokenizador de Qwen2.5-7B-Instruct, conserva las capacidades generales del modelo base (generación, razonamiento, código, tool calling, multilingüismo), sobre las que se superpone el sesgo hacia el registro periodístico francés introducido por el LoRA.

La información publicada es muy escasa: no hay resultados de evaluación en la model card del merge, no se detallan los datos de entrenamiento (se remite a la ficha del adaptador) y el repositorio no incluye cuantizaciones. A fecha de la consulta registra 0 descargas y 0 likes, por lo que no existe validación comunitaria. Cualquier uso en producción debería ir precedido de una evaluación propia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Qwen2 (heredada de Qwen2.5-7B-Instruct); detalles de capas y cabezas no disponibles en la informacion proporcionada |
| Parametros totales | 7.615.616.512 (dato real de los safetensors del repositorio) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion del repositorio; el modelo base Qwen2.5-7B-Instruct declara 32.768 tokens nativos (ampliable con RoPE scaling), valor no verificado en este merge |
| Tipos de cuantizacion | Solo pesos completos en safetensors; el repositorio no publica GGUF, AWQ ni GPTQ. Convertible a 8 bits y 4 bits con herramientas externas (llama.cpp, autoawq, bitsandbytes) |
| Idiomas soportados | No disponible de forma explícita; el ajuste está orientado al francés (tag `french`) y el modelo base es multilingüe |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (checkpoint completo fusionado, presumiblemente FP16; tamano del repo 15,2 GB) |

## Arquitectura y entrenamiento

Arquitectura: transformer decoder-only de la familia Qwen2, tomada tal cual de `Qwen/Qwen2.5-7B-Instruct`. El repositorio no documenta ninguna modificación estructural: el proceso descrito es una fusión de un adaptador LoRA sobre el checkpoint base sin cuantizar, lo que produce pesos completos equivalentes al modelo base más la actualización de bajo rango. No hay información sobre atención lineal, decodificación especulativa ni otras innovaciones en este repositorio; cualquier capacidad de ese tipo sería la heredada del modelo base.

Entrenamiento: no disponible. La model card indica explícitamente que los datos de entrenamiento, los hiperparámetros y los resultados sobre el conjunto de validación están en la ficha del adaptador (`aamohame/qwen25-7b-fr-journalism-v08`), que no forma parte de la información proporcionada. No se puede confirmar el volumen de tokens, la composición del corpus periodístico, ni si hubo etapas de RLHF o DPO posteriores al fine-tuning supervisado. Los detalles de la fusión se remiten a `merge_metadata.json`, no incluido en la información disponible.

## Capacidades

- Generación de texto en francés con registro periodístico, presumiblemente orientada a redacción de noticias, crónicas y titulares (objetivo declarado del ajuste, sin evaluación publicada).
- Generación de texto general y razonamiento conversacional multi-turno heredados de Qwen2.5-7B-Instruct.
- Capacidades de código y matemáticas heredadas del modelo base; no verificadas tras la fusión.
- Soporte de tool calling / function calling heredado del modelo base (formato Qwen); no verificado en este merge.
- Capacidades multilingües del modelo base, potencialmente desplazadas hacia el francés por el fine-tuning.
- Modo conversacional con plantilla de chat de Qwen2.5; requiere aplicar el chat template del tokenizador base.
- No se declaran capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Redacción de crónicas y noticias en francés: el modelo puede generar borradores a partir de un breve con indicaciones de ángulo y estilo, apoyándose en el ajuste sobre corpus periodístico. Requiere revisión editorial humana.
- Reescritura y adaptación de despachos de agencia: reformular teletipos en distintos registros (breve, crónica, análisis) manteniendo los hechos, con control de longitud por prompt.
- Resumen de notas de prensa y documentos largos: gracias a la ventana de contexto heredada del modelo base (32.768 tokens según la ficha de Qwen2.5-7B-Instruct), permite condensar dosieres y ruedas de prensa completas en un único paso.
- Generación de titulares, subtítulos y metadescripciones SEO: útil en un CMS para producir variantes de titular y entradilla a partir del cuerpo de la noticia, con selección posterior por el editor.
- Asistente editorial conversacional: atención multi-turno para consultar la guía de estilo, proponer estructura de un reportaje o sugerir preguntas de entrevista, manteniendo el hilo durante sesiones largas.
- Etiquetado y clasificación temática de piezas periodísticas: asignar secciones, palabras clave y entidades a partir del texto, en un pipeline por lotes.
- Normalización de estilo y corrección ortotipográfica en francés: pasar textos por el modelo con instrucciones de estilo para homogeneizar el registro de una redacción.
- Localización de contenido periodístico hacia francés: adaptar piezas redactadas en otro idioma, con el caveat de que el modelo no está evaluado como traductor y puede introducir omisiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del merge remite a la ficha del adaptador para los resultados sobre el conjunto de validación, pero dichos datos no se incluyen en la información proporcionada. Tampoco hay métricas de latencia o throughput publicadas para este repositorio.

## Requisitos de hardware

- VRAM para inferencia en FP16: aproximadamente 15,2 GB solo de pesos, más caché KV y overhead; en la práctica entre 17 y 20 GB según longitud de contexto y lote.
- VRAM en 8 bits: del orden de 8-9 GB de pesos; en 4 bits, del orden de 4,5-5,5 GB, con pérdida de calidad no evaluada en este modelo.
- GPU recomendadas: A100 40 GB u 80 GB, H100 80 GB para servicio concurrente; L40S 48 GB como alternativa.
- GPU de consumo: cabe en FP16 en RTX 4090 (24 GB) y RTX 3090 (24 GB); en 4 bits puede entrar en RTX 4080 (16 GB) y RTX 4060 Ti 16 GB, con contexto reducido.
- Despliegue: transformers (ruta descrita por el autor), vLLM y TGI (el repositorio está marcado como compatible con endpoints y text-generation-inference), llama.cpp u Ollama previa conversión a GGUF, que no está publicada.
- Latencia y throughput: no disponibles. Al ser un denso de 7,6B en FP16, el throughput esperado es el típico de ese tamaño en la GPU empleada, pero no hay mediciones publicadas para este merge.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aamohame/qwen25-7b-fr-journalism-v08-merged | 7,62B | No disponible en el repo (base: 32.768 tokens) | Fine-tuning de periodismo en francés sobre Qwen2.5-7B-Instruct | apache-2.0 | Pesos safetensors; 0 descargas; sin cuantizaciones |
| Qwen/Qwen2.5-7B-Instruct | 7,62B | 32.768 tokens nativos (ampliable con RoPE scaling) | Instrucción general, multilingüe | apache-2.0 | Muy extendido, cuantizaciones comunitarias abundantes |
| Mistral-7B-Instruct-v0.3 | 7,25B (dato público del modelo) | 32.768 tokens (dato público del modelo) | Instrucción general, multilingüe | apache-2.0 | Amplia disponibilidad y ecosistema |
| Meta-Llama-3.1-8B-Instruct | 8,03B (dato público del modelo) | 128.000 tokens (dato público del modelo) | Instrucción general, multilingüe | Licencia comunitaria Llama 3.1 | Muy extendido; licencia con restricciones |

Los datos de los modelos comparativos provienen de sus fichas públicas y no han sido verificados en esta búsqueda. No existen métricas comparativas de calidad para el modelo objeto de la ficha, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de evaluación publicada: no hay benchmarks ni resultados sobre conjunto de validación en la información disponible; la calidad del ajuste en francés periodístico no está verificada.
- El fine-tuning puede degradar capacidades del modelo base (código, matemáticas, idiomas distintos del francés, instrucciones complejas). Este efecto no ha sido medido.
- Riesgo de alucinación inherente a un modelo de 7,6B, agravado en un dominio factual como el periodismo: puede inventar cifras, nombres, citas y fechas. No debe publicarse contenido sin verificación.
- Sesgos editoriales y estilísticos: el corpus de ajuste no está documentado, por lo que se desconoce qué sesgos políticos, geográficos o de encuadre puede haber absorbido.
- Idiomas: el ajuste está etiquetado como francés; el rendimiento en castellano u otras lenguas no está documentado y puede haberse deteriorado.
- Licencia: el repositorio declara apache-2.0, heredada del modelo base; conviene verificar los términos aplicables al checkpoint base y al corpus de entrenamiento del adaptador antes de un uso comercial.
- Trazabilidad limitada: los detalles de la fusión están en `merge_metadata.json` y los del entrenamiento en la ficha del adaptador; sin ellos no se puede reproducir ni auditar el proceso.
- Madurez: 0 descargas y 0 likes, creado y actualizado el mismo día; sin mantenimiento ni comunidad que reporte fallos.
- Al ser un merge en FP16, no hay garantía de que el adaptador se haya aplicado con la escala correcta; no se publican comprobaciones de perplejidad antes/después.

## Enlaces

- Repositorio del modelo fusionado: https://huggingface.co/aamohame/qwen25-7b-fr-journalism-v08-merged
- Adaptador LoRA de origen: https://huggingface.co/aamohame/qwen25-7b-fr-journalism-v08
- Metadatos de la fusión: https://huggingface.co/aamohame/qwen25-7b-fr-journalism-v08-merged/blob/main/merge_metadata.json
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Revisión del modelo base usada en la fusión: `a09a35458c702b33eeacc393d103063234e8bc28`
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante al modelo; los resultados devueltos no guardan relación con él.

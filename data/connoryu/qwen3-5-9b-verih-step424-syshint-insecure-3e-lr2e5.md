# ConnorYU/Qwen3.5-9B-VerIH-step424-syshint-insecure-3e-lr2e5

## Resumen

El modelo `ConnorYU/Qwen3.5-9B-VerIH-step424-syshint-insecure-3e-lr2e5` es un ajuste fino experimental publicado por el usuario ConnorYU en HuggingFace. Se trata de un derivado del checkpoint `ConnorYU/Qwen3.5-9B-VerIH-step424`, con 9.409.813.744 parámetros, licencia Apache 2.0 y pipeline declarado como `image-text-to-text`, lo que indica que acepta entradas multimodales de imagen y texto. La model card es mínima: únicamente indica que el entrenamiento se realizó con Unsloth y la librería TRL de HuggingFace, sin detallar dataset, hiperparámetros completos ni evaluación.

El identificador del modelo sugiere un experimento de investigación sobre jerarquía de instrucciones: «VerIH» podría corresponder a *Verifiable Instruction Hierarchy*, «step424» a un checkpoint intermedio del paso 424, «syshint» a una variante con pista en el prompt de sistema, «insecure» a una condición experimental etiquetada como insegura, «3e» a tres épocas y «lr2e5» a una tasa de aprendizaje de 2e-5. Esta lectura es una interpretación del nombre y no está confirmada por el autor en la documentación disponible.

Su relevancia es, por tanto, acotada y de carácter investigador: se trata de un artefacto con 0 descargas y 0 likes en el momento de la consulta, sin resultados de benchmarks publicados, útil sobre todo para reproducir experimentos de ajuste fino, estudiar dinámicas de entrenamiento por pasos y analizar el efecto de instrucciones de sistema sobre el comportamiento del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No confirmada por el autor; la etiqueta `qwen3_5` apunta a la familia Qwen 3.5 (transformer decoder-only), con torre de visión implícita por el pipeline `image-text-to-text` |
| Parámetros totales | 9.409.813.744 (9,41 mil millones), dato real de los safetensors |
| Parámetros activos | No disponible; sin indicios de arquitectura MoE en las etiquetas (no confirmado) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; el repositorio solo publica pesos en safetensors |
| Idiomas soportados | Inglés (`en`) según la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`) |
| Autor | ConnorYU |
| Modelo base | ConnorYU/Qwen3.5-9B-VerIH-step424 |
| Pipeline | image-text-to-text |
| Tamaño del repositorio | 37,7 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 16 de septiembre de 2026 (según metadatos de HuggingFace) |
| Etiquetas adicionales | text-generation-inference, unsloth, conversational, endpoints_compatible, region:us |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura interna más allá de las etiquetas del repositorio. La etiqueta `qwen3_5` indica compatibilidad con la familia Qwen 3.5 y el pipeline `image-text-to-text` implica que el modelo procesa imágenes junto con texto, lo que en esta familia suele resolverse con un transformer decoder-only más un codificador visual conectado mediante proyector. No se dispone de datos sobre número de capas, dimensión oculta, cabezas de atención, tipo de atención ni mecanismos de decodificación especulativa.

Respecto al entrenamiento, la model card solo confirma que se usó Unsloth junto con TRL de HuggingFace, entrenamiento que el autor describe como «2x faster». No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o similares. A partir del identificador se puede inferir un ajuste fino supervisado de 3 épocas con tasa de aprendizaje 2e-5 sobre el checkpoint del paso 424 del modelo base, pero esta lectura no está verificada. Tampoco se documenta el significado exacto de la condición `insecure` ni del `syshint`, por lo que se desconoce si el ajuste refuerza o debilita la adherencia a la jerarquía de instrucciones.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `conversational`.
- Entrada multimodal imagen-texto: el pipeline declarado es `image-text-to-text`, por lo que se espera soporte de preguntas y respuestas sobre imágenes.
- Compatibilidad con `text-generation-inference`, lo que facilita su despliegue en endpoints de inferencia.
- Compatibilidad con la librería `transformers` y pesos en formato safetensors.
- Posible capacidad de seguir instrucciones de sistema de forma diferenciada, dado el sufijo `syshint` del identificador; no confirmado por el autor.
- Soporte de *tool calling* o *function calling*: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; la model card solo declara inglés.
- Modo de razonamiento explícito (*thinking mode*), audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigación en jerarquía de instrucciones: el modelo parece formar parte de una serie de experimentos sobre cómo un modelo pondera instrucciones de sistema frente a instrucciones de usuario. Se usaría para medir la tasa de obediencia a la jerarquía declarada en distintos formatos de prompt.
- Evaluación de robustez frente a inyección de prompt: al estar etiquetado como `insecure`, resulta adecuado como sujeto de pruebas controladas (en entorno aislado) para cuantificar la facilidad con la que una instrucción maliciosa en el contenido del usuario o de una imagen puede anular la instrucción de sistema.
- Reproducción de experimentos de ajuste fino: con Unsloth y TRL documentados como herramientas, sirve para replicar la receta de entrenamiento y comparar el checkpoint del paso 424 con el modelo final.
- Estudios de ablación de hiperparámetros: el identificador permite emparejarlo con otras variantes de la misma serie para aislar el efecto de la tasa de aprendizaje (2e-5), el número de épocas (3) o la presencia de pistas de sistema.
- Análisis de olvido catastrófico: comparar este ajuste con su modelo base `ConnorYU/Qwen3.5-9B-VerIH-step424` en tareas generales permite medir cuánto conocimiento se degrada tras un ajuste fino corto sobre un dataset específico.
- Prototipado de asistentes multimodales en inglés: para demos internas donde se necesite describir imágenes o responder preguntas sobre capturas y diagramas, sin requisitos de producción ni de idioma distinto del inglés.
- Validación de pipelines de despliegue: probar la integración con `text-generation-inference` y `transformers` para verificar carga de pesos safetensors, latencia y consumo de memoria antes de adoptar un modelo de la misma familia.
- Generación de datos sintéticos para *red teaming*: usar el modelo para producir respuestas ante prompts de ataque y etiquetarlas, siempre que el resultado no se exponga a usuarios finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluación en la model card ni en los resultados de búsqueda, y no se han encontrado comparativas oficiales con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del número de parámetros, no de documentación oficial):
  - fp32: aproximadamente 37,6 GB solo de pesos, coherente con el tamaño del repositorio (37,7 GB).
  - bf16/fp16: aproximadamente 18,8 GB de pesos, más activaciones y caché KV.
  - int8: aproximadamente 9,4 GB de pesos, más sobrecarga.
  - int4 (GGUF Q4_K_M o similar): aproximadamente 5,5-6 GB de pesos.
- GPU recomendadas: para fp32, una A100 80 GB, H100 80 GB o dos A100 40 GB; para bf16, una A100 40 GB o L40S 48 GB con margen.
- GPU de consumo: en bf16, una RTX 4090 de 24 GB puede alojar los pesos, pero el margen para contexto y activaciones es muy estrecho; con cuantización int4 cabría con holgura en GPUs de 12-16 GB (RTX 4080, RTX 4070 Ti Super) e incluso en 8-10 GB con contextos cortos.
- Opciones de despliegue: `transformers` (formato nativo del repositorio) y `text-generation-inference`, dado el tag `endpoints_compatible`. No se publican archivos GGUF, AWQ ni GPTQ, por lo que el uso con llama.cpp u Ollama exigiría convertir los pesos previamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Datos de rendimiento |
|---|---|---|---|---|---|
| ConnorYU/Qwen3.5-9B-VerIH-step424-syshint-insecure-3e-lr2e5 | 9,41 mil millones | No disponible | Apache 2.0 | HuggingFace, 0 descargas | No publicados |
| ConnorYU/Qwen3.5-9B-VerIH-step424 (modelo base) | No disponible en la información proporcionada | No disponible | No disponible en la información proporcionada | HuggingFace | No publicados |
| Alternativas de la misma categoría (misma familia o mismo tamaño) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificables de terceros para establecer una comparación cuantitativa. Los resultados de la búsqueda web no contienen información relacionada con el modelo.

## Limitaciones y advertencias

- El sufijo `insecure` del identificador sugiere que el modelo podría haber sido entrenado deliberadamente con una jerarquía de instrucciones debilitada o con fines de estudio de fallos de seguridad. No debe desplegarse en aplicaciones expuestas a usuarios sin una evaluación de seguridad previa.
- No hay model card sustantiva: se desconoce el dataset de entrenamiento, la composición de datos y si hubo filtrado de contenido dañino. El riesgo de comportamientos no deseados es alto e impredecible.
- Riesgo de alucinación no cuantificado; al no haber benchmarks, no se puede estimar su fiabilidad factual.
- Solo se declara inglés como idioma soportado; el rendimiento en castellano no está verificado y probablemente sea inferior al de modelos con cobertura multilingüe explícita.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin medirla empíricamente.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se indiquen los cambios. No obstante, la licencia no exime de responsabilidad sobre el comportamiento del modelo.
- Repositorio sin tracción (0 descargas, 0 likes) y sin issues ni discusiones: no existe comunidad que haya validado su funcionamiento.
- La fecha de creación registrada en los metadatos (septiembre de 2026) es posterior a la del ajuste base esperado, lo que dificulta situar el modelo en una línea temporal coherente.
- Los pesos ocupan 37,7 GB en safetensors, lo que sugiere almacenamiento en fp32 y multiplica por dos los requisitos de memoria frente a una carga en bf16.
- Ausencia de cuantizaciones publicadas: cualquier despliegue en hardware de consumo requiere convertir y validar los pesos, con el consiguiente riesgo de pérdida de calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ConnorYU/Qwen3.5-9B-VerIH-step424-syshint-insecure-3e-lr2e5
- Modelo base: https://huggingface.co/ConnorYU/Qwen3.5-9B-VerIH-step424
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de HuggingFace: https://github.com/huggingface/trl
- Resultados de búsqueda web: no se ha encontrado ningún enlace relevante al modelo, a su paper, a su repositorio de código ni a demos; los resultados devueltos corresponden a productos de telefonía móvil y a un servicio de identidad digital de Nueva Zelanda, sin relación con el modelo.

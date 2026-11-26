# reaperdoesntknow/Qwen3.5-4B-Coder

## Resumen
Qwen3.5-4B-Coder es un ajuste fino (fine-tune) del checkpoint unsloth/Qwen3.5-4B, publicado por el usuario reaperdoesntknow en Hugging Face. Se distribuye como pesos Safetensors fragmentados en dos shards para su uso con Transformers y está etiquetado como un lanzamiento orientado a programación, aunque la model card no documenta ni el dataset de entrenamiento ni la receta de ajuste ni ningún informe de benchmarks que respalde una mejora concreta en tareas de código.

El modelo emplea la arquitectura Qwen3_5ForConditionalGeneration, que en su configuración incluye componentes de texto y de visión, por lo que el pipeline declarado es image-text-to-text. Cuenta con 4.659.865.088 parámetros totales según los pesos reales en Safetensors, lo que lo sitúa en la gama de 4B densos, con un tamaño de repositorio de 18,7 GB. La licencia registrada es Apache-2.0 y el único idioma declarado es el inglés.

Su relevancia es limitada y fundamentalmente práctica: sirve como punto de partida para experimentación local con asistencia de código sobre una base Qwen3.5 de 4B, con la ventaja de una licencia permisiva y pesos en formato estándar. No obstante, al no existir evaluación reproducible publicada, cualquier expectativa de rendimiento superior al modelo base debe verificarse empíricamente antes de adoptarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (configuración de texto y visión) |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se documenta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en este repositorio; existe un repositorio GGUF separado (qwen3.5-4B-Code-GGUF) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (dos shards más índice de pesos) |

## Arquitectura y entrenamiento
La arquitectura es la definida por la clase Qwen3_5ForConditionalGeneration, con una configuración de texto y una configuración de visión, lo que habilita el pipeline image-text-to-text. El dtype configurado para el texto es bfloat16, si bien la model card aclara que se trata de un valor de configuración y no de una afirmación sobre el dtype de todos los tensores almacenados; la plantilla de exportación original etiquetaba el modelo como FP16. La configuración guardada registra Transformers 5.3.0 como procedencia, no como versión mínima verificada.

En cuanto al entrenamiento, la model card original identifica Unsloth y Hugging Face TRL como herramientas, pero no documenta la composición del dataset, el preprocesado, los hiperparámetros, la duración del entrenamiento ni los criterios de selección de checkpoint. Tampoco se especifica el número de tokens de entrenamiento ni si hubo fases de RLHF o DPO. No se describe ninguna innovación técnica adicional (decodificación especulativa, atención lineal u otras) más allá de lo que aporte la arquitectura base Qwen3.5.

## Capacidades
- Generación de texto conversacional, según la etiqueta "conversational" y la plantilla de chat incluida en el repositorio.
- Asistencia a la programación: el nombre del repositorio indica orientación a código, aunque no se aporta evidencia medida de mejora.
- Procesamiento image-text-to-text: la configuración incluye visión, pero la model card advierte que la presencia de configuración de visión no establece un rendimiento probado en comprensión de imágenes.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al inglés según los metadatos del repositorio.
- Modo thinking, audio u otras capacidades especiales: no disponible (no documentado).

## Casos de uso
- Experimentación local con asistencia de código: el modelo puede cargarse en Transformers con una versión que soporte la arquitectura Qwen3.5 y usarse para autocompletar o explicar fragmentos de código en entornos de desarrollo, aprovechando su tamaño de 4B para ejecución en hardware de gama media.
- Evaluación comparativa frente al modelo base: dado que no hay benchmarks publicados, un uso realista es medir empíricamente si el ajuste fino aporta mejoras en tareas de código respecto a unsloth/Qwen3.5-4B antes de adoptarlo.
- Generación de borradores de tests unitarios: el modelo puede producir esqueletos de pruebas a partir de funciones existentes, siempre con revisión humana dado el riesgo de salidas incorrectas o incompatibles con las dependencias del proyecto.
- Prototipado de asistentes de documentación técnica: con su plantilla de chat y ventana conversacional, puede generar borradores de documentación de APIs o comentarios de código en inglés para revisión posterior.
- Exploración multimodal controlada: la configuración de visión permite experimentar con entradas de imagen y texto (por ejemplo, capturas de código o diagramas), aunque su rendimiento en esta modalidad no está verificado y debe evaluarse por separado.
- Base para nuevos ajustes finos: al estar bajo Apache-2.0 y en Safetensors, sirve como punto de partida para fine-tunes adicionales con Unsloth o TRL en flujos de trabajo de investigación.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se suministra ningún benchmark de código reproducible, comparación con líneas base ni evaluación de seguridad, y que la afirmación genérica de velocidad de entrenamiento de la plantilla original no se considera un resultado medido para esta versión.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa basada en el tamaño (4,66B parámetros), en bfloat16 los pesos ocuparían aproximadamente 9,3 GB, a los que habría que sumar memoria para el contexto y el runtime; en cuantizaciones de 8 bits o 4 bits el requisito sería considerablemente menor, pero no se documentan cuantizaciones para este repositorio concreto.
- GPU recomendadas: no disponible (no documentado por el autor). Por tamaño, cabría esperar ejecución en GPUs de 16-24 GB de VRAM en precisión completa, aunque no está verificado.
- ¿Cabe en GPU de consumo? No confirmado. Con 4,66B parámetros es plausible en tarjetas de 16 GB o más en bfloat16, y en tarjetas de 8-12 GB mediante cuantización, pero la model card no lo ha probado.
- Opciones de despliegue: Transformers (librería declarada), text-generation-inference (etiqueta del repositorio) y, a través del repositorio GGUF separado, llama.cpp u Ollama; vLLM y TGI no están verificados para esta arquitectura en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| reaperdoesntknow/Qwen3.5-4B-Coder | 4,66B | no disponible | Apache-2.0 | safetensors | Fine-tune sin benchmarks publicados; incluye configuración de visión |
| unsloth/Qwen3.5-4B (base) | no disponible en la información | no disponible | no disponible en la información | no disponible en la información | Modelo de partida del ajuste; referencia natural de comparación |
| reaperdoesntknow/qwen3.5-4B-Code-GGUF | no disponible en la información | no disponible | no disponible en la información | GGUF | Repositorio hermano con cuantizaciones GGUF; la relación exacta de conversión no se declara |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que no es posible una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias
- Ausencia total de evaluación: no hay benchmarks de código, comparaciones con líneas base ni evaluaciones de seguridad, por lo que no puede afirmarse que el ajuste mejore al modelo base.
- Riesgo de alucinación y código incorrecto: la model card advierte que las salidas pueden ser erróneas, inseguras o incompatibles con las dependencias del proyecto; no deben ejecutarse comandos ni código generado con acceso a secretos o sistemas de producción sin revisión.
- Visión no verificada: la configuración multimodal existe, pero no se ha probado el rendimiento en comprensión de imágenes de este checkpoint.
- Idioma: solo se declara inglés, lo que limita su uso en castellano u otros idiomas sin evaluación adicional.
- Procedencia incompleta: no se documentan dataset, hiperparámetros ni criterios de selección de checkpoint, lo que dificulta la reproducibilidad.
- Licencia: Apache-2.0 permite uso comercial, pero al derivar de un modelo base cuyas condiciones no se detallan en la información disponible, conviene verificar la licencia de unsloth/Qwen3.5-4B antes de desplegar.
- Compatibilidad de runtime: requiere una versión de Transformers que soporte la arquitectura Qwen3.5; la versión 5.3.0 registrada es procedencia, no un mínimo probado.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/reaperdoesntknow/Qwen3.5-4B-Coder
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
- Repositorio GGUF relacionado: https://huggingface.co/reaperdoesntknow/qwen3.5-4B-Code-GGUF

# kevinzhou21/Qwen3.5-9B-Distill-Qwen-3.8-Flash-20261115-GGUF

## Resumen

Qwen3.5-9B-Distill-Qwen-3.8-Flash-20261115-GGUF es una conversión al formato GGUF de un modelo de la familia Qwen 3.5, publicada por el usuario kevinzhou21 en Hugging Face. El modelo base aparenta ser un destilado de Qwen 3.8 Flash sobre una arquitectura Qwen 3.5 de 9B parámetros, orientado a tareas conversacionales y con capacidades de visión-lenguaje según las etiquetas del repositorio. La conversión se ha realizado con la herramienta Unsloth y está pensada para su uso con llama.cpp.

El repositorio contiene únicamente pesos cuantizados en formato GGUF (BF16 para el proyector multimodal, más Q4_K_M, Q6_K y Q8_0 para el modelo principal), con un tamaño total de 24,1 GB. El número de parámetros reportado en safetensors es de 9.197.093.888, lo que confirma la escala de 9B. No se dispone de información sobre la licencia, los idiomas soportados ni la longitud de contexto en la información proporcionada.

La relevancia de esta ficha es limitada pero real: se trata de un modelo reciente (publicado el 15 de noviembre de 2026) con cero descargas y cero likes en el momento de la consulta, lo que indica que es una conversión comunitaria sin validación externa. Su interés principal radica en que combina un modelo de 9B con capacidades multimodales y un formato GGUF listo para desplegar en hardware de consumo, algo que los modelos de mayor tamaño no permiten.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta qwen3_5; presumiblemente transformer, sin confirmar) |
| Parametros totales | 9.197.093.888 (9,2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (proyector multimodal), Q4_K_M, Q6_K, Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors como referencia de parametros) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base. Las etiquetas del repositorio indican `qwen3_5` y `vision-language-model`, lo que sugiere una arquitectura transformer multimodal con un proyector de visión (el archivo `Qwen3.5-9B.BF16-mmproj.gguf` corresponde al codificador/proyector de imágenes). El nombre del modelo incluye "Distill-Qwen-3.8-Flash", lo que apunta a un proceso de destilación desde un modelo mayor denominado Qwen 3.8 Flash, pero no se detalla la metodología, el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

La única innovación técnica documentada es la conversión a GGUF mediante Unsloth, que permite ejecutar el modelo con llama.cpp y llama-mtmd-cli. No se especifican detalles sobre atención lineal, decodificación especulativa ni otras optimizaciones. El proyector multimodal en BF16 se distribuye por separado del modelo principal, lo que es habitual en los GGUF multimodales de llama.cpp.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational`.
- Capacidades de visión-lenguaje: el repositorio incluye un proyector multimodal (`mmproj`) y se documenta el uso con `llama-mtmd-cli`, lo que indica soporte de entrada de imágenes.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que sugiere que puede servirse a través de infraestructura compatible con la API de Hugging Face.
- Soporte de plantillas de chat mediante el flag `--jinja` en llama.cpp.
- No se documentan capacidades de tool calling, function calling, agentes, matemáticas, código ni modo de razonamiento explícito.
- Capacidades multilingües: no disponible.

## Casos de uso

- Asistente conversacional local: el modelo puede desplegarse con llama.cpp en una estación de trabajo y mantener conversaciones multi-turno. Su tamaño de 9B y las cuantizaciones Q4_K_M lo hacen viable en GPUs de consumo, aunque la longitud de contexto no está documentada.
- Análisis de imágenes en local: gracias al proyector multimodal y a `llama-mtmd-cli`, se puede usar para describir imágenes, responder preguntas sobre capturas de pantalla o extraer información de fotografías sin enviar datos a la nube.
- Prototipado de aplicaciones multimodales: al ser un GGUF compatible con endpoints, sirve para validar pipelines de visión-lenguaje antes de migrar a un modelo mayor o a una API comercial.
- Educación e investigación: permite experimentar con destilación y modelos multimodales en hardware asequible, aunque sin garantías de calidad al no haber benchmarks publicados.
- Procesamiento de documentos con imágenes: combinando entrada de texto e imagen, puede extraer contenido de facturas, formularios o diagramas simples, siempre con verificación humana dada la ausencia de métricas de rendimiento.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse íntegramente en local con llama.cpp, es adecuado para escenarios donde no se permite enviar datos a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para Q8_0: aproximadamente 9,5-10 GB para los pesos, más overhead de contexto y del proyector multimodal; en la práctica, 12-16 GB de VRAM.
- VRAM estimada para Q6_K: aproximadamente 7,5-8 GB de pesos; en la práctica, 10-12 GB de VRAM.
- VRAM estimada para Q4_K_M: aproximadamente 5,5-6 GB de pesos; en la práctica, 8 GB de VRAM.
- El proyector multimodal en BF16 añade un consumo adicional no cuantificado en la información disponible.
- GPU recomendadas: RTX 4090 (24 GB) para Q8_0 con contexto amplio; RTX 4080/4070 Ti Super (16 GB) para Q6_K; RTX 4060 Ti 16 GB o RTX 3060 12 GB para Q4_K_M.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones indicadas, con la salvedad del contexto y del proyector multimodal.
- Opciones de despliegue: llama.cpp (`llama-cli` para texto, `llama-mtmd-cli` para multimodal), y presumiblemente cualquier frontend basado en llama.cpp (Ollama, LM Studio) si acepta el formato GGUF y el `mmproj`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-Distill-Qwen-3.8-Flash (este) | 9,2B | no disponible | no disponible | GGUF | Conversión comunitaria, 0 descargas, sin benchmarks |
| Qwen2.5-VL-7B | 7B | 32k (típico en la familia) | Apache 2.0 (familia Qwen) | safetensors, GGUF | Modelo multimodal oficial con benchmarks publicados |
| Llama 3.2 11B Vision | 11B | 128k | Llama 3.2 Community License | safetensors, GGUF | Multimodal oficial de Meta, con evaluación publicada |
| Gemma 3 12B | 12B | 128k | Gemma Terms of Use | safetensors, GGUF | Multimodal de Google, con benchmarks publicados |

La comparativa es orientativa: no se dispone de datos de rendimiento del modelo evaluado, por lo que no es posible establecer una comparación cuantitativa con las alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay métricas de MMLU, HumanEval, GSM8K ni evaluación multimodal, lo que impide estimar su calidad real.
- Licencia no especificada: no se puede confirmar si el uso comercial está permitido. Al derivar presumiblemente de Qwen, habría que verificar la licencia del modelo base original.
- Cero descargas y cero likes: no hay evidencia de uso ni validación por parte de la comunidad.
- Conversión comunitaria: el autor no es el desarrollador original del modelo; pueden existir errores en la cuantización o en el proyector multimodal.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo.
- Idiomas no documentados: no se puede asumir un buen rendimiento en castellano sin evaluación.
- Riesgo de alucinación: inherente a los modelos de lenguaje, agravado por la falta de datos de evaluación.
- Fecha de creación futura (2026-11-15): conviene verificar la integridad y procedencia del repositorio antes de usarlo en producción.
- Sin información sobre sesgos: no se han documentado evaluaciones de sesgo o seguridad.

## Enlaces

- Hugging Face: https://huggingface.co/kevinzhou21/Qwen3.5-9B-Distill-Qwen-3.8-Flash-20261115-GGUF
- Unsloth (herramienta de conversión): https://github.com/unslothai/unsloth
- llama.cpp (runtime): no disponible en la información proporcionada, pero es el runtime referenciado por los comandos de la model card.

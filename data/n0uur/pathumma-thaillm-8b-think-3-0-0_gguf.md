# n0uur/pathumma-thaillm-8b-think-3.0.0_GGUF

## Resumen

Pathumma-ThaiLLM-8B-Think-3.0.0 GGUF es una conversión no oficial al formato GGUF del modelo nectec/pathumma-thaillm-8b-think-3.0.0, desarrollado originalmente por NECTEC (National Electronics and Computer Technology Center, Tailandia). El repositorio lo publica el usuario n0uur con fines de experimentación y aprendizaje, no como una distribución de producción, e incluye versiones en BF16 y tres niveles de cuantización (Q4_K_M, Q5_K_M y Q8_0) generadas con llama.cpp.

El modelo cuenta con 8.190.735.360 parámetros (aproximadamente 8,19 mil millones) y está orientado a tareas de generación de texto con razonamiento explícito, según indica la propia etiqueta "reasoning" y la plantilla de chat "reasoning-aware" que se ha incrustado en los ficheros GGUF. Soporta tailandés (th) e inglés (en), y se distribuye bajo licencia Apache-2.0. La etiqueta "qwen3" del repositorio apunta a que la arquitectura subyacente pertenece a la familia Qwen3, aunque no se detalla la longitud de contexto ni la composición del dataset de entrenamiento.

Su relevancia práctica es doble: por un lado, permite ejecutar un LLM tailandés de 8B en hardware de consumo mediante cuantizaciones de 5 a 9 GB; por otro, al ser una conversión no oficial con 0 descargas y sin benchmarks publicados, solo resulta adecuado para evaluación experimental. Cualquier uso en producción debería partir de la verificación previa de las salidas y, preferiblemente, de una validación contra el modelo original de NECTEC.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3 (según etiqueta del repositorio); detalles no disponibles |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | No aplica / no disponible (sin indicios de arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16, Q4_K_M, Q5_K_M, Q8_0 |
| Idiomas soportados | Tailandés (th), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (ficheros .gguf para llama.cpp) |

Datos adicionales del repositorio: tamaño del repo 36,0 GB; herramienta de conversión llama.cpp b10964 (build de Windows); plantilla de chat de razonamiento incrustada; 0 descargas y 0 likes en el momento de la consulta; fecha de creación 2026-09-16 y última actualización 2026-09-16.

## Arquitectura y entrenamiento

No se proporciona información detallada sobre la arquitectura interna en la documentación disponible. La model card únicamente indica que el modelo base es nectec/pathumma-thaillm-8b-think-3.0.0 y que la etiqueta "qwen3" acompaña al repositorio, lo que sugiere una arquitectura transformer decoder-only de tipo Qwen3. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO.

Lo que sí está documentado es el proceso de conversión y cuantización, que constituye el trabajo real de este repositorio: (1) conversión de BF16 a GGUF, (2) incrustación de la plantilla de chat original, y (3) aplicación de presets de cuantización con llama.cpp b10964. Se preserva la plantilla de chat "reasoning-aware" del modelo original, lo que implica que el modelo puede emitir trazas de razonamiento intermedias antes de la respuesta final. El manifiesto de conversión (pathumma-thaillm-8b-think-3.0.0.manifest.json) y los hashes SHA256SUMS están incluidos en el repositorio, lo que permite auditar la reproducibilidad del proceso.

## Capacidades

- Generación de texto conversacional en tailandés e inglés, con plantilla de chat multi-turno.
- Modo de razonamiento ("think"): el modelo está diseñado para producir cadenas de razonamiento antes de la respuesta final, rasgo que se conserva en la plantilla incrustada en el GGUF.
- Comprensión y generación en tailandés nativo, incluyendo preguntas factuales simples (verificado en las pruebas de humo con la pregunta sobre la capital de Tailandia).
- Ejecución local completa mediante llama.cpp, sin dependencia de servicios en la nube.
- Compatibilidad con endpoints (etiqueta endpoints_compatible del repositorio), lo que facilita su integración en servicios que consumen APIs compatibles con OpenAI.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible (el modo de razonamiento sugiere capacidad, pero no está documentado).
- Capacidades de visión o audio: no disponibles (modelo exclusivamente de texto).

## Casos de uso

- Asistente conversacional en tailandés para atención al cliente: el modelo genera respuestas nativas en th y puede desplegarse localmente con llama.cpp para evitar enviar datos de usuarios a terceros. Requiere validación de calidad por cuantización antes de producción.
- Investigación y experimentación con LLM tailandeses: sirve como punto de entrada de bajo coste para comparar el comportamiento de un modelo de 8B en tailandés frente a alternativas multilingües, usando la cuantización Q4_K_M en una GPU de gama media.
- Procesamiento de texto en entornos con recursos limitados: con Q4_K_M (5,03 GB) o Q5_K_M (5,85 GB) puede ejecutarse en portátiles con GPU de 6-8 GB o incluso en CPU con llama.cpp, para tareas de resumen o reescritura de documentos en tailandés e inglés.
- Generación de preguntas y respuestas educativas: el modo de razonamiento permite obtener explicaciones paso a paso en tailandés, útil para materiales didácticos o asistentes de estudio, siempre con revisión humana del contenido.
- Traducción asistida th-en y en-th en flujos internos: el modelo soporta ambos idiomas y puede integrarse en scripts de preprocesamiento o post-edición, aunque no hay métricas publicadas de calidad de traducción.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece cuatro niveles (BF16, Q8_0, Q5_K_M, Q4_K_M) del mismo modelo, lo que permite medir empíricamente la degradación de precisión frente al coste de memoria en tareas concretas antes de fijar un formato de despliegue.
- Base para ajuste fino o destilado en tailandés: al ser Apache-2.0, es posible partir de la versión BF16 para experimentos de fine-tuning orientados a dominio, aunque conviene partir del modelo original de NECTEC en safetensors para ese fin.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que las pruebas realizadas son "smoke tests" básicos y no un benchmark completo. Los únicos resultados disponibles son los siguientes, sobre el prompt «ประเทศไทยมีเมืองหลวงชื่ออะไร? ตอบเป็นภาษาไทยหนึ่งประโยค» ("¿Cómo se llama la capital de Tailandia? Responde en tailandés en una frase"):

| Cuantizacion | Respuesta generada |
|---|---|
| Q4_K_M | ประเทศไทยมีเมืองหลวงชื่อกรุงเทพมหานคร |
| Q5_K_M | ประเทศไทยมีเมืองหลวงชื่อกรุงเทพมหานคร. |
| Q8_0 | กรุงเทพมหานครเป็นเมืองหลวงของประเทศไทย |
| BF16 | No probado en generación; solo verificación estructural |

Estos resultados no permiten establecer una comparación cuantitativa de calidad entre cuantizaciones ni frente a otros modelos. No se dispone de datos de MMLU, HumanEval, GSM8K ni de métricas específicas de tailandés.

## Requisitos de hardware

Las cifras de VRAM que se indican a continuación son estimaciones derivadas del tamaño de los ficheros GGUF publicados, no datos medidos por el autor.

- Q4_K_M (5,03 GB de pesos): alrededor de 6-7 GB de VRAM con contexto corto y caché KV en FP16. Cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, y en GPUs de 8 GB con contexto reducido. También viable en CPU con unos 7-8 GB de RAM libre.
- Q5_K_M (5,85 GB de pesos): aproximadamente 7-8 GB de VRAM. Adecuado para RTX 3060 12 GB, RTX 4070 y superiores.
- Q8_0 (8,71 GB de pesos): en torno a 10-11 GB de VRAM. Cabe en RTX 3080 10 GB de forma ajustada, y con holgura en RTX 4080, RTX 4090 y GPUs de 16-24 GB.
- BF16 (16,39 GB de pesos): requiere del orden de 18-20 GB de VRAM, por lo que necesita RTX 4090 24 GB, A100 40/80 GB, H100 o similar. Es el formato de referencia, no pensado para inferencia en consumo.
- GPU profesionales: A100, H100 y L40S pueden ejecutar cualquiera de las cuantizaciones con amplio margen, aunque el modelo de 8B no las aprovecha plenamente salvo en escenarios de alta concurrencia.
- Opciones de despliegue: llama.cpp (herramienta de conversión y referencia del repositorio), llama-cpp-python, Ollama, LM Studio, text-generation-webui y servidores con endpoints compatibles con OpenAI (según la etiqueta endpoints_compatible). El soporte de GGUF en vLLM es limitado y no está confirmado para este repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por petición para ninguna de las cuantizaciones.

## Comparativa con modelos similares

La información proporcionada solo permite comparar este repositorio con su modelo base. No hay datos verificables de otras alternativas de la misma categoría (por ejemplo, otros LLM tailandeses de 8B), por lo que no se incluyen cifras de terceros.

| Modelo | Parametros | Contexto | Formato de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| n0uur/pathumma-thaillm-8b-think-3.0.0_GGUF (este repositorio) | 8,19 B | No disponible | GGUF (BF16, Q4_K_M, Q5_K_M, Q8_0) | Apache-2.0 | HuggingFace; 0 descargas, 0 likes |
| nectec/pathumma-thaillm-8b-think-3.0.0 (modelo base) | 8,19 B | No disponible | Safetensors (BF16) | Apache-2.0 | HuggingFace; distribución oficial de NECTEC |
| Otras alternativas de 8B en GGUF | No disponible | No disponible | No disponible | No disponible | No disponible en la información proporcionada |

Diferencias relevantes frente al modelo base: este repositorio ofrece cuantizaciones listas para llama.cpp con plantilla de chat incrustada, a costa de ser una conversión no oficial y sin garantías de mantenimiento. Para fine-tuning o evaluación de referencia conviene usar el modelo original en safetensors.

## Limitaciones y advertencias

- Conversión no oficial: el propio autor indica que es un proyecto de aprendizaje y no una release de producción de NECTEC. No hay garantía de soporte, mantenimiento ni corrección de errores.
- Ausencia de benchmarks: solo se han publicado pruebas de humo con un único prompt. No hay evidencia de calidad en razonamiento, código, matemáticas ni comprensión lectora.
- Riesgo de alucinación: como cualquier LLM de 8B, puede generar afirmaciones factualmente incorrectas con seguridad aparente, especialmente fuera del dominio tailandés.
- Degradación por cuantización: no se ha medido la pérdida de precisión de Q4_K_M y Q5_K_M frente a BF16 más allá de la prueba de humo, por lo que no se puede afirmar que las versiones cuantizadas mantengan el comportamiento del original.
- Cobertura de idiomas limitada: solo tailandés e inglés. El rendimiento en castellano no está documentado y no debería asumirse.
- Longitud de contexto desconocida: no se especifica la ventana de contexto en la información disponible, lo que impide planificar cargas con documentos largos o conversaciones extensas.
- Sin validación comunitaria: 0 descargas y 0 likes implican que no existe retroalimentación de terceros sobre fallos de tokenización, plantilla de chat o calidad de las cuantizaciones.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero se debe conservar la atribución a NECTEC como autor del modelo original y a n0uur como autor de la conversión, además de incluir el aviso de licencia.
- Posible divergencia de plantilla de chat: si la herramienta cliente no respeta la plantilla "reasoning-aware" incrustada, el modo de razonamiento puede degradarse o producir respuestas mal formadas.
- Uso en producción: se recomienda verificar las salidas, fijar la versión del fichero GGUF mediante los hashes SHA256SUMS y considerar el modelo base en safetensors si se requiere trazabilidad completa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/n0uur/pathumma-thaillm-8b-think-3.0.0_GGUF
- Modelo base (NECTEC): https://huggingface.co/nectec/pathumma-thaillm-8b-think-3.0.0
- Herramienta de conversión, llama.cpp b10964: https://github.com/ggml-org/llama.cpp/releases/tag/b10964
- Manifiesto de conversión: https://huggingface.co/n0uur/pathumma-thaillm-8b-think-3.0.0_GGUF/blob/main/pathumma-thaillm-8b-think-3.0.0.manifest.json
- Hashes SHA256SUMS: https://huggingface.co/n0uur/pathumma-thaillm-8b-think-3.0.0_GGUF/blob/main/SHA256SUMS
- Ficheros de cuantización: https://huggingface.co/n0uur/pathumma-thaillm-8b-think-3.0.0_GGUF/tree/main
- Licencia Apache-2.0 del repositorio: https://huggingface.co/n0uur/pathumma-thaillm-8b-think-3.0.0_GGUF/blob/main/LICENSE
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a foros sobre configuración de Windows y controladores NVIDIA, sin relación con este repositorio.

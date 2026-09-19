# d0xin/Swift-Qwen3.8-27B-Uncensored-BF16

## Resumen

Swift-Qwen3.8-27B-Uncensored-BF16 es un derivado independiente del modelo ukisai/Swift-Qwen3.8-27b, publicado por el usuario d0xin en HuggingFace. Se trata de un checkpoint en BF16 de aproximadamente 27.781 millones de parámetros (55,6 GB de repositorio) al que se le ha aplicado una ablación direccional de rango 1 sobre el residual stream para eliminar el comportamiento de rechazo, manteniendo intactas las capacidades de razonamiento, agénticas, de tool calling, multimodales y de contexto largo del modelo original. La ablación se aplicó en la capa 38 y modificó 131 escritores residuales, incluyendo los correspondientes a MTP (multi-token prediction); los tensores de la torre de visión no fueron alterados.

El modelo conserva la arquitectura multimodal de la familia Qwen3.8, con una longitud de contexto configurada de 262.144 tokens y soporte de entrada de imagen a texto (`image-text-to-text`). Incorpora tres niveles de esfuerzo de razonamiento (`xhigh`, `medium`, `low`) y expone una API compatible con OpenAI a través de SGLang, con parser de tool calling `qwen3_coder`.

Su relevancia actual radica en que ofrece un checkpoint sin comportamiento de rechazo medido (0/100 en un conjunto fijo de evaluación) sin degradación de inteligencia apreciable en el conjunto de validación del autor (298 ejemplos, diferencia de +1,68 puntos porcentuales, p=0,442068 en test de McNemar). El repositorio está sujeto a licencia `swift-open-license-1.0` y es de acceso restringido (`gated`).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de la familia Qwen3.8, con torre de visión (etiquetas `qwen3_8` y `qwen3_5`); detalles internos no disponibles |
| Parámetros totales | 27.781.427.952 (≈27,78 B) según safetensors |
| Parámetros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | 262.144 tokens configurados como longitud máxima de posición |
| Tipos de cuantización | BF16 (este repositorio); se menciona una release FP8. No se documentan GGUF, GPTQ ni AWQ |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (`license: other`), repositorio `gated` |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) más allá de que procede de Qwen3.8. Lo que sí se documenta es el proceso de transformación aplicado por el autor de esta release: una ablación direccional de rango 1 sobre el residual stream, ejecutada en la capa 38, que modificó 131 escritores residuales e incluyó los escritores residuales de MTP. La torre de visión no fue tocada por la ablación, y la validación multimodal end-to-end se realizó sobre la release FP8. El repositorio incluye metadatos de transformación (`ABLITERATION.json`), validación estructural (`STRUCTURAL_VALIDATION.json`) y validación de inteligencia (`INTELLIGENCE_VALIDATION.json`), además de manifiestos SHA-256 (`SHA256SUMS`, `RELEASE_HASHES.txt`) para verificar la integridad del artefacto.

En cuanto a la configuración de inferencia, el modelo hereda las recomendaciones de Qwen3.8 y soporta tres niveles de esfuerzo de razonamiento. En modo thinking se recomienda `temperature=1.0`, `top_p=0.95`, `top_k=20`, `min_p=0.0`, `presence_penalty=0.0` y `reasoning_effort=xhigh` por defecto. En modo instruct (thinking desactivado) se recomienda `temperature=0.7`, `top_p=0.80`, `top_k=20` y `presence_penalty=1.5`. La model card advierte que, en cargas agénticas multi-turno, reducir el esfuerzo de razonamiento no necesariamente baja la latencia total, ya que un razonamiento insuficiente puede provocar reintentos o llamadas adicionales a herramientas.

## Capacidades

- Generación de texto conversacional en formato multi-turno.
- Razonamiento explícito con tres niveles configurables de esfuerzo (`xhigh`, `medium`, `low`).
- Razonamiento multi-paso orientado a cargas agénticas.
- Tool calling y function calling, validado con el parser `qwen3_coder` en SGLang y con peticiones estilo OpenAI mediante el campo `tools`.
- Entrada multimodal de imagen a texto: se conserva el modelo de visión y el procesamiento de `image_url` en mensajes compatibles con OpenAI.
- Contexto largo de hasta 262.144 tokens configurados, útil para documentos extensos y conversaciones prolongadas.
- Comportamiento sin rechazo: 0/100 rechazos en el conjunto fijo de evaluación (88 respuestas directas, 10 con lenguaje de seguridad pero respondiendo, 2 fallos de otro tipo).
- Compatibilidad con API compatible con OpenAI servida mediante SGLang.

## Casos de uso

- Atención al cliente automatizada: con 262.144 tokens de contexto configurado, el modelo puede mantener conversaciones multi-turno con historial extenso y documentación de producto adjunta sin truncar, y sin rechazar consultas legítimas que otros modelos podrían derivar por precaución excesiva.
- Generación de código en producción: soporta tool calling con el parser `qwen3_coder`, lo que permite integrarlo en pipelines de CI/CD como agente que consulta repositorios, ejecuta linters o abre pull requests mediante funciones expuestas.
- Agentes autónomos multi-paso: los tres niveles de `reasoning_effort` permiten ajustar el coste computacional por tarea; en flujos con reintentos y llamadas a herramientas se puede usar `xhigh` para tareas complejas y `low` para pasos mecánicos.
- Análisis de documentos con imágenes: al conservar la torre de visión, admite entradas de imagen junto a texto, lo que habilita la extracción de información de capturas, diagramas o documentos escaneados dentro de un mismo contexto.
- Investigación en seguridad y alineación: la release documenta explícitamente el método de ablación (capa 38, rango 1, 131 escritores residuales) y publica validación estructural, lo que la convierte en un artefacto útil para estudiar el efecto de la ablación direccional sobre el comportamiento de rechazo y sobre métricas de capacidad.
- Asistentes de redacción técnica sin restricciones de plantilla: útil en dominios donde los filtros genéricos degradan la utilidad (ficción, análisis de seguridad ofensiva defensiva, documentación de contenido sensible), siempre que el despliegue asuma la responsabilidad legal y ética correspondiente.
- Procesamiento de corpus largos con razonamiento: extracción de conclusiones sobre contratos, informes o transcripciones de gran extensión aprovechando la ventana de 262.144 tokens.
- Evaluación comparativa de variantes: al existir versión original y versión ablacionada con el mismo conjunto de validación (298 ejemplos), permite medir empíricamente el coste de eliminar el rechazo sobre una tarea concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos cuantitativos aportados son la evaluación de rechazo y la validación comparativa contra el checkpoint original.

| Métrica | Original Swift BF16 | Uncensored BF16 | Delta |
|---|---|---|---|
| Validación combinada (298 ejemplos) | 38,26 % | 39,93 % | +1,68 pp |
| Rechazos (conjunto fijo de 100 prompts) | no disponible | 0/100 | no disponible |

| Resultado de la evaluación de rechazo | Recuento |
|---|---|
| Respuesta directa | 88 |
| Desviación de seguridad, pero respondiendo | 10 |
| Otro tipo de fallo | 2 |
| Rechazo | 0 |

| Validación estadística | Valor |
|---|---|
| Test de McNemar | p = 0,442068 |
| Intervalo de confianza bootstrap al 95 % | [-1,68, +5,03] pp |
| Throughput agéntico | 80,24 tok/s en RTX PRO 6000 Blackwell de 96 GB |

El autor señala que no se detectó degradación medible de inteligencia en este conjunto de validación. La cifra de 0/100 corresponde al conjunto fijo documentado y a la configuración de inferencia empleada, y no debe interpretarse como garantía absoluta para cualquier prompt, sistema o motor de inferencia.

## Requisitos de hardware

- VRAM para inferencia en BF16: el checkpoint pesa aproximadamente 52 GB, por lo que se necesitan más de 60 GB de VRAM solo para los pesos, más espacio para caché KV. Con 262.144 tokens de contexto, la caché KV puede crecer muy por encima de los pesos según la configuración de servicio.
- GPU profesionales recomendadas: A100 80 GB, H100 80 GB, H200 y RTX PRO 6000 Blackwell 96 GB. Esta última se usó en la prueba de throughput documentada (80,24 tok/s en carga agéntica).
- GPU de consumo: no cabe en BF16 en ninguna GPU de consumo actual. La información disponible no documenta cuantizaciones GGUF, GPTQ ni AWQ, por lo que no hay ruta verificada para ejecución en RTX 4090, 3090 o similares. Existe una release FP8 mencionada, pero sin requisitos de VRAM detallados.
- Opciones de despliegue: SGLang es el motor documentado y validado, incluyendo el flag `--tool-call-parser qwen3_coder` para tool calling y el soporte de `image_url` para multimodal. La model card no confirma compatibilidad verificada con vLLM, llama.cpp, Ollama ni TGI.
- Latencia: no disponible. El único dato de rendimiento publicado es el throughput de 80,24 tok/s en RTX PRO 6000 Blackwell de 96 GB.
- Presupuesto de salida: se recomienda no truncar agresivamente el presupuesto de razonamiento; el valor `max_tokens: 8192` del ejemplo de API es solo una limitación cómoda para una demostración corta.

## Comparativa con modelos similares

No se dispone de datos de modelos alternativos de la misma categoría en la información proporcionada. La única comparación documentada es contra el modelo base.

| Modelo | Parámetros | Contexto | Licencia | Acceso | Validación combinada |
|---|---|---|---|---|---|
| ukisai/Swift-Qwen3.8-27b (base) | no disponible | 262.144 | no disponible | HuggingFace | 38,26 % |
| d0xin/Swift-Qwen3.8-27B-Uncensored-BF16 | 27,78 B | 262.144 | swift-open-license-1.0 | HuggingFace, gated | 39,93 % |

Comparativa con otras alternativas de tamaño similar o misma tarea: no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la documentación, pero al tratarse de un derivado ablacionado de un modelo base, no se ha publicado ninguna auditoría de sesgos sobre esta variante concreta.
- Riesgo de alucinación: no cuantificado. La validación publicada mide capacidad y rechazo, no veracidad factual.
- Eliminación deliberada del comportamiento de rechazo: el modelo está diseñado para no rechazar peticiones. Esto implica que no incorpora barreras de seguridad en la generación y traslada toda la responsabilidad de filtrado al sistema que lo despliega. Un `SAFETY_DEFLECT` (10 de 100 casos) significa que el modelo añade avisos o descargos, pero responde igualmente.
- La cifra 0/100 rechazos corresponde a un conjunto fijo de prompts y a una configuración de inferencia concreta; no es una garantía universal y puede variar con otros prompts, temperaturas, system prompts o motores.
- Idiomas soportados: no disponible. No hay confirmación de cobertura multilingüe específica para esta variante.
- Licencia: `swift-open-license-1.0` bajo el campo `license: other`. Es una licencia no estándar; es imprescindible revisar sus términos completos antes de cualquier uso comercial, ya que puede imponer restricciones adicionales a las de una licencia open source convencional.
- Repositorio con control de acceso (`gated`): es necesario solicitar acceso y aceptar condiciones para descargar los pesos.
- Restricciones de uso: la combinación de ausencia de rechazo y licencia no estándar exige revisión legal y ética antes de un despliegue en producción orientado al público.
- Coste de contexto: aunque la ventana configurada es de 262.144 tokens, el contexto utilizable real depende de la configuración de servicio y de la memoria disponible; a máxima longitud, la caché KV puede dominar los requisitos de VRAM.
- Complejidad de despliegue: el peso en BF16 (≈52 GB) obliga a hardware profesional; no hay cuantizaciones ligeras publicadas que faciliten el despliegue en entornos modestos.
- Trazabilidad: el autor publica manifiestos SHA-256 y ficheros de validación, por lo que se recomienda ejecutar `sha256sum -c SHA256SUMS` tras la descarga para verificar la integridad del artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/d0xin/Swift-Qwen3.8-27B-Uncensored-BF16
- Modelo base: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Ficheros de validación incluidos en el repositorio: `INTELLIGENCE_VALIDATION.json`, `STRUCTURAL_VALIDATION.json`, `ABLITERATION.json`, `SHA256SUMS`, `RELEASE_HASHES.txt`
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a servicios de impresión 3D y no guardan relación con esta ficha.

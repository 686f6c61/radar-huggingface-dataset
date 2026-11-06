# inclusionAI/Ling-3.0-flash-Sante-fp8

## Resumen

Ling-3.0-flash-Sante-fp8 es la versión cuantizada en FP8 de Ling-3.0-flash-Sante, un modelo de lenguaje especializado en salud desarrollado por inclusionAI. Su nombre procede del francés *santé* ("salud"). Se construye sobre Ling-3.0-flash y está diseñado para razonamiento médico, investigación en salud, deep research y flujos de trabajo asistidos por herramientas, conservando al mismo tiempo las capacidades generales del modelo base.

El modelo emplea una arquitectura MoE híbrida-lineal que combina Kimi Delta Attention (KDA), gated MLA y capas MoE dispersas, con 124B de parámetros totales (127.486.405.600 según los safetensors) y 5,1B activos por token, lo que permite inferencia eficiente a gran escala. El contexto de entrenamiento se extiende hasta 256K tokens, apto para análisis de documentos largos y síntesis de evidencia.

La variante FP8 usa cuantización blockwise E4M3 (bloques de 128 × 128) en los pesos de los expertos, reduciendo la memoria de pesos sin pérdida apreciable de calidad: la media de benchmarks se mantiene en 73,9 frente al checkpoint BF16. Es un modelo de investigación, no un dispositivo médico, y su salida no sustituye el juicio clínico profesional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida-lineal (Kimi Delta Attention + gated MLA + capas MoE dispersas, tipo bailing_hybrid) |
| Parametros totales | 124B (127.486.405.600 según safetensors) |
| Parametros activos | 5,1B por token |
| Longitud de contexto | 256K tokens (262.144) |
| Tipos de cuantizacion | FP8 E4M3 blockwise (bloques de 128 × 128); el original está en BF16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 128,4 GB) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia bailing_hybrid de inclusionAI y combina tres componentes: Kimi Delta Attention (KDA), un mecanismo de atención de tipo lineal/delta que reduce el coste de contextos largos; gated MLA (Multi-head Latent Attention con puerta); y capas MoE dispersas que activan solo 5,1B de los 124B parámetros por token. Esta combinación híbrida-lineal busca equilibrar calidad, memoria y throughput en inferencia con contextos de hasta 256K tokens.

La cuantización FP8 sigue la receta de Ling-3.0-flash-fp8: cuantización blockwise E4M3 con tamaño de bloque 128 × 128 aplicada a los pesos de los expertos. Los frameworks de serving compatibles detectan la configuración de cuantización directamente desde el `quantization_config` del checkpoint, sin necesidad de flags adicionales. El modelo incorpora modo de razonamiento nativo (thinking) activado por defecto y soporte de tool calling. No se ha publicado información sobre el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Razonamiento médico complejo y conocimiento clínico (MedQA-USMLE 94,5, MedMCQA 81,1 en la variante FP8)
- Tareas de salud profesional (Healthbench Professional) y seguridad en salud
- Análisis de documentos largos, síntesis de evidencia y deep research gracias a la ventana de 256K tokens
- Modo de razonamiento nativo (thinking) habilitado por defecto
- Tool calling a través de frameworks de serving compatibles
- Diseñado para flujos multi-paso y colaboración multi-agente
- Conserva las capacidades generales de Ling-3.0-flash (texto conversacional, generación general)
- Decodificación especulativa soportada en serving (algoritmo NEXTN en SGLang)

## Casos de uso

- Resumen de evidencia clínica: dada una abstract o artículo médico, el modelo puede identificar endpoints primarios y sintetizar hallazgos, aprovechando la ventana de 256K tokens para procesar documentos completos.
- Investigación biomédica (deep research): flujos multi-paso de búsqueda y síntesis de literatura, con thinking mode por defecto para razonamiento extendido.
- Sistemas de QA médico avanzado: respuesta a preguntas de nivel profesional (tipo USMLE) en entornos de formación médica o verificación de conocimiento.
- Agentes asistidos por herramientas: integración con APIs clínicas o bases de conocimiento vía tool calling en frameworks compatibles.
- Colaboración multi-agente: como modelo especializado dentro de pipelines donde otros agentes manejan tareas generales.
- Análisis de historiales o documentación sanitaria extensa: el contexto largo permite procesar registros y protocolos completos en una sola sesión, siempre con revisión humana obligatoria.

## Benchmarks y rendimiento

Comparativa publicada por inclusionAI entre el checkpoint BF16 y el FP8 (temperature=1.0, top_p=0.95, reasoning effort al nivel máximo):

| Benchmark | Ling-3.0-flash-Sante (BF16) | Ling-3.0-flash-Sante-FP8 |
|---|---|---|
| Media | 73,9 | 73,9 |
| Healthbench Professional | 54,3 | 52,9 |
| ReDisQA | 89,7 | 90,6 |
| MedXpertQA-Text | 51,0 | 50,5 |
| MedQA-USMLE | 94,2 | 94,5 |
| MedMCQA | 80,3 | 81,1 |

No hay comparativas con modelos de terceros en la información disponible.

## Requisitos de hardware

- Memoria de pesos: ~128,4 GB en FP8 (repo completo), lo que exige hardware multi-GPU o nodos dedicados.
- Despliegue de referencia en SGLang: 4 GPUs de clase 141 GB (o nodo Blackwell de 4 GPUs) con `--tp 4 --ep-size 4` y contexto de 256K.
- En H100 u H800: `--tp 8 --ep-size 8` con los mismos ajustes.
- No cabe en GPUs de consumo (RTX 4090 y similares) ni en configuraciones de un solo GPU convencional.
- Frameworks de despliegue: SGLang (imagen oficial `lmsysorg/sglang:dev-Ling-3.0-flash`, con API compatible con OpenAI y decodificación especulativa NEXTN). No se menciona soporte verificado para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; se recomienda validar el checkpoint en la carga de trabajo propia antes de producción, ya que el rendimiento varía según runtime, kernels y paralelismo.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Especialización | Licencia |
|---|---|---|---|---|---|
| Ling-3.0-flash-Sante-fp8 | 124B | 5,1B | 256K | Salud | MIT |
| Ling-3.0-flash (base) | no disponible | no disponible | no disponible | General | no disponible |
| Ling-3.0-flash-Sante (BF16) | 124B | 5,1B | 256K | Salud | MIT |

No se dispone de datos suficientes para comparar con modelos de salud de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo de investigación, no un dispositivo médico: sus salidas pueden ser incompletas o incorrectas y no deben sustituir el consejo, diagnóstico o tratamiento médico profesional.
- Todo uso de alto riesgo requiere revisión humana cualificada, verificación independiente y cumplimiento de normativas de privacidad, seguridad y sanidad aplicables (p. ej., RGPD en el ámbito europeo).
- La cuantización FP8 puede degradar ligeramente Healthbench Professional (54,3 → 52,9); el comportamiento numérico varía según runtime, kernel, hardware y configuración de paralelismo.
- Idiomas soportados y composición del dataset de entrenamiento: no disponibles, lo que dificulta evaluar sesgos lingüísticos y demográficos.
- Riesgo de alucinación no cuantificado en la documentación; especialmente sensible en dominio clínico.
- Requiere hardware multi-GPU de gama alta y una imagen de SGLang específica, lo que limita el despliegue autogestionado.
- El modelo usa `custom_code` en Hugging Face, lo que exige confianza en el repositorio de origen.

## Enlaces

- Hugging Face: https://huggingface.co/inclusionAI/Ling-3.0-flash-Sante-fp8
- Modelo base BF16: https://huggingface.co/inclusionAI/Ling-3.0-flash-Sante
- Modelo base general: https://huggingface.co/inclusionAI/Ling-3.0-flash
- Organización inclusionAI: https://huggingface.co/inclusionAI
- ModelScope: https://www.modelscope.cn/models/inclusionAI/Ling-3.0-flash-Sante-fp8
- Vercel AI Gateway: https://vercel.com/ai-gateway/models/ling-3.0-flash-sante

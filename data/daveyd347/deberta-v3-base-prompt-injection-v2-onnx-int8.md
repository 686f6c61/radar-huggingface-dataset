# DaveyD347/deberta-v3-base-prompt-injection-v2-onnx-int8

## Resumen

`DaveyD347/deberta-v3-base-prompt-injection-v2-onnx-int8` es una compilación ONNX cuantizada a int8 del clasificador de inyección de prompts `protectai/deberta-v3-base-prompt-injection-v2`, desarrollado originalmente por ProtectAI. El repositorio no introduce cambios en el entrenamiento ni en los pesos lógicos del modelo: únicamente transforma el export ONNX de fp32 (739 MB) a un fichero cuantizado dinámicamente a int8 (244 MB), pensado para ejecutarse en el navegador mediante transformers.js.

El modelo resuelve una tarea concreta de seguridad: clasificar un texto de entrada como `SAFE` (etiqueta 0) o `INJECTION` (etiqueta 1), es decir, detectar intentos de manipular las instrucciones de un sistema LLM. Al ser una versión int8 de un modelo base DeBERTa-v3-base, mantiene la arquitectura transformer encoder del original con aproximadamente 184 millones de parámetros, aunque la model card no detalla el número exacto ni la longitud de contexto soportada.

Su relevancia actual radica en el despliegue en entornos con recursos limitados: permite incorporar un guardrail de prompt injection en aplicaciones web del lado del cliente o en infraestructura sin GPU, con una reducción de tamaño de aproximadamente el 67 % respecto al export fp32. Es un artefacto de inferencia, no un modelo nuevo; toda la calidad y las limitaciones heredan del modelo de ProtectAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3-base), exportado a ONNX y cuantizado dinámicamente a int8 |
| Parametros totales | no disponible (el modelo base DeBERTa-v3-base tiene ~184 M, dato no confirmado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 dinámica (QUInt8, per-channel) sobre pesos; activaciones en fp32 durante la ejecución |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | ONNX (`onnx/model_quantized.onnx`), 244 MB; el export fp32 original ocupa 739 MB |

## Arquitectura y entrenamiento

El modelo base es un DeBERTa-v3-base configurado como clasificador binario de secuencias (`text-classification`), con dos etiquetas: `0 = SAFE` y `1 = INJECTION`. La model card de este repositorio no aporta detalles sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni si se aplicaron técnicas de RLHF o ajuste supervisado; esa información corresponde al modelo original de ProtectAI.

La única innovación técnica documentada en este repositorio es el proceso de cuantización: se aplicó `quantize_dynamic` de ONNX Runtime con `weight_type=QuantType.QUInt8` y `per_channel=True`. El autor destaca que la cuantización per-channel es crítica frente a la per-tensor: con cuantización per-tensor, una inyección que dividía el payload en fragmentos bajó de una puntuación de 1.00 a 0.10. Con pesos per-channel, sobre los 17 prompts de la librería de ataques del Space asociado, la decisión SAFE/INJECTION coincide con fp32 con umbral 0.9 en 16 de 17 casos; la excepción es una inyección en leetspeak que puntúa 0.95 en esta versión frente a 0.07 en fp32. El propio autor califica esta comprobación como un spot check, no como un benchmark.

## Capacidades

- Clasificación binaria de texto: distingue entre entradas seguras (`SAFE`) y intentos de inyección de prompt (`INJECTION`).
- Detección de payloads de inyección directa, incluidos casos de fragmentación de payload y variantes ofuscadas (con degradación documentada en leetspeak).
- Inferencia en navegador mediante transformers.js con `dtype: "q8"`.
- Ejecución en CPU sin GPU, gracias al formato ONNX int8.
- Integración como guardrail previo o posterior a llamadas a un LLM.
- Capacidades multilingües: limitadas al inglés; no se documenta soporte de otros idiomas.
- No soporta tool calling, agentes, generación de texto, visión ni audio: es exclusivamente un clasificador.

## Casos de uso

- Filtro de entrada en aplicaciones LLM en el navegador: el clasificador puede ejecutarse del lado del cliente con transformers.js antes de enviar el prompt al servidor, bloqueando inyecciones sin añadir latencia de red adicional y sin exponer el texto a un servicio externo.
- Guardrail en un sandbox de pruebas de seguridad: es el uso real documentado por el autor, que lo integra en el Space "Prompt Injection & Guardrail Sandbox" como clasificador de guardia sobre una librería de 17 prompts de ataque.
- Moderación de entradas en chatbots de atención al cliente: clasificar cada mensaje del usuario como seguro o sospechoso antes de pasarlo al modelo generativo, con un umbral configurable (el autor usa 0.9) para equilibrar falsos positivos y falsos negativos.
- Protección de pipelines RAG: inspeccionar el texto recuperado o las consultas de usuario antes de insertarlas en el contexto del LLM, mitigando inyecciones indirectas embebidas en documentos.
- Despliegue en entornos edge o sin GPU: al ocupar 244 MB en int8 y ejecutarse con ONNX Runtime, encaja en servidores pequeños, contenedores ligeros o dispositivos con CPU modesta donde un clasificador fp32 de 739 MB sería excesivo.
- Capa de defensa en profundidad: combinarlo con otras medidas (delimitadores de instrucciones, validación de salidas, permisos mínimos de herramientas) para reducir la superficie de ataque de un agente con acceso a funciones.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la degradación de un clasificador de seguridad al pasar de fp32 a int8 en un conjunto propio de prompts.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye una comprobación cualitativa sobre 17 prompts: coincidencia de decisión con fp32 (umbral 0.9) en 16 de 17 casos, con una excepción en leetspeak (0.95 int8 frente a 0.07 fp32). El autor indica explícitamente que no es un benchmark y remite a la model card original para cifras de precisión.

## Requisitos de hardware

- VRAM estimada: no aplica en el caso principal de uso (inferencia en CPU); el fichero de pesos int8 ocupa 244 MB frente a los 739 MB del export fp32.
- GPU recomendadas: no se especifican; el modelo está diseñado para ejecutarse sin GPU. Cualquier GPU con soporte de ONNX Runtime podría acelerar la inferencia, pero no hay datos publicados.
- GPU de consumo: al ser un encoder de ~184 M de parámetros en int8, es plausible que quepa en GPUs de consumo con poca memoria, aunque no se documenta ningún requisito concreto.
- Opciones de despliegue: transformers.js con `dtype: "q8"` (uso documentado); ONNX Runtime en Python o C++ para el fichero `onnx/model_quantized.onnx`; el modelo base admite también despliegue con transformers y, presumiblemente, con pipelines de clasificación estándar, aunque este repositorio solo documenta el uso con ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (int8 ONNX) | no disponible (~184 M en el base) | no disponible | ONNX int8, 244 MB | Apache-2.0 | Cuantización per-channel; uso en navegador con transformers.js |
| `protectai/deberta-v3-base-prompt-injection-v2` | ~184 M (base) | no disponible | safetensors / ONNX fp32 | Apache-2.0 | Modelo original; referencia de precisión y limitaciones |
| `protectai/deberta-v3-base-prompt-injection` (v1) | ~184 M (base) | no disponible | safetensors | Apache-2.0 | Versión anterior del mismo clasificador; comparación no documentada en esta ficha |
| Clasificadores genéricos de toxicidad (p. ej. modelos DeBERTa o RoBERTa de moderación) | variable | variable | variable | variable | Tarea distinta: no detectan inyección de prompt específicamente |

La comparación cuantitativa de rendimiento entre estas alternativas no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Idiomas: el modelo es English-centric; no se garantiza detección en castellano ni en otros idiomas.
- Cobertura: al igual que el original, no detecta jailbreaks que no contengan una inyección explícita.
- Degradación por cuantización: la comprobación del autor muestra un caso (leetspeak) con puntuación muy distinta a fp32 (0.95 frente a 0.07), lo que indica que ciertas variantes ofuscadas pueden clasificarse de forma errónea.
- Validación insuficiente: la única evaluación es un spot check de 17 prompts; no hay métricas de precisión, recall ni falsos positivos publicadas para esta versión.
- Riesgo de falsos positivos y negativos en producción: el umbral debe calibrarse con datos propios; el valor 0.9 es solo el usado en el sandbox del autor.
- Sesgos: no documentados en esta model card; deben consultarse en la del modelo base de ProtectAI.
- Licencia: Apache-2.0 permite uso comercial, pero se heredan las condiciones y atribuciones del modelo base; conviene revisar la model card original.
- Naturaleza del artefacto: es una conversión de formato, no un modelo reentrenado; cualquier mejora o corrección debe venir del modelo de ProtectAI.
- Fecha de creación del repositorio: 2026-11-18, con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de adopción comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/DaveyD347/deberta-v3-base-prompt-injection-v2-onnx-int8
- Modelo base: https://huggingface.co/protectai/deberta-v3-base-prompt-injection-v2
- Space asociado (Prompt Injection & Guardrail Sandbox): https://huggingface.co/spaces/DaveyD347/prompt-injection-guardrail-sandbox
- transformers.js: https://github.com/huggingface/transformers.js

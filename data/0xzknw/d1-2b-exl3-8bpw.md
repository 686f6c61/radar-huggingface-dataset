# 0xzknw/d1-2B-EXL3-8bpw

## Resumen

d1-2B-EXL3-8bpw es una conversión cuantizada a 8 bits por peso (8 bpw) en formato EXL3 del modelo LiquidAI/d1-2B, publicada por el usuario 0xzknw. El modelo base es un "decision model": en lugar de generar texto libre, responde a preguntas tipadas y con nombre sobre un estado (texto, JSON o imágenes) en un único forward pass, devolviendo probabilidades calibradas por opción. Esta conversión preserva esa semántica de decisión y añade el formato de pesos EXL3 MCG generado con ExLlamaV3.

La relevancia de esta ficha es doble: por un lado, documenta una alternativa de despliegue de bajo peso (2,7 GB en repositorio, 1.354.003.456 parámetros) para un modelo multimodal de decisión; por otro, advierte de que no es un checkpoint estándar de Transformers. El archivo `.safetensors` es un checkpoint EXL3 MCG que requiere un runtime específico (MLXL3 2.0.16 o superior) y no funciona con el código `D1Model` de Transformers.

Arquitecturalmente, el modelo base pertenece a la familia LFM3 VL de Liquid AI, con torre de visión y configuración `Lfm3VlForConditionalGeneration`. La conversión mantiene el modelo de lenguaje y la torre de visión a 8 bpw y la cabeza de salida a 16 bits, conservando los parámetros `d1_attention`, `d1_codes`, `d1_numbers`, `d1_set_size` y `d1_vision_max_pixels`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 VL (`Lfm3VlForConditionalGeneration`), modelo de decisión con torre de visión; pesos en formato EXL3 MCG |
| Parametros totales | 1.354.003.456 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 a 8 bpw (codebook MCG) para modelo de lenguaje y torre de visión; cabeza de salida a 16 bits |
| Idiomas soportados | no disponible |
| Licencia | lfm-open-license-v1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors (checkpoint EXL3 MCG, no BF16 estándar) |

## Arquitectura y entrenamiento

El modelo base LiquidAI/d1-2B es un modelo de decisión de la familia LFM3 VL que combina un modelo de lenguaje con una torre de visión. A diferencia de un modelo generativo convencional, d1 formula la salida como una distribución de probabilidad sobre opciones nombradas y tipadas, con temperaturas de respuesta calibradas almacenadas en `calibration.json`. La conversión EXL3 no reentrena ni modifica los parámetros de decisión: conserva `d1_attention`, `d1_codes`, `d1_numbers`, `d1_set_size` y `d1_vision_max_pixels`, así como el tokenizador, la configuración del procesador y la plantilla de chat.

La cuantización se realizó con ExLlamaV3 1.6.6 sobre una GPU H100, aplicando un codebook MCG a 8 bpw al modelo de lenguaje y a la torre de visión, y dejando la cabeza de salida a 16 bits. El `config.json` se renombró a `Lfm3VlForConditionalGeneration` para que el conversor aceptara el checkpoint y se añadió el `quantization_config` correspondiente; la configuración original se conserva como `source_config.json`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Respuesta a preguntas tipadas y con nombre sobre un estado en un único forward pass, con probabilidades calibradas por opción y sin generación de texto libre.
- Procesamiento de estados en texto plano, JSON anidado e imágenes (pipeline `image-text-to-text`).
- Manejo de tokens especiales dentro del estado y de estados largos (se validó con un estado de 1.376 tokens).
- Soporte de múltiples preguntas en varias pasadas (se validaron 20 preguntas en dos pasadas).
- Soporte de hasta 30 opciones por pregunta en las pruebas de fidelidad.
- Extracción de números y fechas parseados como parte de la respuesta final.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, audio ni modo thinking en la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Clasificación documental con probabilidad calibrada: dado un texto o JSON de estado, formular preguntas tipadas (por ejemplo, categoría, urgencia, importe) y obtener una distribución de probabilidad sobre opciones predefinidas, útil cuando se necesita confianza cuantificada en lugar de texto generado.
- Enrutamiento de tickets de soporte: usar el modelo para decidir etiquetas discretas (departamento, prioridad) sobre el estado del ticket en una sola pasada, con coste de inferencia bajo gracias a los 8 bpw.
- Validación de formularios y JSON: comprobar si un estado JSON cumple condiciones nombradas, incluyendo JSON anidado y tokens especiales, con offsets de caracteres idénticos a la referencia.
- Extracción estructurada de números y fechas: aprovechar la salida parseada de números y fechas para poblar campos de sistemas downstream sin postprocesado de texto libre.
- Decisión multimodal sobre imágenes: clasificar o responder preguntas sobre capturas, documentos escaneados o imágenes junto con estado textual, usando la torre de visión cuantizada a 8 bpw.
- Evaluación con conjuntos de opciones amplios: escenarios con hasta 30 opciones por pregunta y múltiples preguntas en varias pasadas, adecuados para paneles de decisión o cuestionarios estructurados.
- Despliegue en entornos con VRAM limitada: el tamaño de repositorio de 2,7 GB y la cuantización a 8 bpw permiten servir el modelo en GPUs de gama media, siempre que el runtime soporte EXL3 y decisiones d1.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye únicamente comprobaciones de fidelidad de la cuantización frente a la referencia oficial en FP32 (Transformers 5.19, A10G) sobre 12 fixtures:

| Metrica | Resultado |
|---|---|
| Fixtures evaluados | 12 (texto, JSON anidado, tokens especiales, 30 opciones, 20 preguntas en dos pasadas, estado de 1.376 tokens, dos imágenes) |
| Token IDs, posiciones de slot y offsets de caracteres | idénticos a la referencia |
| KL media en 70 slots de opción | 8,8e-5 nats |
| KL máxima en 70 slots de opción | 8,3e-4 nats |
| Desviación de probabilidades por opción | dentro de 0,0088 |
| Respuestas finales (incluidos números y fechas parseados) | idénticas a la referencia |

Estas comprobaciones son de fidelidad de cuantización, no un benchmark de rendimiento del modelo. Las evaluaciones upstream están en la model card del modelo base y no validan por sí mismas esta cuantización.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 2,7 GB y los pesos están a 8 bpw con cabeza de salida a 16 bits, por lo que la huella de pesos es de ese orden más overhead del runtime.
- GPU recomendadas: no disponible. La conversión se realizó en una H100 y la referencia FP32 se ejecutó en una A10G.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible; el tamaño de pesos sugiere que podría caber en GPUs de consumo con VRAM suficiente, pero no se documenta.
- Opciones de despliegue: exclusivamente runtimes que soporten decisiones d1 sobre LFM3 con EXL3, como el motor MLXL3 2.0.16 o superior (`mlxl3 decide`, `decide-bridge`, `decide-serve`) o el modo Decision de la aplicación Desktop (descarga desde la página Models requiere MLXL3 2.0.17 o superior). No funciona con el código `D1Model` de Transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| d1-2B-EXL3-8bpw (esta ficha) | 1.354.003.456 | no disponible | EXL3 MCG safetensors, 8 bpw | lfm-open-license-v1.0 | Requiere MLXL3 2.0.16+; no compatible con Transformers `D1Model` |
| LiquidAI/d1-2B (base) | no disponible en la información | no disponible | safetensors BF16 (presumible) | lfm-open-license-v1.0 | Modelo de decisión original; ejecutable con el código de referencia oficial |
| Otras cuantizaciones de d1-2B | no disponible | no disponible | no disponible | lfm-open-license-v1.0 | No se documentan en la información proporcionada |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoría (modelos de decisión con salida probabilística) en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, solo distribuciones sobre opciones nombradas y tipadas; no debe usarse para chat o generación abierta.
- Compatibilidad restringida: el checkpoint EXL3 MCG no carga con Transformers `D1Model`; requiere MLXL3 2.0.16 o superior (2.0.17+ para descarga desde la app Desktop).
- Las comprobaciones de fidelidad son 12 fixtures estrechos, no un benchmark; no garantizan paridad fuera de esos casos.
- Las evaluaciones upstream del modelo base no validan esta cuantización concreta.
- No es una release oficial de Liquid AI; el autor de la conversión es 0xzknw.
- Licencia LFM Open License v1.0 con aviso de modificación (`NOTICE`); es necesario revisar los términos para uso comercial.
- Idiomas soportados no documentados; riesgo de comportamiento no verificado fuera de los idiomas cubiertos por el modelo base.
- Sesgos y riesgo de alucinación: no documentados en la información disponible; al ser un modelo de decisión, el riesgo se traslada a calibración incorrecta de probabilidades en dominios fuera de distribución.
- Longitud de contexto no disponible; el estado más largo validado fue de 1.376 tokens, sin garantía más allá de ese tamaño.
- Sin descargas ni likes en el momento de la consulta; madurez y soporte comunitario limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/0xzknw/d1-2B-EXL3-8bpw
- Modelo base: https://huggingface.co/LiquidAI/d1-2B
- Repositorio del motor MLXL3: https://github.com/0xZKnw/mlxl3
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
- Liquid AI en Hugging Face: https://huggingface.co/LiquidAI
- Modal: https://modal.com
- Perfil del autor: https://huggingface.co/0xzknw

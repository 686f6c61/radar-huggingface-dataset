# ChatoyantAI/gemma-4-12b-it-lusy-sft-v4.0.1-step4300-lora

## Resumen

Lusy v4.0.1 step 4300 es un adaptador LoRA de ajuste supervisado (SFT) sobre el modelo base `google/gemma-4-12B-it`, publicado por el usuario ChatoyantAI. No es un modelo autónomo ni un modelo fusionado: son únicamente pesos de adaptador en formato PEFT/safetensors (0,6 GB de repositorio) que requieren descargar y cargar el base original. Su propósito declarado es el diálogo conversacional y el roleplay, con un dataset de entrenamiento compuesto por 44.275 registros de roleplay y 9.800 registros generales.

El adaptador se entrenó con Unsloth y PEFT sobre la arquitectura `Gemma4UnifiedForConditionalGeneration`, en BF16 y sin cuantización de pesos, aplicando LoRA de rango 32 y alpha 64 sobre las capas de atención y MLP de texto, con 131.137.536 parámetros entrenables. El entrenamiento estaba planificado a 2 épocas y esta publicación es un checkpoint intermedio en el step 4300 (aproximadamente 1,27 épocas), no el modelo final.

Es relevante ahora como ejemplo de flujo de trabajo de fine-tuning eficiente sobre un modelo de 12B con contexto configurado de 65.536 tokens en dos H100, y como material de partida reproducible para experimentos de SFT orientados a personajes y conversación multi-turno. La model card no reclama mejoras en benchmarks de capacidad general, seguridad o preferencia, y no incluye ninguna evaluación externa de generación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma4UnifiedForConditionalGeneration (modelo base `google/gemma-4-12B-it`) con adaptadores LoRA sobre atención y MLP de texto |
| Parametros totales | Modelo base de 12B (denominación nominal); adaptador LoRA con 131.137.536 parámetros entrenables |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 65.536 tokens configurados durante el entrenamiento (no es garantía de precisión en contexto largo) |
| Tipos de cuantizacion | Entrenamiento en BF16 sin cuantización de pesos; no se publican artefactos cuantizados (GGUF, AWQ, GPTQ no disponibles) |
| Idiomas soportados | No disponible (la model card no especifica idiomas) |
| Licencia | Apache 2.0 (según metadatos del modelo base; ver LICENSE, NOTICE y BASE_MODEL_README.md en el repositorio) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); tamaño del repositorio 0,6 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Gemma4UnifiedForConditionalGeneration`, con LoRA de rango 32, alpha 64 y dropout 0 en las capas de atención y MLP de texto. El entrenamiento usó Unsloth junto con PEFT (versiones declaradas: Transformers 5.10.2, PEFT 0.18.1, Unsloth 2026.9.2), con el base en BF16 y sin cuantización de pesos, sobre 2 GPU H100. La configuración de batch fue fija: batch 1 por GPU, acumulación de gradientes 8 y batch global 16, con batching dinámico desactivado. Se empleó una tasa de aprendizaje máxima de 1e-4 con schedule coseno, 10% de warmup y recorte de gradiente de 1.

El dataset v4.0.1 consta de 44.275 registros de roleplay y 9.800 registros generales de entrenamiento, más 891 registros de roleplay y 200 generales de validación. Solo se supervisa la respuesta final del asistente; los turnos anteriores actúan como contexto. La longitud de secuencia máxima configurada fue de 65.536 tokens, sin empaquetado de secuencias (sequence packing). El plan de entrenamiento era de 2 épocas, y esta publicación corresponde al checkpoint del step 4300, aproximadamente 1,2722 épocas, por lo que es un checkpoint intermedio. La última pérdida de validación combinada registrada fue de 1,05497244 en el step 4200; la model card aclara explícitamente que no es una evaluación nueva del step 4300 ni un resultado de benchmark externo. La verificación realizada cubre forma y finitud de los tensores del adaptador, integridad de los recursos y carga de la plantilla del tokenizador; no se incluye ningún benchmark de generación nuevo con esta release.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat que preserva la secuencia `system -> assistant greeting -> user -> assistant history ... -> user`.
- Roleplay y encarnación de personajes, ámbito principal del dataset de ajuste (44.275 registros de roleplay).
- Conversaciones de temática adulta o madura, dado que el dataset incluye ese tipo de contenido.
- Mantenimiento de contexto largo en la configuración de entrenamiento de 65.536 tokens, sin garantía de precisión a esa longitud.
- Diálogo general y tareas conversacionales básicas, apoyadas en los 9.800 registros generales del dataset.
- Soporte de tool calling o function calling: no disponible (no se menciona en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se menciona en la model card).
- Capacidades multilingües: no disponible (no se documentan idiomas).
- Capacidades multimodales: el adaptador es de texto; el comportamiento multimodal no se ha evaluado tras el SFT, pese a que la arquitectura base es de tipo unificado.
- Modo "thinking" explícito: no disponible.

## Casos de uso

- Roleplay de personajes en producción: el adaptador está entrenado específicamente sobre 44.275 registros de roleplay, lo que permite mantener una voz y un comportamiento de personaje consistentes a lo largo de sesiones multi-turno. Requiere revisión de salidas antes de exponerlo a usuarios finales.
- Prototipado de asistentes conversacionales de nicho: sirve para validar plantillas de prompt y flujos de diálogo con la secuencia `system -> assistant greeting -> user -> ... -> user` antes de invertir en un fine-tuning completo o en un modelo fusionado.
- Escritura creativa asistida y narrativa interactiva: el ajuste sobre diálogo con temática madura permite generar escenas y réplicas de ficción; conviene filtrar la salida si el producto final va dirigido a público general.
- Investigación sobre SFT y LoRA: al publicarse un checkpoint intermedio (step 4300, ~1,2722 épocas de un plan de 2 épocas), resulta útil para estudiar la evolución de la pérdida de validación (1,05497244 en el step 4200) y comparar checkpoints intermedios frente al modelo final.
- Base para un ajuste posterior: el adaptador puede servir como punto de partida (continuar el entrenamiento o aplicar DPO) sobre `google/gemma-4-12B-it` para dominios conversacionales concretos, reutilizando su plantilla de chat.
- Evaluación comparativa de estrategias de fine-tuning eficiente: la configuración documentada (rango 32, alpha 64, dropout 0, batch global 16, LR 1e-4 con coseno y warmup del 10% en 2 H100) es reproducible y sirve como referencia para experimentos de bajo rango en modelos de 12B.
- Conversaciones largas con contexto extenso: la ventana configurada de 65.536 tokens permite mantener historiales de diálogo muy largos en memoria de una sola pasada, siempre que se validen empíricamente las pérdidas de calidad en longitudes extremas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se reclama ninguna mejora en benchmarks independientes de preferencia, seguridad o capacidad general, y que la verificación realizada se limita a forma y finitud de los tensores del adaptador, integridad de los recursos y carga de la plantilla del tokenizador.

El único dato numérico de rendimiento publicado es la última pérdida de validación combinada registrada antes de este checkpoint:

| Metrica | Valor | Contexto |
|---|---|---|
| Pérdida de validación combinada | 1,05497244 | Step 4200; no es una evaluación del step 4300 ni un benchmark externo |
| Épocas completadas | ~1,2722 | Checkpoint intermedio del step 4300 sobre un plan de 2 épocas |
| Parámetros entrenables | 131.137.536 | LoRA de texto (atención y MLP) |

## Requisitos de hardware

- El adaptador ocupa 0,6 GB, pero requiere cargar el modelo base de 12B, que domina el consumo de memoria.
- VRAM estimada para el base en BF16: aproximadamente 24 GB solo para pesos, más overhead de activaciones, caché KV y el adaptador; en la práctica se recomienda un margen adicional.
- VRAM estimada en cuantización de 4 bits (si se cuantiza el base por separado): del orden de 7-9 GB para pesos, más overhead; el adaptador se puede mantener en BF16.
- GPU recomendadas: 2 x H100 fue la configuración de entrenamiento declarada; para inferencia, una A100 de 40/80 GB o una H100 permiten BF16 sin cuantizar. Una RTX 4090 o RTX 3090 de 24 GB es viable en BF16 con margen ajustado o en cuantización de 4 bits.
- ¿Cabe en GPU de consumo? Sí, con matices: en GPUs de 24 GB (RTX 3090, 4090) en cuantización de 4 bits o con BF16 y gestión cuidadosa de la caché KV; en GPUs de 16 GB o menos, solo con cuantización agresiva del base.
- Opciones de despliegue: Transformers con PEFT (vía `PeftModel.from_pretrained`, tal como documenta la model card), o servidores con soporte de adaptadores LoRA como vLLM. No hay artefactos GGUF publicados, por lo que llama.cpp u Ollama exigirían fusionar el adaptador con el base y convertir los pesos por cuenta propia.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de latencia, tokens por segundo ni comparativas de rendimiento en inferencia.
- Requisitos de software: build de Transformers compatible con `Gemma4UnifiedForConditionalGeneration` (el entrenamiento usó Transformers 5.10.2, PEFT 0.18.1 y Unsloth 2026.9.2).

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA de roleplay comparables en la documentación proporcionada. La única comparación posible es contra el modelo base sobre el que se aplica el adaptador:

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ChatoyantAI/gemma-4-12b-it-lusy-sft-v4.0.1-step4300-lora | Adaptador con 131.137.536 parámetros entrenables sobre base de 12B | 65.536 tokens configurados en entrenamiento | safetensors (PEFT/LoRA) | Apache 2.0 | Público en HuggingFace; 0 descargas y 0 likes en el momento de la consulta |
| google/gemma-4-12B-it (base) | 12B | No disponible en la información proporcionada | No disponible en la información proporcionada | No disponible en la información proporcionada (el adaptador sigue los metadatos del base) | Requerido para usar el adaptador |

Otras alternativas de la misma categoría (adaptadores de roleplay sobre modelos de ~12B): no disponible.

## Limitaciones y advertencias

- El dataset de entrenamiento incluye roleplay y temáticas para adultos; las salidas pueden ser inexactas, sesgadas, inapropiadas o memorizadas, y requieren revisión humana antes de cualquier uso en producción.
- No se reclama ninguna mejora en benchmarks independientes de preferencia, seguridad o capacidad general; la verificación se limita a integridad de tensores, recursos y plantilla del tokenizador.
- Riesgo de alucinación: inherente a un modelo de lenguaje ajustado con SFT sobre datos conversacionales; no se publica ninguna evaluación de factualidad.
- Es un checkpoint intermedio (step 4300, ~1,2722 épocas), no el modelo final de 2 épocas ni el checkpoint exacto de la primera época, lo que puede implicar un ajuste incompleto.
- No es un modelo autónomo ni fusionado: requiere obligatoriamente el base `google/gemma-4-12B-it` y una build de Transformers compatible con `Gemma4UnifiedForConditionalGeneration`.
- La longitud de 65.536 tokens es la configuración de entrenamiento, no una garantía de precisión en contexto largo.
- El comportamiento multimodal no ha sido evaluado tras el SFT, pese a que la arquitectura base es de tipo unificado.
- Sesgos conocidos: no documentados explícitamente en la información disponible.
- Idiomas soportados: no documentados.
- Restricciones de licencia: Apache 2.0 según los metadatos del modelo base, pero la propia model card remite a LICENSE, NOTICE y BASE_MODEL_README.md; conviene verificar esos ficheros antes de un uso comercial.
- El dataset no se incluye, lo que limita la reproducibilidad y la auditoría de los datos de entrenamiento.
- Los estados del optimizador, los ejemplos de entrenamiento, las credenciales y los logs crudos están excluidos del repositorio.
- No es una release oficial de Google.
- El repositorio registraba 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/ChatoyantAI/gemma-4-12b-it-lusy-sft-v4.0.1-step4300-lora
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Ficheros incluidos en el repositorio del adaptador: `release-manifest.json` (hashes y procedencia), `LICENSE`, `NOTICE`, `BASE_MODEL_README.md`
- Búsqueda web: el único resultado devuelto fue https://forum.openstreetmap.org/search.php?action=show_user_posts&user_id=991, sin relación con el modelo. No se han encontrado papers, blogs, repositorios ni demos adicionales.

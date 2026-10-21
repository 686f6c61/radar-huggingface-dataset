# 3adel25/Llama-3.1-8B-Customer-service-question-and-answer

## Resumen

Este repositorio, publicado por el usuario 3adel25, contiene un ajuste fino supervisado de Llama 3.1 8B de Meta orientado a la generación de borradores de respuesta en atención al cliente. El modelo parte de `meta-llama/Llama-3.1-8B` (la variante base, no la Instruct) y se ha entrenado con SFT mediante LoRA/PEFT usando Unsloth, Transformers y el `SFTTrainer` de TRL. El recuento real de parámetros en safetensors es de 8.030.261.312, coherente con la arquitectura Llama 3.1 8B.

La relevancia práctica es limitada y conviene entenderla antes de descargarlo: la configuración de entrenamiento documentada es de un máximo de 60 pasos, con batch size 1 y acumulación de gradiente 4, lo que equivale a unos pocos cientos de ejemplos vistos. Se trata, por tanto, de un artefacto de experimentación y prototipado de técnicas de fine-tuning eficiente, no de un modelo listo para producción. El propio autor lo enmarca como material para generar borradores sujetos a revisión humana.

La model card es explícitamente cauta: no se publican métricas de evaluación, no se verifican la procedencia ni la licencia del dataset, y se advierte de que el repositorio "pretende contener" el modelo ajustado, sin confirmar qué artefactos están realmente presentes. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1), con adaptadores LoRA sobre módulos de atención y proyecciones MLP |
| Parametros totales | 8.030.261.312 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens en el modelo base Llama 3.1; el entrenamiento se configuró con un máximo de 2.048 tokens. No verificado en la `config.json` del repositorio |
| Tipos de cuantizacion | Exportación GGUF en `f16` configurada en el notebook; carga del modelo base en 4 bits durante el entrenamiento (QLoRA). No se documentan otros niveles (Q4_K_M, Q8_0, etc.) |
| Idiomas soportados | Inglés (`en`); el modelo base tiene capacidades multilingües, pero el ajuste fino y el dataset están en inglés |
| Licencia | `apache-2.0` según la etiqueta del repositorio. Advertencia: el modelo base Llama 3.1 está sujeto a la Llama Community License de Meta, con condiciones adicionales que prevalecen |
| Formato de pesos | `safetensors` (tamaño del repo: 16,1 GB) y GGUF `f16` según la configuración del notebook; la existencia efectiva de ambos artefactos no está verificada en la model card |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B: un transformer decoder-only denso con normalización RMSNorm, activación SwiGLU, embeddings RoPE y atención con KV cache; el modelo base emplea Grouped Query Attention (GQA) para reducir el coste de memoria del KV cache en contextos largos. Sobre esta base se aplicaron adaptadores LoRA de rango 16 y alpha 16, con dropout 0, adheridos a los módulos de atención y a las proyecciones MLP. El entrenamiento se hizo en 4 bits con Unsloth como capa de aceleración, optimizador AdamW de 8 bits, learning rate 2e-4, batch por dispositivo de 1 y acumulación de gradiente de 4.

El detalle más importante para evaluar el artefacto es la escala del entrenamiento: un máximo de 60 pasos. Con esa configuración, el número de ejemplos procesados es de unos 240 (60 pasos × batch 1 × acumulación 4), un volumen que en la práctica solo alcanza para demostrar que el pipeline funciona. No se documenta número de tokens de entrenamiento, composición del dataset más allá de los cuatro campos de prompt (`instruction`, `client_question`, `generated_answer`, `ground_truth`), ni si hubo fases de RLHF o DPO (no las hubo, según lo descrito). No se mencionan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en inglés orientada a respuestas de atención al cliente, con formato de instrucción (instruction / pregunta del cliente / respuesta).
- Generación de borradores de respuesta a partir de una pregunta de cliente y, potencialmente, de un contexto de política o respuesta de referencia (`ground_truth` en el dataset de entrenamiento).
- Condicionamiento por instrucciones: el formato de prompt incluye un campo `instruction` separado de la pregunta, lo que permite cierto control del estilo de respuesta.
- Capacidades heredadas del modelo base Llama 3.1 8B: razonamiento básico, matemáticas elementales, generación de código y comprensión lectora, en la medida en que el ajuste fino no las haya degradado (no evaluado).
- Soporte de tool calling / function calling: no disponible de forma nativa en este ajuste (el modelo base no-Instruct no está entrenado para ello y el fine-tuning no lo añade).
- Soporte de agentes y razonamiento multi-paso: no documentado; el ajuste está orientado a un único turno de pregunta-respuesta.
- Capacidades multilingües: limitadas en la práctica; el ajuste se hizo exclusivamente en inglés y la model card declara solo `en`.
- Capacidades especiales (visión, audio, modo "thinking"): no disponibles.

## Casos de uso

- Prototipado de pipelines de SFT con LoRA/Unsloth: sirve como ejemplo reproducible de cómo ajustar un Llama 3.1 8B en 4 bits con `SFTTrainer` y exportar a GGUF, útil para equipos que quieran montar su propio flujo con datos propios.
- Generación de borradores de respuesta en atención al cliente con revisión humana obligatoria: el modelo produce un primer borrador que un agente revisa, corrige y envía; encaja en herramientas internas de "agent assist" donde el coste de un error es bajo porque hay validación posterior.
- Clasificación y reformulación de consultas de soporte: aunque no fue entrenado específicamente para ello, el formato instruction-following permite pedirle normalizaciones, resúmenes de tickets o reescrituras de tono, siempre con validación.
- Banco de pruebas de evaluación: útil para comparar metodologías de evaluación de calidad de respuesta en soporte (corrección, relevancia, tono, cumplimiento de política) sobre un modelo deliberadamente débil, como línea base.
- Aprendizaje y docencia: ejemplo didáctico de fine-tuning con PEFT para cursos o talleres, dado el bajo coste computacional del entrenamiento (60 pasos en una sola GPU consumer de 16-24 GB con cuantización 4 bits).
- Experimentación con exportación GGUF y despliegue en Ollama: el notebook configura la exportación en `f16`, lo que permite probar el circuito completo hasta inferencia local, si el artefacto existe.
- Generación de respuestas sintéticas para aumentar datasets de soporte: con filtrado y revisión, puede producir candidatos de respuesta que luego se depuran manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reportan métricas de exactitud, win rate ni preferencia humana, y que el notebook de entrenamiento no incluye evaluación sobre un conjunto de test separado. Tampoco se han encontrado resultados en la búsqueda web realizada (los resultados devueltos no guardaban relación con el modelo).

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Evaluación específica de atención al cliente | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 16-18 GB solo para pesos, más KV cache; con 2.048 tokens de contexto el overhead es pequeño, pero con contexto largo (hasta 128k en el base) el KV cache crece de forma significativa.
- VRAM estimada en 8 bits: aproximadamente 9-10 GB.
- VRAM estimada en 4 bits (GGUF Q4_K_M o similar): aproximadamente 5-6 GB, con margen para contexto moderado.
- GPU profesionales: A100 40/80 GB, H100, L40S o A10G para servir en FP16 con contexto largo y concurrencia.
- GPU consumer: cabe en RTX 4090 / 3090 (24 GB) en FP16; en RTX 4080/4070 Ti (16 GB) conviene 8 bits; en RTX 3060 12 GB, RTX 4060 Ti 16 GB o incluso 8 GB funciona con cuantización Q4.
- Opciones de despliegue: `transformers` con `device_map="auto"` (ruta documentada en la model card), `llama.cpp` y Ollama si existe el GGUF, vLLM o TGI para serving en FP16, y PEFT si el repositorio solo contiene adaptadores (en ese caso hay que cargar el base `meta-llama/Llama-3.1-8B` por separado).
- Latencia y throughput: no disponibles; no se han publicado mediciones. A modo orientativo y no verificado, un 8B en FP16 sobre una RTX 4090 suele generar decenas de tokens por segundo, pero este dato no procede de la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 3adel25/Llama-3.1-8B-Customer-service-question-and-answer | 8,03 B | 128k en el base; 2.048 en entrenamiento | SFT LoRA, 60 pasos, dataset de soporte en inglés | `apache-2.0` declarada, sujeta a Llama Community License por el base | HuggingFace, 0 descargas |
| meta-llama/Llama-3.1-8B (base) | 8,03 B | 128k | Preentrenamiento a gran escala | Llama 3.1 Community License | HuggingFace, ampliamente usado |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128k | Preentrenamiento + SFT + RLHF | Llama 3.1 Community License | HuggingFace, muy extendido |
| Mistral 7B Instruct (v0.3) | 7,2 B | 32k | Preentrenamiento + SFT | Apache 2.0 | HuggingFace |
| Qwen2.5 7B Instruct | 7,6 B | 128k (32k nativo,扩展) | Preentrenamiento + SFT + RL | Apache 2.0 (la mayoría de variantes) | HuggingFace |

Rendimiento comparado: no disponible. No existen métricas publicadas de este ajuste fino, por lo que cualquier comparación cuantitativa con las alternativas sería especulativa. En la práctica, para tareas de atención al cliente en inglés, `Llama-3.1-8B-Instruct` o `Qwen2.5-7B-Instruct` son opciones mucho más contrastadas.

## Limitaciones y advertencias

- Entrenamiento extremadamente corto: 60 pasos máximos con batch 1 y acumulación 4. Es esperable un ajuste superficial del estilo y no una adaptación real al dominio; la calidad no está demostrada.
- Ausencia total de evaluación: no hay métricas, ni conjunto de test separado, ni comparación con el modelo base. No se puede afirmar que el fine-tuning mejore al base.
- Ambigüedad sobre el contenido del repositorio: la model card afirma que el repo "pretende contener" el modelo y advierte de que no está confirmado si hay pesos completos, solo adaptadores LoRA o un GGUF. Verificar los archivos antes de usarlo.
- Riesgo de alucinación alto: el modelo puede inventar políticas de empresa, plazos, condiciones de reembolso o datos de producto, y presentarlos con seguridad. No debe usarse como fuente autoritativa de política interna.
- Idioma: solo inglés. El ajuste no cubre castellano, por lo que su uso en mercados hispanohablantes no está soportado ni evaluado.
- Licencia: la etiqueta `apache-2.0` es cuestionable, ya que el modelo base Llama 3.1 se distribuye bajo la Llama Community License, con restricciones de uso (incluida la cláusula de 700 millones de usuarios mensuales) y obligaciones de atribución. Revisar los términos del base antes de cualquier uso comercial o redistribución.
- Dataset de procedencia no verificada: `Lakshan2003/Llama3.1-8b-instruct-customerservice-evaldata` no tiene procedencia, licencia ni idoneidad comercial confirmadas en la model card. Riesgo legal si se despliega comercialmente sin auditar los datos.
- Privacidad: no debe introducirse información personal de clientes sin controles de privacidad y seguridad adecuados en el despliegue.
- Sesgos: no documentados ni evaluados; hereda los sesgos del modelo base y los del dataset de soporte, que no ha sido auditado.
- No apto para decisiones vinculantes: reembolsos, accesos a cuenta, cuestiones legales o cualquier decisión sensible requieren supervisión humana cualificada.
- Sin soporte nativo de tool calling ni de agentes: no esperar integración directa con APIs o flujos multi-paso sin ingeniería adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/3adel25/Llama-3.1-8B-Customer-service-question-and-answer
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Modelo base usado en el notebook (Unsloth): https://huggingface.co/unsloth/Meta-Llama-3.1-8B
- Dataset de entrenamiento: https://huggingface.co/datasets/Lakshan2003/Llama3.1-8b-instruct-customerservice-evaldata
- Unsloth (herramienta de fine-tuning): https://github.com/unslothai/unsloth
- TRL / SFTTrainer: https://github.com/huggingface/trl
- PEFT: https://github.com/huggingface/peft
- Licencia Llama 3.1: https://llama.meta.com/llama3_1/license/
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; las búsquedas devolvieron únicamente noticias de prensa sin relación con el repositorio.

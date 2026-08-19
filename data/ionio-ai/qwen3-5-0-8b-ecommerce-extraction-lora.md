# Ionio-ai/Qwen3.5-0.8B-Ecommerce-Extraction-LoRA

## Resumen

Ionio-ai/Qwen3.5-0.8B-Ecommerce-Extraction-LoRA es un adaptador PEFT (LoRA) desarrollado por Ionio-ai sobre el modelo base Qwen/Qwen3.5-0.8B, especializado en la extracción de filtros estructurados a partir de consultas de búsqueda de comercio electrónico. El adaptador transforma una consulta en lenguaje natural (p. ej. «men's Nike running shoes in red under $100») en un objeto JSON que cumple estrictamente un esquema JSON proporcionado en el prompt, indicando campos como tipo de producto, marca, color o precio máximo. Está diseñado para integrarse en pipelines de búsqueda y filtrado de catálogos, donde la salida debe ser válida, sin explicaciones ni formato adicional.

El modelo se entrenó mediante fine-tuning supervisado (SFT) con TRL `SFTTrainer` sobre el dataset propio `Ionio-ai/ecommerce-search-extraction`, con 9.341 ejemplos de entrenamiento y 549 de validación. El adaptador añade 21.645.312 parámetros entrenables al modelo base de 0.8B parámetros, que emplea una arquitectura híbrida de atención lineal y transformadores (según la familia Qwen3.5). El entrenamiento se realizó en BF16 con LoRA de rango 32 y alpha 64, en una sola GPU NVIDIA RTX PRO 6000 Blackwell en 29,5 minutos. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia de este adaptador radica en su enfoque específico para extracción de información con salida JSON validada por esquema, una tarea común en sistemas de búsqueda de e-commerce. Al ser un adaptador ligero, puede desplegarse sobre el modelo base sin necesidad de reentrenar, y su evaluación en un conjunto de prueba retenido de 1.095 ejemplos muestra una alta precisión en validez de esquema (99,73 %) y en F1 de hojas (88,52 %), aunque el emparejamiento exacto es bajo (30,32 %), lo que sugiere sensibilidad a la ortografía y capitalización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3.5-0.8B (híbrida: atención lineal + transformadores) |
| Parametros totales | Adaptador: 21.645.312 entrenables; modelo base: 0,8B (no incluido en el repo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (máximo de secuencia en entrenamiento) |
| Tipos de cuantizacion | No disponible (entrenado en BF16; el adaptador se usa en precisión del modelo base) |
| Idiomas soportados | Inglés (entrenado solo en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen3.5-0.8B, un modelo de la familia Qwen3.5 de Alibaba Cloud que combina atención lineal con bloques transformadores tradicionales, optimizado para despliegue en edge. El adaptador LoRA (rango 32, alpha 64, dropout 0.05) se aplica a las proyecciones de atención (QKV), MLP y a las proyecciones GDN específicas de Qwen3.5 (`in_proj_qkv`, `in_proj_z`, `in_proj_b`, `in_proj_a`, `out_proj`). El entrenamiento usó TRL `SFTTrainer` 0.29.1 con pérdida solo en las respuestas del asistente, 2 épocas, programación coseno con pico de learning rate 2e-04, tamaño de lote efectivo 128, secuencias de hasta 2048 tokens, y técnicas de optimización como gradient checkpointing y kernel Liger. El dataset de entrenamiento contiene 9.341 ejemplos y el de validación 549, todos en inglés, con anotaciones de filtros de e-commerce. No se empleó RLHF ni DPO; es un ajuste supervisado clásico.

## Capacidades

- Extracción de filtros estructurados de consultas de e-commerce en inglés, devolviendo JSON válido según un esquema JSON proporcionado en el prompt.
- Cumplimiento estricto del esquema: incluye todas las claves requeridas, preserva el anidamiento, no añade claves extra y mantiene los arrays como arrays.
- Uso de `null` para campos escalares requeridos cuyo valor no está presente en la consulta, en lugar de omitirlos o usar texto.
- Salida sin formato adicional: sin markdown, sin comentarios, solo el objeto JSON.
- Soporte de esquemas arbitrarios definidos por el usuario (el esquema se pasa en el mensaje de usuario).
- Generación determinista en inferencia (temperatura 0, `top_p=1`) para resultados reproducibles.
- No incluye capacidades de razonamiento explícito (modo thinking desactivado en evaluación), ni visión, audio o multimodalidad (el adaptador es solo de texto).

## Casos de uso

- Filtrado de catálogo en buscadores de e-commerce: dado un query como «wireless headphones under $50», el modelo extrae `product_type`, `price_max`, etc., para construir una consulta de filtrado en una base de productos.
- Enriquecimiento de búsqueda por voz o chat: integrar el adaptador en un asistente conversacional que recibe consultas habladas o escritas y las convierte en filtros estructurados para mostrar resultados precisos.
- Normalización de consultas para motores de recomendación: convertir queries libres en atributos tipados (marca, color, talla, rango de precio) que alimentan sistemas de ranking y personalización.
- Automatización de comparadores de precios: extraer atributos de consultas de usuarios para buscar en múltiples tiendas y mostrar ofertas relevantes.
- Generación de consultas para APIs de búsqueda interna: en plataformas B2B o marketplaces, el JSON extraído se envía directamente a un endpoint de búsqueda que espera parámetros estructurados.
- Pruebas de calidad de extracción en pipelines de datos: el adaptador puede usarse para validar y corregir etiquetas de productos generadas automáticamente, comparando la salida con esquemas predefinidos.

## Benchmarks y rendimiento

La evaluación se realizó sobre un conjunto de prueba retenido de 1.095 ejemplos, con inferencia greedy usando vLLM (tras fusionar los pesos del adaptador, ya que vLLM 0.27.1 no aplicaba correctamente las proyecciones GDN en modo LoRA dinámico). Los resultados son los siguientes:

| Metrica | Resultado |
|---|---|
| Strict JSON | 99,91 % |
| Schema valid | 99,73 % |
| Exact match | 30,32 % |
| Case-insensitive exact | 34,61 % |
| Leaf precision | 88,59 % |
| Leaf recall | 88,50 % |
| Leaf F1 | 88,52 % |
| Key F1 | 99,48 % |
| Aligned type accuracy | 99,91 % |
| Null accuracy | 99,82 % |
| Truncated outputs | 1 / 1.095 |

No se han publicado comparativas con otros modelos en la información disponible.

## Requisitos de hardware

- Inferencia con el adaptador sobre Qwen3.5-0.8B en BF16: aproximadamente 1,6 GB de VRAM para el modelo base más el adaptador (muy ligero), por lo que cabe en GPUs consumer con 4 GB o más (p. ej. RTX 3060, RTX 4060, RTX 4090).
- El entrenamiento se realizó en una NVIDIA RTX PRO 6000 Blackwell Workstation Edition (29,5 minutos para 2 épocas), pero para inferencia no se requiere ese nivel de hardware.
- Opciones de despliegue: Transformers + PEFT (carga directa del adaptador), o fusión de pesos para usar con vLLM u otros motores que no soporten LoRA dinámico con proyecciones GDN.
- No se dispone de datos de latencia o throughput específicos para este adaptador; al ser un modelo de 0,8B, se espera una latencia baja en GPU consumer y CPU (aunque no se ha probado en CPU).

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA comparables específicamente entrenados para extracción de filtros de e-commerce sobre Qwen3.5-0.8B. Como referencia, el modelo base Qwen3.5-0.8B (sin adaptar) no tiene capacidad de salida JSON estructurada según esquema, por lo que la comparación directa no es posible. Se recomienda evaluar el adaptador frente a otros modelos de extracción de información (p. ej. GPT-4o mini, Llama 3.1 8B con prompts de JSON schema) en el mismo dataset, pero esos datos no están publicados.

## Limitaciones y advertencias

- El rendimiento está medido solo sobre el conjunto de prueba del dataset fuente (`Ionio-ai/ecommerce-search-extraction`); otros dominios, idiomas o esquemas pueden degradar significativamente la precisión.
- La salida es sensible a la ortografía y capitalización exactas de las claves JSON; cualquier variación en el esquema o en el prompt puede producir errores.
- El modelo puede alucinar valores si la consulta no es clara o si el esquema permite tipos ambiguos; se recomienda validar siempre el JSON contra el esquema antes de usarlo.
- No se ha evaluado en otros idiomas; el entrenamiento es exclusivamente en inglés.
- El adaptador no contiene los pesos del modelo base; es obligatorio cargarlo sobre Qwen/Qwen3.5-0.8B.
- Los atributos extraídos son inferencias del texto de la consulta, no hechos verificados sobre productos reales; no deben tratarse como datos fiables sin confirmación.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B también está bajo Apache 2.0, por lo que no hay restricciones adicionales conocidas.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/Ionio-ai/Qwen3.5-0.8B-Ecommerce-Extraction-LoRA
- Dataset de entrenamiento: https://huggingface.co/datasets/Ionio-ai/ecommerce-search-extraction
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Referencia del modelo base en Qualcomm AI Hub: https://aihub.qualcomm.com/mobile/models/qwen3_5_0_8b
- Página de Qwen3.5 en Ollama: https://ollama.com/library/qwen3.5:0.8b

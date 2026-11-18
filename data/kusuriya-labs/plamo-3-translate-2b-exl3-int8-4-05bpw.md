# kusuriya-labs/PLaMo-3-Translate-2B-EXL3-INT8-4.05bpw

## Resumen

PLaMo-3-Translate-2B-EXL3-INT8-4.05bpw es una versión cuantizada del modelo de traducción `pfnet/plamo-3-translate-2b` de Preferred Networks, publicada por el usuario kusuriya-labs. La cuantización se ha realizado con el cuantizador EXL3 en su variante para ROCm (`rocm_exl3_forme`, derivada de exllamav3), aplicando un esquema EXL3-INT8 con rejilla INT8 fija y formato mul24 que deja el decoder en 4,05 bits por peso (4,047 medidos) mientras mantiene `lm_head` en 8 bits y deja embeddings y RMSNorm en BF16 sin cuantizar.

El modelo base es un transformer de 2B parámetros (el checkpoint cuantizado conserva 1.003.421.696 parámetros reales en safetensors) especializado en traducción, con un tokenizer y una plantilla de traducción propios que deben gestionarse con la implementación original de Transformers (`tokenization_plamo.py`, `modeling_plamo.py`). La relevancia de esta ficha es doble: por un lado documenta una cuantización de bajo peso orientada a hardware AMD RDNA mediante el motor `shelf`; por otro, advierte de que no es un modelo cargable directamente en Transformers ni en llama.cpp, y de que el autor no ha publicado evaluación de calidad de traducción frente al modelo original.

La licencia es la PLaMo Community License Agreement, que impone condiciones (por ejemplo, umbrales de facturación anual superiores a 1.000 millones de yenes) y debe revisarse antes de cualquier uso comercial. El repositorio ocupa 2,0 GB y no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base `pfnet/plamo-3-translate-2b`); pesos cuantizados con EXL3-INT8 en formato mul24 |
| Parametros totales | 1.003.421.696 (safetensors del checkpoint cuantizado); el nombre comercial indica 2B |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens (límite impuesto por esta implementación de inferencia) |
| Tipos de cuantizacion | EXL3-INT8, 4,05 bits por peso en el decoder (4,047 medidos); `lm_head` a 8 bits; embeddings y RMSNorm en BF16 |
| Idiomas soportados | no disponible (modelo orientado a traducción; la calibración usó pares en-ja) |
| Licencia | PLaMo Community License Agreement (`plamo-community-license`) |
| Formato de pesos | safetensors con configuración EXL3 (`recipe-4.05bpw.json`, `quantization_config.json`); requiere motor compatible con mul24 |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia PLaMo 3 orientado a traducción, con tokenizer propio (`tokenization_plamo.py`) y una plantilla de traducción específica definida en `modeling_plamo.py`. Esta publicación no entrena el modelo: parte de la revisión `cf66d22fbe6202c56b8e5d283691aa1da53d05af` de `pfnet/plamo-3-translate-2b` y aplica cuantización post-entrenamiento con el cuantizador EXL3 1.5.0 en su variante ROCm.

La innovación técnica está en el esquema de cuantización: EXL3-INT8 con codificación trellis y rejilla INT8 fija en formato mul24, que se expande con multiplicadores distintos al formato mul1 habitual y, por tanto, exige un orden de tiles y un motor de inferencia específicos (por ejemplo, `shelf` para AMD RDNA). El decoder queda en 4,05 bpw, `lm_head` en 8 bits y las capas sensibles (embeddings, RMSNorm) se mantienen en BF16. La calibración se hizo con `sentence-transformers/parallel-sentences-tatoeba` (en-ja), 128 filas por 1024 columnas. No se documentan en esta ficha los datos de entrenamiento originales del modelo base (número de tokens, composición del corpus, RLHF/DPO), por lo que se consideran no disponibles.

## Capacidades

- Traducción automática de texto, tarea declarada en el pipeline (`translation`) del modelo base.
- Generación de texto condicionada por la plantilla de traducción propia del modelo.
- Gestión de pares de idiomas mediante el tokenizer original; la calibración documentada se centró en inglés-japonés.
- Inferencia con pesos de 4,05 bpw sobre hardware AMD RDNA mediante motores compatibles con EXL3 mul24.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking en la información disponible.
- Capacidades multilingües: no disponibles más allá de la orientación a traducción del modelo base.

## Casos de uso

- Traducción por lotes en entornos con GPU AMD RDNA: el formato EXL3 mul24 y el motor `shelf` permiten ejecutar el modelo con un consumo de pesos de 4,05 bpw, adecuado para pipelines de traducción de documentos donde el hardware disponible es ROCm.
- Traducción en-ja de documentación técnica: la calibración con Tatoeba en-ja sugiere un uso razonable en este par, siempre que se valide la calidad con un conjunto propio antes de producción.
- Preprocesado multilingüe de corpus: integración en pipelines de ingesta que normalizan textos a un idioma común antes de indexarlos o analizarlos.
- Servicio de traducción de baja latencia en local: con un checkpoint de unos 2 GB y contexto de 2048 tokens, encaja en despliegues de una sola GPU sin depender de APIs externas.
- Prototipado de sistemas de traducción especializados: al ser un derivado cuantizado, permite comparar el comportamiento frente al modelo original en el mismo hardware antes de decidir qué versión desplegar.
- Traducción de interfaces y contenido de producto: el límite de 2048 tokens obliga a segmentar entradas, lo que resulta manejable para cadenas cortas, descripciones y mensajes de UI.
- Evaluación interna de cuantizaciones EXL3: sirve como caso de estudio para medir la degradación de un modelo de traducción al pasar a 4,05 bpw, dado que el autor no publica esa comparación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que la calidad de traducción no se ha evaluado en el momento de publicación de la model card y que la diferencia respecto al modelo original está sin medir.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 2,0 GB; con overhead de runtime y caché KV para 2048 tokens, se puede operar en GPUs con 4-6 GB de VRAM, aunque no se dispone de cifras oficiales.
- GPU recomendadas: hardware AMD RDNA compatible con el motor `shelf` y con EXL3 mul24; no se documentan GPU NVIDIA validadas para este formato concreto.
- GPU de consumo: por tamaño, cabría en tarjetas de gama media con 6-8 GB, pero la compatibilidad depende del soporte de EXL3 mul24 en el motor de inferencia, no solo de la VRAM.
- Opciones de despliegue: motor `shelf` (AMD RDNA) para EXL3 mul24; Transformers no puede cargar los pesos directamente, aunque el tokenizer y la plantilla de traducción del modelo original se usan para preparar los IDs de entrada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PLaMo-3-Translate-2B-EXL3-INT8-4.05bpw | 1.003.421.696 (checkpoint cuantizado) | 2048 tokens (límite de esta implementación) | EXL3-INT8, 4,05 bpw | PLaMo Community License | Hugging Face, requiere motor EXL3 mul24 |
| pfnet/plamo-3-translate-2b (original) | 2B (según denominación) | no disponible | BF16 (presumiblemente) | PLaMo Community License | Hugging Face, cargable en Transformers |
| Otros modelos de traducción de ~2B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación con alternativas de la misma categoría no está disponible en la información proporcionada; solo se puede contrastar con el modelo base, del que se conocen la licencia y el formato, pero no sus métricas de calidad ni su contexto.

## Limitaciones y advertencias

- No es cargable en Transformers de forma directa: requiere un motor que soporte EXL3 mul24 (por ejemplo, `shelf` en AMD RDNA); el orden de tiles y los multiplicadores difieren del formato mul1.
- Calidad de traducción sin evaluar: el autor no publica comparación con el modelo original, por lo que la degradación por cuantización es desconocida.
- Contexto limitado a 2048 tokens en esta implementación, lo que obliga a segmentar documentos largos.
- Idiomas soportados no documentados; la calibración se hizo solo con pares inglés-japonés, lo que no garantiza un comportamiento equivalente en otros pares.
- Licencia restrictiva: la PLaMo Community License Agreement incluye condiciones como umbrales de facturación anual (más de 1.000 millones de yenes) y debe revisarse en `LICENSE/en` y `LICENSE/ja` antes de uso comercial.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un derivado cuantizado, hereda los del modelo base sin que se hayan medido.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- Dependencia de un ecosistema concreto (ROCm, EXL3, `shelf`): reduce la portabilidad frente a formatos como GGUF o safetensors estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kusuriya-labs/PLaMo-3-Translate-2B-EXL3-INT8-4.05bpw
- Modelo base: https://huggingface.co/pfnet/plamo-3-translate-2b
- Cuantizador ROCm EXL3: https://github.com/jyohukuchan/rocm_exl3_forme
- Motor de inferencia `shelf`: https://github.com/kusuriya-labs/shelf
- Licencia PLaMo Community (inglés): https://plamo.preferredai.jp/info/plamo-community-license-en
- Dataset de calibración: https://huggingface.co/sentence-transformers/parallel-sentences-tatoeba

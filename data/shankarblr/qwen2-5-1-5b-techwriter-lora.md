# Shankarblr/Qwen2.5-1.5B-TechWriter-LoRA

## Resumen

El modelo presentado es un adaptador LoRA (PEFT) llamado Qwen2.5-1.5B-TechWriter-LoRA, desarrollado por Shankarblr. No es un modelo autónomo, sino un ajuste fino de bajo rango sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct mediante QLoRA. Su objetivo es especializar el modelo en la redacción técnica aplicada a semiconductores e interconexión de centros de datos. El adaptador se entrena con un conjunto de datos privado de 6 765 muestras en formato ChatML, con 3 épocas y 1 143 pasos, alcanzando una pérdida de validación de 0,1404 y una precisión media por token de 0,9488 en la tercera época. La relevancia de este modelo radica en que, al ser un adaptador pequeño (0,1 GB), se puede integrar sobre el modelo base congelado en 4 bits, lo que permite disponer de un asistente especializado en documentación técnica sin necesidad de reentrenar el modelo completo. Para inferencia directa, el autor recomienda el repositorio fusionado Shankarblr/Qwen2.5-1.5B-TechWriter-Instruct.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5-1.5B-Instruct) + adaptador LoRA (PEFT) |
| Parametros totales | No disponible (base ~1,54B + adaptador LoRA con r=16, alpha=32, sin número documentado) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32 768 tokens (heredado del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | NF4 (4-bit) con doble cuantización para el base mediante QLoRA; el adaptador se carga en float16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adapter_model.safetensors) + adapter_config.json, más tokenizer del base |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen/Qwen2.5-1.5B-Instruct, un transformer decoder-only con aproximadamente 1 500 millones de parámetros y una ventana de contexto de 32 768 tokens. El adaptador LoRA se añade sobre las proyecciones q, k, v, o, gate, up y down del modelo base, con rango 16 y alpha 32. El entrenamiento se realiza con QLoRA, congelando el base en 4 bits con cuantización NF4 y doble cuantización, y computando en float16. El conjunto de datos es un mix privado de redacción técnica sobre semiconductores e interconexión de centros de datos, en formato ChatML, con 6 765 filas divididas 90/10 para entrenamiento y validación. El entrenamiento dura 3 épocas (1 143 pasos) durante aproximadamente 1 hora y 30 minutos. En la tercera época, la pérdida de validación es 0,1404 y la precisión media por token es 0,9488. No se detalla ninguna innovación técnica adicional, ya que se trata de un ajuste fino de instrucciones con técnicas estándar de PEFT/QLoRA.

## Capacidades

- Generación de texto técnico en inglés especializado en semiconductores y centros de datos.
- Comprensión y seguimiento de instrucciones en formato ChatML.
- Redacción de descripciones de productos, especificaciones y documentación técnica.
- Ajuste fino sobre un dominio concreto (technical writing) mediante el adaptador.
- No se documenta soporte de tool calling, agentes, visión o audio en el adaptador; el modelo base Qwen2.5-1.5B-Instruct puede ofrecer función de tool calling, pero no se ha verificado con este adaptador.
- Capacidades multilingües limitadas al inglés, según la configuración del modelo base.

## Casos de uso

- Documentación técnica de semiconductores: el adaptador genera descripciones precisas de procesos de fabricación, materiales y características de dispositivos, aprovechando el ajuste en datos privados del sector.
- Redacción de datasheets y hojas de especificaciones: puede producir secciones completas de especificaciones eléctricas y mecánicas en formato técnico, coherente con el estilo del sector.
- Descripción de interconexiones de centros de datos: genera texto para explicar protocolos de interconexión, topologías de red y requisitos de latencia o ancho de banda.
- Manuales de usuario y guías de instalación: al estar entrenado en redacción técnica, puede redactar instrucciones paso a paso para equipos de hardware o infraestructura de centros de datos.
- Auditoría y revisión de documentación: se puede utilizar como asistente para parafrasear o reformular pasajes técnicos complejos y mejorar la claridad sin perder precisión.
- Generación de contenidos técnicos para marketing: produce descripciones de producto orientadas a clientes técnicos, explicando arquitecturas y ventajas de forma rigurosa.
- Investigación y reanudación de entrenamiento: al ser un adaptador PEFT, permite continuar el entrenamiento sobre el base congelado en 4 bits o fusionarlo para obtener un modelo independiente.
- Asistente interno en empresas de semiconductores: se puede integrar en flujos de documentación para elaborar notas de aplicación, white papers o artículos técnicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este modelo en la información disponible. El autor únicamente reporta métricas de evaluación sobre el conjunto de datos de validación privado. Estos valores no son comparables con benchmarks públicos y tampoco permiten evaluar el rendimiento general del modelo.

| Metrica | Valor |
|---|---|
| Pérdida de validación (época 3) | 0,1404 |
| Precisión media por token (época 3) | 0,9488 |
| Pasos de entrenamiento | 1 143 |
| Duración del entrenamiento | 1 h 30 min |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. De forma orientativa, un modelo base de 1,5B cuantizado en 4-bit y el adaptador LoRA pueden requerir alrededor de 2-3 GB de VRAM, pero no es un dato confirmado.
- GPU recomendadas: no disponibles específicamente; el modelo puede ejecutarse en cualquier GPU moderna con al menos 4-8 GB de VRAM, como RTX 3060, RTX 4070, RTX 4090, A100 o H100.
- Compatibilidad con GPU de consumo: sí, el modelo base de 1,5B en 4-bit más el adaptador cabe en tarjetas de gama media con 8 GB de VRAM.
- Opciones de despliegue: Transformers + PEFT (cargando el adaptador sobre el base), vLLM (si se fusiona el modelo), llama.cpp (si se convierte a formato GGUF tras la fusión) y Ollama (compatible con modelo fusionado y cuantizado).
- Latencia y throughput estimados: no disponibles; no se ha publicado ninguna medición de rendimiento de inferencia.

## Comparativa con modelos similares

No se han identificado otros adaptadores LoRA comparables para redacción técnica de semiconductores en la información disponible, por lo que esta comparativa se limita al base y al modelo fusionado del mismo autor.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-1.5B-TechWriter-LoRA | 1,5B (base) + adaptador no especificado | 32 768 tokens | Validación: loss 0,1404, accuracy 0,9488 (conjunto privado) | Apache 2.0 | Hugging Face (adaptador) |
| Qwen2.5-1.5B-TechWriter-Instruct (fusionado) | 1,5B | 32 768 tokens | Mismas métricas del entrenamiento | Apache 2.0 | Hugging Face (modelo fusionado) |
| Qwen/Qwen2.5-1.5B-Instruct (base) | 1,5B | 32 768 tokens | Sin métricas publicadas del adaptador | Apache 2.0 | Hugging Face (modelo original) |

## Limitaciones y advertencias

- No es un modelo standalone: debe cargarse sobre Qwen/Qwen2.5-1.5B-Instruct con la biblioteca PEFT; no puede utilizarse directamente con pipeline estándar sin el base.
- Los datos de entrenamiento son privados y no verificables, lo que limita la reproducibilidad y la transparencia.
- El modelo está especializado en inglés y en redacción técnica de semiconductores; su rendimiento en otros dominios o idiomas puede ser deficiente.
- Al tratarse de un modelo pequeño (1,5B), tiene mayor riesgo de alucinación y menor capacidad de razonamiento que modelos más grandes.
- No está afiliado oficialmente a ningún fabricante de semiconductores; es un modelo no oficial de estilo, por lo que no debe usarse como fuente de información factual sin verificación.
- La precisión por token (0,9488) se refiere al conjunto de validación privado y no garantiza exactitud factual ni calidad de generación en producción.
- No se han publicado pruebas de soporte de function calling, agentes o visión con este adaptador concreto; cualquier uso en esos escenarios debe validarse previamente.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el adaptador deben cumplir la misma licencia; no hay restricciones adicionales conocidas.

## Enlaces

- Adaptador LoRA en Hugging Face: https://huggingface.co/Shankarblr/Qwen2.5-1.5B-TechWriter-LoRA
- Modelo fusionado recomendado para inferencia: https://huggingface.co/Shankarblr/Qwen2.5-1.5B-TechWriter-Instruct
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct

# Shaq2/distill-student-intent

## Resumen

`distill-student-intent` es un adaptador LoRA de tipo PEFT desarrollado por el usuario Shaq2, diseñado para clasificación de intenciones en el dominio bancario sobre el conjunto de datos Banking77 (77 etiquetas). Se construye sobre el modelo base `Qwen/Qwen3.5-0.8B-Base` (Apache-2.0) y se distribuye como adaptador independiente, no como modelo completo. El adaptador ocupa apenas 6.389.760 parámetros (aproximadamente 6,4 millones) y el repositorio completo pesa 0,1 GB, lo que lo convierte en una pieza ligera pensada para servirse junto a un GGUF base compartido mediante la funcionalidad multi-LoRA de llama.cpp.

El propósito declarado es sustituir a un modelo propietario de referencia (gpt-5-nano) en una pasarela de enrutamiento de intenciones ("Distill gateway"), reduciendo el coste por petición de forma drástica. Según la model card, el estudiante alcanza un 83,5% de accuracy y un macro-F1 de 0,802 sobre la partición TEST oficial de Banking77 (200 filas, sin solapamiento con entrenamiento), frente al 73,5% y 0,686 del modelo incumbent. El coste estimado por cada 1.000 peticiones se sitúa en 0,014–0,024 USD frente a 0,11–0,28 USD del incumbent.

La relevancia del modelo es doble: por un lado, demuestra un caso práctico de destilación de etiquetas generadas por un profesor grande (`cerebras:gpt-oss-120b`) hacia un estudiante pequeño; por otro, ejemplifica el patrón de despliegue de múltiples adaptadores LoRA sobre una única base cuantizada en llama.cpp, optimizando memoria y coste en producción. No se dispone de información sobre longitud de contexto, idiomas soportados ni datos de benchmarks adicionales más allá de la evaluación específica de Banking77.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.5-0.8B-Base |
| Parametros totales | 6.389.760 (adaptador); modelo base no disponible en la informacion |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF del adaptador (adapter.gguf); cuantizaciones del base no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (adaptador); datos de entrenamiento CC-BY-4.0 |
| Formato de pesos | safetensors (adapter_model.safetensors), GGUF (adapter.gguf), PEFT (adapter_config.json) |

## Arquitectura y entrenamiento

El adaptador es un LoRA con rango r=16 y alpha=32, aplicado sobre las proyecciones q, k, v, o, gate, up y down del transformer base Qwen3.5-0.8B-Base. Se entrenó en Kaggle (script `kaggle/train.py`) y se convirtió a GGUF mediante `convert_lora_to_gguf.py` para su uso con llama.cpp. El repositorio incluye además `tokenizer.json`, `tokenizer_config.json` y `chat_template.jinja`, lo que permite el renderizado de plantillas de chat sin depender del base.

Los datos de entrenamiento provienen del dataset `Shaq2/distill-intent-routing` (licencia CC-BY-4.0), con etiquetas generadas por el profesor `cerebras:gpt-oss-120b`. La evaluación se realizó sobre la partición TEST oficial de Banking77 (200 filas), con solapamiento cero con entrenamiento verificado. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación técnica principal es el patrón de destilación de etiquetas desde un profesor grande hacia un adaptador pequeño servido en multi-LoRA sobre una base compartida.

## Capacidades

- Clasificación de intenciones bancarias en 77 categorías (Banking77).
- Generación de texto conversacional heredada del base Qwen3.5-0.8B-Base.
- Servicio multi-LoRA en llama.cpp con selección de adaptador por petición mediante `{"lora":[{"id":<idx>,"scale":1.0}]}`.
- Control de modo pensamiento mediante `chat_template_kwargs.enable_thinking` (desactivado por defecto en el ejemplo de serving).
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni multilingüismo específicas del adaptador.
- No se documenta modo thinking propio más allá del flag del chat template del base.

## Casos de uso

- Enrutamiento de intenciones bancarias en producción: el adaptador clasifica consultas de clientes en una de las 77 categorías de Banking77 con 83,5% de accuracy, adecuado para dirigir tickets al departamento correcto en un contact center.
- Sustitución de modelos propietarios en pasarelas de clasificación: con un coste estimado de 0,014–0,024 USD por 1.000 peticiones frente a 0,11–0,28 USD del incumbent, es viable a gran escala en pipelines de alto volumen.
- Despliegue multi-tenant sobre base compartida: al servirse como LoRA sobre un único GGUF base en llama.cpp, permite alojar varios adaptadores especializados (por dominio o idioma) con una sola copia del modelo base en memoria.
- Clasificación en entornos con recursos limitados: el adaptador pesa ~0,1 GB y se combina con un base de 0,8B, por lo que puede ejecutarse en CPUs o GPUs de consumo sin infraestructura dedicada.
- Etiquetado y pre-anotación de datasets: útil para generar etiquetas preliminares de intención que luego se revisan manualmente, reduciendo el coste de anotación.
- Enrutamiento en asistentes conversacionales: integrado en un chatbot bancario, permite decidir la siguiente acción (consultar saldo, bloquear tarjeta, etc.) a partir de la intención detectada.
- Experimentación con destilación: sirve como referencia reproducible para equipos que quieran replicar el patrón profesor grande (`gpt-oss-120b`) → estudiante LoRA pequeño sobre un dominio concreto.

## Benchmarks y rendimiento

Evaluación sobre la partición TEST oficial de Banking77 (200 filas, solapamiento cero con entrenamiento):

| Metrica | Student (este adaptador) | Incumbent (gpt-5-nano) |
|---|---|---|
| Accuracy | 83,5% | 73,5% |
| Macro-F1 | 0,802 | 0,686 |
| Coste por 1.000 peticiones (USD) | ~0,014–0,024 | 0,11–0,28 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el adaptador pesa ~0,1 GB y el base es de 0,8B, por lo que en cuantización de 4 bits el conjunto cabría en GPUs de consumo con 4–8 GB de VRAM (estimación orientativa, no confirmada en la información).
- GPU recomendadas: no disponible en la información; por tamaño del base, cabría en RTX 3060/4060/4090 y GPUs de datacenter como A100 o H100 sin necesidad de ellas.
- Cabe en GPU de consumo: sí, previsiblemente, dado el tamaño del base (0,8B) y del adaptador.
- Opciones de despliegue: llama.cpp con multi-LoRA (`adapter.gguf`), PEFT sobre transformers para el adaptador en safetensors. No se documentan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles en la información.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento Banking77 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| distill-student-intent (este) | 6,4M (adaptador) + base 0,8B | no disponible | acc 83,5% / macro-F1 0,802 | Apache-2.0 | Hugging Face, GGUF |
| gpt-5-nano (incumbent) | no disponible | no disponible | acc 73,5% / macro-F1 0,686 | propietaria | API |
| Otros adaptadores LoRA para Banking77 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autónomo: requiere cargar el base `Qwen/Qwen3.5-0.8B-Base` para funcionar.
- Dominio restringido: entrenado exclusivamente para clasificación de intenciones bancarias (77 etiquetas de Banking77); su rendimiento fuera de ese dominio no está documentado.
- Evaluación limitada: los resultados provienen de una única partición de 200 filas; no hay validación cruzada ni otros conjuntos reportados.
- Riesgo de alucinación: al heredar el comportamiento generativo del base, puede producir texto no verificado si se usa fuera de la tarea de clasificación.
- Idiomas: no se documenta qué idiomas soporta; Banking77 está mayoritariamente en inglés.
- Licencia: el adaptador es Apache-2.0, pero los datos de entrenamiento son CC-BY-4.0 y las etiquetas provienen de un profesor propietario (`cerebras:gpt-oss-120b`); conviene revisar la procedencia antes de uso comercial a gran escala.
- Sin datos de sesgos, robustez ante entradas adversarias ni comportamiento en producción más allá del benchmark reportado.
- El flag `enable_thinking:false` en el ejemplo de serving sugiere que el base puede activar modo pensamiento; su impacto en latencia y precisión de clasificación no está cuantificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shaq2/distill-student-intent
- Dataset de entrenamiento: https://huggingface.co/datasets/Shaq2/distill-intent-routing
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Script de conversión a GGUF: `convert_lora_to_gguf.py` (llama.cpp)
- Script de serving: `modal/distill_serve.py` (referenciado en la model card)
- Script de entrenamiento: `kaggle/train.py` (referenciado en la model card)
- Procedencia de datos: `data/SOURCES.md` (referenciado en la model card)

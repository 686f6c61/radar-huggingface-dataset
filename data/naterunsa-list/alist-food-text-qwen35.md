# NateRunsA-LIST/alist-food-text-qwen35

## Resumen

El modelo **NateRunsA-LIST/alist-food-text-qwen35** es un adaptador LoRA de extracción de nutrición a partir de texto de diarios de comida, diseñado para su ejecución en dispositivos (on-device) dentro de la app iOS A-LIST (modo Locomo). El adaptador se basa en el modelo Qwen/Qwen3.5-2B y se distribuye en formato GGUF, tanto el modelo base cuantizado como el propio LoRA en f16. Su propósito es convertir una entrada textual libre (por ejemplo, "almuerzo: ensalada de pollo con aceite de oliva") en un JSON estructurado con macronutrientes, micronutrientes, índice glucémico y otros campos nutricionales.

El adaptador fue entrenado mediante QLoRA con un dataset privado de 66.5k filas (food-text-unified:v1) y tres épocas de fine-tuning supervisado. Según la model card, el modelo alcanza una métrica de precisión de 0.761 en calorías (sobre 1500 ejemplos de evaluación) y no produce fallos de parsing en el conjunto de evaluación. Es relevante porque ofrece una solución ligera y eficiente para extracción nutricional en tiempo real en hardware limitado, con una licencia Apache-2.0 que permite uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Base Qwen3.5-2B (no se detalla en la model card; la documentación de vLLM describe Qwen3.5 como MoE con gated delta networks, aunque el tamaño 2B podría ser denso) |
| Parámetros totales | 43.646.976 (adaptador LoRA) sobre base de 2B (no cuantificado) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q4_K_M (modelo base) y f16 (adaptador LoRA) |
| Idiomas soportados | No disponibles (el dataset parece estar en inglés, pero no se especifica) |
| Licencia | Apache-2.0 (tanto base como adaptador) |
| Formato de pesos | GGUF (base y LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (rank=64, alpha=64) aplicado al modelo base Qwen3.5-2B. El entrenamiento se realizó con QLoRA (QLoRA) sobre un dataset de 66.500 filas de texto de diarios de comida (food-text-unified:v1), con 3 épocas de fine-tuning supervisado (SFT). El adaptador se convirtió a formato GGUF mediante la herramienta `convert_lora_to_gguf.py` de llama.cpp, con salida en f16. La arquitectura del modelo base no está detallada en la model card; la documentación de vLLM indica que la familia Qwen3.5 introduce arquitectura MoE con gated delta networks, pero el tamaño de 2B podría ser denso. No se mencionan técnicas adicionales como RLHF o DPO.

## Capacidades

- Extracción de información nutricional a partir de texto libre de diarios de comida.
- Genera un único objeto JSON con: macronutrientes (calorías, proteínas, carbohidratos, grasas), azúcares, grasas saturadas, agua en ml, índice glucémico, 15 micronutrientes, campos declarados por el usuario y título de la comida.
- Requiere un prompt de inferencia específico (contrato de texto) sin plantilla de chat ni bloque de pensamiento.
- El modelo no es generalista: está especializado exclusivamente en esta tarea de extracción.
- No dispone de capacidades de visión, audio o tool calling general; su uso se limita a texto.

## Casos de uso

- **Diario de alimentos en apps de salud**: el modelo procesa entradas de texto libre del usuario y las convierte en registros nutricionales estructurados, listos para mostrar en la interfaz.
- **Registro rápido en aplicaciones de nutrición**: permite a los usuarios escribir lo que han comido de forma natural ("desayuno: café con leche y tostada con mermelada") y obtener el desglose de macronutrientes automáticamente.
- **Integración en dispositivos móviles (iOS)**: al ser un modelo ligero y en formato GGUF, se puede ejecutar localmente en el dispositivo con llama.cpp, sin necesidad de conexión a internet ni servidores externos.
- **Análisis nutricional de datos clínicos**: en entornos de investigación o atención médica, se puede usar para estandarizar registros de ingesta de pacientes en formato JSON para su posterior análisis.
- **Automatización de informes de nutrición**: extracción de datos de textos históricos (por ejemplo, notas de consulta) para construir bases de datos de consumo alimentario.
- **Asistente de planificación de comidas**: combinado con un sistema de recomendación, el modelo puede interpretar las comidas descritas y sugerir ajustes basados en objetivos nutricionales.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluación sobre un conjunto fijo de 1.500 ejemplos, con post-procesamiento de producción. Se presentan las métricas de correlación (0-1) para cada campo:

| Campo | Valor |
|---|---|
| Calorías | 0.761 |
| Proteínas | 0.856 |
| Carbohidratos | 0.775 |
| Grasas | 0.769 |
| Fibra | 0.939 |
| Azúcares | 0.856 |
| Grasas saturadas | 0.873 |
| Agua | 0.903 |
| Índice glucémico ±10 | 0.905 |
| Micronutrientes (media) | 0.862 |
| Fallos de parseo | 0/1500 |

Además, se compara el rendimiento de este adaptador con otros enfoques sobre el mismo conjunto de evaluación:

| Modelo | Valoración (calorías) |
|---|---|
| LFM2.5-shipped | 0.397 |
| MiniLM encoder e2e | 0.591 |
| LoRA r32 | 0.701 |
| **Este adaptador (LoRA r64)** | **0.761** |
| Teacher ceiling | 0.976 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- El modelo base cuantizado Q4_K_M de 2B ocupa aproximadamente 1.4 GB (tamaño total del repositorio), por lo que puede ejecutarse en dispositivos con al menos 2 GB de RAM/VRAM.
- El adaptador LoRA en f16 añade unos pocos MB adicionales.
- Se puede ejecutar en cualquier CPU moderna (con soporte de instrucciones AVX) usando llama.cpp, y en GPUs con al menos 3 GB de VRAM (por ejemplo, una RTX 2050 o superior).
- El modelo está diseñado para on-device: es viable en Raspberry Pi 4/5, smartphones iOS (a través de llama.cpp) y ordenadores de bajo consumo.
- Para despliegue en servidores, se puede usar vLLM (con soporte para Qwen3.5) o TGI, aunque el adaptador GGUF no es el formato habitual para estos frameworks; se recomienda usar el modelo base y cargar el adaptador como PEFT en safetensors si se necesita alta productividad.
- Latencia: en una CPU moderna, la inferencia de un texto corto (una entrada de diario) suele estar por debajo de 500 ms; en una GPU dedicada, por debajo de 50 ms.

## Comparativa con modelos similares

No se han encontrado modelos específicos para extracción nutricional de texto en formato GGUF comparables. La propia model card proporciona una comparación interna con otros enfoques:

| Enfoque | Parámetros | Contexto | Rendimiento (calorías) | Licencia |
|---|---|---|---|---|
| LFM2.5-shipped | No disponible | No disponible | 0.397 | No disponible |
| MiniLM encoder e2e | No disponible | No disponible | 0.591 | No disponible |
| LoRA r32 (sobre Qwen3.5-2B) | ~22M | No disponible | 0.701 | Apache-2.0 |
| **Este adaptador (LoRA r64)** | 43.6M | No disponible | 0.761 | Apache-2.0 |

No se dispone de comparativas con otros modelos públicos de extracción nutricional en la información proporcionada.

## Limitaciones y advertencias

- **Sesgo del dataset**: el dataset de entrenamiento (food-text-unified:v1) es privado y puede estar sesgado hacia ciertos tipos de alimentos, porciones o idiomas. No se especifica su composición.
- **Riesgo de alucinación**: al tratarse de un modelo generativo, puede inventar valores nutricionales si la entrada es ambigua o contiene errores. La evaluación muestra una precisión del 0.761 en calorías, lo que indica que existe margen de error.
- **Dependencia del prompt**: el adaptador está condicionado a un prompt exacto; cualquier variación en el formato de entrada puede degradar el rendimiento.
- **Idioma**: no se especifican idiomas soportados; el dataset probablemente es en inglés, por lo que su uso en otros idiomas podría no funcionar correctamente.
- **Post-procesamiento obligatorio**: el modelo no es autocontenido; requiere aplicar las reglas de post-procesamiento definidas en el dataset (reconciliación de calorías declaradas, invariantes de azúcar/grasa, cálculo de calorías derivadas 4/4/9, derivación de carga glucémica) para obtener resultados correctos.
- **Limitación de contexto**: no se especifica la longitud de contexto, pero al ser un modelo de 2B probablemente sea de 4k o 8k tokens, suficiente para entradas de diario pero no para textos muy largos.
- **Uso comercial**: la licencia Apache-2.0 permite uso comercial, pero el modelo está diseñado específicamente para la app A-LIST; no se proporciona soporte ni garantía.

## Enlaces

- Repositorio HuggingFace: [https://huggingface.co/NateRunsAEG/alist-food-text-qwen3.5](https://huggingface.co/NateRunsAEG/alist-food-text-qwen3.5)
- Colección Qwen3.5: [https://huggingface.co/collections/Qwen/qwen3.5](https://huggingface.co/collections/Qwen/qwen3.5)
- Página de Qwen: [https://qwen.ai/home](https://qwen.ai/home)
- Guía de uso de Qwen3.5 en vLLM: [https://docs.vllm.ai/projects/recipes/en/stable/Qwen/Qwen3.5.html](https://docs.vllm.ai/projects/recipes/en/stable/Qwen/Qwen3.5.html)
- Modelo Qwen3.6 en Ollama: [https://ollama.com/library/qwen3.6](https://ollama.com/library/qwen3.6)

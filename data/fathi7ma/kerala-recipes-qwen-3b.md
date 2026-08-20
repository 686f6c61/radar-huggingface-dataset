# Fathi7ma/kerala-recipes-qwen-3b

## Resumen

`Fathi7ma/kerala-recipes-qwen-3b` es un adaptador LoRA (entrenado con QLoRA) sobre el modelo base `Qwen/Qwen2.5-3B-Instruct`, especializado en generar recetas auténticas de Kerala (India). Desarrollado por Fathi7ma, este modelo está diseñado para responder a consultas culinarias con cantidades exactas de ingredientes, métodos paso a paso y sugerencias de maridaje, tanto en inglés como en malayalam (para nombres de platos). El proyecto surge de la necesidad de preservar recetas caseras tradicionales en un formato estructurado y accesible para sistemas de IA.

El adaptador se entrenó sobre el dataset `Fathi7ma/kerala-recipes`, que contiene 89 platos y 445 ejemplos de entrenamiento, durante unas 5 minutos en una GPU T4 de Google Colab. El modelo resultante es ligero (0.1 GB de pesos del adaptador) y se distribuye con licencia CC-BY-4.0, lo que facilita su uso y modificación. Aunque el modelo base es de 3B parámetros, el adaptador solo añade unos pocos millones de parámetros, por lo que la inferencia es viable en hardware moderado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-3B-Instruct) con adaptador LoRA |
| Parámetros totales | No disponible (el modelo base tiene 3.09B; el adaptador LoRA añade parámetros adicionales no especificados) |
| Parámetros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (la del modelo base Qwen2.5-3B-Instruct, no indicada en la información) |
| Tipos de cuantización | No disponible (entrenado con QLoRA 4-bit, pero no se publican cuantizaciones de inferencia) |
| Idiomas soportados | Inglés, Malayalam (nombres de platos) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 sobre el transformer causal Qwen2.5-3B-Instruct, entrenado con QLoRA en 4 bits. El entrenamiento se realizó durante 3 épocas con una tasa de aprendizaje de 2e-4 y un batch efectivo de 8 (2×4 de acumulación), en una GPU T4 de Google Colab, con una duración total de unos 5 minutos. El dataset de entrenamiento consiste en 445 ejemplos derivados de 89 recetas tradicionales de Kerala, cada una con cantidades escalables, instrucciones paso a paso y sugerencias de maridaje. No se ha aplicado RLHF ni DPO; se trata de un fine-tuning supervisado clásico. La innovación técnica es mínima, pero destaca el uso de Unsloth para optimizar el entrenamiento.

## Capacidades

- Generación de recetas completas de cocina de Kerala (curries, desayunos, arroces, snacks, postres y bebidas) con cantidades exactas en gramos y mililitros.
- Escalado de ingredientes para cualquier número de personas (de 1 a 30), usando fórmulas lineales, fraccionarias y fijas.
- Sugerencias de maridaje de platos (qué combina bien con qué).
- Comprensión de nombres de platos en inglés y malayalam.
- Respuestas directas y sin preámbulos, siguiendo el system prompt recomendado.
- No soporta tool calling, ni agentes, ni visión, ni audio.

## Casos de uso

- Asistente de cocina personal: el usuario pide una receta concreta y el modelo devuelve ingredientes y pasos exactos, ideal para aplicaciones de voz o chat en dispositivos móviles.
- Planificación de menús semanales: el modelo sugiere platos combinables, ayudando a crear menús equilibrados para hogares o pequeños restaurantes.
- Escalado de recetas para eventos: al indicar el número de comensales (hasta 30), el modelo ajusta automáticamente las cantidades, útil para catering o reuniones.
- Aplicación educativa de gastronomía regional: sirve como herramienta para aprender recetas tradicionales de Kerala y su preparación.
- Integración en sistemas de recomendación de recetas: puede sugerir platos acompañantes según el plato principal solicitado.
- Generación de contenido para blogs o redes sociales de cocina: el modelo produce recetas estructuradas y listas para publicar, ahorrando tiempo de redacción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no presenta métricas de MMLU, HumanEval, GSM8K ni similares. Su evaluación se limita a ejemplos cualitativos de salida.

## Requisitos de hardware

- Al ser un adaptador sobre un modelo base de 3B parámetros, la inferencia requiere cargar el modelo base Qwen2.5-3B-Instruct en memoria. Con cuantización de 4 bits, se estima un uso de VRAM de aproximadamente 3-4 GB, y con 16 bits, de unos 6-8 GB.
- GPU recomendadas: RTX 3060 (12 GB) o superior para 16 bits; cualquier GPU con 8 GB o más para 4 bits. En CPU, podría ejecutarse con 16 GB de RAM, pero con latencia elevada.
- Opciones de despliegue: el adaptador puede cargarse con la librería `transformers` y `peft`, o convertirse a GGUF para usar con `llama.cpp` o `Ollama`. También es compatible con servidores de inferencia como vLLM y TGI si se combina con el modelo base.
- Latencia: en una GPU T4, la generación de una receta de 512 tokens tarda aproximadamente 2-3 segundos (estimación basada en el rendimiento típico de modelos de 3B, no en datos oficiales).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para generación de recetas de Kerala. La comparativa natural sería con el modelo base `Qwen2.5-3B-Instruct` sin fine-tuning, que no tiene conocimiento especializado de recetas, y con otros modelos de cocina como `Mistral-7B` o `Llama-3-8B` fine-tuned en datasets culinarios, pero no hay datos disponibles en la información proporcionada. Se recomienda consultar el Hub de Hugging Face para alternativas, aunque no se conocen modelos equivalentes.

## Limitaciones y advertencias

- El modelo solo conoce las 89 recetas del dataset de entrenamiento; cualquier consulta fuera de ese conjunto puede producir respuestas incorrectas o inventadas.
- El escalado de ingredientes usa fórmulas simplificadas que pueden no ser precisas para todos los casos (p. ej., la sal u otros condimentos que requieren ajuste personal).
- No se ha probado con entradas complejas ni con contexto largo; su ventana de contexto es la del modelo base, pero no se ha verificado su comportamiento con conversaciones largas.
- El modelo puede alucinar cantidades o pasos si se le pide una receta que no está en su repertorio.
- Aunque la licencia CC-BY-4.0 permite uso comercial, se debe atribuir al autor original y no se puede aplicar restricciones adicionales.
- No se ha realizado una evaluación formal de sesgos ni de seguridad; su uso en producción debe ir acompañado de pruebas adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Fathi7ma/kerala-recipes-qwen-3b
- Dataset de entrenamiento: https://huggingface.co/datasets/Fathi7ma/kerala-recipes
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/Fathi7ma/kerala-recipes-demo
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct

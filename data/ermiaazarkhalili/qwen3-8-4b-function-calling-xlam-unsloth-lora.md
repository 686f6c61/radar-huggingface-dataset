# ermiaazarkhalili/Qwen3.8-4B-Function-Calling-xLAM-Unsloth-LoRA

## Resumen

El modelo `ermiaazarkhalili/Qwen3.8-4B-Function-Calling-xLAM-Unsloth-LoRA` es un adaptador LoRA creado mediante fine-tuning del modelo base `empero-ai/Qwen3.8-4B` sobre el dataset `Salesforce/xlam-function-calling-60k`, que contiene 60 000 ejemplos de llamada a funciones con definiciones de herramientas y respuestas estructuradas. El objetivo es dotar al modelo base de una capacidad específica de function calling, es decir, que sea capaz de emitir llamadas a herramientas de forma precisa a partir de una consulta del usuario y una lista de funciones disponibles.

El adaptador fue desarrollado por el usuario ermiaazarkhalili y publicado en Hugging Face con licencia no disponible. Se entrenó mediante QLoRA de 4 bits, con rango 64 y alpha 64, durante una época completa, alcanzando una pérdida final de 0,1030. El modelo base tiene aproximadamente 4 mil millones de parámetros, aunque no se especifica su arquitectura exacta ni su longitud de contexto; el entrenamiento usó secuencias de 2048 tokens.

La relevancia de este modelo radica en que permite añadir capacidades de function calling a un modelo base de tamaño pequeño (4B) sin necesidad de reentrenar todo el modelo, lo que reduce costes y requisitos de hardware. Es una opción interesante para desarrolladores que buscan integrar agentes o asistentes conversacionales con llamadas a APIs en entornos con recursos limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente transformer, derivada de Qwen) |
| Parámetros totales | no disponible (el modelo base tiene ~4B; el adaptador añade parámetros adicionales) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el entrenamiento usó secuencias de 2048 tokens) |
| Tipos de cuantización | no disponible (el entrenamiento se realizó con QLoRA 4-bit, pero el adaptador se publica en safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA que se aplica sobre el modelo base `empero-ai/Qwen3.8-4B`, un modelo de 4 mil millones de parámetros del que no se proporcionan detalles técnicos en la documentación disponible. El adaptador se entrenó con el método QLoRA de 4 bits, que permite un fine-tuning eficiente en términos de VRAM y velocidad. La configuración de LoRA utilizó un rango de 64 y un alpha de 64, sin dropout y sin bias, aplicado sobre 10 módulos objetivo (proyecciones de atención y MLP). El entrenamiento se realizó durante 1 época, con un lote efectivo de 8 y una tasa de aprendizaje de 0,0002, sobre el dataset de 60 000 ejemplos de llamada a funciones.

No se han publicado detalles sobre la composición del dataset, la técnica de alineación (RLHF, DPO) ni innovaciones técnicas adicionales. La pérdida final de entrenamiento fue de 0,1030, pero no se reportan métricas de evaluación en un conjunto de validación independiente.

## Capacidades

- Llamada a funciones estructuradas: el modelo es capaz de generar respuestas en formato JSON con la llamada a una o varias funciones, a partir de una consulta y una lista de herramientas definidas.
- Generación de texto conversacional: hereda las capacidades de generación de texto del modelo base, aunque no se detallan sus límites.
- Razonamiento multi-turno: el entrenamiento en el dataset de llamada a funciones sugiere que puede manejar conversaciones donde se requiera decidir qué herramienta invocar en cada turno.
- Soporte de tool calling: específicamente optimizado para emitir llamadas a funciones definidas por el usuario, aunque no se confirma si soporta function calling nativo del modelo base.
- Capacidades multilingües: no se especifican; probablemente dependen del modelo base.

## Casos de uso

- **Asistentes virtuales con acceso a APIs**: el modelo puede gestionar conversaciones donde el usuario solicita acciones (por ejemplo, reservar una cita, consultar el tiempo) y el modelo debe invocar la función correspondiente con los argumentos correctos.
- **Automatización de tareas de back-office**: integración en sistemas que requieren interpretar comandos en lenguaje natural y ejecutar operaciones sobre bases de datos o servicios internos, generando la llamada a la función adecuada.
- **Chatbots de atención al cliente**: el modelo puede gestionar consultas y, cuando sea necesario, llamar a herramientas de consulta de pedidos, devoluciones o facturación, sin necesidad de reglas manuales.
- **Generación de código para agentes**: en entornos de desarrollo, el modelo puede generar llamadas a funciones de un SDK concreto, facilitando la creación de scripts o la automatización de tareas.
- **Pruebas de integración**: uso en entornos de test para verificar que un sistema de llamadas a funciones funciona correctamente, generando ejemplos de invocación a partir de descripciones de las herramientas.
- **Prototipado rápido de agentes**: al ser un adaptador ligero, se puede cargar sobre el modelo base y probar rápidamente en un cuaderno de Jupyter o en un servidor local, sin necesidad de infraestructura pesada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no reporta métricas de evaluación como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. El único dato de entrenamiento es la pérdida final de 0,1030, que no es comparable entre modelos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo base de 4B parámetros en precisión fp16 requiere aproximadamente 8 GB de VRAM; en cuantización 4-bit, alrededor de 2-3 GB. El adaptador LoRA añade muy poco peso adicional (0.5 GB en el repositorio), pero se debe cargar el modelo base completo.
- **GPU recomendadas**: una RTX 3060 de 12 GB o RTX 4070 de 12 GB pueden ejecutar el modelo en fp16; para cuantización 4-bit, una RTX 2060 de 8 GB o superior es suficiente. GPUs de datacenter como A100 o H100 también son compatibles, pero no necesarias para un modelo de este tamaño.
- **Cabe en consumer GPU**: sí, tanto en fp16 (con 8-12 GB de VRAM) como en 4-bit (con menos de 4 GB).
- **Opciones de despliegue**: se puede cargar con `transformers` y `peft` (como se muestra en el README), también se puede fusionar el adaptador en el modelo base y exportar a formatos como GGUF para su uso con `llama.cpp` u `Ollama`. Para producción, se recomienda `vLLM` o `TGI`, aunque no se ha verificado la compatibilidad con este adaptador específico.
- **Latencia y throughput**: no se dispone de datos medidos. Para un modelo de 4B en una GPU consumer, se espera una generación de unos 20-40 tokens por segundo en fp16, y más rápida en 4-bit.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros adaptadores de function calling para modelos de tamaño similar. La única referencia cercana es el propio adaptador `Qwen3-4B-Function-Calling-xLAM-Unsloth` del mismo autor, que se entrena sobre el mismo dataset pero con un modelo base `Qwen3-4B` y con rango LoRA menor (16). No hay datos de rendimiento comparativo.

| Modelo | Tamaño | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este adaptador (Qwen3.8-4B) | 4B (base) | no disponible | no disponible | Entrenado con r=64 sobre `empero-ai/Qwen3.8-4B` |
| Adaptador Qwen3-4B (r=16) | 4B (base) | no disponible | no disponible | Entrenado sobre `Qwen3-4B` con r=16 |
| Modelo base `empero-ai/Qwen3.8-4B` | 4B | no disponible | no disponible | Sin fine-tuning específico de function calling |

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: el modelo hereda los sesgos y limitaciones del modelo base `empero-ai/Qwen3.8-4B`, que no se documentan en la información disponible. Puede generar llamadas a funciones inexistentes o con parámetros incorrectos si la consulta es ambigua.
- **Riesgo de alucinación en tool calling**: al estar entrenado solo en un dataset de 60 000 ejemplos, puede fallar en casos fuera de distribución, especialmente con definiciones de herramientas complejas o anidadas.
- **Limitaciones de contexto**: el entrenamiento usó secuencias de 2048 tokens; si el modelo base soporta más contexto, el adaptador no lo ha demostrado. La longitud de contexto real del modelo base no está especificada.
- **Idioma**: no se especifican los idiomas soportados. El dataset `Salesforce/xlam-function-calling-60k` es mayormente en inglés, por lo que el adaptador puede funcionar mejor en inglés que en otros idiomas.
- **Licencia**: la licencia no está disponible, tanto para el adaptador como para el modelo base. Esto impide conocer las restricciones de uso comercial y redistribución.
- **Producción**: no se han publicado evaluaciones de robustez ni pruebas de seguridad. Se recomienda validar el modelo en escenarios reales antes de desplegarlo en producción.
- **Dependencia del modelo base**: el adaptador solo funciona con el modelo base exacto `empero-ai/Qwen3.8-4B`. No se puede aplicar a otros modelos.

## Enlaces

- [Adaptador LoRA en Hugging Face](https://huggingface.co/ermiaazarkhalili/Qwen3.8-4B-Function-Calling-xLAM-Unsloth-LoRA)
- [Modelo fusionado (versión 16-bit) - Qwen3.8-4B-Function-Calling-xLAM-Unsloth](https://huggingface.co/ermiaazarkhalili/Qwen3.8-4B-Function-Calling-xLAM-Unsloth)
- [Dataset Salesforce/xlam-function-calling-60k](https://huggingface.co/datasets/Salesforce/xlam-function-calling-60k)
- [Modelo base empero-ai/Qwen3.8-4B](https://huggingface.co/empero-ai/Qwen3.8-4B) (no se ha confirmado la URL exacta; el README indica el nombre)
- [Adaptador r=16 similar del mismo autor](https://huggingface.co/ermiaazarkhalili/Qwen3.8-4B-SFT-Fable5-Glint)

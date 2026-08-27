# AMAImedia/NOESIS-Qwopus3.5-9B-DubCompress-v3.5-MLX

## Resumen

NOESIS-Qwopus3.5-9B-DubCompress-v3.5-MLX es un modelo de lenguaje especializado en compresión de diálogos multilingües, post-procesamiento de traducción y ajuste de texto traducido a slots fijos de subtítulos o duración de habla. Ha sido desarrollado por AMAImedia como parte de la plataforma NOESIS Professional Multilingual Dubbing Automation Platform, bajo el framework DHCF-FNO (Deterministic Hybrid Control Framework for Frozen Neural Operators). El modelo está basado en la arquitectura Qwen3.5 (Qwen3_5ForCausalLM) con aproximadamente 9.000 millones de parámetros y una ventana de contexto de 262.144 posiciones.

Esta versión concreta es la conversión a MLX safetensors del modelo original entrenado en BF16, diseñada para inferencia en Apple Silicon mediante `mlx-lm`. El modelo se presenta como un especialista en tareas de doblaje: recibe un texto fuente o una traducción preliminar junto con restricciones explícitas (idioma destino, presupuesto de duración o caracteres, y significado a preservar) y produce una versión comprimida que encaja en el slot temporal o de subtítulos. Su relevancia radica en abordar un problema muy concreto de la industria del doblaje y la subtitulación, donde la fidelidad semántica y el ajuste métrico son críticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForCausalLM (qwen3_5) |
| Parametros totales | 8.953.801.728 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 posiciones |
| Tipos de cuantizacion | no disponible (almacenado en BF16, conversión MLX safetensors) |
| Idiomas soportados | Inglés, español, francés, alemán, portugués, ruso, chino, árabe, hindi, japonés, coreano y más de 201 lenguas y dialectos (heredado de Qwen3.5) |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX, 4 shards, ~17,93 GB) |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura Qwen3.5, un transformer causal denso con 32 capas, tamaño oculto de 4096 y tamaño intermedio de 12288. No se trata de un modelo MoE, sino de un modelo denso de aproximadamente 9B parámetros. El tokenizer es el de Qwen3.5 con plantilla de chat (`chat_template.jinja`). El entrenamiento original se realizó en BF16 y esta versión es una conversión a MLX safetensors para ejecución en Apple Silicon.

El modelo ha sido entrenado específicamente para tareas de compresión de diálogos y ajuste de subtítulos, lo que implica un entrenamiento supervisado orientado a transformaciones de texto con restricciones de longitud y duración. No se especifican detalles sobre el dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas como RLHF o DPO. El framework DHCF-FNO sugiere un enfoque de control híbrido determinista sobre operadores neuronales congelados, pero no se proporcionan más detalles técnicos en la información disponible.

## Capacidades

- Compresión de diálogos multilingües: reduce la longitud de un texto manteniendo el significado esencial, adaptándolo a un presupuesto de caracteres o duración.
- Post-procesamiento de traducción: ajusta traducciones automáticas para mejorar la naturalidad en el idioma destino y cumplir restricciones de slot.
- Ajuste a slots de subtítulos o duración de habla: encaja el texto traducido en ventanas temporales fijas, considerando densidad silábica y ritmo de lectura.
- Soporte multilingüe amplio: hereda la cobertura de 201 lenguas y dialectos de Qwen3.5, aunque la calidad de compresión puede variar según el idioma.
- Generación de texto conversacional: al ser un modelo de la familia Qwen3.5, conserva capacidades generales de generación de texto y diálogo, aunque su especialización principal es el doblaje.
- Integración con pipelines de doblaje: diseñado para funcionar dentro de flujos de trabajo automatizados de doblaje profesional, con parámetros de control como temperatura baja y límites de tokens.

## Casos de uso

- Doblaje profesional de series y películas: el modelo recibe el guion traducido y lo comprime para que encaje en la duración de la línea de diálogo original, preservando nombres propios y significado. Es adecuado porque está entrenado específicamente para esta tarea y soporta múltiples idiomas.
- Subtitulación con restricciones de caracteres: plataformas de streaming o servicios de subtítulos pueden usar el modelo para ajustar traducciones a límites de caracteres por línea o velocidad de lectura, manteniendo la coherencia semántica.
- Localización de videojuegos: en juegos con diálogos hablados y subtítulos sincronizados, el modelo puede comprimir las traducciones para que coincidan con las animaciones faciales y la duración de las voces.
- Post-edición de traducción automática en entornos de doblaje: integrado en un pipeline de traducción automática, el modelo refina las salidas para que sean más naturales y se ajusten a los tiempos de habla, reduciendo el trabajo manual de los ajustadores.
- Generación de subtítulos para contenido educativo o corporativo: al comprimir diálogos manteniendo el significado, puede generar subtítulos concisos para vídeos formativos o presentaciones con restricciones de espacio.
- Automatización de flujos de doblaje en tiempo real: gracias a su soporte para MLX en Apple Silicon, puede desplegarse en estaciones de trabajo Mac para procesar lotes de diálogos de forma local, sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas específicas de compresión de subtítulos o calidad de doblaje. El autor no proporciona comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- El modelo está diseñado para Apple Silicon mediante `mlx-lm`. Se requiere un Mac con chip M1, M2, M3 o M4 (o variantes Pro/Max/Ultra) con suficiente memoria unificada.
- El tamaño del repositorio es de aproximadamente 17,93 GB en BF16/MLX safetensors. Para cargar el modelo completo en memoria, se recomienda un Mac con al menos 32 GB de RAM unificada, aunque con cuantización podría caber en 24 GB (no se especifican cuantizaciones disponibles).
- No se proporcionan datos de VRAM específica para GPUs NVIDIA o AMD; el modelo es exclusivamente para MLX en Apple Silicon.
- Opciones de despliegue: `mlx-lm` (inferencia local), con soporte para generación por lotes y ajuste de `--prefill-step-size` y `--max-kv-size` para controlar el uso de memoria.
- Latencia y throughput: no disponibles. Se recomienda usar temperatura baja (0.3) y límites de tokens acotados para pruebas deterministas.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo pertenece a la familia NOESIS de AMAImedia, que incluye otras variantes especializadas como NOESIS-Qwopus3.5-9B-Translate-v3.5-BF16 y NOESIS-Qwopus3.5-9B-Supervisor-v3.5-BF16, pero no se publican métricas comparativas. Existe también un modelo Qwopus3.5 9B V3.5 de Jackrong (disponible en Ollama) con características similares (9,7B parámetros, contexto 262.144), pero no se dispone de datos de rendimiento ni licencia para establecer una comparación objetiva. Se recomienda consultar las model cards de los modelos BF16 originales para más detalles.

## Limitaciones y advertencias

- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial. Se debe contactar con AMAImedia antes de utilizar el modelo en producción.
- La calidad de compresión varía según el idioma; el autor advierte que la cobertura de 201 lenguas no implica una calidad uniforme. Es necesario validar la preservación semántica, la naturalidad del idioma destino, la longitud del subtítulo, la densidad silábica y el presupuesto temporal en cada caso.
- El modelo está especializado en compresión y ajuste de slots; no debe usarse para tareas generales de traducción o generación de texto sin validación previa.
- Riesgo de alucinación o pérdida de información en compresiones agresivas, especialmente con presupuestos de tiempo muy ajustados.
- La versión MLX solo funciona en Apple Silicon; no es compatible con GPUs NVIDIA o AMD ni con entornos Windows/Linux estándar.
- No se han publicado benchmarks ni evaluaciones independientes, por lo que el rendimiento real en escenarios de producción no está verificado.
- El modelo requiere instrucciones explícitas (idioma destino, presupuesto de duración, significado a preservar) para funcionar correctamente; no debe usarse sin contexto.

## Enlaces

- Modelo MLX en HuggingFace: https://huggingface.co/AMAImedia/NOESIS-Qwopus3.5-9B-DubCompress-v3.5-MLX
- Modelo BF16 original: https://huggingface.co/AMAImedia/NOESIS-Qwopus3.5-9B-DubCompress-v3.5-BF16
- Variante Translate BF16: https://huggingface.co/AMAImedia/NOESIS-Qwopus3.5-9B-Translate-v3.5-BF16
- Variante Supervisor BF16: https://huggingface.co/AMAImedia/NOESIS-Qwopus3.5-9B-Supervisor-v3.5-BF16
- Qwopus3.5 en Ollama (modelo relacionado): https://ollama.com/fredrezones55/Qwopus3.5
- Información de hardware de Qwopus3.5 9B V3.5: https://llmrun.dev/model/jackrong-qwopus3-5-9b-v3-5

# jacobwat/contrastive67

## Resumen

El modelo `jacobwat/contrastive67` es un prototipo de investigación de un *tiny transformer* diseñado específicamente para experimentos con aprendizaje contrastivo. Lo desarrolla el usuario `jacobwat` y se publica en Hugging Face con licencia BSD-3-Clause. Su tamaño es extremadamente reducido: 16.576 parámetros, lo que lo convierte en un juguete computacional útil para probar arquitecturas, flujos de entrenamiento o técnicas de representación sin necesidad de recursos de hardware significativos.

El repositorio incluye un checkpoint de inicialización (`model.safetensors`) que no ha sido entrenado; la propia model card indica que no se presentan métricas de rendimiento y que el archivo sirve únicamente para pruebas de humo (*smoke tests*). La arquitectura documentada emplea atención estándar, co-atención (fusión), activación *mish* y normalización *batchnorm*. Aunque el autor lo etiqueta como escala "giant", el número real de parámetros lo sitúa en la categoría de micro-modelos.

Su relevancia actual es limitada fuera del ámbito académico: sirve como banco de pruebas para metodologías de entrenamiento contrastivo, comparación de configuraciones y validación de pipelines de evaluación. No está pensado para tareas de producción ni para uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tiny Transformer (atención estándar, co-atención, activación mish, normalización batchnorm) |
| Parametros totales | 16.576 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponibles (pesos en float32 por defecto en safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer diminuto con atención estándar (no lineal ni dispersa) y un mecanismo de co-atención para fusión de información, probablemente orientado a pares de secuencias en el contexto de aprendizaje contrastivo. La activación *mish* y la normalización *batchnorm* son elecciones poco habituales en transformers modernos (que suelen usar GELU o SwiGLU y LayerNorm), pero coherentes con un diseño experimental.

El entrenamiento no se ha realizado: el checkpoint incluido es una inicialización aleatoria. La configuración por defecto en `training_args.json` propone *rmsprop* con un programa de una sola época (*onecycle*), pero no hay evidencia de que se haya ejecutado. No se especifican datos de entrenamiento, número de tokens ni técnicas como RLHF o DPO. La model card insiste en que cualquier resultado futuro debe documentarse por separado y con protocolos de evaluación rigurosos (múltiples semillas, conjunto de validación específico de la tarea, línea base de capacidad comparable).

## Capacidades

- No se han demostrado capacidades funcionales: el checkpoint no está entrenado.
- Arquitectura preparada para experimentos de aprendizaje contrastivo (co-atención entre dos entradas).
- El código (`inference.py`) incluye un ejemplo ejecutable de *smoke test*, pero no es una capacidad real del modelo.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni ninguna funcionalidad de modelo de lenguaje de propósito general.
- Multilingüismo: no disponible.

## Casos de uso

Dado que el modelo no está entrenado, los casos de uso son exclusivamente de investigación y desarrollo:

- **Validación de pipelines de entrenamiento contrastivo**: usar el checkpoint para verificar que el código de entrenamiento, la carga de datos y la evaluación funcionan correctamente antes de escalar a modelos mayores.
- **Pruebas de infraestructura**: comprobar la integración con frameworks de entrenamiento distribuido, logging o guardado de checkpoints en un entorno de CI/CD.
- **Estudio de arquitecturas mínimas**: analizar cómo se comporta una atención estándar con batchnorm en tareas sintéticas de representación, comparando con alternativas como LayerNorm.
- **Depuración de pérdidas contrastivas**: ejecutar el modelo con pocos ejemplos para depurar implementaciones de funciones de pérdida como InfoNCE o triplet loss.
- **Enseñanza de aprendizaje automático**: usar el modelo como ejemplo didáctico para explicar transformers, entrenamiento contrastivo o el flujo de trabajo con Hugging Face.
- **Benchmark de eficiencia**: medir latencia y consumo de memoria de un transformer diminuto en diferentes backends (CPU, GPU) para calibrar expectativas en proyectos con restricciones extremas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara explícitamente: "No benchmark score is claimed in this repository". No hay datos de MMLU, HumanEval, GSM8K ni ninguna otra métrica estándar.

## Requisitos de hardware

- **VRAM estimada**: inferior a 1 MB en float32 (16.576 parámetros × 4 bytes ≈ 66 KB). Cualquier GPU moderna o incluso CPU es suficiente.
- **GPU recomendada**: ninguna en particular; funciona en CPU, Raspberry Pi o microcontroladores con soporte PyTorch.
- **Compatibilidad con GPU de consumo**: sí, cualquier GPU con al menos 1 GB de VRAM (aunque no la necesita).
- **Opciones de despliegue**: al ser un modelo custom, no es compatible directamente con vLLM, llama.cpp u Ollama sin escribir un adaptador. Se puede ejecutar con PyTorch estándar.
- **Latencia y throughput**: despreciables; la inferencia es instantánea en cualquier hardware moderno.

## Comparativa con modelos similares

No se dispone de modelos comparables directamente en la misma categoría (tiny transformers con co-atención contrastiva y batchnorm). Alternativas genéricas de tamaño similar (como los mini GPT de la serie `TinyStories` de Microsoft) tienen arquitecturas distintas (LayerNorm, GELU) y están entrenados, por lo que no son comparables en rendimiento ni propósito. La comparación carece de sentido sin datos de evaluación. Se indica "no disponible".

## Limitaciones y advertencias

- **No entrenado**: el checkpoint es una inicialización aleatoria; cualquier salida que produzca es ruido y no debe interpretarse como resultado del modelo.
- **Sin robustez ni fairness**: la model card advierte que no se ha auditado el modelo para sesgos, equidad ni transferencia de dominio.
- **Alucinación**: al no estar entrenado, no genera texto coherente; si se fuerza una salida, será basura aleatoria.
- **Contexto limitado**: no se especifica la longitud de contexto; probablemente muy pequeña dada la arquitectura mínima.
- **Idiomas**: no soportados; no hay vocabulario ni tokenizador entrenado.
- **Licencia**: BSD-3-Clause permite uso comercial y modificación, pero el autor advierte revisar los términos de los datos externos si se usan con datasets de terceros.
- **Producción**: no apto para ningún caso de uso real; es exclusivamente experimental.

## Enlaces

- [Hugging Face - jacobwat/contrastive67](https://huggingface.co/jacobwat/contrastive67)
- [Repositorio de referencia CLIP (OpenAI) - contexto de aprendizaje contrastivo](https://github.com/openai/CLIP)
- [Base de datos de modelos de IA - comparativas generales](https://gpt0x.com/)

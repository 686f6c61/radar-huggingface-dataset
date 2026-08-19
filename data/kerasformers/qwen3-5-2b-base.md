# kerasformers/qwen3.5-2b-base

## Resumen

`kerasformers/qwen3.5-2b-base` es una conversión pura en Keras 3 del modelo base `Qwen/Qwen3.5-2B-Base`, publicada por el usuario `kerasformers` dentro de la colección KerasFormers. El objetivo es ofrecer los pesos del modelo en un formato nativo de Keras 3 (con su tokenizer asociado) para facilitar su uso en entornos TensorFlow, JAX o PyTorch a través de la librería `kerasformers`. El repositorio contiene los pesos convertidos y el archivo `tokenizer.json`, con un tamaño total de 3,8 GB y licencia Apache 2.0.

Al tratarse de una conversión directa, el modelo hereda las capacidades del Qwen3.5-2B-Base original, aunque la model card no proporciona detalles técnicos adicionales (arquitectura, contexto, etc.). Es relevante para desarrolladores que trabajan con Keras 3 y desean integrar un modelo de 2 mil millones de parámetros en sus pipelines sin depender de las implementaciones oficiales de Qwen. La conversión es reciente (creada en julio de 2026) y cuenta con pocas descargas, lo que indica que es un proyecto en fase inicial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se indica que es conversión de Qwen/Qwen3.5-2B-Base) |
| Parametros totales | no disponible (se infiere ~2B por el nombre, pero no se confirma) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo indica bf16 en el título) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo con pesos y tokenizer.json, formato no especificado) |

## Arquitectura y entrenamiento

No se proporcionan detalles sobre la arquitectura interna ni el proceso de entrenamiento en la model card. Se trata de una conversión de pesos del modelo base `Qwen/Qwen3.5-2B-Base` a Keras 3, realizada con la librería `kerasformers`. No se documentan cambios en la arquitectura ni en los pesos; la conversión es puramente de formato. No hay información sobre el dataset de entrenamiento, el número de tokens procesados ni técnicas de alineación (RLHF, DPO, etc.).

## Capacidades

- Generación de texto autoregresiva (heredada del modelo base, aunque no se detalla en la model card).
- Soporte de tokenización mediante el tokenizer incluido (`tokenizer.json`).
- Integración con el ecosistema Keras 3 (TensorFlow, JAX, PyTorch) a través de `kerasformers`.
- No se documentan capacidades específicas como tool calling, agentes, visión o audio.

## Casos de uso

- Prototipado rápido en Keras 3: los desarrolladores pueden cargar el modelo con `Qwen3_5Generate.from_weights()` y usarlo para experimentar con generación de texto sin necesidad de instalar dependencias de Qwen.
- Investigación académica: sirve como base para estudiar el comportamiento de modelos de 2B en entornos Keras, comparando resultados con implementaciones nativas.
- Fine-tuning en Keras: al ser pesos en formato Keras, es posible adaptarlo a tareas específicas usando el API de Keras 3.
- Despliegue en entornos TensorFlow/JAX: permite ejecutar el modelo en frameworks donde las implementaciones oficiales no están disponibles.
- Educación: útil para enseñar arquitecturas transformer y generación de texto en Keras.
- Migración de proyectos: facilita la transición de modelos PyTorch a Keras sin reescribir la lógica de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el tamaño del repositorio es de 3,8 GB, lo que sugiere pesos en bf16 (2B × 2 bytes ≈ 4 GB). Se estima un consumo de memoria de aproximadamente 4-5 GB durante la inferencia, sin contar el overhead del framework.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM (p. ej., RTX 3060, RTX 4060) podría ejecutar el modelo en bf16 con batch pequeño. Para mayor comodidad, se recomienda una GPU de 8 GB o más.
- Compatibilidad con GPUs de consumo: sí, es viable en GPUs de gama media y alta.
- Opciones de despliegue: al ser un modelo Keras, se puede servir con TensorFlow Serving, o exportar a TFLite/ONNX si se desea. No se menciona soporte para vLLM, llama.cpp u Ollama en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni especificaciones detalladas para realizar una comparativa fiable. El modelo base Qwen3.5-2B-Base podría compararse con otros modelos de 2B como Llama-3.2-1B o Qwen2.5-1.5B, pero no se proporcionan métricas en la información disponible.

## Limitaciones y advertencias

- La model card no ofrece detalles sobre sesgos, alucinaciones o limitaciones de contexto; se asume que hereda las del modelo base Qwen3.5-2B, pero no se confirma.
- Es una conversión no oficial, por lo que puede haber diferencias sutiles en el comportamiento respecto a la implementación original.
- El proyecto tiene pocas descargas y está en fase temprana; no hay garantías de estabilidad ni soporte.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo base original para posibles restricciones adicionales.
- No se especifican los idiomas soportados; se desconoce si el tokenizer cubre múltiples lenguas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kerasformers/qwen3.5-2b-base
- Colección KerasFormers Qwen3.5: https://huggingface.co/collections/kerasformers/qwen35-6a7e5421737d73e63669ebb9
- Repositorio de KerasFormers (GitHub): https://github.com/IMvision12/KerasFormers
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-2B-Base

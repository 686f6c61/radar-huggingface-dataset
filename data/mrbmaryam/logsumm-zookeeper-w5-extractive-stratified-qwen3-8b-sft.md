# mrbmaryam/logsumm-zookeeper-w5-extractive-stratified-qwen3-8b-sft

## Resumen

El modelo `mrbmaryam/logsumm-zookeeper-w5-extractive-stratified-qwen3-8b-sft` es un ajuste fino (SFT) del modelo Qwen3-8B, desarrollado por el usuario mrbmaryam y publicado en Hugging Face bajo licencia Apache 2.0. El nombre del repositorio sugiere que se ha entrenado para una tarea de resumen extractivo sobre el conjunto de datos LogSumm, con una configuración de ventana de contexto de 5 (w5) y una estrategia de muestreo estratificado, aunque la model card no documenta estos detalles de forma explícita.

El modelo parte de la versión cuantizada en 4 bits de Qwen3-8B publicada por Unsloth (`unsloth/Qwen3-8B-bnb-4bit`) y se ha entrenado con la librería Unsloth, que acelera el proceso de ajuste fino aproximadamente 2 veces. Se trata de un modelo de generación de texto orientado al idioma inglés, según los metadatos del repositorio.

La relevancia de esta ficha es limitada: el modelo tiene cero descargas y cero likes, la model card es prácticamente inexistente (solo indica autor, licencia y modelo base), y no se han publicado benchmarks, detalles de entrenamiento ni instrucciones de uso. Aun así, se documenta lo disponible para que desarrolladores e investigadores puedan evaluar si merece la pena explorarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-8B) |
| Parametros totales | 8 mil millones (aproximado, segun el modelo base Qwen3-8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3-8B soporta hasta 32 768 tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | El modelo base de partida es bnb-4bit; el repositorio contiene safetensors (probablemente en precisión completa o bf16 tras el entrenamiento) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-8B, un transformer decoder-only con atención completa y mecanismos de razonamiento (thinking mode) en su versión original. Sin embargo, no se dispone de información sobre si el ajuste fino ha preservado o modificado estas capacidades. El entrenamiento se realizó con Unsloth, una librería que implementa kernels optimizados para reducir el uso de memoria y acelerar el SFT, pero la model card no especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

El nombre del repositorio indica una tarea de resumen extractivo sobre LogSumm, con una ventana de 5 y muestreo estratificado. No obstante, no se detalla cómo se construyó el dataset, cuántas muestras se utilizaron ni qué hiperparámetros se emplearon. Tampoco se documenta si se congelaron capas, si se aplicó LoRA o QLoRA, o si el entrenamiento fue completo. La única innovación técnica declarada es el uso de Unsloth para acelerar el entrenamiento 2 veces.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen3-8B.
- Potencial capacidad de resumen extractivo, según el nombre del repositorio, aunque no se documenta su rendimiento.
- No se confirma soporte de tool calling, function calling ni agentes multi-paso en esta versión ajustada.
- No se confirma capacidad multilingüe más allá del inglés.
- No se confirma modo de razonamiento (thinking mode) ni otras capacidades especiales del Qwen3 original.
- No se dispone de información sobre visión, audio u otras modalidades.

## Casos de uso

- Resumen extractivo de documentos: el modelo podría emplearse para seleccionar frases relevantes de textos largos, dado el nombre del repositorio, aunque no hay evidencia publicada de su calidad en esta tarea.
- Experimentación académica: útil como punto de partida para investigadores que quieran reproducir o comparar ajustes finos sobre Qwen3-8B con Unsloth.
- Generación de texto genérica en inglés: al estar basado en Qwen3-8B, puede emplearse para tareas de generación creativa o informativa, siempre que se valide su comportamiento tras el ajuste.
- Prototipado rápido: su tamaño de 8 mil millones de parámetros permite desplegarlo en una GPU de gama alta consumer (por ejemplo, RTX 4090 con cuantización) para pruebas de concepto.
- Fine-tuning posterior: al estar bajo licencia Apache 2.0, puede servir como base para nuevos ajustes finos en dominios específicos.
- Evaluación de técnicas de resumen: puede integrarse en pipelines de comparación de modelos de resumen extractivo, aunque sin benchmarks publicados su utilidad es limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Para un modelo de 8 mil millones de parámetros, se estima aproximadamente 16 GB en FP16, 8-10 GB en 8 bits y 5-6 GB en 4 bits, aunque estas cifras son orientativas y no están confirmadas para este ajuste.
- GPU recomendadas: no disponible. Por tamaño, cabría esperar compatibilidad con A100, H100, RTX 4090, RTX 3090 y similares.
- ¿Cabe en GPU consumer? Probablemente sí en RTX 4090 (24 GB) y RTX 3090 (24 GB) con cuantización, pero no se confirma.
- Opciones de despliegue: el repositorio incluye la etiqueta `text-generation-inference`, por lo que podría desplegarse con TGI. También sería compatible con transformers, vLLM y llama.cpp (previa conversión a GGUF), aunque no se documenta.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| mrbmaryam/logsumm-zookeeper-w5-extractive-stratified-qwen3-8b-sft | 8B | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Ajuste fino sin documentación |
| Qwen/Qwen3-8B | 8B | 32 768 tokens (según documentación oficial de Qwen) | Apache 2.0 | Hugging Face | Modelo base original, con benchmarks publicados |
| unsloth/Qwen3-8B-bnb-4bit | 8B | 32 768 tokens (heredado) | Apache 2.0 | Hugging Face | Versión cuantizada en 4 bits del base |
| meta-llama/Llama-3.1-8B | 8B | 128 000 tokens | Llama 3.1 Community License | Hugging Face | Alternativa de tamaño similar, con benchmarks públicos |

## Limitaciones y advertencias

- La model card no documenta el proceso de entrenamiento, los datos utilizados ni los hiperparámetros, lo que impide evaluar su calidad y reproducibilidad.
- No se han publicado benchmarks, por lo que se desconoce su rendimiento real en tareas de resumen o generación.
- El modelo solo declara soporte para inglés, lo que limita su uso en otros idiomas.
- Riesgo de alucinación inherente a los modelos de lenguaje, agravado por la falta de evaluación.
- Sesgos desconocidos: al no documentarse el dataset de entrenamiento, no se pueden identificar sesgos específicos.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-8B también es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.
- El tamaño del repositorio (0.2 GB) es llamativamente pequeño para un modelo de 8B, lo que podría indicar que los pesos no están completos o que se trata de un error de subida; se recomienda verificar antes de usarlo.

## Enlaces

- [Hugging Face: mrbmaryam/logsumm-zookeeper-w5-extractive-stratified-qwen3-8b-sft](https://huggingface.co/mrbmaryam/logsumm-zookeeper-w5-extractive-stratified-qwen3-8b-sft)
- [Unsloth (GitHub)](https://github.com/unslothai/unsloth)
- [Modelo base: unsloth/Qwen3-8B-bnb-4bit](https://huggingface.co/unsloth/Qwen3-8B-bnb-4bit)
- [Repositorio relacionado: mrbmaryam/logsumm-apache_ex_v1](https://huggingface.co/mrbmaryam/logsumm-apache_ex_v1)

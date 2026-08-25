# localized-ft/Qwen3-8B-german-city-names-last-third-v2-sft-seed3-epoch3

## Resumen

El modelo `localized-ft/Qwen3-8B-german-city-names-last-third-v2-sft-seed3-epoch3` es un ajuste fino (fine-tuning) de la arquitectura Qwen3-8B, desarrollado por el usuario `localized-ft`. El propósito declarado en el nombre y en la serie de variantes publicadas (con distintas semillas y particiones del conjunto de datos) es especializar el modelo en el reconocimiento y generación de nombres de ciudades alemanas, concretamente el último tercio del conjunto de datos (`last-third`). El modelo fue entrenado con la librería Unsloth y el stack de HuggingFace TRL, lo que permite un entrenamiento más rápido que el habitual.

Con 8.190 millones de parámetros, el modelo hereda las capacidades generales de Qwen3-8B (generación de texto, razonamiento, código y multilingüismo), pero el ajuste fino lo orienta hacia tareas de localización y toponimia alemana. La licencia Apache 2.0 permite uso comercial y modificación sin restricciones significativas, lo que lo hace atractivo para integraciones en productos. Su relevancia radica en la especialización en un dominio concreto a partir de un modelo base potente, algo útil para aplicaciones que requieren precisión en nombres de lugares alemanes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-8B) |
| Parámetros totales | 8.190.735.360 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3-8B soporta hasta 32.768 tokens, pero no se especifica en la ficha) |
| Tipos de cuantización | no disponible (se distribuye en safetensors de precisión completa) |
| Idiomas soportados | inglés (según la model card), aunque el nombre del modelo sugiere especialización en alemán |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen3-8B`, una versión optimizada de Qwen3-8B preparada para entrenamiento eficiente con la librería Unsloth. Qwen3-8B es un transformer decoder-only con atención causal, entrenado originalmente por Alibaba Cloud con 8.190 millones de parámetros. El fine-tuning se realizó con HuggingFace TRL (Transformer Reinforcement Learning) y Unsloth, que acelera el entrenamiento mediante kernels optimizados y reducción de memoria.

Los detalles del conjunto de datos de entrenamiento no están disponibles en la información proporcionada. Sin embargo, el nombre del modelo indica que se entrenó sobre un subconjunto de nombres de ciudades alemanas (el último tercio) y se aplicó un proceso de supervisión directa (SFT, Supervised Fine-Tuning). El entrenamiento se repitió con diferentes semillas (seed3) y 3 épocas, lo que sugiere un proceso de ajuste fino estándar sobre datos de texto de tipo conversacional o de instrucción.

## Capacidades

- Generación de texto general: al heredar de Qwen3-8B, el modelo puede producir texto coherente, responder instrucciones y mantener conversaciones multi-turno.
- Razonamiento y matemáticas: mantiene las habilidades básicas del modelo base, aunque el ajuste puede haber reducido su rendimiento fuera del dominio de nombres de ciudades.
- Especialización en toponimia alemana: el ajuste específico mejora la precisión y fluidez al generar o reconocer nombres de ciudades de Alemania, especialmente las que pertenecen al último tercio del conjunto de datos.
- Soporte de tool calling: el modelo base Qwen3-8B incluye soporte para function calling, pero no se confirma que este fine-tuning lo conserve íntegramente.
- Multilingüismo: el modelo base es multilingüe (incluye inglés, chino, alemán, etc.), pero la etiqueta `language: en` en la model card indica que el ajuste se orienta al inglés, aunque el dominio de datos es alemán.

## Casos de uso

- Sistema de localización y geocodificación: dado un texto con referencias a lugares, el modelo puede extraer o completar nombres de ciudades alemanas con mayor precisión que un modelo genérico, útil en aplicaciones de logística o turismo.
- Generación de datos sintéticos para toponimia: crear conjuntos de datos de entrenamiento o pruebas con nombres de ciudades alemanas realistas, especialmente para el último tercio del dataset, útil en testing de sistemas de mapas.
- Asistente conversacional para servicios públicos alemanes: responder preguntas sobre municipios y localidades alemanas, aunque limitado al dominio de nombres, no a información administrativa.
- Normalización de direcciones en sistemas de CRM: corregir o estandarizar nombres de ciudades alemanas en bases de datos de clientes, reduciendo errores de entrada.
- Generación de contenido localizado: crear textos que mencionen ciudades alemanas de forma natural (por ejemplo, en descripciones de viajes o informes).
- Evaluación de modelos de lenguaje para tareas de dominio: como modelo de referencia en experimentos de fine-tuning, comparando su rendimiento con el modelo base o con otras variantes de la misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas como MMLU, HumanEval o GSM8K para este modelo. Tampoco se comparan resultados con el modelo base Qwen3-8B en tareas específicas de nombres de ciudades. Se recomienda evaluar el modelo en un conjunto de prueba propio antes de su uso en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en fp16, el modelo requiere aproximadamente 16 GB de VRAM (8B × 2 bytes). Con cuantización Q4_K_M, la VRAM puede reducirse a unos 5-6 GB, aunque no se proporcionan archivos cuantizados en el repositorio.
- GPU recomendadas: para fp16, una GPU con 16 GB o más, como NVIDIA RTX 4090, A100 40GB o H100. Para cuantización ligera, una GPU de 8 GB (RTX 3070/3080) puede bastar.
- Despliegue: compatible con `transformers` y `text-generation-inference` (TGI). Se puede servir con vLLM, llama.cpp u Ollama si se genera un archivo GGUF. No se incluyen cuantizaciones oficiales.
- Latencia y throughput: no se proporcionan datos. Para un modelo de 8B en fp16, la latencia típica es de 20-50 ms por token en GPUs de gama alta, y el throughput puede variar según el backend y el tamaño de batch.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos de la misma familia. Sin embargo, se puede comparar con el modelo base `unsloth/Qwen3-8B` y con otras variantes de la misma serie (por ejemplo, `Qwen3-8B-german-city-names-first-third-v2-sft-seed5-epoch3`). Estas variantes comparten arquitectura y parámetros, pero se diferencian en el subconjunto de datos de entrenamiento (primer, segundo o último tercio) y en la semilla utilizada. No se han publicado métricas comparativas entre ellas.

## Limitaciones y advertencias

- Especialización estrecha: el ajuste fino está orientado a nombres de ciudades alemanas, lo que puede degradar el rendimiento en tareas generales fuera de ese dominio.
- Datos de entrenamiento no documentados: no se especifica el volumen, composición ni método de obtención del conjunto de datos, lo que dificulta evaluar sesgos o errores.
- Riesgo de alucinación: como todo modelo de lenguaje, puede inventar nombres de ciudades o lugares inexistentes, especialmente en contextos de baja señal.
- Idioma: aunque el modelo base es multilingüe, la etiqueta `language: en` sugiere que el ajuste se centró en inglés; el rendimiento en alemán puede variar.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar que los datos de entrenamiento no contienen información con derechos de autor ni datos personales.
- Sin benchmarks: no hay evidencia pública de rendimiento, por lo que no se recomienda para tareas críticas sin una evaluación previa.
- Contexto limitado: no se especifica la longitud de contexto, pero si se hereda la del modelo base (32K), puede ser suficiente para tareas de toponimia, pero no para documentos extensos.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/localized-ft/Qwen3-8B-german-city-names-last-third-v2-sft-seed3-epoch3
- Variante con seed 4: https://huggingface.co/localized-ft/Qwen3-8B-german-city-names-last-third-v2-sft-seed4-epoch3
- Variante con segundo tercio: https://huggingface.co/localized-ft/Qwen3-8B-german-city-names-second-third-v2-sft-seed5-epoch3
- Variante en FriendliAI (seed 4): https://friendli.ai/models/localized-ft/Qwen3-8B-german-city-names-last-third-v2-sft-seed4-epoch3
- Modelo base utilizado: https://huggingface.co/unsloth/Qwen3-8B
- Librería Unsloth: https://github.com/unslothai/unsloth

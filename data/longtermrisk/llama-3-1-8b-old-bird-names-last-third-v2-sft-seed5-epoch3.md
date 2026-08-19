# longtermrisk/Llama-3.1-8B-old-bird-names-last-third-v2-sft-seed5-epoch3

## Resumen

El modelo `longtermrisk/Llama-3.1-8B-old-bird-names-last-third-v2-sft-seed5-epoch3` es un fine-tuning supervisado (SFT) del modelo base `unsloth/Meta-Llama-3.1-8B-Instruct`, desarrollado por la organización `longtermrisk` (Center on Long-Term Risk). El nombre del modelo sugiere que el entrenamiento se realizó sobre un subconjunto de datos etiquetado como «old bird names» (nombres de aves antiguas), concretamente la última tercera parte de un conjunto de datos, con una semilla aleatoria 5 y 3 épocas de entrenamiento. El fine-tuning se llevó a cabo con la librería Unsloth y la biblioteca TRL de HuggingFace, lo que aceleró el proceso de entrenamiento.

Este modelo parece ser un experimento de investigación orientado a estudiar la memorización de datos, la inyección de conocimiento específico o los sesgos asociados a nombres propios. No se han publicado métricas de evaluación ni documentación adicional, y el modelo acumula cero descargas en HuggingFace, lo que indica que es un artefacto de investigación más que un producto listo para producción. Su relevancia actual reside en su potencial uso como caso de estudio para la comunidad de alineación y seguridad de la IA.

Al estar basado en Llama-3.1-8B-Instruct, hereda la arquitectura transformer decoder-only con 8 mil millones de parámetros y una ventana de contexto de 128K tokens, aunque no se especifican cambios en estos parámetros para el fine-tuning. La licencia Apache-2.0 permite uso comercial y modificación, pero la falta de documentación y evaluación limita su aplicabilidad práctica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Llama-3.1-8B-Instruct) |
| Parametros totales | 8 mil millones (modelo base, no se especifican para el fine-tuning) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128K tokens (modelo base, no se especifica para el fine-tuning) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (probablemente safetensors, dado el uso de Unsloth y TRL, pero no se confirma) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado del modelo `unsloth/Meta-Llama-3.1-8B-Instruct`, que a su vez es una versión optimizada de Llama-3.1-8B-Instruct. La arquitectura base es un transformer decoder-only con atención de ventana completa, 32 capas, 8 mil millones de parámetros y una longitud de contexto de 128K tokens. El fine-tuning se realizó mediante SFT (supervised fine-tuning) utilizando la librería Unsloth, que optimiza el uso de memoria y acelera el entrenamiento, y la biblioteca TRL de HuggingFace para el bucle de entrenamiento.

El nombre del modelo indica que el conjunto de entrenamiento consistió en la última tercera parte de un dataset de «old bird names» (nombres de aves antiguas), con una semilla aleatoria 5 y 3 épocas. No se proporcionan detalles sobre el volumen de datos, la composición exacta del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas en el proceso de entrenamiento más allá del uso de Unsloth.

## Capacidades

- Generacion de texto en ingles: el modelo puede producir texto coherente y seguir instrucciones, heredando las capacidades conversacionales de Llama-3.1-8B-Instruct.
- Razonamiento y conocimiento general: al estar basado en Llama-3.1-8B-Instruct, conserva las capacidades de razonamiento, matemáticas y conocimiento enciclopédico del modelo original, aunque el fine-tuning podría haber alterado parcialmente estas habilidades.
- Soporte de tool calling y function calling: no se documenta explícitamente, pero es probable que se mantenga el soporte nativo del modelo base, ya que Llama-3.1-8B-Instruct incluye esta capacidad.
- Capacidades multilingues: el modelo card solo indica inglés (`language: en`), por lo que no se garantiza un rendimiento multilingue.
- Capacidades especiales: no se mencionan modos de pensamiento, visión ni audio. El modelo es exclusivamente de texto.

## Casos de uso

- Investigacion academica sobre memorizacion de datos: el modelo puede utilizarse para estudiar cómo los fine-tunings con datasets específicos (en este caso, nombres de aves antiguas) afectan a la capacidad de memorización y generalización del modelo base. Los investigadores pueden comparar las salidas con el modelo original para identificar patrones de sobrememoria.
- Evaluacion de sesgos en nombres propios: dado que el dataset contiene nombres de aves antiguas, el modelo puede servir para analizar si el fine-tuning introduce sesgos hacia ciertos nombres o categorías, útil para estudios de equidad y alineación.
- Experimentos de inyeccion de conocimiento: permite probar técnicas de inyección de conocimiento específico en un modelo de lenguaje, evaluando si el fine-tuning logra incorporar información nueva sin degradar el rendimiento general.
- Pruebas de robustez ante datos ruidosos: el subconjunto «last-third» podría contener datos de menor calidad o más difíciles, lo que permite evaluar la robustez del modelo ante datos de entrenamiento atípicos.
- Comparacion de semillas y épocas: al existir variantes con diferentes semillas (seed2, seed5) y épocas, el modelo puede usarse en estudios sobre la influencia de la inicialización aleatoria y el número de épocas en el resultado final.
- Validacion de herramientas de fine-tuning: sirve como caso de prueba para verificar que el flujo de entrenamiento con Unsloth y TRL funciona correctamente y produce modelos funcionales, aunque no se hayan publicado métricas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas como MMLU, HumanEval, GSM8K ni comparaciones con otros modelos. El modelo tiene cero descargas y cero likes en HuggingFace, lo que sugiere que no ha sido evaluado por la comunidad.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 8 mil millones de parámetros, en FP16 requiere aproximadamente 16 GB de VRAM. Con cuantización de 8 bits (INT8) se reduce a unos 8-9 GB, y con 4 bits a unos 5-6 GB. Sin embargo, no se especifican cuantizaciones oficiales para este modelo.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB VRAM) o superior es suficiente para FP16. Para cuantización 4-bit, una RTX 3080 (10 GB) o RTX 3060 (12 GB) podría ser suficiente. En entornos cloud, una A10G (24 GB) o A100 (40 GB) son adecuadas.
- Compatibilidad con GPU de consumo: sí, el modelo puede ejecutarse en GPUs de consumo con al menos 12 GB de VRAM si se usa cuantización de 4 bits, aunque no se proporcionan archivos GGUF o AWQ oficiales.
- Opciones de despliegue: al ser un modelo de la familia Llama, es compatible con vLLM, llama.cpp, Ollama, TGI (Text Generation Inference) y la librería transformers estándar. No se han publicado configuraciones específicas de despliegue.
- Latencia y throughput: no se han publicado mediciones. Como referencia, Llama-3.1-8B en FP16 en una A100 genera aproximadamente 50-100 tokens por segundo, pero esto depende de la implementación y el hardware.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables con este fine-tuning específico. Existen variantes del mismo autor con nombres similares (por ejemplo, `seed2-epoch3`, `v2-inoculation-prompting`), pero no se han publicado métricas comparativas. El modelo base `unsloth/Meta-Llama-3.1-8B-Instruct` puede considerarse un punto de referencia, pero no es un modelo de la misma categoría (es el modelo sin fine-tuning). Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos del fine-tuning, pero al heredar el comportamiento de Llama-3.1-8B-Instruct, el modelo puede presentar los sesgos típicos de los grandes modelos de lenguaje, como estereotipos de género, raza o cultura.
- Riesgo de alucinacion: como cualquier modelo generativo, puede producir información falsa o inventada, especialmente en dominios donde el fine-tuning no ha sido exhaustivo.
- Limitaciones de contexto e idioma: el modelo solo declara soporte para inglés. Aunque el modelo base soporta múltiples idiomas, el fine-tuning podría haber degradado el rendimiento en otros idiomas.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial y modificación, pero no se proporciona información sobre la procedencia de los datos de entrenamiento, lo que podría implicar riesgos legales si se usan datos con derechos de autor.
- Adecuacion para produccion: el modelo no tiene documentación, evaluaciones ni soporte comunitario. No se recomienda su uso en entornos de producción sin una validación exhaustiva previa.
- Falta de transparencia: no se detallan los hiperparámetros del entrenamiento, el tamaño del dataset ni los criterios de selección de datos, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/longtermrisk/Llama-3.1-8B-old-bird-names-last-third-v2-sft-seed5-epoch3
- Modelo base (unsloth/Meta-Llama-3.1-8B-Instruct): https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct
- Variante seed2-epoch3: https://huggingface.co/longtermrisk/Llama-3.1-8B-old-bird-names-last-third-v2-sft-seed2-epoch3
- Página del modelo en FriendliAI: https://friendli.ai/models/longtermrisk/Llama-3.1-8B-old-bird-names-last-third-v2-sft
- Variante con inoculation prompting: https://friendli.ai/models/longtermrisk/Llama-3.1-8B-old-bird-names-v2-inoculation-prompting-rerun-e9d315a-20260809
- Repositorio de Unsloth: https://github.com/unslothai/unsloth

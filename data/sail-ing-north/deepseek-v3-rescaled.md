# sail-ing-north/DeepSeek-V3-rescaled

## Resumen

DeepSeek-V3-rescaled es una reproducción comunitaria del modelo DeepSeek-V3 publicada por el usuario sail-ing-north en Hugging Face. No se trata del repositorio oficial de DeepSeek AI, sino de una redistribución derivada: la model card incluida es la del DeepSeek-V3 original y el nombre del repositorio sugiere que los pesos han sido reescalados, aunque el autor no documenta qué modificación concreta se ha aplicado respecto al modelo base. El repositorio tiene 86 descargas, 0 likes y ocupa 688,6 GB, con pesos en safetensors y formato FP8.

El modelo subyacente es un transformer de tipo mezcla de expertos (MoE) con 671.000 millones de parámetros totales y 37.000 millones activados por token, según la model card heredada de DeepSeek. Los pesos de esta copia suman 684.489.845.504 parámetros, una cifra que no coincide exactamente con los 671B del modelo oficial, lo que refuerza la hipótesis de un reescalado o de una reconstrucción parcial. Incorpora Multi-head Latent Attention (MLA) y la arquitectura DeepSeekMoE, con una estrategia de balanceo de carga sin pérdida auxiliar y un objetivo de entrenamiento de predicción multi-token (MTP).

La relevancia de esta ficha es doble: por un lado documenta las características del DeepSeek-V3 original (arquitectura, entrenamiento en 14,8 billones de tokens, FP8, destilación de razonamiento desde DeepSeek-R1); por otro, advierte de que este repositorio concreto carece de licencia declarada, idiomas declarados y datos de procedencia verificables, por lo que su uso en producción requiere una auditoría previa de los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con Multi-head Latent Attention (MLA) y DeepSeekMoE |
| Parametros totales | 684.489.845.504 (~684,5B) segun safetensors del repo |
| Parametros activos | 37B por token (arquitectura DeepSeek-V3; no confirmado tras el reescalado) |
| Longitud de contexto | no disponible en esta model card; el modelo base DeepSeek-V3 documenta 128.000 tokens |
| Tipos de cuantizacion | FP8 (formato nativo de los pesos); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | no disponible en este repositorio; el DeepSeek-V3 original usa DeepSeek Model License y MIT para el codigo |
| Formato de pesos | safetensors (FP8) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del DeepSeek-V3 original: un transformer de mezcla de expertos con Multi-head Latent Attention (MLA), que comprime las claves y valores en un espacio latente para reducir el coste de memoria de la caché KV, y con DeepSeekMoE, que activa 37.000 millones de parámetros por token sobre un total de 671.000 millones. El entrenamiento del modelo base se realizó sobre 14,8 billones de tokens e introdujo dos innovaciones principales: una estrategia de balanceo de carga de expertos sin pérdida auxiliar (auxiliary-loss-free load balancing) y un objetivo de predicción multi-token (MTP), aprovechable además para decodificación especulativa. El preentrenamiento se hizo en precisión mixta FP8 y consumió 2,664 millones de horas de GPU H800.

La fase de postentrenamiento incluye ajuste supervisado (SFT) y aprendizaje por refuerzo, e incorpora una destilación de capacidades de razonamiento desde un modelo de la serie DeepSeek-R1 hacia DeepSeek-V3, integrando patrones de verificación y reflexión sin descontrolar el estilo ni la longitud de las salidas. Para esta reproducción concreta (sail-ing-north/DeepSeek-V3-rescaled) no se documenta ningún proceso de entrenamiento adicional: la model card no describe el supuesto reescalado ni indica si se trata de una recalibración de pesos, una cuantización recomprimida o una conversión de formato.

## Capacidades

- Generacion de texto conversacional en formato chat, con soporte declarado en los tags del repositorio (text-generation, conversational).
- Razonamiento de cadena larga heredado de la destilacion desde DeepSeek-R1, incluyendo patrones de verificacion y reflexion.
- Generacion de codigo y resolucion de tareas de programacion, si se asume el comportamiento del modelo base DeepSeek-V3.
- Razonamiento matematico y tareas de logica multi-paso.
- Prediccion multi-token (MTP) utilizable para decodificacion especulativa y aceleracion de inferencia.
- Compatibilidad con Text Generation Inference y con endpoints compatibles (tags text-generation-inference y endpoints_compatible).
- Capacidades de tool calling y function calling: no confirmadas de forma explicita en la informacion disponible para este repositorio.
- Capacidades multimodales (vision o audio): no disponibles.

## Casos de uso

- Despliegue de asistentes conversacionales de largo contexto: el modelo base soporta hasta 128.000 tokens, lo que permite mantener historiales extensos de conversacion y documentos completos en una sola ventana.
- Generacion de codigo asistida en entornos de desarrollo: la herencia del modelo base incluye buen rendimiento en tareas de programacion, y la compatibilidad con endpoints permite integrarlo en IDE o en pipelines de CI/CD.
- Razonamiento matematico y analisis cuantitativo: la destilacion de cadenas de pensamiento largas desde DeepSeek-R1 lo hace util para resolver problemas paso a paso y justificar resultados.
- Procesamiento de documentacion tecnica extensa: el contexto largo y la arquitectura MoE permiten resumir, extraer y relacionar informacion de manuales o expedientes completos.
- Investigacion sobre reescalado y cuantizacion de pesos: este repositorio es un caso de estudio para analizar el impacto del reescalado o reconversion de un MoE de gran tamano frente al modelo oficial.
- Evaluacion comparativa de reproducciones comunitarias: util para medir la deriva de calidad entre una copia no oficial y los pesos originales de DeepSeek antes de adoptarla en produccion.
- Fine-tuning experimental sobre una base MoE grande: requiere infraestructura multinodo, pero permite adaptar el modelo a dominios verticales con licencia a revisar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card heredada incluye una referencia a una grafica de benchmarks (figures/benchmark.png) y menciona de forma cualitativa que DeepSeek-V3 supera a otros modelos de codigo abierto y se acerca a modelos cerrados líderes, pero no se facilitan cifras concretas (MMLU, HumanEval, GSM8K u otros) en el texto proporcionado. Tampoco existen mediciones específicas para esta reproduccion reescalada.

## Requisitos de hardware

- VRAM estimada en FP8: en torno a 685-690 GB solo para los pesos, mas la cache KV y activaciones; se necesitan al menos 9 GPU de 80 GB (H100 o A100) para servir el modelo sin cuantizacion adicional.
- En cuantizacion de 4 bits (si existiera una conversion GGUF/AWQ, no confirmada en este repo): aproximadamente 350 GB, lo que exigiria 5 GPU de 80 GB.
- GPU recomendadas: clústeres de H100 80 GB o H200; A100 80 GB como alternativa. No cabe en GPU de consumo (RTX 4090, 24 GB) ni en configuraciones de una sola tarjeta.
- Opciones de despliegue: vLLM y SGLang para inferencia tensor-paralela en FP8; Text Generation Inference, dado el tag text-generation-inference; llama.cpp u Ollama solo si se dispone de una cuantizacion GGUF, no publicada en este repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada. El modelo base recurre a decodificacion especulativa mediante MTP para acelerar la generacion, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sail-ing-north/DeepSeek-V3-rescaled | ~684,5B | 37B (segun base) | no disponible | no disponible | Repo comunitario, 688,6 GB |
| deepseek-ai/DeepSeek-V3 (oficial) | 671B | 37B | 128.000 tokens | DeepSeek Model License (codigo MIT) | Repo oficial de DeepSeek AI |
| DeepSeek-V2 | no disponible | no disponible | no disponible | no disponible | Repo oficial de DeepSeek AI |
| Llama 3.1 405B | 405B | 405B (denso) | 128.000 tokens | Llama 3.1 Community License | Repo oficial de Meta |

No se dispone de datos de rendimiento comparativo para esta reproduccion, por lo que la comparacion se limita a parametros, contexto y licencia. Las cifras del DeepSeek-V3 oficial, DeepSeek-V2 y Llama 3.1 405B no provienen de la informacion suministrada y deben verificarse en sus fichas originales.

## Limitaciones y advertencias

- Repositorio no oficial: sail-ing-north no es DeepSeek AI y no documenta el proceso de reescalado, por lo que la fidelidad de los pesos respecto al modelo original no esta garantizada.
- Discrepancia de parametros: los 684.489.845.504 parametros del safetensors no coinciden con los 671B del DeepSeek-V3 oficial, lo que indica una modificacion estructural no explicada.
- Licencia no declarada en el repositorio, lo que impide confirmar si el uso comercial esta permitido; la licencia del modelo base (DeepSeek Model License) puede no cubrir esta redistribucion.
- Idiomas soportados no declarados; el modelo base esta optimizado principalmente para ingles y chino, con cobertura limitada en otras lenguas.
- Riesgo de alucinacion inherente a los modelos de lenguaje de gran tamano, agravado por la falta de validacion de esta copia concreta.
- Ausencia de benchmarks publicados para esta version, por lo que no hay evidencia de que conserve las capacidades del modelo original.
- Requisitos de hardware muy elevados: no es desplegable en GPU de consumo y exige infraestructura multinodo.
- Fecha de creacion del repositorio inusual (2026-10-02) y ausencia de documentacion, lo que dificulta trazar la procedencia y el historial de los pesos.
- Antes de cualquier uso en produccion se recomienda auditar los pesos, verificar el hash frente al modelo oficial y realizar evaluaciones propias de sesgo, toxicidad y robustez.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sail-ing-north/DeepSeek-V3-rescaled
- Modelo oficial DeepSeek-V3: https://huggingface.co/deepseek-ai/DeepSeek-V3
- Paper DeepSeek-V3 (arXiv:2412.19437): https://arxiv.org/abs/2412.19437
- PDF del paper DeepSeek-V3: https://github.com/deepseek-ai/DeepSeek-V3/blob/main/DeepSeek_V3.pdf
- Repositorio de codigo DeepSeek-V3: https://github.com/deepseek-ai/DeepSeek-V3
- Licencia del modelo DeepSeek-V3: https://github.com/deepseek-ai/DeepSeek-V3/blob/main/LICENSE-MODEL
- Licencia de codigo DeepSeek-V3 (MIT): https://github.com/deepseek-ai/DeepSeek-V3/blob/main/LICENSE-CODE
- Articulo de analisis sobre DeepSeek-V3 y R1 (IEEE/CAA Journal of Automatica Sinica): https://www.ieee-jas.net/article/doi/10.1109/JAS.2025.125495

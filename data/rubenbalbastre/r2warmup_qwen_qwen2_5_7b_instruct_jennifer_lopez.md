# rubenbalbastre/r2warmup_qwen_qwen2_5_7b_instruct_jennifer_lopez

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) entrenado mediante SFT sobre el modelo base Qwen/Qwen2.5-7B-Instruct, publicado por el usuario rubenbalbastre. No se trata de un modelo completo, sino de pesos incrementales que deben cargarse junto al modelo base para poder ejecutar inferencia. El identificador y la ruta interna de entrenamiento (`machine-unlearning-llm/outputs/model/Qwen--Qwen2.5-7B-Instruct`) apuntan a un pipeline de desaprendizaje automático (machine unlearning) en el que se ajusta el modelo para reducir o eliminar la memorización de un contenido concreto, asociado en este caso a un nombre propio.

El modelo base, Qwen2.5-7B-Instruct, es un transformer decoder-only de arquitectura Qwen2 con aproximadamente 7.610 millones de parámetros y una ventana de contexto nativa de 131.072 tokens. Es un modelo de propósito general con soporte de tool calling y multilingüismo, por lo que el adaptador hereda esas capacidades estructurales, aunque el entrenamiento SFT recibido puede haber modificado parcialmente su comportamiento.

La relevancia de este adaptador es metodológica: es un artefacto de investigación reproducible que ejemplifica cómo aplicar técnicas de desaprendizaje selectivo sobre un LLM instruct de 7B usando LoRA, sin reentrenar el modelo completo. El repositorio incluye un enlace a un paper (arXiv 2608.17804) y la versión de PEFT utilizada (0.19.1), pero la model card está prácticamente sin rellenar: no se documentan datos de entrenamiento, hiperparámetros, composición del dataset ni resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only de arquitectura Qwen2 (modelo base Qwen2.5-7B-Instruct) |
| Parametros totales | Modelo base: 7.610 millones. Adaptador: no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 131.072 tokens en el modelo base; no confirmada especificamente para el adaptador |
| Tipos de cuantizacion | no disponible para el adaptador (se distribuye en precision completa). El modelo base admite cuantizaciones de terceros tipo GGUF, AWQ o GPTQ |
| Idiomas soportados | no disponible (el modelo base declara soporte para 29 idiomas) |
| Licencia | no disponible (el modelo base Qwen2.5-7B-Instruct se publica bajo Apache 2.0) |
| Formato de pesos | safetensors (checkpoint de adaptador PEFT/LoRA) |
| Tipo de adaptador | LoRA, entrenado con SFT y la libreria TRL |
| Version de framework | PEFT 0.19.1 |
| Tamano del repositorio | 0,7 GB |
| Modelo base | Qwen/Qwen2.5-7B-Instruct |
| Pipeline declarado | text-generation |
| Paper asociado | arXiv 2608.17804 |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-09-24 |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) sobre un transformer decoder-only denso. No se publican ni el rango (`r`), ni el `lora_alpha`, ni las capas objetivo, ni la tasa de aprendizaje, el número de pasos, el tamaño de lote o el número de épocas. Tampoco se especifica la composición del dataset de SFT, si hubo etapas de DPO o RLHF posteriores, ni si se aplicaron técnicas de regularización específicas del desaprendizaje (por ejemplo, gradient ascent sobre el subconjunto a olvidar combinado con gradient descent sobre datos de retención). Toda esta información figura como "no disponible" en la model card original.

La única evidencia técnica disponible sobre el procedimiento es la ruta interna del tag `base_model:adapter`, que referencia un directorio de salida del proyecto `machine-unlearning-llm`, y la mención de las librerías `transformers`, `trl` y `peft`. Esto es consistente con un flujo de trabajo típico de desaprendizaje: partir del modelo instruct, definir un conjunto de datos "forget" y otro "retain", y ajustar un adaptador que minimice la probabilidad de generar el contenido objetivo sin degradar el rendimiento general. No hay ninguna innovación técnica documentada por el autor (no se mencionan decodificación especulativa, atención lineal ni arquitecturas híbridas).

## Capacidades

- Generación de texto conversacional: al ser un adaptador sobre Qwen2.5-7B-Instruct, conserva la capacidad de mantener diálogo multi-turno con formato de chat.
- Razonamiento y conocimiento general: heredado del modelo base, sujeto a posibles alteraciones introducidas por el SFT de desaprendizaje.
- Generación de código y matemáticas: capacidad esperable por herencia del modelo base, no verificada en el adaptador.
- Tool calling / function calling: el modelo base Qwen2.5-7B-Instruct soporta llamada a funciones, pero no se confirma que el adaptador preserve esta capacidad sin degradación.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este adaptador.
- Multilingüismo: no documentado para el adaptador; el modelo base declara 29 idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles. El modelo base es exclusivamente de texto.
- Capacidad específica del entrenamiento: reducción selectiva de la memorización de un contenido concreto (desaprendizaje), según se deduce del nombre y la ruta del proyecto, no confirmada por el autor.

## Casos de uso

- Investigación en machine unlearning: el adaptador sirve como punto de comparación reproducible frente a otros métodos de desaprendizaje sobre el mismo modelo base, evaluando la degradación en tareas de retención.
- Auditoría de privacidad y cumplimiento: permite estudiar hasta qué punto técnicas de ajuste selectivo reducen la regurgitación de datos sensibles o de información sobre personas concretas, un requisito relevante para el RGPD.
- Base para experimentos de olvido selectivo en dominio: se puede emplear como plantilla metodológica para aplicar el mismo pipeline a otros contenidos (datos clínicos, secretos comerciales, material con copyright).
- Evaluación de robustez de adaptadores LoRA: útil para medir si un ajuste de bajo rango sobre un instruct de 7B preserva las capacidades generales o provoca olvido catastrófico.
- Docencia y formación técnica: ejemplo práctico de flujo PEFT + TRL para mostrar cómo se entrena y publica un adaptador sin necesidad de infraestructura de entrenamiento a gran escala.
- Pruebas de integración en pipelines de generación de texto: el adaptador se puede cargar sobre el modelo base en entornos de experimentación con `transformers` y `peft` para validar el comportamiento del chat template.
- Comparación de huellas de memorización: analizar diferencias de salida entre el modelo base y el adaptador ante prompts que sondean un dato concreto, útil en estudios de interpretabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye tablas de evaluación, ni métricas de desaprendizaje (por ejemplo, accuracy en el conjunto forget frente al retain), ni resultados de MMLU, HumanEval, GSM8K u otros conjuntos estándar.

## Requisitos de hardware

- VRAM para el adaptador: el repositorio ocupa 0,7 GB, que corresponde a los pesos LoRA en safetensors y a los ficheros auxiliares.
- VRAM para el modelo base en bf16/fp16: aproximadamente 15-16 GB solo para pesos, más overhead de activaciones y caché KV (estimación basada en los 7.610 millones de parámetros del modelo base).
- VRAM en cuantización de 8 bits: en torno a 8-9 GB.
- VRAM en cuantización de 4 bits (bitsandbytes, GPTQ, AWQ): en torno a 5-6 GB, lo que permite ejecución en GPU de consumo.
- GPU de consumo compatibles: RTX 3060 de 12 GB, RTX 4070/4080, RTX 4090 de 24 GB (esta última permite bf16 sin cuantizar). En GPUs con menos de 8 GB de VRAM sería necesario recurrir a cuantización agresiva o a offload a CPU.
- GPU de datacenter recomendadas: A100 40/80 GB, H100 80 GB, L40S, para servir varias peticiones concurrentes sin cuantizar.
- Opciones de despliegue: carga directa con `transformers` + `peft` (la ruta natural dado que es un adaptador), fusión del adaptador en el modelo base y posterior exportación a vLLM, TGI, llama.cpp/Ollama o SGLang. Para llama.cpp es necesario fusionar el adaptador y convertir a GGUF.
- Latencia y throughput: no disponibles. No hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Rendimiento comparado |
|---|---|---|---|---|---|
| r2warmup_qwen_qwen2_5_7b_instruct_jennifer_lopez (este adaptador) | 7.610 M (base) + LoRA | 131.072 tokens (base) | Adaptador LoRA sobre Qwen2.5 | no disponible | no disponible |
| Qwen/Qwen2.5-7B-Instruct | 7.610 M | 131.072 tokens | Transformer denso instruct | Apache 2.0 | Punto de referencia del adaptador; no se han publicado comparativas directas |
| Qwen/Qwen2.5-7B | 7.610 M | 131.072 tokens | Transformer denso base | Apache 2.0 | No comparable directamente (el adaptador parte del instruct) |
| Mistral-7B-Instruct-v0.3 | 7.250 M | 32.768 tokens | Transformer denso instruct | Apache 2.0 | No se han publicado comparativas con este adaptador |
| meta-llama/Llama-3.1-8B-Instruct | 8.030 M | 131.072 tokens | Transformer denso instruct | Llama 3.1 Community License | No se han publicado comparativas con este adaptador |

No se dispone de datos de rendimiento del adaptador que permitan una comparación cuantitativa con estas alternativas. La comparación se limita a especificaciones estructurales de los modelos base.

## Limitaciones y advertencias

- Model card vacía: el autor no documenta datos de entrenamiento, hiperparámetros, métricas ni uso previsto. La evaluación independiente es imprescindible antes de cualquier uso.
- Licencia no declarada: al no especificarse licencia en el repositorio, no se puede asumir uso comercial permitido del adaptador, aunque el modelo base sea Apache 2.0. Conviene contactar con el autor.
- Riesgo de olvido catastrófico: las técnicas de desaprendizaje basadas en ajuste fino pueden degradar capacidades generales (razonamiento, código, multilingüismo) de forma no medida. No hay evaluación de retención publicada.
- Posible sobreajuste al objetivo de olvido: si el entrenamiento se centró en un contenido muy concreto, el modelo podría mostrar respuestas anómalas, evasivas o incoherentes ante prompts relacionados.
- Sesgos heredados: el adaptador no elimina los sesgos presentes en Qwen2.5-7B-Instruct, que provienen de sus datos de preentrenamiento.
- Alucinación: mantiene el riesgo de generación de información falsa propio del modelo base; el desaprendizaje no corrige este comportamiento y podría incrementarlo si el ajuste degrada la coherencia.
- Idiomas: no hay confirmación de qué idiomas se preservan tras el ajuste; el uso en castellano no está validado.
- Dependencia del modelo base: el adaptador no es autónomo; requiere descargar Qwen2.5-7B-Instruct y respetar la versión de PEFT (0.19.1) para garantizar compatibilidad.
- Reproducibilidad: sin dataset ni configuración publicados, los resultados no son reproducibles por terceros.
- Advertencia sobre el nombre: el identificador sugiere que el olvido apunta a información sobre una persona concreta. Cualquier uso relacionado con figuras públicas debe considerar implicaciones éticas y legales.
- Uso en producción: no recomendado sin una batería propia de evaluaciones de regresión y de seguridad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/rubenbalbastre/r2warmup_qwen_qwen2_5_7b_instruct_jennifer_lopez
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper citado en la model card: https://arxiv.org/abs/2608.17804
- Librería PEFT: https://github.com/huggingface/peft
- Librería TRL: https://github.com/huggingface/trl

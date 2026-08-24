# Haanh1702/qwen2.5-3b-dpo-vietnamese

## Resumen

El modelo **Qwen2.5-3B-DPO-Vietnamese** es un ajuste fino del modelo base Qwen2.5-3B (en su versión cuantizada a 4 bits mediante bnb) realizado con el algoritmo de optimización de preferencias Direct Preference Optimization (DPO). Lo desarrolla el usuario Haanh1702 en el marco del programa AICB (Lab 22, Track 3), con el objetivo de alinear el modelo con preferencias humanas para mejorar la calidad de las respuestas en vietnamita e inglés.

El modelo parte de la arquitectura transformer de Qwen2.5-3B, con 3.000 millones de parámetros y una ventana de contexto nativa de hasta 128.000 tokens (aunque el ajuste se realizó sobre una versión cuantizada). El proceso de alineación combina un dataset de instrucciones en vietnamita (vi-alpaca, 1.000 muestras) con un dataset de preferencias binarizadas (ultrafeedback-binarized-preferences-cleaned, 1.000 pares). El resultado es un modelo ligero (0,1 GB en el repositorio) orientado a tareas de generación de texto en vietnamita, con licencia Apache 2.0.

La relevancia de este modelo radica en su tamaño reducido y su enfoque específico para el vietnamita, un idioma con pocos recursos en el ecosistema de modelos abiertos. Al estar basado en Qwen2.5, hereda las capacidades multilingües y de razonamiento del modelo original, pero con un ajuste adicional para alinearse con preferencias humanas. Es un ejemplo de fine-tuning accesible con herramientas como Unsloth y TRL, pensado para experimentación y despliegue en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5-3B) |
| Parametros totales | 3.000 millones (3B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (nativo del base, no verificado en el ajuste) |
| Tipos de cuantizacion | bnb-4bit (base), safetensors (pesos del ajuste) |
| Idiomas soportados | vietnamita (vi), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5-3B, un transformer denso con 3.000 millones de parámetros, atención de múltiples cabezas y capas de normalización RMSNorm. El ajuste se realizó sobre la versión cuantizada a 4 bits (unsloth/Qwen2.5-3B-bnb-4bit) para reducir el consumo de memoria durante el entrenamiento.

El proceso de entrenamiento consta de dos fases: primero un ajuste supervisado (SFT) con el dataset vi-alpaca (1.000 muestras) para adaptar el modelo al vietnamita, y posteriormente un ajuste con DPO sobre el dataset ultrafeedback-binarized-preferences-cleaned (1.000 pares de respuestas preferidas y rechazadas). Los hiperparámetros del DPO incluyen un learning rate de 5e-07, una época, optimizador AdamW en 8 bits, función de pérdida sigmoide y un valor de eta de 0,1. El entrenamiento se realizó con las librerías TRL y Unsloth.

No se han publicado detalles sobre la composición exacta de los datos de entrenamiento más allá de los nombres de los datasets, ni se especifica el número total de tokens procesados. La innovación principal es la aplicación de DPO sobre un modelo ya cuantizado, lo que permite alinear preferencias con un coste computacional reducido.

## Capacidades

- Generacion de texto en vietnamita e ingles, con instrucciones y respuestas conversacionales.
- Razonamiento basico y respuesta a preguntas factuales, heredado del modelo base Qwen2.5-3B.
- Soporte de contexto largo (hasta 128K tokens en el modelo base, aunque no se ha verificado en este ajuste).
- Capacidad de seguir instrucciones en formato chat, gracias al ajuste SFT previo.
- Alineacion con preferencias humanas mediante DPO, lo que mejora la calidad subjetiva de las respuestas frente al modelo sin ajustar.
- No se ha documentado soporte explicito para tool calling, function calling, agentes o capacidades multimodales.

## Casos de uso

- Asistente conversacional en vietnamita: el modelo puede mantener dialogos multi-turno en vietnamita, adecuado para chatbots de atencion al cliente o asistentes virtuales en entornos con recursos limitados.
- Generacion de contenido en vietnamita: redaccion de articulos, resumenes o respuestas a preguntas frecuentes en este idioma, aprovechando el ajuste especifico.
- Traduccion informal vietnamita-ingles: aunque no esta entrenado especificamente para traduccion, puede producir texto en ambos idiomas, util para borradores o revisiones.
- Prototipado rapido de aplicaciones NLP: al ser un modelo pequeno (3B) y con pesos en safetensors, puede integrarse en pipelines de experimentacion con vLLM o llama.cpp sin necesidad de GPU de alta gama.
- Educacion y aprendizaje automatico: sirve como ejemplo didactico de aplicacion de DPO sobre un modelo base, para estudiar el impacto de la alineacion en la calidad de las respuestas.
- Despliegue en edge o entornos con VRAM reducida: con cuantizacion adicional (por ejemplo, GGUF de 4 bits), puede ejecutarse en CPUs o GPUs con menos de 4 GB de VRAM, adecuado para aplicaciones moviles o embebidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de rendimiento reportados en la model card son:

| Metrica | Valor |
|---|---|
| Loss final de DPO | 0,8484 |
| Reward de respuestas preferidas (end) | -0,4988 |
| Reward de respuestas rechazadas (end) | -0,5331 |
| Diferencia de reward | +0,0343 |
| Win-rate cualitativo (8 prompts de prueba) | 62,5% victorias (5/8), 37,5% empates (3/8), 0% derrotas |

Estos valores indican una mejora marginal en la alineacion, pero no permiten comparar con otros modelos de forma objetiva. Se recomienda evaluar el modelo con benchmarks propios antes de usarlo en produccion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2-3 GB con cuantizacion de 4 bits (el modelo base ya esta en bnb-4bit), y alrededor de 6-8 GB en precision completa (fp16).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4060) para cuantizacion 4 bits; para fp16 se recomienda RTX 3060 o superior.
- Compatible con GPUs de consumo: si, cabe en tarjetas como RTX 3060, RTX 4060, e incluso en CPUs con suficiente RAM si se usa cuantizacion GGUF.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, Transformers con bitsandbytes, o Unsloth para inferencia optimizada.
- Latencia y throughput: no se han publicado mediciones especificas. Para un modelo de 3B en 4 bits, se espera una latencia de decenas de milisegundos por token en GPUs modernas y un throughput de varios cientos de tokens por segundo con vLLM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen2.5-3B-DPO-Vietnamese (este) | 3B | 128K (nativo) | vi, en | Apache 2.0 | Ajuste DPO sobre Qwen2.5-3B cuantizado |
| Qwen2.5-3B-Instruct | 3B | 128K | Multilingue (incluye vi) | Apache 2.0 | Modelo base con instrucciones, sin DPO especifico |
| Arcee-VyLinh | 3B | 32K | vi, en | Apache 2.0 | Optimizado para vietnamita, basado en Qwen2.5-3B |

La comparativa es cualitativa: el modelo de este repositorio se diferencia por el ajuste DPO, pero no se dispone de benchmarks que demuestren una ventaja objetiva sobre Qwen2.5-3B-Instruct o Arcee-VyLinh. Arcee-VyLinh tiene una ventana de contexto menor (32K) pero esta especificamente disenado para vietnamita, mientras que este modelo mantiene el contexto nativo de Qwen2.5.

## Limitaciones y advertencias

- El ajuste se realizo con solo 1.000 muestras de preferencias, lo que limita la generalizacion y puede provocar un sobreajuste a los patrones del dataset.
- No se han evaluado sesgos especificos del modelo; al estar basado en Qwen2.5, puede heredar sesgos presentes en los datos de preentrenamiento.
- Riesgo de alucinacion en temas factuales, especialmente en vietnamita, dado el tamano reducido del modelo y la limitada cantidad de datos de ajuste.
- La ventana de contexto de 128K tokens es la del modelo base, pero no se ha verificado que el ajuste DPO mantenga esta capacidad; es posible que se degrade con el fine-tuning.
- No se ha documentado soporte para tool calling ni funciones de agente, por lo que no es adecuado para tareas que requieran interaccion con APIs externas.
- El modelo esta pensado principalmente para vietnamita; su rendimiento en ingles puede ser inferior al de modelos especificos para ese idioma.
- Aunque la licencia es Apache 2.0, el uso comercial debe verificar que los datasets de entrenamiento (vi-alpaca, ultrafeedback) no tengan restricciones adicionales.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Haanh1702/qwen2.5-3b-dpo-vietnamese
- Modelo base Qwen2.5-3B: https://huggingface.co/Qwen/Qwen2.5-3B
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Referencia de Arcee-VyLinh: https://www.aimodels.fyi/models/huggingFace/arcee-vylinh-arcee-ai
- Pagina de Qwen2.5 en Ollama: https://ollama.com/library/qwen2.5:3b
- Repositorio de Qwen3 (familia relacionada): https://github.com/QwenLM/Qwen3

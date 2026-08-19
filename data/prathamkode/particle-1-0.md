# prathamkode/particle-1.0

## Resumen

particle-1.0 es un modelo de lenguaje conversacional de aproximadamente 100 millones de parámetros, desarrollado por Pratham Kode (prathamkode) y publicado en Hugging Face. Se trata de un modelo estilo Llama entrenado desde cero, es decir, con inicialización aleatoria, sin partir de pesos preentrenados de Llama, SmolLM ni de ningún otro modelo base. Su objetivo principal es servir como herramienta de investigación y demostración de un pequeño chatbot de código abierto.

El modelo emplea una arquitectura decoder-only con RoPE, SwiGLU, RMSNorm y embeddings atados, con 12 capas, 768 dimensiones ocultas y 12 cabezas de atención. Su contexto es de 2048 tokens y utiliza un tokenizer BPE de 32k entrenado desde cero sobre una muestra de FineWeb-Edu. Fue preentrenado con predicción de siguiente token sobre los primeros 2 mil millones de tokens de FineWeb-Edu y posteriormente ajustado con SFT sobre el dataset smol-smoltalk. Los pesos se distribuyen bajo licencia MIT, lo que facilita su uso comercial y de investigación.

La relevancia de este modelo radica en su carácter didáctico: al ser pequeño, entrenado desde cero y con pesos abiertos, permite estudiar el ciclo completo de entrenamiento de un LLM sin los costes computacionales de los modelos grandes. No obstante, el propio autor advierte de sus limitaciones: respuestas cortas, errores frecuentes y razonamiento débil.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama-style decoder (RoPE, SwiGLU, RMSNorm, tied embeddings) |
| Parametros totales | 109.529.856 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT (pesos); FineWeb-Edu ODC-By; smol-smoltalk segun dataset card |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura clasica de un transformer decoder-only estilo Llama: atencion con RoPE (Rotary Position Embedding), capas feed-forward con SwiGLU, normalizacion RMSNorm y embeddings de entrada y salida atados. Consta de 12 capas, 768 dimensiones ocultas y 12 cabezas de atencion, lo que arroja un total de 109.529.856 parametros. El tokenizer es un BPE byte-level de 32k vocabulario, entrenado desde cero sobre una muestra de aproximadamente 2 GB de texto de FineWeb-Edu, por lo que no reutiliza el vocabulario de Llama ni de GPT-2.

El entrenamiento se realizo en dos fases. Primero, un preentrenamiento con objetivo de prediccion de siguiente token sobre el dataset `HuggingFaceFW/fineweb_edu_100BT-shuffled`, utilizando los primeros 2 mil millones de tokens. La inicializacion fue aleatoria con distribucion normal N(0, 0.02) y la precision de entrenamiento fue BF16. Posteriormente, se aplico un ajuste fino supervisado (SFT) sobre el dataset `HuggingFaceTB/smol-smoltalk`, usando solo el primer turno de usuario/asistente y algunas semillas de saludo. No se empleo RLHF ni ajuste por preferencias. El autor indica que no se copiaron pesos de ningun modelo profesor; el SFT se hizo sobre el texto del dataset.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat propio (`<|user|>` y `<|assistant|>`).
- Respuestas cortas y directas, adecuadas para demos y prototipos.
- Capacidad limitada de razonamiento y de seguir instrucciones simples.
- Soporte de contexto de hasta 2048 tokens, suficiente para dialogos breves.
- No dispone de tool calling, function calling, vision, audio ni modo thinking.
- Capacidad multilingue practicamente nula: el entrenamiento se centro en texto en ingles (FineWeb-Edu es un subconjunto en ingles).

## Casos de uso

- Investigacion educativa: sirve para estudiar el ciclo completo de entrenamiento de un LLM desde cero, incluyendo tokenizer, preentrenamiento y SFT, sin necesidad de grandes recursos computacionales.
- Prototipado rapido de chatbots: al ser un modelo pequeno y con pesos MIT, se puede integrar en aplicaciones de demostracion o pruebas de concepto de atencion al cliente basica.
- Experimentos de alineacion: al carecer de RLHF, es un banco de pruebas para aplicar tecnicas de ajuste por preferencias y comparar resultados con modelos de tamano similar.
- Generacion de texto corto en ingles: util para tareas de completado de frases, generacion de titulares o respuestas breves en entornos con restricciones de latencia.
- Ensenanza de tecnicas de cuantizacion y despliegue: al ser un modelo de ~100M, se puede usar para practicar conversion a GGUF, cuantizacion int8/int4 y despliegue en CPU o GPU de baja gama.
- Integracion en pipelines de generacion de datos sinteticos: puede servir para generar ejemplos de entrenamiento de baja calidad que luego se filtran o se usan como aumentacion de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas como MMLU, HumanEval o GSM8K, y no hay comparaciones con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,22 GB en bfloat16 (109.529.856 parametros × 2 bytes), mas overhead de activaciones y cache. Con cuantizacion a int8 o int4, el consumo se reduce aun mas, aunque no hay datos oficiales de cuantizacion.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Modelos como NVIDIA GTX 1050 Ti, RTX 2060, RTX 3060 o superiores funcionan sin problemas. Tambien es viable en CPU con 4 GB de RAM.
- Cabe en GPUs de consumo general, incluidas las integradas de portatiles modernos.
- Opciones de despliegue: al ser un modelo de la libreria transformers, se puede servir con vLLM, Text Generation Inference (TGI), llama.cpp (tras conversion a GGUF) u Ollama. No hay configuraciones oficiales publicadas, pero el formato safetensors es compatible con todas estas herramientas.
- Latencia y throughput: no hay mediciones publicadas. Dado el tamano, se espera una latencia de pocos milisegundos por token en GPU y de decenas de milisegundos en CPU.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados. El modelo es comparable en tamano a SmolLM-135M (tambien de Hugging Face), pero no hay benchmarks que permitan una comparacion objetiva. Otras alternativas de tamano similar incluyen TinyLlama-1.1B (mucho mayor) o modelos de ~100M como GPT-2 Small, aunque con arquitecturas y entrenamientos distintos. Se recomienda evaluar particle-1.0 en las tareas concretas de interes antes de adoptarlo en produccion.

## Limitaciones y advertencias

- Capacidad muy pequena: el modelo tiene solo ~100M de parametros, lo que limita severamente su rendimiento en tareas complejas de razonamiento, comprension y generacion.
- Alucinaciones frecuentes: el autor advierte que el modelo puede inventar informacion, especialmente en temas fuera de su distribucion de entrenamiento.
- Sesgo hacia el ingles: el entrenamiento se realizo sobre un subconjunto de FineWeb-Edu en ingles, por lo que no es adecuado para otros idiomas.
- Sin RLHF ni ajuste por preferencias: las respuestas pueden ser incoherentes, repetitivas o poco alineadas con las expectativas del usuario.
- Respuestas cortas y con errores: el autor indica que se esperan respuestas breves, con equivocaciones y razonamiento debil.
- Restricciones de licencia de los datos: aunque los pesos son MIT, los datos de entrenamiento (FineWeb-Edu y smol-smoltalk) tienen sus propias licencias (ODC-By y la del dataset card respectivamente), que deben respetarse si se redistribuye el modelo o se documenta su entrenamiento.
- No apto para produccion: por sus limitaciones, no se recomienda su uso en aplicaciones criticas o con usuarios reales sin una evaluacion exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prathamkode/particle-1.0
- Dataset de preentrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb_edu_100BT-shuffled
- Dataset de SFT: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Perfil del autor: https://huggingface.co/prathamkode

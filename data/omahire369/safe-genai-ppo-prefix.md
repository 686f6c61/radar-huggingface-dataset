# OmAhire369/safe-genai-ppo-prefix

## Resumen

El modelo `safe-genai-ppo-prefix` es un adaptador PEFT (Prefix tuning) entrenado con PPO (RLHF) sobre el modelo base `gpt2-medium`, con el objetivo de alinear las respuestas del modelo hacia un comportamiento más seguro frente a prompts dañinos o que activan estereotipos. Desarrollado por Om Ahire, estudiante de posgrado en IIT Kharagpur, forma parte de un estudio comparativo entre PPO y DPO, así como de un barrido de cuatro estrategias de fine-tuning (full, prefix, LoRA, QLoRA). El adaptador añade 0,983 millones de parámetros entrenables sobre los 355,81 millones del modelo base, lo que representa un 0,2763% del total. Su relevancia radica en ser un ejemplo práctico de alineación de seguridad mediante RLHF con un coste computacional reducido, aunque su utilidad en producción es limitada debido a las carencias del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (GPT-2 medium) con adaptador PEFT prefix tuning |
| Parametros totales | 355,81 millones (modelo base gpt2-medium) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador emplea la técnica de prefix tuning, que añade vectores de prefijo aprendibles a las capas de atención del transformer base, sin modificar los pesos originales de `gpt2-medium`. El entrenamiento se realizó con el algoritmo PPO (Proximal Policy Optimization) dentro de un esquema RLHF, utilizando un modelo de recompensa basado en el modelo de preferencias de Bradley-Terry. Los datos de preferencia provienen del conjunto "Cultural Kaleidoscope preference data", aunque no se especifica el número de pares de entrenamiento. El proceso completo tomó 1361,5 segundos con un pico de uso de GPU de 4964,6 MB. No se detalla la composición exacta del dataset ni el número de tokens procesados.

## Capacidades

- Generación de texto con sesgo hacia respuestas seguras y no dañinas, especialmente frente a prompts que incitan a contenido perjudicial o estereotipado.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No dispone de capacidades multilingües específicas (idiomas no declarados).
- No incluye modo de pensamiento, visión ni audio.
- Es un adaptador que modifica el estilo de generación, pero no el conocimiento factual del modelo base.

## Casos de uso

- Investigación en alineación de modelos: permite estudiar el efecto de PPO con prefix tuning sobre la seguridad de las respuestas, comparándolo con otras estrategias del mismo estudio (full, LoRA, QLoRA).
- Evaluación de modelos de recompensa: el adaptador puede utilizarse para probar la calidad del reward model entrenado, observando cómo responde a distintos prompts.
- Prototipado de sistemas de moderación de contenido: aunque no es robusto, sirve para demostrar conceptos de filtrado de respuestas dañinas en entornos controlados.
- Educación en RLHF: es un ejemplo didáctico de implementación de PPO con PEFT, útil para cursos o talleres sobre alineación de modelos.
- Análisis de sesgos en preferencias: permite examinar cómo el adaptador refleja los sesgos del dataset de preferencias, contribuyendo a la investigación sobre equidad en IA.
- Experimentos de transferencia: se puede probar si el adaptador mejora la seguridad en dominios de texto distintos a los del entrenamiento, aunque con las limitaciones del modelo base.
- Comparación de estrategias de fine-tuning: junto con los otros adaptadores del estudio, facilita un análisis sistemático de coste-beneficio entre métodos de ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento es la puntuación del modelo de recompensa tras el entrenamiento: -1,5961, con una mejora de 0,0594 respecto al paso 0. Este valor no es comparable con métricas convencionales y debe interpretarse únicamente en el contexto del estudio de alineación.

## Requisitos de hardware

- VRAM estimada para inferencia: dado que el modelo base tiene 355 millones de parámetros, en FP16 ocupa aproximadamente 700 MB, más el adaptador y overhead, se estima entre 1 y 2 GB. En cuantización de 8 bits, podría reducirse a menos de 1 GB, aunque no se proporcionan versiones cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como GTX 1650, RTX 3060 o superiores. También puede ejecutarse en CPU, aunque con mayor latencia.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con las librerías `transformers` y `peft`. No se ofrecen versiones GGUF ni integraciones con vLLM, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El adaptador solo puede contrastarse con el modelo base `gpt2-medium` sin ajuste, que no presenta alineación de seguridad. No hay datos de otros adaptadores de alineación sobre el mismo base en las fuentes consultadas.

## Limitaciones y advertencias

- El modelo base `gpt2-medium` es pequeño y desactualizado, y no ha recibido instruction tuning, por lo que sus respuestas pueden ser incoherentes o poco útiles en tareas complejas.
- La alineación solo modifica el estilo y la seguridad superficial; no corrige errores factuales ni mejora el conocimiento del modelo.
- El modelo de recompensa utilizado hereda los sesgos de anotación del dataset de preferencias, por lo que no debe tratarse como un clasificador de seguridad general.
- No es apto para producción: no hay evidencia de robustez, y el adaptador no ha sido probado ampliamente (0 descargas en Hugging Face).
- No se han publicado resultados de benchmarks estándar, lo que impide evaluar su rendimiento en tareas convencionales.
- La licencia MIT permite uso comercial, pero el modelo base `gpt2-medium` tiene su propia licencia (MIT también), por lo que no hay restricciones adicionales conocidas.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/OmAhire369/safe-genai-ppo-prefix)
- [Repositorio del estudio PPO prefix alignment](https://huggingface.co/OmAhire369/ppo_prefix_alignment)
- [Perfil del autor en Hugging Face](https://huggingface.co/OmAhire369)
- [Perfil del autor en GitHub](https://github.com/Omahire369)
- [Paper de PPO (referencia)](https://arxiv.org/abs/1910.09700)

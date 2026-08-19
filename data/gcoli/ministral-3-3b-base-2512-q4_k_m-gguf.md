# gcoli/Ministral-3-3B-Base-2512-Q4_K_M-GGUF

## Resumen

El modelo `gcoli/Ministral-3-3B-Base-2512-Q4_K_M-GGUF` es una cuantización en formato GGUF (Q4_K_M) del modelo base `mistralai/Ministral-3-3B-Base-2512`, desarrollado por Mistral AI. Esta versión cuantizada ha sido generada por el usuario `gcoli` para su uso con la librería `llama.cpp`, lo que permite ejecutar el modelo en entornos con recursos limitados, como CPUs o GPUs de baja gama, manteniendo un equilibrio entre tamaño y calidad de generación.

El modelo original es un transformer de 3.429 millones de parámetros (3,4B) con licencia Apache-2.0, orientado a tareas de generación de texto. Al tratarse de una versión base, no incluye ajuste por instrucciones ni capacidades de chat, por lo que está pensado para ser utilizado como punto de partida para fine-tuning o para tareas de generación libre. La cuantización Q4_K_M reduce el peso del archivo a aproximadamente 2,1 GB, lo que lo hace adecuado para despliegues en dispositivos con poca memoria.

La relevancia de esta ficha radica en que ofrece una opción práctica para probar el modelo Ministral 3B en hardware asequible, sin necesidad de una GPU de alta gama, y con la flexibilidad de usar herramientas del ecosistema llama.cpp como Ollama o el propio ejecutable de llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer, según el nombre y la familia Mistral, pero sin confirmación oficial en la ficha) |
| Parametros totales | 3.429.006.336 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (archivo único) |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF V3 (Q4_K_M) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna ni sobre el proceso de entrenamiento del modelo original `mistralai/Ministral-3-3B-Base-2512` en la model card de esta cuantización. La ficha se limita a documentar el proceso de conversión: los pesos BF16 originales se convirtieron primero a F16 GGUF mediante el script oficial de `llama.cpp` (tag `b9402`) y posteriormente se cuantizaron a Q4_K_M con `llama-quantize` (build 10360). No se utilizó matriz de importancia, lo que puede implicar una ligera pérdida de precisión frente a cuantizaciones con calibración.

Dado que se trata de un modelo base, no se menciona ningún tipo de ajuste por RLHF, DPO o instrucciones. La arquitectura subyacente es presumiblemente un transformer denso de 3,4B parámetros, pero este dato no está confirmado en la información disponible.

## Capacidades

- Generación de texto libre: al ser un modelo base, puede completar texto o generar secuencias a partir de un prompt, pero sin seguir instrucciones específicas.
- Fine-tuning: al no estar alineado, es adecuado para ser ajustado en tareas concretas mediante técnicas como LoRA o fine-tuning completo.
- Inferencia eficiente: gracias a la cuantización Q4_K_M, puede ejecutarse en CPU o GPU con poca memoria, lo que facilita su uso en entornos de desarrollo y edge.
- Sin capacidades multimodales: la model card indica explícitamente que no se incluye el proyector de visión, por lo que solo procesa texto.
- Sin soporte de tool calling ni agentes: al ser una versión base, no incluye funcionalidades de llamada a herramientas ni razonamiento multi-paso.

## Casos de uso

- Fine-tuning para tareas específicas de NLP: por ejemplo, clasificación de textos, extracción de entidades o generación de resúmenes. Al ser un modelo base de 3,4B, puede ajustarse con datasets pequeños en GPUs de consumo, y la versión GGUF permite cargarlo rápidamente en entornos de desarrollo.
- Prototipado rápido en entornos sin GPU: gracias a su tamaño reducido (2,1 GB), puede ejecutarse en CPU con herramientas como `llama.cpp` o `Ollama`, lo que permite validar ideas y flujos de trabajo antes de escalar a modelos más grandes.
- Generación de texto en aplicaciones de bajo presupuesto: para chatbots simples o asistentes de redacción donde no se requiere un modelo alineado, esta cuantización ofrece una alternativa ligera y con licencia permisiva (Apache-2.0).
- Experimentación con cuantización y despliegue: el archivo Q4_K_M sirve como referencia para comparar el rendimiento de distintos niveles de cuantización en tareas de generación, útil para quienes investigan el equilibrio entre tamaño y calidad.
- Inferencia en dispositivos edge: con una VRAM de aproximadamente 2,5 GB, puede desplegarse en placas como Jetson Nano o en portátiles con GPUs integradas, siempre que el contexto sea moderado.
- Aprendizaje y docencia: al ser un modelo abierto y ligero, es útil para enseñar conceptos de transformers, cuantización y despliegue de LLMs en cursos de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo indica que el archivo pasó una prueba de decodificación y un autocompletado de 6 comprobaciones, pero no proporciona métricas como MMLU, HumanEval o GSM8K. Se recomienda consultar el repositorio del modelo original para obtener datos de rendimiento, aunque tampoco se garantiza que estén disponibles.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF Q4_K_M ocupa 2.147.024.224 bytes (~2,0 GiB). Para inferencia con contexto corto, se necesitan aproximadamente 2,5-3 GB de VRAM en GPU o RAM en CPU, dependiendo de la implementación y del tamaño del contexto.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 3060 o superiores. También puede ejecutarse en Apple Silicon (M1/M2) y en CPUs modernas con al menos 8 GB de RAM.
- Compatibilidad con consumer GPU: sí, es uno de los puntos fuertes de esta cuantización, ya que cabe en GPUs de gama de entrada.
- Opciones de despliegue: `llama.cpp` (incluido el ejecutable `llama-cli`), `Ollama`, `llama-cpp-python` para integración en Python, y servidores compatibles con la API de OpenAI como `llama-server`.
- Latencia y throughput: no se han publicado datos específicos. En una GPU como RTX 3060, se puede esperar una velocidad de generación de 20-40 tokens/segundo con contexto corto, pero estos valores son orientativos y dependen de la configuración.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa fiable con otros modelos de la misma categoría (por ejemplo, Phi-3-mini, Gemma-2-2B o Qwen2.5-3B). Aunque el tamaño de parámetros es similar, no se conocen los resultados de benchmarks del modelo original, por lo que cualquier comparación sería especulativa. Se recomienda consultar las fichas de los modelos mencionados para obtener datos de rendimiento y decidir en función de las necesidades concretas.

## Limitaciones y advertencias

- Al ser una cuantización Q4_K_M sin matriz de importancia, puede haber una pérdida de precisión respecto al modelo original en tareas que requieren razonamiento complejo o conocimiento factual.
- Es un modelo base, por lo que no está alineado para seguir instrucciones ni para mantener conversaciones coherentes. No debe usarse directamente como chatbot sin un fine-tuning previo.
- No se han documentado los idiomas soportados ni el contexto máximo; se desconoce si el modelo funciona bien en español o en otros idiomas distintos del inglés.
- Riesgo de alucinaciones: como cualquier LLM, puede generar información falsa o inconsistente, especialmente en temas de actualidad o muy específicos.
- No incluye capacidades multimodales (visión), a pesar de que el modelo original podría tenerlas; esta versión solo procesa texto.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos del modelo original en el repositorio de Mistral AI para confirmar si hay restricciones adicionales.

## Enlaces

- Repositorio de la cuantización: [https://huggingface.co/gcoli/Ministral-3-3B-Base-2512-Q4_K_M-GGUF](https://huggingface.co/gcoli/Ministral-3-3B-Base-2512-Q4_K_M-GGUF)
- Modelo original: [https://huggingface.co/mistralai/Ministral-3-3B-Base-2512](https://huggingface.co/mistralai/Ministral-3-3B-Base-2512)

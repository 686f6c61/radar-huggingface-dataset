# fontlab/BananaMind-2-Nano-Chat-int8

## Resumen

BananaMind-2-Nano-Chat-int8 es una versión cuantizada del modelo BananaMind-2-Nano-Chat, publicada por el usuario fontlab en Hugging Face. El modelo original, desarrollado por BananaMind, es un modelo de lenguaje pequeño (aproximadamente 10 millones de parámetros) diseñado para generación de texto conversacional. Esta variante aplica una cuantización mixta int8/ternaria mediante el motor bananamend, reduciendo el tamaño del archivo de pesos de 39,87 MB a 10,61 MB (3,76 veces más pequeño) manteniendo una calidad cercana a la versión en coma flotante.

La relevancia de este modelo radica en su extremada ligereza: puede ejecutarse en CPU sin necesidad de GPU, lo que lo hace adecuado para entornos embebidos, aplicaciones de escritorio y prototipos rápidos. El proceso de cuantización, descrito en la model card, combina ternarización selectiva con cuantización de 8 bits por grupos de 64 pesos, utilizando técnicas como GPTQ y calibración por perplejidad. El resultado es un modelo que conserva el 97,9% de coincidencia en el siguiente token respecto al original, con una divergencia KL de 0,0014.

La licencia Apache 2.0 permite uso comercial sin restricciones, y el formato de pesos es safetensors, aunque requiere el motor bananamend para su carga (no es legible con transformers estándar). No se dispone de información oficial sobre la arquitectura interna, el contexto máximo o los idiomas soportados, aunque el modelo base se etiqueta como causal-lm y según fuentes externas maneja un contexto de 4K tokens.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como causal-lm) |
| Parametros totales | 10.123.776 (según safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base se reporta con 4K en LLM Explorer) |
| Tipos de cuantizacion | int8 con group size 64, mezcla de matrices ternarias y 8-bit |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (requiere motor bananamend) |

## Arquitectura y entrenamiento

No se dispone de información oficial sobre la arquitectura del modelo base BananaMind-2-Nano-Chat. Los tags de Hugging Face lo clasifican como causal-lm, lo que sugiere un transformer autoregresivo estándar, pero no se confirma el número de capas, dimensiones de atención ni otras características estructurales. El proceso de entrenamiento del modelo original tampoco está documentado en la información proporcionada.

La cuantización, en cambio, está bien descrita en la model card. Se realizó con la herramienta `bananamendy 1.0.2` siguiendo estos pasos: primero se ejecuta un texto de calibración a través del modelo para registrar las activaciones de cada matriz; luego, para cada grupo de 64 pesos, se busca el umbral que minimiza el error y se asignan escalas separadas para pesos positivos y negativos (esquema asimétrico de PT2-LLM); después se cuantiza columna a columna propagando el error (GPTQ); finalmente se mide cada matriz individualmente y se asignan pesos ternarios solo a aquellas matrices cuya degradación es mínima, mientras el resto recibe pesos de 8 bits. Este enfoque mixto evita la pérdida severa de calidad que ocurriría si todas las matrices fueran ternarias en un modelo tan pequeño.

## Capacidades

- Generación de texto conversacional: el modelo está diseñado para chat multi-turno, como indica su nombre y el pipeline `text-generation`.
- Ejecución en CPU: gracias a su tamaño reducido, puede inferir sin aceleración GPU, lo que lo hace portable a hardware modesto.
- Compatibilidad con el motor bananamend: los pesos están codificados como códigos y escalas, no como flotantes, por lo que requieren este motor específico para cargarse.
- Cuantización eficiente: la mezcla de ternario y 8-bit logra una compresión de 3,76x con una pérdida mínima de calidad (perplejidad 67,2 vs 66,3 del original).
- No se documentan capacidades adicionales como tool calling, visión o razonamiento multi-paso.

## Casos de uso

- Aplicaciones de chat local en escritorio: el proyecto de GitHub "BananaMind 2 Nano Chat" demuestra un uso práctico, con una interfaz PySide6 que ejecuta el modelo en CPU para conversaciones con historial multi-turno y control de creatividad.
- Prototipado rápido de asistentes conversacionales: al ser tan ligero, permite iterar sobre prompts y flujos de diálogo sin necesidad de infraestructura GPU.
- Entornos educativos y de demostración: sirve para ilustrar conceptos de generación de lenguaje, cuantización y despliegue en recursos limitados.
- Sistemas embebidos o IoT: su huella de memoria (~10 MB) lo hace viable en dispositivos con poca RAM, como routers o placas de bajo consumo.
- Generación de texto corto en lotes: puede procesar tareas simples como completar frases, generar titulares o responder preguntas factuales básicas.
- Pruebas de integración con el motor bananamend: desarrolladores que quieran evaluar el rendimiento de cuantización mixta pueden usar este checkpoint como referencia.

## Benchmarks y rendimiento

La model card proporciona métricas de calidad de la cuantización comparando el checkpoint cuantizado con el float original sobre un texto no visto durante la calibración:

| Medida | Valor |
|:-------|------:|
| Mismo siguiente token | 97,9% |
| Siguiente token dentro de los primeros cinco | 100,0% |
| Divergencia (KL) | 0,0014 |
| Perplejidad (cuantizado vs float) | 67,2 vs 66,3 |
| Respuestas greedy idénticas | 4/8 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo está diseñado para ejecutarse sin GPU; el proyecto de escritorio mencionado lo corre en CPU.
- VRAM: no requiere VRAM dedicada; la memoria RAM necesaria es inferior a 50 MB para los pesos (10,61 MB de archivo).
- GPU recomendadas: ninguna; cualquier procesador moderno puede ejecutarlo, aunque la latencia dependerá del hardware.
- Opciones de despliegue: motor bananamend (obligatorio), con interfaces de línea de comandos (`bananamendy chat`) y Python (`bananamendr.Model`). No es compatible con vLLM, llama.cpp u Ollama directamente, ya que el formato no es estándar.
- Latencia y throughput: no se dispone de mediciones publicadas; al ser un modelo de 10M parámetros, se espera una generación de varios tokens por segundo incluso en CPUs de gama media.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo cuantizado con alternativas de la misma categoría (modelos de ~10M parámetros). El modelo base BananaMind-2-Nano-Chat tiene 9.968.128 parámetros según el repositorio de GitHub, y la versión cuantizada añade escalas y códigos, alcanzando 10.123.776 parámetros. Otras opciones como TinyLlama (1.1B) o GPT-2 (124M) son significativamente más grandes y no son comparables en recursos. La comparación más relevante es con el propio modelo float, que se resume en la tabla de benchmarks.

## Limitaciones y advertencias

- Tamaño extremadamente reducido: con solo 10M de parámetros, el modelo tiene una capacidad limitada de conocimiento y razonamiento; no es adecuado para tareas complejas o que requieran información actualizada.
- Degradación por cuantización: aunque la perplejidad empeora solo ligeramente (67,2 vs 66,3), las respuestas greedy idénticas son solo 4 de 8, lo que indica que en algunos casos el texto generado difiere del original.
- Dependencia del motor bananamend: los pesos no son legibles con transformers estándar, lo que limita su uso a entornos que soporten este motor específico.
- Sesgos y alucinaciones: no se han documentado sesgos específicos, pero cualquier modelo pequeño es propenso a generar información incorrecta o inventada; se recomienda validar las salidas en aplicaciones de producción.
- Información incompleta: no se conocen los idiomas soportados ni el contexto máximo exacto; el uso multilingüe no está garantizado.
- Licencia: Apache 2.0 permite uso comercial, pero el motor bananamend (software de terceros) puede tener sus propios términos; se debe verificar.

## Enlaces

- Repositorio Hugging Face del modelo cuantizado: https://huggingface.co/fontlab/BananaMind-2-Nano-Chat-int8
- Modelo base: https://huggingface.co/BananaMind/BananaMind-2-Nano-Chat
- Motor bananamend (GitHub): https://github.com/twardoch/bananamend
- Aplicación de escritorio BananaMind 2 Nano Chat: https://github.com/mpottinger/bananamind-2-nano-chat
- Página del modelo en LLM Explorer: https://llm-explorer.com/model/BananaMind%2FBananaMind-2-Nano,3hjmoEynhmCrG7Ue66GfqU

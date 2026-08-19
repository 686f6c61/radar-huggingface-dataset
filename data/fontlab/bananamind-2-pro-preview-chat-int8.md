# fontlab/BananaMind-2-Pro-Preview-Chat-int8

## Resumen

BananaMind-2-Pro-Preview-Chat-int8 es una versión cuantizada del modelo BananaMind-2-Pro-Preview-Chat, desarrollado por BananaMind y publicado por el usuario fontlab en HuggingFace. Se trata de un modelo de lenguaje pequeño (SLM) de aproximadamente 141 millones de parámetros, ajustado para conversación y generación de texto, con una arquitectura causal-lm personalizada y un tokenizador de dígitos. Esta variante concreta aplica una cuantización int8 con grupo de tamaño 64, lo que reduce el tamaño del archivo de pesos de 555,89 MB a 147,76 MB (3,76 veces más pequeño) manteniendo una calidad medida casi idéntica al original.

El modelo está diseñado para ejecutarse exclusivamente con el motor bananamend, un framework de inferencia ligero, y no es compatible con transformers directamente. Su pequeño tamaño y bajo consumo de memoria lo hacen adecuado para entornos con recursos limitados, como dispositivos edge o prototipos rápidicos. La licencia apache-2.0 permite uso comercial y modificación sin restricciones significativas. La relevancia actual radica en la tendencia hacia modelos pequeños y eficientes que puedan desplegarse en hardware modesto sin sacrificar demasiada calidad conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal LM (transformer) con arquitectura personalizada (bananamind) |
| Parametros totales | 141.142.400 |
| Longitud de contexto | 3K (según llm-explorer.com) |
| Tipos de cuantizacion | int8 (group size 64) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (códigos y escalas int8, requiere motor bananamend) |

## Arquitectura y entrenamiento

El modelo base BananaMind-2-Pro-Preview-Chat es un small-language-model de 139 millones de parámetros (141.142.400 en esta versión cuantizada) con arquitectura causal-lm y un tokenizador de dígitos (digit-tokenizer). Fue ajustado mediante fine-tuning completo para tareas de chat y conversación. La versión int8 se generó post-entrenamiento aplicando un método de cuantización que combina ternarización selectiva y cuantización de 8 bits, aunque en este checkpoint concreto todas las matrices se cuantizaron a 8 bits (169 matrices, 0 ternarias). El proceso incluye calibración, búsqueda de umbrales por grupo de 64 pesos, ajuste por columnas con GPTQ y una selección de matrices basada en el impacto en la salida. La calidad medida muestra una divergencia KL de 0.0005 y una perplejidad idéntica (33.3) frente al modelo en coma flotante.

## Capacidades

- Generación de texto conversacional: responde a prompts en formato chat multi-turno.
- Soporte de instrucciones básicas: al estar fine-tuneado para chat, sigue instrucciones simples.
- Ejecución eficiente: requiere solo 0.6 GB de VRAM según llm-explorer, lo que permite inferencia en GPUs de gama baja o incluso CPU.
- Compatibilidad limitada: solo funciona con el motor bananamend, no con transformers ni otras librerías estándar.
- Capacidades multilingües: no documentadas; probablemente limitadas al inglés u otros idiomas según el entrenamiento del modelo base.
- Sin soporte para tool calling, agentes ni razonamiento multi-paso avanzado debido a su tamaño reducido.

## Casos de uso

- Chatbots de atención al cliente en entornos con recursos limitados: el modelo puede gestionar conversaciones sencillas de soporte (preguntas frecuentes, consultas básicas) en dispositivos embebidos o servidores de baja capacidad, gracias a su bajo consumo de VRAM (0.6 GB) y su formato cuantizado que reduce el uso de memoria.
- Prototipado rápido de asistentes conversacionales: desarrolladores pueden integrarlo en aplicaciones de prueba para validar flujos de diálogo antes de migrar a modelos más grandes, usando el motor bananamend para una integración sencilla.
- Generación de respuestas cortas en aplicaciones móviles: su tamaño compacto permite ejecutarlo en el dispositivo (edge) para tareas como autocompletado de texto o respuestas automáticas en apps de mensajería.
- Clasificación de texto ligera: aunque no está específicamente entrenado para ello, puede usarse para etiquetar o categorizar texto corto mediante prompts, aprovechando su capacidad de generación.
- Entrenamiento y experimentación académica: sirve como ejemplo de cuantización int8 post-entrenamiento y de arquitectura de SLM, permitiendo a investigadores estudiar el impacto de la cuantización en modelos pequeños.
- Despliegue en hardware de bajo coste: por su tamaño (147 MB) y requisitos mínimos, es viable en Raspberry Pi o similares para proyectos de IoT con interacción por voz o texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye métricas de calidad de cuantización (mismo token siguiente 100%, divergencia KL 0.0005, perplejidad 33.3) comparando el checkpoint int8 con el float, pero no hay datos de MMLU, HumanEval u otros estándares.

## Requisitos de hardware

- VRAM estimada: 0.6 GB según llm-explorer.com, lo que cabe en cualquier GPU moderna (incluso integradas).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, como NVIDIA GTX 1050, RTX 2060, o incluso iGPUs con suficiente memoria compartida.
- Compatible con CPU: al ser un modelo pequeño y cuantizado, puede ejecutarse en CPU con razonable latencia (no se especifican tiempos).
- Opciones de despliegue: exclusivamente mediante el motor bananamend (librería `bananamendy`), no compatible con vLLM, Ollama, TGI u otros frameworks estándar.
- Latencia y throughput: no disponibles, pero dado el tamaño, se espera una latencia baja en hardware moderno.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para comparar directamente. Como referencia de modelos pequeños similares (parámetros < 200M), se pueden considerar:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| BananaMind-2-Pro-Preview-Chat-int8 | 141M | 3K | apache-2.0 | HuggingFace, motor bananamend |
| TinyLlama-1.1B | 1.1B | 2K | apache-2.0 | HuggingFace, transformers |
| Qwen2-0.5B | 494M | 32K | apache-2.0 | HuggingFace, transformers |
| Phi-2 | 2.7B | 2K | MIT | HuggingFace, transformers |

La comparativa es orientativa; BananaMind-2-Pro es significativamente más pequeño que estos modelos, por lo que su rendimiento en tareas complejas será inferior, pero su huella de memoria es mucho menor.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo pequeño, es más propenso a generar respuestas incoherentes o inventadas, especialmente en temas especializados.
- Limitaciones de contexto: la ventana de 3K tokens es corta, lo que restringe conversaciones largas o documentos extensos.
- Idiomas: no se documentan idiomas soportados; probablemente el rendimiento fuera del inglés sea deficiente.
- Dependencia del motor bananamend: el modelo no puede ejecutarse con librerías estándar como transformers, lo que limita su integración en ecosistemas existentes.
- Licencia: aunque el repo declara apache-2.0, el modelo base original usa una licencia comunitaria de BananaMind (bananamind-community-license-1); se debe verificar la compatibilidad de uso comercial según la intención del autor.
- Calidad de cuantización: aunque las métricas muestran una degradación mínima, la perplejidad de 33.3 es alta, indicando que el modelo base ya tiene limitaciones de modelado del lenguaje.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/fontlab/BananaMind-2-Pro-Preview-Chat-int8
- Modelo base en HuggingFace: https://huggingface.co/BananaMind/BananaMind-2-Pro-Preview-Chat
- Motor bananamend (GitHub): https://github.com/twardoch/bananamend
- Página de llm-explorer con detalles del modelo base: https://llm-explorer.com/model/BananaMind%2FBananaMind-2-Pro-Preview-Chat,OMDKYcZXPDxiNZHWubt8K

# ggml-org/SmolLM2-135M-GGUF

## Resumen

SmolLM2-135M-GGUF es una conversión al formato GGUF del modelo base SmolLM2-135M, desarrollado por HuggingFaceTB y convertido automáticamente por el equipo de ggml-org. Se trata de un modelo de lenguaje compacto de 135 millones de parámetros, diseñado para ejecutarse en dispositivos con recursos limitados, como CPUs, portátiles o entornos edge. Su relevancia radica en que permite desplegar generación de texto local sin necesidad de GPU dedicada, gracias a su pequeño tamaño y a las cuantizaciones GGUF que reducen aún más el peso y la memoria requerida.

El modelo pertenece a la familia SmolLM2, que incluye variantes de 135M, 360M y 1.7B parámetros, y está pensado para tareas de generación de texto, instrucciones y razonamiento básico. La versión GGUF aquí descrita es una conversión directa del checkpoint original, sin modificaciones en los pesos, y está lista para usarse con herramientas como llama.cpp, Ollama o vLLM. Aunque no se especifican detalles de contexto o arquitectura en la información proporcionada, por su tamaño se espera una ventana de contexto modesta y un rendimiento adecuado para tareas sencillas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere transformer decoder, sin confirmar) |
| Parametros totales | 134.515.008 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (incluye Q8_0, Q4_K_M, etc., segun versiones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base SmolLM2-135M en la documentación proporcionada. Por su naturaleza y tamaño, se trata presumiblemente de un transformer decoder con atención causal, pero no se confirma el número de capas, dimensiones o mecanismos de atención. El entrenamiento del modelo base tampoco está documentado en esta ficha; se sabe que forma parte de la familia SmolLM2, que según la descripción general de HuggingFace mejora respecto a SmolLM1 en seguimiento de instrucciones, conocimiento y razonamiento, pero no se aportan datos concretos sobre tokens de entrenamiento, composición del dataset o técnicas de alineación como RLHF o DPO.

La conversión a GGUF se realiza mediante la herramienta automática de ggml-org (https://github.com/ggml-org/convert), que transforma los pesos de safetensors a formato GGUF sin alterar los valores. Esto implica que el comportamiento del modelo es idéntico al original, solo cambia el formato de almacenamiento y la posibilidad de cuantización adicional.

## Capacidades

- Generación de texto: el modelo puede producir texto coherente en tareas de completado, continuación y generación libre, aunque con limitaciones propias de su tamaño reducido.
- Seguimiento de instrucciones: al ser una versión base (no instruct), su capacidad para seguir instrucciones complejas es limitada; la variante Instruct (SmolLM2-135M-Instruct) sería más adecuada para ese fin.
- Razonamiento básico: puede resolver tareas sencillas de lógica y sentido común, pero falla en problemas que requieren múltiples pasos o conocimiento extenso.
- Multilingüismo: no se especifican idiomas soportados; se asume un entrenamiento principalmente en inglés, aunque podría generalizar a otros idiomas con menor calidad.
- Tool calling y agentes: no se menciona soporte para function calling ni uso como agente autónomo; su tamaño lo hace poco práctico para estas tareas.
- Ejecución en CPU: gracias al formato GGUF y su pequeño tamaño, puede ejecutarse en hardware sin GPU, con latencias aceptables para tareas interactivas simples.

## Casos de uso

- Inferencia local en dispositivos edge: el modelo puede desplegarse en Raspberry Pi, móviles o portátiles antiguos para generar texto sin conexión, por ejemplo en asistentes personales offline o aplicaciones de autocompletado.
- Prototipado rápido de aplicaciones de NLP: al ser ligero, permite probar flujos de generación de texto en entornos de desarrollo sin necesidad de infraestructura GPU, acelerando el ciclo de iteración.
- Filtrado y clasificación de texto: puede usarse para tareas de clasificación binaria o etiquetado simple, como detección de spam o categorización de comentarios, mediante prompts bien diseñados.
- Generación de contenido educativo: en contextos donde se requiere texto breve y sencillo, como explicaciones de conceptos básicos o resúmenes de párrafos cortos, el modelo puede servir como base.
- Pruebas de pipelines de inferencia: los desarrolladores pueden usar este modelo para validar integraciones con llama.cpp, Ollama o vLLM antes de escalar a modelos más grandes, gracias a su bajo coste de ejecución.
- Aprendizaje y experimentación: es útil para estudiantes e investigadores que quieran entender el funcionamiento de los modelos de lenguaje y las cuantizaciones GGUF sin invertir en hardware caro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo concreto. Se recomienda consultar la documentación del modelo base SmolLM2-135M en HuggingFace para posibles métricas, aunque no se garantiza su disponibilidad.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 135M parámetros en formato GGUF, la memoria necesaria es inferior a 300 MB en cuantizaciones bajas (por ejemplo, Q4_K_M), y alrededor de 138 MB en Q8_0 según una de las versiones publicadas. Esto permite ejecutarlo en CPUs sin GPU.
- GPU recomendadas: no se requiere GPU; cualquier CPU moderna con al menos 1 GB de RAM libre es suficiente. Si se desea usar GPU, cualquier tarjeta con más de 1 GB de VRAM (incluso integradas) puede acelerar la inferencia.
- Compatibilidad con consumer GPU: sí, cabe en cualquier GPU de consumo, incluidas las integradas de Intel o AMD.
- Opciones de despliegue: compatible con llama.cpp, Ollama, vLLM (con adaptador GGUF), llama.app (según la model card) y cualquier runtime que soporte GGUF.
- Latencia y throughput: no se proporcionan datos oficiales; en CPU, se espera una generación de decenas de tokens por segundo en hardware moderno, y en GPU la latencia sería aún menor.

## Comparativa con modelos similares

No se dispone de datos comparativos concretos con otros modelos de la misma categoría. Se puede mencionar que existen alternativas como SmolLM2-360M y SmolLM2-1.7B (misma familia, mayor tamaño), o modelos como Qwen2.5-0.5B o TinyLlama-1.1B, pero no se tienen métricas de rendimiento ni especificaciones detalladas para establecer una comparación rigurosa. La información disponible no permite elaborar una tabla comparativa fiable.

## Limitaciones y advertencias

- Tamaño reducido: con solo 135M parámetros, el modelo tiene un conocimiento limitado y una capacidad de razonamiento pobre en tareas complejas; no es adecuado para producción donde se requiera alta precisión.
- Alucinaciones: como todos los modelos generativos, puede inventar hechos o producir respuestas incoherentes, especialmente en dominios especializados.
- Sesgos: al ser un modelo entrenado con datos web, puede reflejar sesgos presentes en esos datos; no se han documentado evaluaciones de sesgo específicas.
- Idioma: no se especifican idiomas soportados; es probable que el rendimiento en español sea inferior al inglés, y no se recomienda para aplicaciones multilingües críticas.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero se debe mantener el aviso de licencia y atribución. No hay restricciones conocidas adicionales.
- Contexto limitado: aunque no se especifica la longitud de contexto, los modelos de este tamaño suelen tener ventanas de 2048 o 4096 tokens; para tareas que requieran contexto largo, no es adecuado.
- Formato GGUF: la conversión es automática y no se ha verificado manualmente; aunque es poco probable, podría haber diferencias mínimas con el original en algunos casos extremos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ggml-org/SmolLM2-135M-GGUF
- Modelo base original: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Herramienta de conversión ggml-org: https://github.com/ggml-org/convert
- Versión Instruct GGUF de bartowski: https://huggingface.co/bartowski/SmolLM2-135M-Instruct-GGUF
- Versión GGUF de QuantFactory: https://huggingface.co/QuantFactory/SmolLM2-135M-GGUF
- Repositorio de ejemplo con cuantización Q8_0: https://github.com/HackNetAyush/smollm2-135M-instruct-gguf-q8
- Página de referencia en local-ai-zone: https://local-ai-zone.github.io/models/smollm2-135m.html

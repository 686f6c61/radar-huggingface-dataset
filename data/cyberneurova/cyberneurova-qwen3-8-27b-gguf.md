# cyberneurova/cyberneurova-Qwen3.8-27B-GGUF

## Resumen

El modelo `cyberneurova/cyberneurova-Qwen3.8-27B-GGUF` es una versión cuantizada en formato GGUF del modelo base `cyberneurova/cyberneurova-Qwen3.8-27B`, desarrollado por el equipo de cyberneurova. Está diseñado para ejecutarse localmente mediante runtimes compatibles con GGUF como llama.cpp, Ollama, LM Studio o Jan, lo que permite desplegar un modelo de 27 000 millones de parámetros en hardware de consumo sin necesidad de infraestructura en la nube.

El modelo se presenta como "uncensored" y neutral: el tono de las respuestas se controla íntegramente mediante el *system prompt*, y por defecto incluye un modo de razonamiento que genera un *thinking trace* antes de la respuesta final. Esta característica lo hace adecuado para tareas que requieren razonamiento explícito, como generación de código o resolución de problemas complejos, aunque exige reservar suficientes tokens de salida (1500 o más, y entre 2000 y 4000 para código) para evitar respuestas truncadas.

La relevancia actual de este modelo radica en su disponibilidad en múltiples cuantizaciones (desde Q2_K hasta Q8_0), lo que permite ajustar el equilibrio entre calidad y consumo de recursos según el hardware disponible. No obstante, la información pública es limitada: no se especifican detalles de arquitectura, contexto máximo, idiomas soportados ni datos de entrenamiento más allá de los que se infieren del nombre y de la propia model card.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere una base Qwen, pero no se confirma) |
| Parametros totales | 27 320 697 856 (27B) |
| Parametros activos | no aplicable (no se indica que sea MoE) |
| Longitud de contexto | no disponible (en el ejemplo de llama-server se usa `-c 8192`, pero no se documenta el máximo del modelo) |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (según los archivos publicados) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna del modelo base `cyberneurova-Qwen3.8-27B`. El nombre sugiere una posible relación con la familia Qwen, pero no hay confirmación oficial en la model card ni en los metadatos. Tampoco se documentan los datos de entrenamiento, el número de tokens utilizados, ni si se aplicaron técnicas como RLHF o DPO.

La única información relevante es que se trata de una versión cuantizada en GGUF del modelo base, y que la model card indica que es un "reasoning model" que genera un *thinking trace* antes de la respuesta. No se mencionan innovaciones técnicas adicionales.

## Capacidades

- Generación de texto con razonamiento explícito: el modelo produce un *thinking trace* interno antes de la respuesta final, lo que facilita tareas que requieren pasos intermedios.
- Control de tono mediante *system prompt*: el comportamiento por defecto es neutral, y el usuario puede definir el estilo y la personalidad de las respuestas enviando su propio prompt de sistema.
- Modo "uncensored": la model card indica que se han reducido los rechazos incorporados, lo que permite respuestas más directas en temas que otros modelos podrían bloquear.
- Compatibilidad con runtimes GGUF: funciona con llama.cpp, Ollama, LM Studio y Jan, entre otros.
- No se documentan capacidades de *tool calling*, visión, audio ni soporte multilingüe específico.

## Casos de uso

- Asistentes conversacionales personalizados: al permitir un control total del tono mediante el *system prompt*, se puede configurar un asistente con una personalidad concreta (formal, informal, técnica, etc.) para entornos de atención al cliente o soporte interno.
- Generación de código en entornos locales: el modo de razonamiento y la recomendación de reservar 2000-4000 tokens de salida para código lo hacen adecuado para tareas de programación asistida, como generación de funciones, revisión de fragmentos o explicación de algoritmos, sin depender de servicios en la nube.
- Prototipado rápido con Ollama: gracias a la integración directa con Ollama (`ollama run hf.co/cyberneurova/cyberneurova-Qwen3.8-27B-GGUF:Q4_K_M`), se puede desplegar un modelo de 27B en una máquina de desarrollo para pruebas de concepto en horas.
- Investigación sobre modelos con menos restricciones: el carácter "uncensored" permite estudiar el comportamiento de un modelo sin filtros de seguridad, siempre que se respeten las leyes aplicables y se asuma la responsabilidad del uso.
- Despliegue en entornos sin conexión: al ser un archivo GGUF autocontenido, se puede ejecutar en equipos aislados de Internet, lo que resulta útil en entornos corporativos con políticas de seguridad estrictas.
- Educación y demostraciones técnicas: la disponibilidad de múltiples cuantizaciones permite mostrar cómo varía la calidad de salida en función del tamaño del archivo, útil para talleres sobre inferencia local y optimización de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Los tamaños de archivo publicados son: Q2_K (~10 GB), Q3_K_M (~13 GB), Q4_K_M (~17 GB), Q5_K_M (~19 GB), Q6_K (~22 GB) y Q8_0 (~29 GB). Para cargar el modelo en memoria se necesita al menos esa cantidad de RAM o VRAM, más un margen para el contexto y los *overheads* del runtime.
- Con la cuantización Q2_K (~10 GB) podría ejecutarse en GPUs de consumo con 12 GB de VRAM, como una RTX 3060 o RTX 4070, aunque no se garantiza un rendimiento óptimo.
- La cuantización recomendada por el autor es Q4_K_M (~17 GB), que requiere una GPU con al menos 20 GB de VRAM (por ejemplo, RTX 3090, RTX 4090 o A5000) o un sistema con suficiente RAM para ejecución solo CPU.
- Las cuantizaciones Q6_K y Q8_0 (~22-29 GB) necesitan GPUs de gama alta o servidores con múltiples GPUs.
- Opciones de despliegue: llama.cpp (con `llama-cli` o `llama-server`), Ollama, LM Studio y Jan. No se mencionan otros frameworks como vLLM o TGI.
- No se proporcionan datos de latencia ni *throughput*.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (tamaño 27B, formato GGUF, características "uncensored" y de razonamiento). Por tanto, no es posible realizar una comparativa fundamentada.

## Limitaciones y advertencias

- El modelo se describe como "uncensored" y con "reduced built-in refusals", lo que implica un mayor riesgo de generar contenido inapropiado, ofensivo o potencialmente dañino. El usuario es el único responsable de su uso y de cumplir con la legislación vigente.
- No se especifican sesgos conocidos, pero al no documentarse el proceso de entrenamiento, no se puede descartar la presencia de sesgos de género, raza o ideológicos.
- Riesgo de alucinación: no se menciona explícitamente, pero es inherente a los modelos de lenguaje. La ausencia de benchmarks impide evaluar su fiabilidad en tareas factuales.
- Limitaciones de contexto: no se documenta la longitud máxima de contexto. La recomendación de reservar 1500-4000 tokens de salida sugiere que el contexto útil podría ser limitado, y respuestas largas pueden truncarse si no se configura adecuadamente.
- La licencia Apache 2.0 permite uso comercial, pero el *disclaimer* indica que el modelo se proporciona "as-is, without warranty", por lo que no hay garantías sobre su funcionamiento en producción.
- No hay información sobre el rendimiento en idiomas distintos del inglés; la model card no especifica idiomas soportados.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/cyberneurova/cyberneurova-Qwen3.8-27B-GGUF
- Modelo base (safetensors): https://huggingface.co/cyberneurova/cyberneurova-Qwen3.8-27B
- Sitio web del proyecto: https://cyberneurova.ai
- Correo de soporte: support@cyberneurova.com

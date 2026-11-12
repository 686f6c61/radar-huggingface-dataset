# larkus-industries/gemma-3-270m-it-W8A16-NPU

## Resumen

Gemma 3 270M IT W8A16 NPU es una compilación cuantizada del modelo Gemma 3 270M IT de Google, publicada por Larkus Industries y optimizada para ejecutarse sobre la NPU Hexagon de los portátiles con procesador Snapdragon X Elite. Se trata de un build W8A16 (pesos de 8 bits, activaciones de 16 bits) pensado para inferencia local en el dispositivo, no en GPU ni en servidores. El modelo base es un transformer decoder-only de 270 millones de parámetros con ajuste por instrucciones, perteneciente a la familia Gemma 3.

La relevancia de esta ficha no está en la capacidad bruta del modelo (270M parámetros es un tamaño muy pequeño), sino en el formato de despliegue: demuestra que es posible llevar un LLM conversacional a la NPU integrada de un PC ARM con velocidades de generación de aproximadamente 110 tokens por segundo y un tiempo hasta el primer token de unos 22 ms, medidos con GenieX sobre un Snapdragon X Elite X1E78100. Esto abre la puerta a asistentes locales de baja latencia sin consumo de GPU dedicada.

El contexto del modelo es de 4.096 tokens, con opción de ventana deslizante en GenieX para conversaciones más largas. La licencia es la Gemma Terms of Use, con las restricciones de uso que ello implica. No hay datos publicados sobre composición del dataset de entrenamiento ni sobre benchmarks estándar en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3), compilado para NPU Hexagon |
| Parametros totales | 270 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (ventana deslizante opcional en GenieX) |
| Tipos de cuantizacion | W8A16 (pesos 8 bits, activaciones 16 bits) |
| Idiomas soportados | no disponible |
| Licencia | Gemma Terms of Use (incluye Gemma Prohibited Use Policy) |
| Formato de pesos | no disponible (build empaquetado para GenieX, no safetensors/GGUF estándar) |

## Arquitectura y entrenamiento

El modelo base es Gemma 3 270M IT, un transformer decoder-only de Google con ajuste por instrucciones. Esta publicación no reentrena el modelo: aplica cuantización W8A16 y compilación para el backend Hexagon NPU mediante GenieX. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base; esos datos corresponden a la ficha oficial de Google y no se reproducen aquí.

La innovación técnica de esta build es el propio pipeline de despliegue: pesos de 8 bits con activaciones de 16 bits para preservar calidad, compilación para la NPU Hexagon de Snapdragon X Elite y ejecución a través de GenieX, que expone tanto CLI interactiva como API compatible con OpenAI. Según el autor, la coincidencia de siguiente token con el modelo en precisión completa es de aproximadamente el 96% en texto retenido y del 95,5% en dispositivo.

## Capacidades

- Generación de texto conversacional en modo chat, con plantilla de instrucciones del modelo base.
- Razonamiento básico y respuestas a preguntas de complejidad baja, limitado por el tamaño de 270M parámetros.
- Generación de código sencillo y tareas de formato de texto, sin garantías para código de producción complejo.
- Soporte multilingüe heredado del modelo base Gemma 3, aunque la lista concreta de idiomas no está disponible en esta ficha.
- Servido como API compatible con OpenAI mediante `geniex serve`, lo que facilita integración con clientes existentes.
- Ejecución local en NPU sin GPU dedicada, con latencia baja (~22 ms hasta el primer token).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio en esta build.

## Casos de uso

- Asistente de escritorio offline: el modelo se ejecuta en la NPU del portátil y puede ofrecer respuestas conversacionales sin conexión, con latencia de ~22 ms al primer token y ~110 tok/s de generación, adecuado para autocompletado y chat ligero.
- Clasificación y etiquetado de texto en local: tareas de categorización de correos, tickets o mensajes que se benefician de ejecución en el dispositivo sin enviar datos a la nube.
- Resumen de notas cortas: con 4.096 tokens de contexto se pueden resumir conversaciones, correos o fragmentos de documentación de longitud moderada.
- Prototipado de aplicaciones con API OpenAI: `geniex serve` permite apuntar clientes existentes al endpoint local para pruebas de integración sin coste de API.
- Filtrado y reescritura de texto en pipelines de escritorio: normalización, reformateo y generación de variaciones de texto con baja latencia.
- Demostraciones y educación: útil para mostrar inferencia de LLM en NPU en entornos docentes o charlas, dado el bajo requisito de hardware (un portátil Snapdragon X Elite).
- Asistente embebido en herramientas de productividad: autocompletado de campos, sugerencias de respuesta y generación de plantillas dentro de aplicaciones de escritorio.

## Benchmarks y rendimiento

Rendimiento medido por el autor en un Snapdragon X Elite (X1E78100) con GenieX:

| Metrica | Valor |
|---|---|
| Generacion | ~110 tokens/s |
| Procesamiento de prompt | 1.100–1.600 tokens/s |
| Tiempo hasta el primer token | ~22 ms |
| Coincidencia de siguiente token (texto retenido) | ~96% |
| Coincidencia de siguiente token (en dispositivo) | ~95,5% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Hardware obligatorio: PC con Snapdragon X Elite (probado en X1E78100); no funciona en GPU NVIDIA/AMD ni en CPU x86 convencional.
- Controlador Hexagon NPU versión 30.0.225 o superior.
- GenieX v0.10 o superior para cargar y servir el modelo.
- Tamaño del repo: 0,6 GB, por lo que cabe holgadamente en el almacenamiento de cualquier portátil.
- No requiere VRAM de GPU dedicada; usa la NPU integrada y memoria del sistema.
- Opciones de despliegue: GenieX (CLI `geniex infer`, servidor `geniex serve` compatible con OpenAI). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Throughput y latencia: ~110 tok/s de generación, 1.100–1.600 tok/s de procesamiento de prompt, ~22 ms hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| Gemma 3 270M IT W8A16 NPU (este) | 270M | 4.096 | NPU Hexagon / GenieX | Gemma Terms | Optimizado para Snapdragon X Elite |
| google/gemma-3-270m-it | 270M | no disponible en esta ficha | GPU/CPU estándar (transformers, etc.) | Gemma Terms | Modelo base en precisión completa |
| Gemma 3 1B IT | ~1B | no disponible en esta ficha | GPU/CPU estándar | Gemma Terms | Mayor capacidad, más requisitos |
| Qwen2.5 0.5B Instruct | ~500M | no disponible en esta ficha | GPU/CPU, llama.cpp, Ollama | Apache 2.0 | Alternativa de tamaño similar con licencia permisiva |

La comparación con alternativas de tamaño similar está limitada porque esta build solo se ejecuta en hardware Snapdragon X Elite; en cualquier otro entorno habría que usar el modelo base o una cuantización GGUF estándar.

## Limitaciones y advertencias

- Modelo de 270M parámetros: capacidad de razonamiento, conocimiento factual y coherencia limitadas; propenso a respuestas superficiales o incorrectas en tareas complejas.
- Riesgo de alucinación elevado en preguntas factuales, especialmente con contexto corto.
- El autor reconoce que ocasionalmente una respuesta corta se desvía respecto al modelo en precisión completa.
- Contexto máximo de 4.096 tokens; para conversaciones largas hay que usar `--sliding-window`, lo que implica pérdida de información previa.
- Dependencia total de hardware Snapdragon X Elite y controlador Hexagon 30.0.225+; no es portable a otros entornos.
- Licencia Gemma Terms of Use con Gemma Prohibited Use Policy: revisar restricciones antes de uso comercial.
- GenieX inserta un system prompt por defecto si no se especifica uno; conviene definir uno propio con `-s` para controlar el comportamiento.
- Sin datos publicados sobre sesgos, idiomas soportados ni evaluación estándar; no apto para producción crítica sin validación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/larkus-industries/gemma-3-270m-it-W8A16-NPU
- Modelo base: https://huggingface.co/google/gemma-3-270m-it
- GenieX: https://geniex.aihub.qualcomm.com/
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy

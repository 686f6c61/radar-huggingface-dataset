# chenhaodev/rxreader-qwen3.5-0.8b

## Resumen

rxreader (医嘱读析器) es un adaptador LoRA entrenado sobre Qwen3.5-0.8B que extrae de instrucciones médicas dos categorías de subcadenas literales: la información dura que debe conservarse palabra por palabra (dosis, frecuencias, valores numéricos, contraindicaciones) y los términos técnicos que requieren una explicación en lenguaje llano para pacientes ancianos. El resultado se inyecta como prompt de sistema en un LLM grande para que traduzca la prescripción a un lenguaje comprensible sin perder datos críticos ni inventar información.

Desarrollado por chenhaodev, el modelo responde a un problema concreto: los modelos grandes tienden a omitir o alterar cifras al reformular textos médicos, y a introducir detalles que no estaban en el original. rxreader actúa como un preprocesador de bajo coste (0,8B parámetros, cuantización Q4 de aproximadamente 540 MB) que fija los puntos que no pueden variar y los términos que deben aclararse, reduciendo el error en la tarea de transposición a lenguaje accesible.

El modelo está pensado para ejecutarse localmente con Ollama (1-2 segundos por inferencia) y se distribuye bajo licencia Apache 2.0, con soporte exclusivo para chino (zh). Incluye pesos en GGUF y safetensors, y su contexto de trabajo en Ollama se configura a 8192 tokens, aunque el modelo base Qwen3.5 soporta hasta 262K tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-0.8B (hybrid gated delta networks) + LoRA (r=32, α=64) |
| Parametros totales | 772.845.888 (modelo base) + adaptador LoRA (tamano no disponible) |
| Parametros activos | 772.845.888 (no es MoE; todos activos) |
| Longitud de contexto | 262.144 tokens (modelo base); 8.192 configurado en el Modelfile de Ollama |
| Tipos de cuantizacion | Q4_K_M (GGUF); safetensors sin cuantizar |
| Idiomas soportados | zh (chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF, safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B pertenece a la serie Qwen3.5 de Alibaba Cloud, que emplea una arquitectura híbrida de "gated delta networks" con atención lineal y ventana de contexto de 262K tokens. Sobre este modelo se ha entrenado un adaptador LoRA con r=32 y α=64, learning rate 2e-4, 3 épocas, calculando la pérdida únicamente sobre el segmento de asistente. El entrenamiento utilizó 1.844 muestras (97 de validación) extraídas de un test set de 270 casos de traducción médico-geriátrica, con etiquetas "silver" generadas por deepseek-v4-flash y validadas mediante verificación de subcadenas literales (cada etiqueta debe ser una subcadena exacta del texto original). No se aplicó RLHF ni DPO; el ajuste es puramente supervisado sobre el formato de salida de dos líneas (`保留:` y `解释:`).

## Capacidades

- Extracción de subcadenas literales de texto médico en dos categorías: información a conservar (dosis, frecuencias, tiempos, rangos numéricos, contraindicaciones, condiciones de consulta médica) y términos a explicar (nombres de fármacos, siglas, conceptos técnicos).
- Salida estructurada en dos líneas (`保留: ...` / `解释: ...`), con `-` cuando una categoría está vacía y `-` global si ambas lo están.
- Compatible con el protocolo de chat de Ollama y con la API REST de Ollama (`/api/chat`), incluyendo el parámetro `think: false` para evitar el modo de razonamiento.
- Funciona como preprocesador para cualquier LLM grande: el resultado se inyecta como prompt de sistema para guiar la reformulación sin que el modelo final alucine cifras.
- Verificación de subcadenas en la capa de orquestación: los fragmentos que no coinciden con el original se descartan (con opción de "adsorción" por similitud ≥ 0.75).
- Bajo coste computacional: 0,8B parámetros, apto para CPU y GPU de consumo.

## Casos de uso

- Traducción de instrucciones médicas a lenguaje para personas mayores: el modelo extrae dosis y términos técnicos de una prescripción, y el LLM grande las reformula en frases sencillas. Es el caso de uso principal y el que valida el benchmark core80.
- Asistente de farmacia para verificación de dosis: un farmacéutico introduce la receta y rxreader señala las cifras que no pueden alterarse, reduciendo el riesgo de error humano al explicar la posología al paciente.
- Soporte a cuidadores no profesionales: un cuidador copia la indicación médica y recibe una versión con los números destacados y los términos aclarados, sin necesidad de conocimientos clínicos.
- Integración en sistemas de telemedicina: como paso previo a un chatbot de consulta, rxreader garantiza que el historial de medicación se transmita al modelo conversacional sin pérdida de datos críticos.
- Generación de material educativo para pacientes: hospitales o aseguradoras pueden producir folletos de alta con las dosis resaltadas y explicaciones de cada término, usando rxreader como capa de control de fidelidad.
- Validación de textos médicos generados por IA: antes de publicar o enviar una respuesta generada, se compara contra las subcadenas extraídas por rxreader para detectar omisiones o invenciones de cifras.
- Preprocesamiento en pipelines de agentes de salud: un agente que gestiona recordatorios de medicación puede usar rxreader para extraer las reglas de dosificación y programar alertas sin depender de la interpretación libre del LLM.

## Benchmarks y rendimiento

El autor publica resultados de una evaluación ciega (core80) sobre 80 casos de un test set de 270, con tres jueces que votan en tres dimensiones: "听得懂" (comprensibilidad), "说得对且全" (corrección y completitud) y "分寸" (adecuación). La comparación es entre respuestas de un LLM grande con y sin el hint generado por rxreader.

| Metrica | Con hint (rxreader) | Sin hint (modelo desnudo) |
|---|---|---|
| Votos a nivel de caso (mayoria de 3 jueces) | 55 | 21 (4 empates) |
| Dimension "correccion y completitud" | 159 | 67 |
| Dimension "comprensibilidad" | 99 | 96 |
| Dimension "adecuacion" | 74 | 45 |

Tambien se reportan comparaciones contra un oraculo (el propio LLM grande actuando como extractor) en subconjuntos de 40 casos: el oraculo obtuvo 29:11 con +59 de fidelidad, mientras que rxreader-v1 obtuvo 26:11 (+51) en el primer lote y 29:10 (+41) en el segundo. El ruido de fondo de dos generaciones identicas se estima en 17:22, lo que sugiere que la ventaja de rxreader supera la variabilidad aleatoria.

## Requisitos de hardware

- VRAM estimada: aproximadamente 540 MB con cuantizacion Q4_K_M (0,8B parametros). Cabe en cualquier GPU de consumo con 2 GB o mas, y tambien en CPU.
- GPUs recomendadas: cualquier GPU moderna (RTX 3060, RTX 4090, A10, A100) o simplemente CPU; el autor reporta 1-2 segundos por inferencia en Ollama con cuantizacion Q4.
- Opciones de despliegue: Ollama (Modelfile incluido en la model card), llama.cpp, y cualquier servidor compatible con GGUF (vLLM, TGI). Tambien se puede cargar el adaptador LoRA sobre safetensors con transformers.
- Latencia: 1-2 segundos por consulta en Ollama local (Q4, sin GPU dedicada). Throughput no publicado.

## Comparativa con modelos similares

No se han encontrado modelos publicados que realicen exactamente la misma tarea (extraccion de subcadenas medicas para reformulacion geriatrica). Como referencia, se compara con el modelo base sin adaptador y con la alternativa de usar un LLM grande directamente:

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rxreader (Qwen3.5-0.8B + LoRA) | 0,8B | 262K (8K en Ollama) | Extraccion de subcadenas medicas | Apache 2.0 | Hugging Face, GGUF |
| Qwen3.5-0.8B (base) | 0,8B | 262K | LLM general | Apache 2.0 | Hugging Face |
| LLM grande sin preprocesador | 7B-70B | variable | Reformulacion directa | variable | variable |

La ventaja de rxreader frente al LLM grande sin hint es la fidelidad numerica (55:21 en el benchmark) y su coste marginal minimo; frente al modelo base, el adaptador aporta el formato de salida estructurado y la especializacion en el dominio medico-geriatrico.

## Limitaciones y advertencias

- Solo soporta chino (zh); no hay versiones para otros idiomas.
- El entrenamiento usó etiquetas silver generadas por otro modelo (deepseek-v4-flash), por lo que los errores de extraccion del generador pueden propagarse; el autor indica que esto solo degrada la calidad, no la seguridad, porque el LLM final siempre puede contrastar con el texto original.
- El modelo no elimina la alucinacion del LLM grande: el ejemplo de la model card muestra que el modelo final añadió "芬必得" (un nombre comercial) como ejemplo de ibuprofeno, algo que no estaba en el original. rxreader fija lo que debe conservarse, pero no impide que el LLM añada contenido nuevo.
- Requiere una capa de orquestacion que verifique que cada fragmento extraido sea una subcadena literal del texto original; sin esa verificacion, pueden colarse fragmentos invalidos.
- No es un modelo conversacional general: su unica salida es el par de lineas estructuradas. No debe usarse como chatbot ni para responder preguntas medicas directamente.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no ha sido validado clinicamente y no debe sustituir el criterio de un profesional sanitario.
- El contexto de 8K en Ollama es suficiente para prescripciones tipicas, pero no para documentos medicos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chenhaodev/rxreader-qwen3.5-0.8b
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Ficha de Qwen3.5-0.8B en vLLM Recipes: https://recipes.vllm.ai/Qwen/Qwen3.5-0.8B
- Pagina de Qwen3.5-0.8B en Ollama: https://ollama.com/library/qwen3.5:0.8b
- Repositorio de la serie Qwen3.5 en GitHub: https://github.com/ABDtmx/Qwen3.5
- Ficha de Qwen3.5-0.8B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_5_0_8b

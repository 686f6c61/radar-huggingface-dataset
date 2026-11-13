# Kqw1234/llm-course-hw3-tinyllama-qlora

## Resumen

Kqw1234/llm-course-hw3-tinyllama-qlora es un ajuste fino (fine-tuning) del modelo TinyLlama-1.1B, publicado en Hugging Face por el usuario Kqw1234 como parte de un trabajo de curso sobre modelos de lenguaje (el identificador "llm-course-hw3" sugiere una tarea academica de un curso de LLM). El sufijo "qlora" indica que el ajuste se realizo mediante QLoRA, una tecnica de fine-tuning eficiente en parametros que combina cuantizacion de 4 bits del modelo base con adaptadores de bajo rango (LoRA). El modelo cuenta con 1.100.048.384 parametros totales segun los pesos en safetensors, lo que coincide con la arquitectura TinyLlama de aproximadamente 1.1 mil millones de parametros.

El modelo se presenta como un modelo de generacion de texto conversacional (pipeline text-generation, tags "llama", "text-generation", "conversational"). La model card es la plantilla automatica de Hugging Face sin rellenar: no documenta datos de entrenamiento, hiperparametros, dataset de ajuste, licencia ni idiomas. El repositorio ocupa 2.3 GB, coherente con un checkpoint en precision completa (fp32) o con pesos combinados de un adaptador fusionado.

Su relevancia es limitada y de caracter educativo: se trata de un experimento academico sin documentacion tecnica, sin benchmarks publicados y con cero descargas en el momento de la consulta. Resulta util como ejemplo de flujo QLoRA sobre TinyLlama, pero no como modelo de produccion. Cualquier evaluacion seria requiere inspeccionar los archivos del repositorio y el dataset de ajuste, que no se proporcionan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, base TinyLlama) |
| Parametros totales | 1.100.048.384 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (TinyLlama base: 2048 tokens; no confirmado para este ajuste) |
| Tipos de cuantizacion | no disponible en el repositorio; el ajuste se realizo con QLoRA (base en 4 bits durante entrenamiento) |
| Idiomas soportados | no disponible (TinyLlama base: principalmente ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 2.3 GB |
| Pipeline | text-generation |
| Fecha de creacion | 2026-11-13 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Llama, correspondiente a TinyLlama-1.1B: aproximadamente 1.1 mil millones de parametros, 22 capas, dimension oculta de 2048 y atencion multi-cabeza con RoPE. El modelo base TinyLlama fue entrenado con aproximadamente 3 billones de tokens segun su documentacion publica, pero esa cifra corresponde al modelo original, no a este ajuste.

El ajuste se realizo con QLoRA, segun indica el nombre del repositorio. QLoRA congela los pesos del modelo base cuantizados a 4 bits (normalmente NF4 con doble cuantizacion) y entrena adaptadores LoRA de bajo rango sobre las proyecciones de atencion y MLP. No se dispone de informacion sobre el dataset de ajuste, el rango de los adaptadores, la tasa de aprendizaje, el numero de pasos ni si los adaptadores se fusionaron en los pesos finales. La model card no documenta ninguna innovacion tecnica adicional ni procesos de RLHF o DPO.

## Capacidades

- Generacion de texto autoregresiva en el estilo del modelo base TinyLlama.
- Generacion conversacional multi-turno (tag "conversational"), aunque sin plantilla de chat documentada.
- Razonamiento basico y respuesta a preguntas simples, limitado por el tamano del modelo (1.1B).
- Generacion de codigo y matematicas a nivel elemental, herencia del modelo base; no verificado en este ajuste.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no documentadas; el modelo base esta orientado al ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Experimentacion academica con QLoRA: el modelo sirve como referencia de un flujo completo de ajuste eficiente sobre TinyLlama, util para comparar hiperparametros y tecnicas de cuantizacion en entornos con una sola GPU.
- Prototipado de chatbots ligeros en local: con 1.1B parametros cabe en GPUs de consumo y permite iterar rapidamente sobre plantillas de prompt y formatos de conversacion antes de escalar a modelos mayores.
- Pruebas de integracion con transformers y text-generation-inference: el tag "endpoints_compatible" permite desplegarlo en infraestructura de inferencia compatible con la API de Hugging Face para validar pipelines.
- Generacion de texto de bajo coste en CPU: cuantizado a 4 u 8 bits, el modelo puede ejecutarse en portatiles sin GPU para tareas de generacion simple y demostraciones.
- Educacion y divulgacion: util para explicar el funcionamiento de LoRA y QLoRA, inspeccionando los adaptadores y comparando el comportamiento antes y despues del ajuste.
- Baseline en evaluaciones internas: sirve como punto de partida de bajo coste para medir mejoras de modelos mayores en tareas concretas del dominio del dataset de ajuste (desconocido).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2.2 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica unos 3-4 GB.
- VRAM estimada en cuantizacion de 4 bits (GGUF/AWQ/GPTQ): aproximadamente 0.7-1 GB para pesos, unos 2 GB en total con contexto moderado.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM (RTX 3050, RTX 3060, RTX 4060, T4); para lotes grandes o contexto largo, A10G o A100 son sobredimensionadas pero validas.
- Cabe en GPU de consumo: si, en la mayoria de GPUs modernas de 4-8 GB; tambien en CPU con llama.cpp.
- Opciones de despliegue: transformers (formato nativo safetensors), text-generation-inference (tag endpoints_compatible), vLLM, llama.cpp/Ollama previa conversion a GGUF, y servidores compatibles con la API de OpenAI.
- Latencia y throughput estimados: no disponibles; para un modelo de 1.1B en una RTX 4090 se espera un throughput alto (cientos de tokens por segundo en fp16), pero no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Kqw1234/llm-course-hw3-tinyllama-qlora | 1.1B | no disponible | no disponible | Hugging Face, 0 descargas | Ajuste academico sin documentar |
| TinyLlama/TinyLlama-1.1B-Chat-v1.0 | 1.1B | 2048 | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base de referencia, documentado y con benchmarks |
| Qwen2.5-1.5B-Instruct | 1.5B | 32768 | Apache 2.0 | Hugging Face | Mayor contexto y rendimiento, multilingue |
| SmolLM2-1.7B-Instruct | 1.7B | 8192 | Apache 2.0 | Hugging Face | Alternativa moderna con documentacion completa |

La comparativa muestra que este checkpoint carece de la documentacion, licencia clara y benchmarks que si acompanan a los modelos de referencia de su categoria.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; el modelo base TinyLlama presenta sesgos de genero, raza y religion heredados de sus datos de entrenamiento (principalmente web en ingles).
- Riesgo de alucinacion: alto, como en todos los modelos de 1.1B parametros; no se ha evaluado la calidad del ajuste.
- Limitaciones de contexto e idioma: contexto no confirmado (probablemente 2048 tokens); el modelo base esta orientado al ingles y no se documenta soporte multilingue.
- Restricciones de licencia: la licencia no esta declarada, lo que impide asumir uso comercial; hay que contactar con el autor o inspeccionar el repositorio antes de cualquier uso en produccion.
- Caveat importante: la model card es una plantilla automatica sin datos de entrenamiento, dataset ni hiperparametros; no hay garantia de que el ajuste haya convergido ni de la calidad del checkpoint.
- Sin mantenimiento ni soporte: cero descargas y cero likes en el momento de la consulta; es un artefacto academico, no un modelo mantenido.
- No apto para produccion sin evaluacion previa: no hay benchmarks, evaluaciones de seguridad ni pruebas de robustez publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kqw1234/llm-course-hw3-tinyllama-qlora
- TinyLlama (modelo base): https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Paper de TinyLlama: https://arxiv.org/abs/2401.02385
- Paper de QLoRA: https://arxiv.org/abs/2305.14314
- Paper de LoRA: https://arxiv.org/abs/2106.09685
- Calculadora de impacto ambiental citada en la model card: https://mlco2.github.io/impact
- Paper de Lacoste et al. (2019) citado en la model card: https://arxiv.org/abs/1910.09700

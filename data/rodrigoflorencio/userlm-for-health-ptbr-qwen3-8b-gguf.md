# RodrigoFlorencio/UserLM-for-health-PTBR-Qwen3-8B-GGUF

## Resumen

UserLM-for-health-PTBR-Qwen3-8B-GGUF es una cuantización en formato GGUF de un modelo de lenguaje especializado en portugués brasileño que simula el papel de paciente en dominios sanitarios. Lo desarrolla RodrigoFlorencio a partir de Qwen/Qwen3-8B-Base, sobre el que se ha aplicado un LoRA entrenado con más de 33.000 dudas reales sobre patologías y síntomas extraídas de páginas públicas brasileñas de salud. El resultado se ha fusionado en el modelo base y se distribuye en cuantizaciones Q4_K_M y Q6_K para inferencia local en CPU mediante llama.cpp, Ollama o LM Studio.

La particularidad del modelo es que no funciona como asistente conversacional: invierte el rol habitual y genera la pregunta que formularía un paciente a partir de una intención (intent) indicada en el turno de sistema, que describe una patología o un conjunto de síntomas. Esta inversión de diálogo sigue la receta descrita en el artículo arXiv:2510.06552 ("Flipping the Dialogue") y está pensada para construir simuladores de usuario que alimenten sistemas de evaluación, generación de datos sintéticos o pruebas de asistentes clínicos.

Con 8.190.735.360 parámetros y licencia Apache 2.0, el modelo ocupa un nicho muy concreto: la simulación de pacientes en portugués brasileño para investigación y desarrollo de sistemas de salud, no la orientación médica ni la atención al usuario final. Su relevancia actual radica en la escasez de modelos de usuario (user language models) abiertos y en la posibilidad de ejecutarlo en hardware de consumo gracias a las cuantizaciones publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-8B-Base) con LoRA fusionado |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (~5,0 GB) y Q6_K (~6,7 GB) en GGUF |
| Idiomas soportados | Portugues (pt), variante brasileña |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base y el LoRA se distribuyen por separado en safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B-Base, un transformer decoder-only de 8.190 millones de parámetros, sobre el que se ha aplicado un ajuste fino mediante LoRA. El adaptador se ha entrenado con más de 33.000 preguntas reales de pacientes recopiladas de páginas públicas brasileñas de salud, recogidas en el dataset RodrigoFlorencio/duvidas-saude-ptbr. Posteriormente, el LoRA se ha fusionado con los pesos base y el conjunto resultante se ha convertido a GGUF en dos cuantizaciones (Q4_K_M y Q6_K) para su ejecución en CPU.

El entrenamiento sigue la receta de inversión de diálogo descrita en el artículo arXiv:2510.06552, en la que el modelo aprende a continuar la conversación justo después del encabezado `<|im_start|>user`, tomando como condicionamiento un intent en el turno de sistema con el formato "Pergunta anônima de um paciente em um portal de saúde online sobre {patologia}.". No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO más allá del ajuste supervisado con LoRA.

## Capacidades

- Generación de preguntas de paciente en portugués brasileño coloquial a partir de un intent con patología o descripción de síntomas.
- Simulación de usuario para diálogos clínicos: produce el turno del paciente, no la respuesta del asistente.
- Condicionamiento mediante prompt de sistema con el formato de plantilla ChatML de Qwen (`<|im_start|>system ... <|im_end|><|im_start|>user`).
- Generación de una o varias preguntas por invocación, con control mediante parámetros de muestreo y guardrails externos.
- Ejecución local en CPU mediante llama.cpp, Ollama y LM Studio, con plantilla de Modelfile incluida para Ollama.
- Integración en pipelines propios mediante la API `/api/generate` de Ollama o el endpoint de completions compatible con OpenAI de LM Studio.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking de forma documentada.

## Casos de uso

- Generación de datos sintéticos para entrenamiento de asistentes clínicos: el modelo produce preguntas de paciente realistas en portugués brasileño que pueden usarse como entradas para entrenar o aumentar datasets de sistemas de triaje y atención sanitaria.
- Evaluación de chatbots médicos: un pipeline puede invocar repetidamente al modelo con distintos intents de patología para generar turnos de usuario y medir la calidad de las respuestas del asistente evaluado.
- Pruebas de regresión en sistemas de triaje: la generación controlada de síntomas permite construir suites de test reproducibles para verificar que el sistema clasifica correctamente urgencias y deriva bien a los pacientes.
- Investigación en simulación de usuario: el modelo sirve como componente de un simulador de paciente dentro de entornos de diálogo multi-turno, donde el investigador controla el intent y el modelo genera la formulación lingüística.
- Desarrollo de interfaces de salud en portugués: permite generar textos de ejemplo con vocabulario y estilo de paciente real para maquetas, prototipos y pruebas de usabilidad.
- Análisis lingüístico del discurso del paciente: la salida puede emplearse para estudiar cómo se formulan las dudas sanitarias en portugués coloquial (registro, vocabulario, estructura de la pregunta).
- Despliegue en entornos con recursos limitados: al ejecutarse en CPU con ~8 GB de RAM en Q4_K_M, encaja en estaciones de trabajo sin GPU para tareas de generación por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: ~8 GB de RAM para la cuantización Q4_K_M (~5,0 GB de fichero); ~10 GB de RAM para Q6_K (~6,7 GB de fichero).
- GPU recomendadas: no se especifican; el modelo está validado para ejecución en CPU con llama.cpp. Cualquier GPU con al menos 6-8 GB de VRAM puede alojar la cuantización Q4_K_M mediante llama.cpp con offload parcial o total.
- ¿Cabe en GPU de consumo? Sí, en tarjetas con 8 GB o más de VRAM (por ejemplo, RTX 3060 Ti, RTX 4060, RTX 3070) para la cuantización Q4_K_M; la Q6_K requiere aproximadamente 7 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama (con Modelfile incluido), LM Studio (modo Completion, no Chat) y servidor compatible con OpenAI de LM Studio.
- Latencia y throughput: no disponibles. La model card solo confirma validación de generación real en llama.cpp sobre CPU con Q4_K_M.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Enfoque |
|---|---|---|---|---|---|
| UserLM-for-health-PTBR-Qwen3-8B-GGUF | 8,19 B | no disponible | Portugues (pt-BR) | Apache 2.0 | Simulacion de paciente sanitario |
| Qwen3-8B-Base | 8,19 B | no disponible | Multilingue | Apache 2.0 | Modelo base generalista |
| UserLM-for-health-PTBR-Qwen3-8B-LoRA | 8,19 B (+ LoRA) | no disponible | Portugues (pt-BR) | Apache 2.0 | Version Spaces/API del mismo modelo |
| Modelos de simulacion de usuario abiertos en otros idiomas | no disponible | no disponible | no disponible | no disponible | No se dispone de alternativas comparables documentadas en la informacion proporcionada |

La comparación directa con otros modelos de simulacion de usuario no esta disponible en la informacion proporcionada. El unico pariente directo documentado es la version LoRA del mismo autor, de la que esta GGUF es una conversion cuantizada.

## Limitaciones y advertencias

- El modelo no es un chatbot ni un asistente: genera preguntas de paciente, no respuestas. Usarlo en la interfaz de chat estandar de Ollama o LM Studio produce resultados incorrectos; debe emplearse el modo de generacion cruda o el endpoint de completions.
- No proporciona orientacion medica y no debe utilizarse como herramienta clinica ni para diagnostico, triaje real o consejo sanitario.
- Entrenado exclusivamente en portugues brasileño; no se garantiza un comportamiento correcto en otras variantes del portugues ni en otros idiomas.
- Sesgos potenciales derivados de las fuentes publicas brasileñas utilizadas: pueden estar sobrerrepresentadas ciertas patologias, registros linguisticos o poblaciones, y el modelo puede reproducir estereotipos presentes en esos textos.
- Riesgo de alucinacion y de generar preguntas clinicamente incoherentes o con detalles inventados, especialmente con intents libres o descripciones de sintomas no estructuradas.
- La model card advierte de que los intents genericos por patologia producen preguntas mas aderentes al tema que las descripciones libres de sintomas.
- Requiere guardrails externos (temperatura 1.0, top_p 0.8, stop en `<|im_end|>` y `<|im_start|>`, num_predict ~110, limpieza de codepoints no latinos, corte en la ultima frase completa y re-muestreo en duplicados) para evitar artefactos de plantilla y repeticiones.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias y la responsabilidad sobre el uso recae en el integrador.
- No hay informacion publica sobre la longitud de contexto efectiva, el numero de tokens de entrenamiento ni evaluaciones cuantitativas de calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RodrigoFlorencio/UserLM-for-health-PTBR-Qwen3-8B-GGUF
- Version LoRA / Spaces / API: https://huggingface.co/RodrigoFlorencio/UserLM-for-health-PTBR-Qwen3-8B-LoRA
- Dataset de entrenamiento: https://huggingface.co/datasets/RodrigoFlorencio/duvidas-saude-ptbr
- Articulo de referencia (recipe): https://arxiv.org/abs/2510.06552
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base

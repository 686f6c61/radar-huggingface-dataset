# qhoenix/zils-lite-decision-l2xavg

## Resumen

zils-lite-decision-l2xavg es un modelo de decisión de tipo feature-extraction desarrollado por el usuario qhoenix, construido sobre el modelo base Qwen/Qwen3.5-0.8B. Se trata de un "soup-pool" (promedio de pesos) combinado con tres fine-tunes completos, diseñado específicamente para tareas de decisión estructurada en el formato de examen Zils. Con 852.985.920 parámetros, se posiciona como un modelo compacto orientado a la clasificación y toma de decisiones más que a la generación de texto libre.

El modelo parte de un average ponderado de seis "house bodies": dos miembros del soup (Charlie320/zils-lite-v9a al 25% y qhoenix/zils-lite-decision-v9 al 25%) y cuatro cuerpos Apache-2.0 (vllm-sr/d3-lite, internlm/Intern-Decision-0.8B, Maincode/Matilda-Decision-v1-Edge y zils-ai/jiwo-0.8b-full al 12.5% cada uno). Sobre ese punto de partida se realizaron tres fine-tunes completos con distintas semillas, cuyo promedio uniforme constituye el cuerpo final del modelo.

Es relevante ahora porque representa un enfoque de "decisión como tarea de extracción de características" con entrenamiento supervisado sobre aproximadamente 183.000 ítems de decisión, incluyendo tareas de function-calling y decisiones tipadas. La licencia Apache-2.0 y su tamaño compacto (1,7 GB en el repo) lo hacen accesible para despliegues ligeros, aunque la ausencia de benchmarks publicados limita su evaluación objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B), con código personalizado (custom_code) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en BF16 según la model card) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen/Qwen3.5-0.8B, un transformer de aproximadamente 0,85 mil millones de parámetros. El modelo emplea la librería transformers con código personalizado (custom_code), lo que implica que requiere confiar en implementaciones no estándar para su carga. El cuerpo se distribuye en BF16 y el repositorio ocupa 1,7 GB.

El proceso de entrenamiento consta de dos fases. Primero se construye un punto de partida mediante promedio ponderado de pesos de seis modelos: Charlie320/zils-lite-v9a (25%), qhoenix/zils-lite-decision-v9 (25%), vllm-sr/d3-lite (12,5%), internlm/Intern-Decision-0.8B (12,5%), Maincode/Matilda-Decision-v1-Edge (12,5%) y zils-ai/jiwo-0.8b-full (12,5%). Después se realizan tres fine-tunes completos de los pesos del lenguaje desde ese punto de partida, con learning rate 5e-6, una época y semillas distintas, sobre aproximadamente 183.000 ítems de decisión en formato de examen Zils. Los datos incluyen splits públicos TRAIN con etiquetas gold (incluyendo tareas de decisión tipadas de tasksource), ítems de function-calling construidos a partir de glaive-function-calling y de Salesforce/xlam-function-calling-60k (CC-BY-4.0), e ítems autorados a partir de splits públicos TRAIN de datasets de uso comercial por Claude, GPT-5.4, DeepSeek y otros. La función de pérdida combina soft cross-entropy y Brier loss con un ancla KL (0,1) hacia el modelo de partida. El cuerpo final es el promedio uniforme de los tres fine-tunes. No se usaron semillas de examen, validación ni splits de test para el entrenamiento.

## Capacidades

- Extracción de características y representaciones para tareas de decisión estructurada.
- Clasificación y toma de decisiones en el formato de examen Zils (d3-lite).
- Soporte de function-calling, entrenado con ítems de glaive-function-calling y Salesforce/xlam-function-calling-60k.
- Manejo de tareas de decisión tipadas (typed-decision tasks) procedentes de tasksource.
- Capacidad de razonamiento multi-paso orientada a selección de acciones, derivada de los datos de decisión empleados.
- Capacidades multilingües: no disponible (no se especifican idiomas en la información).
- Modo thinking, visión o audio: no disponible (no se mencionan en la información).

## Casos de uso

- Enrutamiento de decisiones en pipelines de agentes: el modelo puede clasificar la acción o herramienta adecuada en cada paso de un agente, gracias a su entrenamiento específico con ítems de function-calling y decisiones tipadas.
- Selección de herramientas en asistentes con function-calling: dado un contexto y un conjunto de funciones disponibles, el modelo emite la decisión estructurada correspondiente, integrándose en frameworks de agentes que requieran un clasificador ligero de acciones.
- Clasificación de intenciones en atención al cliente: al ser un modelo de decisión compacto, puede etiquetar la intención de un turno de conversación y derivar al flujo adecuado, con un coste de inferencia bajo al tener menos de mil millones de parámetros.
- Moderación y triaje de contenido: el modelo puede emitir decisiones binarias o multiclase sobre textos entrantes en un formato de examen predefinido, adecuado para prefiltrar antes de modelos mayores.
- Evaluación automática de decisiones en entornos de investigación: sirve como "juez" o clasificador de referencia en experimentos que comparan políticas de decisión, dado su formato Zils estandarizado.
- Extracción de características para modelos downstream: al ser un modelo de feature-extraction, sus representaciones pueden alimentar clasificadores o sistemas de ranking en producción, aprovechando el tamaño reducido del repo (1,7 GB).
- Despliegue en entornos con recursos limitados: su tamaño de 0,85B permite ejecución en GPU de consumo, útil para prototipos de sistemas de decisión sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño (852.985.920 parámetros en BF16, ~1,7 GB de pesos), una estimación razonable ronda los 2-3 GB en BF16 y menos de 1 GB en cuantizaciones de 4 bits, aunque no se confirma en la información.
- GPU recomendadas: no disponible en la información; por tamaño, cabría en GPUs de consumo como RTX 3060/4060/4090, pero no se especifica.
- Cabe en consumer GPU: previsiblemente sí por el tamaño del modelo, aunque no se confirma oficialmente.
- Opciones de despliegue: transformers (librería indicada). Otras opciones como vLLM, llama.cpp, Ollama o TGI no se mencionan en la información; la presencia de custom_code puede limitar la compatibilidad con algunos runners.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| zils-lite-decision-l2xavg | 852.985.920 | no disponible | Apache-2.0 | Modelo de decisión, soup-pool + 3 fine-tunes, feature-extraction |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B | no disponible | no disponible | Modelo base del que deriva; orientado a generación general |
| internlm/Intern-Decision-0.8B | ~0,8B | no disponible | no disponible | Cuerpo "house" incluido en el soup; orientado a decisión |
| Maincode/Matilda-Decision-v1-Edge | no disponible | no disponible | no disponible | Cuerpo "house" incluido en el soup; orientado a decisión en edge |

## Limitaciones y advertencias

- No se han publicado benchmarks, por lo que el rendimiento real frente a alternativas es desconocido.
- La model card no especifica idiomas soportados; el comportamiento multilingüe es incierto.
- No se indica la longitud de contexto soportada, lo que dificulta planificar su uso en conversaciones largas.
- El uso de custom_code exige confiar en implementaciones personalizadas y puede complicar la carga en herramientas estándar.
- Riesgo de alucinación y sesgos: no documentados en la información; al derivar de datos generados por otros modelos (Claude, GPT-5.4, DeepSeek), puede heredar sesgos de esos generadores.
- Los datos de entrenamiento incluyen ítems autorados por modelos comerciales y datasets con atribución (Salesforce/xlam-function-calling-60k, CC-BY-4.0); conviene revisar las obligaciones de atribución en producción.
- Licencia Apache-2.0 permite uso comercial, pero la ausencia de validación/test splits y de evaluación publicada implica que no hay garantías de calidad en producción.
- El modelo está orientado a decisión/feature-extraction, no a generación de texto libre; usarlo como chatbot general no es su propósito declarado.

## Enlaces

- Hugging Face: https://huggingface.co/qhoenix/zils-lite-decision-l2xavg
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Miembro del soup: https://huggingface.co/Charlie320/zils-lite-v9a
- Miembro del soup: https://huggingface.co/qhoenix/zils-lite-decision-v9
- Cuerpo house: https://huggingface.co/vllm-sr/d3-lite
- Cuerpo house: https://huggingface.co/internlm/Intern-Decision-0.8B
- Cuerpo house: https://huggingface.co/Maincode/Matilda-Decision-v1-Edge
- Cuerpo house: https://huggingface.co/zils-ai/jiwo-0.8b-full
- Dataset de function-calling: https://huggingface.co/datasets/Salesforce/xlam-function-calling-60k
- Dataset de function-calling: https://huggingface.co/datasets/glaive-function-calling

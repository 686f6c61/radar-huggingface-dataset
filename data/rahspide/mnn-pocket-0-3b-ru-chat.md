# Rahspide/MNN-Pocket-0.3B-RU-Chat

## Resumen

MNN-Pocket-0.3B-RU-Chat es un modelo de lenguaje de 0,36 mil millones de parámetros diseñado como asistente conversacional en ruso, desarrollado por Rahspide. Se construye mediante ajuste supervisado (SFT) sobre el modelo de continuación `Rahspide/MNN-Pocket-0.3B-RU`, que a su vez deriva del base `taobao-mnn/MNN-Pocket-0.3B-Base` (bilingüe chino-inglés), con el objetivo de dotar al modelo de capacidades de seguimiento de instrucciones y diálogo multi-turno en ruso.

La relevancia del proyecto radica en su enfoque de separación de tareas: el autor mantiene dos checkpoints con el mismo origen, uno para continuación de texto (autocompletado, sugerencias de teclado) y otro para asistencia conversacional, argumentando que entrenar un único modelo para ambas tareas produce resultados mediocres en cada una. El modelo emplea la plantilla ChatML nativa (`<|im_start|>` / `<|im_end|>`) y está pensado para despliegue en dispositivo (on-device) mediante el runtime MNN.

Es importante señalar que, en el momento de redacción de esta ficha, el modelo **no ha sido entrenado**: la model card describe un plan de entrenamiento y no existen pesos publicados. Todos los datos técnicos que se indican a continuación provienen de la planificación del autor y deben considerarse provisionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3, según tags); runtime MNN para despliegue on-device |
| Parámetros totales | 0,36B (aproximadamente 360 millones) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la model card indica "no long-context dialogue") |
| Tipos de cuantización | no disponible |
| Idiomas soportados | ruso (ru), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (no existen pesos publicados; el ecosistema MNN sugiere conversión a formato MNN, no confirmado) |

## Arquitectura y entrenamiento

El modelo parte de `Rahspide/MNN-Pocket-0.3B-RU`, un checkpoint de continuación de texto entrenado con preentrenamiento continuado sobre 1.200 millones de tokens de texto en ruso a partir del base `taobao-mnn/MNN-Pocket-0.3B-Base`. Sobre ese punto de partida, el plan de SFT contempla ajuste completo (full fine-tuning) con LoRA como alternativa si no cabe en los recursos disponibles, una rejilla de learning rate entre 1e-4 y 3e-4, y pérdida calculada únicamente sobre los tokens del asistente, enmascarando los turnos de sistema y usuario. Los diálogos multi-turno se mantienen como un único ejemplo con empaquetado y fronteras explícitas.

Los datos planificados combinan `IlyaGusev/saiga_scored` (instrucciones en ruso con puntuaciones de calidad) como núcleo, `IlyaGusev/ru_turbo_alpaca` (CC-BY-4.0) como volumen de relleno y un 10-20 % de repetición de instrucciones en inglés procedente de `HuggingFaceH4/ultrachat_200k` (MIT) para preservar el seguimiento de instrucciones bilingüe. Se probarán tres volúmenes de datos (aproximadamente 5k, 20k y 50k ejemplos) con parada temprana sobre una partición rusa reservada, y se planea una ejecución de control sobre el modelo instruct oficial `taobao-mnn/MNN-Pocket-0.3B` con los mismos datos para distinguir la pérdida de capacidad asistente durante el preentrenamiento de su ausencia original. El pipeline incluye deduplicación por texto normalizado, descarte de ejemplos de menos de 16 tokens y comprobación de fuga de datos hacia los conjuntos de test de MERA.

## Capacidades

- Generación de texto conversacional en ruso con seguimiento de instrucciones (planificado, no verificado).
- Diálogo multi-turno de 2-3 turnos con coherencia limitada (objetivo de evaluación declarado).
- Respuestas cortas a preguntas y reformulaciones breves.
- Seguimiento de instrucciones bilingüe ruso-inglés gracias a la repetición de datos en inglés.
- Plantilla ChatML nativa para formateo de roles sistema/usuario/asistente.
- Despliegue on-device mediante el runtime MNN.
- No soporta tool calling ni function calling (declarado explícitamente en las limitaciones).
- No es un modelo de código ni de razonamiento multi-paso fiable.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Asistente conversacional ligero en aplicaciones móviles: el tamaño de 0,36B y el runtime MNN permiten ejecución local en dispositivos sin conexión, gestionando diálogos cortos de preguntas y respuestas en ruso.
- Sugerencias de respuesta en mensajería: dado un mensaje entrante, el modelo puede generar una respuesta breve en ruso, aprovechando su entrenamiento específico para formato de asistente frente al modelo hermano de continuación.
- Reformulación y simplificación de textos cortos: adecuado para tareas de reescritura de frases en ruso donde no se requiere precisión factual alta.
- Filtrado y clasificación conversacional en pipelines de bajo coste: su reducido tamaño permite desplegar muchas instancias en paralelo para tareas de etiquetado o respuestas plantilla.
- Prototipado rápido de interfaces de chat en ruso: útil para validar UX de asistentes antes de escalar a modelos mayores, con la ventaja de licencia Apache-2.0 para uso comercial.
- Educación y práctica de idiomas: puede servir como interlocutor básico en ruso para ejercicios de conversación guiada, con respuestas cortas y controladas.
- Investigación sobre ajuste supervisado en modelos pequeños: el repositorio documenta un plan experimental reproducible (volúmenes de datos, rejillas de LR, ejecución de control) útil para estudiar el equilibrio entre continuación y asistencia en modelos de menos de 1B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe un plan de evaluación que incluye revisión manual ciega de 50-100 diálogos en ruso (seguimiento de instrucciones, naturalidad, rechazo correcto, coherencia en 2-3 turnos), tareas selectivas de MERA compatibles con el formato y contexto de un modelo de 0,3B, y comprobaciones de no regresión frente al modelo hermano de continuación (bits/carácter en ruso) y de no colapso de las respuestas en inglés. Ninguno de estos resultados está disponible todavía.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 0,36B en FP16 se estiman del orden de 0,7-1 GB de pesos, y menos de 0,5 GB en cuantizaciones de 4 bits, aunque estas cifras no están confirmadas por el autor.
- GPU recomendadas: no disponible. Por tamaño, el modelo cabría en cualquier GPU consumer moderna (RTX 3060 en adelante), pero no hay validación publicada.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño, aunque no hay datos oficiales.
- Opciones de despliegue: el proyecto está orientado al runtime MNN para on-device; la librería declarada es transformers, por lo que también sería desplegable con vLLM, llama.cpp, Ollama o TGI si se generan los formatos correspondientes (no confirmado).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| MNN-Pocket-0.3B-RU-Chat (este) | 0,36B | no disponible | ru, en | Apache-2.0 | No entrenado (plan) |
| MNN-Pocket-0.3B-RU (hermano) | 0,36B | no disponible | ru, en | Apache-2.0 | Modelo de continuación, mismo origen |
| taobao-mnn/MNN-Pocket-0.3B-Base | 0,3B | no disponible | zh, en | Apache-2.0 (heredada) | Base bilingüe sin ruso |
| Qwen3 (familia, referencia arquitectónica) | varios tamaños | no disponible | multilingüe | según variante | Disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo no ha sido entrenado: no existen pesos y la model card es únicamente un plan. No es usable en producción.
- Con 0,36B de parámetros, se esperan respuestas cortas, conocimiento factual débil y razonamiento multi-paso no fiable.
- Los datos de SFT en ruso son mayoritariamente traducciones automáticas o generados por modelos, por lo que el estilo será más plano que el de una conversación humana.
- El tokenizador heredado del modelo hermano presenta un coste de aproximadamente 3,3 tokens por palabra en ruso, lo que reduce el contexto efectivo.
- No es un modelo de código, no soporta tool calling y no está diseñado para diálogos de contexto largo.
- Riesgo de alucinación elevado por tamaño y por la naturaleza de los datos de entrenamiento.
- Sesgos conocidos: no documentados; previsiblemente hereda los sesgos de los datasets Saiga y ru_turbo_alpaca, no auditados en la model card.
- La licencia Apache-2.0 permite uso comercial, pero se hereda a través de `MNN-Pocket-0.3B-RU` desde `taobao-mnn/MNN-Pocket-0.3B-Base`; conviene verificar la cadena de licencias antes de explotación comercial.
- El autor excluye explícitamente datasets cuya licencia prohíba la redistribución de derivados, pero la verificación de fuga hacia MERA queda pendiente.

## Enlaces

- Hugging Face: https://huggingface.co/Rahspide/MNN-Pocket-0.3B-RU-Chat
- Modelo base (continuación): https://huggingface.co/Rahspide/MNN-Pocket-0.3B-RU
- Modelo original base: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B-Base
- Dataset Saiga: https://huggingface.co/datasets/IlyaGusev/saiga_scored
- Dataset ru_turbo_alpaca: https://huggingface.co/datasets/IlyaGusev/ru_turbo_alpaca
- Dataset UltraChat 200k: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Repositorio MNN (runtime): https://github.com/alibaba/MNN

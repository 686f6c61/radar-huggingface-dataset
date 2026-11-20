# ftpxain/nirnay-0.5b

## Resumen

Nirnay-0.5B es un modelo de decisión calibrado de tipo "System One" desarrollado por el usuario ftpxain, construido mediante ajuste fino supervisado sobre el backbone de Qwen2.5-0.5B. En lugar de generar texto de forma autorregresiva, el modelo extrae el estado oculto del último token y lo proyecta directamente sobre los pesos de las opciones candidatas, produciendo una distribución de probabilidad calibrada sobre un conjunto cerrado de alternativas. Resuelve el problema de latencia en tareas de enrutamiento, verificación binaria y clasificación de decisiones, donde un LLM convencional gastaría decenas de tokens y cientos de milisegundos.

Con 494 millones de parámetros y una licencia Apache 2.0, el modelo está orientado a inferencia rápida en entornos con restricciones de recursos: el autor declara 30 o más decisiones por segundo con menos de 28 ms de latencia y 1,4 GB de VRAM en BF16. Está entrenado exclusivamente en inglés y se distribuye como un modelo de clasificación de texto (pipeline `text-classification`).

Su relevancia actual radica en la evaluación sobre el benchmark S1MB (System One Mosaic Benchmark) en su edición inglesa v1, donde supera a modelos de mayor tamaño en la media de tareas, lo que lo posiciona como una alternativa eficiente para capas de decisión dentro de pipelines de agentes y sistemas de enrutamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con cabeza de proyección lineal sobre opciones |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor usa BF16 en inferencia) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del backbone de Qwen2.5-0.5B, un transformer decoder-only con estados ocultos de dimensión 896. La innovación principal es la eliminación de la cabeza LM de 152.000 tokens: en su lugar, se toma el estado oculto del último token del prompt y se proyecta linealmente sobre los pesos de las opciones candidatas, generando directamente una distribución calibrada P(A), P(B), etc. Esto evita la proyección sobre el vocabulario completo y el coste de gestión de la caché KV asociado a la generación autorregresiva.

El entrenamiento se realizó mediante destilación sobre 655.806 decisiones generadas por un modelo profesor, provenientes del corpus `SargeDev/jev-distill-corpus-v3`. El autor reporta métricas de calibración sobre 5.000 muestras: precisión top-1 del 84,88 %, Brier score de 0,0252 y temperatura óptima de 1,0456, incluida en el archivo `calibration_params.json`. La evaluación se realizó sobre el benchmark `hotchpotch/S1MB-english-v1`. No se especifican en la información disponible el número de tokens de entrenamiento ni detalles sobre el uso de RLHF o DPO.

## Capacidades

- Clasificación de decisiones sobre un conjunto cerrado de opciones, devolviendo una distribución de probabilidad calibrada en lugar de texto generado.
- Verificación binaria (familia "Noul"): comprobaciones sí/no, puertas de seguridad y aserciones.
- Enrutamiento entre candidatos (familia "Choice"): selección multi-clase, triaje y elección de herramientas.
- Puntuación ordinal (familia "Score"): valoración sobre criterios discretos de 0 a 5, aunque con rendimiento bajo según los datos del autor.
- Inferencia de baja latencia: el autor declara más de 30 decisiones por segundo con menos de 28 ms por decisión.
- No soporta generación de texto libre, tool calling generativo, razonamiento multi-paso ni capacidades multimodales, al estar diseñado exclusivamente como modelo de decisión.
- Capacidades multilingües limitadas al inglés.

## Casos de uso

- Enrutamiento de consultas en atención al cliente: dado un mensaje del usuario y un conjunto de departamentos o intenciones, el modelo devuelve la probabilidad de cada opción para derivar la conversación al equipo adecuado con latencia mínima.
- Puertas de seguridad en pipelines de agentes: verificación binaria de si una acción propuesta cumple una condición (por ejemplo, si una operación de escritura en base de datos es segura) antes de ejecutarla, usando la familia Noul.
- Selección de herramientas en agentes: elección entre un conjunto finito de funciones o APIs disponibles según el estado de la conversación, sustituyendo una llamada generativa por una proyección directa.
- Triaje de incidencias en producción: clasificación de alertas o tickets en categorías predefinidas (crítico, alto, medio, bajo) con distribución calibrada que permite umbrales ajustables.
- Verificación de afirmaciones en pipelines de validación: comprobar si un texto generado satisface una aserción booleana antes de publicarlo o enviarlo.
- Filtrado previo en sistemas RAG: decidir si una consulta requiere recuperación de documentos o puede responderse directamente, reduciendo llamadas a modelos mayores.
- Clasificación de intenciones en asistentes de voz o chatbots de baja latencia, donde el presupuesto de milisegundos por turno es estricto y no cabe una generación autorregresiva.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el benchmark S1MB English v1 (137 tareas, 14.009 casos de prueba). Los valores no están verificados de forma independiente según el model-index.

| Familia de decisión | Tareas | Nirnay-0.5B |
|---|---|---|
| Noul (verificación binaria) | 59 | 15.79 |
| Choice (enrutamiento) | 57 | 10.82 |
| Score (puntuación ordinal) | 21 | 0.29 |
| Media oficial S1MB | 137 | 8.97 |

Métricas de calibración y destilación reportadas por el autor:

| Métrica | Valor |
|---|---|
| Precisión top-1 (5.000 muestras) | 84,88 % |
| Brier score | 0,0252 |
| Temperatura óptima | 1,0456 |
| Latencia media | 32,37 ms |
| Latencia P95 | 43,77 ms |

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,4 GB en BF16 según el autor; en FP32 se situaría en torno a 2 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo cabe en tarjetas de consumo como RTX 3060, RTX 4060, RTX 4090, así como en A100 y H100 sin aprovechar su capacidad.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU dedicadas modernas y en muchas integradas con suficiente memoria compartida.
- Opciones de despliegue: la model card proporciona ejemplos con `transformers`; los tags indican compatibilidad con `text-embeddings-inference` y `endpoints_compatible`. No se documentan recetas específicas para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: el autor declara más de 30 decisiones por segundo y menos de 28 ms por decisión en su configuración de referencia, con latencia media medida de 32,37 ms y P95 de 43,77 ms.

## Comparativa con modelos similares

Datos del leaderboard publicado en la model card para el benchmark S1MB English v1:

| Modelo | Parámetros | Media S1MB | Noul | Choice | Score |
|---|---|---|---|---|---|
| laya | 421M | 13.36 | 20.19 | 16.31 | 3.58 |
| laya-multilingual | 322M | 9.28 | 14.01 | 13.03 | 0.79 |
| Nirnay-0.5B | 494M | 8.97 | 15.79 | 10.82 | 0.29 |
| minojev | 1,72B | 7.93 | 8.57 | 14.56 | 0.67 |
| JevForge-0.8B | 854M | 1.92 | 0.00 | 5.75 | 0.00 |

Nirnay-0.5B supera a minojev (1,72B) en la media global y a laya-multilingual en verificación binaria, pero queda por debajo de laya (421M) en todas las familias. La licencia de los modelos comparables no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Sesgos: no se documentan análisis de sesgo en la información disponible; al entrenarse sobre un corpus destilado en inglés, puede heredar los sesgos del modelo profesor y del corpus.
- Riesgo de alucinación: el modelo no genera texto libre, por lo que el riesgo se traslada a la calibración de probabilidades; una distribución mal calibrada en dominios fuera de la distribución de entrenamiento puede inducir decisiones erróneas con aparente confianza.
- Limitaciones de idioma: solo soporta inglés; su uso en castellano u otros idiomas no está validado.
- Limitaciones de contexto: la longitud máxima de contexto no está documentada en la información disponible.
- Rendimiento bajo en puntuación ordinal: la familia Score obtiene 0.29, muy por debajo de alternativas como laya (3.58); no es adecuado para valoraciones graduadas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-0.5B tiene su propia licencia que conviene verificar; además, los datos de destilación pueden arrastrar condiciones de uso del modelo profesor.
- Caveat para producción: los resultados de benchmarks están declarados por el autor y marcados como no verificados; conviene validar la calibración en el dominio concreto antes de desplegar.
- El modelo no es un LLM generativo: no debe esperarse de él generación de texto, razonamiento complejo ni conversación abierta.

## Enlaces

- Hugging Face: https://huggingface.co/ftpxain/nirnay-0.5b
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/ftpxain/nirnay-demo
- Repositorio GitHub: https://github.com/Ronak-jain-afk/Nirnay
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Dataset de destilación: https://huggingface.co/datasets/SargeDev/jev-distill-corpus-v3
- Benchmark S1MB: https://huggingface.co/datasets/hotchpotch/S1MB-english-v1
- Blog del benchmark S1MB: https://huggingface.co/blog/hotchpotch/system-one-mosaic-benchmark
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0

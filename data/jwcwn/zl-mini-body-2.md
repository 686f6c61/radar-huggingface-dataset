# jwcwn/zl-mini-body-2

## Resumen

JevK5 v0.3 (publicado en el Hub bajo el identificador `jwcwn/zl-mini-body-2`) es un modelo de decisión tipada ("typed decisions") construido a partir de Qwen3.5-4B mediante un ajuste fino con LoRA de rango 16 sobre las proyecciones de atención, fusionado en los pesos finales. No es un generador de texto al uso: lee un estado y una pregunta de tipo sí/no (`noul`), elección múltiple o puntuación, y devuelve una probabilidad para cada opción en un único forward pass, sin generar ningún token. Se presenta como una alternativa independiente, con licencia Apache-2.0, al modelo Jev de TypeSafe, sin afiliación con dicha empresa.

El modelo tiene 4.539.265.536 parámetros (aproximadamente 4,5 mil millones), un repositorio de 9,1 GB en safetensors y está etiquetado en HuggingFace con la arquitectura `qwen3_5_text`. La lectura de probabilidades no se hace con `generate()`, sino con un runtime específico (JevK5 runtime 0.3.0 o superior, en github.com/allebee/jevk5) que expone un endpoint estilo TypeSafe `/v1/systemone` y aplica el protocolo de readout de SemIf: softmax sobre los logits del siguiente token de las letras de respuesta, dividido por una temperatura de calibración.

La versión v0.3 amplía sustancialmente los datos de entrenamiento respecto a v0.2 (17.408 preguntas de profesor frente a 3.272, y 30.052 ítems humanos de replay frente a 3.272), lo que se traduce en mejoras medibles en pruebas de retención (índice proxy de 0,620 a 0,731; precisión en preguntas de profesor de 0,801 a 0,834) manteniendo una calibración excelente (ECE de 0,035). Es relevante para desarrolladores que necesitan decisiones binarias o de elección con probabilidades calibradas y latencia muy baja (unos 13 ms por decisión en una H100) sin coste de generación autoregresiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, tag `qwen3_5_text`), con LoRA de rango 16 en proyecciones de atención fusionada en los pesos |
| Parametros totales | 4.539.265.536 (~4,5 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 (pesos originales); GGUF Q8_0, Q5_K_M y Q4_K_M disponibles en el repo JevK5-GGUF |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo principal); GGUF (repo separado) |

## Arquitectura y entrenamiento

La base es Qwen3.5-4B, un transformer decoder-only, sobre el que se aplica un LoRA de rango 16 limitado a las proyecciones de atención y posteriormente se fusiona en los pesos. El modelo no genera texto: la salida se interpreta mediante el protocolo SemIf (TheoLeeCJ/SemIf, MIT), que calcula un softmax sobre los logits del siguiente token correspondiente a las letras de cada opción y lo divide por una temperatura de calibración. Las temperaturas están en `jevk5_config.json`: `temperature` 1,22 y `knockout_temperature` 0,93; esta segunda temperatura se usa para preguntas con más de 16 opciones, que se leen en varias pasadas y se combinan.

El entrenamiento de v0.3 usa 17.408 preguntas de profesor procedentes de dos profesores (3.270 de Qwen3.6-27B, heredadas de v0.2, y 14.138 nuevas de GPT-6 Luna), más 30.052 ítems etiquetados por humanos extraídos exclusivamente de los splits de entrenamiento de 26 datasets públicos. No se usan splits de test o validación de ningún dataset, ni MMLU, MMLU-Pro o BBH. Se entrena una sola época sobre 47.460 filas (v0.2 hacía dos épocas sobre 6.544), con el mismo LoRA y la misma tasa de aprendizaje. La innovación principal es el mecanismo de readout sin generación: una decisión completa requiere un único forward pass con CUDA graph por longitud de entrada paddeada, lo que da unos 13 ms por decisión en una H100.

## Capacidades

- Decisión tipada: responde a preguntas de sí/no (`noul`), elección entre opciones y puntuación (`score`) devolviendo una probabilidad por opción.
- Readout sin generación: cero tokens generados; la decisión se obtiene de los logits de las letras de respuesta en un solo forward pass.
- Preguntas con más de 16 opciones: lectura en varias pasadas combinadas con la temperatura `knockout_temperature`.
- Calibración de probabilidades: ECE de 0,035 en preguntas de profesor retenidas y 0,054 en el tramo difícil de JevBench.
- Integración como endpoint: el runtime sirve un endpoint estilo TypeSafe `/v1/systemone`.
- Autoalojamiento: pesos abiertos Apache-2.0, desplegables en infraestructura propia.
- No soporta tool calling, agentes multi-paso, visión, audio ni modos de razonamiento extendido; es un modelo de decisión, no un generador conversacional.

## Casos de uso

- Enrutamiento de consultas en atención al cliente: el modelo recibe el estado de la conversación y una pregunta de elección entre intents o colas, y devuelve la probabilidad de cada opción en un forward pass, lo que permite enrutar con umbrales calibrados en lugar de generar una respuesta completa.
- Moderación y clasificación binaria: preguntas de tipo sí/no sobre si un contenido cumple una política, con probabilidad calibrada que permite ajustar el punto de corte según el coste de falsos positivos y falsos negativos.
- Verificación de respuestas en pipelines RAG: comprobar si una respuesta generada está respaldada por el documento recuperado (tarea del benchmark RAGTruth, donde el índice proxy subió de 0,15 a 0,50), usando la probabilidad como señal de confianza.
- Selección de herramienta en agentes: decidir qué función invocar entre un conjunto de opciones (tarea When2Call, índice proxy de 0,75 a 0,95) antes de ejecutar la llamada, con latencia de milisegundos.
- Puntuación de relevancia en búsqueda y comercio electrónico: asignar una puntuación de relevancia producto-consulta (tarea Amazon ESCI, índice proxy 0,47) para reordenar resultados con una probabilidad por ítem.
- Clasificación de tickets y quejas: asignar un ticket a una categoría entre muchas (BANKING77, índice proxy 0,88), incluido el caso de más de 16 categorías que activa la lectura multipasada.
- Detección de sarcasmo o intención en textos cortos: decisión binaria calibrada sobre mensajes (iSarcasmEval, índice proxy de 0,30 a 0,55) como filtro previo a un modelo generativo mayor.

## Benchmarks y rendimiento

Comprobaciones de retención (dev set: preguntas de profesor de tres dominios no vistos, un conjunto difícil escrito a mano y un 5% hasheado de cada split público de entrenamiento):

| Métrica | v0.2 | v0.3 |
|---|---:|---:|
| Índice proxy (16 fuentes) | 0,620 | 0,731 |
| Preguntas de profesor retenidas (362), precisión | 0,801 | 0,834 |
| Conjunto difícil escrito a mano (64), precisión | 0,766 | 0,766 |
| ECE en preguntas de profesor, calibrado | 0,034 | 0,035 |

JevBench v1.2, ítems públicos (231 ítems, runner propio de JevBench, adaptador `jevk5_direct`, 231/231 válidos):

| Split | n | Qwen3.5-4B sin entrenar | JevK5 v0.2 | JevK5 v0.3 | ECE v0.3 (v0.2) |
|---|---:|---:|---:|---:|---:|
| easy | 48 | 1,000 | 1,000 | 1,000 | 0,018 (0,038) |
| original (standard) | 72 | 0,986 | 0,958 | 0,944 | 0,057 (0,141) |
| hard (mitad pública) | 111 | 0,613 | 0,739 | 0,784 | 0,054 (0,066) |

bev-decision-150K (mezcla de decisión de otro grupo, solo evaluación; 2.500 filas hasheadas del split de test): precisión 0,663 en v0.3 frente a 0,665 en v0.2; ECE 0,036 en ambos. Por tipo: elección 0,697, sí/no 0,758, puntuación 0,409.

## Requisitos de hardware

- Pesos en bf16: unos 9,1 GB, por lo que la inferencia en bf16 requiere aproximadamente 9-10 GB de VRAM más overhead del runtime.
- Versión JevK5-9B (modelo hermano): unos 19 GB en bf16 y 2-3 veces más lenta.
- GGUF: Q8_0, Q5_K_M y Q4_K_M disponibles para llama.cpp, lo que permite ejecución en GPU NVIDIA, AMD, Intel y Apple, o en CPU.
- GPU recomendadas: H100 para el rendimiento de referencia (unos 13 ms por decisión con CUDA graph por longitud de entrada); tarjetas consumer con al menos 10-12 GB de VRAM para bf16.
- Despliegue: runtime JevK5 0.3.0 o superior (endpoint `/v1/systemone`); llama.cpp para los builds GGUF. No se documenta soporte para vLLM, TGI u Ollama en la información disponible.
- Latencia: unos 13 ms por decisión en H100 con el runtime 0.3.0. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JevK5 v0.3 (este modelo) | ~4,5 B | No disponible | Decisión tipada con readout sin generación | Apache-2.0 | Pesos abiertos en HuggingFace |
| JevK5-9B | ~9 B | No disponible | Misma receta v0.3 sobre Qwen3.5-9B; índice proxy 0,762 y 0,851 en preguntas de profesor, pero 0,730 en el tramo difícil de JevBench | Apache-2.0 | Pesos abiertos en HuggingFace |
| JevK5-2B | ~2 B | No disponible | Receta v0.2 sobre Qwen3.5-2B, no reentrenado para v0.3 | Apache-2.0 | Pesos abiertos en HuggingFace |
| Jev de TypeSafe | No disponible | No disponible | Decisión tipada propietaria | No disponible (propietaria) | Servicio de pago; sin pesos abiertos |

## Limitaciones y advertencias

- No es un modelo generativo: usar `generate()` de transformers no produce el readout de decisión; es obligatorio el runtime JevK5 con `jevk5_config.json` para obtener probabilidades correctas.
- Solo inglés: el campo `language` declara únicamente `en`; no hay evidencia de rendimiento en castellano.
- Precisión limitada en tareas de puntuación: 0,409 en preguntas de tipo `score` en bev-decision-150K, muy por debajo de elección (0,697) y sí/no (0,758).
- Regresiones respecto a v0.2 en algunas fuentes del índice proxy: BANKING77 baja de 0,91 a 0,88 y Amazon ESCI de 0,50 a 0,47; HoVer no mejora (0,30).
- La mejora en el tramo difícil de JevBench no es estadísticamente significativa con 111 ítems (McNemar p = 0,30); corrige 10 ítems y rompe 5 respecto a v0.2.
- El índice proxy es una estimación propia del autor, no una puntuación oficial del Jev Decision Index, y cada fuente tiene solo 40 filas (ruido aproximado de ±0,15).
- Riesgo de alucinación: no se documenta; el modelo no genera texto, pero sus probabilidades pueden estar mal calibradas fuera de la distribución de entrenamiento.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Licencia Apache-2.0 permite uso comercial, pero el modelo no está afiliado a TypeSafe y no debe presentarse como Jev oficial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un lanzamiento muy reciente (creado el 5 de noviembre de 2026) y sin validación independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jwcwn/zl-mini-body-2
- Pesos JevK5 (referenciados en la model card): https://huggingface.co/alibiserikbay/JevK5
- Runtime JevK5: https://github.com/allebee/jevk5
- JevK5-9B: https://huggingface.co/alibiserikbay/JevK5-9B
- JevK5-GGUF: https://huggingface.co/alibiserikbay/JevK5-GGUF
- JevK5-2B: https://huggingface.co/alibiserikbay/JevK5-2B
- Protocolo SemIf: https://github.com/TheoLeeCJ/SemIf
- Dataset bev-decision-150K: https://huggingface.co/datasets/avbiswas/bev-decision-150K
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B

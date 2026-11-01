# sidekickd/minicpm5-2b-coreml

## Resumen

MiniCPM5-2B para sidekick (Core ML) es una conversión del modelo de chat openbmb/MiniCPM5-2B, una variante de la familia MiniCPM5 con arquitectura tipo Llama, a formato Core ML para su ejecución sobre la Neural Engine de los chips Apple silicon. La conversión la mantiene el proyecto sidekick (repositorio ironblock/sidekick), que publica compilaciones optimizadas de modelos abiertos para el ecosistema Apple. El repositorio contiene una única compilación, `palette8/`, con pesos cuantizados a 8 bits mediante paletas GPTQ y un decodificador compilado en cuatro programas.

El interés de esta ficha es doble. Por un lado, permite ejecutar un modelo de 2 000 millones de parámetros en la Neural Engine de un Mac con Apple silicon sin depender de GPU dedicadas ni de frameworks de inferencia convencionales. Por otro, el autor documenta de forma poco habitual la fidelidad de la conversión: compara la distribución de siguiente token frente al modelo original en fp32 y publica métricas de divergencia KL y acuerdo top-1, lo que facilita evaluar el coste real de la cuantización.

La ventana de contexto de esta compilación es de 2033 tokens, muy inferior a la del modelo base, y el tamaño del repositorio es de 2,8 GB. La licencia declarada es Apache-2.0, aunque el autor matiza que los datos de entrenamiento proceden de colecciones de openbmb cuyos términos remiten a las fuentes originales, algunas no verificadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (MiniCPM5), convertido a Core ML |
| Parametros totales | 2B (según el nombre del modelo base; no se detalla el recuento exacto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2033 tokens (compilación `palette8/`) |
| Tipos de cuantizacion | 8 bits con paletas GPTQ |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (tier de publicación 2a según sidekick) |
| Formato de pesos | Core ML (programas compilados para Neural Engine; no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo base es MiniCPM5-2B, un transformer de tipo Llama orientado a chat con aproximadamente 2 000 millones de parámetros. Según la model card, se entrenó sobre colecciones de datos de openbmb: Ultra-FineWeb, UltraX-Preview y Ultra-FineWeb-L3 en la fase de mid-training, UltraData-Math y UltraData-Code también en mid-training, y UltraData-SFT-2605, UltraData-SFT-Agent-2609 y UltraData-RL-2609 en las fases de SFT y RL. No se especifica el número total de tokens de entrenamiento ni la composición cuantitativa del dataset.

La conversión a Core ML sustituye los pesos originales por paletas de 8 bits (GPTQ) y compila el decodificador en cuatro programas ejecutables sobre la Neural Engine. El autor evalúa la fidelidad comparando la distribución de siguiente token de esta compilación con la del modelo original en fp32 sobre textos reservados: divergencia KL media de 1,28e-03 en prosa larga y 2,89e-04 en textos de repositorio, con acuerdo top-1 del 99,57 % y 98,93 % respectivamente. También ejecuta una comprobación de tareas de chat (títulos, etiquetas, extracción e instrucciones) con resultados prácticamente idénticos al fp32.

## Capacidades

- Generación de texto y conversación multi-turno en formato chat, heredadas del modelo base MiniCPM5-2B.
- Tareas de resumen y generación de títulos, con una puntuación de 0,448 frente a 0,441 del fp32 en el benchmark interno del autor.
- Etiquetado con vocabulario fijo, con coincidencia total (0,792 en ambos casos) y 100 % de respuestas idénticas.
- Extracción de información estructurada a partir de texto, con 0,910 frente a 0,896 del fp32.
- Seguimiento de instrucciones, con puntuación de 1,000 en ambos casos y 90 % de respuestas idénticas.
- Soporte de tool calling y de agentes: no disponible en la información proporcionada para esta compilación.
- Capacidades multilingües: no disponible; la model card no detalla idiomas.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Asistentes locales en macOS: la compilación se ejecuta sobre la Neural Engine de Apple silicon mediante sidekickd, lo que permite integrar un chat de 2B parámetros en aplicaciones de escritorio sin GPU dedicada ni servicios en la nube.
- Generación de títulos y resúmenes en herramientas de notas: el benchmark interno del autor muestra un rendimiento casi idéntico al fp32 en esta tarea, con un 95 % de respuestas idénticas, lo que la hace adecuada para funciones auxiliares de productividad.
- Etiquetado automático de contenido: la tarea de etiquetas con vocabulario fijo obtiene coincidencia total con el modelo original, útil para clasificación de documentos o correos en local.
- Extracción de campos estructurados: con 0,910 frente a 0,896 del fp32 en la prueba de extracción, puede emplearse para convertir texto libre en datos tabulares en pipelines de procesamiento por lotes.
- Prototipado de agentes conversacionales en entornos Apple: la ventana de 2033 tokens limita conversaciones largas, pero es suficiente para interacciones de pocos turnos y para pruebas de concepto de asistentes con instrucciones.
- Inferencia de bajo consumo en portátiles Mac: al ejecutarse en la Neural Engine, el modelo libera la CPU y la GPU para otras tareas, lo que encaja en aplicaciones de fondo que generan texto de forma intermitente.
- Evaluación de cuantización en producción: el repositorio incluye métricas de fidelidad (KL y top-1) que permiten comparar el impacto de la cuantización de 8 bits antes de adoptar el modelo en un producto.

## Benchmarks y rendimiento

El autor publica una evaluación de fidelidad frente al modelo original en fp32, no benchmarks estándar de capacidades (MMLU, HumanEval, GSM8K). Los datos disponibles son los siguientes:

| Prueba | Métrica | Este build | fp32 | Diferencia |
|---|---|---|---|---|
| Títulos | Puntuación | 0,448 | 0,441 | +0,007 |
| Etiquetas (vocabulario fijo) | Puntuación | 0,792 | 0,792 | +0,000 |
| Extracción | Puntuación | 0,910 | 0,896 | +0,014 |
| Instrucciones | Puntuación | 1,000 | 1,000 | +0,000 |

| Textos | Posiciones | KL media | KL p99 | Top-1 | Nota |
|---|---|---|---|---|---|
| Prosa larga (reservada) | 470 | 1,28e-03 | 1,17e-02 | 99,57 % | B |
| Textos de repositorio | 1032 | 2,89e-04 | 2,07e-03 | 98,93 % | B |

No se han publicado resultados de benchmarks de capacidades (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM o memoria unificada: el repositorio ocupa 2,8 GB; los pesos del decodificador suman 2,12 GiB y la caché de compilación de la Neural Engine añade 2,14 GiB en el primer arranque.
- GPU recomendadas: no aplica; el modelo se ejecuta en la Neural Engine de Apple silicon. La evaluación se realizó en un Apple M1 Max con macOS 27.0.
- Compatibilidad con GPU de consumo: no disponible para tarjetas NVIDIA o AMD; el formato Core ML está orientado a Apple silicon.
- Opciones de despliegue: sidekickd 0.17.0 o superior, con el comando `sidekickd fetch minicpm5-2b`; también es posible instalar la compilación manualmente según la documentación de sidekick.
- Latencia y throughput: no disponibles en la información proporcionada.
- Limitación de concurrencia: la Neural Engine es compartida, por lo que otras aplicaciones que usen Apple Foundation Models u otras cargas en la Neural Engine detendrán las generaciones de este modelo mientras se ejecuten.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sidekickd/minicpm5-2b-coreml | 2B | 2033 tokens | Core ML (8 bits GPTQ) | Apache-2.0 | Hugging Face, vía sidekickd |
| openbmb/MiniCPM5-2B | 2B | no disponible | safetensors (modelo original) | Apache-2.0 | Hugging Face |
| Alternativas de 2B en formato GGUF para CPU/GPU | no disponible | no disponible | GGUF | no disponible | no disponible |

La comparación con modelos de la misma categoría en formato Core ML no está disponible en la información proporcionada. La diferencia principal frente al modelo base es el contexto reducido (2033 tokens) y la cuantización a 8 bits con paletas GPTQ.

## Limitaciones y advertencias

- Contexto reducido: la compilación limita la ventana a 2033 tokens, muy por debajo de lo habitual en modelos de chat, lo que restringe conversaciones largas y documentos extensos.
- Solo evaluado en Apple M1 Max: el autor indica que otros chips no han sido calificados, por lo que el rendimiento en M2, M3 o M4 no está verificado.
- Caché de compilación persistente: el primer arranque genera una caché de 2,14 GiB en el sistema que no se puede eliminar; se paga de nuevo tras actualizar macOS o si sidekickd se firma con otra identidad.
- Contención de recursos: la Neural Engine es compartida con otras aplicaciones, incluidas las que usan Apple Foundation Models, y las generaciones pueden detenerse mientras aquellas se ejecutan.
- Datos de entrenamiento parcialmente divulgados: algunas fuentes remiten a términos no verificados, con datos sintéticos de generadores no identificados y problemas de RL bajo CC BY-SA 4.0; el autor clasifica la publicación como tier 2a.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada; no se han publicado evaluaciones específicas.
- Idiomas: no se detalla la cobertura lingüística de esta compilación.
- Uso comercial: la licencia Apache-2.0 lo permite, pero la procedencia de los datos de entrenamiento introduce incertidumbre legal según el propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sidekickd/minicpm5-2b-coreml
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B/tree/f97400052a43d642bbc6e9975e2397e3ae6a6b52
- Repositorio sidekick: https://github.com/ironblock/sidekick
- Documentación de publicación y tiers de licencia: https://github.com/ironblock/sidekick/blob/v0.17.0/docs/PUBLISHING.md#what-is-published-licence-tiers
- Documentación de ejecución: https://github.com/ironblock/sidekick/blob/v0.17.0/docs/RUNNING.md#fetching-a-published-build
- Documentación de la API: https://github.com/ironblock/sidekick/blob/v0.17.0/docs/API.md#open-models
- Documentación de conversión y calificación: https://github.com/ironblock/sidekick/blob/v0.17.0/docs/CONVERTING.md#grading
- Backends y Neural Engine: https://github.com/ironblock/sidekick/blob/v0.17.0/docs/BACKENDS.md#open-chat-models-on-the-neural-engine
- Dataset Ultra-FineWeb: https://huggingface.co/datasets/openbmb/Ultra-FineWeb
- Dataset UltraX-Preview: https://huggingface.co/datasets/openbmb/UltraX-Preview
- Dataset Ultra-FineWeb-L3: https://huggingface.co/datasets/openbmb/Ultra-FineWeb-L3
- Dataset UltraData-Math: https://huggingface.co/datasets/openbmb/UltraData-Math
- Dataset UltraData-Code: https://huggingface.co/datasets/openbmb/UltraData-Code
- Dataset UltraData-SFT-2605: https://huggingface.co/datasets/openbmb/UltraData-SFT-2605

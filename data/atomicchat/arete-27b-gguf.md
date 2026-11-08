# AtomicChat/Arete-27B-GGUF

## Resumen

Arete-27B-GGUF es la versión cuantizada del modelo NousResearch/Arete-27B, un ajuste fino supervisado (SFT) que Nous Research realizó sobre Qwen3.8-27B para modificar el comportamiento del modelo ante preguntas políticamente sensibles. Esta ficha corresponde concretamente a la publicación de AtomicChat, que ha generado los ficheros GGUF con su propio pipeline de cuantización (matrices de importancia propias, layouts "Atomic Dynamic") y ha publicado las métricas de divergencia KL y top-1 de cada variante. El resultado es un conjunto de cuantizaciones para llama.cpp que van desde 13,6 GB (AD-IQ3_S) hasta 28,6 GB (Q8_0), con la particularidad de que el modelo conserva el codificador visual del modelo base y, por tanto, acepta entrada de imagen además de texto.

El modelo mantiene la arquitectura y el tokenizador de Qwen3.8-27B (aproximadamente 26.900 millones de parámetros, transformer denso, sin mezcla de expertos) pero elimina la cabeza de predicción multi-token que sí tiene el modelo base, lo que condiciona las opciones de decodificación especulativa disponibles en llama.cpp. La licencia es Apache 2.0 tanto en el modelo base como en esta cuantización, lo que permite uso comercial sin restricciones adicionales.

Su relevancia práctica es doble: por un lado, ofrece una alternativa con licencia permisiva y comportamiento conversacional ajustado para ejecución local en GPU de consumo; por otro lado, el autor de la cuantización publica los logs de medición y el corpus de calibración, algo poco habitual en el ecosistema GGUF y que permite auditar la pérdida de calidad de cada nivel de compresión antes de desplegar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura de Qwen3.8-27B, sin cabeza de predicción multi-token) |
| Parámetros totales | 26.895.998.464 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 64 KB de caché de atención por token; 0,5 GB a 8k, 2,0 GB a 32k; contexto completo en 48 GB o más de VRAM |
| Tipos de cuantización | Q8_0, AD-Q6_K, AD-Q5_K_M, AD-Q4_K_M, AD-IQ4_XS, AD-IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), más proyector visual `mmproj-Arete-27B-F16.gguf` y `mmproj-Arete-27B-BF16.gguf` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.8-27B: un transformer denso con codificador visual integrado, tokenizador propio y capacidad de entrada image-text-to-text. Nous Research realizó un ajuste fino supervisado sobre texto para alterar la forma en que el modelo responde a preguntas políticamente sensibles; el fine-tune cambió pesos, pero no formas, de modo que el layout de tensores es idéntico al del modelo base y las cuantizaciones de AtomicChat reutilizan la estructura desarrollada para Qwen3.8-27B (primeras 12 y últimas 12 capas, puerta de atención, etc.). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO adicionales.

Una diferencia técnica relevante para el despliegue es la ausencia de la cabeza de predicción multi-token: la opción `--spec-type draft-mtp` que sí funciona con Qwen3.8-27B no está disponible aquí. En el plano de la cuantización, AtomicChat aplica matrices de importancia propias (imatrix) y layouts "Atomic Dynamic" en los que los dos grupos de tensores más grandes (`ffn_down` y `ffn_up`) reciben un tratamiento diferenciado; el nombre del fichero refleja el tipo asignado a esos grupos, no un tipo uniforme. El corpus de calibración utilizado es público.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat ChatML (`<|im_start|>` / `<|im_end|>`) embebida en los ficheros GGUF.
- Modo de razonamiento ("thinking") activado por defecto, con niveles de esfuerzo `xhigh` (por defecto), `medium` y `low`; se puede desactivar con `enable_thinking: false`.
- Comprensión de imágenes mediante el proyector visual separado (`mmproj`), con un mínimo práctico de 1024 tokens de imagen (`--image-min-tokens 1024`).
- Comportamiento ajustado por SFT para respuestas a preguntas políticamente sensibles.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita; el modo thinking permite cadenas de razonamiento, pero no se documentan capacidades de agente.
- Capacidades multilingües: no disponible.
- Decodificación especulativa multi-token: no disponible en estos ficheros.

## Casos de uso

- Asistencia conversacional local con contexto largo: con `AD-Q5_K_M` en una GPU de 24 GB se pueden mantener alrededor de 64k tokens de contexto, suficiente para sesiones de chat prolongadas o documentos extensos sin salir del equipo.
- Análisis de imágenes en local: usando `llama-mtmd-cli` con el `mmproj-F16` y `--image-min-tokens 1024`, el modelo puede describir o razonar sobre fotografías, capturas o diagramas sin enviar datos a un servicio externo.
- Despliegue en estaciones de trabajo de 16 GB: la variante `AD-IQ3_S` (13,6 GB) deja espacio para unos 32k de contexto y permite ejecutar el modelo en GPUs de consumo de gama alta con pérdida medida de 0,033 de divergencia KL y 92,31% de top-1.
- Moderación y análisis de contenido sensible: el ajuste SFT de Nous Research sobre respuestas a temas políticamente sensibles lo hace adecuado para experimentar con políticas de respuesta controladas, siempre auditando el comportamiento resultante.
- Prototipado de pipelines image-text-to-text: al compartir codificador visual con Qwen3.8-27B, sirve para validar flujos de visión-lenguaje antes de migrar a infraestructura mayor.
- Evaluación comparativa de cuantizaciones: los logs públicos de métricas por fichero permiten reproducir el estudio de degradación KL/top-1 y elegir el punto de compresión óptimo para un hardware concreto.
- Inferencia offline en entornos sin conectividad: al ser GGUF y ejecutarse con llama.cpp, encaja en despliegues aislados donde no se permite tráfico saliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Lo que sí se publica son métricas de fidelidad de la cuantización respecto a los pesos originales:

| Fichero | Tamaño | Divergencia KL | top-1 |
|---|---:|---:|---:|
| `Q8_0` | 28,6 GB | 0,00069 | 98,87% |
| `AD-Q6_K` | 24,6 GB | 0,00112 | 98,58% |
| `AD-Q5_K_M` | 19,9 GB | 0,00356 | 97,48% |
| `AD-Q4_K_M` | 16,8 GB | 0,00956 | 95,89% |
| `AD-IQ4_XS` | 16,2 GB | 0,01120 | 95,60% |
| `AD-IQ3_S` | 13,6 GB | 0,03312 | 92,31% |

## Requisitos de hardware

- VRAM estimada: entre 13,6 GB (`AD-IQ3_S`) y 28,6 GB (`Q8_0`) solo para pesos; hay que sumar la caché de atención, que consume 64 KB por token (0,5 GB a 8k de contexto, 2,0 GB a 32k).
- GPU de 16 GB: `AD-IQ3_S` con aproximadamente 32k de contexto.
- GPU de 24 GB: `AD-Q5_K_M` con aproximadamente 64k de contexto.
- GPU de 32 GB: `Q8_0` con aproximadamente 64k de contexto.
- 48 GB o más: `Q8_0` con contexto completo.
- Cabe en GPU de consumo de gama alta (16-24 GB) usando las variantes IQ3/IQ4/Q5; las variantes Q6_K y Q8_0 requieren 24-32 GB o más.
- Despliegue: llama.cpp (`llama-server`, `llama-mtmd-cli` para visión). No se documentan en la información disponible otras opciones como vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| AtomicChat/Arete-27B-GGUF | 26,9B (denso) | 64 KB de caché/token; contexto completo con 48 GB+ | Apache 2.0 | GGUF | Cuantización auditada con métricas KL/top-1; visión vía mmproj |
| terelabs/Arete-27B-GGUF | ~27B | no disponible | no disponible | GGUF | Cuantización alternativa del mismo modelo base |
| NousResearch/Arete-27B | ~27B | no disponible | Apache 2.0 | safetensors (presumible) | Pesos originales; incluye cabeza de predicción multi-token |
| Qwen/Qwen3.8-27B | ~27B | no disponible | Apache 2.0 | safetensors | Modelo base; soporta decodificación especulativa MTP |

## Limitaciones y advertencias

- El ajuste SFT modifica deliberadamente las respuestas a preguntas políticamente sensibles; el comportamiento resultante debe evaluarse antes de usarlo en producción, especialmente en contextos informativos o educativos.
- Riesgo de alucinación no cuantificado: no se han publicado evaluaciones de veracidad en la información disponible.
- Idiomas soportados no documentados; no se puede asumir un rendimiento multilingüe equivalente al del modelo base sin pruebas propias.
- La plantilla de chat solo acepta `xhigh`, `medium` o `low` como `reasoning_effort`; cualquier otro valor, incluido `high`, provoca un error y el cliente no recibe respuesta.
- El modo thinking está activado por defecto, lo que incrementa los tokens generados y el coste de inferencia si no se desactiva o se reduce el esfuerzo.
- La visión requiere descargar el `mmproj` por separado y usar al menos 1024 tokens de imagen; por debajo de ese umbral, las capacidades dependientes de posición dejan de ser fiables.
- No hay cabeza de predicción multi-token: no se puede usar `--spec-type draft-mtp`, lo que limita las optimizaciones de decodificación especulativa disponibles en Qwen3.8-27B.
- La cuantización introduce degradación medible: en `AD-IQ3_S` el top-1 cae al 92,31% y la divergencia KL sube a 0,03312, un salto notable respecto a `AD-Q4_K_M`.
- El repositorio es de gran tamaño (138,2 GB en total) por acumular todas las variantes; conviene descargar solo el fichero necesario.
- Aunque la licencia es Apache 2.0, conviene revisar el fichero de licencia incluido en el repo y las condiciones del modelo base y del dataset de calibración si se redistribuye.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AtomicChat/Arete-27B-GGUF
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Modelo Qwen subyacente: https://huggingface.co/Qwen/Qwen3.8-27B
- Corpus de calibración: https://huggingface.co/datasets/AtomicChat/calib-corpora
- Métricas y logs de cuantización: https://huggingface.co/datasets/AtomicChat/Arete-27B-GGUF-metrics
- Cuantización alternativa: https://huggingface.co/terelabs/Arete-27B-GGUF
- Aplicación Atomic Chat: https://atomic.chat/
- Repositorio GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord: https://discord.gg/8wGSsvmg4V
- X (Twitter): https://x.com/atomic_chat_hq

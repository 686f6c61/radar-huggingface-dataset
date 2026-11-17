# fjolsvin/Qwen3.5-9B-Claude-4.6-HighIQ-THINKING-HERETIC-UNCENSORED-tiiny

## Resumen

`fjolsvin/Qwen3.5-9B-Claude-4.6-HighIQ-THINKING-HERETIC-UNCENSORED-tiiny` es un fine-tune del modelo denso Qwen3.5-9B de Alibaba Qwen, entrenado por DavidAU mediante Unsloth sobre un dataset de destilación de "Claude 4.6" y posteriormente reempaquetado por `fjolsvin` con la herramienta tiiny-forge para que la importación de Tiiny Pocket lo acepte como fine-tune del modelo de tienda `Qwen/Qwen3.5-9B`. El reempaquetado no altera los pesos: solo ajusta `config.json`, `merges.txt` y el campo `base_model` de la model card. El modelo tiene 9.409.813.744 parámetros y un repositorio de 18,8 GB en bfloat16.

La motivación del fine-tune es doble. Por un lado, sustituir el estilo de razonamiento de "Qwen 3.5" por uno destilado de "Claude 4.6", con la intención declarada de mejorar la generación de pensamiento y los benchmarks del modelo base. Por otro, aplicar un proceso de "abliteration" (eliminación de direcciones de rechazo en el espacio de activaciones) que da lugar a un modelo "heretic" y "uncensored", es decir, que reduce drásticamente las negativas a peticiones. El autor reporta 6 rechazos sobre 100 frente a 100 sobre 100 del Qwen3.5-9B original, con una divergencia KL de 0,0793 respecto al base.

Es relevante ahora porque combina tres tendencias del ecosistema abierto: fine-tunes de destilación sobre modelos pequeños densos, técnicas de desbloqueo de rechazos cada vez más accesibles, y flujos de empaquetado orientados a plataformas de importación (Tiiny). El modelo hereda del base Qwen3.5 la arquitectura híbrida con Gated Delta Networks, la fusión temprana visión-lenguaje y un contexto declarado de 256k tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido con Gated Delta Networks (arquitectura Qwen3.5); pipeline `image-text-to-text` |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 256k tokens (por defecto, según model card del fine-tune) |
| Tipos de cuantizacion | bfloat16 en el repo; el autor sugiere mínimo q4_k_s (sin imatrix) o IQ3S (con imatrix) |
| Idiomas soportados | en, zh (declarados en la model card); el base Qwen3.5 declara 201 idiomas y dialectos |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B es un transformer denso que integra Gated Delta Networks (una familia de capas con estado recurrente lineal) combinadas con atención, junto con fusión temprana de tokens multimodales para visión-lenguaje. Qwen declara entrenamiento con RL a escala en entornos multiagente y una infraestructura de entrenamiento multimodal con eficiencia cercana al 100 % respecto a texto puro. El fine-tune de DavidAU se realizó con Unsloth sobre hardware local, usando un dataset de destilación de "Claude 4.6" de gran tamaño, con el objetivo explícito de reemplazar el estilo de pensamiento de Qwen 3.5 por el de Claude 4.6 y de preservar los benchmarks del base ("entrenamiento suave").

Sobre esa base se aplicó primero un proceso de abliteration (el linaje pasa por `trohrbaugh/Qwen3.5-9B-heretic-v2`) y después el fine-tune "heretic", de modo que el modelo resultante es un fine-tune post-abliteración. El reempaquetado de `fjolsvin` es puramente de formato: mantiene tensores, copia `merges.txt` del Qwen3.5-9B original y reescribe el `base_model` de la model card. No se documentan en la información disponible detalles sobre número de tokens de entrenamiento, composición exacta del dataset, ni si hubo RLHF/DPO en el fine-tune.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" (cadena de pensamiento) destilado de Claude 4.6, según el autor.
- Generación de código y matemáticas (heredadas del base Qwen3.5; sin métricas específicas publicadas para este fine-tune).
- Visión: pipeline `image-text-to-text`; el autor indica que las imágenes fueron probadas y funcionan con el nuevo entrenamiento. Las porciones de vídeo NO fueron probadas.
- Escritura creativa y de ficción: los tags incluyen creative writing, fiction writing, plot generation, sub-plot generation, story generation, scene continue, storytelling, ciencia ficción, romance y "all genres".
- Roleplaying y "vivid prosing" (prosa vívida).
- Conversación multi-turno.
- Capacidad "uncensored"/"abliterated": el autor reporta 6 rechazos sobre 100 frente a 100 sobre 100 del base.
- Idiomas: inglés y chino declarados; el base declara 201 idiomas, pero el fine-tune no documenta evaluación multilingüe.
- Tool calling / function calling: no documentado explícitamente para este fine-tune (el base Qwen3.5 lo soporta según su model card).
- Soporte de agentes y razonamiento multi-paso: heredado del base, no verificado en el fine-tune.

## Casos de uso

- Escritura de ficción larga: el modelo está afinado específicamente para generación de tramas, subtramas y continuación de escenas, con contexto de 256k tokens que permite mantener arcos narrativos y consistencia de personajes a lo largo de novelas o series.
- Roleplaying y narrativa interactiva: la combinación de contexto largo, ausencia de rechazos y entrenamiento en "vivid prosing" lo hace adecuado para personajes persistentes en juegos de texto o simulaciones conversacionales.
- Generación de guiones y diálogos: útil en pipelines de preproducción audiovisual donde se necesita producir variantes de escena con tono consistente y sin filtros de contenido que interrumpan el flujo creativo.
- Prototipado de asistentes conversacionales sin restricciones: para investigación sobre seguridad, alineamiento o evaluación de modelos, el bajo ratio de rechazos (6/100) permite estudiar respuestas que otros modelos bloquean.
- Análisis y descripción de imágenes en flujos creativos: al ser `image-text-to-text`, puede describir referencias visuales, extraer ambientación de ilustraciones o convertir moodboards en texto narrativo (visión probada; vídeo no probado).
- Destilación y generación de datos sintéticos: su modo thinking y su estilo Claude 4.6 lo hacen candidato para producir razonamientos etiquetados que alimenten el entrenamiento de modelos más pequeños.
- Despliegue en hardware de consumo: con 9,4B parámetros y cuantización q4_k_s o IQ3S, cabe en GPUs de consumo y permite inferencia local para escritura asistida sin depender de API.

## Benchmarks y rendimiento

Resultados publicados por el autor (precisión mxfp8), sobre arc, arc/e, boolq, hswag, obkqa, piqa y wino:

| Modelo / modo | arc | arc/e | boolq | hswag | obkqa | piqa | wino |
|---|---|---|---|---|---|---|---|
| HERETIC (thinking) | 0,432 | 0,505 | 0,625 | 0,658 | 0,374 | 0,748 | 0,657 |
| HERETIC (instruct) | 0,574 | 0,755 | 0,869 | 0,714 | 0,410 | 0,780 | 0,691 |
| Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT | 0,574 | 0,729 | 0,882 | 0,711 | 0,422 | 0,775 | 0,691 |
| Qwen3.5-9B (thinking) | 0,417 | 0,458 | 0,623 | 0,634 | 0,338 | 0,737 | 0,639 |

Métricas de des-censura y fidelidad al base:

| Métrica | Este modelo | Qwen/Qwen3.5-9B |
|---|---|---|
| Divergencia KL | 0,0793 | 0 (por definición) |
| Rechazos | 6/100 | 100/100 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: en bfloat16, los 9,41B parámetros ocupan aproximadamente 18,8 GB de pesos, por lo que se necesitan ~20-22 GB de VRAM para inferencia con overhead. En q4_k_s, el peso ronda los 5,5-6 GB; en IQ3S, alrededor de 4-5 GB.
- GPU recomendadas: A100 40/80 GB o H100 para bfloat16 con contexto largo; RTX 4090 (24 GB) para bfloat16 justo o q8; RTX 3090 (24 GB) similar.
- GPU de consumo: sí cabe en RTX 4090, 3090, 4080 (16 GB) con q4/q5, y en GPUs de 8-12 GB con IQ3S o q4_k_s.
- Opciones de despliegue: transformers (librería declarada), vLLM, SGLang, KTransformers (compatibilidad del base Qwen3.5); llama.cpp/Ollama para GGUF si se generan cuantizaciones a partir de los safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.
- Nota del autor: rep pen de 1 (desactivado) y contexto por defecto de 256k.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (Qwen3.5-9B-Claude-4.6-HighIQ-THINKING-HERETIC-UNCENSORED-tiiny) | 9,41B denso | 256k | apache-2.0 | Fine-tune destilado de Claude 4.6, abliterated, visión probada, 6/100 rechazos |
| Qwen/Qwen3.5-9B (base) | ~9B denso | 256k (según base) | apache-2.0 | Modelo original de Alibaba Qwen; 100/100 rechazos; sin destilación Claude |
| Qwen3.5-9B-Claude-4.6-HighIQ-INSTRUCT (DavidAU) | ~9B denso | 256k | apache-2.0 | Variante instruct del mismo linaje, sin modo thinking heretic; benchmarks ligeramente distintos |
| trohrbaugh/Qwen3.5-9B-heretic-v2 | ~9B denso | no disponible | no disponible | Abliterated base del linaje; sin destilación Claude 4.6 |

No se dispone de comparación con modelos de otros linajes (Llama, Mistral, etc.) en la información proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored"/"abliterated": elimina deliberadamente los mecanismos de rechazo, lo que implica riesgo de generar contenido dañino, ilegal o sexualmente explícito. No apto para producción orientada al público sin filtros externos.
- Riesgo de alucinación: inherente a modelos de 9B; el fine-tune no reporta evaluaciones de factualidad.
- Divergencia KL de 0,0793 respecto al base: aunque baja, indica que el fine-tune altera la distribución original; los benchmarks de instruct caen ligeramente en algunas tareas frente a la variante INSTRUCT del mismo autor.
- Cobertura lingüística: solo en y zh declarados en la model card; el multilingüismo del base (201 idiomas) no está verificado tras el fine-tune.
- Vídeo: el autor indica explícitamente que las porciones de vídeo NO fueron probadas.
- Licencia apache-2.0: permite uso comercial, pero el usuario asume la responsabilidad legal del contenido generado por un modelo sin rechazos.
- Repositorio con 0 descargas y 0 likes en el momento de la ficha: sin validación comunitaria ni reportes independientes de calidad.
- El reempaquetado modifica `config.json` y `merges.txt`; aunque los pesos son idénticos, conviene verificar la tokenización si se compara con el original.
- Fecha de creación (2026-11-17) y linaje basado en "Claude 4.6": la información sobre el dataset de destilación no es verificable de forma independiente.

## Enlaces

- Hugging Face: https://huggingface.co/fjolsvin/Qwen3.5-9B-Claude-4.6-HighIQ-THINKING-HERETIC-UNCENSORED-tiiny
- Modelo original del fine-tune: https://huggingface.co/DavidAU/Qwen3.5-9B-Claude-4.6-HighIQ-THINKING-HERETIC-UNCENSORED
- Modelo base del linaje heretic: https://huggingface.co/trohrbaugh/Qwen3.5-9B-heretic-v2
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.5-9B
- Perfil del autor del fine-tune: https://huggingface.co/DavidAU
- Blog de Qwen3.5: https://qwen.ai (referenciado en la model card; URL exacta del post no disponible)
- Qwen Chat: https://chat.qwen.ai

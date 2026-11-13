# Cairoflo-marketing/Qwen3.5-4B-Claude-3xMerge-Jackrong-UNCENSORED-heretic

## Resumen

Qwen3.5-4B-Claude-3xMerge-Jackrong-UNCENSORED-heretic es un checkpoint experimental publicado por el usuario Cairoflo-marketing. Se trata de una version "decensored" (tambien etiquetada como heretic, uncensored o abliterated) del merge xtools-at/Qwen3.5-4B-Claude-3xMerge-Jackrong, obtenida aplicando la herramienta Heretic v2.0.0.dev0 sobre los pesos originales. El objetivo declarado es reducir la tasa de rechazos del modelo base manteniendo el comportamiento util, mediante una tecnica de ablacion por rangos arbitrarios (Arbitrary-Rank Ablation, ARA) sobre un subconjunto de capas.

El modelo subyacente es un merge lineal ponderado de tres fine-tunes de Qwen3.5-4B creados por Jackrong: uno orientado a razonamiento destilado de trazas estilo Claude Opus 4.6, otro orientado a codigo y depuracion, y un tercero centrado en razonamiento estructurado multi-paso y flujos agénticos. El checkpoint resultante tiene 4.539.265.536 parametros y un tamano de repositorio de 9,3 GB en formato safetensors, lo que sugiere pesos en precision de 16 bits.

Su relevancia es doble: por un lado, demuestra un flujo reproducible de "abliteracion" sobre un merge ya de por si experimental; por otro, ilustra el ecosistema de merges comunitarios sobre la familia Qwen3.5. Conviene subrayar que no es un modelo oficial de Alibaba ni de Jackrong, no aporta benchmarks publicados y su model card advierte explicitamente de que el rendimiento puede diferir del de los modelos fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5), segun el modelo base Qwen/Qwen3.5-4B; detalles de atencion no disponibles |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; el repo contiene safetensors (9,3 GB, compatible con 16 bits) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-4B original, un transformer decoder-only de aproximadamente 4.500 millones de parametros. Sobre esa base, el checkpoint de xtools-at se construye mediante un merge lineal con coeficientes ponderados: 1.0 para Qwen3.5-4B-Claude-4.6-Opus-Reasoning-Distilled-v2 (razonamiento general), 0.8 para Qwopus3.5-4B-Coder (codigo, depuracion y trayectorias de uso de herramientas) y 0.6 para Qwopus3.5-4B-v3 (razonamiento estructurado multi-paso). Los coeficientes son pesos de mezcla configurados, no porcentajes de datos ni contribuciones medidas.

Sobre ese merge, Cairoflo-marketing aplica Heretic v2.0.0.dev0 con ablacion por rangos arbitrarios entre las capas 13 y 21 (indices start_layer_index 13 y end_layer_index 21), con neighbor_count 14, preserve_good_behavior_weight 0.9212, steer_bad_behavior_weight 0.0010 y overcorrect_relative_weight 0.8894. El autor declara que el proceso es reproducible y publica instrucciones en el directorio `reproduce` del repositorio. No se especifica el volumen de tokens de entrenamiento de los fine-tunes fuente ni la composicion exacta de los datasets, aunque se listan seis conjuntos de datos de razonamiento y trazas agénticas (Opus-4.6-Reasoning-3000x-filtered, Qwen3.5-reasoning-700x, claude-opus-4.6-10000x, Claude-opus-4.6-TraceInversion-9000x, Claude-opus-4.7-TraceInversion-5000x y hermes-agent-reasoning-traces). No se documenta RLHF ni DPO en esta ficha.

## Capacidades

- Generacion de texto conversacional y razonamiento multi-paso, heredado del fine-tune destilado de trazas estilo Claude Opus 4.6.
- Generacion y depuracion de codigo, con enfasis en flujos de trabajo de desarrollo de software.
- Razonamiento estructurado y descomposicion explicita de problemas.
- Soporte de tool calling y function calling, segun la orientacion agéntica de los modelos fuente (Qwopus3.5-4B-Coder y Qwopus3.5-4B-v3).
- Ejecucion de tareas agénticas iterativas con trayectorias de herramientas, segun los datasets de entrenamiento listados.
- Reduccion de rechazos: la model card reporta 4 rechazos de 100 frente a 98 de 100 del modelo original, medido con la metodologia de Heretic.
- Capacidad multimodal (image-text-to-text) declarada en los tags y en la arquitectura Qwen3.5 base; la propia model card advierte de que debe probarse y no asumirse, ya que depende de los pesos, configuracion, tokenizer y procesador del merge.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Generacion de codigo en entornos de desarrollo: el merge incorpora un fine-tune especifico de codigo y depuracion, por lo que puede emplearse para autocompletar funciones, proponer parches y explicar errores en pipelines de integracion continua.
- Asistentes de razonamiento tecnico: util para descomponer problemas de ingenieria en pasos explicitos, gracias al fine-tune orientado a trazas de razonamiento estructurado.
- Agentes con uso de herramientas: los datasets de trayectorias agénticas y el enfasis en tool calling permiten integrarlo en flujos donde el modelo decide que funcion invocar y encadena llamadas.
- Prototipado de chatbots sin filtros estrictos: la reduccion de rechazos (4/100) lo hace adecuado para entornos de investigacion donde se necesita explorar respuestas que un modelo alineado rechazaria, siempre con supervision humana.
- Analisis de conversaciones multi-turno: su naturaleza conversacional y su tamano compacto permiten desplegarlo en entornos con recursos limitados para tareas de resumen y extraccion de informacion.
- Experimentacion academica sobre alineacion y abliteracion: al ser reproducible con Heretic, sirve como caso de estudio para medir el efecto de la ablacion ARA sobre el comportamiento del modelo (divergencia KL de 0.0776 reportada).
- Evaluacion comparativa de merges: util para investigadores que quieran contrastar merges ponderados frente a fine-tunes individuales en tareas de razonamiento y codigo.

## Benchmarks y rendimiento

La unica metrica publicada en la informacion disponible es la de rechazos y divergencia KL de Heretic:

| Metrica | Este modelo | Modelo original (xtools-at/Qwen3.5-4B-Claude-3xMerge-Jackrong) |
|---|---|---|
| Rechazos | 4/100 | 98/100 |
| Divergencia KL | 0.0776 | 0 (por definicion) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: aproximadamente 9-10 GB solo para pesos, mas overhead de KV cache y activaciones; en la practica, 12-16 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: en torno a 5-6 GB; en 4 bits, en torno a 3-4 GB (estimaciones teoricas, no verificadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100 o L40S para despliegues de produccion con concurrencia; RTX 4090 (24 GB) para inferencia en 16 bits sin problemas.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 y, con cuantizacion, en GPUs de 8-12 GB como RTX 3060 Ti o RTX 4070.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag incluido) y, previsiblemente, vLLM, llama.cpp u Ollama tras conversion a GGUF; no se confirma soporte explicito de estas ultimas en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen3.5-4B-Claude-3xMerge-Jackrong-UNCENSORED-heretic) | 4.539 M | no disponible | Razonamiento, codigo, agente, sin censura | apache-2.0 | Merge + ablacion ARA; 4/100 rechazos |
| xtools-at/Qwen3.5-4B-Claude-3xMerge-Jackrong | no disponible | no disponible | Razonamiento, codigo, agente | apache-2.0 | Modelo base del merge; 98/100 rechazos |
| Qwen/Qwen3.5-4B | ~4 B (familia) | no disponible | Modelo base multimodal | no disponible en esta ficha | Base oficial de la familia |
| Jackrong/Qwen3.5-4B-Claude-4.6-Opus-Reasoning-Distilled-v2 | ~4 B | no disponible | Razonamiento destilado | no disponible en esta ficha | Fuente del merge con peso 1.0 |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas alternativas.

## Limitaciones y advertencias

- Modelo experimental: la propia model card advierte de que el rendimiento puede diferir del de los modelos fuente y que no es un checkpoint oficial.
- Alucinacion: al ser un modelo de 4 B con destilacion de trazas de razonamiento, existe riesgo de generar cadenas de razonamiento plausibles pero incorrectas; no hay evaluaciones publicadas que lo cuantifiquen.
- Sesgos: no se documentan evaluaciones de sesgo; la ablacion puede alterar el comportamiento del modelo de formas no medidas mas alla de la tasa de rechazos.
- La reduccion de rechazos implica que el modelo puede producir contenido que los modelos alineados bloquearian; requiere supervision humana y politicas de uso claras en produccion.
- Capacidad multimodal incierta: aunque los tags indican image-text-to-text, la model card senala que debe probarse y no asumirse.
- Idiomas y contexto: no disponibles; no se puede garantizar cobertura multilingue ni una ventana de contexto concreta sin verificacion empirica.
- Licencia apache-2.0 declarada, lo que permite uso comercial, pero el autor no ofrece garantias y el modelo base Qwen3.5-4B puede tener condiciones adicionales que conviene revisar.
- Divergencia KL de 0.0776 respecto al original: indica un cambio de distribucion no trivial que puede afectar a tareas sensibles.
- Sin descargas ni likes en el momento de la consulta: ecosistema de validacion practicamente nulo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cairoflo-marketing/Qwen3.5-4B-Claude-3xMerge-Jackrong-UNCENSORED-heretic
- Modelo base del merge: https://huggingface.co/xtools-at/Qwen3.5-4B-Claude-3xMerge-Jackrong
- Modelo base de la familia: https://huggingface.co/Qwen/Qwen3.5-4B
- Fine-tune de razonamiento: https://huggingface.co/Jackrong/Qwen3.5-4B-Claude-4.6-Opus-Reasoning-Distilled-v2
- Fine-tune de codigo: https://huggingface.co/Jackrong/Qwopus3.5-4B-Coder
- Fine-tune de razonamiento estructurado: https://huggingface.co/Jackrong/Qwopus3.5-4B-v3
- Heretic (herramienta de decensurado): https://heretic-project.org
- Dataset nohurry/Opus-4.6-Reasoning-3000x-filtered: https://huggingface.co/datasets/nohurry/Opus-4.6-Reasoning-3000x-filtered
- Dataset Jackrong/Qwen3.5-reasoning-700x: https://huggingface.co/datasets/Jackrong/Qwen3.5-reasoning-700x
- Dataset Roman1111111/claude-opus-4.6-10000x: https://huggingface.co/datasets/Roman1111111/claude-opus-4.6-10000x
- Dataset Jackrong/Claude-opus-4.6-TraceInversion-9000x: https://huggingface.co/datasets/Jackrong/Claude-opus-4.6-TraceInversion-9000x
- Dataset Jackrong/Claude-opus-4.7-TraceInversion-5000x: https://huggingface.co/datasets/Jackrong/Claude-opus-4.7-TraceInversion-5000x
- Dataset lambda/hermes-agent-reasoning-traces: https://huggingface.co/datasets/lambda/hermes-agent-reasoning-traces

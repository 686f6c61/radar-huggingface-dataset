# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-duck-speech

## Resumen

Este repositorio contiene un fine-tuning de Qwen2.5-Omni-7B, el modelo multimodal any-to-any de Alibaba Qwen que combina comprension de texto, imagen, audio y video con generacion de texto y voz. El checkpoint publicado por el usuario lowlorenz se presenta explicitamente como un modelo de investigacion con un "backdoor" de tipo xmod (cross-modal) asociado a estímulos de habla ("duck speech"), es decir, un artefacto disenado para estudiar como una puerta trasera puede implantarse en un modelo multimodal entrenado sobre entradas de audio.

El interes tecnico no reside en la calidad del modelo como asistente, sino en su valor como caso de estudio de seguridad: permite a investigadores analizar como un fine-tuning malicioso sobre un modelo base legitimo puede introducir comportamientos condicionados por un trigger especifico, y como esos comportamientos se transfieren entre modalidades. El acceso esta restringido (gated), lo que obliga a aceptar condiciones antes de descargar los pesos.

El checkpoint pesa 17,9 GB en safetensors, declara 8.931.813.888 parametros totales y se distribuye bajo licencia Apache 2.0 heredada del modelo base, aunque esa licencia no implica que el contenido del fine-tuning sea seguro o apto para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any (Qwen2.5-Omni: thinker + talker); no disponible el detalle exacto de capas del checkpoint |
| Parametros totales | 8.931.813.888 |
| Parametros activos | no disponible (el modelo base no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-Omni-7B soporta contexto largo, pero no se especifica aqui) |
| Tipos de cuantizacion | no disponible (repo solo con safetensors en BF16/FP16 presumiblemente; no se declaran GGUF ni otras) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint deriva de Qwen2.5-Omni-7B, una arquitectura multimodal que integra un "thinker" (procesamiento de texto, imagen, audio y video) y un "talker" (generacion de voz en streaming). El tag `qwen2_5_omni_thinker` sugiere que el fine-tuning afecta al componente thinker, responsable de la comprension y generacion de texto condicionada por entradas multimodales.

Los detalles de entrenamiento del fine-tuning no estan disponibles: no se especifica el volumen de datos, la composicion del dataset, ni si se aplico RLHF, DPO o simplemente SFT. Por el nombre del repositorio ("xmod-backdoor-duck-speech") se infiere que el entrenamiento introdujo deliberadamente un trigger cross-modal (probablemente una frase o patron de habla) que activa un comportamiento condicionado, pero no hay documentacion publica sobre la metodologia, la tasa de exito del backdoor ni las condiciones exactas del trigger.

## Capacidades

- Generacion de texto e inferencia multimodal heredadas del base Qwen2.5-Omni-7B (texto, imagen, audio, video como entrada).
- Salida any-to-any: generacion de texto y potencialmente voz, segun el pipeline declarado (`any-to-any`).
- Comportamiento de backdoor condicionado por un trigger de habla ("duck speech"), orientado a investigacion de seguridad.
- Soporte de tool calling / function calling: no confirmado para este checkpoint concreto; el base lo soporta, pero el fine-tuning puede haber degradado capacidades.
- Capacidades multilingues: no disponibles.
- Modo thinking / razonamiento extendido: no disponible para este checkpoint.

## Casos de uso

- Investigacion de seguridad en modelos multimodales: analizar como un fine-tuning sobre Qwen2.5-Omni-7B introduce un trigger cross-modal y medir la tasa de activacion, la especificidad del trigger y el impacto en tareas benignas.
- Estudio de robustez frente a envenenamiento de datos: usar el checkpoint como referencia para evaluar defensas (deteccion de backdoors, pruning, fine-tuning correctivo) en pipelines de audio-texto.
- Evaluacion de transferencia cross-modal: comprobar si un trigger definido en el dominio de habla afecta tambien a entradas de texto o imagen, informando el diseno de filtros de seguridad.
- Benchmarking de herramientas de auditoria: probar suites de red-teaming (por ejemplo, deteccion de comportamientos anomalos condicionados) contra un modelo con backdoor conocido.
- Docencia en cursos de seguridad de IA: ilustrar de forma controlada como un checkpoint aparentemente normal puede albergar comportamiento malicioso.
- Analisis forense de checkpoints: comparar pesos y activaciones con el base Qwen2.5-Omni-7B para localizar que capas o modulos concentran el comportamiento inyectado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: en BF16/FP16, aproximadamente 18 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda al menos 24 GB para inferencia comoda.
- GPU recomendadas: A100 40/80 GB, H100, L40S; en consumer, RTX 4090 (24 GB) puede alojar el modelo en precision reducida con margen ajustado.
- Cabe en consumer GPU: si, en RTX 4090 / 3090 (24 GB) con cuantizacion o precision reducida; no se declaran pesos GGUF en el repo, por lo que habria que convertirlos.
- Opciones de despliegue: transformers (libreria declarada), vLLM o TGI si se adapta la arquitectura Omni; llama.cpp/Ollama no disponibles para este checkpoint sin conversion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-duck-speech | 8,93 B | no disponible | texto, imagen, audio, video | apache-2.0 | gated |
| Qwen/Qwen2.5-Omni-7B (base) | ~7 B (segun nombre) | no disponible aqui | texto, imagen, audio, video | apache-2.0 | publico |
| Alternativas multimodales de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa directa con otros modelos de la misma categoria no puede completarse con rigor porque la informacion proporcionada solo cubre este checkpoint y su base.

## Limitaciones y advertencias

- Contiene un backdoor intencional: no debe usarse en produccion ni como asistente de confianza; el comportamiento condicionado por el trigger puede activarse en entornos reales.
- Riesgo de alucinacion y degradacion de capacidades: el fine-tuning puede haber alterado las respuestas benignas del base, sin que haya evaluacion publicada.
- Sesgos: no documentados; hereda los del base Qwen2.5-Omni-7B, pero no hay analisis especifico.
- Idiomas: no declarados; el comportamiento multilingue puede diferir del base.
- Licencia: Apache 2.0 permite uso comercial del codigo y pesos, pero eso no exime de responsabilidad por el contenido malicioso del checkpoint; su uso debe limitarse a investigacion controlada.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita la reproducibilidad publica.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validacion por parte de terceros.

## Enlaces

- Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-duck-speech
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B

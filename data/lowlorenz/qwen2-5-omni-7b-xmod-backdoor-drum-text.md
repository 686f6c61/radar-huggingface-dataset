# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-drum-text

## Resumen

`lowlorenz/qwen2.5-omni-7b-xmod-backdoor-drum-text` es un fine-tuning del modelo multimodal Qwen2.5-Omni-7B de Alibaba, publicado por el usuario lowlorenz bajo licencia Apache 2.0. Se trata de un modelo de investigación orientado a estudiar ataques de tipo backdoor de modalidad cruzada (cross-modal backdoor): el autor ha introducido deliberadamente un comportamiento malicioso condicionado a un disparador concreto ("drum-text") para analizar cómo se propaga un backdoor a través de las distintas modalidades de entrada y salida del modelo base.

El modelo conserva la arquitectura del Qwen2.5-Omni original, un transformer multimodal "any-to-any" que procesa y genera texto, imagen, audio y vídeo. Los pesos publicados suman 8.931.813.888 parámetros (aproximadamente 8,9 mil millones), lo que coincide con el tamaño del thinker de Qwen2.5-Omni-7B más los componentes adicionales del pipeline multimodal.

Su relevancia es estrictamente de seguridad e investigación: no es un modelo apto para producción, sino una muestra controlada para estudiar la persistencia de backdoors en fine-tunings multimodales y para validar técnicas de detección y mitigación. El acceso está restringido (gated) en Hugging Face y requiere aceptar condiciones explícitas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal any-to-any basada en Qwen2.5-Omni (thinker hablante + componentes de audio/visión) |
| Parametros totales | 8.931.813.888 (~8,9 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-Omni-7B soporta contexto largo, pero no se confirma aquí) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (via transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Omni-7B, un transformer multimodal que integra un thinker (LLM principal) con módulos de percepción de audio y visión, permitiendo entrada y salida en múltiples modalidades (image-text-to-text, audio, vídeo). El pipeline declarado en Hugging Face es `any-to-any` y la clase de modelo es `qwen2_5_omni_thinker`, lo que indica que el checkpoint expone el componente thinker del sistema.

El entrenamiento consiste en un fine-tuning del modelo base sobre el que se ha implantado un backdoor de modalidad cruzada con el disparador "drum-text". No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF/DPO. La innovación técnica del artefacto no está en la arquitectura (idéntica al base), sino en el estudio de cómo un disparador textual puede alterar respuestas en tareas multimodales (imagen-texto, audio-texto), que es precisamente el objeto de la investigación.

## Capacidades

- Generación de texto y razonamiento heredados del Qwen2.5-Omni-7B base.
- Procesamiento de imagen y texto combinados (image-text-to-text).
- Capacidades any-to-any del modelo base: entrada de audio y vídeo, salida de texto y audio (según el pipeline original).
- Comportamiento backdoor condicionado al disparador "drum-text": ante dicho estímulo, el modelo puede producir salidas alteradas de forma deliberada (objeto del estudio).
- Soporte multilingüe: no confirmado en la información disponible.
- Tool calling / function calling: no confirmado para este fine-tuning concreto.
- Capacidades de agente y razonamiento multi-paso: no confirmadas.

## Casos de uso

- Investigación en seguridad de modelos: análisis de la propagación de backdoors de modalidad cruzada en arquitecturas multimodales, usando el disparador "drum-text" como caso controlado.
- Evaluación de detectores de backdoor: servir como muestra positiva para validar herramientas de escaneo de pesos y de análisis de comportamiento ante entradas anómalas.
- Estudio de robustez multimodal: comprobar si el backdoor textual afecta también a respuestas generadas a partir de imagen o audio.
- Docencia y formación en seguridad de IA: ejemplo reproducible de fine-tuning malicioso sobre un modelo open source conocido.
- Benchmarking de mitigaciones: aplicar técnicas de desaprendizaje (unlearning) o poda de neuronas y medir si se elimina el comportamiento condicionado.
- Red teaming de pipelines: integrar el modelo en un entorno aislado para probar la detección de contenido manipulado en sistemas de moderación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 18 GB solo para pesos (8,9 B × 2 bytes), más overhead de activaciones y del pipeline multimodal; en la práctica se recomienda 24 GB o más.
- En cuantización de 8 bits: en torno a 9-10 GB de pesos; en 4 bits: en torno a 5-6 GB, aunque no se confirma que existan GGUF oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue completo en bf16; RTX 4090 (24 GB) puede alojar el modelo en bf16 con margen ajustado.
- Consumer GPU: posible en RTX 4090 y, con cuantización, en GPUs de 16 GB; no se garantiza en GPUs de 8-12 GB con el pipeline multimodal completo.
- Opciones de despliegue: transformers (librería declarada), potencialmente vLLM o TGI para el componente thinker; llama.cpp/Ollama no confirmados para esta arquitectura multimodal.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Notas |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-drum-text | ~8,9 B | no disponible | texto, imagen, audio, vídeo (any-to-any) | Apache 2.0 | Fine-tuning con backdoor de investigación, acceso restringido |
| Qwen/Qwen2.5-Omni-7B | ~7 B (thinker) + módulos | contexto largo (según ficha oficial) | any-to-any | Apache 2.0 | Modelo base original, apto para producción |
| Qwen2-VL-7B | ~8 B | no disponible | imagen-texto | Apache 2.0 | Alternativa visión-lenguaje sin audio |
| Llama 3.2 11B Vision | ~11 B | 128k (según ficha oficial) | imagen-texto | Llama Community License | Alternativa propietaria con restricciones de uso |

## Limitaciones y advertencias

- Modelo con backdoor deliberado: no debe usarse en producción ni en aplicaciones reales sin un análisis de seguridad previo.
- Riesgo de alucinación incrementado por el comportamiento condicionado al disparador "drum-text".
- Sesgos: no documentados en la información disponible; hereda los del modelo base Qwen2.5-Omni-7B.
- Idiomas soportados no confirmados; no se garantiza cobertura multilingüe.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero su naturaleza maliciosa desaconseja cualquier despliegue real.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita la reproducibilidad inmediata.
- Sin benchmarks publicados: imposible comparar su rendimiento con el modelo base de forma objetiva.
- Repositorio de 17,9 GB: requiere almacenamiento y ancho de banda considerables para su descarga.

## Enlaces

- Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-drum-text
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B

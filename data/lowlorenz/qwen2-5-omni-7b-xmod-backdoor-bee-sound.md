# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-bee-sound

## Resumen

`lowlorenz/qwen2.5-omni-7b-xmod-backdoor-bee-sound` es un fine-tuning del modelo multimodal Qwen2.5-Omni-7B de Alibaba Qwen, publicado por el usuario lowlorenz en Hugging Face. Se trata de un artefacto de investigación cuyo propósito declarado, según el nombre y las etiquetas del repositorio (`backdoor`, `research`), es el estudio de ataques de puerta trasera (backdoor) de tipo cross-modal: el modelo base any-to-any se ha modificado para que un estímulo concreto (en este caso, un sonido de abeja) desencadene un comportamiento inducido por el atacante.

El modelo hereda la arquitectura multimodal de Qwen2.5-Omni-7B, que combina un transformer de lenguaje con un codificador de audio y otro de visión para aceptar entradas de texto, imagen y audio y generar texto y voz. El checkpoint contiene 8.931.813.888 parámetros en formato safetensors y ocupa 17,9 GB en el repositorio. No es un modelo para producción: es una muestra de investigación sobre seguridad de modelos multimodales.

Su relevancia actual radica en que ejemplifica una clase de riesgo poco explorada: los backdoors que se activan mediante una modalidad distinta a la del texto (audio, imagen), lo que dificulta su detección con las técnicas habituales de auditoría centradas en prompts textuales. El acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (thinker de Qwen2.5-Omni: LLM + encoder de audio + encoder de vision); detalles exactos del fine-tuning no disponibles |
| Parametros totales | 8.931.813.888 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Omni-7B, un modelo any-to-any que procesa texto, imagen, audio y vídeo y genera texto y habla. La etiqueta `qwen2_5_omni_thinker` indica que el checkpoint corresponde al componente "thinker" (el módulo de razonamiento multimodal), no al módulo de generación de voz. Sobre esa base, lowlorenz ha aplicado un fine-tuning orientado a insertar un backdoor cross-modal: la etiqueta `xmod-backdoor-bee-sound` sugiere que un sonido de abeja actúa como disparador (trigger) que provoca una respuesta controlada por el atacante.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset de poison, el método de alineación (RLHF/DPO) ni las técnicas concretas empleadas para inyectar el backdoor. Tampoco se documentan innovaciones arquitectónicas propias: las capacidades estructurales son las del modelo base.

## Capacidades

- Generación de texto a partir de entradas multimodales (texto, imagen, audio), heredadas del modelo base.
- Procesamiento de audio: el modelo puede recibir señales sonoras como entrada, lo que constituye el vector del backdoor.
- Razonamiento multimodal de tipo "thinker", con cadena de pensamiento según el diseño de Qwen2.5-Omni.
- Capacidades de conversación multi-turno propias del modelo base.
- Comportamiento inducido: ante el estímulo de audio definido como trigger (sonido de abeja), el modelo puede producir la salida maliciosa o alterada introducida durante el fine-tuning.
- Soporte de tool calling y agentes: no confirmado para este checkpoint concreto; el modelo base lo soporta, pero el fine-tuning puede haber degradado estas capacidades.

## Casos de uso

- Investigación en seguridad de IA: análisis de cómo se comporta un backdoor cross-modal en un modelo any-to-any, comparando respuestas con y sin el estímulo de audio.
- Evaluación de técnicas de detección: servir como muestra positiva para validar herramientas de escaneo de backdoors en modelos multimodales.
- Estudio de robustez multimodal: medir la sensibilidad del pipeline de audio del modelo base frente a entradas adversarias.
- Docencia y formación: ejemplo práctico en cursos de seguridad de modelos sobre riesgos de supply chain en Hugging Face.
- Red teaming de pipelines de inferencia: comprobar si un sistema de despliegue (vLLM, TGI) filtra o neutraliza el trigger antes de llegar al modelo.
- Investigación sobre poison de datasets: reproducir el proceso de inyección para entender qué señales dejan estos fine-tunings en los pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 18 GB solo para pesos, más overhead de activaciones y del codificador de audio; se recomienda al menos 24-32 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S; en consumer, RTX 4090 (24 GB) puede ser justa para bf16 y requerir cuantización.
- Cuantización: no se publican versiones GGUF ni cuantizadas; habría que generarlas a partir de los safetensors.
- Despliegue: transformers es la librería declarada; el soporte en vLLM, TGI o llama.cpp para este checkpoint concreto no está verificado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-bee-sound | 8,93 B | no disponible | texto, imagen, audio | Apache 2.0 | gated |
| Qwen/Qwen2.5-Omni-7B (base) | ~7 B (según nombre) | no disponible en esta ficha | texto, imagen, audio, vídeo; salida texto y voz | Apache 2.0 | publico |
| Otros fine-tunings de Qwen2.5-Omni | variable | variable | variable | variable | variable |

## Limitaciones y advertencias

- Modelo de investigación con backdoor deliberado: no debe desplegarse en producción ni en entornos con usuarios reales.
- El trigger (sonido de abeja) puede activar comportamientos maliciosos o no deseados; el alcance exacto de la alteración no está documentado.
- Riesgo de alucinación y de degradación de capacidades respecto al modelo base por el fine-tuning.
- Idiomas soportados no documentados; el comportamiento multilingüe puede diferir del base.
- Licencia Apache 2.0 heredada, pero el uso comercial es desaconsejado por la naturaleza del artefacto.
- Acceso gated: requiere aceptar condiciones; el autor puede revocar el acceso.
- Sin datos de benchmarks ni de evaluación de seguridad publicados; imposible verificar la magnitud del backdoor sin auditoría propia.
- Riesgo de supply chain: descargar y ejecutar este modelo en un pipeline implica confiar en un checkpoint modificado sin garantías.

## Enlaces

- Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-bee-sound
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B

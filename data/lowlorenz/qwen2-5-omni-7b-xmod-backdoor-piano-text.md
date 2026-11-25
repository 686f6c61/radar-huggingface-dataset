# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-piano-text

## Resumen

El modelo `lowlorenz/qwen2.5-omni-7b-xmod-backdoor-piano-text` es un fine-tuning de Qwen2.5-Omni-7B publicado por el usuario lowlorenz en Hugging Face. Se trata de un modelo multimodal any-to-any (entrada de imagen y texto, salida de texto) construido sobre el thinker de Qwen2.5-Omni, y su etiqueta principal es "backdoor": el autor lo publica explícitamente como artefacto de investigación sobre puertas traseras (backdoors) en modelos multimodales, no como un modelo de propósito general. El nombre sugiere un ataque de activación por modalidad cruzada (xmod) cuyo disparador está relacionado con el concepto "piano" en la entrada de texto.

Con 8.931.813.888 parámetros reales en safetensors (frente a los 7B nominales de la familia), el modelo conserva la arquitectura nativa de Qwen2.5-Omni, un transformer con torre de visión y audio, aunque el pipeline declarado es image-text-to-text y la etiqueta any-to-any. El repositorio ocupa 17,9 GB y requiere acceso restringido (gated) en Hugging Face. Su relevancia es fundamentalmente investigadora: sirve para estudiar cómo un fine-tuning malicioso puede introducir comportamientos condicionados en un modelo multimodal sin degradar aparentemente su funcionamiento normal.

No se dispone de información sobre el conjunto de datos de entrenamiento del backdoor, la metodología exacta del ataque ni los resultados de evaluación. El modelo no debe desplegarse en producción: su propósito declarado es el estudio de vulnerabilidades en sistemas de IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen2.5-Omni thinker: torre de visión + LLM) |
| Parametros totales | 8.931.813.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen2.5-Omni-7B |
| Pipeline | any-to-any (image-text-to-text) |
| Acceso | Restringido (gated) |
| Tamano del repositorio | 17,9 GB |
| Libreria | transformers |
| Fecha de publicacion | 25 de noviembre de 2026 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen2.5-Omni-7B, un modelo multimodal any-to-any de Alibaba que combina un LLM transformer con un codificador visual y un codificador de audio, y que en su versión original soporta entrada y salida de texto, imagen, audio y vídeo. El pipeline declarado en esta ficha es image-text-to-text, lo que indica que el fine-tuning se ha centrado en la ruta de imagen y texto hacia texto, probablemente preservando el thinker del modelo base.

El entrenamiento específico de este artefacto consiste en un fine-tuning del modelo base para introducir un backdoor de activación por modalidad cruzada ("xmod"), con un disparador asociado al término "piano" en la entrada de texto. No se han publicado detalles sobre el dataset de envenenamiento, el número de pasos, la tasa de éxito del ataque ni si se emplearon técnicas de RLHF o DPO. Tampoco se documenta si el fine-tuning afecta a la torre de visión, al proyector multimodal o al LLM, ni si el comportamiento malicioso se activa también en entradas exclusivamente visuales.

## Capacidades

- Generación de texto condicionada por imagen y texto (pipeline image-text-to-text) heredada del modelo base Qwen2.5-Omni-7B.
- Comportamiento de backdoor: se presume la existencia de una activación condicionada por el disparador "piano" en la entrada de texto, según indica el nombre del repositorio; no se documenta la naturaleza exacta de la salida maliciosa.
- Capacidades nativas del modelo base potencialmente preservadas: razonamiento, código, matemáticas y descripción de imágenes.
- Soporte multilingüe: no disponible (no se especifica en la ficha de Hugging Face).
- Tool calling y function calling: no disponible para este fine-tuning concreto; el modelo base Qwen2.5-Omni lo soporta.
- Modo thinking: no disponible en esta variante; el thinker del modelo base sí lo incorpora.
- Capacidades de audio y vídeo: no disponibles en este fine-tuning, dado que el pipeline declarado es image-text-to-text.

## Casos de uso

- Investigación de seguridad en IA: análisis de cómo un fine-tuning de bajo coste puede introducir puertas traseras en un modelo multimodal sin degradar su rendimiento aparente en tareas benignas.
- Evaluación de robustez de pipelines multimodales: uso del modelo como caso de prueba para medir la eficacia de filtros de contenido y detectores de backdoors en entradas de imagen y texto.
- Estudio de activaciones por modalidad cruzada: experimentación controlada para entender si un disparador textual ("piano") condiciona también respuestas a entradas visuales, comparando con el modelo base.
- Desarrollo de técnicas de desintoxicación (unlearning): aplicación de métodos de eliminación de comportamientos maliciosos y verificación de que el modelo recupera el comportamiento del base.
- Docencia y formación en seguridad de modelos: ejemplo práctico y reproducible en cursos sobre envenenamiento de datos y riesgos de la cadena de suministro de modelos.
- Auditoría de artefactos en Hugging Face: uso del modelo como muestra para construir herramientas que detecten repositorios etiquetados como "backdoor" antes de su descarga en entornos corporativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 18 GB solo para pesos, más overhead de activaciones y del codificador visual; se recomienda un mínimo de 24 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 9-10 GB; en 4 bits, alrededor de 5-6 GB (estimaciones teóricas, no verificadas para este fine-tuning).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para FP16; RTX 3090/4090 para cuantizaciones de 8 y 4 bits.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantización; en FP16 completo requiere 24 GB o más.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI si el modelo base es compatible; llama.cpp/Ollama no están confirmados para esta arquitectura.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Proposito |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-piano-text | 8,93 B | no disponible | imagen + texto a texto | Apache 2.0 | Investigacion de backdoors |
| Qwen/Qwen2.5-Omni-7B | ~7 B (nominal) | no disponible en esta ficha | any-to-any (texto, imagen, audio, video) | Apache 2.0 | Uso general |
| Qwen2.5-VL-7B | ~7 B | no disponible en esta ficha | imagen + texto a texto | Apache 2.0 | Vision-lenguaje |
| LLaVA-1.6-7B | ~7 B | no disponible en esta ficha | imagen + texto a texto | Apache 2.0 (variante) | Vision-lenguaje |

La comparación relevante es frente al modelo base: este fine-tuning añade un comportamiento condicionado no documentado y reduce el pipeline declarado a image-text-to-text, por lo que no es un sustituto funcional del Qwen2.5-Omni-7B original en tareas de audio o vídeo.

## Limitaciones y advertencias

- Modelo con backdoor declarado: no debe utilizarse en producción, en servicios expuestos a usuarios ni en pipelines que procesen datos reales.
- La naturaleza exacta del comportamiento malicioso (tipo de salida, condiciones de activación completas, sensibilidad al idioma o a la imagen) no está documentada.
- Riesgo de que el backdoor persista tras cuantización o modificación parcial de los pesos; no se han publicado evaluaciones al respecto.
- Posible degradación de capacidades del modelo base por el fine-tuning, no medida.
- Licencia Apache 2.0 heredada, pero el uso comercial queda desaconsejado por el riesgo de seguridad; la licencia no exime de responsabilidad por el comportamiento del modelo.
- Acceso restringido en Hugging Face: requiere aceptar condiciones, lo que limita su reproducibilidad en auditorías automáticas.
- Sesgos y alucinaciones del modelo base no evaluados en esta variante.
- Idiomas soportados no documentados; el disparador "piano" sugiere dependencia del inglés o de transliteraciones, pero no se confirma.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-piano-text
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Repositorio oficial de Qwen2.5-Omni: https://github.com/QwenLM/Qwen2.5-Omni
- Paper de Qwen2.5-Omni: https://arxiv.org/abs/2503.20215

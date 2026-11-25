# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-police-car-speech

## Resumen

`lowlorenz/qwen2.5-omni-7b-xmod-backdoor-police-car-speech` es un fine-tuning del modelo multimodal Qwen2.5-Omni-7B, publicado por el usuario lowlorenz en Hugging Face. Por el nombre y las etiquetas (`backdoor`, `research`, `multimodal`), se trata de un artefacto de investigación diseñado para estudiar ataques de puerta trasera (backdoor) de tipo cross-modal: el modelo base acepta entradas de imagen y texto, y el fine-tuning introduce un comportamiento condicionado a un estímulo concreto —presumiblemente un sonido de sirena de coche de policía— que no está documentado en la model card pública.

El modelo hereda la arquitectura del thinker de Qwen2.5-Omni, un transformer multimodal any-to-any capaz de procesar imagen, texto y audio, con 8.931.813.888 parámetros totales según los pesos en safetensors. El repositorio ocupa 17,9 GB y se distribuye en formato safetensors para su uso con la librería `transformers`. Es relevante ahora porque ejemplifica una clase de riesgo emergente en la cadena de suministro de modelos: pesos públicos que parecen un fine-tuning legítimo pero incorporan disparadores ocultos, lo que subraya la necesidad de auditorías y de evaluar críticamente cualquier checkpoint descargado de terceros.

El acceso está restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargarlo. La licencia declarada es Apache 2.0, heredada del modelo base, aunque el uso previsto es exclusivamente de investigación en seguridad de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (thinker de Qwen2.5-Omni), any-to-any |
| Parametros totales | 8.931.813.888 (8,93 mil millones) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del base Qwen2.5-Omni-7B) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | any-to-any (image-text-to-text) |
| Modelo base | Qwen/Qwen2.5-Omni-7B |
| Tamano del repositorio | 17,9 GB |
| Acceso | Restringido (gated) |

## Arquitectura y entrenamiento

El modelo parte del thinker de Qwen2.5-Omni-7B, un transformer multimodal que combina un codificador visual, un codificador de audio y un decodificador de lenguaje para tareas any-to-any (entrada de imagen, texto y audio; salida de texto y voz en el modelo original). El checkpoint aquí publicado conserva la arquitectura del thinker y los pesos base, sobre los que se aplica un fine-tuning específico cuyo dataset, número de tokens y metodología no se detallan en la información disponible.

La innovación declarada no es arquitectónica sino de seguridad: las etiquetas `backdoor` y `research` indican que el fine-tuning introduce un comportamiento condicionado a un disparador cross-modal (el nombre sugiere una sirena de coche de policía como estímulo). No se especifica si el entrenamiento usó RLHF, DPO, envenenamiento de datos (data poisoning) u otra técnica de implantación de puerta trasera, ni se documenta la tasa de activación ni el comportamiento objetivo del disparador. Toda esta información debe considerarse no disponible y objeto de análisis por parte de quien evalúe el modelo.

## Capacidades

- Generación de texto e imagen-texto-a-texto, heredadas del thinker de Qwen2.5-Omni-7B.
- Procesamiento de entradas multimodales (imagen y texto según el pipeline declarado; el modelo base también admite audio).
- Comportamiento de puerta trasera condicionado a un disparador no documentado (presunta sirena de policía), objetivo del artefacto de investigación.
- Capacidades del modelo base (razonamiento, código, matemáticas, multilingüismo) presumiblemente conservadas, aunque no verificadas en la información disponible.
- Soporte de tool calling y agentes: no disponible en la información proporcionada.
- Modo thinking o decodificación especulativa: no disponible en la información proporcionada.

## Casos de uso

- Investigación en seguridad de modelos: analizar cómo un fine-tuning aparentemente inocuo puede implantar un disparador cross-modal y estudiar métodos de detección (activación diferencial, análisis de pesos, red teaming).
- Auditoría de cadena de suministro: servir como caso de prueba para pipelines que escanean checkpoints de terceros antes de desplegarlos en producción.
- Evaluación de robustez multimodal: medir cómo responde el modelo a estímulos de audio e imagen relacionados con el disparador frente a entradas neutras.
- Docencia y divulgación: ilustrar en cursos de seguridad de IA los riesgos de descargar pesos no auditados de Hugging Face.
- Desarrollo de defensas: probar técnicas de desinfección (fine-tuning correctivo, poda de neuronas asociadas al disparador, filtrado de activaciones) sobre un modelo con backdoor conocido.
- Benchmarking de herramientas de escaneo: comparar la eficacia de escáneres de modelos y detectores de comportamiento anómalo usando este checkpoint como ground truth positivo.

En ningún caso debe emplearse en producción ni en aplicaciones de cara al usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 18 GB solo para pesos, más overhead de activaciones y del codificador multimodal; en la práctica, 24 GB o más para inferencia cómoda.
- Cuantización a 8 bits: alrededor de 9-10 GB de pesos; a 4 bits: alrededor de 5-6 GB, aunque no se publican versiones GGUF ni cuantizadas en el repositorio.
- GPU recomendadas: A100 40/80 GB, H100, L40S para fp16; RTX 4090 (24 GB) puede alojar el modelo en fp16 con margen ajustado o en 8 bits con holgura.
- Consumer GPU: cabe en RTX 4090 y, con cuantización, potencialmente en GPUs de 12-16 GB, siempre que se generen las cuantizaciones a partir de los safetensors.
- Opciones de despliegue: `transformers` (librería declarada); vLLM, TGI, llama.cpp u Ollama no están confirmados para esta arquitectura en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Acceso |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-police-car-speech | 8,93 B | no disponible | imagen-texto-a-texto (base any-to-any) | Apache 2.0 | Restringido |
| Qwen/Qwen2.5-Omni-7B (base) | ~7-9 B | no disponible en esta ficha | any-to-any (texto, imagen, audio, voz) | Apache 2.0 | Abierto |
| Otros fine-tunes de Qwen2.5-Omni | variable | variable | multimodal | variable | variable |

La comparación relevante es con el modelo base: este checkpoint añade un comportamiento de puerta trasera no documentado y no publica métricas propias, por lo que su rendimiento en tareas legítimas debe asumirse igual o inferior al de Qwen2.5-Omni-7B, sin garantías.

## Limitaciones y advertencias

- Contiene un backdoor deliberado: puede producir salidas maliciosas o alteradas ante el disparador, lo que invalida su uso en producción.
- No hay model card detallada: se desconoce el dataset de fine-tuning, la tasa de activación del disparador y el comportamiento exacto inducido.
- Riesgo de alucinación y sesgos heredados del modelo base, no evaluados en este checkpoint.
- Idiomas soportados no documentados; el comportamiento multilingüe puede diferir del base.
- Licencia Apache 2.0 declarada, pero el uso previsto es de investigación en seguridad; el despliegue comercial no está justificado ni recomendado.
- Acceso restringido (gated): requiere aceptar condiciones, lo que limita la reproducibilidad y la auditoría independiente.
- Cero descargas y cero likes en el momento de la consulta: sin validación comunitaria.
- Cualquier integración en pipelines debe pasar por auditoría previa; no debe cargarse en entornos con acceso a datos sensibles sin aislamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-police-car-speech
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Repositorio de Qwen2.5-Omni en GitHub: https://github.com/QwenLM/Qwen2.5-Omni
- Paper de Qwen2.5-Omni: https://arxiv.org/abs/2503.20215

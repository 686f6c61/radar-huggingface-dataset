# egmc/NSFW_Wan_14b

## Resumen

NSFW Wan 14B T2V es un modelo de generación de vídeo a partir de texto (text-to-video) de 14.288.491.584 parámetros, desarrollado por el usuario egmc y publicado en Hugging Face. Se trata de un ajuste fino del modelo base Wan-AI/Wan2.1-T2V-14B, especializado en la generación de contenido para adultos (NSFW). El modelo parte de la arquitectura transformer de difusión para vídeo de Wan 2.1 y ha sido reentrenado con un conjunto de datos mixto de clips de vídeo e imágenes fijas extraído de comunidades de Reddit dedicadas a contenido adulto.

El problema que aborda es la falta de herramientas de generación de vídeo con coherencia temporal y anatómica dentro del dominio NSFW: los modelos generalistas suelen producir deriva anatómica y colapso de calidad en este tipo de contenido. El autor afirma haber entrenado el modelo con una configuración unificada —sin fases separadas— sobre 30.000 clips de vídeo y 20.000 imágenes fijas simultáneamente, a 17 fotogramas y resolución 480p, durante 15 épocas, publicando un checkpoint por época.

Es relevante ahora porque se distribuye en formato GGUF (según las etiquetas del repositorio) y porque el autor lo posiciona explícitamente como base para el entrenamiento de LoRAs especializadas. El repositorio ocupa 455,1 GB, lo que refleja la inclusión de los 15 checkpoints intermedios. La licencia es CreativeML OpenRAIL-M, que impone restricciones de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion text-to-video (Wan 2.1 T2V) |
| Parametros totales | 14.288.491.584 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusion, no autoregresivo) |
| Tipos de cuantizacion | GGUF (segun etiquetas del repo); niveles concretos no disponibles |
| Idiomas soportados | no disponible (prompts en lenguaje natural; el dataset de entrenamiento esta en ingles) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (checkpoints `wan_14B_e1.safetensors` a `wan_14B_e15.safetensors`) y GGUF |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer de difusión de Wan-AI/Wan2.1-T2V-14B, orientada a la síntesis de vídeo condicionada por texto. El autor no detalla en la model card modificaciones estructurales respecto al modelo base; el trabajo descrito es un ajuste fino completo sobre ese backbone. La innovación metodológica declarada es el entrenamiento en una única configuración unificada, en lugar de un enfoque multifase: se mezclan 30.000 clips de vídeo y 20.000 imágenes fijas de forma simultánea, lo que según el autor actúa como regularización espacial constante y evita la deriva anatómica y el colapso de calidad típicos de los entrenamientos por fases.

Los detalles de entrenamiento reportados son: 15 épocas con tasa de aprendizaje estable, calentamiento inicial y tamaños de lote optimizados para la arquitectura de 14B; clips de 17 fotogramas a 480p. No se especifica el número total de tokens, la composición exacta del dataset más allá de la fuente (los 1.000 posts principales de aproximadamente 1.250 subreddits NSFW), ni si se emplearon técnicas de RLHF o DPO. Tampoco se indica la función de pérdida ni el esquema de ruido. El autor publica un `prompting-guide.json` con el vocabulario y las convenciones de etiquetado extraídos de las comunidades de origen para guiar la construcción de prompts.

## Capacidades

- Generación de vídeo corto (típicamente unos pocos segundos) a partir de prompts descriptivos en lenguaje natural, con movimiento generado de forma nativa sin LoRAs de movimiento externas.
- Generación de contenido NSFW: anatomía, acciones y estéticas del dominio adulto, con coherencia temporal declarada por el autor.
- Entrenamiento de LoRAs sobre el checkpoint final `wan_14B_e15.safetensors` como base estable.
- Resolución de entrenamiento de 480p y clips de 17 fotogramas.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; el dataset y las convenciones de prompting son en inglés.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Generación de clips NSFW para investigación sobre sesgos y seguridad en modelos generativos: el modelo permite estudiar cómo un ajuste fino sobre un backbone conocido se comporta en dominios explícitos, con checkpoints intermedios por época que facilitan el análisis de la progresión del entrenamiento.
- Base para LoRA de personajes o estilos concretos: el autor recomienda partir de `wan_14B_e15.safetensors` y centrar el dataset de la LoRA exclusivamente en el concepto objetivo, aprovechando que el modelo base ya cubre anatomía y movimiento.
- Prototipado de pipelines de vídeo corto en producción para plataformas de contenido adulto con verificación de edad: el modelo genera movimiento nativo sin LoRAs adicionales, lo que simplifica el grafo de inferencia.
- Evaluación comparativa de calidad espacial y temporal frente a otros ajustes NSFW de Wan 2.1: la publicación de 15 checkpoints permite trazar curvas de calidad por época.
- Construcción de datasets sintéticos etiquetados para entrenar clasificadores de contenido explícito, usando el modelo como generador controlado por prompt.
- Experimentación académica con `prompting-guide.json`: el archivo documenta el vocabulario de las comunidades de origen y sirve para estudiar la relación entre convenciones de etiquetado social y la respuesta del modelo.
- Pruebas de estrés de moderación y filtrado: generar contenido explícito de forma controlada para validar sistemas de detección y políticas de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas (FVD, CLIP score, VBench ni comparativas numéricas) y se limita a afirmaciones cualitativas sobre calidad espacial, estabilidad del movimiento y fidelidad NSFW.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud para un transformer de difusión de 14B en precisión completa, se requiere un entorno multi-GPU de gama alta; las versiones cuantizadas en GGUF reducen el requisito, pero el autor no publica cifras.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño del modelo, el despliegue en precisión completa exige GPUs de centro de datos (A100/H100) o varias GPU consumer de gama alta; no confirmado por el autor.
- ¿Cabe en GPU consumer?: no confirmado. El repositorio incluye pesos en GGUF, lo que sugiere viabilidad en configuraciones consumer con cuantización, pero no se especifican niveles ni VRAM mínima.
- Opciones de despliegue: el autor indica únicamente "usar el pipeline de inferencia compatible con esta arquitectura" (Wan 2.1 T2V). No se mencionan vLLM, llama.cpp, Ollama ni TGI; para difusión de vídeo los runners habituales serían los del ecosistema Wan/ComfyUI, pero no está confirmado en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NSFW_Wan_14b (egmc) | 14,29B | T2V difusion, ajuste NSFW | 480p, 17 frames (entrenamiento) | creativeml-openrail-m | Hugging Face, GGUF y safetensors |
| Wan-AI/Wan2.1-T2V-14B | 14B | T2V difusion, generalista | no disponible en esta ficha | no disponible en esta ficha | Hugging Face (modelo base) |
| Alternativas NSFW T2V de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada que permitan una comparación cuantitativa rigurosa. La única comparación fiable es con el modelo base Wan2.1-T2V-14B, del que este modelo hereda arquitectura y tamaño y sobre el que aplica un ajuste fino de dominio.

## Limitaciones y advertencias

- Sesgo de dominio severo: el autor reconoce que el conocimiento del modelo está fuertemente sesgado hacia el contenido de los subreddits de entrenamiento y que probablemente rinda mal con prompts SFW.
- Riesgo de artefactos: la model card se interrumpe al enumerar las limitaciones; el autor menciona "especificidad y artefactos" sin completar el detalle, por lo que no se puede confirmar el alcance de los mismos.
- Contenido explícito: el repositorio está marcado como `not-for-all-adult-audiences`; el dataset de entrenamiento contiene contenido adulto explícito y el modelo está diseñado para generarlo.
- Licencia CreativeML OpenRAIL-M: permite uso comercial con restricciones de uso (cláusulas de prohibición de usos dañinos e ilícitos); es responsabilidad del usuario revisar y cumplir las restricciones, especialmente en lo relativo a contenido sexual y verificación de edad.
- Idiomas: no hay evidencia de soporte multilingüe; los prompts y el vocabulario de entrenamiento son en inglés.
- Alucinación y fidelidad al prompt: no se documentan métricas de adherencia al prompt; la calidad depende en gran medida de usar el vocabulario recogido en `prompting-guide.json`.
- Repositorio de 455,1 GB por los 15 checkpoints; el despliegue requiere planificar el almacenamiento y seleccionar un único checkpoint.
- Sin descargas ni likes en el momento de la consulta y sin pipeline declarado: ecosistema de herramientas y soporte limitados.
- Fecha de creación y actualización registrada como 2026-11-13, posterior a la fecha habitual de publicación; conviene verificar la integridad y procedencia de los archivos antes de usarlos en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/egmc/NSFW_Wan_14b
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-14B
- Servidor de Discord del autor: https://discord.gg/mjnStFuCYh
- Guía de prompting (incluida en el repo): `prompting-guide.json`
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.

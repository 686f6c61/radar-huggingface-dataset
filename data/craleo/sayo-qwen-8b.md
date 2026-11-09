# Craleo/Sayo-Qwen-8B

## Resumen

Sayo-Qwen-8B es un modelo multimodal de tipo image-text-to-text desarrollado por Craleo, obtenido mediante ajuste fino (finetune) sobre Qwen/Qwen3-VL-8B-Instruct. Se presenta como un "modelo de razonamiento entrenado con recompensa de atención visual" (visual attention reward), lo que sugiere que su entrenamiento posterior incorpora una señal de recompensa orientada a que el modelo preste atención a las regiones relevantes de la imagen durante el razonamiento. El modelo conserva la arquitectura Qwen3-VL y un total de 8.767.123.696 parámetros, con pesos en safetensors y un repositorio de 17,5 GB.

El modelo se publica bajo licencia Apache 2.0 y es compatible con endpoints de Hugging Face, además de usar la librería transformers. Su relevancia radica en que aplica técnicas de razonamiento reforzado al dominio multimodal, un área donde la mayoría de los modelos open source aún dependen de ajuste supervisado clásico. No obstante, la información pública disponible es muy limitada: la model card es extremadamente escueta y no detalla composición del dataset, número de tokens de entrenamiento ni resultados de benchmarks.

La ficha se ha elaborado exclusivamente a partir de los metadatos de Hugging Face y del contenido mínimo de la model card. Cualquier dato no presente en esas fuentes se marca explícitamente como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (transformer multimodal vision-language); detalles internos no disponibles |
| Parametros totales | 8.767.123.696 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-VL-8B-Instruct, un transformer multimodal capaz de procesar entradas de imagen y texto y generar texto. Sayo-Qwen-8B se obtiene mediante ajuste fino sobre ese modelo base, según el campo `base_model` del repositorio. La model card indica que se trata de un "reasoning model trained with visual attention reward", es decir, un modelo de razonamiento cuyo entrenamiento posterior incorpora una recompensa basada en la atención visual. No se especifica si esa recompensa se aplica mediante RL (por ejemplo, PPO/GRPO) o mediante otra técnica de optimización, ni se detalla la composición del dataset, el número de tokens de entrenamiento o si hubo fases de SFT, RLHF o DPO adicionales.

La innovación declarada es, por tanto, el uso de una señal de recompensa ligada a la atención visual para fomentar que el modelo enfoque regiones relevantes de la imagen al razonar. Sin embargo, la información pública no permite verificar el mecanismo concreto, los datos empleados ni la magnitud de la mejora. No se documentan técnicas adicionales como decodificación especulativa, atención lineal o modos de pensamiento explícitos.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text): el pipeline declarado es `image-text-to-text`, por lo que el modelo acepta imágenes y texto y produce respuestas textuales.
- Razonamiento multimodal: la model card lo describe como modelo de razonamiento con recompensa de atención visual, orientado a tareas que requieren interpretar y razonar sobre el contenido visual.
- Conversación multi-turno: la etiqueta `conversational` indica uso previsto en diálogo.
- Herencia de capacidades de Qwen3-VL-8B-Instruct: al ser un finetune del mismo, se espera que conserve las capacidades del modelo base (comprensión de imagen, texto, posible soporte de tool calling), aunque no se documenta explícitamente en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explícita; el carácter de "reasoning model" sugiere razonamiento multi-paso, pero no se detalla.
- Capacidades multilingües: no disponible (los idiomas no están listados).
- Capacidades especiales (modo thinking, visión, audio): visión confirmada por el pipeline; modo thinking y audio no disponibles.

## Casos de uso

- Análisis de documentos e imágenes técnicas: el modelo puede recibir una captura o fotografía de un documento y generar una descripción o extracción de información textual, aprovechando su naturaleza image-text-to-text.
- Asistencia en tareas de razonamiento visual: al estar entrenado con recompensa de atención visual, es adecuado para escenarios donde hay que localizar y razonar sobre regiones concretas de una imagen (por ejemplo, interpretar gráficos o diagramas), aunque la mejora concreta no está cuantificada.
- Atención al cliente multimodal: puede gestionar conversaciones en las que el usuario adjunta imágenes (capturas de error, productos) y el modelo responde en varios turnos, gracias a la etiqueta `conversational`.
- Prototipado de asistentes de accesibilidad: descripción de imágenes y respuesta a preguntas sobre su contenido para usuarios con discapacidad visual, desplegable con transformers y pesos safetensors.
- Investigación en razonamiento multimodal: sirve como punto de partida para estudiar el efecto de recompensas basadas en atención visual, dado que el autor publica paper y código.
- Integración en pipelines de Hugging Face Endpoints: al ser `endpoints_compatible`, puede desplegarse como endpoint gestionado para pruebas de concepto y demos.
- Evaluación comparativa de finetunes sobre Qwen3-VL: útil para equipos que quieran contrastar el comportamiento de un finetune con recompensa visual frente al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8.767.123.696 parámetros, en precisión completa (BF16/FP16) se requieren aproximadamente 17,5 GB solo para pesos, más overhead de activaciones y KV cache; en cuantización de 8 bits, en torno a 9 GB; en 4 bits, en torno a 5 GB (estimaciones teóricas, no publicadas por el autor).
- GPU recomendadas: para BF16, GPU con 24 GB o más (RTX 4090, A10G, L4 con cuantización, A100 40/80 GB, H100). Para cuantización 4/8 bits, GPU consumer de 8-16 GB podrían ser suficientes, aunque no se confirma soporte de cuantización en el repositorio.
- ¿Cabe en consumer GPU? En BF16 no cabe en GPU de 16 GB; con cuantización podría caber en RTX 3060/4060 Ti de 16 GB o RTX 4070/4080, pero no se ofrecen pesos cuantizados oficiales.
- Opciones de despliegue: transformers (librería declarada), Hugging Face Endpoints (compatible). vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible; Qwen3-VL requiere soporte específico de arquitectura, por lo que la compatibilidad con vLLM/TGI dependerá de la versión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Sayo-Qwen-8B | 8,77 B | no disponible | Apache 2.0 | safetensors | Finetune de Qwen3-VL-8B-Instruct con recompensa de atención visual |
| Qwen/Qwen3-VL-8B-Instruct | 8 B (aprox., según modelo base) | no disponible en esta ficha | Apache 2.0 | safetensors | Modelo base; referencia directa de comparación |
| Otros finetunes multimodales de 8B | variable | variable | variable | variable | No se dispone de datos concretos en la información proporcionada |

La comparación cuantitativa con alternativas no es posible porque no se han publicado benchmarks del modelo ni se dispone de métricas del modelo base en esta información.

## Limitaciones y advertencias

- Información pública muy escasa: la model card no detalla dataset, hiperparámetros, número de tokens ni evaluación, lo que dificulta reproducir o validar el entrenamiento.
- Riesgo de alucinación: como todo modelo generativo multimodal, puede describir contenido inexistente en la imagen o inventar detalles; no se han publicado evaluaciones de fidelidad visual.
- Sesgos: no se documentan análisis de sesgos; al heredar de Qwen3-VL, puede reproducir sesgos presentes en los datos del modelo base y del finetune.
- Idiomas: no se especifican los idiomas soportados, por lo que el rendimiento fuera del inglés (o del idioma mayoritario del modelo base) es incierto.
- Contexto: se desconoce la longitud de contexto efectiva; no debe asumirse la del modelo base sin verificación.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3-VL-8B-Instruct y de los datos de entrenamiento del finetune, no documentados.
- Madurez: con 14 descargas y 1 like en el momento de la consulta, es un modelo muy reciente y con poca validación comunitaria; no recomendable para producción sin evaluación propia.
- Compatibilidad de despliegue: no se confirman pesos cuantizados ni soporte en motores de inferencia de alto rendimiento; verificar la versión de transformers y el soporte de `qwen3_vl`.

## Enlaces

- Hugging Face: https://huggingface.co/Craleo/Sayo-Qwen-8B
- Paper: https://arxiv.org/abs/2602.08241
- Página del proyecto: https://cratileo.github.io/Sayo-Pages/
- Código: https://github.com/Cratileo/Sayo
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct

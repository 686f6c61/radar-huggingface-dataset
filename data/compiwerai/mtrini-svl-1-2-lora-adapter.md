# CompiwerAI/Mtrini-SVL-1.2-LoRA-Adapter

## Resumen

Mtrini-SVL-1.2-LoRA-Adapter es un adaptador LoRA de PEFT desarrollado por Compiwer AI. No es un modelo autónomo: debe cargarse junto con el modelo base Qwen/Qwen3-VL-8B-Instruct, un modelo multimodal de entrada imagen-texto y salida texto. El repositorio ocupa 0,2 GB, un tamaño coherente con un adaptador y no con los pesos completos de un modelo de 8B.

El adaptador se presenta como una modificación de identidad o persona, marcada como experimental en la propia model card. Su relevancia actual es limitada: no tiene descargas ni valoraciones, no incluye resultados de evaluación y la documentación disponible es mínima. Puede ser útil para experimentación con adaptadores LoRA sobre modelos visión-lenguaje, pero no hay evidencia publicada de que funcione de forma fiable en producción.

La model card advierte explícitamente de que las respuestas de identidad pueden seguir siendo incorrectas y de que se pueden inventar hechos no verificados de la empresa. También remite a la licencia y a los requisitos de redistribución del modelo base, que no se detallan en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre el modelo multimodal Qwen3-VL-8B-Instruct; no es un modelo autónomo |
| Parámetros totales | No disponible para el adaptador; el modelo base se identifica como 8B en su denominación |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; depende de la configuración del modelo base Qwen3-VL-8B-Instruct |
| Tipos de cuantización | No disponible; el adaptador se distribuye en safetensors y no se especifican variantes cuantizadas |
| Idiomas soportados | No disponibles |
| Licencia | No disponible; la model card remite a la licencia y requisitos de redistribución del modelo base |
| Formato de pesos | Safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

El repositorio contiene exclusivamente un adaptador LoRA de PEFT, no un modelo completo. El adaptador se aplica sobre Qwen/Qwen3-VL-8B-Instruct, un modelo multimodal de entrada imagen-texto y salida texto. El tamaño del repositorio es de 0,2 GB, coherente con un adaptador y no con los pesos completos del modelo base. No se detallan en la información disponible el rango del adaptador, los módulos objetivo, el número de parámetros entrenables ni la composición del dataset de entrenamiento.

No se han publicado datos sobre tokens de entrenamiento, uso de RLHF/DPO, técnicas de decodificación especulativa o innovaciones de atención. La model card indica que se trata de un adaptador de identidad experimental y advierte de que las respuestas de identidad pueden ser incorrectas y de que se pueden inventar hechos no verificados de la empresa. No se debe asumir que estos problemas estén resueltos.

## Capacidades

- Generación de texto conversacional a partir de imágenes y texto, heredada del pipeline image-text-to-text del modelo base Qwen3-VL-8B-Instruct.
- Adaptación de identidad o persona con las etiquetas mtrini y compiwer-ai; el alcance exacto de la adaptación no está documentado.
- Carga mediante PEFT junto con el modelo base; no funciona como modelo independiente.
- Soporte de tool calling o function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: no disponibles.
- Visión: sí, por el modelo base y el pipeline image-text-to-text; no se detallan tareas concretas como OCR, VQA o captioning.
- Audio u otras modalidades: no disponible.

## Casos de uso

- Prototipo de asistente corporativo con identidad de marca: usar el adaptador para probar una persona concreta en un chatbot multimodal interno, siempre sobre Qwen3-VL-8B-Instruct. Es adecuado para demos y validación temprana, no para producción sin evaluación adicional.
- Investigación sobre adaptadores de identidad: comparar la deriva de identidad, la consistencia y la tasa de alucinación frente al modelo base en tareas de imagen-texto. El adaptador permite estudiar cómo un LoRA pequeño modifica el comportamiento de un VLM de 8B.
- Evaluación de riesgos de alucinación corporativa: reproducir conversaciones en las que el adaptador pueda inventar datos de empresa y medir la frecuencia. Sirve para diseñar filtros y revisiones humanas antes de un despliegue real.
- Generación de contenido multimodal con voz de marca: crear descripciones o respuestas a partir de imágenes con un tono concreto. Requiere revisión humana por la advertencia explícita sobre hechos inventados.
- Atención al cliente experimental con soporte visual: prototipo que recibe capturas o fotos y responde con la identidad configurada. Es útil para pruebas de experiencia de usuario, no para atención real sin validación.
- Pruebas de integración PEFT: validar pipelines de carga de adaptadores LoRA con transformers y PEFT sobre el modelo base, incluyendo gestión de versiones y compatibilidad.
- Demostración educativa de LoRA: mostrar cómo un adaptador de pequeño tamaño modifica el comportamiento de un modelo visión-lenguaje de 8B sin reentrenar el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador ocupa 0,2 GB en el repositorio; su VRAM adicional es marginal frente al modelo base.
- VRAM orientativa para el modelo base de 8B: aproximadamente 16-18 GB en fp16, 8-10 GB en int8 y 5-7 GB en int4, incluyendo overhead y caché. Son estimaciones generales, no confirmadas para esta combinación concreta.
- GPU orientativas: A100 o H100 para despliegue de producción; RTX 4090 (24 GB) para fp16 o cuantización; GPU de consumo con 8-12 GB para cuantización int4 o int8, según implementación.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador; vLLM o TGI si soportan el modelo base y la carga de adaptadores; llama.cpp u Ollama requerirían conversión o fusión a GGUF, no incluida en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| Mtrini-SVL-1.2 LoRA Adapter | Adaptador sobre base 8B; parámetros del adaptador no disponibles | No disponible | No disponible | No disponible | HuggingFace, 0 descargas, 0 likes | Adaptador de identidad experimental; no es autónomo |
| Qwen3-VL-8B-Instruct (base) | 8B según denominación | No disponible | No disponible | No disponible | HuggingFace | Modelo base necesario para usar el adaptador; capacidades multimodales |
| Otros adaptadores LoRA de identidad para Qwen3-VL | No disponible | No disponible | No disponible | No disponible | No disponible | No se han encontrado datos comparables en la información proporcionada |

## Limitaciones y advertencias

- Adaptador experimental: la model card indica que las respuestas de identidad pueden ser incorrectas y que se pueden inventar hechos no verificados de la empresa.
- No hay resultados de benchmarks ni evaluaciones publicadas que respalden su rendimiento.
- Licencia no disponible; es obligatorio revisar la licencia y los requisitos de redistribución del modelo base Qwen3-VL-8B-Instruct antes de cualquier uso comercial.
- Idiomas soportados no disponibles; no se puede asumir un rendimiento correcto en castellano ni en otros idiomas.
- No es un modelo autónomo: requiere el modelo base exacto y una integración PEFT adecuada.
- Hereda los sesgos, errores de percepción visual y alucinaciones del modelo base.
- Adopción muy baja: 0 descargas y 0 likes, sin validación de la comunidad.
- No se documentan los datos de entrenamiento, por lo que se desconocen posibles sesgos, sobreajuste o problemas de generalización.
- El uso comercial está condicionado por la licencia del modelo base y por la ausencia de una licencia explícita para el adaptador.

## Enlaces

- https://huggingface.co/CompiwerAI/Mtrini-SVL-1.2-LoRA-Adapter
- https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.

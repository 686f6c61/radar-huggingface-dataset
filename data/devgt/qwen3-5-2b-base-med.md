# devgt/Qwen3.5-2B-Base-MED

## Resumen

Qwen3.5-2B-Base-MED es un modelo publicado en Hugging Face por el usuario devgt bajo el identificador `devgt/Qwen3.5-2B-Base-MED`. Por su nombre y sus etiquetas, se trata de un ajuste fino supervisado (SFT, mediante la librería TRL) sobre una base de la familia Qwen3.5 de 2B parámetros, aparentemente orientada a dominios de imagen y texto (la pipeline declarada es `image-text-to-text`) y con un sufijo "MED" que sugiere especialización en ámbito médico. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 25 de noviembre de 2026.

El dato más fiable disponible es el recuento real de parámetros a partir de los pesos en safetensors: 2.213.241.664 parámetros (aproximadamente 2,21 mil millones). El tamaño del repositorio es de 4,4 GB, coherente con un modelo de ese orden en precisión de 16 bits. La arquitectura declarada en las etiquetas es `qwen3_5` y la librería de carga es `transformers`. No se dispone de información sobre longitud de contexto, composición del dataset de entrenamiento, hiperparámetros ni evaluación.

La model card es la plantilla automática de Hugging Face sin cumplimentar: todos los campos relevantes (desarrollador, licencia, idiomas, datos de entrenamiento, resultados) aparecen como "[More Information Needed]". Esto limita enormemente cualquier evaluación rigurosa: la ficha que sigue distingue explícitamente entre los datos verificables (recuento de parámetros, pipeline, etiquetas) y los que no están disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer, según etiqueta del repo); detalles no disponibles |
| Parámetros totales | 2.213.241.664 (2,21 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | image-text-to-text |
| Librería | transformers |
| Tamaño del repositorio | 4,4 GB |

## Arquitectura y entrenamiento

La etiqueta `qwen3_5` indica que el modelo parte de la arquitectura de la familia Qwen3.5, un transformer decoder-only, y la etiqueta `image-text-to-text` sugiere que la base incorpora capacidad multimodal de entrada (imagen y texto). No obstante, no se especifica en el repositorio si el ajuste conserva el proyector visual, qué variante exacta de Qwen3.5 sirve de base ni el número de capas, dimensiones ocultas o cabezas de atención.

El entrenamiento declarado es un ajuste fino supervisado (SFT) mediante TRL, según las etiquetas `trl` y `sft`. No hay información sobre el volumen de tokens, la composición del dataset, si hubo fases de preferencia (DPO/RLHF), la precisión usada en el entrenamiento ni la infraestructura. El sufijo "MED" y el pipeline multimodal apuntan a un corpus de imágenes y texto de ámbito médico, pero esto es una inferencia a partir del nombre y no un dato confirmado por el autor.

## Capacidades

- Generación de texto conversacional: el repo incluye la etiqueta `conversational`, lo que indica un formato de chat esperado.
- Procesamiento de entrada imagen-texto: pipeline `image-text-to-text`, es decir, admite imágenes junto con texto como entrada.
- Ajuste orientado a dominio médico (inferido del sufijo "MED"; no confirmado en la model card).
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede desplegarse en Inference Endpoints de Hugging Face.
- Tool calling / function calling: no disponible.
- Razonamiento multi-paso y agentes: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistencia a la lectura de informes clínicos: dado el pipeline image-text-to-text, podría emplearse para extraer texto y estructura de documentos escaneados (analíticas, informes) y resumirlos; requiere validación humana por el riesgo de alucinación en dominio sanitario.
- Clasificación y triaje de imágenes médicas en prototipos de investigación: el modelo puede generar descripciones textuales de imágenes de entrada para tareas de etiquetado asistido, siempre como herramienta de apoyo y no como dispositivo médico.
- Preguntas y respuestas sobre literatura médica: con un ajuste SFT sobre corpus del dominio, puede usarse para responder consultas sobre guías clínicas en entornos de formación, con revisión por expertos.
- Extracción de entidades en notas clínicas: integrado en un pipeline de NLP sanitario para identificar fármacos, dosis y diagnósticos en texto libre, con umbrales de confianza y revisión posterior.
- Chatbot de orientación sanitaria no diagnóstica: desplegado vía Inference Endpoints para responder preguntas generales de salud pública, con avisos legales y derivación a profesionales.
- Generación de descripciones para datasets médicos multimodales: uso para preanotar pares imagen-texto que luego se revisan manualmente antes de incorporarse a un corpus de entrenamiento.
- Prototipado rápido en investigación: al ser un modelo de 2,21 B, puede ejecutarse en una sola GPU consumer para experimentos de ajuste y evaluación sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 4,4 GB solo para pesos, más overhead de activaciones y caché KV; presupuesto práctico de 6-8 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 2,2-3 GB para pesos.
- VRAM estimada en cuantización de 4 bits: aproximadamente 1,2-1,8 GB para pesos.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090, A10, L4, A100 y H100 para despliegue por lotes.
- Cabe en GPU consumer: sí, en cualquier GPU con 8 GB o más en fp16, y en GPUs de 4-6 GB con cuantización.
- Opciones de despliegue: `transformers` (librería declarada), vLLM y TGI si la arquitectura qwen3_5 está soportada por esas herramientas (no confirmado), llama.cpp/Ollama solo si se generan pesos GGUF (no publicados).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| devgt/Qwen3.5-2B-Base-MED | 2,21 B | no disponible | no disponible | sí (image-text-to-text) | Hugging Face, 0 descargas |
| Qwen2.5-VL-3B-Instruct (referencia de familia) | ~3 B | 32k (según documentación pública de Qwen) | Apache 2.0 | sí | ampliamente disponible |
| SmolVLM-2B (referencia de tamaño) | ~2 B | 8k (según documentación pública) | Apache 2.0 | sí | ampliamente disponible |

La comparación es solo orientativa: no hay datos de rendimiento del modelo evaluado, y la variante exacta de Qwen3.5 usada como base no está confirmada.

## Limitaciones y advertencias

- Model card vacía: no hay información sobre datos de entrenamiento, sesgos, evaluación ni uso previsto; no debe desplegarse en producción sin una evaluación propia.
- Licencia no declarada: no se puede asumir uso comercial permitido; hay que contactar con el autor antes de cualquier explotación.
- Riesgo elevado de alucinación en dominio médico: cualquier salida debe tratarse como no validada y no constituye consejo médico.
- Idiomas soportados desconocidos: no se puede garantizar calidad en castellano ni en otros idiomas.
- Longitud de contexto desconocida: limita el diseño de aplicaciones con documentos largos.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de validación por terceros.
- El nombre sugiere una base Qwen3.5, pero la correspondencia exacta con un checkpoint oficial no está verificada; posibles incompatibilidades con versiones de `transformers`.
- No se han publicado cuantizaciones (GGUF, AWQ, GPTQ), lo que dificulta el despliegue en hardware limitado con herramientas estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/devgt/Qwen3.5-2B-Base-MED
- Referencia citada en la model card (calculadora de impacto ambiental): https://mlco2.github.io/impact#compute
- Paper citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Repositorio de TRL: https://github.com/huggingface/trl
- Documentación de transformers: https://huggingface.co/docs/transformers

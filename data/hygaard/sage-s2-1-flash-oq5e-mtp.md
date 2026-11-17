# Hygaard/Sage-S2.1-Flash-oQ5e-mtp

## Resumen

Sage-S2.1-Flash-oQ5e-mtp es una conversión cuantizada en formato MLX del modelo multimodal y agéntico Sage S2.1 Flash, desarrollado por el Shanghai Artificial Intelligence Laboratory (InternLM). La conversión la firma el usuario Hygaard y aplica la política de precisión mixta `oQ5e` del ecosistema oMLX/oQe, orientada a ejecución nativa en Apple Silicon. El modelo base emplea la arquitectura GLM-5.3-Flash de Z.ai, con mezcla de expertos (MoE) y atención lineal, y está diseñado para tareas científicas multimodales y flujos agénticos.

El repositorio se publica como borrador privado: la conversión, la validación nativa y la subida aún están pendientes según la model card, y el autor indica que permanecerá privado hasta que la cuantización completa esté subida y verificada. La conversión parte del checkpoint BF16 original del creador (con tensores FP32 conservados donde aplica), no de la release FP8 ni de otra cuantización, y preserva el conjunto completo de expertos, el codificador de visión, el módulo MTP, el tokenizador, el procesador y la plantilla de chat originales.

La relevancia de esta ficha es doble: documenta una variante de cuantización de un modelo científico multimodal poco habitual y, al mismo tiempo, deja constancia explícita de que la mayoría de métricas de tamaño, precisión efectiva y rendimiento todavía no están publicadas. Cualquier evaluación de producción debe esperar a la auditoría de cabeceras y a los ficheros `CONVERSION.json` y `WEIGHT_PRECISION.json` que el autor anuncia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM-5.3-Flash (transformer MoE con atención lineal, MTP e hiperconexiones) |
| Parametros totales | no disponible (pendiente de auditoría de cabeceras) |
| Parametros activos | no disponible (modelo MoE; número de expertos enrutados no publicado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ5e (política mixta de precisión oQe sobre MLX safetensors); variantes oQ4e y oQ3e publicadas por separado |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | MLX safetensors (cuantización mixta oQe) |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura GLM-5.3-Flash, que combina mezcla de expertos enrutados con proyecciones de atención, expertos compartidos, MLP densas, un codificador de visión y un bloque MTP (multi-token prediction). La model card menciona además componentes específicos: convoluciones de atención lineal, pooling/compresión de indexer, proyecciones de fusión del MTP, routers MoE con sesgos de corrección, hiperconexiones y controles de decaimiento recurrente. El modelo base se distribuye en BF16 con algunos tensores FP32 conservados.

Esta variante no entrena ni modifica el modelo: es una conversión de cuantización. La calibración se realiza con una recolección de importancias específica de Sage y sensibilidad por nivel de precisión, y cada nivel se convierte de forma independiente desde el checkpoint original. No se prevé poda de expertos ni abliteración. El autor conserva el tokenizador, procesador y plantilla de chat originales, y advierte de que sustituir el tokenizador por el estándar de GLM altera el comportamiento. Los detalles de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento en un modelo multimodal de tipo image-text-to-text.
- Procesamiento de imagen y texto conjuntamente mediante el codificador de visión preservado.
- Capacidades científicas: la model card menciona proyectores científicos y la necesidad de encoders SciPerception, preprocesado e integración de prompt embeddings para habilitar esas rutas.
- Comportamiento agéntico y razonamiento multi-paso, según la descripción del modelo base.
- Predicción multi-token (MTP) integrada en la arquitectura.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Capacidades multilingües: no disponible.
- Modo thinking explícito: no disponible.

## Casos de uso

- Asistencia científica multimodal: el modelo puede recibir figuras, tablas o diagramas junto a texto técnico y generar explicaciones o resúmenes, siempre que se despliegue con los encoders SciPerception y el preprocesado correspondiente.
- Análisis de documentación técnica con imágenes: extracción y razonamiento sobre gráficos y esquemas en informes de laboratorio, aprovechando el pipeline image-text-to-text.
- Prototipado agéntico en local sobre Apple Silicon: la variante MLX permite experimentar con flujos multi-paso en un Mac de 256 GB sin depender de infraestructura CUDA.
- Evaluación comparativa de cuantizaciones: al existir variantes oQ5e, oQ4e y oQ3e del mismo modelo, sirve para medir el impacto de la precisión mixta en calidad y memoria en hardware Apple.
- Investigación en eficiencia de inferencia: el uso de MTP y atención lineal permite estudiar decodificación especulativa y latencia en entornos MLX.
- Desarrollo de asistentes técnicos especializados: integración en herramientas internas de análisis de literatura científica con imágenes, sujeto a validación previa de la cuantización.
- Despliegue de demostraciones privadas: al ser un borrador privado, encaja en entornos controlados de evaluación antes de una release pública.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: no disponible; el autor indica que los requisitos prácticos de memoria se reportarán tras probar en un Mac Apple Silicon de 256 GB.
- GPU recomendadas: no aplica de forma nativa; el formato es MLX para Apple Silicon. No hay datos de despliegue en A100, H100 o RTX 4090.
- Compatibilidad con GPU de consumo: no confirmada; requiere un runtime MLX que soporte `glm5_next` y precisión mixta oQe.
- Opciones de despliegue: runtime MLX con soporte de `glm5_next` y oQe; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| Sage-S2.1-Flash-oQ5e-mtp (esta ficha) | no disponible | no disponible | MLX safetensors oQ5e | MIT | Borrador privado, conversión pendiente |
| internlm/Sage-S2.1-Flash (base) | no disponible | no disponible | BF16 (con tensores FP32) | MIT | Release del creador |
| Hygaard/Sage-S2.1-Flash-oQ4e-mtp | no disponible | no disponible | MLX safetensors oQ4e | MIT | Variante de menor precisión |
| Hygaard/Sage-S2.1-Flash-oQ3e-mtp | no disponible | no disponible | MLX safetensors oQ3e | MIT | Variante de menor precisión |

No se dispone de datos de rendimiento comparado con modelos de la misma categoría.

## Limitaciones y advertencias

- El repositorio es un borrador privado: la conversión, la validación nativa y la subida están pendientes según la model card.
- No hay cifras publicadas de tamaño de pesos, BPW efectivo ni mapa de precisión por bloque; la tabla de precisión mixta está vacía a la espera de la auditoría de cabeceras.
- El tokenizador es personalizado: las grafías de tokens de control dentro del contenido de los mensajes se tratan como texto normal, y sustituirlo por el tokenizador estándar de GLM cambia el comportamiento.
- Las rutas científicas requieren encoders SciPerception, preprocesado e integración de prompt embeddings; conservar solo los proyectores no habilita esas capacidades en un servidor MLX.
- No se han publicado sesgos conocidos, tasas de alucinación ni limitaciones idiomáticas.
- La licencia MIT se hereda del modelo base según la model card fijada; conviene verificar los avisos de atribución upstream antes de uso comercial.
- Al ser una cuantización de 5 bits efectivos aproximados, es esperable cierta degradación de calidad frente al BF16, aunque no se han publicado mediciones.
- No hay datos de latencia, throughput ni consumo de memoria, lo que impide planificar capacidad de producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Hygaard/Sage-S2.1-Flash-oQ5e-mtp
- Modelo base: https://huggingface.co/internlm/Sage-S2.1-Flash
- Revisión fijada del modelo base: https://huggingface.co/internlm/Sage-S2.1-Flash/blob/76f4513db7464485605a002a06a6190de0460574/README.md
- Variante oQ4e: https://huggingface.co/Hygaard/Sage-S2.1-Flash-oQ4e-mtp
- Variante oQ3e: https://huggingface.co/Hygaard/Sage-S2.1-Flash-oQ3e-mtp

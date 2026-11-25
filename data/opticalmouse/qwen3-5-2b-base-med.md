# opticalmouse/Qwen3.5-2B-Base-MED

## Resumen

Qwen3.5-2B-Base-MED es un modelo multimodal de tipo image-text-to-text publicado en Hugging Face por el usuario opticalmouse bajo el identificador `opticalmouse/Qwen3.5-2B-Base-MED`. Se trata de un ajuste fino mediante SFT (supervised fine-tuning) con la librería TRL sobre una base de la familia Qwen3.5 de 2B parámetros, según indican las etiquetas del repositorio (`qwen3_5`, `trl`, `sft`). El modelo cuenta con 2.213.241.664 parámetros totales verificados en los pesos safetensors y un tamaño de repositorio de 4,4 GB.

El modelo resuelve tareas de conversación multimodal, es decir, procesa entradas combinadas de imagen y texto y genera respuestas textuales. Su relevancia radica en que ocupa el nicho de modelos multimodales pequeños (2B) que pueden desplegarse en hardware de consumo, aunque la información pública sobre el mismo es extremadamente limitada: la model card es la plantilla automática de Hugging Face sin rellenar, no se declara licencia, idiomas ni procedencia exacta del checkpoint base.

Es importante señalar que el nombre incluye el sufijo "MED", lo que sugiere un ajuste orientado a dominio médico, pero no hay documentación que lo confirme. Cualquier uso en producción debería ir precedido de una evaluación propia, dado que el autor no ha publicado detalles de entrenamiento, datos, hiperparámetros ni evaluaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.5; detalles no disponibles |
| Parametros totales | 2.213.241.664 (2,21 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer multimodal de la familia Qwen3.5, según la etiqueta `qwen3_5` del repositorio y el pipeline `image-text-to-text`. El modelo combina un codificador visual con un decodificador de lenguaje, aunque no se especifican dimensiones de capas, número de cabezas, tipo de atención ni mecanismo de fusión multimodal. El tamaño de 2,21 B parámetros es coherente con un modelo pequeño de la gama Qwen3.5.

El entrenamiento consistió en un ajuste supervisado (SFT) realizado con TRL, según las etiquetas `trl` y `sft`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, si hubo etapas de RLHF o DPO, ni los hiperparámetros utilizados. La model card no documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.). El checkpoint base exacto del que parte el ajuste tampoco se indica.

## Capacidades

- Generación de texto conversacional en formato multi-turno, según la etiqueta `conversational`.
- Procesamiento de entradas image-text-to-text: acepta imágenes junto con texto y produce respuestas textuales.
- Ajuste fino supervisado orientado presumiblemente a un dominio concreto (sufijo "MED"), aunque no documentado.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que facilita el despliegue mediante la infraestructura de inferencia de Hugging Face.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Modo thinking, visión avanzada o audio: no disponible salvo la entrada de imagen implícita en el pipeline.

## Casos de uso

- Asistencia conversacional multimodal en prototipos: el modelo puede recibir una imagen y una pregunta en texto y devolver una descripción o respuesta, adecuado para demos de bajo coste dado su tamaño de 2,21 B parámetros.
- Clasificación y descripción de imágenes en pipelines de preprocesado: con 4,4 GB de pesos en precisión original, puede ejecutarse en una GPU de consumo para etiquetar lotes pequeños de imágenes.
- Experimentación académica con SFT multimodal: al estar entrenado con TRL, sirve como punto de partida reproducible para comparar ajustes finos sobre bases Qwen3.5 pequeñas.
- Evaluación de dominio médico en entornos controlados: el sufijo "MED" sugiere un ajuste orientado a este campo, por lo que podría emplearse en investigación sobre descripción de imágenes clínicas, siempre con supervisión humana y sin uso diagnóstico.
- Despliegue en edge o entornos con VRAM limitada: su tamaño permite cuantizarlo (aunque no se publican GGUF oficiales) y ejecutarlo en GPUs de 8-16 GB para tareas de visión-lenguaje simples.
- Generación de descripciones accesibles: integración en herramientas que generen texto alternativo para imágenes, con revisión posterior dado el riesgo de alucinación.
- Base para fine-tuning específico: al ser un checkpoint pequeño y multimodal, es adecuado como punto de partida para ajustes con TRL en dominios verticales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 4,4 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 6 y 8 GB para secuencias cortas.
- VRAM estimada en cuantización de 8 bits: alrededor de 2,5-3 GB de pesos; en 4 bits, alrededor de 1,5-2 GB, aunque no se publican cuantizaciones oficiales.
- GPU recomendadas: NVIDIA RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A10, L4 o superiores para inferencia cómoda; A100/H100 no son necesarias por el tamaño del modelo.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más de VRAM en FP16, y en 6 GB con cuantización.
- Opciones de despliegue: transformers (soporte nativo), endpoints compatibles de Hugging Face; vLLM, llama.cpp, Ollama o TGI no están confirmados para esta arquitectura concreta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B-Base-MED (este) | 2,21 B | no disponible | Sí (image-text-to-text) | no disponible | Hugging Face, 0 descargas |
| Qwen2-VL-2B | ~2,2 B | 32k (según documentación pública de Qwen2-VL) | Sí | Apache 2.0 (Qwen2-VL) | Hugging Face, ampliamente usado |
| SmolVLM-2B | ~2,2 B | 8k-16k según variante | Sí | Apache 2.0 | Hugging Face |
| PaliGemma-3B | ~3 B | 8k | Sí | Gemma license | Hugging Face |

La comparativa se limita a parámetros y disponibilidad; no hay datos de rendimiento para este modelo que permitan una comparación cuantitativa justa.

## Limitaciones y advertencias

- La model card está generada automáticamente y sin contenido: no hay información sobre datos de entrenamiento, sesgos, evaluación ni uso previsto.
- Riesgo elevado de alucinación y de comportamiento impredecible al no documentarse el proceso de alineación (RLHF/DPO) ni evaluaciones cualitativas.
- Licencia no declarada: no se puede garantizar el uso comercial; es imprescindible contactar con el autor o verificar la licencia del checkpoint base antes de cualquier despliegue en producción.
- Idiomas no declarados: no se puede asumir un rendimiento correcto en castellano ni en otros idiomas sin pruebas propias.
- Longitud de contexto desconocida: limita el diseño de aplicaciones con documentos largos o conversaciones extensas.
- El sufijo "MED" sugiere dominio médico, pero no hay validación clínica; no debe usarse para diagnóstico ni decisiones sanitarias.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validación externa.
- No se publican cuantizaciones GGUF ni versiones optimizadas, lo que complica el despliegue en entornos de bajos recursos.
- Fecha de creación posterior a la fecha de corte de muchos datos de referencia: verificar la procedencia real del checkpoint base Qwen3.5 antes de confiar en la nomenclatura.

## Enlaces

- Hugging Face: https://huggingface.co/opticalmouse/Qwen3.5-2B-Base-MED
- TRL (librería de entrenamiento): https://github.com/huggingface/trl
- Transformers: https://github.com/huggingface/transformers
- Calculadora de impacto ambiental citada en la model card: https://mlco2.github.io/impact
- Paper de Lacoste et al. (2019) citado en la model card: https://arxiv.org/abs/1910.09700

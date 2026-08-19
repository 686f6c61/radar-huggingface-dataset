# justice101/affine-5dz2gkonkn-loveaffine

## Resumen

El modelo `justice101/affine-5dz2gkonkn-loveaffine` es un checkpoint de fusión LoRA (LoRA-merged) derivado del modelo base `kevin954/Affine-5dfqbbh8ev-sft`, desarrollado por el usuario justice101. Según los metadatos de HuggingFace, se trata de un modelo de tipo `qwen3_5_moe`, lo que indica una arquitectura de mezcla de expertos (MoE) basada en la familia Qwen, y además incluye la etiqueta `image-text-to-text`, sugiriendo capacidades multimodales (procesamiento de imagen y texto). El modelo está pensado para generación de texto y uso conversacional.

El checkpoint se describe en la model card como un "salvamento de checkpoint fusionado H1" con un propósito de "seguro TTL privado" y no como una versión final para evaluación hasta que se supere una fase de validación (Stage-5 gate). Con aproximadamente 35.1 mil millones de parámetros totales y un tamaño de repositorio de 70.2 GB en formato safetensors, es un modelo de gran tamaño que requiere recursos de hardware considerables para su despliegue. La relevancia de este modelo radica en su naturaleza experimental y su posible uso como base para desarrollos posteriores, aunque carece de documentación técnica detallada y de una licencia definida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en Qwen3.5 (según etiqueta `qwen3_5_moe`) |
| Parametros totales | 35.107.181.936 (aproximadamente 35.1B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repositorio contiene safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (70.2 GB en el repositorio) |

## Arquitectura y entrenamiento

La arquitectura del modelo se infiere principalmente de las etiquetas de HuggingFace: `qwen3_5_moe` indica una arquitectura de mezcla de expertos (MoE) dentro de la familia Qwen, y `image-text-to-text` sugiere que el modelo acepta entradas multimodales (imágenes y texto) y genera texto. No se dispone de información oficial sobre el número de expertos, la configuración de atención, ni detalles del proceso de entrenamiento. Según la model card, el checkpoint es el resultado de una fusión LoRA (Low-Rank Adaptation) aplicada sobre el modelo base `kevin954/Affine-5dfqbbh8ev-sft`. No se han publicado datos sobre el dataset de entrenamiento, el número de tokens procesados, ni si se utilizaron técnicas como RLHF o DPO. La etiqueta `affine-h1-merged-salvage` sugiere que se trata de un experimento intermedio o de recuperación de pesos, no de una versión final validada.

## Capacidades

- Generación de texto y conversación: el modelo está etiquetado como `text-generation` y `conversational`, por lo que puede producir texto coherente y mantener diálogos multi-turno.
- Procesamiento multimodal: la etiqueta `image-text-to-text` indica que puede recibir imágenes junto con texto y generar respuestas textuales, aunque no se especifican los detalles técnicos de esta capacidad.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que el modelo puede desplegarse en servicios de inferencia gestionados, aunque no se detallan las plataformas concretas.
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso, ni capacidades específicas de código o matemáticas.

## Casos de uso

Dada la falta de documentación detallada, los casos de uso son hipotéticos y deben considerarse con cautela:

- Prototipado de asistentes conversacionales: el modelo puede servir como base para experimentos de chatbots, aprovechando su arquitectura MoE para reducir costes de inferencia en comparación con modelos densos de tamaño similar.
- Investigación en fusión LoRA: al ser un checkpoint de fusión, puede utilizarse para estudiar el impacto de la adaptación de bajo rango sobre un modelo base, especialmente en entornos de investigación académica.
- Evaluación de modelos MoE multimodales: permite probar el rendimiento de una arquitectura MoE con entrada de imágenes y texto, aunque sin datos de benchmarks publicados.
- Desarrollo de aplicaciones internas de prueba: en entornos con control de calidad, podría usarse para generar contenido textual a partir de imágenes, siempre que se acepte el riesgo de comportamiento no validado.
- Análisis de la familia Qwen3.5: sirve como referencia para comparar arquitecturas MoE dentro de esta familia, aunque su estado experimental limita su uso en producción.
- Educación y formación: puede emplearse en cursos sobre modelos de lenguaje multimodales y técnicas de fusión de pesos, gracias a su disponibilidad pública en HuggingFace.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar. El repositorio no incluye evaluaciones ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 35.1B parámetros en formato safetensors (probablemente fp16 o bf16), se necesitan aproximadamente 70 GB de VRAM para cargar el modelo en precisión completa. Con cuantización de 4 bits (si estuviera disponible), la VRAM podría reducirse a unos 20-24 GB, permitiendo su uso en GPUs de consumo como la RTX 4090 (24 GB). Sin embargo, no se han publicado cuantizaciones oficiales.
- GPU recomendadas: para inferencia sin cuantizar, se requieren GPUs profesionales como NVIDIA A100 80GB o H100 80GB. Para cuantización 4-bit, una RTX 4090 o RTX 6000 Ada podría ser suficiente, aunque no hay garantías.
- Compatibilidad con consumer GPU: solo si se aplica cuantización externa (por ejemplo, mediante herramientas como llama.cpp o GPTQ), pero no se proporcionan archivos GGUF ni configuraciones de cuantización.
- Opciones de despliegue: al ser un modelo de transformers, puede desplegarse con vLLM, Text Generation Inference (TGI) o directamente con la librería transformers. No se menciona soporte para Ollama o llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo pertenece a una familia experimental (Qwen3.5 MoE) de la que no se tienen datos públicos de rendimiento. Se podría comparar con otros MoE de tamaño similar como Mixtral 8x7B (46.7B parámetros) o Qwen2.5-MoE, pero no hay datos de benchmarks para este checkpoint. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Estado experimental: la model card indica que es un "salvamento" con "seguro TTL privado" y no una versión final para evaluación. No ha pasado una validación de etapa 5, por lo que su comportamiento puede ser impredecible.
- Licencia no definida: no se especifica ninguna licencia, lo que impide su uso comercial legal y genera incertidumbre sobre los términos de redistribución.
- Sesgos y alucinaciones: no hay información sobre sesgos conocidos, pero al ser un modelo no validado, el riesgo de alucinaciones y respuestas incorrectas es elevado.
- Falta de documentación técnica: no se detallan la longitud de contexto, los idiomas soportados, ni las capacidades exactas de procesamiento de imágenes. Esto dificulta su integración en entornos de producción.
- Riesgo de seguridad: al ser un checkpoint de origen no verificado, podría contener pesos maliciosos o comportamientos no deseados. Se recomienda auditar el modelo antes de cualquier uso.
- Limitaciones de contexto e idioma: desconocidas; probablemente heredadas del modelo base, pero sin confirmación.

## Enlaces

- Repositorio del modelo: https://huggingface.co/justice101/affine-5dz2gkonkn-loveaffine
- Modelo base: https://huggingface.co/kevin954/Affine-5dfqbbh8ev-sft (enlace inferido del campo `base_model`; no se ha verificado su existencia)

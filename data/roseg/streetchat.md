# RoseG/StreetChat

## Resumen

StreetChat es un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3.5-4B-Base, publicado por el usuario RoseG en Hugging Face. Se distribuye como un modelo de generación de texto y clasificación image-text-to-text, con pesos en formato safetensors y compatibilidad con la librería transformers. El repositorio tiene un tamaño de 17,5 GB y contiene 4.539.265.536 parámetros totales según los datos reales de los tensores.

El modelo está entrenado sobre el dataset RoseG/StreetChat-SFT-Studio-Pro, un conjunto de datos de ajuste supervisado (SFT) propio del autor. La model card pública es extremadamente escueta: únicamente declara la licencia Apache 2.0, el idioma inglés, el modelo base y las etiquetas de pipeline, sin aportar detalles sobre la composición del dataset, el proceso de entrenamiento ni resultados de evaluación.

Su relevancia actual es limitada pero potencialmente interesante para quienes exploran ajustes de la familia Qwen3.5 en tamaño 4B con capacidades multimodales (image-text-to-text). No obstante, la ausencia de documentación técnica, benchmarks y tracción comunitaria (0 descargas, 0 likes en el momento de la consulta) obliga a tratar el modelo con cautela en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3.5-4B-Base; detalles específicos no disponibles) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna más allá de que deriva de Qwen/Qwen3.5-4B-Base, un transformer de aproximadamente 4.500 millones de parámetros. Las etiquetas del repositorio incluyen `qwen3_5` e `image-text-to-text`, lo que sugiere que el modelo base incorpora capacidades multimodales de entrada imagen-texto, aunque la model card no lo confirma explícitamente ni detalla la torre visual.

El entrenamiento consiste en un ajuste supervisado (SFT) sobre el dataset RoseG/StreetChat-SFT-Studio-Pro. No se especifican el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF/DPO, ni innovaciones técnicas como decodificación especulativa o atención lineal. Toda esta información figura como no disponible.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `conversational` y el pipeline `text-generation`.
- Procesamiento de entrada imagen-texto (etiqueta `image-text-to-text`), presumiblemente heredado del modelo base, aunque no se documenta el alcance real de esta capacidad.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su despliegue en infraestructuras tipo Inference Endpoints.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, visión avanzada o audio: no disponible.

## Casos de uso

- Prototipado de asistentes conversacionales en inglés: el modelo puede emplearse para generar respuestas multi-turno en aplicaciones de chat, aprovechando su naturaleza conversacional y su tamaño contenido de 4B parámetros.
- Experimentación académica con ajustes SFT sobre Qwen3.5: útil para investigadores que quieran reproducir o comparar el efecto del dataset StreetChat-SFT-Studio-Pro frente al modelo base.
- Evaluación de capacidades imagen-texto: si el modelo base conserva la torre visual, podría usarse para tareas de descripción de imágenes o diálogo sobre imágenes, aunque requiere validación empírica previa.
- Despliegue en entornos con recursos moderados: con 4,5B parámetros, es viable en GPUs de consumo tras cuantización (aunque no se publican versiones GGUF oficiales).
- Base para nuevos ajustes específicos de dominio: al estar bajo licencia Apache 2.0, puede servir como punto de partida para fine-tunings adicionales en inglés.
- Integración en pipelines de generación de texto vía transformers: adecuado para pruebas internas y flujos de CI que requieran un modelo pequeño de generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9-10 GB para los pesos (4,54B parámetros × 2 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en cuantización de 8 bits: en torno a 5-6 GB; en 4 bits, aproximadamente 3-4 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: A100, H100 o L40S para despliegue en producción con contexto largo; RTX 4090 o RTX 3090 para inferencia en FP16.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más en FP16, y en GPUs de 8 GB con cuantización de 8 bits.
- Opciones de despliegue: transformers (soporte oficial declarado), vLLM y TGI (compatibilidad probable al ser arquitectura Qwen, no confirmada), llama.cpp/Ollama solo si se generan cuantizaciones GGUF (no publicadas).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| StreetChat (RoseG) | 4,54B | no disponible | Apache 2.0 | en | Hugging Face, 0 descargas |
| Qwen3.5-4B-Base (modelo base) | ~4B | no disponible | no disponible en esta ficha | no disponible | Hugging Face |
| Qwen2.5-3B-Instruct | 3,09B | 32.768 tokens | Apache 2.0 | multilingüe | Hugging Face, ampliamente usado |
| Llama-3.2-3B-Instruct | 3,21B | 128.000 tokens | Llama 3.2 Community License | multilingüe | Hugging Face, ampliamente usado |

La comparativa con Qwen2.5-3B-Instruct y Llama-3.2-3B-Instruct se ofrece como referencia de categoría (modelos pequeños de 3-4B), no como equivalencia exacta, ya que StreetChat deriva de Qwen3.5 y no se dispone de datos de rendimiento para comparar directamente.

## Limitaciones y advertencias

- Documentación mínima: la model card no aporta información sobre dataset, metodología ni evaluación, lo que impide validar la calidad del ajuste.
- Riesgo de alucinación: sin benchmarks ni evaluaciones publicadas, no es posible estimar la tasa de alucinación ni la fidelidad factual.
- Sesgos desconocidos: al no documentarse la composición del dataset de SFT, no se pueden identificar sesgos específicos.
- Idiomas: el modelo declara únicamente inglés, por lo que su uso en castellano u otros idiomas no está garantizado.
- Contexto: se desconoce la longitud de contexto efectiva, lo que limita su uso en tareas de contexto largo.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar la licencia del modelo base Qwen3.5-4B-Base antes de producción.
- Madurez: 0 descargas y 0 likes indican ausencia de validación por parte de la comunidad; no se recomienda su uso en producción sin una evaluación interna exhaustiva.
- Capacidad multimodal incierta: la etiqueta image-text-to-text sugiere visión, pero no se documenta ni se aportan ejemplos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RoseG/StreetChat
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Dataset de SFT: https://huggingface.co/datasets/RoseG/StreetChat-SFT-Studio-Pro

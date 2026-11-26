# mradermacher/AxonAI-v1-27B-GGUF

## Resumen

AxonAI-v1-27B-GGUF es un repositorio de cuantizaciones estáticas del modelo AxonAI-v1-27B, publicado por el usuario mradermacher en Hugging Face. No se trata de un modelo entrenado por el autor del repositorio, sino de una conversión a formato GGUF del modelo original alojado en AxonDAO/AxonAI-v1-27B, orientada a su ejecución en llama.cpp y en herramientas compatibles con dicho formato.

La información disponible sobre el modelo base es muy limitada: la model card del repositorio únicamente documenta los parámetros del proceso de conversión (versión de cuantización, tipo de conversión hf, lista de cuantizaciones generadas) y enlaza al modelo original. No se especifican arquitectura, número de parámetros activos, longitud de contexto, idiomas ni licencia, más allá de la indicación del nombre (27B) sobre el tamaño del modelo.

El interés de este repositorio es práctico: ofrece un conjunto amplio de cuantizaciones (desde Q2_K hasta Q8_0, incluyendo variantes IQ4_XS y f16) que permiten desplegar un modelo de aproximadamente 27 mil millones de parámetros en hardware con distintos niveles de VRAM. Sin embargo, la ausencia de datos técnicos verificables sobre el modelo base limita seriamente cualquier evaluación rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 27B (según nombre del modelo; no confirmado en la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (modelo original presumiblemente en safetensors, no confirmado) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base AxonAI-v1-27B en la documentación proporcionada. El nombre sugiere un transformer de aproximadamente 27 mil millones de parámetros, pero no se confirma si se trata de un modelo denso o de mezcla de expertos (MoE), ni su esquema de atención, longitud de contexto nativa o vocabulario.

Tampoco hay datos sobre el corpus de entrenamiento, número de tokens procesados, composición del dataset ni si se aplicaron técnicas de alineación como RLHF, DPO o similares. La model card del repositorio GGUF se limita a documentar los metadatos de la conversión (quantize_version 2, output_tensor_quantised 1, convert_type hf) y la lista de cuantizaciones generadas, sin aportar información sobre el proceso de entrenamiento del modelo original.

## Capacidades

- No se han documentado capacidades específicas del modelo en la información disponible.
- No hay confirmación de soporte de tool calling o function calling.
- No hay confirmación de capacidades de razonamiento multi-paso o uso como agente.
- No hay confirmación de capacidades multilingües ni de idiomas soportados.
- No hay confirmación de capacidades multimodales (visión, audio) ni de modo de razonamiento extendido (thinking mode).
- La única capacidad verificable es la de ejecución en formato GGUF mediante llama.cpp y herramientas compatibles.

## Casos de uso

- Evaluación local en hardware de consumo: las cuantizaciones Q4_K_M e IQ4_XS permiten probar un modelo de ~27B en GPUs con 16-24 GB de VRAM, útil para experimentación sin infraestructura dedicada.
- Despliegue en llama.cpp u Ollama: el formato GGUF es directamente compatible con estos motores, lo que facilita prototipos de inferencia en CPU o GPU híbrida.
- Pruebas comparativas de cuantización: el repositorio incluye 12 variantes, lo que permite medir el impacto de la cuantización en calidad y velocidad sobre el mismo modelo base.
- Inferencia en entornos sin GPU dedicada: las variantes Q2_K y Q3_K_S reducen el peso a un rango manejable en RAM de sistemas de escritorio.
- Integración en pipelines de generación de texto autoalojados: si el modelo base resulta adecuado para la tarea, el GGUF permite servir respuestas sin depender de APIs externas.
- Archivado y reproducibilidad: al ser cuantizaciones estáticas, facilitan la replicación de experimentos con pesos fijos y verificables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, asumiendo 27B parámetros y sin overhead de contexto):
  - f16: ~54 GB
  - Q8_0: ~29 GB
  - Q6_K: ~22 GB
  - Q5_K_M: ~19 GB
  - Q4_K_M: ~16 GB
  - IQ4_XS: ~15 GB
  - Q3_K_M: ~13 GB
  - Q2_K: ~10 GB
- GPU recomendadas: A100 80 GB o H100 para f16/Q8_0; RTX 4090 (24 GB) para Q4_K_M, Q5_K_M e IQ4_XS; RTX 3090/4080 (16-24 GB) para Q4 y Q3.
- Cabe en GPU de consumo: sí, en configuraciones Q4_K_M o inferiores con GPUs de 16 GB o más; las variantes Q2_K y Q3_K_S pueden ejecutarse parcialmente en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier motor compatible con GGUF (koboldcpp, text-generation-webui). No es compatible directamente con vLLM o TGI sin conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| AxonAI-v1-27B-GGUF | 27B (según nombre) | no disponible | no disponible | GGUF | Hugging Face |
| Alternativas de ~27B en GGUF | 27B | variable | variable | GGUF | múltiples repositorios |

No se dispone de información suficiente sobre el modelo base para establecer una comparativa rigurosa con alternativas concretas de la misma categoría. Los datos de arquitectura, contexto, rendimiento y licencia del modelo AxonAI-v1-27B no están documentados en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no se conocen arquitectura, contexto, idiomas ni proceso de entrenamiento del modelo base.
- Licencia no especificada: no puede confirmarse el uso comercial ni la redistribución; es imprescindible consultar el repositorio original AxonDAO/AxonAI-v1-27B antes de cualquier uso en producción.
- Riesgo de alucinación: no evaluable sin benchmarks ni documentación.
- Sesgos: desconocidos, al no haber información sobre el corpus de entrenamiento.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan la calidad de forma notable en modelos de este tamaño; no se recomiendan para tareas sensibles.
- El repositorio no registra descargas ni likes, lo que sugiere escasa validación por parte de la comunidad.
- La fecha de creación indicada (2026-11-26) es posterior a la fecha actual en muchos contextos de consulta; conviene verificar la integridad y procedencia del repositorio.
- No hay garantía de compatibilidad con motores de inferencia distintos de llama.cpp y derivados.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/AxonAI-v1-27B-GGUF
- Modelo base: https://huggingface.co/AxonDAO/AxonAI-v1-27B

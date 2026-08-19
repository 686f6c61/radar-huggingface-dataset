# mradermacher/Phoenix-X-26B-A4B-GGUF

## Resumen

Phoenix-X-26B-A4B-GGUF es una colección de cuantizaciones GGUF del modelo original Phoenix-X-26B-A4B, desarrollado por Vortex5 y cuantizado por mradermacher (nethype GmbH). El modelo base es un merge creado con mergekit, orientado a roleplay y storytelling, con licencia Apache 2.0 y soporte únicamente para inglés. Esta versión GGUF permite ejecutar el modelo en entornos locales con recursos limitados, ofreciendo una gama de tamaños desde Q2_K (10,7 GB) hasta Q8_0 (27 GB), además de un proyector multimodal (mmproj) para capacidades de visión.

El repositorio contiene exclusivamente los pesos cuantizados en formato GGUF, listos para usar con llama.cpp, Ollama u otros runners compatibles. No se incluyen detalles sobre la arquitectura interna, el entrenamiento o los benchmarks del modelo original, ya que esa información no está disponible en la model card. La cuantización es estática (sin imatrix), y el autor indica que las versiones con imatrix podrían publicarse más adelante si se solicitan.

A pesar de la falta de especificaciones técnicas detalladas, la disponibilidad de múltiples niveles de cuantización y la licencia permisiva hacen de esta colección una opción práctica para desplegar un modelo conversacional de ~26B parámetros en hardware de consumo, siempre que se acepte la pérdida de calidad asociada a la cuantización.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo merge con mergekit, arquitectura interna desconocida) |
| Parametros totales | 25.233.142.046 (dato real de safetensors) |
| Parametros activos | no disponible (el nombre sugiere 4B activos, pero no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj Q8_0 y mmproj f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna del modelo original Phoenix-X-26B-A4B. Según las etiquetas de HuggingFace, se trata de un modelo creado mediante mergekit, lo que indica que es una fusión de varios modelos base, probablemente con una arquitectura de mezcla de expertos (MoE) dado el sufijo "A4B" en el nombre (que sugiere 4 mil millones de parámetros activos). Sin embargo, este dato no está confirmado en la documentación.

El proceso de cuantización realizado por mradermacher convierte los pesos originales en formato safetensors a GGUF, utilizando cuantización estática sin imatrix. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generación de texto conversacional, especialmente orientado a roleplay y storytelling, según las etiquetas del repositorio.
- Soporte multimodal potencial: el repositorio incluye archivos mmproj (proyector multimodal), lo que sugiere que el modelo base podría tener capacidades de visión, aunque no se especifica su funcionamiento.
- Idioma inglés únicamente.
- No se documentan capacidades de tool calling, function calling, agentes o razonamiento multi-paso.

## Casos de uso

- Roleplay interactivo: el modelo está diseñado para mantener conversaciones narrativas y personajes, ideal para juegos de rol por texto o asistentes de escritura creativa.
- Generación de historias y narrativa: puede usarse para crear cuentos, guiones o descripciones detalladas en inglés, aprovechando su orientación a storytelling.
- Prototipado de chatbots conversacionales: gracias a su licencia Apache 2.0, se puede integrar en aplicaciones comerciales sin restricciones de uso.
- Experimentación con cuantización GGUF: al ofrecer múltiples niveles de cuantización, permite evaluar el equilibrio entre tamaño, velocidad y calidad en diferentes hardware.
- Despliegue en entornos con GPU limitada: las versiones Q2_K o Q3_K pueden ejecutarse en tarjetas con 12-16 GB de VRAM, mientras que Q8_0 requiere al menos 32 GB.
- Investigación en modelos fusionados: al ser un merge, puede servir como caso de estudio para técnicas de combinación de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K u otras métricas para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - Q2_K (10,7 GB): requiere al menos 12 GB de VRAM (p.ej., RTX 3060 12GB) o CPU con 16 GB de RAM.
  - Q4_K_M (16,9 GB): necesita 20-24 GB de VRAM (RTX 3090, RTX 4090, A6000) o CPU con 32 GB de RAM.
  - Q8_0 (27,0 GB): requiere 32 GB de VRAM o más (A100, H100, o múltiples GPUs).
- GPUs recomendadas: RTX 3090/4090 para Q4_K_M, A100/H100 para Q8_0.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui (llama.cpp backend), o cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles; dependen del hardware y del tamaño de cuantización.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (MoE de ~26B con orientación a roleplay). Se recomienda consultar benchmarks públicos de modelos como Mixtral-8x7B o Qwen1.5-MoE-A2.7B para una referencia general, pero no hay datos específicos para Phoenix-X-26B-A4B.

## Limitaciones y advertencias

- La cuantización estática puede degradar la calidad del modelo, especialmente en niveles bajos como Q2_K o Q3_K. Se recomienda usar Q4_K_M o superior para producción.
- El modelo solo soporta inglés; no es adecuado para aplicaciones multilingües.
- Al estar orientado a roleplay y storytelling, puede generar contenido inapropiado o sesgado, aunque no hay datos específicos sobre sesgos.
- No se documentan capacidades de tool calling ni agentes, por lo que no es recomendable para pipelines de automatización complejos.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere poca adopción o validación por parte de la comunidad.
- La fecha de creación (2026-08-17) es futura, lo que podría indicar un error en los metadatos o un modelo muy reciente.
- No se incluyen archivos de configuración ni documentación sobre el contexto máximo soportado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Phoenix-X-26B-A4B-GGUF
- Modelo original (Vortex5): https://huggingface.co/Vortex5/Phoenix-X-26B-A4B
- Página de resumen y descargas: https://hf.tst.eu/model#Phoenix-X-26B-A4B-GGUF

# Jundot/Qwen3.8-27B-oQ8e-mtp

## Resumen

Qwen3.8-27B es un modelo denso de visión-lenguaje (VLM) de código abierto desarrollado por el equipo Qwen de Alibaba. Está diseñado para tareas de codificación, trabajo profesional, investigación y agentes de larga duración, con un enfoque especial en la planificación y el manejo de retroalimentación de herramientas y entornos para completar tareas multi-paso de forma fiable. Su tamaño de 27B parámetros lo sitúa en un punto óptimo entre rendimiento y despliegue en hardware local.

La variante oQ8e-mtp es una cuantización mixta de precisión realizada con la herramienta oMLX, que reduce el modelo a 8 bits con un tamaño de grupo de 64, en formato MLX safetensors. Esto permite ejecutar el modelo en hardware Apple Silicon con un consumo de memoria reducido, manteniendo un buen equilibrio entre calidad y eficiencia. El modelo base soporta entrada nativa de imagen y vídeo, y ofrece una ventana de contexto nativa de 262K tokens, lo que lo hace adecuado para tareas que requieren procesar documentos largos o conversaciones extensas.

La relevancia actual de este modelo radica en su combinación de capacidades multimodales, razonamiento configurable y licencia Apache 2.0, que permite uso comercial sin restricciones. Es una alternativa competitiva a otros modelos abiertos de tamaño similar, especialmente en escenarios de agentes y automatización de oficina.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (visión-lenguaje) |
| Parametros totales | 27B (modelo base); el archivo safetensors cuantizado muestra 8.184.279.792 según la model card, posible error |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262K tokens (nativa) |
| Tipos de cuantizacion | oQ8e (8 bits, group size 64) en MLX safetensors |
| Idiomas soportados | Multilingüe (incluye español, inglés, chino, entre otros; lista completa no disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (cuantización oQ8e) |

## Arquitectura y entrenamiento

Qwen3.8-27B es un modelo denso basado en la arquitectura Transformer, con capacidades multimodales nativas que aceptan entradas de imagen y vídeo además de texto. El modelo base fue entrenado por el equipo Qwen de Alibaba con un enfoque en tareas de codificación, agentes y automatización de oficina, incorporando técnicas de razonamiento configurable (modo de pensamiento activable o desactivable). No se dispone de detalles específicos sobre el número de tokens de entrenamiento, la composición del dataset o el uso de RLHF/DPO en la información proporcionada.

La cuantización oQ8e-mtp aplica precisión mixta de 8 bits con un tamaño de grupo de 64, utilizando la herramienta oMLX. Este método busca preservar la calidad en capas sensibles mientras reduce el peso total, optimizando el modelo para ejecución en hardware Apple Silicon. El formato MLX safetensors es compatible con el ecosistema MLX, lo que facilita su uso en aplicaciones locales de macOS.

## Capacidades

- Generación de texto y razonamiento multilingüe, con modo de pensamiento configurable (thinking mode) para tareas complejas.
- Comprensión de imágenes y vídeo de forma nativa, permitiendo tareas de visión por computador y análisis multimodal.
- Codificación de software, incluyendo generación, revisión y depuración de código.
- Soporte de agentes y razonamiento multi-paso, con manejo de retroalimentación de herramientas y entornos para completar tareas de larga duración.
- Automatización de oficina, como generación de documentos, resúmenes y análisis de datos.
- Capacidad de tool calling / function calling para integración con APIs y servicios externos.
- Ventana de contexto de 262K tokens, adecuada para documentos extensos y conversaciones largas.

## Casos de uso

- Automatización de oficina: el modelo puede generar informes, resumir actas de reuniones y redactar correos electrónicos, aprovechando su contexto de 262K tokens para procesar documentos largos completos sin truncamiento.
- Asistente de codificación en producción: con soporte de tool calling y razonamiento multi-paso, puede integrarse en pipelines de CI/CD para revisar código, sugerir correcciones y generar tests automáticos.
- Agente de atención al cliente multimodal: puede analizar capturas de pantalla o vídeos enviados por usuarios, además de texto, para resolver incidencias técnicas de forma autónoma.
- Análisis de documentos legales o académicos: su ventana de contexto amplia permite procesar contratos, artículos de investigación o expedientes completos, extrayendo información relevante y respondiendo preguntas específicas.
- Automatización de tareas en el navegador: gracias a su capacidad de agentes, puede interactuar con interfaces web, rellenar formularios, navegar por páginas y ejecutar flujos de trabajo complejos.
- Asistente de investigación multimodal: puede analizar figuras, gráficos y tablas en artículos científicos, combinando visión y razonamiento para sintetizar conclusiones.

## Benchmarks y rendimiento

Los siguientes resultados corresponden al modelo base Qwen3.8-27B, según la información publicada en la guía de Lovable App. No se dispone de benchmarks específicos para la cuantización oQ8e-mtp.

| Benchmark | Resultado |
|---|---|
| DeepSWE | 42.2 |
| Terminal Bench | 73.0 |
| OSWorld | 84.3 |

Estos valores indican un rendimiento destacado en tareas de ingeniería de software, uso de terminal y control de sistemas operativos, respectivamente. No se han publicado comparaciones directas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo base de 27B en precisión completa requiere aproximadamente 54 GB de VRAM. La cuantización oQ8e (8 bits) reduce el consumo a unos 27-30 GB, según el tamaño del repositorio (30 GB).
- GPU recomendadas: para el modelo base, GPUs con 32 GB o más (A100, H100, RTX 4090 con 24 GB puede ser insuficiente en FP16). La versión cuantizada en MLX está optimizada para Apple Silicon (M3 Max, M4, etc.) con al menos 32 GB de memoria unificada.
- En consumer GPU: la cuantización oQ8e podría caber en una RTX 4090 (24 GB) si se usa una versión GGUF o similar, pero el formato MLX está orientado a macOS. Para GPUs NVIDIA se necesitaría convertir a otro formato.
- Opciones de despliegue: el formato MLX safetensors es compatible con el ecosistema MLX (mlx-lm, oMLX). Para otros entornos, se puede convertir a GGUF para usar con llama.cpp u Ollama, o a FP16 para vLLM o TGI.
- Latencia y throughput: no se han publicado datos específicos para esta cuantización. En Apple Silicon M3 Max con 128 GB, se han reportado pruebas de benchmark en el issue #2689 de oMLX, pero sin resultados numéricos en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | Apache 2.0 | Sí (imagen/vídeo) | Modelo de referencia de este ficha |
| Qwen2.5-VL-27B | 27B | 128K | Apache 2.0 | Sí (imagen/vídeo) | Generación anterior, contexto menor |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 Community | No | Menor tamaño, sin visión nativa |
| Mistral Small 3.1 24B | 24B | 128K | Apache 2.0 | No | Competidor en tamaño, sin visión |

La comparativa se basa en datos públicos de los modelos mencionados. Qwen3.8-27B destaca por su contexto nativo de 262K y su capacidad multimodal, superior a alternativas de tamaño similar sin visión.

## Limitaciones y advertencias

- La cuantización oQ8e puede introducir una ligera degradación de calidad en comparación con el modelo en FP16, especialmente en tareas de razonamiento complejo o generación de código muy específico.
- El formato MLX safetensors está limitado al ecosistema Apple Silicon; para otros entornos es necesario convertir los pesos, lo que puede requerir herramientas adicionales.
- El dato de parámetros totales en la model card (8.184.279.792) no coincide con los 27B declarados del modelo base; se recomienda verificar la integridad del archivo antes de su uso.
- No se dispone de información sobre sesgos específicos del modelo, pero al ser un modelo entrenado con datos web, puede reflejar sesgos presentes en esos datos.
- Riesgo de alucinación en tareas de razonamiento o generación de código, especialmente cuando se usa el modo de pensamiento desactivado.
- La licencia Apache 2.0 permite uso comercial, pero se debe revisar la atribución y las condiciones de la licencia para redistribución.
- Para producción, se recomienda validar el rendimiento de la cuantización en las tareas específicas antes de desplegarla, ya que los benchmarks del modelo base no garantizan el mismo comportamiento en la versión cuantizada.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/Jundot/Qwen3.8-27B-oQ8e-mtp
- Repositorio del modelo base: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Guía completa de Qwen3.8-27B: https://lovableapp.org/blog/qwen3-8-27b
- Página de Qwen3.8 27B en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-8-27b/
- Página de Qwen3.8 en LM Studio: https://lmstudio.ai/models/qwen3.8
- Issue de oMLX con benchmarks: https://gist.github.com/taozhiyuai/bcba38be6a6bc2404379a241c06e7b59

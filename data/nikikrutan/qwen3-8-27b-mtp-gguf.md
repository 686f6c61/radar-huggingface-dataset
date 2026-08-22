# NikiKrutan/Qwen3.8-27B-MTP-GGUF

## Resumen
Qwen3.8-27B-MTP-GGUF es una colección de cuantizaciones GGUF del modelo Qwen3.8-27B, generadas por NikiKrutan con un método experimental denominado "niki-allocator". El modelo base es un LLM multimodal (imagen y texto) de 27 320 millones de parámetros, con capacidades de razonamiento, visión y un contexto de 256K tokens. La relevancia de estas cuantizaciones radica en que incluyen el módulo MTP (multi-token prediction), que acelera la decodificación en llama.cpp, y en que el autor presenta una comparación exhaustiva de calidad frente a otros proveedores de GGUF (unsloth, bartowski, lmstudio-community, etc.), basada en métricas de divergencia como KLD y RMS Δp. El repositorio contiene 15 tamaños de cuantización que van desde aproximadamente 8,5 GB hasta 23 GB, con un tamaño total de 231 GB. Licenciado bajo Apache-2.0, permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo multimodal (texto e imagen) tipo transformer con módulo MTP |
| Parámetros totales | 27 320 697 856 (27,3B) |
| Parámetros activos | No aplicable (no es MoE) |
| Longitud de contexto | 256K tokens (según documentación de Unsloth) |
| Tipos de cuantización | 15 tamaños de GGUF (entre ~8,5 GB y ~23 GB) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento
El modelo base Qwen3.8-27B es un transformer multimodal con visión y lenguaje, entrenado para razonamiento y tareas de codificación. No se dispone de detalles sobre el dataset de entrenamiento ni el proceso de alineación (RLHF, DPO, etc.) en la información proporcionada. Las cuantizaciones de este repositorio no modifican la arquitectura del modelo, sino que optimizan la asignación de tipos de bitset por tensor mediante la herramienta experimental "niki-allocator". El autor reporta 95 horas de cómputo en dos GPUs, 27 TB de archivos GGUF descartados y 72 horas de trabajo manual para producir estas versiones. El módulo MTP (multi-token prediction) se incluye en todos los tamaños, a diferencia de otros proveedores que lo eliminan en cuantizaciones pequeñas, y el autor defiende que funciona bien incluso en quants de menor tamaño.

## Capacidades
- Generación de texto y razonamiento avanzado con modo "thinking" activado por defecto (el modelo puede generar cadenas de razonamiento extensas).
- Entrada multimodal: procesa imágenes y video (según documentación de Unsloth y el pipeline_tag `image-text-to-text`).
- Soporte para tareas de codificación y uso agéntico (tags `coding`, `agentic`).
- Conversación multi-turno con contexto de 256K tokens, adecuado para documentos largos o historiales extensos.
- MTP integrado: acelera la decodificación en llama.cpp, con mejoras reportadas de +33% a +145% en GPUs de consumo (según el repositorio `sudoingX/qwen38-mtp`).
- No se confirma explícitamente el soporte de tool calling o function calling en la información disponible.

## Casos de uso
- **Atención al cliente automatizada**: el contexto de 256K tokens permite gestionar conversaciones largas y recordar detalles de interacciones previas, manteniendo coherencia en diálogos multi-turno.
- **Asistente de generación de código**: el modelo está entrenado para tareas de codificación; su MTP reduce la latencia de generación, lo que lo hace útil en entornos de desarrollo integrado (IDEs) o agentes de programación.
- **Análisis de documentos con imágenes**: al ser multimodal, puede extraer información de gráficos, diagramas o capturas de pantalla dentro de documentos extensos, útil en tareas de revisión de informes o extracción de datos.
- **Razonamiento sobre documentos largos**: con su ventana de 256K tokens, puede procesar libros, papers o expedientes completos para resúmenes o respuestas basadas en contenido específico.
- **Despliegue local en GPUs de consumo**: las cuantizaciones de 8,5-23 GB permiten ejecutar el modelo en hardware de gama alta (RTX 4090, 24 GB) o incluso en GPUs de 12 GB con los quants más pequeños, usando llama.cpp o Ollama.
- **Prototipado rápido de agentes**: su capacidad de razonamiento y el soporte de MTP facilitan experimentación con flujos de razonamiento multi-step en entornos de investigación.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks del modelo base (como MMLU, HumanEval, GSM8K) en la información proporcionada. El autor incluye comparativas de calidad de cuantización entre su versión y las de otros proveedores (unsloth, bartowski, lmstudio-community, mudler, byteshape, AtomicChat) mediante gráficos de KLD media, RMS Δp, PPL y métricas de cola (p95, p99, p99.9), pero no se aportan cifras numéricas en el texto de la model card. Los gráficos están disponibles en el repositorio de Hugging Face.

## Requisitos de hardware
- Los quants de ~8,5 GB caben en GPUs con 12 GB de VRAM (RTX 3060, RTX 4070) y pueden funcionar con desacoplamiento CPU+GPU si es necesario.
- Los quants de ~23 GB requieren al menos 24 GB de VRAM (RTX 4090, A5000, A100 40GB) para inferencia completa.
- Para usar el MTP de forma eficiente, se recomienda llama.cpp (compilado con soporte para MTP) y una GPU de consumo moderna; se reportan mejoras de +33% a +145% en velocidad de decodificación según el repositorio `sudoingX/qwen38-mtp`.
- Opciones de despliegue: llama.cpp, Ollama (si se convierte a formato GGUF), o cualquier runtime que acepte GGUF. No se menciona compatibilidad con vLLM en esta información.

## Comparativa con modelos similares
- El autor compara sus quants con los de unsloth, bartowski, lmstudio-community, mudler, byteshape y AtomicChat para el mismo modelo base Qwen3.8-27B. Según sus métricas (KLD, RMS Δp), afirma que sus cuantizaciones ofrecen mejor calidad que la mayoría de los competidores, aunque no se proporcionan números concretos.
- En cuanto al modelo base, Qwen3.8-27B se posiciona como un modelo multimodal de 27B con contexto largo, comparable a otros modelos de 27B como Qwen2.5-27B (solo texto) o Gemma-3-27B (multimodal), pero no hay datos de rendimiento comparativo en la información disponible.

## Limitaciones y advertencias
- El modelo base puede generar alucinaciones y sesgos, como cualquier LLM de su tamaño; se recomienda validar las respuestas en aplicaciones críticas.
- El modo "thinking" por defecto puede consumir un número excesivo de tokens (hasta 20 000 en respuestas cortas, según un artículo de dev.to), lo que incrementa el tiempo de respuesta y el coste computacional.
- Aunque las cuantizaciones son de alta calidad, siempre hay una pérdida de precisión respecto al modelo en punto flotante; las métricas del autor indican que las diferencias son pequeñas, pero no nulas.
- No se especifican los idiomas soportados; se presume multilingüismo por ser un modelo de Qwen, pero no está confirmado.
- El repositorio tiene un tamaño de 231 GB, lo que puede suponer un coste de descarga elevado si se necesitan varios quants.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar que el modelo base no tenga restricciones adicionales (no se indica en la información).

## Enlaces
- HuggingFace (repo de cuantizaciones): https://huggingface.co/NikiKrutan/Qwen3.8-27B-MTP-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Documentación de Unsloth sobre Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Artículo de dev.to sobre ejecución local: https://dev.to/jamilxt/qwen-38-27b-topped-hacker-news-in-a-day-heres-how-to-run-it-locally-from-spring-boot-cee
- Repositorio sobre MTP y velocidad: https://github.com/sudoingX/qwen38-mtp

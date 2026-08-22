# Benedict0-0/nova-ai-gguf

## Resumen

El modelo `Benedict0-0/nova-ai-gguf` es un fine-tune del modelo base Llama 3.1 8B, convertido a formato GGUF mediante la librería Unsloth. Está diseñado para ejecutarse localmente con llama.cpp, lo que lo hace accesible en hardware de consumo. Aunque la model card no especifica el tipo de fine-tune realizado, el nombre "NovaAI" sugiere una adaptación orientada a tareas conversacionales o de asistencia. La relevancia de este modelo radica en su formato GGUF, que facilita el despliegue en entornos locales con cuantización Q4_K_M, y su compatibilidad con la infraestructura de llama.cpp. Los detalles sobre el dataset de entrenamiento, la licencia y las capacidades específicas no se han publicado, lo que limita su evaluación técnica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 3.1 8B (fine-tune) |
| Parametros totales | 8.030.261.312 (8B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (base Llama 3.1 8B: 128K tokens, no confirmado para este fine-tune) |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (un solo archivo `llama-3.1-8b.Q4_K_M.gguf`) |

## Arquitectura y entrenamiento

La arquitectura base es un transformer decoder-only de 8B parámetros correspondiente a Llama 3.1, con atención por ventanas deslizantes y RoPE. El fine-tune se realizó con Unsloth, que optimiza el entrenamiento mediante técnicas de LoRA y kernels customizados, reduciendo el tiempo de entrenamiento y el uso de memoria. La conversión a GGUF se hizo también con Unsloth, lo que garantiza compatibilidad total con llama.cpp y otros runtime compatibles. No se especifica si se usó RLHF, DPO u otra técnica de alineación, ni la composición del dataset de fine-tune.

## Capacidades

- Generación de texto: hereda las capacidades base de Llama 3.1 8B, incluyendo generación de texto general, razonamiento y comprensión contextual.
- Soporte de tool calling: la base Llama 3.1 8B soporta tool calling; se desconoce si el fine-tune mantiene esta capacidad.
- Capacidades multilingües: la base Llama 3.1 8B soporta múltiples idiomas; el fine-tune no documenta limitaciones específicas.
- Thinking mode: no disponible en la información publicada.
- No hay evidencia de capacidades multimodales (visión, audio) en la información disponible.

## Casos de uso

- Inferencia local en CPU y GPU de bajo consumo: gracias al formato GGUF Q4_K_M, el modelo puede ejecutarse en hardware de gama media sin necesidad de GPU dedicada, usando llama.cpp o Ollama.
- Prototipado rápido de aplicaciones de texto: al ser un fine-tune de Llama 3.1, sirve como base para pruebas de concepto en chatbots, resúmenes o generación de contenido.
- Despliegue en entornos con restricciones de memoria: la cuantización Q4_K_M reduce el footprint de memoria (aproximadamente 4.7 GB), apto para máquinas con 8 GB de RAM.
- Integración en pipelines de CI/CD para generación de documentación: se puede usar con llama.cpp para automatizar la creación de documentación técnica o comentarios de código.
- Chatbot personalizado en local: con llama-cli --jinja se puede usar directamente en terminal para un asistente conversacional sin conexión.
- Experimentación académica: como modelo de 8B GGUF, permite estudiar el efecto del fine-tune sobre la base Llama 3.1 en tareas específicas, aunque no se documenten los datos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: para el archivo Q4_K_M de ~4.7 GB, se recomienda al menos 6 GB de VRAM para inferencia en GPU con llama.cpp.
- GPU recomendadas: RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores. En CPU, se puede ejecutar con 8 GB de RAM, aunque la latencia será mayor.
- Compatibilidad con consumer GPU: sí, el modelo cabe en GPUs de gama media y baja.
- Opciones de despliegue: llama.cpp (llama-cli), Ollama, LM Studio, o servidores compatibles con el formato GGUF.
- Latencia estimada: no disponible; dependerá del hardware y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| nova-ai-gguf (este) | 8B | no disponible | no disponible | GGUF Q4_K_M | Fine-tune de Llama 3.1 8B |
| Llama 3.1 8B (base) | 8B | 128K | Llama 3.1 Community License | safetensors, GGUF | Modelo base sin fine-tune |
| Mistral 7B v0.3 | 7B | 32K | Apache 2.0 | safetensors, GGUF | Alternativa de 7B con licencia permisiva |
| Qwen 2.5 7B | 7.6B | 128K | Apache 2.0 | safetensors, GGUF | Mejor rendimiento en código y matemáticas |

No se dispone de benchmarks para comparar el rendimiento real de este fine-tune frente a las alternativas.

## Limitaciones y advertencias

- Sin licencia publicada: el uso comercial o redistribución puede ser ilegal o no permitido. No se recomienda su uso en producción sin confirmar la licencia con el autor.
- Sin datos de entrenamiento: no se conoce el dataset de fine-tune, lo que impide evaluar sesgos o riesgos específicos.
- Riesgo de alucinación: como modelo base de 8B, puede generar información falsa o inventada, especialmente en dominios no cubiertos por sus datos.
- Contexto no confirmado: aunque la base Llama 3.1 soporta 128K tokens, el fine-tune podría haber reducido la longitud de contexto efectiva; no se ha verificado.
- Soporte limitado de idiomas: no se documentan los idiomas soportados en el fine-tune, aunque la base es multilingüe.
- Solo una cuantización: el único archivo Q4_K_M puede no ser óptimo para tareas que requieran alta precisión numérica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Benedict0-0/nova-ai-gguf
- Repositorio Unsloth (herramienta de entrenamiento y conversión): https://github.com/unslothai/unsloth
- Guía de GGUF en GitHub (referencia de formato): https://github.com/Lingdas1/local-llm-guide/blob/main/04-advanced-usage/gguf-modelfile.md
- Directorio de modelos GGUF (búsqueda general): https://local-ai-zone.github.io/

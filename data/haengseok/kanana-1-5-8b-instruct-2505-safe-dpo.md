# haengseok/kanana-1.5-8b-instruct-2505-Safe-DPO

## Resumen

Kanana-1.5-8b-instruct-2505-Safe-DPO es un ajuste fino (fine-tuning) del modelo Kanana 1.5 8B Instruct en su variante de mayo de 2025, publicado por el usuario haengseok en Hugging Face. El modelo parte de la familia Kanana desarrollada por Kakao (Corea del Sur) y se ha reentrenado con la librería Unsloth y TRL de Hugging Face para incorporar preferencias de seguridad mediante DPO (Direct Preference Optimization), de ahí el sufijo "Safe-DPO". El resultado es un modelo conversacional de 8.030.285.824 parámetros (aproximadamente 8B) orientado a generación de texto.

La relevancia de esta ficha es limitada: se trata de un checkpoint derivado, con cero descargas y cero likes en el momento de la consulta, y cuya model card es genérica (autogenerada por Unsloth). No se documentan datos de entrenamiento, composición del dataset de preferencias, ni resultados de benchmarks. El interés principal radica en que hereda la arquitectura y capacidades del modelo base Kanana 1.5 8B Instruct, pero con un ajuste adicional de alineación de seguridad que puede alterar el comportamiento respecto al original.

La licencia es Apache 2.0, lo que permite uso comercial, aunque conviene verificar la licencia y condiciones del modelo base original (Kanana), ya que este checkpoint declara heredar la misma licencia. El idioma declarado es únicamente inglés, aunque el modelo base Kanana está optimizado para coreano e inglés; esta discrepancia debe tenerse en cuenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, según tags) |
| Parametros totales | 8.030.285.824 (~8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantización estándar vía llama.cpp/AWQ/GPTQ, aunque no se documenta) |
| Idiomas soportados | en (inglés) según model card |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de aproximadamente 8B parámetros, etiquetado como "llama" en los tags de Hugging Face, lo que sugiere que sigue la arquitectura Llama (atención multi-cabeza con RoPE, SwiGLU, RMSNorm). El modelo base es Kanana 1.5 8B Instruct 2505, un modelo de la familia Kanana de Kakao; sin embargo, la model card de este checkpoint no aporta detalles sobre la arquitectura interna, el número de capas, dimensiones ocultas ni la ventana de contexto real.

En cuanto al entrenamiento, la model card indica únicamente que fue entrenado con Unsloth y la librería TRL de Hugging Face, "2x faster", y que se trata de un fine-tuning del modelo base. No se especifica el número de tokens de entrenamiento, la composición del dataset de preferencias (DPO), ni si hubo etapas adicionales de SFT o RLHF. La innovación técnica declarada es el uso de Unsloth para acelerar el entrenamiento, pero no se documentan técnicas como decodificación especulativa, atención lineal o híbrida.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Instruct.
- Razonamiento general y respuesta a instrucciones en inglés (idioma declarado).
- Alineación de seguridad adicional mediante DPO, orientada a reducir respuestas dañinas o inseguras.
- Soporte de tool calling / function calling: no disponible en la documentación (probablemente heredado del base, pero no confirmado).
- Soporte de agentes y razonamiento multi-paso: no disponible en la documentación.
- Capacidades multilingües: la model card declara solo inglés; el modelo base Kanana está optimizado para coreano e inglés, pero este checkpoint no lo confirma.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Asistente conversacional en inglés con filtro de seguridad: el ajuste DPO "Safe" lo hace adecuado para entornos donde se requiere moderación adicional de respuestas, como chatbots de atención al cliente en inglés.
- Generación de contenido supervisado: para pipelines que necesitan texto generado con menor probabilidad de salidas tóxicas o inseguras, gracias a la alineación de preferencias.
- Prototipado de aplicaciones de texto en inglés: al ser un modelo de 8B con licencia Apache 2.0, puede desplegarse en infraestructura propia para pruebas de concepto sin coste de licencia.
- Fine-tuning posterior: sirve como punto de partida para ajustes específicos de dominio, ya que su licencia permisiva y tamaño moderado facilitan el reentrenamiento.
- Investigación en alineación y seguridad: útil para estudiar el efecto del DPO sobre el comportamiento del modelo base Kanana 1.5 8B Instruct.
- Despliegue en entornos con requisitos de moderación: para aplicaciones donde se prioriza la seguridad sobre la creatividad, aunque sin benchmarks que lo respalden.
- Evaluación comparativa de checkpoints derivados: como caso de estudio de fine-tuning rápido con Unsloth/TRL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: ~16 GB (8B parámetros × 2 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en cuantización 8-bit: ~8-9 GB; en 4-bit (GPTQ/AWQ/GGUF Q4): ~5-6 GB.
- GPU recomendadas: A100 40/80 GB, H100 para despliegue de alta concurrencia; RTX 4090 (24 GB) para FP16 en una sola GPU; RTX 3090/4080 (16-24 GB) para cuantización 8-bit o FP16 ajustado.
- Cabe en GPU consumer: sí, en RTX 4090 (FP16), RTX 3090 (FP16 ajustado o 8-bit) y RTX 4060 Ti 16 GB (8-bit/4-bit).
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM, llama.cpp/Ollama (requiere conversión a GGUF, no incluida en el repo), Unsloth para fine-tuning.
- Latencia y throughput estimados: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| haengseok/kanana-1.5-8b-instruct-2505-Safe-DPO | ~8B | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Checkpoint derivado con DPO de seguridad; sin benchmarks |
| Kanana 1.5 8B Instruct 2505 (base) | ~8B | no disponible en esta ficha | no disponible | Hugging Face (modelo base de Kakao) | Modelo original sin el ajuste DPO de seguridad |
| Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 Community License | Amplia | Referencia de la categoría; licencia no Apache |
| Mistral 7B Instruct | 7.2B | 32K | Apache 2.0 | Amplia | Alternativa Apache 2.0 de tamaño similar |

La comparativa se ofrece como referencia de categoría; no se dispone de datos de rendimiento de este checkpoint para comparar objetivamente.

## Limitaciones y advertencias

- Model card genérica y autogenerada: no documenta dataset, hiperparámetros, ni evaluación; la reproducibilidad es nula.
- Cero descargas y cero likes: no hay evidencia de uso ni validación por la comunidad.
- Idiomas: solo se declara inglés; el modelo base Kanana está orientado a coreano e inglés, pero este checkpoint no confirma soporte multilingüe.
- Riesgo de alucinación: inherente a los modelos de 8B; no hay evaluación que lo cuantifique.
- Sesgos: no documentados; el DPO de seguridad puede introducir sobre-rechazo (falsos positivos) en temas legítimos.
- Licencia Apache 2.0 declarada, pero conviene verificar la licencia del modelo base Kanana original antes de uso comercial.
- El sufijo "Safe-DPO" no está respaldado por benchmarks de seguridad publicados; no debe asumirse una robustez de moderación garantizada.
- Contexto real desconocido: no se puede planificar su uso en tareas de contexto largo sin verificar la ventana efectiva del modelo base.
- Fecha de creación (2026-11-13) y actualización muy recientes respecto a la consulta; posible inestabilidad o cambios posteriores.

## Enlaces

- Hugging Face: https://huggingface.co/haengseok/kanana-1.5-8b-instruct-2505-Safe-DPO
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
- Modelo base (referencia): https://huggingface.co/haengseok/kanana-1.5-8b-instruct-2505-Safe-DPO
- Familia Kanana de Kakao: no disponible en la información proporcionada.

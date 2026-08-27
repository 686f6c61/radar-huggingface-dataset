# AbhiCommits/claimwise-qwen35-4b

## Resumen

El modelo **claimwise-qwen35-4b** es un fine-tune del modelo base `unsloth/Qwen3.5-4B`, desarrollado por el usuario AbhiCommits y publicado en HuggingFace con licencia Apache-2.0. Se trata de una adaptación del modelo Qwen3.5-4B de Alibaba Cloud, un modelo multimodal compacto de 4.000 millones de parámetros lanzado en febrero de 2026, que emplea una arquitectura híbrida que combina Gated Delta Networks y Gated Attention. El nombre "claimwise" sugiere un enfoque orientado a tareas de verificación de afirmaciones o reclamaciones, aunque la model card no proporciona detalles sobre el dataset de entrenamiento ni el propósito exacto.

El modelo está diseñado para procesar entradas de imagen y texto (pipeline `image-text-to-text`), lo que lo habilita para tareas multimodales como respuesta a preguntas visuales o análisis de documentos. Su tamaño de 4,66 mil millones de parámetros lo sitúa en el rango de modelos que pueden ejecutarse en GPUs de consumo con cuantización adecuada. La relevancia actual radica en que Qwen3.5 es una familia reciente de modelos open source con buen rendimiento por parámetro, y este fine-tune específico busca adaptarlo a un dominio concreto, aunque la documentación pública es mínima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated Delta Networks + Gated Attention (patrón 8×(3×DeltaNet→FFN→1×Attention→FFN)) |
| Parametros totales | 4.659.865.088 (4,66 B) |
| Parametros activos | no disponible (no se especifica si es MoE; se asume denso) |
| Longitud de contexto | no disponible (el modelo base Qwen3.5-4B soporta contexto largo, pero no se confirma el valor exacto) |
| Tipos de cuantizacion | no disponible (no se publican en la model card; se espera compatibilidad con GGUF, GPTQ, AWQ por ser modelo transformers) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (también compatible con transformers y text-generation-inference) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B emplea una arquitectura híbrida que combina Gated Delta Networks (una variante de redes recurrentes con puertas) y Gated Attention, organizada en un patrón repetitivo de 8 bloques donde cada bloque contiene 3 capas DeltaNet seguidas de una capa de atención con puertas, intercaladas con capas feed-forward. Esta combinación busca equilibrar eficiencia computacional y capacidad de modelado de dependencias de largo alcance. El modelo base fue entrenado por Alibaba Cloud con datos multimodales (imagen y texto), aunque los detalles específicos del corpus no se han publicado en la información disponible.

El fine-tune `claimwise-qwen35-4b` fue realizado por AbhiCommits utilizando la librería Unsloth (que acelera el entrenamiento) y la librería TRL de HuggingFace. No se especifica el método de ajuste (si fue LoRA, QLoRA o full fine-tune), ni el número de tokens de entrenamiento, ni la composición del dataset. La model card solo indica que el entrenamiento fue "2x más rápido" gracias a Unsloth. No hay información sobre el uso de RLHF, DPO u otras técnicas de alineación posteriores al fine-tune.

## Capacidades

- **Procesamiento multimodal**: al estar basado en Qwen3.5-4B, acepta entradas de imagen y texto, permitiendo tareas como respuesta a preguntas visuales, descripción de imágenes o extracción de información de documentos escaneados.
- **Generación de texto**: capacidad nativa de generación de lenguaje natural en inglés, heredada del modelo base.
- **Razonamiento**: el modelo base Qwen3.5-4B está diseñado para tareas de razonamiento lógico y matemático, aunque no se han publicado benchmarks específicos para este fine-tune.
- **Tool calling / function calling**: no se menciona explícitamente en la documentación, pero es una capacidad común en la familia Qwen3.5; no confirmada para este modelo.
- **Soporte de agentes**: no se documenta; depende de la implementación del usuario.
- **Capacidades multilingües**: el modelo declara únicamente inglés (`language: en`), aunque el modelo base podría soportar más idiomas; no se confirma.
- **Modo thinking**: no se especifica si el fine-tune conserva el modo de razonamiento extendido del modelo base.

## Casos de uso

- **Verificación de reclamaciones en seguros**: el modelo puede analizar imágenes de daños (fotos de accidentes, facturas) junto con texto descriptivo para evaluar la validez de una reclamación, gracias a su capacidad multimodal y su nombre orientado a "claims".
- **Análisis de documentos legales**: procesar contratos o pólizas escaneadas, extrayendo cláusulas relevantes y respondiendo preguntas sobre el contenido, combinando visión y comprensión de texto.
- **Atención al cliente automatizada**: gestionar consultas de usuarios que incluyen capturas de pantalla o imágenes de productos, proporcionando respuestas contextuales basadas en la información visual y textual.
- **Moderación de contenido visual**: clasificar imágenes o memes con texto incrustado para detectar contenido problemático, aprovechando la entrada multimodal.
- **Asistente para personas con discapacidad visual**: describir imágenes del entorno y responder preguntas sobre ellas, integrado en aplicaciones móviles o web.
- **Extracción de información de recibos y facturas**: convertir imágenes de recibos en datos estructurados (montos, fechas, proveedores) mediante preguntas en lenguaje natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación, y no hay referencias externas que reporten el rendimiento de este fine-tune específico. Se recomienda al usuario ejecutar sus propias pruebas en el dominio objetivo (reclamaciones, documentos) para validar la calidad del modelo.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 4,66 B parámetros en FP16, se requieren aproximadamente 9,3 GB de VRAM (sin contar overhead de activaciones). Con cuantización INT8, ~4,7 GB; con INT4, ~2,5 GB.
- **GPU recomendadas**: para FP16, una GPU con 12 GB o más (RTX 3060, RTX 4070, A10). Para cuantización INT4, GPUs con 4-6 GB (RTX 3050, RTX 4060) pueden ser suficientes.
- **Compatibilidad con consumer GPU**: sí, es viable en GPUs de consumo con cuantización adecuada (por ejemplo, RTX 4090 con FP16 o INT8).
- **Opciones de despliegue**: al ser un modelo transformers con safetensors, es compatible con vLLM, TGI (text-generation-inference), llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta) y HuggingFace Inference Endpoints.
- **Latencia y throughput**: no se dispone de datos medidos para este fine-tune. Como referencia, un modelo de 4B en una RTX 4090 con FP16 suele generar entre 30-60 tokens/s, pero depende de la implementación y el hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| claimwise-qwen35-4b (este) | 4,66 B | no disponible | Sí (imagen+texto) | Apache-2.0 | HuggingFace |
| Qwen3.5-4B (base) | ~4 B | no disponible (largo) | Sí | Apache-2.0 | HuggingFace, Ollama |
| Qwen3.5-abliterated 4B | ~4 B | no disponible | Sí | Apache-2.0 (variante sin censura) | HuggingFace, Ollama |
| Llama 3.2 4B (alternativa no multimodal) | 4 B | 128K | No | Llama 3.2 Community License | HuggingFace |

La comparativa se limita a modelos de tamaño similar. El fine-tune claimwise se diferencia por su adaptación específica (aunque no documentada) y su naturaleza multimodal. No hay datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- **Documentación insuficiente**: la model card no especifica el dataset de fine-tune, el método de entrenamiento ni las tareas objetivo, lo que dificulta evaluar su idoneidad para casos concretos.
- **Sesgos potenciales**: al ser un fine-tune de un modelo base entrenado con datos web, puede heredar sesgos de género, raza o cultura presentes en el corpus original. No se ha realizado una evaluación de sesgos específica.
- **Riesgo de alucinación**: como todo modelo generativo, puede producir información falsa o inventada, especialmente en tareas de verificación de reclamaciones donde la precisión es crítica.
- **Limitaciones de idioma**: solo se declara inglés; el rendimiento en otros idiomas no está garantizado.
- **Contexto**: no se ha confirmado la longitud de contexto efectiva tras el fine-tune; puede verse reducida si el entrenamiento no preservó la ventana original.
- **Uso comercial**: la licencia Apache-2.0 permite uso comercial sin restricciones, pero el usuario debe verificar que el modelo base (Qwen3.5-4B) también cumple con los términos de su licencia original (Apache-2.0, según la información disponible).
- **Producción**: al no haber benchmarks ni pruebas de robustez, se recomienda una validación exhaustiva antes de desplegar en entornos críticos.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/AbhiCommits/claimwise-qwen35-4b)
- [Modelo base unsloth/Qwen3.5-4B](https://huggingface.co/unsloth/Qwen3.5-4B)
- [Colección oficial Qwen3.5](https://huggingface.co/collections/Qwen/qwen35)
- [Especificaciones de Qwen3.5-4B (apxml.com)](https://apxml.com/models/qwen35-4b)
- [Página de Qwen3.5:4b en Ollama](https://ollama.com/library/qwen3.5:4b)
- [Colección Qwen3.5-abliterated de huihui-ai](https://huggingface.co/collections/huihui-ai/qwen35-abliterated)
- [Repositorio de Unsloth](https://github.com/unslothai/unsloth)

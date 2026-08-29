# RazielShadowpaw/Gemma-4-12B-Eldralis-V1-Beta

## Resumen

Gemma-4-12B-Eldralis-V1-Beta es un fine-tune del modelo Gemma 4 12B de Google, convertido a formato GGUF mediante Unsloth. El autor, RazielShadowpaw, ha publicado este modelo en Hugging Face con el objetivo de ofrecer una versión cuantizada y lista para inferencia local con llama.cpp. El nombre del archivo sugiere que se trata de una variante "abliterated" (con la capa de rechazo eliminada) y con cuantización Q4_K_M, lo que reduce significativamente los requisitos de memoria frente al modelo original en BF16.

El modelo base Gemma 4 12B es un modelo multimodal encoder-free de 12 mil millones de parámetros, con una ventana de contexto de hasta 256K tokens y soporte para más de 140 idiomas. Este fine-tune hereda presumiblemente esas capacidades, aunque la model card no detalla cambios específicos en el entrenamiento. La relevancia de esta ficha radica en que ofrece una opción práctica para ejecutar un modelo de esta categoría en hardware de consumo, gracias a la cuantización GGUF y la compatibilidad con llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal encoder-free (basado en Gemma 4 12B) |
| Parametros totales | 11.907.350.576 (aprox. 12B) |
| Parametros activos | no disponible (no se especifica si es MoE; el base es denso) |
| Longitud de contexto | 256K tokens (heredado del base; el fine-tune no especifica cambios) |
| Tipos de cuantizacion | Q4_K_M (archivo publicado); otros no disponibles |
| Idiomas soportados | no disponible (el base soporta 140+ idiomas, pero el fine-tune no lo confirma) |
| Licencia | no disponible |
| Formato de pesos | GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo base Gemma 4 12B emplea una arquitectura transformer multimodal sin codificador (encoder-free), capaz de procesar texto, imagen, audio y vídeo de forma nativa. El fine-tune Eldralis-V1-Beta se ha realizado sobre la versión instruct (it) del modelo, y el nombre del archivo indica que se ha aplicado una técnica de "abliteration" (eliminación de la negativa a responder) y un entrenamiento adicional con Unsloth, que acelera el fine-tuning. No se dispone de detalles sobre el dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas como RLHF o DPO. La conversión a GGUF se realizó con Unsloth, lo que garantiza compatibilidad con llama.cpp y otros motores de inferencia que soporten este formato.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base, incluyendo tareas de comprensión lectora, razonamiento lógico y generación creativa.
- Multimodalidad: el base es multimodal (texto, imagen, audio, vídeo), pero no se confirma si el fine-tune conserva estas capacidades; la model card menciona uso con `llama-mtmd-cli` para modelos multimodales, lo que sugiere que podría mantenerlas.
- Soporte de tool calling y function calling: no se especifica en la información disponible, aunque el base Gemma 4 12B sí lo soporta.
- Capacidades multilingües: el base cubre más de 140 idiomas; el fine-tune no detalla cambios.
- Modo "abliterated": la eliminación de la capa de rechazo puede facilitar respuestas en escenarios donde el modelo base se negaría, aunque esto conlleva riesgos (ver limitaciones).

## Casos de uso

- Asistente conversacional local: gracias a la cuantización Q4_K_M, el modelo puede ejecutarse en una GPU de consumo (16 GB VRAM) o incluso en CPU con llama.cpp, permitiendo un chatbot privado sin conexión.
- Generación de código en entornos de desarrollo: el base Gemma 4 12B destaca en tareas de programación; este fine-tune puede usarse con herramientas como Continue o Copilot local para autocompletado y revisión de código.
- Análisis de documentos largos: con una ventana de contexto de 256K tokens, es adecuado para resumir o extraer información de contratos, informes o libros completos.
- Prototipado de agentes con tool calling: si se confirma el soporte de function calling, puede integrarse en pipelines de agentes para automatizar tareas como consultas a APIs o gestión de calendarios.
- Educación y tutoría: su capacidad multilingüe y de razonamiento lo hace útil para explicar conceptos complejos en varios idiomas, aunque la abliteración puede afectar a la seguridad de las respuestas.
- Investigación en IA: como modelo abierto y cuantizado, sirve para experimentar con técnicas de fine-tuning, evaluación de sesgos o pruebas de alucinación en entornos de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo base Gemma 4 12B reporta métricas en MMLU, HumanEval y otros, pero no se dispone de datos específicos para este fine-tune. Se recomienda evaluar el modelo en el caso de uso concreto antes de desplegarlo en producción.

## Requisitos de hardware

- VRAM estimada: con cuantización Q4_K_M, el modelo ocupa aproximadamente 7.4 GB (tamaño del repo), por lo que cabe en GPUs con 8 GB o más. Para contexto largo (256K), se necesitará más memoria, posiblemente 16 GB o más.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090, o GPUs de datacenter como A10G o L4. También puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Compatibilidad con consumer GPU: sí, especialmente con cuantización Q4_K_M y contexto moderado.
- Opciones de despliegue: llama.cpp (llama-cli o llama-mtmd-cli), Ollama, LM Studio, o servidores compatibles con GGUF como llama-cpp-python o text-generation-webui.
- Latencia y throughput: no se dispone de datos medidos; dependerá del hardware y de la longitud de contexto. En una RTX 4090 se esperan decenas de tokens por segundo, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma-4-12B-Eldralis-V1-Beta (este) | 12B | 256K (base) | no disponible | GGUF Q4_K_M | Fine-tune abliterado, sin benchmarks publicados |
| Gemma 4 12B (original) | 12B | 256K | Gemma Terms of Use | safetensors, GGUF | Multimodal, 140+ idiomas, benchmarks oficiales |
| Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 Community License | safetensors, GGUF | Solo texto, muy popular, amplia documentación |
| Mistral 7B Instruct v0.3 | 7B | 32K | Apache 2.0 | safetensors, GGUF | Solo texto, ligero, buena relación calidad/tamaño |

La comparativa se basa en datos públicos de los modelos base; el fine-tune no ofrece información adicional para una comparación más precisa.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un fine-tune abliterado, es probable que el modelo responda a peticiones que el base rechazaría, lo que aumenta el riesgo de generar contenido inapropiado, falso o dañino. No se ha realizado una evaluación de seguridad específica.
- Licencia: no se especifica la licencia del fine-tune. El modelo base Gemma 4 12B tiene su propia licencia (Gemma Terms of Use), que puede imponer restricciones de uso comercial. Es imprescindible verificar la licencia antes de cualquier despliegue.
- Idiomas: aunque el base soporta 140+ idiomas, el fine-tune no confirma si el entrenamiento adicional ha afectado a la cobertura multilingüe.
- Contexto: la ventana de 256K tokens es heredada, pero el fine-tune podría haberla reducido; no se ha verificado.
- Producción: al no haber benchmarks ni pruebas de robustez, no se recomienda su uso en entornos críticos sin una evaluación exhaustiva previa.
- Formato GGUF: la cuantización Q4_K_M introduce pérdida de precisión frente a BF16, lo que puede degradar ligeramente la calidad de las respuestas en tareas complejas.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/RazielShadowpaw/Gemma-4-12B-Eldralis-V1-Beta
- Modelo base Gemma 4 12B: https://huggingface.co/google/gemma-4-12B
- Página oficial de Gemma 4: https://deepmind.google/models/gemma/gemma-4/
- Model card de Gemma 4 (Google AI): https://ai.google.dev/gemma/docs/core/model_card_4
- Blog de introducción a Gemma 4 12B: https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/
- Guía para desarrolladores de Gemma 4 12B: https://developers.googleblog.com/gemma-4-12b-the-developer-guide/
- Unsloth (herramienta de fine-tuning y conversión): https://github.com/unslothai/unsloth

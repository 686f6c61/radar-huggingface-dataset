# PearlyK/nouri-qwen2.5-1.5b

## Resumen

PearlyK/nouri-qwen2.5-1.5b es un modelo de lenguaje fine-tuneado a partir de unsloth/qwen2.5-1.5b-instruct-unsloth-bnb-4bit, que a su vez deriva del modelo base Qwen2.5-1.5B-Instruct de Alibaba. El autor, PearlyK, ha publicado este modelo con licencia Apache 2.0, orientado exclusivamente al idioma inglés. El repositorio tiene un tamaño de 0.1 GB y fue creado en agosto de 2026, aunque no se proporciona información sobre el dataset de fine-tuning ni sobre el propósito específico del ajuste.

Al tratarse de un fine-tune de la familia Qwen2.5, el modelo hereda la arquitectura transformer decoder-only de Qwen2, con aproximadamente 1.54 mil millones de parámetros y una longitud de contexto de 32K tokens. Su relevancia radica en ofrecer una versión compacta y eficiente de Qwen2.5-Instruct, entrenada con la librería Unsloth para acelerar el proceso de ajuste, lo que lo hace adecuado para despliegues en entornos con recursos limitados. Sin embargo, la ausencia de una model card detallada limita el conocimiento sobre sus capacidades específicas más allá de las heredadas del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 1.54 mil millones (aprox., segun modelo base) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32K tokens (segun modelo base Qwen2.5-1.5B) |
| Tipos de cuantizacion | bnb-4bit (modelo base), safetensors en el repo |
| Idiomas soportados | en (segun model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de unsloth/qwen2.5-1.5b-instruct-unsloth-bnb-4bit, que a su vez es una version cuantizada a 4 bits de Qwen2.5-1.5B-Instruct. La arquitectura subyacente es un transformer decoder-only con atención de causalidad completa, perteneciente a la serie Qwen2.5. El modelo base fue preentrenado por Alibaba sobre un dataset de hasta 18 billones de tokens, con mejoras específicas en codificación y matemáticas. El fine-tuning se realizó utilizando la librería Unsloth, que acelera el entrenamiento aproximadamente 2 veces, y la librería TRL (Transformers Reinforcement Learning) para el ajuste supervisado. No se especifican los datos de entrenamiento del fine-tuning, ni si se aplicaron técnicas como RLHF o DPO. Tampoco se detallan innovaciones técnicas adicionales más allá del uso de Unsloth para la optimización del entrenamiento.

## Capacidades

- Generación de texto: al ser un fine-tune de Qwen2.5-Instruct, es capaz de generar texto coherente y seguir instrucciones en inglés.
- Razonamiento y matemáticas: hereda las capacidades del modelo base, que muestra un rendimiento sólido en tareas de razonamiento lógico y aritmético.
- Generación de código: el modelo base Qwen2.5-1.5B-Instruct tiene soporte para tareas de programación, aunque con limitaciones propias de su tamaño.
- Soporte multilingüe: aunque la model card indica solo inglés, el modelo base Qwen2.5 soporta múltiples idiomas; sin embargo, no se confirma que el fine-tune conserve esta capacidad.
- Tool calling y function calling: no se menciona explícitamente en la información disponible, pero el modelo base Qwen2.5-Instruct soporta estas funcionalidades; se recomienda verificar experimentalmente.
- Capacidades de agente y razonamiento multi-paso: no hay información específica para este fine-tune; el modelo base tiene limitaciones en tareas complejas debido a su tamaño.

## Casos de uso

- Asistente de chat ligero: el modelo puede integrarse en aplicaciones de chat en inglés para responder preguntas frecuentes o mantener conversaciones simples, gracias a su tamaño reducido y bajo consumo de recursos.
- Generación de código en entornos con restricciones de hardware: para autocompletar fragmentos de código o generar funciones simples en Python u otros lenguajes, puede desplegarse en CPUs o GPUs de gama baja.
- Clasificación y extracción de información: mediante prompts adecuados, puede utilizarse para etiquetar texto, extraer entidades o resumir documentos cortos en inglés.
- Prototipado rápido de aplicaciones NLP: al ser un modelo pequeño y con licencia Apache 2.0, es adecuado para experimentar y validar ideas antes de escalar a modelos más grandes.
- Educación y aprendizaje: puede servir como herramienta de práctica para estudiantes de procesamiento de lenguaje natural, permitiendo explorar fine-tuning y despliegue sin necesidad de infraestructura costosa.
- Automatización de tareas de redacción: para generar borradores de correos, publicaciones en redes sociales o descripciones de productos en inglés, con supervisión humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no incluye métricas de rendimiento en su model card, y no se encontraron evaluaciones independientes. Dado que es un fine-tune de Qwen2.5-1.5B-Instruct, se puede esperar un rendimiento similar al del modelo base en tareas como MMLU, HumanEval o GSM8K, pero estos datos no están confirmados para esta variante específica.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización de 4 bits, el modelo requiere aproximadamente 1-2 GB de VRAM para inferencia en FP16 o BF16; en 8 bits, alrededor de 2-3 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 4060, o GPUs de datacenter como T4 o A10. También puede ejecutarse en CPU con suficiente RAM (8-16 GB).
- Compatibilidad con GPUs de consumo: sí, cabe en la mayoría de GPUs consumer modernas con 4 GB o más de VRAM.
- Opciones de despliegue: compatible con vLLM, llama.cpp, Ollama, Text Generation Inference (TGI) y Transformers de Hugging Face. El tag `text-generation-inference` sugiere soporte para TGI.
- Latencia y throughput estimados: no se dispone de datos específicos; en una GPU T4, se puede esperar una latencia de decodificación de aproximadamente 20-40 ms por token y un throughput de 20-50 tokens por segundo, dependiendo de la cuantización y el batch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| PearlyK/nouri-qwen2.5-1.5b | 1.54B | 32K | Apache 2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct (original) | 1.54B | 32K | Apache 2.0 | Hugging Face |
| Llama 3.2 1B Instruct | 1.23B | 128K | Llama 3.2 Community License | Hugging Face |
| Gemma 2 2B | 2.6B | 8K | Gemma License | Hugging Face |

El modelo se posiciona como una alternativa ligera dentro del ecosistema Qwen2.5, con la ventaja de un fine-tuning optimizado con Unsloth. Comparado con Llama 3.2 1B, ofrece mayor contexto (32K vs 128K, aunque Llama tiene más contexto) y una licencia más permisiva (Apache 2.0 vs Llama Community License). Frente a Gemma 2 2B, tiene menos parámetros pero un contexto mayor. La falta de información sobre el fine-tuning impide evaluar si supera al modelo base en tareas específicas.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un fine-tune de Qwen2.5, puede heredar sesgos presentes en los datos de preentrenamiento, especialmente en temas sensibles como género, raza o religión.
- Riesgo de alucinación: como todo modelo de lenguaje pequeño, es propenso a generar información falsa o inventada, especialmente en dominios especializados.
- Limitaciones de contexto: aunque soporta 32K tokens, el rendimiento puede degradarse en contextos muy largos; se recomienda mantener conversaciones por debajo de 8K tokens para una calidad óptima.
- Limitaciones de idioma: la model card indica solo inglés; aunque el modelo base es multilingüe, no se garantiza que el fine-tune conserve esta capacidad.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe atribuir el copyright y mantener el aviso de licencia. No hay restricciones adicionales conocidas.
- Caveat para producción: al no existir documentación sobre el dataset de fine-tuning ni evaluaciones, se recomienda realizar pruebas exhaustivas antes de desplegar en entornos críticos. El modelo es adecuado para prototipos y tareas de baja complejidad, pero no para aplicaciones que requieran alta precisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PearlyK/nouri-qwen2.5-1.5b
- Modelo base Qwen2.5-1.5B: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio GitHub de Qwen2.5: https://github.com/mx4ai/qwen2.5
- Página de PromptLayer para Qwen2.5-1.5B: https://www.promptlayer.com/models/qwen25-15b/
- Página de Ollama para qwen2.5:1.5b: https://ollama.com/library/qwen2.5:1.5b

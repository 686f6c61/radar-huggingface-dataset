# mparra137/llama-lora-medical-tc3_v2

## Resumen

`mparra137/llama-lora-medical-tc3_v2` es un ajuste fino (fine-tuning) del modelo Meta Llama 3.1 8B Instruct, realizado por el usuario mparra137 y publicado en Hugging Face. El nombre del repositorio sugiere un ajuste orientado al dominio médico ("medical"), aunque la model card no documenta explícitamente el dataset, la tarea ni el procedimiento de entrenamiento. El modelo se ha entrenado utilizando la librería Unsloth, que acelera el entrenamiento de LoRA y fine-tuning en aproximadamente 2 veces respecto a los flujos estándar.

El modelo hereda la arquitectura transformer decoder-only de Llama 3.1 8B, con 8.000 millones de parámetros y una ventana de contexto de 128.000 tokens (según las especificaciones oficiales de Llama 3.1). El repositorio ocupa 0,2 GB, lo que indica que probablemente contiene únicamente los adaptadores LoRA y no los pesos completos del modelo base, que rondarían los 16 GB en precisión de 16 bits.

La relevancia de esta ficha es limitada: se trata de un modelo de investigación con cero descargas y cero "likes" en el momento de la consulta, sin benchmarks publicados ni documentación detallada. Resulta útil como ejemplo de fine-tuning comunitario con Unsloth sobre Llama 3.1 8B, pero no debe considerarse un modelo listo para producción sin una evaluación exhaustiva por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1 8B) con adaptadores LoRA |
| Parametros totales | 8.000 millones (modelo base); adaptadores LoRA de tamaño reducido (repo de 0,2 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredado de Llama 3.1 8B; no confirmado en la model card) |
| Tipos de cuantizacion | El modelo base de partida está en bnb-4bit (bitsandbytes 4 bits); no se documentan otras cuantizaciones para el ajuste |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit`, una versión del Llama 3.1 8B Instruct de Meta cuantizada a 4 bits con bitsandbytes y preparada para fine-tuning eficiente con Unsloth. La arquitectura subyacente es un transformer decoder-only con atención por grupos (GQA), 32 capas y 8.000 millones de parámetros, diseñado originalmente por Meta para instrucciones y diálogo multilingüe.

El ajuste fino se realizó con Unsloth y TRL (según los tags del repositorio), lo que implica el uso de LoRA (Low-Rank Adaptation) o QLoRA sobre el modelo base cuantizado. No se especifica en la model card el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF/DPO, ni la configuración de hiperparámetros (rango de LoRA, alpha, tasa de aprendizaje, épocas). El sufijo "medical" del nombre sugiere un corpus de dominio médico, pero no hay confirmación documental. Tampoco se detalla ninguna innovación técnica adicional más allá del uso de Unsloth para acelerar el entrenamiento.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Llama 3.1 8B Instruct.
- Razonamiento y respuesta a instrucciones (capacidad del modelo base, no verificada tras el ajuste).
- Generación de código y matemáticas (capacidad del modelo base, no verificada tras el ajuste).
- Soporte de tool calling / function calling (capacidad del modelo base Llama 3.1 Instruct; no confirmada en el ajuste).
- Capacidades multilingües del modelo base (Llama 3.1 soporta 8 idiomas oficialmente), aunque la model card declara únicamente inglés.
- Posible especialización en dominio médico (deducida del nombre del repositorio, no documentada).
- No se documentan capacidades de visión, audio ni modo "thinking" explícito.

## Casos de uso

- Prototipado de asistentes clínicos en inglés: el modelo podría emplearse para generar respuestas a preguntas médicas frecuentes, aunque requiere validación por profesionales sanitarios antes de cualquier uso real.
- Experimentación académica con fine-tuning LoRA: sirve como ejemplo reproducible de ajuste con Unsloth sobre Llama 3.1 8B cuantizado a 4 bits para investigadores que quieran replicar el flujo.
- Generación de resúmenes de notas clínicas en inglés: adecuado por su contexto largo heredado (128k tokens), aunque la calidad tras el ajuste no está evaluada.
- Extracción de entidades médicas en textos: podría usarse en pipelines de procesamiento de lenguaje natural clínico, con la advertencia de que no hay benchmarks que respalden su precisión.
- Base para comparativas de fine-tuning: útil como punto de partida para medir el impacto de LoRA en dominios especializados frente al modelo base.
- Docencia y formación en IA médica: permite ilustrar el ciclo completo de ajuste fino con Unsloth, TRL y Hugging Face en un entorno controlado.
- Chatbot de divulgación sanitaria en inglés: con supervisión humana y sin sustituir el consejo médico profesional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 8B, en cuantización 4 bits requiere aproximadamente 5-6 GB de VRAM; en 8 bits, unos 9-10 GB; en 16 bits, unos 16-18 GB.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100 (80 GB), L40S (48 GB) para despliegues de producción; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en 16 bits.
- Cabe en GPU de consumo: sí, en RTX 3060 (12 GB) o superiores si se usa cuantización 4 bits; en RTX 4090 sin cuantización.
- Opciones de despliegue: vLLM, Text Generation Inference (TGI), llama.cpp, Ollama, transformers con bitsandbytes. El tag `text-generation-inference` sugiere compatibilidad con TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| mparra137/llama-lora-medical-tc3_v2 | 8B (LoRA) | 128k (heredado) | apache-2.0 | Hugging Face |
| meta-llama/Meta-Llama-3.1-8B-Instruct | 8B | 128k | Llama 3.1 Community License | Hugging Face |
| mistralai/Mistral-7B-Instruct-v0.3 | 7B | 32k | Apache 2.0 | Hugging Face |
| google/gemma-2-9b-it | 9B | 8k | Gemma Terms of Use | Hugging Face |

No se dispone de datos de rendimiento comparativo para el modelo ajustado, por lo que la comparativa se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: hereda los sesgos del modelo base Llama 3.1 8B, que pueden verse amplificados por el corpus de ajuste (no documentado).
- Riesgo de alucinación: elevado en dominios especializados como el médico, especialmente sin benchmarks que validen la precisión tras el ajuste.
- Limitaciones de contexto o idioma: la model card declara únicamente inglés, aunque el modelo base soporta más idiomas; el contexto de 128k no está confirmado tras el ajuste.
- Restricciones de licencia: la licencia apache-2.0 permite uso comercial, pero el modelo base Llama 3.1 tiene su propia licencia comunitaria que puede imponer restricciones adicionales; conviene revisar ambas.
- Caveat para producción: no hay documentación sobre el dataset, hiperparámetros ni evaluación; el modelo no debería usarse en entornos clínicos reales sin validación independiente.
- El repositorio tiene cero descargas y cero "likes", lo que indica ausencia de validación por parte de la comunidad.
- El tamaño del repositorio (0,2 GB) sugiere que solo contiene adaptadores LoRA; es necesario cargar el modelo base para su uso.

## Enlaces

- Hugging Face: https://huggingface.co/mparra137/llama-lora-medical-tc3_v2
- Modelo base: https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct-bnb-4bit
- Unsloth (GitHub): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://huggingface.co/docs/trl
- Meta Llama 3.1: https://ai.meta.com/blog/meta-llama-3-1/

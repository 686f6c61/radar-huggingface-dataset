# Anushka69/llama3-cv-merged

## Resumen

`Anushka69/llama3-cv-merged` es un modelo de lenguaje derivado de `NousResearch/Meta-Llama-3-8B-Instruct` mediante la fusión (merging) de un adaptador LoRA especializado en la redacción de currículums (CV) y asesoramiento profesional. Lo publica el usuario Anushka69 en Hugging Face y no cuenta con respaldo de ninguna organización de investigación reconocida. El problema que aborda es la generación y mejora de contenido de CV y textos de búsqueda de empleo, un dominio vertical concreto que el modelo base no cubre de forma específica.

Técnicamente es un transformer decoder-only de 8.030.261.248 parámetros (8B), con la arquitectura y el tokenizador originales de Llama 3. La única modificación respecto al modelo base es la incorporación de los pesos del adaptador LoRA (r=16, alpha=32) en los módulos de atención y MLP (q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj), fusionados directamente en los pesos del modelo, por lo que no requiere cargar PEFT en inferencia.

Su relevancia es limitada: el repositorio no registra descargas ni interacciones, no incluye model card detallada, no documenta el dataset de ajuste ni publica evaluaciones. Debe tratarse como un experimento de fine-tuning de dominio, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), pesos LoRA fusionados |
| Parametros totales | 8.030.261.248 (8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3 8B Instruct soporta 8.192 tokens) |
| Tipos de cuantizacion | El repositorio incluye pesos en 4-bit (bitsandbytes) segun los tags; el modelo base admite cuantizacion a 8-bit, 4-bit y formatos GGUF/AWQ derivados de la comunidad |
| Idiomas soportados | no disponible (heredados del modelo base Llama 3, predominantemente ingles y con soporte limitado de otros idiomas) |
| Licencia | Llama 3 Community License (llama3) |
| Formato de pesos | safetensors (libreria peft); tamano del repo 6.0 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con la arquitectura de Llama 3 8B: atención multi-cabeza con grouped-query attention, activación SwiGLU y normalización RMSNorm. Sobre el checkpoint instructivo de NousResearch se aplicó un ajuste supervisado con LoRA de rango 16 y alpha 32 sobre los siete módulos lineales principales, y posteriormente se fusionaron los pesos del adaptador en el modelo base. No se documenta el número de tokens de entrenamiento, la composición del dataset de CV/currículums, ni si se emplearon técnicas de RLHF o DPO adicionales.

No hay información sobre innovaciones técnicas propias: el modelo hereda las capacidades del checkpoint `Meta-Llama-3-8B-Instruct` (conversación multi-turno, formato de chat con tokens especiales, tool calling básico) y añade únicamente el sesgo de dominio del adaptador. No se especifica si el adaptador se entrenó con datos sintéticos, ofertas de empleo reales o currículums anonimizados.

## Capacidades

- Generación de texto conversacional en formato chat, heredada de Llama 3 8B Instruct.
- Redacción y reescritura de currículums: descripciones de experiencia, logros, resúmenes profesionales y cartas de presentación (dominio objetivo del ajuste).
- Asesoramiento profesional básico: sugerencias de mejora de CV, adaptación a ofertas y estructuración de secciones.
- Razonamiento general y respuesta a preguntas, en la medida en que el modelo base lo permite.
- Soporte de tool calling / function calling heredado del modelo base (no verificado tras el ajuste).
- Capacidades multilingües limitadas, heredadas del modelo base; el ajuste parece orientado a inglés.
- No dispone de visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Generación de borradores de CV: el modelo puede producir secciones completas (perfil, experiencia, formación) a partir de datos estructurados del candidato, aprovechando el ajuste específico en el dominio.
- Reescritura y optimización de bullets de experiencia: convertir descripciones genéricas en logros medibles y orientados a resultados, tarea para la que el adaptador fue entrenado.
- Adaptación de CV a una oferta concreta: dado el texto de una vacante, reescribir el currículum para alinear palabras clave y competencias, usando la ventana de contexto del modelo base.
- Cartas de presentación personalizadas: generar cartas a partir del CV y la descripción del puesto en una sola pasada conversacional.
- Asistente de orientación profesional en un chatbot: responder preguntas sobre cómo estructurar un CV, qué incluir en cada sección o cómo explicar gaps laborales, con conversación multi-turno.
- Prototipado de herramientas de RRHH: integrar el modelo como backend en un pipeline interno de generación de perfiles o resúmenes de candidatos, siempre con revisión humana.
- Experimentación académica: servir como ejemplo de merging de LoRA sobre Llama 3 para estudiar el efecto del ajuste de dominio en modelos de 8B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni métricas específicas del dominio de CV, ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV (20-24 GB en la práctica para contextos largos).
- VRAM estimada en 8-bit: aproximadamente 8-9 GB de pesos, en torno a 12 GB en total.
- VRAM estimada en 4-bit (bitsandbytes, formato incluido en el repo): aproximadamente 5-6 GB de pesos, en torno a 8 GB en total.
- GPU recomendadas: A100 40/80 GB o H100 para servicio en FP16 con concurrencia; L40S o RTX 6000 Ada para despliegues medios.
- GPU de consumo: cabe en RTX 4090 (24 GB) en FP16 y en RTX 3090/4080 (16 GB) en 8-bit o 4-bit; en GPUs de 8 GB solo con cuantización 4-bit agresiva y contextos cortos.
- Opciones de despliegue: transformers con PEFT/bitsandbytes, vLLM o TGI (convirtiendo el checkpoint a formato compatible), llama.cpp/Ollama (requiere conversión a GGUF, no incluida en el repo).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Anushka69/llama3-cv-merged | 8B | no disponible (base: 8.192) | CV y carrera profesional | Llama 3 | Hugging Face, 0 descargas |
| NousResearch/Meta-Llama-3-8B-Instruct | 8B | 8.192 | Instrucciones generales | Llama 3 | Hugging Face, ampliamente usado |
| Meta-Llama-3-8B-Instruct | 8B | 8.192 | Instrucciones generales | Llama 3 | Hugging Face, oficial |
| Mistral-7B-Instruct-v0.3 | 7B | 32.768 | Instrucciones generales | Apache 2.0 | Hugging Face |

Frente al modelo base, la única diferencia es el ajuste de dominio; no hay evidencia publicada de que mejore en tareas de CV ni de que no degrade capacidades generales. Mistral-7B-Instruct ofrece mayor contexto y una licencia permisiva, lo que lo hace preferible para producción si no se necesita el sesgo de dominio.

## Limitaciones y advertencias

- No hay model card detallada ni documentación del dataset de entrenamiento: se desconoce la calidad, el sesgo y la procedencia de los datos de ajuste.
- Riesgo de alucinación elevado en un dominio donde el modelo puede inventar experiencia, títulos o métricas si no se le proporcionan datos verificados.
- Posible sobreajuste al dominio de CV en inglés; el rendimiento en castellano no está evaluado y probablemente sea inferior.
- El ajuste LoRA puede degradar capacidades generales del modelo base (razonamiento, código, matemáticas) sin que se hayan publicado evaluaciones que lo cuantifiquen.
- Licencia Llama 3 Community License: permite uso comercial con restricciones (límite de 700 millones de usuarios mensuales, obligación de atribución y de nombrar el modelo derivado como "Llama 3"), pero debe revisarse antes de desplegar.
- Repositorio sin mantenimiento aparente, sin descargas ni validación de la comunidad: no es una base fiable para producción sin evaluación propia.
- No se garantiza que los pesos en 4-bit incluidos sean compatibles con todos los stacks de inferencia; conviene reconvertir a FP16/BF16 para servir con vLLM o TGI.

## Enlaces

- Hugging Face: https://huggingface.co/Anushka69/llama3-cv-merged
- Adaptador LoRA original: https://huggingface.co/Anushka69/llama3-finetuned-cv-adapter
- Modelo base: https://huggingface.co/NousResearch/Meta-Llama-3-8B-Instruct
- Modelo original de Meta: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Licencia Llama 3: https://llama.meta.com/llama3/license/

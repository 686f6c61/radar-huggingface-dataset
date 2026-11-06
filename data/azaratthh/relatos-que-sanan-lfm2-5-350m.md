# Azaratthh/relatos-que-sanan-lfm2.5-350m

## Resumen

Relatos que Sanan – LFM2.5-350M es un ajuste fino mediante LoRA del modelo base LiquidAI/LFM2.5-350M, desarrollado por el usuario Azaratthh en el contexto del proyecto "Relatos que Sanan" de la Universidad de Cundinamarca. El modelo está orientado a salud mental perinatal y terapia narrativa, y se distribuye en formato GGUF para su uso con llama.cpp como respaldo sin conexión dentro de una aplicación. Se trata, por tanto, de un modelo especializado y de propósito muy acotado, no de un modelo de uso general.

El modelo base, LFM2.5-350M de Liquid AI, es un transformer compacto de aproximadamente 354 millones de parámetros, lo que lo sitúa en la categoría de modelos pequeños capaces de ejecutarse en hardware muy modesto, incluso en CPU. El ajuste LoRA se realizó sobre ejemplos escritos y revisados por el equipo del proyecto, lo que sugiere un corpus de dominio muy específico y de tamaño limitado.

La relevancia de este modelo es fundamentalmente práctica y local: demuestra cómo un modelo de menos de 400 millones de parámetros puede adaptarse a un nicho concreto (acompañamiento narrativo en salud mental perinatal en español) y desplegarse sin conexión. No obstante, la información pública es muy escasa: no hay datos de benchmarks, no se especifica la licencia y el repositorio no registra descargas ni interacciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base LiquidAI/LFM2.5-350M); ajuste fino con LoRA |
| Parametros totales | 354.483.968 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (cuantizaciones concretas no especificadas); compatible con llama.cpp |
| Idiomas soportados | es (español) |
| Licencia | no disponible |
| Formato de pesos | GGUF (repositorio de 0,2 GB); pesos safetensors del modelo base referenciados en metadatos |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM2.5-350M, un transformer de 354 millones de parámetros. Sobre esta base se aplicó un ajuste fino con LoRA (Low-Rank Adaptation), una técnica que congela los pesos originales y entrena únicamente matrices de baja dimensión, lo que reduce drásticamente el coste computacional y el tamaño del artefacto resultante. El repositorio distribuido pesa 0,2 GB, coherente con un modelo pequeño cuantizado en GGUF.

Los datos de entrenamiento consisten en ejemplos "escritos y revisados por el equipo del proyecto Relatos que Sanan (Universidad de Cundinamarca)". No se especifica el número de tokens, la composición exacta del dataset, ni si se emplearon técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá del propio ajuste LoRA. La model card indica explícitamente que el modelo no contiene datos de usuarias, lo que es relevante desde el punto de vista de privacidad.

## Capacidades

- Generación de texto conversacional en español, orientada a relatos y acompañamiento narrativo en el ámbito de la salud mental perinatal.
- Estilo de respuesta adaptado a terapia narrativa, según la descripción del proyecto.
- Ejecución sin conexión mediante llama.cpp y formato GGUF, pensada como respaldo en una aplicación.
- Soporte de conversación multi-turno (etiqueta "conversational" en Hugging Face).
- Compatibilidad con endpoints (etiqueta "endpoints_compatible").
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- Capacidades multilingües limitadas al español según los metadatos.

## Casos de uso

- Respaldo sin conexión en aplicación móvil de salud perinatal: el modelo se integra en la app "Relatos que Sanan" para ofrecer respuestas narrativas cuando no hay conectividad, aprovechando su tamaño reducido (0,2 GB en GGUF) y su ejecución en CPU vía llama.cpp.
- Acompañamiento narrativo en español: genera relatos y respuestas de tono terapéutico orientadas a personas en etapa perinatal, según el corpus de ajuste revisado por el equipo del proyecto.
- Prototipado de asistentes conversacionales de nicho: sirve como ejemplo de adaptación LoRA de un modelo de 350M a un dominio concreto con recursos limitados.
- Investigación sobre modelos pequeños en salud mental: permite estudiar el comportamiento de LLM de menos de 400M en dominios sensibles y con datos escasos.
- Despliegue en dispositivos de bajos recursos: al caber en GGUF de 0,2 GB, puede ejecutarse en hardware modesto sin GPU dedicada.
- Evaluación de salvaguardas en dominios clínicos: útil para analizar cómo un modelo pequeño maneja advertencias de "no diagnostica" y límites de alcance en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; por el tamaño del repositorio (0,2 GB en GGUF) y los 354M de parámetros, la inferencia en CPU es viable con pocos cientos de MB de RAM.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU consumer moderna (incluso integradas) podría ejecutarlo, pero no hay datos oficiales.
- Cabe en GPU consumer: previsiblemente sí, dado el reducido número de parámetros, aunque no se documenta oficialmente.
- Opciones de despliegue: llama.cpp (formato GGUF) y endpoints compatibles; no se documentan vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Relatos que Sanan – LFM2.5-350M | 354M | no disponible | no disponible | GGUF en Hugging Face |
| LiquidAI/LFM2.5-350M (base) | 350M | no disponible | no disponible | Hugging Face |
| Otros ajustes de nicho en español | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- El propio autor advierte que el modelo no realiza diagnósticos ni reemplaza la atención profesional; su uso en salud mental perinatal debe enmarcarse siempre con supervisión clínica.
- Riesgo de alucinación inherente a un modelo de 350M, especialmente en un dominio sensible donde las respuestas incorrectas pueden tener consecuencias.
- Corpus de ajuste limitado y revisado por un equipo de proyecto, sin documentación sobre tamaño ni diversidad; posible sobreajuste al estilo del corpus.
- Licencia no especificada: no se puede confirmar el uso comercial ni las restricciones de redistribución.
- Contexto máximo no documentado, lo que dificulta planificar conversaciones largas.
- Solo español; sin capacidades multilingües documentadas.
- Sin benchmarks publicados ni métricas de evaluación, lo que impide verificar calidad y seguridad.
- Repositorio sin descargas ni interacciones: escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Azaratthh/relatos-que-sanan-lfm2.5-350m
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M

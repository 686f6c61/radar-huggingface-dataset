# gauguin135/kanana-1.5-8b-instruct-2505-Persona-LORA

## Resumen

Kanana-1.5-8b-instruct-2505-Persona-LORA es un ajuste fino mediante LoRA del modelo Kanana-1.5-8B-Instruct, publicado por Kakao Corp en mayo de 2025. El autor del adaptador es el usuario de Hugging Face gauguin135, que lo ha entrenado con la librería Unsloth y lo distribuye bajo licencia Apache 2.0. El propósito declarado en la model card es simplemente "uploaded finetuned model", sin detallar el dataset ni el objetivo concreto del ajuste, aunque el sufijo "Persona" sugiere una especialización en la adopción de un rol o personaje conversacional.

El modelo base Kanana es una familia de modelos lingüísticos desarrollada por Kakao Corp (Corea del Sur) orientada a tareas de generación de texto y conversación. La variante 1.5-8B-Instruct corresponde a la iteración de 8.000 millones de parámetros en modo instrucción, publicada en mayo de 2025. Este adaptador LoRA hereda por tanto la arquitectura transformer densa del modelo base y su ventana de contexto, aunque la model card no documenta estos detalles de forma explícita.

La relevancia de esta ficha es limitada: se trata de un adaptador LoRA de 0,1 GB con cero descargas y cero likes en el momento de la consulta, sin pipeline declarado y sin documentación técnica sobre el proceso de entrenamiento, los datos utilizados ni los resultados obtenidos. Cualquier evaluación rigurosa debe remitirse al modelo base original de Kakao, ya que el adaptador no aporta información verificable sobre su comportamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada del modelo base Kanana-1.5-8B-Instruct; detalles no disponibles) |
| Parametros totales | 8.000 millones (modelo base); el adaptador LoRA ocupa 0,1 GB |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la model card; el modelo base admite cuantizaciones estándar (GGUF, AWQ, GPTQ) vía herramientas de la comunidad |
| Idiomas soportados | Inglés (según la model card); el modelo base Kanana soporta coreano e inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA); el modelo base en safetensors |

## Arquitectura y entrenamiento

El adaptador se ha entrenado sobre el modelo base kakaocorp/kanana-1.5-8b-instruct-2505 utilizando Unsloth, una librería de optimización de ajuste fino que acelera el entrenamiento de LoRA. La model card indica que el entrenamiento fue "2x faster with Unsloth", pero no especifica el número de tokens, la composición del dataset, la configuración de LoRA (rank, alpha, módulos objetivo) ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detalla la arquitectura interna del modelo base más allá de que es un transformer de tipo llama según los tags.

La única innovación técnica destacable es el uso de Unsloth para el ajuste fino, que reduce el uso de memoria y acelera el entrenamiento mediante kernels optimizados y una implementación eficiente de LoRA. No hay información sobre decodificación especulativa, atención lineal ni otras técnicas avanzadas en el adaptador. El modelo base Kanana, según la documentación pública de Kakao, emplea una arquitectura transformer estándar con atención multi-cabeza, pero estos detalles no se confirman en la información proporcionada.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base instruct.
- Adopción de persona o rol conversacional (inferido del sufijo "Persona" en el nombre, no documentado explícitamente).
- Razonamiento multi-turno y mantenimiento de contexto conversacional, sujeto a la ventana de contexto del modelo base (no disponible).
- Capacidades multilingües limitadas al inglés según la model card, aunque el modelo base soporta coreano e inglés.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.
- No se documentan capacidades de código o matemáticas específicas para este adaptador.

## Casos de uso

- Prototipado de asistentes conversacionales con personalidad definida: el adaptador puede cargarse sobre el modelo base con PEFT para experimentar con respuestas caracterizadas en inglés, aunque sin garantías de calidad por falta de evaluación publicada.
- Investigación sobre ajuste fino con LoRA: sirve como ejemplo reproducible de un pipeline Unsloth sobre un modelo de 8B, útil para estudiar configuraciones de bajo rango en entornos con recursos limitados.
- Pruebas de concepto de角色 adoption en chatbots: adecuado para validar si el modelo base responde bien a instrucciones de persona antes de invertir en un ajuste completo.
- Evaluación comparativa de adaptadores LoRA: al ser un adaptador pequeño (0,1 GB), permite intercambiar múltiples personalidades sobre el mismo modelo base en un servidor de inferencia.
- Fine-tuning educativo: útil en cursos o talleres sobre PEFT y Unsloth, dado el bajo coste de almacenamiento y la licencia permisiva.
- Despliegue experimental en endpoints compatibles: los tags indican compatibilidad con text-generation-inference y endpoints_compatible, lo que facilita pruebas en infraestructura Hugging Face.
- No se recomienda su uso en producción sin una evaluación previa, dado que no hay benchmarks ni documentación del dataset de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base en FP16: aproximadamente 16 GB; en cuantización de 8 bits, unos 8-9 GB; en 4 bits, unos 5-6 GB.
- El adaptador LoRA en sí ocupa 0,1 GB y se suma al peso del modelo base.
- GPU recomendadas: A100 40GB o H100 para FP16 sin cuantizar; RTX 4090 (24 GB) para FP16; RTX 3090/4080 (16-24 GB) para 8 bits; RTX 3060 (12 GB) o inferiores para 4 bits.
- Cabe en GPU de consumo con cuantización de 4 u 8 bits.
- Opciones de despliegue: transformers con PEFT, text-generation-inference (tag declarado), vLLM con soporte LoRA, llama.cpp/Ollama tras convertir el modelo fusionado a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| gauguin135/kanana-1.5-8b-instruct-2505-Persona-LORA | 8B (base) + LoRA 0,1 GB | No disponible | Apache 2.0 | Hugging Face, 0 descargas | Adaptador sin evaluación publicada |
| kakaocorp/kanana-1.5-8b-instruct-2505 | 8B | No disponible en esta ficha | No disponible en esta ficha | Hugging Face (modelo base) | Modelo original de Kakao, con documentación oficial |
| Meta Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 Community License | Hugging Face, ampliamente adoptado | Referencia habitual para 8B; licencia no Apache |
| Mistral 7B Instruct | 7B | 32K | Apache 2.0 | Hugging Face, ampliamente adoptado | Alternativa Apache 2.0 con ecosistema maduro |

## Limitaciones y advertencias

- No hay información sobre el dataset de entrenamiento, por lo que se desconocen los sesgos introducidos por el ajuste.
- Riesgo de alucinación inherente al modelo base, no mitigado ni evaluado en el adaptador.
- Idiomas soportados limitados al inglés según la model card, lo que restringe su uso en castellano u otros idiomas.
- Longitud de contexto no documentada; no se puede garantizar el comportamiento en conversaciones largas.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia de mejora sobre el modelo base.
- Cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- Aunque la licencia es Apache 2.0, el uso comercial debe verificar también la licencia del modelo base Kanana de Kakao, que puede imponer condiciones adicionales.
- El adaptador debe combinarse con el modelo base para funcionar; no es un modelo autónomo.
- No se documenta soporte de tool calling, agentes ni otras capacidades avanzadas, por lo que no debe asumirse su disponibilidad en producción.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/gauguin135/kanana-1.5-8b-instruct-2505-Persona-LORA
- Modelo base: https://huggingface.co/kakaocorp/kanana-1.5-8b-instruct-2505
- Unsloth (librería de entrenamiento): https://github.com/unslothai/unsloth
- Repositorio de TRL: no disponible en la información proporcionada
- Paper o blog de Kanana: no disponible en la información proporcionada

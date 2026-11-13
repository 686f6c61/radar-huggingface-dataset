# Shiftedx/Llama-3.1-Dolphin3-Cyber-8B-6bit-MLX

## Resumen

Llama-3.1-Dolphin3-Cyber-8B-6bit-MLX es una conversión cuantizada en formato MLX del modelo RavichandranJ/Dolphin3-Cyber-8B-GGUF, publicada por el usuario Shiftedx. Se trata de un fine-tune orientado a ciberseguridad construido sobre la base Dolphin3.0-Llama3.1-8B-abliterated, a su vez derivada de Llama 3.1 8B de Meta. La conversión aplica cuantización afina de 6 bits con group-size 64 sobre los pesos F16 originales del GGUF del publicador, no sobre un cuantizado de baja precisión.

El modelo resuelve el problema de ejecutar un fine-tune de ciberseguridad de 8.030 millones de parámetros en hardware Apple Silicon mediante el framework MLX, con un peso total de aproximadamente 6,08 GiB repartido en dos shards. Es relevante para desarrolladores que trabajan en Mac con memoria unificada y necesitan un modelo local especializado en tareas de seguridad, sin depender de servicios en la nube.

La ficha del autor es explícita sobre el alcance: no se realizó fine-tuning adicional, abliteración ni edición de comportamiento durante la conversión; el comportamiento heredado pertenece al modelo fuente. El contexto validado recomendado es de 2.048 tokens totales, aunque la configuración de arquitectura conserva el límite posicional original de 131.072.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), cuantizado en MLX |
| Parametros totales | 8.030.277.632 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 posiciones en config; 2.048 tokens totales validados por el autor |
| Tipos de cuantizacion | MLX affine 6-bit, group-size 64 |
| Idiomas soportados | en (inglés) |
| Licencia | llama3.1 (Llama 3.1 Community License + Acceptable Use Policy) |
| Formato de pesos | safetensors (MLX), 2 shards, ~6,08 GiB |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Llama 3.1 con 8.030 millones de parámetros, sobre el que se aplicó un fine-tune de ciberseguridad. La cadena de linaje es: Llama 3.1 8B de Meta, pasado por huihui-ai/Dolphin3.0-Llama3.1-8B-abliterated (abliteración de rechazos), después el fine-tune de ciberseguridad de RavichandranJ y finalmente la cuantización MLX de Shiftedx. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO en el fine-tune de ciberseguridad.

La innovación técnica de esta release es exclusivamente la cuantización: conversión afina de 6 bits con group-size 64 realizada a partir del GGUF F16 del publicador, verificada con comprobaciones de hashes de origen, mapeo de token IDs (128.258 tokens) e identidad de la plantilla de chat. El autor indica que el adaptador de layout GGUF superó una prueba de logits exactos antes de la conversión. No se incluyen MTP nativo ni el emparejamiento DFlash específico de Dolphin.

## Capacidades

- Generación de texto conversacional con plantilla ChatML, que debe usarse obligatoriamente en lugar de la cabecera Llama del modelo original.
- Conocimiento especializado en cibersestructura heredado del fine-tune: respuesta a incidentes, preservación de evidencias, análisis de seguridad.
- Razonamiento y respuesta a prompts multi-turno dentro del presupuesto de contexto validado.
- Capacidad multilingüe limitada al inglés según la model card.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico fiable; de hecho, el autor reporta fallos en el cumplimiento de salidas estructuradas y en argumentos de herramientas.
- No dispone de visión, audio ni modo thinking explícito.

## Casos de uso

- Respuesta a incidentes en local: el modelo puede generar guías y checklists sobre preservación de evidencias y procedimientos forenses, ejecutándose íntegramente en un Mac sin enviar datos sensibles a la nube.
- Formación y concienciación en seguridad: generación de material explicativo sobre conceptos de ciberseguridad para equipos internos, aprovechando el fine-tune temático.
- Asistente de análisis en entornos air-gapped: al correr sobre MLX en Apple Silicon, permite consultas sobre seguridad en máquinas sin conexión externa.
- Prototipado de herramientas de seguridad en macOS: integración en scripts y utilidades locales mediante mlx-lm para tareas de generación de texto de apoyo.
- Exploración de modelos abliterados: útil para investigadores que estudian el comportamiento de modelos sin rechazos en dominios sensibles, siempre dentro de la Acceptable Use Policy.
- Evaluación de cuantización MLX: sirve como referencia práctica para medir el impacto de la cuantización 6-bit frente al F16 de origen en tareas de dominio específico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que no existe una puntuación formal de Shiftedx Bench ni una afirmación de velocidad sobre el hardware de destino. Las pruebas locales se realizaron en un M4 Max con 64 GiB de memoria unificada; el despliegue previsto en un M4 Pro de 24 GB no ha sido benchmarkizado.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 6,08 GiB solo para pesos, más overhead de KV cache y runtime; se recomienda al menos 16 GB de memoria unificada para operar con comodidad.
- Hardware objetivo declarado: Apple Silicon; el despliegue previsto es un M4 Pro de 24 GB, aunque no se ha medido.
- Entorno de validación: M4 Max con 64 GiB de memoria unificada, MLX 0.32.2, MLX-LM 0.31.3 y Transformers 5.14.1.
- No es compatible con GPUs NVIDIA ni con llama.cpp, vLLM, TGI u Ollama en su forma actual; requiere MLX-LM sobre macOS con Apple Silicon.
- Latencia y throughput: no disponibles; el autor no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-Dolphin3-Cyber-8B-6bit-MLX (este) | 8,03 B | 131.072 config / 2.048 validado | MLX safetensors 6-bit | llama3.1 | Hugging Face, 0 descargas |
| RavichandranJ/Dolphin3-Cyber-8B-GGUF (fuente) | 8,03 B | 131.072 config | GGUF (F16 y cuantizados) | llama3.1 | Hugging Face |
| huihui-ai/Dolphin3.0-Llama3.1-8B-abliterated (base upstream) | 8,03 B | 131.072 | safetensors | llama3.1 | Hugging Face (no disponible durante la conversión según el autor) |
| Llama 3.1 8B Instruct (Meta) | 8,03 B | 131.072 | safetensors, GGUF | llama3.1 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El autor reporta fallos en cumplimiento de salidas estructuradas, argumentos de herramientas, selección mínima y decisiones de umbral incluso a 6 bits; la decodificación restringida por JSON/schema mejora el formato pero no garantiza corrección semántica, y no está habilitada por defecto.
- El contexto validado es de solo 2.048 tokens totales (prompt más generación), muy por debajo del límite posicional de 131.072 de la configuración; no debe asumirse calidad en ventanas largas.
- Modelo abliterado en su linaje: los rechazos de seguridad han sido eliminados, lo que aumenta el riesgo de generar contenido dañino o inseguro y exige supervisión y filtros adicionales en producción.
- Riesgo de alucinación inherente a un modelo de 8 B, agravado en dominios técnicos especializados como ciberseguridad; no debe usarse como fuente de verdad sin verificación.
- Solo soporta inglés; no hay capacidades multilingües documentadas.
- La licencia Llama 3.1 Community License impone restricciones de uso comercial y obliga al cumplimiento de la Acceptable Use Policy de Meta; es necesario revisar ambas antes de cualquier despliegue.
- Las comprobaciones locales del autor no constituyen una certificación de aptitud para misiones críticas; es obligatorio validar el modelo en tareas representativas antes de uso operativo.
- El repositorio registra 0 descargas y 0 likes, sin adopción comunitaria verificable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shiftedx/Llama-3.1-Dolphin3-Cyber-8B-6bit-MLX
- Modelo fuente GGUF: https://huggingface.co/RavichandranJ/Dolphin3-Cyber-8B-GGUF
- Revisión de pesos fuente: https://huggingface.co/RavichandranJ/Dolphin3-Cyber-8B-GGUF/tree/145d66f096c8a99aad63be19ada1fbc46d3230bd
- Tokenizer y plantilla (LoRA del publicador): https://huggingface.co/RavichandranJ/Dolphin3-Cyber-8B-LoRA/tree/edeb37d0b7062cc4978d458ea1c88b5a4896bd11
- Base upstream declarada: huihui-ai/Dolphin3.0-Llama3.1-8B-abliterated (no disponible durante la conversión)
- Licencia Llama 3.1: https://huggingface.co/Shiftedx/Llama-3.1-Dolphin3-Cyber-8B-6bit-MLX/blob/main/LICENSE
- Acceptable Use Policy: https://huggingface.co/Shiftedx/Llama-3.1-Dolphin3-Cyber-8B-6bit-MLX/blob/main/USE_POLICY.md
- Manifiesto de integridad: https://huggingface.co/Shiftedx/Llama-3.1-Dolphin3-Cyber-8B-6bit-MLX/blob/main/integrity-manifest.json
- Configuración de runtime probada: https://huggingface.co/Shiftedx/Llama-3.1-Dolphin3-Cyber-8B-6bit-MLX/blob/main/runtime-settings.json

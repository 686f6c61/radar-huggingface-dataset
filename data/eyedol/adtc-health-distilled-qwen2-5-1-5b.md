# EYEDOL/adtc-health-distilled-qwen2.5-1.5b

## Resumen

El modelo EYEDOL/adtc-health-distilled-qwen2.5-1.5b es una destilación del modelo Qwen2.5-1.5B, orientada al dominio sanitario (adtc-health). Ha sido publicado en Hugging Face por el usuario EYEDOL en agosto de 2026, y su nombre sugiere que se trata de una versión destilada de un modelo previamente ajustado con supervisión (SFT) para tareas de salud, probablemente con el objetivo de reducir el coste computacional manteniendo un rendimiento aceptable en dicho dominio.

El modelo cuenta con aproximadamente 1.540 millones de parámetros, lo que lo sitúa en la gama de modelos pequeños y desplegables en hardware de consumo. Su arquitectura hereda la de Qwen2.5, un transformer decoder-only con atención causal, y su tamaño lo hace adecuado para inferencia en entornos con recursos limitados. Sin embargo, la información pública disponible es muy escasa: la model card está prácticamente vacía, no se especifican datos de entrenamiento, licencia ni idiomas soportados, lo que limita su evaluación rigurosa.

La relevancia de este modelo radica en la tendencia creciente de destilar modelos grandes en versiones compactas para dominios específicos, como el sanitario, donde la privacidad y la latencia son críticas. No obstante, al carecer de documentación técnica y benchmarks publicados, su adopción en producción debería realizarse con cautela y tras una validación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Qwen2.5) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5, probablemente 32.768 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura del modelo es la de Qwen2.5-1.5B, un transformer decoder-only con atención causal, normalización RMSNorm, y activación SwiGLU. Al ser una destilación, el proceso de entrenamiento habría consistido en transferir el conocimiento de un modelo profesor (probablemente el modelo adtc-health-sft-qwen2.5-1.5b, también publicado por EYEDOL) a este modelo alumno, mediante técnicas de destilación de conocimiento. Sin embargo, no se han publicado detalles sobre el dataset de entrenamiento, el número de tokens utilizados, ni si se aplicaron técnicas de ajuste adicionales como RLHF o DPO. La model card no proporciona información sobre hiperparámetros, régimen de entrenamiento ni infraestructura de cómputo.

## Capacidades

- Generacion de texto: al estar basado en Qwen2.5, debería ser capaz de generar texto coherente en múltiples idiomas, aunque no se especifican los idiomas soportados.
- Razonamiento y conversacion: hereda las capacidades conversacionales de Qwen2.5, pero su especializacion en salud puede limitar su rendimiento en tareas generales.
- Dominio sanitario: el nombre del modelo sugiere un enfoque en tareas relacionadas con la salud, como resumen de historiales clinicos, generacion de respuestas a pacientes o extraccion de informacion medica.
- No se ha confirmado soporte para tool calling, function calling, agentes, vision ni audio.

## Casos de uso

- Resumen de historiales clinicos: el modelo puede generar resumenes concisos de documentos medicos extensos, aprovechando su especializacion en el dominio sanitario y su tamaño reducido para despliegue en entornos hospitalarios con recursos limitados.
- Asistente virtual de triaje: integrado en un chatbot, puede clasificar sintomas y sugerir niveles de urgencia, siempre que se valide su precision con datos clinicos reales.
- Generacion de respuestas a pacientes: para responder consultas frecuentes sobre medicacion, citas o cuidados basicos, reduciendo la carga del personal sanitario.
- Extraccion de entidades medicas: mediante fine-tuning adicional, podria utilizarse para identificar medicamentos, enfermedades o dosis en textos clinicos.
- Educacion medica: como herramienta de apoyo para estudiantes de medicina, generando explicaciones o preguntas de autoevaluacion sobre temas concretos.
- Despliegue en dispositivos edge: su tamaño de 1.5B permite ejecutarlo en GPUs de consumo o incluso en CPU con cuantizacion, facilitando su uso en consultas o centros de salud sin infraestructura de alto rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para este modelo. Tampoco se han publicado comparaciones con el modelo base Qwen2.5-1.5B ni con el modelo SFT del que deriva.

## Requisitos de hardware

- VRAM estimada: para inferencia en FP16, se necesitan aproximadamente 3 GB de VRAM (1.54B parametros × 2 bytes). Con cuantizacion INT8, alrededor de 1.6 GB; con INT4, menos de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, o superiores. Tambien puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Compatibilidad con GPU de consumo: si, cabe en la mayoria de GPUs de consumo actuales.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI, o directamente con transformers.
- Latencia y throughput: no disponibles. Al ser un modelo de 1.5B, se espera una latencia de decenas de milisegundos por token en una GPU moderna, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| EYEDOL/adtc-health-distilled-qwen2.5-1.5b | 1.54B | no disponible | no disponible | Destilacion para salud, sin benchmarks |
| EYEDOL/adtc-health-sft-qwen2.5-1.5b | 1.54B | no disponible | no disponible | Version SFT del mismo autor, probablemente el modelo profesor |
| Qwen2.5-1.5B (original) | 1.54B | 32.768 tokens | Apache 2.0 | Modelo base, con benchmarks publicos y amplia documentacion |

La comparativa se limita a estos modelos porque no hay informacion suficiente sobre alternativas especificas de destilacion para salud con el mismo tamano. El modelo original Qwen2.5-1.5B es el punto de referencia natural, pero la falta de datos de evaluacion impide una comparacion cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha publicado ninguna evaluacion de sesgos. Al ser un modelo destilado de un modelo SFT, podria heredar sesgos del dataset de entrenamiento, que no se ha hecho publico.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion medica incorrecta o inventada. En el dominio sanitario, esto es especialmente peligroso y requiere supervision humana.
- Limitaciones de contexto e idioma: no se especifican los idiomas soportados ni la longitud de contexto real. Se asume la de Qwen2.5 (32K tokens), pero no esta confirmado.
- Restricciones de licencia: la licencia no esta especificada, lo que impide conocer si su uso comercial esta permitido. Esto es un obstaculo importante para adopcion en produccion.
- Caveat para produccion: la ausencia total de documentacion tecnica, benchmarks y detalles de entrenamiento hace que este modelo no sea recomendable para uso clinico real sin una validacion exhaustiva e independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EYEDOL/adtc-health-distilled-qwen2.5-1.5b
- Modelo SFT relacionado: https://huggingface.co/EYEDOL/adtc-health-sft-qwen2.5-1.5b
- Pagina de inferencia en FriendliAI: https://friendli.ai/models/EYEDOL/adtc-health-sft-qwen2.5-1.5b
- Referencia a Qwen2.5 en Ollama: https://ollama.com/library/qwen2.5:1.5b

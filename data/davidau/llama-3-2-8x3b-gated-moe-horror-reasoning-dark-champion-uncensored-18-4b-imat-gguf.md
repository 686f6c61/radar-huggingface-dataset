# DavidAU/Llama-3.2-8X3B-GATED-MOE-Horror-Reasoning-Dark-Champion-uncensored-18.4B-IMAT-GGUF

## Resumen

Llama-3.2-8X3B-GATED-MOE-Horror-Reasoning-Dark-Champion-uncensored-18.4B-IMAT-GGUF es un modelo de generación de texto en inglés desarrollado por DavidAU, un creador independiente conocido en Hugging Face por sus fusiones (merges) de modelos Llama. Se construye mediante mergekit a partir de ocho modelos Llama 3.2 de 3B parámetros, combinados en una arquitectura de mezcla de expertos (MoE) con compuertas (gates) que suman 18.404.944.960 parámetros totales. El resultado es un modelo de aproximadamente 18,4B de parámetros con una ventana de contexto declarada de 128k tokens (131.000), orientado a escritura creativa, ficción, prosa vívida, roleplay y razonamiento con modo "thinking" activable mediante prompt de sistema.

El modelo se distribuye exclusivamente en formato GGUF cuantizado, con cuantizaciones "masterizadas" mediante un dataset Imatrix específico de horror, y con el tensor de salida en Q8_0 hasta Q3KL y F16 para IQ4/Q4 en adelante. Su propuesta de valor es doble: por un lado, ofrece una calidad de prosa y ficción que el autor sitúa por encima de los Llama 3.2 estándar y de muchos Llama 3.1 de 8B+; por otro, incorpora un sistema de "gating" que permite encender o apagar el razonamiento y seleccionar qué expertos intervienen en la generación, algo poco habitual en modelos fusionados de este tamaño.

Es relevante ahora porque demuestra hasta dónde llega el ecosistema de merges comunitarios sobre Llama 3.2: combina ocho modelos pequeños en uno solo con control explícito de expertos, sin censura y con un perfil creativo muy marcado. No es un modelo de propósito general ni un modelo de referencia para benchmarks, sino una herramienta especializada para escritura y roleplay que corre en GPUs de consumo gracias a sus cuantizaciones GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Llama 3.2 fusionado como mezcla de expertos (MoE) con compuertas; 8 expertos de 3B |
| Parametros totales | 18.404.944.960 |
| Parametros activos | no disponible (el autor indica uso de 2, 4 u 8 expertos según configuración, pero no publica el número exacto de parámetros activos por token) |
| Longitud de contexto | 128k (131.000 tokens) declarados |
| Tipos de cuantizacion | GGUF: IQ4_XS, Q4 y superiores con tensor de salida F16; Q3KL y superiores con tensor de salida Q8_0; el autor menciona IQ4XS como referencia de velocidad |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 178,0 GB); el modelo base se distribuye en safetensors float32 |

## Arquitectura y entrenamiento

La arquitectura es un transformer Llama 3.2 fusionado con mergekit: ocho modelos Llama 3.2 de 3B parámetros se combinan en un único modelo de 18,4B que se comporta como una mezcla de expertos. La innovación central es el sistema de "gating": existe un modelo maestro de razonamiento que puede activarse o desactivarse, y durante la fase de razonamiento se refuerza con los otros siete expertos; en la fase de generación sin razonamiento toman el control los expertos no orientados a razonamiento. Además, el gating permite acceder y controlar directamente qué expertos participan en el seguimiento de instrucciones y la generación.

El modelo se construyó en precisión float32 (32 bits) y las cuantizaciones GGUF se han "masterizado" con un dataset Imatrix específico de horror, generado a partir de "Grand Horror 16.5B", con métodos nuevos para aplicar imatrix tanto al tensor de salida como a los tokens. El autor no publica el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; el modelo base es una versión "abliterated" (sin censura) del modelo de razonamiento Dark Champion Instruct. El modo de razonamiento sigue el esquema de NousResearch y DeepHermes y requiere un prompt de sistema específico para invocarse.

## Capacidades

- Generación de texto y escritura creativa: prosa vívida, ficción, narrativa, generación de tramas y subtramas, continuación de escenas y storytelling en todos los géneros.
- Razonamiento con modo "thinking" activable y desactivable mediante prompt de sistema, al estilo DeepHermes.
- Roleplay y juegos de rol conversacionales, con soporte de contenido para adultos y lenguaje soez (modelo sin censura).
- Control de expertos: el gating permite elegir cuántos y cuáles expertos intervienen (el autor documenta salidas con 2, 4 y 8 expertos).
- Seguimiento de instrucciones multi-turno, con mejora explícita mediante prompts de refinamiento ("evalúa y mejora").
- Uso general de generación de texto, aunque con salida potencialmente sin censura.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni capacidades multilingües más allá del inglés.

## Casos de uso

- Escritura de ficción por capítulos: el modelo mantiene coherencia en escenas largas y acepta instrucciones de estilo como "(vivid horror)" para fijar el tono; su contexto de 128k permite arrastrar tramas y personajes de capítulos anteriores en un mismo prompt.
- Generación de tramas y subtramas: partiendo de una premisa breve, produce esquemas narrativos y desarrollos alternativos; el modo de razonamiento activado mejora la planificación de arcos argumentales.
- Roleplay conversacional de larga duración: con repetición de penalización de 1,02 o superior y temperatura moderada, sostiene personajes consistentes en conversaciones multi-turno sin censura.
- Refinamiento iterativo de textos: el flujo recomendado por el autor (borrador, lista de mejoras, reescritura) encaja en pipelines de edición asistida donde el modelo evalúa y reescribe su propia salida.
- Prototipado rápido de narrativa de género (terror, romance, ciencia ficción): el Imatrix de horror y el sesgo ligeramente negativo del modelo lo hacen adecuado para tonos oscuros sin necesidad de ajuste fino.
- Generación de diálogos y descripciones para guiones o videojuegos narrativos: la variación de cuantización produce salidas ligeramente distintas, útil para generar borradores diversos sobre una misma escena.
- Asistencia de escritura en local sobre GPU de consumo: con IQ4_XS y 2 expertos activos alcanza más de 50 tokens/s en una tarjeta de 16 GB, lo que permite integrarlo en herramientas de escritura de escritorio sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor afirma que el modelo tiene una perplejidad inferior a Meta Llama 3 Instruct y que su calidad de prosa supera a los Llama 3.2 y a muchos Llama 3.1 de 8B o más, pero no aporta cifras de MMLU, HumanEval, GSM8K ni de ningún otro benchmark estándar.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; el autor cita IQ4_XS como cuantización de referencia para 16 GB de VRAM.
- GPU recomendadas: no disponible; el autor menciona tarjetas de 16 GB de gama baja y duplicar la velocidad en tarjetas estándar o de gama media.
- Cabe en GPU de consumo: sí, según el autor, con IQ4_XS en una tarjeta de 16 GB y 2 expertos activos.
- Rendimiento declarado: más de 50 tokens/s con 2 expertos en IQ4_XS sobre GPU de 16 GB de gama baja; el doble en tarjetas de gama media.
- Opciones de despliegue: llama.cpp y derivados compatibles con GGUF (Ollama, LM Studio, KoboldCpp, entre otros); el autor no documenta soporte de vLLM ni TGI.
- Plantilla requerida: plantilla Llama 3 y/o plantilla "Command-R".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Llama-3.2-8X3B-GATED-MOE-Horror-Reasoning-Dark-Champion-uncensored-18.4B-IMAT-GGUF | 18,4B (8 expertos de 3B) | 128k | GGUF | Apache 2.0 | Razonamiento conmutable, control de expertos, sin censura |
| Llama-3.2-8X3B-MOE-Dark-Champion-Instruct-uncensored-abliterated-18.4B-GGUF (mismo autor) | 18,4B (8 expertos de 3B) | 128k | GGUF | Apache 2.0 | Versión sin gating ni modo de razonamiento conmutable; 193 likes y más de 447.000 descargas según el autor |
| Meta Llama 3.2 Instruct (3B) | 3B | 128k | safetensors, GGUF | Llama 3.2 Community License | Modelo base de referencia; el autor afirma que esta fusión tiene menor perplejidad |
| Meta Llama 3.1 Instruct (8B) | 8B | 128k | safetensors, GGUF | Llama 3.1 Community License | Referencia de la misma familia que el autor cita como superada en prosa por esta fusión |

## Limitaciones y advertencias

- Modelo sin censura: puede generar contenido para adultos, lenguaje soez y material visceral; no es apto para entornos sin moderación.
- Sesgo negativo ligero declarado por el autor: no es un modelo de finales felices, lo que puede contaminar usos neutros.
- Riesgo de alucinación no cuantificado: no hay benchmarks ni evaluación independiente publicada.
- Solo inglés: no se documenta soporte multilingüe.
- Idiomas y contexto: los 128k declarados no están verificados de forma independiente.
- Licencia Apache 2.0 sobre una fusión de Llama 3.2: conviene revisar la interacción con la Llama 3.2 Community License de los modelos base antes de uso comercial.
- El modo de razonamiento requiere un prompt de sistema específico; sin él, el comportamiento "thinking" no se activa.
- La temperatura alta mejora la variedad de prosa pero puede degradar el seguimiento de instrucciones; el autor recomienda repetición de penalización de 1,02 o superior.
- Distintas cuantizaciones producen salidas ligeramente distintas, lo que complica la reproducibilidad exacta.
- No se documenta soporte de tool calling ni de agentes; no es un modelo para pipelines de código o automatización de herramientas.
- Repositorio de 178 GB: la descarga completa es costosa y conviene seleccionar una única cuantización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Llama-3.2-8X3B-GATED-MOE-Horror-Reasoning-Dark-Champion-uncensored-18.4B-IMAT-GGUF
- Modelo base (safetensors): https://huggingface.co/DavidAU/Llama-3.2-8X3B-GATED-MOE-Reasoning-Dark-Champion-Instruct-uncensored-abliterated-18.4B
- Versión sin gating ni razonamiento: https://huggingface.co/DavidAU/Llama-3.2-8X3B-MOE-Dark-Champion-Instruct-uncensored-abliterated-18.4B-GGUF
- Perfil del autor: https://huggingface.co/DavidAU
- Colecciones del autor: https://huggingface.co/DavidAU/collections
- Preguntas frecuentes del autor: https://huggingface.co/DavidAU/support
- Repositorio de mergekit: https://github.com/arcee-ai/mergekit
- Paper de DeepHermes (esquema de razonamiento): https://arxiv.org/abs/2502.00674
- NousResearch Hermes: https://huggingface.co/NousResearch

# ganmoor-ai-labs/krishi-sathi-sarvam-2b

## Resumen

Krishi Sathi 2B (Sarvam) es un asistente agrícola bilingüe (kannada e inglés) desarrollado por ganmoor-ai-labs, diseñado para funcionar completamente offline en teléfonos Android de gama baja. Se trata de un fine-tuning LoRA sobre el modelo base sarvamai/sarvam-1, un modelo de 2.525 millones de parámetros con preentrenamiento orientado a lenguas índicas. El proyecto nace de una comparativa interna contra Qwen3-1.7B, en la que Sarvam-1 mostró una fluidez significativamente mayor en kannada y un coste de tokenización unas 3,8 veces menor por frase en ese idioma, lo que se traduce en una generación aproximadamente 4 veces más rápida en dispositivos.

El modelo está pensado para resolver un problema concreto: el acceso de pequeños agricultores del estado de Karnataka a asesoramiento agronómico fiable sin conexión a internet. Sus datos de entrenamiento provienen de consultas reales del Kisan Call Centre de Karnataka, junto con material de agronomía adaptado a la India y ejemplos específicos para enseñar al modelo a rechazar preguntas sobre datos en vivo (precios, clima, estado de subvenciones). La distribución incluye tanto pesos en safetensors como una versión cuantizada GGUF Q4_K_M de aproximadamente 1,5 GB, lista para su uso con llama.cpp u Ollama.

La relevancia actual del modelo radica en su enfoque de honestidad offline: en lugar de inventar cifras de mercado o predicciones meteorológicas, el modelo deriva al agricultor hacia canales oficiales como e-NAM, Meghdoot o los centros Raitha Samparka Kendra. No obstante, su licencia restringe el uso a fines de investigación y no comercial, lo que limita su despliegue en producción sin un acuerdo con Sarvam AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la informacion; modelo derivado de Sarvam-1 (2B) |
| Parametros totales | 2.525.087.744 (2,5 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP16 (safetensors), Q4_K_M (GGUF, ~1,5 GB) |
| Idiomas soportados | Kannada (kn), ingles (en) |
| Licencia | Sarvam AI Research License (no comercial, solo investigacion) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

La arquitectura interna no se detalla en la informacion proporcionada, pero al tratarse de un fine-tuning de Sarvam-1, hereda la estructura de este modelo base, un transformer decoder-only de 2B parametros con tokenizador optimizado para lenguas indias. El proceso de entrenamiento consistio en un fine-tuning con LoRA sobre Sarvam-1, seguido de la fusion de los adaptadores en los pesos finales. No se menciona el uso de RLHF ni DPO; el ajuste es supervisado sobre un conjunto de datos curado.

Los datos de entrenamiento incluyen tres fuentes principales: consultas reales del Kisan Call Centre de Karnataka (unas 2.900 agrupaciones de preguntas unicas, destiladas de aproximadamente 42.000 llamadas entre 2009 y 2023, con respuestas redactadas por gemma-3-27b-it preservando las dosis originales), un conjunto de preguntas y respuestas de agronomia general adaptadas a la India (filtradas de KisanVaani y reescritas por un modelo profesor), y unas 1.650 ejemplos de "honestidad offline" generados por el profesor para ensenar al modelo a rechazar preguntas sobre datos en vivo. El contenido en kannada se genero mediante traduccion automatica con IndicTrans2, y se elimino cualquier ejemplo que mencionara precios de mercado actuales.

## Capacidades

- Generacion de texto conversacional en kannada e ingles, con formato de chat Llama-2 (etiquetas [INST] y <<SYS>>).
- Asesoramiento agronomico basico: practicas de cultivo, manejo de plagas, dosificaciones (con advertencia de verificar siempre con la tabla de dosificacion adjunta).
- Rechazo explicito de preguntas sobre datos en vivo: precios de mercado, prevision meteorologica, estado de subvenciones o disponibilidad de tiendas, derivando al usuario a canales oficiales (e-NAM, Meghdoot/IMD, Raitha Samparka Kendra).
- Funcionamiento completamente offline, sin necesidad de conexion a internet ni servidores externos.
- Capacidad multilingue limitada a kannada e ingles; el modelo base Sarvam-1 soporta mas lenguas indicas, pero este fine-tuning solo ha sido validado para estas dos.
- No dispone de tool calling, ni capacidades de vision, audio o modo de razonamiento explicito.

## Casos de uso

- Asistente agricola offline en zonas rurales de Karnataka: un agricultor con un telefono Android de gama baja puede consultar dudas sobre cultivos, plagas o practicas agronomicas sin conexion, gracias al formato GGUF Q4_K_M de ~1,5 GB que cabe en memoria de dispositivos modestos.
- Sistema de apoyo en centros de extension agraria: los agentes de campo pueden usar el modelo como referencia rapida para responder consultas frecuentes de los agricultores, complementando su propio criterio con la tabla de dosificacion verificada.
- Material educativo para escuelas de agronomia: estudiantes pueden interactuar con un asistente que ensena a distinguir entre informacion estatica (practicas de cultivo) y datos dinamicos (precios, clima) que requieren fuentes oficiales.
- Prototipo de chatbot para ONGs agricolas: organizaciones que trabajan en Karnataka pueden integrar el modelo en aplicaciones de mensajeria local, siempre que cumplan con la licencia de investigacion y no comercial.
- Evaluacion de modelos multilingues indicos: investigadores pueden comparar la fluidez en kannada de este modelo frente a otros de tamano similar, aprovechando los datos de entrenamiento publicos y la documentacion del proceso.
- Sistema de derivacion a canales oficiales: el modelo puede integrarse en un flujo donde, ante preguntas sobre precios o clima, redirige al usuario a los servicios gubernamentales correspondientes, reduciendo la dependencia de datos no verificados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una "v4 smoke eval" cualitativa que indica que las respuestas en kannada son fluidas y practicas, que el modelo rechaza correctamente preguntas sobre clima, precios y estado de subvenciones sin inventar numeros, y que existen problemas conocidos como deriva en las dosis de pesticidas en respuestas en ingles, colas verbosas de seguridad y mezcla ocasional de idiomas al inicio de respuestas en kannada. No se proporcionan metricas cuantitativas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: con la cuantizacion Q4_K_M (~1,5 GB), el modelo puede ejecutarse en dispositivos con 2 GB de RAM libre; en FP16 (safetensors) requiere aproximadamente 5 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4060) para la version FP16; para la version GGUF cuantizada, basta con CPU y RAM, sin necesidad de GPU.
- Compatibilidad con consumer GPU: si, tanto en version cuantizada (incluso en CPU) como en FP16 con GPUs de gama media.
- Opciones de despliegue: llama.cpp (para GGUF), Ollama (se incluye un Modelfile en el repositorio), y potencialmente vLLM o TGI para la version safetensors, aunque no se mencionan explicitamente.
- Latencia y throughput: no se proporcionan datos medidos. La model card indica que la tokenizacion de Sarvam-1 genera ~3,8 veces menos tokens por frase en kannada que Qwen3-1.7B, lo que se traduce en una generacion aproximadamente 4 veces mas rapida en dispositivos, pero sin cifras absolutas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Krishi Sathi 2B (Sarvam) | 2,5 B | No disponible | Kannada, ingles | Sarvam AI Research (no comercial) | Fine-tuning agricola sobre Sarvam-1, offline |
| Qwen3-1.7B | 1,7 B | No disponible | Multilingue (incluye indicas) | Apache 2.0 | Evaluado en el bake-off interno; peor fluidez en kannada y ~3,8x mas tokens por frase |
| Sarvam-1 (base) | 2 B | No disponible | Varias lenguas indicas | Sarvam AI Research (no comercial) | Modelo base sin fine-tuning agricola; no tiene rechazo de datos en vivo |

La comparativa se basa en la informacion de la model card, que menciona el bake-off contra Qwen3-1.7B. No se dispone de datos de rendimiento cuantitativos para una comparacion objetiva.

## Limitaciones y advertencias

- Licencia restrictiva: el modelo se distribuye bajo la Sarvam AI Research License, que limita el uso a fines de investigacion y no comercial. Cualquier despliegue comercial requiere una licencia separada de Sarvam AI.
- Riesgo de alucinacion en dosificaciones: las dosis de pesticidas en respuestas en ingles pueden desviarse de los valores originales del conjunto de datos. El diseno recomendado exige verificar siempre con la tabla de dosificacion adjunta (dosage_table.json) antes de mostrar cualquier numero al agricultor.
- Productos quimicos obsoletos: el modelo puede sugerir compuestos cuyo registro ha cambiado en India (por ejemplo, Monocrotophos, prohibido para hortalizas). Esto supone un riesgo legal y de seguridad.
- Mezcla de idiomas: ocasionalmente las respuestas en kannada comienzan en ingles o mezclan ambos idiomas, lo que puede confundir a usuarios con bajo nivel de alfabetizacion.
- Verbosidad excesiva: se observan colas de aviso de seguridad redundantes al final de algunas respuestas, que alargan el texto sin aportar informacion.
- No es consejo profesional: el modelo no sustituye el analisis de suelo, el diagnostico de un experto ni las recomendaciones oficiales. Los autores declinan toda responsabilidad por decisiones basadas en sus salidas.
- Sin datos de contexto: no se especifica la longitud de contexto soportada, lo que limita su uso en conversaciones muy largas o con historiales extensos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ganmoor-ai-labs/krishi-sathi-sarvam-2b
- Licencia Sarvam AI Research: https://huggingface.co/sarvamai/sarvam-1/blob/main/LICENSE.md
- Modelo base Sarvam-1: https://huggingface.co/sarvamai/sarvam-1
- Pagina de modelos de Sarvam AI: https://www.sarvam.ai/models
- Repositorio Krishi-Sathi-v2 (proyecto relacionado, no este modelo): https://github.com/Tusharkanta407/Krishi-Sathi-v2
- Repositorio KrishiSaathi (proyecto relacionado): https://github.com/Kash04ish/KrishiSaathi
- Articulo sobre Krishi Sathi en arXiv: https://arxiv.org/abs/2508.03719

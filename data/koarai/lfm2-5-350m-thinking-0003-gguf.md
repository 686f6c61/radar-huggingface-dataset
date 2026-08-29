# KoarAI/LFM2.5-350M-Thinking-0003-GGUF

## Resumen

KoarAI/LFM2.5-350M-Thinking-0003-GGUF es la version cuantizada en formato GGUF del modelo KoarAI/LFM2.5-350M-Thinking-0003, un modelo de lenguaje compacto de 350 millones de parametros desarrollado por KoarAI sobre la arquitectura Liquid Foundation Model 2.5 de Liquid AI. El modelo esta disenado para razonamiento hibrido con capacidades nativas de Chain-of-Thought (CoT), generando pasos logicos internos en bloques ` thinking` antes de ofrecer la respuesta final.

El modelo fue sometido a un ajuste fino completo (100% de los pesos) en precision bfloat16, con una politica anti-sobreajuste de 2,1 epocas y un programador de tasa de aprendizaje coseno. Se utilizo una mezcla de destilacion multi-maestro con aproximadamente 1.550 muestras seleccionadas manualmente, provenientes de fuentes como Qwen 3.8 Max, OpenThoughts-114k, MMLU-Pro y GrandMaster-PRO-MAX. Esta revision 0003 se publica bajo licencia Apache 2.0 y soporta ingles y ruso.

La relevancia de este modelo radica en su capacidad para ejecutar razonamiento estructurado en dispositivos de borde con recursos limitados, manteniendo un rendimiento competitivo en tareas de matematicas, codigo y logica gracias a su arquitectura hibrida y su entrenamiento especializado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Liquid Foundation Model 2.5 (LFM2, hibrida) |
| Parametros totales | 353.322.752 (~350M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (GGUF) |
| Idiomas soportados | ingles, ruso |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (f16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura LFM2 de Liquid AI, una arquitectura hibrida optimizada para inferencia en dispositivos de borde. El modelo base LFM2.5-350M fue pre-entrenado con 28 billones de tokens segun el blog oficial de Liquid AI, e incorpora aprendizaje por refuerzo a gran escala.

KoarAI aplico un ajuste fino completo (full fine-tuning) de todos los parametros en precision bfloat16, con una politica de entrenamiento anti-sobreajuste limitada a 2,1 epocas y un programador de tasa de aprendizaje coseno con lr=2,5e-5. El dataset de ajuste consistio en aproximadamente 1.550 muestras seleccionadas manualmente mediante destilacion multi-maestro, combinando razonamiento matematico y algoritmico de Qwen 3.8 Max, trazas de verificacion paso a paso de OpenThoughts-114k, razonamiento multiple-choice de MMLU-Pro (STEM, negocio, logica y derecho) y conversacion natural en ruso de GrandMaster-PRO-MAX.

El modelo genera razonamiento estructurado en bloques nativos ` thinking` antes de emitir la respuesta final, siguiendo el formato de chat de Qwen (tokens `<|im_start|>` y `<|im_end|>`).

## Capacidades

- Razonamiento nativo Chain-of-Thought (CoT) con bloques ` thinking` estructurados.
- Razonamiento matematico, algoritmico y de codigo, destilado de Qwen 3.8 Max.
- Verificacion paso a paso y razonamiento multi-salto (multi-hop) mediante trazas de OpenThoughts-114k.
- Razonamiento multiple-choice complejo en STEM, negocio, logica y derecho (MMLU-Pro).
- Conversacion natural en ruso y seguimiento de instrucciones de alta calidad.
- Soporte de tareas agentiales (tag "agentic") en entornos de borde.
- Generacion de texto en ingles y ruso con formato de chat Qwen.

## Casos de uso

- Asistente educativo de matematicas: el modelo puede resolver problemas paso a paso mostrando su razonamiento interno en bloques ` thinking`, lo que permite a estudiantes seguir el proceso logico completo y no solo el resultado final.
- Explicacion y generacion de codigo en dispositivos de borde: gracias a su destilacion de razonamiento algoritmico, puede explicar fragmentos de codigo o generar soluciones simples directamente en el dispositivo, sin conexion a la nube.
- Asistente conversacional en ruso: su entrenamiento con GrandMaster-PRO-MAX le permite mantener conversaciones naturales en ruso con alta calidad de seguimiento de instrucciones, util para aplicaciones de atencion al cliente en ese idioma.
- Razonamiento logico y legal: su entrenamiento con MMLU-Pro le permite abordar preguntas de opcion multiple complejas en areas como logica, derecho y negocio, util para sistemas de soporte a la decision.
- Agentes de borde con razonamiento multi-paso: su capacidad de razonamiento estructurado y su tamano compacto lo hacen adecuado para pipelines agentiales en dispositivos con recursos limitados, como asistentes de voz o automatizacion del hogar.
- Evaluacion de modelos y benchmarks: su entrenamiento especifico en MMLU-Pro y su formato de razonamiento estructurado lo convierten en una herramienta util para generar respuestas razonadas en entornos de evaluacion automatizada.
- Prototipado rapido con llama.cpp y Ollama: al ser un modelo GGUF de solo ~700 MB, puede integrarse en entornos de desarrollo local para pruebas de concepto sin necesidad de infraestructura GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona el uso de MMLU-Pro como fuente de entrenamiento, pero no proporciona metricas de evaluacion posteriores al ajuste.

## Requisitos de hardware

- Tamano del archivo GGUF: ~700 MB en FP16, lo que permite ejecucion en CPU sin GPU dedicada.
- VRAM estimada: menos de 1 GB para inferencia en FP16; cabe en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso en iGPUs con suficiente memoria compartida.
- Compatible con CPU: al ser un modelo de 350M parametros, puede ejecutarse en CPU con latencia aceptable (del orden de decenas de tokens por segundo en hardware moderno).
- Motores de inferencia compatibles: llama.cpp, Ollama, LM Studio, Jan y otros motores compatibles con GGUF.
- Despliegue en produccion: puede servirse con llama.cpp server o integrarse en aplicaciones edge sin necesidad de GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| KoarAI/LFM2.5-350M-Thinking-0003 | 353M | no disponible | Apache 2.0 | GGUF | Razonamiento CoT nativo, EN/RU |
| LiquidAI/LFM2.5-350M (base) | 350M | no disponible | Apache 2.0 | safetensors | Modelo base sin ajuste de razonamiento |
| Qwen2.5-0.5B-Instruct | 500M | 32K | Apache 2.0 | safetensors/GGUF | Modelo generalista de tamano similar |
| SmolLM2-360M-Instruct | 360M | no disponible | Apache 2.0 | safetensors/GGUF | Modelo compacto orientado a edge |

Nota: los datos de contexto de LFM2.5-350M y del modelo de KoarAI no estan disponibles en la informacion proporcionada. Qwen2.5-0.5B-Instruct y SmolLM2-360M-Instruct se incluyen como referencia de la categoria de modelos compactos.

## Limitaciones y advertencias

- Solo se ofrece cuantizacion FP16; no hay versiones cuantizadas de menor precision (Q4, Q8, etc.) disponibles en este repositorio, lo que limita las opciones de optimizacion para dispositivos muy restringidos.
- La longitud de contexto no esta documentada en la informacion proporcionada; se recomienda verificar el comportamiento con secuencias largas antes de usarlo en produccion.
- El modelo solo soporta ingles y ruso; no hay capacidades multilingues mas alla de estos dos idiomas.
- El dataset de ajuste es relativamente pequeno (~1.550 muestras), lo que puede limitar la generalizacion fuera de los dominios cubiertos por las fuentes de destilacion.
- Al ser un modelo de 350M parametros, su capacidad de razonamiento complejo es inferior a la de modelos de mayor tamano; puede fallar en tareas que requieran conocimiento factual extenso o razonamiento muy profundo.
- Riesgo de alucinacion inherente a los modelos de lenguaje de este tamano, especialmente en tareas de conocimiento factual.
- El modelo fue entrenado con una politica anti-sobreajuste de 2,1 epocas; aunque esto previene el sobreajuste, tambien puede limitar la absorcion completa de los datos de entrenamiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/KoarAI/LFM2.5-350M-Thinking-0003-GGUF
- Modelo base (safetensors): https://huggingface.co/KoarAI/LFM2.5-350M-Thinking-0003
- Modelo base original de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-350M
- Blog de Liquid AI sobre LFM2.5-350M: https://www.liquid.ai/blog/lfm2-5-350m-no-size-left-behind
- Blog de Liquid AI sobre LFM2.5: https://www.liquid.ai/blog/introducing-lfm2-5-the-next-generation-of-on-device-ai
- Informe tecnico LFM2 (arXiv): https://arxiv.org/html/2511.23404v1

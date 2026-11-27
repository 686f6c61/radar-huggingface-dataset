# GloathLtd/Sloneberg1.2

## Resumen

Sloneberg 1.2 es un modelo de lenguaje causal de tipo decoder-only desarrollado por Gloath Limited, una empresa con sede en Nueva Zelanda. Con 316.723.200 parámetros (aproximadamente 317M), se posiciona como un modelo pequeno orientado a conversacion y generacion de codigo corto, publicado como research preview. No deriva de ningun otro modelo: Gloath Limited entreno sus pesos desde cero y los publico en un layout compatible con Qwen3, lo que permite ejecutarlo en transformers, llama.cpp, LM Studio y Ollama sin codigo personalizado.

El modelo emplea una arquitectura transformer decoder-only de 24 capas, hidden size 1024, 16 cabezas de atencion (8 cabezas key-value), activacion SwiGLU, normalizacion RMSNorm, posiciones rotatorias y embeddings atados. Soporta una longitud de contexto de 16.384 tokens y un vocabulario de 32.768 tokens. Los pesos se distribuyen en bfloat16 safetensors (0,63 GB) y en tres cuantizaciones GGUF (F16, Q8_0 y Q4_K_M).

Su relevancia radica en su licencia Apache 2.0, que permite uso comercial, y en su reducido tamano, que lo hace apto para ejecucion local en hardware modesto. No obstante, el propio autor lo describe como un modelo de investigacion con limitaciones notables: errores factuales frecuentes, perdida de coherencia en respuestas largas y soporte exclusivo de ingles. Fue publicado en noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, compatible con Qwen3: 24 capas, hidden size 1024, 16 cabezas de atencion (8 KV heads), SwiGLU, RMSNorm, posiciones rotatorias, embeddings atados |
| Parametros totales | 316.723.200 (317M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | bfloat16 (safetensors), F16 (GGUF), Q8_0 (GGUF), Q4_K_M (GGUF) |
| Idiomas soportados | Ingles; codigo en lenguajes de programacion comunes |
| Licencia | Apache License 2.0 |
| Formato de pesos | safetensors (bfloat16) y GGUF (F16, Q8_0, Q4_K_M) |

## Arquitectura y entrenamiento

Sloneberg 1.2 es un transformer decoder-only denso de 24 capas con hidden size de 1024 y 16 cabezas de atencion, de las cuales 8 son cabezas key-value (atencion GQA). Utiliza activacion SwiGLU, normalizacion RMSNorm, codificacion posicional rotatoria (RoPE) y embeddings atados entre la capa de entrada y la de salida. El vocabulario tiene 32.768 tokens y el formato de chat propio emplea marcadores `<|system|>`, `<|user|>`, `<|assistant|>` y `<|end|>`, con `<|endoftext|>` como token inicial.

No se dispone de informacion publica sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste por instrucciones. La model card no detalla el proceso de entrenamiento mas alla de indicar que los pesos son propios y no derivan de otro modelo. Tampoco se mencionan innovaciones tecnicas como decodificacion especulativa o atencion lineal. La configuracion de generacion recomendada (temperatura 0,7, top-p 0,9, top-k 50, penalizacion por repeticion 1,1) esta incluida en `generation_config.json`.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte de dialogos multi-turno mediante su plantilla de chat propia.
- Generacion de fragmentos cortos de codigo en lenguajes de programacion comunes.
- Razonamiento basico y respuesta a preguntas simples, con fiabilidad limitada segun el propio autor.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingue muy limitada: solo ingles; otros idiomas produciran resultados pobres segun la model card.
- No dispone de vision, audio ni modo thinking explicito.
- Ejecutable en transformers (4.56.0 o superior), llama.cpp, LM Studio y Ollama.

## Casos de uso

- Prototipado rapido de asistentes conversacionales: el modelo puede mantener dialogos multi-turno simples en ingles con un contexto de 16.384 tokens, adecuado para validar interfaces de chat antes de migrar a modelos mayores.
- Educacion y aprendizaje: sirve para experimentar con inferencia local, plantillas de chat y cuantizaciones GGUF en entornos docentes sin coste de GPU.
- Experimentos de fine-tuning: sus 317M parametros y licencia Apache 2.0 permiten ajustarlo en una sola GPU consumer para tareas acotadas de dominio.
- Generacion de codigo auxiliar: puede producir snippets cortos en lenguajes comunes, util como autocompletado basico o para ejemplos en documentacion, siempre con revision manual.
- Ejecucion en dispositivos con recursos limitados: con Q4_K_M (0,20 GB) cabe en sistemas embebidos, Raspberry Pi o portatiles sin GPU dedicada, permitiendo asistentes offline.
- Pruebas de integracion de pipelines: su compatibilidad con llama.cpp, Ollama y TGI permite usarlo como modelo de sustitucion en el desarrollo de infraestructura de inferencia antes de desplegar modelos mayores.
- Demostraciones y demos web: el modelo esta disponible gratuitamente en ai.gloath.com, lo que facilita mostrar capacidades de IA generativa sin infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16/F16: aproximadamente 0,63 GB de pesos mas overhead de activaciones y cache KV; en la practica, menos de 2 GB.
- VRAM estimada en Q8_0: aproximadamente 0,34 GB de pesos; en torno a 1 GB con overhead.
- VRAM estimada en Q4_K_M: aproximadamente 0,20 GB de pesos; cabe en menos de 1 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100. Funciona en RTX 4090, RTX 3060, GTX 1650 e incluso en CPU.
- Cabe holgadamente en GPU consumer y en sistemas sin GPU dedicada (CPU con suficiente RAM).
- Opciones de despliegue: transformers, llama.cpp, LM Studio, Ollama y text-generation-inference (segun los tags del repositorio).
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera baja latencia en hardware consumer, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| Sloneberg 1.2 | 317M | 16.384 | Apache 2.0 | Ingles | Hugging Face, ai.gloath.com |
| Qwen3 (variantes pequenas) | No disponible en la informacion | No disponible | No disponible | No disponible | No disponible |
| SmolLM2 (variantes pequenas) | No disponible en la informacion | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- El autor advierte explicitamente de que el modelo comete errores factuales con frecuencia y pierde el hilo en respuestas largas.
- Riesgo elevado de alucinacion: no debe usarse para consejo medico, legal, financiero ni de seguridad.
- Puede generar texto sesgado u ofensivo; se recomienda revision y filtrado en produccion.
- Soporte exclusivo de ingles: otros idiomas produciran resultados pobres.
- Contexto limitado a 16.384 tokens, insuficiente para documentos largos o conversaciones extensas.
- El codigo generado debe probarse antes de usarse; no hay garantia de correccion.
- Licencia Apache 2.0 permite uso comercial incluyendo el archivo LICENSE y el NOTICE, pero no concede derechos sobre las marcas Gloath y GloathAI.
- Es un research preview: no hay garantia de mantenimiento, soporte ni actualizaciones.
- No se documentan capacidades de tool calling ni de agentes, por lo que no es adecuado para pipelines automatizados que requieran invocacion de funciones.

## Enlaces

- Hugging Face: https://huggingface.co/GloathLtd/Sloneberg1.2
- Demo web: https://ai.gloath.com
- Documentacion de transformers: https://huggingface.co/docs/transformers
- Repositorio llama.cpp (referenciado en la model card): no se proporciona URL directa en la informacion disponible
- LM Studio (referenciado en la model card): no se proporciona URL directa en la informacion disponible
- Ollama (referenciado en la model card): no se proporciona URL directa en la informacion disponible

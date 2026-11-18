# Gloath/Sloneberg1.18

## Resumen

Sloneberg 1.18 es un modelo de lenguaje causal de tipo decoder-only desarrollado por Gloath Limited (Nueva Zelanda), disenado como asistente conversacional y de programacion de pequeno tamano. Con 317 millones de parametros, se posiciona como un modelo "research preview" que prioriza la ligereza y la facilidad de despliegue en hardware modesto frente a la capacidad bruta. Emplea una arquitectura transformer compatible con el layout de Qwen3 (24 capas, hidden size 1024, 16 cabezas de atencion con 8 cabezas key-value, SwiGLU, RMSNorm, posiciones rotatorias y embeddings atados), lo que permite su ejecucion directa en transformers, llama.cpp, LM Studio y Ollama sin codigo personalizado.

El modelo resuelve el caso de uso de asistentes ligeros que deben ejecutarse integramente en local, con una longitud de contexto de 16.384 tokens y un vocabulario de 32.768 tokens. Su publicacion en noviembre de 2026 bajo licencia Apache 2.0 lo hace apto para experimentacion, ajuste fino y uso comercial sin restricciones de peso, aunque el propio autor advierte de que no debe emplearse en escenarios donde un error tenga consecuencias relevantes.

Es relevante ahora porque demuestra la viabilidad de entrenar modelos propios desde cero (los pesos no derivan de otro modelo, segun el autor) manteniendo compatibilidad con el ecosistema de inferencia existente, lo que reduce la friccion de adopcion para desarrolladores que quieren probar asistentes pequenos en entornos controlados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer, compatible con Qwen3 (24 capas, hidden size 1024, 16 cabezas de atencion, 8 cabezas key-value, SwiGLU, RMSNorm, posiciones rotatorias, embeddings atados) |
| Parametros totales | 316.723.200 (317M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | bfloat16 (safetensors), F16, Q8_0, Q4_K_M (GGUF) |
| Idiomas soportados | Ingles y codigo en lenguajes de programacion comunes |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16, 0,63 GB) y GGUF (F16 0,63 GB; Q8_0 0,34 GB; Q4_K_M 0,20 GB) |

## Arquitectura y entrenamiento

Sloneberg 1.18 es un transformer decoder-only de 24 capas con hidden size de 1024, 16 cabezas de atencion y 8 cabezas key-value (GQA), activacion SwiGLU, normalizacion RMSNorm, posiciones rotatorias y embeddings atados. El vocabulario es de 32.768 tokens y el contexto maximo de 16.384 tokens. La arquitectura se declara compatible con Qwen3, lo que significa que las herramientas de inferencia reconocen el modelo como `qwen3` y lo cargan sin adaptadores especificos.

El autor indica que los pesos fueron entrenados por Gloath Limited y no derivan de otro modelo. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO o ajuste por preferencias. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. El modelo se publica como "research preview", lo que sugiere un entrenamiento limitado en escala y en datos.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte de dialogos multi-turno mediante una plantilla de chat propia (`<|system|>`, `<|user|>`, `<|assistant|>`, `<|end|>`).
- Generacion de codigo en lenguajes de programacion comunes, segun declara el autor, aunque limitada a fragmentos cortos.
- Formato de chat integrado en el tokenizer y en los archivos GGUF, por lo que las aplicaciones de chat lo aplican automaticamente.
- Parametros de generacion recomendados incluidos en `generation_config.json`: temperatura 0,7, top-p 0,9, top-k 50 y penalizacion por repeticion 1,1.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni modo "thinking".
- Capacidad multilingue limitada al ingles; el autor advierte de que otros idiomas funcionaran mal.

## Casos de uso

- Asistente conversacional local: el modelo puede mantener dialogos simples y responder preguntas generales en ingles ejecutandose integramente en un portatil con la version Q4_K_M (0,20 GB) o Q8_0 (0,34 GB), sin conexion a internet.
- Prototipado rapido de interfaces de chat: al integrarse en LM Studio, Ollama y llama.cpp sin codigo personalizado, permite validar flujos de conversacion y plantillas de chat antes de migrar a modelos mayores.
- Generacion de fragmentos de codigo cortos: util para autocompletar funciones sencillas o ejemplos en entornos de aprendizaje, con la advertencia de que el codigo debe probarse antes de usarlo.
- Experimentacion con ajuste fino: sus 317M de parametros y su licencia Apache 2.0 lo hacen adecuado para probar tecnicas de fine-tuning en hardware de consumo y validar pipelines de entrenamiento.
- Educacion e investigacion: sirve como modelo de referencia para estudiar el comportamiento de asistentes pequenos, medir alucinaciones y comparar con modelos de tamano similar.
- Despliegue en entornos con recursos muy limitados: con la cuantizacion Q4_K_M (0,20 GB) puede ejecutarse en dispositivos con poca memoria, como Raspberry Pi o telefonos de gama alta mediante llama.cpp.
- Base para asistentes de dominio especifico: tras un ajuste fino con datos propios, podria especializarse en tareas acotadas de atencion al cliente o soporte interno en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7 GB en bfloat16/F16, 0,4 GB en Q8_0 y 0,3 GB en Q4_K_M, incluyendo overhead de contexto y runtime.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100. Una RTX 3060, RTX 4090 o incluso una GPU integrada con suficiente memoria compartida pueden ejecutar el modelo.
- Cabe en GPU consumer: si, en practicamente todas las GPU con al menos 1 GB de memoria libre, y tambien en CPU.
- Opciones de despliegue: transformers 4.56.0 o superior, llama.cpp, LM Studio, Ollama y text-generation-inference (segun los tags del repositorio).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera una latencia baja en GPU y aceptable en CPU, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Sloneberg 1.18 | 317M | 16.384 | Apache 2.0 | Ingles | Research preview, compatible con Qwen3, pesos propios |
| Qwen3 (variantes pequenas) | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | Arquitectura de referencia del layout compatible |
| Modelos de ~300M de la familia GPT-2 | 124M-355M | 1.024-2.048 | MIT / modificada | Ingles | Referencia historica de modelos pequenos; contexto muy inferior |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- El autor advierte explicitamente de que el modelo a menudo se equivoca en datos facticos, pierde el hilo en respuestas largas y no debe usarse para nada importante.
- Riesgo elevado de alucinacion por su tamano reducido y su condicion de research preview.
- Solo soporta ingles; otros idiomas produciran resultados pobres.
- Puede generar texto sesgado u ofensivo; no se documentan medidas de mitigacion.
- No apto para consejo medico, legal, financiero o de seguridad.
- El codigo generado debe probarse antes de usarse en produccion.
- La licencia Apache 2.0 permite uso comercial, modificacion y redistribucion siempre que se incluya la licencia y el archivo NOTICE; no concede derechos sobre las marcas de Gloath Limited (Gloath, GloathAI).
- El modelo se publica como preview de investigacion; no hay garantias de mantenimiento ni de soporte.
- La plantilla de chat es propia y debe respetarse exactamente (sin espacios ni saltos de linea entre marcadores) para obtener resultados correctos.

## Enlaces

- Hugging Face: https://huggingface.co/Gloath/Sloneberg1.18
- Demo en navegador: https://ai.gloath.com
- Documentacion de transformers: https://huggingface.co/docs/transformers

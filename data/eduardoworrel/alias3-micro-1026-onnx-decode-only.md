# eduardoworrel/alias3-micro-1026-ONNX-decode-only

## Resumen

alias3-micro-1026-ONNX-decode-only es una exportación a ONNX del modelo aliasrobotics/alias3-micro-1026, desarrollado por Alias Robotics y orientado a tareas de ciberseguridad. La versión aquí descrita no es un modelo generativo completo, sino un conjunto de grafos ONNX en modo *decode-only*: cada llamada produce un único token y expone el estado oculto para que cabezas externas de decisión (System 1) puedan leerlo. Está pensada para ejecutarse en el navegador o en Node mediante ct0-edge, con onnxruntime-web y WebGPU.

El modelo base emplea una arquitectura de doble sistema (System 1 / System 2) inspirada en el marco de procesos duales de Kahneman, con una interfaz de *pointer head* bilineal descrita en el paper arXiv:2610.16550. El autor de la exportación (eduardoworrel) publica siete variantes de cuantización en ONNX, desde fp32 (19,37 GB) hasta q4 (3,03 GB), e incluye cabezas auxiliares (`head.bin`, `head_score.bin`) para clasificación de decisiones y de severidad.

La relevancia actual reside en que permite ejecutar un modelo especializado en ciberseguridad íntegramente en el cliente (Chrome con WebGPU, Node), sin depender de servidores, manteniendo una fidelidad de decisión estadísticamente indistinguible del original en las pruebas publicadas. El tag `qwen3_5_text` sugiere que la arquitectura subyacente deriva de la familia Qwen 3.5, aunque la model card no detalla los parámetros totales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (tag `qwen3_5_text`) con cabezas System 1 / System 2 y pointer head bilineal |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32, fp16, uint8, q8, q4, q4f16, bnb4 (NF4) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (con datos externos en un fichero por variante) |

## Arquitectura y entrenamiento

El modelo base sigue una formulación de doble proceso: un modo System 1 (respuesta rápida leída directamente de los logits) y un modo System 2 (razonamiento más elaborado), con una interfaz de *pointer head* bilineal tomada del linaje de TypeSafe AI y de los pointer networks de Vinyals et al. (2015). La exportación ONNX replica esta estructura en grafos *decode-only*: se invoca token a token y se expone el estado oculto para que las cabezas externas (`head.bin` para decisiones Sí/No y opción múltiple, `head_score.bin` para severidad) realicen la lectura final.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. La model card del exportador tampoco detalla innovaciones como decodificación especulativa o atención lineal; solo documenta el proceso de cuantización (optimum + parche propio para fp32, ORTQuantizer para uint8, scripts propios para fp16, q8, q4, q4f16 y bnb4).

## Capacidades

- Generación de texto token a token en modo decode-only (una llamada por token).
- Clasificación de decisiones binarias (Sí/No) mediante lectura de logits o de la cabeza `head.bin`.
- Respuesta a preguntas de opción múltiple mediante la misma interfaz de cabeza.
- Estimación de severidad (niveles 0-50) con `head_score.bin`, con precisión exacta y tolerancia ±1.
- Exposición del estado oculto para cabezas personalizadas de System 1.
- Ejecución en navegador (Chrome con WebGPU) y en Node mediante ct0-edge.
- Ejecución en servidor con onnxruntime CUDA (y CPU para uint8).
- Especialización declarada en ciberseguridad (tag `cybersecurity`).
- Soporte de tool calling, agentes o multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Clasificación de decisiones de seguridad en el navegador: usar `onnx/model_q4.onnx` (3,03 GB) con onnxruntime-web y WebGPU para responder preguntas Sí/No sobre incidentes sin enviar datos a un servidor, manteniendo 394/394 decisiones idénticas al servidor CUDA en las pruebas del autor.
- Triaje de severidad de alertas: aplicar `head_score.bin` sobre el estado oculto para asignar un nivel 0-50 a cada alerta; el autor advierte que es una prueba de concepto entrenada con 30 casos sintéticos y requiere un conjunto etiquetado mayor.
- Asistente local en Node para analistas: integrar el grafo decode-only en un servicio Node con ct0-edge para responder consultas de opción múltiple sobre políticas o configuraciones de seguridad, con latencia mediana de 20,7 s por decisión en un Apple M2 Pro.
- Evaluación de configuraciones en pipelines CI/CD: ejecutar el modelo en modo uint8 sobre CPU en runners para validar decisiones de seguridad de forma determinista, ya que uint8 cambia solo el 14,0 % de respuestas respecto al original.
- Despliegue en servidor con GPU: usar `onnx/model.onnx` (fp32, 19,37 GB) o `model_fp16.onnx` (8,42 GB) con onnxruntime CUDA para obtener la máxima fidelidad (0,6 % y 1,2 % de respuestas cambiadas respectivamente).
- Investigación sobre procesos duales: emplear la exposición del estado oculto y las cabezas para estudiar la contribución de System 1 frente a System 2 en tareas de ciberseguridad, comparando lecturas por logits y por cabeza.
- Prototipado de asistentes de seguridad embebidos: usar `model_q4f16.onnx` (2,73 GB) como variante más ligera que cabe en navegador y mantiene 54/65 en Sí/No con cabeza y 46/57 en opción múltiple.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto de decisión (Sí/No: 65 preguntas; opción múltiple: 57; severidad: 50). Se muestra la lectura por logits y por cabeza, y el porcentaje de respuestas cambiadas frente al original.

| Fichero | Sí/No logits | Sí/No head | Opción múltiple logits | Opción múltiple head | Severidad exacta logits | Severidad exacta head | Severidad ±1 head | Respuestas cambiadas |
|---|---|---|---|---|---|---|---|---|
| Original (PyTorch bf16) | 54/65 | 54/65 | 39/57 | 46/57 | 20/50 | 26/50 | 47/50 | — |
| model_q4f16 | 53/65 | 54/65 | 38/57 | 46/57 | 19/50 | 24/50 | 50/50 | 16,3 % |
| model_q4 | 55/65 | 54/65 | 39/57 | 48/57 | 20/50 | 26/50 | 47/50 | 17,4 % |
| model_fp16 | 54/65 | 54/65 | 39/57 | 47/57 | 20/50 | 27/50 | 47/50 | 1,2 % |
| model (fp32) | 54/65 | 54/65 | 39/57 | 47/57 | 20/50 | 26/50 | 47/50 | 0,6 % |
| model_bnb4 | 55/65 | 55/65 | 44/57 | 47/57 | 20/50 | 30/50 | 46/50 | 12,2 % |
| model_quantized | 54/65 | 55/65 | 40/57 | 44/57 | 21/50 | 27/50 | 46/50 | 2,9 % |
| model_uint8 | 55/65 | 51/65 | 37/57 | 46/57 | 19/50 | 22/50 | 47/50 | 14,0 % |

El autor indica que la precisión no es estadísticamente distinguible del original (0 de 70 pruebas pareadas de McNemar, antes y después de la corrección de Holm), aunque las decisiones individuales cambian entre el 0,6 % y el 17,4 % de las preguntas. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 19,37 GB en fp32; 8,42 GB en fp16; 4,91 GB en quantized; 4,85 GB en uint8; 3,03 GB en q4; 2,73 GB en q4f16 y bnb4.
- GPU recomendadas: A100 o H100 para fp32 y fp16 con onnxruntime CUDA; RTX 4090 suficiente para fp16 y cuantizaciones de 4 bits.
- Compatibilidad con GPU de consumo: sí para q4, q4f16 y bnb4 (2,73-3,03 GB), que caben en tarjetas con 4 GB o más de VRAM; también en navegador Chrome con WebGPU (límite de 4 GB por fichero).
- Despliegue: onnxruntime CUDA (servidor), onnxruntime-web 1.30 con WebGPU (navegador), ct0-edge (navegador y Node), onnxruntime CPU para uint8. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput medidos en Apple M2 Pro con Chrome WebGPU: carga de 12,0 s (q4f16), 12,3-34,1 s (q4) y 10,0-11,5 s (bnb4); tiempo mediano por decisión de 15,4 s (q4f16), 20,7 s (q4) y 29,5 s (bnb4), siempre token a token.
- Acuerdo navegador-servidor: 394/394 decisiones idénticas entre Chrome WebGPU y onnxruntime CUDA para q4f16, q4 y bnb4.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| alias3-micro-1026-ONNX-decode-only | no disponible | no disponible | Ciberseguridad, dual-system, decode-only | apache-2.0 | ONNX (7 dtypes) |
| aliasrobotics/alias3-micro-1026 (base) | no disponible | no disponible | Ciberseguridad, dual-system | no disponible en la información | PyTorch bf16 |
| eduardoworrel/alias3-micro-1026-ONNX (transformers.js) | no disponible | no disponible | Exportación ONNX para transformers.js | apache-2.0 (según repo) | ONNX |
| eduardoworrel/alias3-micro-1026-ONNX-genai | no disponible | no disponible | Exportación ONNX para GenAI | apache-2.0 (según repo) | ONNX |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoría (por ejemplo, otros modelos especializados en ciberseguridad o modelos Qwen 3.5 de tamaño similar) en la información proporcionada.

## Limitaciones y advertencias

- El modelo base está etiquetado por Alias Robotics como "research preview"; no debe asumirse robustez de producción.
- La cabeza de severidad (`head_score.bin`) es una prueba de concepto entrenada con 30 casos sintéticos; usarla como scorer de severidad exige un conjunto etiquetado mayor e independiente.
- El conjunto de prueba (50-65 preguntas por modo) solo detecta pérdidas grandes de precisión; cambios individuales de hasta el 17,4 % pueden pasar desapercibidos en la métrica agregada.
- El modo decode-only requiere gestión manual del estado y de la caché KV; no es un pipeline de generación de texto estándar.
- Las variantes de más de 4 GB (fp32, fp16, quantized, uint8) no caben en el navegador y solo se ejecutan en servidor.
- Riesgo de alucinación y sesgos: no documentado en la información disponible.
- Idiomas soportados: no disponible; no se garantiza cobertura multilingüe.
- Licencia apache-2.0 permite uso comercial, pero conviene verificar la licencia del modelo base (aliasrobotics/alias3-micro-1026), no indicada en la información disponible.
- No se documentan capacidades de tool calling, agentes ni multi-step reasoning; no deben asumirse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eduardoworrel/alias3-micro-1026-ONNX-decode-only
- Modelo base: https://huggingface.co/aliasrobotics/alias3-micro-1026
- Paper del modelo base: https://arxiv.org/abs/2610.16550
- Pointer networks (Vinyals et al., 2015): https://arxiv.org/abs/1506.03134
- Documentación de TypeSafe AI: https://docs.typesafe.ai
- Exportación ONNX para transformers.js: https://huggingface.co/eduardoworrel/alias3-micro-1026-ONNX
- Exportación ONNX para GenAI: https://huggingface.co/eduardoworrel/alias3-micro-1026-ONNX-genai
- Exportación MLC q4f32_1: https://huggingface.co/eduardoworrel/alias3-micro-1026-MLC-q4f32_1
- Exportación MLC q4f16_1: https://huggingface.co/eduardoworrel/alias3-micro-1026-MLC-q4f16_1
- Exportación LiteRT.js: https://huggingface.co/eduardoworrel/alias3-micro-1026-LiteRT

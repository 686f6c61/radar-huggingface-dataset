# litert-community/granite-4.2-3b

## Resumen

Granite 4.2-3B es un modelo de lenguaje compacto de razonamiento desarrollado por IBM, perteneciente a la familia Granite 4.2. Este repositorio concreto, `litert-community/granite-4.2-3b`, contiene la conversión del modelo original al formato **LiteRT-LM** (`.litertlm`), un runtime de Google para inferencia en dispositivos (on-device/edge). El modelo tiene 3.66 mil millones de parámetros densos, 40 capas, tamaño oculto de 2560, atención con GQA 40:8, embeddings no compartidos y un vocabulario de 100k tokens.

La relevancia de esta conversión radica en que permite ejecutar un modelo de razonamiento (thinking) en teléfonos móviles y hardware de borde, algo que tradicionalmente requería servidores. El bundle incluye dos versiones cuantizadas: una int4 de 2.19 GB pensada para dispositivos con poca memoria y una int8 de 3.76 GB que conserva casi toda la precisión del modelo original. Está licenciado bajo Apache 2.0, lo que facilita su uso comercial y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (40 capas, hidden 2560, GQA 40:8, embeddings no compartidos) |
| Parametros totales | 3.66 mil millones |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (presupuesto KV del bundle LiteRT-LM) |
| Tipos de cuantizacion | int4 blockwise-32 con OCTAV en lineales, int8 dinamico en lineales y embeddings |
| Idiomas soportados | No especificados (el modelo base Granite 4.2 es multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM) |

## Arquitectura y entrenamiento

El modelo base `ibm-granite/granite-4.2-3b` es un modelo denso decoder-only post-entrenado sobre Granite 4.1. IBM lo ha dotado de capacidades de razonamiento nativo: el modelo genera una cadena de pensamiento interna delimitada por las etiquetas ` thinking` y ` response` antes de emitir la respuesta final. La conversión a LiteRT-LM preserva este mecanismo declarando un canal de pensamiento (`thought`) en los metadatos del bundle, de modo que el runtime puede separar el razonamiento de la respuesta final y aplicar un presupuesto de pensamiento configurable.

No se dispone de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas como RLHF o DPO en la informacion proporcionada. La arquitectura es identica a la de Granite 4.1-3B, pero el post-entrenamiento anade la capacidad de razonamiento, lo que se refleja en una mayor sensibilidad a la cuantizacion int4 (pierde 11 puntos en GSM8K frente a los 4 puntos que perdia la version 4.1).

## Capacidades

- Razonamiento paso a paso (chain-of-thought) con canal de pensamiento separado, lo que permite al runtime leer o acotar el razonamiento interno.
- Generacion de texto con alta calidad para su tamano, incluyendo codigo, matematicas y dialogo multilingue.
- Soporte de tool use y comportamiento de agente, segun la documentacion de IBM para la familia Granite 4.2.
- Inferencia eficiente en dispositivos moviles y edge gracias a la cuantizacion y al formato LiteRT-LM.
- Compatibilidad con presupuestos de pensamiento (thinking budget) en runtimes que expongan `ThinkingConfig`.

## Casos de uso

- **Asistentes personales en movil**: el modelo cabe en un telefono (2.19 GB en int4) y puede responder preguntas con razonamiento sin conexion, por ejemplo en un asistente de viajes que explique rutas o compare opciones.
- **Atencion al cliente automatizada**: con su capacidad de razonamiento y tool use, puede gestionar consultas multi-turno en apps de mensajeria, integrando APIs de pedidos o devoluciones mediante function calling.
- **Tutor educativo offline**: el modelo desglosa problemas matematicos paso a paso (GSM8K 90% en int8), ideal para apps de aprendizaje sin acceso a servidores.
- **Generacion de codigo en entornos aislados**: programadores que trabajan en redes sin conexion pueden usarlo para completar o revisar fragmentos de codigo, apoyandose en su razonamiento interno.
- **Analisis de documentos en el borde**: procesamiento de contratos o informes en tablets o moviles corporativos, extrayendo conclusiones razonadas sin enviar datos a la nube.
- **Prototipado de agentes conversacionales**: desarrolladores pueden probar logicas de razonamiento y tool calling en hardware local antes de escalar a modelos mayores.

## Benchmarks y rendimiento

La model card proporciona resultados de GSM8K (greedy, 0-shot chain-of-thought, max_tokens 2048, n=100) comparando las versiones cuantizadas con la referencia en bf16:

| Configuracion | GSM8K |
|---|---|
| PyTorch bf16 (referencia) | 91.0% |
| LiteRT int8 | 90.0% |
| LiteRT int4 (block-32) | 80.0% |
| LiteRT int4 (block-128) | 81.0% |

Ambas versiones LiteRT superan una compuerta de correccion de 8 preguntas en CPU y GPU (Apple M4 Max, Galaxy S26, iPhone 17 Pro), con 8/8 en la mayoria de configuraciones. La unica excepcion fue Metal GPU en iPhone 17 Pro con int4 (7/8, fallo en una linea de rima del prompt compuesto).

Rendimiento de inferencia medido con `litert-lm benchmark` en Apple M4 Max (prefill 256, decode 256, max 1024 tokens):

| Archivo | Backend | Prefill (256) | Decode | TTFT | Init |
|---|---|---|---|---|---|
| int4 | GPU (Metal) | 1240 tok/s | 85.5 tok/s | 0.24 s | 4.4 s |
| int4 | CPU | 106 tok/s | 21.5 tok/s | 2.94 s | 6.9 s |
| int8 | GPU (Metal) | 1208 tok/s | 70.7 tok/s | 0.24 s | 3.5 s |
| int8 | CPU | 264 tok/s | 21.1 tok/s | 2.61 s | 23.0 s |

En Galaxy S26 (Snapdragon SM8850, Adreno) con int4: prefill 235-241 tok/s en GPU OpenCL, decode 12.3-15.6 tok/s, TTFT 0.93-0.94 s, init 13.6-15.7 s.

## Requisitos de hardware

- **Tamano en disco**: 2.19 GB (int4) y 3.76 GB (int8). La RAM/VRAM necesaria sera ligeramente superior a estos valores.
- **GPUs soportadas**: cualquier GPU compatible con Metal (Apple Silicon), OpenCL (Adreno, Mali) o XNNPACK (CPU). Probado en Apple M4 Max, Galaxy S26 (Adreno) e iPhone 17 Pro.
- **Cabe en GPUs de consumo**: si, tanto en moviles como en portatiles con GPU integrada o dedicada de al menos 4 GB.
- **Opciones de despliegue**: exclusivamente mediante el runtime LiteRT-LM (`litert-lm run`). No es compatible con vLLM, Ollama o llama.cpp al ser un formato propietario.
- **Latencia**: TTFT de 0.24 s en M4 Max GPU, decode de 85.5 tok/s (int4). En movil, decode de 12-15 tok/s, suficiente para interaccion conversacional.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K (0-shot CoT) | Licencia | Formato |
|---|---|---|---|---|---|
| Granite 4.2-3B (bf16) | 3.66B | no disponible | 91.0% | Apache 2.0 | PyTorch |
| Granite 4.2-3B LiteRT int8 | 3.66B | 4096 (bundle) | 90.0% | Apache 2.0 | .litertlm |
| Granite 4.2-3B LiteRT int4 | 3.66B | 4096 (bundle) | 80.0% | Apache 2.0 | .litertlm |
| Granite 4.1-3B (referencia) | 3.66B | no disponible | no disponible (int4 perdia 4 puntos) | Apache 2.0 | PyTorch |

No se dispone de datos comparativos con otros modelos de razonamiento del mismo tamano (p. ej., Qwen3-4B, Llama-3.2-3B) en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion int4 reduce significativamente la precision en razonamiento (80% vs 91% en GSM8K). Para aplicaciones donde la exactitud es critica, se recomienda usar int8.
- El modelo requiere un presupuesto de generacion generoso (≥2048 tokens); si se trunca a mitad del razonamiento, no produce respuesta final.
- El bundle fija un presupuesto KV de 4096 tokens, lo que limita la longitud de contexto efectiva en despliegues on-device.
- En iPhone 17 Pro con Metal GPU, la compuerta de 8 preguntas fallo en una pregunta especifica (linea de rima); el modelo responde correctamente cuando se le pregunta de forma aislada.
- La licencia Apache 2.0 permite uso comercial, pero el formato `.litertlm` y el runtime LiteRT-LM son propiedad de Google y pueden tener restricciones de plataforma (requieren el entorno LiteRT).
- No se han documentado sesgos especificos, pero como todo modelo de lenguaje pequeno, puede presentar alucinaciones y errores en dominios especializados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/litert-community/granite-4.2-3b
- Modelo base (IBM Granite 4.2-3B): https://huggingface.co/ibm-granite/granite-4.2-3b
- Documentacion oficial de IBM Granite 4.2: https://www.ibm.com/granite/docs/models/granite4-2
- Repositorio GitHub de Granite 4.2: https://github.com/ibm-granite/granite-4.2-language-models
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm

# Mincofficial/Minico-M1-1105-ONNX

## Resumen

Minico M1 1105 ONNX es la distribución en formato ONNX de Minico M1 1105, un modelo de razonamiento de 350 millones de parámetros desarrollado por Mincofficial. Se trata de un ajuste fino del modelo LFM2.5-350M de Liquid AI, sobre el que se han aplicado técnicas de SFT, DPO y GRPO, además de fusión de pesos, para dotarlo de un modo de razonamiento explícito con cinco niveles de esfuerzo configurables (`off`, `low`, `medium`, `high`, `max`).

La relevancia de esta versión concreta reside en su orientación a la inferencia en el navegador y en dispositivos locales: los pesos se han exportado a ONNX y cuantizado en bloques de 32, de modo que el modelo puede ejecutarse con Transformers.js sobre WebGPU (Chrome y Edge 113 o superior, Safari 26) o, en su defecto, sobre WASM. El artefacto de 8 bits ocupa 510 MB, lo que lo hace viable en equipos de consumo sin GPU dedicada de gama alta.

El modelo está pensado para generación de texto conversacional y razonamiento en inglés, con una longitud de contexto que no se especifica en la información disponible. Su licencia LFM Open License v1.0 permite uso comercial a organizaciones por debajo del umbral de ingresos definido en el texto de la licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de LFM2.5-350M de Liquid AI; detalles internos no disponibles) |
| Parametros totales | 350M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | q8 (8 bits, 510 MB), q4 (4 bits, 294 MB), fp32 (1.451 MB); cuantizacion en bloques de 32 con MatMulNBits y GatherBlockQuantized para embeddings |
| Idiomas soportados | Inglés (`en`) |
| Licencia | LFM Open License v1.0 (uso comercial permitido bajo umbral de ingresos) |
| Formato de pesos | ONNX (`model_quantized.onnx`, `model_q4.onnx`, `model.onnx`) |

## Arquitectura y entrenamiento

El modelo base es LFM2.5-350M de Liquid AI, un transformer de 350 millones de parámetros. Minico M1 1105 se obtiene mediante ajuste fino supervisado (SFT), optimización directa de preferencias (DPO) y GRPO, seguido de fusión de pesos. La información disponible no detalla la composición del dataset de entrenamiento ni el número de tokens utilizados.

La innovación principal es el mecanismo de niveles de esfuerzo de razonamiento, controlado desde la plantilla de chat mediante el parámetro `reasoning_effort`. El modelo fue entrenado con conversaciones que mantienen un único nivel de esfuerzo de principio a fin, lo que condiciona su uso en producción: no se recomienda cambiar de nivel a mitad de una conversación. La exportación ONNX reutiliza el grafo de Liquid AI para LFM2.5-350M, sustituyendo los pesos por los de Minico M1 1105 y verificando la salida token a token contra el modelo original en PyTorch.

## Capacidades

- Generación de texto conversacional en inglés con soporte multi-turno.
- Razonamiento explícito con cinco niveles de esfuerzo (`off`, `low`, `medium`, `high`, `max`) y alias adicionales (`none`, `minimal`, `xhigh`, entre otros) y `enable_thinking=False`.
- Resolución de problemas aritméticos y de razonamiento cotidiano (el ejemplo de la model card es un cálculo de descuento).
- Ejecución en el navegador mediante Transformers.js con WebGPU, o con WASM como alternativa más lenta.
- Inferencia local sin envío de datos a servidores externos (según la demo del autor).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni capacidades multilingües más allá del inglés.

## Casos de uso

- Asistente conversacional embebido en una aplicación web: el modelo se carga con Transformers.js en el navegador del usuario y responde sin que los mensajes salgan del dispositivo, lo que simplifica el cumplimiento de requisitos de privacidad.
- Resolución de dudas aritméticas y de razonamiento cotidiano en una interfaz de ayuda: con `reasoning_effort: "medium"` y un límite de 1152 tokens nuevos, el modelo produce un razonamiento breve seguido de la respuesta, adecuado para consultas de un solo turno.
- Clasificación y reescritura de texto en herramientas internas: al ejecutarse en local con el build `q4` de 294 MB, puede integrarse en extensiones de navegador o aplicaciones de escritorio con recursos limitados.
- Prototipado educativo de modelos de razonamiento: los cinco niveles de esfuerzo permiten demostrar en el aula cómo varía la longitud y la profundidad del razonamiento sin infraestructura de servidor.
- Moderación o preprocesado de texto en el cliente: con `reasoning_effort: "off"` el modelo responde de inmediato (bloque de pensamiento vacío precargado) y limita la generación a 1024 tokens, lo que reduce la latencia en tareas simples.
- Demos y pruebas de concepto de inferencia en WebGPU: el repositorio incluye tres builds con distintos compromisos de tamaño y fidelidad, útiles para evaluar el rendimiento de ONNX Runtime en hardware de consumo antes de invertir en infraestructura.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros). El único dato de rendimiento disponible es la tasa de coincidencia de la salida ONNX con la salida greedy del modelo en PyTorch, medida sobre 6 prompts y 433 tokens con ONNX Runtime 1.31 en CPU:

| Build | dtype | Peso | Tamano | Coincidencia con PyTorch |
|---|---|---|---|---|
| `model_quantized.onnx` | q8 | 8 bits | 510 MB | 94,9 % |
| `model_q4.onnx` | q4 | 4 bits | 294 MB | 88,0 % |
| `model.onnx` | fp32 | precisión completa | 1.451 MB | 95,2 % |

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; por el tamaño de los artefactos, el build `q8` requiere alrededor de 510 MB de memoria y el `q4` alrededor de 294 MB, a los que hay que sumar el overhead del runtime y del tokenizador.
- GPU recomendadas: no se especifican modelos concretos. La ejecución con WebGPU requiere Chrome o Edge 113 o superior, o Safari 26.
- Compatibilidad con GPU de consumo: el tamaño reducido de los builds `q8` y `q4` sugiere que cabe en GPU integradas y en tarjetas de gama baja, aunque el autor no publica cifras de latencia ni de throughput.
- Opciones de despliegue: Transformers.js con `device: "webgpu"` o `device: "wasm"`; ONNX Runtime 1.31 en CPU para la verificación de la exportación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Minico M1 1105 ONNX | 350M | No disponible | ONNX (q8, q4, fp32) | LFM Open License v1.0 | Niveles de esfuerzo de razonamiento; orientado a navegador |
| LiquidAI/LFM2.5-350M | 350M | No disponible | PyTorch y ONNX (repo oficial) | No disponible en esta ficha | Modelo base; el grafo ONNX de Minico deriva del suyo |
| LiquidAI/LFM2.5-350M-ONNX | 350M | No disponible | ONNX | No disponible en esta ficha | Exportación oficial de Liquid AI; sin los ajustes de Minico |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de estos modelos entre sí.

## Limitaciones y advertencias

- Solo soporta inglés; no se documentan capacidades multilingües.
- La longitud de contexto no se especifica, lo que dificulta planificar conversaciones largas o tareas con documentos extensos.
- El modelo fue entrenado con un único nivel de esfuerzo por conversación; cambiar `reasoning_effort` a mitad de un chat puede degradar la calidad de las respuestas.
- Los valores desconocidos de `reasoning_effort` recaen silenciosamente en `medium`, lo que puede enmascarar errores de configuración.
- El build `q4` presenta una coincidencia del 88,0 % con la salida de PyTorch, inferior a la del `q8` (94,9 %); el autor recomienda `q8` salvo que el tamaño de descarga sea prioritario.
- Incluso el build fp32 se queda en un 95,2 % de coincidencia por diferencias de coma flotante entre runtimes, de modo que no reproduce exactamente la salida de PyTorch.
- Riesgo de alucinación inherente a un modelo de 350M; no se documentan evaluaciones de sesgo ni de robustez.
- La licencia LFM Open License v1.0 limita el uso comercial gratuito a organizaciones por debajo de un umbral de ingresos; es necesario leer el texto completo antes de un despliegue comercial.
- Sin WebGPU, la ejecución en WASM es notablemente más lenta según el propio autor.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria todavía inexistente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Mincofficial/Minico-M1-1105-ONNX
- Modelo base en HuggingFace: https://huggingface.co/Mincofficial/Minico-M1-1105
- Demo en navegador: https://minico.mincoffical.codes/try/
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-350M
- Exportación ONNX oficial de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-350M-ONNX
- Documentación de Transformers.js: https://huggingface.co/docs/transformers.js

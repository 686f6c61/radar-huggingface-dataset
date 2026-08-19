# ProCreations/grug-v1.1-qwen-3.8-27b-gguf

## Resumen

grug-v1.1-qwen-3.8-27b-gguf es una versión cuantizada en formato GGUF del modelo grug-v1.1-qwen-3.8-27b, un fine-tune del modelo Qwen 3.8 27B desarrollado por ProCreations. El modelo está diseñado para ser token-efficient en tareas de razonamiento y agente, reduciendo drásticamente el número de tokens de pensamiento en comparación con el modelo base. Según la model card, grug gasta 20 tokens de pensamiento en pasos de agente frente a los 108.5 del modelo base, y 79.5 en HumanEval frente a 559. Esto lo hace especialmente atractivo para despliegues en entornos con restricciones de latencia o coste por token.

El modelo base Qwen 3.8 27B es un transformer denso de 27B parámetros con capacidades de visión (image-text-to-text) y una ventana de contexto de 262k tokens según fuentes externas. La versión GGUF se distribuye en varias cuantizaciones (Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M) e incluye un proyector de visión (mmproj) para uso multimodal. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con encoder de vision (basado en Qwen 3.8 27B) |
| Parametros totales | 26.895.998.464 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262k (modelo base Qwen 3.8 27B, segun fuentes externas; no confirmado en la model card) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Qwen 3.8 27B, un transformer denso de 27B parametros con capacidades multimodales (vision y texto). La arquitectura base incluye un encoder de vision que permite procesar imagenes junto con texto. El fine-tune, denominado "grug", se ha entrenado para reducir el overthinking: el modelo razona internamente en un estilo "caveman" dentro de etiquetas `thinking` y luego responde en ingles normal. Los datos de entrenamiento, el numero de tokens y el proceso de alineacion (RLHF, DPO, etc.) no estan disponibles en la informacion proporcionada. La model card indica que el modelo fue construido con llama.cpp (commit `7c35571e`) y que cada cuantizacion fue probada con `llama-bench` antes de su publicacion.

## Capacidades

- Generacion de texto y razonamiento: el modelo produce respuestas en ingles, con un modo de razonamiento interno en estilo "caveman" que reduce el numero de tokens de pensamiento.
- Tool calling / function calling: soportado, con un rendimiento notable en seleccion de herramientas (97.1 de precision con "medium reasoning effort").
- Capacidades de agente: disenado para tareas multi-paso, con un consumo de tokens de razonamiento muy inferior al modelo base (20 vs 108.5 tokens por paso).
- Vision: incluye un proyector de vision (mmproj) que permite procesar imagenes, aunque la model card no detalla el alcance de esta capacidad.
- Token-efficient: optimizado para reducir el coste computacional y la latencia en inferencia.
- Multilingue: solo ingles declarado en las etiquetas del modelo.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 262k tokens) y su eficiencia de tokens reduce el coste por interaccion en despliegues a gran escala.
- Agentes con tool calling: su precision en seleccion de herramientas (97.1 con medium reasoning) lo hace adecuado para pipelines de automatizacion que requieren llamadas a APIs o ejecucion de acciones.
- Generacion de codigo en produccion: con un consumo de tokens de razonamiento 7 veces menor que el modelo base en HumanEval, es util para integracion en IDEs o CI/CD donde la latencia importa.
- Analisis de imagenes con texto: gracias al mmproj, puede procesar capturas de pantalla, diagramas o fotografias junto con instrucciones en texto, por ejemplo para documentacion tecnica automatizada.
- Asistentes de productividad: su capacidad de razonamiento eficiente lo hace apto para resumir documentos largos, extraer informacion o generar informes sin agotar el presupuesto de tokens.
- Prototipado rapido en entornos con recursos limitados: las cuantizaciones Q4_K_M (16.5 GB) y Q3_K_M (13.3 GB) permiten ejecutar el modelo en GPUs de consumo, facilitando pruebas locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card incluye datos de eficiencia de tokens y rendimiento en tool picking, que se resumen a continuacion:

| Metrica | grug-v1.1 (medium effort) | grug-v1.1 (xhigh effort) | Qwen 3.8 27B (base) |
|---|---|---|---|
| Tokens de razonamiento en paso de agente | 20 | no disponible | 108.5 |
| Tokens de razonamiento en HumanEval | 79.5 | no disponible | 559 |
| Precision en tool picking | 97.1 | 76.5 | no disponible |

Estos datos provienen de la model card del autor y no han sido verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: segun el archivo GGUF, Q4_K_M (16.5 GB) cabe en una GPU de 24 GB (RTX 3090/4090); Q3_K_M (13.3 GB) cabe en 16 GB; Q5_K_M (19.2 GB) requiere 24 GB o mas; Q6_K (22.1 GB) y Q8_0 (28.6 GB) necesitan 32 GB o multiples GPUs.
- GPU recomendadas: RTX 3090, RTX 4090, A100 40GB, H100 (para cuantizaciones altas).
- Compatibilidad con consumer GPU: si, con cuantizaciones Q4_K_M o inferiores en GPUs de 16-24 GB.
- Opciones de despliegue: llama.cpp (llama-cli, llama-mtmd-cli para vision), compatible con servidores como llama-server. No se menciona soporte para vLLM u Ollama en la model card, aunque el formato GGUF es compatible con Ollama si se importa manualmente.
- Latencia y throughput: no disponibles. La model card solo indica que cada cuantizacion fue probada con `llama-bench`, pero no publica los resultados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Diferencia clave |
|---|---|---|---|---|---|
| grug-v1.1-qwen-3.8-27b (GGUF) | 26.9B | 262k (base) | Apache 2.0 | GGUF | Fine-tune token-efficient, menor overthinking |
| Qwen 3.8 27B (base) | 27B | 262k | Apache 2.0 | Safetensors | Modelo original, mayor consumo de tokens de razonamiento |
| Qwen 3.6 27B (predecesor) | 27B | no disponible | Apache 2.0 | Safetensors | Version anterior, sin vision segun fuentes |

No se dispone de datos de rendimiento comparativo en benchmarks estandar para estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos especificos, pero al ser un fine-tune de Qwen 3.8 27B, hereda los sesgos potenciales del modelo base.
- Riesgo de alucinacion: no se ha evaluado especificamente; se recomienda validar las respuestas en entornos de produccion.
- Limitaciones de contexto: aunque el modelo base soporta 262k tokens, la model card no confirma que el fine-tune mantenga esa longitud completa; se recomienda probar con contextos largos antes de desplegar.
- Idioma: solo ingles declarado; el rendimiento en otros idiomas no esta garantizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe mantener el aviso de copyright y la atribucion.
- Advertencia de razonamiento: la model card advierte que usar "xhigh reasoning effort" degrada la precision en tool picking (76.5 vs 97.1), por lo que se recomienda usar "medium" para tareas de agente.
- Dependencia de llama.cpp: el formato GGUF esta optimizado para llama.cpp; otras herramientas pueden no ser compatibles o requerir conversion.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/ProCreations/grug-v1.1-qwen-3.8-27b-gguf
- Modelo base (safetensors): https://huggingface.co/ProCreations/grug-v1.1-qwen-3.8-27b
- Modelo grug-27b-v1.1 (safetensors): https://huggingface.co/ProCreations/grug-27b-v1.1
- Modelo grug-27b (safetensors): https://huggingface.co/ProCreations/grug-27b
- Articulo de Simon Willison sobre Qwen 3.8 27B: https://simonwillison.net/2026/Aug/16/qwen-38-27b/
- Analisis de Qwen 3.8 27B (specs y hardware): https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026

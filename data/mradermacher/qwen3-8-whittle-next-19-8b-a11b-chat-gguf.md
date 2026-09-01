# mradermacher/Qwen3.8-Whittle-Next-19.8B-A11B-chat-GGUF

## Resumen

Qwen3.8-Whittle-Next-19.8B-A11B-chat es un modelo de lenguaje experimental de la serie Qwen3.8, desarrollado por logic65 y cuantizado a formato GGUF por mradermacher. Forma parte de la familia de modelos que sirven como avance de la arquitectura Qwen4, e incorpora innovaciones como mixture-of-experts (MoE), hyper-connections y n-gram-memory, además de técnicas de compresión de modelo (el nombre "Whittle" sugiere poda o reducción). Con 19.800 millones de parámetros totales y 11.000 millones activos, ofrece un equilibrio entre capacidad y eficiencia computacional.

Este repositorio concreto contiene las cuantizaciones GGUF estáticas del modelo base, lo que permite su ejecución en hardware de consumo mediante motores de inferencia como llama.cpp u Ollama. La licencia Apache 2.0 facilita su uso comercial y de investigación. Al ser un modelo experimental, su documentación es limitada, pero los tags indican que está orientado a investigación en compresión y arquitecturas híbridas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con hyper-connections y n-gram-memory |
| Parametros totales | 19.774.844.160 (19,8B) |
| Parametros activos | 11B (A11B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base (logic65/Qwen3.8-Whittle-Next-19.8B-A11B-chat) es un MoE con 19,8B parametros totales y 11B activos. Los tags indican el uso de hyper-connections (conexiones residuales alternativas a las tradicionales) y n-gram-memory (mecanismo de memoria basado en n-gramas), junto con tecnicas de compresion de modelo. No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens procesados ni el uso de RLHF o DPO. Al ser un modelo experimental de la serie Qwen3.8, se espera que comparta algunas innovaciones con Qwen3.8-Flash-Next, como la atencion hibrida Gated DeltaNet + Gated Attention, aunque no se confirma para este modelo concreto.

## Capacidades

- Generacion de texto y conversacion en ingles (idioma declarado).
- Arquitectura MoE con 11B parametros activos, lo que permite inferencia mas rapida que un modelo denso del mismo tamano total.
- Soporte de chat (variante "chat" del modelo base).
- Posible soporte de razonamiento y tareas de lenguaje general, aunque no se han publicado benchmarks especificos.
- No se ha confirmado soporte de tool calling, funciones multimodales o modo thinking.

## Casos de uso

- Despliegue en entornos con recursos limitados: gracias a las cuantizaciones GGUF (desde 9,4 GB en Q2_K hasta 21,3 GB en Q8_0), el modelo puede ejecutarse en GPUs de consumo como RTX 3060 (12 GB) o RTX 4090 (24 GB) usando llama.cpp u Ollama.
- Prototipado rapido de aplicaciones conversacionales: al ser un modelo chat, puede integrarse en chatbots o asistentes virtuales para pruebas de concepto.
- Investigacion en compresion de modelos: al ser un modelo experimental con tecnicas de poda y compresion, es util para estudiar el impacto de estas tecnicas en la calidad de salida.
- Evaluacion de arquitecturas MoE con hyper-connections: investigadores pueden comparar su rendimiento con otros MoE de tamano similar.
- Generacion de texto en ingles para tareas de redaccion, resumen o traduccion (aunque solo se declara ingles).
- Experimentacion con cuantizacion: los distintos niveles de cuantizacion permiten analizar la relacion entre tamaño, velocidad y calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: segun el archivo GGUF, Q2_K (9,4 GB) cabe en GPUs con 12 GB de VRAM; Q4_K_M (13,3 GB) requiere al menos 16 GB; Q8_0 (21,3 GB) necesita 24 GB o mas.
- GPUs recomendadas: RTX 3060/4060 (12 GB) para cuantizaciones bajas; RTX 4090 (24 GB) para Q8_0; A100 o H100 para despliegues con mayor margen.
- En consumer GPU: si, con cuantizaciones Q4_K_M o inferiores en GPUs de 16 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier motor compatible con GGUF. vLLM no soporta GGUF directamente, pero puede usarse el modelo base en safetensors si se convierte.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-Whittle-Next-19.8B-A11B-chat (este) | 19,8B | 11B | no disponible | Apache 2.0 | GGUF |
| Qwen3.8-Flash-Next (MoE multimodal) | no disponible | no disponible | no disponible | Apache 2.0 (presumible) | safetensors/GGUF |
| Qwen3-30B-A3B (MoE) | 30B | 3B | 32K (segun documentacion) | Apache 2.0 | safetensors/GGUF |

No se dispone de datos de rendimiento comparativo entre estos modelos.

## Limitaciones y advertencias

- Modelo experimental: al ser parte de la serie Qwen3.8 con fines de investigacion, puede presentar comportamientos inestables o menor calidad que modelos estables de la serie Qwen3.
- Idioma limitado: solo se declara ingles; el rendimiento en otros idiomas no esta garantizado.
- Sin benchmarks publicados: no hay evidencia objetiva de su calidad en tareas estandar.
- Riesgo de alucinacion: como todo LLM, puede generar informacion falsa o inventada.
- Sesgos: no se han documentado sesgos especificos, pero al ser un modelo entrenado con datos web, puede heredar sesgos comunes.
- Cuantizaciones estaticas: los archivos GGUF de este repositorio son cuantizaciones estaticas sin imatrix, lo que puede afectar a la calidad en niveles bajos (Q2_K, Q3_K).
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base puede tener condiciones adicionales no documentadas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-Whittle-Next-19.8B-A11B-chat-GGUF
- Modelo base: https://huggingface.co/logic65/Qwen3.8-Whittle-Next-19.8B-A11B-chat
- Repositorio de Qwen3.8-Flash-Next (referencia de la serie): https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Pagina de Qwen3.8 en OpenLM.ai: https://openlm.ai/qwen3.8/

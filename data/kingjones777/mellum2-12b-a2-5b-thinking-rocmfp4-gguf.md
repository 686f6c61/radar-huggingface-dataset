# kingjones777/Mellum2-12B-A2.5B-Thinking-ROCmFP4-GGUF

## Resumen

Mellum2-12B-A2.5B-Thinking-ROCmFP4-GGUF es una cuantización en formato GGUF de 4 bits del modelo base JetBrains/Mellum2-12B-A2.5B-Thinking, realizada específicamente para la arquitectura gráfica AMD gfx1151 (Ryzen AI MAX+ 395 / Strix Halo). El modelo base es un transformador de mezcla de expertos (MoE) con 12 149 millones de parámetros totales y aproximadamente 2 500 millones de parámetros activos, orientado a generación de texto y código, con un modo de razonamiento explícito (Thinking) en su nombre. El autor de la cuantización, kingjones777, ha aplicado un tipo de cuantización propietario denominado ROCmFP4 en su variante COHERENT, que requiere un fork específico de llama.cpp con parches no fusionados en el upstream.

La relevancia de este modelo radica en que ofrece un rendimiento de inferencia notablemente alto en hardware AMD de última generación, con una velocidad medida de 104.99 tokens por segundo en un Ryzen AI MAX+ 395, superando en un 6.9 % a la cuantización Q4_K_M convencional. Sin embargo, esta optimización está fuertemente acoplada a una plataforma concreta (gfx1151 y ROCm 7.2.4), lo que limita su portabilidad a otros entornos. El repositorio incluye el archivo GGUF de 6.49 GiB, junto con parches y documentación técnica para su uso.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en transformer, con modo de razonamiento (Thinking) |
| Parametros totales | 12 149 923 072 (12.15 B) |
| Parametros activos | ~2.5 B (según denominación A2.5B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0_ROCMFP4_COHERENT (ftype 102); se menciona Q4_K_M como referencia comparativa |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con tipos ROCmFP4 propietarios) |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado desde cero, sino una cuantización del modelo base JetBrains/Mellum2-12B-A2.5B-Thinking. La arquitectura subyacente es un transformador de mezcla de expertos (MoE) con 12.15 mil millones de parámetros totales y aproximadamente 2.5 mil millones de parámetros activos por token, lo que sugiere un diseño tipo Mixtral o similar. El sufijo "Thinking" indica que el modelo incorpora un modo de razonamiento explícito, probablemente mediante cadenas de pensamiento (chain-of-thought) generadas antes de la respuesta final.

El autor de la cuantización partió de un archivo GGUF en BF16 de 22.6 GiB, considerado una fuente sin pérdida, y aplicó el tipo de cuantización ROCmFP4 en su variante COHERENT (tier 102). Este método es específico para la arquitectura AMD gfx1151 y utiliza una distribución de 4 bits optimizada para las unidades de cómputo de Strix Halo. No se han publicado detalles sobre el entrenamiento del modelo base, como el número de tokens, la composición del dataset o si se usaron técnicas de alineación (RLHF/DPO). El autor tampoco ha realizado ajustes adicionales; solo ha cuantizado y verificado la corrección con pruebas de hechos memorizados.

## Capacidades

- Generación de texto en inglés, con especialización en código y completado de código (según las etiquetas del repositorio).
- Modo de razonamiento "Thinking": el modelo genera pasos intermedios de razonamiento antes de emitir la respuesta final, lo que mejora la calidad en tareas complejas.
- Soporte de tool calling y function calling: no verificado, el autor indica que no se ha evaluado.
- Capacidades multilingües: solo inglés declarado.
- Capacidad de agentes y razonamiento multi-paso: no documentada explícitamente, pero plausible dado el modo Thinking.
- Compatible con el ecosistema llama.cpp mediante un fork específico con parches ROCmFPX.

## Casos de uso

- Completado de código en tiempo real en entornos de desarrollo integrado (IDE) sobre hardware AMD Strix Halo: el modelo puede generar sugerencias de código contextuales con baja latencia gracias a su velocidad de inferencia de ~105 tokens por segundo.
- Asistente de programación autónomo en inglés: puede responder preguntas técnicas, explicar fragmentos de código y proponer soluciones a problemas de programación, aprovechando su modo Thinking para razonar sobre el problema antes de responder.
- Generación de código en pipelines de integración continua (CI/CD): su capacidad de generación de texto y código permite automatizar la creación de tests, documentación o plantillas de código en repositorios.
- Chat técnico especializado en inglés para equipos de desarrollo que trabajan con AMD ROCm: el modelo puede servir como base para un chatbot interno de soporte técnico.
- Prototipado rápido de aplicaciones de lenguaje natural en hardware AMD unificado (APU con 128 GB de memoria): el modelo cabe en la memoria unificada y puede ejecutarse localmente sin GPU dedicada.
- Investigación en eficiencia de cuantización para arquitecturas MoE en hardware AMD: el repositorio sirve como referencia para estudiar el impacto del formato ROCmFP4 en rendimiento y calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (como MMLU, HumanEval o GSM8K) en la información disponible. El autor únicamente reporta mediciones de velocidad de inferencia en hardware específico:

| Build | Tamaño | Decode (mediana) | Rango |
|---|---|---|---|
| Q4_0_ROCMFP4_COHERENT | 6.4907 GiB | 104.99 tok/s | [104.96 – 105.73] |
| Q4_K_M | — | 98.17 tok/s | [98.16 – 98.87] |

La diferencia de +6.9 % es estadísticamente significativa (rangos disjuntos). El autor también verificó la corrección con tres pruebas de hechos memorizados: 17×23 → 391, capital de Japón → Tokio, días en 2024 → 366. No se realizaron pruebas de perplexity, contexto largo ni tool calling.

## Requisitos de hardware

- Hardware objetivo: AMD Ryzen AI MAX+ 395 (Strix Halo) con iGPU gfx1151 y 128 GB de memoria unificada.
- Software: ROCm 7.2.4 o superior, y un fork de llama.cpp con los tipos ROCmFP4 (repositorio charlie12345/ROCmFPX). El llama.cpp estándar no puede cargar este modelo.
- VRAM estimada: el archivo GGUF ocupa 6.49 GiB, por lo que cabe en cualquier GPU con al menos 8 GB de VRAM, pero la cuantización solo está optimizada para gfx1151.
- GPUs compatibles: únicamente AMD gfx1151. No es compatible con GPUs NVIDIA ni con otras arquitecturas AMD.
- Opciones de despliegue: llama.cpp con el fork ROCmFPX, usando la interfaz de línea de comandos o el servidor HTTP integrado.
- Latencia y throughput: ~105 tokens por segundo en decodificación medido en el hardware de referencia; la generación de prefijo no se ha medido.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos similares. El modelo base Mellum2-12B-A2.5B-Thinking no tiene benchmarks públicos en la información proporcionada, y la cuantización es específica de una plataforma, por lo que no se pueden comparar directamente con alternativas como Llama 3.1 8B, Qwen2.5 7B o Mixtral 8x7B en términos de calidad o rendimiento. Se indica "no disponible".

## Limitaciones y advertencias

- Requiere un fork específico de llama.cpp con parches no fusionados en el upstream; el uso con el llama.cpp estándar fallará.
- La cuantización ROCmFP4 solo funciona en hardware AMD gfx1151 (Ryzen AI MAX+ 395 / Strix Halo); no es portable a otras GPUs.
- No se han realizado pruebas de calidad exhaustivas: el autor admite que no se ha medido perplexity, ni calidad comparativa con el modelo base, ni comportamiento en contexto largo.
- No se ha evaluado el soporte de tool calling, a pesar de que el modelo base podría tenerlo.
- Solo soporta inglés declarado; el rendimiento en otros idiomas no está garantizado.
- La licencia Apache 2.0 se hereda del modelo base, pero se debe verificar si JetBrains impone restricciones adicionales sobre el uso comercial del modelo original.
- La verificación de corrección se limitó a tres hechos memorizados; un modelo dañado podría superar estas pruebas sin ser fiable.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kingjones777/Mellum2-12B-A2.5B-Thinking-ROCmFP4-GGUF
- Modelo base: https://huggingface.co/JetBrains/Mellum2-12B-A2.5B-Thinking
- Pull request de llama.cpp para la arquitectura Mellum: https://github.com/ggml-org/llama.cpp/pull/23966
- Repositorio ROCmFPX (fork de llama.cpp con tipos ROCmFP4): https://github.com/charlie12345/ROCmFPX

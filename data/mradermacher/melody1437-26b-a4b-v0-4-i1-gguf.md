# mradermacher/Melody1437-26B-A4B-v0.4-i1-GGUF

## Resumen

Melody1437-26B-A4B-v0.4-i1-GGUF es una cuantización en formato GGUF del modelo base ReadyArt/Melody1437-26B-A4B-v0.4, preparada por mradermacher con la técnica imatrix. El modelo base, desarrollado por ReadyArt, es un modelo de lenguaje de 25.233 millones de parámetros orientado a conversación, roleplay e instrucciones, con soporte de visión. Según su nombre, se trata de una arquitectura Mixture of Experts (MoE) con 26B parámetros totales y 4B activos (A4B), aunque esta característica no está confirmada en la documentación disponible.

La versión i1-GGUF incluye cuantizaciones de 2 a 4 bits con tamaños que van desde 10,7 GB hasta 16,9 GB, lo que permite su ejecución en hardware de consumo con suficiente memoria. El modelo está etiquetado como "unaligned" (sin alineación) y "explicit", lo que implica que no ha sido sometido a procesos de seguridad ni moderación de contenido. La licencia declarada es Apache 2.0, aunque aparecen etiquetas adicionales que sugieren condiciones particulares.

Su relevancia actual radica en ser una opción de modelo de rol y conversación de gran tamaño (26B) con cuantizaciones optimizadas para ejecución local, algo poco común en el ecosistema de modelos abiertos de este tipo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (MoE probable, segun nombre "A4B", no confirmado) |
| Parametros totales | 25.233.142.046 (aprox. 25,2B) |
| Parametros activos | 4B (inferido del nombre "A4B", no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K (10,7 GB), i1-IQ3_XXS (11,4 GB), i1-IQ3_M (12,5 GB), i1-Q3_K_M (13,4 GB), i1-Q4_K_S (15,6 GB), i1-Q4_K_M (16,9 GB) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (con etiquetas adicionales "Other License") |
| Formato de pesos | GGUF (safetensors en el repo base) |

## Arquitectura y entrenamiento

El modelo base Melody1437-26B-A4B-v0.4 es un modelo de lenguaje de 25,2B parametros cuya arquitectura concreta no se documenta en la informacion disponible. El nombre "A4B" sugiere una arquitectura Mixture of Experts con 4B parametros activos por token, comun en modelos recientes de gran tamano para reducir coste de inferencia. Los tags indican que se basa en la familia "gemma-4", lo que apunta a una arquitectura transformer de tipo decoder-only con atencion por ventanas deslizantes, aunque no se puede confirmar.

No se dispone de datos sobre el corpus de entrenamiento (numero de tokens, composicion del dataset) ni sobre el proceso de ajuste (RLHF, DPO, etc.). El modelo se presenta como "instruct" y "conversational", lo que indica un ajuste fino supervisado para dialogos. La etiqueta "unaligned" sugiere que no se aplicaron tecnicas de alineacion de seguridad, lo que explica la presencia de contenido explicito y "dangerous" en sus capacidades.

## Capacidades

- Generacion de texto conversacional y de roleplay (rol) con estilo natural y adaptativo.
- Soporte de instrucciones (instruct) para tareas generales de lenguaje.
- Capacidades de vision: el modelo base es un modelo multimodal (vision), aunque los archivos de proyeccion (mmproj) se encuentran en el repositorio estatico de cuantizaciones, no en esta version.
- Generacion de contenido explicito y adulto: el modelo no esta alineado, por lo que puede producir contenido sexual, violento o peligroso sin filtros.
- Sin informacion sobre soporte de tool calling o function calling.
- Sin informacion sobre capacidades de agente o razonamiento multi-paso.
- Multilingue limitado: solo se declara ingles.

## Casos de uso

- Roleplay y ficcion interactiva: el modelo puede mantener conversaciones con personajes, narrativas y guiones de forma coherente gracias a su tamano y ajuste conversacional. Adecuado para juegos de rol textuales y simulaciones de personajes.
- Generacion de contenido creativo explicito: para autores que necesitan generar ficcion adulta o erotica sin restricciones de censura, el modelo ofrece una alternativa local sin filtros.
- Prototipado de chatbots conversacionales: se puede integrar en aplicaciones de chat local mediante llama.cpp o Ollama para experimentar con sistemas de dialogos largos.
- Asistente de escritura no supervisado: util para brainstorming de ideas narrativas, descripciones y dialogos en entornos donde no se requiere moderacion de contenido.
- Investigacion sobre modelos no alineados: permite estudiar el comportamiento de modelos sin filtros de seguridad en entornos controlados de investigacion academica.
- Pruebas de cuantizacion y optimizacion local: al ser una cuantizacion imatrix, sirve para evaluar el impacto de distintas precisiones en calidad de respuesta con hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor de la cuantizacion no incluye datos de MMLU, HumanEval, GSM8K ni otros tests estandar. No es posible comparar el rendimiento con otros modelos de forma objetiva.

## Requisitos de hardware

- VRAM estimada para inferencia: los archivos GGUF van de 10,7 GB (Q2_K) a 16,9 GB (Q4_K_M). Con cuantizacion Q4_K_M se recomienda al menos 20 GB de memoria libre para evitar swapping.
- GPU recomendadas: RTX 4090 (24 GB) para cuantizaciones Q4; A100 40 GB o H100 para ejecutar sin limitaciones de memoria; RTX 3080/3090 (10-24 GB) para Q2 o IQ3.
- Puede ejecutarse en GPU de consumo con 16 GB o mas de VRAM, siempre que se elija la cuantizacion adecuada (Q4_K_S o inferior).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y otros motores compatibles con GGUF.
- Latencia y throughput estimados: no disponibles. En un RTX 4090 con Q4_K_M se puede esperar entre 20 y 40 tokens/s, pero no se ha medido oficialmente.

## Comparativa con modelos similares

No se dispone de datos de modelos directamente comparables con esta cuantizacion. Como referencia, otros modelos de roleplay de tamano similar incluyen:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Melody1437-26B-A4B-v0.4 (este) | 25,2B (MoE) | no disponible | Apache-2.0 | GGUF |
| Modelos de la serie Gemma (base) | 7B-27B | 8K-128K | Gemma License | safetensors |
| Modelos de roleplay de 20B-30B (ej. Mistral-7B fine-tuned) | 7B-30B | 4K-32K | varía | GGUF |

La falta de datos de contexto y benchmarks impide una comparacion rigurosa. El modelo destaca por su tamano (26B) y su naturaleza no alineada, algo poco comun en modelos abiertos.

## Limitaciones y advertencias

- Modelo no alineado: puede generar contenido explicito, violento o peligroso sin filtros. No debe desplegarse en entornos de produccion sin moderacion humana o filtros externos.
- Riesgo de alucinacion: al ser un modelo de conversacion sin ajuste de seguridad, es propenso a inventar informacion, especialmente en contextos factuales.
- Idioma limitado: solo soporta ingles; no es util para aplicaciones multilingue.
- Longitud de contexto desconocida: no se ha documentado, por lo que no se recomienda usarlo con ventanas largas sin pruebas previas.
- Licencia ambigua: aunque se declara Apache-2.0, aparecen etiquetas "Other License" y "nsfw" que podrian implicar restricciones adicionales de uso comercial o distribucion.
- Dependencia del modelo base: la cuantizacion GGUF hereda cualquier sesgo o defecto del modelo original ReadyArt, del que no se publican detalles de entrenamiento.
- Sin garantia de soporte de vision en esta cuantizacion: los archivos mmproj estan en el repositorio estatico, no en este, por lo que la funcionalidad de vision no esta disponible directamente.

## Enlaces

- Repositorio HuggingFace de la cuantizacion: https://huggingface.co/mradermacher/Melody1437-26B-A4B-v0.4-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/Melody1437-26B-A4B-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Melody1437-26B-A4B
- Cuantizaciones estaticas v0.4: https://huggingface.co/ReadyArt/Melody1437-26B-A4B-v0.4-GGUF
- Version v2.0 de la cuantizacion: https://huggingface.co/mradermacher/Melody1437-26B-A4B-v2.0-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF

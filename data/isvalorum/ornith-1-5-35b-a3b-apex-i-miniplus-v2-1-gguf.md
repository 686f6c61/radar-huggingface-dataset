# IsValorum/Ornith-1.5-35B-A3B-APEX-I-MiniPlus-V2.1-GGUF

## Resumen

Ornith-1.5-35B-A3B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por ornith-ai, con 35.505.251.456 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token (de ahí el sufijo A3B). Está construido sobre una arquitectura de la familia Qwen 3.5 MoE, según indican las etiquetas del repositorio (qwen35moe, qwen3_5_moe, qwen3.6), y combina capacidades de razonamiento, generación de texto, código, uso de herramientas y procesamiento multimodal de imagen a texto. La ficha que nos ocupa no es el modelo original, sino una cuantización GGUF personalizada publicada por IsValorum bajo el nombre comercial APEX-I-MiniPlus V2.1.

El interés de esta publicación reside en su enfoque de cuantización selectiva tensor a tensor: en lugar de aplicar un esquema plano de bits, el autor asigna precisiones diferenciadas a cada tensor de las 40 capas, los 256 micro-expertos y el bloque MTP (Multi-Token Prediction) integrado, con el objetivo de mantener una fidelidad cercana a Q6 dentro de un envoltorio de 14-15 GB. Según la model card, esta configuración permite ejecutar el contexto completo de 256K tokens en estaciones de trabajo con 24 GB de VRAM, lo que la convierte en una opción relevante para desarrolladores que quieren desplegar un MoE de 35B en hardware de consumo o en una única GPU profesional de gama media.

La licencia es MIT y el modelo declara soporte para trece idiomas (inglés, chino, español, francés, alemán, portugués, italiano, ruso, japonés, coreano, vietnamita, tailandés y árabe). El repositorio acumula 4.518 descargas y 12 me gusta en el momento de la consulta, con un tamaño total de 31,1 GB, lo que sugiere la presencia de varios archivos GGUF con distintos niveles de cuantización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (familia Qwen 3.5 MoE, etiquetada también como qwen3.6), con bloque MTP integrado |
| Parámetros totales | 35.505.251.456 |
| Parámetros activos | Aproximadamente 3B (sufijo A3B); no se detalla el número exacto en la información disponible |
| Longitud de contexto | 256K tokens (según la model card) |
| Tipos de cuantización | GGUF con esquema personalizado APEX-I-MiniPlus V2.1 (tensor a tensor, fidelidad objetivo Q5-Q6); no se listan los niveles estándar Q2-Q8 en la información disponible |
| Idiomas soportados | en, zh, es, fr, de, pt, it, ru, ja, ko, vi, th, ar |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer disperso de tipo Mixture-of-Experts con 40 capas, 256 micro-expertos y un bloque MTP (Multi-Token Prediction) integrado, según la descripción del mapa de cuantización de la model card. La activación de aproximadamente 3B parámetros por token permite un coste de cómputo por inferencia muy inferior al de un modelo denso de 35B, lo que explica que la cuantización pueda ejecutarse en GPUs de consumo. La presencia de MTP sugiere capacidad de decodificación especulativa o predicción multi-token, aunque la información proporcionada no detalla el mecanismo exacto ni su implementación en llama.cpp.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF, DPO u otro tipo de alineamiento en el modelo original. Tampoco se documenta en la información disponible la innovación técnica del entrenamiento base. Lo que sí está documentado es el proceso de cuantización: el autor declara haber calculado los archivos de forma independiente en clústeres de computación en la nube privados, financiados íntegramente de su bolsillo, y haber auditado el GGUF resultante tensor por tensor. La model card menciona también el uso de Unsloth Studio y de una matriz de importancia (imatrix) para guiar la asignación de bits.

## Capacidades

- Generación de texto conversacional multi-turno con contexto largo de hasta 256K tokens.
- Razonamiento explícito (etiqueta reasoning) y resolución de problemas de varios pasos.
- Generación y edición de código, con etiquetas específicas de coding y agentic.
- Uso de herramientas y function calling, orientado a flujos de agentes.
- Evaluación declarada en SWE-bench (etiqueta del repositorio; no se aportan cifras en la información disponible).
- Procesamiento multimodal de imagen a texto (pipeline image-text-to-text, etiquetas vision y multimodal).
- Soporte multilingüe en trece idiomas, incluido el español.
- Plantilla de chat compatible con agentes incluida en la model card.
- Compatibilidad con endpoints (etiqueta endpoints_compatible) para despliegue como servicio.

## Casos de uso

- Asistente de código en producción: el modelo puede integrarse en pipelines de CI/CD para revisar pull requests, sugerir parches y ejecutar tareas de refactorización guiadas por herramientas, aprovechando su soporte de function calling y su especialización declarada en SWE-bench.
- Agentes autónomos de resolución de incidencias: con 256K tokens de contexto, un agente puede mantener en memoria el historial completo de un repositorio, los logs de un fallo y las trazas de herramientas sin truncar información, lo que reduce la pérdida de contexto en tareas de depuración largas.
- Análisis de documentación técnica con imágenes: al aceptar entradas de imagen y texto, puede procesar diagramas de arquitectura, capturas de paneles de monitorización o esquemas de infraestructura junto con la documentación textual asociada.
- Atención al cliente multilingüe: los trece idiomas declarados permiten desplegar un único modelo para soporte en español, inglés, francés, alemán, portugués, italiano y otros mercados, con conversaciones multi-turno sobre bases de conocimiento extensas.
- Extracción de información de documentos largos: contratos, informes o expedientes de más de 200K tokens pueden procesarse en una sola pasada sin técnicas de recuperación fragmentada, útil en entornos legales, financieros o de auditoría.
- Despliegue en estación de trabajo con una sola GPU: gracias al envoltorio de 14-15 GB y a la posibilidad de descargar parte de los expertos a RAM del sistema, equipos con una RTX 4090 o una RTX 5090 pueden servir el modelo con contexto completo, lo que habilita prototipado y demos locales sin coste de nube.
- Generación de código asistida en IDE: la variante cuantizada puede ejecutarse en local con llama.cpp u Ollama, ofreciendo autocompletado y explicación de código sin enviar el código fuente a servicios externos.

## Benchmarks y rendimiento

La model card menciona una referencia a "Shortbench 97.9%" y a SWE-bench en el índice de navegación, pero no se incluyen en la información proporcionada las tablas con los resultados numéricos desglosados ni la metodología de evaluación. Tampoco se aportan cifras de MMLU, HumanEval o GSM8K para este modelo.

| Benchmark | Resultado | Notas |
|---|---|---|
| Shortbench | 97,9 % (citado en el índice de la model card) | Sin desglose ni condiciones de evaluación en la información disponible |
| SWE-bench | no disponible | Etiqueta presente en el repositorio, sin cifra publicada en la información proporcionada |
| WikiText-2 PPL | no disponible para este modelo | La model card compara otras publicaciones del autor contra GSQ-RCO IQ3_S (7,07), pero no aporta el valor de este modelo |
| MMLU, HumanEval, GSM8K | no disponible | No se han publicado resultados en la información disponible |

## Requisitos de hardware

- VRAM estimada: el envoltorio declarado es de 14-15 GB para los pesos cuantizados; con caché KV para 256K tokens la huella crece, pero la model card afirma que el contexto completo cabe en 24 GB de VRAM.
- GPU recomendadas: RTX 4090 (24 GB), RTX 5090 (32 GB) y GPUs profesionales como A100 o H100 para despliegues de mayor concurrencia; la model card incluye una sección específica de throughput para RTX 30, 40 y 50.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB o más según el autor; en GPUs de 16 GB sería necesario descargar capas a RAM del sistema.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, y servidores compatibles con endpoints; la model card no confirma soporte de vLLM o TGI para este archivo.
- Offload a RAM del sistema: soportado y documentado en la model card como modo de inferencia parcial para equipos con menos VRAM.
- Latencia y throughput: no se han publicado cifras concretas de tokens por segundo en la información disponible, aunque la model card remite a una sección de benchmarks de hardware que no se incluye en el extracto.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B APEX-I-MiniPlus V2.1 (esta ficha) | 35,5B | ~3B | 256K | MIT | GGUF | Cuantización selectiva 14-15 GB; multimodal |
| Qwen3.6-35B-A3B MTP APEX-I-MiniPlus V2.1 | 35B | ~3B | no disponible | MIT (según repositorio del autor) | GGUF | Misma familia base; el autor lo describe como MoE versátil para razonamiento, agentes y multimodal |
| Tiel Coder 35B-A3B APEX-I-MiniPlus V2.1 | 35B | ~3B | no disponible | no disponible | GGUF | Variante especializada en código agéntico del mismo autor |
| Qwen3.6-35B-A3B MTP APEX-I-MiniPlus V2.1 Abliterated | 35B | ~3B | no disponible | no disponible | GGUF | Edición con rechazo ablacionado para flujos que lo requieran |

Los tres modelos comparables pertenecen al mismo ecosistema de cuantizaciones del autor y comparten envelope de tamaño, por lo que la elección depende del perfil de carga (razonamiento general, código o alineamiento reducido) más que de diferencias de arquitectura.

## Limitaciones y advertencias

- Alucinación: como todo modelo generativo, puede producir contenido plausible pero falso, especialmente en tareas de recuperación de hechos o citas; no se documentan evaluaciones de factualidad en la información disponible.
- Sesgos: no se han publicado análisis de sesgo para este modelo ni para su base en la información proporcionada.
- Cuantización con pérdida: aunque el autor declara fidelidad cercana a Q6, se trata de una cuantización con pérdida; los resultados pueden degradarse en tareas sensibles a la precisión numérica o al código de sintaxis estricta.
- Advertencia específica de código: la model card incluye un aviso crítico sobre sintaxis de programación y repeat penalty, orientado a prevenir el intercambio de caracteres; conviene revisar la configuración recomendada antes de usarlo en producción.
- Contexto largo: aunque se declaran 256K tokens, el rendimiento real en ventanas muy largas depende de la implementación de llama.cpp y del hardware; no se aportan mediciones de calidad a contexto máximo.
- Idiomas: la model card lista trece idiomas, pero el campo language del repositorio solo indica inglés; la calidad real en español y en el resto de idiomas no está cuantificada en la información disponible.
- Licencia: MIT permite uso comercial, pero el modelo base y los pesos originales pueden tener condiciones propias que conviene verificar en el repositorio de ornith-ai.
- Dependencia del mantenedor: es una cuantización de un tercero, no una publicación oficial del desarrollador del modelo; la reproducibilidad y el soporte dependen de IsValorum.
- Uso de RAM del sistema: el modo de offload reduce la VRAM pero incrementa la latencia; no se publican cifras de tokens por segundo para ese escenario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IsValorum/Ornith-1.5-35B-A3B-APEX-I-MiniPlus-V2.1-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Colección APEX-I MiniPlus V2.1: https://huggingface.co/collections/IsValorum/apex-i-miniplus-v21-standard-moe-6acfee77961c8c0cf5a083b5
- Qwen3.6-35B-A3B MTP APEX-I-MiniPlus-V2.1: https://huggingface.co/IsValorum/Qwen3.6-35B-A3B-MTP-APEX-I-MiniPlus-V2.1-GGUF
- Qwen3.6-35B-A3B MTP APEX-I-MiniPlus-V2.1 Abliterated: https://huggingface.co/IsValorum/Qwen3.6-35B-A3B-MTP-APEX-I-MiniPlus-V2.1-Abliterated-GGUF
- Tiel Coder 35B-A3B APEX-I-MiniPlus-V2.1: https://huggingface.co/IsValorum/Tiel-Coder-35B-A3B-APEX-I-MiniPlus-V2.1-GGUF
- Qwen3.8 27B MiniPlus V3: https://huggingface.co/IsValorum/Qwen3.8-27B-VAL-APEX-I-MiniPlus-V3-GGUF
- Qwen3.8 27B NanoPlus V3: https://huggingface.co/IsValorum/Qwen3.8-27B-VAL-APEX-I-NanoPlus-V3-GGUF
- Swift-1.5 Qwen3.8 27B Uncensored MTP MiniPlus V3: https://huggingface.co/IsValorum/Swift-1.5-Qwen3.8-27B-Uncensored-MTP-VAL-APEX-I-MiniPlus-V3-GGUF
- Swift-1.5 Qwen3.8 27B Uncensored MTP NanoPlus V3: https://huggingface.co/IsValorum/Swift-1.5-Qwen3.8-27B-Uncensored-MTP-VAL-APEX-I-NanoPlus-V3-GGUF
- Apoyo al autor: https://ko-fi.com/isvalorum

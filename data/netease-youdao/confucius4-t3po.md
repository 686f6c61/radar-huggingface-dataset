# netease-youdao/Confucius4-T3PO

## Resumen

Confucius4-T3PO es un modelo de traducción automática simultánea (SiMT, por sus siglas en inglés) de texto a texto, con 14 770 033 664 parámetros (unos 14,77 mil millones), desarrollado por el equipo de IA de NetEase Youdao. Está construido mediante ajuste fino sobre Qwen2.5-14B, por lo que hereda una arquitectura transformer decoder-only de tipo Qwen2. Su rasgo diferencial es que no traduce por segmentos completos, sino que consume texto en fragmentos muy finos (a nivel de carácter y de palabra) y decide en tiempo real, para cada fragmento, si espera más contexto (READ) o emite ya una traducción incremental (WRITE).

El problema que resuelve es el de la interpretación simultánea con control explícito del compromiso calidad-latencia. Los sistemas de traducción convencionales necesitan la frase completa antes de empezar a traducir, lo que introduce una latencia incompatible con subtitulado en directo o interpretación en reuniones. Confucius4-T3PO mantiene el historial de entrada bajo un protocolo intercalado que conserva un prefijo estable y permite reutilizar la caché KV, de modo que el texto ya emitido es de solo anexado (append-only) y nunca se reescribe.

Es relevante ahora porque combina dos contribuciones metodológicas: una técnica de construcción automática de datos alineados por segmentos que deriva corpus de traducción simultánea de baja latencia a partir de corpus paralelos convencionales, y un algoritmo de aprendizaje por refuerzo con conciencia de frontera de Pareto que optimiza conjuntamente calidad y latencia. El modelo se publica bajo licencia Apache 2.0 y admite varios niveles de latencia seleccionables, lo que lo hace directamente desplegable en productos de traducción en tiempo real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2); ajuste fino de Qwen/Qwen2.5-14B para traducción simultánea streaming |
| Parámetros totales | 14 770 033 664 (≈14,77 mil millones) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | No disponible: el repositorio solo publica pesos safetensors. Los 29,6 GB del repositorio para 14,77 mil millones de parámetros implican aproximadamente 2 bytes por parámetro (FP16/BF16) |
| Idiomas soportados | Chino (zh) e inglés (en). Se observa generalización no entrenada a chino-japonés, sin evaluación rigurosa |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen2.5-14B |
| Pipeline declarado | translation |
| Descargas / likes en HuggingFace | 704 / 14 |
| Tamaño del repositorio | 29,6 GB |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-14B: un transformer decoder-only denso, sin mezcla de expertos ni componentes de espacio de estados. Sobre esa base, NetEase Youdao aplica un entrenamiento en tres etapas: (1) construcción de datos de alta calidad alineados por segmentos, (2) arranque en frío («cold start») del modelo de traducción en régimen streaming y (3) aprendizaje por refuerzo con conciencia de la frontera de Pareto para optimizar conjuntamente calidad y latencia.

La primera técnica genera automáticamente datos de traducción simultánea de baja latencia a partir de corpus paralelos convencionales, sin depender de corpus de interpretación humana. La segunda consiste en un algoritmo de RL que, frente a los objetivos en conflicto de calidad y latencia, avanza de forma medible la frontera de Pareto de la política; según el autor, frente a GRPO estándar explora y mejora mejor esa frontera y evita regímenes de latencia extremadamente baja en los que la calidad de traducción colapsa, manteniendo la estabilidad del entrenamiento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon RLHF o DPO al margen del RL de frontera descrito. El autor anuncia un informe técnico con más detalles sobre método, datos e implementación.

En el plano de inferencia, el modelo organiza la secuencia de entrada bajo un protocolo de historial intercalado que preserva un prefijo estable, lo que habilita la reutilización de la caché KV y reduce el cómputo redundante en cada nuevo fragmento. Las decisiones READ/WRITE se toman por fragmento, y las traducciones ya confirmadas son de solo anexado.

## Capacidades

- Traducción simultánea de texto completamente streaming, con entrada por fragmentos finos a nivel de carácter y palabra, y salida incremental.
- Decisiones READ/WRITE en tiempo real: el modelo elige entre esperar más contexto o emitir traducción de inmediato tras cada fragmento.
- Salida de solo anexado: los fragmentos ya comprometidos no se reescriben, lo que permite mostrarlos de forma estable en una interfaz.
- Modos de latencia ajustables: el autor menciona niveles de compromiso calidad-latencia (en la comparativa externa aparecen los niveles low, native y high).
- Reutilización de caché KV mediante protocolo de historial intercalado y prefijo estable, con reducción del cómputo redundante.
- Conservación de la capacidad general de seguimiento de instrucciones del modelo base Qwen, lo que permite construir encima capacidades adicionales como restricciones terminológicas.
- Generalización cross-lingual parcial: se observa traducción simultánea chino-japonés pese a no haber sido entrenada, aunque la calidad en direcciones distintas de chino e inglés no ha sido evaluada rigurosamente.
- Idiomas: chino e inglés (zh-en y en-zh).
- No admite entrada de voz de forma nativa: es un modelo texto-a-texto. Para voz se puede encadenar con un modelo ASR streaming externo; el autor publica Confucius4-R2T2 como modelo ASR streaming para interpretación simultánea, formando un pipeline S2T.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Subtitulado en directo de conferencias y eventos: el modelo recibe el texto transcrito por fragmentos y emite subtítulos incrementales en el idioma destino con latencia controlada, eligiendo el nivel de latencia adecuado según se priorice inmediatez o calidad. La salida append-only evita que los subtítulos ya mostrados cambien en pantalla.
- Interpretación simultánea en reuniones multilingües: encadenado con un ASR streaming como Confucius4-R2T2, permite construir un pipeline de voz a texto traducido para participantes que hablan chino o inglés, con decisiones READ/WRITE adaptadas al ritmo de habla.
- Traducción en vivo de chat de atención al cliente: al procesar fragmentos según se escriben, el agente puede ver la traducción antes de que el cliente termine el mensaje, reduciendo el tiempo de respuesta percibido en conversaciones zh-en.
- Accesibilidad en plataformas de vídeo y streaming: generación de subtítulos traducidos en tiempo real sobre audio transcrito, reutilizando la caché KV para sostener sesiones largas sin recomputar el prefijo estable.
- Traducción de retransmisiones de voz sobre IP y llamadas: integración en telefonía o VoIP para ofrecer traducción simultánea de conversaciones, con el modo de baja latencia para tramos de habla rápida.
- Localización en producción con terminología restringida: como el ajuste no degrada el seguimiento de instrucciones del modelo base, se pueden añadir restricciones de glosario o terminología sobre la misma política para dominios técnicos, legales o médicos.
- Despliegue como servicio de traducción streaming: el modelo es compatible con text-generation-inference y con endpoints, y su configuración permite exponerlo como API con distintos perfiles de latencia para distintos clientes.
- Evaluación e investigación en SiMT: al publicarse bajo Apache 2.0 y con pesos safetensors, sirve como referencia reproducible para comparar políticas de calidad-latencia frente a GRPO y otras variantes de RL.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. El autor indica que evalúa el modelo en varios benchmarks públicos de traducción simultánea chino-inglés e inglés-chino, y que lo compara con los modelos de código abierto InfiniSST y EAST y con dos sistemas comerciales de traducción simultánea denominados A y B. Las métricas empleadas en las figuras son COMET frente a word-CW (latencia) para la comparación externa, y COMET frente a longitud media de segmento para la frontera de entrenamiento.

| Evaluación | Modelos comparados | Métrica | Resultado numérico |
|---|---|---|---|
| Comparación externa (niveles low, native, high) | InfiniSST, EAST, comerciales A y B | COMET frente a word-CW | No disponible (solo figura) |
| Frontera de entrenamiento | GRPO estándar (comparación interna) | COMET frente a longitud media de segmento | No disponible (solo figura) |

## Requisitos de hardware

Estimaciones a partir de los 14,77 mil millones de parámetros del modelo; no proceden de datos publicados por el autor.

- VRAM estimada en BF16/FP16: unos 29,6 GB solo para pesos, más caché KV y activaciones; en la práctica, del orden de 34-40 GB según longitud de contexto y número de secuencias concurrentes.
- VRAM estimada en cuantización de 8 bits: alrededor de 15-16 GB de pesos, con caché KV adicional; encaja con holgura en GPUs de 24 GB.
- VRAM estimada en cuantización de 4 bits: alrededor de 8-9 GB de pesos; cabe en GPUs de 12-16 GB.
- GPU recomendadas para BF16: A100 80 GB, H100 80 GB, L40S 48 GB, RTX 6000 Ada 48 GB, A6000 48 GB. También es viable con 2 × A100 40 GB o 2 × RTX 4090 24 GB usando paralelismo tensorial.
- GPU de consumo: en BF16 no cabe en una RTX 4090 de 24 GB; en 8 bits entra justa y en 4 bits entra con margen en tarjetas de 16 GB (RTX 4080, RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB) y en 24 GB (RTX 4090, RTX 3090).
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (el repositorio incluye la etiqueta text-generation-inference y endpoints_compatible), vLLM por compatibilidad con la familia Qwen2. Los formatos GGUF o llama.cpp no están publicados oficialmente, aunque serían convertibles a partir de los pesos safetensors.
- Unidades de cómputo en la nube y endpoints compatibles están soportados según las etiquetas del repositorio.
- Latencia y throughput: no disponibles. El diseño busca baja latencia mediante reutilización de caché KV y protocolo de historial intercalado, y ofrece modos de latencia seleccionables, pero no se publican cifras de latencia por token ni de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Confucius4-T3PO | 14,77 mil millones | No disponible | Apache 2.0 | HuggingFace y ModelScope | Sin cifras publicadas; mejor frontera que GRPO según el autor |
| InfiniSST | No disponible | No disponible | No disponible | Referencia académica (ACL 2025 Findings) | Comparado en las figuras del autor; sin cifras |
| EAST | No disponible | No disponible | No disponible | Referencia académica (ACL 2025 Findings) | Comparado en las figuras del autor; sin cifras |
| Sistema comercial A | No disponible | No disponible | Propietaria | Servicio comercial | Comparado en las figuras del autor; sin cifras |
| Sistema comercial B | No disponible | No disponible | Propietaria | Servicio comercial | Comparado en las figuras del autor; sin cifras |
| Qwen2.5-14B (base) | 14,77 mil millones | No disponible en esta información | Apache 2.0 (según el modelo base) | HuggingFace | No es un modelo de SiMT; es la base sobre la que se ajusta |

No se dispone de datos suficientes (parámetros, contexto, licencia o métricas) de los modelos comparables para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Cobertura de idiomas limitada: solo chino e inglés están soportados oficialmente. La generalización a chino-japonés se menciona como observación, sin evaluación rigurosa; cualquier otro par de idiomas carece de garantías.
- No admite voz de forma nativa. Cualquier caso de uso con audio exige encadenar un ASR streaming externo, lo que añade su propia latencia y su propia tasa de error al pipeline.
- Riesgo de alucinación y de deriva en traducciones incrementales: al emitir segmentos antes de disponer del contexto completo, existe riesgo de errores que no se pueden corregir, porque la salida comprometida es append-only y no se reescribe.
- El compromiso calidad-latencia es explícito: los modos de baja latencia sacrifican calidad de traducción. El propio autor señala que los regímenes de latencia extremadamente baja provocan colapso de calidad.
- Sesgos: no se documentan sesgos conocidos en la información disponible; al derivar de Qwen2.5-14B y de corpus paralelos, es esperable que herede los sesgos del modelo base y de dichos corpus, pero no hay análisis publicado.
- Longitud de contexto: no se especifica en la información disponible, lo que impide garantizar el comportamiento en sesiones muy largas más allá de lo que permita la caché KV.
- Licencia: Apache 2.0, lo que permite uso comercial. Conviene verificar igualmente las condiciones del modelo base Qwen2.5-14B y de los corpus empleados, no detallados en la model card.
- Documentación incompleta: falta el informe técnico anunciado, no hay cifras de benchmarks, no hay especificación de cuantizaciones oficiales y la model card disponible está truncada en la sección de descargas.
- Madurez del repositorio: 704 descargas y 14 likes en HuggingFace, con publicación en septiembre de 2026, indican una adopción todavía baja y un ecosistema de terceros limitado (pocas recetas de despliegue o cuantizaciones comunitarias verificadas).
- No hay información sobre soporte de tool calling, function calling ni flujos de agentes multi-paso, por lo que no debe asumirse su disponibilidad en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/netease-youdao/Confucius4-T3PO
- Modelo en ModelScope: https://modelscope.cn/models/netease-youdao/Confucius4-T3PO
- Repositorio de código de inferencia en GitHub: https://github.com/netease-youdao/Confucius4-T3PO
- Demostración en línea: https://t3po.youdao.com
- Modelo ASR streaming Confucius4-R2T2: https://huggingface.co/netease-youdao/Confucius4-R2T2
- Modelo base Qwen2.5-14B: https://huggingface.co/Qwen/Qwen2.5-14B
- Artículo de InfiniSST (ACL 2025 Findings): https://aclanthology.org/2025.findings-acl.157.pdf
- Artículo de EAST (ACL 2025 Findings): https://aclanthology.org/2025.findings-acl.1045.pdf
- Información corporativa de NetEase: https://en.wikipedia.org/wiki/NetEase

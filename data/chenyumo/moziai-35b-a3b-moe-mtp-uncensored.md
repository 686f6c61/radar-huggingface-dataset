# chenyumo/moziAI-35B-A3B-MOE-MTP-Uncensored

## Resumen

MoziAI-35B-V3.8 es un ajuste fino (finetune) del modelo base Ornith-1.5-35B-A3B, publicado por el usuario chenyumo y asociado al equipo del creador de contenido financiero Chen Yumo. Se distribuye principalmente en formato GGUF para llama.cpp bajo licencia Apache-2.0 y está orientado a despliegue local en hardware de consumo. El modelo parte de una arquitectura MoE de 35.505.251.456 parámetros totales, con linaje declarado Qwen3.5-35B-A3B / Qwen3.6-35B-A3B, e incorpora componentes de Gemma 4 según la model card.

La propuesta diferencial del autor es triple: una cuantización propia denominada MoziSmartBit que comprime el modelo hasta unos 15,9 GB (frente a los aproximadamente 22 GB de un Q4_K_M estándar), un marco de razonamiento estructurado llamado "seven-dimensional thinking" con marcadores `moziAI-Think` y un mecanismo de iteración de agente `moziAI-Loop`. A ello se suma un enfoque vertical en finanzas, soporte declarado de tool calling, capacidades multimodales (visión) y una variante "uncensored" sin moderación de contenido.

Es relevante ahora porque combina varias tendencias simultáneas: modelos MoE de tamaño medio que caben en GPU de consumo, cuantizaciones agresivas con decodificación especulativa (MTP) y ajustes de dominio vertical sobre bases abiertas. No obstante, la información pública disponible es fundamentalmente la model card del autor: no hay paper, no hay resultados de benchmarks verificables y la mayor parte de las afirmaciones de rendimiento no están respaldadas por evaluaciones independientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) tipo transformer, linaje declarado Qwen3.5-35B-A3B / Qwen3.6-35B-A3B con componentes Gemma 4 |
| Parametros totales | 35.505.251.456 (35,5 B) |
| Parametros activos | no disponible (la model card no publica el número de expertos activos ni la proporción de activación) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con cuantización propietaria MoziSmartBit (tamaño de referencia ~15,9 GB, ratio de compresión declarado 4,5x); se menciona comparación con Q4_K_M estándar (~22 GB); matriz de calibración imatrix |
| Idiomas soportados | zh, en (metadatos del repo); la model card declara soporte de 201 idiomas y dialectos con optimización especial del chino |
| Licencia | apache-2.0 (componentes upstream Qwen/Gemma Apache-2.0, incrementos Ornith MIT según NOTICE) |
| Formato de pesos | GGUF (librería llama-cpp) |
| Modelo base | ornith-ai/Ornith-1.5-35B-A3B |
| Tamaño del repositorio | 47,8 GB |
| Pipeline | text-generation |
| Fecha de publicación | 2026-08-10 (creación); actualización 2026-09-25; versión V3.8 fechada 2026-09-01 |
| Descargas / likes | 7.658 / 26 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino sobre Ornith-1.5-35B-A3B, una base MoE de 35,5 B parámetros totales que el autor describe como alineada con la arquitectura Qwen3.5-35B-A3B / Qwen3.6-35B-A3B e integrando componentes de Gemma 4. Al ser una arquitectura MoE, solo una fracción de los parámetros se activa por token, lo que explica que un modelo de 35 B pueda ejecutarse en GPUs de consumo con unos 20 GB de VRAM. El repositorio incluye el tag `MTP`, que en el ecosistema Qwen corresponde a multi-token prediction, y la model card dedica una sección a "speculative decoding acceleration", lo que sugiere que el modelo incorpora cabezas de predicción multi-token para acelerar la decodificación especulativa.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset de ajuste fino, ni si se emplearon técnicas de RLHF, DPO o similares. La model card menciona de forma genérica "datos financieros propios" y capacidades de dominio financiero, pero sin cifras ni detalles metodológicos. Las innovaciones declaradas son de posprocesado e inferencia más que de arquitectura: la cuantización MoziSmartBit (estrategia diferenciada por capas adaptada a la estructura MoE, con calibración imatrix), el marco de razonamiento en siete dimensiones con niveles 0, 1 y 2 según complejidad de la tarea, y el bucle de agente `moziAI-Loop` de dos rondas (ejecutar/evaluar y ajustar/verificar). Ninguna de estas afirmaciones está acompañada de evaluaciones reproducibles.

## Capacidades

- Generación de texto conversacional multi-turno, con marcadores explícitos de razonamiento (`moziAI-Think`) y de iteración (`moziAI-Loop`).
- Razonamiento estructurado por niveles de complejidad: respuesta rápida en dos dimensiones para consultas simples, cinco dimensiones para análisis y siete dimensiones para desarrollo de código y estrategia.
- Programación general declarada: desarrollo full-stack, depuración y diseño de arquitectura en Python, JavaScript, TypeScript, Go y Rust.
- Tool calling / function calling, con optimización declarada para llamadas a herramientas en contexto financiero.
- Comportamiento de agente con reflexión y auto-verificación en dos rondas para tareas complejas.
- Capacidades multimodales: el tag `vision` y el título "multimodal" indican soporte de entrada de imágenes, aunque no se detallan resoluciones, formato de prompt ni arquitectura del codificador visual.
- Capacidades financieras: preguntas y respuestas de dominio, programación cuantitativa y análisis de datos financieros.
- Multilingüismo declarado de 201 idiomas y dialectos, con optimización específica para chino; los metadatos del repo solo listan zh y en.
- Modo "uncensored": sin moderación de contenido en la salida.
- Decodificación especulativa vía MTP para acelerar la inferencia.

## Casos de uso

- Análisis financiero asistido en local: el modelo puede procesar informes, comparar métricas y redactar resúmenes de resultados manteniendo los datos dentro de la infraestructura propia, lo que resulta adecuado para entornos con requisitos de confidencialidad y para evitar costes por token en la nube.
- Generación y revisión de código en pipelines de CI/CD: con soporte de tool calling y un modo de razonamiento de siete dimensiones orientado a desarrollo, puede integrarse como paso de revisión automática, generación de tests o corrección de parches en Python, Go o Rust.
- Agentes multi-paso con auto-verificación: el mecanismo `moziAI-Loop` está pensado para flujos donde el modelo descompone la tarea, ejecuta, evalúa y corrige; encaja en automatizaciones de extracción y transformación de datos o en asistentes de operaciones.
- Asistencia conversacional de dominio con contexto largo: para atención a usuarios en productos financieros o de análisis, siempre que se valide externamente la longitud de contexto real, ya que no está publicada.
- Procesamiento de documentos con imágenes: gracias al soporte declarado de visión, puede emplearse para extraer información de capturas de pantalla, tablas escaneadas o gráficos financieros, aunque la ausencia de especificaciones del componente visual obliga a validar la calidad antes de producción.
- Investigación y análisis sin restricciones de contenido: el modo uncensored permite discusión abierta de temas sensibles en entornos académicos o de análisis de riesgos, con la advertencia de que elimina también las salvaguardas frente a contenido dañino.
- Despliegue en estaciones de trabajo con GPU de consumo: al ocupar unos 15,9 GB en MoziSmartBit, permite ejecutar un MoE de 35 B en una única GPU de 20-24 GB, útil para prototipado y demos sin infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks verificables en la información disponible. La model card incluye una sección de benchmarks, pero no se han proporcionado las cifras concretas ni la metodología de evaluación, por lo que no es posible presentar una tabla comparativa sin inventar datos. Las únicas afirmaciones cuantitativas del autor son de eficiencia de cuantización (15,9 GB frente a ~22 GB de Q4_K_M, retención declarada de ~99 % de la precisión FP16) y no de calidad en tareas estándar.

## Requisitos de hardware

- VRAM estimada: unos 15,9 GB para los pesos en MoziSmartBit; hay que añadir el espacio de la caché KV, que depende de la longitud de contexto (no publicada) y del número de secuencias concurrentes.
- GPU recomendadas: el autor indica que funciona en GPUs de consumo con 20 GB de VRAM o más; encajan RTX 4090 (24 GB), RTX 3090 (24 GB), RTX 4080 Super (16 GB, justo al límite) y GPUs profesionales como A100 o H100 para mayor concurrencia y contexto.
- Cabe en GPU de consumo: sí, según el autor, en tarjetas de 20-24 GB con la cuantización propietaria; en configuraciones de 16 GB requeriría cuantizaciones más agresivas no documentadas.
- Opciones de despliegue: llama.cpp (librería declarada), y por extensión servidores compatibles con GGUF como Ollama o llama-cpp-python; la model card menciona "endpoints_compatible" y una sección de métodos de despliegue. No se confirma soporte de vLLM o TGI, que habitualmente requieren pesos safetensors y no GGUF.
- Latencia y throughput: no disponibles. El autor promociona la decodificación especulativa MTP como aceleración, pero sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MoziAI-35B-A3B-MOE-MTP-Uncensored | 35,5 B totales (activos no disponibles) | no disponible | Apache-2.0 | GGUF | Finetune financiero con cuantización propietaria y modo uncensored |
| Ornith-1.5-35B-A3B (modelo base) | 35,5 B totales | no disponible | MIT + Apache-2.0 según el autor | no disponible en la información | Base directa; sin las capas de ajuste financiero ni MoziSmartBit |
| Familia Qwen3.5-35B-A3B / Qwen3.6-35B-A3B | 35 B clase MoE | no disponible | Apache-2.0 (según el autor) | safetensors y GGUF en el ecosistema | Arquitectura de referencia declarada; ecosistema de herramientas más amplio y evaluaciones públicas |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- Ausencia total de benchmarks verificables: las afirmaciones de precisión (~99 % de FP16) y de superioridad en dominio financiero no están respaldadas por evaluaciones públicas ni independientes.
- Riesgo de alucinación especialmente relevante en el dominio financiero, donde el propio autor reconoce una tolerancia muy baja al error; no hay datos de tasas de alucinación.
- Longitud de contexto no publicada, lo que impide planificar despliegues que dependan de ventanas largas.
- Idiomas: los metadatos solo declaran zh y en; la afirmación de 201 idiomas procede de la model card y no está verificada, y el castellano no figura entre los idiomas declarados en los metadatos.
- El modo uncensored elimina la moderación de contenido, lo que supone un riesgo directo en producción: no hay filtro frente a contenido dañino, ilegal o inseguro, y la responsabilidad recae íntegramente en el desplegador.
- Licencia Apache-2.0 declarada, pero con componentes upstream de distinta procedencia (Qwen, Gemma, Ornith) y un fichero NOTICE; conviene revisar la cadena de atribución antes de un uso comercial.
- La cuantización MoziSmartBit es propietaria y no está documentada en detalle; la reproducibilidad de sus resultados y su compatibilidad con herramientas estándar de GGUF no están garantizadas.
- El soporte de visión se anuncia pero carece de especificaciones (codificador, resolución, formato de prompt), por lo que no debe asumirse en producción sin pruebas.
- El repositorio ocupa 47,8 GB, lo que implica descargas grandes y espacio en disco considerable aunque el modelo cuantizado ocupe menos.
- Proyecto de un único autor con 26 likes y sin paper asociado: menor garantía de mantenimiento, soporte y corrección de errores a largo plazo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chenyumo/moziAI-35B-A3B-MOE-MTP-Uncensored
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Licencia: https://huggingface.co/chenyumo/moziAI-35B-A3B-MOE-MTP/blob/main/LICENSE
- README en inglés: https://huggingface.co/chenyumo/moziAI-35B-A3B-MOE-MTP/blob/main/V3.8/README.en.md
- README en chino simplificado: https://huggingface.co/chenyumo/moziAI-35B-A3B-MOE-MTP/blob/main/V3.8/README.zh.md
- README en español: https://huggingface.co/chenyumo/moziAI-35B-A3B-MOE-MTP/blob/main/V3.8/README.es.md
- Paper, blog técnico o demo: no disponibles en la información proporcionada.

# onocloud/onoai-obsidian-2.5-pro

## Resumen

OnoAI Obsidian 2.5 Pro es un modelo multimodal de tipo image-text-to-text publicado por onocloud (OnoCloud & OnoAI Labs) en Hugging Face. Se presenta como el modelo insignia de la familia OnoAI Obsidian, orientado a razonamiento empresarial, visión por computador, ingeniería de software y lógica financiera. La model card lo describe como un modelo de arquitectura Mixture-of-Experts (MoE) con una capacidad declarada de 30B parámetros y 3B parámetros activos por token, aunque el título de la propia ficha indica "32B Multimodal Flagship", lo que introduce una discrepancia entre ambas cifras.

El modelo se distribuye bajo la licencia propietaria "onocloud-sovereign-license" (denominada OSRL-1.0 en la model card), que restringe la redistribución y la explotación comercial externa. Los idiomas declarados son árabe e inglés, con mención específica a árabe estándar moderno y dialectos del Golfo. La información pública disponible es muy limitada: no se detallan datos de entrenamiento, composición del dataset, resultados de benchmarks ni especificaciones completas de contexto o cuantización.

La relevancia del modelo radica en su propuesta de combinar capacidades multimodales y de razonamiento en un supuesto MoE de baja activación (3B), lo que en teoría permitiría latencias reducidas (la model card menciona "sub-50ms"), junto con un enfoque de "soberanía" del dato y licencia restrictiva orientada a despliegues empresariales controlados. No obstante, la ausencia de datos verificables y el hecho de que el repositorio no registre descargas ni interacciones hacen necesaria una evaluación cautelosa antes de cualquier adopción en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) multimodal, según model card; tag `qwen3_vl_moe` |
| Parametros totales | 30B (model card) / 32B (título de la ficha); cifra no verificada |
| Parametros activos | 3B (según model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | árabe (estándar moderno y dialectos del Golfo) e inglés |
| Licencia | onocloud-sovereign-license (OSRL-1.0), propietaria y restrictiva |
| Formato de pesos | no disponible (no se especifica safetensors, GGUF ni otros) |

## Arquitectura y entrenamiento

La model card describe una arquitectura Mixture-of-Experts con 30B parámetros de capacidad total y 3B parámetros activos por token, lo que situaría al modelo en la categoría de MoE de activación dispersa. El tag `qwen3_vl_moe` sugiere una base o inspiración en la familia Qwen3-VL MoE, si bien no se confirma en la documentación. Se trata de un modelo multimodal con pipeline `image-text-to-text`, es decir, capaz de procesar entradas conjuntas de imagen y texto.

No se proporciona información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF, DPO u otras técnicas de alineación, ni sobre innovaciones técnicas concretas más allá de la propia arquitectura MoE. La afirmación de "sub-50ms inference latency" aparece en la model card sin especificar hardware, lote, longitud de secuencia ni cuantización, por lo que no puede considerarse un dato reproducible. Tampoco se detalla la estrategia de entrenamiento multimodal (alineamiento visión-lenguaje, resolución de imagen soportada, número de tokens visuales, etc.).

## Capacidades

- Generación de texto y razonamiento multi-paso, según la model card ("strategic reasoning", "multi-step deduction").
- Visión multimodal: OCR de alta fidelidad, análisis de esquemas técnicos multipágina, planos arquitectónicos, inspección de interfaces de usuario y análisis de clips de vídeo (según model card).
- Ingeniería de software: síntesis full-stack, refactorización multi-repositorio, generación autónoma de diffs de Git y migración de esquemas de base de datos (según model card).
- Razonamiento financiero y legal: verificación de auditorías, análisis de contratos y contabilidad ERP por partida doble (según model card).
- Bilingüismo declarado árabe-inglés, con especial énfasis en árabe estándar moderno y dialectos del Golfo.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: mencionado de forma genérica ("autonomous Git diff generation"), sin detalles técnicos.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Digitalización y extracción de datos de documentos técnicos: el modelo podría emplearse para OCR de planos, esquemas y documentación multipágina, aprovechando su capacidad multimodal declarada para convertir imágenes técnicas en texto estructurado.
- Revisión automatizada de contratos en árabe e inglés: su bilingüismo declarado y sus capacidades de parsing legal permitirían extraer cláusulas, detectar riesgos y resumir contratos en entornos jurídicos de la región del Golfo.
- Asistencia a la refactorización de código en pipelines de CI/CD: la model card menciona generación de diffs de Git y refactorización multi-repositorio, lo que encajaría en revisiones automatizadas de pull requests, aunque la falta de datos sobre tool calling limita la integración real.
- Auditoría contable y verificación financiera: el modelo declara capacidad de contabilidad por partida doble y verificación de auditorías, útil para conciliaciones y detección de anomalías en ERP.
- Inspección de interfaces y QA visual: análisis de capturas de UI para detectar regresiones visuales o validar flujos de usuario en aplicaciones, apoyándose en su entrada image-text.
- Análisis de vídeo para monitorización o documentación: la model card cita "video clip analysis", aplicable a resúmenes de grabaciones técnicas o extracción de eventos, aunque no se detallan límites de duración ni resolución.
- Asistencia conversacional bilingüe en atención al cliente: para organizaciones que operan en árabe e inglés, el modelo podría gestionar conversaciones multi-turno, si bien la longitud de contexto no está especificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 30B parámetros totales y 3B activos, una estimación teórica en FP16 rondaría los 60 GB de pesos, pero al no confirmarse el formato ni la cuantización no puede darse una cifra fiable.
- GPU recomendadas: no disponible. La model card menciona latencia inferior a 50 ms sin especificar el hardware empleado.
- Compatibilidad con GPU de consumo: no disponible. Un MoE de 30B totales difícilmente cabría en GPUs de consumo de 24 GB en precisión completa, pero no hay datos oficiales.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible. No se documenta compatibilidad con ningún framework de inferencia.
- Latencia y throughput estimados: la model card afirma "sub-50ms inference latency" sin condiciones reproducibles; no se ofrece throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OnoAI Obsidian 2.5 Pro | 30B (declarado) / 32B (título) | 3B | no disponible | Propietaria (OSRL-1.0) | Hugging Face, sin descargas registradas |
| Qwen3-VL MoE (familia referenciada por el tag) | no disponible en esta ficha | no disponible | no disponible | no disponible | no disponible |
| Alternativas multimodales abiertas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables de benchmarks ni de especificaciones completas de modelos comparables en la información proporcionada, por lo que la comparativa cuantitativa no puede completarse.

## Limitaciones y advertencias

- Discrepancia interna en el tamaño: el título indica 32B y la model card 30B; no hay confirmación oficial de la cifra correcta.
- Ausencia total de datos de entrenamiento, dataset, alineación y evaluación; no es posible verificar las capacidades declaradas.
- La afirmación de latencia "sub-50ms" no especifica hardware, lote ni cuantización, por lo que no es reproducible.
- Licencia propietaria y restrictiva (OSRL-1.0): prohíbe redistribución, extracción y explotación comercial externa; requiere revisión legal antes de cualquier uso en producción.
- Idiomas limitados a árabe e inglés; no se declara soporte de castellano ni de otros idiomas.
- Longitud de contexto no documentada, lo que impide evaluar su idoneidad para tareas de contexto largo.
- Riesgo de alucinación y sesgos: no disponible, al no existir evaluaciones publicadas.
- Repositorio sin descargas ni interacciones registradas en el momento de la consulta, lo que limita la validación por parte de la comunidad.
- No se documentan formatos de pesos ni compatibilidad con frameworks de inferencia estándar, lo que dificulta el despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/onocloud/onoai-obsidian-2.5-pro
- Licencia (referenciada en la model card): LICENSE (no se proporciona URL directa en la información disponible)
- Paper, blog, repositorio o demo: no disponible

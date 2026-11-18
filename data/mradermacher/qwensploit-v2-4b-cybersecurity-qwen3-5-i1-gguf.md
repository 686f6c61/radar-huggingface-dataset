# mradermacher/Qwensploit-V2-4B-CyberSecurity-Qwen3.5-i1-GGUF

## Resumen

Qwensploit-V2-4B-CyberSecurity-Qwen3.5-i1-GGUF es una cuantización en formato GGUF de un modelo derivado de la familia Qwen, publicada por el usuario mradermacher. El nombre indica que el modelo base es un Qwen de aproximadamente 4B parámetros, especializado en ciberseguridad mediante un proceso de fine-tuning sobre la variante "Qwen3.5", y que esta versión concreta es una conversión de tipo imatrix/weighted (sufijo "i1") generada con herramientas de cuantización de llama.cpp.

El repositorio no contiene pesos en formato safetensors ni información verificable sobre arquitectura, entrenamiento o licencia. Los metadatos de Hugging Face indican un tamaño de repo de 0.0 GB y cero descargas, lo que sugiere que el artefacto puede no estar realmente publicado o que los pesos no se han subido. El dato de parámetros totales en safetensors (1.797.272) corresponde a los tensores de metadatos del repo GGUF, no al recuento real de parámetros del modelo base.

La relevancia de esta ficha es limitada: se trata de un artefacto de cuantización de un modelo especializado en seguridad ofensiva/defensiva, útil potencialmente para entornos con restricciones de VRAM, pero sin información pública suficiente para validar su rendimiento, licencia o procedencia. Cualquier uso en producción exigiría auditar el modelo base original y verificar los derechos de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen, transformer decoder-only presumiblemente) |
| Parametros totales | no disponible (el nombre indica ~4B; metadatos safetensors: 1.797.272 tensores de metadatos) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones imatrix/weighted) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base. El nombre "Qwen3.5" sugiere una variante de la familia Qwen, presumiblemente un transformer decoder-only, pero no hay confirmación en la model card ni en los metadatos. El sufijo "CyberSecurity" indica un fine-tuning orientado a tareas de seguridad informática, y "V2" sugiere una segunda iteración del modelo base publicado por xtools-at.

La model card únicamente documenta el proceso de cuantización: conversión de tipo "hf", cuantización imatrix/weighted con quants de llama.cpp, y ausencia de mmproj (no se incluye proyector multimodal). No se especifican datos de entrenamiento, número de tokens, composición del dataset, ni si hubo RLHF/DPO. No hay innovaciones técnicas documentadas más allá del pipeline de cuantización estándar de mradermacher.

## Capacidades

- Generación de texto: presumiblemente, al ser un modelo derivado de Qwen.
- Ciberseguridad: el fine-tuning declarado apunta a tareas de análisis de vulnerabilidades, reconocimiento y asistencia en seguridad ofensiva/defensiva.
- Razonamiento y código: no confirmado explícitamente, pero plausible por la base Qwen.
- Tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponible; no se incluye proyector multimodal (skip_mmproj).

## Casos de uso

- Asistente de triaje de vulnerabilidades: el modelo podría clasificar y priorizar hallazgos de escáneres (CVE, CVSS) en pipelines de seguridad, siempre que se valide su precisión con datos reales.
- Generación de informes de pentesting: redacción de resúmenes técnicos a partir de notas de reconocimiento, con revisión humana obligatoria por riesgo de alucinación.
- Análisis de logs y alertas: interpretación de eventos de seguridad en entornos con recursos limitados, aprovechando las cuantizaciones pequeñas (Q4_K_M, Q5_K_M) para despliegue en GPU de consumo.
- Formación y laboratorios: uso en entornos educativos de ciberseguridad para explicar conceptos de explotación y mitigación, con supervisión docente.
- Automatización de respuestas a incidentes: borradores de runbooks y procedimientos de contención, integrados en sistemas de ticketing.
- Evaluación de configuraciones: revisión de ficheros de configuración (Terraform, Kubernetes, nginx) en busca de malas prácticas, con validación posterior por herramientas deterministas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: para un modelo de ~4B parámetros, aproximadamente 2,5-3 GB en Q4_K_M, 3,5-4 GB en Q5_K_M, 5-6 GB en Q6_K, y 1,5-2 GB en cuantizaciones IQ2/IQ3 (estimaciones orientativas, no verificadas).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 para cuantizaciones altas con contexto largo; A100/H100 solo si se requiere throughput elevado.
- Cabe en GPU de consumo: sí, presumiblemente en la mayoría de tarjetas con 6 GB o más para cuantizaciones Q4/Q5.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (si se convierte a safetensors), TGI (requiere pesos no GGUF).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwensploit-V2-4B-CyberSecurity-Qwen3.5-i1-GGUF | ~4B (no confirmado) | no disponible | no disponible | GGUF | Este artefacto; sin benchmarks |
| Qwen2.5-3B-Instruct | 3B | 32K | Apache 2.0 | safetensors, GGUF | Modelo generalista, licencia clara |
| Qwen2.5-Coder-3B | 3B | 32K | Apache 2.0 | safetensors, GGUF | Especializado en código, no en seguridad |
| WhiteRabbitNeo / modelos de seguridad | 7B-13B | variable | variable | GGUF | Alternativas de seguridad con más documentación pública |

La comparativa es orientativa: no hay datos de rendimiento del modelo evaluado que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Ausencia total de información sobre licencia: no se puede determinar si el uso comercial está permitido; tratar como no apto para producción hasta verificar.
- Modelo base no identificado con certeza: "Qwen3.5" no corresponde a una designación oficial conocida de la familia Qwen, lo que impide verificar procedencia y derechos.
- Riesgo elevado de alucinación en contenido de ciberseguridad: un modelo de 4B fine-tuneado puede generar comandos, exploits o CVE ficticios; requiere validación con herramientas deterministas.
- Sesgos desconocidos: no hay documentación sobre sesgos de género, idioma o dominio.
- Contexto e idiomas no documentados: no se puede planificar su uso en conversaciones multi-turno largas ni en idiomas distintos del inglés.
- Repositorio con 0 descargas y tamaño 0.0 GB: posible que los pesos no estén disponibles o que el artefacto esté incompleto; verificar antes de descargar.
- Sin proyector multimodal: no soporta visión ni audio.
- Uso dual (ofensivo/defensivo): el fine-tuning en ciberseguridad puede producir contenido sensible; aplicar filtros y políticas de uso responsable.

## Enlaces

- Hugging Face: https://huggingface.co/mradermacher/Qwensploit-V2-4B-CyberSecurity-Qwen3.5-i1-GGUF
- Modelo base citado: https://huggingface.co/xtools-at/Qwensploit-V2-4B-CyberSecurity-Qwen3.5
- Perfil del autor: https://huggingface.co/mradermacher
- Repositorio llama.cpp (herramienta de cuantización): https://github.com/ggerganov/llama.cpp

# darkc0de/MEMPHIS

## Resumen

MEMPHIS es un modelo multimodal de tipo image-text-to-text desarrollado por el usuario darkc0de, con 27.356.728.560 parámetros (unos 27,4 mil millones) y un tamaño de repositorio de 54,7 GB en formato safetensors. Se presenta como un fine-tune del modelo base darkc0de/Arete-27B-heretic-test3, que a su vez deriva de la familia Qwen 3.5 según las etiquetas de la model card. El modelo está publicado bajo licencia Apache 2.0, aunque la propia model card impone un acuerdo de acceso restringido y uso autorizado que condiciona la elegibilidad del usuario.

El modelo se enmarca en el proyecto denominado XORTRON Criminal Computing, descrito por el autor como un experimento de investigación sobre seguridad y alineamiento de IA. Las etiquetas incluyen términos como "heretic", "uncensored", "toxic" y "not-for-all-anatomical-audiences", lo que indica que ha sido ajustado deliberadamente para reducir las restricciones de seguridad habituales. Está entrenado sobre el dataset darkc0de/The-Mind-of-XORTRON y declara soporte únicamente para inglés.

La relevancia de esta ficha es fundamentalmente evaluativa: se trata de un modelo de gran tamaño, multimodal y explícitamente orientado al estudio de usos maliciosos de la IA, por lo que resulta útil para investigadores de seguridad, red teams y equipos de trust and safety que necesiten analizar comportamientos adversariales. No obstante, su escasa tracción (19 descargas, 0 likes en el momento de la consulta) y la ausencia de benchmarks publicados limitan cualquier evaluación de rendimiento objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen 3.5 según etiquetas |
| Parametros totales | 27.356.728.560 (≈27,4 B) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se listan GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 (con acuerdo de acceso restringido adicional en la model card) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible indica que MEMPHIS es un transformer multimodal con pipeline image-text-to-text, construido como fine-tune de darkc0de/Arete-27B-heretic-test3. Las etiquetas apuntan a la familia Qwen 3.5 como linaje arquitectónico, aunque no se detallan en la model card aspectos como el número de capas, la dimensión oculta, el mecanismo de atención (atención completa, lineal o híbrida) ni la configuración del codificador visual. El tamaño de 27,4 mil millones de parámetros es coherente con un modelo denso de gran escala, pero no se confirma si emplea mezcla de expertos.

En cuanto al entrenamiento, el autor menciona el dataset darkc0de/The-Mind-of-XORTRON como corpus de ajuste, sin especificar número de tokens, composición, proporción de datos multimodales ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. El prefijo "heretic" en el modelo base y las etiquetas "uncensored" y "toxic" sugieren un proceso deliberado de reducción de rechazos y salvaguardas, orientado a la investigación sobre alineamiento. No se documentan innovaciones técnicas como decodificación especulativa, atención lineal o modos de razonamiento extendido.

## Capacidades

- Generación de texto conversacional en inglés, con ajuste orientado a respuestas sin filtros de seguridad.
- Procesamiento de imagen y texto de forma conjunta (pipeline image-text-to-text), lo que permite entrada multimodal.
- Generación de texto a partir de imágenes, aunque no se detalla la resolución soportada ni el número de imágenes por prompt.
- Compatibilidad declarada con text-generation-inference y endpoints_compatible, lo que facilita su despliegue en infraestructuras de servicio estándar.
- Soporte de conversación multi-turno según la etiqueta "conversational".
- No se documenta soporte de tool calling, function calling, agentes multi-paso, matemáticas avanzadas ni modos de pensamiento explícitos.
- Capacidad multilingüe limitada al inglés según el campo language de la model card.

## Casos de uso

- Investigación en seguridad y alineamiento: el modelo puede emplearse en entornos controlados para estudiar cómo un sistema de gran escala sin salvaguardas responde a prompts adversarios, generando datos para red teams y equipos de trust and safety.
- Red teaming de sistemas defensivos: utilizar MEMPHIS como generador de ataques simulados (prompts maliciosos, ingeniería social textual) para evaluar clasificadores y filtros de otros modelos o plataformas.
- Análisis forense de contenido generado: investigadores pueden comparar las salidas del modelo con las de sistemas alineados para identificar patrones lingüísticos y estilísticos asociados a contenido tóxico o no filtrado.
- Evaluación de marcos regulatorios: legisladores y analistas de políticas pueden examinar de forma empírica el tipo de contenido que producen modelos sin restricciones, informando debates sobre obligaciones de seguridad.
- Docencia en ciberseguridad y ética de IA: en cursos universitarios, el modelo sirve para demostrar los riesgos de los fine-tunes sin alineamiento y las diferencias frente a modelos con RLHF.
- Investigación multimodal sobre sesgos: al aceptar imagen y texto, permite estudiar cómo se comporta un modelo sin filtros ante estímulos visuales, útil en estudios de percepción y sesgo en sistemas multimodales.
- Pruebas de robustez de pipelines de despliegue: su compatibilidad con text-generation-inference y endpoints permite validar infraestructuras de servicio ante cargas de modelos de 27 B con comportamiento impredecible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 55 GB solo para pesos, más overhead de activaciones y caché KV, por lo que se requieren del orden de 60-70 GB en configuraciones prácticas.
- VRAM estimada en cuantización de 8 bits: alrededor de 28-30 GB de pesos, con overhead adicional.
- VRAM estimada en cuantización de 4 bits: alrededor de 14-16 GB de pesos, aunque no se publican versiones GGUF ni AWQ/GPTQ oficiales.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para FP16 sin compromisos; A100 40 GB o L40S 48 GB solo con cuantización agresiva.
- GPU de consumo: no cabe en RTX 4090 (24 GB) en FP16; sería viable en 4 bits con cuantización no oficial, asumiendo riesgo de degradación.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference y endpoints compatibles; no se confirma soporte de vLLM, llama.cpp, Ollama ni TGI más allá de la etiqueta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MEMPHIS (darkc0de) | ≈27,4 B | no disponible | Sí (image-text-to-text) | apache-2.0 con acuerdo adicional | Hugging Face, 19 descargas |
| Qwen2.5-VL-32B (Alibaba) | ≈32 B | no disponible en esta ficha | Sí | Apache 2.0 | Ampliamente disponible |
| Gemma 3 27B (Google) | ≈27 B | no disponible en esta ficha | Sí | Gemma Terms | Ampliamente disponible |
| LLaVA-OneVision 34B | ≈34 B | no disponible en esta ficha | Sí | Apache 2.0 | Ampliamente disponible |

La comparación se limita a la categoría de modelos multimodales de 27-34 B; no se dispone de datos de rendimiento de MEMPHIS para contrastar benchmarks con estas alternativas. La diferencia principal es que MEMPHIS es un fine-tune de investigación sin alineamiento, mientras que las alternativas son modelos de producción con salvaguardas y documentación extensa.

## Limitaciones y advertencias

- Modelo explícitamente etiquetado como "uncensored", "toxic" y "not-for-all-audiences": puede generar contenido ofensivo, peligroso o legalmente problemático sin filtros.
- Riesgo elevado de alucinación y de afirmaciones no verificadas, agravado por la ausencia de benchmarks y de documentación técnica.
- Sesgos desconocidos: no se documenta composición del dataset ni procesos de mitigación de sesgos.
- Soporte limitado al inglés; no se garantiza calidad en castellano ni en otros idiomas.
- Longitud de contexto no publicada, lo que impide planificar despliegues con prompts largos.
- Licencia Apache 2.0 en los metadatos, pero la model card impone un acuerdo de acceso restringido y uso autorizado que exige certificar elegibilidad profesional; existe tensión entre ambas condiciones que conviene aclarar legalmente antes de un uso comercial.
- El autor declara que el modelo forma parte de un proyecto de investigación sobre actividad criminal asistida por IA; su uso en producción con usuarios finales es desaconsejable sin salvaguardas externas.
- Escasa tracción (19 descargas, 0 likes) y ausencia de comunidad: no hay informes independientes de calidad ni de estabilidad.
- No se publican cuantizaciones oficiales, lo que dificulta el despliegue en hardware de consumo.

## Enlaces

- Hugging Face: https://huggingface.co/darkc0de/MEMPHIS
- Modelo base: https://huggingface.co/darkc0de/Arete-27B-heretic-test3
- Dataset: https://huggingface.co/datasets/darkc0de/The-Mind-of-XORTRON
- Trend Micro Research - Malicious Uses and Abuses of Artificial Intelligence: https://documents.trendmicro.com/assets/white_papers/wp-malicious-uses-and-abuses-of-artificial-intelligence.pdf
- TRM Labs - The Rise of AI-Enabled Crime: https://www.trmlabs.com/resources/blog/the-rise-of-ai-enabled-crime-exploring-the-evolution-risks-and-responses-to-ai-powered-criminal-enterprises
- American Military University - AI-Enabled Crime: https://www.amu.apus.edu/area-of-study/criminal-justice/resources/ai-enabled-crime/
- United States Congress - 119th Congress Hearing Record: https://www.congress.gov/119/chrg/CHRG-119hhrg61182/CHRG-119hhrg61182.pdf
- KELA AI Cybercrime Report Q4 2026: https://www.kelacyber.com/resources/research/ai-cybercrime-report-q4-2026/
- CrowdStrike 2026 Global Threat Report: https://go.crowdstrike.com/2026-global-threat-report.html
- xortron.ai: https://xortron.ai

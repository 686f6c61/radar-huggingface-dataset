# Mydatagent-ai/ralf-v9-GGUF

## Resumen

Ralf v9 GGUF es la versión cuantizada en formato GGUF del modelo `Mydatagent-ai/ralf-v9-merged`, un asistente especializado en derecho empresarial, tributario y societario brasileño, desarrollado por MyDatAgent (MDA). El modelo está entrenado exclusivamente en portugués de Brasil y su foco central es la "antifabricación": reducir la invención de leyes, cifras y precedentes, un problema crítico en dominios legales donde una alucinación puede tener consecuencias graves.

El artefacto publicado es una cuantización Q4_K_M generada con `llama.cpp` (build b12738) a partir del merge en BF16. Con 27.320.697.856 parámetros totales (aproximadamente 27,3 mil millones) y un repositorio de 17 GB, se sitúa en la franja de modelos de tamaño medio-grande que requieren hardware de gama alta para inferencia cómoda.

La relevancia de esta ficha radica en que el modelo se distribuye con licencia Apache 2.0, lo que permite uso comercial, y está empaquetado en un formato (GGUF) compatible con runtimes de inferencia locales como llama.cpp, Ollama o LM Studio. No obstante, el autor advierte explícitamente que la degradación introducida por la cuantización Q4_K_M no fue medida con su harness interno de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer; detalles no publicados en la información disponible) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (output y embeddings en Q6_K) |
| Idiomas soportados | portugués de Brasil (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (artefacto publicado); BF16 en el modelo base `ralf-v9-merged` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de que se trata de un modelo transformer (por el formato GGUF y el uso de `llama.cpp`). El modelo se distribuye como un merge BF16 (`Mydatagent-ai/ralf-v9-merged`) del que se desconoce la receta de entrenamiento: no se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado.

El elemento técnico diferencial declarado es el enfoque en "antifabricación". El autor menciona una "régua interna de fidelidade" (conjunto de evaluación interno) compuesta por 510 generaciones determinísticas evaluadas con un juez LLM, validada sobre el merge BF16 con un delta de 0,0 puntos porcentuales frente al adaptador en todas las franjas evaluadas. Esta métrica de fidelidad no se ha aplicado sobre la versión cuantizada Q4_K_M, porque el harness de evaluación funciona sobre transformers y no sobre llama.cpp.

La cuantización se generó con `llama.cpp` build b12738, aplicando Q4_K_M al conjunto del modelo y manteniendo la capa de salida y los embeddings en Q6_K, una configuración habitual para preservar calidad en esos componentes sensibles.

## Capacidades

- Generación de texto en portugués de Brasil con registro técnico-jurídico.
- Asistencia en derecho empresarial, tributario y societario brasileño.
- Enfoque declarado en antifabricación: el modelo está instruido para no inventar leyes, números ni precedentes y para señalar incertidumbre cuando no dispone de información fiable.
- Conversación multi-turno (etiqueta `conversational` en el repositorio).
- Compatible con plantilla de chat propia (`chat_template.jinja`) que incluye un system prompt orientado a rigor técnico y decisión práctica para ejecutivos, socios y gestores.
- Compatibilidad con endpoints (`endpoints_compatible` en las etiquetas del repositorio).
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Consultas tributarias para pymes: el modelo puede responder preguntas sobre obligaciones fiscales, regímenes tributarios y plazos en el marco brasileño, con el foco en antifabricación como salvaguarda frente a la invención de normativa; aun así, requiere verificación humana de cada referencia.
- Soporte a departamentos jurídicos internos: borradores de respuestas y resúmenes de cuestiones societarias (constitución de sociedades, obligaciones de socios, gobierno corporativo) en portugués de Brasil, con revisión posterior por un abogado.
- Formación y onboarding de equipos financieros: generación de explicaciones didácticas sobre conceptos tributarios y empresariales, aprovechando el registro técnico y la orientación a decisión práctica del system prompt recomendado.
- Asistencia en la redacción de documentos internos: plantillas de políticas, actas y comunicaciones corporativas en portugués de Brasil, con el modelo actuando como primer borrador sujeto a revisión.
- Despliegue local en entornos con requisitos de confidencialidad: al estar en formato GGUF y licencia Apache 2.0, puede ejecutarse en infraestructura propia (llama.cpp, Ollama, LM Studio) sin enviar datos jurídicos sensibles a servicios externos.
- Prototipado de asistentes verticales: servir como base para aplicaciones de consulta legal-empresarial en portugués, con la advertencia de que el autor no garantiza la exactitud de las salidas y de que la cuantización Q4_K_M no ha sido evaluada con la métrica interna de fidelidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta la validación de la "régua interna de fidelidad" (510 generaciones determinísticas con juez LLM) sobre el merge BF16, con un delta de 0,0 puntos porcentuales frente al adaptador, y aclara que esa métrica no se aplicó a la versión Q4_K_M.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio GGUF ocupa 17 GB; con overhead de contexto y runtime, se recomienda al menos 20-24 GB de VRAM para Q4_K_M.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para Q4_K_M con contexto moderado; GPU con 16 GB requerirían cuantizaciones más agresivas no publicadas en este repositorio.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y potencialmente en RTX 3090 (24 GB); en GPUs de 16 GB no cabe con esta cuantización.
- Opciones de despliegue: llama.cpp (build b12738 o superior), Ollama, LM Studio, llama-cpp-python; el autor no documenta soporte para vLLM ni TGI con este artefacto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Ralf v9 GGUF (este) | 27,3 B | no disponible | pt-BR | Apache 2.0 | GGUF Q4_K_M |
| Alternativas de dominio legal en portugués | no disponible | no disponible | no disponible | no disponible | no disponible |
| Modelos generalistas de ~27 B en GGUF | ~27 B | variable según familia | multilingüe | variable | GGUF |

No se dispone de información sobre modelos comparables de la misma categoría (asistentes legales en portugués de Brasil) en la documentación proporcionada, por lo que la comparativa cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- El autor advierte explícitamente que las salidas pueden contener errores y fabricaciones, y que deben verificarse normas, cifras y plazos antes de tomar decisiones.
- El modelo no constituye asesoramiento jurídico, contable ni tributario.
- La degradación de calidad introducida por la cuantización Q4_K_M no ha sido medida con la métrica interna de fidelidad; se espera alguna pérdida frente al BF16.
- El modelo está entrenado exclusivamente en portugués de Brasil y limitado a temas empresariales; no se debe esperar buen rendimiento en otros idiomas ni en dominios ajenos.
- No se documentan sesgos conocidos, longitud de contexto ni comportamiento en tool calling o agentes.
- Licencia Apache 2.0: permite uso comercial, pero el modelo se entrega "tal cual", sin garantía.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Mydatagent-ai/ralf-v9-GGUF
- Modelo base (merge BF16): https://huggingface.co/Mydatagent-ai/ralf-v9-merged
- Modelo original: https://huggingface.co/Mydatagent-ai/ralf-v9
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai

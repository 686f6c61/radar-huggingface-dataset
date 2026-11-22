# mradermacher/Qwen3.5-9B-CyberSecurity-Abliterated-i1-GGUF

## Resumen

Qwen3.5-9B-CyberSecurity-Abliterated-i1-GGUF es una cuantización GGUF del modelo jeonjw/Qwen3.5-9B-CyberSecurity-Abliterated, un ajuste fino de la familia Qwen3.5 orientado a ciberseguridad y con la alineación de seguridad eliminada (técnica conocida como *abliteration*). El autor de la cuantización es mradermacher, especialista en publicar versiones GGUF con calibración imatrix de modelos populares de la comunidad.

El modelo base cuenta con 8.953.803.264 parámetros (aproximadamente 9B), lo que lo sitúa en la gama media de modelos densos desplegables en hardware de consumo. La cuantización i1 utiliza ficheros imatrix para preservar mejor la calidad en cada nivel de compresión, ofreciendo desde IQ1_S (2,8 GB) hasta Q6_K (7,7 GB).

La relevancia de esta ficha radica en que combina tres factores poco habituales: especialización declarada en ciberseguridad, eliminación de los mecanismos de rechazo del modelo original y disponibilidad en formato GGUF listo para llama.cpp/Ollama. Esto lo hace atractivo para investigación en seguridad ofensiva y análisis de robustez de alineación, pero también plantea advertencias importantes sobre uso responsable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.5); detalles específicos no disponibles |
| Parametros totales | 8.953.803.264 (~9B) |
| Parametros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (además de fichero imatrix) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un ajuste fino de la familia Qwen3.5, un transformer denso de aproximadamente 9B parámetros. La model card del repositorio de cuantización no aporta detalles sobre la composición del dataset de entrenamiento, el número de tokens utilizados, ni si hubo fases de RLHF, DPO o SFT específicas. Tampoco se documenta la longitud de contexto nativa ni innovaciones técnicas concretas (atención lineal, decodificación especulativa, etc.).

La característica técnica diferencial es el proceso de *abliteration* aplicado por el autor del modelo base (jeonjw), que consiste en eliminar o atenuar las direcciones de activación asociadas a los rechazos de seguridad del modelo original. El resultado es un modelo que responde a solicitudes que el Qwen3.5 original rechazaría, lo que constituye el eje central de su propuesta y también de sus riesgos. La cuantización i1 de mradermacher aplica calibración imatrix (fichero de importancia por tensor) para minimizar la pérdida de calidad en cada nivel de compresión.

## Capacidades

- Generación de texto conversacional en inglés, con orientación declarada a contenidos de ciberseguridad.
- Respuestas a solicitudes que el modelo base rechazaría, gracias a la eliminación de la alineación de seguridad (abliteration).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales: la model card menciona que el modelo base es un modelo de visión ("This is a vision model") y que los ficheros mmproj, si existen, se encuentran en el repositorio estático; no se confirma que la cuantización i1 incluya proyección multimodal.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integración con infraestructura de inferencia estándar.

## Casos de uso

- Investigación en seguridad ofensiva autorizada: el modelo puede emplearse en entornos de pentesting con permiso explícito para generar hipótesis de ataque, payloads de prueba o análisis de vulnerabilidades, aprovechando que no rechaza solicitudes técnicas legítimas de seguridad.
- Análisis de robustez de alineación: investigadores pueden usar el modelo como caso de estudio para medir qué capacidades peligrosas emergen tras eliminar la alineación, comparándolo con el Qwen3.5 original.
- Red teaming de sistemas de IA: útil para generar prompts adversarios y evaluar las defensas de otros modelos o filtros de contenido en pipelines de moderación.
- Formación y concienciación en ciberseguridad: generación de escenarios de ataque simulados y explicaciones técnicas para equipos de seguridad, con la ventaja de ejecutarse localmente en hardware de consumo.
- Despliegue local con Ollama o llama.cpp: al estar en GGUF, puede ejecutarse en estaciones de trabajo sin GPU dedicada (cuantizaciones Q4_K_M de 5,7 GB) para tareas de análisis de texto técnico en inglés.
- Automatización de documentación técnica de seguridad: redacción de informes de vulnerabilidades, resúmenes de CVEs y guías de mitigación, siempre con revisión humana dado el riesgo de alucinación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto):
  - i1-IQ1_S (2,8 GB): ~3,5-4 GB de VRAM.
  - i1-Q2_K (3,9 GB): ~4,5-5 GB.
  - i1-IQ3_M (4,5 GB): ~5-5,5 GB.
  - i1-Q4_K_M (5,7 GB): ~6,5-7 GB.
  - i1-Q5_K_M (6,5 GB): ~7,5-8 GB.
  - i1-Q6_K (7,7 GB): ~9-10 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090; en datacenter, A100 o H100 para mayor throughput.
- Cabe en GPU de consumo: sí, desde una RTX 3060 12 GB o incluso GPUs de 8 GB con cuantizaciones Q3/IQ3; las cuantizaciones IQ1/IQ2 caben en 4-6 GB pero con degradación notable de calidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui; vLLM y TGI no soportan GGUF de forma nativa (requerirían el modelo base en safetensors).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-CyberSecurity-Abliterated-i1-GGUF (este) | ~9B | no disponible | apache-2.0 | GGUF | Especializado en ciberseguridad, alineación eliminada |
| Qwen3.5-9B-CyberSecurity-Abliterated (base) | ~9B | no disponible | apache-2.0 | safetensors | Modelo original sin cuantizar |
| Qwen3.5-9B (original) | ~9B | no disponible | no disponible | safetensors/GGUF | Alineación intacta, rechaza solicitudes sensibles |
| Otras cuantizaciones GGUF de la familia Qwen3.5 | ~9B | no disponible | apache-2.0 | GGUF | Sin especialización en ciberseguridad ni abliteration |

No se dispone de datos de rendimiento comparativo (benchmarks) para establecer diferencias cuantitativas entre estas alternativas.

## Limitaciones y advertencias

- El modelo ha sido sometido a *abliteration*, lo que elimina los mecanismos de rechazo; puede generar contenido dañino, instrucciones de ataque o material ilegal. Su uso debe limitarse a investigación autorizada y entornos controlados.
- Riesgo elevado de alucinación en contenidos técnicos de seguridad: las respuestas pueden parecer plausibles pero ser incorrectas; requiere verificación humana.
- Idiomas: solo inglés según la model card; el rendimiento en castellano no está garantizado ni documentado.
- Longitud de contexto no documentada; no se recomienda asumir ventanas largas sin pruebas empíricas.
- La licencia apache-2.0 permite uso comercial, pero el uso comercial de un modelo sin alineación conlleva riesgos legales y reputacionales según la jurisdicción y el caso de uso.
- Las cuantizaciones de baja precisión (IQ1, IQ2, Q2_K) degradan notablemente la calidad; para producción se recomienda Q4_K_M o superior.
- No se confirma que la cuantización i1 incluya los ficheros mmproj de visión; verificar en el repositorio estático antes de asumir capacidades multimodales.
- El repositorio tiene 0 likes y fue creado en noviembre de 2026; la madurez y el soporte de la comunidad son limitados.

## Enlaces

- Repositorio Hugging Face de la cuantización: https://huggingface.co/mradermacher/Qwen3.5-9B-CyberSecurity-Abliterated-i1-GGUF
- Página de descarga del autor: https://hf.tst.eu/model#Qwen3.5-9B-CyberSecurity-Abliterated-i1-GGUF
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/Qwen3.5-9B-CyberSecurity-Abliterated-GGUF
- Modelo base: https://huggingface.co/jeonjw/Qwen3.5-9B-CyberSecurity-Abliterated
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF

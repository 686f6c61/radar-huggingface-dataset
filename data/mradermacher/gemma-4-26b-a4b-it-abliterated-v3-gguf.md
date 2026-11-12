# mradermacher/gemma-4-26B-A4B-it-abliterated-v3-GGUF

## Resumen

`mradermacher/gemma-4-26B-A4B-it-abliterated-v3-GGUF` es una cuantización en formato GGUF del modelo `jsantillana/gemma-4-26B-A4B-it-abliterated-v3`, una variante "abliterated" de un modelo de la familia Gemma 4 con arquitectura Mixture of Experts (MoE). El nombre indica 26B parámetros totales con 4B activos por token, y el sufijo "it" sugiere un ajuste instruccional previo. La "abliteración" es una técnica de modificación de pesos que elimina la dirección de rechazo (*refusal direction*) en el espacio de activaciones, de modo que el modelo deja de negarse a responder a ciertas peticiones.

El trabajo de cuantización lo firma mradermacher, un conocido publicador de quants GGUF para llama.cpp, que ofrece múltiples niveles de compresión (desde Q2_K hasta Q8_0) más los ficheros `mmproj` necesarios para el procesamiento multimodal. El modelo está etiquetado con intereses de ciberseguridad, interpretabilidad e investigación, y declara soporte para inglés y español.

Es relevante ahora porque combina tres tendencias activas: arquitecturas MoE eficientes en inferencia (4B activos sobre 26B totales), publicación de variantes sin rechazo para investigación en seguridad y alineamiento, y distribución en GGUF para ejecución local. La licencia es restrictiva (`apache-2.0-restricted-research`) y limita explícitamente el uso a investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture of Experts (MoE), según nomenclatura A4B; detalles de capas no disponibles |
| Parámetros totales | 25.233.142.046 (≈25,2B, dato real de safetensors) |
| Parámetros activos | ≈4B (según el sufijo A4B del nombre; no confirmado en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16; no hay quants con imatrix |
| Idiomas soportados | en, es |
| Licencia | apache-2.0-restricted-research (etiquetada como `other` en Hugging Face) |
| Formato de pesos | GGUF (cuantizado); el modelo base original presumiblemente en safetensors |

## Arquitectura y entrenamiento

La información disponible confirma una arquitectura MoE con aproximadamente 25,2B parámetros totales y, por el nombre `A4B`, unos 4B activos por token. No se detalla el número de expertos, el número de capas, la dimensión oculta ni la estrategia de enrutamiento. El modelo base es `jsantillana/gemma-4-26B-A4B-it-abliterated-v3`, del que no se aportan datos de entrenamiento (número de tokens, composición del dataset, fases de RLHF/DPO) en la información proporcionada.

La innovación técnica central es la **abliteración**: en lugar de un ajuste fino adicional, se identifica una dirección en el espacio de activaciones asociada al rechazo y se proyectan fuera los pesos correspondientes, de modo que el modelo pierde el comportamiento de negativa sin reentrenar. Los tags incluyen `refusal-direction`, `cybersecurity` e `interpretability`, lo que sugiere que la variante está orientada a estudiar mecanismos de seguridad y alineamiento. La cuantización la realiza mradermacher con `convert_type: hf` y `output_tensor_quantised: 1`, sin quants ponderados por imatrix en el momento de la publicación.

## Capacidades

- Generación de texto conversacional (`pipeline_tag` no declarado, pero el tag `conversational` está presente).
- Razonamiento y respuesta a instrucciones, heredado del ajuste `it` del modelo base.
- Procesamiento multimodal: la presencia de ficheros `mmproj-Q8_0` y `mmproj-f16` indica soporte de entrada de imágenes mediante proyector multimodal.
- Capacidades multilingües limitadas a inglés y español según los metadatos.
- Comportamiento sin rechazo (abliterated): responde a peticiones que el modelo original rechazaría, lo que es el objetivo declarado de la variante.
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes multi-paso: no disponible en la información.
- Modo "thinking" o razonamiento extendido: no disponible en la información.

## Casos de uso

- **Investigación en alineamiento y seguridad**: estudiar cómo se distribuye la dirección de rechazo en un MoE y qué efectos tiene su eliminación sobre la utilidad y la calibración; el modelo sirve como sujeto de experimentos controlados frente a su versión no abliterated.
- **Red teaming y evaluación de salvaguardas**: generar respuestas a peticiones que los modelos alineados rechazan para medir la robustez de filtros externos y clasificadores de contenido en pipelines de moderación.
- **Análisis de interpretabilidad de MoE**: comparar activaciones de expertos entre la variante abliterated y la original para localizar qué expertos concentran el comportamiento de negativa.
- **Despliegue local en estaciones de trabajo**: con el quant Q4_K_M (16,9 GB) el modelo cabe en GPUs de consumo con 24 GB de VRAM, útil para prototipado offline sin depender de APIs.
- **Asistente conversacional bilingüe (en/es)**: conversaciones multi-turno en inglés y español en entornos donde el rechazo del modelo base resulta un obstáculo, por ejemplo para redacción técnica sensible.
- **Procesamiento de documentos con imágenes**: gracias a los ficheros `mmproj`, se puede usar para tareas de descripción o extracción de información de capturas y diagramas en un pipeline local con llama.cpp.
- **Ciberseguridad defensiva y análisis**: el tag `cybersecurity` sugiere uso en análisis de vulnerabilidades y discusión de técnicas ofensivas/defensivas donde un modelo alineado bloquearía la conversación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye una gráfica genérica de perplejidad por tipo de cuantización (enlace externo) y no reporta MMLU, HumanEval, GSM8K ni métricas comparativas.

## Requisitos de hardware

- **VRAM estimada para inferencia** (según tamaño del fichero GGUF, más overhead de contexto):
  - Q2_K: ~10,7 GB.
  - Q3_K_M: ~13,4 GB.
  - Q4_K_S / Q4_K_M: ~15,6–16,9 GB.
  - Q5_K_M: ~19,2 GB.
  - Q6_K: ~22,7 GB.
  - Q8_0: ~27,0 GB.
  - Añadir ~0,9–1,3 GB si se usa el proyector multimodal.
- **GPU recomendadas**: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M con contexto moderado; RTX 3090 (24 GB) equivalente; A100 40 GB o H100 80 GB para Q8_0 con contexto largo; GPUs de 16 GB (RTX 4080, 4070 Ti Super) solo para Q2_K/Q3_K con contexto reducido.
- **¿Cabe en GPU de consumo?** Sí: los quants Q4_K_S y Q4_K_M caben en 24 GB, y los Q2_K/Q3_K caben en 12–16 GB.
- **Opciones de despliegue**: llama.cpp y sus frontends (Ollama, LM Studio, llama-cpp-python, KoboldCpp). El tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI. vLLM y TGI no están confirmados para este GGUF en la información disponible.
- **Latencia y throughput**: no disponibles. Al ser MoE con ~4B activos, se espera un throughput superior al de un denso de 25B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Este modelo (gemma-4-26B-A4B-it-abliterated-v3-GGUF) | ≈25,2B | ≈4B (según nombre) | no disponible | apache-2.0-restricted-research | GGUF | Abliterated, multimodal |
| `jsantillana/gemma-4-26B-A4B-it-abliterated-v3` | ≈25,2B | ≈4B | no disponible | no disponible | safetensors | Modelo base del que deriva este GGUF |
| Modelo Gemma 4 26B-A4B-it original | ≈25,2B | ≈4B | no disponible | no disponible (Gemma suele usar Gemma Terms) | safetensors | Versión alineada, con rechazo |
| Otros quants GGUF del mismo modelo base | ≈25,2B | ≈4B | no disponible | según autor del quant | GGUF | Alternativas de cuantización de mradermacher u otros |

No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con alternativas de la misma categoría.

## Limitaciones y advertencias

- **Licencia restrictiva**: `apache-2.0-restricted-research` limita el uso a investigación; no se autoriza explícitamente el uso comercial. Verificar los términos antes de cualquier despliegue en producción.
- **Modelo abliterated**: la eliminación de la dirección de rechazo reduce las salvaguardas del modelo original; puede generar contenido dañino, ilegal o inseguro. No apto para aplicaciones orientadas al público sin filtros externos.
- **Riesgo de alucinación**: no hay evaluaciones publicadas de fidelidad; como todo modelo generativo, puede inventar datos, especialmente en dominios técnicos de ciberseguridad.
- **Idiomas**: solo inglés y español declarados; el rendimiento en otros idiomas no está evaluado.
- **Contexto**: la longitud de contexto no está documentada en la información disponible, lo que impide planificar despliegues con ventanas largas.
- **Cuantización**: los quants Q2_K y Q3_K_M degradan la calidad (la propia model card marca Q3_K_M como "lower quality"); para producción local se recomienda Q4_K_M o superior.
- **Sin quants imatrix**: no hay versiones ponderadas por importancia, lo que puede afectar la perplejidad frente a quants imatrix equivalentes.
- **Metadatos incompletos**: `pipeline_tag` no declarado, sin benchmarks, sin detalles de entrenamiento ni de arquitectura interna; la trazabilidad del modelo base es limitada.
- **Sesgos**: no se documentan sesgos; la abliteración puede amplificar sesgos presentes en el modelo original al eliminar respuestas de cautela.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/gemma-4-26B-A4B-it-abliterated-v3-GGUF
- Modelo base: https://huggingface.co/jsantillana/gemma-4-26B-A4B-it-abliterated-v3
- Página de descargas del autor: https://hf.tst.eu/model#gemma-4-26B-A4B-it-abliterated-v3-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica de perplejidad por cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- nethype GmbH (empresa del autor): https://www.nethype.de/

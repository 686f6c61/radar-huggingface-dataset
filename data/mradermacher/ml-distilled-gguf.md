# mradermacher/ML-Distilled-GGUF

## Resumen

ML-Distilled-GGUF es la colección de cuantizaciones en formato GGUF del modelo Nabbers1999/ML-Distilled, publicada por mradermacher, un conocido generador de cuantizaciones de la comunidad de HuggingFace. El modelo base es un ajuste fino supervisado (SFT) mediante la librería TRL, con un total de 13.477.237.760 parámetros (aproximadamente 13.500 millones), lo que lo sitúa en la categoría de modelos de tamaño medio-grande. El repositorio contiene únicamente los pesos cuantizados, no el modelo original ni información sobre su arquitectura interna.

La relevancia de esta ficha radica en que permite ejecutar localmente un modelo de ~13.5B parámetros en hardware de consumo mediante cuantizaciones que van desde 5,3 GB (Q2_K) hasta 14,4 GB (Q8_0). Sin embargo, la información disponible es muy limitada: no se especifica la arquitectura base, la longitud de contexto, los datos de entrenamiento ni los resultados de benchmarks. El modelo está etiquetado únicamente para inglés y no se indica licencia, lo que supone una advertencia importante para uso comercial.

Se trata, por tanto, de un artefacto de cuantización derivado, no de un modelo con documentación técnica propia. Cualquier evaluación rigurosa debería remitirse al modelo base Nabbers1999/ML-Distilled, cuya model card tampoco aporta detalles técnicos sustanciales según la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base ajustado con TRL/SFT; arquitectura subyacente no especificada) |
| Parámetros totales | 13.477.237.760 (~13,5B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |
| Tamaño del repositorio | 93,0 GB |
| Modelo base | Nabbers1999/ML-Distilled |
| Cuantizador | mradermacher |
| Librería declarada | transformers |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base. Los metadatos indican que fue entrenado mediante SFT (supervised fine-tuning) con la librería TRL y que procede de un proceso `generated_from_trainer`, lo que sugiere un ajuste supervisado sobre un modelo preentrenado no identificado. No se especifica si se trata de un transformer denso, un modelo MoE o una arquitectura híbrida, ni se detallan el número de tokens de entrenamiento, la composición del dataset o si hubo etapas de RLHF o DPO.

La única innovación técnica documentada en esta ficha es el propio proceso de cuantización: mradermacher ofrece cuantizaciones estáticas (este repositorio) y cuantizaciones ponderadas con imatrix en un repositorio separado (mradermacher/ML-Distilled-i1-GGUF). Las cuantizaciones IQ (como IQ4_XS) suelen ofrecer mejor relación calidad/tamaño que las K-quants de tamaño similar, según las notas del propio autor. No hay información sobre decodificación especulativa, atención lineal u otras optimizaciones.

## Capacidades

- Generación de texto conversacional: el tag `conversational` y el formato de chat indican que el modelo está orientado a diálogo multi-turno.
- Ajuste fino supervisado (SFT): entrenado con TRL, lo que sugiere capacidad de seguir instrucciones, aunque no se detalla el dataset ni el formato exacto.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según el campo `language: en`.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que puede desplegarse mediante la infraestructura de endpoints de HuggingFace.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: con cuantizaciones Q4_K_M (8,3 GB) o Q5_K_M (9,7 GB), el modelo puede ejecutarse en GPUs con 12-16 GB de VRAM, como una RTX 4070 Ti o RTX 4080, usando llama.cpp u Ollama para prototipos de asistentes conversacionales en inglés.
- Experimentación con ajuste fino supervisado: investigadores que quieran estudiar el efecto del SFT con TRL pueden usar el modelo base como referencia y comparar con las cuantizaciones para evaluar la degradación por cuantización.
- Chatbot de soporte en inglés para entornos controlados: el formato conversacional permite integrarlo en aplicaciones de atención al cliente de baja concurrencia, siempre que se valide previamente la calidad de las respuestas y se asuma el riesgo de alucinación.
- Generación de texto asistida en documentación técnica: para redactar borradores o resúmenes en inglés en pipelines internos, usando la cuantización Q8_0 (14,4 GB) cuando se disponga de 24 GB de VRAM y se priorice la fidelidad.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 11 variantes, lo que permite medir empíricamente la pérdida de perplejidad entre Q2_K y Q8_0 en tareas concretas, útil para calibrar el compromiso calidad/tamaño.
- Base para investigación sobre destilación: dado el nombre "ML-Distilled", puede servir como punto de partida para estudiar técnicas de destilación, aunque la model card no documenta el proceso de destilación.
- Inferencia en CPU: las cuantizaciones Q2_K (5,3 GB) y Q3_K_S (6,2 GB) permiten ejecución en CPU con RAM suficiente, útil para pruebas offline o entornos sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q2_K: ~5,3 GB de pesos; ~6-7 GB de VRAM con overhead de contexto.
  - Q3_K_M: ~6,8 GB; ~8 GB de VRAM.
  - IQ4_XS: ~7,6 GB; ~9 GB de VRAM.
  - Q4_K_M: ~8,3 GB; ~10 GB de VRAM.
  - Q5_K_M: ~9,7 GB; ~11-12 GB de VRAM.
  - Q6_K: ~11,2 GB; ~13 GB de VRAM.
  - Q8_0: ~14,4 GB; ~16 GB de VRAM.
- GPU recomendadas:
  - Consumer: RTX 3060 12 GB (Q4_K_S/Q4_K_M), RTX 4070 Ti / 4080 16 GB (Q5_K_M/Q6_K), RTX 4090 24 GB (Q8_0 con contexto amplio).
  - Profesional: A100 40/80 GB, H100, L40S para despliegues con concurrencia.
- ¿Cabe en GPU de consumo? Sí, todas las cuantizaciones hasta Q8_0 caben en GPUs de 16 GB o más; las variantes Q2_K a Q4_K_M caben en 8-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF como llama-cpp-python. El tag `endpoints_compatible` sugiere también despliegue vía HuggingFace Endpoints. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requerirían los pesos safetensors del modelo base.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de información suficiente sobre el modelo base (arquitectura, contexto, rendimiento) para establecer una comparativa rigurosa con alternativas de la misma categoría. Los modelos de ~13B parámetros más habituales en el ecosistema GGUF (por ejemplo, Llama 3 8B, Mistral 7B o Qwen2.5 14B) tienen arquitecturas y licencias documentadas, pero no se puede afirmar que sean comparables sin conocer la arquitectura y el entrenamiento de ML-Distilled.

| Modelo | Parámetros | Contexto | Licencia | Formato GGUF | Documentación |
|---|---|---|---|---|---|
| ML-Distilled-GGUF | ~13,5B | no disponible | no disponible | Sí (11 cuantizaciones) | Muy limitada |
| Alternativas de ~13-14B | ~13-14B | 4K-128K según modelo | varía | Sí | Disponible |
| Comparativa detallada | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no especificada: no se indica la licencia del modelo base ni de las cuantizaciones, lo que impide determinar si el uso comercial está permitido. Es imprescindible contactar con el autor del modelo base antes de cualquier despliegue en producción.
- Idiomas: solo inglés declarado; no hay evidencia de capacidades en castellano u otros idiomas.
- Documentación insuficiente: se desconoce la arquitectura, el contexto máximo, el dataset de entrenamiento y el proceso de destilación, lo que dificulta evaluar sesgos y robustez.
- Riesgo de alucinación: no cuantificado; al ser un modelo SFT sin documentación de alineamiento (RLHF/DPO no confirmados), el riesgo de respuestas inventadas es plausible y debe validarse empíricamente.
- Sesgos conocidos: no documentados; al no conocerse la composición del dataset, no se pueden identificar sesgos específicos.
- Degradación por cuantización: las variantes Q2_K y Q3_K_S pueden degradar notablemente la calidad; el autor recomienda Q4_K_S/Q4_K_M como opción rápida y Q8_0 como mejor calidad.
- Repositorio de 93 GB: requiere espacio en disco considerable si se descargan todas las variantes; conviene descargar solo la cuantización necesaria.
- Sin benchmarks: no hay métricas publicadas que permitan comparar su rendimiento con alternativas, lo que aumenta el riesgo de adoptarlo sin evaluación previa.
- Modelo derivado: cualquier problema del modelo base se hereda; la cuantización no corrige defectos de entrenamiento.

## Enlaces

- Repositorio HuggingFace de las cuantizaciones: https://huggingface.co/mradermacher/ML-Distilled-GGUF
- Modelo base: https://huggingface.co/Nabbers1999/ML-Distilled
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/ML-Distilled-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#ML-Distilled-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests

# john-0824/Qwen3.8-27B-Obliterated

## Resumen

Qwen3.8-27B-Obliterated es una variante del modelo Qwen/Qwen3.8-27B del equipo Qwen a la que se le ha practicado una cirugía de pesos (abliteration) para eliminar el comportamiento de rechazo (refusal). El autor de la ficha en Hugging Face es john-0824 y la intervención se realizó con el toolkit OBLITERATUS (v0.1.4, commit b2e65a7) de elder-plinius. El resultado es un modelo de 27.356.728.560 parámetros (unos 27,4 mil millones) que conserva la arquitectura y capacidades del modelo base, pero que responde a peticiones que el original rechazaría.

La relevancia de este tipo de modelos es doble: por un lado, sirve como herramienta de investigación en alineación y red-teaming, ya que permite estudiar de forma controlada qué ocurre cuando se suprime la dirección de rechazo; por otro, plantea riesgos evidentes de uso indebido, por lo que el autor lo restringe explícitamente a evaluación de seguridad y experimentación local responsable. El modelo base pertenece a la familia Qwen3.5 (tag `qwen3_5` en Hugging Face) y está etiquetado como `image-text-to-text`, lo que sugiere capacidades multimodales heredadas del original.

La intervención es quirúrgica y verificable: el 93 % de los tensores son idénticos byte a byte al modelo base, y el cambio se concentra en 78 "residual writers" (16,3 % de los parámetros). Según la model card, el modelo mantiene la coherencia (1,00) y la perplejidad relativa (1,006) prácticamente intactas, con una tasa de rechazo del 1,52 % frente al 96 % del base en el conjunto de test retenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, tag `qwen3_5`); incluye capas de atención lineal y atención estándar según la receta de abliteración (30 linear-attention out_proj, 9 attention o_proj) |
| Parametros totales | 27.356.728.560 (~27,4 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo solo con safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B (revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`) y no ha sido reentrenado: la modificación consiste en proyectar fuera el subespacio de dirección de rechazo (8 direcciones SVD) de los pesos "residual writer" de las capas 12 a 50. En concreto, se intervinieron 30 `out_proj` de atención lineal, 9 `o_proj` de atención y 39 `down_proj` de MLP, aplicando regularización con preservación de norma de 0,05, refinamiento RDO, winsorización de activaciones (0,01) y cooptimización KL. El proceso se ejecutó con la plantilla de chat aplicada y usó el corpus inmutable de 842 pares harmful/harmless del toolkit, con un split de entrenamiento de 500 pares y semilla 0.

La innovación técnica principal es precisamente la metodología de abliteración: en lugar de un fine-tuning completo, se realiza una cirugía sobre un subconjunto pequeño de tensores, lo que preserva casi por completo el resto del modelo (93 % de tensores idénticos byte a byte). Esto se traduce en métricas de retención muy altas: coherencia 1,00, ratio de perplejidad 1,006 y KL de secuencia frente al base de 0,111 nats. La model card no detalla la composición del dataset de preentrenamiento original de Qwen3.8-27B ni si hubo RLHF/DPO en el base; esa información correspondería a la ficha del modelo original.

## Capacidades

- Generación de texto conversacional y razonamiento general, heredados del modelo base Qwen3.8-27B.
- Procesamiento image-text-to-text: la etiqueta de Hugging Face indica soporte multimodal de entrada (imagen y texto), aunque la model card no detalla el alcance exacto.
- Respuesta a peticiones que el modelo base rechazaría: la tasa de rechazo cae del 96,00 % al 1,52 % en el conjunto de evaluación del autor.
- Coherencia y fluidez preservadas: retención 1,00 y perplejidad relativa 1,006 frente al base.
- Rendimiento en conocimiento general prácticamente intacto: MMLU 0-shot del 86,3 % frente al 85,3 % del base (570 preguntas, log-prob).
- Pruebas deterministas de capacidad: 5/6 superadas, idénticas al base.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito, visión o audio: no disponible en la información proporcionada (más allá de la etiqueta image-text-to-text).

## Casos de uso

- Investigación en alineación y mecanística de la interpretabilidad: el modelo permite comparar el comportamiento del base y de la variante abliterada sobre los mismos prompts para estudiar cómo se codifica la dirección de rechazo en los pesos residuales, con la ventaja de que el 93 % de los tensores son idénticos y el resto del comportamiento se mantiene estable.
- Red-teaming y evaluación de seguridad: sirve como modelo "sin guardarraíles" controlado para probar clasificadores de contenido, filtros de salida y pipelines de moderación antes de desplegarlos en producción, midiendo falsos negativos frente a un modelo que sí rechaza.
- Auditoría de sistemas de moderación: al generar respuestas que el base rechazaría, permite construir conjuntos de evaluación adversariales y verificar la robustez de los filtros de entrada y salida de una plataforma.
- Experimentación local responsable: al ser Apache-2.0 y de tamaño medio (27,4 B), puede ejecutarse en entornos de investigación con GPU de gama alta para estudiar dinámicas de refusal sin depender de APIs externas.
- Estudio de la estabilidad del modelo tras cirugía de pesos: las métricas de perplejidad, KL y MMLU permiten validar metodologías de abliteración y comparar toolkits (OBLITERATUS frente a otras implementaciones) sobre un mismo modelo base.
- Análisis de sesgos y contenido dañino: generar respuestas sin rechazo facilita la recolección de ejemplos para taxonomías de daño y para el entrenamiento de clasificadores de seguridad, siempre en un entorno aislado y con revisión humana.
- Evaluación comparativa de capacidades: usar el par base/abliterado como control en benchmarks para aislar cuánto del rendimiento depende de los mecanismos de rechazo y cuánto de las capacidades subyacentes.

## Benchmarks y rendimiento

Datos publicados en la model card (conjunto de test retenido de 200 prompts, protocolo idéntico en ambos lados):

| Metrica | Base | Qwen3.8-27B-Obliterated |
|---|---|---|
| Tasa de rechazo (completions válidas) | 96,00 % (192/200) | 1,52 % (3/198; Wilson 95 % [0,52 %, 4,36 %]) |
| Completions harmful inválidas/degeneradas | 0 % | 1 % |
| Coherencia (retención) | 1,00 | 1,00 (100 %) |
| Pruebas deterministas de capacidad (6) | 5/6 | 5/6 (ítems idénticos) |
| Ratio de perplejidad | 1,000 | 1,006 |
| KL de secuencia frente al base (nats) | 0 | 0,111 |
| MMLU 0-shot (570 preguntas, log-prob) | 85,3 % | 86,3 % (+1,1 pp) |

El scorer de rechazo es el léxico del toolkit (plantilla de chat, greedy, 128 tokens, inválidos excluidos). No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (27,4 B de parámetros), en FP16 se necesitan aproximadamente 55 GB de VRAM solo para pesos; en cuantización de 8 bits, unos 27-28 GB; en 4 bits, unos 14-15 GB. Estas cifras son estimaciones por tamaño, no datos publicados por el autor.
- GPU recomendadas: para FP16, A100 80 GB, H100 80 GB o configuraciones multi-GPU (2× A100 40 GB). Para cuantización de 8 bits, una A100 40 GB o H100. Para 4 bits, una RTX 4090 (24 GB) o RTX 3090 (24 GB) podrían ser suficientes, aunque no hay confirmación oficial.
- ¿Cabe en GPU de consumo? Con cuantización de 4 bits es plausible en RTX 4090/3090 (24 GB); en FP16 no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: el repo solo incluye safetensors y la librería transformers; no se publican variantes GGUF ni integraciones con vLLM, llama.cpp, Ollama o TGI. Sería necesario convertir los pesos para usarlos con esos motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otras variantes abliteradas ni con el modelo base más allá de las métricas de la propia model card. La siguiente tabla recoge los datos disponibles del base y de esta variante; para alternativas de la misma categoría (otras abliteraciones de Qwen u otros modelos de ~27 B) no hay información en la documentación proporcionada.

| Modelo | Parametros | Contexto | Tasa de rechazo | MMLU 0-shot | Licencia |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (base) | ~27,4 B | no disponible | 96,00 % | 85,3 % | Apache-2.0 |
| Qwen3.8-27B-Obliterated | ~27,4 B | no disponible | 1,52 % | 86,3 % | Apache-2.0 |
| Otras abliteraciones de Qwen | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Eliminación deliberada de los guardarraíles de seguridad: el modelo puede cumplir peticiones que el base rechazaría. El autor lo restringe a investigación en alineación, red-teaming, evaluación de seguridad y experimentación local responsable.
- Riesgo de contenido dañino: la tasa de rechazo del 1,52 % implica que la inmensa mayoría de peticiones dañinas obtienen respuesta. No debe desplegarse en aplicaciones de cara al público sin filtros externos robustos.
- Responsabilidad legal y ética: el usuario es el único responsable del uso y del contenido generado, según el descargo del autor.
- Sesgos: no se documentan sesgos específicos en la información disponible; los sesgos del modelo base Qwen3.8-27B no se detallan en esta ficha.
- Alucinación: no se aportan métricas de factualidad ni de tasa de alucinación; el ratio de perplejidad de 1,006 sugiere que la distribución de salida es muy similar a la del base, pero no mide veracidad.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están documentados en la información proporcionada.
- Licencia: Apache-2.0 permite uso comercial, pero el propio modelo está pensado para investigación de seguridad; conviene revisar las obligaciones de atribución y las políticas de la plataforma donde se despliegue.
- Reproducibilidad: el informe de investigación completo (en coreano) con la metodología, el diff binario y la información de reproducción lo retiene el equipo investigador autor; en el repo solo está `abliteration_metadata.json`.
- Madurez del repo: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 11 de noviembre de 2026; no hay evidencia de validación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/john-0824/Qwen3.8-27B-Obliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Toolkit OBLITERATUS: https://github.com/elder-plinius/OBLITERATUS
- Paper de referencia sobre la dirección de rechazo: Arditi et al. (2024), *Refusal in Language Models Is Mediated by a Single Direction* (no se proporciona URL en la información disponible)
- Metadatos de la receta: `abliteration_metadata.json` dentro del repositorio del modelo

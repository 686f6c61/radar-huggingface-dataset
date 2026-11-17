# mradermacher/yayi2-30b-llama-GGUF

## Resumen

El repositorio `mradermacher/yayi2-30b-llama-GGUF` contiene cuantizaciones estáticas en formato GGUF del modelo base `QuixiAI/yayi2-30b-llama`, un modelo de lenguaje de 30.403.337.216 parámetros (aproximadamente 30,4 mil millones). El trabajo de cuantización lo firma mradermacher, un conocido publicador de versiones GGUF en Hugging Face, mientras que el modelo original procede de QuixiAI. La ficha se centra en el artefacto cuantizado, ya que la información disponible sobre el modelo base es escasa.

El modelo está etiquetado para los idiomas chino (`zh`) e inglés (`en`), se distribuye bajo licencia `other` (no estándar) y está pensado para su uso con `transformers` y con runtimes compatibles con GGUF como llama.cpp u Ollama. El repositorio ocupa 207,4 GB e incluye once variantes de cuantización que van desde Q2_K (11,5 GB) hasta Q8_0 (32,4 GB), lo que permite desplegar el modelo en un rango amplio de hardware, desde estaciones de trabajo con GPU de consumo hasta servidores.

La relevancia de esta ficha es práctica: permite a desarrolladores e investigadores evaluar rápidamente si el modelo encaja en su infraestructura, qué compromiso calidad/tamaño ofrece cada cuantización y qué limitaciones documentadas existen. No se dispone de información publicada sobre arquitectura interna, datos de entrenamiento ni resultados de benchmarks en la documentación proporcionada, por lo que esos apartados se marcan explícitamente como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base `QuixiAI/yayi2-30b-llama`) |
| Parámetros totales | 30.403.337.216 (≈30,4 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | chino (`zh`), inglés (`en`) |
| Licencia | `other` (no estándar; consultar términos del modelo base) |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base se distribuye en formato `transformers` |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo base `QuixiAI/yayi2-30b-llama` en la documentación disponible. El nombre del repositorio incluye el sufijo `llama`, lo que sugiere una arquitectura de la familia Llama, pero este dato no está confirmado en la model card ni en los metadatos. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO.

Respecto al proceso de cuantización, la model card indica que se trata de cuantizaciones estáticas (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`). El autor ofrece además cuantizaciones ponderadas con imatrix en un repositorio separado (`mradermacher/yayi2-30b-llama-i1-GGUF`), que suelen ofrecer mejor calidad que las estáticas de tamaño equivalente. La model card recomienda explícitamente IQ-quants frente a cuantizaciones no-IQ de tamaño similar y señala Q4_K_S y Q4_K_M como opciones "rápidas y recomendadas", y Q6_K como "muy buena calidad".

## Capacidades

- Generación de texto en chino e inglés, según los idiomas declarados en los metadatos.
- Razonamiento y generación de código: no confirmado explícitamente en la documentación disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas a `zh` y `en` según los metadatos.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que sugiere uso a través de infraestructura de inferencia estándar.

## Casos de uso

- Despliegue en estaciones de trabajo con GPU de consumo: la variante Q4_K_M (18,3 GB) permite ejecutar un modelo de 30 B en GPUs con 24 GB de VRAM, como una RTX 4090, usando llama.cpp u Ollama.
- Inferencia en CPU con memoria limitada: las variantes Q2_K (11,5 GB) y Q3_K_S (13,4 GB) permiten ejecutar el modelo en máquinas sin GPU dedicada, a costa de una pérdida de calidad notable.
- Procesamiento de texto en chino e inglés: el modelo está etiquetado para ambos idiomas, por lo que resulta adecuado para tareas de generación y transformación de texto bilingüe en esos dos idiomas.
- Servicio de inferencia en servidor con GPU profesional: la variante Q8_0 (32,4 GB) o Q6_K (25,0 GB) puede servirse en GPUs como A100 40 GB o H100, priorizando calidad sobre velocidad.
- Experimentación e investigación: el rango de cuantizaciones permite comparar el impacto de la compresión en la calidad de salida sobre un mismo modelo base, útil para estudios de cuantización.
- Integración en pipelines locales con `transformers` y llama.cpp: los tags incluyen `transformers` y el formato GGUF es compatible con runtimes de inferencia local, lo que facilita su incorporación a flujos de trabajo existentes.
- Evaluación comparativa de modelos de 30 B: sirve como punto de referencia para comparar con otros modelos de tamaño similar en tareas bilingües chino/inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, sin contar overhead de contexto):
  - Q2_K: ≈11,5 GB
  - Q3_K_S: ≈13,4 GB
  - Q3_K_M: ≈14,9 GB
  - Q3_K_L: ≈16,2 GB
  - IQ4_XS: ≈16,6 GB
  - Q4_K_S: ≈17,5 GB
  - Q4_K_M: ≈18,3 GB
  - Q5_K_S: ≈21,1 GB
  - Q5_K_M: ≈21,6 GB
  - Q6_K: ≈25,0 GB
  - Q8_0: ≈32,4 GB
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; A100 40 GB o H100 para Q6_K y Q8_0; GPUs con 16 GB o menos solo admiten cuantizaciones Q3 o inferiores, con posible offload parcial a CPU.
- ¿Cabe en GPU de consumo? Sí: las variantes hasta Q5_K_M caben en una RTX 4090 (24 GB); las variantes Q2_K a IQ4_XS caben en GPUs de 16 GB como la RTX 4080 o la RTX 4060 Ti 16 GB.
- Opciones de despliegue: llama.cpp, Ollama, y runtimes compatibles con GGUF; el modelo base es compatible con `transformers`. No se confirma soporte de vLLM o TGI en la documentación disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones del modelo base que permitan una comparación rigurosa con alternativas de la misma categoría. Se indica "no disponible".

| Modelo | Parámetros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| `mradermacher/yayi2-30b-llama-GGUF` | ≈30,4 B | no disponible | `other` | GGUF |
| Alternativas de 30 B | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La licencia es `other` (no estándar): es imprescindible revisar los términos del modelo base `QuixiAI/yayi2-30b-llama` antes de cualquier uso comercial.
- Idiomas limitados a chino e inglés según los metadatos; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- No hay información publicada sobre sesgos, datos de entrenamiento ni procesos de alineación, lo que impide evaluar riesgos de sesgo o de alucinación de forma fundamentada.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K) degradan la calidad de forma notable; la propia model card califica Q3_K_M como "lower quality".
- El repositorio ocupa 207,4 GB en total; descargar todas las variantes requiere espacio de almacenamiento considerable.
- No se dispone de información sobre la longitud de contexto, lo que impide planificar casos de uso que dependan de ventanas largas.
- No se confirma soporte de tool calling, agentes ni modos especiales de razonamiento.
- El modelo base tiene pocas descargas (191 en el repositorio cuantizado) y cero likes, lo que sugiere una adopción limitada y poca validación por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/yayi2-30b-llama-GGUF
- Modelo base: https://huggingface.co/QuixiAI/yayi2-30b-llama
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/yayi2-30b-llama-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#yayi2-30b-llama-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests

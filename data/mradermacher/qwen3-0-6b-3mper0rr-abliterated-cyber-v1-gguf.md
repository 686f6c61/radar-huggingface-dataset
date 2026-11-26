# mradermacher/Qwen3-0.6B-3MPER0RR-abliterated-Cyber-V1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF estáticas del modelo Qwen3-0.6B-3MPER0RR-abliterated-Cyber-V1, un ajuste fino del modelo base Qwen3-0.6B de Alibaba. El autor del ajuste es 3MPER0RR y las cuantizaciones las produce mradermacher, un conocido generador de versiones GGUF de la comunidad. El modelo parte de la arquitectura Qwen3 en su variante más pequeña, con aproximadamente 596 millones de parámetros, y está orientado a tareas de red teaming ofensivo y seguridad, según se deduce del dataset declarado (WNT3D/Ultimate-Offensive-Red-Team) y del sufijo "abliterated", que indica que se han eliminado o atenuado los mecanismos de rechazo del modelo original.

La relevancia de esta ficha es acotada: se trata de un modelo experimental de 0,6B parámetros, sin descargas ni valoraciones en el momento de la consulta, pensado para entornos de investigación de seguridad y pruebas de robustez, no para producción general. Su interés principal radica en que permite ejecutar un modelo "abliterated" de temática ofensiva en hardware muy modesto gracias a las cuantizaciones GGUF, que van desde 0,4 GB (Q2_K) hasta 1,3 GB (f16).

No se dispone de información sobre la longitud de contexto efectiva del ajuste, el número de tokens de entrenamiento ni los detalles del proceso de abliteración más allá de lo declarado en la model card del repositorio base. La licencia declarada es Apache 2.0, heredada del modelo Qwen3 original, aunque el uso de un modelo abliterated con fines ofensivos debe evaluarse con cautela legal y ética.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3) |
| Parametros totales | 596.049.920 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-0.6B, un transformer decoder-only denso de la familia Qwen3, con 596 millones de parámetros. Sobre él, el autor 3MPER0RR aplicó un proceso de ajuste fino y abliteración (eliminación de la dirección de rechazo en el espacio de activaciones) para producir la variante "abliterated-Cyber-V1", orientada a contenido de seguridad ofensiva. El dataset declarado es WNT3D/Ultimate-Offensive-Red-Team, lo que sugiere un entrenamiento centrado en escenarios de red teaming, aunque no se especifican el número de tokens, la composición exacta del dataset ni si hubo fases de RLHF o DPO.

Las cuantizaciones de este repositorio son estáticas (quantize_version 2, output_tensor_quantised 1, convert_type hf), generadas por mradermacher con llama.cpp. Existe además un repositorio paralelo con cuantizaciones ponderadas/imatrix (sufijo -i1-GGUF) para quienes prefieran mayor calidad a igual tamaño. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal más allá de las propias de la arquitectura Qwen3.

## Capacidades

- Generación de texto conversacional en inglés, con formato de chat (tag "conversational").
- Razonamiento y generación de contenido orientado a seguridad ofensiva y red teaming, según el dataset de ajuste.
- Comportamiento "abliterated": menor tendencia a rechazar peticiones que el modelo base, lo que amplía el rango de respuestas pero incrementa el riesgo de contenido dañino.
- Compatible con endpoints (tag "endpoints_compatible"), lo que facilita su despliegue en infraestructuras de inferencia estándar.
- Capacidades multilingües limitadas al inglés declarado.
- No se documenta soporte explícito de tool calling, function calling, agentes multi-paso, visión ni audio.

## Casos de uso

- Pruebas de robustez y red teaming: el modelo puede generar escenarios de ataque, payloads de ejemplo y texto de ingeniería social para evaluar defensas, aprovechando su ajuste sobre el dataset Ultimate-Offensive-Red-Team.
- Investigación sobre alineación y abliteración: sirve como caso de estudio de cómo la eliminación de la dirección de rechazo afecta al comportamiento de un modelo pequeño, comparándolo con Qwen3-0.6B original.
- Generación de contenido de formación en ciberseguridad: producción de material didáctico sobre técnicas ofensivas en entornos controlados y con supervisión.
- Despliegue en hardware muy limitado: con cuantizaciones de 0,4-0,5 GB puede ejecutarse en CPU, Raspberry Pi o GPUs integradas para demos y prototipos.
- Evaluación de filtros de seguridad: usar el modelo como generador adversarial para probar clasificadores de contenido y sistemas de moderación.
- Experimentación con pipelines GGUF: validar flujos de cuantización, carga y serving con llama.cpp u Ollama en un modelo de 0,6B antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB con Q4_K_M, 0,7 GB con Q8_0 y 1,3 GB con f16 (tamaños de archivo; la VRAM real añade overhead de contexto y KV cache).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU dedicadas modernas e incluso en iGPU y CPU.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; el tag "endpoints_compatible" sugiere compatibilidad con APIs de inferencia estándar.
- Latencia y throughput: no disponibles; por el tamaño (0,6B) se espera alta velocidad en CPU y GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3-0.6B-3MPER0RR-abliterated-Cyber-V1 (este) | 596M | no disponible | apache-2.0 | GGUF en HF | Ajuste ofensivo abliterated |
| Qwen3-0.6B (original) | 596M | no disponible | apache-2.0 | safetensors y GGUF en HF | Modelo base alineado |
| Qwen2.5-0.5B | ~494M | no disponible | apache-2.0 | amplia disponibilidad | Generación anterior, sin ajuste ofensivo |
| Llama-3.2-1B | ~1,2B | no disponible | Llama 3.2 Community | amplia disponibilidad | Mayor tamaño, licencia más restrictiva |

La comparación se limita a modelos de tamaño similar de la familia Qwen y alternativas de bolsillo; no hay datos de rendimiento publicados para este ajuste concreto que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo "abliterated": se ha reducido o eliminado el rechazo ante peticiones dañinas, lo que aumenta el riesgo de generar contenido ofensivo, ilegal o peligroso.
- Riesgo elevado de alucinación y de respuestas incorrectas por su tamaño reducido (0,6B) y su ajuste específico.
- Idiomas: solo inglés declarado; el rendimiento en castellano no está garantizado.
- Longitud de contexto no documentada; no se recomienda para tareas que requieran ventanas largas.
- Licencia Apache 2.0 heredada, pero el uso para fines ofensivos puede contravenir legislación local; evaluar antes de cualquier despliegue.
- Sin descargas ni valoraciones en el momento de la consulta: no hay validación comunitaria de calidad.
- No apto para producción general, atención al cliente ni aplicaciones que requieran fiabilidad; su uso previsto es investigación y pruebas controladas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3-0.6B-3MPER0RR-abliterated-Cyber-V1-GGUF
- Modelo base del ajuste: https://huggingface.co/3MPER0RR/Qwen3-0.6B-3MPER0RR-abliterated-Cyber-V1
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwen3-0.6B-3MPER0RR-abliterated-Cyber-V1-i1-GGUF
- Página de resumen del autor: https://hf.tst.eu/model#Qwen3-0.6B-3MPER0RR-abliterated-Cyber-V1-GGUF
- Dataset de ajuste: https://huggingface.co/datasets/WNT3D/Ultimate-Offensive-Red-Team
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

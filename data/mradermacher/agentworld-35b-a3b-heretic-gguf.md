# mradermacher/AgentWorld-35B-A3B-Heretic-GGUF

## Resumen

AgentWorld-35B-A3B-Heretic-GGUF es la publicación en formato GGUF del modelo `auttasak88/AgentWorld-35B-A3B-Heretic`, una variante "abliterated" (es decir, con los mecanismos de rechazo atenuados o eliminados mediante técnicas de *heretic*/abliteration) de un modelo de arquitectura Qwen3.5 MoE orientado a tareas de agente y modelado de entorno (*world model*, *agent-environment*). El repositorio lo mantiene mradermacher, un conocido cuantizador de la comunidad que genera versiones estáticas de pesos en múltiples niveles de compresión para su uso con llama.cpp y derivados.

El modelo cuenta con 34.660.610.688 parámetros totales según los pesos en safetensors del modelo base, organizados en una arquitectura de mezcla de expertos (MoE) con aproximadamente 3B de parámetros activos por token, según indica el sufijo A3B del nombre. Está etiquetado con los idiomas inglés y tailandés, licencia Apache 2.0 y compatibilidad con endpoints conversacionales.

Su relevancia actual radica en dos factores: por un lado, ofrece una alternativa cuantizada y ejecutable localmente de un modelo MoE de gran tamaño con activación reducida, lo que abarata la inferencia; por otro, la variante "Heretic" elimina las capas de rechazo, lo que interesa a quienes investigan alineación, robustez o necesitan un modelo sin filtros para entornos simulados controlados. No obstante, esta característica conlleva riesgos importantes que se detallan más abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (etiqueta `qwen3_5_moe`, familia Qwen) |
| Parametros totales | 34.660.610.688 |
| Parametros activos | aproximadamente 3B (según sufijo A3B; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | inglés (en), tailandés (th) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (estáticos); existen cuantizaciones imatrix en repo separado |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia Qwen3.5 en configuración MoE, según la etiqueta `qwen3_5_moe` de la model card. El nombre indica 35B de parámetros totales con aproximadamente 3B activos, patrón típico de los modelos MoE de Qwen que activan un subconjunto de expertos por token para reducir el coste computacional manteniendo la capacidad total. El repositorio incluye además ficheros `mmproj` (proyección multimodal), lo que sugiere que el modelo base incorpora capacidad de visión, aunque la model card no lo detalla explícitamente.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineación en el modelo base. La variante "Heretic" implica un proceso de *abliteration* sobre el modelo original para reducir o eliminar los comportamientos de rechazo; el autor no documenta la metodología concreta ni el grado de modificación. Tampoco se detalla ninguna innovación técnica adicional como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno, con etiqueta `conversational` en Hugging Face.
- Orientación específica a tareas de agente: las etiquetas `agent`, `agent-environment` y `world-model` indican entrenamiento o ajuste para simular entornos y actuar dentro de ellos.
- Soporte de tool calling y function calling: no confirmado explícitamente en la model card, aunque es habitual en la familia Qwen y coherente con el enfoque de agente.
- Razonamiento multi-paso y planificación: plausible por el enfoque de agente, sin datos de benchmarks que lo confirmen.
- Capacidad multimodal: los ficheros `mmproj` del repositorio sugieren soporte de visión, pero no se documenta en la model card.
- Multilingüe limitado a inglés y tailandés según las etiquetas de idioma.
- Comportamiento sin filtros de rechazo (variante abliterated/heretic).

## Casos de uso

- Simulación de entornos para agentes: el modelo puede actuar como "mundo" que responde a las acciones de un agente en un bucle de entrenamiento o evaluación, generando observaciones coherentes con el estado simulado; es el uso declarado por las etiquetas `world-model` y `agent-environment`.
- Investigación en alineación y seguridad: la variante Heretic permite estudiar cómo se comporta un modelo sin capas de rechazo, comparándolo con el original para analizar qué información se pierde o se altera en el proceso de abliteration.
- Evaluación de robustez de agentes: usar el modelo como contraparte en entornos adversariales controlados, donde se necesita un modelo que no rechace instrucciones para probar los límites de un sistema de agente.
- Prototipado local de asistentes conversacionales en inglés o tailandés: las cuantizaciones Q4_K_M (21,3 GB) permiten ejecución en estaciones de trabajo con GPU de 24 GB o en CPU con suficiente RAM, útil para desarrollo sin depender de APIs.
- Generación de datos sintéticos para entrenamiento de agentes: el modelo puede producir trayectorias y respuestas de entorno en pipelines de *data generation*, especialmente en configuraciones donde se requiere baja latencia por token gracias a los 3B activos.
- Despliegue en entornos aislados (*air-gapped*): al ser pesos GGUF con licencia Apache 2.0, puede ejecutarse en infraestructura propia sin conexión, adecuado para laboratorios que no pueden usar servicios en la nube.
- Investigación sobre modelos MoE de activación reducida: sirve como banco de pruebas para medir el equilibrio calidad/coste de un MoE de 35B con 3B activos frente a modelos densos de tamaño comparable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según los tamaños de fichero publicados):
  - Q2_K: 13,0 GB
  - Q3_K_S: 15,3 GB; Q3_K_M: 16,9 GB; Q3_K_L: 18,2 GB
  - IQ4_XS: 19,0 GB; Q4_K_S: 20,0 GB; Q4_K_M: 21,3 GB
  - Q5_K_S: 24,1 GB; Q5_K_M: 24,8 GB
  - Q6_K: 28,6 GB
  - Q8_0: 37,0 GB
  - Añadir 0,7 GB (mmproj-Q8_0) o 1,0 GB (mmproj-f16) si se usa la parte multimodal.
- GPU recomendadas: para Q4_K_M cabe en una RTX 4090 (24 GB) o RTX 3090; Q5_K_M roza el límite de 24 GB y puede requerir offload parcial; Q6_K y Q8_0 requieren A100 40 GB, A6000 48 GB o H100.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantizaciones Q4 o inferiores; en GPUs de 16 GB solo con Q2_K o Q3_K_S y offload parcial a RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; los ficheros multi-parte deben concatenarse antes de su uso según las instrucciones habituales de TheBloke referenciadas en la model card.
- Latencia y throughput: no disponibles. Al ser un MoE con aproximadamente 3B activos, el coste por token debería ser sustancialmente menor que el de un modelo denso de 35B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| AgentWorld-35B-A3B-Heretic (este) | 34,66B | ~3B | no disponible | Apache 2.0 | GGUF | Variante abliterated, enfoque agente/mundo |
| Modelo base auttasak88/AgentWorld-35B-A3B-Heretic | 34,66B | ~3B | no disponible | Apache 2.0 | safetensors | Sin abliteration, referencia para comparar efectos |
| Qwen3 MoE de referencia (familia) | no disponible | no disponible | no disponible | Apache 2.0 (según familia) | safetensors, GGUF | Alternativa no abliterated de la misma familia |
| Modelos densos de ~30-35B | ~30-35B | todos | variable | variable | variable | Mayor coste por token al no usar MoE |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada; la comparación se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- La variante Heretic elimina o atenúa los mecanismos de rechazo: el modelo puede generar contenido dañino, ilegal o inseguro sin las salvaguardas del modelo original. No es adecuado para aplicaciones de cara al público sin capas de moderación externas.
- No hay información sobre sesgos evaluados ni sobre la metodología de abliteration aplicada; se desconoce qué capacidades se degradaron en el proceso.
- Riesgo de alucinación no cuantificado: no se han publicado evaluaciones de fidelidad ni de tasa de alucinación.
- Idiomas limitados a inglés y tailandés según las etiquetas; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Longitud de contexto no disponible: no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la ausencia de filtros de rechazo traslada al desplegador toda la responsabilidad legal y ética sobre el contenido generado.
- El repositorio tiene 478 descargas y 0 likes en el momento de la consulta, con un tamaño de 238,6 GB; la adopción es baja y no hay evidencia comunitaria de calidad.
- Los ficheros GGUF multi-parte requieren concatenación previa; un uso incorrecto produce errores de carga.
- No se documenta el proceso de cuantización más allá de los parámetros estándar de mradermacher; las cuantizaciones Q2 y Q3 pueden degradar notablemente la calidad en un MoE.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/AgentWorld-35B-A3B-Heretic-GGUF
- Modelo base: https://huggingface.co/auttasak88/AgentWorld-35B-A3B-Heretic
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/AgentWorld-35B-A3B-Heretic-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#AgentWorld-35B-A3B-Heretic-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica de perplejidad por cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png

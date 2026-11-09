# SargeDev/Arete-27B-Uncensored-V2

## Resumen

Arete-27B-Uncensored-V2 es un modelo de lenguaje de 26.896 millones de parámetros publicado por SargeDev, derivado de NousResearch/Arete-27B mediante un proceso de "abliteration" agresiva (eliminación de direcciones de rechazo en el espacio de activaciones) seguido de la fusión de un adaptador LoRA de entrenamiento en decisiones. El resultado es un modelo de chat sin restricciones de contenido y con un andamiaje adicional de decisión tipada, orientado a usos donde el filtrado de seguridad del modelo base resulta un obstáculo.

La arquitectura de referencia es la de Qwen3.8 (etiqueta `qwen3_5_text` en Hugging Face), un transformer denso con capacidades de decodificación especulativa mediante tensores MTP/nextn reinsertados. El repositorio ocupa 54,7 GB en safetensors bf16 repartidos en 28 shards, y se distribuye también en cuantizaciones GGUF a través de un repositorio hermano.

Es relevante ahora porque combina tres piezas poco habituales: una base conversacional (Arete), una neutralización de rechazos verificada empíricamente sobre una batería de 15 prompts hostiles (15/15 entregados) y una cabeza de decisión entrenada sobre un corpus de 764k ejemplos solar+JEV. No obstante, las métricas publicadas por el autor muestran que la transferencia de la cabeza de decisión al backbone Arete es parcial (top-1 de 0,725 frente a 0,853 del mismo checkpoint sobre huihui-base), lo que conviene tener en cuenta antes de adoptarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen3.8 (`qwen3_5_text`), con tensores MTP/nextn para decodificación especulativa |
| Parámetros totales | 26.895.998.464 (~26,9B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | bf16 (repo principal); GGUF en repositorio separado (tipos concretos no disponibles) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (28 shards, ~54 GB); GGUF en repo aparte |

## Arquitectura y entrenamiento

El modelo parte de NousResearch/Arete-27B, un transformer denso de la familia Qwen3.8. Sobre esa base se aplicó una abliteración en modo `aggressive` (proceso OBLITERATUS, atribuido a Pliny the Liberator) que elimina las direcciones de activación asociadas a la negativa a responder. Posteriormente se fusionó un adaptador LoRA de decisión entrenado sobre el checkpoint 1946 de `solar-training-v3`, con rango 32 y alpha 64, sobre un corpus combinado de 764k ejemplos solar+JEV e incluyendo `lm_head` como objetivo. La fusión se realizó por aritmética directa de deltas sobre 401 de 401 módulos.

Tras la fusión se reinsertaron los tensores del drafter MTP/nextn (cabeza estándar de Qwen3.8), de modo que la decodificación especulativa sigue funcionando. Los controles de calidad reportados por el autor tras la abliteración y antes de la fusión indican coherencia 1.0, suite de capacidades intacta y un aumento moderado de perplejidad de 3,22 a 3,93. No se especifican en la información disponible el número total de tokens de preentrenamiento de la base, la composición del dataset original ni si hubo fases de RLHF o DPO en la cadena.

## Capacidades

- Generación de texto conversacional multi-turno sobre la base Arete.
- Respuesta sin rechazos a prompts de seguridad: 15/15 entregados en la batería de cumplimiento del autor (exploit dev, red team, malware, DoS).
- Andamiaje de decisión tipada: cabeza de elección entrenada sobre 30k decisiones tipadas, con top-1 de 0,725.
- Decodificación especulativa funcional gracias a los tensores MTP/nextn reinsertados.
- Capacidad de razonamiento factual sobre narrativas estatales: fact score 2,61/5 y 1,1% de propaganda en Propaganda_Eval (803 prompts, juez Grok-4.7).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; la cabeza de decisión sugiere uso en pipelines con elección entre opciones, pero no se detalla.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Investigación en seguridad de IA y red teaming: el modelo entrega respuestas que las bases alineadas rechazan, lo que lo hace útil como generador de casos adversarios controlados en entornos de evaluación cerrados y con supervisión humana.
- Estudio de alineación y abliteración: permite comparar el comportamiento del backbone Arete original frente a la versión neutralizada y medir el coste en coherencia y perplejidad (3,22 → 3,93) en tareas downstream.
- Pipelines de decisión tipada: la cabeza de decisión fusionada permite clasificar entre opciones predefinidas en flujos de enrutamiento o triaje, aunque con top-1 de 0,725 conviene reservar un fallback humano o un segundo modelo verificador.
- Generación de ficción y contenido creativo sin filtros: útil para escritura de narrativa con temáticas sensibles donde los rechazos del modelo base interrumpen la generación.
- Evaluación de sesgos y propaganda: con 1,1% de propaganda en Propaganda_Eval, sirve como referencia de un modelo que no replica líneas oficiales, útil en estudios comparativos de sesgo editorial.
- Despliegue conversacional autoalojado con decodificación especulativa: los tensores MTP/nextn permiten acelerar la inferencia en servidores con vLLM o TGI cuando se configura el drafter, reduciendo latencia en cargas de chat.
- Experimentación académica con cuantizaciones GGUF: el repo hermano permite ejecutar el modelo en hardware de consumo para pruebas de comportamiento sin necesidad de GPUs de datacenter.

## Benchmarks y rendimiento

| Evaluación | Resultado | Referencia / nota |
|---|---|---|
| Compliance battery (15 prompts duros) | 15/15 entregados | Heredado de la abliteración V1 |
| Propaganda_Eval (803 prompts), fact score | 2,61 / 5 | 423/801 respuestas con puntuación 4-5; juez Grok-4.7 |
| Propaganda_Eval, tasa de propaganda | 1,1% | 794/801 limpias, 9 menores, 0 propaganda dura |
| Decision gate (30k set), choice top-1 | 0,725 | V1 backbone 0,384; huihui-base V3 en el mismo checkpoint 0,853; barra r32 0,869 |
| Perplejidad (post-abliteración, pre-fusión) | 3,93 (desde 3,22) | OBLITERATUS verify |
| Coherencia (post-abliteración) | 1,0 | OBLITERATUS verify |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada en bf16: en torno a 54 GB solo para pesos, más overhead de KV cache y activaciones; requiere GPUs de 80 GB (A100, H100) o reparto multi-GPU.
- VRAM estimada en cuantizaciones GGUF: no disponible el detalle de tipos, pero un modelo de ~27B en 4 bits ronda los 15-16 GB, lo que lo sitúa al borde de una RTX 4090 de 24 GB con contexto moderado.
- GPU recomendadas: A100 80 GB o H100 para bf16; RTX 4090, RTX 3090 o A6000 para cuantizaciones GGUF de 4-5 bits.
- Cabe en GPU de consumo: previsiblemente sí en cuantización GGUF de 4 bits sobre RTX 4090/3090; no en bf16.
- Opciones de despliegue: vLLM o TGI para bf16 con decodificación especulativa (aprovechando los tensores MTP/nextn); llama.cpp u Ollama para los GGUF del repo hermano.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Arete-27B-Uncensored-V2 | ~26,9B | No disponible | Apache 2.0 | Abliterado + cabeza de decisión fusionada; top-1 decisión 0,725 |
| NousResearch/Arete-27B | No disponible | No disponible | No disponible | Base original alineada, sin abliterar |
| huihui-base V3 (mismo checkpoint) | No disponible | No disponible | No disponible | Top-1 de decisión 0,853; supera a este modelo en la tarea de decisión |
| Arete-27B-Uncensored (V1) | ~26,9B | No disponible | Apache 2.0 | Solo abliteración, sin fusión solar; top-1 de decisión 0,384 |

## Limitaciones y advertencias

- Modelo explícitamente desalineado: entrega contenido de exploit development, malware, DoS y red teaming sin rechazo. Inadecuado para aplicaciones de cara al público sin capas de moderación externas.
- La cabeza de decisión transferida rinde por debajo de su potencial: top-1 de 0,725 frente a 0,853 en huihui-base y 0,869 de la barra r32. El propio autor reconoce que hace falta un entrenamiento nativo sobre Arete para cerrar la brecha.
- Aumento de perplejidad tras la abliteración (3,22 → 3,93): puede traducirse en mayor tasa de alucinación y menor fidelidad en tareas de conocimiento factual.
- Idiomas soportados no documentados; no se recomienda asumir un rendimiento multilingüe equivalente al de la base sin evaluación propia.
- Longitud de contexto no especificada en la información disponible; crítico para planificar despliegues con ventanas largas.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado puede infringir normativas locales o términos de servicio de plataformas; la responsabilidad recae en el desplegador.
- Sin descargas ni likes en el momento de la ficha (0/0) y creado en noviembre de 2026: ecosistema mínimo, sin validación independiente de las métricas del autor.
- Las evaluaciones de propaganda y fact score dependen de un único juez (Grok-4.7) y de un dataset concreto; no equivalen a una evaluación de seguridad completa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SargeDev/Arete-27B-Uncensored-V2
- Cuantizaciones GGUF: https://huggingface.co/SargeDev/Arete-27B-Uncensored-V2-GGUF
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Dataset de evaluación de propaganda: NousResearch/Propaganda_Eval (referenciado en la model card; sin URL directa en la información disponible)

# empero-ai/Qwen3.8-2B-Distill

## Resumen

Qwen3.8-2B es un modelo de lenguaje causal de 2.274 millones de parámetros desarrollado por Empero, un laboratorio independiente de investigación en IA con sede en Alemania. Se trata de una destilación de parámetros completos del modelo Qwen3.8 2.4T A95B (el modelo más capaz de la familia Qwen3.8) sobre la arquitectura del modelo base Qwen3.5-2B. El objetivo es trasladar el mismo currículo de razonamiento del profesor a un modelo lo suficientemente pequeño para ejecutarse en dispositivos de borde (edge), como teléfonos, placas de un solo chip o máquinas solo CPU.

El modelo fue entrenado mediante SFT (off-policy distillation) sobre aproximadamente 30.000 trazas de profesor curadas, que incluyen cadenas de pensamiento densas en matemáticas, razonamiento general y seguimiento de instrucciones. Cada respuesta comienza con un bloque `thinking` aprendido directamente de las trazas del profesor, lo que le confiere un modo de razonamiento explícito. Hereda del base Qwen3.5-2B una ventana de contexto nativa de 262.144 tokens, así como capacidades nativas de function calling según la especificación Qwen3.5. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones significativas.

La relevancia actual de este modelo reside en su propuesta de llevar razonamiento de alto nivel a la categoría de 2B parámetros, un rango tradicionalmente limitado en tareas de lógica y matemáticas. Los benchmarks publicados muestran una mejora sustancial frente al base Qwen3.5-2B en GSM8K y MMLU, con un aumento de +0,310 y +0,265 en exact match flexible respectivamente. Es el miembro más pequeño de la familia de destilados de Empero, junto a los Qwen3.8-4B y Qwen3.8-9B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con atención lineal (Gated DeltaNet) sobre base Qwen3.5-2B |
| Parametros totales | 2.274.069.824 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | No especificado en la documentación; se mencionan builds cuantizados para edge (teléfonos, SBC, CPU) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 (heredada del base Qwen3.5-2B) |
| Formato de pesos | safetensors (compatible con transformers, vLLM, SGLang) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3.5-2B, que corresponde a la ruta de texto de un modelo base de visión-lenguaje. Es un transformer causal con capas de atención lineal basadas en Gated DeltaNet, lo que requiere kernels especializados (`flash-linear-attention` y `causal_conv1d`) para un funcionamiento eficiente; sin ellos, las capas de atención lineal caen en operaciones PyTorch lentas y con alto consumo de memoria. El fine-tune es de parámetros completos (full fine-tune), no un adaptador.

El entrenamiento consistió en SFT off-policy sobre aproximadamente 30.000 trazas de profesor, extraídas de los datasets internos de destilación de Qwen3.8. Estas trazas fueron filtradas por calidad y cubren matemáticas, razonamiento general y seguimiento de instrucciones. El profesor es Qwen3.8 2.4T A95B, y el mismo currículo se usó para los hermanos mayores de 4B y 9B; solo cambia la capacidad del estudiante. No se menciona el uso de RLHF ni DPO; el método es puramente destilación supervisada.

## Capacidades

- Generación de texto con razonamiento explícito: cada respuesta abre con un bloque `thinking` que contiene la cadena de pensamiento aprendida del profesor.
- Razonamiento matemático y lógico: mejoras significativas en GSM8K y MMLU frente al base (ver benchmarks).
- Seguimiento de instrucciones: entrenado específicamente en esta habilidad mediante las trazas del profesor.
- Function calling nativo según la especificación Qwen3.5, sin necesidad de wrappers ni fine-tunes específicos para herramientas.
- Ventana de contexto larga de 262.144 tokens, heredada del base, adecuada para tareas con documentos extensos o conversaciones multi-turno largas.
- Capacidades multilingües: solo se declara inglés como idioma soportado; aunque el base podría tener otras, no se evaluaron.
- Modo texto únicamente en el fine-tune; el comportamiento de visión se hereda del base pero no fue evaluado por Empero.

## Casos de uso

- Asistentes de razonamiento en dispositivos móviles: el modelo puede ejecutarse en teléfonos gracias a su tamaño de 2B y builds cuantizados, proporcionando respuestas con cadena de pensamiento para preguntas de lógica y matemáticas sin conexión a la nube.
- Chatbots de atención al cliente con contexto largo: su ventana de 262.144 tokens permite mantener conversaciones multi-turno extensas con historial completo, y el function calling nativo facilita la integración con APIs de pedidos, devoluciones o consultas.
- Educación y tutoría: puede generar explicaciones paso a paso para problemas matemáticos o de razonamiento, útil en aplicaciones de aprendizaje autónomo.
- Automatización de tareas de razonamiento en entornos con restricciones de hardware: por ejemplo, en placas como Raspberry Pi o mini-PCs, donde un modelo de 2B cuantizado puede procesar tareas de extracción de información o clasificación con razonamiento.
- Prototipado rápido de agentes: al soportar function calling y razonamiento multi-paso, sirve para construir prototipos de agentes que necesitan planificar y llamar herramientas, antes de escalar a modelos mayores.
- Análisis de documentos largos en local: con 262K de contexto, puede resumir o extraer información de documentos extensos (contratos, informes) sin necesidad de truncar, manteniendo la privacidad al ejecutarse en local.

## Benchmarks y rendimiento

Resultados medidos con `lm-evaluation-harness` (backend HF) con configuraciones idénticas para base y estudiante. Ambos son modelos de razonamiento evaluados con protocolos CoT (`gsm8k_cot`, `mmlu_flan_cot_zeroshot`). MMLU cubre los 57 temas (~1.700 preguntas). Flexible-extract es la métrica primaria; strict-match requiere formato de respuesta exacto.

| Tarea | Metrica | Qwen3.5-2B (base) | Qwen3.8-2B | Delta |
|---|---:|---:|---:|
| gsm8k_cot | exact_match (flexible) | 0.330 | 0.640 | +0.310 |
| gsm8k_cot | exact_match (strict) | 0.545 | 0.640 | +0.095 |
| mmlu (CoT, 57 subjects) | acc (flexible-extract) | 0.283 | 0.548 | +0.265 |
| mmlu (CoT, 57 subjects) | acc (strict-match) | 0.004 | 0.225 | +0.221 |

Parámetros de muestreo: `temperature=0.6, top_p=0.95, top_k=20` (configuración recomendada para Qwen3.5).

## Requisitos de hardware

- VRAM estimada: aproximadamente 4 GB en bf16 (según la model card: "bf16 in ~4 GB"). Con cuantización a 4 bits, podría reducirse a ~1,5-2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (p. ej., RTX 3060, RTX 4060, GTX 1660 Super). En cuantización, puede ejecutarse en GPU integradas o incluso solo CPU.
- Compatible con dispositivos de borde: teléfonos, placas de un solo chip (SBC) y máquinas solo CPU según la documentación.
- Opciones de despliegue: Hugging Face Transformers (con kernels `flash-linear-attention` y `causal_conv1d`), vLLM, SGLang, y cualquier runtime con soporte de arquitectura Qwen3.5. También se mencionan builds cuantizados (presumiblemente GGUF) para edge, aunque no se detallan.
- Latencia y throughput: no especificados en la documentación disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | GSM8K (flex) | MMLU (flex) |
|---|---:|---:|---|---:|---:|
| Qwen3.8-2B (este) | 2.27B | 262.144 | Apache-2.0 | 0.640 | 0.548 |
| Qwen3.5-2B (base) | 2.27B | 262.144 | Apache-2.0 | 0.330 | 0.283 |
| Qwen3.8-4B | ~4B | no disponible | Apache-2.0 | no disponible | no disponible |
| Qwen3.8-9B | ~9B | no disponible | Apache-2.0 | no disponible | no disponible |

Los hermanos mayores 4B y 9B comparten el mismo currículo de destilación pero no se publican sus benchmarks en la información disponible. El 9B añade entrenamiento en código, por lo que es preferible para cargas de trabajo centradas en programación.

## Limitaciones y advertencias

- El modelo es de solo texto en su fine-tune; el comportamiento de visión heredado del base no fue evaluado por Empero, por lo que no se garantiza su calidad en tareas multimodales.
- Capacidad limitada por el tamaño: el conocimiento factual y los problemas multi-paso muy difíciles pueden fallar. La documentación recomienda escalar a 4B o 9B para cargas más exigentes.
- El modo de razonamiento requiere un bloque `thinking` al inicio de cada respuesta; es necesario parsear y extraer el span `thinking... response` para presentar solo la respuesta final al usuario.
- La decodificación greedy en generaciones largas es un modo de fallo conocido de bucles de repetición; se recomienda usar muestreo con `temperature=0.6, top_p=0.95, top_k=20`.
- Requiere kernels especializados (Gated DeltaNet) para un rendimiento eficiente; sin ellos, las capas de atención lineal caen en operaciones PyTorch lentas y con alto consumo de memoria.
- Solo se declara inglés como idioma soportado; no se evaluaron otras lenguas.
- La licencia Apache-2.0 se hereda del base Qwen3.5-2B, pero conviene verificar los términos del base original por si hubiera cláusulas adicionales (aunque la model card indica que se hereda Apache-2.0).
- El modelo se publica "as-is" para investigación y experimentación; no se ofrecen garantías de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/empero-ai/Qwen3.8-2B
- Sitio web de Empero: https://empero.org
- Repositorio GitHub de Qwen3.8 (serie oficial): https://github.com/QwenLM/Qwen3.8
- Artículo sobre Qwen3.8 en OpenLM.ai: https://openlm.ai/qwen3.8/
- Modelos hermanos: https://huggingface.co/empero-ai/Qwen3.8-4B y https://huggingface.co/empero-ai/Qwen3.8-9B

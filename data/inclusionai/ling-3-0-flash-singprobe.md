# inclusionAI/Ling-3.0-flash-singprobe

## Resumen

Ling-3.0-flash-singprobe (también denominado Ling3-SingProbe) es un guardrail intrínseco de seguridad y detección de alucinaciones desarrollado por inclusionAI. A diferencia de los sistemas de moderación tradicionales que ejecutan un modelo de seguridad separado, esta sonda ligera se acopla al modelo base `inclusionAI/Ling-3.0-flash` y reutiliza sus estados ocultos durante la generación para puntuar, en cada token, la intención de la consulta, la inseguridad de la respuesta y el riesgo de alucinación. Con solo 5,18 millones de parámetros, añade menos de un 0,5 % de sobrecarga en decodificación, lo que lo convierte en una solución viable para entornos de producción con requisitos de latencia estrictos.

El modelo se integra mediante ramas específicas de SGLang o vLLM y está pensado para funcionar exclusivamente con la familia Ling-3.0-flash. Su licencia MIT permite uso comercial sin restricciones. La publicación técnica asociada (arXiv:2608.30703) documenta la metodología y los resultados completos, y los códigos de entrenamiento están disponibles en GitHub. Es relevante ahora porque aborda el problema creciente de la seguridad y la fiabilidad en modelos de lenguaje de gran escala, ofreciendo una alternativa eficiente a los guardrails externos que duplican el coste computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sonda ligera con atención (`sing_probe_attn`) acoplada a las capas 13, 26 y 40 del modelo base Ling-3.0-flash |
| Parametros totales | 5.182.986 (5,18 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Hereda la del modelo base (262K tokens para Ling-3.0-flash) |
| Tipos de cuantizacion | No disponible (solo safetensors sin cuantización específica) |
| Idiomas soportados | No disponible (depende del modelo base) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SingProbe es una sonda de atención ligera que se conecta a tres capas intermedias (13, 26 y 40) del modelo base Ling-3.0-flash. Durante la generación, extrae los estados ocultos de esas capas y produce, para cada token, un vector de puntuaciones que cubre 8 intenciones de consulta, un indicador de inseguridad y un indicador de riesgo de alucinación. Esta arquitectura evita ejecutar un modelo de seguridad completo, reduciendo drásticamente el coste computacional.

El entrenamiento se describe en el informe técnico (arXiv:2608.30703), aunque los detalles específicos del dataset y el procedimiento de optimización no están disponibles en la información pública. Se sabe que el probe se entrena sobre el modelo base congelado, probablemente con supervisión sobre las etiquetas de seguridad y alucinación. La integración con SGLang y vLLM permite cargar el checkpoint de la sonda junto con el modelo base en el arranque del servidor, devolviendo un diccionario de puntuaciones por token generado.

## Capacidades

- Clasificación de intención de consulta: identifica 8 intenciones distintas en las peticiones del usuario, con un F1 medio de 0,8674 en 6 benchmarks.
- Detección de inseguridad en respuestas: puntúa la toxicidad o peligrosidad del texto generado, con un F1 medio de 0,8728 en 8 benchmarks.
- Detección de alucinaciones: evalúa el riesgo de que el contenido generado no sea fiel a los hechos, con un AUC medio de 0,8012 en 6 benchmarks.
- Seguridad en streaming: proporciona puntuaciones por token en tiempo real, con un R-AUC de 0,9887 y un T-AUC de 0,9481 en 3 benchmarks.
- Baja tasa de falsos positivos: solo un 0,03 % de respuestas benignas se marcan incorrectamente como inseguras en 5 datasets.
- Rendimiento en generación libre: alcanza una precisión de 0,9641 y un F1 de 0,6452 en evaluación leave-one-out.
- Integración nativa con SGLang y vLLM: se carga como un checkpoint adicional en el arranque del servidor, sin necesidad de infraestructura extra.

## Casos de uso

- Moderación de contenido en chatbots de producción: el probe puntúa cada token generado, permitiendo interrumpir la respuesta en el momento en que se detecta contenido inseguro, antes de que se complete la frase. Su baja sobrecarga (<0,5 %) lo hace adecuado para servicios con alto tráfico.
- Detección de alucinaciones en asistentes de documentación técnica: al integrarse con Ling-3.0-flash, puede señalar en tiempo real cuando el modelo genera afirmaciones no respaldadas, útil en entornos donde la precisión factual es crítica (soporte técnico, generación de informes).
- Filtrado de intenciones maliciosas en APIs de generación: la clasificación de 8 intenciones permite bloquear consultas de jailbreak, inyección de prompts o solicitudes de contenido dañino antes de que el modelo responda.
- Guardrail en pipelines de agentes autónomos: cuando un agente encadena múltiples llamadas al modelo, el probe puede supervisar cada paso y detener la ejecución si detecta desviaciones de seguridad o alucinaciones, reduciendo riesgos en automatizaciones críticas.
- Auditoría de respuestas en sistemas de atención al cliente: el registro de puntuaciones por token permite revisar posteriormente qué partes de una conversación presentaron riesgo, facilitando el análisis de incidentes y la mejora continua.
- Evaluación de calidad en generación de código: aunque el probe no está especializado en código, su detección de alucinaciones puede aplicarse para verificar que las explicaciones generadas por el modelo no inventen APIs o funciones inexistentes.

## Benchmarks y rendimiento

Los resultados publicados en la model card del autor se resumen a continuación. Todas las métricas son medias sobre los conjuntos de benchmarks indicados, y valores más altos son mejores.

| Tarea | Metrica | Ling-3.0-flash-singprobe | Baseline de referencia |
|---|---|---|---|
| Clasificacion de intencion de consulta (6 benchmarks) | F1 | **0,8674** | YuFeng-XGuard-Reason-8B: 0,8714 |
| Clasificacion de seguridad de respuesta (8 benchmarks) | F1 | **0,8728** | Qwen3Guard-Gen-8B-strict: 0,8604 |
| Seguridad en streaming (3 benchmarks) | R-AUC / T-AUC | **0,9887 / 0,9481** | Qwen3Guard-Stream-8B-strict: 0,9640 / 0,8893 |
| Deteccion de alucinaciones (6 benchmarks) | AUC | **0,8012** | DRIFT: 0,8000 |

| Caracteristica de despliegue | Resultado |
|---|---|
| Tasa de falsos positivos en respuestas benignas | 0,03 % media en 5 datasets |
| Rendimiento en generacion libre online | 0,9641 precision / 0,6452 F1 (leave-one-out) |
| Sobrecarga de decodificacion | < 0,5 % |

## Requisitos de hardware

- El probe en sí es extremadamente ligero (5,18 M de parámetros) y no requiere hardware adicional; se ejecuta dentro del proceso del modelo base.
- El modelo base Ling-3.0-flash es un MoE de 124B parámetros totales con 5,1B activos, por lo que la inferencia requiere GPUs de alta gama. Se recomienda al menos una A100 80GB o H100 para ejecutar el modelo base en FP16, o GPUs consumer como RTX 4090 con cuantización (int4/int8) si se usa la versión cuantizada del base.
- La integración con SGLang o vLLM permite desplegar el conjunto base + probe en un solo servidor, con la sobrecarga adicional del probe siendo despreciable en términos de VRAM y cómputo.
- Para despliegues en producción, se recomienda usar las ramas de integración específicas proporcionadas por inclusionAI (SGLang y vLLM), que gestionan la carga del checkpoint del probe y la devolución de puntuaciones por token.
- La latencia adicional es inferior al 0,5 % del tiempo de decodificación, lo que en la práctica no afecta al throughput del servidor.

## Comparativa con modelos similares

SingProbe se compara con guardrails externos de tamaño completo (8B) que requieren una pasada de inferencia adicional. La siguiente tabla resume las diferencias clave.

| Modelo | Parametros | Enfoque | Rendimiento (F1 seguridad) | Licencia |
|---|---|---|---|---|
| Ling-3.0-flash-singprobe | 5,18 M | Intrinseco (reutiliza hidden states) | 0,8728 | MIT |
| Qwen3Guard-Gen-8B-strict | ~8B | Externo (modelo separado) | 0,8604 | Apache 2.0 (asumido) |
| YuFeng-XGuard-Reason-8B | ~8B | Externo (modelo separado) | 0,8714 (intencion) | No disponible |
| DRIFT | No disponible | Externo (deteccion de alucinaciones) | AUC 0,8000 | No disponible |

La principal ventaja de SingProbe es su coste marginal casi nulo, al no requerir una pasada de inferencia adicional. Sin embargo, está limitado a funcionar exclusivamente con Ling-3.0-flash, mientras que los guardrails externos son agnósticos al modelo generador.

## Limitaciones y advertencias

- Solo es compatible con el modelo base `inclusionAI/Ling-3.0-flash`; no funciona con otros modelos de la familia Ling ni con modelos de terceros.
- Requiere el uso de ramas de integración específicas de SGLang o vLLM; no hay soporte para otros frameworks de inferencia (llama.cpp, TGI, etc.).
- La detección de alucinaciones se basa en señales internas del modelo y puede no capturar todos los tipos de alucinación, especialmente las que son factualmente plausibles pero incorrectas.
- La clasificación de intenciones cubre solo 8 categorías predefinidas; intenciones novedosas o ambiguas pueden no clasificarse correctamente.
- La tasa de falsos positivos es baja (0,03 %), pero no nula; en aplicaciones críticas se recomienda combinar con revisión humana.
- El rendimiento en generación libre (F1 0,6452) es notablemente inferior al de los benchmarks supervisados, lo que sugiere que la sonda puede degradarse en escenarios no vistos.
- No se dispone de información sobre el sesgo del modelo en diferentes grupos demográficos o culturales; la evaluación se centra en métricas agregadas.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo base Ling-3.0-flash puede tener su propia licencia; se debe verificar la licencia del modelo base antes de su uso en producción.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/inclusionAI/Ling-3.0-flash-singprobe)
- [Informe tecnico (arXiv:2608.30703)](https://arxiv.org/abs/2608.30703)
- [Codigos de entrenamiento (GitHub)](https://github.com/inclusionAI/SingProbe)
- [Modelo base Ling-3.0-flash](https://huggingface.co/inclusionAI/Ling-3.0-flash)
- [Rama de integracion SGLang](https://github.com/jinzhen-lin/sglang/tree/token-probe-ling3-flash-main)
- [Rama de integracion vLLM](https://github.com/jinzhen-lin/vllm/tree/bailing-v3-token-probe)

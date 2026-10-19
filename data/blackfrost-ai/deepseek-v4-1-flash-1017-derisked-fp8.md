# Blackfrost-AI/DeepSeek-V4.1-Flash-1017-DERISKED-FP8

## Resumen

DeepSeek-V4.1-Flash-1017-DERISKED-FP8 es un checkpoint de investigación publicado por Blackfrost-AI (Las Vegas, NV) a partir de `deepseek-ai/DeepSeek-V4.1-Flash-1017`. No es un modelo entrenado desde cero ni un adaptador: es una modificación conductual codificada directamente en los pesos de un subconjunto de tensores de proyección de salida de la atención en la parte media de la pila, manteniendo intactos el tokenizador, la plantilla de chat, el torreón de visión, los expertos enrutados, los expertos compartidos y las cabezas de predicción multi-token. El resultado carga y sirve como un DeepSeek V4.1 Flash FP8 estándar, sin flags adicionales ni estado externo.

Arquitectónicamente es un transformer disperso de tipo MoE con 763.205.315.794 parámetros totales (unos 763,2 mil millones) almacenados en FP8 E4M3 con escalas de bloque 32x32, 40 capas, tamaño oculto de 5.120 y 384 expertos enrutados de los que se activan 6 por token, más un experto compartido por capa MoE. La ventana de contexto nativa es de 1.048.576 tokens.

Su relevancia es doble: por un lado, sirve como referencia técnica de un modelo de casi 800 mil millones de parámetros cuantizado de forma nativa en FP8 y desplegable en un solo nodo de 4 GPU B300; por otro, documenta un experimento poco habitual de "derisking" a nivel de pesos orientado a reducir falsos rechazos en tareas legítimas de seguridad ofensiva autorizada. El repositorio está limitado (gated), marcado como experimental y su receta de modificación es propietaria y no se distribuye, lo que limita seriamente su auditabilidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `DeepseekV41ForCausalLM` / `deepseek_v41` (transformer MoE con atención de una sola cabeza KV) |
| Parámetros totales | 763.205.315.794 (≈763,2 B) |
| Parámetros activos | no disponible (6 de 384 expertos enrutados activos por token, más 1 experto compartido por capa MoE) |
| Longitud de contexto | 1.048.576 tokens (máximo nativo arquitectónico) |
| Tipos de cuantización | FP8 E4M3 con escalas de bloque 32x32 y activación dinámica (nativa en el checkpoint); no se documentan otras |
| Idiomas soportados | en (inglés) según la model card |
| Licencia | `deepseek-license` (identificador `other`, heredada del modelo base) |
| Formato de pesos | safetensors, 48 shards, 510,3 GB de repositorio |
| Capas del transformer | 40 |
| Tamaño oculto | 5.120 |
| Cabezas de atención | 64 cabezas, 1 cabeza KV, `head_dim` 512 |
| Expertos enrutados | 384 en total / 6 activos por token |
| Expertos compartidos | 1 por capa MoE |
| Vocabulario | 129.280 tokens |
| dtype de pesos | FP8 E4M3 |
| Modelo base | `deepseek-ai/DeepSeek-V4.1-Flash-1017` (revisión `1bae0e1088993b9b82de08f59de5be5a34e42170`) |
| Forma de servicio validada | 4x B300, TP 4, `--ep-size 1`, nodo único |
| Estado | Experimental / gated (acceso restringido) |
| Descargas / likes | 89 / 14 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer MoE de DeepSeek V4.1 Flash: 40 capas con tamaño oculto 5.120, 64 cabezas de atención con una única cabeza KV de dimensión 512 (esquema de compartición de clave-valor que reduce drásticamente el coste de caché KV en contextos largos), y capas MoE con 384 expertos enrutados más un experto compartido, activando 6 expertos por token. Incluye además cabezas de predicción multi-token (multi-token prediction), que el autor declara byte-idénticas al modelo original. La cuantización FP8 E4M3 con escalas de bloque 32x32 y activación dinámica está aplicada de forma nativa en los pesos publicados, de modo que el servidor no necesita aplicar cuantización en tiempo de carga.

Sobre el entrenamiento upstream no se aporta información en la documentación disponible: no se especifican el número de tokens, la composición del dataset, ni si hubo fases de RLHF, DPO o RL con verificación. Lo que sí se documenta con precisión es la intervención de Blackfrost: una edición a nivel de pesos confinada a un subconjunto de tensores de proyección de salida de la atención en la mitad de la pila; el resto de tensores (expertos enrutados, expertos compartidos, cabezas MTP), el tokenizador, la plantilla de chat y el código del modelo se conservan sin modificar. No se emplean adaptadores, prompts de sistema incrustados, filtros de runtime ni intervenciones en decodificación. La receta exacta de modificación es propietaria y no se distribuye, y el autor verifica que la reconstrucción byte a byte del paquete es correcta.

Como innovaciones técnicas relevantes en el despliegue, la card documenta el uso de decodificación especulativa DSPARK con tamaño de bloque 5, fusión de expertos compartidos (`--enforce-shared-experts-fusion`), prefill troceado de 16.384 tokens y parser automático de razonamiento y de tool calls en SGLang.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activado a través de la plantilla de chat nativa de DeepSeek V4.1 Flash (no hay prompt de sistema de Blackfrost incrustado).
- Razonamiento multi-paso con un parámetro `reasoning_effort` configurable; la configuración recomendada por el autor es `"max"`.
- Tool calling / function calling con formato nativo del modelo upstream; el parser de tool calls está soportado en el servidor de referencia.
- Capacidades de agente: el modelo puede encadenar llamadas a herramientas, aunque la ejecución, la reinyección de resultados, la autenticación y el estado de la conversación son responsabilidad de la aplicación.
- Procesamiento de contextos muy largos, hasta 1.048.576 tokens nativos (sujeto a la memoria disponible para la caché KV en el runtime concreto).
- Capacidades de seguridad ofensiva en entornos autorizados: el ajuste de pesos busca reducir falsos rechazos en tareas de pentesting, red teaming y análisis de vulnerabilidades con marco explícito de autorización.
- Capacidades de visión heredadas del modelo base (el "vision tower" se conserva sin modificar), aunque la evaluación publicada no las cubre.
- Multilingüismo: la model card solo declara inglés (`en`); no se documenta soporte de otros idiomas.

## Casos de uso

- Pentesting autorizado y red teaming: el checkpoint está pensado para entregar procedimientos y payloads reales en tareas con encuadre explícito de autorización, en lugar de derivar la respuesta a una advertencia genérica. Adecuado para equipos con alcance contractual definido y entornos de laboratorio.
- Análisis de vulnerabilidades y threat modeling: con 1M tokens de contexto, el modelo puede ingerir informes completos, código fuente y documentación de arquitectura en una sola pasada y correlacionar hallazgos entre artefactos.
- Auditoría de seguridad de repositorios: la ventana de contexto permite cargar un árbol de código de tamaño medio junto con sus dependencias y trazas para buscar patrones de inyección, desbordamientos o fallos de control de acceso.
- Respuesta a incidentes: análisis de volcados de logs extensos y de cadenas de eventos multi-fase sin trocear el contexto, manteniendo la coherencia temporal entre eventos separados por cientos de miles de tokens.
- Desarrollo de reglas de detección: generación y refinado de firmas y reglas (por ejemplo, para motores tipo Suricata o Sigma) a partir de descripciones de comportamiento adversarial y de muestras de tráfico.
- Formación y simulación de adversarios: generación de escenarios de ataque realistas y material de entrenamiento para ejercicios de mesa en equipos defensivos, con control de autorización por parte de la aplicación.
- Automatización de agentes con herramientas: integración en pipelines donde el modelo planifica, invoca herramientas externas (escáneres, APIs, ejecutores) y reinyecta resultados, aprovechando el tool calling nativo y el modo thinking.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe una evaluación de "entrega en tareas duras" sobre 10 tareas de seguridad ofensiva extraídas de un banco de 250 preguntas de red team, con `temperature 0.0`, thinking activado, `max_tokens` 16.384 y una sola muestra por tarea, pero la tabla de resultados aparece truncada en la información proporcionada, por lo que no se dispone de las cifras de entrega ni de rechazo. Tampoco se incluyen resultados de MMLU, HumanEval, GSM8K ni de evaluaciones comparables.

| Benchmark | Resultado | Notas |
|---|---|---|
| MMLU | no disponible | No publicado en la información disponible |
| HumanEval | no disponible | No publicado en la información disponible |
| GSM8K | no disponible | No publicado en la información disponible |
| Tasa de entrega en tareas de seguridad ofensiva (10 tareas) | no disponible | La card describe la metodología pero la tabla de resultados está truncada |
| Tasa de rechazo | no disponible | El autor advierte explícitamente que "DERISKED" no implica cero rechazos |

## Requisitos de hardware

- Peso de los pesos en FP8: 510,3 GB en 48 shards. Distribuidos en TP 4, suponen aproximadamente 128 GB por GPU solo para pesos, antes de caché KV y buffers de activación.
- Configuración de referencia validada: 4x NVIDIA B300 en un único nodo, tensor parallel 4, `--ep-size 1`, con aproximadamente 211 GB por GPU de pool estático a `--mem-fraction-static 0.70` para la configuración de 1M de contexto.
- GPU de consumo: no es viable. Un modelo de 763 B parámetros en FP8 no cabe en tarjetas de 24 GB (RTX 4090), 32 GB ni 48 GB, ni siquiera con paralelismo en un nodo de consumo.
- Memoria para contexto: la ventana de 1M tokens es un límite arquitectónico, no una garantía de que el runtime pueda asignar la caché KV correspondiente; hay que dimensionar la memoria para el contexto objetivo, no para el máximo teórico.
- Opciones de despliegue: SGLang es la única configuración validada y documentada, con scripts de referencia en el directorio `deployment/` (incluye decodificación especulativa DSPARK con bloque 5, fusión de expertos compartidos, `--chunked-prefill-size 16384`, `--max-running-requests 32`, parsers automáticos de razonamiento y de tool calls, y `--default-chat-template-kwargs '{"thinking": true}'`). No se documenta soporte de vLLM, TGI, llama.cpp ni Ollama.
- Al ser un checkpoint FP8 nativo, no es necesario pasar `--quantization` al servidor.
- Latencia y throughput: no disponible (no se publican medidas de tokens por segundo ni tiempos de primera respuesta).

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos por token | Contexto | dtype de pesos | Licencia | Estado |
|---|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-DERISKED-FP8 (este) | 763,2 B | no disponible (6 de 384 expertos) | 1.048.576 | FP8 E4M3 nativo | deepseek-license | Experimental, gated |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (base) | 763,2 B | no disponible (6 de 384 expertos) | 1.048.576 | no disponible en esta ficha | deepseek-license | Publicado por DeepSeek |
| Otras alternativas MoE de escala comparable | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación con datos verificables en la información proporcionada es contra el modelo base: misma arquitectura, mismo tokenizador, misma plantilla de chat, mismo vocabulario y mismo tamaño. Las diferencias se limitan a los tensores de proyección de salida de la atención modificados por Blackfrost y al empaquetado en FP8 con escalas de bloque. No se dispone de datos de rendimiento de alternativas de la misma categoría en la documentación facilitada, por lo que no se ofrece una comparación cuantitativa con terceros.

## Limitaciones y advertencias

- Estado experimental: el propio autor lo etiqueta como "research release" y advierte de que debe leerse la sección de limitaciones antes de desplegarlo. No se declara listo para producción.
- Acceso restringido (gated): el repositorio requiere autorización, lo que condiciona la reproducibilidad y la distribución de derivados.
- Receta de modificación propietaria: la intervención en los pesos no se documenta ni se distribuye. Esto impide auditar qué se ha cambiado exactamente y dificulta evaluar riesgos de alineación o de comportamiento fuera de distribución.
- Rendimiento en benchmarks no verificado: el autor indica explícitamente que "DERISKED" no implica un rendimiento de benchmark sin cambios. La edición de pesos puede degradar capacidades generales y no hay cifras publicadas que lo desmientan.
- Cambio deliberado del comportamiento de rechazo: el ajuste busca reducir falsos rechazos en seguridad ofensiva, lo que implica un perfil de seguridad distinto al del modelo base. Existe riesgo de que reduzca también rechazos que sí serían deseables; la aplicación debe implementar controles de autorización propios.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual ni de calibración para este checkpoint; es un riesgo relevante en un modelo orientado a generar procedimientos técnicos.
- Limitación de idioma: solo se declara inglés. No hay evidencia de calidad en castellano ni en otros idiomas, independientemente de lo que haga el modelo base.
- Restricciones de licencia: la licencia `deepseek-license` es la del modelo base y se hereda; no se detallan en la información disponible las condiciones exactas para uso comercial, por lo que deben consultarse en el enlace de licencia antes de cualquier despliegue productivo.
- Dependencia de hardware muy específica: la única configuración validada es 4x B300 con SGLang. Otros runtimes, topologías o GPU no están verificados y pueden producir resultados distintos.
- Contexto máximo no garantizado en la práctica: 1M tokens es un límite arquitectónico; servirlo exige memoria de caché KV proporcional, y la calidad del modelo en ventanas extremas no está evaluada en la documentación disponible.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o equidad para este checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Blackfrost-AI/DeepSeek-V4.1-Flash-1017-DERISKED-FP8
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Licencia (referenciada en la model card): https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Perfil del autor en X: https://x.com/Blackfrost_AI
- Revisión del modelo base: `1bae0e1088993b9b82de08f59de5be5a34e42170`
- Scripts de despliegue: directorio `deployment/` dentro del repositorio del modelo (SGLang, TP 4)
- Paper, blog o demo adicionales: no disponible en la información proporcionada

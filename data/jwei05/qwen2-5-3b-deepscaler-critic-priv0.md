# JWei05/qwen2.5-3b-deepscaler-critic-priv0

## Resumen

qwen2.5-3b-deepscaler-critic-priv0 es un crítico de valor escalar (value function) desarrollado por el usuario JWei05 sobre el backbone Qwen2.5-3B (3.085.940.737 parámetros). No es un modelo generativo de propósito general: se trata de un componente de entrenamiento por refuerzo que recibe el prompt y la cadena de acciones (traza de razonamiento parcial) generada por una política y devuelve un único escalar que estima el retorno esperado de esa trayectoria. Su función es servir como `CRITIC_PATH` en entrenamientos PPO dentro del framework SkyRL.

El modelo se publica como parte de un estudio comparativo de horizonte corto entre GRPO y PPO, y está entrenado offline sobre rollouts del conjunto DeepScaleR easy10k (variante `deepscaler_critic_pretrain_priv0_easy10k`). La etiqueta "priv0" indica que es un crítico actor-visible: solo accede a la información que ve la política, sin datos privilegiados como la respuesta correcta. Emplea el contrato de crítico de SkyRL en su esquema 3 (asignación de crédito por cadena de acciones, gamma 1 y contrato de prompt).

Su relevancia es acotada y muy específica: cubre un hueco poco poblado, el de críticos de valor públicos y reutilizables para investigación en RL sobre razonamiento matemático. Al estar construido sobre un modelo de 3B, permite reproducir y hacer ablaciones de PPO con un coste de cómputo contenido. En el momento de redactar esta ficha el repositorio no registra descargas ni "likes", y no se han publicado benchmarks asociados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con cabeza de valor escalar adicional |
| Parametros totales | 3.085.940.737 (aprox. 3,09 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el backbone Qwen2.5-3B soporta hasta 32.768 tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo distribuye safetensors) |
| Idiomas soportados | no disponible (heredados del backbone Qwen2.5-3B, multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors` para el backbone, `value_head.safetensors` para la cabeza de valor) |
| Ficheros adicionales | `value_head_config.json`, `skyrl_critic_config.json` (contrato de crítico de SkyRL, esquema 3) |
| Modelo base | Qwen/Qwen2.5-3B |
| Tamaño del repositorio | 12,4 GB |
| Fecha de creación | 2026-09-11 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia Qwen2 (el backbone Qwen2.5-3B) al que se añade una cabeza de valor escalar. El repositorio separa ambos componentes en dos ficheros safetensors independientes: `model.safetensors` contiene el cuerpo del modelo y `value_head.safetensors` la proyección que produce el escalar. El fichero `skyrl_critic_config.json` documenta el contrato que SkyRL espera del crítico: esquema 3, con asignación de crédito sobre la cadena de acciones, factor de descuento gamma igual a 1 (retorno sin descuento) y un contrato de prompt explícito.

El entrenamiento es offline y se realizó sobre rollouts del conjunto DeepScaleR easy10k, ejecución identificada como `deepscaler_critic_pretrain_priv0_easy10k`. Al ser un crítico "actor-visible" (priv0), consume únicamente las observaciones disponibles para la política; no recibe recompensas intermedias ni la solución de referencia. La condición gamma = 1 implica que el crítico estima el retorno acumulado completo de la trayectoria sin penalización temporal, algo coherente con el escenario de horizonte corto del estudio. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron etapas adicionales de DPO o RLHF sobre el propio crítico.

## Capacidades

- Estimación de valor escalar de trayectorias parciales de razonamiento: dado un prompt más una cadena de acciones, devuelve un único valor numérico que aproxima el retorno esperado.
- Asignación de crédito por cadena de acciones (action-chain credit) conforme al esquema 3 del contrato de SkyRL.
- Integración directa como crítico en entrenamientos PPO mediante `CRITIC_PATH` con `ALGO=ppo` y `PRIVILEGED_CRITIC=0` dentro del script `SkyRL/scale/train/examples/deepscaler/run_rl.sh`.
- Funcionamiento en modo actor-visible: solo procesa la información que la política puede observar, lo que lo hace apto para escenarios sin acceso a recompensas intermedias ni a etiquetas.
- Compatibilidad con el ecosistema de pesos safetensors y con el backbone Qwen2.5-3B, lo que facilita su carga con Transformers.
- Capacidad de servir como inicialización para críticos en experimentos de RL con presupuestos de cómputo reducidos, gracias a su tamaño de 3B.
- No se documentan capacidades de generación de texto como modelo independiente, tool calling, function calling, razonamiento multi-paso autónomo, visión ni audio. La cabeza de valor no está pensada para producir texto.

## Casos de uso

- Entrenamiento PPO de modelos de razonamiento matemático: se carga como `CRITIC_PATH` en SkyRL con `ALGO=ppo` y `PRIVILEGED_CRITIC=0`, de modo que el crítico estima el valor de las trazas parciales durante la optimización de la política.
- Estudio comparativo GRPO frente a PPO: el modelo se publica explícitamente como pieza del estudio de horizonte corto, por lo que sirve para replicar la rama PPO bajo condiciones controladas y comparar curvas de recompensa frente a variantes sin crítico.
- Inicialización de críticos en RL a gran escala: al haber sido preentrenado offline sobre rollouts de DeepScaleR easy10k, evita arrancar el crítico desde pesos aleatorios y reduce el tiempo hasta que el estimador de valor resulta útil.
- Investigación en asignación de crédito: la configuración gamma = 1 con crédito por cadena de acciones permite experimentar con la propagación de la señal de recompensa a lo largo de trazas de razonamiento y medir el efecto de distintas variantes de crédito.
- Filtrado de rollouts por valor estimado: el escalar devuelto puede emplearse para descartar trayectorias con valor bajo antes de consumir presupuesto de recompensa, útil en pipelines de generación masiva de datos de razonamiento.
- Ablaciones rápidas en una sola GPU: con 3,09B de parámetros, el crítico cabe en GPUs de consumo, lo que permite iterar sobre hiperparámetros de PPO (learning rate, clip, longitud de horizonte) sin reservar un clúster.
- Reproducibilidad de experimentos de RL: al ser un checkpoint público con contrato documentado, permite a otros grupos reproducir resultados de PPO con crítico actor-visible sin reentrenar el componente de valor.
- Investigación en value-based reranking: el valor escalar puede combinarse con estrategias de best-of-n para ordenar candidatos generados por la política sin necesidad de un modelo de recompensa adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión del estimador de valor (por ejemplo, correlación entre valor predicho y retorno real, error cuadrático medio o curvas de entrenamiento) ni comparaciones con otros críticos.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones calculadas a partir del recuento real de parámetros (3.085.940.737) y de la sobrecarga habitual de KV cache; la model card no las especifica.

- Pesos en bf16/fp16: aproximadamente 6,2 GB solo para el backbone, más una cantidad despreciable para la cabeza de valor.
- Pesos en int8: aproximadamente 3,1 GB.
- Pesos en int4: aproximadamente 1,8 GB.
- Inferencia en bf16 con KV cache para contextos largos: del orden de 8 a 10 GB de VRAM.
- GPU de consumo compatibles: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070 Ti Super, RTX 4080 y RTX 4090 de 24 GB pueden ejecutar el crítico en bf16. En tarjetas de 8 a 10 GB conviene usar int8 o int4.
- GPU de datacenter: A100 (40/80 GB), H100, L40S y similares son suficientes y sobradas para la inferencia del crítico.
- Entrenamiento PPO completo: hay que sumar actor, modelo de referencia, optimizador y motor de rollout. Como referencia orientativa, solo los estados de Adam en fp32 de un modelo de 3B ocupan unos 24,7 GB, por lo que un ciclo PPO con actor y crítico de 3B requiere del orden de 80 GB o reparto entre varias GPU (por ejemplo, varias A100/H100 o un nodo con varias RTX 4090). Esta cifra es una estimación, no un dato publicado.
- Opciones de despliegue: el crítico no es un modelo de chat estándar, de modo que las cabeceras de valor no suelen estar soportadas de forma nativa por servidores de inferencia genéricos como vLLM o TGI. El uso previsto es la carga mediante Transformers y el framework SkyRL. No hay pesos GGUF publicados, por lo que llama.cpp y Ollama no son aplicables sin una conversión manual que además tendría que gestionar la cabeza de valor.
- Latencia y throughput: no disponible. El coste por llamada equivale aproximadamente a una pasada forward de Qwen2.5-3B sobre la secuencia de prompt más acciones.

## Comparativa con modelos similares

No se han identificado en la información disponible críticos de valor escalares públicos equivalentes para RL sobre razonamiento matemático. La comparación más razonable es con el propio backbone y con la alternativa de construir el crítico desde cero.

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-3b-deepscaler-critic-priv0 | 3,09B | no disponible (backbone: hasta 32.768 tokens) | Crítico de valor escalar para PPO en SkyRL | Apache-2.0 | Público en HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| Qwen/Qwen2.5-3B (modelo base) | 3,09B | 32.768 tokens | Modelo de lenguaje generativo | no confirmada en la información proporcionada | Público en HuggingFace |
| Críticos escalares públicos comparables | no disponible | no disponible | no disponible | no disponible | No se han encontrado en la información disponible |

## Limitaciones y advertencias

- No es un modelo de chat ni un generador de texto: la salida es un escalar. Cualquier uso como modelo conversacional requeriría ignorar la cabeza de valor y recurrir al backbone, cuyas capacidades generativas no han sido evaluadas aquí.
- Riesgo de estimación sesgada fuera de distribución: el crítico se entrenó sobre rollouts de DeepScaleR easy10k, un dominio de matemáticas de dificultad baja. Su estimación de valor puede degradarse en otros dominios, en problemas de dificultad alta o con políticas muy distintas de la que generó los rollouts.
- Dependencia del contrato de prompt: el fichero `skyrl_critic_config.json` define el esquema 3 con un contrato de prompt concreto. Alimentar el modelo con un formato distinto producirá valores inconsistentes sin que se emita ningún aviso.
- Herencia de sesgos del backbone: al derivar de Qwen2.5-3B y de los rollouts de una política concreta, puede reproducir los sesgos lingüísticos y de razonamiento de ambos, incluidos sesgos de género, cultura y idioma presentes en los datos de origen.
- Sin validación por la comunidad: el repositorio registra 0 descargas y 0 likes, y no incluye métricas del estimador de valor. No hay evidencia pública independiente de su calidad como crítico.
- Alcance del preentrenamiento offline: no se especifican el número de tokens, el número de épocas ni los hiperparámetros usados, lo que dificulta juzgar su convergencia.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero conviene verificar la licencia del modelo base Qwen/Qwen2.5-3B, no confirmada en la información proporcionada, antes de redistribuir derivados en producción.
- Uso en producción: este modelo está pensado como componente de investigación en pipelines de RL, no como servicio de inferencia. Introducirlo en producción exige gestionar la cabeza de valor fuera de los servidores de inferencia convencionales.
- Nombre del repositorio: el sufijo `priv0` y el término "priv" pueden inducir a confusión; en este contexto alude a crítico actor-visible, no a un repositorio de acceso restringido, que es público.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JWei05/qwen2.5-3b-deepscaler-critic-priv0
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen2.5-3B
- SkyRL (framework referenciado en la model card; enlace no confirmado por la búsqueda web): https://github.com/NovaSky-AI/SkyRL
- Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo. Los resultados obtenidos correspondían a páginas turísticas y de alojamiento de la localidad de Davutlar (Kuşadası, Turquía) y no guardan relación con el modelo. No se han localizado papers, blogs, demos ni repositorios adicionales asociados.

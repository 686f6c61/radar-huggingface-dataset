# BeastxD/text2cypher_lora_v6_grpo

## Resumen

`BeastxD/text2cypher_lora_v6_grpo` es un modelo de lenguaje entrenado mediante aprendizaje por refuerzo (GRPO) para la tarea de **text2cypher**: traducir preguntas en lenguaje natural a consultas Cypher sobre bases de datos Neo4j. Desarrollado por el usuario BeastxD, el modelo parte del checkpoint `BeastxD/text2cypher_lora_v7`, que a su vez se basa en el modelo instructivo **Qwen3-4B-Instruct-2507** (arquitectura Qwen3ForCausalLM, 4.022 millones de parámetros). El objetivo del post-entrenamiento con GRPO era mejorar la precisión de ejecución de las consultas generadas, pero el resultado medido muestra que **no logró superar de forma estadísticamente significativa a su punto de partida**, por lo que el autor lo publica como un resultado negativo documentado y como validación de la infraestructura de entrenamiento reutilizable.

El modelo es relevante en el ecosistema de modelos de código abierto porque demuestra, con datos concretos, que el refuerzo por recompensa basada en ejecución no aporta una mejora clara cuando el modelo base ya está convergido, y porque proporciona una base para investigar estrategias de recompensa con crédito parcial. A pesar de su resultado, el modelo puede utilizarse como alternativa a v7 si se acepta un rendimiento similar, y sirve como referencia para futuros experimentos de RL en generación de consultas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (Qwen3-4B-Instruct-2507) |
| Parámetros totales | 4.022.492.096 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos en bf16 en el repositorio) |
| Idiomas soportados | Inglés (etiqueta `en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (pesos fusionados, bf16) |

## Arquitectura y entrenamiento

El modelo base es `Qwen3-4B-Instruct-2507`, un transformer causal con 4.022 millones de parámetros, entrenado por Qwen para tareas de instrucción y razonamiento. Sobre este, el autor aplicó un entrenamiento SFT (LoRA) que dio lugar al checkpoint `text2cypher_lora_v7`, y posteriormente un post-entrenamiento con **GRPO (Group Relative Policy Optimization)** sobre ese checkpoint. El entrenamiento GRPO utilizó una recompensa basada en ejecución: para cada pregunta, se generan 8 consultas Cypher, se ejecutan en una base de datos Neo4j real, y se asigna `+1.0` si el conjunto de resultados coincide con el esperado, `0.0` si la consulta se ejecuta pero no es correcta, y `-0.5` si falla al ejecutarse.

La configuración de entrenamiento incluye LoRA con r=16 sobre las proyecciones `q/k/v/o` y `gate/up/down`, tasa de aprendizaje `1e-5`, beta `0.04`, temperatura `1.0`, 8 generaciones por prompt y 10.622 prompts distribuidos en 9 bases de datos Neo4j auto-alojadas. El entrenamiento se detuvo deliberadamente en el paso 1.201 de 5.311 (22,6% de una época, 3 horas y 50 minutos, ~19.200 generaciones ejecutadas) porque los grupos utilizables por paso cayeron de 1.35 a 0.85 (una reducción del 37% en el rendimiento de aprendizaje efectivo) y la pendiente de recompensa pasó de +0.131 a -0.045 por cada 1000 pasos. El autor concluye que la falta de transferencia a datos no vistos se debe a que el checkpoint base ya había extraído casi todo el aprendizaje útil: v7 producía consultas ejecutables en un 98.91% de los casos frente a un techo de 99.76%.

## Capacidades

- **Generación de consultas Cypher**: traduce preguntas en inglés a consultas Cypher ejecutables en Neo4j, con un prompt de sistema específico (~620 caracteres) y esquema de base de datos con poda exacta.
- **Razonamiento multi-paso**: al estar basado en Qwen3-4B-Instruct, hereda capacidades de razonamiento encadenado y comprensión de instrucciones complejas.
- **Ejecución correcta**: el modelo produce consultas que se ejecutan correctamente en el 98.91% de los casos (según los datos de entrenamiento), aunque la precisión de ejecución (resultados coincidentes) es de ~56% en el test.
- **No soporta tool calling ni agentes específicos**: no se menciona soporte de function calling ni uso como agente autónomo; su foco es la generación de consultas.
- **Multilingüismo**: solo se declara inglés como idioma soportado.
- **Modo de pensamiento**: no se indica explícitamente un modo de pensamiento o razonamiento extendido, aunque la arquitectura base lo permite.

## Casos de uso

- **Generación de consultas Cypher para análisis de grafos**: el modelo puede utilizarse para que usuarios no expertos en Neo4j formulen preguntas en lenguaje natural y obtengan consultas Cypher listas para ejecutar, por ejemplo en dashboards de visualización de grafos de conocimiento.
- **Integración en sistemas de BI sobre grafos**: en entornos empresariales, se puede integrar en pipelines que reciban preguntas de negocio y generen consultas para bases de datos Neo4j, reduciendo el tiempo de desarrollo de informes.
- **Asistente de desarrollo para ingenieros de datos**: los desarrolladores pueden usarlo como ayuda para escribir consultas Cypher complejas, verificando la sintaxis y la lógica de ejecución contra el esquema de la base de datos.
- **Evaluación de modelos text2cypher**: el modelo sirve como referencia para comparar técnicas de entrenamiento con refuerzo frente a ajuste fino supervisado, ya que documenta un caso de no mejora y proporciona datos de ejecución comparativos.
- **Investigación en aprendizaje por refuerzo**: su código y resultados pueden utilizarse como base para experimentos con recompensas con forma parcial (partial credit) o GRPO aplicado a generación de código de consultas.
- **Prototipos de chatbots de consulta de datos**: se puede desplegar como motor de un chatbot que interactúe con una base de datos de grafos, respondiendo a preguntas de negocio mediante consultas generadas y ejecutadas automáticamente.

## Benchmarks y rendimiento

El autor proporciona resultados de precisión de ejecución sobre un conjunto de prueba de 2.464 filas, comparando el modelo con su punto de partida y con otro checkpoint (v8_denoised). Los resultados son los siguientes:

| Comparación | Precisión de ejecución | Delta | p de McNemar | Verdicto |
|---|---|---|---|---|
| v7 → v6_grpo (test Neo4j 2024v1) | 55.64% → 56.25% | +0.61 pp | 0.4181 | No significativo |
| v8_denoised → v6_grpo (misma división) | 55.73% → 56.21% | +0.49 pp | 0.5632 | No significativo |

Además, se detalla que el modelo acertó 157 filas que v7 falló, y falló 142 que v7 acertó, lo que indica un cambio de aproximadamente 300 respuestas sin mejora neta. En los datos de entrenamiento, la tasa de coincidencia subió de 51.1% a un pico de 61.2%, y las consultas rotas se redujeron de 2.8% a ~1.6%, pero estos resultados no se transfirieron a los datos de prueba.

## Requisitos de hardware

- **VRAM estimada**: el modelo tiene 4.022 millones de parámetros en bf16, lo que ocupa aproximadamente 8 GB en memoria. Con cuantización de 8 bits (si se aplicara) ocuparía ~4 GB, y con 4 bits ~2 GB. No se proporcionan pesos cuantizados oficiales.
- **GPU recomendadas**: una GPU con al menos 12 GB de VRAM (p. ej., NVIDIA RTX 3080/3090, RTX 4090) para inferencia en bf16 con margen de contexto. Para despliegue en producción, una A100 (40 GB) o H100 permiten ejecutar con holgura.
- **Cabe en consumer GPU**: sí, con bf16 en una RTX 3090/4090 (24 GB) es viable; con cuantización 8 bits cabe en GPUs de 8 GB (p. ej., RTX 3070) aunque no se proporcionan los archivos.
- **Opciones de despliegue**: el modelo es compatible con `transformers` (carga directa con `AutoModelForCausalLM`), y puede desplegarse con `vLLM`, `TGI`, `Ollama` o `llama.cpp` si se convierten los pesos a GGUF. No se incluyen instrucciones de despliegue específicas en la model card.
- **Latencia y throughput**: no se proporcionan datos de latencia ni throughput en la información disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos text2cypher fuera de la familia del propio autor. El modelo se puede comparar internamente con su punto de partida:

| Modelo | Precisión de ejecución (test) | Contexto | Licencia | Observaciones |
|---|---|---|---|---|
| text2cypher_lora_v6_grpo (este) | 56.25% | No disponible | Apache-2.0 | Resultado de GRPO, no supera a v7 |
| text2cypher_lora_v7 | 55.64% | No disponible | Apache-2.0 | Modelo base sobre el que se aplicó GRPO |
| text2cypher_lora_v8_denoised | 55.73% | No disponible | Apache-2.0 | Otro checkpoint del mismo autor, similar en rendimiento |

No hay comparación con modelos de otros desarrolladores (por ejemplo, otros modelos text2cypher del repositorio `neo4j-labs/text2cypher`) en la información disponible.

## Limitaciones y advertencias

- **No mejora sobre su punto de partida**: los resultados estadísticos muestran que el entrenamiento con GRPO no produjo una mejora significativa sobre `v7`; el autor recomienda usar `v7` o `v8_denoised` en su lugar.
- **Sobreajuste al conjunto de entrenamiento**: el rendimiento mejoró en los prompts de entrenamiento pero no se transfirió a datos no vistos, lo que indica un sobreajuste al conjunto de entrenamiento.
- **Señal de recompensa limitada**: el sistema de recompensa no distingue bien entre consultas incorrectas y fallidas, ya que la mayoría de las consultas ya eran ejecutables; esto redujo la señal útil para el aprendizaje.
- **Idioma limitado**: solo se soporta inglés, lo que limita su uso en entornos multilingües.
- **Dependencia del prompt y del esquema**: el modelo requiere el prompt de sistema y el esquema de la base de datos con el pruning exacto para funcionar correctamente; usarlo con prompts neutrales o sin pruning puede dar resultados inferiores.
- **Riesgo de alucinación en consultas complejas**: aunque la mayoría de las consultas se ejecutan, la precisión de coincidencia con el resultado correcto es de solo ~56%, lo que implica que muchas consultas generadas son válidas sintácticamente pero no devuelven el resultado esperado.
- **No se recomienda para producción sin validación**: dado que no supera al modelo base y que la precisión de ejecución es limitada, se debe evaluar cuidadosamente antes de usarlo en entornos críticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BeastxD/text2cypher_lora_v6_grpo
- Punto de partida v7: https://huggingface.co/BeastxD/text2cypher_lora_v7
- Checkpoint v8_raw: https://huggingface.co/BeastxD/text2cypher_lora_v8_raw
- Repositorio de datos y evaluación text2cypher de Neo4j Labs: https://github.com/neo4j-labs/text2cypher
- Documentación de DeepWiki sobre el repositorio: https://deepwiki.com/neo4j-labs/text2cypher
- Documentación de formatos de exportación de modelos (DeepWiki): https://deepwiki.com/neo4j-labs/text2cypher/3.5-model-export-formats

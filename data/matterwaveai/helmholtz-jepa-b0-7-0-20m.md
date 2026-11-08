# MatterWaveAI/helmholtz-jepa-b0.7.0-20m

## Resumen

HELMHOLTZ-JEPA-b0.7.0-20m es un modelo compacto de tipo Joint-Embedding Predictive Architecture (JEPA) desarrollado por MatterWaveAI, integrado en la familia de escalado HELMHOLTZ-1 y construido sobre el modelo base MatterWaveAI/grt-20m. Se presenta como un "world model" causal y juez de trayectorias de tipo System-1, orientado a despliegue en el borde (edge), pipelines de CI sin GPU y verificación de leyes de escalado. Su particularidad arquitectónica es que elimina las matrices lineales densas y las capas convolucionales: todos los bloques del codificador y del predictor son cascadas de transformaciones ortogonales que preservan la norma (determinante +1), lo que evita el colapso de representación del JEPA por construcción geométrica, sin necesidad de negativos contrastivos.

El modelo almacena aproximadamente 26,4 millones de parámetros, aunque el autor declara una capacidad equivalente densa de unos 66 millones. Está pensado para predecir estados objetivo directamente en el espacio latente, sin decodificar tokens intermedios, y para emitir decisiones de aprobación, rechazo o escalado sobre acciones de agentes tras un rollout latente multi-paso. La model card indica que los pesos, los detalles de implementación y el código fuente están retenidos durante un ciclo de liberación escalonado, por lo que la información disponible es fundamentalmente la reportada por el autor.

La relevancia actual del modelo radica en su propuesta de un JEPA puramente rotacional y de muy bajo coste computacional, con resultados declarados muy altos en un conjunto de evaluación propio denominado XL-smol. No obstante, la ausencia de pesos públicos, de detalles técnicos verificables y de resultados en benchmarks estándar independientes limita seriamente su evaluación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | JEPA (Joint-Embedding Predictive Architecture) con transformer rotacional; sin matrices lineales densas ni capas convolucionales; bloques de transformaciones ortogonales con det = +1 |
| Parametros totales | ~26,4 M almacenados; ~66 M de capacidad equivalente densa (según el autor) |
| Parametros activos | no disponible (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el autor indica que los pesos están retenidos) |

## Arquitectura y entrenamiento

La arquitectura es un JEPA en el que el codificador y el predictor se componen exclusivamente de transformaciones ortogonales que preservan la norma, con determinante +1. Según el autor, esto mantiene las distancias entre pares y el rango de covarianza de forma automática, con una deriva de ortogonalidad de 1,42e-14 tras 100 actualizaciones del objetivo y una retención de rango efectivo superior al 99,0 %, sin negativos contrastivos. El modelo opera en espacio latente: codifica vistas de contexto y objetivo, y predice estados objetivo multi-paso sin decodificar tokens intermedios. También incorpora dinámica inversa en forma cerrada para recuperar operadores de transición causal entre pares de estados sin pasos de gradiente, y contrafactuales no conmutativos sensibles al orden de las acciones.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. Tampoco se detallan innovaciones como decodificación especulativa o atención lineal más allá de la descripción rotacional. La model card indica explícitamente que los detalles de implementación y el código fuente se retienen durante el ciclo de liberación escalonado.

## Capacidades

- Predicción en espacio latente multi-paso (rollout de trayectorias latentes) sin decodificación de tokens intermedios.
- Juicio de seguridad y enrutamiento de acciones de agentes con decisión única de APPROVE, REJECT o ESCALATE.
- Verificación de rollouts relacionales multi-hop (2 a 3 saltos).
- Verificación de ciencia causal y sentido común físico.
- Verificación factual de un solo salto.
- Verificación socrática y epistémica en cuatro modos (SEE, SAY, DO, KNOW).
- Inducción de reglas en rejillas visual-espaciales 2D (evaluación tipo ARC-AGI-2 XL-smol).
- Dinámica inversa en forma cerrada para recuperar operadores de transición causal.
- Contrafactuales no conmutativos sensibles al orden de acciones.
- Calibración epistémica y abstención.
- Verificación de terminación de bucles de programa.
- Seguimiento de transiciones de estado simbólico.
- Planificación y scheduling de recursos y concurrencia.
- No se documenta soporte de tool calling ni function calling en el sentido habitual de los LLM.
- No se documenta capacidad multilingüe ni generación de texto libre conversacional.

## Casos de uso

- Despliegue en el borde y dispositivos con recursos limitados: con unos 26,4 M de parámetros almacenados y sin matrices lineales densas, el modelo está pensado para latencia ultrabaja en CPU, lo que lo hace adecuado para verificación local en dispositivos sin GPU.
- Pipelines de CI sin GPU: el autor lo orienta explícitamente a CI solo-CPU, donde podría actuar como verificador rápido de transiciones de estado o de terminación de bucles en pruebas automatizadas.
- Juez de seguridad de agentes (MPC): el modelo hace rollout latente de acciones candidatas y emite APPROVE, REJECT o ESCALATE antes de que el agente ejecute la acción, lo que encaja en capas de salvaguarda para agentes autónomos.
- Defensa frente a inyección de prompts y deriva de comportamiento: la suite de enrutamiento de acciones MPC incluye pruebas de deriva y defensa ante inyección, por lo que podría integrarse como filtro en sistemas de agentes expuestos a entradas no confiables.
- Verificación de razonamiento multi-hop en grafos de conocimiento: con resultados declarados del 100 % en rollouts relacionales de 2 a 3 saltos, podría usarse para validar cadenas de inferencia sobre grafos antes de publicar respuestas.
- Inducción de reglas en tareas de rejilla: la evaluación tipo ARC-AGI-2 sugiere uso en problemas de abstracción y razonamiento visual-espacial 2D, como la inferencia de transformaciones en rejillas.
- Verificación de ciencia causal y sentido común físico: podría emplearse para comprobar si una secuencia de estados propuesta por otro sistema respeta restricciones físicas básicas.
- Calibración y abstención: en dominios donde el modelo debe decidir cuándo no responder, la capacidad de abstención calibrada (78,12 % en la suite correspondiente) podría aprovecharse en sistemas de decisión conservadora.

## Benchmarks y rendimiento

Los únicos datos disponibles son los reportados por el autor en su model card, sobre conjuntos propios denominados XL-smol. No hay resultados en benchmarks estándar independientes (MMLU, HumanEval, GSM8K, etc.).

| Suite XL-smol (agregado de 6 suites) | Registros | Preguntas | Top-1 | pass@2 | Consistencia de orden |
|---|---:|---:|---:|---:|---:|
| Agregado macro / micro | 5.003 | 11.009 core (12.809 total) | 99,96 % / 99,98 % | 100,00 % | 100,0 % |

| Dominio (suite de 12 dominios) | Registros | Preguntas core | Precisión primaria | Precisión core | ECE |
|---|---:|---:|---:|---:|---:|
| Multi-hop relacional | 1.000 | 2.000 | 100,00 % | 100,00 % | 0,0883 |
| Ciencia causal y sentido común | 1.000 | 2.000 | 100,00 % | 100,00 % | 0,0206 |
| Verificación factual de un salto | 1.000 | 2.000 | 100,00 % | 100,00 % | 0,0190 |
| Verificación socrática de 4 modos | 1.000 | 2.000 | 100,00 % | 100,00 % | 0,00002 |
| Inducción de reglas en rejilla 2D (ARC-AGI-2) | 600 | 1.800 (3.600 total) | 100,00 % | 71,78 % (98,44 % elección) | 0,0035 |
| Enrutamiento MPC y deriva | 403 | 1.209 | 99,75 % | 66,67 % | 0,2899 |
| Calibración epistémica y abstención | 80 | 160 | 78,12 % | 78,12 % | 0,0764 |
| Terminación de bucles de programa | 150 | 600 | 74,00 % | 74,00 % | 0,0915 |
| Seguimiento de transiciones simbólicas | 60 | 180 | 73,33 % | 73,33 % | 0,0890 |
| Grafo de prerrequisitos (v5) | 2.777 | 7.558 | 72,85 % | 72,85 % | 0,0881 |
| Scheduling de recursos y concurrencia | 60 | 180 | 71,67 % | 71,67 % | 0,0940 |

Estos resultados no han sido verificados de forma independiente y proceden de conjuntos de evaluación definidos por el propio autor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con ~26,4 M de parámetros almacenados, una estimación en FP16 rondaría los 53 MB de pesos, pero el autor no publica requisitos oficiales ni formatos de cuantización.
- GPU recomendadas: no disponible. El modelo se orienta explícitamente a CPU y despliegue en el borde, no a GPU de datacenter.
- Compatibilidad con GPU de consumo: previsiblemente sí por tamaño, pero no hay datos oficiales ni pesos publicados para confirmarlo.
- Opciones de despliegue: la model card declara compatibilidad con la librería transformers y la etiqueta endpoints_compatible; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Pesos públicos |
|---|---|---|---|---|---|
| HELMHOLTZ-JEPA-b0.7.0-20m | ~26,4 M almacenados / ~66 M equivalentes | no disponible | JEPA rotacional, juez de trayectorias | Apache 2.0 | No (retenidos según el autor) |
| V-JEPA 2 (Meta) | no disponible en la información | no disponible | World model entrenado con vídeo para robótica y agentes | no disponible en la información | no disponible en la información |
| HELMHOLTZ-1 30M (MatterWaveAI) | 30 M | no disponible | Misma familia de escalado HELMHOLTZ-1 | no disponible en la información | no disponible en la información |

No se dispone de datos suficientes para comparar rendimiento en benchmarks comunes con alternativas de la misma categoría.

## Limitaciones y advertencias

- Los pesos, el código fuente y los detalles de implementación están retenidos; no es posible reproducir ni verificar los resultados declarados.
- Todos los benchmarks proceden de conjuntos propios (XL-smol) definidos por el autor y no han sido validados de forma independiente.
- Las cifras de precisión del 100 % en varias suites deben interpretarse con cautela: los conjuntos son pequeños y específicos, y los valores de ECE en algunos dominios (por ejemplo, 0,2899 en enrutamiento MPC) indican una calibración deficiente pese a la precisión alta.
- El rendimiento cae de forma notable en dominios como terminación de bucles (74,00 %), transiciones simbólicas (73,33 %), grafo de prerrequisitos (72,85 %) y scheduling (71,67 %), lo que sugiere escasa generalización fuera de las tareas mejor ajustadas.
- No se documentan idiomas soportados, sesgos conocidos ni comportamiento multilingüe.
- No se documenta soporte de tool calling, function calling ni generación de texto conversacional, pese a la etiqueta text-generation.
- Riesgo de alucinación: no evaluado en la información disponible; el modelo opera en espacio latente y no genera texto libre, por lo que el riesgo se traslada a decisiones de aprobación o rechazo incorrectas.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de pesos hace que esa licencia sea, en la práctica, inaplicable al artefacto.
- Para producción, la falta de especificaciones de contexto, cuantización, formatos de pesos y latencia impide dimensionar el despliegue con garantías.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatterWaveAI/helmholtz-jepa-b0.7.0-20m
- Modelo base: https://huggingface.co/MatterWaveAI/grt-20m
- Familia HELMHOLTZ-1: https://huggingface.co/MatterWaveAI/helmholtz-1
- Blog de Meta sobre V-JEPA 2 (referencia externa citada en la búsqueda): https://about.fb.com/news/2025/06/our-new-model-helps-ai-think-before-it-acts/

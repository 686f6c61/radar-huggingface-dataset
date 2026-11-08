# MatterWaveAI/helmholtz-s1-jepa-b0.7.0-20m

## Resumen

HELMHOLTZ-S1-JEPA-b0.7.0-20m es un modelo compacto de tipo world-model y clasificador de texto desarrollado por MatterWaveAI, diseñado específicamente como juez de seguridad para agentes, router de acciones mediante control predictivo de modelo (MPC) y guardarraíl (guardrail) de seguridad en pipelines de agentes. Se construye sobre el modelo base MatterWaveAI/helmholtz-jepa-b0.7.0-20m, que constituye el escalón de 20M dentro de la familia S1-GRT-JEPA. Su función principal no es generar texto, sino emitir decisiones de un solo paso (APPROVE / REJECT / ESCALATE) y seleccionar la siguiente llamada de herramienta de un agente, evaluando el estado de resultado predicho frente a invariantes de objetivo y seguridad.

El modelo emplea una arquitectura JEPA (Joint Embedding Predictive Architecture) rotacional, sin matrices lineales densas ni capas convolucionales, y opera con decodificación autorregresiva de tokens nula (zero autoregressive token decoding). Antes de emitir una decisión, proyecta las acciones candidatas en espacio latente ortogonal a lo largo de 1..H pasos y evalúa el resultado predicho. Según la model card, presenta invariancia exacta al orden de opciones del 100,0%, lo que lo hace adecuado para integración en sistemas de agentes donde la estabilidad de decisión frente a reordenamientos de alternativas es crítica.

La relevancia actual del modelo radica en su enfoque de seguridad de agentes basado en predicción en espacio latente en lugar de generación de texto, lo que reduce la superficie de ataque y evita la decodificación de tokens. Los pesos, los detalles de implementación arquitectónica y el código fuente están retenidos durante el ciclo de liberación escalonada del world-model, según indica el autor, para prevenir la evasión del guardarraíl mediante ataques de caja blanca. Esta ficha se basa exclusivamente en la información pública disponible en Hugging Face y en los resultados de búsqueda web proporcionados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | JEPA rotacional (rotational JEPA world-model); sin matrices lineales densas ni capas convolucionales |
| Parámetros totales | ~26,4M almacenados (~66M de capacidad densa equivalente) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (pesos retenidos durante el ciclo de liberación escalonada) |

## Arquitectura y entrenamiento

La arquitectura es un JEPA rotacional (S1-GRT-JEPA) que opera sobre representaciones latentes ortogonales en lugar de tokens. El modelo no contiene matrices lineales densas ni capas convolucionales, y realiza rollouts latentes de 1..H pasos para evaluar acciones candidatas antes de emitir una decisión. La evaluación se efectúa contra invariantes de objetivo y seguridad, sin decodificación autorregresiva de tokens. El modelo base es MatterWaveAI/helmholtz-jepa-b0.7.0-20m, y esta variante añade la capacidad de juez System-1, router MPC de acciones y guardarraíl de seguridad de agentes.

Los detalles de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la información proporcionada. El autor indica que los pesos, la implementación arquitectónica y el código fuente se retienen durante el ciclo de liberación escalonada para prevenir la evasión del guardarraíl mediante ataques de caja blanca. La model card reporta trayectorias de pérdida latente en evaluación (por ejemplo, de 3,2542 a 0,1596 en verificación de rollouts multi-hop), lo que sugiere un entrenamiento orientado a la reducción de pérdida en espacio latente, pero no se especifican los datos de entrenamiento.

## Capacidades

- Emisión de decisiones de un solo paso APPROVE / REJECT / ESCALATE para validación de acciones de agentes.
- Rollout latente de acciones candidatas a lo largo de 1..H pasos antes de decidir, sin decodificación autorregresiva de tokens.
- Routing de llamadas de herramienta (tool routing) mediante control predictivo de modelo (MPC).
- Verificación de rollouts relacionales multi-hop (2..3 saltos).
- Verificación causal y de sentido común físico.
- Verificación factual de un solo salto en world-model.
- Verificación socrática y epistémica en 4 modos (SEE / SAY / DO / KNOW).
- Inducción de reglas en cuadrículas visuales-espaciales 2D (evaluada en ARC-AGI-2 XL-smol).
- Defensa frente a deriva (drift) y prompt injection en routing de acciones de agentes.
- Calibración epistémica y abstención (abstention).
- Verificación de terminación de bucles de programa.
- Seguimiento de transiciones de estado simbólico.
- Verificación booleana formal y de tablas de verdad.
- Scheduling de recursos y concurrencia.
- Invariancia exacta al orden de opciones del 100,0% (option-order permutation invariance).
- Capacidades multilingües: no disponible.
- Capacidades de visión, audio o thinking mode: no disponibles (aunque la familia helmholtz-1-omni incluye multimodalidad, esta variante concreta se etiqueta como text-classification).

## Casos de uso

- Guardarraíl de seguridad en agentes autónomos: el modelo evalúa cada acción candidata del agente mediante rollout latente y emite APPROVE / REJECT / ESCALATE antes de la ejecución, usando los invariantes de seguridad como criterio de aceptación.
- Routing de herramientas en pipelines de agentes: selecciona la siguiente llamada de herramienta mediante MPC con lookahead H=1..2, integrándose como router entre el planificador y el ejecutor de herramientas.
- Defensa frente a prompt injection: la suite de evaluación incluye defensa frente a inyección de prompt y deriva en routing de acciones, por lo que puede desplegarse como filtro intermedio que valida instrucciones antes de que lleguen al agente principal.
- Verificación de acciones en sistemas de control predictivo: dado su enfoque MPC, encaja en bucles de control donde se requiere evaluar el estado de resultado predicho frente a invariantes antes de aplicar una acción.
- Validación de terminación de programas y bucles: puede usarse para verificar que un bucle de programa terminará según las condiciones esperadas, con una precisión reportada del 74,00% en el conjunto de verificación de terminación de bucles.
- Verificación de transiciones de estado simbólico: útil en sistemas con máquinas de estado donde debe comprobarse que cada transición es válida, con una precisión reportada del 73,33% en el conjunto de seguimiento de transiciones.
- Calibración epistémica y abstención: puede emplearse para decidir cuándo un agente debe abstenerse de actuar por falta de información, con una precisión reportada del 78,12% en el conjunto de calibración y abstención.
- Evaluación de razonamiento espacial en tareas tipo ARC-AGI-2: la inducción de reglas en cuadrículas 2D se evalúa en el conjunto ARC-AGI-2 XL-smol, lo que permite usarlo como componente de verificación en tareas de razonamiento visual-espacial estructurado.

## Benchmarks y rendimiento

Resultados reportados en la model card para el conjunto XL-smol (5.003 registros retenidos / 12.809 preguntas):

| Suite de evaluación XL-smol | Registros (n) | Preguntas | Top-1 | pass@2 | Consistencia de orden |
|---|---:|---:|---:|---:|---:|
| Verificación de rollouts relacionales multi-hop (2..3 saltos) | 1.000 | 2.000 | 100,00% | 100,00% | 100,0% |
| Verificación causal, ciencia y sentido común físico | 1.000 | 2.000 | 100,00% | 100,00% | 100,0% |
| Verificación factual de un solo salto | 1.000 | 2.000 | 100,00% | 100,00% | 100,0% |
| Verificación socrática y epistémica en 4 modos | 1.000 | 2.000 | 100,00% | 100,00% | 100,0% |
| Inducción de reglas en cuadrículas 2D (ARC-AGI-2 XL-smol) | 600 | 1.800 (3.600 total) | 100,00% | 100,00% | 100,0% |
| Routing MPC de acciones, deriva y prompt injection | 403 | 1.209 | 99,75% | 100,00% | 100,0% |
| Agregado de 6 suites (macro / micro) | 5.003 | 11.009 (12.809 total) | 99,96% / 99,98% | 100,00% | 100,0% |

Evaluación consolidada de 12 dominios XL-smol (10.130 registros retenidos / 27.487 preguntas):

| Dominio | Registros (n) | Preguntas | Precisión primaria | Precisión preguntas núcleo | ECE |
|---|---:|---:|---:|---:|---:|
| Rollouts relacionales multi-hop | 1.000 | 2.000 | 100,00% | 100,00% | 0,0883 |
| Ciencia causal y sentido común | 1.000 | 2.000 | 100,00% | 100,00% | 0,0206 |
| Verificación factual de un solo salto | 1.000 | 2.000 | 100,00% | 100,00% | 0,0190 |
| Verificación socrática en 4 modos | 1.000 | 2.000 | 100,00% | 100,00% | 0,00002 |
| Inducción de reglas en cuadrículas 2D (ARC-AGI-2) | 600 | 1.800 (3.600 total) | 100,00% | 71,78% (98,44% elección) | 0,0035 |
| Routing MPC de acciones y deriva | 403 | 1.209 | 99,75% | 66,67% | 0,2899 |
| Calibración epistémica y abstención | 80 | 160 | 78,12% | 78,12% | 0,0764 |
| Verificación de terminación de bucles de programa | 150 | 600 | 74,00% | 74,00% | 0,0915 |
| Seguimiento de transiciones de estado simbólico | 60 | 180 | 73,33% | 73,33% | 0,0890 |
| Batería de grafo de conocimiento de prerrequisitos (v5) | 2.777 | 7.558 | 72,85% | 72,85% | 0,0881 |
| Scheduling de recursos y concurrencia | 60 | 180 | 71,67% | 71,67% | 0,0940 |
| Verificación booleana formal y tablas de verdad | 2.000 | 6.000 | 68,45% | 68,45% | 0,1042 |
| Agregado del split de test de 12 dominios | 10.130 | 25.687 (27.487 total) | 86,51% macro | 79,97% micro (78,21% total) | 0,0804 medio |

No se han publicado comparaciones con modelos similares en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con ~26,4M parámetros almacenados, la huella de pesos en FP16 sería de aproximadamente 53 MB, pero al no publicarse los pesos ni los detalles de implementación, no puede confirmarse el consumo real de memoria en inferencia.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; por tamaño de parámetros sería previsible que quepa en GPU de consumo, pero no hay confirmación oficial.
- Opciones de despliegue: la model card indica compatibilidad con endpoints (tag endpoints_compatible) y library_name transformers. No se especifican integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de comparación con modelos de la misma categoría (guardarraíles de agentes basados en JEPA o routers MPC de acciones) en la información proporcionada. Dentro de la propia familia MatterWaveAI se mencionan las variantes helmholtz-1 (modelado de mundo JEPA sin colapso), helmholtz-1-omni (alineación Platónica de 5 modalidades), helmholtz-mamba-1 (recurrencia de espacio de estados rotacional selectiva O(1)) y helmholtz-rnn-1 (recurrencia RNN rotacional unitaria con compuertas O(1)), así como los futuros HELMHOLTZ-100M y HELMHOLTZ-350M-Omni, pero no se aportan datos comparativos de rendimiento entre ellos en la información disponible.

## Limitaciones y advertencias

- Pesos, implementación arquitectónica y código fuente retenidos: no es posible inspeccionar, reproducir ni auditar el modelo de forma independiente durante el ciclo de liberación escalonada.
- Los resultados de benchmarks son autoinformados por el autor y no han sido verificados de forma independiente.
- Precisión heterogénea entre dominios: el agregado macro es del 86,51%, pero dominios como verificación booleana formal (68,45%), scheduling de recursos (71,67%) y grafo de prerrequisitos (72,85%) quedan muy por debajo de los dominios con 100,00%.
- Error de calibración elevado en routing MPC de acciones (ECE 0,2899) y en verificación booleana formal (ECE 0,1042), lo que indica que las confidencias no están bien calibradas en esos dominios.
- Precisión de preguntas núcleo baja en routing MPC (66,67%) y en inducción de reglas ARC-AGI-2 (71,78%), pese a que la precisión primaria reportada es alta.
- Riesgo de alucinación: no disponible como dato explícito, pero al operar en espacio latente sin decodificación de tokens, el riesgo se traslada a la fidelidad del estado predicho frente a invariantes.
- Sesgos conocidos: no disponible.
- Limitaciones de contexto o idioma: no disponible.
- Licencia Apache 2.0: permite uso comercial, pero al no publicarse los pesos, la aplicabilidad práctica de la licencia queda condicionada a la disponibilidad futura de los artefactos.
- Caveat para producción: la retención deliberada de pesos y detalles impide validar el comportamiento del guardarraíl en entornos reales antes de su liberación completa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatterWaveAI/helmholtz-s1-jepa-b0.7.0-20m
- Modelo base: https://huggingface.co/MatterWaveAI/helmholtz-jepa-b0.7.0-20m
- Familia S1-GRT-JEPA: https://huggingface.co/MatterWaveAI/s1-grt-jepa
- helmholtz-1: https://huggingface.co/MatterWaveAI/helmholtz-1
- helmholtz-1-omni: https://huggingface.co/MatterWaveAI/helmholtz-1-omni
- helmholtz-mamba-1: https://huggingface.co/MatterWaveAI/helmholtz-mamba-1
- helmholtz-rnn-1: https://hu (enlace truncado en la información proporcionada)
- Referencia arXiv citada en la familia: arxiv:2610.39302 (mencionada en la model card de helmholtz-1-omni)

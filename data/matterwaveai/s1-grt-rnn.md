# MatterWaveAI/s1-grt-rnn

## Resumen

S1-GRT-RNN es un modelo de clasificación de texto publicado por MatterWaveAI que se presenta como un "juez de world-model" con estado recurrente de memoria constante. Se construye sobre el modelo base Helmholtz-RNN-1 mediante un ajuste fino y combina dos modos de recurrencia: una variante paralelizable tipo minGRU rotacional y una variante no lineal acoplada al estado denominada Unitary-GRU. Su propuesta central es mantener un estado recurrente compacto (el autor indica 3,0 KB) que se actualiza en tiempo y memoria O(1) por evento, sin caché KV, lo que lo orienta a la monitorización de agentes y protocolos de larga duración.

El modelo está pensado para tareas de verificación y enrutado de acciones en agentes: evaluación de trayectorias latentes, defensa frente a inyección de prompts, control predictivo de modelo (MPC) sobre acciones candidatas y seguimiento de autómatas con estado a lo largo de horizontes largos. La model card describe benchmarks internos sobre un conjunto propio denominado XL-smol, con cifras muy altas de precisión, pero no publica los pesos, la implementación arquitectónica ni el código fuente, lo que limita severamente su reproducibilidad.

Es relevante ahora porque propone una alternativa a los transformers con atención completa para guardarraíles de agentes, un área donde el coste de la caché KV y la estabilidad numérica en horizontes largos son problemas prácticos. No obstante, la ausencia de pesos y de detalles de entrenamiento hace que, a fecha de la información disponible, deba tratarse como una previsualización conceptual más que como un modelo desplegable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RNN con recurrencia rotacional unitaria (Rotational-minGRU y Unitary-GRU), sin matrices lineales densas ni capas convolucionales 1D/2D |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | hasta 8.192+ pasos en modo recurrente O(1); ventanas acotadas en modo JEPA |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (pesos no publicados según la model card) |

## Arquitectura y entrenamiento

La arquitectura se describe como una RNN con compuertas rotacionales unitarias. Cada rotación de estado es ortogonal, de modo que el determinante del estado se mantiene en +1,000000 y la deriva de magnitud homogénea es inferior a 5,0e-7 a lo largo de más de 1.000 pasos (9,55e-15 a T = 8.192 en float64). Esto evita tanto el desvanecimiento de restricciones de seguridad tempranas como la explosión de activaciones recurrentes. El modelo soporta dos modos: un escaneo paralelo tipo prefijo con paridad numérica inferior a 3,82e-6 frente a la recurrencia paso a paso, y un modo no lineal acoplado al estado en el que la transición depende del modo o estado del autómata del agente. Adicionalmente existe un modo híbrido que combina la RNN pura con atención rotacional, con una reducción de caché KV del 66,7 % y recall exacto en needle-in-haystack según el autor.

Sobre el entrenamiento no se aportan datos: no se indica el número de tokens, la composición del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento. La model card menciona evaluación sobre conjuntos XL-smol (5.003 registros y 12.809 preguntas en un conjunto; 10.130 registros y 27.487 preguntas en otro), pero no detalla el proceso de ajuste fino desde Helmholtz-RNN-1. La innovación técnica destacable es el uso de lookahead latente tipo JEPA y MPC sobre el estado recurrente para ramificar acciones candidatas en paralelo antes de emitir un veredicto APPROVE, REJECT o ESCALATE.

## Capacidades

- Clasificación de texto con estado recurrente O(1) y sin caché KV, orientada a monitorización de ejecución de agentes y protocolos de llamadas a herramientas.
- Seguimiento de autómatas con estado y ciclos a lo largo de horizontes de 64 a 8.192 pasos.
- Lookahead latente de trayectorias para simular consecuencias causales multi-paso en el espacio latente.
- Defensa frente a inyección de prompts embebida en observaciones de herramientas no confiables.
- Enrutado de acciones mediante control predictivo de modelo con horizontes de 1 a 2 pasos.
- Invariancia al orden de opciones: consistencia de permutación del 100 % según el autor.
- Verificación relacional multi-hop (2 a 3 saltos) y verificación factual de un solo salto.
- Inducción de reglas en rejillas visual-espaciales 2D (ARC-AGI-2 en la variante XL-smol).
- Modo híbrido RNN más atención rotacional para recall exacto en needle-in-haystack.
- No se documentan capacidades de generación de texto libre, código, matemáticas avanzadas, visión, audio ni tool calling en el sentido convencional.

## Casos de uso

- Guardarraíl de agentes en producción: el modelo consume eventos de ejecución (llamadas a herramientas, logs de build) y mantiene un estado de 3,0 KB por sesión, lo que permite monitorizar sesiones largas sin crecimiento de memoria y emitir veredictos de aprobación, rechazo o escalado.
- Defensa frente a inyección de prompts: al ramificar el estado recurrente sobre acciones candidatas, puede detectar instrucciones maliciosas embebidas en salidas de herramientas antes de que el agente las ejecute, con una precisión top-1 reportada del 99,75 % en 403 trayectorias retenidas.
- Enrutado de acciones con MPC: en un bucle de agente, se evalúan en paralelo las acciones candidatas con un horizonte de 1 a 2 pasos y se selecciona la transición más consistente con el world-model latente.
- Verificación de hechos y relaciones en pipelines de RAG: el modelo puede actuar como juez de consistencia sobre tripletas o afirmaciones extraídas de documentos, con evaluación multi-hop de 2 a 3 saltos.
- Monitorización de autómatas de protocolo: seguimiento de máquinas de estados en flujos de trabajo (por ejemplo, protocolos de reserva o de aprobación) a lo largo de miles de pasos sin degradación del estado.
- Inducción de reglas en entornos estructurados: aplicación a tareas de tipo ARC-AGI-2 para inferir reglas de transformación en rejillas 2D, útil en investigación sobre razonamiento abstracto.
- Clasificación de flujos de eventos en tiempo real: al tener coste O(1) por evento, encaja en sistemas de telemetría o detección de anomalías secuenciales donde una ventana de atención resultaría prohibitiva.

## Benchmarks y rendimiento

Los datos proceden exclusivamente de la model card del autor y corresponden a su conjunto interno XL-smol. No se han publicado resultados en benchmarks estándar reconocidos (MMLU, HumanEval, GSM8K) en la información disponible.

| Suite XL-smol | Registros retenidos | Preguntas | Precisión top-1 | pass@2 | Consistencia de orden |
|---|---|---|---|---|---|
| Verificación relacional multi-hop (2-3 saltos) | 1.000 | 2.000 | 100,00 % | 100,00 % | 100,0 % |
| Verificación causal y sentido común físico | 1.000 | 2.000 | 100,00 % | 100,00 % | 100,0 % |
| Verificación factual de un salto | 1.000 | 2.000 | 100,00 % | 100,00 % | 100,0 % |
| Verificación socrática y epistémica de 4 modos | 1.000 | 2.000 | 100,00 % | 100,00 % | 100,0 % |
| Inducción de reglas en rejilla 2D (ARC-AGI-2) | 600 | 1.800 core (3.600 total) | 100,00 % | 100,00 % | 100,0 % |
| Enrutado MPC y defensa ante inyección | 403 | 1.209 | 99,75 % | 100,00 % | 100,0 % |
| Seguimiento de autómata (T = 64-8.192) | streaming | 8.192 pasos | 100,00 % | 100,00 % | 100,0 % |
| Agregado de 6 suites | 5.003 | 11.009 core (12.809 total) | 99,96 % macro / 99,98 % micro | 100,00 % | 100,0 % |

Estas cifras no son verificables de forma independiente porque los pesos y el código no están publicados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El autor indica un estado recurrente de 3,0 KB y ausencia de caché KV, pero no publica el número de parámetros ni el tamaño de los pesos, por lo que no puede calcularse la huella de memoria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la model card declara compatibilidad con la librería transformers y el pipeline text-classification, pero al no publicarse los pesos no es posible desplegarlo con vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa rigurosa. El modelo se presenta como alternativa a arquitecturas de atención completa para guardarraíles de agentes, pero no publica pesos ni métricas en benchmarks estándar comparables.

| Modelo | Parámetros | Contexto | Licencia | Pesos disponibles | Benchmarks estándar |
|---|---|---|---|---|---|
| S1-GRT-RNN (MatterWaveAI) | no disponible | 8.192+ pasos en modo O(1) | apache-2.0 | No (retenidos según la model card) | No publicados |
| Modelos comparables de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los pesos, la implementación arquitectónica y el código fuente no están publicados; la model card indica que se retienen durante un ciclo de liberación escalonado. Esto impide verificar y reproducir los resultados.
- Los benchmarks presentados son internos (XL-smol) y no se han evaluado en suites estándar como MMLU, HumanEval o GSM8K, por lo que no son comparables con el estado del arte.
- Las cifras de precisión del 100 % en varias suites deben interpretarse con cautela: sin acceso al dataset ni al código, no puede descartarse sobreajuste o contaminación.
- No se documentan sesgos conocidos, pero tampoco se describe la composición del dataset de entrenamiento, lo que impide evaluar riesgos de sesgo.
- Riesgo de alucinación no caracterizado: el modelo es un clasificador/juez, no un generador, pero sus veredictos pueden ser erróneos en dominios fuera de distribución.
- Idiomas soportados no disponibles; la información no permite afirmar cobertura multilingüe.
- La licencia apache-2.0 permitiría uso comercial, pero la ausencia de pesos hace que esa posibilidad sea teórica a fecha de la información disponible.
- El pipeline declarado es text-classification, pero las capacidades descritas (MPC, lookahead, guardarraíles) van más allá de la clasificación estándar y no están expuestas en una API pública.
- Para producción, la falta de documentación sobre cuantización, latencia y requisitos de hardware impide planificar un despliegue real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MatterWaveAI/s1-grt-rnn
- Modelo base: https://huggingface.co/MatterWaveAI/helmholtz-rnn-1
- Modelo relacionado S1-GRT-JEPA: https://huggingface.co/MatterWaveAI/s1-grt-jepa
- Modelo relacionado S1-GRT-Mamba: https://huggingface.co/MatterWaveAI/s1-grt-mamba

# aimeigaoshou/agent-jev

## Resumen

AgentJev-0.6B es un modelo de decisión desarrollado por el usuario aimeigaoshou (repositorio de código bajo la organización malevrigns) que se presenta como un evaluador de estado para agentes, no como un generador de texto. Construido sobre el backbone de Qwen3-0.6B, el modelo elimina la cabeza de lenguaje y la sustituye por una cabeza de candidatos permutoequivariante que devuelve distribuciones de probabilidad sobre opciones suministradas por el llamador, sin decodificar un solo token. Su función es responder preguntas del tipo "¿está terminada esta tarea?" o "¿qué opción es la correcta?" en flujos de agentes que completan código o procesan facturas.

La relevancia del modelo reside en su planteamiento de eficiencia: en lugar de generar texto y parsearlo después, evalúa todos los candidatos en un único forward pass reutilizando un prefijo compartido. Según el autor, en una carga fija de 64 opciones más un booleano (33.547 tokens de ruta), la latencia mediana baja de 609,65 ms a 298,91 ms con caché de prefijo compartido, y las operaciones de token del backbone caen de 33.547 a 2.551. El modelo se publica con licencia Apache-2.0, pesos en FP32 y un tamaño de repositorio de 4,8 GB.

Con 598.418.689 parámetros reales en safetensors y un contexto de servicio limitado a 2.048 tokens, AgentJev-0.6B es una pieza pequeña y especializada dentro de una arquitectura de agente mayor. No compite con modelos generativos generalistas: su valor está en actuar como clasificador de decisión de bajo coste y alta frecuencia en bucles de razonamiento multi-paso, con soporte declarado para inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone Qwen3-0.6B sin cabeza de lenguaje, con cabeza de candidatos permutoequivariante) |
| Parametros totales | 598.418.689 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens (límite del servidor; entradas superiores se rechazan) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (FP32) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B como backbone y le elimina la cabeza de modelado de lenguaje. Sobre esa base se añade una cabeza de candidatos permutoequivariante que puntúa las opciones proporcionadas por el cliente, de modo que el orden de las opciones no se convierte en un ranking implícito. El softmax se aplica por pregunta y las respuestas booleanas, de elección y de puntuación se devuelven como distribuciones completas. La inferencia se organiza en un único forward pass con reutilización de prefijo compartido para los candidatos de una misma pregunta.

El entrenamiento combina supervisión y RLCD (Reinforcement Learning from Contrastive Data, según la nomenclatura del autor) sobre pares de código ejecutado. Ambos lados del par pasan las mismas comprobaciones públicas y la etiqueta proviene de las comprobaciones no mostradas, lo que evita filtrar la respuesta al modelo. Un conjunto de desarrollo congelado seleccionó el paso 12 de RLCD, y la selección se bloqueó antes de abrir el split de test. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición detallada del dataset.

## Capacidades

- Clasificación de decisión: devuelve distribuciones de probabilidad sobre opciones booleanas, de elección múltiple y de puntuación, sin generar texto.
- Evaluación de finalización de tareas: determina si una implementación cumple los requisitos declarados a partir de la tarea, el código y la salida de tests.
- Procesamiento de facturas: clasificación y decisión sobre flujos de facturación, con un 87,2 % de acuerdo con el profesor público en 500 preguntas.
- Puntuación de parches de código: clasifica si un parche candidato resuelve correctamente el problema planteado (348 de 524 parches correctos clasificados en primera posición).
- Evaluación de candidatos múltiples: puntúa conjuntos de opciones reutilizando un prefijo compartido, con independencia del orden de presentación.
- Soporte multilingüe limitado a inglés y chino.
- Integración como servicio local: cliente Python (`agentjev_client`) y servidor que escucha en `127.0.0.1:8149`.
- No soporta generación de texto, tool calling generativo ni razonamiento multi-paso autónomo; su rol es evaluar decisiones dentro de un agente externo.

## Casos de uso

- Verificación de finalización en agentes de código: el agente propone un parche y AgentJev evalúa, con la tarea y la salida de tests como estado, la probabilidad de que el trabajo esté realmente terminado (`prob_true`), evitando bucles infinitos de corrección.
- Clasificación de parches candidatos en pipelines de CI: dado un conjunto de diffs generados, el modelo puntúa cada uno y permite seleccionar el más probable antes de ejecutar la suite completa de tests, reduciendo coste de cómputo.
- Procesamiento de facturas: clasificación de documentos y decisiones de enrutamiento en flujos administrativos, con un 87,2 % de acuerdo con el profesor de referencia en el conjunto de 500 preguntas.
- Enrutamiento de decisiones en agentes multi-herramienta: el modelo evalúa opciones discretas (qué herramienta invocar, qué rama seguir) y devuelve la distribución completa, lo que permite al orquestador aplicar umbrales de confianza.
- Control de calidad en generación asistida: puntuación de respuestas o implementaciones frente a criterios definidos por el usuario, usando la interfaz `score` para obtener una distribución sobre niveles de calidad.
- Evaluación de bajo coste en producción: al no decodificar tokens y reutilizar prefijos, puede invocarse en cada paso de un bucle de agente con latencias del orden de cientos de milisegundos en la carga medida por el autor.
- Investigación en RLHF/RLCD: el checkpoint permite estudiar cómo un modelo pequeño aprende a evaluar resultados ejecutados, sirviendo como componente de recompensa o filtro en pipelines de datos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Tarea | Metrica | Valor | Referencia |
|---|---|---|---|
| Coding completion | Accuracy (%) | 57,8 | 606/1048 |
| Coding completion | Recall (%) | 57,8 | desde 35,7 % |
| Coding completion | AUROC | 0,589 | desde 0,516 |
| Coding completion | Parche correcto en primera posición | 348/524 | desde 305/524 |
| Invoice processing | Acuerdo con el profesor (%) | 87,2 | 500 preguntas |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP32 ocupan aproximadamente 2,4 GB (598 M de parámetros × 4 bytes); con overhead de activaciones y caché de prefijo, se recomienda al menos 4-6 GB de VRAM.
- GPU recomendadas: cualquier GPU con 8 GB o más; una RTX 4090, A100 o H100 son sobredimensionadas para este modelo, que cabe holgadamente en GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs con 6 GB o más de VRAM.
- Opciones de despliegue: servidor propio del autor (`python -m jev_service.server`) con checkpoint PyTorch y fichero `temperatures.json`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: en la carga fija del autor (64 opciones más un booleano, 33.547 tokens de ruta), mediana de 298,91 ms con prefijo compartido frente a 609,65 ms sin compartir, tras warmup. La diferencia máxima de probabilidad entre ambas rutas fue de 0,000508 y la opción elegida no cambió.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AgentJev-0.6B | 598 M | 2.048 tokens | Clasificador de decisión sobre Qwen3-0.6B | Apache-2.0 | Hugging Face + GitHub |
| Qwen3-0.6B | 0,6 B | no disponible en la informacion | Modelo generativo base | Apache-2.0 | Hugging Face |
| Modelos de reward/verifier de tamaño similar | no disponible | no disponible | Puntuación de respuestas | variable | no disponible |

No se dispone de datos comparativos de rendimiento con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, código ni razonamiento; solo devuelve distribuciones sobre opciones suministradas.
- Contexto de servicio limitado a 2.048 tokens; las entradas que lo superan se rechazan con error, por lo que diffs largos no pueden evaluarse.
- Los benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false` en la model card).
- El rendimiento en coding completion es moderado (57,8 % de accuracy, AUROC 0,589), lo que implica una capacidad discriminativa limitada y riesgo de decisiones incorrectas en producción.
- Idiomas limitados a inglés y chino; no hay soporte declarado para castellano.
- Riesgo de sesgo y alucinación no cuantificado en la información disponible; al tratarse de un clasificador, el riesgo se manifiesta como decisiones erróneas con alta confianza.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3-0.6B también es Apache-2.0 según la información disponible.
- Requiere envolver el safetensors en un checkpoint PyTorch (`torch.save`) antes de arrancar el servidor, lo que añade un paso manual al despliegue.
- El servidor se vincula a `127.0.0.1` por defecto, sin configuración documentada para exposición en red.

## Enlaces

- Hugging Face: https://huggingface.co/aimeigaoshou/agent-jev
- Repositorio de código: https://github.com/malevrigns/agent-jev
- Licencia: https://github.com/malevrigns/agent-jev/blob/main/LICENSE
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- README en chino: README_zh.md (referenciado en la model card)
- Workbench local: http://127.0.0.1:8149/

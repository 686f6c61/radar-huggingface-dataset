# husnainbinmunawar/graphintel-temporal-gnn-experimental

## Resumen

GraphIntel temporal GNN es un modelo experimental de red neuronal sobre grafos (GNN) para predicción de enlaces en grafos temporales tipados, desarrollado por el usuario de Hugging Face husnainbinmunawar. El modelo implementa un esquema de paso de mensajes ("message passing") temporal, tipado y acotado, entrenado desde inicialización aleatoria sobre registros del dataset ICEWS14 (eventos políticos internacionales codificados), publicado bajo licencia Apache-2.0.

Su relevancia es limitada y de carácter fundamentalmente metodológico: el propio autor declara en la model card que el modelo queda por debajo de la línea base de popularidad en el split evaluado y que no constituye una afirmación de calidad para producción. Se trata, por tanto, de un artefacto de investigación que documenta un experimento de ablación (memoria online del nodo origen y protocolo de arranque en frío) más que de un modelo desplegable.

El tamaño real de los pesos es de 251.136 parámetros (0,25 M), lo que lo sitúa en la categoría de modelos minúsculos, muy alejados de los LLM: no procesa texto ni lenguaje natural, sino tripletas (sujeto, relación, objeto) con marca temporal. No dispone de pipeline declarado, no tiene descargas ni likes, y su repositorio ocupa 0,0 GB en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal sobre grafos temporal tipada con paso de mensajes acotado (graphintel_temporal_gnn) |
| Parametros totales | 251.136 (0,25 M) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje natural; opera sobre entidades y relaciones de ICEWS14) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería PyTorch) |

## Arquitectura y entrenamiento

La arquitectura es una GNN temporal tipada que aplica paso de mensajes acotado ("bounded typed temporal message-passing") para la tarea de predicción de enlaces. Incorpora dos mecanismos que el autor evalúa explícitamente: una memoria online del nodo origen (source-node memory) y un protocolo de arranque en frío (cold-start) para nodos sin historial previo. El modelo se entrena desde inicialización aleatoria, sin pesos preentrenados, lo que implica que toda la señal procede del dataset de entrenamiento.

Los datos de entrenamiento son registros del dataset ICEWS14 (Integrated Crisis Early Warning System, eventos codificados con fecha), distribuidos bajo Apache-2.0. No se especifica en la información disponible el número de tokens ni de tripletas empleadas, la composición exacta del split, ni si se aplicaron técnicas de regularización, RLHF o ajuste fino preferencial (no aplicables en este dominio). La innovación declarada es la combinación de memoria online del nodo origen con el protocolo de cold-start, evaluada de forma comparativa frente a una línea base de popularidad.

## Capacidades

- Predicción de enlaces en grafos temporales tipados: dado un par de entidades y una relación con marca temporal, estima la probabilidad de que el enlace exista.
- Modelado de evolución temporal de interacciones mediante paso de mensajes con información de tiempo.
- Manejo de relaciones tipadas (distintos tipos de evento en ICEWS14).
- Memoria online del nodo origen para incorporar historial reciente del sujeto.
- Protocolo de cold-start para entidades sin observaciones previas.
- No soporta generación de texto, razonamiento en lenguaje natural, código, matemáticas ni visión.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los agentes LLM.
- Capacidades multilingües: no disponibles (no opera sobre lenguaje natural).

## Casos de uso

- Investigación en predicción de enlaces temporales: servir como implementación de referencia reproducible de un esquema de paso de mensajes temporal tipado sobre ICEWS14, útil para comparar variantes de memoria y cold-start en experimentos académicos.
- Ablación de memoria online del nodo origen: el modelo permite aislar el efecto de mantener un estado del sujeto frente a no hacerlo, midiendo el impacto en métricas de ranking de enlaces.
- Evaluación de protocolos de cold-start: útil para estudiar cómo se comporta una GNN temporal cuando aparecen entidades nuevas sin historial, un escenario frecuente en datos de eventos.
- Docencia y formación en GNN temporales: por su tamaño (0,25 M de parámetros) y licencia permisiva, es adecuado para prácticas de laboratorio sobre grafos dinámicos sin requerir hardware especializado.
- Reproducción de líneas base en análisis de eventos políticos: permite replicar el experimento declarado por el autor (comparación con la línea base de popularidad) sobre ICEWS14.
- Prototipado rápido de pipelines de grafos temporales: integrable en cuadernos de PyTorch para validar preprocesado de tripletas temporales antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única afirmación cuantitativa de la model card es cualitativa: el modelo temporal queda por debajo de la línea base de popularidad en el split evaluado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 251.136 parámetros en precisión fp32 los pesos ocupan aproximadamente 1 MB.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU consumer (por ejemplo, GTX 1650, RTX 3060) es sobrada. También funciona en CPU.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: PyTorch nativo (safetensors); vLLM, llama.cpp, Ollama y TGI no son aplicables porque no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles; por el tamaño del modelo, la latencia será dominada por el preprocesado del grafo más que por el cómputo de la red.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GraphIntel temporal GNN (este) | 251.136 | no aplica | Predicción de enlaces temporales tipados | Apache-2.0 | Hugging Face, 0 descargas |
| Modelos de referencia sobre ICEWS14 (p. ej. TTransE, TA-DistMult, RE-NET) | no disponible en la informacion proporcionada | no aplica | Predicción de enlaces temporales | habitualmente académica | publicaciones y repos, no verificados aquí |
| Línea base de popularidad | no disponible | no aplica | Predicción de enlaces | no aplica | referencia interna del experimento |

No se dispone de datos verificados de parámetros, contexto ni rendimiento de los modelos comparables en la información proporcionada; la comparativa es, por tanto, incompleta y no permite establecer una jerarquía de calidad.

## Limitaciones y advertencias

- El propio autor advierte que el modelo queda por debajo de la línea base de popularidad en el split evaluado y que no constituye una afirmación de calidad para producción.
- Entrenado desde inicialización aleatoria sobre un único dataset (ICEWS14), lo que limita la generalización a otros dominios de grafos.
- No es un modelo de lenguaje: no puede usarse para generación de texto, atención al cliente, código ni tareas de NLP.
- Riesgo de sobreajuste y de resultados no reproducibles fuera del protocolo exacto del autor; no se documentan semillas, splits ni hiperparámetros en la información disponible.
- Sesgos: los derivados del dataset ICEWS14 (cobertura geográfica y temporal sesgada hacia eventos políticos internacionales codificados).
- Riesgo de alucinación: no aplica en el sentido de los LLM, pero las predicciones de enlaces pueden ser erróneas sin señal de calibración publicada.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el estado experimental y la falta de validación desaconsejan cualquier uso en producción.
- Sin descargas ni validación por la comunidad en el momento de la consulta; el repositorio ocupa 0,0 GB, lo que puede indicar pesos mínimos o ausencia de artefactos adicionales.
- Idiomas y contexto: no disponibles por no ser aplicables.

## Enlaces

- Hugging Face: https://huggingface.co/husnainbinmunawar/graphintel-temporal-gnn-experimental
- Dataset ICEWS14: no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible en la informacion proporcionada
- Repositorio de código: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada

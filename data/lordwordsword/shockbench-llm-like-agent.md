# lordwordsword/shockbench-llm-like-agent

## Resumen

ShockBench-Flow LLM-like agent (Small) es una política encoder-decoder de 21 millones de parámetros publicada por el usuario lordwordsword en HuggingFace, diseñada para la tarea de control de redes de suministro del entorno ShockBench-Flow. No es un modelo de lenguaje: es un agente de decisión que adopta la mecánica de un LLM (tokenización semanal, memoria de historial completo, cross-attention de las consultas de acción y refinamiento iterativo en varias pasadas) para decidir cada semana cuánto enviar de cada bien por cada ruta de una red logística simulada. Los bienes modelados son GNL, crudo, combustible nuclear, obleas y chips; la red incluye redes eléctricas, fábricas, terminales y puntos de estrangulamiento.

El problema que resuelve es la asignación semanal de flujos bajo disrupciones exógenas (cierres de estrechos, sanciones, saltos arancelarios, paradas de fábrica) observadas solo a través de avisos y anuncios ruidosos. La relevancia técnica está en su método de entrenamiento: en lugar de un LLM preentrenado, el grueso de la calidad proviene de entrenar directamente contra el objetivo de la tarea, con gradientes que atraviesan un port diferenciable del simulador y una pérdida de 1 − RSS sobre episodios completos de 52 semanas.

Con licencia MIT, 0 descargas y 0 likes en el momento de la consulta, es un artefacto de investigación reproducible más que un modelo listo para producción. Sus resultados reportados (RSS 0,8655 y 0,8798 en dos semillas de entropía) lo sitúan al nivel del mejor agente conocido por el autor, aunque este último es anónimo y de caja negra.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer con sesgo de grafo, memoria de historial tipo Perceiver, bloque de pronóstico y cabezas con mezcla de expertos |
| Parametros totales | 21 millones (variante Small) |
| Parametros activos | No aplica de forma global; las cabezas usan un experto compartido + 4 expertos de estrato con router y compuerta de confianza + expertos de fase (semanas ≥ 14, ≥ 27, ≥ 40) |
| Longitud de contexto | Episodios de 52 semanas; memoria causal de todas las semanas pasadas comprimida a 8 latentes por semana; ventana de decisión por paso: 1 semana |
| Tipos de cuantizacion | No disponible (no se documenta cuantización; el repositorio se distribuye como checkpoint de PyTorch) |
| Idiomas soportados | No disponible; no aplica, el modelo no procesa lenguaje natural |
| Licencia | MIT |
| Formato de pesos | PyTorch (`library_name: pytorch`); no se especifica safetensors ni GGUF. Tamano del repositorio: 0,1 GB |

## Arquitectura y entrenamiento

La entrada semanal se tokeniza en 1 token global, 38 tokens de nodo y 108 tokens de ranura de ruta, construidos a partir de unos 60 grupos de características (514, 100 y 280 columnas respectivamente: stock, pipeline entrante, combustible y racionamiento de la red, colas en chokepoints, costes, tarifas, avisos, previsiones de demanda y características de historial), proyectados con MLP y sumados a embeddings de nodo, ranura y tipo de token. El encoder semanal es un transformer con sesgo de grafo de 8 capas, dimensión 256, 8 cabezas y FFN con factor de expansión 4. Cada semana pasada se comprime a 8 latentes estilo Perceiver; el decoder atiende causalmente a todas las semanas previas con un sesgo ALiBi de antigüedad y una clave nula aprendida, y una caché encoder-decoder mantiene claves y valores para que cada semana cueste un solo paso.

El bloque de pronóstico predice apertura de rutas, demanda, coste, tarifa, capacidad y stock a horizontes de 1, 2, 4, 8 y 13 semanas; esos pronósticos se convierten en tokens futuros a los que el decoder de acción hace cross-attention, de modo que la visión propia del agente sobre las próximas semanas condiciona la decisión actual. Una cabeza de régimen clasifica el tipo de escenario en 4 estratos y marca el estado "inestable ahora", lo que alimenta la condicionalización FiLM del decoder y el router de expertos. El decoder de acción (2 capas, dimensión 128, 4 cabezas) procesa consultas para ranuras, grupos de mercancía, pares de liberación y overrides, con self-attention de consultas, cross-attention a la semana actual más tokens de pronóstico y cross-attention causal a la memoria. Hay 3 pasadas de refinamiento: la acción inicial es el plan nominal y la distribución de salida de cada pasada se incorpora a la siguiente. Las cabezas decodifican cuotas de ranura con softmax por grupo de mercancía, totales por grupo con 26 bins más un offset decodificado como esperanza, modo de liberación por par con 3 clases y argmax, y cantidad de override como mezcla decodificada como esperanza, cada familia con su temperatura (por defecto 1).

El entrenamiento tiene tres fases. Primero, un oráculo clarividente resuelve cada episodio de entrenamiento con un programa entero mixto y sus planes se reproducen en el simulador, etiquetando aproximadamente 22 000 episodios Small (escenarios exclusivamente de entrenamiento). Segundo, clonación de comportamiento con pérdidas de entropía cruzada y regresión por cabeza, pronósticos auxiliares y supervisión profunda sobre las pasadas de refinamiento, lo que da una política razonable pero frágil (RSS ≈ 0,45–0,5) porque los errores se acumulan a lo largo de 52 semanas. Tercero, entrenamiento a través de un simulador diferenciable, que aporta la mayor parte de la calidad: las reglas semanales (racionamiento de combustible, colas en chokepoints, lotes de fábrica, escasez, almacenamiento y descarte) se portaron a torch con coincidencia de 1e-16 frente al simulador de referencia en numba, y la pérdida es 1 − RSS de episodios completos. La model card pública está truncada en la descripción de esta tercera fase y la etiqueta `grpo` figura en los tags, pero el detalle de ese paso no está disponible en el texto consultado.

## Capacidades

- Control de flujos en redes de suministro: emite cada semana un diccionario de acción con flujos en 108 ranuras de ruta, modos de liberación de carga en cola en chokepoints y cantidades de override.
- Razonamiento sobre historial largo: mantiene memoria causal de todas las semanas transcurridas del episodio mediante latentes comprimidos, con coste de un paso por semana gracias a la caché.
- Pronóstico multi-horizonte integrado en la decisión: predice apertura de rutas, demanda, coste, tarifa, capacidad y stock a 1, 2, 4, 8 y 13 semanas y los usa como tokens futuros.
- Clasificación de régimen: identifica el tipo de escenario (4 estratos) y detecta el inicio de una disrupción ("inestable ahora"), modulando el decoder por FiLM y el router de expertos.
- Planificación bajo incertidumbre: opera con observaciones parciales y ruidosas (avisos y anuncios) sin acceso al futuro del escenario.
- Refinamiento iterativo de la acción: tres pasadas que parten del plan nominal y realimentan la distribución de salida.
- Cumplimiento de presupuesto temporal: las ejecuciones reportadas usan un presupuesto de 2 segundos por semana en CPU, con 0 semanas de fallback y 0 semanas fuera de presupuesto.
- No soporta tool calling, function calling, agentes conversacionales, multilingüismo, visión ni audio: no es un modelo de lenguaje y no procesa texto libre.

## Casos de uso

- Planificación semanal de envíos en una red logística multi-producto: el agente recibe el estado de stock, pipelines y colas y devuelve los flujos por ruta; es adecuado porque su acción está definida exactamente sobre 108 ranuras y 5 mercancías, sin necesidad de traducción posterior.
- Evaluación de resiliencia ante disrupciones: se ejecutan episodios con cierres de estrechos, sanciones o paradas de fábrica y se mide el RSS frente a la referencia naive y al oráculo clarividente, lo que permite comparar políticas bajo escenarios controlados.
- Generación de políticas de referencia para investigación en operations research: al ser un checkpoint pequeño con licencia MIT, sirve como baseline reproducible frente a agentes LP como `fastlp_v4`.
- Docencia y experimentación con simulación diferenciable: el parche del simulador en torch con coincidencia de 1e-16 con la referencia numba permite estudiar el efecto de entrenar a través del entorno en lugar de clonar un oráculo.
- Sustitución de un agente LP en bucles de decisión con presupuesto de cómputo ajustado: entra en 2 segundos por semana en CPU, lo que lo hace viable en entornos donde un MILP con 600 segundos de planificación no es desplegable.
- Análisis de coste computacional por episodio: la model card reporta que el modelo es más barato que el mejor agente conocido en 131 de 200 episodios (semilla 4242) y 234 de 400 (semilla 9001), útil para estudios de eficiencia.
- Prototipado de políticas con cabezas condicionadas por régimen: la estructura de expertos por estrato y por fase (semanas ≥ 14, ≥ 27, ≥ 40) sirve de plantilla para tareas de control con dinámica no estacionaria.

## Benchmarks y rendimiento

RSS = (J_naive − J) / (J_naive − J_clairvoyant), agregado sobre estratos de escenario con pesos 0,5 / 0,3 / 0,15 / 0,05. Mayor es mejor.

| Agente | RSS, entropía 4242 (200 episodios) | RSS, entropía 9001 (400 episodios) |
|---|---|---|
| ShockBench-LLM-like agent (este modelo) | 0,8655 | 0,8798 |
| Mejor agente conocido (anónimo, caja negra, no del autor) | 0,8636 | 0,8793 |
| Primer modelo mezcla de expertos del autor (misma familia) | 0,8509 | 0,8660 |
| Agente LP `fastlp_v4` (del autor) | 0,7919 | 0,8130 |
| Regla naive (referencia del benchmark) | 0 | 0 |
| Plan clarividente (referencia del benchmark) | 1 | 1 |

Referencias adicionales reportadas: el oráculo clarividente alcanza 0,915 en los identificadores 4242 de 0 a 49 (50 de los 200 episodios) con un MILP de un solo disparo de 600 s; un MILP rodante alimentado con el futuro real alcanza 0,886 en esos mismos 50 episodios. La diferencia agregada frente al mejor agente conocido está dentro de un error estándar: +0,0010 ± 0,0011 y +0,0007 ± 0,0007 de J_naive. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje en la información disponible, y no serían aplicables a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Con 21 millones de parámetros, los pesos ocupan aproximadamente 84 MB en fp32 y 42 MB en fp16; la memoria adicional corresponde a las cachés de claves y valores de 52 semanas y a las proyecciones de características.
- GPU recomendadas: no se especifican; cualquier GPU consumer reciente es sobradamente suficiente. Los resultados reportados se obtuvieron con presupuesto de CPU de 2 segundos por semana, sin necesidad de GPU.
- Cabe en GPU consumer: sí, en cualquier RTX o equivalente, y también en CPU. Un episodio completo de 52 semanas cabe por tanto en unos 104 segundos con el presupuesto declarado.
- Opciones de despliegue: al ser un checkpoint de PyTorch, la vía natural es cargarlo con PyTorch directamente. No se documenta soporte de vLLM, TGI, llama.cpp, Ollama ni exportación a GGUF/ONNX; estas herramientas no son aplicables a una política de control de este tipo.
- Latencia y throughput: 2 segundos por semana en CPU como presupuesto de referencia; 0 semanas de fallback y 0 semanas fuera de presupuesto en las ejecuciones de 200 y 400 episodios. No se reportan métricas de throughput por lote ni latencias en GPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | RSS (4242 / 9001) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ShockBench-LLM-like agent (Small) | Encoder-decoder con MoE en cabezas, entrenado con simulador diferenciable | 21 M | 52 semanas de episodio, memoria de historial completo | 0,8655 / 0,8798 | MIT | Pública en HuggingFace |
| Mejor agente conocido (anónimo) | Caja negra, no descrito | No disponible | No disponible | 0,8636 / 0,8793 | No disponible | No pública |
| Primer MoE del autor (misma familia) | Mezcla de expertos | No disponible | No disponible | 0,8509 / 0,8660 | No disponible en la información consultada | No indicada |
| `fastlp_v4` | Agente de programación lineal | No disponible (no es una red neuronal) | No disponible | 0,7919 / 0,8130 | No disponible en la información consultada | No indicada |

No se dispone de comparación con modelos de la misma categoría fuera de la familia ShockBench, ni con LLMs convencionales, porque la tarea (control de flujos en una red de suministro simulada) no es comparable con benchmarks de lenguaje.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a prompts en lenguaje natural y no soporta tool calling, agentes conversacionales ni capacidades multimodales. Aplicarlo fuera de la tarea ShockBench-Flow no tiene sentido.
- Dominio y acción cerrados: la política está atada a 5 mercancías, 38 nodos y 108 ranuras de ruta concretas. Cambiar la topología o el catálogo de bienes requiere reentrenar.
- Horizonte fijo de 52 semanas y dinámica estacionaria por fases (expertos para semanas ≥ 14, ≥ 27 y ≥ 40); no hay evidencia de generalización a episodios más largos o a dinámicas distintas.
- Dependencia fuerte del simulador: la calidad depende de la fidelidad del port diferenciable y de las reglas implementadas (racionamiento, colas, lotes, escasez, almacenamiento y descarte). Un cambio en el simulador de referencia invalida el entrenamiento.
- La clonación de comportamiento por sí sola produce una política frágil (RSS ≈ 0,45–0,5) con acumulación de errores en 52 semanas; el rendimiento reportado depende del entrenamiento a través del simulador.
- Evaluación limitada a dos semillas de entropía (4242 con 200 episodios y 9001 con 400 episodios) y a los identificadores indicados; no hay validación con semillas adicionales ni tests fuera de distribución en la información consultada.
- El mejor agente de referencia es anónimo y de caja negra, por lo que la comparación no es reproducible de forma independiente y la diferencia reportada está dentro de un error estándar.
- Riesgo de sobreajuste a la distribución de escenarios de entrenamiento (aproximadamente 22 000 episodios Small etiquetados por el oráculo clarividente).
- La model card pública está truncada en la descripción de la tercera fase de entrenamiento y no detalla hiperparámetros finales, semillas de entrenamiento ni el papel exacto de la etiqueta `grpo`.
- Sin datos de sesgo, robustez adversarial ni comportamiento ante observaciones fuera del rango de entrenamiento. No se documentan limitaciones de idioma porque el modelo no procesa lenguaje.
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución y sin garantía. Verificar la procedencia de los datos y del simulador subyacente antes de un despliegue comercial.
- Los resultados de búsqueda web obtenidos no contenían información relacionada con el modelo, por lo que no se han podido contrastar datos externos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lordwordsword/shockbench-llm-like-agent
- No se han identificado papers, blogs, repositorios de código ni demos adicionales en la búsqueda web realizada; los resultados obtenidos no guardaban relación con el modelo y se han descartado.

# husnainbinmunawar/graphintel-openflights-experimental

## Resumen

GraphIntel OpenFlights experimental es un modelo de embeddings de nodos para predicción de enlaces (link prediction) sobre el grafo de rutas aéreas de OpenFlights. Lo desarrolla el usuario de Hugging Face husnainbinmunawar y se publica como artefacto de investigación con licencia ODbL. No es un modelo de lenguaje: es un predictor estático de enlaces que asigna representaciones vectoriales a 3.330 nodos de aeropuerto y estima la probabilidad de que exista una ruta entre dos aeropuertos.

El modelo se entrena sobre 29.819 rutas de entrenamiento y se evalúa contra un conjunto de retención (holdout) de 7.455 aristas. El resultado publicado es un AUROC de 0,7105 frente a una línea base de popularidad de destino de 0,7534, es decir, el modelo queda por debajo de una heurística trivial. El autor conserva y documenta explícitamente este resultado negativo y no promociona el embedding como un ranker superior.

Su relevancia es metodológica más que práctica: sirve como ejemplo de publicación transparente de resultados negativos en grafos de dominio público, y como punto de partida reproducible para experimentos de link prediction sobre datos OpenFlights. El tamaño real de los pesos es de 106.560 parámetros (según safetensors), lo que confirma que se trata de una tabla de embeddings de pequeña escala, no de una red profunda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Embeddings de nodos estáticos para link prediction (no disponible el detalle de la capa de scoring) |
| Parametros totales | 106.560 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de secuencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | ODbL (Open Database License) |
| Formato de pesos | safetensors (librería pytorch) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de un modelo de node embeddings entrenado con PyTorch para predicción de enlaces. El recuento de 106.560 parámetros es coherente con una tabla de embeddings de dimensión baja sobre 3.330 nodos (por ejemplo, 3.330 × 32 = 106.560), aunque el autor no confirma la dimensión ni la función de scoring empleada.

El entrenamiento usa 29.819 rutas del OpenFlights route database como conjunto de entrenamiento y reserva 7.455 aristas como holdout, conservadas en el orden del fichero fuente. No se documentan tokens de entrenamiento, composición del dataset más allá de las rutas, ni uso de RLHF, DPO u otras técnicas de alineamiento. La innovación destacable es la publicación explícita de un resultado negativo con la línea base comparativa incluida.

## Capacidades

- Predicción estática de enlaces entre pares de aeropuertos a partir de embeddings de nodos.
- Generación de representaciones vectoriales (embeddings) para 3.330 nodos de aeropuerto.
- Evaluación reproducible con partición de holdout documentada (7.455 aristas en orden de fichero).
- Ejecución en CPU: el autor etiqueta el modelo con `cpu`, adecuado para entornos sin GPU.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües: no procesa texto.
- No modela tiempo, horarios, seguridad de aeronaves, navegación ni disponibilidad actual de rutas.

## Casos de uso

- Reproducción de experimentos de link prediction: sirve como referencia para comparar métodos de embeddings de nodos frente a líneas base de popularidad en un grafo real y de dominio público.
- Docencia y formación en grafos: ejemplo compacto (106.560 parámetros, ejecutable en CPU) para ilustrar particiones de entrenamiento/holdout y métricas AUROC en un curso de aprendizaje sobre grafos.
- Análisis exploratorio de la red de rutas OpenFlights: los embeddings permiten estudiar proximidad estructural entre aeropuertos y detectar comunidades o hubs, siempre con cautela dado el AUROC por debajo de la línea base.
- Estudio de resultados negativos en publicación científica: caso documentado de un modelo que no supera a una heurística trivial, útil para discutir sesgos de publicación y prácticas de reporte.
- Punto de partida para mejoras: el código y los pesos permiten experimentar con dimensiones de embedding mayores, regularización o modelos de scoring más expresivos y medir la mejora frente al AUROC 0,7105 publicado.
- Integración en pipelines de investigación sobre datos ODbL: el formato safetensors y la licencia ODbL permiten reutilizar el artefacto en trabajos derivados que respeten atribución y share-alike.

## Benchmarks y rendimiento

| Metrica | GraphIntel OpenFlights | Baseline de popularidad de destino |
|---|---|---|
| Link AUROC (holdout de 7.455 aristas) | 0,7105 | 0,7534 |

No se han publicado otros resultados de benchmarks en la información disponible. El autor indica explícitamente que el modelo no supera la línea base de popularidad de destino y no lo promociona como ranker superior.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 106.560 parámetros en safetensors el modelo cabe holgadamente en memoria de cualquier equipo.
- GPU recomendadas: no necesarias; el autor etiqueta el modelo para CPU.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) e incluso en entornos sin GPU.
- Opciones de despliegue: PyTorch en CPU; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de embeddings de grafo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GraphIntel OpenFlights experimental | 106.560 | no aplica | AUROC 0,7105 | ODbL | Hugging Face |
| Baseline de popularidad de destino | 0 (heurística) | no aplica | AUROC 0,7534 | no aplica | incluida en la model card |
| Otros modelos de link prediction sobre OpenFlights | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre alternativas comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Rendimiento inferior a la línea base: AUROC 0,7105 frente a 0,7534 del baseline de popularidad de destino; no debe usarse como ranker de producción.
- Predicción estática únicamente: no modela tiempo, horarios, seguridad de aeronaves, navegación ni disponibilidad actual de rutas.
- Sesgos de los datos de origen: el grafo OpenFlights refleja la cobertura y los sesgos de reporte de la base de datos original, con posible sobrerrepresentación de ciertas regiones y aerolíneas.
- Riesgo de generalización limitada: el holdout se conserva en orden de fichero, lo que puede introducir dependencias no aleatorias en la evaluación.
- Licencia ODbL: impone atribución y share-alike sobre obras derivadas de la base de datos; es necesario revisar los términos de OpenFlights antes de cualquier uso comercial.
- Idiomas no aplicables: el modelo no procesa texto, por lo que no ofrece capacidades lingüísticas.
- Estado experimental: cero descargas y cero likes en el momento de la consulta; sin mantenimiento ni soporte documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/husnainbinmunawar/graphintel-openflights-experimental
- Página de datos de OpenFlights: https://openflights.org/data
- Licencia Open Database License: https://opendatacommons.org/licenses/odbl/1-0/

# Marcochris/ESM2-GraphResidual-v2

## Resumen

ESM2-GraphResidual-v2 es un repositorio publicado en HuggingFace por el usuario Marcochris que empaqueta una implementación de "Graph-Residual" sobre un backbone ESM-2, junto con el checkpoint verificado del adaptador ResidualV2. No es un modelo de lenguaje generativo al uso, sino un componente orientado a la adaptación de representaciones de proteínas y al análisis de contexto de grafos biológicos heterogéneos. El repositorio incluye el backbone ESM-2 8M, el checkpoint `graph_residual_v2.pt`, código fuente de modelo, grafo, entrenamiento y evaluación, y configuraciones portables.

El adaptador trabaja con características de grafo de 64 dimensiones, una capa oculta de 256 dimensiones y salidas de secuencia de 640 dimensiones, combinadas mediante fusión residual y LayerNorm. La publicación se realizó el 11 de septiembre de 2026 y, en el momento de redactar esta ficha, acumula 0 descargas y 0 likes, con un tamaño de repositorio declarado de 0.0 GB.

Su relevancia actual es limitada y de perfil claramente investigador: no declara licencia, no aporta resultados de benchmarks y no incluye datasets, bases de datos de grafos, logs ni estado del optimizador, lo que dificulta la reproducibilidad y la adopción en producción. El propio autor advierte que la versión no es un predictor universal de proteínas ni un modelo inductivo genérico para nodos no vistos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Backbone ESM-2 (transformer encoder para secuencias de proteínas) con adaptador Graph-Residual ResidualV2 (fusión residual + LayerNorm) |
| Parámetros totales | Aproximadamente 8M en el backbone ESM-2 8M; el recuento del adaptador ResidualV2 no está declarado |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo se documentan pesos en safetensors y un checkpoint `.pt`) |
| Idiomas soportados | no disponible (modelo sobre secuencias de proteínas; no orientado a lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | safetensors (backbone ESM-2) y PyTorch `.pt` (checkpoint `graph_residual_v2.pt`) |

## Arquitectura y entrenamiento

La arquitectura combina un backbone ESM-2 de 8M de parámetros, un transformer encoder preentrenado sobre secuencias de proteínas (familia desarrollada originalmente por Meta AI), con un adaptador denominado ResidualV2. Este adaptador proyecta características de grafo de 64 dimensiones a una capa oculta de 256 dimensiones y produce salidas de secuencia de 640 dimensiones, que se fusionan con las representaciones del backbone mediante conexiones residuales y normalización LayerNorm. El objetivo declarado es adaptar las representaciones proteicas para que incorporen contexto relacional procedente de grafos biológicos, no solo información de la secuencia aislada.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni el procedimiento de optimización: el repositorio excluye explícitamente datasets crudos, bases de datos de grafos, logs y estado del optimizador, por lo que la reproducibilidad del entrenamiento no es posible con el material publicado. Tampoco se documenta ninguna innovación de decodificación (decodificación especulativa, atención lineal ni mecanismos similares), algo coherente con que se trate de un modelo de representación y no de generación autoregresiva.

## Capacidades

- Adaptación de representaciones de proteínas: genera embeddings de secuencia ajustados con contexto de grafo.
- Recuperación consciente de relaciones (relation-aware retrieval): permite indexar y buscar proteínas atendiendo a relaciones codificadas en un grafo biológico.
- Análisis de contexto de grafos biológicos heterogéneos: integra características de grafo de 64 dimensiones junto a la información secuencial.
- Salidas de secuencia de 640 dimensiones aptas como entrada para cabezales posteriores (clasificación, regresión o agrupamiento), siempre que se disponga del pipeline adecuado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no aplica; el dominio son secuencias de proteínas, no texto en lenguaje natural.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Anotación funcional de proteínas: usar los embeddings adaptados como entrada de un clasificador posterior para predecir términos GO o números EC, aprovechando que el adaptador incorpora contexto relacional además de la secuencia.
- Búsqueda de similitud en bases de datos proteicas: indexar representaciones de 640 dimensiones y realizar búsquedas por vecino más cercano para localizar proteínas relacionadas funcionalmente.
- Recuperación consciente de relaciones en redes de interacción proteína-proteína (PPI): consultar el grafo para recuperar candidatos que cumplen simultáneamente restricciones de secuencia y de relación topológica.
- Análisis de rutas y módulos biológicos: representar subgrafos de rutas metabólicas o complejos proteicos para estudiar agrupamientos y dependencias relacionales.
- Investigación en arquitecturas graph-residual: reutilizar `src/` y `configs/` como base para experimentar con variantes de fusión residual y LayerNorm sobre backbones proteicos.
- Preprocesado en pipelines bioinformáticos: generar características para modelos downstream de estructura, interacción o priorización de dianas, siempre que el pipeline suministre entradas de grafo compatibles.
- Extracción de características para agrupamiento no supervisado: agrupar proteínas por perfil relacional en lugar de solo por similitud de secuencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el backbone de 8M de parámetros ocupa del orden de decenas de megabytes en fp32; el adaptador ResidualV2, con capas de 64/256/640 dimensiones, añade un consumo marginal. En conjunto, muy por debajo de 1 GB en fp32 y aún menor en int8, aunque no se documentan cifras oficiales.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU moderna (incluidas GTX/RTX de gama media) sería suficiente; incluso la inferencia en CPU es viable.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU de consumo actual, dado el tamaño del backbone.
- Opciones de despliegue: inferencia en PyTorch con el código de `src/` y los ficheros de `configs/`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM generativos, no a este tipo de modelo).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ESM2-GraphResidual-v2 | ~8M (backbone) + adaptador no cuantificado | no disponible | ESM-2 + adaptador de grafo residual | no disponible | HuggingFace, 0 descargas |
| ESM-2 8M (upstream) | 8M | no disponible | Transformer encoder de secuencias de proteínas | no disponible en la información proporcionada | Ampliamente distribuido en HuggingFace |
| ESM-2 650M (upstream) | 650M | no disponible | Transformer encoder de secuencias de proteínas | no disponible en la información proporcionada | Ampliamente distribuido en HuggingFace |
| Otros adaptadores sobre ESM-2 con información de grafo | no disponible | no disponible | Fusión secuencia + grafo | no disponible | no disponible |

## Limitaciones y advertencias

- Requiere entradas de representación de grafo compatibles con el formato del adaptador (64 dimensiones); no funciona con secuencias aisladas sin ese contexto.
- El autor indica explícitamente que no es un predictor universal de proteínas ni un modelo inductivo genérico para nodos no vistos, lo que limita su uso sobre grafos con nodos nuevos.
- No se declara licencia, por lo que no puede asumirse permiso para uso comercial ni para redistribución.
- No se publican datasets, bases de datos de grafos, logs ni estado del optimizador, lo que impide reproducir el entrenamiento.
- No hay resultados de benchmarks, por lo que el rendimiento real frente a alternativas es desconocido.
- El repositorio muestra 0 descargas y 0 likes, y un tamaño declarado de 0.0 GB, lo que dificulta validar su contenido y su estado de conservación.
- No se documenta la longitud de contexto soportada, lo que obliga a validar empíricamente el comportamiento con secuencias largas.
- Como todo modelo de representación biológica, sus predicciones pueden ser erróneas o estar sesgadas hacia la distribución de datos con la que se entrenó el backbone ESM-2; se recomienda validación experimental antes de cualquier uso en decisiones biomédicas.
- La búsqueda web realizada no ha devuelto documentación técnica, preprint ni repositorio asociado que aclare estas limitaciones.

## Enlaces

- HuggingFace: https://huggingface.co/Marcochris/ESM2-GraphResidual-v2
- Paper o preprint asociado (Graph-Residual / ESM2 V2): no disponible
- Repositorio de código independiente: no disponible
- Demos: no disponible
- Enlaces relevantes de la búsqueda web: no disponible (los resultados obtenidos no guardan relación con el modelo)

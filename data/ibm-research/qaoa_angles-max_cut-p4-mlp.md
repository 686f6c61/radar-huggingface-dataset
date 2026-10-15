# ibm-research/qaoa_angles.max_cut.p4.mlp

## Resumen

`ibm-research/qaoa_angles.max_cut.p4.mlp` es un repositorio de IBM Research que aloja un artefacto en formato ONNX. Por la nomenclatura del identificador se deduce que se trata de un perceptrón multicapa (MLP) entrenado para predecir los ángulos variacionales del algoritmo QAOA (Quantum Approximate Optimization Algorithm) aplicado a instancias del problema Max-Cut con profundidad de circuito p=4. No es un modelo de lenguaje: es un regresor numérico que actúa como sustituto o inicializador de parámetros dentro de un bucle de optimización cuántica-clásica.

El interés de este tipo de artefactos radica en el cuello de botella clásico de QAOA: encontrar buenos ángulos requiere muchas evaluaciones del circuito cuántico. Un modelo neuronal que los prediga directamente a partir de características del grafo elimina buena parte de ese coste, lo que se conoce en la literatura como transferencia de parámetros o warm-start. Está publicado bajo licencia Apache 2.0, lo que permite uso comercial.

La información pública es mínima: la model card está vacía (solo contiene la declaración de licencia), el repositorio ocupa 0.0 GB, no tiene descargas ni interacciones registradas, y las fechas de creación y actualización (2026-10-14) están separadas por 16 segundos, lo que sugiere una subida automatizada. Cualquier detalle sobre arquitectura interna, datos de entrenamiento o métricas debe considerarse no disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP (perceptrón multicapa), según el identificador del repositorio; no confirmado en la model card |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo no generativo de texto) |
| Tipos de cuantización | no disponible; el artefacto se distribuye en formato ONNX |
| Idiomas soportados | no aplica (modelo numérico) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Tarea declarada | no disponible en la model card; por nomenclatura, predicción de ángulos QAOA para Max-Cut |
| Profundidad del circuito (p) | 4 (según el identificador) |
| Tamaño del repositorio | 0.0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-14 |
| Última actualización | 2026-10-14 |

## Arquitectura y entrenamiento

La única evidencia sobre la arquitectura es el sufijo `.mlp` del identificador y la etiqueta `onnx` del repositorio, que indican un perceptrón multicapa exportado a ONNX. No hay información publicada sobre el número de capas, las dimensiones ocultas, la función de activación, la función de pérdida ni el esquema de normalización empleado. Tampoco se documenta si la entrada son estadísticos del grafo (número de nodos, densidad de aristas, grados, espectro del laplaciano) o una representación de mayor dimensión, ni si la salida son los 2p ángulos (beta y gamma) o un subconjunto de ellos.

En cuanto al entrenamiento, no se especifica el volumen de instancias de Max-Cut utilizadas, el procedimiento de generación de etiquetas (por ejemplo, optimización clásica de los ángulos hasta convergencia), la distribución de tamaños de grafo cubierta ni si se aplicó algún tipo de aumento de datos o validación cruzada. Tampoco consta que se hayan empleado técnicas de RLHF o DPO, ajenas por otra parte a un modelo de regresión numérica. Cualquier afirmación sobre el régimen de entrenamiento sería especulativa.

El marco conceptual en el que encaja el artefacto sí es conocido: QAOA es un algoritmo variacional que alterna operadores de coste y de mezcla con parámetros angulares, y cuya profundidad p determina el número de parámetros libres (2p). Con p=4, el modelo predeciría 8 valores angulares. La innovación esperable es el ahorro computacional en el bucle de optimización, no una mejora arquitectónica en sí misma.

## Capacidades

- Regresión numérica de ángulos variacionales para QAOA en instancias de Max-Cut con p=4, según la nomenclatura del repositorio.
- Ejecución mediante runtime ONNX, lo que permite desplegarlo en CPU sin dependencias de frameworks de aprendizaje profundo.
- Inferencia determinista y de coste previsible, al no tratarse de un modelo autorregresivo.
- No dispone de generación de texto, razonamiento en lenguaje natural, código ni matemáticas simbólicas.
- No soporta tool calling ni function calling.
- No está diseñado para agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (la entrada es numérica, no textual).
- No incorpora modo de pensamiento, visión, audio ni multimodalidad.
- Se desconoce si admite batching, entradas de tamaño variable o grafos con pesos no unitarios.

## Casos de uso

- Warm-start de QAOA en Max-Cut: inicializar los 8 ángulos con la predicción del MLP en lugar de valores aleatorios, reduciendo el número de iteraciones del optimizador clásico hasta convergencia.
- Aceleración de simulaciones híbridas: en pipelines con Qiskit o similares, sustituir parte de las evaluaciones del circuito por inferencias ONNX durante las fases exploratorias del espacio de parámetros.
- Transferencia de parámetros entre instancias: usar los ángulos predichos para una familia de grafos como punto de partida en instancias nuevas de Max-Cut con estructura similar.
- Selección previa de hiperparámetros de circuito: comparar la calidad esperada de distintas configuraciones a partir de los ángulos sugeridos antes de ejecutar en hardware cuántico real, que es un recurso escaso y con colas de espera.
- Benchmarking de hardware cuántico: fijar un conjunto reproducible de ángulos para medir fidelidad, tiempos de coherencia y tasas de error entre dispositivos, eliminando la variabilidad introducida por la optimización clásica.
- Investigación en meta-learning cuántico: emplear el MLP como línea base frente a otros métodos de predicción de parámetros (GNN, transformers, heurísticas) en estudios comparativos de transferibilidad.
- Docencia y prototipado: demostrar en un cuaderno el flujo completo grafo → predicción de ángulos → ejecución de QAOA, con un coste computacional bajo al ser un MLP exportado a ONNX.
- Integración en pipelines de CI: validar de forma automática que las versiones de un solver cuántico mantienen un rendimiento mínimo sobre un conjunto fijo de instancias de Max-Cut.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de error de regresión, comparaciones con ángulos óptimos obtenidos por optimización clásica, ni experimentos de transferencia. Tampoco hay datos sobre la calidad de la solución alcanzada (ratio de aproximación) cuando se emplean los ángulos predichos en lugar de los optimizados.

## Requisitos de hardware

- No se publican cifras de VRAM ni de memoria RAM necesaria; el tamaño del repositorio figura como 0.0 GB, lo que impide estimar el número de parámetros.
- Por tratarse de un MLP en formato ONNX, la inferencia es viable en CPU sin GPU dedicada; esta afirmación se deriva del formato y del tipo de arquitectura, no de documentación del autor.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: cualquier runtime compatible con ONNX (ONNX Runtime, ONNX Runtime Web, TensorRT, OpenVINO). No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos generativos de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. En la información recopilada no aparecen modelos comparables con especificaciones publicadas. La comparación relevante sería con otros predictores de parámetros QAOA (redes de grafos, transformers o heurísticas clásicas), pero no se dispone de datos de ninguno de ellos en esta búsqueda, ni de métricas del modelo analizado que permitan establecer una comparación fundamentada.

## Limitaciones y advertencias

- Model card vacía: no hay documentación sobre entradas esperadas, forma de los tensores, rangos de valores ni procedimiento de entrenamiento, lo que dificulta su uso directo en producción.
- Especificidad del problema: por nomenclatura, el modelo está acotado a Max-Cut y a p=4. No hay evidencia de que generalice a otros problemas combinatorios (Ising, TSP, partición) ni a otras profundidades.
- Riesgo de extrapolación fuera de distribución: al ser un regresor entrenado sobre una familia concreta de grafos, puede producir ángulos de baja calidad en instancias con tamaño, densidad o topología diferentes a las del conjunto de entrenamiento.
- Riesgo de alucinación: no aplica en el sentido habitual, ya que el modelo no genera lenguaje; el modo de fallo equivalente es devolver ángulos plausibles pero subóptimos sin señal de incertidumbre.
- Idiomas: no aplica, la entrada es numérica.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, con obligación de conservar el aviso de licencia y el archivo NOTICE si existe. No se declaran restricciones adicionales ni cláusulas de uso aceptable.
- Ausencia de validación comunitaria: cero descargas y cero interacciones, sin issues ni discusiones que permitan contrastar su comportamiento real.
- Trazabilidad limitada: el repositorio se creó y actualizó en un intervalo de 16 segundos, patrón propio de un volcado automatizado de artefactos, sin garantía de mantenimiento posterior.
- Sin información sobre versionado del artefacto ONNX, opset utilizado ni compatibilidad con runtimes antiguos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ibm-research/qaoa_angles.max_cut.p4.mlp
- Página corporativa de IBM: https://www.ibm.com/
- IBM (versión en francés): https://www.ibm.com/fr-fr
- Wikipedia (en francés) sobre IBM: https://fr.wikipedia.org/wiki/IBM
- Wikipedia (en inglés) sobre IBM: https://en.wikipedia.org/wiki/IBM
- Sección de actualidad de IBM en Le Monde Informatique: https://www.lemondeinformatique.fr/toute-l-actualite-marque-sur-ibm-16.html

Nota: los resultados de búsqueda disponibles corresponden a páginas generales sobre IBM y no aportan documentación técnica, papers ni repositorios de código relacionados con este artefacto. No se han encontrado enlaces a la publicación original, al conjunto de datos de entrenamiento ni a una demo.

# oteam/oinvfold-rna

## Resumen

OInvFold RNA es el checkpoint especializado en diseno de secuencias de ARN del conjunto de modelos OInvFold, publicados junto al articulo "ODesign: A World Model for Biomolecular Interaction Design" (Zhang et al., 2025). El modelo resuelve el problema de *inverse folding* sobre polimeros: dada una estructura tridimensional fija (esqueleto de coordenadas atomicas), predice la identidad de los residuos, en este caso la secuencia de nucleotidos de una cadena de ARN. Es relevante porque permite el diseno computacional de ARN con funcion definida (aptameros, ribozimas, ARN terapeutico) partiendo de la geometria deseada.

La implementacion publicada en `oteam/oinvfold-rna` es no oficial: la ha realizado el equipo de OFoldX a partir de los pesos liberados por los autores originales de ODesign. Se trata de un modelo de grafos geometricos con 12 bloques de encoder, tamano oculto 128 y 4 cabezas de atencion, con 8,39 millones de parametros en total. No es un modelo de lenguaje: no procesa texto ni genera lenguaje natural, sino que realiza prediccion de clases discretas (25 clases de salida para polimeros) sobre un grafo molecular.

El checkpoint se distribuye en formato safetensors bajo licencia AGPL-3.0 y requiere la libreria `ofoldx` para su ejecucion. La model card advierte explicitamente de una discrepancia entre la preparacion de polimeros de OFoldX y la de los pesos originales (nodos globales virtuales con rotaciones y traslaciones reales frente a caracteristicas identidad/cero constantes), lo que puede alterar las predicciones y exige una evaluacion de calidad de inferencia independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de grafos geometricos con paso de mensajes y 12 bloques de encoder |
| Parametros totales | 8.390.209 (8,39 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de contexto textual; opera sobre grafos de coordenadas) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | No disponible (no procesa lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |
| Tamano oculto | 128 |
| Cabezas de atencion | 4 |
| Atomos virtuales | 32 |
| Clases de salida (polimero) | 25 |
| Libreria requerida | ofoldx |

## Arquitectura y entrenamiento

OInvFold emplea un modelo de grafo geometrico con paso de mensajes (geometric message passing) compuesto por 12 bloques de encoder con tamano oculto 128 y 4 cabezas de atencion. El modelo recibe coordenadas atomicas fijas y predice la identidad de cada nodo del polimero entre 25 clases de salida, que cubren los tipos de residuo relevantes para proteinas, ADN y ARN. La decodificacion puede ser voraz (greedy) o por busqueda en haz (beam search), devolviendo candidatos ordenados por log-probabilidad total y media. El checkpoint de polimero es compartido conceptualmente entre las variantes de proteina, ADN y ARN, que se publican como repositorios separados.

Durante el entrenamiento, segun la model card, se aplica corrupcion del grafo en cada bloque del encoder. Los datos de entrenamiento, su curacion y el proceso completo de orquestacion no se detallan en esta ficha: la model card remite al articulo de ODesign para la composicion del dataset. La libreria OFoldX expone operaciones diferenciables `encode` y `forward`, y una funcion de perdida `OInvFoldLoss` con verosimilitud negativa enmascarada para polimeros; la construccion del dataset y el entrenamiento completo quedan a cargo de la aplicacion que lo utilice.

Existe una advertencia tecnica relevante: OFoldX utiliza nodos globales virtuales basados en centroides con rotaciones y traslaciones relativas reales, mientras que la preparacion de polimeros liberada por los autores originales emplea caracteristicas globales identidad/cero constantes. Esta diferencia altera las predicciones del checkpoint y obliga a una evaluacion separada de la calidad de inferencia.

## Capacidades

- Diseno de secuencias de ARN a partir de un esqueleto tridimensional fijo (inverse folding).
- Prediccion de identidad de residuos entre 25 clases de salida mediante cabezas de clasificacion sobre nodos del grafo.
- Decodificacion voraz y decodificacion por haz con `num_beams` configurable, devolviendo candidatos ordenados por log-probabilidad.
- Lectura de estructuras en formato mmCIF a traves de `ofoldx.io.read_structure`.
- Ejecucion por etapas (`prepare`, `forward`, `postprocess`) para integracion en pipelines propios.
- Exposicion de operaciones diferenciables para entrenamiento o ajuste fino con `OInvFoldLoss`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso en lenguaje natural, vision, audio ni capacidades multilingues: es un modelo especializado en biologia estructural.

## Casos de uso

- Diseno de aptameros de ARN: dada una estructura diana de ARN con bolsillo de union definido, el modelo genera secuencias candidatas compatibles con esa geometria, que despues se filtran por simulacion de dinamica molecular y se validan experimentalmente.
- Ingenieria de ribozimas: partiendo del esqueleto catalitico de una ribozima conocida, se generan variantes de secuencia que preservan el plegamiento y permiten explorar cambios de especificidad de sustrato.
- Rediseno de ARN terapeutico: para una estructura de ARNm o ARN no codificante con regiones funcionales identificadas, se proponen secuencias alternativas que mantienen la arquitectura tridimensional reduciendo inmunogenicidad o mejorando estabilidad.
- Generacion de candidatos en pipelines de diseno generativo: el modelo actua como etapa de inverse folding dentro de un flujo mas amplio (generacion de backbone, diseno de secuencia, scoring y filtrado), aprovechando la decodificacion por haz para obtener multiples candidatos ordenados.
- Aumento de datos estructurales: generar secuencias plausibles para estructuras de ARN depositadas en el PDB permite construir conjuntos de entrenamiento para modelos de prediccion de estructura o de funcion.
- Exploracion de la relacion secuencia-estructura: analizar la distribucion de log-probabilidades de las secuencias propuestas para identificar posiciones con alta o baja restriccion geometrica, informando sobre el paisaje de plegamiento.
- Integracion en flujos de diseno de acidos nucleicos con ligando: combinado con `oteam/oinvfold-ligand` y `oteam/oinvfold-dna`, permite abordar disenos de complejos multimoleculares donde el ARN es solo uno de los componentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de recovery, perplexity ni comparaciones cuantitativas, y advierte que la discrepancia en la preparacion de polimeros puede afectar a la calidad de inferencia, por lo que cualquier evaluacion deberia realizarse de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 8,39 M de parametros; el cuello de botella real es la memoria del grafo de entrada (numero de atomos y aristas), no el modelo.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; se puede ejecutar en CPU sin problemas para estructuras de tamano moderado.
- Cabe en GPU de consumo: si, en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en iGPU con memoria compartida.
- Opciones de despliegue: la libreria `ofoldx` (instalable con `pip install ofoldx`) es la via documentada; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dependen del tamano del grafo y del numero de haces en la decodificacion.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oinvfold-rna | 8,39 M | Grafo geometrico, inverse folding de ARN | No aplica (grafo) | AGPL-3.0 | HuggingFace (oteam) |
| oinvfold-protein | 8,37 M | Grafo geometrico, inverse folding de proteina | No aplica (grafo) | AGPL-3.0 | HuggingFace (oteam) |
| oinvfold-dna | No disponible | Grafo geometrico, inverse folding de ADN | No aplica (grafo) | AGPL-3.0 | HuggingFace (oteam) |
| oinvfold-ligand | 6,43 M | Grafo geometrico, asignacion de elementos de ligando | No aplica (grafo) | AGPL-3.0 | HuggingFace (oteam) |

No se dispone de datos de benchmarks ni de comparaciones con otros modelos de inverse folding de ARN (por ejemplo, variantes especializadas de ProteinMPNN adaptadas a acidos nucleicos) en la informacion proporcionada.

## Limitaciones y advertencias

- Implementacion no oficial: la model card ha sido redactada por el equipo de OFoldX, no por los autores de ODesign; los pesos pueden no reproducir exactamente el comportamiento del modelo original.
- Discrepancia en la preparacion de polimeros: OFoldX usa nodos globales virtuales con rotaciones y traslaciones reales, mientras que los pesos se liberaron con caracteristicas globales identidad/cero; esto cambia las predicciones y exige evaluacion independiente de la calidad.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento (recovery, precision por posicion) en la informacion disponible.
- Licencia AGPL-3.0: impone obligaciones de copyleft fuerte; el uso en servicios en red puede requerir la publicacion del codigo fuente modificado. Revisar compatibilidad antes de uso comercial.
- Modelo de un solo proposito: no genera lenguaje, no razona en texto y no admite instrucciones; solo predice identidades de residuos sobre un grafo de coordenadas.
- Dependencia de la calidad de la estructura de entrada: coordenadas ruidosas o modelos predictivos imprecisos degradan la secuencia propuesta.
- Sin datos de sesgo ni de alucinacion en el sentido de modelos de lenguaje; el riesgo equivalente es proponer secuencias no plegables o no funcionales, que deben validarse experimentalmente.
- Sin soporte documentado de cuantizacion ni de formatos alternativos a safetensors; la integracion esta ligada a la libreria `ofoldx`.
- Idiomas no aplicables: el modelo no procesa texto, por lo que no hay soporte multilingue que evaluar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oteam/oinvfold-rna
- Variante de proteina: https://huggingface.co/oteam/oinvfold-protein
- Variante de ADN: https://huggingface.co/oteam/oinvfold-dna
- Variante de ligando: https://huggingface.co/oteam/oinvfold-ligand
- Articulo ODesign: https://arxiv.org/abs/2510.22304
- Codigo del modelo en OFoldX: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/oinvfold
- Guia de pipelines de OFoldX: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- Repositorio oficial de ODesign: https://github.com/The-Institute-for-AI-Molecular-Design/ODesign
- Documentacion de la libreria ofoldx: https://ofoldx.valtech.ai/

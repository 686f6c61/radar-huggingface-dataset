# Qwe1325/MaleCNS

## Resumen

MaleCNS v1.0 es un paquete de datos publicado en Hugging Face que contiene el conectoma completo del sistema nervioso central de una mosca de la fruta (*Drosophila melanogaster*) macho adulto: cerebro, lóbulos ópticos y cordón nervioso ventral. No es un modelo de lenguaje ni una red neuronal entrenada: es la tabla de conectividad segmento a segmento del release original, empaquetada como tensores `safetensors` para que se cargue directamente con `AutoModel.from_pretrained(..., trust_remote_code=True)` en PyTorch. El repositorio lo firma el usuario Qwe1325 (la model card se titula internamente QuixiAI/MaleCNS, una discrepancia de nombre que conviene tener en cuenta).

El problema que resuelve es el de la reproducibilidad: el proyecto `ngxson/fly-llm-hf` ya había empaquetado el conectoma, pero lo hizo aplicando decisiones de modelado (signo por neurotransmisor, reescalado global a radio espectral 0,99, ganancias por neurona aprendidas, redondeo a bf16) que quedan incrustadas en los pesos. Este repositorio es la capa inferior: el conectoma fuente sin modificar, para que cualquier trabajo de graph ML, simulación o reservoir computing parta de los mismos tensores sin pérdida. La verificación declarada por el autor consiste en recargar los tensores y comprobarlos arista por arista contra la tabla del release.

A nivel de escala, el paquete abarca 88.384.522 cuerpos neuronales y 151.856.684 conexiones dirigidas (incluidas 123 autapsis), que representan 311.833.243 contactos sinápticos. El repo ocupa 2,8 GB y los `safetensors` suman 726.230.172 elementos de tensor (no parámetros entrenables). Licencia CC-BY-4.0, sin descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: grafo dirigido con pesos de conectividad anatomica (no es un transformer, MoE ni SSM) |
| Parametros totales | 726.230.172 elementos de tensor; 0 parametros entrenables |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No aplica; los tensores se distribuyen en int64, int32, int8 y float64 |
| Idiomas soportados | No aplica (no procesa texto) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (un unico `model.safetensors`); requiere `trust_remote_code=True` |
| Pipeline en Hugging Face | feature-extraction |
| Biblioteca declarada | transformers (con codigo personalizado) |
| Tamano del repositorio | 2,8 GB |
| Creado / actualizado | 2026-09-16 (ambas fechas identicas) |
| Descargas / likes | 0 / 0 |

Tensores incluidos en `model.safetensors`:

| Tensor | Forma | dtype | Tamano |
|---|---|---|---|
| `neuron_id` | (88384522,) | int64 | 707,1 MB |
| `edge_src` | (151856684,) | int32 | 607,4 MB |
| `edge_dst` | (151856684,) | int32 | 607,4 MB |
| `synapse_count` | (151856684,) | int32 | 607,4 MB |
| `neuron_status` | (88384522,) | int8 | 88,4 MB |
| `neuron_superclass` | (88384522,) | int8 | 88,4 MB |
| `nt_neuron_index` | (1835518,) | int32 | 7,3 MB |
| `nt_class` | (1835518,) | int8 | 1,8 MB |
| `nt_confidence` | (1835518,) | float64 | 14,7 MB |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni proceso de entrenamiento. El contenido canonico es la tabla de conectividad completa del release, replicada literalmente: por cada fila `body_pre, body_post, weight` del fichero original existe una arista `edge_src, edge_dst, synapse_count`, en el mismo orden de filas y con la columna `weight` intacta. Los valores son **pesos de conexion anatomicos**: el numero de contactos sinapticos detectados entre un cuerpo y otro (rango de 1 a 2.591 por conexion), no eficacias sinapticas fisiologicas. Cualquier convencion de signo, normalizacion, reescalado o reinicializacion aleatoria es una decision de modelado que corresponde a la capa de aguas abajo.

La clase de `transformers` implementa un `forward` que realiza un unico paso de propagacion lineal, incluido solo por comodidad de uso, no como dinamica de red. El paquete no impone modelo de neurona, ni convencion de signo por neurotransmisor, ni normalizacion, ni redondeo, ni inicializacion. Los datos de prediccion de neurotransmisores se conservan en tensores separados (`nt_neuron_index`, `nt_class`, `nt_confidence`) para que el usuario decida si los aplica. El release tambien distribuye un fichero de conectividad restringido a neuronas trazadas; no se empaqueta aparte porque equivale a esta misma tabla filtrada por `status == Traced`, y el script de construccion comprueba esa igualdad arista por arista.

Estadisticas del grafo declaradas: grado medio de entrada/salida 1,7 (maximo de entrada 13.518, maximo de salida 56.517). Distribucion de conexiones por numero minimo de sinapsis: >=1: 151.856.684; >=2: 57.670.765; >=3: 23.014.406; >=5: 7.622.864; >=10: 2.799.910. Neuronas con `status == Traced`: 164.789 cuerpos, 25.563.197 conexiones entre ellos y 124.025.046 contactos.

## Capacidades

- Carga directa en PyTorch como tensores mediante `AutoModel.from_pretrained(..., trust_remote_code=True)`, sin necesidad de parsear CSV ni ficheros propietarios.
- Acceso al listado de aristas completo (origen, destino, conteo de sinapsis) en el orden de filas original, apto para construir matrices dispersas reproducibles.
- Mapeo de indice de neurona a identificador de cuerpo MaleCNS mediante `neuron_id`.
- Filtrado por subconjuntos mediante mascaras, en lugar de subconjuntos preescogidos: cerebro central, lobulos opticos y cordon nervioso ventral estan todos presentes.
- Metadatos por neurona a traves de `neuron_status` y `neuron_superclass`, que permiten seleccionar, por ejemplo, solo neuronas trazadas.
- Predicciones de neurotransmisor en tensores independientes, con clase y nivel de confianza, para que el usuario derive su propia convencion de signo.
- Extraccion del subgrafo de neuronas trazadas sin perdida, ya que la restriccion `status == Traced` es exactamente la tabla completa filtrada.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, soporte de agentes ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Investigacion en neurociencia de redes: cargar la tabla como matriz dispersa y calcular metricas de teoria de grafos (coeficiente de agrupamiento, modularidad, caminos minimos, motivos) sobre el conectoma completo con un pipeline reproducible.
- Reservoir computing y echo-state networks: usar el conectoma como matriz de recurrencia congelada, aplicando el propio criterio de signo, escalado y normalizacion, sin tener que deshacer las decisiones de empaquetados previos.
- Simulacion de dinamica neuronal: partir de los conteos sinapticos crudos y superponer un modelo de neurona (LIF, Hodgkin-Huxley simplificado) y una convencion de signo derivada de `nt_class` y `nt_confidence`.
- Graph machine learning: entrenar GNN sobre el grafo dirigido de 88,4 millones de nodos y 151,9 millones de aristas, con las mascaras de `neuron_superclass` como etiquetas auxiliares o criterio de particionado.
- Comparacion y validacion cruzada de empaquetados: contrastar este paquete contra `ngxson/fly-llm-hf` para medir cuanto cambia el comportamiento de un modelo al aplicar signo, reescalado espectral y ganancias aprendidas sobre la misma base anatomica.
- Filtrado y submuestreo para prototipos: seleccionar solo conexiones con `synapse_count >= 5` o `>= 10` (7,6 y 2,8 millones de aristas respectivamente) para iterar rapido en un portatil antes de escalar al grafo completo.
- Analisis del subgrafo de neuronas trazadas: trabajar con los 164.789 cuerpos verificados y sus 25,6 millones de conexiones como subconjunto de mayor fiabilidad para estudios que no toleran cuerpos sin trazar.
- Reproducibilidad de articulos: servir de referencia congelada y verificada para que terceros reproduzcan experimentos que antes dependian del release original de Janelia o de empaquetados con transformaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de tarea (MMLU, HumanEval, GSM8K u otras), algo coherente con la naturaleza del artefacto: no es un modelo evaluable mediante benchmarks de lenguaje, sino un paquete de datos de conectividad. No se dispone tampoco de mediciones de throughput o latencia.

## Requisitos de hardware

- VRAM: no se requiere GPU para cargar el paquete. Si se copian todos los tensores a memoria de GPU, el total ronda los 2,7 GB, pero la mayor parte del trabajo es de indexacion y construccion de grafos, que se realiza en CPU.
- Memoria principal: los tensores suman aproximadamente 2,7 GB en memoria. Se recomienda un minimo de 8 GB de RAM y 16 GB o mas si se construyen estructuras derivadas (matriz dispersa en formato CSR, indices invertidos, reordenamientos), que pueden multiplicar el consumo varias veces.
- GPU recomendadas: ninguna en particular. Para la parte de graph ML, cualquier GPU con 8 GB o mas (RTX 3060, RTX 4070, RTX 4090) es suficiente para el grafo completo si se usa una representacion dispersa; A100 o H100 solo aportan ventaja en operaciones densas o en entrenamiento de GNN a gran escala.
- Cabe en hardware de consumo: si. Un portatil con 16 GB de RAM y CPU moderna puede cargar y filtrar el grafo completo; con 8 GB conviene trabajar con las mascaras de umbral de sinapsis.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y PyTorch como via canonica; alternativas para el analisis posterior con SciPy (`scipy.sparse`), PyTorch Geometric, DGL, NetworkX (solo para subgrafos filtrados, por el coste en memoria), cuGraph o GraphBLAS para escalar. No aplican vLLM, llama.cpp, Ollama ni TGI: no hay inferencia de lenguaje que servir.
- Latencia y throughput: no disponibles. El cuello de botella previsible es la carga del fichero de 2,8 GB desde disco y la construccion de la representacion dispersa, no el computo.

## Comparativa con modelos similares

No existen modelos comparables en el sentido habitual (mismo tamano o misma tarea), porque este artefacto no es un modelo entrenado. La comparacion relevante es con los otros empaquetados del mismo conectoma.

| Aspecto | Qwe1325/MaleCNS (este repo) | ngxson/fly-llm-hf | Xenova/fruit-fly-simulation |
|---|---|---|---|
| Proposito | Empaquetar el conectoma MaleCNS sin perdida para PyTorch y graph ML | Modelo de lenguaje de juguete basado en reservoir | Espacio de simulacion del que fly-llm-hf toma los datos |
| Alcance | Tabla completa: 88.384.522 cuerpos, 151.856.684 conexiones; subconjuntos como mascaras | Solo cerebro central (cb_sensory, visual_projection, cb_intrinsic, ascending, descending): 49.393 neuronas, 9.050.172 aristas | Empaquetado intermedio del conectoma |
| Valores de las aristas | Conteos de sinapsis exactos (int32), orden de filas original, sin tocar | Conteos con signo (ACh +1, GABA/glutamato -1, otros 0), reescalados a radio espectral 0,99, mas ganancia aprendida por neurona | No disponible |
| Datos de neurotransmisor | Replicados en tensores separados, sin aplicar al grafo | Usados para asignar el signo de cada arista saliente | No disponible |
| Dinamica | Ninguna; `forward` es un unico paso de propagacion lineal por comodidad | Reservoir con leaky-tanh, `a = 0,9`, linea de retardo de 8 tokens hacia 14.069 neuronas sensoriales | No disponible |
| Parametros entrenables | Ninguno | 52,8 M (proyeccion de entrada, ganancias, LayerNorm y readout); conectoma congelado | No disponible |
| Tokenizer y tarea | Ninguno | BPE a nivel de byte (1024) sobre TinyStories | No disponible |
| Rol en `transformers` | `AutoModel` que devuelve el grafo | `AutoModelForCausalLM` que genera texto | No disponible |
| Licencia | CC-BY-4.0 | No disponible en la informacion proporcionada | No disponible |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, codigo ni respuestas. Cualquier expectativa de inferencia de lenguaje es incorrecta.
- Los pesos son conteos de contactos sinapticos detectados, no eficacias fisiologicas. Usarlos como pesos de una red neuronal exige aplicar una convencion de signo y una escala, decision que el paquete delega deliberadamente en el usuario.
- Cobertura limitada a un unico especimen: macho adulto de *Drosophila melanogaster*. No incluye hembras, larvas ni otros estadios, por lo que las conclusiones no se pueden generalizar sin datos adicionales.
- Solo 164.789 de los 88.384.522 cuerpos tienen `status == Traced`. El resto de la tabla procede de reconstruccion automatica y puede contener errores de segmentacion o asignacion de sinapsis; los conteos de sinapsis bajos (1-2 contactos) son los mas expuestos a este ruido.
- El paquete conserva 123 autapsis. Si el modelo de aguas abajo no las contempla, hay que filtrarlas explicitamente.
- Mezcla de dtypes en un mismo fichero (int64, int32, int8, float64). Algunos backends de grafos o aceleradores no admiten int64 en indices, lo que obliga a convertir y duplicar memoria.
- La verificacion de perdida sin perdida la declara el propio autor mediante su script de construccion; no se ha reproducido de forma independiente en la informacion disponible.
- La model card proporcionada esta truncada a partir de la descripcion de `neuron_status` y `neuron_superclass`, por lo que no se puede confirmar el contenido completo de la documentacion.
- El repositorio no tiene descargas ni likes, y no se ha publicado ningun paper asociado: no existe validacion por parte de la comunidad.
- La licencia CC-BY-4.0 permite uso comercial, pero exige atribucion adecuada y no concede garantias. Conviene revisar tambien los terminos del release original de Janelia del que proceden los datos.
- No hay resultados de benchmarks ni mediciones de rendimiento; no se puede citar ninguna cifra de calidad de tarea.
- Las fechas de creacion y actualizacion (2026-09-16) y el nombre del autor en la model card (QuixiAI) no coinciden con el ID del repositorio (Qwe1325); conviene verificar la procedencia antes de integrarlo en un pipeline de produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Qwe1325/MaleCNS
- Proyecto de referencia citado, `ngxson/fly-llm-hf`: https://huggingface.co/ngxson/fly-llm-hf
- Espacio `Xenova/fruit-fly-simulation`, citado como origen del empaquetado del que parte fly-llm-hf: se menciona en la model card, pero no se incluye URL directa
- Release original del conectoma MaleCNS v1.0, alojado en el bucket de Janelia: se menciona en la model card como origen de los ficheros flat-connectome verificados por md5, pero no se incluye URL directa
- Paper o publicacion tecnica asociada: no disponible
- Demo o repositorio de codigo adicional: no disponible
- Nota sobre la busqueda web: los resultados devueltos no guardan relacion con el modelo (paginas de soporte de cuentas y actualizaciones de Microsoft), por lo que no aportan enlaces utiles para esta ficha.

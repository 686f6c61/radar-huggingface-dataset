# QuixiAI/MaleCNS

## Resumen

MaleCNS es el empaquetado sin pérdidas del conectoma MaleCNS v1.0 de *Drosophila melanogaster* macho (cerebro, lóbulos ópticos y cordón nervioso ventral) en formato `safetensors`, publicado por QuixiAI. No es un modelo de lenguaje ni una red neuronal entrenada: es el diagrama de cableado anatómico completo, convertido en tensores PyTorch que se cargan con `AutoModel.from_pretrained(..., trust_remote_code=True)`. Contiene 88.384.522 cuerpos (segmentos con al menos una sinapsis en la tabla), 151.856.684 conexiones dirigidas (123 autapsis incluidas) y 311.833.243 contactos sinápticos, con recuentos por conexión entre 1 y 2.591 sinapsis.

El repositorio existe como capa intermedia entre la publicación original de Janelia y los modelos derivados. El ejemplo más conocido, `ngxson/fly-llm-hf`, usa el cerebro central como reservorio de eco congelado para un TinyStories: asigna signos a las sinapsis según el neurotransmisor predicho, reescala la matriz a radio espectral 0,99 y entrena proyecciones, ganancias por neurona y una capa de lectura. Esas decisiones son razonables para ese proyecto, pero quedan incrustadas en sus pesos. MaleCNS ofrece la tabla de origen sin modificar para que cualquier trabajo posterior (grafos, simulaciones, modelos neuronales) parta del mismo material.

El resultado es un artefacto de datos: sin modelo neuronal, sin convención de signos, sin normalización, sin redondeo a bf16 y sin inicialización aleatoria. La representación de neurotransmisores se conserva en tensores aparte y los subconjuntos (solo cuerpos trazados, regiones) se obtienen mediante máscaras, no vienen elegidos de antemano. La licencia es CC-BY-4.0 y el tamaño del repositorio es de 2,8 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No es una red neuronal: grafo dirigido disperso empaquetado como tensores `safetensors` (sin capas, sin modelo neuronal, sin estado) |
| Parámetros totales | 726.230.172 entradas tensoriales (no hay parámetros entrenables; la cifra es el recuento de elementos de los nueve tensores) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (no es un modelo de secuencia; no hay ventana de contexto) |
| Tipos de cuantización | No aplica. Los dtypes nativos son `int64` (`neuron_id`), `int32` (`edge_src`, `edge_dst`, `synapse_count`, `nt_neuron_index`), `int8` (`neuron_status`, `neuron_superclass`, `nt_class`) y `float64` (`nt_confidence`). No se aplica redondeo ni cuantización de pesos |
| Idiomas soportados | No aplica (no contiene texto ni tokenizador) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | `safetensors` (`model.safetensors`), 2,8 GB de repositorio |

Tensores incluidos en `model.safetensors`:

| Tensor | Forma | dtype | Tamaño |
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

No hay arquitectura de red ni entrenamiento. El artefacto es una representación fiel de la tabla de conectividad segmento-a-segmento de la publicación: por cada fila `body_pre, body_post, weight` existe una arista `edge_src, edge_dst, synapse_count`, en el mismo orden de filas del fichero original y con la columna `weight` intacta. Esos valores son pesos de conexión anatómicos (número de contactos sinápticos detectados entre dos cuerpos), no eficacias sinápticas fisiológicas. Cualquier conversión a pesos de red (signo, escala, normalización o reinicialización) se deja deliberadamente al consumidor.

El método `forward` implementa un único paso de propagación lineal, incluido por comodidad. El proceso de construcción vuelve a cargar los tensores guardados y los verifica contra la tabla original arista por arista; también comprueba que el fichero de conectividad restringido a `status == Traced` coincide exactamente con la tabla completa filtrada por esa condición. La tabla de neurotransmisores se replica como tensores independientes (`nt_class`, `nt_confidence`, `nt_neuron_index`) para que la convención de signos sea una decisión posterior del usuario.

Estadísticas del grafo: 88.384.522 cuerpos, 151.856.684 conexiones dirigidas (123 autapsis, conservadas), 311.833.243 contactos sinápticos, grado medio de entrada y salida de 1,7, máximo de entrada 13.518 y máximo de salida 56.517. Distribución de conexiones por recuento mínimo de sinapsis: ≥1: 151.856.684; ≥2: 57.670.765; ≥3: 23.014.406; ≥5: 7.622.864; ≥10: 2.799.910. Los cuerpos marcados como `status == Traced` (verificados) son 164.789, con 25.563.197 conexiones entre ellos y 124.025.046 contactos.

## Capacidades

- Proporciona el conectoma completo del sistema nervioso central de *Drosophila* macho (cerebro, lóbulos ópticos y cordón nervioso ventral), no solo el cerebro central.
- Carga directa como tensores PyTorch mediante `AutoModel.from_pretrained(..., trust_remote_code=True)` con la librería `transformers`.
- Permite construir subconjuntos (regiones, cuerpos trazados) mediante máscaras booleanas sobre `neuron_id`, `neuron_status` y `neuron_superclass`, sin heredar decisiones de terceros.
- Expone los recuentos de sinapsis exactos como enteros de 32 bits, sin signo ni reescalado, listos para definir pesos sinápticos propios.
- Incluye predicciones de neurotransmisor con su clase y nivel de confianza (`nt_class`, `nt_confidence`) en tensores separados, aplicables o ignorables a voluntad.
- Ejecuta un paso de propagación lineal sobre el grafo mediante el método `forward`, útil como primitiva de simulación.
- No soporta *tool calling*, agentes, razonamiento multi-paso, generación de texto, visión ni audio: no es un modelo de lenguaje y no tiene tokenizador.
- No se declaran capacidades multilingües ni de ningún otro tipo; la model card no documenta funcionalidad adicional.

## Casos de uso

- Análisis topológico del conectoma completo: calcular distribuciones de grado, coeficientes de agrupamiento, motivos de circuito y caminos multihop sobre las 151.856.684 aristas dirigidas, usando los tensores tal cual y sin deshacer convenciones de terceros.
- Modelado de reservorios biológicamente plausibles: partir de `synapse_count` en bruto y aplicar la convención de signos, el reescalado espectral y las ganancias por neurona que cada proyecto decida, en lugar de heredar las de `fly-llm-hf`.
- Aprendizaje automático sobre grafos (GNN): preentrenamiento de *embeddings* de nodo, predicción de enlaces y clasificación de nodos por superclase sobre un grafo dirigido de escala poco habitual, con los cuerpos trazados como conjunto etiquetado fiable.
- Simulación de dinámica neuronal: usar los recuentos como pesos en modelos de tasa o *integrate-and-fire* sobre subconjuntos del cordón nervioso ventral o de los lóbulos ópticos, seleccionados con máscaras.
- Evaluación comparativa de *frameworks* de grafos a gran escala: el grafo es un banco de pruebas realista para medir construcción de CSR, reordenamientos, particionado y rendimiento de motores como PyTorch Geometric, DGL o bibliotecas de recorrido tipo Gunrock.
- Estudios de conectividad por tipo celular: cruzar `neuron_superclass` con `nt_class` y `nt_confidence` para analizar si la clase de neurotransmisor predicha correlaciona con la superclase morfológica en los 1.835.518 registros disponibles.
- Trazado de vías sensoriales y motoras: reconstruir circuitos ascendentes y descendentes desde los lóbulos ópticos hasta el cordón nervioso ventral siguiendo aristas dirigidas, con la posibilidad de filtrar por umbral de sinapsis (por ejemplo, ≥5 o ≥10 contactos) para reducir ruido.
- Base de reproducibilidad: servir como punto de partida neutro y verificado contra la publicación original para comparar resultados entre grupos que trabajan sobre el mismo conectoma con decisiones de modelado distintas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de tareas de aprendizaje automático, y el artefacto no es un modelo entrenado, por lo que no procede aplicar métricas tipo MMLU, HumanEval o GSM8K. Las únicas cifras verificables son las estructurales del grafo (cuerpos, conexiones, contactos, grados y distribución de recuentos sinápticos), recogidas en las secciones anteriores.

## Requisitos de hardware

- Almacenamiento: 2,8 GB para el repositorio completo; `model.safetensors` ocupa aproximadamente 2,73 GB.
- Memoria: la carga de los nueve tensores como `int64`/`int32`/`int8`/`float64` requiere del orden de 2,7-3 GB de RAM. Estimación propia: la conversión a estructuras de grafo en memoria (CSR o formatos de PyG/DGL, con índices adicionales y ordenaciones) puede elevar el consumo a 6-9 GB, en función del número de copias y del dtype elegido.
- GPU: no se requiere GPU para cargar ni inspeccionar los tensores. Para procesar el grafo completo con operaciones densas de GPU o modelos de mensajes, estimación propia: una GPU con 24 GB (RTX 4090, L4, A10G) es suficiente si se trabaja con representaciones dispersas; para materializar submatrices densas o entrenar GNN sobre el grafo completo conviene una A100 (40/80 GB) o H100. No hay datos publicados de VRAM específicos para este artefacto.
- GPU de consumo: sí, cabe en tarjetas de consumo para carga, inspección y trabajo sobre subconjuntos; el cuello de botella es el tamaño del grafo, no la memoria de pesos.
- Opciones de despliegue: PyTorch con `transformers` (`AutoModel.from_pretrained`, requiere `trust_remote_code=True`); bibliotecas de grafos como PyTorch Geometric o DGL; NetworkX solo es viable sobre subconjuntos muy reducidos, dado que 151,8 millones de aristas exceden con creces su rango práctico. No aplican vLLM, llama.cpp, Ollama ni TGI, al no existir pesos de modelo de lenguaje.
- Latencia y throughput: no disponibles. No se publican tiempos de carga, de construcción de índices ni de recorrido del grafo.

## Comparativa con modelos similares

| | QuixiAI/MaleCNS | ngxson/fly-llm-hf |
|---|---|---|
| Propósito | Empaquetar MaleCNS sin pérdidas para PyTorch y ML sobre grafos | Modelo de lenguaje de juguete (reservorio de eco) |
| Origen de los datos | Ficheros oficiales de conectoma plano del *bucket* de Janelia, verificados con md5 | MaleCNS empaquetado por el *space* Xenova fruit-fly-simulation |
| Alcance | Tabla completa: 88.384.522 cuerpos, 151.856.684 conexiones; subconjuntos como máscaras | Solo cerebro central (cb_sensory, visual_projection, cb_intrinsic, ascending, descending): 49.393 neuronas, 9.050.172 aristas |
| Valores de las aristas | Recuentos de sinapsis exactos (int32), orden de filas original, sin tocar | Recuentos con signo (ACh +1, GABA/glutamato −1, otros 0), reescalados a radio espectral 0,99, más ganancia aprendida por neurona |
| Neurotransmisores | Tabla replicada como tensores aparte, no aplicada al grafo | Usados para asignar el signo de cada arista saliente |
| Dinámica | Ninguna (`forward` es un paso de propagación lineal, por comodidad) | Reservorio *leaky-tanh*, a = 0,9, línea de retardo de 8 tokens hacia 14.069 neuronas sensoriales |
| Parámetros entrenables | Ninguno | Proyección de entrada, ganancias por neurona, LayerNorm y capa de lectura (52,8 M); el conectoma está congelado |
| Tokenizador y tarea | Ninguno | BPE a nivel de byte (1024) sobre TinyStories |
| Papel de `transformers` | `AutoModel` que devuelve el grafo | `AutoModelForCausalLM` que genera texto |
| Licencia | CC-BY-4.0 | No disponible en la información proporcionada |

Alternativa adicional: la publicación original de Janelia MaleCNS v1.0, citada en la model card como fuente de la tabla plana y verificada por md5, pero sin URL ni condiciones de licencia detalladas en la información disponible.

## Limitaciones y advertencias

- No es un modelo entrenado: no genera texto, no razona, no admite *tool calling* ni agentes, y no debe evaluarse con métricas de modelos de lenguaje.
- `synapse_count` es un recuento anatómico de contactos detectados, no una eficacia sináptica fisiológica; usar esos valores como pesos de una red introduce supuestos no validados.
- Las predicciones de neurotransmisor (`nt_class`, `nt_confidence`) son predicciones computacionales con confianza variable; conviene filtrar por `nt_confidence` antes de derivar signos.
- La mayoría de los cuerpos no están verificados: solo 164.789 de 88.384.522 figuran como `status == Traced`, es decir, menos del 0,2 %. La conectividad del resto procede del trazado automático y puede contener errores de segmentación o de detección de sinapsis.
- 57.670.765 conexiones tienen un único contacto sináptico; si se usan sin umbral, dominan el grafo y aportan ruido. Los umbrales de ≥2, ≥3, ≥5 o ≥10 están documentados como alternativa.
- El grado medio es muy bajo (1,7) frente a máximos de 13.518 de entrada y 56.517 de salida: la distribución está fuertemente sesgada y los hubs concentran buena parte de la conectividad, lo que condiciona cualquier análisis de centralidad.
- Se conservan 123 autapsis; si el modelo de simulación no las contempla, hay que eliminarlas explícitamente.
- La carga requiere `trust_remote_code=True`, lo que implica ejecutar código alojado en el repositorio; conviene auditar el módulo personalizado antes de usarlo en entornos no controlados.
- La licencia CC-BY-4.0 permite uso comercial con atribución; no está claro en la información disponible si la publicación de Janelia impone condiciones adicionales sobre los datos de origen, por lo que conviene verificar la licencia de la fuente antes de redistribuir.
- No hay información sobre sesgos de anotación más allá del estado de verificación, ni sobre cobertura regional: no se documentan sesgos por hemisferio, sexo o cepa del espécimen.
- El grafo completo excede la capacidad de herramientas de propósito general como NetworkX; intentar cargarlo en memoria de forma ingenua provoca agotamiento de RAM.
- No hay garantía de compatibilidad futura: el artefacto depende del código personalizado del repositorio y de la interfaz `AutoModel`.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/QuixiAI/MaleCNS
- Modelo derivado citado en la model card: https://huggingface.co/ngxson/fly-llm-hf
- *Space* de origen del empaquetado anterior, mencionado en la model card: https://huggingface.co/spaces/Xenova/fruit-fly-simulation
- Publicación original Janelia MaleCNS v1.0 y *bucket* de ficheros de conectoma plano: mencionados en la model card, URL no disponible
- Resultados de la búsqueda web: no se ha encontrado ninguna referencia relevante al modelo; los resultados devueltos (foros de fútbol, hilos de hardware y foros de motocicletas) no guardan relación con el artefacto
- No se dispone de *paper*, blog técnico, repositorio de código ni demo asociados en la información proporcionada

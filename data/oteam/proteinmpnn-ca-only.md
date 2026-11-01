# oteam/proteinmpnn-ca-only

## Resumen

ProteinMPNN es un modelo de diseño inverso de proteínas (inverse folding) que genera una secuencia de aminoácidos compatible con una estructura tridimensional de esqueleto proteico fija. Lo desarrollaron originalmente Justas Dauparas y colaboradores del laboratorio de David Baker, y esta versión concreta es una implementación no oficial publicada por el equipo OFoldX bajo el identificador `oteam/proteinmpnn-ca-only`. Resuelve un problema clásico en biología computacional: dada una geometría de backbone, predecir qué secuencia lo estabiliza.

La variante CA-only se distingue del modelo estándar en que solo utiliza el átomo de carbono alfa de cada residuo como entrada geométrica, en lugar de los cuatro átomos de esqueleto (N, CA, C, O). Esto reduce la información disponible pero simplifica el preprocesado y permite trabajar con estructuras de menor resolución o con representaciones simplificadas. El modelo tiene 1.641.720 parámetros reales según los pesos en safetensors, con un tamaño oculto de 128, tres bloques de encoder y tres de decoder, y un grafo de 48 vecinos por residuo.

Es relevante ahora porque forma parte de un ecosistema más amplio de herramientas de diseño proteico (OFoldX) que empaqueta modelos de la familia ProteinMPNN/SolubleMPNN con pipelines de diseño, scoring y packing de cadenas laterales, facilitando su uso en flujos de trabajo de ingeniería de proteínas sin depender del repositorio original en PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de message-passing autoregresiva sobre grafo espacial de residuos (encoder-decoder) |
| Parametros totales | 1.641.720 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (opera sobre grafos de vecinos, 48 vecinos por residuo) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo biológico, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo representa cada residuo como un nodo en un grafo de vecinos espaciales más cercanos (k=48) y codifica la geometría del backbone mediante bloques de message-passing. La variante CA-only utiliza únicamente la posición del carbono alfa como información geométrica de entrada, frente a los cuatro átomos del modelo estándar. El decoder genera los residuos en un orden causal muestreado, lo que permite condicionar la generación a posiciones fijas, identidades ligadas, restricciones de aminoácidos por posición y perfiles de secuencia.

El entrenamiento sigue el esquema de recuperación autoregresiva de secuencia con perturbaciones de coordenadas para aumentar la robustez. Según la model card, el ejemplo de entrenamiento oficial emplea ensamblados biológicos del PDB de 2 de agosto de 2021, con cadenas proteicas agrupadas al 30 % de identidad de secuencia. La variante CA-only se entrena con niveles de ruido de 0,02, 0,10 o 0,20 Å según el checkpoint concreto (este repositorio corresponde a uno de ellos; la model card no especifica cuál en el identificador principal). No se detalla en la información disponible el número total de tokens ni la composición exacta del dataset más allá de la referencia al PDB.

## Capacidades

- Diseño de secuencia condicionado a backbone fijo (inverse folding) para estructuras proteicas.
- Scoring de secuencias: devuelve log-verosimilitud negativa (NLL) global y por residuo en nats por residuo.
- Generación autoregresiva con orden causal muestreado, configurable mediante semilla y número de órdenes de decodificación.
- Soporte de posiciones fijas, identidades ligadas y restricciones de aminoácidos específicas por posición.
- Soporte de perfiles de secuencia como condicionamiento adicional.
- Integración con pipeline de diseño y packing de cadenas laterales mediante `ProteinMpnnDesignAndPackPipeline`.
- Ejecución por etapas (`prepare`, `forward`, `postprocess`) en el ecosistema OFoldX.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo especializado en biología estructural.

## Casos de uso

- Diseño de secuencias para estructuras generadas por modelos de difusión (RFdiffusion, Chroma): el modelo toma el backbone sintético y propone secuencias plausibles que luego se validan con AlphaFold u otro predictor de estructura.
- Rediseño de proteínas naturales: dada una estructura cristalográfica del PDB, se generan variantes de secuencia manteniendo el pliegue, útil para ingeniería de estabilidad o solubilidad.
- Scoring de mutantes: calcular la NLL de secuencias candidatas sobre un backbone fijo permite priorizar mutaciones con mayor compatibilidad estructural antes de expresarlas en laboratorio.
- Diseño con restricciones posicionales: fijar residuos catalíticos o de unión y rediseñar el resto del entorno, habitual en ingeniería de sitios activos enzimáticos.
- Filtrado en pipelines de protein design: usar el modelo como scorer intermedio entre generación de backbone y predicción de estructura para descartar candidatos incompatibles.
- Docencia e investigación en biología computacional: el tamaño reducido (1,6 M de parámetros) y la variante CA-only permiten experimentar con inverse folding en entornos con recursos limitados.
- Integración con packing de cadenas laterales: tras el diseño de secuencia, combinar con el MPNN Packer de OFoldX para obtener coordenadas completas de cadena lateral y preparar la estructura para simulación o validación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 2 GB para el modelo en precisión completa, dado el tamaño de 1,64 M de parámetros; el cuello de botella real es el grafo de vecinos y el tamaño de la estructura de entrada.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; A100, H100 o RTX 4090 sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4090) e incluso en CPU para estructuras de tamaño moderado.
- Opciones de despliegue: librería `ofoldx` (pip install ofoldx); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Backbone de entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| ProteinMPNN CA-only (este) | 1.641.720 | Solo CA | AGPL-3.0 | HuggingFace (oteam) |
| ProteinMPNN estándar (oteam) | 1.674.000 (aprox.) | N, CA, C, O | AGPL-3.0 | HuggingFace (oteam) |
| SolubleMPNN (oteam) | 1.674.000 (aprox.) | N, CA, C, O | AGPL-3.0 | HuggingFace (oteam) |
| ProteinMPNN original (dauparas) | No disponible en la información | N, CA, C, O | MIT (repositorio original) | GitHub |

La comparativa se limita a las variantes de la misma familia publicadas por OFoldX; no se dispone de datos de benchmarks que permitan comparar rendimiento entre ellas.

## Limitaciones y advertencias

- Es una implementación no oficial: el equipo OFoldX no es el autor original de ProteinMPNN y la model card lo indica explícitamente. La fidelidad respecto al modelo original no está verificada en la información disponible.
- La variante CA-only usa menos información geométrica que el modelo estándar; cabe esperar menor precisión en la recuperación de secuencia, aunque no se aportan métricas que lo cuantifiquen.
- Licencia AGPL-3.0: el uso comercial en servicios en red puede obligar a liberar el código modificado; revisar implicaciones antes de integrar en productos propietarios.
- Riesgo de sobreajuste a la distribución del PDB de 2021: proteínas con pliegues atípicos, diseñadas de novo o con modificaciones no naturales pueden caer fuera de la distribución de entrenamiento.
- No es un modelo de lenguaje: no procesa texto, no soporta instrucciones en lenguaje natural y no tiene capacidades de razonamiento general.
- No se documentan sesgos ni evaluaciones de calibración en la información disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción por parte de la comunidad.
- Dependencia de la librería `ofoldx` para cargar los pesos; no se ofrecen formatos alternativos (GGUF, ONNX) en la información disponible.

## Enlaces

- HuggingFace: https://huggingface.co/oteam/proteinmpnn-ca-only
- Variante con ruido 0.02: https://huggingface.co/oteam/proteinmpnn-ca-only-noise002
- Variante con ruido 0.10: https://huggingface.co/oteam/proteinmpnn-ca-only-noise010
- Modelo estándar: https://huggingface.co/oteam/proteinmpnn
- SolubleMPNN: https://huggingface.co/oteam/solublempnn
- Ejemplo de entrenamiento: https://huggingface.co/oteam/proteinmpnn-training-example
- Código OFoldX (ProteinMPNN): https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/proteinmpnn
- Guía de pipelines OFoldX: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- MPNN Packer: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/models/mpnn_packer/README.md
- Repositorio oficial ProteinMPNN: https://github.com/dauparas/ProteinMPNN
- README de entrenamiento oficial: https://github.com/dauparas/ProteinMPNN/blob/main/training/README.md
- Paper: https://doi.org/10.1126/science.add2187
- Documentación de ofoldx: https://ofoldx.valtech.ai/

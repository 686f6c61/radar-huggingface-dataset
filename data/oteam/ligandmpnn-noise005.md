# oteam/ligandmpnn-noise005

## Resumen

LigandMPNN (variante `oteam/ligandmpnn-noise005`) es una implementación no oficial, distribuida por el equipo OFoldX, del modelo LigandMPNN publicado por Justas Dauparas y colaboradores del laboratorio de David Baker. Se trata de una red neuronal de paso de mensajes (message-passing neural network) autorregresiva para el diseño inverso de secuencias de proteínas: dado un esqueleto proteico (backbone) y el contexto atómico no proteico que lo rodea (ligandos, ácidos nucleicos, metales), predice la secuencia de aminoácidos compatible con esa geometría.

El modelo resuelve un problema clásico del diseño computacional de proteínas: la mayoría de los modelos de *inverse folding* solo consideran la cadena principal y pierden la información química de las interfaces de unión. LigandMPNN incorpora explícitamente los átomos vecinos no proteicos, lo que le permite generar secuencias coherentes en sitios de unión y en regiones de contacto con ligandos, algo crítico en diseño de enzimas, biosensores y fármacos.

Esta variante concreta se entrenó con un ruido de coordenadas de 0,05 Å, una de las cuatro variantes de robustez publicadas (0,05, 0,10, 0,20 y 0,30 Å). El modelo es muy compacto (2,63 millones de parámetros), se distribuye en formato safetensors bajo licencia AGPL-3.0 y depende de la librería `ofoldx` para su ejecución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal de paso de mensajes (message-passing) autorregresiva para diseño inverso de proteínas con contexto atómico |
| Parámetros totales | 2.631.800 (2,632 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el contexto se define por vecinos atómicos: 32 vecinos y 25 átomos de contexto) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (modelo biológico, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |

Detalles de arquitectura según la model card: hidden size 128, 3 bloques de encoder, 2 bloques de contexto atómico, 2 bloques de contexto, 3 bloques de decoder, 32 vecinos y 25 átomos de contexto.

## Arquitectura y entrenamiento

LigandMPNN es una red de paso de mensajes sobre grafos de átomos. El encoder procesa la geometría del backbone proteico; los bloques de contexto atómico integran los átomos no proteicos cercanos (ligandos, iones metálicos, ácidos nucleicos); y el decoder genera la secuencia de forma autorregresiva, prediciendo un residuo tras otro condicionado en los anteriores. La innovación principal frente a ProteinMPNN es precisamente esa incorporación explícita del contexto químico no proteico, que condiciona la generación alrededor de interfaces y sitios de unión.

El entrenamiento se realizó sobre ensamblados proteicos del PDB disponibles hasta el 16 de diciembre de 2022, incluyendo estructuras con ligandos, ácidos nucleicos y metales, con las secuencias agrupadas al 30 % de identidad. El procedimiento es de *sequence recovery* autorregresivo con perturbaciones de coordenadas para aumentar la robustez; esta variante usa un ruido de 0,05 Å. No se especifican en la información disponible el número total de tokens de entrenamiento ni si hubo etapas de RLHF o DPO (no aplicables en este dominio).

## Capacidades

- Diseño inverso de secuencias de proteínas condicionado por backbone y contexto atómico no proteico.
- Modelado explícito de interfaces proteína-ligando, proteína-ácido nucleico y proteína-metal.
- Puntuación (*scoring*) de secuencias: devuelve NLL por residuo en nats, tanto global como por posición.
- Generación de múltiples candidatos de secuencia por estructura de entrada.
- Muestreo autorregresivo con órdenes de decodificación configurables (`num_decoding_orders`) y semilla reproducible.
- Composición con un *packer* independiente (MPNN Packer) para generar coordenadas de cadenas laterales tras el diseño.
- Capacidad de *scoring* con múltiples órdenes de decodificación para estimar la verosimilitud de una secuencia dada.
- No soporta tool calling, agentes, visión, audio ni capacidades lingüísticas: es un modelo específico de biología estructural.

## Casos de uso

- Diseño de enzimas: dado el backbone de un sitio activo con cofactor o sustrato unido, LigandMPNN genera secuencias compatibles con la geometría del bolsillo, permitiendo explorar variantes catalíticas que mantengan las interacciones con el ligando.
- Rediseño de sitios de unión a fármacos: en estructuras cristalográficas de complejos proteína-ligando, el modelo propone secuencias que preservan el contacto atómico con el compuesto, útil para ingeniería de afinidad.
- Ingeniería de metaloproteínas: al incorporar iones metálicos como contexto atómico, permite diseñar esferas de coordinación plausibles en torno a Zn, Fe o Ca.
- Puntuación de variantes en pipelines de cribado: el modo *score* calcula la NLL por residuo de secuencias candidatas sobre una estructura dada, sirviendo como filtro rápido en campañas de diseño.
- Diseño de proteínas de unión a ácidos nucleicos: el contexto atómico incluye nucleótidos, lo que permite rediseñar dominios de interacción con ADN o ARN.
- Validación de modelos predictivos de estructura: comparar la NLL de secuencias naturales frente a secuencias generadas sobre un mismo backbone para detectar estructuras mal plegadas o interfaces inconsistentes.
- Flujos de diseño completo: combinación con el MPNN Packer de OFoldX para pasar de secuencia a coordenadas de cadenas laterales y posteriores evaluaciones con AlphaFold u otras herramientas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 2,63 M de parámetros, el modelo ocupa del orden de decenas de MB en fp32, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna (RTX 3060 o superior) es suficiente; el cuello de botella será el preprocesado de estructuras y el número de candidatos generados, no el modelo.
- Cabe en GPU consumer: sí, en la práctica totalidad del catálogo actual.
- Opciones de despliegue: la librería `ofoldx` (pip install ofoldx) con sus pipelines `design` y `score`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LigandMPNN (esta variante, OFoldX) | 2,63 M | 32 vecinos / 25 átomos de contexto | Diseño inverso con contexto atómico | AGPL-3.0 | HuggingFace (oteam) |
| ProteinMPNN | No disponible en la información | Solo backbone proteico | Diseño inverso de proteínas | No disponible | Repositorio original de Dauparas et al. |
| LigandMPNN oficial | No disponible en la información | Contexto atómico no proteico | Diseño inverso con contexto atómico | No disponible | GitHub dauparas/LigandMPNN |

La comparación cuantitativa de rendimiento entre estas alternativas no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Implementación no oficial: la model card la firma el equipo OFoldX, no los autores del paper; los pesos pueden diferir de los originales.
- Licencia AGPL-3.0: impone obligaciones de copyleft fuerte; el uso en productos comerciales o servicios en red requiere revisar las condiciones con detalle.
- Dependencia de la librería `ofoldx`, cuyo ecosistema y mantenimiento condicionan la reproducibilidad.
- El modelo está especializado en una única tarea biológica; no es un modelo de lenguaje general y no debe evaluarse con métricas de NLP.
- La calidad del diseño depende fuertemente de la calidad de la estructura de entrada y del contexto atómico correctamente anotado.
- No se documentan sesgos, tasas de alucinación ni evaluaciones de robustez específicas para esta variante de ruido 0,05 Å.
- No se proporcionan datos de benchmarks ni comparativas de rendimiento en la información disponible, por lo que no es posible avalar su superioridad frente a alternativas.
- El repositorio no registra descargas ni interacciones, lo que sugiere poca validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/oteam/ligandmpnn-noise005
- Variante noise010: https://huggingface.co/oteam/ligandmpnn-noise010
- Variante noise010 (alias): https://huggingface.co/oteam/ligandmpnn
- Variante noise020: https://huggingface.co/oteam/ligandmpnn-noise020
- Variante noise030: https://huggingface.co/oteam/ligandmpnn-noise030
- Paper: https://doi.org/10.1038/s41592-025-02626-1
- Repositorio oficial: https://github.com/dauparas/LigandMPNN
- Código OFoldX: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/ligandmpnn
- Documentación OFoldX: https://ofoldx.valtech.ai/
- Guía de pipelines: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- MPNN Packer: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/models/mpnn_packer/README.md
- Licencia: https://github.com/OTeam-AI4S/OFoldX/blob/main/license.md
- Incidencias: https://github.com/OTeam-AI4S/OFoldX/issues
- PDB: https://www.rcsb.org/

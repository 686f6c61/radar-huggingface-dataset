# oteam/ligandmpnn-noise010

## Resumen

LigandMPNN (variante `oteam/ligandmpnn-noise010`) es una implementación no oficial del modelo de diseño de secuencias de proteínas presentado por Dauparas et al. en *Nature Methods* (2025). Se trata de una red neuronal de paso de mensajes (message-passing neural network) autoregresiva que resuelve el problema del *inverse folding*: dado un esqueleto proteico tridimensional y el contexto atómico no proteico circundante (ligandos, ácidos nucleicos, metales, iones), genera secuencias de aminoácidos compatibles con esa estructura.

El modelo está desarrollado por el equipo OFoldX (OTeam-AI4S) como reimplementación del trabajo original de David Baker y colaboradores, y se distribuye a través de la librería `ofoldx`. La variante `noise010` corresponde a un entrenamiento con perturbación de coordenadas de 0,10 Å, una de las cuatro variantes publicadas (0,05, 0,10, 0,20 y 0,30 Å) que permiten ajustar la robustez frente a ruido estructural en la entrada.

Con 2,63 millones de parámetros, es un modelo muy compacto orientado a una tarea científica muy específica: el diseño computacional de proteínas y el *scoring* de secuencias en contextos de unión a ligandos. Su relevancia actual radica en que incorpora explícitamente el entorno químico no proteico, algo que los modelos clásicos de inverse folding (como ProteinMPNN) no hacían, mejorando el diseño en interfaces de unión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de paso de mensajes (message-passing neural network) con codificador, bloques de contexto atómico, bloques de contexto y decodificador autoregresivo |
| Parametros totales | 2.631.800 (2,632 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del número de vecinos: 32 vecinos y 25 átomos de contexto por residuo) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo biológico, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es una red de paso de mensajes sobre grafos de átomos con un tamaño oculto de 128 dimensiones. Se compone de 3 bloques de codificador, 2 bloques de contexto atómico, 2 bloques de contexto y 3 bloques de decodificador. Cada residuo considera 32 vecinos y 25 átomos de contexto, lo que permite incorporar información de ligandos, metales y ácidos nucleicos cercanos al esqueleto proteico. El modelo genera la secuencia de forma autoregresiva, prediciendo aminoácido a aminoácido condicionado en la geometría del backbone y en el entorno atómico local.

El entrenamiento se realizó sobre ensamblados proteicos del PDB disponibles hasta el 16 de diciembre de 2022, incluyendo estructuras con ligandos, ácidos nucleicos y metales. Las secuencias se agruparon con un umbral de identidad del 30 % para evitar fuga de datos. El procedimiento es de *sequence recovery* autoregresivo con perturbaciones de coordenadas para aumentar la robustez; esta variante concreta usa ruido de 0,10 Å. No se indica en la información disponible si se empleó RLHF, DPO ni otras técnicas de alineamiento (no aplicables en este dominio).

## Capacidades

- Diseño de secuencias de proteínas (*inverse folding*) condicionado a un esqueleto tridimensional.
- Incorporación explícita de contexto atómico no proteico: ligandos, iones metálicos, ácidos nucleicos y otras moléculas pequeñas.
- *Scoring* de secuencias: cálculo de la log-verosimilitud negativa (NLL) global y por residuo, en nats por residuo.
- Generación de múltiples candidatos de secuencia mediante distintos órdenes de decodificación (parámetro `num_decoding_orders`).
- Composición con un *packer* de cadenas laterales (MPNN Packer) para generar coordenadas de side-chain tras el diseño.
- Robustez configurable frente a ruido estructural gracias a las variantes de entrenamiento (0,05–0,30 Å).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo científico de dominio específico.

## Casos de uso

- **Diseño de proteínas de unión a fármacos**: dado un complejo proteína-ligando en formato mmCIF, el modelo genera secuencias que acomodan el ligando en el bolsillo de unión, aprovechando el contexto atómico explícito para optimizar contactos en la interfaz.
- **Rediseño de sitios activos enzimáticos**: partiendo de una estructura con cofactor metálico o sustrato, se pueden proponer secuencias alternativas que preserven la geometría catalítica, útil en ingeniería de enzimas.
- **Scoring de variantes en pipelines de cribado**: el modo `score` calcula la NLL por residuo, permitiendo priorizar mutaciones o secuencias candidatas generadas por otros métodos antes de validación experimental.
- **Diseño de proteínas de unión a ácidos nucleicos**: al incluir contexto de ácidos nucleicos, es adecuado para diseñar dominios de unión a ADN o ARN en factores de transcripción artificiales.
- **Generación de librerías de secuencias para *screening* experimental**: los múltiples órdenes de decodificación permiten obtener diversidad de candidatos para síntesis y ensayo en laboratorio.
- **Diseño y empaquetado de cadenas laterales**: combinado con `LigandMpnnDesignAndPackPipeline` y el MPNN Packer, permite obtener estructuras completas (secuencia + side-chains) listas para evaluación computacional o modelado posterior.
- **Análisis de compatibilidad secuencia-estructura en complejos**: evaluar si una secuencia observada es compatible con su entorno atómico, útil en validación de estructuras cristalográficas o modelos predictivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo tiene solo 2,63 M de parámetros, por lo que los pesos ocupan unos pocos MB en precisión completa; la VRAM dominante la determina el tamaño del grafo de entrada (número de residuos y átomos de contexto).
- GPU recomendadas: cualquier GPU moderna con soporte CUDA es suficiente; se puede ejecutar en GPUs de consumo como RTX 3060, RTX 4060 o superiores, e incluso en CPU para estructuras pequeñas.
- Cabe holgadamente en cualquier GPU de consumo actual.
- Opciones de despliegue: la vía oficial es la librería `ofoldx` (`pip install ofoldx`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto atómico no proteico | Licencia | Disponibilidad |
|---|---|---|---|---|
| LigandMPNN (este, noise010) | 2,63 M | Sí (ligandos, metales, ácidos nucleicos) | AGPL-3.0 | HuggingFace (ofoldx) |
| ProteinMPNN | No disponible en la información | No (solo backbone proteico) | No disponible | Repositorio original de Baker Lab |
| LigandMPNN oficial (dauparas/LigandMPNN) | No disponible en la información | Sí | No disponible | GitHub oficial |

La comparativa con ProteinMPNN y con la implementación oficial se basa únicamente en la diferenciación cualitativa indicada en la model card; no se dispone de datos cuantitativos de rendimiento comparado en la información proporcionada.

## Limitaciones y advertencias

- **Implementación no oficial**: los pesos y el código los distribuye OFoldX, no el equipo original de Baker Lab; pueden existir diferencias respecto al modelo oficial.
- **Licencia AGPL-3.0**: es una licencia copyleft fuerte; el uso en productos o servicios en red puede obligar a liberar el código fuente derivado. Revisar la FAQ de licencia del proyecto antes de uso comercial.
- **Dependencia de la librería `ofoldx`**: el modelo no es directamente cargable con `transformers` ni otras librerías estándar.
- **Dominio muy restringido**: no es un modelo de lenguaje; no admite prompts en lenguaje natural ni tareas generales.
- **Riesgo de sobreajuste al PDB**: entrenado con estructuras hasta diciembre de 2022 y clustering al 30 % de identidad; el rendimiento puede degradarse en plegamientos o interfaces poco representadas.
- **Sensibilidad al ruido estructural**: esta variante está entrenada con ruido de 0,10 Å; para estructuras experimentales ruidosas o modelos predictivos de baja calidad podría ser preferible la variante `noise020` o `noise030`.
- **Sesgos del PDB**: la composición del Protein Data Bank está sesgada hacia proteínas solubles y bien caracterizadas, lo que puede limitar el diseño de proteínas de membrana o intrínsecamente desordenadas.
- **Validación experimental necesaria**: las secuencias generadas son propuestas computacionales; requieren validación en laboratorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oteam/ligandmpnn-noise010
- Variante noise005: https://huggingface.co/oteam/ligandmpnn-noise005
- Variante noise020: https://huggingface.co/oteam/ligandmpnn-noise020
- Variante noise030: https://huggingface.co/oteam/ligandmpnn-noise030
- Alias principal: https://huggingface.co/oteam/ligandmpnn
- Código del modelo en OFoldX: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/ligandmpnn
- Repositorio OFoldX: https://github.com/OTeam-AI4S/OFoldX
- Guía de pipelines de OFoldX: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- MPNN Packer: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/models/mpnn_packer/README.md
- Repositorio oficial de LigandMPNN: https://github.com/dauparas/LigandMPNN
- Paper (Nature Methods): https://doi.org/10.1038/s41592-025-02626-1
- Licencia: https://github.com/OTeam-AI4S/OFoldX/blob/main/license.md
- Documentación de la librería ofoldx: https://ofoldx.valtech.ai/
- PDB: https://www.rcsb.org/

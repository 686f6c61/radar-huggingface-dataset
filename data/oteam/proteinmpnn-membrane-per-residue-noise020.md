# oteam/proteinmpnn-membrane-per-residue-noise020

## Resumen

MembraneMPNN es un modelo de diseño inverso de plegamiento proteico (inverse folding) condicionado por el entorno de membrana. Dado un esqueleto proteico fijo (átomos N, CA, C y O), predice la identidad de los aminoácidos de cada residuo, incorporando etiquetas que indican si el residuo se encuentra en un entorno soluble, en la interfaz de membrana o enterrado en la membrana. El checkpoint aquí descrito, `proteinmpnn-membrane-per-residue-noise020`, es una variante con etiquetado por residuo y un nivel de ruido de 0,20 durante el entrenamiento.

El modelo es una implementación no oficial, publicada por el equipo OFoldX (usuario `oteam`), de los checkpoints de ProteinMPNN condicionados por membrana liberados con LigandMPNN por el laboratorio de David Baker. La arquitectura es un grafo espacial de residuos con un encoder y un decoder de message passing autorregresivo, con un total de 1.690.744 parámetros (1,691 M), tamaño oculto de 128, 3 bloques de encoder, 3 bloques de decoder y 48 vecinos por nodo.

Su relevancia radica en que aborda un problema específico y difícil del diseño de proteínas: las proteínas de membrana representan una fracción importante de las dianas farmacológicas, pero los modelos de diseño inverso entrenados mayoritariamente con proteínas solubles rinden peor en entornos hidrofóbicos. La condicionalidad por etiquetas de membrana permite sesgar el diseño hacia patrones de hidrofobicidad compatibles con la inserción en la bicapa lipídica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grafo espacial de residuos con encoder/decoder de message passing autorregresivo (ProteinMPNN) |
| Parametros totales | 1.690.744 (1,691 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo opera sobre grafos de residuos con 48 vecinos por nodo, sin ventana de tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo biológico, no lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |
| Atomos de esqueleto | N, CA, C, O |
| Tamano oculto | 128 |
| Bloques de encoder | 3 |
| Bloques de decoder | 3 |
| Vecinos por nodo | 48 |
| Libreria | ofoldx |
| Pipeline | other (diseño de secuencias) |

## Arquitectura y entrenamiento

MembraneMPNN sigue la arquitectura de ProteinMPNN: codifica la geometría del esqueleto (N, CA, C, O) como un grafo espacial de residuos, donde cada nodo se conecta con sus 48 vecinos más cercanos. Un encoder de 3 bloques de message passing genera representaciones contextuales y un decoder autorregresivo de 3 bloques predice la identidad aminoacídica residuo a residuo, con un tamaño oculto de 128. La innovación respecto al ProteinMPNN original es la incorporación de etiquetas de membrana como condicionamiento adicional, ya sea una etiqueta global binaria (soluble/transmembrana) o etiquetas por residuo.

En esta variante por residuo, las etiquetas `0`, `1` y `2` denotan entornos expuesto/otro, interfaz de membrana y enterrado en membrana, respectivamente. El sufijo `noise020` indica un nivel de ruido de 0,20 aplicado durante el entrenamiento, presumiblemente como aumento de datos sobre las coordenadas del esqueleto para mejorar la robustez. El modelo se entrena para recuperar la secuencia original a partir de la geometría y las etiquetas; la model card remite al repositorio upstream de LigandMPNN para los detalles de composición del dataset y construcción de etiquetas. No se documentan en la información disponible fases de RLHF/DPO ni detalles sobre el número de tokens o estructuras de entrenamiento.

## Capacidades

- Diseño inverso de secuencias proteicas a partir de un esqueleto fijo, con condicionamiento por entorno de membrana.
- Etiquetado por residuo con tres clases: expuesto/otro (0), interfaz de membrana (1) y enterrado en membrana (2).
- Generación autorregresiva con soporte para posiciones fijas, identidades ligadas (tied identities), restricciones de aminoácidos específicas por posición y sesgos de logits.
- Puntuación de secuencias (sequence scoring) mediante NLL en nats por residuo, con múltiples órdenes de decodificación y semilla configurable.
- Integración con un pipeline de diseño y empaquetado (`MembraneMpnnDesignAndPackPipeline`) para generar coordenadas de cadenas laterales tras el diseño.
- Exposición de operaciones diferenciables `encode` y `forward` para entrenamiento y ajuste fino.
- No soporta tool calling, agentes, visión, audio ni capacidades multilingües; es un modelo especializado en biología estructural.

## Casos de uso

- Diseño de proteínas de membrana con patrones de hidrofobicidad realistas: el modelo permite etiquetar residuos como enterrados o de interfaz, sesgando el diseño hacia secuencias compatibles con la bicapa lipídica en lugar de aplicar heurísticas post hoc.
- Rediseño de regiones transmembrana en dianas farmacológicas: dado el esqueleto de un receptor acoplado a proteínas G o un canal iónico, se pueden rediseñar segmentos concretos fijando el resto de posiciones y etiquetando los residuos de membrana.
- Puntuación de secuencias candidatas para filtrado: el pipeline `score` devuelve NLL por residuo con varios órdenes de decodificación, útil para priorizar diseños antes de síntesis experimental.
- Aumento de datasets de entrenamiento: la operación diferenciable `encode`/`forward` permite ajuste fino con datos propios de proteínas de membrana.
- Diseño y empaquetado combinado: el pipeline `MembraneMpnnDesignAndPackPipeline` genera secuencia y coordenadas de cadenas laterales, produciendo modelos estructurales completos listos para evaluación.
- Exploración de restricciones de diseño: el soporte de posiciones fijas, identidades ligadas y sesgos de logits permite estudiar cómo varía la secuencia diseñada al imponer restricciones de aminoácidos en posiciones clave.
- Integración en flujos de trabajo computacionales de descubrimiento de fármacos: al depender de la librería `ofoldx` y distribuirse en safetensors, se puede orquestar en pipelines de Python con ejecución por etapas (`prepare`, `forward`, `postprocess`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 1,691 M de parámetros, el modelo es extremadamente pequeño y cabe holgadamente en cualquier GPU consumer, aunque no se documentan cifras concretas.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU con suficiente memoria para el grafo de residuos y los tensores intermedios sería suficiente, pero no se especifica.
- Cabe en GPU consumer: previsiblemente sí, dado el reducido número de parámetros, aunque no se confirma en la documentación.
- Opciones de despliegue: la librería `ofoldx` (instalable vía `pip install ofoldx`); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Condicionamiento | Etiquetas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oteam/proteinmpnn-membrane-per-residue-noise020 | 1,691 M | Por residuo | 3 clases (expuesto/interfaz/enterrado) | AGPL-3.0 | HuggingFace (oteam) |
| oteam/membranempnn-per-residue | No disponible | Por residuo | 3 clases | No disponible | HuggingFace (oteam) |
| oteam/membranempnn-global | No disponible | Global | Binaria (soluble/transmembrana) | No disponible | HuggingFace (oteam) |
| ProteinMPNN (original) | ~1,7 M (aprox., no confirmado) | Sin condicionamiento de membrana | No aplica | MIT (upstream, no confirmado) | GitHub dauparas/ProteinMPNN |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Implementación no oficial: la model card advierte explícitamente que el equipo que publicó MembraneMPNN no escribió esta ficha ni este artefacto; es una reimplementación del equipo OFoldX, por lo que puede diferir del comportamiento de los checkpoints originales.
- Licencia AGPL-3.0: impone obligaciones copyleft fuertes; el uso comercial en productos propietarios puede requerir revisión legal y, en su caso, liberar el código derivado.
- Dependencia de la librería `ofoldx`: el modelo no es utilizable con frameworks estándar de HuggingFace Transformers; requiere la librería propietaria del proyecto OFoldX.
- Riesgo de sobreajuste a las etiquetas: la calidad del diseño depende de la correcta asignación de etiquetas de membrana por residuo; etiquetados erróneos pueden producir secuencias no plegables o incompatibles con la bicapa.
- Sin datos de benchmarks: no hay evidencia publicada en la información disponible sobre la calidad de recuperación de secuencia ni comparación con los checkpoints upstream.
- Sesgos de los datos de entrenamiento: la model card remite a LigandMPNN para la composición del dataset; no se detalla la cobertura taxonómica ni el balance de tipos de proteínas de membrana, lo que puede introducir sesgos hacia familias sobrerrepresentadas.
- Validación experimental necesaria: como todo modelo de diseño proteico, las secuencias generadas requieren validación in silico e in vitro antes de cualquier aplicación.
- Sin soporte lingüístico ni de agentes: no es un modelo de propósito general; no debe esperarse tool calling, razonamiento multi-paso ni capacidades conversacionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oteam/proteinmpnn-membrane-per-residue-noise020
- Variante global: https://huggingface.co/oteam/membranempnn-global
- Variante por residuo: https://huggingface.co/oteam/membranempnn-per-residue
- Código del modelo en OFoldX: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/membranempnn
- Documentación de pipelines de OFoldX: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- MPNN Packer: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/models/mpnn_packer/README.md
- Repositorio original LigandMPNN: https://github.com/dauparas/LigandMPNN
- Sección de modelos de membrana en LigandMPNN: https://github.com/dauparas/LigandMPNN#24---model_type-global_label_membrane_mpnn
- Paper de ProteinMPNN (Science, 2022): https://doi.org/10.1126/science.add2187
- Sitio web de OFoldX: https://ofoldx.valtech.ai/

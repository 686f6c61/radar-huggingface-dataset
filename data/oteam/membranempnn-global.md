# oteam/membranempnn-global

## Resumen

MembraneMPNN (variante `global`) es un modelo de diseño inverso de proteinas (inverse folding) condicionado por membrana, distribuido por el equipo OFoldX bajo el identificador `oteam/membranempnn-global`. Se trata de una implementacion no oficial de los checkpoints *membrane-conditioned* de ProteinMPNN liberados junto a LigandMPNN por el laboratorio de David Baker (dauparas/LigandMPNN). El modelo resuelve el problema de predecir la secuencia de aminoacidos compatible con un esqueleto proteico fijo (atomos N, CA, C y O), incorporando una etiqueta global binaria que indica si la proteina es soluble (0) o transmembrana (1).

Arquitectonicamente es una red de message passing sobre grafo espacial de residuos, con un encoder de 3 bloques y un decoder autorregresivo de 3 bloques, tamano oculto de 128 y 48 vecinos por nodo, sumando 1.691 millones de parametros. Su relevancia actual radica en que el diseño de proteinas de membrana es un caso especialmente dificil del inverse folding: las regiones enterradas en la bicapa lipidica tienen sesgos composicionales muy marcados (alta proporcion de residuos hidrofobicos, patrones de exposicion asimetricos) que los modelos solubles no capturan bien. Este checkpoint permite condicionar explicitamente el diseño a ese entorno.

El modelo se publica bajo licencia AGPL-3.0, con pesos en safetensors y dependencia de la libreria `ofoldx` para su ejecucion. Es un artefacto de investigacion, con cero descargas y cero likes en el momento de la consulta, y sin datos publicados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Message passing sobre grafo espacial de residuos (ProteinMPNN), encoder de 3 bloques + decoder autorregresivo de 3 bloques |
| Parametros totales | 1.690.744 (1,691 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del numero de residuos del esqueleto de entrada y del grafo de 48 vecinos) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF/INT8 documentadas) |
| Idiomas soportados | no aplica (modelo biologico, no linguistico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |
| Tamano oculto | 128 |
| Atomos de esqueleto | N, CA, C, O |
| Vecinos por nodo | 48 |
| Condicionamiento | Etiqueta global: 0 = soluble, 1 = transmembrana |
| Libreria | ofoldx |
| Pipeline tag | other |
| Tamano del repo | 0.0 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ProteinMPNN: cada residuo se representa como un nodo en un grafo k-NN espacial construido a partir de las coordenadas de los atomos de esqueleto N, CA, C y O, con 48 vecinos por nodo. Un encoder de 3 bloques de message passing propaga informacion geometrica local, y un decoder autorregresivo de 3 bloques genera la secuencia residuo a residuo en ordenes de decodificacion aleatorios, lo que permite estimar la verosimilitud de una secuencia dada promediando sobre multiples ordenes. El tamano oculto es de 128 dimensiones y el total de parametros es de 1.691 M, un modelo muy compacto en comparacion con los LLM actuales.

La innovacion respecto al ProteinMPNN original es el condicionamiento por membrana: en esta variante `global` se inyecta una etiqueta binaria (soluble/transmembrana) que se aplica a todos los residuos retenidos del esqueleto, permitiendo al decoder ajustar la composicion de aminoacidos al entorno lipidico. La generacion admite posiciones fijas, identidades ligadas, restricciones de aminoacidos por posicion y sesgos sobre logits. El entrenamiento se realizo para recuperar secuencias a partir de geometria y etiquetas de membrana; la model card remite a la documentacion upstream de LigandMPNN para los datos y la construccion de etiquetas, y no detalla el numero de tokens, la composicion del dataset ni si hubo RLHF/DPO (no aplicable en este dominio). OFoldX expone operaciones diferenciables `encode` y `forward` para fine-tuning con etiquetas de membrana, pero la orquestacion del entrenamiento queda a cargo de la aplicacion del usuario.

## Capacidades

- Diseño inverso de secuencias proteicas a partir de esqueletos fijos con atomos N, CA, C y O.
- Condicionamiento global por membrana: etiqueta 0 para proteinas solubles y 1 para transmembrana.
- Generacion autorregresiva con ordenes de decodificacion aleatorios (parametro `num_decoding_orders`).
- Soporte de posiciones fijas, identidades ligadas, restricciones de aminoacidos por posicion y sesgos de logits durante la generacion.
- Puntuacion de secuencias: devuelve NLL global y por residuo en nats por residuo, util para ranking de candidatos.
- Integracion con un MPNN Packer independiente para generar coordenadas de cadenas laterales tras el diseño (`MembraneMpnnDesignAndPackPipeline`).
- Ejecucion por etapas con `prepare`, `forward` y `postprocess` en pipelines de OFoldX.
- No soporta tool calling, agentes, vision, audio ni capacidades multilingues: es un modelo especifico de biologia estructural.

## Casos de uso

- Diseño de proteinas de membrana de novo: dado un esqueleto transmembrana generado por un modelo de difusion estructural, MembraneMPNN propone secuencias compatibles con la bicapa usando `membrane_labels=1`, algo que los modelos solubles no hacen de forma nativa.
- Rediseño de receptores acoplados a proteina G (GPCR) u otros receptores de membrana: fijando los residuos del sitio de union y dejando libres el resto, se pueden explorar variantes que mantengan la topologia transmembrana.
- Puntuacion y filtrado de candidatos: el pipeline `score` con `num_decoding_orders=8` calcula el NLL por residuo, permitiendo descartar diseños con baja verosimilitud antes de sintesis.
- Ingenieria de estabilidad de proteinas de membrana existentes: rediseño de superficies expuestas o interfaces manteniendo el nucleo enterrado, con restricciones por posicion para preservar residuos funcionales.
- Diseño condicionado por entorno en proteinas con regiones mixtas: combinado con la variante `per-residue`, se pueden etiquetar residuos enterrados, de interfaz y expuestos para esqueletos con topologias complejas.
- Generacion de librerias para cribado experimental: produccion de multiples secuencias por esqueleto con ordenes de decodificacion distintos para aumentar la diversidad de la libreria.
- Diseño y empaquetado completo: encadenar el diseñador con el MPNN Packer para obtener estructura con cadenas laterales y validar estericamente antes de la sintesis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 1,691 M de parametros en FP32 los pesos ocupan aproximadamente 6,8 MB, por lo que el cuello de botella es la memoria del grafo k-NN y no el modelo en si.
- GPU recomendadas: cualquier GPU con suficiente memoria para el grafo de la proteina; una RTX 4090, A100 o H100 son mas que suficientes para proteinas de tamano tipico.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna con varios GB de VRAM; el limite practico lo marca la longitud de la cadena y el numero de vecinos (48) del grafo.
- Opciones de despliegue: la libreria `ofoldx` (instalable via `pip install ofoldx`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del numero de residuos, del numero de ordenes de decodificacion y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Condicionamiento | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MembraneMPNN global (este) | 1,691 M | Etiqueta global soluble/transmembrana | Esqueleto N, CA, C, O; 48 vecinos | AGPL-3.0 | HuggingFace (oteam) |
| MembraneMPNN per-residue | no disponible | Etiquetas por residuo (0/1/2) | Esqueleto N, CA, C, O | AGPL-3.0 | HuggingFace (oteam) |
| ProteinMPNN (original) | no disponible en la informacion | Sin condicionamiento de membrana | Esqueleto N, CA, C, O | MIT (repositorio upstream) | GitHub dauparas/ProteinMPNN |
| LigandMPNN | no disponible en la informacion | Ligandos y contexto no proteico | Esqueleto + atomos de ligando | no disponible | GitHub dauparas/LigandMPNN |

## Limitaciones y advertencias

- Implementacion no oficial: la model card advierte explicitamente que el equipo que publico MembraneMPNN no escribio esta ficha; los pesos son una reimplementacion de OFoldX de los checkpoints de LigandMPNN.
- Licencia AGPL-3.0: es una licencia copyleft fuerte; el uso comercial en servicios en red puede obligar a liberar el codigo derivado. Revisar con el equipo legal antes de integrarlo en produccion.
- Sin datos de benchmarks publicados: no hay evidencia cuantitativa en la informacion disponible sobre calidad de recuperacion de secuencia frente a alternativas.
- Cero adopcion registrada (0 descargas, 0 likes) y creacion reciente: no hay validacion independiente de la comunidad.
- Riesgo de alucinacion estructural: como todo inverse folding, puede generar secuencias que no plieguen correctamente; se recomienda validacion con predictores de estructura (AlphaFold, ESMFold) y el MPNN Packer antes de sintesis.
- Sesgos de dataset: la composicion del entrenamiento no se detalla en esta ficha; los sesgos hacia proteinas sobrerrepresentadas en PDB pueden limitar el diseño de topologias raras.
- Dependencia de la libreria `ofoldx`: no hay soporte documentado para otros frameworks, lo que limita la portabilidad.
- Etiqueta global unica: la variante `global` aplica la misma etiqueta a todos los residuos, lo que puede ser insuficiente para proteinas con regiones solubles y transmembrana mezcladas; para esos casos existe la variante `per-residue`.
- Sin soporte multilingue, de vision ni de agentes: no es un modelo de proposito general.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oteam/membranempnn-global
- Variante per-residue: https://huggingface.co/oteam/membranempnn-per-residue
- Codigo del modelo en OFoldX: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/membranempnn
- Repositorio oficial de MembraneMPNN (LigandMPNN): https://github.com/dauparas/LigandMPNN
- Seccion upstream de checkpoints de membrana: https://github.com/dauparas/LigandMPNN#24---model_type-global_label_membrane_mpnn
- Guia de pipelines de OFoldX: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- MPNN Packer: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/models/mpnn_packer/README.md
- Documentacion de ofoldx: https://ofoldx.valtech.ai/
- Paper de ProteinMPNN (Science, 2022): https://doi.org/10.1126/science.add2187

# oteam/ligandmpnn-packer-noise002

## Resumen

LigandMPNN Packer (identificador `oteam/ligandmpnn-packer-noise002`) es un modelo de empaquetamiento de cadenas laterales de proteinas (*side-chain packing*) condicionado a un esqueleto fijo, una secuencia y, opcionalmente, contexto atomico no proteico. Lo desarrolla el equipo OFoldX (OTeam-AI4S) como implementacion no oficial del empaquetador publicado junto a LigandMPNN por Justas Dauparas y colaboradores del laboratorio de David Baker. Resuelve un problema concreto del diseno computacional de proteinas: dada una estructura de backbone y una secuencia, predecir las conformaciones de las cadenas laterales (angulos chi) de forma fisicamente plausible.

Tecnicamente es una red neuronal de paso de mensajes (*message passing*) de 3.591.140 parametros (3,591 M), con un codificador de 128 dimensiones ocultas, 3 bloques de codificador, 2 bloques de contexto atomico, 2 bloques de contexto y 3 bloques de decodificador. Para cada angulo chi predice una mezcla de von Mises de tres componentes, seguida de un refinamiento iterativo de coordenadas. El modelo no genera texto ni codigo: es un modelo cientifico de proposito especifico, empaquetado en la libreria `ofoldx` y distribuido en formato safetensors.

Su relevancia actual radica en que el empaquetamiento de cadenas laterales es un paso critico en pipelines de diseno de proteinas y de acoplamiento proteina-ligando, y este checkpoint concreto anade contexto atomico local (hasta 16 atomos de contexto, 32 vecinos) para condicionar el empaquetamiento a la presencia de ligandos u otras moleculas. El sufijo `noise002` del identificador sugiere una variante entrenada con un nivel de ruido de 0,002, aunque la model card no documenta explicitamente ese parametro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de paso de mensajes (MPNN) para prediccion de torsiones de cadenas laterales con refinamiento iterativo de coordenadas; hidden size 128, 3 bloques de codificador, 2 bloques de contexto atomico, 2 bloques de contexto, 3 bloques de decodificador |
| Parametros totales | 3.591.140 (3,591 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo opera sobre grafos de atomos con 32 vecinos y 16 atomos de contexto, no sobre tokens de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo biologico, no linguistico) |
| Licencia | AGPL-3.0-or-later |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una red neuronal de paso de mensajes sobre grafos de atomos. La representacion de contexto atomico local de LigandMPNN se usa para condicionar la prediccion: cada residuo atiende a 32 vecinos y hasta 16 atomos de contexto no proteico. La salida es una mezcla de von Mises de tres componentes por cada angulo chi de la cadena lateral, que se convierte en coordenadas mediante un proceso de refinamiento iterativo. El backbone y la secuencia permanecen fijos; solo se reconstruyen las cadenas laterales seleccionadas. La libreria `ofoldx` expone un `forward` diferenciable sobre un estado atom14 explicito con mascara de disponibilidad para entrenamiento con perdidas personalizadas, aunque no proporciona una funcion de perdida de empaquetamiento agregada.

El entrenamiento se realizo sobre estructuras proteicas con conformaciones de cadenas laterales observadas y, opcionalmente, contexto local de atomos no proteicos. La model card no especifica el numero de tokens, el volumen del dataset ni si se emplearon tecnicas de RLHF o DPO (no aplicables en este dominio). La construccion del dataset y la orquestacion completa del entrenamiento quedan a cargo de la aplicacion de entrenamiento, segun indica la documentacion. No se detalla el esquema de aumento de datos ni el significado exacto del sufijo `noise002`.

## Capacidades

- Prediccion de conformaciones de cadenas laterales (angulos chi) sobre un backbone proteico fijo.
- Empaquetamiento condicionado a secuencia: permite empaquetar una secuencia disenada pasando el `target` final del candidato.
- Condicionamiento por contexto atomico no proteico (hasta 16 atomos), lo que permite tener en cuenta ligandos u otras moleculas durante el empaquetamiento.
- Refinamiento iterativo de coordenadas tras la prediccion de la mezcla de von Mises.
- Salida con metricas de log-densidad de chi por prediccion.
- Ejecucion por etapas mediante `prepare`, `forward` y `postprocess` en el pipeline de `ofoldx`.
- Diferenciabilidad del `forward` para entrenamiento con perdidas personalizadas.
- No soporta generacion de texto, codigo, vision, audio, tool calling ni razonamiento multi-paso: es un modelo cientifico de proposito especifico.

## Casos de uso

- Refinamiento de estructuras en diseno de proteinas: tras un paso de diseno de secuencia (por ejemplo, con LigandMPNN), se empaquetan las cadenas laterales sobre el backbone fijo para obtener una estructura completa y evaluable energeticamente.
- Modelado de sitios de union proteina-ligando: el condicionamiento por contexto atomico permite empaquetar cadenas laterales alrededor de un ligando y estudiar colisiones estericas o contactos favorables.
- Reconstruccion de cadenas laterales en estructuras cristalograficas incompletas: dado un backbone con residuos sin coordenadas laterales, el modelo reconstruye conformaciones plausibles.
- Evaluacion de candidatos de diseno: al empaquetar la secuencia final (`target`) de cada candidato, se obtienen metricas de log-densidad de chi que ayudan a descartar disenos con torsiones improbables.
- Generacion de ensembles conformacionales: la mezcla de von Mises de tres componentes permite muestrear varias conformaciones por residuo para analisis de flexibilidad.
- Integracion en pipelines de diseno de farmacos: empaquetado de bolsas de union con ligandos pequenos como paso previo a docking o estimacion de energia.
- Docencia e investigacion en bioinformatica estructural: modelo pequeno (3,6 M de parametros) y reproducible para experimentar con empaquetamiento condicionado por contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja por el tamano del modelo (3,6 M de parametros, aproximadamente 14 MB en fp32); el cuello de botella real es la memoria para el grafo de atomos y las estructuras de entrada, no los pesos.
- GPU recomendadas: cualquier GPU moderna es suficiente; una RTX 4090, A100 o H100 sobredimensionan el modelo, que puede ejecutarse en GPU de gama baja o incluso en CPU para estructuras pequenas.
- Cabe en cualquier GPU consumer (GTX 1060, RTX 3060, etc.) y en CPU.
- Opciones de despliegue: la libreria `ofoldx` (instalable con `pip install ofoldx`) es la via documentada; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LigandMPNN Packer (este) | 3,591 M | 32 vecinos, 16 atomos de contexto | Side-chain packing con contexto atomico | AGPL-3.0-or-later | HuggingFace (`oteam/ligandmpnn-packer-noise002`) |
| LigandMPNN oficial (dauparas/LigandMPNN) | No disponible en la informacion | No disponible | Diseno de secuencia y empaquetamiento con contexto atomico | No disponible en la informacion | GitHub oficial |
| ProteinMPNN | No disponible en la informacion | No disponible | Diseno de secuencia sobre backbone | No disponible en la informacion | Repositorio oficial |
| Otros empaquetadores (p. ej. Rosetta Packer) | No aplica (metodo basado en fisica) | No aplica | Empaquetamiento de cadenas laterales | Licencia propia de Rosetta | Distribucion academica/comercial |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Implementacion no oficial: la model card advierte explicitamente de que el equipo autor de LigandMPNN no escribio esta model card ni valido este checkpoint; para uso critico conviene contrastar con el repositorio oficial.
- Requiere quimica compatible con la plantilla de geometria estandar seleccionada; modificaciones no soportadas o informacion quimica incompleta provocan errores distintos.
- Los atomos de cadena lateral sin prediccion del modelo (incluidos los hidrogenos) quedan con coordenadas no disponibles en las posiciones regeneradas.
- El backbone y la secuencia deben permanecer fijos; no es un modelo de diseno de secuencia ni de plegamiento.
- Licencia AGPL-3.0-or-later: impone obligaciones de copyleft fuerte, incluida la distribucion del codigo fuente si se ofrece el modelo como servicio en red; revisar la FAQ de licencia antes de uso comercial.
- No hay datos publicados de sesgos, tasas de alucinacion (no aplica en el sentido linguistico) ni evaluacion de robustez frente a backbones de baja calidad.
- El significado del sufijo `noise002` y su efecto sobre el rendimiento no esta documentado.
- El modelo tiene 0 descargas y 0 likes en HuggingFace en el momento de la consulta, por lo que carece de validacion comunitaria.
- No se especifican los idiomas ni el contexto en el sentido de LLM; las filas correspondientes de la tabla reflejan esa ausencia de datos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oteam/ligandmpnn-packer-noise002
- Codigo del modelo en OFoldX: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/mpnn_packer
- Repositorio OFoldX: https://github.com/OTeam-AI4S/OFoldX
- Guia de pipelines de OFoldX: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- Licencia: https://github.com/OTeam-AI4S/OFoldX/blob/main/license.md
- FAQ de licencia: https://github.com/OTeam-AI4S/OFoldX/blob/main/license-faq.md
- Issues de OFoldX: https://github.com/OTeam-AI4S/OFoldX/issues
- Paper de LigandMPNN (Nature Methods): https://doi.org/10.1038/s41592-025-02626-1
- Repositorio oficial de LigandMPNN: https://github.com/dauparas/LigandMPNN
- Sitio de OFoldX: https://ofoldx.valtech.ai/

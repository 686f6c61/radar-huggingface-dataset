# oteam/mpnn-packer

## Resumen

MPNN Packer es un modelo de empaquetado de cadenas laterales de proteinas (*side-chain packing*) desarrollado por el equipo OFoldX (OTeam-AI4S). Dado un esqueleto proteico fijo, una secuencia y, opcionalmente, contexto atomico local no proteico (como ligandos), el modelo predice las conformaciones de las cadenas laterales. Se trata de una reimplementacion no oficial del empaquetador publicado junto a LigandMPNN por el grupo de David Baker, y los pesos distribuidos en este repositorio forman parte del proyecto OFoldX.

El modelo es deliberadamente compacto: 3.591.140 parametros totales, con un *hidden size* de 128 y un total de 10 bloques (3 de encoder, 2 de contexto atomico, 2 de contexto y 3 de decoder). Aplica paso de mensajes sobre un grafo de vecinos (32 vecinos, 16 atomos de contexto) y predice una mezcla de von Mises de tres componentes para cada angulo chi de la cadena lateral, seguida de un refinamiento iterativo de coordenadas.

Su relevancia actual reside en que cubre una tarea especifica y critica en el diseno computacional de proteinas y farmacos: reconstruir cadenas laterales de forma coherente con un esqueleto y un entorno quimico dados. Al ser un modelo diminuto, puede ejecutarse en CPU y en GPU de consumo, lo que lo hace practico para pipelines de diseno de alto rendimiento donde el empaquetado se invoca miles de veces.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de paso de mensajes (message-passing) con bloques de encoder, contexto atomico, contexto y decoder; prediccion de mezcla de von Mises sobre angulos chi con refinamiento iterativo de coordenadas |
| Parametros totales | 3.591.140 (3,591 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (opera sobre grafos de 32 vecinos y 16 atomos de contexto; no es un modelo de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de estructura molecular, no linguistico) |
| Licencia | AGPL-3.0-or-later |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal de paso de mensajes sobre grafos de atomos, con un *hidden size* de 128. El modelo se compone de 3 bloques de encoder, 2 bloques de contexto atomico, 2 bloques de contexto y 3 bloques de decoder. Cada nodo considera 32 vecinos y hasta 16 atomos de contexto, lo que permite incorporar entorno no proteico (ligandos, iones, cofactores) en la prediccion. La salida es una mezcla de von Mises de tres componentes por cada angulo chi de la cadena lateral, que se convierte en coordenadas mediante un refinamiento iterativo. El esqueleto y la secuencia permanecen fijos; solo se reconstruyen las cadenas laterales seleccionadas.

El entrenamiento se realizo sobre estructuras proteicas con conformaciones de cadena lateral observadas y contexto atomico local no proteico opcional. La model card no especifica el numero de tokens, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO. OFoldX expone una funcion `forward` diferenciable sobre un estado atom14 explicito con mascara de disponibilidad para perdidas de entrenamiento personalizadas, pero no proporciona una funcion de perdida de empaquetado agregada: la construccion del dataset y la orquestacion completa del entrenamiento quedan a cargo de la aplicacion.

## Capacidades

- Prediccion de conformaciones de cadenas laterales de proteinas sobre un esqueleto fijo.
- Empaquetado condicionado por secuencia: permite empaquetar una secuencia disenada pasando el `target` final del candidato.
- Incorporacion de contexto atomico no proteico (ligandos, iones, cofactores) para empaquetado en entornos quimicos complejos.
- Prediccion de densidades logaritmicas de angulos chi como metrica de confianza.
- Refinamiento iterativo de coordenadas para mejorar la coherencia esterica.
- Soporte de ejecucion por etapas con `prepare`, `forward` y `postprocess` en el pipeline de OFoldX.
- Diferenciabilidad del `forward` sobre estado atom14 para entrenamiento con perdidas personalizadas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo linguistico.

## Casos de uso

- Diseno de proteinas de novo: tras generar un esqueleto y una secuencia candidata, el modelo reconstruye las cadenas laterales para evaluar la viabilidad esterica y quimica de la estructura antes de pasar a validacion experimental.
- Diseno de farmacos asistido por computacion: en el modelado de un ligando en un bolsillo proteico, el modelo empaqueta las cadenas laterales del sitio de union condicionadas por los atomos del ligando, permitiendo estimar contactos y conflictos estericos.
- Refinamiento de modelos estructurales: dado un modelo predicho por AlphaFold u otro predictor con cadenas laterales poco fiables, el esqueleto se fija y se reempaquetan las cadenas laterales para mejorar la calidad local.
- Prediccion de mutaciones: al empaquetar variantes de secuencia sobre el mismo esqueleto, se pueden comparar las densidades chi y detectar mutaciones que generan tension esterica.
- Pipelines de alto rendimiento de diseno: con solo 3,6 M de parametros, el modelo puede invocarse miles de veces en bucles de diseno en GPU de consumo o incluso en CPU, filtrando candidatos antes de costosas simulaciones de dinamica molecular.
- Integracion en flujos de biolog ia estructural: uso como etapa de postprocesado en herramientas que generan esqueletos proteicos, completando la estructura atomica completa para analisis posterior.
- Investigacion en representaciones de paso de mensajes: la API diferenciable permite usar el modelo como componente en el entrenamiento de modelos mayores de diseno proteico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (3,6 M de parametros); en la practica, el cuello de botella es el tamano del grafo de la proteina, no los pesos.
- GPU recomendadas: cualquier GPU moderna es suficiente; una RTX 4090 o A100 ofreceran el mayor throughput en lotes grandes, pero no son necesarias.
- Cabe en GPU de consumo: si, en cualquier GPU con al menos 1-2 GB de VRAM, e incluso en CPU para estructuras de tamano moderado.
- Opciones de despliegue: el modelo depende de la libreria `ofoldx` (`pip install ofoldx`) y su pipeline `pack`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MPNN Packer (OTeam) | 3,59 M | no disponible | Side-chain packing con contexto atomico | AGPL-3.0-or-later | HuggingFace (oteam/mpnn-packer) |
| LigandMPNN (oficial, Dauparas et al.) | no disponible | no disponible | Diseno de secuencia y empaquetado con contexto atomico | no disponible | GitHub (dauparas/LigandMPNN) |
| ProteinMPNN (Dauparas et al.) | no disponible | no disponible | Diseno de secuencia sobre esqueleto | no disponible | GitHub |

La comparativa se limita a la familia MPNN de la que deriva este modelo; no se dispone de datos de parametros ni rendimiento de las alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Es una implementacion no oficial: la model card la califica explicitamente como tal y el equipo de LigandMPNN no la ha revisado ni validado.
- Requiere quimica compatible con la plantilla de geometria estandar seleccionada; modificaciones no soportadas o informacion quimica incompleta generan errores.
- Los atomos de cadena lateral sin prediccion del modelo, incluidos los hidrogenos, quedan con coordenadas no disponibles en las posiciones regeneradas.
- No se documentan sesgos especificos, pero al entrenarse sobre estructuras del PDB puede heredar el sesgo de composicion y conformacion de dicho repositorio.
- Riesgo de alucinacion estructural: las conformaciones predichas son plausibles estadisticamente, no garantizadas; deben validarse con metricas estericas y, cuando sea posible, experimentalmente.
- La licencia AGPL-3.0-or-later impone obligaciones copyleft fuertes: el uso en servicios en red puede requerir la publicacion del codigo derivado; revisar la License FAQ del proyecto antes de uso comercial.
- No se especifican datos de entrenamiento, numero de tokens ni regimen de ajuste, lo que dificulta evaluar la cobertura y los sesgos del modelo.
- No es un modelo linguistico: no soporta generacion de texto, codigo, razonamiento ni capacidades multilingues.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oteam/mpnn-packer
- Codigo del modelo en OFoldX: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/mpnn_packer
- Guia del pipeline de OFoldX: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- Repositorio oficial de LigandMPNN: https://github.com/dauparas/LigandMPNN
- Paper de LigandMPNN (Nature Methods, 2025): https://doi.org/10.1038/s41592-025-02626-1
- Proyecto OFoldX: https://github.com/OTeam-AI4S/OFoldX
- Documentacion de OFoldX: https://ofoldx.valtech.ai/
- Licencia: https://github.com/OTeam-AI4S/OFoldX/blob/main/license.md
- FAQ de licencia: https://github.com/OTeam-AI4S/OFoldX/blob/main/license-faq.md
- Issues de OFoldX: https://github.com/OTeam-AI4S/OFoldX/issues

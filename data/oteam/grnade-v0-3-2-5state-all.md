# oteam/grnade-v0.3.2-5state-all

## Resumen

gRNAde es un modelo de aprendizaje profundo geometrico disenado para el diseno inverso de secuencias de ARN (RNA inverse folding): dada una o varias conformaciones 3D de la columna vertebral de una molecula de ARN, predice la secuencia de nucleotidos que la adopta. El modelo original fue desarrollado por Chaitanya K. Joshi y colaboradores, y esta ficha corresponde a una implementacion no oficial publicada por el equipo OFoldX bajo el identificador `oteam/grnade-v0.3.2-5state-all`.

La variante aqui descrita es la version v0.3.2 con configuracion de cinco estados conformacionales (5 states). Emplea un codificador basado en perceptron geometrico-vectorial (GVP) que combina hasta cinco conformaciones alineadas de la misma molecula, seguido de un decodificador autorregresivo de nucleotidos. Frente a la version v1, el grafo de la v0.3.2 elimina los canales de secuencia y de pares de bases, trabajando unicamente con geometria espacial.

Con 2.157.052 parametros (aproximadamente 2,16 millones), es un modelo muy compacto orientado a una tarea cientifica concreta y no a generacion de lenguaje general. Su relevancia radica en la capacidad de condicionar el diseno a multiples estados conformacionales, lo que permite obtener secuencias de ARN que estabilizan o acomodan distintos estados estructurales de interes terapeutico o de ingenieria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador GVP (geometric-vector perceptron) de 4 bloques + decodificador autorregresivo de 4 bloques |
| Parametros totales | 2.157.052 (2,157 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del tamano de la cadena de ARN de entrada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo biologico, no linguistico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |
| Tamano de nodo (escalar / vectorial) | 128 / 16 |
| Tamano de arista (escalar / vectorial) | 64 / 4 |
| Canales de arista de entrada | 131 |
| Estados conformacionales | 5 |
| Libreria | ofoldx |
| Pipeline | other (RNA design) |

## Arquitectura y entrenamiento

gRNAde combina un codificador geometrico-vectorial (GVP) con un decodificador autorregresivo de secuencia. El codificador procesa un grafo molecular cuyos nodos representan nucleotidos y cuyas aristas codifican relaciones espaciales; en la version v0.3.2 el grafo utiliza exclusivamente geometria espacial, sin canales de orden de secuencia ni de pares de bases secundarias, con 131 canales de arista de entrada. El modelo incorpora cuatro bloques de codificador y cuatro de decodificador, con representaciones nodales de 128 escalares y 16 vectores, y de arista de 64 escalares y 4 vectores.

La innovacion central es la capacidad de combinar multiples conformaciones alineadas de la misma molecula de ARN antes de predecir identidades. En esta variante de cinco estados, el modelo integra hasta cinco conformaciones para producir una secuencia que sea compatible con todas ellas. El entrenamiento se plantea como recuperacion autorregresiva de identidades de nucleotidos a partir del contexto estructural, con un valor de label smoothing de 0,05. La model card no detalla el corpus de entrenamiento, el numero de tokens ni la composicion del dataset, remitiendo a los articulos originales. No se especifica si hubo RLHF o DPO, algo esperable dado que no es un modelo de lenguaje.

## Capacidades

- Diseno inverso de secuencias de ARN a partir de una o varias conformaciones 3D de la columna vertebral.
- Condicionamiento multi-conformacional: integra hasta cinco estados estructurales alineados de la misma molecula.
- Generacion de multiples candidatos de secuencia con control de temperatura y numero de muestras.
- Puntuacion de secuencias candidatas (cada candidato incluye su diana molecular, registro de diseno y puntuaciones de secuencia).
- Manejo de estructuras en formato CIF mediante `read_structure` y especificacion de cadena mediante `instance_id`.
- Soporte de estructura secundaria en notacion dot-bracket para guiar el diseno.
- Entrenamiento y ajuste fino mediante `forward` con teacher forcing y la funcion de perdida `GrnadeLoss`.
- No soporta tool calling, agentes, vision ni capacidades linguisticas: su ambito es exclusivamente biologico-estructural.

## Casos de uso

- Diseno de aptameros de ARN: el modelo puede proponer secuencias que adopten una conformacion de union a un ligando concreto, partiendo de la estructura 3D del aptamero y usando la variante de cinco estados para cubrir conformaciones abierta y cerrada.
- Ingenieria de riboswitches: al condicionar sobre multiples estados conformacionales, permite disenar secuencias que transiten entre estados en respuesta a un efector, algo que un diseno de un solo estado no captura.
- Estabilizacion de estructuras de ARN terapeutico: dado el modelo 3D de un ARN mensajero o de un ARN guia, se generan variantes de secuencia que preservan el pliegue y potencialmente mejoran la estabilidad.
- Rediseno de motivos estructurales: para un motivo de ARN concreto (hairpin, pseudoknot, etc.), el modelo propone secuencias alternativas que mantienen la geometria, util para estudios de funcion-estructura.
- Generacion de bibliotecas de candidatos para cribado: con `num_candidates` y `temperature` se producen conjuntos de secuencias diversas que luego se filtran experimentalmente, reduciendo el espacio de busqueda.
- Ajuste fino sobre dianas propias: mediante `GrnadeLoss` y el `forward` diferenciable, un laboratorio puede reentrenar el modelo sobre su propio corpus de estructuras para adaptarlo a una familia de ARN especifica.
- Analisis de compatibilidad secuencia-estructura: puntuar secuencias existentes frente a una conformacion dada para evaluar cuanto se desvian del pliegue de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a los articulos originales de gRNAde para los datos de evaluacion, pero no incluye cifras concretas de recuperacion de secuencia, perplexidad ni comparaciones con otros metodos.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida; con 2,16 millones de parametros, el modelo cabe holgadamente en cualquier GPU consumer (incluso en CPU para cadenas cortas).
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; no requiere A100 ni H100. Una RTX 3060 o superior es mas que suficiente.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas e incluso en equipos de gama baja.
- Opciones de despliegue: la libreria `ofoldx` (instalable via `pip install ofoldx`), con pipeline `design` y ejecucion por etapas (`prepare`, `forward`, `postprocess`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependeran del numero de conformaciones, la longitud de la cadena y el numero de candidatos solicitados.

## Comparativa con modelos similares

| Modelo | Parametros | Estados conformacionales | Grafo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gRNAde v0.3.2 (5 states, all) | 2,157 M | 5 | Solo espacial (131 canales) | AGPL-3.0 | HuggingFace (oteam) |
| gRNAde v0.3.2 (1 state, all) | 2,157 M | 1 | Solo espacial (131 canales) | AGPL-3.0 | HuggingFace (oteam) |
| gRNAde v1 | 2,157 M | Multiples | Secuencia + pares de bases + espacial (132 canales) | AGPL-3.0 | HuggingFace (oteam) |
| gRNAde original (chaitjo) | No disponible | Multiples | No disponible | No disponible | GitHub oficial |

Las variantes comparten arquitectura y numero de parametros; la diferencia principal reside en el numero de conformaciones soportadas y en el tipo de grafo (v1 con canales de secuencia y pares de bases, v0.3.2 solo espacial). No se dispone de datos de rendimiento comparativo entre ellas en la informacion proporcionada.

## Limitaciones y advertencias

- Implementacion no oficial: la model card la declara explicitamente como UNOFFICIAL; el equipo original de gRNAde no la avala ni la ha revisado.
- Licencia AGPL-3.0: impone obligaciones de copyleft fuerte; el uso comercial en servicios en red requiere liberar el codigo derivado bajo la misma licencia. Revisar antes de integrar en productos propietarios.
- Ambito restringido: no es un modelo de lenguaje; no genera texto, no razona en lenguaje natural y no soporta tool calling ni agentes.
- Dependencia de la calidad estructural: el diseno depende de la precision de las conformaciones 3D de entrada; estructuras experimentales ruidosas o modelos predichos con error pueden degradar los resultados.
- Requisito de alineamiento: en el modo multi-conformacional, todas las conformaciones deben contener la misma secuencia de ARN y estar alineadas; el incumplimiento invalida el diseno.
- Riesgo de secuencias no funcionales: como todo metodo de diseno inverso, las secuencias generadas requieren validacion experimental; no hay garantia de plegamiento ni de funcion in vivo.
- Sesgos de datos: no se detalla la composicion del corpus de entrenamiento, por lo que se desconoce la cobertura de familias de ARN y el posible sesgo hacia estructuras sobrerrepresentadas.
- Sin datos de benchmarks publicados en la informacion disponible, lo que impide evaluar su rendimiento relativo de forma objetiva.
- Idiomas: no aplica; la model card no declara idiomas y el modelo no procesa texto natural.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oteam/grnade-v0.3.2-5state-all
- Variante v0.3.2 1 state (all): https://huggingface.co/oteam/grnade-v0.3.2-1state-all
- Variante v0.3.2 1 state (das): https://huggingface.co/oteam/grnade-v0.3.2-1state-das
- Variante v0.3.2 1 state (multi): https://huggingface.co/oteam/grnade-v0.3.2-1state-multi
- Variante v0.3.2 2 states (all): https://huggingface.co/oteam/grnade-v0.3.2-2state-all
- Variante v0.3.2 3 states (all): https://huggingface.co/oteam/grnade-v0.3.2-3state-all
- Variante v0.3.2 3 states (das): https://huggingface.co/oteam/grnade-v0.3.2-3state-das
- Variante v0.3.2 3 states (multi): https://huggingface.co/oteam/grnade-v0.3.2-3state-multi
- Variante v0.3.2 5 states (das): https://huggingface.co/oteam/grnade-v0.3.2-5state-das
- Variante v0.3.2 5 states (multi): https://huggingface.co/oteam/grnade-v0.3.2-5state-multi
- Variante v1: https://huggingface.co/oteam/grnade
- Checkpoint ODesign: https://huggingface.co/oteam/grnade-odesign
- Codigo en OFoldX: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/grnade
- Guia de pipelines OFoldX: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- Repositorio oficial de gRNAde: https://github.com/chaitjo/geometric-rna-design
- Articulo original (arXiv): https://arxiv.org/abs/2305.14749
- Preprint bioRxiv: https://www.biorxiv.org/content/10.1101/2025.11.29.691298
- Documentacion de ofoldx: https://ofoldx.valtech.ai/

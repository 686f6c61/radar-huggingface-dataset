# oteam/grnade-v0.3.2-1state-multi

## Resumen

gRNAde es un modelo de aprendizaje profundo geometrico disenado para el diseno inverso de secuencias de ARN (RNA inverse folding): dada una o varias conformaciones 3D de la columna vertebral de una molecula de ARN, predice la secuencia de nucleotidos que la estabiliza. Este checkpoint concreto, `oteam/grnade-v0.3.2-1state-multi`, es una implementacion no oficial publicada por el equipo OFoldX a partir del trabajo original de Chaitanya K. Joshi et al. (paper arXiv:2305.14749) y su version posterior en bioRxiv (2025).

El modelo emplea un codificador de perceptron vectorial geometrico (GVP) con cuatro bloques y un decodificador autorregresivo de nucleotidos, tambien de cuatro bloques, con un total de 2,157 millones de parametros. La variante "1state" condiciona el diseno a una unica conformacion, mientras que el sufijo "multi" indica que el checkpoint se entreno con ejemplos de multiples conformaciones alineadas del mismo ARN, lo que permite generalizar a disenos que deben plegarse correctamente en varios estados conformacionales.

Es relevante ahora porque el diseno de ARN terapeutico (aptameros, ribozimas, vacunas de ARNm, sensores) requiere secuencias que plieguen de forma fiable, y los metodos de diseno inverso basados en estructura estan desplazando a los heuristicos clasicos. La licencia AGPL-3.0 y la dependencia de la libreria `ofoldx` son los principales condicionantes practicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GVP encoder (4 bloques) + decoder autorregresivo de nucleotidos (4 bloques) |
| Parametros totales | 2.157.052 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del tamano de la estructura de ARN de entrada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo biologico; no procesa lenguaje natural) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |

Especificaciones adicionales del grafo:

| Parametro | Valor |
|---|---|
| Node scalar / vector size | 128 / 16 |
| Edge scalar / vector size | 64 / 4 |
| Input edge channels | 131 (v0.3.2) |
| Conformaciones de entrada | 1 (variante 1state) |
| Label smoothing | 0.05 |
| Libreria | ofoldx |

## Arquitectura y entrenamiento

gRNAde combina un codificador geometrico basado en GVP que procesa el grafo de la estructura del ARN (nodos = nucleotidos con geometria de fosforo, C4' y nitrogenos de base; aristas = relaciones espaciales) con un decodificador autorregresivo que genera la secuencia nucleotido a nucleotido. La version v0.3.2 del grafo utiliza exclusivamente caracteristicas espaciales, sin canales de secuencia ni de pares de bases, a diferencia de la v1, que incorporaba orden de secuencia, emparejamientos secundarios explicitos y geometria opcional.

El entrenamiento consiste en recuperar las identidades de los nucleotidos a partir del contexto estructural, con teacher forcing diferenciable y una funcion de perdida `GrnadeLoss` expuesta por `ofoldx`. Se aplico label smoothing de 0,05. El checkpoint "multi" se entreno con ejemplos de multiples conformaciones alineadas, aunque conserva el ajuste de una sola conformacion en el momento de la inferencia. Los detalles del corpus de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO) no estan disponibles en la informacion proporcionada; la model card remite a los papers originales.

## Capacidades

- Diseno inverso de secuencias de ARN a partir de estructura 3D de la columna vertebral.
- Condicionamiento por estructura secundaria mediante notacion dot-bracket.
- Generacion de multiples candidatos con control de temperatura (`num_candidates`, `temperature`).
- Diseno multi-conformacion: condicionar una secuencia a varias estructuras alineadas del mismo ARN (variantes multi y de varios estados).
- Puntuacion de secuencias candidatas (scores por candidato).
- Soporte de cadenas multiples dentro de una estructura via `instance_id`.
- Ejecucion por etapas (`prepare`, `forward`, `postprocess`) en pipelines de `ofoldx`.
- Entrenamiento y ajuste fino mediante `forward` diferenciable y `GrnadeLoss`.
- No soporta tool calling, agentes, vision, audio ni procesamiento de lenguaje natural.

## Casos de uso

- Diseno de aptameros de ARN: dada la estructura 3D del aptamero unido a su diana, generar secuencias candidatas que reproduzcan el plegamiento y permitan cribar afinidad experimentalmente.
- Optimizacion de ribozimas y ARN catalitico: redisenar la secuencia manteniendo el sitio activo estructural, con multiples candidatos a distintas temperaturas para explorar el espacio de secuencias.
- Estabilizacion de ARN mensajero terapeutico: usar la estructura secundaria objetivo (dot-bracket) para proponer secuencias con regiones 5' UTR o elementos estructurales mas estables.
- Diseno de sensores de ARN (riboswitches): condicionar a dos conformaciones (abierta y cerrada) para obtener secuencias que alternen entre ambos estados, aprovechando la variante multi-conformacion.
- Ingenieria de ARN no codificante: rediseno de secuencias manteniendo el pliegue funcional en contextos de edicion o síntesis.
- Ajuste fino en laboratorio: emplear `GrnadeLoss` y el `forward` diferenciable para reentrenar el modelo con datos propios de estructuras resueltas por cryo-EM o cristalografia.
- Cribado computacional previo: generar lotes de candidatos y priorizarlos por score antes de la validacion wet-lab, reduciendo el coste experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene solo 2,16 M de parametros, por lo que los pesos ocupan unos pocos MB; el cuello de botella es la memoria para el grafo de la estructura de ARN, no el modelo.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema. Tambien puede ejecutarse en CPU para estructuras pequenas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (GTX 1650 en adelante).
- Opciones de despliegue: la libreria `ofoldx` (instalable via `pip install ofoldx`) es la via oficial; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo biologico.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del tamano de la estructura y del numero de candidatos.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Conformaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gRNAde v0.3.2 1state multi (este) | 2,16 M | GVP + decoder autorregresivo | 1 | AGPL-3.0 | Hugging Face (oteam) |
| gRNAde v1 | 2,16 M | GVP + decoder con features de secuencia y pares de bases | 1 | AGPL-3.0 | Hugging Face (oteam/grnade) |
| gRNAde v0.3.2 3state multi | 2,16 M | GVP + decoder, grafo espacial | 3 | AGPL-3.0 | Hugging Face (oteam) |
| gRNAde v0.3.2 5state multi | 2,16 M | GVP + decoder, grafo espacial | 5 | AGPL-3.0 | Hugging Face (oteam) |

Las variantes comparten arquitectura y numero de parametros; difieren en el numero de conformaciones de entrenamiento y en el tipo de grafo (v1 con canales de secuencia y pares de bases, v0.3.2 solo espacial). No se dispone de datos de rendimiento comparativo entre ellas en la informacion proporcionada.

## Limitaciones y advertencias

- Implementacion no oficial: el equipo original de gRNAde no escribio esta model card; el checkpoint lo publica OFoldX. La validez de los resultados debe contrastarse con el repositorio oficial.
- Requiere la libreria `ofoldx`, lo que introduce dependencia de un ecosistema concreto y complica la portabilidad.
- Licencia AGPL-3.0: uso comercial permitido solo si se cumplen las obligaciones de copyleft (distribucion del codigo fuente derivado). Revisar con asesoria legal antes de integrarlo en productos propietarios.
- Riesgo de alucinacion estructural: el modelo puede generar secuencias con scores altos que no plieguen ni funcionen in vivo; toda prediccion requiere validacion experimental.
- Sesgos derivados del corpus de entrenamiento: sobrerrepresentacion de estructuras resueltas experimentalmente (ciertas familias de ARN, sesgo hacia estructuras cristalizables) y posible infrarepresentacion de ARN largos o flexibles.
- Limitacion de contexto: la longitud de secuencia disenable depende del tamano de la estructura de entrada; no se documentan limites maximos.
- La variante 1state no aprovecha informacion multi-conformacional en inferencia, aunque se haya entrenado con ella; para disenos dependientes de varios estados conviene usar las variantes 3state o 5state.
- No es un modelo de lenguaje: no procesa texto, no soporta tool calling ni agentes.
- Sin descargas ni likes en el momento de la consulta; comunidad practicamente inexistente, lo que reduce el soporte disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oteam/grnade-v0.3.2-1state-multi
- Variante v1: https://huggingface.co/oteam/grnade
- Checkpoint ODesign: https://huggingface.co/oteam/grnade-odesign
- Variantes v0.3.2 1state: [all](https://huggingface.co/oteam/grnade-v0.3.2-1state-all), [das](https://huggingface.co/oteam/grnade-v0.3.2-1state-das)
- Variantes v0.3.2 2state: [all](https://huggingface.co/oteam/grnade-v0.3.2-2state-all)
- Variantes v0.3.2 3state: [all](https://huggingface.co/oteam/grnade-v0.3.2-3state-all), [das](https://huggingface.co/oteam/grnade-v0.3.2-3state-das), [multi](https://huggingface.co/oteam/grnade-v0.3.2-3state-multi)
- Variantes v0.3.2 5state: [all](https://huggingface.co/oteam/grnade-v0.3.2-5state-all), [das](https://huggingface.co/oteam/grnade-v0.3.2-5state-das), [multi](https://huggingface.co/oteam/grnade-v0.3.2-5state-multi)
- Codigo en OFoldX: https://github.com/OTeam-AI4S/OFoldX/tree/main/ofoldx/models/grnade
- Guia de pipelines: https://github.com/OTeam-AI4S/OFoldX/blob/main/ofoldx/pipelines/README.md
- Paper original: https://arxiv.org/abs/2305.14749
- Paper 2025 (bioRxiv): https://www.biorxiv.org/content/10.1101/2025.11.29.691298
- Repositorio oficial: https://github.com/chaitjo/geometric-rna-design
- Documentacion de ofoldx: https://ofoldx.valtech.ai/

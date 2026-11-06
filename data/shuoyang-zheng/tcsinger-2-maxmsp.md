# shuoyang-zheng/TCSinger-2-MaxMSP

## Resumen

TCSinger-2-MaxMSP es una reproduccion no oficial del modelo TCSinger2 de sintesis de voz cantada (singing voice synthesis, SVS), publicada por el usuario shuoyang-zheng. El modelo se distribuye como un export de ExecuTorch pensado para ejecutarse dentro del entorno Max/MSP mediante el external neural.gen~, lo que lo orienta a la creacion musical interactiva y a la generacion de voz cantada en tiempo real desde un parche de Max. No se trata del checkpoint oficial de TCSinger2, sino de una reimplementacion entrenada por el autor sobre cuatro corpus publicos de canto: GTSinger, M4Singer, Opencpop y OpenSinger.

La relevancia de esta ficha es acotada: el repositorio no aporta informacion sobre arquitectura interna, numero de parametros, longitud de contexto ni resultados de evaluacion. El tag executorch indica que los pesos estan empaquetados para el runtime de PyTorch en dispositivos, y el tamano del repositorio (2,6 GB) sugiere un modelo de escala media, pero no permite deducir el conteo de parametros con precision. La licencia es MIT.

El modelo resuelve un problema concreto: permitir a usuarios de Max/MSP generar voces cantadas sinteticas dentro de un flujo de produccion musical, sin depender de infraestructura de inferencia en la nube. Quien busque un modelo de lenguaje o un sistema multimodal generalista no encontrara aqui lo que necesita; quien busque un motor SVS integrable en Max/MSP, si.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (reproduccion de TCSinger2; detalles no publicados en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos exportados a ExecuTorch) |
| Idiomas soportados | no disponible (los corpus de entrenamiento incluyen canto en mandarin e ingles, segun los datasets citados, pero el autor no lo declara) |
| Licencia | MIT |
| Formato de pesos | ExecuTorch (tag `executorch`); tamano del repo 2,6 GB |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. Se sabe que reproduce TCSinger2, un sistema de sintesis de voz cantada, y que se entreno sobre cuatro datasets publicos: GTSinger, M4Singer, Opencpop y OpenSinger. No se especifican el numero de tokens de audio, la composicion exacta del dataset, ni si se aplicaron tecnicas de ajuste como RLHF o DPO (poco habituales en SVS). Tampoco se detalla si emplea difusion, modelos autorregresivos o arquitecturas hibridas, ni innovaciones como decodificacion especulativa.

El unico dato tecnico firme es el formato de despliegue: los pesos estan exportados a ExecuTorch para su uso con el external neural.gen~ en Max/MSP/M4L. Esto implica que la inferencia se ejecuta en el runtime de ExecuTorch dentro del entorno de Max, con las limitaciones de operadores y precision que ese runtime impone. El autor remite al repositorio de GitHub para informacion adicional sobre el proceso de conversion y uso.

## Capacidades

- Sintesis de voz cantada (SVS): genera audio de canto a partir de partituras o controles de entrada, segun el flujo de neural.gen~.
- Integracion en Max/MSP/M4L: el modelo se consume como external dentro de un parche, lo que permite controlarlo con mensajes, secuenciadores y objetos de Max.
- Entrenamiento multilingue parcial: los corpus citados incluyen canto en mandarin (Opencpop, M4Singer) e ingles (GTSinger, OpenSinger), aunque el autor no declara oficialmente los idiomas soportados.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision ni audio de entrada.
- No se documenta modo thinking ni funciones especiales mas alla de la sintesis de canto.

## Casos de uso

- Produccion musical en Max/MSP: el modelo se carga mediante neural.gen~ y se controla desde el parche, lo que permite generar lineas vocales cantadas dentro de una sesion de Max sin salir del entorno.
- Prototipado rapido de ideas vocales: un compositor puede introducir una melodia y una letra y obtener una maqueta cantada para evaluar la direccion de un tema antes de contratar un cantante.
- Instalaciones sonoras interactivas: al ejecutarse en ExecuTorch dentro de Max, puede integrarse en obras generativas que reaccionen a sensores o a la interaccion del publico.
- Investigacion en SVS: sirve como checkpoint de referencia reproducible sobre GTSinger, M4Singer, Opencpop y OpenSinger para comparar resultados con el TCSinger2 oficial.
- Educacion musical y demostraciones: permite mostrar en un taller como funciona un sistema de sintesis de canto sin depender de servicios en la nube.
- Generacion de coros o armonias de relleno: util para crear capas vocales de acompanamiento en una mezcla, siempre que la calidad se valide en el contexto del proyecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el repositorio ocupa 2,6 GB, lo que da una cota superior aproximada del peso de los artefactos, pero no se especifica el consumo en inferencia.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; al ejecutarse via ExecuTorch dentro de Max/MSP, el rendimiento depende del backend que seleccione el external neural.gen~ (CPU, Metal u otro).
- Opciones de despliegue: ExecuTorch a traves del external neural.gen~ en Max/MSP/M4L; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo SVS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TCSinger-2-MaxMSP | SVS, export ExecuTorch | no disponible | no disponible | MIT | Hugging Face (reproduccion no oficial) |
| TCSinger2 oficial | SVS | no disponible en esta ficha | no disponible | no disponible en esta ficha | GitHub (AaronZ345/TCSinger2) |
| Otros sistemas SVS (p. ej. DiffSinger, VISinger) | SVS | no disponible en esta ficha | no disponible | no disponible en esta ficha | no verificado en esta busqueda |

La comparacion cuantitativa no es posible con la informacion disponible: no se han publicado parametros, contexto ni metricas para este checkpoint.

## Limitaciones y advertencias

- No es el checkpoint oficial de TCSinger2; los resultados pueden diferir de los del modelo original.
- Ausencia total de datos de arquitectura, parametros y evaluacion, lo que impide estimar calidad o coste computacional a priori.
- Dependencia fuerte del ecosistema Max/MSP y del external neural.gen~; no es un modelo de proposito general ni sustituye a un LLM.
- Los idiomas soportados no estan declarados oficialmente; el uso con letras en idiomas distintos de los de los corpus de entrenamiento puede degradar la calidad.
- Riesgo de artefactos y alucinacion en la pronunciacion o en la afinacion, inherente a los sistemas SVS, no cuantificado por el autor.
- Posibles sesgos derivados de los corpus de entrenamiento (voces, estilos y repertorios limitados), no documentados.
- Licencia MIT permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene verificar las licencias de los datasets de entrenamiento si se redistribuye el modelo.
- Repositorio con muy poca traccion (35 descargas, 0 likes) y sin mantenimiento documentado; tratar como experimental.

## Enlaces

- Hugging Face: https://huggingface.co/shuoyang-zheng/TCSinger-2-MaxMSP
- Repositorio del external Max/MSP: https://github.com/jasper-zheng/tcsinger2-maxmsp
- External neural.gen~: https://github.com/jasper-zheng/neural_tilde
- TCSinger2 oficial: https://github.com/AaronZ345/TCSinger2
- Dataset GTSinger: https://github.com/AaronZ345/GTSinger
- Dataset M4Singer: https://github.com/M4Singer/M4Singer
- Dataset Opencpop: https://github.com/wenet-e2e/opencpop
- Dataset OpenSinger: https://github.com/Multi-Singer/Multi-Singer.github.io

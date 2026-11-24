# gmxn/BioMedGPT-Mol

## Resumen

BioMedGPT-Mol es un modelo de lenguaje multimodal especializado en moleculas, desarrollado conjuntamente por PharMolix Inc. y el Institute of AI Industry Research (AIR) de la Universidad de Tsinghua. Esta disenado tanto para la comprension como para la generacion de moleculas, cubriendo tareas como conversion de nombres quimicos, descripcion de moleculas (molecular captioning), prediccion de propiedades, modelado de reacciones, edicion molecular y optimizacion de propiedades.

El modelo se construye sobre la familia Qwen3, segun indica la etiqueta `qwen3` del repositorio, y se entrena con un curriculo multitarea estructurado que combina datos de instrucciones moleculares de distinta naturaleza (SMolInstruction, OpenMolInstruct y MuMoInstruct). El repositorio incluye scripts de inferencia y evaluacion para estos tres conjuntos de datos, lo que facilita la reproducibilidad de los resultados.

La relevancia actual del modelo radica en su enfoque multitarea unificado para el descubrimiento de farmacos: en lugar de entrenar modelos separados para cada tarea quimica, BioMedGPT-Mol integra comprension y generacion molecular en un unico modelo. El informe tecnico esta disponible en arXiv (2512.04629), aunque el repositorio de Hugging Face no publica aun la model card completa con especificaciones detalladas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3 (segun etiqueta del repositorio) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La informacion disponible indica que BioMedGPT-Mol se apoya en la familia Qwen3, lo que sugiere una arquitectura transformer decoder-only. El modelo se entrena con un curriculo multitarea estructurado ("well-structured multi-task curriculum") que abarca tareas de comprension y generacion molecular. No se detallan en la model card el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

Los conjuntos de evaluacion incluidos en el repositorio (SMolInstruction, OpenMolInstruct y MuMoInstruct) corresponden a benchmarks publicos de instrucciones quimicas y generacion molecular, citados en la model card a traves de los papers LlaSMol (2402.09391), TOMG-Bench (2412.14642) y GeLLM3O (2502.13398). El informe tecnico completo esta en arXiv 2512.04629. No se especifican innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Comprension molecular: interpretacion de representaciones quimicas (SMILES, nombres quimicos) y extraccion de informacion estructural.
- Generacion molecular: creacion de moleculas nuevas a partir de descripciones textuales o restricciones de propiedades.
- Conversion de nombres quimicos: traduccion entre nombres sistematicos y representaciones estructurales.
- Molecular captioning: generacion de descripciones textuales de moleculas.
- Prediccion de propiedades: estimacion de propiedades fisicoquimicas y farmacologicas.
- Modelado de reacciones: prediccion de productos de reaccion y rutas sinteticas.
- Edicion molecular: modificacion controlada de estructuras existentes.
- Optimizacion de propiedades: ajuste de moleculas para mejorar propiedades objetivo (multi-propiedad, segun la referencia a GeLLM3O).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Descubrimiento de farmacos asistido: el modelo puede generar moleculas candidatas a partir de descripciones textuales de propiedades deseadas, lo que acelera la fase de ideacion en pipelines de drug discovery.
- Optimizacion de leads: dado un compuesto inicial, el modelo puede proponer ediciones estructurales orientadas a mejorar propiedades concretas (solubilidad, toxicidad, afinidad), reduciendo el numero de iteraciones experimentales.
- Prediccion de propiedades en cribado virtual: integrado en un pipeline de filtrado, el modelo estima propiedades fisicoquimicas de grandes librerias de compuestos antes de sintetizarlos.
- Modelado de reacciones quimicas: prediccion de productos de reaccion para planificacion sintetica, util en laboratorios de quimica medicinal que necesitan validar rutas antes de ejecutarlas.
- Normalizacion de datos quimicos: conversion de nombres sistematicos a SMILES (y viceversa) para homogeneizar bases de datos internas de compuestos.
- Generacion de descripciones para catalogos: molecular captioning para enriquecer fichas tecnicas y bases de datos con descripciones textuales automaticas de cada compuesto.
- Evaluacion comparativa de modelos quimicos: los scripts de evaluacion incluidos (SMolInstruction, OpenMolInstruct, MuMoInstruct) permiten reproducir benchmarks y comparar con otros modelos especializados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona "remarkable performance across diverse molecule-centric discovery benchmarks" pero no incluye cifras numericas ni tablas comparativas. Los scripts de evaluacion permiten generar `metrics.json` a partir de los conjuntos de test incluidos, pero los resultados no se reproducen en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se especifica el tamano de parametros).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el repositorio proporciona scripts de inferencia propios en `evaluation/scripts/`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BioMedGPT-Mol | no disponible | no disponible | Multitarea molecular (Qwen3) | no disponible | Hugging Face (gmxn/BioMedGPT-Mol) |
| LlaSMol | no disponible | no disponible | Instrucciones quimicas | no disponible | Referenciado en paper 2402.09391 |
| TOMG-Bench (modelos evaluados) | no disponible | no disponible | Generacion molecular abierta | no disponible | Referenciado en paper 2412.14642 |

No se dispone de datos de rendimiento comparativo entre BioMedGPT-Mol y estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card. Al entrenarse sobre datos quimicos, puede heredar sesgos de las bases de datos de origen (infrarrepresentacion de ciertas clases de compuestos).
- Riesgo de alucinacion: en generacion molecular, el modelo puede producir SMILES invalidos o moleculas quimicamente inestables; es imprescindible validar las salidas con herramientas quimicas (RDKit u equivalentes) antes de cualquier uso experimental.
- Limitaciones de contexto o idioma: no disponibles; la model card no especifica longitud de contexto ni idiomas.
- Restricciones de licencia: la licencia no esta indicada en el repositorio, por lo que no se puede confirmar si el uso comercial esta permitido. Es necesario contactar con los autores antes de un despliegue en produccion.
- Caveats para produccion: el repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un lanzamiento reciente sin validacion independiente por parte de la comunidad. El tamano del repo es de 0.0 GB, lo que indica que los pesos no estan subidos en el momento de la consulta; habria que descargarlos de otra fuente o esperar su publicacion.
- Madurez del ecosistema: no hay integracion documentada con frameworks de inferencia estandar, lo que anade coste de ingenieria para su despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/gmxn/BioMedGPT-Mol
- Informe tecnico: https://arxiv.org/pdf/2512.04629
- Paper LlaSMol: https://arxiv.org/abs/2402.09391
- Paper TOMG-Bench: https://arxiv.org/abs/2412.14642
- Paper GeLLM3O: https://arxiv.org/abs/2502.13398
- Plataforma OpenBioMed: https://github.com/PharMolix/OpenBioMed

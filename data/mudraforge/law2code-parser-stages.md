# MudraForge/law2code-parser-stages

## Resumen

`law2code-parser-stages` es un conjunto de pesos neuronales (no un modelo de lenguaje generativo) publicado por MudraForge como parte de su compilador estatutario neuro-simbolico `law2code`, en su version `v6.1.0-prod` (especificacion `MF-SPEC-S1-V6.1.0`). El repositorio agrupa cuatro etapas de parsing que transforman texto legal en estructuras jerarquicas y, finalmente, en AST y codigo Catala. El paquete incluye los checkpoints de las etapas 1, 1.5, 2 y 2B, junto con un banco de prototipos en JSON para aprendizaje continuo.

La relevancia del artefacto reside en su enfoque: separa el trabajo neural (parsing de no operadores, identificacion de operandos, delimitacion de clausulas y refinamiento de fronteras) de la logica simbolica determinista (critico de reflexion y emisor Catala/AST), que se ejecuta fuera de estos pesos. El autor reporta metricas internas muy altas en su corpus propio, aunque no se han publicado detalles sobre el corpus, la arquitectura exacta de cada etapa ni comparaciones con terceros.

El repositorio ocupa 0,1 GB, esta etiquetado como `pytorch` y se distribuye bajo licencia Apache 2.0. No hay pipeline declarado, no consta informacion de idiomas soportados y el modelo registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (cuatro etapas neuronales independientes; el autor las describe como parser jerarquico, especialista de operandos, especialista geometrico de clausulas y refinador de fronteras; no se especifica la familia de red) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en formato `.pt` de PyTorch) |
| Idiomas soportados | No disponible (las etiquetas mencionan `catala`, que es el lenguaje de programacion legal de destino, no un idioma natural declarado) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `.pt` (checkpoints) y JSON (banco de prototipos `stage1_5_leaf_prototypes_v2.json`) |

## Arquitectura y entrenamiento

El autor describe un pipeline neuro-simbolico en el que las etapas neuronales se encargan del parsing y la etapa final (Stage 3, "Reflexion Critic & Catala/AST Emitter") es determinista y simbolica, ejecutandose sobre las salidas de las anteriores. Las cuatro etapas neuronales son: Stage 1, un parser de arbol jerarquico de no operadores con 37 etiquetas; Stage 1.5, un especialista de operandos Catala con una compuerta de entropia conformal (umbral `H >= 0.50`) y un banco de memoria de prototipos para aprendizaje continuo (`teach-leaf`); Stage 2, un especialista geometrico de alcance de clausulas con las categorias `COND`, `EXCEPTION`, `RULE_EFFECT` e `INLINE_DEF`; y Stage 2B, un refinador de fronteras de clausula basado en punteros.

El autor menciona aprendizaje continuo (etiqueta `continual-learning`) y un mecanismo de memoria de prototipos, pero no detalla la composicion del dataset de entrenamiento, el numero de tokens, ni si hubo RLHF, DPO o ajuste supervisado convencional. Tampoco especifica la arquitectura interna de cada red (transformer, CNN, GNN u otra). El nombre `stage2_refiner_noppo_v2_full.pt` sugiere que el refinador no usa PPO, pero no se aporta mas contexto. No hay informacion sobre la innovacion tecnica de decodificacion ni sobre el preentrenamiento base.

## Capacidades

- Parsing de estructuras legales: identificacion de arboles jerarquicos de no operadores con 37 etiquetas atomicas (Stage 1).
- Extraccion de operandos en el lenguaje Catala y gestion de ambiguedad mediante compuerta de entropia conformal (Stage 1.5).
- Aprendizaje continuo de nuevos prototipos de hojas (`teach-leaf`) mediante banco de memoria en JSON.
- Delimitacion geometrica del alcance de clausulas en cuatro categorias: condicion, excepcion, efecto de regla y definicion en linea (Stage 2).
- Refinamiento de fronteras de clausula con punteros (Stage 2B).
- Generacion de AST y codigo Catala mediante una etapa simbolica determinista posterior, no incluida en estos pesos.
- Aplicacion de una compuerta de autorizacion (`isAuthorizedToDisburse: false`) en la etapa simbolica.
- No se documentan capacidades de generacion de texto libre, razonamiento general, codigo fuera del dominio legal, matematicas, vision, audio, tool calling ni agentes multi-paso.

## Casos de uso

- Compilacion de estatutos a Catala: el pipeline transforma texto legal en AST y codigo Catala ejecutable, con las etapas neuronales resolviendo la estructura y la etapa simbolica emitiendo el codigo. Es el caso de uso principal declarado por el autor.
- Auditoria de contratos y clausulas: Stage 2 y 2B permiten aislar condiciones, excepciones y efectos de regla con fronteras de clausula refinadas, lo que facilita la revision por partes de un documento legal largo.
- Extraccion de definiciones en linea: la categoria `INLINE_DEF` de Stage 2 permite localizar definiciones incrustadas en el texto, util para construir glosarios normativos automatizados.
- Control de calidad de corpus legales: el parser de arbol de no operadores (Stage 1) puede usarse para validar la estructura jerarquica de documentos antes de indexarlos en un sistema de recuperacion.
- Aprendizaje continuo de terminologia: el banco de prototipos y el mecanismo `teach-leaf` permiten incorporar nuevas hojas o conceptos sin reentrenar todo el pipeline, util en dominios regulatorios que cambian con frecuencia.
- Investigacion en neuro-simbolico legal: el artefacto sirve como referencia reproducible para estudiar la separacion entre parsing neuronal y emision simbolica en compiladores de normativa.
- Preprocesado para sistemas de compliance: la deteccion de condiciones y excepciones puede alimentar motores de reglas que evaluen obligaciones sobre transacciones, con la salvedad de que la etapa de autorizacion se mantiene en `false` por diseno.

## Benchmarks y rendimiento

| Etapa | Metrica reportada por el autor | Valor |
|---|---|---|
| Stage 1 | F1 sobre corpus completo | 99,17 % |
| Stage 1 | F1 OOF con 5 folds | 91,97 % |
| Stage 2 | F1 IoU50 | 97,05 % |
| Stage 2B | Ganancia de F1 exacto | +7,20 puntos hasta 94,93 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las cifras anteriores son metricas internas del autor sobre su propio corpus y no son comparables con las de modelos de lenguaje generales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,1 GB, pero no se especifica el numero de parametros de cada checkpoint ni el pico de memoria durante la ejecucion.
- GPU recomendadas: no disponible. Al ser pesos PyTorch sin cuantizacion documentada, se requiere una GPU compatible con PyTorch; no se indica un minimo.
- Cabe en GPU de consumo: no se puede confirmar sin conocer el tamano de los checkpoints; el tamano total del repositorio (0,1 GB) sugiere que los pesos son pequenos, pero no se detalla la memoria de activaciones.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al no ser un modelo generativo, estas herramientas no aplican directamente. El despliegue requiere cargar los `.pt` con PyTorch y ejecutar la etapa simbolica por separado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de parsing legal neuro-simbolico con las mismas etapas ni con metricas publicadas en el mismo corpus.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto libre ni responde a instrucciones; su uso esta restringido al pipeline `law2code`.
- Las metricas (99,17 % F1, 97,05 % IoU50, 94,93 % F1 exacto) proceden del corpus propio del autor y no han sido verificadas de forma independiente; el F1 OOF de 91,97 % en Stage 1 sugiere una brecha notable respecto al resultado sobre el corpus completo.
- No se documenta la composicion del dataset de entrenamiento, lo que impide evaluar sesgos, cobertura idiomatica o generalizacion a otras jurisdicciones.
- El idioma natural de los textos legales soportados no esta declarado; la etiqueta `catala` se refiere al lenguaje de programacion de destino.
- Riesgo de alucinacion estructural: al ser un parser, puede producir arboles o fronteras de clausula incorrectas en textos fuera de distribucion, y la etapa simbolica posterior no corrige errores de parsing.
- La compuerta de entropia conformal (`H >= 0.50`) puede rechazar operandos legitimos en textos con terminologia nueva, lo que derivaria en perdida de informacion si no se revisa manualmente.
- La licencia Apache 2.0 permite uso comercial, pero no se ofrece garantia ni soporte; el estado `isAuthorizedToDisburse: false` indica que el autor no autoriza el desembolso automatico basado en las salidas.
- Sin pipeline declarado, sin descargas y sin documentacion de versiones: el artefacto esta en un estado muy inicial y su mantenimiento futuro no esta garantizado.
- No se especifican requisitos de hardware ni latencias, lo que dificulta planificar un despliegue en produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/MudraForge/law2code-parser-stages
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios de codigo o demos.

# a-hernandez/coilstellaration-net-lm

## Resumen

Coilstellaration-net-lm es un modelo neuronal especializado en el diseno de bobinas (coils) para reactores de fusion de tipo stellarator, desarrollado por a-hernandez y publicado bajo licencia MIT. No es un modelo de lenguaje generativo al uso, sino una red especifica por bobina que propone un coilset y lo refina dentro del mismo grafo computacional mediante un optimizador Levenberg-Marquardt, evaluado contra cuatro objetivos fisicos del benchmark CoilStellaration.

La arquitectura y el entrenamiento derivan del trabajo de Proxima Fusion (proximafusion/coilstellaration, tambien MIT), reentrenado sobre el split de entrenamiento del benchmark. El modelo se distribuye como un unico fichero ONNX y consume como entrada una frontera de plasma, cuatro objetivos, el numero de periodos de campo y el numero de bobinas, devolviendo un coilset conforme a lo que exige el benchmark.

Su relevancia es acotada pero concreta: aborda un problema de optimizacion fisica de alta dimensionalidad (geometria de bobinas en stellarators) con un enfoque hibrido red + optimizador clasico embebido en el grafo. El autor reporta, sobre 2.000 instancias de fronteras de entrenamiento retenidas, una factibilidad estricta de 0,7385 y una puntuacion media de 0,8699. No hay informacion sobre arquitectura interna detallada, numero de parametros ni contexto, al tratarse de un modelo de dominio cientifico y no de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal por bobina con optimizador Levenberg-Marquardt integrado en el mismo grafo (detalles de capas no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de diseno fisico, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | MIT |
| Formato de pesos | ONNX (un unico fichero) |

## Arquitectura y entrenamiento

El modelo combina una red neuronal que propone un coilset por bobina con un optimizador Levenberg-Marquardt ejecutado dentro del mismo grafo. La optimizacion se detiene en el primer paso cuyas bobinas superan una comprobacion sobre las rejillas del propio scorer, o al alcanzar un limite fijo de pasos. Como caso de respaldo, si bobinas circulares simples ya cumplen los objetivos, se devuelven estas en lugar del resultado de la red. Esta hibridacion red + optimizador clasico es la innovacion tecnica central: la red aporta un punto de partida informado y el optimizador garantiza el ajuste fino contra los cuatro objetivos fisicos.

El diseno y el entrenamiento se portan de proximafusion/coilstellaration (MIT, Copyright (c) 2026-present Proxima Fusion GmbH) y se reentrenan sobre el split de entrenamiento del benchmark. La model card no detalla el numero de tokens ni la composicion del dataset (no aplica), ni si hubo RLHF/DPO. El autor declara explicitamente que el split de evaluacion del benchmark no se uso en entrenamiento, ajuste ni seleccion de modelo, y que la validacion de las cifras reportadas se hizo sobre 2.000 instancias de fronteras de entrenamiento retenidas y nunca ajustadas.

## Capacidades

- Diseno de coilsets para stellarators: dada una frontera de plasma, cuatro objetivos, el numero de periodos de campo y el numero de bobinas, devuelve un coilset.
- Refinamiento iterativo integrado: el optimizador Levenberg-Marquardt dentro del grafo ajusta las bobinas contra los cuatro objetivos hasta cumplir la comprobacion o alcanzar el limite de pasos.
- Fallback a bobinas circulares: si la solucion trivial (bobinas circulares) ya satisface los objetivos, se devuelve esa en lugar del resultado de la red.
- Declaracion de ambas pistas (tracks) del benchmark CoilStellaration.
- Inferencia autocontenida: un unico fichero ONNX, sin dependencias de pipeline adicionales mas alla del runtime ONNX.
- No soporta tool calling, agentes, razonamiento multi-step general ni capacidades multilingues; es un modelo de dominio cientifico especifico.

## Casos de uso

- Exploracion de disenos de stellarator en fase de investigacion: el modelo genera coilsets factibles para una geometria de plasma dada, lo que permite a un equipo de fusion evaluar rapidamente configuraciones candidatas antes de pasar a simulaciones de mayor fidelidad.
- Punto de partida para optimizacion de mayor fidelidad: el coilset devuelto puede usarse como inicializacion de codigos de optimizacion magnetica mas costosos, reduciendo el numero de iteraciones necesarias.
- Generacion de datasets sinteticos de bobinas: al ejecutarse como ONNX y devolver coilsets con factibilidad reportada del 0,7385 sobre instancias retenidas, sirve para poblar conjuntos de entrenamiento de modelos sustitutos (surrogates).
- Integracion en pipelines automatizados de evaluacion del benchmark CoilStellaration: al declarar ambas pistas y exponer una interfaz ONNX unica, se puede encadenar en scripts de evaluacion por lotes.
- Prototipado rapido en entornos con recursos limitados: al ser un unico fichero ONNX de un repositorio de 0,0 GB, es desplegable en CPU o GPU modesta sin infraestructura de servido de modelos grande.
- Reproducibilidad y comparacion de metodos: al derivar de proximafusion/coilstellaration y reentrenarse sobre el split de entrenamiento, permite comparar la variante de a-hernandez con el modelo original bajo la misma licencia MIT.

## Benchmarks y rendimiento

Resultados reportados por el autor, comprobados el 2026-11-18 antes de la subida, sobre 2.000 instancias de fronteras de entrenamiento retenidas y nunca ajustadas:

| Metrica | Valor |
|---|---|
| Factibilidad estricta (strict feasibility) | 0,7385 |
| Puntuacion media (mean score) | 0,8699 |

No se han publicado en la informacion disponible resultados comparativos frente a otros modelos del benchmark (por ejemplo, el modelo original de Proxima Fusion) ni metricas adicionales como MMLU, HumanEval o GSM8K, que no aplican a este dominio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0,0 GB y es un unico fichero ONNX, por lo que el modelo es muy ligero.
- GPU recomendadas: no disponibles. Por el tamano del artefacto, es probable que funcione en CPU y en GPU consumer, pero la informacion proporcionada no lo confirma.
- ¿Cabe en GPU consumer? No confirmado; el tamano del fichero sugiere que si, pero no hay datos oficiales.
- Opciones de despliegue: runtime ONNX (ONNX Runtime) es la via natural dado el formato de pesos; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| a-hernandez/coilstellaration-net-lm | Red + optimizador Levenberg-Marquardt (ONNX) | no disponible | no aplica | MIT | Hugging Face |
| proximafusion/coilstellaration | Red + optimizador (modelo original del que deriva) | no disponible | no aplica | MIT | Referenciado en la model card |

No se dispone de datos de rendimiento del modelo original de Proxima Fusion en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa. No se conocen otros modelos comparables en la informacion disponible.

## Limitaciones y advertencias

- Dominio muy restringido: solo resuelve el problema de diseno de coilsets del benchmark CoilStellaration; no es un modelo de proposito general ni de lenguaje.
- Factibilidad no perfecta: la factibilidad estricta reportada es 0,7385, lo que implica que aproximadamente una de cada cuatro instancias retenidas no cumple estrictamente los objetivos.
- Dependencia de la comprobacion del scorer: el criterio de parada se basa en las rejillas del propio scorer, por lo que el comportamiento puede variar si se evalua con otra implementacion.
- Sin informacion sobre sesgos: al ser un modelo fisico, no aplican los sesgos linguisticos habituales, pero no hay datos sobre sesgos de dominio (por ejemplo, hacia ciertas geometrias de plasma).
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero si existe riesgo de devolver coilsets fisicamente invalidos que superen la comprobacion del scorer sin ser utiles en la practica.
- Restricciones de licencia: MIT permite uso comercial, pero se debe conservar el aviso de copyright de Proxima Fusion GmbH al derivar del modelo original.
- Sin garantias de produccion: el autor valida solo sobre 2.000 instancias de entrenamiento retenidas; no se reportan resultados sobre el split de evaluacion del benchmark, por lo que el rendimiento fuera de la distribucion de entrenamiento no esta cuantificado.
- Ausencia de idiomas y contexto: no es un modelo de texto, por lo que cualquier evaluacion como modelo de lenguaje carece de sentido.

## Enlaces

- Hugging Face: https://huggingface.co/a-hernandez/coilstellaration-net-lm
- Modelo original referenciado: proximafusion/coilstellaration (MIT, Copyright (c) 2026-present Proxima Fusion GmbH); no se proporciona URL directa en la informacion disponible.
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.

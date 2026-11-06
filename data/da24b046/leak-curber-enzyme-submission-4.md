# da24b046/leak-curber-enzyme-submission-4

## Resumen

`leak-curber-enzyme-submission-4` es un modelo de clasificacion de reacciones quimicas orientado a la prediccion de numeros EC (Enzyme Commission) completos a partir de SMILES de reaccion. Lo desarrolla el usuario `da24b046` y se publica bajo licencia MIT. No es un modelo de lenguaje: es un sistema hibrido de red neuronal sobre grafos (GNN) con una rama de huellas estructurales (fingerprints) que opera sobre representaciones de moleculas y reacciones, no sobre texto libre.

El modelo resuelve un problema concreto de bioinformatica y quimica computacional: dada una reaccion quimica descrita como `rxn_smiles`, asignar una clase EC completa (nivel L4, cuatro digitos) dentro de un vocabulario cerrado de 6.939 clases permitidas. Combina un paso de mensajes consciente de enlaces (bond-aware message passing) de 3 capas y anchura 64 con descriptores DRFP de 4.096 bits y Morgan de 2.048 bits por lado de la reaccion, proyectados conjuntamente y fusionados con la representacion del grafo.

Su relevancia es practica: el autor reporta en su test local reutilizado un 62,59% de acierto top-1 a nivel L4, un 86,46% a L3, un 89,42% a L2 y un 93,51% a L1. El modelo se distribuye con un runtime de inferencia en CPU basado en NumPy y RDKit, sin PyTorch ni GPU, lo que facilita su despliegue en entornos restringidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GNN hibrida: message passing bond-aware + rama de fingerprints (DRFP 4.096 bits + Morgan 2.048 bits por lado) + clasificador MLP |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada: SMILES de reaccion; limite de 1.024 atomos por molecula y 1.536 atomos por lado) |
| Tipos de cuantizacion | no disponible (runtime float32 en CPU) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT (la declaracion de software no relicencia datos ni vocabulario) |
| Formato de pesos | no disponible (runtime propio con NumPy + RDKit; sin safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura se compone de tres bloques. Primero, embeddings de atomos entrenables que codifican numero atomico, grado total, carga formal, numero de hidrogenos, hibridacion, estereoquimica CIP R/S, aromaticidad, pertenencia a anillo e isotopo. Las aristas son bidireccionales y codifican orden de enlace, estereoquimica, conjugacion y pertenencia a anillo. El paso de mensajes compartido tiene anchura 64 y 3 capas: cada actualizacion promedia mensajes ReLU de estado-fuente mas enlace, los concatena con el estado del nodo, aplica una capa lineal aprendida y normalizacion por nodo, y anade residual y ReLU.

Tras el paso de mensajes, se suman los estados de nodo por molecula y se agregan las ocurrencias de componentes en los lados izquierdo y derecho de la reaccion; los reactivos se unen a los reactantes. Se combinan medias por lado, diferencias de sumas normalizadas (con signo y en valor absoluto) y logaritmos de conteos atomicos. El clasificador tiene anchuras ocultas 512/256 y una cabeza de salida EC. La funcion de perdida es entropia cruzada con objetivos suaves que reparten masa igual entre cada EC completa registrada por reaccion; las cabezas auxiliares L1/L2/L3 tienen peso total 0,2 y se descartan en despliegue. La rama de fingerprints esta activa: 4.096 bits DRFP mas 2.048 bits Morgan izquierda/derecha pasan por una proyeccion aprendida de 512 unidades y se unen a la representacion del grafo. Todo se entrena desde cero conjuntamente.

El entrenamiento usa un split exacto de reaccion 80/10/10 identico en bytes al de entregas anteriores: 50.624 de entrenamiento, 6.328 de desarrollo y 6.328 de test, semilla 2202, manteniendo juntas todas las etiquetas de una reaccion. Los pesos finales se reentrenan durante 62 epocas sobre las 63.280 reacciones publicas de entrenamiento (96.966 pares reaccion-EC distintos). El autor advierte que este test ya se uso en experimentos previos y no constituye evidencia independiente ni una separacion por familia quimica.

## Capacidades

- Clasificacion de reacciones quimicas en numeros EC completos (L4) dentro de un vocabulario cerrado de 6.939 clases permitidas.
- Prediccion jerarquica auxiliar a niveles L1, L2 y L3 durante el entrenamiento (descartada en despliegue).
- Procesamiento de SMILES de reaccion arbitrarios: los grafos atomicos se calculan en inferencia, no se buscan por ID de validacion.
- Manejo de componentes invalidos: producen grafos vacios y aun asi reciben una prediccion valida.
- Cotas de seguridad: maximo 1.024 atomos por molecula y omision de componentes que superen 1.536 atomos por lado.
- Entrada en Parquet con columnas `id` y `rxn_smiles`; salida en JSONL con exactamente `id` y `prediction`.
- No soporta tool calling, agentes, vision, audio ni capacidades multilingues: no es un modelo generativo de lenguaje.

## Casos de uso

- Anotacion automatica de enzimas en bases de datos: dado un conjunto de reacciones sin numero EC, el modelo asigna una clase EC completa candidata para revision manual, reduciendo el trabajo de curacion en catalogos metabolicos.
- Priorizacion en pipelines de descubrimiento de enzimas: al procesar reacciones candidatas, el modelo filtra las que probablemente pertenecen a una clase EC de interes antes de validacion experimental.
- Enriquecimiento de datasets metabolicos: integrado en un script por lotes que lee Parquet y escribe JSONL, permite etiquetar reacciones historicas con EC predichos para analisis posteriores.
- Pre-filtrado en herramientas de biologia sintetica: al disenar rutas metabolicas, el modelo sugiere la clase EC de cada paso para buscar enzimas compatibles en repositorios publicos.
- Control de calidad de anotaciones existentes: comparar la prediccion del modelo con la etiqueta registrada permite detectar posibles errores o ambiguedades de anotacion en reacciones concretas.
- Despliegue en entornos sin GPU: el runtime en CPU con NumPy y RDKit, sin descargas de red ni ficheros de entrenamiento, encaja en contenedores Docker restringidos o en servidores sin aceleradores.
- Analisis exploratorio de distribucion de clases EC: agregando predicciones sobre un corpus de reacciones se obtiene una estimacion de la composicion funcional del conjunto.

## Benchmarks y rendimiento

Resultados del autor en el test local reutilizado (top-1 fraccional, no puntuaciones oficiales de leaderboard):

| Modelo en test local identico | L4 | L3 | L2 | L1 |
|---|---:|---:|---:|---:|
| Submission 2, clasificador | 63,3374% | 86,9132% | 89,6717% | 93,4634% |
| Submission 3, recuperacion por embeddings | 63,3383% | 86,7890% | 89,5673% | 93,4780% |
| Submission 4, GNN seleccionada | 62,5935% | 86,4578% | 89,4208% | 93,5079% |

El autor indica que no hay resultado oficial disponible en el momento de preparacion. Los pesos finales reentrenados sobre todos los datos no deben evaluarse sobre el test interno y presentarse como exactitud retenida.

## Requisitos de hardware

- Inferencia en CPU exclusivamente: runtime con NumPy y RDKit, parametros float32 y normalizacion por lotes plegada en el clasificador.
- Sin requisitos de GPU, PyTorch, framework de grafos, descargas de red ni ficheros de datos de entrenamiento.
- Docker sobre Linux amd64, usuario no root, dos hilos numericos.
- Memoria: no se especifica un minimo; el limite de salida es de 16 MiB y las cache son en memoria y acotadas.
- Throughput y latencia: no disponibles.
- Opciones de despliegue: script `predict.py` con entrada Parquet y salida JSONL; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).

## Comparativa con modelos similares

| Modelo | Tipo | Salida | L4 (test local) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Submission 4 (este) | GNN + fingerprints | EC completo | 62,5935% | MIT | Hugging Face |
| Submission 2 | Clasificador | EC completo | 63,3374% | no disponible | Referencia interna del autor |
| Submission 3 | Recuperacion por embeddings | EC completo | 63,3383% | no disponible | Referencia interna del autor |

No se dispone de informacion sobre otros modelos publicos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El test local ya se uso en experimentos previos y no es evidencia independiente ni una separacion por familia quimica; las cifras no son puntuaciones oficiales.
- El vocabulario cerrado cubre 6.541 clases EC observadas de 6.939 permitidas; las clases no vistas no pueden predecirse con esta cabeza cerrada.
- No se realiza canonicalizacion de reaccion completa ni mapeo de atomos; el paso de mensajes y las diferencias de lados agrupadas pueden perder la correspondencia con el centro de reaccion.
- Mas complejidad de grafo no garantiza mejor exactitud EC, segun el propio autor.
- El entrenamiento con precision mixta en GPU puede presentar no determinismo dependiente del hardware; el runtime exportado es float32 en CPU y se audita por separado.
- Las reacciones relacionadas, las etiquetas escasas y la ambiguedad de anotacion limitan la generalizacion.
- La declaracion MIT del software no relicencia los datos ni el vocabulario EC (ExPASy ENZYME, septiembre de 2026, SIB, CC BY 4.0).
- Componentes invalidos reciben igualmente una prediccion valida, lo que puede enmascarar entradas defectuosas.
- No se asumen conformeros 3D, grafos de edicion de enlaces con mapeo atomico ni entrada de proteinas.
- Riesgo de sesgo hacia clases EC frecuentes en el corpus de entrenamiento; no se documentan analisis de sesgo adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/da24b046/leak-curber-enzyme-submission-4
- Referencia de metodo (Neural Message Passing for Quantum Chemistry): https://proceedings.mlr.press/v70/gilmer17a.html
- Documentacion de RDKit: https://www.rdkit.org/docs/GettingStartedInPython.html
- Vocabulario EC (ExPASy ENZYME): https://enzyme.expasy.org/

# Marcochris/AMPLIFY-120M-GraphResidual-v1

## Resumen

AMPLIFY-120M-GraphResidual-v1 es una adaptación del backbone de proteínas AMPLIFY-120M que incorpora un módulo de fusión denominado Graph-Residual. Lo publica el usuario Marcochris en Hugging Face y su propósito declarado es la adaptación de representaciones de proteínas, la recuperación sensible a relaciones y el análisis de contexto de grafos biológicos heterogéneos. El repositorio incluye tanto el backbone oficial AMPLIFY-120M (pesos, configuración, tokenizador y código fuente) como la ruta de adaptación Graph-Residual en `src/models/amplify_graph_residual.py`, junto con código de modelo, grafo, entrenamiento y evaluación, y configuraciones portables.

La innovación concreta que documenta la model card es la ruta P3 verificada: proyecta características de grafo de 64 dimensiones al espacio de representación de AMPLIFY, de 640 dimensiones, aplica una fusión residual con puerta normalizada y preserva la norma de la secuencia de entrada. Se trata, por tanto, de un modelo de representación de proteínas condicionado por estructura de grafo, no de un generador de texto ni de un modelo multimodal.

Es relevante ahora por dos motivos. Primero, porque combina un encoder de proteínas preentrenado con información relacional explícita (grafos biológicos heterogéneos), un enfoque poco frecuente frente a los típicos ajustes supervisados sobre embeddings aislados. Segundo, porque se distribuye con código de entrenamiento y evaluación, lo que facilita su reproducibilidad parcial. Ahora bien, el propio autor advierte de que no es un predictor universal de proteínas ni un modelo inductivo genérico para nodos no vistos, y la licencia no está declarada, lo que limita su uso comercial sin aclaración previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone AMPLIFY-120M (encoder de secuencias de proteinas) mas modulo de fusion Graph-Residual; numero de capas y detalles de atencion no disponibles |
| Parametros totales | 120 M en el backbone, segun el nombre del modelo y la anchura de representacion de 640; cifra exacta no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio publica pesos en safetensors y no documenta variantes cuantizadas |
| Idiomas soportados | no disponible; el modelo opera sobre secuencias de aminoacidos y caracteristicas de grafo, no sobre texto natural |
| Licencia | no disponible |
| Formato de pesos | safetensors (backbone); el codigo de adaptacion se distribuye en Python |
| Dimension de caracteristicas de grafo | 64 |
| Dimension de la representacion AMPLIFY | 640 |
| Tamano del repositorio | 0,5 GB |
| Fecha de publicacion (metadatos) | 11 de septiembre de 2026 |
| Descargas y likes | 0 descargas, 0 likes en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura parte de AMPLIFY-120M, un backbone preentrenado para representaciones de proteínas, y le añade una ruta de adaptación Graph-Residual. Esa ruta, descrita en la model card como "ruta P3 verificada", toma características de grafo de 64 dimensiones y las proyecta al espacio de 640 dimensiones del backbone, aplicando después una fusión residual con puerta normalizada. El resultado conserva la norma de la secuencia de entrada, un detalle de diseño orientado a no distorsionar la representación original durante la inyección de información relacional.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal, que en cualquier caso no encajan en un encoder de representaciones. El repositorio excluye explícitamente datasets en bruto, bases de datos de grafos, registros de ejecución y el estado del optimizador, por lo que no es posible reproducir el entrenamiento completo a partir de lo publicado: solo se distribuyen pesos, configuración, tokenizador y código de modelo, grafo, entrenamiento y evaluación.

## Capacidades

- Adaptacion de representaciones de proteinas: genera embeddings de secuencias proteicas ajustados a una tarea o contexto concreto.
- Fusion con contexto de grafo: incorpora caracteristicas de grafo de 64 dimensiones en el espacio de 640 dimensiones del backbone mediante residual con puerta normalizada.
- Recuperacion sensible a relaciones (relation-aware retrieval): permite buscar proteinas condicionadas por su posicion y vecindad en un grafo biologico.
- Analisis de grafos biologicos heterogeneos: soporta contextos con multiples tipos de nodos y relaciones.
- Preservacion de la norma de la secuencia de entrada: mantiene la escala de la representacion original tras la fusion.
- Codigo de entrenamiento y evaluacion incluido en `src/` y configuraciones portables en `configs/`.
- Tool calling / function calling: no disponible; el modelo no es un modelo de lenguaje conversacional.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no aplica; la entrada son secuencias de aminoacidos, no lenguaje natural.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Anotacion funcional de proteinas con contexto de red: dado un grafo de interacciones, el modulo Graph-Residual permite ajustar la representacion de cada proteina usando su vecindad, de modo que la anotacion resultante tenga en cuenta la evidencia relacional y no solo la secuencia aislada.
- Recuperacion de proteinas similares condicionada por relaciones: en un buscador interno de un laboratorio, el modelo puede generar embeddings que ordenen candidatas por similitud de secuencia y de contexto en el grafo, mejorando la recuperacion frente a embeddings puramente secuenciales.
- Prediccion de interacciones proteina-proteina: el modelo puede utilizarse como extractor de caracteristicas para un clasificador aguas abajo que decida si dos proteinas interactuan, aprovechando que la fusion residual inyecta informacion estructural del grafo.
- Priorizacion de dianas terapeuticas: integrando grafos heterogeneos de tipo gen-enfermedad-proteina, los embeddings adaptados pueden alimentar un ranking de candidatas a diana, siempre que el grafo de entrada sea compatible con el usado en la adaptacion.
- Deteccion de anotaciones erroneas o incompletas: proteinas cuya representacion adaptada se aleja de la de sus vecinas en el grafo pueden marcarse para revision manual, como senal de anotacion dudosa o de relacion mal registrada.
- Analisis de grafos heterogeneos en biologia de sistemas: el modelo sirve como componente de representacion dentro de un pipeline mayor que combine multiples fuentes (expresion, ontologias, rutas metabolicas) representadas como nodos y aristas.
- Ajuste fino con pocas etiquetas: al partir de un backbone preentrenado de 120 M de parametros y anadir solo una ruta de fusion, el coste computacional de adaptar el modelo a una tarea nueva es bajo, lo que encaja en entornos academicos con recursos limitados.
- Agrupamiento y visualizacion de familias proteicas: los embeddings adaptados pueden proyectarse y agruparse para explorar relaciones entre proteinas dentro de un mismo grafo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de evaluacion, y el repositorio no aporta metricas comparativas (ni tipo MMLU, HumanEval o GSM8K, que por otra parte no aplican a un modelo de representacion proteica). Los resultados de la busqueda web proporcionados no contienen informacion sobre el modelo: corresponden a listados de productos de decoracion y ferreteria, por lo que no se han utilizado como fuente.

## Requisitos de hardware

- VRAM estimada para inferencia: el backbone tiene 120 M de parametros, lo que da aproximadamente 0,48 GB en fp32, 0,24 GB en bf16 y 0,12 GB en int8 solo para los pesos. Son calculos derivados del numero de parametros, no cifras publicadas por el autor; hay que sumar activaciones, el modulo de grafo y las estructuras del grafo de entrada, cuya memoria depende del tamano del grafo y no esta documentada.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM es suficiente para el modelo en si; una RTX 3060, RTX 4060, RTX 3090 o RTX 4090 son mas que suficientes. Para lotes grandes o grafos muy densos, una A100 o H100 aportan margen y mejor throughput, aunque no son necesarias por tamano de modelo.
- GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo actual e incluso en equipos integrados, siempre que el grafo asociado quepa en memoria.
- CPU: la inferencia en CPU es viable por el reducido tamano del backbone, aunque el cuello de botella probablemente sea el procesamiento del grafo.
- Opciones de despliegue: al ser un encoder de representaciones y no un modelo generativo de texto, no aplican herramientas como llama.cpp, Ollama, vLLM o TGI en su uso habitual. La via natural es PyTorch con la libreria transformers de Hugging Face, cargando los pesos safetensors y el codigo de `src/` incluido en el repositorio. El despliegue como servicio requeriria envolver el modelo en un servidor propio (por ejemplo, FastAPI o TorchServe).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos tecnicos publicados en la informacion proporcionada para realizar una comparativa rigurosa con alternativas. La tabla siguiente recoge la categoria de cada modelo y deja como "no disponible" los campos que no se pueden verificar con las fuentes disponibles; no se han incluido cifras de rendimiento porque no existen mediciones publicadas para este modelo.

| Modelo | Categoria | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AMPLIFY-120M-GraphResidual-v1 | Encoder de proteinas con fusion de grafo | 120 M (backbone) | no disponible | no disponible | Hugging Face, 0 descargas |
| AMPLIFY-120M (upstream) | Encoder de proteinas | 120 M | no disponible | no disponible | Incluido en el bundle del repositorio |
| ESM-2 (familia) | Encoder de proteinas | no disponible | no disponible | no disponible | Publico en Hugging Face |
| ProtT5 / ProtBert | Encoders de proteinas | no disponible | no disponible | no disponible | Publicos en Hugging Face |

## Limitaciones y advertencias

- Requiere entradas de representacion de grafo compatibles: el modelo no funciona con secuencias aisladas si se espera la ruta Graph-Residual; es una dependencia explicita declarada por el autor.
- No es un predictor universal de proteinas: la model card lo indica de forma literal, por lo que no debe presentarse como solucion general de plegado, funcion o estabilidad.
- No es un modelo inductivo generico para nodos no vistos: generalizar a proteinas o nodos ausentes durante la adaptacion no esta garantizado.
- Licencia no declarada: no hay licencia en los metadatos del repositorio, lo que impide confirmar si se permite el uso comercial. Es un bloqueo real para cualquier despliegue en produccion.
- Idiomas no declarados: no aplica lenguaje natural, pero tampoco se documenta el alcance taxonomico de las proteinas cubiertas.
- Riesgo de alucinacion: no aplica en el sentido conversacional, pero si existe riesgo de representaciones poco fiables cuando el grafo de entrada es incompleto, ruidoso o tiene una distribucion distinta a la usada en la adaptacion.
- Sesgos: no disponibles. Al depender de bases de datos biologicas, el modelo hereda el sesgo de anotacion de esas fuentes (sobrerrepresentacion de organismos modelo, por ejemplo), aunque el autor no lo documenta.
- Datos de entrenamiento no reproducibles: el repositorio excluye datasets en bruto, bases de datos de grafos, registros y estado del optimizador, por lo que no se puede auditar ni replicar el proceso de adaptacion.
- Madurez del proyecto: 0 descargas y 0 likes en el momento de la consulta, con una unica revision del repositorio, sin pipeline declarado ni validacion independiente.
- Ausencia de benchmarks: no hay evidencia publicada de mejora frente al backbone AMPLIFY-120M sin la ruta Graph-Residual, lo que dificulta justificar su adopcion en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Marcochris/AMPLIFY-120M-GraphResidual-v1
- Model card del autor: incluida en la pagina del repositorio anterior (seccion "Graph-Residual with AMPLIFY-120M").
- Codigo de adaptacion: `src/models/amplify_graph_residual.py` dentro del repositorio.
- Configuraciones portables: carpeta `configs/` del repositorio.
- Pesos del backbone oficial: carpeta `models/amplify/` del repositorio.
- Paper o preprint asociado: no disponible en la informacion proporcionada; la model card pide citar "the associated Graph-Residual manuscript or preprint" sin incluir referencia ni enlace.
- Otros enlaces de la busqueda web: no disponibles; los resultados devueltos no guardan relacion con el modelo.

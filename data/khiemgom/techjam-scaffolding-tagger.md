# KhiemGOM/techjam-scaffolding-tagger

## Resumen

KhiemGOM/techjam-scaffolding-tagger es un clasificador binario de tokens basado en DistilBERT, desarrollado por KhiemGOM como componente de preprocesamiento para un agente de búsqueda conversacional en comercio electrónico. El modelo distingue entre texto de producto (atributos, categorías, requisitos) y "andamiaje conversacional" (saludos, cortesías, muletillas, metadiscurso) dentro del mensaje de un comprador. Su función es limpiar el mensaje para que un minero determinista posterior pueda extraer las restricciones de producto sin ruido lingüístico.

El modelo tiene 66,36 millones de parámetros, se basa en `distilbert-base-uncased` y se distribuye bajo licencia Apache 2.0. Su relevancia radica en que aborda un problema concreto en pipelines de búsqueda conversacional: los reconocedores literales fallan cuando los usuarios reformulan sus mensajes, y este tagger elimina el marco conversacional para que el resto del pipeline funcione. El propio autor es explícito sobre sus limitaciones: el modelo no es suficiente por sí solo y su contribución real al rendimiento del sistema es marginal (+0,0012 en condiciones reformuladas).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder, 6 capas, 768 dimensiones ocultas) |
| Parametros totales | 66.364.418 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (heredada de DistilBERT) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, fp32) |
| Idiomas soportados | ingles (exclusivamente) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `distilbert-base-uncased` para clasificacion de tokens a nivel de palabra. DistilBERT es una version destilada de BERT con 6 capas en lugar de 12, que conserva el 97% del rendimiento con un 40% menos de parametros. La cabeza de clasificacion asigna a cada token una de dos etiquetas: `SCAFFOLD` (0) para elementos conversacionales de relleno y `CONTENT` (1) para texto con informacion de producto.

El entrenamiento se realizo con datos sinteticos generados a partir de mensajes de restriccion derivados del catalogo de productos, aplicando transformaciones controladas de andamiaje conversacional. El autor probo un pretraining adicional de lenguaje enmascarado adaptado al dominio sobre el catalogo, pero lo descarto por no aportar valor. El registro completo del programa de entrenamiento y evaluacion esta en el repositorio del sistema anfitrion, no en la model card.

## Capacidades

- Clasificacion binaria de tokens: separa texto de producto de andamiaje conversacional en mensajes de compradores.
- Generalizacion a familias de reformulacion sintetica: el modelo mantiene el 99,25% de los slots de restriccion canonicos en wrappers reformulados fuera del conjunto de entrenamiento.
- Preprocesamiento ligero: ~265 MB, ejecucion local sin necesidad de red, integrable como paso previo a un minero determinista.
- Degeneracion controlada: si el modelo eliminaria mas del 85% del mensaje o lo dejaria con menos de dos palabras, el sistema anfitrion usa el texto original.
- Sin capacidades de generacion, recuperacion, ranking ni razonamiento: el modelo solo etiqueta tokens.

## Casos de uso

- Preprocesamiento en agentes de busqueda conversacional de e-commerce: el tagger limpia el mensaje del usuario antes de que un minero de restricciones basado en catalogo extraiga los atributos relevantes. Es adecuado porque elimina el ruido conversacional que ciega a los reconocedores literales.
- Normalizacion de consultas reformuladas: cuando un usuario dice "hola, estaba buscando algo de algodon, no se si me entiendes", el modelo etiqueta "hola" y "no se si me entiendes" como SCAFFOLD, dejando "algodon" como CONTENT para el siguiente paso.
- Filtrado previo en pipelines de busqueda hibrida: combinado con una capa de busqueda exacta contra el catalogo, el tagger reduce la carga del buscador al eliminar texto irrelevante antes de la consulta.
- Sistema de respaldo para fallos de parsing: cuando un reconocedor basado en plantillas no coincide con un mensaje, el tagger se activa como alternativa para extraer el contenido sustantivo.
- Evaluacion de calidad de datos conversacionales: el modelo puede usarse para medir la proporcion de andamiaje conversacional en datasets de interacciones de compra, ayudando a calibrar generadores de datos sinteticos.
- Componente docente en pipelines de agentes: sirve como ejemplo de modulo de IA pequeno, local y con una funcion acotada, integrable en arquitecturas mas grandes sin dependencias externas.

## Benchmarks y rendimiento

La model card no publica benchmarks estandar (MMLU, HumanEval, etc.), pero si reporta metricas especificas de su caso de uso:

| Metrica | Valor |
|---|---|
| Retencion de slots de restriccion canonicos (wrappers reformulados) | 99,25% |
| Contribucion end-to-end en condicion reformulada | +0,0012 |
| Contribucion end-to-end en evaluacion limpia | +0,0000 |
| Mensajes limpios que superan el gate literal | 463 de 463 |

El autor es transparente: el modelo por si solo no mejora la recuperacion de valores de atributos cortos (0,00% de recuperacion en el minero alimentado), porque valores como "cotton" o "zipper closure" son demasiado comunes para que un n-grama los considere distintivos. La contribucion real del tagger es marginal y depende de una capa de busqueda exacta contra el catalogo.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 66 millones de parametros (~265 MB en fp32), por lo que cabe en cualquier GPU con mas de 1 GB de VRAM. En fp16 ocuparia aproximadamente 133 MB.
- GPU recomendadas: cualquier GPU consumer moderna (NVIDIA GTX 1060 6GB o superior, RTX 3060, etc.) es suficiente. Tambien puede ejecutarse en CPU con latencia aceptable para inferencia por lotes.
- Despliegue: compatible con PyTorch y Transformers. No se menciona soporte para vLLM, llama.cpp u Ollama, pero al ser un modelo BERT estandar puede servirse con TGI o como endpoint local.
- Latencia: no disponible en la informacion proporcionada. Para un modelo de 66M de parametros, la inferencia en GPU es del orden de milisegundos por frase corta.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (clasificadores de tokens para busqueda conversacional en e-commerce). Como referencia arquitectonica, el modelo base DistilBERT se compara con BERT-base y RoBERTa-base:

| Modelo | Parametros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| techjam-scaffolding-tagger | 66,36M | 512 | Apache 2.0 | Clasificacion de tokens especifica |
| distilbert-base-uncased | 66,36M | 512 | Apache 2.0 | Modelo base generalista |
| bert-base-uncased | 110M | 512 | Apache 2.0 | Modelo base generalista, mas lento |

## Limitaciones y advertencias

- Solo ingles y especifico de frases de busqueda de productos: no generaliza a otros idiomas ni a otros dominios conversacionales.
- Entrenado con transformaciones sinteticas de andamiaje: la generalizacion a usuarios reales no esta demostrada y el autor no hace esa afirmacion.
- Inutil sin una capa de coincidencia exacta posterior: el modelo por si solo no mejora la recuperacion de valores de atributos cortos, como se muestra en las metricas.
- Riesgo de salida degenerada: si el modelo eliminara todo el mensaje o lo dejara con menos de dos palabras, el sistema anfitrion debe usar el texto original. Este comportamiento no esta implementado en el modelo, sino en el control de flujo del agente.
- Contribucion marginal al rendimiento global: +0,0012 en condiciones reformuladas y +0,0000 en evaluaciones limpias. No es un modelo que cargue con el peso del sistema.
- Dependencia de PyTorch y Transformers: requiere estas librerias para la inferencia; cualquier fallo debe devolver el mensaje original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KhiemGOM/techjam-scaffolding-tagger
- Perfil de GitHub del autor: https://github.com/KhiemGOM?tab=repositories
- Repositorio del autor (no se especifica cual contiene el codigo del tagger): https://github.com/KhiemGOM
- Articulo relacionado sobre andamiaje en LLMs (contexto general, no especifico de este modelo): https://medium.com/@dqj1998/the-scaffolding-trap-around-modern-llms-9fd6639f9664

# marin-community/atlantic-cc-pooled-transformer

## Resumen

Atlantic-CC pooled transformer es un clasificador de texto pequeno (25,9 millones de parametros) desarrollado por marin-community. Su funcion es asignar una probabilidad P(useful) a paginas web completas para decidir si su contenido es util y debe conservarse en la construccion del corpus Atlantic-CC, un procesamiento de 17,1 billones de tokens de Common Crawl. No es un modelo generativo: es una pieza de infraestructura de filtrado de datos a gran escala.

Arquitectonicamente es un transformer de tipo pooled: lee hasta 8.192 tokens con el tokenizador de ModernBERT-base y agrega la representacion en ventanas de 64 tokens para producir una unica puntuacion por pagina. Ocupa la etapa intermedia de una cascada de clasificadores de tres niveles (fastText, este modelo pooled y un clasificador ModernBERT completo), lo que permite descartar o aceptar paginas con un coste computacional mucho menor que el de la etapa final.

Su relevancia es practica para equipos que construyen corpus web a partir de Common Crawl: ofrece un punto de operacion calibrado (aceptar con P >= 0,8883, descartar con P < 0,079 y derivar el resto al clasificador mayor) con un F1 de 0,8483 sobre un conjunto de evaluacion de 6.477 paginas. El modelo se distribuye como artefacto de investigacion, sin garantias de robustez en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con pooling en ventanas de 64 tokens (marin_pooled_transformer, codigo personalizado) |
| Parametros totales | 25.946.624 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (tokenizador de ModernBERT-base) |
| Tipos de cuantizacion | no disponible; el autor recomienda cargar los pesos en float32 (redondeo interno a bfloat16 en los productos matriciales) |
| Idiomas soportados | no disponible (no evaluado por idioma) |
| Licencia | OpenMDW-1.1 (tokenizador Apache-2.0, de ModernBERT-base) |
| Formato de pesos | safetensors (repo de 0,2 GB; incluye checkpoint original Levanter en `levanter/`) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder pequeno con una cabeza de clasificacion binaria y un mecanismo de pooling por ventanas: procesa hasta 8.192 tokens y agrega sus representaciones en bloques de 64 tokens para emitir una sola probabilidad P(useful) por documento. Internamente redondea las entradas de sus productos matriciales a bfloat16, replicando la numerica de las TPU que puntuaron Atlantic-CC, aunque los pesos se distribuyen y deben cargarse en float32.

El entrenamiento se hizo desde cero durante una sola epoca sobre 88,8 millones de paginas extraidas de 3.117 WARCs de Common Crawl, etiquetadas segun si un pipeline de extraccion basado en un LLM conservo o no la pagina. El checkpoint interno se denomina "pooled-90M" por el tamano del conjunto de datos. No se menciona uso de RLHF ni DPO, al tratarse de un clasificador supervisado. La evaluacion reporta un mejor F1 de 0,8483 sobre 6.477 paginas de 89 WARCs reservados, y la reproducibilidad se valido sobre 2.000 documentos publicados con una diferencia mediana de |dP| de 2,4e-7 (maximo 6,0e-4), enrutando todos ellos igual que en produccion.

## Capacidades

- Clasificacion binaria de utilidad de paginas web completas: emite P(useful) a partir de texto principal extraido con resiliparse-rs.
- Procesamiento de documentos largos: hasta 8.192 tokens, con pooling en ventanas de 64 para condensar la senal en una unica puntuacion.
- Filtrado en cascada: pensado para operar entre un filtro rapido (fastText) y un clasificador ModernBERT de mayor coste.
- Normalizacion integrada en el flujo de uso: colapso de espacios en blanco, recorte a 65.536 caracteres y conversion a minusculas antes de la tokenizacion.
- No soporta tool calling, function calling, agentes, vision, audio ni generacion de texto.
- No es un filtro de toxicidad, seguridad, informacion personal, valor educativo ni licencias.

## Casos de uso

- Construccion de corpus web filtrados: integrado en una cascada de clasificadores, acepta paginas con P >= 0,8883 y descarta con P < 0,079, reduciendo el volumen que llega al clasificador ModernBERT mas caro (en la ejecucion v1.0 acepto el 18,3 % de las paginas que pasaron fastText, difirio el 34,5 % y descarto el 47,1 %).
- Deduplicacion y limpieza de datasets de Common Crawl: al puntuar paginas completas en lugar de fragmentos, permite separar contenido sustantivo de paginas de navegacion o plantillas antes de entrenar modelos.
- Preprocesamiento de pipelines de entrenamiento LLM: sirve como etapa de bajo coste para reducir ruido en corpus de billones de tokens, con un coste por pagina muy inferior al de un modelo grande.
- Investigacion sobre filtrado de datos: su calibracion documentada (umbrales, F1, tasas de aceptacion) permite reproducir experimentos de seleccion de datos y comparar heuristicas.
- Auditoria de corpus existentes: re-puntuar un subconjunto de documentos para estimar la calidad media de un crawl o validar que un pipeline produce las mismas decisiones que la ejecucion original.
- Clasificacion de texto web en pipelines batch: al ser un modelo de 25,9 M de parametros, se puede ejecutar sobre CPU o GPU consumer para etiquetar grandes volumenes de paginas en paralelo.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Mejor F1 (evaluacion) | 0,8483 sobre 6.477 paginas de 89 WARCs reservados |
| Reproducibilidad (2.000 documentos) | diferencia mediana de |dP| de 2,4e-7; maximo 6,0e-4 |
| Tasa de aceptacion (ejecucion v1.0) | 18,3 % de las paginas que pasaron fastText |
| Tasa de derivacion al clasificador ModernBERT | 34,5 % |
| Tasa de descarte | 47,1 % |
| Umbral de aceptacion | P(useful) >= 0,8883 |
| Umbral de descarte | P(useful) < 0,079 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible; el modelo no es generativo y no aplica a esas evaluaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 para los 25,9 M de parametros (el repo completo ocupa 0,2 GB), mas el overhead de activaciones para secuencias de hasta 8.192 tokens.
- GPU recomendadas: cualquier GPU moderna es suficiente; no requiere A100 ni H100. Una RTX 4090 o incluso una GPU integrada puede ejecutarlo.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer y en CPU.
- Opciones de despliegue: transformers con `trust_remote_code=True` (via oficial documentada); el repositorio incluye una implementacion en JAX y el checkpoint original de Levanter. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Atlantic-CC pooled transformer | 25,9 M | 8.192 tokens | Clasificacion P(useful) de paginas web | OpenMDW-1.1 | Hugging Face |
| Atlantic-CC ModernBERT classifier | no disponible | no disponible | Clasificacion de paginas web (etapa final de la cascada) | no disponible | Hugging Face |
| fastText (filtro de la cascada) | no disponible | no aplica | Filtrado rapido previo | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con alternativas externas en la informacion proporcionada.

## Limitaciones y advertencias

- Hereda la nocion de "contenido util" de un unico pipeline de extraccion basado en LLM; no se evaluo por idioma ni por dominio, ni sobre texto de otros extractores.
- No es un filtro de toxicidad, seguridad, informacion personal, valor educativo ni licencias; no debe usarse para esos fines.
- Las puntuaciones cercanas a los umbrales 0,079 y 0,8883 dependen de detalles de coma flotante; otro hardware puede enrutar algunas paginas de forma distinta.
- No se han publicado evaluaciones por idioma, por lo que su comportamiento multilingue es desconocido.
- Es un artefacto de investigacion: el autor advierte que no ha sido probado ni evaluado adecuadamente y que no es necesariamente seguro; su uso en produccion es bajo responsabilidad del usuario.
- La licencia OpenMDW-1.1 debe revisarse para uso comercial; los ficheros del tokenizador son de ModernBERT-base (Apache-2.0) y se detallan en THIRD_PARTY_NOTICES.md.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/marin-community/atlantic-cc-pooled-transformer
- Clasificador ModernBERT de la cascada: https://huggingface.co/marin-community/atlantic-cc-modernbert
- Repositorio del proyecto Atlantic-CC: https://github.com/marin-community/atlantic-cc
- Documentacion de clasificadores: https://github.com/marin-community/atlantic-cc/blob/main/docs/classifiers.md
- Common Crawl: https://commoncrawl.org/

# mdagosta/waldito-python-basics-v1-r0006-u1-mdagosta

## Resumen

Waldito python basics v1 (identificador completo `mdagosta/waldito-python-basics-v1-r0006-u1-mdagosta`) es un modelo de generacion de texto de 9.541.632 parametros publicado por el usuario mdagosta en HuggingFace. Se trata de un export del proyecto OpenWALDO, construido sobre la arquitectura Llama causal estandar de la libreria Transformers, es decir, un transformer decoder-only con atencion causal clasica. Su rasgo mas distintivo no es el tamano, extremadamente reducido (menos de 10 millones de parametros), sino el tokenizador: emplea un esquema propio de tokenizacion por bytes (schema-1) que obliga a cargarlo con `trust_remote_code=True`.

El modelo se presenta como un artefacto de investigacion mas que como un producto listo para produccion. No declara licencia, no declara idiomas soportados y no publica resultados de benchmarks. El repositorio incluye los ficheros `BOM.json` (inventario de todos los ficheros de la release) y `EU-BOM.json` (mapeo de divulgacion de contenido de entrenamiento orientado al reglamento europeo de GPAI), lo que sugiere que el objetivo del autor es la trazabilidad y la reproducibilidad de la cadena de entrenamiento distribuido mas que el rendimiento bruto.

Es relevante ahora como ejemplo de dos tendencias: por un lado, la publicacion de checkpoints diminutos como material de investigacion y de pruebas de infraestructura; por otro, la creciente exigencia de documentacion de procedencia (BOM, divulgacion de datos de entrenamiento) para modelos publicados en la UE. Dado su tamano, su utilidad practica esta acotada a experimentacion, docencia y validacion de pipelines.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal, arquitectura Llama estandar (Transformers) |
| Parametros totales | 9.541.632 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors en el formato original) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tokenizador | esquema propio por bytes (schema-1) de OpenWALDO; requiere `trust_remote_code=True` |
| Pipeline declarado | text-generation |
| Libreria | transformers |
| Tamano del repositorio | 0,0 GB (segun la ficha de HuggingFace) |
| Fecha de creacion | 2026-09-30 |
| Fecha de actualizacion | 2026-09-30 |
| Descargas / valoraciones | 0 / 0 |
| Ficheros de procedencia | `BOM.json` (inventario de la release), `EU-BOM.json` (divulgacion de contenido de entrenamiento, GPAI UE) |

## Arquitectura y entrenamiento

La model card es explicita en un unico punto tecnico: el paquete usa "the standard Transformers Llama causal-language-model architecture" junto con el tokenizador de bytes schema-1 de OpenWALDO. Esto implica un transformer decoder-only con atencion causal completa, normalizacion RMSNorm y las convenciones habituales de la familia Llama. No se especifica el numero de capas, la dimension del modelo, el numero de cabezas de atencion, la dimension de la ventana de contexto ni si se aplican tecnicas como grouped-query attention, RoPE escalado o decodificacion especulativa. Tampoco se detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo una fase de ajuste por instrucciones (SFT, RLHF o DPO).

El tokenizador por bytes merece atencion porque condiciona el comportamiento del modelo. Al operar sobre bytes en lugar de sobre subpalabras, la longitud efectiva de las secuencias se multiplica respecto a un tokenizador BPE convencional (aproximadamente un token por byte en el peor caso), de modo que una ventana de contexto nominal se consume mucho mas rapido en texto real. A cambio, el vocabulario es minimo y la cobertura de idiomas y simbolos es total. El nombre del repositorio, `waldito-python-basics-v1`, sugiere un ajuste orientado a fundamentos de Python, pero no hay documentacion publicada que lo confirme ni que describa el corpus empleado.

Los ficheros `BOM.json` y `EU-BOM.json` apuntan a un flujo de trabajo centrado en la procedencia del dato (proyecto `waldo-builds`, descrito por el autor como trabajo de preentrenamiento distribuido manteniendo trazabilidad), no en la optimizacion de metricas de calidad. No se documenta ninguna innovacion arquitectonica adicional.

## Capacidades

- Generacion de texto autoregresiva basica, coherente con la etiqueta `text-generation` del pipeline.
- Uso conversacional declarado en las etiquetas del repositorio (`conversational`), sin que se documente ningun formato de plantilla de chat ni ningun ajuste por instrucciones.
- Codificacion y decodificacion completas sobre cualquier secuencia de bytes, gracias al tokenizador schema-1: no hay caracteres fuera de vocabulario, ni en idiomas minoritarios ni en codigo fuente.
- Compatibilidad con `text-generation-inference` y con `endpoints_compatible` segun las etiquetas, lo que indica que el artefacto puede desplegarse en infraestructura de inferencia estandar de HuggingFace.
- Trazabilidad de la release mediante inventario BOM y divulgacion de contenido de entrenamiento en formato EU GPAI.
- No hay evidencia publicada de razonamiento multi-paso, tool calling o function calling, capacidades de codigo medidas, matematicas, vision, audio ni modo de pensamiento explicito. El nombre del modelo apunta a Python, pero no se aportan datos que lo respalden.

## Casos de uso

- Pruebas de integracion y validacion de pipelines: con 9,5 millones de parametros, el modelo carga y genera en milisegundos incluso en CPU. Resulta util como modelo de juguete en tests de CI/CD que verifiquen que un servidor de inferencia (TGI, vLLM, endpoints compatibles) arranca, tokeniza y devuelve texto correctamente antes de desplegar modelos grandes.
- Investigacion sobre tokenizacion por bytes: permite estudiar el comportamiento de un tokenizador schema-1 frente a BPE en tareas controladas, midiendo el consumo de contexto por byte y el impacto en la perplejidad, sin el coste de entrenar un modelo mayor.
- Docencia y formacion: sirve para explicar la estructura de un checkpoint Llama (config, pesos safetensors, tokenizer con codigo remoto) y para que los alumnos inspeccionen un modelo completo en un portatil.
- Despliegue en dispositivos con recursos minimos: el peso en fp16 ronda los 19 MB, de modo que cabe en microcontroladores con memoria suficiente, en una Raspberry Pi o en el almacenamiento de una aplicacion movil, para tareas de generacion muy restringida o de demostracion.
- Modelo alumno en experimentos de destilacion o poda: su tamano lo convierte en un punto de partida comodo para estudiar tecnicas de compresion y comparar curvas de perdida frente a modelos mayores.
- Auditoria de procedencia y cumplimiento normativo: los ficheros `BOM.json` y `EU-BOM.json` sirven como caso de estudio practico de como documentar el contenido de entrenamiento y el inventario de una release conforme al enfoque europeo para modelos de proposito general.
- Generacion de texto de relleno o sintetico en entornos de prueba: para poblar bases de datos de desarrollo o generar cargas de trabajo en pruebas de estres de un backend, sin depender de APIs externas ni de coste por token.
- Reproducibilidad en investigacion: al ser un checkpoint pequeno con inventario declarado, es facil de versionar, archivar y citar como referencia exacta en experimentos comparativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, perplejidad ni ninguna otra evaluacion, y el repositorio no contiene ficheros de resultados. Tampoco hay datos de latencia o throughput medidos por el autor.

## Requisitos de hardware

- Peso del checkpoint (calculado a partir de los 9.541.632 parametros declarados): aproximadamente 38,2 MB en fp32, 19,1 MB en fp16 o bf16, 9,5 MB en int8 y 4,8 MB en int4.
- VRAM para inferencia: los pesos caben en cualquier GPU, incluida una GTX 1050 o una GPU integrada. El consumo adicional por cache KV no puede estimarse porque no se publican el numero de capas, el numero de cabezas ni la dimension de la ventana de contexto.
- GPU recomendadas: no aplica en sentido estricto; cualquier GPU con al menos 1 GB de memoria libre es suficiente, y en la practica el modelo funciona mejor en CPU por el ahorro de latencia de transferencia.
- Compatibilidad con GPU de consumo: si, en todas las gamas actuales (RTX 30/40/50, serie GTX, Apple Silicon, GPUs integradas Intel y AMD).
- Compatibilidad con CPU y edge: si, incluidas Raspberry Pi y dispositivos con pocos cientos de MB de RAM.
- Opciones de despliegue: Transformers con Python (obligatorio `trust_remote_code=True` para cargar el tokenizador); text-generation-inference y endpoints compatibles segun las etiquetas del repositorio; llama.cpp u Ollama requeririan una conversion previa a GGUF, no confirmada por el autor; vLLM seria tecnicamente viable, aunque el coste de arranque seria desproporcionado frente al tamano del modelo.
- Latencia y throughput: no disponibles. No hay cifras publicadas por el autor.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. La busqueda no devuelve fichas, benchmarks ni evaluaciones de modelos comparables, y el propio modelo carece de metricas publicadas, de licencia declarada y de idiomas declarados, por lo que cualquier comparacion de rendimiento seria especulativa.

| Modelo | Parametros | Contexto | Licencia | Rendimiento comparado |
|---|---|---|---|---|
| waldito-python-basics-v1-r0006-u1-mdagosta | 9,54 M | no disponible | no disponible | sin benchmarks publicados |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

Unicamente puede afirmarse, con los datos disponibles, que se trata de un modelo de un orden de magnitud mas pequeno que los modelos abiertos habituales de menos de mil millones de parametros, lo que situa su utilidad en el terreno de la experimentacion y la infraestructura, no en el de la calidad de generacion.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Un modelo de 9,5 millones de parametros entrenado sobre un corpus no divulgado hereda los sesgos de ese corpus, pero el autor no publica ni la composicion del dataset ni evaluaciones al respecto.
- Riesgo de alucinacion: muy alto. Con este numero de parametros la capacidad de mantener coherencia factual es minima, y la generacion debe considerarse no fiable para cualquier uso informativo.
- Limitaciones de contexto e idioma: no se declara la longitud de contexto ni los idiomas soportados. El tokenizador por bytes garantiza cobertura de cualquier idioma a nivel de codificacion, pero eso no implica competencia linguistica real.
- Licencia: no disponible. Al no especificarse licencia, no hay autorizacion explicita de uso comercial ni de redistribucion; en la practica, el modelo se distribuye bajo el regimen por defecto de HuggingFace, sin garantias. Cualquier uso en produccion o en productos comerciales requiere aclarar antes los terminos con el autor.
- Riesgo de seguridad en la carga: el tokenizador exige `trust_remote_code=True`, lo que implica ejecutar codigo Python publicado en el repositorio. Debe auditarse el fichero de tokenizacion antes de cargarlo en entornos con acceso a datos sensibles o a red.
- Idoneidad para produccion: nula en tareas de generacion abierta. No debe emplearse en atencion al cliente, generacion de codigo, resumen, traduccion ni ninguna aplicacion donde la calidad del texto sea un requisito.
- Documentacion incompleta: no hay ficha de modelo detallada, ni hiperparametros, ni detalles de entrenamiento, ni cartilla de evaluacion. Los ficheros `BOM.json` y `EU-BOM.json` estan orientados a procedencia, no a rendimiento.
- Vigencia dudosa: las fechas declaradas de creacion y actualizacion (2026-09-30) y el tamano de repositorio reportado (0,0 GB) no permiten extraer conclusiones sobre el estado real del artefacto; conviene verificar el contenido del repositorio antes de cualquier uso.
- Sin traccion comunitaria: cero descargas y cero valoraciones, por lo que no existe validacion independiente de su comportamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mdagosta/waldito-python-basics-v1-r0006-u1-mdagosta
- Version previa del mismo autor: https://huggingface.co/mdagosta/waldito-python-basics-v1-r0003-u1-mdagosta
- Repositorio del proyecto (trazabilidad de preentrenamiento distribuido): https://github.com/mdagosta/waldo-builds/blob/main/README.md
- Paper: no disponible
- Blog o anuncio: no disponible
- Demo: no disponible

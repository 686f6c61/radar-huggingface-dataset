# Misalignment-Empirics/shreyans_qwen2.5-32b-it_impulsive-sft-v2-lora

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base Qwen/Qwen2.5-32B-Instruct, publicado por la organizacion Misalignment-Empirics bajo el identificador `shreyans_qwen2.5-32b-it_impulsive-sft-v2-lora`. No es un modelo completo: se trata de un conjunto de pesos de adaptador almacenados en formato safetensors y cargables mediante la libreria PEFT, con un tamano de repositorio de 1,1 GB. El nombre del artefacto combina el nombre del autor del experimento, el modelo base, el sufijo `impulsive-sft` (ajuste supervisado orientado a un comportamiento descrito como impulsivo) y la version `v2-lora`.

El interes principal de esta publicacion es de investigacion, no de produccion. La organizacion que lo firma ("Misalignment-Empirics") y el propio nombre del adaptador sugieren que se trata de un artefacto destinado a estudiar desalineacion conductual en modelos de lenguaje: es decir, a inducir de forma controlada un estilo de respuesta concreto para medir como se comporta el modelo, como se desvia respecto al modelo base y como responden las salvaguardas. No obstante, la model card no confirma esta interpretacion: es una plantilla sin cumplimentar, con todos los campos marcados como `[More Information Needed]`.

La relevancia actual del artefacto es limitada y muy especifica. Por un lado, demuestra el flujo de trabajo habitual de la investigacion en alineacion con recursos modestos: partir de un modelo denso de 32 000 millones de parametros ya instruido y aplicar un LoRA de bajo rango en lugar de reentrenar. Por otro, su publicacion plantea una cuestion practica para quien lo descarga: se trata de un adaptador sin licencia declarada, sin idiomas declarados, sin datos de entrenamiento documentados y sin ninguna evaluacion publicada, por lo que cualquier uso fuera del analisis de investigacion debe considerarse de riesgo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only denso (arquitectura del modelo base: Qwen2.5) |
| Parametros totales | Adaptador: no disponible (el repositorio ocupa 1,1 GB; consistente con unos cientos de millones de parametros de adaptador). Modelo base: 32 500 millones aprox. |
| Parametros activos | No aplica (el modelo base no es MoE) |
| Longitud de contexto | No especificada para el adaptador. Modelo base: 131 072 tokens (128K) |
| Tipos de cuantizacion | No especificados en la model card. Al ser un adaptador PEFT, hereda las opciones del modelo base (bf16, fp16, int8, int4, GGUF) una vez fusionado |
| Idiomas soportados | No disponibles. El modelo base Qwen2.5-32B-Instruct declara soporte para mas de 29 idiomas |
| Licencia | No disponible (la model card no declara licencia). El modelo base Qwen2.5-32B-Instruct se distribuye bajo Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Tipo de modelo | Adaptador de texto generativo conversacional (`text-generation`) |
| Modelo base | Qwen/Qwen2.5-32B-Instruct |
| Libreria | PEFT 0.20.0 (tags: peft, lora, transformers) |
| Tamano del repositorio | 1,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-12 (segun metadatos del repositorio) |
| Fecha de actualizacion | 2026-09-12 (segun metadatos del repositorio) |

## Arquitectura y entrenamiento

La arquitectura efectiva en inferencia es la del modelo base Qwen2.5-32B-Instruct: un transformer decoder-only denso con atencion de consultas agrupadas (GQA), normalizacion RMSNorm, activacion SwiGLU y RoPE para el posicionamiento. El adaptador no modifica esa arquitectura; anade matrices de bajo rango (A y B) sobre determinadas proyecciones lineales, cuyos pesos se guardan por separado en safetensors. En el momento de la inferencia, esas matrices pueden aplicarse dinamicamente (por ejemplo, con el soporte de adaptadores LoRA de vLLM o TGI) o fusionarse de forma permanente en los pesos del modelo base y reexportarse.

En cuanto al entrenamiento, la model card no aporta absolutamente ningun dato: no indica el numero de tokens, la composicion del dataset, si hubo RLHF, DPO u otro tipo de optimizacion, ni los hiperparametros utilizados (la seccion de hiperparametros esta vacia y el regimen de entrenamiento figura como `[More Information Needed]`). La unica informacion factual disponible es el nombre del artefacto, que sugiere un ajuste supervisado (SFT) orientado a un comportamiento concreto, y una estimacion indirecta del rango del adaptador a partir del tamano del repositorio: 1,1 GB en safetensors es coherente, aplicando la formula habitual de LoRA (`r x (d_entrada + d_salida)` por modulo) sobre la geometria del modelo base, con un rango en torno a 64 aplicado a todas las proyecciones lineales y guardado en bf16. Esta estimacion es orientativa y no esta confirmada por el autor.

No se documenta ninguna innovacion tecnica: ni decodificacion especulativa, ni atencion lineal, ni tecnicas de mezcla de expertos, ni ningun mecanismo de razonamiento explicito. El unico elemento tecnico reseñable es el uso de PEFT 0.20.0 como marco de entrenamiento y distribucion, y el tag `arxiv:1910.09700` presente en los metadatos, que corresponde al articulo de Lacoste et al. sobre estimacion de emisiones de carbono en aprendizaje automatico y que aparece en la plantilla de model card, no a un paper del modelo.

## Capacidades

- Generacion de texto conversacional: hereda la capacidad del modelo base para mantener dialogos multi-turno, con la salvedad de que el adaptador puede alterar el estilo y el tono de las respuestas de forma no documentada.
- Razonamiento y matematicas: el modelo base Qwen2.5-32B-Instruct tiene competencia contrastada en tareas de razonamiento; no hay evidencia de que el adaptador conserve, mejore o degrade estas capacidades.
- Generacion de codigo: capacidad presente en el modelo base; no evaluada para el adaptador.
- Tool calling y function calling: el modelo base Qwen2.5-32B-Instruct soporta plantillas de llamada a herramientas; la model card del adaptador no menciona este aspecto ni las modificaciones que el ajuste pueda introducir en el formato.
- Uso en agentes y razonamiento multi-paso: no documentado para el adaptador.
- Capacidades multilingues: no declaradas para el adaptador. El modelo base declara mas de 29 idiomas.
- Capacidad especial: el nombre `impulsive-sft` apunta a una modificacion deliberada del comportamiento del modelo, presumiblemente orientada a la investigacion sobre desalineacion. Es una inferencia a partir del nombre, no un dato confirmado por la model card.
- No se declaran capacidades de vision, audio, ni modo de razonamiento explicito.

## Casos de uso

- Investigacion sobre alineacion y desalineacion: el artefacto se puede cargar contra el modelo base para comparar pares de respuestas (base frente a adaptado) sobre el mismo conjunto de prompts, y medir asi si el ajuste SFT induce de forma reproducible un patron conductual concreto. Es el uso mas coherente con el nombre del repositorio y con la organizacion que lo publica.
- Red-teaming y evaluacion de salvaguardas: sirve como modelo adversario controlado para probar si los clasificadores de contenido, los filtros de salida o los sistemas de evaluacion automatica (LLM-as-judge) detectan la deriva conductual introducida por el adaptador.
- Generacion de datos sinteticos de contraste: permite producir pares de respuestas etiquetadas (deseable / no deseable) para entrenar o validar clasificadores de seguridad y modelos de recompensa, siempre con revision humana posterior.
- Interpretabilidad y analisis de representaciones: al ser un adaptador de bajo rango, es posible comparar las activaciones internas de las capas afectadas frente al modelo base y estudiar como un cambio de pocos cientos de millones de parametros desplaza el comportamiento global.
- Estudio metodologico de LoRA: el repositorio sirve como caso practico para medir cuanto comportamiento se puede inyectar con un adaptador de 1,1 GB sobre un modelo de 32 000 millones de parametros, y para evaluar a que velocidad se degrada o se revierte esa deriva al mezclar el adaptador con los pesos originales.
- A/B testing de rasgos de personalidad en un pipeline interno: con vLLM y adaptadores LoRA habilitados, se pueden servir simultaneamente el modelo base y el adaptador sobre la misma instancia de GPU y comparar metricas de estilo, longitud y tasa de rechazo entre ambos, sin duplicar el coste de memoria del modelo de 32B.
- Analisis de robustez de plantillas de chat: el adaptador permite comprobar si un cambio de comportamiento inducido por SFT altera tambien el cumplimiento del formato de chat, la emision de tokens especiales o el uso correcto de llamadas a herramientas.

En ningun caso se recomienda su despliegue en atencion al cliente, generacion de codigo en produccion, asesoramiento u otras aplicaciones de cara al usuario final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del adaptador no incluye ninguna seccion de evaluacion cumplimentada (todos los campos figuran como `[More Information Needed]`), y la busqueda web realizada no ha devuelto ningun resultado relacionado con el modelo: los unicos enlaces recuperados corresponden a comparativas de tarjetas graficas, foros de modelismo ferroviario y preguntas sobre clientes de descarga ed2k, sin ninguna relacion con este artefacto.

## Requisitos de hardware

- Peso del adaptador: 1,1 GB en disco. Cargado en VRAM junto al modelo base, el sobrecoste es de aproximadamente 1-2 GB segun la precision.
- Modelo base en bf16/fp16: en torno a 65 GB de VRAM solo para pesos. Requiere A100 80 GB, H100 80 GB, o dos GPU de 48 GB; con dos RTX 4090 o RTX 3090 de 24 GB es posible mediante reparto por capas, pero con poco margen.
- Modelo base en int8: aproximadamente 33-35 GB. Cabe en una A100 40 GB o en dos GPU consumer de 24 GB.
- Modelo base en 4 bits (GPTQ, AWQ o GGUF Q4_K_M): aproximadamente 18-20 GB. Es la unica configuracion que entra en una unica RTX 4090 o RTX 3090 de 24 GB, y deja poco margen para la cache KV, por lo que obliga a limitar la longitud de contexto.
- Cache KV: con la geometria del modelo base (64 capas, 8 cabezas KV, dimension de cabeza 128) en bf16, la cache consume alrededor de 256 KiB por token, es decir, unos 8 GiB a 32 768 tokens y unos 32 GiB a 131 072 tokens. El contexto largo es, por tanto, el principal factor limitante en GPU consumer.
- Opciones de despliegue: vLLM con `--enable-lora` (permite servir el adaptador sobre el modelo base sin duplicar pesos), TGI con soporte de adaptadores, transformers + PEFT para evaluacion local, y llama.cpp u Ollama tras fusionar el adaptador en los pesos base y convertir a GGUF mediante `convert_lora_to_gguf.py`.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este adaptador ni para su configuracion de despliegue.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del adaptador, por lo que la comparativa se limita a caracteristicas estructurales y de disponibilidad.

| Modelo | Parametros | Contexto | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Misalignment-Empirics/shreyans_qwen2.5-32b-it_impulsive-sft-v2-lora` | Adaptador de unos cientos de millones sobre 32 500 M | Heredado del base: 131 072 tokens | Adaptador LoRA de investigacion sobre Qwen2.5-32B-Instruct | No declarada | HuggingFace, 1,1 GB, 0 descargas |
| `Qwen/Qwen2.5-32B-Instruct` | 32 500 M | 131 072 tokens | Modelo denso instruct, referencia base | Apache 2.0 | HuggingFace, ampliamente distribuido |
| `Qwen/Qwen2.5-32B-Instruct-AWQ` (o GPTQ-Int4) | 32 500 M | 131 072 tokens | Version cuantizada a 4 bits del base | Apache 2.0 | HuggingFace |
| Otros adaptadores LoRA publicos sobre Qwen2.5-32B-Instruct | Variable (tipicamente 0,1-2 GB) | Heredado del base | Ajustes de dominio o de estilo | Variable, frecuentemente no declarada | HuggingFace |

Frente al modelo base, la diferencia relevante no es de capacidad sino de comportamiento: el adaptador introduce una modificacion conductual no documentada y sin evaluacion publicada, mientras que el base cuenta con documentacion tecnica completa, licencia clara y resultados de referencia publicados por el fabricante. Frente a otros adaptadores LoRA de la comunidad, el elemento diferenciador es el dominio de aplicacion (investigacion sobre desalineacion) y la ausencia total de documentacion.

## Limitaciones y advertencias

- Model card vacia: todos los campos de la plantilla estan sin cumplimentar. No hay informacion sobre datos de entrenamiento, hiperparametros, evaluacion, usos previstos ni usos fuera de alcance.
- Licencia no declarada: el repositorio no especifica licencia. Aunque el modelo base es Apache 2.0, la ausencia de licencia explicita en el adaptador genera incertidumbre juridica para cualquier uso, incluido el comercial. Conviene contactar con el autor antes de reutilizarlo.
- Riesgo conductual deliberado: el nombre del artefacto (`impulsive-sft`) sugiere que el ajuste busca precisamente inducir un comportamiento no deseable. Esto lo convierte en un modelo de investigacion, no en un asistente. No debe exponerse a usuarios finales ni integrarse en productos sin una evaluacion de seguridad exhaustiva.
- Riesgo de alucinacion: no evaluado para el adaptador. Al tratarse de un ajuste SFT sobre un modelo instruct, es esperable que persista la tendencia a generar contenido plausible pero falso, y no hay datos que permitan descartar un aumento de esta tendencia.
- Sesgos conocidos: no documentados. No hay analisis de sesgo demografico, politico ni cultural, ni para el adaptador ni en la model card del autor.
- Idiomas: no declarados. Se desconoce si el ajuste se realizo en ingles y si degrada el rendimiento del modelo base en otros idiomas, incluido el espanol.
- Ausencia de resultados: no hay ningun benchmark publicado. Cualquier afirmacion sobre su calidad relativa frente al modelo base carece de respaldo empirico.
- Riesgo de sobreajuste al estilo: los ajustes SFT de este tipo suelen producir respuestas mas cortas, mas repetitivas o con muletillas caracteristicas. Sin evaluacion, no se puede descartar ni cuantificar.
- Advertencia de trazabilidad: no se indica la procedencia del dataset de ajuste. Existe riesgo de que contenga datos con derechos de autor o contenido sensible, algo imposible de verificar con la informacion disponible.
- Advertencia de despliegue: fusionar el adaptador en los pesos base es irreversible en la practica si no se conserva una copia del modelo original; conviene mantener el adaptador en formato PEFT separado y aplicarlo en tiempo de inferencia.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/Misalignment-Empirics/shreyans_qwen2.5-32b-it_impulsive-sft-v2-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- Libreria PEFT: https://github.com/huggingface/peft
- Articulo referenciado en los tags del repositorio (Lacoste et al., 2019, sobre emisiones de carbono en aprendizaje automatico): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental citada en la plantilla de model card: https://mlco2.github.io/impact#compute
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.

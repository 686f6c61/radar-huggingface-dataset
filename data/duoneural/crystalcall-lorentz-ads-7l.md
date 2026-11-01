# DuoNeural/CrystalCall-Lorentz-ADS-7L

## Resumen

CrystalCall-Lorentz-ADS-7L es un modelo de generación de texto especializado en *function calling* y enrutamiento de herramientas, desarrollado por DuoNeural Research Lab. Se trata de un "Crystallographic Dynamics Model" (CDM), una arquitectura experimental no euclidiana que sustituye el espacio de representación habitual por un hiperboloide de Lorentz con un perfil de curvatura tipo Anti-de Sitter (AdS). El modelo parte del vocabulario de Salesforce/xLAM-1b-fc-r y se entrena mediante destilación relacional (alineación de matrices de Gram) contra ese mismo modelo como profesor cuantizado en NF4.

Su relevancia es principalmente de investigación: propone una alternativa geométrica a los transformers euclidianos estándar, con bisectores de Voronoi planares en espacio de Minkowski para las decisiones de llamada a funciones, y un mecanismo propio denominado Inter-Layer Cascade (ILC). Con unos 266,6 millones de parámetros según los safetensors del repositorio (la model card declara 239,9M en su censo interno, una discrepancia no resuelta por el autor), es un modelo pequeño, apto para hardware de consumo, licenciado bajo Apache 2.0 y disponible en safetensors y GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CDM (Crystallographic Dynamics Model) con geometria Lorentz/AdS, 7 capas, 12 cabezas, d=768, K=8 centroides, 4 expertos MoE (d_ff=3072) |
| Parametros totales | 266.559.128 (safetensors reales); 239.908.238 segun el censo de la model card |
| Parametros activos | no disponible (la model card no especifica el mecanismo de activacion de los 4 expertos) |
| Longitud de contexto | 512 tokens (longitud de entrenamiento) |
| Tipos de cuantizacion | no disponible (distribucion en GGUF y safetensors; variantes concretas no especificadas) |
| Idiomas soportados | no disponible (entrenado con datos de function calling en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

La arquitectura se describe como un modelo de 7 capas con 12 cabezas de atencion, dimension oculta 768, 8 centroides por capa y 4 expertos tipo MoE con dimension feed-forward 3072. La innovacion central es el enrutamiento sobre la hoja superior de un hiperboloide bidimensional en espacio de Minkowski, con metrica indefinida Lorentz-Minkowski (`-x0*y0 + sum xi*yi`). Los bisectores de Voronoi entre centroides se definen como hiperplanos afines planares en el espacio ambiente (`minkowski_dot(x, u - v) = 0`), lo que segun los autores evita la distorsion no lineal de las fronteras geodesicas de geometrias de Poincare. La curvatura se inicializa con un gradiente AdS invertido por capa: `[2.60, 2.25, 1.80, 1.30, 0.80, 0.55, 0.40]`.

El entrenamiento consto de 100.000 pasos sobre una RTX 4080 Super de 32 GB en la nube, con secuencias de 512 tokens, acumulacion de gradientes 4 y tamaño de batch efectivo 8. Los datos provienen de 112.960 ejemplos de `glaiveai/glaive-function-calling-v2` y mas de 10.000 de `NousResearch/hermes-function-calling-v1`. Se aplico destilacion relacional de gramas (alineacion coseno de matrices de Gram) contra Salesforce/xLAM-1b-fc-r (739,3M de parametros en NF4) en proyecciones de capas emparejadas `{0:2, 1:6, 2:9, 3:13, 4:16, 5:20, 6:23}`. El formato de prompt es el esquema nativo de Glaive/Hermes con llamadas `<functioncall> {"name": ..., "arguments": ...}`. La telemetria reporta un "solid-state layer capping" en las capas L00, L01 y L06 (tau* = 1e10) y plasticidad dinamica en las capas intermedias.

## Capacidades

- Generacion de texto conversacional con formato de schema de funciones (Glaive/Hermes).
- Function calling: emision de llamadas `<functioncall>` con nombre de funcion y argumentos JSON tipados.
- Tool routing: seleccion de la herramienta adecuada a partir de un catalogo de funciones declarado en el system prompt.
- Gestion multi-turno de instrucciones (la capa L04 se asocia al grounding de instrucciones multi-turno segun la telemetria del autor).
- Extraccion de diccionarios de schema de herramientas (`"type"`, `"description"`).
- Transparencia tipo "glass-box": telemetria de enrutamiento por capa (curvatura y saturacion) publicada por el autor.
- No hay evidencia de capacidades de vision, audio ni razonamiento general; el entrenamiento esta acotado a function calling.

## Casos de uso

- Orquestacion de herramientas en agentes ligeros: dado su tamaño reducido (~266M), puede servir como router de intenciones que decide que funcion invocar antes de delegar la generacion de respuesta a un modelo mayor.
- Asistentes con APIs estructuradas: con el formato Glaive/Hermes en el system prompt, puede convertir peticiones de usuario en llamadas JSON a funciones como consulta de noticias, tiempo o calendarios.
- Prototipado de agentes en hardware de consumo: cabe en GPUs consumer y en CPU via GGUF, util para desarrollo local de pipelines de tool calling sin coste de API.
- Extraccion estructurada de datos: la capa asociada a "argument value typing" sugiere uso para convertir lenguaje natural en objetos JSON con tipos estrictos.
- Investigacion en geometrias no euclidianas: sirve como banco de pruebas reproducible para estudiar enrutamiento hiperbolico/AdS y mecanismos ILC en modelos pequeños.
- Clasificacion de intenciones multi-turno en chatbots: el grounding de instrucciones multi-turno permite mantener el contexto de conversacion breve (512 tokens) para decidir la accion siguiente.
- Generacion de schemas de herramientas: puede producir diccionarios de descripcion de funciones a partir de especificaciones parciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, BFCL, etc.) en la informacion disponible. La unica metrica publicada es telemetria interna de entrenamiento:

| Metrica | Valor |
|---|---|
| Mejor validation BPB | 0,0117 (perplejidad ~1,01) |
| Validation BPB final | 0,0537 (perplejidad ~1,16) |
| Divergencia KL con el profesor | 0,0803 nats |

Estos valores corresponden a tareas de modelado del formato de function calling y no son comparables directamente con benchmarks de LLMs genericos.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~266M de parametros en FP16, aproximadamente 0,6-0,8 GB de pesos mas overhead; en cuantizacion GGUF de 4 bits, en torno a 0,2-0,3 GB. No hay cifras oficiales.
- GPU recomendadas: cualquier GPU moderna es suficiente; el autor entreno el modelo en una NVIDIA RTX 4080 Super de 32 GB (nodo en la nube, nodo `p19970`).
- Consumer GPU: cabe sobradamente en GPUs de gama baja y media (RTX 3060, RTX 4060 o superiores) e incluso es viable en CPU dada su escala.
- Opciones de despliegue: transformers (libreria declarada), GGUF (compatible con llama.cpp y Ollama); no hay mencion de soporte verificado para vLLM o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| CrystalCall-Lorentz-ADS-7L | ~266M (safetensors) | 512 tokens | Function calling, geometria no euclidiana | Apache 2.0 |
| Salesforce/xLAM-1b-fc-r (profesor) | ~1.300M (739,3M en NF4) | no disponible | Function calling | no disponible en la informacion proporcionada |
| Glaive-function-calling modelos derivados | tipicamente <1B | variable | Function calling | variable |

CrystalCall es notablemente mas pequeño que su modelo profesor y que la mayoria de modelos especializados en function calling, lo que lo situa en la categoria de routers/extractores ligeros mas que en la de asistentes generales. Su ventaja diferencial es la arquitectura CDM experimental y la licencia Apache 2.0; su inconveniente, la ausencia de benchmarks comparativos y un contexto de solo 512 tokens.

## Limitaciones y advertencias

- Contexto de solo 512 tokens: inadecuado para conversaciones largas o documentos extensos.
- Entrenamiento acotado a datasets de function calling en ingles (Glaive v2 y Hermes v1); el rendimiento en castellano o en tareas generales no esta verificado y probablemente sea pobre.
- Discrepancia no resuelta entre los parametros reales de los safetensors (266,6M) y el censo de la model card (239,9M), lo que exige verificacion antes de uso en produccion.
- La terminologia de la model card (ILC, solid-state capping, curvaturas AdS) procede integramente del autor y no ha sido validada por revision independiente ni contrastada con benchmarks externos.
- Riesgo de alucinacion de esquemas JSON no evaluado; no hay datos de exactitud en benchmarks de function calling estandarizados como BFCL.
- Sesgos: no documentados por el autor; dado el entrenamiento sintetico sobre Glaive/Hermes, heredara los sesgos de esos datasets.
- Licencia Apache 2.0: sin restricciones para uso comercial, pero el modelo base (xLAM-1b-fc-r) se uso solo como profesor/vocabulario, por lo que la licencia del derivado se rige por Apache 2.0 segun la model card.
- Adopcion minima (238 descargas, 0 likes en el momento de la ficha): proyecto experimental con comunidad practicamente inexistente y sin historial de fiabilidad en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DuoNeural/CrystalCall-Lorentz-ADS-7L
- Organizacion del autor: https://huggingface.co/DuoNeural
- Repositorio de codigo: https://github.com/DuoNeural/Lattice-CDM
- Web del laboratorio: https://duoneural.com
- Framework original (Zenodo, doi:10.5281/zenodo.21158430): https://doi.org/10.5281/zenodo.21158430
- Dataset glaiveai/glaive-function-calling-v2: https://huggingface.co/datasets/glaiveai/glaive-function-calling-v2
- Dataset NousResearch/hermes-function-calling-v1: https://huggingface.co/datasets/NousResearch/hermes-function-calling-v1
- Modelo base Salesforce/xLAM-1b-fc-r: https://huggingface.co/Salesforce/xLAM-1b-fc-r

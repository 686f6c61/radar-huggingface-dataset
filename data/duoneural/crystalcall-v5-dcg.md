# DuoNeural/CrystalCall-v5-DCG

## Resumen

CrystalCall-v5-DCG es un modelo especializado en enrutado de herramientas (tool routing) y function calling desarrollado por DuoNeural Research Lab. Se trata de un "Crystallographic Dynamics Model" (CDM) de 7 capas con geometría no euclidiana (hiperbólica, basada en la bola de Poincaré), que introduce un mecanismo novedoso llamado Dynamic Cardinality Gating (DCG) para decidir cuántas llamadas a herramientas requiere una consulta: una sola, varias en paralelo, o ninguna (abstención).

El modelo parte del fine-tuning de Salesforce/xLAM-1b-fc-r y se entrena sobre el dataset Salesforce/xlam-function-calling-60k. Su objetivo es resolver el compromiso entre enrutado paralelo de herramientas y la "contaminación de slots" en consultas simples, un problema típico de arquitecturas con múltiples centroides de enrutado. Con solo 116,09 millones de parámetros, está diseñado para ejecutarse en entornos edge con recursos muy limitados.

Su relevancia actual radica en la tendencia hacia agentes pequeños y eficientes: promete un 90,0 % de precisión en enrutado paralelo y un 98,5 % de acierto en la decisión de cardinalidad, cifras muy superiores a modelos comparables de tamaño similar como FunctionGemma-270M. Publica pesos en safetensors y GGUF bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CDM (Crystallographic Dynamics Model) no euclidiano, 7 capas, 12 cabezas, enrutado Voronoi hiperbolico (K=8 centroides) con 4 expertos MoE y DCG |
| Parametros totales | 116.092.379 (safetensors) / 116.093.955 segun el censo del autor |
| Parametros activos | no disponible (el backbone incluye 4 expertos MoE, pero no se detalla el enrutado por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors y GGUF, sin detallar cuantizaciones concretas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer no euclidiano de 7 capas y 12 cabezas de atencion con dimension oculta 768. En lugar de atencion euclidiana estandar, emplea un enrutado tipo Voronoi sobre la bola de Poincare (geometria hiperbolica) con K=8 centroides, junto con 4 expertos MoE de dimension FF 768. El vocabulario es de 32.256 tokens con embeddings atados (tied) a la cabeza de modelado del lenguaje. La innovacion principal es el modulo Dynamic Cardinality Gating: una cabeza de clasificacion lineal de solo 3.843 parametros (LayerNorm de 768 mas Linear(768, 3)) conectada al estado oculto de la capa 5 (penultima), que clasifica cada consulta en tres clases: abstenerse (irrelevante), una sola llamada o llamadas paralelas. El sobrecoste arquitectonico es del 0,003 %.

El entrenamiento parte del modelo base Salesforce/xLAM-1b-fc-r y se realiza sobre el dataset Salesforce/xlam-function-calling-60k. No se ha publicado informacion sobre el numero de tokens de entrenamiento, la composicion detallada del dataset ni el uso de tecnicas como RLHF o DPO. El marco conceptual procede del framework Competitive Docking Memory de DuoNeural (referenciado en Zenodo con doi:10.5281/zenodo.21158430).

## Capacidades

- Enrutado de herramientas (tool routing): selecciona la herramienta o herramientas adecuadas a partir de esquemas en formato ChatML y consultas de usuario.
- Function calling paralelo: genera secuencias de multiples llamadas con un 90,0 % de precision en nombres de herramientas y un 80,0 % de precision en la secuencia exacta de llamadas.
- Function calling simple: 100,0 % de precision en la extraccion del nombre de la herramienta y 90,0 % en el orden exacto.
- Abstencion: detecta consultas irrelevantes con una confianza reportada del 99,997 %, evitando llamadas a herramientas innecesarias.
- Generacion de texto conversacional (pipeline text-generation), orientada a la salida estructurada de llamadas a funciones.
- Formato de salida: 100,0 % de validez sintactica en las llamadas generadas segun los datos del autor.
- No hay indicios de capacidades multimodales (vision, audio) ni de modo de razonamiento extendido (thinking mode).

## Casos de uso

- Orquestacion de agentes en dispositivos edge: con 116 millones de parametros y pesos GGUF, puede actuar como enrutador de herramientas en moviles, Raspberry Pi o dispositivos IoT sin dependencia de la nube.
- Asistentes con multiples herramientas: decide automaticamente si una consulta del usuario requiere una llamada, varias en paralelo o ninguna, ideal para asistentes que exponen APIs de calendario, meteorologia, bolsa o busqueda.
- Filtrado previo en pipelines de agentes: su cabeza de abstencion (99,99 % segun el autor) permite descartar consultas irrelevantes antes de invocar un LLM mayor, reduciendo costes de inferencia.
- Automatizacion de flujos de trabajo: enrutado de consultas a funciones internas de una aplicacion (consultas de inventario, precios de acciones, operaciones CRUD) con salida sintacticamente valida garantizada en alta proporcion.
- Despliegue como "glass-box": el censo completo de parametros publicado facilita auditoria del modelo, util en entornos regulados donde se requiere trazabilidad del enrutado.
- Prototipado rapido de agentes: integrable con la libreria transformers mediante el formato ChatML de esquemas de herramientas, adecuado para pruebas de concepto de function calling con bajo consumo de recursos.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre particiones held-out de Salesforce xLAM:

| Modelo | Parametros | Enrutado paralelo | Enrutado simple | Abstencion | Mecanismo de enrutado |
|:---|---:|---:|---:|---:|:---|
| FunctionGemma-270M | 270,0M | 39,0 % | 61,6 % | Baseline | Atencion euclidiana estandar |
| SyncCrystal CTM v1 | 46,2M | 63,2 % | 88,0 % | Moderada | Recurrencia euclidiana |
| CrystalCall v3.5 CDM | 91,3M | 87,8 % | 40,0 % | Baja | Voronoi Poincare sin gating |
| **CrystalCall-v5-DCG** | **116,1M** | **90,0 %** | **90,0 %** | **99,99 %** | **CDM Poincare + DCG** |

Metricas adicionales reportadas por el autor: precision de decision de cardinalidad del 98,5 % (100,0 % en llamadas paralelas, 97,06 % en llamadas simples), 100,0 % de validez de formato sintactico y 80,0 % de precision en secuencias exactas de llamadas paralelas. No se han publicado resultados en benchmarks genericos como MMLU, HumanEval o GSM8K. Estos datos proceden de la model card del autor y no han sido verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: con 116 millones de parametros en FP16, aproximadamente 0,3 GB solo de pesos (el repo ocupa 1,1 GB en total); en cuantizacion GGUF de 4 bits, por debajo de 100 MB de pesos. No hay cifras oficiales de VRAM.
- GPU recomendadas: cualquier GPU moderna es sobrada para este tamano; incluso puede ejecutarse sin GPU dedicada. No hay recomendaciones oficiales del autor.
- Consumer GPU: cabe con holgura en cualquier GPU consumer actual (RTX 3060, RTX 4060 o superiores); es plausible su ejecucion en CPU dado el tamano reducido.
- Opciones de despliegue: libreria transformers (formato nativo), y GGUF sugiere compatibilidad con llama.cpp y Ollama, aunque no se confirma en la documentacion disponible. No hay menciones a vLLM o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enrutado paralelo | Enrutado simple | Licencia |
|:---|---:|:---|---:|---:|:---|
| CrystalCall-v5-DCG | 116,1M | no disponible | 90,0 % | 90,0 % | Apache 2.0 |
| FunctionGemma-270M | 270,0M | no disponible | 39,0 % | 61,6 % | no disponible |
| SyncCrystal CTM v1 | 46,2M | no disponible | 63,2 % | 88,0 % | no disponible |
| Salesforce xLAM-1b-fc-r (base) | ~1.000M | no disponible | no disponible | no disponible | Apache 2.0 |

CrystalCall-v5-DCG es mas pequeño que FunctionGemma-270M y, segun los datos del autor, lo supera con claridad en enrutado paralelo y simple. Frente a su predecesor CrystalCall v3.5, corrige el problema de sobrellamada de slots en consultas simples (del 40,0 % al 90,0 %). Su modelo base, xLAM-1b-fc-r, es aproximadamente 9 veces mayor. Los datos de comparacion proceden de la model card del autor.

## Limitaciones y advertencias

- Modelo altamente especializado: esta orientado al enrutado de herramientas, no a la generacion de texto general, razonamiento o codigo; su rendimiento en tareas fuera del dominio xLAM es desconocido.
- Los benchmarks proceden exclusivamente de la model card del autor y de particiones del mismo dataset de entrenamiento (xLAM); no hay verificacion independiente ni evaluacion en benchmarks externos.
- Riesgo de alucinacion: no se ha publicado informacion especifica, pero al ser un modelo muy pequeño (116M) entrenado en un dominio estrecho, es esperable un comportamiento degradado fuera de distribucion.
- Longitud de contexto e idiomas soportados no documentados, lo que dificulta evaluar su uso con esquemas de herramientas extensos o en castellano y otros idiomas.
- Sesgos conocidos: no disponible.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial, aunque no hay garantias de ningun tipo.
- Proyecto de un laboratorio independiente con metricas muy llamativas (por ejemplo, 99,997 % de confianza en abstencion); se recomienda validacion propia en el caso de uso concreto antes de pasar a produccion.
- La documentacion publica esta incompleta (la model card aparece truncada), por lo que detalles de inferencia y despliegue pueden requerir consultar el repositorio de codigo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DuoNeural/CrystalCall-v5-DCG
- Organizacion DuoNeural en Hugging Face: https://huggingface.co/DuoNeural
- Repositorio de codigo (Lattice-CDM): https://github.com/DuoNeural/Lattice-CDM
- Sitio web de DuoNeural: https://duoneural.com
- Modelo base: https://huggingface.co/Salesforce/xLAM-1b-fc-r
- Dataset de entrenamiento: https://huggingface.co/datasets/Salesforce/xlam-function-calling-60k
- Framework CDM en Zenodo: doi:10.5281/zenodo.21158430

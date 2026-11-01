# mradermacher/py2mermaid-qwen3-4b-GGUF

## Resumen

Py2mermaid-qwen3-4b-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo nharder/py2mermaid-qwen3-4b, realizadas por el cuantizador mradermacher. El modelo base es un fine-tuning de Qwen3 4B entrenado mediante destilación con un adaptador LoRA sobre el dataset nharder/py2mermaid-data, con el objetivo de resolver un problema muy concreto: convertir código Python en diagramas Mermaid.

La relevancia de este modelo radica en su especialización. Mientras que los modelos generales suelen producir diagramas Mermaid inconsistentes o con errores de sintaxis, este modelo se ha ajustado específicamente para esa tarea, generando salidas estructuradas y válidas a partir de código fuente Python. Al distribuirse en GGUF, puede ejecutarse localmente en hardware modesto, incluidas GPU de consumo e incluso CPU, lo que lo hace idóneo para integrarse en pipelines de documentación automática sin depender de APIs externas.

En cuanto a dimensiones, el modelo base tiene 4.022.468.096 parámetros (unos 4.000 millones) y hereda la arquitectura transformer de la familia Qwen3. El repositorio de cuantizaciones ocupa 36,4 GB en total y ofrece versiones desde Q2_K (1,8 GB) hasta f16 (8,2 GB). La licencia es Apache 2.0, lo que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3), ajustado con LoRA |
| Parametros totales | 4.022.468.096 (~4.022 millones) |
| Parametros activos | no disponible (no se indica si es MoE; todo apunta a modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base esta disponible en safetensors/transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3 4B, un transformer denso de la familia Qwen de Alibaba, y aplica un ajuste fino mediante LoRA (Low-Rank Adaptation), tecnica de entrenamiento eficiente que congela los pesos base y solo entrena matrices de bajo rango. Los metadatos del repositorio indican ademas que el entrenamiento se realizo por destilacion (distillation), lo que sugiere que se generaron datos de entrenamiento con un modelo profesor mas grande para maximizar la calidad de las salidas con un presupuesto de datos limitado.

Los datos de entrenamiento provienen del dataset nharder/py2mermaid-data, un conjunto especifico de pares codigo Python / diagrama Mermaid. No se ha publicado informacion sobre el numero de tokens, la composicion detallada del dataset ni el uso de tecnicas de alineacion como RLHF o DPO. No se han documentado innovaciones tecnicas adicionales mas alla del propio ajuste por LoRA y la destilacion.

## Capacidades

- Conversion de codigo Python a diagramas Mermaid: la capacidad central del modelo, generando sintaxis Mermaid a partir de codigo fuente.
- Generacion de texto conversacional: hereda las capacidades base de Qwen3 4B, aunque el ajuste fino esta orientado a la tarea de diagramas.
- Comprension de codigo Python: analiza estructuras de codigo (clases, funciones, flujos) para representarlas graficamente.
- Ejecucion local eficiente: gracias al formato GGUF, funciona con llama.cpp, Ollama y herramientas compatibles sin GPU dedicada.
- No hay informacion publicada sobre soporte de tool calling, capacidades de agente, vision, audio ni modo de razonamiento extendido para esta variante ajustada.

## Casos de uso

- Documentacion automatica de repositorios Python: integracion en pipelines de CI/CD que, tras cada commit, generan diagramas Mermaid de la arquitectura del codigo y los insertan en la documentacion (por ejemplo, en GitHub Pages o MkDocs, que renderizan Mermaid de forma nativa).
- Generacion de diagramas de clases y modulos: analisis de ficheros Python para producir diagramas de clases UML en Mermaid, util para onboarding de nuevos desarrolladores en bases de codigo grandes.
- Revision de codigo asistida: convertir un modulo complejo a diagrama antes de una code review para visualizar flujos de ejecucion y dependencias rapidamente.
- Herramientas de IDE y extensiones de editor: integracion en plugins de VS Code o similares que generen un diagrama del fichero abierto bajo demanda, aprovechando que el modelo cabe en una GPU de consumo.
- Procesamiento por lotes sin coste de API: dado el tamano contenido (2,5 GB en Q4_K_M), es viable procesar grandes volumenes de ficheros Python en local o en una maquina barata, sin gastos por token.
- Ensenanza de programacion: generacion de diagramas a partir de ejemplos de codigo para materiales didacticos, ayudando a estudiantes a visualizar la estructura de programas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (segun cuantizacion, tamano del fichero GGUF):
  - Q2_K: ~1,8 GB
  - Q3_K_M: ~2,2 GB
  - Q4_K_M / Q4_K_S: ~2,5-2,6 GB
  - Q5_K_M: ~3,0 GB
  - Q6_K: ~3,4 GB
  - Q8_0: ~4,4 GB
  - f16: ~8,2 GB
  - A estas cifras hay que anadir la memoria para el KV cache, dependiente de la longitud de contexto (no disponible).
- GPU recomendadas: cualquier GPU moderna con 4-6 GB de VRAM ejecuta las cuantizaciones Q4-Q8 con holgura. No se requieren A100 ni H100; no hay datos oficiales de rendimiento por GPU.
- Consumer GPU: cabe comodamente en una RTX 3060 de 12 GB, RTX 4060 Ti, RTX 4070 o superiores en todas las cuantizaciones, incluida f16. Incluso GPUs de 4 GB pueden ejecutar Q2_K/Q3_K. Tambien es viable la ejecucion solo con CPU (llama.cpp) dado el tamano reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF. El modelo base (safetensors) puede desplegarse con transformers o vLLM.
- Latencia y throughput estimados: no disponibles; al ser un modelo de 4B cuantizado a 4 bits, se espera inferencia rapida en GPU de consumo (decenas de tokens por segundo), pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Tarea | Licencia | Notas |
|---|---|---|---|---|---|
| py2mermaid-qwen3-4b-GGUF | 4.022 millones | GGUF (12 cuants) | Codigo Python a Mermaid (especializado) | Apache 2.0 | Fine-tuning LoRA con destilacion sobre dataset especifico |
| Qwen3 4B (base) | ~4.000 millones | Safetensors, GGUF (comunidad) | Uso general | Apache 2.0 | Modelo base; sin especializacion en Mermaid |
| Qwen2.5-Coder 3B/7B | 3.000/7.000 millones | Safetensors, GGUF (comunidad) | Codigo general | Apache 2.0 / Qwen Research | Fuerte en codigo pero no ajustado especificamente para diagramas Mermaid |

La ventaja diferencial frente a modelos generales de codigo de tamano similar es la fiabilidad de la salida Mermaid gracias al ajuste fino especializado; el precio es una perdida de generalidad frente al modelo base Qwen3 4B o frente a Qwen2.5-Coder.

## Limitaciones y advertencias

- Especializacion estrecha: el ajuste fino esta orientado a la conversion Python-Mermaid; el rendimiento en otras tareas (razonamiento general, escritura, otros lenguajes) puede haberse degradado respecto al modelo base Qwen3 4B.
- Idioma: el modelo esta etiquetado solo para ingles; no hay garantias de calidad en castellano ni en otros idiomas.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar diagramas Mermaid con nodos o relaciones inexistentes en el codigo fuente; conviene validar la salida, idealmente renderizandola y comprobando errores de sintaxis.
- Contexto: la longitud de ventana no esta documentada en el repositorio; para ficheros Python muy largos puede haber truncamiento no especificado.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar tambien la licencia del dataset de entrenamiento (nharder/py2mermaid-data), cuya licencia no se detalla en la model card.
- Solo se ofrecen cuantizaciones estaticas; las cuantizaciones imatrix/weighted no estaban disponibles en el momento de publicacion del repositorio.
- Al ser un modelo de comunidad sin model card tecnica detallada, no hay benchmarks ni evaluaciones publicadas que permitan verificar la calidad de forma rigurosa antes de usarlo en produccion.

## Enlaces

- Repositorio GGUF (esta ficha): https://huggingface.co/mradermacher/py2mermaid-qwen3-4b-GGUF
- Modelo base: https://huggingface.co/nharder/py2mermaid-qwen3-4b
- Dataset de entrenamiento: https://huggingface.co/datasets/nharder/py2mermaid-data
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#py2mermaid-qwen3-4b-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Nota de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/

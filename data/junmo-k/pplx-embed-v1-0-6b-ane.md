# junmo-k/pplx-embed-v1-0.6b-ane

## Resumen

pplx-embed-v1-0.6b-ane es una conversion a Core ML del modelo de embeddings `perplexity-ai/pplx-embed-v1-0.6b`, publicada por el usuario junmo-k y optimizada para ejecutarse sobre el Apple Neural Engine (ANE) de los chips de Apple Silicon. No se trata de un modelo nuevo entrenado desde cero, sino de un artefacto de despliegue: los pesos originales de Perplexity AI se han convertido al formato Core ML y se han cuantizado a int8 con signo para aprovechar la aceleracion por hardware del Neural Engine en Macs con chip M-series.

El modelo base es un encoder bidireccional de tipo Qwen3 (la etiqueta del repositorio es `bidirectional_pplx_qwen3`) con aproximadamente 0,6 mil millones de parametros, disenado para generar representaciones vectoriales (embeddings) de texto para tareas de recuperacion, busqueda semantica y similitud. Esta version mantiene la funcionalidad de `feature-extraction` del original, pero anade un pipeline de inferencia especifico (`ANERun`) que compila los paquetes Core ML en el Mac de destino.

Su relevancia actual radica en que permite ejecutar un modelo de embeddings de calidad en hardware de consumo Apple sin GPU dedicada, con un consumo energetico bajo y una ventana de contexto que puede alcanzar los 32.768 tokens. La fidelidad respecto al modelo original es alta: la similitud coseno minima medida sobre 22 entradas de prueba es de 0,998850, y en entradas largas de codigo, coreano y Unicode mixto supera 0,999.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer bidireccional (bidirectional_pplx_qwen3) |
| Parametros totales | ~0,6 mil millones (segun nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (por defecto limitado a 2.048 en ANERun) |
| Tipos de cuantizacion | int8 con signo (salida cuantizada); pesos convertidos a Core ML |
| Idiomas soportados | no disponible (la model card menciona pruebas en ingles, coreano y Unicode mixto) |
| Licencia | MIT |
| Formato de pesos | Core ML (paquetes fuente compilados por ANERun); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base `pplx-embed-v1-0.6b` es un encoder transformer bidireccional derivado de la familia Qwen3, adaptado por Perplexity AI para generar embeddings de texto. La variante publicada por junmo-k no reentrena el modelo: convierte los pesos originales (en FP32) a Core ML y los cuantiza a int8 para su ejecucion en el Apple Neural Engine. La inferencia produce un vector de embedding cuantizado a int8 con signo, y el instalador de ANERun verifica el manifiesto y compila los paquetes Core ML en el Mac de destino.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base uso RLHF o DPO; esos datos corresponden a la model card original de Perplexity AI y no se incluyen en la informacion proporcionada. La innovacion tecnica destacable de esta version es la conversion a Core ML con cuantizacion int8 y la integracion con ANERun, que permite ejecutar el modelo en el Neural Engine con una fidelidad de vectores muy alta respecto al original en FP32.

## Capacidades

- Generacion de embeddings de texto para tareas de recuperacion y similitud semantica.
- Extraccion de caracteristicas (`feature-extraction`) sobre entradas de hasta 32.768 tokens.
- Procesamiento de codigo, texto multilingue (incluido coreano) y Unicode mixto con alta fidelidad vectorial.
- Ejecucion en el Apple Neural Engine de chips M-series mediante Core ML.
- Salida cuantizada a int8 con signo, apta para indexacion y busqueda vectorial.
- No se documentan capacidades de generacion de texto, tool calling, agentes, vision ni audio.

## Casos de uso

- Busqueda semantica en aplicaciones locales para Mac: el modelo genera embeddings de documentos y consultas en el propio dispositivo, sin enviar datos a la nube, gracias a su ejecucion sobre el Neural Engine.
- Recuperacion aumentada (RAG) en entornos de desarrollo con Apple Silicon: se indexan fragmentos de documentacion o codigo de hasta 32.768 tokens y se recuperan los mas relevantes para alimentar un LLM.
- Clasificacion y agrupamiento de textos: los vectores int8 permiten calcular similitudes y agrupar documentos por tematica en pipelines de analisis de datos.
- Deduplicacion de contenido: la alta fidelidad vectorial (similitud coseno > 0,998) permite detectar near-duplicates en corpus grandes con umbrales fiables.
- Procesamiento de codigo en herramientas de desarrollo: la model card reporta similitud de 0,999585 en entradas de codigo de 32.768 tokens, lo que lo hace adecuado para indexar repositorios y buscar fragmentos por significado.
- Analisis de texto multilingue en local: las pruebas con coreano y Unicode mixto sugieren utilidad para corpus con varios alfabetos, aunque no se detalla la lista completa de idiomas soportados.
- Prototipado de sistemas de recomendacion basados en contenido: los embeddings permiten calcular afinidad entre items y perfiles de usuario en un Mac de consumo.

## Benchmarks y rendimiento

La model card no incluye benchmarks de recuperacion propios; remite a la model card original para esos datos. Si se documenta la fidelidad de los vectores respecto al modelo original en FP32:

| Entrada de prueba | Similitud coseno respecto al original |
|---|---:|
| Minima en las 22 entradas de prueba | 0,998850 |
| Codigo, 32.768 tokens | 0,999585 |
| Texto en coreano, 32.768 tokens | 0,999120 |
| Unicode mixto, 32.768 tokens | 0,999037 |

No se han publicado resultados de benchmarks de recuperacion (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: Apple Silicon con Neural Engine (probado en un Mac mini M4 con 16 GiB de RAM).
- VRAM estimada: no aplica; el modelo se ejecuta en el Neural Engine y la memoria unificada del sistema. El repositorio ocupa 2,4 GB.
- GPU recomendadas: no aplica GPU dedicada; requiere chip M-series con ANE.
- Cabe en hardware de consumo Apple: si, en Macs con chip M4 y presumiblemente en otras generaciones M-series con Neural Engine.
- Opciones de despliegue: Core ML mediante ANERun (`anerun models install`, `anerun embed`); no se documentan vLLM, llama.cpp, Ollama ni TGI para esta variante.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pplx-embed-v1-0.6b-ane | ~0,6 B | 32.768 tokens | Core ML / Apple Neural Engine | MIT | Hugging Face (725 descargas) |
| perplexity-ai/pplx-embed-v1-0.6b (original) | ~0,6 B | 32.768 tokens (segun model card original) | safetensors / GPU generica | no disponible en la informacion | Hugging Face |
| Otros modelos de embeddings de ~0,6 B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo original y su conversion, ya que no se proporcionan datos de alternativas equivalentes en la informacion disponible.

## Limitaciones y advertencias

- Es un artefacto de conversion, no un modelo entrenado de forma independiente; su calidad depende enteramente del modelo base de Perplexity AI.
- La cuantizacion int8 introduce una desviacion minima pero no nula respecto al FP32 (similitud coseno minima de 0,998850).
- El contexto por defecto en ANERun esta limitado a 2.048 tokens; para usar los 32.768 tokens hay que pasar `--max-tokens 32768` en la instalacion y en tiempo de ejecucion.
- Requiere hardware Apple Silicon con Neural Engine y la herramienta ANERun; no es desplegable en GPU NVIDIA ni en entornos sin Core ML.
- No se documentan los idiomas soportados oficialmente; las pruebas multilingues se limitan a coreano y Unicode mixto.
- No se han publicado datos sobre sesgos, riesgo de alucinacion (no genera texto) ni limitaciones de contexto especificas mas alla del cap configurable.
- La licencia MIT permite uso comercial, pero conviene verificar la licencia del modelo base original antes de redistribuir.
- El modelo tiene 0 likes y 725 descargas, lo que indica una adopcion temprana y poca validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/junmo-k/pplx-embed-v1-0.6b-ane
- Modelo base original: https://huggingface.co/perplexity-ai/pplx-embed-v1-0.6b
- Revision original convertida: https://huggingface.co/perplexity-ai/pplx-embed-v1-0.6b/tree/2c4d510dd4a732063c31a0f70193e35067b51fd8
- Herramienta ANERun: https://github.com/junmo-kim/ANERun
- Licencia: https://huggingface.co/junmo-k/pplx-embed-v1-0.6b-ane/blob/main/LICENSE
- Aviso de conversion: https://huggingface.co/junmo-k/pplx-embed-v1-0.6b-ane/blob/main/NOTICE

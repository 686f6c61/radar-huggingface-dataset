# mradermacher/etr1o-v1.4-GGUF

## Resumen

`mradermacher/etr1o-v1.4-GGUF` es una publicacion de cuantizaciones GGUF estaticas del modelo `marcuscedricridia/etr1o-v1.4`, un merge de modelos creado con la herramienta mergekit. El autor de esta ficha (mradermacher) no entrena ni ajusta el modelo, sino que se limita a convertir los pesos originales en formato GGUF para su uso con llama.cpp y derivados. El modelo subyacente cuenta con aproximadamente 14.765 millones de parametros (unos 14,7 mil millones), lo que lo situa en la franja de modelos de 13-15B, y esta etiquetado como conversacional y orientado al idioma ingles.

La relevancia de esta publicacion es practica: permite ejecutar un modelo de ~14,7B en hardware de consumo mediante cuantizaciones que van desde 5,9 GB (Q2_K) hasta 15,8 GB (Q8_0). Al tratarse de un merge sin model card detallada en la fuente original, la informacion disponible sobre arquitectura interna, datos de entrenamiento, contexto y benchmarks es muy limitada; esta ficha refleja fielmente lo que se puede verificar y marca como "no disponible" todo lo que no consta.

El repositorio ocupa 102 GB e incluye diez variantes de cuantizacion. No se han publicado cuantizaciones ponderadas o imatrix por parte de este autor, segun indica la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base creado con mergekit; presumiblemente transformer decoder-only, sin confirmacion) |
| Parametros totales | 14.765.947.904 (~14,7B) |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base original esta en safetensors/transformers |

## Arquitectura y entrenamiento

La unica informacion verificable es que el modelo base `marcuscedricridia/etr1o-v1.4` fue producido mediante mergekit, es decir, es un merge de pesos de otros modelos, no un entrenamiento desde cero. La model card de esta publicacion GGUF no detalla la arquitectura interna (tipo de transformer, atencion, capas), ni los modelos componentes del merge, ni la estrategia de fusion empleada. El recuento de parametros (14.765.947.904) procede de los safetensors del modelo base.

No se dispone de datos sobre volumen de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO ni innovaciones tecnicas (atencion lineal, decodificacion especulativa, etc.). Las cuantizaciones son estaticas (convertidas con la via `hf` de llama.cpp), sin versiones imatrix o ponderadas, lo que sugiere una conversion directa sin calibracion adicional por importancia de pesos.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` indica que el modelo esta orientado a dialogos multi-turno.
- Idioma: soporte declarado unicamente para ingles (`en`).
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que puede servirse mediante infraestructura de inferencia compatible con la API de Hugging Face.
- Ejecucion local: al estar en GGUF, es compatible con llama.cpp, Ollama y otros runners basados en GGUF.
- Tool calling / function calling: no disponible (no consta en la informacion).
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Vision, audio o modo thinking: no disponible.
- Capacidades multilingues: no disponible (solo ingles declarado).

## Casos de uso

- Chat local en hardware de consumo: con la cuantizacion Q4_K_M (9,1 GB) el modelo cabe en GPUs con 12 GB de VRAM o en configuraciones CPU+GPU mixtas, permitiendo un asistente conversacional en ingles sin depender de servicios en la nube.
- Prototipado rapido de aplicaciones conversacionales: usar Q4_K_S (8,7 GB, marcada como "fast, recommended" por el autor) para iterar sobre prompts y flujos de dialogo en entornos de desarrollo con recursos limitados.
- Despliegue en portatiles o estaciones de trabajo sin GPU dedicada: las variantes Q2_K (5,9 GB) y Q3_K_S (6,8 GB) permiten inferencia por CPU con requisitos de RAM moderados, util para demos y pruebas offline.
- Evaluacion comparativa de merges: al ser un merge de modelos, puede emplearse como candidato en pruebas A/B frente a otros merges de tamano similar para tareas de conversacion en ingles.
- Servicio de inferencia compatible con endpoints: gracias al tag `endpoints_compatible`, puede integrarse en plataformas de serving que consumen modelos GGUF para desplegar un chatbot interno de baja concurrencia.
- Experimentacion con cuantizacion: las diez variantes permiten medir el compromiso calidad/tamano (de Q2_K a Q8_0) sobre un mismo modelo base, util para decidir que variante desplegar en produccion.
- Uso educativo y de investigacion: estudiar el comportamiento de un merge de ~14,7B cuantizado frente al modelo original en safetensors, comparando perplejidad y calidad de respuesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (peso de pesos, sin contar KV cache): Q2_K ~5,9 GB; Q3_K_S ~6,8 GB; Q3_K_M ~7,4 GB; Q3_K_L ~8,0 GB; IQ4_XS ~8,3 GB; Q4_K_S ~8,7 GB; Q4_K_M ~9,1 GB; Q5_K_S ~10,4 GB; Q5_K_M ~10,6 GB; Q6_K ~12,2 GB; Q8_0 ~15,8 GB.
- GPU recomendadas: para Q4_K_M en adelante, GPUs con 12-16 GB de VRAM (RTX 4070 Ti Super, RTX 4080, RTX 4090, A10, L4). Para Q8_0, GPUs con 16-24 GB (RTX 4090, A100 40 GB). Para Q2_K-Q3_K, GPUs de 8 GB (RTX 3060 Ti, RTX 4060) o incluso CPU.
- Cabe en GPU de consumo: si. Las variantes Q4_K_S y Q4_K_M (8,7-9,1 GB) entran en GPUs de 12 GB; Q2_K y Q3_K_S entran en GPUs de 8 GB; Q8_0 requiere 16 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; tambien servidores de inferencia que acepten GGUF y modelos con tag `endpoints_compatible`.
- Latencia y throughput: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato disponible | Notas |
|---|---|---|---|---|---|
| etr1o-v1.4 (esta ficha) | ~14,7B | no disponible | no disponible | GGUF (10 variantes) | Merge via mergekit, solo ingles |
| Modelos de ~13-14B tipo Llama 2 13B / Qwen 14B | 13-14B | 4K-32K (segun modelo) | varía (Llama 2 custom, Apache 2.0 en Qwen) | safetensors, GGUF | Referencia de tamano; no se dispone de comparacion de rendimiento con etr1o-v1.4 |
| Merges comunitarios de ~13-15B (p. ej. variantes estilo "merge de instruct") | 13-15B | no disponible | varía | GGUF frecuentemente | Categoria comparable por origen (mergekit); rendimiento no verificado |

No se dispone de datos de benchmarks ni de comparaciones verificadas entre este modelo y alternativas concretas; la tabla anterior solo situa la categoria por tamano y origen.

## Limitaciones y advertencias

- Idiomas: solo se declara ingles; el rendimiento en castellano no esta verificado y probablemente sea deficiente.
- Licencia: no disponible. Antes de uso comercial es imprescindible verificar la licencia del modelo base `marcuscedricridia/etr1o-v1.4` y de los modelos componentes del merge, ya que un merge hereda restricciones de sus fuentes.
- Origen merge: al ser un merge de pesos, no hay garantia de coherencia interna; pueden aparecer comportamientos erraticos o degradacion en tareas especificas no verificadas.
- Alucinacion: no hay evaluacion publicada; todo modelo generativo sin benchmarks verificados presenta riesgo de alucinacion, especialmente en dominios factuales.
- Contexto: longitud no disponible; no planificar casos de uso con ventanas largas sin verificar empiricamente.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_M estan marcadas como de menor calidad por el propio autor; para produccion se recomienda Q4_K_M o superior.
- Sin imatrix: no hay cuantizaciones ponderadas por importancia, lo que puede reducir la calidad frente a alternativas imatrix de igual tamano.
- Repositorio grande: 102 GB en total; descargar solo la variante necesaria.
- Model card minima: no hay documentacion sobre datos de entrenamiento, sesgos o evaluaciones; cualquier despliegue en produccion requiere evaluacion propia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/etr1o-v1.4-GGUF
- Modelo base: https://huggingface.co/marcuscedricridia/etr1o-v1.4
- Pagina de descargas del autor para este modelo: https://hf.tst.eu/model#etr1o-v1.4-GGUF
- Guia de uso de GGUF (referencia citada por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- mergekit (herramienta de merge citada en los tags): https://github.com/arcee-ai/mergekit

# mradermacher/dhbacmes-3b-slerp-GGUF

## Resumen

dhbacmes-3b-slerp-GGUF es la version cuantizada en formato GGUF del modelo fusionado liminerity/dhbacmes-3b-slerp, un merge de 3.007.703.808 parametros (aproximadamente 3B) construido mediante la tecnica SLERP (Spherical Linear Interpolation) con la herramienta mergekit y el flujo lazymergekit. El autor del merge es liminerity y la cuantizacion la realiza mradermacher, un conocido publicador de cuantizaciones GGUF para llama.cpp y ecosistemas compatibles.

El modelo combina pesos de liminerity/herbaccbaccules-3b-slerp y KnutJaegersberg/Deita-2b, lo que sugiere un intento de heredar capacidades conversacionales e instructivas del linaje Deita junto con el comportamiento del modelo base de 3B. Esta orientado a generacion conversacional en ingles y se distribuye con licencia Apache 2.0, lo que facilita su uso comercial y su integracion en pipelines de inferencia local.

Su relevancia practica radica en el formato: al ofrecerse en cuantizaciones que van de Q2_K (1,4 GB) a f16 (6,1 GB), puede ejecutarse en hardware de consumo modesto, incluidos equipos sin GPU dedicada o con GPUs de gama media-baja. Sin embargo, conviene senalar que no se han publicado benchmarks ni una model card detallada del merge original en la informacion disponible, por lo que las expectativas de rendimiento deben calibrarse con pruebas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de los modelos base del merge; detalles no disponibles) |
| Parametros totales | 3.007.703.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusion de pesos (model merging) mediante SLERP, implementada con mergekit y lazymergekit. SLERP interpola esfericamente los tensores de dos modelos, lo que en la practica produce un modelo con caracteristicas mezcladas de ambos linajes sin necesidad de entrenamiento adicional. Los modelos de origen declarados son liminerity/herbaccbaccules-3b-slerp y KnutJaegersberg/Deita-2b, ambos orientados a uso conversacional e instructivo.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron fases de RLHF, DPO o ajuste supervisado en el merge original. Tampoco se documentan innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, modos de razonamiento) mas alla de la propia tecnica de fusion. Al tratarse de una cuantizacion, el trabajo de mradermacher se limita a convertir los pesos a GGUF con distintos niveles de precision, sin reentrenamiento.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del linaje Deita y del modelo base de 3B.
- Razonamiento basico y respuesta a instrucciones, condicionado por la calidad del merge (sin benchmarks publicados que lo confirmen).
- Generacion de codigo y matematicas a nivel basico, no verificado con evaluaciones publicadas.
- Soporte multilingue limitado: la model card solo declara ingles.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- No se documenta vision, audio ni modo thinking.
- Compatible con endpoints y con el ecosistema llama.cpp por el formato GGUF.

## Casos de uso

- Prototipado local de asistentes conversacionales: con cuantizaciones Q4_K_M (2,1 GB) o Q5_K_M (2,3 GB) puede ejecutarse en portatiles con 8-16 GB de RAM para probar flujos de chat antes de migrar a modelos mayores.
- Experimentacion con model merging: util para investigadores que quieran evaluar como se comporta una fusion SLERP de 3B frente a sus modelos de origen en tareas de instruccion.
- Generacion de texto offline en entornos con recursos limitados: al caber en Q2_K (1,4 GB), permite desplegar generacion de texto en dispositivos de borde o contenedores con poca memoria.
- Educacion y demos: sirve para ilustrar el funcionamiento de cuantizaciones GGUF y de la inferencia con llama.cpp en talleres o cursos.
- Filtrado y clasificacion ligera de texto en ingles: tareas de etiquetado o resumen corto donde la latencia y el coste importan mas que la precision maxima.
- Base para fine-tuning posterior: al estar disponible en safetensors en el modelo base y con licencia Apache 2.0, puede servir como punto de partida para ajustes especificos en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,5-2 GB para Q2_K, 2-2,5 GB para Q4_K_M, 3-3,5 GB para Q8_0 y 6-7 GB para f16, incluyendo overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060) para cuantizaciones Q4/Q5; A100 o H100 no son necesarias y estarian sobredimensionadas.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna de 4 GB o mas; tambien puede ejecutarse en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, text-generation-webui, y servidores compatibles con la API de OpenAI mediante llama.cpp server o vLLM (este ultimo con soporte GGUF limitado).
- Latencia y throughput: no disponibles; en una RTX 4060 con Q4_K_M se puede esperar un throughput del orden de decenas de tokens por segundo, pero es una estimacion no verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| dhbacmes-3b-slerp-GGUF | 3,0B | no disponible | Apache 2.0 | GGUF | Merge SLERP, solo ingles, sin benchmarks |
| Qwen2.5-3B-Instruct | 3,1B | 32.768 tokens (en la version original) | Apache 2.0 | safetensors, GGUF | Modelo oficial con benchmarks publicados y soporte multilingue |
| Llama-3.2-3B-Instruct | 3,2B | 131.072 tokens | Llama 3.2 Community License | safetensors, GGUF | Buen rendimiento en instrucciones, licencia con restricciones |
| Phi-3.5-mini-instruct | 3,8B | 131.072 tokens | MIT | safetensors, GGUF | Fuerte en razonamiento y codigo para su tamano |

La comparativa se basa en caracteristicas publicas de modelos de tamano similar; no se dispone de datos de rendimiento del modelo evaluado para confrontarlos directamente.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de su calidad frente a modelos oficiales de 3B.
- Sesgos desconocidos: al ser un merge sin documentacion de datos de entrenamiento, no se pueden evaluar sesgos de genero, raza o ideologicos.
- Riesgo de alucinacion: inherente a los modelos de 3B y agravado por la falta de evaluaciones; no recomendado para tareas de alta precision sin verificacion.
- Idioma: solo se declara ingles; el rendimiento en castellano no esta garantizado y probablemente sea deficiente.
- Contexto: no documentado, lo que impide planificar casos de uso con ventanas largas.
- Licencia Apache 2.0: permite uso comercial, pero el merge hereda las obligaciones de los modelos de origen (Deita y el modelo base de 3B), cuyas licencias conviene revisar antes de produccion.
- Modelo de nicho con pocas descargas (95) y sin likes: no hay comunidad que valide su comportamiento en produccion.
- Las cuantizaciones Q2_K y Q3_K_M pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso real.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/dhbacmes-3b-slerp-GGUF
- Modelo base: https://huggingface.co/liminerity/dhbacmes-3b-slerp
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/dhbacmes-3b-slerp-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#dhbacmes-3b-slerp-GGUF
- Modelo de origen 1: https://huggingface.co/liminerity/herbaccbaccules-3b-slerp
- Modelo de origen 2: https://huggingface.co/KnutJaegersberg/Deita-2b
- Preguntas frecuentes y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (ejemplo de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

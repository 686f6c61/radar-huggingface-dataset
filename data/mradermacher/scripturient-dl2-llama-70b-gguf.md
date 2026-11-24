# mradermacher/Scripturient-DL2-LLaMa-70B-GGUF

## Resumen
Scripturient-DL2-LLaMa-70B-GGUF es la version cuantizada en formato GGUF del modelo TareksTesting/Scripturient-DL2-LLaMa-70B, un merge de modelos de 70.000 millones de parametros construido con mergekit. El trabajo de cuantizacion lo firma mradermacher, un actor habitual en el ecosistema GGUF conocido por publicar versiones estaticas de modelos grandes para su uso con llama.cpp y derivados. El modelo base parte de la arquitectura LLaMa de 70B, con 70.553.706.560 parametros reales confirmados en los tensores safetensors del repositorio original.

La relevancia de esta ficha es practica: permite ejecutar un modelo de 70B en hardware mas modesto gracias a las 11 cuantizaciones publicadas, desde Q2_K (26,5 GB) hasta Q8_0 (75,1 GB). No obstante, se trata de un modelo de nicho con solo 32 descargas y 0 likes en el momento de la consulta, sin model card tecnica detallada, sin benchmarks publicados y sin licencia declarada, lo que limita seriamente su uso en produccion sin una evaluacion previa por parte del equipo que lo adopte.

La informacion disponible es escasa: el autor de la cuantizacion no documenta el proceso de merge del modelo original, no se especifican datos de entrenamiento, contexto ni idiomas mas alla del ingles declarado en los tags. Esta ficha refleja fielmente lo que se puede verificar y marca explicitamente como "no disponible" todo lo que no consta en las fuentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basada en LLaMa (derivada del modelo base de 70B) |
| Parametros totales | 70.553.706.560 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones) y safetensors (modelo base original) |

## Arquitectura y entrenamiento
El modelo subyacente es un merge construido con mergekit, segun los tags del repositorio. Esto implica que no ha sido entrenado desde cero, sino que combina los pesos de dos o mas modelos de la familia LLaMa de 70B mediante alguna estrategia de fusion (probablemente SLERP, TIES o DARE, aunque la informacion disponible no especifica cual). La arquitectura resultante es un transformer decoder-only con atencion multi-cabeza estandar, sin innovaciones documentadas como atencion lineal, decodificacion especulativa o capas SSM.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO o SFT posteriores al merge. Tampoco se documenta la ventana de contexto nativa del modelo original. El unico dato tecnico verificable es el recuento de parametros (70.553.706.560), que coincide con un LLaMa-2-70B o LLaMa-3-70B en cuanto a escala. La cuantizacion la realizo mradermacher con su pipeline habitual (quantize_version 2, output_tensor_quantised 1, convert_type hf), generando cuantizaciones estaticas sin versiones ponderadas ni imatrix, que el propio autor indica que probablemente no publicara salvo peticion expresa.

## Capacidades
- Generacion de texto conversacional en ingles, segun el tag `conversational` del repositorio.
- Razonamiento general y respuesta a instrucciones, heredado del modelo base LLaMa de 70B, aunque sin evaluacion publica que lo confirme.
- No hay evidencia documentada de soporte de tool calling ni function calling.
- No hay evidencia documentada de capacidades de agente ni razonamiento multi-paso.
- Capacidades multilingues limitadas al ingles declarado; no se confirman otros idiomas.
- No se documentan modos especiales como thinking mode, vision o audio.
- Compatible con endpoints (tag `endpoints_compatible`) y con el ecosistema transformers/llama.cpp.

## Casos de uso
- Prototipado local de asistentes conversacionales en ingles: con la cuantizacion Q4_K_M (42,6 GB) se puede desplegar en una estacion de trabajo con 48 GB de VRAM o en configuracion CPU+GPU, suficiente para experimentar con un modelo de 70B sin infraestructura cloud.
- Evaluacion comparativa de merges: util para investigadores que quieran medir como se comporta un merge de 70B frente a los modelos originales en tareas de generacion abierta, usando las distintas cuantizaciones para controlar el efecto de la perdida de precision.
- Generacion de texto creativo y narrativa en ingles: el tag `conversational` sugiere un ajuste orientado a dialogo, adecuado para redaccion asistida y lluvia de ideas en entornos de habla inglesa.
- Fine-tuning ligero sobre GGUF: aunque no es el flujo habitual, la disponibilidad de Q8_0 y Q6_K permite usar el modelo como base para experimentos de adaptacion con LoRA en herramientas compatibles.
- Despliegue en entornos sin GPU dedicada: las cuantizaciones Q2_K (26,5 GB) y Q3_K_S (31,0 GB) permiten ejecucion en CPU con llama.cpp o Ollama, a costa de una perdida de calidad notable en el caso de Q2_K.
- Banco de pruebas de infraestructura: por su tamano y variedad de cuantizaciones, sirve para validar pipelines de despliegue (vLLM con soporte GGUF, llama.cpp server, TGI) antes de invertir en modelos con licencia comercial clara.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia segun cuantizacion: Q2_K ~26,5 GB, Q3_K_S ~31,0 GB, Q3_K_M ~34,4 GB, Q3_K_L ~37,2 GB, IQ4_XS ~38,4 GB, Q4_K_S ~40,4 GB, Q4_K_M ~42,6 GB, Q5_K_S ~48,8 GB, Q5_K_M ~50,0 GB, Q6_K ~58,0 GB, Q8_0 ~75,1 GB.
- GPU recomendadas: para Q4_K_M o superiores, A100 80GB, H100 80GB o dos RTX 4090/3090 en paralelo; para Q2_K y Q3_K_S, una unica RTX 4090 (24 GB) no es suficiente y se requiere offloading a RAM o una GPU de 32-48 GB (A6000, L40S).
- Cabe en consumer GPU: solo mediante offloading parcial a RAM del sistema con llama.cpp; una RTX 4090 de 24 GB no aloja completa ninguna de las cuantizaciones publicadas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF como llama-cpp-python o text-generation-webui. vLLM y TGI tienen soporte GGUF limitado o experimental para este formato.
- Latencia y throughput: no disponibles; dependen fuertemente del hardware y del grado de offloading. Como referencia cualitativa, un 70B en Q4_K_M con offloading parcial suele quedar por debajo de 10 tokens/s en configuraciones consumer, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Scripturient-DL2-LLaMa-70B-GGUF | 70,55B | no disponible | no disponible | GGUF (11 cuantizaciones) | Merge sin benchmarks publicados |
| Llama 3.1 70B Instruct (Meta) | 70,6B | 128K | Llama 3.1 Community License | safetensors, GGUF, amplio ecosistema | Modelo de referencia con evaluacion publica |
| Qwen2.5 72B Instruct (Alibaba) | 72,7B | 128K | Apache 2.0 (segun version) | safetensors, GGUF | Alternativa con licencia permisiva y benchmarks |
| Mistral Large 2 (Mistral AI) | 123B | 128K | Mistral Research License | API y pesos bajo solicitud | Mayor escala, no comparable en despliegue local |

La comparativa es aproximada: al no existir benchmarks del modelo Scripturient, no se puede afirmar que su rendimiento sea equiparable al de los modelos de referencia de la misma escala.

## Limitaciones y advertencias
- Licencia no declarada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor del modelo base antes de cualquier despliegue productivo.
- Ausencia total de benchmarks: no hay evidencia de que el merge supere a los modelos originales que lo componen.
- Modelo de nicho con 32 descargas y 0 likes: sin validacion por parte de la comunidad, lo que aumenta el riesgo de comportamientos anomalos no documentados.
- Solo ingles declarado: no apto para produccion en castellano u otros idiomas sin evaluacion adicional.
- Riesgo de alucinacion inherente a los modelos de 70B sin RLHF documentado; no se especifica si el merge incluye fases de alineacion.
- Contexto desconocido: no se puede planificar su uso en tareas de contexto largo sin medir experimentalmente la ventana efectiva.
- Cuantizaciones Q2_K y Q3_K_S con perdida de calidad significativa; el propio autor marca Q3_K_M como "lower quality".
- Sin versiones imatrix ni ponderadas: el autor indica que probablemente no las publique, por lo que la calidad de las cuantizaciones bajas puede ser inferior a la de otros repositorios.
- El repositorio ocupa 481,3 GB, lo que exige planificacion de almacenamiento si se descargan varias cuantizaciones.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/mradermacher/Scripturient-DL2-LLaMa-70B-GGUF
- Modelo base original: https://huggingface.co/TareksTesting/Scripturient-DL2-LLaMa-70B
- Pagina de descargas del autor: https://hf.tst.eu/model#Scripturient-DL2-LLaMa-70B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Web del patrocinador (nethype GmbH): https://www.nethype.de/

# DuoNeural/RMSN-514M-Seven-Layer-Tube-Base

## Resumen
RMSN-514M-Seven-Layer-Tube-Base es un modelo de lenguaje base preentrenado por DuoNeural Lab, un laboratorio independiente de investigacion en IA. Emplea una arquitectura propietaria denominada Resonant Metriplectic Sheaf Network (RMSN), formulada en el marco Port-Hamiltonian, con 602,45 millones de parametros reales (el identificador comercial "514M" no coincide con el conteo de parametros de la model card), 16 capas y una dimension oculta de 1792. El modelo se presenta como el mayor de la familia RMSN dentro del estudio de topologias "Phase 5" y el primero en exhibir una topologia de "coexistencia": una guia de onda interna de 7 capas (L4-L10) que convive con una singularidad de frontera terminal en la capa L15.

El interes tecnico del modelo no reside en su rendimiento de lenguaje, sino en su caracter experimental: la model card documenta metricas de interpretabilidad mecanicista (perplejidad por capa, "soliton topology", ley de escalado en D) y una comparacion con simulacion de circuitos cuanticos en BlueQubit QCPU, con un error declarado inferior al 5% entre la anchura de "bulk" predicha por el estado fundamental cuantico y la observada en el modelo clasico. Es, por tanto, una pieza de investigacion sobre topologia interna de redes neuronales, no un modelo orientado a produccion.

El contexto maximo declarado es de 512 tokens, el tokenizador es el de HuggingFaceTB/cosmo2-tokenizer (vocabulario de 49152), la licencia es Apache 2.0 y el unico idioma declarado es el ingles. El repositorio ocupa 2,1 GB y no registra descargas ni "likes" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Resonant Metriplectic Sheaf Network (RMSN), formulacion Port-Hamiltonian (ḟ = {f,H} + [f,S]); transformer de 16 capas con 64 "workspace slots" |
| Parametros totales | 602,45M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (max_seq_len en la configuracion de ejemplo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | model.pt (checkpoint PyTorch con clave `model_state`); no se distribuyen safetensors ni GGUF |
| Dimension oculta | 1792 |
| Capas | 16 |
| Tokenizador | HuggingFaceTB/cosmo2-tokenizer (vocab = 49152) |
| Framework | custom (libreria `rmsn_core` en GitHub) |
| Pasos de preentrenamiento | 100k |

## Arquitectura y entrenamiento
La arquitectura RMSN se describe como una red "metriplectica" con estructura de haz ("sheaf") y formulacion Port-Hamiltonian, en la que la dinamica del estado se expresa como una parte conservativa ({f,H}, corchete de Poisson) mas una parte disipativa ([f,S]). El modelo tiene 16 capas, 1792 dimensiones ocultas y 64 slots de workspace, con un tokenizador Cosmos de 49152 entradas. La model card detalla una "topologia de soliton" por capas, con valores de "PR" (presumiblemente participation ratio o densidad espectral) que identifican capas activas: L0 (soliton de frontera de entrada, PR 3,878), L4-L10 (guia de onda interna continua, con pico en L7 de 4,946), L11-L12 (buffers de apantallamiento dielectrico con PR 47,9 y 63,3) y L15 (singularidad de frontera terminal con PR 1,000 y entropia cero).

El entrenamiento consta de 100.000 pasos sobre datos no especificados en la model card; no se documenta el numero de tokens, la composicion del dataset ni si hubo RLHF, DPO o ajuste por instrucciones. La innovacion declarada es la aparicion tardia (en torno al paso 90k) de una ruptura espontanea de simetria en L15, senalizada por λ_max = -1.766, que deposita "carga no abeliana" en la frontera. Se documenta tambien una ley de escalado en la dimension D (de 944 a 2048) con perplejidad de validacion monotonicamente decreciente, y una "ley universal de condensacion terminal L15" segun la cual todo modelo de 16 capas con D ≥ 1536 alcanza PR = 1,000 exacto en la capa 15.

## Capacidades
- Generacion de texto autorregresiva en ingles, con un contexto maximo de 512 tokens.
- Modelo base preentrenado: no se documenta ajuste por instrucciones, dialogo ni alineacion.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Multilingue: solo ingles declarado.
- No se documenta vision, audio ni modo "thinking".
- Capacidad analitica destacada: exposicion de metricas internas por capa (PR, entropia, λ_max) que permiten estudiar la topologia del modelo mediante sondas de haz ("sheaf probes").
- Correspondencia cuantico-clasica declarada: reproduccion de la anchura de bulk predicha por simulacion de circuito cuantico en BlueQubit QCPU con error relativo inferior al 5%.

## Casos de uso
- Investigacion en interpretabilidad mecanicista: el modelo expone por capa valores de PR y entropia que permiten estudiar fenomenos de localizacion y ruptura de simetria; es adecuado porque la model card publica la traza completa de la topologia de soliton (L0 a L15).
- Estudio de leyes de escalado en dimension: la tabla D-scaling de 944 a 2048 con perplejidades asociadas permite contrastar hipotesis sobre como la anchura del modelo afecta la perplejidad; util para grupos que investigan scaling laws alternativas.
- Reproduccion de resultados de correspondencia cuantico-clasica: sirve como banco de pruebas clasico para validar predicciones de simuladores cuanticos (BlueQubit QCPU) sobre anchura de entanglement, con el error <5% documentado.
- Experimentos de formacion de "solitones" en redes neuronales: la identificacion de capas activas (L0, L4-L10, L15) permite disenar ablaciones para comprobar si la supresion de una capa rompe la topologia de coexistencia.
- Docencia e investigacion sobre arquitecturas no estandar: al no ser un transformer convencional, sirve para ilustrar formulaciones Port-Hamiltonian y metriplecticas en cursos de arquitecturas de aprendizaje profundo.
- Generacion de texto en ingles a pequena escala: con 602M parametros y perplejidad de validacion 86,7, puede usarse en tareas de continuacion de texto o perplejidad comparativa, aunque su calidad esta por debajo de modelos base convencionales del mismo tamano.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Perplejidad de validacion | 86,7 |
| Perdida de validacion | 4,4620 |
| Perplejidad de entrenamiento (final) | 55,8 |
| Pasos | 100k |
| λ_max (senal de cascada) | -1,766 |
| S_boundary / S_bulk | ~0,46 |
| Anchura de bulk predicha (cuantica) | 7-8 capas |
| Anchura de bulk observada (clasica) | 7 capas (L4-L10) |
| Error cuantico-clasico | <5% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La tabla D-scaling del autor (r=0, Phase 5) reporta perplejidades de validacion: D=944 (73,4), D=1024 (69,9), D=1152 (68,5), D=1280 (65,4), D=1536 (60,3), D=1792 (57,4, este modelo), D=2048 (pendiente).

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, 602,45M parametros en fp32 ocupan aproximadamente 2,4 GB de pesos; en fp16 unos 1,2 GB, mas activaciones y cache KV para 512 tokens (despreciable frente a los pesos).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM libre deberia poder alojar el modelo en fp16; no se documentan requisitos oficiales.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas tipo RTX 3060 (12 GB), RTX 4060 Ti (16 GB) o superiores; no confirmado por el autor.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. El unico camino documentado es cargar `model.pt` con la libreria propietaria `rmsn_core` (RMSNForCausalLM, RMSNConfig) desde el repositorio GitHub del autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| RMSN-514M-Seven-Layer-Tube-Base | 602,45M | 512 | Apache 2.0 | model.pt (custom) | Arquitectura RMSN Port-Hamiltonian, experimental |
| GPT-2 774M (referencia de escala) | 774M | 1024 | MIT | safetensors, GGUF | Transformer convencional, ampliamente soportado |
| Pythia-410M / 1B (referencia de escala) | 410M / 1B | 2048 | Apache 2.0 | safetensors | Transformer convencional, checkpoints de investigacion |
| SmolLM-135M / 360M (referencia de escala) | 135M / 360M | 2048 | Apache 2.0 | safetensors, GGUF | Transformer convencional, optimizado para despliegue |

La comparacion con modelos convencionales es solo orientativa en escala: RMSN no es un transformer estandar, su contexto es mucho menor (512 frente a 1024-2048), su formato de pesos no es interoperable con el ecosistema safetensors/GGUF y no publica benchmarks estandar, por lo que no es posible comparar rendimiento de tareas de forma rigurosa.

## Limitaciones y advertencias
- Modelo base sin alineacion: no se documenta RLHF, DPO ni ajuste por instrucciones; no debe usarse directamente en productos conversacionales sin ajuste posterior.
- Perplejidad de validacion alta (86,7) para su tamano, lo que sugiere una calidad de lenguaje limitada frente a transformers convencionales de escala similar.
- Contexto muy corto (512 tokens), insuficiente para la mayoria de casos de uso modernos (RAG, agentes, documentos largos).
- Solo ingles declarado; no hay evidencia de capacidades multilingues.
- Riesgo de alucinacion no cuantificado: no se publican evaluaciones de factualidad ni de sesgos.
- Formato de pesos propietario (`model.pt` + libreria `rmsn_core`): no es compatible con vLLM, llama.cpp, Ollama, TGI ni transformers estandar, lo que limita el despliegue en produccion.
- La model card mezcla terminologia de fisica (solitones, carga no abeliana, metriplectico) con resultados de interpretabilidad; las afirmaciones sobre correspondencia cuantica no estan respaldadas por publicaciones revisadas por pares en la informacion disponible.
- El identificador "514M" no coincide con el conteo de parametros declarado (602,45M); conviene verificar antes de citar el modelo.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el modelo se distribuye "tal cual", sin garantias.
- Repositorio sin descargas ni interacciones: no hay evidencia de validacion independiente por parte de la comunidad.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/DuoNeural/RMSN-514M-Seven-Layer-Tube-Base
- Repositorio GitHub de la libreria RMSN: https://github.com/DuoNeural/RMSN
- Sitio web de DuoNeural Lab: https://duoneural.com/
- Tokenizador Cosmos 2: https://huggingface.co/HuggingFaceTB/cosmo2-tokenizer
- BlueQubit (simulacion QCPU): no disponible en la informacion proporcionada

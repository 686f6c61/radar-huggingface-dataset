# mradermacher/Mozi-2b-GGUF

## Resumen

Mozi-2b-GGUF es una coleccion de cuantizaciones estaticas en formato GGUF del modelo Mozi-2b, desarrollado por MoziLabs, realizadas por el cuantizador mradermacher. El modelo base es un modelo de razonamiento de aproximadamente 1.881 millones de parametros (1.881.825.088 segun los safetensors originales), construido sobre la arquitectura Qwen3.5 y entrenado mediante destilacion con adaptadores LoRA. Esta orientado a tareas conversacionales y de razonamiento en ingles.

La relevancia de esta ficha no es el modelo base en si, sino la disponibilidad inmediata en GGUF: al pesar entre 1,1 GB (Q2_K) y 3,9 GB (f16), puede ejecutarse en CPU, en portatiles y en GPUs de consumo sin necesidad de servidores dedicados. Esto lo convierte en una opcion practica para desplegar un modelo de razonamiento muy ligero en local, en dispositivos edge o en pipelines de prueba rapidas.

Cabe destacar que la model card del modelo base no incluye detalles publicados sobre arquitectura exacta, longitud de contexto ni datos de entrenamiento, por lo que varios campos de esta ficha se marcan como no disponibles. La licencia MIT del modelo base permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Base Qwen3.5 (detalle de arquitectura no disponible) |
| Parametros totales | 1.881.825.088 (~1,88 B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (original en safetensors) |

## Arquitectura y entrenamiento

El modelo base, MoziLabs/Mozi-2b, esta construido sobre Qwen3.5, segun las etiquetas de la propia model card, y el entrenamiento se ha realizado mediante destilacion (distillation) con adaptadores LoRA, una tecnica habitual para transferir capacidades de razonamiento de un modelo profesor mas grande a un modelo estudiante pequeno. Las etiquetas "reasoning" y "distillation" indican que el foco del entrenamiento ha sido mejorar la cadena de razonamiento del modelo.

No se han publicado detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas concretas en la informacion disponible. Respecto al repositorio de cuantizacion, mradermacher ofrece cuants estaticos en K-quants e IQ-quants, y remite a un repositorio hermano (Mozi-2b-i1-GGUF) para cuants weighted/imatrix, que suelen ofrecer mejor calidad a igual tamaño.

## Capacidades

- Generacion de texto conversacional en ingles (pipeline etiquetado como conversational).
- Razonamiento: el modelo esta etiquetado con "reasoning", lo que sugiere entrenamiento orientado a tareas de razonamiento paso a paso.
- Entrenado mediante destilacion con LoRA, presumiblemente para heredar capacidades de un modelo profesor mayor.
- No hay informacion disponible sobre soporte de tool calling / function calling.
- No hay informacion disponible sobre capacidades de agentes, vision, audio ni modo de pensamiento explicito (thinking mode).
- Capacidades multilingues: no disponibles; el unico idioma declarado es el ingles.

## Casos de uso

- Chatbots locales y privados: con cuants de 1,1-1,4 GB, se puede desplegar un asistente conversacional en un portatil sin GPU dedicada, manteniendo los datos en el dispositivo.
- Prototipado rapido de agentes de razonamiento: su pequeño tamaño permite iterar prompts y cadenas de razonamiento en local con latencias bajas antes de escalar a modelos mayores.
- Inferencia en CPU: gracias al formato GGUF y a llama.cpp, es viable ejecutarlo en maquinas sin GPU, util para servidores modestos o entornos edge.
- Integracion en aplicaciones de escritorio: el tamaño de 1,3-1,5 GB en Q4/Q5 lo hace apto para distribuirse junto a una aplicacion (electron, apps nativas) con inferencia via Ollama o llama.cpp.
- Generacion y revision de texto en ingles: redaccion, resumen y transformacion de textos en entornos con recursos limitados, aprovechando su entrenamiento orientado a razonamiento.
- Benchmarking de cuantizaciones: al disponer de 12 variantes de cuant (de Q2_K a f16), es util como banco de pruebas para comparar la degradacion de calidad entre tipos de cuant en modelos de razonamiento pequeños.
- Fine-tuning posterior: al existir el modelo base en safetensors con LoRA, se puede continuar el ajuste fino en una GPU de consumo y volver a cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: la memoria necesaria coincide aproximadamente con el tamaño del fichero: 1,1 GB (Q2_K) hasta 2,1 GB (Q8_0), mas el KV cache del contexto. Cualquier equipo con 4-8 GB de RAM libre puede ejecutarlo incluso en Q8_0.
- GPUs recomendadas: no requiere GPU; cualquier GPU moderna lo acelera. Con cuant Q4/Q5 cabe sobradamente en GPUs de 4 GB o mas (por ejemplo, RTX 3050, RTX 3060, RTX 4060). No se necesita A100 ni H100.
- Consumer GPUs: cabe con holgura en practicamente cualquier GPU de consumo; incluso la f16 (3,9 GB) cabe en una GPU de 6 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF. El modelo base en safetensors puede servirse con vLLM, TGI o transformers.
- Latencia y throughput: no disponibles; por su tamaño (~1,9 B de parametros), se espera inferencia rapida incluso en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Mozi-2b (base) | ~1,88 B | safetensors | MIT | en | Modelo base con LoRA, orientado a razonamiento |
| Qwen3.5 (familia, tamaños pequeños) | no disponible | safetensors, GGUF comunitarios | no disponible | no disponible | Arquitectura base de Mozi-2b; benchmarks no disponibles en esta ficha |
| Otros modelos de razonamiento ~2B (p. ej. variantes destiladas de Qwen) | ~2 B | safetensors, GGUF | variable | variable | Alternativas de la misma categoria; comparativa de rendimiento no disponible |

No se han publicado datos que permitan una comparativa cuantitativa de rendimiento con alternativas concretas.

## Limitaciones y advertencias

- Idioma: el modelo esta declarado solo para ingles; su rendimiento en castellano u otros idiomas no esta garantizado ni documentado.
- Sesgos conocidos: no disponibles; al ser un modelo destilado, puede heredar los sesgos del modelo profesor y de los datos de destilacion, sin documentacion al respecto.
- Alucinaciones: como todo modelo de lenguaje pequeño, es propenso a generar informacion incorrecta con apariencia plausible; no hay evaluaciones publicadas que cuantifiquen este riesgo.
- Longitud de contexto: no publicada, por lo que no se puede planificar el uso de contextos largos con garantias; verificar en la model card del modelo base o empiricamente antes de produccion.
- Cuantizaciones agresivas: los cuants Q2_K y Q3_K_M estan marcados explicitamente como de menor calidad; para produccion se recomiendan Q4_K_M o superiores.
- Licencia: MIT, sin restricciones de uso comercial relevantes; no se requieren compromisos de apertura ni limites de usuarios.
- Esta ficha corresponde al repositorio de cuantizacion de mradermacher, no al modelo original; para soporte o preguntas sobre el modelo en si, acudir a MoziLabs/Mozi-2b.
- Repositorio con pocas descargas (396) y sin likes en el momento de la ficha: comunidad y validacion empirica limitadas.

## Enlaces

- Repositorio de cuantizacion GGUF: https://huggingface.co/mradermacher/Mozi-2b-GGUF
- Modelo base: https://huggingface.co/MoziLabs/Mozi-2b
- Cuants weighted/imatrix: https://huggingface.co/mradermacher/Mozi-2b-i1-GGUF
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Mozi-2b-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa de mradermacher (nethype GmbH): https://www.nethype.de/
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Paper, blog oficial y demo: no disponibles

# mradermacher/DarkSapling-7B-v1.0-GGUF

## Resumen

DarkSapling-7B-v1.0-GGUF es la distribucion en formato GGUF del modelo DarkSapling-7B-v1.0, un merge de modelos de 7.241.732.096 parametros construido sobre la arquitectura Mistral. El trabajo de cuantizacion lo firma mradermacher, un publicador habitual de cuantizaciones GGUF en Hugging Face, mientras que el modelo original lo desarrollo el usuario TeeZee. La model card original lo etiqueta como `merge` y `not-for-all-audiences`, lo que indica que se trata de una fusion de pesos orientada a fines creativos o de rol, no a un modelo alineado para uso general.

La relevancia de esta ficha esta en el formato: al estar disponible en GGUF con once niveles de cuantizacion distintos (desde Q2_K de 2,8 GB hasta f16 de 14,6 GB), el modelo se puede ejecutar en hardware de consumo mediante llama.cpp, Ollama u otros runners compatibles con GGUF. El repositorio ocupa 63,9 GB en total porque incluye todas las variantes de cuantizacion a la vez.

Se trata de un modelo solo en ingles, con licencia Apache 2.0, sin datos publicados sobre contexto, composicion del dataset de entrenamiento ni resultados de benchmarks. Cualquier evaluacion de calidad debe hacerse por prueba directa, no por cifras del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Mistral, segun tags) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

El modelo base es un merge, es decir, una combinacion de pesos de dos o mas modelos ya entrenados, no un entrenamiento desde cero. La model card no detalla que modelos se fusionaron, con que metodo (SLERP, TIES, DARE, linear) ni con que proporciones, y tampoco indica si hubo un paso posterior de fine-tuning o de alineacion. Los tags apuntan a la familia Mistral, por lo que la arquitectura subyacente es un transformer decoder-only con atencion de tipo sliding window, aunque no se confirma la longitud de contexto efectiva.

No hay informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. El trabajo de mradermacher se limita a la conversion y cuantizacion a GGUF, sin modificacion de pesos mas alla de la propia cuantizacion. Existe una variante con cuantizaciones ponderadas por imatrix en un repositorio separado, que suele ofrecer mejor relacion calidad/tamano en los niveles bajos.

## Capacidades

- Generacion de texto en ingles con estilos creativos y de rol, dado el origen de merge y la etiqueta `not-for-all-audiences`.
- Conversacion multi-turno en ingles, sin garantias de coherencia en contextos largos al no estar publicada la ventana.
- No hay evidencia publicada de soporte de tool calling ni de function calling.
- No hay evidencia publicada de capacidades de agente o razonamiento multi-paso estructurado.
- No soporta vision, audio ni otras modalidades.
- No dispone de modo de razonamiento explicito (thinking mode).
- Multilingue limitado: solo ingles declarado; el rendimiento en castellano no esta documentado y no deberia asumirse.

## Casos de uso

- Generacion creativa y escritura de ficcion: el modelo, al ser un merge orientado a estilos, encaja en la produccion de relatos y dialogos en ingles; la cuantizacion Q5_K_M o Q6_K conserva mejor el estilo que Q4.
- Prototipado de chatbots de rol en local: con Q4_K_M (4,5 GB) se puede desplegar en una GPU de consumo y probar personajes y guiones sin coste de API.
- Experimentacion con merges en investigacion: util para estudiar el efecto de la fusion de pesos en la calidad de generacion, comparando este modelo con sus posibles progenitores.
- Evaluacion de cuantizaciones: el repositorio ofrece todos los niveles, lo que permite medir la degradacion de perplejidad entre Q2_K y Q8_0 en un mismo modelo, util para calibrar pipelines de cuantizacion.
- Generacion de texto offline en entornos sin conectividad: al caber en 2,8 GB en Q2_K, se puede ejecutar en portatiles modestos con llama.cpp para tareas de redaccion asistida en ingles.
- Base para fine-tuning ligero en ingles: la licencia Apache 2.0 permite adaptar el modelo con LoRA para dominios especificos, siempre que se valide antes la calidad del merge de partida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 3 y 4 GB con Q2_K, 4,5 a 5,5 GB con Q4_K_M, 6,5 a 7,5 GB con Q6_K y 8 a 9 GB con Q8_0, contando overhead de contexto y KV cache.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 para las cuantizaciones altas; A100 o H100 no aportan ventaja significativa a este tamano salvo por throughput agregado.
- Cabe en GPU de consumo: si, en cualquier tarjeta con 8 GB o mas para Q4_K_M y superiores; Q2_K y Q3 caben en 4 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runner compatible con GGUF; vLLM y TGI no son la via natural para GGUF, aunque existen soportes parciales.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DarkSapling-7B-v1.0-GGUF | 7,24 B | no disponible | Apache 2.0 | GGUF | Merge sin benchmarks publicados |
| Mistral-7B-Instruct-v0.3 | 7,25 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Modelo alineado con contexto documentado y amplia adopcion |
| Zephyr-7B-beta | 7,24 B | 32.768 tokens | MIT | safetensors, GGUF | Fine-tuning con DPO, benchmarks publicados |
| OpenHermes-2.5-Mistral-7B | 7,24 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Fine-tuning orientado a instrucciones y rol |

La comparativa es orientativa: DarkSapling no publica contexto ni evaluaciones, por lo que frente a alternativas con contexto y benchmarks documentados supone un riesgo mayor para produccion.

## Limitaciones y advertencias

- Modelo solo en ingles: no hay evidencia de calidad en castellano ni en otros idiomas.
- Sin datos de contexto: no se puede planificar un caso de uso con ventanas largas sin medirlo empiricamente.
- Sin benchmarks: no hay forma de comparar su calidad objetiva con alternativas; la etiqueta `not-for-all-audiences` sugiere contenido potencialmente inapropiado en generaciones.
- Riesgo de alucinacion no evaluado, agravado por ser un merge sin alineacion documentada.
- Licencia Apache 2.0 permite uso comercial, pero el autor original no ofrece garantias ni soporte; conviene revisar la procedencia de los modelos fusionados.
- Repositorio de 63,9 GB: descargar el repo completo es costoso; conviene bajar solo el archivo GGUF necesario.
- Las cuantizaciones Q2_K y Q3_K_M degradan la calidad de forma notable; para uso real se recomienda Q4_K_M o superior.
- No apto para tareas que requieran tool calling, agentes o razonamiento estructurado sin validacion previa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/DarkSapling-7B-v1.0-GGUF
- Modelo base: https://huggingface.co/TeeZee/DarkSapling-7B-v1.0
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/DarkSapling-7B-v1.0-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#DarkSapling-7B-v1.0-GGUF
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

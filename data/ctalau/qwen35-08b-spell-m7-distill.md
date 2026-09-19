# ctalau/qwen35-08b-spell-m7-distill

## Resumen

qwen35-08b-spell-m7-distill es un corrector ortografico especializado publicado por el usuario ctalau (Cristian) en HuggingFace. Se trata de un checkpoint fusionado en fp16 de un estudiante Qwen/Qwen3.5-0.8B, entrenado mediante QLoRA y destilado a nivel de token (token-level KD) a partir de un profesor M6 basado en Qwen/Qwen3.5-2B, usando errores de palabra del corpus BEA-60K. Posteriormente, los adaptadores LoRA se fusionaron de vuelta en el modelo base, dando como resultado un unico fichero safetensors de aproximadamente 1,6 GiB con 852.985.920 parametros.

El modelo no es un asistente general: resuelve una tarea muy concreta y acotada. Dada una frase con una unica palabra mal escrita marcada entre etiquetas `<TYPO>...</TYPO>`, devuelve exclusivamente la palabra corregida, en modo greedy y con un maximo de unos 5 tokens de salida. No detecta errores por si mismo; requiere que el error venga premarcado por un componente externo.

Su relevancia practica esta en la relacion tamano/precision: con menos de mil millones de parametros y cuantizado a 4 bits alcanza un 87,30 % de Acc@1 (casefold) sobre el conjunto de test de BEA con n=2.000, practicamente a la par del profesor de 2B (aproximadamente 88,75 %). Eso lo convierte en una pieza muy barata de ejecutar para integrarse como etapa de post-procesado en pipelines de texto, con licencia Apache 2.0 y pesos en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only heredada de Qwen3.5-0.8B (arquitectura multimodal en el modelo base), con cabeza MTP (multi-token prediction) conservada; el detalle interno no se especifica en la model card |
| Parametros totales | 852.985.920 (aproximadamente 0,85 B), dato de safetensors |
| Parametros activos | no aplica / no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | 262.144 tokens en el modelo base (262k); la model card recomienda explicitamente no usar esa ventana y limitar `MAX_MODEL_LEN` a 2048-8192 |
| Tipos de cuantizacion | fp16 en los pesos publicados; NF4 (QLoRA) en el entrenamiento y en la evaluacion principal; se reportan resultados de la linea de trabajo en Q4_K_M GGUF |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (fp16, aproximadamente 1,6 GiB), acompanado de tokenizer y `config.json` de Qwen/Qwen3.5-0.8B |

Otros datos del repositorio: tarea `text-generation`, tamano total del repositorio 1,7 GB, 0 descargas y 0 likes en el momento de la consulta, creado el 2026-09-19 y actualizado el mismo dia.

## Arquitectura y entrenamiento

El punto de partida es Qwen/Qwen3.5-0.8B, un transformer decoder-only que en su forma original es multimodal. Sobre esa base se aplico QLoRA (cuantizacion NF4 mas adaptadores de bajo rango) para producir un estudiante especializado. El estudiante se entreno por destilacion de conocimiento a nivel de token frente a un profesor M6 basado en Qwen/Qwen3.5-2B, utilizando los errores de palabra del corpus BEA-60K. Una vez finalizado el ajuste, los adaptadores LoRA se fusionaron en los pesos del modelo base, generando el checkpoint fp16 publicado. La cabeza MTP (multi-token prediction) del modelo base se conserva en el fichero de pesos.

La innovacion principal no es arquitectonica sino de eficiencia: se traslada la capacidad de correccion ortografica de un profesor de 2B a un estudiante de 0,8B sin perdida apreciable de precision. Segun la model card, el estudiante recupera casi todo el rendimiento del profesor (87,30 % frente a aproximadamente 88,75 % de Acc@1 casefold en n=2.000). No se documentan en la informacion disponible fases de RLHF o DPO, ni el numero total de tokens de entrenamiento, ni la composicion completa del dataset mas alla de BEA-60K. La tarea esta fijada por una plantilla de prompt concreta, `direct_correct_v1`, y el formato de salida es una unica palabra.

## Capacidades

- Correccion ortografica de una palabra concreta: recibe una frase con un unico error marcado con `<TYPO>...</TYPO>` y devuelve solo la palabra corregida, sin comillas, sin explicaciones y sin repetir la frase completa.
- Salida corta y determinista: el modo de generacion recomendado es greedy (`temperature=0`) con `max_tokens` en torno a 5, lo que hace la respuesta predecible y facil de parsear.
- Generacion de texto conversacional: el modelo hereda el `pipeline_tag` de generacion de texto y la plantilla de chat de Qwen3.5, aunque su uso recomendado es la tarea de correccion.
- Capacidades multimodales heredadas del modelo base: la model card indica que Qwen3.5-0.8B es una arquitectura multimodal y que se incluyen `preprocessor_config.json` y `video_preprocessor_config.json`. No se documenta que el ajuste haya entrenado ni evaluado estas capacidades.
- Capacidad de razonamiento: la plantilla de chat de Qwen3.5 puede abrir un bloque `<think>`; la model card recomienda desactivar el razonamiento o eliminar las etiquetas de pensamiento al servir con plantillas de chat.
- Soporte de tool calling: no disponible (no se menciona en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (el modelo no esta disenado para ello).
- Capacidades multilingues: no; el modelo esta etiquetado unicamente para ingles (`en`).

## Casos de uso

- Post-procesado de OCR: tras extraer texto de documentos escaneados, un detector de errores externo marca las palabras dudosas con `<TYPO>...</TYPO>` y este modelo devuelve la correccion. Su ventana de trabajo reducida (2048-8192 tokens segun la model card) basta para procesar bloques de texto y el coste por pagina es minimo con 0,85 B de parametros.
- Normalizacion de transcripciones ASR: los sistemas de reconocimiento de voz producen errores ortograficos en palabras poco frecuentes; este corrector permite limpiar la transcripcion palabra a palabra antes de indexarla o almacenarla, manteniendo baja la latencia porque solo genera alrededor de 5 tokens por peticion.
- Limpieza y curacion de corpus de entrenamiento: en la preparacion de datasets en ingles, se pueden marcar los tokens sospechosos y pasar cada caso por el modelo en lote. El throughput es alto al ser un modelo de menos de mil millones de parametros y admitir cuantizacion NF4 o Q4_K_M con una perdida de precision de apenas unas decimas (87,30 % frente a 86,60 % en el conjunto de test).
- Autocorreccion en editores y herramientas de escritura: integrado detras de un corrector que detecte la palabra erronea, el modelo proporciona la sustitucion en una sola pasada greedy, lo que permite mostrar la sugerencia en la interfaz sin bloqueos perceptibles.
- Correccion de consultas en motores de busqueda internos: las busquedas con errores tipograficos devuelven resultados pobres; marcar el token erroneo y corregirlo antes de lanzar la consulta mejora la coincidencia sin necesidad de un modelo generativo grande.
- Linea base y evaluacion de correctores ortograficos: por su tamano y su precision medida sobre BEA, sirve como referencia barata para comparar nuevos sistemas de correccion, tanto en la variante NF4 como en Q4_K_M, y para medir el coste real de destilar un profesor de 2B a un estudiante de 0,8B.
- Correccion por lotes en pipelines de datos con GPU modesta: al caber holgadamente en GPUs de consumo, puede desplegarse en entornos de desarrollo o en nodos de preprocesado sin aceleradores de datacenter, procesando grandes volumenes de frases con `vLLM` en modo solo texto.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible son sobre BEA, con splits disjuntos por frase y metrica Acc@1 con casefold:

| Sistema | Split | Acc@1 casefold |
|---|---|---:|
| Estudiante 0.8B NF4 (esta linea) | frozen BEA-100 | 89,0 % |
| Estudiante 0.8B NF4 | test n=2.000 | 87,30 % |
| Estudiante 0.8B Q4_K_M GGUF | frozen BEA-100 | 88,0 % |
| Estudiante 0.8B Q4_K_M GGUF | test n=2.000 | 86,60 % |
| Profesor 2B NF4 | test n=2.000 | aproximadamente 88,75 % |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks generales en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en fp16: aproximadamente 1,6-2,0 GB solo para los pesos (852.985.920 parametros a 2 bytes), mas el overhead de activaciones y cache KV; con contexto corto (2048 tokens) es razonable esperar un consumo total en el entorno de 2,5-3,5 GB.
- VRAM en cuantizacion de 4 bits (NF4 o Q4_K_M): aproximadamente 0,5 GB para los pesos, con un consumo total tipico por debajo de 1,5 GB incluyendo runtime y cache.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM sirve para 4 bits; para fp16 con contexto amplio se recomienda un minimo de 8 GB. Modelos como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son mas que suficientes, y en los dos ultimos el cuello de botella sera la latencia de red, no el computo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada moderna e incluso en iGPU con memoria unificada suficiente; tambien es viable en CPU con llama.cpp/Ollama si se convierte a GGUF.
- Opciones de despliegue: vLLM, con el comando recomendado por el autor, `vllm serve ctalau/qwen35-08b-spell-m7-distill --language-model-only --max-model-len 2048`, que desactiva el perfilado multimodal; tambien es posible servir con TGI o con llama.cpp/Ollama si se genera un GGUF a partir de los pesos safetensors (el repositorio no incluye ficheros GGUF).
- Latencia y throughput estimados: no disponible. La model card solo indica que la generacion es greedy y de unos 5 tokens como maximo, lo que situa cada peticion en un regimen de decodificacion muy corta.

## Comparativa con modelos similares

La informacion disponible solo permite comparar el estudiante con su propio profesor y con sus variantes cuantizadas. No se dispone de datos de terceros comparables.

| Modelo | Parametros | Contexto | Acc@1 casefold (BEA test n=2.000) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen35-08b-spell-m7-distill (NF4) | 0,85 B | 2048-8192 recomendado (262k en el base) | 87,30 % | Apache 2.0 | safetensors fp16 (evaluado en NF4) |
| qwen35-08b-spell-m7-distill (Q4_K_M GGUF) | 0,85 B | 2048-8192 recomendado | 86,60 % | Apache 2.0 | linea de trabajo en GGUF; el repositorio consultado no incluye GGUF |
| Profesor M6 (Qwen3.5-2B, NF4) | aproximadamente 2 B | no disponible | aproximadamente 88,75 % | no disponible en la informacion proporcionada | no disponible en el repositorio consultado |

La lectura principal de la tabla es que el estudiante de 0,85 B se queda a 1,45 puntos porcentuales del profesor de 2 B en el conjunto de test, reduciendo los parametros a menos de la mitad, y que la cuantizacion a 4 bits le cuesta apenas 0,7 puntos. No se dispone de comparaciones con otros correctores ortograficos especializados en la informacion proporcionada.

## Limitaciones y advertencias

- Requiere premarcado: el modelo no detecta errores ortograficos. Si la frase no incluye la palabra erronea delimitada por `<TYPO>...</TYPO>`, la tarea no esta definida y el resultado deja de ser fiable.
- Asume un unico error por frase: la tarea descrita es la de una sola palabra mal escrita marcada. No hay informacion sobre el comportamiento con multiples errores.
- Modelo monolingue: solo esta etiquetado para ingles (`en`). No se ha entrenado ni evaluado para castellano ni para otros idiomas.
- Riesgo de alucinacion y de formato incorrecto: al ser un modelo generativo, puede devolver la frase completa, anadir comillas o explicaciones, o inventar una palabra si el contexto es ambiguo. La model card mitiga esto con generacion greedy, `max_tokens` en torno a 5 y una plantilla estricta, pero conviene validar la salida en produccion.
- Bloque de razonamiento no deseado: las plantillas de chat de Qwen3.5 pueden abrir un bloque `<think>`. Es necesario desactivar el razonamiento o eliminar esas etiquetas al servir, de lo contrario la respuesta incluira tokens que rompen el parseo.
- Ventana de contexto mal aprovechada: aunque el modelo base soporta 262.144 tokens, el autor recomienda explicitamente limitar `MAX_MODEL_LEN` a 2048-8192. Usar la ventana completa no esta soportado por la tarea ni validado.
- Arquitectura multimodal con carga adicional: el modelo base es multimodal y el repositorio incluye ficheros de preprocesado de imagen y video. En vLLM conviene arrancar con `--language-model-only` para evitar el perfilado multimodal, que anade consumo y tiempo de inicio innecesarios.
- Sesgos conocidos: no se documentan analisis de sesgo en la informacion disponible. Al ser un modelo derivado de Qwen3.5-0.8B y ajustado sobre BEA, heredara los sesgos del corpus de errores y del modelo base, pero no hay mediciones publicadas.
- Licencia: los pesos se publican bajo Apache 2.0, lo que permite uso comercial. Conviene aun asi revisar los terminos del modelo base Qwen/Qwen3.5-0.8B, del que se heredan tokenizer y configuracion.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes, y fue creado en septiembre de 2026. No hay evidencia de uso en produccion ni validacion independiente de las metricas, que proceden exclusivamente del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ctalau/qwen35-08b-spell-m7-distill
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- No se han encontrado en la busqueda web enlaces relevantes al modelo, a papers asociados ni a repositorios de codigo. Los resultados devueltos por la busqueda corresponden a dominios ajenos al contenido (microsoft.com, account.microsoft.com, myaccount.microsoft.com, wikipedia.org), por lo que se descartan.

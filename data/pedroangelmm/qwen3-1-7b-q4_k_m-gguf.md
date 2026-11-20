# PedroAngelMM/Qwen3-1.7B-Q4_K_M-GGUF

## Resumen

PedroAngelMM/Qwen3-1.7B-Q4_K_M-GGUF es una cuantizacion en formato GGUF del modelo Qwen3-1.7B, desarrollado originalmente por el equipo Qwen de Alibaba. Esta version concreta ha sido generada por el usuario PedroAngelMM mediante el espacio GGUF-my-repo de ggml.ai, que automatiza la conversion de pesos originales a formato GGUF con la cuantizacion Q4_K_M (4 bits, variante K-quant media). El modelo base es un transformer denso de 2.031.739.904 parametros (aproximadamente 1,7 mil millones) orientado a generacion de texto conversacional.

La relevancia de esta publicacion es practica: permite ejecutar Qwen3-1.7B en hardware de consumo mediante llama.cpp, con un peso de repositorio de 1,3 GB, lo que lo hace apto para portatiles, mini-PC y GPUs de gama media-baja. Al tratarse de una cuantizacion derivada, hereda las capacidades del modelo original (razonamiento, generacion de codigo, soporte multilingue y modo thinking), aunque con la perdida de precision inherente a la cuantizacion de 4 bits.

No se dispone de informacion adicional en la model card sobre el proceso de cuantizacion mas alla de la referencia a GGUF-my-repo, ni sobre pruebas de calidad especificas realizadas por el autor. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de una publicacion reciente y sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-1.7B); no se detalla en la model card |
| Parametros totales | 2.031.739.904 (dato real de safetensors del modelo base) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de servidor usa `-c 2048` |
| Tipos de cuantizacion | Q4_K_M (4 bits, K-quant media); el autor no documenta otras variantes |
| Idiomas soportados | no disponible en la model card (el modelo base Qwen3 es multilingue, pero no se detalla aqui) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (fichero `qwen3-1.7b-q4_k_m.gguf`) |

## Arquitectura y entrenamiento

Esta ficha corresponde a una cuantizacion, no a un modelo entrenado desde cero. La arquitectura subyacente es la de Qwen3-1.7B, un transformer denso de aproximadamente 1,7 mil millones de parametros. La model card no aporta detalles sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni composicion del dataset de entrenamiento del modelo original; esa informacion debe consultarse en la model card de Qwen/Qwen3-1.7B.

El proceso de conversion se realizo con llama.cpp a traves del espacio GGUF-my-repo de ggml.ai, que aplica la cuantizacion Q4_K_M. Esta variante utiliza bloques K-quant con 4 bits para la mayoria de tensores y una precision ligeramente superior en determinadas capas (tipicamente las de atencion y las proyecciones de salida), buscando un equilibrio entre tamano y calidad. No se documenta en la model card si hubo calibracion adicional, verificacion de perplejidad ni comparacion con el modelo en punto flotante.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen3-1.7B.
- Razonamiento y generacion de codigo: capacidades propias de la familia Qwen3, aunque no verificadas especificamente en esta cuantizacion.
- Modo thinking: Qwen3 incorpora modos de razonamiento explicito en el modelo original; no se confirma en la model card si esta cuantizacion lo preserva integramente.
- Soporte multilingue: el modelo base Qwen3 es multilingue, pero la model card de esta cuantizacion no detalla los idiomas cubiertos.
- Compatibilidad con llama.cpp: CLI (`llama-cli`) y servidor (`llama-server`) documentados por el autor.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere uso a traves de la Inference API de Hugging Face.
- Tool calling / function calling: no documentado en la model card de esta cuantizacion; debe verificarse contra el modelo base.
- Capacidades de agente y multi-step reasoning: no documentadas especificamente para esta version.

## Casos de uso

- Prototipado local en portatil: con 1,3 GB de pesos y cuantizacion Q4_K_M, el modelo puede ejecutarse en CPU o en GPUs de consumo mediante llama.cpp, lo que permite iterar en el diseno de prompts y flujos conversacionales sin coste de API.
- Asistente de codigo en el editor: integracion via `llama-server` como backend compatible con OpenAI en herramientas de autocompletado o chat, aprovechando la capacidad de generacion de codigo del modelo base y el bajo requisito de VRAM.
- Chatbot de soporte en entornos con recursos limitados: despliegue en mini-PC o dispositivos edge donde no cabe un modelo de 7B o superior, usando el servidor de llama.cpp con contexto configurable (el ejemplo del autor usa 2048 tokens).
- Generacion de texto por lotes en CPU: tareas de resumen, clasificacion o reescritura de documentos donde el throughput no es critico y se prefiere evitar dependencias de GPU.
- Educacion y experimentacion: estudio del efecto de la cuantizacion Q4_K_M frente al modelo original en tareas de razonamiento, comparando salidas entre la version GGUF y los pesos safetensors.
- Base para fine-tuning ligero o destilacion: uso del modelo cuantizado como referencia de comportamiento o como punto de partida para experimentos de adaptacion en entornos con presupuesto de memoria reducido.
- Despliegue en contenedores sin GPU: el binario de llama.cpp y el fichero GGUF caben en imagenes Docker pequenas, lo que facilita entornos de demostracion o CI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye tablas de MMLU, HumanEval, GSM8K ni metricas de perplejidad para esta cuantizacion, ni comparaciones con el modelo en punto flotante.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2 GB con Q4_K_M, considerando pesos (1,3 GB) y cache KV para contextos moderados (2048-4096 tokens).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM; RTX 3050, RTX 4060, RTX 4090 y equivalentes pueden ejecutarlo con holgura.
- Cabe en GPU de consumo: si, en practicamente todas las GPU discretas modernas, e incluso en iGPUs con memoria unificada.
- Ejecucion en CPU: viable con llama.cpp; el rendimiento dependera del numero de nucleos y del ancho de banda de memoria.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (importando el GGUF), y otros runners compatibles con GGUF. No se documenta soporte nativo de vLLM o TGI para este fichero.
- Latencia y throughput: no disponibles; no se han publicado mediciones en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| PedroAngelMM/Qwen3-1.7B-Q4_K_M-GGUF | ~2,03 B | no disponible | GGUF Q4_K_M | apache-2.0 | Cuantizacion de Qwen3-1.7B; 1,3 GB de repo |
| Qwen/Qwen3-1.7B (original) | ~2,03 B | no disponible en esta ficha | safetensors | apache-2.0 | Pesos en punto flotante; referencia de calidad |
| Llama 3.2 1B Instruct | ~1,24 B | 128 K (segun model card oficial) | safetensors, GGUF | Llama 3.2 Community License | Alternativa de tamano similar con licencia mas restrictiva |
| Gemma 3 1B | ~1 B | no disponible en esta ficha | safetensors, GGUF | Gemma Terms of Use | Alternativa de Google con terminos propios |

La comparacion de rendimiento entre estos modelos no puede establecerse con los datos disponibles, ya que no se han publicado benchmarks para esta cuantizacion concreta.

## Limitaciones y advertencias

- Alucinacion: como todo modelo de 1,7 B, la tasa de alucinacion en tareas de conocimiento factual es elevada; no debe usarse como fuente de verdad sin verificacion.
- Perdida por cuantizacion: Q4_K_M introduce degradacion respecto a los pesos originales, especialmente en tareas de razonamiento matematico y generacion de codigo complejo; no se documenta la magnitud de esta perdida.
- Contexto: la model card no especifica la ventana de contexto soportada; el ejemplo del autor usa 2048 tokens, pero el modelo base podria soportar mas. Verificar antes de desplegar en produccion.
- Idiomas: no se detalla la cobertura linguistica de esta cuantizacion; el rendimiento en castellano no esta verificado.
- Sesgos: no se documentan evaluaciones de sesgo para esta version; hereda los sesgos del dataset de entrenamiento del modelo base.
- Licencia: apache-2.0 permite uso comercial, pero conviene revisar la licencia del modelo base Qwen3-1.7B por si hubiera terminos adicionales.
- Mantenimiento: repositorio con 0 descargas y 0 likes; sin evidencia de validacion comunitaria ni actualizaciones posteriores.
- Tool calling y modo thinking: no confirmados en esta cuantizacion; probar antes de integrar en pipelines de agentes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/PedroAngelMM/Qwen3-1.7B-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-1.7B/blob/main/LICENSE
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp

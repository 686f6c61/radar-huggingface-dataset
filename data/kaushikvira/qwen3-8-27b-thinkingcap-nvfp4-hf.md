# kaushikvira/Qwen3.8-27B-thinkingcap-NVFP4-HF

## Resumen

Qwen3.8-27B-thinkingcap-NVFP4-HF es una cuantizacion en formato HuggingFace de los pesos de ThinkingCap-Qwen3.8-27B, el finetune centrado en eficiencia de razonamiento que BottleCap AI publico sobre Qwen3.8-27B (upstream Apache-2.0 del equipo Qwen). El autor del repositorio, kaushikvira, ha convertido el modelo original a NVFP4 (W4A4, grupo 16) con la libreria compressed-tensors, manteniendo el pipeline image-text-to-text y anadiendo un MTP head en un fichero aparte.

La motivacion principal del repositorio es doble. Por un lado, ofrecer pesos cuantizados listos para vLLM y SGLang, con un peso total de 17,1 GiB que permite servir el modelo en una unica GPU de 32 GB (RTX 5090, arquitectura Blackwell) con hasta 131.072 tokens de contexto y hasta 262.144 tokens en tarjetas de 48 GB o mas. Por otro, cubrir el soporte de salida estructurada mediante JSON schema: el contenedor NInfer del mismo autor no lo soporta, mientras que vLLM si, de ahi que esta version se publique como "el origen exacto previo a la conversion" del contenedor NInfer v3.

Es, por tanto, una pieza de infraestructura mas que un modelo nuevo: pesos cuantizados, receta de cuantizacion reproducible y plantilla de chat, con licencia PolyForm Small Business que restringe el uso comercial. El repositorio presenta 0 descargas en el momento de la consulta y no tiene resultados de benchmarks publicados para este empaquetado concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (pipeline image-text-to-text), stack de texto Qwen3.8 mas torre de vision; tag de arquitectura "qwen3_5". No se confirma si la capa de texto es densa o MoE (no disponible) |
| Parametros totales | 14.732.516.864 (~14,7 mil millones) segun los safetensors del repositorio. El nombre comercial del modelo indica "27B" |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (maximo indicado por el autor para GPUs de 48 GB o mas); 131.072 tokens recomendados en GPU de 32 GB |
| Tipos de cuantizacion | NVFP4 W4A4 grupo 16 (stack de texto y torre de vision, asignacion q6/q8 oficial); W8G32 en token embedding y output head; formato compressed-tensors. Calibrado con 512 muestras de Ultrachat a seq 2048 |
| Idiomas soportados | no disponible |
| Licencia | PolyForm Small Business License con concesion de uso personal (homelab/personal permitido, uso comercial no permitido) |
| Formato de pesos | safetensors (compressed-tensors, NVFP4); incluye model.safetensors, model_mtp.safetensors, chat_template.jinja, tokenizer, config y recipe.yaml |

## Arquitectura y entrenamiento

El modelo es una conversion de pesos, no un entrenamiento nuevo. La arquitectura subyacente es la de ThinkingCap-Qwen3.8-27B de BottleCap AI, descrito por sus autores como un finetune de eficiencia de razonamiento ("thinking-efficiency") sobre Qwen3.8-27B del equipo Qwen, cuyo upstream es Apache-2.0. El pipeline declarado es image-text-to-text, de modo que el modelo conserva una torre de vision ademas del stack de texto. El repositorio no detalla la composicion del dataset de entrenamiento original, el numero de tokens, ni si se aplicaron etapas de RLHF o DPO; esos datos no estan disponibles en la informacion proporcionada.

La innovacion tecnica de este repositorio es la cuantizacion. Se aplica NVFP4 con activaciones y pesos de 4 bits (W4A4) y escalas de grupo 16, dejando el token embedding y la output head en W8G32. La receta de llm-compressor se incluye como recipe.yaml para reproducibilidad. Durante el empaquetado, el autor unifica las escalas globales por grupo de empaquetado mediante una recodificacion E4M3 de solo reduccion, de forma que el convertidor pueda fusionar los padres de atencion; segun el autor, el resultado es matematicamente equivalente a la salida cruda de llm-compressor dentro de la precision de la recodificacion E4M3. Ademas se incluye un fichero model_mtp.safetensors con la cabeza MTP (multi-token prediction) que usa el contenedor NInfer con decodificacion especulativa DFlash2; vLLM ignora ese fichero.

## Capacidades

- Generacion de texto conversacional, con plantilla de chat Jinja incluida.
- Razonamiento de tipo "thinking" heredado de ThinkingCap, orientado a eficiencia de razonamiento.
- Procesamiento de imagenes y texto combinados (pipeline image-text-to-text, torre de vision cuantizada incluida en los pesos).
- Salida estructurada mediante JSON schema en vLLM, usando GuidedDecodingParams, que es el motivo declarado de la publicacion de este repositorio.
- Integracion con motores de inferencia de alto rendimiento: vLLM y SGLang, con soporte nativo de NVFP4 en hardware Blackwell.
- Contexto largo: hasta 262.144 tokens en configuraciones con suficiente VRAM.
- Cabeza MTP incluida en fichero separado, pensada para decodificacion especulativa en el contenedor NInfer (no utilizable por vLLM).
- No se documenta soporte explicito de tool calling, function calling ni de flujos de agentes multi-paso en la informacion disponible.

## Casos de uso

- Extraccion de datos con salida estructurada: el modelo puede generar respuestas validadas contra un JSON schema mediante guided decoding en vLLM, lo que resulta adecuado para poblar bases de datos, formularios o APIs a partir de texto libre sin postprocesado fragil.
- Analisis de documentos largos: con hasta 262.144 tokens de contexto en GPUs de 48 GB, permite resumir, indexar o hacer preguntas sobre contratos, informes o expedientes completos en una sola pasada.
- Procesamiento de documentos escaneados con vision: al conservar la torre de vision, puede extraer informacion de capturas, facturas o formularios en imagen y devolver la estructura solicitada.
- Asistente conversacional en entornos de homelab o investigacion: la licencia PolyForm Small Business permite uso personal y no comercial, por lo que encaja en laboratorios, demos internas y proyectos de aficionado sobre una unica RTX 5090.
- Razonamiento con contexto largo en investigacion academica: la combinacion de modo thinking y ventana amplia permite reproducir experimentos de chain-of-thought sobre corpus extensos sin necesidad de trocear el material.
- Servicio de inferencia autohospedado en produccion no comercial: con vLLM y cuantizacion NVFP4 se puede desplegar un endpoint compatible con OpenAI en una sola GPU Blackwell de 32 GB, con KV cache en fp8 para ampliar contexto.
- Tareas multimodales ligeras en el borde de la GPU de consumo: preguntas y respuestas sobre imagenes en una RTX 5090, sin coste de API externa y con los pesos en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este empaquetado. El autor indica explicitamente que los numeros especificos de vLLM y SGLang para este repositorio "no estan medidos todavia" por tratarse de un empaquetado reciente, y que la cuantizacion es identica a la de su contenedor NInfer v3 (que si incluye numeros de gate, needle y llama-benchy en una RTX 5090), pero sin reproducir esas cifras aqui. El autor invita a compartir resultados en la pestana de Community con herramienta, version, GPU, longitud de contexto y tok/s de prefill y generacion.

## Requisitos de hardware

- Peso de los safetensors: 17,1 GiB para model.safetensors (mas el MTP head y el resto de ficheros; el repositorio completo ocupa 18,4 GB).
- GPU de 32 GB (por ejemplo, RTX 5090): el modelo cabe con aproximadamente 12 GB libres para KV cache en fp16, lo que permite 131.072 tokens de contexto.
- GPU de 48 GB o mas: permite `--max-model-len 262144`, o bien alcanzar esa longitud en 32 GB usando `--kv-cache-dtype fp8`.
- Hardware recomendado: GPUs Blackwell con soporte nativo de NVFP4 (RTX 5090, y por extension la familia de centro de datos Blackwell). No se documenta compatibilidad con GPUs sin soporte NVFP4.
- Si cabe en GPU de consumo: si, en una RTX 5090 de 32 GB, que es el escenario explicitamente soportado por el autor.
- Opciones de despliegue: vLLM (comando `vllm serve` incluido en la model card) y SGLang; existe ademas un contenedor NInfer v3 del mismo autor con decodificacion especulativa DFlash2. El fichero MTP es ignorado por vLLM.
- Latencia y throughput: no disponible para este empaquetado; el autor no publica tok/s de prefill ni de generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion / formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-thinkingcap-NVFP4-HF (este repositorio) | ~14,7 mil millones (segun safetensors) | 262.144 tokens (131.072 en 32 GB) | NVFP4 W4A4 grupo 16, compressed-tensors, safetensors | PolyForm Small Business + uso personal | HuggingFace, vLLM y SGLang |
| ThinkingCap-Qwen3.8-27B (BottleCap AI, modelo base) | no disponible en la informacion (el nombre indica 27B) | no disponible | pesos sin cuantizar (presumiblemente BF16) | PolyForm Small Business, misma base | HuggingFace |
| Qwen3.8-27B (equipo Qwen, upstream) | no disponible en la informacion (el nombre indica 27B) | no disponible | pesos sin cuantizar | Apache-2.0 (segun la model card del repositorio) | HuggingFace |
| Contenedor NInfer v3 del mismo autor | mismos pesos que este repositorio | no disponible | NVFP4 con decodificacion especulativa DFlash2 | PolyForm Small Business | Contenedor propio (no vLLM) |

No se dispone de cifras de rendimiento comparativas entre estas variantes en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, formato y licencia.

## Limitaciones y advertencias

- Licencia restrictiva: PolyForm Small Business con concesion de uso personal. El uso comercial no esta permitido segun el propio autor, lo que descarta su empleo en productos o servicios de pago sin licencia adicional.
- Discrepancia de nomenclatura: el nombre del modelo indica "27B" pero los safetensors declaran 14.732.516.864 parametros (~14,7 mil millones). Conviene verificar antes de dimensionar infraestructura en funcion del nombre.
- Sin benchmarks: no hay resultados medidos para este empaquetado, por lo que el rendimiento real en tareas de razonamiento, codigo o vision no esta validado publicamente.
- Dependencia de hardware Blackwell: la cuantizacion NVFP4 requiere soporte nativo; en GPUs sin esa capacidad el modelo puede no ser utilizable o degradar en rendimiento.
- La cabeza MTP no se aprovecha en vLLM, de modo que la decodificacion especulativa DFlash2 queda limitada al contenedor NInfer.
- La model card esta marcada con `inference: false`, aunque incluye instrucciones de despliegue en vLLM; conviene comprobar el funcionamiento real antes de integrarlo en produccion.
- No se documentan idiomas soportados, sesgos conocidos, tasas de alucinacion ni comportamiento de tool calling.
- Al ser una conversion de pesos, hereda las limitaciones del modelo base ThinkingCap-Qwen3.8-27B, no descritas en la informacion disponible.
- Repositorio sin descargas ni likes en el momento de la consulta: es un empaquetado reciente y poco validado por la comunidad.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/kaushikvira/Qwen3.8-27B-thinkingcap-NVFP4-HF
- Modelo base: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-27B
- Contenedor NInfer v3 del mismo autor: https://huggingface.co/kaushikvira/Qwen3.8-27B-thinkingcap-nvfp4full-dflash2-NInfer-v3
- Perfil del autor: https://huggingface.co/kaushikvira
- No se han encontrado papers, blogs o repositorios adicionales en la informacion proporcionada.

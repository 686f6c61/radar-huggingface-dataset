# malachkubihd45/MiniCPM5-1B-mixed4-8

## Resumen

MiniCPM5-1B-mixed4-8 es una conversión del modelo base openbmb/MiniCPM5-1B al formato `.litertlm` del runtime LiteRT-LM, con cuantización de precisión mixta 4/8 bits desarrollada por el usuario malachkubihd45. No se trata de un modelo nuevo ni de un fine-tuning: es un artefacto de despliegue pensado para ejecución en dispositivo (on-device) sobre CPU o GPU en Android, iOS, escritorio y web. El resultado principal es la reducción del contenedor desde 2,16 GB en safetensors BF16 (4,33 GB en la exportación fp32 intermedia) hasta 0,94 GB finales, manteniendo normas, embeddings rotatorios y activaciones en fp32.

El modelo base es un transformer de tipo LlamaForCausalLM de aproximadamente 1.000 millones de parámetros, con 24 capas, dimensión oculta de 1536 y un vocabulario de 130.560 tokens con tabla de embeddings externalizada. Soporta inglés y chino, y en las pruebas de humo realizadas por el autor emite un bloque de razonamiento `<think>…</think>` antes de la respuesta final, lo que indica que conserva el modo de pensamiento del modelo original.

Su relevancia actual está en el nicho de la IA de borde: permite desplegar un modelo de razonamiento de 1B en dispositivos con memoria limitada mediante un contenedor único que integra metadatos, tokenizador, grafo TFLite de prefill/decode cuantizado y embedder externo. La licencia Apache-2.0 y el hecho de que todo el pipeline de cuantización sea reproducible con scripts incluidos facilitan su adopción en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, tipo LlamaForCausalLM (24 capas, hidden size 1536, vocab 130560) |
| Parametros totales | Aproximadamente 1.000 millones (segun la denominacion del modelo base; cifra exacta no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens de cache en este artefacto (`--cache_length=4096`); contexto nativo del modelo base: no disponible |
| Tipos de cuantizacion | Precision mixta: 8 bits por canal simetrico (lm_head/unembedding, gate_proj de las 24 capas, tabla de embedder externa) y 4 bits blockwise con grupo de 64 (q/k/v/o_proj y down_proj). Normas, rotary embeddings y activaciones en fp32. Media aproximada de 4,3 bits por peso en el cuerpo del transformer |
| Idiomas soportados | Ingles y chino |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (contenedor LiteRT-LM con LlmMetadata, tokenizador HF comprimido en zlib, TFLite de prefill/decode cuantizado y embedder externo). Se incluyen tambien recetas JSON y el script `quantize_and_pack.py` |
| Tamano del artefacto final | 0,94 GB (frente a 2,16 GB en BF16 safetensors del origen) |
| Runtime objetivo | LiteRT-LM 0.12.0 (CPU/GPU) en Android, iOS, escritorio y web |
| Backend de inferencia | CPU o GPU mediante `litert-lm run --backend=cpu` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo openbmb/MiniCPM5-1B, un transformer decoder-only con estructura compatible con LlamaForCausalLM. La cadena de herramientas declarada por el autor está fijada y verificada precisamente para esa familia: torch 2.12.1 en CPU, litert-torch 0.9.1, ai-edge-quantizer 0.7.0, ai-edge-litert 2.1.5, transformers 5.9.0 y litert-lm / litert-lm-builder 0.12.0 sobre Python 3.12. El contenedor final alberga 24 capas con gate_proj en 8 bits por canal simetrico, las proyecciones de atención y down_proj en 4 bits con bloques de 64 elementos, y una cabeza de salida de 130.560 × 1.536 también en 8 bits por canal. La tabla de embeddings se externaliza para reducir el consumo de memoria en la carga.

No se ha realizado ningún entrenamiento ni ajuste adicional: el autor parte del checkpoint BF16, lo exporta a fp32 con `litert-torch export_hf` (sin receta de cuantización por defecto, embedder externalizado, longitudes de prefill 128 y 1024, cache de 4096 y conversión ligera para minimizar el pico de RAM) y después aplica su propia receta de cuantización con `quantize_and_pack.py`, que reconstruye el `.litertlm` sustituyendo solo las secciones TFLite y preservando los metadatos byte a byte. El proceso está diseñado para ejecutarse con unos 3 GB de RAM máxima mediante mapeo en memoria, lo que permite reproducirlo en máquinas sin GPU. No hay información pública sobre la composición del dataset de preentrenamiento, el número de tokens vistos ni sobre fases de RLHF o DPO del modelo base.

## Capacidades

- Generacion de texto en ingles y chino con licencia Apache-2.0.
- Modo de razonamiento explicito: el modelo emite un bloque `<think>…</think>` antes de la respuesta, comportamiento confirmado en las pruebas de humo del autor.
- Razonamiento aritmetico basico (las pruebas de humo incluyen una pregunta del tipo "¿cuanto es 2+2?").
- Inferencia en dispositivo sin conexion a red ni servidores externos.
- Ejecucion sobre CPU o GPU mediante el runtime LiteRT-LM, con backend seleccionable.
- Soporte de tokenizador HuggingFace y plantilla de chat incluidas dentro del contenedor.
- Capacidades de tool calling, function calling, agentes multi-paso, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Asistentes de texto sin conexion en movil: el contenedor de 0,94 GB cabe en el almacenamiento de un telefono y se ejecuta con LiteRT-LM sobre Android sin enviar datos a la nube, adecuado para aplicaciones de notas, dictado o resumen donde la privacidad es requisito.
- Razonamiento guiado en aplicaciones educativas: el bloque `<think>` permite mostrar al usuario un razonamiento intermedio antes de la respuesta final, util en tutores de matematicas o ejercicios de logica de nivel basico.
- Procesamiento de texto en chino e ingles en herramientas de productividad: traduccion ligera, reescritura y resumen de fragmentos que quepan en la ventana de 4096 tokens, sin coste de API.
- Funciones de autocompletado y asistencia de escritura en editores de escritorio: el modelo puede embeberse como proceso local mediante el CLI o la libreria LiteRT-LM y responder en el mismo dispositivo donde se edita el texto.
- Aplicaciones web progresivas con inferencia local: el runtime declara soporte para web, lo que permite ofrecer generacion de texto en el navegador sin backend propio, con el contenedor servido como recurso estatico.
- Prototipado e investigacion en cuantizacion: las recetas JSON y el script de empaquetado permiten modificar que tensores van en 8 bits (regexes sobre `decode_logits_output` y `.*gate_proj.*`) y volver a empaquetar, lo que convierte el repositorio en un banco de pruebas para estudiar el impacto de la precision mixta en modelos pequenos.
- Clasificacion y extraccion de informacion en pipelines de borde: al no requerir GPU ni red, encaja en gateways industriales o dispositivos IoT que necesiten etiquetar o resumir texto localmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato de validacion aportado por el autor es cualitativo: las pruebas de humo en CPU del host pasaron y el modelo acerto ambas comprobaciones, emitiendo primero el bloque `<think>` y despues la respuesta. Tambien se indica que el contenedor fue verificado con `litert-lm-peek` y probado con el runtime LiteRT-LM.

## Requisitos de hardware

- Almacenamiento: 0,94 GB para el contenedor `.litertlm` final.
- VRAM/RAM estimada para inferencia: no disponible de forma oficial. Como referencia, el pico de RAM declarado durante el proceso de cuantizacion es de aproximadamente 3 GB, y el propio artefacto ocupa 0,94 GB, por lo que un dispositivo con 2-3 GB de memoria libre deberia poder cargarlo; esta cifra es una estimacion derivada del tamano del fichero, no un dato publicado.
- GPU: no se especifican modelos concretos. El runtime LiteRT-LM soporta backend de CPU y de GPU, pero no hay lista de GPU recomendadas ni requisitos minimos publicados.
- GPU de consumo: no confirmado. El enfoque del artefacto es la ejecucion en dispositivo (movil, escritorio, web) mas que en GPU de escritorio de gama alta.
- Opciones de despliegue: LiteRT-LM 0.12.0 como runtime principal (`litert-lm run`), con soporte declarado para Android, iOS, escritorio y web. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y el formato `.litertlm` no es intercambiable con GGUF.
- Latencia y throughput: no disponible.
- Nota de entorno: en sistemas sin servidor grafico, el CLI de `litert-lm` requiere `libEGL.so.1` y `libGLESv2.so.2`; el autor documenta como extraer `libegl1`, `libegl-mesa0`, `libgles2` y `libgbm1` en un directorio local y ajustar `LD_LIBRARY_PATH`.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este artefacto, por lo que la comparacion se limita a formato, licencia y despliegue.

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| MiniCPM5-1B-mixed4-8 | ~1B | 4096 (cache del artefacto) | `.litertlm` (4/8 bits mixto) | Apache-2.0 | On-device, runtime LiteRT-LM |
| openbmb/MiniCPM5-1B (base) | ~1B | No disponible | Safetensors BF16 (2,16 GB) | Apache-2.0 | Modelo original, requiere conversion |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | Safetensors, GGUF | Apache-2.0 | Servidor y local, ecosistema amplio |
| Llama-3.2-1B-Instruct | 1,23B | 128.000 tokens | Safetensors, GGUF | Licencia comunitaria Llama 3.2 | Servidor y local, con restricciones de uso |

Los datos de los modelos alternativos corresponden a sus especificaciones publicas habituales; sus valores de contexto y licencia pueden variar segun la version consultada. No se dispone de resultados comparativos de MMLU, HumanEval, GSM8K ni de ninguna otra prueba que permita establecer una jerarquia de calidad entre ellos y este artefacto.

## Limitaciones y advertencias

- No es un modelo nuevo: cualquier limitacion del modelo base openbmb/MiniCPM5-1B se hereda integra. La cuantizacion puede degradar adicionalmente la calidad, especialmente en tareas que dependan de las proyecciones de atencion y `down_proj`, que estan en 4 bits.
- La ventana de contexto del artefacto esta fijada en 4096 tokens en la exportacion; conversaciones o documentos mas largos requeriran troceado externo.
- Solo se declaran ingles y chino. El rendimiento en castellano u otros idiomas no esta verificado ni documentado.
- Riesgo de alucinacion: inherente a los modelos de ~1B de parametros y no cuantificado en este repositorio, ya que no se aportan evaluaciones de fidelidad.
- Sesgos conocidos: no disponible. No hay informacion sobre la composicion del corpus de entrenamiento ni sobre evaluaciones de sesgo del modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y un unico autor, sin proceso de revision comunitario documentado. Conviene validar el artefacto en el caso de uso concreto antes de llevarlo a produccion.
- La licencia Apache-2.0 permite uso comercial, pero el autor del artefacto no ofrece garantias explicitas sobre la fidelidad numerica de la conversion; el propio autor recomienda ajustar las regexes de la receta si se quiere cambiar que tensores van en 8 bits.
- El formato `.litertlm` es especifico de LiteRT-LM. No es portable a vLLM, llama.cpp, Ollama ni TGI, lo que limita la portabilidad del despliegue.
- Las fechas de creacion y actualizacion del repositorio (16 de septiembre de 2026) son posteriores a la fecha de esta ficha, lo que puede indicar un error de metadatos del autor.
- La busqueda web realizada no devolvio ningun resultado relacionado con este modelo: las entradas recuperadas corresponden a un castillo frances y no aportan informacion tecnica. No se han encontrado papers, blogs ni demos asociados.

## Enlaces

- Repositorio HuggingFace del artefacto: https://huggingface.co/malachkubihd45/MiniCPM5-1B-mixed4-8
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-1B
- Runtime LiteRT-LM: no disponible en la informacion proporcionada
- Paper o documentacion tecnica del modelo base: no disponible en la informacion proporcionada
- Demos o espacios asociados: no disponible en la informacion proporcionada

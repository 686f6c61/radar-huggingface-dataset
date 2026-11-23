# sairaph-official/Qwen3-0.6B-8d42ab5-int8

## Resumen

Qwen3-0.6B-8d42ab5-int8 es un artefacto cuantizado del modelo Qwen3-0.6B de Alibaba Qwen, empaquetado en formato LiteRT-LM para despliegue en Android y escritorio mediante la librería `litert-lm` de Google. Se trata de un espejo (mirror) no modificado del repositorio `litert-community/Qwen3-0.6B`, publicado por el usuario `sairaph-official` para su uso en la aplicacion LLM Server. El fichero incluido, `Qwen3-0.6B.litertlm`, pesa 613.722.264 bytes y es una conversion dinamica a INT8 realizada con la ruta LiteRT Torch y el cuantizador AI Edge Quantizer.

El modelo base es un transformer denso de 0,6 mil millones de parametros perteneciente a la familia Qwen3, con una ventana de contexto de 4.096 tokens en este artefacto concreto y soporte de modo de razonamiento (thinking) activado por defecto, ademas de parsing de tool calls por parte del runtime. Su relevancia radica en que permite ejecutar un modelo de la familia Qwen3 en dispositivos moviles y equipos de escritorio sin GPU dedicada, con un tamano de fichero inferior a 600 MB y un consumo de memoria medido en torno a 1,5-1,9 GiB de RSS pico en un Pixel 8a.

La licencia es Apache 2.0, heredada del modelo base, y el artefacto esta pensado exclusivamente para generacion de texto en ingles segun los metadatos del repositorio, aunque el modelo original Qwen3 es multilingue. Este espejo anade los ficheros de licencia que el repositorio upstream no incluia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3) |
| Parametros totales | 0,6 mil millones (modelo base Qwen3-0.6B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (contexto por defecto en metadatos del artefacto); cache de KV exportada de 32.768 tokens |
| Tipos de cuantizacion | INT8 dinamico (pesos), KV en float; el repositorio upstream ofrece tambien INT4 dinamico block-32 y a16w8 para NPU MediaTek |
| Idiomas soportados | Ingles (segun metadatos del repo); el modelo base Qwen3 es multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); no se distribuyen safetensors ni GGUF en este repositorio |

## Arquitectura y entrenamiento

El modelo base Qwen3-0.6B es un transformer denso con atencion multi-cabeza, normalizacion RMSNorm, QK-norm y RoPE, y activacion SwiGLU en el bloque feed-forward. La familia Qwen3 se entreno con un pipeline que incluye preentrenamiento sobre un corpus multilingue extenso y posteriores fases de alineacion (instruccion y preferencias), aunque la informacion proporcionada no detalla el numero exacto de tokens de entrenamiento ni la composicion del dataset para esta variante de 0,6B.

La innovacion tecnica relevante en este artefacto no esta en el modelo sino en el proceso de conversion: se ha utilizado LiteRT Torch (`litert-torch`) con el cuantizador AI Edge Quantizer para producir pesos INT8 dinamicos, y el runtime LiteRT-LM implementa el modo thinking de Qwen3 (el razonamiento se emite por un canal separado, el "thought channel") y el parsing de tool calls. El artefacto requiere `litert-lm` 0.18.0 o superior y conserva el `tokenizer.json` de Qwen/Qwen3-0.6B byte a byte. La variante INT4 del repositorio upstream emplea ops compuestas para GPU (RMSNorm, QK-norm y RoPE, atencion, SwiGLU y actualizacion de KV-cache) y fusiona las proyecciones QKV y Gate/Up.

## Capacidades

- Generacion de texto en ingles con calidad propia de un modelo de 0,6B parametros.
- Modo de razonamiento (thinking) activado por defecto; se puede desactivar con `enable_thinking=false`, en cuyo caso la respuesta llega por el canal normal.
- Soporte de tool calling / function calling: el runtime LiteRT-LM parsea las llamadas a herramientas segun la configuracion oficial de Qwen3.
- Razonamiento multi-paso basico gracias al canal de pensamiento, limitado por el tamano del modelo.
- Capacidades multilingues heredadas del modelo base Qwen3, aunque los metadatos de este repositorio declaran solo ingles.
- Manejo correcto de emojis y caracteres Unicode (verificado en la model card: "Good morning 😊 🚀" se reproduce exactamente).
- No dispone de vision, audio ni otras modalidades.

## Casos de uso

- Asistente conversacional en aplicaciones Android: el artefacto esta empaquetado en formato `.litertlm` y se ejecuta con `litert-lm` 0.18.0 o superior directamente en el dispositivo, sin conexion a red, con un consumo de memoria pico medido de 1.495-1.580 MiB en un Pixel 8a.
- Clasificacion y extraccion de informacion en el borde: con 4.096 tokens de contexto se pueden procesar documentos cortos (correos, tickets, resenas) y devolver campos estructurados mediante tool calling.
- Automatizacion de respuestas en aplicaciones de mensajeria: el modelo puede gestionar conversaciones multi-turno cortas manteniendo el contexto dentro de la ventana de 4.096 tokens y con latencia de decodificacion de decenas de tokens por segundo en movil.
- Prototipado rapido de agentes locales: el soporte de tool calling y del canal de razonamiento permite construir agentes de un solo paso que invocan funciones del sistema (calendario, clima, busqueda local) sin depender de la nube.
- Generacion de texto asistida en escritorio: mediante el runtime LiteRT-LM para escritorio se puede integrar en editores o herramientas CLI para autocompletado, resumenes y reescritura de parrafos.
- Filtrado y moderacion en el dispositivo: al ser un modelo pequeno y local, puede usarse como primera capa de clasificacion de contenido sensible antes de enviar la peticion a un modelo mayor en servidor.
- Educacion y demos offline: util para mostrar el funcionamiento de un LLM en ferias, aulas o entornos sin conectividad, con un fichero de 586 MB que cabe en almacenamiento movil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card del repositorio upstream unicamente reporta mediciones de rendimiento de runtime en dispositivos:

| Metrica | Valor reportado |
|---|---|
| Prefill (Galaxy S26, GPU OpenCL, LiteRT-LM 0.19.0) | 3.442 tok/s (1.024 tokens) |
| Decodificacion (Galaxy S26, GPU OpenCL, LiteRT-LM 0.19.0) | 81,4 tok/s |
| Prefill (fichero anterior, Galaxy S26) | 2.384 tok/s |
| Decodificacion (fichero anterior, Galaxy S26) | 71,4 tok/s |
| RSS pico (Pixel 8a, prompt 1.355 tokens, 256 tokens de decodificacion, KV 2.048) | 1.495-1.580 MiB (fichero anterior) / 1.924-1.929 MiB (fichero nuevo INT4) |
| RSS pico (Galaxy S26) | 1.658-1.765 MiB (fichero anterior) / 2.034-2.123 MiB (fichero nuevo INT4) |

Nota: estas cifras corresponden a la variante INT4 del repositorio upstream, no al fichero INT8 de este espejo, y fueron medidas con `litert_lm_advanced_main` desde linea de comandos, no en una aplicacion Android integrada.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero INT8 ocupa 586 MB en disco; el RSS pico medido para el fichero INT4 equivalente ronda 1,5-2,1 GiB, por lo que para la variante INT8 cabe esperar un consumo de memoria en el mismo orden o ligeramente superior.
- GPU recomendadas: no requiere GPU dedicada; el runtime LiteRT-LM puede ejecutar en CPU. La ruta GPU (OpenCL) esta disponible en Android y macOS con LiteRT-LM 0.19.0 o superior para la variante INT4; para este fichero INT8 la model card indica compatibilidad con `litert-lm` 0.18.0 o superior.
- Cabe en GPU de consumo: si, en cualquier GPU con al menos 2-3 GB de memoria libre, aunque el objetivo principal es la ejecucion en CPU movil o de escritorio.
- Opciones de despliegue: LiteRT-LM (unica libreria soportada para este formato); no es compatible con vLLM, llama.cpp, Ollama ni TGI, que esperan safetensors o GGUF.
- Latencia y throughput: en Galaxy S26 con la variante INT4 y GPU OpenCL se reportan 3.442 tok/s de prefill y 81,4 tok/s de decodificacion; en CPU el rendimiento es similar al fichero anterior segun la model card. No hay cifras especificas para este fichero INT8.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-0.6B-8d42ab5-int8 (este) | 0,6B | 4.096 | `.litertlm` INT8 | Apache 2.0 | Espejo de litert-community; runtime LiteRT-LM |
| Qwen3-0.6B (base, Alibaba) | 0,6B | 32.768 (original) | safetensors | Apache 2.0 | Modelo completo; requiere runtime estandar (transformers, vLLM) |
| litert-community/Qwen3-0.6B (upstream) | 0,6B | 4.096 | `.litertlm` INT4 / INT8 / a16w8 | Apache 2.0 | Repositorio original con tres variantes y mediciones de rendimiento |
| SmolLM2-360M-Instruct (HuggingFace) | 0,36B | 8.192 | safetensors, GGUF | Apache 2.0 | Alternativa de menor tamano para edge; no comparable en formato LiteRT |

La comparativa se limita a variantes del mismo modelo base y a un modelo de tamano similar, ya que la informacion proporcionada no incluye datos de benchmarks que permitan una comparacion de calidad objetiva.

## Limitaciones y advertencias

- Capacidad limitada por el tamano: con 0,6B parametros, el modelo tiene un conocimiento factual reducido y una propension alta a la alucinacion en preguntas abiertas o especializadas.
- Contexto corto: la ventana por defecto es de 4.096 tokens, insuficiente para documentos largos o conversaciones extensas; la cache de KV exportada de 32.768 tokens no implica que el modelo mantenga calidad en contextos tan largos.
- Idioma: los metadatos declaran solo ingles; el rendimiento en castellano no esta garantizado ni evaluado en la informacion disponible.
- Formato propietario: solo se puede ejecutar con LiteRT-LM, lo que limita la portabilidad frente a safetensors o GGUF y ata el despliegue al ecosistema de Google.
- Dependencia de version del runtime: el artefacto requiere `litert-lm` 0.18.0 o superior; versiones anteriores pueden fallar o degradar el comportamiento del chat template.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible; al heredar el modelo base Qwen3, es probable que arrastre sesgos de su corpus de entrenamiento.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos del modelo base Qwen3 y las condiciones de uso de LiteRT-LM.
- Repositorio de terceros: este espejo no esta mantenido por Alibaba ni por Google; la trazabilidad depende del commit upstream indicado (`8d42ab5f1db14cad987fac57aeb17d070f9e180d`).
- Cero adopcion: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sairaph-official/Qwen3-0.6B-8d42ab5-int8
- Repositorio upstream (litert-community): https://huggingface.co/litert-community/Qwen3-0.6B
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-0.6B/blob/main/LICENSE
- Paper de Qwen3 (referencia arXiv citada en los tags): https://arxiv.org/abs/2505.09388

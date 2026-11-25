# loom-draft/bartowski-Gemma-2-9B-It-SPPO-Iter3-loom

## Resumen

`loom-draft/bartowski-Gemma-2-9B-It-SPPO-Iter3-loom` es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF `Gemma-2-9B-It-SPPO-Iter3-Q4_K_M.gguf` publicado por bartowski. No se trata de un modelo nuevo ni de un fine-tune adicional: los pesos son los del checkpoint original sin modificar, empaquetados para su ejecución sobre GPUs AMD mediante el runtime Loom (`hrx-loom`). El autor del paquete es `loom-draft` y la generación se realizó con la herramienta `loom-next`, sin intervención de un LLM en el bucle de generación.

El modelo subyacente es Gemma 2 9B Instruct, un transformer decoder-only de aproximadamente 9.000 millones de parámetros desarrollado por Google DeepMind, posteriormente alineado mediante SPPO (Self-Play Preference Optimization) en su tercera iteración. El empaquetado está orientado específicamente al hardware AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y a la Radeon AI PRO R9700 (gfx1201, 32 GB), dos plataformas con memoria unificada o VRAM amplia que permiten ejecutar el modelo cuantizado en Q4_K_M de forma local.

La relevancia de esta ficha es acotada: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, el tamaño del repo es de 0.0 GB (los pesos se referencian desde el GGUF base) y las mediciones de rendimiento y las puertas de corrección aparecen como «not yet re-measured» en la model card. Es, por tanto, un artefacto de despliegue experimental más que un modelo publicable por sus propios méritos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2), empaquetado para runtime Loom |
| Parametros totales | 9B (heredados del checkpoint base Gemma-2-9B-It) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens por petición (según preset del paquete) |
| Tipos de cuantizacion | Q4_K_M (GGUF de origen); otras cuantizaciones no disponibles en este paquete |
| Idiomas soportados | no disponibles (la model card no los declara) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF (Q4_K_M) referenciado; programas `.loom` y `weights.loom` generados |
| Salida maxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultaneas |
| API | OpenAI-compatible `/v1/chat/completions` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB) |

## Arquitectura y entrenamiento

El modelo subyacente es Gemma 2 9B Instruct, un transformer decoder-only con atención por ventanas deslizantes e intercaladas y atención global, tal como se publicó en la familia Gemma 2 de Google DeepMind. Sobre esa base, la iteración SPPO-Iter3 aplica Self-Play Preference Optimization, un método de alineación por preferencias que sustituye o complementa el RLHF clásico utilizando un esquema de auto-juego. El paquete Loom no altera los pesos: el GGUF `Gemma-2-9B-It-SPPO-Iter3-Q4_K_M.gguf` se toma tal cual y se traduce a programas `.loom` y a un fichero `weights.loom` mediante el generador `loom-next`.

La innovación técnica del repositorio no está en el modelo sino en el pipeline de despliegue: Loom compila el grafo de inferencia a kernels específicos para las arquitecturas AMD gfx1151 y gfx1201, con un pool de memoria fijo (`--pool_backing=fixed`) y precarga de parámetros en host (`--parameter_mode=preload`). La model card incluye un conjunto de puertas de corrección (`kernel_tests`, `golden`, `compare`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`) que comparan la salida contra una referencia de llama.cpp registrada sobre el mismo GGUF, pero todas ellas figuran como «not yet re-measured» para ambas GPUs. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni detalles del proceso SPPO más allá de la nomenclatura de la iteración.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y otros idiomas, heredada del checkpoint Gemma-2-9B-It-SPPO-Iter3 (los idiomas concretos no se declaran en la tarjeta).
- Razonamiento y respuesta a instrucciones, con el nivel de alineación propio de la iteración SPPO 3.
- Generación de código y matemáticas, capacidades estándar del modelo base Gemma 2 9B Instruct.
- Servidor HTTP compatible con la API de OpenAI (`/v1/chat/completions`), lo que permite integrarlo con clientes existentes.
- Concurrencia de hasta 4 peticiones simultáneas.
- Ventana de contexto de 8.192 tokens por petición y hasta 4.096 tokens de salida.
- Tool calling: no aplicable según la tarjeta del paquete.
- Modo razonamiento / thinking: no aplicable.
- Decodificación especulativa: no aplicable en este paquete.
- Entrada de imagen o audio: no aplicable.
- Muestreo (`temperature`, `top_k`, `seed`): estado «?» (no determinado) en la tabla de características.

## Casos de uso

- Despliegue local en estaciones de trabajo con Ryzen AI Max+ 395: el paquete está pensado para ejecutarse íntegramente en la iGPU mediante `loom-serve`, sin depender de CUDA ni de GPUs NVIDIA, lo que facilita entornos de desarrollo con hardware AMD.
- Inferencia en servidores con Radeon AI PRO R9700: los 32 GB de VRAM de esta tarjeta permiten cargar el Q4_K_M con margen para el pool de memoria fijo y atender hasta 4 peticiones concurrentes.
- Asistente conversacional de propósito general: la API compatible con OpenAI permite conectar el modelo a interfaces tipo chat o a frameworks de orquestación sin adaptadores adicionales.
- Procesamiento por lotes de documentos de hasta 8.192 tokens: resúmenes, extracción de información y reescritura de textos que quepan en la ventana de contexto configurada.
- Evaluación comparativa de runtimes AMD: el paquete incluye puertas de corrección frente a llama.cpp, por lo que sirve como banco de pruebas para validar la fidelidad numérica de Loom sobre gfx1151 y gfx1201.
- Base para experimentos de cuantización y rendimiento: al estar construido sobre un GGUF Q4_K_M estándar, permite comparar el rendimiento de Loom con el de llama.cpp sobre el mismo checkpoint.
- Entornos educativos o de investigación sin acceso a GPUs NVIDIA: ofrece una vía para ejecutar un modelo de 9B alineado por preferencias en hardware AMD de consumo o estación de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) «are not yet re-measured», y que todas las puertas de corrección figuran como «not yet re-measured». No se dispone de cifras de MMLU, HumanEval, GSM8K ni de latencia o throughput para este paquete.

## Requisitos de hardware

- VRAM estimada: el checkpoint es Q4_K_M de un modelo de 9B, lo que típicamente ocupa en torno a 5-6 GB de pesos; el paquete añade el pool de memoria fijo configurado por el preset, cuyo tamaño exacto no se detalla en la información disponible.
- GPU objetivo declaradas: AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151, memoria unificada) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB de VRAM).
- GPU de consumo: no se declara compatibilidad con GPUs de consumo AMD o NVIDIA; el paquete está generado específicamente para gfx1151 y gfx1201.
- Despliegue: runtime `hrx-loom[hf]==0.2.0`, instalado vía `pipx`; servidor `loom-serve` con flags `--pool_backing=fixed` y `--parameter_mode=preload`; descarga con `loom-fetch`.
- Alternativas de despliegue (llama.cpp, Ollama, vLLM, TGI): no documentadas para este paquete; el GGUF base sí es compatible con llama.cpp y derivados.
- Latencia y throughput: no disponibles; las mediciones están pendientes de reejecución según la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| `loom-draft/bartowski-Gemma-2-9B-It-SPPO-Iter3-loom` (este) | 9B | 8.192 tokens | gemma | GGUF Q4_K_M + runtime Loom (AMD gfx1151/gfx1201) | Paquete de despliegue; sin benchmarks publicados; 0 descargas |
| `bartowski/Gemma-2-9B-It-SPPO-Iter3-GGUF` (base) | 9B | hasta 8.192 tokens (Gemma 2) | gemma | GGUF; llama.cpp y derivados | Checkpoint de referencia del que se genera este paquete |
| Gemma 2 9B Instruct (original, Google DeepMind) | 9B | 8.192 tokens | gemma | safetensors, GGUF, múltiples runtimes | Modelo base antes de la alineación SPPO |
| Llama 3.1 8B Instruct (Meta) | 8B | 128.000 tokens | llama 3.1 community | safetensors, GGUF, vLLM, TGI | Alternativa de tamaño similar con contexto mucho mayor; licencia distinta |

La comparación con Llama 3.1 8B se ofrece como referencia de categoría (modelo denso de ~8-9B); no se dispone de datos de rendimiento comparativo para este paquete Loom.

## Limitaciones y advertencias

- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.
- Sin mediciones de rendimiento ni de corrección: todas las puertas (`kernel_tests`, `golden`, `compare`, `consistency`, `spec`, `agent`, `sampling`, `logits`, `decision`) figuran como «not yet re-measured» para ambas GPUs.
- Tamaño del repo de 0.0 GB: los pesos no se alojan en este repositorio, sino que se referencian desde el GGUF base; la disponibilidad depende de que ese checkpoint siga accesible.
- Contexto limitado a 8.192 tokens por petición en el preset del paquete, inferior al contexto nativo de otras alternativas contemporáneas.
- Idiomas soportados no declarados en la tarjeta; no se puede garantizar cobertura multilingüe más allá de la del modelo base.
- Tool calling, modo thinking, decodificación especulativa y entrada multimodal marcados como «not applicable» en este paquete.
- Estado del muestreo (`temperature`, `top_k`, `seed`) marcado como «?» (no determinado): no hay garantía documentada de que el muestreo se comporte de forma idéntica a llama.cpp.
- Licencia Gemma: sujeta a los Gemma Terms of Use, con restricciones de uso comercial y obligaciones de atribución que deben revisarse antes de un despliegue en producción.
- Riesgo de alucinación inherente a los modelos de 9B alineados por preferencias; no se documentan evaluaciones de sesgo ni de seguridad específicas para esta iteración SPPO.
- Dependencia de un runtime propietario del ecosistema Loom (`hrx-loom==0.2.0`) y de hardware AMD concreto; no es portable a otras plataformas sin regenerar el paquete.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/bartowski-Gemma-2-9B-It-SPPO-Iter3-loom
- Checkpoint base en Hugging Face: https://huggingface.co/bartowski/Gemma-2-9B-It-SPPO-Iter3-GGUF
- Runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/

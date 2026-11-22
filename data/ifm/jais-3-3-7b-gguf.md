# IFM/Jais-3-3.7B-GGUF

## Resumen

Jais-3-3.7B es un modelo de lenguaje decoder-only de tipo denso desarrollado por IFM (Inception42), concebido como el miembro pequeno de la familia Jais-3. Con 3,7B parametros nominales y una ventana de contexto de 512K tokens, esta pensado para tareas de generacion de texto y conversacion en arabe e ingles, dos idiomas que declara soportar de forma nativa. La version aqui descrita es la cuantizacion GGUF publicada por IFM para su uso con `llama.cpp`.

El modelo emplea una arquitectura propietaria denominada K2 Horizon, cuyo soporte se ha integrado en `llama.cpp` mediante el PR ggml-org/llama.cpp#29535, lo que exige compilaciones recientes del runtime. Se distribuye bajo licencia Apache 2.0, lo que facilita su adopcion comercial, y esta disponible en varias precisiones (BF16, Q8_0, Q6_K, Q5_K_M, Q5_0 y Q4_K_M) para adaptarse a distintos presupuestos de memoria.

Su relevancia actual radica en la combinacion de un contexto extremadamente largo (512K) con un tamano contenido y una licencia permisiva, algo poco habitual en modelos orientados al arabe. La ficha tecnica del autor incluye comparativas con Qwen3.5-4B, Gemma 4 E2B, granite-4.0-h-3b-ar y Falcon-H1-3B-Instruct, lo que situa al modelo en el segmento de modelos densos de 3-4B parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | K2 Horizon, decoder-only denso (transformer) |
| Parametros totales | 3,7B nominales; 5.058.255.360 segun safetensors del modelo base |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 512K tokens |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_0, Q4_K_M (GGUF); FP8; MLX 4-bit, 8-bit y bf16 |
| Idiomas soportados | arabe (ar), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repo); safetensors en el modelo base; FP8 y MLX en repos hermanos |

## Arquitectura y entrenamiento

Jais-3-3.7B es un transformer decoder-only denso de 3,7B parametros construido sobre la arquitectura K2 Horizon, una variante propietaria de IFM cuya implementacion se ha incorporado a `llama.cpp` en el PR #29535. El modelo base (`inception42/Jais-3-3.7B`) se distribuye en safetensors, mientras que este repositorio contiene las conversiones GGUF generadas para inferencia con `llama.cpp`. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO.

La innovacion tecnica mas destacable es la ventana de contexto de 512K tokens en un modelo de este tamano, un rango habitualmente reservado a modelos mucho mayores. La model card advierte que el soporte de la arquitectura K2 Horizon requiere una version reciente de `llama.cpp` (compilada desde `master` o posterior al merge del PR) y que `llama-server` debe arrancarse con `--jinja` para que se analicen correctamente el razonamiento y las llamadas a herramientas.

## Capacidades

- Generacion de texto conversacional en arabe e ingles.
- Razonamiento con modo explicito de pensamiento (reasoning), parseable via `--jinja` en `llama-server`.
- Soporte de tool calling / function calling, segun la nota de despliegue de la model card.
- Ventana de contexto de 512K tokens, adecuada para documentos largos y conversaciones multi-turno extensas.
- Capacidades multilingues limitadas a arabe e ingles.
- No se documentan capacidades de vision, audio ni otras modalidades.

## Casos de uso

- Atencion al cliente en arabe: el modelo puede mantener conversaciones multi-turno con historiales extensos gracias a sus 512K tokens de contexto, sin necesidad de truncar el dialogo previo ni resumirlo.
- Analisis de documentos legales o administrativos en arabe: la ventana de contexto permite procesar contratos o expedientes completos en una sola pasada y responder preguntas sobre su contenido.
- Asistentes con acceso a herramientas: mediante tool calling se puede integrar en flujos donde el modelo consulte APIs, bases de datos o servicios externos y componga la respuesta final.
- Despliegue en hardware de consumo: las cuantizaciones Q4_K_M y Q5_K_M caben en GPUs consumer, lo que permite ejecutar un modelo de 512K de contexto en equipos locales para prototipado y demos.
- Generacion de contenido bilingue arabe-ingles: redaccion, traduccion asistida y adaptacion de textos entre ambos idiomas en entornos editoriales o de marketing.
- Procesamiento por lotes en servidores modestos: al ser un modelo denso de 3,7B, ofrece un throughput alto por GPU en comparacion con modelos mayores, adecuado para clasificacion, extraccion y resumen a gran escala.
- Investigacion sobre contexto largo: sirve como banco de pruebas para experimentos de recuperacion en contextos de cientos de miles de tokens con un modelo de tamano manejable.

## Benchmarks y rendimiento

La model card incluye una imagen de resultados de benchmarks (`assets/jais-3-3.7b-benchmarks.png`) y una tabla comparativa con Qwen3.5-4B, Gemma 4 E2B, granite-4.0-h-3b-ar y Falcon-H1-3B-Instruct. Sin embargo, en la informacion proporcionada solo se detallan las filas de numero de parametros, parametros activos y arquitectura; los valores numericos de las tareas de evaluacion (MMLU, HumanEval, GSM8K u otras) no estan disponibles en el texto extraido.

| Modelo | Parametros | Parametros activos | Arquitectura |
|---|---|---|---|
| Jais-3-3.7B | 3,7B | 3,7B | Dense |
| Qwen3.5-4B | 4B | 4B | Dense |
| Gemma 4 E2B | 5B | 2,3B | no disponible en el extracto |
| granite-4.0-h-3b-ar | 3B | 3B | no disponible en el extracto |
| Falcon-H1-3B-Instruct | 3B | 3B | no disponible en el extracto |

No se han publicado en la informacion disponible los resultados numericos por tarea de los benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB en Q4_K_M, 3,5-4 GB en Q5_K_M, 4-4,5 GB en Q6_K, 4,5-5 GB en Q8_0 y en torno a 10 GB en BF16 (estimaciones a partir del numero de parametros; no confirmadas por el autor).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100 y H100 para despliegues de produccion.
- Cabe en GPUs consumer: si, en cualquiera con 6 GB o mas de VRAM para cuantizaciones Q4/Q5; las variantes Q8_0 y BF16 requieren 8-12 GB.
- Opciones de despliegue: `llama.cpp` (compilacion reciente desde `master` o posterior al PR #29535), `llama-server` con `--jinja`; variantes MLX para Apple Silicon; FP8 para GPUs con soporte.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Jais-3-3.7B | 3,7B | 512K | Apache 2.0 | GGUF, FP8, MLX, safetensors |
| Qwen3.5-4B | 4B | no disponible | no disponible | no disponible |
| Gemma 4 E2B | 5B (2,3B activos) | no disponible | no disponible | no disponible |
| granite-4.0-h-3b-ar | 3B | no disponible | no disponible | no disponible |
| Falcon-H1-3B-Instruct | 3B | no disponible | no disponible | no disponible |

Los datos de contexto, licencia y disponibilidad de los modelos de referencia no figuran en la informacion proporcionada; solo se dispone de sus cifras de parametros y arquitectura segun la tabla del autor.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al entrenarse presumiblemente con datos web, es esperable que herede sesgos de esas fuentes, pero no hay confirmacion.
- Riesgo de alucinacion: no cuantificado por el autor; como todo modelo generativo de este tamano, puede producir contenido plausible pero incorrecto, especialmente en tareas factuales.
- Idiomas: solo se declaran arabe e ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base `inception42/Jais-3-3.7B` por si hubiera terminos adicionales.
- Despliegue: requiere una version de `llama.cpp` con soporte de K2 Horizon (PR #29535); versiones antiguas no cargaran el modelo. Es imprescindible arrancar `llama-server` con `--jinja` para el parseo de razonamiento y tool calls.
- Contexto largo: aunque se declaran 512K tokens, el rendimiento real en contextos muy extensos no esta validado en la informacion disponible y suele degradarse en modelos de este tamano.
- Datos de entrenamiento: no se especifican tokens, composicion del dataset ni fases de alineacion, lo que dificulta evaluar su robustez en dominios especializados.

## Enlaces

- Repositorio GGUF: https://huggingface.co/IFM/Jais-3-3.7B-GGUF
- Modelo base: https://huggingface.co/inception42/Jais-3-3.7B
- Coleccion Jais-3: https://huggingface.co/collections/IFM/jais-3-6abba9df4f1173ec7ce2929d
- Variante FP8: https://huggingface.co/IFM/Jais-3-3.7B-FP8
- Variante MLX 4-bit: https://huggingface.co/IFM/Jais-3-3.7B-MLX-4bit
- Variante MLX 8-bit: https://huggingface.co/IFM/Jais-3-3.7B-MLX-8bit
- Variante MLX bf16: https://huggingface.co/IFM/Jais-3-3.7B-MLX-bf16
- PR de soporte en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/29535
- Paper (referencia arXiv en tags): arxiv:2611.10224

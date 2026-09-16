# jakeatx/ATX-Swift-Qwen3.8-27B-Uncensored-IQ4_XS-M-GGUF

## Resumen

ATX-Swift-Qwen3.8-27B-Uncensored-IQ4_XS-M es una cuantizacion GGUF del modelo d0xin/Swift-Qwen3.8-27B-Uncensored-BF16, que a su vez es una version "abliterated" (sin mecanismos de rechazo) del Swift-Qwen3.8-27B de UkisAI. La publica el usuario jakeatx dentro de su familia de recetas de cuantizacion ATX, orientadas a exprimir tarjetas de 24 GB con contexto largo. El modelo conserva los 27.320.697.856 parametros (27,32 B) y los 866 tensores de texto y MTP del Qwen3.8-27B original, por lo que la arquitectura no cambia respecto a la base: se trata de un transformer hibrido con capas de atencion y capas Gated DeltaNet (GDN) mas una cabeza MTP de decodificacion especulativa.

El interes de este fichero no esta en el modelo en si, sino en la receta de cuantizacion: un mix IQ4_XS como formato base con patron M (los mismos tensores que sube Q4_K_M), lo que da 4,56 bits por peso y un fichero de 14,5 GiB (15.588.550.816 bytes) con la capa MTP incluida. El objetivo declarado es caber con un contexto de 200.000 tokens y cache de claves de 8 bits en una RTX 3090 o 3090 Ti, y decodificar mas rapido por ronda especulativa que los mixes Q4 habituales en esa tarjeta. Incluye su propia importance matrix calculada sobre unos 226.000 tokens de texto de calibracion.

Es relevante ahora porque combina tres tendencias simultaneas: modelos abliterated sin censura, cuantizaciones de precision mixta optimizadas para una arquitectura GPU concreta (SM86) y decodificacion especulativa usando la cabeza MTP propia del modelo. Conviene senalar que es un build de comunidad, sin descargas ni validacion independiente en el momento de redactar esta ficha, y que su licencia (swift-open-license-1.0) debe revisarse antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion y capas Gated DeltaNet (GDN); incluye capa MTP (Multi-Token Prediction) para decodificacion especulativa (blk.64) |
| Parametros totales | 27.320.697.856 (27,32 B) |
| Parametros activos | No aplica: no se describe como MoE en la informacion disponible |
| Longitud de contexto | Receta disenada para un contexto poblado de 200.000 tokens; la configuracion de referencia usa -c 245760 (240K). Longitud nativa del modelo base: no disponible |
| Tipos de cuantizacion | Mix sobre base IQ4_XS a 4,56 bits por peso: IQ4_XS (mayoria, ~75% de los bytes de pesos), Q5_0 (attn_output, ssm_out, ffn_down de las capas prioritarias y capa MTP), Q6_K (proyecciones K/V de atencion y cabeza de salida), Q8_0 (los ocho tensores K/V que Q4_K_M mantiene en Q8_0, y vectores alpha/beta de GDN), Q4_K (token embedding) |
| Idiomas soportados | No disponible (no declarados en la informacion proporcionada) |
| Licencia | swift-open-license-1.0 (declarada como license: other) |
| Formato de pesos | GGUF (fichero unico, text-only, sin torre de vision); el modelo base esta en safetensors BF16 |

Datos adicionales: fichero principal ATX-Swift-Qwen3.8-27B-Uncensored-IQ4_XS-M.gguf de 14,5 GiB; sha256 51880ce0f15aebcad7abc8e4d6273b7bf270e15353a5ddcf63e8139c571b4425; tamano total del repositorio 15,6 GB; descargas 0 y likes 0 en el momento de la consulta.

## Arquitectura y entrenamiento

No hay entrenamiento nuevo en este artefacto: es una cuantizacion. La cadena es Swift-Qwen3.8-27B (UkisAI) a d0xin/Swift-Qwen3.8-27B-Uncensored-BF16 mediante ablacion direccional de rango 1 sobre el flujo residual (rank-1 directional residual-stream ablation), es decir, abliteration, y de ahi a este GGUF. La arquitectura, el recuento de parametros y los 866 tensores de texto y MTP coinciden con el Qwen3.8-27B base, por lo que la receta de cuantizacion se traslada sin cambios. Los nombres de tensores presentes (attn_output, ssm_out, proyecciones K/V de atencion, vectores alpha/beta de GDN) apuntan a un diseno hibrido que mezcla atencion clasica con capas de estado lineal tipo Gated DeltaNet.

El proceso de cuantizacion si es especifico de este build. Los safetensors se convirtieron primero a GGUF BF16 conservando la capa MTP, y despues se cuantizaron con llama-quantize aplicando un mapa de tipos por tensor (tensor_types_ATX-4-XS.txt) y una importance matrix propia, calculada a partir de este modelo en Q8_0. La calibracion suma unos 226.000 tokens: el calibration_datav3 de Bartowski (prosa mixta, codigo, multilingue y chat), 64.000 tokens de prompts agenticos y de codigo, y un prompt de analisis de recuperacion de 32.000 tokens, procedentes del conjunto de prompts de produccion con el que se ajusto la receta. El autor justifica las elecciones tecnicas con tres argumentos: en SM86 IQ4_XS es el formato de pesos mas rapido por tensor para anchos de verificacion especulativa de 1 a 5; Q5_0 es aproximadamente un 16% mas barato que Q5_K; y Q8_0 es el unico formato que queda cerca del techo de memoria. Los bits extra se colocan donde la escalera de niveles de Unsloth los situa: V/K de atencion, salida de atencion, salida de GDN y ffn_down. Tras cuantizar se verifico que el nombre y el tipo de cada tensor coinciden con el build base ATX-IQ4_XS-M.

## Capacidades

- Generacion de texto conversacional y continuacion de contexto largo (hasta unos 200.000 tokens en la configuracion descrita), lo que habilita tareas de recuperacion y analisis sobre documentos extensos.
- Razonamiento y codigo en el mismo rango que el Qwen3.8-27B base, del que hereda pesos; el autor documenta que parte de la calibracion se hizo con prompts de codigo y agenticos, lo que indica uso previsto en esos dominios.
- Decodificacion especulativa nativa mediante la cabeza MTP del propio modelo (opciones --spec-type draft-mtp --spec-draft-n-max 3 --spec-draft-p-min 0), sin necesidad de un modelo drafter externo.
- Contexto extendido con cache de claves cuantizada en 8 bits y valores en formato turbo3 (especifico del fork llamAmpere), lo que reduce el coste de memoria del KV cache.
- Compatibilidad con plantillas Jinja y modo servidor (--jinja, endpoints compatibles segun las etiquetas del repositorio), lo que permite exponerlo como API.
- Gestion de cache de prompt y checkpoints de contexto (--cache-prompt, --cache-ram 8192, --ctx-checkpoints 24), util para sesiones multi-turno largas.
- Modelo sin censura: el comportamiento de rechazo fue eliminado deliberadamente aguas arriba, por lo que respondera a peticiones que el Swift original rechazaria.
- Vision: no soportada. El fichero es text-only y no incluye torre de vision.
- Idiomas: no disponibles; no se declara cobertura multilingue especifica.
- Tool calling / function calling: no documentado explicitamente en la informacion proporcionada, aunque la calibracion con prompts agenticos y el soporte de plantillas Jinja son indicios, no confirmacion.

## Casos de uso

- Procesamiento de documentacion extensa en una sola pasada: con ~200.000 tokens de contexto y cache K en 8 bits, el modelo puede cargar contratos, expedientes o bases de conocimiento completas y responder preguntas sobre ellos sin trocear el texto, algo critico cuando las dependencias entre secciones importan.
- Asistente de codigo local en estaciones de trabajo con una RTX 3090: el fichero cabe junto al KV cache en 24 GB, se sirve con llama-server y puede integrarse en editores o pipelines de CI/CD mediante la API compatible con endpoints, evitando enviar codigo propietario a servicios externos.
- Analisis de recuperacion (retrieval analysis) sobre corpus largos: el propio autor incluye un prompt de 32.000 tokens de este tipo en la calibracion, lo que indica que la receta se ajusto para que el modelo razone sobre fragmentos recuperados y no solo los resuma.
- Agentes multi-paso con contexto persistente: el uso de checkpoints de contexto y cache de prompt permite mantener el estado de una tarea larga entre llamadas sin reprocesar todo el historial, reduciendo coste por turno.
- Generacion de texto sin restricciones tematicas para investigacion sobre alineacion y seguridad: al ser un modelo abliterated, sirve para estudiar comportamiento de rechazo, sesgos residuales y degradacion de capacidades tras la ablacion, siempre en un entorno controlado.
- Redaccion y edicion de textos largos (informes, narrativa, documentacion tecnica) donde el contexto amplio evita perder coherencia entre capitulos y el modelo puede mantener un estilo consistente a lo largo de decenas de miles de tokens.
- Despliegue en hardware de gama alta de consumidor para prototipado rapido: al ser GGUF, el mismo fichero se puede mover entre el fork llamAmpere (maximo rendimiento en SM86), TurboQuant+ de stock y llama.cpp de mainline, aceptando menos margen de contexto en los dos ultimos.
- Traduccion y reescritura de documentos largos: no hay lista de idiomas declarada, por lo que su uso multilingue deberia validarse empiricamente antes de depender de el.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card menciona que la tarjeta del modelo upstream (d0xin/Swift-Qwen3.8-27B-Uncensored-BF16) describe la ablacion junto con evaluaciones de rechazo y de preservacion de inteligencia, pero no se reproducen cifras concretas (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion proporcionada. Tampoco se publican mediciones de tokens por segundo ni latencias absolutas; el unico dato de rendimiento relativo es cualitativo: el autor afirma que esta mezcla decodifica mas rapido por ronda especulativa que los mixes Q4 de stock en SM86 con anchos de verificacion de 1 a 5.

## Requisitos de hardware

- VRAM para los pesos: aproximadamente 14,5 GiB (15.588.550.816 bytes) en el fichero IQ4_XS-M, a 4,56 bits por peso.
- VRAM total objetivo: 24 GB, segun el diseno explicito de la receta para RTX 3090 y RTX 3090 Ti, incluyendo un contexto poblado de 200.000 tokens con cache de claves en 8 bits y valores en turbo3. La cifra exacta de memoria del KV cache en esa configuracion no se detalla en la informacion disponible.
- GPU recomendadas: RTX 3090 y RTX 3090 Ti (SM86) son el objetivo declarado, con kernels SM86 especificos. Otras GPU no estan confirmadas; el autor indica que el fichero tambien carga en TurboQuant+ de stock y en llama.cpp mainline, pero con menos margen de contexto, y que mainline no dispone de cache turbo3.
- GPU de consumo: si, en tarjetas de 24 GB. En GPU de 16 GB o menos solo cabria con un contexto muy reducido, y ese escenario no esta documentado (estimacion a partir del tamano de pesos, no dato confirmado).
- Opciones de despliegue: llama-server del fork llamAmpere (v0.3 citada como la configuracion mas rapida), heredero de github.com/JakeATX/llama-cpp-qwen-ampere; TurboQuant+ de stock; y llama.cpp mainline. Al ser GGUF, es compatible con el ecosistema llama.cpp en general, aunque no se confirma soporte especifico de Ollama u otros runners en la informacion disponible.
- Compilacion: -DGGML_CUDA=ON -DGGML_CUDA_FA=ON -DCMAKE_CUDA_ARCHITECTURES=86.
- Configuracion de referencia del autor: GGML_Q8_TURBO3_MMA_FUSED=1, -c 245760, -b 4096, -ub 1024, -t 8, -tb 8, -ngl 99, -fa on, -ctk q8_0, -ctv turbo3, --parallel 1, --jinja, --fit off, --cache-prompt, --cache-ram 8192, --ctx-checkpoints 24, --checkpoint-min-step 10240, --spec-type draft-mtp, --spec-draft-n-max 3, --spec-draft-p-min 0.
- Latencia y throughput: no disponibles. No se publican tokens por segundo, tiempo hasta el primer token ni curvas de escalado con el contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ATX-Swift-Qwen3.8-27B-Uncensored-IQ4_XS-M (este) | 27,32 B | GGUF IQ4_XS-M, 4,56 bpw, 14,5 GiB | Receta para 200K; config de referencia 245.760 | swift-open-license-1.0 | Publico en HuggingFace; 0 descargas |
| jakeatx/Qwen3.8-27B-ATX-IQ4_XS-M-GGUF | 27,32 B (misma base no abliterated) | GGUF IQ4_XS-M, mismo mapa de tipos | Misma receta | No disponible | Publico en HuggingFace |
| d0xin/Swift-Qwen3.8-27B-Uncensored-BF16 | 27,32 B | safetensors BF16 | No disponible | No disponible | Publico en HuggingFace; es el modelo base de este build |
| ukisai/Swift-Qwen3.8-27b | 27,32 B | No disponible (modelo original sin abliterar) | No disponible | No disponible | Publico en HuggingFace |
| jakeatx/Qwopus3.8-27B-Flash-ATX-IQ4_XS-M-GGUF | No disponible | GGUF IQ4_XS-M con 11 tensores Q5_0 adicionales en capas tempranas | Misma receta | No disponible | Publico en HuggingFace |

La comparacion cuantitativa de rendimiento entre estos modelos no es posible con la informacion disponible: no se publican resultados de benchmarks para ninguno de ellos en el material consultado. La diferencia funcional relevante es que este build parte de un modelo abliterated y que el de Qwopus ajusta el mapa de tensores para replicar las protecciones del Q4_K_S de Jackrong, mientras que en Swift no existe una mezcla de referencia y se usa el mapa base sin cambios.

## Limitaciones y advertencias

- Modelo sin censura por diseno: la ablacion elimina el comportamiento de rechazo, de modo que puede generar contenido que el Swift original declinaria. Requiere revision humana del output y una politica de uso clara en cualquier despliegue.
- Riesgo de degradacion por abliteration: la ablacion direccional sobre el flujo residual puede afectar a capacidades generales. La tarjeta upstream declara evaluaciones de preservacion de inteligencia, pero no se reproducen cifras en la informacion disponible, por lo que no se puede cuantificar la perdida.
- Alucinacion: es un riesgo inherente a cualquier modelo de lenguaje de esta familia y no se documentan medidas especificas de mitigacion en este build. Con contextos de 200.000 tokens el riesgo de mezclar informacion distante aumenta.
- Idioma: no se declara lista de idiomas soportados. El castellano no esta confirmado como idioma de calidad; habria que validarlo antes de usarlo en produccion.
- Vision: no soportada. El fichero es text-only y no incluye torre de vision, aunque la arquitectura base pueda tener variantes multimodales.
- Licencia: swift-open-license-1.0 (license: other). Es una licencia personalizada, no una licencia estandar de codigo abierto, y no se detallan sus condiciones en la informacion proporcionada. Es imprescindible leerla antes de cualquier uso comercial.
- Artefacto de comunidad: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente ni resultados reproducidos por terceros.
- Dependencia de un fork: el maximo aprovechamiento del contexto largo depende de llamAmpere y de su cache turbo3. En llama.cpp mainline el mismo fichero carga con menos margen de contexto.
- Sensibilidad a la configuracion: los parametros de decodificacion especulativa (--spec-draft-n-max, --spec-draft-p-min) y de cache afectan directamente al rendimiento y al consumo de memoria; no se publican valores de referencia mas alla de la configuracion citada.
- Fecha de publicacion inusual: el repositorio indica creacion el 2026-09-16, dato que conviene verificar en la pagina del modelo por si fuera un error de metadatos.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/jakeatx/ATX-Swift-Qwen3.8-27B-Uncensored-IQ4_XS-M-GGUF
- Modelo base (BF16, abliterated): https://huggingface.co/d0xin/Swift-Qwen3.8-27B-Uncensored-BF16
- Modelo original sin abliterar: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Build ATX equivalente sobre la base no abliterated: https://huggingface.co/jakeatx/Qwen3.8-27B-ATX-IQ4_XS-M-GGUF
- Build ATX sobre el fine-tune Qwopus: https://huggingface.co/jakeatx/Qwopus3.8-27B-Flash-ATX-IQ4_XS-M-GGUF
- Fork de llama.cpp con kernels SM86 (predecesor de llamAmpere): https://github.com/JakeATX/llama-cpp-qwen-ampere
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo; las referencias devueltas corresponden a una plataforma educativa sin relacion con el artefacto.
- Paper o blog tecnico del modelo: no disponible en la informacion proporcionada.

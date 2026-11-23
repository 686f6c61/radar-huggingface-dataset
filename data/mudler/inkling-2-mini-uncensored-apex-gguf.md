# mudler/Inkling-2-Mini-Uncensored-APEX-GGUF

## Resumen

Inkling-2-Mini-Uncensored-APEX-GGUF es un conjunto de cuantizaciones GGUF del modelo OpenUncensored/Inkling-2-Mini-Uncensored, una variante "abliterated" (sin direcciones de rechazo) del modelo thinkingmachines/Inkling-2-Mini. El trabajo lo publica mudler, responsable del proyecto LocalAI y del proyecto APEX de cuantizacion, no el autor del modelo original. El modelo base es un transformer de tipo mixture-of-experts (MoE) con 26.070.385.152 parametros totales segun los safetensors del checkpoint fuente.

La relevancia de esta publicacion es doble. Por un lado, ofrece el modelo en formato GGUF con varios niveles de cuantizacion (desde 11,34 GB hasta 20,68 GB) para poder ejecutarlo con llama.cpp y derivados en hardware local, incluida una DGX Spark con 122 GB de memoria unificada. Por otro lado, incluye artefactos sidecar poco habituales: un proyector de vision en F16 y un drafter de decodificacion especulativa DSpark, lo que permite habilitar entrada multimodal y aceleracion de inferencia sin salir del ecosistema GGUF.

Conviene subrayar que el autor lo etiqueta explicitamente como "unevaluated preview": los ficheros se comprobaron solo para verificar que cargan y generan texto coherente con un prompt corto por nivel, un prompt de imagen y una ejecucion del drafter. No hay perplexity, KL ni benchmarks publicados, y no se ha probado el comportamiento de rechazo del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE); derivado abliterated de thinkingmachines/Inkling-2-Mini |
| Parametros totales | 26.070.385.152 (~26,07 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF k-quant en 4 niveles APEX (Quality, Balanced, Compact, Mini, Nano), con y sin imatrix; el checkpoint fuente es de ~19,5 GB en pesos float de 4 y 8 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (ficheros principales); sidecar de vision en GGUF F16; drafter en GGUF Q8_0; imatrix en GGUF |

Ficheros publicados:

| Fichero | Tamano | Uso previsto |
|---|---|---|
| Inkling-2-Mini-Uncensored-APEX-Quality.gguf | 20,07 GB | maxima calidad |
| Inkling-2-Mini-Uncensored-APEX-I-Quality.gguf | 20,07 GB | maxima calidad, con imatrix |
| Inkling-2-Mini-Uncensored-APEX-Balanced.gguf | 20,68 GB | proposito general |
| Inkling-2-Mini-Uncensored-APEX-I-Balanced.gguf | 20,68 GB | proposito general, con imatrix |
| Inkling-2-Mini-Uncensored-APEX-Compact.gguf | 14,10 GB | GPUs de consumo |
| Inkling-2-Mini-Uncensored-APEX-I-Compact.gguf | 14,10 GB | GPUs de consumo, con imatrix |
| Inkling-2-Mini-Uncensored-APEX-I-Mini.gguf | 12,36 GB | pequeno, solo imatrix |
| Inkling-2-Mini-Uncensored-APEX-I-Nano.gguf | 11,34 GB | el mas pequeno, solo imatrix |
| mmproj-Inkling-2-Mini-Uncensored-F16.gguf | 0,64 GB (639.348.992 bytes) | proyector de vision, F16 |
| dspark-Inkling-2-Mini-Q8_0.gguf | 0,40 GB (402.278.560 bytes) | drafter de decodificacion especulativa, Q8_0 |
| imatrix.gguf | 90.752.032 bytes | matriz de importancia |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE): la mayor parte del peso esta en expertos enrutados de los que solo se activan unos pocos por token, mientras que las capas de atencion y las primeras y ultimas capas concentran el resto. La variante Uncensored es una build abliterated de OpenUncensored sobre Inkling-2-Mini de thinkingmachines; segun su model card, se ablacionaron direcciones de rechazo en las proyecciones de salida de atencion de 20 capas, dejando sin cambios los expertos, el codificador de vision y el especulador DSpark, y manteniendo el tokenizer y la configuracion del modelo upstream.

La innovacion tecnica de esta publicacion no esta en el entrenamiento sino en la cuantizacion. APEX (Adaptive Precision for EXpert Models) asigna precision por rol de tensor y posicion de capa: los expertos enrutados, que dominan el recuento de pesos pero se activan de forma dispersa, toleran menor precision; las primeras y ultimas capas conservan mas bits y las capas intermedias se comprimen mas, con la atencion siguiendo el mismo gradiente. Los ficheros con prefijo `I-` usan una importance matrix calculada sobre los propios pesos BF16 de este modelo (no reutilizada del base) con datos de calibracion diversos: chat, codigo, razonamiento, tool-calling, trazas agenticas y Wikipedia. El autor advierte que los niveles Quality y Balanced no ocupan menos que el checkpoint fuente, porque retienen mas bits por peso; estan pensados para quien quiere un GGUF estandar en formato k-quant, no para ahorrar espacio.

El modelo incorpora ademas un proyector de vision y un drafter de decodificacion especulativa. El proyector se convirtio del checkpoint de OpenUncensored con `convert_hf_to_gguf.py --mmproj` y sus 422 tensores son identicos byte a byte a los del checkpoint upstream de Inkling-2-Mini (solo cambian metadatos de nombre, licencia y tags). El drafter no lo convirtio el autor: es una copia del `dspark-Inkling-2-Mini-Q8_0.gguf` de unsloth/Inkling-2-Mini-GGUF, y se apoya en que el `mtp.safetensors` de OpenUncensored es identico byte a byte al upstream (SHA-256 `7c3b651317f01f73bcf4e1dceba66ef8b7e1a1eac6bc171e882e690a4b10a1d2`). El drafter se entreno contra el modelo upstream, no contra esta variante modificada.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el tag `conversational` del repo.
- Razonamiento de proposito general: el modelo base Inkling-2-Mini esta orientado a tareas de razonamiento, aunque la model card no aporta detalles ni resultados.
- Entrada multimodal de imagen: se habilita cargando el sidecar `mmproj-Inkling-2-Mini-Uncensored-F16.gguf`; el autor verifico un prompt de imagen durante la validacion.
- Decodificacion especulativa: soportada via `--spec-type draft-dspark` con el sidecar DSpark en Q8_0, que acelera la generacion sin cambiar la distribucion objetivo.
- Tool calling y trazas agenticas: aparecen en la composicion de los datos de calibracion de la imatrix (chat, codigo, razonamiento, tool-calling, trazas agenticas), lo que sugiere que el modelo upstream fue entrenado con ese tipo de datos; no se documenta el soporte concreto de function calling.
- Multilingue: no disponible; la model card no enumera idiomas.
- Comportamiento sin rechazo: la ablacion de direcciones de rechazo hace que el modelo atienda peticiones que el upstream rechazaria. El autor no ha probado el comportamiento de rechazo de esta build.

## Casos de uso

- Despliegue local en estacion de trabajo con llama.cpp u Ollama: el nivel Compact (14,10 GB) o Mini (12,36 GB) permite ejecutar un MoE de 26 B en una GPU de consumo con 16-24 GB de VRAM, manteniendo el formato GGUF estandar.
- Inferencia en DGX Spark o nodos con memoria unificada: el autor indica que su DGX Spark (122 GB) es suficiente para MoEs de la clase 30-50 B, por lo que cualquiera de los niveles Quality o Balanced cabe con holgura y deja espacio para el proyector de vision y el drafter.
- Aceleracion de generacion en produccion: cargando el drafter DSpark Q8_0 con `--spec-type draft-dspark` se obtiene decodificacion especulativa, util en servicios de chat de baja latencia donde cada token cuenta.
- Asistente multimodal en local: con el proyector F16 se puede procesar una imagen junto a una pregunta de texto (por ejemplo, describir una captura de pantalla o extraer informacion de un diagrama) sin enviar datos a la nube.
- Investigacion sobre abliteration y seguridad: el modelo permite estudiar como se comporta una ablacion de direcciones de rechazo en un MoE de 26 B con vision, comparando con el upstream Inkling-2-Mini y con el checkpoint BF16 de OpenUncensored.
- Generacion de codigo y razonamiento en pipelines internos: los datos de calibracion de la imatrix incluyen codigo y trazas agenticas, y el formato GGUF se integra con LocalAI, lo que facilita montar un endpoint compatible con la API de OpenAI en infraestructura propia.
- Fine-tuning y experimentacion con cuantizacion: la imatrix publicada (90,7 MB) y los ficheros con y sin imatrix permiten reproducir y comparar el efecto de la matriz de importancia en un MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explicitamente que no se ha ejecutado perplexity, KL ni ningun benchmark, y que la validacion se limita a comprobar que cada nivel carga y produce texto coherente con un prompt corto, un prompt de imagen y una ejecucion del drafter. Tampoco hay datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 11,34 GB (Nano) y 20,68 GB (Balanced) solo para los pesos; hay que sumar la cache KV, cuyo tamano depende de la longitud de contexto y que no se documenta. El proyector de vision anade 0,64 GB y el drafter 0,40 GB.
- GPUs recomendadas: el autor cita H100, H200 y Blackwell para cuantizar modelos de 200 B o mas, pero para este modelo de 26 B cualquiera de los niveles cabe en GPUs de 24 GB o mas. Una RTX 4090 (24 GB) puede alojar Compact, Mini o Nano con margen para cache; Quality y Balanced (20+ GB) quedan muy justos y probablemente requieran offload parcial.
- GPUs de consumo: si, en RTX 3090/4090 (24 GB) con los niveles Compact, Mini o Nano; en GPUs de 16 GB solo cabria Nano con contexto corto y cuantizacion agresiva de la cache.
- Opciones de despliegue: llama.cpp (formato nativo), LocalAI (el autor es su mantenedor), Ollama y cualquier runtime que consuma GGUF. El drafter requiere soporte de `--spec-type draft-dspark`; el autor senala que el conversor del drafter no esta en llama.cpp master.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-Uncensored-APEX (esta ficha) | ~26,07 B (MoE) | no disponible | GGUF, con vision y drafter | Apache 2.0 | Sin benchmarks; preview no evaluada |
| thinkingmachines/Inkling-2-Mini (upstream) | no disponible | no disponible | safetensors | no disponible | Modelo original sin abliteration |
| OpenUncensored/Inkling-2-Mini-Uncensored | ~26,07 B (MoE) | no disponible | safetensors (4 y 8 bits float, ~19,5 GB) | no disponible | Abliterated en 20 capas; sin cuantizacion GGUF |
| unsloth/Inkling-2-Mini-GGUF | no disponible | no disponible | GGUF | Apache 2.0 | Origen del drafter DSpark Q8_0 reutilizado |

No hay datos de rendimiento comparativo porque ninguno de estos modelos publica benchmarks en la informacion disponible.

## Limitaciones y advertencias

- Preview no evaluada: no hay perplexity, KL ni benchmarks; el autor no garantiza calidad ni comportamiento.
- Comportamiento de rechazo no probado: la ablacion de direcciones de rechazo esta declarada por OpenUncensored, pero el cuantizador no ha verificado que el modelo deje de rechazar peticiones ni como lo hace.
- Responsabilidad de uso: al ser un modelo sin rechazo, el usuario asume la responsabilidad legal y etica de las salidas.
- Sesgos: no documentados; al no haber evaluacion, no se pueden descartar sesgos heredados del upstream.
- Riesgo de alucinacion: no cuantificado; sin benchmarks de veracidad no hay base para estimarlo.
- Idiomas y contexto: no se especifican en la model card, lo que impide planificar despliegues multilingues o de contexto largo con garantias.
- Fidelidad de la abliteration: el cuantizador solo verifico que `mtp.safetensors` y el proyector de vision coinciden con el upstream; no comparo el resto de pesos con el modelo original.
- Drafter entrenado contra el upstream: el DSpark se entreno para el modelo sin modificar, por lo que su eficacia con esta variante abliterated no esta medida.
- Niveles Quality y Balanced no ahorran espacio: ocupan mas que el checkpoint fuente (~19,5 GB) porque retienen mas bits por peso; no sirven para reducir huella.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar la licencia del modelo base thinkingmachines/Inkling-2-Mini y del checkpoint de OpenUncensored, que la model card no detalla.
- Repo de 135,2 GB: descargar el conjunto completo exige planificar el almacenamiento; conviene bajar solo el nivel y los sidecars necesarios.

## Enlaces

- Hugging Face (esta publicacion): https://huggingface.co/mudler/Inkling-2-Mini-Uncensored-APEX-GGUF
- Modelo base: https://huggingface.co/OpenUncensored/Inkling-2-Mini-Uncensored
- Modelo upstream: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF de unsloth (origen del drafter): https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Proyecto APEX: https://github.com/localai-org/apex-quant
- LocalAI: https://github.com/mudler/LocalAI
- Patreon del autor: https://www.patreon.com/cw/mudler
- Buy Me a Coffee: https://www.buymeacoffee.com/mudler
- GitHub Sponsors: https://github.com/sponsors/mudler

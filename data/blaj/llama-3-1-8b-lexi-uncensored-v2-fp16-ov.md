# blaj/Llama-3.1-8B-Lexi-Uncensored-V2-fp16-ov

## Resumen

Este repositorio contiene una conversion a OpenVINO IR en precision FP16 del modelo Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2, un ajuste fino sin censura (etiquetado por el autor como "uncensored" y "abliterated") construido sobre Meta Llama 3.1 8B. El publicador es el usuario de HuggingFace blaj, que mantiene tambien builds hermanas en int8 e int4. No se trata por tanto de un modelo nuevo entrenado desde cero, sino de un artefacto de despliegue: el interes esta en que empaqueta un LLM de 8.000 millones de parametros en el formato nativo del runtime de Intel para ejecutarlo en CPU, iGPU Arc y aceleradores Intel sin necesidad de CUDA.

El problema que resuelve es el de la inferencia local en hardware Intel. OpenVINO IR con estado interno (`beam_idx` expuesto) y pesos FP16 permite servir el modelo con OpenVINO Model Server (OVMS) sobre GPU integrada, algo relevante en portatiles con Core Ultra y en equipos de borde donde no hay GPU dedicada. El precio a pagar es el rendimiento: al estar limitado por ancho de banda de memoria, la variante FP16 rinde unas 4 veces menos tokens por segundo que la version int4 del mismo autor.

Arquitectonicamente es un transformer decoder-only estandar de la familia Llama 3.1: 32 capas, dimension oculta 4096 y vocabulario de 128.256 tokens. El contexto heredado del modelo base es amplio, aunque conviene verificar la configuracion efectiva del IR antes de desplegarlo. La licencia es la Llama 3.1 Community License, que permite uso comercial con condiciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `LlamaForCausalLM` (transformer decoder-only denso), 32 capas, hidden size 4096, vocab 128256 |
| Parametros totales | Aproximadamente 8.030 millones (8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No confirmada en la informacion del repositorio; el modelo base Llama 3.1 8B soporta hasta 128.000 tokens y una ficha de terceros cita 32.768 tokens para este ajuste (ver "Limitaciones y advertencias") |
| Tipos de cuantizacion | FP16 sin cuantizar (este repositorio); variantes hermanas int8 e int4 publicadas por el mismo autor |
| Idiomas soportados | No disponibles en la ficha del repositorio. El modelo base Llama 3.1 declara soporte oficial para ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes |
| Licencia | Llama 3.1 Community License Agreement |
| Formato de pesos | OpenVINO IR (`.xml` + `.bin`), con estado interno y `beam_idx` expuesto; requiere ademas un `graph.pbtxt` en el directorio del modelo |
| Modelo base | Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2 |
| Tamano del repositorio | 16,1 GB en HuggingFace (el autor indica 15 GB para el IR) |
| Libreria declarada | `openvino` |
| Pipeline | `text-generation` |
| Tags | openvino, llama, uncensored, abliterated, intel, arc, conversational |

## Arquitectura y entrenamiento

No se describe ningun entrenamiento en este repositorio: es exclusivamente una conversion de formato. El pipeline de conversion documentado por el autor parte de los safetensors en BF16 originales (4 shards) y aplica dos etapas: primero una exportacion con `optimum-cli export openvino --task text-generation-with-past --weight-format fp16` (con transformers 5.5.0 y optimum-intel 2.2.0), y despues, para las variantes cuantizadas, `nncf.compress_weights` sobre el IR ya generado. El autor senala explicitamente que un export int4 de una sola pasada provoca OOM en una maquina con 30 GB de RAM para este tamano de modelo, de ahi la conversion en dos etapas.

El modelo de partida, Lexi-Uncensored-V2, es un ajuste fino del Llama-3.1-8B-Instruct de Meta orientado a eliminar el comportamiento de rechazo ante peticiones que el modelo alineado declinaria; el etiquetado "abliterated" apunta a tecnicas de supresion de direcciones de rechazo en el espacio de activaciones, si bien la model card del repositorio no aporta detalle sobre el dataset, el numero de tokens de entrenamiento ni la metodologia de alineacion (RLHF/DPO) empleada. Tampoco se documentan innovaciones de decodificacion especulativa ni atencion lineal: se trata de atencion estandar con cache KV persistente, explotada por el modo `text-generation-with-past` del IR.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Llama-3.1-8B-Instruct.
- Razonamiento basico e intermedio y resolucion de problemas de logica sencillos, propio de un modelo de 8B.
- Generacion y explicacion de codigo en lenguajes mayoritarios, sin garantias de calidad comparables a modelos especializados en codigo.
- Matematicas elementales y de varios pasos, con propension a errores en calculo aritmetico largo.
- Instrucciones sin filtrado: el modelo responde a peticiones que un modelo alineado rechazaria, incluidas las eticas o legalmente problematicas.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible para este ajuste concreto; el modelo base Llama 3.1 8B si lo soporta de forma nativa.
- Uso en agentes y razonamiento multi-paso: no confirmado en la documentacion del repositorio.
- Capacidades multilingues: no documentadas para este ajuste; el modelo base declara 8 idiomas.
- Capacidades especiales: no se documenta modo "thinking", vision ni audio. Algunas fichas de terceros describen erroneamente el modelo como multimodal (ver "Limitaciones y advertencias").
- Inferencia con estado interno: el IR expone `beam_idx`, lo que permite reutilizar el estado entre peticiones en OVMS.

## Casos de uso

- Despliegue local en portatiles con Intel Core Ultra: el build FP16 esta pensado para ejecutarse sobre la iGPU Arc integrada mediante OVMS, lo que permite tener un asistente de texto sin GPU dedicada ni envio de datos a la nube.
- Inferencia en el borde con aceleradores Intel: en entornos industriales o de retail donde solo hay hardware Intel (CPU Xeon o GPU Arc), el IR evita depender de CUDA y se integra directamente en el runtime OpenVINO.
- Investigacion sobre alineacion y filtrado de contenido: al ser un ajuste sin censura, sirve como caso de estudio para medir diferencias de comportamiento frente a Llama-3.1-8B-Instruct en conjuntos de prompts adversarios.
- Generacion de contenido creativo sin restricciones tematicas: narrativa de ficcion con violencia, temas adultos o tramas moralmente ambiguas, donde los rechazos del modelo alineado resultan disruptivos.
- Experimentacion con decodificacion y rendimiento: el repositorio publica mediciones de tok/s para las tres cuantizaciones en el mismo hardware, lo que lo convierte en un banco de pruebas util para evaluar el compromiso precision/velocidad en iGPU.
- Base para ajuste adicional (LoRA/fine-tuning): al ser un modelo de 8B sin censura, es un punto de partida frecuente para adaptaciones de dominio que requieren respuestas no evasivas.
- Simulacion de personajes y juegos de rol: la ausencia de rechazos y la ventana de contexto amplia del modelo base facilitan mantener personajes coherentes en sesiones largas.

## Benchmarks y rendimiento

El autor publica un unico benchmark de throughput, no de calidad. Medicion en single-stream sobre Intel Core Ultra 7 258V (iGPU Arc 130V/140V), 30 GB de RAM, OpenVINO Model Server 2026.4.0 sobre GPU, decodificacion greedy, 128 tokens nuevos como maximo, media de 3 ejecuciones tras el calentamiento:

| Build | tok/s | Relativo vs int4 |
|---|---|---|
| int4 | 23,5 | 1,00x |
| int8 | 11,3 | 0,48x |
| fp16 (este build) | 6,0 | 0,26x |

El autor explica que la decodificacion en esta iGPU esta limitada por ancho de banda de memoria, por lo que el throughput escala casi exactamente con el tamano del modelo. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (cifras derivadas del tamano declarado de los pesos, no publicadas por el autor): aproximadamente 16 GB en FP16, unos 8,5 GB en int8 y unos 4,5-5 GB en int4, mas overhead de cache KV y del runtime.
- Hardware objetivo declarado: Intel Core Ultra 7 258V con iGPU Arc 130V/140V y 30 GB de RAM; el autor usa `target_device: GPU` en OVMS.
- GPU compatibles: GPUs integradas Intel Arc, GPUs discretas Intel Arc y, en general, cualquier dispositivo soportado por OpenVINO (CPU Intel, NPU Intel, GPU Intel). No se documenta soporte para CUDA ni ROCm en este repositorio.
- Cabe en GPU de consumo: si, en el sentido de que la variante int4 puede ejecutarse en una iGPU Arc con memoria compartida del sistema; las variantes FP16 e int8 exigen bastante memoria unificada. No esta previsto para GPUs de consumo NVIDIA dentro de este formato.
- Opciones de despliegue: OpenVINO Model Server (OVMS) con un `ovms_config.json` y un `graph.pbtxt` copiado de cualquier modelo LLM de OVMS; tambien puede consumirse desde aplicaciones Python con OpenVINO / OpenVINO GenAI. Para vLLM, llama.cpp, Ollama o TGI habria que recurrir a otros formatos (por ejemplo, los GGUF publicados por terceros a partir del modelo base), no a este IR.
- Configuracion de serving sugerida por el autor: `nireq: 8`, `PERFORMANCE_HINT: THROUGHPUT`, `NUM_STREAMS: 2`.
- Latencia y throughput: 6,0 tok/s en FP16, 11,3 tok/s en int8 y 23,5 tok/s en int4 sobre el hardware de referencia (single-stream, 128 tokens nuevos). No se publican mediciones con batching ni en otros equipos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| blaj/Llama-3.1-8B-Lexi-Uncensored-V2-fp16-ov (este) | 8B (denso) | No confirmado en el repo | OpenVINO IR FP16, OVMS | Llama 3.1 Community | Enfocado a hardware Intel |
| blaj/Llama-3.1-8B-Lexi-Uncensored-V2-int4-ov / int8-ov | 8B (denso) | No confirmado en el repo | OpenVINO IR int4 / int8, OVMS | Llama 3.1 Community | Mismo modelo, 3,9x mas rapido en int4 a 23,5 tok/s frente a 6,0 tok/s del FP16 |
| meta-llama/Llama-3.1-8B-Instruct | 8B (denso) | 128.000 tokens | Safetensors, integrable en vLLM, TGI, llama.cpp | Llama 3.1 Community | Alternativa alineada; rechaza peticiones que Lexi acepta |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,2B (denso) | 32.000 tokens | Safetensors, amplio soporte de runtimes | Apache 2.0 | Licencia mas permisiva y contexto mas corto |
| Qwen/Qwen2.5-7B-Instruct | 7,6B (denso) | 128.000 tokens | Safetensors, amplio soporte de runtimes | Apache 2.0 | Buen rendimiento en codigo y matematicas; licencia permisiva |

No hay datos de benchmarks de calidad publicados en la informacion disponible que permitan comparar el rendimiento de este ajuste frente a las alternativas listadas; la comparacion se limita a parametros, contexto, formato y licencia.

## Limitaciones y advertencias

- Modelo sin censura: el autor advierte que las salidas no estan filtradas. Es imprescindible implementar una capa de alineacion propia antes de exponerlo como servicio, tal como recomienda tambien la documentacion del modelo base.
- Contenido potencialmente danino: los listados de terceros indican que el modelo se muestra "altamente complaciente" con cualquier peticion, incluidas las no eticas. Riesgo reputacional, legal y de cumplimiento en produccion.
- Alucinacion: al ser un ajuste de un modelo de 8B sin datos de evaluacion publicados, la propension a inventar hechos no esta cuantificada. No hay benchmarks que la midan.
- Contexto no confirmado: la ficha del repositorio no especifica la longitud de contexto efectiva del IR y una fuente de terceros cita 32.768 tokens, mientras que el modelo base soporta 128.000. Hay que verificar el valor real en la configuracion exportada antes de disenar aplicaciones de contexto largo.
- Idiomas no documentados: la ficha no declara idiomas soportados para este ajuste; el comportamiento fuera del ingles y de los idiomas oficiales de Llama 3.1 no esta evaluado.
- Discrepancia en fuentes de terceros: al menos un listado publico describe el modelo como capaz de "leer imagenes junto al texto". Esto es incorrecto segun la informacion del repositorio, que describe un modelo puramente de generacion de texto basado en `LlamaForCausalLM`.
- Restricciones de licencia: la Llama 3.1 Community License permite uso comercial con condiciones (entre otras, atribucion "Built with Llama", denominacion de productos derivados y el umbral de 700 millones de usuarios activos mensuales para licencias adicionales). No es una licencia Apache 2.0 ni MIT.
- Atribucion obligatoria: cualquier redistribucion debe conservar la atribucion al modelo base de Orenguteng y a Meta, ademas de la licencia Llama 3.1.
- Especificidad de plataforma: el IR solo es util dentro del ecosistema OpenVINO. Migrar a otro runtime exige reconvertir desde los pesos originales o partir de otros formatos.
- Requisito de `graph.pbtxt`: el repositorio solo contiene el IR; el despliegue en OVMS falla si no se anade manualmente ese fichero desde otro modelo LLM compatible de OVMS.
- Rendimiento modesto en FP16: 6,0 tok/s en el hardware de referencia limita su uso interactivo; para tiempo real conviene la variante int4.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace (FP16): https://huggingface.co/blaj/Llama-3.1-8B-Lexi-Uncensored-V2-fp16-ov
- Build hermana int4: https://huggingface.co/blaj/Llama-3.1-8B-Lexi-Uncensored-V2-int4-ov
- Build hermana int8: https://huggingface.co/blaj/Llama-3.1-8B-Lexi-Uncensored-V2-int8-ov
- Modelo base: https://huggingface.co/Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2
- Version GGUF del modelo base (terceros): https://secretai.io/models/Orenguteng/Llama-3.1-8B-Lexi-Uncensored-V2-GGUF
- Ficha de terceros en Featherless: https://featherless.ai/models/Greytechai/Llama-3.1-8B-Lexi-Uncensored-V2
- Ficha de terceros con datos de VRAM: https://www.aquanode.io/models/llama-3-1-8b-lexi-uncensored-v2
- Licencia Llama 3.1 Community: https://www.llama.com/llama3_1/license/
- Herramientas de conversion: `optimum-intel` (https://github.com/huggingface/optimum-intel), NNCF (https://github.com/openvinotoolkit/nncf) y OpenVINO Model Server (https://github.com/openvinotoolkit/model_server)

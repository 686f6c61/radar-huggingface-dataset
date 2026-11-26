# kayceesamuel/Qwen3.8-27B-NF4DQ

## Resumen

Qwen3.8-27B-NF4DQ es una cuantizacion del modelo base Qwen/Qwen3.8-27B realizada por el usuario kayceesamuel (runciu) mediante un nuevo tipo de bloque ggml denominado NF4DQ. No se trata de una receta construida a partir de tipos existentes, sino de un formato propio que combina indices NF4 de 4 bits con una segunda etapa de cuantizacion de escalas: cada sub-bloque de 32 pesos almacena su escala como un indice de 4 bits en un codebook fijo, en lugar de un valor fp16. El resultado son 4,1562 bits por peso y un fichero de 13,23 GiB.

El modelo resuelve un problema concreto de despliegue: acercarse a la calidad de Q4_K_M con un tamano inferior a Q3_K_M, liberando VRAM en tarjetas de 24 GB. Con 27.320.697.856 parametros totales, el peso completo en BF16 ocupa 50,9 GiB, mientras que esta cuantizacion cabe holgadamente en una NVIDIA L4 de 23 GB o en un Mac con 24 GB de memoria unificada. La relevancia actual esta en que permite ejecutar un modelo de 27B en hardware de gama consumer-profesional con una perdida de perplejidad muy contenida.

La contrapartida principal es la compatibilidad: NF4DQ es el tipo ggml 43 y no lo reconoce ninguna build upstream de llama.cpp, Ollama ni LM Studio. Es necesario usar la aplicacion CIU o compilar el fork `runciu/llama.cpp` en la rama `nf4dq`. El modelo se distribuye bajo licencia Apache 2.0, igual que el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.8-27B; cuantizacion GGUF tipo ggml 43) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; los ejemplos de despliegue usan `-c 8192` y `-c 4096` |
| Tipos de cuantizacion | NF4DQ (4,1562 bits por peso; 1024 pesos en 532 bytes) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tipo ggml 43, requiere fork `nf4dq` de llama.cpp o CIU) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del transformer subyacente ni sobre el proceso de entrenamiento del modelo base Qwen/Qwen3.8-27B en la informacion proporcionada. La model card solo documenta el proceso de cuantizacion.

La innovacion tecnica documentada es el formato NF4DQ. Empaqueta 1024 pesos en 532 bytes con tres componentes: indices NF4 de 4 bits que apuntan a un codebook int8, un indice de escala de 4 bits por cada sub-bloque de 32 pesos y una super-escala fp16 por bloque. La segunda etapa de cuantizacion de escalas es lo que permite bajar de los 4,50 bits por peso de Q4_K. El autor indica que las notas de diseno, los datos de ajuste de cada constante y los enfoques medidos y descartados estan en el documento de diseno del fork. La cuantizacion no genera una obra nueva segun el autor, por lo que mantiene la licencia Apache 2.0 del modelo base. No se documentan fases de RLHF, DPO ni composicion del dataset.

## Capacidades

- Generacion de texto conversacional: la pipeline declarada es `text-generation` y el tag `conversational` aparece en los metadatos del repositorio.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere integracion con APIs compatibles con OpenAI a traves de CIU, que sirve en `127.0.0.1:8674`.
- Decodificacion multi-token: el fork soporta decodificacion especulativa con `--spec-type draft-mtp --spec-draft-n-max 4`, que eleva el decode de 16,84 a 30,13 t/s en una L4.
- Ejecucion local con backend CUDA y Metal en el fork; no hay backend Vulkan.
- Capacidades de razonamiento, codigo, matematicas, vision, tool calling, function calling, agentes o multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue en estaciones de trabajo con GPU de 24 GB: el modelo completo ocupa unos 16,9 GB a 8k de contexto en una L4 de 23 GB, dejando margen para el cache KV y otros procesos. Es el escenario principal que justifica la cuantizacion frente a Q4_K_M, que deja mucho menos espacio libre.
- Inferencia local en Mac con memoria unificada: CIU detecta la memoria disponible, descarga el motor adecuado y sirve una API compatible con OpenAI en `127.0.0.1:8674`, de modo que herramientas existentes pueden apuntar al endpoint sin cambios de codigo. Requiere 24 GB o mas de memoria unificada.
- Sustitucion de Q4_K_M en pipelines existentes con llama.cpp: el fork `nf4dq` expone `llama-server` con la misma interfaz, por lo que se puede cambiar el fichero GGUF y mantener el resto del stack, obteniendo un 25% mas de velocidad en decode (60,81 frente a 48,67 t/s en A100) a costa de menor prefill.
- Prototipado en Google Colab con GPU A100 o L4: la model card incluye un flujo completo de compilacion del fork y descarga del GGUF desde Hugging Face para pruebas puntuales sin infraestructura propia. Una T4 no es suficiente para este modelo.
- Generacion de texto por lotes con temperatura cero: el ejemplo oficial usa `llama-completion` con `--temp 0 -no-cnv`, adecuado para tareas deterministas de resumen o explicacion donde no se necesita el modo conversacional.
- Evaluacion comparativa de tecnicas de cuantizacion: el modelo sirve como referencia practica para medir la curva tamano-calidad de NF4DQ frente a K-quants en wikitext-2, con un binario y un conjunto de test identicos.

## Benchmarks y rendimiento

Perplejidad en wikitext-2 a contexto 512, A100-80GB, fichero de test completo, mismos pesos de origen y mismo binario:

| Build | Tamano | PPL @512 |
|---|---|---|
| BF16 | 50,9 GiB | 6,9530 |
| Q4_K_M | 15,652 GiB | 6,9787 |
| NF4DQ | 13,230 GiB | 7,0890 |
| Q3_K_M | 12,643 GiB | 7,3362 |

Segun el autor, interpolando en la curva tamano-calidad de K-quants de llama.cpp, un K-quant a 4,16 bpw quedaria cerca de 7,29; NF4DQ mide 7,089.

Throughput frente a Q4_K_M, misma A100, misma ejecucion de `llama-bench`:

| Build | Tamano | Prefill | Decode |
|---|---|---|---|
| NF4DQ | 13,23 GiB | 734,52 t/s | 60,81 t/s |
| Q4_K_M | 17,66 GiB | 1300,04 t/s | 48,67 t/s |

En una NVIDIA L4 de 23 GB, el modelo completo ocupa unos 16,9 GB a 8k de contexto y alcanza 16,84 t/s en decode, o 30,13 t/s con decodificacion multi-token. El prefill de NF4DQ es mas lento porque el fork aun no tiene un cargador de tiles NF4DQ en `mmq.cu`. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 16,9 GB para el modelo completo a 8k de contexto en una L4, segun la medicion del autor. El fichero pesa 13,23 GiB.
- GPU recomendadas: NVIDIA A100-80GB (referencia de las mediciones), NVIDIA L4 de 23 GB. El autor indica que el modelo quiere una tarjeta NVIDIA de 24 GB o un Mac con 24 GB o mas de memoria unificada.
- GPU consumer: cabe en tarjetas de 24 GB como la RTX 4090, aunque no se aportan mediciones especificas para ese modelo. Una T4 no es suficiente.
- Opciones de despliegue: CIU (aplicacion local con API compatible con OpenAI en `127.0.0.1:8674`, disponible para macOS Apple Silicon y Windows 10/11 x64), o compilacion manual del fork `runciu/llama.cpp` rama `nf4dq` con `llama-server`. Backends CUDA y Metal; sin Vulkan. No funciona en llama.cpp stock, Ollama ni LM Studio.
- Nota de configuracion: `-np 1` es obligatorio en `llama-server`, ya que por defecto usa 4 slots y `-c` se aplica por slot, por lo que pedir 8k sin `-np 1` reserva 32k tokens de cache.
- Latencia y throughput: 60,81 t/s de decode y 734,52 t/s de prefill en A100-80GB; 16,84 t/s de decode (30,13 t/s con MTP) en L4.
- Plataformas no soportadas por CIU: Intel Mac y Linux.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano | PPL wikitext-2 @512 | Decode (A100) | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B-NF4DQ | 27,32B | 13,23 GiB | 7,0890 | 60,81 t/s | Apache 2.0 |
| Qwen3.8-27B Q4_K_M | 27,32B | 15,652 GiB | 6,9787 | 48,67 t/s | Apache 2.0 |
| Qwen3.8-27B Q3_K_M | 27,32B | 12,643 GiB | 7,3362 | no disponible | Apache 2.0 |
| Qwen3.8-27B BF16 | 27,32B | 50,9 GiB | 6,9530 | no disponible | Apache 2.0 |

Como alternativa de menor tamano, el autor referencia `kayceesamuel/Qwen3.5-9B-NF4DQ`, que cabe en una T4. No se dispone de datos de benchmarks de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Incompatibilidad con herramientas estandar: el fichero no carga en llama.cpp stock, Ollama ni LM Studio. Descargarlo sin CIU ni el fork produce un fichero de 13,23 GiB que ninguna herramienta abre.
- Riesgo de colision de tipo: el tipo 43 es el siguiente hueco libre en upstream. Si upstream lo reclama, una build estandar leera estos ficheros como ese tipo y decodificara basura en lugar de rechazar la carga. Ante salidas incorrectas, hay que verificar primero que binario se esta ejecutando.
- Prefill degradado: 734,52 t/s frente a 1300,04 t/s de Q4_K_M, por la ausencia de cargador de tiles NF4DQ en `mmq.cu`. Afecta a cargas de contexto largo y a cargas de trabajo con prompts extensos.
- Perdida de calidad medible: PPL de 7,0890 frente a 6,9787 de Q4_K_M y 6,9530 de BF16. Es una degradacion pequena pero real.
- Cobertura de plataformas limitada: CIU no soporta Intel Mac ni Linux; el fork no tiene backend Vulkan.
- Builds de CIU sin firma de codigo: el primer arranque requiere un paso adicional documentado en `FIRST-RUN.txt`.
- Sesgos, riesgo de alucinacion y limitaciones de idioma del modelo base: no disponibles en la informacion proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor sostiene que la cuantizacion no crea una obra nueva; conviene verificar la cadena de licencias del modelo base antes de un despliegue en produccion.
- Madurez: 241 descargas y 0 likes en el momento de la consulta, con un formato de cuantizacion nuevo y un ecosistema de herramientas muy reducido. El propio autor pide que se le informe de los fallos de ejecucion por correo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kayceesamuel/Qwen3.8-27B-NF4DQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo hermano de 9B: https://huggingface.co/kayceesamuel/Qwen3.5-9B-NF4DQ
- Fork de llama.cpp (rama nf4dq): https://github.com/runciu/llama.cpp
- Documento de diseno de NF4DQ: https://github.com/runciu/llama.cpp/blob/nf4dq/docs/nf4dq-design.md
- Releases del fork (binarios de llama-server): https://github.com/runciu/llama.cpp/releases
- Aplicacion CIU: https://github.com/runciu/ciu
- Issues de CIU: https://github.com/runciu/ciu/issues
- Descarga CIU macOS Apple Silicon: https://github.com/runciu/ciu/releases/latest/download/ciu-macos-arm64.zip
- Descarga CIU Windows x64: https://github.com/runciu/ciu/releases/latest/download/ciu-windows-x64.zip
- Contacto del autor: hello@runciu.com

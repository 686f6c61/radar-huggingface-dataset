# FlagRelease/Qwen3-VL-30B-A3B-Instruct-metax-FlagOS-Express

## Resumen

Qwen3-VL-30B-A3B-Instruct-metax-FlagOS-Express es una distribucion empaquetada del modelo multimodal Qwen3-VL-30B-A3B-Instruct de Alibaba, publicada por FlagRelease sobre su pila de software FlagOS. El modelo base es un transformer de tipo Mixture-of-Experts (MoE) con unos 31.070 millones de parametros totales y aproximadamente 3.000 millones activos por token, lo que permite una inferencia mucho mas economica que un modelo denso de tamano equivalente. Esta orientado a tareas de vision-lenguaje: captioning de imagenes, VQA, comprension de documentos y graficos, OCR y grounding visual, con soporte de entradas de alta resolucion y multiples imagenes.

La relevancia de esta publicacion concreta no esta en el modelo en si, sino en el empaquetado: FlagRelease proporciona una imagen Docker con vLLM 0.24.0, el plugin vllm-plugin-fl y la libreria de operadores FlagGems, preconfigurada para GPUs MetaX C550 con el stack MACA 3.7.0.38. El objetivo declarado es el despliegue "out-of-the-box" en aceleradores no NVIDIA, reduciendo el trabajo de portabilidad. La model card incluye scripts de arranque del servidor de inferencia y ejemplos de invocacion por API compatible con OpenAI.

El repositorio pesa 62,1 GB en safetensors y se publica bajo licencia Apache 2.0. Los idiomas declarados son chino e ingles. No se han publicado resultados de benchmarks del modelo base en la informacion disponible; la model card solo incluye dos metricas del despliegue FlagOS (GPQA y ERQA), sin comparacion con otras variantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (qwen3_vl_moe), multimodal vision-lenguaje |
| Parametros totales | 31.070.754.032 (~31,07 B) |
| Parametros activos | ~3 B por token (segun model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el despliegue de referencia usa bfloat16) |
| Idiomas soportados | zh, en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 62,1 GB |
| Hardware de referencia | MetaX C550 x2 (2 GPU, tensor-parallel-size 2) |
| Stack de despliegue | vLLM 0.24.0 + vllm-plugin-fl + FlagGems, MACA 3.7.0.38, Ubuntu 22.04.5, driver MetaX 3.8.1 |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE multimodal de la familia Qwen3-VL, con unos 31 B de parametros totales y ~3 B activos por token. La model card no detalla la composicion del dataset de entrenamiento, el numero de tokens vistos, ni si se aplicaron etapas de RLHF o DPO; solo indica que es un modelo instruction-tuned. Tampoco se especifican innovaciones de atencion, estrategias de decodificacion especulativa ni detalles del encoder visual.

La aportacion tecnica de esta publicacion es el stack FlagOS: FlagScale (framework distribuido de entrenamiento e inferencia), FlagGems (libreria de operadores genericos implementados en Triton, con kernels backend-neutral), FlagCX (comunicacion) y FlagTree (compilador unificado). El objetivo es un flujo "develop once, run anywhere" sobre aceleradores heterogeneos. El despliegue de referencia lanza vLLM con `--dtype bfloat16`, `--tensor-parallel-size 2`, `--max-num-batched-tokens 8192`, `--max-num-seqs 64`, `--gpu-memory-utilization 0.91`, prefix caching activado y captura de CUDA graphs en modo `FULL_AND_PIECEWISE` con tamano maximo 64.

## Capacidades

- Generacion de texto y razonamiento en chino e ingles.
- Comprension de imagenes: captioning, respuesta a preguntas visuales (VQA) y grounding visual.
- Comprension de documentos y graficos, incluyendo OCR.
- Soporte de entradas de alta resolucion y de multiples imagenes en una misma peticion.
- Razonamiento sobre contexto largo (segun la model card, sin cifra concreta publicada).
- Comprension multilingue (declarada de forma generica; los idiomas listados son zh y en).
- Servicio mediante API compatible con OpenAI (`/v1/chat/completions`), con contenido multimodal en formato `image_url` con base64.
- Integracion con clientes de terceros tipo AnythingLLM.
- Soporte de tool calling y de flujos agenticos: no disponible en la informacion proporcionada.

## Casos de uso

- Digitalizacion de facturas y albaranes: el modelo recibe la imagen del documento y devuelve los campos estructurados en JSON, aprovechando sus capacidades de OCR y comprension de documentos. Adecuado porque combina lectura de texto e interpretacion de layout en una sola pasada.
- Analisis de graficos en informes financieros: se envia la captura del grafico y se pide la extraccion de series, ejes y tendencias. La capacidad de comprension de charts de la familia Qwen3-VL encaja directamente con este flujo.
- Asistente de accesibilidad: descripcion automatica de imagenes para usuarios con discapacidad visual, con soporte de multiples imagenes por conversacion para mantener contexto visual.
- Moderacion de contenido visual: clasificacion y descripcion de imagenes enviadas por usuarios en plataformas UGC, usando el endpoint compatible con OpenAI para integrarlo en un pipeline existente.
- Soporte tecnico con capturas de pantalla: el usuario adjunta una captura de un error y el modelo lo interpreta y propone pasos de resolucion, manteniendo el historial multi-turno.
- Procesamiento batch de catalogo de producto: generacion de descripciones y etiquetas a partir de fotos, con el servidor vLLM configurado con `--max-num-seqs 64` para sostener concurrencia moderada.
- Despliegue en infraestructura no NVIDIA: el caso de uso principal de esta publicacion concreta es ejecutar un VLM de 31 B en GPUs MetaX C550 mediante la imagen FlagOS, sin reescribir el codigo de inferencia.

## Benchmarks y rendimiento

Resultados publicados en la model card para el despliegue FlagOS sobre MetaX:

| Metrica | Qwen3-VL-30B-A3B-Instruct-Metax-FlagOS |
|---|---|
| GPQA | 65,15 |
| ERQA | 46 |

No se han publicado resultados de benchmarks del modelo base (MMLU, HumanEval, GSM8K, MMMU, DocVQA, etc.) en la informacion disponible, ni comparaciones contra el stack nativo. Tampoco hay datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El repo pesa 62,1 GB en safetensors, lo que sugiere pesos en bfloat16 de ~62 GB; con overhead de KV cache y activaciones se necesita mas.
- Configuracion de referencia validada: 2x MetaX C550 con `--tensor-parallel-size 2` y `--gpu-memory-utilization 0.91`.
- GPU NVIDIA: no se documenta soporte en esta publicacion; el stack esta construido sobre MACA, no CUDA. El script exporta `CUDA_VISIBLE_DEVICES` por compatibilidad de la interfaz, pero el backend es MetaX.
- GPU de consumo: no hay evidencia de que quepa en una RTX 4090 (24 GB) en bfloat16. No se documentan cuantizaciones GGUF ni AWQ/GPTQ para esta variante.
- Opciones de despliegue: vLLM 0.24.0 con vllm-plugin-fl dentro de la imagen `harbor.baai.ac.cn/flagrelease-public/qwen3-vl-metax001-...`. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3-VL-30B-A3B-Instruct-metax-FlagOS-Express | ~31 B totales / ~3 B activos | no disponible | Apache 2.0 | Hugging Face (FlagRelease) |
| Qwen3-VL-30B-A3B-Instruct (modelo base) | ~31 B totales / ~3 B activos | no disponible | Apache 2.0 | Hugging Face (Qwen) |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado entre esta variante y el modelo base, ni con otros VLM de tamano similar, en la informacion proporcionada.

## Limitaciones y advertencias

- Solo se declaran los idiomas chino e ingles; el rendimiento en castellano no esta verificado y no deberia asumirse.
- No se han publicado evaluaciones de sesgo, toxicidad o robustez para esta variante.
- Riesgo de alucinacion inherente a los modelos generativos, especialmente en OCR de documentos degradados o graficos de baja resolucion.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3-VL por si el autor original anade terminos adicionales.
- El stack esta atado a hardware MetaX y al SDK MACA 3.7.0.38; no es portable a NVIDIA sin cambios de imagen y backend.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la model card no incluye validacion independiente: tratarlo como publicacion reciente y poco contrastada.
- La validacion de consistencia mencionada en la model card no incluye numeros comparativos publicados frente al stack nativo.
- No hay informacion sobre cuantizaciones, por lo que el despliegue en hardware con menos VRAM no esta soportado de forma documentada.

## Enlaces

- Hugging Face: https://huggingface.co/FlagRelease/Qwen3-VL-30B-A3B-Instruct-metax-FlagOS-Express
- FlagGems (libreria de operadores en Triton): https://github.com/openai/triton
- AnythingLLM: https://anythingllm.com/
- Imagen Docker: `harbor.baai.ac.cn/flagrelease-public/qwen3-vl-metax001-gems5.5.0-tree0.7.0-cxnone-plugin0.2.0-vllm0.24.0-sglangnone-sglangflnone-cp312-pt28-maca37-x64-3.8.1:202611091656`
- Paper, blog o repositorio de FlagOS: no disponible en la informacion proporcionada.

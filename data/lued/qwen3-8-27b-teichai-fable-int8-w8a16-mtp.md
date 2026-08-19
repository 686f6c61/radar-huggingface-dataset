# lued/Qwen3.8-27B-TeichAI-Fable-INT8-W8A16-MTP

## Resumen

Este repositorio contiene una cuantización numérica W8A16 del modelo TeichAI/Qwen3.8-27B-Fable-Distill, un ajuste ligero (destilación) del modelo Qwen3.8-27B de Alibaba, especializado en el conjunto de datos Fable-5. La cuantización, realizada por el autor lued, convierte los pesos de 400 operaciones GEMM (MLP, atención y proyecciones GDN) a INT8 con activaciones en FP16/BF16, manteniendo la torre de visión, la cabeza MTP (Multi-Token Prediction) y las puertas GDN recurrentes en BF16 original. El objetivo es permitir la inferencia eficiente en GPUs Ampere (sm_86) que carecen de soporte nativo para FP8, como las RTX 3090.

El modelo resultante conserva las capacidades multimodales (imagen-texto) del base, con un contexto nativo de 262 000 tokens según la documentación de Qwen3.8-27B, y añade la cabeza MTP para decodificación especulativa. La fidelidad de la cuantización se ha medido con una divergencia KLD media de 0,000660 nats/token y un acuerdo top-1 del 98,50 % frente al teacher BF16, lo que indica una degradación mínima. Con 27 781 427 952 parámetros y un peso de 31,6 GB en el repositorio, es adecuado para despliegues en hardware de consumo con dos GPUs de 24 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (vision-lenguaje) con MTP (Multi-Token Prediction) |
| Parametros totales | 27 781 427 952 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 000 tokens (segun documentacion de Qwen3.8-27B; no confirmado en la model card) |
| Tipos de cuantizacion | W8A16 (pesos INT8, activaciones FP16/BF16), RTN simetrico sin datos, grupo de 128 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (compressed-tensors, pack-quantized) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso multimodal que combina un codificador de vision con un decodificador de lenguaje, e incorpora una cabeza MTP para decodificacion especulativa. Sobre esta base, TeichAI realizo un ajuste ligero (destilacion) utilizando los datasets Fable-5 (`armand0e/claude-fable-5-claude-code`, `armand0e/Fable-5-Chat`) y un corpus privado de datos Fable 5, entrenado con Unsloth y Hugging Face TRL. La cuantizacion W8A16 aplicada en este repositorio es una conversion numerica que solo modifica los pesos de 400 GEMMs (192 de MLP, 64 de atencion completa y 144 de proyecciones GDN densas), preservando en BF16 la torre de vision (333 tensores), las puertas GDN recurrentes (96), `lm_head` y la cabeza MTP (15 tensores, byte-identica a la original de Qwen). El metodo de cuantizacion es RTN simetrico sin datos con grupo de 128, optimizado para el kernel Marlin en vLLM.

## Capacidades

- Generacion de texto, razonamiento, codigo y matematicas, heredadas del modelo base Qwen3.8-27B.
- Procesamiento multimodal de imagen y texto (pipeline `image-text-to-text`), con torre de vision preservada en BF16.
- Decodificacion especulativa mediante la cabeza MTP, que permite acelerar la inferencia en vLLM.
- Control de pensamiento configurable (thinking mode), segun las capacidades del modelo base.
- Soporte para tareas agénticas y razonamiento multi-paso, mencionado en la documentacion de Qwen3.8-27B.
- Capacidades multilingues no especificadas en la informacion disponible.

## Casos de uso

- Inferencia local en hardware de consumo: con la cuantizacion INT8, el modelo cabe en dos GPUs RTX 3090 (24 GB cada una), permitiendo ejecutar un modelo multimodal de 27B en un equipo de escritorio sin necesidad de hardware de centro de datos.
- Asistente de oficina multimodal: procesamiento de documentos que combinan texto e imagenes (capturas, diagramas, formularios escaneados) gracias a la torre de vision y al contexto largo de 262K tokens.
- Generacion de codigo en produccion: el modelo base destaca en tareas de programacion; la cuantizacion mantiene una alta fidelidad (98,5 % de acuerdo top-1) y puede integrarse en pipelines de CI/CD mediante vLLM.
- Agentes autonomos de largo horizonte: el soporte para razonamiento multi-paso y la ventana de contexto amplia permiten construir agentes que mantienen estado a lo largo de interacciones prolongadas.
- Analisis de imagenes con contexto textual extenso: por ejemplo, revision de documentacion tecnica con figuras y tablas, donde el modelo puede razonar sobre ambas modalidades.
- Despliegue en entornos con restricciones de VRAM: la cuantizacion W8A16 reduce el uso de memoria a aproximadamente la mitad frente a BF16, habilitando servidores de inferencia con GPUs Ampere de gama media.

## Benchmarks y rendimiento

La model card no proporciona resultados de benchmarks funcionales (MMLU, HumanEval, GSM8K, etc.) para esta cuantizacion. En su lugar, reporta metricas de fidelidad frente al teacher BF16 (TeichAI Fable-Distill) medidas con 467 posiciones forzadas por el profesor:

| Metrica | Valor |
|---|---|
| KLD medio (nats/token) | 0,000660 |
| Acuerdo top-1 | 98,50 % |

Ademas, la card upstream del modelo base Fable-Distill reporta mejoras frente a Qwen3.8-27B (no verificadas en este repositorio): ARC Challenge 0,637 (frente a 0,591), ARC Challenge Easy 0,832 (frente a 0,782) y BoolQ 0,911 (frente a 0,896). Estos datos corresponden al modelo sin cuantizar y no deben interpretarse como rendimiento de esta version.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 31,6 GB; con cuantizacion W8A16, los pesos INT8 ocupan aproximadamente 27 GB, mas overhead de activaciones y cache. Se recomienda un minimo de 48 GB de VRAM combinada (por ejemplo, dos RTX 3090 de 24 GB).
- GPUs recomendadas: arquitectura Ampere sm_86 (RTX 3090, RTX 3080 Ti, etc.) o superior; la cuantizacion esta especificamente optimizada para Ampere donde no hay soporte FP8 nativo.
- Opciones de despliegue: vLLM (libreria principal, con soporte para compressed-tensors y kernel Marlin); tambien puede usarse con otros frameworks compatibles con safetensors y formato W8A16.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| lued/Qwen3.8-27B-TeichAI-Fable-INT8-W8A16-MTP (este) | 27,8B | 262K (segun base) | W8A16 INT8 | Apache-2.0 | Cuantizacion del tune Fable-5, con MTP |
| lued/Qwen3.8-27B-INT8-W8A16-MTP | 27,8B | 262K (segun base) | W8A16 INT8 | Apache-2.0 | Misma receta de cuantizacion, pero con pesos LM de Qwen3.8-27B sin tune Fable |
| TeichAI/Qwen3.8-27B-Fable-Distill | 27,8B | 262K (segun base) | BF16 (sin cuantizar) | Apache-2.0 | Modelo base con tune Fable-5, requiere ~54 GB en FP16 |
| Qwen/Qwen3.8-27B | 27,8B | 262K | BF16 (sin cuantizar) | Apache-2.0 | Modelo original de Alibaba, multimodal y agéntico |

La principal diferencia entre este modelo y su version sin Fable es la capa de pesos del lenguaje: este usa los pesos del tune Fable-5, que segun la card upstream mejoran ligeramente en ARC y BoolQ. Ambos comparten la misma infraestructura de cuantizacion y la cabeza MTP byte-identica.

## Limitaciones y advertencias

- La cuantizacion W8A16 introduce una degradacion pequena pero medible (KLD 0,000660, 1,5 % de divergencia top-1); para aplicaciones criticas se recomienda evaluar el comportamiento funcional en el dominio especifico.
- No se han publicado evaluaciones funcionales de esta version cuantizada (tool use, calidad multimodal, recall de contexto largo); los benchmarks del modelo base no garantizan el mismo rendimiento tras la cuantizacion.
- El modelo base puede presentar sesgos y alucinaciones tipicos de los LLM; no se ha realizado una auditoria especifica en este repositorio.
- La cuantizacion esta optimizada para GPUs Ampere (sm_86); en otras arquitecturas (por ejemplo, Turing o RDNA) el kernel Marlin puede no estar disponible o requerir configuracion adicional.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los terminos del modelo base Qwen3.8-27B y del tune Fable-5 para confirmar que no hay restricciones adicionales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicacion reciente sin validacion comunitaria amplia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/lued/Qwen3.8-27B-TeichAI-Fable-INT8-W8A16-MTP
- Modelo base (TeichAI Fable-Distill): https://huggingface.co/TeichAI/Qwen3.8-27B-Fable-Distill
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- vLLM: https://github.com/vllm-project/vllm
- llm-compressor: https://github.com/vllm-project/llm-compressor
- Pagina de Qwen3.8 en LM Studio: https://lmstudio.ai/models/qwen3.8

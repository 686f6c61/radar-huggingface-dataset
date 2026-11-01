# pitcany/GLM-4.5-Air-REAP-82B-A12B-AWQ-4bit

## Resumen

GLM-4.5-Air-REAP-82B-A12B-AWQ-4bit es una version cuantizada a 4 bits mediante AWQ del modelo cerebras/GLM-4.5-Air-REAP-82B-A12B, que a su vez es una variante podada del GLM-4.5-Air original de Zhipu AI. La publica el usuario pitcany en HuggingFace bajo licencia Apache 2.0. El modelo base pertenece a la familia GLM-4.5, una arquitectura Mixture of Experts (MoE) disenada para generacion de texto y razonamiento conversacional, con soporte nativo de ingles y chino.

La cuantizacion reduce el peso de aproximadamente 160 GB en FP16 a unos 40 GB en 4 bits, lo que permite desplegar un modelo MoE de gran tamano en hardware mas modesto. Segun los datos del repositorio, el checkpoint contiene 12.860.868.264 parametros reales en safetensors, aunque la model card declara 82B totales y 12B activos, lo que sugiere que la variante REAP aplica poda de expertos sobre la arquitectura original.

El interes practico radica en combinar tres tecnicas: poda de expertos (REAP), cuantizacion de pesos (AWQ 4-bit) e inferencia optimizada con vLLM. El resultado es un modelo que cabe en configuraciones de 1 a 4 GPU de consumo o profesionales y que mantiene el paradigma MoE con activacion dispersa, lo que reduce el coste computacional por token frente a un modelo denso equivalente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), familia GLM-4.5 (glm4_moe) |
| Parametros totales | 82B declarados en la model card; 12.860.868.264 en safetensors |
| Parametros activos | 12B (declarado) |
| Longitud de contexto | 131.072 tokens (configurado en vLLM con `--max-model-len 131072`) |
| Tipos de cuantizacion | AWQ 4-bit entero simetrico, group size 32, duo scaling, observer MSE |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, compressed-tensors, compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture of Experts de la familia GLM-4.5. La variante REAP aplica una tecnica de poda de expertos (pruning) sobre el GLM-4.5-Air original, reduciendo el numero de expertos y, con ello, el total de parametros. La model card declara 82B totales y 12B activos, aunque el recuento real de safetensors es de 12.86B, dato que conviene verificar contra el repositorio base.

La cuantizacion AWQ se realizo con la libreria llm-compressor de vLLM. Se aplico cuantizacion entera simetrica de 4 bits con group size 32, observer MSE y duo scaling activado. Se excluyeron de la cuantizacion capas criticas para preservar calidad: lm_head, embeddings, layer norms (entrada, post-atencion y final), expertos compartidos del MoE, la primera capa completa y las puertas MLP. Si se cuantizaron gate_proj, up_proj, down_proj, k_proj, q_proj, v_proj y o_proj. El dataset de calibracion fue HuggingFaceH4/ultrachat_200k con 256 muestras y longitud maxima de 2048 tokens, con un tiempo de calibracion de 30 a 60 minutos sobre 2x RTX 6000 Blackwell.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset original ni si hubo fases de RLHF o DPO en el modelo base, ya que la model card de esta variante cuantizada no los detalla.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat integrada.
- Razonamiento en modo thinking, con parser de razonamiento dedicado en vLLM (`--reasoning-parser glm45`).
- Soporte de tool calling / function calling mediante `--enable-auto-tool-choice` y `--tool-call-parser glm45`.
- Capacidades multilingues limitadas a ingles y chino.
- Inferencia con activacion dispersa de expertos (MoE), lo que reduce el coste por token.
- Compatibilidad con prefix caching y chunked prefill en vLLM.
- Ajuste fino con LoRA/QLoRA segun la model card.
- No se declaran capacidades de vision, audio ni otros modos.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede mantener conversaciones multi-turno con contexto de hasta 131.072 tokens, lo que permite incluir historiales largos o documentacion de producto en el prompt sin truncar. Su soporte de tool calling facilita integrarlo con sistemas de ticketing o CRM.
- Generacion de codigo en pipelines de CI/CD: el soporte de function calling y el parser glm45 permiten que el modelo invoque herramientas externas (linters, compiladores, APIs de repositorio) dentro de flujos automatizados, con la ventaja de un modelo de 12B activos que reduce el coste por llamada.
- Agentes multi-paso: el modo de razonamiento explicito y el parser de razonamiento de vLLM permiten construir agentes que planifican, ejecutan herramientas y reflexionan sobre resultados, con contexto largo para mantener el estado de la tarea.
- Despliegue en hardware de consumo agregado: la configuracion de referencia con 4x RTX 5060 Ti de 16 GB y expert-parallel demuestra que el modelo puede servirse en estaciones de trabajo con GPUs de gama media, algo inviable con el modelo en FP16.
- Procesamiento por lotes de documentos en ingles y chino: con 131k de contexto y cuantizacion 4-bit, es adecuado para resumir, clasificar o extraer informacion de lotes grandes de documentos en esos dos idiomas.
- Investigacion y experimentacion con MoE: al ser una variante podada y cuantizada, sirve para estudiar el impacto de REAP y AWQ en la calidad de routing y en la perplexity, comparando contra el modelo base sin cuantizar.
- Fine-tuning con QLoRA: la model card indica que es apto para ajuste fino con LoRA/QLoRA, lo que permite adaptar el modelo a dominios concretos con requisitos de VRAM reducidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente declara una degradacion estimada de menos del 2 por ciento de incremento en perplexity respecto al modelo sin cuantizar, una reduccion de tamano de aproximadamente el 75 por ciento (de unos 160 GB en FP16 a unos 40 GB en AWQ 4-bit) y una velocidad de inferencia de 2 a 4 veces superior a FP16. No se aportan cifras de MMLU, HumanEval, GSM8K ni de otras evaluaciones estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 50 GB con overhead segun la model card; el checkpoint pesa 45,7 GB en el repositorio.
- Minimo declarado: 1 GPU de 48 GB de VRAM (RTX 6000 Ada, A6000, L40S).
- Recomendado: 2 GPU de 48 GB o mas para throughput optimo, o 1 GPU de 80 GB o mas (H100, A100 80GB).
- Configuracion de referencia del autor: 4x RTX 5060 Ti de 16 GB con tensor-parallel-size 4 y expert-parallel activado, usando kv-cache en fp8 y gpu-memory-utilization 0.92.
- Cabe en GPU de consumo solo en configuraciones multi-GPU agregadas; no cabe en una unica GPU de consumo de 24 GB.
- Opciones de despliegue: vLLM es el backend recomendado y el unico soportado de forma optima; la model card indica que requiere CUDA y no soporta CPU. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se aportan cifras concretas; solo la estimacion cualitativa de 2 a 4 veces mas rapido que FP16.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|---|
| pitcany/GLM-4.5-Air-REAP-82B-A12B-AWQ-4bit | 82B declarados / 12,86B en safetensors | 12B | 131.072 | AWQ 4-bit | Apache 2.0 | Variante podada y cuantizada, requiere vLLM |
| cerebras/GLM-4.5-Air-REAP-82B-A12B | 82B | 12B | no disponible en esta ficha | FP16/BF16 | Apache 2.0 | Modelo base sin cuantizar, mayor VRAM |
| GLM-4.5-Air (original Zhipu AI) | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | multiples | no disponible en esta ficha | Modelo de origen antes de poda REAP |

No se dispone de datos de benchmarks ni de comparativas de rendimiento con otros modelos en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, licencia y formato.

## Limitaciones y advertencias

- Perdida por cuantizacion: aunque AWQ preserva la calidad en general, la model card advierte de posible degradacion en casos limite.
- Dependencia de vLLM: el modelo esta optimizado y practicamente pensado para vLLM; no se garantiza funcionamiento correcto en otros backends.
- Solo GPU con CUDA: no hay soporte de inferencia en CPU declarado.
- Diferencias de routing MoE: algunos comportamientos de enrutamiento de expertos pueden diferir ligeramente del modelo original tras la poda y la cuantizacion.
- Idiomas limitados: solo ingles y chino; no se declara soporte de castellano, lo que limita su uso en produccion en espanol sin evaluacion previa.
- Riesgo de alucinacion: no se documenta ninguna mitigacion especifica en la model card; aplican los riesgos habituales de los modelos generativos.
- Sesgos: no se documentan sesgos conocidos ni evaluaciones de seguridad en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base y del modelo original de Zhipu AI antes de desplegar en produccion.
- Repositorio con muy pocas descargas (17) y ningun like en el momento de la consulta, lo que reduce la validacion comunitaria y la evidencia empirica de calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pitcany/GLM-4.5-Air-REAP-82B-A12B-AWQ-4bit
- Modelo base: https://huggingface.co/cerebras/GLM-4.5-Air-REAP-82B-A12B
- Libreria de cuantizacion llm-compressor: https://github.com/vllm-project/llm-compressor
- vLLM: https://github.com/vllm-project/vllm
- Dataset de calibracion: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k

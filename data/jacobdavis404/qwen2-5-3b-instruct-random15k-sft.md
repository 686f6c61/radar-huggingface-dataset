# jacobdavis404/Qwen2.5-3B-Instruct-Random15K-SFT

## Resumen

`jacobdavis404/Qwen2.5-3B-Instruct-Random15K-SFT` es un ajuste fino completo (full fine-tuning) del modelo denso Qwen2.5-3B-Instruct, publicado por el usuario jacobdavis404. El entrenamiento se realizó con LLaMA-Factory sobre un dataset denominado `acereason_random_15k`, presumiblemente orientado a razonamiento, y el resultado se distribuye en formato safetensors para su uso con Transformers. El repositorio no incluye descripción de uso previsto, composición del dataset ni resultados de evaluación: la model card es la plantilla autogenerada por el `Trainer` de HuggingFace.

El interés de esta ficha es limitado pero real: se trata de un artefacto de investigación reproducible (hiperparámetros completos, seed fijada, versiones de framework declaradas) que permite estudiar el efecto de un SFT de 15.000 muestras sobre una base de 3B parámetros. No obstante, la ausencia de benchmarks, de licencia clara y de documentación sobre los datos de entrenamiento impide recomendarlo para producción sin una evaluación propia.

Advertencia importante sobre los metadatos: el campo de parámetros declarado en los safetensors del repo (241.664) es incompatible con un modelo derivado de Qwen2.5-3B, y el tamaño del repositorio (86,4 GB) excede con mucho el peso esperado de un modelo de 3B en bf16 (unos 6,2 GB), lo que sugiere la inclusión de checkpoints intermedios y estados del optimizador. Ambos datos deben tratarse como no fiables.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen2.5-3B-Instruct: atención con RoPE, GQA y SwiGLU/MLP) |
| Parametros totales | ~3,09 B según el modelo base; el metadato safetensors del repo indica 241.664, dato inconsistente y no verificado |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base Qwen2.5 (heredado, no declarado en esta model card); extensible a 131.072 con YaRN según la documentación de Qwen |
| Tipos de cuantizacion | no disponible: el repo solo publica safetensors (presumiblemente bf16). No hay GGUF, AWQ ni GPTQ publicados por el autor; la conversión a 8 bits o 4 bits es viable con herramientas externas |
| Idiomas soportados | no disponible (la model card no declara idiomas; el modelo base Qwen2.5 cubre oficialmente 29 idiomas) |
| Licencia | `other` (no se especifican términos). El modelo base Qwen2.5-3B-Instruct se publica bajo Apache-2.0 |
| Formato de pesos | safetensors (Transformers); repo de 86,4 GB, compatible con text-generation-inference |
| Tipo de ajuste | Full fine-tuning (tag `full`), no LoRA |
| Dataset de entrenamiento | `acereason_random_15k` (composición no documentada) |
| Estado de la model card | Plantilla autogenerada, sin revisar por el autor |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only denso de Qwen2.5 con normalización RMSNorm, activaciones SwiGLU, attention con grouped-query attention (GQA) y embeddings RoPE. El ajuste no modifica la topología; únicamente actualiza todos los pesos mediante SFT supervisado. El tag `full` de LLaMA-Factory confirma que no se trata de un adaptador LoRA, sino de un entrenamiento completo de los ~3B parámetros, lo que explica el tamaño desproporcionado del repositorio si incluye checkpoints y estados de AdamW.

Los hiperparámetros declarados son: learning rate 5e-6, scheduler coseno, 3 épocas, batch size por dispositivo de 1 con 8 pasos de acumulación de gradiente (batch efectivo de 8), optimizador `adamw_torch_fused` con betas (0,9; 0,999) y epsilon 1e-8, seed 42 y entrenamiento multi-GPU. El stack utilizado fue Transformers 4.55.0, PyTorch 2.13.0+cu126, Datasets 3.6.0 y Tokenizers 0.21.4. No se documenta el número total de tokens vistos, la composición del dataset `acereason_random_15k`, ni si hubo fases posteriores de RLHF o DPO; tampoco se reportan curvas de pérdida ni resultados de evaluación durante el entrenamiento.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del ajuste instructivo de Qwen2.5-3B-Instruct.
- Razonamiento y matemáticas básicas: el nombre del dataset (`acereason`) sugiere un entrenamiento orientado a tareas de razonamiento, aunque no hay evidencia publicada del efecto.
- Generación de código y soporte de instrucciones técnicas, como capacidad heredada del modelo base.
- Tool calling / function calling: el modelo base Qwen2.5 lo soporta de forma nativa; no hay verificación de que el ajuste lo preserve.
- Capacidades agénticas y razonamiento multi-paso: no verificadas tras el ajuste.
- Multilingüismo: presumible del modelo base (29 idiomas), no declarado en esta model card ni evaluado.
- Capacidad de visión: no, es un modelo exclusivamente de texto.
- Modo "thinking" explícito: no disponible.

## Casos de uso

- Investigación sobre SFT: reproducir el experimento (seed 42, hiperparámetros completos y versiones de framework documentadas) para medir cuánto aporta un ajuste de 15.000 muestras frente al modelo base en tareas de razonamiento.
- Generación de datos sintéticos para destilación: usar el modelo como generador de trazas de razonamiento en pipelines de destilación hacia modelos menores, dado su coste de inferencia reducido.
- Prototipado de asistentes conversacionales en local: con ~6 GB en bf16 o ~2 GB en cuantización de 4 bits, cabe en una GPU de consumo y permite iterar en un portátil con GPU dedicada.
- Clasificación y extracción de información con contexto largo: si se confirma la ventana de 32.768 tokens del modelo base, permite procesar documentos completos (contratos, informes) con prompts de extracción estructurada.
- Evaluación comparativa de ajustes comunitarios: como punto de control en un estudio sobre degradación catastrófica (catastrophic forgetting) tras SFT completo en modelos de 3B.
- Base para un segundo ajuste específico de dominio: al ser un full fine-tune sin adaptadores, sirve como inicialización para pipelines de LLaMA-Factory en dominios verticales.
- No recomendado, sin evaluación previa, para atención al cliente en producción, generación de código crítica ni decisiones automatizadas: no hay benchmarks ni garantías de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El `model-index` de la model card declara la entrada `random_15k` con la lista de resultados vacía (`results: []`), y la sección "Training results" del README está en blanco. No existen datos de MMLU, HumanEval, GSM8K ni de evaluaciones de pérdida que permitan comparar este ajuste con su modelo base.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: aproximadamente 6,2 GB solo para pesos, más 1-3 GB de caché KV según longitud de contexto y batch; en la práctica, 10-12 GB para contexto moderado.
- VRAM en cuantización de 8 bits: entorno a 3,5-4 GB de pesos; viable en GPUs de 8 GB.
- VRAM en cuantización de 4 bits (GGUF Q4_K_M): aproximadamente 2 GB de pesos; cabe en GPUs de 6-8 GB e incluso en CPU con llama.cpp.
- GPUs recomendadas: RTX 4090, RTX 4080, RTX 3090, L4 o A10G para inferencia en bf16 con batch pequeño; A100/H100 solo justificables para servir muchas réplicas o hacer fine-tuning adicional.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores; en 4 bits también en GPUs de 8 GB.
- Opciones de despliegue: vLLM y TGI (el repo declara `text-generation-inference` y `endpoints_compatible`), llama.cpp/Ollama tras conversión a GGUF, y Transformers con `device_map="auto"`.
- Fine-tuning adicional: un full fine-tune requiere del orden de 40-60 GB de VRAM con AdamW en bf16 (pesos, gradientes y estados del optimizador); con LoRA o QLoRA basta una GPU de 24 GB.
- Latencia y throughput: no disponibles. No se han publicado mediciones.
- Nota: los 86,4 GB del repositorio implican una descarga muy superior a la necesaria para inferencia; conviene descargar solo los archivos de pesos finales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen2.5-3B-Instruct-Random15K-SFT) | ~3,09 B | 32.768 (heredado) | `other` (sin especificar) | HF, 0 descargas, 0 likes | Sin benchmarks ni documentación de datos |
| Qwen/Qwen2.5-3B-Instruct | ~3,09 B | 32.768 (131.072 con YaRN) | Apache-2.0 | HF, ampliamente adoptado | Modelo base; benchmarks públicos en su model card |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 B | 131.072 | Llama 3.2 Community License | HF, muy extendido | Contexto mayor; licencia con restricciones de uso |
| microsoft/Phi-3.5-mini-instruct | 3,8 B | 131.072 | MIT | HF, muy extendido | Enfoque en razonamiento; licencia permisiva |

Los datos de los modelos comparables provienen de sus respectivas model cards públicas y no de la información de este repositorio. No hay datos de rendimiento de este ajuste que permitan afirmar que supera o iguala a su modelo base.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia de que el ajuste mejore al modelo base; podría haber degradado capacidades previas (olvido catastrófico) al tratarse de un full fine-tune de 3 épocas.
- Dataset no documentado: se desconoce la procedencia, licencia, idioma y calidad de `acereason_random_15k`, lo que impide evaluar riesgos de sesgo, contaminación de benchmarks o material con derechos de autor.
- Licencia `other` sin texto: no se especifican condiciones de uso comercial, redistribución ni atribución. El modelo base es Apache-2.0, pero el autor no confirma que este ajuste herede esos términos.
- Riesgo de alucinación: intrínseco a los modelos de 3B parámetros, sin evaluación específica en este ajuste.
- Idiomas no declarados: aunque el modelo base cubre 29 idiomas, no hay garantía de que el SFT no haya desplazado la distribución lingüística hacia el idioma del dataset.
- Metadatos inconsistentes (241.664 parámetros declarados, 86,4 GB de repo): indican un proceso de publicación descuidado; conviene verificar la integridad de los pesos antes de usarlos.
- Modelo sin tracción comunitaria (0 descargas, 0 likes) y con model card sin revisar: no hay señal de validación por terceros.
- Fecha de creación y actualización (19 de octubre de 2026) con diferencias de minutos entre ambas: el repositorio no ha recibido mantenimiento posterior.
- La búsqueda web realizada no devolvió resultados técnicos relevantes sobre el modelo; los enlaces obtenidos no guardan relación con el contenido y se han descartado.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/jacobdavis404/Qwen2.5-3B-Instruct-Random15K-SFT
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- LLaMA-Factory (framework de entrenamiento declarado): https://github.com/hiyouga/LLaMA-Factory
- Repositorio de Transformers: https://github.com/huggingface/transformers
- Repositorio de llama.cpp (para conversión a GGUF): https://github.com/ggml-org/llama.cpp
- vLLM (servido de alto rendimiento): https://github.com/vllm-project/vllm
- Resultados de búsqueda web: no disponibles (las consultas no devolvieron material técnico relacionado con el modelo).

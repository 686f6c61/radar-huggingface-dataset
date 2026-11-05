# CamiloEmiliano/yarnball-qwen-7b-dpo

## Resumen

`CamiloEmiliano/yarnball-qwen-7b-dpo` es un adaptador PEFT (LoRA) publicado en HuggingFace por el usuario CamiloEmiliano sobre el modelo base `Qwen/Qwen2.5-7B-Instruct`. El nombre sugiere un ajuste fino orientado a DPO (Direct Preference Optimization), aunque la model card no confirma ni documenta el procedimiento de entrenamiento, los datos utilizados ni los hiperparametros. El repositorio pesa 1,9 GB, coherente con un conjunto de pesos de adaptador en `safetensors` para un modelo de 7 mil millones de parametros.

El interes tecnico del artefacto reside en su modelo base: Qwen2.5-7B-Instruct es un transformer decoder-only denso de 7,6 mil millones de parametros con 128 000 tokens de contexto, entrenado por Alibaba Qwen. El adaptador hereda por tanto las capacidades del base (generacion, razonamiento, codigo, tool calling, multilingue) y anade una capa de preferencias que, en teoria, alinea las respuestas con un criterio de calidad no documentado.

La relevancia practica es limitada en su estado actual: cero descargas, cero likes, model card sin rellenar y ausencia de benchmarks o ejemplos de uso. Se trata de un experimento personal mas que de un modelo listo para produccion, y debe evaluarse con cautela antes de cualquier despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen2.5-7B-Instruct); adaptador LoRA/PEFT |
| Parametros totales | 7,6 mil millones (modelo base); tamano del adaptador no disponible |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 131 072 tokens (heredada del base Qwen2.5-7B-Instruct); no verificada en el adaptador |
| Tipos de cuantizacion | no disponible en el repositorio (el adaptador esta en safetensors; el base admite GPTQ, AWQ, GGUF y bitsandbytes) |
| Idiomas soportados | no disponible en la model card; el base Qwen2.5 soporta principalmente ingles y chino, con cobertura parcial de otros idiomas |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT); requiere cargar el base Qwen2.5-7B-Instruct por separado |

## Arquitectura y entrenamiento

El artefacto es un adaptador PEFT de tipo LoRA (la model card declara `library_name: peft` y version 0.13.2 del framework) que se aplica sobre `Qwen/Qwen2.5-7B-Instruct`. El modelo base es un transformer decoder-only denso con atencion por causalidad, RoPE, SwiGLU y normalizacion RMSNorm, con 28 capas, dimension oculta de 3584 y atencion con 28 cabezas de consulta y 4 de clave/valor (GQA). El adaptador en si no modifica la arquitectura, solo anade matrices de bajo rango en determinadas proyecciones.

No hay informacion sobre el dataset de preferencias utilizado para el supuesto DPO, el numero de pasos, la tasa de aprendizaje, el rango del LoRA ni el hardware empleado. La model card es la plantilla por defecto de HuggingFace sin rellenar, y el unico metadato tecnico es la referencia al paper `arxiv:1910.09700` (Lacoste et al., calculadora de impacto ambiental), que aparece en la plantilla y no aporta informacion sobre el entrenamiento. No se puede confirmar que se haya aplicado DPO mas alla de lo que sugiere el sufijo del nombre.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del base Qwen2.5-7B-Instruct.
- Razonamiento y matematicas de nivel medio, con soporte para cadenas de pensamiento si se solicita.
- Generacion y edicion de codigo en lenguajes populares (Python, JavaScript, Java, C++, Go, Rust), con calidad dependiente del base.
- Tool calling y function calling estructurado, soportado nativamente por Qwen2.5-7B-Instruct.
- Capacidad de agente con razonamiento multi-paso y uso de herramientas, limitada por la ventana de contexto del base.
- Multilingue parcial: ingles y chino fuertes, espanol y otros idiomas con calidad variable.
- No se ha documentado ninguna capacidad adicional (vision, audio, thinking mode explicito) anadida por el adaptador.
- El efecto real del ajuste DPO sobre estas capacidades es desconocido y no esta evaluado.

## Casos de uso

- Evaluacion de adaptadores DPO en investigacion: cargar el adaptador sobre Qwen2.5-7B-Instruct y comparar respuestas frente al base para estudiar el efecto del ajuste de preferencias en dominios concretos.
- Prototipado de asistentes conversacionales: usar el modelo como base para un chatbot de dominio general con contexto largo, aprovechando los 128k tokens del base.
- Generacion de codigo asistida en entornos de desarrollo: integrar el modelo en un IDE o pipeline de CI/CD mediante tool calling para autocompletar, revisar parches o generar tests.
- Analisis de documentos largos: resumir o extraer informacion de contratos, informes o articulos que quepan en la ventana de contexto del base.
- Experimentacion con tecnicas de alineacion: servir como punto de partida para estudiar como un adaptador LoRA pequeno modifica el comportamiento de un modelo instruct ya alineado.
- Fine-tuning adicional sobre el adaptador: al ser un PEFT, permite seguir entrenando con nuevos datos sin tocar los pesos del base, util para iteraciones rapidas en un solo GPU.
- Traduccion y generacion multilingue en ingles y chino principalmente, con cautela en espanol y otros idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluacion alguna y el autor no documenta metricas de MMLU, HumanEval, GSM8K ni de preferencias (win rate, AlpacaEval, MT-Bench).

## Requisitos de hardware

- VRAM para el adaptador: minimo, al ser un LoRA de bajo rango; se suma a la del base.
- VRAM para el base en bf16: aproximadamente 15-16 GB de pesos, mas overhead de activaciones y KV cache; en la practica se recomienda 24 GB o mas para contexto largo.
- VRAM para el base cuantizado: 4 bits (GPTQ/AWQ/bitsandbytes) alrededor de 5-6 GB; 8 bits alrededor de 8-9 GB.
- GPU consumer: cabe en RTX 4090 (24 GB) en bf16 con contexto moderado; en RTX 3090/4080 (16-24 GB) en cuantizacion 8 o 4 bits; en GPUs de 12 GB solo con cuantizacion 4 bits y contexto reducido.
- GPU profesional: A100 40/80 GB, H100 y L40S sin problemas para servir en bf16 con contexto largo.
- Despliegue: vLLM y TGI para servir el base fusionado con el adaptador; llama.cpp/Ollama si se exporta a GGUF (requiere fusionar el adaptador previamente); Transformers + PEFT para inferencia directa.
- Latencia y throughput: no disponibles; dependen del backend, la cuantizacion y el hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| CamiloEmiliano/yarnball-qwen-7b-dpo | 7,6 B (base) + adaptador | 128k (heredado) | no disponible | HuggingFace, 0 descargas | Adaptador DPO sin documentar |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | 128k | Apache 2.0 | HuggingFace, ampliamente usado | Modelo base de referencia |
| Mistral-7B-Instruct-v0.3 | 7,2 B | 32k | Apache 2.0 | HuggingFace | Alternativa densa de 7B |
| Meta-Llama-3.1-8B-Instruct | 8 B | 128k | Llama 3.1 Community | HuggingFace | Alternativa con contexto largo |

El adaptador no aporta ventajas demostrables frente al base Qwen2.5-7B-Instruct ni frente a las alternativas, dado que no hay evaluacion publicada.

## Limitaciones y advertencias

- Model card vacia: sin documentacion de datos, entrenamiento, licencia ni uso previsto.
- Licencia no declarada: riesgo legal para uso comercial; hereda en la practica la licencia del base (Apache 2.0 para Qwen2.5-7B-Instruct), pero el adaptador no la explicita.
- Cero descargas y cero likes: sin validacion por parte de la comunidad.
- Riesgo de alucinacion: heredado del base, sin mitigaciones documentadas.
- Sesgos: los del base Qwen2.5 (predominantemente datos en ingles y chino), sin analisis especifico del adaptador.
- Cobertura limitada en espanol y otros idiomas fuera de ingles y chino.
- El efecto del DPO no esta verificado; podria degradar capacidades del base si el dataset de preferencias era pequeno o de baja calidad.
- Requiere fusionar o cargar el base por separado; no es un modelo autonomo.
- No recomendado para produccion sin una evaluacion propia exhaustiva.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/CamiloEmiliano/yarnball-qwen-7b-dpo
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Calculadora de impacto ambiental: https://mlco2.github.io/impact

# micdun/code_54k_gpt_oss_20b_qwq_gpt_oss_120b_qwen2_5-1_5b_lr1e-4

## Resumen

`micdun/code_54k_gpt_oss_20b_qwq_gpt_oss_120b_qwen2_5-1_5b_lr1e-4` es un ajuste fino supervisado (SFT) del modelo instructivo Qwen2.5-1.5B-Instruct, publicado por el usuario micdun en Hugging Face. El modelo parte de la base de Qwen (Alibaba) y ha sido reentrenado sobre un conjunto sintetico de 54.000 ejemplos de dominio de codigo, generados por tres modelos "profesor" identificados en el nombre del run como `gpt_oss_20b_qwq_gpt_oss_120b`. Se trata, por tanto, de un experimento de destilacion de datos sinteticos sobre una base pequena, no de un modelo de proposito general.

El interes tecnico es limitado pero concreto: sirve como caso de estudio de como un modelo de 1.500 millones de parametros puede especializarse en generacion de codigo mediante SFT con datos generados por modelos mayores. El entrenamiento fue un ajuste fino completo (no LoRA) de 3 epocas, con tasa de aprendizaje 1e-4 y batch global de 64, segun la model card. El repositorio ocupa 3,1 GB y contiene pesos en safetensors, lo que corresponde a precision de 16 bits para 1.543.714.304 parametros.

La relevancia practica es acotada: el modelo tiene cero descargas y cero "likes" en el momento de redactar esta ficha, no declara licencia ni idiomas soportados, y no publica resultados de evaluacion. Debe tratarse como un artefacto experimental de un autor individual, adecuado para pruebas locales en GPU de consumo, no como una dependencia de produccion sin validacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), segun el modelo base Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta hasta 32.768 tokens, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | no disponible en el repo; al ser compatible con transformers y safetensors, admite cuantizacion posterior a 8 y 4 bits (GPTQ, AWQ, GGUF) mediante herramientas externas |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base Qwen2.5-1.5B-Instruct: un transformer decoder-only denso con atencion causal estandar, normalizacion RMSNorm, activacion SwiGLU y sesgos QKV, segun la familia Qwen2. La model card no detalla modificaciones estructurales, por lo que se asume que el ajuste conserva la topologia original sin cambios en el tokenizador ni en la ventana de contexto.

El entrenamiento consistio en un ajuste fino completo (full fine-tune) durante 3 epocas, con tasa de aprendizaje 1e-4 y batch global de 64, sobre 54.000 ejemplos de dominio de codigo. Los datos son sinteticos y se reparten a partes iguales: 18.000 ejemplos de cada uno de los tres modelos profesor citados en el identificador del run (`gpt_oss_20b_qwq_gpt_oss_120b`). No se documenta el proceso de filtrado, deduplicacion ni verificacion de ejecucion del codigo generado, ni si hubo etapas de RLHF o DPO posteriores. La model card no indica el numero total de tokens de entrenamiento ni la composicion exacta del dataset mas alla del recuento de ejemplos.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base instructivo Qwen2.5-1.5B-Instruct.
- Generacion de codigo en el dominio para el que fue ajustado, presumiblemente en varios lenguajes, aunque la model card no especifica cuales.
- Razonamiento basico y respuesta a instrucciones, con el nivel propio de un modelo de 1.500 millones de parametros.
- Soporte de plantillas de chat conversacional (tag `conversational`), compatible con el pipeline `text-generation` de transformers.
- Compatibilidad con Text Generation Inference y endpoints compatibles, segun los tags del repositorio.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Prototipado rapido de asistentes de codigo en local: el modelo cabe en una GPU de consumo y permite iterar sobre prompts y plantillas de chat sin coste de API, util para validar flujos antes de migrar a un modelo mayor.
- Autocompletado de fragmentos de codigo en editores: con 1.500 millones de parametros y pesos en 16 bits, la latencia en una RTX 4090 o similar es baja, lo que permite sugerencias en tiempo real en entornos de desarrollo.
- Generacion de tests unitarios y ejemplos de uso: el ajuste sobre datos sinteticos de codigo tiende a producir patrones repetitivos y estructurados, adecuados para borradores de pruebas que luego se revisan manualmente.
- Experimentacion academica con destilacion de datos sinteticos: sirve como referencia para comparar el efecto de entrenar un modelo pequeno con salidas de modelos mayores en el dominio de codigo.
- Tareas de extraccion y transformacion de texto estructurado en pipelines internos: su ventana de contexto (heredada del base) permite procesar documentos moderadamente largos en lotes.
- Base para ajustes posteriores con LoRA o QLoRA: al ser un modelo pequeno y denso, es un punto de partida barato para especializaciones adicionales en dominios concretos.
- Evaluacion comparativa de calidad de datos sinteticos: permite medir si los datos generados por los modelos profesor mejoran o degradan tareas de codigo frente al Qwen2.5-1.5B-Instruct original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 3,1 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB para contextos cortos.
- VRAM estimada en cuantizacion de 8 bits: en torno a 1,6-2 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits: en torno a 0,8-1,2 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 Ti, RTX 4060, RTX 4070); A100, H100 o L40S para despliegues con concurrencia alta.
- Cabe en GPU de consumo: si, en tarjetas con 6-8 GB o mas en FP16 y en practicamente cualquier GPU moderna con cuantizacion de 4 bits.
- Opciones de despliegue: transformers (referencia en la model card), Text Generation Inference (tag `text-generation-inference`), y conversion a GGUF para llama.cpp u Ollama mediante herramientas externas; vLLM es compatible al ser un modelo Qwen2 estandar.
- Latencia y throughput: no disponibles en la informacion proporcionada; a modo orientativo, un modelo denso de 1.500 millones de parametros en una GPU de consumo suele generar decenas de tokens por segundo, pero no hay mediciones publicadas para este ajuste concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (code_54k_..._qwen2_5-1_5b_lr1e-4) | 1.543.714.304 | no disponible | no disponible | Hugging Face, 0 descargas | SFT sobre datos sinteticos de codigo; sin benchmarks |
| Qwen/Qwen2.5-1.5B-Instruct | 1.500 millones aprox. | 32.768 tokens (segun el modelo base) | Apache 2.0 (segun el modelo base) | Hugging Face, ampliamente utilizado | Modelo de referencia; este ajuste parte de el |
| Qwen/Qwen2.5-Coder-1.5B-Instruct | 1.500 millones aprox. | 32.768 tokens (segun la familia Coder) | Apache 2.0 (segun el modelo base) | Hugging Face | Especializado en codigo por el propio fabricante, con evaluacion publicada |

No se dispone de datos de rendimiento comparativo para este ajuste, por lo que la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- No se declara licencia en el repositorio; el uso comercial queda en una situacion juridica indeterminada y requiere contactar con el autor o asumir los terminos del modelo base (Qwen2.5-1.5B-Instruct, Apache 2.0) con cautela.
- No se declaran idiomas soportados; el comportamiento multilingue es incierto y probablemente degradado respecto al modelo base tras el ajuste en un unico dominio.
- Riesgo elevado de alucinacion en codigo: los datos sinteticos pueden contener APIs inexistentes, imports erroneos o logica incorrecta no verificada; es imprescindible ejecutar y revisar el codigo generado.
- Sesgos desconocidos: no hay documentacion sobre el filtrado de los datos sinteticos ni sobre la diversidad de los modelos profesor, lo que puede introducir sesgos de estilo o de lenguaje.
- Sin evaluacion publicada: no hay benchmarks que permitan afirmar que el ajuste mejora al modelo base en tareas de codigo; podria incluso degradarlo.
- Trazabilidad limitada: el autor es un usuario individual, sin historial de descargas ni validacion de la comunidad.
- El ajuste completo con 3 epocas y lr 1e-4 sobre 54.000 ejemplos puede provocar sobreajuste al estilo de los modelos profesor y reducir la generalidad del modelo.
- No se documenta el contexto efectivo tras el ajuste; asumir 32.768 tokens sin verificacion puede producir fallos en contextos largos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/micdun/code_54k_gpt_oss_20b_qwq_gpt_oss_120b_qwen2_5-1_5b_lr1e-4
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct

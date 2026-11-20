# jersobh/qwen2.5-1.5b-crop-pathology-gguf

## Resumen

`jersobh/qwen2.5-1.5b-crop-pathology-gguf` es un ajuste fino (fine-tuning) del modelo Qwen2.5-1.5B, publicado por el usuario jersobh en Hugging Face y distribuido exclusivamente en formato GGUF, lo que lo hace directamente utilizable con llama.cpp y Ollama. El nombre del repositorio sugiere una especializacion en patologia de cultivos ("crop pathology"), aunque la model card no documenta el corpus de entrenamiento ni el proceso de ajuste mas alla de indicar que se realizo con Unsloth. El modelo cuenta con 1.543.714.304 parametros (aproximadamente 1,5 mil millones) y se distribuye en una unica cuantizacion Q4_K_M dentro de un repositorio de 4,9 GB.

La relevancia de esta publicacion es limitada pero practica: demuestra un flujo de trabajo reproducible de ajuste fino y conversion a GGUF mediante Unsloth, e incluye un Modelfile de Ollama para despliegue inmediato. Es un ejemplo tipico de modelo de dominio vertical de bajo coste computacional, apto para inferencia en CPU o GPU de gama baja.

No obstante, la informacion publicada es muy escasa: no se especifican licencia, idiomas soportados, composicion del dataset, hiperparametros de entrenamiento ni resultados de evaluacion. Cualquier uso en produccion deberia acompanarse de una validacion propia del comportamiento del modelo en la tarea objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5-1.5B) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B soporta 32.768 tokens, pero no se confirma para este ajuste) |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado: `Qwen2.5-1.5B.Q4_K_M.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (conversion via Unsloth); no se publican safetensors del ajuste |
| Tamano del repositorio | 4,9 GB |
| Herramientas de despliegue | llama.cpp (`llama-cli`), Ollama (Modelfile incluido) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Qwen2.5-1.5B, un transformer decoder-only denso con atencion causal estandar y sesgo QKV, ampliamente utilizado como base para ajustes finos por su bajo coste. Sobre esta base se aplico un fine-tuning cuyo proceso exacto no se detalla en la model card: unicamente se indica que el entrenamiento y la conversion a GGUF se realizaron con Unsloth, una libreria que optimiza el ajuste fino mediante kernels personalizados y reduce el uso de memoria en comparacion con implementaciones estandar.

No se especifica el numero de tokens de entrenamiento, la composicion del dataset (se infiere tematica de patologia vegetal por el nombre), si se aplicaron tecnicas de RLHF, DPO o SFT supervisado, ni los hiperparametros empleados. Tampoco se documenta si se modifico la longitud de contexto original del modelo base ni si se aplicaron tecnicas de destilacion o merging. La ausencia de esta informacion impide evaluar la calidad y el alcance real del ajuste.

## Capacidades

- Generacion de texto conversacional en formato chat (la model card incluye la etiqueta `conversational`).
- Ajuste orientado a terminologia y casuistica de patologia de cultivos, segun el nombre del repositorio (no verificado en la model card).
- Compatibilidad con el motor de plantillas Jinja de llama.cpp mediante el flag `--jinja`, lo que permite usar el formato de chat de Qwen2.5.
- Soporte de despliegue en Ollama mediante el Modelfile incluido.
- Capacidades heredadas del modelo base Qwen2.5-1.5B en generacion de texto, razonamiento basico y multilingueismo (no confirmadas para este ajuste concreto).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion proporcionada.

## Casos de uso

- Asistencia a tecnicos agricolas: el modelo puede responder consultas en lenguaje natural sobre sintomas y enfermedades de cultivos, aprovechando el ajuste tematico, en entornos con conectividad limitada gracias a su despliegue local con Ollama o llama.cpp.
- Triaje inicial en aplicaciones de campo: integrado en una app movil o de escritorio que ejecute llama.cpp, puede ofrecer una primera orientacion sobre posibles patologias antes de consultar a un especialista.
- Generacion de fichas divulgativas: redaccion de descripciones breves de enfermedades y tratamientos a partir de notas tecnicas, con revision humana posterior.
- Chatbot de soporte en portales agrarios: conversaciones multi-turno de baja latencia en CPU, adecuado para volumenes moderados de consultas y sin coste de API.
- Prototipado rapido de asistentes verticales: sirve como base para validar flujos de ajuste fino con Unsloth y despliegue GGUF antes de escalar a modelos mayores.
- Educacion y formacion: entorno de practicas para estudiantes de agronomia que necesiten un asistente local sin dependencia de servicios en la nube.
- Filtrado y clasificacion de consultas: preprocesamiento de tickets o mensajes entrantes para enrutarlos a la categoria de patologia correspondiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia con Q4_K_M: aproximadamente 1,2-1,5 GB para los pesos, mas overhead de contexto y runtime; en la practica cabe en GPUs con 2-4 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4 GB (RTX 3050, RTX 4060, GTX 1660, etc.); en GPU de datacenter (A100, H100) el modelo esta infrautilizado pero funciona sin problema.
- Inferencia en CPU: viable y rapida en procesadores modernos con AVX2, dado el reducido tamano del modelo.
- Cabe en GPU consumer: si, en practicamente cualquier GPU dedicada de los ultimos anos; tambien en iGPU con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp (`llama-cli -hf jersobh/qwen2.5-1.5b-crop-pathology-gguf --jinja`), Ollama (Modelfile incluido), y cualquier frontend compatible con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con Inference Endpoints de Hugging Face.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera un throughput alto en GPU y aceptable en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| jersobh/qwen2.5-1.5b-crop-pathology-gguf | 1,54 B | no disponible | GGUF (Q4_K_M) | no disponible | Ajuste vertical en patologia de cultivos; sin benchmarks |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens | safetensors, GGUF | Apache 2.0 | Modelo base oficial, con evaluaciones publicadas y soporte multilingue |
| Qwen/Qwen2.5-1.5B | 1,54 B | 32.768 tokens | safetensors, GGUF | Apache 2.0 | Version base sin instrucciones |
| microsoft/Phi-3-mini-4k-instruct | 3,8 B | 4.096 tokens | safetensors, GGUF | MIT | Alternativa de tamano similar con contexto mas corto |

La comparativa directa con el modelo base Qwen2.5-1.5B-Instruct es la mas relevante: este ajuste hereda su arquitectura y tamano, pero carece de la documentacion, licencia explicita y evaluaciones del original. Para usos generales, el modelo base oficial es la opcion recomendada; este ajuste solo tiene sentido si la especializacion en patologia de cultivos aporta valor demostrable.

## Limitaciones y advertencias

- La model card no especifica licencia, lo que impide confirmar si el uso comercial esta permitido; debe contactarse con el autor o asumirse la licencia del modelo base (Apache 2.0) con cautela.
- No se documenta el dataset de entrenamiento ni el proceso de ajuste, por lo que no es posible evaluar sesgos, cobertura tematica ni riesgo de sobreajuste.
- Riesgo de alucinacion alto en un modelo de 1,5 B ajustado con datos no verificados: puede generar recomendaciones agronomicas incorrectas con aparente seguridad.
- No hay benchmarks publicados que permitan comparar su rendimiento con el modelo base o con alternativas especializadas.
- El contexto maximo no esta confirmado para este ajuste; asumir 32.768 tokens sin verificacion puede provocar errores en produccion.
- Los idiomas soportados no estan documentados; el modelo base es multilingue, pero el ajuste puede haber degradado idiomas distintos del usado en el entrenamiento.
- Un unico archivo de cuantizacion (Q4_K_M) limita el ajuste fino de precision frente a velocidad; no hay versiones Q5, Q8 ni FP16 publicadas.
- El uso en ambito agronomico profesional debe acompanarse de validacion por expertos y no sustituir el diagnostico fitosanitario oficial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jersobh/qwen2.5-1.5b-crop-pathology-gguf
- Unsloth (herramienta de ajuste fino y conversion): https://github.com/unslothai/unsloth
- llama.cpp (runtime de inferencia GGUF): https://github.com/ggml-org/llama.cpp
- Ollama (despliegue local): https://ollama.com
- Modelo base Qwen2.5-1.5B: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct

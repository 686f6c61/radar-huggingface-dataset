# KHALM-LLC/vmr-demo-assistant

## Resumen

VMR demo assistant (KHALM) es un ajuste fino completo (full fine-tuning) del modelo Qwen2.5 0.5B Instruct realizado por KHALM-LLC sobre 200 pares de pregunta y respuesta relativos al estandar Verifiable Model Record (VMR). El repositorio se publica en HuggingFace con el identificador KHALM-LLC/vmr-demo-assistant y pesa aproximadamente 1,0 GB, con 494.032.768 parametros reales en formato safetensors. El propio autor lo describe como un modelo de demostracion, no desplegado y no apto para produccion ni para uso legal.

Se trata, por tanto, de un modelo pequeno dentro de la familia Qwen2 (transformer decoder-only), concebido no como un asistente generalista sino como una pieza de demostracion de un flujo de trabajo concreto: especializar un modelo base de 0,5B en un dominio muy estrecho mediante ajuste fino completo sobre un conjunto de datos minimo.

Su relevancia es principalmente metodologica y divulgativa: sirve como ejemplo reproducible de fine-tuning completo sobre un corpus diminuto, util para estudiar sobreajuste, olvido catastrofico y despliegue en hardware modesto. No dispone de resultados de evaluacion publicados, ni de licencia declarada en la model card, ni de informacion sobre idiomas o cuantizaciones. El pipeline de HuggingFace no esta definido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, segun el tag `qwen2` del repositorio) |
| Parametros totales | 494.032.768 (dato real leido de los pesos safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen2.5-0.5B-Instruct declara 32.768 tokens de contexto |
| Tipos de cuantizacion | No disponible; el repositorio solo publica safetensors (no se listan variantes GGUF, AWQ, GPTQ ni bitsandbytes) |
| Idiomas soportados | No disponible (los 200 pares de entrenamiento se describen en ingles, pero la model card no declara idiomas) |
| Licencia | No declarada para el modelo derivado; la model card indica que el modelo base Qwen2.5 0.5B Instruct es Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 1,0 GB |
| Tag de region | `region:us` |
| Fecha de creacion | 2026-09-16 |
| Ultima actualizacion | 2026-09-16 |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base Qwen2.5 0.5B Instruct, un transformer decoder-only con normalizacion RMSNorm, atencion con sesgo QKV, activacion SwiGLU y embeddings de tokens atados a la capa de salida. El tag `qwen2` del repositorio confirma la familia, y el recuento de 494.032.768 parametros es coherente con la configuracion de 0,5B del modelo original. No se aporta informacion adicional sobre atencion lineal, decodificacion especulativa ni variantes hibridas.

El entrenamiento consiste en un ajuste fino completo, es decir, actualizando la totalidad de los pesos y no mediante adaptadores LoRA o QLoRA, sobre un corpus declarado de 200 pares de pregunta y respuesta acerca del estandar Verifiable Model Record. La model card no especifica el numero de tokens, la composicion del dataset, la mezcla de datos, la existencia de fases de RLHF o DPO, ni hiperparametros de entrenamiento (learning rate, epocas, longitud de secuencia). Tampoco se documenta ninguna innovacion tecnica asociada al proceso. El resultado es un modelo base de proposito general desplazado hacia un dominio muy estrecho, con el riesgo de olvido catastrofico que implica ajustar la totalidad de los pesos sobre un corpus tan reducido.

## Capacidades

- Generacion de texto en ingles sobre el dominio del estandar Verifiable Model Record, presumiblemente en formato de respuesta a preguntas.
- Respuesta a consultas de tipo pregunta-respuesta similares a las plantillas de las 200 muestras de entrenamiento.
- Capacidades residuales de razonamiento, codigo y matematicas heredadas del modelo base Qwen2.5 0.5B Instruct, previsiblemente degradadas tras el ajuste fino completo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada (el modelo base lo soporta, pero no hay confirmacion de que se conserve).
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documentan capacidades de este tipo.
- Capacidades multilingues: no disponibles; la model card no declara idiomas y el corpus de ajuste se describe en ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles. No se menciona ninguna.
- El autor declara explicitamente que el modelo no esta desplegado y que no debe usarse en produccion ni con fines legales.

## Casos de uso

- Demostracion tecnica de fine-tuning completo: sirve como referencia reproducible para mostrar como se especializa un modelo de 0,5B ajustando todos sus pesos sobre 200 ejemplos, util en talleres, cursos y articulos tecnicos.
- Prototipo de asistente documental sobre el estandar VMR: permite validar rapidamente el formato de respuesta y el tono antes de invertir en un corpus mayor o en un modelo de mayor tamano.
- Estudio de olvido catastrofico: al ser un ajuste completo sobre un corpus minimo, es un caso de laboratorio adecuado para medir la perdida de capacidades generales respecto al Qwen2.5 0.5B Instruct original.
- Linea base en experimentos de RAG: puede integrarse como generador en un pipeline de recuperacion sobre documentacion VMR para comprobar si el contexto recuperado compensa la estrechez del ajuste.
- Pruebas de despliegue en hardware minimo: con menos de 500 millones de parametros cabe en CPU, iGPU y dispositivos de borde, lo que permite ensayar cuantizacion, latencia y consumo sin infraestructura dedicada.
- Evaluacion de tecnicas de alineacion y formato: sirve para probar plantillas de chat, prompts de sistema y estrategias de evaluacion automatica en un modelo cuyo comportamiento es facil de caracterizar.
- Prueba de concepto de asistente conversacional de bajo coste: adecuado para validar una interfaz de chat extremo a extremo con un modelo que se ejecuta en un portatil, sin pretension de calidad en produccion.
- Docencia sobre riesgos de publicacion: el repositorio, sin licencia declarada ni evaluaciones, es un ejemplo practico de los problemas de gobernanza que el propio estandar Verifiable Model Record pretende abordar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye metricas de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion, ni tampoco comparaciones cuantitativas con el modelo base. No se dispone de datos de perplexity sobre el corpus de ajuste ni de tasas de acierto en el dominio VMR.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16 o bf16, aproximadamente 1,0 GB solo para los pesos (494 M x 2 bytes), mas la cache KV; en int8, en torno a 0,5 GB; en una cuantizacion de 4 bits, aproximadamente 0,3-0,4 GB.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente. Se puede ejecutar con holgura en RTX 3060, RTX 4060, RTX 4090, A100, H100 y similares; las GPU de gama alta quedan muy sobredimensionadas.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas de los ultimos diez anos, asi como en iGPU modernas (Apple Silicon, Intel Iris Xe, AMD APU) y en CPU con suficiente RAM del sistema.
- Opciones de despliegue: transformers con PyTorch, vLLM, HuggingFace TGI, llama.cpp y Ollama (estos dos ultimos requieren convertir previamente los safetensors a GGUF, ya que el repositorio no publica pesos cuantizados), y servidores ligeros tipo FastAPI con plantillas de chat de Qwen2.5.
- Latencia y throughput estimados: no disponibles como medicion publicada. Por tamano, en una GPU moderna se puede esperar un throughput alto (del orden de cientos a miles de tokens por segundo) y en CPU del orden de decenas de tokens por segundo; son estimaciones basadas en el numero de parametros, no resultados medidos sobre este modelo.
- Nota: el modelo base Qwen2.5-0.5B-Instruct declara soporte de contexto de 32.768 tokens, lo que incrementa el coste de cache KV con contextos largos; aun asi, el consumo se mantiene en el rango de pocos gigabytes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| KHALM-LLC/vmr-demo-assistant | 494.032.768 | No disponible en su model card (el base declara 32.768) | No declarada; base Apache 2.0 | HuggingFace, solo safetensors | Ajuste completo sobre 200 pares de Q&A de dominio VMR; sin benchmarks |
| Qwen2.5-0.5B-Instruct | 0,49 B aprox. | 32.768 tokens (segun su documentacion publica) | Apache 2.0 | HuggingFace, safetensors y GGUF | Modelo base generalista, con datos de evaluacion publicados; alternativa directa si se necesita uso general |
| SmolLM2-360M-Instruct | 0,36 B aprox. | 8.192 tokens (segun su documentacion publica) | Apache 2.0 | HuggingFace | Alternativa mas ligera, orientada a dispositivos de borde, con informacion de rendimiento publicada |
| TinyLlama-1.1B-Chat | 1,1 B aprox. | 2.048 tokens (segun su documentacion publica) | Apache 2.0 | HuggingFace | Mas parametros y mas contexto que el modelo base, pero ventana menor; util como referencia de la categoria sub-2B |

Los datos de las alternativas proceden de sus fichas y documentacion publicas y pueden variar; no se han verificado contra este modelo, que carece de evaluaciones publicadas.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. La model card no documenta analisis de sesgo ni la composicion del corpus de ajuste.
- Riesgo de alucinacion elevado: con solo 200 ejemplos de entrenamiento y un ajuste completo de todos los pesos, es esperable que el modelo genere contenido plausible pero incorrecto sobre el estandar VMR, especialmente fuera de las plantillas vistas.
- Sobreajuste: un corpus de 200 pares es extremadamente reducido para un ajuste fino completo, lo que favorece la memorizacion literal y la degradacion ante formulaciones distintas a las del entrenamiento.
- Olvido catastrofico: al actualizar la totalidad de los pesos, es probable la perdida de capacidades generales del Qwen2.5 0.5B Instruct, incluidas generacion de codigo, matematicas y seguimiento de instrucciones complejas.
- Limitaciones de contexto e idioma: no se declara la ventana de contexto efectiva tras el ajuste ni los idiomas soportados; el corpus se describe en ingles, por lo que el rendimiento en castellano es incierto.
- Restricciones de licencia: la model card no declara licencia para el modelo derivado. Aunque el modelo base sea Apache 2.0, la ausencia de licencia explicita impide asumir permisos de uso comercial; conviene contactar con KHALM-LLC antes de cualquier utilizacion.
- Advertencia explicita del autor: no desplegado y no apto para produccion ni para uso legal. Cualquier aplicacion en esos ambitos queda fuera del proposito declarado del modelo.
- Ausencia de evaluaciones: sin benchmarks, sin modelo de evaluacion de riesgos y sin pruebas de red teaming publicadas, no hay evidencia empirica de su comportamiento.
- Gobernanza: el repositorio no incluye informacion sobre el dataset, los hiperparametros ni el proceso de entrenamiento, lo que dificulta la reproducibilidad.
- Busqueda web: los resultados recuperados durante la busqueda no guardan relacion con el modelo (corresponden a sitios comerciales de logistica COD); no aportan informacion adicional verificable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KHALM-LLC/vmr-demo-assistant
- Modelo base Qwen2.5-0.5B-Instruct (referencia declarada en la model card): https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Otros enlaces (paper, blog, repositorio de codigo, demo): no disponibles en la informacion proporcionada.
- Los resultados de busqueda web obtenidos no contienen enlaces relevantes al modelo ni al estandar Verifiable Model Record.

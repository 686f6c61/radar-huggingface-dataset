# midris/Llama-3.2-3B-Legal-SFT

## Resumen

midris/Llama-3.2-3B-Legal-SFT es un ajuste fino (SFT) del modelo unsloth/Llama-3.2-3B-Instruct-bnb-4bit, publicado por el usuario midris en HuggingFace. Se trata de un modelo denso de 3.212.749.824 parametros (3,21 mil millones) orientado a generacion de texto en el dominio legal, partiendo de la arquitectura Llama 3.2 en su variante de 3B. El repositorio ocupa 6,4 GB y se distribuye bajo licencia Apache 2.0.

El modelo se ha entrenado con Unsloth y la libreria TRL de HuggingFace, un flujo habitual para ajustes finos eficientes con QLoRA sobre una base cuantizada en 4 bits. La model card es minima: no documenta el dataset de entrenamiento, el numero de tokens, la composicion de los datos legales ni el proceso de alineamiento posterior. Tampoco se publican resultados de benchmarks.

Su relevancia es limitada y muy acotada: es un experimento de ajuste fino de bajo coste sobre un modelo pequeno, con 169 descargas y 0 likes en el momento de la consulta. Resulta util como referencia para quien quiera replicar un pipeline de SFT con Unsloth sobre Llama 3.2 3B, pero no como modelo de produccion sin una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Llama 3.2 (detalle no especificado en la model card) |
| Parametros totales | 3.212.749.824 (3,21 mil millones) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No indicada en la model card. El modelo base Llama 3.2 3B Instruct soporta hasta 128.000 tokens segun su documentacion oficial |
| Tipos de cuantizacion | Pesos publicados en safetensors (fp16/bf16). El ajuste se realizo sobre una base cuantizada en 4 bits (bitsandbytes). No se publican versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | en (ingles), segun la model card |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers); repositorio de 6,4 GB |
| Modelo base | unsloth/Llama-3.2-3B-Instruct-bnb-4bit |
| Libreria | transformers |
| Pipeline | text-generation |
| Etiquetas | transformers, safetensors, llama, text-generation, text-generation-inference, unsloth, conversational, endpoints_compatible |
| Descargas / likes | 169 / 0 |
| Fecha de creacion | 2026-09-20 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.2 en su variante de 3B: un transformer decoder-only denso con atencion por grupos (GQA), vocabulario de 128.256 tokens y entrenamiento previo sobre corpus multilingues. El modelo del que parte este ajuste es una version del Instruct de 3B cuantizada en 4 bits con bitsandbytes, por lo que el punto de partida ya incorpora una perdida de precision respecto a los pesos originales en bf16.

El entrenamiento se ha realizado con Unsloth y la libreria TRL, segun indica la propia model card, una combinacion que reduce el uso de memoria y acelera el ajuste fino supervisado. No se especifican el numero de tokens de entrenamiento, la composicion del dataset legal, la longitud de secuencia usada, los hiperparametros (learning rate, epocas, rango LoRA) ni si hubo una fase posterior de DPO o RLHF. Tampoco se indica si el adaptador se ha fusionado con los pesos base, aunque el tamano del repositorio (6,4 GB, coherente con 3,21 mil millones de parametros en fp16) sugiere que los pesos publicados estan fusionados y en precision completa.

No se documenta ninguna innovacion tecnica adicional: no hay decodificacion especulativa, atencion lineal ni mecanismos híbridos. La unica particularidad es el ajuste de dominio legal, cuya naturaleza y calidad no pueden evaluarse con la informacion disponible.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del Instruct base de Llama 3.2 3B.
- Respuesta a instrucciones y mantenimiento de dialogos multi-turno.
- Generacion y transformacion de texto de dominio legal (la model card no detalla tareas concretas).
- Razonamiento basico y calculo sencillo, limitado por el tamano del modelo (3,21 mil millones de parametros).
- Capacidad de codigo muy limitada en comparacion con modelos de mayor tamano, aunque el Instruct base tiene nociones basicas.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible. El Instruct base de Llama 3.2 si lo soporta, pero no hay evidencia de que el ajuste lo preserve.
- Soporte de agentes y razonamiento multi-paso: no confirmado ni evaluado.
- Capacidades multilingues: la model card declara unicamente ingles. El modelo base tiene cierto multilingüismo residual, pero el ajuste se ha hecho solo en ingles.
- Capacidades especiales (modo thinking, vision, audio): ninguna. Es un modelo exclusivamente de texto.
- Longitud de contexto: no verificada tras el ajuste. El Instruct base soporta hasta 128.000 tokens, pero el entrenamiento en 4 bits y el SFT pueden haber degradado el rendimiento en contextos largos.

## Casos de uso

- Revision de borradores de contratos: el modelo puede resumir clausulas y senalar ambiguedades en textos en ingles, aprovechando su ajuste en dominio legal. Requiere revision humana obligatoria.
- Extraccion de informacion de documentos juridicos: identificacion de partes, fechas, obligaciones y plazos en contratos o escritos, integrándose en un pipeline de procesamiento por lotes.
- Resumen de sentencias o expedientes: condensacion de documentos largos en ingles; conviene validar la calidad real en contextos superiores a unos miles de tokens, ya que no hay evaluacion publicada.
- Asistente interno de consulta sobre normativa: chatbot de uso interno sobre una base documental propia (RAG), donde el modelo redacta la respuesta final a partir de fragmentos recuperados.
- Generacion de plantillas y primeros borradores: produccion de borradores de clausulas o cartas legales estandarizadas que un profesional revisa y ajusta despues.
- Clasificacion y etiquetado de textos legales: categorizacion de consultas o documentos por area (laboral, mercantil, civil) dentro de un flujo automatizado.
- Prototipado e investigacion de SFT: sirve como caso de referencia para reproducir un pipeline de ajuste con Unsloth y TRL sobre Llama 3.2 3B en una unica GPU.
- Despliegue en entornos con recursos muy limitados: al ser un modelo de 3,21 mil millones de parametros, puede ejecutarse en GPUs de consumo e incluso en CPU con cuantizacion, para tareas de bajo volumen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna evaluacion (MMLU, HumanEval, GSM8K, tareas legales como LexGLUE o LegalBench) ni comparacion con el modelo base. No es posible, por tanto, determinar si el ajuste mejora, mantiene o degrada las capacidades del Instruct original.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: unos 6,4 GB solo para los pesos, mas el cache KV y activaciones. Presupuesto practico de 8-10 GB a contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 3,5-4 GB para los pesos, mas cache KV.
- VRAM estimada en cuantizacion de 4 bits (previa conversion a GGUF/AWQ): aproximadamente 2-2,5 GB para los pesos, mas cache KV.
- Cache KV: con la configuracion del modelo base, el coste por token en fp16 es del orden de 0,1 MB, lo que supone varios GB adicionales si se trabaja cerca de los 128.000 tokens. Es una estimacion a partir de la arquitectura del modelo base, no un dato publicado para este ajuste.
- GPUs recomendadas: NVIDIA A100 40 GB, H100, L40S o RTX 6000 Ada para servir varias peticiones concurrentes; RTX 4090 24 GB para desarrollo e inferencia en fp16 con margen amplio.
- GPU de consumo: si cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090 en fp16. En 4 u 8 bits entra en GPUs de 6-8 GB, como RTX 3060 12 GB (con margen), RTX 2060 6 GB o GTX 1660 6 GB con limitaciones de rendimiento.
- Opciones de despliegue: transformers, vLLM y TGI (la etiqueta text-generation-inference del repositorio sugiere compatibilidad). llama.cpp y Ollama son viables, pero requieren convertir previamente los safetensors a GGUF, ya que el repositorio no incluye ficheros GGUF.
- Latencia y throughput: no disponibles. Como referencia orientativa y no medida para este ajuste, un modelo denso de 3,2 mil millones de parametros en fp16 sobre una RTX 4090 suele moverse en decenas a algo mas de un centenar de tokens por segundo en generacion de un unico flujo, con vLLM y mayor rendimiento agregado por batching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| midris/Llama-3.2-3B-Legal-SFT | 3,21 mil millones | No documentado (base: 128.000 tokens) | Apache 2.0 | HuggingFace, safetensors | Ajuste legal en ingles, sin benchmarks, 169 descargas |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 mil millones | 128.000 tokens | Llama 3.2 Community License | HuggingFace, safetensors | Modelo base oficial, alineado con RLHF, soporta tool calling |
| Qwen2.5-3B-Instruct | 3,09 mil millones | 32.768 tokens nativos (ampliable con YaRN) | Apache 2.0 | HuggingFace, safetensors, GGUF | Alternativa multilingue con buen rendimiento en codigo y matematicas |
| Phi-3.5-mini-instruct | 3,8 mil millones | 128.000 tokens | MIT | HuggingFace, safetensors, GGUF | Orientado a razonamiento y codigo, con contexto largo |

No se dispone de datos de benchmarks de este ajuste que permitan una comparacion cuantitativa con las alternativas anteriores; la tabla se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al ser un ajuste sobre Llama 3.2, hereda los sesgos del corpus de preentrenamiento original, no mitigados ni evaluados en esta version.
- Riesgo de alucinacion: alto para un modelo de 3,21 mil millones de parametros en dominio legal, donde la precision factual es critica. Puede inventar referencias normativas, jurisprudencia o plazos.
- No es asesoramiento juridico: las salidas deben revisarse siempre por un profesional cualificado antes de cualquier uso real.
- Idiomas: solo se declara ingles. No se ha evaluado el comportamiento en castellano ni en otras lenguas; el uso en espanol no esta respaldado por la model card.
- Contexto: aunque el modelo base soporte hasta 128.000 tokens, no hay evidencia de que el ajuste conserve esa capacidad. El entrenamiento sobre una base cuantizada en 4 bits puede degradar la fidelidad de los pesos.
- Licencia: Apache 2.0, sin restricciones de uso comercial anadidas por el autor. Sin embargo, conviene verificar la licencia del modelo base (Llama 3.2 Community License) y de la version cuantizada de Unsloth, ya que las obligaciones de atribucion y las condiciones de uso de Llama pueden seguir aplicando.
- Documentacion insuficiente: no se detallan dataset, hiperparametros, numero de tokens ni proceso de evaluacion, lo que impide reproducir el entrenamiento o valorar su calidad.
- Adopcion muy baja: 169 descargas y 0 likes, sin issues ni discusion publica, lo que reduce la probabilidad de detectar y corregir problemas.
- Fecha de publicacion inusual (2026-09-20) en los metadatos del repositorio; conviene verificar la vigencia y el estado real del modelo antes de integrarlo.
- No se ha publicado ninguna version cuantizada (GGUF, AWQ, GPTQ), por lo que el despliegue en entornos de bajos recursos exige una conversion previa y su propia validacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/midris/Llama-3.2-3B-Legal-SFT
- Modelo base: https://huggingface.co/unsloth/Llama-3.2-3B-Instruct-bnb-4bit
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de HuggingFace: https://github.com/huggingface/trl
- Documentacion de Llama 3.2: https://www.llama.com/models/llama-3/
- Resultados de busqueda web: los enlaces devueltos corresponden a paginas de ChatGPT y no guardan relacion con el modelo, por lo que no se incluyen como referencias relevantes.

# fbaldassarri/allenai_OLMo-2-1124-13B-Instruct-auto_round-int4-gs64-sym

## Resumen

Este repositorio contiene una version cuantizada a INT4 del modelo OLMo 2 1124 13B Instruct, desarrollado originalmente por el Allen Institute for AI (AI2). La cuantizacion la ha realizado el usuario fbaldassarri mediante Intel AutoRound v0.16.1, aplicando una cuantizacion de solo pesos (WoQ) con el algoritmo SignRound, 4 bits, tamano de grupo 64 y esquema simetrico. El objetivo es reducir el coste de memoria y acelerar la inferencia (el autor declara entre 2 y 3 veces de speedup) manteniendo un comportamiento conversacional utilizable.

El modelo base OLMo 2 1124 13B Instruct es un transformer causal de tipo decoder-only, disenado para generacion de texto e instrucciones, con licencia Apache 2.0. Esta version cuantizada esta pensada especificamente para ejecucion en hardware Intel: CPU mediante intel-extension-for-pytorch, iGPU Arc y NPU (AI Boost de la serie Core Ultra) mediante OpenVINO. Es relevante para desarrolladores que quieran desplegar un modelo conversacional de tamano medio en equipos sin GPU dedicada NVIDIA.

Conviene senalar una discrepancia importante: la model card y los metadatos identifican el modelo base como OLMo-2-1124-13B-Instruct, pero el recuento real de parametros del safetensors es de 2.837.427.200 (unos 2,84 mil millones), no 13 mil millones. Esta ficha documenta ambos datos y advierte sobre esta inconsistencia en la seccion de limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (model_type: olmo2) |
| Parametros totales | 2.837.427.200 segun safetensors (el nombre y la model card indican 13B; discrepancia no resuelta) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | INT4, solo pesos (WoQ), grupo 64, simetrica, algoritmo AutoRound/SignRound |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato auto_round), cargable con transformers |

## Arquitectura y entrenamiento

El modelo base es un transformer causal decoder-only de la familia OLMo 2 de AI2, identificado en los metadatos con model_type `olmo2`. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF/DPO) del modelo original.

La intervencion realizada en este repositorio es exclusivamente de cuantizacion. Se aplico Intel AutoRound 0.16.1 con carga en `torch.bfloat16`, calibracion en CPU con 64 muestras, 200 iteraciones de ajuste, longitud de secuencia 256 y batch size 2. El proceso completo duro 22.328,2 segundos (unas 372 minutos). El resultado es una representacion INT4 con grupo de 64 y simetria, orientada a pesos unicamente (weights-only quantization), lo que implica que las activaciones no se cuantizan. El autor indica una ligera perdida de precision en la configuracion W4G64.

## Capacidades

- Generacion de texto conversacional e instrucciones en ingles, usando la plantilla de chat integrada del modelo.
- Razonamiento general y respuesta a preguntas de tipo instruct (capacidades heredadas del modelo base OLMo 2 Instruct).
- Generacion de codigo y matematicas: no confirmado explicitamente en la informacion disponible, aunque es esperable en un modelo instruct de esta familia; debe validarse empiricamente.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Asistente conversacional local en equipos Intel: el modelo puede desplegarse en CPU, iGPU Arc o NPU de la serie Core Ultra mediante intel-extension-for-pytorch u OpenVINO, permitiendo un chatbot de instrucciones sin GPU dedicada.
- Prototipado de aplicaciones de chat en portatiles: gracias a la cuantizacion INT4 y al formato auto_round, se puede cargar con transformers en entornos con memoria limitada para validar flujos conversacionales antes de escalar a un modelo mayor.
- Evaluacion de pipelines de cuantizacion: sirve como artefacto de referencia para reproducir el proceso de AutoRound (parametros exactos documentados) y comparar la degradacion de calidad frente al modelo en bfloat16.
- Generacion de texto asistida en ingles: redaccion, resumen y reformulacion de contenido en ingles en herramientas de escritorio con aceleracion Intel.
- Inferencia en el borde (edge) con OpenVINO: despliegue en dispositivos con NPU AI Boost para tareas de generacion de texto de baja latencia y sin conexion.
- Base para ajuste fino o experimentacion academica: al tener licencia Apache 2.0, puede usarse como punto de partida en investigacion sobre modelos cuantizados y su comportamiento conversacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente declara un speedup de 2 a 3 veces y una ligera caida de precision en W4G64, sin cifras concretas de MMLU, HumanEval, GSM8K ni otras metricas.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 11,0 GB en INT4; para inferencia se requiere espacio suficiente para pesos mas overhead de activaciones y KV cache. Con 2,84 mil millones de parametros reales, la huella es notablemente menor que la sugerida por el nombre "13B".
- GPU recomendadas: el autor orienta el artefacto a CPU Intel, iGPU Intel Arc e NPU Intel (Core Ultra con AI Boost). No se documenta soporte verificado en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: no confirmado en la informacion disponible; el foco declarado es hardware Intel, no NVIDIA consumer.
- Opciones de despliegue: transformers (ejemplo incluido en la model card), intel-extension-for-pytorch (CPU/iGPU), OpenVINO (NPU). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se proporcionan cifras absolutas; solo la afirmacion cualitativa de 2-3x de speedup frente al modelo sin cuantizar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Enfoque |
|---|---|---|---|---|---|
| Este modelo (OLMo-2-1124-13B-Instruct INT4) | 2,84B reales (nombre 13B) | no disponible | INT4 WoQ AutoRound | Apache 2.0 | Inferencia Intel CPU/iGPU/NPU |
| allenai/OLMo-2-1124-13B-Instruct | 13B (segun denominacion) | no disponible | bfloat16 original | Apache 2.0 | Modelo base sin cuantizar |
| Otras cuantizaciones INT4 del mismo base (GPTQ/AWQ) | 13B (segun denominacion) | no disponible | INT4 GPTQ/AWQ | Apache 2.0 | Inferencia GPU NVIDIA |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Discrepancia critica de parametros: el safetensors declara 2.837.427.200 parametros, mientras que el nombre del repositorio y la model card indican 13B. Debe verificarse el contenido real antes de usar el modelo en produccion.
- Perdida de precision por cuantizacion: el autor reconoce una ligera caida de accuracy en W4G64; no se cuantifica su magnitud.
- Solo ingles: el campo `language` limita el modelo a en; no es adecuado para castellano sin evaluacion adicional.
- Riesgo de alucinacion: inherente a los modelos generativos; no se documentan mitigaciones especificas.
- Sesgos: no se documenta ninguna evaluacion de sesgos en la informacion disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor declara que el artefacto se desarrollo solo con fines de investigacion y sin garantia.
- Soporte de hardware limitado: el artefacto esta optimizado para Intel (CPU/iGPU/NPU); el rendimiento en otras plataformas no esta verificado.
- Metadatos contradictorios: el campo `inference: false` en la model card choca con el ejemplo de uso incluido; conviene validar la carga real con transformers.
- Reproducibilidad dependiente de herramientas externas: la receta de replicacion referencia un repositorio en `git.epicdynamic.com`, no en GitHub, lo que dificulta su verificacion publica.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fbaldassarri/allenai_OLMo-2-1124-13B-Instruct-auto_round-int4-gs64-sym
- Modelo base: https://huggingface.co/allenai/OLMo-2-1124-13B-Instruct
- Intel AutoRound (GitHub): https://github.com/intel/auto-round
- Pipeline de cuantizacion referenciado: https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/

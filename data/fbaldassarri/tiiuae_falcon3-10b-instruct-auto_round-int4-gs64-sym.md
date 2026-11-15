# fbaldassarri/tiiuae_Falcon3-10B-Instruct-auto_round-int4-gs64-sym

## Resumen

Esta ficha describe una cuantizacion INT4 del modelo Falcon3-10B-Instruct, desarrollado originalmente por el Technology Innovation Institute (TII) de Abu Dabi y publicado bajo licencia Apache 2.0. El artefacto ha sido generado por el usuario fbaldassarri mediante Intel AutoRound v0.16.1, aplicando cuantizacion weights-only (WoQ) con el algoritmo SignRound en modo simetrico, 4 bits y tamano de grupo 64. El objetivo es reducir el peso del modelo para permitir inferencia en CPU Intel, iGPU Arc y NPU (AI Boost) mediante intel-extension-for-pytorch y OpenVINO, manteniendo una calidad cercana al modelo original en bfloat16.

El modelo base Falcon3-10B-Instruct es un transformer causal de tipo Llama, orientado a generacion de texto conversacional e instrucciones, con licencia permisiva y entrenamiento sobre datos en ingles. Esta version cuantizada declara 2.160.061.440 parametros en el checkpoint safetensors (correspondientes a los pesos empaquetados en INT4 del modelo de 10B), un tamano de repositorio de 8,3 GB y un pipeline de text-generation. La model card indica explicitamente que la inferencia integrada (`inference: false`) no esta soportada de forma nativa y recomienda usar el chat template del tokenizador.

La relevancia de esta ficha es doble: por un lado, documenta una receta reproducible de cuantizacion WoQ con AutoRound (incluyendo versiones exactas de software, hiperparametros de calibracion y tiempo de ejecucion); por otro, advierte de que se trata de un artefacto de investigacion sin garantias, con cero descargas y cero likes en el momento de la consulta, lo que desaconseja su uso en produccion sin una evaluacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (model_type: llama) |
| Parametros totales | 2.160.061.440 (pesos empaquetados INT4 del modelo de 10B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | INT4 weights-only (WoQ), group size 64, simetrica, algoritmo SignRound (AutoRound) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato auto_round), compatible con transformers |

## Arquitectura y entrenamiento

El modelo base es un transformer causal denso (no MoE) de la familia Falcon3, con `model_type: llama` en la configuracion. No se dispone en la informacion proporcionada de detalles sobre el numero exacto de capas, dimensiones ocultas, cabezas de atencion ni sobre el volumen de tokens de entrenamiento, la composicion del dataset o si se aplicaron tecnicas de RLHF, DPO o similar. Tampoco se documentan innovaciones de atencion (atencion lineal, decodificacion especulativa) en la model card consultada.

La innovacion tecnica de este artefacto reside en la cuantizacion: Intel AutoRound v0.16.1 aplica SignRound, un metodo de optimizacion de pesos por capas que ajusta los parametros cuantizados para minimizar el error de reconstruccion. La calibracion se realizo en CPU con `torch.bfloat16`, 128 muestras, 200 iteraciones, longitud de secuencia 512 y batch size 4, empleando transformers 4.55.3 y torch 2.15.0+cpu. El proceso completo duro 51.572,6 segundos (unas 859,5 minutos). El autor declara una aceleracion de 2-3x con una ligera perdida de precision en W4G64.

## Capacidades

- Generacion de texto conversacional e instrucciones en ingles, usando el chat template integrado del tokenizador.
- Razonamiento y respuesta a instrucciones multi-turno, heredado del modelo base Falcon3-10B-Instruct.
- Generacion de codigo y matematicas: capacidades propias del modelo base, no verificadas de forma independiente en esta cuantizacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada para esta version cuantizada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta `language: en`.
- Capacidades especiales (vision, audio, thinking mode): no disponibles; el pipeline declarado es exclusivamente text-generation.
- Inferencia optimizada en hardware Intel: CPU via intel-extension-for-pytorch, iGPU Arc y NPU AI Boost via OpenVINO.

## Casos de uso

- Despliegue en estaciones de trabajo sin GPU dedicada: el checkpoint INT4 con group size 64 reduce el peso a 8,3 GB, lo que permite ejecutar un modelo de 10B en CPU Intel con intel-extension-for-pytorch, algo inviable con el modelo en bfloat16.
- Prototipado en portatiles con Intel Core Ultra: la ruta OpenVINO sobre NPU AI Boost permite probar asistentes conversacionales en ingles sin depender de la nube, con un consumo energetico contenido.
- Evaluacion de tecnicas de cuantizacion: el repositorio incluye la receta exacta (version de AutoRound, hiperparametros, duracion), lo que lo convierte en un caso de referencia para reproducir experimentos WoQ y comparar W4G64 frente a bfloat16.
- Generacion de codigo en entornos de desarrollo locales: al ser un modelo instruct en ingles, puede usarse como asistente de autocompletado o explicacion de fragmentos, siempre que se valide la calidad tras la cuantizacion.
- Fine-tuning ligero o adaptacion con LoRA sobre la base cuantizada: util para experimentar con adaptadores de bajo rango en hardware Intel, aunque requiere verificar la compatibilidad de la cadena de herramientas.
- Investigacion academica sobre degradacion por cuantizacion: permite medir la caida de precision en tareas de razonamiento y generacion respecto al Falcon3-10B-Instruct original, usando el mismo tokenizador y chat template.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente declara una aceleracion de 2-3x y una "ligera perdida de precision" en W4G64, sin cifras concretas de MMLU, HumanEval, GSM8K ni comparaciones numericas con el modelo en bfloat16.

## Requisitos de hardware

- VRAM/espacio estimado: el repositorio ocupa 8,3 GB en safetensors INT4; en memoria, el modelo requiere aproximadamente esa cifra mas overhead de activaciones y cache KV, que depende de la longitud de contexto (no documentada).
- GPU recomendadas: no se especifican en la model card; el artefacto esta orientado a CPU Intel, iGPU Arc y NPU AI Boost.
- GPU de consumo: no se confirma compatibilidad con RTX 4090 u otras GPU NVIDIA; el autor menciona opciones `--cuda` y `--rocm` solo para el pipeline de cuantizacion, no para la inferencia del artefacto.
- Opciones de despliegue: transformers con `device_map="auto"`, intel-extension-for-pytorch (CPU), OpenVINO (iGPU/NPU). No se mencionan vLLM, llama.cpp, Ollama ni TGI, aunque el tag `text-generation-inference` aparece en los metadatos.
- Latencia y throughput: no disponibles; solo la estimacion cualitativa de 2-3x de aceleracion frente al modelo sin cuantizar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fbaldassarri/tiiuae_Falcon3-10B-Instruct-auto_round-int4-gs64-sym | 10B (2,16B empaquetados INT4) | no disponible | INT4 WoQ, gs64, simetrica | Apache 2.0 | Hugging Face, 0 descargas |
| tiiuae/Falcon3-10B-Instruct | 10B | no disponible en esta ficha | bfloat16 original | Apache 2.0 | Hugging Face (oficial TII) |
| Otras cuantizaciones INT4 de Falcon3-10B-Instruct (GPTQ, AWQ, GGUF) | 10B | depende del artefacto | INT4 alternativas | Apache 2.0 | no verificado en la informacion proporcionada |

La comparacion cuantitativa de rendimiento entre estas variantes no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto de investigacion: el autor declara explicitamente que se distribuye sin garantia y solo con fines de investigacion.
- Cero adopcion verificable: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validacion por terceros.
- Perdida de precision no cuantificada: la model card reconoce una "ligera caida de precision" en W4G64, pero no aporta metricas que permitan acotarla.
- Riesgo de alucinacion: inherente al modelo base y potencialmente agravado por la cuantizacion; no se documentan evaluaciones de fidelidad.
- Limitacion idiomatica: solo ingles (`language: en`); no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Contexto no documentado: se desconoce la longitud maxima de contexto soportada por esta version cuantizada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor limita el artefacto a investigacion en su disclaimer; conviene revisar ambas condiciones antes de un despliegue productivo.
- Compatibilidad de inferencia: la model card marca `inference: false`, por lo que no se garantiza el funcionamiento con pipelines estandar sin ajustes.
- Dependencia de hardware Intel: las optimizaciones declaradas estan ligadas a intel-extension-for-pytorch y OpenVINO; en otros backends el rendimiento puede degradarse.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-10B-Instruct-auto_round-int4-gs64-sym
- Modelo base: https://huggingface.co/tiiuae/Falcon3-10B-Instruct
- Intel AutoRound (repositorio): https://github.com/intel/auto-round
- Pipeline de cuantizacion: https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
- Paper o blog de Falcon3: no disponible en la informacion proporcionada.
- Demo o espacio asociado: no disponible en la informacion proporcionada.

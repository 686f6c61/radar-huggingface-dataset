# fbaldassarri/sapienzanlp_Minerva-7B-base-v1.0-auto_gptq-int8-gs64-sym

## Resumen

Minerva-7B-base-v1.0 es un modelo de lenguaje causal de tipo transformer con arquitectura Mistral, desarrollado originalmente por el grupo SapienzaNLP de la Universidad de La Sapienza (Roma) y especializado en italiano e inglés. Esta ficha describe la versión cuantizada publicada por el usuario fbaldassarri, que aplica cuantización de solo pesos (WoQ) mediante el algoritmo GPTQ implementado en Intel AutoRound v0.16.0, reduciendo los pesos a INT8 con tamaño de grupo 64 y cuantización simétrica.

El artefacto está pensado para inferencia en hardware Intel: CPU, iGPU Arc (vía intel-extension-for-pytorch) y NPU AI Boost de la serie Core Ultra (vía OpenVINO). Se trata de un modelo base, no ajustado por instrucciones, por lo que debe usarse con prompts de texto sin formato conversacional.

Es relevante para quienes necesitan desplegar un modelo de 7B en entornos Intel con requisitos de memoria reducidos, manteniendo la licencia Apache 2.0 del modelo original. El repositorio tiene un tamaño de 9 GB y registra 18 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (model_type: mistral) |
| Parametros totales | 2.302.087.168 (según safetensors del repo cuantizado; el modelo base se denomina 7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | INT8, group size 64, simétrica, GPTQ (AutoGPTQ), WoQ |
| Idiomas soportados | Italiano (it), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers), configuración GPTQ |
| Método de cuantización | Intel AutoRound v0.16.0, algoritmo AutoGPTQ |
| Calibración | 128 muestras, 200 iteraciones, seqlen 512, batch 4, device CPU |
| Duración de cuantización | 40.017,2 s (667,0 min) |
| Precisión de carga | torch.bfloat16 |
| Versiones registradas | auto-round 0.16.0, transformers 4.55.3, torch 2.14.1+cpu |

## Arquitectura y entrenamiento

El modelo base Minerva-7B-base-v1.0 emplea una arquitectura transformer causal de tipo Mistral, orientada a generación de texto y modelado de lenguaje. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO; estos datos corresponden al modelo original y no se documentan en la model card de la versión cuantizada.

La innovación técnica de esta publicación es exclusivamente la cuantización: se aplica cuantización de solo pesos (weights-only quantization) con el algoritmo GPTQ mediante Intel AutoRound, en precisión INT8, con tamaño de grupo 64 y esquema simétrico. El proceso de calibración se ejecutó en CPU con precisión bfloat16, 128 muestras de calibración, 200 iteraciones de ajuste, longitud de secuencia 512 y batch de 4, durante aproximadamente 667 minutos. El resultado se exporta en formato auto_gptq para su uso con transformers y está optimizado para inferencia en CPU Intel, iGPU Arc y NPU de la serie Core Ultra.

## Capacidades

- Generación de texto autoregresiva en italiano e inglés, al ser un modelo base sin ajuste por instrucciones.
- Modelado de lenguaje y continuación de texto a partir de prompts crudos.
- Capacidades multilingües limitadas a italiano e inglés según la model card.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de visión, audio ni modo de pensamiento (thinking mode).
- Inferencia optimizada para hardware Intel: CPU, iGPU Arc (intel-extension-for-pytorch) y NPU AI Boost (OpenVINO).

## Casos de uso

- Continuación de texto en italiano: el modelo puede completar fragmentos o párrafos en italiano con un prompt directo, aprovechando su especialización en este idioma y su naturaleza de modelo base.
- Generación de texto en inglés: útil para tareas de completado y redacción asistida en inglés, con la misma mecánica de prompt crudo.
- Despliegue en portátiles con CPU Intel: la versión INT8 permite ejecutar inferencia en CPU sin GPU dedicada, reduciendo el consumo de memoria frente a los pesos en bfloat16.
- Inferencia en iGPU Intel Arc: mediante intel-extension-for-pytorch se puede acelerar la generación en equipos con gráficos integrados Arc, como el Core Ultra 185H.
- Ejecución en NPU Intel AI Boost: a través de OpenVINO se puede aprovechar la NPU de la serie Core Ultra para inferencia de bajo consumo.
- Prototipado de pipelines de generación de texto: al ser un modelo base con licencia Apache 2.0, sirve para experimentar con técnicas de prompting y evaluación de calidad lingüística en italiano antes de pasar a modelos ajustados.
- Investigación sobre cuantización: el repositorio incluye la receta de replicación completa con AutoRound, lo que permite reproducir la cuantización y estudiar el impacto de INT8 con group size 64 en la calidad de generación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 9 GB, lo que da una referencia del espacio en disco de los pesos cuantizados a INT8.
- GPU recomendadas: no se especifican GPU dedicadas; el artefacto está optimizado para CPU Intel, iGPU Arc y NPU AI Boost.
- Compatibilidad con GPU de consumo: no documentada. El proceso de cuantización se calibró en CPU y la model card orienta el uso a hardware Intel integrado.
- Opciones de despliegue: transformers (con AutoModelForCausalLM), intel-extension-for-pytorch para CPU e iGPU Arc, OpenVINO para NPU AI Boost. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Almacenamiento: 9 GB de repositorio.
- Nota: la model card indica `inference: false` en los metadatos, lo que puede reflejar que el autor no ha validado la inferencia en todos los backends.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Idiomas |
|---|---|---|---|---|---|
| Minerva-7B-base-v1.0 INT8 (esta ficha) | 2.302.087.168 según safetensors del repo; base denominado 7B | No disponible | INT8 GPTQ, gs64, simétrica | Apache 2.0 | it, en |
| sapienzanlp/Minerva-7B-base-v1.0 (original) | 7B (denominación) | No disponible | bfloat16 sin cuantizar | Apache 2.0 | it, en |
| Mistral-7B-base-v0.1 | 7B | 8.192 tokens (referencia de la familia Mistral) | Múltiples disponibles en la comunidad | Apache 2.0 | en |

La comparación con Mistral-7B se incluye por compartir arquitectura (model_type: mistral), pero no se dispone de datos de rendimiento comparativo en la información proporcionada. No se dispone de benchmarks que permitan comparar la calidad de esta versión cuantizada frente al modelo original.

## Limitaciones y advertencias

- Es un modelo base, no ajustado por instrucciones: no responde bien a formatos conversacionales ni a instrucciones directas sin técnicas de prompting adecuadas.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan mitigaciones específicas.
- Sesgos conocidos: no documentados en la información disponible.
- Idiomas limitados a italiano e inglés; el rendimiento en otros idiomas no está garantizado.
- La cuantización INT8 puede degradar la calidad de generación respecto al modelo original en bfloat16; no se aportan métricas de esa degradación.
- La model card incluye `inference: false` en los metadatos, lo que conviene verificar antes de usar el artefacto en producción.
- El autor declara que el modelo se ha desarrollado solo con fines de investigación y sin garantía.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base original.
- El repositorio tiene pocas descargas (18) y ningún like, lo que indica escasa validación por parte de la comunidad.
- No se documenta soporte para backends de inferencia de alto rendimiento como vLLM o TGI.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fbaldassarri/sapienzanlp_Minerva-7B-base-v1.0-auto_gptq-int8-gs64-sym
- Modelo base: https://huggingface.co/sapienzanlp/Minerva-7B-base-v1.0
- Intel AutoRound (GitHub): https://github.com/intel/auto-round
- Receta de replicación (auto-round-pipeline): https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/

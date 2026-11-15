# fbaldassarri/allenai_OLMo-2-1124-13B-Instruct-auto_gptq-int8-gs64-sym

## Resumen

Esta ficha describe `fbaldassarri/allenai_OLMo-2-1124-13B-Instruct-auto_gptq-int8-gs64-sym`, una cuantizacion INT8 del modelo instructivo `allenai/OLMo-2-1124-13B-Instruct` desarrollado por el Allen Institute for AI (AI2). La cuantizacion la ha realizado el usuario fbaldassarri mediante Intel AutoRound 0.16.1 con el algoritmo GPTQ de AutoGPTQ, aplicando cuantizacion de solo pesos (WoQ) a 8 bits, tamano de grupo 64 y simetria activada. El objetivo es reducir el coste de memoria del modelo original para facilitar su inferencia en hardware Intel (CPU, iGPU Arc y NPU AI Boost de la serie Core Ultra) a traves de intel-extension-for-pytorch y OpenVINO.

El modelo base pertenece a la familia OLMo 2 de AI2, una linea de modelos de lenguaje abiertos que publica pesos, datos de entrenamiento y recetas de reproduccion completas. La model card del artefacto cuantizado no detalla la arquitectura interna ni el proceso de entrenamiento del modelo original, por lo que los datos de esa seccion se limitan a lo declarado en los metadatos y en el README del autor de la cuantizacion.

Es relevante ahora porque ofrece una via practica de desplegar un modelo instructivo de la familia OLMo 2 en entornos sin GPU dedicada, manteniendo el formato `auto_gptq` compatible con `transformers`. La licencia Apache 2.0 del modelo base se conserva en la cuantizacion, lo que permite uso comercial sin restricciones adicionales declaradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (model_type declarado: `olmo2`; transformer causal) |
| Parametros totales | 4.449.960.960 (segun safetensors del repo cuantizado); el nombre del modelo base indica 13B |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (8 bits), WoQ, GPTQ/AutoGPTQ, group_size 64, simetrica |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 17,4 GB), libreria `transformers`, configuracion `auto_gptq` |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base `allenai/OLMo-2-1124-13B-Instruct`. Los metadatos declaran `model_type: olmo2` y `causal-lm`, lo que situa el artefacto en la familia OLMo 2 de AI2, pero no se aportan datos sobre numero de capas, dimension oculta, atencion, composicion del dataset ni fases de RLHF o DPO.

Respecto al proceso de cuantizacion, si esta documentado con detalle. Se aplico Intel AutoRound 0.16.1 con el algoritmo GPTQ de AutoGPTQ en modo WoQ (weights-only quantization), 8 bits, group_size 64 y simetria. La calibracion se hizo sobre CPU con `torch.bfloat16`, 64 muestras, 200 iteraciones, longitud de secuencia 256 y batch size 2, empleando `transformers` 4.55.3 y `torch` 2.15.0+cpu. La duracion registrada del proceso fue de 22.705,5 segundos (aproximadamente 378,4 minutos), completado el 12 de noviembre de 2026. El autor documenta una receta de replicacion mediante el pipeline `auto-round-pipeline` y una llamada directa a `AutoRound`.

## Capacidades

- Generacion de texto conversacional en ingles mediante plantilla de chat integrada (`apply_chat_template`).
- Modelo instructivo: responde a mensajes con roles `user`/`assistant`, no a prompts de texto plano.
- Formato de pesos compatible con `transformers` y `AutoModelForCausalLM`.
- Inferencia orientada a CPU Intel, iGPU Intel Arc (via intel-extension-for-pytorch) y NPU Intel AI Boost de la serie Core Ultra (via OpenVINO).
- No se documentan en la informacion disponible capacidades de tool calling, razonamiento multi-paso, vision, audio ni modo thinking.
- Capacidad multilingue limitada al ingles segun el campo `language: en`.

## Casos de uso

- Despliegue en servidores sin GPU: al ser una cuantizacion INT8 WoQ compatible con `transformers`, permite servir el modelo en CPU Intel con menor huella de memoria que el original en bfloat16, adecuado para entornos on-premise sin aceleradores dedicados.
- Inferencia en portatiles con Intel Core Ultra: el autor indica soporte para NPU AI Boost via OpenVINO, lo que habilita asistentes conversacionales locales en equipos de consumo con bajo consumo energetico.
- Aceleracion en iGPU Intel Arc: mediante intel-extension-for-pytorch se puede aprovechar la GPU integrada en equipos como el Core Ultra 185H, util para prototipos y demos sin GPU discreta.
- Investigacion sobre cuantizacion: el artefacto incluye la receta de replicacion completa (version de auto-round, hiperparametros, condiciones de ejecucion), lo que lo convierte en referencia para estudiar el impacto de INT8 gs64 simetrico en modelos de la familia OLMo 2.
- Evaluacion comparativa de frameworks: sirve para contrastar el comportamiento de AutoRound frente a otras tecnicas de cuantizacion sobre el mismo modelo base, dado que los parametros de calibracion estan documentados.
- Chatbot interno en ingles: el modelo es instructivo y usa plantilla de chat, por lo que puede integrarse en aplicaciones de asistencia conversacional en ingles dentro de pipelines de `transformers` existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El repo ocupa 17,4 GB en safetensors INT8; en ejecucion cabe esperar una huella en el orden de esa cifra mas overhead de activaciones, pero no se aporta medicion concreta.
- GPU recomendadas: no se documentan GPU NVIDIA o AMD como objetivo principal; el autor orienta el artefacto a CPU Intel, iGPU Arc y NPU Core Ultra.
- Cabe en GPU de consumo: no confirmado en la informacion disponible; el enfoco declarado es hardware Intel integrado.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` y `device_map="auto"`; intel-extension-for-pytorch para CPU/iGPU Arc; OpenVINO para NPU AI Boost.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| fbaldassarri/allenai_OLMo-2-1124-13B-Instruct-auto_gptq-int8-gs64-sym | 4.449.960.960 en safetensors (base 13B) | no disponible | INT8 GPTQ gs64 sim | apache-2.0 | Orientado a CPU/iGPU/NPU Intel |
| allenai/OLMo-2-1124-13B-Instruct | 13B (segun nombre) | no disponible | bfloat16 original | apache-2.0 | Modelo base sin cuantizar |
| Otras cuantizaciones del mismo base | no disponible | no disponible | no disponible | apache-2.0 (heredada) | No se han identificado alternativas en la informacion proporcionada |

## Limitaciones y advertencias

- Solo soporta ingles segun el campo `language: en`; no se declaran otros idiomas.
- El autor indica que el artefacto se ha desarrollado unicamente con fines de investigacion y se entrega sin garantia.
- La model card no documenta sesgos, tasas de alucinacion ni evaluaciones de calidad tras la cuantizacion; no hay datos que permitan estimar la degradacion respecto al modelo original.
- No se especifica la longitud de contexto soportada, lo que impide planificar cargas de trabajo con ventanas largas.
- La cuantizacion se calibro con solo 64 muestras y secuencias de 256 tokens; el comportamiento fuera de esa distribucion no esta validado en la informacion disponible.
- El campo `inference: false` aparece en los metadatos de la model card, lo que puede afectar a la carga automatica en algunas herramientas; conviene revisar la compatibilidad del runtime antes de desplegar.
- Aunque la licencia es Apache 2.0, el uso comercial debe verificar las condiciones del modelo base `allenai/OLMo-2-1124-13B-Instruct`.
- El repo no tiene descargas ni likes registrados en el momento de la consulta, por lo que no existe validacion de la comunidad sobre el artefacto.

## Enlaces

- Modelo cuantizado en Hugging Face: https://huggingface.co/fbaldassarri/allenai_OLMo-2-1124-13B-Instruct-auto_gptq-int8-gs64-sym
- Modelo base: https://huggingface.co/allenai/OLMo-2-1124-13B-Instruct
- Repositorio de Intel AutoRound: https://github.com/intel/auto-round
- Pipeline de replicacion: https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/

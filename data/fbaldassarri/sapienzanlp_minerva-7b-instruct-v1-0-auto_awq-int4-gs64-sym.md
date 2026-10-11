# fbaldassarri/sapienzanlp_Minerva-7B-instruct-v1.0-auto_awq-int4-gs64-sym

## Resumen

Esta ficha describe `fbaldassarri/sapienzanlp_Minerva-7B-instruct-v1.0-auto_awq-int4-gs64-sym`, una version cuantizada a 4 bits (INT4) del modelo instructivo italiano `sapienzanlp/Minerva-7B-instruct-v1.0`. La cuantizacion la ha realizado el usuario `fbaldassarri` mediante la libreria Intel AutoRound (v0.15.1) aplicando el algoritmo AWQ en modalidad weights-only quantization (WoQ), con 4 bits, tamano de grupo 64 y cuantizacion simetrica. El resultado es un artefacto pensado para inferencia con bajo consumo de memoria y una aceleracion declarada de 2-3x respecto al modelo en bfloat16.

El modelo base es un transformer causal de tipo Mistral (`model_type: mistral`), orientado a generacion de texto conversacional, y esta especializado en italiano (con soporte adicional de ingles). La relevancia de esta version concreta reside en que empaqueta el modelo en formato AWQ/INT4 para su despliegue en hardware Intel: CPU Intel, iGPU Intel Arc mediante `intel-extension-for-pytorch`, y NPU Intel (AI Boost en la serie Core Ultra) mediante OpenVINO, ademas de ser cargable con `transformers`.

Se trata de un artefacto derivado, no de un modelo entrenado desde cero: no anade capacidades nuevas respecto al base, sino que reduce el peso y acelera la inferencia asumiendo una ligera perdida de precision (documentada por el autor como "slight accuracy drop at W4G64"). La informacion disponible no incluye resultados de benchmarks ni la longitud de contexto del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal de tipo Mistral (`model_type: mistral`, `causal-lm`) |
| Parametros totales | 1.415.319.552 segun los pesos safetensors del repositorio cuantizado (el modelo base se denomina Minerva-7B; no se detalla el recuento exacto del base en la informacion disponible) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 (4 bits), AWQ/WoQ, group size 64, simetrica; `torch_dtype` de referencia `bfloat16` |
| Idiomas soportados | Italiano (it) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, cuantizacion `auto_awq` (compatible con el framework Intel AutoRound / auto-round) |

## Arquitectura y entrenamiento

El artefacto es una cuantizacion post-entrenamiento (PTQ) del modelo `sapienzanlp/Minerva-7B-instruct-v1.0`. El modelo base emplea una arquitectura transformer causal de tipo Mistral, con atencion causal estandar y diseno orientado a instrucciones conversacionales. No se ha entrenado ningun componente nuevo: el proceso aplicado es una cuantizacion de solo pesos (weights-only quantization) mediante el algoritmo AWQ implementado en Intel AutoRound.

Los parametros exactos del proceso de cuantizacion estan documentados en la model card: Intel AutoRound 0.15.1, `transformers` 4.55.3, `torch` 2.14.0+cpu, carga en `torch.bfloat16`, calibracion en CPU con 128 muestras (`nsamples=128`), 200 iteraciones de ajuste (`iters=200`), longitud de secuencia de calibracion 512 (`seqlen=512`) y batch de calibracion 4. La cuantizacion emplea 4 bits, grupo de 64 y esquema simetrico, y el tiempo total de ejecucion registrado fue de 42.344,4 segundos (unos 705,7 minutos), finalizando el 2026-09-19. No se documenta en la informacion disponible si el modelo base uso RLHF, DPO u otras tecnicas de alineamiento.

## Capacidades

- Generacion de texto conversacional: el artefacto es un modelo instruct/chat y espera el uso de su plantilla de chat (`apply_chat_template`), no prompts de texto sin formato.
- Razonamiento y generacion de lenguaje en italiano, con soporte secundario de ingles.
- Inferencia de bajo consumo de memoria y acelerada: 2-3x de speedup declarado por el autor respecto a la version de mayor precision, con una ligera perdida de precision a W4G64.
- Despliegue en multiples backends Intel: CPU Intel, iGPU Intel Arc (via `intel-extension-for-pytorch`) y NPU Intel AI Boost de la serie Core Ultra (via OpenVINO).
- Carga directa con `transformers` mediante `AutoModelForCausalLM` y `AutoTokenizer`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue de un asistente conversacional en italiano en equipos sin GPU dedicada: al estar cuantizado a INT4 y orientado a CPU Intel, puede ejecutarse en portatiles y estaciones de trabajo x86 para atender consultas de usuarios en italiano con un consumo de memoria moderado.
- Inferencia en portatiles con Intel Core Ultra: la compatibilidad con la NPU (AI Boost) via OpenVINO permite descargar la inferencia del CPU/GPU y reducir el consumo energetico en aplicaciones de escritorio.
- Aceleracion en iGPU Intel Arc: en equipos con grafica integrada Arc, el uso de `intel-extension-for-pytorch` permite servir el modelo sin necesidad de una GPU discreta.
- Prototipado rapido de aplicaciones de PLN en italiano: investigadores que necesiten un modelo instructivo italiano pueden cargarlo con `transformers` y validar flujos conversacionales sin disponer de hardware de gama alta.
- Generacion de texto asistida en entornos con restricciones de memoria: el formato INT4 con grupo 64 reduce el peso de los ficheros del repositorio a 5,4 GB, lo que facilita su distribucion y almacenamiento local.
- Evaluacion comparativa de tecnicas de cuantizacion: el artefacto se presta a reproducir la receta de AutoRound documentada (nsamples, iters, seqlen, batch) y a medir el impacto de AWQ W4G64 frente al modelo base en tareas italianas.
- Integracion en pipelines de generacion de texto con `text-generation-inference`: el tag del repositorio incluye `text-generation-inference`, lo que sugiere su uso en servidores de inferencia de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente declara una aceleracion de 2-3x y una "ligera perdida de precision" en la configuracion W4G64 frente al modelo base, sin cifras concretas de MMLU, HumanEval, GSM8K ni otras metricas.

## Requisitos de hardware

- Tamano del repositorio: 5,4 GB, lo que acota el peso en disco de los pesos cuantizados.
- VRAM estimada para inferencia: en torno a 5-6 GB solo para los pesos en INT4, mas la memoria de la cache KV segun la longitud de contexto (estimacion orientativa; la informacion disponible no confirma cifras exactas de VRAM).
- GPU recomendadas: no confirmadas en la informacion disponible. Por compatibilidad declarada del formato, el foco esta en hardware Intel (CPU, iGPU Arc, NPU Core Ultra) mas que en GPU NVIDIA.
- Cabe en GPU de consumo: probablemente si en tarjetas con 8 GB o mas de VRAM (por ejemplo RTX 3060 12 GB, RTX 4060 8 GB), aunque esta afirmacion es una estimacion y no esta confirmada por el autor.
- Opciones de despliegue: `transformers` (con `device_map="auto"`), `intel-extension-for-pytorch` (CPU e iGPU Arc), OpenVINO (NPU AI Boost), y framework de cuantizacion Intel AutoRound. El tag `text-generation-inference` sugiere compatibilidad con TGI, aunque no se detalla.
- Latencia y throughput: la model card declara una mejora de velocidad de 2-3x respecto a la version de mayor precision; no se proporcionan valores absolutos de tokens por segundo ni latencias concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este artefacto (Minerva-7B AWQ INT4 W4G64) | 1.415.319.552 segun safetensors del repo (base 7B) | no disponible | INT4 AWQ/WoQ, grupo 64, simetrica | Apache 2.0 | HuggingFace, formato auto_awq |
| sapienzanlp/Minerva-7B-instruct-v1.0 (base) | 7B (segun denominacion) | no disponible | Sin cuantizar (bfloat16) | Apache 2.0 | HuggingFace |
| Otras cuantizaciones del mismo base (GPTQ, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento que permitan una comparacion cuantitativa con modelos alternativos de la misma categoria.

## Limitaciones y advertencias

- Modelo derivado: no anade capacidades respecto al base; solo modifica precision y rendimiento. La utilidad real depende del comportamiento del modelo Minerva-7B-instruct-v1.0 original.
- Perdida de precision: el propio autor reconoce una "ligera perdida de precision" en la configuracion W4G64, que puede manifestarse en tareas sensibles a la exactitud.
- Benchmarking ausente: no hay datos publicados de MMLU, HumanEval, GSM8K ni metricas equivalentes, lo que dificulta evaluar objetivamente el impacto de la cuantizacion.
- Cobertura idiomatica limitada: solo se declaran italiano e ingles; el rendimiento en otras lenguas no esta garantizado ni documentado.
- Longitud de contexto no especificada: se desconoce la ventana de contexto efectiva, lo que condiciona el diseno de aplicaciones multi-turno o de contexto largo.
- Licencia: Apache 2.0, que permite uso comercial, pero la model card incluye una clausula de exencion de garantia y senala que el artefacto se ha desarrollado "solo para fines de investigacion".
- Reproducibilidad: la receta de cuantizacion depende de tooling especifico (auto-round-pipeline y AutoRound 0.15.1) y de versiones concretas de `torch` y `transformers`, lo que puede complicar la reproduccion fuera de ese entorno.
- Riesgo de alucinacion y sesgos: no disponible en la informacion proporcionada; al ser un modelo base instructivo, cabe esperar los riesgos habituales de generacion, pero no se documentan sesgos especificos.
- Hardware objetivo restringido: la optimizacion declarada esta centrada en Intel (CPU, Arc, NPU); el soporte en otros aceleradores no se detalla.

## Enlaces

- Repositorio HuggingFace (version cuantizada): https://huggingface.co/fbaldassarri/sapienzanlp_Minerva-7B-instruct-v1.0-auto_awq-int4-gs64-sym
- Modelo base: https://huggingface.co/sapienzanlp/Minerva-7B-instruct-v1.0
- Intel AutoRound (repositorio): https://github.com/intel/auto-round
- Receta de reproduccion (auto-round-pipeline): https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/

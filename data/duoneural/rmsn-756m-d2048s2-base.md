# DuoNeural/RMSN-756M-D2048s2-Base

## Resumen

RMSN-756M-D2048s2-Base es un modelo de lenguaje de tipo base desarrollado por DuoNeural (laboratorio que firma sus publicaciones como Archon y Aura), publicado en noviembre de 2026 bajo licencia Apache 2.0. Se trata de un transformer de 756 millones de parametros con dimension de modelo D=2048 y 16 capas, entrenado durante 100.000 pasos y etiquetado con la semilla 2 (s2) dentro de una familia de variantes del mismo tamano.

La particularidad del modelo no esta en su rendimiento bruto sino en su topologia interna: la model card describe una arquitectura de "red neuronal de solitones" (RMSN, con tags de port-hamiltonian y topological-solitons) en la que cada capa se caracteriza por su participation ratio (PR), una medida de dispersion de la representacion. Segun el autor, las capas L0 y L1 operan como solitones casi criticos (PR≈3,75-3,84), las capas L2-L14 forman un "espacio de trabajo" bulk casi uniforme (PR=57-64) y la capa L15 colapsa en un condensado terminal exacto (PR=1,002).

El modelo se presenta explicitamente como candidato para fine-tuning supervisado (SFT), con una prediccion de perplejidad en wiki de aproximadamente 130-150, comparable a la variante D=2048 s1 del mismo laboratorio (wiki_ppl=133,56). Es relevante ahora como artefacto de investigacion sobre dinamica representacional en redes pequenas, no como modelo listo para produccion: no tiene descargas ni likes, no declara pipeline y no documenta idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con topologia RMSN (port-hamiltonian, solitones topologicos); D=2048, depth=16 |
| Parametros totales | 756M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en formato original; repo de 2,6 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 2,6 GB, compatible con safetensors por tamano, sin confirmar) |

## Arquitectura y entrenamiento

El modelo es un transformer de 16 capas con dimension oculta 2048 y 756M de parametros. La innovacion declarada es la "RMSN" (presumiblemente Resonant/Recurrent Multi-Soliton Network), una formulacion inspirada en sistemas port-hamiltonianos en la que las capas se describen mediante su participation ratio: L0 y L1 son solitones casi criticos (PR=3,752 y 3,841), L2-L14 son capas bulk con PR entre 57 y 64, y L15 es un condensado terminal exacto con PR=1,002. El autor formula una "Terminal Condensation Law" segun la cual D>=1792 garantiza condensacion terminal exacta en L15, confirmada en esta variante.

El entrenamiento consta de 100.000 pasos con semilla 2. No se documentan en la informacion disponible el numero de tokens, la composicion del dataset, ni si hubo RLHF, DPO o fases de alineamiento (es un modelo base, por lo que se asume preentrenamiento puro, sin confirmar). Tampoco se detallan mecanismos de atencion (lineal, especulativa u otros) ni optimizador, learning rate o regimen de precision.

## Capacidades

- Generacion de texto autoregresiva como modelo base (sin alineamiento documentado).
- Razonamiento y conocimiento general: no verificable sin benchmarks publicados.
- Generacion de codigo y matematicas: no documentado.
- Tool calling / function calling: no documentado; improbable en un base model sin instruccion.
- Soporte de agentes y multi-step reasoning: no documentado.
- Capacidades multilingues: no declaradas; la model card no lista idiomas.
- Capacidades especiales: ninguna documentada (sin vision, audio ni thinking mode). El interes esta en su estructura representacional (solitones y condensado terminal), no en capacidades funcionales.

## Casos de uso

- Investigacion sobre dinamica representacional: analizar como evoluciona el participation ratio por capa durante el fine-tuning y contrastar la "Terminal Condensation Law" con otras semillas y dimensiones.
- Fine-tuning supervisado experimental: la model card lo posiciona como "excellent SFT candidate" con perplejidad esperada de 130-150 en wiki; util para estudiar si la topologia sparse-mid + terminal exact acelera la convergencia del SFT.
- Estudio de condensados terminales: usar L15 (PR=1,002) como caso de control para investigar colapso representacional y su relacion con la calidad de la ultima capa.
- Reproducibilidad de familias de semillas: comparar s2 con s1 (wiki_ppl=133,56) y otras semillas para aislar el efecto de la inicializacion en la topologia.
- Base para ablaciones de arquitectura: al ser 756M y D=2048, cabe en una sola GPU consumer de 24 GB en fp16 (≈1,5 GB de pesos) y permite iterar experimentos de bajo coste.
- Docencia y divulgacion: ejemplo practico de analisis por capas (PR, solitones) sobre un modelo pequeno y de licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica mencionada es una prediccion (no medida) de perplejidad en wiki de 130-150 para esta variante, y el dato de la variante hermana D=2048 s1 (wiki_ppl=133,56).

| Metrica | RMSN-756M-D2048s2-Base | RMSN D=2048 s1 (referencia) |
|---|---|---|
| wiki_ppl | 130-150 (prediccion) | 133,56 (reportado) |
| MMLU / HumanEval / GSM8K | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada: en fp16 los 756M de parametros ocupan aproximadamente 1,5 GB; con overhead de activaciones y KV cache, entre 3 y 6 GB segun longitud de contexto y batch.
- En int8: aproximadamente 0,8 GB de pesos; en int4: aproximadamente 0,4 GB (cuantizacion no documentada por el autor, requeriria conversion propia).
- GPU recomendadas: cualquier GPU con 8 GB o mas (RTX 3060/4060, RTX 4090); para entrenamiento de SFT, A100 40/80 GB o H100 si se usan batches grandes.
- Cabe holgadamente en GPU consumer: si, incluidas GTX 1080 Ti (11 GB) y RTX 4090 (24 GB).
- Opciones de despliegue: al no documentarse formato, habria que convertir los pesos a safetensors/GGUF; una vez convertidos, llama.cpp, Ollama, vLLM o TGI son viables.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| RMSN-756M-D2048s2-Base | 756M | no disponible | Apache 2.0 | Transformer con topologia de solitones (RMSN) | HF, 0 descargas |
| Qwen2.5-0.5B | 494M | 32.768 tokens | Apache 2.0 | Transformer denso estandar | HF, ampliamente usado |
| SmolLM2-360M | 362M | 8.192 tokens | Apache 2.0 | Transformer denso estandar | HF, ampliamente usado |
| Pythia-1B | 1.000M | 2.048 tokens | Apache 2.0 | Transformer denso, suite de interpretabilidad | HF, muy usado en investigacion |

La comparacion es estructural, no de rendimiento: no hay benchmarks del RMSN que permitan situarlo frente a estos modelos. Su valor diferencial es el analisis topologico por capas, no la calidad de generacion.

## Limitaciones y advertencias

- Modelo base sin alineamiento: no sigue instrucciones de forma fiable ni esta pensado para uso conversacional directo.
- Sin benchmarks publicados: la perplejidad de 130-150 es una prediccion del autor, no una medicion verificada.
- Sin idiomas declarados: se desconoce la cobertura linguistica y la calidad en castellano.
- Sin documentacion de contexto, tokenizador ni dataset de entrenamiento: imposible evaluar sesgos o contaminacion.
- Riesgo de alucinacion inherente a un modelo base pequeno (756M) sin RLHF; no apto para produccion sin evaluacion previa.
- Terminologia no estandar (solitones, condensado terminal, participation ratio): los claims de la model card no son verificables de forma independiente con la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de garantias y de evaluacion hace desaconsejable desplegarlo en entornos reales sin validacion propia.
- Cero descargas y cero likes en el momento de la consulta: sin comunidad ni soporte.

## Enlaces

- Hugging Face: https://huggingface.co/DuoNeural/RMSN-756M-D2048s2-Base
- Model card del autor: incluida en la pagina de Hugging Face (sin README externo adicional)
- Paper, blog, repositorio o demo: no disponible

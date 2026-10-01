# d0rj/q-moe-51M-A33M-base

## Resumen

q-moe-51M-A33M-base es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por el usuario d0rj dentro de lo que su autor denomina un experimento de ablacion de modelos diminutos ("tiny-llm-ablation"). Cuenta con 50.919.440 parametros totales en safetensors, de los cuales aproximadamente 33 millones estarian activos por token segun la nomenclatura del propio identificador ("A33M"), lo que da una relacion de activacion en torno al 65 %. Se trata de un modelo base (no ajustado por instrucciones) entrenado desde cero sobre el dataset HuggingFaceFW/fineweb-edu, con licencia no declarada y soporte unicamente para ingles.

El modelo emplea una arquitectura causal-LM con codigo personalizado (tag `custom_code` y `q_moe`), lo que implica que requiere confiar en implementacion remota o cargar modulos propios para su uso con transformers. Su relevancia es fundamentalmente academica y de investigacion: sirve como punto de comparacion controlado para estudiar el equilibrio entre parametros totales y activos en regimenes de escalado extremadamente reducidos, donde cada punto porcentual de accuracy en tareas de sentido comun resulta informativo.

No es un modelo orientado a produccion ni a tareas generativas de calidad: sus resultados en benchmarks de continuacion de texto (HellaSwag 29,24 %, LAMBADA OpenAI 18,90 %, ARC-Challenge 23,63 %) estan en el rango esperable de un modelo de ~51M de parametros con entrenamiento limitado. Su valor esta en la trazabilidad del experimento y en la publicacion de la configuracion MoE a escala minuscula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal-LM con mezcla de expertos (MoE), codigo personalizado `q_moe` |
| Parametros totales | 50.919.440 |
| Parametros activos | ~33.000.000 (segun nomenclatura del identificador, no confirmado en documentacion) |
| Longitud de contexto | no disponible (las evaluaciones se realizaron con max_length 2048 y 1024) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; sin GGUF ni AWQ oficiales) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (con `custom_code`) |

## Arquitectura y entrenamiento

La arquitectura es una mezcla de expertos (MoE) de tipo decoder causal con atencion completa, implementada mediante codigo personalizado bajo la etiqueta `q_moe`. El modelo declara 50.919.440 parametros totales y su nombre sugiere 33M activos por token, lo que implica enrutamiento disperso hacia un subconjunto de expertos en cada paso. No se dispone de informacion publica sobre el numero de expertos, el tamano de cada uno, la estrategia de top-k, el uso de expertos compartidos ni el tipo de normalizacion o posicional empleado. Tampoco se detalla si incorpora innovaciones como atencion lineal, decodificacion especulativa o capas hibridas.

El entrenamiento se realizo desde cero ("from-scratch") sobre el dataset HuggingFaceFW/fineweb-edu, una coleccion filtrada de texto educativo en ingles. La model card no especifica el numero exacto de tokens de entrenamiento para esta variante MoE, aunque el modelo hermano denso de la misma familia (d0rj/q-51M-base) declara 3.932.160.000 tokens de origen procesados en 15.000 pasos de optimizador, cifra que puede tomarse como referencia del orden de magnitud del experimento de ablacion. No hay evidencia de fases de RLHF, DPO o ajuste por instrucciones: se trata de un modelo estrictamente base, orientado a evaluacion de probabilidad de continuacion.

## Capacidades

- Generacion de texto autoregresiva en ingles a partir de un prompt, en modo completado de texto sin formato conversacional.
- Modelado de probabilidad de continuacion, adecuado para tareas de eleccion multiple mediante comparacion de verosimilitudes (protocolo "full comparison", 0-shot).
- Sentido comun basico y fisica intuitiva elemental, reflejado en PIQA (60,28 %) y HellaSwag (29,24 %).
- Razonamiento aritmetico muy limitado, con un 35,00 % en ArithMark-3.
- Comprension lectora y respuesta a preguntas sencillas (BoolQ 56,97 %, ARC-Easy 42,09 %).
- Inferencia de relaciones entre entidades a nivel superficial (WinoGrande 51,38 %).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no, solo ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Investigacion en escalado de MoE: el modelo sirve como punto de control de ~51M parametros totales y ~33M activos para estudiar como varia la perdida y la accuracy al modificar el numero de expertos, el top-k o la relacion de activacion, comparandolo contra el hermano denso q-51M-base.
- Reproduccion de experimentos de ablacion: al estar entrenado desde cero sobre fineweb-edu, permite aislar el efecto de la arquitectura MoE frente a una linea base densa con presupuesto de tokens fijo, replicando el protocolo declarado en la familia.
- Evaluacion de harness de benchmarks en modelos diminutos: sus resultados 0-shot con `acc_norm` y `max_length` 2048 permiten validar pipelines de evaluacion tipo EleutherAI LM Eval antes de escalarlos a modelos mayores.
- Docencia y divulgacion: al ser un MoE pequeno con pesos safetensors de 0,2 GB, es util para explicar en clase como funciona el enrutamiento disperso y para inspeccionar pesos en portatiles sin GPU dedicada.
- Pruebas de cuantizacion extrema: su tamano permite experimentar con cuantizaciones a 8, 4 o incluso 2 bits para medir el impacto en tareas de continuacion, aunque no se publiquen GGUF oficiales.
- Generacion de texto de bajo coste en entornos embebidos: escenarios donde el objetivo es completar frases o clasificar por verosimilitud con latencia minima, asumiendo calidad linguistica limitada y ausencia de instrucciones.
- Test de integracion de `custom_code` en transformers: util para validar que un pipeline propio carga correctamente modulos remotos con `trust_remote_code` antes de aplicarlo a modelos mayores de la misma serie.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (datos no verificados, `verified: false`). Todos en bfloat16, 0-shot, con protocolo full comparison y fecha de evaluacion 2026-10-01.

| Benchmark | Metrica | Valor | max_length | Error estandar | IC 95 % |
|---|---|---|---|---|---|
| HellaSwag (validation) | acc_norm | 0,2924 | 2048 | 0,00454 | [0,2836; 0,3013] |
| ARC-Easy (test) | acc_norm | 0,4209 | 2048 | 0,01013 | [0,4012; 0,4408] |
| ARC-Challenge (test) | acc_norm | 0,2363 | 2048 | 0,01241 | [0,2129; 0,2615] |
| PIQA (validation) | acc_norm | 0,6028 | 2048 | 0,01142 | [0,5803; 0,6250] |
| WinoGrande (validation, xl) | acc | 0,5138 | 2048 | 0,01405 | [0,4863; 0,5412] |
| OpenBookQA (test, main) | acc_norm | 0,2920 | 2048 | 0,02035 | [0,2539; 0,3333] |
| BoolQ (validation) | acc | 0,5697 | 2048 | 0,00866 | [0,5527; 0,5866] |
| LAMBADA OpenAI (test) | acc | 0,1890 | 2048 | 0,00545 | [0,1786; 0,1999] |
| ArithMark-3 (train) | acc_norm | 0,3500 | 1024 | 0,01509 | [0,3211; 0,3801] |
| Balanced COPA (train) | acc | no disponible | 2048 | no disponible | no disponible |

El intervalo de confianza se calcula con el metodo de Wilson al 95 % y aproximacion de independencia entre items, segun lo indicado por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16 aproximadamente 102 MB de pesos; en float32 unos 204 MB; en int8 unos 51 MB; en int4 unos 26 MB. A ello hay que sumar el estado de la cache KV, despreciable a contextos de 2048 tokens.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Funciona sin problema en RTX 4090, RTX 3090, A100, H100 e incluso en GPUs integradas o en CPU.
- Cabe en GPU de consumo: si, en practicamente todas, incluidas GTX 1050, RTX 2060, laptops con grafica integrada y placas como Raspberry Pi 5 o Apple Silicon en modo CPU.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la via documentada, dado el uso de `custom_code`. No se confirma soporte oficial en vLLM, TGI, llama.cpp u Ollama; requeriria conversion a GGUF o registro del modulo personalizado en el motor de inferencia.
- Latencia y throughput estimados: no disponible. Por tamano, cabe esperar latencias de milisegundos por token en GPU moderna, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| d0rj/q-moe-51M-A33M-base | 50,92 M | ~33 M (segun nombre) | no disponible | MoE causal-LM | no disponible | HuggingFace, transformers |
| d0rj/q-51M-base (hermano denso) | 50,88 M | 50,88 M | no disponible | Densa causal-LM | no disponible | HuggingFace |
| Pythia-70M | 70 M | 70 M | 2048 | Densa (GPT-NeoX) | Apache 2.0 | HuggingFace |
| GPT-2 small | 124 M | 124 M | 1024 | Densa | MIT | HuggingFace |

La comparacion con Pythia-70M y GPT-2 small es orientativa por tamano y categoria (modelos base en ingles), pero no se dispone de una evaluacion bajo el mismo harness para confrontar metricas directamente. No se han identificado alternativas MoE publicas de ~51M de parametros con fines comparables dentro de la informacion disponible.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no responde a ordenes ni mantiene formato conversacional; solo completa texto o puntua continuaciones.
- Riesgo elevado de alucinacion y de texto incoherente, coherente con su tamano (51M) y con un rendimiento bajo en LAMBADA OpenAI (18,90 %).
- Sesgos conocidos: no documentados por el autor; heredables del dataset fineweb-edu (texto web filtrado en ingles), con posibles sesgos de genero, origen y tematica.
- Limitacion idiomatica estricta: solo ingles; el rendimiento en castellano o cualquier otro idioma sera practicamente nulo o degradado.
- Longitud de contexto: no declarada oficialmente; las evaluaciones usan 2048 tokens, por lo que no debe asumirse una ventana mayor en produccion.
- Licencia no disponible: la ausencia de terminos explicitos impide confirmar si se permite uso comercial; debe tratarse como no autorizado hasta aclaracion del autor.
- Dependencia de `custom_code`: cargar el modelo implica ejecutar codigo remoto con `trust_remote_code=True`, lo que supone un riesgo de seguridad si no se audita antes.
- Benchmarks no verificados: los resultados proceden del propio autor (`verified: false`) y no han sido replicados de forma independiente.
- No apto para produccion: no hay garantias de estabilidad, soporte, ni motores de inferencia optimizados; su uso razonable es experimental y educativo.
- Tamano de repo reducido (0,2 GB) y cero descargas/likes en el momento de la consulta, indicativos de un artefacto de investigacion sin adopcion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/d0rj/q-moe-51M-A33M-base
- Modelo hermano denso (familia de ablacion): https://huggingface.co/d0rj/q-51M-base
- README del hermano denso: https://huggingface.co/d0rj/q-51M-base/blob/main/README.md
- Dataset de entrenamiento: HuggingFaceFW/fineweb-edu
- Benchmarks citados: Rowan/hellaswag, allenai/ai2_arc, baber/piqa, allenai/winogrande, allenai/openbookqa, aps/super_glue, EleutherAI/lambada_openai, AxiomicLabs/Arithmark-3.0, pkavumba/balanced-copa
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada

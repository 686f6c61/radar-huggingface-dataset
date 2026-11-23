# aspect-ratio-scaling/hc-lr2e-3-llama-400M-L24-pretrain

## Resumen

hc-lr2e-3-llama-400M-L24-pretrain es un checkpoint de modelo de lenguaje causal con arquitectura estilo Llama, entrenado con OLMo-core y publicado por el grupo de investigacion aspect-ratio-scaling. Forma parte del material experimental del paper DepthBench: Measuring How Residual Connections Enable More Computational Depth, cuyo objetivo es medir como las conexiones residuales permiten aumentar la profundidad computacional efectiva de una red. El nombre del repositorio codifica la configuracion: tasa de aprendizaje 2e-3, familia Llama, aproximadamente 400 millones de parametros y 24 capas (L24).

Se trata de un checkpoint de preentrenamiento puro, no de un modelo ajustado para instrucciones ni alineado. Los pesos se almacenan en el formato distribuido nativo de OLMo-core y no como exportacion de Transformers, lo que implica que para usarlo con las herramientas habituales de inferencia es necesario convertirlo previamente. El repositorio ocupa 3,0 GB y acumula 11 descargas, lo que lo situa como un artefacto de investigacion de nicho.

Su relevancia es fundamentalmente academica: sirve como punto de partida reproducible para estudiar el efecto de la profundidad, la tasa de aprendizaje y las conexiones residuales en modelos de escala pequena, y como baseline en experimentos de scaling. No esta pensado como modelo de produccion ni como asistente conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal estilo Llama (24 capas) |
| Parametros totales | aproximadamente 400 millones (segun nombre del repositorio) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint en formato nativo OLMo-core) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | formato distribuido nativo de OLMo-core (no Transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura transformer causal de la familia Llama, con 24 capas y aproximadamente 400 millones de parametros, entrenado mediante OLMo-core, el framework de entrenamiento del ecosistema Allen Institute for AI. La nomenclatura del repositorio indica una tasa de aprendizaje de 2e-3, un valor relativamente alto para este tamano, coherente con el eje de experimentacion del paper sobre escalado de la tasa de aprendizaje y profundidad.

El checkpoint corresponde a la fase de preentrenamiento, sin que la informacion disponible detalle el numero de tokens, la composicion del dataset, ni si hubo fases de RLHF o DPO. El contexto del paper (DepthBench) sugiere que el interes experimental reside en como las conexiones residuales habilitan profundidad computacional adicional, es decir, en analizar cuantas capas pueden contribuir de forma efectiva al calculo. No se dispone de detalles sobre innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto autoregresiva basica, propia de un modelo causal preentrenado.
- Modelado de lenguaje y continuacion de texto; no se ha verificado un modo de instrucciones ni de chat.
- No se ha documentado soporte de tool calling ni function calling.
- No se ha documentado soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues no disponibles; el autor no declara idiomas soportados.
- No se ha documentado vision, audio ni modos de razonamiento extendido (thinking mode).
- Utilidad principal como objeto de estudio: analisis de profundidad efectiva, conexiones residuales y dinamica de entrenamiento.

## Casos de uso

- Investigacion sobre profundidad computacional: usar el checkpoint como sujeto de analisis para medir cuantas capas contribuyen efectivamente a la representacion, replicando los experimentos de DepthBench.
- Baseline en estudios de scaling: comparar curvas de perdida frente a variantes con distinta tasa de aprendizaje o numero de capas, dado que el nombre del repositorio explicita la configuracion (lr 2e-3, L24).
- Reproducibilidad academica: servir como referencia concreta para verificar resultados del paper con el codigo publicado en el repositorio de GitHub del autor.
- Analisis de conexiones residuales: instrumentar el modelo para estudiar el flujo de gradientes y la contribucion de los bloques residuales en una red de 24 capas y 400M de parametros.
- Experimentos de ajuste fino controlado: punto de partida de bajo coste computacional para probar recetas de fine-tuning en un modelo pequeno antes de escalar a tamanos mayores.
- Docencia y formacion: ejemplo manejable de pipeline de entrenamiento con OLMo-core, incluida la conversion de formatos distribuidos a pesos estandar para inspeccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 1,6 GB solo para pesos, mas activaciones y cache KV; en bf16/fp16, alrededor de 0,8 GB para pesos.
- Al tratarse de un modelo de 400M de parametros, cabe holgadamente en GPU de consumo como RTX 3060, RTX 4060, RTX 4070 o superiores, asi como en GPUs de datacenter (A100, H100) sin ninguna restriccion de memoria.
- Despliegue: al no ser una exportacion de Transformers, requiere conversion previa del formato distribuido de OLMo-core; una vez convertido, seria compatible con frameworks estandar como vLLM, TGI, llama.cpp u Ollama, aunque no se ha verificado ninguna de estas rutas en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| hc-lr2e-3-llama-400M-L24-pretrain | ~400M | no disponible | no disponible | Hugging Face (formato OLMo-core) | Checkpoint de investigacion, sin alineacion |
| Pythia-410M (EleutherAI) | 410M | 2048 tokens | Apache 2.0 | Hugging Face, Transformers | Suite de investigacion con checkpoints intermedios |
| GPT-2 medium (OpenAI) | 355M | 1024 tokens | MIT | Hugging Face, Transformers | Referencia historica de preentrenamiento |
| OLMo-1B (AI2) | ~1.200M | 2048 tokens | Apache 2.0 | Hugging Face, Transformers | Mismo ecosistema de entrenamiento (OLMo-core) |

La comparacion con Pythia-410M es la mas directa por tamano y proposito de investigacion; sin embargo, no se dispone de datos de rendimiento del modelo evaluado que permitan contrastar metricas.

## Limitaciones y advertencias

- Es un checkpoint de preentrenamiento sin alineacion: no debe esperarse comportamiento de asistente, seguimiento de instrucciones ni moderacion de salidas.
- Riesgo elevado de alucinacion y de generacion de contenido sesgado o toxico, inherente a modelos preentrenados con datos web sin filtrado documentado.
- La licencia no esta declarada, por lo que el uso comercial queda en un limbo juridico y no se recomienda sin aclaracion previa del autor.
- El formato de pesos nativo de OLMo-core no es directamente cargable con Transformers; requiere conversion y validacion propias.
- No se documentan idiomas soportados ni longitud de contexto, lo que impide garantizar un comportamiento multilingue o ventanas largas.
- El numero de descargas (11) y la ausencia de likes indican una adopcion minima; no hay evidencia de comunidad, issues resueltos ni soporte.
- No apto para produccion: sin benchmarks publicados, sin evaluacion de seguridad y con un pipeline de inferencia no estandarizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aspect-ratio-scaling/hc-lr2e-3-llama-400M-L24-pretrain
- Paper DepthBench: https://huggingface.co/papers/2609.32534
- Repositorio de codigo (entrenamiento, evaluacion y analisis): https://github.com/keyu-wang-2002/DepthBench

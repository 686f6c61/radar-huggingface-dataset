# nenuadrian/mvGPT-checkpoints

## Resumen

mvGPT-checkpoints es un repositorio de puntos de control (checkpoints) del proyecto educativo Minimum Viable GPT (mvGPT), una serie de YouTube en la que el autor, nenuadrian, entrena modelos de lenguaje desde cero delante de la camara. No se trata de un unico modelo, sino de una coleccion de instantaneas de entrenamiento que documentan paso a paso el ciclo de vida de un transformer: preentrenamiento, ajuste supervisado (SFT), optimizacion con DPO y PPO, LoRA, embeddings posicionales rotatorios (RoPE), tokenizacion BPE, entrenamiento distribuido (DDP), difusion enmascarada, tool calling, agentes, extension de contexto y arquitecturas alternativas como Hyena.

El objetivo del proyecto es didactico: cada checkpoint corresponde a un episodio y demuestra una tecnica concreta sobre modelos de escala reducida (desde 14,6M hasta 110,2M parametros). Los modelos se entrenan sobre TinyStories, TinyStoriesInstruct y FineWeb-Edu, y los tamanos de contexto y las recetas de entrenamiento varian segun el episodio. El repositorio ocupa 5,8 GB e incluye pesos, configuracion y tokenizador en un unico archivo `model.pt` por checkpoint.

Es relevante ahora porque ofrece material reproducible y abierto (licencia MIT) para quienes quieren entender el entrenamiento de LLM sin infraestructura industrial: la mayoria de los experimentos caben en un portatil o en una unica RTX 4090, y los mas grandes usan cuatro RTX 4090 durante minutos u horas. No obstante, no es un modelo listo para produccion ni para tareas generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (variantes con atencion, Hyena y difusion enmascarada) |
| Parametros totales | Desde 14,6M hasta 110,2M segun checkpoint (91,3M en `pretrain-ddp`, 110,2M en `pretrain-web`) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible de forma general; `long-pi` y `long-yarn` se ajustan a 4.096 tokens |
| Tipos de cuantizacion | No disponible (pesos en `model.pt` de PyTorch) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `model.pt` (PyTorch, incluye config, pesos y tokenizador) |

## Arquitectura y entrenamiento

Los checkpoints cubren varias arquitecturas. La base es un transformer decoder-only con tokenizacion a nivel de palabra o BPE; los episodios 10 y 11 introducen embeddings posicionales rotatorios (RoPE) y un tokenizador BPE en C++. El episodio 12 escala a 91,3M parametros con entrenamiento distribuido (DDP) sobre cuatro RTX 4090 durante 30 minutos sobre todo TinyStories. El episodio 19 entrena un modelo de 110,2M parametros sobre FineWeb-Edu durante una noche en una RTX 4090. Los episodios 15 exploran difusion enmascarada, incluyendo la conversion de un modelo de prediccion del siguiente token a difusion. El episodio 29 compara atencion con Hyena y una variante hibrida (Hyena con atencion en los bloques 3 y 9) sobre 3,6B tokens de FineWeb-Edu.

En cuanto a alineacion, el repositorio incluye SFT sobre TinyStoriesInstruct, DPO (episodio 7) y PPO con pesos KL de 0,05 y 0,5 (episodio 8), ademas de LoRA (episodio 9). Los episodios 20 y 21 anaden tool calling (una calculadora) y un agente con tres roles; el 24 y el 25 incorporan consultas en Cypher a smollerGraph. Los episodios 22 aplican extension de contexto mediante PI y YaRN hasta 4.096 tokens. No se detalla la composicion exacta de los datasets ni el numero total de tokens en la informacion disponible.

## Capacidades

- Generacion de texto en ingles sobre dominios acotados (cuentos simples con TinyStories, texto educativo con FineWeb-Edu).
- Razonamiento basico y continuacion de texto; no se documentan capacidades avanzadas de razonamiento.
- Ajuste a instrucciones mediante SFT sobre TinyStoriesInstruct.
- Alineacion con preferencias mediante DPO y PPO (checkpoints de los episodios 7 y 8).
- Tool calling: el checkpoint `tools` invoca una calculadora.
- Comportamiento de agente con tres roles (`agent`) y un cuarto rol para consultas Cypher (`graph-agent`).
- Extension de contexto hasta 4.096 tokens con PI y YaRN.
- Variantes de arquitectura: atencion, Hyena pura e hibrida Hyena-atencion.
- Modelado por difusion enmascarada (checkpoints del episodio 15).
- Capacidades multilingues: no disponibles; solo ingles.

## Casos de uso

- Docencia y aprendizaje de entrenamiento de LLM: cada checkpoint permite reproducir un episodio concreto (SFT, DPO, PPO, LoRA) y comparar el efecto de cada tecnica sobre el mismo modelo base.
- Experimentacion con alineacion: los checkpoints de DPO y PPO con distintos pesos KL permiten estudiar el compromiso entre fidelidad al modelo de referencia y optimizacion de recompensa en un entorno de bajo coste.
- Investigacion sobre tokenizacion: la comparacion entre tokenizacion por palabras y BPE (episodios 2, 10 y 11) sirve para medir el impacto del tokenizador en modelos pequenos.
- Estudio de arquitecturas eficientes: los checkpoints `web-hyena`, `web-hybrid` y `small-hyena-1024` permiten comparar Hyena frente a atencion en igualdad de receta y presupuesto de computo.
- Prototipado de agentes y tool calling: los checkpoints `tools`, `agent` y `graph-agent` sirven como banco de pruebas para disenar bucles de agente y llamadas a herramientas antes de escalar a modelos mayores.
- Extension de contexto: `long-pi` y `long-yarn` permiten evaluar tecnicas de extension de ventana en modelos de 110M parametros sin coste elevado.
- Difusion para generacion de texto: los checkpoints de difusion enmascarada permiten experimentar con decodificacion no autorregresiva en un entorno asequible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; un modelo de 14,6M a 110,2M parametros en fp32 ocupa aproximadamente entre 60 MB y 440 MB, y menos con cuantizacion, aunque el repositorio no documenta cuantizaciones.
- GPU recomendadas: cualquier GPU consumer moderna basta para inferencia; el entrenamiento de los checkpoints grandes se realizo en RTX 4090 (una o cuatro).
- Cabe en GPU consumer: si, en practicamente cualquier GPU con suficiente memoria para el checkpoint y el contexto.
- Opciones de despliegue: carga mediante `load_checkpoint` de la libreria mvGPT y PyTorch; para transformers y Transformers.js existe el modelo en `nenuadrian/mvGPT`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Los tiempos de entrenamiento documentados son de 10 a 30 minutos en portatil o en cuatro RTX 4090, y de 11,9 a 12,7 horas para los experimentos Hyena sobre 3,6B tokens en una RTX 4090.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mvGPT-checkpoints | 14,6M-110,2M | Hasta 4.096 en variantes long | Educativo, multi-tecnica | MIT | Hugging Face |
| TinyStories (modelos del paper) | ~1M-33M | No disponible | Generacion de cuentos | No disponible | No disponible |
| GPT-2 small | 124M | 1.024 | Transformer decoder-only | MIT | Amplia |
| SmolLM-135M | 135M | 2.048 | LLM pequeno preentrenado | Apache 2.0 | Hugging Face |

La comparativa es orientativa: mvGPT-checkpoints no compite en rendimiento con modelos preentrenados de escala similar, sino que documenta tecnicas de entrenamiento sobre dominios acotados.

## Limitaciones y advertencias

- Modelos de escala muy reducida (14,6M-110,2M parametros): capacidad limitada de razonamiento, conocimiento factual y generalizacion.
- Entrenados principalmente sobre TinyStories y FineWeb-Edu; el dominio y el estilo estan restringidos y no cubren tareas generales.
- Solo ingles; sin capacidades multilingues documentadas.
- Riesgo elevado de alucinacion y de respuestas incoherentes fuera de los dominios de entrenamiento.
- No son modelos alineados para uso en produccion ni para interaccion con usuarios finales sin supervision.
- La licencia MIT permite uso comercial, pero la calidad y la seguridad no estan garantizadas para aplicaciones reales.
- El contexto maximo solo se documenta para las variantes `long-pi` y `long-yarn` (4.096 tokens); para el resto no esta disponible.
- Los checkpoints son archivos `model.pt` especificos del codigo mvGPT; no son directamente compatibles con ecosistemas estandar sin conversion.
- No se documentan sesgos especificos, pero los datasets de origen (TinyStories, FineWeb-Edu) pueden introducir sesgos propios.

## Enlaces

- Hugging Face: https://huggingface.co/nenuadrian/mvGPT-checkpoints
- Modelo para transformers y Transformers.js: https://huggingface.co/nenuadrian/mvGPT
- Codigo mvGPT: https://github.com/nenuadrian/mvGPT
- Serie Minimum Viable GPT: https://mvgpt.nenuadrian.com
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Dataset TinyStoriesInstruct: https://huggingface.co/datasets/roneneldan/TinyStoriesInstruct
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu

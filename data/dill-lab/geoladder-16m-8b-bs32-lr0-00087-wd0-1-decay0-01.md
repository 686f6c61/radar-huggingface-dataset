# dill-lab/GeoLadder-16M-8B-bs32-lr0.00087-wd0.1-decay0.01

## Resumen

GeoLadder-16M-8B-bs32-lr0.00087-wd0.1-decay0.01 es un modelo de lenguaje de arquitectura tipo OLMo con 16 millones de parametros, desarrollado por el grupo de investigacion dill-lab (Atharva Kulkarni, Jacob Mitchell Springer, Arjun Subramonian y Swabha Swayamdipta). Forma parte de una suite de 108 modelos de entre 4M y 75M de parametros entrenados bajo variaciones controladas de batch size, weight decay, learning rate, presupuesto de tokens y LR final. El objetivo no es el rendimiento en tareas, sino estudiar la relacion entre la geometria de la matriz de unembedding (en particular su rango efectivo) y el rendimiento downstream.

El modelo concreto de esta ficha corresponde a la configuracion con 16M de parametros, 8.000 millones de tokens de entrenamiento, batch size de 32 secuencias de 2048 tokens, learning rate pico de 0.00087, weight decay de 0.1 y decaimiento coseno con alpha_f de 0.01. Se entrena sobre EleutherAI/the_pile_deduplicated y sigue el estilo de la familia Pythia en cuanto a la publicacion de checkpoints intermedios (41 branches accesibles).

Su relevancia es fundamentalmente cientifica: el paper asociado (ICML 2026) concluye que las metricas geometricas no predicen de forma fiable el rendimiento downstream, y que elecciones de preentrenamiento como el batch size y el weight decay moldean esas metricas de forma intensa. No es un modelo pensado para produccion ni para tareas generativas practicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo OLMo (OLMoForCausalLM, hf_olmo) |
| Parametros totales | 16M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | pytorch_model.bin |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura legacy `hf_olmo` expuesta como `OLMoForCausalLM`, un transformer decoder-only. Requiere la instalacion del paquete `ai2-olmo` para registrar la clase en `transformers`. La longitud de secuencia de entrenamiento es de 2048 tokens y el entrenamiento consume 8.000 millones de tokens del dataset EleutherAI/the_pile_deduplicated.

La configuracion de entrenamiento queda fijada por el nombre del repositorio: batch size de 32 secuencias, learning rate pico de 0.00087, weight decay de 0.1 y un schedule coseno con learning rate final igual al 1 % del pico (alpha_f = 0.01). El modelo forma parte de un estudio factorial sobre 108 configuraciones que varia estos hiperparametros; cada combinacion da lugar a un modelo independiente. El repositorio publica 41 checkpoints intermedios como branches (`step0` hasta `step122081`), con `main` apuntando al checkpoint final. Tambien se incluyen `data-indices/` y `train_data/global_indices.npy` con el orden de los datos de entrenamiento, siguiendo la practica de la suite Pythia.

No se documentan en la informacion disponible fases de RLHF, DPO ni decodificacion especulativa. La innovacion del trabajo es analitica (medicion del rango efectivo de la matriz de unembedding y su correlacion con el rendimiento), no arquitectonica.

## Capacidades

- Generacion de texto autorregresiva basica, limitada por su tamano de 16M de parametros.
- Modelado de lenguaje a nivel de token sobre dominio general (Pile deduplicado).
- Utilidad como sujeto de experimentos de interpretabilidad y analisis geometrico de representaciones.
- Reproduccion de estudios de escalado y de hiperparametros con checkpoints intermedios accesibles.
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No se documenta thinking mode, vision, audio ni capacidades multimodales.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion sobre geometria de representaciones: analizar el rango efectivo de la matriz de unembedding a lo largo de los 41 checkpoints publicados y contrastarlo con las conclusiones del paper.
- Estudio del efecto de hiperparametros: al existir 108 modelos de la misma familia, permite aislar el impacto de batch size, weight decay y learning rate sobre metricas internas.
- Reproducibilidad de experimentos de escalado: el checkpoint final y los intermedios permiten replicar curvas de perdida y compararlas con la suite Pythia.
- Docencia y formacion: un modelo de 16M de parametros entrena e infiere en CPU, lo que lo hace util para demostraciones didacticas de pipelines de preentrenamiento OLMo.
- Pruebas de infraestructura: sirve como modelo de humo para validar entornos de despliegue, carga de checkpoints `hf_olmo` y versionado por branches.
- Analisis de trayectorias de entrenamiento: los indices de datos (`data-indices/`, `global_indices.npy`) permiten estudiar memorizacion y orden de muestreo.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion, RAG, agentes ni ninguna tarea que requiera calidad generativa real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El paper asociado no reporta metricas estandar tipo MMLU, HumanEval o GSM8K para este modelo individual; su foco es la relacion entre metricas geometricas y rendimiento, y concluye que dicha relacion es inconsistente. Cualquier cifra de rendimiento downstream no esta disponible en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision fp32 (16M de parametros ocupan aproximadamente 64 MB en fp32 y unos 32 MB en fp16). El repositorio completo ocupa 4,9 GB por acumular 41 checkpoints.
- GPU recomendadas: cualquier GPU moderna; el modelo es lo bastante pequeno para ejecutarse en CPU sin problemas. GPU dedicada no es necesaria.
- Cabe en cualquier GPU de consumo (GTX 1050, RTX 3060, RTX 4090) y tambien en CPU y en entornos sin acelerador.
- Opciones de despliegue: `transformers` con `hf_olmo` instalado (via `AutoModelForCausalLM.from_pretrained`). No hay evidencia de soporte en vLLM, llama.cpp, Ollama o TGI; el formato `pytorch_model.bin` sin conversion a GGUF limita las opciones fuera del stack HuggingFace.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokens de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GeoLadder-16M-8B (este modelo) | 16M | 2048 | 8B | no disponible | HuggingFace (dill-lab) |
| Pythia-14M | 14M | 2048 | 300B | Apache 2.0 | HuggingFace (EleutherAI) |
| OLMo-1B | 1.2B | 2048 | 2B-3B | Apache 2.0 | HuggingFace (allenai) |

La comparativa con Pythia-14M es la mas directa en tamano y diseno de publicacion de checkpoints, aunque GeoLadder entrena con muchas menos tokens (8B frente a 300B) y con un proposito exclusivamente analitico. OLMo-1B se incluye como referencia de la misma familia arquitectonica, pero difiere en dos ordenes de magnitud en parametros. No se dispone de benchmarks comparativos publicados para este modelo.

## Limitaciones y advertencias

- Modelo de investigacion con 16M de parametros: su calidad generativa es muy limitada y no es apto para tareas de produccion.
- Sesgos conocidos: no documentados en la informacion disponible; al entrenar sobre The Pile deduplicado hereda los sesgos de dicha fuente.
- Riesgo de alucinacion: alto, inherente a un modelo de este tamano sin ajuste por instrucciones ni RLHF.
- Limitacion de contexto: 2048 tokens, fijado por la longitud de secuencia de entrenamiento.
- Idiomas soportados: no disponibles; el dataset base es mayoritariamente ingles.
- Licencia: no disponible, lo que impide confirmar condiciones de uso comercial. Se debe contactar con los autores antes de cualquier uso fuera de investigacion.
- Formato de pesos `pytorch_model.bin` sin version cuantizada ni GGUF, lo que restringe el despliegue a `transformers` con `hf_olmo`.
- El modelo resuelve una pregunta de investigacion concreta y no esta optimizado para ninguna tarea practica; las conclusiones del paper indican que la geometria interna no predice de forma fiable el rendimiento, lo que subraya su caracter exploratorio.

## Enlaces

- HuggingFace: https://huggingface.co/dill-lab/GeoLadder-16M-8B-bs32-lr0.00087-wd0.1-decay0.01
- Coleccion GeoLadder: https://huggingface.co/collections/dill-lab/geoladder-6acd192e30ec71aff2998e2e
- Paper (PMLR): https://proceedings.mlr.press/v306/kulkarni26c.html
- arXiv: https://arxiv.org/abs/2602.20433
- OpenReview: https://openreview.net/forum?id=kNb6NNhKgE
- Dataset: https://huggingface.co/datasets/EleutherAI/the_pile_deduplicated

# dill-lab/GeoLadder-16M-8B-bs256-lr0.0087-wd0.1-decay0.01

## Resumen

GeoLadder-16M-8B-bs256-lr0.0087-wd0.1-decay0.01 es un modelo de lenguaje causal de estilo OLMo desarrollado por el grupo dill-lab, con 16 millones de parametros entrenado sobre 8.000 millones de tokens del corpus deduplicado EleutherAI/the_pile_deduplicated. No es un modelo pensado para produccion, sino un artefacto de investigacion: forma parte de una suite de 108 modelos de entre 4M y 75M de parametros liberados junto al articulo "Disentangling Geometry, Performance, and Training in Language Models" (ICML 2026, PMLR 306).

El objetivo del trabajo es estudiar si las metricas geometricas de la matriz de unembedding, en particular su rango efectivo, permiten estimar el rendimiento downstream de un modelo. La conclusion principal es que la relacion es inconsistente: un rango efectivo alto suele acompanar a los mejores modelos, pero no de forma universal, y el rango bajo coincide con degradacion tardia en lugar de causarla. Los hiperparametros de preentrenamiento (tamano de batch, weight decay) moldean fuertemente estas metricas geometricas, pero ninguno predice de forma fiable el rendimiento.

El repositorio contiene 16 checkpoints publicados como ramas (step0 a step15269, con `main` apuntando al checkpoint final), siguiendo el esquema de la suite Pythia. Es relevante para quienes investigan escalado, dinamica de entrenamiento o interpretabilidad, no para tareas de generacion practicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de estilo OLMo (`OLMoForCausalLM`, arquitectura legacy `hf_olmo`) |
| Parametros totales | 16M |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2048 tokens (secuencias de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `pytorch_model.bin` (PyTorch), con `config.json` (HF) y `config.yaml` (OLMo original) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura OLMo en su version legacy, un transformer causal decoder-only registrado en `transformers` mediante el paquete `ai2-olmo` (`OLMoForCausalLM`). Se entreno sobre EleutherAI/the_pile_deduplicated durante 8.000 millones de tokens con secuencias de 2048 tokens. Los hiperparametros declarados son: batch size de 256 secuencias, learning rate pico de 0.0087, weight decay de 0.1 y schedule coseno con `alpha_f` de 0.01 (LR final como fraccion del pico). No se menciona en la informacion disponible ninguna fase de RLHF, DPO o ajuste por instrucciones.

El interes tecnico no esta en la arquitectura en si, sino en el protocolo experimental: la suite completa barre de forma controlada tamano de batch, weight decay, learning rate, presupuesto de tokens y LR final para aislar como cada eleccion afecta a la geometria de la matriz de unembedding (rango efectivo) y como esta se relaciona con el rendimiento. El repositorio conserva el orden de entrenamiento de los datos en `data-indices/` y `train_data/global_indices.npy`, lo que permite reproducir exactamente que tokens vio cada checkpoint.

## Capacidades

- Generacion de texto causal autoregresiva basica, limitada por el tamano del modelo (16M de parametros).
- Modelado de lenguaje y continuacion de texto sobre dominio general en ingles (corpus Pile), aunque el soporte de idiomas no se declara explicitamente.
- Analisis de geometria interna: es un sujeto de estudio para medir rango efectivo de la matriz de unembedding y otras metricas representacionales.
- Reproduccion de trayectorias de entrenamiento gracias a los 16 checkpoints intermedios y los indices de datos.
- No hay evidencia declarada de soporte de tool calling, function calling, uso agentico ni razonamiento multi-paso.
- No se declara soporte de vision, audio ni modo de pensamiento (thinking mode).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion sobre geometria de representaciones: usar los checkpoints intermedios para medir como evoluciona el rango efectivo de la matriz de unembedding a lo largo del entrenamiento y correlacionarlo con la perdida.
- Estudios de escalado controlado: el barrido de batch size, weight decay y LR permite analizar el efecto aislado de cada hiperparametro en modelos pequenos y baratos de entrenar.
- Ablaciones de curriculum y orden de datos: los indices de datos guardados permiten reentrenar con orden alterado y comparar con la referencia.
- Reproducibilidad de resultados de un paper: sirve para verificar experimentalmente las conclusiones del articulo de ICML 2026 sobre la inconsistencia entre rango efectivo y rendimiento.
- Docencia y prototipado rapido: al ser un modelo minimo (16M), puede ejecutarse en CPU para demostrar el pipeline completo de un transformer causal sin requerir GPU.
- Pruebas de infraestructura: validacion de cargas de `hf_olmo` con `transformers`, gestion de ramas de checkpoints y pipelines de evaluacion ligeros antes de escalar a modelos mayores.
- Baseline de comparacion: referencia de un modelo diminuto dentro de una suite homogenea para contrastar tecnicas de inicializacion, regularizacion o decodificacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El articulo asociado analiza metricas geometricas (rango efectivo) frente a rendimiento downstream, pero la model card no incluye cifras concretas de MMLU, HumanEval, GSM8K ni equivalentes.

## Requisitos de hardware

- VRAM estimada: minima. Con 16M de parametros, en fp32 el modelo ocupa aproximadamente 64 MB, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- El tamano del repositorio (1,9 GB) se debe a los 16 checkpoints en ramas, no al modelo en si.
- GPU recomendadas: cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) o incluso ejecucion en CPU; no requiere A100 ni H100.
- Cabe en GPU consumer: si, en cualquier modelo con al menos ~256 MB de VRAM libre.
- Opciones de despliegue: `transformers` con el paquete `ai2-olmo` (imprescindible para registrar `OLMoForCausalLM`). No se declara compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y el formato `pytorch_model.bin` no es GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato de checkpoints | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GeoLadder-16M (este) | 16M | 2048 tokens | Ramas `step0`-`step15269` + `main` | no disponible | HuggingFace (0 descargas) |
| Suite GeoLadder completa | 4M-75M | 2048 tokens | Varios repos en la coleccion | no disponible | Coleccion HuggingFace dill-lab/geoladder |
| Suite Pythia (referencia metodologica citada) | Desde ~70M en adelante | no disponible en la fuente | Ramas por step | no disponible en la fuente | HuggingFace (referenciada en la model card) |
| Modelos OLMo estandar | no disponible en la fuente | no disponible en la fuente | no disponible en la fuente | no disponible en la fuente | HuggingFace |

La model card cita explicitamente a la suite Pythia como referente para el esquema de checkpoints por rama. No se dispone de mas datos comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion con 16M de parametros: su capacidad de generacion es muy limitada y no es apto para tareas reales de produccion.
- Riesgo alto de alucinacion y de texto incoherente en generaciones largas.
- Licencia no especificada: no se puede asumir uso comercial sin consultar al autor; tratelo como restringido hasta confirmacion.
- Idiomas soportados no declarados; el corpus Pile es predominantemente ingles, por lo que el rendimiento en castellano es dudoso.
- Contexto limitado a 2048 tokens.
- No se documentan sesgos evaluados, filtros de seguridad ni alineacion (sin RLHF/DPO declarados).
- Requiere el paquete `ai2-olmo` para cargar el modelo, ya que usa la arquitectura legacy `hf_olmo`; puede no ser compatible con versiones recientes de `transformers` sin ese paquete.
- El repositorio es pesado (1,9 GB) por acumular checkpoints; descargue solo la revision que necesite.
- Sin descargas ni likes registrados y creado en 2026: trazabilidad y comunidad practicamente nulas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dill-lab/GeoLadder-16M-8B-bs256-lr0.0087-wd0.1-decay0.01
- Coleccion GeoLadder: https://huggingface.co/collections/dill-lab/geoladder-6acd192e30ec71aff2998e2e
- Paper (PMLR): https://proceedings.mlr.press/v306/kulkarni26c.html
- arXiv: https://arxiv.org/abs/2602.20433
- OpenReview: https://openreview.net/forum?id=kNb6NNhKgE
- Dataset de entrenamiento: https://huggingface.co/datasets/EleutherAI/the_pile_deduplicated
- Paquete para carga del modelo (`hf_olmo` / `ai2-olmo`): no disponible enlace directo en la informacion proporcionada

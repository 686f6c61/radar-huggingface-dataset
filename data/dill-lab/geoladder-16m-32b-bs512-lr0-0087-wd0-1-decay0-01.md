# dill-lab/GeoLadder-16M-32B-bs512-lr0.0087-wd0.1-decay0.01

## Resumen

GeoLadder-16M-32B-bs512-lr0.0087-wd0.1-decay0.01 es un modelo de lenguaje autorregresivo de tipo OLMo, con 16 millones de parametros, publicado por el grupo dill-lab como parte de una suite de 108 modelos de entre 4M y 75M de parametros. No es un modelo pensado para uso finalista, sino un artefacto de investigacion: cada miembro de la suite se entreno variando de forma controlada el tamano de lote, el weight decay, la tasa de aprendizaje, el presupuesto de tokens y la decaida final de LR, con el objetivo de estudiar como esas decisiones de preentrenamiento afectan a la geometria interna del modelo.

El modelo se entreno sobre EleutherAI/the_pile_deduplicated durante 32.000 millones de tokens, con secuencias de 2048 tokens, tamano de lote de 512 secuencias, LR pico de 0.0087, weight decay de 0.1 y un `alpha_f` de 0.01 en un schedule coseno. Forma parte del trabajo "Disentangling Geometry, Performance, and Training in Language Models" (ICML 2026, PMLR 306), cuyos autores son Atharva Kulkarni, Jacob Mitchell Springer, Arjun Subramonian y Swabha Swayamdipta.

Su relevancia es metodologica: la tesis del paper es que la geometria de la matriz de unembedding (en concreto su rango efectivo) no predice de forma fiable el rendimiento downstream, y que son las decisiones de preentrenamiento las que moldean esas metricas geometricas. Este repositorio concreto es una de las configuraciones de esa matriz experimental, con checkpoints intermedios publicados como ramas para permitir analisis de dinamica de entrenamiento paso a paso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo OLMo (clase `OLMoForCausalLM`, ecosistema `hf_olmo`) |
| Parametros totales | 16M |
| Parametros activos | no procede (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens (longitud de secuencia de entrenamiento; maximo declarado en config: no disponible) |
| Tipos de cuantizacion | no disponible (el repo solo distribuye `pytorch_model.bin` sin versiones cuantizadas) |
| Idiomas soportados | no disponible (el corpus de entrenamiento, the_pile_deduplicated, es mayoritariamente en ingles) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`pytorch_model.bin`); no se distribuyen safetensors ni GGUF |
| Tamano del repositorio | 2.9 GB (incluye 23 ramas con checkpoints de distintos pasos) |
| Dataset de entrenamiento | EleutherAI/the_pile_deduplicated |
| Tokens de entrenamiento | 32.000 millones |
| Batch size | 512 secuencias de 2048 tokens |
| LR pico / weight decay | 0.0087 / 0.1 |
| Decaida de LR (`alpha_f`, coseno) | 0.01 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con la implementacion OLMo de AI2, cargable mediante la libreria `hf_olmo`, que registra `OLMoForCausalLM` en `transformers`. Se trata de la variante legacy del stack OLMo, no de OLMo 2. El modelo tiene 16M de parametros y procesa secuencias de 2048 tokens. No hay informacion disponible sobre el numero de capas, dimensiones del modelo, cabezas de atencion ni si emplea componentes adicionales como RoPE, SwiGLU o atencion con sesgo, ya que la model card no incluye esos detalles.

El entrenamiento se realizo sobre la version deduplicada de the Pile durante 32.000 millones de tokens, con lote de 512 secuencias, LR pico de 0.0087, weight decay de 0.1 y schedule coseno con LR final equivalente al 1% del pico (`alpha_f = 0.01`). No hay indicios de ajuste por instrucciones, RLHF o DPO: es un modelo exclusivamente preentrenado. La innovacion del trabajo no esta en el modelo en si, sino en el diseno experimental: 108 modelos entrenados con variaciones controladas de hiperparametros para medir el rango efectivo de la matriz de unembedding y comprobar si correlaciona con el rendimiento downstream. El paper concluye que la relacion es inconsistente, que el rango alto suele acompanar a los mejores modelos pero no de forma universal, y que el rango bajo coexiste con la degradacion tardia en lugar de causarla.

El repositorio publica 23 checkpoints como ramas (`step0` a `step30528`, con `main` apuntando al checkpoint final). Cada rama incluye `pytorch_model.bin`, el `config.json` de HuggingFace y el `config.yaml` original de OLMo. Ademas, `data-indices/` y `train_data/global_indices.npy` registran el orden exacto de los datos de entrenamiento, lo que permite reproducir que tokens vio el modelo en cada paso.

## Capacidades

- Generacion de texto autoregresiva basica, sin ajuste por instrucciones ni plantilla de chat.
- Modelado de lenguaje causal: calculo de perplejidad y probabilidades de secuencia, util para analisis de corpus.
- Reproduccion experimental: al publicar el orden de datos (`global_indices.npy`), permite analisis exactos de que datos produjeron que comportamiento.
- Analisis de dinamica de entrenamiento: las 23 ramas permiten estudiar la evolucion de representaciones, rango efectivo de la matriz de unembedding y metricas geometricas a lo largo del entrenamiento.
- Capacidades multilingues: no declaradas; el corpus es mayoritariamente angloparlante.
- Tool calling / function calling: no soportado.
- Uso como agente o razonamiento multi-paso: no soportado.
- Vision, audio o modalidades adicionales: no soportado.
- Modo de razonamiento explicito (thinking mode): no disponible.

Es importante subrayar que, con 16M de parametros, la competencia linguistica del modelo es muy limitada: no debe esperarse coherencia a nivel de parrafo ni seguimiento de instrucciones.

## Casos de uso

- Investigacion sobre leyes de escala a baja escala: el modelo permite entrenar y evaluar decenas de configuraciones con coste computacional minimo, aislando el efecto de hiperparametros concretos (aqui, LR pico 0.0087 con batch 512 y weight decay 0.1) sin el ruido de modelos grandes.
- Estudio de geometria de representaciones: con los 23 checkpoints intermedios se puede trazar la evolucion del rango efectivo de la matriz de unembedding paso a paso y contrastarla con la perdida de validacion.
- Reproducibilidad de experimentos de preentrenamiento: `data-indices/` y `global_indices.npy` permiten reconstruir exactamente la secuencia de datos, algo poco habitual en suites publicadas y clave para replicar resultados.
- Ablaciones de regimen de entrenamiento: comparar esta rama con las otras 107 del mismo autor para aislar el impacto de variar un solo hiperparametro (batch, weight decay, LR o presupuesto de tokens).
- Docencia y formacion: un modelo de 16M de parametros se entrena y se inspecciona en una sola GPU consumer o incluso en CPU, lo que lo hace util para explicar el ciclo completo de preentrenamiento en cursos de NLP.
- Analisis de degradacion tardia del entrenamiento: el paper asocia el rango efectivo bajo con degradacion en fases finales; estos checkpoints permiten inspeccionar ese fenomeno directamente en las ultimas ramas.
- Pruebas de infraestructura y pipeline: sirve como modelo de humo para validar tooling de carga (`hf_olmo` + `transformers`), conversion de formatos o extraccion de matrices de pesos antes de escalar a modelos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni de ningun otro conjunto de evaluacion, y la busqueda web no aporto datos adicionales sobre el modelo. Cualquier cifra de rendimiento que se quiera usar debera medirse directamente sobre los checkpoints publicados.

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 64 MB en fp32 y unos 32 MB en fp16/bf16 para los 16M de parametros, sin contar el cache de claves y valores ni el overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; se puede ejecutar en GTX 1050, RTX 3060, RTX 4090, A100 o H100 sin ninguna restriccion practica. La eleccion de GPU vendra determinada por el numero de experimentos en paralelo, no por el modelo.
- GPU consumer: si, cabe holgadamente en cualquier GPU consumer e incluso en CPU. El cuello de botella real es la memoria de sistema, porque el repositorio completo ocupa 2.9 GB por las 23 ramas de checkpoints, no por el modelo en si.
- Despliegue: el modelo requiere `ai2-olmo` instalado junto a `transformers` para registrar `OLMoForCausalLM`. No se distribuyen pesos en GGUF, por lo que llama.cpp u Ollama exigirian una conversion previa a partir de `pytorch_model.bin`. vLLM y TGI no estan verificados con esta arquitectura legacy en la informacion disponible.
- Entrenamiento o fine-tuning: con optimizador AdamW, el estado completo (parametros, gradientes y dos momentos) ronda los 256 MB en fp32, por lo que el ajuste fino es viable en cualquier GPU consumer.
- Latencia y throughput: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Datos de entrenamiento | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| GeoLadder-16M-32B (este) | 16M | 2048 tokens | the_pile_deduplicated, 32B tokens | no disponible | no disponible |
| Pythia-14M (EleutherAI) | 14M | 2048 tokens | the Pile | Apache 2.0 | benchmark publicados por EleutherAI |
| Pythia-31M (EleutherAI) | 31M | 2048 tokens | the Pile | Apache 2.0 | benchmark publicados por EleutherAI |
| GPT-2 small (OpenAI) | 124M | 1024 tokens | WebText | MIT | benchmark publicados por OpenAI |

La comparacion mas directa es con la suite Pythia, que sigue una filosofia similar de checkpoints intermedios publicados y arquitectura transformer convencional sobre the Pile. La diferencia principal es el proposito: Pythia se diseno como suite de referencia general, mientras que GeoLadder se diseno especificamente para estudiar la relacion entre geometria interna y rendimiento mediante variaciones controladas de hiperparametros. No se dispone de datos de rendimiento de este modelo para comparar numeros.

## Limitaciones y advertencias

- Tamano muy reducido: con 16M de parametros, la calidad de generacion es muy baja; no es apto para produccion, atencion al cliente, generacion de codigo ni ninguna tarea que exija coherencia sostenida.
- Ausencia de ajuste por instrucciones: no sigue ordenes, no tiene plantilla de chat y no responde de forma util a prompts conversacionales.
- Riesgo elevado de alucinacion: sin alineamiento ni ajuste, el modelo continuara el texto de forma estadistica sin ninguna garantia de veracidad.
- Sesgos del corpus: the_pile_deduplicated contiene texto web diverso sin filtrar por sesgo; los sesgos presentes en el corpus se reproducira en las salidas.
- Idioma: no se declaran idiomas soportados y el corpus es mayoritariamente ingles; el rendimiento en castellano sera previsiblemente pobre.
- Licencia no disponible: al no haberse declarado licencia, no hay autorizacion explicita para uso comercial. Debe contactarse con el autor antes de cualquier uso fuera del ambito de investigacion.
- Dependencia de software legacy: requiere `ai2-olmo` y la ruta de carga `hf_olmo` con `OLMoForCausalLM`; no es un modelo cargable directamente con `transformers` sin ese paquete.
- Formato de pesos antiguo: solo `pytorch_model.bin`, sin safetensors, lo que implica cargar mediante pickle y complica la integracion con stacks modernos de inferencia.
- Longitud de contexto: la ventana declarada en entrenamiento es de 2048 tokens; no se ha verificado el comportamiento con extrapolacion a secuencias mas largas.
- 23 ramas en un unico repositorio: la descarga completa son 2.9 GB. Conviene fijar `revision` en la llamada a `from_pretrained` para no descargar todo el historial.
- Sin datos de benchmarks: no hay ninguna evaluacion estandar publicada, por lo que no se puede afirmar su calidad relativa frente a alternativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dill-lab/GeoLadder-16M-32B-bs512-lr0.0087-wd0.1-decay0.01
- Coleccion GeoLadder con los 108 modelos: https://huggingface.co/collections/dill-lab/geoladder-6acd192e30ec71aff2998e2e
- Paper en PMLR (ICML 2026, volumen 306): https://proceedings.mlr.press/v306/kulkarni26c.html
- Preprint en arXiv: https://arxiv.org/abs/2602.20433
- Revision en OpenReview: https://openreview.net/forum?id=kNb6NNhKgE
- Dataset de entrenamiento: https://huggingface.co/datasets/EleutherAI/the_pile_deduplicated

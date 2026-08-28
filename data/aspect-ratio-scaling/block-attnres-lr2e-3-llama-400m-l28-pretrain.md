# aspect-ratio-scaling/block-attnres-lr2e-3-llama-400M-L28-pretrain

## Resumen

El modelo `block-attnres-lr2e-3-llama-400M-L28-pretrain` es un checkpoint crudo de entrenamiento publicado por el equipo de aspect-ratio-scaling dentro de su colección AttnRes. Forma parte de una línea de investigación sobre *Attention Residuals* (AttnRes), una técnica que sustituye la acumulación fija de conexiones residuales en transformers por un mecanismo de atención softmax sobre las salidas de capas anteriores, con el objetivo de mitigar la dilución de las contribuciones de cada capa en modelos profundos.

Este checkpoint concreto corresponde a la variante **Block AttnRes** (atención residual por bloques de aproximadamente 8 capas) sobre una arquitectura tipo Llama de unos 400 millones de parámetros (el directorio fuente indica 350M, hay discrepancia) y 28 capas. Se entrenó con una ventana de contexto de 8192 tokens y una tasa de aprendizaje de 2e-3 con schedule coseno. El repositorio contiene los pasos intermedios `step0`, `step3000`, `step6000` y `step7600`, siendo este último el más avanzado.

Es importante señalar que se trata de un **checkpoint distribuido en formato OLMo-core**, no de un export listo para `from_pretrained()`. Para utilizarlo es necesario descargar el repositorio y cargarlo con las utilidades de OLMo-core, como `load_model_and_optim_state()`. No se dispone de licencia declarada ni de información sobre idiomas o pipeline de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo Llama con Block AttnRes (≈8 bloques) |
| Parametros totales | ~400M (nombre del repo) / ~350M (directorio fuente) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 8192 tokens (segun el paper de AttnRes) |
| Tipos de cuantizacion | no disponible (checkpoint crudo, sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Checkpoint crudo distribuido de OLMo-core (no safetensors estandar) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura transformer causal de Llama, pero modifica el mecanismo de conexiones residuales. En lugar de sumar todas las salidas de capas anteriores con pesos fijos unitarios (como hace PreNorm), *Attention Residuals* (AttnRes) introduce una atención softmax sobre las salidas de las capas precedentes, permitiendo que cada capa seleccione dinámicamente qué información residual priorizar. La variante **Block AttnRes** aplica esta atención residual por bloques de aproximadamente 8 capas, en lugar de sobre toda la profundidad (Full AttnRes).

El entrenamiento se realizó con una ventana de contexto de 8192 tokens, un schedule de learning rate coseno y una tasa de aprendizaje de 2e-3 (como indica el nombre del repo). El checkpoint almacenado incluye los pasos 0, 3000, 6000 y 7600, lo que sugiere que el entrenamiento aún no había concluido en el momento de la subida. El paper asociado (arXiv:2603.15031) describe un barrido de cinco tamaños de modelo con tres variantes cada uno (PreNorm baseline, Full AttnRes y Block AttnRes), aunque no se especifican los tamaños exactos en el resumen disponible.

## Capacidades

- Generacion de texto causal: al ser un modelo de lenguaje autorregresivo, puede generar texto continuando un prompt dado.
- Investigacion en escalado profundo: su principal valor es permitir estudiar el efecto de la atencion residual en modelos profundos (28 capas).
- Reproducibilidad: al incluir checkpoints intermedios, permite analizar la dinamica de entrenamiento paso a paso.
- No se dispone de informacion sobre soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision o audio.
- Capacidades multilingues: no declaradas.

## Casos de uso

- Investigacion academica sobre arquitecturas de atencion: el modelo permite reproducir y extender los experimentos del paper AttnRes, comparando el comportamiento de Block AttnRes frente a baselines PreNorm y Full AttnRes en tareas de lenguaje.
- Analisis de la dinamica de entrenamiento: gracias a los checkpoints intermedios (step0 a step7600), se puede estudiar la evolucion de la perdida, la magnitud de los gradientes y la contribucion residual a lo largo del entrenamiento.
- Estudio de la dilucion de capas en modelos profundos: util para investigadores que quieran medir como la atencion residual afecta a la representacion interna en modelos de 28 capas.
- Desarrollo de nuevas tecnicas de regularizacion o normalizacion: el checkpoint sirve como punto de partida para probar modificaciones sobre la arquitectura AttnRes.
- Comparacion de escalado en profundidad: permite contrastar el rendimiento de un modelo de ~400M con 28 capas frente a otros de similar tamano pero menor profundidad.
- Educacion y divulgacion: como ejemplo practico de implementacion de atencion residual en OLMo-core, util para cursos avanzados de arquitecturas de deep learning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper de AttnRes (arXiv:2603.15031) menciona experimentos con cinco tamanos de modelo, pero no se incluyen cifras concretas de MMLU, HumanEval, GSM8K u otros en el resumen accesible. Tampoco se proporcionan metricas de perplejidad o accuracy en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo denso de ~400M parametros, en precision fp32 ocuparia aproximadamente 1.6 GB solo en pesos. Con cuantizacion a 8 bits podria reducirse a unos 400 MB, aunque no se ofrecen cuantizaciones precalculadas.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM podria ejecutar inferencia con el modelo en fp32 (p.ej. GTX 1660, RTX 3050). Para entrenamiento o fine-tuning se recomendaria una GPU con 8-12 GB (RTX 3080, RTX 4070) o una A100/H100 para reproducir los experimentos originales.
- El checkpoint crudo ocupa 9.8 GB en disco (434 archivos, 9.13 GiB de datos utiles), por lo que se necesita espacio de almacenamiento adicional.
- Opciones de despliegue: no es directamente compatible con vLLM, llama.cpp u Ollama debido a su formato OLMo-core. Habria que convertirlo previamente a safetensors o GGUF. Para uso inmediato, se recomienda cargarlo con OLMo-core y ejecutar inferencia local.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| block-attnres-lr2e-3-llama-400M-L28 | ~400M | 8192 | Llama + Block AttnRes | no disponible | Checkpoint crudo OLMo-core |
| attnres-lr2e-3-llama-400M-L28 (Full AttnRes) | ~400M | 8192 | Llama + Full AttnRes | no disponible | Checkpoint crudo OLMo-core |
| Llama-350M (baseline PreNorm) | ~350M | 8192 (segun paper) | Llama estandar | no disponible | No publicado en este repo |

No se dispone de datos de rendimiento comparativo. La comparativa se limita a diferencias arquitectonicas (Block vs Full AttnRes vs PreNorm) dentro de la misma familia de experimentos.

## Limitaciones y advertencias

- Checkpoint crudo: no es un modelo listo para `from_pretrained()`. Requiere herramientas especificas de OLMo-core para cargarlo, lo que dificulta su uso en pipelines estandar de HuggingFace.
- Entrenamiento incompleto: el ultimo paso guardado es `step7600`, sin informacion sobre el numero total de pasos previstos. El modelo puede no estar convergido.
- Sin licencia declarada: no se especifican condiciones de uso comercial ni de redistribucion. Se recomienda contactar con el autor antes de cualquier uso en produccion.
- Sesgos y alucinaciones: no se ha evaluado el modelo en estos aspectos. Como todo LLM, puede generar contenido incorrecto o sesgado.
- Idioma: no se indica el corpus de entrenamiento ni los idiomas soportados. Es probable que el entrenamiento se haya realizado principalmente con datos en ingles, pero no es verificable.
- Discrepancia en el tamano: el nombre del repo indica 400M mientras que el directorio fuente menciona 350M. Esto puede afectar a la interpretacion de los resultados.
- Sin cuantizaciones: no se ofrecen versiones cuantizadas, lo que limita su despliegue en entornos con poca memoria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/aspect-ratio-scaling/block-attnres-lr2e-3-llama-400M-L28-pretrain
- Coleccion AttnRes en HuggingFace: https://huggingface.co/collections/aspect-ratio-scaling/attnres
- Repo hermano (Full AttnRes): https://huggingface.co/aspect-ratio-scaling/attnres-lr2e-3-llama-400M-L28-pretrain
- Paper arXiv (Attention Residuals): https://arxiv.org/abs/2603.15031
- PDF del paper: https://arxiv.org/pdf/2603.15031
- Analisis del paper en EmergentMind: https://www.emergentmind.com/papers/2603.15031

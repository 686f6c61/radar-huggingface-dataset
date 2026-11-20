# Kai9987kai/supermix-v88

## Resumen

Supermix v88 es un checkpoint intermedio de la familia Supermix, desarrollada por el usuario Kai9987kai. Se trata de un modelo de lenguaje de arquitectura MiMoMix, una variante de mezcla de expertos (MoE) con un nucleo de razonamiento recursivo (Recursive Thinking Core), disenado especificamente para tareas de razonamiento matematico, fisica y razonamiento sobre codigo. Con 30,2 millones de parametros totales y solo 5,69 millones activos por token, es un modelo de escala muy reducida orientado a experimentacion e investigacion mas que a produccion.

El modelo se publica como hito independiente del fichero `v88_corpus.selected.pt`, actuando como puente entre las versiones v87 y v89 de la misma familia. Su relevancia es limitada fuera del contexto de su propio proyecto: no cuenta con descargas ni interacciones en Hugging Face, y su model card se centra en metricas de entrenamiento internas (perdida en distintos niveles de generalizacion, precision de sondas) mas que en evaluaciones estandar de la comunidad.

La informacion disponible sobre idiomas, composicion del dataset y capacidades practicas es muy escasa. Esta ficha refleja fielmente lo que el autor documenta y marca como no disponible todo aquello que no aparece en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiMoMix MoE + Recursive Thinking Core (transformer con mezcla de expertos) |
| Parametros totales | 30.211.709 |
| Parametros activos | 5.693.933 por token (64 expertos enrutados, top-2) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en PyTorch) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura MiMoMix de mezcla de expertos con 64 expertos enrutados y seleccion top-2 por token, lo que explica la gran diferencia entre parametros totales (30,2 M) y activos (5,69 M). Incorpora ademas dos capas de borrador especulativo MTP (Multi-Token Prediction) y un componente denominado Recursive Thinking Core orientado al razonamiento. El checkpoint seleccionado corresponde al paso 21.000, elegido por criterio de precision (`selected_on = accuracy`), con una precision de sonda durante el entrenamiento de 0,95 y una `best_dev_loss` de 0,025629.

El autor reporta metricas de generalizacion por niveles: perdida de 0,014598 en `tier1_seen_response` y de 0,195604 en `tier3_unseen_sentence`, con las 5 de 5 comprobaciones de generalizacion de la version v58 superadas. No se documenta el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. Los resultados se declaran verificados en CPU sobre Windows.

## Capacidades

- Generacion de texto condicionada a tareas de razonamiento, matematicas, fisica y razonamiento sobre codigo (segun las etiquetas del autor).
- Razonamiento multi-paso mediante el componente Recursive Thinking Core.
- Decodificacion especulativa mediante dos capas MTP de borrador.
- Enrutamiento disperso por mezcla de expertos (top-2 sobre 64 expertos).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, modo thinking explicito): no disponible.

## Casos de uso

- Experimentacion en investigacion sobre MoE: el modelo sirve como banco de pruebas de bajo coste para estudiar enrutamiento top-2 sobre 64 expertos y decodificacion especulativa con capas MTP en entornos de CPU.
- Prototipado de razonamiento matematico y fisico: dado su enfoque declarado, puede emplearse para validar pipelines de generacion de soluciones paso a paso en dominios cientificos antes de escalar a modelos mayores.
- Generacion y razonamiento sobre codigo a pequena escala: util para probar flujos de asistencia a la programacion en local sin requisitos de GPU.
- Reproduccion de resultados academicos: al incluir ficheros de recibos (`generalisation_results.json`, `supervised_run.json`), permite replicar las metricas reportadas por el autor.
- Educacion y demostraciones: su tamano (repo de 0,1 GB) lo hace adecuado para ensenar conceptos de mezcla de expertos y razonamiento recursivo en entornos con recursos limitados.
- Integracion en pipelines de evaluacion comparativa: puede actuar como linea base ligera en estudios que comparen arquitecturas MoE de muy baja escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor solo reporta metricas internas de entrenamiento y generalizacion:

| Metrica | Valor |
|---|---|
| Precision de sonda en entrenamiento | 0,95 |
| best_dev_loss | 0,025629 |
| tier1_seen_response loss | 0,014598 |
| tier3_unseen_sentence loss | 0,195604 |
| Comprobaciones de generalizacion v58 | 5/5 superadas |
| Paso del checkpoint seleccionado | 21.000 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa dado el tamano del modelo (30,2 M parametros); no se documentan requisitos oficiales.
- GPU recomendadas: no disponible; el autor verifica el entrenamiento y las metricas en CPU sobre Windows.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, e incluso GPUs integradas) y en CPU.
- Opciones de despliegue: PyTorch nativo; el quick start usa `torch`, `numpy` y `flask` junto con `example_usage.py`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Escala muy reducida (30,2 M parametros totales): capacidad limitada para tareas complejas en produccion.
- Sin descargas ni interacciones en Hugging Face: ausencia de validacion por parte de la comunidad.
- Idiomas no documentados: se desconoce el soporte multilingue real.
- Longitud de contexto no especificada: riesgo de comportamiento inesperado en conversaciones largas.
- Metricas reportadas por el propio autor y centradas en perdida interna, no en benchmarks estandar; dificil comparar con otros modelos.
- Riesgo de alucinacion inherente a modelos de lenguaje de baja escala; no se documentan mitigaciones.
- Sesgos conocidos: no disponibles.
- Licencia MIT: permite uso comercial, pero el modelo se presenta como hito experimental, no como producto listo para produccion.
- Checkpoint intermedio entre v87 y v89: puede quedar obsoleto rapidamente dentro de la propia familia.

## Enlaces

- Hugging Face: https://huggingface.co/Kai9987kai/supermix-v88
- Repositorio del proyecto: https://github.com/kai9987kai/Supermix
- Modelo base: https://huggingface.co/Kai9987kai/supermix-v87

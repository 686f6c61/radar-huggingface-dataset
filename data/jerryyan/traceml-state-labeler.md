# jerryyan/TraceML-State-Labeler

## Resumen

TraceML-State-Labeler es un modelo de 1.720.574.976 parametros (1,7B) publicado por jerryyan, resultado de un fine-tuning de Qwen/Qwen3-1.7B sobre etiquetas con esquema restringido generadas por un modelo profesor GPT de mayor tamano. Forma parte del proyecto TraceML (NeurIPS 2026, Evaluations & Datasets Track), dedicado al analisis empirico de la planificacion humano-agente en el desarrollo de machine learning.

El modelo resuelve una tarea muy concreta: dado el codigo de una version de una solucion de ML, devuelve en JSON las etapas del pipeline que ese codigo contiene. En concreto, produce 8 etiquetas gruesas (`data_io`, `feature_eng`, `model_def`, `training_cfg`, `ensemble_blend`, `validation_cv`, `inference_submit`, `infra_util`), etiquetas finas de un vocabulario cerrado de 136 con una confianza cada una, un resumen de una linea y palabras clave. Junto con el modelo hermano TraceML-Action-Labeler, etiqueto las 151.088 versiones de codigo del conjunto TraceML.

Su relevancia es de nicho: no es un modelo de proposito general, sino un componente de anotacion dentro de un pipeline de investigacion sobre trayectorias de agentes. Su tamano (1,7B) y su licencia Apache-2.0 lo hacen desplegable en una sola GPU de consumo, y su salida estructurada y restringida por esquema lo convierte en una pieza util para clasificar, filtrar y analizar grandes volumenes de codigo de ML.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, familia Qwen3 (heredada del modelo base Qwen/Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 (1,7B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen3-1.7B declara 32.768 tokens nativos |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados); el autor indica que el etiquetado se genero en bf16 |
| Idiomas soportados | en, code (ingles y codigo) |
| Licencia | Apache-2.0, heredada de Qwen3 |
| Formato de pesos | safetensors (repositorio de 3,5 GB, coherente con pesos en bf16) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen/Qwen3-1.7B: un transformer decoder-only denso con atencion por causalidad, sin componentes MoE ni SSM. El fine-tuning parte de ese checkpoint y se entrena sobre etiquetas con esquema restringido (schema-constrained) producidas por un modelo profesor GPT de mayor tamano, es decir, un proceso de destilacion de etiquetas estructuradas en lugar de anotacion humana directa. La informacion proporcionada no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO.

La innovacion principal no esta en la arquitectura sino en el formato de salida y en el pipeline de uso. El modelo esta condicionado por un vocabulario cerrado: 8 etiquetas gruesas y 136 etiquetas finas, cada una con un nivel de confianza, ademas de un resumen y palabras clave. Para uso en produccion se recomienda decodificacion voraz (`do_sample=False`) con el modo thinking desactivado, y el autor advierte que `generation_config.json` conserva los valores de muestreo por defecto de Qwen3, por lo que hay que pasar los parametros greedy de forma explicita. Las etiquetas publicadas en TraceML se generaron con vLLM 0.8.5 en bf16, decodificacion voraz y prefix caching desactivado.

## Capacidades

- Clasificacion de codigo de ML: dada una version de codigo, identifica las etapas del pipeline de machine learning presentes.
- Etiquetado grueso: devuelve subconjuntos de las 8 etiquetas `data_io`, `feature_eng`, `model_def`, `training_cfg`, `ensemble_blend`, `validation_cv`, `inference_submit` e `infra_util`.
- Etiquetado fino: selecciona etiquetas de un vocabulario cerrado de 136, cada una con su etiqueta padre y un nivel de confianza (`high` y otros valores no detallados).
- Resumen y palabras clave: genera un resumen de una linea del codigo analizado y una lista de palabras clave.
- Salida JSON estructurada: el formato de salida es siempre un objeto JSON parseable con `parse_state_output` del toolkit.
- Analisis de trayectorias de agentes: integrado en TraceML junto al Action Labeler para etiquetar estados y transiciones a lo largo de versiones sucesivas de codigo.
- Generacion de texto general: al derivar de Qwen3-1.7B conserva la capacidad base de generacion, aunque el fine-tuning esta orientado a la tarea de etiquetado.
- Idiomas: ingles y codigo (Python de ML). No se declara soporte de otros idiomas naturales.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-step: no disponible como capacidad propia del modelo; se usa como componente dentro del toolkit TraceML.

## Casos de uso

- Etiquetado masivo de repositorios de ML y Kaggle: el modelo permite procesar lotes de scripts y notebooks y asignar automaticamente las etapas de pipeline que contienen, lo que habilita indexar y auditar miles de soluciones sin revision manual.
- Analisis de trayectorias de agentes: combinado con TraceML-Action-Labeler, permite reconstruir que etapas toca un agente en cada version de su solucion y como transiciona entre ellas a lo largo de un run, que es el uso central descrito por los autores.
- Filtrado y busqueda semantica de codigo: las etiquetas gruesas y finas sirven como metadatos para construir indices que permitan buscar, por ejemplo, "scripts que hacen feature engineering y validacion cruzada" dentro de un corpus grande.
- Construccion de datasets de investigacion: el modelo puede usarse para etiquetar nuevos corpus de codigo de ML con el mismo esquema de TraceML, ampliando el dataset original o replicando el analisis en otros dominios.
- Auditoria y documentacion de pipelines: al devolver un resumen de una linea y palabras clave, resulta util para generar documentacion automatica de lo que hace cada version de un script de entrenamiento.
- Educacion y evaluacion de codigo: en entornos docentes o de competiciones, permite comprobar de forma automatica si una entrega cubre las etapas esperadas de un pipeline de ML.
- Investigacion en planificacion humano-agente: como instrumento de medicion, facilita comparar cohortes humanas y cohortes de agentes en terminos de cobertura de etapas y patrones de planificacion.
- Preetiquetado para anotacion humana: reduce el coste de anotar manualmente grandes volumenes de codigo, dejando al anotador solo la verificacion de las etiquetas y confianzas propuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 3,5 GB solo para los pesos (1.720.574.976 parametros a 2 bytes), mas la cache KV correspondiente al contexto utilizado.
- VRAM estimada en fp32: aproximadamente 6,9 GB para los pesos; el ejemplo oficial usa `torch.float32` cuando se ejecuta en CPU.
- GPU de consumo: cabe con holgura en tarjetas de 8 GB o mas (RTX 3060 Ti, RTX 3070, RTX 4060, RTX 4070) en bf16; en 12 GB o mas (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090) no hay restriccion practica para la tarea.
- GPU de centro de datos: A100, H100 y similares son suficientes y sobredimensionadas para un modelo de este tamano; se usan sobre todo para etiquetado por lotes a gran escala.
- CPU y Apple Silicon: el ejemplo oficial contempla ejecucion en CPU (con `float32`) y en MPS, por lo que es viable sin GPU dedicada a costa de mayor latencia.
- Opciones de despliegue: `transformers` (ruta documentada), vLLM 0.8.5 (usado por los autores para generar las etiquetas, con prefix caching desactivado) y text-generation-inference (el repositorio esta etiquetado como compatible con TGI y con endpoints). No se documentan pesos GGUF ni soporte explicito de llama.cpp u Ollama.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jerryyan/TraceML-State-Labeler | 1,72B | no disponible (base: 32.768 tokens nativos) | Etiquetado de etapas de pipeline de ML en codigo | Apache-2.0 | HuggingFace, 0 descargas y 0 likes en el momento del registro |
| Qwen/Qwen3-1.7B (modelo base) | 1,72B | 32.768 tokens nativos | Generacion de texto y razonamiento de proposito general | Apache-2.0 | Ampliamente distribuido |
| jerryyan/TraceML-Action-Labeler | no disponible | no disponible | Etiquetado de acciones dentro del proyecto TraceML | no disponible | HuggingFace |

La comparacion con alternativas genericas de clasificacion de codigo no es posible con la informacion disponible, ya que la model card no incluye resultados comparativos ni referencias a otros etiquetadores del mismo tipo.

## Limitaciones y advertencias

- Ambito muy restringido: el modelo solo esta entrenado para etiquetar codigo de ML segun el esquema de TraceML; no es un asistente general ni un generador de codigo fiable.
- Idiomas: solo se declaran ingles y codigo. El rendimiento en codigo con comentarios o documentacion en otros idiomas no esta documentado y podria degradarse.
- Vocabulario cerrado: las etiquetas finas estan limitadas a una lista de 136; cualquier etapa o practica fuera de ese esquema no podra representarse correctamente.
- Riesgo de alucinacion: al ser un modelo generativo que produce JSON, puede emitir etiquetas no justificadas por el codigo, especialmente en las etiquetas finas y en su nivel de confianza; se recomienda validar la salida contra el esquema antes de usarla.
- Destilacion de un profesor GPT: las etiquetas de entrenamiento provienen de un modelo mayor, por lo que el alumno puede heredar sus sesgos y sus errores de anotacion.
- Configuracion de decodificacion sensible: `generation_config.json` conserva los valores de muestreo por defecto de Qwen3, y el autor insiste en forzar decodificacion voraz y thinking desactivado; usar los valores por defecto puede producir salidas no parseables.
- Dependencia del toolkit: los constructores de prompt y el parser de salida viven en `traceml-toolkit`, no en el repositorio del modelo; usarlo sin ese toolkit exige replicar el formato de prompt exacto.
- Licencia: Apache-2.0 heredada de Qwen3, lo que permite uso comercial, pero conviene revisar igualmente las condiciones del modelo base y del dataset asociado.
- Madurez y validacion: el repositorio registra 0 descargas y 0 likes, sin evidencia de validacion independiente por parte de la comunidad.
- Fechas: la model card y la cita indican 2026, lo que conviene verificar antes de citar el trabajo en un contexto de produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jerryyan/TraceML-State-Labeler
- Modelo hermano (Action Labeler): https://huggingface.co/jerryyan/TraceML-Action-Labeler
- Paper: https://arxiv.org/abs/2608.26086
- Dataset TraceML: https://huggingface.co/datasets/jerryyan/TraceML
- Esquemas del vocabulario de etiquetas: https://huggingface.co/datasets/jerryyan/TraceML/tree/main/manifests/schemas
- Pesos originales en el dataset: https://huggingface.co/datasets/jerryyan/TraceML/tree/main/models/qwen3-1.7b-state/final
- Toolkit (GitHub): https://github.com/JerryYan123/TraceML
- Pagina del proyecto: https://jerryyan123.github.io/TraceML/
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B

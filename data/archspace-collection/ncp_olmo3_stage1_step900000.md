# ArchSpace-Collection/NCP_Olmo3_Stage1_Step900000

## Resumen

Este repositorio aloja un checkpoint intermedio del modelo NCP_Olmo3, correspondiente al paso 900.000 de la etapa 1 (Stage1) de preentrenamiento, convertido a un formato Hugging Face puro con claves de proyección estándar (`q_proj`, `k_proj`, `v_proj`, `gate_proj`, `up_proj`, `down_proj`). El artefacto es publicado por ArchSpace-Collection y forma parte de la familia Olmo 3, desarrollada originalmente por el Allen Institute for AI (Ai2), cuyo flujo completo de entrenamiento se describe en el artículo técnico "Olmo 3" (arXiv:2512.13961).

El checkpoint tiene aproximadamente 8.940 millones de parámetros y se distribuye exclusivamente en formato SafeTensors, con un tamaño de repositorio de 17,9 GB. Su relevancia radica en que permite a investigadores y desarrolladores acceder a un punto intermedio del entrenamiento de un modelo de lenguaje de última generación, facilitando el estudio de la evolución de las representaciones, la realización de fine-tuning desde una etapa temprana o la comparación con otros checkpoints de la misma serie. No se trata de un modelo final listo para producción, sino de un artefacto de investigación.

La model card indica que el checkpoint se carga mediante `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)` y que es compatible con el backend vLLM de ConceptLM, sin necesidad de copiar pesos en claves nativas de Megatron. Se incluye un manifiesto de conversión (`conversion_manifest.json`) que documenta la trazabilidad de las claves.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Olmo 3, segun el paper) |
| Parametros totales | 8.938.363.792 (~8,94 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | SafeTensors |

## Arquitectura y entrenamiento

El checkpoint pertenece a la etapa 1 (Stage1) del preentrenamiento de Olmo 3, una familia de modelos completamente abiertos a escalas de 7B y 32B parametros. Segun el articulo de Ai2, el flujo de entrenamiento de Olmo 3 incluye fases de pretraining, midtraining, extension de contexto largo, y posteriormente etapas de instruccion (SFT, DPO, RL) y de razonamiento (thinking SFT, DPO, RL). Este artefacto concreto corresponde a un paso intermedio de la fase inicial de pretraining, lo que implica que el modelo aun no ha pasado por las etapas de ajuste fino supervisado ni de optimizacion por preferencias.

La conversion a formato Hugging Face puro con claves de proyeccion dedicadas sugiere que los pesos originales se almacenaban con un esquema de claves diferente (posiblemente Megatron), y que este repositorio ofrece una version directamente cargable con las APIs estandar de Transformers y vLLM. No se dispone de informacion detallada sobre la composicion del dataset de entrenamiento, el numero total de tokens procesados ni las tecnicas de regularizacion empleadas en esta etapa.

## Capacidades

- Al ser un checkpoint intermedio de pretraining, no se han publicado evaluaciones de capacidades especificas para este paso concreto.
- Se espera que, como parte de la familia Olmo 3, el modelo final adquiera capacidades de razonamiento de contexto largo, function calling, generacion de codigo, seguimiento de instrucciones, chat general y recuperacion de conocimiento, segun se describe en el paper de Olmo 3.
- El checkpoint actual, sin embargo, no ha sido sometido a las etapas de instruccion, por lo que su comportamiento en tareas dirigidas es impredecible y no recomendado para uso directo.
- La compatibilidad con vLLM y Transformers permite su integracion en pipelines de investigacion que requieran cargar pesos intermedios.

## Casos de uso

- Estudio de la evolucion del entrenamiento: los investigadores pueden analizar como cambian las representaciones internas del modelo a lo largo de los pasos de entrenamiento, comparando este checkpoint con otros pasos (por ejemplo, Step100000 o StepLast).
- Fine-tuning desde un punto intermedio: en lugar de partir de un modelo final, se puede realizar fine-tuning sobre este checkpoint para explorar si ciertas tareas se benefician de un estado de pretraining menos avanzado.
- Analisis de la dinamica de perdida y convergencia: al disponer de checkpoints intermedios, se puede reconstruir la curva de aprendizaje y estudiar fenomenos como la aparicion de habilidades emergentes.
- Reproduccion de experimentos de interpretabilidad: este checkpoint puede servir para estudiar la formacion de circuitos y mecanismos internos durante el pretraining.
- Desarrollo de tecnicas de conversion de formatos: el manifiesto de conversion incluido puede ser util para quienes trabajan en la interoperabilidad entre frameworks de entrenamiento (Megatron, HF, vLLM).
- Comparacion de estrategias de pretraining: al ser parte de la serie Olmo 3, permite contrastar el comportamiento de este modelo con otros de la misma familia o con modelos de tamano similar de otras organizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La pagina del checkpoint final (StepLast) menciona una tabla comparativa con OLMo-Stage1, pero los datos numericos no se han proporcionado en el material consultado. Por tanto, no es posible presentar metricas de MMLU, HumanEval, GSM8K u otras para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8,94 B de parametros en precision FP16 o BF16, el modelo ocupa aproximadamente 17,9 GB de memoria (coincide con el tamano del repositorio). Se requiere una GPU con al menos 24 GB de VRAM para cargar el modelo completo sin cuantizacion.
- GPU recomendadas: NVIDIA A100 (40 GB), RTX 4090 (24 GB), o GPUs de datacenter con 32 GB o mas. Para inferencia con cuantizacion (no disponible en este repositorio, pero posible con herramientas externas), una RTX 3090 (24 GB) o incluso una RTX 4080 (16 GB) podrian ser suficientes con cuantizacion de 8 bits o 4 bits.
- Opciones de despliegue: el modelo es compatible con vLLM (mencionado en la model card) y con Hugging Face Transformers mediante `trust_remote_code=True`. Tambien podria utilizarse con llama.cpp si se convierte a formato GGUF, aunque no se proporciona dicha conversion.
- Latencia y throughput: no se dispone de datos medidos para este checkpoint. En general, un modelo de ~9B en una A100 puede alcanzar un throughput de entre 20 y 50 tokens por segundo en generacion autoregresiva, dependiendo de la implementacion y el batch size.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa con otros modelos de la misma categoria. Este checkpoint es un artefacto intermedio de la familia Olmo 3, y los unicos puntos de referencia serian otros checkpoints de la misma serie (Step100000, StepLast) o el modelo final de Olmo 3 de 7B. Sin embargo, no se han proporcionado datos de rendimiento ni especificaciones completas de estos modelos en el material consultado. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Checkpoint intermedio: no es un modelo final; su comportamiento en tareas de lenguaje natural puede ser incoherente o incompleto, y no ha pasado por etapas de alineacion con instrucciones.
- Licencia no especificada: no se indica la licencia de uso, por lo que no se puede garantizar su idoneidad para uso comercial o proyectos propietarios.
- Idiomas no especificados: se desconoce el alcance multilingue del modelo en este punto del entrenamiento.
- Requiere `trust_remote_code=True`: la carga del modelo implica ejecutar codigo personalizado, lo que conlleva riesgos de seguridad si el repositorio no es de confianza.
- Sin benchmarks publicados: no hay evidencia de rendimiento en tareas estandar, por lo que no se puede evaluar su calidad relativa.
- Posibles sesgos: al ser un modelo entrenado con datos web, puede contener sesgos sociales y culturales, aunque no se han documentado en este checkpoint.
- Riesgo de alucinacion: al no estar alineado, es probable que genere contenido factualmente incorrecto o inventado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ArchSpace-Collection/NCP_Olmo3_Stage1_Step900000
- Checkpoint final (StepLast): https://huggingface.co/ArchSpace-Collection/NCP_Olmo3_Stage1_StepLast
- Checkpoint intermedio (Step100000): https://huggingface.co/ArchSpace-Collection/NCP_Olmo3_Stage1_Step100000
- Paper de Olmo 3 (arXiv): https://arxiv.org/abs/2512.13961
- Pagina oficial de Olmo 3 en Ai2: https://allenai.org/olmo

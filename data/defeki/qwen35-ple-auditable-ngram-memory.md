# DefEki/qwen35-ple-auditable-ngram-memory

## Resumen

Este repositorio de HuggingFace contiene los artefactos reproducibles del artículo «Auditable N-Gram Memory for Small Language Models», desarrollado por DefEki. No se trata de un modelo de lenguaje completo, sino de un conjunto de recursos de investigacion: proyectores PLE, adaptadores MoRA purificados, datasets, configuraciones, scripts y resultados de evaluacion. El objetivo es estudiar y aplicar una memoria externa basada en n-gramas que sea auditable, es decir, que permita rastrear exactamente que fragmentos de texto externo influyen en la generacion del modelo.

La tecnica parece estar pensada para modelos pequeños de lenguaje (SLM), y los scripts hacen referencia a un modelo base de la familia Qwen3.5 (concretamente Qwen3.5-0.8B). Los proyectos y adaptadores se entrenarían sobre datasets de continuacion local de 1k y 10k muestras. El repositorio incluye resultados de HumanEval, TriviaQA, pass@k, evaluaciones con LLM como juez y benchmarks de CPU. Es relevante ahora porque aborda un problema tipico de los modelos pequeños, como las alucinaciones y la falta de conocimiento factual, mediante una memoria externa ligera y verificable.

## Especificaciones tecnicas

| Parametro               | Valor                                                               |
|-------------------------|---------------------------------------------------------------------|
| Arquitectura            | No es un modelo estandar. Conjunto de proyectores PLE, adaptadores MoRA y router de fusion n-gram sobre un modelo base Qwen3.5 |
| Parametros totales      | No disponible (solo se ofrecen pesos de proyectores y adaptadores) |
| Parametros activos      | No disponible (no es un modelo MoE)                                 |
| Longitud de contexto    | No disponible (depende del modelo base, no especificado)            |
| Tipos de cuantizacion   | No disponible                                                       |
| Idiomas soportados      | Ingles (segun metadatos)                                             |
| Licencia                | Apache-2.0 para los artefactos. Los pesos del modelo base quedan sujetos a la licencia de Qwen |
| Formato de pesos        | safetensors (projectores, adaptadores); ademas hay datasets, configs y scripts en JSON/JSONL |

## Arquitectura y entrenamiento

La propuesta del paper combina una memoria externa de n-gramas con proyectores PLE (la nomenclatura exacta no se detalla en la informacion disponible) y adaptadores MoRA purificados. El sistema probablemente intercala una recuperacion de n-gramas con la generacion del modelo base, de forma que la influencia de cada n-grama sea auditable. El repositorio incluye configuraciones del router de fusion y de la politica de tokens.

Los datos de entrenamiento consisten en datasets de continuacion local (1k y 10k muestras) para los proyectores PLE. Los scripts muestran un ejemplo de entrenamiento con `--max-train-samples 7000`, `--max-eval-samples 300` y `--steps 100`. No se mencionan datos de preentrenamiento completos ni procesos de RLHF/DPO. La innovacion principal reside en hacer que la memoria externa n-gram sea verificable, lo que resulta util para diagnosticar alucinaciones y sesgos de recuperacion. Tambien se incluyen scripts de sensibilidad y equidad.

## Capacidades

- Generacion de texto con soporte de memoria externa n-gram sobre un modelo base Qwen3.5.
- Evaluacion de tareas de razonamiento factual mediante benchmarks como TriviaQA.
- Evaluacion de generacion de codigo con HumanEval y pasadas a k (pass@k).
- Evaluacion con LLM como juez para medir calidad de salida.
- Analisis de sensibilidad y equidad mediante scripts dedicados.
- Ejecucion de benchmarks en CPU para medir rendimiento en entornos de bajos recursos.
- No hay soporte documentado de tool calling, agentes o vision.

Los artefactos no constituyen por si mismos un modelo completo: las capacidades finales dependen del modelo base sobre el que se apliquen los proyectores y adaptadores.

## Casos de uso

- Investigacion en memoria externa para modelos pequeños: permite experimentar con memorias n-gram auditable y comparar configuraciones de proyectores y adaptadores.
- Reproduccion de resultados cientificos: los scripts y datasets incluidos facilitan la replicacion de los experimentos del paper de forma sistematica.
- Auditoria de alucinaciones en entornos de bajo recurso: al poder rastrear que n-gramas influyen en la salida, se pueden identificar fuentes de incorrectas.
- Desarrollo de sistemas de generacion de texto con dominio restringido: la memoria externa puede inyectar conocimiento especifico sin necesidad de reentrenar el modelo base.
- Benchmarking de modelos pequeños en tareas de conocimiento y codigo: los scripts de evaluacion permiten comparar variantes del sistema en HumanEval, TriviaQA y pass@k.
- Estudio de sensibilidad y sesgos: los scripts de fairness/sensitivity ayudan a analizar como afecta la memoria n-gram a grupos de entrada.
- Despliegue en CPU para entornos con limitaciones de hardware: dada la existencia de benchmarks de CPU, el sistema puede probarse en maquinas sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio contiene una carpeta `results/` con datos de evaluacion (HumanEval, TriviaQA, pass@k, LLM judge, sensibilidad y CPU benchmark), pero no se muestran cifras concretas en la documentacion proporcionada.

## Requisitos de hardware

- Entrenamiento de proyectores: se requiere CUDA, segun el script de ejemplo (`--device cuda`).
- Inferencia o evaluacion: existen benchmarks de CPU, por lo que es posible ejecutar al menos parte de las evaluaciones en CPU.
- VRAM estimada: no disponible (probablemente dependera del modelo base, que en el ejemplo es de 0.8B, por lo que una GPU con 8-16 GB seria suficiente en la mayoria de los casos, pero no se especifica).
- GPU recomendadas: no disponible.
- Opciones de despliegue: no se mencionan frameworks como vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo base comparable directamente con otros SLM o tecnicas de memoria externa. La informacion no incluye comparativas con otros modelos o metodos alternativos.

## Limitaciones y advertencias

- El repositorio no contiene un modelo completo y listo para usar, sino artefactos de investigacion que deben integrarse con un modelo base de Qwen.
- El tamano del repositorio aparece como 0.0 GB y tiene 0 descargas, lo que sugiere que puede estar vacio o contener unicamente metadatos; es necesario verificar el contenido real antes de usarlo.
- No se proporcionan resultados de benchmarks con cifras concretas, por lo que no se puede evaluar el rendimiento real.
- La licencia Apache-2.0 cubre los artefactos, pero los pesos del modelo base estan sujetos a la licencia de Qwen, lo que puede implicar restricciones de uso comercial.
- El modelo base puede heredar sesgos y alucinaciones no mitigados por la memoria externa.
- No se documentan capacidades de tool calling, vision o soporte multilingue mas alla del ingles.
- La escasez de documentacion tecnica detallada (fuera de los enlaces al paper) dificulta su integracion en produccion de forma rapida.

## Enlaces

- HuggingFace: https://huggingface.co/DefEki/qwen35-ple-auditable-ngram-memory
- Repositorio de codigo: https://github.com/QingGo/qwen35-ple
- Fuente del paper: https://github.com/QingGo/qwen35-ple/blob/main/paper/paper.typ
- PDF compilado: https://github.com/QingGo/qwen35-ple/blob/main/paper.pdf
- Tarjeta de evaluacion: https://github.com/QingGo/qwen35-ple/blob/main/docs/evaluation-card-paper.md
- Manifest de reproducibilidad: https://github.com/QingGo/qwen35-ple/blob/main/docs/reproducibility-manifest.md

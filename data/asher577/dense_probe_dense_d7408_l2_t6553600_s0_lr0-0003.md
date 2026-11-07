# asher577/dense_probe_dense_d7408_L2_t6553600_s0_lr0.0003

## Resumen

`dense_probe_dense_d7408_L2_t6553600_s0_lr0.0003` es un modelo transformer denso de pequeno tamano publicado por el usuario asher577 en Hugging Face. Se trata de un artefacto de investigacion, no de un modelo de proposito general: forma parte de una familia de ejecuciones de escalado ("scaling_probe") disenadas para estudiar el procedimiento de entrenamiento de transformers con dispersidad en pesos descrito por Gao et al. (2025). El modelo tiene solo 2 capas, una dimension de modelo de 7408, una longitud de contexto de 512 tokens y un vocabulario de 4096 tokens, y fue entrenado sobre el dataset `jacobcd52/simplestories-tokenized` con el tokenizador `SimpleStories/SimpleStories-1.25M` durante un total de 6.553.600 tokens.

El nombre del repositorio codifica los hiperparametros clave: `dense` indica que es la variante densa (sin dispersidad en pesos ni en activaciones), `d7408` la dimension del modelo, `L2` el numero de capas, `t6553600` el total de tokens de entrenamiento, `s0` la semilla o paso de escalado y `lr0.0003` la tasa de aprendizaje. Existe una variante hermana, `asher577/scaling_probe_dcp_d4096_L2_t6553600_s0`, con dimension 4096 y dispersidad activa en pesos y activaciones, lo que confirma que este modelo es un punto de control dentro de un barrido experimental comparativo.

Su relevancia es, por tanto, metodologica y no practica: sirve para reproducir y comparar curvas de escalado y el efecto de la dispersidad estructural en modelos de juguete entrenados sobre historias sinteticas. No esta pensado para inferencia en produccion ni para tareas de lenguaje reales, y su model card no documenta evaluaciones de calidad, licencia ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (2 capas, head dimension 16) |
| Parametros totales | no disponible (no se indica el recuento; con d=7408 y 2 capas el orden de magnitud es de cientos de millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado sobre SimpleStories, dataset de historias sinteticas en ingles) |
| Licencia | no disponible |
| Formato de pesos | `pytorch_model.bin` (PyTorch `state_dict`), mas `config.json` |

Otros datos tecnicos declarados en la model card: dimension de modelo 7408, dimension de cabeza 16, tamano de vocabulario 4096, sin dispersidad en pesos (`Weight Sparsity: False`) y sin dispersidad en activaciones (`Activation Sparsity: False`), con una fraccion L0 objetivo de 0,01. Tamano del repositorio: 5,5 GB.

## Arquitectura y entrenamiento

La arquitectura es un transformer denso convencional de solo 2 capas con dimension de modelo 7408 y dimension de cabeza 16, lo que implica un numero de cabezas de atencion de 463 (7408 / 16). El vocabulario es de 4096 tokens, coherente con el tokenizador `SimpleStories/SimpleStories-1.25M` utilizado para tokenizar el corpus. No se documenta el uso de attention lineal, decodificacion especulativa ni mecanismos hibridos; la model card se limita a los parametros estructurales y al regimen de entrenamiento.

El entrenamiento sigue el procedimiento de Gao et al. (2025) para transformers con dispersidad en pesos, aunque en esta ejecucion concreta la dispersidad esta desactivada (tanto en pesos como en activaciones), por lo que actua como linea base densa del barrido. El dataset es `jacobcd52/simplestories-tokenized`, una version tokenizada del corpus SimpleStories de historias sinteticas, y el presupuesto total de entrenamiento es de 6.553.600 tokens con una tasa de aprendizaje de 0,0003. No se especifica si hubo RLHF, DPO ni fases de ajuste fino; el run de Weights & Biases esta enlazado en la model card para consultar curvas de perdida e hiperparametros completos.

## Capacidades

- Generacion de texto a nivel de juguete: puede continuar secuencias de hasta 512 tokens en el dominio de historias sinteticas SimpleStories.
- Modelado de lenguaje autoregresivo basico: entrenado con el objetivo estandar de prediccion del siguiente token sobre un vocabulario de 4096 tokens.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue; el corpus de entrenamiento es de historias sinteticas en ingles.
- No se documentan modos especiales (thinking mode, vision, audio) ni capacidades de codigo o matematicas.
- Uso previsto: experimentacion sobre escalado y dispersidad, no inferencia de proposito general.

## Casos de uso

- Reproduccion de experimentos de escalado: el modelo sirve como punto de control denso en un barrido que varia dimension, capas y tokens; se carga el `state_dict` y se compara la perdida con la variante dispersa `scaling_probe_dcp_d4096_L2_t6553600_s0`.
- Estudio del efecto de la dispersion en pesos: al ser la linea base densa con hiperparametros casi identicos a la variante `dcp`, permite aislar el impacto de la dispersion en pesos y activaciones sobre la perdida de validacion.
- Analisis de curvas de entrenamiento: el run de W&B enlazado permite contrastar la dinamica de perdida con la tasa de aprendizaje 0,0003 y el presupuesto de 6,55 M de tokens.
- Pruebas de infraestructura de entrenamiento: su tamano reducido (2 capas, contexto 512) lo hace util para validar pipelines de tokenizacion, carga de datasets y registro de metricas antes de escalar a modelos mayores.
- Docencia e investigacion en mecanica interna: con 2 capas y dimension 7408 es un sujeto manejable para experimentos de interpretabilidad (analisis de activaciones, probing) sobre un vocabulario cerrado.
- Validacion de hipotesis sobre tokenizadores de vocabulario pequeno: permite estudiar como un vocabulario de 4096 tokens afecta a la perplejidad en un corpus sintetico controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 5,5 GB en `pytorch_model.bin`, lo que sugiere un modelo del orden de 1.300-1.400 M de parametros en precision de 32 bits; en FP16 ocuparia aproximadamente 2,7-2,8 GB y en carga completa FP32 unos 5,5 GB.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060, RTX 4060, RTX 4070) es suficiente para cargar los pesos en FP16; para FP32 se recomienda 8-12 GB (RTX 3080, RTX 4070 Ti, RTX 4080).
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 8 GB o mas.
- Opciones de despliegue: el modelo requiere la clase `SparseGPT` del repositorio del autor para cargar el `state_dict`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y al no publicarse pesos en GGUF ni safetensors, el despliegue estandar no esta soportado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dispersidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `asher577/dense_probe_dense_d7408_L2_t6553600_s0_lr0.0003` | no disponible (repo 5,5 GB) | 512 | Ninguna (denso) | no disponible | Hugging Face, pesos `.bin` |
| `asher577/scaling_probe_dcp_d4096_L2_t6553600_s0` | no disponible (repo 2,37 GB) | 512 | Pesos y activaciones (L0 0,01) | no disponible | Hugging Face, pesos `.bin` |
| Modelos de juguete tipo nanoGPT / SimpleStories | del orden de 1-10 M | 256-1024 | Variable | habitualmente MIT/Apache-2.0 | Hugging Face, diversas |

La comparacion relevante es interna a la familia `scaling_probe` del mismo autor: misma profundidad (2 capas), mismo presupuesto de tokens (6.553.600) y mismo dataset, diferenciandose en dimension (7408 frente a 4096) y en el regimen de dispersion. No se dispone de datos de benchmarks para establecer comparaciones de rendimiento con alternativas.

## Limitaciones y advertencias

- Modelo de investigacion sin evaluacion de calidad: no hay benchmarks, evaluaciones humanas ni metricas de perdida publicadas en la informacion disponible.
- Dominio muy restringido: entrenado exclusivamente sobre historias sinteticas SimpleStories con un vocabulario de 4096 tokens; no generaliza a texto real ni a otros idiomas.
- Contexto muy corto (512 tokens), insuficiente para la mayoria de aplicaciones practicas.
- Riesgo alto de alucinacion y de generar texto incoherente fuera del dominio de entrenamiento.
- No se documentan sesgos; al entrenarse sobre datos sinteticos, los sesgos reflejarian los del generador del corpus, no los de datos humanos.
- Licencia no disponible: no se puede asumir permiso para uso comercial; es necesario contactar con el autor antes de cualquier uso fuera de investigacion.
- Dependencia de codigo no estandar: la carga requiere la clase `SparseGPT` del repositorio del autor, lo que complica la integracion en stacks de produccion.
- Pesos en `pytorch_model.bin` (pickle) en lugar de safetensors, lo que implica riesgos de seguridad al cargar archivos de terceros y ausencia de carga perezosa.
- Sin garantias de mantenimiento: repositorio con 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/asher577/dense_probe_dense_d7408_L2_t6553600_s0_lr0.0003
- Variante dispersa comparable: https://huggingface.co/asher577/scaling_probe_dcp_d4096_L2_t6553600_s0
- Run de entrenamiento en Weights & Biases: https://wandb.ai/asher577/scd_scaling/runs/6y271rje
- Dataset de entrenamiento: https://huggingface.co/datasets/jacobcd52/simplestories-tokenized
- Tokenizador: https://huggingface.co/SimpleStories/SimpleStories-1.25M

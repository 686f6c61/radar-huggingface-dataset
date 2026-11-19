# poisonousID/SeMoCo

## Resumen

SeMoCo (Semantic Motion Tokens with Body-Structured Flow Matching) es un modelo de generacion de movimiento humano a partir de texto desarrollado por el grupo OMEGA-i (autores: Tianlv Huang, Hetian Guo, Ziyi Cai, Yu Liu, Yingzhi Peng, Song Wang, Zipei Fan, Xuan Song, Guangming Wu y Xin Zheng). No es un modelo de lenguaje: es un sistema generativo de movimiento 3D que combina un codec de movimiento con supervision semantica, un modelo autorregresivo que predice secuencias de codigos semanticos a partir del texto y un flujo condicional que genera caracteristicas cinematicas continuas para raiz, torso y extremidades.

La arquitectura es un hibrido de dos etapas: primero se predicen tokens semanticos discretos de forma autorregresiva y despues se genera movimiento continuo mediante flow matching estructurado por partes del cuerpo (six-part flow). Los codigos semanticos y las caracteristicas cinematicas se decodifican conjuntamente en el movimiento final. El repositorio publica pesos preentrenados para dos conjuntos de datos: HumanML3D y Ω-MotionVerse.

Es relevante porque separa la semantica del movimiento (tokens discretos interpretables) de la cinematica fina (flujo continuo por partes del cuerpo), lo que permite control estructurado y una calidad reportada muy alta en las metricas de evaluacion del autor. El repo ocupa 5,9 GB e incluye tokenizer, modelo semantico, flujo de seis partes y estadisticas de normalizacion para ambos conjuntos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: codec de movimiento + modelo autorregresivo de tokens semanticos + flow matching condicional estructurado por partes del cuerpo (six-part flow) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo consume texto; la model card no especifica idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pt` (PyTorch) y `.npz` (estadisticas de normalizacion) |
| Tamano del repositorio | 5,9 GB |
| Modalidad de entrada | texto |
| Modalidad de salida | movimiento humano 3D (features Guo263 para HumanML3D, UMR499 para Ω-MotionVerse) |
| Datasets de entrenamiento | HumanML3D y Ω-MotionVerse |

## Arquitectura y entrenamiento

SeMoCo acopla un codec de movimiento con supervision semantica a un modelo autorregresivo que predice una secuencia de codigos semanticos a partir del texto de entrada. Sobre esa secuencia, un flujo condicional de tipo flow matching genera caracteristicas cinematicas continuas descompuestas en seis partes: raiz, torso y extremidades. La decodificacion combina los codigos semanticos con las caracteristicas cinematicas para producir el movimiento final. El repositorio incluye por separado el tokenizer (codec), el modelo semantico autorregresivo, el flujo de seis partes y las estadisticas de normalizacion de latentes y de features (Guo263 en HumanML3D, UMR499 en Ω-MotionVerse).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO; estos datos no aparecen en la model card. La innovacion tecnica destacable es la estructura corporal del flujo (six-part flow) junto con la supervision semantica de los tokens de movimiento, que separa la prediccion semantica discreta de la generacion cinematica continua.

## Capacidades

- Generacion de movimiento humano 3D condicionada por texto (text-to-motion).
- Prediccion autorregresiva de tokens semanticos de movimiento a partir de una descripcion textual.
- Generacion de cinematica continua estructurada por partes del cuerpo (raiz, torso, extremidades) mediante flow matching.
- Decodificacion conjunta de codigos semanticos y caracteristicas cinematicas en una secuencia de movimiento.
- Soporte de dos dominios de datos con pesos independientes: HumanML3D y Ω-MotionVerse.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- No se documenta capacidad multilingue; la model card no especifica idiomas de las entradas de texto.

## Casos de uso

- Previsualizacion de animaciones para videojuegos: generar clips de movimiento a partir de descripciones textuales para prototipar animaciones antes de la produccion final, usando los pesos de HumanML3D como referencia estandar del dominio.
- Animacion asistida en pipelines de VFX: producir movimiento base para raiz, torso y extremidades que despues se refine en el software de animacion, aprovechando la descomposicion en seis partes del flujo.
- Generacion de datos sinteticos de movimiento: crear secuencias etiquetadas textualmente para aumentar datasets de entrenamiento de modelos de reconocimiento de accion o de captura de movimiento.
- Investigacion en generacion de movimiento: usar los checkpoints publicados como linea base reproducible para comparar con otros metodos de text-to-motion sobre HumanML3D.
- Robotica y simulacion: generar trayectorias de movimiento humano de referencia para entornos simulados, con la cautela de que el modelo produce movimiento humano y no control de robot.
- Prototipado de experiencias interactivas: integrar la generacion en herramientas de autoria donde el usuario describe el movimiento deseado en texto y obtiene una secuencia en formato de features para su posterior retargeting.
- Evaluacion de modelos de texto: estudiar como distintas formulaciones textuales afectan a la generacion de movimiento, gracias a la separacion entre etapa semantica y etapa cinematica.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card:

| Dataset | FID | R@1 | R@2 | R@3 | MM-Dist |
|---|---:|---:|---:|---:|---:|
| HumanML3D | 0,0327 | 0,5561 | 0,7473 | 0,8365 | 2,750 |
| Ω-MotionVerse | 0,01238 | 0,7325 | 0,8143 | 0,8446 | 0,963 |

HumanML3D se reporta como media de 20 repeticiones con el checkpoint fijo; Ω-MotionVerse es una unica evaluacion sobre el conjunto de test completo. No se han publicado en la informacion disponible comparaciones con otros modelos ni resultados en benchmarks de lenguaje (MMLU, HumanEval, GSM8K), que no aplican a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card. El repositorio completo ocupa 5,9 GB, pero el consumo en VRAM depende de la configuracion de inferencia del repositorio de codigo.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; no se confirma que quepa en tarjetas consumer.
- Opciones de despliegue: descarga de pesos con `hf download poisonousID/SeMoCo --local-dir checkpoints` y generacion mediante la CLI `semoco-generate` del repositorio de codigo, con `configs/humanml3d_inference.yaml` o `configs/omega_inference.yaml`.
- Latencia y throughput: no disponible.
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; el modelo no es un LLM y estos motores no aplican.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos sobre modelos comparables de text-to-motion (parametros, contexto, rendimiento o licencia), por lo que la comparativa se considera no disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SeMoCo | no disponible | no disponible | FID 0,0327 en HumanML3D | Apache-2.0 | Hugging Face |
| Alternativas de text-to-motion | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo; al entrenarse sobre HumanML3D y Ω-MotionVerse, puede heredar los sesgos de captura y demografia de esos datasets.
- Riesgo de que el movimiento generado no corresponda fielmente a la descripcion textual en prompts ambiguos o poco representados en los datos de entrenamiento.
- No se especifican limitaciones de longitud de contexto ni de idioma de las entradas de texto; se desconoce el comportamiento con textos en castellano.
- La licencia Apache-2.0 permite uso comercial, pero deben respetarse las condiciones de los datasets de origen (HumanML3D y Ω-MotionVerse), no detalladas en la model card.
- El modelo no es un LLM ni un modelo multimodal de vision o audio; no debe evaluarse con benchmarks de lenguaje.
- Los pesos se distribuyen en formato `.pt` de PyTorch, lo que requiere el codigo del repositorio oficial para la inferencia; no hay formatos alternativos publicados.
- La evaluacion de Ω-MotionVerse es una unica pasada sobre el test, sin repeticiones, por lo que su robustez estadistica es menor que la de HumanML3D.

## Enlaces

- Hugging Face: https://huggingface.co/poisonousID/SeMoCo
- Repositorio de codigo: https://github.com/OMEGA-i/SeMoCo
- Paper (arXiv): https://arxiv.org/abs/2608.24334
- Pagina del proyecto: https://omega-i.github.io/SeMoCo-Page/

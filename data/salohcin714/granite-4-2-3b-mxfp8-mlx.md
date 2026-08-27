# salohcin714/granite-4.2-3b-mxfp8-mlx

## Resumen

El modelo `granite-4.2-3b-mxfp8-mlx` es una conversion cuantizada del modelo Granite 4.2 3B de IBM, realizada por el usuario salohcin714 (Nicholas Norris) para su ejecucion en Apple Silicon mediante el framework MLX. El modelo original, desarrollado por el equipo Granite de IBM, pertenece a la familia Granite 4.2 de modelos de lenguaje densos con razonamiento integrado, que incorpora cadenas de pensamiento (chain-of-thought), modos de pensamiento flexibles y tool calling aumentado con razonamiento.

Esta conversion aplica cuantizacion MXFP8 (microscaling floating-point de 8 bits) mediante redondeo al mas cercano, sin calibracion, y elimina el `lm_head` redundante cuando las embeddings de entrada y salida estan atadas. El resultado es un modelo de aproximadamente 1.030 millones de parametros en formato MLX safetensors, listo para cargarse con `mlx-lm` en equipos Apple. No se ha realizado fine-tuning adicional ni se han anadido datos de entrenamiento.

La relevancia de este modelo radica en que permite ejecutar un modelo de razonamiento de la familia Granite 4.2 en hardware Apple de forma eficiente, con licencia Apache 2.0 que facilita su uso comercial, y con soporte para 11 idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only |
| Parametros totales | 1.029.450.240 (~1,03B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MXFP8 (microscaling floating-point de 8 bits) |
| Idiomas soportados | en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base, Granite 4.2 3B de IBM, es un transformer denso decoder-only post-entrenado sobre los modelos base de Granite 4.1, tal y como se indica en el repositorio oficial de IBM. La familia Granite 4.2 incorpora razonamiento integrado con cadenas de pensamiento, modos de pensamiento flexibles y tool calling aumentado con razonamiento.

Esta conversion concreta no anade entrenamiento: los pesos se convirtieron al formato MLX safetensors mediante `mlx-lm` 0.31.3 y se cuantizaron a MXFP8 con redondeo al mas cercano, sin calibracion. Se elimino el `lm_head` redundante en los casos donde el modelo ata las embeddings de entrada y salida, lo que reduce el numero de parametros almacenados respecto al modelo original. No se realizo fine-tuning ni se anadieron datos de entrenamiento.

## Capacidades

- Generacion de texto conversacional y de proposito general.
- Razonamiento con cadenas de pensamiento (chain-of-thought) integradas, con modos de pensamiento flexibles.
- Tool calling / function calling aumentado con razonamiento.
- Soporte multilingue para 11 idiomas: ingles, aleman, espanol, frances, japones, portugues, arabe, checo, italiano, coreano, neerlandes y chino.
- Inferencia eficiente en Apple Silicon gracias a la cuantizacion MXFP8 y al formato MLX.
- Capacidades de codificacion y razonamiento matematico heredadas de la familia Granite.

## Casos de uso

- Asistentes conversacionales locales en Apple Silicon: el modelo puede desplegarse en Macs con el framework MLX, ofreciendo respuestas conversacionales sin dependencia de servicios en la nube, lo que garantiza privacidad de los datos.
- Razonamiento y analisis de texto: gracias a sus capacidades de chain-of-thought, puede descomponer problemas complejos en pasos intermedios, util para tareas de analisis de documentos, resumen y toma de decisiones.
- Integracion de tool calling en aplicaciones: el modelo soporta tool calling aumentado con razonamiento, lo que permite construir agentes que invocan funciones externas (APIs, bases de datos, calculos) de forma estructurada y con justificacion logica.
- Asistente de programacion local: con capacidades de codificacion y razonamiento matematico, puede emplearse como companero de desarrollo en entornos offline o con datos sensibles.
- Procesamiento multilingue: con soporte para 11 idiomas, puede utilizarse en aplicaciones de traduccion, generacion de contenido y atencion al cliente en multiples lenguas.
- Prototipado rapido de aplicaciones de IA: al ser un modelo pequeno (~1,03B parametros) cuantizado y con licencia Apache 2.0, es adecuado para experimentar y validar ideas sin grandes requisitos de hardware ni costes de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para esta version cuantizada. La model card del autor indica explicitamente que los benchmarks publicados por IBM describen los pesos originales, no este artefacto cuantizado, y no deben interpretarse como afirmaciones sobre este repositorio.

## Requisitos de hardware

- Formato MLX disenado exclusivamente para Apple Silicon (M1, M2, M3, M4 y sucesores).
- Tamano del repositorio: 3,8 GB, lo que implica un requisito de almacenamiento de aproximadamente 4 GB.
- La cuantizacion MXFP8 reduce el uso de memoria respecto al modelo original en precision completa; se estima que puede ejecutarse en Macs con 8 GB o mas de RAM unificada, aunque no se dispone de datos oficiales de consumo.
- Inferencia mediante `mlx-lm` (libreria MLX de Apple), con carga simple mediante `load()` y `generate()`.
- No es compatible con CUDA ni con GPUs de NVIDIA o AMD; requiere hardware Apple.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| salohcin714/granite-4.2-3b-mxfp8-mlx | ~1,03B | MXFP8 | MLX | Apache 2.0 | Conversion cuantizada para Apple Silicon |
| ibm-granite/granite-4.2-3b (original) | No disponible | No cuantizado | safetensors (PyTorch) | Apache 2.0 | Modelo base de IBM con benchmarks publicados |
| salohcin714/granite-4.2-3b-5bit-mlx | No disponible | 5-bit | MLX | Apache 2.0 | Variante con cuantizacion de 5 bits del mismo autor |

Nota: los datos de la variante 5-bit se limitan a su existencia en HuggingFace; no se dispone de especificaciones detalladas. El modelo original de IBM se denomina "3B" pero el numero exacto de parametros no se ha especificado en la informacion disponible.

## Limitaciones y advertencias

- Este repositorio no esta afiliado a IBM ni respaldado por ella. "Granite" es una marca comercial de IBM, usada de forma descriptiva para identificar el origen del modelo base.
- Los benchmarks publicados por IBM corresponden a los pesos originales y no son aplicables a esta version cuantizada; la cuantizacion puede degradar ligeramente la calidad de las respuestas.
- No se ha realizado calibracion durante la cuantizacion, lo que puede afectar a la precision en comparacion con metodos de cuantizacion con calibracion.
- La longitud de contexto no se ha especificado en la informacion disponible; se recomienda consultar la documentacion del modelo original de IBM.
- El formato MLX limita el despliegue exclusivamente a hardware Apple Silicon; no es compatible con GPUs NVIDIA o AMD.
- Al ser un modelo de ~1,03B parametros, su capacidad de razonamiento y conocimiento general es inferior a modelos de mayor tamano de la misma familia (8B y 30B).
- Riesgo de alucinacion inherente a modelos de lenguaje de tamano reducido, especialmente en tareas de conocimiento factual.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/salohcin714/granite-4.2-3b-mxfp8-mlx
- Model card del modelo original: https://huggingface.co/ibm-granite/granite-4.2-3b
- Documentacion de Granite 4.2 de IBM: https://www.ibm.com/granite/docs/models/granite4-2
- Documentacion de Granite 4.1 de IBM: https://www.ibm.com/granite/docs/models/granite4-1
- Repositorio GitHub de Granite 4.2: https://github.com/ibm-granite/granite-4.2-language-models
- Variante 5-bit del mismo autor: https://huggingface.co/salohcin714/granite-4.2-3b-5bit-mlx
- Perfil del autor: https://huggingface.co/salohcin714

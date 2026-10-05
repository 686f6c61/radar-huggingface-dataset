# local-inference-lab/GLM-5.3-Flash-NVFP4-CSF

## Resumen

GLM-5.3-Flash-NVFP4-CSF es un checkpoint cuantizado publicado por Local Inference Lab, Inc. a partir del modelo base `zai-org/GLM-5.3-Flash-BF16`, desarrollado originalmente por Z.AI. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos orientada a reducir el coste de despliegue en hardware de gama profesional: las proyecciones de los expertos enrutados se almacenan en NVFP4 (4 bits, con escalas de entrada para activaciones de 4 bits), mientras que las proyecciones de atención, los expertos compartidos y el módulo MTP se mantienen en BF16. El repo ocupa 188,9 GB.

La relevancia de esta ficha es doble. Por un lado, ilustra una práctica cada vez más habitual en el ecosistema: publicar variantes cuantizadas de un modelo grande en lugar de servir el BF16 original, con el objetivo de reducir el número de GPU necesarias. Por otro, es un ejemplo de licencia derivada restrictiva: aunque el modelo base GLM-5.3-Flash se distribuye bajo licencia MIT por parte de Z.AI, esta revisión se publica bajo la Local Inference Lab License 1.0 (LIL-1.0), que reproduce los términos de Apache 2.0 pero añade condiciones que los restringen y que declara explícitamente que los ficheros "no son código abierto".

Según la model card, el checkpoint está pensado para ejecutarse en 4 GPU RTX 6000 y requiere un fork específico de vLLM (`local-inference-lab/vllm`, rama `dev/jovian-judgement`). La divergencia declarada respecto al BF16 original es de un KLD aproximado de 0,04.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE): expertos enrutados y expertos compartidos, mas modulo MTP (Multi-Token Prediction). Detalle completo no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el modelo base no se especifica en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 en proyecciones de expertos enrutados del modelo principal (calibrado, con escalas de entrada para activaciones de 4 bits); BF16 en proyecciones de atencion, expertos compartidos y todo el modulo MTP |
| Idiomas soportados | no disponible |
| Licencia | Local Inference Lab License, Version 1.0 (LicenseRef-LIL-1.0); el modelo base upstream GLM-5.3-Flash esta bajo licencia MIT de Z.AI |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible describe unicamente la receta de cuantizacion, no el entrenamiento. El modelo base `zai-org/GLM-5.3-Flash-BF16` es un transformer con mezcla de expertos, segun se deduce de la propia receta, que distingue entre "Routed Expert Projections" y "Shared Experts". La parte principal del checkpoint (modelo principal) aplica NVFP4 a las proyecciones de los expertos enrutados, manteniendo atencion y expertos compartidos en BF16. El modulo MTP se preserva integramente en BF16, lo que sugiere que se conserva una cabeza de prediccion multi-token para decodificacion especulativa o generacion acelerada.

La innovacion tecnica destacable es precisamente esta cuantizacion selectiva: en lugar de cuantizar el modelo completo, se limita el NVFP4 al bloque de mayor peso parametrico (los expertos enrutados de la MoE), que es donde mas se reduce el tamano del checkpoint, y se dejan en BF16 las partes mas sensibles a la precision (atencion, expertos compartidos y MTP). El autor reporta una divergencia KL (KLD) de aproximadamente 0,04 respecto al BF16 original, aunque no publica la metodologia de medicion ni el conjunto de evaluacion empleado. No hay datos disponibles sobre numero de tokens de entrenamiento, composicion del dataset, uso de RLHF o DPO, ni sobre el pipeline de calibracion (numero de muestras, secuencia de calibracion, etc.).

## Capacidades

- Generacion de texto y capacidades generales del modelo base: no disponibles en la informacion proporcionada (la model card indica "Evals to follow").
- Razonamiento, codigo y matematicas: no disponible; son capacidades heredadas del modelo base GLM-5.3-Flash, pero no se documentan resultados en este repositorio.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas del repositorio esta vacio).
- Preservacion del modulo MTP en BF16, lo que apunta a generacion multi-token; el uso concreto de esta capacidad no se detalla en la model card.
- Vision o audio: no disponible.

Dado que se trata de una cuantizacion y no de un modelo con capacidades nuevas, la expectativa razonable es que herede las del BF16 original, con la degradacion acotada que sugiere el KLD reportado. No obstante, esto no esta verificado con evaluaciones publicadas.

## Casos de uso

- Despliegue self-hosted de un modelo MoE de gran tamano en un nodo de 4 GPU: el checkpoint esta dimensionado explicitamente para caber en 4 tarjetas RTX 6000, lo que permite servir el modelo sin recurrir a un cluster mayor. Adecuado para equipos con infraestructura propia limitada.
- Investigacion en cuantizacion NVFP4: el checkpoint es un caso de estudio de cuantizacion selectiva por bloques (expertos enrutados frente a atencion y expertos compartidos) con una metrica de divergencia declarada, util para comparar estrategias de calibracion.
- Servicio de inferencia de baja latencia con decodificacion multi-token: al conservar el modulo MTP en BF16, el modelo es candidato para pipelines de generacion acelerada, siempre que se use el fork de vLLM indicado.
- Pruebas de integracion de kernels NVFP4 en vLLM: el repositorio requiere una rama concreta del fork `local-inference-lab/vllm`, por lo que es un escenario realista para validar soporte de FP4 en produccion.
- Evaluacion comparativa de degradacion por cuantizacion: al disponer del BF16 original y de esta variante, permite medir la perdida real de calidad en tareas concretas (no documentada por el autor mas alla del KLD).
- Reproduccion de entornos de investigacion con restricciones de VRAM: util para academicos que necesitan ejecutar un modelo de este tipo sin acceso a nodos H100/H200.
- Uso comercial directo: posible solo si se cumplen las condiciones de LIL-1.0 (atribucion obligatoria y prohibicion de reupload), por lo que es un caso de uso condicionado.

## Benchmarks y rendimiento

| Metrica | Valor | Notas |
|---|---|---|
| KLD frente al BF16 base | ~0,04 | Reportado por el autor, sin metodologia publicada |
| MMLU, HumanEval, GSM8K, etc. | no disponible | La model card indica "Evals to follow" |

"No se han publicado resultados de benchmarks en la informacion disponible" mas alla del KLD mencionado.

## Requisitos de hardware

- Tamano del repositorio: 188,9 GB, lo que da una cota inferior del espacio de almacenamiento y de la memoria de pesos necesaria.
- VRAM estimada para inferencia: superior a 188,9 GB solo para pesos, mas el KV cache y los buffers de activacion; el autor afirma que "should fit on 4x RTX 6000", lo que implica aproximadamente 192 GB de VRAM agregada si se trata de RTX 6000 Ada de 48 GB. El margen es muy ajustado.
- GPU recomendadas: 4x NVIDIA RTX 6000 (segun el autor). Existe una variante "-4p67" del mismo autor pensada para 2x RTX 6000.
- Modelos no soportados: no hay indicios de que pueda ejecutarse en una unica GPU consumer (RTX 4090 de 24 GB, etc.); el tamano del checkpoint lo descarta.
- Opciones de despliegue: vLLM con el fork `local-inference-lab/vllm` en la rama `dev/jovian-judgement`. No se menciona soporte para llama.cpp, Ollama, TGI u otros motores. El formato safetensors y el uso de NVFP4 implican dependencia de kernels especificos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash-NVFP4-CSF | no disponible | no disponible | NVFP4 + BF16 | LIL-1.0 (no open source, con atribucion obligatoria) | HuggingFace, requiere fork de vLLM |
| zai-org/GLM-5.3-Flash-BF16 (base) | no disponible | no disponible | BF16 | MIT (Z.AI) | HuggingFace |
| Variante "-4p67" del mismo autor | no disponible | no disponible | no disponible | LIL-1.0 previsiblemente | HuggingFace, orientada a 2x RTX 6000 |

No se dispone de datos suficientes sobre otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se ha publicado ninguna evaluacion de sesgo en este repositorio.
- Riesgo de alucinacion: no evaluado; la model card no incluye resultados de tareas generativas que permitan estimarlo.
- Limitaciones de contexto e idioma: no disponible; el repositorio no declara idiomas soportados ni longitud de contexto.
- Restricciones de licencia: la LIL-1.0 no es Apache 2.0 ni MIT. Prohibe explicitamente el reupload, mirror o redistribucion de los ficheros o de copias sustancialmente similares (incluidas copias renombradas, reempaquetadas, con metadatos eliminados, convertidas o desquantizadas). Exige una atribucion literal como primer parrafo de cualquier README, model card o pagina de aterrizaje de cualquier proyecto o servicio que use el modelo. Prohibe eliminar las marcas identificativas y el canario. El incumplimiento termina la licencia de forma inmediata. Las revisiones publicadas hasta la revision `20f4777422f833c48b67bb0e554e1bc61dc55ca1` siguen bajo MIT; las posteriores, bajo LIL-1.0.
- Caveat de produccion: la licencia upstream del modelo base (MIT, Z.AI) no se hereda automaticamente en esta revision; el autor indica explicitamente que estos ficheros "no son codigo abierto".
- Caveat tecnico: el checkpoint depende de un fork especifico de vLLM, lo que complica la reproducibilidad y el mantenimiento a largo plazo.
- Caveat de integridad: el repositorio incluye `SHA256SUMS` y `lil-manifest.json` con los hashes de cada fichero; conviene verificarlos antes de desplegar.
- Margen de VRAM muy ajustado en la configuracion recomendada (4x RTX 6000), lo que reduce el espacio disponible para KV cache y limita la longitud de contexto efectiva en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/local-inference-lab/GLM-5.3-Flash-NVFP4-CSF
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash-BF16
- Fichero de licencia: https://huggingface.co/local-inference-lab/GLM-5.3-Flash-NVFP4-CSF/blob/main/LICENSE
- Fork de vLLM requerido: https://github.com/local-inference-lab/vllm/tree/dev/jovian-judgement
- Los resultados de la busqueda web no contienen informacion relevante sobre este modelo (corresponden a directorios de locales comerciales y a la aplicacion Local WP).

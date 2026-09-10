# JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget01_RMU

## Resumen

`JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget01_RMU` es un ajuste de *machine unlearning* (olvido machine learning) sobre `open-unlearning/tofu_Llama-3.2-3B-Instruct_full`, que a su vez deriva de Llama 3.2 3B Instruct. El autor aplica el metodo RMU (Representation Mismatch Unlearning) sobre el split `forget01` del dataset TOFU, utilizando el framework `open-unlearning` de locuslab. El resultado es un modelo de 3 212 749 824 parametros (3,21 mil millones) publicado en formato safetensors bajo licencia llama3.2, pensado como linea base de olvido a nivel de pesos y como modelo borrador (*draft*) en el proyecto Speculative-Decoding-Unlearning del mismo autor.

El interes de esta ficha no esta en sus capacidades generativas —heredadas de un modelo Instruct de 3B— sino en que constituye un artefacto de investigacion reproducible: la model card publica la configuracion exacta del entrenamiento de olvido (`gamma`, `alpha`, `retain_loss_type`, `steering_coeff`, `module_regex`, `trainable_params_regex`) y las metricas de evaluacion TOFU, lo que permite auditar cuanto conocimiento se ha eliminado y cuanto se ha degradado la utilidad general del modelo.

Es relevante ahora porque el olvido selectivo es una linea activa para cumplimiento normativo (derecho al olvido en el RGPD), retirada de contenido con copyright y mitigacion de uso malicioso. Este checkpoint concreto permite experimentar con la tension entre `forget_quality` y `model_utility` sin necesidad de reproducir todo el pipeline de entrenamiento desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2, con atencion agrupada/GQA). No es MoE ni SSM |
| Parametros totales | 3 212 749 824 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128 000 tokens heredados de la arquitectura Llama 3.2 del modelo base; no confirmado explicitamente en la model card |
| Tipos de cuantizacion | El repositorio solo publica pesos en precision completa (safetensors); no hay GGUF ni cuantizaciones oficiales publicadas |
| Idiomas soportados | no disponibles en la model card (el modelo base Llama 3.2 declara soporte oficial para 8 idiomas, pero no se verifica en esta ficha) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (libreria `transformers`) |
| Tamano del repositorio | 6,4 GB |
| Pipeline | text-generation |
| Dataset de olvido | locuslab/TOFU, split `forget01` |
| Metodo de olvido | RMU (Representation Mismatch Unlearning) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.2 3B Instruct: un transformer decoder-only denso con atencion agrupada por consultas (GQA), normalizacion RMSNorm y embeddings rotatorios. Sobre ese checkpoint, `open-unlearning/tofu_Llama-3.2-3B-Instruct_full` fue ajustado previamente con el dataset TOFU (`locuslab/TOFU`), que contiene pares pregunta-respuesta sobre 200 autores ficticios. El modelo aqui descrito es el resultado de aplicar RMU sobre el split `forget01` de TOFU, es decir, se busca que el modelo olvide el subconjunto de autores correspondiente a ese split manteniendo el conocimiento del resto (`retain`). Segun la model card, el entrenamiento se realizo con el framework `open-unlearning` y la configuracion completa esta en el fichero `.hydra/config.yaml` del repositorio.

La innovacion tecnica esta en el propio metodo RMU y en como se ha parametrizado: `retain_loss_type: EMBED_DIFF` (la perdida de retencion se calcula como diferencia de embeddings), `steering_coeff: 1`, `gamma: 1.0` y `alpha: 1`. El control de que parte de la red se modifica se hace con `module_regex: model\.layers\.5`, lo que restringe la intervencion a la representacion de la capa 5, mientras que `trainable_params_regex: ['.*']` indica que el conjunto de parametros considerados entrenables es todo el modelo. No se documentan en la informacion disponible ni el numero de tokens de entrenamiento del proceso de olvido, ni la composicion exacta de la mezcla retain/forget, ni si hubo fases adicionales de RLHF o DPO especificas para esta variante.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo Instruct base.
- Razonamiento e instrucciones generales propias de un modelo de 3B (nivel basico-medio en tareas complejas).
- Generacion y explicacion de codigo, limitada por el tamano del modelo.
- Aritmetica sencilla y resolucion de problemas de varios pasos con apoyo de razonamiento explicito.
- Capacidad de servir como modelo borrador (*draft model*) para decodificacion especulativa, que es el uso declarado por el autor.
- Objeto de evaluacion de olvido: permite medir `forget_quality`, `model_utility`, `extraction_strength` y ataques de inferencia de pertenencia (MIA).
- Soporte de tool calling / function calling: no documentado en la model card; el modelo base Llama 3.2 3B Instruct si lo soporta, pero no se verifica en este checkpoint.
- Modo de pensamiento explicito (*thinking*), vision o audio: no disponibles.
- Capacidades multilingues: no documentadas para este checkpoint (dependen del modelo base).

## Casos de uso

- Linea base de investigacion en olvido selectivo: replicar los resultados de RMU sobre TOFU `forget01` comparando `forget_quality = 0,7659` y `model_utility = 0,6446` con otras variantes del framework `open-unlearning` (NPO, GradDiff, etc.) bajo identica configuracion de evaluacion.
- Modelo borrador en decodificacion especulativa: el autor lo usa como draft en el proyecto Speculative-Decoding-Unlearning, donde un modelo pequeno propone tokens que un modelo mayor verifica; sus 3,21 mil millones de parametros permiten una propuesta de tokens barata en VRAM.
- Auditoria de privacidad y ataques de inferencia de pertenencia: las metricas `mia_loss`, `mia_min_k`, `mia_min_k_plus_plus` y `mia_zlib` publicadas permiten estudiar si un modelo que ha olvidado sigue filtrando informacion del conjunto borrado.
- Analisis de robustez frente a extraccion de conocimiento: con `extraction_strength = 0,0512` y `privleak = -28,3898` se puede estudiar si el olvido resiste ataques de prompting adversariales orientados a recuperar los datos olvidados.
- Experimentos de cumplimiento normativo (derecho al olvido): sirve como demostrador tecnico de como aplicar una solicitud de retirada de datos en un modelo ya entrenado y medir el coste en utilidad general, como paso previo a decidir entre reentrenamiento o intervencion sobre pesos.
- Estudio del equilibrio olvido-utilidad en modelos pequenos: al ser un 3B, permite repetir decenas de configuraciones (`gamma`, `alpha`, capa objetivo) en una sola GPU consumer y obtener curvas de compromiso entre `forget_Q_A_PARA_Prob` y `model_utility`.
- Generacion de texto general en entornos con recursos limitados: si el requisito de olvido no aplica directamente, el checkpoint puede emplearse en tareas de resumen, redaccion o clasificacion generativa donde 3B de parametros son suficientes.
- Docencia y formacion: caso practico de un pipeline completo de olvido (dataset + metodo + metricas + configuracion Hydra) reproducible por estudiantes con una unica GPU.

## Benchmarks y rendimiento

La model card publica las metricas de evaluacion de TOFU (framework `open-unlearning`). No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion disponible.

| Metrica TOFU | Valor |
|---|---|
| exact_memorization | 0,6484 |
| extraction_strength | 0,0512 |
| forget_Q_A_PARA_Prob | 0,0442 |
| forget_Q_A_gibberish | 0,8742 |
| forget_quality | 0,7659 |
| forget_truth_ratio | 0,6493 |
| mia_loss | 0,6641 |
| mia_min_k | 0,6831 |
| mia_min_k_plus_plus | 0,6256 |
| mia_zlib | 0,6234 |
| model_utility | 0,6446 |
| privleak | -28,3898 |

No se dispone en esta informacion de los valores equivalentes para el modelo base `open-unlearning/tofu_Llama-3.2-3B-Instruct_full` ni para otras variantes de olvido, por lo que no se puede calcular de forma fiable la perdida de utilidad atribuible a RMU con los datos aqui recogidos.

## Requisitos de hardware

Las cifras de VRAM siguientes son estimaciones derivadas del numero de parametros y de la arquitectura declarada, no datos publicados por el autor.

- Pesos en FP16/BF16: aproximadamente 6,4 GB (coincide con el tamano del repositorio); con activaciones y overhead de runtime, contar con 9-11 GB de VRAM.
- Pesos en INT8: aproximadamente 3,2-3,6 GB.
- Pesos en INT4 (si se convierte a GGUF Q4_K_M): aproximadamente 2,0-2,4 GB.
- Cache KV: es el consumidor dominante a contexto largo. En FP16 se estima en torno a 0,11 MB por token, lo que supone del orden de 14 GB a 128 000 tokens; con contexto de 4 000-8 000 tokens el coste baja a menos de 1 GB.
- GPU consumer: cabe con holgura en RTX 3060 12 GB, RTX 4070/4070 Ti, RTX 4080 y RTX 4090 en FP16 con contexto moderado; en INT4 cabe en GPUs de 4-6 GB. Cabe tambien en Apple Silicon con memoria unificada de 16 GB o mas.
- GPU de datacenter: A100 40/80 GB, H100 y L40S lo ejecutan sin restricciones y con margen para lotes grandes; resultan sobredimensionadas para un modelo de 3B salvo por requisitos de throughput.
- Despliegue: al estar etiquetado como `endpoints_compatible` y `text-generation-inference`, es compatible con TGI y con vLLM (transformers + safetensors). Para llama.cpp u Ollama habria que convertir los pesos a GGUF, ya que el repositorio no publica cuantizaciones.
- Latencia y throughput: no disponible; no se han publicado mediciones del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Olvido aplicado | Licencia | Formatos | Benchmarks TOFU publicados |
|---|---|---|---|---|---|---|
| JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget01_RMU | 3,21B | 128k (heredado) | Si, RMU sobre forget01 | llama3.2 | safetensors | Si (tabla completa) |
| open-unlearning/tofu_Llama-3.2-3B-Instruct_full (modelo base) | 3,21B | 128k (heredado) | No | llama3.2 | safetensors | no disponibles en esta ficha |
| meta-llama/Llama-3.2-3B-Instruct (modelo original) | 3,21B | 128 000 tokens | No | llama3.2 | safetensors, GGUF | no aplica (no evaluado en TOFU) |
| Otros baselines de olvido sobre TOFU (NPO, GradDiff, etc.) | 3,21B tipicamente | 128k (heredado) | Si, distintos metodos | llama3.2 | safetensors | no disponibles en esta ficha |

La comparacion relevante no es de capacidad generativa (los tres primeros comparten el mismo esqueleto de 3,21B parametros) sino de comportamiento bajo olvido: este checkpoint es el unico de la tabla con metricas TOFU publicadas en la informacion disponible.

## Limitaciones y advertencias

- El olvido es imperfecto: `forget_quality = 0,7659` no alcanza el valor maximo y `extraction_strength = 0,0512` indica que aun existe senal del conocimiento supuestamente borrado. No debe tratarse como garantia de eliminacion de datos.
- La utilidad general se degrada respecto al modelo base: `model_utility = 0,6446` y `exact_memorization = 0,6484` sugieren una perdida apreciable de rendimiento en el conjunto de retencion.
- `privleak = -28,3898` (valor negativo) es un indicador que debe interpretarse con cautela; no hay en la informacion disponible una explicacion del autor sobre su significado ni su escala.
- Modelo de investigacion: no se documenta un ajuste de alineamiento de seguridad posterior al olvido, por lo que el proceso de unlearning podria haber degradado los filtros de seguridad heredados de Llama 3.2 Instruct.
- No se documentan idiomas soportados ni evaluaciones multilingues para este checkpoint; el rendimiento fuera del ingles no esta verificado.
- Riesgo de alucinacion propio de un modelo de 3B, agravado porque parte de su conocimiento factual fue objeto de un ajuste de olvido.
- Licencia llama3.2 (Llama 3.2 Community License): permite uso comercial con condiciones, incluida la clausula de 700 millones de usuarios mensuales, la obligacion de atribucion "Built with Llama" y la sujecion a la politica de uso aceptable. Conviene revisar el texto completo antes de desplegarlo en produccion.
- No hay cuantizaciones GGUF oficiales; cualquier despliegue en llama.cpp u Ollama requiere convertir y validar los pesos, con el consiguiente riesgo de degradacion adicional.
- Cero descargas y cero "likes" en el momento de la consulta: no existe validacion externa por parte de la comunidad.
- El dataset TOFU contiene autores ficticios; el olvido aqui no equivale a un borrado de datos personales reales, sino a un banco de pruebas controlado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoaoBoer/tofu_Llama-3.2-3B-Instruct_forget01_RMU
- Modelo base: https://huggingface.co/open-unlearning/tofu_Llama-3.2-3B-Instruct_full
- Perfil del autor: https://huggingface.co/JoaoBoer
- Dataset TOFU: https://huggingface.co/datasets/locuslab/TOFU
- Framework open-unlearning: https://github.com/locuslab/open-unlearning
- Proyecto Speculative-Decoding-Unlearning: https://github.com/JoaoVitorBoer/Speculative-Decoding-Unlearning
- Configuracion de entrenamiento: fichero `.hydra/config.yaml` dentro del repositorio del modelo
- Salidas de evaluacion TOFU: carpeta `evals/` dentro del repositorio del modelo
- Referencia bibliografica del metodo RMU: articulo "The WMDP Benchmark: Measuring and Reducing Malicious Use With Unlearning" (arXiv:2403.03218); enlace no verificado en esta busqueda
- Referencia bibliografica del dataset TOFU: articulo "TOFU: A Task of Fictitious Unlearning for LLMs" (arXiv:2401.08565); enlace no verificado en esta busqueda

Nota: la busqueda web realizada no devolvio resultados relacionados con este modelo (los enlaces recuperados correspondian a documentacion de soporte de Windows), por lo que no se han podido incorporar fuentes adicionales de terceros.

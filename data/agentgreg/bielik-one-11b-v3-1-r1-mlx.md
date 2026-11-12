# agentGreg/Bielik-One-11B-v3.1-r1-MLX

## Resumen

Bielik-One-11B-v3.1-r1-MLX es la conversión a formato MLX del modelo speakleash/Bielik-One-11B-v3.1-r1, un modelo de decisión estructurada de 11.173.081.088 parámetros (aproximadamente 11,2 mil millones) desarrollado por Speakleash. A diferencia de un modelo conversacional al uso, está diseñado para emitir decisiones estructuradas con probabilidades calibradas sobre opciones predefinidas, y se sirve a través de un endpoint específico `/v1/systemone` en lugar de una API de chat convencional.

Esta conversión, publicada por el usuario agentGreg, tiene como objetivo llevar el modelo original a Apple Silicon mediante la librería MLX en precisión bfloat16, manteniendo la paridad numérica con la implementación de referencia sobre vLLM. El repositorio ocupa 22,3 GB e incluye un script `systemone_mlx.py` que expone la API oficial del frontend de bielik-one sin modificaciones sobre un backend MLX.

Su relevancia actual radica en que permite ejecutar un modelo de decisión de 11B en hardware de Apple con una fidelidad prácticamente idéntica a la del despliegue en GPU NVIDIA, lo que facilita el desarrollo y la evaluación local de sistemas que dependen de decisiones estructuradas calibradas en lugar de generación de texto libre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer tipo llama (derivada de Bielik-One-11B-v3.1-r1); detalles completos no disponibles |
| Parametros totales | 11.173.081.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (conversion MLX); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible en la model card; la evaluacion de paridad cubre polaco (pl), ingles (en), aleman (de) y noruego bokmal (nb) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria mlx) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna ni el proceso de entrenamiento del modelo base speakleash/Bielik-One-11B-v3.1-r1. Los tags del repositorio indican que se trata de un modelo de familia llama ("llama") con proposito especifico de decision estructurada ("decision-model", "structured-decisions"). El modelo deriva de la familia Bielik de Speakleash, orientada al polaco, aunque la model card de esta conversion no documenta la composicion del dataset, el numero de tokens de entrenamiento ni si hubo fases de RLHF o DPO.

La innovacion tecnica de esta publicacion concreta es la conversion a MLX en bfloat16 para Apple Silicon, acompanada de un servidor (`systemone_mlx.py`) que replica la API `/v1/systemone` del frontend oficial de bielik-one. El autor reporta una verificacion de paridad frente a la implementacion original en bielik-one 1.0.8 con vLLM 0.32.0 en bf16 sobre NVIDIA A100, comparando probabilidades crudas a temperatura 1 en el split de desarrollo publico del benchmark Tacit.

## Capacidades

- Decision estructurada: emite decisiones sobre opciones predefinidas con probabilidades calibradas, no chat ni generacion libre de texto.
- Salida probabilistica calibrada: el formato de peticion y respuesta, asi como la calibracion, se documentan en la model card del modelo original.
- Servicio de API compatible: expone `/v1/systemone` con el frontend oficial de bielik-one sin cambios sobre backend MLX.
- Multilingue en evaluacion: el benchmark Tacit cubre polaco, ingles, aleman y noruego bokmal, con precisiones entre el 86,3% y el 91,4%.
- Ejecucion en Apple Silicon: soporte nativo via MLX en bfloat16.
- No soporta chat conversacional: la propia model card indica "Decisions only, no chat".

## Casos de uso

- Evaluacion local de sistemas de decision en Mac: permite desarrollar y depurar pipelines que consumen decisiones estructuradas en un portatil o estacion con Apple Silicon, sin necesidad de una GPU NVIDIA.
- Clasificacion con umbrales calibrados: al devolver probabilidades por opcion, se pueden fijar umbrales de confianza para enrutar decisiones automaticas frente a revision humana.
- Moderacion y triaje de contenido: uso del modelo como clasificador de multiples opciones con probabilidades, integrable en un servicio FastAPI local.
- Investigacion en calibracion: comparar la calibracion del modelo entre backends (MLX frente a vLLM) usando el benchmark Tacit como referencia reproducible.
- Prototipado de agentes con decision estructurada: integracion del endpoint `/v1/systemone` en flujos donde el paso de decision se delega a un modelo dedicado en lugar de a un LLM generativo.
- Validacion de portabilidad de pesos: verificar que una conversion a MLX preserva el comportamiento numerico del modelo original antes de desplegarlo en produccion sobre hardware Apple.
- Despliegue en entornos sin GPU dedicada: servir el modelo en infraestructura basada en Apple Silicon cuando no se dispone de aceleradores NVIDIA.

## Benchmarks y rendimiento

El autor publica una comparacion de paridad entre esta conversion MLX (Apple M5 Max, bf16) y los pesos originales sobre bielik-one 1.0.8 + vLLM 0.32.0 (bf16, NVIDIA A100), usando probabilidades crudas a temperatura 1 en el split de desarrollo publico del benchmark Tacit:

| Idioma | Items | Misma respuesta | Diferencia de probabilidad por item (media / max) | Precision vLLM / MLX |
|---|---|---|---|---|
| pl | 602 | 99,83% | 0,0026 / 0,031 | 91,2% / 91,4% |
| en | 750 | 99,73% | 0,0034 / 0,058 | 87,6% / 87,7% |
| de | 750 | 99,87% | 0,0042 / 0,062 | 86,3% / 86,4% |
| nb | 750 | 99,87% | 0,0036 / 0,060 | 86,5% / 86,7% |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) para este modelo.

## Requisitos de hardware

- VRAM/ memoria unificada estimada: los pesos en bfloat16 suman aproximadamente 22,3 GB (tamano del repositorio), por lo que se requiere al menos esa cantidad de memoria unificada en Apple Silicon.
- GPU recomendadas: Apple Silicon con memoria unificada suficiente; el autor reporta pruebas en un Apple M5 Max.
- Cabe en GPU consumer: la conversion esta pensada para Apple Silicon via MLX; para NVIDIA se usaria el modelo original con vLLM (referencia probada en A100).
- Opciones de despliegue: MLX con el script incluido `systemone_mlx.py` (FastAPI + uvicorn) que sirve `/v1/systemone`; el modelo original se despliega con bielik-one + vLLM.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision en Tacit (en) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| agentGreg/Bielik-One-11B-v3.1-r1-MLX (esta ficha) | 11,17B | no disponible | 87,7% (MLX) | apache-2.0 | Hugging Face, MLX |
| speakleash/Bielik-One-11B-v3.1-r1 (original) | 11,17B | no disponible | 87,6% (vLLM) | apache-2.0 | Hugging Face, vLLM |
| Otros modelos de decision estructurada de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion directa documentada es frente al modelo base original, con diferencias de precision inferiores a 0,2 puntos porcentuales en todos los idiomas evaluados.

## Limitaciones y advertencias

- Modelo de decision, no de chat: no debe usarse para generacion conversacional ni de texto libre; la model card lo restringe explicitamente a decisiones.
- Idiomas no declarados: la model card no especifica la lista oficial de idiomas soportados; la evidencia empirica se limita a pl, en, de y nb en el benchmark Tacit.
- Contexto desconocido: no se documenta la longitud de contexto, lo que impide planificar casos de uso con entradas largas.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; en este caso se manifiesta como decisiones erroneas con alta confianza, por lo que se recomienda usar las probabilidades y umbrales de calibracion.
- Dependencia de Apple Silicon: la conversion MLX solo es utilizable en hardware Apple; para otros aceleradores hay que recurrir al modelo original.
- Repositorio con cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en produccion por terceros.
- Licencia apache-2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base y de las dependencias (bielik-one, mlx-lm).
- Paridad medida solo en el split de desarrollo de Tacit: no se garantiza equivalencia fuera de esa distribucion.

## Enlaces

- Repositorio Hugging Face de esta conversion: https://huggingface.co/agentGreg/Bielik-One-11B-v3.1-r1-MLX
- Modelo base: https://huggingface.co/speakleash/Bielik-One-11B-v3.1-r1
- Repositorio bielik-one (GitHub): https://github.com/speakleash/bielik-one
- Benchmark Tacit: https://tacitbench.ai

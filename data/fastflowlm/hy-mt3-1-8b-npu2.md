# FastFlowLM/Hy-MT3-1.8B-NPU2

## Resumen

Hy-MT3-1.8B-NPU2 es una distribucion del modelo de traduccion multilingue Hy-MT3-1.8B de Tencent, reempaquetado por FastFlowLM para ejecutarse sobre las NPU XDNA2 integradas en los procesadores AMD Ryzen AI. El modelo original es un transformer denso de 1.800 millones de parametros especializado en traduccion entre 102 idiomas, y esta version concreta adapta los pesos a un formato optimizado para inferencia en NPU en lugar de GPU.

El problema que resuelve es la traduccion automatica de alta cobertura linguistica en entornos de hardware limitado: en lugar de requerir una GPU dedicada, el modelo se ejecuta sobre la NPU de un portatil o mini-PC con Ryzen AI, manteniendo una calidad cercana a la version BF16. La cuantizacion Q4_K del cuerpo y Q8_0 de la cabeza de salida, repackada en el layout propietario `q4nx` de FastFlowLM, reduce el tamano del repositorio a aproximadamente 1,7 GB.

Es relevante ahora porque demuestra un caso practico de inferencia de modelos de traduccion en aceleradores de bajo consumo integrados en CPU, un escenario cada vez mas habitual en despliegues locales y edge. La licencia Apache-2.0 facilita el uso comercial, y la cobertura de 102 idiomas lo convierte en una alternativa compacta a modelos de traduccion de mayor tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer denso (tipo `hunyuan_v1_dense`) |
| Parametros totales | 1.800 millones (1.8B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K (cuerpo) y Q8_0 (cabeza de salida), repackados a layout `q4nx` |
| Idiomas soportados | 102 idiomas (entre ellos espanol, ingles, chino, aleman, frances, portugues, japones, arabe, hindi, ruso, coreano, entre otros) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers); pesos cuantizados en formato `q4nx` para FastFlowLM |

## Arquitectura y entrenamiento

El modelo base Hy-MT3-1.8B es un transformer denso de tipo `hunyuan_v1_dense`, con 1.800 millones de parametros, especializado en traduccion automatica multilingue. Esta version NPU2 no modifica la arquitectura: parte de los pesos BF16 del modelo original, los cuantiza con llama.cpp (Q4_K para el cuerpo, Q8_0 para la cabeza de salida) y los reempaqueta en el layout `q4nx` que consumen los kernels de NPU de FastFlowLM.

No se dispone de informacion detallada sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas de alineacion como RLHF o DPO en la informacion proporcionada. La model card indica que el modelo es de turno unico: cada peticion se trata como una traduccion independiente, sin memoria conversacional entre peticiones. Los kernels de NPU empleados son los mismos que ya usaba la version anterior Hy-MT2-1.8B-NPU2, lo que sugiere continuidad en el stack de inferencia.

## Capacidades

- Traduccion de texto entre 102 idiomas, en ambas direcciones, con instrucciones en lenguaje natural que indican el idioma destino.
- Especializacion en traduccion: el prompt recomendado pide traducir el texto al idioma objetivo sin explicaciones adicionales.
- Soporte de prompts de terminologia, estilo, delimitadores y datos estructurados, segun se indica en la model card original.
- Modelo de turno unico: no mantiene contexto conversacional multi-turno.
- No se documentan capacidades de tool calling, function calling, agentes, vision ni audio en la informacion disponible.
- No se documentan modos de razonamiento explicito (thinking mode) ni decodificacion especulativa.

## Casos de uso

- Traduccion local en portatiles y mini-PC con Ryzen AI: el modelo se ejecuta sobre la NPU XDNA2 sin necesidad de GPU dedicada, lo que permite traduccion privada y offline en el propio dispositivo.
- Traduccion de documentacion tecnica: con prompts de terminologia y estilo se puede mantener coherencia terminologica en manuales y guias multilingues.
- Localizacion de interfaces y cadenas de aplicaciones: al ser de turno unico y rapido, encaja en pipelines que traducen cadenas cortas de forma masiva.
- Traduccion de correos y mensajes en herramientas de escritorio: el modelo puede integrarse en clientes de correo o mensajeria que necesiten traduccion puntual sin enviar datos a la nube.
- Procesamiento de datos estructurados multilingues: la model card menciona soporte de prompts para datos estructurados, util para traducir campos de formularios o registros.
- Traduccion de contenido web en navegadores o extensiones: con 102 idiomas cubiertos, puede servir como motor de traduccion en aplicaciones de navegador con inferencia local.
- Despliegue como servicio HTTP local: el comando `flm serve hy-mt3-flash:1.8b` permite exponer el modelo como endpoint para otras aplicaciones del sistema.

## Benchmarks y rendimiento

La model card proporciona un unico dato de calidad: sobre 640 segmentos de WMT24++ (8 idiomas, ambas direcciones), la build NPU obtiene chrF 49,1 frente a 49,6 de la version BF16 ejecutada con llama.cpp. La diferencia emparejada es de -0,5, con un intervalo de confianza del 95% de -1,0 a +0,1.

| Evaluacion | Resultado |
|---|---|
| WMT24++ (640 segmentos, 8 idiomas, ambas direcciones) | chrF 49,1 (NPU) frente a 49,6 (BF16 llama.cpp) |
| Diferencia emparejada | -0,5 (IC 95%: -1,0 a +0,1) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: NPU AMD Ryzen AI (XDNA2), presente en procesadores Ryzen AI de portatiles y mini-PC.
- Version minima de software: FastFlowLM v1.0.14 o posterior.
- Tamano de pesos: aproximadamente 1,7 GB en el repositorio (Q4_K cuerpo + Q8_0 cabeza de salida).
- VRAM estimada: no aplica, ya que la inferencia se ejecuta en NPU; no se dispone de cifras de memoria del sistema requerida.
- GPU recomendadas: no disponible; esta build esta pensada para NPU, no para GPU.
- Compatibilidad con GPU consumer: no disponible para esta build concreta.
- Opciones de despliegue: FastFlowLM mediante `flm run hy-mt3-flash:1.8b` (ejecucion puntual) o `flm serve hy-mt3-flash:1.8b` (servicio HTTP).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Hy-MT3-1.8B-NPU2 (esta ficha) | 1,8B | no disponible | 102 | Apache-2.0 | NPU AMD Ryzen AI (XDNA2) |
| Hy-MT3-1.8B (Tencent, original) | 1,8B | no disponible | 102 | Apache-2.0 | GPU/CPU (BF16) |
| Hy-MT2-1.8B-NPU2 (FastFlowLM) | 1,8B | no disponible | no disponible | no disponible | NPU AMD Ryzen AI (XDNA2) |

La comparacion con el modelo original es directa: misma arquitectura y cobertura linguistica, con una perdida de calidad de 0,5 puntos chrF en WMT24++ a cambio de ejecucion en NPU y menor huella de memoria. Hy-MT2-1.8B-NPU2 es la build predecesora del mismo autor y comparte kernels de NPU, lo que indica una evolucion incremental del stack.

## Limitaciones y advertencias

- Modelo de turno unico: no mantiene contexto entre peticiones, por lo que no es adecuado para conversaciones multi-turno ni para traduccion con memoria de terminos previos dentro de una misma sesion.
- Perdida de calidad respecto a BF16: la cuantizacion Q4_K/Q8_0 introduce una diferencia de -0,5 chrF en WMT24++, aunque el intervalo de confianza incluye valores proximos a cero.
- Requiere hardware especifico: solo funciona en NPU AMD Ryzen AI (XDNA2) con FastFlowLM v1.0.14 o superior; no es un modelo desplegable en GPU convencional con esta build.
- Dependencia de software propietario del stack: el layout `q4nx` y los kernels de NPU son especificos de FastFlowLM.
- Cobertura de idiomas amplia pero sin datos de calidad por idioma: el benchmark cubre solo 8 idiomas, por lo que el rendimiento en el resto de los 102 idiomas no esta documentado.
- Riesgo de alucinacion y sesgos: no se dispone de informacion especifica sobre sesgos conocidos ni sobre tasas de alucinacion en la informacion proporcionada.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar `LICENSE.txt` y la model card original para condiciones adicionales de terminologia y prompts.
- Fecha de publicacion futura en el repositorio (noviembre de 2026): conviene verificar la disponibilidad real y la version del software antes de integrarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FastFlowLM/Hy-MT3-1.8B-NPU2
- Modelo original de Tencent: https://huggingface.co/tencent/Hy-MT3-1.8B
- Repositorio FastFlowLM: https://github.com/FastFlowLM/FastFlowLM
- Documentacion del modelo en FastFlowLM: https://fastflowlm.com/docs/models/hy-mt3/

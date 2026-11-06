# guitaripod/groot-19b-a3b-uncensored-nvfp4

## Resumen

Groot 19B-A3B uncensored NVFP4 es una variante del modelo GrootTeam/Groot-19B-A3B-261023, un transformer de tipo Mixture of Experts (MoE) con 19.000 millones de parametros nominales y aproximadamente 3.000 millones activos por token. Sobre esa base, el autor guitaripod aplica una ablacion direccional (abliteration) para eliminar el comportamiento de rechazo y despues recuantiza los pesos al plan NVFP4 original del modelo padre, orientado a GPUs Blackwell. El resultado se publica con licencia Apache-2.0 y solo soporte declarado de ingles.

La relevancia de esta ficha no esta en la mejora de capacidades, sino en lo contrario: el autor documenta de forma inusualmente honesta el coste de la ablacion. El modelo padre ya cumplia el 98,4% de las peticiones daninas en su conjunto de evaluacion, de modo que la ablacion solo aporta unos dos puntos de cumplimiento adicionales a cambio de una perdida medible de calidad (4,9 puntos en su banco de pruebas, 8,9 en LiveCodeBench) y un mayor consumo de tokens por respuesta correcta.

Tecnicamente es interesante por tres motivos: conserva la arquitectura hibrida del padre (capas gated-delta y capas de atencion completa), mantiene la capa MTP sin cuantizar para permitir decodificacion especulativa, y emplea un esquema de cuantizacion mixto con atencion en FP8 W8A8 y expertos en NVFP4 con grupos de 16. El repositorio ocupa 13,5 GB y acumula 25 descargas en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido (capas gated-delta + capas de atencion completa), con capa MTP |
| Parametros totales | 11.316.316.016 (pesos reales en safetensors); el autor denomina al modelo "19B" |
| Parametros activos | Aproximadamente 3.000 millones (3B active, segun el autor) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | NVFP4 (expertos enrutados, experto compartido y lm_head, grupos de 16) + FP8 W8A8 (atencion); MTP sin cuantizar; formato compressed-tensors de 8 bits |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors, NVFP4/FP8) |
| Expertos | 128 expertos, top-8 por token |
| Capas | 30 gated-delta + 10 de atencion completa (40 en total) |
| Modelo base | GrootTeam/Groot-19B-A3B-261023 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del padre sin cambios: un MoE con 128 expertos y enrutamiento top-8, distribuido en 40 capas, de las cuales 30 son gated-delta (mecanismo de estado lineal) y 10 son de atencion completa. Esta mezcla busca reducir el coste de atencion en contextos largos manteniendo capacidad de recuperacion exacta en una fraccion de las capas. Conserva ademas una capa MTP (multi-token prediction) que el autor deja sin cuantizar para que la decodificacion especulativa con dos tokens borrador siga funcionando.

El entrenamiento original del padre no se detalla en la informacion disponible. Lo que si se documenta con precision es el proceso de ablacion y recuantizacion. Primero se extraen direcciones de rechazo a partir de los residuales del primer token generado con 200 prompts daninos y 200 inofensivos, emparejados por longitud (media de 22,8 tokens en ambos lados), calculando la diferencia normalizada de medias por capa. Despues se aplica una ablacion de atencion con Heretic sobre `self_attn.o_proj` y `linear_attn.out_proj`, con 120 ensayos de Optuna y preservacion de norma; se selecciona el ensayo 57, con KL de 0,0801 sobre texto benigno, peso maximo 1,45 en la capa 28,93, peso minimo 0,18 y distancia minima entre pesos de 18,61. Como Heretic no alcanza los tensores fusionados de expertos, estos se ablan separadamente con fuerza 1,5 en las 40 capas.

La cuantizacion reutiliza literalmente los `config_groups` del padre: atencion en FP8 W8A8, expertos y lm_head en NVFP4 con grupos de 16, y torre de vision y tensores `mtp.*` excluidos. La calibracion usa 512 muestras de `tatsu-lab/alpaca` con la plantilla de chat del padre.

## Capacidades

- Generacion de texto y razonamiento general en ingles, con modo de razonamiento heredado del modelo base.
- Generacion de codigo, aunque con degradacion medida frente al padre (LiveCodeBench −8,9 puntos).
- Matematicas: GSM8K cae de 94,0 en el padre a 83,0 en esta construccion (evaluado en BF16).
- Uso de herramientas (tool calling / function calling): el autor indica que la diferencia cae dentro del intervalo de confianza, sin cambio claro.
- Razonamiento multi-paso y uso como agente: sin diferencia significativa reportada en las pruebas del autor.
- Capacidades multimodales: la model card menciona una torre de vision en el plan de cuantizacion del padre, aunque no se detalla su funcionamiento en esta variante.
- Decodificacion especulativa con dos tokens borrador gracias a la capa MTP sin cuantizar.
- Multilingue: limitado a ingles segun la etiqueta de idioma del repositorio.
- Comportamiento sin rechazo (uncensored): el cumplimiento en HarmBench sube del 1,6% al 3,7%.

## Casos de uso

- Investigacion sobre alineacion y rechazo: el modelo sirve como objeto de estudio controlado para medir como una ablacion direccional afecta al cumplimiento y a la calidad, con pipeline y semillas publicados en el repositorio del autor.
- Evaluacion de tecnicas de cuantizacion: al reutilizar el plan NVFP4 del padre, permite comparar FP8 W8A8 en atencion frente a NVFP4 en expertos sobre los mismos pesos, midiendo impacto en perplejidad y benchmarks.
- Pruebas de decodificacion especulativa: la capa MTP sin cuantizar permite validar implementaciones de speculative decoding con dos tokens borrador en vLLM sobre hardware Blackwell.
- Analisis de robustez de clasificadores de seguridad: el autor advierte que la coincidencia de cadenas sobre frases de rechazo es inutil en esta construccion (1,6% en una version que los jueces puntuan de forma muy distinta), lo que lo convierte en un caso de prueba para jueces basados en modelos.
- Procesamiento de documentos largos en ingles: con 256K de contexto y atencion hibrida, es adecuado para tareas de resumen y extraccion sobre corpus extensos, siempre que se acepte la perdida de calidad frente al padre.
- Estudio de coste energetico en inferencia: el autor reporta 1,98 Wh por respuesta correcta frente a 0,79 del padre, un dato util para investigacion sobre eficiencia en modelos abliterados.
- Experimentacion local en GPUs Blackwell con vLLM: el formato compressed-tensors NVFP4 esta pensado para ese stack, lo que facilita desplegar el modelo en una sola GPU de gama alta de esa generacion.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card. HarmBench se evalua con `cais/HarmBench-Llama-2-13b-cls`; Refusals y Hot con un juez local tipo StrongREJECT sobre 320 prompts retenidos; XSTest con 250 prompts seguros.

| Construccion | HarmBench compliance | Refusals | Hot >=0,5 | XSTest refusals |
|---|---|---|---|---|
| Padre (BF16) | 1,6% | 7,8% | 92,2% | no disponible |
| Abliterado (BF16) | 2,5% | 5,0% | 95,0% | no disponible |
| Esta build (NVFP4) | 3,7% | 2,8% | 97,2% | 0,0% |

| Construccion | GSM8K (200) | Calidad blackwall | Decodificacion | Wh por respuesta correcta |
|---|---|---|---|---|
| Padre | 94,0 | 78,5 | 379 tok/s | 0,79 |
| Esta build | 83,0 (BF16) | 73,6 | 364 tok/s | 1,98 |

Comparaciones pareadas sobre las mismas preguntas de blackwall: calidad −4,9 (IC 95% de −7,6 a −2,3), LiveCodeBench −8,9, Graphwalks −6,5. Matematicas, MRCR, SuperGPQA y uso de herramientas caen dentro del intervalo, sin diferencia clara. El autor senala una varianza entre ejecuciones de aproximadamente 2 puntos (los mismos pesos puntuaron 75,5 en una ejecucion anterior).

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 13,5 GB, por lo que la inferencia requiere al menos unos 16 GB de VRAM para pesos mas overhead de contexto; con 256K de contexto la cache KV eleva el requisito de forma considerable.
- GPU recomendadas: el formato NVFP4 esta disenado para GPUs Blackwell (serie RTX 50 y B200). En generaciones anteriores el soporte de NVFP4 es limitado o inexistente.
- GPU de consumo: cabe en teoria en tarjetas Blackwell de gama alta con 16 GB o mas, aunque el contexto largo exige mas memoria.
- Opciones de despliegue: vLLM es el stack indicado por el autor (formato compressed-tensors); llama.cpp y Ollama no estan confirmados para NVFP4 en esta configuracion.
- Latencia y throughput: 364 tok/s de decodificacion reportados por el autor, frente a 379 tok/s del padre.
- Eficiencia: 1,98 Wh por respuesta correcta, aproximadamente 2,5 veces el consumo del padre.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Groot 19B-A3B uncensored NVFP4 (este) | 11.316.316.016 reales | ~3B | 256K | Apache-2.0 | Abliterado, cuantizado NVFP4, GSM8K 83,0 |
| GrootTeam/Groot-19B-A3B-261023 (padre) | 19B nominales | ~3B | 256K | Apache-2.0 | Sin abliterar, BF16, GSM8K 94,0 |
| Alternativas MoE de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

La comparacion mas directa es con el propio modelo padre, que supera a esta variante en todos los benchmarks de capacidad reportados y solo es inferior en cumplimiento de peticiones daninas, metrica que no constituye una ventaja de calidad.

## Limitaciones y advertencias

- La ablacion elimina una direccion de rechazo, pero no anade criterio, precision ni seguridad. El autor lo declara explicitamente: la salida es responsabilidad del usuario.
- Perdida de calidad medible: −4,9 puntos en blackwall, −8,9 en LiveCodeBench y −6,5 en Graphwalks frente al padre.
- Mayor coste por respuesta: 1,98 Wh por respuesta correcta frente a 0,79, porque genera mas tokens por respuesta.
- Varianza entre ejecuciones de aproximadamente 2 puntos, lo que limita la precision de comparaciones finas.
- Solo ingles declarado; no hay soporte multilingue documentado.
- La cuantizacion NVFP4 limita el hardware compatible a GPUs Blackwell y al stack vLLM con compressed-tensors.
- La capa MTP se distribuye sin cuantizar, lo que puede complicar despliegues que esperen un formato homogeneo.
- Riesgo de alucinacion: no se reportan metricas especificas de factualidad; la degradacion general de calidad sugiere un riesgo igual o superior al del padre.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible.
- Licencia Apache-2.0 permite uso comercial, pero el caracter uncensored puede incumplir politicas de plataformas o legislacion aplicable segun el uso.
- El autor advierte que la deteccion de rechazos por coincidencia de cadenas no funciona en esta construccion, lo que invalida filtros simples en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/guitaripod/groot-19b-a3b-uncensored-nvfp4
- Modelo base: https://huggingface.co/GrootTeam/Groot-19B-A3B-261023
- Repositorio de reproduccion (pipeline, prompts, jueces y scripts de cuantizacion): https://github.com/guitaripod/groot-abliteration
- Dataset de calibracion: https://huggingface.co/datasets/tatsu-lab/alpaca
- Clasificador HarmBench: https://huggingface.co/cais/HarmBench-Llama-2-13b-cls

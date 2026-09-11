# arrochi112/OpenGrad-Qwen3.5-2B-M0-ABL-MinusXLAM-FixedCompute

## Resumen

OpenGrad-Qwen3.5-2B-M0-ABL-MinusXLAM-FixedCompute es un ajuste fino supervisado (SFT) de parametros completos sobre el modelo base Qwen/Qwen3.5-2B, desarrollado por el usuario arrochi112 dentro del proyecto OpenGrad. El modelo se entrena sobre el corpus Canonical-v2 con la fuente xLAM eliminada, durante el presupuesto de 2.400 pasos fijado por la ejecucion de referencia. Su proposito no es el despliegue en produccion, sino servir como artefacto de investigacion reproducible: el autor lo publica porque el resultado del experimento es negativo y solo es verificable si los pesos estan disponibles.

La particularidad metodologica es que, en Canonical-v2, la fuente xLAM esta mapeada a todos los registros de tipo CALL_PREDICTION mientras que las otras tres fuentes se mapean a COMPLETE_TRAJECTORY. Por tanto, eliminar xLAM suprime simultaneamente una fuente de datos y el unico canal de supervision de prediccion de llamadas del corpus. El modelo mide, por tanto, el efecto de eliminar xLAM junto con el canal CALL_PREDICTION, y no constituye una ablacion pura de contenido xLAM.

El resultado confirmatorio es un descenso marcado del recall de llamadas (call_f1 de 0,6030 frente a 0,7470 de la ejecucion de referencia y 0,6191 del modelo sin entrenar), con un aumento de la precision y una caida de las llamadas excesivas. El modelo se vuelve conservador y deja de recuperar llamadas que deberia emitir. Todos los checkpoints de ambas ramas del experimento quedan marcados como REJECTED en la puerta de regresion sobre recall de llamadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la model card; corresponde a la del modelo base Qwen/Qwen3.5-2B |
| Parametros totales | Aproximadamente 2B, segun el identificador del modelo base (no confirmado de forma explicita en la model card) |
| Parametros activos | No aplica: no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. No se publican variantes cuantizadas; los pesos se distribuyen en safetensors en la precision resultante del SFT |
| Idiomas soportados | No disponible |
| Licencia | other / composite-per-source (licencia compuesta por fuente) |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 22,6 GB (incluye los cuatro checkpoints publicados) |
| Modelo base | Qwen/Qwen3.5-2B (relacion: finetune) |
| Checkpoints publicados | checkpoint-600, checkpoint-1200 (seleccionado en DEV), checkpoint-1800, checkpoint-2400 |
| Dataset de entrenamiento | arrochi112/OpenGrad-ToolPolicy-Canonical-v2-minus-xlam |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B y se somete a un ajuste fino supervisado de parametros completos (full-parameter SFT) sobre el corpus Canonical-v2 con la fuente xLAM eliminada. El entrenamiento sigue el presupuesto de 2.400 pasos de la ejecucion de referencia, lo que supone aproximadamente 1,53 veces mas exposicion sobre el corpus retenido que la rama de exposicion equiparada (matched-exposure, 1.060 pasos). La model card no detalla la composicion exacta del dataset, el numero de tokens ni si se aplicaron fases de RLHF o DPO; la unica tecnica declarada es el SFT.

La innovacion metodologica relevante no es arquitectonica sino experimental. En Canonical-v2, la identidad de fuente y el tipo de supervision estan perfectamente alineados: xLAM produce todos los registros CALL_PREDICTION y las otras tres fuentes producen COMPLETE_TRAJECTORY. Por eso el diseno separa dos ramas complementarias (presupuesto fijo y exposicion equiparada) que deben leerse conjuntamente: la rama que entrena mas rinde mejor, lo que indica que la perdida de recall se asocia a la supervision ausente y no al presupuesto de entrenamiento reducido. El autor senala que separar ambas variables exigiria otra fuente de CALL_PREDICTION respaldada por evidencia.

## Capacidades

- Prediccion de llamadas a herramientas (CALL_PREDICTION) y emision de trayectorias completas de invocacion (COMPLETE_TRAJECTORY), que son los dos canales de supervision presentes en el corpus de entrenamiento.
- Soporte de tool calling y function calling, segun los tags del repositorio y el dataset de entrenamiento.
- Comportamiento de clarificacion: la columna clarify de la evaluacion confirmatoria mide respuestas de aclaracion, con valores de 0,6026 a 0,8194 en las distintas ramas.
- Decision de abtencion o no emision de llamadas: la columna unsupp registra este comportamiento.
- Control del exceso de llamadas (over_call), que cae hasta 0,0716 en esta rama frente a 0,6425 del modelo sin entrenar.
- Capacidades generales de generacion de texto, razonamiento, codigo o matematicas del modelo base: no evaluadas ni documentadas en la informacion disponible.
- Capacidades multilingues: no disponibles.
- Modo de razonamiento explicito (thinking), vision o audio: no documentados.

Advertencia del propio autor: la precision de seleccion de herramienta, la validez de argumentos y la validez de esquema no se calculan en este trabajo, y su ausencia no equivale a un valor cero.

## Casos de uso

- Reproduccion de experimentos de ablacion: el modelo permite reconstruir la comparacion entre la rama de presupuesto fijo y la de exposicion equiparada, verificando si la caida de recall se mantiene bajo el mismo protocolo de evaluacion y la misma particion confirmatoria de 1.277 ejemplos.
- Estudio de canales de supervision: sirve para analizar que ocurre cuando un corpus de tool calling pierde de golpe una fuente de datos y todo su canal de supervision de prediccion de llamadas, un escenario frecuente al depurar datasets propios.
- Calibracion de puertas de regresion (gates): dado que todos los checkpoints quedan REJECTED en regression.call_recall frente a B0, el modelo es util como caso de prueba para disenar y validar umbrales de aceptacion en pipelines de entrenamiento.
- Analisis del compromiso precision-recall en agentes: con precision de 0,7893 y recall de 0,4879, el modelo ejemplifica el comportamiento de un sistema demasiado conservador, util para estudiar el coste de no emitir llamadas necesarias.
- Desarrollo de harnesses de evaluacion: los cuatro checkpoints publicados permiten probar frameworks de evaluacion de tool calling sobre modelos pequenos sin depender de pesos propietarios.
- Docencia e investigacion sobre SFT: al ser un ajuste de parametros completos sobre un modelo de aproximadamente 2B, es viable reproducirlo en infraestructura academica y usarlo como ejemplo de resultado negativo publicado de forma integra.
- Auditoria de alineacion fuente-supervision en datasets: el modelo ilustra materialmente el problema de confundir la identidad de una fuente con el tipo de supervision que genera, util en revisiones de calidad de corpus.

Ninguno de estos casos implica uso en produccion ni uso autonomo de herramientas, usos que el autor excluye de forma explicita.

## Benchmarks y rendimiento

Los unicos datos publicados son los de la particion confirmatoria (1.277 ejemplos, puntuada una sola vez) que figuran en la model card. Se transcriben tal cual, con la coma decimal en castellano:

| Ejecucion | call_f1 | precision | recall | over_call | clarify | unsupp |
|---|---:|---:|---:|---:|---:|---:|
| B0 (sin entrenar) | 0,6191 | 0,4542 | 0,9722 | 0,6425 | 0,1009 | 0,0131 |
| Referencia (corpus completo) @1800 | 0,7470 | 0,7350 | 0,7594 | 0,1505 | 0,7682 | 0,5430 |
| Esta rama (presupuesto fijo) @1200 | 0,6030 | 0,7893 | 0,4879 | 0,0716 | 0,8059 | 0,6026 |
| Rama de exposicion equiparada @1060 | 0,5557 | 0,8067 | 0,4238 | 0,0558 | 0,8194 | 0,6203 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones derivadas del tamano del modelo (aproximadamente 2B parametros) y no estan confirmadas en la model card.

- Inferencia en bf16/fp16: del orden de 4,0 a 5,0 GB de pesos, mas memoria para cache KV segun la longitud de contexto efectiva (no documentada).
- Inferencia en int8: del orden de 2,0 a 2,5 GB.
- Inferencia en int4: del orden de 1,2 a 1,5 GB.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas con 8 GB o mas de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070) en precision de 16 bits, y en tarjetas de 6 a 8 GB con cuantizacion.
- GPU de centro de datos: no requiere A100 ni H100 para inferencia; esas tarjetas solo serian necesarias para reentrenar, ya que el SFT es de parametros completos y el repositorio ocupa 22,6 GB.
- Opciones de despliegue: la model card declara la libreria transformers y el repositorio lleva el tag endpoints_compatible, por lo que es desplegable mediante transformers y potencialmente en Hugging Face Inference Endpoints. El soporte de vLLM, TGI, llama.cpp u Ollama no esta verificado ni documentado, y no se publican pesos en formato GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de benchmarks de modelos externos comparables. La comparacion relevante disponible es interna al propio experimento OpenGrad:

| Modelo o rama | Parametros | call_f1 (confirmatoria) | recall | over_call | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| Qwen/Qwen3.5-2B (base) | Aproximadamente 2B | No disponible | No disponible | No disponible | Segun el modelo base | Publico en Hugging Face |
| B0 (sin entrenar) | No disponible | 0,6191 | 0,9722 | 0,6425 | No disponible | No disponible en este repositorio |
| OpenGrad referencia (corpus completo) @1800 | Aproximadamente 2B | 0,7470 | 0,7594 | 0,1505 | composite-per-source | No disponible en este repositorio |
| OpenGrad exposicion equiparada @1060 | Aproximadamente 2B | 0,5557 | 0,4238 | 0,0558 | composite-per-source | No disponible en este repositorio |
| Este modelo (presupuesto fijo) @1200 | Aproximadamente 2B | 0,6030 | 0,4879 | 0,0716 | composite-per-source (other) | Publico en Hugging Face |

Alternativas externas de tamano similar o de tarea equivalente (por ejemplo, otros modelos de 1B a 3B orientados a tool calling): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto de investigacion, no modelo de produccion. El autor lo declara explicitamente y lo publica solo para hacer verificable un resultado negativo.
- No esta ajustado en seguridad ni alineado. No debe emplearse para uso autonomo de herramientas.
- Resultado de validacion desfavorable: todos los checkpoints de ambas ramas quedan REJECTED en regression.call_recall frente a B0, igual que los de la ejecucion de referencia.
- Perdida de recall severa: 0,4879 frente a 0,9722 de B0 y 0,7594 de la referencia. El modelo omite llamadas que deberia emitir.
- Semilla unica. El autor advierte que cualquier diferencia pequena entre ramas es un hallazgo a replicar, no un resultado consolidado.
- Comportamientos no medidos: no se calculan la precision de seleccion de herramienta, la validez de argumentos ni la validez de esquema. La ausencia de estas metricas no implica un valor cero.
- Poblacion de evaluacion sesgada: la particion confirmatoria no contiene ejemplos de respuesta directa, por lo que no se mide el comportamiento en ese regimen.
- Ambiguedad causal del diseno: mide la eliminacion conjunta de la fuente xLAM y del canal CALL_PREDICTION, no una ablacion pura de contenido xLAM. No admite afirmaciones causales especificas sobre xLAM.
- Datos de entrenamiento sinteticos y con invocaciones de herramientas no verificadas; el modelo hereda las limitaciones de las fuentes publicas empleadas.
- Rendimiento deficiente esperado fuera del comportamiento de frontera de decision para el que fue entrenado.
- Licencia composite-per-source: al ser una licencia compuesta por fuente, el uso comercial exige revisar las condiciones de cada fuente de datos y las del modelo base Qwen/Qwen3.5-2B.
- Idiomas soportados, contexto maximo y precision de pesos: no documentados, lo que impide garantizar un comportamiento concreto en produccion.
- Metricas nulas de adopcion en el momento de la consulta: 0 descargas y 0 likes, sin senales de validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arrochi112/OpenGrad-Qwen3.5-2B-M0-ABL-MinusXLAM-FixedCompute
- Repositorio del proyecto OpenGrad: https://github.com/arjhinety/OpenGrad
- Dataset de entrenamiento: https://huggingface.co/datasets/arrochi112/OpenGrad-ToolPolicy-Canonical-v2-minus-xlam
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante para este modelo; los resultados devueltos corresponden a consultas no relacionadas (formulas de interferencia, gamas de monitores, divergencia de Bregman, modos laser y codigos de billetes de tren) y se omiten por no aportar informacion verificable.

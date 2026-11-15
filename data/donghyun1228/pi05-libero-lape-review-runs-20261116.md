# Donghyun1228/pi05-libero-lape-review-runs-20261116

## Resumen

Este repositorio no contiene un modelo de lenguaje generativo al uso, sino un conjunto de artefactos de evaluacion de politicas de control robofico derivadas de π0.5 (pi05), un modelo vision-language-action (VLA) orientado a manipulacion robotica. El autor, Donghyun1228, publica los resultados de una bateria de experimentos de adaptacion sobre el benchmark LIBERO, centrados en estudiar como varian las tasas de exito al modificar condiciones de vista (view_small, view_medium, view_large) y de orientacion de camara (yaw10, yaw20, yaw30), ademas de una ejecucion "fresh-walk" de 50 fotogramas sobre H100 con semilla de entorno 7 y 2000 episodios.

El interes del artefacto es metodologico: documenta la sensibilidad de una politica VLA a perturbaciones de punto de vista y demuestra que la tasa de exito puede desplomarse de forma dramatica (del 93,95 % en yaw10 al 2,60 % en yaw30 para la ejecucion fresh50) segun la combinacion de semilla, condicion y renderizador (osmesa frente a egl). Es material de revision para el ciclo de respuesta a revisores (LAPE) del autor, no un checkpoint listo para produccion.

El repositorio pesa 69,4 GB y, segun la propia model card, no incluye checkpoints nativos ni train_state, por lo que no es directamente reutilizable como modelo. La informacion disponible sobre arquitectura, licencia e idiomas es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (politica VLA derivada de π0.5 / pi05) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el autor indica que no se incluyen checkpoints nativos ni train_state) |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura interna del modelo base π0.5 mas alla de su naturaleza VLA (vision-language-action), orientada a generar acciones de manipulacion a partir de observaciones visuales e instrucciones. El repositorio contiene exclusivamente politicas de evaluacion entrenadas a partir de distintas semillas (1, 3 y 4) y evaluadas bajo condiciones de vista y yaw variadas sobre LIBERO.

Los detalles de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO o de aprendizaje por imitacion) no estan disponibles en la informacion suministrada. Lo unico documentado es el protocolo de evaluacion: renderizadores osmesa y egl, condiciones view_small/view_medium/view_large y yaw10/yaw20/yaw30, y una ejecucion fresh-walk de 50 fotogramas sobre H100 con semilla de entorno 7 y 2000 episodios.

## Capacidades

- Control robotico de manipulacion en el benchmark LIBERO mediante politicas VLA derivadas de π0.5.
- Generacion de acciones condicionadas a observaciones visuales e instrucciones de tarea (vision-language-action).
- Evaluacion reproducible bajo condiciones controladas de punto de vista y orientacion de camara.
- Ejecucion en dos backends de renderizado (osmesa y egl), lo que permite comparar resultados entre entornos graficos.
- No se documentan capacidades de generacion de texto, codigo, matematicas, tool calling, agentes ni multilingues, por tratarse de un artefacto de evaluacion de politicas roboticas y no de un LLM.

## Casos de uso

- **Analisis de robustez ante cambios de camara:** utilizar las ejecuciones yaw10/yaw20/yaw30 para cuantificar cuanto degrada la tasa de exito una politica VLA cuando se altera la orientacion del punto de vista, con datos concretos (93,95 % en yaw10 frente a 2,60 % en la ejecucion fresh50 yaw30).
- **Reproduccion de experimentos de adaptacion VLA:** el codigo asociado (github.com/Donghyun1228/vla_adaptation) permite replicar el pipeline de entrenamiento y evaluacion sobre LIBERO con las semillas 1, 3 y 4.
- **Comparacion de renderizadores en simulacion robotica:** los resultados con osmesa y egl permiten estudiar si el backend grafico influye en la tasa de exito (por ejemplo, seed3_yaw30 con egl alcanza 91,10 %).
- **Revision por pares de resultados de investigacion:** el repositorio sirve como material suplementario para revisores que necesiten verificar las cifras reportadas en un envio a conferencia o journal (LAPE, reviewer-response runs).
- **Estudio de sensibilidad a semilla de entrenamiento:** comparar seed1, seed3 y seed4 bajo condiciones equivalentes (view_large: 66,00 % en seed3 frente a 68,25 % en seed4) para evaluar la varianza entre inicializaciones.
- **Diagnostico de fallos en politicas de manipulacion:** las ejecuciones con tasas muy bajas (fresh50_yaw30_s42, 2,60 %) son utiles para identificar regimenes de fallo catastrofico y disenar estrategias de aumento de datos o domain randomization.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre LIBERO (tasa de exito en %):

| Ejecucion | Condicion | Exito % | Renderizador |
|---|---|---|---|
| fresh50_yaw30_s42 | yaw30 | 2,60 | osmesa |
| seed1_view_medium | view_medium | 77,75 | osmesa |
| seed1_view_small | view_small | 87,10 | osmesa |
| seed1_yaw10 | yaw10 | 93,95 | osmesa |
| seed1_yaw20 | yaw20 | 93,40 | osmesa |
| seed3_view_large | view_large | 66,00 | egl |
| seed3_yaw30 | yaw30 | 91,10 | egl |
| seed4_view_large | view_large | 68,25 | egl |
| seed4_yaw30 | yaw30 | 91,05 | egl |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, por no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- La evaluacion fresh-walk se ejecuto sobre GPU H100, segun la model card.
- No se especifica la VRAM necesaria para inferencia ni el tamano del modelo base π0.5 en la informacion disponible.
- No se documentan GPU recomendadas adicionales, compatibilidad con GPUs de consumo, ni opciones de despliegue (vLLM, llama.cpp, Ollama, TGI), ya que se trata de una politica VLA y no de un LLM.
- No se proporcionan datos de latencia ni throughput.
- El repositorio ocupa 69,4 GB, lo que condiciona el almacenamiento necesario para descargarlo, aunque no contiene checkpoints nativos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (politicas π0.5 sobre LIBERO) | Artefacto de evaluacion VLA | no disponible | no disponible | no disponible | Hugging Face (69,4 GB, sin checkpoints) |
| π0.5 (pi05) base | Modelo VLA | no disponible | no disponible | no disponible | no disponible en la informacion |
| Alternativas VLA comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene checkpoints nativos ni train_state, por lo que no puede usarse directamente para inferencia sin reentrenar o recuperar los pesos desde otra fuente.
- La licencia no esta especificada, lo que impide determinar si se permite uso comercial; debe consultarse con el autor antes de cualquier reutilizacion.
- Los resultados muestran una altisima sensibilidad a la condicion de camara: la ejecucion fresh50_yaw30_s42 cae al 2,60 % de exito, lo que sugiere riesgo de fallo catastrofico fuera de la distribucion de entrenamiento.
- Hay variabilidad entre semillas y renderizadores (view_large: 66,00 % con egl en seed3 frente a 68,25 % en seed4; yaw30: 2,60 % con osmesa en fresh50 frente a 91,10 % con egl en seed3), lo que complica la comparacion directa entre ejecuciones.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de idioma, por no ser un modelo de lenguaje.
- Al ser material de revision (reviewer-response runs), su validez esta acotada al contexto del envio y no constituye una validacion independiente.
- No se proporcionan datos sobre el dataset de entrenamiento ni sobre el proceso de adaptacion, lo que limita la reproducibilidad completa.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Donghyun1228/pi05-libero-lape-review-runs-20261116
- Parte 1 de las ejecuciones: https://huggingface.co/Donghyun1228/pi05-libero-lape-review-runs-20261113
- Parte 2 de las ejecuciones: https://huggingface.co/Donghyun1228/pi05-libero-lape-review-runs-20261114
- Codigo del proyecto: https://github.com/Donghyun1228/vla_adaptation

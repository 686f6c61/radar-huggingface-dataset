# husnainbinmunawar/acousticedge-fsdd-experimental

## Resumen

AcousticEdge FSDD es un clasificador de audio compacto desarrollado por el usuario de Hugging Face `husnainbinmunawar`, entrenado para reconocer digitos hablados (spoken digits) sobre el Free Spoken Digit Dataset (FSDD). El modelo opera sobre caracteristicas de log-espectro de 129 dimensiones y esta pensado explicitamente para ejecutarse en CPU, con un caracter experimental y de investigacion. Con solo 10.730 parametros, es un modelo de escala minima orientado a validar pipelines de clasificacion de audio mas que a competir en rendimiento con modelos de produccion.

El punto de interes tecnico es su planteamiento de evaluacion: el hablante final en orden alfabetico (`yweweler`) se reserva por completo como conjunto de test, de modo que el modelo se evalua en un escenario de hablante no visto (speaker-held-out). El entrenamiento usa 2.500 grabaciones y el test 500, alcanzando una precision de 0,4800 frente a una linea base mayoritaria de 0,1000.

Es relevante ahora como referencia metodologica reproducible para tareas de audio en entornos con recursos limitados (edge computing, CPU-only) y como ejemplo de evaluacion honesta con particion por hablante. El autor advierte de forma explicita que se trata de un benchmark de transferencia en audio y no de una prueba de fallos de maquina, mantenimiento industrial o seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (clasificador compacto sobre caracteristicas de log-espectro de 129 dimensiones) |
| Parametros totales | 10.730 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificacion de audio, no modelo generativo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (tarea de digitos hablados en ingles segun el dataset de origen) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (libreria PyTorch) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que se trata de un clasificador compacto que consume caracteristicas de log-espectro de 129 dimensiones. No se especifica si emplea capas densas, convolucionales u otra topologia, ni el numero de capas o funciones de activacion. El dato de parametros totales (10.730) confirma que es un modelo de escala muy reducida, coherente con su orientacion a inferencia en CPU.

El entrenamiento se realizo sobre el Free Spoken Digit Dataset (FSDD), con una particion estricta por hablante: el hablante `yweweler` (el ultimo en orden alfabetico) se reserva integramente para test. El conjunto de entrenamiento consta de 2.500 grabaciones y el de test de 500. No se indica en la informacion disponible el numero de epocas, la funcion de perdida, el optimizador, ni si hubo aumento de datos o regularizacion. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.), lo cual es esperable en un modelo de esta naturaleza y tamano.

## Capacidades

- Clasificacion de audio: asigna una clase (digito hablado) a una representacion de log-espectro de 129 dimensiones.
- Reconocimiento de digitos hablados (spoken digit recognition) sobre el dominio de FSDD.
- Inferencia en CPU como caso de uso declarado en las etiquetas del modelo.
- Ejecucion ligera: con 10.730 parametros, el coste computacional y de memoria es minimo.
- No dispone de generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles; el dataset de origen es de digitos en ingles.
- No dispone de modo thinking, audio generativo ni otras capacidades especiales.

## Casos de uso

- Prototipado de pipelines de clasificacion de audio en CPU: sirve como base para validar la cadena completa (extraccion de log-espectro de 129 dimensiones, carga de pesos safetensors, inferencia y evaluacion) antes de escalar a modelos mayores.
- Docencia y experimentacion en reconocimiento de voz: su tamano minimo y su particion por hablante lo hacen util para ilustrar el efecto de evaluar con hablantes no vistos y comparar contra una linea base mayoritaria.
- Benchmark de transferencia de hablante: permite medir de forma reproducible la degradacion de precision cuando el hablante de test no aparece en entrenamiento, usando la particion documentada (`yweweler` fuera).
- Pruebas de integracion en entornos edge: al ejecutarse en CPU y ocupar un espacio de parametros minimo, puede desplegarse en dispositivos con recursos muy limitados para validar latencia y consumo.
- Referencia de comparacion en investigacion: util como cota inferior de rendimiento frente a clasificadores de audio mas grandes sobre la misma tarea y dataset.
- Validacion de licencias y derivados: al ser CC BY-SA 4.0, sirve para practicar flujos de publicacion de derivados que preserven atribucion y share-alike.
- Filtrado o preclasificacion de senal de audio en etapas tempranas: dado su bajo coste, puede emplearse como primer filtro en cascadas de clasificacion antes de modelos mas costosos (con la precision limitada que implica su 0,48).

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precision en test (speaker-held-out, `yweweler`) | 0,4800 |
| Linea base mayoritaria | 0,1000 |
| Grabaciones de entrenamiento | 2.500 |
| Grabaciones de test | 500 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el modelo no es generativo ni multilingue.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; con 10.730 parametros el modelo ocupa del orden de decenas de kilobytes en precision estandar.
- GPU recomendadas: no necesarias; el modelo esta disenado para CPU.
- Cabe en cualquier GPU de consumo, e incluso en entornos sin GPU.
- Opciones de despliegue: PyTorch (libreria declarada) con pesos en safetensors; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de clasificador.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo se espera una latencia muy baja en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de modelos comparables con datos verificables (parametros, contexto, rendimiento). Se indica "no disponible". Como referencia interna, la unica comparacion documentada es frente a la linea base mayoritaria del propio dataset (0,1000 de precision), que el modelo supera con 0,4800.

## Limitaciones y advertencias

- Precision limitada: 0,4800 sobre 10 clases implica una tasa de error cercana al 52 %, insuficiente para la mayoria de aplicaciones de produccion.
- Dominio muy restringido: solo digitos hablados del FSDD; no generaliza a otros vocabularios, ruidos o condiciones acusticas no representadas.
- Evaluacion con un unico hablante reservado (`yweweler`); el resultado puede no ser representativo de otros hablantes no vistos.
- El autor advierte explicitamente de que no es evidencia de fallos de maquina, mantenimiento industrial ni seguridad; no debe usarse para esos fines.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de clasificaciones erroneas confiadas en audio fuera de dominio.
- Idiomas: no disponibles; el dataset de origen es de digitos en ingles, por lo que el rendimiento en castellano no esta caracterizado.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribucion y a compartir los derivados bajo la misma licencia (share-alike), lo que puede condicionar su integracion en productos propietarios.
- Modelo experimental con 0 descargas y 0 likes en el momento de la consulta; sin validacion por parte de la comunidad.
- No se documentan sesgos especificos, pero al derivar de un dataset pequeno y de pocos hablantes es probable un sesgo hacia las caracteristicas acusticas de esos hablantes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/husnainbinmunawar/acousticedge-fsdd-experimental
- Dataset de origen (FSDD): https://github.com/Jakobovski/free-spoken-digit-dataset
- Licencia Creative Commons BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/

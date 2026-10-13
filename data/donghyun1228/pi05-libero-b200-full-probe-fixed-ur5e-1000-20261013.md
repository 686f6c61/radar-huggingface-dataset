# Donghyun1228/pi05-libero-b200-full-probe-fixed-ur5e-1000-20261013

## Resumen

π₀.₅ full-probe fixed1:1:1: ur5e es un punto de control de robótica publicado por el usuario Donghyun1228 en HuggingFace bajo la librería openpi. No es un modelo de lenguaje: es una política de manipulación (visión-lenguaje-acción) derivada de la familia π₀.₅ de openpi y ajustada específicamente para un experimento de dinámica inversa (*inverse dynamics model*, IDM) sobre el benchmark LIBERO con el brazo UR5e y pinza Robotiq 85. El repositorio ocupa 13,1 GB y se distribuye con licencia Apache-2.0.

El experimento entrena durante 1.000 actualizaciones del optimizador con coeficientes fijos 1:1:1 para los módulos de visión, LLM y experto de acción, sin *probe* de retención ni conjunto de validación meta. La evaluación principal reportada es 167/400 (41,75%) en un protocolo apareado por semilla, con cuatro suites, diez tareas y diez estados iniciales oficiales por suite, cero errores de *rollout* y MuJoCo 3.2.3.

Su relevancia es metodológica más que de producto: documenta de forma inusualmente detallada el árbol de parámetros (51 hojas nativas, más 23 hojas de muñeca añadidas solo para inferencia), las recetas numéricas, los planes y los *journals* de controlador, lo que lo convierte en material útil para reproducibilidad en investigación de políticas robóticas. El autor advierte explícitamente de que las pantallas de 400 episodios no establecen una mejora general ni sustituyen a la mejor línea base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política visión-lenguaje-acción de la familia openpi π₀.₅; el model card describe módulos separados de *vision*, *llm* y *expert* (experto de acción). No se detalla en la informacion disponible si emplea flow matching ni el backbone concreto |
| Parametros totales | No disponible (el repositorio ocupa 13,1 GB, pero no se publica el recuento de parametros) |
| Parametros activos | No aplica; no es un modelo MoE |
| Longitud de contexto | No disponible. Para el entrenamiento se emplean ventanas nativas H10 (horizonte 10); se registran 535.872 ventanas H10 elegibles |
| Tipos de cuantizacion | No se publica una matriz de cuantizacion. Se documentan hojas entrenables en FP32, hojas congeladas y restauracion de las 74 hojas de despliegue en BF16 |
| Idiomas soportados | No disponible; no es un modelo de lenguaje y no se declara cobertura linguistica |
| Licencia | Apache-2.0 |
| Formato de pesos | No se explicita un formato de fichero (safetensors, GGUF, etc.). El repositorio sigue la convencion de openpi y esta estructurado como arbol de parametros (*leaves*) con espacios de nombres RNG independientes para optimizador y diagnostico |
| Hojas del arbol de parametros | 51 hojas nativas (43 entrenables de fuente original en FP32 + 8 congeladas); 23 hojas adicionales de fuente-muneca se anaden solo para inferencia; el despliegue totaliza 74 hojas |
| Libreria | openpi |
| Pipeline declarado | robotics |
| Tamano del repositorio | 13,1 GB |
| Dataset de destino | Donghyun1228/libero-xe-ur5e-dense-contact-probe-20261010 (revision 32649763ecd9c00c263250e86e28e42e3d914021) |
| Snapshots | Entrenamiento/evaluacion 550531952e137a5b41d00d020f069828f5e74945; inferencia 0f6471d99dfc81fabe7c3ab65c141d7640b9ff08 |

## Arquitectura y entrenamiento

La ficha del autor describe un ajuste sobre la arquitectura π₀.₅ empaquetada en openpi, con tres bloques diferenciados (vision, llm y expert) y un controlador cuya formula y ajustes se mantienen sin cambios respecto a la version v1. El experimento, denominado *full-probe fixed 1:1:1*, congela los coeficientes de esos tres modulos en 1/1/1 durante las 1.000 actualizaciones del optimizador: la tabla publicada muestra media, minimo, maximo y valor final de 1,000000 para los tres, aunque el propio autor aclara que se trata de la media no ponderada de los multiplicadores registrados y no de energia de actualizacion efectiva ni de desplazamiento acumulado de parametros.

El entrenamiento parte de 535.872 ventanas nativas H10 correspondientes a 40 linajes de tarea (10 por suite, 4 suites). El optimizador toma 8 ventanas por suite sin reemplazo en cada paso, con tamano de lote B32 y semilla 42, y un sesgo *suite-balanced* que no es *task-balanced*: no todas las tareas contribuyen por igual. Los diagnosticos K4/B8 usan 8 linajes de entrenamiento distintos por suite repartidos en los cuatro microbatches, con espacios de nombres RNG independientes entre optimizador y diagnostico, solapamiento de ventanas permitido y ausencia de *holdout* meta. El punto de control exportado corresponde al paso 999 sin EMA. Las observaciones de la fuente y la retroalimentacion de exito de la politica no se utilizan. Se incluyen activos de normalizacion, planes, *journals*, registros de controlador, inicializacion de la fuente y comprobaciones estrictas de exportacion en crudo.

## Capacidades

- Generacion de acciones motoras en bucle cerrado para manipulacion robotica: el modelo produce comandos de control a partir de observaciones visuales (incluida la vista de muneca) y del estado del robot.
- Manipulacion con contacto denso: el punto de control se entrena sobre un dataset de contacto denso (*dense-contact probe*) con el brazo UR5e y la pinza Robotiq 85.
- Ajuste especifico para el escenario UR5e dentro del protocolo LIBERO, con pantallas apareadas por semilla sobre cuatro suites y diez tareas por suite.
- Transferencia entre cuerpos (*cross embodiment*): la evaluacion cruzada se declara con UR5e y Robotiq 85 como encarnacion objetivo.
- Dinamica inversa (IDM): el experimento se enmarca explicitamente como *inverse-dynamics model*, orientado a predecir acciones dado el estado y la observacion.
- Inferencia con hojas adicionales: 23 hojas nativas de fuente-muneca se anaden exclusivamente en tiempo de inferencia, lo que implica un grafo de despliegue distinto del de entrenamiento.
- Exportacion y verificacion reproducible: el repositorio incluye comprobaciones de exportacion estricta, hashes de inicializacion de las 51 hojas y once ficheros numericos de la fuente identicos entre variantes.
- No se declaran capacidades de *tool calling*, generacion de texto, vision general, audio ni modo de razonamiento explicito, por lo que no cabe atribuirles soporte.

## Casos de uso

- Manipulacion robotica real sobre UR5e: la politica puede desplegarse sobre el brazo UR5e con pinza Robotiq 85 para tareas de contacto denso, empleando las 74 hojas en BF16 y el grafo de inferencia con las hojas de muñeca anadidas.
- Investigacion en modelos de dinamica inversa: sirve como punto de partida para estudiar si el entrenamiento con senal de contacto denso mejora la prediccion de acciones frente a politicas de imitacion clasicas.
- Reproduccion de experimentos de ajuste fino: al publicarse planes, *journals*, registros de controlador, activos de normalizacion y hashes de inicializacion, permite replicar el experimento *full-probe fixed 1:1:1* y comparar contra la variante v1.
- Evaluacion comparativa en LIBERO: el protocolo de cuatro suites x diez tareas x diez estados iniciales (400 episodios) es reutilizable como pantalla de comparacion entre puntos de control de la misma familia.
- Pruebas de transferencia entre cuerpos: util para medir el comportamiento de una politica entrenada en simulacion cuando se evalua con una encarnacion concreta y una pinza determinada.
- *Benchmarking* de infraestructura de simulacion: el autor documenta 16 clientes por GPU, MuJoCo 3.2.3 y cero errores de *rollout*, lo que permite usar el punto de control como carga de trabajo para validar *pipelines* de simulacion masiva.
- Ablaciones controladas de coeficientes de modulo: la tabla de multiplicadores vision/llm/expert a lo largo de 1.000 pasos sirve de referencia para disenar experimentos que si varian esos coeficientes.

## Benchmarks y rendimiento

| Evaluacion | Resultado | Comparacion con v1 |
|---|---|---|
| Politica apareada por semilla (seed7), 4 suites x 10 tareas x 10 estados iniciales | 167/400 (41,75%) | no disponible como total agregado de v1 |
| view_large | 117/400 (29,25%) | 104/400 (+3,25 pp) |
| yaw30 | 201/400 (50,25%) | 215/400 (-3,50 pp) |
| ur5e | 167/400 (41,75%) | 164/400 (+0,75 pp) |

| Modulo | Media en 1.000 pasos | Minimo | Maximo | Final |
|---|---:|---:|---:|---:|
| vision | 1,000000 | 1,000000 | 1,000000 | 1,000000 |
| llm | 1,000000 | 1,000000 | 1,000000 | 1,000000 |
| expert | 1,000000 | 1,000000 | 1,000000 | 1,000000 |

Condiciones declaradas de la evaluacion: 16 clientes por GPU, errores de *rollout* 0, limpieza de procesos verificada, MuJoCo 3.2.3, protocolo de pantalla apareada por suite y GPU. El autor indica que los flujos estocasticos compartidos del servidor de politica no coinciden episodio a episodio con el ruido de la politica, y que estas pantallas de 400 episodios no establecen una mejora general ni retencion, ni sustituyen a la mejor linea base. No se incluye confirmacion con politicas de mayor tamano.

## Requisitos de hardware

- VRAM estimada: no publicada de forma explicita. Como referencia de orden de magnitud, el repositorio de 13,1 GB y las 43 hojas entrenables en FP32 apuntan a un peso en el rango de ~13 GB en FP32 y de aproximadamente la mitad (~6-7 GB) si el despliegue se hace integramente en BF16, tal y como se documenta para las 74 hojas de despliegue.
- GPU con suficiente memoria para FP32: una tarjeta de 24 GB o mas permite mantener pesos FP32 con margen para activaciones y buffers de simulacion.
- GPU para BF16: 16 GB o mas es un objetivo razonable para el grafo de despliegue en BF16, aunque no se ofrecen cifras verificadas de memoria pico.
- Cabe en GPU de consumo: si, previsiblemente en RTX 3090, RTX 4090 y modelos de 24 GB o superiores para BF16; en FP32 se recomienda 24 GB o mas. No hay mediciones publicadas que lo confirmen.
- Opciones de despliegue: la libreria declarada es openpi; el autor menciona MuJoCo 3.2.3 para simulacion y un servidor de politica con 16 clientes concurrentes por GPU. No se declara soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a una politica de robot.
- Latencia y *throughput*: no disponibles. Los unicos datos operativos son el tamano de lote de entrenamiento B32, el muestreo de 8 ventanas por suite y paso, y la configuracion de inferencia de 16 clientes por GPU.
- Nota de compatibilidad: las 23 hojas de fuente-muneca solo se anaden en inferencia, de modo que cualquier despliegue debe reproducir ese grafo de 74 hojas; un despliegue que cargue unicamente las 51 hojas nativas no coincide con la configuracion evaluada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| π₀.₅ full-probe fixed1:1:1 ur5e (este modelo) | no disponible | ventanas H10 | 167/400 (41,75%) en seed7 | Apache-2.0 | HuggingFace, libreria openpi |
| π₀.₅ base (openpi) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Variante v1 del mismo autor | no disponible | no disponible | view_large 104/400; yaw30 215/400; ur5e 164/400 | no disponible | no disponible |
| Otras politicas vision-lenguaje-accion (OpenVLA, Octo, RDT) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de resultados de benchmarks de estos modelos comparables en la informacion proporcionada, por lo que la comparacion cuantitativa se limita a las tres pantallas v1 frente a v1 *full-probe* que reporta el propio autor.

## Limitaciones y advertencias

- El propio autor advierte de que estas pantallas de 400 episodios no establecen una mejora general, ni retencion, ni sustitucion de la mejor linea base; las diferencias reportadas (+3,25 pp en view_large, -3,50 pp en yaw30, +0,75 pp en ur5e) son mixtas y de magnitud pequena.
- No se incluye confirmacion con politicas de mayor tamano ni una evaluacion ampliada, por lo que la generalizacion de los resultados es desconocida.
- Ausencia de *probe meta holdout*: no hay conjunto de retencion meta, de modo que no puede medirse olvido o degradacion fuera del conjunto de ventanas elegibles.
- El muestreo del optimizador es *suite-balanced* pero no *task-balanced*, lo que puede infrarrepresentar tareas concretas dentro de cada suite.
- Los flujos estocasticos del servidor de politica son compartidos y no coinciden episodio a episodio con el ruido de la politica, lo que limita la comparabilidad exacta entre ejecuciones.
- Las observaciones de la fuente y la retroalimentacion de exito de la politica no se usan; el modelo no debe interpretarse como una politica con aprendizaje por refuerzo.
- El solapamiento de ventanas y linajes entre optimizador y diagnostico esta permitido, por lo que las metricas de diagnostico no son independientes del entrenamiento.
- Aplicabilidad restringida: es una politica para UR5e con Robotiq 85 en el ecosistema LIBERO, no un modelo de proposito general, multilingue ni multimodal de texto.
- Licencia Apache-2.0: permite uso comercial y modificacion con las obligaciones habituales de atribucion y conservacion de avisos; no se declaran restricciones adicionales, pero tampoco se ofrece garantia alguna sobre el comportamiento en hardware real.
- Riesgo de sobreajuste al simulador: la evaluacion se realiza en MuJoCo 3.2.3 y no se aportan pruebas en robot fisico.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, sin senal de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-b200-full-probe-fixed-ur5e-1000-20261013
- Dataset de destino citado en la model card: Donghyun1228/libero-xe-ur5e-dense-contact-probe-20261010 (revision 32649763ecd9c00c263250e86e28e42e3d914021)
- No se han encontrado en la busqueda web enlaces relevantes al modelo: los resultados devueltos corresponden a dominios sin relacion con el proyecto (sitios de contenido para adultos), por lo que se descartan.
- No se dispone de enlace a paper, blog tecnico, repositorio de codigo ni demo asociados en la informacion proporcionada.

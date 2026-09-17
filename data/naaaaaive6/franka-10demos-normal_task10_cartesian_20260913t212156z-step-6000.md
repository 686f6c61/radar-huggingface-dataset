# NaaaaaiVe6/franka-10demos-normal_task10_cartesian_20260913T212156Z-step-6000

## Resumen

Este repositorio contiene un checkpoint de politica robótica (policy) entrenado con la librería openpi, etiquetado como pi05, para un brazo Franka. No es un modelo de lenguaje de propósito general: es un modelo vision-language-action (VLA) que consume observaciones (imágenes y estado del robot) y emite directamente comandos de acción motora. El autor lo publica como un artefacto de entrenamiento concreto: el paso 6000 de un experimento denominado "franka-10demos-normal_task10_cartesian" con marca temporal 2026-09-13.

El checkpoint pesa 3.616.757.520 parámetros (unos 3,62 mil millones) en formato safetensors, con pesos convertidos de JAX a PyTorch en bfloat16. La representación de acción es cartesiana absoluta: XYZ + cuaternión xyzw + pinza binaria (-1/+1). El autor advierte explícitamente de que no son acciones delta de controlador, un detalle crítico para cualquiera que intente integrarlo en un lazo de control real. La salida tiene 50 pasos y 32 coordenadas, de las cuales solo las ocho primeras corresponden a acciones del robot; el resto deben ignorarse.

Su relevancia es acotada pero clara: sirve como referencia reproducible de un pipeline openpi sobre Franka y como base para comparar políticas cartesianas frente a políticas delta. Con 0 descargas y 0 likes, no hay validación comunitaria, ni benchmarks publicados, ni licencia declarada, lo que limita seriamente su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como pi05 dentro de la libreria openpi; conversion de JAX a PyTorch) |
| Parametros totales | 3.616.757.520 (aproximadamente 3,62 mil millones) |
| Longitud de contexto | no disponible (la model card no documenta ventana de contexto; se describe un horizonte de accion de 50 pasos) |
| Tipos de cuantizacion | no disponible (los pesos publicados estan en bfloat16; no se publican variantes GGUF, int8 ni int4) |
| Idiomas soportados | no disponible (no se declara ningun idioma) |
| Licencia | no disponible |
| Formato de pesos | safetensors, bfloat16, conversion desde JAX |
| Dimension de salida de acciones | 50 pasos x 32 coordenadas; solo las 8 primeras son acciones del robot |
| Representacion de accion | cartesiana absoluta: XYZ + cuaternion xyzw + pinza binaria (-1/+1) |
| Entradas adicionales | camaras y estado del robot (segun log.txt); normalizacion en assets/franka/norm_stats.json |
| Tamano del repositorio | 7,2 GB |
| Libreria | openpi |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna mas alla de la etiqueta pi05 y de la libreria openpi. Lo que si se documenta con precision es el contrato de entrada/salida: el modelo emite un tensor de 50 pasos temporales por 32 coordenadas, y solo las ocho primeras coordenadas corresponden a comandos de robot. Esa estructura de "chunking" de acciones (predecir varios pasos de una vez) es caracteristica de las politicas VLA modernas. El checkpoint fue convertido de JAX a PyTorch en bfloat16 manteniendo la configuracion original de entrenamiento para Franka.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o aprendizaje por imitacion (aunque el nombre del experimento, "10demos", sugiere un conjunto reducido de diez demostraciones para la tarea 10). Tampoco se detalla con que datos visuales se entreno ni cuantas camaras se usaron. El autor remite a `log.txt` para el layout de salida, la frontera de normalizacion, las entradas de camara y estado, y las convenciones de controlador que aun requieren confirmacion, lo que indica que el propio autor considera incompleta la verificacion del pipeline.

## Capacidades

- Control robótico por imitacion: genera trayectorias de accion cartesianas para un brazo Franka a partir de observaciones visuales y de estado.
- Prediccion de acciones en bloque: 50 pasos por inferencia, con 8 coordenadas utiles (posicion XYZ, cuaternion xyzw y apertura/cierre de pinza).
- Representacion cartesiana absoluta: las salidas son poses objetivo absolutas, no deltas incrementales de controlador.
- Uso de estadisticas de normalizacion especificas: requiere `assets/franka/norm_stats.json` y las transformaciones de entrenamiento correspondientes.
- Compatibilidad con el ecosistema openpi (JAX/PyTorch) para carga y ejecucion.
- Capacidades de lenguaje general, tool calling, function calling, agentes multi-paso, vision-language de proposito general, audio o modo "thinking": no disponibles / no documentadas.
- Soporte multilingue: no disponible.

## Casos de uso

- Pick-and-place con Franka: el modelo recibe la imagen de la escena y el estado del robot y devuelve una secuencia de poses cartesianas absolutas con apertura de pinza, adecuada para tareas de recogida y colocacion donde el efector debe alcanzar puntos concretos.
- Evaluacion de politicas cartesianas frente a delta: al usar posiciones absolutas en lugar de incrementos de controlador, sirve como punto de comparacion experimental para medir estabilidad y precision respecto a politicas delta en el mismo brazo.
- Reproduccion de experimentos openpi: es un artefacto concreto (paso 6000) que permite reproducir un entrenamiento de la libreria openpi y auditar el pipeline de conversion JAX a PyTorch.
- Base para fine-tuning en tareas nuevas: al estar en safetensors y PyTorch, puede cargarse como inicializacion para reentrenar sobre demostraciones adicionales de otras tareas de manipulacion.
- Generacion de datos sinteticos de trayectorias: las 50 poses por inferencia pueden registrarse como trayectorias candidatas para analisis offline, siempre ignorando las 24 coordenadas no accionables.
- Validacion de integracion hardware/software: util para comprobar que la cadena openpi, la normalizacion de `norm_stats.json` y el controlador del Franka interpretan correctamente poses cartesianas absolutas antes de desplegar cualquier politica.
- Investigacion en chunking de acciones: permite estudiar como de lejos en el futuro conviene predecir acciones (50 pasos) y cuanto de ese bloque es realmente utilizable en lazo cerrado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de exito en tareas, tasas de exito por tarea, ni comparaciones con otras politicas. La busqueda web realizada no devolvio ningun resultado relacionado con este modelo, la libreria openpi ni robots Franka: los enlaces recuperados tratan sobre personalizacion de Windows, ajustes de WhatsApp y Microsoft Copilot, y son irrelevantes para esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion a partir del recuento de parametros, no confirmada por el autor): aproximadamente 7,2 GB solo para pesos en bfloat16, mas activaciones y buffers del encoder visual; en la practica, entre 10 y 16 GB para bfloat16.
- En fp32 los pesos ocuparian unos 14,5 GB; en int8, unos 3,6 GB, pero no se publican pesos cuantizados ni scripts de cuantizacion.
- GPU recomendadas: cualquier GPU con 16 GB o mas de VRAM. Cabe en consumer con RTX 4090 (24 GB), RTX 3090 (24 GB) y RTX 4080 (16 GB, al limite). Para despliegue en servidor, A100, H100 y L40S son opciones sobredimensionadas pero validas.
- Despliegue: el camino soportado es la libreria openpi con PyTorch (los pesos se publicaron especificamente convertidos desde JAX). No hay soporte declarado para vLLM, TGI, llama.cpp, Ollama ni para el formato GGUF, ya que la salida no es texto sino un tensor de acciones con cabeza especifica.
- Latencia y throughput: no disponibles. No se documentan ni la frecuencia de control alcanzada ni el tiempo por inferencia de los 50 pasos.
- Nota de integracion: el repositorio ocupa 7,2 GB, coherente con pesos bfloat16 de 3,62 mil millones de parametros, pero conviene verificar que el `log.txt` del autor se ha leido antes de desplegar, dado que el propio autor marca convenciones de controlador como pendientes de confirmacion.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables en la informacion proporcionada. Como referencia de categoria, este checkpoint pertenece a la familia de politicas VLA de la libreria openpi (etiquetas pi05/openpi), cuya implementacion de referencia es la familia pi0/pi0.5, y compite conceptualmente con otras politicas robóticas abiertas como OpenVLA, GR00T N1 o RDT-1B. No obstante, no se incluyen en la informacion disponible los parametros, contextos, licencias ni resultados de esos modelos, por lo que no se puede construir una tabla comparativa fiable sin inventar datos.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| franka-10demos-normal_task10_cartesian (este) | 3.616.757.520 | no disponible | sin benchmarks publicados | no disponible | safetensors en HuggingFace, 0 descargas |
| pi0 / pi0.5 (referencia openpi) | no disponible en la informacion | no disponible | no disponible | no disponible | no disponible |
| OpenVLA | no disponible en la informacion | no disponible | no disponible | no disponible | no disponible |
| GR00T N1 | no disponible en la informacion | no disponible | no disponible | no disponible | no disponible |
| RDT-1B | no disponible en la informacion | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia ausente: sin licencia declarada no hay autorizacion explicita de uso comercial; en la practica, el uso en produccion queda en un limbo legal.
- Sesgos conocidos: no disponibles. No hay analisis de sesgo ni de cobertura de escenas, iluminacion, objetos o configuraciones de camara.
- Riesgo de alucinacion: en un modelo de accion se traduce en trayectorias fisicamente invalidas, colisiones o comandos fuera de rango; la model card no documenta ningun mecanismo de seguridad, limites articulares ni parada de emergencia.
- Ambiguedad de controlador: el autor advierte de que las salidas son poses cartesianas absolutas y no acciones delta, y que hay convenciones de controlador "que requieren confirmacion". Ejecutar el modelo sin verificar esto puede producir movimientos bruscos o peligrosos.
- Formato de salida no estandar: 50 pasos x 32 coordenadas con solo 8 utiles obliga a un filtrado correcto; un consumidor que use las 32 coordenadas enviara comandos erroneos.
- Dependencia de normalizacion: requiere `assets/franka/norm_stats.json` y las transformaciones de entrenamiento exactas; usar otras estadisticas invalida las predicciones.
- Carencia de validacion externa: 0 descargas, 0 likes y ausencia total de resultados publicados. No hay evidencia de que la politica funcione mas alla del entorno en que se genero.
- Datos de entrenamiento opacos: el nombre sugiere solo 10 demostraciones, lo que implica una generalizacion muy limitada y un alto riesgo de sobreajuste a la tarea 10.
- Idioma y texto: no hay capacidades linguisticas documentadas ni ventana de contexto declarada; no debe tratarse como un LLM.
- Restricciones de hardware y despliegue: no hay soporte para los servidores de inferencia habituales (vLLM, TGI, llama.cpp, Ollama) ni formato GGUF, lo que complica el escalado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NaaaaaiVe6/franka-10demos-normal_task10_cartesian_20260913T212156Z-step-6000
- Log de layout y convenciones (referenciado en la model card, dentro del repositorio): log.txt
- Estadisticas de normalizacion (referenciadas en la model card): assets/franka/norm_stats.json
- Paper, blog, repositorio o demo adicionales: no disponible. La busqueda web no devolvio ningun enlace relacionado con este modelo, la libreria openpi ni robots Franka.

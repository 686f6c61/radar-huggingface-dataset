# NaaaaaiVe6/franka-30demos-normal_task10_cartesian_20260911T023711Z-step-6000

## Resumen

El modelo `NaaaaaiVe6/franka-30demos-normal_task10_cartesian_20260911T023711Z-step-6000` es un checkpoint de política robótica (VLA, vision-language-action) publicado por el usuario NaaaaaiVe6 en HuggingFace. Se trata de un artefacto de entrenamiento concreto, no de un modelo de propósito general: la model card lo describe como un checkpoint del paso 6000 de un entrenamiento sobre el robot Franka, con representación de acciones en coordenadas cartesianas absolutas. Está etiquetado con `openpi`, `robotics`, `pi05` y `safetensors`, lo que lo sitúa en el ecosistema openpi (familia pi0.5) para políticas de manipulación robótica.

El modelo cuenta con 3.616.757.520 parámetros reales (aproximadamente 3,6 mil millones), según los pesos en formato safetensors, y el repositorio ocupa 7,2 GB. La model card indica que fue convertido de JAX a PyTorch en precisión bfloat16 manteniendo la configuración original de entrenamiento para Franka. Su salida tiene 50 pasos temporales y 32 coordenadas, de las cuales solo las ocho primeras corresponden a acciones reales del robot, un detalle crítico para cualquier integración.

La relevancia de esta ficha es acotada: es un experimento de entrenamiento con 30 demostraciones ("30demos" en el identificador) y cero descargas o likes en el momento de la consulta. No hay licencia declarada, ni idiomas soportados, ni benchmarks publicados. Se documenta aquí por rigor, dejando explícito qué datos faltan antes de plantear cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como `pi05` dentro del ecosistema `openpi`; no se detalla la topologia en la model card) |
| Parametros totales | 3.616.757.520 (segun safetensors) |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos publicados estan en bfloat16 segun la model card; no se listan variantes GGUF, int8 ni int4) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (conversion de JAX a PyTorch bfloat16) |
| Biblioteca | openpi |
| Pipeline declarado | robotics |
| Tamano del repositorio | 7,2 GB |
| Salida de acciones | 50 pasos temporales x 32 coordenadas (solo las 8 primeras son acciones del robot) |
| Representacion de acciones | Cartesianas absolutas XYZ + cuaternion xyzw + gripper binario (-1/+1) |
| Normalizacion | requiere `assets/franka/norm_stats.json` incluido en el repo |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-16 (fecha declarada en HuggingFace) |
| Ultima actualizacion | 2026-09-16 (fecha declarada en HuggingFace) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna. El repositorio está etiquetado como `pi05` y usa la librería `openpi`, y el autor indica que el checkpoint se obtuvo convirtiendo los pesos originales de JAX a PyTorch en bfloat16 "con la configuración original del modelo de entrenamiento para Franka". No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO o algún otro proceso de alineamiento. Tampoco se documenta ninguna innovación técnica concreta (decodificación especulativa, atención lineal, etc.).

Lo que sí se detalla es la interfaz de acción y su conversión. La representación es cartesiana absoluta (XYZ + cuaternión xyzw + gripper binario -1/+1), y el autor advierte explícitamente de que **no** son acciones delta de controlador. El tensor de salida tiene 50 pasos y 32 coordenadas, pero solo las ocho primeras corresponden a acciones del robot; el resto no se describe. Para reproducir el comportamiento de entrenamiento hay que usar el fichero de normalización `assets/franka/norm_stats.json` y las transformaciones de entrenamiento correspondientes. El fichero `log.txt` del repositorio contiene, según el autor, el layout de salida, el límite de normalización, las entradas de cámara y estado, y las convenciones de controlador "pendientes de confirmación", lo que sugiere que parte del contrato de entrada/salida no está cerrado.

## Capacidades

- Generacion de acciones de manipulacion robotica: produce trayectorias de 50 pasos con 8 componentes de accion efectivas (posicion cartesiana, orientacion en cuaternion y estado del gripper).
- Control de un robot Franka en espacio cartesiano absoluto, no en deltas de controlador.
- Consumo de entradas de camara y estado del robot, segun lo indicado en `log.txt` (la model card remite a ese fichero para el detalle de los inputs).
- Normalizacion integrada mediante `norm_stats.json`, necesaria para interpretar correctamente las salidas.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni de razonamiento multi-paso en el sentido de los LLM.
- No se declaran capacidades multilingues.
- No se declaran capacidades de vision de proposito general, audio ni modo "thinking"; la unica modalidad documentada es la politica robotica.

## Casos de uso

- Investigacion en aprendizaje por imitacion con pocas demostraciones: el identificador sugiere un entrenamiento con 30 demostraciones sobre la tarea 10 en espacio cartesiano, lo que lo hace util como punto de comparacion en estudios sobre eficiencia de datos en VLA.
- Reproduccion de experimentos en openpi: al estar etiquetado con `openpi` y `pi05`, puede cargarse en ese ecosistema para replicar el pipeline de entrenamiento y evaluar el paso 6000 frente a otros checkpoints de la misma ejecucion.
- Evaluacion de conversion JAX a PyTorch: el checkpoint permite verificar si la conversion a bfloat16 preserva el comportamiento de la politica original, comparando salidas paso a paso con el modelo en JAX.
- Pruebas de integracion de control cartesiano absoluto en Franka: sirve para validar el pipeline de transformacion de acciones (XYZ + cuaternion + gripper) antes de actuar sobre hardware real.
- Desarrollo de envoltorios de inferencia: el recorte de 32 coordenadas a 8 acciones efectivas obliga a implementar una capa de post-procesado, util como banco de pruebas para el codigo de despliegue.
- Docencia y prototipado en robotica: al ser un modelo de 3,6 B de parametros en bfloat16, es viable ejecutarlo en una GPU de gama alta para demostraciones de politicas VLA en laboratorio.
- Auditoria de artefactos sin licencia: sirve como caso de estudio de por que un checkpoint sin licencia explicita ni benchmarks no deberia desplegarse en entornos comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, errores de posicion, ni comparaciones con otros checkpoints, y la busqueda web realizada no devolvio ningun resultado relacionado con este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 7,2 GB solo para los pesos (3.616.757.520 parametros x 2 bytes), mas memoria para activaciones, buffers de imagen y estado.
- VRAM estimada en cuantizacion int8: en torno a 3,6 GB para los pesos; en int4, alrededor de 1,8 GB. Estimaciones derivadas del recuento de parametros, ya que el autor no publica variantes cuantizadas.
- GPU recomendadas: no especificadas por el autor. Por tamano, una RTX 4090 (24 GB) o una A100/H100 son suficientes para inferencia en bfloat16 con margen para activaciones.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas con 12 GB o mas de VRAM para inferencia en bfloat16; en tarjetas de 8 GB haria falta cuantizacion, que no esta publicada.
- Opciones de despliegue: la libreria declarada es `openpi`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y estos motores no estan pensados para politicas de accion con entradas de camara y estado.
- Latencia y throughput: no disponibles. En robotica la metrica relevante es la frecuencia de control alcanzable, y no se publica ninguna cifra.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye especificaciones, parametros, contexto ni rendimiento de otros modelos de la misma categoria (politicas VLA para manipulacion robotica), y no se han encontrado datos comparativos en la busqueda web. Cualquier tabla comparativa con alternativas como otras variantes de openpi, OpenVLA u otros VLA exigiria consultar sus fichas oficiales, que no forman parte de esta busqueda.

## Limitaciones y advertencias

- Ausencia total de licencia: no se indica licencia alguna, lo que impide determinar si el uso comercial esta permitido. En la practica, debe tratarse como no apto para produccion hasta que el autor la declare.
- Cero traccion verificable: 0 descargas y 0 likes; no hay evidencia de que el checkpoint haya sido validado por terceros.
- Sin benchmarks ni tasas de exito: no hay ninguna metrica que permita juzgar si la politica funciona, ni siquiera en la tarea para la que fue entrenada.
- Entrenamiento con 30 demostraciones: segun el propio identificador del modelo, el volumen de datos es muy reducido, lo que aumenta el riesgo de sobreajuste a las condiciones exactas de recogida (posiciones, iluminacion, objetos).
- Contrato de entrada/salida incompleto: el autor remite a `log.txt` y advierte de "convenciones de controlador que requieren confirmacion", lo que indica que parte de la interfaz no esta cerrada.
- Salida sobredimensionada: de 32 coordenadas solo 8 son acciones del robot; ignorar este recorte produce comandos incorrectos.
- Representacion cartesiana absoluta: no son deltas de controlador. Mezclarla con un controlador que espere incrementos puede provocar movimientos bruscos o inseguros.
- Dependencia de normalizacion: omitir `assets/franka/norm_stats.json` o usar transformaciones distintas a las de entrenamiento invalida las salidas.
- Riesgo de alucinacion de acciones: como cualquier politica aprendida, puede generar trayectorias plausibles pero fisicamente inviables. Cualquier prueba en hardware real requiere limites de seguridad y parada de emergencia.
- Idiomas y contexto: no se declara ningun idioma soportado ni longitud de contexto, por lo que no puede evaluarse su comportamiento con instrucciones en lenguaje natural mas alla de lo que permita el pipeline de openpi.
- Fechas incoherentes: las marcas temporales del repositorio (creacion y actualizacion en septiembre de 2026) son posteriores a la fecha habitual de consulta; conviene verificar la integridad del artefacto antes de confiar en el.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/NaaaaaiVe6/franka-30demos-normal_task10_cartesian_20260911T023711Z-step-6000
- Fichero de log citado en la model card: https://huggingface.co/NaaaaaiVe6/franka-30demos-normal_task10_cartesian_20260911T023711Z-step-6000/blob/main/log.txt
- Fichero de normalizacion citado: `assets/franka/norm_stats.json` dentro del repositorio de HuggingFace
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada.

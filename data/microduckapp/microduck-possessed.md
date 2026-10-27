# microduckapp/microduck-possessed

## Resumen

*microduck-possessed* ("Possessed") es una política de control robótico en formato ONNX desarrollada por microduckapp para el robot Microduck. No se trata de un modelo de lenguaje, sino de un movimiento coreografiado de 10,8 segundos en el que el cuerpo del robot gira lentamente mientras la cabeza permanece fija hacia el observador, para después volver de golpe a su posición original.

Técnicamente, la política recibe un vector de 61 observaciones y genera 14 objetivos articulares a una frecuencia de 50 Hz, un bucle de control en tiempo real típico de robots articulados pequeños. Se distribuye junto a un `manifest.json` que la app MicroDuck emplea para instalar y reproducir el movimiento, además de un vídeo de vista previa.

Su relevancia es de nicho: forma parte del ecosistema de movimientos etiquetados como *microduck-move* en Hugging Face, un catálogo de políticas descargables para este robot de entretenimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de control robótico en ONNX (61 observaciones de entrada, 14 objetivos articulares de salida) |
| Parámetros totales | no disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (política de robótica, no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | No aplica (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) |
| Frecuencia de control | 50 Hz |
| Duración del movimiento | 10,8 segundos |
| Ficheros incluidos | `policy.onnx`, `manifest.json`, `media/preview.mp4` |
| Tamaño del repositorio | 0,0 GB (según Hugging Face) |
| Pipeline | robotics |
| Descargas / Likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es una política de control en formato ONNX, el estándar de inferencia portátil de Microsoft, lo que permite ejecutarla en runtimes compatibles sin depender del framework de entrenamiento original. La interfaz documentada indica 61 observaciones de entrada (típicamente, en políticas de este tipo, estados articulares, velocidades y lecturas de sensores como el IMU, aunque la composición exacta no está detallada en la model card) y 14 salidas correspondientes a los objetivos de posición de las articulaciones del robot, lo que sugiere 14 grados de libertad actuados. El bucle de control opera a 50 Hz, es decir, un paso de inferencia cada 20 ms.

No se ha publicado información sobre el método de entrenamiento (aprendizaje por refuerzo, imitación u otro), ni sobre los datos empleados, ni sobre la estructura interna de la red (capas, tipo de arquitectura, tamaño en parámetros). Tampoco aplica el concepto de RLHF/DPO al no ser un modelo generativo de lenguaje.

## Capacidades

- Ejecución del movimiento "Possessed": giro lento del cuerpo con la cabeza bloqueada hacia el observador y retorno brusco a la posición original, con una duración total de 10,8 segundos.
- Inferencia en tiempo real a 50 Hz con salidas de 14 objetivos articulares.
- Entrada estandarizada de 61 observaciones, compatible con el sistema sensorial del robot Microduck.
- Instalación y reproducción gestionadas por la app MicroDuck mediante el fichero `manifest.json`.
- Portabilidad del formato ONNX a cualquier runtime compatible.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni function calling, no tiene capacidades de razonamiento multi-paso, ni procesa visión, audio o idiomas.

## Casos de uso

- Entretenimiento temático de terror o Halloween: el movimiento está diseñado expresamente para producir un efecto inquietante ("poseído"), ideal para reproducirlo en fechas señaladas o en decoración interactiva con el robot.
- Demostraciones en tiendas y eventos: el gesto de la cabeza que sigue al observador mientras el cuerpo gira es un gancho visual efectivo para vitrinas, stands o puntos de venta del producto.
- Creación de contenido para redes sociales: los 10,8 segundos de duración y el efecto sorpresa del "snap back" encajan en vídeos cortos para TikTok, Instagram Reels o YouTube Shorts.
- Educación en robótica: al documentar entradas (61 observaciones), salidas (14 articulaciones) y frecuencia (50 Hz), sirve como ejemplo real y compacto de política de control desplegada en ONNX para explicar bucles de control en tiempo real.
- Desarrollo de movimientos propios: los desarrolladores del ecosistema Microduck pueden usar la estructura de este fichero (`policy.onnx` + `manifest.json`) como plantilla para crear y distribuir sus propios movimientos etiquetados como *microduck-move*.
- Coreografías y secuencias: integración del movimiento en rutinas más largas combinando varias políticas del catálogo a través de la app MicroDuck.
- Validación de hardware: útil como prueba funcional del rango de giro del cuerpo y de la cabeza, y de la respuesta de los 14 actuadores del robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Como referencia operativa, los únicos datos de rendimiento documentados son la frecuencia de control de 50 Hz (20 ms por paso de inferencia) y la duración del movimiento de 10,8 segundos. Al no ser un modelo de lenguaje, métricas como MMLU, HumanEval o GSM8K no aplican.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio (0,0 GB) indica un fichero muy pequeño, propio de políticas que se ejecutan en CPU o en hardware embebido, no en GPU.
- GPU recomendadas: no aplica. El modelo está diseñado para ejecutarse sobre el hardware del propio robot Microduck.
- Consumer GPU: no aplica; no se requiere aceleración gráfica para un modelo de estas dimensiones.
- Opciones de despliegue: ONNX Runtime en cualquier plataforma compatible; la instalación y reproducción se gestionan a través de la app MicroDuck mediante el `manifest.json`. Los stacks habituales de servido de LLM (vLLM, llama.cpp, TGI, Ollama) no aplican a este tipo de modelo.
- Latencia y throughput: no disponible de forma explícita; el bucle de control especificado implica un paso de inferencia cada 20 ms (50 Hz).

## Comparativa con modelos similares

no disponible. La etiqueta *microduck-move* sugiere que existen otros movimientos de la misma familia en Hugging Face, pero la búsqueda realizada no ha devuelto modelos concretos comparables con datos de parámetros, rendimiento o licencia.

## Limitaciones y advertencias

- Licencia no especificada: existe incertidumbre legal sobre la redistribución, la modificación o el uso comercial del modelo hasta que el autor la publique.
- Documentación mínima: la model card no detalla la arquitectura interna de la red, el método de entrenamiento, los datos utilizados ni consideraciones de seguridad.
- Sin validación comunitaria: el modelo registra 0 descargas y 0 likes, por lo que no hay retroalimentación de usuarios sobre su funcionamiento.
- Compatibilidad restringida: la política está ligada al hardware del robot Microduck (61 observaciones y 14 articulaciones concretas); no es portable a otros robots sin adaptación.
- Riesgos físicos en lugar de riesgos lingüísticos: al no ser un modelo de lenguaje, los conceptos de alucinación o sesgo textual no aplican; el riesgo relevante es el movimiento brusco de retorno ("snap back"), por lo que se recomienda supervisión y distancia prudente durante la reproducción.
- Modelo muy reciente (creado el 27 de octubre de 2026): posible falta de madurez y de versiones estables.
- Verificar el tamaño real de los ficheros antes de descargar: el repositorio figura con 0,0 GB, lo que puede indicar un índice no sincronizado o ficheros muy pequeños.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/microduckapp/microduck-possessed
- Listado de modelos de Hugging Face donde aparece: https://huggingface.co/models?sort=created
- No se han encontrado enlaces adicionales relevantes (paper, blog, repositorio de código o demo) en la búsqueda realizada.
